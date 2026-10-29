import React from 'react';
import { Card } from './ui/card';
import { Reveal } from './effects';

/** Shared Fabale composition: wide editorial headings and inset scenery. */
export function SectionHeading({ eyebrow, title, description, center = false }: {
  eyebrow?: React.ReactNode; title: React.ReactNode; description?: React.ReactNode; center?: boolean;
}) {
  return <div className={`fab-header marketing-heading${center ? ' marketing-heading-center' : ''}`}>
    <div>{eyebrow && <span className="fab-pill">{eyebrow}</span>}<h2>{title}</h2></div>
    {description && <p>{description}</p>}
  </div>;
}

export function PageHeader({ eyebrow, title, description, children }: {
  eyebrow?: React.ReactNode; title: React.ReactNode; description?: React.ReactNode; children?: React.ReactNode;
}) {
  return <header className="marketing-page-header fab-container">
    <Reveal><div className="fab-header"><div>{eyebrow && <span className="fab-pill">{eyebrow}</span>}<h1>{title}</h1></div>{description && <p>{description}</p>}</div>
      {children && <div className="marketing-page-actions">{children}</div>}
    </Reveal>
  </header>;
}

export function Scene({ src, children, className = '' }: { src: string; children?: React.ReactNode; className?: string }) {
  return <div className={`fab-photo marketing-scene ${className}`}><img className="fab-photo-image" src={`/scenes/${src}.webp`} alt="" loading="lazy" decoding="async" />{children}</div>;
}

export function StoryCard({ scene, visual, children, reverse = false }: {
  scene: string; visual: React.ReactNode; children: React.ReactNode; reverse?: boolean;
}) {
  return <Card className={`fab-split marketing-story${reverse ? ' fab-split-reverse' : ''}`}>
    <Scene src={scene}><div className="marketing-visual">{visual}</div></Scene>
    <div className="fab-split-copy">{children}</div>
  </Card>;
}
