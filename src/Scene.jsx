import { Canvas } from '@react-three/fiber'
import ParticleField from './ParticleField'

export default function Scene({ morphTarget, scrollProgress }) {
  return (
    <div className="webgl-canvas" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 0,
      pointerEvents: 'none',
    }}>
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ pointerEvents: 'auto' }}
      >
        <ParticleField
          morphTarget={morphTarget}
          scrollProgress={scrollProgress}
        />
      </Canvas>
    </div>
  )
}
