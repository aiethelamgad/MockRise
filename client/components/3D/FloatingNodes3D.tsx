import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FloatingNodes3DProps {
  primaryColor?: string;
  secondaryColor?: string;
  count?: number;
  scale?: number;
  reducedMotion?: boolean;
}

export function FloatingNodes3D({
  primaryColor = "#8b5cf6",
  secondaryColor = "#3b82f6",
  count = 12,
  scale = 1.0,
  reducedMotion = false,
}: FloatingNodes3DProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colors = useMemo(() => {
    const colA = new THREE.Color(primaryColor);
    const colB = new THREE.Color(secondaryColor);
    return Array.from({ length: count }).map((_, i) => colA.clone().lerp(colB, (i / Math.max(1, count - 1))));
  }, [primaryColor, secondaryColor, count]);

  const initial = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 10 * scale,
        (Math.random() - 0.5) * 4 * scale,
        (Math.random() - 0.5) * 8 * scale
      ),
      scale: (Math.random() * 0.6 + 0.6) * (0.7 + Math.random() * 0.6) * (scale * 0.9),
      speed: 0.08 + Math.random() * 0.06,
      phase: Math.random() * Math.PI * 2,
      rotOffset: Math.random() * 0.6 - 0.3,
    }));
  }, [count, scale]);

  // initialize instance transforms
  useMemo(() => {
    if (!meshRef.current) return;
    initial.forEach((it, i) => {
      dummy.position.copy(it.pos);
      dummy.scale.setScalar(it.scale);
      dummy.rotation.set(it.phase * 0.1, it.rotOffset, it.phase * 0.05);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      const color = colors[i];
      meshRef.current!.setColorAt?.(i, color);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.geometry.attributes.instanceColor) {
      meshRef.current.geometry.attributes.instanceColor.needsUpdate = true;
    }
    // eslint-disable-next-line
  }, []); // run once

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    initial.forEach((it, i) => {
      const bob = (reducedMotion ? 0 : Math.sin(t * it.speed + it.phase) * 0.25);
      const rot = (reducedMotion ? 0 : Math.cos(t * it.speed * 0.5 + it.phase) * 0.06);
      dummy.position.set(it.pos.x, it.pos.y + bob, it.pos.z);
      dummy.scale.setScalar(it.scale * (1 + (reducedMotion ? 0 : 0.02 * Math.sin(t * it.speed + it.phase))));
      dummy.rotation.set(rot * 0.9, it.rotOffset + rot * 0.6, rot * 0.4);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <ambientLight intensity={0.45} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color={primaryColor} />
      <pointLight position={[-5, -3, -5]} intensity={0.25} color={secondaryColor} />
      <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, count]}>
        <sphereGeometry args={[0.6, 12, 10]} />
        <meshStandardMaterial
          toneMapped={true}
          roughness={0.7}
          metalness={0.15}
          transparent={true}
          opacity={0.22}
          emissive={new THREE.Color(primaryColor).multiplyScalar(0.06)}
          envMapIntensity={0.3}
        />
      </instancedMesh>
    </group>
  );
}