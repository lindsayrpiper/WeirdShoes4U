import { useEffect } from 'react';

/**
 * Custom hook that detects when the Escape key is pressed
 * @param handler - The callback function to execute when Escape is pressed
 */
export function useEscapeKey(handler: (event: KeyboardEvent) => void): void {
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handler(event);
      }
    };

    // Add event listener
    document.addEventListener('keydown', listener);

    // Clean up
    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [handler]);
}
