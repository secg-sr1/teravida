precision mediump float;

uniform float uTime;
varying vec3 vNormal;
varying vec3 vPos;

void main() {
  vec3 pos = position;

  // Organic blob distortion
  float d = sin(pos.x * 3.0 + uTime * 1.5) * 0.07;
  d += cos(pos.y * 4.5 + uTime * 1.2) * 0.05;
  d += sin(pos.z * 2.5 + uTime * 0.8) * 0.06;

  pos += normal * d;

  vNormal = normal;
  vPos = pos;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
