// Cytoplasm.jsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Cytoplasm() {
  const ref = useRef()
  const count = 800

  const positions = useMemo(() => {
    const pos = []
    for (let i = 0; i < count; i++) {
      const r = 1.3 + Math.random() * 0.3
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
    if (ref.current) ref.current.rotation.y = t * 0.04
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
        size={0.035}
        color="#a4d8ff"
        transparent
        opacity={0.35}
        depthWrite={false}
      />
    </points>
  )
}