import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { CheckCircle2, ArrowRight, Award, Info, Clock } from 'lucide-react';
import { GameStateEnum, PlayerId, Question } from '../types';
import { PLAYERS } from '../data/constants';

interface AnswerResultProps {
  estado: GameStateEnum;
  jogador: PlayerId | null;
  pergunta: Question | null;
  onNextQuestion: () => void;
  isLastQuestion: boolean;
}

export const AnswerResult: React.FC<AnswerResultProps> = ({
  estado,
  jogador,
  pergunta,
  onNextQuestion,
  isLastQuestion,
}) => {
  const isCorrect = estado === 'CORRECT';
  const isIncorrect = estado === 'INCORRECT';
  const isTimeout = estado === 'TIMEOUT';

  const playerObj = jogador ? PLAYERS[jogador] : null;

  useEffect(() => {
    if (isCorrect) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
        });
      } catch {
        // Silently catch in restricted preview environments
      }
    }
  }, [isCorrect]);

  if (!isCorrect && !isIncorrect && !isTimeout) return null;

  const corretaAlternativa = pergunta?.alternativas.find(
    (a) => a.id === pergunta.respostaCorreta
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`w-full max-w-xl mx-auto rounded-2xl p-6 text-center shadow-lg border-2 ${
        isCorrect
          ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
          : isTimeout
          ? 'bg-amber-50/90 border-amber-300 text-amber-950'
          : 'bg-slate-50 border-slate-300 text-slate-900'
      }`}
    >
      {/* 1. CASO ACERTO */}
      {isCorrect && (
        <div>
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center mb-3 shadow-xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="font-fun font-bold text-2xl sm:text-3xl text-emerald-800 tracking-tight">
            Resposta Correta!
          </h2>

          <p className="mt-2 text-base sm:text-lg font-semibold text-emerald-900">
            {playerObj?.nome} marcou <strong>+1 ponto</strong>
          </p>
        </div>
      )}

      {/* 2. CASO ERRO */}
      {isIncorrect && (
        <div>
          <h2 className="font-fun font-bold text-2xl sm:text-3xl text-slate-800 tracking-tight">
            Não foi dessa vez
          </h2>
          <p className="mt-1 text-sm sm:text-base text-slate-600 font-medium">
            Boa tentativa! O importante é continuar participando.
          </p>

          <div className="mt-3.5 p-3 rounded-xl bg-white border border-slate-200 max-w-md mx-auto">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
              A resposta correta era:
            </span>
            <div className="font-fun font-bold text-lg sm:text-xl text-emerald-700 flex items-center justify-center gap-2">
              <span className="w-7 h-7 rounded-md bg-emerald-600 text-white inline-flex items-center justify-center text-sm">
                {corretaAlternativa?.id}
              </span>
              <span>{corretaAlternativa?.texto}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. CASO TEMPO ESGOTADO */}
      {isTimeout && (
        <div>
          <div className="w-10 h-10 rounded-full bg-amber-500 text-white mx-auto flex items-center justify-center mb-2 shadow-xs">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="font-fun font-bold text-2xl text-amber-900 tracking-tight">
            Tempo Esgotado
          </h2>
          <p className="mt-1 text-sm text-amber-800 font-medium">
            O tempo de 30 segundos acabou sem resposta.
          </p>

          <div className="mt-3.5 p-3 rounded-xl bg-white border border-amber-200 max-w-md mx-auto">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
              A resposta era:
            </span>
            <div className="font-fun font-bold text-lg text-amber-900 flex items-center justify-center gap-2">
              <span className="w-7 h-7 rounded-md bg-amber-500 text-white inline-flex items-center justify-center text-sm">
                {corretaAlternativa?.id}
              </span>
              <span>{corretaAlternativa?.texto}</span>
            </div>
          </div>
        </div>
      )}

      {/* Curiosidade educativa */}
      {pergunta?.curiosidade && (
        <div className="mt-4 p-3 rounded-xl bg-white/80 border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium text-left flex items-start gap-2.5 max-w-md mx-auto">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p>
            <strong className="font-semibold text-slate-900">Curiosidade:</strong> {pergunta.curiosidade}
          </p>
        </div>
      )}

      {/* Botão para avançar */}
      <div className="mt-5 flex justify-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNextQuestion}
          className="px-6 py-3 rounded-xl font-fun font-bold text-base sm:text-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm cursor-pointer flex items-center gap-2 transition-colors"
        >
          {isLastQuestion ? (
            <>
              <Award className="w-5 h-5" />
              <span>Ver Resultado Final</span>
            </>
          ) : (
            <>
              <span>Próxima Pergunta</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};
