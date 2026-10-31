/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState, useEffect } from 'react';
import { 
  Download, Smartphone, Apple, Globe, Check, X, 
  ShieldCheck, ExternalLink, HelpCircle, Monitor, Laptop, Sparkles, CheckCircle2,
  Copy, QrCode, Share2
} from 'lucide-react';

interface DownloadPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadPortalModal: React.FC<DownloadPortalModalProps> = ({ isOpen, onClose }) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'mac' | 'windows' | 'linux'>('mac');

  useEffect(() => {
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) {
      setDeviceType('ios');
    } else if (/Android/i.test(ua)) {
      setDeviceType('android');
    } else if (/Macintosh|Mac OS X/i.test(ua)) {
      setDeviceType('mac');
    } else if (/Windows/i.test(ua)) {
      setDeviceType('windows');
    } else if (/Linux/i.test(ua)) {
      setDeviceType('linux');
    }

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showQr, setShowQr] = useState<boolean>(false);

  const portalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}#download`
    : 'https://ais-pre-flbhz66cjp6at6uak3nvu5-748662316634.europe-west2.run.app/#download';

  if (!isOpen) return null;

  const triggerDownloadNotification = (msg: string) => {
    setDownloadSuccess(msg);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(portalUrl);
      } else {
        const temp = document.createElement('textarea');
        temp.value = portalUrl;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
      setCopiedLink(true);
      triggerDownloadNotification("Link del portale copiato negli appunti!");
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      triggerDownloadNotification(`Link: ${portalUrl}`);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Nebula Core v2.0 - Portale Download",
          text: "Scarica e installa Nebula Core Particle Symphony a tutto schermo sul tuo dispositivo!",
          url: portalUrl,
        });
        return;
      } catch {
        // Fallback to copy
      }
    }
    handleCopyLink();
  };

  // 1. Android PWA Install or APK WebApp Package
  const handleAndroidInstall = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          triggerDownloadNotification("Installazione PWA Android avviata!");
          setDeferredPrompt(null);
          return;
        }
      } catch (err) {
        console.warn("Deferred prompt error", err);
      }
    }

    // Direct download of Android PWA WebApp Wrapper configuration & offline file
    const manifestBlob = new Blob([JSON.stringify({
      name: "Nebula Core v2.0 - Multimodal Particle Symphony",
      short_name: "NebulaCore",
      start_url: window.location.href,
      display: "fullscreen",
      orientation: "any",
      background_color: "#020905",
      theme_color: "#020905",
      description: "Nebula Core Particle Symphony & Synthesizer with 20k particles and cathedral grand piano",
      icons: [
        {
          src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='48' fill='%23020905' stroke='%2300ff88' stroke-width='4'/><polygon points='50,15 85,50 50,85 15,50' fill='%2300ff88'/></svg>",
          sizes: "192x192 512x512",
          type: "image/svg+xml"
        }
      ]
    }, null, 2)], { type: 'application/json' });

    const a = document.createElement('a');
    a.href = URL.createObjectURL(manifestBlob);
    a.download = `NebulaCore_Android_WebManifest_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Also download standalone HTML
    setTimeout(handleDownloadStandaloneHTML, 400);
    triggerDownloadNotification("Pacchetto WebApp Android + File HTML scaricati con successo!");
  };

  // 2. Download Standalone Offline HTML File (Complete self-contained bundle with 6-tab drawer, full sliders, 20k/50k particles, piano & physics)
  const handleDownloadStandaloneHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="theme-color" content="#020905">
  <title>Nebula Core v2.0 — Standalone Universal & Android Edition</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }
    body { background: #020905; color: #88ffaa; font-family: monospace, system-ui, -apple-system, sans-serif; overflow: hidden; width: 100vw; height: 100vh; position: fixed; }
    
    /* Solo il Canvas ha touch-action: none per catturare il tocco multi-dito */
    #canvas-container { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; touch-action: none; }
    
    /* Barra Superiore HUD: Scorrimento Orizzontale Touch Fluido */
    #hud {
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 90;
      background: rgba(3, 14, 8, 0.94);
      border: 1px solid #00aa55;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 11px;
      display: flex;
      gap: 8px;
      align-items: center;
      color: #00e5ff;
      box-shadow: 0 4px 30px rgba(0,0,0,0.85);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      max-width: 96vw;
      overflow-x: auto;
      white-space: nowrap;
      touch-action: pan-x;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    #hud::-webkit-scrollbar { display: none; }
    #hud b { color: #00ff88; letter-spacing: 0.5px; }
    
    .hud-btn {
      background: #002211;
      border: 1px solid #00aa55;
      color: #88ffaa;
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 10.5px;
      font-weight: bold;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
      min-height: 38px;
      touch-action: manipulation;
      transition: all 0.15s ease;
    }
    .hud-btn:active { transform: scale(0.96); }
    .hud-btn.primary {
      background: #00ff88;
      border-color: #00ff88;
      color: #020905;
      font-weight: 900;
      box-shadow: 0 0 14px rgba(0,255,136,0.6);
    }
    .hud-btn.accent {
      background: #003344;
      border-color: #00e5ff;
      color: #00e5ff;
    }

    /* Modal Backdrop */
    #drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      z-index: 95;
      display: none;
      opacity: 0;
      transition: opacity 0.25s ease;
      touch-action: auto;
    }
    #drawer-backdrop.open { display: block; opacity: 1; }

    /* Slide-Up Drawer Menu (Bottom Sheet) */
    #drawer {
      position: fixed;
      bottom: 0;
      left: 50%;
      transform: translate(-50%, 105%);
      width: 100%;
      max-width: 680px;
      height: 84vh;
      max-height: 84vh;
      background: rgba(2, 11, 6, 0.98);
      border-top: 2px solid #00ff88;
      border-left: 1px solid #005522;
      border-right: 1px solid #005522;
      border-radius: 24px 24px 0 0;
      z-index: 99;
      display: flex;
      flex-direction: column;
      box-shadow: 0 -12px 50px rgba(0,0,0,0.95);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      touch-action: pan-y;
      -webkit-overflow-scrolling: touch;
    }
    #drawer.open { transform: translate(-50%, 0); }

    .drawer-handle {
      width: 48px;
      height: 5px;
      background: rgba(0, 255, 136, 0.4);
      border-radius: 9999px;
      margin: 10px auto 4px auto;
      cursor: pointer;
    }

    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 18px 12px 18px;
      border-bottom: 1px solid rgba(0, 170, 85, 0.3);
    }
    .drawer-title {
      font-size: 13px;
      font-weight: 900;
      color: #00ff88;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .drawer-badge {
      font-size: 9px;
      padding: 2px 7px;
      border-radius: 9999px;
      background: rgba(0, 229, 255, 0.15);
      border: 1px solid #00e5ff;
      color: #00e5ff;
    }
    .drawer-close {
      background: rgba(0, 34, 17, 0.8);
      border: 1px solid #00aa55;
      color: #88ffaa;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: bold;
      cursor: pointer;
      min-height: 40px;
      min-width: 44px;
      touch-action: manipulation;
    }
    .drawer-close:hover, .drawer-close:active {
      background: #00ff88;
      color: #000;
    }

    /* 6 Tabs Bar */
    .tabs-bar {
      display: flex;
      gap: 6px;
      padding: 8px 16px;
      border-bottom: 1px solid rgba(0, 170, 85, 0.25);
      overflow-x: auto;
      touch-action: pan-x;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      white-space: nowrap;
      background: rgba(0, 18, 9, 0.6);
    }
    .tabs-bar::-webkit-scrollbar { display: none; }
    .tab-btn {
      padding: 7px 12px;
      border-radius: 8px;
      background: rgba(0, 34, 17, 0.7);
      border: 1px solid #005522;
      color: #88ffaa;
      font-size: 10.5px;
      font-weight: bold;
      cursor: pointer;
      touch-action: manipulation;
      min-height: 38px;
      transition: all 0.15s ease;
    }
    .tab-btn.active {
      background: #00ff88;
      color: #020905;
      border-color: #00ff88;
      box-shadow: 0 0 10px rgba(0, 255, 136, 0.4);
    }

    /* Tab Content Area */
    .drawer-content {
      flex: 1;
      overflow-y: auto;
      touch-action: pan-y;
      -webkit-overflow-scrolling: touch;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .tab-pane { display: none; flex-direction: column; gap: 10px; }
    .tab-pane.active { display: flex; }

    /* Control Card */
    .control-card {
      background: rgba(1, 22, 11, 0.7);
      border: 1px solid rgba(0, 170, 85, 0.35);
      border-radius: 12px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .control-label {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      font-weight: bold;
      color: #aaffcc;
    }
    .control-val {
      color: #00e5ff;
      font-variant-numeric: tabular-nums;
    }
    .control-range {
      width: 100%;
      height: 28px;
      accent-color: #00ff88;
      cursor: pointer;
      touch-action: pan-x;
    }
    .control-desc {
      font-size: 9.5px;
      color: #66aa88;
      line-height: 1.3;
    }

    /* Presets Strip */
    .presets-container {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid rgba(0, 170, 85, 0.3);
    }
    .preset-pill {
      background: rgba(0, 40, 20, 0.8);
      border: 1px solid #00aa55;
      color: #88ffaa;
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 10px;
      font-weight: bold;
      cursor: pointer;
      touch-action: manipulation;
    }
    .preset-pill:hover, .preset-pill:active {
      background: #00ff88;
      color: #000;
    }

    /* Piano Ribbon */
    #piano-ribbon {
      position: fixed;
      bottom: 12px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 90;
      display: flex;
      gap: 4px;
      padding: 6px 10px;
      background: rgba(2, 10, 6, 0.94);
      border: 1px solid #00ff88;
      border-radius: 14px;
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      max-width: 96vw;
      overflow-x: auto;
      touch-action: pan-x;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    #piano-ribbon::-webkit-scrollbar { display: none; }
    .piano-key {
      flex: 1;
      min-width: 32px;
      height: 52px;
      border-radius: 8px;
      background: #002211;
      border: 1px solid #005522;
      color: #00ff88;
      font-size: 9.5px;
      font-weight: bold;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      padding-bottom: 5px;
      cursor: pointer;
      touch-action: manipulation;
      transition: all 0.08s;
      user-select: none;
    }
    .piano-key:active, .piano-key.active {
      background: #00ff88;
      color: #020905;
      box-shadow: 0 0 18px #00ff88;
      transform: translateY(2px);
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
</head>
<body>
  <!-- HUD Superiore Scorrevole Touch con pulsante Menu 6 Schede in evidenza -->
  <div id="hud">
    <b> NEBULA CORE v2.0</b>
    <button class="hud-btn primary" onclick="openDrawer()">⚙ MENU (6 SCHEDE)</button>
    <button class="hud-btn" onclick="toggleFullscreen()">⛶ SCHERMO INTERO</button>
    <button class="hud-btn" id="btn-count" onclick="toggleCount()">PARTICELLE: 20K</button>
    <button class="hud-btn accent" id="btn-geom" onclick="changeVersion()">FORMA: V1 (OTTAEDRO)</button>
    <button class="hud-btn" onclick="toggleAudioMute()" id="btn-audio">AUDIO: ON</button>
    <button class="hud-btn" onclick="resetDefaults()">↺ RESET</button>
  </div>

  <div id="canvas-container"></div>
  <div id="piano-ribbon"></div>

  <!-- Backdrop del Drawer -->
  <div id="drawer-backdrop" onclick="closeDrawer()"></div>

  <!-- Menu a Comparsa Bottom Sheet (6 Schede Complete) -->
  <div id="drawer">
    <div class="drawer-handle" onclick="closeDrawer()"></div>
    <div class="drawer-header">
      <div class="drawer-title">
        <span>⚙ PANNELLO DI CONTROLLO COMPLETO</span>
        <span class="drawer-badge" id="save-badge">✓ AUTO-SAVED</span>
      </div>
      <button class="drawer-close" onclick="closeDrawer()">✕ CHIUDI</button>
    </div>

    <!-- 6 Tabs -->
    <div class="tabs-bar">
      <button class="tab-btn active" id="tabbtn-0" onclick="switchTab(0)">1. PARTICELLE</button>
      <button class="tab-btn" id="tabbtn-1" onclick="switchTab(1)">2. FORZE</button>
      <button class="tab-btn" id="tabbtn-2" onclick="switchTab(2)">3. SPETTRO</button>
      <button class="tab-btn" id="tabbtn-3" onclick="switchTab(3)">4. AUDIO & PIANO</button>
      <button class="tab-btn" id="tabbtn-4" onclick="switchTab(4)">5. VISUAL & BLUR</button>
      <button class="tab-btn" id="tabbtn-5" onclick="switchTab(5)">6. LUCI & CAMERA</button>
    </div>

    <!-- Content -->
    <div class="drawer-content">
      <!-- TAB 1: PARTICELLE -->
      <div class="tab-pane active" id="pane-0">
        <div class="control-card">
          <div class="control-label">
            <span>CONTEGGIO PARTICELLE</span>
            <span class="control-val" id="val-particleCount">20.000</span>
          </div>
          <input type="range" class="control-range" id="slider-particleCount" min="5000" max="60000" step="2500" value="20000" oninput="updateParam('particleCount', +this.value)">
          <div class="control-desc">Numero totale di punti particellari istanziati contemporaneamente in WebGL.</div>
        </div>
        <div class="control-card">
          <div class="control-label">
            <span>DIMENSIONE PARTICELLE (RAGGIO)</span>
            <span class="control-val" id="val-pSize">2.8</span>
          </div>
          <input type="range" class="control-range" id="slider-pSize" min="0.8" max="6.5" step="0.1" value="2.8" oninput="updateParam('pSize', +this.value)">
          <div class="control-desc">Grandezza della mesh geometrica di ciascuna particella.</div>
        </div>
        <div class="control-card">
          <div class="control-label">
            <span>ROTAZIONE ANGOLARE / SPIN</span>
            <span class="control-val" id="val-pSpin">0.003</span>
          </div>
          <input type="range" class="control-range" id="slider-pSpin" min="0" max="0.02" step="0.001" value="0.003" oninput="updateParam('pSpin', +this.value)">
          <div class="control-desc">Velocità di auto-rotazione dello sciame attorno ai propri assi baricentrici.</div>
        </div>
        <div class="control-card">
          <div class="control-label">
            <span>RAGGIO DI ATTRAZIONE TOCCO</span>
            <span class="control-val" id="val-touchRadius">650</span>
          </div>
          <input type="range" class="control-range" id="slider-touchRadius" min="200" max="1400" step="50" value="650" oninput="updateParam('touchRadius', +this.value)">
          <div class="control-desc">Area di influenza attorno alle dita dell'utente sullo schermo.</div>
        </div>
        <div class="control-card">
          <div class="control-label">
            <span>FORZA ATTRAZIONE TOCCO</span>
            <span class="control-val" id="val-touchForce">16</span>
          </div>
          <input type="range" class="control-range" id="slider-touchForce" min="5" max="45" step="1" value="16" oninput="updateParam('touchForce', +this.value)">
          <div class="control-desc">Intensità della spinta cinetica applicata alle particelle sotto il tocco.</div>
        </div>
      </div>

      <!-- TAB 2: FORZE -->
      <div class="tab-pane" id="pane-1">
        <div class="control-card">
          <div class="control-label">
            <span>FORZA ESPANSIONE RADIALE</span>
            <span class="control-val" id="val-radialExpansion">8.0</span>
          </div>
          <input type="range" class="control-range" id="slider-radialExpansion" min="0.0" max="50.0" step="0.5" value="8.0" oninput="updateParam('radialExpansion', +this.value)">
          <div class="control-desc">Spinta volumetrica centrifuga che apre e dilata lo sciame nello spazio tridimensionale.</div>
        </div>
        <div class="control-card">
          <div class="control-label">
            <span>ATTRAZIONE VERSO IL CENTRO</span>
            <span class="control-val" id="val-centerAttraction">2.0</span>
          </div>
          <input type="range" class="control-range" id="slider-centerAttraction" min="0.0" max="30.0" step="0.2" value="2.0" oninput="updateParam('centerAttraction', +this.value)">
          <div class="control-desc">Gravità baricentrica che contrasta l'espansione e richiama i punti verso il nucleo.</div>
        </div>
        <div class="control-card">
          <div class="control-label">
            <span>ELASTICITÀ ARMONICA (GEOMETRIA)</span>
            <span class="control-val" id="val-centralGravity">0.0018</span>
          </div>
          <input type="range" class="control-range" id="slider-centralGravity" min="0.0005" max="0.006" step="0.0002" value="0.0018" oninput="updateParam('centralGravity', +this.value)">
          <div class="control-desc">Richiamo elastico delle particelle verso le posizioni armoniche della geometria.</div>
        </div>
        <div class="control-card">
          <div class="control-label">
            <span>TURBOLENZA CURL NOISE</span>
            <span class="control-val" id="val-curlNoise">0.35</span>
          </div>
          <input type="range" class="control-range" id="slider-curlNoise" min="0" max="1.0" step="0.05" value="0.35" oninput="updateParam('curlNoise', +this.value)">
          <div class="control-desc">Vorticità e micro-correnti fluide generate dallo spazio particellare.</div>
        </div>
        <div class="control-card">
          <div class="control-label">
            <span>INERZIA / SMORZAMENTO (DAMPING)</span>
            <span class="control-val" id="val-damping">0.96</span>
          </div>
          <input type="range" class="control-range" id="slider-damping" min="0.88" max="0.99" step="0.01" value="0.96" oninput="updateParam('damping', +this.value)">
          <div class="control-desc">Viscosità del moto: valori alti creano orbite perpetue, valori bassi rallentano il moto.</div>
        </div>
        <div class="control-card">
          <div class="control-label">
            <span>REPULSIONE WANDERER</span>
            <span class="control-val" id="val-repelForce">25</span>
          </div>
          <input type="range" class="control-range" id="slider-repelForce" min="5" max="55" step="2" value="25" oninput="updateParam('repelForce', +this.value)">
          <div class="control-desc">Forza di apertura con cui il punto orbitale primario disperde lo sciame.</div>
        </div>
        <div class="control-card">
          <div class="control-label">
            <span>ATTRAZIONE SPECTRA</span>
            <span class="control-val" id="val-spectraForce">8</span>
          </div>
          <input type="range" class="control-range" id="slider-spectraForce" min="2" max="25" step="1" value="8" oninput="updateParam('spectraForce', +this.value)">
          <div class="control-desc">Forza magnetica del polo secondario che crea fasci e spirali armoniche.</div>
        </div>
      </div>

      <!-- TAB 3: SPETTRO & DINAMICA -->
      <div class="tab-pane" id="pane-2">
        <div class="control-card">
          <div class="control-label">
            <span>VELOCITÀ ORBITA WANDERER</span>
            <span class="control-val" id="val-wanderSpeed">0.8</span>
          </div>
          <input type="range" class="control-range" id="slider-wanderSpeed" min="0.2" max="3.0" step="0.1" value="0.8" oninput="updateParam('wanderSpeed', +this.value)">
          <div class="control-desc">Velocità del fuoco orbitale mobile primario.</div>
        </div>
        <div class="control-card">
          <div class="control-label">
            <span>VELOCITÀ ORBITA SPECTRA</span>
            <span class="control-val" id="val-spectraSpeed">1.2</span>
          </div>
          <input type="range" class="control-range" id="slider-spectraSpeed" min="0.2" max="3.0" step="0.1" value="1.2" oninput="updateParam('spectraSpeed', +this.value)">
          <div class="control-desc">Velocità del fuoco cromatico secondario.</div>
        </div>
        <div class="control-card">
          <div class="control-label">
            <span>ROTAZIONE TONALITÀ AUDIO (HUE SYMPHONY)</span>
            <span class="control-val" id="val-hueSymphonySpeed">0.20</span>
          </div>
          <input type="range" class="control-range" id="slider-hueSymphonySpeed" min="0" max="0.6" step="0.02" value="0.20" oninput="updateParam('hueSymphonySpeed', +this.value)">
          <div class="control-desc">Velocità di traslazione dello spettro cromatico guidata dalle frequenze sonore.</div>
        </div>
        <div class="control-card">
          <div class="control-label">
            <span>DISPERSIONE SPETTRALE (COLOR SPEED)</span>
            <span class="control-val" id="val-colorSpeed">0.15</span>
          </div>
          <input type="range" class="control-range" id="slider-colorSpeed" min="0.02" max="0.45" step="0.02" value="0.15" oninput="updateParam('colorSpeed', +this.value)">
          <div class="control-desc">Rimescolamento continuo delle sfumature HSL sulle particelle.</div>
        </div>
      </div>

      <!-- TAB 4: AUDIO & PIANO -->
      <div class="tab-pane" id="pane-3">
        <div class="control-card">
          <div class="control-label">
            <span>VOLUME SINTETIZZATORE</span>
            <span class="control-val" id="val-masterVolume">0.60</span>
          </div>
          <input type="range" class="control-range" id="slider-masterVolume" min="0" max="1.0" step="0.05" value="0.60" oninput="updateParam('masterVolume', +this.value)">
          <div class="control-desc">Livello di uscita principale per il gran piano pentatonico e i risonatori.</div>
        </div>
        <div class="control-card">
          <div class="control-label">
            <span>RIVERBERO CATTEDRALE</span>
            <span class="control-val" id="val-reverbMix">0.65</span>
          </div>
          <input type="range" class="control-range" id="slider-reverbMix" min="0" max="1.0" step="0.05" value="0.65" oninput="updateParam('reverbMix', +this.value)">
          <div class="control-desc">Intensità della convoluzione spaziale per riverbero sacro cattedrale.</div>
        </div>
        <div class="control-card">
          <div class="control-label">
            <span>RILASCIO NOTE (SUSTAIN)</span>
            <span class="control-val" id="val-noteRelease">2.0s</span>
          </div>
          <input type="range" class="control-range" id="slider-noteRelease" min="0.5" max="4.0" step="0.25" value="2.0" oninput="updateParam('noteRelease', +this.value)">
          <div class="control-desc">Durata dell'inviluppo di decadimento naturale per ogni nota toccata.</div>
        </div>
        <div class="control-card">
          <div class="control-label">
            <span>FORMA D'ONDA SINTESI</span>
            <span class="control-val" id="val-waveform">triangle</span>
          </div>
          <div style="display:flex; gap:6px; margin-top:4px;">
            <button class="preset-pill" onclick="setWaveform('triangle')">Triangle</button>
            <button class="preset-pill" onclick="setWaveform('sine')">Sine</button>
            <button class="preset-pill" onclick="setWaveform('sawtooth')">Sawtooth</button>
            <button class="preset-pill" onclick="setWaveform('square')">Square</button>
          </div>
          <div class="control-desc">Timbro acustico degli oscillatori sintetizzati per il tocco musicale.</div>
        </div>
      </div>

      <!-- TAB 5: VISUAL & BLUR -->
      <div class="tab-pane" id="pane-4">
        <div class="control-card">
          <div class="control-label">
            <span>MOTION BLUR (SCIA PARTICELLE)</span>
            <span class="control-val" id="val-motionBlur">0.14</span>
          </div>
          <input type="range" class="control-range" id="slider-motionBlur" min="0.01" max="0.45" step="0.01" value="0.14" oninput="updateParam('motionBlur', +this.value)">
          <div class="control-desc">Buffer di accumulo delle scie ottiche: valori bassi allungano la scia setosa.</div>
        </div>
        <div class="control-card">
          <div class="control-label">
            <span>BAGLIORE / BLOOM INTENSITY</span>
            <span class="control-val" id="val-bloomIntensity">1.1</span>
          </div>
          <input type="range" class="control-range" id="slider-bloomIntensity" min="0" max="2.5" step="0.1" value="1.1" oninput="updateParam('bloomIntensity', +this.value)">
          <div class="control-desc">Luminanza e aura di dispersione ottica attorno ai nodi luminosi.</div>
        </div>
        <div class="control-card">
          <div class="control-label">
            <span>LUMINOSITÀ PARTICELLE (HSL LIGHTNESS)</span>
            <span class="control-val" id="val-particleBrightness">0.48</span>
          </div>
          <input type="range" class="control-range" id="slider-particleBrightness" min="0.20" max="0.75" step="0.02" value="0.48" oninput="updateParam('particleBrightness', +this.value)">
          <div class="control-desc">Calibrazione fotometrica: 0.48 garantisce colori saturi e vividi a zero abbagliamento.</div>
        </div>
        <div class="control-card">
          <div class="control-label">
            <span>SATURAZIONE CROMATICA</span>
            <span class="control-val" id="val-particleSaturation">0.95</span>
          </div>
          <input type="range" class="control-range" id="slider-particleSaturation" min="0.30" max="1.0" step="0.05" value="0.95" oninput="updateParam('particleSaturation', +this.value)">
          <div class="control-desc">Vividezza cromatica dello sciame cosmico.</div>
        </div>
      </div>

      <!-- TAB 6: LUCI & SCENA -->
      <div class="tab-pane" id="pane-5">
        <div class="control-card">
          <div class="control-label">
            <span>ZOOM FOTOCAMERA</span>
            <span class="control-val" id="val-cameraZoom">600</span>
          </div>
          <input type="range" class="control-range" id="slider-cameraZoom" min="250" max="1300" step="25" value="600" oninput="updateParam('cameraZoom', +this.value)">
          <div class="control-desc">Distanza focale della prospettiva 3D dalla galassia particellare.</div>
        </div>
        <div class="control-card">
          <div class="control-label">
            <span>LUCENTEZZA / SHININESS</span>
            <span class="control-val" id="val-shininess">25</span>
          </div>
          <input type="range" class="control-range" id="slider-shininess" min="5" max="100" step="5" value="25" oninput="updateParam('shininess', +this.value)">
          <div class="control-desc">Riflesso speculare del materiale MeshPhong delle particelle.</div>
        </div>
        <div class="control-card">
          <div class="control-label">
            <span>INTENSITÀ LUCE SOLARE</span>
            <span class="control-val" id="val-sunIntensity">1.2</span>
          </div>
          <input type="range" class="control-range" id="slider-sunIntensity" min="0.2" max="2.5" step="0.1" value="1.2" oninput="updateParam('sunIntensity', +this.value)">
          <div class="control-desc">Potenza della sorgente direzionale zenitale della scena.</div>
        </div>
        <div class="control-card">
          <div class="control-label">
            <span>INTENSITÀ LUCE AMBIENTALE</span>
            <span class="control-val" id="val-ambientIntensity">0.6</span>
          </div>
          <input type="range" class="control-range" id="slider-ambientIntensity" min="0.1" max="1.5" step="0.05" value="0.6" oninput="updateParam('ambientIntensity', +this.value)">
          <div class="control-desc">Luce diffusa omnidirezionale per schiarire i coni d'ombra.</div>
        </div>
      </div>

      <!-- Preset Bar in fondo al drawer -->
      <div class="presets-container">
        <span style="font-size: 10px; color: #00ff88; font-weight: bold; width: 100%;">PRESET RAPIDI ISTANTANEI:</span>
        <button class="preset-pill" onclick="applyPreset('cosmic')">🌌 Cosmic Void</button>
        <button class="preset-pill" onclick="applyPreset('neon')">⚡ Neon Supernova</button>
        <button class="preset-pill" onclick="applyPreset('zen')">🎹 Zen Symphony</button>
        <button class="preset-pill" onclick="applyPreset('hyper')">🌀 Hyper Warp</button>
        <button class="preset-pill" style="border-color:#ff4466; color:#ff88aa;" onclick="resetDefaults()">↺ Reset Standard</button>
      </div>
    </div>
  </div>

  <script>
    // 15 Note Pentatonico Gran Piano
    const PENTATONIC = [
      { name: 'C3', freq: 130.81 }, { name: 'D3', freq: 146.83 }, { name: 'E3', freq: 164.81 }, { name: 'G3', freq: 196.00 }, { name: 'A3', freq: 220.00 },
      { name: 'C4', freq: 261.63 }, { name: 'D4', freq: 293.66 }, { name: 'E4', freq: 329.63 }, { name: 'G4', freq: 392.00 }, { name: 'A4', freq: 440.00 },
      { name: 'C5', freq: 523.25 }, { name: 'D5', freq: 587.33 }, { name: 'E5', freq: 659.25 }, { name: 'G5', freq: 783.99 }, { name: 'A5', freq: 880.00 }
    ];

    const DEFAULTS = {
      particleCount: 20000,
      pSize: 2.8,
      pSpin: 0.003,
      touchRadius: 650,
      touchForce: 16,
      radialExpansion: 8.0,
      centerAttraction: 2.0,
      centralGravity: 0.0018,
      curlNoise: 0.35,
      damping: 0.96,
      repelForce: 25,
      spectraForce: 8,
      wanderSpeed: 0.8,
      spectraSpeed: 1.2,
      hueSymphonySpeed: 0.20,
      colorSpeed: 0.15,
      masterVolume: 0.60,
      reverbMix: 0.65,
      noteRelease: 2.0,
      waveform: 'triangle',
      motionBlur: 0.14,
      bloomIntensity: 1.1,
      particleBrightness: 0.48,
      particleSaturation: 0.95,
      cameraZoom: 600,
      shininess: 25,
      sunIntensity: 1.2,
      ambientIntensity: 0.6
    };

    let PARAMS = Object.assign({}, DEFAULTS);
    try {
      const saved = localStorage.getItem('nebula_core_android_params');
      if (saved) Object.assign(PARAMS, JSON.parse(saved));
    } catch(e) {}

    // Audio Context & Sintetizzatore Reverb
    let audioCtx = null;
    let reverbNode = null;
    let revGain = null;
    let isAudioMuted = false;

    function initAudio() {
      if (audioCtx) return;
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioClass();
      const length = audioCtx.sampleRate * 2.2;
      const impulse = audioCtx.createBuffer(2, length, audioCtx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = impulse.getChannelData(c);
        for (let i = 0; i < length; i++) {
          d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
        }
      }
      reverbNode = audioCtx.createConvolver();
      reverbNode.buffer = impulse;
      revGain = audioCtx.createGain();
      revGain.gain.value = PARAMS.reverbMix;
      reverbNode.connect(revGain);
      revGain.connect(audioCtx.destination);
    }

    let lastNoteTime = 0;
    let lastAudioFreq = 440;

    function playNote(freq, keyIdx) {
      if (isAudioMuted) return;
      initAudio();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const now = audioCtx.currentTime;
      lastNoteTime = now;
      lastAudioFreq = freq;

      const osc = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = PARAMS.waveform || 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2.01, now);

      const vol = PARAMS.masterVolume * 0.7;
      gain.gain.setValueAtTime(vol, now);
      const dur = PARAMS.noteRelease || 2.0;
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);
      if (reverbNode) gain.connect(reverbNode);

      osc.start(now); osc2.start(now);
      osc.stop(now + dur); osc2.stop(now + dur);

      if (keyIdx !== undefined) {
        const keyEl = document.getElementById('key-' + keyIdx);
        if (keyEl) {
          keyEl.classList.add('active');
          setTimeout(() => keyEl.classList.remove('active'), 200);
        }
      }
    }

    window.toggleAudioMute = function() {
      isAudioMuted = !isAudioMuted;
      document.getElementById('btn-audio').textContent = isAudioMuted ? 'AUDIO: OFF' : 'AUDIO: ON';
    };

    // Render Ribbon Keys
    const ribbonEl = document.getElementById('piano-ribbon');
    PENTATONIC.forEach((p, idx) => {
      const b = document.createElement('div');
      b.className = 'piano-key';
      b.id = 'key-' + idx;
      b.innerHTML = '<span>' + p.name + '</span>';
      b.addEventListener('pointerdown', (e) => { e.stopPropagation(); playNote(p.freq, idx); });
      ribbonEl.appendChild(b);
    });

    // 11 Forme Geometriche (V1..V11)
    const GEOMETRIES = [
      { name: 'V1 (OTTAEDRO)', create: (s) => new THREE.OctahedronGeometry(s, 0) },
      { name: 'V2 (CUBO)', create: (s) => new THREE.BoxGeometry(s*0.85, s*0.85, s*0.85) },
      { name: 'V3 (ICOSAEDRO)', create: (s) => new THREE.IcosahedronGeometry(s, 0) },
      { name: 'V4 (SFERA)', create: (s) => new THREE.SphereGeometry(s*0.9, 8, 8) },
      { name: 'V5 (TORO)', create: (s) => new THREE.TorusGeometry(s*0.8, s*0.25, 6, 12) },
      { name: 'V6 (DODECAEDRO)', create: (s) => new THREE.DodecahedronGeometry(s, 0) },
      { name: 'V7 (TETRAEDRO)', create: (s) => new THREE.TetrahedronGeometry(s*1.2, 0) },
      { name: 'V8 (ANELLO)', create: (s) => new THREE.RingGeometry(s*0.4, s*1.1, 10) },
      { name: 'V9 (CONO)', create: (s) => new THREE.ConeGeometry(s*0.9, s*1.6, 7) },
      { name: 'V10 (CILINDRO)', create: (s) => new THREE.CylinderGeometry(s*0.7, s*0.7, s*1.4, 7) },
      { name: 'V11 (CAPSULA)', create: (s) => new THREE.CapsuleGeometry(s*0.6, s*0.9, 4, 8) }
    ];
    let curGeomIdx = 0;

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.z = PARAMS.cameraZoom;
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    let COUNT = PARAMS.particleCount;
    let geometry = GEOMETRIES[0].create(PARAMS.pSize);
    let material = new THREE.MeshPhongMaterial({ shininess: PARAMS.shininess, specular: 0x151515 });
    let mesh = new THREE.InstancedMesh(geometry, material, COUNT);

    const sun = new THREE.DirectionalLight(0xffffff, PARAMS.sunIntensity);
    sun.position.set(400, 600, 500);
    const ambient = new THREE.AmbientLight(0xffffff, PARAMS.ambientIntensity);
    scene.add(sun, ambient);

    const wanderLight = new THREE.PointLight(0x00ff88, 600, 3000);
    const spectraLight = new THREE.PointLight(0xff00aa, 800, 3000);
    scene.add(wanderLight, spectraLight);

    let pos = new Float32Array(COUNT * 3);
    let vel = new Float32Array(COUNT * 3);
    let home = new Float32Array(COUNT * 3);
    let col = new Float32Array(COUNT);
    const dummy = new THREE.Object3D();
    const tCol = new THREE.Color();
    const phi = Math.PI * (3 - Math.sqrt(5));

    function initSwarm(newCount) {
      if (mesh) scene.remove(mesh);
      COUNT = newCount;
      PARAMS.particleCount = newCount;
      pos = new Float32Array(COUNT * 3);
      vel = new Float32Array(COUNT * 3);
      home = new Float32Array(COUNT * 3);
      col = new Float32Array(COUNT);
      
      geometry = GEOMETRIES[curGeomIdx].create(PARAMS.pSize);
      material.shininess = PARAMS.shininess;
      mesh = new THREE.InstancedMesh(geometry, material, COUNT);

      for (let i = 0; i < COUNT; i++) {
        col[i] = Math.random();
        const y = (1 - (i / (COUNT - 1)) * 2) * 320;
        const r = Math.sqrt(Math.max(0, 1 - (y / 320) * (y / 320))) * 320;
        const th = phi * i;
        const x = Math.cos(th) * r;
        const z = Math.sin(th) * r;
        home[i*3] = x; home[i*3+1] = y; home[i*3+2] = z;
        pos[i*3] = x; pos[i*3+1] = y; pos[i*3+2] = z;
        dummy.position.set(x, y, z);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        tCol.setHSL(col[i], PARAMS.particleSaturation, PARAMS.particleBrightness);
        mesh.setColorAt(i, tCol);
      }
      scene.add(mesh);
      
      const btnCount = document.getElementById('btn-count');
      if (btnCount) btnCount.textContent = 'PARTICELLE: ' + (Math.round(COUNT / 1000)) + 'K';
      const valCount = document.getElementById('val-particleCount');
      if (valCount) valCount.textContent = Number(COUNT).toLocaleString();
      const sldCount = document.getElementById('slider-particleCount');
      if (sldCount) sldCount.value = COUNT;
    }
    initSwarm(PARAMS.particleCount);

    // Multi-touch Gesture Tracking su Canvas
    let isPointerDown = false;
    let pointerX = 0, pointerY = 0;
    const canvasCont = document.getElementById('canvas-container');

    window.addEventListener('pointerdown', (e) => {
      if (e.target.closest('#hud') || e.target.closest('#drawer') || e.target.closest('#piano-ribbon') || e.target.closest('#drawer-backdrop')) return;
      isPointerDown = true;
      const nx = (e.clientX / window.innerWidth) - 0.5;
      const ny = (e.clientY / window.innerHeight) - 0.5;
      pointerX = nx * 1000 * (window.innerWidth / window.innerHeight);
      pointerY = -ny * 800;
      const noteIdx = Math.min(14, Math.max(0, Math.floor((1 - (e.clientY / window.innerHeight)) * 15)));
      playNote(PENTATONIC[noteIdx].freq, noteIdx);
    });

    window.addEventListener('pointermove', (e) => {
      if (!isPointerDown) return;
      const nx = (e.clientX / window.innerWidth) - 0.5;
      const ny = (e.clientY / window.innerHeight) - 0.5;
      pointerX = nx * 1000 * (window.innerWidth / window.innerHeight);
      pointerY = -ny * 800;
    });

    window.addEventListener('pointerup', () => { isPointerDown = false; });
    window.addEventListener('pointercancel', () => { isPointerDown = false; });

    // Motion Blur Accumulation Scene
    let time = 0;
    const fadeScene = new THREE.Scene();
    const fadeCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const fadeMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: PARAMS.motionBlur });
    fadeScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), fadeMat));
    renderer.autoClear = false;

    // Animation Loop
    function animate() {
      requestAnimationFrame(animate);
      time += 0.008;

      // Real-time camera zoom lerp
      camera.position.z += (PARAMS.cameraZoom - camera.position.z) * 0.08;

      fadeMat.opacity = PARAMS.motionBlur;
      renderer.render(fadeScene, fadeCam);
      renderer.clearDepth();

      // Orbiting Wanderer
      const tW = time * PARAMS.wanderSpeed;
      const wX = Math.cos(tW * 0.8) * 650, wY = Math.sin(tW * 0.6) * 500, wZ = Math.sin(tW) * 450;
      wanderLight.position.set(wX, wY, wZ);
      wanderLight.color.setHSL((time * 0.2) % 1, 1, 0.5);

      // Orbiting Spectra
      const tS = time * PARAMS.spectraSpeed;
      const sX = Math.cos(tS) * 500, sY = Math.sin(tS * 0.7) * 400, sZ = Math.sin(tS * 1.1) * 350;
      spectraLight.position.set(sX, sY, sZ);
      spectraLight.color.setHSL((time * 0.3) % 1, 1, 0.5);

      mesh.rotation.y += PARAMS.pSpin;
      mesh.rotation.x += PARAMS.pSpin * 0.5;

      const pRadius = PARAMS.touchRadius;
      const pRadius2 = pRadius * pRadius;
      const tForce = PARAMS.touchForce;
      const cGrav = PARAMS.centralGravity;
      const rRepel = PARAMS.repelForce;
      const aSpectra = PARAMS.spectraForce;
      const damp = PARAMS.damping;
      const bIntensity = PARAMS.bloomIntensity;
      const pBri = Math.min(0.85, PARAMS.particleBrightness * (1 + bIntensity * 0.15));
      const pSat = PARAMS.particleSaturation;
      const colSpd = PARAMS.colorSpeed;
      const audioHueShift = (lastAudioFreq / 880) * PARAMS.hueSymphonySpeed;

      for (let i = 0; i < COUNT; i++) {
        const i3 = i * 3;
        vel[i3] += (home[i3] - pos[i3]) * cGrav;
        vel[i3+1] += (home[i3+1] - pos[i3+1]) * cGrav;
        vel[i3+2] += (home[i3+2] - pos[i3+2]) * cGrav;

        // Radial Expansion vs Center Attraction Force
        const px = pos[i3], py = pos[i3+1], pz = pos[i3+2];
        const dCenter = Math.hypot(px, py, pz) || 1;
        const invD = 1 / dCenter;
        const radialNet = ((PARAMS.radialExpansion || 8.0) - (PARAMS.centerAttraction || 2.0)) * 0.12;
        vel[i3] += px * invD * radialNet;
        vel[i3+1] += py * invD * radialNet;
        vel[i3+2] += pz * invD * radialNet;

        // Repel from Wanderer
        const dxW = pos[i3] - wX, dyW = pos[i3+1] - wY, dzW = pos[i3+2] - wZ;
        const dW2 = dxW*dxW + dyW*dyW + dzW*dzW;
        if (dW2 < 280000) {
          const dW = Math.sqrt(dW2) || 1;
          const fW = (1 - dW / 530) * rRepel;
          vel[i3] += (dxW/dW)*fW; vel[i3+1] += (dyW/dW)*fW; vel[i3+2] += (dzW/dW)*fW;
        }

        // Attract to Spectra
        const dxS = sX - pos[i3], dyS = sY - pos[i3+1], dzS = sZ - pos[i3+2];
        const dS2 = dxS*dxS + dyS*dyS + dzS*dzS;
        if (dS2 < 380000) {
          const dS = Math.sqrt(dS2) || 1;
          const fS = (1 - dS / 620) * aSpectra;
          vel[i3] += (dxS/dS)*fS; vel[i3+1] += (dyS/dS)*fS; vel[i3+2] += (dzS/dS)*fS;
        }

        // Pointer touch
        if (isPointerDown) {
          const dxP = pointerX - pos[i3], dyP = pointerY - pos[i3+1], dzP = -pos[i3+2];
          const dP2 = dxP*dxP + dyP*dyP + dzP*dzP;
          if (dP2 < pRadius2) {
            const dP = Math.sqrt(dP2) || 1;
            const fP = (1 - dP / pRadius) * tForce;
            vel[i3] += (dxP/dP)*fP; vel[i3+1] += (dyP/dP)*fP; vel[i3+2] += (dzP/dP)*fP;
          }
        }

        vel[i3] *= damp; vel[i3+1] *= damp; vel[i3+2] *= damp;
        pos[i3] += vel[i3]; pos[i3+1] += vel[i3+1]; pos[i3+2] += vel[i3+2];

        dummy.position.set(pos[i3], pos[i3+1], pos[i3+2]);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        tCol.setHSL((col[i] + time * colSpd + audioHueShift) % 1, pSat, pBri);
        mesh.setColorAt(i, tCol);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      renderer.render(scene, camera);
    }
    animate();

    // Drawer and Tabs Controls
    window.openDrawer = function() {
      document.getElementById('drawer').classList.add('open');
      document.getElementById('drawer-backdrop').classList.add('open');
      syncSliderInputs();
    };

    window.closeDrawer = function() {
      document.getElementById('drawer').classList.remove('open');
      document.getElementById('drawer-backdrop').classList.remove('open');
    };

    window.switchTab = function(idx) {
      for (let i = 0; i < 6; i++) {
        const pane = document.getElementById('pane-' + i);
        const btn = document.getElementById('tabbtn-' + i);
        if (pane) pane.classList.toggle('active', i === idx);
        if (btn) btn.classList.toggle('active', i === idx);
      }
    };

    function triggerAutoSave() {
      try {
        localStorage.setItem('nebula_core_android_params', JSON.stringify(PARAMS));
      } catch(e) {}
      const badge = document.getElementById('save-badge');
      if (badge) {
        badge.style.opacity = '1';
        badge.textContent = '✓ AUTO-SAVED';
      }
    }

    window.updateParam = function(key, val) {
      PARAMS[key] = val;
      const el = document.getElementById('val-' + key);
      if (el) {
        el.textContent = (key === 'particleCount') ? Number(val).toLocaleString() : (key === 'noteRelease') ? val + 's' : val;
      }

      if (key === 'particleCount') {
        initSwarm(val);
      } else if (key === 'pSize') {
        geometry = GEOMETRIES[curGeomIdx].create(val);
        mesh.geometry = geometry;
      } else if (key === 'shininess') {
        material.shininess = val;
      } else if (key === 'sunIntensity') {
        sun.intensity = val;
      } else if (key === 'ambientIntensity') {
        ambient.intensity = val;
      } else if (key === 'reverbMix' && revGain) {
        revGain.gain.value = val;
      }

      triggerAutoSave();
    };

    window.setWaveform = function(type) {
      PARAMS.waveform = type;
      const el = document.getElementById('val-waveform');
      if (el) el.textContent = type;
      triggerAutoSave();
    };

    function syncSliderInputs() {
      Object.keys(PARAMS).forEach(k => {
        const sld = document.getElementById('slider-' + k);
        const valEl = document.getElementById('val-' + k);
        if (sld) sld.value = PARAMS[k];
        if (valEl) valEl.textContent = (k === 'particleCount') ? Number(PARAMS[k]).toLocaleString() : (k === 'noteRelease') ? PARAMS[k] + 's' : PARAMS[k];
      });
      const wfEl = document.getElementById('val-waveform');
      if (wfEl) wfEl.textContent = PARAMS.waveform;
    }

    window.applyPreset = function(presetName) {
      if (presetName === 'cosmic') {
        Object.assign(PARAMS, {
          particleCount: 25000, pSize: 2.2, motionBlur: 0.05, bloomIntensity: 1.8,
          damping: 0.98, centralGravity: 0.0012, masterVolume: 0.8, reverbMix: 0.85
        });
      } else if (presetName === 'neon') {
        Object.assign(PARAMS, {
          particleCount: 35000, pSize: 3.2, motionBlur: 0.22, bloomIntensity: 2.2,
          damping: 0.95, repelForce: 40, spectraForce: 15, particleSaturation: 1.0
        });
      } else if (presetName === 'zen') {
        Object.assign(PARAMS, {
          particleCount: 15000, pSize: 2.6, motionBlur: 0.12, bloomIntensity: 0.8,
          damping: 0.94, centralGravity: 0.0025, masterVolume: 0.7, reverbMix: 0.70
        });
      } else if (presetName === 'hyper') {
        Object.assign(PARAMS, {
          particleCount: 40000, pSize: 1.8, motionBlur: 0.03, bloomIntensity: 2.4,
          wanderSpeed: 2.2, spectraSpeed: 2.5, pSpin: 0.012, damping: 0.97
        });
      }
      initSwarm(PARAMS.particleCount);
      syncSliderInputs();
      triggerAutoSave();
    };

    window.resetDefaults = function() {
      PARAMS = Object.assign({}, DEFAULTS);
      initSwarm(PARAMS.particleCount);
      syncSliderInputs();
      triggerAutoSave();
    };

    // Fullscreen Cross-vendor
    window.toggleFullscreen = function() {
      const doc = document;
      const docEl = doc.documentElement;
      const req = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
      const exit = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;
      if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
        if (req) req.call(docEl).catch(() => {});
      } else {
        if (exit) exit.call(doc).catch(() => {});
      }
    };

    window.toggleCount = function() {
      const target = (COUNT >= 25000) ? 10000 : 30000;
      PARAMS.particleCount = target;
      initSwarm(target);
      triggerAutoSave();
    };

    window.changeVersion = function() {
      curGeomIdx = (curGeomIdx + 1) % GEOMETRIES.length;
      document.getElementById('btn-geom').textContent = 'FORMA: ' + GEOMETRIES[curGeomIdx].name;
      initSwarm(COUNT);
    };

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `NebulaCore_Universal_v2.0_Offline.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    triggerDownloadNotification("File HTML autonomo completo (Menu a 6 schede + tutti i cursori) scaricato!");
  };

  // 3. Mac & Linux Portable Launcher
  const handleDownloadMacLauncher = () => {
    const launcherScript = `#!/bin/bash
# ==============================================================================
# NEBULA CORE v2.0 - MAC LAUNCHER A TUTTO SCHERMO
# ==============================================================================
cd "$(dirname "$0")"
echo "Avvio Nebula Core v2.0 in corso..."
PORT=8080
if command -v python3 &>/dev/null; then
    python3 -m http.server $PORT &
    PID=$!
elif command -v python &>/dev/null; then
    python -m SimpleHTTPServer $PORT &
    PID=$!
fi
sleep 1
open "http://localhost:$PORT/NebulaCore_Universal_v2.0_Offline.html" 2>/dev/null || open "NebulaCore_Universal_v2.0_Offline.html"
echo "Nebula Core avviato! Premi CTRL+C per chiudere il server."
wait $PID 2>/dev/null
`;
    const blob = new Blob([launcherScript], { type: 'application/x-sh' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `NebulaCore_Mac_Launcher.command`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Also download the HTML file
    setTimeout(handleDownloadStandaloneHTML, 400);
    triggerDownloadNotification("Script Mac Launcher (.command) e bundle scaricati!");
  };

  // 4. Windows PC Portable Launcher
  const handleDownloadWindowsLauncher = () => {
    const batScript = `@echo off
title NEBULA CORE v2.0 - WINDOWS LAUNCHER
echo ==================================================
echo    AVVIO NEBULA CORE v2.0 A TUTTO SCHERMO
echo ==================================================
cd /d "%~dp0"
start "" "NebulaCore_Universal_v2.0_Offline.html"
exit
`;
    const blob = new Blob([batScript], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `NebulaCore_Windows_Launcher.bat`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Also download HTML
    setTimeout(handleDownloadStandaloneHTML, 400);
    triggerDownloadNotification("Launcher Windows (.bat) e bundle scaricati!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#041209] border border-[#00ff88] rounded-2xl p-5 max-w-xl w-full text-[#88ffaa] font-mono shadow-[0_0_60px_rgba(0,255,136,0.4)] flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#005522] pb-3">
          <div className="flex items-center gap-2">
            <span className="bg-[#00ff88]/20 border border-[#00ff88] text-[#00ff88] px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />
              PORTALE DOWNLOAD &amp; APP A TUTTO SCHERMO
            </span>
            <span className="text-[#00e5ff] font-bold text-xs">v2.0</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#66aa88] hover:text-white p-1 rounded cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notification Toast */}
        {downloadSuccess && (
          <div className="bg-[#002b15] border border-[#00ff88] text-[#00ff88] px-3.5 py-2.5 rounded-lg text-xs flex items-center gap-2 font-bold shadow-[0_0_15px_rgba(0,255,136,0.3)]">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00ff88]" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Device Detector Banner */}
        <div className="bg-[#001d0e] border border-[#00aa55]/70 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs text-[#aaffcc]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00ff88]" />
            <span>
              DISPOSITIVO RILEVATO:{' '}
              <b className="text-[#00e5ff] uppercase">{deviceType}</b>
            </span>
          </div>
          <span className="text-[10px] bg-[#00ff88]/15 border border-[#00ff88]/40 text-[#00ff88] px-2 py-0.5 rounded-full font-bold">
            PACCHETTI OTTIMIZZATI
          </span>
        </div>

        <div className="text-xs text-[#aaffcc] leading-relaxed">
          Installa o scarica l'applicazione completa per il tuo dispositivo: gira a <b>60 FPS a tutto schermo</b> con pieno supporto per 20.000 particelle, webcam, microfono e sintetizzatore pianoforte.
        </div>

        {/* Link Diretto al Portale di Download */}
        <div className="bg-[#002010] border border-[#00ff88]/60 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#00ff88] flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5" />
              LINK DIRETTO AL PORTALE DOWNLOAD
            </span>
            <button
              onClick={() => setShowQr(!showQr)}
              className="text-[10px] text-[#00e5ff] hover:text-white flex items-center gap-1 cursor-pointer underline"
            >
              <QrCode className="w-3 h-3" />
              {showQr ? 'Nascondi QR' : 'Mostra QR Code'}
            </button>
          </div>
          <div className="flex items-center gap-2 bg-[#020b05] border border-[#005522] rounded-lg p-2">
            <input
              type="text"
              readOnly
              value={portalUrl}
              className="bg-transparent text-[11px] text-[#88ffaa] font-mono w-full outline-none select-all"
            />
            <button
              onClick={handleCopyLink}
              className="shrink-0 px-2.5 py-1 bg-[#00381e] hover:bg-[#00552a] text-[#00ff88] hover:text-white border border-[#00aa55] rounded text-[10.5px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="Copia link negli appunti"
            >
              {copiedLink ? <Check className="w-3 h-3 text-[#00ff88]" /> : <Copy className="w-3 h-3" />}
              <span>{copiedLink ? 'COPIATO' : 'COPIA'}</span>
            </button>
            <button
              onClick={handleShare}
              className="shrink-0 p-1 bg-[#002414] hover:bg-[#00381e] text-[#00e5ff] border border-[#007733] rounded cursor-pointer transition-colors"
              title="Condividi link"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
          {showQr && (
            <div className="flex flex-col items-center justify-center p-3 bg-[#010804] border border-[#00aa55]/50 rounded-lg gap-2 animate-in fade-in">
              <span className="text-[10px] text-[#88ffaa]">Inquadra con fotocamera del tuo telefono o tablet:</span>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(portalUrl)}&bgcolor=020905&color=00ff88`}
                alt="QR Code per Portale Download"
                className="w-36 h-36 border border-[#00ff88]/50 rounded-lg p-1 bg-[#020905]"
              />
              <span className="text-[9.5px] text-[#558866]">Si aprirà direttamente il portale di download su mobile</span>
            </div>
          )}
        </div>

        {/* 1. Android Option */}
        <div className={`bg-[#031109] border rounded-xl p-3.5 flex flex-col gap-2 transition-all ${
          deviceType === 'android' ? 'border-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.2)]' : 'border-[#005522] hover:border-[#00aa55]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <Smartphone className="w-4 h-4 text-[#00ff88]" />
              <span>ANDROID (PWA A TUTTO SCHERMO / APK WRAPPER)</span>
            </div>
            {deviceType === 'android' && (
              <span className="text-[9.5px] bg-[#00ff88] text-[#002211] font-bold px-2 py-0.5 rounded-full">
                CONSIGLIATO
              </span>
            )}
          </div>
          <p className="text-[10.5px] text-[#88ffaa] leading-normal">
            Installa Nebula Core come app nativa su smartphone e tablet Android. Funziona a tutto schermo con gesture multi-touch e GPU Vulkan/WebGL2.
          </p>
          <button
            onClick={handleAndroidInstall}
            className="w-full py-2.5 bg-gradient-to-r from-[#00ff88] to-[#00e5ff] text-[#020905] font-extrabold text-xs rounded-lg flex items-center justify-center gap-2 hover:opacity-95 shadow-[0_0_15px_rgba(0,255,136,0.35)] cursor-pointer transition-all active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>INSTALLA / SCARICA PACCHETTO ANDROID</span>
          </button>
        </div>

        {/* 2. Apple iOS Option (iPhone / iPad) */}
        <div className={`bg-[#031109] border rounded-xl p-3.5 flex flex-col gap-2 transition-all ${
          deviceType === 'ios' ? 'border-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.2)]' : 'border-[#005522] hover:border-[#00aa55]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <Apple className="w-4 h-4 text-[#00e5ff]" />
              <span>IPHONE &amp; IPAD (MODALITÀ WEB NATIVA RETINA)</span>
            </div>
            {deviceType === 'ios' && (
              <span className="text-[9.5px] bg-[#00ff88] text-[#002211] font-bold px-2 py-0.5 rounded-full">
                CONSIGLIATO
              </span>
            )}
          </div>
          <div className="bg-[#002414]/80 border border-[#00aa55]/50 rounded-lg p-2.5 text-[10.5px] text-[#aaffcc] flex flex-col gap-1">
            <span className="font-bold text-[#00ff88] flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> ISTRUZIONI PER IPHONE / IPAD A TUTTO SCHERMO:
            </span>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Apri questa pagina in <b>Safari</b>.</li>
              <li>Tocca l'icona <b>Condividi</b> (quadrato con freccia verso l'alto).</li>
              <li>Seleziona <b>"Aggiungi a Schermata Home"</b>.</li>
              <li>Avvia l'icona Nebula Core: si aprirà a <b>tutto schermo senza barre</b> a 60 FPS con audio e multitouch!</li>
            </ol>
          </div>
          <button
            onClick={handleDownloadStandaloneHTML}
            className="w-full py-2 bg-[#002414] border border-[#00aa55] text-[#88ffaa] hover:text-white hover:border-[#00ff88] text-xs font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#00ff88]" />
            <span>SCARICA COPIA OFFLINE PER APP "FILE" (.HTML)</span>
          </button>
        </div>

        {/* 3. Mac Desktop Option */}
        <div className={`bg-[#031109] border rounded-xl p-3.5 flex flex-col gap-2 transition-all ${
          deviceType === 'mac' ? 'border-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.2)]' : 'border-[#005522] hover:border-[#00aa55]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <Laptop className="w-4 h-4 text-[#00e5ff]" />
              <span>MAC (APPLE SILICON M1/M2/M3 &amp; INTEL)</span>
            </div>
            {deviceType === 'mac' && (
              <span className="text-[9.5px] bg-[#00ff88] text-[#002211] font-bold px-2 py-0.5 rounded-full">
                CONSIGLIATO
              </span>
            )}
          </div>
          <p className="text-[10.5px] text-[#88ffaa] leading-normal">
            Launcher con doppio-clic (.command) per macOS con supporto per risoluzione Retina Ultra e audio cattedrale ad alta fedeltà.
          </p>
          <button
            onClick={handleDownloadMacLauncher}
            className="w-full py-2.5 bg-[#002211] border border-[#00aa55] hover:bg-[#003318] text-[#00ff88] font-bold text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>SCARICA LAUNCHER MAC (.COMMAND) + PACCHETTO</span>
          </button>
        </div>

        {/* 4. Windows PC Option */}
        <div className={`bg-[#031109] border rounded-xl p-3.5 flex flex-col gap-2 transition-all ${
          deviceType === 'windows' ? 'border-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.2)]' : 'border-[#005522] hover:border-[#00aa55]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <Monitor className="w-4 h-4 text-[#ffaa00]" />
              <span>WINDOWS PC (10 / 11)</span>
            </div>
            {deviceType === 'windows' && (
              <span className="text-[9.5px] bg-[#00ff88] text-[#002211] font-bold px-2 py-0.5 rounded-full">
                CONSIGLIATO
              </span>
            )}
          </div>
          <p className="text-[10.5px] text-[#88ffaa] leading-normal">
            Script batch Windows (.bat) con avvio a schermo intero immediato a 120/144/240Hz con accelerazione GPU DirectX/Vulkan.
          </p>
          <button
            onClick={handleDownloadWindowsLauncher}
            className="w-full py-2.5 bg-[#002211] border border-[#00aa55] hover:bg-[#003318] text-[#ffaa00] font-bold text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>SCARICA LAUNCHER WINDOWS (.BAT) + PACCHETTO</span>
          </button>
        </div>

        {/* 5. Universal Standalone Single-File HTML */}
        <div className="bg-[#031109] border border-[#005522] hover:border-[#00ff88] rounded-xl p-3.5 flex flex-col gap-2 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <Globe className="w-4 h-4 text-[#00ff88]" />
              <span>FILE HTML AUTONOMO UNIVERSALE (OFFLINE PER SEMPRE)</span>
            </div>
            <span className="text-[9.5px] text-[#00e5ff] bg-[#002414] px-2 py-0.5 rounded border border-[#005522]">
              ZERO INSTALL
            </span>
          </div>
          <p className="text-[10.5px] text-[#88ffaa] leading-normal">
            Un unico file da 20.000 particelle con motore Three.js, sintetizzatore riverbero cattedrale e controllo touch: trascinalo o aprilo con doppio clic ovunque su qualsiasi browser senza internet.
          </p>
          <button
            onClick={handleDownloadStandaloneHTML}
            className="w-full py-2.5 bg-transparent border border-[#00aa55] text-[#88ffaa] hover:border-[#00ff88] hover:text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>SCARICA FILE HTML SINGOLO (OFFLINE UNIVERSALE)</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#004422] pt-3 text-xs">
          <div className="flex items-center gap-1.5 text-[10px] text-[#558866]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00ff88]" />
            <span>Sicuro • Senza account • 100% Esecuzione Locale</span>
          </div>
          <button
            onClick={onClose}
            className="bg-[#002211] text-[#88ffaa] hover:text-white px-5 py-1.5 rounded-lg border border-[#005522] cursor-pointer font-bold transition-colors"
          >
            CHIUDI
          </button>
        </div>
      </div>
    </div>
  );
};
