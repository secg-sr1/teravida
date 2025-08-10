// GlowRing.jsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function GlowRing() {
  const ref = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref.current) {
      ref.current.material.opacity = 0.15 + Math.sin(t * 2) * 0.05
      ref.current.rotation.z = t * 0.1
    }
  })

  return (
    <mesh ref={ref}>
      <ringGeometry args={[1.55, 1.7, 64]} />
      <meshBasicMaterial
        color="#88ccff"
        side={2}
        transparent
        opacity={0.2}
      />
    </mesh>
  )
}
