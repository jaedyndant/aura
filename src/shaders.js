export const vertexShader = `
  attribute vec3 aPositionStart;
  attribute vec3 aPositionEnd;
  attribute float aOffset;
  attribute float aSize;
  
  uniform float uProgress;
  uniform float uTime;
  uniform float uPointSize;
  uniform vec2 uMouse;
  
  varying float vAlpha;
  varying float vProgress;
  varying float vDistFromCenter;
  
  // Easing function — computed on GPU, not JS
  float easeInOutCubic(float t) {
    return t < 0.5
      ? 4.0 * t * t * t
      : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }
  
  void main() {
    // Per-particle staggered progress using aOffset
    // This creates the cascade effect — particles don't all move at once
    float staggerRange = 0.3;
    float staggeredProgress = clamp(
      (uProgress - aOffset * staggerRange) / (1.0 - staggerRange),
      0.0, 1.0
    );
    
    float easedProgress = easeInOutCubic(staggeredProgress);
    
    // GPU-side position interpolation — the core technique
    vec3 pos = mix(aPositionStart, aPositionEnd, easedProgress);
    
    // Subtle turbulence during transition (only when moving)
    float movementIntensity = sin(easedProgress * 3.14159);
    pos.x += sin(uTime * 2.0 + aOffset * 6.28) * movementIntensity * 0.15;
    pos.y += cos(uTime * 1.7 + aOffset * 4.0) * movementIntensity * 0.12;
    pos.z += sin(uTime * 2.3 + aOffset * 5.0) * movementIntensity * 0.1;
    
    // Subtle idle breathing
    pos += sin(uTime * 0.5 + aOffset * 3.0) * 0.02;
    
    // Mouse repulsion (screen-space approximate)
    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    vec2 screenPos = mvPos.xy / -mvPos.z;
    vec2 mouseDir = screenPos - uMouse * 0.5;
    float mouseDist = length(mouseDir);
    if (mouseDist < 0.8) {
      float repel = (0.8 - mouseDist) * 0.6;
      pos.xy += normalize(mouseDir) * repel;
    }
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    
    // Size attenuation — particles shrink with distance
    float depth = -mvPos.z;
    gl_PointSize = aSize * uPointSize * (200.0 / depth);
    gl_PointSize = clamp(gl_PointSize, 1.0, 12.0);
    
    // Varying outputs for fragment shader
    vAlpha = 0.4 + movementIntensity * 0.4;
    vProgress = easedProgress;
    vDistFromCenter = length(pos) / 12.0;
  }
`

export const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  
  varying float vAlpha;
  varying float vProgress;
  varying float vDistFromCenter;
  
  void main() {
    // Soft circle point rendering
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    
    float alpha = smoothstep(0.5, 0.15, dist) * vAlpha;
    
    // Color blend based on morph progress + distance
    vec3 color = mix(uColorA, uColorB, vProgress * 0.6 + vDistFromCenter * 0.4);
    
    // Subtle glow pulse
    float pulse = sin(uTime * 1.5 + vDistFromCenter * 4.0) * 0.1 + 0.9;
    
    gl_FragColor = vec4(color * pulse, alpha * 0.7);
  }
`
