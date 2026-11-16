/**
 * @license
 * SPDX-License-Identifier: MIT
 * Replicated GitHub Bottom Navigation Dock for Nebula Core
 * Exactly matching uploaded screenshots:
 * [🌌 SCIAME] [⚡ FISICA] [☀️ LUCI] [🎵 AUDIO] [📹 INPUT] | [🎙️ MIC] [📷 CAM: ON] [🔊 MUTO] [📸 FOTO] [🎥 REC] [⛶ FULL] | [🎚️ PRESET] [🎛️ MIDI: LOGIC PRO (IAC)] [🔄 CYCLE: ON] [🔄 ROT: ON] [🧲 ATTR] [🌠 SCIE: ON] [🧭 TILT]
 */

import React, { useState, useEffect, useRef } from 'react';
import { TouchMode } from '../types.ts';

export type HubTabType = 'sciame' | 'fisica' | 'luci' | 'audio' | 'input' | null;

interface BottomDockProps {
  activeTab: HubTabType;
  onSelectTab: (tab: HubTabType) => void;

  // Actions
  isMicActive: boolean;
  onToggleMic: () => void;

  isCamActive: boolean;
  onToggleCam: () => void;

  isMuted: boolean;
  onToggleMute: () => void;

  onTakePhoto: () => void;

  isRecording: boolean;
  recordSeconds: number;
  onToggleRecord: () => void;

  isFullscreen: boolean;
  onToggleFullscreen: () => void;

  // Toggles
  onOpenPresetModal: () => void;

  isMidiActive: boolean;
  midiDeviceName: string;
  onToggleMidi: () => void;

  isCycleActive: boolean;
  cycleTime: number;
  onToggleCycle: () => void;

  isRotActive: boolean;
  onToggleRot: () => void;

  touchMode: TouchMode;
  onToggleTouchMode: () => void;

  isTrailsActive: boolean;
  onToggleTrails: () => void;

  isTiltActive: boolean;
  onToggleTilt: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  activeTab,
  onSelectTab,
  isMicActive,
  onToggleMic,
  isCamActive,
  onToggleCam,
  isMuted,
  onToggleMute,
  onTakePhoto,
  isRecording,
  recordSeconds,
  onToggleRecord,
  isFullscreen,
  onToggleFullscreen,
  onOpenPresetModal,
  isMidiActive,
  midiDeviceName,
  onToggleMidi,
  isCycleActive,
  cycleTime,
  onToggleCycle,
  isRotActive,
  onToggleRot,
  touchMode,
  onToggleTouchMode,
  isTrailsActive,
  onToggleTrails,
  isTiltActive,
  onToggleTilt,
}) => {
  const [isIdle, setIsIdle] = useState(false);
  const idleTimeoutRef = useRef<number | null>(null);

  const resetIdle = () => {
    setIsIdle(false);
    if (idleTimeoutRef.current !== null) {
      window.clearTimeout(idleTimeoutRef.current);
    }
    // Only auto-collapse if drawer is not open
    if (!activeTab) {
      idleTimeoutRef.current = window.setTimeout(() => {
        setIsIdle(true);
      }, 5000);
    }
  };

  useEffect(() => {
    const handleActivity = () => resetIdle();
    window.addEventListener('pointermove', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });

    resetIdle();
    return () => {
      if (idleTimeoutRef.current !== null) window.clearTimeout(idleTimeoutRef.current);
      window.removeEventListener('pointermove', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [activeTab]);

  const handleTabClick = (tab: HubTabType) => {
    resetIdle();
    if (activeTab === tab) {
      onSelectTab(null); // Toggle close if clicked again
    } else {
      onSelectTab(tab);
    }
  };

  return (
    <div
      id="dock-wrapper"
      onMouseEnter={resetIdle}
      onTouchStart={resetIdle}
      className={`fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center pointer-events-none transition-transform duration-300 ease-out ${
        isIdle && !activeTab ? 'translate-y-[calc(100%-8px)] hover:translate-y-0' : 'translate-y-0'
      }`}
    >
      {/* Subtle Drag / Wake Handle when Idle */}
      <div
        onClick={() => resetIdle()}
        className={`w-36 h-2 rounded-t-full bg-[#00ff88]/60 cursor-pointer pointer-events-auto transition-opacity duration-300 hover:bg-[#00ff88] ${
          isIdle && !activeTab ? 'opacity-90' : 'opacity-0 h-0 overflow-hidden'
        }`}
        title="Apri console comandi"
      />

      {/* Main Dock Container */}
      <nav
        id="dock"
        className="w-full max-w-[100vw] overflow-x-auto no-scrollbar pointer-events-auto bg-[#020a05]/95 border-t border-[#00ff88]/80 shadow-[0_-8px_30px_rgba(0,255,136,0.22)] backdrop-blur-2xl px-2 py-1.5 md:py-2 select-none"
      >
        <div
          id="dock-scroll"
          className="flex items-center gap-1.5 min-w-max mx-auto justify-center px-2"
        >
          {/* TAB 1: SCIAME */}
          <button
            onClick={() => handleTabClick('sciame')}
            className={`flex flex-col items-center justify-center min-w-[56px] px-2.5 py-1 rounded-xl text-center font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'sciame'
                ? 'bg-[#003d1e] border border-[#00ff88] text-white shadow-[0_0_12px_#00ff88]'
                : 'bg-[#01140a] border border-[#006633] text-[#00ff88] hover:border-[#00ff88] hover:text-white'
            }`}
          >
            <span className="text-base leading-none">🌌</span>
            <span className="text-[9px] mt-0.5 tracking-wider">SCIAME</span>
          </button>

          {/* TAB 2: FISICA */}
          <button
            onClick={() => handleTabClick('fisica')}
            className={`flex flex-col items-center justify-center min-w-[56px] px-2.5 py-1 rounded-xl text-center font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'fisica'
                ? 'bg-[#003d1e] border border-[#00ff88] text-white shadow-[0_0_12px_#00ff88]'
                : 'bg-[#01140a] border border-[#006633] text-[#00ff88] hover:border-[#00ff88] hover:text-white'
            }`}
          >
            <span className="text-base leading-none">⚡</span>
            <span className="text-[9px] mt-0.5 tracking-wider">FISICA</span>
          </button>

          {/* TAB 3: LUCI */}
          <button
            onClick={() => handleTabClick('luci')}
            className={`flex flex-col items-center justify-center min-w-[56px] px-2.5 py-1 rounded-xl text-center font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'luci'
                ? 'bg-[#003d1e] border border-[#00ff88] text-white shadow-[0_0_12px_#00ff88]'
                : 'bg-[#01140a] border border-[#006633] text-[#00ff88] hover:border-[#00ff88] hover:text-white'
            }`}
          >
            <span className="text-base leading-none">☀️</span>
            <span className="text-[9px] mt-0.5 tracking-wider">LUCI</span>
          </button>

          {/* TAB 4: AUDIO (Contains Piano & NEW Relaxation Frequency Generator) */}
          <button
            onClick={() => handleTabClick('audio')}
            className={`flex flex-col items-center justify-center min-w-[56px] px-2.5 py-1 rounded-xl text-center font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'audio'
                ? 'bg-[#00e5ff] text-[#01140a] border border-[#00e5ff] shadow-[0_0_14px_#00e5ff]'
                : 'bg-[#01140a] border border-[#006633] text-[#00ff88] hover:border-[#00ff88] hover:text-white'
            }`}
          >
            <span className="text-base leading-none">🎵</span>
            <span className="text-[9px] mt-0.5 tracking-wider">AUDIO</span>
          </button>

          {/* TAB 5: INPUT (Webcam, Mic, Tilt sensor, MIDI) */}
          <button
            onClick={() => handleTabClick('input')}
            className={`flex flex-col items-center justify-center min-w-[56px] px-2.5 py-1 rounded-xl text-center font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'input'
                ? 'bg-[#003d1e] border border-[#00ff88] text-white shadow-[0_0_12px_#00ff88]'
                : 'bg-[#01140a] border border-[#006633] text-[#00ff88] hover:border-[#00ff88] hover:text-white'
            }`}
          >
            <span className="text-base leading-none">📹</span>
            <span className="text-[9px] mt-0.5 tracking-wider">INPUT</span>
          </button>

          {/* VERTICAL SEPARATOR 1 */}
          <div className="h-7 w-[1.5px] bg-[#00ff88]/30 mx-1 shrink-0" />

          {/* QUICK ACTION: MIC */}
          <button
            onClick={onToggleMic}
            className={`px-3 py-2 rounded-xl font-mono text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isMicActive
                ? 'bg-[#00ff88] text-[#01140a] shadow-[0_0_14px_rgba(0,255,136,0.8)] border border-[#00ff88]'
                : 'bg-[#01140a] border border-[#006633] text-[#00ff88] hover:border-[#00ff88]'
            }`}
            title="Attiva / Disattiva Microfono Reattivo"
          >
            <span>🎙️</span>
            <span>{isMicActive ? 'MIC: ON' : 'MIC'}</span>
          </button>

          {/* QUICK ACTION: CAM */}
          <button
            onClick={onToggleCam}
            className={`px-3 py-2 rounded-xl font-mono text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isCamActive
                ? 'bg-[#00ff88] text-[#01140a] shadow-[0_0_18px_rgba(0,255,136,0.9)] border border-[#00ff88]'
                : 'bg-[#01140a] border border-[#006633] text-[#00ff88] hover:border-[#00ff88]'
            }`}
            title="Attiva / Disattiva Tracciamento Mani e Radar PiP"
          >
            <span>📷</span>
            <span>{isCamActive ? 'CAM: ON' : 'CAM'}</span>
          </button>

          {/* QUICK ACTION: AUDIO / MUTO */}
          <button
            onClick={onToggleMute}
            className={`px-3 py-2 rounded-xl font-mono text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isMuted
                ? 'bg-[#ff0055] text-white shadow-[0_0_18px_rgba(255,0,85,0.9)] border border-[#ff3377]'
                : 'bg-[#01140a] border border-[#006633] text-[#00ff88] hover:border-[#00ff88]'
            }`}
            title={isMuted ? 'Audio Silenziato - Clicca per riattivare' : 'Silenzia Audio'}
          >
            <span>{isMuted ? '🔇' : '🔊'}</span>
            <span>{isMuted ? 'MUTO' : 'AUDIO'}</span>
          </button>

          {/* QUICK ACTION: FOTO PNG */}
          <button
            onClick={onTakePhoto}
            className="px-3 py-2 rounded-xl font-mono text-[11px] font-bold flex items-center gap-1.5 bg-[#01140a] border border-[#006633] text-[#00ff88] hover:border-[#00ff88] hover:text-white transition-all cursor-pointer"
            title="Scatta Foto Istantanea PNG Sciame"
          >
            <span>📸</span>
            <span>FOTO</span>
          </button>

          {/* QUICK ACTION: REC VIDEO */}
          <button
            onClick={onToggleRecord}
            className={`px-3 py-2 rounded-xl font-mono text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isRecording
                ? 'bg-[#ff2244] text-white shadow-[0_0_20px_#ff2244] animate-pulse border border-[#ff4466]'
                : 'bg-[#01140a] border border-[#006633] text-[#00ff88] hover:border-[#00ff88]'
            }`}
            title="Registra Video Sciame con Audio in HD"
          >
            <span>🎥</span>
            <span>
              {isRecording
                ? `REC ${String(Math.floor(recordSeconds / 60)).padStart(2, '0')}:${String(recordSeconds % 60).padStart(2, '0')}`
                : 'REC'}
            </span>
          </button>

          {/* QUICK ACTION: FULLSCREEN */}
          <button
            onClick={onToggleFullscreen}
            className={`px-3 py-2 rounded-xl font-mono text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isFullscreen
                ? 'bg-[#003d1e] text-white border border-[#00ff88]'
                : 'bg-[#01140a] border border-[#006633] text-[#00ff88] hover:border-[#00ff88]'
            }`}
            title="Schermo Intero Nativo"
          >
            <span>⛶</span>
            <span>{isFullscreen ? 'ESCI' : 'FULL'}</span>
          </button>

          {/* VERTICAL SEPARATOR 2 */}
          <div className="h-7 w-[1.5px] bg-[#00ff88]/30 mx-1 shrink-0" />

          {/* TOGGLE: PRESET MODAL */}
          <button
            onClick={onOpenPresetModal}
            className="px-3 py-2 rounded-xl font-mono text-[11px] font-bold flex items-center gap-1.5 bg-[#00ff88] text-[#01140a] border border-[#00ff88] shadow-[0_0_14px_rgba(0,255,136,0.7)] hover:bg-[#88ffaa] transition-all cursor-pointer"
            title="Apri Libreria Presets e Condivisione"
          >
            <span>🎚️</span>
            <span>PRESET</span>
          </button>

          {/* TOGGLE: MIDI LOGIC PRO (IAC) */}
          <button
            onClick={onToggleMidi}
            className={`px-3 py-2 rounded-xl font-mono text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isMidiActive
                ? 'bg-[#00ff88] text-[#01140a] shadow-[0_0_16px_rgba(0,255,136,0.8)] border border-[#00ff88]'
                : 'bg-[#01140a] border border-[#006633] text-[#00ff88] hover:border-[#00ff88]'
            }`}
            title={`Web MIDI Out - Supporto Logic Pro (IAC Driver) / Ableton: ${midiDeviceName}`}
          >
            <span>🎛️</span>
            <span>{isMidiActive ? `MIDI: ${midiDeviceName.toUpperCase()}` : 'MIDI: LOGIC PRO (IAC)'}</span>
          </button>

          {/* TOGGLE: AUTO-CYCLE */}
          <button
            onClick={onToggleCycle}
            className={`px-3 py-2 rounded-xl font-mono text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isCycleActive
                ? 'bg-[#00ff88] text-[#01140a] shadow-[0_0_16px_rgba(0,255,136,0.85)] border border-[#00ff88]'
                : 'bg-[#01140a] border border-[#006633] text-[#00ff88] hover:border-[#00ff88]'
            }`}
            title="Auto-Cycle Temporizzato Presets Cosmici"
          >
            <span>🔄</span>
            <span>{isCycleActive ? `CYCLE: ON (${cycleTime.toFixed(1)}s)` : 'CYCLE'}</span>
          </button>

          {/* TOGGLE: ROTAZIONE 3D */}
          <button
            onClick={onToggleRot}
            className={`px-3 py-2 rounded-xl font-mono text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isRotActive
                ? 'bg-[#cc00ff] text-white shadow-[0_0_18px_rgba(204,0,255,0.9)] border border-[#ee44ff]'
                : 'bg-[#01140a] border border-[#006633] text-[#00ff88] hover:border-[#00ff88]'
            }`}
            title="Attiva / Disattiva Autorotazione 3D e 4D"
          >
            <span>🔄</span>
            <span>{isRotActive ? 'ROT: ON' : 'ROT'}</span>
          </button>

          {/* TOGGLE: FORZA TOCCO (ATTRACT / REPEL) */}
          <button
            onClick={onToggleTouchMode}
            className={`px-3 py-2 rounded-xl font-mono text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              touchMode === 'REPEL'
                ? 'bg-[#ff0055] text-white shadow-[0_0_16px_rgba(255,0,85,0.85)] border border-[#ff3377]'
                : 'bg-[#01140a] border border-[#006633] text-[#00ff88] hover:border-[#00ff88]'
            }`}
            title="Commuta modalità forza del tocco o mouse tra Attrazione e Repulsione"
          >
            <span>{touchMode === 'REPEL' ? '💥' : '🧲'}</span>
            <span>{touchMode === 'REPEL' ? 'REPEL' : 'ATTR'}</span>
          </button>

          {/* TOGGLE: SCIE / MOTION BLUR */}
          <button
            onClick={onToggleTrails}
            className={`px-3 py-2 rounded-xl font-mono text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isTrailsActive
                ? 'bg-[#00e5ff] text-[#01140a] shadow-[0_0_16px_rgba(0,229,255,0.85)] border border-[#00e5ff]'
                : 'bg-[#01140a] border border-[#006633] text-[#00ff88] hover:border-[#00ff88]'
            }`}
            title="Attiva / Disattiva Scie e Motion Blur Particelle"
          >
            <span>🌠</span>
            <span>{isTrailsActive ? 'SCIE: ON' : 'SCIE'}</span>
          </button>

          {/* TOGGLE: TILT / ACCELEROMETRO */}
          <button
            onClick={onToggleTilt}
            className={`px-3 py-2 rounded-xl font-mono text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isTiltActive
                ? 'bg-[#ffaa00] text-[#01140a] shadow-[0_0_18px_rgba(255,170,0,0.95)] border border-[#ffcc00]'
                : 'bg-[#01140a] border border-[#006633] text-[#00ff88] hover:border-[#00ff88]'
            }`}
            title="Attiva Giroscopio e Gravità Tilt per muovere lo sciame inclinando il dispositivo"
          >
            <span>🧭</span>
            <span>{isTiltActive ? 'TILT: ON' : 'TILT'}</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
