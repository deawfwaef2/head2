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
   * Stage 28: High-presence 6s stereo buffer with baked raindrop impacts & water splashes so it is clearly audible!
   */
  startRainAmbience() {
    if (!this.rainEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const targetGainVal = Math.min(1.85, Math.max(0.0, this.rainVolume * this.masterVolume * 1.45));
    if (this.rainSource) {
      if (this.rainGain) {
        this.rainGain.gain.setTargetAtTime(targetGainVal, ctx.currentTime, 0.15);
      }
      return;
    }

    // Create 6-second looping stereo rain shower + crisp raindrop patter buffer
    const sr = ctx.sampleRate;
    const len = sr * 6;
    const buffer = ctx.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < len; i++) {
        const t = i / sr;
        // Gentle breathing rain gust envelope
        const gust = 0.84 + 0.16 * Math.sin(t * Math.PI * 2 / 6.0 + ch * 1.1)
                          + 0.08 * Math.cos(t * Math.PI * 4 / 6.0);
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        // Rich, warm pink-noise rain shower bed (8x stronger than Stage 27)
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.65) * 0.145 * gust;
        b6 = white * 0.115926;
      }

      // Bake 340 crisp individual raindrop impacts & water splashes per channel across the 6s loop
      for (let d = 0; d < 340; d++) {
        const startIdx = Math.floor(Math.random() * (len - 2400));
        const dropDur = Math.floor(sr * (0.008 + Math.random() * 0.024));
        const freq = 680 + Math.random() * 1650;
        const pitchSlide = 1.18 + Math.random() * 0.28;
        const amp = (0.14 + Math.random() * 0.24) * (Math.random() < 0.25 ? 1.35 : 0.85);
        for (let k = 0; k < dropDur && (startIdx + k) < len; k++) {
          const u = k / dropDur;
          const env = Math.sin(u * Math.PI) * Math.exp(-u * 3.8);
          const instFreq = freq * (1.0 + u * (pitchSlide - 1.0));
          const tone = Math.sin(2 * Math.PI * instFreq * (k / sr));
          const splash = (Math.random() * 2 - 1) * Math.exp(-u * 6.5) * 0.65;
          data[startIdx + k] = Math.max(-0.98, Math.min(0.98, data[startIdx + k] + (tone * 0.55 + splash * 0.45) * amp * env));
        }
      }
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    // Warm acoustic shaping (preserves crisp raindrop transients up to 3.4 kHz)
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 3400;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 150;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(targetGainVal, ctx.currentTime + 0.45);

    src.connect(hp);
    hp.connect(lp);
    lp.connect(gain);
    gain.connect(ctx.destination);
    src.start();

    this.rainSource = src;
    this.rainGain = gain;

    // Live stochastic eaves water droplets & windowpane patters
    if (this.rainDropTimer) clearInterval(this.rainDropTimer);
    this.rainDropTimer = setInterval(() => {
      if (!this.rainEnabled || !this.enabled || !this.ctx || this.ctx.state !== 'running') return;
      const now = this.ctx.currentTime;
      const v = this.rainVolume * this.masterVolume;
      if (v <= 0.01) return;

      // Distinct water droplet hitting study windowsill
      if (Math.random() < 0.85) {
        const dropOsc = this.ctx.createOscillator();
        const dropGain = this.ctx.createGain();
        const pan = this.createPanner(this.ctx, (Math.random() - 0.5) * 1.5);
        const baseFreq = 780 + Math.random() * 1120;
        dropOsc.type = 'sine';
        dropOsc.frequency.setValueAtTime(baseFreq, now);
        dropOsc.frequency.exponentialRampToValueAtTime(baseFreq * 1.38, now + 0.036);
        dropGain.gain.setValueAtTime(0.095 * v, now);
        dropGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.045);
        dropOsc.connect(dropGain);
        dropGain.connect(pan);
        dropOsc.start(now);
        dropOsc.stop(now + 0.05);
      }
    }, 190);
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
      const targetGainVal = Math.min(1.85, Math.max(0.0, this.rainVolume * this.masterVolume * 1.45));
      this.rainGain.gain.setTargetAtTime(targetGainVal, this.ctx.currentTime, 0.08);
    }
  }
}

export const soundEngine = new TactileSoundEngine();
