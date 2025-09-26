let prog, aPos, aCol;
let triBuf, triColBuf, triCount;
let lineBuf, lineColBuf, lineCount;
let pointBuf, pointColBuf, pointCount;

const VS = `
  attribute vec2 aPos;
  attribute vec3 aCol;
  varying vec3 vCol;
  void main(){
    gl_Position = vec4(aPos, 0.0, 1.0);
    vCol = aCol;
    gl_PointSize = 4.0;
  }
`;
const FS = `
  precision mediump float;
  varying vec3 vCol;
  void main(){ gl_FragColor = vec4(vCol, 1.0); }
`;

function createProgram(gl, vsSrc, fsSrc) {
  function compile(type, src){
    const s=gl.createShader(type);
    gl.shaderSource(s,src); gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  const vs=compile(gl.VERTEX_SHADER, vsSrc);
  const fs=compile(gl.FRAGMENT_SHADER, fsSrc);
  const p=gl.createProgram();
  gl.attachShader(p,vs); gl.attachShader(p,fs); gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  return p;
}

function buildGLMeshes(pts) {
  const triVerts=[], triCols=[];
  for (let i=0;i<triangles.length;i++) {
    const {a,b,c}=triangles[i];
    const col=triColors[i];
    const A=toNDC(pts[a].x, pts[a].y, gl.drawingBufferWidth, gl.drawingBufferHeight);
    const B=toNDC(pts[b].x, pts[b].y, gl.drawingBufferWidth, gl.drawingBufferHeight);
    const C=toNDC(pts[c].x, pts[c].y, gl.drawingBufferWidth, gl.drawingBufferHeight);
    triVerts.push(A[0],A[1], B[0],B[1], C[0],C[1]);
    triCols.push(...col, ...col, ...col);
  }
  triCount = triangles.length * 3;
  triBuf = makeBuffer(new Float32Array(triVerts));
  triColBuf = makeBuffer(new Float32Array(triCols));

  const lineVerts=[], lineCols=[];
  const edgeCol=[0.20,0.28,0.45];
  for (const t of triangles) {
    const A=toNDC(pts[t.a].x, pts[t.a].y, gl.drawingBufferWidth, gl.drawingBufferHeight);
    const B=toNDC(pts[t.b].x, pts[t.b].y, gl.drawingBufferWidth, gl.drawingBufferHeight);
    const C=toNDC(pts[t.c].x, pts[t.c].y, gl.drawingBufferWidth, gl.drawingBufferHeight);
    lineVerts.push(A[0],A[1], B[0],B[1], B[0],B[1], C[0],C[1], C[0],C[1], A[0],A[1]);
    for (let k=0;k<3;k++) lineCols.push(...edgeCol, ...edgeCol);
  }
  const oc = obstacle.corners;
  for (let i=0;i<4;i++) {
    const P=toNDC(oc[i].x, oc[i].y, gl.drawingBufferWidth, gl.drawingBufferHeight);
    const Q=toNDC(oc[(i+1)%4].x, oc[(i+1)%4].y, gl.drawingBufferWidth, gl.drawingBufferHeight);
    lineVerts.push(P[0],P[1], Q[0],Q[1]);
    lineCols.push(0.95,0.89,0.76, 0.95,0.89,0.76);
  }
  lineBuf = makeBuffer(new Float32Array(lineVerts));
  lineColBuf = makeBuffer(new Float32Array(lineCols));
  lineCount = lineVerts.length/2;

  const ptVerts=[], ptCols=[];
  for (const p of people) {
    const P=toNDC(p.x, p.y, gl.drawingBufferWidth, gl.drawingBufferHeight);
    ptVerts.push(P[0],P[1]);
    ptCols.push(0.05,0.05,0.05);
  }
  pointBuf = makeBuffer(new Float32Array(ptVerts));
  pointColBuf = makeBuffer(new Float32Array(ptCols));
  pointCount = people.length;
}

function makeBuffer(arr){
  const b=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,b);
  gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW); return b;
}

function draw() {
  gl.clearColor(0.04,0.06,0.10,1); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(prog);
  gl.enableVertexAttribArray(aPos); gl.enableVertexAttribArray(aCol);

  gl.bindBuffer(gl.ARRAY_BUFFER, triBuf);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, triColBuf);
  gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, triCount);

  gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, lineColBuf);
  gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.LINES, 0, lineCount);

  gl.bindBuffer(gl.ARRAY_BUFFER, pointBuf);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, pointColBuf);
  gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.POINTS, 0, pointCount);
}
