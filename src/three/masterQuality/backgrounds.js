// 画质提升 · 虚化环境背景（程序化绘制，不使用任何照片）
// 真实人像的背景几乎都是“被浅景深虚化的真实环境”（窗、灯、绿植、房间），而不是纯色渐变。
// 这里用 Canvas 画出大块明暗 + 光斑（bokeh），整体高斯模糊，作为屏幕空间背景板，随相机方位轻微视差。
import * as THREE from 'three';

function rng(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }
function bokeh(g, x, y, r, color, alpha) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, color.replace('A', String(alpha)));
  gr.addColorStop(0.72, color.replace('A', String(alpha * 0.85)));
  gr.addColorStop(0.92, color.replace('A', String(alpha * 1.1)));
  gr.addColorStop(1, color.replace('A', '0'));
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
}

const PAINTERS = {
  roomWarm(g, W, H, R) {
    const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#6d5846'); bg.addColorStop(0.55, '#3b2e25'); bg.addColorStop(1, '#1d1612');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.filter = 'blur(28px)';
    g.fillStyle = 'rgba(255,236,205,0.85)'; g.fillRect(W * 0.05, H * 0.06, W * 0.26, H * 0.5); // 窗
    g.fillStyle = 'rgba(60,45,35,0.9)'; g.fillRect(W * 0.17, H * 0.04, W * 0.025, H * 0.55); g.fillRect(W * 0.04, H * 0.3, W * 0.3, H * 0.025);
    g.fillStyle = 'rgba(25,18,14,0.85)'; g.fillRect(W * 0.62, H * 0.55, W * 0.4, H * 0.5); // 家具
    const lamp = g.createRadialGradient(W * 0.82, H * 0.32, 0, W * 0.82, H * 0.32, W * 0.2); lamp.addColorStop(0, 'rgba(255,200,130,0.75)'); lamp.addColorStop(1, 'rgba(255,200,130,0)');
    g.fillStyle = lamp; g.fillRect(0, 0, W, H);
    g.filter = 'blur(3px)';
    for (let i = 0; i < 9; i++) bokeh(g, W * (0.05 + R() * 0.3), H * (0.08 + R() * 0.45), 18 + R() * 26, 'rgba(255,240,215,A)', 0.18 + R() * 0.15);
  },
  sheerCurtain(g, W, H, R) {
    const bg = g.createLinearGradient(0, 0, W, 0); bg.addColorStop(0, '#f2ebe2'); bg.addColorStop(0.6, '#d8cbbd'); bg.addColorStop(1, '#a8978a');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.filter = 'blur(16px)';
    for (let i = 0; i < 18; i++) { const x = (i / 18) * W + R() * 20; g.fillStyle = `rgba(${R() < 0.5 ? '255,252,246' : '170,155,142'},${0.25 + R() * 0.3})`; g.fillRect(x, 0, 14 + R() * 30, H); }
    const glow = g.createRadialGradient(W * 0.2, H * 0.3, 0, W * 0.2, H * 0.3, W * 0.5); glow.addColorStop(0, 'rgba(255,255,250,0.8)'); glow.addColorStop(1, 'rgba(255,255,250,0)');
    g.fillStyle = glow; g.fillRect(0, 0, W, H);
  },
  grayWall(g, W, H) {
    const bg = g.createRadialGradient(W * 0.42, H * 0.38, 0, W * 0.5, H * 0.5, W * 0.75); bg.addColorStop(0, '#77736f'); bg.addColorStop(0.6, '#45423f'); bg.addColorStop(1, '#1e1d1c');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
  },
  windowShadow(g, W, H) {
    const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#4c5d66'); bg.addColorStop(1, '#151d22');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.filter = 'blur(10px)';
    g.save(); g.translate(W * 0.55, H * 0.2); g.rotate(0.42);
    g.fillStyle = 'rgba(255,236,200,0.55)';
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) g.fillRect(i * 150, j * 170, 130, 150);
    g.restore();
  },
  garden(g, W, H, R) {
    const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#9fb98a'); bg.addColorStop(0.5, '#4f6b3c'); bg.addColorStop(1, '#22301b');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.filter = 'blur(20px)';
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${30 + R() * 40},${60 + R() * 60},${20 + R() * 30},${0.4 + R() * 0.4})`; g.beginPath(); g.ellipse(R() * W, R() * H, 30 + R() * 70, 20 + R() * 50, R() * 3, 0, Math.PI * 2); g.fill(); }
    g.filter = 'blur(2px)';
    for (let i = 0; i < 26; i++) bokeh(g, R() * W, R() * H * 0.7, 10 + R() * 24, 'rgba(255,250,215,A)', 0.2 + R() * 0.3);
  },
  goldenHour(g, W, H, R) {
    const bg = g.createRadialGradient(W * 0.15, H * 0.25, 0, W * 0.3, H * 0.4, W * 0.9); bg.addColorStop(0, '#ffd59a'); bg.addColorStop(0.35, '#b8743a'); bg.addColorStop(1, '#2a160b');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.filter = 'blur(2px)';
    for (let i = 0; i < 22; i++) bokeh(g, W * (0.02 + R() * 0.5), H * (0.05 + R() * 0.6), 12 + R() * 30, 'rgba(255,214,150,A)', 0.15 + R() * 0.3);
  },
  cityNight(g, W, H, R) {
    const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#0d1424'); bg.addColorStop(1, '#05070c');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.filter = 'blur(1.5px)';
    const cols = ['rgba(255,170,90,A)', 'rgba(255,90,120,A)', 'rgba(90,170,255,A)', 'rgba(255,230,180,A)', 'rgba(120,255,220,A)'];
    for (let i = 0; i < 60; i++) bokeh(g, R() * W, H * (0.2 + R() * 0.75), 8 + R() * 30, cols[Math.floor(R() * cols.length)], 0.15 + R() * 0.35);
  },
  cafe(g, W, H, R) {
    const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#3a2a20'); bg.addColorStop(1, '#120c09');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.filter = 'blur(26px)';
    g.fillStyle = 'rgba(120,85,60,0.7)'; g.fillRect(0, H * 0.62, W, H * 0.06);
    g.fillStyle = 'rgba(200,160,120,0.35)'; g.fillRect(W * 0.6, H * 0.1, W * 0.35, H * 0.4);
    g.filter = 'blur(2px)';
    for (let i = 0; i < 14; i++) bokeh(g, W * (0.05 + R() * 0.9), H * (0.05 + R() * 0.3), 14 + R() * 20, 'rgba(255,196,120,A)', 0.25 + R() * 0.3);
  },
};

export const BACKGROUNDS = {
  studio: { label: '纯色影棚（渐变）' },
  roomWarm: { label: '暖色卧室 · 窗边' },
  sheerCurtain: { label: '白纱帘 · 柔光' },
  windowShadow: { label: '窗影墙面' },
  grayWall: { label: '冷灰墙面' },
  garden: { label: '绿植午后' },
  goldenHour: { label: '黄昏光斑' },
  cafe: { label: '咖啡馆暖灯' },
  cityNight: { label: '城市夜景光斑' },
};

export const BACKGROUNDS_LIST = Object.entries(BACKGROUNDS).map(([id, v]) => ({ id, label: v.label }));

const cache = {};
export function backgroundTexture(id) {
  if (!PAINTERS[id]) return null;
  if (cache[id]) return cache[id];
  const W = 1024, H = 768; const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  PAINTERS[id](g, W, H, rng(1234 + id.length * 77));
  g.filter = 'none';
  // 最后整体再柔化一次 + 细微颗粒，像真实镜头焦外
  const cv2 = document.createElement('canvas'); cv2.width = W; cv2.height = H; const g2 = cv2.getContext('2d');
  g2.filter = 'blur(6px)'; g2.drawImage(cv, 0, 0);
  const t = new THREE.CanvasTexture(cv2); t.colorSpace = THREE.SRGBColorSpace; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
  return (cache[id] = t);
}

export const makeBackdropTexture = backgroundTexture;

