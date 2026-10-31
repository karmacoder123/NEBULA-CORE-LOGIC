/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useEffect, useRef, useState } from 'react';
import { globalHandTracker } from '../vision/handTracker.ts';
import { Camera, EyeOff } from 'lucide-react';

interface PipPreviewProps {
  isWebcamActive: boolean;
  onToggleWebcam: () => void;
}

export const PipPreview: React.FC<PipPreviewProps> = ({ isWebcamActive, onToggleWebcam }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState("OFF");
  const [note, setNote] = useState("OFF");
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isWebcamActive) {
      globalHandTracker.startWebcam(canvas).then((res) => {
        setIsFallback(!res.success);
        setStatus(globalHandTracker.statusMessage);
      });
    } else {
      globalHandTracker.stopWebcam();
      setIsFallback(false);
      setStatus("OFF");
      setNote("OFF");
    }

    const interval = setInterval(() => {
      if (globalHandTracker.isWebcamActive || globalHandTracker.fallbackPadActive) {
        setStatus(globalHandTracker.statusMessage);
        setNote(globalHandTracker.activeNote);
        setIsFallback(globalHandTracker.fallbackPadActive);
      }
    }, 150);

    return () => {
      clearInterval(interval);
    };
  }, [isWebcamActive]);

  const handlePadInteraction = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, isDown: boolean) => {
    if (!isFallback || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    let cx = 0, cy = 0;
    if ('touches' in e && e.touches.length > 0) {
      cx = e.touches[0].clientX;
      cy = e.touches[0].clientY;
    } else if ('clientX' in e) {
      cx = (e as React.MouseEvent).clientX;
      cy = (e as React.MouseEvent).clientY;
    }
    globalHandTracker.handlePadPointer(cx, cy, isDown, rect);
  };

  if (!isWebcamActive && !isFallback) return null;

  return (
    <div
      id="pip-container"
      className="fixed top-14 right-3 md:right-4 z-40 bg-[#05120c]/90 border border-[#00ff88]/80 rounded-xl p-2 w-[165px] md:w-[195px] backdrop-blur-md shadow-2xl shadow-black/80 flex flex-col gap-1.5"
    >
      <div className="flex items-center justify-between border-b border-[#005522] pb-1 text-[9px] font-mono font-bold text-[#00e5ff]">
        <span className="flex items-center gap-1">
          <Camera className="w-3 h-3 text-[#00ff88]" />
          <span>{isFallback ? 'VIRTUAL PAD' : 'CAMERA PIP'}</span>
        </span>
        <button
          onClick={onToggleWebcam}
          className="text-[#88ffaa] hover:text-white p-0.5 rounded cursor-pointer"
          title="Chiudi videocamera"
        >
          <EyeOff className="w-3 h-3" />
        </button>
      </div>

      <div className="relative w-full h-[105px] md:h-[120px] bg-black rounded-lg overflow-hidden border border-[#004422]">
        <canvas
          ref={canvasRef}
          width={195}
          height={120}
          onMouseDown={(e) => handlePadInteraction(e, true)}
          onMouseMove={(e) => handlePadInteraction(e, e.buttons === 1)}
          onMouseUp={(e) => handlePadInteraction(e, false)}
          onTouchStart={(e) => handlePadInteraction(e, true)}
          onTouchMove={(e) => handlePadInteraction(e, true)}
          onTouchEnd={(e) => handlePadInteraction(e, false)}
          className="w-full h-full block cursor-crosshair touch-none"
        />
      </div>

      <div className="text-[8.5px] font-mono flex flex-col gap-0.5">
        <div className="flex justify-between items-center text-[#88ffaa]">
          <span>STATO:</span>
          <span className="text-[#00ff88] font-bold truncate max-w-[125px]" title={status}>{status}</span>
        </div>
        <div className="flex justify-between items-center text-[#88ffaa]">
          <span>PIANO:</span>
          <span className="text-[#00e5ff] font-bold">{note}</span>
        </div>
        {isFallback && (
          <div className="mt-1 pt-1 border-t border-[#005522] flex flex-col gap-1">
            <span className="text-[8px] text-[#ffcc00] leading-tight">
              Controllo manuale attivo. Clicca sotto per richiedere l'accesso webcam:
            </span>
            <button
              onClick={() => {
                if (canvasRef.current) {
                  globalHandTracker.startWebcam(canvasRef.current).then((res) => {
                    setIsFallback(!res.success);
                    setStatus(globalHandTracker.statusMessage);
                  });
                }
              }}
              className="w-full py-1 bg-[#003318] hover:bg-[#00ff88] text-[#88ffaa] hover:text-black border border-[#00aa55] text-[8px] font-bold rounded transition-colors cursor-pointer"
            >
              🔄 RIPROVA PERMESSO WEBCAM
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
