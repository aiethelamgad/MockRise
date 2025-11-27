import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface InteractiveMeshProps {
  color?: string;
  intensity?: number;
  speed?: number;
  hoverIntensity?: number;
}

export function InteractiveMesh({ 
  color = '#3b82f6', 
  intensity = 0.18, 
  speed = 0.6, 
  hoverIntensity = 0.45 
}: InteractiveMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // smooth mouse and hover targets
  const smoothMouse = useRef({ x: 0, y: 0 });
  const smoothHover = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const { positions, colors } = useMemo(() => {
    const segments = 30;
    const positions = new Float32Array(segments * segments * 3);
    const colors = new Float32Array(segments * segments * 3);
    
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < segments; j++) {
        const index = (i * segments + j) * 3;
        const x = (i / segments - 0.5) * 15;
        const z = (j / segments - 0.5) * 15;
        const y = Math.sin(i * 0.3) * Math.cos(j * 0.3) * 1.2; // reduced base
         
        positions[index] = x;
        positions[index + 1] = y;
        positions[index + 2] = z;
        
        const threeColor = new THREE.Color(color);
        colors[index] = threeColor.r * intensity;
        colors[index + 1] = threeColor.g * intensity;
        colors[index + 2] = threeColor.b * intensity;
      }
    }
    
    return { positions, colors };
  }, [color, intensity]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // smooth mouse
    smoothMouse.current.x = THREE.MathUtils.lerp(smoothMouse.current.x, mousePosition.x, 0.08);
    smoothMouse.current.y = THREE.MathUtils.lerp(smoothMouse.current.y, mousePosition.y, 0.08);
    smoothHover.current = THREE.MathUtils.lerp(smoothHover.current, hovered ? 1 : 0, 0.08);

    if (meshRef.current) {
      const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
      const segments = 30;
      const currentIntensity = THREE.MathUtils.lerp(intensity, hoverIntensity, smoothHover.current);

      for (let i = 0; i < segments; i++) {
        for (let j = 0; j < segments; j++) {
          const index = (i * segments + j) * 3;
          const x = (i / segments - 0.5) * 15;
          const z = (j / segments - 0.5) * 15;

          const targetY = Math.sin(i * 0.3 + time * speed + smoothMouse.current.x * 1.2) *
                          Math.cos(j * 0.3 + time * speed + smoothMouse.current.y * 1.2) * 1.2 * currentIntensity;

          // lerp current -> target to smooth motion
          const currentY = positions[index + 1];
          positions[index + 1] = THREE.MathUtils.lerp(currentY, targetY, 0.07);
        }
      }
      
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <mesh 
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <meshBasicMaterial vertexColors transparent opacity={0.35} />
    </mesh>
  );
}
