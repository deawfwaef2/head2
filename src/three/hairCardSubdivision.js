import { BufferGeometry, BufferAttribute } from 'three';

// One budgeted Loop step of the existing artist mesh. Topological neighbours are
// welded by POSITION, not UV index: UV seams must not become artificial open
// edges or shrink independently. UVs remain split for the original atlas.
export function refineArtistHairCards(source) {
  if(!source?.index||!source.attributes.position||!source.attributes.uv||source.morphAttributes.position?.length||source.index.count>90000)return source;
  const p=source.attributes.position,uv=source.attributes.uv,normal=source.attributes.normal,ids=source.index.array,n=p.count;
  const hash=(x,y,z)=>`${Math.round(x*1e6)}/${Math.round(y*1e6)}/${Math.round(z*1e6)}`;
  const weld=new Map(),representatives=[],wids=new Uint32Array(n);
  for(let i=0;i<n;i++){const k=hash(p.getX(i),p.getY(i),p.getZ(i));if(!weld.has(k)){weld.set(k,representatives.length);representatives.push(i);}wids[i]=weld.get(k);}
  const key=(a,b)=>a<b?`${a}/${b}`:`${b}/${a}`;
  const topology=new Map(),edges=new Map(),adj=representatives.map(()=>new Set()),border=representatives.map(()=>[]),invalid=new Set();
  const read=(w,k)=>p.array[representatives[w]*3+k];
  function add(a,b,c){
    const aw=wids[a],bw=wids[b],cw=wids[c],k=key(aw,bw);
    if(!topology.has(k))topology.set(k,{a:aw,b:bw,opposite:[]});
    topology.get(k).opposite.push(cw);adj[aw].add(bw);adj[bw].add(aw);
    const uvKey=key(a,b);if(!edges.has(uvKey))edges.set(uvKey,{a,b,index:n+edges.size,topologyKey:k});
  }
  for(let i=0;i<ids.length;i+=3){const [a,b,c]=[ids[i],ids[i+1],ids[i+2]];if(a===b||a===c||b===c)continue;add(a,b,c);add(b,c,a);add(c,a,b);}
  for(const e of topology.values())if(e.opposite.length===1){border[e.a].push(e.b);border[e.b].push(e.a);}else if(e.opposite.length!==2){invalid.add(e.a);invalid.add(e.b);}
  const positions=new Float32Array((n+edges.size)*3),texcoords=new Float32Array((n+edges.size)*2),authoredNormals=new Float32Array((n+edges.size)*3);
  for(let i=0;i<n;i++){
    const w=wids[i],neighbours=[...adj[w]],boundary=border[w];
    for(let k=0;k<3;k++){
      let value=read(w,k);
      if(!invalid.has(w)){
        if(boundary.length===2)value=.75*value+.125*(read(boundary[0],k)+read(boundary[1],k));
        else if(boundary.length===0&&neighbours.length>=3){const beta=neighbours.length===3?3/16:3/(8*neighbours.length);value=(1-neighbours.length*beta)*value+beta*neighbours.reduce((s,j)=>s+read(j,k),0);}
      }
      positions[i*3+k]=value;authoredNormals[i*3+k]=normal?normal.array[i*3+k]:0;
    }
    texcoords[i*2]=uv.getX(i);texcoords[i*2+1]=uv.getY(i);
  }
  for(const e of edges.values()){
    const {a,b,index:i}=e,t=topology.get(e.topologyKey),o=t.opposite;
    for(let k=0;k<3;k++){
      positions[i*3+k]=o.length===2?(3*(read(t.a,k)+read(t.b,k))+read(o[0],k)+read(o[1],k))/8:(read(t.a,k)+read(t.b,k))/2;
      authoredNormals[i*3+k]=normal?(normal.array[a*3+k]+normal.array[b*3+k])/2:0;
    }
    texcoords[i*2]=(uv.getX(a)+uv.getX(b))/2;texcoords[i*2+1]=(uv.getY(a)+uv.getY(b))/2;
  }
  const indices=[];
  for(let i=0;i<ids.length;i+=3){const [a,b,c]=[ids[i],ids[i+1],ids[i+2]];if(a===b||a===c||b===c)continue;const ab=edges.get(key(a,b)).index,bc=edges.get(key(b,c)).index,ca=edges.get(key(c,a)).index;indices.push(a,ab,ca,ab,b,bc,ca,bc,c,ab,bc,ca);}
  const result=new BufferGeometry();result.setAttribute('position',new BufferAttribute(positions,3));result.setAttribute('uv',new BufferAttribute(texcoords,2));result.setIndex(indices);result.computeVertexNormals();
  const normals=result.attributes.normal.array,sums=new Map();
  for(let i=0;i<normals.length;i+=3){
    if(normals[i]*authoredNormals[i]+normals[i+1]*authoredNormals[i+1]+normals[i+2]*authoredNormals[i+2]<0)for(let k=0;k<3;k++)normals[i+k]*=-1;
    const h=hash(positions[i],positions[i+1],positions[i+2]);if(!sums.has(h))sums.set(h,[0,0,0]);const sum=sums.get(h);for(let k=0;k<3;k++)sum[k]+=normals[i+k];
  }
  for(let i=0;i<normals.length;i+=3){const s=sums.get(hash(positions[i],positions[i+1],positions[i+2])),len=Math.hypot(...s);if(len>1e-9)for(let k=0;k<3;k++)normals[i+k]=s[k]/len;}
  result.userData={...source.userData,artistSubdivision:true,seamAware:true,sourceTriangles:ids.length/3};
  delete result.userData.basePositions;delete result.userData.baseHairNormals;delete result.userData.hairShapeSignature;
  for(const g of source.groups)result.addGroup(g.start*4,g.count*4,g.materialIndex);
  result.computeBoundingBox();result.computeBoundingSphere();return result;
}
