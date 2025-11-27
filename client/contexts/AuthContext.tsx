import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { UserRole } from '@/types/dashboard';
import { authService, RegisterData } from '@/services/auth.service';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status?: string;
  permissions: string[];
  isApproved?: boolean;
  oauthRolePending?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | undefined>;
  register: (data: RegisterData) => Promise<string | undefined>;
  logout: () => Promise<void>;
  isAuthorized: (requiredRoles: UserRole[]) => boolean;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Public routes that don't need authentication checks
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/forgot-password',
  '/reset-password',
  '/pricing',
  '/resources',
  '/help',
  '/faq',
  '/style-guide',
];

// Helper to check if a route is public
const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/reset-password/');
};

// Helper to check if route needs authentication
const needsAuthCheck = (pathname: string): boolean => {
  // Always check auth for protected routes
  if (pathname.startsWith('/dashboard')) return true;
  if (pathname.startsWith('/pending-verification')) return true;
  if (pathname.startsWith('/rejected-notice')) return true;
  if (pathname.startsWith('/oauth')) return true;
  // For public routes, don't check auth on initial load
  return false;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); // Start as false for public pages
  const location = useLocation();
  const hasFetchedRef = useRef(false);

  const fetchUser = async () => {
    // CRITICAL: Never fetch on landing page - guard against accidental calls
    if (location.pathname === '/') {
      return;
    }

    // Prevent duplicate fetches
    if (loading) return;

    setLoading(true);
    try {
      const response = await authService.getMe();
      if (response.success && response.data) {
        setUser({
          id: response.data._id || response.data.id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          status: response.data.status,
          permissions: response.data.permissions || [],
          isApproved: response.data.isApproved,
          oauthRolePending: response.data.oauthRolePending,
        });
      } else {
        setUser(null);
      }
    } catch (error: any) {
      // Handle 401 errors gracefully - user is not authenticated
      // This is expected if user hasn't logged in yet
      if (error.statusCode === 401) {
        setUser(null);
      } else {
        // For other errors, also clear user state
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Only fetch user when navigating to protected routes
  // Landing page should NEVER trigger auth API calls
  useEffect(() => {
    const pathname = location.pathname;
    
    // CRITICAL: Never fetch user data on landing page - keep it completely public
    if (pathname === '/') {
      setLoading(false);
      hasFetchedRef.current = false; // Reset fetch flag when on landing page
      return;
    }

    // For other public routes, don't automatically fetch
    // They can manually trigger fetch if needed (e.g., Login page for redirect check)
    if (isPublicRoute(pathname)) {
      setLoading(false);
      return;
    }

    // Only fetch user if we're on a protected route and haven't fetched yet
    if (needsAuthCheck(pathname) && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchUser();
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email: string, password: string) => {
    const data = await authService.login({ email, password });

    // After successful login, fetch fresh user data from server
    // This ensures we have the latest user state
    if (data.user) {
      hasFetchedRef.current = true;
      // Fetch user data to ensure consistency
      await fetchUser();
    }

    return data.redirect;
  };

  const register = async (formData: RegisterData) => {
    const data = await authService.register(formData);

    // After successful registration, fetch fresh user data from server
    // This ensures we have the latest user state
    if (data.user) {
      hasFetchedRef.current = true;
      // Fetch user data to ensure consistency
      await fetchUser();
    }

    return data.redirect;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Logout errors are non-critical - silently handle
    } finally {
      setUser(null);
    }
  };

  const isAuthorized = (requiredRoles: UserRole[]) => {
    return user ? requiredRoles.includes(user.role) : false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthorized, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
