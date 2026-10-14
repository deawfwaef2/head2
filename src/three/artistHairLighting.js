import { BufferAttribute } from 'three';
// Hair-card approximation, not a path-traced Marschner BSDF.
// Runs inside Three's real direct-light loop AFTER light visibility/shadowing.
// No fixed light vector, self illumination, procedural strands or extra shells.
// Derive an interpolated V/U tangent from the existing artist UVs, never from
// an invented spherical field. This prevents per-triangle highlight seams.
export function updateArtistHairFlow(geometry, horizontal = false) {
  const p = geometry.attributes.position, uv = geometry.attributes.uv;
  if (!p || !uv) return;
  const values = new Float32Array(p.count * 3), indices = geometry.index;
  const count = indices ? indices.count : p.count;
  for (let f = 0; f + 2 < count; f += 3) {
    const ids = [0,1,2].map(k => indices ? indices.getX(f+k) : f+k);
    const [a,b,c] = ids;
    const du1=uv.getX(b)-uv.getX(a), dv1=uv.getY(b)-uv.getY(a);
    const du2=uv.getX(c)-uv.getX(a), dv2=uv.getY(c)-uv.getY(a);
    const det=du1*dv2-du2*dv1;
    if (Math.abs(det)<1e-12) continue;
    const e1=[p.getX(b)-p.getX(a),p.getY(b)-p.getY(a),p.getZ(b)-p.getZ(a)];
    const e2=[p.getX(c)-p.getX(a),p.getY(c)-p.getY(a),p.getZ(c)-p.getZ(a)];
    const flow=e1.map((v,k)=>(horizontal ? v*dv2-e2[k]*dv1 : e2[k]*du1-v*du2)/det);
    const len=Math.hypot(...flow);
    if (len<1e-12) continue;
    const area=Math.hypot(e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]);
    for (const i of ids) for(let k=0;k<3;k++) values[i*3+k]+=flow[k]/len*area;
  }
  for(let i=0;i<p.count;i++) {
    const k=i*3, length=Math.hypot(values[k],values[k+1],values[k+2]);
    if(length>1e-12) for(let j=0;j<3;j++) values[k+j]/=length;
  }
  geometry.setAttribute('artistHairFlow',new BufferAttribute(values,3));
  geometry.userData.hairFlowHorizontal=horizontal;
}

export function injectArtistHairLighting(shader) {
  shader.vertexShader = 'attribute vec3 artistHairFlow;\nvarying vec3 vArtistHairFlow;\n' + shader.vertexShader;
  shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',
    '#include <begin_vertex>\nvArtistHairFlow = mat3(modelViewMatrix) * artistHairFlow;');
  shader.fragmentShader = 'varying vec3 vArtistHairFlow;\n' + shader.fragmentShader;
  shader.fragmentShader = shader.fragmentShader.replace('#include <lights_physical_pars_fragment>', `
    #include <lights_physical_pars_fragment>
    vec3 hairFlowT;
    float hairFlowValid;
    float hairAtlasValue;
    float hairLobe(float th, float exponent) {
      return pow(max(1.0 - th * th, 0.0), exponent * 0.5);
    }
    void RE_Direct_ArtistHair(const in IncidentLight incident,
      const in vec3 geometryPosition, const in vec3 N, const in vec3 V,
      const in vec3 clearcoatNormal, const in PhysicalMaterial material,
      inout ReflectedLight reflectedLight) {
      // The default physical path is the fallback for degenerate/missing UVs.
      ReflectedLight ordinary;
      ordinary.directDiffuse = vec3(0.0); ordinary.directSpecular = vec3(0.0);
      ordinary.indirectDiffuse = vec3(0.0); ordinary.indirectSpecular = vec3(0.0);
      RE_Direct_Physical(incident, geometryPosition, N, V, clearcoatNormal, material, ordinary);
      reflectedLight.directDiffuse += ordinary.directDiffuse;
      vec3 H = normalize(incident.direction + V + vec3(1e-7));
      vec3 T1 = normalize(hairFlowT + N * 0.06);
      vec3 T2 = normalize(hairFlowT - N * 0.16);
      // Broaden the highlight as the finish slider moves toward matte.
      float exponent = mix(24.0, 100.0, clamp(1.0 - material.roughness, 0.0, 1.0));
      float primary = hairLobe(clamp(dot(T1,H), -1.0, 1.0), exponent);
      float secondary = hairLobe(clamp(dot(T2,H), -1.0, 1.0), exponent * 0.26);
      vec3 F = F_Schlick(material.specularColor, material.specularF90, max(dot(V,H),0.0));
      // Coverage and fine modulation come only from the artist's texture.
      float strandWeight = mix(0.45, 1.15, hairAtlasValue);
      float visibility = max(dot(N, incident.direction), 0.0);
      vec3 fiber = incident.color * visibility * F * strandWeight *
        (primary * 2.2 + secondary * 0.50);
      reflectedLight.directSpecular += mix(ordinary.directSpecular, fiber, hairFlowValid);
    }
    #undef RE_Direct
    #define RE_Direct RE_Direct_ArtistHair
  `);
  shader.fragmentShader = shader.fragmentShader.replace('#include <lights_physical_fragment>', `
    hairFlowValid = 0.0;
    hairAtlasValue = 0.5;
    hairFlowT = normalize(cross(normal, abs(normal.y) < 0.99 ? vec3(0,1,0) : vec3(1,0,0)));
    #ifdef USE_MAP
      vec3 flow = vArtistHairFlow - normal * dot(normal, vArtistHairFlow);
      float flowLength2 = dot(flow,flow);
      if (flowLength2 > 1e-12) {
        hairFlowT = flow * inversesqrt(flowLength2);
        hairFlowValid = 1.0;
      }
      hairAtlasValue = sqrt(clamp(dot(texture2D(map,vMapUv).rgb,vec3(0.2126,0.7152,0.0722)),0.0,1.0));
    #endif
    #include <lights_physical_fragment>
  `);
}
