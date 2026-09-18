export interface ServerHealthResponse {
  status: string;
  aiAvailable: boolean;
  provider: string;
  model: string;
}

export type ConnectionState = 'idle' | 'checking' | 'waking_up' | 'connected' | 'offline';

class ServerConnectionService {
  private state: ConnectionState = 'idle';
  private listeners: Array<(state: ConnectionState, elapsedSec: number, details?: any) => void> = [];
  private checkInterval: any = null;
  private elapsedTimer: any = null;
  private elapsedSeconds = 0;
  private serverInfo: ServerHealthResponse | null = null;

  public getState(): ConnectionState {
    return this.state;
  }

  public getElapsedSeconds(): number {
    return this.elapsedSeconds;
  }

  public getServerInfo(): ServerHealthResponse | null {
    return this.serverInfo;
  }

  public subscribe(listener: (state: ConnectionState, elapsedSec: number, details?: any) => void) {
    this.listeners.push(listener);
    listener(this.state, this.elapsedSeconds, this.serverInfo);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(details?: any) {
    this.listeners.forEach((l) => l(this.state, this.elapsedSeconds, details));
  }

  /**
   * Dispara verificação do servidor (com retry inteligente para quando o Render estiver hibernando)
   */
  public async pingServer(maxWaitSeconds = 60): Promise<boolean> {
    const { buildApiUrl } = await import('../config/api');
    const url = buildApiUrl('/api/status');

    this.elapsedSeconds = 0;
    this.state = 'checking';
    this.notify();

    if (this.elapsedTimer) clearInterval(this.elapsedTimer);
    this.elapsedTimer = setInterval(() => {
      this.elapsedSeconds += 1;
      if (this.elapsedSeconds > 3 && this.state === 'checking') {
        this.state = 'waking_up';
      }
      this.notify(this.serverInfo);
    }, 1000);

    const startTime = Date.now();

    while ((Date.now() - startTime) / 1000 < maxWaitSeconds) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          this.serverInfo = data;
          this.state = 'connected';
          if (this.elapsedTimer) clearInterval(this.elapsedTimer);
          this.notify(data);
          return true;
        }
      } catch {
        // Se falhou ou deu timeout, significa que o Render está iniciando o container frio
        if (this.elapsedSeconds >= 2 && this.state !== 'waking_up') {
          this.state = 'waking_up';
          this.notify();
        }
      }

      // Espera 2.5s antes da próxima checagem
      await new Promise((r) => setTimeout(r, 2500));
    }

    if (this.elapsedTimer) clearInterval(this.elapsedTimer);
    this.state = 'offline';
    this.notify();
    return false;
  }
}

export function createServerConnectionService() {
  return new ServerConnectionService();
}

export const serverConnection = new ServerConnectionService();
