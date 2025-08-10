import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function CytoplasmParticles({ count = 500 }) {
  const ref = useRef()

  const positions = useMemo(() => {
    const array = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = Math.random() * 0.8
      const theta = Math.random() * 2 * Math.PI
      const phi = Math.acos(2 * Math.random() - 1)

      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)

      array.set([x, y, z], i * 3)
    }
    return array
  }, [count])

  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.3
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.002}
        color="#00ffff" // ← make this animated like above if desired
        transparent
        opacity={0.5}
        depthWrite={false}
      />
    </points>
  )
}
