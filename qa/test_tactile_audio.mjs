import assert from 'node:assert/strict';
import { soundEngine } from '../src/audio/tactileSoundEngine.js';

class Param {
  constructor(value = 0) { this.value = value; this.events = []; }
  setValueAtTime(v, t) { this.value = v; this.events.push(['set', v, t]); }
  linearRampToValueAtTime(v, t) { this.value = v; this.events.push(['linear', v, t]); }
  exponentialRampToValueAtTime(v, t) { this.value = v; this.events.push(['exp', v, t]); }
  setTargetAtTime(v, t, decay) { this.value = v; this.events.push(['target', v, t, decay]); }
}
class Node {
  constructor() { this.connections = []; this.started = 0; this.stopped = 0; }
  connect(target) { this.connections.push(target); return target; }
  disconnect() { this.connections = []; }
  start() { this.started++; }
  stop() { this.stopped++; }
}
class FakeAudioContext {
  constructor() { this.sampleRate = 12000; this.currentTime = 1; this.state = 'running';
    this.destination = new Node(); this.sources = []; this.oscillators = []; this.filters = []; }
  createBuffer(channels, length, rate) {
    assert.equal(rate, this.sampleRate);
    const data = Array.from({ length: channels }, () => new Float32Array(length));
    return { numberOfChannels: channels, length, sampleRate: rate, getChannelData: index => data[index] };
  }
  createBufferSource() { const source = new Node(); this.sources.push(source); return source; }
  createOscillator() { const osc = new Node(); osc.frequency = new Param(); this.oscillators.push(osc); return osc; }
  createBiquadFilter() { const filter = new Node(); filter.frequency = new Param(); filter.Q = new Param(); this.filters.push(filter); return filter; }
  createGain() { const gain = new Node(); gain.gain = new Param(); return gain; }
  createStereoPanner() { const panner = new Node(); panner.pan = new Param(); return panner; }
}
const ctx = new FakeAudioContext();
soundEngine.ctx = ctx;
soundEngine.rainEnabled = true;
soundEngine.rainSource = null;
soundEngine.startRainAmbience();
const rain = soundEngine.rainSource;
assert(rain?.buffer, 'rain buffer connects to an actual source');
assert.equal(rain.buffer.numberOfChannels, 2);
assert.equal(rain.buffer.length, 8 * ctx.sampleRate, 'eight seconds without network audio');
const data = rain.buffer.getChannelData(0);
const rms = Math.sqrt(data.reduce((v, n) => v + n * n, 0) / data.length);
const peak = data.reduce((m, n) => Math.max(m, Math.abs(n)), 0);
assert(rms > 0.016 && rms < 0.16, `warm rain bed must be present but not roar; rms=${rms}`);
assert(peak < 0.6, `no hard clipped digital raindrops; peak=${peak}`);
assert.equal(soundEngine.rainDropTimer, null, 'no recurring beep/oscillator timer');
assert.equal(ctx.oscillators.length, 0, 'rain never plays 190ms pure-tone beeps');
soundEngine.setRainVolume(0.2);
assert(soundEngine.rainGain.gain.events.some(e => e[0] === 'target' && e[1] < 0.3));
soundEngine.stopRainAmbience();
assert.equal(soundEngine.rainSource, null);
assert.equal(rain.stopped, 1);

assert.equal(soundEngine.playLanding(0.8, 0.35), true);
assert.equal(soundEngine.playLanding(0.8, 0.35), false, 'landings are rate limited');
assert(ctx.oscillators.at(-1).frequency.events.some(e => e[0] === 'exp' && e[1] === 49),
  'desk landing includes a weighed downward low-frequency thud');
assert.equal(soundEngine.playNod(0.4, 0), true);
assert.equal(soundEngine.playNod(0.4, 0), false, 'nod repetition is capped');
assert.equal(soundEngine.playForeheadFlick(0.5, -0.5), true);
assert.equal(soundEngine.playForeheadFlick(0.5, -0.5), false, 'flick spam is capped');
assert(ctx.sources.every(src => src.started && src.stopped), 'short noise transients schedule source cleanup');
console.log(`TACTILE_AUDIO_TESTS_PASS: 8s stereo soft rain rms=${rms.toFixed(4)}, one-shot landing/nod/flick envelopes and rate limits`);
