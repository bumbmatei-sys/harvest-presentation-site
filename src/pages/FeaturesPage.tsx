import React from 'react';
import { appSignupUrl } from '../lib/ref';
import { useMeta } from '../lib/meta';
import { Clouds, Reveal } from '../components/effects';
import { Particles, AnimatedText, HBtn } from '../components/magic';
import { L } from '../components/icons';
import { Kicker, H2, container, softCard, SKY } from '../components/shared';
import { CATALOG, slugify, type CatalogGroup, type CatalogItem } from '../components/catalog';

function FeatureCard({ item, group, delay }: { item: CatalogItem; group: CatalogGroup; delay: number }) {
  // Anchor id matches the mega-menu link (features.html#<slug> → /features#<slug>).
  // scrollMarginTop keeps the card clear of the fixed nav when scrolled to.
  return (
    <Reveal y={0} delay={delay} style={{ display: 'flex' }}>
      <article
        id={slugify(item.title)}
        style={{ ...softCard, padding: 24, scrollMarginTop: 104, width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        <div style={{ width: 48, height: 48, borderRadius: 13, background: group.bg, color: group.tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <L name={item.icon} size={22} color={group.tint} />
        </div>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 19, color: 'var(--navy-900)', margin: 0, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {item.title}
          {item.soon && <span style={{ background: 'var(--sky-100)', color: 'var(--sky-700)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', padding: '3px 8px', borderRadius: 999 }}>SOON</span>}
        </h3>
        <p style={{ color: 'var(--text-body)', fontSize: 14, lineHeight: 1.55, margin: 0 }}>{item.desc}</p>
      </article>
    </Reveal>
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

      {/* One section per catalog group; each item is an anchored card. */}
      {CATALOG.map((group, gi) => (
        <section key={group.name} style={{ background: gi % 2 ? 'var(--stone-100)' : 'var(--cream)', padding: 'var(--section-y-tight) 0' }}>
          <div style={container}>
            <div style={{ marginBottom: 34 }}>
              <Kicker align="left" color={group.tint}>{group.kicker}</Kicker>
              <H2 align="left" style={{ marginTop: 12 }}>{group.name}</H2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="feat-three">
              {group.items.map((item, i) => (
                <FeatureCard key={item.title} item={item} group={group} delay={i * 40} />
              ))}
            </div>
          </div>
        </section>
      ))}

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
