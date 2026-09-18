import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, Lock, User, ArrowRight, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Campos limpos por padrão (sem salvar usuário nem senha na tela)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Se já estiver autenticado, vai para a página inicial
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password) {
      setErrorMsg('Por favor, digite o usuário e a senha.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await login(username, password);
      if (ok) {
        navigate('/', { replace: true });
      } else {
        setErrorMsg('Usuário ou senha incorretos.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-linear-to-b from-sky-50 via-amber-50/40 to-pink-50/30 text-slate-800">
      {/* Cabeçalho no mesmo padrão do jogo */}
      <header className="w-full bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 py-3 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-base shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h1 className="font-fun font-bold text-lg text-slate-900 tracking-tight leading-none">
                Desafio do Saber
              </h1>
              <span className="text-[11px] font-semibold text-slate-500">
                Jogo Educativo em Dupla
              </span>
            </div>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Acesso do Mediador
          </span>
        </div>
      </header>

      {/* Conteúdo Central */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 max-w-md mx-auto w-full">
        <div className="w-full space-y-4">
          {/* Card de Login com mesmo padrão visual do jogo */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-lg"
          >
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-3 text-indigo-600">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="font-fun font-bold text-2xl text-slate-900">
                Entrar no Jogo
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Identifique-se como mediador para iniciar as rodadas
              </p>
            </div>

            {/* Mensagem de erro */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Usuário
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Digite o usuário"
                    autoComplete="off"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite a senha"
                    autoComplete="new-password"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-sans"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-fun font-bold text-base flex items-center justify-center gap-2 shadow-md shadow-indigo-200 transition-all cursor-pointer"
              >
                <span>{isSubmitting ? 'Validando...' : 'Acessar Desafio'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </div>
      </main>

      {/* Rodapé informativo discreto */}
      <footer className="p-4 text-center text-xs text-slate-400">
        Desafio do Saber • Jogo Perguntas e Respostas 
      </footer>
    </div>
  );
};
