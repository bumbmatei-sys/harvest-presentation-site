import React from 'react';

/* Harvest landing — scroll & ambient effects.
   Drifting clouds, parallax layers, reveal-on-scroll, count-up.
   Ported from the Claude Design handoff (ui_kits/website/effects.jsx). */

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Parallax: translateY proportional to distance from viewport center.
export function useParallax(speed: number) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (prefersReduced()) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let visible = false;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '160px' });
    io.observe(el);
    const onScroll = () => {
      if (!visible) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const dist = r.top + r.height / 2 - window.innerHeight / 2;
        el.style.transform = `translate3d(0, ${dist * speed * -1}px, 0)`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); io.disconnect(); cancelAnimationFrame(raf); };
  }, [speed]);
  return ref;
}

export function ParallaxLayer({
  speed = 0.2,
  className = '',
  style = {},
  children,
}: {
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const ref = useParallax(speed);
  return (
    <div ref={ref} className={className} style={{ willChange: 'transform', ...style }}>
      {children}
    </div>
  );
}

// Reveal: fade + rise when the element scrolls into view.
export function Reveal({
  children,
  delay = 0,
  y = 30,
  as = 'div',
  style = {},
  ...rest
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  as?: keyof JSX.IntrinsicElements;
  style?: React.CSSProperties;
  [key: string]: unknown;
}) {
  const ref = React.useRef<HTMLElement>(null);
  const [shown, setShown] = React.useState(false);
  React.useEffect(() => {
    if (prefersReduced()) { setShown(true); return; }
    const el = ref.current;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); io.disconnect(); }
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    if (el) io.observe(el);
    return () => io.disconnect();
  }, []);
  const Tag = as as React.ElementType;
  return (
    <Tag
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : `translateY(${y}px)`,
        transition: `opacity 850ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 850ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// A single soft cloud built from layered radial puffs.
function Cloud({ style = {}, scale = 1, opacity = 0.9 }: { style?: React.CSSProperties; scale?: number; opacity?: number }) {
  const puff = (w: number, h: number, l: number, t: number, o = 1): React.CSSProperties => ({
    position: 'absolute', left: l, top: t, width: w, height: h,
    borderRadius: '50%', background: '#fff', opacity: o, filter: 'blur(14px)',
  });
  return (
    <div style={{ position: 'absolute', width: 240 * scale, height: 90 * scale, opacity, ...style }} aria-hidden="true">
      <div style={puff(140 * scale, 70 * scale, 50 * scale, 20 * scale, 1)} />
      <div style={puff(100 * scale, 100 * scale, 20 * scale, 10 * scale, 0.95)} />
      <div style={puff(110 * scale, 80 * scale, 120 * scale, 12 * scale, 0.95)} />
      <div style={puff(180 * scale, 46 * scale, 30 * scale, 44 * scale, 0.85)} />
    </div>
  );
}

// Sky: layered drifting clouds over a transparent bg.
export function Clouds({ dense = false }: { dense?: boolean }) {
  const items = dense
    ? [
        { top: '6%', left: '-8%', scale: 1.3, opacity: 0.95, dur: 90, delay: 0 },
        { top: '18%', left: '60%', scale: 0.9, opacity: 0.8, dur: 120, delay: -30 },
        { top: '40%', left: '10%', scale: 1.1, opacity: 0.7, dur: 150, delay: -60 },
        { top: '55%', left: '72%', scale: 1.0, opacity: 0.75, dur: 110, delay: -20 },
        { top: '2%', left: '35%', scale: 0.8, opacity: 0.85, dur: 100, delay: -45 },
      ]
    : [
        { top: '12%', left: '-6%', scale: 1.2, opacity: 0.92, dur: 95, delay: 0 },
        { top: '30%', left: '68%', scale: 0.95, opacity: 0.8, dur: 130, delay: -40 },
        { top: '55%', left: '20%', scale: 1.0, opacity: 0.7, dur: 150, delay: -70 },
      ];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden="true">
      {items.map((c, i) => (
        <div
          key={i}
          style={{
            position: 'absolute', top: c.top, left: c.left,
            animation: `harvestDrift ${c.dur}s linear ${c.delay}s infinite, harvestCloudIn 2.4s var(--ease-out) ${0.3 + i * 0.35}s both`,
          }}
        >
          <Cloud scale={c.scale} opacity={c.opacity} />
        </div>
      ))}
    </div>
  );
}

// Count-up number when scrolled into view.
export function useCountUp(target: number, duration = 1400): [number, React.RefObject<HTMLElement>] {
  const ref = React.useRef<HTMLElement>(null);
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    if (prefersReduced()) { setVal(target); return; }
    const el = ref.current;
    let raf = 0;
    let start = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const step = (t: number) => {
        if (!start) start = t;
        const p = Math.min((t - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(target * eased));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.4 });
    if (el) io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [target, duration]);
  return [val, ref];
}
