import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { BackgroundMesh } from './BackgroundMesh';
import { FloatingShapes } from './FloatingShapes';
import { WaveMesh } from './WaveMesh';
import { InteractiveMesh } from './InteractiveMesh';

interface Section3DProps {
  children: React.ReactNode;
  backgroundType?: 'mesh' | 'shapes' | 'wave' | 'interactive' | 'none';
  intensity?: number;
  color?: string;
  speed?: number;
  className?: string;
}

export function Section3D({ 
  children, 
  backgroundType = 'mesh', 
  intensity = 0.18, 
  color = '#3b82f6', 
  speed = 0.4,
  className = ''
}: Section3DProps) {
  const renderBackground = () => {
    switch (backgroundType) {
      case 'mesh':
        return <BackgroundMesh intensity={intensity} color={color} speed={speed} />;
      case 'shapes':
        return <FloatingShapes intensity={intensity} color={color} speed={speed} />;
      case 'wave':
        return <WaveMesh intensity={intensity} color={color} speed={speed} />;
      case 'interactive':
        return <InteractiveMesh intensity={intensity} color={color} speed={speed} />;
      default:
        return null;
    }
  };

  return (
    <section className={`relative overflow-hidden ${className}`}>
      {/* 3D Background */}
      {backgroundType !== 'none' && (
        <div className="absolute inset-0 z-0">
          <Canvas
            camera={{ position: [0, 0, 10], fov: 60 }}
            style={{ background: 'transparent' }}
            dpr={[1, 2]}
            performance={{ min: 0.5 }}
          >
            {/* slightly reduced lights to keep text readable */}
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.45} color={color} />
            <Environment preset="night" />
            {renderBackground()}
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={Math.max(0.1, speed * 0.35)}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 2}
            />
          </Canvas>
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
}
