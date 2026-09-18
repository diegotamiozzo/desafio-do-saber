import React from 'react';
import { motion } from 'motion/react';
import { Play, RotateCcw, Sliders, CheckCircle, Info, Sparkles, AlertCircle } from 'lucide-react';
import { Question } from '../types';
import { useGame } from '../context/GameContext';

interface QuestionPreviewProps {
  questions: Question[];
  onStartGame: () => void;
  onRegenerate: () => void;
  onBackToConfig: () => void;
  isGenerating?: boolean;
}

export const QuestionPreview: React.FC<QuestionPreviewProps> = ({
  questions,
  onStartGame,
  onRegenerate,
  onBackToConfig,
  isGenerating = false,
}) => {
  const { config, state } = useGame();

  const isGroqAI = state.generationSource === 'groq';
  const isGeminiAI = state.generationSource === 'gemini';
  const displayTheme = config.tema === 'Personalizado' && config.temaPersonalizado ? config.temaPersonalizado : config.tema;

  return (
    <div className="space-y-6">
      {/* Cabeçalho de Sucesso da Geração */}
      <div className="text-center bg-white p-6 sm:p-7 rounded-2xl border-2 border-slate-200 shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
          <CheckCircle className="w-6 h-6" />
        </div>
        <h2 className="font-fun font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
          Perguntas Preparadas com Sucesso
        </h2>
        <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">
          {questions.length} perguntas calibradas e seguras para as crianças.
        </p>

        {/* Badges de Tema e Contexto */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-200">
            <span>Tema:</span>
            <strong>{displayTheme}</strong>
          </span>

          {config.contexto && config.contexto.trim() && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold text-xs border border-emerald-200">
              <span>Contexto:</span>
              <strong>{config.contexto.trim()}</strong>
            </span>
          )}

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200">
            {isGroqAI ? (
              <>
                <Sparkles className="w-3 h-3 text-orange-500" />
                <span>IA Groq (gpt-oss-20b)</span>
              </>
            ) : isGeminiAI ? (
              <>
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>IA Gemini</span>
              </>
            ) : (
              <span>Gerador Temático Inteligente</span>
            )}
          </span>
        </div>

        {/* Aviso amigável caso haja aviso */}
        {state.generationNotice && (
          <div className="mt-4 max-w-xl mx-auto p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Aviso sobre o serviço de IA:</p>
              <p className="mt-0.5 text-amber-800 leading-relaxed">
                {state.generationNotice}
              </p>
            </div>
          </div>
        )}

        {/* Botões de Ação no Topo */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartGame}
            className="px-6 py-3 rounded-xl font-fun font-bold text-base sm:text-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm cursor-pointer flex items-center gap-2 transition-colors"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Começar Jogo</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isGenerating}
            onClick={onRegenerate}
            className="px-4 py-3 rounded-xl font-fun font-bold text-sm sm:text-base text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 shadow-2xs cursor-pointer flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isGenerating ? 'Gerando...' : 'Gerar Novas'}</span>
          </motion.button>

          <button
            onClick={onBackToConfig}
            className="px-4 py-3 rounded-xl font-fun font-semibold text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <Sliders className="w-4 h-4" />
            <span>Alterar Configurações</span>
          </button>
        </div>
      </div>

      {/* Lista das 10 Perguntas para Revisão */}
      <div className="space-y-3">
        <h3 className="font-fun font-bold text-lg text-slate-800 px-1">
          Conferência do Mediador:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {questions.map((q, index) => (
            <div
              key={q.id || index}
              className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-fun font-semibold text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200">
                    Pergunta {index + 1} de {questions.length}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {q.tema}
                  </span>
                </div>

                <h4 className="font-fun font-bold text-base text-slate-900 mb-2.5 leading-snug">
                  {q.pergunta}
                </h4>

                <div className="grid grid-cols-1 gap-1.5 text-sm">
                  {q.alternativas.map((alt) => {
                    const isCorrect = alt.id === q.respostaCorreta;
                    return (
                      <div
                        key={alt.id}
                        className={`px-3 py-1.5 rounded-lg border flex items-center justify-between text-xs sm:text-sm ${
                          isCorrect
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-md inline-flex items-center justify-center font-bold text-xs ${
                              isCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {alt.id}
                          </span>
                          <span>{alt.texto}</span>
                        </span>
                        {isCorrect && (
                          <span className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider">
                            Correta
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {q.curiosidade && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-start gap-1.5 text-[11px] text-slate-500 font-medium">
                  <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                  <p>{q.curiosidade}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Botão de Início no Rodapé */}
      <div className="pt-2 flex justify-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartGame}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-fun font-bold text-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm cursor-pointer flex items-center justify-center gap-2.5 transition-colors"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>Começar Jogo Agora</span>
        </motion.button>
      </div>
    </div>
  );
};
