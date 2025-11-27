import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FloatingShapesProps {
  count?: number;
  color?: string;
  intensity?: number;
  speed?: number;
}

export function FloatingShapes({ 
  count = 12, 
  color = '#8b5cf6', 
  intensity = 0.25, 
  speed = 0.6 
}: FloatingShapesProps) {
  const groupRef = useRef<THREE.Group>(null);

  const shapes = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 16,
      ] as [number, number, number],
      scale: Math.random() * 0.4 + 0.4,
      speed: Math.random() * 0.5 + 0.5,
      color: new THREE.Color(color).multiplyScalar(intensity),
      bobOffset: Math.random() * Math.PI * 2,
    }));
  }, [count, color, intensity]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const shape = shapes[i];
        // slower, smaller bobbing to avoid distraction
        const bob = Math.sin(time * shape.speed * 0.6 + shape.bobOffset) * 1.2;
        child.position.y = shape.position[1] + bob;
        child.rotation.x = THREE.MathUtils.lerp(child.rotation.x, time * shape.speed * 0.04, 0.06);
        child.rotation.y = THREE.MathUtils.lerp(child.rotation.y, time * shape.speed * 0.05, 0.06);
      });
    }
  });

  return (
    <group ref={groupRef}>
      {shapes.map((shape, i) => (
        <mesh key={i} position={shape.position} scale={shape.scale}>
          <sphereGeometry args={[0.4, 8, 6]} />
          <meshBasicMaterial color={shape.color} transparent opacity={0.22} />
        </mesh>
      ))}
    </group>
  );
}
