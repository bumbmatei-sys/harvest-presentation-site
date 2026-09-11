import React from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { Reveal } from '../components/effects';
import { FeatureBlock } from '../components/FeatureBlock';
import { SiteCTA } from '../components/SiteCTA';
import { Hero as SharedHero, PositioningBand, grainOverlay } from '../components/CategoryHero';
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
  return (
    <SharedHero
      dark={!!cat.dark}
      heroBg={cat.heroBg}
      headWidth={cat.headWidth}
      eyebrowColor={cat.eyebrowColor}
      eyebrow={cat.name}
      headline={cat.headline}
      introWidth={cat.introWidth}
      intro={cat.intro}
      secondary={{
        label: cat.secondary.label,
        to: cat.secondary.to.startsWith('#') ? `${categoryHref(cat.slug)}${cat.secondary.to}` : cat.secondary.to,
      }}
    />
  );
}

// ---------- Jump-to index ----------
function FeatureIndex({ cat }: { cat: Category }) {
  return (
    <section style={{ background: 'var(--cream)', padding: '8px 20px 4px' }}>
      <div className="feat-index" style={{ maxWidth: 1140, margin: '0 auto', display: 'grid', gridTemplateColumns: `repeat(${cat.features.length}, 1fr)`, gap: 10 }}>
        {cat.features.map((f) => (
          <Link
            key={f.id}
            to={`${categoryHref(cat.slug)}#${f.id}`}
            className="feat-index-card"
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center',
              padding: '16px 8px', background: '#fff', border: '1px solid rgba(45,37,25,0.08)',
              borderRadius: 16, color: 'var(--navy-900)', textDecoration: 'none',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 10, background: 'var(--gold-100)', color: 'var(--gold-700)', fontFamily: 'var(--font-serif)', fontWeight: 500 }}>{f.n}</span>
            <span style={{ fontSize: 11.5, fontWeight: 600, lineHeight: 1.25 }}>{f.name}</span>
          </Link>
        ))}
      </div>
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
  return (
    <section style={{ position: 'relative', background: 'var(--navy-900)', padding: 'clamp(52px, 6vw, 80px) 24px', overflow: 'hidden' }}>
      <div style={grainOverlay} />
      <div style={{ position: 'relative', maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
        <Reveal y={16}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold-400)' }}>The compounding loop</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(1.7rem, 3vw, 2.4rem)', lineHeight: 1.1, letterSpacing: '-0.02em', color: '#fff', margin: '14px 0 0', textWrap: 'balance' } as React.CSSProperties}>One sermon, working all week.</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 34 }}>
            {LOOP.map((label, i) => (
              <React.Fragment key={label}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 16px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>
                  <span style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold-400)', fontSize: 14 }}>{i + 1}</span>{label}
                </span>
                {i < LOOP.length - 1 && <span style={{ color: 'var(--gold-400)', fontSize: 16 }} aria-hidden="true">→</span>}
              </React.Fragment>
            ))}
          </div>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, fontSize: '1.2rem', color: 'var(--gold-400)', margin: '30px 0 0' }}>Record it once. It works for months.</p>
        </Reveal>
      </div>
    </section>
  );
}

// A category's one bespoke band, keyed by slug — the rest of every page is shared.
function CategoryBand({ slug }: { slug: string }) {
  if (slug === 'discipleship-content') return <CompoundingLoop />;
  if (slug === 'ai-automation') {
    return (
      <PositioningBand
        kicker="Why our AI is different"
        kickerColor="var(--green-300)"
        heading="Every vendor is bolting on AI. Ours knows when to stop."
        body="It answers only from your ministry's own teaching, never a generic model's guess — and after a few questions it points members to Scripture and prayer instead of keeping them talking. Restraint, not just capability."
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
      <div style={{ background: 'var(--cream)', padding: 'clamp(28px, 4vw, 48px) 0 clamp(20px, 3vw, 36px)', display: 'flex', flexDirection: 'column', gap: 'clamp(18px, 2.5vw, 30px)' }}>
        {cat.features.map((f) => <FeatureBlock key={f.id} feature={f} />)}
      </div>
      <CategoryBand slug={cat.slug} />
      <SiteCTA heading={cat.ctaHeading} />
    </main>
  );
}
