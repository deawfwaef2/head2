import assert from 'node:assert/strict';
import { buildHairMaterials } from '../src/three/masterQuality/featureMaterials.js';

const { core, tips } = buildHairMaterials({ map: null }, { spec1: 0.09, spec2: 0.07 });
function compiledUniforms(mat) {
  const shader = {
    uniforms: {},
    vertexShader: '#include <common>\n#include <project_vertex>\n',
    fragmentShader: '#include <common>\n#include <lights_physical_pars_fragment>\n' +
      '#include <map_fragment>\n#include <normal_fragment_maps>\n#include <alphatest_fragment>\n',
  };
  mat.onBeforeCompile(shader);
  return shader;
}
const card = compiledUniforms(core);
const strandTips = compiledUniforms(tips);
assert(Math.abs(card.uniforms.uSpec1.value - 0.009) < 1e-9);
assert(Math.abs(card.uniforms.uSpec2.value - 0.0084) < 1e-9);
assert.equal(strandTips.uniforms.uSpec1.value, 0.09, 'real strands retain their fine sheen');
assert.equal(strandTips.uniforms.uSpec2.value, 0.07);
assert(card.fragmentShader.includes('isForeheadBangs'), 'alpha/forehead coverage survives shading fix');
assert.equal(core.alphaTest, 0.22, 'visible card silhouette must not be bluntly chopped off');
assert.equal(core.color.getHex(), tips.color.getHex(), 'hair tone stays consistent across strands and undercoat');
console.log('HAIR_UNDERCOAT_SHADER_PASS: only flat card highlights reduced; strands, color and alpha preserved');
