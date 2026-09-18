export type Difficulty = 'facil' | 'medio' | 'dificil';

export type QuestionCount = 4 | 8 | 12;

export type PlayerId = 'jogador1' | 'jogador2';

export type GameStateEnum =
  | 'IDLE'
  | 'GENERATING'
  | 'READY'
  | 'WAITING_BUTTON'
  | 'PLAYER_SELECTED'
  | 'ANSWERING'
  | 'CORRECT'
  | 'INCORRECT'
  | 'TIMEOUT'
  | 'NEXT_QUESTION'
  | 'FINISHED';

export interface Alternative {
  id: 'A' | 'B' | 'C' | 'D';
  texto: string;
}

export interface Question {
  id: number;
  pergunta: string;
  alternativas: Alternative[];
  respostaCorreta: 'A' | 'B' | 'C' | 'D';
  dificuldade: Difficulty;
  tema: string;
  emoji?: string;
  curiosidade?: string;
}

export interface Player {
  id: PlayerId;
  nome: string;
  cor: string;
  bgGradiente: string;
  bordaCor: string;
  avatar: string;
  tecla: string;
  botaoLabel: string;
}

export interface GameConfig {
  tema: string;
  temaPersonalizado: string;
  contexto: string;
  dificuldade: Difficulty;
  quantidade: QuestionCount;
}

export interface MatchScore {
  jogador1: number;
  jogador2: number;
}

export interface AnswerRecord {
  perguntaId: number;
  pergunta: string;
  jogador: PlayerId | null;
  respostaEscolhida: 'A' | 'B' | 'C' | 'D' | null;
  respostaCorreta: 'A' | 'B' | 'C' | 'D';
  correto: boolean;
  tempoRestante: number;
}

export interface GameState {
  perguntas: Question[];
  perguntaAtual: number;
  jogadorQueApertou: PlayerId | null;
  pontuacao: MatchScore;
  tempoRestante: number;
  estado: GameStateEnum;
  respostaSelecionada: 'A' | 'B' | 'C' | 'D' | null;
  partidaFinalizada: boolean;
  historicoRespostas: AnswerRecord[];
  generationSource?: 'groq' | 'gemini' | 'smart_offline';
  generationNotice?: string;
}

export type ButtonPressCallback = (player: PlayerId) => void;

export interface HardwareStatus {
  connected: boolean;
  mode: 'mock' | 'modbus' | 'webserial';
  name: string;
  lastPressedPlayer: PlayerId | null;
  lastPressedTimestamp: number | null;
}
