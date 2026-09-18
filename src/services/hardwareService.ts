import { ButtonPressCallback, HardwareStatus, PlayerId } from '../types';

export interface IHardwareService {
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  onButtonPress(callback: ButtonPressCallback): () => void;
  simulatePress(player: PlayerId): void;
  getStatus(): HardwareStatus;
  subscribeStatus(callback: (status: HardwareStatus) => void): () => void;
  setKeyboardEnabled(enabled: boolean): void;
}

interface SerialPortLike {
  readable: ReadableStream<Uint8Array> | null;
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
}

interface SerialLike {
  requestPort(): Promise<SerialPortLike>;
}

declare global {
  interface Navigator {
    serial?: SerialLike;
  }
}

/**
 * MockHardwareService
 * Escuta as teclas '1' e '2' no teclado para simular os botões físicos do ESP32.
 * Ignora teclas caso o foco esteja em um campo de texto (input/textarea) para não conflitar.
 */
export class MockHardwareService implements IHardwareService {
  private listeners: Set<ButtonPressCallback> = new Set();
  private statusListeners: Set<(status: HardwareStatus) => void> = new Set();
  private isConnected: boolean = true;
  private keyboardEnabled: boolean = true;
  private lastPressedPlayer: PlayerId | null = null;
  private lastPressedTimestamp: number | null = null;

  constructor() {
    this.setupKeyboardListeners();
  }

  private setupKeyboardListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (event: KeyboardEvent) => {
      if (!this.keyboardEnabled) return;

      // Se o usuário estiver digitando em um input ou textarea (ex: configurações), não ativa o botão
      const target = event.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === '1' || event.code === 'Digit1' || event.code === 'Numpad1') {
        event.preventDefault();
        this.simulatePress('jogador1');
      } else if (event.key === '2' || event.code === 'Digit2' || event.code === 'Numpad2') {
        event.preventDefault();
        this.simulatePress('jogador2');
      }
    });
  }

  public async connect(): Promise<boolean> {
    this.isConnected = true;
    this.notifyStatus();
    return true;
  }

  public async disconnect(): Promise<void> {
    this.isConnected = false;
    this.notifyStatus();
  }

  public onButtonPress(callback: ButtonPressCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public simulatePress(player: PlayerId): void {
    if (!this.isConnected) return;

    this.lastPressedPlayer = player;
    this.lastPressedTimestamp = Date.now();
    this.notifyStatus();

    // Notifica todos os ouvintes registrados
    this.listeners.forEach((callback) => {
      try {
        callback(player);
      } catch (err) {
        console.error('Erro ao processar callback de botão:', err);
      }
    });
  }

  public getStatus(): HardwareStatus {
    return {
      connected: this.isConnected,
      mode: 'mock',
      name: 'ESP32 (Simulação Teclado 1 e 2)',
      lastPressedPlayer: this.lastPressedPlayer,
      lastPressedTimestamp: this.lastPressedTimestamp,
    };
  }

  public subscribeStatus(callback: (status: HardwareStatus) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.getStatus());
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  public setKeyboardEnabled(enabled: boolean) {
    this.keyboardEnabled = enabled;
  }

  private notifyStatus() {
    const status = this.getStatus();
    this.statusListeners.forEach((cb) => {
      try {
        cb(status);
      } catch (err) {
        console.error('Erro ao notificar status de hardware:', err);
      }
    });
  }
}

/**
 * Usa o teclado como fallback e lê eventos BTN:1/BTN:2 de um ESP32 conectado
 * por USB Serial. A permissão da porta deve ser concedida por um clique do usuário.
 */
export class UsbSerialHardwareService implements IHardwareService {
  private keyboardService = new MockHardwareService();
  private serialListeners: Set<ButtonPressCallback> = new Set();
  private statusListeners: Set<(status: HardwareStatus) => void> = new Set();
  private port: SerialPortLike | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private connected = false;
  private lastPressedPlayer: PlayerId | null = null;
  private lastPressedTimestamp: number | null = null;

  public async connect(): Promise<boolean> {
    if (!window.isSecureContext) {
      throw new Error(
        'A conexão USB exige HTTPS. Abra a URL do Render diretamente no Chrome ou Edge.'
      );
    }

    if (!navigator.serial) {
      throw new Error(
        'Web Serial não é suportado neste navegador. Use a versão atual do Google Chrome ou Microsoft Edge em um computador.'
      );
    }

    try {
      this.port = await navigator.serial.requestPort();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotFoundError') {
        throw new Error('Nenhuma porta USB foi selecionada. Escolha a porta do ESP32 para continuar.');
      }
      throw error;
    }

    await this.port.open({ baudRate: 115200 });
    this.connected = true;
    this.notifyStatus();
    void this.readLoop();
    return true;
  }

  public async disconnect(): Promise<void> {
    this.connected = false;
    if (this.reader) {
      await this.reader.cancel();
      this.reader.releaseLock();
      this.reader = null;
    }
    if (this.port) {
      await this.port.close();
      this.port = null;
    }
    this.notifyStatus();
  }

  public onButtonPress(callback: ButtonPressCallback): () => void {
    const removeKeyboard = this.keyboardService.onButtonPress(callback);
    this.serialListeners.add(callback);
    return () => {
      removeKeyboard();
      this.serialListeners.delete(callback);
    };
  }

  public simulatePress(player: PlayerId): void {
    this.keyboardService.simulatePress(player);
  }

  public getStatus(): HardwareStatus {
    return {
      connected: this.connected,
      mode: this.connected ? 'webserial' : 'mock',
      name: this.connected ? 'ESP32 USB Serial' : 'Simulação por teclado (teclas 1 e 2)',
      lastPressedPlayer: this.lastPressedPlayer,
      lastPressedTimestamp: this.lastPressedTimestamp,
    };
  }

  public subscribeStatus(callback: (status: HardwareStatus) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.getStatus());
    return () => this.statusListeners.delete(callback);
  }

  public setKeyboardEnabled(enabled: boolean): void {
    this.keyboardService.setKeyboardEnabled(enabled);
  }

  private async readLoop(): Promise<void> {
    if (!this.port?.readable) return;

    const reader = this.port.readable.getReader();
    this.reader = reader;
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (this.connected) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || '';
        lines.forEach((line) => this.handleSerialLine(line.trim()));
      }
    } catch (error) {
      if (this.connected) {
        console.error('Erro ao ler a porta USB do ESP32:', error);
      }
    } finally {
      reader.releaseLock();
      if (this.reader === reader) this.reader = null;
    }
  }

  private handleSerialLine(line: string): void {
    const match = line.match(/^(?:BTN|PLAYER)\s*:\s*([12])$|^([12])$/i);
    const playerNumber = match?.[1] || match?.[2];
    if (!playerNumber) return;

    const player: PlayerId = playerNumber === '1' ? 'jogador1' : 'jogador2';
    this.lastPressedPlayer = player;
    this.lastPressedTimestamp = Date.now();
    this.notifyStatus();
    this.serialListeners.forEach((callback) => callback(player));
  }

  private notifyStatus(): void {
    const status = this.getStatus();
    this.statusListeners.forEach((callback) => callback(status));
  }
}

// Instância padrão: teclado continua disponível e USB Serial pode ser conectado pelo mediador.
export const hardwareService: IHardwareService = new UsbSerialHardwareService();
