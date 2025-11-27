import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export default function QuickActionsSlider({ quickActions }) {
  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    slides: {
      perView: 1.5, // show 1.5 slides on mobile
      spacing: 15,
    },
    breakpoints: {
      "(min-width: 640px)": { slides: { perView: 2.5, spacing: 15 } },
      "(min-width: 1024px)": { slides: { perView: 4, spacing: 20 } },
    },
    loop: true,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="container"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Quick Actions</h2>
      <div ref={sliderRef} className="keen-slider">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="keen-slider__slide cursor-pointer"
          >
            <EnhancedCard className="p-6 hover-lift glass" variant="glass">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <h3 className="font-semibold">{action.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {action.description}
              </p>
              <EnhancedButton variant="outline" size="sm" className="w-full hover:bg-primary/10">
                Get Started
                <ChevronRight className="h-4 w-4 ml-2" />
              </EnhancedButton>
            </EnhancedCard>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
