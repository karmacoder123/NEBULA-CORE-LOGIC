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
  form: 'BOX' | 'SPHERE' | 'TORUS' | 'PLANE' | 'CYLINDER' | 'GALAXY' | 'QUANTUM' | 'STAR';
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
}

export interface CustomPreset {
  id: string;
  name: string;
  version: string;
  params: Partial<SimulationParams>;
  created: number;
}
