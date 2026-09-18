import React from 'react';
import { Difficulty } from '../types';
import { DIFFICULTY_OPTIONS } from '../data/constants';

interface DifficultySelectorProps {
  difficulty: Difficulty;
  onSelectDifficulty: (diff: Difficulty) => void;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  difficulty,
  onSelectDifficulty,
}) => {
  return (
    <div className="space-y-3">
      <label className="block font-fun font-bold text-lg text-slate-800">
        3. Dificuldade das Perguntas:
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {DIFFICULTY_OPTIONS.map((opt) => {
          const isSelected = difficulty === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectDifficulty(opt.id as Difficulty)}
              className={`p-3.5 rounded-xl border-2 text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/70 shadow-2xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-fun font-bold text-base text-slate-900">
                  {opt.nome}
                </h4>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {opt.descricao}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
