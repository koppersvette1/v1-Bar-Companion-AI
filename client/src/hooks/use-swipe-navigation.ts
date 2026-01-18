import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

interface SwipeNavigationOptions {
  routes: string[];
  threshold?: number;
  disabled?: boolean;
}

export function useSwipeNavigation({
  routes,
  threshold = 50,
  disabled = false,
}: SwipeNavigationOptions) {
  const [location, setLocation] = useLocation();
  const startX = useRef(0);
  const startY = useRef(0);

  useEffect(() => {
    if (disabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;

      const deltaX = endX - startX.current;
      const deltaY = endY - startY.current;

      // Only navigate if horizontal swipe is more significant than vertical
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
        const currentIndex = routes.indexOf(location);

        if (currentIndex === -1) return;

        // Swipe right - go to previous route
        if (deltaX > 0 && currentIndex > 0) {
          setLocation(routes[currentIndex - 1]);
          // Haptic feedback
          if ('vibrate' in navigator) {
            navigator.vibrate(10);
          }
        }
        // Swipe left - go to next route
        else if (deltaX < 0 && currentIndex < routes.length - 1) {
          setLocation(routes[currentIndex + 1]);
          // Haptic feedback
          if ('vibrate' in navigator) {
            navigator.vibrate(10);
          }
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [disabled, location, routes, setLocation, threshold]);
}
