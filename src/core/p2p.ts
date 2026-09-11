/**
 * P2PManager — управление WebRTC DataChannel для офлайн-first мессенджера.
 *
 * Возможности:
 *  - Ручной обмен SDP (offer/answer) без сигнального сервера
 *  - STUN + опциональный TURN (для симметричных NAT)
 *  - Очередь сообщений до открытия канала
 *  - Колбэки onOpen / onClose / onError / onData
 *  - Корректное ожидание сбора ICE-кандидатов
 *  - Отправка текста и бинарных данных (ArrayBuffer)
 *  - Безопасный JSON.parse и защита от битого SDP
 */

export type P2PEventMap = {
  open: () => void;
  close: () => void;
  error: (err: Error) => void;
  data: (data: unknown) => void;
  statechange: (state: RTCPeerConnectionState) => void;
};

export interface P2PConfig {
  /** Список ICE-серверов. Если не передан — используется только публичный STUN Google. */
  iceServers?: RTCIceServer[];
  /** Таймаут ожидания сбора ICE-кандидатов (мс). По умолчанию 5000. */
  iceGatheringTimeout?: number;
  /** Таймаут установки соединения (мс). По умолчанию 30000. */
  connectionTimeout?: number;
}

const DEFAULT_ICE: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  // 🔴 Для продакшена добавь TURN-сервер:
  // { urls: 'turn:your-turn-server.com:3478', username: 'user', credential: 'pass' },
];

export class P2PManager {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private config: Required<P2PConfig>;

  /** Очередь сообщений, отправленных до открытия канала. */
  private outQueue: unknown[] = [];

  /** Флаг: канал когда-либо был открыт. */
  private wasOpen = false;

  // Колбэки
  private onOpenCb: (() => void) | null = null;
  private onCloseCb: (() => void) | null = null;
  private onErrorCb: ((err: Error) => void) | null = null;
  private onMessageCb: ((data: unknown) => void) | null = null;
  private onStateChangeCb: ((state: RTCPeerConnectionState) => void) | null = null;

  constructor(config: P2PConfig = {}) {
    this.config = {
      iceServers: config.iceServers ?? DEFAULT_ICE,
      iceGatheringTimeout: config.iceGatheringTimeout ?? 5000,
      connectionTimeout: config.connectionTimeout ?? 30000,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // ПРОВЕРКА ПОДДЕРЖКИ
  // ─────────────────────────────────────────────────────────────

  static isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.RTCPeerConnection !== 'undefined'
    );
  }

  // ─────────────────────────────────────────────────────────────
  // СОЗДАНИЕ OFFER (инициатор)
  // ─────────────────────────────────────────────────────────────

  async createOffer(): Promise<string> {
    this.ensureSupported();
    this.reset(); // на случай повторного вызова

    this.pc = this.createPeerConnection();

    // DataChannel создаёт инициатор
    this.dc = this.pc.createDataChannel('fs-chat', { ordered: true });
    this.setupDataChannel();

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    await this.waitForIceGathering();
    return this.serializeLocalDescription();
  }

  // ─────────────────────────────────────────────────────────────
  // ПРИНЯТИЕ OFFER (ответчик)
  // ─────────────────────────────────────────────────────────────

  async acceptOffer(offerJson: string): Promise<string> {
    this.ensureSupported();
    this.reset();

    const offer = this.safeParse(offerJson, 'offer');

    this.pc = this.createPeerConnection();

    // DataChannel придёт от инициатора
    this.pc.ondatachannel = (e) => {
      this.dc = e.channel;
      this.setupDataChannel();
    };

    try {
      await this.pc.setRemoteDescription(offer);
    } catch (e) {
      this.emitError(new Error(`Неверный offer SDP: ${(e as Error).message}`));
      throw e;
    }

    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);

    await this.waitForIceGathering();
    return this.serializeLocalDescription();
  }

  // ─────────────────────────────────────────────────────────────
  // ПРИНЯТИЕ ANSWER (инициатор)
  // ─────────────────────────────────────────────────────────────

  async acceptAnswer(answerJson: string): Promise<void> {
    if (!this.pc) {
      throw new Error('Нельзя принять answer: соединение не инициализировано (сначала createOffer)');
    }
    const answer = this.safeParse(answerJson, 'answer');
    try {
      await this.pc.setRemoteDescription(answer);
    } catch (e) {
      this.emitError(new Error(`Неверный answer SDP: ${(e as Error).message}`));
      throw e;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // ОТПРАВКА ДАННЫХ
  // ─────────────────────────────────────────────────────────────

  /**
   * Отправляет данные. Если канал ещё не открыт — ставит в очередь.
   * Возвращает true, если отправлено сразу, false — если поставлено в очередь.
   */
  send(data: unknown): boolean {
    if (this.dc?.readyState === 'open') {
      this.rawSend(data);
      return true;
    }
    // Ставим в очередь — отправится при открытии канала
    this.outQueue.push(data);
    return false;
  }

  /** Отправка бинарных данных (ArrayBuffer / Blob / Uint8Array). */
  sendBinary(data: ArrayBuffer | Uint8Array | Blob): boolean {
    if (this.dc?.readyState !== 'open') {
      this.outQueue.push({ __binary: data });
      return false;
    }
    try {
      if (data instanceof Blob) {
        this.dc.send(data);
      } else if (data instanceof Uint8Array) {
        // Копируем в новый ArrayBuffer, чтобы убрать возможный SharedArrayBuffer
        const copy = new Uint8Array(data.byteLength);
        copy.set(data);
        this.dc.send(copy.buffer);
      } else {
        this.dc.send(data);
      }
      return true;
    } catch (e) {
      this.emitError(new Error(`Ошибка отправки бинарных данных: ${(e as Error).message}`));
      return false;
    }
  }

  private rawSend(data: unknown) {
    if (!this.dc) return;
    // Бинарные данные из очереди
    if (typeof data === 'object' && data !== null && '__binary' in data) {
      const bin = (data as { __binary: ArrayBuffer | Uint8Array | Blob }).__binary;
      try {
        if (bin instanceof Blob) {
          this.dc.send(bin);
        } else if (bin instanceof Uint8Array) {
          // Копируем, чтобы гарантировать ArrayBuffer (не SharedArrayBuffer)
          const copy = new Uint8Array(bin.byteLength);
          copy.set(bin);
          this.dc.send(copy.buffer);
        } else {
          this.dc.send(bin);
        }
      } catch (e) {
        this.emitError(new Error(`Ошибка отправки бинарных данных: ${(e as Error).message}`));
      }
      return;
    }
    // JSON
    try {
      this.dc.send(JSON.stringify(data));
    } catch (e) {
      this.emitError(new Error(`Ошибка отправки: ${(e as Error).message}`));
    }
  }

  // ─────────────────────────────────────────────────────────────
  // ПОДПИСКИ НА СОБЫТИЯ
  // ─────────────────────────────────────────────────────────────

  onData(cb: (data: unknown) => void) { this.onMessageCb = cb; }
  onConnect(cb: () => void) { this.onOpenCb = cb; }
  onDisconnect(cb: () => void) { this.onCloseCb = cb; }
  onError(cb: (err: Error) => void) { this.onErrorCb = cb; }
  onStateChange(cb: (state: RTCPeerConnectionState) => void) { this.onStateChangeCb = cb; }

  // ─────────────────────────────────────────────────────────────
  // СОСТОЯНИЕ
  // ─────────────────────────────────────────────────────────────

  isConnected(): boolean {
    return this.dc?.readyState === 'open';
  }

  getConnectionState(): RTCPeerConnectionState | 'closed' {
    return this.pc?.connectionState ?? 'closed';
  }

  getDataChannelState(): RTCDataChannelState | 'closed' {
    return this.dc?.readyState ?? 'closed';
  }

  // ─────────────────────────────────────────────────────────────
  // ЗАКРЫТИЕ
  // ─────────────────────────────────────────────────────────────

  close() {
    try {
      this.dc?.close();
    } catch { /* ignore */ }
    try {
      this.pc?.close();
    } catch { /* ignore */ }

    this.dc = null;
    this.pc = null;
    this.outQueue = [];
    this.wasOpen = false;

    if (this.onCloseCb) {
      try { this.onCloseCb(); } catch { /* ignore */ }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // ВНУТРЕННЕЕ
  // ─────────────────────────────────────────────────────────────

  private reset() {
    if (this.dc) { try { this.dc.close(); } catch { /* ignore */ } }
    if (this.pc) { try { this.pc.close(); } catch { /* ignore */ } }
    this.dc = null;
    this.pc = null;
    this.outQueue = [];
    this.wasOpen = false;
  }

  private createPeerConnection(): RTCPeerConnection {
    const pc = new RTCPeerConnection({ iceServers: this.config.iceServers });

    pc.onicecandidateerror = (e) => {
      // Ошибка конкретного ICE-сервера — не критично, но логируем
      const err = new Error(`ICE candidate error (${e.url}): ${e.errorText} (code ${e.errorCode})`);
      this.emitError(err, /* soft */ true);
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      this.onStateChangeCb?.(state);

      if (state === 'failed') {
        this.emitError(new Error('Соединение не установлено (connectionState=failed). Возможно, нужен TURN-сервер.'));
      }
      if (state === 'disconnected' || state === 'closed') {
        if (this.wasOpen) {
          this.wasOpen = false;
          this.onCloseCb?.();
        }
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'failed') {
        this.emitError(new Error('ICE connection failed. Попробуйте добавить TURN-сервер.'));
      }
    };

    return pc;
  }

  private setupDataChannel() {
    if (!this.dc) return;

    this.dc.binaryType = 'arraybuffer';

    this.dc.onopen = () => {
      this.wasOpen = true;
      this.onOpenCb?.();

      // Сброс очереди
      if (this.outQueue.length > 0) {
        const queue = [...this.outQueue];
        this.outQueue = [];
        for (const item of queue) this.rawSend(item);
      }
    };

    this.dc.onclose = () => {
      if (this.wasOpen) {
        this.wasOpen = false;
        this.onCloseCb?.();
      }
    };

    this.dc.onerror = (e) => {
      const err = new Error(`DataChannel error: ${(e as RTCErrorEvent).error?.message ?? 'unknown'}`);
      this.emitError(err);
    };

    this.dc.onmessage = (e) => {
      const raw = e.data;

      // Бинарные данные
      if (raw instanceof ArrayBuffer) {
        this.onMessageCb?.(raw);
        return;
      }
      if (raw instanceof Blob) {
        // Читаем blob асинхронно
        raw.arrayBuffer().then(buf => this.onMessageCb?.(buf)).catch(() => { /* ignore */ });
        return;
      }

      // Текст: пробуем JSON, иначе отдаём как есть
      if (typeof raw === 'string') {
        try {
          this.onMessageCb?.(JSON.parse(raw));
        } catch {
          this.onMessageCb?.(raw);
        }
      }
    };
  }

  /**
   * Ждём полного сбора ICE-кандидатов. Если за timeout не собрались — всё равно возвращаем SDP.
   * Это безопаснее, чем просто setTimeout, потому что проверяем фактическое состояние.
   */
  private waitForIceGathering(): Promise<void> {
    return new Promise<void>((resolve) => {
      const pc = this.pc;
      if (!pc) { resolve(); return; }

      if (pc.iceGatheringState === 'complete') { resolve(); return; }

      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        pc.removeEventListener('icegatheringstatechange', onChange);
        clearTimeout(timer);
        resolve();
      };

      const onChange = () => {
        if (pc.iceGatheringState === 'complete') finish();
      };

      pc.addEventListener('icegatheringstatechange', onChange);

      const timer = setTimeout(() => {
        // Таймаут — возвращаем то, что успели собрать
        finish();
      }, this.config.iceGatheringTimeout);
    });
  }

  private serializeLocalDescription(): string {
    if (!this.pc?.localDescription) {
      throw new Error('Не удалось сформировать SDP: localDescription пуст');
    }
    return JSON.stringify({
      type: this.pc.localDescription.type,
      sdp: this.pc.localDescription.sdp,
    });
  }

  private safeParse(json: string, kind: 'offer' | 'answer'): RTCSessionDescriptionInit {
    let parsed: any;
    try {
      parsed = JSON.parse(json.trim());
    } catch {
      throw new Error(`Некорректный JSON в ${kind} SDP. Убедитесь, что скопировали полностью.`);
    }
    if (!parsed || typeof parsed !== 'object' || typeof parsed.sdp !== 'string' || !parsed.type) {
      throw new Error(`Некорректный ${kind} SDP: отсутствуют поля type/sdp.`);
    }
    if (kind === 'answer' && parsed.type !== 'answer') {
      throw new Error(`Ожидался answer, получен "${parsed.type}".`);
    }
    if (kind === 'offer' && parsed.type !== 'offer') {
      throw new Error(`Ожидался offer, получен "${parsed.type}".`);
    }
    return { type: parsed.type, sdp: parsed.sdp };
  }

  private ensureSupported() {
    if (!P2PManager.isSupported()) {
      throw new Error('Ваш браузер не поддерживает WebRTC (RTCPeerConnection).');
    }
  }

  private emitError(err: Error, soft = false) {
    if (soft) {
      // Мягкая ошибка — только в консоль, не рушим UI
      console.warn('[P2P soft]', err.message);
      return;
    }
    console.error('[P2P]', err);
    this.onErrorCb?.(err);
  }
}
