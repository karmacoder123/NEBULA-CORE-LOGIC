/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState, useEffect } from 'react';
import { CustomPreset, SimulationParams } from '../types.ts';
import { PresetStorage, FACTORY_PRESETS } from '../utils/presetStorage.ts';
import { Save, Download, Upload, Trash2, Play, X, Check } from 'lucide-react';

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVersion: string;
  currentParams: SimulationParams;
  onApplyPreset: (preset: CustomPreset) => void;
}

export const PresetModal: React.FC<PresetModalProps> = ({
  isOpen,
  onClose,
  currentVersion,
  currentParams,
  onApplyPreset
}) => {
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCustomPresets(PresetStorage.loadCustomPresets());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;
    const saved = PresetStorage.saveCustomPreset(newPresetName.trim(), currentVersion, currentParams);
    setCustomPresets([...customPresets, saved]);
    setNewPresetName('');
    setStatusMsg(`Preset "${saved.name}" salvato!`);
    setTimeout(() => setStatusMsg(''), 2500);
  };

  const handleDelete = (id: string) => {
    const updated = PresetStorage.deletePreset(id);
    setCustomPresets(updated);
  };

  const handleExport = () => {
    PresetStorage.exportPresetsAsJSON([...FACTORY_PRESETS, ...customPresets]);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const merged = await PresetStorage.importPresetsFromJSON(file);
      setCustomPresets(merged);
      setStatusMsg("Preset importati con successo!");
      setTimeout(() => setStatusMsg(''), 2500);
    } catch (err: unknown) {
      setStatusMsg((err as Error).message || "Errore importazione file");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-[#05150d] border border-[#00ff88] rounded-2xl p-5 max-w-lg w-full text-[#88ffaa] font-mono shadow-[0_0_50px_rgba(0,255,136,0.25)] flex flex-col gap-4 max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#005522] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88] px-2 py-0.5 rounded-full font-bold">
              PRESET MANAGER
            </span>
            <span className="text-[#00e5ff] font-bold text-sm">Salvataggio &amp; Condivisione</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#66aa88] hover:text-white p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {statusMsg && (
          <div className="bg-[#002b15] border border-[#00ff88] text-[#00ff88] px-3 py-1.5 rounded text-xs flex items-center gap-2">
            <Check className="w-3.5 h-3.5" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Save Current Form */}
        <form onSubmit={handleSaveCurrent} className="flex gap-2">
          <input
            type="text"
            placeholder="Nome nuovo preset (es. Cosmic Symphony)..."
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            className="flex-1 bg-[#020b06] border border-[#007733] focus:border-[#00ff88] rounded-lg px-3 py-2 text-xs text-white outline-none"
          />
          <button
            type="submit"
            className="bg-[#00ff88] text-[#020905] px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 hover:bg-[#33ffaa] transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>SALVA</span>
          </button>
        </form>

        {/* Preset Lists Container */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
          {/* Custom Presets */}
          <div>
            <div className="text-[10px] text-[#00e5ff] font-bold mb-1.5 uppercase tracking-wider">
              I TUOI PRESET PERSONALIZZATI ({customPresets.length})
            </div>
            {customPresets.length === 0 ? (
              <div className="text-xs text-[#558866] italic bg-[#020a05] p-3 rounded-lg border border-[#003318] text-center">
                Nessun preset personalizzato ancora salvato.
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {customPresets.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between bg-[#031109] border border-[#005522] rounded-lg px-3 py-2 hover:border-[#00ff88] transition-colors"
                  >
                    <div>
                      <div className="font-bold text-xs text-white">{p.name}</div>
                      <div className="text-[9.5px] text-[#66aa88]">
                        Versione: <span className="text-[#00ff88]">{p.version}</span> • {new Date(p.created).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          onApplyPreset(p);
                          onClose();
                        }}
                        className="bg-[#00ff88]/20 hover:bg-[#00ff88] text-[#00ff88] hover:text-[#020905] border border-[#00ff88] px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3" />
                        <span>CARICA</span>
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-[#ff5555] hover:bg-[#ff3333]/20 p-1.5 rounded cursor-pointer transition-colors"
                        title="Elimina"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Factory Presets */}
          <div>
            <div className="text-[10px] text-[#00e5ff] font-bold mb-1.5 uppercase tracking-wider">
              PRESET DI FABBRICA CURATI (PRO THEMES)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {FACTORY_PRESETS.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-[#031109] border border-[#004422] rounded-lg px-3 py-2"
                >
                  <div>
                    <div className="font-bold text-xs text-white">{p.name}</div>
                    <div className="text-[9.5px] text-[#66aa88]">Form: {p.version}</div>
                  </div>
                  <button
                    onClick={() => {
                      onApplyPreset(p);
                      onClose();
                    }}
                    className="bg-[#003318] hover:bg-[#00ff88] text-[#00ff88] hover:text-[#020905] border border-[#007733] px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    <span>APPLICA</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#004422] pt-3 text-xs">
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="bg-[#002211] text-[#00ff88] border border-[#00aa55] hover:bg-[#00aa55] hover:text-[#020905] px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all font-bold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ESPORTA JSON</span>
            </button>
            <label className="bg-[#002211] text-[#00e5ff] border border-[#00aacc] hover:bg-[#00aacc] hover:text-[#020905] px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all font-bold">
              <Upload className="w-3.5 h-3.5" />
              <span>IMPORTA JSON</span>
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>
          </div>

          <button
            onClick={onClose}
            className="text-[#88ffaa] hover:text-white px-3 py-1.5 rounded cursor-pointer"
          >
            CHIUDI
          </button>
        </div>
      </div>
    </div>
  );
};
