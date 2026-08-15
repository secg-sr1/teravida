// NucleusMesh.jsx
import { useRef, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'

// Wave deformation runs on the GPU via onBeforeCompile instead of
// mutating ~2900 vertices on the CPU every frame.
export default function NucleusMesh({ isAIResponding = false, reducedMotion = false }) {
  const meshRef = useRef()

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uWaveSpeed: { value: 3 },
    uWaveIntensity: { value: 0.03 },
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
        float waveOffset = sin(uTime * uWaveSpeed + (position.x + position.y + position.z) * 5.0) * uWaveIntensity;
        transformed += position * waveOffset;`
      )
  }, [uniforms])

  useFrame((_, delta) => {
    if (!meshRef.current) return
    uniforms.uTime.value += delta

    const lerp = Math.min(1, delta * 2)
    const targetSpeed = isAIResponding ? 4 : 3
    const targetIntensity = reducedMotion ? 0.006 : (isAIResponding ? 0.04 : 0.03)
    uniforms.uWaveSpeed.value += (targetSpeed - uniforms.uWaveSpeed.value) * lerp
    uniforms.uWaveIntensity.value += (targetIntensity - uniforms.uWaveIntensity.value) * lerp

    if (reducedMotion) return

    const t = uniforms.uTime.value
    meshRef.current.rotation.y += delta * (isAIResponding ? 0.25 : 0.15)
    const scale = 1 + Math.sin(t * 2) * 0.03
    meshRef.current.scale.set(scale, scale, scale)
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
        onBeforeCompile={onBeforeCompile}
      />
    </mesh>
  )
}
