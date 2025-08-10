precision mediump float;

uniform vec3 uColor;
uniform float uTime;
varying vec3 vNormal;
varying vec3 vPos;

float noise(vec3 p) {
  return fract(sin(dot(p.xyz, vec3(12.9898, 78.233, 51.045))) * 43758.5453);
}

void main() {
  float rim = 1.0 - dot(normalize(vNormal), vec3(0.0, 0.0, 1.0));
  rim = pow(rim, 2.0);
  float glow = noise(vPos * 10.0 + uTime) * 0.5;

  vec3 color = uColor * 0.6 + rim * 0.3 + glow * 0.2;
  float alpha = 0.3;
  gl_FragColor = vec4(color, alpha);

  float rim = 1.0 - dot(normalize(vNormal), vec3(0.0, 0.0, 1.0));
  rim = pow(rim, 2.5);
  vec3 color = mix(uColor, vec3(0.1, 0.3, 1.0), rim * 0.4);



  vec3 color = uColor + vec3(rim * 0.6 + glow);
  float alpha = 0.3; // 🔴 set opacity explicitly here!

  gl_FragColor = vec4(color, alpha);
}
