// scene.js  — fixed: no internal `mode`; always use Scene.state.mode
(function(){
  const S = window.State;
  const { makeGeom, drawGeom, setModel } = window.GLUtils;

  const G = {};
  window.Scene = { G };

  async function loadOBJGeomOrFallback(url, fallbackText){
    try{
      const res = await fetch(url);
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const g = SimpleOBJ.parse(text);
      return makeGeom(S.gl, g.positions, g.normals, g.indices);
    }catch(e){
      console.warn(`OBJ load failed for ${url}; using fallback.`, e);
      const g = SimpleOBJ.parse(fallbackText);
      return makeGeom(S.gl, g.positions, g.normals, g.indices);
    }
  }

  function makeSphere(lat=22, lon=32, r=1){
    const p=[], n=[], idx=[];
    for(let i=0;i<=lat;i++){
      const th=i*Math.PI/lat, st=Math.sin(th), ct=Math.cos(th);
      for(let j=0;j<=lon;j++){
        const ph=j*2*Math.PI/lon, sp=Math.sin(ph), cp=Math.cos(ph);
        const x=cp*st, y=ct, z=sp*st;
        p.push(r*x,r*y,r*z); n.push(x,y,z);
      }
    }
    for(let i=0;i<lat;i++) for(let j=0;j<lon;j++){
      const a=i*(lon+1)+j, b=a+lon+1;
      idx.push(a,b,a+1, b,b+1,a+1);
    }
    return makeGeom(S.gl, new Float32Array(p), new Float32Array(n), new Uint16Array(idx));
  }

  async function loadGeometries(){
    G.axis   = await loadOBJGeomOrFallback('models/axis.obj',  MODELS.axis);
    G.cube   = await loadOBJGeomOrFallback('models/cube.obj',  MODELS.cube);
    G.tetra  = await loadOBJGeomOrFallback('models/tetra.obj', MODELS.tetra);
    G.icosa  = await loadOBJGeomOrFallback('models/icosa.obj', MODELS.icosa);
    G.sphere = makeSphere(); // keep procedural
  }

  // ---- camera + proj
  const viewLabel = document.getElementById('viewMode');
  const MODE = { TOP:0, VIEW3D:1 };

  function updateViewProj(){
    const gl = S.gl, M=S.M;
    let eye;
    if (Scene.state.mode===MODE.VIEW3D) {
      const d=Scene.state.camDist, yaw=Scene.state.yaw, pitch=Scene.state.pitch;
      eye = [ d*Math.cos(pitch)*Math.sin(yaw), d*Math.sin(pitch), d*Math.cos(pitch)*Math.cos(yaw) ];
      mat4.lookAt(M.view, eye, [0,0,0], [0,1,0]);
      mat4.perspective(M.proj, Math.PI/4, gl.canvas.clientWidth/gl.canvas.clientHeight, 0.1, 2000);
    } else {
      eye = [0,40,0];
      mat4.lookAt(M.view, eye, [0,0,0], [0,0,-1]);               // top-down, Z+ up
      const a = gl.canvas.clientWidth/gl.canvas.clientHeight, s=Scene.state.orthoScale;
      mat4.ortho(M.proj, -s*a, s*a, -s, s, 0.1, 200);
    }
    gl.uniform3fv(S.U.uViewPos, eye);
    gl.uniformMatrix4fv(S.U.uView, false, M.view);
    gl.uniformMatrix4fv(S.U.uProj, false, M.proj);
    viewLabel.textContent = (Scene.state.mode===MODE.VIEW3D?'3D View':'Top View');
  }

  // scene constants
  const lightPos=[0,0,0];
  const STAR={ radius:1.35, color:[1.0,0.92,0.25], shininess:6.0, emissive:0.9 };

  const PLANET_MODELS=['sphere','cube','icosa','tetra'];
  const planets=[]; let nextId=1;
  const rand=(a,b)=>a+Math.random()*(b-a);
  const MIN_PLANETS=3;
  const orbitAFor=i=>2.5+i*1.4;
  const orbitBFor=i=>orbitAFor(i)*(0.65+0.25*Math.sin(i*1.1));

  function vaoFor(n){ return n==='sphere'?G.sphere:n==='cube'?G.cube:n==='icosa'?G.icosa:n==='tetra'?G.tetra:G.sphere; }

  function makeEllipseLine(a,b,steps=128){
    const gl=S.gl, pts=[];
    for(let i=0;i<=steps;i++){ const t=i/steps*2*Math.PI; pts.push(a*Math.cos(t),0,b*Math.sin(t)); }
    const vbo=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pts),gl.STATIC_DRAW);
    return { vbo, count: pts.length/3 };
  }

  function addPlanet(){
    const i=planets.length; const a=orbitAFor(i), b=orbitBFor(i);
    const model=PLANET_MODELS[i%PLANET_MODELS.length], color=[rand(0.25,1),rand(0.25,1),rand(0.25,1)];
    planets.push({ id:nextId++, vao:vaoFor(model), modelName:model, color, shininess:rand(8,30),
      radius:(model==='sphere'?rand(0.35,0.6):rand(0.5,0.8)), a,b, orbit:makeEllipseLine(a,b),
      theta:0, speed:rand(0.25,1.0), spinX:0,spinY:0,spinZ:0, scale:1.0 });
  }
  function deletePlanet(){ if(planets.length<=MIN_PLANETS) return; const p=planets.pop(); S.gl.deleteBuffer(p.orbit.vbo); }
  function initPlanets(n=MIN_PLANETS){ while(planets.length) deletePlanet(); while(planets.length<n) addPlanet(); }

  // draw helpers
  function drawStar(){
    const gl=S.gl, M=S.M;
    mat4.identity(M.model); mat4.scale(M.model,M.model,[STAR.radius,STAR.radius,STAR.radius]);
    setModel(gl, M.model);
    gl.uniform3fv(S.U.uColor,STAR.color); gl.uniform1f(S.U.uShininess,STAR.shininess);
    gl.uniform1f(S.U.uEmissive,STAR.emissive); gl.uniform1i(S.U.uHighlight,false);
    drawGeom(gl, G.sphere);
  }

  function drawAxes(showAxes){
    if(!showAxes) return; const gl=S.gl, M=S.M, SCL=4.0;
    const axisEmissive = 0.35;
    // X
    mat4.identity(M.model); mat4.rotateZ(M.model,M.model,-Math.PI/2); mat4.scale(M.model,M.model,[SCL,SCL,SCL]);
    setModel(gl, M.model); gl.uniform3fv(S.U.uColor,[1.0,0.25,0.25]); gl.uniform1f(S.U.uEmissive,axisEmissive); gl.uniform1f(S.U.uShininess,12); gl.uniform1i(S.U.uHighlight,false);
    drawGeom(gl, G.axis);
    // Y
    mat4.identity(M.model); mat4.scale(M.model,M.model,[SCL,SCL,SCL]);
    setModel(gl, M.model); gl.uniform3fv(S.U.uColor,[0.2,1.0,0.3]); gl.uniform1f(S.U.uEmissive,axisEmissive); drawGeom(gl, G.axis);
    // Z
    mat4.identity(M.model); mat4.rotateX(M.model,M.model, Math.PI/2); mat4.scale(M.model,M.model,[SCL,SCL,SCL]);
    setModel(gl, M.model); gl.uniform3fv(S.U.uColor,[0.3,0.6,1.0]); gl.uniform1f(S.U.uEmissive,axisEmissive); drawGeom(gl, G.axis);
  }

  function drawOrbits(showOrbits){
    if(!showOrbits) return; const gl=S.gl, M=S.M;
    gl.uniform1f(S.U.uEmissive,0.0); gl.uniform1f(S.U.uShininess,2.0); gl.uniform1i(S.U.uHighlight,false);
    for(const p of planets){
      mat4.identity(M.model); setModel(gl, M.model); gl.uniform3fv(S.U.uColor,[0.55,0.55,0.62]);
      gl.bindBuffer(gl.ARRAY_BUFFER,p.orbit.vbo);
      gl.disableVertexAttribArray(S.A.aNormal);
      gl.enableVertexAttribArray(S.A.aPosition);
      gl.vertexAttribPointer(S.A.aPosition,3,gl.FLOAT,false,12,0);
      gl.drawArrays(gl.LINE_STRIP,0,p.orbit.count);
      gl.disableVertexAttribArray(S.A.aPosition);
      gl.enableVertexAttribArray(S.A.aNormal);
    }
  }

  function drawPlanet(p, picking){
    const gl=S.gl, M=S.M;
    const c=Math.cos(p.theta), s=Math.sin(p.theta); const x=p.a*c, z=p.b*s;
    mat4.identity(M.model); mat4.translate(M.model,M.model,[x,0,z]);
    mat4.rotateX(M.model,M.model,p.spinX); mat4.rotateY(M.model,M.model,p.spinY); mat4.rotateZ(M.model,M.model,p.spinZ);
    const sc=p.radius*p.scale; mat4.scale(M.model,M.model,[sc,sc,sc]); setModel(gl, M.model);
    if(picking){ gl.uniform1i(S.U.uPicking,true); gl.uniform3fv(S.U.uIdColor, idToRgb(p.id)); drawGeom(gl, p.vao); gl.uniform1i(S.U.uPicking,false); }
    else { gl.uniform3fv(S.U.uColor,p.color); gl.uniform1f(S.U.uShininess,p.shininess); gl.uniform1i(S.U.uHighlight,Scene.selectedId===p.id); gl.uniform1f(S.U.uEmissive,0.0); drawGeom(gl, p.vao); }
  }

  function renderScene(picking){
    const gl=S.gl;
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.uniform3fv(S.U.uLightPos,lightPos);
    if(!picking) drawStar();
    drawAxes(Scene.flags.showAxes);
    if(!picking) drawOrbits(Scene.flags.showOrbits);
    for(const p of planets) drawPlanet(p, picking);
  }

  function idToRgb(id){ return [(id&255)/255,((id>>8)&255)/255,((id>>16)&255)/255]; }
  function rgbToId(r,g,b){ return r+(g<<8)+(b<<16); }

  // public API
  Scene.MODE = MODE;
  Scene.state = {
    mode: MODE.VIEW3D,
    camDist:14, yaw:0.9, pitch:0.45,
    orthoScale:20,
    planets,
    MIN_PLANETS,
    nextIdRef:()=>nextId
  };

  Scene.updateViewProj = () => updateViewProj();
  Scene.addPlanet = () => addPlanet();
  Scene.deletePlanet = () => deletePlanet();
  Scene.initPlanets = (n) => initPlanets(n);
  Scene.render = (picking) => renderScene(picking);
  Scene.idToRgb = idToRgb; Scene.rgbToId = rgbToId;

  Scene.flags = { showAxes:true, showOrbits:true, running:true };
  Scene.selectedId = 0;

  Scene.resizeFit = function(){
    const gl=S.gl, canvas=gl.canvas;
    const dpr=window.devicePixelRatio||1;
    const w=Math.floor(innerWidth*dpr), h=Math.floor(innerHeight*dpr);
    if(canvas.width!==w||canvas.height!==h){
      canvas.width=w; canvas.height=h; gl.viewport(0,0,w,h);
      updateViewProj(); if (Scene._createPickTargets) Scene._createPickTargets();
    }
  };

  Scene.loadGeometries = () => loadGeometries();
})();
