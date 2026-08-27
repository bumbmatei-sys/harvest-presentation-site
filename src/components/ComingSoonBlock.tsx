import React from 'react';
import { Reveal } from './effects';
import { SoonMock, SoonIcon, SKETCH_GROUND } from './SoonMock';
import { NOT_BUILT_LABEL, type SoonItem } from '../content/coming-soon';

/* One card per unbuilt item on /features/coming-soon.
 *
 * Laid out to match components/FeatureBlock.tsx — same 1140px card, same
 * `fb-grid` and `fb-caps` class names so the existing responsive rules in
 * index.css collapse it at 900px identically, same rhythm of eyebrow, heading,
 * one-liner and a bordered beat. A church moving between /features/giving-finance
 * and this page should feel one site, which is what the founder asked for.
 *
 * 🔴 THE THREE THINGS IT DELIBERATELY DOES NOT RENDER, each of which
 * FeatureBlock does:
 *
 *   1. NO PLAN CHIPS. FeatureBlock draws an "Available on" row of Individual /
 *      Small Team / Ministry chips from `feature.tiers`. `SoonItem` has no
 *      `tiers` field to draw from, and there is no chip row here. An unbuilt
 *      feature has no tier, and a dashed chip would say "not on this plan",
 *      which is a claim that it is on some other one.
 *   2. NO CHECK MARKS. FeatureBlock's capability lists lead each line with a
 *      gold ✓. A tick means "you get this". The considering list leads with a
 *      dashed grey square instead — the same dashed vocabulary the sketch and
 *      an unlit plan chip already use for "not included".
 *   3. NO CROSSLINKS INTO THE PAID PAGES. FeatureBlock ends with "Works with"
 *      chips linking to other features. From an unbuilt item those would read
 *      as an integration that exists.
 *
 * Every colour is one of the grey tokens. The five live category pages pass an
 * `accent` per feature; nothing here takes one, so no coming-soon card can be
 * given a category tint by a later edit without changing this signature. */

const INK = 'var(--text-soon)';
const INK_SOFT = 'var(--text-soon-soft)';

/** The blunt status row: what it is not, and the open card it traces to. */
function StatusRow({ item }: { item: SoonItem }) {
  return (
    <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 13px', borderRadius: 999,
        border: `1px dashed ${INK_SOFT}`, color: INK, fontSize: 12.5, fontWeight: 700,
        letterSpacing: '0.02em', whiteSpace: 'nowrap',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, border: `1px solid ${INK}` }} />
        {NOT_BUILT_LABEL}
      </span>
      <span style={{ fontSize: 12.5, color: INK, fontWeight: 600 }}>
        {item.stage === 'Blocked' ? `Blocked on ${item.blockedBy}` : 'Planned — not started'}
      </span>
    </div>
  );
}

export function ComingSoonBlock({ item }: { item: SoonItem }) {
  return (
    <div id={item.id} style={{ scrollMarginTop: 104 }}>
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
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 42,
                  borderRadius: 12, background: 'var(--surface-soon)', border: `1px dashed ${INK_SOFT}`,
                  color: INK, flexShrink: 0,
                }}>
                  <SoonIcon name={item.icon} />
                </span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: INK }}>{item.eyebrow}</span>
              </div>

              <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(1.85rem, 3.4vw, 2.75rem)', lineHeight: 1.08, letterSpacing: '-0.02em', color: 'var(--navy-900)', margin: 0 }}>{item.title}</h2>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1.06rem', lineHeight: 1.6, color: 'var(--text-body)', margin: '16px 0 0', maxWidth: '46ch' }}>{item.oneliner}</p>

              {/* The honest beat. FeatureBlock puts the emotional line here in a
                  serif italic behind a solid accent rule; this puts what a
                  church has TODAY behind a dashed grey one. Same slot, opposite
                  job — that paragraph is the reason the page is not a promise. */}
              <div style={{ marginTop: 26, paddingLeft: 20, borderLeft: `3px dashed ${INK_SOFT}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: INK, marginBottom: 9 }}>Today</div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.99rem', lineHeight: 1.6, color: 'var(--text-body)', margin: 0, maxWidth: '52ch' }}>{item.today}</p>
              </div>

              <StatusRow item={item} />
            </div>

            {/* ---- Concept sketch (see the header comment in SoonMock.tsx) ---- */}
            <div>
              <div style={{
                width: '100%', maxWidth: 410, margin: '0 auto', background: '#fff',
                border: `1px dashed ${INK_SOFT}`, borderRadius: 22, overflow: 'hidden',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: `1px dashed ${INK_SOFT}`, background: 'var(--surface-soon)' }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, border: `1px solid ${INK_SOFT}` }} />
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 700, color: INK }}>{item.name}</span>
                  {/* The disclaimer travels with the picture, not in a caption
                      under it — a cropped screenshot of this frame still says
                      what it is. */}
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: INK, fontWeight: 600, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>Concept sketch — nothing built</span>
                </div>
                <div style={{ ...SKETCH_GROUND, padding: '15px 16px 18px' }}>
                  <SoonMock id={item.id} />
                </div>
              </div>
            </div>
          </div>

          {/* ---- What is being considered, and what this is not ---- */}
          <div
            className="fb-caps"
            style={{
              marginTop: 'clamp(30px, 4vw, 52px)', display: 'grid',
              gridTemplateColumns: item.notThis ? '1fr 1fr' : '1fr',
              gap: 'clamp(20px, 3vw, 40px)',
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: INK, marginBottom: 14 }}>Under consideration — not committed</div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
                {item.considering.map((line) => (
                  <li key={line} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    {/* Not a tick. A tick would mean "you get this". */}
                    <span aria-hidden="true" style={{ width: 11, height: 11, marginTop: 5, flexShrink: 0, border: `1px dashed ${INK_SOFT}`, borderRadius: 3 }} />
                    <span style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text-body)' }}>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            {item.notThis && (
              <div style={{ background: 'var(--surface-soon)', border: `1px dashed ${INK_SOFT}`, borderRadius: 16, padding: '18px 20px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: INK, marginBottom: 10 }}>Not to be confused with</div>
                <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--text-body)', margin: 0 }}>{item.notThis}</p>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
