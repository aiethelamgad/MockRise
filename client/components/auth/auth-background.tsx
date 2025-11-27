import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface AuthBackgroundProps {
  children: React.ReactNode;
  variant?: 'login' | 'signup' | 'forgot';
}

export function AuthBackground({ children, variant = 'login' }: AuthBackgroundProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Get gradient colors based on variant
  const getGradients = () => {
    switch (variant) {
      case 'signup':
        return {
          primary: "from-primary/20 via-secondary/20 to-accent/20",
          secondary: "from-accent/10 via-primary/10 to-secondary/10"
        };
      case 'forgot':
        return {
          primary: "from-secondary/20 via-accent/20 to-primary/20",
          secondary: "from-primary/10 via-secondary/10 to-accent/10"
        };
      default:
        return {
          primary: "from-primary/20 via-accent/20 to-secondary/20",
          secondary: "from-secondary/10 via-primary/10 to-accent/10"
        };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const x = clientX / window.innerWidth;
      const y = clientY / window.innerHeight;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const { primary, secondary } = getGradients();

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Animated gradients */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-tr opacity-50 ${primary}`}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 3, 0],
          x: mousePosition.x * 10,
          y: mousePosition.y * 10,
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      <motion.div
        className={`absolute inset-0 bg-gradient-to-bl opacity-30 ${secondary}`}
        animate={{
          scale: [1.1, 1, 1.1],
          rotate: [0, -3, 0],
          x: mousePosition.x * -10,
          y: mousePosition.y * -10,
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      
      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="particles-container" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}