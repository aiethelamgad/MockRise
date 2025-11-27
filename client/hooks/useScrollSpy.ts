import { useEffect, useState } from 'react';

/**
 * Hook to detect which section is currently in view
 * Uses scroll position to determine which section is closest to the viewport top
 */
export function useScrollSpy(ids: string[]) {
  const [activeId, setActiveId] = useState<string>('');
  const navbarHeight = 64; // h-16 = 64px
  const threshold = 200; // Distance from top (after navbar) to consider section active

  useEffect(() => {
    if (ids.length === 0) return;

    const findActiveSection = () => {
      const scrollY = window.scrollY;
      const thresholdLine = scrollY + navbarHeight + threshold;

      // Get all sections with their positions
      const sections = ids
        .map((id) => {
          const element = document.getElementById(id);
          if (!element) return null;

          const rect = element.getBoundingClientRect();
          const top = rect.top + scrollY;
          const bottom = top + rect.height;

          return { id, top, bottom };
        })
        .filter((section): section is NonNullable<typeof section> => section !== null)
        .sort((a, b) => a.top - b.top);

      if (sections.length === 0) return;

      // Find the section whose top is closest to but above the threshold line
      let activeSection = sections[0]; // Default to first

      // If we're at the very top, use first section
      if (scrollY < 50) {
        if (activeId !== sections[0].id) {
          setActiveId(sections[0].id);
        }
        return;
      }

      // Walk through sections from top to bottom
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];

        // If section top is above threshold, it could be active
        if (section.top <= thresholdLine) {
          // Check if we should switch to next section
          if (i < sections.length - 1) {
            const nextSection = sections[i + 1];
            // If next section's top is also above threshold, compare distances
            if (nextSection.top <= thresholdLine) {
              // Use the one closest to threshold
              const currentDist = Math.abs(section.top - thresholdLine);
              const nextDist = Math.abs(nextSection.top - thresholdLine);
              
              if (nextDist < currentDist) {
                activeSection = nextSection;
                continue;
              }
            }
          }
          activeSection = section;
        } else {
          // Found a section below threshold, stop here
          break;
        }
      }

      if (activeSection.id && activeId !== activeSection.id) {
        setActiveId(activeSection.id);
      }
    };

    // Throttled scroll handler
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          findActiveSection();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial check
    const initialTimeout = setTimeout(findActiveSection, 100);

    window.addEventListener('scroll', scrollListener, { passive: true });

    // Handle resize
    const resizeListener = () => {
      setTimeout(findActiveSection, 100);
    };
    window.addEventListener('resize', resizeListener);

    return () => {
      clearTimeout(initialTimeout);
      window.removeEventListener('scroll', scrollListener);
      window.removeEventListener('resize', resizeListener);
    };
  }, [ids, activeId, navbarHeight, threshold]);

  return activeId;
}
