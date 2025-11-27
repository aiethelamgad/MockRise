import { useAuth } from "@/contexts/AuthContext";

const PERMISSIONS_BY_ROLE: Record<string, string[]> = {
  admin: ["overview", "users", "interviews", "content", "analytics"],
  super_admin: ["overview", "users", "interviews", "content", "analytics"],
  hr_admin: ["overview", "users", "interviews", "content", "analytics"],
  interviewer: ["queue", "current", "feedback", "analytics"],
  trainee: ["current", "feedback"],
};

/**
 * Hook to provide current role and allowed section keys.
 * Reads role from AuthContext.
 */
export function usePermissions() {
  const { user, loading } = useAuth();
  
  // Wait for user to load before determining role
  if (loading) {
    return { 
      role: undefined, 
      allowed: [], 
      isAllowed: () => false 
    };
  }
  
  if (!user) {
    return { 
      role: undefined, 
      allowed: [], 
      isAllowed: () => false 
    };
  }
  
  const role = user.role;
  
  // Map role to permission key (admin, super_admin, hr_admin all use admin permissions)
  const permissionKey = (role === "super_admin" || role === "hr_admin") ? "admin" : role;
  
  // Get allowed permissions - try permissionKey first, then role directly
  const allowed = PERMISSIONS_BY_ROLE[permissionKey] || PERMISSIONS_BY_ROLE[role] || [];
  
  const isAllowed = (key: string) => allowed.includes(key);

  return { role, allowed, isAllowed };
}