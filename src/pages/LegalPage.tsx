import React from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { Clouds, Reveal } from '../components/effects';
import { Particles, AnimatedText } from '../components/magic';
import { Kicker, softCard, SKY } from '../components/shared';
import { plans } from '../components/Pricing';
import {
  LEGAL_DOCS,
  LEGAL_DOC_BY_SLUG,
  LEGAL_UPDATED,
  formatLegalDate,
  legalCanonical,
  legalHref,
  tierPriceMismatches,
  type LegalDoc,
  type LegalSlug,
} from '../content/legal';

/* /terms, /privacy and /refunds — one component, three routes, keyed by slug,
   the same shape as CategoryPage. The prose lives in content/legal.ts; this file
   is only the typography.

   Deliberately quieter than the marketing pages: the sky band and Clouds keep it
   recognisably Harvest, and everything below is a single measured column. A
   policy is read, not skimmed, so nothing here animates on scroll or competes
   with the text. */

/* CROSS-PAGE PRICE CONTRACT — the Terms put tier prices in writing, and this is
   what stops them going stale. `plans` is the pricing cards' source of truth;
   TIER_PRICE_CLAIMS is what the Terms say. Throwing at module scope surfaces
   during the prerender, which is a build failure — the same idiom as the
   cross-repo contract at the top of components/Pricing.tsx. A published price
   the site does not charge is a false commercial claim, so it must not be
   possible to ship one by editing only one of the two files. */
const priceProblems = tierPriceMismatches(plans);
if (priceProblems.length > 0) {
  throw new Error(
    `Legal: the Terms of Service quote prices the pricing cards do not charge — ${priceProblems.join('; ')}. ` +
    'Update TIER_PRICE_CLAIMS in src/content/legal.ts and `plans` in src/components/Pricing.tsx together.',
  );
}

const bodyCss: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)',
};

function Section({ section, first }: { section: LegalDoc['sections'][number]; first: boolean }) {
  return (
    <section id={section.id} style={{ marginTop: first ? 0 : 38, scrollMarginTop: 110 }}>
      <h2 style={{
        fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 'clamp(1.3rem, 2.4vw, 1.6rem)',
        lineHeight: 1.2, letterSpacing: '-0.01em', color: 'var(--navy-900)', margin: '0 0 14px',
      }}>
        {section.heading}
      </h2>
      {section.blocks.map((block, i) =>
        block.kind === 'p' ? (
          <p key={i} style={{ ...bodyCss, margin: '0 0 14px' }}>{block.text}</p>
        ) : (
          <ul key={i} style={{ ...bodyCss, margin: '0 0 14px', paddingLeft: 22 }}>
            {block.items.map((item) => (
              <li key={item} style={{ margin: '0 0 8px' }}>{item}</li>
            ))}
          </ul>
        ),
      )}
    </section>
  );
}

export function LegalPage({ slug }: { slug: LegalSlug }) {
  const doc = LEGAL_DOC_BY_SLUG[slug];
  if (!doc) return null;
  const others = LEGAL_DOCS.filter((d) => d.slug !== doc.slug);

  return (
    <main>
      <Seo title={doc.seoTitle} description={doc.seoDescription} canonical={legalCanonical(doc.slug)} />

      {/* Header band — the /contact treatment, one notch calmer. */}
      <section style={{ position: 'relative', background: SKY, paddingTop: 150, paddingBottom: 80, overflow: 'hidden' }}>
        <Clouds dense />
        <Particles quantity={26} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 820, margin: '0 auto', padding: '0 28px', textAlign: 'center' }}>
          <Reveal y={14}><Kicker>Legal</Kicker></Reveal>
          <AnimatedText
            as="h1"
            text={doc.title}
            startOnView={false}
            delay={100}
            stagger={80}
            y={20}
            duration={760}
            style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 'clamp(2.1rem, 4.6vw, 3.2rem)', lineHeight: 1.06, letterSpacing: '-0.03em', color: 'var(--navy-900)', margin: '20px auto 0' }}
          />
          <Reveal delay={340} y={16}>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--navy-700)', maxWidth: 560, margin: '18px auto 0', lineHeight: 1.6, opacity: 0.85 }}>
              {doc.standfirst}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '18px 0 0', letterSpacing: '0.02em' }}>
              Last updated {formatLegalDate(LEGAL_UPDATED)}
            </p>
          </Reveal>
        </div>
      </section>

      {/* The document itself — one column, straddling the sky → cream seam. */}
      <section style={{ background: 'var(--cream)', padding: '0 20px var(--section-y-tight)', position: 'relative', zIndex: 2 }}>
        <Reveal y={24} style={{ maxWidth: 780, margin: '-20px auto 0' }}>
          <article style={{ ...softCard, padding: 'clamp(26px, 5vw, 52px)' }}>
            {doc.sections.map((section, i) => <Section key={section.id} section={section} first={i === 0} />)}

            <div style={{ marginTop: 44, paddingTop: 22, borderTop: '1px solid rgba(45,37,25,0.08)', display: 'flex', flexWrap: 'wrap', gap: 18 }}>
              {others.map((d) => (
                <Link key={d.slug} to={legalHref(d.slug)} style={{ fontSize: 14, fontWeight: 600, color: 'var(--brand)', textDecoration: 'none' }}>
                  {d.nav} →
                </Link>
              ))}
              <Link to="/contact" style={{ fontSize: 14, fontWeight: 600, color: 'var(--brand)', textDecoration: 'none' }}>
                Contact us →
              </Link>
            </div>
          </article>
        </Reveal>
      </section>
    </main>
  );
}
