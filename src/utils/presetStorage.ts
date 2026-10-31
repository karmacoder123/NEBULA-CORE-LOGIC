/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { CustomPreset, SimulationParams } from '../types.ts';

const STORAGE_KEY = 'nebula_core_custom_presets_v1';

export const FACTORY_PRESETS: CustomPreset[] = [
  {
    id: 'factory-cosmic-glow',
    name: 'Cosmic Supernova',
    version: 'V12',
    created: 1700000000000,
    params: {
      friction: 0.95,
      elasticity: 0.0022,
      pSize: 3.8,
      pLumina: 85,
      wanderPush: 35,
      spectraPull: 60,
      reverbAmount: 0.8
    }
  },
  {
    id: 'factory-zen-ambient',
    name: 'Zen Meditation Hall',
    version: 'V8',
    created: 1700000001000,
    params: {
      friction: 0.98,
      elasticity: 0.0007,
      pSize: 2.8,
      pLumina: 55,
      trailOpacity: 0.22,
      reverbAmount: 0.95,
      pianoBrightness: 0.4
    }
  },
  {
    id: 'factory-quantum-starlight',
    name: 'Quantum Starlight',
    version: 'V14',
    created: 1700000002000,
    params: {
      friction: 0.96,
      elasticity: 0.0018,
      pSize: 3.5,
      pLumina: 90,
      wanderPush: 40,
      spectraPull: 50,
      reverbAmount: 0.7
    }
  },
  {
    id: 'factory-deep-abyss',
    name: 'Deep Space Abyss',
    version: 'V5',
    created: 1700000003000,
    params: {
      friction: 0.93,
      elasticity: 0.0030,
      pSize: 4.2,
      pLumina: 70,
      wanderOrbit: 0.5,
      spectraOrbit: 0.9
    }
  }
];

export class PresetStorage {
  public static loadCustomPresets(): CustomPreset[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn("PresetStorage: failed to load from localStorage", e);
    }
    return [];
  }

  public static saveCustomPreset(name: string, version: string, params: SimulationParams): CustomPreset {
    const presets = this.loadCustomPresets();
    const newPreset: CustomPreset = {
      id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name || `Preset ${presets.length + 1}`,
      version,
      params: { ...params },
      created: Date.now()
    };
    presets.push(newPreset);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    } catch (e) {
      console.warn("PresetStorage: failed to save to localStorage", e);
    }
    return newPreset;
  }

  public static deletePreset(id: string): CustomPreset[] {
    const presets = this.loadCustomPresets().filter(p => p.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    } catch (e) {
      console.warn("PresetStorage: failed to delete", e);
    }
    return presets;
  }

  public static exportPresetsAsJSON(presets: CustomPreset[]) {
    const jsonStr = JSON.stringify(presets, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NebulaCore_Presets_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  public static importPresetsFromJSON(file: File): Promise<CustomPreset[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            const current = PresetStorage.loadCustomPresets();
            const merged = [...current, ...parsed];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            resolve(merged);
          } else {
            reject(new Error("Formato JSON non valido (atteso array di preset)"));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Errore lettura file"));
      reader.readAsText(file);
    });
  }
}
