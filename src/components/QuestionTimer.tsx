import React from 'react';
import { motion } from 'motion/react';

interface QuestionTimerProps {
  seconds: number;
  totalSeconds?: number;
  isActive: boolean;
}

export const QuestionTimer: React.FC<QuestionTimerProps> = ({
  seconds,
  totalSeconds = 30,
  isActive,
}) => {
  const percentage = Math.max(0, Math.min(100, (seconds / totalSeconds) * 100));
  const isWarning = seconds <= 10 && seconds > 0;
  const isExpired = seconds === 0;

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        animate={
          isWarning && isActive
            ? {
                scale: [1, 1.06, 1],
                transition: { repeat: Infinity, duration: 1 },
              }
            : {}
        }
        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border-2 shadow-xs transition-colors duration-300 ${
          isExpired
            ? 'bg-red-50 text-red-700 border-red-300'
            : isWarning
            ? 'bg-amber-100/90 text-amber-900 border-amber-400'
            : 'bg-emerald-50 text-emerald-800 border-emerald-300'
        }`}
      >
        <span className="text-2xl select-none">
          {isExpired ? '⏰' : isWarning ? '⏳' : '⏱️'}
        </span>
        <div className="flex items-baseline gap-1">
          <span className="font-fun font-bold text-3xl sm:text-4xl tabular-nums">
            {seconds}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider opacity-80">
            segundos
          </span>
        </div>
      </motion.div>

      {/* Barra de progresso suave */}
      <div className="w-44 sm:w-56 h-2.5 bg-slate-200 rounded-full mt-2 overflow-hidden p-0.5">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'linear' }}
          className={`h-full rounded-full transition-colors ${
            isExpired
              ? 'bg-red-500'
              : isWarning
              ? 'bg-amber-500'
              : 'bg-emerald-500'
          }`}
        />
      </div>
    </div>
  );
};
