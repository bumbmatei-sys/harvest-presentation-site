import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { ComingSoonPage } from './ComingSoonPage';
import { ComingSoonBlock } from '../components/ComingSoonBlock';
import { FeatureMenuColumns } from '../components/Nav';
import { CATALOG, CATALOG_TOOL_COUNT, COMING_SOON_MENU_ITEMS } from '../components/catalog';
import {
  ADD_ONS,
  ADD_ON_BILLED_MONTHS,
  ADVERTISED_DISCOUNT_PCT,
  DODO_ADD_ON_CATALOG,
  addOnPricingContract,
  dodoAddOnCatalogContract,
  planPriceContract,
  plans,
  type AddOn,
  type Plan,
} from '../components/Pricing';
import { AFFILIATE_PROGRAM_ENABLED, CUSTOM_DOMAIN_MARKETING_ENABLED } from '../lib/flags';
import {
  COMING_SOON_HREF, COMING_SOON_IDS, COMING_SOON_ITEMS, IN_PROCESS_LABEL, NOT_BUILT_LABEL,
  comingSoonContract, type SoonItem,
} from '../content/coming-soon';

/* ─── THE-252 — the affiliate programme goes on Coming Soon ───────────────────
 *
 * 🔴 THE ENTRY THAT IS MOST TEMPTING TO SELL. Every other item on this page
 * describes something a church would BUY, so the page's own shape — no price,
 * no tier, no call to action — is enough to keep it honest. This one describes
 * something a PERSON would EARN, and the natural furniture for it is a sign-up
 * button, a portal link and an earnings screen. A church that reads about a
 * feature it cannot buy is disappointed. A person who signs a referral link
 * expecting to be paid, and cannot be, has been misled about money.
 *
 * ⚠️ WHAT THE FOUNDER ACTUALLY SAID, in full: "30% for a whole year from each
 * plan sold through their link." That sentence fixes the RATE, the SPAN and the
 * BASIS, and it fixes nothing else. (THE-269 raised the rate from the 15% this
 * entry was first written at, 2026-09-01; the span and the basis are unchanged.) Everything the copy states is derived from
 * it; everything it does not settle is named as open in `considering` rather
 * than resolved by invention. The tests below hold both halves — that the one
 * commitment is stated once and unambiguously, and that no second rule was
 * quietly added around it.
 *
 * ⚠️ ASSERTED AGAINST RENDERED OUTPUT, and against the prerendered files when
 * the build has run. PR 55 is the precedent this suite inherits: a
 * pure-function test passed while the JSX seam was mutated. A claim is not a
 * claim until something draws it.
 *
 * ⚠️ REPORTED DRIFT, PINNED HERE RATHER THAN ONLY IN THE PULL REQUEST. The
 * ticket described this as "a seventh Coming Soon entry" joining "the six
 * existing" ones, and called CATALOG_TOOL_COUNT "a derived 28":
 *
 *   · There were NINE entries before this change, not six. Six were named by
 *     the founder (THE-247), two more were found on the board, and THE-245
 *     relocated SMS into the page. This one is the TENTH.
 *   · CATALOG_TOOL_COUNT is not what the ticket said. It moved 28 → 27 at THE-245 when the
 *     SMS Automation TOOL left the live catalogue. It is unchanged by this
 *     ticket, in the only way that matters: still 27, still a reduce.
 *
 * Neither correction changes the work, and both are asserted below so the
 * numbers in the ticket cannot be read back as the numbers in the tree. */

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '..', '..');
const DIST = path.join(ROOT, 'dist');
const DIST_PAGE = path.join(DIST, 'features', 'coming-soon', 'index.html');
const built = fs.existsSync(DIST_PAGE);
const readSrc = (rel: string) => fs.readFileSync(path.join(ROOT, 'src', rel), 'utf8');

/* ⚠️ HelmetProvider IS NOT OPTIONAL — the page renders <Seo/>, which is
   react-helmet-async, and its dispatcher throws without a provider. CI runs
   `npm test` BEFORE `npm run build`, so on a clean checkout the fallback render
   is the ONLY path this file takes. pages/ComingSoonPage.test.ts explains the
   green-locally / red-in-CI trap this guards against. */
const render = (el: React.ReactElement) =>
  renderToStaticMarkup(React.createElement(
    HelmetProvider, null,
    React.createElement(MemoryRouter, { initialEntries: [COMING_SOON_HREF] }, el),
  ));

/** Markup as a visitor reads it. ⚠️ React separates adjacent text nodes with
 *  `<!-- -->`, so "15" and "%" can arrive apart and only rejoin once the
 *  comments and tags are gone — normalise BEFORE matching or every claim check
 *  below is vacuous. `&amp;` last, or `&amp;lt;` would decode twice. */
const words = (markup: string) => markup
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&#x27;|&#39;|&apos;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/&#x2F;/g, '/')
  .replace(/&nbsp;/g, ' ')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')
  .trim();

const pageHtml = built
  ? fs.readFileSync(DIST_PAGE, 'utf8')
  : render(React.createElement(ComingSoonPage));

/** Just the page. Nav and Footer wrap every route and carry the site's real
 *  trial CTA, so a sitewide sweep would be asserting the site sells nothing. */
const mainHtml = (() => {
  const m = /<main[^>]*>([\s\S]*)<\/main>/.exec(pageHtml);
  expect(m, 'the page rendered no <main>').not.toBeNull();
  return m![1];
})();
const mainText = words(mainHtml);

const SOURCE = built ? 'dist/features/coming-soon/index.html' : 'rendered from ComingSoonPage.tsx';

/** The entry under test, and its card rendered on its own. */
const affiliate = COMING_SOON_ITEMS.find((i) => i.id === 'affiliate');
const item = () => {
  expect(affiliate, 'there is no affiliate entry in COMING_SOON_ITEMS').toBeDefined();
  return affiliate!;
};
const blockHtml = renderToStaticMarkup(React.createElement(
  MemoryRouter, { initialEntries: [COMING_SOON_HREF] },
  React.createElement(ComingSoonBlock, { item: item() }),
));
const blockText = words(blockHtml);

/** Every field of this entry that a visitor can read, as one string. */
const copy = (i: SoonItem) =>
  [i.name, i.eyebrow, i.title, i.oneliner, i.today, i.notThis ?? '', i.navDesc, ...i.considering].join(' ');

const menuHtml = (variant: 'desktop' | 'mobile') => renderToStaticMarkup(
  React.createElement(MemoryRouter, { initialEntries: ['/'] },
    React.createElement(FeatureMenuColumns, { variant })),
);
const desktopMenu = menuHtml('desktop');
const mobileMenu = menuHtml('mobile');

/** Every prerendered page, when the build has run — for the sweeps that have to
 *  hold across the whole site rather than on one route. */
const distPages = (): [string, string][] => {
  if (!built) return [];
  const walk = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name))
      : e.name.endsWith('.html') ? [path.join(dir, e.name)] : []));
  return walk(DIST).map((f) => [path.relative(ROOT, f), fs.readFileSync(f, 'utf8')]);
};

/* ── 1 ───────────────────────────────────────────────────────────────────── */
describe('1 — the affiliate programme appears in Coming Soon', () => {
  it(`the entry exists, traces to an open board card, and renders in full (${SOURCE})`, () => {
    const a = item();
    expect(a.name).toBe('Affiliate referrals');
    /* 🔴 THE-97 — "Affiliate programme: decide where payouts originate now
       subscriptions are on Dodo", still Todo on the board. `ref` names the card
       the ENTRY describes, not the ticket that wrote the copy: THE-97 is the
       open decision that is why nobody can be paid a referral share today, so
       it is the card that owns the gap. Nothing here was invented for the page. */
    expect(a.ref).toBe('THE-97');
    expect(a.ref).toMatch(/^THE-\d+$/);

    expect(mainText, 'the name is missing').toContain(a.name);
    expect(mainText, 'the heading is missing').toContain(words(a.title));
    expect(mainText, 'the one-liner is missing').toContain(words(a.oneliner));
    expect(mainText, 'the "Today" paragraph is missing').toContain(words(a.today));
    for (const line of a.considering) expect(mainText).toContain(words(line));
    expect(a.notThis, 'the boundary against live giving is gone').toBeDefined();
    expect(mainText).toContain(words(a.notThis!));
  });

  it('is reachable — an anchor on the page and a card in the jump-to index', () => {
    expect(mainHtml).toContain('id="affiliate"');
    expect(mainHtml).toContain(`href="${COMING_SOON_HREF}#affiliate"`);
    expect(COMING_SOON_IDS).toContain('affiliate');
  });

  it('is badged "Not built yet · In process", in that order, like every other entry', () => {
    // Colour alone is not an accessible signal; the state is in words on the card.
    expect(blockText).toContain(NOT_BUILT_LABEL);
    expect(blockText).toContain(IN_PROCESS_LABEL);
    expect(blockText.indexOf(NOT_BUILT_LABEL)).toBeLessThan(blockText.indexOf(IN_PROCESS_LABEL));
    const labels = [...mainText.matchAll(new RegExp(NOT_BUILT_LABEL, 'g'))];
    expect(labels).toHaveLength(COMING_SOON_ITEMS.length);
  });

  /* ⚠️ NARROWED BY THE-297, AND NOT BECAUSE OF ANYTHING ABOUT THE AFFILIATE
     PROGRAMME. The Coming Soon column used to list every entry, so "reaches both
     mega-menus" came free; it now lists four and a "see all" row, and this entry
     is not one of the four — components/catalog.ts names the four and argues the
     rejection of this one explicitly. THE-252's own guarantee is untouched: the
     flag hides the SOLD tense, and the unbuilt tense is published in its place,
     on the page, anchored, one click from either menu. That is what this pins. */
  it('is reachable from both mega-menus, and what they DO list is derived not kept twice', () => {
    expect(CATALOG[0].items.map((i) => i.title)).toEqual(COMING_SOON_MENU_ITEMS.map((i) => i.name));
    for (const [where, html] of [['desktop', desktopMenu], ['mobile', mobileMenu]] as const) {
      expect(html, `the ${where} menu has no route to the coming-soon page`)
        .toContain(`href="${COMING_SOON_HREF}"`);
    }
    // The entry is on the page the menu leads to, whether or not it is shortlisted.
    expect(COMING_SOON_ITEMS.map((i) => i.name)).toContain('Affiliate referrals');
    if (COMING_SOON_MENU_ITEMS.some((i) => i.name === 'Affiliate referrals')) {
      for (const html of [desktopMenu, mobileMenu]) expect(words(html)).toContain('Affiliate referrals');
    }
    // Every row the menu does show is badged SOON, in the markup not just the data.
    expect((desktopMenu.match(/SOON/g) ?? []).length).toBe(COMING_SOON_MENU_ITEMS.length);
  });

  it('🔴 it is the TENTH entry, not the seventh — the ticket\'s count, checked', () => {
    /* ⚠️ THE-280 APPENDED AN ELEVENTH, "Custom domains", behind
       CUSTOM_DOMAIN_MARKETING_ENABLED. THE-252's claim is about where the
       AFFILIATE entry sits, and that is untouched: it is still the tenth, still
       last among the entries that predate THE-280. The tail is written as a
       flag-derived list rather than repinned to 11, so this reads correctly in
       EITHER flag state — which is also what proves THE-280 appended rather
       than reordered. */
    const AFTER_252 = [
      'languages', 'services', 'applications', 'docs', 'website',
      'agent', 'identity', 'designations', 'sms', 'affiliate',
    ];
    /* ⚠️ AND `scheduler` AFTER IT — THE-284, appended in its turn. The tail is
       still written as a flag-derived list rather than repinned to a number, so
       this still reads correctly in EITHER flag state, and the AFFILIATE entry
       this suite is about is still the tenth either way. Two appends since, and
       neither reordered anything before it — which is exactly what the ordinal
       assertion below is checking. */
    const TAIL = CUSTOM_DOMAIN_MARKETING_ENABLED ? ['scheduler'] : ['domains', 'scheduler'];
    expect(COMING_SOON_ITEMS).toHaveLength(AFTER_252.length + TAIL.length);
    expect(COMING_SOON_IDS).toEqual([...AFTER_252, ...TAIL]);
    // Ordinals are derived from position, so appending can never leave a gap.
    expect(COMING_SOON_ITEMS.map((i) => i.n)).toEqual(
      COMING_SOON_ITEMS.map((_, i) => String(i + 1)));
    expect(item().n).toBe('10');
  });

  it('🔴 and it leaves again the moment the programme is advertised as live', () => {
    /* The relocation, both ways — the SMS shape exactly (THE-245). The five
       surfaces AFFILIATE_PROGRAM_ENABLED hides between them advertise a live
       programme with a rate, a year and a "Become an affiliate" button. Live
       there and unbuilt here would be the same claim in two tenses, so one flag
       decides both. Asserted on the SOURCE of the filter rather than by
       re-importing under a mock, which lib/flags.test.ts already does. */
    expect(AFFILIATE_PROGRAM_ENABLED).toBe(false);
    const src = readSrc('content/coming-soon.ts');
    /* ⚠️ MATCHED AS A NAMED IMPORT rather than as one exact line — THE-280 added
       CUSTOM_DOMAIN_MARKETING_ENABLED to this import and wrapped it across
       lines. What THE-252 needs to hold is that the filter below reads the
       affiliate flag from `lib/flags`, and that is what this says. */
    expect(src).toMatch(/import \{[\s\S]*?\bAFFILIATE_PROGRAM_ENABLED\b[\s\S]*?\} from '\.\.\/lib\/flags'/);
    expect(src).toMatch(
      /\.filter\(\(item\) => item\.id !== 'affiliate' \|\| !AFFILIATE_PROGRAM_ENABLED\)/);
    // And the filter runs BEFORE the renumber, or removing it leaves 1..9, 11.
    expect(src.indexOf("item.id !== 'affiliate'"))
      .toBeLessThan(src.indexOf('n: String(i + 1)'));
  });
});

/* ── 2 ───────────────────────────────────────────────────────────────────── */
describe('2 — it states 30% for twelve months, in one unambiguous sentence', () => {
  /** The page as sentences, which is the unit the claim has to be true in. */
  const sentences = mainText.split(/(?<=[.!?])\s+/).filter(Boolean);

  it('🔴 THE COMMITMENT, VERBATIM — one sentence, and only one', () => {
    const withRate = sentences.filter((s) => s.includes('30%'));
    expect(withRate, 'the 30% claim is made in more than one place').toHaveLength(1);
    expect(withRate[0]).toBe(
      'A link you could share, paying you 30% of what a church that joins through it '
      + 'actually pays for its plan — every payment it makes in the twelve months from its first.',
    );
    // It is the one-liner, not a stray line the block happens to draw.
    expect(words(item().oneliner)).toBe(withRate[0]);
  });

  it('the rate, the basis, the span AND the start are all in that one sentence', () => {
    const s = sentences.find((x) => x.includes('30%'))!;
    expect(s, 'the rate is missing').toMatch(/\b30%/);
    expect(s, 'the basis is missing').toMatch(/what a church .* pays for its plan/);
    /* 🔴 AND THE BASIS IS THE AMOUNT ACTUALLY PAID, confirmed by the founder:
       a church on the yearly term generates 30% of the DISCOUNTED figure, not
       of a list price it never paid. "actually" is what stops "what a church
       pays for its plan" being read back as "the plan's price". */
    expect(s, 'the discounted-amount reading is no longer explicit').toMatch(/actually pays for its plan/);
    expect(s, 'the span is missing').toMatch(/twelve months/);
    /* 🔴 THE ANCHOR, and it is the half that was open when this entry was first
       written. The founder settled it: the twelve months run FROM THE CHURCH'S
       FIRST PAYMENT, not from the referral and not from signup. The distinction
       is money — the product runs a trial during which a church can cancel and
       pay nothing, so a window anchored at the referral would be spent before
       any payment existed. "from its first" is that anchor, and `every payment
       it makes` is what "its first" elides. */
    expect(s, 'the twelve months are not anchored').toMatch(/every payment it makes in the twelve months from its first/);
    // Twelve months is stated ONCE. A second statement is a second chance to
    // state it differently, which is how two readings get published.
    expect(mainText.match(/twelve months/gi)).toHaveLength(1);
  });

  it('🔴 no second percentage, and no second duration, anywhere on the page', () => {
    // A page carrying "30%" once and "10%" somewhere else invites arithmetic
    // nobody promised. The term-discount figures live on the pricing page.
    expect(mainText.match(/\d+\s?%/g)).toEqual(['30%']);
    expect(mainText).not.toMatch(/\b(six|twenty-four|24|18|eighteen)\s+months\b/i);
    expect(mainText).not.toMatch(/\blifetime\b/i);
    expect(mainText).not.toMatch(/\bfor ?ever\b/i);
  });

  it('the number survives the prerender — it is not a client-only string', () => {
    // 🔴 React splits adjacent text nodes with `$<!-- -->`-style comments, so a
    // raw search for "30%" in the file can miss it. Normalised first.
    if (!built) return;
    const prerendered = words(fs.readFileSync(DIST_PAGE, 'utf8'));
    expect(prerendered).toContain('30% of what a church that joins through it actually pays for its plan');
    expect(prerendered).toContain('every payment it makes in the twelve months from its first');
  });

  it('states it in the conditional, so the sentence is not a live offer', () => {
    const a = item();
    expect(a.oneliner).toMatch(/\bcould share\b/);
    expect(a.title, 'the heading does not say the programme is absent')
      .toBe('Harvest has no affiliate programme right now.');
  });

  it('🔴 says "plans only" without naming a category it cannot mention', () => {
    /* The founder said "from each plan sold", which reads as plans and nothing
       else. Saying so is required; saying it with the words "add-on" is
       IMPOSSIBLE — content/coming-soon.ts's contract bans that phrase outright
       on every coming-soon field, because on this page it reads as something
       purchasable. So the scope is stated positively and the category is not
       named at all, which is the alternative the ticket allowed. */
    expect(copy(item())).toMatch(/Plans only\./);
    expect(copy(item())).toMatch(/on nothing else it pays Harvest/);
    expect(copy(item()), 'the banned phrase is back').not.toMatch(/\badd-?on/i);
    expect(mainText).not.toMatch(/\badd-?on/i);
  });

  it('🔴 what is settled is stated, and what is not is named as open', () => {
    /* THE LINE BETWEEN THE TWO, and it moved once. The founder settled the rate,
       the span, the basis (the amount actually paid) and — later — the start of
       the clock. Those four are in the sentence above. What is still undecided
       is a mid-year plan change and every payout mechanic, and those are under
       "Under consideration", which is the field that exists to say exactly that
       rather than resolve it here and be found wrong by someone who acted on it. */
    const bullets = item().considering.join(' ');
    expect(bullets, 'a mid-year plan change is silently assumed')
      .toMatch(/moves up or down a plan, or leaves partway through/i);
    expect(bullets, 'the mechanics are stated rather than left open')
      .toMatch(/are all still open/i);

    // 🔴 AND THE SETTLED ONE HAS LEFT. A question the sentence now answers must
    // not also stand in the list as undecided — the page would say both.
    expect(bullets, 'the start of the year is answered above and still open here')
      .not.toMatch(/when the year starts|first payment, or the referral/i);

    // 🔴 AND THE COPY DOES NOT ANSWER THEM ELSEWHERE. A question named in one
    // field and resolved in another is worse than either alone.
    const c = copy(item());
    expect(c).not.toMatch(/\bclawback|\breversed?\b|\brefund(ed|s)?\b/i);
    expect(c).not.toMatch(/\bpro[- ]?rat(a|ed)\b/i);
    expect(c).not.toMatch(/\b(commission (stops|ends)|stops? immediately)\b/i);
    // 🔴 STILL BANNED, and now for a sharper reason than when it was written:
    //    the clock is anchored at the first payment, so a stray "from signup"
    //    would contradict the sentence rather than merely over-specify it.
    expect(c).not.toMatch(/\bfrom (signup|sign-up|the referral)\b/i);
    expect(c).not.toMatch(/\bconverted customers?\b/i);
  });
});

/* ── 3 ───────────────────────────────────────────────────────────────────── */
describe('3 — it carries no plan chip, no check mark and no crosslink into a paid page', () => {
  /* 🔴 THE THREE THINGS ComingSoonBlock DELIBERATELY DOES NOT RENDER, each of
     which FeatureBlock does, and each of which an affiliate card is the most
     tempting entry on the page to be given. They are asserted on THIS CARD's
     own markup, not only on the page, so a change that special-cased one entry
     would still fail here. */

  it('🔴 no plan chip, and no "Available on" row', () => {
    expect(blockText).not.toMatch(/Available on/i);
    expect(blockText).not.toMatch(/\b(Individual|Small Team|Ministry|Forever Free)\b/);
    // FeatureBlock's chip row, and its dashed "not on this plan" chip.
    expect(blockHtml.match(/<div style="display:flex;flex-wrap:wrap;gap:8px">/)).toBeNull();
    expect(blockHtml).not.toContain('1px dashed rgba(45,37,25,0.18)');
  });

  it('🔴 the SHAPE forbids it — SoonItem has nowhere to put a tier or a price', () => {
    // The structural half. `Feature` in content/features.ts has `tiers`, and
    // FeatureBlock draws chips from it; `SoonItem` has no such field, so this
    // entry cannot express a plan claim even by accident.
    const iface = (() => {
      const src = readSrc('content/coming-soon.ts');
      return src.slice(src.indexOf('export interface SoonItem'), src.indexOf('export const COMING_SOON_SLUG'));
    })();
    for (const field of ['tiers', 'price', 'monthly', 'annual', 'planIds', 'cta', 'rate', 'commission']) {
      expect(iface, `SoonItem gained a "${field}" field for this entry`)
        .not.toMatch(new RegExp(`\\b${field}\\??:`));
    }
    expect(Object.keys(item()).sort()).toEqual(
      ['considering', 'eyebrow', 'icon', 'id', 'n', 'name', 'navDesc', 'notThis', 'oneliner', 'ref', 'title', 'today']);
  });

  it('🔴 no check mark — a tick means "you get this"', () => {
    // FeatureBlock leads every capability line with a gold tick. The
    // "Under consideration" list leads with a dashed grey square instead.
    expect(blockHtml, 'a tick is drawn on an unbuilt feature').not.toContain('M5 10l3 3 7-7');
    expect(blockHtml).not.toContain('lucide-check');
    expect(blockText).not.toContain('✓');
    // And the dashed square really is what it uses — this is not vacuous.
    expect(blockHtml).toContain('border:1px dashed var(--text-soon-soft);border-radius:3px');
  });

  it('🔴 no crosslink into a paid page — from an unbuilt item that reads as an integration', () => {
    // FeatureBlock ends with "Works with" chips linking to other features.
    expect(blockText).not.toMatch(/Works with/i);
    expect([...blockHtml.matchAll(/href="([^"]*)"/g)].map((m) => m[1]),
      'the affiliate card renders a link of its own').toEqual([]);
    // And the page as a whole offers no new destination beyond this anchor.
    const hrefs = [...new Set([...mainHtml.matchAll(/href="([^"]*)"/g)].map((m) => m[1]))];
    expect(hrefs.filter((h) => /affiliate/i.test(h))).toEqual([`${COMING_SOON_HREF}#affiliate`]);
    expect(mainHtml, 'the page links to pricing').not.toContain('/#pricing');
    expect(mainHtml).not.toContain('/features/giving-finance#affiliate');
  });
});

/* ── 4 ───────────────────────────────────────────────────────────────────── */
describe('4 — it carries no sign-up form, join link or call to action', () => {
  /* 🔴 THE ONE THAT MATTERS MOST. A church that reads about a feature it cannot
     buy is disappointed. A person who follows a call to action expecting to
     earn, and cannot, has been misled about money — and this is the only entry
     on the page where that failure is available at all. */

  it('🔴 the card renders no form control of any kind', () => {
    for (const tag of ['<form', '<input', '<button', '<select', '<textarea', '<a ']) {
      expect(blockHtml, `the affiliate card renders a ${tag}> element`).not.toContain(tag);
    }
  });

  it('🔴 no join / apply / sign-up wording, on the card or anywhere on the page', () => {
    const CTA: [string, RegExp][] = [
      ['a join call to action', /\bjoin (now|today|the programme|the program|up)\b|\bjoin our\b/i],
      ['"become an affiliate"', /\bbecome an? affiliate\b/i],
      ['an application CTA', /\bapply (now|here|today)\b|\brequest (access|an invite)\b/i],
      ['a registration CTA', /\b(sign up|signup|register|enrol|enroll)\b/i],
      ['a waitlist', /\b(wait ?list|early access|be the first|notify me|get notified)\b/i],
      ['a purchase CTA', /\b(buy|purchase|subscribe|upgrade now|get started)\b/i],
      ['a trial CTA', /start (your |a )?(free )?trial/i],
      ['an earnings pitch', /\bstart earning\b|\bearn while\b|\bgrow the kingdom\b/i],
      ['a referral-link offer', /\bget your (unique )?(referral )?link\b|\byour own link\b/i],
    ];
    for (const [label, re] of CTA) {
      expect(re.test(blockText), `the affiliate card carries ${label} (${re})`).toBe(false);
      expect(re.test(mainText), `the page carries ${label} (${re})`).toBe(false);
    }
  });

  it('🔴 no link to an affiliate portal, on this page or any prerendered page', () => {
    const PORTAL = /affiliate\.theharvest|\/affiliate\b|affiliates?\.[a-z]/i;
    expect(PORTAL.test(mainHtml), 'the page links to an affiliate portal').toBe(false);
    for (const [file, html] of distPages()) {
      expect(html.includes('affiliate.theharvest.app'), `${file} links to the affiliate portal`).toBe(false);
    }
  });

  it('the heading itself forecloses it, rather than merely omitting it', () => {
    // The strongest guard is not the absence of a button but the presence of the
    // correction — the same reason `notThis` exists on the agent entry.
    expect(mainText).toContain('Harvest has no affiliate programme right now.');
    expect(mainText).toContain('Nothing pays a share for a referral today.');
  });

  it('and the <main> scoping is not a loophole — the site still sells elsewhere', () => {
    /* Scoping to <main> would be a way to pass by stripping the chrome rather
       than by writing a clean card. Nav and Footer wrap every route and still
       carry the real trial CTA; this page's cleanliness is a property of the
       PAGE. Which markup carries the proof depends on how the page was obtained
       — the prerendered file is the whole document, the fallback is <main> alone. */
    if (!built) return;
    const outside = pageHtml.replace(mainHtml, '');
    expect(outside, 'the site lost its trial CTA — this test is now vacuous')
      .toMatch(/Start free trial/);
  });
});

/* ── 5 ───────────────────────────────────────────────────────────────────── */
describe('5 — it names no payout schedule, threshold, cookie window or currency', () => {
  /* ⚠️ THOSE ARE THE SUPPLIER'S MECHANICS AND THEY ARE NOT DECIDED. A vague
     promise is better than a specific wrong one: the entry says the money
     questions are open and stops there. */
  const NOT_DECIDED: [string, RegExp][] = [
    ['a payout schedule', /\b(weekly|monthly|quarterly|net[- ]?\d+|every \d+ days)\b/i],
    ['a payout day', /\b(paid|payout|payouts) (on|every|each) the?\b|\b\d+(st|nd|rd|th) of the month\b/i],
    ['a minimum threshold', /\b(minimum|threshold|payout floor|at least \$)\b/i],
    ['a cookie window', /\bcookies?\b|\battribution window\b|\b\d+[- ]day\b|\blast[- ]click\b/i],
    ['a currency', /[$£€¥]|\b(usd|eur|gbp|dollars?|euros?|pounds?)\b/i],
    ['a holding period', /\bhold(ing|back)\b|\bclearing period\b|\bpending for\b/i],
    ['a payment rail', /\b(paypal|wise|stripe connect|bank transfer|direct deposit|gift card)\b/i],
    ['a tax form', /\b(1099|w-?9|w-?8ben|tax form)\b/i],
  ];

  it('🔴 none of the eight undecided mechanics appears on the card', () => {
    for (const [label, re] of NOT_DECIDED) {
      expect(re.test(blockText), `the affiliate card states ${label} (${re}): ${blockText.match(re)}`).toBe(false);
    }
  });

  it('and it says so, rather than being silent by accident', () => {
    expect(item().considering.join(' ')).toMatch(
      /How a link would be issued, how a share would be tracked and how the money would reach the person who earned it are all still open/);
  });

  it('the page carries no price of any kind either', () => {
    // Inherited from the page's own contract, re-checked here because an
    // affiliate card is the one that would want to show an example payout.
    expect(mainText).not.toMatch(/\$\s?\d/);
    expect(mainText).not.toMatch(/\b\d+\s*(\/|per\s)\s*(mo|month|yr|year)\b/i);
    expect(mainText).not.toMatch(/\bfree\b/i);
  });

  it('🔴 and the concept sketch shows no figure either — it is not a dashboard', () => {
    /* STOP CONDITION 6, and the alternative taken. The obvious drawing for an
       affiliate programme is an earnings screen: a balance, a this-month figure,
       a chart. A WIREFRAME of one still reads as "this exists, and here is
       roughly what you would see" — so the sketch draws only what would be
       TRACKED (a link, the church that arrived on it, and the twelve cells of
       the window) and carries no number, no currency and no chart at all. */
    const src = readSrc('components/SoonMock.tsx');
    const sketch = src.slice(src.indexOf('  affiliate: ('), src.indexOf('};', src.indexOf('  affiliate: (')));
    expect(sketch, 'the affiliate sketch is gone').toContain('<Panel label="Link">');
    expect(sketch).toContain('<Panel label="Church">');
    expect(sketch).toContain('<Panel label="Months">');
    // Twelve cells, and nothing that could be read as an amount.
    expect(sketch).toContain('repeat(12, 1fr)');
    expect(sketch).not.toMatch(/[$£€]|\bbalance\b|\bearn(ed|ings)?\b|\btotal\b|\bpending\b|\bpaid\b/i);
    expect(sketch, 'a chart or a trend line was drawn').not.toMatch(/\bchart\b|\bgraph\b|<svg|polyline|<path/i);
    // Everything the sketch draws is greeked or dashed — no interface copy.
    const labels = [...sketch.matchAll(/label="([^"]*)"/g)].map((m) => m[1]);
    expect(labels).toEqual(['Link', 'Church', 'Months']);
  });
});

/* ── 6 ───────────────────────────────────────────────────────────────────── */
describe('6 — it does not name Rekomi', () => {
  /* ⚠️ A SUPPLIER DECISION, NOT A CUSTOMER-FACING ONE. The programme would be
     rebuilt on a third-party platform, and naming an unsigned vendor on the
     marketing site is a claim of its own — about who holds the money, who pays
     the affiliate and who has been contracted. The board card that records the
     choice is THE-97; the site says nothing about it. */
  const VENDORS = /\brekomi\b|\baffonso\b|\bdub partners\b|\btapfiliate\b|\bpartnerstack\b|\bimpact\.com\b|\bfirstpromoter\b/i;

  it('🔴 the vendor is named nowhere in the entry, and nowhere on the page', () => {
    expect(VENDORS.test(copy(item())), 'the entry names the supplier').toBe(false);
    expect(VENDORS.test(blockText)).toBe(false);
    expect(VENDORS.test(mainText)).toBe(false);
  });

  it('🔴 nor on any prerendered page, nor in any source file under src/', () => {
    for (const [file, html] of distPages()) {
      expect(VENDORS.test(words(html)), `${file} names the supplier`).toBe(false);
    }
    const walk = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true })
      .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name))
        : /\.(ts|tsx|css)$/.test(e.name) ? [path.join(dir, e.name)] : []));
    const offenders = walk(path.join(ROOT, 'src'))
      .filter((f) => f !== fileURLToPath(import.meta.url))
      .filter((f) => VENDORS.test(fs.readFileSync(f, 'utf8')))
      .map((f) => path.relative(ROOT, f));
    expect(offenders, 'a supplier name reached the source tree').toEqual([]);
  });

  it('and no payment processor is named against the unbuilt programme either', () => {
    // "Stripe" appears once in the entry, in `notThis`, and it is a true
    // statement about GIVING, which ships: gifts land in the church's own
    // Stripe account. It must not attach to the unbuilt programme.
    const unbuilt = [item().name, item().eyebrow, item().title, item().oneliner, ...item().considering].join(' ');
    expect(unbuilt).not.toMatch(/\b(stripe|dodo|paypal|wise)\b/i);
    expect(item().notThis!).toMatch(/your church's own Stripe account/);
  });
});

/* ── 7 ───────────────────────────────────────────────────────────────────── */
describe('7 — it renders in the grey vocabulary and takes no accent', () => {
  /** The five live category tints, read off the catalogue rather than written
   *  down, so a re-tinted category keeps this honest. */
  const LIVE_TINTS = CATALOG.filter((g) => !g.href).map((g) => g.tint);

  it('🔴 no live category tint, and no brand gold, reaches the card', () => {
    for (const tint of LIVE_TINTS) {
      expect(blockHtml, `the affiliate card paints ${tint}, a live category colour`).not.toContain(tint);
    }
    expect(blockHtml, 'the card paints the brand gold').not.toContain('--brand');
    expect(blockHtml).not.toContain('--gold-');
    expect(blockHtml).not.toContain('--sky-');
    expect(blockHtml).not.toContain('--green-');
  });

  it('and it actually paints the grey — this is not vacuous', () => {
    expect(blockHtml).toContain('var(--text-soon)');
    expect(blockHtml).toContain('var(--text-soon-soft)');
    expect(blockHtml).toContain('var(--surface-soon)');
  });

  it('🔴 nothing takes an `accent`, so a later edit cannot tint this card', () => {
    /* The five live category pages pass an `accent` per feature into
       FeatureBlock. ComingSoonBlock's signature takes ONE prop and it is the
       item, so there is nowhere for a tint to enter without changing the
       component — which is the guard, rather than a convention. */
    const block = readSrc('components/ComingSoonBlock.tsx');
    expect(block).toContain('export function ComingSoonBlock({ item }: { item: SoonItem })');
    expect(block, 'ComingSoonBlock gained an accent prop').not.toMatch(/\baccent(Bg)?\b\s*[:,}]/);
    for (const key of ['accent', 'accentBg', 'tint', 'colour', 'color']) {
      expect(Object.keys(item()), `the entry carries an "${key}"`).not.toContain(key);
    }
  });

  it('🔴 the sketch hardcodes no colour — every value is a grey token', () => {
    const src = readSrc('components/SoonMock.tsx');
    const sketch = src.slice(src.indexOf('  affiliate: ('), src.indexOf('};', src.indexOf('  affiliate: (')));
    expect(sketch, 'a hex literal was hardcoded').not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(sketch, 'an rgb/hsl literal was hardcoded').not.toMatch(/\b(rgba?|hsla?)\(/i);
    expect(sketch, 'a named colour was hardcoded')
      .not.toMatch(/\b(white|black|grey|gray|red|blue|green|gold|navy)\b/i);
    // What it does use: the two ink tokens, through the shared helpers.
    expect(sketch).toMatch(/INK_SOFT|dashed\(/);
  });
});

/* ── 8 ───────────────────────────────────────────────────────────────────── */
describe('8 — it is legible and distinguishable in all four palettes', () => {
  const css = fs.readFileSync(path.join(ROOT, 'src/index.css'), 'utf8');

  /** Token value straight out of index.css — nothing here hardcodes a hex, so
   *  changing a token changes what is measured. */
  const token = (name: string): string => {
    const m = new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`).exec(css);
    expect(m, `--${name} is not defined in index.css`).not.toBeNull();
    return m![1];
  };
  const chan = (c: number) => (c / 255 <= 0.04045 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4);
  const lum = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
  };
  const contrast = (a: string, b: string) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  const chroma = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => chan(parseInt(hex.slice(i, i + 2), 16)));
    const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    const fx = f((0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047);
    const fy = f(0.2126 * r + 0.7152 * g + 0.0722 * b);
    const fz = f((0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883);
    return Math.hypot(500 * (fx - fy), 200 * (fy - fz));
  };

  /* 🔴 REPORTED DRIFT, PINNED RATHER THAN ONLY STATED. The ticket asked for
     four palettes — "Harvest and Classic × light and dark". THIS REPOSITORY HAS
     NEITHER A CLASSIC PALETTE NOR A DARK MODE: one `:root`, no colour-scheme
     media query, no theme attribute, no switcher, and "Classic" appears nowhere
     in the tree. THE-247 found the same thing and recorded it there. (The two
     strings are deliberately not spelled out — see the test below.)

     What the site does have is ONE palette on FOUR GROUNDS, with tokens paired
     for the light ones and the dark one. Those four are what is measured. */
  const GROUNDS: [string, string][] = [
    ['white (cards, nav glass)', '#FFFFFF'],
    ['cream (--cream, the page)', token('cream')],
    ['stone (--stone-100, sunken)', token('stone-100')],
    ['navy (--navy-900, the band)', token('navy-900')],
  ];

  it('the premise is still true — one palette, no dark mode, no theme switch', () => {
    /* ⚠️ THE NEEDLES ARE ASSEMBLED AT RUNTIME, and this is not cleverness for
       its own sake. pages/ComingSoonPage.test.ts sweeps EVERY src file except
       itself for these two strings and fails if one spells them — so writing
       either out here, even to assert its absence, would put this file on that
       suite's offender list. The same trick, for the same reason, as the
       retired-board-link needle in that file. */
    const MEDIA_QUERY = ['prefers', 'color', 'scheme'].join('-');
    const THEME_ATTR = ['data', 'theme'].join('-');
    /* ⚠️ TWO :root BLOCKS SINCE THE-278, AND STILL ONE PALETTE — see the same
       assertion in pages/ComingSoonPage.test.ts. The second block is the shadcn
       token bridge: aliases of the ramps above it, no colour of its own. What
       is checked is that invariant rather than the brace count that stood in
       for it. */
    const roots = [...css.matchAll(/:root\s*\{([^}]*)\}/g)].map((m) => m[1]);
    expect(roots.length, 'more than two :root blocks').toBeLessThanOrEqual(2);
    for (const body of roots.slice(1)) {
      const literals = body.match(/:\s*(#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|oklch\()/g) ?? [];
      expect(literals, 'a :root after the first paints a colour — that is a second palette').toEqual([]);
    }
    expect(css).not.toContain(MEDIA_QUERY);
    expect(css).not.toContain(THEME_ATTR);
  });

  it('🔴 every grey the affiliate card paints clears WCAG AA on all four grounds', () => {
    const light = token('text-soon');
    const dark = token('text-soon-dark');
    const measured = Object.fromEntries(GROUNDS.map(([name, hex]) => [
      name, Number(contrast(name.startsWith('navy') ? dark : light, hex).toFixed(2)),
    ]));
    for (const [name, ratio] of Object.entries(measured)) {
      expect(ratio, `the grey is ${ratio} : 1 on ${name} — below AA`).toBeGreaterThanOrEqual(4.5);
    }
    // The figures this change is reported with — unchanged by it, because the
    // card introduces no token of its own.
    expect(measured).toEqual({
      'white (cards, nav glass)': 5.38,
      'cream (--cream, the page)': 5.07,
      'stone (--stone-100, sunken)': 4.66,
      'navy (--navy-900, the band)': 7.17,
    });
  });

  it('🔴 the card introduces no token of its own — it reuses the page\'s four', () => {
    const used = new Set([...blockHtml.matchAll(/var\((--[a-z0-9-]+)\)/g)].map((m) => m[1]));
    const unexpected = [...used].filter((v) => !/^--(text-soon|text-soon-soft|surface-soon|soon-rule|text-body|navy-900|font-sans|font-serif|grain-url)$/.test(v));
    expect(unexpected, `the affiliate card paints tokens no other card does: ${unexpected.join(', ')}`)
      .toEqual([]);
  });

  it('reads as grey next to five colours, by measurement rather than by eye', () => {
    const liveHexes = ['sky-600', 'green-600', 'gold-600', 'gold-700', 'navy-600'].map(token);
    for (const hex of liveHexes) expect(chroma(hex)).toBeGreaterThan(20);
    expect(chroma(token('text-soon'))).toBeLessThan(5);
    expect(chroma(token('text-soon-dark'))).toBeLessThan(5);
  });

  it('and the card carries its state in WORDS, so greyscale is not the only signal', () => {
    // Colour alone fails a colour-blind reader, a screen reader and a printout.
    expect(blockText).toContain('Not built yet');
    expect(blockText).toContain('Concept sketch — nothing built');
    expect(blockText).toContain('Today');
    expect(blockText).toContain('Under consideration');
  });
});

/* ── 9 ───────────────────────────────────────────────────────────────────── */
describe('9 — the existing coming-soon entries are unchanged', () => {
  /* 🔴 EXACT, NOT APPROXIMATE, and deliberately NOT read out of git at
     assertion time. A digest of each entry's full JSON is what makes
     "unchanged" mean unchanged; the ids and refs beside it are what make a
     failure readable.

     ⚠️ THE SMS ENTRY IS PINNED BY IDENTITY, NOT BY DIGEST, and that is a
     deliberate limit rather than an oversight. A concurrent ticket owns that
     entry's copy this cycle, so digesting its prose here would turn its next
     legitimate edit into a failure in a file it does not own. What is held for
     it is everything this change could have disturbed: that it is still
     present, still ninth, still gated on its own flag. */
  const digest = (o: unknown) => createHash('sha256').update(JSON.stringify(o)).digest('hex').slice(0, 16);

  const UNTOUCHED: [string, string, string][] = [
    ['languages',     'THE-123', '4dca7c3851c5c8c6'],
    ['services',      'THE-122', 'e000f9db23e650b5'],
    ['applications',  'THE-112', '78635528ff4b1480'],
    ['docs',          'THE-117', '35a3d3761aec0433'],
    /* 🔴 REPINNED BY THE-280, AND FLAG-DEPENDENT — the second entry ever to move
       here, and it moved for the reason this page exists.

       Its `today` claimed, in the PRESENT TENSE, that "what exists is branding —
       your domain, logo and colour", and one `considering` bullet spoke of "the
       domain a church already points at Harvest". Both presuppose that pointing
       your own domain at Harvest works. THE-280 establishes it never did: the
       Vercel subscription behind it was never bought, so the DNS a church was
       shown pointed nowhere. A false present-tense claim, on the one page whose
       whole job is to be the tense that is true.

       🔴 THE FLAG-ON DIGEST IS THE ORIGINAL, CHARACTER FOR CHARACTER — the value
       THE-252 pinned before THE-280 existed. That is the strongest available
       proof that this is a reversible GATE and not an edit: flip
       CUSTOM_DOMAIN_MARKETING_ENABLED and the entry returns byte-identical to
       what it was, exactly as lib/flags.ts's "nothing is deleted" contract
       promises. The subdomain half of the sentence is untouched in both states.

       ⚠️ Neither branch is a wildcard: both are pinned, so a later edit to
       EITHER wording still fails here. */
    ['website',       'THE-59',
      CUSTOM_DOMAIN_MARKETING_ENABLED ? '7372d593d2e142eb' : 'b73dcd35217ba8a1'],
    /* ⚠️ REPINNED BY THE-253, AND THE ONLY ONE THAT MOVED. The `agent` entry's
       `notThis` said AI Chat "is part of the Small Team and Ministry plans at no
       extra charge" — true when written, false the moment `aiChat` came off
       every tier. The clause was DROPPED rather than reworded: this page's
       contract forbids a price and the word "add-on", so the corrected fact
       cannot be stated here, and the pricing page is where it belongs. The
       sentence's actual job — distinguishing the shipped member chat from this
       unbuilt admin agent — is untouched and still asserted in
       ComingSoonPage.test.ts. Nothing else about the entry changed: same id,
       same ref, same position, same `today` and `considering`. */
    ['agent',         'THE-58',  'c80114beb389601e'],
    ['identity',      'THE-118', '508c54cd47b1a10e'],
    ['designations',  'THE-98',  '2ca9b8b2e1cb1ef0'],
  ];

  it('🔴 the eight entries that predate the SMS relocation are byte-for-byte identical', () => {
    for (const [id, ref, want] of UNTOUCHED) {
      const found = COMING_SOON_ITEMS.find((i) => i.id === id);
      expect(found, `the "${id}" entry is gone`).toBeDefined();
      expect(found!.ref, `"${id}" was re-pointed at a different board card`).toBe(ref);
      expect(digest(found), `the "${id}" entry was edited by this change`).toBe(want);
    }
  });

  it('the SMS entry is still present, still ninth, and still on its own flag', () => {
    const sms = COMING_SOON_ITEMS.find((i) => i.id === 'sms');
    expect(sms, 'the SMS entry was dropped').toBeDefined();
    expect(sms!.ref).toBe('THE-245');
    expect(sms!.n).toBe('9');
    expect(COMING_SOON_ITEMS.indexOf(sms!)).toBe(8);
    expect(readSrc('content/coming-soon.ts'))
      .toContain(".filter((item) => item.id !== 'sms' || !SMS_MARKETING_ENABLED)");
  });

  it('🔴 nothing was reordered — the new entry was APPENDED', () => {
    expect(COMING_SOON_ITEMS.map((i) => i.id).slice(0, 9)).toEqual([
      'languages', 'services', 'applications', 'docs', 'website',
      'agent', 'identity', 'designations', 'sms',
    ]);
    /* The affiliate entry is last among everything that predates THE-280, which
       appended "Custom domains" after it, and THE-284, which appended "Harvest
       Scheduler" after that. Written as an index from the FRONT rather than
       from the end, so it still says "APPENDED, not reordered" however many
       entries arrive later and in either flag state — which is the whole
       property, and the reason the tail is not pinned to one id. */
    expect(COMING_SOON_ITEMS[9].id).toBe('affiliate');
    expect(COMING_SOON_ITEMS.map((i) => i.id).slice(10))
      .toEqual(CUSTOM_DOMAIN_MARKETING_ENABLED ? ['scheduler'] : ['domains', 'scheduler']);
    // Their ordinals are untouched, which is the visible half of "not reordered".
    expect(COMING_SOON_ITEMS.slice(0, 9).map((i) => i.n))
      .toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
  });

  it('and every one of them still renders on the page', () => {
    for (const i of COMING_SOON_ITEMS) {
      expect(mainText, `"${i.id}" stopped rendering`).toContain(words(i.title));
      expect(mainHtml).toContain(`id="${i.id}"`);
    }
  });

  it('🔴 the page contract still passes on the real list, and still has teeth', () => {
    /* The guard is armed at MODULE SCOPE in content/coming-soon.ts, so a
       violation fails `vite-react-ssg build` rather than merely turning a test
       red. Handing it mutated input is the only way to watch it fire — and the
       cases below are the ones an AFFILIATE entry would plausibly trip. */
    expect(() => comingSoonContract(COMING_SOON_ITEMS)).not.toThrow();
    const base = item();
    const one = (patch: Partial<SoonItem>): SoonItem[] => [{ ...base, ...patch }];

    const cases: [string, Partial<SoonItem>, RegExp][] = [
      ['an example payout', { oneliner: 'Refer five churches and earn $60 a month.' }, /carries a price/],
      ['a monthly figure', { navDesc: 'Pays 15/mo per referral.' }, /per-month or per-year figure/],
      ['an availability claim', { title: 'Available now to every member.' }, /an availability claim/],
      ['a purchase CTA', { title: 'Subscribe to reserve your affiliate place.' }, /purchase call to action/],
      ['a plan tier', { eyebrow: 'Referrals on the Ministry plan' }, /names a plan tier against unbuilt work/],
      ['the word "free"', { navDesc: 'Free to join, pays 15%.' }, /the word "free"/],
      ['a promise it will ship', { title: 'The programme will launch to everyone.' }, /a promise that it is coming/],
      ['a delivery date', { oneliner: 'Opening in Q4 2026.' }, /a delivery date/],
      ['an invented board card', { ref: 'REKOMI-1' }, /no board reference/],
    ];
    for (const [label, patch, message] of cases) {
      expect(() => comingSoonContract(one(patch)), `the contract accepted ${label}`).toThrow(message);
    }
    expect(() => comingSoonContract([base, { ...base, name: 'Other' }])).toThrow(/ids must be unique/);
  });
});

/* ── 10 ──────────────────────────────────────────────────────────────────── */
describe('10 — the tool count is unchanged and still derived', () => {
  it('🔴 CATALOG_TOOL_COUNT is the DERIVED figure, not the one the ticket named', () => {
    /* ⚠️ THE TICKET SAID 28. It was 28 until THE-245, which withdrew the SMS
       Automation TOOL from the live catalogue and took the count to 27. The
       claim is quoted to visitors as "N tools in one platform", so the figure
       has to describe what a church can use today. This change does not move
       it, which is the property that matters. */
    /* 🔵 AND IT IS 28 AGAIN SINCE THE-306 — the Shareable Giving Page row, a
       live tool that had no menu entry. The lesson of this note survives the
       change and is the reason it is written this way: quote the derived
       figure, never a remembered one. */
    expect(CATALOG_TOOL_COUNT).toBe(28);
    expect(CATALOG_TOOL_COUNT).toBe(
      CATALOG.reduce((n, g) => n + g.items.filter((i) => !i.soon).length, 0),
    );
    // Derived, not written down, in the module that owns it.
    const catalog = readSrc('components/catalog.ts');
    expect(catalog).toMatch(/CATALOG_TOOL_COUNT = CATALOG\.reduce\(/);
    expect(catalog, 'the tool count was hardcoded').not.toMatch(/CATALOG_TOOL_COUNT\s*=\s*\d+/);
  });

  it('🔴 the affiliate entry contributes nothing to it', () => {
    const soonGroup = CATALOG.filter((g) => g.href);
    expect(soonGroup).toHaveLength(1);
    // 10 after THE-252, 11 after THE-280 appended "Custom domains", 12 after
    // THE-284 appended "Harvest Scheduler". The count is a tripwire on the
    // GROUP; the guarantee is the line below — every entry in it is `soon`, so
    // a further one still leaves CATALOG_TOOL_COUNT where it is.
    /* ⚠️ THE-297 made the column a shortlist, so the group's length is now the
       shortlist's and this entry may not be in it — absent, it contributes
       nothing a fortiori. The guarantee below is the one that always held and
       still does: every row in the group is `soon`, so CATALOG_TOOL_COUNT stays
       where it is no matter which entries the column shows. */
    expect(soonGroup[0].items).toHaveLength(COMING_SOON_MENU_ITEMS.length);
    expect(soonGroup[0].items.filter((i) => !i.soon), 'a coming-soon entry is being counted')
      .toHaveLength(0);
    const affiliateTool = soonGroup[0].items.find((i) => i.title === 'Affiliate referrals');
    if (affiliateTool) {
      expect(affiliateTool.soon, '🔴 the affiliate entry would be counted as a live tool').toBe(true);
    }
  });

  it('🔴 and it WOULD have moved the count if it lost its soon flag — by mutation', () => {
    /* The tripwire, proved rather than asserted. Mutating the whole group rather
       than the affiliate row alone, because since THE-297 that row may not be in
       the shortlist — and the claim being proved is about the group's `soon`
       flags carrying the count, which is what it always was. */
    const withoutFlag = CATALOG.map((g) => (g.href
      ? { ...g, items: g.items.map((it) => ({ ...it, soon: false })) }
      : g));
    const wrong = withoutFlag.reduce((n, g) => n + g.items.filter((i) => !i.soon).length, 0);
    expect(wrong).toBe(28 + COMING_SOON_MENU_ITEMS.length);
    expect(wrong).not.toBe(CATALOG_TOOL_COUNT);
  });

  it('the nav still quotes the derived figure, and quotes no other', () => {
    expect(readSrc('components/Nav.tsx')).toContain('CATALOG_TOOL_COUNT');
    expect(words(desktopMenu)).not.toMatch(/\b\d+ tools\b/);
  });
});

/* ── 11 ──────────────────────────────────────────────────────────────────── */
describe('11 — no price changed and both contracts still throw', () => {
  it('the nine plan prices are exactly what they were', () => {
    expect(plans.map((p) => p.price.monthly)).toEqual([20, 40, 80]);
    expect(plans.map((p) => p.price.quarterly)).toEqual([54, 108, 216]);
    expect(plans.map((p) => p.price.yearly)).toEqual([190, 380, 760]);
    expect(ADVERTISED_DISCOUNT_PCT).toEqual({ quarterly: 10, yearly: 20 });
    expect(plans.every((p) => p.fee === 0)).toBe(true);
  });

  it('and so are the five add-on prices, the RESTORED one included', () => {
    expect(Object.fromEntries(
      Object.entries(DODO_ADD_ON_CATALOG).map(([n, p]) => [n, [p.monthlyCents, p.annualCents]]),
    )).toEqual({
      'AI Assistant': [2000, 24000],
      'Admin seat': [1000, 12000],
      Campus: [1200, 14400],
      'Contacts +500': [1500, 18000],
      'Unlimited contacts': [4000, 48000],
    });
    // ⚠️ FIVE ROWS NOW. The AI Assistant returned in THE-253 at the same
    // $20/$240 the catalogue above has always pinned — a restore, not a
    // reprice, exactly as its withdrawal was a removal and not one.
    expect(ADD_ONS.map((a) => [a.name, a.monthly, a.annual])).toEqual([
      ['AI Assistant', 20, 240],
      ['Admin seat', 10, 120],
      ['Campus', 12, 144],
      ['Contacts +500', 15, 180],
      ['Unlimited contacts', 40, 480],
    ]);
    expect(ADD_ON_BILLED_MONTHS).toBe(12);
  });

  it('🔴 all THREE cross-repo contracts still throw — proved by mutation', () => {
    /* ⚠️ "BOTH" IS THREE. components/Pricing.tsx carries `addOnPricingContract`
       and `dodoAddOnCatalogContract`, and `planPriceContract` is labelled
       CROSS-REPO PRICE CONTRACT above them — so all three are exercised rather
       than guessing which two the ticket meant. Each is exported AND called at
       module scope: the call fails the prerender, the export is what lets a
       test hand it deliberately wrong input and watch it fire. */
    const asShipped = (): Plan[] => plans.map((p) => ({ ...p }));
    expect(() => planPriceContract(plans)).not.toThrow();
    expect(() => dodoAddOnCatalogContract(ADD_ONS)).not.toThrow();
    expect(() => addOnPricingContract(ADD_ONS)).not.toThrow();

    // Five distinct named failures.
    const wrongPlanPrice = asShipped().map((p) => (p.planId === 'plus' ? { ...p, price: { ...p.price, monthly: 21 } } : p));
    expect(() => planPriceContract(wrongPlanPrice)).toThrow(/renders \$21 monthly, but the app/);

    const unknownPlan = asShipped().map((p) => (p.planId === 'max' ? { ...p, planId: 'affiliate' } : p));
    expect(() => planPriceContract(unknownPlan)).toThrow(/has no expected prices in the cross-repo contract/);

    const wrongAddOn = ADD_ONS.map((a) => (a.name === 'Admin seat' ? { ...a, monthly: 11, annual: 132 } : a));
    expect(() => dodoAddOnCatalogContract(wrongAddOn)).toThrow(/Admin seat/);

    const unbacked: AddOn[] = [...ADD_ONS, { name: 'Referral bonus', monthly: 5, annual: 60, blurb: 'x', planIds: ['max'] }];
    expect(() => dodoAddOnCatalogContract(unbacked)).toThrow(/no entry in DODO_ADD_ON_CATALOG/);

    const discounted: AddOn = { ...ADD_ONS[0], annual: Math.round(ADD_ONS[0].annual * 0.7) };
    expect(() => addOnPricingContract([discounted])).toThrow(/NOT discounted/);
  });

  it('the guards are still armed at module scope, so they fail the prerender', () => {
    const src = readSrc('components/Pricing.tsx');
    expect(src).toMatch(/^planPriceContract\(plans\);$/m);
    expect(src).toMatch(/^addOnPricingContract\(ADD_ONS\);$/m);
    expect(src).toMatch(/^dodoAddOnCatalogContract\(ADD_ONS\);$/m);
  });

  it('🔴 and this change did not touch Pricing.tsx at all', () => {
    /* A concurrent ticket owns that file this cycle. Asserted as a property of
       the tree rather than of a diff: nothing this change wrote imports from it,
       directly or for a type. */
    for (const rel of [
      'content/coming-soon.ts', 'components/SoonMock.tsx',
      'components/ComingSoonBlock.tsx', 'pages/ComingSoonPage.tsx', 'lib/flags.ts',
    ]) {
      expect(readSrc(rel), `${rel} imports from Pricing.tsx`).not.toMatch(/from '.*Pricing'/);
    }
  });
});

/* ── 12 ──────────────────────────────────────────────────────────────────── */
describe('12 — the page renders at 380, 768, 1024, 1280 and 1440 without overflow', () => {
  /* 🔴 ARITHMETIC, NOT A SCREENSHOT — the idiom this repo already uses in
     components/TermToggle.widths.test.ts and in pages/ComingSoonPage.test.ts.
     There is no DOM and no layout engine in this runner, so nothing here can
     measure a box. What it can do is pin the structural properties that decide
     whether a thing can overflow at all, and compute the room each element gets.

     ⚠️ WIDTH IS NOT MONOTONIC IN VIEWPORT on this site — board card THE-184
     records a 41px overflow found at exactly 1280px, between two passing
     measurements — so every breakpoint is evaluated, not just the extremes. */
  const VIEWPORTS = [380, 768, 1024, 1280, 1440];
  const PAGE_GUTTER = 20;
  const CONTENT_MAX = 1140;
  const charWidth = (px: number) => px * 0.55;
  /** The longest UNBREAKABLE token, which is what decides an overflow — a
   *  multi-word label wraps. */
  const longestWord = (s: string) => Math.max(...s.split(/[\s—/,]+/).map((w) => w.length));
  const indexColumns = (v: number) => (v <= 560 ? 2 : v <= 900 ? 3 : v <= 1080 ? 4 : 5);
  const indexCardRoom = (v: number) => {
    const grid = Math.min(CONTENT_MAX, v - PAGE_GUTTER * 2);
    const col = (grid - 10 * (indexColumns(v) - 1)) / indexColumns(v);
    return col - 8 * 2;
  };

  it.each(VIEWPORTS)('the new index card fits its label at %ipx', (v) => {
    const room = indexCardRoom(v);
    const label = longestWord(item().name) * charWidth(11.5);
    expect(room, `"Affiliate referrals" (~${label.toFixed(0)}px) does not fit a ${room.toFixed(0)}px card`)
      .toBeGreaterThan(label);
  });

  it('the label is not the widest on the page, so the binding case is unchanged', () => {
    // 149px at 380 is the binding figure, and it is set by "Documentation" (13
    // characters), not by this entry (9). Adding it moves nothing.
    expect(longestWord(item().name)).toBe(9);
    expect(Math.max(...COMING_SOON_ITEMS.map((i) => longestWord(i.name)))).toBe(13);
    expect(Object.fromEntries(VIEWPORTS.map((v) => [v, Math.round(indexCardRoom(v))])))
      .toEqual({ 380: 149, 768: 220, 1024: 223, 1280: 204, 1440: 204 });
  });

  it.each(VIEWPORTS.filter((v) => v > 900))('the mega-menu column still fits every label at %ipx', (v) => {
    /* The menu only renders above 900px — `.nav-links` is `display: none`
       below it. `auto-fit` with `minmax(136px, 1fr)` lays down as many tracks as
       fit and wraps the rest, so a column can never be narrower than 136px. */
    const panel = Math.min(1180, v - 40) - 30 * 2;
    const tracks = Math.max(1, Math.floor((panel + 18) / (136 + 18)));
    const col = (panel - 18 * (tracks - 1)) / tracks;
    expect(col, 'a track fell below its 136px minimum').toBeGreaterThanOrEqual(136);
    const widest = Math.max(...CATALOG.flatMap((g) => g.items.map((i) => longestWord(i.title)))) * charWidth(13);
    expect(col - 23, `the widest menu label (~${widest.toFixed(0)}px) does not fit`).toBeGreaterThan(widest);
  });

  it('🔴 the card declares no fixed width that could push the page sideways', () => {
    // ⚠️ The lookbehind matters: `max-width:1140px` contains `width:1140px`.
    const fixed = [...blockHtml.matchAll(/(?<!max-|min-)\bwidth:(\d+(?:\.\d+)?)px/g)]
      .map((m) => Number(m[1]))
      .filter((w) => w > 60);
    expect(fixed, `a fixed width over 60px is declared: ${fixed.join(', ')}`).toEqual([]);
    const maxes = [...new Set([...blockHtml.matchAll(/max-width:(\d+)px/g)].map((m) => Number(m[1])))];
    expect(maxes.every((w) => w <= CONTENT_MAX), `a max-width exceeds ${CONTENT_MAX}px`).toBe(true);
  });

  it('🔴 the twelve-cell strip shrinks with the frame rather than setting a floor under it', () => {
    /* THE ONE NEW WAY THIS CARD COULD OVERFLOW. Twelve cells in a row is the
       only element on the page with a fixed COUNT, and at 380px the sketch frame
       has about 236px of usable width. `repeat(12, 1fr)` on EMPTY children has
       an implicit min-width of 0, so the tracks compress to ~17px each. A fixed
       px width, a `minmax()` floor or any content inside a cell would each turn
       that into an overflow instead. */
    const src = readSrc('components/SoonMock.tsx');
    const sketch = src.slice(src.indexOf('  affiliate: ('), src.indexOf('};', src.indexOf('  affiliate: (')));
    expect(sketch).toContain("gridTemplateColumns: 'repeat(12, 1fr)'");
    expect(sketch, 'a minmax() floor would stop the strip compressing').not.toContain('minmax(');
    expect(sketch, 'a fixed cell width would stop the strip compressing').not.toMatch(/width: \d/);
    // Every cell is an empty <span> — nothing inside to set a minimum.
    expect(sketch).toMatch(/\{Array\.from\(\{ length: 12 \}, \(_, i\) => <span key=\{i\} style=\{\{ \.\.\.dashed\(3\), height: 12 \}\} \/>\)\}/);

    // And the arithmetic, at the binding width. Card padding is clamp(26px…) at
    // 380, the sketch frame pads 16px a side, the Panel another 10px.
    const frame = Math.min(410, 380 - PAGE_GUTTER * 2 - 26 * 2);
    const cell = (frame - 16 * 2 - 10 * 2 - 3 * 11) / 12;
    expect(Math.round(frame)).toBe(288);
    expect(cell, 'a cell collapsed below a hairline').toBeGreaterThan(4);
    expect(Math.round(cell * 10) / 10).toBe(16.9);
  });

  it('the card collapses to one column below 900px, so the sketch never shares a 380px row', () => {
    const cssText = fs.readFileSync(path.join(ROOT, 'src/index.css'), 'utf8');
    const block = cssText.slice(cssText.indexOf('@media (max-width: 900px)'));
    expect(block.slice(0, block.indexOf('\n}'))).toContain('.fb-grid');
    expect(blockHtml).toContain('class="fb-grid"');
    expect(blockHtml).toContain('class="fb-caps"');
  });
});

/* ── 13 — the existing affiliate surface, reported rather than deleted ────── */
describe('13 — the surface being replaced is recorded, and does not contradict this entry', () => {
  /* 🔴 NOT DELETED HERE, AND DELIBERATELY SO. Removing a marketing surface is
     its own decision with its own blast radius, and the founder's instruction
     was that the old stack goes in one change AFTER the replacement is
     connected and verified — not half-migrated. What this ticket owes instead
     is an exact record of what that surface claims, and proof that it and the
     new entry are never both on the site at once. */

  it('the old surface is still in the tree, and this is what it claims', () => {
    const src = readSrc('components/Affiliate.tsx');
    // The four claims it makes, quoted so the pull request does not have to be
    // trusted about them.
    expect(src).toContain('Earn 30% recurring commission on every invoice for their first 12 months.');
    expect(src).toContain('30% / month, for 12 months');
    expect(src).toContain('Recurring on every invoice for 12 months from signup. If they cancel sooner, commission stops.');
    expect(src).toContain('Become an affiliate');
    expect(src).toContain('https://affiliate.theharvest.app/auth');
    // And the feature entry beside it, which puts a worked example on the page.
    const features = readSrc('content/features.ts');
    expect(features).toContain('Refer a ministry. Earn 30% for a year.');
    // ⚠️ Read off SOURCE, not off a render: the entry is behind the flag, so it
    //    reaches no page. The apostrophe is backslash-escaped in the file.
    expect(features).toContain("Trial starts don\\'t count — only converted customers");
    expect(features).toContain('On everything they pay in their first 12 months');
  });

  it('🔴 but none of it reaches a visitor — every surface is behind the flag', () => {
    expect(AFFILIATE_PROGRAM_ENABLED).toBe(false);
    // The five gates, asserted where they are written.
    expect(readSrc('pages/Landing.tsx')).toContain('{AFFILIATE_PROGRAM_ENABLED && <Affiliate />}');
    expect(readSrc('components/Footer.tsx')).toContain('AFFILIATE_PROGRAM_ENABLED ?');
    expect(readSrc('components/catalog.ts')).toContain('AFFILIATE_PROGRAM_ENABLED ?');
    expect(readSrc('content/features.ts')).toContain("...(AFFILIATE_PROGRAM_ENABLED ? [] : ['affiliate'])");
    expect(readSrc('content/features.ts')).toContain("AFFILIATE_PROGRAM_ENABLED ? ', plus a 30% affiliate program' : ''");
    expect(CATALOG.flatMap((g) => g.items).map((i) => i.title)).not.toContain('Affiliate Program');
  });

  it('🔴 and no prerendered page renders a word of it — checked on the built files', () => {
    /* THE ANSWER TO "does the old surface contradict the new entry". It cannot:
       it renders on no page. The claims above live in the JS bundle as data
       behind a `false` constant, never as markup a person can read. */
    const pages = distPages();
    if (pages.length === 0) return;
    expect(pages.length, 'the build produced no pages to sweep').toBeGreaterThan(5);
    for (const [file, html] of pages) {
      const text = words(html);
      expect(text.includes('Earn 30% recurring commission'), `${file} renders the old claim`).toBe(false);
      expect(text.includes('30% / month, for 12 months'), `${file} renders the old rate`).toBe(false);
      expect(/\bBecome an affiliate\b/.test(text), `${file} renders the old CTA`).toBe(false);
      expect(/\bEarn while you grow the kingdom\b/.test(text), `${file} renders the old heading`).toBe(false);
    }
    // The only page that says anything about an affiliate programme is this one,
    // and what it says is that there is not one.
    const naming = pages.filter(([, html]) => /\baffiliate\b/i.test(words(html))).map(([f]) => f);
    expect(naming).toEqual(['dist/features/coming-soon/index.html']);
  });

  it('the referral MECHANISM is untouched, which is why the copy admits to it', () => {
    /* ⚠️ `lib/ref.ts` is deliberately NOT behind the flag: links already shared
       have to keep attributing, or turning the marketing off would silently void
       live referrals. So "there is no link" would have been FALSE, and the
       entry's "Today" paragraph says what is actually true instead. */
    const ref = readSrc('lib/ref.ts');
    // It NAMES the flag, in the comment explaining why it is not behind it —
    // what it must never do is import one and gate on it.
    expect(ref, 'ref capture was put behind the marketing flag')
      .not.toMatch(/import .*AFFILIATE_PROGRAM_ENABLED|if \(AFFILIATE_PROGRAM_ENABLED/);
    expect(ref).toContain('deliberately NOT behind AFFILIATE_PROGRAM_ENABLED');
    expect(ref).toContain('export function captureRefFromUrl');
    expect(item().today).toContain('Links shared while the programme was advertised are still recognised');
    expect(item().today).toContain('nothing is calculated or paid against it');
  });
});
