import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, VolumeX, Settings, Home, Cpu, Sparkles, LogOut } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';

interface GameHeaderProps {
  showBackHome?: boolean;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ showBackHome = true }) => {
  const navigate = useNavigate();
  const { soundEnabled, toggleSound, hardwareStatus, conectarHardware, desconectarHardware } = useGame();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleHardware = async () => {
    try {
      if (hardwareStatus.connected && hardwareStatus.mode === 'webserial') {
        await desconectarHardware();
      } else {
        await conectarHardware();
      }
    } catch (error) {
      console.error('Não foi possível conectar ao ESP32:', error);
      window.alert(error instanceof Error ? error.message : 'Não foi possível conectar ao ESP32.');
    }
  };

  return (
    <header className="w-full bg-white/95 backdrop-blur-xs border-b border-slate-200 sticky top-0 z-30 px-4 py-2.5">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Título do jogo */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-base shadow-xs">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h1 className="font-fun font-bold text-lg text-slate-900 tracking-tight leading-none">
              Desafio do Saber
            </h1>
            <span className="text-[11px] font-semibold text-slate-500">
              Jogo de Perguntas e Respostas
            </span>
          </div>
        </div>

        {/* Status do Hardware & Controles */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleHardware}
            title={hardwareStatus.connected && hardwareStatus.mode === 'webserial' ? 'Desconectar ESP32' : 'Conectar ESP32 via USB'}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              hardwareStatus.connected && hardwareStatus.mode === 'webserial'
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
          </button>
          {/* Som */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Desativar som' : 'Ativar som'}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Configurações */}
          <button
            onClick={() => navigate('/configuracoes')}
            title="Configurações do mediador"
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Início */}
          {showBackHome && (
            <button
              onClick={() => navigate('/')}
              title="Voltar ao início"
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" />
            </button>
          )}

          {/* Sair / Trocar Usuário */}
          <button
            onClick={handleLogout}
            title={user ? `Sair (${user})` : 'Sair'}
            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
