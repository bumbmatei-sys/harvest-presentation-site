import React from 'react';
import { PageHeader } from '../components/marketing';

import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';



import { plans } from '../components/Pricing';
import {
  LEGAL_DOCS,
  LEGAL_DOC_BY_SLUG,
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
    <main className="marketing-page marketing-legal">
      <Seo title={doc.seoTitle} description={doc.seoDescription} canonical={legalCanonical(doc.slug)} />

      {/* Header band — the /contact treatment, one notch calmer. */}
      <PageHeader eyebrow="Legal" title={doc.title} description={doc.standfirst}>
        <p className="marketing-date">Last updated {formatLegalDate(doc.updated)}</p>
      </PageHeader>

      {/* The document itself — one column, straddling the sky → cream seam. */}
      <section className="fab-container marketing-page-content">
        <aside className="marketing-legal-index"><nav aria-label={doc.title}>{doc.sections.map((section) => <a key={section.id} href={`#${section.id}`}>{section.heading}</a>)}</nav></aside>
        <div>
          <article className="marketing-legal-body">
            {doc.sections.map((section, i) => <Section key={section.id} section={section} first={i === 0} />)}

            <div style={{ marginTop: 44, paddingTop: 22, borderTop: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: 18 }}>
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
        </div>
      </section>
    </main>
  );
}
