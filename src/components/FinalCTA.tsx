import React from 'react';
import { Reveal } from './effects';
import { HBtn } from './magic';
import { Mark } from './shared';
import { Card } from './ui/card';
import { TRIAL_CTA_LABEL, TRIAL_LENGTH_DAYS } from '../content/legal';

export function FinalCTA() {
  return <section className="marketing-closing fab-container"><Card className="marketing-closing-card"><Reveal>
    <Mark h={48} />
    <h2>Ready When You Are</h2>
    <p>{`Start your ${TRIAL_LENGTH_DAYS}-day free trial. Your people are waiting.`}</p>
    <HBtn href="#pricing" size="lg" variant="gold">{TRIAL_CTA_LABEL}</HBtn>
  </Reveal></Card></section>;
}
