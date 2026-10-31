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
  "V3": { geo: 'cone', size: 2.6, form: 'TORUS', mat: 'toon', shininess: 10, metalness: 0, roughness: 0.6, opacity: 1.0, emissive: false, additive: false, wander: 500, spectra: 600, hemi: 0.55, ambientColor: 0xffeedd },
  // V4 — WHITE PARTICLES HARMONIZED: natural soft diffuse without glare
  "V4": { geo: 'cylinder', size: 2.4, form: 'PLANE', mat: 'lambert', shininess: 15, metalness: 0.0, roughness: 0.7, opacity: 0.8, emissive: false, additive: false, wander: 300, spectra: 250, hemi: 0.65, ambientColor: 0xaaddff },
  "V5": { geo: 'octahedron', size: 2.3, form: 'SPHERE', mat: 'phong_dark', shininess: 10, metalness: 0, roughness: 0.5, opacity: 1.0, emissive: true, additive: true, wander: 80, spectra: 80, hemi: 0.10, ambientColor: 0xffffff },
  // V6 — WHITE/NORMAL HARMONIZED: clean non-glaring prismatic tone
  "V6": { geo: 'tetrahedron', size: 2.6, form: 'BOX', mat: 'normal', shininess: 0, metalness: 0.0, roughness: 0.6, opacity: 1.0, emissive: false, additive: false, wander: 0, spectra: 0, hemi: 0.0, ambientColor: 0xffffff },
  "V7": { geo: 'dodecahedron', size: 2.4, form: 'TORUS', mat: 'phong', shininess: 35, metalness: 0.3, roughness: 0.5, opacity: 1.0, emissive: false, additive: false, wander: 700, spectra: 700, hemi: 0.35, ambientColor: 0xffffff },
  // V8 — WHITE/MATTE HARMONIZED: gentle diffuse sphere
  "V8": { geo: 'sphere_low', size: 2.2, form: 'SPHERE', mat: 'standard', shininess: 10, metalness: 0.0, roughness: 0.8, opacity: 1.0, emissive: false, additive: false, wander: 0, spectra: 0, hemi: 0.0, ambientColor: 0xffffff },
  // V9 — WHITE TRANSLUCENT HARMONIZED: soft translucent cloud
  "V9": { geo: 'sphere', size: 2.6, form: 'PLANE', mat: 'lambert', shininess: 15, metalness: 0.0, roughness: 0.7, opacity: 0.6, emissive: false, additive: false, wander: 250, spectra: 250, hemi: 0.70, ambientColor: 0xccffee },
  // V10 — WHITE/OBELISK HARMONIZED: soft crystals without blown out specular
  "V10": { geo: 'box_long', size: 2.2, form: 'BOX', mat: 'standard', shininess: 20, metalness: 0.2, roughness: 0.7, opacity: 1.0, emissive: false, additive: false, wander: 650, spectra: 450, hemi: 0.40, ambientColor: 0xffddaa },
  "V11": { geo: 'cone_inv', size: 2.3, form: 'SPHERE', mat: 'phong', shininess: 25, metalness: 0, roughness: 0.6, opacity: 1.0, emissive: false, additive: false, wander: 750, spectra: 550, hemi: 0.38, ambientColor: 0xffffff },
  "V12": { geo: 'octahedron', size: 2.8, form: 'TORUS', mat: 'phong_dark', shininess: 10, metalness: 0, roughness: 0.5, opacity: 1.0, emissive: true, additive: true, wander: 80, spectra: 80, hemi: 0.08, ambientColor: 0xff3300 },
  "V13": { geo: 'dodecahedron', size: 2.6, form: 'SPHERE', mat: 'phong', shininess: 40, metalness: 0, roughness: 0.5, opacity: 1.0, emissive: false, additive: false, wander: 900, spectra: 900, hemi: 0.20, ambientColor: 0xffffff },
  // V14 — NEW VERSION: ETHEREAL QUANTUM STARLIGHT (soft, deep non-glaring star particles)
  "V14": { geo: 'octahedron', size: 2.8, form: 'STAR', mat: 'phong', shininess: 30, metalness: 0.1, roughness: 0.5, opacity: 1.0, emissive: false, additive: false, wander: 850, spectra: 850, hemi: 0.30, ambientColor: 0x55ccff }
};

export const REMASTERED_KEYS = Object.keys(REMASTERED_VERSION_DATA);

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
  public cycleActive = false;
  public isWebcamActive = false;
  public isMicActive = false;

  public liveParams: SimulationParams = {
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
  };

  private positions!: Float32Array;
  private velocities!: Float32Array;
  private homes!: Float32Array;
  private colorShuffling!: Float32Array;
  private spinAngles!: Float32Array;

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
    this.ambientLight = new THREE.AmbientLight(0xffffff, this.liveParams.ambientIntensity);
    this.applySunLights();
    this.scene.add(this.staticSun, this.ambientLight);

    this.wanderLight = new THREE.PointLight(0x00ff88, 600, 3000);
    this.scene.add(this.wanderLight);

    this.spectraLight = new THREE.PointLight(0xff00aa, 800, 3000);
    this.scene.add(this.spectraLight);

    // FADE TRAIL PASS (Pure Pitch Black for deep contrast)
    this.fadeScene = new THREE.Scene();
    this.fadeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.fadeMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: this.liveParams.trailOpacity });
    this.fadeScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.fadeMat));

    this.allocSwarmBuffers(this.liveParams.particleCount);
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

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
      this.renderer = null;
    }
  }

  public allocSwarmBuffers(count: number) {
    this.liveParams.particleCount = count;
    this.positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);
    this.homes = new Float32Array(count * 3);
    this.colorShuffling = new Float32Array(count);
    this.spinAngles = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      this.colorShuffling[i] = Math.random();
      this.spinAngles[i * 3] = (Math.random() - 0.5) * 0.05;
      this.spinAngles[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
      this.spinAngles[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
    }
  }

  public setGeometryType(type: GeometryType) {
    this.currentGeoType = type;
    this.loadSwarm(this.currentV);
  }

  private buildGeometry(vId: string, s: number): THREE.BufferGeometry {
    const cfg = REMASTERED_VERSION_DATA[vId] || REMASTERED_VERSION_DATA["V1"];
    const baseSize = s || cfg.size;

    if (this.currentGeoType === 'box') {
      return new THREE.BoxGeometry(baseSize * 1.5, baseSize * 1.5, baseSize * 1.5);
    } else if (this.currentGeoType === 'ico') {
      return new THREE.IcosahedronGeometry(baseSize, 0);
    } else if (this.currentGeoType === 'sphere') {
      return new THREE.SphereGeometry(baseSize, 8, 8);
    } else if (this.currentGeoType === 'octa') {
      return new THREE.OctahedronGeometry(baseSize, 0);
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
          specular: 0x151515
        });
      case 'lambert':
        return new THREE.MeshLambertMaterial({ ...base });
      case 'standard':
        return new THREE.MeshStandardMaterial({
          ...base,
          metalness: cfg.metalness,
          roughness: 0.65
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
        return new THREE.MeshBasicMaterial({ ...base });
      default:
        return new THREE.MeshPhongMaterial({ ...base, shininess: shininess, specular: 0x151515 });
    }
  }

  public applySunLights() {
    if (this.staticSun) {
      this.staticSun.position.set(this.liveParams.sunX, this.liveParams.sunY, this.liveParams.sunZ);
      this.staticSun.intensity = this.liveParams.sunIntensity;
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
    const cfg = REMASTERED_VERSION_DATA[vId] || REMASTERED_VERSION_DATA["V1"];
    const count = this.liveParams.particleCount;

    this.instancedMesh = new THREE.InstancedMesh(
      this.buildGeometry(vId, this.liveParams.pSize),
      this.buildMaterial(vId),
      count
    );
    this.velocities.fill(0);

    const phi = Math.PI * (3 - Math.sqrt(5));

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
    if (this.liveParams.trigClick && this.liveParams.audioMode !== 'OFF') {
      const normY = e.clientY / window.innerHeight;
      const idx = Math.min(14, Math.max(0, Math.floor((1 - normY) * 15)));
      globalPiano.playNote([130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00][idx], 0.85);
    }
  };

  private onMouseMove = (e: MouseEvent) => {
    if (this.isMouseDown) {
      this.updatePointerCoords(e.clientX, e.clientY);
    }
  };

  private onMouseUp = () => {
    this.isMouseDown = false;
  };

  private onWheel = (e: WheelEvent) => {
    if (!this.camera) return;
    this.camera.position.z = Math.max(200, Math.min(1600, this.camera.position.z + e.deltaY * 0.8));
    this.liveParams.zoom = this.camera.position.z;
  };

  private initialPinchDist: number | null = null;
  private initialZoom = 600;

  private onTouchStart = (e: TouchEvent) => {
    if ((e.target as HTMLElement)?.closest('#nebula-ui, #top-bar, #console-panel, #pip-container, .modal-card, button, input')) return;
    globalPiano.resume();
    if (e.touches.length === 1) {
      this.isMouseDown = true;
      const t = e.touches[0];
      this.updatePointerCoords(t.clientX, t.clientY);
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
    if ((e.target as HTMLElement)?.closest('#nebula-ui, #top-bar, #console-panel, #pip-container, .modal-card, button, input')) return;
    if (e.touches.length === 1 && this.isMouseDown) {
      e.preventDefault();
      this.updatePointerCoords(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2 && this.initialPinchDist && this.camera) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (dist > 0) {
        this.camera.position.z = Math.max(200, Math.min(1600, this.initialZoom * (this.initialPinchDist / dist)));
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

    // Cycle check
    if (this.cycleActive && (time - this.lastCycleSwitch > this.liveParams.cycleTime)) {
      this.loadSwarm(REMASTERED_KEYS[(REMASTERED_KEYS.indexOf(this.currentV) + 1) % REMASTERED_KEYS.length]);
      this.lastCycleSwitch = time;
    }

    // Camera zoom real-time sync with zoom slider
    if (this.camera && Math.abs(this.camera.position.z - this.liveParams.zoom) > 0.5) {
      this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, this.liveParams.zoom, 0.15);
    }

    // BPM Arpeggio
    if (this.liveParams.trigBpm && this.liveParams.audioMode !== 'OFF' && (now - this.lastBpmTime > this.liveParams.triggerRateMs * 2)) {
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
        if (this.liveParams.audioMode !== 'OFF') {
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

    (this.wanderRingAlpha.material as THREE.MeshPhongMaterial).emissive.setHSL(hueW, 1.0, 0.5);
    (this.wanderRingBeta.material as THREE.MeshPhongMaterial).emissive.setHSL((hueW + 0.25) % 1, 1.0, 0.5);
    this.wanderRingAlpha.rotation.z += dt * 3.0;
    this.wanderRingBeta.rotation.x += dt * 2.5;

    (this.spectraRingAlpha.material as THREE.MeshPhongMaterial).emissive.setHSL((hueS + 0.33) % 1, 1.0, 0.5);
    (this.spectraRingBeta.material as THREE.MeshPhongMaterial).emissive.setHSL((hueS + 0.66) % 1, 1.0, 0.5);
    this.spectraRingAlpha.rotation.x += dt * 2.8;
    this.spectraRingBeta.rotation.z += dt * 2.0;
    (this.spectraMesh.material as THREE.MeshPhongMaterial).emissive.setHSL(hueS, 1.0, 0.5);

    const spectraScale = 1.0 + effectiveBoost * 0.4;
    this.spectraRingAlpha.scale.setScalar(spectraScale);
    this.spectraRingBeta.scale.setScalar(spectraScale);

    const tW = time * this.liveParams.wanderOrbit;
    this.wanderer.position.set(
      Math.cos(tW * 0.8) * 700,
      Math.sin(tW * 0.6) * 550,
      Math.sin(tW * 1.0) * 500
    );
    this.wanderLight.position.copy(this.wanderer.position);
    this.wanderLight.color.setHSL(hueW, 1, 0.5);

    const tS = time * this.liveParams.spectraOrbit;
    this.spectraGroup.position.set(
      Math.cos(tS) * 550,
      Math.sin(tS * 0.73) * 450,
      Math.sin(tS * 1.17) * 400
    );
    this.spectraLight.position.copy(this.spectraGroup.position);
    this.spectraLight.color.setHSL(hueS, 1, 0.5);

    const cfg = REMASTERED_VERSION_DATA[this.currentV] || REMASTERED_VERSION_DATA["V1"];
    const audioBump = effectiveBoost * this.liveParams.audioPower;
    this.wanderLight.intensity = 600 + audioBump * 1500;
    this.spectraLight.intensity = (this.liveParams.pLumina * 25) + audioBump * 1500;

    if (!this.renderer || !this.fadeScene || !this.fadeCamera || !this.fadeMat || !this.scene || !this.camera) return;

    this.renderer.autoClear = false;
    const blurWeight = this.liveParams.motionBlur !== undefined ? this.liveParams.motionBlur : this.liveParams.trailOpacity;
    this.fadeMat.opacity = Math.max(0.005, Math.min(0.50, blurWeight));
    this.renderer.render(this.fadeScene, this.fadeCamera);
    this.renderer.clearDepth();

    if (this.instancedMesh) {
      this.instancedMesh.rotation.x += this.liveParams.rotX;
      this.instancedMesh.rotation.y += this.liveParams.rotY;
      this.instancedMesh.rotation.z += this.liveParams.rotZ;

      const el = this.liveParams.elasticity + effectiveBoost * 0.007 * this.liveParams.audioPower;
      const spinSpeed = this.liveParams.pSpin * dt * 5.0;
      const count = this.liveParams.particleCount;
      let highSpeedCount = 0;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        this.velocities[i3] += (this.homes[i3] - this.positions[i3]) * el;
        this.velocities[i3+1] += (this.homes[i3+1] - this.positions[i3+1]) * el;
        this.velocities[i3+2] += (this.homes[i3+2] - this.positions[i3+2]) * el;

        // Radial Expansion vs Center Attraction Force
        const px = this.positions[i3];
        const py = this.positions[i3+1];
        const pz = this.positions[i3+2];
        const dCenter = Math.hypot(px, py, pz) || 1;
        const invD = 1 / dCenter;
        const radialNet = ((this.liveParams.radialExpansion ?? 8.0) - (this.liveParams.centerAttraction ?? 2.0)) * 0.12;
        this.velocities[i3] += px * invD * radialNet;
        this.velocities[i3+1] += py * invD * radialNet;
        this.velocities[i3+2] += pz * invD * radialNet;

        // Spectra pull
        const dxS = this.spectraGroup.position.x - this.positions[i3];
        const dyS = this.spectraGroup.position.y - this.positions[i3+1];
        const dzS = this.spectraGroup.position.z - this.positions[i3+2];
        const dS2 = dxS*dxS + dyS*dyS + dzS*dzS;
        if (dS2 < 420000) {
          const dS = Math.sqrt(dS2) || 1;
          const fS = (1 - dS/650) * (this.liveParams.spectraPull * 0.15 + effectiveBoost * 2.5 * this.liveParams.audioPower);
          this.velocities[i3] += (dxS/dS) * fS;
          this.velocities[i3+1] += (dyS/dS) * fS;
          this.velocities[i3+2] += (dzS/dS) * fS;
        }

        // Wanderer push
        const dxW = this.positions[i3] - this.wanderer.position.x;
        const dyW = this.positions[i3+1] - this.wanderer.position.y;
        const dzW = this.positions[i3+2] - this.wanderer.position.z;
        const dW2 = dxW*dxW + dyW*dyW + dzW*dzW;
        if (dW2 < 300000) {
          const dW = Math.sqrt(dW2) || 1;
          const fW = (1 - dW/550) * (this.liveParams.wanderPush + effectiveBoost * 10 * this.liveParams.audioPower);
          this.velocities[i3] += (dxW/dW) * fW;
          this.velocities[i3+1] += (dyW/dW) * fW;
          this.velocities[i3+2] += (dzW/dW) * fW;
        }

        // Hand gesture input
        if (this.isHandPresent) {
          const dxH = this.targetHandPos.x - this.positions[i3];
          const dyH = this.targetHandPos.y - this.positions[i3+1];
          const dzH = this.targetHandPos.z - this.positions[i3+2];
          const dH2 = dxH*dxH + dyH*dyH + dzH*dzH;
          if (dH2 < 750000) {
            const dH = Math.sqrt(dH2) || 1;
            const fH = (this.isHandClosed ? 14 : -10) * (this.liveParams.handPower / 12.0) * (1 - dH / 860);
            this.velocities[i3] += (dxH/dH) * fH;
            this.velocities[i3+1] += (dyH/dH) * fH;
            this.velocities[i3+2] += (dzH/dH) * fH;
          }
        }

        // Mouse/Touch Drag Input
        if (this.isMouseDown) {
          const dxM = this.mousePos.x - this.positions[i3];
          const dyM = this.mousePos.y - this.positions[i3+1];
          const dzM = this.mousePos.z - this.positions[i3+2];
          const dM2 = dxM*dxM + dyM*dyM + dzM*dzM;
          if (dM2 < 750000) {
            const dM = Math.sqrt(dM2) || 1;
            const factor = 1 - dM / 860;
            if (this.liveParams.touchMode === 'ATTRACT') {
              this.velocities[i3] += (dxM/dM) * 16 * factor;
              this.velocities[i3+1] += (dyM/dM) * 16 * factor;
              this.velocities[i3+2] += (dzM/dM) * 16 * factor;
            } else if (this.liveParams.touchMode === 'REPEL') {
              this.velocities[i3] -= (dxM/dM) * 14 * factor;
              this.velocities[i3+1] -= (dyM/dM) * 14 * factor;
              this.velocities[i3+2] -= (dzM/dM) * 14 * factor;
            } else {
              // VORTEX
              this.velocities[i3] += (-dyM/dM) * 15 * factor;
              this.velocities[i3+1] += (dxM/dM) * 15 * factor;
            }
          }
        }

        this.velocities[i3] *= this.liveParams.friction;
        this.velocities[i3+1] *= this.liveParams.friction;
        this.velocities[i3+2] *= this.liveParams.friction;

        this.positions[i3] += this.velocities[i3];
        this.positions[i3+1] += this.velocities[i3+1];
        this.positions[i3+2] += this.velocities[i3+2];

        if (spinSpeed > 0) {
          this.spinAngles[i3] += spinSpeed * (0.5 + this.colorShuffling[i]);
          this.spinAngles[i3+1] += spinSpeed * (0.3 + this.colorShuffling[i] * 0.7);
          this.spinAngles[i3+2] += spinSpeed * 0.2;
        }

        const speedSq = this.velocities[i3]*this.velocities[i3] + this.velocities[i3+1]*this.velocities[i3+1] + this.velocities[i3+2]*this.velocities[i3+2];
        if (speedSq > 160) highSpeedCount++;

        this.dummy.position.set(this.positions[i3], this.positions[i3+1], this.positions[i3+2]);
        this.dummy.rotation.set(this.spinAngles[i3], this.spinAngles[i3+1], this.spinAngles[i3+2]);
        this.dummy.scale.setScalar(Math.max(0.1, this.liveParams.pSize + effectiveBoost * 1.5 * this.liveParams.audioPower));
        this.dummy.updateMatrix();
        this.instancedMesh.setMatrixAt(i, this.dummy.matrix);

        // Soft, deep, rich colors matching mother version with bloom and saturation control
        const bloom = this.liveParams.bloomIntensity !== undefined ? this.liveParams.bloomIntensity : 1.0;
        const baseLightness = this.liveParams.particleBrightness !== undefined ? this.liveParams.particleBrightness : 0.48;
        const userLightness = Math.min(0.65, baseLightness * (0.85 + bloom * 0.15));
        const userSaturation = this.liveParams.particleSaturation !== undefined ? this.liveParams.particleSaturation : 0.95;
        this.tempColor.setHSL((this.colorShuffling[i] + this.colorOffset) % 1, userSaturation, userLightness);
        this.instancedMesh.setColorAt(i, this.tempColor);
      }

      // Autononous collision audio trigger
      if (this.liveParams.trigCollision && this.liveParams.audioMode !== 'OFF' && highSpeedCount > count * 0.10) {
        globalPiano.triggerCollision(Math.min(1.0, highSpeedCount / (count * 0.2)));
      }

      this.instancedMesh.instanceMatrix.needsUpdate = true;
      if (this.instancedMesh.instanceColor) this.instancedMesh.instanceColor.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  };
}
