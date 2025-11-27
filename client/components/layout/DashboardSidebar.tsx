import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { DashboardConfig } from "@/types/dashboard";
import { UserRole } from "@/types/dashboard";

interface DashboardSidebarProps {
  config: DashboardConfig;
  userRole?: UserRole;
}

export function DashboardSidebar({ config, userRole }: DashboardSidebarProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const filteredItems = config.sidebarItems.filter(item => {
    if (!item.requiredRoles) return true;
    return userRole && item.requiredRoles.includes(userRole);
  });

  return (
    <aside className="hidden lg:block w-64 border-r border-border min-h-[calc(100vh-4rem)] bg-card/50 overflow-hidden">
      <nav className="space-y-2 p-4">
        {filteredItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.name} to={item.href} className="block">
              <Button
                variant={active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start group transition-all hover:bg-muted hover:text-black duration-200",
                  "min-w-0 overflow-hidden",
                  active && "bg-primary/10 text-primary hover:bg-primary/20"
                )}
              >
                <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate flex-1 text-left">{item.name}</span>
                {active && (
                  <ChevronRight className="ml-2 h-4 w-4 flex-shrink-0 transition-transform group-hover:translate-x-1" />
                )}
              </Button>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}