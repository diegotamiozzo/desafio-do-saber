import React from 'react';
import { motion } from 'motion/react';
import { PlayerId } from '../types';
import { PLAYERS } from '../data/constants';

interface PlayerIndicatorProps {
  player: PlayerId | null;
}

export const PlayerIndicator: React.FC<PlayerIndicatorProps> = ({ player }) => {
  if (!player) return null;

  const playerObj = PLAYERS[player];
  const isP1 = player === 'jogador1';

  return (
    <motion.div
      initial={{ scale: 0.9, y: -10, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0.9, y: -10, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`w-full max-w-lg mx-auto rounded-2xl p-3.5 sm:p-4 text-center shadow-md border-2 ${
        isP1
          ? 'bg-blue-600 border-blue-400 text-white'
          : 'bg-amber-400 border-amber-300 text-amber-950 shadow-amber-200'
      }`}
    >
      <div className="flex items-center justify-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-fun font-bold text-xl ${
            isP1 ? 'bg-white/20 text-white' : 'bg-amber-500/40 text-amber-950 font-black'
          }`}
        >
          {playerObj.avatar}
        </div>
        <div className="text-left">
          <h2 className="font-fun font-bold text-xl sm:text-2xl tracking-tight leading-none">
            {playerObj.nome} apertou primeiro!
          </h2>
          <p
            className={`text-xs sm:text-sm font-medium mt-0.5 ${
              isP1 ? 'text-white/90' : 'text-amber-900 font-semibold'
            }`}
          >
            Pode responder em voz alta para o mediador.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
