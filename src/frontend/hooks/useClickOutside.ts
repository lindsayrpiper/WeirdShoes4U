import { useEffect, RefObject } from 'react';

/**
 * Custom hook that detects clicks outside of a specified element
 * @param ref - The ref of the element to detect clicks outside of
 * @param handler - The callback function to execute when a click outside is detected
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    // Add event listeners for both mouse and touch events
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    // Clean up
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}
