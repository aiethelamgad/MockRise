import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Component to handle OAuth token extraction from URL
 * 
 * When OAuth redirects back from the server, the token is passed in the URL.
 * This component extracts it, stores it in localStorage, fetches user data,
 * and removes it from the URL. This must run BEFORE any redirect logic.
 */
export function OAuthTokenHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchUser, setUser } = useAuth();
  const hasProcessedToken = useRef<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');

    // Only process if we have a token and haven't processed this specific token yet
    if (token && token !== hasProcessedToken.current) {
      hasProcessedToken.current = token;
      
      // Store token in localStorage immediately
      localStorage.setItem('auth_token', token);

      // Remove token from URL immediately (before fetch) to prevent re-processing
      searchParams.delete('token');
      const newSearch = searchParams.toString();
      const newPath = newSearch 
        ? `${location.pathname}?${newSearch}` 
        : location.pathname;
      
      // Replace URL without token immediately
      navigate(newPath, { replace: true });

      // Fetch user data immediately so auth state is updated
      // This prevents redirect loops where dashboard redirects to login
      fetchUser().catch(() => {
        // Silently handle fetch errors - token is stored, user can retry
      });
    }
  }, [location.search, navigate, fetchUser, setUser]);

  return null;
}

