import React from 'react';
import { THEME_OPTIONS } from '../data/constants';

interface ThemeSelectorProps {
  selectedTheme: string;
  customTheme: string;
  onSelectTheme: (theme: string) => void;
  onChangeCustomTheme: (custom: string) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedTheme,
  customTheme,
  onSelectTheme,
  onChangeCustomTheme,
}) => {
  return (
    <div className="space-y-4">
      <label className="block font-fun font-bold text-lg text-slate-800">
        1. Escolha o Tema das Perguntas:
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {THEME_OPTIONS.map((theme) => {
          const isSelected = selectedTheme === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onSelectTheme(theme.id)}
              className={`p-3 rounded-xl border-2 text-left transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[76px] ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/70 shadow-2xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-fun font-bold text-sm text-slate-900 leading-tight">
                  {theme.nome}
                </h4>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                {theme.descricao}
              </p>
            </button>
          );
        })}
      </div>

      {/* Campo para tema personalizado se 'Personalizado' for selecionado */}
      {selectedTheme === 'Personalizado' && (
        <div className="mt-3 p-4 rounded-2xl bg-rose-50 border-2 border-rose-200">
          <label
            htmlFor="tema-personalizado-input"
            className="block text-xs font-bold uppercase tracking-wider text-rose-800 mb-1"
          >
            Qual é o tema personalizado?
          </label>
          <input
            id="tema-personalizado-input"
            type="text"
            value={customTheme}
            onChange={(e) => onChangeCustomTheme(e.target.value)}
            placeholder="Ex: Super-heróis, Dinossauros voadores, Desenhos animados..."
            className="w-full px-4 py-2.5 rounded-xl border border-rose-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>
      )}
    </div>
  );
};
