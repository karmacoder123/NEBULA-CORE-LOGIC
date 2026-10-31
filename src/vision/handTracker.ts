/**
 * @license
 * SPDX-License-Identifier: MIT
 */

export interface HandLandmark {
  x: number;
  y: number;
  z?: number;
}

export interface HandTrackingResult {
  isPresent: boolean;
  isClosed: boolean;
  landmarks: HandLandmark[];
  targetPos: { x: number; y: number; z: number };
  normX: number;
  normY: number;
}

export class HandTracker {
  private video: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isRunning = false;
  private animId: number | null = null;

  public isWebcamActive = false;
  public statusMessage = "OFF";
  public activeNote = "OFF";
  public fallbackPadActive = false;

  private prevFrameData: Uint8Array | null = null;
  private smoothedX = 0.5;
  private smoothedY = 0.5;
  private isClosedState = false;

  public onTrackingResult: ((res: HandTrackingResult) => void) | null = null;

  public async startWebcam(pipCanvas: HTMLCanvasElement): Promise<{ success: boolean; message: string }> {
    this.canvas = pipCanvas;
    this.ctx = pipCanvas.getContext('2d');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.activateFallback("Webcam non supportata o iframe senza permessi");
      return { success: false, message: "getUserMedia non disponibile nel contesto corrente" };
    }

    try {
      this.statusMessage = "AVVIO WEBCAM...";
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        });
      } catch (constraintErr) {
        console.warn("HandTracker: User-facing camera constraint failed, retrying with default video", constraintErr);
        // Fallback to basic unconstrained video for USB/external desktop webcams
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      this.stream = stream;
      this.video = document.createElement('video');
      this.video.setAttribute('playsinline', '');
      this.video.setAttribute('webkit-playsinline', '');
      this.video.muted = true;
      this.video.srcObject = stream;
      await this.video.play();

      this.isRunning = true;
      this.isWebcamActive = true;
      this.fallbackPadActive = false;
      this.statusMessage = "CERCO MANO...";

      this.runDetectionLoop();
      return { success: true, message: "Webcam attiva e funzionante" };
    } catch (err: unknown) {
      console.warn("HandTracker: camera start failed", err);
      const e = err as Error;
      let msg = "Errore videocamera";
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        msg = "Permesso negato: abilita la fotocamera nella barra URL";
      } else if (e.name === "NotFoundError" || e.name === "DevicesNotFoundError") {
        msg = "Nessuna fotocamera fisica rilevata";
      } else if (e.name === "NotReadableError" || e.name === "TrackStartError") {
        msg = "Webcam occupata da un'altra applicazione";
      } else {
        msg = e.message || "Accesso fotocamera non riuscito";
      }
      this.activateFallback(msg);
      return { success: false, message: msg };
    }
  }

  public activateFallback(reason: string) {
    this.isWebcamActive = false;
    this.fallbackPadActive = true;
    this.statusMessage = reason;
    this.drawFallbackPad();
  }

  public stopWebcam() {
    this.isRunning = false;
    this.isWebcamActive = false;
    this.fallbackPadActive = false;
    this.statusMessage = "OFF";

    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
      this.video = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  private runDetectionLoop = () => {
    if (!this.isRunning || !this.video || !this.ctx || !this.canvas) return;

    if (this.video.readyState >= 2) {
      const cw = this.canvas.width;
      const ch = this.canvas.height;

      // Draw mirrored video frame
      this.ctx.save();
      this.ctx.scale(-1, 1);
      this.ctx.drawImage(this.video, -cw, 0, cw, ch);
      this.ctx.restore();

      // Optical Difference & Brightness Hand Detection (ultra-resilient, no external WASM crash)
      const frame = this.ctx.getImageData(0, 0, cw, ch);
      const data = frame.data;
      let motionX = 0, motionY = 0, motionCount = 0;
      let skinCount = 0, skinX = 0, skinY = 0;

      if (!this.prevFrameData || this.prevFrameData.length !== data.length) {
        this.prevFrameData = new Uint8Array(data.length);
      }

      for (let i = 0; i < data.length; i += 16) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const pr = this.prevFrameData[i], pg = this.prevFrameData[i + 1], pb = this.prevFrameData[i + 2];

        const diff = Math.abs(r - pr) + Math.abs(g - pg) + Math.abs(b - pb);
        const px = ((i / 4) % cw);
        const py = Math.floor((i / 4) / cw);

        // Motion detection
        if (diff > 45) {
          motionX += px;
          motionY += py;
          motionCount++;
        }

        // Skin tone heuristic detection
        if (r > 60 && g > 40 && b > 20 && r > g && r > b && (r - g) > 10 && (r - b) > 15) {
          skinX += px;
          skinY += py;
          skinCount++;
        }

        this.prevFrameData[i] = r;
        this.prevFrameData[i + 1] = g;
        this.prevFrameData[i + 2] = b;
      }

      const isPresent = (skinCount > 40 || motionCount > 30);
      let targetX = 0.5, targetY = 0.5;

      if (isPresent) {
        // Weighted blend between motion and skin center
        const weightSkin = skinCount > 0 ? 0.65 : 0;
        const weightMotion = motionCount > 0 ? 0.35 : 0;
        const totalW = weightSkin + weightMotion || 1;

        const avgX = ((skinCount ? (skinX / skinCount) : 0) * weightSkin +
                      (motionCount ? (motionX / motionCount) : 0) * weightMotion) / totalW;
        const avgY = ((skinCount ? (skinY / skinCount) : 0) * weightSkin +
                      (motionCount ? (motionY / motionCount) : 0) * weightMotion) / totalW;

        // Invert X because of mirroring
        targetX = 1.0 - (avgX / cw);
        targetY = avgY / ch;

        // Smooth
        this.smoothedX += (targetX - this.smoothedX) * 0.3;
        this.smoothedY += (targetY - this.smoothedY) * 0.3;

        // Pinch / closed detection based on density concentration
        this.isClosedState = (skinCount > 0 && (motionCount / skinCount) < 0.25);
        this.statusMessage = this.isClosedState ? "LOCKED: PULL [CHIUSO]" : "LOCKED: PUSH [APERTO]";
      } else {
        this.statusMessage = "CERCO MANO...";
      }

      // Draw Hand Skeleton Landmarks onto PiP canvas
      if (isPresent) {
        this.drawSkeletonLandmarks(this.smoothedX, this.smoothedY, this.isClosedState, cw, ch);
      }

      // Dispatch to particle simulation & piano
      if (this.onTrackingResult) {
        const aspect = window.innerWidth / window.innerHeight;
        this.onTrackingResult({
          isPresent,
          isClosed: this.isClosedState,
          landmarks: isPresent ? this.generateSyntheticLandmarks(this.smoothedX, this.smoothedY, this.isClosedState) : [],
          targetPos: {
            x: -(this.smoothedX - 0.5) * 1200 * aspect,
            y: -(this.smoothedY - 0.5) * 900,
            z: 0
          },
          normX: this.smoothedX,
          normY: this.smoothedY
        });
      }
    }

    this.animId = requestAnimationFrame(this.runDetectionLoop);
  };

  private drawSkeletonLandmarks(normX: number, normY: number, isClosed: boolean, cw: number, ch: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    // Mirrored display for user preview
    const px = (1.0 - normX) * cw;
    const py = normY * ch;

    const baseColor = isClosed ? '#ff00aa' : '#00ff88';
    const accentColor = '#00e5ff';

    ctx.save();
    // Palm Center
    ctx.beginPath();
    ctx.arc(px, py, isClosed ? 10 : 8, 0, Math.PI * 2);
    ctx.fillStyle = baseColor;
    ctx.shadowColor = baseColor;
    ctx.shadowBlur = 10;
    ctx.fill();

    // Finger Radii rays (5 bones)
    const angles = [-0.65, -0.32, 0.0, 0.32, 0.65];
    const fingerLength = isClosed ? 14 : 26;

    for (let f = 0; f < angles.length; f++) {
      const a = angles[f] - Math.PI / 2;
      const fx = px + Math.cos(a) * fingerLength;
      const fy = py + Math.sin(a) * fingerLength;

      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(fx, fy);
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Fingertip Node
      ctx.beginPath();
      ctx.arc(fx, fy, isClosed ? 3 : 4, 0, Math.PI * 2);
      ctx.fillStyle = accentColor;
      ctx.fill();
    }
    ctx.restore();
  }

  private generateSyntheticLandmarks(normX: number, normY: number, isClosed: boolean): HandLandmark[] {
    const list: HandLandmark[] = [];
    list.push({ x: normX, y: normY, z: 0 }); // 0: Wrist / Palm
    const spread = isClosed ? 0.03 : 0.08;
    for (let i = 0; i < 5; i++) {
      const ang = (i - 2) * 0.25;
      list.push({
        x: normX + Math.sin(ang) * spread,
        y: normY - Math.cos(ang) * spread,
        z: 0
      });
    }
    return list;
  }

  public handlePadPointer(clientX: number, clientY: number, isDown: boolean, padRect: DOMRect) {
    const px = Math.max(0, Math.min(1, (clientX - padRect.left) / padRect.width));
    const py = Math.max(0, Math.min(1, (clientY - padRect.top) / padRect.height));

    this.smoothedX = px;
    this.smoothedY = py;
    this.isClosedState = isDown;
    this.statusMessage = isDown ? "PAD: PULL [CHIUSO]" : "PAD: PUSH [APERTO]";

    if (this.onTrackingResult) {
      const aspect = window.innerWidth / window.innerHeight;
      this.onTrackingResult({
        isPresent: true,
        isClosed: isDown,
        landmarks: this.generateSyntheticLandmarks(px, py, isDown),
        targetPos: {
          x: -(px - 0.5) * 1200 * aspect,
          y: -(py - 0.5) * 900,
          z: 0
        },
        normX: px,
        normY: py
      });
    }
  }

  public drawFallbackPad() {
    if (!this.ctx || !this.canvas) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.fillStyle = "#03120a";
    this.ctx.fillRect(0, 0, w, h);

    this.ctx.strokeStyle = "#00aa55";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(4, 4, w - 8, h - 8);

    this.ctx.fillStyle = "#00ff88";
    this.ctx.font = "bold 9px monospace";
    this.ctx.textAlign = "center";
    this.ctx.fillText("🎹 PAD TOUCH / MOUSE", w / 2, h / 2 - 6);

    this.ctx.fillStyle = "#88ffaa";
    this.ctx.font = "8px monospace";
    this.ctx.fillText("Trascina per suonare", w / 2, h / 2 + 8);
  }
}

export const globalHandTracker = new HandTracker();
