import {hairSettings, HAIR_DEFAULTS, HAIR_LAB_KEY, setHairSettings, impulseHair, getHairMotionDiagnostics} from '../three/hairRealismRuntime.js';
import './hairLab.css';

export function createHairLab({desktop,studio,notify=()=>{}}) {
  try {const saved=JSON.parse(localStorage.getItem(HAIR_LAB_KEY)||'null');if(saved?.version===1)setHairSettings(saved.settings);}catch(_){}
  const host=document.createElement('div');host.id='hair-lab';
  const range=(key,title,note)=>`<label class="hl-range"><span>${title}<output data-output="${key}"></output></span><small>${note}</small><input data-hair="${key}" type="range" min="0" max="1" step=".05" aria-label="${title}"></label>`;
  host.innerHTML=`<aside id="hair-lab-panel" hidden role="dialog" aria-modal="false" aria-labelledby="hl-title"><header><div><small>HAIR LAB / 46</small><h2 id="hl-title">发丝实验室</h2></div><button data-action="close" aria-label="关闭发丝实验室">×</button></header><div class="hl-scroll"><p>只改头发。完整发型修复常驻，材质与惯性可独立关闭。</p><label class="hl-toggle"><span>启用发丝增强</span><input type="checkbox" data-hair="enabled"></label><button data-action="compare" aria-pressed="false">A / 对照原材质</button><div class="hl-rule"></div>${range('fibers','纤维光响应','顺发流双瓣高光，取自真实场景灯光；不自发光')}${range('detail','近景发丝细节','读取原艺术家纹理，不用屏幕噪点伪造发丝')}<label class="hl-select">细节预算<select data-hair="quality"><option value="auto">自动 · 近景精细 / 远景节省</option><option value="close">近景优先 · 始终精细采样</option><option value="budget">节能 · 基础纹理与光照</option></select></label><div class="hl-rule"></div><label class="hl-toggle"><span>发梢惯性</span><input type="checkbox" data-hair="motion"></label>${range('inertia','惯性强度','发根固定，拖动 / 旋转后轻微摆动并停下')}<button data-action="impulse">轻拨发梢 · 预览回弹</button><p class="hl-note">这是有阻尼的发片弹簧近似，不是数万根独立发丝碰撞。无持续风场、无额外绘制通道，静止不强制刷新。</p><div class="hl-rule"></div><details><summary>保存与迁移</summary><div class="hl-files"><button data-action="save">保存设置</button><button data-action="export">导出 JSON</button><button data-action="import">导入 JSON</button><input type="file" accept=".json,application/json" hidden></div><p class="hl-note">独立保存，不写入角色档案。显式保存后下次沿用；未保存的预览可取消。</p></details><p class="hl-status" role="status" aria-live="polite"></p></div><footer><button data-action="reset">推荐设置</button><button data-action="cancel">取消本次</button><button data-action="apply">应用并收起</button></footer></aside>`;
  document.body.append(host);const panel=host.querySelector('aside'),status=host.querySelector('.hl-status');
  const button=document.createElement('button');button.className='overlay-btn';button.id='btn-hair-lab';button.textContent='发丝实验室';button.setAttribute('aria-controls','hair-lab-panel');button.setAttribute('aria-expanded','false');document.querySelector('#desktop-overlay-bar .overlay-actions')?.prepend(button);
  // Also accessible if the old toolbar is compacted by the style modulator.
  const studioLaunch=button.cloneNode(true);studioLaunch.removeAttribute('id');studioLaunch.className='chip-btn';document.querySelector('.viewport-toolbar')?.append(studioLaunch);
  let session=null,previousFocus=null,compare=false,comparison=null,importSerial=0;
  const wake=()=>{desktop?.wakeRender(3,false);studio?.wakeRender(3,false);};
  function sync(){for(const input of host.querySelectorAll('[data-hair]')){const key=input.dataset.hair;if(input.type==='checkbox')input.checked=hairSettings[key];else input.value=hairSettings[key];const out=host.querySelector(`[data-output="${key}"]`);if(out)out.textContent=Math.round(hairSettings[key]*100)+'%';}host.querySelector('[data-action=compare]').setAttribute('aria-pressed',String(compare));host.querySelector('[data-action=compare]').textContent=compare?'B / 返回发丝增强':'A / 对照原材质';}
  function apply(patch){if(compare){setHairSettings(comparison);compare=false;}setHairSettings(patch);sync();wake();}
  function open(){if(!panel.hidden)return;session={...hairSettings};previousFocus=document.activeElement;panel.hidden=false;button.setAttribute('aria-expanded','true');sync();host.querySelector('[data-hair=enabled]').focus();}
  function close(cancel=false){importSerial++;if(compare){setHairSettings(comparison);compare=false;}if(cancel&&session)setHairSettings(session);panel.hidden=true;button.setAttribute('aria-expanded','false');sync();wake();previousFocus?.focus?.();}
  button.addEventListener('click',()=>panel.hidden?open():close());studioLaunch.addEventListener('click',open);
  host.addEventListener('input',e=>{const k=e.target.dataset.hair;if(!k)return;apply({[k]:e.target.type==='checkbox'?e.target.checked:k==='quality'?e.target.value:Number(e.target.value)});});
  host.addEventListener('click',e=>{const action=e.target.closest('button')?.dataset.action;if(!action)return;
    switch(action){
      case 'close':case 'cancel':close(true);break;
      case 'apply':close();break;
      case 'reset':apply(HAIR_DEFAULTS);break;
      case 'compare':if(!compare){comparison={...hairSettings};setHairSettings({enabled:false});compare=true;}else{setHairSettings(comparison);compare=false;}sync();wake();break;
      case 'impulse':if(studio?.headNode)impulseHair(studio.headNode);desktop?.pets.forEach(p=>impulseHair(p.node));wake();status.textContent=hairSettings.enabled&&hairSettings.motion?'已轻拨发梢；查看当前工坊或桌宠。':'请先启用发丝增强与发梢惯性。';break;
      case 'save':try{localStorage.setItem(HAIR_LAB_KEY,JSON.stringify({version:1,settings:compare?comparison:hairSettings}));status.textContent='已保存本机设置，下次沿用。';}catch(_){status.textContent='浏览器存储不可用，请导出 JSON。';}break;
      case 'export':{const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,settings:compare?comparison:hairSettings},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='发丝实验室设置.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);break;}
      case 'import':host.querySelector('input[type=file]').click();break;
    }
  });
  host.querySelector('input[type=file]').addEventListener('change',async e=>{const file=e.target.files?.[0],serial=++importSerial;if(!file)return;try{if(file.size>16384)throw Error('文件过大');const data=JSON.parse(await file.text());if(serial!==importSerial)return;if(data.version!==1||!data.settings||typeof data.settings!=='object'||Array.isArray(data.settings))throw Error('不支持的设置格式');apply({...HAIR_DEFAULTS,...data.settings});status.textContent='已导入预览；可以取消或保存。';}catch(error){status.textContent='导入失败：'+error.message;}finally{e.target.value='';}});
  window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){close(true);e.stopImmediatePropagation();}},true);
  sync();return {open,set:apply,get settings(){return {...hairSettings};},impulse:()=>{if(studio?.headNode)impulseHair(studio.headNode);wake();},diagnostics:()=>getHairMotionDiagnostics(studio.headNode)};
}
