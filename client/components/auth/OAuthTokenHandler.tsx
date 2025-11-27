import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Component to handle OAuth token extraction from URL
 * 
 * When OAuth redirects back from the server, the token is passed in the URL.
 * This component extracts it, stores it in localStorage, and removes it from the URL.
 */
export function OAuthTokenHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');

    if (token) {
      // Store token in localStorage
      localStorage.setItem('auth_token', token);

      // Remove token from URL for security
      searchParams.delete('token');
      const newSearch = searchParams.toString();
      const newPath = newSearch 
        ? `${location.pathname}?${newSearch}` 
        : location.pathname;
      
      // Replace URL without token (don't add to history)
      navigate(newPath, { replace: true });
    }
  }, [location, navigate]);

  return null;
}

