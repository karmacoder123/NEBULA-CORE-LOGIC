import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MoonStar, Play, Pause, Volume2, TimerReset, Waves, Wind } from 'lucide-react';
import { RelaxationEngine, RelaxMode } from '../audio/relaxationEngine.ts';

const sleepPresets = [15, 30, 45, 60] as const;

export function SleepStudioPanel() {
  const engineRef = useRef<RelaxationEngine | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<RelaxMode>('MIXED');
  const [volume, setVolume] = useState(0.42);
  const [carrierHz, setCarrierHz] = useState(150);
  const [deltaHz, setDeltaHz] = useState(2);
  const [sleepMinutes, setSleepMinutes] = useState(30);
  const [breathSync, setBreathSync] = useState(true);
  const [breathLevel, setBreathLevel] = useState(0.5);

  useEffect(() => {
    engineRef.current = new RelaxationEngine({
      mode,
      masterVolume: volume,
      carrierHz,
      deltaHz,
      sleepMinutes,
      pulseBreath: breathSync,
    });

    return () => {
      engineRef.current?.stop(true);
    };
  }, []);

  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.updateSettings({
      mode,
      masterVolume: volume,
      carrierHz,
      deltaHz,
      sleepMinutes,
      pulseBreath: breathSync,
    });
  }, [mode, volume, carrierHz, deltaHz, sleepMinutes, breathSync]);

  useEffect(() => {
    if (!breathSync || !isPlaying) {
      setBreathLevel(0.5);
      return;
    }

    const raf = window.setInterval(() => {
      const t = Date.now() / 1000;
      const cycle = (Math.sin(t * 0.1) + 1) / 2;
      setBreathLevel(0.38 + cycle * 0.62);
    }, 120);

    return () => window.clearInterval(raf);
  }, [breathSync, isPlaying]);

  const activeProfile = useMemo(() => {
    if (mode === 'BINAURAL') return deltaHz <= 4 ? 'Delta' : deltaHz <= 8 ? 'Theta' : 'Alpha';
    if (mode === 'SOLFEGGIO') return 'Solfeggio';
    if (mode === 'BROWN') return 'Brown Noise';
    if (mode === 'PINK') return 'Pink Noise';
    return 'Mixed Drift';
  }, [mode, deltaHz]);

  const handleToggle = async () => {
    const engine = engineRef.current;
    if (!engine) return;

    if (isPlaying) {
      engine.stop(true);
      setIsPlaying(false);
      return;
    }

    await engine.init();
    engine.updateSettings({
      mode,
      masterVolume: volume,
      carrierHz,
      deltaHz,
      sleepMinutes,
      pulseBreath: breathSync,
    });
    engine.start();
    setIsPlaying(true);
  };

  const pulseStyle = {
    transform: `scale(${0.92 + breathLevel * 0.25})`,
    opacity: 0.55 + breathLevel * 0.45,
    boxShadow: `0 0 ${18 + breathLevel * 24}px rgba(0, 255, 136, 0.65)`,
  };

  return (
    <div className="fixed bottom-24 left-4 z-30 w-[320px] rounded-[24px] border border-[#00ff88]/50 bg-[#04130d]/90 p-4 shadow-[0_0_30px_rgba(0,255,136,0.18)] backdrop-blur-xl text-[#d9ffe8]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#00ff88] bg-[#00ff88]/10 text-[#00ff88]">
            <MoonStar className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-[#7cefc0]">Sleep Studio</div>
            <div className="text-sm font-bold text-white">Relaxation Engine</div>
          </div>
        </div>

        <button
          onClick={handleToggle}
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition ${
            isPlaying ? 'bg-[#ff4d4d] text-white' : 'bg-[#00ff88] text-[#031b0f]'
          }`}
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {isPlaying ? 'Pause' : 'Start'}
        </button>
      </div>

      <div className="mb-3 flex items-center justify-between rounded-2xl border border-[#00ff88]/25 bg-[#071d14] px-3 py-2">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-[#83ffb9]">Profile</div>
          <div className="text-sm font-semibold text-white">{activeProfile}</div>
        </div>
        <div
          className="h-10 w-10 rounded-full border border-[#00ff88]/70 bg-[#00ff88]/10 transition-all duration-700 ease-out"
          style={pulseStyle}
        />
      </div>

      <div className="mb-3">
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-[#7cefc0]">
          <span>Mode</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          {(['SOLFEGGIO', 'BINAURAL', 'BROWN', 'PINK', 'MIXED'] as RelaxMode[]).map((item) => (
            <button
              key={item}
              onClick={() => setMode(item)}
              className={`rounded-full border px-2 py-1.5 font-medium transition ${
                mode === item
                  ? 'border-[#00ff88] bg-[#00ff88]/15 text-white shadow-[0_0_12px_rgba(0,255,136,0.25)]'
                  : 'border-[#00ff88]/30 bg-[#0b1f18] text-[#bfffe1]'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 space-y-3">
        <label className="block text-[10px] uppercase tracking-[0.22em] text-[#7cefc0]">
          Volume
          <input
            type="range"
            min={0.05}
            max={0.9}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="mt-2 w-full accent-[#00ff88]"
          />
        </label>

        <label className="block text-[10px] uppercase tracking-[0.22em] text-[#7cefc0]">
          Carrier {carrierHz} Hz
          <input
            type="range"
            min={120}
            max={220}
            step={1}
            value={carrierHz}
            onChange={(e) => setCarrierHz(Number(e.target.value))}
            className="mt-2 w-full accent-[#00e5ff]"
          />
        </label>

        <label className="block text-[10px] uppercase tracking-[0.22em] text-[#7cefc0]">
          Beat {deltaHz} Hz
          <input
            type="range"
            min={1}
            max={12}
            step={1}
            value={deltaHz}
            onChange={(e) => setDeltaHz(Number(e.target.value))}
            className="mt-2 w-full accent-[#7cefc0]"
          />
        </label>
      </div>

      <div className="mb-3">
        <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#7cefc0]">
          <TimerReset className="h-3.5 w-3.5" />
          <span>Sleep timer</span>
        </div>
        <div className="grid grid-cols-4 gap-2 text-[10px]">
          {sleepPresets.map((minutes) => (
            <button
              key={minutes}
              onClick={() => setSleepMinutes(minutes)}
              className={`rounded-full border px-2 py-1.5 transition ${
                sleepMinutes === minutes
                  ? 'border-[#00e5ff] bg-[#00e5ff]/10 text-white'
                  : 'border-[#00ff88]/30 bg-[#0b1f18] text-[#d9ffe8]'
              }`}
            >
              {minutes}m
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-[#00ff88]/25 bg-[#091d16] px-3 py-2">
        <div className="flex items-center gap-2 text-sm text-white">
          <Wind className="h-4 w-4 text-[#00e5ff]" />
          <span>Breath sync</span>
        </div>
        <button
          onClick={() => setBreathSync((value) => !value)}
          className={`relative h-6 w-12 rounded-full border transition ${
            breathSync ? 'border-[#00ff88] bg-[#00ff88]/20' : 'border-[#00ff88]/30 bg-[#0d1b18]'
          }`}
          aria-label="Toggle breath sync"
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-[#00ff88] transition-all ${
              breathSync ? 'left-7' : 'left-1'
            }`}
          />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-[#7cefc0]">
        <span className="inline-flex items-center gap-2"><Volume2 className="h-3.5 w-3.5" /> Audio</span>
        <span>{isPlaying ? 'Active' : 'Idle'}</span>
      </div>
    </div>
  );
}





























































































































