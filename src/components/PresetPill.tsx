/**
 * @license
 * SPDX-License-Identifier: MIT
 * Minimal Floating Top Preset Pill with auto-fade for Nebula Core
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { REMASTERED_KEYS, REMASTERED_VERSION_DATA } from '../engine/remasteredEngine.ts';

interface PresetPillProps {
  currentV: string;
  fps: number;
  globuleCount?: number;
  onSelectVersion: (version: string) => void;
  onTogglePill?: () => void;
}

export const PresetPill: React.FC<PresetPillProps> = ({
  currentV,
  fps,
  globuleCount = 0,
  onSelectVersion,
  onTogglePill,
}) => {
  const [isIdle, setIsIdle] = useState(false);
  const [isExplicitlyHidden, setIsExplicitlyHidden] = useState(false);
  const idleTimerRef = useRef<number | null>(null);

  const resetIdleTimer = () => {
    setIsIdle(false);
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = window.setTimeout(() => {
      setIsIdle(true);
    }, 4000);
  };

  useEffect(() => {
    const handleActivity = () => {
      resetIdleTimer();
    };

    window.addEventListener('pointermove', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });

    resetIdleTimer();

    return () => {
      if (idleTimerRef.current !== null) window.clearTimeout(idleTimerRef.current);
      window.removeEventListener('pointermove', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, []);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    resetIdleTimer();
    const currIdx = REMASTERED_KEYS.indexOf(currentV);
    const nextIdx = (currIdx - 1 + REMASTERED_KEYS.length) % REMASTERED_KEYS.length;
    onSelectVersion(REMASTERED_KEYS[nextIdx]);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    resetIdleTimer();
    const currIdx = REMASTERED_KEYS.indexOf(currentV);
    const nextIdx = (currIdx + 1) % REMASTERED_KEYS.length;
    onSelectVersion(REMASTERED_KEYS[nextIdx]);
  };

  if (isExplicitlyHidden) {
    return (
      <button
        onClick={() => {
          setIsExplicitlyHidden(false);
          resetIdleTimer();
        }}
        className="fixed top-2 left-1/2 -translate-x-1/2 z-40 bg-[#020b05]/80 hover:bg-[#002b15] text-[#00ff88] border border-[#00ff88]/40 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold backdrop-blur-md transition-all shadow-[0_0_10px_rgba(0,255,136,0.3)] cursor-pointer"
        title="Mostra selettore preset superiore"
      >
        ✦ {currentV}{currentV === 'V16' && globuleCount > 0 ? ` (${globuleCount}/49)` : ''} ({fps} FPS)
      </button>
    );
  }

  return (
    <div
      id="preset-pill"
      onMouseEnter={() => resetIdleTimer()}
      className={`fixed top-2 md:top-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#030e06]/92 border border-[#00ff88] text-[#00ff88] font-mono text-[11px] font-bold shadow-[0_0_20px_rgba(0,255,136,0.35)] backdrop-blur-xl select-none transition-all duration-500 ease-out ${
        isIdle
          ? 'opacity-20 hover:opacity-100 -translate-y-1 hover:translate-y-0 scale-95 hover:scale-100'
          : 'opacity-100 translate-y-0 scale-100'
      }`}
    >
      {/* Prev Preset */}
      <button
        id="btn-preset-prev"
        onClick={handlePrev}
        className="p-1 rounded-full hover:bg-[#003318] text-[#00ff88] hover:text-white transition-colors cursor-pointer"
        title="Preset Precedente"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      {/* Preset Name Chip */}
      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#002211] border border-[#00552b] text-[#88ffaa] whitespace-nowrap">
        <span className="text-[9px] text-[#00e5ff] tracking-wider">PRESET:</span>
        <b id="chip-version" className="text-white text-[11px] tracking-wide">
          {REMASTERED_VERSION_DATA[currentV]?.title ? `${currentV} ${REMASTERED_VERSION_DATA[currentV].title}` : currentV}
        </b>
        {currentV === 'V16' && globuleCount > 0 && (
          <span className="text-[#e299ff] text-[10px] tabular-nums ml-1">· {globuleCount}/49</span>
        )}
      </div>

      {/* Next Preset */}
      <button
        id="btn-preset-next"
        onClick={handleNext}
        className="p-1 rounded-full hover:bg-[#003318] text-[#00ff88] hover:text-white transition-colors cursor-pointer"
        title="Preset Successivo"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>

      {/* FPS Counter */}
      <div
        id="fps-val"
        className="px-2 py-0.5 rounded-md bg-[#01180b] border border-[#00aa55]/50 text-[#00ff88] text-[10px] min-w-[50px] text-center tabular-nums"
      >
        {fps} FPS
      </div>

      {/* Close / Hide Button */}
      <button
        id="btn-pill-hide"
        onClick={(e) => {
          e.stopPropagation();
          setIsExplicitlyHidden(true);
          if (onTogglePill) onTogglePill();
        }}
        className="p-1 rounded-full hover:bg-[#330008] text-[#ff6677] hover:text-white transition-colors cursor-pointer ml-0.5"
        title="Nascondi pillola superiore"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};
