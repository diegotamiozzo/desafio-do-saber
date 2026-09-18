import React from 'react';
import { motion } from 'motion/react';
import { GameStateEnum, PlayerId } from '../types';
import { PLAYERS } from '../data/constants';

interface GameStatusProps {
  estado: GameStateEnum;
  jogadorQueApertou: PlayerId | null;
}

export const GameStatus: React.FC<GameStatusProps> = ({
  estado,
  jogadorQueApertou,
}) => {
  if (estado === 'WAITING_BUTTON') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full text-center py-3 px-4 rounded-xl bg-slate-100 border border-slate-200"
      >
        <p className="text-slate-800 font-fun font-bold text-base sm:text-lg">
          Aperte o botão físico ou a tecla quando souber a resposta
        </p>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Jogador 1: Botão 1 / Tecla [1] • Jogador 2: Botão 2 / Tecla [2]
        </p>
      </motion.div>
    );
  }

  if (estado === 'ANSWERING' && jogadorQueApertou) {
    const p = PLAYERS[jogadorQueApertou];
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full text-center py-2.5 px-4 rounded-xl bg-indigo-50 border border-indigo-200"
      >
        <p className="text-indigo-950 font-fun font-bold text-base sm:text-lg">
          <strong className="underline">{p.nome}</strong> responde verbalmente
        </p>
        <p className="text-xs text-indigo-700 font-medium mt-0.5">
          Mediador: ouça a criança e confirme a opção selecionada abaixo
        </p>
      </motion.div>
    );
  }

  return null;
};
