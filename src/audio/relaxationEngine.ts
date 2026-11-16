/**
 * @license
 * SPDX-License-Identifier: MIT
 * Unified Zen & Sleep Continuous Audio Engine for Nebula Core
 */

import { globalPiano } from './pianoEngine';

export type NoiseMode = 'OFF' | 'BROWN' | 'PINK' | 'WHITE';
export type ZenPresetId = 'DELTA_BROWN' | 'HZ_432' | 'HZ_528' | 'BOWL_THETA';

export interface SolfeggioTone {
  id: string;
  name: string;
  freq: number;
  label: string;
  description: string;
}

export const SOLFEGGIO_TONES: SolfeggioTone[] = [
  { id: '174', name: '174 Hz', freq: 174, label: 'Sollievo & Sicurezza', description: 'Rilascio tensioni fisiche e radicamento profondo' },
  { id: '285', name: '285 Hz', freq: 285, label: 'Rigenerazione Quantica', description: 'Rinnovamento cellulare' },
  { id: '396', name: '396 Hz', freq: 396, label: 'Liberazione & Pace', description: 'Dissolve ansia e tensioni' },
  { id: '432', name: '432 Hz', freq: 432, label: 'Armonia Universale', description: 'Accordo aureo naturale' },
  { id: '528', name: '528 Hz', freq: 528, label: 'Frequenza dei Miracoli', description: 'Chiarezza mentale e armonia' },
  { id: '639', name: '639 Hz', freq: 639, label: 'Connessione & Cuore', description: 'Apertura empatica' },
  { id: '852', name: '852 Hz', freq: 852, label: 'Intuizione & Spirito', description: 'Ordine superiore' },
  { id: '963', name: '963 Hz', freq: 963, label: 'Coscienza Cosmica', description: 'Unione cosmica' },
];

export interface BinauralPreset {
  id: string;
  name: string;
  band: 'Delta' | 'Theta' | 'Alpha';
  beatFreq: number;
  carrier: number;
  description: string;
}

export const BINAURAL_PRESETS: BinauralPreset[] = [
  { id: 'delta-deep', name: 'Delta (2.0 Hz)', band: 'Delta', beatFreq: 2.0, carrier: 180, description: 'Sonno profondo' },
  { id: 'theta-meditation', name: 'Theta (6.0 Hz)', band: 'Theta', beatFreq: 6.0, carrier: 200, description: 'Meditazione profonda' },
  { id: 'alpha-peace', name: 'Alpha (10.0 Hz)', band: 'Alpha', beatFreq: 10.0, carrier: 200, description: 'Calma vigile' },
];

export class RelaxationEngine {
  private audioCtx: AudioContext | null = null;
  private outputGain: GainNode | null = null;
  private toneBusGain: GainNode | null = null;
  private noiseBusGain: GainNode | null = null;

  public isMuted = false;
  public masterVolume = 1.0;

  // Screenshot defaults for ZEN & SLEEP · SORGENTI CONTINUE
  public activePresetId: ZenPresetId | null = null;
  public toneFreq = 528;
  public isToneActive = false;

  public binauralHz = 6.0;
  public binauralCarrier = 200;
  public isBinauralActive = true;

  public noiseMode: NoiseMode = 'OFF';
  public isBowlActive = true;
  public isBreathActive = false;

  public toneVolume = 0.35; // 35%
  public noiseVolume = 0.20; // 20%

  public timerMinutes = 15;
  public sleepTimerRemainingSec = 0;
  public isTimerRunning = false;
  private sleepTimerInterval: number | null = null;
  private sleepTimerStartTimestamp = 0;
  private sleepTimerInitialSec = 0;

  // Running Web Audio nodes
  private toneOsc: OscillatorNode | null = null;
  private toneGain: GainNode | null = null;

  private binLeftOsc: OscillatorNode | null = null;
  private binRightOsc: OscillatorNode | null = null;
  private binGain: GainNode | null = null;

  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;
  private noiseNodeGain: GainNode | null = null;

  private bowlOscs: OscillatorNode[] = [];
  private bowlLfo: OscillatorNode | null = null;
  private bowlGain: GainNode | null = null;

  private hasStartedDefaults = false;

  public onTimerTick: ((remainingSec: number) => void) | null = null;
  public onTimerComplete: (() => void) | null = null;
  public onStateChange: (() => void) | null = null;

  private emitChange() {
    if (this.onStateChange) this.onStateChange();
  }

  private initContext() {
    if (this.audioCtx) return;
    try {
      this.audioCtx = globalPiano.getContext();
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioCtxClass();
      }

      this.outputGain = this.audioCtx.createGain();
      this.outputGain.gain.setValueAtTime(this.isMuted ? 0.0001 : this.masterVolume, this.audioCtx.currentTime);

      this.toneBusGain = this.audioCtx.createGain();
      this.toneBusGain.gain.setValueAtTime(this.toneVolume, this.audioCtx.currentTime);

      this.noiseBusGain = this.audioCtx.createGain();
      this.noiseBusGain.gain.setValueAtTime(this.noiseVolume, this.audioCtx.currentTime);

      this.toneBusGain.connect(this.outputGain);
      this.noiseBusGain.connect(this.outputGain);

      const limiter = globalPiano.getAudioDestinationNode();
      if (limiter && limiter.context === this.audioCtx) {
        this.outputGain.connect(limiter);
      } else {
        this.outputGain.connect(this.audioCtx.destination);
      }
    } catch (e) {
      console.warn("RelaxationEngine: AudioContext initialization deferred", e);
    }
  }

  public async resume() {
    this.initContext();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
  }

  public async unlockAndStartDefaults(muted: boolean) {
    this.isMuted = muted;
    await this.resume();
    this.updateOutputGain();
    if (!this.hasStartedDefaults) {
      this.hasStartedDefaults = true;
      this.syncNodesToState();
    }
  }

  private updateOutputGain() {
    if (!this.audioCtx || !this.outputGain) return;
    const now = this.audioCtx.currentTime;
    const target = this.isMuted ? 0.0001 : Math.max(0.0001, this.masterVolume);
    this.outputGain.gain.cancelScheduledValues(now);
    this.outputGain.gain.setTargetAtTime(target, now, 0.04);
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    this.updateOutputGain();
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    this.updateOutputGain();
  }

  private syncNodesToState() {
    if (!this.audioCtx || this.audioCtx.state === 'suspended') return;
    if (this.isToneActive) this.startToneNode(); else this.stopToneNode();
    if (this.isBinauralActive) this.startBinauralNodes(); else this.stopBinauralNodes();
    if (this.isBowlActive) this.startBowlNodes(); else this.stopBowlNodes();
    if (this.noiseMode !== 'OFF') this.startNoiseNode(this.noiseMode); else this.stopNoiseNode();
  }

  // --- SOLFEGGIO / PURE TONE ---
  private startToneNode() {
    if (!this.audioCtx || !this.toneBusGain) return;
    const now = this.audioCtx.currentTime;
    if (this.toneOsc && this.toneGain) {
      this.toneOsc.frequency.setTargetAtTime(this.toneFreq, now, 0.05);
      return;
    }
    const osc = this.audioCtx.createOscillator();
    const g = this.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(this.toneFreq, now);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.28, now + 0.8);
    osc.connect(g);
    g.connect(this.toneBusGain);
    osc.start(now);
    this.toneOsc = osc;
    this.toneGain = g;
  }

  private stopToneNode() {
    if (!this.toneOsc || !this.toneGain || !this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    const osc = this.toneOsc;
    const g = this.toneGain;
    this.toneOsc = null;
    this.toneGain = null;
    try {
      g.gain.setTargetAtTime(0.0001, now, 0.12);
      setTimeout(() => { try { osc.stop(); osc.disconnect(); g.disconnect(); } catch (_) {} }, 500);
    } catch (_) {}
  }

  public toggleTone() {
    this.isToneActive = !this.isToneActive;
    this.resume().then(() => {
      if (this.isToneActive) this.startToneNode(); else this.stopToneNode();
    });
    this.emitChange();
  }

  public setToneFreq(hz: number) {
    this.toneFreq = Math.max(100, Math.min(1000, hz));
    if (this.toneOsc && this.audioCtx) {
      this.toneOsc.frequency.setTargetAtTime(this.toneFreq, this.audioCtx.currentTime, 0.05);
    }
    this.emitChange();
  }

  // --- BINAURAL BEATS ---
  private startBinauralNodes() {
    if (!this.audioCtx || !this.toneBusGain) return;
    const now = this.audioCtx.currentTime;
    const leftF = this.binauralCarrier - this.binauralHz * 0.5;
    const rightF = this.binauralCarrier + this.binauralHz * 0.5;

    if (this.binLeftOsc && this.binRightOsc && this.binGain) {
      this.binLeftOsc.frequency.setTargetAtTime(leftF, now, 0.06);
      this.binRightOsc.frequency.setTargetAtTime(rightF, now, 0.06);
      return;
    }

    const leftOsc = this.audioCtx.createOscillator();
    const rightOsc = this.audioCtx.createOscillator();
    leftOsc.type = 'sine';
    rightOsc.type = 'sine';
    leftOsc.frequency.setValueAtTime(leftF, now);
    rightOsc.frequency.setValueAtTime(rightF, now);

    const bGain = this.audioCtx.createGain();
    bGain.gain.setValueAtTime(0.0001, now);
    bGain.gain.linearRampToValueAtTime(0.32, now + 0.9);

    if (this.audioCtx.createStereoPanner) {
      const pL = this.audioCtx.createStereoPanner();
      const pR = this.audioCtx.createStereoPanner();
      pL.pan.setValueAtTime(-1.0, now);
      pR.pan.setValueAtTime(1.0, now);
      leftOsc.connect(pL);
      rightOsc.connect(pR);
      pL.connect(bGain);
      pR.connect(bGain);
    } else {
      const merger = this.audioCtx.createChannelMerger(2);
      leftOsc.connect(merger, 0, 0);
      rightOsc.connect(merger, 0, 1);
      merger.connect(bGain);
    }

    bGain.connect(this.toneBusGain);
    leftOsc.start(now);
    rightOsc.start(now);

    this.binLeftOsc = leftOsc;
    this.binRightOsc = rightOsc;
    this.binGain = bGain;
  }

  private stopBinauralNodes() {
    if (!this.binLeftOsc || !this.binGain || !this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    const l = this.binLeftOsc;
    const r = this.binRightOsc;
    const g = this.binGain;
    this.binLeftOsc = null;
    this.binRightOsc = null;
    this.binGain = null;
    try {
      g.gain.setTargetAtTime(0.0001, now, 0.15);
      setTimeout(() => {
        try { l?.stop(); l?.disconnect(); r?.stop(); r?.disconnect(); g?.disconnect(); } catch (_) {}
      }, 600);
    } catch (_) {}
  }

  public toggleBinaural() {
    this.isBinauralActive = !this.isBinauralActive;
    this.resume().then(() => {
      if (this.isBinauralActive) this.startBinauralNodes(); else this.stopBinauralNodes();
    });
    this.emitChange();
  }

  public setBinauralHz(hz: number) {
    this.binauralHz = Math.max(0.5, Math.min(40, hz));
    if (this.binLeftOsc && this.binRightOsc && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      this.binLeftOsc.frequency.setTargetAtTime(this.binauralCarrier - this.binauralHz * 0.5, now, 0.06);
      this.binRightOsc.frequency.setTargetAtTime(this.binauralCarrier + this.binauralHz * 0.5, now, 0.06);
    }
    this.emitChange();
  }

  // --- COLORED NOISE (BROWN / PINK / WHITE) ---
  private createNoiseBuffer(mode: NoiseMode): AudioBuffer | null {
    if (!this.audioCtx || mode === 'OFF') return null;
    const bufferSize = this.audioCtx.sampleRate * 4;
    const buffer = this.audioCtx.createBuffer(2, bufferSize, this.audioCtx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      if (mode === 'BROWN') {
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          lastOut = (lastOut + 0.025 * white) / 1.025;
          data[i] = lastOut * 3.2;
        }
      } else if (mode === 'PINK') {
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }
      } else {
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.35;
        }
      }
    }
    return buffer;
  }

  private startNoiseNode(mode: NoiseMode) {
    this.stopNoiseNode();
    if (!this.audioCtx || !this.noiseBusGain || mode === 'OFF') return;
    const buffer = this.createNoiseBuffer(mode);
    if (!buffer) return;
    const now = this.audioCtx.currentTime;
    const src = this.audioCtx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(mode === 'BROWN' ? 420 : mode === 'PINK' ? 1800 : 8000, now);

    const g = this.audioCtx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.75, now + 0.9);

    src.connect(filter);
    filter.connect(g);
    g.connect(this.noiseBusGain);
    src.start(now);

    this.noiseSource = src;
    this.noiseFilter = filter;
    this.noiseNodeGain = g;
  }

  private stopNoiseNode() {
    if (!this.noiseSource || !this.noiseNodeGain || !this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    const s = this.noiseSource;
    const f = this.noiseFilter;
    const g = this.noiseNodeGain;
    this.noiseSource = null;
    this.noiseFilter = null;
    this.noiseNodeGain = null;
    try {
      g.gain.setTargetAtTime(0.0001, now, 0.15);
      setTimeout(() => {
        try { s.stop(); s.disconnect(); f?.disconnect(); g.disconnect(); } catch (_) {}
      }, 600);
    } catch (_) {}
  }

  public setNoiseMode(mode: NoiseMode) {
    this.noiseMode = mode;
    this.resume().then(() => {
      if (mode === 'OFF') this.stopNoiseNode(); else this.startNoiseNode(mode);
    });
    this.emitChange();
  }

  // --- HARMONIC TIBETAN BOWL ---
  private startBowlNodes() {
    if (!this.audioCtx || !this.toneBusGain) return;
    if (this.bowlOscs.length > 0 && this.bowlGain) return;
    const now = this.audioCtx.currentTime;
    const baseFreq = 108.0;
    const partials: { ratio: number; gain: number; type: OscillatorType }[] = [
      { ratio: 1.0, gain: 0.42, type: 'sine' },
      { ratio: 2.76, gain: 0.20, type: 'sine' },
      { ratio: 5.40, gain: 0.08, type: 'sine' },
      { ratio: 0.5, gain: 0.28, type: 'triangle' },
    ];

    const masterBowlGain = this.audioCtx.createGain();
    masterBowlGain.gain.setValueAtTime(0.0001, now);
    masterBowlGain.gain.linearRampToValueAtTime(0.32, now + 1.4);

    const lfo = this.audioCtx.createOscillator();
    lfo.frequency.setValueAtTime(0.09, now);
    const lfoGain = this.audioCtx.createGain();
    lfoGain.gain.setValueAtTime(0.08, now);
    lfo.connect(lfoGain);

    const list: OscillatorNode[] = [];
    partials.forEach(p => {
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const pg = this.audioCtx.createGain();
      osc.type = p.type;
      osc.frequency.setValueAtTime(baseFreq * p.ratio, now);
      pg.gain.setValueAtTime(p.gain, now);
      lfoGain.connect(pg.gain);
      osc.connect(pg);
      pg.connect(masterBowlGain);
      osc.start(now);
      list.push(osc);
    });

    lfo.start(now);
    masterBowlGain.connect(this.toneBusGain);

    this.bowlOscs = list;
    this.bowlLfo = lfo;
    this.bowlGain = masterBowlGain;
  }

  private stopBowlNodes() {
    if (this.bowlOscs.length === 0 || !this.bowlGain || !this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    const oscs = [...this.bowlOscs];
    const lfo = this.bowlLfo;
    const g = this.bowlGain;
    this.bowlOscs = [];
    this.bowlLfo = null;
    this.bowlGain = null;
    try {
      g.gain.setTargetAtTime(0.0001, now, 0.2);
      setTimeout(() => {
        try {
          oscs.forEach(o => { o.stop(); o.disconnect(); });
          lfo?.stop(); lfo?.disconnect(); g.disconnect();
        } catch (_) {}
      }, 800);
    } catch (_) {}
  }

  public toggleBowl() {
    this.isBowlActive = !this.isBowlActive;
    this.resume().then(() => {
      if (this.isBowlActive) this.startBowlNodes(); else this.stopBowlNodes();
    });
    this.emitChange();
  }

  public toggleBreath() {
    this.isBreathActive = !this.isBreathActive;
    this.emitChange();
  }

  public getBreathFactor(timeSec: number): number {
    if (!this.isBreathActive) return 0;
    // 12-second smooth inhale-hold-exhale cycle
    const phase = (timeSec % 12) / 12;
    return Math.sin(phase * Math.PI * 2);
  }

  // --- VOLUMES ---
  public setToneVolume(vol: number) {
    this.toneVolume = Math.max(0, Math.min(1, vol));
    if (this.toneBusGain && this.audioCtx) {
      this.toneBusGain.gain.setTargetAtTime(this.toneVolume, this.audioCtx.currentTime, 0.05);
    }
    this.emitChange();
  }

  public setNoiseVolume(vol: number) {
    this.noiseVolume = Math.max(0, Math.min(1, vol));
    if (this.noiseBusGain && this.audioCtx) {
      this.noiseBusGain.gain.setTargetAtTime(this.noiseVolume, this.audioCtx.currentTime, 0.05);
    }
    this.emitChange();
  }

  // --- ZEN PRESET CHIPS ---
  public applyZenPreset(presetId: ZenPresetId) {
    this.activePresetId = presetId;
    if (presetId === 'DELTA_BROWN') {
      this.isToneActive = false;
      this.isBinauralActive = true;
      this.binauralHz = 2.0;
      this.noiseMode = 'BROWN';
      this.isBowlActive = false;
    } else if (presetId === 'HZ_432') {
      this.toneFreq = 432;
      this.isToneActive = true;
      this.isBinauralActive = false;
      this.noiseMode = 'OFF';
      this.isBowlActive = false;
    } else if (presetId === 'HZ_528') {
      this.toneFreq = 528;
      this.isToneActive = true;
      this.isBinauralActive = false;
      this.noiseMode = 'OFF';
      this.isBowlActive = false;
    } else if (presetId === 'BOWL_THETA') {
      this.isToneActive = false;
      this.isBinauralActive = true;
      this.binauralHz = 6.0;
      this.noiseMode = 'OFF';
      this.isBowlActive = true;
    }
    this.resume().then(() => this.syncNodesToState());
    this.emitChange();
  }

  public applyDefaults(syncRunningAudio = true) {
    this.activePresetId = null;
    this.toneFreq = 528;
    this.isToneActive = false;
    this.binauralHz = 6.0;
    this.isBinauralActive = true;
    this.noiseMode = 'OFF';
    this.isBowlActive = true;
    this.isBreathActive = false;
    this.toneVolume = 0.35;
    this.noiseVolume = 0.20;
    this.timerMinutes = 15;
    if (syncRunningAudio && this.audioCtx && this.audioCtx.state === 'running') {
      this.setToneVolume(0.35);
      this.setNoiseVolume(0.20);
      this.syncNodesToState();
    }
    this.emitChange();
  }

  // --- SLEEP TIMER ---
  public setTimerMinutes(minutes: number) {
    this.timerMinutes = minutes;
    this.emitChange();
  }

  public startSleepTimer(minutes?: number) {
    if (minutes !== undefined) this.timerMinutes = minutes;
    if (this.sleepTimerInterval !== null) {
      window.clearInterval(this.sleepTimerInterval);
      this.sleepTimerInterval = null;
    }
    if (this.timerMinutes <= 0) {
      this.isTimerRunning = false;
      this.sleepTimerRemainingSec = 0;
      this.emitChange();
      return;
    }

    const totalSec = this.timerMinutes * 60;
    this.sleepTimerInitialSec = totalSec;
    this.sleepTimerRemainingSec = totalSec;
    this.sleepTimerStartTimestamp = Date.now();
    this.isTimerRunning = true;
    if (this.onTimerTick) this.onTimerTick(totalSec);
    this.emitChange();

    this.sleepTimerInterval = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.sleepTimerStartTimestamp) / 1000);
      const rem = Math.max(0, this.sleepTimerInitialSec - elapsed);
      this.sleepTimerRemainingSec = rem;
      if (this.onTimerTick) this.onTimerTick(rem);

      const fadeWindow = Math.min(60, Math.floor(this.sleepTimerInitialSec * 0.25));
      if (rem <= fadeWindow && this.outputGain && this.audioCtx && !this.isMuted) {
        const factor = Math.max(0.0001, rem / Math.max(1, fadeWindow));
        this.outputGain.gain.setTargetAtTime(this.masterVolume * factor, this.audioCtx.currentTime, 0.3);
      }

      if (rem <= 0) {
        this.stopAllRelaxation();
        this.stopSleepTimer();
        if (this.onTimerComplete) this.onTimerComplete();
      }
    }, 1000);
  }

  public stopSleepTimer() {
    if (this.sleepTimerInterval !== null) {
      window.clearInterval(this.sleepTimerInterval);
      this.sleepTimerInterval = null;
    }
    this.isTimerRunning = false;
    this.sleepTimerRemainingSec = 0;
    this.updateOutputGain();
    this.emitChange();
  }

  public stopAllRelaxation() {
    this.isToneActive = false;
    this.isBinauralActive = false;
    this.isBowlActive = false;
    this.noiseMode = 'OFF';
    this.stopToneNode();
    this.stopBinauralNodes();
    this.stopBowlNodes();
    this.stopNoiseNode();
    this.emitChange();
  }

  public dispose() {
    this.stopAllRelaxation();
    this.stopSleepTimer();
  }
}

export const globalRelaxation = new RelaxationEngine();
