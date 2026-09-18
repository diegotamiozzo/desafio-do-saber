import React from 'react';

interface ContextInputProps {
  context: string;
  onChangeContext: (ctx: string) => void;
}

export const ContextInput: React.FC<ContextInputProps> = ({
  context,
  onChangeContext,
}) => {
  return (
    <div className="space-y-2">
      <label
        htmlFor="contexto-perguntas-input"
        className="block font-fun font-bold text-lg text-slate-800"
      >
        2. Contexto ou Detalhes Especiais (Opcional):
      </label>
      <p className="text-xs sm:text-sm text-slate-500 font-medium">
        Sobre o que devem ser as perguntas?
      </p>

      <div className="relative">
        <textarea
          id="contexto-perguntas-input"
          rows={3}
          value={context}
          onChange={(e) => onChangeContext(e.target.value)}
          placeholder="Exemplo: Perguntas sobre animais da floresta brasileira, ou continhas fáceis de adição..."
          className="w-full p-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 transition-all text-sm sm:text-base resize-none"
        />
      </div>
    </div>
  );
};
