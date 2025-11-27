import { Link, useLocation, Outlet, Navigate, useNavigate } from "react-router-dom";
import { DashboardSidebar } from "./DashboardSidebar";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { userDashboardConfig, interviewerDashboardConfig, adminDashboardConfig } from "@/config/dashboardConfigs";
import { UserRole } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sparkles,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

import { useInterviewerStatusNotifications } from '@/hooks/useInterviewerStatusNotifications';
import { usePendingInterviewerNotifications } from '@/hooks/usePendingInterviewerNotifications';

// Hooks that should only run when user is authenticated
function AuthenticatedHooks() {
  useInterviewerStatusNotifications();
  usePendingInterviewerNotifications();
  return null;
}

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a proper loading spinner component
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const getDashboardConfig = () => {
    if (user.role === "super_admin" || user.role === "admin" || user.role === "hr_admin") {
      return adminDashboardConfig;
    }
    if (user.role === "interviewer") {
      return interviewerDashboardConfig;
    }
    return userDashboardConfig;
  };

  const dashboardConfig = getDashboardConfig();

  return (
    <div className="min-h-screen bg-background">
      {/* Hooks that require authenticated user */}
      <AuthenticatedHooks />
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center space-x-2 group min-w-0">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary transition-all duration-300 group-hover:rotate-12 flex-shrink-0" />
            <span className="text-lg sm:text-xl font-bold gradient-text truncate">MockRise</span>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <ThemeToggle />
            <NotificationsPanel />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || user.email || 'user'}`} />
                    <AvatarFallback>
                      {user.name 
                        ? user.name.substring(0, 2).toUpperCase() 
                        : user.email 
                          ? user.email.substring(0, 2).toUpperCase() 
                          : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name || user.email || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user.email || 'No email'}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  if (user.role === 'super_admin' || user.role === 'admin' || user.role === 'hr_admin') {
                    navigate('/dashboard/admin/profile');
                  } else if (user.role === 'interviewer') {
                    navigate('/dashboard/interviewer/settings/profile');
                  } else {
                    navigate('/dashboard/trainee/settings/profile');
                  }
                }}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                {(user.role === 'trainee' || user.role === 'interviewer') && (
                  <DropdownMenuItem onClick={() => {
                    const rolePath = user.role === 'interviewer' ? 'interviewer' : 'trainee';
                    navigate(`/dashboard/${rolePath}/settings`);
                  }}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Dynamic Sidebar based on dashboard type */}
        <DashboardSidebar config={dashboardConfig} userRole={user.role} />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40">
        <div className="flex justify-around items-center p-2 gap-1">
          {dashboardConfig.sidebarItems.slice(0, 4).map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link key={item.name} to={item.href} className="flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex-col h-auto py-2 px-2 sm:px-3 w-full",
                    active && "text-primary bg-primary/10"
                  )}
                >
                  <item.icon className="h-4 w-4 sm:h-5 sm:w-5 mb-1" />
                  <span className="text-[10px] sm:text-xs truncate">{item.name.split(" ")[0]}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}