import { useRef, useEffect, useState } from 'react';

/**
 * Lightweight parallax scroll hook.
 * - requestAnimationFrame-throttled
 * - IntersectionObserver-gated (only animates when element is visible)
 * - respects prefers-reduced-motion
 * - uses transform: translateY only (GPU-accelerated, no layout thrashing)
 */
export function useParallax(speed: number = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setEnabled(!mq.matches);

    const handler = () => setEnabled(!mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    let rafId = 0;
    let isVisible = false;
    const el = ref.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0, rootMargin: '100px' }
    );
    observer.observe(el);

    const onScroll = () => {
      if (!isVisible || !el) return;
      rafId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        // How far the element's center is from the viewport center
        const distance = rect.top + rect.height / 2 - windowHeight / 2;
        const offset = distance * speed * -1;
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initial position

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [enabled, speed]);

  return ref;
}
