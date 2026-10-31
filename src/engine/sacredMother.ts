/**
 * @license
 * SPDX-License-Identifier: MIT
 * 
 * ==============================================================================
 * SACRED MOTHER ENGINE — V70.0-FULL-REMASTER (INVIOLABLE ORIGINAL SOURCE CODE)
 * This code preserves 100% of the original author's mathematical and physical logic.
 * ==============================================================================
 */

import * as THREE from 'three';

const CONFIG = { COUNT: 20000, VERSION: "V70.0-FULL-REMASTER" };

const DEFAULT_PARAMS = {
  elasticity: 0.0008, friction: 0.92,
  handPower: 4.0, zoom: 600,
  rotX: 0.002, rotY: 0.002, rotZ: 0.002,
  pSpin: 0.0, trailOpacity: 0.045, pSize: 1.2,
  pLumina: 15.0,
  audioThreshold: 0.1, cycleTime: 5.0,
  spectraPull: 1.0, audioPower: 1.0,
  wanderOrbit: 0.4, spectraOrbit: 0.8, wanderPush: 15.0,
  sunX: 200, sunY: 400, sunZ: 500,
  sunIntensity: 2.5, ambientIntensity: 1.2,
  radialExpansion: 8.0, centerAttraction: 2.0,
};

export const SACRED_VERSION_DATA: Record<string, {
  geo: string; size: number; form: string; mat: string; shininess: number;
  metalness: number; roughness: number; opacity: number; emissive: boolean;
  additive: boolean; wander: number; spectra: number; hemi: number; ambientColor: number;
}> = {
  "V1": { geo: 'box', size: 2.2, form: 'BOX', mat: 'phong', shininess: 120, metalness: 0, roughness: 0.5, opacity: 1.0, emissive: false, additive: false, wander: 600, spectra: 500, hemi: 0.45, ambientColor: 0xffffff },
  "V2": { geo: 'icosahedron', size: 2.8, form: 'SPHERE', mat: 'phong', shininess: 180, metalness: 0, roughness: 0.5, opacity: 1.0, emissive: false, additive: false, wander: 800, spectra: 400, hemi: 0.30, ambientColor: 0xffffff },
  "V3": { geo: 'cone', size: 2.5, form: 'TORUS', mat: 'toon', shininess: 0, metalness: 0, roughness: 0.5, opacity: 1.0, emissive: false, additive: false, wander: 500, spectra: 600, hemi: 0.55, ambientColor: 0xffeedd },
  "V4": { geo: 'cylinder', size: 2.4, form: 'PLANE', mat: 'lambert', shininess: 0, metalness: 0, roughness: 0.5, opacity: 0.5, emissive: false, additive: false, wander: 300, spectra: 250, hemi: 0.65, ambientColor: 0xaaddff },
  "V5": { geo: 'octahedron', size: 2.3, form: 'SPHERE', mat: 'phong_dark', shininess: 10, metalness: 0, roughness: 0.5, opacity: 1.0, emissive: true, additive: true, wander: 80, spectra: 80, hemi: 0.10, ambientColor: 0xffffff },
  "V6": { geo: 'tetrahedron', size: 2.6, form: 'BOX', mat: 'normal', shininess: 0, metalness: 0, roughness: 0.5, opacity: 1.0, emissive: false, additive: false, wander: 0, spectra: 0, hemi: 0.0, ambientColor: 0xffffff },
  "V7": { geo: 'dodecahedron', size: 2.4, form: 'TORUS', mat: 'physical', shininess: 0, metalness: 0.8, roughness: 0.1, opacity: 1.0, emissive: false, additive: false, wander: 700, spectra: 700, hemi: 0.35, ambientColor: 0xffffff },
  "V8": { geo: 'sphere_low', size: 2.2, form: 'SPHERE', mat: 'standard', shininess: 0, metalness: 0.0, roughness: 0.75, opacity: 1.0, emissive: false, additive: false, wander: 0, spectra: 0, hemi: 0.0, ambientColor: 0xffffff },
  "V9": { geo: 'sphere', size: 2.6, form: 'PLANE', mat: 'lambert', shininess: 0, metalness: 0, roughness: 0.5, opacity: 0.4, emissive: false, additive: false, wander: 250, spectra: 250, hemi: 0.70, ambientColor: 0xccffee },
  "V10": { geo: 'box_long', size: 2.2, form: 'BOX', mat: 'standard', shininess: 0, metalness: 0.5, roughness: 0.9, opacity: 1.0, emissive: false, additive: false, wander: 650, spectra: 450, hemi: 0.40, ambientColor: 0xffddaa },
  "V11": { geo: 'cone_inv', size: 2.3, form: 'SPHERE', mat: 'phong', shininess: 60, metalness: 0, roughness: 0.5, opacity: 1.0, emissive: false, additive: false, wander: 750, spectra: 550, hemi: 0.38, ambientColor: 0xffffff },
  "V12": { geo: 'octahedron', size: 2.8, form: 'TORUS', mat: 'phong_dark', shininess: 10, metalness: 0, roughness: 0.5, opacity: 1.0, emissive: true, additive: true, wander: 80, spectra: 80, hemi: 0.08, ambientColor: 0xff3300 },
  "V13": { geo: 'dodecahedron', size: 2.6, form: 'SPHERE', mat: 'phong', shininess: 200, metalness: 0, roughness: 0.0, opacity: 1.0, emissive: true, additive: false, wander: 900, spectra: 900, hemi: 0.20, ambientColor: 0xffffff },
};

export class SacredMotherEngine {
  public container: HTMLElement | null = null;
  public renderer: THREE.WebGLRenderer | null = null;
  public scene: THREE.Scene | null = null;
  public camera: THREE.PerspectiveCamera | null = null;
  public instancedMesh: THREE.InstancedMesh | null = null;
  private fadeScene: THREE.Scene | null = null;
  private fadeCamera: THREE.OrthographicCamera | null = null;
  private fadeMat: THREE.MeshBasicMaterial | null = null;

  public liveParams = { ...DEFAULT_PARAMS };
  public currentV = "V13";
  public cycleActive = false;
  public audioActive = false;

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

  private targetHandPos = new THREE.Vector3();
  public isHandPresent = false;
  public isHandClosed = false;

  private lastCycleSwitch = 0;
  private lastTime = 0;
  private isRunning = false;
  private animId: number | null = null;

  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;

  public mount(targetContainer: HTMLElement) {
    this.container = targetContainer;
    this.container.innerHTML = '';

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, width / height, 1, 5000);
    this.camera.position.z = this.liveParams.zoom;

    // WANDERER
    this.wanderer = new THREE.Group();
    this.wanderer.add(new THREE.Mesh(
      new THREE.SphereGeometry(12, 32, 32),
      new THREE.MeshPhongMaterial({ color: 0x000000, shininess: 100 })
    ));
    this.wanderRingAlpha = new THREE.Mesh(
      new THREE.TorusGeometry(20, 1.2, 16, 80),
      new THREE.MeshPhongMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 8, transparent: true, opacity: 0.9 })
    );
    this.wanderRingBeta = new THREE.Mesh(
      new THREE.TorusGeometry(15, 0.8, 16, 80),
      new THREE.MeshPhongMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 8, transparent: true, opacity: 0.9 })
    );
    this.wanderer.add(this.wanderRingAlpha, this.wanderRingBeta);
    this.scene.add(this.wanderer);

    // SPECTRA GROUP
    this.spectraGroup = new THREE.Group();
    this.spectraMesh = new THREE.Mesh(
      new THREE.SphereGeometry(12, 32, 32),
      new THREE.MeshPhongMaterial({ color: 0x000000, emissive: 0xff00ff, emissiveIntensity: 30, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending })
    );
    this.spectraRingAlpha = new THREE.Mesh(
      new THREE.TorusGeometry(20, 1.0, 16, 80),
      new THREE.MeshPhongMaterial({ emissive: 0xff00ff, emissiveIntensity: 10, transparent: true, opacity: 0.9 })
    );
    this.spectraRingBeta = new THREE.Mesh(
      new THREE.TorusGeometry(14, 0.7, 16, 80),
      new THREE.MeshPhongMaterial({ emissive: 0xffff00, emissiveIntensity: 10, transparent: true, opacity: 0.9 })
    );
    this.spectraGroup.add(this.spectraMesh, this.spectraRingAlpha, this.spectraRingBeta);
    this.scene.add(this.spectraGroup);

    // LIGHTS
    this.staticSun = new THREE.DirectionalLight(0xffffff, this.liveParams.sunIntensity);
    this.ambientLight = new THREE.AmbientLight(0xffffff, this.liveParams.ambientIntensity);
    this.applySunLights();
    this.scene.add(this.staticSun, this.ambientLight);

    this.wanderLight = new THREE.PointLight(0x00ff00, 1500, 3000);
    this.scene.add(this.wanderLight);

    this.spectraLight = new THREE.PointLight(0xff00ff, 2000, 3000);
    this.scene.add(this.spectraLight);

    // FADE PASS
    this.fadeScene = new THREE.Scene();
    this.fadeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.fadeMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: this.liveParams.trailOpacity });
    this.fadeScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.fadeMat));

    // PARTICLES (20,000 SACRED COUNT)
    this.positions = new Float32Array(CONFIG.COUNT * 3);
    this.velocities = new Float32Array(CONFIG.COUNT * 3);
    this.homes = new Float32Array(CONFIG.COUNT * 3);
    this.colorShuffling = new Float32Array(CONFIG.COUNT);
    this.spinAngles = new Float32Array(CONFIG.COUNT * 3);
    for (let i = 0; i < CONFIG.COUNT; i++) {
      this.colorShuffling[i] = Math.random();
    }

    this.loadSwarm(this.currentV);

    window.addEventListener('resize', this.onResize);
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animate();
  }

  public unmount() {
    this.isRunning = false;
    if (this.animId) cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this.onResize);

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
      this.renderer = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
  }

  private onResize = () => {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private buildGeo(vId: string): THREE.BufferGeometry {
    const cfg = SACRED_VERSION_DATA[vId] || SACRED_VERSION_DATA["V1"];
    const s = cfg.size;
    switch(cfg.geo) {
      case 'box': return new THREE.BoxGeometry(s, s, s);
      case 'box_long': return new THREE.BoxGeometry(s*0.5, s*2.2, s*0.5);
      case 'icosahedron': return new THREE.IcosahedronGeometry(s, 0);
      case 'cone': return new THREE.ConeGeometry(s*0.7, s*1.5, 6);
      case 'cone_inv': return new THREE.ConeGeometry(s*0.7, s*1.5, 6);
      case 'cylinder': return new THREE.CylinderGeometry(s*0.8, s*0.8, s*0.3, 8);
      case 'octahedron': return new THREE.OctahedronGeometry(s, 0);
      case 'tetrahedron': return new THREE.TetrahedronGeometry(s, 0);
      case 'dodecahedron':return new THREE.DodecahedronGeometry(s, 0);
      case 'sphere_low': return new THREE.SphereGeometry(s, 4, 3);
      default: return new THREE.SphereGeometry(s, 8, 8);
    }
  }

  private buildMat(vId: string): THREE.Material {
    const cfg = SACRED_VERSION_DATA[vId] || SACRED_VERSION_DATA["V1"];
    const base: { transparent: boolean; opacity: number; blending?: THREE.Blending } = {
      transparent: cfg.opacity < 1.0,
      opacity: cfg.opacity
    };
    if (cfg.additive) base.blending = THREE.AdditiveBlending;

    switch(cfg.mat) {
      case 'phong':
        return new THREE.MeshPhongMaterial({ ...base, shininess: cfg.shininess, specular: 0x222222 });
      case 'lambert':
        return new THREE.MeshLambertMaterial({ ...base });
      case 'standard':
        return new THREE.MeshStandardMaterial({ ...base, metalness: cfg.metalness, roughness: cfg.roughness });
      case 'physical':
        return new THREE.MeshPhysicalMaterial({ ...base, metalness: cfg.metalness, roughness: cfg.roughness, iridescence: 1.0, iridescenceIOR: 1.8 });
      case 'toon':
        return new THREE.MeshToonMaterial({ ...base });
      case 'phong_dark':
        return new THREE.MeshBasicMaterial({ ...base });
      case 'normal':
        return new THREE.MeshNormalMaterial({ flatShading: true });
      default:
        return new THREE.MeshPhongMaterial({ ...base, shininess: 40, specular: 0x222222 });
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
    const cfg = SACRED_VERSION_DATA[vId] || SACRED_VERSION_DATA["V1"];

    this.instancedMesh = new THREE.InstancedMesh(this.buildGeo(vId), this.buildMat(vId), CONFIG.COUNT);
    this.velocities.fill(0);

    for (let i = 0; i < CONFIG.COUNT; i++) {
      let x, y, z;
      if (cfg.form === 'BOX') {
        x = (Math.random()-0.5)*550; y = (Math.random()-0.5)*550; z = (Math.random()-0.5)*550;
      } else if (cfg.form === 'TORUS') {
        const rad = 250, tube = 60, a = Math.random()*Math.PI*2, b = Math.random()*Math.PI*2;
        x = (rad + tube*Math.cos(b))*Math.cos(a); y = (rad + tube*Math.cos(b))*Math.sin(a); z = tube*Math.sin(b);
      } else if (cfg.form === 'PLANE') {
        x = (Math.random()-0.5)*800; y = (Math.random()-0.5)*800; z = (Math.random()-0.5)*30;
      } else {
        const phi = Math.PI * (3 - Math.sqrt(5)), yy = 1 - (i/(CONFIG.COUNT-1))*2;
        const rAtY = Math.sqrt(1 - yy*yy), theta = phi*i;
        x = Math.cos(theta)*280*rAtY; y = yy*280; z = Math.sin(theta)*280*rAtY;
      }
      this.homes[i*3] = x; this.homes[i*3+1] = y; this.homes[i*3+2] = z;
      this.positions[i*3] = x; this.positions[i*3+1] = y; this.positions[i*3+2] = z;
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

  public async startMicrophone(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
      }
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }
      this.analyser = this.audioCtx.createAnalyser();
      this.audioCtx.createMediaStreamSource(stream).connect(this.analyser);
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.audioActive = true;
      return true;
    } catch (e) {
      console.warn("SacredMotherEngine: mic error", e);
      this.audioActive = false;
      return false;
    }
  }

  public stopMicrophone() {
    this.audioActive = false;
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
    this.analyser = null;
    this.dataArray = null;
  }

  public async toggleAudio() {
    if (!this.audioActive) {
      return await this.startMicrophone();
    } else {
      this.stopMicrophone();
      return false;
    }
  }

  private animate = (now = performance.now()) => {
    if (!this.isRunning) return;
    this.animId = requestAnimationFrame(this.animate);

    const dt = Math.min((now - this.lastTime) * 0.001, 0.05);
    this.lastTime = now;
    const time = now * 0.001;

    const versionKeys = Object.keys(SACRED_VERSION_DATA);
    if (this.cycleActive && (time - this.lastCycleSwitch > this.liveParams.cycleTime)) {
      this.loadSwarm(versionKeys[(versionKeys.indexOf(this.currentV) + 1) % versionKeys.length]);
      this.lastCycleSwitch = time;
    }

    if (this.audioActive && this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray as unknown as Uint8Array<ArrayBuffer>);
      let sum = 0;
      for (let i = 0; i < this.dataArray.length; i++) sum += this.dataArray[i];
      const avg = (sum / this.dataArray.length) / 255;
      this.audioBoost = THREE.MathUtils.lerp(
        this.audioBoost,
        Math.max(0, (avg - this.liveParams.audioThreshold) * 10.0 * this.liveParams.audioPower),
        0.2
      );
    } else {
      this.audioBoost = THREE.MathUtils.lerp(this.audioBoost, 0, 0.1);
    }

    this.colorOffset += dt * 0.15;
    this.spectraColorOffset += dt * 0.23;
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
    const spectraScale = 1.0 + this.audioBoost * 0.4;
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

    const cfg = SACRED_VERSION_DATA[this.currentV];
    const audioBump = this.audioBoost * this.liveParams.audioPower;
    this.wanderLight.intensity = 1500 + audioBump * 7000;
    this.spectraLight.intensity = (this.liveParams.pLumina * 400) + audioBump * 4500;

    if (!this.renderer || !this.fadeScene || !this.fadeCamera || !this.fadeMat || !this.scene || !this.camera) return;

    this.renderer.autoClear = false;
    this.fadeMat.opacity = this.liveParams.trailOpacity;
    this.renderer.render(this.fadeScene, this.fadeCamera);
    this.renderer.clearDepth();

    if (this.instancedMesh) {
      this.instancedMesh.rotation.x += this.liveParams.rotX;
      this.instancedMesh.rotation.y += this.liveParams.rotY;
      this.instancedMesh.rotation.z += this.liveParams.rotZ;

      const el = this.liveParams.elasticity + this.audioBoost * 0.007 * this.liveParams.audioPower;
      const spinSpeed = this.liveParams.pSpin * dt * 5.0;

      for (let i = 0; i < CONFIG.COUNT; i++) {
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
        const radialNet = (((this.liveParams as any).radialExpansion ?? 8.0) - ((this.liveParams as any).centerAttraction ?? 2.0)) * 0.12;
        this.velocities[i3] += px * invD * radialNet;
        this.velocities[i3+1] += py * invD * radialNet;
        this.velocities[i3+2] += pz * invD * radialNet;

        const dxS = this.spectraGroup.position.x - this.positions[i3];
        const dyS = this.spectraGroup.position.y - this.positions[i3+1];
        const dzS = this.spectraGroup.position.z - this.positions[i3+2];
        const dS2 = dxS*dxS + dyS*dyS + dzS*dzS;
        if (dS2 < 360000) {
          const dS = Math.sqrt(dS2) || 1;
          const fS = (1 - dS/600) * (this.liveParams.spectraPull * 0.15 + this.audioBoost * 2 * this.liveParams.audioPower);
          this.velocities[i3] += (dxS/dS) * fS;
          this.velocities[i3+1] += (dyS/dS) * fS;
          this.velocities[i3+2] += (dzS/dS) * fS;
        }

        const dxW = this.positions[i3] - this.wanderer.position.x;
        const dyW = this.positions[i3+1] - this.wanderer.position.y;
        const dzW = this.positions[i3+2] - this.wanderer.position.z;
        const dW2 = dxW*dxW + dyW*dyW + dzW*dzW;
        if (dW2 < 202500) {
          const dW = Math.sqrt(dW2) || 1;
          const fW = (1 - dW/450) * (this.liveParams.wanderPush + this.audioBoost * 10 * this.liveParams.audioPower);
          this.velocities[i3] += (dxW/dW) * fW;
          this.velocities[i3+1] += (dyW/dW) * fW;
          this.velocities[i3+2] += (dzW/dW) * fW;
        }

        if (this.isHandPresent) {
          const dxH = this.targetHandPos.x - this.positions[i3];
          const dyH = this.targetHandPos.y - this.positions[i3+1];
          const dzH = this.targetHandPos.z - this.positions[i3+2];
          const dH2 = dxH*dxH + dyH*dyH + dzH*dzH;
          if (dH2 < 722500) {
            const dH = Math.sqrt(dH2) || 1;
            const fH = (this.isHandClosed ? 12 : -9) * this.liveParams.handPower;
            this.velocities[i3] += (dxH/dH) * fH;
            this.velocities[i3+1] += (dyH/dH) * fH;
            this.velocities[i3+2] += (dzH/dH) * fH;
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

        this.dummy.position.set(this.positions[i3], this.positions[i3+1], this.positions[i3+2]);
        this.dummy.rotation.set(this.spinAngles[i3], this.spinAngles[i3+1], this.spinAngles[i3+2]);
        this.dummy.scale.setScalar(this.liveParams.pSize + this.audioBoost * 1.4 * this.liveParams.audioPower);
        this.dummy.updateMatrix();
        this.instancedMesh.setMatrixAt(i, this.dummy.matrix);

        if (cfg.mat !== 'normal') {
          this.tempColor.setHSL((this.colorShuffling[i] + this.colorOffset) % 1, 1.0, 0.55);
          this.instancedMesh.setColorAt(i, this.tempColor);
        }
      }
      this.instancedMesh.instanceMatrix.needsUpdate = true;
      if (this.instancedMesh.instanceColor) this.instancedMesh.instanceColor.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  };
}
