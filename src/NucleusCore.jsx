import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three' // ✅ Add this!

export default function NucleusCore() {
  const ref = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // Rotate
    ref.current.rotation.y = t * 0.2

    // Dynamic HSL color sync
    const color = new THREE.Color().setHSL(Math.sin(t * 0.2) * 0.2 + 0.6, 1, 0.6)
    ref.current.material.color = color
    ref.current.material.emissive = color
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.3, 50, 50]} />
      <meshStandardMaterial
        emissive="#ff00ff"
        emissiveIntensity={3}
        toneMapped={false}
        transparent
        opacity={0.6}
      />
    </mesh>
  )
}
