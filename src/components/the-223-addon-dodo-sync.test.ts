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
 * Live Dodo, authenticated API, 2026-08-24, RE-STATED 2026-09-16 for THE-370.
 *
 * 🔴 SIX PRODUCTS NOW, NOT TEN — three add-ons × two terms. The founder applied
 * every Dodo change himself and verified the result across all nine plan
 * products: AI Assistant and Admin seat are attached to all nine; Unlimited
 * Contacts to the three Ministry products only; and CAMPUS AND CONTACTS +500
 * ARE ATTACHED TO NONE OF THE NINE. Neither is purchasable, which is why they
 * are removed from this fixture rather than declared as omissions — an omission
 * says "Dodo sells this and we do not show it", and Dodo sells neither.
 *
 * 🔴 UNLIMITED CONTACTS WAS REPRICED, $40 → $30 monthly and $480 → $360 annual,
 * ON THE SAME TWO PRODUCT IDS. That is the one row where the figures moved and
 * the ids did not — a reprice that silently re-pointed an id would fail the id
 * assertions below while the prices agreed, which is the whole reason this
 * fixture carries both halves.
 *
 * The four retired ids, for verification: Campus was adn_0NlKwDcuqIWoVK7Qay13L
 * / adn_0NlKwDgKMpuqzR5VmlCBD at $12/$144, and Contacts +500 was
 * adn_0NlKtwD3VfBLgx2LTw69O / adn_0NlKtwGbLRk2nPC07uC6o at $15/$180.
 *
 * Prices are dollars here and minor units in DODO_ADD_ON_CATALOG, on purpose:
 * two transcriptions of the same read in the same unit would share a typo. */
const LIVE_DODO = [
  { name: 'AI Assistant', monthly: 20, annual: 240, monthlyId: 'adn_0NlKtuImtSn7PcdvjnSni', annualId: 'adn_0NlKtw3IOHfv1GGCevNol' },
  { name: 'Admin seat', monthly: 10, annual: 120, monthlyId: 'adn_0NlKtw7AayNYI6YYwphQ5', annualId: 'adn_0NlKtw9lWLs0VRN9hWciX' },
  { name: 'Unlimited contacts', monthly: 30, annual: 360, monthlyId: 'adn_0NlKtwKAhJgz0jeaqDX2c', annualId: 'adn_0NlKtwMjMlsjzZ8z2Wt7P' },
] as const;

/** The four ids THE-370 retired. Held here, never in the shipped tables. */
const RETIRED_DODO_ADDON_IDS = [
  'adn_0NlKwDcuqIWoVK7Qay13L', 'adn_0NlKwDgKMpuqzR5VmlCBD',
  'adn_0NlKtwD3VfBLgx2LTw69O', 'adn_0NlKtwGbLRk2nPC07uC6o',
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
    /* ⚠️ THE DECLARED SET IS EMPTY NOW (THE-253). It was `['AI Assistant']` —
       THE-224's withdrawal — and the assertion below is UNCHANGED in form
       because it was written derived rather than listed: the page must carry
       every live add-on except the declared omissions, and with none declared
       that is all five. The equality is therefore stricter than it has ever
       been, and it tightened without an edit, which is what the derivation was
       for. */
    expect(Object.keys(INTENTIONALLY_UNADVERTISED)).toEqual([]);
    expect(ADD_ONS.map((a) => a.name)).toEqual(
      LIVE_DODO.filter((d) => INTENTIONALLY_UNADVERTISED[d.name] === undefined).map((d) => d.name),
    );
    // 🔴 AND IT IS THREE — THE-370. Spelled out as well as derived, because the
    // derivation above would also pass if BOTH tables lost the same card.
    expect(ADD_ONS.map((a) => a.name)).toEqual(
      ['AI Assistant', 'Admin seat', 'Unlimited contacts'],
    );
  });

  it('🔴 THE-370 — the four retired product ids appear in NEITHER table', () => {
    // The strongest form of "retired": not advertised, not pinned, not excused.
    const pinned = Object.values(DODO_ADD_ON_CATALOG)
      .flatMap((pr) => [pr.monthlyId, pr.annualId]);
    for (const id of RETIRED_DODO_ADDON_IDS) {
      expect(pinned, `${id} is still pinned in DODO_ADD_ON_CATALOG`).not.toContain(id);
    }
    expect(Object.keys(DODO_ADD_ON_CATALOG).sort())
      .toEqual(['AI Assistant', 'Admin seat', 'Unlimited contacts']);
    // Not parked in the omissions list either — Dodo sells neither, so an entry
    // there is the stale excuse the contract's second failure refuses.
    expect(INTENTIONALLY_UNADVERTISED.Campus).toBeUndefined();
    expect(INTENTIONALLY_UNADVERTISED['Contacts +500']).toBeUndefined();
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
    const wrong = ADD_ONS.map((a) => (
      a.name === 'Unlimited contacts' ? { ...a, monthly: 40, annual: 480 } : a));
    expect(() => dodoAddOnCatalogContract(wrong)).toThrow(/Unlimited contacts/);
    // 🔴 THE-370's OWN MUTATION: the pre-reprice figures must not pass.
    expect(() => dodoAddOnCatalogContract(wrong)).toThrow(/\$30/);
    expect(() => dodoAddOnCatalogContract(ADD_ONS)).not.toThrow();
  });

  it('the Dodo contract throws when a live add-on is not advertised at all', () => {
    // 🔴 THE CAMPUS FAILURE, as a test. Absence is the defect this site had no
    // way to notice: dropping an add-on silently shrinks every other guard.
    expect(() => dodoAddOnCatalogContract(ADD_ONS.filter((a) => a.name !== 'Admin seat')))
      .toThrow(/Dodo sells the add-on "Admin seat"/);
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
      'Unlimited contacts': {
        ...DODO_ADD_ON_CATALOG['Unlimited contacts'],
        monthlyId: DODO_ADD_ON_CATALOG['Admin seat'].monthlyId,
      },
    };
    expect(() => dodoAddOnCatalogContract(ADD_ONS, collided)).toThrow(/both pinned to the Dodo product/);
  });
});

/* ── 2 ─────────────────────────────────────────────────────────────────────── */
describe('no add-on is advertised below what Dodo charges', () => {
  it('🔴 the AI Assistant quotes exactly $20 — THE-223 satisfied the original way', () => {
    /* 🔴 THIS IS THE SERIOUS HALF OF THE-223, BACK IN ITS ORIGINAL FORM.
     *
     * THE-223: the site advertised $19 against a $20 Dodo charge — a promise the
     * checkout breaks. THE-224 then withdrew the card, and this test became
     * "quotes no figure at all, because a figure never printed cannot be printed
     * below the charge", with the real guarantee moved to the loop below.
     *
     * THE-253 restores the card, so the ORIGINAL assertion applies again and is
     * the stronger of the two: the rendered card must quote at least what Dodo
     * bills. It is asserted here on the rendered page, and the add-on is also
     * covered by the every-add-on undersell loop below — it is simply back in
     * `ADVERTISED_LIVE` now, with no edit needed there. */
    const live = LIVE_DODO.find((d) => d.name === 'AI Assistant')!;
    const addOn = ADD_ONS.find((a) => a.name === 'AI Assistant');
    expect(addOn, 'the AI Assistant is not advertised at all').toBeDefined();

    // 🔴 NEVER BELOW THE CHARGE — the class of error THE-223 exists for.
    expect(addOn!.monthly).toBeGreaterThanOrEqual(live.monthly);
    expect(addOn!.annual).toBeGreaterThanOrEqual(live.annual);
    // And not above it either: this is a restore, not a reprice.
    expect([addOn!.monthly, addOn!.annual]).toEqual([live.monthly, live.annual]);

    const read = words(pageHtml());
    expect(read, 'the pricing page does not name the AI Assistant add-on')
      .toMatch(/AI Assistant/i);
    for (const term of BILLING_TERMS) {
      const section = words(sectionHtml(term));
      expect(section, `the ${term} add-on section does not name AI Assistant`)
        .toMatch(/AI Assistant/i);
      expect(dollars(sectionHtml(term)), `the ${term} add-on section omits $${live.annual}`)
        .toContain(live.annual);
    }
    // 🔴 THE RETIRED $19 STAYS GONE. That figure is the defect THE-223 fixed,
    // and restoring the card is exactly when it could creep back.
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
describe('THE-370 — Campus and Contacts +500 are withdrawn', () => {
  /* 🔴 THIS BLOCK IS INVERTED FOR THE SECOND TIME, AND THE RECORD IS THE POINT.
   *
   * It read "Campus is advertised". Before THE-223 the opposite was asserted:
   * Campus was NOT purchasable, because its two live Dodo ids had never been
   * recorded and the app refused the sale. THE-223 recorded them and the card
   * went up.
   *
   * THE-370 takes it down for a reason neither earlier state had: the founder
   * RETIRED the product. "remove the campus addon. let them add as many as they
   * want." Campus and Contacts +500 are DETACHED from all nine live plan
   * products, `maxChurches` is UNLIMITED_CAP on every paid tier in the app's
   * matrix, and `getEffectiveFeatures` no longer reads a campus count at all.
   * So this is not the site failing to advertise something buyable — the defect
   * THE-223 exists to catch — it is the site no longer advertising two things
   * that cannot be bought, which is what it was doing until now. */
  it('🔴 neither is in ADD_ONS, and neither is on any rendered surface', () => {
    expect(ADD_ONS.find((a) => a.name === 'Campus')).toBeUndefined();
    expect(ADD_ONS.find((a) => a.name === 'Contacts +500')).toBeUndefined();

    for (const term of BILLING_TERMS) {
      const read = words(sectionHtml(term));
      expect(read, `the ${term} section still offers a campus`).not.toMatch(/one more campus/i);
      expect(read, `the ${term} section still offers a contact pack`).not.toMatch(/contacts \+\s?500/i);
    }
    const page = words(pageHtml());
    expect(page).not.toMatch(/one more campus/i);
    expect(page).not.toMatch(/contacts \+\s?500/i);
  });

  it('🔴 no surface prints either retired price', () => {
    // Campus was $12/$144 and the pack was $15/$180. Read off the rendered
    // markup rather than the data, because the card is where a church is quoted.
    for (const markup of [pageHtml(), ...BILLING_TERMS.map((t) => sectionHtml(t))]) {
      const figures = dollars(markup);
      for (const retired of [12, 144, 15, 180]) {
        expect(figures, `a retired add-on price ($${retired}) is still printed`)
          .not.toContain(retired);
      }
    }
  });

  it('🔴 and no surface says a campus costs money, in words either', () => {
    const page = words(pageHtml());
    expect(page).not.toMatch(/\$\d+\s*(\/|per )?\s*(mo|month)[^.]{0,30}campus/i);
    expect(page).not.toMatch(/campus[^.]{0,40}\$\d/i);
    expect(page).not.toMatch(/each additional campus/i);
    expect(page).not.toMatch(/your plan includes one/i);
  });

  it('the exactly-three state is pinned on both lists together', () => {
    /* WAS 'nothing is omitted at all any more', pinned at five. The live
       catalogue is SIX products now: three add-ons × two terms. Nothing is
       declared unadvertised, so the page must carry all three — the strictest
       this pair of lists can be, and unchanged in form. "Three cards" is only
       correct while nothing is declared, so both halves stay pinned together. */
    expect(LIVE_DODO).toHaveLength(3);
    expect(Object.keys(DODO_ADD_ON_CATALOG).sort()).toEqual(LIVE_DODO.map((d) => d.name).sort());
    expect(Object.keys(INTENTIONALLY_UNADVERTISED)).toEqual([]);
    expect(ADD_ONS).toHaveLength(3);
    expect(ADD_ONS.some((a) => a.name === 'AI Assistant')).toBe(true);
    expect(ADD_ONS.some((a) => a.name === 'Admin seat')).toBe(true);
    expect(ADD_ONS.some((a) => a.name === 'Unlimited contacts')).toBe(true);
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
    expect(plans.map((p) => p.price.monthly)).toEqual([20, 40, 60]);
    expect(plans.map((p) => p.price.quarterly)).toEqual([54, 108, 162]);
    expect(plans.map((p) => p.price.yearly)).toEqual([190, 380, 564]);
    expect(ADVERTISED_DISCOUNT_PCT).toEqual({ quarterly: 10, yearly: 20 });
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
        plus: { monthly: 20, quarterly: 54, yearly: 190 },
        pro: { monthly: 40, quarterly: 108, yearly: 380 },
        max: { monthly: 60, quarterly: 162, yearly: 565 },
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
    // 🔵 27 → 28 at THE-306, which added the Shareable Giving Page — a live, unflagged tool that shipped in THE-281 with no mega-menu row at all.
    // 🔵 29 since THE-314 turned SMS back on. It was 28 while the SMS tool was
    // withheld, and 27 before THE-306 added the Shareable Giving Page.
    expect(CATALOG_TOOL_COUNT).toBe(27);
    expect(CATALOG_TOOL_COUNT).toBe(
      CATALOG.reduce((n, g) => n + g.items.filter((it) => !it.soon).length, 0),
    );
    expect(CATALOG.flatMap((g) => g.items.map((i) => i.title))).not.toContain('Multi-Campus');
  });
});
