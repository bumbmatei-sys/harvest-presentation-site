import React from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from './effects';
import { FeatureMock, FEATURE_ICONS } from './FeatureMock';
import type { Feature } from '../content/features';
import { plans } from './Pricing';

/* One feature per card: story on the left, a vignette of the real UI on the
   right, then what admins and members each get. Ported from the Claude Design
   handoff (FeatureBlock.dc.html, `card` layout — the one the category pages use). */

/* Derived from the pricing plans rather than restated, so a renamed or removed
   tier can't leave these chips advertising a plan nobody can buy. Every
   `Feature.tiers` array is positional against this list and must match its
   length — `assertTierWidths` in content/features.ts enforces that. */
const PLANS = plans.map((p) => p.name);

const check = (
  <svg width="17" height="17" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 2, color: 'var(--brand)' }} aria-hidden="true">
    <path d="M5 10l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* 🔴 A TICK MEANS "YOU GET THIS", which is true on a category page and false on
   a page about work nobody has built. The unbuilt variant swaps it for the
   dashed square ComingSoonBlock and SoonMock already use for the same idea — a
   vocabulary a reader of this site has been taught elsewhere, rather than a new
   one invented here. */
const notYet = (
  <span aria-hidden="true" style={{ width: 11, height: 11, marginTop: 5, flexShrink: 0, border: '1px dashed var(--text-soon-soft)', borderRadius: 3 }} />
);

function CapList({ label, items, accent, unbuilt }: { label: string; items: string[]; accent: string; unbuilt?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: accent, marginBottom: 14 }}>{label}</div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
        {items.map((cap) => (
          <li key={cap} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            {unbuilt ? notYet : check}
            <span style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text-body)' }}>{cap}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlanChips({ tiers, note, accent }: { tiers: number[]; note?: string; accent: string }) {
  return (
    <div style={{ marginTop: 26 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Available on</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {PLANS.map((name, i) => {
          const on = !!tiers[i];
          return (
            <span
              key={name}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999,
                fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap',
                ...(on
                  ? { color: '#fff', background: 'var(--navy-900)' }
                  : { color: 'var(--text-muted)', background: 'transparent', border: '1px dashed rgba(45,37,25,0.18)' }),
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: on ? 'var(--gold-400)' : 'var(--stone-300)' }} />
              {name}
            </span>
          );
        })}
      </div>
      {/* Every chip lit can overstate a feature whose branding or limits are
          tier-gated — the qualifier says which part is. */}
      {note && (
        <p style={{ display: 'flex', gap: 8, alignItems: 'flex-start', margin: '12px 0 0', fontSize: 12.5, lineHeight: 1.5, color: 'var(--text-body)', maxWidth: '46ch' }}>
          <span aria-hidden="true" style={{ color: accent, fontWeight: 700, flexShrink: 0 }}>*</span>
          {note}
        </p>
      )}
    </div>
  );
}

/**
 * What `FeatureBlock` actually reads. `Feature` satisfies it, so every category
 * page passes one unchanged — but the two fields a live feature must have and an
 * unbuilt one cannot are optional here: `n` is the ordinal a jump-to index
 * prints, and `tiers` is plan availability, which is a claim nothing on
 * /features/harvest-scheduler is allowed to make.
 */
export type FeatureBlockData = Omit<Feature, 'n' | 'tiers'> & { n?: string; tiers?: number[] };

/**
 * One feature, drawn the way the five live category pages draw one.
 *
 * ─── 🔴 THE-293 — `unbuilt`, AND WHY IT IS A FLAG RATHER THAN A SECOND COMPONENT
 *
 * The founder's complaint about /features/harvest-scheduler was that its six
 * capabilities were six identical grey cards while "the other category pages"
 * give each feature a design of its own. The fix is to draw them through THIS
 * component — a lookalike would drift from it within a ticket or two, which is
 * the whole reason the category pages share one block in the first place.
 *
 * ⚠️ WHAT THE FLAG TURNS OFF IS THE SALES FURNITURE, AND ONLY THAT. Three
 * things on a live block are claims an unbuilt feature cannot make, and each is
 * forbidden by a test that predates this one:
 *
 *   · PLAN CHIPS name the four tiers and are headed "Available on" — a tier
 *     claim and an availability claim, both of which `schedulerContract` throws
 *     on at module scope.
 *   · CROSSLINKS are routes, and the scheduler page's outbound links are pinned
 *     to exactly two — /contact and the Coming Soon list.
 *   · THE TICK means "you get this". It becomes the dashed square instead.
 *
 * And one thing it turns ON: the vignette's tab label, which reads "Harvest" on
 * a live page because that is the app you are looking at. On an unbuilt one it
 * says so instead, in the markup, so the disclaimer travels with the picture
 * rather than sitting in a caption somebody can crop away — the property
 * SoonMock's frame already had and this must not lose.
 *
 * ⚠️ DEFAULT OFF, so the five live category pages render byte-for-byte what
 * they rendered before. That is asserted, not assumed: the-278's fingerprint
 * table pins all five.
 */
export function FeatureBlock({ feature, unbuilt = false }: { feature: FeatureBlockData; unbuilt?: boolean }) {
  const { accent, accentBg } = feature;
  return (
    <div id={feature.id} style={{ scrollMarginTop: 104 }}>
      <div style={{ padding: '0 20px 26px', position: 'relative' }}>
        <Reveal y={22} style={{
          maxWidth: 1140, margin: '0 auto', position: 'relative', background: '#fff',
          border: '1px solid rgba(45,37,25,0.09)', borderRadius: 28,
          padding: 'clamp(26px, 3.5vw, 52px)', boxShadow: '0 26px 64px rgba(45,37,25,0.07)',
        }}>
          <div className="fb-grid" style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 'clamp(28px, 4vw, 64px)', alignItems: 'center' }}>
            {/* ---- Story ---- */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 42, borderRadius: 12, background: accentBg, color: accent, flexShrink: 0 }}>
                  {FEATURE_ICONS[feature.id]}
                </span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: accent }}>{feature.eyebrow}</span>
              </div>

              <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(1.85rem, 3.4vw, 2.75rem)', lineHeight: 1.08, letterSpacing: '-0.02em', color: 'var(--navy-900)', margin: 0 }}>{feature.title}</h2>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1.06rem', lineHeight: 1.6, color: 'var(--text-body)', margin: '16px 0 0', maxWidth: '46ch' }}>{feature.oneliner}</p>

              {/* The emotional beat — the line the feature is really about. */}
              <div style={{ marginTop: 26, paddingLeft: 20, borderLeft: `3px solid ${accent}` }}>
                <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(1.3rem, 2vw, 1.65rem)', lineHeight: 1.32, letterSpacing: '-0.01em', color: 'var(--navy-900)', margin: 0 }}>{feature.moment}</p>
              </div>

              {!unbuilt && feature.tiers && (
                <PlanChips tiers={feature.tiers} note={feature.tiersNote} accent={accent} />
              )}
            </div>

            {/* ---- Vignette ---- */}
            <div>
              <div style={{ width: '100%', maxWidth: 410, margin: '0 auto', background: '#fff', border: '1px solid rgba(45,37,25,0.10)', borderRadius: 22, boxShadow: '0 30px 66px rgba(12,21,38,0.20)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid rgba(45,37,25,0.07)', background: 'var(--cream)' }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: accent, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 700, color: 'var(--navy-900)' }}>{feature.name}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 600 }}>{unbuilt ? 'Concept — nothing built' : 'Harvest'}</span>
                </div>
                <div style={{ padding: '15px 16px 18px', background: 'var(--stone-100)' }}>
                  <FeatureMock id={feature.id} />
                </div>
              </div>
            </div>
          </div>

          {/* ---- What each side gets ---- */}
          <div className="fb-caps" style={{ marginTop: 'clamp(30px, 4vw, 52px)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(20px, 3vw, 40px)' }}>
            <CapList label={feature.adminLabel || 'For admins'} items={feature.admin} accent={accent} unbuilt={unbuilt} />
            <CapList label={feature.memberLabel || 'For members'} items={feature.member} accent={accent} unbuilt={unbuilt} />
          </div>

          {!unbuilt && feature.crosslinks && feature.crosslinks.length > 0 && (
            <div style={{ marginTop: 22, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)' }}>Works with</span>
              {feature.crosslinks.map((cl) => (
                <Link
                  key={cl.href}
                  to={cl.href}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600,
                    color: 'var(--navy-900)', background: 'var(--cream)', border: '1px solid rgba(45,37,25,0.10)',
                    borderRadius: 999, padding: '6px 13px', textDecoration: 'none', transition: 'border-color 200ms var(--ease-out)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(45,37,25,0.10)'; }}
                >
                  {cl.label}<span style={{ color: accent }}>→</span>
                </Link>
              ))}
            </div>
          )}
        </Reveal>
      </div>
    </div>
  );
}
