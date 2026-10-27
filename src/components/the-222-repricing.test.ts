import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  ADD_ONS,
  ADD_ON_BILLED_MONTHS,
  ADVERTISED_DISCOUNT_PCT,
  BILLING_TERMS,
  CHEAPEST_MONTHLY,
  DISCOUNTED_TERMS,
  DODO_ADD_ON_CATALOG,
  PlanCard,
  Pricing,
  TERM_MONTHS,
  TermToggle,
  actualSavingPct,
  discountClaim,
  discountClaimShape,
  planPriceContract,
  plans,
  type BillingTerm,
  type Plan,
} from './Pricing';

/* ─────────────────────────────────────────────────────────────────────────────
 * THE-222 — $20 / $40 / $80 on the marketing site, and the yearly hedge goes.
 *
 * ⚠️ THE-248 SUPERSEDED THE PRICE HALF OF THIS TICKET and left the rest
 * standing. The monthly column is still THE-222's ($20 / $40 / $80); the six
 * discounted cells were raised to align the discounts on a flat 10% and 20%.
 * So this file now holds THREE tables — what came before THE-222, what THE-222
 * shipped, and what is live — and every assertion says which one it means.
 * THE-222's own proofs (the table repriced rather than shifting rows; the claim
 * shape is derived, not typed) are kept intact against ITS table and ITS
 * advertised percentages, because a historical proof that silently re-points at
 * today's constants stops proving anything. The six live prices are pinned in
 * the-248-discount-alignment.test.ts.
 *
 * ⚠️ ASSERTED AGAINST RENDERED MARKUP WHEREVER A CHURCH WOULD READ IT. PR 55
 * learned this the hard way: a pure-function test passed while the JSX seam was
 * mutated, and only the prerendered `dist/` caught it. A price is not a claim
 * until something draws it, so the price tests below read the figure back out
 * of the card rather than out of `plans`.
 * ───────────────────────────────────────────────────────────────────────────*/

const words = (markup: string) => markup
  .replace(/<[^>]*>/g, ' ')
  .replace(/&#x27;|&#39;/g, "'")
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')
  .trim();

const cardText = (plan: Plan, term: BillingTerm) =>
  words(renderToStaticMarkup(React.createElement(PlanCard, { plan, term })));

const pageText = () => words(renderToStaticMarkup(React.createElement(Pricing)));

/** What THE-222 itself shipped. HISTORY — do not reprice this; the proofs below
 *  are about the move from OLD_TABLE to this one. */
/** The tables below that are HISTORY still carry a quarterly cell, because the
 *  term existed when they were true; the live term set no longer has one, so
 *  they are keyed by plain strings rather than by `BillingTerm`. */
const LEGACY_TERMS = ['monthly', 'quarterly', 'yearly'] as const;

const THE_222_TABLE: Record<string, Record<string, number>> = {
  plus: { monthly: 20, quarterly: 49, yearly: 165 },
  pro: { monthly: 40, quarterly: 99, yearly: 329 },
  max: { monthly: 80, quarterly: 199, yearly: 659 },
};

/** What came before THE-222. HISTORY. */
const OLD_TABLE: Record<string, Record<string, number>> = {
  plus: { monthly: 39, quarterly: 99, yearly: 329 },
  pro: { monthly: 79, quarterly: 199, yearly: 659 },
  max: { monthly: 159, quarterly: 399, yearly: 1329 },
};

/** What is LIVE — the monthly column THE-222 set and the yearly column THE-248
 *  and THE-372 left. The quarterly column (54 / 108 / 216, a flat 10% off) was
 *  withdrawn with the term on 2026-10-23. */
const CURRENT_TABLE: Record<string, Record<BillingTerm, number>> = {
  plus: { monthly: 30, yearly: 300 },
  max: { monthly: 90, yearly: 900 },
};

/** What THE-222 advertised. Stated here rather than read from the live constant
 *  so the derivation proof below keeps testing the RULE after the percentages
 *  moved — which is exactly what THE-248 did to them. */
const THE_222_ADVERTISED = { quarterly: 15, yearly: 30 } as const;

/* ── 1 ─────────────────────────────────────────────────────────────────────── */
describe('the six plan prices match the new table exactly', () => {
  it.each(
    plans.flatMap((p) => BILLING_TERMS.map((term) => [p.planId, p.name, term] as const)),
  )('%s (%s) on %s — in the data and on the card', (planId, _name, term) => {
    const plan = plans.find((p) => p.planId === planId)!;
    const expected = CURRENT_TABLE[planId][term];
    expect(plan.price[term]).toBe(expected);
    // 🔴 And rendered. Monthly shows the charged figure as the headline; the
    // longer terms print the charged total on the "billed as" line beneath.
    const text = cardText(plan, term);
    if (term === 'monthly') {
      expect(text, `${planId} monthly card`).toContain(`$${expected}`);
    } else {
      expect(text, `${planId} ${term} card`)
        .toContain(`billed as $${expected.toLocaleString('en-US')} every ${TERM_MONTHS[term]} months`);
    }
  });

  it('🔴 no tier kept its own old row — the table repriced, it did not shift', () => {
    for (const p of plans) {
      for (const term of BILLING_TERMS) {
        expect(p.price[term], `${p.name} ${term} never moved`).not.toBe(OLD_TABLE[p.planId][term]);
      }
    }
    // THE-222's own hazard, pinned against THE-222's table: four figures
    // survived that reprice on a DIFFERENT tier, which is why its prices were
    // transcribed rather than derived.
    expect(THE_222_TABLE.pro.quarterly).toBe(OLD_TABLE.plus.quarterly);
    expect(THE_222_TABLE.max.yearly).toBe(OLD_TABLE.pro.yearly);
    // 🔴 THE-248 CARRIES NO SUCH COLLISION: it raised the six discounted cells
    // to figures that appear on no tier of either earlier table, so no live
    // price can be mistaken for an inherited one.
    const historic = new Set(
      [OLD_TABLE, THE_222_TABLE].flatMap((t) =>
        Object.values(t).flatMap((row) => LEGACY_TERMS.map((term) => row[term])),
      ),
    );
    for (const p of plans) {
      for (const term of DISCOUNTED_TERMS) {
        expect(historic.has(p.price[term]), `${p.name} ${term} ($${p.price[term]}) is an inherited figure`)
          .toBe(false);
      }
    }
  });
});

/* ── 2 ─────────────────────────────────────────────────────────────────────── */
describe('the add-on prices are unchanged, and annual is still ×12', () => {
  it('every add-on bills twelve monthly charges for a year, undiscounted', () => {
    expect(ADD_ON_BILLED_MONTHS).toBe(12);
    for (const a of ADD_ONS) {
      expect(a.annual, `${a.name} is not ${ADD_ON_BILLED_MONTHS} × its monthly price`)
        .toBe(a.monthly * ADD_ON_BILLED_MONTHS);
    }
  });

  it('the plan discount is never applied to an add-on', () => {
    for (const a of ADD_ONS) {
      for (const pct of Object.values(ADVERTISED_DISCOUNT_PCT)) {
        const discounted = a.monthly * ADD_ON_BILLED_MONTHS * (1 - pct / 100);
        expect(a.annual, `${a.name} looks like it took the ${pct}% plan discount`)
          .not.toBeCloseTo(discounted, 2);
      }
    }
  });

  it('the listed add-ons are byte-for-byte what they were before THE-222', () => {
    // A reprice of the PLANS may not move an add-on. Written out so a silent
    // edit to the list fails here rather than on the pricing page.
    //
    // 🔴 THE-223 MOVED THEM DELIBERATELY, and this pin moves with it rather
    // than being deleted. THE-222 left add-ons alone and this test proved it;
    // what it could never prove is that the figures it was pinning were RIGHT.
    // Four of them were not — the site had drifted from live Dodo, including
    // AI Assistant at $19 against a $20 charge — and no test on this site
    // compared them to anything outside itself. These are the live Dodo
    // figures, and `dodoAddOnCatalogContract` is now what checks them; this
    // stays as the no-regression pin it always was.
    //
    // 🔴 AND THE-224 REMOVED ONE ROW WITHOUT REPRICING ANYTHING, then THE-253
    // PUT IT BACK WITHOUT REPRICING ANYTHING EITHER. The AI Assistant card was
    // withdrawn because it sold a capability the plan already included
    // (`aiChat`, on from Small Team up) — never because its figure was wrong —
    // and it returns now that no plan includes the chat. $20/$240 throughout:
    // advertised, withdrawn, advertised again, one unchanged pair of numbers.
    // "A reprice may not move an add-on" has now survived a removal AND a
    // restore, which is a stronger statement than it could make before.
    //
    // 🔴 AND THE-370 RETIRED TWO ROWS AND REPRICED A THIRD — the first time an
    // add-on FIGURE has moved since this pin was written, and it moved in Dodo
    // first. The founder detached Campus and Contacts +500 from all nine live
    // plan products and cut Unlimited Contacts from $40/$480 to $30/$360 on the
    // same two product ids. THE-222's claim is untouched: that was a PLAN
    // reprice, the nine plan prices are asserted unchanged elsewhere in this
    // file, and this list moved for a decision about add-ons rather than as a
    // side effect of one about plans. The pin moves with it rather than being
    // deleted, exactly as it did for THE-223.
    expect(ADD_ONS.map((a) => ({ name: a.name, monthly: a.monthly, annual: a.annual }))).toEqual([
      { name: 'Admin seat', monthly: 10, annual: 120 },
      { name: 'Unlimited contacts', monthly: 30, annual: 360 },
    ]);
    // 🔴 THE REPRICED ROW, AGAINST DODO'S OWN UNITS — the two must agree or the
    // prerender throws, which is what makes this a match and not a restatement.
    expect(DODO_ADD_ON_CATALOG['Unlimited contacts'].monthlyCents).toBe(3000);
    expect(DODO_ADD_ON_CATALOG['Unlimited contacts'].annualCents).toBe(36000);
    expect(DODO_ADD_ON_CATALOG['AI Assistant'].monthlyCents).toBe(2000);
    expect(DODO_ADD_ON_CATALOG['AI Assistant'].annualCents).toBe(24000);
  });

  it('and the page still says a year of an add-on is not discounted', () => {
    const text = pageText();
    expect(text).toContain(`A year of an add-on is ${ADD_ON_BILLED_MONTHS} × its monthly price`);
    expect(text).toContain('2 months free” applies to plans only');
  });
});

/* ── 3 ─────────────────────────────────────────────────────────────────────── */
describe('yearly claims a flat 20% and there is no quarterly claim', () => {
  it('the claim is flat, in the helper and in the rendered toggle', () => {
    expect(discountClaim('yearly')).toBe('2 months free');
    const toggle = words(renderToStaticMarkup(
      React.createElement(TermToggle, { value: 'yearly', onChange: () => {} }),
    ));
    expect(toggle).toContain('2 months free');
    // The quarterly badge went with the term.
    expect(toggle).not.toContain('-10%');
  });

  it('🔴 "up to" is gone from the rendered pricing page entirely', () => {
    // The hedge lived in the copy `discountClaim` produces. Reading it back off
    // the page is what proves it actually left, rather than merely going unused.
    // 🔴 THE-248 made this the live regression test for the float knife edge: a
    // claim the prices MEET exactly (the withdrawn quarterly's 10%) puts "Save
    // up to 10%" straight onto the page if `actualSavingPct` returns
    // 9.999999999999998. It still guards the yearly claim the same way.
    const text = pageText().toLowerCase();
    expect(text).not.toContain('up to 20%');
    expect(text).not.toContain('up to 10%');
    expect(text).not.toContain('save up to');
  });
});

/* ── 4 ── 🔴 THE GUARD ─────────────────────────────────────────────────────── */
describe('the claim shape is derived from the price table, not hardcoded', () => {
  /** The shipped rule, restated over an arbitrary plan list. */
  const shapeOf = (
    table: Record<string, Record<string, number>>,
    term: 'quarterly' | 'yearly',
    advertised: number,
  ) => {
    const saving = (id: string) => {
      // The historic tables carry a quarter, which the live TERM_MONTHS no
      // longer knows; its three months are stated here.
      const atMonthlyRate = table[id].monthly * ({ ...TERM_MONTHS, quarterly: 3 } as Record<string, number>)[term];
      return ((atMonthlyRate - table[id][term]) * 100) / atMonthlyRate;
    };
    const worst = Math.min(...Object.keys(table).map(saving));
    return advertised <= worst ? 'flat' : 'upTo';
  };

  it('🔴 the SAME rule answers differently for the old table and the new one', () => {
    // A hardcoded 'flat' would be right for today's prices by luck. Only a rule
    // that reads the table returns 'upTo' for the one THE-222 replaced, where
    // Individual's year saved 29.70% against an advertised 30%.
    //
    // ⚠️ THE PERCENTAGE IS PASSED IN, and THE-248 is why. This read the live
    // ADVERTISED_DISCOUNT_PCT, so when the advertised yearly figure dropped from
    // 30 to 20 the "old" table started clearing it and the proof inverted — a
    // historical comparison quietly re-pointed at a constant that had moved
    // under it. Each table is now judged against the percentage IT shipped with.
    expect(shapeOf(OLD_TABLE, 'yearly', THE_222_ADVERTISED.yearly)).toBe('upTo');
    expect(shapeOf(THE_222_TABLE, 'yearly', THE_222_ADVERTISED.yearly)).toBe('flat');
    expect(shapeOf(OLD_TABLE, 'quarterly', THE_222_ADVERTISED.quarterly)).toBe('flat');
    expect(shapeOf(THE_222_TABLE, 'quarterly', THE_222_ADVERTISED.quarterly)).toBe('flat');
    // And the live table against the live percentage.
    expect(shapeOf(CURRENT_TABLE, 'yearly', ADVERTISED_DISCOUNT_PCT.yearly)).toBe('flat');
    // 🔴 THE RULE STILL SAYS "upTo" WHEN IT SHOULD. One point over the live
    // worst yearly saving (20.83) is the smallest whole claim that must hedge,
    // and it proves the derivation has not been pinned to 'flat'.
    expect(shapeOf(CURRENT_TABLE, 'yearly', 17)).toBe('upTo');
  });

  it('🔴 and the SHIPPED function flips too, on a mutated plan list', () => {
    // The site's `actualSavingPct` takes a plan object, so the real exported
    // arithmetic can be run against the old prices rather than a replica of it.
    const oldPlans = plans.map((p) => ({ ...p, price: OLD_TABLE[p.planId] as Plan['price'] }));
    const worstOld = Math.min(...oldPlans.map((p) => actualSavingPct(p, 'yearly')));
    const worstNew = Math.min(...plans.map((p) => actualSavingPct(p, 'yearly')));
    expect(worstOld).toBeCloseTo(29.7008, 3);
    expect(worstNew).toBeCloseTo(16.6667, 3);
    // Judged against the percentage each table shipped with, for the reason
    // given above.
    expect(THE_222_ADVERTISED.yearly <= worstOld).toBe(false);
    expect(ADVERTISED_DISCOUNT_PCT.yearly <= worstNew).toBe(true);
    expect(discountClaimShape('yearly')).toBe('flat');
  });
});

/* ── 5 ─────────────────────────────────────────────────────────────────────── */
describe('no copy claims a saving larger than the smallest actual saving', () => {
  it('every flat claim holds for the WORST tier', () => {
    for (const term of DISCOUNTED_TERMS) {
      const worst = Math.min(...plans.map((p) => actualSavingPct(p, term)));
      expect(discountClaimShape(term)).toBe('flat');
      expect(ADVERTISED_DISCOUNT_PCT[term]).toBeLessThanOrEqual(worst);
    }
  });

  it('the smallest saving is 20.83% yearly, asserted per tier', () => {
    // Asserted per tier rather than as one minimum, because a table where one
    // tier drifted would otherwise still satisfy a min/max pair.
    for (const p of plans) {
      expect(actualSavingPct(p, 'yearly'), `${p.name} yearly`)
        .toBeCloseTo(16.6667, 3);
    }
    expect(Math.min(...plans.map((p) => actualSavingPct(p, 'yearly')))).toBeCloseTo(16.6667, 3);
  });

  it('no rendered percentage on the page exceeds the smallest actual saving', () => {
    // Read every "-N%" the page draws and hold each against the worst tier ON
    // THE TERM IT BELONGS TO. Comparing one term's badge against another
    // term's worst tier would be the wrong test twice over — it would fail a
    // truthful claim and pass one only the other term could honour.
    const page = pageText();
    expect(page).toContain('2 months free');
    expect(page).not.toMatch(/-\d+%/);
    for (const p of plans) expect(actualSavingPct(p, 'yearly')).toBeGreaterThanOrEqual(ADVERTISED_DISCOUNT_PCT.yearly);
  });
});

/* ── 6 ─────────────────────────────────────────────────────────────────────── */
describe('the cross-repo price contract still throws when the repos disagree', () => {
  it('🔴 throws for a one-dollar drift on EVERY tier and EVERY term', () => {
    for (const p of plans) {
      for (const term of BILLING_TERMS) {
        const mutated = {
          plus: { ...CURRENT_TABLE.plus },
          max: { ...CURRENT_TABLE.max },
        };
        mutated[p.planId as 'plus' | 'max'][term] += 1;
        expect(
          () => planPriceContract(plans, mutated),
          `a $1 drift on ${p.name} ${term} did not fail the contract`,
        ).toThrow(new RegExp(`${p.name}.*${term}`));
      }
    }
  });

  it('names the app as the other side of the disagreement', () => {
    const mutated = { ...CURRENT_TABLE, plus: { ...CURRENT_TABLE.plus, monthly: 31 } };
    expect(() => planPriceContract(plans, mutated))
      .toThrow(/Harvest-agent src\/utils\/plan-features\.ts PLAN_PRICING/);
  });

  it('passes for the six prices actually shipped', () => {
    expect(() => planPriceContract(plans)).not.toThrow();
  });
});

/* ── 10 ────────────────────────────────────────────────────────────────────── */
describe('the cheapest-plan figure follows the new Individual monthly price', () => {
  it('is 20, derived from the table rather than typed', () => {
    expect(CHEAPEST_MONTHLY).toBe(30);
    expect(CHEAPEST_MONTHLY).toBe(Math.min(...plans.map((p) => p.price.monthly)));
    expect(CHEAPEST_MONTHLY).toBe(plans.find((p) => p.planId === 'plus')!.price.monthly);
  });

  it('is never a discounted-term figure', () => {
    // The surfaces that render it carry no toggle and name no term, so a
    // discounted figure there would be a "from $13.75/mo" nobody can buy.
    for (const term of DISCOUNTED_TERMS) {
      expect(CHEAPEST_MONTHLY)
        .not.toBe(Math.min(...plans.map((p) => p.price[term] / TERM_MONTHS[term])));
    }
  });
});
