import React from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { Reveal } from '../components/effects';
import { FeatureBlock } from '../components/FeatureBlock';
import { SiteCTA } from '../components/SiteCTA';
import { PositioningBand } from '../components/CategoryHero';
import { CATEGORY_BY_SLUG, categoryHref, type Category } from '../content/features';
import { CUSTOM_DOMAIN_MARKETING_ENABLED } from '../lib/flags';

/* One page per feature category — /features/community-engagement and friends.
   Ported from the Claude Design handoff (one .dc.html per category); the shared
   feature card lives in components/FeatureBlock.tsx and the copy in
   content/features.ts. Hero top padding clears the fixed nav, which the design
   canvas did not have.

   The hero and the navy positioning band live in components/CategoryHero.tsx,
   shared with /solutions/evangelistic-organizations — see the note there. */

// ---------- Hero ----------
function Hero({ cat }: { cat: Category }) {
  const lines = cat.headline.split('\n');
  const secondary = cat.secondary.to.startsWith('#') ? `${categoryHref(cat.slug)}${cat.secondary.to}` : cat.secondary.to;
  return <section className="fab-category-hero"><div className="fab-container"><Reveal><div className="fab-header"><div><span className="fab-pill">{cat.name}</span><h1>{lines.map((line, i) => <React.Fragment key={i}>{i > 0 && <br />}<span className={i === lines.length - 1 && lines.length > 1 ? 'fab-muted' : undefined}>{line}</span></React.Fragment>)}</h1></div><p>{cat.intro}</p></div><div className="fab-category-actions"><Link className="hero-primary" to="/#pricing">Start free trial</Link><Link className="hero-secondary" to={secondary}>{cat.secondary.label}</Link></div></Reveal></div></section>;
}

function FeatureIndex({ cat }: { cat: Category }) {
  const [activeId, setActiveId] = React.useState(cat.features[0]?.id);
  React.useEffect(() => {
    setActiveId(cat.features[0]?.id);
    const visible = new Set<string>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });
      const intersecting = cat.features.filter((feature) => visible.has(feature.id));
      const current = intersecting[intersecting.length - 1];
      if (current) setActiveId(current.id);
    }, { rootMargin: '-104px 0px -55% 0px', threshold: 0 });
    cat.features.forEach((feature) => {
      const element = document.getElementById(feature.id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [cat]);

  const activeIndex = Math.max(0, cat.features.findIndex((feature) => feature.id === activeId));
  const move = (offset: number) => {
    const feature = cat.features[activeIndex + offset];
    if (!feature) return;
    setActiveId(feature.id);
    document.getElementById(feature.id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  };
  return (
    <section className="fab-index-wrap">
      <nav aria-label="Jump to feature" className="feat-index fab-index">
        <button className="fab-index-arrow" type="button" aria-label="Previous feature" disabled={activeIndex === 0} onClick={() => move(-1)}>←</button>
        <ul className="fab-index-list">{cat.features.map((f) => <li key={f.id} className={f.id === activeId ? 'fab-index-item-active' : undefined}><Link to={`${categoryHref(cat.slug)}#${f.id}`} className="feat-index-card fab-index-card" aria-current={f.id === activeId ? 'location' : undefined} onClick={() => setActiveId(f.id)}>{f.name}</Link></li>)}</ul>
        <button className="fab-index-arrow" type="button" aria-label="Next feature" disabled={activeIndex === cat.features.length - 1} onClick={() => move(1)}>→</button>
      </nav>
    </section>
  );
}

const LOOP = [
  'Record a sermon',
  'AI drafts a course lesson',
  'The recap feeds your knowledge base',
  'It writes SEO articles',
  'Visitors find you — and become members',
];

function CompoundingLoop() {
  return <section className="fab-band"><Reveal><span className="fab-pill">The compounding loop</span><h2>One sermon, working all week.</h2><div className="fab-loop">{LOOP.map((label, i) => <React.Fragment key={label}><span>{i + 1} {label}</span>{i < LOOP.length - 1 && <span aria-hidden="true">→</span>}</React.Fragment>)}</div><p>Record it once. It works for months.</p></Reveal></section>;
}

// A category's one bespoke band, keyed by slug — the rest of every page is shared.
function CategoryBand({ slug }: { slug: string }) {
  if (slug === 'discipleship-content') return <CompoundingLoop />;
  if (slug === 'ai-automation') {
    return (
      <PositioningBand
        kicker="Why our AI is different"
        kickerColor="var(--green-300)"
        heading="Every vendor is bolting on AI. Ours starts from your teaching."
        body="The AI assistant, coming soon, is for the plan owner and will work from your ministry's own knowledge base instead of the open internet."
      />
    );
  }
  if (slug === 'platform-brand') {
    return (
      <PositioningBand
        kicker="The whole point"
        kickerColor="var(--gold-400)"
        heading="Nobody knows it's Harvest. That's the idea."
        /* 🔴 THE-280 — "visit your domain" was a PRESENT-TENSE claim that
           pointing a domain you own at Harvest works, in the one band on this
           page written as what a member already experiences. It never worked:
           the Vercel subscription behind it was never bought, so the DNS a
           church was handed pointed nowhere.

           ⚠️ THE ONLY CLAIM REMOVED IS THAT ONE. The name, the icon and the
           receipts on your letterhead all ship on the Ministry plan and are
           untouched — this band still says the platform disappears, because it
           does. Behind the flag rather than deleted, per the "nothing is
           deleted" contract at the top of lib/flags.ts. */
        body={CUSTOM_DOMAIN_MARKETING_ENABLED
          ? "Your members install an app with your name and icon, visit your domain, and keep receipts on your letterhead. Your volunteers see only their part. The platform disappears — what's left is your ministry."
          : "Your members install an app with your name and icon, and keep receipts on your letterhead. Your volunteers see only their part. The platform disappears — what's left is your ministry."}
      />
    );
  }
  return null;
}

export function CategoryPage({ slug }: { slug: string }) {
  const cat = CATEGORY_BY_SLUG[slug];
  if (!cat) return null;
  return (
    <main>
      <Seo
        title={`${cat.name} — Harvest`}
        description={cat.seo}
        canonical={`https://theharvest.site${categoryHref(cat.slug)}`}
      />
      <Hero cat={cat} />
      <FeatureIndex cat={cat} />
      <div className="fab-block-list" style={{ background: 'var(--cream)', padding: 'clamp(28px, 4vw, 48px) 0 clamp(20px, 3vw, 36px)', display: 'flex', flexDirection: 'column', gap: 'clamp(18px, 2.5vw, 30px)' }}>
        {cat.features.map((f) => <FeatureBlock key={f.id} feature={f} />)}
      </div>
      <CategoryBand slug={cat.slug} />
      <SiteCTA heading={cat.ctaHeading} />
    </main>
  );
}
