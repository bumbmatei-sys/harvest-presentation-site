import React from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { Clouds, Reveal } from '../components/effects';
import { Particles, AnimatedText } from '../components/magic';
import { SiteCTA } from '../components/SiteCTA';
import { Kicker, softCard, SKY } from '../components/shared';
import { ANNUAL_BILLED_MONTHS, plans } from '../components/Pricing';
import { legalHref } from '../content/legal';
import {
  FAQS,
  FAQ_CANONICAL,
  FAQ_SEO_DESCRIPTION,
  FAQ_SEO_TITLE,
  FAQ_STANDFIRST,
  FAQ_TITLE,
  faqJsonLd,
  faqPlanMismatches,
} from '../content/faq';

/* /faq — the buyer's FAQ. One component, one route; the copy lives in
   content/faq.ts and this file is only the typography and the wiring.

   Built on the LegalPage treatment — sky band, Clouds, one measured column —
   because this page is read rather than skimmed, and for the same reason nothing
   here is an accordion: every answer is in the prerendered HTML, visible without
   a click, which is what makes the FAQPage markup below honest and what makes
   the page worth indexing at all. It closes on SiteCTA, the way the feature
   pages do, because unlike a policy this page is a step in buying. */

/* CROSS-PAGE PRICE CONTRACT — this page quotes tier prices and plan limits to
   somebody deciding whether to pay them, and this is what stops them going
   stale. `plans` is the pricing cards' source of truth; FAQ_PLAN_CLAIMS is what
   the FAQ says. Throwing at module scope surfaces during the prerender, which
   is a build failure — the same idiom as the cross-repo contract at the top of
   components/Pricing.tsx and the Terms' contract in pages/LegalPage.tsx. */
const priceProblems = faqPlanMismatches(plans, ANNUAL_BILLED_MONTHS);
if (priceProblems.length > 0) {
  throw new Error(
    `FAQ: the answers quote prices or limits the pricing cards do not sell — ${priceProblems.join('; ')}. ` +
    'Update FAQ_PLAN_CLAIMS in src/content/faq.ts and `plans` in src/components/Pricing.tsx together.',
  );
}

const bodyCss: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: 16, lineHeight: 1.7, color: 'var(--text-body)',
  // theharvest.app, your-church.theharvest.app and the like are long unbroken
  // tokens; without this they set the column's minimum width and push the card
  // wider than a 390px viewport.
  overflowWrap: 'anywhere',
};

const linkCss: React.CSSProperties = { color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' };

function Answer({ faq, first }: { faq: (typeof FAQS)[number]; first: boolean }) {
  return (
    <section id={faq.id} style={{ marginTop: first ? 0 : 38, scrollMarginTop: 110 }}>
      <h2 style={{
        fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 'clamp(1.3rem, 2.4vw, 1.6rem)',
        lineHeight: 1.2, letterSpacing: '-0.01em', color: 'var(--navy-900)', margin: '0 0 14px',
        overflowWrap: 'anywhere',
      }}>
        {faq.question}
      </h2>
      {faq.answer.map((para, i) => (
        <p key={i} style={{ ...bodyCss, margin: '0 0 14px' }}>{para}</p>
      ))}
    </section>
  );
}

export function FaqPage() {
  return (
    <main>
      <Seo
        title={FAQ_SEO_TITLE}
        description={FAQ_SEO_DESCRIPTION}
        canonical={FAQ_CANONICAL}
        jsonLd={faqJsonLd()}
      />

      {/* Header band — the /contact and policy treatment. */}
      <section style={{ position: 'relative', background: SKY, paddingTop: 150, paddingBottom: 80, overflow: 'hidden' }}>
        <Clouds dense />
        <Particles quantity={26} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 820, margin: '0 auto', padding: '0 28px', textAlign: 'center' }}>
          <Reveal y={14}><Kicker>Before you buy</Kicker></Reveal>
          <AnimatedText
            as="h1"
            text={FAQ_TITLE}
            startOnView={false}
            delay={100}
            stagger={80}
            y={20}
            duration={760}
            style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 'clamp(2.1rem, 4.6vw, 3.2rem)', lineHeight: 1.06, letterSpacing: '-0.03em', color: 'var(--navy-900)', margin: '20px auto 0' }}
          />
          <Reveal delay={340} y={16}>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--navy-700)', maxWidth: 620, margin: '18px auto 0', lineHeight: 1.6, opacity: 0.85 }}>
              {FAQ_STANDFIRST}
            </p>
          </Reveal>
        </div>
      </section>

      {/* The answers — one column, straddling the sky → cream seam. */}
      <section style={{ background: 'var(--cream)', padding: '0 20px var(--section-y-tight)', position: 'relative', zIndex: 2 }}>
        <Reveal y={24} style={{ maxWidth: 780, margin: '-20px auto 0' }}>
          <article style={{ ...softCard, padding: 'clamp(26px, 5vw, 52px)' }}>
            {FAQS.map((faq, i) => <Answer key={faq.id} faq={faq} first={i === 0} />)}

            <div style={{ marginTop: 44, paddingTop: 22, borderTop: '1px solid rgba(45,37,25,0.08)', display: 'flex', flexWrap: 'wrap', gap: 18 }}>
              <Link to="/#pricing" style={linkCss}>See pricing →</Link>
              <Link to={legalHref('terms')} style={linkCss}>Terms of Service →</Link>
              <Link to={legalHref('privacy')} style={linkCss}>Privacy Policy →</Link>
              <Link to={legalHref('refunds')} style={linkCss}>Refund &amp; Cancellation →</Link>
              <Link to="/contact" style={linkCss}>Ask us something else →</Link>
            </div>
          </article>
        </Reveal>
      </section>

      <SiteCTA heading="Still deciding? Try it on your own ministry." />
    </main>
  );
}
