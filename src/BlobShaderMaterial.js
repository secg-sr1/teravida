import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import vertex from './shaders/blob.vert'
import fragment from './shaders/blob.frag'

export const BlobMaterial = shaderMaterial(
  {
    uTime: 0,
    // uColor: new THREE.Color(2, 2, 2), // Over-bright for bloom
    // uColor: new THREE.Color('hsl(180, 100%, 70%)'),
    // uColor: new THREE.Color(0.1, 0.5, 1.0), // Soft teal
    uColor: new THREE.Color('#c7f6ff')  // soft blue

  },
  vertex,
  fragment
)
