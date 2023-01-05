import { useEffect, useRef } from 'react';

/**
 * Utility hook for animation frames
 */
export const useAnimationFrame = (callback: () => void) => {
  const requestRef = useRef<number>();
  const animate = () => {
    callback();
    requestRef.current = requestAnimationFrame(animate);
  };
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);
};
