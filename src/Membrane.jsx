// Membrane.jsx
import { useRef, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'

// Wave deformation runs on the GPU via onBeforeCompile instead of
// mutating ~1700 vertices on the CPU every frame.
export default function Membrane({ isAIResponding = false, reducedMotion = false }) {
  const meshRef = useRef()

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uWaveSpeed: { value: 2 },
    uWaveIntensity: { value: 0.02 },
  }), [])

  const onBeforeCompile = useCallback((shader) => {
    shader.uniforms.uTime = uniforms.uTime
    shader.uniforms.uWaveSpeed = uniforms.uWaveSpeed
    shader.uniforms.uWaveIntensity = uniforms.uWaveIntensity
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uTime;
        uniform float uWaveSpeed;
        uniform float uWaveIntensity;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float waveOffset = sin(uTime * uWaveSpeed + (position.x + position.y + position.z) * 3.0) * uWaveIntensity;
        transformed += position * waveOffset;`
      )
  }, [uniforms])

  useFrame((_, delta) => {
    if (!meshRef.current) return
    uniforms.uTime.value += delta

    const lerp = Math.min(1, delta * 2)
    const targetSpeed = isAIResponding ? 3 : 2
    const targetIntensity = reducedMotion ? 0.004 : (isAIResponding ? 0.03 : 0.02)
    uniforms.uWaveSpeed.value += (targetSpeed - uniforms.uWaveSpeed.value) * lerp
    uniforms.uWaveIntensity.value += (targetIntensity - uniforms.uWaveIntensity.value) * lerp

    if (reducedMotion) return

    const t = uniforms.uTime.value
    meshRef.current.rotation.y += delta * (isAIResponding ? 0.2 : 0.1)
    const scaleSpeed = isAIResponding ? 2.5 : 1.5
    const scaleIntensity = isAIResponding ? 0.04 : 0.02
    const scale = 1 + Math.sin(t * scaleSpeed) * scaleIntensity
    meshRef.current.scale.set(scale, scale, scale)
  })

  return (
    <mesh ref={meshRef} renderOrder={2}>
      <icosahedronGeometry args={[1.5, 12]} />
      <meshStandardMaterial
        transparent
        opacity={0.15}
        roughness={0.1}
        metalness={0.05}
        depthWrite={false}
        emissive="#f6b0ff"
        emissiveIntensity={0.1}
        onBeforeCompile={onBeforeCompile}
      />
    </mesh>
  )
}
