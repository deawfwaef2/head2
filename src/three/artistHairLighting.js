import { BufferAttribute } from 'three';

// Derive a smooth area-weighted per-vertex hair flow tangent from the artist UVs.
export function updateArtistHairFlow(geometry, horizontal = false) {
  const p = geometry.attributes.position, uv = geometry.attributes.uv;
  if (!p || !uv) return;
  const values = new Float32Array(p.count * 3), indices = geometry.index;
  const count = indices ? indices.count : p.count;
  for (let f = 0; f + 2 < count; f += 3) {
    const ids = [0, 1, 2].map(k => indices ? indices.getX(f + k) : f + k);
    const [a, b, c] = ids;
    const du1 = uv.getX(b) - uv.getX(a), dv1 = uv.getY(b) - uv.getY(a);
    const du2 = uv.getX(c) - uv.getX(a), dv2 = uv.getY(c) - uv.getY(a);
    const det = du1 * dv2 - du2 * dv1;
    if (Math.abs(det) < 1e-12) continue;
    const e1 = [p.getX(b) - p.getX(a), p.getY(b) - p.getY(a), p.getZ(b) - p.getZ(a)];
    const e2 = [p.getX(c) - p.getX(a), p.getY(c) - p.getY(a), p.getZ(c) - p.getZ(a)];
    const flow = e1.map((v, k) => (horizontal ? v * dv2 - e2[k] * dv1 : e2[k] * du1 - v * du2) / det);
    const len = Math.hypot(...flow);
    if (len < 1e-12) continue;
    const area = Math.hypot(
      e1[1] * e2[2] - e1[2] * e2[1],
      e1[2] * e2[0] - e1[0] * e2[2],
      e1[0] * e2[1] - e1[1] * e2[0]
    );
    for (const i of ids) {
      for (let k = 0; k < 3; k++) values[i * 3 + k] += (flow[k] / len) * area;
    }
  }
  for (let i = 0; i < p.count; i++) {
    const k = i * 3, length = Math.hypot(values[k], values[k + 1], values[k + 2]);
    if (length > 1e-12) {
      for (let j = 0; j < 3; j++) values[k + j] /= length;
    }
  }
  geometry.setAttribute('artistHairFlow', new BufferAttribute(values, 3));
  geometry.userData.hairFlowHorizontal = horizontal;
}

export function injectArtistHairLighting(shader) {
  shader.vertexShader = 'attribute vec3 artistHairFlow;\nvarying vec3 vArtistHairFlow;\nvarying vec3 vHairRadial;\nvarying vec3 vHairCrownFlow;\nvarying vec3 vHairObjPos;\nvarying float vHairDepth;\n' + shader.vertexShader;
  shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    `#include <begin_vertex>
    vArtistHairFlow = mat3(modelViewMatrix) * artistHairFlow;
    vHairObjPos = transformed;
    {
      vec3 hc = vec3(0.0, 0.012, -0.005);
      vec3 crown = vec3(0.0, 0.135, -0.02);
      vHairRadial = normalize(normalMatrix * normalize(transformed - hc + vec3(0.0, 1e-5, 0.0)));
      vHairCrownFlow = normalize(mat3(modelViewMatrix) * normalize(transformed - crown + vec3(0.0, 1e-5, 0.0)));
      vHairDepth = length(transformed - hc);
    }`
  );
  shader.fragmentShader = 'varying vec3 vArtistHairFlow;\nvarying vec3 vHairRadial;\nvarying vec3 vHairCrownFlow;\nvarying vec3 vHairObjPos;\nvarying float vHairDepth;\n' + shader.fragmentShader;
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <normal_fragment_maps>',
    `#include <normal_fragment_maps>
    {
      // Always orient double-sided hair cards outward from the cranial volume so back-facing cards never turn pitch black
      vec3 radN = normalize(vHairRadial);
      if (dot(normal, radN) < 0.0) {
        normal = -normal;
      }
      // Blend 82% toward the smooth spherical dome normal to eliminate polygon-card shading steps ("片状黑块")
      normal = normalize(mix(normal, radN, 0.82));
      #ifdef USE_MAP
        // Sub-pixel cylindrical fiber normal perturbation so light breaks into crisp individual strands ("发丝感")
        vec3 flowDir = normalize(vHairCrownFlow + vec3(1e-6));
        vec3 fiberBitangent = normalize(cross(normal, flowDir) + vec3(1e-6));
        float fiberCyl = 0.18 * cos(vMapUv.x * 440.0 * 6.2831853) + 0.12 * cos(vMapUv.x * 780.0 * 6.2831853);
        normal = normalize(normal + fiberBitangent * fiberCyl);
      #endif
    }`
  );
  shader.fragmentShader = shader.fragmentShader.replace('#include <lights_physical_pars_fragment>', `
    #include <lights_physical_pars_fragment>
    vec3 hairFlowT;
    float hairFlowValid;
    float hairAtlasValue;
    float gHairDepthAO;
    float gHairCuticleShift;
    float gBangSpecDamp;
    float hairLobe(float th, float exponent) {
      return pow(max(1.0 - th * th, 0.0), exponent * 0.5);
    }
    void RE_Direct_ArtistHair(const in IncidentLight incident,
      const in vec3 geometryPosition, const in vec3 N, const in vec3 V,
      const in vec3 clearcoatNormal, const in PhysicalMaterial material,
      inout ReflectedLight reflectedLight) {
      ReflectedLight ordinary;
      ordinary.directDiffuse = vec3(0.0);
      ordinary.directSpecular = vec3(0.0);
      ordinary.indirectDiffuse = vec3(0.0);
      ordinary.indirectSpecular = vec3(0.0);
      RE_Direct_Physical(incident, geometryPosition, N, V, clearcoatNormal, material, ordinary);

      // Soft wrap diffuse with lifted shadow floor so hair never turns into dead black blotches
      float ndl = dot(N, incident.direction);
      float wrapDiffuse = clamp((ndl + 0.65) / 1.65, 0.38, 1.0);
      vec3 strandDiffuse = incident.color * material.diffuseColor * (wrapDiffuse * 0.44) * gHairDepthAO;
      reflectedLight.directDiffuse += mix(ordinary.directDiffuse * gHairDepthAO, max(ordinary.directDiffuse * gHairDepthAO, strandDiffuse), hairFlowValid);

      vec3 H = normalize(incident.direction + V + vec3(1e-7));
      // Staggered per-lock and per-strand cuticle shift breaks horizontal bands into vertical strand glints
      vec3 T1 = normalize(hairFlowT + N * (0.06 + gHairCuticleShift));
      vec3 T2 = normalize(hairFlowT - N * (0.16 - gHairCuticleShift * 0.8));
      float gloss = clamp(1.0 - material.roughness, 0.0, 1.0);
      float exponent1 = mix(160.0, 290.0, gloss);
      float exponent2 = mix(48.0, 82.0, gloss);
      float primary = hairLobe(clamp(dot(T1, H), -1.0, 1.0), exponent1);
      float secondary = hairLobe(clamp(dot(T2, H), -1.0, 1.0), exponent2);

      // Keratin fiber Fresnel + sharp strand-ridge gating (zero glare in inter-strand grooves)
      float cosVH = max(dot(V, H), 0.0);
      float keratinF = 0.04 + 0.16 * pow(1.0 - cosVH, 4.0);
      float strandWeight = mix(0.02, 1.45, pow(smoothstep(0.24, 0.88, hairAtlasValue), 1.85));
      vec3 azimuthH = H - hairFlowT * dot(H, hairFlowT);
      float azimuthLength = max(length(azimuthH), 1e-5);
      float azimuth = 0.30 + 0.70 * pow(max(dot(N, azimuthH / azimuthLength), 0.0), 1.6);
      float visibility = smoothstep(-0.25, 0.28, ndl);

      // Primary R lobe subtle strand glint; Secondary TRT lobe carries melanin tint without washing dark hair to grey
      vec3 rColor = mix(vec3(0.58, 0.57, 0.60), clamp(material.diffuseColor * 3.2 + vec3(0.18), vec3(0.18), vec3(0.75)), 0.52);
      vec3 trtColor = clamp(material.diffuseColor * 3.8 + vec3(0.12, 0.08, 0.05), vec3(0.10), vec3(0.74));
      vec3 fiber = incident.color * visibility * keratinF * strandWeight * azimuth * gHairDepthAO * gBangSpecDamp
                 * (rColor * primary * 0.58 + trtColor * secondary * 0.46);
      reflectedLight.directSpecular += mix(ordinary.directSpecular * 0.25, fiber, hairFlowValid);
    }
    #undef RE_Direct
    #define RE_Direct RE_Direct_ArtistHair
  `);
  shader.fragmentShader = shader.fragmentShader.replace('#include <lights_physical_fragment>', `
    hairFlowValid = 1.0;
    hairAtlasValue = 0.5;
    gHairDepthAO = mix(0.90, 1.0, smoothstep(0.070, 0.102, vHairDepth));
    gHairCuticleShift = 0.15 * sin(vHairObjPos.x * 190.0 + vHairObjPos.z * 95.0)
                      + 0.10 * sin(vHairObjPos.x * 480.0 - vHairObjPos.z * 160.0);
    gBangSpecDamp = mix(1.0, 0.30, smoothstep(0.068, 0.024, vHairObjPos.y) * smoothstep(0.045, 0.078, vHairObjPos.z));
    vec3 crownF = vHairCrownFlow - normal * dot(normal, vHairCrownFlow);
    hairFlowT = normalize(crownF + vec3(1e-6));
    #ifdef USE_MAP
      vec3 uvFlow = vArtistHairFlow - normal * dot(normal, vArtistHairFlow);
      float uvFlowLen2 = dot(uvFlow, uvFlow);
      if (uvFlowLen2 > 1e-12) {
        vec3 uvT = uvFlow * inversesqrt(uvFlowLen2);
        if (dot(uvT, hairFlowT) < 0.0) uvT = -uvT;
        hairFlowT = normalize(mix(uvT, hairFlowT, 0.45));
      }
      float texLuma = clamp(dot(texture2D(map, vMapUv).rgb, vec3(0.2126, 0.7152, 0.0722)), 0.0, 1.0);
      float sR1 = 0.5 + 0.5 * sin(vMapUv.x * 180.0 * 6.2831853 + vMapUv.y * 8.0);
      float sR2 = 0.5 + 0.5 * sin(vMapUv.x * 460.0 * 6.2831853 - vMapUv.y * 14.0);
      float sR3 = 0.5 + 0.5 * sin(vMapUv.x * 820.0 * 6.2831853 + vMapUv.y * 6.0);
      hairAtlasValue = clamp((texLuma - 0.32) * 1.45, 0.0, 1.0) * (0.22 + 0.36 * sR1 + 0.26 * sR2 + 0.16 * sR3);
      gHairCuticleShift += 0.08 * sin(vMapUv.x * 140.0 * 6.2831853);
    #endif
    #include <lights_physical_fragment>
  `);
}
