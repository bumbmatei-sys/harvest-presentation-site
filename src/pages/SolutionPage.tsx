import React from 'react';
import { Seo } from '../components/Seo';
import { Reveal } from '../components/effects';
import { HBtn } from '../components/magic';
import { Kicker, H2, container, softCard } from '../components/shared';
import { Hero, PositioningBand } from '../components/CategoryHero';
import { FeatureBlock } from '../components/FeatureBlock';
import { FeatureMock, FEATURE_ICONS, MOCKS } from '../components/FeatureMock';
import { SiteCTA } from '../components/SiteCTA';
import { PostRow } from '../components/blog';
import { CATEGORIES, type Feature } from '../content/features';
import { POSTS } from '../content/posts';
import { SOLUTION_PAGES, type SolutionPageContent } from '../content/solutions';

/* /solutions/<slug> — board card 86bbyv8pp.
 *
 * Modelled on ClickUp's Small Business Suite page, adapted: no reviews, logos,
 * stats or customer stories — Harvest has none real to show and none may be
 * invented. Every string on every page is imported from content/solutions.ts,
 * keyed by slug in `SOLUTION_PAGES`; this file is layout only and never reads
 * a page's content export directly, so a section here renders identically for
 * every solution the content file defines.
 *
 * The hero and the navy positioning band are the same components the five
 * /features/* category pages use, pulled out of CategoryPage.tsx into
 * components/CategoryHero.tsx so neither page duplicates the other's markup. */

const FEATURES_BY_ID: Map<string, Feature> = new Map(
  CATEGORIES.flatMap((c) => c.features.map((f) => [f.id, f] as const)),
);

// ---------- One app (tabbed) ----------
function OneAppTabs({ tabs }: { tabs: readonly { id: string; label: string }[] }) {
  const [active, setActive] = React.useState(tabs[0].id);
  const btnRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  const onKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    let next = idx;
    if (e.key === 'ArrowRight') next = (idx + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    const nextId = tabs[next].id;
    setActive(nextId);
    btnRefs.current[nextId]?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Harvest, in one app"
        style={{
          display: 'flex', gap: 8, overflowX: 'auto', WebkitOverflowScrolling: 'touch',
          paddingBottom: 4, scrollbarWidth: 'none', justifyContent: 'center',
        }}
      >
        {tabs.map((t, i) => {
          const on = active === t.id;
          return (
            <button
              key={t.id}
              ref={(el) => { btnRefs.current[t.id] = el; }}
              type="button"
              role="tab"
              id={`solutions-tab-${t.id}`}
              aria-selected={on}
              aria-controls={`solutions-panel-${t.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              style={{
                flexShrink: 0, fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600,
                padding: '10px 18px', borderRadius: 999, cursor: 'pointer', whiteSpace: 'nowrap',
                border: on ? '1px solid var(--navy-900)' : '1px solid rgba(45,37,25,0.14)',
                background: on ? 'var(--navy-900)' : '#fff', color: on ? '#fff' : 'var(--navy-800)',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 26 }}>
        {tabs.map((t) => {
          const feature = FEATURES_BY_ID.get(t.id);
          const on = active === t.id;
          return (
            <div
              key={t.id}
              role="tabpanel"
              id={`solutions-panel-${t.id}`}
              aria-labelledby={`solutions-tab-${t.id}`}
              hidden={!on}
            >
              {feature && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(1.02rem, 1.5vw, 1.18rem)', lineHeight: 1.6, color: 'var(--text-body)', margin: 0 }}>
                    {feature.oneliner}
                  </p>
                  <div style={{ width: '100%', maxWidth: 410, margin: '0 auto', background: '#fff', border: '1px solid rgba(45,37,25,0.10)', borderRadius: 22, boxShadow: '0 30px 66px rgba(12,21,38,0.20)', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid rgba(45,37,25,0.07)', background: 'var(--cream)' }}>
                      <span style={{ width: 9, height: 9, borderRadius: '50%', background: feature.accent, flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 700, color: 'var(--navy-900)' }}>{feature.name}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 600 }}>Harvest</span>
                    </div>
                    <div style={{ padding: '15px 16px 18px', background: 'var(--stone-100)' }}>
                      {/* `groups` renders through FeatureMock's own special case
                          (GroupsMock) rather than a MOCKS[id] entry, so the gate
                          checks both — otherwise the groups tab would render an
                          empty panel even though FeatureMock has content for it. */}
                      {(MOCKS[t.id] || t.id === 'groups') ? <FeatureMock id={t.id} /> : null}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OneApp({ oneApp: c }: { oneApp: SolutionPageContent['oneApp'] }) {
  return (
    <section style={{ background: 'var(--cream)', padding: 'clamp(56px, 8vw, 96px) 24px' }}>
      <div style={{ ...container, textAlign: 'center' }}>
        <Reveal>
          <Kicker>{c.kicker}</Kicker>
          <H2 style={{ margin: '10px 0 0' }}>{c.heading}</H2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(1rem, 1.4vw, 1.12rem)', lineHeight: 1.6, color: 'var(--text-body)', margin: '16px auto 0', maxWidth: 640 }}>{c.sub}</p>
        </Reveal>
        <div style={{ marginTop: 34 }}>
          <OneAppTabs tabs={c.tabs} />
        </div>
      </div>
    </section>
  );
}

// ---------- Numbers (a generic kicker/heading/body/four-tiles section) ----------
function Numbers({ numbers: c }: { numbers: SolutionPageContent['numbers'] }) {
  return (
    <section style={{ background: '#fff', padding: 'clamp(56px, 8vw, 96px) 24px' }}>
      <div style={{ ...container, textAlign: 'center' }}>
        <Reveal>
          <Kicker>{c.kicker}</Kicker>
          <H2 style={{ margin: '10px 0 0' }}>{c.heading}</H2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(1rem, 1.4vw, 1.12rem)', lineHeight: 1.6, color: 'var(--text-body)', margin: '16px auto 0', maxWidth: 640 }}>{c.body}</p>
        </Reveal>
        <div style={{ marginTop: 34, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {c.tiles.map((tile) => (
            <Reveal key={tile.label} style={{ ...softCard, padding: '22px 20px', textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: '1.15rem', color: 'var(--navy-900)' }}>{tile.label}</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: 'var(--text-muted)', marginTop: 6 }}>{tile.body}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- In their pocket ----------
function Pocket({ pocket: c }: { pocket: SolutionPageContent['pocket'] }) {
  return (
    <section style={{ background: 'var(--cream)', padding: 'clamp(56px, 8vw, 96px) 24px' }}>
      <div style={{ ...container, textAlign: 'center' }}>
        <Reveal>
          <Kicker>{c.kicker}</Kicker>
          <H2 style={{ margin: '10px 0 0' }}>{c.heading}</H2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(1rem, 1.4vw, 1.12rem)', lineHeight: 1.6, color: 'var(--text-body)', margin: '16px auto 0', maxWidth: 640 }}>{c.sub}</p>
        </Reveal>
        <div style={{ marginTop: 34, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
          {c.tiles.map((tile) => (
            <Reveal key={tile.id} style={{ ...softCard, padding: '26px 24px', textAlign: 'left' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 12, background: 'var(--gold-100)', color: 'var(--gold-700)' }}>
                {FEATURE_ICONS[tile.id]}
              </span>
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: '1.15rem', color: 'var(--navy-900)', marginTop: 14 }}>{tile.title}</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.55, color: 'var(--text-muted)', marginTop: 8 }}>{tile.body}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Deep dives ----------
function DeepDives({ deepDives }: { deepDives: SolutionPageContent['deepDives'] }) {
  return (
    <>
      {deepDives.map((group) => (
        <section key={group.heading} style={{ background: '#fff', padding: 'clamp(40px, 5vw, 64px) 0 clamp(8px, 1vw, 16px)' }}>
          <div style={{ ...container, textAlign: 'center', marginBottom: 20 }}>
            <Reveal>
              <Kicker>{group.heading}</Kicker>
              <H2 style={{ margin: '10px 0 0' }}>{group.heading}</H2>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(1rem, 1.4vw, 1.12rem)', lineHeight: 1.6, color: 'var(--text-body)', margin: '16px auto 0', maxWidth: 640 }}>{group.sub}</p>
            </Reveal>
          </div>
          <div style={{ background: 'var(--cream)', padding: 'clamp(28px, 4vw, 48px) 0 clamp(20px, 3vw, 36px)', display: 'flex', flexDirection: 'column', gap: 'clamp(18px, 2.5vw, 30px)' }}>
            {group.featureIds.map((id) => {
              const feature = FEATURES_BY_ID.get(id);
              return feature ? <FeatureBlock key={id} feature={feature} /> : null;
            })}
          </div>
        </section>
      ))}
    </>
  );
}

// ---------- Founder note ----------
function FounderNote({ founder: c }: { founder: SolutionPageContent['founder'] }) {
  return (
    <section style={{ background: 'var(--navy-900)', padding: 'clamp(56px, 8vw, 96px) 24px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
        <Reveal>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(1.3rem, 2.6vw, 1.9rem)', lineHeight: 1.4, color: '#fff', margin: 0 }}>
            &ldquo;{c.quote}&rdquo;
          </p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--gold-400)', marginTop: 22 }}>
            {c.attribution}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ---------- Support ----------
function Support({ support: c }: { support: SolutionPageContent['support'] }) {
  return (
    <section style={{ background: '#fff', padding: 'clamp(56px, 8vw, 96px) 24px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
        <Reveal>
          <Kicker>{c.kicker}</Kicker>
          <H2 style={{ margin: '10px 0 0' }}>{c.heading}</H2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(1rem, 1.4vw, 1.12rem)', lineHeight: 1.6, color: 'var(--text-body)', margin: '16px auto 0' }}>{c.body}</p>
          <div style={{ marginTop: 26 }}>
            <HBtn to={c.button.to} size="lg" variant="dark">{c.button.label}</HBtn>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ---------- Recap (three pillars) ----------
function Recap({ pillars }: { pillars: SolutionPageContent['pillars'] }) {
  return (
    <section style={{ background: 'var(--cream)', padding: 'clamp(48px, 6vw, 80px) 24px' }}>
      <div style={{ ...container, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
        {pillars.map((p) => (
          <Reveal key={p.title} style={{ ...softCard, padding: '26px 24px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: '1.3rem', color: 'var(--navy-900)' }}>{p.title}</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.55, color: 'var(--text-muted)', marginTop: 10 }}>{p.body}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ---------- Resources ----------
function Resources({ resources: c }: { resources: SolutionPageContent['resources'] }) {
  const posts = c.slugs.map((slug) => POSTS.find((p) => p.slug === slug)).filter((p): p is NonNullable<typeof p> => !!p);
  return (
    <section style={{ background: '#fff', padding: 'clamp(56px, 8vw, 96px) 24px' }}>
      <div style={{ ...container, maxWidth: 900 }}>
        <Reveal style={{ textAlign: 'center', marginBottom: 26 }}>
          <Kicker>{c.kicker}</Kicker>
        </Reveal>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {posts.map((p) => <PostRow key={p.slug} post={p} />)}
        </div>
      </div>
    </section>
  );
}

export function SolutionPage({ slug }: { slug: string }) {
  const c = SOLUTION_PAGES[slug];
  if (!c) return null;
  return (
    <main>
      <Seo title={c.seo.title} description={c.seo.description} canonical={c.seo.canonical} />
      <Hero
        heroBg="linear-gradient(180deg,#cadff1 0%,#dcebf5 46%,#eef4f3 74%,var(--cream) 100%)"
        headWidth={900}
        eyebrowColor="var(--sky-700)"
        eyebrow={c.hero.eyebrow}
        headline={c.hero.headline}
        introWidth={640}
        intro={c.hero.intro}
        secondary={c.hero.secondary}
        audience={c.hero.audience}
      />
      <OneApp oneApp={c.oneApp} />
      <PositioningBand kicker={c.gap.kicker} kickerColor="var(--gold-400)" heading={c.gap.heading} body={c.gap.body} />
      <Numbers numbers={c.numbers} />
      <Pocket pocket={c.pocket} />
      <DeepDives deepDives={c.deepDives} />
      <FounderNote founder={c.founder} />
      <Support support={c.support} />
      <Recap pillars={c.pillars} />
      <Resources resources={c.resources} />
      <SiteCTA heading={c.finalCta.heading} />
    </main>
  );
}
