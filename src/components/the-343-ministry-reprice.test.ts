import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  ADVERTISED_DISCOUNT_PCT,
  BILLING_TERMS,
  CardEyebrow,
  DISCOUNTED_TERMS,
  FREE_TIER,
  FreeTierCard,
  PlanCard,
  TERM_MONTHS,
  actualSavingPct,
  discountClaim,
  discountClaimContract,
  discountClaimShape,
  formatMonthlyHeadline,
  planPriceContract,
  plans,
  type BillingTerm,
  type Plan,
} from './Pricing';
import { TIER_PRICE_CLAIMS, tierPriceMismatches } from '../content/legal';
import { FAQ_PLAN_CLAIMS, faqPlanMismatches } from '../content/faq';
import { CATALOG, CATALOG_TOOL_COUNT } from './catalog';

/* ─────────────────────────────────────────────────────────────────────────────
 * THE-343 — Ministry drops from $80 to $60.
 *
 * The founder: "I want to move the ministry plan from 80 to 60 because we cut
 * too many features. I'll put 60 as early bird price and as we add more
 * features I will increase the price." SMS, Newsletter, QuickBooks and the
 * Gmail connection were all hidden this week, and Ministry lost the most of the
 * three tiers, so $80 no longer matched what it delivers.
 *
 *   monthly    60   the founder's number
 *   quarterly  162  60 x 3 = 180, less exactly 10% — the same shape as the
 *                   other two tiers, whose quarters are also exactly 10% off
 *   yearly     564  60 x 12 = 720, less 21.67% — better than the advertised 20,
 *                   and 564 / 12 = 47 EXACTLY, so the per-month headline
 *                   carries no cents and reconciles to the dollar
 *
 * 🔴 SUPERSEDED BY THE-372. Ministry is back to $80 monthly, with the quarter
 * and year at $216 and $752 — THE-343's discount RATIOS kept exactly (2.7x
 * and 9.4x monthly) — and the founder removed the offer label this ticket
 * added to the card ("no early bird price label"). Every assertion below that
 * named THE-343's figures or its label now names what the page actually
 * shows, and says so where it moved; `THE-372.ministry-80.test.ts` owns the
 * new guards. The stripper, the contract's teeth and the no-strike-through
 * rule are unchanged, because they were never about the $60.
 *
 * 🔴 THIS FILE IS THE SITE HALF. The app (Harvest-agent) carries the same nine
 * numbers in src/utils/plan-features.ts, and `planPriceContract` throws at
 * module scope during this repo's prerender if the two disagree — so a
 * one-sided reprice is a FAILED BUILD, not a false advertisement.
 * ───────────────────────────────────────────────────────────────────────────*/

const ministry = plans.find((p) => p.planId === 'max')!;
const individual = plans.find((p) => p.planId === 'plus')!;
const smallTeam = plans.find((p) => p.planId === 'pro')!;

const SRC_DIR = fileURLToPath(new URL('..', import.meta.url));
const PRICING_SRC_PATH = fileURLToPath(new URL('./Pricing.tsx', import.meta.url));

/**
 * 🔴 SOURCE WITH COMMENTS STRIPPED, AND THIS FILE CANNOT BE READ ANY OTHER WAY.
 *
 * `Pricing.tsx` is over sixteen hundred lines and mostly PROSE: every price and
 * every eyebrow string appears repeatedly in block comments that explain them.
 * A content grep over the raw file would match a docblock and pass while the
 * code said something else — which is exactly what happened to this repo's own
 * `FOREVER FREE` note, a comment quoting an eyebrow string the rendered pill
 * has never contained (it reads FOR EVANGELISTS).
 *
 * ⚠️ VERIFIED, NOT INHERITED. A stripper elsewhere in this series silently ate
 * ~150 lines of its subject; this one is checked below against a fixture whose
 * every case is written out, and against the real file's line count.
 */
export function stripComments(src: string): string {
  let out = '';
  let i = 0;
  type Mode = 'code' | 'line' | 'block' | 'sq' | 'dq' | 'tpl';
  let mode: Mode = 'code';
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (mode === 'code') {
      if (c === '/' && n === '/') { mode = 'line'; i += 2; continue; }
      if (c === '/' && n === '*') { mode = 'block'; i += 2; continue; }
      if (c === "'") { mode = 'sq'; out += c; i++; continue; }
      if (c === '"') { mode = 'dq'; out += c; i++; continue; }
      if (c === '`') { mode = 'tpl'; out += c; i++; continue; }
      out += c; i++; continue;
    }
    if (mode === 'line') {
      if (c === '\n') { mode = 'code'; out += c; }
      i++; continue;
    }
    if (mode === 'block') {
      if (c === '*' && n === '/') { mode = 'code'; i += 2; continue; }
      // Newlines are KEPT so line numbers do not shift and nothing is "eaten".
      if (c === '\n') out += c;
      i++; continue;
    }
    // Inside a string: copy verbatim, honouring backslash escapes.
    out += c;
    if (c === '\\') { out += src[i + 1] ?? ''; i += 2; continue; }
    if ((mode === 'sq' && c === "'") || (mode === 'dq' && c === '"') || (mode === 'tpl' && c === '`')) {
      mode = 'code';
    }
    i++;
  }
  return out;
}

const PRICING_SRC = readFileSync(PRICING_SRC_PATH, 'utf8');
const PRICING_CODE = stripComments(PRICING_SRC);

/* ── 0 · the stripper itself ──────────────────────────────────────────────── */
describe('🔴 the comment stripper is verified before anything is grepped through it', () => {
  it('removes comments, keeps code, and keeps comment-like text inside strings', () => {
    expect(stripComments('const a = 1; // gone\nconst b = 2;'))
      .toBe('const a = 1; \nconst b = 2;');
    expect(stripComments('const a = /* gone */ 1;')).toBe('const a =  1;');
    expect(stripComments("const s = '// not a comment';")).toBe("const s = '// not a comment';");
    expect(stripComments('const s = "/* not a comment */";')).toBe('const s = "/* not a comment */";');
    expect(stripComments('const s = `a // b /* c */`;')).toBe('const s = `a // b /* c */`;');
    expect(stripComments("const s = 'it\\'s // fine';")).toBe("const s = 'it\\'s // fine';");
    // A multi-line block comment keeps its newlines, so nothing shifts.
    expect(stripComments('a\n/* one\ntwo */\nb')).toBe('a\n\n\nb');
  });

  it('🔴 EATS NOTHING OF THE REAL FILE — it only ever DELETES, and not too much', () => {
    // Card 86bbxkawp: an inherited stripper elsewhere in this series removed
    // ~150 lines of its subject and its guards went quiet. Three independent
    // properties, asserted on the file this suite actually greps.

    // (a) The line count is preserved, so nothing shifts and no block vanished.
    expect(PRICING_CODE.split('\n').length, 'the stripper changed the line count')
      .toBe(PRICING_SRC.split('\n').length);

    // (b) 🔴 THE OUTPUT IS A SUBSEQUENCE OF THE INPUT. This is the property that
    //     makes "it only deletes" checkable: every character it emits appears in
    //     the original, in order. A stripper that rewrote, reordered or
    //     duplicated anything fails here regardless of how much it removed.
    let i = 0;
    for (const ch of PRICING_CODE) {
      const at = PRICING_SRC.indexOf(ch, i);
      expect(at, 'the stripper emitted a character the source does not contain, in order')
        .toBeGreaterThanOrEqual(0);
      i = at + 1;
    }

    // (c) 🔴 AND IT DID NOT DELETE TOO MUCH — anchors spread across the whole
    //     file, including the last export, so a stripper that ate a 150-line
    //     region cannot pass by keeping only the top of the file.
    // In FILE ORDER, which is what makes the ordering assertion below mean
    // something. (This list caught its own first draft: it named
    // `export function ceilToCent(`, which this file spells as a const arrow —
    // the guard failed rather than quietly checking twelve anchors instead of
    // thirteen.)
    const ANCHORS = [
      'export interface Plan {',
      'export const ceilToCent =',
      'export const plans: Plan[] = [',
      'export const FREE_TIER: FreeTier = {',
      'const EXPECTED_PLAN_PRICES',
      'export function planPriceContract(',
      'export const ADVERTISED_DISCOUNT_PCT',
      'export function discountClaimShape(',
      'const popularPlanIdx = plans.findIndex((p) => p.popular);',
      'export function CardEyebrow(',
      'export function PlanCard(',
      'export function FreeTierCard(',
      'export function Pricing()',
    ];
    for (const a of ANCHORS) {
      expect(PRICING_CODE, `the stripper ate the region around "${a}"`).toContain(a);
    }
    // Anchors must be in the same ORDER, so a survivor list cannot be assembled
    // from fragments of a mangled file.
    let prev = -1;
    for (const a of ANCHORS) {
      const at = PRICING_CODE.indexOf(a);
      expect(at, `"${a}" is out of order after stripping`).toBeGreaterThan(prev);
      prev = at;
    }

    // (d) A volume floor, so "deleted almost everything" cannot pass (a)-(c).
    const nonEmpty = PRICING_CODE.split('\n').filter((l) => l.trim()).length;
    expect(nonEmpty, 'the stripper removed far more than the comments')
      .toBeGreaterThan(600);

    // (e) Stripping is idempotent — a second pass finds nothing left to remove.
    expect(stripComments(PRICING_CODE)).toBe(PRICING_CODE);
  });

  it('🔴 the stripper really does hide a comment — proved on this file', () => {
    // `FOREVER FREE` exists ONLY in comments in Pricing.tsx. If it survives the
    // strip, the strip is not working and every grep below is worthless.
    expect(PRICING_SRC, 'the premise moved: FOREVER FREE is no longer in the source')
      .toContain('FOREVER FREE');
    expect(PRICING_CODE, 'a comment survived the strip').not.toContain('FOREVER FREE');
  });
});

/* ── 12 · the site shows $60 for Ministry ─────────────────────────────────── */
describe('12 · the site shows Ministry at the price THE-372 restored', () => {
  it('holds them in the plan data', () => {
    // ⚠️ MOVED AT THE-372: THE-343's 60 / 162 / 564 became 80 / 216 / 752.
    expect(ministry.price).toEqual({ monthly: 80, quarterly: 216, yearly: 752 });
  });

  it('🔴 RENDERS them on the card, per term — not merely holds them', () => {
    const text = (term: BillingTerm) =>
      renderToStaticMarkup(React.createElement(PlanCard, { plan: ministry, term }))
        .replace(/<[^>]*>/g, ' ');
    // Monthly: the headline IS the charged figure.
    expect(text('monthly')).toContain('$80');
    // The other two print the per-month equivalent AND the charged total.
    expect(text('quarterly')).toContain('billed as $216 every 3 months');
    expect(text('quarterly')).toContain('$72');
    expect(text('yearly')).toContain('billed as $752 every 12 months');
    expect(text('yearly')).toContain('$62.67');
  });

  it('the Terms and the FAQ quote the same three, and neither disagrees with the cards', () => {
    // Both run as module-scope guards on their own pages; running them here too
    // means a failure names THIS ticket rather than only stopping the prerender.
    expect(tierPriceMismatches(plans)).toEqual([]);
    expect(faqPlanMismatches(plans)).toEqual([]);
    const terms = TIER_PRICE_CLAIMS.find((c) => c.planId === 'max')!;
    expect([terms.monthly, terms.quarterly, terms.annual]).toEqual([80, 216, 752]);
    const faq = FAQ_PLAN_CLAIMS.find((c) => c.planId === 'max')!;
    expect([faq.monthly, faq.quarterly, faq.annual]).toEqual([80, 216, 752]);
  });

  it('🔴 plus and pro are UNCHANGED — enumerated, so an overreaching reprice fails', () => {
    expect(individual.price).toEqual({ monthly: 20, quarterly: 54, yearly: 190 });
    expect(smallTeam.price).toEqual({ monthly: 40, quarterly: 108, yearly: 380 });
  });
});

/* ── 13 · the cross-repo contract ─────────────────────────────────────────── */
describe('13 · the cross-repo contract agrees, and still has teeth', () => {
  it('passes as shipped — which is what the prerender proves', () => {
    expect(() => planPriceContract(plans)).not.toThrow();
  });

  it('🔴 throws for a $1 drift on EVERY tier and EVERY term — by mutation', () => {
    for (const plan of plans) {
      for (const term of BILLING_TERMS) {
        const drifted = {
          plus: { ...individual.price },
          pro: { ...smallTeam.price },
          max: { ...ministry.price },
        };
        drifted[plan.planId as 'plus' | 'pro' | 'max'][term] += 1;
        expect(
          () => planPriceContract(plans, drifted),
          `a $1 drift on ${plan.name} ${term} did not fail the contract`,
        ).toThrow(new RegExp(`${plan.name}.*${term}`));
      }
    }
  });

  it('🔴 and it would have caught the OLD Ministry prices specifically', () => {
    // The precise one-sided edit a reprice can ship: the site repriced, the app
    // not — or the reverse. Both of Ministry's earlier tables: THE-248's and
    // THE-343's.
    for (const old of [
      { monthly: 80, quarterly: 216, yearly: 760 },
      { monthly: 60, quarterly: 162, yearly: 564 },
    ]) {
      expect(() => planPriceContract(plans, {
        plus: { ...individual.price },
        pro: { ...smallTeam.price },
        max: old,
      })).toThrow(/Ministry/);
    }
  });
});

/* ── 3, 4, 5 · the discounts and the monthly equivalent ───────────────────── */
describe('3, 4, 5 · the delivered discounts and Ministry\'s monthly equivalent', () => {
  it('🔴 quarterly is exactly 10% off on ALL THREE tiers', () => {
    for (const p of plans) {
      expect(actualSavingPct(p, 'quarterly'), `${p.name} quarterly`).toBe(10);
    }
    expect(ministry.price.quarterly).toBe(ministry.price.monthly * 3 * 0.9);
  });

  it('🔴 the delivered yearly percentages, per tier — Ministry now differs', () => {
    expect(actualSavingPct(individual, 'yearly')).toBeCloseTo(20.8333, 4);
    expect(actualSavingPct(smallTeam, 'yearly')).toBeCloseTo(20.8333, 4);
    expect(actualSavingPct(ministry, 'yearly')).toBeCloseTo(21.6667, 4);
    // The advertised claim rests on the WORST tier, which is still 20.83.
    expect(Math.min(...plans.map((p) => actualSavingPct(p, 'yearly')))).toBeCloseTo(20.8333, 4);
  });

  it('🔴 the discount validator PASSES, and would throw one point higher', () => {
    expect(() => discountClaimContract(plans)).not.toThrow();
    expect(discountClaimShape('quarterly')).toBe('flat');
    expect(discountClaimShape('yearly')).toBe('flat');
    expect(discountClaim('quarterly')).toBe('Save 10%');
    expect(discountClaim('yearly')).toBe('Save 20%');
    expect(ADVERTISED_DISCOUNT_PCT).toEqual({ quarterly: 10, yearly: 20 });
    // 🔴 THE MUTATION. A claim above the BEST tier is false under any wording.
    // Ministry's 21.67 raises the yearly ceiling, so 22 is the first figure that
    // no longer clears it — the threshold moved WITH the prices, which is the
    // guard deriving rather than remembering.
    expect(() => discountClaimContract(plans, { quarterly: 11, yearly: 20 }))
      .toThrow(/quarterly advertises 11%/);
    expect(() => discountClaimContract(plans, { quarterly: 10, yearly: 22 }))
      .toThrow(/yearly advertises 22%/);
  });

  it("🔴 Ministry's monthly equivalent is CEILED at the cent, never rounded down", () => {
    // ⚠️ MOVED AT THE-372. THE-343's $564 divided to a clean $47; THE-372's
    // $752 is $62.6667 a month, which the ceiling shows as $62.67 — within
    // four cents of the charged total, and never below it.
    expect(ministry.price.yearly / 12).toBeCloseTo(62.6667, 4);
    expect(formatMonthlyHeadline(ministry.price.yearly, 'yearly')).toBe('$62.67');
    expect(62.67 * 12).toBeGreaterThanOrEqual(ministry.price.yearly);
    // 🔴 THE MUTATION THE-343's NUMBER WAS CHOSEN TO AVOID, and still the rule. 570 is the "natural"
    // 20.83%-off figure and puts the headline on $47.50 — a decimal, and on the
    // exact half-cent boundary that a rounding rule would resolve upward to
    // $48, implying $576 against a charged $570.
    expect(formatMonthlyHeadline(570, 'yearly')).toBe('$47.50');
    expect(formatMonthlyHeadline(570, 'yearly')).not.toBe('$47');
    expect(Math.round(570 / 12)).toBe(48);
    expect(48 * 12).toBeGreaterThan(570);
  });
});

/* ── 11 · the card eyebrows ──────────────────────────────────────────────── */
describe('11 · every card eyebrow goes through one component — and Ministry carries only RECOMMENDED', () => {
  /* ⚠️ INVERTED AT THE-372. THE-343 put a second, outlined offer pill on the
     Ministry card under RECOMMENDED; the founder removed it ("no early bird
     price label"). What THE-343 established and this block still guards is
     the ONE-COMPONENT rule; what it no longer guards is the pill, whose
     absence `THE-372.ministry-80.test.ts` sweeps for by every spelling. */
  const render = (el: React.ReactElement) => renderToStaticMarkup(el);
  const ministryCard = (term: BillingTerm = 'monthly') =>
    render(React.createElement(PlanCard, { plan: ministry, term }));
  const freeCard = () => render(React.createElement(FreeTierCard, { tier: FREE_TIER }));
  const pills = (html: string) =>
    [...html.matchAll(/<span style="position:absolute[^"]*">([^<]*)<\/span>/g)].map((m) => m[1]);

  it('the Ministry card carries exactly one eyebrow, and it is RECOMMENDED', () => {
    for (const term of BILLING_TERMS) {
      expect(pills(ministryCard(term)), `Ministry ${term}`).toEqual(['RECOMMENDED']);
    }
  });

  it('🔴 it is the SAME CODE PATH as the free card\'s eyebrow, not a copy', () => {
    // (a) One component renders both eyebrows. Asserted on COMMENT-STRIPPED
    //     source: this file's docblocks name every one of these strings.
    expect(PRICING_CODE.match(/<CardEyebrow\b/g) ?? [], 'not every eyebrow goes through CardEyebrow')
      .toHaveLength(2);
    expect(PRICING_CODE).toContain('>RECOMMENDED<');
    expect(PRICING_CODE).toContain('>FOR EVANGELISTS<');

    // (b) 🔴 AND NO SECOND IMPLEMENTATION SURVIVES. `position: 'absolute'` with
    //     a `right: 18` corner appears exactly ONCE in the code — inside
    //     CardEyebrow — so neither card can still be hand-rolling a pill.
    expect(PRICING_CODE.match(/right:\s*18\b/g) ?? []).toHaveLength(1);

    // (c) The rendered pills are the same element with the same geometry: the
    //     free card's and Ministry's differ ONLY in text and ground.
    const eyebrow = (html: string, text: string) => {
      const m = html.match(new RegExp(`<span style="([^"]*)">${text}</span>`));
      expect(m, `no ${text} eyebrow rendered`).not.toBeNull();
      return m![1];
    };
    const free = eyebrow(freeCard(), 'FOR EVANGELISTS');
    const rec = eyebrow(ministryCard(), 'RECOMMENDED');
    const geometry = (st: string) => st.replace(/background:[^;]*;?|color:[^;]*;?|border:[^;]*;?/g, '');
    expect(geometry(rec)).toBe(geometry(free));
    // 🔴 BOTH AT THE CORNER. THE-343's `top` prop existed only to stack the
    // offer pill under RECOMMENDED; THE-372 removed the pill and the prop.
    expect(free).toContain('top:18px');
    expect(rec).toContain('top:18px');
    expect(free).toContain('background:transparent');
    expect(free).toContain('border:1px solid var(--brand)');
  });

  it('RECOMMENDED sits at the corner, with nothing stacked beneath it', () => {
    const html = ministryCard();
    expect(html).toMatch(/top:18px[^"]*">RECOMMENDED</);
    expect(html).not.toMatch(/top:46px/);
  });

  it('the free card is undisturbed', () => {
    expect(pills(freeCard())).toEqual(['FOR EVANGELISTS']);
  });

  it('and the other two priced cards carry no eyebrow at all', () => {
    for (const plan of [individual, smallTeam]) {
      const html = render(React.createElement(PlanCard, { plan, term: 'monthly' as BillingTerm }));
      expect(pills(html), `${plan.name} grew an eyebrow`).toEqual([]);
    }
  });

  it('🔴 the filled variant keeps its border-box, so RECOMMENDED did not move', () => {
    // Extracting the component unified the padding. The filled pill was
    // `4px 10px` with NO border and is now `3px 9px` with a 1px TRANSPARENT
    // one — the identical border-box. Reuse must not cost a redesign.
    const filled = render(React.createElement(CardEyebrow, { variant: 'filled', children: 'X' }));
    expect(filled).toContain('padding:3px 9px');
    expect(filled).toContain('border:1px solid transparent');
    expect(filled).toContain('background:var(--brand)');
    const outline = render(React.createElement(CardEyebrow, { variant: 'outline', children: 'X' }));
    expect(outline).toContain('padding:3px 9px');
    expect(outline).toContain('border:1px solid var(--brand)');
  });
});

/* ── 11b · what the eyebrow must NOT say ──────────────────────────────────── */
describe('11b · NO strike-through, NO countdown, NO percentage, NO "rises soon"', () => {
  const renderedCards = () => plans
    .map((p) => BILLING_TERMS.map((t) => renderToStaticMarkup(
      React.createElement(PlanCard, { plan: p, term: t }),
    )).join('\n'))
    .concat(renderToStaticMarkup(React.createElement(FreeTierCard, { tier: FREE_TIER })))
    .join('\n');

  it('🔴 no struck-through price anywhere — the price is the price', () => {
    const html = renderedCards();
    expect(html).not.toMatch(/line-through/i);
    expect(html).not.toMatch(/text-decoration/i);
    expect(html).not.toContain('<s>');
    expect(html).not.toContain('<del');
    // And the retired figures are not printed at all — struck or otherwise.
    // ⚠️ MOVED AT THE-372: $80 and $216 are Ministry's price again, and
    // THE-343's own figures are now the retired ones.
    for (const gone of ['$60', '$162', '$564', '$47', '$760', '$63.34']) {
      expect(html, `${gone} is a retired Ministry price and is still rendered`).not.toContain(gone);
    }
  });

  it('🔴 the eyebrow carries no percentage and no number of any kind', () => {
    // A number in the eyebrow is a second figure to maintain, and a computed
    // discount badge was rejected on this page once already because every tier
    // saves a different amount — which, since this ticket, they do again.
    const html = renderedCards();
    const eyebrows = [...html.matchAll(/<span style="position:absolute[^"]*">([^<]*)<\/span>/g)]
      .map((m) => m[1]);
    expect(eyebrows.length, 'no eyebrows rendered at all — the sweep is vacuous')
      .toBeGreaterThan(0);
    for (const e of eyebrows) {
      expect(e, `eyebrow "${e}" carries a digit`).not.toMatch(/\d/);
      expect(e, `eyebrow "${e}" carries a percentage`).not.toContain('%');
      expect(e, `eyebrow "${e}" carries a currency figure`).not.toContain('$');
    }
  });

  it('🔴 no countdown, no date and no "price rises" line on any card', () => {
    const html = renderedCards().toLowerCase();
    for (const phrase of [
      'countdown', 'rises soon', 'price rises', 'goes up', 'ends soon',
      'limited time', 'offer ends', 'was $', 'save 25', 'hurry', 'act now',
    ]) {
      expect(html, `a card carries "${phrase}"`).not.toContain(phrase);
    }
    // No month name either — `SoonItem` has no date field precisely because
    // dated claims went wrong before, and an eyebrow may not smuggle one in.
    for (const month of ['january', 'february', 'march', 'april', 'may 20', 'june',
                         'july', 'august', 'september', 'october', 'november', 'december']) {
      expect(html, `a card carries the date-like word "${month}"`).not.toContain(month);
    }
  });
});

/* ── 11c · popular: true and the gold column ──────────────────────────────── */
describe('11c · Ministry\'s popular flag and the gold comparison column are untouched', () => {
  it('exactly one plan is popular, and it is Ministry', () => {
    expect(plans.filter((p) => p.popular)).toHaveLength(1);
    expect(plans.find((p) => p.popular)!.planId).toBe('max');
  });

  it('🔴 popularIdx is still DERIVED from that one flag, not restated', () => {
    // #44 fixed a silent mismatch here: the table hard-coded its gold column and
    // kept featuring the old tier when `popular` moved. The derivation is the
    // fix, and a second featured mechanism would reintroduce the bug.
    expect(PRICING_CODE).toContain('plans.findIndex((p) => p.popular)');
    expect(PRICING_CODE).toContain('popularPlanIdx === -1 ? -1 : popularPlanIdx + 1');
    // `popular` is READ in exactly the places that consume the derivation.
    const flagReads = PRICING_CODE.match(/\.popular\b/g) ?? [];
    expect(flagReads.length, 'a new reader of `popular` appeared').toBe(2);
  });

  it('no second flag rides beside `popular` any more (THE-372)', () => {
    // THE-343 added a separate offer flag beside `popular`; THE-372 removed it
    // with the label it drove. No plan carries a key the `Plan` type no longer
    // declares.
    for (const p of plans) {
      expect(Object.keys(p).sort(), `${p.name} carries an undeclared key`).toEqual(
        ['blurb', 'features', 'fee', 'name', 'planId', 'price', ...(p.popular ? ['popular'] : [])].sort(),
      );
    }
  });

  it('the gold column still lands on Ministry in the rendered table', () => {
    // Free is column 0 in the comparison grid, so Ministry's flag (index 2 in
    // `plans`) must resolve to column 3.
    expect(plans.findIndex((p) => p.popular) + 1).toBe(3);
  });
});

/* ── 14 · the tool count ──────────────────────────────────────────────────── */
describe('14 · a price change does not move the tool count', () => {
  /**
   * 🔴 THIS FILE DELIBERATELY REGISTERS NO PIN OF ITS OWN on the tool count.
   *
   * Three suites (THE-306, THE-314, THE-335) maintain a REGISTER of every file
   * asserting that figure against a numeric literal, and each pins the
   * register's own SIZE as well as its values. A new entry here would force an
   * edit to all three — churn on files a REPRICE has no business touching, and
   * exactly the shared-literal contention THE-322 split the ownership register
   * apart to stop.
   *
   * ⚠️ AND THE REGISTER'S SCAN READS RAW SOURCE, comments included. This
   * docblock's FIRST DRAFT spelled the asserted form out in prose to explain
   * why it was being avoided — and thereby registered the pin it was declining
   * to add, breaking all three suites. That is the docblock-quotes-the-gate
   * hazard this series keeps being bitten by, landing on the ticket whose own
   * guards are written to avoid it. The form is described, never spelled.
   *
   * So the claim is made the other way round: the count is DERIVED from the
   * catalogue, and the catalogue is shown to carry no price. That is the
   * property a reprice actually has to establish.
   */
  it('the count is derived from the catalogue, which carries no price at all', () => {
    // ⚠️ ASSERTED IN THIS DIRECTION ON PURPOSE — the derived figure against the
    // export, not the export against the figure. The register's scan matches on
    // the exported name followed by the assertion, so the natural order would
    // enrol this file in a register it has just explained why it is staying out
    // of. Same assertion, and it does not register a pin.
    const derived = CATALOG.reduce((n, g) => n + g.items.filter((it) => !it.soon).length, 0);
    expect(derived, 'the exported count is not what the catalogue actually holds')
      .toBe(CATALOG_TOOL_COUNT);
    const catalogueText = JSON.stringify(CATALOG);
    for (const figure of [
      ...plans.flatMap((p) => BILLING_TERMS.map((t) => String(p.price[t]))),
      '60', '162', '564', '760',
    ]) {
      expect(catalogueText, `the tool catalogue mentions the plan price ${figure}`)
        .not.toMatch(new RegExp(`\\$${figure}\\b`));
    }
  });

  it('🔴 and every assertion of it across the repo agrees with the derived value', () => {
    // Counted from the TREE rather than from a list — a list-shaped sweep is
    // only as good as its list — and compared against the derived figure rather
    // than a literal, so this file states no number of its own.
    const hits: string[] = [];
    (function walk(dir: string) {
      for (const e of readdirSync(dir)) {
        const abs = join(dir, e);
        if (statSync(abs).isDirectory()) { walk(abs); continue; }
        if (!/\.(ts|tsx)$/.test(abs)) continue;
        const code = stripComments(readFileSync(abs, 'utf8'));
        for (const m of code.matchAll(/CATALOG_TOOL_COUNT\s*\)?\s*\.toBe\((\d+)\)/g)) {
          hits.push(`${abs}:${m[1]}`);
        }
      }
    })(SRC_DIR);
    expect(hits.length, 'nothing pins the tool count — the sweep is vacuous')
      .toBeGreaterThan(10);
    for (const h of hits) {
      expect(Number(h.split(':').pop()), `${h} pins a tool count the catalogue does not have`)
        .toBe(CATALOG_TOOL_COUNT);
    }
  });
});

/* ── the free tier, unmoved ───────────────────────────────────────────────── */
describe('the free tier is still a tier and not a price', () => {
  it('is absent from the priced list and from the contract', () => {
    expect(plans.map((p) => p.planId)).toEqual(['plus', 'pro', 'max']);
    expect(plans.find((p) => p.planId === 'free')).toBeUndefined();
    expect(FREE_TIER.planId).toBe('free');
    expect(FREE_TIER as unknown as { price?: unknown }).not.toHaveProperty('price');
  });
});

/* ── every displayed price is derived ─────────────────────────────────────── */
describe('6 · no price literal on a card — every figure is derived', () => {
  /** The PlanCard function body, off comment-stripped source. Sliced between
   *  two anchors that are asserted to exist, because an empty `slice` makes
   *  every assertion over it trivially true — two guards in this series were
   *  vacuous for exactly that reason. */
  const planCardBody = (() => {
    const from = PRICING_CODE.indexOf('export function PlanCard');
    const to = PRICING_CODE.indexOf('export function FreeTierCard');
    expect(from, 'no PlanCard in the stripped source').toBeGreaterThan(-1);
    expect(to, 'no FreeTierCard in the stripped source').toBeGreaterThan(from);
    return PRICING_CODE.slice(from, to);
  })();

  it('🔴 the slice is real before anything is asserted about it', () => {
    expect(planCardBody.length, 'the PlanCard slice is empty — every guard below would be vacuous')
      .toBeGreaterThan(1000);
    expect(planCardBody).toContain('monthlyHeadline');
    expect(planCardBody).toContain('TERM_MONTHS[term]');
  });

  it('🔴 NO STRING LITERAL IN THE CARD CARRIES A CURRENCY FIGURE', () => {
    // The precise hazard: a hardcoded "$60" renders correctly today and
    // silently outlives the next reprice. Every displayed figure must come
    // through `plan.price` or `monthlyHeadline`, never through a literal.
    //
    // Scoped to STRING LITERALS rather than to the whole slice, deliberately:
    // the card is full of legitimate bare numbers — `borderRadius: 24`,
    // `fontSize: 40` — and a blanket digit sweep would read a style value as a
    // price. What can never be right is a currency figure sitting in text.
    const literals = [
      ...planCardBody.matchAll(/'([^'\\]*(?:\\.[^'\\]*)*)'/g),
      ...planCardBody.matchAll(/"([^"\\]*(?:\\.[^"\\]*)*)"/g),
      ...planCardBody.matchAll(/`([^`\\]*(?:\\.[^`\\]*)*)`/g),
    ].map((m) => m[1]);
    expect(literals.length, 'no string literals found — the sweep is vacuous')
      .toBeGreaterThan(5);
    for (const lit of literals) {
      expect(lit, `PlanCard spells a currency figure in a literal: "${lit}"`)
        .not.toMatch(/\$\s*\d/);
    }
    // And the charged figure is interpolated, not typed.
    expect(planCardBody).toContain('price.toLocaleString()');
  });

  it('🔴 THE MUTATION — the sweep really would catch a planted literal', () => {
    // Every guard in this file that reads source is proved capable of failing.
    // A literal price dropped into the card's markup must be caught.
    const planted = planCardBody.replace(
      'price.toLocaleString()',
      "'$60'",
    );
    expect(planted, 'the mutation did not apply').not.toBe(planCardBody);
    const literals = [...planted.matchAll(/'([^'\\]*(?:\\.[^'\\]*)*)'/g)].map((m) => m[1]);
    expect(literals.some((l) => /\$\s*\d/.test(l)), 'the sweep would not have caught a planted $60')
      .toBe(true);
  });
});
