window.VERT_SRC = `
attribute vec3 aPosition;
attribute vec3 aNormal;

uniform mat4 uModel, uView, uProj;
uniform mat3 uNormalMatrix;

varying vec3 vNormal, vWorldPos;

void main() {
  vec4 wp = uModel * vec4(aPosition, 1.0);
  vWorldPos = wp.xyz;
  vNormal = normalize(uNormalMatrix * aNormal);
  gl_Position = uProj * uView * wp;
}
`;

window.FRAG_SRC = `
precision mediump float;

varying vec3 vNormal, vWorldPos;

uniform vec3 uLightPos, uViewPos, uColor, uIdColor;
uniform float uShininess, uEmissive;
uniform bool  uPicking, uHighlight;

void main() {
  if (uPicking) { gl_FragColor = vec4(uIdColor, 1.0); return; }

  vec3 N = normalize(vNormal);
  vec3 L = normalize(uLightPos - vWorldPos);
  vec3 V = normalize(uViewPos - vWorldPos);
  vec3 H = normalize(L + V);

  float diff = max(dot(N,L), 0.0);
  float spec = pow(max(dot(N,H), 0.0), uShininess);

  float dist = length(uLightPos - vWorldPos);
  float atten = 1.0 / (1.0 + 0.02*dist + 0.0005*dist*dist);

  vec3 rgb = 0.06*uColor + atten*(diff*uColor + 0.6*spec*vec3(1.0)) + uEmissive*uColor;

  if (uHighlight) {
    float rim = pow(1.0 - max(dot(N,V), 0.0), 3.0);
    rgb += rim * vec3(1.0,0.95,0.5);
  }
  gl_FragColor = vec4(clamp(rgb,0.0,1.0), 1.0);
}
`;
