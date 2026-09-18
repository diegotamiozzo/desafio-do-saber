import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, Settings } from 'lucide-react';
import { PLAYERS } from '../data/constants';
import { GameHeader } from '../components/GameHeader';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50 via-amber-50/40 to-pink-50/30">
      <GameHeader showBackHome={false} />

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-4xl mx-auto w-full">
        {/* Cartão Central Principal de Boas-Vindas */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full bg-white rounded-3xl p-6 sm:p-10 border-2 border-slate-200 shadow-lg text-center relative overflow-hidden"
        >
          {/* Tag superior discreta */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-xs tracking-wide mb-3 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Perguntas e Respostas geradas por IA</span>
          </div>

          {/* Nome do Jogo */}
          <h1 className="font-fun font-black text-4xl sm:text-5xl text-slate-900 tracking-tight">
            Desafio do Saber
          </h1>

          {/* Subtítulo amigável */}
          <p className="text-base sm:text-lg text-slate-600 font-medium mt-2 max-w-lg mx-auto leading-relaxed">
            Jogo de perguntas e respostas. Desafie seus amigos e dispute quem consegue responder primeiro!
          </p>

          {/* Identificação Visual dos Dois Jogadores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-6 max-w-xl mx-auto">
            {/* Jogador 1 */}
            <div className="p-4 rounded-2xl bg-blue-50/70 border-2 border-blue-200 shadow-2xs flex items-center gap-3.5 text-left">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-fun font-bold text-xl flex items-center justify-center shrink-0 shadow-xs">
                1
              </div>
              <div className="min-w-0">
                <span className="text-[11px] uppercase font-bold text-blue-600 tracking-wider">
                  Participante 1 • Azul
                </span>
                <h3 className="font-fun font-bold text-lg text-blue-950 truncate">
                  {PLAYERS.jogador1.nome}
                </h3>
                <p className="text-xs text-blue-700 font-medium mt-0.5">
                  Botão Físico 1 ou Tecla [1]
                </p>
              </div>
            </div>

            {/* Jogador 2 */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 shadow-2xs flex items-center gap-3.5 text-left">
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-amber-950 font-fun font-bold text-xl flex items-center justify-center shrink-0 shadow-xs">
                2
              </div>
              <div className="min-w-0">
                <span className="text-[11px] uppercase font-bold text-amber-700 tracking-wider">
                  Participante 2 • Amarelo
                </span>
                <h3 className="font-fun font-bold text-lg text-amber-950 truncate">
                  {PLAYERS.jogador2.nome}
                </h3>
                <p className="text-xs text-amber-800 font-medium mt-0.5">
                  Botão Físico 2 ou Tecla [2]
                </p>
              </div>
            </div>
          </div>

          {/* Ação principal */}
          <div className="flex justify-center pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/configuracoes')}
              className="w-full max-w-md py-3.5 px-6 rounded-xl font-fun font-bold text-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm cursor-pointer flex items-center justify-center gap-2 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Configurar Partida</span>
            </motion.button>
          </div>
          <div className="mt-7 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
            <span>
               <strong>Responda quem for mais rápido!</strong>.
            </span>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
