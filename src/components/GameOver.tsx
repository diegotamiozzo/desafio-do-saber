import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Settings, Home } from 'lucide-react';
import { MatchScore } from '../types';
import { PLAYERS } from '../data/constants';

interface GameOverProps {
  score: MatchScore;
  onPlayAgain: () => void;
  onGoHome: () => void;
  onGoSettings: () => void;
  totalQuestions?: number;
}

export const GameOver: React.FC<GameOverProps> = ({
  score,
  onPlayAgain,
  onGoHome,
  onGoSettings,
  totalQuestions = 8,
}) => {
  const p1 = PLAYERS.jogador1;
  const p2 = PLAYERS.jogador2;

  const isEmpate = score.jogador1 === score.jogador2;
  const vencedor =
    score.jogador1 > score.jogador2
      ? p1
      : score.jogador2 > score.jogador1
      ? p2
      : null;

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch {
      // safe fallback
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl text-center relative overflow-hidden"
    >
      <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
        <Trophy className="w-8 h-8" />
      </div>

      <h1 className="font-fun font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
        Fim da Partida!
      </h1>
      <p className="text-slate-500 font-semibold text-sm sm:text-base mt-1">
        Resultado final das {totalQuestions} perguntas
      </p>

      {/* Cartões com Placar dos 2 participantes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        {/* Jogador 1 */}
        <div
          className={`rounded-2xl p-4 border-2 transition-all ${
            vencedor?.id === 'jogador1'
              ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-fun font-bold text-lg flex items-center justify-center mx-auto mb-2">
            1
          </div>
          <h3 className="font-fun font-bold text-lg text-blue-950">{p1.nome}</h3>
          <p className="font-fun font-bold text-3xl text-blue-700 mt-2">
            {score.jogador1} <span className="text-sm font-semibold text-slate-500">{score.jogador1 === 1 ? 'ponto' : 'pontos'}</span>
          </p>
        </div>

        {/* Jogador 2 */}
        <div
          className={`rounded-2xl p-4 border-2 transition-all ${
            vencedor?.id === 'jogador2'
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 font-fun font-bold text-lg flex items-center justify-center mx-auto mb-2">
            2
          </div>
          <h3 className="font-fun font-bold text-lg text-amber-950">{p2.nome}</h3>
          <p className="font-fun font-bold text-3xl text-amber-700 mt-2">
            {score.jogador2} <span className="text-sm font-semibold text-slate-500">{score.jogador2 === 1 ? 'ponto' : 'pontos'}</span>
          </p>
        </div>
      </div>

      {/* Anúncio do resultado */}
      <div className="py-3.5 px-4 rounded-xl bg-slate-100 border border-slate-200 max-w-md mx-auto mb-6">
        {isEmpate ? (
          <div>
            <h2 className="font-fun font-bold text-xl text-slate-800">
              Empate Amigável!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              Os dois participantes foram muito bem e pontuaram igual.
            </p>
          </div>
        ) : (
          <div>
            <h2 className="font-fun font-bold text-xl text-slate-900">
              Parabéns, {vencedor?.nome}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              Vencedor desta rodada de perguntas. Excelente participação dos dois!
            </p>
          </div>
        )}
      </div>

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPlayAgain}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-fun font-bold text-base text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm cursor-pointer flex items-center justify-center gap-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Jogar Novamente</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGoSettings}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-fun font-bold text-base text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 shadow-2xs cursor-pointer flex items-center justify-center gap-2 transition-colors"
        >
          <Settings className="w-4 h-4 text-slate-600" />
          <span>Mudar Tema</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGoHome}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-fun font-semibold text-base text-slate-600 hover:text-slate-900 cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Início</span>
        </motion.button>
      </div>
    </motion.div>
  );
};
