// InteractiveCell.jsx
import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';

export default function InteractiveCell({ isAIResponding = false }) {
  const [hoveredComponent, setHoveredComponent] = useState(null);
  const [clickedComponent, setClickedComponent] = useState(null);
  const membraneRef = useRef();
  const nucleusRef = useRef();
  const cytoplasmRef = useRef();

  const components = {
    membrane: {
      name: 'Membrana Celular',
      description: 'Capa externa que protege la célula y controla el intercambio de sustancias.',
      color: '#f6b0ffff',
      position: [0, 0, 0],
      scale: 1.5
    },
    nucleus: {
      name: 'Núcleo',
      description: 'Centro de control de la célula que contiene el material genético.',
      color: '#3a1aff',
      position: [0, 0, 0],
      scale: 0.6
    }
  };

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    // Enhanced animations during AI response
    const rotationSpeed = isAIResponding ? 0.2 : 0.1;
    const scaleIntensity = isAIResponding ? 0.04 : 0.02;
    
    if (membraneRef.current) {
      membraneRef.current.rotation.y = t * rotationSpeed;
      const scale = 1 + Math.sin(t * 1.5) * scaleIntensity;
      membraneRef.current.scale.set(scale, scale, scale);
    }
    
    if (nucleusRef.current) {
      nucleusRef.current.rotation.y = t * (rotationSpeed * 1.5);
      const scale = 1 + Math.sin(t * 2) * (scaleIntensity * 1.5);
      nucleusRef.current.scale.set(scale, scale, scale);
    }
    
    if (cytoplasmRef.current) {
      cytoplasmRef.current.rotation.y = t * (rotationSpeed * 0.5);
    }
  });

  const handleComponentClick = (componentName) => {
    setClickedComponent(componentName);
    // Auto-close after 3 seconds
    setTimeout(() => setClickedComponent(null), 3000);
  };

  return (
    <group>
      {/* Membrane */}
      <mesh
        ref={membraneRef}
        onClick={() => handleComponentClick('membrane')}
        onPointerOver={() => setHoveredComponent('membrane')}
        onPointerOut={() => setHoveredComponent(null)}
        renderOrder={2}
      >
        <icosahedronGeometry args={[1.5, 12]} />
        <meshStandardMaterial
          transparent
          opacity={hoveredComponent === 'membrane' ? 0.3 : 0.15}
          roughness={0.1}
          metalness={0.05}
          depthWrite={false}
          emissive="#f6b0ffff"
          emissiveIntensity={hoveredComponent === 'membrane' ? 0.3 : 0.1}
        />
      </mesh>

      {/* Nucleus */}
      <mesh
        ref={nucleusRef}
        onClick={() => handleComponentClick('nucleus')}
        onPointerOver={() => setHoveredComponent('nucleus')}
        onPointerOut={() => setHoveredComponent(null)}
        renderOrder={1}
      >
        <icosahedronGeometry args={[0.6, 16]} />
        <meshStandardMaterial
          color="#886e96"
          emissive="#886e96"
          roughness={0.35}
          metalness={0.15}
          transparent
          opacity={hoveredComponent === 'nucleus' ? 0.8 : 0.5}
          depthWrite={false}
          emissiveIntensity={hoveredComponent === 'nucleus' ? 0.6 : 0.4}
        />
      </mesh>

      {/* Cytoplasm Particles - Non-interactive background */}
      <points ref={cytoplasmRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array(Array.from({ length: 800 }, () => {
              const r = 1.3 + Math.random() * 0.3;
              const theta = Math.random() * 2 * Math.PI;
              const phi = Math.acos(2 * Math.random() - 1);
              return [
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta),
                r * Math.cos(phi)
              ];
            }).flat())}
            count={800}
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

      {/* Component Labels */}
      {hoveredComponent && (
        <Html position={[0, 2, 0]} center>
          <div style={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'Manrope',
            fontWeight: 600,
            textAlign: 'center',
            pointerEvents: 'none'
          }}>
            {components[hoveredComponent].name}
          </div>
        </Html>
      )}

      {/* Component Information */}
      {clickedComponent && (
        <Html position={[0, -2, 0]} center>
          <div style={{
            backgroundColor: 'rgba(0,0,0,0.9)',
            color: 'white',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '12px',
            fontFamily: 'Manrope',
            maxWidth: '300px',
            textAlign: 'center',
            pointerEvents: 'none'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
              {components[clickedComponent].name}
            </h3>
            <p style={{ margin: 0, lineHeight: 1.4 }}>
              {components[clickedComponent].description}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}

