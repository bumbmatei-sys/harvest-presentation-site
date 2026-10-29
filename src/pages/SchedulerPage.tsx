import React from 'react';
import { PageHeader, StoryCard } from '../components/marketing';
import { Seo } from '../components/Seo';
import { Reveal } from '../components/effects';
import { HBtn } from '../components/magic';

import { TRIAL_CTA_LABEL } from '../content/legal';
import { CAPABILITIES, SCHEDULER_HREF } from '../content/scheduler';

export function SchedulerPage() {
  return (
    <main>
      <Seo title="Social Scheduler — Harvest" description="Write a post once and schedule it to Facebook, Instagram and Threads, with a month calendar and a queue. Included on the Ministry plan." canonical={`https://theharvest.site${SCHEDULER_HREF}`} />
      <PageHeader title={<>Post Once.<br /><span className="fab-muted">Everywhere Your People Are.</span></>} description="Write it once, pick Facebook, Instagram or Threads, and schedule it. Included on the Ministry plan.">
        <HBtn to="/#pricing" size="lg" variant="gold">{TRIAL_CTA_LABEL}</HBtn>
      </PageHeader>
      <section className="fab-container marketing-scheduler">
        {CAPABILITIES.map(({ title, body }, i) => <Reveal key={title}><StoryCard scene={i % 2 ? 'why-2-wheat-sunset' : 'usecase-wheat-field-evening'} reverse={i % 2 === 1} visual={<div className="fab-glass marketing-scheduler-preview"><span className="fab-pill">{title}</span><div className="marketing-calendar" aria-hidden="true">{Array.from({ length: 28 }, (_, day) => <span key={day} className={day % 5 === 0 ? 'marketing-calendar-scheduled' : undefined}>{day + 1}</span>)}</div></div>}><h2>{title}</h2><p>{body}</p></StoryCard></Reveal>)}
        <div className="marketing-scheduler-cta"><p>Included on the Ministry plan.</p><HBtn to="/#pricing" size="lg" variant="gold">{TRIAL_CTA_LABEL}</HBtn></div>
      </section>
    </main>
  );
}
