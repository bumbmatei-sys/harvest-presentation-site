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

const NEW_TABLE: Record<string, Record<BillingTerm, number>> = {
  plus: { monthly: 20, quarterly: 49, yearly: 165 },
  pro: { monthly: 40, quarterly: 99, yearly: 329 },
  max: { monthly: 80, quarterly: 199, yearly: 659 },
};

const OLD_TABLE: Record<string, Record<BillingTerm, number>> = {
  plus: { monthly: 39, quarterly: 99, yearly: 329 },
  pro: { monthly: 79, quarterly: 199, yearly: 659 },
  max: { monthly: 159, quarterly: 399, yearly: 1329 },
};

/* ── 1 ─────────────────────────────────────────────────────────────────────── */
describe('the nine plan prices match the new table exactly', () => {
  it.each(
    plans.flatMap((p) => BILLING_TERMS.map((term) => [p.planId, p.name, term] as const)),
  )('%s (%s) on %s — in the data and on the card', (planId, _name, term) => {
    const plan = plans.find((p) => p.planId === planId)!;
    const expected = NEW_TABLE[planId][term];
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
    // The four figures that survived did so on a DIFFERENT tier.
    expect(NEW_TABLE.pro.quarterly).toBe(OLD_TABLE.plus.quarterly);
    expect(NEW_TABLE.max.yearly).toBe(OLD_TABLE.pro.yearly);
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
    expect(ADD_ONS.map((a) => ({ name: a.name, monthly: a.monthly, annual: a.annual }))).toEqual([
      { name: 'AI Assistant', monthly: 20, annual: 240 },
      { name: 'Admin seat', monthly: 10, annual: 120 },
      { name: 'Campus', monthly: 12, annual: 144 },
      { name: 'Contacts +500', monthly: 15, annual: 180 },
      { name: 'Unlimited contacts', monthly: 40, annual: 480 },
    ]);
  });

  it('and the page still says a year of an add-on is not discounted', () => {
    const text = pageText();
    expect(text).toContain(`A year of an add-on is ${ADD_ON_BILLED_MONTHS} × its monthly price`);
    expect(text).toContain(`the −${ADVERTISED_DISCOUNT_PCT.yearly}% applies to plans only`);
  });
});

/* ── 3 ─────────────────────────────────────────────────────────────────────── */
describe('yearly claims a flat 30% and quarterly a flat 15%', () => {
  it('both claims are flat, in the helper and in the rendered toggle', () => {
    expect(discountClaim('quarterly')).toBe('Save 15%');
    expect(discountClaim('yearly')).toBe('Save 30%');
    const toggle = words(renderToStaticMarkup(
      React.createElement(TermToggle, { value: 'yearly', onChange: () => {} }),
    ));
    expect(toggle).toContain('-15%');
    expect(toggle).toContain('-30%');
  });

  it('🔴 "up to" is gone from the rendered pricing page entirely', () => {
    // The hedge lived in the copy `discountClaim` produces. Reading it back off
    // the page is what proves it actually left, rather than merely going unused.
    const text = pageText().toLowerCase();
    expect(text).not.toContain('up to 30%');
    expect(text).not.toContain('save up to');
  });
});

/* ── 4 ── 🔴 THE GUARD ─────────────────────────────────────────────────────── */
describe('the claim shape is derived from the price table, not hardcoded', () => {
  /** The shipped rule, restated over an arbitrary plan list. */
  const shapeOf = (table: Record<string, Record<BillingTerm, number>>, term: 'quarterly' | 'yearly') => {
    const saving = (id: string) =>
      (1 - table[id][term] / (table[id].monthly * TERM_MONTHS[term])) * 100;
    const worst = Math.min(...Object.keys(table).map(saving));
    return ADVERTISED_DISCOUNT_PCT[term] <= worst ? 'flat' : 'upTo';
  };

  it('🔴 the SAME rule answers differently for the old table and the new one', () => {
    // A hardcoded 'flat' would be right for today's prices by luck. Only a rule
    // that reads the table returns 'upTo' for the one THE-222 replaced, where
    // Individual's year saved 29.70% against an advertised 30%.
    expect(shapeOf(OLD_TABLE, 'yearly')).toBe('upTo');
    expect(shapeOf(NEW_TABLE, 'yearly')).toBe('flat');
    expect(shapeOf(OLD_TABLE, 'quarterly')).toBe('flat');
    expect(shapeOf(NEW_TABLE, 'quarterly')).toBe('flat');
  });

  it('🔴 and the SHIPPED function flips too, on a mutated plan list', () => {
    // The site's `actualSavingPct` takes a plan object, so the real exported
    // arithmetic can be run against the old prices rather than a replica of it.
    const oldPlans = plans.map((p) => ({ ...p, price: OLD_TABLE[p.planId] }));
    const worstOld = Math.min(...oldPlans.map((p) => actualSavingPct(p, 'yearly')));
    const worstNew = Math.min(...plans.map((p) => actualSavingPct(p, 'yearly')));
    expect(worstOld).toBeCloseTo(29.7008, 3);
    expect(worstNew).toBeCloseTo(31.25, 3);
    expect(ADVERTISED_DISCOUNT_PCT.yearly <= worstOld).toBe(false);
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

  it('the smallest savings are 17.08% quarterly (Ministry) and 31.25% yearly (Individual)', () => {
    expect(actualSavingPct(plans[2], 'quarterly')).toBeCloseTo(17.0833, 3);
    expect(actualSavingPct(plans[0], 'yearly')).toBeCloseTo(31.25, 3);
    expect(Math.min(...plans.map((p) => actualSavingPct(p, 'quarterly')))).toBeCloseTo(17.0833, 3);
    expect(Math.min(...plans.map((p) => actualSavingPct(p, 'yearly')))).toBeCloseTo(31.25, 3);
  });

  it('no rendered percentage on the page exceeds the smallest actual saving', () => {
    // Read every "-N%" the page draws and hold each against the worst tier ON
    // THE TERM IT BELONGS TO. Comparing a yearly badge against quarterly's
    // worst tier would be the wrong test twice over — it would fail a truthful
    // -30% and it would pass a -17% that only quarterly could honour.
    const page = pageText();
    const rendered = [...page.matchAll(/-(\d+)%/g)].map((m) => Number(m[1]));
    expect(rendered.length).toBe(DISCOUNTED_TERMS.length);

    const termOf = (pct: number) =>
      DISCOUNTED_TERMS.find((t) => ADVERTISED_DISCOUNT_PCT[t] === pct);

    for (const pct of rendered) {
      const term = termOf(pct);
      expect(term, `the page renders -${pct}%, which is no term's advertised figure`).toBeDefined();
      const worstOnTerm = Math.min(...plans.map((p) => actualSavingPct(p, term!)));
      expect(
        pct,
        `the page renders -${pct}% for ${term}, but its worst tier saves only ${worstOnTerm.toFixed(2)}%`,
      ).toBeLessThanOrEqual(worstOnTerm);
    }

    // Both discounted terms are actually on the page — an empty or half-drawn
    // toggle would satisfy the loop above without proving anything.
    expect(rendered.sort((a, b) => a - b))
      .toEqual(DISCOUNTED_TERMS.map((t) => ADVERTISED_DISCOUNT_PCT[t]).sort((a, b) => a - b));
  });
});

/* ── 6 ─────────────────────────────────────────────────────────────────────── */
describe('the cross-repo price contract still throws when the repos disagree', () => {
  it('🔴 throws for a one-dollar drift on EVERY tier and EVERY term', () => {
    for (const p of plans) {
      for (const term of BILLING_TERMS) {
        const mutated = {
          plus: { ...NEW_TABLE.plus },
          pro: { ...NEW_TABLE.pro },
          max: { ...NEW_TABLE.max },
        };
        mutated[p.planId as 'plus' | 'pro' | 'max'][term] += 1;
        expect(
          () => planPriceContract(plans, mutated),
          `a $1 drift on ${p.name} ${term} did not fail the contract`,
        ).toThrow(new RegExp(`${p.name}.*${term}`));
      }
    }
  });

  it('names the app as the other side of the disagreement', () => {
    const mutated = { ...NEW_TABLE, plus: { ...NEW_TABLE.plus, monthly: 21 } };
    expect(() => planPriceContract(plans, mutated))
      .toThrow(/Harvest-agent src\/utils\/plan-features\.ts PLAN_PRICING/);
  });

  it('passes for the nine prices actually shipped', () => {
    expect(() => planPriceContract(plans)).not.toThrow();
  });
});

/* ── 10 ────────────────────────────────────────────────────────────────────── */
describe('the cheapest-plan figure follows the new Individual monthly price', () => {
  it('is 20, derived from the table rather than typed', () => {
    expect(CHEAPEST_MONTHLY).toBe(20);
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
