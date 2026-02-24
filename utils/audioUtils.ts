
// Utility to handle Gemini API Raw PCM Audio

export class AudioController {
  private audioContext: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;
  private isPlaying: boolean = false;
  private onEnded?: () => void;

  constructor() {
    // We defer initialization to user interaction due to browser autoplay policies
  }

  private initContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000, // Gemini TTS uses 24kHz
      });
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private convertPCMToFloat32(pcmData: Uint8Array): Float32Array {
    const dataInt16 = new Int16Array(pcmData.buffer);
    const float32 = new Float32Array(dataInt16.length);
    for (let i = 0; i < dataInt16.length; i++) {
      float32[i] = dataInt16[i] / 32768.0;
    }
    return float32;
  }

  public async play(base64Audio: string, onEnded?: () => void) {
    this.stop(); // Stop any current playback
    this.initContext();
    this.onEnded = onEnded;

    if (!this.audioContext) return;

    try {
      const pcmData = this.base64ToUint8Array(base64Audio);
      const float32Data = this.convertPCMToFloat32(pcmData);

      const buffer = this.audioContext.createBuffer(1, float32Data.length, 24000);
      buffer.getChannelData(0).set(float32Data);

      this.source = this.audioContext.createBufferSource();
      this.source.buffer = buffer;
      this.source.connect(this.audioContext.destination);
      
      this.source.onended = () => {
        this.isPlaying = false;
        if (this.onEnded) this.onEnded();
      };

      this.source.start(0);
      this.isPlaying = true;
    } catch (error) {
      console.error("Audio playback error:", error);
      if (onEnded) onEnded();
    }
  }

  public stop() {
    if (this.source) {
      try {
        this.source.stop();
        this.source.disconnect();
      } catch (e) {
        // Ignore errors if already stopped
      }
      this.source = null;
    }
    this.isPlaying = false;
  }
}

export const audioController = new AudioController();
