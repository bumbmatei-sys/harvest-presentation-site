import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HBtn } from './magic';
import { L } from './icons';
import { Mark } from './shared';
import { CATALOG, CATALOG_TOOL_COUNT, slugify, type CatalogGroup, type CatalogItem } from './catalog';
import { CATEGORIES, CATEGORY_BY_NAME, categoryHref, featureHref as featurePath } from '../content/features';
import { TRIAL_CTA_LABEL } from '../content/legal';
import { CHEAPEST_MONTHLY } from './Pricing';

/* Fixed glass nav with a Features mega-menu.
   Deliberately click-to-toggle (not hover) + keyboard accessible, with a mobile
   accordion fallback — a load-bearing requirement carried over from the existing
   site, not the design's hover behavior.

   Internal targets use react-router <Link> so they work from any route; section
   links are path-qualified (/#pricing) so they scroll on the landing even when
   clicked from a feature page. Each mega-menu item deep-links to its section on
   the category page it belongs to, and each column header opens that page. */

// Menu group names match the category names in content/features.ts. The fallback
// only matters if one is renamed on one side — a wrong link beats a nav that
// throws on every route.
const groupHref = (name: string) => categoryHref((CATEGORY_BY_NAME[name] || CATEGORIES[0]).slug);

/* Where a mega-menu entry goes.
   The five live groups resolve through LEGACY_ANCHORS, which maps a retired
   /features#<slug> URL onto the category page and section that feature moved
   to. The Coming Soon group cannot: an unbuilt feature has no retired URL and
   no section on a live category page, so it carries its destination on the
   entry itself. Falling back to the derived lookup keeps the five unchanged. */
/* Exported so content/features.test.ts can assert on the resolver the menu
   actually uses rather than re-deriving it — the same reason
   `MegaMenuFooterLabel` below is its own export. A test that re-implements the
   lookup passes while the JSX seam sends every visitor somewhere else. */
export const itemHref = (it: CatalogItem) => it.href ?? featurePath(slugify(it.title));
export const columnHref = (g: CatalogGroup) => g.href ?? groupHref(g.name);

/* Inline SOON pill for mega-menu items, sized to sit next to the item title
   rather than absolutely positioned.

   🔴 GREY, NOT SKY. This carried --sky-100 / --sky-700 while nothing in the
   catalogue was marked `soon`, so it never rendered. It renders now, on all
   eight Coming Soon entries, and sky is the LIVE colour of Community &
   Engagement — a badge in another category's brand tint next to an unbuilt
   feature is the opposite of the signal it exists to send. Dashed, because
   dashed already means "not included" in this codebase (an unlit plan chip in
   FeatureBlock). */
const soonPill: React.CSSProperties = {
  background: 'var(--surface-soon)', color: 'var(--text-soon)',
  border: '1px dashed var(--text-soon-soft)', fontSize: 8.5, fontWeight: 700,
  letterSpacing: '0.06em', padding: '2px 6px', borderRadius: 999, lineHeight: 1.4,
};

const linkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: 14.5, fontWeight: 500, color: 'var(--navy-800)',
  textDecoration: 'none', transition: 'color 200ms', display: 'inline-flex', alignItems: 'center',
  gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0,
};

// Landing sections the nav links to. Pillars and Believers are reachable by
// scrolling the landing (and Believers from the footer), so they are out of the
// header on both desktop and mobile.
const PAGE_LINKS: [string, string][] = [
  ['Pricing', '/#pricing'],
];

/** Both Features menus' column list — six headers, each over its own items.
 *
 *  ⚠️ EXPORTED AND SHARED FOR THE SAME REASON `MegaMenuFooterLabel` BELOW IS.
 *  The desktop grid renders only once `mega` state is true and the accordion
 *  only once `mobile` is, and nothing outside a real click can set either in
 *  this repo's DOM-less test runner — so neither menu could be asserted against
 *  rendered markup at all. Pulled out, both can be, which matters here because
 *  the founder's requirement is about ORDER ("leftmost on desktop, first on the
 *  phone") and order is a property of the markup, not of the array.
 *
 *  One component rather than two also makes the ordering claim structural:
 *  both menus map the same `CATALOG` in the same pass, so a category cannot end
 *  up first on one and third on the other. The two variants differ only in
 *  type scale and spacing — the sizes each menu already used. */
export function FeatureMenuColumns({ variant, onNavigate = () => {} }:
  { variant: 'desktop' | 'mobile'; onNavigate?: () => void }) {
  const desktop = variant === 'desktop';
  return (
    <>
      {CATALOG.map((g) => (
        <div key={g.name} style={desktop ? undefined : { marginBottom: 14 }}>
          <Link
            to={columnHref(g)}
            onClick={onNavigate}
            style={{
              display: 'block', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: g.tint, textDecoration: 'none',
              ...(desktop ? { marginBottom: 12 } : { margin: '6px 0 8px' }),
            }}
            onMouseEnter={desktop ? (e) => { e.currentTarget.style.textDecoration = 'underline'; } : undefined}
            onMouseLeave={desktop ? (e) => { e.currentTarget.style.textDecoration = 'none'; } : undefined}
          >
            {g.name}
          </Link>
          <div style={{ display: 'flex', flexDirection: 'column', gap: desktop ? 3 : 2 }}>
            {g.items.map((it) => (
              <Link
                key={it.title}
                to={itemHref(it)}
                role={desktop ? 'menuitem' : undefined}
                onClick={onNavigate}
                style={{
                  display: 'flex', alignItems: 'center', borderRadius: 9, textDecoration: 'none',
                  fontWeight: 500, color: 'var(--navy-800)',
                  ...(desktop
                    ? { gap: 8, padding: '6px 8px', margin: '0 -8px', fontSize: 13, transition: 'background 150ms' }
                    : { gap: 9, padding: '7px 6px', fontSize: 14 }),
                }}
                onMouseEnter={desktop ? (e) => { e.currentTarget.style.background = 'var(--stone-100)'; } : undefined}
                onMouseLeave={desktop ? (e) => { e.currentTarget.style.background = 'transparent'; } : undefined}
              >
                <L name={it.icon} size={desktop ? 15 : 16} color={g.tint} />
                <span>{it.title}</span>
                {it.soon && <span style={soonPill}>SOON</span>}
              </Link>
            ))}
            {g.more && (
              /* 🔴 THE-297 — the "see all" row, drawn only for a group whose
                 `items` are a shortlist. Today that is Coming Soon and only it.

                 NAVIGATION, NOT A CALL TO ACTION. A plain link in the group's
                 own tint, no button ground and no arrow-shaped urgency: it goes
                 to /features/coming-soon, a page that deliberately closes with a
                 note instead of the trial band. Giving it a filled ground would
                 make the one unbuilt column the loudest thing in a menu of
                 shipped work.

                 44px MINIMUM. The items above it are a pointer-first mega-menu
                 at their inherited density; this row is new, so it is built to
                 the tap-target floor in both variants rather than matching them
                 down to it. */
              <Link
                to={g.more.href}
                role={desktop ? 'menuitem' : undefined}
                onClick={onNavigate}
                style={{
                  display: 'flex', alignItems: 'center', minHeight: 44,
                  borderRadius: 9, textDecoration: 'none', color: g.tint,
                  fontWeight: 700, letterSpacing: '0.02em',
                  borderTop: `1px dashed ${g.tint}`, marginTop: 6,
                  ...(desktop
                    ? { gap: 8, padding: '0 8px', margin: '6px -8px 0', fontSize: 12.5 }
                    : { gap: 9, padding: '0 6px', fontSize: 13.5 }),
                }}
                onMouseEnter={desktop ? (e) => { e.currentTarget.style.background = 'var(--stone-100)'; } : undefined}
                onMouseLeave={desktop ? (e) => { e.currentTarget.style.background = 'transparent'; } : undefined}
              >
                <span>{g.more.label}</span>
              </Link>
            )}
          </div>
        </div>
      ))}
    </>
  );
}

/** The mega-menu footer's price and tool-count claim, split out into its own
 *  component so a test can render it with `renderToStaticMarkup` directly —
 *  the footer otherwise only exists once `mega` state is true, which nothing
 *  outside a real click can set in this repo's DOM-less test runner. Same
 *  reason `PlanCard` is its own exported component in Pricing.tsx. */
export function MegaMenuFooterLabel() {
  return <>{`${CATALOG_TOOL_COUNT} tools in one platform — from $${CHEAPEST_MONTHLY}/mo`}</>;
}

export function Nav() {
  const { pathname } = useLocation();
  // The only nav item with an active state — every blog route lives under /blog.
  const onBlog = pathname === '/blog' || pathname.startsWith('/blog/');
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
          <Link
            to="/blog"
            style={{ ...linkStyle, color: onBlog ? 'var(--brand)' : 'var(--navy-800)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = onBlog ? 'var(--brand)' : 'var(--navy-800)')}
          >
            Resources
          </Link>
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
            width: 'min(1180px, calc(100vw - 40px))', marginTop: 10,
            background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(45,37,25,0.08)', borderRadius: 24,
            boxShadow: '0 40px 90px rgba(12,21,38,0.2)', padding: '26px 30px',
            /* 🔴 The desktop panel had no height cap and could run off the
               bottom of a short window with no way to reach what it hid. The
               mobile panel below has always capped and scrolled; this is the
               same rule, and it is needed here now that a sixth column makes
               the panel taller — measured at 696px against a 600px-tall window
               at 1024 wide, and 816px against 700px at 901 wide, where six
               groups wrap onto two rows. */
            maxHeight: 'calc(100vh - 120px)', overflowY: 'auto',
            animation: 'harvestMenuIn 0.28s var(--ease-out) both',
          }}
        >
          {/* Six columns since THE-247, but deliberately NOT a fixed
              six-track grid.
              🔴 A bare `1fr` column has an implicit min-width of `auto`: it
              refuses to shrink below its content and overflows the panel
              instead. Forcing six fixed columns left "Documentation" about 2px
              of slack at 901px — the narrowest width this menu ever renders at,
              since `.nav-links` is display:none below 900 — against roughly
              32px for the five live columns before the change. That is the
              shape of the 41px overflow this site has already been bitten by.
              `auto-fit` + `minmax` cannot overflow by construction: it lays
              down as many >=136px tracks as fit and wraps the rest onto a
              second row. Six across at 1024 and up, five at 901. */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(136px, 1fr))', gap: 18 }}>
            <FeatureMenuColumns variant="desktop" onNavigate={() => setMega(false)} />
          </div>
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid rgba(45,37,25,0.07)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}><MegaMenuFooterLabel /></span>
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
              <FeatureMenuColumns variant="mobile" onNavigate={closeMobile} />
            </div>
          )}

          {PAGE_LINKS.map(([label, href]) => (
            <Link key={label} to={href} onClick={closeMobile}
              style={{ display: 'block', padding: '12px 8px', borderTop: '1px solid rgba(45,37,25,0.06)', textDecoration: 'none', fontSize: 16, fontWeight: 600, color: 'var(--navy-900)' }}>{label}</Link>
          ))}
          <Link
            to="/blog"
            onClick={closeMobile}
            style={{ display: 'block', padding: '12px 8px', borderTop: '1px solid rgba(45,37,25,0.06)', textDecoration: 'none', fontSize: 16, fontWeight: 600, color: onBlog ? 'var(--brand)' : 'var(--navy-900)' }}
          >
            Resources
          </Link>

          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(45,37,25,0.06)' }}>
            <HBtn to="/#pricing" variant="gold" block onClick={closeMobile}>{TRIAL_CTA_LABEL}</HBtn>
          </div>
        </div>
      )}
    </nav>
  );
}
