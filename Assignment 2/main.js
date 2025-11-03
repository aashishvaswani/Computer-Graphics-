(async function(){
  const gl = GLUtils.initGL();
  if(!gl) return;

  gl.uniform1i(State.U.uPicking,false);

  await Scene.loadGeometries();
  Scene.initPlanets(3);

  function fit(){ Scene.resizeFit(); }
  window.addEventListener('resize', fit); fit();

  Scene.updateViewProj();
  Input.init();

  let prev=0; window.Scene.speedMul = 1.0;
  function tick(ts){
    Scene.resizeFit();
    const dt=Math.min(0.05,(ts-prev)/1000); prev=ts;
    if(Scene.flags.running) for(const p of Scene.state.planets) p.theta += p.speed*(window.Scene.speedMul||1)*dt;
    Scene.render(false);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
