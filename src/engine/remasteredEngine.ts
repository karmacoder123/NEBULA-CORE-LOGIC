/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import * as THREE from 'three';
import { VersionConfig, SimulationParams, GeometryType } from '../types.ts';
import { globalPiano } from '../audio/pianoEngine.ts';

export const REMASTERED_VERSION_DATA: Record<string, VersionConfig> = {
  "V1": { geo: 'box', size: 2.4, form: 'BOX', mat: 'phong', shininess: 25, metalness: 0, roughness: 0.6, opacity: 1.0, emissive: false, additive: false, wander: 600, spectra: 500, hemi: 0.45, ambientColor: 0xffffff },
  "V2": { geo: 'icosahedron', size: 2.8, form: 'SPHERE', mat: 'phong', shininess: 30, metalness: 0, roughness: 0.6, opacity: 1.0, emissive: false, additive: false, wander: 800, spectra: 400, hemi: 0.30, ambientColor: 0xffffff },
  "V3": { geo: 'cone', size: 2.6, form: 'TORUS', mat: 'phong', shininess: 18, metalness: 0, roughness: 0.7, opacity: 1.0, emissive: false, additive: false, wander: 500, spectra: 600, hemi: 0.25, ambientColor: 0xffeedd },
  // V4 — WHITE PARTICLES HARMONIZED: natural soft diffuse without glare
  "V4": { geo: 'cylinder', size: 2.4, form: 'PLANE', mat: 'lambert', shininess: 15, metalness: 0.0, roughness: 0.7, opacity: 0.8, emissive: false, additive: false, wander: 300, spectra: 250, hemi: 0.65, ambientColor: 0xaaddff },
  "V5": { geo: 'octahedron', size: 2.3, form: 'SPHERE', mat: 'phong', shininess: 20, metalness: 0, roughness: 0.7, opacity: 0.94, emissive: false, additive: false, wander: 80, spectra: 80, hemi: 0.18, ambientColor: 0xffffff },
  // V6 — WHITE/NORMAL HARMONIZED: clean non-glaring prismatic tone
  "V6": { geo: 'tetrahedron', size: 2.6, form: 'BOX', mat: 'normal', shininess: 0, metalness: 0.0, roughness: 0.6, opacity: 1.0, emissive: false, additive: false, wander: 0, spectra: 0, hemi: 0.0, ambientColor: 0xffffff },
  "V7": { geo: 'dodecahedron', size: 2.4, form: 'TORUS', mat: 'phong', shininess: 35, metalness: 0.3, roughness: 0.5, opacity: 1.0, emissive: false, additive: false, wander: 700, spectra: 700, hemi: 0.35, ambientColor: 0xffffff },
  // V8 — MATTE TORNADO HARMONIZED: saturated diffuse without white washout
  "V8": { geo: 'sphere_low', size: 2.2, form: 'SPHERE', mat: 'phong', shininess: 14, metalness: 0.0, roughness: 0.85, opacity: 1.0, emissive: false, additive: false, wander: 0, spectra: 0, hemi: 0.15, ambientColor: 0xffffff },
  // V9 — WHITE TRANSLUCENT HARMONIZED: soft translucent cloud
  "V9": { geo: 'sphere', size: 2.6, form: 'PLANE', mat: 'lambert', shininess: 15, metalness: 0.0, roughness: 0.7, opacity: 0.6, emissive: false, additive: false, wander: 250, spectra: 250, hemi: 0.70, ambientColor: 0xccffee },
  // V10 — WHITE/OBELISK HARMONIZED: soft crystals without blown out specular
  "V10": { geo: 'box_long', size: 2.2, form: 'BOX', mat: 'standard', shininess: 20, metalness: 0.2, roughness: 0.7, opacity: 1.0, emissive: false, additive: false, wander: 650, spectra: 450, hemi: 0.40, ambientColor: 0xffddaa },
  "V11": { geo: 'cone_inv', size: 2.3, form: 'SPHERE', mat: 'phong', shininess: 25, metalness: 0, roughness: 0.6, opacity: 1.0, emissive: false, additive: false, wander: 750, spectra: 550, hemi: 0.38, ambientColor: 0xffffff },
  "V12": { geo: 'octahedron', size: 2.8, form: 'TORUS', mat: 'phong', shininess: 20, metalness: 0, roughness: 0.7, opacity: 0.94, emissive: false, additive: false, wander: 80, spectra: 80, hemi: 0.15, ambientColor: 0xff3300 },
  "V13": { geo: 'dodecahedron', size: 2.6, form: 'SPHERE', mat: 'phong', shininess: 40, metalness: 0, roughness: 0.5, opacity: 1.0, emissive: false, additive: false, wander: 900, spectra: 900, hemi: 0.20, ambientColor: 0xffffff },
  // V14 — NEW VERSION: ETHEREAL QUANTUM STARLIGHT (soft, deep non-glaring star particles)
  "V14": { geo: 'octahedron', size: 2.8, form: 'STAR', mat: 'phong', shininess: 30, metalness: 0.1, roughness: 0.5, opacity: 1.0, emissive: false, additive: false, wander: 850, spectra: 850, hemi: 0.30, ambientColor: 0x55ccff, title: 'NODO' },
  // V15 — FILAMENTI: 12 intertwined 3D sinusoidal plasma strands
  "V15": { geo: 'tetrahedron', size: 2.6, form: 'FILAMENT', mat: 'phong', shininess: 35, metalness: 0.15, roughness: 0.45, opacity: 1.0, emissive: false, additive: false, wander: 900, spectra: 900, hemi: 0.35, ambientColor: 0x00e5ff, title: 'FILAMENTI', wanderWeight: 1.8, spectraWeight: 1.8 },
  // V16 — GLOBULI + LEAD TRANCE: 18 Fibonacci spherical clusters with expanded Wanderer & Spectra range
  "V16": { geo: 'sphere', size: 3.6, form: 'GLOBULE', mat: 'phong', shininess: 40, metalness: 0.1, roughness: 0.5, opacity: 1.0, emissive: false, additive: false, wander: 850, spectra: 850, hemi: 0.30, ambientColor: 0xcc66ff, title: 'GLOBULI', wanderWeight: 0.8, spectraWeight: 0.8, celestialRadius: 850 }
};

export const REMASTERED_KEYS = Object.keys(REMASTERED_VERSION_DATA);

const isIPhoneOrIPadDevice = typeof navigator !== 'undefined' && (
  /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
);
const ENGINE_DEFAULT_PARTICLES = isIPhoneOrIPadDevice ? 3500 : 20000;

export class RemasteredEngine {
  public container: HTMLElement | null = null;
  public renderer: THREE.WebGLRenderer | null = null;
  public scene: THREE.Scene | null = null;
  public camera: THREE.PerspectiveCamera | null = null;
  public instancedMesh: THREE.InstancedMesh | null = null;
  private fadeScene: THREE.Scene | null = null;
  private fadeCamera: THREE.OrthographicCamera | null = null;
  private fadeMat: THREE.MeshBasicMaterial | null = null;

  public currentV = "V13";
  public currentGeoType: GeometryType = 'octa';
  private useCustomGeo = false;
  public cycleActive = false;
  public isWebcamActive = false;
  public isMicActive = false;
  public onVersionChange: ((vId: string) => void) | null = null;
  public onFpsUpdate: ((fps: number) => void) | null = null;
  public onGlobuleCountChange: ((activeCount: number, maxCount: number) => void) | null = null;
  private globuleCelestialEnergy = 0;
  private fpsFrames = 0;
  private fpsLastAt = 0;

  // V16 Iridescent 7 -> 49 Globules State
  private static readonly V16_MIN_GLOBULES = 7;
  private static readonly V16_MAX_GLOBULES = 49;
  private activeGlobuleCount = 7;
  private globuleSwarmGroup: THREE.Group | null = null;
  private globuleBaseGeo: THREE.SphereGeometry | null = null;
  private globuleMeshes: THREE.Mesh[] = [];
  private globuleMaterials: THREE.ShaderMaterial[] = [];
  private globulePos = new Float32Array(49 * 3);
  private globuleVel = new Float32Array(49 * 3);
  private globuleRotAxis = new Float32Array(49 * 3);
  private globuleSpinRate = new Float32Array(49);
  private globuleScale = new Float32Array(49);
  private globuleTargetScale = new Float32Array(49);
  private globulePulse = new Float32Array(49);
  private globuleSeed = new Float32Array(49);
  private lastGlobuleSpawnAt = 0;
  private globuleRayMesh: THREE.Mesh | null = null;
  private globuleRayMat: THREE.MeshBasicMaterial | null = null;
  private globuleRayPhase: 'IDLE' | 'EXPANDING' | 'COLLAPSING' = 'IDLE';
  private globuleRayProgress = 0;
  private lastGlobuleRayAt = 0;
  private globuleCentroid = new THREE.Vector3();

  // Evident 3D Ring Cursor (Wanderer/Spectra style)
  private cursorGroup: THREE.Group | null = null;
  private cursorCore: THREE.Mesh | null = null;
  private cursorRingAlpha: THREE.Mesh | null = null;
  private cursorRingBeta: THREE.Mesh | null = null;
  private hasPointerMoved = false;

  public liveParams: SimulationParams = {
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
    particleCount: ENGINE_DEFAULT_PARTICLES,
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
    cursorRingOn: true
  };

  private positions!: Float32Array;
  private velocities!: Float32Array;
  private homes!: Float32Array;
  private home4!: Float32Array;
  private ang4 = { xw: 0, yw: 0, zw: 0 };
  private colorShuffling!: Float32Array;
  private spinAngles!: Float32Array;
  private colHead = new Int32Array(1 << 14);
  private colNext = new Int32Array(25000);
  private lastCrystalHitTime = 0;
  private crystalDamp = 0;

  // True 3D Geometric Trails
  private trailLines: THREE.LineSegments | null = null;
  private trailMat: THREE.LineBasicMaterial | null = null;
  private trailHistory: Float32Array | null = null;
  private trailPosBuf: Float32Array | null = null;
  private trailColBuf: Float32Array | null = null;
  private trailMaxTracers = 1000;
  private trailMaxSegments = 60;
  private trailHead = 0;

  private dummy = new THREE.Object3D();
  private colorOffset = 0;
  private spectraColorOffset = 0;
  private tempColor = new THREE.Color();
  private audioBoost = 0;
  private audioEnergy = 0.0;

  private wanderer!: THREE.Group;
  private wanderRingAlpha!: THREE.Mesh;
  private wanderRingBeta!: THREE.Mesh;
  private wanderLight!: THREE.PointLight;

  private spectraGroup!: THREE.Group;
  private spectraMesh!: THREE.Mesh;
  private spectraRingAlpha!: THREE.Mesh;
  private spectraRingBeta!: THREE.Mesh;
  private spectraLight!: THREE.PointLight;

  private staticSun!: THREE.DirectionalLight;
  private secondarySun!: THREE.DirectionalLight;
  private ambientLight!: THREE.AmbientLight;

  private mousePos = new THREE.Vector3();
  private isMouseDown = false;
  private targetHandPos = new THREE.Vector3();
  public isHandPresent = false;
  public isHandClosed = false;

  private lastCycleSwitch = 0;
  private lastTime = 0;
  private isRunning = false;
  private animId: number | null = null;
  private lastBpmTime = 0;
  private lastMicTriggerTime = 0;
  public tiltForceX = 0;
  public tiltForceY = 0;

  // Microphone
  private micStream: MediaStream | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private micDataArray: Uint8Array | null = null;
  private micAudioCtx: AudioContext | null = null;

  public mount(targetContainer: HTMLElement) {
    this.container = targetContainer;
    this.container.innerHTML = '';

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(65, width / height, 1, 6000);
    this.camera.position.z = this.liveParams.zoom;

    // WANDERER (Repulsor Entity)
    this.wanderer = new THREE.Group();
    this.wanderer.add(new THREE.Mesh(
      new THREE.SphereGeometry(14, 24, 24),
      new THREE.MeshPhongMaterial({ color: 0x050505, shininess: 120 })
    ));
    this.wanderRingAlpha = new THREE.Mesh(
      new THREE.TorusGeometry(22, 1.4, 16, 80),
      new THREE.MeshPhongMaterial({ color: 0x00ff88, emissive: 0x00ff88, emissiveIntensity: 10, transparent: true, opacity: 0.92 })
    );
    this.wanderRingBeta = new THREE.Mesh(
      new THREE.TorusGeometry(16, 0.9, 16, 80),
      new THREE.MeshPhongMaterial({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: 10, transparent: true, opacity: 0.92 })
    );
    this.wanderer.add(this.wanderRingAlpha, this.wanderRingBeta);
    this.scene.add(this.wanderer);

    // SPECTRA (Attractor Entity)
    this.spectraGroup = new THREE.Group();
    this.spectraMesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(15, 0),
      new THREE.MeshPhongMaterial({ color: 0x0a000a, emissive: 0xff00aa, emissiveIntensity: 35, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending })
    );
    this.spectraRingAlpha = new THREE.Mesh(
      new THREE.TorusGeometry(22, 1.2, 16, 80),
      new THREE.MeshPhongMaterial({ emissive: 0xff00aa, emissiveIntensity: 12, transparent: true, opacity: 0.92 })
    );
    this.spectraRingBeta = new THREE.Mesh(
      new THREE.TorusGeometry(15, 0.8, 16, 80),
      new THREE.MeshPhongMaterial({ emissive: 0xffff00, emissiveIntensity: 12, transparent: true, opacity: 0.92 })
    );
    this.spectraGroup.add(this.spectraMesh, this.spectraRingAlpha, this.spectraRingBeta);
    this.scene.add(this.spectraGroup);

    // LIGHTS
    this.staticSun = new THREE.DirectionalLight(0xffffff, this.liveParams.sunIntensity);
    this.secondarySun = new THREE.DirectionalLight(0xffffff, this.liveParams.secondarySunIntensity ?? 2.9);
    this.secondarySun.position.set(-450, -350, -400);
    this.ambientLight = new THREE.AmbientLight(0xffffff, this.liveParams.ambientIntensity);
    this.applySunLights();
    this.scene.add(this.staticSun, this.secondarySun, this.ambientLight);

    this.wanderLight = new THREE.PointLight(0x00ff88, 600, 3000);
    this.scene.add(this.wanderLight);

    this.spectraLight = new THREE.PointLight(0xff00aa, 800, 3000);
    this.scene.add(this.spectraLight);

    // EVIDENT 3D RING CURSOR (Wanderer/Spectra style)
    this.cursorGroup = new THREE.Group();
    this.cursorCore = new THREE.Mesh(
      new THREE.SphereGeometry(7, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x00ffaa, transparent: true, opacity: 0.92 })
    );
    this.cursorRingAlpha = new THREE.Mesh(
      new THREE.TorusGeometry(24, 1.5, 16, 72),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.92 })
    );
    this.cursorRingBeta = new THREE.Mesh(
      new THREE.TorusGeometry(15.5, 1.0, 16, 72),
      new THREE.MeshBasicMaterial({ color: 0x00ffaa, transparent: true, opacity: 0.90 })
    );
    this.cursorGroup.add(this.cursorCore, this.cursorRingAlpha, this.cursorRingBeta);
    this.cursorGroup.visible = false;
    this.scene.add(this.cursorGroup);

    // FADE TRAIL PASS (Pure Pitch Black for deep contrast)
    this.fadeScene = new THREE.Scene();
    this.fadeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.fadeMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: this.liveParams.trailOpacity });
    this.fadeScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.fadeMat));

    this.allocSwarmBuffers(this.liveParams.particleCount);
    this.initTrailSystem();
    this.initV16GlobuleSystem();
    this.loadSwarm(this.currentV);

    this.bindWindowEvents();
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animate();
  }

  public unmount() {
    this.isRunning = false;
    if (this.animId) cancelAnimationFrame(this.animId);
    this.unbindWindowEvents();
    this.stopMicrophone();
    this.disposeTrailSystem();
    this.disposeV16GlobuleSystem();

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
      this.renderer = null;
    }
  }

  private initTrailSystem() {
    if (!this.scene) return;
    this.disposeTrailSystem();
    const totalVertices = this.trailMaxTracers * this.trailMaxSegments * 2;
    this.trailHistory = new Float32Array(this.trailMaxTracers * (this.trailMaxSegments + 1) * 3);
    this.trailPosBuf = new Float32Array(totalVertices * 3);
    this.trailColBuf = new Float32Array(totalVertices * 3);
    this.trailHead = 0;

    const geo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(this.trailPosBuf, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    const colAttr = new THREE.BufferAttribute(this.trailColBuf, 3);
    colAttr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('position', posAttr);
    geo.setAttribute('color', colAttr);
    geo.setDrawRange(0, 0);

    this.trailMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.trailLines = new THREE.LineSegments(geo, this.trailMat);
    this.trailLines.frustumCulled = false;
    this.scene.add(this.trailLines);
  }

  private disposeTrailSystem() {
    if (this.trailLines && this.scene) {
      this.scene.remove(this.trailLines);
      this.trailLines.geometry.dispose();
      this.trailLines = null;
    }
    if (this.trailMat) {
      this.trailMat.dispose();
      this.trailMat = null;
    }
    this.trailHistory = null;
    this.trailPosBuf = null;
    this.trailColBuf = null;
  }

  private resetTrailHistory() {
    if (!this.trailHistory || !this.positions) return;
    const count = Math.max(1, this.liveParams.particleCount);
    const ringLen = this.trailMaxSegments + 1;
    for (let t = 0; t < this.trailMaxTracers; t++) {
      const pIdx = ((t * 17) % count) * 3;
      const px = this.positions[pIdx] || 0;
      const py = this.positions[pIdx + 1] || 0;
      const pz = this.positions[pIdx + 2] || 0;
      for (let s = 0; s < ringLen; s++) {
        const hIdx = (t * ringLen + s) * 3;
        this.trailHistory[hIdx] = px;
        this.trailHistory[hIdx + 1] = py;
        this.trailHistory[hIdx + 2] = pz;
      }
    }
    this.trailHead = 0;
  }

  private updateTrailSystem(isGlobuleNow: boolean) {
    if (!this.trailLines || !this.trailHistory || !this.trailPosBuf || !this.trailColBuf) return;
    const trailsEnabled = (this.liveParams.isTrailsOn ?? true) && !isGlobuleNow;
    this.trailLines.visible = trailsEnabled;
    if (!trailsEnabled) return;

    const tracerCount = Math.max(10, Math.min(this.trailMaxTracers, this.liveParams.trailTracerCount ?? 275));
    const segLen = Math.max(4, Math.min(this.trailMaxSegments, this.liveParams.trailLength ?? 26));
    const persist = Math.max(0.5, Math.min(5.0, this.liveParams.trailPersistence ?? 2.5));
    const ringLen = this.trailMaxSegments + 1;
    const pCount = Math.max(1, this.liveParams.particleCount);

    this.trailHead = (this.trailHead + 1) % ringLen;
    let outVert = 0;

    for (let t = 0; t < tracerCount; t++) {
      const pIdx = (t * 17) % pCount;
      const p3 = pIdx * 3;
      const headSlot = (t * ringLen + this.trailHead) * 3;
      this.trailHistory[headSlot] = this.positions[p3];
      this.trailHistory[headSlot + 1] = this.positions[p3 + 1];
      this.trailHistory[headSlot + 2] = this.positions[p3 + 2];

      const hue = (this.colorShuffling[pIdx] + this.colorOffset) % 1;
      this.tempColor.setHSL(hue, this.liveParams.particleSaturation ?? 0.95, 0.55);

      for (let s = 0; s < segLen; s++) {
        const idxA = (this.trailHead - s + ringLen) % ringLen;
        const idxB = (this.trailHead - s - 1 + ringLen) % ringLen;
        const hA = (t * ringLen + idxA) * 3;
        const hB = (t * ringLen + idxB) * 3;

        const vA = outVert * 3;
        const vB = (outVert + 1) * 3;
        this.trailPosBuf[vA] = this.trailHistory[hA];
        this.trailPosBuf[vA + 1] = this.trailHistory[hA + 1];
        this.trailPosBuf[vA + 2] = this.trailHistory[hA + 2];
        this.trailPosBuf[vB] = this.trailHistory[hB];
        this.trailPosBuf[vB + 1] = this.trailHistory[hB + 1];
        this.trailPosBuf[vB + 2] = this.trailHistory[hB + 2];

        const fadeA = Math.min(1.0, ((segLen - s) / segLen) * 0.45 * persist);
        const fadeB = Math.min(1.0, ((segLen - s - 1) / segLen) * 0.45 * persist);
        this.trailColBuf[vA] = this.tempColor.r * fadeA;
        this.trailColBuf[vA + 1] = this.tempColor.g * fadeA;
        this.trailColBuf[vA + 2] = this.tempColor.b * fadeA;
        this.trailColBuf[vB] = this.tempColor.r * fadeB;
        this.trailColBuf[vB + 1] = this.tempColor.g * fadeB;
        this.trailColBuf[vB + 2] = this.tempColor.b * fadeB;
        outVert += 2;
      }
    }

    if (this.instancedMesh) {
      this.trailLines.rotation.copy(this.instancedMesh.rotation);
    }

    const geo = this.trailLines.geometry;
    geo.setDrawRange(0, outVert);
    (geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (geo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
  }

  private initV16GlobuleSystem() {
    if (!this.scene) return;
    this.disposeV16GlobuleSystem();

    this.globuleSwarmGroup = new THREE.Group();
    this.globuleSwarmGroup.visible = false;
    this.scene.add(this.globuleSwarmGroup);

    this.globuleBaseGeo = new THREE.SphereGeometry(1, 32, 24);

    const vertShader = `
      uniform float uTime;
      uniform float uSeed;
      uniform float uPulse;
      varying vec3 vNormal;
      varying vec3 vViewPos;
      varying vec3 vLocalPos;

      float globuleDisp(vec3 n, float t, float seed, float pulse) {
        float w1 = sin(n.x * 3.1 + t * 1.85 + seed * 6.28318);
        float w2 = cos(n.y * 3.4 - t * 1.45 + seed * 4.71239);
        float w3 = sin(n.z * 2.8 + t * 2.15 - seed * 3.14159);
        float w4 = cos((n.x + n.y - n.z) * 2.2 + t * 1.3 + seed * 5.1);
        return 1.0 + 0.145 * (w1 * w2 + 0.55 * w3) + 0.055 * w4 + pulse * 0.08 * sin(n.y * 5.0 + t * 9.0);
      }

      void main() {
        vec3 n = normalize(position);
        float d = globuleDisp(n, uTime, uSeed, uPulse);
        vec3 displaced = n * d;

        vec3 up = abs(n.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
        vec3 t1 = normalize(cross(up, n));
        vec3 t2 = cross(n, t1);
        float eps = 0.025;
        vec3 n1 = normalize(n + t1 * eps);
        vec3 n2 = normalize(n + t2 * eps);
        vec3 p1 = n1 * globuleDisp(n1, uTime, uSeed, uPulse);
        vec3 p2 = n2 * globuleDisp(n2, uTime, uSeed, uPulse);
        vec3 deformedNormal = normalize(cross(p1 - displaced, p2 - displaced));
        if (dot(deformedNormal, n) < 0.0) deformedNormal = -deformedNormal;

        vLocalPos = displaced;
        vNormal = normalize(normalMatrix * deformedNormal);
        vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
        vViewPos = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragShader = `
      uniform float uTime;
      uniform float uSeed;
      uniform float uHueShift;
      uniform float uPulse;
      uniform float uSaturation;
      uniform float uBrightness;
      varying vec3 vNormal;
      varying vec3 vViewPos;
      varying vec3 vLocalPos;

      vec3 rainbowPalette(float t) {
        return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
      }

      void main() {
        vec3 N = normalize(vNormal);
        vec3 V = normalize(vViewPos);
        float ndotv = clamp(abs(dot(N, V)), 0.0, 1.0);
        float fresnel = pow(1.0 - ndotv, 1.45);

        float surfaceWave = dot(vLocalPos, vec3(0.38, 0.29, 0.33));
        float filmPhase = ndotv * 1.75 + surfaceWave + uSeed * 1.43 + uHueShift + uTime * 0.14;
        vec3 rainbow = rainbowPalette(filmPhase);
        vec3 satRainbow = mix(vec3(0.5), rainbow, clamp(uSaturation, 0.35, 1.25));

        vec3 L1 = normalize(vec3(0.55, 0.72, 0.65));
        vec3 L2 = normalize(vec3(-0.6, -0.4, 0.5));
        vec3 H1 = normalize(L1 + V);
        vec3 H2 = normalize(L2 + V);
        float spec1 = pow(max(dot(N, H1), 0.0), 46.0);
        float spec2 = pow(max(dot(N, H2), 0.0), 22.0) * 0.45;

        float bodyMix = mix(0.28, 0.88, fresnel) + 0.22 * max(dot(N, L1), 0.0);
        vec3 coreTint = satRainbow * bodyMix * (0.65 + uBrightness * 0.85);
        vec3 rimGlow = rainbowPalette(filmPhase + 0.18) * fresnel * (0.62 + uPulse * 0.35);
        vec3 col = coreTint + rimGlow + vec3(0.95, 0.98, 1.0) * (spec1 * 0.95 + spec2 * 0.4);

        float alpha = clamp(0.76 + fresnel * 0.22 + spec1 * 0.15, 0.0, 0.98);
        gl_FragColor = vec4(col, alpha);
      }
    `;

    this.globuleMeshes = [];
    this.globuleMaterials = [];

    for (let k = 0; k < RemasteredEngine.V16_MAX_GLOBULES; k++) {
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uSeed: { value: (k * 0.6180339887) % 1 },
          uHueShift: { value: 0 },
          uPulse: { value: 0 },
          uSaturation: { value: 0.95 },
          uBrightness: { value: 0.48 }
        },
        vertexShader: vertShader,
        fragmentShader: fragShader,
        transparent: true,
        depthWrite: true
      });
      const mesh = new THREE.Mesh(this.globuleBaseGeo, mat);
      mesh.visible = false;
      mesh.frustumCulled = false;
      this.globuleSwarmGroup.add(mesh);
      this.globuleMeshes.push(mesh);
      this.globuleMaterials.push(mat);
    }

    // Thin, screen-edge reaching radial shard beams (expand outward -> collapse back to swarm centroid)
    const rayCount = 64;
    const positions = new Float32Array(rayCount * 4 * 3);
    const colors = new Float32Array(rayCount * 4 * 3);
    const indices: number[] = [];
    const cTmp = new THREE.Color();

    for (let r = 0; r < rayCount; r++) {
      const phi = Math.acos(1 - 2 * ((r + 0.5) / rayCount));
      const theta = Math.PI * (1 + Math.sqrt(5)) * r;
      const dx = Math.sin(phi) * Math.cos(theta);
      const dy = Math.cos(phi);
      const dz = Math.sin(phi) * Math.sin(theta);
      let px = -dz, py = 0.25 * dx, pz = dx;
      const pLen = Math.hypot(px, py, pz) || 1;
      px /= pLen; py /= pLen; pz /= pLen;

      const innerR = 14;
      const outerR = 1900 + (r % 5) * 280;
      const wInner = 0.45;
      const wOuter = 1.65 + (r % 3) * 0.45;
      const vBase = r * 4;

      positions[(vBase + 0) * 3] = dx * innerR - px * wInner;
      positions[(vBase + 0) * 3 + 1] = dy * innerR - py * wInner;
      positions[(vBase + 0) * 3 + 2] = dz * innerR - pz * wInner;

      positions[(vBase + 1) * 3] = dx * innerR + px * wInner;
      positions[(vBase + 1) * 3 + 1] = dy * innerR + py * wInner;
      positions[(vBase + 1) * 3 + 2] = dz * innerR + pz * wInner;

      positions[(vBase + 2) * 3] = dx * outerR + px * wOuter;
      positions[(vBase + 2) * 3 + 1] = dy * outerR + py * wOuter;
      positions[(vBase + 2) * 3 + 2] = dz * outerR + pz * wOuter;

      positions[(vBase + 3) * 3] = dx * outerR - px * wOuter;
      positions[(vBase + 3) * 3 + 1] = dy * outerR - py * wOuter;
      positions[(vBase + 3) * 3 + 2] = dz * outerR - pz * wOuter;

      cTmp.setHSL((r / rayCount) % 1, 0.85, 0.58);
      for (let v = 0; v < 4; v++) {
        const fade = v >= 2 ? 0.18 : 0.90;
        colors[(vBase + v) * 3] = cTmp.r * fade;
        colors[(vBase + v) * 3 + 1] = cTmp.g * fade;
        colors[(vBase + v) * 3 + 2] = cTmp.b * fade;
      }

      indices.push(vBase, vBase + 1, vBase + 2, vBase, vBase + 2, vBase + 3);
    }

    const rayGeo = new THREE.BufferGeometry();
    rayGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    rayGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    rayGeo.setIndex(indices);

    this.globuleRayMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.globuleRayMesh = new THREE.Mesh(rayGeo, this.globuleRayMat);
    this.globuleRayMesh.visible = false;
    this.globuleRayMesh.frustumCulled = false;
    this.globuleSwarmGroup.add(this.globuleRayMesh);
  }

  private disposeV16GlobuleSystem() {
    if (this.globuleSwarmGroup && this.scene) {
      this.scene.remove(this.globuleSwarmGroup);
    }
    this.globuleMaterials.forEach(m => m.dispose());
    this.globuleMaterials = [];
    this.globuleMeshes = [];
    if (this.globuleBaseGeo) {
      this.globuleBaseGeo.dispose();
      this.globuleBaseGeo = null;
    }
    if (this.globuleRayMesh) {
      this.globuleRayMesh.geometry.dispose();
      this.globuleRayMesh = null;
    }
    if (this.globuleRayMat) {
      this.globuleRayMat.dispose();
      this.globuleRayMat = null;
    }
    this.globuleSwarmGroup = null;
  }

  public resetV16Globules() {
    this.activeGlobuleCount = RemasteredEngine.V16_MIN_GLOBULES;
    this.lastGlobuleSpawnAt = performance.now();
    this.globuleRayPhase = 'IDLE';
    this.globuleRayProgress = 0;
    this.lastGlobuleRayAt = 0;

    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let k = 0; k < RemasteredEngine.V16_MAX_GLOBULES; k++) {
      const k3 = k * 3;
      const angle = k * golden;
      const dist = 85 + (k % 3) * 48 + Math.random() * 25;
      const y = ((k % 7) - 3) * 34 + (Math.random() - 0.5) * 24;
      this.globulePos[k3] = Math.cos(angle) * dist;
      this.globulePos[k3 + 1] = y;
      this.globulePos[k3 + 2] = Math.sin(angle) * dist * 0.75;

      this.globuleVel[k3] = (Math.random() - 0.5) * 1.4;
      this.globuleVel[k3 + 1] = (Math.random() - 0.5) * 1.4;
      this.globuleVel[k3 + 2] = (Math.random() - 0.5) * 1.4;

      const ax = Math.random() - 0.5;
      const ay = Math.random() - 0.5;
      const az = Math.random() - 0.5;
      const alen = Math.hypot(ax, ay, az) || 1;
      this.globuleRotAxis[k3] = ax / alen;
      this.globuleRotAxis[k3 + 1] = ay / alen;
      this.globuleRotAxis[k3 + 2] = az / alen;
      this.globuleSpinRate[k] = 0.18 + Math.random() * 0.35;

      const targetR = 46 + (k % 4) * 5.5;
      this.globuleTargetScale[k] = targetR;
      this.globuleScale[k] = k < this.activeGlobuleCount ? targetR : 0.1;
      this.globulePulse[k] = 0;
      this.globuleSeed[k] = Math.random();

      const mesh = this.globuleMeshes[k];
      if (mesh) {
        mesh.visible = k < this.activeGlobuleCount;
        mesh.position.set(this.globulePos[k3], this.globulePos[k3 + 1], this.globulePos[k3 + 2]);
        mesh.scale.setScalar(this.globuleScale[k]);
        mesh.rotation.set(Math.random() * 6.28, Math.random() * 6.28, Math.random() * 6.28);
      }
    }

    if (this.onGlobuleCountChange) {
      this.onGlobuleCountChange(this.activeGlobuleCount, RemasteredEngine.V16_MAX_GLOBULES);
    }
  }

  private triggerGlobuleImpact(impactX: number, impactY: number, impactZ: number, now: number) {
    if (this.currentV !== 'V16') return;
    // Trigger thin expanding-to-edge -> collapsing-to-center ray burst with clean cooldown
    if (this.globuleRayPhase === 'IDLE' || (this.globuleRayPhase === 'COLLAPSING' && now - this.lastGlobuleRayAt > 420)) {
      this.globuleRayPhase = 'EXPANDING';
      this.globuleRayProgress = Math.max(0.05, this.globuleRayProgress);
      this.lastGlobuleRayAt = now;
    }
    if (this.activeGlobuleCount >= RemasteredEngine.V16_MAX_GLOBULES) return;
    if (now - this.lastGlobuleSpawnAt < 230) return;

    const newIdx = this.activeGlobuleCount;
    const n3 = newIdx * 3;
    this.lastGlobuleSpawnAt = now;
    this.activeGlobuleCount++;

    const jitterX = (Math.random() - 0.5) * 32;
    const jitterY = (Math.random() - 0.5) * 32;
    const jitterZ = (Math.random() - 0.5) * 32;
    this.globulePos[n3] = THREE.MathUtils.clamp(impactX + jitterX, -320, 320);
    this.globulePos[n3 + 1] = THREE.MathUtils.clamp(impactY + jitterY, -320, 320);
    this.globulePos[n3 + 2] = THREE.MathUtils.clamp(impactZ + jitterZ, -320, 320);

    const outLen = Math.hypot(this.globulePos[n3], this.globulePos[n3 + 1], this.globulePos[n3 + 2]) || 1;
    this.globuleVel[n3] = (this.globulePos[n3] / outLen) * 2.1 + (Math.random() - 0.5) * 1.1;
    this.globuleVel[n3 + 1] = (this.globulePos[n3 + 1] / outLen) * 2.1 + (Math.random() - 0.5) * 1.1;
    this.globuleVel[n3 + 2] = (this.globulePos[n3 + 2] / outLen) * 2.1 + (Math.random() - 0.5) * 1.1;

    this.globuleScale[newIdx] = 6.0;
    this.globuleTargetScale[newIdx] = 38 + (newIdx % 5) * 4.5;
    this.globulePulse[newIdx] = 1.0;

    const mesh = this.globuleMeshes[newIdx];
    if (mesh) {
      mesh.visible = true;
      mesh.position.set(this.globulePos[n3], this.globulePos[n3 + 1], this.globulePos[n3 + 2]);
      mesh.scale.setScalar(this.globuleScale[newIdx]);
    }

    if (this.onGlobuleCountChange) {
      this.onGlobuleCountChange(this.activeGlobuleCount, RemasteredEngine.V16_MAX_GLOBULES);
    }
  }

  public allocSwarmBuffers(rawCount: number) {
    const count = isIPhoneOrIPadDevice ? Math.min(5000, rawCount) : Math.min(40000, rawCount);
    this.liveParams.particleCount = count;
    this.positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);
    this.homes = new Float32Array(count * 3);
    this.home4 = new Float32Array(count);
    this.colorShuffling = new Float32Array(count);
    this.spinAngles = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      this.colorShuffling[i] = Math.random();
      this.home4[i] = Math.cos(i * 0.6180339887) * 260;
      this.spinAngles[i * 3] = (Math.random() - 0.5) * 0.05;
      this.spinAngles[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
      this.spinAngles[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
    }
  }

  public setGeometryType(type: GeometryType) {
    this.currentGeoType = type;
    this.useCustomGeo = true;
    this.loadSwarm(this.currentV);
  }

  public setTiltForce(tiltX: number, tiltY: number) {
    this.tiltForceX = tiltX;
    this.tiltForceY = tiltY;
  }

  private buildGeometry(vId: string, s: number): THREE.BufferGeometry {
    const cfg = REMASTERED_VERSION_DATA[vId] || REMASTERED_VERSION_DATA["V1"];
    const baseSize = s || cfg.size;

    if (this.useCustomGeo) {
      if (this.currentGeoType === 'box') {
        return new THREE.BoxGeometry(baseSize * 1.5, baseSize * 1.5, baseSize * 1.5);
      } else if (this.currentGeoType === 'ico') {
        return new THREE.IcosahedronGeometry(baseSize, 0);
      } else if (this.currentGeoType === 'sphere') {
        return new THREE.SphereGeometry(baseSize, 8, 8);
      } else if (this.currentGeoType === 'octa') {
        return new THREE.OctahedronGeometry(baseSize, 0);
      }
    }

    // Default per version
    switch(cfg.geo) {
      case 'box': return new THREE.BoxGeometry(baseSize, baseSize, baseSize);
      case 'box_long': return new THREE.BoxGeometry(baseSize * 0.5, baseSize * 2.4, baseSize * 0.5);
      case 'icosahedron': return new THREE.IcosahedronGeometry(baseSize, 0);
      case 'cone': return new THREE.ConeGeometry(baseSize * 0.7, baseSize * 1.5, 6);
      case 'cone_inv': return new THREE.ConeGeometry(baseSize * 0.7, baseSize * 1.5, 6);
      case 'cylinder': return new THREE.CylinderGeometry(baseSize * 0.8, baseSize * 0.8, baseSize * 0.3, 8);
      case 'octahedron': return new THREE.OctahedronGeometry(baseSize, 0);
      case 'tetrahedron': return new THREE.TetrahedronGeometry(baseSize, 0);
      case 'dodecahedron': return new THREE.DodecahedronGeometry(baseSize, 0);
      case 'sphere_low': return new THREE.SphereGeometry(baseSize, 5, 4);
      default: return new THREE.SphereGeometry(baseSize, 8, 8);
    }
  }

  private buildMaterial(vId: string): THREE.Material {
    const cfg = REMASTERED_VERSION_DATA[vId] || REMASTERED_VERSION_DATA["V1"];
    const base = {
      transparent: cfg.opacity < 1.0,
      opacity: cfg.opacity,
      blending: cfg.additive ? THREE.AdditiveBlending : THREE.NormalBlending
    };

    const shininess = this.liveParams.particleShininess !== undefined ? this.liveParams.particleShininess : cfg.shininess;

    switch(cfg.mat) {
      case 'phong':
        return new THREE.MeshPhongMaterial({
          ...base,
          shininess: shininess,
          specular: 0x101010
        });
      case 'lambert':
        return new THREE.MeshLambertMaterial({ ...base });
      case 'standard':
        return new THREE.MeshStandardMaterial({
          ...base,
          metalness: cfg.metalness,
          roughness: cfg.roughness || 0.78
        });
      case 'physical':
        return new THREE.MeshPhysicalMaterial({
          ...base,
          metalness: cfg.metalness,
          roughness: 0.65,
          iridescence: 0.3,
          iridescenceIOR: 1.3
        });
      case 'toon':
        return new THREE.MeshToonMaterial({ ...base });
      case 'phong_dark':
        return new THREE.MeshPhongMaterial({ ...base, shininess: 18, specular: 0x0c0c0c });
      default:
        return new THREE.MeshPhongMaterial({ ...base, shininess: shininess, specular: 0x101010 });
    }
  }

  public applySunLights() {
    const hue = this.liveParams.sunHue || 'WHITE';
    const sunColor =
      hue === 'GOLD' ? 0xffcc66 :
      hue === 'CYAN' ? 0x66eeff :
      hue === 'VIOLET' ? 0xcc88ff :
      0xffffff;

    if (this.staticSun) {
      this.staticSun.position.set(this.liveParams.sunX, this.liveParams.sunY, this.liveParams.sunZ);
      this.staticSun.intensity = this.liveParams.sunIntensity;
      this.staticSun.color.setHex(sunColor);
    }
    if (this.secondarySun) {
      this.secondarySun.intensity = this.liveParams.secondarySunIntensity ?? 2.9;
      this.secondarySun.color.setHex(sunColor);
    }
    if (this.ambientLight) {
      this.ambientLight.intensity = this.liveParams.ambientIntensity;
    }
  }

  public loadSwarm(vId: string) {
    if (!this.scene) return;
    if (this.instancedMesh) {
      this.scene.remove(this.instancedMesh);
      this.instancedMesh.geometry.dispose();
      if (Array.isArray(this.instancedMesh.material)) {
        this.instancedMesh.material.forEach(m => m.dispose());
      } else {
        this.instancedMesh.material.dispose();
      }
    }

    this.currentV = vId;
    globalPiano.setGlobulePresetActive(vId === 'V16');
    if (this.onVersionChange) this.onVersionChange(vId);
    const cfg = REMASTERED_VERSION_DATA[vId] || REMASTERED_VERSION_DATA["V1"];
    const count = this.liveParams.particleCount;

    this.instancedMesh = new THREE.InstancedMesh(
      this.buildGeometry(vId, this.liveParams.pSize),
      this.buildMaterial(vId),
      count
    );
    this.velocities.fill(0);

    const phi = Math.PI * (3 - Math.sqrt(5));
    const TAU = Math.PI * 2;

    for (let i = 0; i < count; i++) {
      let x = 0, y = 0, z = 0;
      const i3 = i * 3;

      if (cfg.form === 'BOX') {
        x = (Math.random() - 0.5) * 620;
        y = (Math.random() - 0.5) * 620;
        z = (Math.random() - 0.5) * 620;
      } else if (cfg.form === 'TORUS') {
        const rad = 280, tube = 75, a = Math.random() * Math.PI * 2, b = Math.random() * Math.PI * 2;
        x = (rad + tube * Math.cos(b)) * Math.cos(a);
        y = (rad + tube * Math.cos(b)) * Math.sin(a);
        z = tube * Math.sin(b);
      } else if (cfg.form === 'PLANE') {
        x = (Math.random() - 0.5) * 900;
        y = (Math.random() - 0.5) * 900;
        z = (Math.random() - 0.5) * 40;
      } else if (cfg.form === 'CYLINDER') {
        const r = 240, ang = Math.random() * Math.PI * 2;
        x = Math.cos(ang) * r;
        y = (Math.random() - 0.5) * 750;
        z = Math.sin(ang) * r;
      } else if (cfg.form === 'STAR') {
        const rad = Math.pow(Math.random(), 0.5) * 450;
        const arms = 6;
        const armAng = (Math.floor(Math.random() * arms) * (Math.PI * 2 / arms));
        const theta = armAng + (Math.random() - 0.5) * 0.4;
        x = Math.cos(theta) * rad;
        y = Math.sin(theta) * rad;
        z = (Math.random() - 0.5) * 80;
      } else if (cfg.form === 'FILAMENT') {
        // V15 FILAMENTI: 12 intertwined 3D sinusoidal plasma strands
        const s = i % 12;
        const t = (Math.random() - 0.5) * 840;
        const ang = s * (TAU / 12);
        const rad = 95 + (s % 3) * 70;
        const ph = t * 0.011 + s * 0.9;
        x = Math.cos(ang + ph * 0.35) * rad + Math.sin(ph) * 48 + (Math.random() - 0.5) * 10;
        y = t + (Math.random() - 0.5) * 10;
        z = Math.sin(ang + ph * 0.35) * rad + Math.cos(ph * 1.3) * 48 + (Math.random() - 0.5) * 10;
      } else if (cfg.form === 'GLOBULE') {
        // V16 GLOBULI: internal vortex micro-particles orbiting inside each active rainbow globule
        const k = i % RemasteredEngine.V16_MIN_GLOBULES;
        const k3 = k * 3;
        const cx = this.globulePos[k3] || 0;
        const cy = this.globulePos[k3 + 1] || 0;
        const cz = this.globulePos[k3 + 2] || 0;
        const u = Math.random();
        const v = Math.random();
        const th = u * TAU;
        const ph = Math.acos(2 * v - 1);
        const lr = Math.cbrt(Math.random()) * 28;
        x = cx + lr * Math.sin(ph) * Math.cos(th);
        y = cy + lr * Math.sin(ph) * Math.sin(th);
        z = cz + lr * Math.cos(ph);
      } else {
        const yy = 1 - (i / (count - 1)) * 2;
        const rAtY = Math.sqrt(Math.max(0, 1 - yy * yy)), theta = phi * i;
        const rad = 320;
        x = Math.cos(theta) * rad * rAtY;
        y = yy * rad;
        z = Math.sin(theta) * rad * rAtY;
      }

      this.homes[i3] = x;
      this.homes[i3 + 1] = y;
      this.homes[i3 + 2] = z;

      this.positions[i3] = x;
      this.positions[i3 + 1] = y;
      this.positions[i3 + 2] = z;

      this.dummy.position.set(x, y, z);
      this.dummy.rotation.set(0, 0, 0);
      this.dummy.scale.setScalar(this.liveParams.pSize);
      this.dummy.updateMatrix();
      this.instancedMesh.setMatrixAt(i, this.dummy.matrix);

      // Chromatic lumina initialization
      const lumina = (0.52 + (cfg.luminaMultiplier || 1.0) * 0.1);
      this.tempColor.setHSL((this.colorShuffling[i]) % 1, 1.0, Math.min(0.85, lumina));
      this.instancedMesh.setColorAt(i, this.tempColor);
    }

    if (this.globuleSwarmGroup) {
      this.globuleSwarmGroup.visible = vId === 'V16';
      this.globuleSwarmGroup.rotation.set(0, 0, 0);
    }
    this.instancedMesh.visible = vId !== 'V16';
    if (vId === 'V16') {
      this.resetV16Globules();
      this.instancedMesh.rotation.set(0, 0, 0);
      if (this.trailLines) this.trailLines.visible = false;
    } else {
      this.resetTrailHistory();
      if (this.onGlobuleCountChange) {
        this.onGlobuleCountChange(0, RemasteredEngine.V16_MAX_GLOBULES);
      }
    }

    if (this.ambientLight) {
      this.ambientLight.color.set(cfg.ambientColor);
    }
    this.applySunLights();
    this.scene.add(this.instancedMesh);
  }

  public setHandTarget(x: number, y: number, isClosed: boolean, isPresent: boolean) {
    this.targetHandPos.set(x, y, 0);
    this.isHandClosed = isClosed;
    this.isHandPresent = isPresent;
  }

  public setZoom(zoom: number) {
    this.liveParams.zoom = zoom;
    if (this.camera) {
      this.camera.position.z = zoom;
    }
  }

  public updateShininess(shininess: number) {
    this.liveParams.particleShininess = shininess;
    if (this.instancedMesh && this.instancedMesh.material) {
      const mat = this.instancedMesh.material;
      if (!Array.isArray(mat) && 'shininess' in mat) {
        (mat as THREE.MeshPhongMaterial).shininess = shininess;
        mat.needsUpdate = true;
      }
    }
  }

  public async startMicrophone(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn("RemasteredEngine: microphone API not available");
        this.isMicActive = false;
        return false;
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
      } catch (e1) {
        console.warn("RemasteredEngine: Enhanced mic constraint failed, falling back to basic audio: true", e1);
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      this.micStream = stream;
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.micAudioCtx = new AudioCtxClass();

      // Modern browsers start AudioContext in suspended state when initialized inside async promise
      if (this.micAudioCtx.state === 'suspended') {
        await this.micAudioCtx.resume();
      }

      this.micAnalyser = this.micAudioCtx.createAnalyser();
      this.micAnalyser.fftSize = 256;
      this.micAnalyser.smoothingTimeConstant = 0.5;

      const source = this.micAudioCtx.createMediaStreamSource(this.micStream);
      source.connect(this.micAnalyser);
      this.micDataArray = new Uint8Array(this.micAnalyser.frequencyBinCount);
      this.isMicActive = true;
      return true;
    } catch (e) {
      console.warn("RemasteredEngine: microphone failed", e);
      this.isMicActive = false;
      return false;
    }
  }

  public stopMicrophone() {
    this.isMicActive = false;
    if (this.micStream) {
      this.micStream.getTracks().forEach(t => t.stop());
      this.micStream = null;
    }
    if (this.micAudioCtx) {
      this.micAudioCtx.close().catch(() => {});
      this.micAudioCtx = null;
    }
    this.micAnalyser = null;
    this.micDataArray = null;
  }

  private bindWindowEvents() {
    window.addEventListener('resize', this.onResize);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('wheel', this.onWheel, { passive: true });
    window.addEventListener('touchstart', this.onTouchStart, { passive: false });
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onTouchEnd);
  }

  private unbindWindowEvents() {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
  }

  private onResize = () => {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private onMouseDown = (e: MouseEvent) => {
    if ((e.target as HTMLElement)?.closest('#nebula-ui, #top-bar, #console-panel, #pip-container, .modal-card, button, input')) return;
    this.isMouseDown = true;
    this.updatePointerCoords(e.clientX, e.clientY);
    if (this.currentV === 'V16') {
      this.triggerGlobuleImpact(this.mousePos.x * 0.45, this.mousePos.y * 0.45, (Math.random() - 0.5) * 90, performance.now());
    }
    if (this.liveParams.trigClick && this.liveParams.audioMode !== 'OFF') {
      const normY = e.clientY / window.innerHeight;
      const idx = Math.min(14, Math.max(0, Math.floor((1 - normY) * 15)));
      globalPiano.playNote([130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00][idx], 0.85);
    }
  };

  private onMouseMove = (e: MouseEvent) => {
    this.hasPointerMoved = true;
    this.updatePointerCoords(e.clientX, e.clientY);
  };

  private onMouseUp = () => {
    this.isMouseDown = false;
  };

  private onWheel = (e: WheelEvent) => {
    if (!this.camera) return;
    this.camera.position.z = Math.max(200, Math.min(4000, this.camera.position.z + e.deltaY * 0.8));
    this.liveParams.zoom = this.camera.position.z;
  };

  private initialPinchDist: number | null = null;
  private initialZoom = 1322;

  private onTouchStart = (e: TouchEvent) => {
    if ((e.target as HTMLElement)?.closest('#nebula-ui, #top-bar, #console-panel, #pip-container, #nebula-control-drawer, #dock-wrapper, .modal-card, button, input, select')) return;
    globalPiano.resume();
    if (e.touches.length === 1) {
      this.isMouseDown = true;
      const t = e.touches[0];
      this.updatePointerCoords(t.clientX, t.clientY);
      if (this.currentV === 'V16') {
        this.triggerGlobuleImpact(this.mousePos.x * 0.45, this.mousePos.y * 0.45, (Math.random() - 0.5) * 90, performance.now());
      }
      if (this.liveParams.trigClick && this.liveParams.audioMode !== 'OFF') {
        const normY = t.clientY / window.innerHeight;
        const idx = Math.min(14, Math.max(0, Math.floor((1 - normY) * 15)));
        globalPiano.playNote([130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00][idx], 0.85);
      }
    } else if (e.touches.length === 2 && this.camera) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      this.initialPinchDist = Math.hypot(dx, dy);
      this.initialZoom = this.camera.position.z;
    }
  };

  private onTouchMove = (e: TouchEvent) => {
    if ((e.target as HTMLElement)?.closest('#nebula-ui, #top-bar, #console-panel, #pip-container, #nebula-control-drawer, #dock-wrapper, .modal-card, button, input, select')) return;
    if (e.touches.length === 1 && this.isMouseDown) {
      e.preventDefault();
      this.updatePointerCoords(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2 && this.initialPinchDist && this.camera) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (dist > 0) {
        this.camera.position.z = Math.max(200, Math.min(4000, this.initialZoom * (this.initialPinchDist / dist)));
        this.liveParams.zoom = this.camera.position.z;
      }
    }
  };

  private onTouchEnd = (e: TouchEvent) => {
    if (e.touches.length === 0) {
      this.isMouseDown = false;
      this.initialPinchDist = null;
    }
  };

  private updatePointerCoords(clientX: number, clientY: number) {
    const aspect = window.innerWidth / window.innerHeight;
    const nx = (clientX / window.innerWidth) - 0.5;
    const ny = (clientY / window.innerHeight) - 0.5;
    this.mousePos.set(nx * 1050 * aspect, -ny * 900, 0);

    // If webcam is off or in fallback, track as virtual hand
    if (!this.isHandPresent) {
      this.targetHandPos.copy(this.mousePos);
      globalPiano.updateFromCoordinates(clientX / window.innerWidth, clientY / window.innerHeight, this.isMouseDown, {
        trigGesture: this.liveParams.trigGesture,
        trigPinch: this.liveParams.trigPinch
      });
    }
  }

  private animate = (now = performance.now()) => {
    if (!this.isRunning) return;
    this.animId = requestAnimationFrame(this.animate);

    const dt = Math.min((now - this.lastTime) * 0.001, 0.05);
    this.lastTime = now;
    const time = now * 0.001;

    this.fpsFrames++;
    if (!this.fpsLastAt) this.fpsLastAt = now;
    if (now - this.fpsLastAt >= 500) {
      const currentFps = Math.max(1, Math.round((this.fpsFrames * 1000) / (now - this.fpsLastAt)));
      this.fpsFrames = 0;
      this.fpsLastAt = now;
      if (this.onFpsUpdate) this.onFpsUpdate(currentFps);
    }

    // Sync Lead Trance V16 parameters
    if (this.liveParams.globuleLeadOn !== undefined) {
      globalPiano.isGlobuleLeadOn = this.liveParams.globuleLeadOn;
    }
    if (this.liveParams.globuleLeadLevel !== undefined) {
      globalPiano.setGlobuleLeadLevel(this.liveParams.globuleLeadLevel);
    }
    if (this.liveParams.globuleLeadBpm !== undefined) {
      globalPiano.setGlobuleLeadBpm(this.liveParams.globuleLeadBpm);
    }

    // Cycle check
    if (this.cycleActive && (time - this.lastCycleSwitch > this.liveParams.cycleTime)) {
      this.loadSwarm(REMASTERED_KEYS[(REMASTERED_KEYS.indexOf(this.currentV) + 1) % REMASTERED_KEYS.length]);
      this.lastCycleSwitch = time;
    }

    // Camera zoom real-time sync with zoom slider
    if (this.camera && Math.abs(this.camera.position.z - this.liveParams.zoom) > 0.5) {
      this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, this.liveParams.zoom, 0.15);
    }

    // BPM Arpeggio (isolated off when Lead Trance V16 is active)
    if (!globalPiano.isGlobuleLeadIsolated() && this.liveParams.trigBpm && this.liveParams.audioMode !== 'OFF' && (now - this.lastBpmTime > this.liveParams.triggerRateMs * 2)) {
      const idx = Math.floor((time * 2.5) % 15);
      globalPiano.playNote([130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00][idx], 0.65);
      this.lastBpmTime = now;
    }

    // Microphone FFT Analysis
    if (this.isMicActive && this.micAnalyser && this.micDataArray) {
      this.micAnalyser.getByteFrequencyData(this.micDataArray as unknown as Uint8Array<ArrayBuffer>);
      let sum = 0, peak = 0, maxBin = 0, maxVal = 0;
      for (let i = 0; i < this.micDataArray.length; i++) {
        const val = this.micDataArray[i];
        sum += val;
        if (val > peak) peak = val;
        if (i > 1 && i < this.micDataArray.length / 2 && val > maxVal) {
          maxVal = val;
          maxBin = i;
        }
      }
      const avg = (sum / this.micDataArray.length) / 255;
      const normPeak = peak / 255;

      const instantBoost = Math.max(0, (avg - this.liveParams.audioThreshold) * 10.0 * this.liveParams.audioPower);
      this.audioBoost = THREE.MathUtils.lerp(this.audioBoost, instantBoost, 0.25);
      this.audioEnergy = Math.max(this.audioEnergy, normPeak);

      // Sonic blast wave on vocal trigger
      if (normPeak > Math.max(0.18, this.liveParams.audioThreshold) && (now - this.lastMicTriggerTime > 140)) {
        this.lastMicTriggerTime = now;
        if (this.currentV === 'V16') {
          this.triggerGlobuleImpact((Math.random() - 0.5) * 180, (Math.random() - 0.5) * 180, (Math.random() - 0.5) * 180, now);
        }
        if (!globalPiano.isGlobuleLeadIsolated() && this.liveParams.audioMode !== 'OFF') {
          const freqs = [130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
          const noteIdx = maxBin % freqs.length;
          globalPiano.playNote(freqs[noteIdx], Math.min(1.0, 0.45 + normPeak * 0.55));
        }

        const blastPower = (normPeak - 0.15) * 14.0 * this.liveParams.audioPower;
        const count = this.liveParams.particleCount;
        const burstCount = Math.min(count, 3000);
        for (let k = 0; k < burstCount; k++) {
          const pIdx = ((Math.random() * count) | 0) * 3;
          const px = this.positions[pIdx], py = this.positions[pIdx + 1], pz = this.positions[pIdx + 2];
          const dist = Math.hypot(px, py, pz) || 1;
          this.velocities[pIdx] += (px / dist) * blastPower * (0.8 + Math.random() * 0.4);
          this.velocities[pIdx + 1] += (py / dist) * blastPower * (0.8 + Math.random() * 0.4);
          this.velocities[pIdx + 2] += (pz / dist) * blastPower * (0.8 + Math.random() * 0.4);
        }
      }
    } else {
      this.audioBoost = THREE.MathUtils.lerp(this.audioBoost, 0, 0.1);
    }

    this.audioEnergy = Math.max(0, this.audioEnergy - dt * 1.5);
    const pianoEnergy = globalPiano.getEnergyLevel();
    const effectiveBoost = Math.max(this.audioBoost, pianoEnergy * this.liveParams.audioPower);

    const hueSpeedMult = this.liveParams.hueRotationSpeed !== undefined ? this.liveParams.hueRotationSpeed : 1.0;
    const audioSymphonyBoost = (effectiveBoost + this.audioEnergy) * 0.85 * hueSpeedMult;
    this.colorOffset += dt * (0.15 + audioSymphonyBoost * 0.4);
    this.spectraColorOffset += dt * (0.23 + audioSymphonyBoost * 0.5);
    const hueW = this.colorOffset % 1;
    const hueS = this.spectraColorOffset % 1;

    const ringsEnabled = this.liveParams.ringsOn !== false;
    const ringSpd = this.liveParams.ringSpeed ?? 0.7;
    this.wanderRingAlpha.visible = ringsEnabled;
    this.wanderRingBeta.visible = ringsEnabled;
    this.spectraRingAlpha.visible = ringsEnabled;
    this.spectraRingBeta.visible = ringsEnabled;

    (this.wanderRingAlpha.material as THREE.MeshPhongMaterial).emissive.setHSL(hueW, 1.0, 0.5);
    (this.wanderRingBeta.material as THREE.MeshPhongMaterial).emissive.setHSL((hueW + 0.25) % 1, 1.0, 0.5);
    this.wanderRingAlpha.rotation.z += dt * 3.0 * ringSpd;
    this.wanderRingBeta.rotation.x += dt * 2.5 * ringSpd;

    (this.spectraRingAlpha.material as THREE.MeshPhongMaterial).emissive.setHSL((hueS + 0.33) % 1, 1.0, 0.5);
    (this.spectraRingBeta.material as THREE.MeshPhongMaterial).emissive.setHSL((hueS + 0.66) % 1, 1.0, 0.5);
    this.spectraRingAlpha.rotation.x += dt * 2.8 * ringSpd;
    this.spectraRingBeta.rotation.z += dt * 2.0 * ringSpd;
    (this.spectraMesh.material as THREE.MeshPhongMaterial).emissive.setHSL(hueS, 1.0, 0.5);

    const spectraScale = 1.0 + effectiveBoost * 0.4;
    this.spectraRingAlpha.scale.setScalar(spectraScale);
    this.spectraRingBeta.scale.setScalar(spectraScale);

    const tW = time * (this.liveParams.wanderOrbit ?? 0.7);
    this.wanderer.position.set(
      Math.cos(tW * 0.8) * 650,
      Math.sin(tW * 0.6) * 500,
      Math.sin(tW * 1.0) * 450
    );
    this.wanderLight.position.copy(this.wanderer.position);
    this.wanderLight.color.setHSL(hueW, 1, 0.5);

    // Smooth 3D Spatial Audio Panning following Wanderer without dead spot
    globalPiano.updateSpatialPan(this.wanderer.position.x);

    const tS = time * (this.liveParams.spectraOrbit ?? 0.7);
    this.spectraGroup.position.set(
      Math.cos(tS) * 550,
      Math.sin(tS * 0.73) * 450,
      Math.sin(tS * 1.17) * 400
    );
    this.spectraLight.position.copy(this.spectraGroup.position);
    this.spectraLight.color.setHSL(hueS, 1, 0.5);

    const audioBump = effectiveBoost * this.liveParams.audioPower;
    this.wanderLight.intensity = 600 + audioBump * 1500;
    this.spectraLight.intensity = (this.liveParams.pLumina * 25) + audioBump * 1500;

    // Update Evident 3D Ring Cursor (Wanderer/Spectra style)
    if (this.cursorGroup && this.cursorCore && this.cursorRingAlpha && this.cursorRingBeta) {
      const showCursor = (this.liveParams.cursorRingOn ?? true) && (this.hasPointerMoved || this.isMouseDown || this.isHandPresent);
      this.cursorGroup.visible = showCursor;
      if (showCursor) {
        const targetPos = this.isHandPresent ? this.targetHandPos : this.mousePos;
        this.cursorGroup.position.lerp(targetPos, 0.45);
        const isRepel = this.liveParams.touchMode === 'REPEL';
        const c1 = isRepel ? 0xff0055 : 0x00e5ff;
        const c2 = isRepel ? 0xffaa00 : 0x00ff88;
        (this.cursorCore.material as THREE.MeshBasicMaterial).color.setHex(c2);
        (this.cursorRingAlpha.material as THREE.MeshBasicMaterial).color.setHex(c1);
        (this.cursorRingBeta.material as THREE.MeshBasicMaterial).color.setHex(c2);
        this.cursorRingAlpha.rotation.z += dt * 3.8;
        this.cursorRingAlpha.rotation.x += dt * 1.4;
        this.cursorRingBeta.rotation.x -= dt * 3.1;
        this.cursorRingBeta.rotation.y += dt * 2.2;
        const pulseScale = (this.isMouseDown || this.isHandPresent) ? (1.35 + Math.sin(time * 8.0) * 0.14) : (0.95 + Math.sin(time * 3.5) * 0.06);
        this.cursorGroup.scale.setScalar(pulseScale);
      }
    }

    if (!this.renderer || !this.fadeScene || !this.fadeCamera || !this.fadeMat || !this.scene || !this.camera) return;

    const isGlobuleNow = this.currentV === 'V16';
    this.renderer.autoClear = true;

    const autoRotOn = this.liveParams.isAutoRotationOn !== false;
    const rx = autoRotOn ? (this.liveParams.rotX ?? -0.1) * dt : 0;
    const ry = autoRotOn ? (this.liveParams.rotY ?? 0.1) * dt : 0;
    const rz = autoRotOn ? (this.liveParams.rotZ ?? -0.1) * dt : 0;

    if (autoRotOn) {
      this.ang4.xw += (this.liveParams.rot4dXW ?? 0.1) * dt * 0.5;
      this.ang4.yw += (this.liveParams.rot4dYW ?? -0.1) * dt * 0.5;
      this.ang4.zw += (this.liveParams.rot4dZW ?? 0.1) * dt * 0.5;
    }

    if (this.instancedMesh) {
      this.instancedMesh.visible = !isGlobuleNow;
      if (!isGlobuleNow) {
        this.instancedMesh.rotation.x += rx;
        this.instancedMesh.rotation.y += ry;
        this.instancedMesh.rotation.z += rz;
      }

      const count = this.liveParams.particleCount;

      // V16 GLOBULI: Pure iridescent globules (NO particles, NO particle trails)
      if (isGlobuleNow && this.globuleSwarmGroup) {
        this.globuleSwarmGroup.visible = true;
        this.globuleSwarmGroup.rotation.x += rx * 0.55;
        this.globuleSwarmGroup.rotation.y += ry * 0.55;
        this.globuleSwarmGroup.rotation.z += rz * 0.55;

        const gCount = this.activeGlobuleCount;
        const globuleUserSat = this.liveParams.particleSaturation !== undefined ? this.liveParams.particleSaturation : 0.95;
        const globuleUserBri = this.liveParams.particleBrightness !== undefined ? this.liveParams.particleBrightness : 0.48;
        const clusterTarget = gCount <= 12 ? 0.0020 : 0.0034;
        const wanderForceSigned = this.liveParams.wanderForce ?? 1.0;
        const spectraForceSigned = this.liveParams.spectraForce ?? 1.0;
        const inflMult = this.liveParams.globuleInfluenceMult ?? 2.2;
        const ringSwarmBoost = ringsEnabled ? (0.45 + (this.liveParams.ringSwarm ?? 2.0) * 0.45) : 0.25;
        const cXW4 = Math.cos(this.ang4.xw), sXW4 = Math.sin(this.ang4.xw);
        const cYW4 = Math.cos(this.ang4.yw), sYW4 = Math.sin(this.ang4.yw);

        let sphereProximitySum = 0;

        for (let k = 0; k < gCount; k++) {
          const k3 = k * 3;
          const gx = this.globulePos[k3];
          const gy = this.globulePos[k3 + 1];
          const gz = this.globulePos[k3 + 2];

          // Coordinated cluster cohesion + 4D subtle warp drift
          const w4 = Math.sin(k * 1.15 + time * 0.4) * 140;
          const warpX = (gx * (cXW4 - 1) - w4 * sXW4) * 0.0022;
          const warpY = (gy * (cYW4 - 1) - w4 * sYW4) * 0.0022;
          this.globuleVel[k3] += -gx * clusterTarget - gz * 0.0014 + warpX + this.tiltForceX * 0.35;
          this.globuleVel[k3 + 1] += -gy * clusterTarget + Math.sin(time * 0.75 + k * 0.6) * 0.025 + warpY + this.tiltForceY * 0.35;
          this.globuleVel[k3 + 2] += -gz * clusterTarget + gx * 0.0014;

          // Wanderer + Rings boosted influence + directional separation
          const dxW = gx - this.wanderer.position.x;
          const dyW = gy - this.wanderer.position.y;
          const dzW = gz - this.wanderer.position.z;
          const distW = Math.hypot(dxW, dyW, dzW) || 1;
          if (distW < 620) {
            const proxW = 1 - distW / 620;
            sphereProximitySum += proxW;
            const push = proxW * 0.78 * inflMult * Math.sign(wanderForceSigned || 1) * Math.min(2.5, Math.abs(wanderForceSigned) || 1);
            this.globuleVel[k3] += (dxW / distW) * push + (-dyW / distW) * proxW * ringSwarmBoost * 0.55;
            this.globuleVel[k3 + 1] += (dyW / distW) * push + (dxW / distW) * proxW * ringSwarmBoost * 0.55;
            this.globuleVel[k3 + 2] += (dzW / distW) * push;

            if (distW < 380) {
              for (let j = 0; j < gCount; j++) {
                if (j === k) continue;
                const j3 = j * 3;
                const sdx = gx - this.globulePos[j3];
                const sdy = gy - this.globulePos[j3 + 1];
                const sdz = gz - this.globulePos[j3 + 2];
                const sDist = Math.hypot(sdx, sdy, sdz) || 1;
                if (sDist < 280) {
                  const sepImpulse = (1 - sDist / 280) * proxW * 0.45 * Math.min(2.0, inflMult * 0.55);
                  this.globuleVel[k3] += (sdx / sDist) * sepImpulse;
                  this.globuleVel[k3 + 1] += (sdy / sDist) * sepImpulse;
                  this.globuleVel[k3 + 2] += (sdz / sDist) * sepImpulse;
                }
              }
            }
            if (distW < 200) {
              this.globulePulse[k] = 1.0;
              this.triggerGlobuleImpact(gx, gy, gz, now);
            }
          }

          // Spectra + Rings boosted influence + directional separation
          const dxS = gx - this.spectraGroup.position.x;
          const dyS = gy - this.spectraGroup.position.y;
          const dzS = gz - this.spectraGroup.position.z;
          const distS = Math.hypot(dxS, dyS, dzS) || 1;
          if (distS < 640) {
            const proxS = 1 - distS / 640;
            sphereProximitySum += proxS;
            const dirS = spectraForceSigned >= 0 ? 1 : -1;
            const forceS = proxS * 0.72 * inflMult * dirS * Math.min(2.5, Math.abs(spectraForceSigned) || 1);
            this.globuleVel[k3] += (dxS / distS) * forceS + (dyS / distS) * proxS * ringSwarmBoost * 0.55;
            this.globuleVel[k3 + 1] += (dyS / distS) * forceS + (-dxS / distS) * proxS * ringSwarmBoost * 0.55;
            this.globuleVel[k3 + 2] += (dzS / distS) * forceS;

            if (distS < 380) {
              for (let j = 0; j < gCount; j++) {
                if (j === k) continue;
                const j3 = j * 3;
                const sdx = gx - this.globulePos[j3];
                const sdy = gy - this.globulePos[j3 + 1];
                const sdz = gz - this.globulePos[j3 + 2];
                const sDist = Math.hypot(sdx, sdy, sdz) || 1;
                if (sDist < 280) {
                  const sepImpulse = (1 - sDist / 280) * proxS * 0.45 * Math.min(2.0, inflMult * 0.55);
                  this.globuleVel[k3] += (sdx / sDist) * sepImpulse;
                  this.globuleVel[k3 + 1] += (sdy / sDist) * sepImpulse;
                  this.globuleVel[k3 + 2] += (sdz / sDist) * sepImpulse;
                }
              }
            }
            if (distS < 200) {
              this.globulePulse[k] = 1.0;
              this.triggerGlobuleImpact(gx, gy, gz, now);
            }
          }

          // Pointer or Hand boosted impact on individual globules
          if (this.isMouseDown || this.isHandPresent || this.hasPointerMoved) {
            const ix = this.isHandPresent ? this.targetHandPos.x : this.mousePos.x;
            const iy = this.isHandPresent ? this.targetHandPos.y : this.mousePos.y;
            const iz = this.isHandPresent ? this.targetHandPos.z : 0;
            const dxI = ix - gx;
            const dyI = iy - gy;
            const dzI = iz - gz;
            const distI = Math.hypot(dxI, dyI, dzI) || 1;
            const rangeI = (this.isMouseDown || this.isHandPresent) ? 460 : 280;
            if (distI < rangeI) {
              const sgn = this.liveParams.touchMode === 'REPEL' ? -1.25 : 1.0;
              const activeBoost = (this.isMouseDown || this.isHandPresent) ? 1.0 : 0.35;
              const fI = (1 - distI / rangeI) * 1.45 * inflMult * activeBoost * sgn;
              this.globuleVel[k3] += (dxI / distI) * fI;
              this.globuleVel[k3 + 1] += (dyI / distI) * fI;
              this.globuleVel[k3 + 2] += (dzI / distI) * fI;
              if ((this.isMouseDown || this.isHandPresent) && distI < 160) {
                this.globulePulse[k] = 1.0;
                this.triggerGlobuleImpact(gx, gy, gz, now);
              }
            }
          }
        }

        // Pairwise globule-to-globule soft collision detection & elastic bounce
        for (let a = 0; a < gCount; a++) {
          const a3 = a * 3;
          for (let b = a + 1; b < gCount; b++) {
            const b3 = b * 3;
            const dx = this.globulePos[b3] - this.globulePos[a3];
            const dy = this.globulePos[b3 + 1] - this.globulePos[a3 + 1];
            const dz = this.globulePos[b3 + 2] - this.globulePos[a3 + 2];
            const dist = Math.hypot(dx, dy, dz) || 0.001;
            const minDist = (this.globuleScale[a] + this.globuleScale[b]) * 1.04;
            if (dist < minDist) {
              const overlap = (minDist - dist) * 0.065;
              const nx = dx / dist;
              const ny = dy / dist;
              const nz = dz / dist;
              this.globuleVel[a3] -= nx * overlap;
              this.globuleVel[a3 + 1] -= ny * overlap;
              this.globuleVel[a3 + 2] -= nz * overlap;
              this.globuleVel[b3] += nx * overlap;
              this.globuleVel[b3 + 1] += ny * overlap;
              this.globuleVel[b3 + 2] += nz * overlap;

              const relSpeed = Math.abs(
                (this.globuleVel[b3] - this.globuleVel[a3]) * nx +
                (this.globuleVel[b3 + 1] - this.globuleVel[a3 + 1]) * ny +
                (this.globuleVel[b3 + 2] - this.globuleVel[a3 + 2]) * nz
              );
              if (relSpeed > 1.1) {
                this.globulePulse[a] = Math.max(this.globulePulse[a], 0.85);
                this.globulePulse[b] = Math.max(this.globulePulse[b], 0.85);
                this.triggerGlobuleImpact(
                  (this.globulePos[a3] + this.globulePos[b3]) * 0.5,
                  (this.globulePos[a3 + 1] + this.globulePos[b3 + 1]) * 0.5,
                  (this.globulePos[a3 + 2] + this.globulePos[b3 + 2]) * 0.5,
                  now
                );
              }
            }
          }
        }

        // Update active globules with calibrated damping, compute swarm centroid
        let cxSum = 0, cySum = 0, czSum = 0;
        const velCap = 4.6 + Math.max(0, inflMult - 1.0) * 1.1;
        for (let k = 0; k < gCount; k++) {
          const k3 = k * 3;
          this.globuleVel[k3] *= 0.942;
          this.globuleVel[k3 + 1] *= 0.942;
          this.globuleVel[k3 + 2] *= 0.942;

          const spd = Math.hypot(this.globuleVel[k3], this.globuleVel[k3 + 1], this.globuleVel[k3 + 2]);
          if (spd > velCap) {
            const cap = velCap / spd;
            this.globuleVel[k3] *= cap;
            this.globuleVel[k3 + 1] *= cap;
            this.globuleVel[k3 + 2] *= cap;
          }

          this.globulePos[k3] += this.globuleVel[k3];
          this.globulePos[k3 + 1] += this.globuleVel[k3 + 1];
          this.globulePos[k3 + 2] += this.globuleVel[k3 + 2];

          cxSum += this.globulePos[k3];
          cySum += this.globulePos[k3 + 1];
          czSum += this.globulePos[k3 + 2];

          this.globuleScale[k] = THREE.MathUtils.lerp(
            this.globuleScale[k],
            this.globuleTargetScale[k] * (1 + effectiveBoost * 0.14),
            0.10
          );
          this.globulePulse[k] = Math.max(0, this.globulePulse[k] - dt * 2.4);

          const mesh = this.globuleMeshes[k];
          if (mesh) {
            mesh.visible = true;
            mesh.position.set(this.globulePos[k3], this.globulePos[k3 + 1], this.globulePos[k3 + 2]);
            mesh.scale.setScalar(this.globuleScale[k]);
            const pSpinVal = this.liveParams.pSpin ?? 0;
            if (pSpinVal > 0.001) {
              const rRate = this.globuleSpinRate[k] * dt * pSpinVal * 0.9;
              mesh.rotation.x += this.globuleRotAxis[k3] * rRate;
              mesh.rotation.y += this.globuleRotAxis[k3 + 1] * rRate;
              mesh.rotation.z += this.globuleRotAxis[k3 + 2] * rRate;
            }
          }

          const mat = this.globuleMaterials[k];
          if (mat) {
            mat.uniforms.uTime.value = time * 0.42;
            mat.uniforms.uHueShift.value = this.colorOffset;
            mat.uniforms.uPulse.value = Math.max(this.globulePulse[k], effectiveBoost * 0.5);
            mat.uniforms.uSaturation.value = globuleUserSat;
            mat.uniforms.uBrightness.value = globuleUserBri;
          }
        }

        if (gCount > 0) {
          this.globuleCentroid.set(cxSum / gCount, cySum / gCount, czSum / gCount);
        } else {
          this.globuleCentroid.set(0, 0, 0);
        }

        if (effectiveBoost > 0.55) {
          this.triggerGlobuleImpact(this.globuleCentroid.x, this.globuleCentroid.y, this.globuleCentroid.z, now);
        }

        // Thin V16 Rays: originate at moving globule swarm centroid, expand to screen edge, then collapse back to center
        if (this.globuleRayMesh && this.globuleRayMat) {
          this.globuleRayMesh.position.copy(this.globuleCentroid);
          if (this.globuleRayPhase === 'EXPANDING') {
            this.globuleRayProgress += dt * 2.85;
            if (this.globuleRayProgress >= 1.0) {
              this.globuleRayProgress = 1.0;
              this.globuleRayPhase = 'COLLAPSING';
            }
          } else if (this.globuleRayPhase === 'COLLAPSING') {
            this.globuleRayProgress -= dt * 2.15;
            if (this.globuleRayProgress <= 0.01) {
              this.globuleRayProgress = 0;
              this.globuleRayPhase = 'IDLE';
            }
          }
          if (this.globuleRayPhase !== 'IDLE' && this.globuleRayProgress > 0.01) {
            this.globuleRayMesh.visible = true;
            const p = this.globuleRayProgress;
            const eased = p * (2.0 - p);
            this.globuleRayMesh.scale.setScalar(0.03 + eased * 0.97);
            this.globuleRayMat.opacity = this.globuleRayPhase === 'EXPANDING'
              ? (0.35 + eased * 0.52)
              : (eased * 0.72);
            this.globuleRayMesh.rotation.y += dt * 0.32;
            this.globuleRayMesh.rotation.z += dt * 0.14;
          } else {
            this.globuleRayMesh.visible = false;
          }
        }

        this.globuleCelestialEnergy = THREE.MathUtils.lerp(
          this.globuleCelestialEnergy,
          Math.min(1, sphereProximitySum / Math.max(1, gCount * 0.45)),
          0.2
        );
        globalPiano.updateGlobuleLead(now, this.globuleCelestialEnergy, this.liveParams.audioMode !== 'OFF');
      } else {
        if (this.globuleRayMesh) this.globuleRayMesh.visible = false;
        this.globuleCelestialEnergy = 0;

        // V1–V15 PARTICLE SIMULATION LOOP
        const el = this.liveParams.elasticity + effectiveBoost * 0.007 * this.liveParams.audioPower;
        const spinSpeed = this.liveParams.pSpin * dt * 5.0;
        const attrRadius = this.liveParams.attractorRadius ?? 900;
        const attrRadiusSq = attrRadius * attrRadius;
        const attrForce = this.liveParams.attractorMaxForce ?? 18.0;
        const attrVortex = this.liveParams.attractorVortex ?? 12.0;
        const wanderForceSigned = this.liveParams.wanderForce ?? 1.0;
        const spectraForceSigned = this.liveParams.spectraForce ?? 1.0;
        const centerPull = (this.liveParams.centerAttraction ?? 0.25) * 0.04;

        const cXW = Math.cos(this.ang4.xw), sXW = Math.sin(this.ang4.xw);
        const cYW = Math.cos(this.ang4.yw), sYW = Math.sin(this.ang4.yw);
        const cZW = Math.cos(this.ang4.zw), sZW = Math.sin(this.ang4.zw);
        const apply4D = Math.abs(this.ang4.xw) > 0.0001 || Math.abs(this.ang4.yw) > 0.0001 || Math.abs(this.ang4.zw) > 0.0001;

        let highSpeedCount = 0;
        let sampledSpeedSum = 0;
        let sampledSpeedCount = 0;
        let closestDistWandererSq = 1e9;
        let closestDistSpectraSq = 1e9;

        for (let i = 0; i < count; i++) {
          const i3 = i * 3;
          let hx = this.homes[i3];
          let hy = this.homes[i3 + 1];
          let hz = this.homes[i3 + 2];

          if (apply4D) {
            let hw = this.home4[i];
            if (Math.abs(this.ang4.xw) > 0.0001) {
              const nx = hx * cXW - hw * sXW;
              hw = hx * sXW + hw * cXW;
              hx = nx;
            }
            if (Math.abs(this.ang4.yw) > 0.0001) {
              const ny = hy * cYW - hw * sYW;
              hw = hy * sYW + hw * cYW;
              hy = ny;
            }
            if (Math.abs(this.ang4.zw) > 0.0001) {
              const nz = hz * cZW - hw * sZW;
              hz = nz;
            }
          }

          this.velocities[i3] += (hx - this.positions[i3]) * el - this.positions[i3] * centerPull * 0.015 + this.tiltForceX * 0.8;
          this.velocities[i3 + 1] += (hy - this.positions[i3 + 1]) * el - this.positions[i3 + 1] * centerPull * 0.015 + this.tiltForceY * 0.8;
          this.velocities[i3 + 2] += (hz - this.positions[i3 + 2]) * el - this.positions[i3 + 2] * centerPull * 0.015;

          // Spectra Sphere (radius 600, symmetric force)
          const dxS = this.positions[i3] - this.spectraGroup.position.x;
          const dyS = this.positions[i3 + 1] - this.spectraGroup.position.y;
          const dzS = this.positions[i3 + 2] - this.spectraGroup.position.z;
          const dS2 = dxS * dxS + dyS * dyS + dzS * dzS;
          if (dS2 < 360000) {
            const dS = Math.sqrt(dS2) || 1;
            const fS = (1 - dS / 600) * (spectraForceSigned * 10 + effectiveBoost * 2.5 * this.liveParams.audioPower);
            this.velocities[i3] += (dxS / dS) * fS;
            this.velocities[i3 + 1] += (dyS / dS) * fS;
            this.velocities[i3 + 2] += (dzS / dS) * fS;
          }

          // Wanderer Sphere (radius 600, symmetric force)
          const dxW = this.positions[i3] - this.wanderer.position.x;
          const dyW = this.positions[i3 + 1] - this.wanderer.position.y;
          const dzW = this.positions[i3 + 2] - this.wanderer.position.z;
          const dW2 = dxW * dxW + dyW * dyW + dzW * dzW;
          if (dW2 < 360000) {
            const dW = Math.sqrt(dW2) || 1;
            const fW = (1 - dW / 600) * (wanderForceSigned * 10 + effectiveBoost * 4 * this.liveParams.audioPower);
            this.velocities[i3] += (dxW / dW) * fW;
            this.velocities[i3 + 1] += (dyW / dW) * fW;
            this.velocities[i3 + 2] += (dzW / dW) * fW;
          }

          // Hand gesture input
          if (this.isHandPresent) {
            const dxH = this.targetHandPos.x - this.positions[i3];
            const dyH = this.targetHandPos.y - this.positions[i3 + 1];
            const dzH = this.targetHandPos.z - this.positions[i3 + 2];
            const dH2 = dxH * dxH + dyH * dyH + dzH * dzH;
            if (dH2 < attrRadiusSq) {
              const dH = Math.sqrt(dH2) || 1;
              const fH = (this.isHandClosed ? 1 : -0.75) * (this.liveParams.handPower) * (1 - dH / attrRadius);
              this.velocities[i3] += (dxH / dH) * fH;
              this.velocities[i3 + 1] += (dyH / dH) * fH;
              this.velocities[i3 + 2] += (dzH / dH) * fH;
            }
          }

          // Mouse/Touch Drag Input
          if (this.isMouseDown) {
            const dxM = this.mousePos.x - this.positions[i3];
            const dyM = this.mousePos.y - this.positions[i3 + 1];
            const dzM = this.mousePos.z - this.positions[i3 + 2];
            const dM2 = dxM * dxM + dyM * dyM + dzM * dzM;
            if (dM2 < attrRadiusSq) {
              const dM = Math.sqrt(dM2) || 1;
              const factor = 1 - dM / attrRadius;
              const sgn = this.liveParams.touchMode === 'REPEL' ? -1 : 1;
              this.velocities[i3] += (dxM / dM) * attrForce * factor * sgn + (-dyM / dM) * attrVortex * factor * 0.45;
              this.velocities[i3 + 1] += (dyM / dM) * attrForce * factor * sgn + (dxM / dM) * attrVortex * factor * 0.45;
              this.velocities[i3 + 2] += (dzM / dM) * attrForce * factor * sgn;
            }
          }

          this.velocities[i3] *= this.liveParams.friction;
          this.velocities[i3 + 1] *= this.liveParams.friction;
          this.velocities[i3 + 2] *= this.liveParams.friction;

          this.positions[i3] += this.velocities[i3];
          this.positions[i3 + 1] += this.velocities[i3 + 1];
          this.positions[i3 + 2] += this.velocities[i3 + 2];

          if (spinSpeed > 0) {
            this.spinAngles[i3] += spinSpeed * (0.5 + this.colorShuffling[i]);
            this.spinAngles[i3 + 1] += spinSpeed * (0.3 + this.colorShuffling[i] * 0.7);
            this.spinAngles[i3 + 2] += spinSpeed * 0.2;
          }

          const speedSq = this.velocities[i3] * this.velocities[i3] + this.velocities[i3 + 1] * this.velocities[i3 + 1] + this.velocities[i3 + 2] * this.velocities[i3 + 2];
          if (speedSq > 160) highSpeedCount++;
          if ((i & 15) === 0) {
            sampledSpeedSum += Math.sqrt(speedSq);
            sampledSpeedCount++;
            if (dW2 < closestDistWandererSq) closestDistWandererSq = dW2;
            if (dS2 < closestDistSpectraSq) closestDistSpectraSq = dS2;
          }

          this.dummy.position.set(this.positions[i3], this.positions[i3 + 1], this.positions[i3 + 2]);
          this.dummy.rotation.set(this.spinAngles[i3], this.spinAngles[i3 + 1], this.spinAngles[i3 + 2]);
          this.dummy.scale.setScalar(Math.max(0.08, this.liveParams.pSize + effectiveBoost * 1.5 * this.liveParams.audioPower));
          this.dummy.updateMatrix();
          this.instancedMesh.setMatrixAt(i, this.dummy.matrix);

          const bloom = this.liveParams.bloomIntensity !== undefined ? this.liveParams.bloomIntensity : 1.0;
          const baseLightness = this.liveParams.particleBrightness !== undefined ? this.liveParams.particleBrightness : 0.48;
          const userLightness = Math.min(0.52, baseLightness * (0.82 + bloom * 0.12));
          const userSaturation = this.liveParams.particleSaturation !== undefined ? this.liveParams.particleSaturation : 0.95;
          this.tempColor.setHSL((this.colorShuffling[i] + this.colorOffset) % 1, userSaturation, userLightness);
          this.instancedMesh.setColorAt(i, this.tempColor);
        }

        if (
          !globalPiano.isGlobuleLeadIsolated() &&
          (globalPiano.isKineticNotesOn || this.liveParams.crystalOn) &&
          (this.liveParams.audioMode !== 'OFF' || globalPiano.isMidiActive)
        ) {
          const hit = this.scanParticleCollision(count, now);
          if (hit) {
            if (globalPiano.isKineticNotesOn) {
              globalPiano.updateKineticEngine(
                hit.speed,
                now,
                this.isHandPresent,
                this.targetHandPos.y,
                closestDistWandererSq < 45000,
                closestDistSpectraSq < 45000,
                hit.x
              );
            }
            if (this.liveParams.crystalOn && (this.liveParams.crystalLevel ?? 0.7) > 0) {
              const rate = Math.max(1, this.liveParams.crystalRate ?? 2);
              const sens = this.liveParams.crystalSens ?? 0.05;
              const damp = this.liveParams.noteDamping ?? 1.0;
              this.crystalDamp *= Math.exp(-dt / (0.4 + 2.6 * damp));
              const cGap = now - this.lastCrystalHitTime;
              const thr = 0.16 + (1 - sens) * 1.45;
              const need = thr * (1 + this.crystalDamp * 0.6 * damp);
              if (cGap >= (1000 / rate) * (1 + this.crystalDamp * 1.2 * damp) && hit.speed > need) {
                this.lastCrystalHitTime = now;
                this.crystalDamp = Math.min(2, this.crystalDamp + 0.9);
                globalPiano.playCrystal(hit.speed, hit.x, hit.seed, 1, undefined, this.liveParams.crystalLevel ?? 0.7);
              }
            }
          }
        }

        if (!globalPiano.isGlobuleLeadIsolated() && this.liveParams.trigCollision && this.liveParams.audioMode !== 'OFF' && highSpeedCount > count * 0.10) {
          globalPiano.triggerCollision(Math.min(1.0, highSpeedCount / (count * 0.2)));
        }

        this.instancedMesh.instanceMatrix.needsUpdate = true;
        if (this.instancedMesh.instanceColor) this.instancedMesh.instanceColor.needsUpdate = true;
      }

      this.updateTrailSystem(isGlobuleNow);
    }

    this.renderer.render(this.scene, this.camera);
  };

  private scanParticleCollision(count: number, now: number): { speed: number; x: number; seed: number } | null {
    const n = Math.min(count, this.colNext.length);
    if (n < 2) return null;
    const cell = 18;
    const inv = 1 / cell;
    const head = this.colHead;
    const next = this.colNext;
    const mask = head.length - 1;
    const R2 = cell * cell;
    head.fill(-1);
    for (let i = 0; i < n; i++) {
      const i3 = i * 3;
      const h =
        (Math.imul(Math.floor(this.positions[i3] * inv), 73856093) ^
          Math.imul(Math.floor(this.positions[i3 + 1] * inv), 19349663) ^
          Math.imul(Math.floor(this.positions[i3 + 2] * inv), 83492791)) &
        mask;
      next[i] = head[h];
      head[h] = i;
    }
    const step = Math.max(1, Math.floor(n / 3000));
    const off = (now | 0) % step;
    let best = 0;
    let bi = -1;
    let bj = -1;
    for (let i = off; i < n; i += step) {
      const i3 = i * 3;
      const x = this.positions[i3], y = this.positions[i3 + 1], z = this.positions[i3 + 2];
      const cx = Math.floor(x * inv), cy = Math.floor(y * inv), cz = Math.floor(z * inv);
      for (let ax = -1; ax <= 1; ax++) {
        for (let ay = -1; ay <= 1; ay++) {
          for (let az = -1; az <= 1; az++) {
            const h =
              (Math.imul(cx + ax, 73856093) ^
                Math.imul(cy + ay, 19349663) ^
                Math.imul(cz + az, 83492791)) &
              mask;
            for (let j = head[h]; j !== -1; j = next[j]) {
              if (j <= i) continue;
              const j3 = j * 3;
              const rx = this.positions[j3] - x, ry = this.positions[j3 + 1] - y, rz = this.positions[j3 + 2] - z;
              const d2 = rx * rx + ry * ry + rz * rz;
              if (d2 > R2 || d2 < 1e-6) continue;
              const closing =
                -((this.velocities[j3] - this.velocities[i3]) * rx +
                  (this.velocities[j3 + 1] - this.velocities[i3 + 1]) * ry +
                  (this.velocities[j3 + 2] - this.velocities[i3 + 2]) * rz) /
                Math.sqrt(d2);
              if (closing > best) {
                best = closing;
                bi = i;
                bj = j;
              }
            }
          }
        }
      }
    }
    return bi < 0 ? null : { speed: best, x: this.positions[bi * 3], seed: bi + bj };
  }
}
