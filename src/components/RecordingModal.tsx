/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState } from 'react';
import { RecordedSession, VideoRecorder } from '../utils/videoRecorder.ts';
import { Share2, Download, Check, X, Film } from 'lucide-react';

interface RecordingModalProps {
  session: RecordedSession | null;
  onClose: () => void;
}

export const RecordingModal: React.FC<RecordingModalProps> = ({ session, onClose }) => {
  const [shared, setShared] = useState(false);

  if (!session) return null;

  const handleShare = async () => {
    const success = await VideoRecorder.shareToSocial(session);
    if (success) {
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    }
  };

  const handleDownload = () => {
    VideoRecorder.downloadSession(session);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-[#05150d] border border-[#00ff88] rounded-2xl p-5 max-w-md w-full text-[#88ffaa] font-mono shadow-[0_0_50px_rgba(0,255,136,0.3)] flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#005522] pb-3">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-[#00ff88]" />
            <span className="text-[#00e5ff] font-bold text-sm">Sessione Video Registrata</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#66aa88] hover:text-white p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player */}
        <div className="rounded-xl overflow-hidden border border-[#005522] bg-black aspect-video flex items-center justify-center">
          <video
            src={session.url}
            controls
            autoPlay
            loop
            playsInline
            className="w-full h-full object-contain"
          />
        </div>

        {/* Info meta */}
        <div className="flex items-center justify-between text-xs text-[#88ffaa]">
          <span>Durata: <b className="text-white">{session.durationSeconds.toFixed(1)}s</b></span>
          <span>Formato: <b className="text-[#00e5ff]">{session.mimeType.split(';')[0]}</b></span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleShare}
            className="w-full py-3 bg-gradient-to-r from-[#00ff88] to-[#00e5ff] text-[#020905] font-extrabold rounded-xl flex items-center justify-center gap-2 hover:opacity-95 shadow-[0_0_20px_rgba(0,255,136,0.5)] cursor-pointer transition-all active:scale-[0.98]"
          >
            {shared ? <Check className="w-4 h-4 text-[#020905]" /> : <Share2 className="w-4 h-4 text-[#020905]" />}
            <span>CONDIVIDI SU INSTAGRAM / TIKTOK</span>
          </button>

          <button
            onClick={handleDownload}
            className="w-full py-2.5 bg-[#002211] border border-[#00aa55] text-[#00ff88] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#003318] transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>SCARICA FILE VIDEO (GALLERIA)</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="text-center text-xs text-[#66aa88] hover:text-white pt-1 cursor-pointer"
        >
          ✕ Chiudi e torna al simulatore
        </button>
      </div>
    </div>
  );
};
