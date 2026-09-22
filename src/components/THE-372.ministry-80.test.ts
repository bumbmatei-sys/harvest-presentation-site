import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  ADD_ONS,
  BILLING_TERMS,
  ComparisonTable,
  FREE_TIER,
  FreeTierCard,
  PlanCard,
  formatMonthlyHeadline,
  planPriceContract,
  plans,
  type BillingTerm,
} from './Pricing';
import { CATALOG } from './catalog';
import { TIER_PRICE_CLAIMS, tierPriceMismatches } from '../content/legal';
import { FAQ_PLAN_CLAIMS, faqPlanMismatches } from '../content/faq';
// IMPORTED, NEVER COPIED — the verified stripper, checked in its own file
// against a written-out fixture and against Pricing.tsx's real line count.
import { stripComments } from './the-343-ministry-reprice.test';

/* ─────────────────────────────────────────────────────────────────────────────
 * THE-372 — Ministry back to $80, and the offer label goes.
 *
 * The founder named $80 monthly. The quarter and the year were DERIVED to keep
 * Ministry's existing discount ratios exactly — quarterly 2.7x monthly and
 * annual 9.4x monthly, the ratios THE-343's 60 / 162 / 564 had — which gives
 * 216 and 752. All three were applied in Dodo first and verified live; this
 * repo matches Dodo, not the other way round.
 *
 * And: "no early bird price label." THE-343 had put an outlined offer pill on
 * the Ministry card under RECOMMENDED. It is removed, together with the `Plan`
 * flag that drove it and the `top` prop on `CardEyebrow` that existed only to
 * stack it. The card is left with RECOMMENDED alone at the corner — its shape
 * before THE-343 — and no struck-through or "was" figure replaces the label:
 * $80 is the price, not a discount from anything.
 * ───────────────────────────────────────────────────────────────────────────*/

const ministry = plans.find((p) => p.planId === 'max')!;
const individual = plans.find((p) => p.planId === 'plus')!;
const smallTeam = plans.find((p) => p.planId === 'pro')!;

/**
 * The three live Dodo products, as read back after the founder repriced them.
 * Transcribed from the products, NOT from `plans`, so this is an independent
 * check rather than a restatement. Minor units, the unit in the field name.
 */
const DODO_MINISTRY_LIVE: ReadonlyArray<{ term: BillingTerm; productId: string; priceCents: number }> = [
  { term: 'monthly', productId: 'pdt_0NlJZMUUiT36FGMoiFXgl', priceCents: 8000 },
  { term: 'quarterly', productId: 'pdt_0NloCatUWEkEUq1usWJ0n', priceCents: 21600 },
  { term: 'yearly', productId: 'pdt_0NlJZMXTnpRBAwTfBVpPs', priceCents: 75200 },
];

/* The nine, written out here once more on purpose: an equality check against a
   table derived from `plans` cannot fail. EVERY cell, no exclusion. */
const ALL_NINE_USD: Record<string, Record<BillingTerm, number>> = {
  plus: { monthly: 20, quarterly: 54, yearly: 190 },
  pro: { monthly: 40, quarterly: 108, yearly: 380 },
  max: { monthly: 80, quarterly: 216, yearly: 752 },
};

const card = (planId: string, term: BillingTerm) =>
  renderToStaticMarkup(React.createElement(PlanCard, { plan: plans.find((p) => p.planId === planId)!, term }));
const words = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');

/* ── the swept tree ───────────────────────────────────────────────────────── */

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const rel = (abs: string) => relative(ROOT, abs).split(sep).join('/');

/** Every non-test source file a visitor's page can be built from: the app
 *  code and content under src/, the blog's markdown, the build plugin and the
 *  HTML shell. Test files are OUT by construction — a sweep that read a test
 *  as source text failed this repo's CI once on a price inside a comment
 *  explaining that very test. */
function sourceFiles(): string[] {
  const out: string[] = [];
  (function walk(dir: string) {
    for (const name of readdirSync(dir)) {
      const abs = join(dir, name);
      if (statSync(abs).isDirectory()) { walk(abs); continue; }
      if (/\.test\.tsx?$/.test(name)) continue;
      if (/\.(ts|tsx|md|css|html)$/.test(name)) out.push(abs);
    }
  })(join(ROOT, 'src'));
  out.push(join(ROOT, 'build', 'blog-plugin.ts'), join(ROOT, 'build', 'parse-post.ts'), join(ROOT, 'index.html'));
  return out.sort();
}

/** What a sweep reads: comment-stripped code for TypeScript, and markdown or
 *  HTML with its `<!-- -->` comments removed. Nothing else is transformed. */
function sweepText(abs: string, raw = readFileSync(abs, 'utf8')): string {
  if (/\.tsx?$/.test(abs)) return stripComments(raw);
  return raw.replace(/<!--[\s\S]*?-->/g, '');
}

const SOURCES = sourceFiles().map((abs) => ({ file: rel(abs), code: sweepText(abs) }));

/* Needles are ASSEMBLED, so no file that greps for them — this one included —
   can match itself by spelling one. */
const $ = '$';
const RETIRED_MINISTRY: ReadonlyArray<[RegExp, string]> = [
  [new RegExp(`\\${$}${'16'}${'2'}\\b`), 'the retired Ministry quarter'],
  [new RegExp(`\\${$}${'56'}${'4'}\\b`), 'the retired Ministry year'],
  [new RegExp(`\\${$}${'4'}${'7'}\\b`), 'the retired Ministry yearly headline'],
  [new RegExp(`${'month'}ly:\\s*${'6'}0\\b`), 'a plan table holding the retired Ministry month'],
  [new RegExp(`${'quarter'}ly:\\s*${'16'}2\\b`), 'a plan table holding the retired Ministry quarter'],
  [new RegExp(`(?:${'year'}ly|${'ann'}ual):\\s*${'56'}4\\b`), 'a plan table holding the retired Ministry year'],
];
const SIXTY = new RegExp(`\\${$}${'6'}${'0'}\\b`, 'g');

/**
 * `$60` is ALSO a donation amount in the product mock — the giving vignette's
 * preset buttons, a church's money and never Harvest's price. Named, counted
 * and pinned, so a Ministry `$60` cannot hide behind it: a third occurrence,
 * or one in any other file, fails.
 */
const SIXTY_ALLOWED: Readonly<Record<string, number>> = {
  'src/components/FeatureMock.tsx': 2,
};

function retiredMinistryHits(sources: ReadonlyArray<{ file: string; code: string }>): string[] {
  const hits: string[] = [];
  for (const { file, code } of sources) {
    for (const [re, why] of RETIRED_MINISTRY) {
      if (re.test(code)) hits.push(`${file}: ${why}`);
    }
    const sixties = (code.match(SIXTY) ?? []).length;
    if (sixties !== (SIXTY_ALLOWED[file] ?? 0)) hits.push(`${file}: ${sixties} x the retired Ministry month`);
  }
  return hits;
}

/**
 * Every spelling of an offer label found in either repo or plausibly written
 * next, assembled from fragments. Matched case-insensitively against stripped
 * code, so `EARLY BIRD`, `Early Bird` and the `earlyBird` flag all count.
 */
const OFFER_LABELS: readonly string[] = [
  ['early', ' ', 'bird'], ['early', '-', 'bird'], ['early', '', 'bird'], ['early', '_', 'bird'],
  ['found', 'ing price'], ['found', 'ing member'], ['found', 'ers price'], ['found', "er's price"],
  ['laun', 'ch price'], ['laun', 'ch pricing'], ['laun', 'ch offer'], ['laun', 'ch special'],
  ['intro', 'ductory'], ['intro', ' price'], ['intro', ' offer'],
  ['limited', ' time'], ['limited', '-time'], ['special', ' offer'],
  ['promo', ' price'], ['promo', 'tional price'], ['beta', ' price'], ['pre-', 'launch'],
].map((parts) => parts.join(''));

/**
 * The two places those words appear and are NOT a price label, each named:
 *  · the events mock sells a church's own event tickets, and one ticket tier
 *    in it is called that — a church's product, not Harvest's price;
 *  · the FAQ and the Terms say the 0% platform fee is NOT an introductory
 *    rate — a denial of the label, which is the opposite of carrying it.
 */
function offerLabelHits(sources: ReadonlyArray<{ file: string; code: string }>): string[] {
  const hits: string[] = [];
  const ticketTier = `>${['Early', 'Bird'].join(' ')}</div>`;
  const denial = new RegExp(`not an ${'intro'}ductory rate`, 'gi');
  for (const { file, code } of sources) {
    let text = code.replace(denial, '');
    if (file === 'src/components/FeatureMock.tsx') {
      expect(text.split(ticketTier).length - 1, 'the events mock ticket tier moved').toBe(1);
      text = text.replace(ticketTier, '');
    }
    const lower = text.toLowerCase();
    for (const label of OFFER_LABELS) {
      if (lower.includes(label)) hits.push(`${file}: "${label}"`);
    }
  }
  return hits;
}

/* ── 1 ──────────────────────────────────────────────────────────────────────── */
describe('1 · Ministry is $80 monthly, $216 quarterly, $752 annual', () => {
  it('in the plan data, and in the cross-repo contract that fails the prerender', () => {
    expect(ministry.price).toEqual({ monthly: 80, quarterly: 216, yearly: 752 });
    expect(() => planPriceContract(plans)).not.toThrow();
  });

  it('and it matches Dodo, product by product, in minor units', () => {
    expect(DODO_MINISTRY_LIVE).toHaveLength(BILLING_TERMS.length);
    for (const { term, productId, priceCents } of DODO_MINISTRY_LIVE) {
      expect(ministry.price[term] * 100, `${productId} (${term})`).toBe(priceCents);
    }
  });

  it('the quarter and year keep Ministry\'s discount RATIOS exactly — 2.7x and 9.4x', () => {
    // The founder named only the month; these two are derived, and this is
    // the relationship they were derived to keep. Integer arithmetic, so no
    // float can round a wrong figure into a pass.
    expect(ministry.price.quarterly * 10).toBe(ministry.price.monthly * 27);
    expect(ministry.price.yearly * 10).toBe(ministry.price.monthly * 94);
  });

  it('RENDERED on the card on every term, headline and charged total', () => {
    expect(words(card('max', 'monthly'))).toContain(' $80 /mo');
    expect(words(card('max', 'quarterly'))).toContain('billed as $216 every 3 months');
    expect(words(card('max', 'yearly'))).toContain('billed as $752 every 12 months');
    expect(formatMonthlyHeadline(ministry.price.quarterly, 'quarterly')).toBe('$72');
    // $752 / 12 = $62.6667, CEILED at the cent: never implies less than the bill.
    expect(formatMonthlyHeadline(ministry.price.yearly, 'yearly')).toBe('$62.67');
  });

  it('the Terms and the FAQ quote the same three, and agree with the cards', () => {
    expect(tierPriceMismatches(plans)).toEqual([]);
    expect(faqPlanMismatches(plans)).toEqual([]);
    const terms = TIER_PRICE_CLAIMS.find((c) => c.planId === 'max')!;
    const faq = FAQ_PLAN_CLAIMS.find((c) => c.planId === 'max')!;
    expect([terms.monthly, terms.quarterly, terms.annual]).toEqual([80, 216, 752]);
    expect([faq.monthly, faq.quarterly, faq.annual]).toEqual([80, 216, 752]);
  });
});

/* ── 2 ──────────────────────────────────────────────────────────────────────── */
describe('2 · Individual and Small Team are unchanged', () => {
  it('six cells, enumerated', () => {
    expect(individual.price).toEqual({ monthly: 20, quarterly: 54, yearly: 190 });
    expect(smallTeam.price).toEqual({ monthly: 40, quarterly: 108, yearly: 380 });
  });
});

/* ── 3 ──────────────────────────────────────────────────────────────────────── */
describe('3 · no surface shows a Ministry price of $60, $162 or $564', () => {
  it('the sweep reads the files it claims to — and strips their comments', () => {
    expect(SOURCES.length, 'the sweep found almost nothing — it is vacuous').toBeGreaterThan(60);
    for (const must of [
      'src/components/Pricing.tsx', 'src/content/faq.ts', 'src/content/legal.ts', 'src/content/features.ts',
      'src/content/posts/skool-alternative-for-churches.md', 'build/blog-plugin.ts', 'index.html',
    ]) {
      expect(SOURCES.map((s) => s.file), `${must} is not swept`).toContain(must);
    }
    expect(SOURCES.some((s) => s.file.endsWith('.test.ts')), 'a test file is being read as source').toBe(false);
    // PROVED ON REAL FILES: each carries a `$60` that exists only in a
    // comment, and the stripped text the sweep reads does not.
    const raw = (f: string) => readFileSync(join(ROOT, f), 'utf8');
    const swept = (f: string) => SOURCES.find((s) => s.file === f)!.code;
    expect((raw('src/components/FeatureMock.tsx').match(SIXTY) ?? []).length).toBe(3);
    expect((swept('src/components/FeatureMock.tsx').match(SIXTY) ?? []).length).toBe(2);
    expect(raw('src/content/features.ts')).toMatch(SIXTY);
    expect(swept('src/content/features.ts')).not.toMatch(SIXTY);
  });

  it('nothing in the tree prints or holds a retired Ministry figure', () => {
    expect(retiredMinistryHits(SOURCES)).toEqual([]);
  });

  it('and no COMMENT in shipped source still states the retired quarter or year', () => {
    /* A second, deliberately RAW read — and scoped so it cannot repeat the
       failure that made the sweep above strip comments. That failure read a
       TEST file and matched a figure inside a comment explaining the test;
       this reads NON-TEST source only, and only for $162 and $564, which are
       Ministry's retired quarter and year and legitimate nowhere. A stale
       comment saying Ministry costs $564 is how the next reader restores it.
       ($60 is left to the stripped sweep: it is also a real donation amount.) */
    const hits = sourceFiles()
      .filter((abs) => RETIRED_MINISTRY.slice(0, 2).some(([re]) => re.test(readFileSync(abs, 'utf8'))))
      .map(rel);
    expect(hits).toEqual([]);
    expect(RETIRED_MINISTRY.slice(0, 2).some(([re]) => re.test(`// Ministry is ${$}564 a year`))).toBe(true);
  });

  it('THE MUTATIONS — code is caught, a comment is not, a new $60 is caught', () => {
    const base = { file: 'src/content/planted.ts', code: '' };
    const run = (src: string) => retiredMinistryHits([{ ...base, code: sweepText('x.ts', src) }]);
    expect(run(`// Ministry was ${$}564 a year`)).toEqual([]);
    expect(run(`const s = 'Ministry, ${$}564/yr';`)).toHaveLength(1);
    expect(run(`const s = 'Ministry, ${$}${'6'}0/mo';`)).toHaveLength(1);
    expect(run(`export const t = { ${'month'}ly: ${'6'}0, x: 1 };`)).toHaveLength(1);
    expect(run(`const s = '${$}${'4'}${'7'}.00/month';`)).toHaveLength(1);
    expect(retiredMinistryHits([{ file: 'src/content/posts/x.md', code: sweepText('x.md', `<!-- ${$}564 -->`) }])).toEqual([]);
    expect(retiredMinistryHits([{ file: 'src/content/posts/x.md', code: sweepText('x.md', `**${$}162**`) }])).toHaveLength(1);
  });

  it('and the prerendered pages carry none either, when the build is on disk', () => {
    const DIST = join(ROOT, 'dist');
    if (!existsSync(join(DIST, 'index.html'))) return;
    const pages: string[] = [];
    (function walk(dir: string) {
      for (const name of readdirSync(dir)) {
        const abs = join(dir, name);
        if (statSync(abs).isDirectory()) walk(abs);
        else if (name === 'index.html') pages.push(abs);
      }
    })(DIST);
    expect(pages.length).toBeGreaterThan(20);
    const hits: string[] = [];
    for (const page of pages) {
      const text = words(readFileSync(page, 'utf8'));
      for (const [re, why] of RETIRED_MINISTRY.slice(0, 3)) if (re.test(text)) hits.push(`${rel(page)}: ${why}`);
    }
    expect(hits).toEqual([]);
  });
});

/* ── 4 ──────────────────────────────────────────────────────────────────────── */
describe('4 · no early-bird or equivalent label remains', () => {
  it('no spelling of an offer label, in any swept file', () => {
    expect(offerLabelHits(SOURCES)).toEqual([]);
  });

  it('THE MUTATION — each spelling THE-343 used is caught, and names its file', () => {
    const at = (code: string) => offerLabelHits([{ file: 'src/components/Planted.tsx', code }]);
    expect(at(`<CardEyebrow variant="outline">${['EARLY', 'BIRD'].join(' ')}</CardEyebrow>`))
      .toEqual([`src/components/Planted.tsx: "${['early', 'bird'].join(' ')}"`]);
    expect(at(`{ ${['early', 'Bird'].join('')}: true }`)).toHaveLength(1);
    expect(at(`'${['Early', 'bird'].join('-')} pricing'`)).toHaveLength(1);
    expect(at(`'An ${'intro'}ductory offer'`)).toHaveLength(1);
    // And the denial the FAQ makes is still not a label.
    expect(at(`'It is not an ${'intro'}ductory rate.'`)).toEqual([]);
  });

  it('the Ministry card carries RECOMMENDED alone, at the corner, on every term', () => {
    for (const term of BILLING_TERMS) {
      const pills = [...card('max', term).matchAll(/<span style="position:absolute[^"]*">([^<]*)<\/span>/g)];
      expect(pills.map((m) => m[1]), `Ministry ${term}`).toEqual(['RECOMMENDED']);
      expect(pills[0][0]).toContain('top:18px');
    }
    // And the flag that drove the label is gone from every plan.
    for (const p of plans) expect(Object.keys(p)).not.toContain(['early', 'Bird'].join(''));
  });
});

/* ── 5 ──────────────────────────────────────────────────────────────────────── */
describe('5 · no crossed-out or "was" price remains — $80 is the price, not a discount', () => {
  const rendered = () => [
    ...plans.flatMap((p) => BILLING_TERMS.map((t) => card(p.planId, t))),
    renderToStaticMarkup(React.createElement(FreeTierCard, { tier: FREE_TIER })),
    renderToStaticMarkup(React.createElement(ComparisonTable)),
  ].join('\n');

  const STRUCK: ReadonlyArray<RegExp> = [
    /line-through/i, /text-decoration:\s*line/i, /<s[\s>]/i, /<del[\s>]/i, /<strike[\s>]/i,
    /\bwas \$/i, /regular price/i, /originally \$/i, /\bsave \$\d/i, /\bnow only\b/i,
  ];

  it('no rendered card or comparison cell strikes or "was"-es a figure', () => {
    const html = rendered();
    expect(html.length).toBeGreaterThan(5000);
    for (const re of STRUCK) expect(html, `rendered pricing matches ${re}`).not.toMatch(re);
  });

  it('and no source can render one — no strike-through style anywhere in the code', () => {
    const hits = SOURCES.filter(({ code }) => /line-through|<s>|<del[\s>]|<strike/i.test(code)).map((s) => s.file);
    expect(hits).toEqual([]);
  });

  it('THE MUTATION — a struck "was $60" on a card is caught', () => {
    const planted = card('max', 'monthly').replace(
      'RECOMMENDED</span>',
      'RECOMMENDED</span><span style="text-decoration:line-through">was $60</span>',
    );
    expect(STRUCK.some((re) => re.test(planted))).toBe(true);
  });
});

/* ── 6 ──────────────────────────────────────────────────────────────────────── */
describe('6 · all nine prices pass the strict equality check — no exclusion', () => {
  it('every cell of every tier, against the table written above', () => {
    expect(plans.map((p) => p.planId)).toEqual(['plus', 'pro', 'max']);
    let cells = 0;
    for (const p of plans) {
      for (const term of BILLING_TERMS) {
        expect(p.price[term], `${p.name} ${term}`).toBe(ALL_NINE_USD[p.planId][term]);
        cells += 1;
      }
    }
    expect(cells).toBe(9);
    expect(() => planPriceContract(plans, ALL_NINE_USD)).not.toThrow();
  });

  it('and the contract throws on a $1 drift in ANY of the nine — Ministry included', () => {
    for (const p of plans) {
      for (const term of BILLING_TERMS) {
        const drifted = Object.fromEntries(Object.entries(ALL_NINE_USD).map(([k, v]) => [k, { ...v }]));
        drifted[p.planId][term] += 1;
        expect(() => planPriceContract(plans, drifted), `${p.name} ${term}`).toThrow(new RegExp(`${p.name}.*${term}`));
      }
    }
    // Restoring THE-343's Ministry on one side only is a failed prerender.
    expect(() => planPriceContract(plans, { ...ALL_NINE_USD, max: { monthly: 60, quarterly: 162, yearly: 564 } }))
      .toThrow(/Ministry/);
  });
});

/* ── 7 ──────────────────────────────────────────────────────────────────────── */
describe('7 · the three add-on prices are unchanged', () => {
  it('AI Assistant $20, Admin Seat $10, Unlimited Contacts $30 / $360', () => {
    expect(ADD_ONS.map((a) => [a.name, a.monthly, a.annual])).toEqual([
      ['AI Assistant', 20, 240],
      ['Admin seat', 10, 120],
      ['Unlimited contacts', 30, 360],
    ]);
  });
});

/* ── 8 ──────────────────────────────────────────────────────────────────────── */
describe('8 · contact caps are unchanged', () => {
  it('the cards and the FAQ state THE-370\'s caps, untouched', () => {
    expect(individual.features).toContain('500 contacts · 2 admins');
    expect(smallTeam.features.some((f) => f.startsWith('2,000 contacts'))).toBe(true);
    expect(ministry.features.some((f) => f.startsWith('4,000 contacts'))).toBe(true);
    expect(FAQ_PLAN_CLAIMS.map((c) => [c.planId, c.contacts])).toEqual([
      ['plus', '500'], ['pro', '2,000'], ['max', '4,000'],
    ]);
  });
});

/* ── 9 ──────────────────────────────────────────────────────────────────────── */
describe('9 · a price change does not move the pinned tool count', () => {
  /* THIS FILE REGISTERS NO PIN of its own on the count — three suites keep a
     register of every file that asserts it against a literal, and pin that
     register's size. The assertion form is assembled below, never spelled. */
  it('every assertion of the count across the repo agrees with the catalogue', () => {
    const derived = CATALOG.reduce((n, g) => n + g.items.filter((i) => !i.soon).length, 0);
    const form = new RegExp(`${'CATALOG_TOOL'}_COUNT\\)\\.${'toBe'}\\((\\d+)\\)`, 'g');
    const pins: Array<[string, number]> = [];
    (function walk(dir: string) {
      for (const name of readdirSync(dir)) {
        const abs = join(dir, name);
        if (statSync(abs).isDirectory()) { walk(abs); continue; }
        if (!/\.tsx?$/.test(name)) continue;
        for (const m of stripComments(readFileSync(abs, 'utf8')).matchAll(form)) pins.push([rel(abs), Number(m[1])]);
      }
    })(join(ROOT, 'src'));
    expect(pins.length, 'nothing pins the count — the sweep is vacuous').toBeGreaterThanOrEqual(19);
    expect(new Set(pins.map(([f]) => f)).size).toBeGreaterThanOrEqual(16);
    for (const [f, n] of pins) expect(n, `${f} pins a count the catalogue does not have`).toBe(derived);
    // And the catalogue carries no plan price for a reprice to reach.
    const text = JSON.stringify(CATALOG);
    for (const p of plans) for (const t of BILLING_TERMS) {
      expect(text).not.toMatch(new RegExp(`\\$${p.price[t]}\\b`));
    }
  });
});

/* ── 11 ─────────────────────────────────────────────────────────────────────── */
describe('11 · no emoji and no hardcoded colour reached a rendered card', () => {
  it('the rendered cards carry no emoji', () => {
    for (const p of plans) for (const t of BILLING_TERMS) {
      expect(card(p.planId, t), `${p.name} ${t}`).not.toMatch(/\p{Extended_Pictographic}/u);
    }
  });

  it('the eyebrow reads its colours from tokens (the white on the filled pill predates THE-372)', () => {
    const src = stripComments(readFileSync(join(ROOT, 'src/components/Pricing.tsx'), 'utf8'));
    const from = src.indexOf('export function CardEyebrow(');
    const body = src.slice(from, src.indexOf('export function PlanCard(', from));
    expect(body.length).toBeGreaterThan(200);
    expect(body.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).toEqual(['#fff']);
    expect(body).toContain('var(--brand)');
  });
});
