// InteractiveCell.jsx
import { useState, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

const COMPONENT_INFO = {
  membrane: {
    name: { es: 'Membrana Celular', en: 'Cell Membrane' },
    description: {
      es: 'Capa externa que protege la célula y controla el intercambio de sustancias.',
      en: 'Outer layer that protects the cell and controls the exchange of substances.'
    }
  },
  nucleus: {
    name: { es: 'Núcleo', en: 'Nucleus' },
    description: {
      es: 'Centro de control de la célula que contiene el material genético.',
      en: 'Control center of the cell that contains the genetic material.'
    }
  }
};

export default function InteractiveCell({ isAIResponding = false, language = 'es', reducedMotion = false }) {
  const [hoveredComponent, setHoveredComponent] = useState(null);
  const [clickedComponent, setClickedComponent] = useState(null);
  const membraneRef = useRef();
  const nucleusRef = useRef();
  const cytoplasmRef = useRef();

  const lang = COMPONENT_INFO.membrane.name[language] ? language : 'es';

  const cytoplasmPositions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < 800; i++) {
      const r = 1.3 + Math.random() * 0.3;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      pos.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
    }
    return new Float32Array(pos);
  }, []);

  useFrame(({ clock }) => {
    if (reducedMotion) return;

    const t = clock.getElapsedTime();
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

  // Clicking a component opens its card; clicking it again closes it.
  // The card stays open until dismissed (no auto-close timer).
  const handleComponentClick = (componentName) => {
    setClickedComponent(prev => (prev === componentName ? null : componentName));
  };

  const handlePointerOver = (componentName) => {
    setHoveredComponent(componentName);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHoveredComponent(null);
    document.body.style.cursor = '';
  };

  return (
    <group>
      {/* Membrane */}
      <mesh
        ref={membraneRef}
        onClick={(e) => { e.stopPropagation(); handleComponentClick('membrane'); }}
        onPointerOver={(e) => { e.stopPropagation(); handlePointerOver('membrane'); }}
        onPointerOut={handlePointerOut}
        renderOrder={2}
      >
        <icosahedronGeometry args={[1.5, 12]} />
        <meshStandardMaterial
          transparent
          opacity={hoveredComponent === 'membrane' ? 0.3 : 0.15}
          roughness={0.1}
          metalness={0.05}
          depthWrite={false}
          emissive="#f6b0ff"
          emissiveIntensity={hoveredComponent === 'membrane' ? 0.3 : 0.1}
        />
      </mesh>

      {/* Nucleus */}
      <mesh
        ref={nucleusRef}
        onClick={(e) => { e.stopPropagation(); handleComponentClick('nucleus'); }}
        onPointerOver={(e) => { e.stopPropagation(); handlePointerOver('nucleus'); }}
        onPointerOut={handlePointerOut}
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
            array={cytoplasmPositions}
            count={cytoplasmPositions.length / 3}
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
            whiteSpace: 'nowrap',
            pointerEvents: 'none'
          }}>
            {COMPONENT_INFO[hoveredComponent].name[lang]}
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
            paddingRight: '36px',
            borderRadius: '8px',
            fontSize: '12px',
            fontFamily: 'Manrope',
            maxWidth: '300px',
            textAlign: 'center',
            position: 'relative',
            pointerEvents: 'auto'
          }}>
            <button
              onClick={() => setClickedComponent(null)}
              aria-label={lang === 'es' ? 'Cerrar' : 'Close'}
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 22,
                height: 22,
                border: 'none',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'white',
                fontSize: '12px',
                lineHeight: 1,
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
              {COMPONENT_INFO[clickedComponent].name[lang]}
            </h3>
            <p style={{ margin: 0, lineHeight: 1.4 }}>
              {COMPONENT_INFO[clickedComponent].description[lang]}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}
