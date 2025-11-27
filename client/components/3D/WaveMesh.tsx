import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WaveMeshProps {
  color?: string;
  intensity?: number;
  speed?: number;
  amplitude?: number;
}

export function WaveMesh({ 
  color = '#3b82f6', 
  intensity = 0.12, 
  speed = 0.4, 
  amplitude = 0.8 
}: WaveMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const { positions, colors } = useMemo(() => {
    const segments = 40;
    const positions = new Float32Array(segments * segments * 3);
    const colors = new Float32Array(segments * segments * 3);
    
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < segments; j++) {
        const index = (i * segments + j) * 3;
        const x = (i / segments - 0.5) * 20;
        const z = (j / segments - 0.5) * 20;
        const y = Math.sin(i * 0.18) * Math.cos(j * 0.18) * amplitude * 0.9;
        
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
  }, [color, intensity, amplitude]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (meshRef.current) {
      const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
      const segments = 40;
      
      for (let i = 0; i < segments; i++) {
        for (let j = 0; j < segments; j++) {
          const index = (i * segments + j) * 3;
          const targetY = Math.sin(i * 0.18 + time * speed) * Math.cos(j * 0.18 + time * speed) * amplitude * 0.9;
          // smooth updates for subtle animation
          positions[index + 1] = THREE.MathUtils.lerp(positions[index + 1], targetY, 0.06);
        }
      }
      
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <mesh ref={meshRef}>
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
      <meshBasicMaterial vertexColors transparent opacity={0.25} />
    </mesh>
  );
}
