import React from 'react';
import { PageHeader } from './marketing';
import { Reveal } from './effects';
import { HBtn } from './magic';

/* Shared editorial hero and positioning band for solution pages. */

export const grainOverlay: React.CSSProperties = {
  position: 'absolute', inset: 0, backgroundImage: 'var(--grain-url)', backgroundSize: '200px',
  opacity: 0.06, mixBlendMode: 'overlay', pointerEvents: 'none',
};

export interface HeroCta { label: string; to: string }

export function Hero({
  dark, heroBg, headWidth, eyebrowColor, eyebrow, headline, introWidth, intro, secondary, audience,
}: {
  dark?: boolean;
  heroBg: string;
  headWidth: number;
  eyebrowColor: string;
  eyebrow: string;
  /** Newlines are rendered as line breaks. */
  headline: string;
  introWidth: number;
  intro: string;
  secondary: HeroCta;
  /** Optional line under the buttons — the Solutions page's audience line. */
  audience?: string;
}) {
  return <PageHeader eyebrow={eyebrow} title={<span style={{ whiteSpace: 'pre-line' }}>{headline}</span>} description={intro}>
    <div className="fab-category-actions"><HBtn to="/#pricing" size="lg" variant="dark">Start free trial</HBtn><HBtn to={secondary.to} size="lg" variant="light">{secondary.label}</HBtn></div>
    {audience && <p className="marketing-audience">{audience}</p>}
  </PageHeader>;
}

export function PositioningBand({ kicker, heading, body }:
  { kicker: string; kickerColor: string; heading: string; body: string }) {
  return <section className="fab-band"><Reveal y={16}><span className="fab-pill">{kicker}</span><h2>{heading}</h2><p>{body}</p></Reveal></section>;
}
