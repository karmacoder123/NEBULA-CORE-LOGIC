/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState, useEffect } from 'react';
import { PENTATONIC_FREQS, NOTE_NAMES, globalPiano } from '../audio/pianoEngine.ts';
import { Music, ChevronUp, ChevronDown } from 'lucide-react';

interface PianoRibbonProps {
  activeNoteIdx: number | null;
}

export const PianoRibbon: React.FC<PianoRibbonProps> = ({ activeNoteIdx }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [flashingKey, setFlashingKey] = useState<number | null>(null);

  useEffect(() => {
    if (activeNoteIdx !== null) {
      setFlashingKey(activeNoteIdx);
      const timer = setTimeout(() => setFlashingKey(null), 250);
      return () => clearTimeout(timer);
    }
  }, [activeNoteIdx]);

  const handleKeyTouch = (idx: number, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    globalPiano.resume();
    globalPiano.playNote(PENTATONIC_FREQS[idx], 0.9);
    setFlashingKey(idx);
    setTimeout(() => setFlashingKey(null), 200);
  };

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-auto">
      {/* Mini Toggle tab */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 px-3 py-1 bg-[#03140a]/90 border-t border-x border-[#00aa55] rounded-t-lg text-[9.5px] font-mono font-bold text-[#00ff88] backdrop-blur-md cursor-pointer hover:bg-[#003318] transition-colors shadow-lg"
      >
        <Music className="w-3 h-3 text-[#00e5ff]" />
        <span>PIANO REVERB STRIP</span>
        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
      </button>

      {/* Keys ribbon */}
      {isExpanded && (
        <div className="bg-[#030d07]/95 border-t border-[#00aa55] px-2 py-1.5 backdrop-blur-xl shadow-2xl flex items-center justify-center gap-1 max-w-[98vw] overflow-x-auto">
          {PENTATONIC_FREQS.map((freq, idx) => {
            const isPlaying = flashingKey === idx || activeNoteIdx === idx;
            const isHighOctave = idx >= 10;
            const isMidOctave = idx >= 5 && idx < 10;

            return (
              <button
                key={idx}
                onMouseDown={(e) => handleKeyTouch(idx, e)}
                onTouchStart={(e) => handleKeyTouch(idx, e)}
                className={`flex flex-col items-center justify-between px-2 py-2 min-w-[38px] md:min-w-[44px] h-[58px] rounded-b-md transition-all font-mono text-[8.5px] cursor-pointer select-none active:scale-95 ${
                  isPlaying
                    ? 'bg-[#00ff88] text-[#020905] shadow-[0_0_18px_#00ff88] font-bold -translate-y-1'
                    : isHighOctave
                    ? 'bg-[#062414] text-[#aaffcc] hover:bg-[#0c4022] border-t-2 border-[#00e5ff]'
                    : isMidOctave
                    ? 'bg-[#041c10] text-[#88ffaa] hover:bg-[#09351c] border-t-2 border-[#00ff88]'
                    : 'bg-[#02130b] text-[#66cc88] hover:bg-[#062615] border-t-2 border-[#008844]'
                }`}
              >
                <span className="font-bold text-[9px]">{NOTE_NAMES[idx]}</span>
                <span className="text-[7.5px] opacity-70">{Math.round(freq)}Hz</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
