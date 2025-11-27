import {
  Calendar,
  MessageSquare,
  Mic,
  Award,
  Settings,
  Users,
  LayoutDashboard,
  FileText,
  BarChart3,
  Cog,
  BookOpen,
  Star,
  Trophy,
  ClipboardList,
  Home,
  UserCheck,
  Library,
  Clock,
} from "lucide-react";
import { DashboardConfig } from "@/types/dashboard";

export const userDashboardConfig: DashboardConfig = {
  basePath: "/dashboard",
  sidebarItems: [
    { name: "Dashboard", href: "/dashboard/trainee", icon: Home },
    { name: "Schedule Interview", href: "/dashboard/trainee/schedule", icon: Calendar },
    { name: "My Sessions", href: "/dashboard/trainee/sessions", icon: MessageSquare },
    { name: "Speech Analysis", href: "/dashboard/trainee/speech-analysis", icon: Mic },
    { name: "Feedback", href: "/dashboard/trainee/feedback", icon: Award },
    { name: "Settings", href: "/dashboard/trainee/settings", icon: Settings },
  ],
};

export const interviewerDashboardConfig: DashboardConfig = {
  basePath: "/interviewer",
  sidebarItems: [
    { name: "Dashboard", href: "/dashboard/interviewer", icon: Home },
    { name: "Assigned Interviews", href: "/dashboard/interviewer/assigned", icon: Calendar },
    { name: "Availability Management", href: "/dashboard/interviewer/availability", icon: Clock },
    { name: "Question Bank", href: "/dashboard/interviewer/questions", icon: BookOpen },
    { name: "Feedback Review", href: "/dashboard/interviewer/feedback", icon: MessageSquare },
    { name: "Performance Stats", href: "/dashboard/interviewer/stats", icon: Star },
    { name: "Settings", href: "/dashboard/interviewer/settings", icon: Settings },
  ],
};

export const adminDashboardConfig: DashboardConfig = {
  basePath: "/admin",
  sidebarItems: [
    { name: "Dashboard", href: "/dashboard/admin", icon: Home },
    { 
      name: "Pending Interviewer Applications", 
      href: "/dashboard/admin/pending-interviewers", 
      icon: UserCheck,
      requiredRoles: ["admin", "super_admin", "hr_admin"]
    },
    { 
      name: "Users Management", 
      href: "/dashboard/admin/users", 
      icon: Users,
      requiredRoles: ["admin", "super_admin", "hr_admin"]
    },
    { 
      name: "Interviews Management", 
      href: "/dashboard/admin/interviews", 
      icon: LayoutDashboard,
      requiredRoles: ["admin", "super_admin", "hr_admin"]
    },
    { 
      name: "Resources Management", 
      href: "/dashboard/admin/resources", 
      icon: Library,
      requiredRoles: ["admin", "super_admin", "hr_admin"]
    },
    { 
      name: "Analytics", 
      href: "/dashboard/admin/analytics", 
      icon: BarChart3,
      requiredRoles: ["admin", "super_admin", "hr_admin"]
    },
    { 
      name: "System Config", 
      href: "/dashboard/admin/config", 
      icon: Cog,
      requiredRoles: ["admin", "super_admin", "hr_admin"]
    },
  ],
};