// 画质提升 · 独立演示（不接入主项目）
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createStudioRig, createBackdrop, LIGHT_PRESETS } from './studioLighting.js';
import { upgradeSkinMaterial, setSkinParams } from './skinMaterial.js';
import { upgradeEyeMaterial, upgradeLashMaterial, upgradeBrowMaterial, buildHairMaterials, applyHairColor } from './featureMaterials.js';
import { createPostChain } from './postChain.js';
import { createDisplayStand } from './displayStand.js';
import { HEAD_GLB, HAIRS } from './assets.gen.js';
import { generateStrands, createStrandMaterial, setStrandParams, morphedHeadSoup, alphaSamplerFromTexture, scalpDistanceAttribute } from './strandHair.js';

const qs = new URLSearchParams(location.search);
const QA = qs.has('qa');
const state = {
  mode: qs.get('mode') || 'after',
  light: qs.get('light') || 'softbox',
  view: qs.get('view') || 'front',
  hair: qs.get('hair') || HAIRS[0].id,
  skin: qs.get('skin') || 'cn_scholar_natural',
  hairColor: 'natural',
  brow: qs.get('brow') || 'eyebrow010',
  hairMode: qs.get('hairmode') || 'strand',
  density: qs.get('density') || 'mid',
};

const HAIR_COLORS = {
  natural: { label: '自然黑棕', rgb: [0.025, 0.018, 0.015] },
  black: { label: '乌黑', rgb: [0.016, 0.013, 0.012] },
  brown: { label: '栗棕', rgb: [0.085, 0.045, 0.028] },
  tea: { label: '奶茶棕', rgb: [0.2, 0.12, 0.075] },
};

const DENSITY = {
  low: { label: '流畅（约 2 万根）', guides: 1500, childrenPerGuide: 10, fuzzPerGuide: 1.0 },
  mid: { label: '标准（约 5 万根）', guides: 2600, childrenPerGuide: 17, fuzzPerGuide: 1.6 },
  high: { label: '高精（约 9 万根）', guides: 3200, childrenPerGuide: 26, fuzzPerGuide: 2.2 },
  ultra: { label: '极致（约 15 万根，需独显）', guides: 3800, childrenPerGuide: 38, fuzzPerGuide: 3.0 },
};
const strandCache = new Map();
let strandMesh = null; let strandMat = null; let hairCards = null;

const VIEWS = {
  front: { pos: [0, 0.012, 1.05], target: [0, 0.005, 0], fov: 15 },
  threequarter: { pos: [-0.62, 0.05, 0.85], target: [0, 0.008, 0.01], fov: 15 },
  profile: { pos: [-1.05, 0.02, 0.06], target: [0, 0.005, 0], fov: 15 },
  closeup: { pos: [-0.1, 0.03, 0.52], target: [0, 0.018, 0.05], fov: 13 },
  hairdetail: { pos: [-0.62, 0.1, 0.85], target: [-0.025, 0.02, 0.0], fov: 8.5 },
  stand: { pos: [0.55, 0.12, 1.25], target: [0, -0.06, 0], fov: 22 },
};

// ---------- 渲染器 ----------
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0.05, 30);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.minDistance = 0.35;
controls.maxDistance = 2.2;
controls.maxPolarAngle = Math.PI * 0.62;

let rig = null; let backdrop = null; let post = null; let basicLights = null;
const head = new THREE.Group();
scene.add(head);
let builtinSkin = null;
let parts = {}; let hairMeshes = []; let hairMats = null; let skinMat = null; let stand = null;
const origMats = new Map();
const skinTextures = {};
let gltfHead = null;

function setView(id) {
  const v = VIEWS[id] || VIEWS.front;
  camera.position.set(...v.pos);
  camera.fov = v.fov;
  camera.updateProjectionMatrix();
  controls.target.set(...v.target);
  controls.update();
}

// ---------- 资源 ----------
const loader = new GLTFLoader();
function parseGlb(u8) {
  const buf = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
  return new Promise((res, rej) => loader.parse(buf, '', res, rej));
}

async function loadSkinTexture(name) {
  if (skinTextures[name]) return skinTextures[name];
  const ex = gltfHead.parser.json.extras?.realWebAssets?.skins?.[name];
  if (!ex) return null;
  const bv = await gltfHead.parser.getDependency('bufferView', ex.bufferView);
  const blob = new Blob([bv], { type: ex.mimeType });
  const bmp = await createImageBitmap(blob);
  const tex = new THREE.Texture(bmp);
  tex.flipY = false; // 与 glTF 原贴图一致
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  skinTextures[name] = tex;
  return tex;
}

async function decodeExtraTexture(info) {
  const bv = await gltfHead.parser.getDependency('bufferView', info.bufferView);
  const bmp = await createImageBitmap(new Blob([bv], { type: info.mimeType }));
  const tex = new THREE.Texture(bmp);
  tex.flipY = false; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; tex.needsUpdate = true;
  return tex;
}

// 使用项目 GLB 内嵌的 MakeHuman 社区眉毛资产（真实贴图 + 对应网格位置/UV），不手绘
const browCache = {};
async function applyBrow(id) {
  const info = gltfHead.parser.json.extras?.realWebAssets?.eyebrows?.[id];
  const mesh = parts.brows;
  if (!info || !mesh) return;
  if (!browCache[id]) browCache[id] = await decodeExtraTexture(info);
  const g = mesh.geometry;
  if (info.pos && g.attributes.position.array.length === info.pos.length) {
    const out = g.attributes.position.array;
    for (let i = 0; i < info.pos.length; i += 3) { out[i] = info.pos[i]; out[i + 1] = info.pos[i + 1]; out[i + 2] = info.pos[i + 2] + 0.00025; }
    g.attributes.position.needsUpdate = true; g.computeVertexNormals();
  }
  if (info.uv && g.attributes.uv.array.length === info.uv.length) { g.attributes.uv.array.set(info.uv); g.attributes.uv.needsUpdate = true; }
  origMats.get(mesh).map = browCache[id];
  if (mesh.userData.after) { mesh.userData.after.map = browCache[id]; mesh.userData.after.needsUpdate = true; }
}

async function loadHead() {
  gltfHead = await parseGlb(HEAD_GLB);
  const root = gltfHead.scene;
  root.traverse((o) => {
    if (!o.isMesh) return;
    origMats.set(o, o.material);
    o.castShadow = true; o.receiveShadow = true;
    const n = o.name;
    if (n.startsWith('HeadSkin')) parts.skin = o;
    else if (n.startsWith('NeckCrossSection')) { o.visible = false; parts.section = o; }
    else if (n.startsWith('Eyebrows')) parts.brows = o;
    else if (n.startsWith('Eyelashes')) parts.lashes = o;
    else if (n.startsWith('Eyes')) (parts.eyes ||= []).push(o);
    else if (n.startsWith('Teeth') || n.startsWith('Tongue')) (parts.mouth ||= []).push(o);
  });
  // 自然活人神态：只用项目自带的官方 MakeHuman 亚洲青年基底权重，不手动捏脸
  root.traverse((o) => {
    if (!o.isMesh || !o.morphTargetDictionary) return;
    o.morphTargetInfluences.fill(0);
    const i = o.morphTargetDictionary.mh_head_asian_youth;
    if (i != null) o.morphTargetInfluences[i] = 0.65;
  });
  head.add(root);
  await applyBrow(state.brow);
}

async function loadHair(id) {
  for (const m of hairMeshes) { m.parent?.remove(m); }
  hairMeshes = [];
  const h = HAIRS.find((x) => x.id === id) || HAIRS[0];
  const g = await parseGlb(h.data);
  let srcMesh = null;
  g.scene.traverse((o) => { if (o.isMesh && !srcMesh) srcMesh = o; });
  if (!srcMesh) return;
  const geom = srcMesh.geometry;
  const orig = srcMesh.material;
  hairMats = buildHairMaterials(orig);
  applyHairColor(hairMats, HAIR_COLORS[state.hairColor].rgb);
  const core = new THREE.Mesh(geom, state.mode === 'after' ? hairMats.core : orig);
  core.castShadow = true; core.receiveShadow = true;
  core.userData.orig = orig; core.userData.after = hairMats.core;
  const tips = new THREE.Mesh(geom, hairMats.tips);
  tips.renderOrder = 2; tips.receiveShadow = true;
  tips.visible = state.mode === 'after';
  tips.userData.afterOnly = true;
  srcMesh.updateWorldMatrix(true, false);
  for (const m of [core, tips]) { m.applyMatrix4(srcMesh.matrixWorld); head.add(m); hairMeshes.push(m); }
  hairCards = { core, tips, srcMesh, orig, geom, id: h.id };
  // 发丝模式：发片 → 真发丝
  if (strandMesh) { strandMesh.parent?.remove(strandMesh); strandMesh = null; }
  if (state.hairMode === 'strand') await buildStrands();
}

// QA 用：URL 覆盖发丝着色增益（必须在面板滑杆初始化之后调用，否则会被滑杆初值覆盖）
function applyStrandQsOverrides() {
  if (!strandMat) return;
  for (const [k, q] of [['gainR', 'hR'], ['gainTT', 'hTT'], ['gainTRT', 'hTRT']]) if (qs.get(q) != null) setStrandParams(strandMat, { [k]: +qs.get(q) });
  if (qs.get('hD') != null) strandMat.userData.strandUniforms.uGainD.value = +qs.get('hD');
  if (qs.get('hEnv') != null) strandMat.envMapIntensity = +qs.get('hEnv');
}

async function buildStrands() {
  if (!hairCards) return;
  const key = hairCards.id + '|' + state.density;
  $('loading').style.display = 'grid';
  $('loading').textContent = '正在把发片转换为真发丝（' + DENSITY[state.density].label + '）…';
  await new Promise((r) => setTimeout(r, 30));
  let res = strandCache.get(key);
  if (!res) {
    const alphaAt = alphaSamplerFromTexture(hairCards.orig.map);
    const headSoup = morphedHeadSoup(parts.skin);
    hairCards.srcMesh.updateWorldMatrix(true, false);
    res = generateStrands(hairCards.geom, hairCards.srcMesh.matrixWorld, alphaAt, headSoup, DENSITY[state.density]);
    if (!hairCards.geom.attributes.aScalpD) scalpDistanceAttribute(hairCards.geom, hairCards.srcMesh.matrixWorld, headSoup);
    strandCache.set(key, res);
    console.log('[strands]', hairCards.id, state.density, res.guides, 'guides', res.strandCount, 'strands', res.vertexCount, 'verts', res.ms);
    window.__STRAND_STATS__ = { id: hairCards.id, guides: res.guides, strands: res.strandCount, main: res.mainStrands, fuzz: res.fuzz, strays: res.strays, verts: res.vertexCount, ms: res.ms, ao: res.aoStats };
  }
  if (!strandMat) strandMat = createStrandMaterial(res.headCenter);
  strandMat.userData.strandUniforms.uHeadCenter.value.set(...res.headCenter);
  setStrandParams(strandMat, { color: HAIR_COLORS[state.hairColor].rgb });

  if (strandMesh) strandMesh.parent?.remove(strandMesh);
  strandMesh = new THREE.Mesh(res.geometry, strandMat);
  strandMesh.castShadow = false; strandMesh.receiveShadow = true; strandMesh.frustumCulled = false;
  strandMesh.renderOrder = 1;
  head.add(strandMesh);
  $('loading').style.display = 'none';
}

// ---------- 导入外部高精头模（测试渲染管线上限用：如 3D 扫描头模 GLB/OBJ + 贴图）----------
let external = null;
async function importExternal(fileList) {
  const files = [...fileList];
  const model = files.find((f) => /\.(glb|gltf|obj)$/i.test(f.name));
  if (!model) { alert('请选择 .glb / .obj 模型（可同时多选它的颜色贴图与法线贴图）'); return; }
  const imgTex = async (f, srgb) => {
    if (!f) return null;
    const bmp = await createImageBitmap(f, { imageOrientation: 'flipY' });
    const t = new THREE.Texture(bmp); t.flipY = false; t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = 8; t.needsUpdate = true; return t;
  };
  const colF = files.find((f) => /(col|albedo|diffuse|base|color)/i.test(f.name) && /\.(jpe?g|png|webp)$/i.test(f.name));
  const nrmF = files.find((f) => /(normal|nrm|tangent|_n\.)/i.test(f.name) && /\.(jpe?g|png|webp)$/i.test(f.name));
  let root;
  if (/\.obj$/i.test(model.name)) root = new OBJLoader().parse(await model.text());
  else root = (await parseGlb(new Uint8Array(await model.arrayBuffer()))).scene;
  const colT = await imgTex(colF, true); const nrmT = await imgTex(nrmF, false);
  // 统一尺寸：头高约 0.24 m，居中到原头模位置
  const box = new THREE.Box3().setFromObject(root); const size = box.getSize(new THREE.Vector3()); const c = box.getCenter(new THREE.Vector3());
  const k = 0.24 / Math.max(size.y, 1e-6);
  root.scale.setScalar(k); root.position.set(-c.x * k, -c.y * k + 0.005, -c.z * k);
  root.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = o.receiveShadow = true;
    const src = Array.isArray(o.material) ? o.material[0] : o.material;
    const map = colT || src.map || null; const nrm = nrmT || src.normalMap || null;
    if (map) map.flipY = !!colT ? false : map.flipY;
    o.userData.orig = new THREE.MeshStandardMaterial({ map, normalMap: nrm, roughness: 0.6 });
    o.userData.after = upgradeSkinMaterial({ map, normalMap: nrm }, { normalScale: 1.0, albedoSaturation: 1.0, albedoGamma: 1.0, albedoContrast: 1.0 });
    o.material = state.mode === 'after' ? o.userData.after : o.userData.orig;
  });
  if (external) head.remove(external);
  external = root;
  head.add(root);
  gltfHead.scene.visible = false;
  hairMeshes.forEach((m) => { m.visible = false; });
  if (stand) stand.visible = false;
  await applyMode();
  if (QA) startLoop();
}
window.__importExternal = importExternal;
window.__dbg = () => { const out = []; scene.traverse((o) => { if (o.isMesh && o.visible) out.push(o.name + '/' + (o.material.name || '') + '/cw=' + o.material.colorWrite + '/v=' + (o.geometry.attributes.position.count)); }); const u = strandMat && strandMat.userData.strandUniforms; return { out, u: u && { R: u.uGainR.value, TT: u.uGainTT.value, D: u.uGainD.value }, env: strandMat && strandMat.envMapIntensity }; };
window.__pick = (nx, ny) => { const rc = new THREE.Raycaster(); rc.setFromCamera(new THREE.Vector2(nx, ny), camera); return rc.intersectObjects(scene.children, true).filter((h) => h.object.visible).slice(0, 4).map((h) => h.object.name + '|' + h.object.type + '|' + (h.object.material?.name || '') + '|' + h.distance.toFixed(3)); };

// ---------- 模式切换 ----------
async function applyMode() {
  const after = state.mode === 'after';
  // 皮肤
  const tex = await loadSkinTexture(state.skin);
  const skinOrig = origMats.get(parts.skin);
  if (tex) skinOrig.map = tex;
  if (after) {
    if (!builtinSkin) builtinSkin = upgradeSkinMaterial(skinOrig);
    builtinSkin.map = tex || skinOrig.map;
    builtinSkin.needsUpdate = true;
    parts.skin.material = builtinSkin;
  } else {
    skinOrig.needsUpdate = true;
    parts.skin.material = skinOrig;
  }
  for (const e of parts.eyes || []) {
    const o = origMats.get(e);
    e.material = after ? (e.userData.after ||= upgradeEyeMaterial(o)) : o;
    if (after && o.name.toLowerCase().includes('cornea')) e.castShadow = false;
  }
  if (parts.lashes) { const o = origMats.get(parts.lashes); parts.lashes.material = after ? (parts.lashes.userData.after ||= upgradeLashMaterial(o)) : o; }
  if (parts.brows) { const o = origMats.get(parts.brows); parts.brows.material = after ? (parts.brows.userData.after ||= upgradeBrowMaterial(o)) : o; parts.brows.castShadow = false; }
  const strandOn = after && state.hairMode === 'strand' && !external;
  for (const m of hairMeshes) {
    if (m.userData.afterOnly) m.visible = after && !external && !strandOn;
    else m.material = after ? m.userData.after : m.userData.orig;
  }
  if (strandMesh) strandMesh.visible = strandOn;
  if (hairMats) {
    // 发丝模式下，原发片作为内层发量底衬：内收 1.2mm、压暗，只负责遮住头皮和投射阴影
    // 发丝模式：原发片只作为“阴影代理”——不写颜色、不写深度，但照样进阴影图投射柔和发影。
    // （试过让发片当可见底衬：无论内收、压暗还是按距头皮抖动剔除，都会在发丝外层形成灰雾/纸片硬边，见 HAIR 文档坑 13）
    // 例外：贴着头皮 1cm 以内的发片保留为很暗的“头皮遮挡层”（硬裁剪、不抖动），挡住分缝/鬓角处透出的头皮
    hairMats.shared.uScalpFade.value = strandOn ? 0.010 : 0.0;
    hairMats.shared.uInset.value = strandOn ? 0.0025 : 0.0;
    hairMats.core.alphaTest = strandOn ? 0.62 : 0.45;
    hairMats.core.color.setRGB(...HAIR_COLORS[state.hairColor].rgb.map((v) => v * (strandOn ? 0.3 : 1)));
  }
  if (external) external.traverse((o) => { if (o.isMesh) o.material = after ? o.userData.after : o.userData.orig; });
  // 光照与后期
  skinMat = external ? (external.getObjectByProperty('isMesh', true)?.userData.after || builtinSkin) : builtinSkin;
  renderer.shadowMap.enabled = after;
  if (after) {
    if (basicLights) basicLights.visible = false;
    if (!rig) rig = createStudioRig(scene, renderer, state.light);
    rig.group.visible = true;
    const p = rig.apply(state.light);
    if (!backdrop) backdrop = createBackdrop(scene, p.backdrop);
    backdrop.set(p.backdrop); backdrop.mesh.visible = true;
    scene.background = null;
    renderer.toneMapping = { agx: THREE.AgXToneMapping, aces: THREE.ACESFilmicToneMapping, neutral: THREE.NeutralToneMapping }[qs.get('tm') || 'neutral'];
    if (!post) post = createPostChain(renderer, scene, camera);
  } else {
    if (rig) rig.group.visible = false;
    if (backdrop) backdrop.mesh.visible = false;
    scene.environment = null;
    scene.background = new THREE.Color(0x1b1e24);
    if (!basicLights) {
      basicLights = new THREE.Group();
      basicLights.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.6));
      const d = new THREE.DirectionalLight(0xffffff, 1.8); d.position.set(0.4, 0.6, 1);
      basicLights.add(d);
      scene.add(basicLights);
    }
    basicLights.visible = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
  }
  if (stand) stand.visible = !external;
  renderer.shadowMap.needsUpdate = true;
  scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; });
  updateUI();
}

// ---------- UI ----------
const $ = (id) => document.getElementById(id);
function updateUI() {
  $('btnMode').textContent = state.mode === 'after' ? '✨ 画质提升：开（点我看原始）' : '⬜ 原始渲染（点我开启画质提升）';
  $('btnMode').classList.toggle('on', state.mode === 'after');
  document.body.classList.toggle('before', state.mode !== 'after');
}
function fillSelect(el, items, val) {
  el.innerHTML = items.map(([v, l]) => `<option value="${v}" ${v === val ? 'selected' : ''}>${l}</option>`).join('');
}
function bindUI() {
  fillSelect($('selLight'), Object.entries(LIGHT_PRESETS).map(([k, v]) => [k, v.label]), state.light);
  fillSelect($('selHair'), HAIRS.map((h) => [h.id, h.label]), state.hair);
  fillSelect($('selHairColor'), Object.entries(HAIR_COLORS).map(([k, v]) => [k, v.label]), state.hairColor);
  const skins = Object.keys(gltfHead.parser.json.extras?.realWebAssets?.skins || {});
  const SKIN_LABELS = { cn_scholar_natural: '自然素颜', cn_porcelain_ivory: '瓷白', kr_dewy_peach: '水光蜜桃', kr_firstlove_camellia: '初恋山茶', cn_jiangnan_jade: '江南温玉', kr_chaebol_cool: '冷调', cn_intellectual_olive: '橄榄暖调', eurasian_velvet_rose: '玫瑰丝绒', young_asian: '青年亚洲(原版)', natural_makeup: '自然妆(原版)' };
  fillSelect($('selSkin'), skins.filter((s) => SKIN_LABELS[s]).map((s) => [s, SKIN_LABELS[s]]), state.skin);
  const BROW_LABELS = { eyebrow010: '自然毛流眉', eyebrow003: '柳叶眉', eyebrow001: '平直眉', eyebrow002: '细弯眉', eyebrow004: '标准眉', eyebrow005: '细眉', eyebrow008: '浓眉', eyebrow012: '野生眉' };
  fillSelect($('selBrow'), Object.keys(gltfHead.parser.json.extras?.realWebAssets?.eyebrows || {}).map((b) => [b, BROW_LABELS[b] || b]), state.brow);
  $('selBrow').onchange = async (e) => { state.brow = e.target.value; await applyBrow(state.brow); };
  fillSelect($('selView'), [['front', '正面肖像'], ['threequarter', '3/4 侧'], ['profile', '侧面'], ['closeup', '眼部特写'], ['hairdetail', '头发特写'], ['stand', '展示底座']], state.view);
  $('btnMode').onclick = () => { state.mode = state.mode === 'after' ? 'before' : 'after'; applyMode(); };
  $('selLight').onchange = (e) => { state.light = e.target.value; if (state.mode === 'after') { const p = rig.apply(state.light); backdrop.set(p.backdrop); } };
  $('selHair').onchange = async (e) => { state.hair = e.target.value; await loadHair(state.hair); applyMode(); };
  $('selHairColor').onchange = (e) => { state.hairColor = e.target.value; applyHairColor(hairMats, HAIR_COLORS[state.hairColor].rgb); if (strandMat) setStrandParams(strandMat, { color: HAIR_COLORS[state.hairColor].rgb }); applyMode(); };
  fillSelect($('selHairMode'), [['strand', '真发丝（发片→发丝转换）'], ['card', '原版发片（对比用）']], state.hairMode);
  fillSelect($('selDensity'), Object.entries(DENSITY).map(([k, v]) => [k, v.label]), state.density);
  $('selHairMode').onchange = async (e) => { state.hairMode = e.target.value; if (state.hairMode === 'strand' && !strandMesh) await buildStrands(); applyMode(); };
  $('selDensity').onchange = async (e) => { state.density = e.target.value; if (state.hairMode === 'strand') await buildStrands(); applyMode(); };

  $('selSkin').onchange = async (e) => { state.skin = e.target.value; await applyMode(); };
  $('selView').onchange = (e) => { state.view = e.target.value; setView(state.view); };
  const slider = (id, fn) => { const el = $(id); const out = $(id + 'O'); const f = () => { out.textContent = (+el.value).toFixed(2); fn(+el.value); }; el.oninput = f; f(); };
  slider('sScatter', (v) => skinMat && setSkinParams(skinMat, { scatter: v }));
  slider('sRough', (v) => skinMat && setSkinParams(skinMat, { roughness: v }));
  slider('sPore', (v) => skinMat && setSkinParams(skinMat, { normalScale: v }));
  slider('sGrain', (v) => post && post.set({ grain: v }));
  slider('sHairShine', (v) => strandMat && setStrandParams(strandMat, { gainR: 1.15 * v, gainTRT: 1.8 * v }));
  slider('sHairBack', (v) => strandMat && setStrandParams(strandMat, { gainTT: v }));
  slider('sVig', (v) => post && post.set({ vignette: v }));
  slider('sSharp', (v) => post && post.set({ sharpen: v }));
  slider('sExpo', (v) => { renderer.toneMappingExposure = v; });
  $('btnShot').onclick = () => {
    const a = document.createElement('a');
    a.download = `画质提升_${state.mode}_${Date.now()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };
  $('fileImport').onchange = (e) => importExternal(e.target.files);
  $('btnBuiltin').onclick = () => { if (!external) return; head.remove(external); external = null; gltfHead.scene.visible = true; hairMeshes.forEach((m) => { m.visible = true; }); applyMode(); };
  $('panelToggle').onclick = () => document.body.classList.toggle('hidepanel');
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  post?.setSize(window.innerWidth, window.innerHeight);
});

// ---------- 启动 ----------
let frames = 0;
const clock = new THREE.Clock();
const _dbs = new THREE.Vector2();
function startLoop() {
  frames = 0; window.__READY__ = false;
  renderer.setAnimationLoop(() => {
    controls.update();
    if (strandMat) {
      const hpx = renderer.getDrawingBufferSize(_dbs).y;
      setStrandParams(strandMat, { pxScale: 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) / Math.max(1, hpx) });
    }
    if (state.mode === 'after' && post) post.render(clock.getElapsedTime());
    else renderer.render(scene, camera);
    frames++;
    if (QA && frames >= 2) { renderer.setAnimationLoop(null); window.__READY__ = true; }
    else if (frames === 3) window.__READY__ = true;
  });
}
async function boot() {
  try {
    await loadHead();
    await loadHair(state.hair);
    stand = createDisplayStand(parts.skin);
    head.add(stand);
    setView(state.view);
    await applyMode();
    bindUI();
    applyStrandQsOverrides();
    $('loading').style.display = 'none';
    startLoop();
  } catch (err) {
    console.error(err);
    $('loading').textContent = '加载失败：' + (err?.message || err);
    window.__ERROR__ = String(err?.stack || err);
  }
}
boot();
