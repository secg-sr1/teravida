import { useRef } from 'react'
import { extend, useFrame } from '@react-three/fiber'
import { BlobMaterial } from './BlobShaderMaterial'
import * as THREE from 'three'

extend({ BlobMaterial })

export default function BlobbyShaderSphere() {
  const meshRef = useRef()
  const materialRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (materialRef.current) {
      materialRef.current.uTime = t

      // 🌈 animate hue (HSL)
      const color = new THREE.Color().setHSL(Math.sin(t * 0.2) * 0.2 + 0.6, 1, 0.5)
      materialRef.current.uColor = new THREE.Color().setHSL(0.55, 1.0, 0.85)

      // materialRef.current.uColor = color
    }

    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.05
      meshRef.current.renderOrder = -1 // transparent mesh first
    }
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 10]} />
      <blobMaterial
        ref={materialRef}
        toneMapped={false}
        side={THREE.DoubleSide}
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}
