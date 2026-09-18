import React from 'react';
import { motion } from 'motion/react';
import { Player } from '../types';
import { PlayerScore } from './PlayerScore';

interface PlayerCardProps {
  player: Player;
  score: number;
  isBuzzed: boolean;
  isOtherBuzzed: boolean;
  isWaitingButton: boolean;
  onSimulateClick?: () => void;
  compact?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  score,
  isBuzzed,
  isOtherBuzzed,
  isWaitingButton,
  onSimulateClick,
  compact = false,
}) => {
  const isP1 = player.id === 'jogador1';

  return (
    <motion.div
      layout
      animate={{
        scale: isBuzzed ? 1.05 : isOtherBuzzed ? 0.96 : 1,
        opacity: isOtherBuzzed ? 0.75 : 1,
      }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`relative rounded-2xl p-4 transition-all duration-300 border-3 shadow-md ${
        isP1
          ? 'bg-gradient-to-b from-blue-50 to-indigo-50/60 border-blue-300'
          : 'bg-gradient-to-b from-amber-50 to-yellow-50/70 border-amber-300'
      } ${
        isBuzzed
          ? isP1
            ? 'ring-4 ring-blue-400/80 shadow-blue-200 shadow-xl'
            : 'ring-4 ring-amber-400/80 shadow-amber-200 shadow-xl'
          : ''
      }`}
    >
      {/* Badge quando o jogador apertou o botão */}
      {isBuzzed && (
        <motion.div
          initial={{ y: -8, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
            isP1 ? 'bg-blue-600 text-white' : 'bg-amber-500 text-amber-950 font-black'
          }`}
        >
          Vez de Responder
        </motion.div>
      )}

      <div className="flex items-center gap-3">
        {/* Avatar limpo e geométrico */}
        <div
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-fun font-black text-xl sm:text-2xl shadow-2xs select-none ${
            isP1 ? 'bg-blue-600 text-white' : 'bg-amber-400 text-amber-950'
          }`}
        >
          {player.avatar}
        </div>

        {/* Informações do jogador */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3
              className={`font-fun font-bold text-base sm:text-lg truncate ${
                isP1 ? 'text-blue-950' : 'text-amber-950'
              }`}
            >
              {player.nome}
            </h3>

            {/* Tecla de atalho / botão físico */}
            <span
              className={`hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md border ${
                isP1
                  ? 'bg-blue-100/70 text-blue-800 border-blue-200'
                  : 'bg-amber-100/80 text-amber-900 border-amber-300'
              }`}
            >
              <kbd className="font-mono font-bold bg-white px-1.5 py-0.2 rounded border border-slate-200 text-slate-700">
                {player.tecla}
              </kbd>
              <span>{player.botaoLabel}</span>
            </span>
          </div>

          <div className="mt-1">
            <PlayerScore score={score} size={compact ? 'sm' : 'md'} />
          </div>
        </div>
      </div>

      {/* Botão de simulação rápida */}
      {isWaitingButton && onSimulateClick && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onSimulateClick}
          className={`mt-2.5 w-full py-1.5 px-3 rounded-lg font-fun font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
            isP1
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-amber-400 hover:bg-amber-500 text-amber-950 font-black'
          }`}
        >
          <span>Acionar {player.botaoLabel}</span>
          <span className="text-[11px] opacity-80">(Tecla {player.tecla})</span>
        </motion.button>
      )}
    </motion.div>
  );
};
