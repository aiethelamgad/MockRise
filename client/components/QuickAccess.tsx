import { useNavigate } from "react-router-dom";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { motion } from "framer-motion";
import {
  Shield,
  Users,
  BookOpen,
  HelpCircle,
  Palette,
  ChevronRight,
} from "lucide-react";
import { ROUTES } from "@/routes/routes.config";

export function QuickAccess() {
  const navigate = useNavigate();

  const quickAccessItems = [
    {
      title: "Admin Dashboard",
      description: "Manage users and platform settings",
      icon: Shield,
      href: ROUTES.ADMIN_DASHBOARD,
      color: "text-destructive",
    },
    {
      title: "Interviewer Dashboard",
      description: "Manage interview sessions",
      icon: Users,
      href: ROUTES.INTERVIEWER_DASHBOARD,
      color: "text-primary",
    },
    {
      title: "Resources",
      description: "Learning materials and guides",
      icon: BookOpen,
      href: ROUTES.RESOURCES,
      color: "text-accent",
    },
    {
      title: "Help Center",
      description: "Get support and find answers",
      icon: HelpCircle,
      href: ROUTES.FAQ, // Using FAQ as help center
      color: "text-secondary",
    },
    {
      title: "Style Guide",
      description: "Design system documentation",
      icon: Palette,
      href: ROUTES.STYLE_GUIDE,
      color: "text-warning",
    },
  ];

  return (
    <EnhancedCard className="p-6" variant="elevated">
      <h3 className="text-lg font-semibold mb-4">Quick Access</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickAccessItems.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <EnhancedButton
              variant="outline"
              className="w-full h-auto p-4 flex flex-col items-start gap-2 hover:bg-muted"
              onClick={() => navigate(item.href)}
            >
              <div className="flex items-center gap-3 w-full">
                <item.icon className={`h-5 w-5 ${item.color}`} />
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">{item.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.description}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </EnhancedButton>
          </motion.div>
        ))}
      </div>
    </EnhancedCard>
  );
}
