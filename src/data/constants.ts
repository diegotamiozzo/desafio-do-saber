import { Player, GameConfig, QuestionCount } from '../types';

export const PLAYERS: Record<'jogador1' | 'jogador2', Player> = {
  jogador1: {
    id: 'jogador1',
    nome: 'Jogador 1 (Azul)',
    cor: 'text-blue-600',
    bgGradiente: 'from-blue-500 to-indigo-600',
    bordaCor: 'border-blue-400',
    avatar: '1',
    tecla: '1',
    botaoLabel: 'Botão 1 (Azul)',
  },
  jogador2: {
    id: 'jogador2',
    nome: 'Jogador 2 (Amarelo)',
    cor: 'text-amber-600',
    bgGradiente: 'from-amber-400 to-yellow-500',
    bordaCor: 'border-amber-400',
    avatar: '2',
    tecla: '2',
    botaoLabel: 'Botão 2 (Amarelo)',
  },
};

export interface ThemeOption {
  id: string;
  nome: string;
  descricao: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'Conhecimentos Gerais', nome: 'Conhecimentos Gerais', descricao: 'Cultura, descobertas e dia a dia' },
  { id: 'Animais', nome: 'Animais', descricao: 'Mundo animal e habitats' },
  { id: 'Natureza', nome: 'Natureza', descricao: 'Plantas, florestas e clima' },
  { id: 'Ciências', nome: 'Ciências', descricao: 'Planetas, espaço e física prática' },
  { id: 'Matemática', nome: 'Matemática', descricao: 'Continhas, formas e raciocínio' },
  { id: 'História', nome: 'História', descricao: 'Grandes fatos e civilizações' },
  { id: 'Geografia', nome: 'Geografia', descricao: 'Cidades, rios e mapas' },
  { id: 'Tecnologia', nome: 'Tecnologia', descricao: 'Invenções, robótica e futuro' },
  { id: 'Esportes', nome: 'Esportes', descricao: 'Modalidades e brincadeiras' },
  { id: 'Meio Ambiente', nome: 'Meio Ambiente', descricao: 'Sustentabilidade e ecologia' },
  { id: 'Curiosidades', nome: 'Curiosidades', descricao: 'Fatos surpreendentes do mundo' },
  { id: 'Personalizado', nome: 'Personalizado', descricao: 'Defina seu próprio tema livre' },
];

export const DIFFICULTY_OPTIONS = [
  { id: 'facil', nome: 'Fácil', descricao: 'Perguntas diretas e simples para os menores' },
  { id: 'medio', nome: 'Médio', descricao: 'Desafios moderados para pensar um pouco' },
  { id: 'dificil', nome: 'Difícil', descricao: 'Para quem adora perguntas mais aprofundadas' },
] as const;

export const QUESTION_COUNT_OPTIONS: Array<{
  id: QuestionCount;
  nome: string;
  descricao: string;
}> = [
  { id: 4, nome: 'Curta', descricao: '4 perguntas para uma rodada rápida' },
  { id: 8, nome: 'Média', descricao: '8 perguntas para uma partida equilibrada' },
  { id: 12, nome: 'Longa', descricao: '12 perguntas para um desafio completo' },
];

export const DEFAULT_CONFIG: GameConfig = {
  tema: 'Animais',
  temaPersonalizado: '',
  contexto: '',
  dificuldade: 'facil',
  quantidade: 8,
};
