const { chromium } = require('playwright-core');
const path = require('node:path');
const assert = require('node:assert/strict');
const html = process.env.HTML_PATH || path.join(__dirname, '..', '点击开始游戏_CERVIX3D.html');
const url = 'file://' + encodeURI(path.resolve(html));
(async () => {
  const b = await chromium.launch({
    executablePath: '/home/user/.cache/ms-playwright/chromium_headless_shell-1187/chrome-linux/headless_shell',
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'],
  });
  try {
    const p = await b.newPage({ viewport: { width: 1260, height: 850 } });
    const errors = [];
    p.on('pageerror', err => errors.push(err.message));
    await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 85000 });
    await p.locator('#btn-start-with-studio').click();
    await p.waitForFunction(() => window.__cervixQA?.ready && window.__cervixQA?.studio?.headNode, null, { timeout: 120000 });
    await p.locator('.nav-tab[data-tab=studio]').click();
    const pick = async (id, value) => p.evaluate(([id, value]) => { const el=document.getElementById(id);el.value=value;el.dispatchEvent(new Event(el.type==='color' || el.type==='range'?'input':'change',{bubbles:true}));return el.value },[id,value]);
    const state = () => p.evaluate(() => { const q=window.__cervixQA,s=q.studio,h=s.headNode,d=q.state.studioDraft,m=d.morphs;return {
      draft:d.hairStyle, actual:h.userData.currentHairStyle, base:h.userData.liveMaterials?.hairStyle, config:s.currentConfig?.hairStyle,
      dye:d.hairColor, currentDye:h.userData.hairColor, parted:m.bangsParting, brush:m.sculptGestures?.length||0,
      hairGroup:h.getObjectByName('HairGroup')?.uuid, gl:s.renderer.getContext().getError(),
    }});
    console.log('START',JSON.stringify(await state()));
    await pick('sel-hair-style','hair_bob01');
    await p.waitForFunction(() => window.__cervixQA.studio.headNode?.userData?.currentHairStyle === 'hair_bob01',null,{timeout:35000});
    await pick('morph-bangs-part','0.25');
    const shaped=await state();
    console.log('AFTER_SHAPE',JSON.stringify(shaped));
    const stable=async label => {
      await p.waitForTimeout(1050);const snapshot=await state();
      console.log(label,JSON.stringify(snapshot));
      assert.equal(snapshot.draft,'hair_bob01',label+': draft hairstyle');
      assert.equal(snapshot.actual,'hair_bob01',label+': live hairstyle reverted');
      assert.equal(snapshot.hairGroup,shaped.hairGroup,label+': artist hair geometry was silently replaced');
      assert.equal(snapshot.parted,.25,label+': bangs sculpt parameter was erased');
      assert.equal(snapshot.gl,0,label+': WebGL error');
      return snapshot;
    };
    await pick('col-hair','#653c41');
    assert.equal((await stable('AFTER_COLOR')).dye,'#653c41');
    const eye = await p.evaluate(() => {const el=document.getElementById('studio-eye-preset-select');el.value=el.options[1].value;el.dispatchEvent(new Event('change',{bubbles:true}));return el.value});
    await stable('AFTER_EYE_'+eye);
    await pick('slider-skin-roughness','0.70');await stable('AFTER_MATERIAL');
    await pick('sel-skin-variant',await p.evaluate(()=>{let e=document.getElementById('sel-skin-variant');return e.options[(e.selectedIndex+1)%e.options.length].value}));
    await stable('AFTER_SKIN_TEXTURE');
    await pick('col-hair-tip','#9c593b');await stable('AFTER_TIP_COLOR');
    await pick('sel-hair-dye',await p.evaluate(()=>{let e=document.getElementById('sel-hair-dye');return e.options[(e.selectedIndex+1)%e.options.length].value}));
    await stable('AFTER_DYE_PRESET');
    await pick('vcd-eye-preset-select',await p.evaluate(()=>{let e=document.getElementById('vcd-eye-preset-select');return e.options[2].value}));
    await stable('AFTER_QUICK_EYE_PRESET');
    // Real custom PBR map upload/clear is a separate async FileReader path,
    // not covered by choosing a built-in skin variant.
    await p.evaluate(async()=>{const c=document.createElement('canvas');c.width=16;c.height=16;let x=c.getContext('2d');x.fillStyle='#d3a185';x.fillRect(0,0,16,16);const blob=await new Promise(done=>c.toBlob(done,'image/png'));const data=new DataTransfer();data.items.add(new File([blob],'skin-matrix.png',{type:'image/png'}));const inp=document.getElementById('input-char-skin-map');inp.files=data.files;inp.dispatchEvent(new Event('change',{bubbles:true}))});
    await p.waitForFunction(()=>window.__cervixQA.state.studioDraft.customSkinMapUrl?.startsWith('data:image/png'),null,{timeout:10000});
    await stable('AFTER_CUSTOM_SKIN_UPLOAD');
    await p.evaluate(()=>document.getElementById('btn-clear-char-skin-map').click());
    await p.waitForFunction(()=>window.__cervixQA.state.studioDraft.customSkinMapUrl==='',null,{timeout:10000});
    await stable('AFTER_CUSTOM_SKIN_CLEAR');
    console.log('ERRORS',JSON.stringify(errors));
    assert.equal(errors.length,0,'console/page errors');
  } finally { await b.close(); }
})().catch(err => {console.error(err);process.exitCode=1});
