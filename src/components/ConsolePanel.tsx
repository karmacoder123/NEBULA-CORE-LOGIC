/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState } from 'react';
import { SimulationParams, TouchMode, AudioMode, GeometryType } from '../types.ts';
import { REMASTERED_VERSION_DATA, REMASTERED_KEYS } from '../engine/remasteredEngine.ts';
import { globalPiano } from '../audio/pianoEngine.ts';
import { Eye, EyeOff, Sparkles, Sliders, Activity, Sun, Volume2, Shield, Download } from 'lucide-react';

interface ConsolePanelProps {
  params: SimulationParams;
  currentV: string;
  isCycleActive: boolean;
  currentGeoType: GeometryType;
  onUpdateParams: (newParams: Partial<SimulationParams>) => void;
  onSelectVersion: (version: string) => void;
  onToggleCycle: () => void;
  onChangeGeoType: (geo: GeometryType) => void;
  onOpenDownloadPortal?: () => void;
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({
  params,
  currentV,
  isCycleActive,
  currentGeoType,
  onUpdateParams,
  onSelectVersion,
  onToggleCycle,
  onChangeGeoType,
  onOpenDownloadPortal,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'physics' | 'forces' | 'visual' | 'audio' | 'lights'>('presets');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const autoSaveTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const handleSliderChange = (key: keyof SimulationParams, value: number) => {
    onUpdateParams({ [key]: value });
    if (key === 'pianoVolume') globalPiano.setVolume(value);
    if (key === 'reverbAmount') globalPiano.setReverb(value);
    if (key === 'pianoBrightness') globalPiano.setBrightness(value);
    if (key === 'triggerRateMs') globalPiano.triggerRateMs = value;

    // Auto-save preset to localStorage
    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    autoSaveTimeout.current = setTimeout(() => {
      try {
        const payload = {
          version: currentV,
          params: { ...params, [key]: value },
          updated: Date.now()
        };
        localStorage.setItem('nebula_core_autosaved_preset', JSON.stringify(payload));
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 1800);
      } catch (e) {
        console.warn("Auto-save failed", e);
      }
    }, 400);
  };

  const handleNextPreset = () => {
    const nextIdx = (REMASTERED_KEYS.indexOf(currentV) + 1) % REMASTERED_KEYS.length;
    onSelectVersion(REMASTERED_KEYS[nextIdx]);
  };

  const handleResetPhysics = () => {
    onUpdateParams({
      friction: 0.96,
      elasticity: 0.0016,
      pSize: 3.2,
      pSpin: 1.2,
      handPower: 5.5,
      wanderPush: 25.0,
      spectraPull: 45.0,
      trailOpacity: 0.14
    });
  };

  return (
    <>
      {/* Floating Restore Button when Console is Collapsed */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#031008]/95 border border-[#00ff88] text-[#00ff88] px-5 py-2 rounded-full font-mono font-bold text-xs shadow-[0_0_20px_rgba(0,255,136,0.4)] flex items-center gap-2 cursor-pointer hover:bg-[#003318] transition-all"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>APRI PANNELLO CONTROLLI [H]</span>
        </button>
      )}

      {/* Main Console Box */}
      <div
        id="console-panel"
        className={`fixed bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 z-30 bg-[#041109]/95 border border-[#00aa55] rounded-2xl backdrop-blur-2xl shadow-2xl shadow-black/90 p-3.5 max-w-[880px] w-[94vw] transition-all duration-300 ${
          isCollapsed ? 'translate-y-[150%] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100 pointer-events-auto'
        }`}
      >
        {/* Top Header & Tab Switchers */}
        <div className="flex items-center justify-between border-b border-[#004422] pb-2 mb-2.5 overflow-x-auto gap-2">
          <div className="flex gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('presets')}
              className={`px-2.5 py-1 rounded-md text-[10px] md:text-[11px] font-mono font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'presets' ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/50' : 'text-[#66aa88] hover:text-[#00ff88]'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>PRESETS ({REMASTERED_KEYS.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('physics')}
              className={`px-2.5 py-1 rounded-md text-[10px] md:text-[11px] font-mono font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'physics' ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/50' : 'text-[#66aa88] hover:text-[#00ff88]'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>PHYSICS</span>
            </button>

            <button
              onClick={() => setActiveTab('forces')}
              className={`px-2.5 py-1 rounded-md text-[10px] md:text-[11px] font-mono font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'forces' ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/50' : 'text-[#66aa88] hover:text-[#00ff88]'
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>FORCES</span>
            </button>

            <button
              onClick={() => setActiveTab('visual')}
              className={`px-2.5 py-1 rounded-md text-[10px] md:text-[11px] font-mono font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'visual' ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/50' : 'text-[#66aa88] hover:text-[#00ff88]'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>VISUAL</span>
            </button>

            <button
              onClick={() => setActiveTab('audio')}
              className={`px-2.5 py-1 rounded-md text-[10px] md:text-[11px] font-mono font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'audio' ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/50' : 'text-[#66aa88] hover:text-[#00ff88]'
              }`}
            >
              <Volume2 className="w-3 h-3" />
              <span>AUDIO & SYNTH</span>
            </button>

            <button
              onClick={() => setActiveTab('lights')}
              className={`px-2.5 py-1 rounded-md text-[10px] md:text-[11px] font-mono font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'lights' ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/50' : 'text-[#66aa88] hover:text-[#00ff88]'
              }`}
            >
              <Sun className="w-3 h-3" />
              <span>LIGHTS</span>
            </button>

            {onOpenDownloadPortal && (
              <button
                onClick={onOpenDownloadPortal}
                className="px-2.5 py-1 rounded-md text-[10px] md:text-[11px] font-mono font-bold bg-gradient-to-r from-[#00381e] to-[#002a3a] border border-[#00ff88] text-[#00ff88] hover:text-white hover:shadow-[0_0_12px_rgba(0,255,136,0.5)] transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0"
                title="Apri Portale Download (Android, iPhone, PC, Mac, HTML offline)"
              >
                <Download className="w-3 h-3 text-[#00ff88]" />
                <span>📲 SCARICA APP</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {autoSaved && (
              <span className="text-[9px] font-mono text-[#00ff88] bg-[#00ff88]/15 border border-[#00ff88]/50 px-2 py-0.5 rounded-full font-bold">
                ✓ AUTO-SAVED
              </span>
            )}
            <button
              onClick={() => setIsCollapsed(true)}
              className="text-[#66aa88] hover:text-[#00ff88] p-1 rounded cursor-pointer"
              title="Nascondi consolle (H)"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab 1: PRESETS */}
        {activeTab === 'presets' && (
          <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
            <div className="flex flex-wrap gap-1.5">
              {REMASTERED_KEYS.map((key) => {
                const isSelected = key === currentV;
                const formName = REMASTERED_VERSION_DATA[key]?.form || 'SWARM';
                const isWhiteOptimized = ['V4', 'V6', 'V8', 'V9', 'V10'].includes(key);

                return (
                  <button
                    key={key}
                    onClick={() => onSelectVersion(key)}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-[#00ff88] text-[#020905] border-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.6)]'
                        : 'bg-[#030e07] text-[#88ffaa] border-[#005522] hover:border-[#00ff88]'
                    }`}
                  >
                    <span>{key} • {formName}</span>
                    {isWhiteOptimized && <span className="ml-1 text-[8px] text-[#00e5ff]">[OPT]</span>}
                  </button>
                );
              })}
            </div>

            {/* Cycle Timer section */}
            <div className="bg-[#001d0e]/60 border border-[#005522] rounded-lg p-2.5 flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10.5px] font-mono font-bold text-[#00ff88]">
                  🔄 AUTO-CYCLE TIMER (PRESET SWITCHER)
                </span>
                <button
                  onClick={onToggleCycle}
                  className={`px-3 py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-all border ${
                    isCycleActive
                      ? 'bg-[#00ff88] text-[#00240e] border-[#00ff88] shadow-[0_0_14px_rgba(0,255,136,0.8)]'
                      : 'bg-[#002211] text-[#00ff88] border-[#00aa55]'
                  }`}
                >
                  CYCLE: {isCycleActive ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex flex-col gap-1 text-[10px] font-mono">
                <div className="flex justify-between text-[#00e5ff]">
                  <span>INTERVALLO (CYCLE SPD)</span>
                  <span className="text-[#00ff88] font-bold">{params.cycleTime.toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="30.0"
                  step="0.5"
                  value={params.cycleTime}
                  onChange={(e) => handleSliderChange('cycleTime', parseFloat(e.target.value))}
                  className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleNextPreset}
                className="flex-1 py-1.5 bg-[#002211] border border-[#00aa55] text-[#00ff88] rounded-md font-mono text-[10px] font-bold hover:bg-[#00ff88] hover:text-[#020905] transition-all cursor-pointer"
              >
                NEXT PRESET &gt;
              </button>
              <button
                onClick={handleResetPhysics}
                className="px-4 py-1.5 bg-transparent border border-[#00aa55] text-[#88ffaa] rounded-md font-mono text-[10px] hover:text-white hover:border-[#00ff88] transition-all cursor-pointer"
              >
                RESET PHYSICS
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: PHYSICS */}
        {activeTab === 'physics' && (
          <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[#00e5ff]">
                  <span>FRICTION (ATTRITO)</span>
                  <span className="text-[#00ff88] font-bold">{params.friction.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="0.99"
                  step="0.01"
                  value={params.friction}
                  onChange={(e) => handleSliderChange('friction', parseFloat(e.target.value))}
                  className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[#00e5ff]">
                  <span>ELASTICITY (ELASTICITÀ CENTRALE)</span>
                  <span className="text-[#00ff88] font-bold">{params.elasticity.toFixed(4)}</span>
                </div>
                <input
                  type="range"
                  min="0.0001"
                  max="0.0050"
                  step="0.0001"
                  value={params.elasticity}
                  onChange={(e) => handleSliderChange('elasticity', parseFloat(e.target.value))}
                  className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[#00e5ff]">
                  <span>PARTICLE SIZE (DIMENSIONE)</span>
                  <span className="text-[#00ff88] font-bold">{params.pSize.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="12.0"
                  step="0.2"
                  value={params.pSize}
                  onChange={(e) => handleSliderChange('pSize', parseFloat(e.target.value))}
                  className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[#00e5ff]">
                  <span>PARTICLE SPIN (ROTAZIONE 3D)</span>
                  <span className="text-[#00ff88] font-bold">{params.pSpin.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="5.0"
                  step="0.1"
                  value={params.pSpin}
                  onChange={(e) => handleSliderChange('pSpin', parseFloat(e.target.value))}
                  className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[#00e5ff]">
                  <span>TOUCH / HAND POWER</span>
                  <span className="text-[#00ff88] font-bold">{params.handPower.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="15.0"
                  step="0.5"
                  value={params.handPower}
                  onChange={(e) => handleSliderChange('handPower', parseFloat(e.target.value))}
                  className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
                />
              </div>

              {/* Dynamic Particle Count Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[#00e5ff]">
                  <span>NUMERO DI PARTICELLE (COUNT)</span>
                  <span className="text-[#00ff88] font-bold">{params.particleCount}</span>
                </div>
                <input
                  type="range"
                  min="3000"
                  max="25000"
                  step="1000"
                  value={params.particleCount}
                  onChange={(e) => handleSliderChange('particleCount', parseInt(e.target.value))}
                  className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Count density chips */}
            <div className="flex flex-col gap-1">
              <span className="text-[9.5px] font-mono text-[#88ffaa]">DENSITÀ SCIAME RAPIDA:</span>
              <div className="flex flex-wrap gap-1.5">
                {[5000, 10000, 12000, 15000, 20000].map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => handleSliderChange('particleCount', cnt)}
                    className={`px-2.5 py-1 rounded text-[9.5px] font-mono cursor-pointer border ${
                      params.particleCount === cnt
                        ? 'bg-[#00ff88] text-[#020905] font-bold border-[#00ff88]'
                        : 'bg-[#002211] text-[#88ffaa] border-[#005522] hover:border-[#00ff88]'
                    }`}
                  >
                    {cnt >= 1000 ? `${cnt / 1000}k` : cnt} {cnt === 5000 ? 'ECO' : cnt === 12000 ? 'PRO' : cnt === 20000 ? 'ULTRA' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Geometry shape selector */}
            <div className="flex flex-col gap-1">
              <span className="text-[9.5px] font-mono text-[#88ffaa]">GEOMETRIA PARTICELLE (3D SHAPE):</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'octa', label: 'PRISMA OTTATEDRO' },
                  { id: 'box', label: 'CUBO NEON 3D' },
                  { id: 'ico', label: 'CRISTALLO ICOSAEDRO' },
                  { id: 'sphere', label: 'SFERA COSMICA' }
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => onChangeGeoType(g.id as GeometryType)}
                    className={`px-2.5 py-1 rounded text-[9.5px] font-mono cursor-pointer border ${
                      currentGeoType === g.id
                        ? 'bg-[#00ff88] text-[#020905] font-bold border-[#00ff88]'
                        : 'bg-[#002211] text-[#88ffaa] border-[#005522] hover:border-[#00ff88]'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: FORCES */}
        {activeTab === 'forces' && (
          <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
            {/* Swarm Expansion & Center Attraction Primary Controls */}
            <div className="bg-[#002211]/70 border border-[#00ff88]/40 rounded-lg p-2.5 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold text-[#00ff88]">
                  🌌 DINAMICA SCIAME: ESPANSIONE & ATTRAZIONE
                </span>
                <span className="text-[9px] font-mono text-[#88ffaa]/70">
                  VETTORI CENTRIFUGHI
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[#00e5ff]">
                    <span>FORZA ESPANSIONE RADIALE</span>
                    <span className="text-[#00ff88] font-bold">{(params.radialExpansion ?? 8.0).toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="50.0"
                    step="0.5"
                    value={params.radialExpansion ?? 8.0}
                    onChange={(e) => handleSliderChange('radialExpansion', parseFloat(e.target.value))}
                    className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] text-[#66aa88]">
                    <span>0.0 (Compatto)</span>
                    <span>50.0 (Dispersione Totale)</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[#00e5ff]">
                    <span>ATTRAZIONE VERSO IL CENTRO</span>
                    <span className="text-[#00ff88] font-bold">{(params.centerAttraction ?? 2.0).toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="30.0"
                    step="0.2"
                    value={params.centerAttraction ?? 2.0}
                    onChange={(e) => handleSliderChange('centerAttraction', parseFloat(e.target.value))}
                    className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] text-[#66aa88]">
                    <span>0.0 (Nessuna Gravità)</span>
                    <span>30.0 (Collasso Singolarità)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[#00e5ff]">
                  <span>WANDER PUSH (RESPULSIONE)</span>
                  <span className="text-[#00ff88] font-bold">{params.wanderPush.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  step="1"
                  value={params.wanderPush}
                  onChange={(e) => handleSliderChange('wanderPush', parseFloat(e.target.value))}
                  className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[#00e5ff]">
                  <span>SPECTRA PULL (ATTRAZIONE)</span>
                  <span className="text-[#00ff88] font-bold">{params.spectraPull.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  step="1"
                  value={params.spectraPull}
                  onChange={(e) => handleSliderChange('spectraPull', parseFloat(e.target.value))}
                  className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[#00e5ff]">
                  <span>WANDER ORBIT VELOCITÀ</span>
                  <span className="text-[#00ff88] font-bold">{params.wanderOrbit.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="3.0"
                  step="0.05"
                  value={params.wanderOrbit}
                  onChange={(e) => handleSliderChange('wanderOrbit', parseFloat(e.target.value))}
                  className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[#00e5ff]">
                  <span>SPECTRA ORBIT VELOCITÀ</span>
                  <span className="text-[#00ff88] font-bold">{params.spectraOrbit.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="3.0"
                  step="0.05"
                  value={params.spectraOrbit}
                  onChange={(e) => handleSliderChange('spectraOrbit', parseFloat(e.target.value))}
                  className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[9.5px] font-mono text-[#88ffaa]">MODALITÀ CURSORE / TOUCH:</span>
              <div className="flex gap-2">
                {(['ATTRACT', 'REPEL', 'VORTEX'] as TouchMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => onUpdateParams({ touchMode: mode })}
                    className={`flex-1 py-1.5 rounded text-[10px] font-mono font-bold cursor-pointer border ${
                      params.touchMode === mode
                        ? 'bg-[#00e5ff] text-[#020905] border-[#00e5ff]'
                        : 'bg-[#002211] text-[#00e5ff] border-[#005522] hover:border-[#00e5ff]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: VISUAL */}
        {activeTab === 'visual' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono max-h-[220px] overflow-y-auto pr-1">
            {/* Motion Blur / Accumulation Weight */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[#00e5ff]">
                <span>MOTION BLUR (SCIA BUFFER)</span>
                <span className="text-[#00ff88] font-bold">{(params.motionBlur !== undefined ? params.motionBlur : params.trailOpacity).toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="0.005"
                max="0.50"
                step="0.005"
                value={params.motionBlur !== undefined ? params.motionBlur : params.trailOpacity}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  handleSliderChange('motionBlur', val);
                  handleSliderChange('trailOpacity', val);
                }}
                className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
              />
            </div>

            {/* Bloom Intensity */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[#00e5ff]">
                <span>BLOOM INTENSITY (BAGLIORE)</span>
                <span className="text-[#00ff88] font-bold">{(params.bloomIntensity !== undefined ? params.bloomIntensity : 1.0).toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="2.0"
                step="0.05"
                value={params.bloomIntensity !== undefined ? params.bloomIntensity : 1.0}
                onChange={(e) => handleSliderChange('bloomIntensity', parseFloat(e.target.value))}
                className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
              />
            </div>

            {/* Particle Brightness (Mother Color Lightness) */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[#00e5ff]">
                <span>LUMINOSITÀ PARTICELLE (HSL)</span>
                <span className="text-[#00ff88] font-bold">{Math.round((params.particleBrightness !== undefined ? params.particleBrightness : 0.48) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.20"
                max="0.75"
                step="0.01"
                value={params.particleBrightness !== undefined ? params.particleBrightness : 0.48}
                onChange={(e) => handleSliderChange('particleBrightness', parseFloat(e.target.value))}
                className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
              />
            </div>

            {/* Particle Saturation */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[#00e5ff]">
                <span>SATURAZIONE COLORI</span>
                <span className="text-[#00ff88] font-bold">{Math.round((params.particleSaturation !== undefined ? params.particleSaturation : 0.95) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.20"
                max="1.00"
                step="0.05"
                value={params.particleSaturation !== undefined ? params.particleSaturation : 0.95}
                onChange={(e) => handleSliderChange('particleSaturation', parseFloat(e.target.value))}
                className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
              />
            </div>

            {/* Particle Shininess */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[#00e5ff]">
                <span>LUCIDITÀ / SHININESS</span>
                <span className="text-[#00ff88] font-bold">{params.particleShininess !== undefined ? params.particleShininess : 20}</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="1"
                value={params.particleShininess !== undefined ? params.particleShininess : 20}
                onChange={(e) => handleSliderChange('particleShininess', parseInt(e.target.value))}
                className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
              />
            </div>

            {/* Spectra Lumina */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[#00e5ff]">
                <span>SPECTRA LUMINA</span>
                <span className="text-[#00ff88] font-bold">{params.pLumina.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="50.0"
                step="1.0"
                value={params.pLumina}
                onChange={(e) => handleSliderChange('pLumina', parseFloat(e.target.value))}
                className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
              />
            </div>

            {/* Camera Zoom */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[#00e5ff]">
                <span>CAMERA ZOOM</span>
                <span className="text-[#00ff88] font-bold">{Math.round(params.zoom)}</span>
              </div>
              <input
                type="range"
                min="200"
                max="1600"
                step="10"
                value={params.zoom}
                onChange={(e) => handleSliderChange('zoom', parseFloat(e.target.value))}
                className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
              />
            </div>

            {/* Auto Rotation X */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[#00e5ff]">
                <span>AUTO ROTATION X</span>
                <span className="text-[#00ff88] font-bold">{params.rotX.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.05"
                step="0.001"
                value={params.rotX}
                onChange={(e) => handleSliderChange('rotX', parseFloat(e.target.value))}
                className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
              />
            </div>

            {/* Auto Rotation Y */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[#00e5ff]">
                <span>AUTO ROTATION Y</span>
                <span className="text-[#00ff88] font-bold">{params.rotY.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.05"
                step="0.001"
                value={params.rotY}
                onChange={(e) => handleSliderChange('rotY', parseFloat(e.target.value))}
                className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
              />
            </div>

            {/* Auto Rotation Z */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[#00e5ff]">
                <span>AUTO ROTATION Z</span>
                <span className="text-[#00ff88] font-bold">{params.rotZ.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.05"
                step="0.001"
                value={params.rotZ}
                onChange={(e) => handleSliderChange('rotZ', parseFloat(e.target.value))}
                className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Tab 5: AUDIO & SYNTH */}
        {activeTab === 'audio' && (
          <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
            {/* Audio Modes */}
            <div className="flex flex-col gap-1">
              <span className="text-[9.5px] font-mono text-[#88ffaa]">MODALITÀ AUDIO REATTIVO:</span>
              <div className="flex gap-1.5">
                {(['OFF', 'ENERGY', 'BEAT', 'SYNTH'] as AudioMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      onUpdateParams({ audioMode: m });
                      if (m !== 'OFF') globalPiano.resume();
                    }}
                    className={`flex-1 py-1 rounded text-[9.5px] font-mono font-bold cursor-pointer border ${
                      params.audioMode === m
                        ? m === 'SYNTH' ? 'bg-[#ff00aa] text-white border-[#ff00aa]' : 'bg-[#00ff88] text-[#020905] border-[#00ff88]'
                        : 'bg-[#002211] text-[#88ffaa] border-[#005522]'
                    }`}
                  >
                    {m === 'SYNTH' ? 'PIANO SYNTH LIVE' : m}
                  </button>
                ))}
              </div>
            </div>

            {/* Triggers activation */}
            <div className="bg-[#001d0e]/60 border border-[#00aa55] rounded-lg p-2.5 flex flex-col gap-1.5">
              <span className="text-[10px] font-mono font-bold text-[#00ff88]">
                SORGENTI &amp; TRIGGER ATTIVAZIONE AUDIO:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { key: 'trigGesture', label: 'GESTURE PITCH (MANO Y)' },
                  { key: 'trigPinch', label: 'PINCH / ACCORDO CHIUSO' },
                  { key: 'trigClick', label: 'CLICK / TOUCH TAP' },
                  { key: 'trigCollision', label: 'COLLISIONE SCIAME' },
                  { key: 'trigBpm', label: 'BPM ARPEGGIO' },
                ].map((trig) => {
                  const isActive = !!params[trig.key as keyof SimulationParams];
                  return (
                    <button
                      key={trig.key}
                      onClick={() => onUpdateParams({ [trig.key]: !isActive })}
                      className={`px-2.5 py-1 rounded text-[9.5px] font-mono cursor-pointer border ${
                        isActive
                          ? 'bg-[#00ff88] text-[#020905] font-bold border-[#00ff88]'
                          : 'bg-[#002211] text-[#88ffaa] border-[#005522]'
                      }`}
                    >
                      {isActive ? '✓ ' : ''}{trig.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1 text-[9.5px] font-mono">
                <div className="flex flex-col gap-0.5">
                  <div className="flex justify-between text-[#00e5ff]">
                    <span>RITMO TRIGGER</span>
                    <span className="text-[#00ff88]">{params.triggerRateMs}ms</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="800"
                    step="10"
                    value={params.triggerRateMs}
                    onChange={(e) => handleSliderChange('triggerRateMs', parseInt(e.target.value))}
                    className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-0.5">
                  <div className="flex justify-between text-[#00e5ff]">
                    <span>SENSIBILITÀ</span>
                    <span className="text-[#00ff88]">{Math.round(params.triggerSensitivity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.95"
                    step="0.05"
                    value={params.triggerSensitivity}
                    onChange={(e) => handleSliderChange('triggerSensitivity', parseFloat(e.target.value))}
                    className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Piano & Reverb sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[#00e5ff]">
                  <span>VOLUME PIANOFORTE</span>
                  <span className="text-[#00ff88] font-bold">{Math.round(params.pianoVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={params.pianoVolume}
                  onChange={(e) => handleSliderChange('pianoVolume', parseFloat(e.target.value))}
                  className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[#00e5ff]">
                  <span>RIVERBERO CATTEDRALE</span>
                  <span className="text-[#00ff88] font-bold">{Math.round(params.reverbAmount * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={params.reverbAmount}
                  onChange={(e) => handleSliderChange('reverbAmount', parseFloat(e.target.value))}
                  className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[#00e5ff]">
                  <span>BRILLANTEZZA TIMBRO</span>
                  <span className="text-[#00ff88] font-bold">{Math.round(params.pianoBrightness * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1"
                  step="0.05"
                  value={params.pianoBrightness}
                  onChange={(e) => handleSliderChange('pianoBrightness', parseFloat(e.target.value))}
                  className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[#00e5ff]">
                  <span>AUDIO POWER BOOST</span>
                  <span className="text-[#00ff88] font-bold">{params.audioPower.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="5.0"
                  step="0.1"
                  value={params.audioPower}
                  onChange={(e) => handleSliderChange('audioPower', parseFloat(e.target.value))}
                  className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
                />
              </div>

              {/* Audio Hue Symphony Speed */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[#00e5ff]">
                  <span>HUE SYMPHONY SPEED (ROTAZIONE CROMATICA)</span>
                  <span className="text-[#00ff88] font-bold">{(params.hueRotationSpeed !== undefined ? params.hueRotationSpeed : 1.0).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="5.0"
                  step="0.1"
                  value={params.hueRotationSpeed !== undefined ? params.hueRotationSpeed : 1.0}
                  onChange={(e) => handleSliderChange('hueRotationSpeed', parseFloat(e.target.value))}
                  className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
                />
              </div>

              {/* Audio Threshold */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[#00e5ff]">
                  <span>SOGLIA MICROFONO / THRESHOLD</span>
                  <span className="text-[#00ff88] font-bold">{params.audioThreshold.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.50"
                  step="0.01"
                  value={params.audioThreshold}
                  onChange={(e) => handleSliderChange('audioThreshold', parseFloat(e.target.value))}
                  className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: LIGHTS */}
        {activeTab === 'lights' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono max-h-[220px] overflow-y-auto pr-1">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[#00e5ff]">
                <span>SUN X</span>
                <span className="text-[#00ff88] font-bold">{Math.round(params.sunX)}</span>
              </div>
              <input
                type="range"
                min="-1200"
                max="1200"
                step="20"
                value={params.sunX}
                onChange={(e) => handleSliderChange('sunX', parseFloat(e.target.value))}
                className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[#00e5ff]">
                <span>SUN Y</span>
                <span className="text-[#00ff88] font-bold">{Math.round(params.sunY)}</span>
              </div>
              <input
                type="range"
                min="-1200"
                max="1200"
                step="20"
                value={params.sunY}
                onChange={(e) => handleSliderChange('sunY', parseFloat(e.target.value))}
                className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[#00e5ff]">
                <span>SUN Z</span>
                <span className="text-[#00ff88] font-bold">{Math.round(params.sunZ)}</span>
              </div>
              <input
                type="range"
                min="-1200"
                max="1200"
                step="20"
                value={params.sunZ}
                onChange={(e) => handleSliderChange('sunZ', parseFloat(e.target.value))}
                className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[#00e5ff]">
                <span>SUN INTENSITY</span>
                <span className="text-[#00ff88] font-bold">{params.sunIntensity.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="5.0"
                step="0.1"
                value={params.sunIntensity}
                onChange={(e) => handleSliderChange('sunIntensity', parseFloat(e.target.value))}
                className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[#00e5ff]">
                <span>AMBIENT INTENSITY</span>
                <span className="text-[#00ff88] font-bold">{params.ambientIntensity.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="3.0"
                step="0.1"
                value={params.ambientIntensity}
                onChange={(e) => handleSliderChange('ambientIntensity', parseFloat(e.target.value))}
                className="w-full accent-[#00ff88] h-1.5 bg-[#003318] rounded cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};
