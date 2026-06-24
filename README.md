# AURA — Creative Technology Studio

A showcase website demonstrating real GPU-driven WebGL particle morphing, GSAP ScrollTrigger choreography, and Lenis smooth scroll.

## Tech Stack

- **React + Vite** — Fast build and HMR
- **Three.js / react-three-fiber** — WebGL particle system
- **Custom GLSL Shaders** — GPU-driven particle morphing (aPositionStart → aPositionEnd via uProgress uniform)
- **GSAP + ScrollTrigger** — Scroll-driven animations with proper easing and stagger
- **Lenis** — Smooth scroll

## Signature Moment

3000 particles morph through 6 distinct geometric shapes as you scroll:
1. **Sphere** — Fibonacci-distributed opening state
2. **Explosion** — Particles scatter outward
3. **Text "AURA"** — Canvas-sampled text positions
4. **Helix** — DNA-like double spiral
5. **Grid Wave** — Undulating surface
6. **Scatter** — Full dispersal

All morphing runs entirely on the GPU via custom vertex shader with per-particle stagger offsets and eased interpolation.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
