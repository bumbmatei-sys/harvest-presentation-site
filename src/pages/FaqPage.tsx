import React from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { Clouds, Reveal } from '../components/effects';
import { Particles, AnimatedText } from '../components/magic';
import { SiteCTA } from '../components/SiteCTA';
import { Kicker, softCard, SKY } from '../components/shared';
import { plans } from '../components/Pricing';
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
   but the twelve answers are collapsed. Expanded, they are several screens of
   prose that a buyer has to scroll past to find the one question they came
   with; collapsed, the page is twelve questions you can read in a glance and
   open the one you want.

   ⚠️ NATIVE <details>/<summary>, AND NOTHING ELSE. No open/closed state in
   React, no accordion library, no click handler. Two things depend on that:

     - Every answer stays in the prerendered HTML. `details` hides its content
       through the browser's own styling, so the words are in the file whether
       or not the disclosure is open — which is the whole reason /faq is on the
       prerender list, and what keeps the FAQPage markup that Seo emits below an
       honest description of the page. Google's structured-data policy allows an
       answer behind an expander precisely because the content is still there;
       an answer that only appeared once JS had run would be invisible to a
       crawler and would make the markup a claim about content the page does not
       contain. See pages/FaqPage.test.ts, which reads it out of the built file.
     - Keyboard operation, the expanded/collapsed announcement and find-in-page
       come with the element. All three are things a hand-rolled accordion —
       a button holding its own state — has to rebuild, and usually rebuilds
       incompletely.

   The look — no default triangle, a chevron that turns, the question going gold
   on hover — is in index.css under "/faq", because ::-webkit-details-marker,
   [open], :hover and :focus-visible cannot be written as inline styles.

   It closes on SiteCTA, the way the feature pages do, because unlike a policy
   this page is a step in buying. */

/* CROSS-PAGE PRICE CONTRACT — this page quotes tier prices and plan limits to
   somebody deciding whether to pay them, and this is what stops them going
   stale. `plans` is the pricing cards' source of truth; FAQ_PLAN_CLAIMS is what
   the FAQ says. Throwing at module scope surfaces during the prerender, which
   is a build failure — the same idiom as the cross-repo contract at the top of
   components/Pricing.tsx and the Terms' contract in pages/LegalPage.tsx. */
const priceProblems = faqPlanMismatches(plans);
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

/**
 * One question, collapsed.
 *
 * The heading lives inside the summary rather than around it — that is the one
 * place the spec allows heading content in a `summary`, and it keeps the twelve
 * questions in the document outline where a screen reader and a crawler both
 * still find them. `id` stays on the `details` so a support reply can still
 * link at one answer; the anchor scrolls to the question, and `:target` marks
 * it, but the reader opens it themselves.
 *
 * Exported for pages/FaqPage.test.ts, which renders it to static markup to
 * check what the prerender puts in the file.
 */
export function Answer({ faq, first }: { faq: (typeof FAQS)[number]; first: boolean }) {
  return (
    <details
      id={faq.id}
      className="faq-item"
      style={{ scrollMarginTop: 110, borderTop: first ? undefined : '1px solid rgba(45,37,25,0.08)' }}
    >
      <summary className="faq-summary">
        <h2 style={{
          fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 'clamp(1.15rem, 2.2vw, 1.4rem)',
          lineHeight: 1.3, letterSpacing: '-0.01em', color: 'var(--navy-900)', margin: 0,
          overflowWrap: 'anywhere',
        }}>
          {faq.question}
        </h2>
        <svg className="faq-chevron" width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div style={{ paddingBottom: 10 }}>
        {faq.answer.map((para, i) => (
          <p key={i} style={{ ...bodyCss, margin: '0 0 14px' }}>{para}</p>
        ))}
      </div>
    </details>
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

            <div style={{ marginTop: 10, paddingTop: 22, borderTop: '1px solid rgba(45,37,25,0.08)', display: 'flex', flexWrap: 'wrap', gap: 18 }}>
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
