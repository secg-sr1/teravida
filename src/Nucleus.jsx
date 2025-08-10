// Nucleus.jsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Nucleus() {
  const ref = useRef()
  const count = 1200

  const positions = useMemo(() => {
    const pos = []
    for (let i = 0; i < count; i++) {
      const r = 0.6 + Math.random() * 0.2
      const theta = Math.random() * 2 * Math.PI
      const phi = Math.acos(2 * Math.random() - 1)
      pos.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      )
    }
    return new Float32Array(pos)
  }, [count])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    ref.current.rotation.y = t * 0.15
    const scale = 1 + Math.sin(t * 2) * 0.03
    ref.current.scale.set(scale, scale, scale)
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
        size={0.07}
        color="#3a1aff"
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </points>
  )
} 