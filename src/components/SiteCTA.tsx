import React from 'react';
import { Reveal } from './effects';
import { HBtn } from './magic';
import { Mark } from './shared';
import { Card } from './ui/card';
import { TRIAL_CTA_LABEL } from '../content/legal';

export function SiteCTA({ heading, tagline = 'From conversion to devotion.', primaryLabel = TRIAL_CTA_LABEL }:
  { heading: string; tagline?: string; primaryLabel?: string }) {
  return <section className="marketing-closing fab-container"><Card className="marketing-closing-card"><Reveal>
    <Mark h={48} />
    <h2>{heading}</h2><p>{tagline}</p>
    <div className="marketing-closing-actions"><HBtn to="/#pricing" size="lg" variant="gold">{primaryLabel}</HBtn><HBtn to="/#pricing" size="lg" variant="light">Compare plans</HBtn></div>
  </Reveal></Card></section>;
}
