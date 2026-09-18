import React from 'react';
import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import { Alternative } from '../types';

interface AnswerOptionProps {
  alternative: Alternative;
  isCorrectAnswer: boolean;
  isSelected: boolean;
  isRevealed: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

const LETTER_CONFIG = {
  A: { bg: 'bg-amber-500', text: 'text-white' },
  B: { bg: 'bg-sky-500', text: 'text-white' },
  C: { bg: 'bg-emerald-500', text: 'text-white' },
  D: { bg: 'bg-purple-500', text: 'text-white' },
};

export const AnswerOption: React.FC<AnswerOptionProps> = ({
  alternative,
  isCorrectAnswer,
  isSelected,
  isRevealed,
  isDisabled,
  onClick,
}) => {
  const cfg = LETTER_CONFIG[alternative.id] || LETTER_CONFIG.A;

  let bgClasses = 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-2xs';

  if (isRevealed) {
    if (isCorrectAnswer) {
      bgClasses = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400';
    } else if (isSelected) {
      bgClasses = 'bg-rose-50 border-rose-400 text-rose-950 ring-1 ring-rose-300';
    } else {
      bgClasses = 'bg-slate-50 border-slate-200 text-slate-400 opacity-50';
    }
  } else if (!isDisabled) {
    bgClasses = 'bg-white hover:bg-indigo-50/50 hover:border-indigo-300 active:scale-[0.99] border-slate-200 text-slate-800 shadow-2xs';
  } else {
    bgClasses = 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed';
  }

  return (
    <motion.button
      whileHover={!isDisabled && !isRevealed ? { scale: 1.01 } : {}}
      whileTap={!isDisabled && !isRevealed ? { scale: 0.99 } : {}}
      disabled={isDisabled || isRevealed}
      onClick={onClick}
      className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 flex items-center gap-3.5 transition-all duration-150 cursor-pointer ${bgClasses}`}
    >
      {/* Badge de Letra */}
      <div
        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center text-lg sm:text-xl font-fun font-bold ${cfg.text} ${cfg.bg} shrink-0 select-none shadow-2xs`}
      >
        {alternative.id}
      </div>

      {/* Texto da alternativa */}
      <span className="font-fun font-semibold text-base sm:text-xl flex-1 leading-snug">
        {alternative.texto}
      </span>

      {/* Feedback pós-resposta */}
      {isRevealed && isCorrectAnswer && (
        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Check className="w-5 h-5 stroke-[2.5]" />
        </div>
      )}

      {isRevealed && isSelected && !isCorrectAnswer && (
        <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
          <X className="w-5 h-5 stroke-[2.5]" />
        </div>
      )}
    </motion.button>
  );
};
