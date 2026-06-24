import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { vertexShader, fragmentShader } from './shaders'
import {
  generateSphere,
  generateExplosion,
  generateText,
  generateGrid,
  generateHelix,
  generateScatter,
} from './shapes'

const PARTICLE_COUNT = 3000

export default function ParticleField({ morphTarget = 0, scrollProgress = 0 }) {
  const pointsRef = useRef()
  const materialRef = useRef()
  const mouseRef = useRef(new THREE.Vector2(0, 0))

  // Generate all shape targets once
  const shapes = useMemo(() => [
    generateSphere(PARTICLE_COUNT, 4),      // 0: initial sphere
    generateExplosion(PARTICLE_COUNT, 12),   // 1: explosion  
    generateText(PARTICLE_COUNT, 'AURA'),    // 2: text morph
    generateHelix(PARTICLE_COUNT, 3, 8),     // 3: helix
    generateGrid(PARTICLE_COUNT),            // 4: grid wave
    generateScatter(PARTICLE_COUNT, 15),     // 5: scatter
  ], [])

  // Buffer attributes — stored on GPU
  const { startPositions, endPositions, offsets, sizes } = useMemo(() => {
    const startPositions = new Float32Array(PARTICLE_COUNT * 3)
    const endPositions = new Float32Array(PARTICLE_COUNT * 3)
    const offsets = new Float32Array(PARTICLE_COUNT)
    const sizes = new Float32Array(PARTICLE_COUNT)
    
    // Initialize: start and end both at sphere
    startPositions.set(shapes[0])
    endPositions.set(shapes[0])
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      offsets[i] = Math.random() // Random offset for stagger
      sizes[i] = 0.3 + Math.random() * 1.2 // Varied sizes
    }
    
    return { startPositions, endPositions, offsets, sizes }
  }, [shapes])

  // Track current morph state
  const morphState = useRef({ 
    current: 0, 
    progress: 0,
    transitioning: false 
  })

  // When morphTarget changes, swap start/end positions
  useEffect(() => {
    if (morphTarget === morphState.current.current) return
    
    const geo = pointsRef.current?.geometry
    if (!geo) return
    
    // Current end → new start (seamless chain)
    const startAttr = geo.getAttribute('aPositionStart')
    const endAttr = geo.getAttribute('aPositionEnd')
    
    // Copy current end positions to start
    startAttr.array.set(endAttr.array)
    startAttr.needsUpdate = true
    
    // Set new end positions from target shape
    const targetShape = shapes[morphTarget % shapes.length]
    endAttr.array.set(targetShape)
    endAttr.needsUpdate = true
    
    // Reset progress for new morph
    morphState.current = {
      current: morphTarget,
      progress: 0,
      transitioning: true,
    }
  }, [morphTarget, shapes])

  // Mouse tracking
  useEffect(() => {
    const handleMouse = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  // Uniforms
  const uniforms = useMemo(() => ({
    uProgress: { value: 0 },
    uTime: { value: 0 },
    uPointSize: { value: 1.0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uColorA: { value: new THREE.Color('#c8ff00') }, // Accent green
    uColorB: { value: new THREE.Color('#f0ece4') }, // Off-white
  }), [])

  // Animation loop — only updating uniforms, not positions
  useFrame((state, delta) => {
    if (!materialRef.current) return
    
    const mat = materialRef.current
    mat.uniforms.uTime.value = state.clock.elapsedTime
    
    // Smooth mouse lerp
    mat.uniforms.uMouse.value.lerp(mouseRef.current, 0.05)
    
    // Drive morph progress (0 → 1 over ~1.2 seconds)
    if (morphState.current.transitioning) {
      morphState.current.progress += delta * 0.85
      if (morphState.current.progress >= 1) {
        morphState.current.progress = 1
        morphState.current.transitioning = false
      }
    }
    
    // The ONLY value we update per frame — the GPU does the rest
    mat.uniforms.uProgress.value = morphState.current.progress
    
    // Subtle camera rotation based on scroll
    const group = pointsRef.current?.parent
    if (group) {
      group.rotation.y = scrollProgress * Math.PI * 0.3
      group.rotation.x = Math.sin(scrollProgress * Math.PI) * 0.1
    }
  })

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={PARTICLE_COUNT}
            array={startPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aPositionStart"
            count={PARTICLE_COUNT}
            array={startPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aPositionEnd"
            count={PARTICLE_COUNT}
            array={endPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aOffset"
            count={PARTICLE_COUNT}
            array={offsets}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-aSize"
            count={PARTICLE_COUNT}
            array={sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}
