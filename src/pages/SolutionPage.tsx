import React from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Scene, SectionHeading } from '../components/marketing';
import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { Reveal } from '../components/effects';
import { HBtn } from '../components/magic';

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
        className="marketing-tabs marketing-solution-tabs"
      >
        {tabs.map((t, i) => {
          const on = active === t.id;
          return (
            <Button
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
              className="marketing-tab"
            >
              {t.label}
            </Button>
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
                <Card className="marketing-solution-panel">
                  <div className="marketing-solution-panel-copy"><h3>{feature.name}</h3><p>{feature.oneliner}</p></div>
                  <Scene src="usecase-wheat-field-evening"><div className="fab-glass fab-mock">
                    <div className="fab-mock-bar"><span>{feature.name}</span><span>Harvest</span></div>
                    <div className="fab-mock-content">{(MOCKS[t.id] || t.id === 'groups') ? <FeatureMock id={t.id} /> : null}</div>
                  </div></Scene>
                </Card>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OneApp({ oneApp: c }: { oneApp: SolutionPageContent['oneApp'] }) {
  return <section className="marketing-section"><div className="fab-container">
    <SectionHeading eyebrow={c.kicker} title={c.heading} description={c.sub} />
    <OneAppTabs tabs={c.tabs} />
  </div></section>;
}

// ---------- Numbers (a generic kicker/heading/body/four-tiles section) ----------
function Numbers({ numbers: c }: { numbers: SolutionPageContent['numbers'] }) {
  return <section className="marketing-section"><div className="fab-container">
    <SectionHeading eyebrow={c.kicker} title={c.heading} description={c.body} />
    <div className="marketing-number-grid">{c.tiles.map((tile) => <Reveal key={tile.label}><Card className="marketing-number-card"><h3>{tile.label}</h3><p>{tile.body}</p></Card></Reveal>)}</div>
  </div></section>;
}

// ---------- In their pocket ----------
function Pocket({ pocket: c }: { pocket: SolutionPageContent['pocket'] }) {
  return <section className="marketing-section"><div className="fab-container">
    <SectionHeading eyebrow={c.kicker} title={c.heading} description={c.sub} />
    <div className="marketing-pocket-grid">{c.tiles.map((tile, i) => <Reveal key={tile.id}><Card className="marketing-pocket-card">
      <Scene src={i % 2 ? 'feature-2-wheat-dusk' : 'feature-1-wheat-closeup'}><span className="marketing-pocket-icon">{FEATURE_ICONS[tile.id]}</span></Scene>
      <div><h3>{tile.title}</h3><p>{tile.body}</p></div>
    </Card></Reveal>)}</div>
  </div></section>;
}

// ---------- Deep dives ----------
function DeepDives({ deepDives }: { deepDives: SolutionPageContent['deepDives'] }) {
  return <>{deepDives.map((group) => <section key={group.heading} className="marketing-section">
    <div className="fab-container"><SectionHeading eyebrow={group.heading} title={group.heading} description={group.sub} /></div>
    <div className="marketing-deep-dives">{group.featureIds.map((id) => { const feature = FEATURES_BY_ID.get(id); return feature ? <FeatureBlock key={id} feature={feature} /> : null; })}</div>
  </section>)}</>;
}

// ---------- Founder note ----------
function FounderNote({ founder: c }: { founder: SolutionPageContent['founder'] }) {
  return <section className="marketing-section"><div className="fab-container"><Card className="marketing-founder-note"><Reveal>
    <blockquote>&ldquo;{c.quote}&rdquo;</blockquote><p>{c.attribution}</p>
  </Reveal></Card></div></section>;
}

// ---------- Support ----------
function Support({ support: c }: { support: SolutionPageContent['support'] }) {
  return <section className="marketing-section"><div className="fab-container marketing-support">
    <SectionHeading eyebrow={c.kicker} title={c.heading} description={c.body} />
    <HBtn to={c.button.to} size="lg" variant="dark">{c.button.label}</HBtn>
  </div></section>;
}

// ---------- Recap (three pillars) ----------
function Recap({ pillars }: { pillars: SolutionPageContent['pillars'] }) {
  return <section className="marketing-section"><div className="fab-container marketing-recap-grid">{pillars.map((p) => <Reveal key={p.title}><Card className="marketing-recap-card"><h3>{p.title}</h3><p>{p.body}</p></Card></Reveal>)}</div></section>;
}

// ---------- Resources ----------
function Resources({ resources: c }: { resources: SolutionPageContent['resources'] }) {
  const posts = c.slugs.map((slug) => POSTS.find((p) => p.slug === slug)).filter((p): p is NonNullable<typeof p> => !!p);
  return <section className="marketing-section"><div className="fab-container">
    <span className="fab-pill">{c.kicker}</span>
    <div className="marketing-post-grid">{posts.map((p) => <PostRow key={p.slug} post={p} />)}</div>
  </div></section>;
}

export function SolutionPage({ slug }: { slug: string }) {
  const c = SOLUTION_PAGES[slug];
  if (!c) return null;
  return (
    <main className="marketing-solution">
      <Seo title={c.seo.title} description={c.seo.description} canonical={c.seo.canonical} />
      <Hero
        heroBg="var(--background)"
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
      {c.scheduler && <section className="fab-container marketing-scheduler-link">
        <h2>{c.scheduler.heading}</h2>
        <p>{c.scheduler.body}</p>
        <Link to="/features/harvest-scheduler">Social Scheduler →</Link>
      </section>}
      <FounderNote founder={c.founder} />
      <Support support={c.support} />
      <Recap pillars={c.pillars} />
      <Resources resources={c.resources} />
      <SiteCTA heading={c.finalCta.heading} />
    </main>
  );
}
