(function(){
  const S = window.State = {
    gl: null, program: null,
    A: {}, U: {},
    M: { model: mat4.create(), view: mat4.create(), proj: mat4.create(), normalM: mat3.create() },
  };

  function compile(gl, type, src){
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src); gl.compileShader(sh);
    if(!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
    return sh;
  }

  function createProgram(gl, vsSrc, fsSrc){
    const vs = compile(gl, gl.VERTEX_SHADER, vsSrc);
    const fs = compile(gl, gl.FRAGMENT_SHADER, fsSrc);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if(!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    return prog;
  }

  function makeGeom(gl, positions, normals, indices){
    const inter = new Float32Array(positions.length + normals.length);
    for(let i=0,j=0;i<positions.length/3;i++){
      inter[j++] = positions[3*i]; inter[j++] = positions[3*i+1]; inter[j++] = positions[3*i+2];
      inter[j++] = normals[3*i];   inter[j++] = normals[3*i+1];   inter[j++] = normals[3*i+2];
    }
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, inter, gl.STATIC_DRAW);

    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return { vbo, ibo, count: indices.length, stride: 6*4 };
  }

  function drawGeom(gl, g){
    gl.bindBuffer(gl.ARRAY_BUFFER, g.vbo);
    gl.enableVertexAttribArray(S.A.aPosition);
    gl.vertexAttribPointer(S.A.aPosition, 3, gl.FLOAT, false, g.stride, 0);
    gl.enableVertexAttribArray(S.A.aNormal);
    gl.vertexAttribPointer(S.A.aNormal, 3, gl.FLOAT, false, g.stride, 3*4);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, g.ibo);
    gl.drawElements(gl.TRIANGLES, g.count, gl.UNSIGNED_SHORT, 0);
  }

  function setModel(gl, M){
    gl.uniformMatrix4fv(S.U.uModel,false,M);
    mat3.normalFromMat4(S.M.normalM, M);
    gl.uniformMatrix3fv(S.U.uNormalMatrix,false,S.M.normalM);
  }

  function initGL(){
    const canvas = document.getElementById('glCanvas');
    const gl = canvas.getContext('webgl', {antialias:true});
    if(!gl){ alert('WebGL not supported'); return null; }
    S.gl = gl;
    S.program = createProgram(gl, window.VERT_SRC, window.FRAG_SRC);

    S.A.aPosition = gl.getAttribLocation(S.program, 'aPosition');
    S.A.aNormal   = gl.getAttribLocation(S.program, 'aNormal');

    S.U.uModel        = gl.getUniformLocation(S.program, 'uModel');
    S.U.uView         = gl.getUniformLocation(S.program, 'uView');
    S.U.uProj         = gl.getUniformLocation(S.program, 'uProj');
    S.U.uNormalMatrix = gl.getUniformLocation(S.program, 'uNormalMatrix');
    S.U.uLightPos     = gl.getUniformLocation(S.program, 'uLightPos');
    S.U.uViewPos      = gl.getUniformLocation(S.program, 'uViewPos');
    S.U.uColor        = gl.getUniformLocation(S.program, 'uColor');
    S.U.uShininess    = gl.getUniformLocation(S.program, 'uShininess');
    S.U.uEmissive     = gl.getUniformLocation(S.program, 'uEmissive');
    S.U.uPicking      = gl.getUniformLocation(S.program, 'uPicking');
    S.U.uIdColor      = gl.getUniformLocation(S.program, 'uIdColor');
    S.U.uHighlight    = gl.getUniformLocation(S.program, 'uHighlight');

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.08,0.09,0.11,1);
    return gl;
  }

  window.GLUtils = { initGL, makeGeom, drawGeom, setModel };
})();
