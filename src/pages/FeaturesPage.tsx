import React from 'react';
import { appSignupUrl } from '../lib/ref';
import { useMeta } from '../lib/meta';
import { Clouds, Reveal } from '../components/effects';
import { Particles, AnimatedText, HBtn } from '../components/magic';
import { L } from '../components/icons';
import { Kicker, H2, container, softCard, SKY } from '../components/shared';
import { CATALOG, slugify, type CatalogGroup, type CatalogItem } from '../components/catalog';
import { FeaturePreview, PREVIEW_KINDS } from '../components/FeaturePreview';
import { Globe } from '../components/Globe';

const soonBadge: React.CSSProperties = {
  position: 'absolute', top: 16, right: 16, zIndex: 2, background: 'var(--sky-100)', color: 'var(--sky-700)',
  fontSize: 9.5, fontWeight: 700, letterSpacing: '0.06em', padding: '4px 9px', borderRadius: 999,
};

function FeatureCard({ item, group, delay }: { item: CatalogItem; group: CatalogGroup; delay: number }) {
  // Bespoke vignette when the catalog names a known preview kind; otherwise fall
  // back cleanly to the icon-square + title + description treatment.
  const hasPreview = !!item.preview && PREVIEW_KINDS.has(item.preview);
  return (
    <Reveal y={0} delay={delay} style={{ display: 'flex' }}>
      <article
        id={slugify(item.title)}
        style={{ ...softCard, padding: 22, width: '100%', height: '100%', boxSizing: 'border-box', position: 'relative', scrollMarginTop: 104, display: 'flex', flexDirection: 'column' }}
      >
        {item.soon && <span style={soonBadge}>SOON</span>}

        {hasPreview ? (
          <>
            <FeaturePreview kind={item.preview} tint={group.tint} bg={group.bg} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
              <L name={item.icon} size={18} color={group.tint} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 18, color: 'var(--navy-900)', margin: 0 }}>{item.title}</h3>
            </div>
          </>
        ) : (
          <>
            <div style={{ width: 48, height: 48, borderRadius: 13, background: group.bg, color: group.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <L name={item.icon} size={22} color={group.tint} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 18, color: 'var(--navy-900)', margin: '0 0 8px' }}>{item.title}</h3>
          </>
        )}

        <p style={{ color: 'var(--text-body)', fontSize: 14, lineHeight: 1.55, margin: 0 }}>{item.desc}</p>
      </article>
    </Reveal>
  );
}

function Group({ group, gi }: { group: CatalogGroup; gi: number }) {
  return (
    <section style={{ background: gi % 2 ? 'var(--stone-100)' : 'var(--cream)', padding: 'var(--section-y-tight) 0' }}>
      <div style={container}>
        <div style={{ marginBottom: 34 }}>
          <Kicker align="left" color={group.tint}>{group.kicker}</Kicker>
          <H2 align="left" style={{ marginTop: 12, fontSize: 'clamp(1.7rem, 3vw, 2.4rem)' }}>{group.name}</H2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="feat-three">
          {group.items.map((item, i) => (
            <FeatureCard key={item.title} item={item} group={group} delay={(i % 3) * 60} />
          ))}
        </div>
      </div>
    </section>
  );
}

function GlobeSection() {
  const rows: [string, string][] = [
    ['contact', 'Donor & member profiles with full history'],
    ['chart-column', 'Engagement, growth and giving analytics'],
    ['building-2', 'Multi-church view — every campus in one place'],
  ];
  return (
    <section style={{ background: 'var(--cream)', padding: 'var(--section-y-tight) 0', overflow: 'hidden' }}>
      <div style={container}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }} className="split-grid">
          <div>
            <Kicker align="left" color="var(--brand)">CRM &amp; Analytics</Kicker>
            <H2 align="left" style={{ marginTop: 12 }}>{'One flock,\nevery nation'}</H2>
            <Reveal delay={140}>
              <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-body)', lineHeight: 1.6, margin: '18px 0 24px', maxWidth: 480 }}>
                Your CRM holds every donor, member and seeker — wherever they are. Evangelism analytics show engagement, growth and impact across every church and nation you serve.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {rows.map(([ic, t]) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ display: 'inline-flex', width: 32, height: 32, borderRadius: 9, background: 'var(--gold-100)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <L name={ic} size={16} color="var(--gold-700)" />
                    </span>
                    <span style={{ fontSize: 15, color: 'var(--navy-800)', fontWeight: 500 }}>{t}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
          <Reveal delay={120}><Globe size={440} /></Reveal>
        </div>
      </div>
    </section>
  );
}

export function FeaturesPage() {
  useMeta({
    title: 'Features — Harvest',
    description: 'Everything your ministry needs to thrive. From AI-powered knowledge to evangelism analytics.',
    url: 'https://theharvest.site/features',
  });
  return (
    <main>
      {/* Header band */}
      <section style={{ position: 'relative', background: SKY, paddingTop: 150, paddingBottom: 88, overflow: 'hidden' }}>
        <Clouds dense />
        <Particles quantity={45} />
        <div style={{ ...container, position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <Reveal y={14}><Kicker>Everything included</Kicker></Reveal>
          <AnimatedText
            as="h1"
            text={'One platform for\nyour whole ministry'}
            startOnView={false}
            delay={120}
            stagger={80}
            y={20}
            duration={780}
            style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)', lineHeight: 1.05, letterSpacing: '-0.03em', color: 'var(--navy-900)', margin: '20px auto 0', maxWidth: 820 }}
          />
          <Reveal delay={420} y={16}>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--navy-700)', maxWidth: 580, margin: '20px auto 0', lineHeight: 1.6, opacity: 0.85 }}>
              30+ tools across community, discipleship, giving and AI — branded, in one place, from $59/mo.
            </p>
          </Reveal>
          <Reveal delay={560} y={16}>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 30, flexWrap: 'wrap' }}>
              <HBtn href={appSignupUrl()} size="lg" variant="gold">Access Harvest</HBtn>
              <HBtn to="/#pricing" size="lg" variant="light">See pricing</HBtn>
            </div>
          </Reveal>
        </div>
      </section>

      {/* First four catalog groups, then the CRM/analytics globe band, then the last group.
          Every group still renders — all 31 card anchor ids are preserved. */}
      {CATALOG.slice(0, 4).map((group, gi) => (
        <Group key={group.name} group={group} gi={gi} />
      ))}
      <GlobeSection />
      <Group group={CATALOG[4]} gi={1} />

      {/* Final CTA */}
      <section style={{ position: 'relative', background: SKY, padding: 'var(--section-y) 0', textAlign: 'center', overflow: 'hidden' }}>
        <Clouds dense />
        <div style={{ ...container, position: 'relative', zIndex: 2, maxWidth: 720 }}>
          <H2 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)' }}>{'Ready to run your ministry\nlike never before?'}</H2>
          <Reveal delay={140}>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--navy-700)', margin: '16px auto 30px', maxWidth: 460, opacity: 0.85 }}>Every tool above is included — start today.</p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <HBtn href={appSignupUrl()} size="lg" variant="gold">Access Harvest</HBtn>
              <HBtn to="/#pricing" size="lg" variant="light">See pricing</HBtn>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
