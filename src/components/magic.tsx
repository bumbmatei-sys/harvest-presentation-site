import React from 'react';
import { L } from './icons';

/* Harvest — premium interaction components adapted from MagicUI
   (ScrollProgress, ProgressiveBlur, Particles, TextAnimate, Marquee,
   InteractiveHoverButton, 3D TiltIn, Safari + iPhone frames, AnimatedBeam)
   for a React + inline-style environment.
   Ported from the Claude Design handoff (ui_kits/website/magic.jsx). */

/** CSS style that may also carry custom properties (--foo). */
type Style = React.CSSProperties & Record<`--${string}`, string | number>;

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Scroll progress bar (gold) ----------
export function ScrollProgress() {
  const [p, setP] = React.useState(0);
  React.useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        setP(max > 0 ? h.scrollTop / max : 0);
      });
    };
    window.addEventListener('scroll', on, { passive: true });
    on();
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 90,
        transformOrigin: '0 50%', transform: `scaleX(${p})`,
        background: 'linear-gradient(90deg, var(--gold-300), var(--brand), var(--gold-700))',
      }}
      aria-hidden="true"
    />
  );
}

// ---------- Progressive blur (fixed at viewport bottom) ----------
export function ProgressiveBlur({ height = 100 }: { height?: number }) {
  const layers: [number, string][] = [
    [0.5, 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 25%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 75%)'],
    [1.5, 'linear-gradient(to bottom, rgba(0,0,0,0) 25%, rgba(0,0,0,1) 50%, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)'],
    [3, 'linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,1) 75%, rgba(0,0,0,1) 100%)'],
    [6, 'linear-gradient(to bottom, rgba(0,0,0,0) 75%, rgba(0,0,0,1) 100%)'],
  ];
  return (
    <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, height, zIndex: 55, pointerEvents: 'none' }} aria-hidden="true">
      {layers.map(([b, mask], i) => (
        <div
          key={i}
          style={{
            position: 'absolute', inset: 0,
            backdropFilter: `blur(${b}px)`, WebkitBackdropFilter: `blur(${b}px)`,
            maskImage: mask, WebkitMaskImage: mask,
          }}
        />
      ))}
    </div>
  );
}

// ---------- Golden particles (subtle) ----------
export function Particles({ quantity = 55, color = [201, 150, 58], size = 0.9, style = {} }:
  { quantity?: number; color?: [number, number, number]; size?: number; style?: React.CSSProperties }) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const cvsRef = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    if (reduced()) return;
    const cvs = cvsRef.current, wrap = wrapRef.current;
    if (!cvs || !wrap) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    let W = 0, H = 0, parts: ReturnType<typeof mk>[] = [], raf = 0;
    const mouse = { x: 0, y: 0 };
    const mk = () => ({
      x: Math.random() * W, y: Math.random() * H, tx: 0, ty: 0,
      s: Math.random() * 1.5 + size, a: 0, ta: Math.random() * 0.34 + 0.08,
      dx: (Math.random() - 0.5) * 0.08, dy: (Math.random() - 0.5) * 0.06,
      m: 0.1 + Math.random() * 3,
    });
    const resize = () => {
      W = wrap.offsetWidth; H = wrap.offsetHeight;
      cvs.width = W * dpr; cvs.height = H * dpr;
      cvs.style.width = W + 'px'; cvs.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      parts = Array.from({ length: quantity }, mk);
    };
    const step = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < parts.length; i++) {
        const c = parts[i];
        c.a += (c.ta - c.a) * 0.02;
        c.x += c.dx; c.y += c.dy;
        c.tx += ((mouse.x / (60 / c.m)) - c.tx) / 55;
        c.ty += ((mouse.y / (60 / c.m)) - c.ty) / 55;
        if (c.x < -8 || c.x > W + 8 || c.y < -8 || c.y > H + 8) { parts[i] = mk(); continue; }
        ctx.beginPath();
        ctx.arc(c.x + c.tx, c.y + c.ty, c.s, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${c.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(step);
    };
    const onMouse = (e: MouseEvent) => {
      const r = cvs.getBoundingClientRect();
      const x = e.clientX - r.left - W / 2, y = e.clientY - r.top - H / 2;
      if (Math.abs(x) < W / 2 && Math.abs(y) < H / 2) { mouse.x = x; mouse.y = y; }
    };
    resize(); step();
    const ro = new ResizeObserver(resize); ro.observe(wrap);
    window.addEventListener('mousemove', onMouse, { passive: true });
    return () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('mousemove', onMouse); };
  }, []);
  return <div ref={wrapRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...style }} aria-hidden="true"><canvas ref={cvsRef} /></div>;
}

// ---------- TextAnimate: blur-in-up by word ----------
function flattenText(n: React.ReactNode): string {
  if (n == null || n === false) return '';
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(flattenText).join('');
  if (React.isValidElement(n)) return flattenText((n.props as { children?: React.ReactNode }).children);
  return '';
}

export function AnimatedText({
  text, as = 'p', style = {}, startOnView = true, delay = 0, stagger = 42, y = 16, duration = 650,
}: {
  text: React.ReactNode; as?: keyof JSX.IntrinsicElements; style?: React.CSSProperties;
  startOnView?: boolean; delay?: number; stagger?: number; y?: number; duration?: number;
}) {
  const ref = React.useRef<HTMLElement>(null);
  const [go, setGo] = React.useState(false);
  React.useEffect(() => {
    if (reduced()) { setGo(true); return; }
    if (!startOnView) { const t = setTimeout(() => setGo(true), 30); return () => clearTimeout(t); }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setGo(true); io.disconnect(); } }, { threshold: 0.2 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const Tag = as as React.ElementType;
  const str = flattenText(text);
  const words = str.split(/(\s+)/);
  let wi = 0;
  return (
    <Tag ref={ref} style={style} aria-label={str.replace(/\n/g, ' ')}>
      {words.map((w, i) => {
        if (/^\s+$/.test(w)) return w.includes('\n') ? <br key={i} /> : ' ';
        const d = delay + (wi++) * stagger;
        return (
          <span key={i} aria-hidden="true" style={{
            display: 'inline-block', whiteSpace: 'pre',
            opacity: go ? 1 : 0,
            filter: go ? 'blur(0px)' : 'blur(9px)',
            transform: go ? 'none' : `translateY(${y}px)`,
            transition: `opacity ${duration}ms var(--ease-out) ${d}ms, filter ${duration}ms var(--ease-out) ${d}ms, transform ${duration}ms var(--ease-out) ${d}ms`,
          }}>{w}</span>
        );
      })}
    </Tag>
  );
}

// ---------- Marquee ----------
export function Marquee({ children, duration = 45, reverse = false, gap = 24, style = {} }:
  { children: React.ReactNode; duration?: number; reverse?: boolean; gap?: number; style?: React.CSSProperties }) {
  const track: React.CSSProperties = { animationDuration: duration + 's', animationDirection: reverse ? 'reverse' : 'normal' };
  return (
    <div className="hmarq" style={{ '--hm-gap': gap + 'px', ...style } as Style}>
      <div className="hmarq-track" style={track}>{children}</div>
      <div className="hmarq-track" style={track} aria-hidden="true">{children}</div>
    </div>
  );
}

// ---------- Interactive hover button ----------
type Variant = 'light' | 'dark' | 'gold';
export function HBtn({ children, href, variant = 'light', size = 'md', style = {}, onClick, block = false }:
  {
    children: React.ReactNode; href?: string; variant?: Variant; size?: 'sm' | 'md' | 'lg';
    style?: React.CSSProperties; onClick?: () => void; block?: boolean;
  }) {
  const sizes = {
    sm: { padding: '9px 20px', fontSize: 13.5 },
    md: { padding: '13px 28px', fontSize: 15 },
    lg: { padding: '17px 38px', fontSize: 16.5 },
  } as const;
  const variants = {
    light: { background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(45,37,25,0.12)', color: 'var(--navy-900)', dot: 'var(--brand)', alt: '#fff' },
    dark: { background: 'var(--navy-900)', border: '1px solid var(--navy-900)', color: '#fff', dot: 'var(--brand)', alt: '#fff' },
    gold: { background: 'var(--brand)', border: '1px solid var(--brand)', color: '#fff', dot: 'var(--navy-900)', alt: '#fff' },
  } as const;
  const v = variants[variant] || variants.light;
  const Tag = (href ? 'a' : 'button') as React.ElementType;
  return (
    <Tag
      href={href}
      onClick={onClick}
      className="hbtn"
      style={{
        ...sizes[size], background: v.background, border: v.border, color: v.color,
        '--hb-dot': v.dot, '--hb-alt-color': v.alt,
        width: block ? '100%' : undefined, boxSizing: 'border-box',
        ...style,
      } as Style}
    >
      <span className="hb-main"><span className="hb-dot" /><span className="hb-label">{children}</span></span>
      <span className="hb-alt">{children} <L name="arrow-right" size={16} color="currentColor" /></span>
    </Tag>
  );
}

// ---------- 3D tilt-in on scroll ----------
export function TiltIn({ children, maxTilt = 17, style = {} }: { children: React.ReactNode; maxTilt?: number; style?: React.CSSProperties }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [p, setP] = React.useState(0);
  React.useEffect(() => {
    if (reduced()) { setP(1); return; }
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current; if (!el) return;
        const r = el.getBoundingClientRect(), vh = window.innerHeight;
        setP(Math.min(Math.max((vh - r.top) / (vh * 0.62), 0), 1));
      });
    };
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    on();
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div style={{ perspective: '1400px', ...style }}>
      <div ref={ref} style={{
        transform: `rotateX(${(1 - p) * maxTilt}deg) translateY(${(1 - p) * 44}px) scale(${0.955 + p * 0.045})`,
        opacity: 0.25 + 0.75 * p,
        transformOrigin: '50% 18%', willChange: 'transform',
        transition: 'transform 130ms linear, opacity 130ms linear',
      }}>{children}</div>
    </div>
  );
}

// ---------- Safari browser frame ----------
export function SafariFrame({ url = 'theharvest.app', children }: { url?: string; children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(45,37,25,0.1)', boxShadow: '0 24px 54px rgba(12,21,38,0.1)', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 16px', background: '#F4F1EB', borderBottom: '1px solid rgba(45,37,25,0.07)' }}>
        <div style={{ display: 'flex', gap: 7 }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <span key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c, display: 'block' }} />)}
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#fff', borderRadius: 999, padding: '6px 18px', fontSize: 12, color: 'var(--text-muted)', border: '1px solid rgba(45,37,25,0.06)' }}>
            <L name="lock" size={11} color="var(--text-muted)" /> {url}
          </div>
        </div>
        <div style={{ width: 47 }} />
      </div>
      {children}
    </div>
  );
}

// ---------- iPhone frame ----------
export function IphoneFrame({ width = 272, children }: { width?: number; children: React.ReactNode }) {
  return (
    <div style={{ width, aspectRatio: '433/882', position: 'relative', margin: '0 auto' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: width * 0.165, background: '#14110E', boxShadow: '0 36px 84px rgba(12,21,38,0.42), inset 0 0 0 3px #3B362F' }} />
      <div style={{ position: 'absolute', inset: width * 0.03, borderRadius: width * 0.14, overflow: 'hidden', background: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
      <div style={{ position: 'absolute', top: width * 0.052, left: '50%', transform: 'translateX(-50%)', width: width * 0.29, height: width * 0.082, borderRadius: 999, background: '#14110E', zIndex: 6 }} />
    </div>
  );
}

// ---------- AnimatedBeam integration diagram ----------
export function BeamDiagram() {
  const W = 600, H = 300, cx = 300, cy = 150;
  const left: [number, number][] = [[68, 52], [68, 150], [68, 248]];
  const right: [number, number][] = [[532, 52], [532, 150], [532, 248]];
  const nodes = [...left, ...right];
  const path = ([x, y]: [number, number]) => `M ${x},${y} Q ${(x + cx) / 2},${(y + cy) / 2 - 22} ${cx},${cy}`;
  const toolIcons = ['google-calendar', 'google-tasks', 'notion', 'outlook', 'instagram'];
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '2/1' }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} fill="none">
        <defs>
          <linearGradient id="hbeam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#E5B65C" stopOpacity="0" />
            <stop offset="0.5" stopColor="#E5B65C" />
            <stop offset="1" stopColor="#C9963A" />
          </linearGradient>
        </defs>
        {nodes.map((n, i) => (
          <g key={i}>
            <path d={path(n)} stroke="rgba(45,37,25,0.11)" strokeWidth="1.6" />
            <path d={path(n)} stroke="url(#hbeam)" strokeWidth="2" strokeLinecap="round" strokeDasharray="42 360">
              <animate attributeName="stroke-dashoffset" from="402" to="0" dur={`${3.6 + (i % 3) * 0.7}s`} begin={`${i * 0.45}s`} repeatCount="indefinite" />
            </path>
          </g>
        ))}
      </svg>
      {nodes.map((n, i) => (
        <div
          key={i}
          style={{
            position: 'absolute', left: `${(n[0] / W) * 100}%`, top: `${(n[1] / H) * 100}%`,
            transform: 'translate(-50%,-50%)', width: 50, height: 50, borderRadius: '50%',
            background: '#fff', border: '1px solid rgba(45,37,25,0.08)',
            boxShadow: '0 8px 20px rgba(45,37,25,0.09)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {i < 5
            ? <img src={`/logos/${toolIcons[i]}.svg`} width={23} height={23} alt="" style={{ objectFit: 'contain' }} />
            : <L name="send" size={21} color="var(--sky-500)" />}
        </div>
      ))}
      {/* Premium AI agent core */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
        width: 76, height: 76, borderRadius: '50%',
        background: 'linear-gradient(145deg, var(--gold-glow), var(--gold-600))',
        boxShadow: '0 0 46px rgba(229,182,92,0.55), 0 16px 34px rgba(45,37,25,0.2)',
        border: '3px solid rgba(255,255,255,0.9)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <L name="bot" size={36} color="#fff" />
      </div>
    </div>
  );
}
