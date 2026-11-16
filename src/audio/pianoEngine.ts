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
  private synthBus: GainNode | null = null;
  private spatialPannerNode: StereoPannerNode | null = null;

  // Web MIDI Out for DAW integration (Logic Pro, Ableton, Reaper)
  public isMidiActive = false;
  public midiDeviceName = "OFFLINE";
  private midiOutputs: any[] = [];
  public midiChannel = 1;
  public midiNotesEnabled = true;
  public midiCCEnabled = true;
  public onMidiStatusChange: ((connected: boolean, name: string) => void) | null = null;

  public volume = 0.8;
  public reverb = 1.0;
  public brightness = 0.2;
  public triggerRateMs = 160;
  public isMuted = false;

  // Harmonic Suite & 3D Spatial defaults matching screenshot
  public isSpatial3DOn = true;
  public isKineticNotesOn = true;
  public pianoProfile: 'PIANO' | 'CRYSTAL' | 'PAD' | 'DRONE' = 'DRONE';
  public arpPattern = 'POLY_4_3';
  public arpDivision = '1/4';
  public chordType = 'COSMIC7';
  public chordResonance = 0.05;
  public attackSoftness = 2.0;
  public sustainTail = 6.0;
  public noteDamping = 1.0;
  public kineticMode: 'ONSET' | 'CONTINUOUS' = 'ONSET';
  public triggerThreshold = 0.1;
  public kineticSensitivity = 0.1;

  private lastNoteIdx = -1;
  private lastStrikeTime = 0;
  private lastHandClosedState = false;
  private kBase = 0;
  private kDamp = 0;
  private kJit = 1;
  private kPrevNow = 0;
  private kLastNoteTime = 0;
  private kLastIdx = -1;
  private arpStep = 0;

  // Lead Trance V16 (Globuli) state
  public isGlobulePresetActive = false;
  public isGlobuleLeadOn = true;
  public globuleLeadLevel = 0.55;
  public globuleLeadBpm = 128;
  public globuleLeadStatus = '⚡ V16 LEAD • Pronto';
  public onGlobuleLeadStatus: ((status: string) => void) | null = null;
  private globuleLeadNextAt = 0;
  private globuleLeadStep = 0;
  private globuleLeadBar = 0;
  private readonly GLOBULE_PHRASES: Record<number, Record<number, number>> = {
    0: { 0: 0, 8: 2 },
    1: { 0: 4, 8: 2 },
    2: { 0: 5, 8: 4 },
    3: { 0: 7, 10: 5 },
    4: { 0: 4, 6: 7, 12: 9 },
    5: { 0: 7, 6: 9, 12: 10 },
    6: { 0: 9, 4: 10, 8: 12, 12: 14 },
    7: { 0: 7 },
  };

  public onNoteTrigger: ((noteName: string, index: number, freq: number) => void) | null = null;

  public init() {
    if (this.audioCtx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();

      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0001 : this.volume, this.audioCtx.currentTime);

      this.dryGain = this.audioCtx.createGain();
      this.dryGain.gain.setValueAtTime(1.0 - this.reverb * 0.45, this.audioCtx.currentTime);

      this.reverbGain = this.audioCtx.createGain();
      this.reverbGain.gain.setValueAtTime(this.reverb, this.audioCtx.currentTime);

      // Smooth 3D spatial panner + acoustic stereo crossfeed (eliminates L<->R dead spot)
      this.synthBus = this.audioCtx.createGain();
      this.synthBus.gain.setValueAtTime(1.0, this.audioCtx.currentTime);

      if (this.audioCtx.createStereoPanner) {
        this.spatialPannerNode = this.audioCtx.createStereoPanner();
        this.spatialPannerNode.pan.setValueAtTime(0, this.audioCtx.currentTime);

        const splitter = this.audioCtx.createChannelSplitter(2);
        const merger = this.audioCtx.createChannelMerger(2);
        const lToL = this.audioCtx.createGain();
        const lToR = this.audioCtx.createGain();
        const rToR = this.audioCtx.createGain();
        const rToL = this.audioCtx.createGain();

        lToL.gain.setValueAtTime(0.88, this.audioCtx.currentTime);
        lToR.gain.setValueAtTime(0.22, this.audioCtx.currentTime);
        rToR.gain.setValueAtTime(0.88, this.audioCtx.currentTime);
        rToL.gain.setValueAtTime(0.22, this.audioCtx.currentTime);

        this.synthBus.connect(this.spatialPannerNode);
        this.spatialPannerNode.connect(splitter);
        splitter.connect(lToL, 0);
        splitter.connect(lToR, 0);
        splitter.connect(rToR, 1);
        splitter.connect(rToL, 1);

        lToL.connect(merger, 0, 0);
        rToL.connect(merger, 0, 0);
        rToR.connect(merger, 0, 1);
        lToR.connect(merger, 0, 1);

        merger.connect(this.dryGain);
        merger.connect(this.reverbGain);
      } else {
        this.synthBus.connect(this.dryGain);
        this.synthBus.connect(this.reverbGain);
      }

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

  public updateSpatialPan(wandererX: number) {
    if (!this.audioCtx || !this.spatialPannerNode) return;
    const now = this.audioCtx.currentTime;
    if (!this.isSpatial3DOn) {
      this.spatialPannerNode.pan.setTargetAtTime(0, now, 0.08);
      return;
    }
    const rawPan = Math.tanh((wandererX || 0) / 520) * 0.65;
    const clampedPan = Math.max(-0.65, Math.min(0.65, rawPan));
    this.spatialPannerNode.pan.setTargetAtTime(clampedPan, now, 0.08);
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (!this.masterGain || !this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(muted ? 0.0001 : Math.max(0.0001, this.volume), now, 0.03);
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
    if (!this.isMidiActive || !this.midiNotesEnabled || this.midiOutputs.length === 0) return;
    const ch = Math.max(0, Math.min(15, (this.midiChannel || 1) - 1));
    const velByte = Math.max(1, Math.min(127, Math.floor(velocity * 127)));
    for (const out of this.midiOutputs) {
      try {
        out.send([0x90 | ch, pitch, velByte]);
      } catch (err) {}
    }
  }

  public sendMidiNoteOff(pitch: number) {
    if (!this.isMidiActive || !this.midiNotesEnabled || this.midiOutputs.length === 0) return;
    const ch = Math.max(0, Math.min(15, (this.midiChannel || 1) - 1));
    for (const out of this.midiOutputs) {
      try {
        out.send([0x80 | ch, pitch, 0]);
      } catch (err) {}
    }
  }

  public sendMidiCC(controller: number, value0to127: number) {
    if (!this.isMidiActive || !this.midiCCEnabled || this.midiOutputs.length === 0) return;
    const ch = Math.max(0, Math.min(15, (this.midiChannel || 1) - 1));
    const valByte = Math.max(0, Math.min(127, Math.floor(value0to127)));
    for (const out of this.midiOutputs) {
      try {
        out.send([0xB0 | ch, controller, valByte]);
      } catch (err) {}
    }
  }

  public playNote(freq: number, velocity = 0.8) {
    // Dispatch MIDI Note On/Off even if audio is muted
    const noteIdx = PENTATONIC_FREQS.findIndex(f => Math.abs(f - freq) < 1.0);
    const baseAttack = this.pianoProfile === 'DRONE' ? Math.max(1.0, this.attackSoftness) : Math.max(0.008, this.attackSoftness * 0.15);
    const sustainTime = Math.max(0.6, Math.min(9.0, 0.8 + this.sustainTail * 0.65));

    if (noteIdx !== -1) {
      const midiPitch = PENTATONIC_MIDI[noteIdx] || 60;
      this.sendMidiNoteOn(midiPitch, velocity);
      setTimeout(() => this.sendMidiNoteOff(midiPitch), Math.min(2200, sustainTime * 500));
      if (this.onNoteTrigger) {
        this.onNoteTrigger(NOTE_NAMES[noteIdx], noteIdx, freq);
      }
    }

    if (this.isMuted) return;
    this.resume();
    if (!this.audioCtx || !this.synthBus || this.audioCtx.state === 'suspended') return;

    const now = this.audioCtx.currentTime;
    const noteGain = this.audioCtx.createGain();
    const stringFilter = this.audioCtx.createBiquadFilter();

    const baseCutoff = 480 + this.brightness * 6800;
    stringFilter.type = "lowpass";
    stringFilter.frequency.setValueAtTime(baseCutoff, now);
    stringFilter.frequency.exponentialRampToValueAtTime(Math.max(140, baseCutoff * 0.25), now + sustainTime * 0.85);

    const peakGain = velocity * (this.pianoProfile === 'DRONE' ? 0.34 : 0.55);
    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.linearRampToValueAtTime(peakGain, now + baseAttack);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + sustainTime);

    const osc1 = this.audioCtx.createOscillator();
    osc1.type = this.pianoProfile === 'DRONE' || this.pianoProfile === 'PAD' ? "sine" : "triangle";
    osc1.frequency.setValueAtTime(freq, now);

    const osc2 = this.audioCtx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(freq * 1.0022, now);

    const osc3 = this.audioCtx.createOscillator();
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(freq * (this.chordType === 'COSMIC7' ? 1.4983 : 2.0), now);
    const hGain = this.audioCtx.createGain();
    hGain.gain.setValueAtTime(0.18 * this.brightness + this.chordResonance * 0.35, now);
    osc3.connect(hGain);

    osc1.connect(stringFilter);
    osc2.connect(stringFilter);
    hGain.connect(stringFilter);

    stringFilter.connect(noteGain);
    noteGain.connect(this.synthBus);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    osc1.stop(now + sustainTime + 0.05);
    osc2.stop(now + sustainTime + 0.05);
    osc3.stop(now + sustainTime + 0.05);
  }

  public updateFromCoordinates(normX: number, normY: number, isClosed: boolean, options = { trigGesture: true, trigPinch: true }) {
    const nowMs = performance.now();
    const idx = Math.min(PENTATONIC_FREQS.length - 1, Math.max(0, Math.floor((1 - normY) * PENTATONIC_FREQS.length)));
    const freq = PENTATONIC_FREQS[idx];

    this.sendMidiCC(1, normX * 127);
    this.sendMidiCC(74, (1 - normY) * 127);
    this.sendMidiCC(11, isClosed ? 127 : 75);

    const effectiveRate = this.triggerRateMs * (1 + this.noteDamping * 0.5);
    if (!this.isGlobuleLeadIsolated() && options.trigGesture && (idx !== this.lastNoteIdx) && (nowMs - this.lastStrikeTime > effectiveRate)) {
      this.playNote(freq, isClosed ? 0.95 : 0.72);
      this.lastNoteIdx = idx;
      this.lastStrikeTime = nowMs;
    }

    if (!this.isGlobuleLeadIsolated() && options.trigPinch && isClosed && !this.lastHandClosedState && (nowMs - this.lastStrikeTime > 120)) {
      this.playNote(PENTATONIC_FREQS[0], 1.0);
      setTimeout(() => this.playNote(PENTATONIC_FREQS[2], 0.8), 60);
      this.lastStrikeTime = nowMs;
    }
    this.lastHandClosedState = isClosed;
  }

  public triggerCollision(intensity = 0.6) {
    if (this.isGlobuleLeadIsolated()) return;
    const nowMs = performance.now();
    const minGap = 220 * (1 + this.noteDamping * 0.7);
    if (nowMs - this.lastStrikeTime > minGap) {
      const randIdx = Math.floor(Math.random() * PENTATONIC_FREQS.length);
      this.playNote(PENTATONIC_FREQS[randIdx], Math.min(1.0, 0.4 + intensity * 0.5));
      this.lastStrikeTime = nowMs;
    }
  }

  public updateKineticEngine(
    collisionSpeed: number,
    now: number,
    isHandPresent: boolean,
    handY: number,
    nearWanderer: boolean,
    nearSpectra: boolean,
    collisionX?: number
  ) {
    if (!this.isKineticNotesOn || this.isGlobuleLeadIsolated()) return;
    if (this.isMuted && !this.isMidiActive) return;
    if (collisionSpeed <= 0.08) return;

    const flux = collisionSpeed * (0.45 + this.kineticSensitivity * 2.2);
    const dt = Math.max(0.001, Math.min(0.1, (now - this.kPrevNow) / 1000));
    this.kPrevNow = now;
    this.kBase += (flux - this.kBase) * (1 - Math.exp(-dt / 1.5));
    this.kDamp *= Math.exp(-dt / (0.4 + 2.4 * this.noteDamping));

    let baseCadence = 180;
    if (this.arpDivision === '1/4') baseCadence = 320;
    else if (this.arpDivision === '1/8') baseCadence = 180;
    else if (this.arpDivision === '1/16') baseCadence = 100;
    else if (this.arpDivision === 'TRIPLET') baseCadence = 130;

    const cadenceMs = Math.max(60, baseCadence - flux * 32);
    const gap = now - this.kLastNoteTime;
    if (gap < cadenceMs * this.kJit * (1 + this.kDamp * 1.4 * this.noteDamping)) return;

    const thr = this.triggerThreshold * (1 + this.kDamp * 0.85 * this.noteDamping);
    if (flux <= thr) return;

    if (this.kineticMode === 'ONSET') {
      const need = Math.max(thr * 0.25, 0.12 * this.kBase * (1 + this.kDamp * 0.85 * this.noteDamping));
      if (flux - this.kBase <= need && gap < 3200) return;
      if (gap < 3200 && Math.random() > 1 - Math.exp(-dt / (0.12 + 0.45 * this.noteDamping))) return;
    }

    this.kDamp = Math.min(2, this.kDamp + 0.85);
    this.kJit = 0.75 + Math.random() * 0.65;
    this.kLastNoteTime = now;

    const len = PENTATONIC_FREQS.length;
    let baseIdx = 0;
    if (this.arpPattern === 'OFF') {
      baseIdx = Math.floor((collisionSpeed * 1.2 + ((now * 0.0006) % 1)) * len) % len;
    } else if (this.arpPattern === 'UP') {
      this.arpStep = (this.arpStep + 1) % len;
      baseIdx = this.arpStep;
    } else if (this.arpPattern === 'DOWN') {
      this.arpStep = (this.arpStep - 1 + len) % len;
      baseIdx = this.arpStep;
    } else if (this.arpPattern === 'UP_DOWN') {
      const cycleLen = (len - 1) * 2;
      const pos = (this.arpStep++) % cycleLen;
      baseIdx = pos < len ? pos : cycleLen - pos;
    } else if (this.arpPattern === 'POLY_3_2') {
      this.arpStep = (this.arpStep + 2) % len;
      baseIdx = (this.arpStep + (Math.floor(now * 0.004) % 2) * 3) % len;
    } else if (this.arpPattern === 'POLY_4_3') {
      this.arpStep = (this.arpStep + 3) % len;
      baseIdx = (this.arpStep + (Math.floor(now * 0.003) % 3) * 2) % len;
    } else {
      baseIdx = Math.floor(Math.random() * len);
    }

    if (isHandPresent) {
      const handShift = Math.floor(((handY + 450) / 900) * 6) - 2;
      baseIdx = Math.max(0, Math.min(len - 1, baseIdx + handShift));
    }

    if (nearWanderer) baseIdx = (baseIdx + 2) % len;
    else if (nearSpectra) baseIdx = (baseIdx + 4) % len;

    if (baseIdx === this.kLastIdx) {
      baseIdx = (baseIdx + 1 + ((Math.random() * 3) | 0)) % len;
    }
    this.kLastIdx = baseIdx;

    if (collisionX !== undefined && this.isSpatial3DOn) {
      this.updateSpatialPan(collisionX);
    }
    const freq = PENTATONIC_FREQS[baseIdx];
    const vel = Math.min(0.96, (0.35 + collisionSpeed * 0.14) * (0.65 + Math.random() * 0.55));
    this.playNote(freq, vel);
  }

  public triggerPentatonicNote(idx: number, velocity = 0.8) {
    if (idx >= 0 && idx < PENTATONIC_FREQS.length) {
      this.playNote(PENTATONIC_FREQS[idx], velocity);
    }
  }

  public playCrystal(speed: number, px: number, seed = 0, oct = 1, idxEx?: number, crystalLevel = 0.7) {
    const vel = Math.min(1, Math.max(0.1, speed / 14));
    const idx = (idxEx !== undefined) ? idxEx : 5 + ((Math.abs(Math.imul(seed | 0, 2654435761)) >>> 4) % 10);
    const safeIdx = Math.max(0, Math.min(PENTATONIC_FREQS.length - 1, idx));
    let f = PENTATONIC_FREQS[safeIdx] * 2 * (oct || 1);
    while (f > 4200) f /= 2;

    if (this.isMidiActive) {
      const midiP = PENTATONIC_MIDI[safeIdx] || 72;
      this.sendMidiNoteOn(midiP, Math.min(1, 0.3 + vel * 0.55));
      setTimeout(() => this.sendMidiNoteOff(midiP), 280);
    }

    if (this.isMuted) return;
    if (!this.audioCtx) this.init();
    if (!this.audioCtx || this.audioCtx.state === 'suspended') return;

    const t = this.audioCtx.currentTime + 0.002;
    const dec = (0.7 + vel * 1.1);
    const level = 0.45 * (0.05 + vel * 0.12) * Math.max(0.1, crystalLevel);

    const out = this.audioCtx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.linearRampToValueAtTime(level, t + 0.006);
    out.gain.exponentialRampToValueAtTime(0.00001, t + dec);

    let panner: StereoPannerNode | null = null;
    if (this.audioCtx.createStereoPanner) {
      try {
        panner = this.audioCtx.createStereoPanner();
        const panVal = this.isSpatial3DOn ? Math.max(-0.65, Math.min(0.65, Math.tanh((px || 0) / 520) * 0.65)) : 0;
        panner.pan.setValueAtTime(panVal, t);
      } catch (e) {
        panner = null;
      }
    }

    if (panner) {
      out.connect(panner);
      if (this.dryGain) panner.connect(this.dryGain);
      if (this.reverbGain) panner.connect(this.reverbGain);
    } else {
      if (this.dryGain) out.connect(this.dryGain);
      if (this.reverbGain) out.connect(this.reverbGain);
    }

    const br = 0.5 + this.brightness * 0.8;
    const partials: [number, number, number][] = [
      [1, 1, 1],
      [2.756, 0.45 * br, 0.55],
      [5.404, 0.22 * br, 0.3]
    ];

    partials.forEach(([m, w, d]) => {
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const g = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f * m, t);
      g.gain.setValueAtTime(w, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0001, w * 0.04), t + dec * d);
      osc.connect(g);
      g.connect(out);
      osc.start(t);
      osc.stop(t + dec + 0.05);
    });
  }

  public playTestChord() {
    this.resume();
    const chord = [0, 2, 4, 7];
    chord.forEach((noteIdx, i) => {
      setTimeout(() => {
        if (PENTATONIC_FREQS[noteIdx]) {
          this.playNote(PENTATONIC_FREQS[noteIdx], 0.85);
        }
      }, i * 90);
    });
  }

  public setVolume(v: number) {
    this.volume = v;
    if (this.masterGain && this.audioCtx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(Math.max(0.0001, v), this.audioCtx.currentTime, 0.03);
    }
  }

  public setReverb(r: number) {
    this.reverb = r;
    if (this.reverbGain && this.dryGain && this.audioCtx) {
      this.reverbGain.gain.setTargetAtTime(r, this.audioCtx.currentTime, 0.04);
      this.dryGain.gain.setTargetAtTime(1.0 - r * 0.45, this.audioCtx.currentTime, 0.04);
    }
  }

  public setBrightness(b: number) {
    this.brightness = b;
  }

  public getContext(): AudioContext | null {
    if (!this.audioCtx) this.init();
    return this.audioCtx;
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

  public isGlobuleLeadIsolated(): boolean {
    return this.isGlobulePresetActive && this.isGlobuleLeadOn;
  }

  public resetGlobuleLeadClock() {
    this.globuleLeadBar = 0;
    this.globuleLeadStep = 0;
    this.globuleLeadNextAt = 0;
  }

  public setGlobulePresetActive(active: boolean) {
    const wasActive = this.isGlobulePresetActive;
    this.isGlobulePresetActive = active;
    if (active && !wasActive) {
      this.resetGlobuleLeadClock();
      this.setGlobuleLeadStatus(this.isGlobuleLeadOn ? '⚡ V16 LEAD • Batt. 1/8' : '⚡ V16 LEAD • OFF');
    } else if (!active && wasActive) {
      this.resetGlobuleLeadClock();
      this.setGlobuleLeadStatus('⚡ V16 LEAD • In attesa di V16');
    }
  }

  public setGlobuleLeadOn(on: boolean) {
    this.isGlobuleLeadOn = on;
    if (on && this.isGlobulePresetActive) {
      this.resetGlobuleLeadClock();
      this.setGlobuleLeadStatus('⚡ V16 LEAD • Batt. 1/8');
    } else if (!on) {
      this.setGlobuleLeadStatus('⚡ V16 LEAD • OFF');
    }
  }

  public setGlobuleLeadLevel(level: number) {
    this.globuleLeadLevel = Math.max(0, Math.min(1, level));
  }

  public setGlobuleLeadBpm(bpm: number) {
    this.globuleLeadBpm = Math.max(80, Math.min(160, Math.round(bpm)));
  }

  private setGlobuleLeadStatus(status: string) {
    this.globuleLeadStatus = status;
    if (this.onGlobuleLeadStatus) this.onGlobuleLeadStatus(status);
  }

  public playGlobuleLeadNote(freq: number, crescendo01: number, sphereMod: number, stepMs: number, melIdx: number, holdBeats = 8) {
    const dur = Math.max(1.25, Math.min(3.6, (stepMs * holdBeats) / 1000 * 1.15));
    const midiVel = 0.36 + crescendo01 * 0.52;

    if (this.isMidiActive) {
      const midiPitch = PENTATONIC_MIDI[melIdx % PENTATONIC_MIDI.length] || 60;
      this.sendMidiNoteOn(midiPitch, midiVel);
      setTimeout(() => this.sendMidiNoteOff(midiPitch), Math.max(250, Math.round(dur * 900)));
    }
    if (this.onNoteTrigger) {
      this.onNoteTrigger(NOTE_NAMES[melIdx % NOTE_NAMES.length], melIdx % NOTE_NAMES.length, freq);
    }

    if (this.isMuted || this.globuleLeadLevel <= 0.01) return;
    if (!this.audioCtx) this.init();
    if (!this.audioCtx || !this.synthBus) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
      return;
    }

    const t = this.audioCtx.currentTime + 0.008;
    const amp = this.globuleLeadLevel * (0.11 + crescendo01 * 0.14 + sphereMod * 0.05);

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    const startCut = 260 + crescendo01 * 1800 + sphereMod * 650;
    const peakCut = Math.min(8200, 720 + crescendo01 * 5200 + sphereMod * 1600);
    filter.Q.setValueAtTime(1.8 + crescendo01 * 4.2 + sphereMod * 2.2, t);
    filter.frequency.setValueAtTime(startCut, t);
    filter.frequency.exponentialRampToValueAtTime(peakCut, t + dur * 0.62);
    filter.frequency.exponentialRampToValueAtTime(Math.max(220, peakCut * 0.55), t + dur);

    const attackTime = Math.max(0.08, 0.34 - crescendo01 * 0.22);
    const env = this.audioCtx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.linearRampToValueAtTime(amp, t + attackTime);
    env.gain.setTargetAtTime(amp * 0.68, t + attackTime, dur * 0.35);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    filter.connect(env);
    env.connect(this.synthBus);

    // Rich Progressive House supersaw + sub foundation + evolving fifth/octave shimmer
    const partials: [OscillatorType, number, number][] = [
      ['sine', 0.5, 0.38],
      ['sawtooth', 0.994, 0.34],
      ['sawtooth', 1.0, 0.28],
      ['sawtooth', 1.006, 0.34],
    ];
    if (crescendo01 > 0.28 || sphereMod > 0.22) {
      partials.push(['triangle', 1.4983, 0.18 + crescendo01 * 0.16]);
    }
    if (crescendo01 > 0.58 || sphereMod > 0.42) {
      partials.push(['sine', 2.0, 0.14 + crescendo01 * 0.18]);
    }

    partials.forEach(([type, ratio, weight]) => {
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const og = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq * ratio, t);
      og.gain.setValueAtTime(weight, t);
      osc.connect(og);
      og.connect(filter);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    });
  }

  public updateGlobuleLead(now: number, celestialEnergy: number, audioEnabled: boolean) {
    if (!this.isGlobuleLeadIsolated()) return;
    if (!this.isMidiActive && (!audioEnabled || this.isMuted)) return;
    if (!this.isMidiActive && (!this.audioCtx || this.audioCtx.state !== 'running')) return;

    const stepMs = (60000 / this.globuleLeadBpm) / 4; // 16th grid for steady tempo lock
    if (!this.globuleLeadNextAt || now - this.globuleLeadNextAt > 1500) {
      this.globuleLeadNextAt = now;
    }
    if (now < this.globuleLeadNextAt) return;
    this.globuleLeadNextAt += stepMs;

    const bar = this.globuleLeadBar % 8; // 8-bar Progressive House / Trance intro build-up
    const step = this.globuleLeadStep % 16;
    const phrase = this.GLOBULE_PHRASES[bar];

    if (phrase && phrase[step] !== undefined) {
      const crescendo01 = bar < 7 ? (bar * 16 + step) / (7 * 16 - 1) : 0.18;
      const melIdx = phrase[step] % PENTATONIC_FREQS.length;
      const freq = PENTATONIC_FREQS[melIdx];
      const holdBeats = bar >= 6 ? 4 : bar >= 4 ? 6 : 8;
      this.playGlobuleLeadNote(freq, crescendo01, celestialEnergy, stepMs, melIdx, holdBeats);
      this.setGlobuleLeadStatus(
        bar === 7
          ? `⚡ V16 LEAD [${Math.round(freq)}Hz] • Respiro (8/8)`
          : `⚡ V16 LEAD [${Math.round(freq)}Hz] • Attesa ${bar + 1}/8`
      );
    }

    this.globuleLeadStep = (step + 1) % 16;
    if (this.globuleLeadStep === 0) {
      this.globuleLeadBar = (bar + 1) % 8;
    }
  }

  public dispose() {
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
  }
}

export const globalPiano = new PianoEngine();
