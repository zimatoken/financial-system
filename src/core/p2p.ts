export class P2PManager {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private onMessage: ((data: unknown) => void) | null = null;
  private onOpen: (() => void) | null = null;

  async createOffer(): Promise<string> {
    this.pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    this.dc = this.pc.createDataChannel('fs-chat', { ordered: true });
    this.setupChannel();

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    await new Promise<void>(resolve => {
      const check = () => {
        if (this.pc?.iceGatheringState === 'complete') { resolve(); return; }
        setTimeout(check, 200);
      };
      setTimeout(() => resolve(), 3000);
      check();
    });

    return JSON.stringify(this.pc.localDescription);
  }

  async acceptOffer(offerJson: string): Promise<string> {
    const offer = JSON.parse(offerJson);
    this.pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

    this.pc.ondatachannel = (e) => {
      this.dc = e.channel;
      this.setupChannel();
    };

    await this.pc.setRemoteDescription(offer);
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);

    await new Promise<void>(resolve => {
      setTimeout(() => resolve(), 3000);
    });

    return JSON.stringify(this.pc.localDescription);
  }

  async acceptAnswer(answerJson: string) {
    const answer = JSON.parse(answerJson);
    await this.pc?.setRemoteDescription(answer);
  }

  private setupChannel() {
    if (!this.dc) return;
    this.dc.onopen = () => this.onOpen?.();
    this.dc.onmessage = (e) => {
      try { this.onMessage?.(JSON.parse(e.data)); } catch { this.onMessage?.(e.data); }
    };
  }

  send(data: unknown) {
    if (this.dc?.readyState === 'open') {
      this.dc.send(JSON.stringify(data));
    }
  }

  onData(cb: (data: unknown) => void) { this.onMessage = cb; }
  onConnect(cb: () => void) { this.onOpen = cb; }

  close() {
    this.dc?.close();
    this.pc?.close();
  }
}
