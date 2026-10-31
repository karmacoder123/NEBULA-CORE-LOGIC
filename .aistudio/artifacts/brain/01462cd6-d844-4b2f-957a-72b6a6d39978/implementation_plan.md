# Bilanciamento Forze Sciame: Slider Espansione Radiale e Attrazione Centrale

Piano architetturale per integrare due slider fisici dedicati nella console principale e nel pacchetto Android scaricabile, risolvendo l'eccessiva contrazione dello sciame verso il centro e consentendo la libera espansione volumetrica nello spazio tridimensionale.

### User Review & Critical Decisions

> [!IMPORTANT]
> **Decisioni Convalidate nella Fase 1**:
> - **Tipo di Controlli**: Due slider dedicati e indipendenti per **Espansione Radiale** (`radialExpansion`) e **Attrazione Centrale** (`centerAttraction`), garantendo regolazione fine tra dispersione cosmica e coesione della forma.
> - **Collocazione UI**: Inserimento prioritario nella scheda **FORZE (FORCES)** della console desktop/mobile e sincronizzazione immediata nel **Menu a comparsa a 6 schede della versione Android scaricabile**.
> - **Parametri Predefiniti Consigliati**: Espansione Radiale di default a `8.0` (range 0.0 - 50.0, step 0.5) e Attrazione Centrale ridotta a `2.0` (range 0.0 - 30.0, step 0.2), consentendo allo sciame di respirare ed espandersi in modo armonico fin dal primo avvio.

---

### 1. Overview & Core Concept

- **Problema Risolto**: Attualmente le particelle dello sciame subiscono un richiamo verso l'origine (o verso i rispettivi vertici geometrici) privo di una forza di propulsione centrifuga/radiale regolabile dall'utente, provocando un collasso visivo verso il nucleo e impedendo allo sciame di aprirsi e occupare il volume della scena.
- **Esperienza Utente**: Attraverso i due nuovi slider nella sezione FORZE, l'utente può calibrare in tempo reale la spinta verso l'esterno (`radialExpansion`) per far detonare, dilatare o far fluttuare le particelle, bilanciandola con l'attrazione verso il baricentro (`centerAttraction`) per creare anelli stellari, nubi espanse o geometrie compatte a piacimento.
- **Sincronizzazione Completa**: I parametri saranno immediatamente sincronizzati tra motore Three.js (`RemasteredEngine` e `SacredMotherEngine`), pannello `ConsolePanel`, visualizzatore mobile e pacchetto offline PWA/HTML scaricato per Android con persistenza in `localStorage`.

---

### 2. User Experience & Visual Design

- **Scheda FORZE (Console Desktop & Mobile)**:
  - Posizionamento in cima alla griglia della scheda FORZE con etichette chiare in ciano neon (`#00e5ff`) e valori numerici in verde smeraldo (`#00ff88`).
  - **ESPANSIONE RADIALE (RADIAL EXPANSION)**: Slider con range `0.0` - `50.0`, step `0.5`, valore predefinito calibrato a `8.0`.
  - **ATTRAZIONE CENTRALE (CENTER ATTRACTION)**: Slider con range `0.0` - `30.0`, step `0.2`, valore predefinito calibrato a `2.0`.
  - Indicatori di stato reattivi con feedback visivo immediato sullo sciame 3D durante il trascinamento.
- **Menu Android a 6 Schede (Drawer Bottom Sheet)**:
  - Scheda 2 ("FORZE") arricchita con i due nuovi cursori touch ergonomici con altezze di tocco $\ge 44\text{px}$, tooltip e salvataggio automatico su storage locale.
- **Palette & Tipografia**:
  - Rispetto rigoroso del tema Cyberpunk / High-Contrast: Sfondo profondo `#030e07`, bordi hairline `#005522`, accenti ciano `#00e5ff` e verde `#00ff88`, font monospace tabellare (`tabular-nums`) per i valori numerici.

---

### 3. Key Product Decisions & Trade-Offs

- **Decisione 1: Due Slider Separati vs Cursore Unico Bipolare**:
  - *Scelta Adottata*: Due slider indipendenti (`radialExpansion` e `centerAttraction`).
  - *Razionale*: Consente configurazioni asimmetriche (es. alta attrazione + alta espansione = pulsazione vibrante; bassa attrazione + alta espansione = diaspora e deriva libera nello spazio profondo; zero espansione + forte attrazione = buco nero / singolarità).
- **Decisione 2: Integrazione Fisica Vettoriale O(1) per Particella**:
  - *Scelta Adottata*: Calcolo del vettore normalizzato radiale rispetto all'origine $(p_x / d, p_y / d, p_z / d)$ all'interno del loop instanziato esistente, combinato con il fattore di smorzamento (attrito).
  - *Razionale*: Nessun calcolo $O(N^2)$, nessun degrado di framerate (mantenimento costante di 60 FPS con 20.000 particelle anche su dispositivi mobili).

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE LAYER                            │
│                                                                        │
│   ┌───────────────────────────┐     ┌──────────────────────────────┐   │
│   │   ConsolePanel (Tab 3)    │     │   DownloadPortalModal        │   │
│   │   - radialExpansion [8.0] │     │   (Android Standalone PWA)   │   │
│   │   - centerAttraction[2.0] │     │   - Live Drawer Forze Tab    │   │
│   └─────────────┬─────────────┘     └──────────────┬───────────────┘   │
└─────────────────┼──────────────────────────────────┼───────────────────┘
                  │ onUpdateParams()                 │ localStorage sync
                  ▼                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      SIMULATION ENGINE LAYER                           │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │   RemasteredEngine / SacredMotherEngine                        │   │
│   │   Live Physics Loop (60 FPS):                                  │   │
│   │   1. dCenter = hypot(px, py, pz)                               │   │
│   │   2. v += (pos / dCenter) * radialExpansion                    │   │
│   │   3. v -= (pos / dCenter) * centerAttraction                   │   │
│   │   4. v += (homes - pos) * elasticity                           │   │
│   │   5. v *= friction                                             │   │
│   │   6. pos += v                                                  │   │
│   └────────────────────────────────┬───────────────────────────────┘   │
└────────────────────────────────────┼───────────────────────────────────┘
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      THREE.JS GPU RENDERING                            │
│   THREE.InstancedMesh (12k–25k particelle con PBR & Color Shuffling)   │
└────────────────────────────────────────────────────────────────────────┘
```

- **Campi Dati Aggiunti**:
  - `radialExpansion: number` (default `8.0`, range `0.0`–`50.0`)
  - `centerAttraction: number` (default `2.0`, range `0.0`–`30.0`)
- **Modifiche Coordinate dei File**:
  - `src/types/index.ts`: Dichiarazione dei due nuovi campi nell'interfaccia `EngineParams`.
  - `src/engine/remasteredEngine.ts`: Inclusione nei parametri di default e applicazione delle accelerazioni radiali nel ciclo `animate`.
  - `src/engine/sacredMother.ts`: Allineamento parametri e ciclo fisico.
  - `src/components/ConsolePanel.tsx`: Creazione dei due controlli slider nel Tab Forze.
  - `src/components/DownloadPortalModal.tsx`: Aggiunta dei due cursori nella scheda Forze del bundle offline Android, gestione dell'auto-salvataggio e integrazione nel loop Three.js offline.
