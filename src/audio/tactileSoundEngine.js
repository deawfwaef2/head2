/**
 * Procedural WebAudio Tactile Physics Sound Engine
 * Synthesizes real-time physical audio feedback for:
 *  - Pickup tactile lift (拾取感音效)
 *  - Velocity-modulated 3D spatial drag whoosh/friction (空间拖动感音效)
 *  - Bounded 3D Box Space wall & pet-to-pet collision impact (物理碰撞感音效)
 *  - Z-depth scroll wheel spatial ticks (滚轮景深远近推拉音效)
 *  - 360° Rotation Mode gimbal lock/unlock (旋转模式切换音效)
 *  - Collectible summon / recall materialization (召唤与收回音效)
 */

class TactileSoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.masterVolume = 0.85;
    this.pickupVolume = 0.85;
    this.dragVolume = 0.70;
    this.collisionVolume = 0.90;
    this.depthTickVolume = 0.65;

    // Continuous drag node state
    this.dragGain = null;
    this.dragFilter = null;
    this.dragPanner = null;
    this.lastDepthTickTime = 0;
    this.lastCollisionTime = 0;
    this.lastLandingTime = -Infinity;
    this.lastNodTime = -Infinity;
    this.lastFlickTime = -Infinity;

    // Rainy Study Room ASMR Soundscape state (Stage 28: clearly audible, rich multi-layered rain)
    this.rainEnabled = true;
    this.rainVolume = 0.88;
    this.rainSource = null;
    this.rainGain = null;
    this.rainDropTimer = null;

    if (typeof window !== 'undefined') {
      const unlockAndStartRain = () => {
        if (!this.enabled) return;
        const ctx = this.ensureContext();
        if (ctx && this.rainEnabled && !this.rainSource) {
          this.startRainAmbience();
        }
      };
      window.addEventListener('pointerdown', unlockAndStartRain, { passive: true, capture: true });
      window.addEventListener('wheel', unlockAndStartRain, { passive: true, capture: true });
      window.addEventListener('keydown', unlockAndStartRain, { passive: true, capture: true });
    }
  }

  ensureContext() {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  createPanner(ctx, panX = 0) {
    if (ctx.createStereoPanner) {
      const panner = ctx.createStereoPanner();
      panner.pan.value = Math.max(-1, Math.min(1, panX));
      panner.connect(ctx.destination);
      return panner;
    }
    return ctx.destination;
  }

  /**
   * 1. Pickup Sound (拾取感音效): Weighted organic lift + porcelain/specimen tactile transient
   */
  playPickup(panX = 0) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const out = this.createPanner(ctx, panX);
    const vol = this.masterVolume * this.pickupVolume;

    // Sub-mid lift thud (92Hz -> 178Hz upward pitch envelope)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(92, now);
    osc.frequency.exponentialRampToValueAtTime(178, now + 0.085);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.36 * vol, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.14);

    // Crisp tactile finger-contact harmonic click
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'sine';
    clickOsc.frequency.setValueAtTime(680, now);
    clickOsc.frequency.exponentialRampToValueAtTime(340, now + 0.035);

    clickGain.gain.setValueAtTime(0.18 * vol, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    clickOsc.connect(clickGain);
    clickGain.connect(out);
    clickOsc.start(now);
    clickOsc.stop(now + 0.045);
  }

  /**
   * 2. Release / Drop Sound (放下微震音效)
   */
  playRelease(panX = 0) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.stopDragWhoosh();

    const now = ctx.currentTime;
    const out = this.createPanner(ctx, panX);
    const vol = this.masterVolume * this.pickupVolume;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(155, now);
    osc.frequency.exponentialRampToValueAtTime(76, now + 0.11);

    gain.gain.setValueAtTime(0.28 * vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  /**
   * 3. Continuous Velocity-Modulated Drag Whoosh / Friction (空间拖动感音效)
   */
  startDragWhoosh() {
    const ctx = this.ensureContext();
    if (!ctx || this.dragGain) return;

    const bufferSize = ctx.sampleRate * 1.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + white * 0.029;
      b1 = 0.985 * b1 + white * 0.032;
      b2 = 0.950 * b2 + white * 0.048;
      data[i] = (b0 + b1 + b2) * 0.35;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 240;
    filter.Q.value = 2.2;

    const gain = ctx.createGain();
    gain.gain.value = 0.0001;

    const panner = this.createPanner(ctx, 0);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    noise.start();

    this.dragNoise = noise;
    this.dragFilter = filter;
    this.dragGain = gain;
    this.dragPanner = panner;
  }

  updateDragWhoosh(speedNorm = 0, panX = 0) {
    if (!this.enabled) return;
    if (!this.dragGain) this.startDragWhoosh();
    if (!this.ctx || !this.dragGain) return;

    const now = this.ctx.currentTime;
    const clampedSpeed = Math.max(0, Math.min(1, speedNorm));
    const targetFreq = 160 + clampedSpeed * 680;
    const targetGain = clampedSpeed * 0.26 * this.masterVolume * this.dragVolume;

    this.dragFilter.frequency.setTargetAtTime(targetFreq, now, 0.03);
    this.dragGain.gain.setTargetAtTime(Math.max(0.0001, targetGain), now, 0.035);
    if (this.dragPanner && this.dragPanner.pan) {
      this.dragPanner.pan.setTargetAtTime(Math.max(-1, Math.min(1, panX)), now, 0.03);
    }
  }

  stopDragWhoosh() {
    if (!this.dragGain || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      this.dragGain.gain.setTargetAtTime(0.0001, now, 0.04);
      const oldNoise = this.dragNoise;
      setTimeout(() => {
        try { oldNoise && oldNoise.stop(); } catch (_) {}
      }, 120);
    } catch (_) {}
    this.dragNoise = null;
    this.dragFilter = null;
    this.dragGain = null;
    this.dragPanner = null;
  }

  /**
   * 4. Physical Box Wall & Pet-to-Pet Collision Impact (盒壁与藏品间物理碰撞音效)
   */
  playBoxWallCollision(intensity = 0.7, wallType = 'side', panX = 0) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const nowMs = performance.now();
    if (nowMs - this.lastCollisionTime < 55) return;
    this.lastCollisionTime = nowMs;

    const now = ctx.currentTime;
    const out = this.createPanner(ctx, panX);
    const force = Math.max(0.15, Math.min(1.0, intensity)) * this.masterVolume * this.collisionVolume;

    // Low physical mass impact thud
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'sine';
    const baseFreq = wallType === 'front_glass' ? 115 : wallType === 'back_wall' ? 68 : 88;
    bodyOsc.frequency.setValueAtTime(baseFreq * 1.4, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.55, now + 0.16);

    bodyGain.gain.setValueAtTime(0.48 * force, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(out);
    bodyOsc.start(now);
    bodyOsc.stop(now + 0.19);

    // Acrylic / Tempered Glass Box Boundary Resonance Overtones
    const glassOsc = ctx.createOscillator();
    const glassGain = ctx.createGain();
    glassOsc.type = 'triangle';
    const overtone = wallType === 'front_glass' ? 640 : wallType === 'pet' ? 420 : 510;
    glassOsc.frequency.setValueAtTime(overtone, now);
    glassOsc.frequency.exponentialRampToValueAtTime(overtone * 0.72, now + 0.09);

    glassGain.gain.setValueAtTime(0.18 * force, now);
    glassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);

    glassOsc.connect(glassGain);
    glassGain.connect(out);
    glassOsc.start(now);
    glassOsc.stop(now + 0.10);
  }

  /** Soft, filtered transient shared by desk landing and touch gestures. */
  playFeltNoise(ctx, out, now, amplitude, duration, cutoff) {
    const length = Math.max(32, Math.round(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let low = 0;
    for (let i = 0; i < length; i++) {
      const t = i / length;
      low = low * 0.73 + (Math.random() * 2 - 1) * 0.27;
      data[i] = low * Math.sin(Math.PI * t) * Math.exp(-t * 3.6);
    }
    const src = ctx.createBufferSource();
    const lp = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    src.buffer = buffer;
    lp.type = 'lowpass'; lp.frequency.value = cutoff;
    gain.gain.setValueAtTime(amplitude, now);
    src.connect(lp); lp.connect(gain); gain.connect(out);
    src.start(now); src.stop(now + duration + 0.005);
  }

  /** Desk contact: weighted low thump + short felt/wood grain, not glass. */
  playLanding(intensity = 0.6, panX = 0) {
    const ctx = this.ensureContext();
    if (!ctx) return false;
    const stamp = performance.now();
    if (stamp - this.lastLandingTime < 160) return false;
    this.lastLandingTime = stamp;
    const now = ctx.currentTime;
    const force = Math.max(0.12, Math.min(1, Number(intensity) || 0.6))
      * this.masterVolume * this.collisionVolume;
    const out = this.createPanner(ctx, panX);
    const body = ctx.createOscillator(), bodyGain = ctx.createGain();
    body.type = 'sine';
    body.frequency.setValueAtTime(109, now);
    body.frequency.exponentialRampToValueAtTime(49, now + 0.18);
    bodyGain.gain.setValueAtTime(0.001, now);
    bodyGain.gain.linearRampToValueAtTime(0.32 * force, now + 0.008);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.23);
    body.connect(bodyGain); bodyGain.connect(out);
    body.start(now); body.stop(now + 0.235);
    this.playFeltNoise(ctx, out, now, 0.21 * force, 0.105, 1100);
    return true;
  }

  /** Small neck movement: soft double-layer hinge/fabric response. */
  playNod(intensity = 0.4, panX = 0) {
    const ctx = this.ensureContext();
    if (!ctx) return false;
    const stamp = performance.now();
    if (stamp - this.lastNodTime < 115) return false;
    this.lastNodTime = stamp;
    const now = ctx.currentTime;
    const force = Math.max(0.08, Math.min(1, Number(intensity) || 0.4)) * this.masterVolume;
    const out = this.createPanner(ctx, panX);
    this.playFeltNoise(ctx, out, now, force * 0.11, 0.08, 650);
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(164, now);
    osc.frequency.exponentialRampToValueAtTime(101, now + 0.10);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(force * 0.075, now + 0.010);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.115);
    osc.connect(gain); gain.connect(out);
    osc.start(now); osc.stop(now + 0.12);
    return true;
  }

  /** A fingertip click above a muted 130Hz recoil (not an injury effect). */
  playForeheadFlick(intensity = 0.5, panX = 0) {
    const ctx = this.ensureContext();
    if (!ctx) return false;
    const stamp = performance.now();
    if (stamp - this.lastFlickTime < 135) return false;
    this.lastFlickTime = stamp;
    const now = ctx.currentTime;
    const force = Math.max(0.12, Math.min(1, Number(intensity) || 0.5)) * this.masterVolume;
    const out = this.createPanner(ctx, panX);
    this.playFeltNoise(ctx, out, now, 0.20 * force, 0.034, 2400);
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(212, now);
    osc.frequency.exponentialRampToValueAtTime(115, now + 0.065);
    gain.gain.setValueAtTime(0.12 * force, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.080);
    osc.connect(gain); gain.connect(out);
    osc.start(now); osc.stop(now + 0.085);
    return true;
  }

  /**
   * 5. Mouse Wheel Z-Depth Scroll Tick (滚轮远近深度调节刻度音)
   * depthRatio: 0 (front glass Z=0) to 1 (deepest back wall Z=-maxDepth)
   */
  playDepthTick(depthRatio = 0.3, panX = 0) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const nowMs = performance.now();
    if (nowMs - this.lastDepthTickTime < 35) return;
    this.lastDepthTickTime = nowMs;

    const now = ctx.currentTime;
    const out = this.createPanner(ctx, panX);
    const vol = this.masterVolume * this.depthTickVolume;

    // Pitch shifts lower as the head goes deeper toward the vanishing point
    const pitch = 520 - depthRatio * 290;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.78, now + 0.045);

    gain.gain.setValueAtTime(0.16 * vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.055);
  }

  /**
   * 6. Click to Toggle 360° Rotation Mode Gimbal Lock/Unlock Sound (旋转模式切换机械音)
   */
  playRotationModeToggle(entering = true, panX = 0) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const out = this.createPanner(ctx, panX);
    const vol = this.masterVolume * 0.8;

    const freqs = entering ? [440, 660] : [620, 410];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t0 = now + idx * 0.055;
      osc.frequency.setValueAtTime(f, t0);
      osc.frequency.exponentialRampToValueAtTime(f * 1.06, t0 + 0.07);

      gain.gain.setValueAtTime(0.22 * vol, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.085);

      osc.connect(gain);
      gain.connect(out);
      osc.start(t0);
      osc.stop(t0 + 0.09);
    });
  }

  /**
   * 7. Summon / Recall Collectible Desktop Pet Sound (召唤/收回藏品桌宠音效)
   */
  playSummon(isSummon = true) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const vol = this.masterVolume * 0.75;
    const notes = isSummon ? [220, 330, 440, 659.25] : [523.25, 392, 261.63];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t0 = now + i * 0.045;
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.14 * vol, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.30);
    });
  }
  /**
   * 8. Container Snap / Specimen Placement Chime (将断头放入收纳装置建筑的清脆玻璃/黄铜落座音)
   */
  playContainerSnap(panX = 0) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const out = this.createPanner(ctx, panX);
    const vol = this.masterVolume * 0.85;

    // Deep brass pedestal thud + crystal glass bell-jar harmonic ring
    const freqs = [142, 528, 1056];
    const gains = [0.28, 0.14, 0.08];
    const durs = [0.16, 0.34, 0.46];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(f, now);
      gain.gain.setValueAtTime(gains[i] * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + durs[i]);
      osc.connect(gain);
      gain.connect(out);
      osc.start(now);
      osc.stop(now + durs[i] + 0.02);
    });
  }

  /**
   * 9. Cozy Rainy-Night Study Ambience ASMR (窗外清晰淅沥雨声 + 屋檐水滴敲击伴学白噪音)
   * Stage 76: eight-second, stereo, gently filtered shower with irregular soft drops.
   */
  startRainAmbience() {
    if (!this.rainEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const targetGainVal = Math.min(1.35, Math.max(0.0, this.rainVolume * this.masterVolume * 0.86));
    if (this.rainSource) {
      if (this.rainGain) {
        this.rainGain.gain.setTargetAtTime(targetGainVal, ctx.currentTime, 0.15);
      }
      return;
    }

    // The previous bed added loud unfiltered white noise and 680 identical
    // bright ping splashes every loop, plus a 190ms sine beep. Generate a
    // softer wide-band pink shower, sparse damped droplets and rare wood-eave
    // taps; no licensed audio file or network request is needed offline.
    const sr = ctx.sampleRate;
    const len = Math.round(sr * 8);
    const buffer = ctx.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < len; i++) {
        const t = i / sr;
        const gust = 0.80 + 0.12 * Math.sin(t * Math.PI * 2 / 8 + ch * 1.3)
          + 0.045 * Math.sin(t * Math.PI * 4 / 8 + ch * 0.7);
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.09) * 0.084 * gust;
        b6 = white * 0.115926;
      }
      // Uneven stereo patter: gentle short noise ripples, not high pure tones.
      for (let d = 0; d < 105; d++) {
        const dur = Math.round(sr * (0.012 + Math.random() * 0.025));
        const at = Math.floor(Math.random() * (len - dur - 1));
        const pitch = 430 + Math.random() * 720;
        const amp = 0.055 + 0.10 * Math.random();
        let filtered = 0;
        for (let k = 0; k < dur; k++) {
          const u = k / dur;
          filtered = filtered * 0.79 + (Math.random() * 2 - 1) * 0.21;
          const env = Math.sin(Math.PI * u) * Math.exp(-u * 3.2);
          const bead = 0.68 * filtered + 0.12 * Math.sin(2 * Math.PI * pitch * k / sr);
          data[at + k] += amp * bead * env;
        }
      }
      for (let d = 0; d < 9; d++) {
        const dur = Math.round(sr * (0.040 + Math.random() * 0.035));
        const at = Math.floor(Math.random() * (len - dur - 1));
        const pitch = 340 + Math.random() * 280;
        for (let k = 0; k < dur; k++) {
          const u = k / dur;
          data[at + k] += 0.025 * Math.sin(Math.PI * u)
            * Math.exp(-u * 5.2) * Math.sin(2 * Math.PI * pitch * k / sr);
        }
      }
      // Tiny loop seam is less conspicuous than a regularly repeating click.
      const fade = Math.round(sr * 0.028);
      for (let k = 0; k < fade; k++) {
        const f = Math.sin((k / fade) * Math.PI * 0.5);
        data[k] *= f;
        data[len - k - 1] *= f;
      }
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 88;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2100;
    lp.Q.value = 0.64;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(targetGainVal, ctx.currentTime + 0.75);
    src.connect(hp);
    hp.connect(lp);
    lp.connect(gain);
    gain.connect(ctx.destination);
    src.start();
    this.rainSource = src;
    this.rainGain = gain;
    // Drops live in the loop: no recurring oscillator timer or audio-node leak.
    if (this.rainDropTimer) { clearInterval(this.rainDropTimer); this.rainDropTimer = null; }
  }

  stopRainAmbience() {
    if (this.rainDropTimer) {
      clearInterval(this.rainDropTimer);
      this.rainDropTimer = null;
    }
    if (this.rainSource) {
      try { this.rainSource.stop(); } catch (_) {}
      try { this.rainSource.disconnect(); } catch (_) {}
      this.rainSource = null;
    }
    if (this.rainGain) {
      try { this.rainGain.disconnect(); } catch (_) {}
      this.rainGain = null;
    }
  }

  setRainAmbienceEnabled(enabled) {
    this.rainEnabled = Boolean(enabled);
    if (this.rainEnabled) {
      this.startRainAmbience();
    } else {
      this.stopRainAmbience();
    }
  }

  setRainVolume(vol) {
    this.rainVolume = Math.max(0, Math.min(1.5, Number(vol) || 0));
    if (this.rainGain && this.ctx) {
      const targetGainVal = Math.min(1.35, Math.max(0.0, this.rainVolume * this.masterVolume * 0.86));
      this.rainGain.gain.setTargetAtTime(targetGainVal, this.ctx.currentTime, 0.08);
    }
  }
}

export const soundEngine = new TactileSoundEngine();
