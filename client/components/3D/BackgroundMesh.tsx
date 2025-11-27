import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BackgroundMeshProps {
  intensity?: number;
  color?: string;
  speed?: number;
  size?: number;
}

export function BackgroundMesh({ 
  intensity = 0.25, 
  color = '#3b82f6', 
  speed = 0.35, 
  size = 10 
}: BackgroundMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // Create a subtle mesh pattern (reduced count for performance + subtlety)
  const { positions, colors } = useMemo(() => {
    const count = 80;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * size;
      const y = (Math.random() - 0.5) * size;
      const z = (Math.random() - 0.5) * size;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      const col = new THREE.Color(color);
      colors[i * 3] = col.r * intensity;
      colors[i * 3 + 1] = col.g * intensity;
      colors[i * 3 + 2] = col.b * intensity;
    }
    
    return { positions, colors };
  }, [size, color, intensity]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Smooth rotation targets for very subtle motion
    if (meshRef.current) {
      const targetX = Math.sin(time * speed * 0.05) * 0.02;
      const targetY = Math.cos(time * speed * 0.04) * 0.03;
      const targetZ = Math.sin(time * speed * 0.03) * 0.01;

      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetX, 0.04);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetY, 0.04);
      meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetZ, 0.04);
    }
    
    if (pointsRef.current) {
      const targetX = Math.sin(time * speed * 0.02) * 0.01;
      const targetY = Math.cos(time * speed * 0.015) * 0.015;

      pointsRef.current.rotation.x = THREE.MathUtils.lerp(pointsRef.current.rotation.x, targetX, 0.03);
      pointsRef.current.rotation.y = THREE.MathUtils.lerp(pointsRef.current.rotation.y, targetY, 0.03);
    }
  });

  return (
    <group>
      <points ref={pointsRef}>
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
        <pointsMaterial size={0.08} vertexColors transparent opacity={0.45} />
      </points>
    </group>
  );
}
