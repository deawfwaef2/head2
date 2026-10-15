// 画质提升 · 眼睛 / 睫毛 / 眉毛 / 头发材质（独立模块）
import * as THREE from 'three';

/** 眼球：巩膜+虹膜底层（偏哑光、略暖），角膜：高光滑透明层，用于反射柔光箱形成真实眼神光 */
export function upgradeEyeMaterial(src) {
  const name = (src.name || '').toLowerCase();
  if (name.includes('cornea')) {
    const m = new THREE.MeshPhysicalMaterial({
      name: 'PhotorealCornea',
      color: 0xffffff,
      roughness: 0.03,
      metalness: 0,
      ior: 1.376,
      specularIntensity: 1.0,
      transparent: true,
      opacity: 0.04,
      depthWrite: false,
      envMapIntensity: 1.1,
    });
    // 让反射不被 opacity 一起削弱：透明度只作用在漫反射，高光保持
    m.onBeforeCompile = (s) => {
      s.fragmentShader = s.fragmentShader.replace(
        '#include <opaque_fragment>',
        `float specL = dot(outgoingLight - totalDiffuse, vec3(0.333));
         diffuseColor.a = clamp(diffuseColor.a + specL * 0.7, 0.0, 1.0);
         #include <opaque_fragment>`,
      );
    };
    m.customProgramCacheKey = () => 'photoreal-cornea-v1';
    return m;
  }
  const m = new THREE.MeshPhysicalMaterial({
    name: 'PhotorealEye',
    map: src.map || null,
    color: src.color ? src.color.clone() : new THREE.Color(1, 1, 1),
    roughness: 0.42,
    metalness: 0,
    sheen: 0.0,
  });
  if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
  // 巩膜不能是纯白：真人眼白在阴影和边缘偏灰、略暖
  // 眼部遮蔽（Eye Occlusion，数字人常用技巧）：上眼睑在眼球上投下柔和阴影、眼角变暗、边缘带一点湿润的粉红
  m.userData.eyeUniforms = { uEyeL: { value: new THREE.Vector3() }, uEyeR: { value: new THREE.Vector3() }, uEyeRad: { value: 0.012 }, uEyeOcc: { value: 0.75 } };
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, m.userData.eyeUniforms);
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vEyeObj;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvEyeObj = transformed;');
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vEyeObj; uniform vec3 uEyeL, uEyeR; uniform float uEyeRad, uEyeOcc;')
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
       diffuseColor.rgb *= vec3(0.93, 0.9, 0.87);
       {
         vec3 c = vEyeObj.x < 0.0 ? uEyeL : uEyeR;
         vec3 q = (vEyeObj - c) / uEyeRad;
         float upper = smoothstep(0.05, 0.62, q.y);            // 上眼睑阴影
         float lower = smoothstep(-0.25, -0.7, q.y) * 0.45;    // 下眼睑轻微阴影
         float corner = smoothstep(0.35, 0.85, abs(q.x)) * 0.6; // 内外眼角
         float lidLine = smoothstep(0.28, 0.5, q.y) * 0.55;      // 上睑缘接触阴影（睫毛根投在眼球上的那条暗线）
         float occ = clamp(upper + lower + corner + lidLine, 0.0, 1.0) * uEyeOcc;
         diffuseColor.rgb *= mix(vec3(1.0), vec3(0.42, 0.36, 0.35), occ);
         diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.05, 0.86, 0.84), corner * 0.6 * uEyeOcc); // 眼角湿润粉红
       }`,
    );
  };
  m.customProgramCacheKey = () => 'photoreal-eye-v3';
  return m;
}

export const LASH_DEFAULTS = { lashDensity: 1.0, lashLower: 0.5, lashDark: 0.9, lashLine: 0.6 };

/**
 * 睫毛（v3）。旧版两个 bug 让睫毛几乎完全不可见：
 *  1) 贴图里每根睫毛只有 1~2px 宽，mipmap 平均后 alpha < alphaTest(0.14) → 整根被丢弃，只剩根部几个点；
 *  2) 下睫毛再乘 0.18 → 0.62×0.9×0.18≈0.10 < 0.14 → 下睫毛全部丢弃。
 * 新版：负 LOD 偏移采样 + 邻域 max 保留细丝，alpha 用 smoothstep 抬升；alphaTest 降到 0.02 只裁掉空白；
 * 根部更浓（睫毛线 / 天然眼线），下睫毛按强度淡化但不丢弃。所有强度走 uniform，可在效果总线里开关/连线。
 */
export function upgradeLashMaterial(src, eyeY = 0) {
  const m = new THREE.MeshStandardMaterial({
    name: 'PhotorealLash',
    map: src.map || null,
    color: new THREE.Color(1, 1, 1),
    roughness: 0.48,
    transparent: true,
    opacity: 1,
    alphaTest: 0.02,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  if (m.map) { m.map.colorSpace = THREE.SRGBColorSpace; m.map.anisotropy = 8; m.map.needsUpdate = true; }
  m.userData.lashUniforms = {
    uEyeY: { value: eyeY }, uLashDensity: { value: LASH_DEFAULTS.lashDensity }, uLashLower: { value: LASH_DEFAULTS.lashLower },
    uLashDark: { value: LASH_DEFAULTS.lashDark }, uLashLine: { value: LASH_DEFAULTS.lashLine },
  };
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, m.userData.lashUniforms);
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nvarying float vLashY;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvLashY = transformed.y;');
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vLashY; uniform float uEyeY, uLashDensity, uLashLower, uLashDark, uLashLine;')
      .replace('#include <map_fragment>', `
      #ifdef USE_MAP
        vec2 lpx = vec2(1.0 / 512.0);
        float la = texture(map, vMapUv, -1.5).a;
        la = max(la, 0.8 * texture(map, vMapUv + vec2(lpx.x, 0.0), -1.5).a);
        la = max(la, 0.8 * texture(map, vMapUv - vec2(lpx.x, 0.0), -1.5).a);
        float lblur = texture(map, vMapUv, 2.5).a;               // 粗 mip：睫毛密集处（根部）
        float lashA = smoothstep(0.02, 0.32, la);
        float rootA = smoothstep(0.08, 0.35, lblur) * uLashLine;  // 根部连成一条细细的睫毛线
        float upper = smoothstep(uEyeY - 0.004, uEyeY + 0.001, vLashY);
        float a = max(lashA, rootA * 0.85) * uLashDensity * mix(uLashLower, 1.0, upper);
        diffuseColor.rgb = mix(vec3(0.075, 0.06, 0.052), vec3(0.012, 0.009, 0.008), uLashDark);
        diffuseColor.a = clamp(a, 0.0, 1.0);
      #endif`);
  };
  m.customProgramCacheKey = () => 'photoreal-lash-v3';
  return m;
}

export function setLashParams(m, p) {
  const u = m?.userData?.lashUniforms; if (!u) return;
  if (p.eyeY != null) u.uEyeY.value = p.eyeY;
  if (p.lashDensity != null) u.uLashDensity.value = p.lashDensity;
  if (p.lashLower != null) u.uLashLower.value = p.lashLower;
  if (p.lashDark != null) u.uLashDark.value = p.lashDark;
  if (p.lashLine != null) u.uLashLine.value = p.lashLine;
}

export function upgradeBrowMaterial(src) {
  const m = new THREE.MeshStandardMaterial({
    name: 'PhotorealBrow',
    map: src.map || null,
    color: new THREE.Color(0.55, 0.47, 0.42),
    roughness: 0.85,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  });
  if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
  m.userData.browU = { uBrowBase: { value: 1 } };
  // 原眉毛贴图 alpha 只有 0/224 两档 → 边缘像贴纸。这里对真实贴图做多点采样羽化，边缘自然过渡
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, m.userData.browU);
    s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uBrowBase;').replace(
      '#include <map_fragment>',
      `#ifdef USE_MAP
         vec4 bt = texture2D(map, vMapUv);
         vec2 px = vec2(2.0 / 512.0);
         float a = 0.0;
         for (int i = -2; i <= 2; i++) for (int j = -2; j <= 2; j++) a += texture2D(map, vMapUv + vec2(float(i), float(j)) * px).a;
         a /= 25.0;
         float soft = smoothstep(0.15, 0.95, a) * 0.8 + bt.a * 0.2;
         diffuseColor.rgb *= mix(vec3(0.16, 0.12, 0.105), bt.rgb, 0.35);
         diffuseColor.a *= soft * 0.78 * uBrowBase;
       #endif`,
    );
  };
  m.customProgramCacheKey = () => 'photoreal-brow-v3';
  m.color.setRGB(1, 1, 1);
  return m;
}

export const HAIR_DEFAULTS = {
  color: [0.032, 0.023, 0.019], // 东亚自然黑发：深棕黑（线性空间），不是纯黑
  roughness: 0.62,
  textureInfluence: 0.6,
  spec1: 0.09, spec1Exp: 220.0,   // 主高光 R：发丝表皮反射，冷白、细
  spec2: 0.07, spec2Exp: 40.0,   // 次高光 TRT：穿过发丝内部，带发色、宽
  shift2: -0.18,
  normalBlend: 0.62,             // 发片法线 → 头部体积法线 混合，消除发片棱角
  headCenter: [0.0, 0.012, -0.005],
  crown: [0.0, 0.135, -0.02],
  scalpRadius: 0.092,
  inset: 0.0,
};

const HAIR_VERT_DECL = /* glsl */ `
uniform vec3 uHeadCenter; uniform vec3 uCrown; uniform float uInset;
attribute float aScalpD; varying float vScalpD;
varying vec3 vHairFlow; varying vec3 vHairRadial; varying float vHairDepth;
varying vec3 vHairLocalPos;
`;
const HAIR_VERT_MAIN = /* glsl */ `
vHairLocalPos = transformed;
{
  float minScalpClearance = 0.0022;
  float targetScalpD = max(minScalpClearance, aScalpD - uInset * smoothstep(0.0035, 0.015, aScalpD));
  transformed += normalize(transformed - uHeadCenter) * (targetScalpD - aScalpD);
}
vScalpD = aScalpD;
{
  vec3 p = transformed;
  vec3 flow = normalize(p - uCrown);
  vec3 rad = normalize(p - uHeadCenter);
  vHairFlow = normalize(mat3(modelViewMatrix) * flow);
  vHairRadial = normalize(normalMatrix * rad);
  vHairDepth = length(p - uHeadCenter);
}
`;
const HAIR_FRAG_DECL = /* glsl */ `
uniform float uTexInfluence, uSpec1, uSpec1Exp, uSpec2, uSpec2Exp, uShift2, uNormalBlend, uScalpRadius, uScalpFade;
varying float vScalpD;
varying vec3 vHairFlow; varying vec3 vHairRadial; varying float vHairDepth;
varying vec3 vHairLocalPos;
vec3 gHairT = vec3(0.0, 1.0, 0.0);
vec3 gHairTint = vec3(1.0);
float gHairAO = 1.0;
`;

function patchHairShader(s, o, tipsPass, shared) {
  Object.assign(s.uniforms, {
    uTexInfluence: { value: o.textureInfluence },
    uSpec1: { value: o.spec1 }, uSpec1Exp: { value: o.spec1Exp },
    uSpec2: { value: o.spec2 }, uSpec2Exp: { value: o.spec2Exp },
    uShift2: { value: o.shift2 }, uNormalBlend: { value: o.normalBlend },
    uHeadCenter: { value: new THREE.Vector3(...o.headCenter) },
    uCrown: { value: new THREE.Vector3(...o.crown) },
    uScalpRadius: { value: o.scalpRadius },
  });
  s.uniforms.uInset = shared.uInset;
  s.uniforms.uScalpFade = shared.uScalpFade;
  s.vertexShader = s.vertexShader
    .replace('#include <common>', '#include <common>\n' + HAIR_VERT_DECL)
    .replace('#include <project_vertex>', HAIR_VERT_MAIN + '#include <project_vertex>');
  const lights = THREE.ShaderChunk.lights_physical_pars_fragment
    .replace(
      'vec3 irradiance = dotNL * directLight.color;',
      `float hWrap = clamp((dot(geometryNormal, directLight.direction) + 0.45) / 1.45, 0.0, 1.0);
       vec3 irradiance = hWrap * directLight.color;`,
    )
    .replace(
      'reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );',
      `{
         vec3 H = normalize(directLight.direction + geometryViewDir);
         float t1 = dot(gHairT, H);
         float s1 = pow(sqrt(max(0.0, 1.0 - t1 * t1)), uSpec1Exp);
         vec3 T2 = normalize(gHairT + geometryNormal * uShift2);
         float t2 = dot(T2, H);
         float s2 = pow(sqrt(max(0.0, 1.0 - t2 * t2)), uSpec2Exp);
         reflectedLight.directSpecular += irradiance * gHairAO * (uSpec1 * s1 + uSpec2 * s2 * gHairTint);
       }`,
    );
  s.fragmentShader = s.fragmentShader
    .replace('#include <common>', '#include <common>\n' + HAIR_FRAG_DECL)
    .replace('#include <lights_physical_pars_fragment>', lights)
    .replace(
      '#include <map_fragment>',
      `#ifdef USE_MAP
         vec4 hTex = texture2D( map, vMapUv );
         float lum = dot(hTex.rgb, vec3(0.299, 0.587, 0.114));
         lum = mix(0.45, min(lum, 0.8), smoothstep(0.2, 0.8, hTex.a));
         vec3 strand = mix(vec3(1.0), vec3(0.6 + lum * 0.8), uTexInfluence);
         diffuseColor.rgb *= strand;
         diffuseColor.a *= hTex.a;
       #endif
       gHairTint = normalize(diffuseColor.rgb + 1e-4) * 1.2;
       // 内层发丝更暗（发量体积感），越靠近头皮越暗
       gHairAO = mix(0.35, 1.0, smoothstep(uScalpRadius, uScalpRadius + 0.022, vHairDepth));
       diffuseColor.rgb *= gHairAO;`,
    )
    .replace(
      '#include <normal_fragment_maps>',
      `#include <normal_fragment_maps>
       {
         vec3 rad = normalize(vHairRadial);
         normal = normalize(mix(normal, rad, uNormalBlend));
         vec3 f = normalize(vHairFlow);
         gHairT = normalize(f - normal * dot(f, normal));
       }`,
    );
  // 发丝模式：发片底衬只保留贴近头皮的部分（距头皮 > uScalpFade 的发片剔除），且前额刘海下方绝不渲染低模底衬发片
  s.fragmentShader = s.fragmentShader.replace(
    '#include <alphatest_fragment>',
    `#include <alphatest_fragment>
     if (uScalpFade > 0.0) {
       if (vScalpD > uScalpFade) discard;
       if (vHairLocalPos.z > 0.044 && vHairLocalPos.y < 0.082) {
         float fhKeep = (1.0 - smoothstep(0.044, 0.056, vHairLocalPos.z)) * smoothstep(0.068, 0.082, vHairLocalPos.y);
         if (fhKeep < 0.5) discard;
       }
     }`,
  );
  if (tipsPass) {
    s.fragmentShader = s.fragmentShader.replace(
      '#include <alphatest_fragment>',
      '#include <alphatest_fragment>\n if (diffuseColor.a >= 0.45) discard;',
    );
  }
}

/**
 * 头发：两遍渲染
 *  A. 不透明核心（alphaTest 0.22，写深度，投射阴影）→ 体积、遮挡、发丝投影到额头
 *  B. 半透明发梢（只画 alpha<0.3 的部分，不写深度）→ 发际线与发梢的柔软过渡
 * 着色：Kajiya-Kay 双高光（R 冷白细高光 + TRT 带发色宽高光），切线来自“头顶→发梢”的 3D 连续流场，
 * 不依赖发片 UV 方向；法线与头部体积法线混合，消除发片棱角与三角面闪烁。
 */
export function buildHairMaterials(src, opts = {}) {
  const o = { ...HAIR_DEFAULTS, ...opts };
  const base = {
    map: src.map || null,
    color: new THREE.Color(...o.color),
    roughness: o.roughness,
    metalness: 0,
    side: THREE.DoubleSide,
    envMapIntensity: 0.3,
  };
  if (base.map) { base.map.colorSpace = THREE.SRGBColorSpace; base.map.anisotropy = 8; }
  const shared = { uInset: { value: o.inset }, uScalpFade: { value: 0 } };
  const core = new THREE.MeshStandardMaterial({ ...base, name: 'PhotorealHairCore', alphaTest: 0.22, alphaToCoverage: true });
  core.onBeforeCompile = (s) => patchHairShader(s, o, false, shared);
  core.customProgramCacheKey = () => 'photoreal-hair-core-v5';
  const tips = new THREE.MeshStandardMaterial({ ...base, name: 'PhotorealHairTips', transparent: true, depthWrite: false, alphaTest: 0.04 });
  tips.onBeforeCompile = (s) => patchHairShader(s, o, true, shared);
  tips.customProgramCacheKey = () => 'photoreal-hair-tips-v5';
  return { core, tips, shared };
}

export function applyHairColor(mats, rgb) {
  for (const m of [mats.core, mats.tips]) m.color.setRGB(rgb[0], rgb[1], rgb[2]);
}
