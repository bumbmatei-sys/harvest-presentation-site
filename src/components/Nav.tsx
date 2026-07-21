import React from 'react';
import { Link } from 'react-router-dom';
import { HBtn } from './magic';
import { L } from './icons';
import { Mark } from './shared';
import { CATALOG, slugify } from './catalog';

/* Fixed glass nav with a Features mega-menu.
   Deliberately click-to-toggle (not hover) + keyboard accessible, with a mobile
   accordion fallback — a load-bearing requirement carried over from the existing
   site, not the design's hover behavior.

   Internal targets use react-router <Link> so they work from any route; section
   links are path-qualified (/#pricing) so they scroll on the landing even when
   clicked from /features. Mega-menu items deep-link to the /features route. */

const featureHref = (title: string) => `/features#${slugify(title)}`;

/* Inline SOON pill for mega-menu items — same sky tokens as the /features card
   badge, sized to sit next to the item title rather than absolutely positioned. */
const soonPill: React.CSSProperties = {
  background: 'var(--sky-100)', color: 'var(--sky-700)', fontSize: 8.5, fontWeight: 700,
  letterSpacing: '0.06em', padding: '2px 6px', borderRadius: 999, lineHeight: 1.4,
};

const linkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: 14.5, fontWeight: 500, color: 'var(--navy-800)',
  textDecoration: 'none', transition: 'color 200ms', display: 'inline-flex', alignItems: 'center',
  gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0,
};

const PAGE_LINKS: [string, string][] = [
  ['Pillars', '/#pillars'],
  ['Pricing', '/#pricing'],
  ['Believers', '/#believers'],
];

export function Nav() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mega, setMega] = React.useState(false);
  const [mobile, setMobile] = React.useState(false);
  const [mobileFeatures, setMobileFeatures] = React.useState(false);
  const navRef = React.useRef<HTMLElement>(null);
  const featuresBtnRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mega-menu on outside click or Escape (keyboard accessibility).
  React.useEffect(() => {
    if (!mega) return;
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setMega(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMega(false); featuresBtnRef.current?.focus(); }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [mega]);

  const closeMobile = () => { setMobile(false); setMobileFeatures(false); };

  return (
    <nav
      ref={navRef}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 60,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: scrolled ? '10px 20px' : '18px 20px', transition: 'padding 300ms var(--ease-out)',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 1160, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '9px 10px 9px 20px', borderRadius: 'var(--radius-pill)',
        background: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.78)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,0.85)',
        boxShadow: scrolled ? '0 12px 34px rgba(45,37,25,0.1)' : '0 6px 22px rgba(45,37,25,0.06)',
        transition: 'background 300ms var(--ease-out), box-shadow 300ms var(--ease-out)',
      }}>
        <Link to="/#hero" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <Mark h={32} />
          <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 21, color: 'var(--navy-900)' }}>
            Harvest<span style={{ color: 'var(--brand)' }}>.</span>
          </span>
        </Link>

        <div style={{ display: 'flex', gap: 26, alignItems: 'center' }} className="nav-links">
          <button
            ref={featuresBtnRef}
            type="button"
            aria-haspopup="true"
            aria-expanded={mega}
            onClick={() => setMega((v) => !v)}
            style={{ ...linkStyle, color: mega ? 'var(--brand)' : 'var(--navy-800)' }}
            onMouseEnter={(e) => { if (!mega) e.currentTarget.style.color = 'var(--brand)'; }}
            onMouseLeave={(e) => { if (!mega) e.currentTarget.style.color = 'var(--navy-800)'; }}
          >
            Features
            <L name="chevron-down" size={13} color="currentColor" style={{ transform: mega ? 'rotate(180deg)' : 'none', transition: 'transform 250ms var(--ease-out)' }} />
          </button>
          {PAGE_LINKS.map(([label, href]) => (
            <Link key={label} to={href} style={linkStyle}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--navy-800)')}>{label}</Link>
          ))}
          <a
            href="https://trello.com/b/1Uz9u1Lb/harvest-roadmap"
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--navy-800)')}
          >
            Roadmap
          </a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Hidden on mobile (see .nav-cta in index.css) — the CTA lives in the
              hamburger menu there, so the sticky header shows it only once. */}
          <span className="nav-cta"><HBtn to="/#pricing" size="sm" variant="dark">Start free trial</HBtn></span>
          <button
            type="button"
            className="nav-hamburger"
            aria-label={mobile ? 'Close menu' : 'Open menu'}
            aria-expanded={mobile}
            onClick={() => setMobile((v) => !v)}
            style={{ alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 12, border: '1px solid rgba(45,37,25,0.12)', background: '#fff', cursor: 'pointer' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--navy-900)" strokeWidth="2" strokeLinecap="round">
              {mobile ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* ---------- Desktop mega-menu (click-to-toggle) ---------- */}
      {mega && (
        <div
          className="nav-mega"
          role="menu"
          aria-label="Features"
          style={{
            width: 'min(1100px, calc(100vw - 40px))', marginTop: 10,
            background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(45,37,25,0.08)', borderRadius: 24,
            boxShadow: '0 40px 90px rgba(12,21,38,0.2)', padding: '26px 30px',
            animation: 'harvestMenuIn 0.28s var(--ease-out) both',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 24 }}>
            {CATALOG.map((g) => (
              <div key={g.name}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: g.tint, marginBottom: 12 }}>{g.name}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {g.items.map((it) => (
                    <Link
                      key={it.title}
                      to={featureHref(it.title)}
                      role="menuitem"
                      onClick={() => setMega(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', margin: '0 -8px', borderRadius: 9, textDecoration: 'none', fontSize: 13, fontWeight: 500, color: 'var(--navy-800)', transition: 'background 150ms' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--stone-100)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <L name={it.icon} size={15} color={g.tint} />
                      <span>{it.title}</span>
                      {it.soon && <span style={soonPill}>SOON</span>}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid rgba(45,37,25,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>30 tools in one platform — from $59/mo</span>
            <Link to="/features" onClick={() => setMega(false)} style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--brand)', textDecoration: 'none' }}>See all features →</Link>
          </div>
        </div>
      )}

      {/* ---------- Mobile panel (accordion) ---------- */}
      {mobile && (
        <div
          style={{
            width: 'calc(100vw - 40px)', maxWidth: 460, marginTop: 10,
            background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(45,37,25,0.08)', borderRadius: 24,
            boxShadow: '0 40px 90px rgba(12,21,38,0.2)', padding: 18,
            maxHeight: 'calc(100vh - 120px)', overflowY: 'auto',
            animation: 'harvestMenuIn 0.28s var(--ease-out) both',
          }}
        >
          {/* Features accordion */}
          <button
            type="button"
            aria-expanded={mobileFeatures}
            onClick={() => setMobileFeatures((v) => !v)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 8px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 600, color: 'var(--navy-900)' }}
          >
            Features
            <L name="chevron-down" size={16} color="currentColor" style={{ transform: mobileFeatures ? 'rotate(180deg)' : 'none', transition: 'transform 250ms var(--ease-out)' }} />
          </button>
          {mobileFeatures && (
            <div style={{ padding: '4px 8px 12px' }}>
              {CATALOG.map((g) => (
                <div key={g.name} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: g.tint, margin: '6px 0 8px' }}>{g.name}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {g.items.map((it) => (
                      <Link key={it.title} to={featureHref(it.title)} onClick={closeMobile}
                        style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 6px', borderRadius: 9, textDecoration: 'none', fontSize: 14, fontWeight: 500, color: 'var(--navy-800)' }}>
                        <L name={it.icon} size={16} color={g.tint} />
                        <span>{it.title}</span>
                        {it.soon && <span style={soonPill}>SOON</span>}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <Link to="/features" onClick={closeMobile} style={{ display: 'inline-block', padding: '6px 8px', fontSize: 14, fontWeight: 600, color: 'var(--brand)', textDecoration: 'none' }}>See all features →</Link>
            </div>
          )}

          {/* Page links — Pillars is intentionally omitted from the mobile menu. */}
          {PAGE_LINKS.filter(([label]) => label !== 'Pillars').map(([label, href]) => (
            <Link key={label} to={href} onClick={closeMobile}
              style={{ display: 'block', padding: '12px 8px', borderTop: '1px solid rgba(45,37,25,0.06)', textDecoration: 'none', fontSize: 16, fontWeight: 600, color: 'var(--navy-900)' }}>{label}</Link>
          ))}
          <a
            href="https://trello.com/b/1Uz9u1Lb/harvest-roadmap"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMobile}
            style={{ display: 'block', padding: '12px 8px', borderTop: '1px solid rgba(45,37,25,0.06)', textDecoration: 'none', fontSize: 16, fontWeight: 600, color: 'var(--navy-900)' }}
          >
            Roadmap
          </a>

          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(45,37,25,0.06)' }}>
            <HBtn to="/#pricing" variant="gold" block onClick={closeMobile}>Start your FREE 7-day trial</HBtn>
          </div>
        </div>
      )}
    </nav>
  );
}
