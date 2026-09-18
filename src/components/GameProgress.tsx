import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { AnswerRecord } from '../types';

interface GameProgressProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  history: AnswerRecord[];
}

export const GameProgress: React.FC<GameProgressProps> = ({
  currentQuestionIndex,
  totalQuestions,
  history,
}) => {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 px-3.5 py-1.5 bg-white rounded-xl border border-slate-200 shadow-2xs max-w-full overflow-x-auto">
      {Array.from({ length: totalQuestions }).map((_, index) => {
        const isCurrent = index === currentQuestionIndex;
        const record = history[index];
        const isAnswered = Boolean(record);
        const isCorrect = record?.correto;

        let bg = 'bg-slate-100 text-slate-500 border border-slate-200';
        if (isCurrent) {
          bg = 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-200';
        } else if (isAnswered) {
          bg = isCorrect
            ? 'bg-emerald-600 text-white'
            : 'bg-slate-300 text-slate-700';
        }

        return (
          <motion.div
            key={index}
            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-fun font-semibold transition-all shrink-0 select-none ${bg}`}
          >
            {isAnswered && isCorrect ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : index + 1}
          </motion.div>
        );
      })}
    </div>
  );
};
