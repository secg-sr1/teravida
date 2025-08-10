// Membrane.jsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Membrane() {
  const meshRef = useRef()
  const basePositions = useRef([])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (!meshRef.current) return

    meshRef.current.rotation.y = t * 0.1
    const scale = 1 + Math.sin(t * 1.5) * 0.02
    meshRef.current.scale.set(scale, scale, scale)

    const geom = meshRef.current.geometry
    const positions = geom.attributes.position

    if (!basePositions.current.length) {
      basePositions.current = positions.array.slice()
    }

    for (let i = 0; i < positions.count; i++) {
      const i3 = i * 3
      const x = basePositions.current[i3]
      const y = basePositions.current[i3 + 1]
      const z = basePositions.current[i3 + 2]
      const offset = Math.sin(t * 2 + x * 3 + y * 3 + z * 3) * 0.02
      positions.setXYZ(i, x + x * offset, y + y * offset, z + z * offset)
    }
    positions.needsUpdate = true
  })

  return (
    <mesh ref={meshRef} renderOrder={2}>
    <icosahedronGeometry args={[1.5, 12]} />
    {/* <meshPhysicalMaterial
        transmission={1}        // ⬅️ Allow light through
        roughness={0.1}
        thickness={1.0}
        clearcoat={1}
        reflectivity={0.01}
        transparent
        opacity={0.04}          // ⬅️ Slightly higher for subtle volume but see-through
        metalness={0.2}
        ior={1.1}
        depthWrite={false}
        color="#c0e6ff"
        sheen={1.0}
        sheenColor={new THREE.Color('#e6f4ff')}
        /> */}

        <meshStandardMaterial
          transparent
          opacity={0.15}
          roughness={0.1}
          metalness={0.05}
          depthWrite={false}
          emissive="#f6b0ffff"
          emissiveIntensity={0.1}
        />


    </mesh>
  )
}