import React from 'react';
import { Link } from 'react-router-dom';
import { Mark } from './shared';
import { CATEGORIES } from '../content/categories';

/* Footer links resolve to real destinations only. Contact points at the real
   /contact route; the design's legal.html#privacy/terms placeholders stay omitted
   (there is no legal.html in this repo) rather than shipping as dead links. The
   former direct-to-app link now routes to the pricing/trial funnel instead (see
   #27), like every other marketing CTA — no footer link points off-site anymore.
   All targets use react-router <Link>, path-qualified (e.g. /#pricing) so they
   scroll correctly from any route; col() still branches on an http prefix so a
   future external link can drop in as a plain <a> without touching this file. */

const linkCss: React.CSSProperties = { fontSize: 14, color: 'var(--text-body)', textDecoration: 'none' };
const onEnter = (e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'var(--brand)');
const onLeave = (e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'var(--text-body)');

const col = (title: string, links: [string, string][]) => (
  <div>
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: 16 }}>{title}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {links.map(([l, h]) =>
        h.startsWith('http') ? (
          <a key={l} href={h} style={linkCss} onMouseEnter={onEnter} onMouseLeave={onLeave}>{l}</a>
        ) : (
          <Link key={l} to={h} style={linkCss} onMouseEnter={onEnter} onMouseLeave={onLeave}>{l}</Link>
        )
      )}
    </div>
  </div>
);

export function Footer() {
  return (
    <footer style={{ background: 'var(--cream)', padding: '0 20px 28px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', background: '#fff', border: '1px solid rgba(45,37,25,0.07)', borderRadius: 32, padding: 'clamp(32px, 5vw, 56px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 40 }} className="footer-grid">
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
              <Mark h={30} /><span style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 21, color: 'var(--navy-900)' }}>Harvest<span style={{ color: 'var(--brand)' }}>.</span></span>
            </div>
            <p style={{ color: 'var(--text-body)', fontSize: 14.5, lineHeight: 1.6, maxWidth: 300, margin: '0 0 8px' }}>The digital foundation for ministries. From a moment of decision to a lifetime of devotion.</p>
          </div>
          {col('PAGES', [['Home', '/#hero'], ['Features', '/features/community-engagement'], ['Pricing', '/#pricing'], ['Contact', '/contact']])}
          {col('MINISTRY', [['Believers', '/#believers'], ['Affiliate', '/#affiliate'], ['Start free trial', '/#pricing']])}
          {col('RESOURCES', [['Blog', '/blog'], ...CATEGORIES.map((c) => [c.name, `/blog/category/${c.key}`] as [string, string])])}
        </div>
        <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(45,37,25,0.07)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>© {new Date().getFullYear()} Harvest. Built for ministries, by ministries.</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>From Conversion to Devotion</span>
        </div>
      </div>
    </footer>
  );
}
