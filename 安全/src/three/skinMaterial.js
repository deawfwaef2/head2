// 画质提升 · 真人皮肤着色（独立模块）
// 关键点（全部是着色/光学层面，不手绘任何五官贴图，不改动网格顶点）：
//  1) 预积分次表面散射（Pre-integrated SSS）近似：按 R/G/B 分通道“包裹”明暗交界线，
//     红光在皮肤里走得更远 → 明暗交界处出现真人那种暖红过渡，而不是 CG 的灰黑硬边。
//     散射宽度随屏幕空间曲率变化（鼻翼、耳朵、嘴唇这些小半径部位更通透）。
//  2) 分通道法线：红通道用更平滑的几何法线、蓝通道用带毛孔的细节法线（Penner 2011 做法），
//     既保留毛孔高光颗粒，又避免“橘皮”。
//  3) 双瓣高光：基础 GGX（粗糙 0.5，大面积柔光）+ 低强度清漆瓣（粗糙 0.3，皮脂微光），
//     皮肤 IOR 1.4（F0≈0.028）。再加少量 sheen 模拟面部绒毛在逆光边缘的柔亮。
//  4) 反照率只做全局色彩校准（对比/饱和/伽马），不涂任何妆容。
import * as THREE from 'three';
import { HAIRLINE_SKIN_GLSL } from './hairlineBlend.js';

export const SKIN_DEFAULTS = {
  roughness: 0.56,
  normalScale: 0.8,
  scatter: 1.0,          // 次表面散射强度
  curvatureScale: 1 / 140, // 曲率→散射映射（场景单位为米时）
  dualLobe: 0.07,        // 第二高光瓣强度
  dualLobeRoughness: 0.32,
  sheen: 0.1,
  albedoContrast: 1.08,
  albedoSaturation: 1.22,
  albedoGamma: 1.12,
  subsurfaceTint: [1.0, 0.36, 0.24],
  micro: 0.55,       // 程序化毛孔微法线（不需要高模/高清贴图）
  breakup: 0.5,      // 高光破碎：粗糙度微变化，打破塑料感的均匀高光
  mottle: 0.5,       // 肤色斑驳：真实皮肤的细微红/黄不均
  regional: 0.7,     // 面部分区：鼻头/脸颊微红、眼下微暗、T 区更油亮、嘴唇更润（程序化，非手绘）
  translucency: 0.8, // 逆光透光：耳朵、鼻翼等薄处透出红光
};

// 3D 值噪声（对象空间，随头部移动不游走）
const NOISE_GLSL = /* glsl */ `
varying vec3 vSkinObj;
uniform float uMicro, uBreakup, uMottle, uRegional;
uniform vec3 uFaceEyeL, uFaceEyeR, uFaceNose;
float sk_blob(vec3 p, vec3 c, vec3 r){ vec3 q = (p - c) / r; return exp(-dot(q, q)); }
// 面部分区权重：x=红润 y=眼下暗沉 z=T区油光 w=嘴唇
vec4 sk_regions(vec3 p){
  vec3 eL = uFaceEyeL, eR = uFaceEyeR, n = uFaceNose;
  float ed = abs(eR.x - eL.x);                 // 眼距，作为比例尺
  float red = sk_blob(p, n, vec3(0.16, 0.14, 0.2) * ed) * 1.0
            + sk_blob(p, vec3(eL.x * 1.05, eL.y - 0.55 * ed, eL.z), vec3(0.42, 0.32, 0.4) * ed) * 0.8
            + sk_blob(p, vec3(eR.x * 1.05, eR.y - 0.55 * ed, eR.z), vec3(0.42, 0.32, 0.4) * ed) * 0.8;
  float under = sk_blob(p, vec3(eL.x, eL.y - 0.2 * ed, eL.z), vec3(0.3, 0.1, 0.3) * ed) + sk_blob(p, vec3(eR.x, eR.y - 0.2 * ed, eR.z), vec3(0.3, 0.1, 0.3) * ed);
  float tz = sk_blob(p, vec3(0.0, eL.y + 0.75 * ed, n.z - 0.3 * ed), vec3(0.9, 0.35, 0.6) * ed)
           + sk_blob(p, vec3(0.0, (eL.y + n.y) * 0.5, n.z - 0.1 * ed), vec3(0.12, 0.5, 0.3) * ed) + sk_blob(p, n, vec3(0.14, 0.12, 0.2) * ed);
  float lip = sk_blob(p, vec3(0.0, n.y - 0.62 * ed, n.z - 0.22 * ed), vec3(0.45, 0.16, 0.3) * ed);
  return clamp(vec4(red, under, tz, lip), 0.0, 1.0);
}

float sk_h(vec3 p){ p = fract(p*0.3183099+0.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float sk_n(vec3 x){ vec3 i=floor(x); vec3 f=fract(x); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(sk_h(i),sk_h(i+vec3(1,0,0)),f.x),mix(sk_h(i+vec3(0,1,0)),sk_h(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(sk_h(i+vec3(0,0,1)),sk_h(i+vec3(1,0,1)),f.x),mix(sk_h(i+vec3(0,1,1)),sk_h(i+vec3(1,1,1)),f.x),f.y),f.z); }
// 毛孔：倒置的细胞状凹坑 + 细纹
// 毛孔：稀疏、圆润的小凹点（平滑噪声阈值化）+ 极细的皮纹，避免“拉毛墙面”的块状感
float sk_pore(vec3 p){
  float a = sk_n(p) * 0.6 + sk_n(p * 1.97 + 11.3) * 0.4;
  float pits = smoothstep(0.62, 0.86, a);            // 稀疏凹点
  float fine = sk_n(p * 3.7 + 5.0) * 0.25;           // 细皮纹
  return -pits + fine;
}
`;


const SKIN_DIRECT_GLSL = /* glsl */ `
uniform float uSkinScatter;
uniform vec3 uSkinTint;
uniform float uTrans;
float gSkinCurv = 0.0;
vec3 gSkinSmoothN = vec3(0.0, 0.0, 1.0);
vec3 skinPreintegratedDiffuse(const in vec3 Nd, const in vec3 L) {
  vec3 Ns = gSkinSmoothN;
  float ndlR = dot(normalize(mix(Nd, Ns, 0.8)), L);
  float ndlG = dot(normalize(mix(Nd, Ns, 0.4)), L);
  float ndlB = dot(Nd, L);
  vec3 ndl = vec3(ndlR, ndlG, ndlB);
  // 散射宽度：平坦处窄、曲率大处宽；红 > 绿 > 蓝
  vec3 w = mix(vec3(0.16, 0.055, 0.03), vec3(0.62, 0.26, 0.15), gSkinCurv) * uSkinScatter;
  vec3 d = clamp((ndl + w) / (1.0 + w), 0.0, 1.0);
  // 明暗交界线附近的血色（只在交界带出现，亮面/暗面都不染色）
  float band = clamp(1.0 - abs(ndlB) * 3.2, 0.0, 1.0) * step(-0.25, ndlB);
  d += uSkinTint * band * 0.07 * uSkinScatter;
  return d;
}
`;

export function upgradeSkinMaterial(src, opts = {}) {
  const o = { ...SKIN_DEFAULTS, ...opts };
  const mat = new THREE.MeshPhysicalMaterial({
    name: 'PhotorealSkin',
    map: src.map || null,
    normalMap: src.normalMap || null,
    normalScale: new THREE.Vector2(o.normalScale, o.normalScale),
    roughness: o.roughness,
    metalness: 0,
    ior: 1.4,
    specularIntensity: 0.75,
    specularColor: new THREE.Color(1, 1, 1),
    clearcoat: o.dualLobe,
    clearcoatRoughness: o.dualLobeRoughness,
    sheen: o.sheen,
    sheenRoughness: 0.55,
    sheenColor: new THREE.Color(1.0, 0.86, 0.8),
  });
  if (mat.map) { mat.map.colorSpace = THREE.SRGBColorSpace; mat.map.anisotropy = 8; }
  if (mat.normalMap) { mat.normalMap.anisotropy = 8; }
  mat.userData.skinUniforms = {
    uSkinScatter: { value: o.scatter },
    uSkinTint: { value: new THREE.Vector3(...o.subsurfaceTint) },
    uCurvScale: { value: o.curvatureScale },
    uAlbedoGrade: { value: new THREE.Vector3(o.albedoContrast, o.albedoSaturation, o.albedoGamma) },
    uMicro: { value: o.micro }, uBreakup: { value: o.breakup }, uMottle: { value: o.mottle },
    uRegional: { value: o.regional }, uTrans: { value: o.translucency },
    uFaceEyeL: { value: new THREE.Vector3(-0.032, 0.03, 0.08) }, uFaceEyeR: { value: new THREE.Vector3(0.032, 0.03, 0.08) }, uFaceNose: { value: new THREE.Vector3(0, 0.0, 0.11) },
    uDelight: { value: o.delight ?? 0.75 }, uNormHP: { value: o.normalHP ?? 1.0 }, uDelightBias: { value: 5.0 },
    uHairline: { value: o.hairline ?? 1.0 }, uScalpAO: { value: o.scalpAO ?? 0.7 }, uHairRoot: { value: new THREE.Vector3(0.03, 0.022, 0.018) },
  };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, mat.userData.skinUniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vSkinObj; varying vec3 vSkinObjN; varying float vHairCov; varying vec3 vHairDir; attribute float aHairCov; attribute vec3 aHairDir;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvSkinObj = transformed; vSkinObjN = objectNormal; vHairCov = aHairCov; vHairDir = aHairDir;');
    let lights = THREE.ShaderChunk.lights_physical_pars_fragment.replace(
      'reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );',
      `vec3 skinIrr = skinPreintegratedDiffuse( geometryNormal, directLight.direction ) * directLight.color;
       reflectedLight.directDiffuse += skinIrr * BRDF_Lambert( material.diffuseColor );
       {
         // 逆光透射（Barré-Brisebois 近似）：薄处（高曲率）透出红光
         vec3 Ht = normalize(directLight.direction + geometryNormal * 0.35);
         // 厚度近似：只有轮廓边缘（耳廓、鼻翼、下颌边）这类薄处透光；不用屏幕导数曲率（会出现三角面块）
         float thin = pow(1.0 - clamp(abs(dot(gSkinSmoothN, geometryViewDir)), 0.0, 1.0), 2.5);
         float It = pow(clamp(dot(geometryViewDir, -Ht), 0.0, 1.0), 4.0) * (0.04 + 0.96 * thin);
         reflectedLight.directDiffuse += directLight.color * It * uTrans * vec3(1.0, 0.3, 0.18) * material.diffuseColor * 0.55;
       }`,
    );
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <lights_physical_pars_fragment>', SKIN_DIRECT_GLSL + lights)
      .replace('#include <common>', '#include <common>\nuniform float uCurvScale;\nuniform vec3 uAlbedoGrade;\nvarying vec3 vSkinObjN; varying float vHairCov; varying vec3 vHairDir; uniform float uHairline, uScalpAO, uDelight, uDelightBias, uNormHP; uniform vec3 uHairRoot; float gHairDens = 0.0;\n' + NOISE_GLSL)
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        #ifdef USE_MAP
        if (uDelight > 0.001) {
          // 去烘焙光影：贴图来自照片投影，自带明暗/脏斑。用模糊 mip 估计低频明暗，除掉后乘回全图平均肤色，
          // 只保留高频细节（雀斑、毛孔、唇纹），让真实灯光来决定明暗。
          vec3 lo = texture2D(map, vMapUv, uDelightBias).rgb;
          vec3 avg = texture2D(map, vMapUv, 12.0).rgb;
          vec3 flatC = diffuseColor.rgb / max(lo, vec3(0.02)) * avg;
          diffuseColor.rgb = mix(diffuseColor.rgb, flatC, uDelight);
        }
        #endif
        {
          vec3 c = diffuseColor.rgb;
          float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
          c = mix(vec3(l), c, uAlbedoGrade.y);
          c = pow(max(c, 0.0), vec3(uAlbedoGrade.z));
          float mid = 0.38;
          c = max((c - mid) * uAlbedoGrade.x + mid, 0.0);
          // 肤色斑驳：低频红润 + 中频色素不均（幅度很小，只打破“均匀塑料肤”）
          float m1 = sk_n(vSkinObj * 38.0) - 0.5; float m2 = sk_n(vSkinObj * 140.0 + 3.0) - 0.5;
          c *= 1.0 + uMottle * (m1 * vec3(0.07, -0.015, -0.04) + m2 * vec3(0.035, 0.03, 0.02));
          vec4 rg = sk_regions(vSkinObj) * uRegional;
          c *= mix(vec3(1.0), vec3(1.07, 0.93, 0.92), rg.x);   // 鼻头、脸颊微红
          c *= mix(vec3(1.0), vec3(0.9, 0.86, 0.9), rg.y);     // 眼下微暗偏紫
          diffuseColor.rgb = c;
        }
        ${HAIRLINE_SKIN_GLSL}`,
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
        { float rn = sk_n(vSkinObj * 260.0) * 0.6 + sk_n(vSkinObj * 61.0) * 0.4;
          roughnessFactor = clamp(roughnessFactor + (rn - 0.5) * 0.22 * uBreakup, 0.2, 1.0);
          vec4 rgr = sk_regions(vSkinObj) * uRegional;
          roughnessFactor = clamp(roughnessFactor - rgr.z * 0.1 - rgr.w * 0.18 + rgr.x * 0.02, 0.18, 1.0);
          roughnessFactor = mix(roughnessFactor, 0.78, gHairDens * 0.7); }`,
      )
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
        {
          // 程序化毛孔微法线：对象空间噪声梯度扰动法线；按屏幕像素尺寸自动淡出，远看不闪烁
          vec3 P = vSkinObj * 2300.0;
          float fw = length(fwidth(vSkinObj)) * 2300.0;
          float fade = 1.0 - smoothstep(0.25, 1.2, fw);
          float hgt = sk_pore(P) * 0.00006 * uMicro * fade;
          vec2 dH = vec2(dFdx(hgt), dFdy(hgt));
          vec3 sp = -vViewPosition; vec3 sx = dFdx(sp); vec3 sy = dFdy(sp);
          vec3 R1 = cross(sy, normal); vec3 R2 = cross(normal, sx);
          float det = dot(sx, R1) * faceDirection;
          vec3 grad = sign(det) * (dH.x * R1 + dH.y * R2);
          normal = normalize(abs(det) * normal - grad);
        }`,
      )
      .replace(
        '#include <lights_fragment_begin>',
        `{
          vec3 sn = normalize(vNormal);
          #ifdef DOUBLE_SIDED
            sn *= faceDirection;
          #endif
          gSkinSmoothN = sn;
          float dn = length(fwidth(sn));
          float dp = length(fwidth(vViewPosition));
          gSkinCurv = clamp(dn / max(dp, 1e-6) * uCurvScale, 0.0, 1.0);
        }
        #include <lights_fragment_begin>`,
      );
  };
  const prevCompile = mat.onBeforeCompile;
  mat.onBeforeCompile = (shader) => {
    prevCompile(shader);
    // 贴图法线去低频：原法线贴图来自照片烘焙，含大块错误起伏（脸颊上的“脏斑”）。
    // 减去模糊 mip 的法线，只保留毛孔/细纹等高频细节。
    shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_maps>', THREE.ShaderChunk.normal_fragment_maps.replace(
      'vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;',
      'vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;\n\t{ vec3 lowN = texture2D( normalMap, vNormalMapUv, 2.0 ).xyz * 2.0 - 1.0; mapN = mix(mapN, vec3(mapN.xy - lowN.xy, 1.0), uNormHP); }',
    ));
  };
  mat.customProgramCacheKey = () => 'photoreal-skin-v7';
  return mat;
}

export function setSkinParams(mat, p) {
  const u = mat.userData.skinUniforms;
  if (!u) return;
  if (p.scatter != null) u.uSkinScatter.value = p.scatter;
  if (p.roughness != null) mat.roughness = p.roughness;
  if (p.normalScale != null) mat.normalScale.set(p.normalScale, p.normalScale);
  if (p.dualLobe != null) mat.clearcoat = p.dualLobe;
  if (p.sheen != null) mat.sheen = p.sheen;
  if (p.albedoContrast != null) u.uAlbedoGrade.value.x = p.albedoContrast;
  if (p.albedoSaturation != null) u.uAlbedoGrade.value.y = p.albedoSaturation;
  if (p.micro != null) u.uMicro.value = p.micro;
  if (p.breakup != null) u.uBreakup.value = p.breakup;
  if (p.mottle != null) u.uMottle.value = p.mottle;
  if (p.regional != null) u.uRegional.value = p.regional;
  if (p.translucency != null) u.uTrans.value = p.translucency;
  if (p.delight != null) u.uDelight.value = p.delight;
  if (p.normalHP != null) u.uNormHP.value = p.normalHP;
  if (p.hairline != null) u.uHairline.value = p.hairline;
  if (p.scalpAO != null) u.uScalpAO.value = p.scalpAO;
  if (p.hairRoot) u.uHairRoot.value.set(...p.hairRoot);
}
