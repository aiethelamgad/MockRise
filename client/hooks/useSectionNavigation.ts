import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Hook for navigating to landing page sections
 * Handles navigation from any page and scrolls to the correct section
 */
export function useSectionNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Navigate to a section on the landing page
   * @param sectionId - The ID of the section to scroll to (without #)
   * @param options - Additional options for navigation
   */
  const navigateToSection = (sectionId: string, options?: { replace?: boolean }) => {
    // Remove leading # if present
    const cleanSectionId = sectionId.replace(/^#/, '');

    // If already on landing page, scroll directly
    if (location.pathname === '/') {
      setTimeout(() => {
        const element = document.getElementById(cleanSectionId);
        if (element) {
          // Calculate offset for sticky navbar (navbar height is h-16 = 64px)
          const navbarHeight = 64;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth',
          });
          
          // Update URL hash
          window.history.replaceState(null, '', `#${cleanSectionId}`);
          
          // Force scroll spy to update after scroll completes
          // Use multiple checks at different intervals to catch the scroll completion
          const updateScrollSpy = () => {
            window.dispatchEvent(new Event('scroll'));
          };
          
          // Check immediately and after delays to ensure scroll spy updates
          updateScrollSpy();
          setTimeout(updateScrollSpy, 200);
          setTimeout(updateScrollSpy, 400);
          setTimeout(updateScrollSpy, 600);
          setTimeout(updateScrollSpy, 800);
        }
      }, 50);
      return;
    }

    // Not on landing page -> navigate to landing with section in state
    navigate('/', {
      state: { scrollTo: cleanSectionId },
      replace: options?.replace,
    });
  };

  /**
   * Navigate to a regular route (not a section)
   * @param path - The path to navigate to
   */
  const navigateToPage = (path: string, options?: { replace?: boolean }) => {
    navigate(path, { replace: options?.replace });
  };

  return {
    navigateToSection,
    navigateToPage,
  };
}

