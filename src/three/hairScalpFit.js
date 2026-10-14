import { BufferGeometry, BufferAttribute, Mesh, MeshBasicMaterial, DoubleSide, Raycaster, Vector3, Box3 } from 'three';

// Fit the EXISTING artist hair outside the CURRENT morphed scalp. Never edit skin
// or generate a shell. A quantized radial collision cache bounds setup cost.
const cache=new WeakMap();
const colliderMaterial=new MeshBasicMaterial({side:DoubleSide});
export function fitArtistHairOutsideScalp(geometry,head) {
  if (!head?.getVertexPosition || !geometry?.attributes.position) return;
  const signature=head.geometry.uuid+':'+(head.morphTargetInfluences||[]).join(',');
  let entry=cache.get(head);
  if (!entry || entry.signature!==signature) {
    entry?.mesh.geometry.dispose();
    const n=head.geometry.attributes.position.count, positions=new Float32Array(n*3), v=new Vector3();
    for(let i=0;i<n;i++){head.getVertexPosition(i,v);positions.set([v.x,v.y,v.z],i*3);}
    const g=new BufferGeometry();g.setAttribute('position',new BufferAttribute(positions,3));g.setIndex(head.geometry.index);g.computeBoundingBox();g.computeBoundingSphere();
    const mesh=new Mesh(g,colliderMaterial);mesh.updateMatrixWorld(true);
    const size=g.boundingBox.getSize(new Vector3()),center=g.boundingBox.getCenter(new Vector3());center.y+=size.y*.16;center.z-=size.z*.07;
    entry={signature,mesh,center,size,rays:new Map(),ray:new Raycaster(),hits:[],v:new Vector3()};cache.set(head,entry);
  }
  const p=geometry.attributes.position,{center,size,mesh,ray,v}=entry;
  let adjusted=0;
  for(let i=0;i<p.count;i++) {
    v.fromBufferAttribute(p,i);
    // Upper scalp only. Leave face-framing locks, ears and lower hairstyle intact.
    if(v.y<center.y || (v.z>center.z+size.z*.24 && v.y<center.y+size.y*.23))continue;
    const direction=v.clone().sub(center),distance=direction.length();if(distance<1e-6)continue;direction.divideScalar(distance);
    const theta=Math.acos(Math.max(-1,Math.min(1,direction.y))),phi=Math.atan2(direction.z,direction.x);
    const ti=Math.round(theta/Math.PI*48),pi=Math.round(phi/(Math.PI*2)*96),key=ti*1000+pi;
    let radius=entry.rays.get(key);
    if(radius===undefined){
      const t=ti/48*Math.PI,f=pi/96*Math.PI*2;
      ray.set(center,new Vector3(Math.sin(t)*Math.cos(f),Math.cos(t),Math.sin(t)*Math.sin(f)));
      entry.hits.length=0;ray.intersectObject(mesh,false,entry.hits);radius=entry.hits[0]?.distance||0;entry.rays.set(key,radius);
    }
    // Small collision clearance (roughly 1.2mm in the built-in metre-scale assets).
    const safe=radius+.0012;
    if(radius>0 && distance<safe && safe-distance<size.x*.22){v.copy(center).addScaledVector(direction,safe);p.setXYZ(i,v.x,v.y,v.z);adjusted++;}
  }
  geometry.userData.scalpFit={adjustedVertices:adjusted,cachedRays:entry.rays.size};
}
