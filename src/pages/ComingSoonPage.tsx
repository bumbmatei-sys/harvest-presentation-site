import React from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { Reveal } from '../components/effects';
import { AnimatedText, HBtn } from '../components/magic';
import { ComingSoonBlock } from '../components/ComingSoonBlock';
import { SoonIcon } from '../components/SoonMock';
import {
  COMING_SOON_HREF, COMING_SOON_ITEMS, COMING_SOON_NAME, NOT_BUILT_NOTICE, soonItemHref,
} from '../content/coming-soon';
import { CATEGORIES, categoryHref } from '../content/features';

/* /features/coming-soon — the sixth category, and the only one describing work
 * that does not exist.
 *
 * Built to match pages/CategoryPage.tsx beat for beat: the same hero shape with
 * the same nav-clearing top padding, the same jump-to index, the same stack of
 * 1140px cards, the same one bespoke navy band. The founder asked for a page
 * "designed just like the other pages", and it is.
 *
 * 🔴 WHAT IT DOES NOT REUSE, and why the page is a separate file rather than a
 * sixth entry through CategoryPage:
 *
 *   · CategoryPage's hero renders <HBtn to="/#pricing">Start free trial</HBtn>.
 *   · CategoryPage closes with <SiteCTA/>, which is "Start free trial" and
 *     "Compare plans" over a sky band.
 *   · CategoryPage's cards are FeatureBlock, which draws an "Available on" row
 *     of plan chips from `feature.tiers`.
 *
 * All three are correct on a page about things a church can buy today, and all
 * three are false on this one. Routing coming-soon through CategoryPage would
 * have meant either shipping those three or adding an `if (unbuilt)` to every
 * one of them, and a flag that turns the sales furniture off is one edit away
 * from turning it back on. A separate page cannot regress that way: there is no
 * pricing link and no tier anywhere in this file to leave switched on.
 *
 * The only outbound links are to the five live category pages (what DOES exist)
 * and to /contact. Neither is a purchase. */

const grainOverlay: React.CSSProperties = {
  position: 'absolute', inset: 0, backgroundImage: 'var(--grain-url)', backgroundSize: '200px',
  opacity: 0.06, mixBlendMode: 'overlay', pointerEvents: 'none',
};

const INK = 'var(--text-soon)';
const INK_SOFT = 'var(--text-soon-soft)';

/* Stone rather than a category gradient. The five live heroes each open in
   their own colour — sky, green, gold, navy — and this one opens in the same
   grey it carries everywhere else. Built from tokens, so it tracks the palette
   rather than pinning a hex of its own. */
const HERO_BG = 'linear-gradient(180deg, var(--stone-200) 0%, var(--stone-100) 52%, var(--cream) 100%)';

// ---------- Hero ----------
function Hero() {
  return (
    <section
      style={{
        position: 'relative', background: HERO_BG, overflow: 'hidden',
        paddingLeft: 24, paddingRight: 24,
        paddingTop: 'clamp(144px, calc(7vw + 84px), 180px)',
        paddingBottom: 'clamp(40px, 5vw, 64px)',
      }}
    >
      <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <Reveal y={14}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: INK }}>{COMING_SOON_NAME}</span>
        </Reveal>
        <AnimatedText
          as="h1"
          text={'The things Harvest\ndoes not do yet.'}
          startOnView={false}
          delay={120}
          stagger={80}
          y={20}
          duration={780}
          style={{
            fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            lineHeight: 1.04, letterSpacing: '-0.025em', color: 'var(--navy-900)',
            margin: '18px 0 0', textWrap: 'balance',
          } as React.CSSProperties}
        />
        <Reveal delay={420} y={16}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(1.02rem, 1.5vw, 1.2rem)', lineHeight: 1.6, color: 'var(--text-body)', margin: '20px auto 0', maxWidth: 640 }}>{NOT_BUILT_NOTICE}</p>
        </Reveal>
        {/* Where the five live pages put "Start free trial" and a secondary
            button. Nothing on this page is for sale, so what sits in that slot
            is a pointer at the pages that ARE. */}
        <Reveal delay={560} y={16}>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12, marginTop: 30 }}>
            <HBtn to={categoryHref(CATEGORIES[0].slug)} size="lg" variant="light">See what Harvest does today</HBtn>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ---------- Jump-to index ----------
function SoonIndex() {
  return (
    <section style={{ background: 'var(--cream)', padding: '8px 20px 4px' }}>
      {/* `.soon-index` rather than `.feat-index`: the live pages carry at most
          seven sections, this one carries nine, and nine columns across 1140px
          is a 116px card. Its breakpoints follow the same rhythm — see
          index.css. */}
      <div className="soon-index" style={{ maxWidth: 1140, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
        {COMING_SOON_ITEMS.map((item) => (
          <Link
            key={item.id}
            to={soonItemHref(item.id)}
            className="soon-index-card"
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center',
              padding: '16px 8px', background: '#fff', border: `1px dashed ${INK_SOFT}`,
              borderRadius: 16, color: 'var(--navy-900)', textDecoration: 'none',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 10, background: 'var(--surface-soon)', color: INK }}>
              <SoonIcon name={item.icon} size={17} />
            </span>
            <span style={{ fontSize: 11.5, fontWeight: 600, lineHeight: 1.25 }}>{item.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ---------- The one navy band ----------
/* Each live category page gets a single bespoke band; this is this page's.
   It is also the only dark ground the grey lands on, which is what
   --text-soon-dark exists for — see the token block in index.css. */
function WhyThisPageBand() {
  return (
    <section style={{ position: 'relative', background: 'var(--navy-900)', padding: 'clamp(52px, 6vw, 80px) 24px', overflow: 'hidden' }}>
      <div style={grainOverlay} />
      <div style={{ position: 'relative', maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
        <Reveal y={16}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-soon-dark)' }}>Why we publish this</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', lineHeight: 1.12, letterSpacing: '-0.02em', color: '#fff', margin: '14px 0 0', textWrap: 'balance' } as React.CSSProperties}>You should know what is missing before you decide.</h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(1rem, 1.4vw, 1.12rem)', lineHeight: 1.65, color: 'rgba(255,255,255,0.66)', margin: '18px auto 0', maxWidth: 620 }}>
            Every other category on this site is a capability your church can use today. This one is grey because none of it is. We would rather you found the gap here, on our own site, than three weeks after moving your congregation across.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ---------- Close ----------
/* Where the live pages render <SiteCTA/> — a sky band with "Start free trial"
   and "Compare plans". Nothing here sells anything: one link to the pages that
   describe shipped work, one to the contact form. */
function ClosingNote() {
  return (
    <section style={{ background: 'var(--cream)', padding: 'clamp(56px, 7vw, 92px) 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <Reveal y={16}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(1.7rem, 3vw, 2.3rem)', lineHeight: 1.14, letterSpacing: '-0.02em', color: 'var(--navy-900)', margin: 0, textWrap: 'balance' } as React.CSSProperties}>
            Missing something that is not on this page?
          </h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1.04rem', lineHeight: 1.6, color: 'var(--text-body)', margin: '16px auto 0', maxWidth: '58ch' }}>
            Tell us. What churches actually ask for is how this list gets ordered, and a request from a real ministry outranks a good idea we had on our own.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
            <HBtn to="/contact" size="lg" variant="light">Tell us what you need</HBtn>
          </div>
          <div style={{ marginTop: 34, paddingTop: 26, borderTop: `1px dashed ${INK_SOFT}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: INK, marginBottom: 14 }}>What Harvest does today</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
              {CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  to={categoryHref(c.slug)}
                  style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy-900)', background: '#fff', border: '1px solid rgba(45,37,25,0.10)', borderRadius: 999, padding: '9px 16px', textDecoration: 'none' }}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function ComingSoonPage() {
  return (
    <main>
      <Seo
        title={`${COMING_SOON_NAME} — Harvest`}
        description="What Harvest does not do yet: languages, service planning, application review, documentation, a website builder, an admin AI agent, store listings, one login across churches and fund designations. None of it is built, dated or for sale."
        canonical={`https://theharvest.site${COMING_SOON_HREF}`}
      />
      <Hero />
      <SoonIndex />
      <div style={{ background: 'var(--cream)', padding: 'clamp(28px, 4vw, 48px) 0 clamp(20px, 3vw, 36px)', display: 'flex', flexDirection: 'column', gap: 'clamp(18px, 2.5vw, 30px)' }}>
        {COMING_SOON_ITEMS.map((item) => <ComingSoonBlock key={item.id} item={item} />)}
      </div>
      <WhyThisPageBand />
      <ClosingNote />
    </main>
  );
}
