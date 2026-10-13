import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

/**
 * Stage 13a · 电影级唯美后期链 (Beauty Post Chain)
 * - RenderPass(线性 HDR) → UnrealBloomPass(阈值辉光) → BeautyGrade(暗角/饱和/对比) → OutputPass(ACES + sRGB)
 * - 全部来自 three/addons，随 Vite 打包内联，file:// 离线零外部请求
 * - 阈值只让眼球高光/发丝束闪/轮廓光晕开，皮肤与解剖断面主体不受影响
 * - 透明背景 (alpha) 全程保留：桌宠仍可悬浮于桌面/网页之上
 * - 任何初始化异常都由调用方 try/catch 回退为 renderer.render 直渲，永不黑屏
 */

export const BeautyGradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    uVignette: { value: 0.30 },
    uSaturation: { value: 1.07 },
    uContrast: { value: 1.05 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float uVignette;
    uniform float uSaturation;
    uniform float uContrast;
    varying vec2 vUv;
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      vec3 col = c.rgb;
      // 以线性 0.18 灰为支点的轻柔 S 对比
      col = (col - vec3(0.18)) * uContrast + vec3(0.18);
      // 饱和度（线性亮度权重）
      float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = mix(vec3(luma), col, uSaturation);
      // 电影暗角（只压 RGB，不碰 alpha，透明桌宠边缘不受影响）
      vec2 d = vUv - vec2(0.5);
      float v = 1.0 - uVignette * smoothstep(0.15, 0.75, length(d) * 1.35);
      col *= v;
      gl_FragColor = vec4(col, c.a);
    }
  `,
};

export function createBeautyPostChain(renderer, scene, camera, options = {}) {
  const width = Math.max(2, Math.floor(options.width || 512));
  const height = Math.max(2, Math.floor(options.height || 512));
  const pixelRatio = options.pixelRatio || renderer.getPixelRatio();

  // Stage 15: WebGL2 下给后期链 4x MSAA 渲染目标——这是网页版最接近 DLAA 的一环：
  // 后期(Bloom/调色)不再把原生 MSAA 抗锯齿结果冲掉，发丝边缘在桌宠透明背景上也不毛糙。
  let renderTarget;
  try {
    renderTarget = new THREE.WebGLRenderTarget(width, height, {
      type: THREE.HalfFloatType,
      samples: 4,
    });
  } catch (_) { renderTarget = undefined; }
  const composer = new EffectComposer(renderer, renderTarget);
  composer.setPixelRatio(pixelRatio);
  composer.setSize(width, height);

  const renderPass = new RenderPass(scene, camera);

  // 保守阈值辉光：只有高光溢出，绝不洗白皮肤/断面
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    options.bloomStrength ?? 0.22,
    options.bloomRadius ?? 0.55,
    options.bloomThreshold ?? 0.85
  );

  const gradePass = new ShaderPass(BeautyGradeShader);
  gradePass.uniforms.uVignette.value = options.vignette ?? 0.30;
  gradePass.uniforms.uSaturation.value = options.saturation ?? 1.07;
  gradePass.uniforms.uContrast.value = options.contrast ?? 1.05;

  // OutputPass 读取 renderer.toneMapping(ACES) 做最终色调映射 + sRGB 输出
  const outputPass = new OutputPass();

  composer.addPass(renderPass);
  composer.addPass(bloomPass);
  composer.addPass(gradePass);
  composer.addPass(outputPass);

  const chain = {
    composer,
    bloomPass,
    gradePass,
    enabled: true,
    setSize(w, h) {
      const ww = Math.max(2, Math.floor(w));
      const hh = Math.max(2, Math.floor(h));
      composer.setSize(ww, hh);
    },
    setPixelRatio(r) {
      composer.setPixelRatio(r);
    },
    syncSize(w, h, r) {
      if (r) composer.setPixelRatio(r);
      chain.setSize(w, h);
    },
    setEnabled(v) {
      chain.enabled = v !== false;
    },
    render() {
      composer.render();
    },
  };
  return chain;
}
