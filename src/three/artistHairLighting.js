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
  shader.fragmentShader = 'varying vec3 vArtistHairFlow;\nuniform float uHairFiberStrength;\nuniform float uHairMicroDetail;\nuniform float uHairFlowHorizontal;\nuniform float uHairDetailLod;\n' + shader.fragmentShader;
  shader.fragmentShader = shader.fragmentShader.replace('#include <lights_physical_pars_fragment>', `
    #include <lights_physical_pars_fragment>
    vec3 hairFlowT;
    float hairFlowValid;
    float hairAtlasValue;
    float hairMicroFiber;
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
      // Cylindrical fiber diffuse response, gated by the actual incident light.
      // No light-independent fill: turning all real lights off yields black hair.
      float sinTL=sqrt(max(0.0,1.0-pow(clamp(dot(hairFlowT,incident.direction),-1.0,1.0),2.0)));
      float frontWrap=max(dot(N,incident.direction),0.0)*.75+.12;
      vec3 fiberDiffuse=incident.color * material.diffuseColor * (sinTL*frontWrap/3.14159265);
      reflectedLight.directDiffuse += mix(ordinary.directDiffuse, fiberDiffuse, hairFlowValid*uHairFiberStrength*.6);
      vec3 H = normalize(incident.direction + V + vec3(1e-7));
      vec3 T1 = normalize(hairFlowT + N * 0.06);
      vec3 T2 = normalize(hairFlowT - N * 0.16);
      // Broaden the highlight as the finish slider moves toward matte.
      float exponent = mix(24.0, 100.0, clamp(1.0 - material.roughness, 0.0, 1.0));
      float primary = hairLobe(clamp(dot(T1,H), -1.0, 1.0), exponent);
      float secondary = hairLobe(clamp(dot(T2,H), -1.0, 1.0), exponent * 0.26);
      vec3 F = F_Schlick(material.specularColor, material.specularF90, max(dot(V,H),0.0));
      // Coverage and fine modulation come only from the artist's texture.
      float strandWeight = mix(0.30, 1.0, hairAtlasValue);
      // Longitudinal scattering alone creates a bright ring on every card.
      // Restrict the azimuth around the fiber normal too, without a fake light.
      vec3 azimuthH = H - hairFlowT * dot(H,hairFlowT);
      float azimuthLength = max(length(azimuthH), 1e-5);
      float azimuth = pow(max(dot(N,azimuthH / azimuthLength),0.0), 3.0);
      float visibility = max(dot(N, incident.direction), 0.0);
      vec3 fiber = incident.color * visibility * F * strandWeight *
        azimuth * (primary * 0.72 + secondary * 0.16);
      // Energy-bounded two-lobe fiber approximation. The previous unnormalised
      // lobe made dark dye almost black; never compensate with emissive stripes.
      float longitudinalR=hairLobe(clamp(dot(T1,H),-1.0,1.0),exponent*1.6);
      float longitudinalTRT=hairLobe(clamp(dot(T2,H),-1.0,1.0),exponent*.48);
      float normalization=sqrt(exponent/(2.0*3.14159265));
      vec3 cortexTint=mix(vec3(.72),sqrt(max(material.diffuseColor,vec3(0.0))),.35);
      vec3 physicalF=min(F*1.4,vec3(.22));
      vec3 resolvedFiber=incident.color * visibility * physicalF * azimuth * normalization *
        (longitudinalR*.55 + longitudinalTRT*.40*cortexTint) * hairMicroFiber;
      fiber=mix(fiber,resolvedFiber,uHairFiberStrength);
      reflectedLight.directSpecular += mix(ordinary.directSpecular, fiber, hairFlowValid);
    }
    #undef RE_Direct
    #define RE_Direct RE_Direct_ArtistHair
  `);
  shader.fragmentShader = shader.fragmentShader.replace('#include <lights_physical_fragment>', `
    hairFlowValid = 0.0;
    hairAtlasValue = 0.5;
    hairMicroFiber = 0.75;
    hairFlowT = normalize(cross(normal, abs(normal.y) < 0.99 ? vec3(0,1,0) : vec3(1,0,0)));
    #ifdef USE_MAP
      vec3 flow = vArtistHairFlow - normal * dot(normal, vArtistHairFlow);
      float flowLength2 = dot(flow,flow);
      if (flowLength2 > 1e-12) {
        hairFlowT = flow * inversesqrt(flowLength2);
        hairFlowValid = 1.0;
      }
      float rawFiber=dot(texture2D(map,vMapUv).rgb,vec3(0.2126,0.7152,0.0722));
      hairAtlasValue = sqrt(clamp(rawFiber,0.0,1.0));
      hairMicroFiber = mix(.45,1.0,hairAtlasValue);
      if(uHairDetailLod>.5 && uHairMicroDetail>.001 && uHairFiberStrength>.001) {
        vec2 texel=1.0/vec2(textureSize(map,0));
        vec2 across=mix(vec2(texel.x,0),vec2(0,texel.y),uHairFlowHorizontal);
        float left=dot(texture2D(map,vMapUv-across*2.0).rgb,vec3(.2126,.7152,.0722));
        float right=dot(texture2D(map,vMapUv+across*2.0).rgb,vec3(.2126,.7152,.0722));
        // Divide out the baked broad lighting band. Keep only authored fiber contrast.
        float relative=clamp((rawFiber+.04)/(.5*(left+right)+.04),.25,1.65);
        hairMicroFiber=mix(hairMicroFiber,clamp(pow(relative,2.8),.12,1.65),uHairMicroDetail);
        vec3 acrossT=normalize(cross(hairFlowT,normal));
        float microSlope=clamp((left-right)/(.10+left+right),-.55,.55);
        normal=normalize(normal + acrossT*microSlope*uHairMicroDetail*.20);
      }
    #endif
    #include <lights_physical_fragment>
  `);
}
