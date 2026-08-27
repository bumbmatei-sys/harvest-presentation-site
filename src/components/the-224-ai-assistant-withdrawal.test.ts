import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
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
  DODO_ADD_ON_CATALOG,
  INTENTIONALLY_UNADVERTISED,
  addOnAvailability,
  addOnPricingContract,
  dodoAddOnCatalogContract,
  Pricing,
  plans,
  type AddOn,
} from './Pricing';
import { CATALOG, CATALOG_TOOL_COUNT } from './catalog';
import { CATEGORIES } from '../content/features';

/* ─── THE-224 — the $20 AI Assistant add-on gated nothing ─────────────────────
 *
 * A founder on Small Team annual found the in-app AI assistant working without
 * having bought the "AI Assistant" add-on, and was right to: `aiChat` is false /
 * false / true / true across free / Individual / Small Team / Ministry, so the
 * assistant is a PLAN CAPABILITY from Small Team up. The add-on was selling it
 * anyway, at $20/mo, to the two tiers that already had it.
 *
 * 🔴 THE FINDING UNDER THE FINDING: NOTHING ENFORCES A SEAT. The app's
 * `aiAssistant` cell is a COUNT of the retired Telegram assistant, every reader
 * of it sits behind a flag that is false, and no code path compares any usage
 * against it. The two budgets that actually bind AI use are a per-TENANT monthly
 * query-token cap and a flat per-USER message throttle, and neither is derived
 * from a plan feature or moved by an add-on. So the add-on granted nothing on
 * any tier — on Small Team and Ministry it duplicated the plan, and on
 * Individual it would not have switched the assistant on either, because
 * `getEffectiveFeatures` raises a capacity and never a feature flag.
 *
 * The card is therefore withdrawn, which is a copy change and not a reprice:
 * $20/$240 is exactly what Dodo charges and stays pinned in
 * `DODO_ADD_ON_CATALOG`, unadvertised.
 *
 * ⚠️ ASSERTED AGAINST RENDERED OUTPUT. PR 55 is the precedent on this site — a
 * pure-function test passed while the JSX seam was mutated — so the claims below
 * read the markup a visitor gets, not the table behind it. */

const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const cardHtml = (addOn: AddOn) => html(React.createElement(AddOnCard, { addOn }));
const sectionHtml = (term: 'monthly' | 'quarterly' | 'yearly') =>
  html(React.createElement(AddOns, { term }));
const pageHtml = () => html(React.createElement(Pricing));

/** Markup as a visitor reads it: comments dropped, tags stripped, entities
 *  decoded, whitespace collapsed. React splits adjacent text nodes with
 *  `<!-- -->`, so `$` and `20` arrive apart and only rejoin once tags go. */
const words = (markup: string) => markup
  .replace(/<!--.*?-->/g, '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&#x27;|&#39;/g, "'")
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ')
  .trim();

const dollars = (markup: string) =>
  [...words(markup).matchAll(/\$([0-9][0-9,]*(?:\.[0-9]{2})?)/g)].map((m) => Number(m[1].replace(/,/g, '')));

/** The Pricing module's own source, for the module-scope-arming assertion.
 *  ⚠️ Read from disk, never from `git show` — an assertion that shells out to
 *  git is one that fails in a checkout without history, and it would be
 *  asserting what a commit said rather than what this build does. */
const readSource = () =>
  readFileSync(fileURLToPath(new URL('./Pricing.tsx', import.meta.url)), 'utf8');

/* ── 1 ─────────────────────────────────────────────────────────────────────── */
describe('no surface claims the AI Assistant add-on grants a capability the plan already includes', () => {
  it('the pricing page sells no AI assistant at all', () => {
    /* 🔴 THE TICKET'S CENTRAL CLAIM, on the rendered page. The withdrawn card's
       sentence was "Turns on the AI assistant for every member of your
       congregation, in the app — one purchase for the whole plan, not billed per
       person", which is a description of `aiChat`: on from Small Team up, at no
       extra charge. Neither the name, the sentence, nor either figure may
       survive anywhere a visitor reads. */
    const read = words(pageHtml());
    expect(read).not.toMatch(/AI Assistant/i);
    expect(read).not.toMatch(/turns on the AI assistant/i);
    expect(read).not.toMatch(/not billed per person/i);
    expect(read).not.toMatch(/one purchase for the whole plan/i);
  });

  it('no add-on card anywhere promises an AI capability', () => {
    // Every REMAINING card, read as rendered — so this keeps holding if someone
    // later writes the same promise onto Admin seat or Campus. Each of the four
    // survivors raises a countable capacity, and none of them mentions AI.
    for (const term of BILLING_TERMS) {
      const section = words(sectionHtml(term));
      expect(section, `the ${term} add-on section mentions an AI assistant`)
        .not.toMatch(/\bAI\b/i);
      expect(section).not.toMatch(/assistant/i);
      expect(section).not.toMatch(/\bchat\b/i);
    }
    for (const a of ADD_ONS) {
      const card = words(cardHtml(a));
      expect(card, `${a.name}'s card mentions an AI assistant`).not.toMatch(/\bAI\b/i);
      expect(card, `${a.name}'s card mentions an assistant`).not.toMatch(/assistant/i);
    }
  });

  it('and the assistant is still described where it is true — as a plan capability', () => {
    /* ⚠️ THE WITHDRAWAL MAY NOT DELETE THE FEATURE. `aiChat` is real, shipped and
       included from Small Team up, and the site's own feature entry says so
       positionally: `tiers` runs [Individual, Small Team, Ministry], and AI Chat
       carries [0, 1, 1] — which is the app's false / true / true for those three
       tiers exactly. This is the claim the add-on card contradicted, and it is
       what makes the card redundant rather than the feature absent. */
    const aiChat = CATEGORIES
      .flatMap((c) => c.features)
      .find((f) => f.id === 'aichat');
    expect(aiChat, 'the AI Chat feature entry is gone').toBeDefined();
    expect(aiChat!.tiers).toEqual([0, 1, 1]);
    expect(plans.map((p) => p.planId)).toEqual(['plus', 'pro', 'max']);
    // It is still a tool in the catalogue, and still nothing to do with add-ons.
    expect(CATALOG.flatMap((g) => g.items).map((i) => i.title)).toContain('AI Chat');
  });

  it('the site never suggests an AI seat, per person or otherwise', () => {
    // Dodo's own product description says "One additional AI Assistant seat",
    // and nothing in the app counts or enforces a seat. The site must not adopt
    // that vocabulary while it is untrue — reported in the PR so the two can be
    // settled in one place.
    const read = words(pageHtml());
    expect(read).not.toMatch(/AI Assistant seat/i);
    expect(read).not.toMatch(/assistant seat/i);
    // "Admin seat" is a real, enforced seat and stays — proof this sweep is
    // about the AI claim and not about the word.
    expect(read).toMatch(/Admin seat/i);
  });
});

/* ── 2 ─────────────────────────────────────────────────────────────────────── */
describe('the add-on catalogue contract still throws on a price mismatch and an unbacked add-on', () => {
  it('throws when an advertised price is not the live product price', () => {
    // By mutation, not by reading the source. Unchanged behaviour — asserted
    // here because THE-224 edited this function and a guard edited is a guard to
    // re-prove.
    const wrong = ADD_ONS.map((a) => (a.name === 'Admin seat' ? { ...a, monthly: 11, annual: 132 } : a));
    expect(() => dodoAddOnCatalogContract(wrong)).toThrow(/Admin seat/);
  });

  it('throws when an advertised add-on has no live product behind it', () => {
    const unbacked: AddOn[] = [
      ...ADD_ONS,
      { name: 'Invented', monthly: 5, annual: 60, blurb: 'Nothing sells this.', planIds: ['max'] },
    ];
    expect(() => dodoAddOnCatalogContract(unbacked)).toThrow(/no entry in DODO_ADD_ON_CATALOG/);
  });

  it('throws when two add-ons are pinned to one product', () => {
    const collided = {
      ...DODO_ADD_ON_CATALOG,
      Campus: { ...DODO_ADD_ON_CATALOG.Campus, monthlyId: DODO_ADD_ON_CATALOG['Admin seat'].monthlyId },
    };
    expect(() => dodoAddOnCatalogContract(ADD_ONS, collided)).toThrow(/both pinned to the Dodo product/);
  });

  it('still throws on a live product that is neither advertised nor declared', () => {
    /* 🔴 THE CAMPUS FAILURE, WHICH IS THE ONE THE WITHDRAWAL COULD HAVE BROKEN.
       Removing a card trips this check by design, and the fix must not be to
       loosen it. Handing the contract an EMPTY omission list is the withdrawal
       without its declaration, and it must fail exactly as Campus's silent
       absence did. */
    expect(() => dodoAddOnCatalogContract(ADD_ONS, DODO_ADD_ON_CATALOG, {}))
      .toThrow(/Dodo sells the add-on "AI Assistant"/);
    expect(() => dodoAddOnCatalogContract(ADD_ONS.filter((a) => a.name !== 'Campus')))
      .toThrow(/Dodo sells the add-on "Campus"/);
  });

  it('the real tables pass, and the price contract is untouched', () => {
    expect(() => dodoAddOnCatalogContract(ADD_ONS)).not.toThrow();
    expect(() => addOnPricingContract(ADD_ONS)).not.toThrow();
    // The ×12 relation still has teeth on the four that remain.
    const discounted: AddOn = { ...ADD_ONS[0], annual: Math.round(ADD_ONS[0].annual * 0.7) };
    expect(() => addOnPricingContract([discounted])).toThrow(/NOT discounted/);
  });
});

/* ── 3 ─────────────────────────────────────────────────────────────────────── */
describe('an intentionally unadvertised live product is expressible without disabling the contract', () => {
  it('the omission is declared in words, and that is what lets the build pass', () => {
    expect(Object.keys(INTENTIONALLY_UNADVERTISED)).toEqual(['AI Assistant']);
    expect(INTENTIONALLY_UNADVERTISED['AI Assistant']).toMatch(/aiChat|Small Team/);
    // The product it excuses is still fully described — this is an omission from
    // the PAGE, not from the repo's knowledge of what Dodo sells.
    expect(DODO_ADD_ON_CATALOG['AI Assistant']).toBeDefined();
  });

  it('a declared omission cannot also be advertised', () => {
    // The contradiction that a half-finished restore would leave behind.
    const restored: AddOn[] = [
      { name: 'AI Assistant', monthly: 20, annual: 240, blurb: 'x', planIds: ['max'] },
      ...ADD_ONS,
    ];
    expect(() => dodoAddOnCatalogContract(restored)).toThrow(/at the same time/);
  });

  it('an excuse cannot outlive the product it excuses', () => {
    // How a list like this rots into a blanket exemption: entries accumulate for
    // products Dodo no longer sells, and nobody can tell which are load-bearing.
    expect(() => dodoAddOnCatalogContract(ADD_ONS, DODO_ADD_ON_CATALOG, {
      ...INTENTIONALLY_UNADVERTISED,
      Imaginary: 'no such product',
    })).toThrow(/not a product in/);
  });

  it('an omission with no reason is refused', () => {
    expect(() => dodoAddOnCatalogContract(ADD_ONS, DODO_ADD_ON_CATALOG, { 'AI Assistant': '   ' }))
      .toThrow(/no reason/);
  });

  it('the guard is armed at module scope, not merely available to tests', () => {
    // Importing this module ran both contracts against the real tables. A
    // failure would have thrown during the prerender, before any test ran — the
    // property that makes these build failures rather than red tests.
    const src = readSource();
    expect(src).toMatch(/^addOnPricingContract\(ADD_ONS\);$/m);
    expect(src).toMatch(/^dodoAddOnCatalogContract\(ADD_ONS\);$/m);
  });
});

/* ── 4 ─────────────────────────────────────────────────────────────────────── */
describe('no price changed', () => {
  it('the nine plan prices are exactly what they were', () => {
    // 🔴 CONTRACT-PINNED AND LIVE. THE-224 is a card removal; if any of these
    // moved, the change did something it was explicitly forbidden to do.
    expect(plans.map((p) => p.price.monthly)).toEqual([20, 40, 80]);
    expect(plans.map((p) => p.price.quarterly)).toEqual([54, 108, 216]);
    expect(plans.map((p) => p.price.yearly)).toEqual([190, 380, 760]);
    expect(ADVERTISED_DISCOUNT_PCT).toEqual({ quarterly: 10, yearly: 20 });
    expect(plans.every((p) => p.fee === 0)).toBe(true);
  });

  it('all five add-on prices are exactly what they were, the withdrawn one included', () => {
    // The withdrawn card's figures live on in the catalogue, against the live
    // products. Withdrawal is not a reprice, and this is what says so.
    expect(Object.fromEntries(
      Object.entries(DODO_ADD_ON_CATALOG).map(([n, p]) => [n, [p.monthlyCents, p.annualCents]]),
    )).toEqual({
      'AI Assistant': [2000, 24000],
      'Admin seat': [1000, 12000],
      Campus: [1200, 14400],
      'Contacts +500': [1500, 18000],
      'Unlimited contacts': [4000, 48000],
    });
    expect(ADD_ONS.map((a) => [a.name, a.monthly, a.annual])).toEqual([
      ['Admin seat', 10, 120],
      ['Campus', 12, 144],
      ['Contacts +500', 15, 180],
      ['Unlimited contacts', 40, 480],
    ]);
    expect(ADD_ON_BILLED_MONTHS).toBe(12);
  });

  it('every figure still rendered is the figure Dodo charges', () => {
    // Read off the cards, on every term, because the card is what quotes it.
    for (const a of ADD_ONS) {
      const pinned = DODO_ADD_ON_CATALOG[a.name];
      expect(dollars(cardHtml(a))).toEqual([pinned.monthlyCents / 100, pinned.annualCents / 100]);
    }
    const monthly = dollars(sectionHtml('monthly'));
    expect(dollars(sectionHtml('quarterly'))).toEqual(monthly);
    expect(dollars(sectionHtml('yearly'))).toEqual(monthly);
  });

  it('the availability wording is still derived, and one card fewer did not change it', () => {
    for (const a of ADD_ONS) {
      expect(words(cardHtml(a))).toContain(addOnAvailability(a.planIds));
    }
    expect(addOnAvailability(['plus', 'pro', 'max'])).toBe('Available on every paid plan');
    expect(addOnAvailability(['pro', 'max'])).toBe('Small Team and Ministry only');
  });
});

/* ── 5 ─────────────────────────────────────────────────────────────────────── */
describe('the tool count is unchanged at its derived value', () => {
  it('is 27, and is still computed from the catalogue rather than written down', () => {
    // 🔴 AN ADD-ON IS NOT A TOOL. Withdrawing a card from the pricing page must
    // not touch the mega-menu's count, and the two are separate structures —
    // this is what proves the removal did not reach across.
    expect(CATALOG_TOOL_COUNT).toBe(27);
    expect(CATALOG_TOOL_COUNT).toBe(
      CATALOG.reduce((n, g) => n + g.items.filter((i) => !i.soon).length, 0),
    );
  });
});

