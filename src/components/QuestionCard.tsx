import React from 'react';
import { motion } from 'motion/react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
}) => {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-amber-200/80 shadow-md text-center relative overflow-hidden"
    >
      {/* Barra de identificação do tema e número */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
          <span>{question.tema}</span>
        </span>

        <span className="font-fun font-semibold text-xs sm:text-sm text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
          Pergunta <strong className="text-indigo-600 font-bold">{questionNumber}</strong> de {totalQuestions}
        </span>
      </div>

      {/* Pergunta em destaque */}
      <div className="py-2 sm:py-4">
        <h1 className="font-fun font-bold text-2xl sm:text-4xl text-slate-800 leading-tight">
          {question.pergunta}
        </h1>
      </div>
    </motion.div>
  );
};
