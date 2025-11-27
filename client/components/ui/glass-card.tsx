import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative overflow-hidden rounded-xl bg-background/40 p-8",
        "backdrop-blur-md border border-white/10",
        "shadow-[0_8px_16px_rgb(0_0_0/0.1)]",
        "before:absolute before:inset-0",
        "before:bg-gradient-to-b before:from-white/5 before:to-white/10",
        "before:pointer-events-none",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}