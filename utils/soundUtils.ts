
// A lightweight sound synthesizer for UI interactions
// Uses Web Audio API to generate sounds without external assets

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = true;

  constructor() {
    // Lazy init to handle autoplay policies
  }

  private init() {
    if (!this.ctx) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.value = 0.3; // Master volume
          this.masterGain.connect(this.ctx.destination);
        }
      } catch (e) {
        console.warn('AudioContext not supported or blocked', e);
      }
    }
  }

  private async ensureContextReady(): Promise<boolean> {
    this.init();
    if (!this.ctx) return false;

    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (e) {
        // Resume failed (likely no user gesture yet)
        return false;
      }
    }
    return this.ctx.state === 'running';
  }

  // Soft high-pitched click for buttons
  public async playClick() {
    if (!this.enabled) return;
    
    // Click is a user gesture, so we can try to resume
    const ready = await this.ensureContextReady();
    if (!ready || !this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch (e) {
      // Ignore audio errors
    }
  }

  // Very subtle tick for hover
  public playHover() {
    if (!this.enabled) return;
    this.init();
    
    // HOVER is NOT a user gesture. Do not attempt to resume.
    // If suspended, just silently fail.
    if (!this.ctx || this.ctx.state !== 'running' || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      // Ignore
    }
  }

  // A major chord swell for "Success" or "Reveal" events (Ethereal feel)
  public async playCelestialChord() {
    if (!this.enabled) return;
    
    // This is usually triggered by a completion event, which might be async after a click.
    // We try to resume, but if it fails (because the async gap broke the gesture token), we skip.
    const ready = await this.ensureContextReady();
    if (!ready || !this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      // C Major 7 chord frequencies (C4, E4, G4, B4) + C5
      const freqs = [261.63, 329.63, 392.00, 493.88, 523.25];

      freqs.forEach((f, i) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.type = 'sine';
        osc.frequency.value = f;

        // Staggered entrance
        const start = now + (i * 0.05);
        const duration = 2.5;

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.1 / freqs.length, start + 0.5); // Fade in
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration); // Fade out

        osc.start(start);
        osc.stop(start + duration);
      });
    } catch (e) {
      // Ignore
    }
  }

  // Futuristic swoosh for processing/analyzing
  public async playProcessingStart() {
    if (!this.enabled) return;
    
    const ready = await this.ensureContextReady();
    if (!ready || !this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch (e) {
      // Ignore
    }
  }
}

export const soundEngine = new SoundEngine();
