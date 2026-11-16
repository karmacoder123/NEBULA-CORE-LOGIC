/**
 * @license
 * SPDX-License-Identifier: MIT
 * Nebula Control Drawer - Exact Replica of Original GitHub Project
 * Tabs: SCIAME, FISICA, LUCI, AUDIO, INPUT + Built-in Relaxation Sound Generator
 */

import React, { useState, useEffect } from 'react';
import { HubTabType } from './BottomDock';
import { SimulationParams, EngineMode, GeometryType, TouchMode } from '../types';
import { globalPiano } from '../audio/pianoEngine';
import {
  globalRelaxation,
  NoiseMode,
  ZenPresetId
} from '../audio/relaxationEngine';
import { X } from 'lucide-react';

const PRESET_CHIPS: { id: string; label: string }[] = [
  { id: 'V1', label: 'V1 CRISTALLO' },
  { id: 'V2', label: 'V2 PLASMA' },
  { id: 'V3', label: 'V3 SATURNO' },
  { id: 'V4', label: 'V4 DISCO' },
  { id: 'V5', label: 'V5 ATOMO' },
  { id: 'V6', label: 'V6 GALASSIA' },
  { id: 'V7', label: 'V7 DNA' },
  { id: 'V8', label: 'V8 TORNADO' },
  { id: 'V9', label: 'V9 NEBULOSA' },
  { id: 'V10', label: 'V10 GUSCIO' },
  { id: 'V11', label: 'V11 ONDA' },
  { id: 'V12', label: 'V12 SUPERNOVA' },
  { id: 'V13', label: 'V13 NEBULA CORE' },
  { id: 'V14', label: 'V14 NODO' },
  { id: 'V15', label: 'V15 FILAMENTI' },
  { id: 'V16', label: 'V16 GLOBULI' },
];

const PIANO_16_KEYS = [
  { name: 'C3', idx: 0 },
  { name: 'D3', idx: 1 },
  { name: 'E3', idx: 2 },
  { name: 'G3', idx: 3 },
  { name: 'A3', idx: 4 },
  { name: 'C4', idx: 5 },
  { name: 'D4', idx: 6 },
  { name: 'E4', idx: 7 },
  { name: 'G4', idx: 8 },
  { name: 'A4', idx: 9 },
  { name: 'C5', idx: 10 },
  { name: 'D5', idx: 11 },
  { name: 'E5', idx: 12 },
  { name: 'G5', idx: 13 },
  { name: 'A5', idx: 14 },
  { name: 'C6', idx: 15 },
];

interface HubDrawerProps {
  activeTab: HubTabType;
  onClose: () => void;
  params: SimulationParams;
  onUpdateParams: (newParams: Partial<SimulationParams>) => void;
  currentV: string;
  onSelectVersion: (version: string) => void;
  engineMode: EngineMode;
  onSelectEngineMode: (mode: EngineMode) => void;
  currentGeoType: GeometryType;
  onChangeGeoType: (geo: GeometryType) => void;
  isCycleActive: boolean;
  onToggleCycle: () => void;
  cycleTime?: number;
  onUpdateCycleTime?: (time: number) => void;
  isCamActive: boolean;
  onToggleCam: () => void;
  isMicActive: boolean;
  onToggleMic: () => void;
  isTiltActive: boolean;
  onToggleTilt: () => void;
  tiltAngleX?: number;
  tiltAngleY?: number;
  tiltForce?: number;
  onUpdateTiltParams?: (force: number, smooth: number) => void;
  isTrailsActive?: boolean;
  onToggleTrails?: () => void;
  isAutorotActive?: boolean;
  onToggleAutorot?: () => void;
  onResetPhysics?: () => void;
  touchMode?: TouchMode;
  onToggleTouchMode?: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onTakePhoto?: () => void;
  isRecording?: boolean;
  onToggleRecord?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onOpenDownloadPortal?: () => void;
  isMidiActive?: boolean;
  midiDeviceName?: string;
  onToggleMidi?: () => void;
  globuleLeadStatus?: string;
  globuleCount?: number;
  onResetGlobules?: () => void;
}

export const HubDrawer: React.FC<HubDrawerProps> = ({
  activeTab,
  onClose,
  params,
  onUpdateParams,
  currentV,
  onSelectVersion,
  isCycleActive,
  onToggleCycle,
  cycleTime = 15.0,
  onUpdateCycleTime,
  isCamActive,
  onToggleCam,
  isMicActive,
  onToggleMic,
  isTiltActive,
  onToggleTilt,
  tiltAngleX = 0,
  tiltAngleY = 0,
  onUpdateTiltParams,
  isTrailsActive = true,
  onToggleTrails,
  isAutorotActive = true,
  onToggleAutorot,
  onResetPhysics,
  touchMode = 'ATTRACT',
  onToggleTouchMode,
  isMuted = false,
  onToggleMute,
  onTakePhoto,
  isRecording = false,
  onToggleRecord,
  onToggleFullscreen,
  onOpenDownloadPortal,
  isMidiActive = true,
  midiDeviceName = 'Driver IAC Bus 1',
  onToggleMidi,
  globuleLeadStatus = '⚡ V16 LEAD • Pronto',
  globuleCount = 7,
  onResetGlobules,
}) => {
  // Height state: level 3 for expansive viewing
  const [heightLevel, setHeightLevel] = useState<1 | 2 | 3>(3);

  // Tab Sciame lock states
  const [lockAudio, setLockAudio] = useState(true);
  const [lockRot, setLockRot] = useState(true);
  const [selectedTrailPreset, setSelectedTrailPreset] = useState<'COMETA' | 'METEORA' | 'IPERSPAZIO' | 'DELICATO'>('IPERSPAZIO');

  // MIDI & Piano profile chip sync state
  const [midiChannel, setMidiChannel] = useState(globalPiano.midiChannel || 1);
  const [midiNotesOn, setMidiNotesOn] = useState(globalPiano.midiNotesEnabled ?? true);
  const [midiCcOn, setMidiCcOn] = useState(globalPiano.midiCCEnabled ?? true);
  const [pianoChip, setPianoChip] = useState<string>('🌌 DRONE POLIFONICO');

  // Zen & Sleep live reactive state synced with globalRelaxation
  const [, setZenTick] = useState(0);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState(globalRelaxation.sleepTimerRemainingSec);

  // Tab Input states
  const [tiltSensLocal, setTiltSensLocal] = useState(1.0);
  const [tiltSmoothLocal, setTiltSmoothLocal] = useState(0.20);

  useEffect(() => {
    globalRelaxation.onTimerTick = (remSec) => setSleepTimerRemaining(remSec);
    globalRelaxation.onTimerComplete = () => {
      setSleepTimerRemaining(0);
      setZenTick(t => t + 1);
    };
    globalRelaxation.onStateChange = () => setZenTick(t => t + 1);
    return () => {
      globalRelaxation.onStateChange = null;
    };
  }, []);

  if (!activeTab) return null;

  const handleSliderChange = (key: keyof SimulationParams, val: number) => {
    onUpdateParams({ [key]: val });
  };

  const handleReset = () => {
    if (onResetPhysics) {
      onResetPhysics();
    }
    setPianoChip('🌌 DRONE POLIFONICO');
    setZenTick(t => t + 1);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      id="nebula-control-drawer"
      className="fixed z-40 left-1/2 -translate-x-1/2 bottom-[78px] w-[95%] max-w-[540px] md:left-auto md:right-4 md:top-4 md:bottom-[86px] md:translate-x-0 md:w-[410px] md:max-w-[410px] bg-[#020b06]/95 backdrop-blur-2xl border border-[#00ffaa]/50 rounded-2xl flex flex-col shadow-[0_0_35px_rgba(0,255,170,0.35)] transition-all duration-300 select-none overflow-hidden"
      style={{
        maxHeight: heightLevel === 3 ? 'calc(100vh - 102px)' : heightLevel === 2 ? '65vh' : '45vh',
        height: heightLevel === 3 ? 'calc(100vh - 102px)' : heightLevel === 2 ? '65vh' : '45vh',
      }}
    >
      {/* DRAWER TOP BAR / RESIZER */}
      <div
        className="w-full pt-2 pb-1 flex justify-center cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setHeightLevel(prev => prev === 3 ? 2 : prev === 2 ? 1 : 3)}
      >
        <div className="w-12 h-1.5 bg-[#00ffaa] rounded-full shadow-[0_0_8px_#00ffaa]" />
      </div>

      {/* DRAWER HEADER EXACTLY AS IN SCREENSHOT */}
      <div className="px-4 py-2 border-b border-[#00ffaa]/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#00ffaa] text-sm">⚙️</span>
          <span className="font-mono font-black text-sm text-[#00ffaa] tracking-widest uppercase">
            NEBULA CONTROL
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHeightLevel(prev => prev === 1 ? 3 : 1)}
            className="px-3 py-1 rounded-full border border-[#00ffaa] text-[#00ffaa] font-mono font-bold text-[10px] tracking-wider uppercase bg-transparent hover:bg-[#00ffaa]/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_8px_rgba(0,255,170,0.3)]"
          >
            <span>👁</span> VEDI SCIAME
          </button>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-[#ff3366] text-[#ff3366] hover:bg-[#ff3366]/20 flex items-center justify-center transition-all cursor-pointer shadow-[0_0_8px_rgba(255,51,102,0.3)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DRAWER BODY (SCROLLABLE) */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 custom-scrollbar text-[#00ffaa] font-mono">

        {/* ========================================================================= */}
        {/* TAB 1: SCIAME (EXACT REPLICA FROM SCREENSHOT 2.13.44) */}
        {/* ========================================================================= */}
        {activeTab === 'sciame' && (
          <div className="space-y-3.5">
            {/* SEZIONE 1: COSA RESTA UGUALE TRA I PRESET */}
            <div className="border border-[#00ffaa]/50 rounded-xl p-3 bg-black/60 space-y-2 shadow-[0_0_15px_rgba(0,255,170,0.15)]">
              <div className="text-[11px] font-mono font-bold text-[#00ffaa] tracking-wider uppercase flex items-center gap-1.5">
                <span>🔒</span> COSA RESTA UGUALE TRA I PRESET
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setLockAudio(!lockAudio)}
                  className={`py-1.5 px-3 rounded-full font-mono font-black text-[11px] tracking-wider uppercase transition-all cursor-pointer ${
                    lockAudio
                      ? 'bg-[#00ffaa] text-[#021008] shadow-[0_0_15px_#00ffaa]'
                      : 'border border-[#00ffaa]/50 text-[#00ffaa] bg-black/40 hover:bg-[#00ffaa]/20'
                  }`}
                >
                  🔒 AUDIO: {lockAudio ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => setLockRot(!lockRot)}
                  className={`py-1.5 px-3 rounded-full font-mono font-black text-[11px] tracking-wider uppercase transition-all cursor-pointer ${
                    lockRot
                      ? 'bg-[#00ffaa] text-[#021008] shadow-[0_0_15px_#00ffaa]'
                      : 'border border-[#00ffaa]/50 text-[#00ffaa] bg-black/40 hover:bg-[#00ffaa]/20'
                  }`}
                >
                  🔒 ROTAZIONE: {lockRot ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="text-[10px] text-[#00ffaa]/75 leading-relaxed font-mono">
                Con il lucchetto acceso, cambiando preset restano invariati tutto l'audio (timbro, arpeggio, accordi, slider, cristalli) oppure l'autorotazione 3D/4D (acceso/spento e velocità). Spento: ogni preset usa i suoi valori.
              </div>
            </div>

            {/* SEZIONE 2: 16 PRESETS COSMICI */}
            <div className="border border-[#00ffaa]/50 rounded-xl p-3 bg-black/60 space-y-2.5 shadow-[0_0_15px_rgba(0,255,170,0.15)]">
              <div className="text-[11px] font-mono font-bold text-[#00ffaa] tracking-wider uppercase flex items-center gap-1.5">
                <span>🎛</span> 16 PRESETS COSMICI
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_CHIPS.map(chip => {
                  const isSelected = currentV === chip.id;
                  return (
                    <button
                      key={chip.id}
                      onClick={() => onSelectVersion(chip.id)}
                      className={`px-2.5 py-1 rounded-full font-mono font-bold text-[10px] tracking-wider uppercase transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#00ffaa] text-[#021008] shadow-[0_0_15px_#00ffaa]'
                          : 'border border-[#00ffaa]/50 text-[#00ffaa] bg-black/40 hover:bg-[#00ffaa]/20'
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>

              <div className="pt-1 font-mono text-[10px]">
                <div className="flex justify-between items-center text-[#00ffaa]">
                  <span>DURATA CICLO</span>
                  <b className="text-[#00ffaa] font-black">{(cycleTime ?? params.cycleTime).toFixed(1)}s</b>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="60.0"
                  step="1.0"
                  value={cycleTime ?? params.cycleTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (onUpdateCycleTime) onUpdateCycleTime(val);
                    else onUpdateParams({ cycleTime: val });
                  }}
                  className="w-full accent-[#00ffaa] cursor-pointer"
                />
              </div>

              <button
                onClick={onToggleCycle}
                className={`w-full py-2 rounded-full font-mono font-black text-[11px] tracking-wider uppercase transition-all cursor-pointer ${
                  isCycleActive
                    ? 'bg-[#00ffaa] text-[#021008] shadow-[0_0_20px_#00ffaa]'
                    : 'border border-[#00ffaa]/50 text-[#00ffaa] bg-black/40 hover:bg-[#00ffaa]/20'
                }`}
              >
                🔄 AUTO-CYCLE: {isCycleActive ? `ON (${(cycleTime ?? params.cycleTime).toFixed(1)}s)` : 'OFF'}
              </button>
            </div>

            {/* SEZIONE 3: DENSITÀ SCIAME & PARTICELLE */}
            <div className="border border-[#00ffaa]/50 rounded-xl p-3 bg-black/60 space-y-2 shadow-[0_0_15px_rgba(0,255,170,0.15)]">
              <div className="text-[11px] font-mono font-bold text-[#00ffaa] tracking-wider uppercase flex items-center gap-1.5">
                <span>✨</span> DENSITÀ SCIAME & PARTICELLE
              </div>
              <div className="space-y-1 font-mono text-[10px]">
                <div className="flex justify-between items-center text-[#00ffaa]">
                  <span>NUMERO PARTICELLE</span>
                  <b className="text-[#00ffaa] font-black">{params.particleCount}</b>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="40000"
                  step="1000"
                  value={params.particleCount}
                  onChange={(e) => handleSliderChange('particleCount', parseInt(e.target.value, 10))}
                  className="w-full accent-[#00ffaa] cursor-pointer"
                />
              </div>
              <div className="text-[10px] text-[#00ffaa]/75 leading-relaxed font-mono">
                Aggiornamento istantaneo dinamico dello sciame senza ricaricare (ottimizzato iPhone max 5.000).
              </div>
            </div>

            {/* SEZIONE 4: SCIE GEOMETRICHE 3D */}
            <div className="border border-[#00ffaa]/50 rounded-xl p-3 bg-black/60 space-y-2.5 shadow-[0_0_15px_rgba(0,255,170,0.15)]">
              <div className="text-[11px] font-mono font-bold text-[#00ffaa] tracking-wider uppercase flex items-center gap-1.5">
                <span>🌠</span> SCIE GEOMETRICHE 3D (PARTICLE TRAILS)
              </div>
              <button
                onClick={() => {
                  if (onToggleTrails) onToggleTrails();
                  else onUpdateParams({ isTrailsOn: !(params.isTrailsOn ?? true) });
                }}
                className={`w-full py-1.5 rounded-full font-mono font-black text-[11px] tracking-wider uppercase transition-all cursor-pointer ${
                  (isTrailsActive ?? params.isTrailsOn ?? true)
                    ? 'border border-[#00ffaa] text-[#00ffaa] bg-[#00ffaa]/15 shadow-[0_0_12px_rgba(0,255,170,0.3)]'
                    : 'border border-[#00ffaa]/40 text-[#00ffaa]/50 bg-black/40'
                }`}
              >
                🌠 SCIE 3D: {(isTrailsActive ?? params.isTrailsOn ?? true) ? 'ON' : 'OFF'}
              </button>
              <div className="flex flex-wrap gap-1.5">
                {(['COMETA', 'METEORA', 'IPERSPAZIO', 'DELICATO'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => {
                      setSelectedTrailPreset(p);
                      if (p === 'COMETA') onUpdateParams({ trailLength: 18, trailPersistence: 1.5 });
                      if (p === 'METEORA') onUpdateParams({ trailLength: 35, trailPersistence: 3.0 });
                      if (p === 'IPERSPAZIO') onUpdateParams({ trailLength: 26, trailPersistence: 2.5, trailTracerCount: 275 });
                      if (p === 'DELICATO') onUpdateParams({ trailLength: 10, trailPersistence: 0.9 });
                    }}
                    className={`px-3 py-1 rounded-full font-mono font-bold text-[10px] tracking-wider uppercase transition-all cursor-pointer ${
                      selectedTrailPreset === p
                        ? 'bg-[#00ffaa] text-[#021008] shadow-[0_0_12px_#00ffaa]'
                        : 'border border-[#00ffaa]/50 text-[#00ffaa] bg-black/40 hover:bg-[#00ffaa]/20'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="space-y-2 pt-1 font-mono text-[10px]">
                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>LUNGHEZZA SCIA (SEGMENTI)</span>
                    <b className="text-[#00ffaa] font-black">{params.trailLength ?? 26}</b>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="60"
                    step="2"
                    value={params.trailLength ?? 26}
                    onChange={(e) => onUpdateParams({ trailLength: parseInt(e.target.value, 10) })}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>LUMINOSITÀ / PERSISTENZA</span>
                    <b className="text-[#00ffaa] font-black">{(params.trailPersistence ?? 2.5).toFixed(1)}x</b>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.1"
                    value={params.trailPersistence ?? 2.5}
                    onChange={(e) => onUpdateParams({ trailPersistence: parseFloat(e.target.value) })}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>NUMERO PARTICELLE CON SCIA</span>
                    <b className="text-[#00ffaa] font-black">{params.trailTracerCount ?? 275}</b>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="25"
                    value={params.trailTracerCount ?? 275}
                    onChange={(e) => onUpdateParams({ trailTracerCount: parseInt(e.target.value, 10) })}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>
              </div>
              <div className="text-[10px] text-[#00ffaa]/75 leading-relaxed font-mono">
                Code geometriche 3D dinamiche con tracciamento vettoriale persistente e dissolvenza additiva.
              </div>
            </div>

            {/* SEZIONE 5: AUTOROTAZIONE SCIAME 3D (BORDO VIOLA) */}
            <div className="border border-[#b026ff] rounded-xl p-3 bg-black/60 space-y-2.5 shadow-[0_0_15px_rgba(176,38,255,0.2)]">
              <div className="text-[11px] font-mono font-bold text-[#b026ff] tracking-wider uppercase flex items-center gap-1.5">
                <span>🔄</span> AUTOROTAZIONE SCIAME 3D
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (onToggleAutorot) onToggleAutorot();
                    else onUpdateParams({ isAutoRotationOn: !(params.isAutoRotationOn ?? true) });
                  }}
                  className={`flex-1 py-1.5 rounded-full font-mono font-black text-[11px] tracking-wider uppercase transition-all cursor-pointer ${
                    isAutorotActive
                      ? 'bg-[#b026ff] text-white shadow-[0_0_15px_#b026ff]'
                      : 'border border-[#b026ff]/50 text-[#b026ff] bg-black/40 hover:bg-[#b026ff]/20'
                  }`}
                >
                  🔄 AUTOROT: {isAutorotActive ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => {
                    onUpdateParams({
                      rotX: 0, rotY: 0, rotZ: 0,
                      rot4dXW: 0, rot4dYW: 0, rot4dZW: 0,
                      isAutoRotationOn: false
                    });
                  }}
                  className="px-4 py-1.5 rounded-full font-mono font-bold text-[11px] border border-[#00ffaa] text-[#00ffaa] hover:bg-[#00ffaa]/20 transition-all cursor-pointer"
                >
                  RESET ASSI
                </button>
              </div>

              <div className="space-y-2 pt-1 font-mono text-[10px]">
                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>VELOCITÀ ASSE X</span>
                    <b className="text-[#00ffaa] font-black">{params.rotX.toFixed(1)}</b>
                  </div>
                  <input
                    type="range"
                    min="-2.0"
                    max="2.0"
                    step="0.1"
                    value={params.rotX}
                    onChange={(e) => handleSliderChange('rotX', parseFloat(e.target.value))}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>VELOCITÀ ASSE Y</span>
                    <b className="text-[#00ffaa] font-black">{params.rotY.toFixed(1)}</b>
                  </div>
                  <input
                    type="range"
                    min="-2.0"
                    max="2.0"
                    step="0.1"
                    value={params.rotY}
                    onChange={(e) => handleSliderChange('rotY', parseFloat(e.target.value))}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>VELOCITÀ ASSE Z</span>
                    <b className="text-[#00ffaa] font-black">{params.rotZ.toFixed(1)}</b>
                  </div>
                  <input
                    type="range"
                    min="-2.0"
                    max="2.0"
                    step="0.1"
                    value={params.rotZ}
                    onChange={(e) => handleSliderChange('rotZ', parseFloat(e.target.value))}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>ROTAZIONE 4D · PIANO XW</span>
                    <b className="text-[#00ffaa] font-black">{(params.rot4dXW ?? 0.1).toFixed(1)}</b>
                  </div>
                  <input
                    type="range"
                    min="-2.0"
                    max="2.0"
                    step="0.1"
                    value={params.rot4dXW ?? 0.1}
                    onChange={(e) => onUpdateParams({ rot4dXW: parseFloat(e.target.value) })}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>ROTAZIONE 4D · PIANO YW</span>
                    <b className="text-[#00ffaa] font-black">{(params.rot4dYW ?? -0.1).toFixed(1)}</b>
                  </div>
                  <input
                    type="range"
                    min="-2.0"
                    max="2.0"
                    step="0.1"
                    value={params.rot4dYW ?? -0.1}
                    onChange={(e) => onUpdateParams({ rot4dYW: parseFloat(e.target.value) })}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>ROTAZIONE 4D · PIANO ZW</span>
                    <b className="text-[#00ffaa] font-black">{(params.rot4dZW ?? 0.1).toFixed(1)}</b>
                  </div>
                  <input
                    type="range"
                    min="-2.0"
                    max="2.0"
                    step="0.1"
                    value={params.rot4dZW ?? 0.1}
                    onChange={(e) => onUpdateParams({ rot4dZW: parseFloat(e.target.value) })}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>ROTAZIONE SINGOLE PARTICELLE</span>
                    <b className="text-[#00ffaa] font-black">{params.pSpin.toFixed(1)}</b>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="3.0"
                    step="0.1"
                    value={params.pSpin}
                    onChange={(e) => handleSliderChange('pSpin', parseFloat(e.target.value))}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>
              </div>
              <div className="text-[10px] text-[#00ffaa]/75 leading-relaxed font-mono">
                Rotazione 4D vera: ogni particella ha una coordinata W nascosta. I piani XW/YW/ZW la mescolano con X/Y/Z e lo sciame si deforma come un ipercubo o un'ipersfera che ruota (con RESET ASSI torna all'origine). Attiva AUTOROT per animarla.
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: FISICA */}
        {/* ========================================================================= */}
        {activeTab === 'fisica' && (
          <div className="space-y-3.5">
            <div className="border border-[#00ffaa]/50 rounded-xl p-3 bg-black/60 space-y-2.5 shadow-[0_0_15px_rgba(0,255,170,0.15)]">
              <div className="text-[11px] font-mono font-bold text-[#00e5ff] tracking-wider uppercase flex items-center gap-1.5">
                <span>🌌</span> ATTRATTORE GRAVITAZIONALE (TOUCH/MOUSE)
              </div>
              <button
                onClick={onToggleTouchMode}
                className="w-full py-1.5 rounded-full font-mono font-bold text-[11px] tracking-wider uppercase border border-[#00ffaa] text-[#00ffaa] bg-black/40 hover:bg-[#00ffaa]/15 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_10px_rgba(0,255,170,0.2)]"
              >
                <span>🧲</span> MODALITÀ FORZA: {touchMode === 'ATTRACT' ? 'ATTRAZIONE' : 'REPULSIONE'}
              </button>
              <button
                onClick={() => onUpdateParams({ cursorRingOn: !(params.cursorRingOn ?? true) })}
                className={`w-full py-1.5 rounded-full font-mono font-bold text-[10.5px] tracking-wider uppercase border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  (params.cursorRingOn ?? true)
                    ? 'border-[#00e5ff] bg-[#00e5ff]/20 text-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.35)]'
                    : 'border-[#00ffaa]/40 bg-black/40 text-[#00ffaa]/70'
                }`}
              >
                <span>💍</span> CURSORE 3D EVIDENTE (ANELLI): {(params.cursorRingOn ?? true) ? 'ON' : 'OFF'}
              </button>

              <div className="space-y-2 pt-1 font-mono text-[10px]">
                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>FORZA GRAVITAZIONALE</span>
                    <b className="text-[#00ffaa] font-black">{(params.attractorMaxForce ?? 18.0).toFixed(1)}</b>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="50.0"
                    step="0.5"
                    value={params.attractorMaxForce ?? 18.0}
                    onChange={(e) => onUpdateParams({ attractorMaxForce: parseFloat(e.target.value) })}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>RAGGIO ATTRATTORE</span>
                    <b className="text-[#00ffaa] font-black">{params.attractorRadius ?? 900}</b>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="2500"
                    step="50"
                    value={params.attractorRadius ?? 900}
                    onChange={(e) => onUpdateParams({ attractorRadius: parseInt(e.target.value, 10) })}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>VORTICE GRAVITAZIONALE</span>
                    <b className="text-[#00ffaa] font-black">{(params.attractorVortex ?? 12.0).toFixed(1)}</b>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="40.0"
                    step="0.5"
                    value={params.attractorVortex ?? 12.0}
                    onChange={(e) => onUpdateParams({ attractorVortex: parseFloat(e.target.value) })}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="border border-[#00ffaa]/50 rounded-xl p-3 bg-black/60 space-y-2.5 shadow-[0_0_15px_rgba(0,255,170,0.15)]">
              <div className="text-[11px] font-mono font-bold text-[#00e5ff] tracking-wider uppercase flex items-center gap-1.5">
                <span>🔒</span> FISICA PARTICELLE (MEMORIA)
              </div>

              <div className="space-y-2 font-mono text-[10px]">
                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>ATTRITO</span>
                    <b className="text-[#00ffaa] font-black">{params.friction.toFixed(2)}</b>
                  </div>
                  <input
                    type="range"
                    min="0.85"
                    max="0.99"
                    step="0.01"
                    value={params.friction}
                    onChange={(e) => handleSliderChange('friction', parseFloat(e.target.value))}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>ELASTICITÀ</span>
                    <b className="text-[#00ffaa] font-black">{params.elasticity.toFixed(4)}</b>
                  </div>
                  <input
                    type="range"
                    min="0.0005"
                    max="0.0100"
                    step="0.0001"
                    value={params.elasticity}
                    onChange={(e) => handleSliderChange('elasticity', parseFloat(e.target.value))}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>DIMENSIONE PARTICELLA</span>
                    <b className="text-[#00ffaa] font-black">{params.pSize.toFixed(1)}</b>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="8.0"
                    step="0.1"
                    value={params.pSize}
                    onChange={(e) => handleSliderChange('pSize', parseFloat(e.target.value))}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>POTENZA WEBCAM / MANO</span>
                    <b className="text-[#00ffaa] font-black">{params.handPower.toFixed(1)}</b>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="30.0"
                    step="0.5"
                    value={params.handPower}
                    onChange={(e) => handleSliderChange('handPower', parseFloat(e.target.value))}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="border border-[#ffaa00]/60 rounded-xl p-3 bg-black/60 space-y-2.5 shadow-[0_0_15px_rgba(255,170,0,0.2)]">
              <div className="text-[11px] font-mono font-bold text-[#ffaa00] tracking-wider uppercase flex items-center gap-1.5">
                <span>💍</span> ANELLI DI WANDERER E SPECTRA
              </div>
              <button
                onClick={() => onUpdateParams({ ringsOn: !(params.ringsOn ?? true) })}
                className="w-full py-1.5 rounded-full font-mono font-bold text-[11px] tracking-wider uppercase border border-[#ffaa00] text-[#ffaa00] bg-black/40 hover:bg-[#ffaa00]/15 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_10px_rgba(255,170,0,0.2)]"
              >
                <span>💍</span> ANELLI: {(params.ringsOn ?? true) ? 'ON' : 'OFF'}
              </button>

              <div className="space-y-2 pt-1 font-mono text-[10px]">
                <div>
                  <div className="flex justify-between items-center text-[#ffaa00]">
                    <span>VELOCITÀ ANELLI</span>
                    <b className="text-[#ffaa00] font-black">{(params.ringSpeed ?? 0.7).toFixed(1)}x</b>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.1"
                    value={params.ringSpeed ?? 0.7}
                    onChange={(e) => onUpdateParams({ ringSpeed: parseFloat(e.target.value) })}
                    className="w-full accent-[#ffaa00] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[#ffaa00]">
                    <span>INFLUENZA SULLO SCIAME</span>
                    <b className="text-[#ffaa00] font-black">{(params.ringSwarm ?? 2.0).toFixed(2)}</b>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.1"
                    value={params.ringSwarm ?? 2.0}
                    onChange={(e) => onUpdateParams({ ringSwarm: parseFloat(e.target.value) })}
                    className="w-full accent-[#ffaa00] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[#ffaa00]">
                    <span>INFLUENZA SULL'AUDIO</span>
                    <b className="text-[#ffaa00] font-black">{(params.ringAudio ?? 1.0).toFixed(2)}</b>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1.0"
                    step="0.05"
                    value={params.ringAudio ?? 1.0}
                    onChange={(e) => onUpdateParams({ ringAudio: parseFloat(e.target.value) })}
                    className="w-full accent-[#ffaa00] cursor-pointer"
                  />
                </div>
              </div>

              <div className="text-[10px] text-[#ffaa00]/75 leading-relaxed font-mono">
                Ogni sfera ha due anelli che ruotano in senso opposto e cambiano colore di continuo. A intervalli casuali cambiano velocità, direzione ed effetto: lo sciame viene trascinato in vortici, pulsazioni o spinte lungo l'asse. L'audio riceve note e cristalli quando gli anelli si allineano e modula la sensibilità delle note cinetiche.
              </div>
            </div>

            <div className="border border-[#00ffaa]/50 rounded-xl p-3 bg-black/60 space-y-2.5 shadow-[0_0_15px_rgba(0,255,170,0.15)]">
              <div className="text-[11px] font-mono font-bold text-[#00e5ff] tracking-wider uppercase flex items-center gap-1.5">
                <span>🌌</span> ANCORAGGIO CENTRALE & ZOOM SCIAME
              </div>

              <div className="space-y-2 font-mono text-[10px]">
                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>FORZA ATTRAZIONE CENTRO SCHERMO</span>
                    <b className="text-[#00ffaa] font-black">{params.centerAttraction.toFixed(2)}</b>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="2.0"
                    step="0.05"
                    value={params.centerAttraction}
                    onChange={(e) => handleSliderChange('centerAttraction', parseFloat(e.target.value))}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                  <div className="text-[9.5px] text-[#00ffaa]/75 mt-0.5 font-mono">
                    Ancora lo sciame al centro schermo (0,0,0): le particelle si allontanano solo per l'interazione delle sfere.
                  </div>
                </div>

                <div className="pt-1">
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>ZOOM SCIAME (DISTANZA CAMERA)</span>
                    <b className="text-[#00ffaa] font-black">{Math.round(params.zoom)}</b>
                  </div>
                  <input
                    type="range"
                    min="400"
                    max="3200"
                    step="10"
                    value={params.zoom}
                    onChange={(e) => handleSliderChange('zoom', parseInt(e.target.value, 10))}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                  <div className="text-[9.5px] text-[#00ffaa]/75 mt-0.5 font-mono">
                    Regola il campo visivo dello sciame di particelle senza coprire la scena.
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-[#00ffaa]/50 rounded-xl p-3 bg-black/60 space-y-2 shadow-[0_0_15px_rgba(0,255,170,0.15)]">
              <div className="text-[11px] font-mono font-bold text-[#00ffaa] tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00ffaa] shadow-[0_0_8px_#00ffaa]" /> SFERA ORBITANTE 1 (WANDERER)
              </div>

              <div className="space-y-2 font-mono text-[10px]">
                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>VELOCITÀ ORBITALE WANDERER</span>
                    <b className="text-[#00ffaa] font-black">{params.wanderOrbit.toFixed(1)}x</b>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.1"
                    value={params.wanderOrbit}
                    onChange={(e) => onUpdateParams({ wanderOrbit: parseFloat(e.target.value) })}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>FORZA ATTRAZIONE/REPULSIONE</span>
                    <b className="text-[#00ffaa] font-black">
                      {(params.wanderForce ?? 1.0) >= 0 ? `+${(params.wanderForce ?? 1.0).toFixed(1)} (REPULSIONE)` : `${(params.wanderForce ?? 1.0).toFixed(1)} (ATTRAZIONE)`}
                    </b>
                  </div>
                  <input
                    type="range"
                    min="-3.0"
                    max="3.0"
                    step="0.2"
                    value={params.wanderForce ?? 1.0}
                    onChange={(e) => onUpdateParams({ wanderForce: parseFloat(e.target.value) })}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>
              </div>

              <div className="text-[9.5px] text-[#00ffaa]/75 leading-relaxed font-mono">
                Scala simmetrica: -3.0 (Massima Attrazione) ↔ +3.0 (Massima Repulsione). Raggio comune: 600. Se imposti tu il valore, resta fisso cambiando preset (RIPRISTINA lo sblocca).
              </div>
            </div>

            <div className="border border-[#00ffaa]/50 rounded-xl p-3 bg-black/60 space-y-2 shadow-[0_0_15px_rgba(0,255,170,0.15)]">
              <div className="text-[11px] font-mono font-bold text-[#00e5ff] tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]" /> SFERA ORBITANTE 2 (SPECTRA)
              </div>

              <div className="space-y-2 font-mono text-[10px]">
                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>VELOCITÀ ORBITALE SPECTRA</span>
                    <b className="text-[#00ffaa] font-black">{params.spectraOrbit.toFixed(1)}x</b>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.1"
                    value={params.spectraOrbit}
                    onChange={(e) => onUpdateParams({ spectraOrbit: parseFloat(e.target.value) })}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>FORZA ATTRAZIONE/REPULSIONE</span>
                    <b className="text-[#00ffaa] font-black">
                      {(params.spectraForce ?? 1.0) >= 0 ? `+${(params.spectraForce ?? 1.0).toFixed(1)} (REPULSIONE)` : `${(params.spectraForce ?? 1.0).toFixed(1)} (ATTRAZIONE)`}
                    </b>
                  </div>
                  <input
                    type="range"
                    min="-3.0"
                    max="3.0"
                    step="0.2"
                    value={params.spectraForce ?? 1.0}
                    onChange={(e) => onUpdateParams({ spectraForce: parseFloat(e.target.value) })}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>
              </div>

              <div className="text-[9.5px] text-[#00ffaa]/75 leading-relaxed font-mono">
                Scala simmetrica: -3.0 (Massima Attrazione) ↔ 0 (Neutro) ↔ +3.0 (Massima Repulsione). Raggio comune: 600. Se imposti tu il valore, resta fisso cambiando preset (RIPRISTINA lo sblocca).
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: LUCI */}
        {/* ========================================================================= */}
        {activeTab === 'luci' && (
          <div className="space-y-3.5">
            <div className="border border-[#00ffaa]/50 rounded-xl p-3 bg-black/60 space-y-3 shadow-[0_0_15px_rgba(0,255,170,0.15)]">
              <div className="text-[11px] font-mono font-bold text-[#ffaa00] tracking-wider uppercase flex items-center gap-1.5">
                <span>☀️</span> ILLUMINAZIONE COSMICA & SOLI
              </div>

              <div className="space-y-2.5 font-mono text-[10px]">
                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>INTENSITÀ SOLE PRIMARIO</span>
                    <b className="text-[#00ffaa] font-black">{params.sunIntensity.toFixed(1)}</b>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="6.0"
                    step="0.1"
                    value={params.sunIntensity}
                    onChange={(e) => onUpdateParams({ sunIntensity: parseFloat(e.target.value) })}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>LUCE AMBIENTALE COSMICA</span>
                    <b className="text-[#00ffaa] font-black">{Number.isInteger(params.ambientIntensity) ? params.ambientIntensity : params.ambientIntensity.toFixed(1)}</b>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.1"
                    value={params.ambientIntensity}
                    onChange={(e) => onUpdateParams({ ambientIntensity: parseFloat(e.target.value) })}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>SOLE SECONDARIO DI CONTRASTO</span>
                    <b className="text-[#00ffaa] font-black">{(params.secondarySunIntensity ?? 2.9).toFixed(1)}</b>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="5.0"
                    step="0.1"
                    value={params.secondarySunIntensity ?? 2.9}
                    onChange={(e) => onUpdateParams({ secondarySunIntensity: parseFloat(e.target.value) })}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>

                <div className="pt-1">
                  <span className="block text-[10px] text-[#00ffaa] mb-1.5 uppercase font-mono font-bold">
                    TEMPERATURA / COLORE SOLE
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'WHITE', icon: '⚪', label: 'BIANCO' },
                      { id: 'GOLD', icon: '🟡', label: 'ORO' },
                      { id: 'CYAN', icon: '🔵', label: 'CIANO' },
                      { id: 'VIOLET', icon: '🟣', label: 'VIOLA' },
                    ].map(col => (
                      <button
                        key={col.id}
                        onClick={() => onUpdateParams({ sunHue: col.id as any })}
                        className={`px-3 py-1 rounded-full font-mono font-bold text-[10px] tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                          (params.sunHue ?? 'WHITE') === col.id
                            ? 'bg-[#00ffaa] text-[#021008] shadow-[0_0_12px_#00ffaa]'
                            : 'border border-[#00ffaa]/50 text-[#00ffaa] bg-black/40 hover:bg-[#00ffaa]/20'
                        }`}
                      >
                        <span>{col.icon}</span> {col.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: AUDIO (ZEN & SLEEP + MIDI OUT + CRISTALLI + SUITE ARMONICA)        */}
        {/* ========================================================================= */}
        {activeTab === 'audio' && (
          <div className="space-y-3.5">
            {/* SEZIONE LEAD TRANCE V16 (GLOBULI) */}
            <div className="border border-[#cc66ff]/70 rounded-xl p-3 bg-[#12041d]/75 space-y-2.5 shadow-[0_0_18px_rgba(204,102,255,0.25)]">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] font-mono font-bold text-[#e299ff] tracking-wider uppercase flex items-center gap-1.5">
                  <span>⚡</span> LEAD TRANCE V16 (GLOBULI)
                </div>
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  currentV === 'V16'
                    ? 'bg-[#cc66ff]/25 border-[#cc66ff] text-[#f0ccff]'
                    : 'bg-black/50 border-[#cc66ff]/40 text-[#cc66ff]/80'
                }`}>
                  {currentV === 'V16' ? 'V16 ATTIVO' : 'PRESET: ' + currentV}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  id="btn-globule-lead"
                  onClick={() => {
                    globalPiano.resume();
                    onUpdateParams({ globuleLeadOn: !(params.globuleLeadOn ?? true) });
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-full font-mono font-black text-[11px] tracking-wider uppercase transition-all cursor-pointer ${
                    (params.globuleLeadOn ?? true)
                      ? 'bg-[#cc66ff] text-[#100218] shadow-[0_0_15px_#cc66ff]'
                      : 'border border-[#cc66ff]/60 text-[#e299ff] bg-black/40 hover:bg-[#cc66ff]/20'
                  }`}
                >
                  ⚡ LEAD TRANCE V16: {(params.globuleLeadOn ?? true) ? 'ON' : 'OFF'}
                </button>
                {currentV !== 'V16' && (
                  <button
                    onClick={() => onSelectVersion('V16')}
                    className="px-3 py-1.5 rounded-full font-mono font-bold text-[10px] tracking-wider uppercase border border-[#00e5ff] text-[#00e5ff] bg-black/50 hover:bg-[#00e5ff]/20 transition-all cursor-pointer"
                  >
                    PASSA A V16
                  </button>
                )}
              </div>

              <div className="space-y-2 font-mono text-[10px]">
                <div>
                  <div className="flex justify-between items-center text-[#e299ff]">
                    <span>LIVELLO LEAD TRANCE</span>
                    <b className="font-black">{(params.globuleLeadLevel ?? 0.55).toFixed(2)}</b>
                  </div>
                  <input
                    id="sl-globule-lead-level"
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={params.globuleLeadLevel ?? 0.55}
                    onChange={(e) => onUpdateParams({ globuleLeadLevel: parseFloat(e.target.value) })}
                    className="w-full accent-[#cc66ff] cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center text-[#e299ff]">
                    <span>TEMPO ARPEGGIO / LEAD</span>
                    <b className="font-black">{Math.round(params.globuleLeadBpm ?? 128)} BPM</b>
                  </div>
                  <input
                    id="sl-globule-lead-bpm"
                    type="range"
                    min="80"
                    max="160"
                    step="1"
                    value={params.globuleLeadBpm ?? 128}
                    onChange={(e) => onUpdateParams({ globuleLeadBpm: parseInt(e.target.value, 10) })}
                    className="w-full accent-[#cc66ff] cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center text-[#00e5ff]">
                    <span>MOLTIPLICATORE INFLUENZA GLOBULI (V16)</span>
                    <b className="font-black">{(params.globuleInfluenceMult ?? 2.2).toFixed(1)}x</b>
                  </div>
                  <input
                    id="sl-v16-influence"
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.1"
                    value={params.globuleInfluenceMult ?? 2.2}
                    onChange={(e) => onUpdateParams({ globuleInfluenceMult: parseFloat(e.target.value) })}
                    className="w-full accent-[#00e5ff] cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 text-[9.5px] font-mono text-[#00ffaa] bg-black/50 border border-[#cc66ff]/30 rounded-lg px-2.5 py-1.5">
                <span className="truncate">{globuleLeadStatus}</span>
                <span className="text-[#e299ff] font-bold tabular-nums whitespace-nowrap">
                  Globuli: {currentV === 'V16' ? globuleCount : 7} / 49
                </span>
              </div>
              {currentV === 'V16' && onResetGlobules && (
                <button
                  onClick={onResetGlobules}
                  className="w-full py-1.5 rounded-lg text-[10px] font-mono font-bold bg-[#1a0b2e] hover:bg-[#2a124a] border border-[#cc66ff]/60 text-[#e299ff] cursor-pointer transition-all"
                >
                  ↺ Ripristina 7 Globuli Iniziali
                </button>
              )}
              <div className="text-[9.5px] text-[#e299ff]/80 leading-relaxed font-mono">
                Partenza da 7 globuli iridescenti arcobaleno con vortice interno: ogni impatto (collisione, tocco o audio) genera nuovi globuli fino a 49 in sincronia con Lead Trance V16.
              </div>
            </div>

            {/* SEZIONE 1: SCENA AUDIO */}
            <div className="border border-[#00ffaa]/50 rounded-xl p-3 bg-black/60 space-y-2 shadow-[0_0_15px_rgba(0,255,170,0.15)]">
              <div className="text-[11px] font-mono font-bold text-[#00e5ff] tracking-wider uppercase flex items-center gap-1.5">
                <span>🌌</span> SCENA AUDIO
              </div>
              <button
                onClick={() => {
                  setPianoChip('🌌 DRONE POLIFONICO');
                  onUpdateParams({
                    audioMode: 'SYNTH',
                    micGain: 2,
                    reverbAmount: 1.0,
                    audioPower: 1.5,
                    audioThreshold: 0.12,
                    pianoBrightness: 0.2,
                    crystalOn: true,
                    crystalMode: 'ALL',
                    crystalSens: 0.05,
                    crystalRate: 2,
                    crystalLevel: 0.70,
                    isKineticNotesOn: true,
                    isSpatial3DOn: true,
                    pianoProfile: 'DRONE',
                    arpPattern: 'POLY_4_3',
                    arpDivision: '1/4',
                    chordType: 'COSMIC7',
                    chordResonance: 0.05,
                    attackSoftness: 2.0,
                    sustainTail: 6.0,
                    noteDamping: 1.0,
                    kineticMode: 'ONSET',
                    triggerThreshold: 0.1,
                    kineticSensitivity: 0.1,
                  });
                  globalRelaxation.applyDefaults(true);
                  setZenTick(t => t + 1);
                }}
                className="w-full py-1.5 rounded-full font-mono font-bold text-[11px] tracking-wider uppercase border border-[#00ffaa] text-[#00ffaa] bg-black/40 hover:bg-[#00ffaa]/15 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_10px_rgba(0,255,170,0.2)]"
              >
                <span>🌌</span> AUDIO: VALORI BASE (AMBIENT DRONE)
              </button>
              <div className="text-[10px] text-[#00ffaa]/75 leading-relaxed font-mono">
                Ripristina le impostazioni audio di partenza: drone polifonico, attacco 2 s, sustain 6x, timbro scuro, note molto sensibili, riverbero pieno e cristalli. L'audio parte sempre così.
              </div>
            </div>

            {/* SEZIONE 2: AUDIO, MICROFONO & CATTEDRALE */}
            <div className="border border-[#00ffaa]/50 rounded-xl p-3 bg-black/60 space-y-2.5 shadow-[0_0_15px_rgba(0,255,170,0.15)]">
              <div className="text-[11px] font-mono font-bold text-[#00e5ff] tracking-wider uppercase flex items-center gap-1.5">
                <span>🎙️</span> AUDIO, MICROFONO & CATTEDRALE
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onUpdateParams({ audioMode: params.audioMode === 'OFF' ? 'SYNTH' : 'OFF' })}
                  className={`px-3 py-1 rounded-full font-mono font-bold text-[10px] tracking-wider uppercase transition-all cursor-pointer ${
                    params.audioMode !== 'OFF'
                      ? 'bg-[#00ffaa] text-black shadow-[0_0_10px_#00ffaa]'
                      : 'border border-[#00ffaa]/50 text-[#00ffaa] bg-black/40'
                  }`}
                >
                  {params.audioMode === 'OFF' ? 'AUDIO: OFF' : 'PIANO SYNTH'}
                </button>
                <button
                  onClick={onToggleMute}
                  className={`px-3 py-1 rounded-full font-mono font-bold text-[10px] tracking-wider uppercase transition-all cursor-pointer ${
                    isMuted
                      ? 'bg-[#ff0055] text-white shadow-[0_0_10px_#ff0055]'
                      : 'border border-[#00ffaa]/50 text-[#00ffaa] bg-black/40 hover:bg-[#00ffaa]/15'
                  }`}
                >
                  {isMuted ? 'UNMUTE' : 'MUTE'}
                </button>
              </div>

              <button
                onClick={onToggleMic}
                className={`w-full py-1.5 rounded-full font-mono font-bold text-[11px] tracking-wider uppercase border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isMicActive
                    ? 'bg-[#00ffaa] text-black border-[#00ffaa] shadow-[0_0_15px_#00ffaa]'
                    : 'border border-[#00ffaa] text-[#00ffaa] bg-black/40 hover:bg-[#00ffaa]/15'
                }`}
              >
                <span>🎙️</span> {isMicActive ? 'DISATTIVA MICROFONO' : 'ATTIVA MICROFONO'}
              </button>

              <div className="space-y-2 font-mono text-[10px]">
                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>GUADAGNO MICROFONO</span>
                    <b className="text-[#00ffaa] font-black">{Math.round(params.micGain ?? 2)}</b>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={params.micGain ?? 2}
                    onChange={(e) => handleSliderChange('micGain', parseInt(e.target.value, 10))}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>

                <button
                  onClick={() => {
                    globalPiano.resume().then(() => globalPiano.playTestChord());
                  }}
                  className="w-full py-1.5 rounded-full font-mono font-bold text-[11px] tracking-wider uppercase border border-[#00ffaa] text-[#00ffaa] bg-black/40 hover:bg-[#00ffaa]/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>🔊</span> TEST AUDIO ALTOPARLANTE
                </button>

                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>RIVERBERO CATTEDRALE</span>
                    <b className="text-[#00ffaa] font-black">{Number(params.reverbAmount.toFixed(2))}</b>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={params.reverbAmount}
                    onChange={(e) => handleSliderChange('reverbAmount', parseFloat(e.target.value))}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>POTENZA REATTIVA AUDIO</span>
                    <b className="text-[#00ffaa] font-black">{params.audioPower.toFixed(1)}</b>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={params.audioPower}
                    onChange={(e) => handleSliderChange('audioPower', parseFloat(e.target.value))}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>SOGLIA MICROFONO</span>
                    <b className="text-[#00ffaa] font-black">{params.audioThreshold.toFixed(2)}</b>
                  </div>
                  <input
                    type="range"
                    min="0.02"
                    max="0.50"
                    step="0.01"
                    value={params.audioThreshold}
                    onChange={(e) => handleSliderChange('audioThreshold', parseFloat(e.target.value))}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* SEZIONE 3: ZEN & SLEEP · SORGENTI CONTINUE */}
            <div className="border border-[#aa55ff]/70 rounded-xl p-3 bg-black/65 space-y-2.5 shadow-[0_0_16px_rgba(170,85,255,0.22)]">
              <div className="text-[11px] font-mono font-bold text-[#00e5ff] tracking-wider uppercase flex items-center gap-1.5">
                <span>🌙</span> ZEN &amp; SLEEP · SORGENTI CONTINUE
              </div>

              <div className="flex flex-wrap gap-1.5">
                {([
                  { id: 'DELTA_BROWN', label: 'DELTA + BRUNO' },
                  { id: 'HZ_432', label: '432 HZ' },
                  { id: 'HZ_528', label: '528 HZ' },
                  { id: 'BOWL_THETA', label: 'CIOTOLA + THETA' },
                ] as { id: ZenPresetId; label: string }[]).map((zp) => {
                  const isActive = globalRelaxation.activePresetId === zp.id;
                  return (
                    <button
                      key={zp.id}
                      onClick={() => {
                        globalPiano.resume().catch(() => {});
                        globalRelaxation.applyZenPreset(zp.id);
                        setZenTick(t => t + 1);
                      }}
                      className={`px-3 py-1 rounded-full font-mono font-bold text-[10px] tracking-wider uppercase transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#00ffaa] text-black shadow-[0_0_10px_#00ffaa]'
                          : 'border border-[#00ffaa]/50 text-[#00ffaa] bg-black/40 hover:bg-[#00ffaa]/20'
                      }`}
                    >
                      {zp.label}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2 font-mono text-[10px]">
                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>FREQUENZA TONO</span>
                    <b className="text-[#00ffaa] font-black">{Math.round(globalRelaxation.toneFreq)} Hz</b>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="1"
                    value={globalRelaxation.toneFreq}
                    onChange={(e) => {
                      globalRelaxation.setToneFreq(parseFloat(e.target.value));
                      setZenTick(t => t + 1);
                    }}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                  <button
                    onClick={() => {
                      globalPiano.resume().catch(() => {});
                      globalRelaxation.toggleTone();
                      setZenTick(t => t + 1);
                    }}
                    className={`mt-1 w-full py-1.5 rounded-full font-mono font-bold text-[10px] tracking-wider uppercase transition-all cursor-pointer ${
                      globalRelaxation.isToneActive
                        ? 'bg-[#00ffaa] text-black shadow-[0_0_12px_#00ffaa]'
                        : 'border border-[#00ffaa]/50 text-[#00ffaa] bg-black/40 hover:bg-[#00ffaa]/15'
                    }`}
                  >
                    TONO: {globalRelaxation.isToneActive ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>BATTIMENTO BINAURALE</span>
                    <b className="text-[#00ffaa] font-black">{globalRelaxation.binauralHz.toFixed(1)} Hz</b>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="40.0"
                    step="0.5"
                    value={globalRelaxation.binauralHz}
                    onChange={(e) => {
                      globalRelaxation.setBinauralHz(parseFloat(e.target.value));
                      setZenTick(t => t + 1);
                    }}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                  <button
                    onClick={() => {
                      globalPiano.resume().catch(() => {});
                      globalRelaxation.toggleBinaural();
                      setZenTick(t => t + 1);
                    }}
                    className={`mt-1 w-full py-1.5 rounded-full font-mono font-black text-[10px] tracking-wider uppercase transition-all cursor-pointer ${
                      globalRelaxation.isBinauralActive
                        ? 'bg-[#00ffaa] text-black shadow-[0_0_12px_#00ffaa]'
                        : 'border border-[#00ffaa]/50 text-[#00ffaa] bg-black/40 hover:bg-[#00ffaa]/15'
                    }`}
                  >
                    BINAURALE: {globalRelaxation.isBinauralActive ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div>
                  <span className="block text-[#00ffaa] uppercase mb-1">RUMORE COLORATO</span>
                  <select
                    value={globalRelaxation.noiseMode}
                    onChange={(e) => {
                      globalPiano.resume().catch(() => {});
                      globalRelaxation.setNoiseMode(e.target.value as NoiseMode);
                      setZenTick(t => t + 1);
                    }}
                    className="w-full bg-[#021008] border border-[#aa55ff]/70 rounded-xl px-3 py-2 text-[#00ffaa] font-mono font-bold text-[11px] outline-none cursor-pointer"
                  >
                    <option value="OFF">Disattivo</option>
                    <option value="BROWN">Rumore Bruno</option>
                    <option value="PINK">Rumore Rosa</option>
                    <option value="WHITE">Rumore Bianco</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    onClick={() => {
                      globalPiano.resume().catch(() => {});
                      globalRelaxation.toggleBowl();
                      setZenTick(t => t + 1);
                    }}
                    className={`py-1.5 rounded-full font-mono font-black text-[10px] tracking-wider uppercase transition-all cursor-pointer ${
                      globalRelaxation.isBowlActive
                        ? 'bg-[#00ffaa] text-black shadow-[0_0_12px_#00ffaa]'
                        : 'border border-[#00ffaa]/50 text-[#00ffaa] bg-black/40'
                    }`}
                  >
                    CIOTOLA ARMONICA: {globalRelaxation.isBowlActive ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => {
                      globalRelaxation.toggleBreath();
                      setZenTick(t => t + 1);
                    }}
                    className={`py-1.5 rounded-full font-mono font-black text-[10px] tracking-wider uppercase transition-all cursor-pointer ${
                      globalRelaxation.isBreathActive
                        ? 'bg-[#00ffaa] text-black shadow-[0_0_12px_#00ffaa]'
                        : 'border border-[#00ffaa]/50 text-[#00ffaa] bg-black/40'
                    }`}
                  >
                    RESPIRO GUIDATO: {globalRelaxation.isBreathActive ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>VOLUME TONI</span>
                    <b className="text-[#00ffaa] font-black">{Math.round(globalRelaxation.toneVolume * 100)}%</b>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={globalRelaxation.toneVolume}
                    onChange={(e) => {
                      globalRelaxation.setToneVolume(parseFloat(e.target.value));
                      setZenTick(t => t + 1);
                    }}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>VOLUME RUMORE</span>
                    <b className="text-[#00ffaa] font-black">{Math.round(globalRelaxation.noiseVolume * 100)}%</b>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={globalRelaxation.noiseVolume}
                    onChange={(e) => {
                      globalRelaxation.setNoiseVolume(parseFloat(e.target.value));
                      setZenTick(t => t + 1);
                    }}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>

                <div>
                  <span className="block text-[#00ffaa] uppercase mb-1">TIMER DISSOLVENZA</span>
                  <div className="flex gap-2 items-center">
                    <select
                      value={globalRelaxation.timerMinutes}
                      onChange={(e) => {
                        globalRelaxation.setTimerMinutes(parseInt(e.target.value, 10));
                        setZenTick(t => t + 1);
                      }}
                      className="flex-1 bg-[#021008] border border-[#aa55ff]/70 rounded-xl px-3 py-2 text-[#00ffaa] font-mono font-bold text-[11px] outline-none cursor-pointer"
                    >
                      <option value={15}>15 minuti</option>
                      <option value={30}>30 minuti</option>
                      <option value={45}>45 minuti</option>
                      <option value={60}>60 minuti</option>
                    </select>
                    <button
                      onClick={() => {
                        if (globalRelaxation.isTimerRunning) {
                          globalRelaxation.stopSleepTimer();
                        } else {
                          globalRelaxation.startSleepTimer(globalRelaxation.timerMinutes);
                        }
                        setZenTick(t => t + 1);
                      }}
                      className={`px-3.5 py-2 rounded-full font-mono font-bold text-[10px] tracking-wider uppercase transition-all cursor-pointer whitespace-nowrap ${
                        globalRelaxation.isTimerRunning
                          ? 'bg-[#ff2244] text-white shadow-[0_0_12px_#ff2244]'
                          : 'border border-[#00ffaa] text-[#00ffaa] bg-black/50 hover:bg-[#00ffaa]/20'
                      }`}
                    >
                      {globalRelaxation.isTimerRunning ? `STOP (${formatTimer(sleepTimerRemaining)})` : 'AVVIA TIMER'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-[9.5px] text-[#00ffaa]/75 leading-relaxed font-mono pt-1">
                Interazione armonica attiva con i suoni Zen: il movimento modula lievemente l'intonazione; il ritmo lento delle frequenze anima lo sciame con una pulsazione radiale morbida. Il timer dissolve le sorgenti Zen nell'ultimo minuto e poi le arresta. I battimenti binaurali richiedono cuffie stereo.
              </div>
            </div>

            {/* SEZIONE 4: MIDI OUT · LOGIC PRO */}
            <div className="border border-[#00ffaa]/50 rounded-xl p-3 bg-black/60 space-y-2.5 shadow-[0_0_15px_rgba(0,255,170,0.15)]">
              <div className="text-[11px] font-mono font-bold text-[#00e5ff] tracking-wider uppercase flex items-center gap-1.5">
                <span>🎛</span> MIDI OUT · LOGIC PRO
              </div>

              <button
                onClick={onToggleMidi}
                className={`w-full py-2 rounded-full font-mono font-black text-[11px] tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isMidiActive
                    ? 'bg-[#00ffaa] text-black shadow-[0_0_18px_#00ffaa]'
                    : 'border border-[#00ffaa]/50 text-[#00ffaa] bg-black/40 hover:bg-[#00ffaa]/20'
                }`}
              >
                <span>🎛</span> {isMidiActive ? 'MIDI ATTIVO — tocca per spegnere' : 'ATTIVA MIDI OUT'}
              </button>

              <div className="space-y-2 font-mono text-[10px]">
                <div>
                  <span className="block text-[#00ffaa] uppercase mb-1">PORTA DI USCITA</span>
                  <select
                    className="w-full bg-[#021008] border border-[#00ffaa] rounded-xl px-3 py-2 text-[#00ffaa] font-mono font-bold text-[11px] outline-none cursor-pointer"
                  >
                    <option>Automatica (IAC se presente)</option>
                    <option>Driver IAC Bus 1</option>
                    <option>Logic Pro Virtual In</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>CANALE MIDI</span>
                    <b className="text-[#00ffaa] font-black">{midiChannel}</b>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="16"
                    step="1"
                    value={midiChannel}
                    onChange={(e) => {
                      const ch = parseInt(e.target.value, 10);
                      setMidiChannel(ch);
                      globalPiano.midiChannel = ch;
                    }}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      const next = !midiNotesOn;
                      setMidiNotesOn(next);
                      globalPiano.midiNotesEnabled = next;
                    }}
                    className={`py-1.5 rounded-full font-mono font-black text-[11px] tracking-wider uppercase transition-all cursor-pointer ${
                      midiNotesOn ? 'bg-[#00ffaa] text-black shadow-[0_0_12px_#00ffaa]' : 'border border-[#00ffaa]/40 text-[#00ffaa]'
                    }`}
                  >
                    🎹 NOTE: {midiNotesOn ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => {
                      const next = !midiCcOn;
                      setMidiCcOn(next);
                      globalPiano.midiCCEnabled = next;
                    }}
                    className={`py-1.5 rounded-full font-mono font-black text-[11px] tracking-wider uppercase transition-all cursor-pointer ${
                      midiCcOn ? 'bg-[#00ffaa] text-black shadow-[0_0_12px_#00ffaa]' : 'border border-[#00ffaa]/40 text-[#00ffaa]'
                    }`}
                  >
                    🎚️ CONTROLLI CC: {midiCcOn ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

              <div className="text-[10px] text-[#00ffaa] font-mono pt-1">
                MIDI: {isMidiActive ? `attivo · ${midiDeviceName} · canale ${midiChannel}` : 'non attivo'}
              </div>

              <div className="text-[9.5px] text-[#00ffaa]/75 leading-relaxed font-mono">
                Le note suonate da Nebula (tocco, mano, microfono, note cinetiche, cristalli, anelli) escono come note MIDI. CC1 = posizione orizzontale · CC74 = posizione verticale (invertita) · CC11 = mano chiusa / dito premuto. Su Mac: Configurazione Audio MIDI &gt; Finestra &gt; Mostra Studio MIDI &gt; doppio clic su Driver IAC &gt; spunta "Dispositivo online". In Logic usa una traccia Software Instrument. Funziona su Chrome, Edge e Brave (non su Safari e iPhone). Con l'audio in MUTO le note escono comunque in MIDI.
              </div>
            </div>

            {/* SEZIONE 5: SUONI CRISTALLINI (IMPATTI TRA PARTICELLE) */}
            <div className="border border-[#00ffaa]/50 rounded-xl p-3 bg-black/60 space-y-2.5 shadow-[0_0_15px_rgba(0,255,170,0.15)]">
              <div className="text-[11px] font-mono font-bold text-[#00e5ff] tracking-wider uppercase flex items-center gap-1.5">
                <span>💎</span> SUONI CRISTALLINI (IMPATTI TRA PARTICELLE)
              </div>

              <button
                onClick={() => onUpdateParams({ crystalOn: !(params.crystalOn ?? true) })}
                className={`w-full py-1.5 rounded-full font-mono font-bold text-[11px] tracking-wider uppercase border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  (params.crystalOn ?? true)
                    ? 'bg-[#00ffaa] text-black border-[#00ffaa] shadow-[0_0_15px_#00ffaa]'
                    : 'border border-[#00ffaa] text-[#00ffaa] bg-black/40 hover:bg-[#00ffaa]/15'
                }`}
              >
                <span>💎</span> CRISTALLI: {(params.crystalOn ?? true) ? 'ON' : 'OFF'}
              </button>

              <div className="flex flex-wrap gap-2">
                {([
                  { id: 'IMPACTS', label: 'IMPATTI' },
                  { id: 'SPARKS', label: 'SCINTILLE' },
                  { id: 'SPHERES', label: 'SFERE' },
                  { id: 'ALL', label: 'TUTTI' },
                ] as const).map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => onUpdateParams({ crystalMode: mode.id })}
                    className={`px-3 py-1 rounded-full font-mono font-bold text-[10px] tracking-wider uppercase transition-all cursor-pointer ${
                      (params.crystalMode ?? 'ALL') === mode.id
                        ? 'bg-[#00ffaa] text-black shadow-[0_0_10px_#00ffaa]'
                        : 'border border-[#00ffaa]/50 text-[#00ffaa] bg-black/40 hover:bg-[#00ffaa]/20'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              <div className="text-[10px] text-[#00ffaa]/75 leading-relaxed font-mono">
                Tutte le modalità insieme: suona l'evento più forte.
              </div>

              <div className="space-y-2 font-mono text-[10px]">
                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>SENSIBILITÀ IMPATTI</span>
                    <b className="text-[#00ffaa] font-black">{(params.crystalSens ?? 0.05).toFixed(2)}</b>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.50"
                    step="0.01"
                    value={params.crystalSens ?? 0.05}
                    onChange={(e) => handleSliderChange('crystalSens', parseFloat(e.target.value))}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                  <div className="text-[9.5px] text-[#00ffaa]/75 mt-0.5">
                    Più alta = bastano urti più lievi. Prova ad agitare lo sciame (tocco, Wanderer, microfono).
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>DENSITÀ MASSIMA (colpi al secondo)</span>
                    <b className="text-[#00ffaa] font-black">{Math.round(params.crystalRate ?? 2)}</b>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={params.crystalRate ?? 2}
                    onChange={(e) => handleSliderChange('crystalRate', parseInt(e.target.value, 10))}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>VOLUME CRISTALLI</span>
                    <b className="text-[#00ffaa] font-black">{(params.crystalLevel ?? 0.70).toFixed(2)}</b>
                  </div>
                  <input
                    type="range"
                    min="0.02"
                    max="1.0"
                    step="0.02"
                    value={params.crystalLevel ?? 0.70}
                    onChange={(e) => handleSliderChange('crystalLevel', parseFloat(e.target.value))}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* SEZIONE 6: MOTORE AUDIO PIANOFORTE & SUITE ARMONICA */}
            <div className="border border-[#00ffaa]/50 rounded-xl p-3 bg-black/60 space-y-3 shadow-[0_0_15px_rgba(0,255,170,0.15)]">
              <div className="text-[11px] font-mono font-bold text-[#00e5ff] tracking-wider uppercase flex items-center justify-between">
                <span>🎵 MOTORE AUDIO PIANOFORTE &amp; SUITE ARMONICA</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[10.5px] font-mono font-bold text-[#00ffaa]">
                  🎹 TASTIERA PIANOFORTE INTERATTIVA (C3 - C6):
                </span>
                <button
                  onClick={() => {
                    globalPiano.resume().then(() => globalPiano.playTestChord());
                  }}
                  className="px-3 py-1 rounded-full border border-[#00ffaa] text-[#00ffaa] hover:bg-[#00ffaa]/20 text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <span>🔊</span> ACCORDO TEST
                </button>
              </div>

              {/* 16 PENTATONIC KEYS IN 2 ROWS OF 8 */}
              <div className="grid grid-cols-8 gap-1.5">
                {PIANO_16_KEYS.map(k => (
                  <button
                    key={k.name}
                    onClick={() => {
                      globalPiano.resume().then(() => {
                        if (k.idx < 15) {
                          globalPiano.triggerPentatonicNote(k.idx, 0.85);
                        } else {
                          globalPiano.playNote(1046.50, 0.85);
                        }
                      });
                    }}
                    className="py-2.5 rounded-lg border border-[#00ffaa] text-[#00ffaa] bg-[#02140a] hover:bg-[#00ffaa] hover:text-black font-mono font-bold text-[10px] text-center transition-all cursor-pointer active:scale-95 shadow-[0_0_6px_rgba(0,255,170,0.2)]"
                  >
                    {k.name}
                  </button>
                ))}
              </div>

              {/* BUTTONS ROW: NOTE CINETICHE & AUDIO 3D */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => onUpdateParams({ isKineticNotesOn: !(params.isKineticNotesOn ?? true) })}
                  className={`py-1.5 rounded-full font-mono font-black text-[11px] tracking-wider uppercase transition-all cursor-pointer ${
                    (params.isKineticNotesOn ?? true) ? 'bg-[#00ffaa] text-black shadow-[0_0_12px_#00ffaa]' : 'border border-[#00ffaa]/50 text-[#00ffaa]'
                  }`}
                >
                  🎵 NOTE CINETICHE: {(params.isKineticNotesOn ?? true) ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => onUpdateParams({ isSpatial3DOn: !(params.isSpatial3DOn ?? true) })}
                  className={`py-1.5 rounded-full font-mono font-black text-[11px] tracking-wider uppercase transition-all cursor-pointer ${
                    (params.isSpatial3DOn ?? true) ? 'bg-[#00ffaa] text-black shadow-[0_0_12px_#00ffaa]' : 'border border-[#00ffaa]/50 text-[#00ffaa]'
                  }`}
                >
                  🎧 AUDIO 3D: {(params.isSpatial3DOn ?? true) ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* PROFILO TIMBRO PIANOFORTE */}
              <div className="space-y-1.5">
                <span className="block text-[10px] text-[#00ffaa] font-mono font-bold uppercase">
                  PROFILO TIMBRO PIANOFORTE
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {([
                    { label: '🎹 ACUSTICO', profile: 'PIANO' },
                    { label: '🌌 COSMICO POLIRITMICO', profile: 'CRYSTAL' },
                    { label: '✨ IBRIDO GESTURE', profile: 'CRYSTAL' },
                    { label: '🎹 PIANO MORBIDO', profile: 'PIANO' },
                    { label: '☁️ PAD MORBIDO', profile: 'PAD' },
                    { label: '🌌 DRONE POLIFONICO', profile: 'DRONE' },
                  ] as const).map(prof => {
                    const isSelected = pianoChip === prof.label || (prof.label === '🌌 DRONE POLIFONICO' && (params.pianoProfile ?? 'DRONE') === 'DRONE' && pianoChip.includes('DRONE'));
                    return (
                      <button
                        key={prof.label}
                        onClick={() => {
                          setPianoChip(prof.label);
                          onUpdateParams({ pianoProfile: prof.profile });
                        }}
                        className={`px-3 py-1 rounded-full font-mono font-bold text-[10px] tracking-wider uppercase transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#00ffaa] text-black shadow-[0_0_12px_#00ffaa]'
                            : 'border border-[#00ffaa]/50 text-[#00ffaa] bg-black/40 hover:bg-[#00ffaa]/20'
                        }`}
                      >
                        {prof.label}
                      </button>
                    );
                  })}
                </div>
                <div className="text-[9.5px] text-[#00ffaa]/75 leading-relaxed font-mono">
                  Drone polifonico: le altezze suonate restano sospese e si sommano (max 8 voci); le note ripetute rinnovano la voce.
                </div>
              </div>

              {/* PATTERN ARPEGGIATORE POLIRITMICO */}
              <div className="space-y-1.5">
                <span className="block text-[10px] text-[#00ffaa] font-mono font-bold uppercase">
                  PATTERN ARPEGGIATORE POLIRITMICO
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'OFF', label: 'OFF' },
                    { id: 'UP', label: 'UP' },
                    { id: 'DOWN', label: 'DOWN' },
                    { id: 'UP_DOWN', label: 'UP-DOWN' },
                    { id: 'POLY_3_2', label: 'POLY 3:2' },
                    { id: 'POLY_4_3', label: 'POLY 4:3' },
                    { id: 'RANDOM', label: 'RANDOM' },
                  ].map(pat => (
                    <button
                      key={pat.id}
                      onClick={() => onUpdateParams({ arpPattern: pat.id })}
                      className={`px-3 py-1 rounded-full font-mono font-bold text-[10px] tracking-wider uppercase transition-all cursor-pointer ${
                        (params.arpPattern ?? 'POLY_4_3') === pat.id
                          ? 'bg-[#00ffaa] text-black shadow-[0_0_12px_#00ffaa]'
                          : 'border border-[#00ffaa]/50 text-[#00ffaa] bg-black/40 hover:bg-[#00ffaa]/20'
                      }`}
                    >
                      {pat.label}
                    </button>
                  ))}
                </div>
                <div className="text-[9.5px] text-[#00ffaa]/75 leading-relaxed font-mono">
                  Sincronizza pattern melodici e poliritmie sulla velocità delle particelle.
                </div>
              </div>

              {/* DIVISIONE METRICA TEMPO */}
              <div className="space-y-1.5">
                <span className="block text-[10px] text-[#00ffaa] font-mono font-bold uppercase">
                  DIVISIONE METRICA TEMPO
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['1/4', '1/8', '1/16', 'TERZINE'].map(div => (
                    <button
                      key={div}
                      onClick={() => onUpdateParams({ arpDivision: div })}
                      className={`px-3 py-1 rounded-full font-mono font-bold text-[10px] tracking-wider uppercase transition-all cursor-pointer ${
                        (params.arpDivision ?? '1/4') === div
                          ? 'bg-[#00ffaa] text-black shadow-[0_0_12px_#00ffaa]'
                          : 'border border-[#00ffaa]/50 text-[#00ffaa] bg-black/40 hover:bg-[#00ffaa]/20'
                      }`}
                    >
                      {div}
                    </button>
                  ))}
                </div>
              </div>

              {/* RISONANZA ARMONICA & TIPO ACCORDO */}
              <div className="space-y-1.5">
                <span className="block text-[10px] text-[#00ffaa] font-mono font-bold uppercase">
                  RISONANZA ARMONICA &amp; TIPO ACCORDO
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'SOLO', label: 'SOLO' },
                    { id: 'POWER5', label: '5TH (POWER)' },
                    { id: 'OCTAVE', label: 'OCTAVE' },
                    { id: 'MAJOR', label: 'MAGGIORE' },
                    { id: 'MINOR', label: 'MINORE' },
                    { id: 'COSMIC7', label: 'COSMIC 7TH' },
                  ].map(c => (
                    <button
                      key={c.id}
                      onClick={() => onUpdateParams({ chordType: c.id })}
                      className={`px-3 py-1 rounded-full font-mono font-bold text-[10px] tracking-wider uppercase transition-all cursor-pointer ${
                        (params.chordType ?? 'COSMIC7') === c.id
                          ? 'bg-[#00ffaa] text-black shadow-[0_0_12px_#00ffaa]'
                          : 'border border-[#00ffaa]/50 text-[#00ffaa] bg-black/40 hover:bg-[#00ffaa]/20'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                <div className="text-[9.5px] text-[#00ffaa]/75 leading-relaxed font-mono">
                  Arricchisce le note suonate con quinte, ottave o accordi armonici risonanti.
                </div>
              </div>

              {/* SLIDERS HARMONICS & TIMBRE */}
              <div className="space-y-2.5 font-mono text-[10px]">
                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>INTENSITÀ RISONANZA CORDE (OVERTONES)</span>
                    <b className="text-[#00ffaa] font-black">{(params.chordResonance ?? 0.05).toFixed(2)}</b>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={params.chordResonance ?? 0.05}
                    onChange={(e) => handleSliderChange('chordResonance', parseFloat(e.target.value))}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>ATTACCO · MORBIDEZZA</span>
                    <b className="text-[#00ffaa] font-black">{(params.attackSoftness ?? 2.0).toFixed(2)} s</b>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="5.0"
                    step="0.1"
                    value={params.attackSoftness ?? 2.0}
                    onChange={(e) => handleSliderChange('attackSoftness', parseFloat(e.target.value))}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                  <div className="text-[9.5px] text-[#00ffaa]/75 mt-0.5">
                    Più alto = nota che sale piano, meno percussiva (vale per tutti i timbri; sul DRONE l'attacco minimo è circa 1 s).
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>SUSTAIN · CODA DELLE NOTE</span>
                    <b className="text-[#00ffaa] font-black">{(params.sustainTail ?? 6.0).toFixed(1)}x</b>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="10.0"
                    step="0.5"
                    value={params.sustainTail ?? 6.0}
                    onChange={(e) => handleSliderChange('sustainTail', parseFloat(e.target.value))}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                  <div className="text-[9.5px] text-[#00ffaa]/75 mt-0.5">
                    Allunga o accorcia la durata delle note; sul DRONE regola per quanto restano sospese le voci.
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>BRILLANTEZZA TIMBRO (ARMONICHE)</span>
                    <b className="text-[#00ffaa] font-black">{params.pianoBrightness.toFixed(1)}</b>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1.0"
                    step="0.05"
                    value={params.pianoBrightness}
                    onChange={(e) => handleSliderChange('pianoBrightness', parseFloat(e.target.value))}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>SMORZAMENTO NOTE (anti-martellamento)</span>
                    <b className="text-[#00ffaa] font-black">{(params.noteDamping ?? 1.0).toFixed(2)}</b>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="3.0"
                    step="0.1"
                    value={params.noteDamping ?? 1.0}
                    onChange={(e) => handleSliderChange('noteDamping', parseFloat(e.target.value))}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                  <div className="text-[9.5px] text-[#00ffaa]/75 mt-0.5">
                    Più alto = dopo ogni nota servono più energia e più tempo per la successiva: le note arrivano a frasi, non a metronomo.
                  </div>
                </div>

                {/* MODO NOTE CINETICHE */}
                <div className="pt-1 space-y-1.5">
                  <span className="block text-[10px] text-[#00ffaa] font-mono font-bold uppercase">
                    MODO NOTE CINETICHE
                  </span>
                  <div className="flex gap-2">
                    {([
                      { id: 'ONSET', label: 'SU VARIAZIONI' },
                      { id: 'CONTINUOUS', label: 'CONTINUO' },
                    ] as const).map(m => (
                      <button
                        key={m.id}
                        onClick={() => onUpdateParams({ kineticMode: m.id })}
                        className={`px-3 py-1 rounded-full font-mono font-bold text-[10px] tracking-wider uppercase transition-all cursor-pointer ${
                          (params.kineticMode ?? 'ONSET') === m.id
                            ? 'bg-[#00ffaa] text-black shadow-[0_0_12px_#00ffaa]'
                            : 'border border-[#00ffaa]/50 text-[#00ffaa] bg-black/40 hover:bg-[#00ffaa]/20'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                  <div className="text-[9.5px] text-[#00ffaa]/75 leading-relaxed font-mono">
                    Su variazioni: suona quando il movimento cambia (gesti, urti, anelli), non mentre è stabile. Continuo: il comportamento precedente.
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>SOGLIA DI TRIGGER CINETICA</span>
                    <b className="text-[#00ffaa] font-black">{(params.triggerThreshold ?? 0.1).toFixed(1)}</b>
                  </div>
                  <input
                    type="range"
                    min="0.02"
                    max="0.50"
                    step="0.01"
                    value={params.triggerThreshold ?? 0.1}
                    onChange={(e) => handleSliderChange('triggerThreshold', parseFloat(e.target.value))}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>SENSIBILITÀ CINETICA GENERATORE</span>
                    <b className="text-[#00ffaa] font-black">{(params.kineticSensitivity ?? 0.1).toFixed(1)}</b>
                  </div>
                  <input
                    type="range"
                    min="0.02"
                    max="0.50"
                    step="0.01"
                    value={params.kineticSensitivity ?? 0.1}
                    onChange={(e) => handleSliderChange('kineticSensitivity', parseFloat(e.target.value))}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[#00ffaa]">
                    <span>RIVERBERO SPAZIALE CATTEDRALE (WET/DRY)</span>
                    <b className="text-[#00ffaa] font-black">{Number(params.reverbAmount.toFixed(2))}</b>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={params.reverbAmount}
                    onChange={(e) => handleSliderChange('reverbAmount', parseFloat(e.target.value))}
                    className="w-full accent-[#00ffaa] cursor-pointer"
                  />
                  <div className="text-[9.5px] text-[#00ffaa]/75 mt-0.5">
                    L'audio 3D segue in tempo reale il moto orbitale di Wanderer nello spazio stereo con crossfeed morbido.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: INPUT (EXACT REPLICA FROM SCREENSHOT 2.17.52) */}
        {/* ========================================================================= */}
        {activeTab === 'input' && (
          <div className="space-y-3.5">
            {/* SEZIONE 1: CATTURA, VIDEO & FULLSCREEN (BORDO ROSA/MAGENTA) */}
            <div className="border border-[#ff3366]/40 rounded-xl p-3 bg-black/60 space-y-2.5 shadow-[0_0_15px_rgba(255,51,102,0.2)]">
              <div className="text-[11px] font-mono font-bold text-[#ff3366] tracking-wider uppercase flex items-center gap-1.5">
                <span>🎬</span> CATTURA, VIDEO & FULLSCREEN
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onTakePhoto}
                  className="py-2 rounded-full font-mono font-bold text-[11px] tracking-wider uppercase border border-[#00ffaa] text-[#00ffaa] bg-black/40 hover:bg-[#00ffaa]/20 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_10px_rgba(0,255,170,0.2)]"
                >
                  <span>📸</span> FOTO PNG
                </button>
                <button
                  onClick={onToggleRecord}
                  className={`py-2 rounded-full font-mono font-bold text-[11px] tracking-wider uppercase border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isRecording
                      ? 'border-[#ff0055] bg-[#ff0055] text-white shadow-[0_0_15px_#ff0055]'
                      : 'border-[#ff3366] text-[#ff3366] bg-black/40 hover:bg-[#ff3366]/20'
                  }`}
                >
                  <span>🎥</span> REC VIDEO
                </button>
              </div>
              <button
                onClick={onToggleFullscreen}
                className="w-full py-2 rounded-full font-mono font-bold text-[11px] tracking-wider uppercase border border-[#00ffaa] text-[#00ffaa] bg-black/40 hover:bg-[#00ffaa]/20 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_10px_rgba(0,255,170,0.2)]"
              >
                <span>⛶</span> SCHERMO INTERO (FULLSCREEN)
              </button>
            </div>

            {/* SEZIONE 2: PORTALE DOWNLOAD & PACCHETTI */}
            <div className="border border-[#00ffaa]/50 rounded-xl p-3 bg-black/60 space-y-2 shadow-[0_0_15px_rgba(0,255,170,0.15)]">
              <div className="text-[11px] font-mono font-bold text-[#00e5ff] tracking-wider uppercase flex items-center gap-1.5">
                <span>📦</span> PORTALE DOWNLOAD & PACCHETTI
              </div>
              <button
                onClick={onOpenDownloadPortal}
                className="w-full py-2 rounded-full font-mono font-bold text-[11px] tracking-wider uppercase border border-[#00ffaa] text-[#00ffaa] bg-black/40 hover:bg-[#00ffaa]/20 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_10px_rgba(0,255,170,0.2)]"
              >
                <span>📦</span> APRI PORTALE DOWNLOAD
              </button>
              <button
                onClick={onOpenDownloadPortal}
                className="w-full py-2 rounded-full font-mono font-bold text-[11px] tracking-wider uppercase border border-[#00ffaa] text-[#00ffaa] bg-black/40 hover:bg-[#00ffaa]/20 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_10px_rgba(0,255,170,0.2)]"
              >
                <span>🌐</span> PAGINA PORTALE WEB (/portal)
              </button>
              <div className="text-[10px] text-[#00ffaa]/75 text-center font-mono pt-0.5">
                Scarica Mac, iOS, pacchetti ZIP ed esegui offline
              </div>
            </div>

            {/* SEZIONE 3: ACCELEROMETRO & TILT SCIAME (BORDO ORO/AMBRA) */}
            <div className="border border-[#ffaa00]/60 rounded-xl p-3 bg-black/60 space-y-2.5 shadow-[0_0_15px_rgba(255,170,0,0.25)]">
              <div className="text-[11px] font-mono font-bold text-[#ffaa00] tracking-wider uppercase flex items-center gap-1.5">
                <span>🧭</span> ACCELEROMETRO & TILT SCIAME
              </div>

              <button
                onClick={onToggleTilt}
                className={`w-full py-1.5 rounded-full font-mono font-bold text-[11px] tracking-wider uppercase border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isTiltActive
                    ? 'bg-[#ffaa00] text-black border-[#ffaa00] shadow-[0_0_15px_#ffaa00]'
                    : 'border border-[#ffaa00] text-[#ffaa00] bg-black/40 hover:bg-[#ffaa00]/20'
                }`}
              >
                <span>🧭</span> ACCELEROMETRO: {isTiltActive ? 'ON' : 'OFF'}
              </button>

              <div className="space-y-2 font-mono text-[10px]">
                <div>
                  <div className="flex justify-between items-center text-[#ffaa00]">
                    <span>SENSIBILITÀ GRAVITÀ TILT</span>
                    <b className="text-[#ffaa00] font-black">{tiltSensLocal.toFixed(1)}x</b>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.1"
                    value={tiltSensLocal}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setTiltSensLocal(v);
                      if (onUpdateTiltParams) onUpdateTiltParams(v, tiltSmoothLocal);
                    }}
                    className="w-full accent-[#ffaa00] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[#ffaa00]">
                    <span>SMORZAMENTO / FLUIDITÀ</span>
                    <b className="text-[#ffaa00] font-black">{tiltSmoothLocal.toFixed(2)}</b>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.50"
                    step="0.05"
                    value={tiltSmoothLocal}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setTiltSmoothLocal(v);
                      if (onUpdateTiltParams) onUpdateTiltParams(tiltSensLocal, v);
                    }}
                    className="w-full accent-[#ffaa00] cursor-pointer"
                  />
                </div>
              </div>

              <div className="text-[10px] text-[#ffaa00]/80 text-center font-mono">
                TILT: X: {tiltAngleX.toFixed(1)}° | Y: {tiltAngleY.toFixed(1)}° (Inclinando il dispositivo lo sciame scivola)
              </div>
            </div>

            {/* SEZIONE 4: WEBCAM & TRACCIAMENTO AI */}
            <div className="border border-[#00ffaa]/50 rounded-xl p-3 bg-black/60 space-y-2 shadow-[0_0_15px_rgba(0,255,170,0.15)]">
              <div className="text-[11px] font-mono font-bold text-[#00e5ff] tracking-wider uppercase flex items-center gap-1.5">
                <span>📽️</span> WEBCAM & TRACCIAMENTO AI
              </div>

              <button
                onClick={onToggleCam}
                className={`w-full py-2 rounded-full font-mono font-bold text-[11px] tracking-wider uppercase border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isCamActive
                    ? 'border-[#00ffaa] bg-[#00ffaa]/20 text-[#00ffaa]'
                    : 'border-[#00ffaa]/40 text-[#00ffaa]/60 bg-black/40 hover:bg-[#00ffaa]/15'
                }`}
              >
                <span>📽️</span> WEBCAM: {isCamActive ? 'ON' : 'OFF'}
              </button>

              <div className="text-[10px] text-[#00ffaa]/75 text-center font-mono">
                Tocca e trascina ovunque per attrarre lo sciame gravitazionale
              </div>
            </div>
          </div>
        )}
      </div>

      {/* HUB FOOTER (RESTORE BUTTON EXACTLY AS IN SCREENSHOTS) */}
      <div
        id="hub-foot"
        className="p-3 bg-[#010804] border-t border-[#00ffaa]/20"
      >
        <button
          onClick={handleReset}
          className="w-full py-2.5 rounded-xl border border-[#ffaa00] text-[#ffaa00] bg-black/60 hover:bg-[#ffaa00]/15 font-mono font-black text-[12px] tracking-wider uppercase transition-all shadow-[0_0_12px_rgba(255,170,0,0.25)] flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>🔄</span> RIPRISTINA FISICA, LUCI & AUDIO
        </button>
      </div>
    </div>
  );
};
