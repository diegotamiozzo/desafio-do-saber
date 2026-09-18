import { GameConfig, MatchScore } from '../types';
import { DEFAULT_CONFIG } from '../data/constants';

const CONFIG_KEY = 'desafio_do_saber_config';
const SOUND_KEY = 'desafio_do_saber_sound';
const STATS_KEY = 'desafio_do_saber_stats';

export interface GameHistoryItem {
  id: string;
  data: string;
  tema: string;
  dificuldade: string;
  placar: MatchScore;
  vencedor: 'jogador1' | 'jogador2' | 'empate';
}

export const storageService = {
  getConfig(): GameConfig {
    try {
      const data = localStorage.getItem(CONFIG_KEY);
      if (!data) return DEFAULT_CONFIG;
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    } catch {
      return DEFAULT_CONFIG;
    }
  },

  saveConfig(config: GameConfig): void {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn('Falha ao salvar configurações no localStorage:', e);
    }
  },

  getSoundEnabled(): boolean {
    try {
      const data = localStorage.getItem(SOUND_KEY);
      return data !== null ? data === 'true' : true;
    } catch {
      return true;
    }
  },

  saveSoundEnabled(enabled: boolean): void {
    try {
      localStorage.setItem(SOUND_KEY, String(enabled));
    } catch (e) {
      console.warn('Falha ao salvar preferência de som:', e);
    }
  },

  saveGameResult(item: Omit<GameHistoryItem, 'id' | 'data'>): void {
    try {
      const existing = this.getGameHistory();
      const newItem: GameHistoryItem = {
        ...item,
        id: Date.now().toString(),
        data: new Date().toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      const updated = [newItem, ...existing].slice(0, 20);
      localStorage.setItem(STATS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Falha ao salvar histórico de jogo:', e);
    }
  },

  getGameHistory(): GameHistoryItem[] {
    try {
      const data = localStorage.getItem(STATS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
};
