let rectBounds = {x:40,y:40,w:800,h:450};
let randomPoints = [];
let obstacle = null;
let people = [];
let triangles = [];
let triColors = [];

const desiredDensity = 4;
const N_RANDOM = 36;
const N_PEOPLE = 60;

function computeRectBounds() {
  const W = gl.drawingBufferWidth;
  const H = gl.drawingBufferHeight;
  return { x: 20, y: 20, w: W - 40, h: H - 40 };
}

function updateObstacleCorners() {
  const {cx, cy, w, h, angle} = obstacle;
  const c = Math.cos(angle), s = Math.sin(angle);
  const hw = w/2, hh = h/2;
  const base = [
    {x:-hw, y:-hh}, {x: hw, y:-hh}, {x: hw, y: hh}, {x:-hw, y: hh}
  ];
  obstacle.corners = base.map(p => ({
    x: cx + p.x*c - p.y*s,
    y: cy + p.x*s + p.y*c
  }));
}

function poissonPoints(bounds, count, minDist) {
  const pts = [];
  let attempts = 0;
  while (pts.length < count && attempts < count*500) {
    const px = bounds.x + Math.random()*bounds.w;
    const py = bounds.y + Math.random()*bounds.h;
    if (distanceToNearest(px, py, pts) >= minDist) pts.push({x:px,y:py});
    attempts++;
  }
  return pts;
}
function distanceToNearest(x, y, pts) {
  let best = Infinity;
  for (const p of pts) {
    const dx=x-p.x, dy=y-p.y;
    const d=dx*dx+dy*dy;
    if (d<best) best=d;
  }
  return Math.sqrt(best);
}

function createInitialState() {
  rectBounds = computeRectBounds();
  randomPoints = poissonPoints(rectBounds, N_RANDOM, 12);

  const obW=160, obH=100;
  obstacle = {
    cx: rectBounds.x + rectBounds.w*0.55,
    cy: rectBounds.y + rectBounds.h*0.55,
    w: obW, h: obH, angle: 0.2, corners:[]
  };
  updateObstacleCorners();

  people = [];
  let tries = 0;
  while (people.length < N_PEOPLE && tries < 10000) {
    const px = rectBounds.x + Math.random()*rectBounds.w;
    const py = rectBounds.y + Math.random()*rectBounds.h;
    if (!pointInRotRect(px, py, obstacle)) people.push({x:px,y:py});
    tries++;
  }

  retriangulate();
}

function retriangulate() {
  const pts = [];
  rectCornersRB(rectBounds).forEach(p => pts.push({...p}));
  randomPoints.forEach(p => pts.push({...p}));
  obstacle.corners.forEach(p => pts.push({...p}));

  const trisIdx = delaunayTriangulate(pts);
  triangles = [];
  for (let i=0;i<trisIdx.length;i+=3) {
    const a=trisIdx[i], b=trisIdx[i+1], c=trisIdx[i+2];
    const pa=pts[a], pb=pts[b], pc=pts[c];
    const centroid = { x:(pa.x+pb.x+pc.x)/3, y:(pa.y+pb.y+pc.y)/3 };
    if (!pointInRect(centroid, rectBounds)) continue;
    if (pointInRotRect(centroid.x, centroid.y, obstacle)) continue;
    triangles.push({a,b,c});
  }
  triColors = new Array(triangles.length);
  updateDensityColors(pts);
  buildGLMeshes(pts);
}

function updateDensityColors(pts) {
  for (let i=0;i<triangles.length;i++) {
    const {a,b,c} = triangles[i];
    const pa=pts[a], pb=pts[b], pc=pts[c];
    let count=0;
    for (const person of people) {
      if (pointInTriangle(person.x, person.y, pa, pb, pc)) count++;
    }
    if (count === desiredDensity) triColors[i] = [0.71, 0.94, 0.71];
    else if (count > desiredDensity) triColors[i] = [1.0, 0.70, 0.70];
    else triColors[i] = [0.71, 0.78, 1.0];
  }
}
