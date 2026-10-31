/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { EngineMode, SimulationParams, CustomPreset, GeometryType } from './types.ts';
import { SacredMotherEngine } from './engine/sacredMother.ts';
import { RemasteredEngine, REMASTERED_KEYS } from './engine/remasteredEngine.ts';
import { PipPreview } from './components/PipPreview.tsx';
import { PianoRibbon } from './components/PianoRibbon.tsx';
import { ConsolePanel } from './components/ConsolePanel.tsx';
import { PresetModal } from './components/PresetModal.tsx';
import { RecordingModal } from './components/RecordingModal.tsx';
import { DownloadPortalModal } from './components/DownloadPortalModal.tsx';
import { globalPiano } from './audio/pianoEngine.ts';
import { globalHandTracker, HandTrackingResult } from './vision/handTracker.ts';
import { globalVideoRecorder, RecordedSession } from './utils/videoRecorder.ts';
import { 
  Camera, Mic, Video, Square, Sparkles, 
  RotateCcw, Sliders, Shield, Zap, Maximize, Minimize, Download, Radio
} from 'lucide-react';

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Engine instance refs
  const motherEngineRef = useRef<SacredMotherEngine | null>(null);
  const remasteredEngineRef = useRef<RemasteredEngine | null>(null);

  // State
  const [engineMode, setEngineMode] = useState<EngineMode>('REMASTERED');
  const [currentV, setCurrentV] = useState<string>('V13');
  const [currentGeoType, setCurrentGeoType] = useState<GeometryType>('octa');
  const [isCycleActive, setIsCycleActive] = useState<boolean>(false);
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordSeconds, setRecordSeconds] = useState<number>(0);
  const [recordedSession, setRecordedSession] = useState<RecordedSession | null>(null);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState<boolean>(false);
  const [isDownloadPortalOpen, setIsDownloadPortalOpen] = useState<boolean>(false);
  const [activeNoteIdx, setActiveNoteIdx] = useState<number | null>(null);
  const [isMidiConnected, setIsMidiConnected] = useState<boolean>(false);
  const [midiName, setMidiName] = useState<string>("Disconnesso");

  const [simulationParams, setSimulationParams] = useState<SimulationParams>({
    friction: 0.96,
    elasticity: 0.0016,
    handPower: 5.5,
    zoom: 600,
    rotX: 0.001,
    rotY: 0.002,
    rotZ: 0.000,
    pSpin: 1.2,
    trailOpacity: 0.14,
    motionBlur: 0.14,
    bloomIntensity: 1.0,
    hueRotationSpeed: 1.0,
    pSize: 3.2,
    pLumina: 10.0,
    audioThreshold: 0.12,
    cycleTime: 5.0,
    spectraPull: 45.0,
    audioPower: 1.5,
    wanderOrbit: 0.8,
    spectraOrbit: 1.2,
    wanderPush: 25.0,
    sunX: 400,
    sunY: 600,
    sunZ: 500,
    sunIntensity: 1.2,
    ambientIntensity: 0.6,
    particleCount: 12000,
    touchMode: 'ATTRACT',
    audioMode: 'SYNTH',
    pianoVolume: 0.8,
    reverbAmount: 0.65,
    pianoBrightness: 0.75,
    triggerRateMs: 160,
    triggerSensitivity: 0.75,
    trigGesture: true,
    trigPinch: true,
    trigClick: true,
    trigCollision: false,
    trigBpm: false,
    particleBrightness: 0.48,
    particleSaturation: 0.95,
    particleShininess: 20,
    radialExpansion: 8.0,
    centerAttraction: 2.0
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const triggerToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Auto-load preset on initial mount and check download portal deep link
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nebula_core_autosaved_preset');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.params) {
          setSimulationParams(prev => ({ ...prev, ...parsed.params }));
          if (parsed.version) setCurrentV(parsed.version);
        }
      }
    } catch (e) {
      console.warn("Failed to load auto-saved preset", e);
    }

    const checkDownloadPortalLink = () => {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (hash.includes('download') || params.get('download') !== null || params.get('portal') === 'download') {
        setIsDownloadPortalOpen(true);
      }
    };
    checkDownloadPortalLink();
    window.addEventListener('hashchange', checkDownloadPortalLink);
    return () => window.removeEventListener('hashchange', checkDownloadPortalLink);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  // Connect piano note trigger callback to UI highlighting & MIDI listeners
  useEffect(() => {
    globalPiano.onNoteTrigger = (_name, idx, _freq) => {
      setActiveNoteIdx(idx);
      globalHandTracker.activeNote = `${_name} [${Math.round(_freq)}Hz]`;
    };
    globalPiano.onMidiStatusChange = (connected, name) => {
      setIsMidiConnected(connected);
      setMidiName(name);
    };
    globalPiano.initMidi().then(ok => {
      setIsMidiConnected(ok);
      setMidiName(globalPiano.midiDeviceName);
    }).catch(() => {});
  }, []);

  // Mount active 3D Engine
  const startEngine = useCallback((mode: EngineMode) => {
    if (!containerRef.current) return;

    // Teardown previous engine
    if (motherEngineRef.current) {
      motherEngineRef.current.unmount();
      motherEngineRef.current = null;
    }
    if (remasteredEngineRef.current) {
      remasteredEngineRef.current.unmount();
      remasteredEngineRef.current = null;
    }

    if (mode === 'MOTHER') {
      const mother = new SacredMotherEngine();
      mother.mount(containerRef.current);
      motherEngineRef.current = mother;
      setCurrentV(mother.currentV);
    } else {
      const remastered = new RemasteredEngine();
      remastered.liveParams = { ...simulationParams };
      remastered.mount(containerRef.current);
      remasteredEngineRef.current = remastered;
      setCurrentV(remastered.currentV);
      setCurrentGeoType(remastered.currentGeoType);
    }
  }, [simulationParams]);

  useEffect(() => {
    startEngine(engineMode);
    return () => {
      if (motherEngineRef.current) motherEngineRef.current.unmount();
      if (remasteredEngineRef.current) remasteredEngineRef.current.unmount();
    };
  }, [engineMode, startEngine]);

  // Connect hand tracking stream to active engine and piano
  useEffect(() => {
    globalHandTracker.onTrackingResult = (res: HandTrackingResult) => {
      if (engineMode === 'MOTHER' && motherEngineRef.current) {
        motherEngineRef.current.setHandTarget(res.targetPos.x, res.targetPos.y, res.isClosed, res.isPresent);
      } else if (remasteredEngineRef.current) {
        remasteredEngineRef.current.setHandTarget(res.targetPos.x, res.targetPos.y, res.isClosed, res.isPresent);
      }

      if (res.isPresent && simulationParams.audioMode !== 'OFF') {
        globalPiano.updateFromCoordinates(res.normX, res.normY, res.isClosed, {
          trigGesture: simulationParams.trigGesture,
          trigPinch: simulationParams.trigPinch
        });
      }
    };
  }, [engineMode, simulationParams.audioMode, simulationParams.trigGesture, simulationParams.trigPinch]);

  // Recording Timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordSeconds(s => s + 1);
      }, 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyM') {
        setEngineMode(m => (m === 'MOTHER' ? 'REMASTERED' : 'MOTHER'));
      } else if (e.code === 'KeyW') {
        setIsWebcamActive(a => !a);
      } else if (e.code === 'KeyC') {
        handleToggleCycle();
      } else if (e.code === 'KeyR' && e.shiftKey) {
        handleResetCamera();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleUpdateParams = (newParams: Partial<SimulationParams>) => {
    const merged = { ...simulationParams, ...newParams };
    setSimulationParams(merged);

    if (remasteredEngineRef.current) {
      remasteredEngineRef.current.liveParams = { ...merged };
      if (newParams.particleCount && newParams.particleCount !== simulationParams.particleCount) {
        remasteredEngineRef.current.allocSwarmBuffers(newParams.particleCount);
        remasteredEngineRef.current.loadSwarm(remasteredEngineRef.current.currentV);
      }
      if (newParams.sunX !== undefined || newParams.sunY !== undefined || newParams.sunZ !== undefined || newParams.sunIntensity !== undefined || newParams.ambientIntensity !== undefined) {
        remasteredEngineRef.current.applySunLights();
      }
      if (newParams.pSize !== undefined) {
        remasteredEngineRef.current.loadSwarm(remasteredEngineRef.current.currentV);
      }
      if (newParams.particleShininess !== undefined) {
        remasteredEngineRef.current.updateShininess(newParams.particleShininess);
      }
      if (newParams.zoom !== undefined) {
        remasteredEngineRef.current.setZoom(newParams.zoom);
      }
    } else if (engineMode === 'MOTHER' && motherEngineRef.current?.camera && newParams.zoom !== undefined) {
      motherEngineRef.current.camera.position.z = newParams.zoom;
    }
  };

  const handleSelectVersion = (v: string) => {
    setCurrentV(v);
    if (engineMode === 'MOTHER' && motherEngineRef.current) {
      motherEngineRef.current.loadSwarm(v);
    } else if (remasteredEngineRef.current) {
      remasteredEngineRef.current.loadSwarm(v);
    }
  };

  const handleToggleCycle = () => {
    const nextState = !isCycleActive;
    setIsCycleActive(nextState);
    if (engineMode === 'MOTHER' && motherEngineRef.current) {
      motherEngineRef.current.cycleActive = nextState;
    } else if (remasteredEngineRef.current) {
      remasteredEngineRef.current.cycleActive = nextState;
    }
  };

  const handleToggleWebcam = async () => {
    globalPiano.resume();
    const next = !isWebcamActive;
    setIsWebcamActive(next);
    if (next) {
      triggerToast("AVVIO WEBCAM PIP (Hand tracking attivo / Virtual pad)");
    } else {
      triggerToast("WEBCAM CHIUSA");
    }
  };

  const handleToggleMic = async () => {
    globalPiano.resume();
    const activeEngine = engineMode === 'MOTHER' ? motherEngineRef.current : remasteredEngineRef.current;
    if (activeEngine) {
      if (!isMicActive) {
        const ok = await activeEngine.startMicrophone();
        setIsMicActive(ok);
        if (ok) {
          triggerToast("✓ MICROFONO ATTIVO (Reazione armonica frequenze)");
        } else {
          triggerToast("⚠️ Permesso microfono negato o non supportato nel browser", true);
        }
      } else {
        activeEngine.stopMicrophone();
        setIsMicActive(false);
        triggerToast("MICROFONO DISATTIVATO");
      }
    }
  };

  const handleToggleMidi = async () => {
    const ok = await globalPiano.initMidi();
    setIsMidiConnected(ok);
    setMidiName(globalPiano.midiDeviceName);
    if (ok) {
      triggerToast(`✓ MIDI ATTIVO PER LOGIC PRO: ${globalPiano.midiDeviceName}`);
    } else {
      triggerToast(`⚠️ MIDI: ${globalPiano.midiDeviceName} (attiva il Driver IAC in Configurazione Audio MIDI)`, true);
    }
  };

  const handleResetCamera = () => {
    const activeEngine = engineMode === 'MOTHER' ? motherEngineRef.current : remasteredEngineRef.current;
    if (activeEngine && activeEngine.camera) {
      activeEngine.camera.position.set(0, 0, 600);
      activeEngine.camera.lookAt(0, 0, 0);
    }
  };

  const handleSnapshot = () => {
    const activeEngine = engineMode === 'MOTHER' ? motherEngineRef.current : remasteredEngineRef.current;
    if (activeEngine && activeEngine.renderer && activeEngine.scene && activeEngine.camera) {
      activeEngine.renderer.render(activeEngine.scene, activeEngine.camera);
      const a = document.createElement('a');
      a.download = `NebulaCore_${engineMode}_${Date.now()}.png`;
      a.href = activeEngine.renderer.domElement.toDataURL('image/png');
      a.click();
    }
  };

  const handleToggleRecording = async () => {
    const activeEngine = engineMode === 'MOTHER' ? motherEngineRef.current : remasteredEngineRef.current;
    if (!activeEngine || !activeEngine.renderer) return;

    if (!isRecording) {
      const ok = globalVideoRecorder.startRecording(activeEngine.renderer.domElement);
      if (ok) setIsRecording(true);
    } else {
      try {
        const session = await globalVideoRecorder.stopRecording();
        setIsRecording(false);
        setRecordedSession(session);
      } catch (err) {
        console.error("Recording stop error", err);
        setIsRecording(false);
      }
    }
  };

  const handleApplyPreset = (preset: CustomPreset) => {
    handleSelectVersion(preset.version);
    if (preset.params) {
      handleUpdateParams(preset.params);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#020905]">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        id="canvas-container"
        className="absolute inset-0 w-full h-full z-0 touch-none"
      />

      {/* TOP BAR CONTRACT: Single Row, 3 Zones */}
      <header
        id="top-bar"
        className="fixed top-2.5 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-4 md:gap-8 px-4 py-2 bg-[#030d07]/90 border border-[#00aa55] rounded-full backdrop-blur-xl shadow-2xl shadow-black/80 max-w-[96vw] overflow-x-auto select-none pointer-events-auto touch-pan-x [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
          <span className="font-mono font-black text-xs md:text-sm tracking-wider text-[#00e5ff] drop-shadow-[0_0_10px_rgba(0,229,255,0.7)]">
            NEBULA CORE
          </span>
          <span className="bg-[#00ff88]/20 border border-[#00ff88] text-[#00ff88] text-[9.5px] px-2 py-0.5 rounded-full font-bold">
            {currentV}
          </span>
        </div>

        {/* Zone 2: Navigation & Mode Controls */}
        <nav className="flex items-center gap-2 md:gap-3 whitespace-nowrap shrink-0 text-xs font-mono">
          {/* SACRED MOTHER CODE TOGGLE */}
          <button
            onClick={() => setEngineMode(engineMode === 'MOTHER' ? 'REMASTERED' : 'MOTHER')}
            className={`px-3 py-1 rounded-full font-extrabold text-[10px] md:text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
              engineMode === 'MOTHER'
                ? 'bg-[#ffcc00] text-black border-[#ffcc00] shadow-[0_0_15px_rgba(255,204,0,0.8)]'
                : 'bg-[#002b15] text-[#00ff88] border-[#00aa55] hover:bg-[#00ff88] hover:text-black'
            }`}
            title="Passa all'istante tra la Versione Madre Sacra V70.0 e la Remastered"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{engineMode === 'MOTHER' ? '★ ORIGINAL V70 MOTHER' : '⚡ REMASTERED'}</span>
          </button>

          {/* ECO / ULTRA QUICK TOGGLE */}
          <button
            onClick={() => {
              const target = simulationParams.particleCount > 10000 ? 8000 : 20000;
              handleUpdateParams({ particleCount: target });
            }}
            className="px-2.5 py-1 rounded-full bg-[#001f10] border border-[#007733] text-[10px] text-[#88ffaa] hover:border-[#00ff88] hover:text-white transition-all cursor-pointer"
          >
            {simulationParams.particleCount <= 8000 ? 'ECO 8K' : simulationParams.particleCount >= 20000 ? 'ULTRA 20K' : `${Math.round(simulationParams.particleCount/1000)}K`}
          </button>

          {/* WEBCAM TOGGLE */}
          <button
            onClick={handleToggleWebcam}
            className={`px-2.5 py-1 rounded-full text-[10px] flex items-center gap-1 cursor-pointer transition-all border ${
              isWebcamActive
                ? 'bg-[#00ff88] text-black font-bold border-[#00ff88] shadow-[0_0_12px_rgba(0,255,136,0.8)]'
                : 'bg-[#002211] text-[#00e5ff] border-[#00aa55] hover:border-[#00e5ff]'
            }`}
          >
            <Camera className="w-3 h-3" />
            <span>CAM: {isWebcamActive ? 'ON' : 'OFF'}</span>
          </button>

          {/* MIC AUDIO INPUT TOGGLE */}
          <button
            onClick={handleToggleMic}
            className={`px-2.5 py-1 rounded-full text-[10px] flex items-center gap-1 cursor-pointer transition-all border ${
              isMicActive
                ? 'bg-[#00ff88] text-black font-bold border-[#00ff88] shadow-[0_0_12px_rgba(0,255,136,0.8)]'
                : 'bg-[#002211] text-[#88ffaa] border-[#00aa55] hover:border-[#00ff88]'
            }`}
          >
            <Mic className="w-3 h-3" />
            <span>MIC: {isMicActive ? 'ON' : 'OFF'}</span>
          </button>

          {/* MIDI OUT / LOGIC PRO CONNECTOR */}
          <button
            onClick={handleToggleMidi}
            className={`px-2.5 py-1 rounded-full text-[10px] flex items-center gap-1 cursor-pointer transition-all border ${
              isMidiConnected
                ? 'bg-[#00e5ff] text-black font-bold border-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.8)]'
                : 'bg-[#001d24] text-[#00e5ff] border-[#007788] hover:border-[#00e5ff]'
            }`}
            title={`MIDI Out per Logic Pro: ${midiName}`}
          >
            <Radio className="w-3 h-3" />
            <span>MIDI: {isMidiConnected ? 'LOGIC PRO (IAC)' : 'MIDI OUT'}</span>
          </button>

          {/* PRESETS MODAL TRIGGER */}
          <button
            onClick={() => setIsPresetModalOpen(true)}
            className="px-2.5 py-1 rounded-full bg-[#002211] border border-[#00aa55] text-[10px] text-[#88ffaa] hover:border-[#00ff88] hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-[#00e5ff]" />
            <span>PRESETS</span>
          </button>

          {/* DOWNLOAD PORTAL MODAL TRIGGER */}
          <button
            onClick={() => setIsDownloadPortalOpen(true)}
            className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#00381e] to-[#002a3a] border border-[#00ff88] text-[10px] text-[#00ff88] hover:text-white hover:shadow-[0_0_12px_rgba(0,255,136,0.5)] flex items-center gap-1 cursor-pointer font-bold transition-all"
            title="Portale Download Ufficiali (Android, Mac, PC, iPhone)"
          >
            <Download className="w-3 h-3 text-[#00ff88]" />
            <span>DOWNLOAD APP</span>
          </button>

          {/* SNAPSHOT */}
          <button
            onClick={handleSnapshot}
            className="px-2.5 py-1 rounded-full bg-[#002211] border border-[#00aa55] text-[10px] text-[#88ffaa] hover:text-white cursor-pointer"
            title="Scatta screenshot PNG"
          >
            📸 PNG
          </button>

          {/* RESET CAMERA */}
          <button
            onClick={handleResetCamera}
            className="p-1 rounded-full bg-[#002211] border border-[#00aa55] text-[#88ffaa] hover:text-white cursor-pointer"
            title="Reimposta visuale camera"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </nav>

        {/* Zone 3: Primary Action (Fullscreen & Video Recording Session) */}
        <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
          <button
            onClick={handleToggleFullscreen}
            className="p-1.5 rounded-full bg-[#002211] border border-[#00aa55] text-[#00ff88] hover:text-white hover:border-[#00ff88] cursor-pointer transition-colors"
            title={isFullscreen ? "Esci da Schermo Intero" : "Attiva Schermo Intero"}
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleToggleRecording}
            className={`px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
              isRecording
                ? 'bg-[#ff3333] text-white shadow-[0_0_18px_#ff3333] animate-pulse'
                : 'bg-gradient-to-r from-[#00ff88] to-[#00e5ff] text-[#020905] hover:opacity-90 shadow-[0_0_12px_rgba(0,255,136,0.5)]'
            }`}
          >
            {isRecording ? <Square className="w-3 h-3 fill-current" /> : <Video className="w-3 h-3" />}
            <span>{isRecording ? `REC ${String(Math.floor(recordSeconds / 60)).padStart(2, '0')}:${String(recordSeconds % 60).padStart(2, '0')}` : 'REC VIDEO'}</span>
          </button>
        </div>
      </header>

      {/* Dynamic System Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-2 shadow-xl backdrop-blur-md transition-all ${
          toastMessage.isError
            ? 'bg-[#330000]/90 border border-[#ff3333] text-[#ff8888] shadow-[#ff0000]/20'
            : 'bg-[#002b15]/90 border border-[#00ff88] text-[#00ff88] shadow-[#00ff88]/20'
        }`}>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Floating Picture-In-Picture Webcam Window */}
      <PipPreview
        isWebcamActive={isWebcamActive}
        onToggleWebcam={handleToggleWebcam}
      />

      {/* Collapsible Bottom Console Panel (6 comprehensive tabs) */}
      {engineMode === 'REMASTERED' && (
        <ConsolePanel
          params={simulationParams}
          currentV={currentV}
          isCycleActive={isCycleActive}
          currentGeoType={currentGeoType}
          onUpdateParams={handleUpdateParams}
          onSelectVersion={handleSelectVersion}
          onToggleCycle={handleToggleCycle}
          onChangeGeoType={(geo) => {
            setCurrentGeoType(geo);
            if (remasteredEngineRef.current) remasteredEngineRef.current.setGeometryType(geo);
          }}
          onOpenDownloadPortal={() => setIsDownloadPortalOpen(true)}
        />
      )}

      {/* Bottom Piano Strip with 15 pentatonic keys and reverb */}
      <PianoRibbon activeNoteIdx={activeNoteIdx} />

      {/* Preset Storage & Sharing Dialog */}
      <PresetModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        currentVersion={currentV}
        currentParams={simulationParams}
        onApplyPreset={handleApplyPreset}
      />

      {/* Video Recording & Social Share Modal */}
      <RecordingModal
        session={recordedSession}
        onClose={() => setRecordedSession(null)}
      />

      {/* Official Download & Offline Portal Modal */}
      <DownloadPortalModal
        isOpen={isDownloadPortalOpen}
        onClose={() => setIsDownloadPortalOpen(false)}
      />

      {/* Shortcuts Helper Bar */}
      <div className="fixed bottom-2 left-3 z-20 hidden lg:block text-[9px] font-mono text-[#44aa66] bg-[#020603]/80 px-2 py-0.5 rounded border border-[#00ff88]/20 pointer-events-none">
        <b className="text-[#00e5ff]">[M]</b> Mother/Remaster | <b className="text-[#00e5ff]">[W]</b> Cam | <b className="text-[#00e5ff]">[C]</b> Cycle | <b className="text-[#00e5ff]">[CLICK/TOUCH]</b> Piano
      </div>
    </div>
  );
}
