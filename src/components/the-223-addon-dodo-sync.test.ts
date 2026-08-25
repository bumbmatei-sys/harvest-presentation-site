import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  ADD_ON_BILLED_MONTHS,
  ADD_ONS,
  AddOnCard,
  AddOns,
  ADVERTISED_DISCOUNT_PCT,
  BILLING_TERMS,
  DISCOUNTED_TERMS,
  DODO_ADD_ON_CATALOG,
  INTENTIONALLY_UNADVERTISED,
  discountClaim,
  dodoAddOnCatalogContract,
  PlanCard,
  Pricing,
  planPriceContract,
  plans,
  TermToggle,
  type AddOn,
} from './Pricing';
import { CATALOG, CATALOG_TOOL_COUNT } from './catalog';

/* ─── THE-223 — the add-on prices, against the processor that charges them ────
 *
 * The site advertised four of five add-ons at a price Dodo does not charge, and
 * did not advertise the fifth at all. One of the four — AI Assistant at $19
 * against a $20 charge — was an UNDERSELL: a church clicking through would be
 * billed more than the page promised. The other three overstated, which is
 * merely stale.
 *
 * 🔴 WHY IT WENT UNSEEN THROUGH THREE REPRICINGS. The nine PLAN prices are
 * pinned four times over — the cross-repo contract, TIER_PRICE_CLAIMS,
 * FAQ_PLAN_CLAIMS and the digit sweep in price-sources.test.ts — and those
 * guards are what FOUND the unknown price locations in THE-222, by failing the
 * build. Add-ons had exactly one check, `addOnPricingContract`, and it tests a
 * RELATION: annual must be twelve monthlies. $19/$228 satisfies that perfectly.
 * A relation cannot see a figure that is internally consistent and simply wrong,
 * and nothing on this site compared an add-on to anything outside itself.
 *
 * ⚠️ THIS FILE IS THE THIRD COPY OF THE FIGURES, DELIBERATELY, and each copy
 * catches a different mistake:
 *   · `ADD_ONS`               — dollars, and the only figures a visitor reads.
 *   · `DODO_ADD_ON_CATALOG`   — Dodo's minor units and product ids. Disagreeing
 *     with ADD_ONS fails the PRERENDER, so a one-sided edit cannot ship.
 *   · `LIVE_DODO` below       — a dated transcription of an actual API read.
 *     This is what catches an edit that changes BOTH tables together without
 *     going back to the processor, which is the only way the first two can be
 *     wrong and still agree.
 * Three copies is the same ladder the plan prices already stand on. One copy
 * would be a comment.
 */

const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const cardHtml = (addOn: AddOn) => html(React.createElement(AddOnCard, { addOn }));
const sectionHtml = (term: 'monthly' | 'quarterly' | 'yearly') =>
  html(React.createElement(AddOns, { term }));
const pageHtml = () => html(React.createElement(Pricing));

/** Markup as a visitor reads it: tags stripped, entities decoded, spaces
 *  collapsed. ⚠️ React splits adjacent text nodes with `<!-- -->`, so `$` and
 *  `20` arrive as `$<!-- -->20` — stripping tags is what rejoins them, and is
 *  why nothing here matches against raw markup. */
const words = (markup: string) => markup
  .replace(/<!--.*?-->/g, '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&#x27;|&#39;/g, "'")
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ')
  .trim();

/** Every `$N` figure printed in a piece of markup, in order. */
const dollars = (markup: string) =>
  [...words(markup).matchAll(/\$([0-9][0-9,]*(?:\.[0-9]{2})?)/g)].map((m) => Number(m[1].replace(/,/g, '')));

/* ─── THE READ ────────────────────────────────────────────────────────────────
 *
 * Live Dodo, authenticated API, 2026-08-24. `client.addons.list()` returned ten
 * add-on products — five add-ons × two terms, and nothing else, which is how
 * "anything else omitted for the same reason as Campus?" is answered: no. The
 * `planIds` column was read separately from `client.products.retrieve()` on all
 * nine plan products, whose `addons` arrays ARE the availability matrix.
 *
 * Prices are dollars here and minor units in DODO_ADD_ON_CATALOG, on purpose:
 * two transcriptions of the same read in the same unit would share a typo. */
const LIVE_DODO = [
  { name: 'AI Assistant', monthly: 20, annual: 240, monthlyId: 'adn_0NlKtuImtSn7PcdvjnSni', annualId: 'adn_0NlKtw3IOHfv1GGCevNol' },
  { name: 'Admin seat', monthly: 10, annual: 120, monthlyId: 'adn_0NlKtw7AayNYI6YYwphQ5', annualId: 'adn_0NlKtw9lWLs0VRN9hWciX' },
  { name: 'Campus', monthly: 12, annual: 144, monthlyId: 'adn_0NlKwDcuqIWoVK7Qay13L', annualId: 'adn_0NlKwDgKMpuqzR5VmlCBD' },
  { name: 'Contacts +500', monthly: 15, annual: 180, monthlyId: 'adn_0NlKtwD3VfBLgx2LTw69O', annualId: 'adn_0NlKtwGbLRk2nPC07uC6o' },
  { name: 'Unlimited contacts', monthly: 40, annual: 480, monthlyId: 'adn_0NlKtwKAhJgz0jeaqDX2c', annualId: 'adn_0NlKtwMjMlsjzZ8z2Wt7P' },
] as const;

/* The live products this site is expected to QUOTE — every one Dodo sells, less
   the omissions declared (and independently checked) in Pricing.tsx. Derived,
   so withdrawing or restoring a card moves it without an edit here, and so a
   card that vanishes WITHOUT being declared still fails the set check above. */
const ADVERTISED_LIVE = LIVE_DODO.filter((d) => INTENTIONALLY_UNADVERTISED[d.name] === undefined);

/* ── 1 ─────────────────────────────────────────────────────────────────────── */
describe('every add-on price matches live Dodo', () => {
  it('advertises exactly the add-ons Dodo sells, minus the declared omissions', () => {
    // Campus is why this assertion exists. An add-on missing from the page is
    // invisible to every check that iterates ADD_ONS — including all five
    // below — so the SET is checked before any price is.
    //
    // 🔴 THE-224 MADE ONE ABSENCE LEGITIMATE, and this is still an equality
    // rather than a subset: the page must carry every live add-on EXCEPT the
    // ones named in INTENTIONALLY_UNADVERTISED, and no others. An undeclared
    // disappearance fails here exactly as Campus's did, and a declared one that
    // is also advertised fails in the contract itself.
    expect(Object.keys(INTENTIONALLY_UNADVERTISED)).toEqual(['AI Assistant']);
    expect(ADD_ONS.map((a) => a.name)).toEqual(
      LIVE_DODO.filter((d) => INTENTIONALLY_UNADVERTISED[d.name] === undefined).map((d) => d.name),
    );
  });

  // 🔴 One named test per add-on: a single loop reports "add-ons are wrong",
  // which is not a bug report. Five names means the failure says which product.
  it.each(ADVERTISED_LIVE.map((d) => [d.name, d] as const))(
    '%s is advertised at the price Dodo charges',
    (name, live) => {
      const addOn = ADD_ONS.find((a) => a.name === name)!;
      expect(addOn, `${name} is not advertised at all`).toBeDefined();

      // 🔴 READ OFF THE RENDERED CARD, not off the data. PR 55 is the precedent:
      // a pure-function test passed while the JSX seam was mutated, and only the
      // prerendered dist/ caught it. The card is where a church is quoted.
      const [monthly, annual, ...rest] = dollars(cardHtml(addOn));
      expect(rest, `${name} prints an unexplained third figure`).toEqual([]);
      expect(monthly, `${name}: the card prints $${monthly}/mo, Dodo charges $${live.monthly} (${live.monthlyId})`)
        .toBe(live.monthly);
      expect(annual, `${name}: the card prints $${annual}/yr, Dodo charges $${live.annual} (${live.annualId})`)
        .toBe(live.annual);

      // And the build-time contract's own table was transcribed from the same
      // products — ids included, so "which product is this?" is answerable.
      const pinned = DODO_ADD_ON_CATALOG[name];
      expect(pinned, `${name} has no entry in DODO_ADD_ON_CATALOG`).toBeDefined();
      expect(pinned.monthlyCents).toBe(live.monthly * 100);
      expect(pinned.annualCents).toBe(live.annual * 100);
      expect(pinned.monthlyId).toBe(live.monthlyId);
      expect(pinned.annualId).toBe(live.annualId);
    },
  );

  it('the Dodo contract throws when an advertised price is not the product price', () => {
    // The guard has teeth, proved by mutation rather than by reading it. This
    // is the check that did not exist while four prices drifted.
    const wrong = ADD_ONS.map((a) => (a.name === 'Campus' ? { ...a, monthly: 20, annual: 240 } : a));
    expect(() => dodoAddOnCatalogContract(wrong)).toThrow(/Campus/);
    expect(() => dodoAddOnCatalogContract(ADD_ONS)).not.toThrow();
  });

  it('the Dodo contract throws when a live add-on is not advertised at all', () => {
    // 🔴 THE CAMPUS FAILURE, as a test. Absence is the defect this site had no
    // way to notice: dropping an add-on silently shrinks every other guard.
    expect(() => dodoAddOnCatalogContract(ADD_ONS.filter((a) => a.name !== 'Campus')))
      .toThrow(/Dodo sells the add-on "Campus"/);
  });

  it('the Dodo contract throws when two add-ons are pinned to one product', () => {
    /* How a copy-paste makes one entry point at another's product. Only the ID
       is duplicated — Campus keeps its own correct prices — because copying the
       whole entry would trip the price check first and prove nothing about the
       id check. This is the shape that would otherwise pass every other
       assertion here: the figures are right, and they are pinned to a product
       that does not charge them. */
    const collided = {
      ...DODO_ADD_ON_CATALOG,
      Campus: { ...DODO_ADD_ON_CATALOG.Campus, monthlyId: DODO_ADD_ON_CATALOG['Admin seat'].monthlyId },
    };
    expect(() => dodoAddOnCatalogContract(ADD_ONS, collided)).toThrow(/both pinned to the Dodo product/);
  });
});

/* ── 2 ─────────────────────────────────────────────────────────────────────── */
describe('no add-on is advertised below what Dodo charges', () => {
  it('the AI Assistant quotes no figure at all, because THE-224 withdrew it', () => {
    /* 🔴 THIS WAS THE SERIOUS HALF OF THE-223 AND IS NOW SATISFIED THE OTHER
       WAY. The assertion was that the AI Assistant's card quoted at least the
       $20 Dodo bills — the site had shipped $19 against a $20 charge, which is
       a promise the checkout breaks. THE-224 withdrew the card, so the page
       quotes nothing for it, and a figure that is never printed cannot be
       printed below the charge.

       ⚠️ THE OLD GUARANTEE IS NOT DROPPED, IT MOVED: the undersell check now
       runs over every advertised add-on in the test below, and the AI
       Assistant's real price stays pinned against its live products here. What
       this asserts is the withdrawal itself, on the RENDERED page — no card, no
       name, neither figure — because that is the claim the ticket makes. */
    const live = LIVE_DODO.find((d) => d.name === 'AI Assistant')!;
    expect(ADD_ONS.find((a) => a.name === 'AI Assistant')).toBeUndefined();

    const read = words(pageHtml());
    expect(read, 'the pricing page still names the withdrawn AI Assistant add-on')
      .not.toMatch(/AI Assistant/i);
    for (const term of BILLING_TERMS) {
      const section = words(sectionHtml(term));
      expect(section, `the ${term} add-on section still names AI Assistant`)
        .not.toMatch(/AI Assistant/i);
      expect(dollars(sectionHtml(term)), `the ${term} add-on section still prints $${live.annual}`)
        .not.toContain(live.annual);
    }
    // The retired $19 stays gone, and the real price stays pinned unadvertised.
    expect(read).not.toMatch(/\$19(?![\d,])/);
    expect(DODO_ADD_ON_CATALOG['AI Assistant'].monthlyCents).toBe(live.monthly * 100);
    expect(DODO_ADD_ON_CATALOG['AI Assistant'].annualCents).toBe(live.annual * 100);
  });

  it('holds for every add-on, not just the one that was wrong', () => {
    // The undersell is a class of error, not an incident. Checked on rendered
    // cards so it covers the seam as well as the table.
    for (const live of ADVERTISED_LIVE) {
      const [monthly, annual] = dollars(cardHtml(ADD_ONS.find((a) => a.name === live.name)!));
      expect(monthly, `${live.name} advertises $${monthly}/mo below Dodo's $${live.monthly}`)
        .toBeGreaterThanOrEqual(live.monthly);
      expect(annual, `${live.name} advertises $${annual}/yr below Dodo's $${live.annual}`)
        .toBeGreaterThanOrEqual(live.annual);
    }
  });
});

/* ── 3 ─────────────────────────────────────────────────────────────────────── */
describe('Campus is advertised', () => {
  const campus = () => ADD_ONS.find((a) => a.name === 'Campus')!;

  it('appears on the pricing page with both its figures', () => {
    // Absent since the section shipped in #58, because its live Dodo ids had
    // never been recorded. Both exist now (Harvest-agent DODO_LIVE_ADDONS), all
    // nine live plan products carry the period-matched Campus add-on, and the
    // app raises `maxChurches` per campus owned. It is buyable, so it is shown.
    expect(campus()).toBeDefined();
    for (const term of BILLING_TERMS) {
      const read = words(sectionHtml(term));
      expect(read, `the ${term} section does not mention Campus`).toMatch(/campus/i);
    }
    expect(dollars(cardHtml(campus()))).toEqual([12, 144]);
    expect(words(pageHtml())).toMatch(/campus/i);
  });

  it('is sold on every paid plan, as the live products say', () => {
    expect(campus().planIds).toEqual(['plus', 'pro', 'max']);
    expect(words(cardHtml(campus()))).toContain('Available on every paid plan');
  });

  it('does not imply any tier includes more than one campus', () => {
    /* 🔴 `maxChurches` is 1 on every paid tier in the app's matrix, and this
       add-on is the ONLY path past it — one campus per purchase. A card reading
       "run every campus from one plan" (the feature page's line, still behind
       MULTI_CAMPUS_ENABLED) would make a tier claim the ladder cannot honour. */
    const read = words(cardHtml(campus()));
    expect(read).toContain('One more campus');
    expect(read).toContain('Your plan includes one');
    expect(read).not.toMatch(/every campus|all your campuses|unlimited campuses/i);
  });

  it('nothing else was omitted for the same reason', () => {
    // The live catalogue is ten products: five add-ons × two terms. Campus was
    // the only one this site did not advertise BY ACCIDENT — and the AI
    // Assistant is now the only one it does not advertise ON PURPOSE. Both
    // halves are pinned, because "four cards" is only correct while the missing
    // fifth is the declared one.
    expect(LIVE_DODO).toHaveLength(5);
    expect(Object.keys(DODO_ADD_ON_CATALOG).sort()).toEqual(LIVE_DODO.map((d) => d.name).sort());
    expect(Object.keys(INTENTIONALLY_UNADVERTISED)).toEqual(['AI Assistant']);
    expect(ADD_ONS).toHaveLength(4);
    expect(ADD_ONS.some((a) => a.name === 'Campus')).toBe(true);
  });
});

/* ── 4 ─────────────────────────────────────────────────────────────────────── */
describe("every add-on's annual price is exactly twelve times its monthly", () => {
  it('holds on every rendered card', () => {
    // Read off the card, because the card is what quotes it. ADD_ON_BILLED_MONTHS
    // stays 12: Dodo bills an add-on on its product's cycle and a quarterly plan
    // product carries the MONTHLY add-on ids, so there is no third figure.
    expect(ADD_ON_BILLED_MONTHS).toBe(12);
    for (const a of ADD_ONS) {
      const [monthly, annual] = dollars(cardHtml(a));
      expect(annual, `${a.name}: $${annual} is not ${ADD_ON_BILLED_MONTHS} × $${monthly}`)
        .toBe(monthly * ADD_ON_BILLED_MONTHS);
    }
  });

  it('holds in the live Dodo products themselves, not just on this site', () => {
    // The ×12 rule is Dodo's behaviour, not a site convention. If Dodo ever
    // discounted an add-on annually this is what would notice.
    for (const live of LIVE_DODO) {
      expect(live.annual, `Dodo prices ${live.name} at $${live.annual}/yr, not 12 × $${live.monthly}`)
        .toBe(live.monthly * ADD_ON_BILLED_MONTHS);
      const pinned = DODO_ADD_ON_CATALOG[live.name];
      expect(pinned.annualCents).toBe(pinned.monthlyCents * ADD_ON_BILLED_MONTHS);
    }
  });

  it('the prices do not move with the term toggle, because they do not move in Dodo', () => {
    const monthly = dollars(sectionHtml('monthly'));
    expect(dollars(sectionHtml('quarterly'))).toEqual(monthly);
    expect(dollars(sectionHtml('yearly'))).toEqual(monthly);
  });
});

/* ── 5 ─────────────────────────────────────────────────────────────────────── */
describe('the page still states that add-ons are not discounted annually', () => {
  it('says so on the prerendered page, where a −30% badge is visible', () => {
    // 🔴 THE HONEST QUALIFIER. Without it, five undiscounted prices sitting a
    // few hundred pixels under a "Save 30%" badge read as already discounted.
    // The toggle prerenders on Yearly, so this IS the default page.
    const read = words(pageHtml());
    expect(read).toMatch(/add-ons are not discounted/i);
    expect(read).toContain(`the −${ADVERTISED_DISCOUNT_PCT.yearly}% applies to plans only`);
    expect(read).toContain(`A year of an add-on is ${ADD_ON_BILLED_MONTHS} × its monthly price`);
  });

  it('says so for every discounted term, not only the yearly one', () => {
    // A visitor under a −15% quarterly badge reads these prices as discounted
    // exactly as an annual visitor does.
    for (const term of DISCOUNTED_TERMS) {
      const read = words(sectionHtml(term));
      expect(read, `the ${term} section drops the qualifier`).toMatch(/not discounted/i);
      expect(read).toContain(`the −${ADVERTISED_DISCOUNT_PCT[term]}% applies to plans only`);
    }
  });

  it('keeps ADD_ON_BILLED_MONTHS at 12 and derives the sentence from it', () => {
    expect(ADD_ON_BILLED_MONTHS).toBe(12);
    // Derived, so the sentence and the arithmetic cannot come to disagree.
    expect(words(sectionHtml('yearly'))).toContain(`is ${ADD_ON_BILLED_MONTHS} × its monthly price`);
  });
});

/* ── 6 ─────────────────────────────────────────────────────────────────────── */
describe('no discount badge is applied to an add-on', () => {
  it('no add-on card renders a percentage at all', () => {
    /* ⚠️ STRUCTURAL, NOT A STRING COINCIDENCE. The badge prints an ASCII
       hyphen (`-30%`) and the qualifier a Unicode minus (`−30%`), so a naive
       sweep would "pass" for a reason that has nothing to do with the claim.
       What is actually true, and what is asserted, is that a card carries no
       percentage whatsoever — no badge, no saving, no rate. (`words()` strips
       tags first, so the `width:100%` in the inline styles is not in scope.) */
    for (const a of ADD_ONS) {
      expect(words(cardHtml(a)), `${a.name}'s card renders a percentage`).not.toMatch(/%/);
    }
  });

  it('the badge is the toggle\'s, and the add-on section never renders one', () => {
    // The badge exists and is rendered by TermToggle — asserted so this test
    // cannot pass by the badges having quietly disappeared everywhere.
    const toggle = words(html(React.createElement(TermToggle, { value: 'yearly' as const, onChange: () => {} })));
    expect(toggle).toContain(`-${ADVERTISED_DISCOUNT_PCT.yearly}%`);
    expect(toggle).toContain(`-${ADVERTISED_DISCOUNT_PCT.quarterly}%`);

    for (const term of BILLING_TERMS) {
      const read = words(sectionHtml(term));
      // The flat claims the toggle derives from the plan table, in either
      // minus form, and the "Save N%" wording they render as.
      for (const pct of Object.values(ADVERTISED_DISCOUNT_PCT)) {
        expect(read, `the ${term} add-on section renders a -${pct}% badge`).not.toContain(`-${pct}%`);
      }
      for (const dt of DISCOUNTED_TERMS) {
        expect(read, `the ${term} add-on section renders "${discountClaim(dt)}"`)
          .not.toContain(discountClaim(dt));
      }
      // The ONLY percentage the section may print is the qualifier's own, and
      // it says the discount does NOT apply here.
      for (const match of read.matchAll(/\S*\d+%/g)) {
        expect(read, `"${match[0]}" is a percentage outside the not-discounted sentence`)
          .toContain(`${match[0]} applies to plans only`);
      }
    }
  });

  it('no add-on figure is a plan discount applied to its own price', () => {
    // The arithmetic mistake this section is one edit away from: 30% off an
    // add-on's own price appearing on its own card.
    for (const a of ADD_ONS) {
      const own = dollars(cardHtml(a));
      for (const pct of Object.values(ADVERTISED_DISCOUNT_PCT)) {
        for (const base of [a.monthly, a.annual]) {
          const wrong = Math.round(base * (1 - pct / 100));
          if (wrong === a.monthly || wrong === a.annual) continue;
          expect(own, `${a.name}: $${wrong} is ${pct}% off its own price`).not.toContain(wrong);
        }
      }
    }
  });
});

/* ── 7 ─────────────────────────────────────────────────────────────────────── */
describe('the nine plan prices are unchanged', () => {
  it('holds in the plan table', () => {
    // 🔴 EXPLICITLY OUT OF SCOPE AND ASSERTED ANYWAY. $20/$49/$165,
    // $40/$99/$329 and $80/$199/$659 are live in Dodo and correct — confirmed
    // against the nine live plan products in the same API read as the add-ons.
    expect(plans.map((p) => p.price.monthly)).toEqual([20, 40, 80]);
    expect(plans.map((p) => p.price.quarterly)).toEqual([49, 99, 199]);
    expect(plans.map((p) => p.price.yearly)).toEqual([165, 329, 659]);
    expect(ADVERTISED_DISCOUNT_PCT).toEqual({ quarterly: 15, yearly: 30 });
  });

  it('holds on the rendered plan cards, on every term', () => {
    for (const p of plans) {
      for (const term of BILLING_TERMS) {
        const markup = html(React.createElement(PlanCard, { plan: p, term }));
        expect(dollars(markup), `${p.name} ${term} no longer prints its price`)
          .toContain(p.price[term]);
      }
    }
  });

  it('leaves the platform fee at zero on every tier', () => {
    // PLATFORM_FEE_MAP and the 0% donation fee were out of scope.
    for (const p of plans) expect(p.fee).toBe(0);
  });
});

/* ── 8 ─────────────────────────────────────────────────────────────────────── */
describe('the cross-repo plan contract still throws when the repos disagree', () => {
  it('throws on a one-sided change, named by tier and term', () => {
    // 🔴 BY MUTATION, not by pattern-matching the source. The contract compares
    // the site's nine cells against the app's PLAN_PRICING transcribed; handing
    // it a table with one cell moved is the two repos disagreeing.
    expect(() =>
      planPriceContract(plans, {
        plus: { monthly: 20, quarterly: 49, yearly: 165 },
        pro: { monthly: 40, quarterly: 99, yearly: 329 },
        max: { monthly: 80, quarterly: 199, yearly: 660 },
      }),
    ).toThrow(/Ministry.*yearly/);
  });

  it('throws on every cell, not just the one that has been tested before', () => {
    // A contract that only ever fails on the top-right cell is a contract with
    // one working assertion. All nine are exercised, each on its own mutation.
    const base: Record<string, Record<string, number>> = Object.fromEntries(
      plans.map((p) => [p.planId, { ...p.price }]),
    );
    for (const p of plans) {
      for (const term of BILLING_TERMS) {
        const mutated = {
          ...base,
          [p.planId]: { ...base[p.planId], [term]: base[p.planId][term] + 1 },
        } as Record<string, Record<typeof term, number>>;
        expect(
          () => planPriceContract(plans, mutated as never),
          `the contract accepts a wrong ${p.name} ${term} price`,
        ).toThrow(new RegExp(`${p.name}.*${term}`));
      }
    }
  });

  it('accepts the live table, so the two repos agree today', () => {
    expect(() => planPriceContract(plans)).not.toThrow();
  });
});

/* ── 9 ─────────────────────────────────────────────────────────────────────── */
describe('the tool count is unchanged at its derived value', () => {
  it('is 28, and is still counted rather than stated', () => {
    // Add-ons are capacity, not tools — none of this may inflate the "N tools
    // in one platform" claim. Campus in particular: the catalogue's
    // Multi-Campus entry stays behind MULTI_CAMPUS_ENABLED, and flipping that
    // flag would add a 29th tool. Advertising the add-on did not flip it.
    expect(CATALOG_TOOL_COUNT).toBe(28);
    expect(CATALOG_TOOL_COUNT).toBe(
      CATALOG.reduce((n, g) => n + g.items.filter((it) => !it.soon).length, 0),
    );
    expect(CATALOG.flatMap((g) => g.items.map((i) => i.title))).not.toContain('Multi-Campus');
  });
});
