// Membrane.jsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Membrane({ isAIResponding = false }) {
  const meshRef = useRef()
  const basePositions = useRef([])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (!meshRef.current) return

    // Enhanced rotation during AI response
    const rotationSpeed = isAIResponding ? 0.2 : 0.1
    meshRef.current.rotation.y = t * rotationSpeed
    
    // More pronounced scaling during AI response
    const scaleIntensity = isAIResponding ? 0.04 : 0.02
    const scaleSpeed = isAIResponding ? 2.5 : 1.5
    const scale = 1 + Math.sin(t * scaleSpeed) * scaleIntensity
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
      
      // Enhanced vertex animation during AI response
      const waveSpeed = isAIResponding ? 3 : 2
      const waveIntensity = isAIResponding ? 0.03 : 0.02
      const offset = Math.sin(t * waveSpeed + x * 3 + y * 3 + z * 3) * waveIntensity
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