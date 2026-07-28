import React from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { Reveal } from '../components/effects';
import { AnimatedText, HBtn } from '../components/magic';
import { FeatureBlock } from '../components/FeatureBlock';
import { SiteCTA } from '../components/SiteCTA';
import { CATEGORY_BY_SLUG, categoryHref, type Category } from '../content/features';

/* One page per feature category — /features/community-engagement and friends.
   Ported from the Claude Design handoff (one .dc.html per category); the shared
   feature card lives in components/FeatureBlock.tsx and the copy in
   content/features.ts. Hero top padding clears the fixed nav, which the design
   canvas did not have. */

const grainOverlay: React.CSSProperties = {
  position: 'absolute', inset: 0, backgroundImage: 'var(--grain-url)', backgroundSize: '200px',
  opacity: 0.06, mixBlendMode: 'overlay', pointerEvents: 'none',
};

// ---------- Hero ----------
function Hero({ cat }: { cat: Category }) {
  const dark = !!cat.dark;
  return (
    <section
      style={{
        position: 'relative', background: cat.heroBg, overflow: 'hidden',
        paddingLeft: 24, paddingRight: 24,
        paddingTop: dark ? 'clamp(148px, calc(8vw + 84px), 188px)' : 'clamp(144px, calc(7vw + 84px), 180px)',
        paddingBottom: dark ? 'clamp(72px, 9vw, 110px)' : 'clamp(40px, 5vw, 64px)',
      }}
    >
      {dark && <div style={{ ...grainOverlay, opacity: 0.07 }} />}
      {dark && (
        <div style={{ position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)', width: 520, height: 420, background: 'radial-gradient(circle, rgba(229,182,92,0.22), transparent 70%)', filter: 'blur(24px)', pointerEvents: 'none' }} />
      )}
      <div style={{ position: 'relative', maxWidth: cat.headWidth, margin: '0 auto', textAlign: 'center' }}>
        <Reveal y={14}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: cat.eyebrowColor }}>{cat.name}</span>
        </Reveal>
        <AnimatedText
          as="h1"
          text={cat.headline}
          startOnView={false}
          delay={120}
          stagger={80}
          y={20}
          duration={780}
          style={{
            fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            lineHeight: 1.04, letterSpacing: '-0.025em', color: dark ? '#fff' : 'var(--navy-900)',
            margin: '18px 0 0', textWrap: 'balance',
          } as React.CSSProperties}
        />
        <Reveal delay={420} y={16}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(1.02rem, 1.5vw, 1.2rem)', lineHeight: 1.6, color: dark ? 'rgba(255,255,255,0.72)' : 'var(--text-body)', margin: '20px auto 0', maxWidth: cat.introWidth }}>{cat.intro}</p>
        </Reveal>
        <Reveal delay={560} y={16}>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12, marginTop: 30 }}>
            <HBtn to="/#pricing" size="lg" variant={dark ? 'gold' : 'dark'}>Start free trial</HBtn>
            <HBtn
              to={cat.secondary.to.startsWith('#') ? `${categoryHref(cat.slug)}${cat.secondary.to}` : cat.secondary.to}
              size="lg"
              variant="light"
            >
              {cat.secondary.label}
            </HBtn>
          </div>
        </Reveal>
      </div>
    </section>
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

// ---------- Giving & Finance: what a percentage platform costs ----------
const fmt = (n: number) => '$' + Math.round(n).toLocaleString('en-US');
const MINISTRY_YEAR = 479 * 12;

function KeepCalculator() {
  const [giving, setGiving] = React.useState(200000);
  const save5 = giving * 0.05;
  const netVs5 = save5 - MINISTRY_YEAR;
  const netLabel = netVs5 >= 0
    ? `After your ${fmt(MINISTRY_YEAR)}/yr Ministry plan, you're still ${fmt(netVs5)} ahead of a 5% platform.`
    : `That saving offsets most of your ${fmt(MINISTRY_YEAR)}/yr Ministry plan.`;

  const row = (label: string, value: string) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px' }}>
      <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.78)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: '#E8A0A0' }}>{value}</span>
    </div>
  );

  return (
    <section id="calculator" style={{ background: 'var(--cream)', padding: 'clamp(24px, 3vw, 40px) 20px 4px', scrollMarginTop: 104 }}>
      <div className="fee-calc" style={{ maxWidth: 1140, margin: '0 auto', position: 'relative', background: 'var(--navy-900)', borderRadius: 24, padding: 'clamp(28px, 4vw, 48px)', overflow: 'hidden' }}>
        <div style={grainOverlay} />
        <div className="split-grid" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(24px, 4vw, 52px)', alignItems: 'center' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold-400)' }}>What you keep</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(1.7rem, 2.8vw, 2.3rem)', lineHeight: 1.1, letterSpacing: '-0.02em', color: '#fff', margin: '12px 0 0' }}>Every other platform takes a cut. Forever.</h2>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.62)', margin: '14px 0 26px' }}>Drag to your church&rsquo;s annual online giving and see what a percentage platform quietly costs you.</p>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
              <label htmlFor="keep-giving" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Annual online giving</label>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--gold-400)' }}>{fmt(giving)}</span>
            </div>
            <input
              id="keep-giving"
              type="range"
              min={0}
              max={1000000}
              step={10000}
              value={giving}
              onChange={(e) => setGiving(Number(e.target.value))}
              aria-label="Annual online giving"
              aria-valuetext={`${fmt(giving)} per year`}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
              <span>$0</span><span>$1M</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {row('A 2.5% platform keeps', fmt(giving * 0.025))}
            {row('A 5% platform keeps', fmt(save5))}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--gold-500)', borderRadius: 12, padding: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy-900)' }}>Harvest on Ministry keeps</span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--navy-900)' }}>$0</span>
            </div>
            <p style={{ fontSize: 12, lineHeight: 1.5, color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>{netLabel} Community keeps 97.5%. Standard Stripe processing fees apply on any platform — those are Stripe&rsquo;s, not ours.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- Navy bands ----------
function PositioningBand({ kicker, kickerColor, heading, body }:
  { kicker: string; kickerColor: string; heading: string; body: string }) {
  return (
    <section style={{ position: 'relative', background: 'var(--navy-900)', padding: 'clamp(52px, 6vw, 80px) 24px', overflow: 'hidden' }}>
      <div style={grainOverlay} />
      <div style={{ position: 'relative', maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
        <Reveal y={16}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: kickerColor }}>{kicker}</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', lineHeight: 1.12, letterSpacing: '-0.02em', color: '#fff', margin: '14px 0 0', textWrap: 'balance' } as React.CSSProperties}>{heading}</h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(1rem, 1.4vw, 1.12rem)', lineHeight: 1.65, color: 'rgba(255,255,255,0.66)', margin: '18px auto 0', maxWidth: 600 }}>{body}</p>
        </Reveal>
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
        body="Your members install an app with your name and icon, visit your domain, and keep receipts on your letterhead. Your volunteers see only their part. The platform disappears — what's left is your ministry."
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
      {cat.slug === 'giving-finance' && <KeepCalculator />}
      <div style={{ background: 'var(--cream)', padding: 'clamp(28px, 4vw, 48px) 0 clamp(20px, 3vw, 36px)', display: 'flex', flexDirection: 'column', gap: 'clamp(18px, 2.5vw, 30px)' }}>
        {cat.features.map((f) => <FeatureBlock key={f.id} feature={f} />)}
      </div>
      <CategoryBand slug={cat.slug} />
      <SiteCTA heading={cat.ctaHeading} />
    </main>
  );
}
