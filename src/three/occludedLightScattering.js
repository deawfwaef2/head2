import * as THREE from 'three';
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';

// Opt-in WebGL single scattering. Unlike the old radial brightness blur, the
// integration ends at the first rendered surface (scene depth), then samples
// the REAL directional-light shadow map at 12 world-space positions per ray.
// Physical, shadow-casting baffles occlude the light; no transparent plane,
// painted alpha beam, or unsupported WebGPU dependency is added.
export function createOccludedLightScatteringPass(scene, camera, keyLight) {
  const vertexShader = /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  const fragmentShader = /* glsl */`
    #include <packing>
    uniform sampler2D tDiffuse;
    uniform sampler2D tSceneDepth;
    uniform sampler2D tKeyShadow;
    uniform mat4 uInvProjView;
    uniform mat4 uShadowMatrix;
    uniform vec3 uCameraWorld;
    uniform vec3 uKeyDir;
    uniform vec3 uKeyColor;
    uniform float uStrength;
    uniform float uHasShadow;
    uniform float uDebugMode;
    varying vec2 vUv;

    void main() {
      vec4 src = texture2D(tDiffuse, vUv);
      if (uStrength < 0.002 || uHasShadow < 0.5) {
        gl_FragColor = src;
        return;
      }
      float surfaceDepth = texture2D(tSceneDepth, vUv).r;
      // Camera and depth are supplied by the SAME rendered scene; beams stop
      // at opaque heads, shelves and walls rather than being drawn on top.
      vec2 ndc = vUv * 2.0 - 1.0;
      vec4 farH = uInvProjView * vec4(ndc, 1.0, 1.0);
      vec3 dir = normalize(farH.xyz / farH.w - uCameraWorld);
      float lengthWorld = 160.0;
      if (surfaceDepth < 0.9999) {
        vec4 hitH = uInvProjView * vec4(ndc, surfaceDepth * 2.0 - 1.0, 1.0);
        lengthWorld = min(lengthWorld, max(0.0, dot(hitH.xyz / hitH.w - uCameraWorld, dir)));
      }
      // Rayleigh/Henyey-Greenstein-inspired forward lobe, conservatively
      // clamped; direct visibility still comes from the actual key shadow.
      float forward = max(0.0, dot(dir, -normalize(uKeyDir)));
      float phase = 0.62 + 0.38 * forward * forward;
      float visible = 0.0;
      for (int i = 0; i < 12; i++) {
        float t = (float(i) + 0.5) / 12.0;
        vec3 sampleWorld = uCameraWorld + dir * lengthWorld * t;
        vec4 shadowH = uShadowMatrix * vec4(sampleWorld, 1.0);
        vec3 s = shadowH.xyz / max(shadowH.w, 0.00001);
        if (s.x > 0.004 && s.x < 0.996 && s.y > 0.004 && s.y < 0.996 && s.z > 0.0 && s.z < 1.0) {
          float occluderDepth = unpackRGBAToDepth(texture2D(tKeyShadow, s.xy));
          float lit = smoothstep(-0.0022, 0.0022, occluderDepth - s.z + 0.0007);
          float aperture = 1.0 - smoothstep(0.34, 0.68, length(s.xy - 0.5));
          visible += lit * aperture;
        }
      }
      float path = min(lengthWorld / 110.0, 1.0);
      // Scene-referred haze stays intentionally subtle; the photography grade
      // has strong tone/contrast and an earlier 0.36 multiplier washed out
      // the subject completely. At 100% the measured background shift is
      // roughly +15 display RGB, not a flat white overlay.
      float haze = clamp(uStrength, 0.0, 1.0) * path * phase * visible / 12.0 * 0.022;
      if (uDebugMode > 0.5) {
        float probe = uDebugMode < 1.5 ? surfaceDepth
          : uDebugMode < 2.5 ? visible / 12.0
          : uDebugMode < 3.5 ? path : haze;
        gl_FragColor = vec4(vec3(probe), 1.0);
        return;
      }
      vec3 scattered = uKeyColor * haze;
      src.rgb += scattered;
      src.a = clamp(src.a + (1.0 - src.a) * haze * 0.28, 0.0, 1.0);
      gl_FragColor = src;
    }
  `;
  const uniforms = {
    tDiffuse: { value: null },
    tSceneDepth: { value: null },
    tKeyShadow: { value: null },
    uInvProjView: { value: new THREE.Matrix4() },
    uShadowMatrix: { value: new THREE.Matrix4() },
    uCameraWorld: { value: new THREE.Vector3() },
    uKeyDir: { value: new THREE.Vector3() },
    uKeyColor: { value: new THREE.Vector3(1, 0.88, 0.7) },
    uStrength: { value: 0 },
    uHasShadow: { value: 0 },
    uDebugMode: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms, vertexShader, fragmentShader,
    depthTest: false, depthWrite: false, toneMapped: false,
    blending: THREE.NoBlending,
  });
  const quad = new FullScreenQuad(material);
  const pass = new Pass();
  pass.enabled = false;
  pass.needsSwap = true;
  pass.uniforms = uniforms;

  // Slatted window flag: invisible to the camera and scene-depth texture,
  // but real BoxGeometry castShadow meshes in Three's key-light shadow pass.
  const baffleGroup = new THREE.Group();
  baffleGroup.name = 'OptInPhysicalShadowBaffles';
  baffleGroup.visible = false;
  const flagMat = new THREE.MeshBasicMaterial({
    color: 0x000000, colorWrite: false, depthWrite: false, side: THREE.DoubleSide,
  });
  const flags = [];
  for (const y of [-26, -8, 10, 28]) {
    const flag = new THREE.Mesh(new THREE.BoxGeometry(120, 3.7, 1.2), flagMat);
    flag.position.y = y;
    flag.castShadow = true;
    flag.receiveShadow = false;
    flag.frustumCulled = false;
    baffleGroup.add(flag);
    flags.push(flag);
  }
  scene.add(baffleGroup);
  pass.baffleGroup = baffleGroup;
  const zAxis = new THREE.Vector3(0, 0, 1);
  const dirToLight = new THREE.Vector3();
  pass.updateBaffles = () => {
    if (!pass.enabled) return;
    dirToLight.copy(keyLight.position).sub(keyLight.target.position).normalize();
    baffleGroup.position.copy(keyLight.target.position).addScaledVector(dirToLight, 29);
    baffleGroup.quaternion.setFromUnitVectors(zAxis, dirToLight);
  };
  pass.setScatteringStrength = (amount, hardwareEnabled = true) => {
    const strength = THREE.MathUtils.clamp(Number(amount) || 0, 0, 1);
    uniforms.uStrength.value = strength;
    pass.enabled = hardwareEnabled && strength > 0.001;
    baffleGroup.visible = pass.enabled;
    // Grow physical flag thickness continuously as the user raises strength,
    // instead of switching to thick dark bars at the first slider tick.
    for (const flag of flags) flag.scale.y = Math.max(0.10, strength);
  };
  pass.render = (renderer, write, read) => {
    const shadow = keyLight?.shadow;
    const shadowMap = shadow?.map?.texture;
    uniforms.tDiffuse.value = read.texture;
    uniforms.tSceneDepth.value = read.depthTexture;
    uniforms.tKeyShadow.value = shadowMap || read.texture;
    uniforms.uHasShadow.value = shadowMap && read.depthTexture && renderer.shadowMap.enabled ? 1 : 0;
    // Renderer updates key.shadow.matrix in the just-completed RenderPass.
    dirToLight.copy(keyLight.position).sub(keyLight.target.position).normalize();
    uniforms.uShadowMatrix.value.copy(shadow.matrix);
    uniforms.uKeyDir.value.copy(dirToLight);
    uniforms.uKeyColor.value.set(keyLight.color.r, keyLight.color.g, keyLight.color.b);
    camera.updateMatrixWorld();
    // inverse(P*V) = camera.matrixWorld * camera.projectionMatrixInverse
    uniforms.uInvProjView.value.multiplyMatrices(camera.matrixWorld, camera.projectionMatrixInverse);
    camera.getWorldPosition(uniforms.uCameraWorld.value);
    renderer.setRenderTarget(pass.renderToScreen ? null : write);
    if (pass.clear) renderer.clear();
    quad.render(renderer);
  };
  pass.dispose = () => {
    scene.remove(baffleGroup);
    for (const flag of flags) flag.geometry.dispose();
    flagMat.dispose();
    material.dispose();
  };
  return pass;
}
