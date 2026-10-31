/**
 * @license
 * SPDX-License-Identifier: MIT
 */

export const PENTATONIC_FREQS = [
  130.81, 146.83, 164.81, 196.00, 220.00, // C3, D3, E3, G3, A3
  261.63, 293.66, 329.63, 392.00, 440.00, // C4, D4, E4, G4, A4
  523.25, 587.33, 659.25, 783.99, 880.00  // C5, D5, E5, G5, A5
];

export const PENTATONIC_MIDI = [
  48, 50, 52, 55, 57, // C3, D3, E3, G3, A3
  60, 62, 64, 67, 69, // C4, D4, E4, G4, A4
  72, 74, 76, 79, 81  // C5, D5, E5, G5, A5
];

export const NOTE_NAMES = [
  "C3", "D3", "E3", "G3", "A3",
  "C4", "D4", "E4", "G4", "A4",
  "C5", "D5", "E5", "G5", "A5"
];

export class PianoEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private reverbGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Web MIDI Out for DAW integration (Logic Pro, Ableton, Reaper)
  public isMidiActive = false;
  public midiDeviceName = "OFFLINE";
  private midiOutputs: any[] = [];
  public onMidiStatusChange: ((connected: boolean, name: string) => void) | null = null;

  public volume = 0.8;
  public reverb = 0.65;
  public brightness = 0.75;
  public triggerRateMs = 160;

  private lastNoteIdx = -1;
  private lastStrikeTime = 0;
  private lastHandClosedState = false;

  public onNoteTrigger: ((noteName: string, index: number, freq: number) => void) | null = null;

  public init() {
    if (this.audioCtx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();

      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);

      this.dryGain = this.audioCtx.createGain();
      this.dryGain.gain.setValueAtTime(1.0 - this.reverb * 0.5, this.audioCtx.currentTime);

      this.reverbGain = this.audioCtx.createGain();
      this.reverbGain.gain.setValueAtTime(this.reverb, this.audioCtx.currentTime);

      // Procedural Cathedral Impulse Response
      const duration = 2.8;
      const decay = 2.0;
      const rate = this.audioCtx.sampleRate;
      const length = Math.floor(rate * duration);
      const impulse = this.audioCtx.createBuffer(2, length, rate);
      const left = impulse.getChannelData(0);
      const right = impulse.getChannelData(1);

      for (let i = 0; i < length; i++) {
        const t = i / rate;
        const env = Math.exp(-t * decay);
        left[i] = ((Math.random() * 2) - 1) * env;
        right[i] = ((Math.random() * 2) - 1) * env;
      }

      this.reverbNode = this.audioCtx.createConvolver();
      this.reverbNode.buffer = impulse;

      // Dynamics Compressor (Limiter) for anti-clipping
      this.limiter = this.audioCtx.createDynamicsCompressor();
      this.limiter.threshold.setValueAtTime(-3.0, this.audioCtx.currentTime);
      this.limiter.knee.setValueAtTime(6.0, this.audioCtx.currentTime);
      this.limiter.ratio.setValueAtTime(16.0, this.audioCtx.currentTime);
      this.limiter.attack.setValueAtTime(0.003, this.audioCtx.currentTime);
      this.limiter.release.setValueAtTime(0.15, this.audioCtx.currentTime);

      // Output Analyser for Visualizer
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 128;

      this.dryGain.connect(this.masterGain);
      this.reverbGain.connect(this.reverbNode);
      this.reverbNode.connect(this.masterGain);

      this.masterGain.connect(this.limiter);
      this.limiter.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
    } catch (err) {
      console.warn("PianoEngine audio init deferred until user interaction", err);
    }
  }

  public async resume() {
    if (!this.audioCtx) this.init();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
    if (!this.isMidiActive) {
      this.initMidi().catch(() => {});
    }
  }

  public async initMidi(): Promise<boolean> {
    if (this.isMidiActive && this.midiOutputs.length > 0) return true;
    try {
      const nav = navigator as any;
      if (nav.requestMIDIAccess) {
        const midiAccess = await nav.requestMIDIAccess({ sysex: false });
        this.midiOutputs = [];
        let primaryName = "";
        for (const output of midiAccess.outputs.values()) {
          this.midiOutputs.push(output);
          if (!primaryName || output.name?.includes("IAC") || output.name?.includes("Bus")) {
            primaryName = output.name || "MIDI Out";
          }
        }
        if (this.midiOutputs.length > 0) {
          this.isMidiActive = true;
          this.midiDeviceName = primaryName;
          if (this.onMidiStatusChange) this.onMidiStatusChange(true, primaryName);
          return true;
        } else {
          this.midiDeviceName = "Nessuna porta MIDI";
          if (this.onMidiStatusChange) this.onMidiStatusChange(false, this.midiDeviceName);
        }
      } else {
        this.midiDeviceName = "Web MIDI non supportato";
      }
    } catch (e) {
      this.midiDeviceName = "Permesso MIDI negato";
      if (this.onMidiStatusChange) this.onMidiStatusChange(false, this.midiDeviceName);
    }
    return false;
  }

  public sendMidiNoteOn(pitch: number, velocity = 0.8) {
    if (!this.isMidiActive || this.midiOutputs.length === 0) return;
    const velByte = Math.max(1, Math.min(127, Math.floor(velocity * 127)));
    for (const out of this.midiOutputs) {
      try {
        out.send([0x90, pitch, velByte]);
      } catch (err) {}
    }
  }

  public sendMidiNoteOff(pitch: number) {
    if (!this.isMidiActive || this.midiOutputs.length === 0) return;
    for (const out of this.midiOutputs) {
      try {
        out.send([0x80, pitch, 0]);
      } catch (err) {}
    }
  }

  public sendMidiCC(controller: number, value0to127: number) {
    if (!this.isMidiActive || this.midiOutputs.length === 0) return;
    const valByte = Math.max(0, Math.min(127, Math.floor(value0to127)));
    for (const out of this.midiOutputs) {
      try {
        out.send([0xB0, controller, valByte]);
      } catch (err) {}
    }
  }

  public playNote(freq: number, velocity = 0.8) {
    this.resume();
    if (!this.audioCtx || !this.dryGain || !this.reverbGain) return;

    const now = this.audioCtx.currentTime;
    const noteGain = this.audioCtx.createGain();
    const stringFilter = this.audioCtx.createBiquadFilter();

    // Harmonic soundboard filter
    const baseCutoff = 1000 + this.brightness * 7500;
    stringFilter.type = "lowpass";
    stringFilter.frequency.setValueAtTime(baseCutoff, now);
    stringFilter.frequency.exponentialRampToValueAtTime(Math.max(160, baseCutoff * 0.15), now + 1.8);

    // Hammer strike ADSR
    const attackTime = 0.003;
    const sustainTime = 2.2;
    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.linearRampToValueAtTime(velocity * 0.65, now + attackTime);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + sustainTime);

    // Primary oscillating string (triangle + warm sine)
    const osc1 = this.audioCtx.createOscillator();
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(freq, now);

    const osc2 = this.audioCtx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(freq * 1.0018, now); // acoustic chorus detune

    // 2nd Harmonic
    const osc3 = this.audioCtx.createOscillator();
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(freq * 2.0, now);
    const hGain = this.audioCtx.createGain();
    hGain.gain.setValueAtTime(0.28 * this.brightness, now);
    osc3.connect(hGain);

    // Hammer felt strike click
    const click = this.audioCtx.createOscillator();
    click.type = "sine";
    click.frequency.setValueAtTime(Math.min(1800, freq * 3.5), now);
    const clickGain = this.audioCtx.createGain();
    clickGain.gain.setValueAtTime(velocity * 0.35, now);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
    click.connect(clickGain);
    clickGain.connect(stringFilter);

    osc1.connect(stringFilter);
    osc2.connect(stringFilter);
    hGain.connect(stringFilter);

    stringFilter.connect(noteGain);
    noteGain.connect(this.dryGain);
    noteGain.connect(this.reverbGain);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);
    click.start(now);

    osc1.stop(now + sustainTime);
    osc2.stop(now + sustainTime);
    osc3.stop(now + sustainTime);
    click.stop(now + 0.03);

    // Find note index & dispatch MIDI Note On/Off
    const noteIdx = PENTATONIC_FREQS.findIndex(f => Math.abs(f - freq) < 1.0);
    if (noteIdx !== -1) {
      const midiPitch = PENTATONIC_MIDI[noteIdx] || 60;
      this.sendMidiNoteOn(midiPitch, velocity);
      setTimeout(() => this.sendMidiNoteOff(midiPitch), Math.min(1600, sustainTime * 800));
      if (this.onNoteTrigger) {
        this.onNoteTrigger(NOTE_NAMES[noteIdx], noteIdx, freq);
      }
    }
  }

  public updateFromCoordinates(normX: number, normY: number, isClosed: boolean, options = { trigGesture: true, trigPinch: true }) {
    const nowMs = performance.now();
    const idx = Math.min(PENTATONIC_FREQS.length - 1, Math.max(0, Math.floor((1 - normY) * PENTATONIC_FREQS.length)));
    const freq = PENTATONIC_FREQS[idx];

    // Real-time MIDI CC stream for Logic Pro modulation:
    // CC 1: Mod Wheel from horizontal hand/pointer position (normX)
    // CC 74: Filter Cutoff / Brightness from vertical position (1 - normY)
    // CC 11: Expression / Volume dynamics
    this.sendMidiCC(1, normX * 127);
    this.sendMidiCC(74, (1 - normY) * 127);
    this.sendMidiCC(11, isClosed ? 127 : 75);

    // Gesture Pitch
    if (options.trigGesture && (idx !== this.lastNoteIdx) && (nowMs - this.lastStrikeTime > this.triggerRateMs)) {
      this.playNote(freq, isClosed ? 0.95 : 0.72);
      this.lastNoteIdx = idx;
      this.lastStrikeTime = nowMs;
    }

    // Pinch / Closed Hand chord
    if (options.trigPinch && isClosed && !this.lastHandClosedState && (nowMs - this.lastStrikeTime > 120)) {
      this.playNote(PENTATONIC_FREQS[0], 1.0);
      setTimeout(() => this.playNote(PENTATONIC_FREQS[2], 0.8), 60);
      this.lastStrikeTime = nowMs;
    }
    this.lastHandClosedState = isClosed;
  }

  public triggerCollision(intensity = 0.6) {
    const nowMs = performance.now();
    if (nowMs - this.lastStrikeTime > 220) {
      const randIdx = Math.floor(Math.random() * PENTATONIC_FREQS.length);
      this.playNote(PENTATONIC_FREQS[randIdx], Math.min(1.0, 0.4 + intensity * 0.5));
      this.lastStrikeTime = nowMs;
    }
  }

  public setVolume(v: number) {
    this.volume = v;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(v, this.audioCtx.currentTime);
    }
  }

  public setReverb(r: number) {
    this.reverb = r;
    if (this.reverbGain && this.dryGain && this.audioCtx) {
      this.reverbGain.gain.setValueAtTime(r, this.audioCtx.currentTime);
      this.dryGain.gain.setValueAtTime(1.0 - r * 0.5, this.audioCtx.currentTime);
    }
  }

  public setBrightness(b: number) {
    this.brightness = b;
  }

  public getAudioDestinationNode(): AudioNode | null {
    return this.limiter;
  }

  public getEnergyLevel(): number {
    if (!this.analyser) return 0;
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += data[i];
    return (sum / data.length) / 255;
  }

  public dispose() {
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
  }
}

export const globalPiano = new PianoEngine();
