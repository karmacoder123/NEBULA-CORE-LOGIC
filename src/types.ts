/**
 * @license
 * SPDX-License-Identifier: MIT
 */

export type EngineMode = 'MOTHER' | 'REMASTERED';
export type TouchMode = 'ATTRACT' | 'REPEL' | 'VORTEX';
export type AudioMode = 'OFF' | 'ENERGY' | 'BEAT' | 'SYNTH';
export type GeometryType = 'octa' | 'box' | 'ico' | 'sphere';

export interface VersionConfig {
  geo: string;
  size: number;
  form: 'BOX' | 'SPHERE' | 'TORUS' | 'PLANE' | 'CYLINDER' | 'GALAXY' | 'QUANTUM' | 'STAR' | 'FILAMENT' | 'GLOBULE';
  mat: 'phong' | 'lambert' | 'standard' | 'physical' | 'toon' | 'phong_dark' | 'normal' | 'basic';
  shininess: number;
  metalness: number;
  roughness: number;
  opacity: number;
  emissive: boolean;
  additive: boolean;
  wander: number;
  spectra: number;
  hemi: number;
  ambientColor: number;
  luminaMultiplier?: number;
  specularColor?: number;
  title?: string;
  wanderWeight?: number;
  spectraWeight?: number;
  celestialRadius?: number;
}

export interface SimulationParams {
  friction: number;
  elasticity: number;
  handPower: number;
  zoom: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  pSpin: number;
  trailOpacity: number;
  motionBlur: number;
  pSize: number;
  pLumina: number;
  bloomIntensity: number;
  audioThreshold: number;
  cycleTime: number;
  spectraPull: number;
  audioPower: number;
  hueRotationSpeed: number;
  wanderOrbit: number;
  spectraOrbit: number;
  wanderPush: number;
  sunX: number;
  sunY: number;
  sunZ: number;
  sunIntensity: number;
  ambientIntensity: number;
  particleCount: number;
  touchMode: TouchMode;
  audioMode: AudioMode;
  pianoVolume: number;
  reverbAmount: number;
  pianoBrightness: number;
  triggerRateMs: number;
  triggerSensitivity: number;
  trigGesture: boolean;
  trigPinch: boolean;
  trigClick: boolean;
  trigCollision: boolean;
  trigBpm: boolean;
  particleBrightness: number;
  particleSaturation: number;
  particleShininess: number;
  radialExpansion: number;
  centerAttraction: number;
  // Extended Nebula Core v2.5 parameters
  isAutoRotationOn?: boolean;
  rot4dXW?: number;
  rot4dYW?: number;
  rot4dZW?: number;
  ringsOn?: boolean;
  ringSpeed?: number;
  ringSwarm?: number;
  ringAudio?: number;
  wanderForce?: number;
  spectraForce?: number;
  crystalOn?: boolean;
  crystalSens?: number;
  crystalRate?: number;
  crystalLevel?: number;
  crystalMode?: 'ALL' | 'IMPACTS' | 'SPARKS' | 'SPHERES';
  attractorRadius?: number;
  attractorMaxForce?: number;
  attractorVortex?: number;
  // Lead Trance V16 (Globuli)
  globuleLeadOn?: boolean;
  globuleLeadLevel?: number;
  globuleLeadBpm?: number;
  globuleInfluenceMult?: number;
  // Visible 3D Ring Cursor
  cursorRingOn?: boolean;
  // Secondary light & hue
  secondarySunIntensity?: number;
  sunHue?: 'WHITE' | 'GOLD' | 'CYAN' | 'VIOLET';
  // 3D Geometric Trails
  isTrailsOn?: boolean;
  trailLength?: number;
  trailPersistence?: number;
  trailTracerCount?: number;
  // Harmonic Synth & Kinetic Suite
  isKineticNotesOn?: boolean;
  isSpatial3DOn?: boolean;
  pianoProfile?: 'PIANO' | 'CRYSTAL' | 'PAD' | 'DRONE';
  arpPattern?: string;
  arpDivision?: string;
  chordType?: string;
  chordResonance?: number;
  attackSoftness?: number;
  sustainTail?: number;
  noteDamping?: number;
  kineticMode?: 'ONSET' | 'CONTINUOUS';
  triggerThreshold?: number;
  kineticSensitivity?: number;
  micGain?: number;
}

export interface CustomPreset {
  id: string;
  name: string;
  version: string;
  params: Partial<SimulationParams>;
  created: number;
}
