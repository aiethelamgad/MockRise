export type UserRole = "trainee" | "interviewer" | "admin" | "super_admin" | "hr_admin";

export interface SidebarItem {
  name: string;
  href: string;
  icon: any;
  requiredRoles?: UserRole[];
}

export interface DashboardConfig {
  basePath: string;
  sidebarItems: SidebarItem[];
}

export interface InterviewSession {
  id: string;
  date: string;
  type: string;
  status: string;
  duration: number;
  score?: number;
}

export interface Question {
  id: string;
  text: string;
  category: string;
  difficulty: string;
  tags: string[];
}

export interface AnalyticsData {
  timeframe: string;
  data: number[];
  labels: string[];
}