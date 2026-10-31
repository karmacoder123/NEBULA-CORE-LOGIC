/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { globalPiano } from '../audio/pianoEngine.ts';

export interface RecordedSession {
  blob: Blob;
  url: string;
  durationSeconds: number;
  mimeType: string;
}

export class VideoRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private startTime = 0;
  public isRecording = false;

  public startRecording(canvas: HTMLCanvasElement): boolean {
    if (this.isRecording) return false;
    this.recordedChunks = [];

    try {
      const fps = 60;
      const canvasStream = canvas.captureStream ? canvas.captureStream(fps) : (canvas as unknown as { mozCaptureStream: (f: number) => MediaStream }).mozCaptureStream(fps);

      // Mux audio destination node from piano engine
      const audioNode = globalPiano.getAudioDestinationNode();
      if (audioNode && audioNode.context && 'createMediaStreamDestination' in audioNode.context) {
        try {
          const audioDest = (audioNode.context as AudioContext).createMediaStreamDestination();
          audioNode.connect(audioDest);
          const audioTracks = audioDest.stream.getAudioTracks();
          if (audioTracks.length > 0) {
            canvasStream.addTrack(audioTracks[0]);
          }
        } catch (e) {
          console.warn("VideoRecorder: audio track muxing skipped", e);
        }
      }

      // Check supported mime types prioritizing MP4 for Instagram/TikTok compatibility
      let mimeType = 'video/webm;codecs=vp9';
      if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E,mp4a.40.2')) {
        mimeType = 'video/mp4;codecs=avc1.42E01E,mp4a.40.2';
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
        mimeType = 'video/webm;codecs=vp8,opus';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        mimeType = 'video/webm';
      }

      this.mediaRecorder = new MediaRecorder(canvasStream, {
        mimeType,
        videoBitsPerSecond: 8000000 // 8 Mbps high quality
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(200); // 200ms slices
      this.isRecording = true;
      this.startTime = performance.now();
      return true;
    } catch (err) {
      console.error("VideoRecorder start failed:", err);
      this.isRecording = false;
      return false;
    }
  }

  public stopRecording(): Promise<RecordedSession> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        return reject(new Error("No active recording session"));
      }

      const duration = (performance.now() - this.startTime) / 1000;

      this.mediaRecorder.onstop = () => {
        const mime = this.mediaRecorder?.mimeType || 'video/webm';
        const blob = new Blob(this.recordedChunks, { type: mime });
        const url = URL.createObjectURL(blob);
        this.isRecording = false;
        resolve({
          blob,
          url,
          durationSeconds: duration,
          mimeType: mime
        });
      };

      this.mediaRecorder.stop();
    });
  }

  public static async shareToSocial(session: RecordedSession, title = "Nebula Core Particle Symphony"): Promise<boolean> {
    const ext = session.mimeType.includes('mp4') ? 'mp4' : 'webm';
    const filename = `NebulaCore_${Date.now()}.${ext}`;
    const file = new File([session.blob], filename, { type: session.mimeType });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title,
          text: "Esperienza generativa particellare #NebulaCore #CreativeCoding #ThreeJS #Synth"
        });
        return true;
      } catch (e: unknown) {
        if ((e as Error).name !== 'AbortError') {
          console.warn("Web Share API error, falling back to download", e);
        }
      }
    }

    // Direct download fallback
    VideoRecorder.downloadSession(session, filename);
    return false;
  }

  public static downloadSession(session: RecordedSession, filename?: string) {
    const ext = session.mimeType.includes('mp4') ? 'mp4' : 'webm';
    const name = filename || `NebulaCore_Session_${Date.now()}.${ext}`;
    const a = document.createElement('a');
    a.href = session.url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

export const globalVideoRecorder = new VideoRecorder();
