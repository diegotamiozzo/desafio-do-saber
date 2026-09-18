import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import {
  GameConfig,
  GameState,
  GameStateEnum,
  HardwareStatus,
  PlayerId,
  Question,
  AnswerRecord,
} from '../types';
import { DEFAULT_CONFIG } from '../data/constants';
import { questionService } from '../services/questionService';
import { hardwareService } from '../services/hardwareService';
import { storageService } from '../services/storageService';
import { soundEffects } from '../utils/audio';

interface GameContextType {
  config: GameConfig;
  updateConfig: (newConfig: Partial<GameConfig>) => void;
  resetConfig: () => void;
  state: GameState;
  perguntaAtualObj: Question | null;
  hardwareStatus: HardwareStatus;
  soundEnabled: boolean;
  toggleSound: () => void;
  gerarPerguntas: (customConfig?: GameConfig) => Promise<Question[]>;
  iniciarJogo: () => void;
  pararPartida: () => void;
  tratarBotaoPressionado: (jogador: PlayerId) => void;
  selecionarResposta: (alternativa: 'A' | 'B' | 'C' | 'D') => void;
  proximaPergunta: () => void;
  reiniciarPartida: () => void;
  simularBotaoHardware: (jogador: PlayerId) => void;
  conectarHardware: () => Promise<boolean>;
  desconectarHardware: () => Promise<void>;
  showDevPanel: boolean;
  setShowDevPanel: (show: boolean) => void;
}

const initialGameState: GameState = {
  perguntas: [],
  perguntaAtual: 0,
  jogadorQueApertou: null,
  pontuacao: {
    jogador1: 0,
    jogador2: 0,
  },
  tempoRestante: 30,
  estado: 'IDLE',
  respostaSelecionada: null,
  partidaFinalizada: false,
  historicoRespostas: [],
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<GameConfig>(() => storageService.getConfig());
  const [state, setState] = useState<GameState>(initialGameState);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => storageService.getSoundEnabled());
  const [hardwareStatus, setHardwareStatus] = useState<HardwareStatus>(() => hardwareService.getStatus());
  const [showDevPanel, setShowDevPanel] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sincroniza som
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      storageService.saveSoundEnabled(next);
      soundEffects.setEnabled(next);
      return next;
    });
  }, []);

  useEffect(() => {
    soundEffects.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Atualização de configurações
  const updateConfig = useCallback((newConfig: Partial<GameConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      storageService.saveConfig(updated);
      return updated;
    });
  }, []);

  // Limpar configurações para o padrão inicial
  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    storageService.saveConfig(DEFAULT_CONFIG);
  }, []);

  // Monitora status de hardware
  useEffect(() => {
    const unsub = hardwareService.subscribeStatus((status) => {
      setHardwareStatus(status);
    });
    return unsub;
  }, []);

  // Trata botão físico ou simulado
  const tratarBotaoPressionado = useCallback((jogador: PlayerId) => {
    setState((curr) => {
      // O botão só tem efeito se estiver aguardando o clique do primeiro jogador
      if (curr.estado !== 'WAITING_BUTTON') {
        return curr;
      }

      soundEffects.playBuzzer(jogador);

      return {
        ...curr,
        jogadorQueApertou: jogador,
        estado: 'ANSWERING',
        tempoRestante: 30,
      };
    });
  }, []);

  // Conecta hardwareService à lógica do jogo
  useEffect(() => {
    const unsub = hardwareService.onButtonPress((player) => {
      tratarBotaoPressionado(player);
    });
    return unsub;
  }, [tratarBotaoPressionado]);

  // Cronômetro regressivo de 30 segundos
  useEffect(() => {
    if (state.estado === 'ANSWERING' && state.tempoRestante > 0) {
      timerRef.current = setInterval(() => {
        setState((curr) => {
          if (curr.estado !== 'ANSWERING') {
            if (timerRef.current) clearInterval(timerRef.current);
            return curr;
          }

          const novoTempo = curr.tempoRestante - 1;

          if (novoTempo <= 4 && novoTempo > 0) {
            soundEffects.playTick();
          }

          if (novoTempo <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            soundEffects.playAlmost();

            const perguntaAtualObj = curr.perguntas[curr.perguntaAtual];
            const novoHistorico: AnswerRecord = {
              perguntaId: perguntaAtualObj?.id || curr.perguntaAtual,
              pergunta: perguntaAtualObj?.pergunta || '',
              jogador: curr.jogadorQueApertou,
              respostaEscolhida: null,
              respostaCorreta: perguntaAtualObj?.respostaCorreta || 'A',
              correto: false,
              tempoRestante: 0,
            };

            return {
              ...curr,
              tempoRestante: 0,
              estado: 'TIMEOUT',
              historicoRespostas: [...curr.historicoRespostas, novoHistorico],
            };
          }

          return {
            ...curr,
            tempoRestante: novoTempo,
          };
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.estado, state.tempoRestante]);

  // Gerar perguntas
  const gerarPerguntas = useCallback(async (customConfig?: GameConfig): Promise<Question[]> => {
    const activeConfig = customConfig || config;
    setState((curr) => ({ ...curr, estado: 'GENERATING' }));

    try {
      const questions = await questionService.generateQuestions(activeConfig);
      setState((curr) => ({
        ...curr,
        perguntas: questions,
        perguntaAtual: 0,
        jogadorQueApertou: null,
        respostaSelecionada: null,
        partidaFinalizada: false,
        generationSource: questionService.lastGenerationSource,
        generationNotice: questionService.lastNotice,
        estado: 'READY',
      }));
      return questions;
    } catch (err) {
      console.error('Erro ao gerar perguntas:', err);
      setState((curr) => ({ ...curr, estado: 'IDLE' }));
      throw err;
    }
  }, [config]);

  // Iniciar jogo após revisão ou da tela inicial
  const iniciarJogo = useCallback(() => {
    setState((curr) => {
      // Se não houver perguntas, não inicia
      if (!curr.perguntas || curr.perguntas.length === 0) {
        return curr;
      }

      return {
        ...curr,
        perguntaAtual: 0,
        jogadorQueApertou: null,
        respostaSelecionada: null,
        pontuacao: { jogador1: 0, jogador2: 0 },
        tempoRestante: 30,
        estado: 'WAITING_BUTTON',
        partidaFinalizada: false,
        historicoRespostas: [],
      };
    });
  }, []);

  // Parar a partida no meio e resetar o jogo para estado inicial
  const pararPartida = useCallback(() => {
    setState((curr) => ({
      ...curr,
      perguntaAtual: 0,
      jogadorQueApertou: null,
      respostaSelecionada: null,
      pontuacao: { jogador1: 0, jogador2: 0 },
      tempoRestante: 30,
      estado: 'IDLE',
      partidaFinalizada: false,
      historicoRespostas: [],
    }));
  }, []);

  // Mediador clica na alternativa dita verbalmente pela criança
  const selecionarResposta = useCallback((alternativa: 'A' | 'B' | 'C' | 'D') => {
    setState((curr) => {
      // Só aceita clique se estiver no estado de resposta
      if (curr.estado !== 'ANSWERING') return curr;

      const perguntaAtualObj = curr.perguntas[curr.perguntaAtual];
      if (!perguntaAtualObj) return curr;

      const acertou = alternativa === perguntaAtualObj.respostaCorreta;
      const jogador = curr.jogadorQueApertou;

      if (acertou) {
        soundEffects.playCorrect();
      } else {
        soundEffects.playAlmost();
      }

      const novaPontuacao = { ...curr.pontuacao };
      if (acertou && jogador) {
        novaPontuacao[jogador] += 1;
      }

      const novoHistorico: AnswerRecord = {
        perguntaId: perguntaAtualObj.id,
        pergunta: perguntaAtualObj.pergunta,
        jogador: curr.jogadorQueApertou,
        respostaEscolhida: alternativa,
        respostaCorreta: perguntaAtualObj.respostaCorreta,
        correto: acertou,
        tempoRestante: curr.tempoRestante,
      };

      return {
        ...curr,
        respostaSelecionada: alternativa,
        pontuacao: novaPontuacao,
        estado: acertou ? 'CORRECT' : 'INCORRECT',
        historicoRespostas: [...curr.historicoRespostas, novoHistorico],
      };
    });
  }, []);

  // Próxima pergunta
  const proximaPergunta = useCallback(() => {
    setState((curr) => {
      const proximoIndice = curr.perguntaAtual + 1;

      // Finaliza quando todas as perguntas do lote escolhido forem respondidas.
      if (proximoIndice >= curr.perguntas.length) {
        soundEffects.playVictory();

        const vencedor =
          curr.pontuacao.jogador1 > curr.pontuacao.jogador2
            ? 'jogador1'
            : curr.pontuacao.jogador2 > curr.pontuacao.jogador1
            ? 'jogador2'
            : 'empate';

        storageService.saveGameResult({
          tema: config.tema === 'Personalizado' ? config.temaPersonalizado || 'Personalizado' : config.tema,
          dificuldade: config.dificuldade,
          placar: curr.pontuacao,
          vencedor,
        });

        return {
          ...curr,
          partidaFinalizada: true,
          estado: 'FINISHED',
        };
      }

      return {
        ...curr,
        perguntaAtual: proximoIndice,
        jogadorQueApertou: null,
        respostaSelecionada: null,
        tempoRestante: 30,
        estado: 'WAITING_BUTTON',
      };
    });
  }, [config]);

  // Reiniciar partida com as mesmas perguntas ou gerar novo lote
  const reiniciarPartida = useCallback(async () => {
    await gerarPerguntas(config);
    iniciarJogo();
  }, [config, gerarPerguntas, iniciarJogo]);

  const simularBotaoHardware = useCallback((jogador: PlayerId) => {
    hardwareService.simulatePress(jogador);
  }, []);

  const conectarHardware = useCallback(() => hardwareService.connect(), []);

  const desconectarHardware = useCallback(() => hardwareService.disconnect(), []);

  const perguntaAtualObj = state.perguntas[state.perguntaAtual] || null;

  return (
    <GameContext.Provider
      value={{
        config,
        updateConfig,
        resetConfig,
        state,
        perguntaAtualObj,
        hardwareStatus,
        soundEnabled,
        toggleSound,
        gerarPerguntas,
        iniciarJogo,
        pararPartida,
        tratarBotaoPressionado,
        selecionarResposta,
        proximaPergunta,
        reiniciarPartida,
        simularBotaoHardware,
        conectarHardware,
        desconectarHardware,
        showDevPanel,
        setShowDevPanel,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame deve ser utilizado dentro de um GameProvider');
  }
  return context;
};
