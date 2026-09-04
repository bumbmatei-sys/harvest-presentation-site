import React from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { Reveal } from '../components/effects';
import { AnimatedText, HBtn } from '../components/magic';
import { L } from '../components/icons';
import { SoonMock, SKETCH_GROUND } from '../components/SoonMock';
import { FeatureBlock } from '../components/FeatureBlock';
import { logoUrl } from '../components/Replaces';
import {
  COMING_SOON_HREF, COMING_SOON_NAME, IN_PROCESS_LABEL, NOT_BUILT_LABEL,
} from '../content/coming-soon';
import {
  AD_NETWORKS, CAPABILITY_BLOCKS, PLATFORMS, POST_OPTIONS, SCHEDULER_HREF, SCHEDULER_NAME,
  SCHEDULER_NOTICE, type Destination,
} from '../content/scheduler';

/* /features/harvest-scheduler — a whole page about something that does not
 * exist, which the founder asked for by name: "create an entire page for this,
 * though you list it in coming soon feature section in top bar. Present
 * everything properly."
 *
 * ─── 🔴 WHY IT IS A ComingSoonPage AND NOT A CategoryPage ─────────────────────
 *
 * It is built from pages/ComingSoonPage.tsx beat for beat, not from
 * pages/CategoryPage.tsx, and the difference is the whole argument. A
 * CategoryPage renders <HBtn to="/#pricing">Start free trial</HBtn> in its
 * hero, plan chips on every FeatureBlock, and <SiteCTA/> at the close — a sky
 * band carrying TRIAL_CTA_LABEL and "Compare plans", both pointed at the
 * pricing table. All three are correct on a page about something a church can
 * buy today and false on this one.
 *
 * 🔴 SO THE PAGE ENDS ON A NOTE, NOT A BAND. ComingSoonPage's own closing
 * comment states the rule — "that band sells a trial" — and this page inherits
 * it: the close here is a paragraph, a link to /contact and a link back to the
 * rest of Coming Soon. There is no <SiteCTA/> in this file, no route to
 * /#pricing anywhere in it, and no primary button at all after the hero's one
 * link into the Coming Soon list. Not a flag that turns the sales furniture
 * off — a file that never had any to turn off.
 *
 * ─── WHAT IT MAY AND MAY NOT SAY ─────────────────────────────────────────────
 *
 * Every string it draws comes from content/scheduler.ts, whose module-scope
 * contract forbids a price, a date, a tier, a call to action and any
 * destination beyond the nine the founder approved. A claim is not a claim
 * until something draws it, so the rendered markup is swept separately in
 * pages/the-284-harvest-scheduler.test.ts.
 *
 * ⚠️ NO NEW CSS. Every rule this page needs is inline or already in index.css:
 * its grids are `repeat(auto-fit, minmax(…))`, which reflows without a media
 * query, so nothing here had to touch a stylesheet that is pinned by hash in
 * src/test/the-278-no-regression.test.ts.
 *
 * ⚠️ ONLY `button` and `card` ARE INSTALLED from shadcn in this repo (#84), and
 * this page needed neither: it is the same primitives ComingSoonPage already
 * uses — Reveal, AnimatedText, HBtn and the grey token set. */

const INK = 'var(--text-soon)';
const INK_SOFT = 'var(--text-soon-soft)';

const grainOverlay: React.CSSProperties = {
  position: 'absolute', inset: 0, backgroundImage: 'var(--grain-url)', backgroundSize: '200px',
  opacity: 0.06, mixBlendMode: 'overlay', pointerEvents: 'none',
};

/* The same stone ramp ComingSoonPage opens on, and for the same reason: the
   five live heroes each open in their own colour, and everything unbuilt opens
   in grey. Built from tokens, so it tracks the palette rather than pinning a
   hex of its own. */
const HERO_BG = 'linear-gradient(180deg, var(--stone-200) 0%, var(--stone-100) 52%, var(--cream) 100%)';

const SECTION: React.CSSProperties = { background: 'var(--cream)', padding: 'clamp(44px, 6vw, 76px) 20px' };
const WRAP: React.CSSProperties = { maxWidth: 1140, margin: '0 auto' };

/** The blunt fact and the founder's framing, in that order — the same pair
 *  ComingSoonBlock renders on every entry, restated here because a visitor can
 *  arrive on this page without ever seeing /features/coming-soon. */
function StatusRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 13px', borderRadius: 999,
        border: `1px dashed ${INK_SOFT}`, color: INK, fontSize: 12.5, fontWeight: 700,
        letterSpacing: '0.02em', whiteSpace: 'nowrap',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, border: `1px solid ${INK}` }} />
        {NOT_BUILT_LABEL}
      </span>
      <span style={{ fontSize: 12.5, color: INK, fontWeight: 600 }}>{IN_PROCESS_LABEL}</span>
    </div>
  );
}

function SectionHead({ kicker, heading, body }: { kicker: string; heading: string; body?: string }) {
  return (
    <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto clamp(28px, 4vw, 44px)' }}>
      <Reveal y={14}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: INK }}>{kicker}</span>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(1.7rem, 3.1vw, 2.4rem)', lineHeight: 1.12, letterSpacing: '-0.02em', color: 'var(--navy-900)', margin: '12px 0 0', textWrap: 'balance' } as React.CSSProperties}>{heading}</h2>
        {body && <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1.02rem', lineHeight: 1.6, color: 'var(--text-body)', margin: '14px auto 0' }}>{body}</p>}
      </Reveal>
    </div>
  );
}

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
          <Link to={COMING_SOON_HREF} style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: INK, textDecoration: 'none' }}>{COMING_SOON_NAME}</Link>
        </Reveal>
        <AnimatedText
          as="h1"
          text={'Post once.\nEverywhere your church already is.'}
          startOnView={false}
          delay={120}
          stagger={80}
          y={20}
          duration={780}
          style={{
            fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(2.3rem, 4.6vw, 3.7rem)',
            lineHeight: 1.05, letterSpacing: '-0.025em', color: 'var(--navy-900)',
            margin: '18px 0 0', textWrap: 'balance',
          } as React.CSSProperties}
        />
        <Reveal delay={420} y={16}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(1.02rem, 1.5vw, 1.2rem)', lineHeight: 1.6, color: 'var(--text-body)', margin: '20px auto 0', maxWidth: 640 }}>{SCHEDULER_NOTICE}</p>
        </Reveal>
        <Reveal delay={520} y={14}>
          <div style={{ marginTop: 24 }}><StatusRow /></div>
        </Reveal>
        {/* Where the five live pages put "Start free trial". Nothing on this
            page is for sale, so what sits in that slot points at the rest of
            the list of things that do not exist yet. */}
        <Reveal delay={600} y={16}>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
            <HBtn to={COMING_SOON_HREF} size="lg" variant="light">{`See the rest of ${COMING_SOON_NAME}`}</HBtn>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ---------- What it would do ----------
/* ─── 🔴 THE-293 — SIX BLOCKS, NOT SIX COPIES OF ONE CARD ─────────────────────
 *
 * Founder: "the harvest scheduler is horrible. I want for each feature to be
 * presented as the other category pages with a small design."
 *
 * What stood here was a `repeat(auto-fit, minmax(268px, 1fr))` grid of six
 * cards that differed only in their icon and their words — which is why the
 * page read as a specification while /features/giving-finance and its four
 * siblings read as designed. THE-284 built it that way on a defensible
 * argument: components/SoonMock.tsx says in its own docblock that borrowing the
 * live vignette frame would be "a picture of something that does not exist".
 *
 * ⚠️ THE FOUNDER HAS NOW OVERRULED THAT, and the resolution is narrower than
 * "ignore it". What the argument was really protecting is the DISCLAIMER, not
 * the grey box: the frame had to say what it was in its own markup, so a
 * cropped screenshot of it could not read as a shipped screen. It still does —
 * `unbuilt` puts "Concept — nothing built" in the tab where a live block says
 * "Harvest", and turns the ticks into the dashed squares that mean "not
 * included" everywhere else on this site.
 *
 * 🔴 AND IT IS THE REAL `FeatureBlock`, not a copy of it. A lookalike drifts
 * from the original within a ticket or two, and "looks like the other category
 * pages" would then quietly stop being true. What `unbuilt` suppresses is the
 * three things that would be false here — plan chips, crosslinks and ticks —
 * and nothing else; see the docblock on the component. */
function Capabilities() {
  return (
    <section style={{ ...SECTION, paddingLeft: 0, paddingRight: 0 }}>
      <div style={{ ...WRAP, padding: '0 20px' }}>
        <SectionHead
          kicker="What it would do"
          heading="Six things, and every one of them is somebody's Sunday afternoon."
          body="Written as what a person in a church office would do, not as the machinery underneath it — nobody in a church calls an interface that has no screen."
        />
      </div>
      {/* The same stack, gap and rhythm CategoryPage lays its blocks out in. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(18px, 2.5vw, 30px)' }}>
        {CAPABILITY_BLOCKS.map((c) => <FeatureBlock key={c.id} feature={c} unbuilt />)}
      </div>
    </section>
  );
}

// ---------- Where it would post ----------
/** One destination chip.
 *
 *  🔴 THE MARK IS HOTLINKED AND `alt` IS EMPTY. No logo file is committed to
 *  this repo — board card 86bbrgp08 records why: shipping a third party's
 *  trademark with no licence, on a page under Harvest's name. `logoUrl` is the
 *  same resolver the landing page's integrations row already uses, and the
 *  `onError` handler hides the image, so a blocked or missing mark degrades to
 *  the name in text rather than to a broken frame. */
function DestinationChip({ d }: { d: Destination }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 9, padding: '11px 16px', borderRadius: 999,
      background: '#fff', border: '1px solid rgba(45,37,25,0.10)', color: 'var(--navy-900)',
      fontSize: 14, fontWeight: 600,
    }}>
      <img
        src={logoUrl(d.slug, d.name)}
        width={18}
        height={18}
        alt=""
        loading="lazy"
        style={{ objectFit: 'contain', borderRadius: 4, flexShrink: 0 }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
      {d.name}
    </span>
  );
}

function Destinations() {
  return (
    <section style={SECTION}>
      <div style={{ ...WRAP, maxWidth: 900 }}>
        <SectionHead
          kicker="Where a post would go"
          heading="Six places to post, and three places to put money behind it."
          /* ⚠️ "This is the list" is doing real work. Read without it, a short
             list on a page like this invites the question "and the others
             later?" — and a page that answers it, even implicitly, has become
             a schedule of work nobody has committed to, which is the one thing
             content/coming-soon.ts's docblock forbids outright. Read with it,
             the list is a decision that has already been taken.
             (⚠️ And the ordinary word for such a schedule of future work is one
             THE-225 banned from this source tree outright, comments included —
             the guard is in components/, beside Nav's own tests, and it caught
             an earlier draft of this very comment.) */
          body="This is the list, and it is a decision rather than a starting point. Somewhere a church is not, or somewhere that would cost it more to reach than the whole feature is worth, is not on it."
        />
        <Reveal y={16}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
            {PLATFORMS.map((p) => <DestinationChip key={p.name} d={p} />)}
          </div>
          <div style={{ marginTop: 34, paddingTop: 28, borderTop: `1px dashed ${INK_SOFT}` }}>
            <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: INK, marginBottom: 16 }}>And where an advert would run</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
              {AD_NETWORKS.map((a) => <DestinationChip key={a.name} d={a} />)}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ---------- The calendar, the queue and the per-post settings ----------
function TheDesk() {
  return (
    <section style={SECTION}>
      <div style={WRAP}>
        <SectionHead
          kicker="The calendar and the queue"
          heading="A month you can look at, before the month happens."
          body="One post is easy. Forty across six accounts, with a different set of rules on each, is the part that eats a volunteer's week."
        />
        <div className="fb-grid" style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 'clamp(24px, 3.4vw, 52px)', alignItems: 'center' }}>
          {/* The concept sketch, in the same frame ComingSoonBlock draws — the
              disclaimer travels with the picture, so a cropped screenshot of
              it still says what it is. */}
          <Reveal y={18}>
            <div style={{ width: '100%', maxWidth: 410, margin: '0 auto', background: '#fff', border: `1px dashed ${INK_SOFT}`, borderRadius: 22, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '12px 16px', borderBottom: `1px dashed ${INK_SOFT}`, background: 'var(--surface-soon)' }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, border: `1px solid ${INK_SOFT}` }} />
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 700, color: INK }}>{SCHEDULER_NAME}</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: INK, fontWeight: 600, letterSpacing: '0.04em' }}>Concept sketch — nothing built</span>
              </div>
              <div style={{ ...SKETCH_GROUND, padding: '15px 16px 18px' }}>
                <SoonMock id="scheduler" />
              </div>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'clamp(12px, 1.6vw, 18px)' }}>
            {POST_OPTIONS.map((o, i) => (
              <Reveal key={o.id} delay={60 + i * 50} y={16}>
                <div id={o.id} style={{ height: '100%', scrollMarginTop: 104, background: 'var(--surface-soon)', border: `1px dashed ${INK_SOFT}`, borderRadius: 16, padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, color: INK }}>
                    <L name={o.icon} size={16} color="currentColor" />
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{o.title}</span>
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--text-body)', margin: '10px 0 0' }}>{o.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- The one navy band ----------
/* Each live category page gets a single bespoke band, and so does
   /features/coming-soon. This is this page's, and it carries the same job as
   that page's: to say plainly why a whole page exists for something nobody can
   use. --text-soon-dark is the grey that survives a navy ground; see the token
   block in index.css. */
function WhyThisPageBand() {
  return (
    <section style={{ position: 'relative', background: 'var(--navy-900)', padding: 'clamp(52px, 6vw, 80px) 24px', overflow: 'hidden' }}>
      <div style={grainOverlay} />
      <div style={{ position: 'relative', maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
        <Reveal y={16}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-soon-dark)' }}>Why we wrote this down</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', lineHeight: 1.12, letterSpacing: '-0.02em', color: '#fff', margin: '14px 0 0', textWrap: 'balance' } as React.CSSProperties}>A page about something you cannot use yet.</h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(1rem, 1.4vw, 1.12rem)', lineHeight: 1.65, color: 'rgba(255,255,255,0.66)', margin: '18px auto 0', maxWidth: 640 }}>
            Every other feature page on this site describes something your church can use today. This one describes a shape we have argued about and written down, and nothing more than that. We would rather show you the shape and the gap together than let a list of capabilities read as a product.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ---------- Close ----------
/* 🔴 WHERE THE LIVE CATEGORY PAGES RENDER <SiteCTA/>, AND THE REASON THIS PAGE
   DOES NOT. That band is a sky ground carrying TRIAL_CTA_LABEL and "Compare
   plans", both pointed at /#pricing: it sells a trial. A trial is a fair thing
   to sell at the end of a page about shipped work, and a false one at the end
   of a page about work that does not exist — it invites a church to start
   paying on the strength of what it has just read. ComingSoonPage settled this
   already and this page inherits the settlement: a paragraph, a link to the
   contact form, and a link back to the rest of the list. No price, no plan, no
   pricing route anywhere in this file. */
function ClosingNote() {
  return (
    <section style={{ background: 'var(--cream)', padding: 'clamp(56px, 7vw, 92px) 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <Reveal y={16}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(1.7rem, 3vw, 2.3rem)', lineHeight: 1.14, letterSpacing: '-0.02em', color: 'var(--navy-900)', margin: 0, textWrap: 'balance' } as React.CSSProperties}>
            Is this the one your church would actually use?
          </h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1.04rem', lineHeight: 1.6, color: 'var(--text-body)', margin: '16px auto 0', maxWidth: '58ch' }}>
            Tell us which accounts you run and what Sunday morning currently costs you in people and time. What churches actually ask for is how this list gets ordered, and a request from a real ministry outranks a good idea we had on our own.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
            <HBtn to="/contact" size="lg" variant="light">Tell us what you need</HBtn>
          </div>
          <div style={{ marginTop: 34, paddingTop: 26, borderTop: `1px dashed ${INK_SOFT}` }}>
            <StatusRow />
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.6, color: INK, margin: '14px auto 0', maxWidth: '54ch' }}>
              {SCHEDULER_NOTICE}
            </p>
            <div style={{ marginTop: 18 }}>
              <Link to={COMING_SOON_HREF} style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--navy-900)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                {`Everything else on the ${COMING_SOON_NAME} list →`}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function SchedulerPage() {
  return (
    <main>
      <Seo
        title={`${SCHEDULER_NAME} — Harvest`}
        description="Schedule and publish to every account your church runs, read the comments and messages that come back, watch what each post reached, and put money behind the ones that worked. Not built yet — nothing here is dated or for sale."
        canonical={`https://theharvest.site${SCHEDULER_HREF}`}
      />
      <Hero />
      <Capabilities />
      <Destinations />
      <TheDesk />
      <WhyThisPageBand />
      <ClosingNote />
    </main>
  );
}
