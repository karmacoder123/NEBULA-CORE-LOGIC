/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { EngineMode, SimulationParams, CustomPreset, GeometryType } from './types.ts';
import { SacredMotherEngine } from './engine/sacredMother.ts';
import { RemasteredEngine, REMASTERED_KEYS } from './engine/remasteredEngine.ts';
import { PipPreview } from './components/PipPreview.tsx';
import { PresetPill } from './components/PresetPill.tsx';
import { BottomDock, HubTabType } from './components/BottomDock.tsx';
import { HubDrawer } from './components/HubDrawer.tsx';
import { PresetModal } from './components/PresetModal.tsx';
import { RecordingModal } from './components/RecordingModal.tsx';
import { DownloadPortalModal } from './components/DownloadPortalModal.tsx';
import { globalPiano } from './audio/pianoEngine.ts';
import { globalRelaxation } from './audio/relaxationEngine.ts';
import { globalHandTracker, HandTrackingResult } from './vision/handTracker.ts';
import { globalVideoRecorder, RecordedSession } from './utils/videoRecorder.ts';

const isIPhoneOrIPad = typeof navigator !== 'undefined' && (
  /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
);

export const DEFAULT_SIMULATION_PARAMS: SimulationParams = {
  friction: 0.95,
  elasticity: 0.0007,
  handPower: 14.0,
  zoom: 1322,
  rotX: -0.1,
  rotY: 0.1,
  rotZ: -0.1,
  isAutoRotationOn: true,
  rot4dXW: 0.1,
  rot4dYW: -0.1,
  rot4dZW: 0.1,
  pSpin: 0.0,
  trailOpacity: 0.14,
  motionBlur: 0.14,
  bloomIntensity: 1.0,
  hueRotationSpeed: 1.0,
  pSize: 3.2,
  pLumina: 10.0,
  audioThreshold: 0.12,
  cycleTime: 15.0,
  spectraPull: 1.0,
  spectraForce: 1.0,
  spectraOrbit: 0.7,
  wanderPush: 1.0,
  wanderForce: 1.0,
  wanderOrbit: 0.7,
  centerAttraction: 0.25,
  radialExpansion: 0.0,
  attractorRadius: 900,
  attractorMaxForce: 18.0,
  attractorVortex: 12.0,
  ringsOn: true,
  ringSpeed: 0.7,
  ringSwarm: 2.0,
  ringAudio: 1.0,
  sunX: 400,
  sunY: 600,
  sunZ: 500,
  sunIntensity: 4.7,
  ambientIntensity: 2.0,
  secondarySunIntensity: 2.9,
  sunHue: 'WHITE',
  particleCount: isIPhoneOrIPad ? 3500 : 20000,
  touchMode: 'ATTRACT',
  audioMode: 'SYNTH',
  micGain: 2,
  pianoVolume: 0.8,
  reverbAmount: 1.0,
  audioPower: 1.5,
  pianoBrightness: 0.2,
  triggerRateMs: 160,
  triggerSensitivity: 0.1,
  trigGesture: true,
  trigPinch: true,
  trigClick: true,
  trigCollision: true,
  trigBpm: false,
  particleBrightness: 0.48,
  particleSaturation: 0.95,
  particleShininess: 20,
  isTrailsOn: true,
  trailLength: 26,
  trailPersistence: 2.5,
  trailTracerCount: 275,
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
  crystalOn: true,
  crystalMode: 'ALL',
  crystalSens: 0.05,
  crystalRate: 2,
  crystalLevel: 0.70,
  globuleLeadOn: true,
  globuleLeadLevel: 0.55,
  globuleLeadBpm: 128,
  globuleInfluenceMult: 2.2,
  cursorRingOn: true,
};

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const motherEngineRef = useRef<SacredMotherEngine | null>(null);
  const remasteredEngineRef = useRef<RemasteredEngine | null>(null);

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

  const [activeHubTab, setActiveHubTab] = useState<HubTabType>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const isMutedRef = useRef<boolean>(false);
  isMutedRef.current = isMuted;

  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [isTiltActive, setIsTiltActive] = useState<boolean>(false);
  const [tiltAngles, setTiltAngles] = useState<{ x: number; y: number; force: number }>({ x: 0, y: 0, force: 1.0 });
  const [fps, setFps] = useState<number>(60);
  const [globuleLeadStatus, setGlobuleLeadStatus] = useState<string>(globalPiano.globuleLeadStatus);
  const [globuleCount, setGlobuleCount] = useState<number>(7);

  const [simulationParams, setSimulationParams] = useState<SimulationParams>({ ...DEFAULT_SIMULATION_PARAMS });
  const simulationParamsRef = useRef<SimulationParams>(simulationParams);
  simulationParamsRef.current = simulationParams;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const triggerToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync audio engines to screenshot defaults & auto-unlock Zen defaults (Binaural 6.0 Hz + Harmonic Bowl) on first gesture
  useEffect(() => {
    globalPiano.setReverb(DEFAULT_SIMULATION_PARAMS.reverbAmount);
    globalPiano.setBrightness(DEFAULT_SIMULATION_PARAMS.pianoBrightness);
    globalPiano.isSpatial3DOn = DEFAULT_SIMULATION_PARAMS.isSpatial3DOn ?? true;
    globalPiano.isKineticNotesOn = DEFAULT_SIMULATION_PARAMS.isKineticNotesOn ?? false;
    globalPiano.pianoProfile = DEFAULT_SIMULATION_PARAMS.pianoProfile ?? 'DRONE';
    globalPiano.arpPattern = DEFAULT_SIMULATION_PARAMS.arpPattern ?? 'POLY_4_3';
    globalPiano.arpDivision = DEFAULT_SIMULATION_PARAMS.arpDivision ?? '1/4';
    globalPiano.chordType = DEFAULT_SIMULATION_PARAMS.chordType ?? 'COSMIC7';
    globalPiano.chordResonance = DEFAULT_SIMULATION_PARAMS.chordResonance ?? 0.05;
    globalPiano.attackSoftness = DEFAULT_SIMULATION_PARAMS.attackSoftness ?? 2.0;
    globalPiano.sustainTail = DEFAULT_SIMULATION_PARAMS.sustainTail ?? 6.0;
    globalPiano.noteDamping = DEFAULT_SIMULATION_PARAMS.noteDamping ?? 1.0;

    const unlockOnGesture = () => {
      globalPiano.resume().then(() => {
        globalRelaxation.unlockAndStartDefaults(isMutedRef.current);
      }).catch(() => {});
      window.removeEventListener('pointerdown', unlockOnGesture);
      window.removeEventListener('touchstart', unlockOnGesture);
      window.removeEventListener('keydown', unlockOnGesture);
    };

    window.addEventListener('pointerdown', unlockOnGesture, { passive: true });
    window.addEventListener('touchstart', unlockOnGesture, { passive: true });
    window.addEventListener('keydown', unlockOnGesture, { passive: true });

    const checkDownloadPortalLink = () => {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (hash.includes('download') || params.get('download') !== null || params.get('portal') === 'download') {
        setIsDownloadPortalOpen(true);
      }
    };
    checkDownloadPortalLink();
    window.addEventListener('hashchange', checkDownloadPortalLink);

    return () => {
      window.removeEventListener('pointerdown', unlockOnGesture);
      window.removeEventListener('touchstart', unlockOnGesture);
      window.removeEventListener('keydown', unlockOnGesture);
      window.removeEventListener('hashchange', checkDownloadPortalLink);
    };
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

  useEffect(() => {
    globalPiano.onNoteTrigger = (_name, idx, _freq) => {
      setActiveNoteIdx(idx);
      globalHandTracker.activeNote = `${_name} [${Math.round(_freq)}Hz]`;
    };
    globalPiano.onGlobuleLeadStatus = (status) => {
      setGlobuleLeadStatus(status);
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

  const startEngine = useCallback((mode: EngineMode) => {
    if (!containerRef.current) return;

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
      remastered.liveParams = { ...simulationParamsRef.current };
      remastered.onVersionChange = (v) => setCurrentV(v);
      remastered.onFpsUpdate = (nextFps) => setFps(nextFps);
      remastered.onGlobuleCountChange = (activeCount) => setGlobuleCount(activeCount > 0 ? activeCount : 7);
      remastered.mount(containerRef.current);
      remasteredEngineRef.current = remastered;
      setCurrentV(remastered.currentV);
      setCurrentGeoType(remastered.currentGeoType);
    }
  }, []);

  useEffect(() => {
    startEngine(engineMode);
    return () => {
      if (motherEngineRef.current) motherEngineRef.current.unmount();
      if (remasteredEngineRef.current) remasteredEngineRef.current.unmount();
    };
  }, [engineMode, startEngine]);

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

  const handleUpdateParams = (newParams: Partial<SimulationParams>) => {
    const merged = { ...simulationParamsRef.current, ...newParams };
    setSimulationParams(merged);

    if (newParams.reverbAmount !== undefined) globalPiano.setReverb(newParams.reverbAmount);
    if (newParams.pianoBrightness !== undefined) globalPiano.setBrightness(newParams.pianoBrightness);
    if (newParams.pianoVolume !== undefined) globalPiano.setVolume(newParams.pianoVolume);
    if (newParams.isSpatial3DOn !== undefined) globalPiano.isSpatial3DOn = newParams.isSpatial3DOn;
    if (newParams.isKineticNotesOn !== undefined) globalPiano.isKineticNotesOn = newParams.isKineticNotesOn;
    if (newParams.pianoProfile !== undefined) globalPiano.pianoProfile = newParams.pianoProfile;
    if (newParams.arpPattern !== undefined) globalPiano.arpPattern = newParams.arpPattern;
    if (newParams.arpDivision !== undefined) globalPiano.arpDivision = newParams.arpDivision;
    if (newParams.chordType !== undefined) globalPiano.chordType = newParams.chordType;
    if (newParams.chordResonance !== undefined) globalPiano.chordResonance = newParams.chordResonance;
    if (newParams.attackSoftness !== undefined) globalPiano.attackSoftness = newParams.attackSoftness;
    if (newParams.sustainTail !== undefined) globalPiano.sustainTail = newParams.sustainTail;
    if (newParams.noteDamping !== undefined) globalPiano.noteDamping = newParams.noteDamping;
    if (newParams.kineticMode !== undefined) globalPiano.kineticMode = newParams.kineticMode;
    if (newParams.triggerThreshold !== undefined) globalPiano.triggerThreshold = newParams.triggerThreshold;
    if (newParams.kineticSensitivity !== undefined) globalPiano.kineticSensitivity = newParams.kineticSensitivity;
    if (newParams.globuleLeadOn !== undefined) globalPiano.setGlobuleLeadOn(newParams.globuleLeadOn);
    if (newParams.globuleLeadLevel !== undefined) globalPiano.setGlobuleLeadLevel(newParams.globuleLeadLevel);
    if (newParams.globuleLeadBpm !== undefined) globalPiano.setGlobuleLeadBpm(newParams.globuleLeadBpm);

    if (remasteredEngineRef.current) {
      remasteredEngineRef.current.liveParams = { ...merged };
      if (newParams.particleCount && newParams.particleCount !== simulationParamsRef.current.particleCount) {
        remasteredEngineRef.current.allocSwarmBuffers(newParams.particleCount);
        remasteredEngineRef.current.loadSwarm(remasteredEngineRef.current.currentV);
      }
      if (
        newParams.sunX !== undefined ||
        newParams.sunY !== undefined ||
        newParams.sunZ !== undefined ||
        newParams.sunIntensity !== undefined ||
        newParams.ambientIntensity !== undefined ||
        newParams.secondarySunIntensity !== undefined ||
        newParams.sunHue !== undefined
      ) {
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

  // Preset switch changes 3D form / V16 globules; applies dedicated V16 autorotation defaults when entering V16
  const handleSelectVersion = (v: string) => {
    const wasV16 = currentV === 'V16';
    setCurrentV(v);
    if (v === 'V16') {
      globalPiano.resume().catch(() => {});
      handleUpdateParams({
        rotX: -0.6,
        rotY: 0.6,
        rotZ: -0.5,
        rot4dXW: 0.5,
        rot4dYW: -0.3,
        rot4dZW: 0.3,
        isAutoRotationOn: true,
      });
    } else if (wasV16) {
      handleUpdateParams({
        rotX: -0.1,
        rotY: 0.1,
        rotZ: -0.1,
        rot4dXW: 0.1,
        rot4dYW: -0.1,
        rot4dZW: 0.1,
      });
    }
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
    globalPiano.resume().catch(() => {});
    const next = !isWebcamActive;
    setIsWebcamActive(next);
    if (next) {
      triggerToast("AVVIO WEBCAM PIP (Hand tracking attivo / Virtual pad)");
    } else {
      triggerToast("WEBCAM CHIUSA");
    }
  };

  const handleToggleMic = async () => {
    globalPiano.resume().catch(() => {});
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
      activeEngine.camera.position.set(0, 0, DEFAULT_SIMULATION_PARAMS.zoom);
      activeEngine.camera.lookAt(0, 0, 0);
      handleUpdateParams({ zoom: DEFAULT_SIMULATION_PARAMS.zoom });
    }
  };

  const handleSnapshot = () => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);
    const activeEngine = engineMode === 'MOTHER' ? motherEngineRef.current : remasteredEngineRef.current;
    if (activeEngine && activeEngine.renderer && activeEngine.scene && activeEngine.camera) {
      activeEngine.renderer.render(activeEngine.scene, activeEngine.camera);
      const a = document.createElement('a');
      a.download = `NebulaCore_${engineMode}_${Date.now()}.png`;
      a.href = activeEngine.renderer.domElement.toDataURL('image/png');
      a.click();
    }
    triggerToast("📸 Screenshot PNG Salvato!");
  };

  // Global MUTE silences ALL audio (Synth, Drone, Crystals, V16 Lead, Zen & Sleep Binaural/Bowl/Tones/Noise) while preserving MIDI Out
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    globalPiano.setMuted(nextMuted);
    globalRelaxation.setMuted(nextMuted);
    setIsMuted(nextMuted);
    triggerToast(nextMuted ? "🔇 Tutto l'Audio Silenziato (MIDI Out attivo)" : "🔊 Audio Riattivato");
  };

  const handleToggleTouchMode = () => {
    const nextMode = simulationParams.touchMode === 'ATTRACT' ? 'REPEL' : 'ATTRACT';
    handleUpdateParams({ touchMode: nextMode });
    triggerToast(nextMode === 'REPEL' ? "💥 Modalità Forza: REPULSIONE" : "🧲 Modalità Forza: ATTRAZIONE");
  };

  const isTrailsActive = simulationParams.isTrailsOn ?? true;
  const handleToggleTrails = () => {
    const nextOn = !isTrailsActive;
    handleUpdateParams({ isTrailsOn: nextOn });
    triggerToast(nextOn ? "🌠 Scie 3D: ATTIVE" : "🌠 Scie 3D: DISATTIVE");
  };

  const isRotActive = simulationParams.isAutoRotationOn ?? true;
  const handleToggleRot = () => {
    const nextOn = !isRotActive;
    handleUpdateParams({ isAutoRotationOn: nextOn });
    triggerToast(nextOn ? "🔄 Autorotazione 3D/4D: ON" : "🔄 Autorotazione 3D/4D: OFF");
  };

  const handleToggleTilt = async () => {
    if (!isTiltActive) {
      const DeviceOrientationClass = window.DeviceOrientationEvent as any;
      if (typeof DeviceOrientationClass !== 'undefined' && typeof DeviceOrientationClass.requestPermission === 'function') {
        try {
          const perm = await DeviceOrientationClass.requestPermission();
          if (perm !== 'granted') {
            triggerToast("Permesso accelerometro non concesso", true);
            return;
          }
        } catch (e) {
          console.warn("DeviceOrientation error", e);
        }
      }
      setIsTiltActive(true);
      triggerToast("🧭 Giroscopio & Gravità TILT Attivati");
    } else {
      setIsTiltActive(false);
      if (remasteredEngineRef.current) {
        remasteredEngineRef.current.setTiltForce(0, 0);
      }
      triggerToast("Giroscopio TILT Disattivato");
    }
  };

  useEffect(() => {
    if (!isTiltActive) return;
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma || 0;
      const beta = e.beta || 0;
      setTiltAngles({ x: gamma, y: beta, force: 1.0 });

      const tiltX = Math.max(-1.5, Math.min(1.5, gamma / 35.0));
      const tiltY = Math.max(-1.5, Math.min(1.5, -beta / 35.0));

      if (remasteredEngineRef.current) {
        remasteredEngineRef.current.setTiltForce(tiltX * 4.0, tiltY * 4.0);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
      if (remasteredEngineRef.current) {
        remasteredEngineRef.current.setTiltForce(0, 0);
      }
    };
  }, [isTiltActive]);

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

  const handleResetPhysicsAndAudio = () => {
    handleUpdateParams({ ...DEFAULT_SIMULATION_PARAMS });
    globalRelaxation.applyDefaults(true);
    triggerToast("🔄 Ripristinati valori base screenshot (Fisica, Luci, Scie & Audio)");
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#020905]">
      <div
        ref={containerRef}
        id="canvas-container"
        className="absolute inset-0 w-full h-full z-0 touch-none"
      />

      <PresetPill
        currentV={currentV}
        fps={fps}
        globuleCount={globuleCount}
        onSelectVersion={handleSelectVersion}
      />

      <div
        id="flash-overlay"
        className={`fixed inset-0 bg-white z-[99999] pointer-events-none transition-opacity duration-200 ${
          isFlashing ? 'opacity-60' : 'opacity-0'
        }`}
      />

      {toastMessage && (
        <div className={`fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-2 shadow-xl backdrop-blur-md transition-all ${
          toastMessage.isError
            ? 'bg-[#330000]/90 border border-[#ff3333] text-[#ff8888] shadow-[#ff0000]/20'
            : 'bg-[#002b15]/90 border border-[#00ff88] text-[#00ff88] shadow-[#00ff88]/20'
        }`}>
          <span>{toastMessage.text}</span>
        </div>
      )}

      <PipPreview
        isWebcamActive={isWebcamActive}
        onToggleWebcam={handleToggleWebcam}
      />

      <HubDrawer
        activeTab={activeHubTab}
        onClose={() => setActiveHubTab(null)}
        params={simulationParams}
        onUpdateParams={handleUpdateParams}
        currentV={currentV}
        onSelectVersion={handleSelectVersion}
        engineMode={engineMode}
        onSelectEngineMode={(mode) => setEngineMode(mode)}
        currentGeoType={currentGeoType}
        onChangeGeoType={(geo) => {
          setCurrentGeoType(geo);
          if (remasteredEngineRef.current) remasteredEngineRef.current.setGeometryType(geo);
        }}
        isCycleActive={isCycleActive}
        onToggleCycle={handleToggleCycle}
        isCamActive={isWebcamActive}
        onToggleCam={handleToggleWebcam}
        isMicActive={isMicActive}
        onToggleMic={handleToggleMic}
        isTiltActive={isTiltActive}
        onToggleTilt={handleToggleTilt}
        tiltAngleX={tiltAngles.x}
        tiltAngleY={tiltAngles.y}
        tiltForce={tiltAngles.force}
        onUpdateTiltParams={(force) => {
          setTiltAngles(prev => ({ ...prev, force }));
        }}
        cycleTime={simulationParams.cycleTime}
        onUpdateCycleTime={(time) => handleUpdateParams({ cycleTime: time })}
        isTrailsActive={isTrailsActive}
        onToggleTrails={handleToggleTrails}
        isAutorotActive={isRotActive}
        onToggleAutorot={handleToggleRot}
        touchMode={simulationParams.touchMode}
        onToggleTouchMode={handleToggleTouchMode}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onTakePhoto={handleSnapshot}
        isRecording={isRecording}
        onToggleRecord={handleToggleRecording}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onOpenDownloadPortal={() => setIsDownloadPortalOpen(true)}
        isMidiActive={isMidiConnected}
        midiDeviceName={midiName}
        onToggleMidi={handleToggleMidi}
        globuleLeadStatus={globuleLeadStatus}
        globuleCount={globuleCount}
        onResetGlobules={() => {
          remasteredEngineRef.current?.resetV16Globules();
          triggerToast("↺ V16 GLOBULI ripristinati a 7 nuclei iridescenti");
        }}
        onResetPhysics={handleResetPhysicsAndAudio}
      />

      <BottomDock
        activeTab={activeHubTab}
        onSelectTab={(tab) => setActiveHubTab(tab)}
        isMicActive={isMicActive}
        onToggleMic={handleToggleMic}
        isCamActive={isWebcamActive}
        onToggleCam={handleToggleWebcam}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onTakePhoto={handleSnapshot}
        isRecording={isRecording}
        recordSeconds={recordSeconds}
        onToggleRecord={handleToggleRecording}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onOpenPresetModal={() => setIsPresetModalOpen(true)}
        isMidiActive={isMidiConnected}
        midiDeviceName={midiName}
        onToggleMidi={handleToggleMidi}
        isCycleActive={isCycleActive}
        cycleTime={simulationParams.cycleTime}
        onToggleCycle={handleToggleCycle}
        isRotActive={isRotActive}
        onToggleRot={handleToggleRot}
        touchMode={simulationParams.touchMode}
        onToggleTouchMode={handleToggleTouchMode}
        isTrailsActive={isTrailsActive}
        onToggleTrails={handleToggleTrails}
        isTiltActive={isTiltActive}
        onToggleTilt={handleToggleTilt}
      />

      <PresetModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        currentVersion={currentV}
        currentParams={simulationParams}
        onApplyPreset={handleApplyPreset}
      />

      <RecordingModal
        session={recordedSession}
        onClose={() => setRecordedSession(null)}
      />

      <DownloadPortalModal
        isOpen={isDownloadPortalOpen}
        onClose={() => setIsDownloadPortalOpen(false)}
      />

      <div className="fixed bottom-2 left-3 z-20 hidden lg:block text-[9px] font-mono text-[#44aa66] bg-[#020603]/80 px-2 py-0.5 rounded border border-[#00ff88]/20 pointer-events-none">
        <b className="text-[#00e5ff]">[M]</b> Mother/Remaster | <b className="text-[#00e5ff]">[W]</b> Cam | <b className="text-[#00e5ff]">[C]</b> Cycle | <b className="text-[#00e5ff]">[CLICK/TOUCH]</b> Piano
      </div>
    </div>
  );
}
