import React from 'react';
import { Seo } from '../components/Seo';
import { Clouds, Reveal } from '../components/effects';
import { AnimatedText, HBtn, Particles } from '../components/magic';
import { container, SKY } from '../components/shared';
import { TRIAL_CTA_LABEL } from '../content/legal';
import { CAPABILITIES, SCHEDULER_HREF } from '../content/scheduler';

export function SchedulerPage() {
  return (
    <main>
      <Seo title="Social Scheduler — Harvest" description="Write a post once and schedule it to Facebook, Instagram and Threads, with a month calendar and a queue. Included on the Ministry plan." canonical={`https://theharvest.site${SCHEDULER_HREF}`} />
      <section style={{ position: 'relative', background: SKY, padding: '150px 0 90px', overflow: 'hidden', textAlign: 'center' }}>
        <Clouds dense /><Particles quantity={40} />
        <div style={{ ...container, position: 'relative', zIndex: 2 }}>
          <AnimatedText as="h1" text={'Post Once.\nEverywhere Your People Are.'} startOnView={false} style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.4rem, 5.5vw, 4rem)', lineHeight: 1.05, color: 'var(--navy-900)', whiteSpace: 'pre-line' }} />
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--navy-700)', maxWidth: 640, margin: '20px auto 28px' }}>Write it once, pick Facebook, Instagram or Threads, and schedule it. Included on the Ministry plan.</p>
          <HBtn to="/#pricing" size="lg" variant="gold">{TRIAL_CTA_LABEL}</HBtn>
        </div>
      </section>
      <section style={{ ...container, padding: '70px 24px' }}>
        {CAPABILITIES.map(({ title, body }) => <Reveal key={title}><div style={{ maxWidth: 800, margin: '0 auto', padding: '30px 0', borderBottom: '1px solid var(--stone-200)' }}><h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--navy-900)' }}>{title}</h2><p style={{ color: 'var(--text-body)', lineHeight: 1.6 }}>{body}</p></div></Reveal>)}
        <div style={{ textAlign: 'center', marginTop: 50 }}><p>Included on the Ministry plan.</p><HBtn to="/#pricing" size="lg" variant="gold">{TRIAL_CTA_LABEL}</HBtn></div>
      </section>
    </main>
  );
}
