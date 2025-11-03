(function(){
  const S = window.State;
  const Scene = window.Scene;

  let pickFBO=null, pickTex=null, pickDepth=null;

  function createPickTargets(){
    const gl=S.gl, w=gl.canvas.width, h=gl.canvas.height;
    if(!pickFBO) pickFBO=gl.createFramebuffer();
    if(pickTex) gl.deleteTexture(pickTex);
    if(pickDepth) gl.deleteRenderbuffer(pickDepth);

    pickTex=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,pickTex);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
    pickDepth=gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER,pickDepth);
    gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,w,h);
    gl.bindFramebuffer(gl.FRAMEBUFFER,pickFBO);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,pickTex,0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,pickDepth);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  }
  Scene._createPickTargets = createPickTargets;

  function initMouseAndWheel(){
    const canvas=S.gl.canvas;
    let dragging=false, lastX=0, lastY=0;

    canvas.addEventListener('mousedown', e=>{
      if(Scene.state.mode!==Scene.MODE.VIEW3D) return;
      dragging=true; lastX=e.clientX; lastY=e.clientY;
    });
    window.addEventListener('mouseup', ()=>dragging=false);
    window.addEventListener('mousemove', e=>{
      if(!dragging || Scene.state.mode!==Scene.MODE.VIEW3D) return;
      const dx=(e.clientX-lastX)/220, dy=(e.clientY-lastY)/220; lastX=e.clientX; lastY=e.clientY;
      Scene.state.yaw  -= dx;
      Scene.state.pitch = Math.max(-1.2, Math.min(1.2, Scene.state.pitch + dy));
      Scene.updateViewProj();
    });

    canvas.addEventListener('wheel', e=>{
      if (Scene.state.mode===Scene.MODE.VIEW3D) {
        Scene.state.camDist *= (1 + Math.sign(e.deltaY)*0.08);
        Scene.state.camDist = Math.max(4,Math.min(80,Scene.state.camDist));
      } else {
        Scene.state.orthoScale *= (1 + Math.sign(e.deltaY)*0.08);
        Scene.state.orthoScale = Math.max(4,Math.min(120,Scene.state.orthoScale));
      }
      Scene.updateViewProj();
    }, {passive:true});

    // picking click
    canvas.addEventListener('click', e=>{
      if(Scene.state.mode!==Scene.MODE.TOP) return;
      const gl=S.gl, rect=canvas.getBoundingClientRect();
      const x=Math.floor((e.clientX-rect.left)*(gl.canvas.width/rect.width));
      const y=Math.floor((rect.bottom-e.clientY)*(gl.canvas.height/rect.height));
      gl.bindFramebuffer(gl.FRAMEBUFFER,pickFBO); Scene.render(true);
      const px=new Uint8Array(4); gl.readPixels(x,y,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);
      gl.bindFramebuffer(gl.FRAMEBUFFER,null);
      Scene.selectedId = Scene.rgbToId(px[0],px[1],px[2]);
    });
  }

  function initKeys(){
    window.addEventListener('keydown', e=>{
      const k=e.key;
      if(k==='v'||k==='V'){ 
        Scene.state.mode=(Scene.state.mode===Scene.MODE.VIEW3D?Scene.MODE.TOP:Scene.MODE.VIEW3D);
        Scene.updateViewProj(); 
      }
      else if(k===' '){ 
        Scene.flags.running=!Scene.flags.running; 
        if(Scene.flags.running){ 
          for(const p of Scene.state.planets) p.scale=1.0; 
        }
      }
      else if(k==='ArrowUp'){ window.Scene.speedMul = Math.min(5,(window.Scene.speedMul||1)*1.15); }
      else if(k==='ArrowDown'){ window.Scene.speedMul = Math.max(0,(window.Scene.speedMul||1)/1.15); }
      else if(k==='a'||k==='A'){ Scene.flags.showAxes=!Scene.flags.showAxes; }
      else if(k==='o'||k==='O'){ Scene.flags.showOrbits=!Scene.flags.showOrbits; }
      else if(k==='+'){ Scene.addPlanet(); }
      else if(k==='-'){ Scene.deletePlanet(); }
      else if(!Scene.flags.running && Scene.selectedId){
        const p=Scene.state.planets.find(q=>q.id===Scene.selectedId); if(!p) return;
        const inc=(k===k.toUpperCase()?+0.08:-0.08);
        if(k==='x'||k==='X') p.spinX+=inc;
        else if(k==='y'||k==='Y') p.spinY+=inc;
        else if(k==='z'||k==='Z') p.spinZ+=inc;
        else if(k==='[') p.scale=Math.max(0.3,p.scale*0.92);
        else if(k===']') p.scale=Math.min(2.5,p.scale/0.92);
      }
    });
  }

  window.Input = {
    init: function(){
      initMouseAndWheel();
      initKeys();
      createPickTargets();
    }
  };
})();
