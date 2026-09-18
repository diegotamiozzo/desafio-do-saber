import React from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';

interface PlayerScoreProps {
  score: number;
  playerColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PlayerScore: React.FC<PlayerScoreProps> = ({ score, size = 'md' }) => {
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';

  return (
    <div className="flex items-center gap-2">
      <motion.div
        key={score}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 border border-slate-200 px-3 py-0.5 rounded-full"
      >
        <Star className={`fill-amber-400 text-amber-500 ${isLarge ? 'w-5 h-5' : isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
        <span
          className={`font-fun font-bold ${
            isLarge ? 'text-2xl' : isSmall ? 'text-xs' : 'text-sm'
          }`}
        >
          {score} {score === 1 ? 'ponto' : 'pontos'}
        </span>
      </motion.div>
    </div>
  );
};
