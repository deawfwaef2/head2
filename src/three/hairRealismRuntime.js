import { Vector3, Quaternion } from 'three';

export const HAIR_LAB_KEY='head2-hair-lab-v1';
export const HAIR_DEFAULTS=Object.freeze({enabled:true,fibers:.85,detail:.65,motion:true,inertia:.6,quality:'auto'});
export const hairSettings={...HAIR_DEFAULTS};
export function setHairSettings(patch={}) {
  for(const k of ['enabled','motion'])if(typeof patch[k]==='boolean')hairSettings[k]=patch[k];
  for(const k of ['fibers','detail','inertia'])if(Number.isFinite(patch[k]))hairSettings[k]=Math.max(0,Math.min(1,patch[k]));
  if(['auto','close','budget'].includes(patch.quality))hairSettings.quality=patch.quality;
  return {...hairSettings};
}
const states=new WeakMap();
function getState(root) {
  if(!states.has(root))states.set(root,{lastTime:0,position:new Vector3(),previousVelocity:new Vector3(),rotation:new Quaternion(),spring:[0,0,0],velocity:[0,0,0],impulse:[0,0,0],initialized:false,diagnostic:{}});
  return states.get(root);
}
// Semi-implicit damped spring, bounded substeps and displacement. Metres.
export function stepHairSpring(s,dt,force=[0,0,0]) {
  const elapsed=Math.min(.05,Math.max(0,dt)),steps=Math.max(1,Math.ceil(elapsed/(1/120))),h=elapsed/steps;
  for(let j=0;j<steps;j++)for(let i=0;i<3;i++){
    const acceleration=Math.max(-1,Math.min(1,force[i]))-150*s.spring[i]-20*s.velocity[i];
    s.velocity[i]+=acceleration*h;s.spring[i]+=s.velocity[i]*h;
    if(Math.abs(s.spring[i])>.004){s.spring[i]=Math.sign(s.spring[i])*.004;s.velocity[i]*=.25;}
  }
}
export function impulseHair(root) {const s=getState(root);s.velocity[0]+=.025;s.velocity[2]-=.009;}
export function getHairMotionDiagnostics(root) {const s=getState(root);return {...s.diagnostic,offset:[...s.spring]};}

function updateMotion(root) {
  const s=getState(root),now=performance.now()/1000;
  if(now-s.lastTime<.001)return s;
  const dt=Math.min(.05,Math.max(.001,now-s.lastTime));
  const position=root.getWorldPosition(new Vector3()),rotation=root.getWorldQuaternion(new Quaternion());
  if(!s.initialized || now-s.lastTime>.25){s.position.copy(position);s.rotation.copy(rotation);s.previousVelocity.set(0,0,0);s.initialized=true;}
  const speed=position.clone().sub(s.position).divideScalar(dt);
  const acceleration=speed.clone().sub(s.previousVelocity).divideScalar(dt).applyQuaternion(rotation.clone().invert());
  const delta=rotation.clone().multiply(s.rotation.clone().invert());if(delta.w<0){delta.x*=-1;delta.y*=-1;delta.z*=-1;}
  const force=[-acceleration.x*.00035-delta.y*.6/dt, -acceleration.y*.0002, -acceleration.z*.00035+delta.x*.6/dt];
  const active=hairSettings.enabled&&hairSettings.motion;
  if(active)stepHairSpring(s,dt,force);else{s.spring.fill(0);s.velocity.fill(0);}
  s.lastTime=now;s.position.copy(position);s.rotation.copy(rotation);s.previousVelocity.copy(speed);
  s.diagnostic={active,maxDisplacement:Math.max(...s.spring.map(Math.abs)),approximation:'root-pinned damped card inertia, not strand collision simulation'};
  return s;
}

// Attach to BUILT-IN hair materials only; no new draw calls or per-frame vertex uploads.
export function installHairRealism(material,root,flowHorizontal=false) {
  const uniforms={
    uHairFiberStrength:{value:hairSettings.fibers},uHairMicroDetail:{value:hairSettings.detail},
    uHairFlowHorizontal:{value:flowHorizontal?1:0},uHairDetailLod:{value:1},
    uHairInertia:{value:new Vector3()},
  };
  material.userData.hairRealismUniforms=uniforms;
  const oldCompile=material.onBeforeCompile,oldRender=material.onBeforeRender,oldKey=material.customProgramCacheKey;
  material.customProgramCacheKey=()=>oldKey.call(material)+'-fiber-inertia-v46';
  material.onBeforeCompile=shader=>{
    oldCompile.call(material,shader);Object.assign(shader.uniforms,uniforms);
    shader.vertexShader='uniform vec3 uHairInertia;\n'+shader.vertexShader;
    // Crown roots remain exactly fixed; flexibility increases towards lower tips.
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      float hairFlex=pow(clamp((0.085-position.y)/0.145,0.0,1.0),2.0);
      transformed += uHairInertia * hairFlex;`);
  };
  material.onBeforeRender=(renderer,scene,camera,...rest)=>{
    oldRender?.call(material,renderer,scene,camera,...rest);
    const active=hairSettings.enabled;
    uniforms.uHairFiberStrength.value=active?hairSettings.fibers:0;
    uniforms.uHairMicroDetail.value=active?hairSettings.detail:0;
    // Auto: no additional atlas taps for distant pets; software GPU stays budgeted.
    const projected=root.getWorldPosition(new Vector3()).distanceTo(camera.getWorldPosition(new Vector3()));
    const software=Boolean(root.userData.currentMorphs?.groomSoftware);
    const near=projected<(software?65:85);
    uniforms.uHairDetailLod.value=hairSettings.quality==='close'?1:hairSettings.quality==='budget'?0:(near?1:0);
    const s=updateMotion(root);
    uniforms.uHairInertia.value.fromArray(s.spring).multiplyScalar(active&&hairSettings.motion?hairSettings.inertia:0);
  };
}
