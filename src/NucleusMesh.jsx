// NucleusMesh.jsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function NucleusMesh() {
  const meshRef = useRef()
  const basePositions = useRef([])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    meshRef.current.rotation.y = t * 0.15
    const scale = 1 + Math.sin(t * 2) * 0.03
    meshRef.current.scale.set(scale, scale, scale)

    const geom = meshRef.current.geometry
    const pos = geom.attributes.position

    if (!basePositions.current.length) {
      basePositions.current = pos.array.slice()
    }

    for (let i = 0; i < pos.count; i++) {
      const i3 = i * 3
      const x = basePositions.current[i3]
      const y = basePositions.current[i3 + 1]
      const z = basePositions.current[i3 + 2]
      const offset = Math.sin(t * 3 + x * 5 + y * 5 + z * 5) * 0.03
      pos.setXYZ(i, x + x * offset, y + y * offset, z + z * offset)
    }
    pos.needsUpdate = true
  })

  return (
    <mesh ref={meshRef} renderOrder={1}>
      <icosahedronGeometry args={[0.6, 16]} />
      <meshStandardMaterial
        color="#886e96"
        emissive="#886e96"
        roughness={0.35}
        metalness={0.15}
        transparent
        opacity={0.5}
        depthWrite={false}
        emissiveIntensity={0.4}
      />
    </mesh>
  )
}
