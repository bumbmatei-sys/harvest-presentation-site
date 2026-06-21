import React from 'react';
import { useParallax } from '../hooks/useParallax';

interface ParallaxLayerProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

/**
 * Wraps children in a div with parallax scroll transform.
 * Speed: 0 = no movement, 0.5 = half scroll speed, 1 = full scroll (rare).
 * Negative speeds move opposite to scroll.
 */
export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({
  children,
  speed = 0.3,
  className = '',
}) => {
  const ref = useParallax(speed);
  return (
    <div
      ref={ref}
      className={`will-change-transform ${className}`}
    >
      {children}
    </div>
  );
};
