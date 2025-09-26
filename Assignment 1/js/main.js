const canvas = document.getElementById('glcanvas');
const gl = canvas.getContext('webgl');
if (!gl) alert('WebGL not supported');

const MODES = {
  moveObstacle:'moveObstacle',
  rotateObstacle:'rotateObstacle',
  scaleObstacle:'scaleObstacle',
  movePerson:'movePerson'
};
let mode = MODES.moveObstacle;

function resizeCanvasToDisplaySize() {
  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.floor(rect.width * dpr);
  const h = Math.floor(rect.height * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w; canvas.height = h;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    rectBounds = computeRectBounds();
    createInitialState();
    requestFrame();
  }
}
window.addEventListener('resize', resizeCanvasToDisplaySize);

// ---------------- Interaction ----------------
let dragging=false, dragStart={x:0,y:0}, saved={}, pickedPerson=-1;

function getMousePos(evt){
  const rect = canvas.getBoundingClientRect();
  const x = (evt.clientX - rect.left) * (gl.drawingBufferWidth/rect.width);
  const y = (evt.clientY - rect.top)  * (gl.drawingBufferHeight/rect.height);
  return {x,y};
}

canvas.addEventListener('mousedown', e=>{
  const p=getMousePos(e);
  if (mode===MODES.movePerson){
    let best=-1,bestD=144;
    for (let i=0;i<people.length;i++){
      const dx=p.x-people[i].x, dy=p.y-people[i].y, d=dx*dx+dy*dy;
      if (d<bestD){best=i; bestD=d;}
    }
    pickedPerson=best; dragging=(best!==-1);
  } else if (pointInRotRect(p.x,p.y,obstacle)){
    dragging=true; dragStart=p;
    saved={cx:obstacle.cx, cy:obstacle.cy, angle:obstacle.angle, w:obstacle.w, h:obstacle.h};
  }
});
canvas.addEventListener('mousemove', e=>{
  if (!dragging) return;
  const p=getMousePos(e);
  if (mode===MODES.movePerson && pickedPerson!==-1){
    let nx=Math.max(rectBounds.x, Math.min(rectBounds.x+rectBounds.w, p.x));
    let ny=Math.max(rectBounds.y, Math.min(rectBounds.y+rectBounds.h, p.y));
    if (!pointInRotRect(nx,ny,obstacle)) { people[pickedPerson].x=nx; people[pickedPerson].y=ny; }
    updateDensityColors(currentTriPoints()); buildGLMeshes(currentTriPoints()); requestFrame();
  }
  else if (mode===MODES.moveObstacle){
    obstacle.cx=saved.cx+(p.x-dragStart.x); obstacle.cy=saved.cy+(p.y-dragStart.y);
    updateObstacleCorners(); retriangulate(); requestFrame();
  }
  else if (mode===MODES.rotateObstacle){
    obstacle.angle=saved.angle+(p.x-dragStart.x)*0.005;
    updateObstacleCorners(); retriangulate(); requestFrame();
  }
  else if (mode===MODES.scaleObstacle){
    const k=1+(p.y-dragStart.y)*-0.003;
    obstacle.w=Math.max(40,saved.w*k); obstacle.h=Math.max(30,saved.h*k);
    updateObstacleCorners(); retriangulate(); requestFrame();
  }
});
canvas.addEventListener('mouseup', ()=>{dragging=false;pickedPerson=-1;});
canvas.addEventListener('mouseleave', ()=>{dragging=false;pickedPerson=-1;});

function currentTriPoints(){
  const arr=[]; rectCornersRB(rectBounds).forEach(p=>arr.push({...p}));
  randomPoints.forEach(p=>arr.push({...p})); obstacle.corners.forEach(p=>arr.push({...p}));
  return arr;
}

const btns=document.querySelectorAll('.btn[data-mode]');
function setMode(m){ mode=m; btns.forEach(b=>b.classList.toggle('active',b.dataset.mode===m)); }
btns.forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
setMode(MODES.moveObstacle);
document.getElementById('resetBtn').addEventListener('click',()=>{createInitialState();requestFrame();});
window.addEventListener('keydown',e=>{
  if(e.key==='1') setMode(MODES.moveObstacle);
  else if(e.key==='2') setMode(MODES.rotateObstacle);
  else if(e.key==='3') setMode(MODES.scaleObstacle);
  else if(e.key==='4') setMode(MODES.movePerson);
  else if(e.key==='r'||e.key==='R'){createInitialState();requestFrame();}
});

// ---------------- Init ----------------
let needsFrame=true; function requestFrame(){needsFrame=true;}
function loop(){ if(needsFrame){needsFrame=false; draw();} requestAnimationFrame(loop);}
(function init(){
  resizeCanvasToDisplaySize();
  prog = createProgram(gl, VS, FS);
  aPos=gl.getAttribLocation(prog,'aPos');
  aCol=gl.getAttribLocation(prog,'aCol');
  createInitialState();
  requestFrame();
  loop();
})();
