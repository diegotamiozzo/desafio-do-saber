import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, ArrowLeft, RotateCcw } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Difficulty } from '../types';
import { GameHeader } from '../components/GameHeader';
import { ThemeSelector } from '../components/ThemeSelector';
import { ContextInput } from '../components/ContextInput';
import { DifficultySelector } from '../components/DifficultySelector';
import { QuestionPreview } from '../components/QuestionPreview';
import { QUESTION_COUNT_OPTIONS } from '../data/constants';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { config, updateConfig, resetConfig, gerarPerguntas, iniciarJogo, state } = useGame();
  const [resetNotice, setResetNotice] = useState(false);

  const handleReset = () => {
    resetConfig();
    setResetNotice(true);
    setTimeout(() => setResetNotice(false), 2000);
  };

  const [step, setStep] = useState<'config' | 'preview'>('config');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    try {
      await gerarPerguntas(config);
      setStep('preview');
    } catch (err) {
      console.error('Erro ao gerar perguntas:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartGame = () => {
    iniciarJogo();
    navigate('/jogo');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-indigo-50/30 to-purple-50/20 pb-16">
      <GameHeader />

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6">
        {/* Navegação de voltar se estiver no passo de configuração */}
        {step === 'config' ? (
          <div className="mb-4">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para o Início</span>
            </button>
          </div>
        ) : null}

        {step === 'config' ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-slate-200 shadow-lg space-y-8"
          >
            {/* Header da Tela de Configurações */}
            <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                  Painel do Mediador
                </span>
                <h2 className="font-fun font-black text-2xl sm:text-3xl text-slate-900 mt-2">
                  Configuração da Partida
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Siga as etapas 1, 2 e 3 para definir as perguntas antes de escolher a duração da partida.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {resetNotice && (
                  <span className="text-xs font-semibold text-emerald-600 animate-fade-in">
                    Configurações restauradas!
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleReset}
                  title="Restaurar configurações para o padrão inicial"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Limpar Configurações</span>
                </button>
              </div>
            </div>

            {/* 1. Seleção de Tema */}
            <ThemeSelector
              selectedTheme={config.tema}
              customTheme={config.temaPersonalizado}
              onSelectTheme={(tema) => updateConfig({ tema })}
              onChangeCustomTheme={(temaPersonalizado) => updateConfig({ temaPersonalizado })}
            />

            {/* 2. Campo de Contexto */}
            <ContextInput
              context={config.contexto}
              onChangeContext={(contexto) => updateConfig({ contexto })}
            />

            {/* 3. Seleção de Dificuldade */}
            <DifficultySelector
              difficulty={config.dificuldade}
              onSelectDifficulty={(dificuldade: Difficulty) => updateConfig({ dificuldade })}
            />

            {/* 4. Quantidade de Perguntas */}
            <div className="space-y-3">
              <label className="block font-fun font-bold text-lg text-slate-800">
                4. Duração da Partida:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {QUESTION_COUNT_OPTIONS.map((option) => {
                  const isSelected = config.quantidade === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => updateConfig({ quantidade: option.id })}
                      className={`p-3.5 rounded-xl border-2 text-left transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-fun font-bold text-base text-slate-900">{option.nome}</h4>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{option.descricao}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Botão de Geração */}
            <div className="pt-2 flex justify-center">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={isGenerating}
                onClick={handleGenerate}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-fun font-bold text-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm cursor-pointer flex items-center justify-center gap-2.5 transition-colors disabled:opacity-60"
              >
                <Sparkles className="w-5 h-5 text-indigo-200" />
                <span>{isGenerating ? 'Gerando com Inteligência Artificial...' : `Gerar ${config.quantidade} Perguntas`}</span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <QuestionPreview
            questions={state.perguntas}
            onStartGame={handleStartGame}
            onRegenerate={() => handleGenerate()}
            onBackToConfig={() => setStep('config')}
            isGenerating={isGenerating}
          />
        )}
      </main>
    </div>
  );
};
