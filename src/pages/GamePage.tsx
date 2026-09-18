import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, StopCircle, AlertCircle, ArrowLeft, Play } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { PLAYERS } from '../data/constants';
import { GameHeader } from '../components/GameHeader';
import { PlayerCard } from '../components/PlayerCard';
import { QuestionCard } from '../components/QuestionCard';
import { AnswerOption } from '../components/AnswerOption';
import { QuestionTimer } from '../components/QuestionTimer';
import { PlayerIndicator } from '../components/PlayerIndicator';
import { GameProgress } from '../components/GameProgress';
import { GameStatus } from '../components/GameStatus';
import { AnswerResult } from '../components/AnswerResult';
import { GameOver } from '../components/GameOver';

export const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    state,
    perguntaAtualObj,
    selecionarResposta,
    proximaPergunta,
    reiniciarPartida,
    pararPartida,
    simularBotaoHardware,
    iniciarJogo,
    gerarPerguntas,
  } = useGame();

  // Estados de confirmação para parar ou reiniciar no meio da partida
  const [showStopModal, setShowStopModal] = useState(false);
  const [showRestartModal, setShowRestartModal] = useState(false);

  // Se o jogador entrar direto em /jogo sem perguntas geradas, gera e inicia
  useEffect(() => {
    if (!state.perguntas || state.perguntas.length === 0) {
      gerarPerguntas().then(() => {
        iniciarJogo();
      });
    } else if (state.estado === 'IDLE' || state.estado === 'READY') {
      iniciarJogo();
    }
  }, [state.perguntas, state.estado, gerarPerguntas, iniciarJogo]);

  const isAnswering = state.estado === 'ANSWERING';
  const isWaitingButton = state.estado === 'WAITING_BUTTON';
  const isResultState =
    state.estado === 'CORRECT' ||
    state.estado === 'INCORRECT' ||
    state.estado === 'TIMEOUT';
  const isFinished = state.estado === 'FINISHED' || state.partidaFinalizada;

  // Confirmar parada do jogo e voltar para a tela inicial
  const handleConfirmStop = () => {
    pararPartida();
    setShowStopModal(false);
    navigate('/');
  };

  // Confirmar reinício do jogo (reseta placar e volta para a primeira pergunta)
  const handleConfirmRestart = () => {
    setShowRestartModal(false);
    iniciarJogo();
  };

  // Se a partida estiver finalizada, exibe a tela de resultado final (GameOver)
  if (isFinished) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50 via-sky-50 to-purple-50">
        <GameHeader />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <GameOver
            score={state.pontuacao}
            totalQuestions={state.perguntas.length}
            onPlayAgain={() => reiniciarPartida()}
            onGoHome={() => navigate('/')}
            onGoSettings={() => navigate('/configuracoes')}
          />
        </main>
      </div>
    );
  }

  // Carregamento de segurança se as perguntas ainda estiverem sendo buscadas
  if (!perguntaAtualObj) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50 via-indigo-50 to-pink-50">
        <GameHeader />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center animate-spin mb-4">
            <RotateCcw className="w-6 h-6" />
          </div>
          <h2 className="font-fun font-bold text-xl text-slate-800">
            Carregando perguntas da partida...
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Preparando perguntas inéditas e configurando os botões.
          </p>
        </main>
      </div>
    );
  }

  const isLastQuestion = state.perguntaAtual === (state.perguntas.length - 1);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50/70 via-indigo-50/40 to-pink-50/40 pb-16 relative">
      <GameHeader />

      <main className="flex-1 max-w-5xl mx-auto w-full p-3 sm:p-6 flex flex-col gap-4">
        {/* Barra Superior: Progresso das 10 Perguntas + Ações de Parar e Reiniciar */}
        <div className="flex items-center justify-between gap-3 flex-wrap bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <GameProgress
            currentQuestionIndex={state.perguntaAtual}
            totalQuestions={state.perguntas.length || 10}
            history={state.historicoRespostas}
          />

          <div className="flex items-center gap-2">
            <div className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 hidden sm:block">
              Tema: <strong className="text-indigo-600">{perguntaAtualObj.tema}</strong>
            </div>

            {/* Botão para Reiniciar o Jogo */}
            <button
              type="button"
              onClick={() => setShowRestartModal(true)}
              title="Reiniciar jogo do início"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reiniciar</span>
            </button>

            {/* Botão para Parar na Metade */}
            <button
              type="button"
              onClick={() => setShowStopModal(true)}
              title="Parar jogo agora e voltar ao menu"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
            >
              <StopCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>Parar Jogo</span>
            </button>
          </div>
        </div>

        {/* Cartões dos Dois Jogadores (👧 Jogador 1 e 👦 Jogador 2) */}
        <section
          aria-label="Placar dos Jogadores"
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
        >
          <PlayerCard
            player={PLAYERS.jogador1}
            score={state.pontuacao.jogador1}
            isBuzzed={state.jogadorQueApertou === 'jogador1'}
            isOtherBuzzed={state.jogadorQueApertou === 'jogador2'}
            isWaitingButton={isWaitingButton}
            onSimulateClick={() => simularBotaoHardware('jogador1')}
          />

          <PlayerCard
            player={PLAYERS.jogador2}
            score={state.pontuacao.jogador2}
            isBuzzed={state.jogadorQueApertou === 'jogador2'}
            isOtherBuzzed={state.jogadorQueApertou === 'jogador1'}
            isWaitingButton={isWaitingButton}
            onSimulateClick={() => simularBotaoHardware('jogador2')}
          />
        </section>

        {/* Alerta de quem apertou primeiro */}
        <AnimatePresence>
          {state.jogadorQueApertou && (isAnswering || isResultState) && (
            <PlayerIndicator player={state.jogadorQueApertou} />
          )}
        </AnimatePresence>

        {/* Cronômetro e Status quando em resposta */}
        {isAnswering && (
          <div className="flex flex-col items-center justify-center my-1">
            <QuestionTimer
              seconds={state.tempoRestante}
              totalSeconds={30}
              isActive={isAnswering}
            />
          </div>
        )}

        {/* Status / Instrução para as Crianças e o Mediador */}
        <GameStatus
          estado={state.estado}
          jogadorQueApertou={state.jogadorQueApertou}
        />

        {/* Modal / Banner de Resultado (Acerto / Erro / Tempo Esgotado) */}
        <AnimatePresence>
          {isResultState && (
            <AnswerResult
              estado={state.estado}
              jogador={state.jogadorQueApertou}
              pergunta={perguntaAtualObj}
              onNextQuestion={proximaPergunta}
              isLastQuestion={isLastQuestion}
            />
          )}
        </AnimatePresence>

        {/* Cartão da Pergunta Atual */}
        <QuestionCard
          question={perguntaAtualObj}
          questionNumber={state.perguntaAtual + 1}
          totalQuestions={state.perguntas.length || 10}
        />

        {/* Alternativas A, B, C, D (Clicáveis pelo Mediador) */}
        <section aria-label="Alternativas de Resposta" className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1 uppercase tracking-wider">
            <span>Alternativas</span>
            {isWaitingButton && (
              <span className="text-amber-600 bg-amber-100 px-2.5 py-0.5 rounded-full">
                Aguardando Jogador
              </span>
            )}
            {isAnswering && (
              <span className="text-indigo-600 bg-indigo-100 px-2.5 py-0.5 rounded-full animate-pulse">
                Mediador: Clique na resposta escolhida pelo jogador
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {perguntaAtualObj.alternativas.map((alt) => (
              <AnswerOption
                key={alt.id}
                alternative={alt}
                isCorrectAnswer={alt.id === perguntaAtualObj.respostaCorreta}
                isSelected={alt.id === state.respostaSelecionada}
                isRevealed={isResultState}
                isDisabled={!isAnswering}
                onClick={() => selecionarResposta(alt.id)}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Modal de Confirmação: PARAR NA METADE */}
      <AnimatePresence>
        {showStopModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full border-2 border-slate-200 shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <StopCircle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-fun font-bold text-xl text-slate-900">
                  Deseja parar a partida?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  A rodada atual será interrompida e você retornará ao menu inicial.
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStopModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Continuar Jogando
                </button>
                <button
                  type="button"
                  onClick={handleConfirmStop}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  Sim, Parar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmação: REINICIAR O JOGO */}
      <AnimatePresence>
        {showRestartModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full border-2 border-slate-200 shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                <RotateCcw className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-fun font-bold text-xl text-slate-900">
                  Reiniciar a partida?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  O placar dos jogadores será zerado e o jogo recomeçará da primeira pergunta deste lote.
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRestartModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRestart}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  Sim, Reiniciar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
