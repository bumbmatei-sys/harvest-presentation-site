import React from 'react';
import createGlobe, { type COBEOptions } from 'cobe';

/* Autorotating, interactive, dotted world-map globe (MagicUI/cobe).
   Warm on-brand palette (light sphere, gold markers). Drag to spin — the small
   spring is hand-rolled so we don't pull in `motion`. Falls back to a CSS sphere
   where WebGL is unavailable. Fluid + capped width so it stays mobile-safe. */

const CONFIG: Omit<COBEOptions, 'width' | 'height' | 'onRender'> = {
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.15,
  baseColor: [1, 0.98, 0.95],
  markerColor: [0.79, 0.59, 0.23],
  glowColor: [1, 1, 1],
  markers: [
    { location: [14.5995, 120.9842], size: 0.03 },
    { location: [19.076, 72.8777], size: 0.09 },
    { location: [23.8103, 90.4125], size: 0.05 },
    { location: [30.0444, 31.2357], size: 0.07 },
    { location: [39.9042, 116.4074], size: 0.08 },
    { location: [-23.5505, -46.6333], size: 0.09 },
    { location: [19.4326, -99.1332], size: 0.09 },
    { location: [40.7128, -74.006], size: 0.09 },
    { location: [44.4268, 26.1025], size: 0.06 }, // Bucharest
    { location: [-1.2921, 36.8219], size: 0.06 }, // Nairobi
  ],
};

export function Globe({ size = 460 }: { size?: number }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const pointer = React.useRef<number | null>(null); // last drag X while grabbing
  const offset = React.useRef(0); // accumulated drag rotation
  const velocity = React.useRef(0); // release inertia
  const [ok, setOk] = React.useState(true);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let phi = 0;
    let width = 0;
    let globe: { destroy: () => void } | undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const onResize = () => { width = canvas.offsetWidth; };
    window.addEventListener('resize', onResize);
    onResize();

    try {
      globe = createGlobe(canvas, {
        ...CONFIG,
        width: width * 2,
        height: width * 2,
        onRender: (state) => {
          if (pointer.current === null) {
            if (!reduced) phi += 0.005; // autorotate
            offset.current += velocity.current;
            velocity.current *= 0.92; // decay release inertia
          }
          state.phi = phi + offset.current;
          state.width = width * 2;
          state.height = width * 2;
        },
      });
      const t = setTimeout(() => { if (canvasRef.current) canvasRef.current.style.opacity = '1'; }, 0);
      return () => { clearTimeout(t); globe?.destroy(); window.removeEventListener('resize', onResize); };
    } catch {
      setOk(false);
      window.removeEventListener('resize', onResize);
      return;
    }
  }, []);

  const wrap: React.CSSProperties = { position: 'relative', width: '100%', maxWidth: size, aspectRatio: '1', margin: '0 auto' };

  if (!ok) {
    // Graceful fallback (no WebGL): a warm sphere so the section never breaks.
    return (
      <div style={{ ...wrap, borderRadius: '50%', background: 'radial-gradient(circle at 34% 30%, #fff, #F0E8DA 46%, #DCC9A2 78%, #C9963A 105%)', boxShadow: 'inset -18px -18px 48px rgba(45,37,25,0.16), 0 28px 60px rgba(45,37,25,0.14)' }} aria-hidden="true" />
    );
  }

  const down = (x: number) => { pointer.current = x; velocity.current = 0; if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing'; };
  const up = () => { pointer.current = null; if (canvasRef.current) canvasRef.current.style.cursor = 'grab'; };
  const move = (x: number) => {
    if (pointer.current === null) return;
    const delta = (x - pointer.current) / 200;
    pointer.current = x;
    offset.current += delta;
    velocity.current = delta; // carry momentum on release
  };

  return (
    <div style={wrap}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', cursor: 'grab', opacity: 0, transition: 'opacity 0.6s var(--ease-out)', touchAction: 'pan-y', contain: 'layout paint size' }}
        onPointerDown={(e) => down(e.clientX)}
        onPointerUp={up}
        onPointerLeave={up}
        onPointerMove={(e) => move(e.clientX)}
        aria-hidden="true"
      />
    </div>
  );
}
