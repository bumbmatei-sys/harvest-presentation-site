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
 * read the markup a visitor gets, not the table behind it.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔴 THE WITHDRAWAL IS REVERSED BY THE-253 — READ THIS BEFORE TRUSTING THE
 * PROSE ABOVE.
 *
 * THE-224's reasoning was sound and its two premises have both been removed, in
 * the order that kept this page true throughout:
 *
 *   1. "the add-on granted nothing on any tier" — PR 394 made the purchase lift
 *      `aiChat` AND `aiKnowledge` in `getEffectiveFeatures`. That is the BUILD
 *      this file said had not been done.
 *   2. "on Small Team and Ministry it duplicated the plan" — THE-253 took both
 *      cells off ALL FOUR tiers, on founder direction: "NO PLAN HAS ANY AI RAG
 *      CHAT ... if we sell it as an add-on."
 *
 * So the card is advertised again, at the same $20/$240 it was always worth, and
 * the assertions that pinned its ABSENCE invert. Each is marked at its own site
 * with what it used to prove.
 *
 * WHAT STILL STANDS, unchanged and still pinned here:
 *   · 🔴 THERE IS STILL NO SEAT. Nothing counts or enforces one, and this site
 *     still refuses Dodo's "One additional AI Assistant seat" vocabulary.
 *   · The four contract failures — price mismatch, unbacked add-on, id
 *     collision, and a live product neither advertised nor declared. The last
 *     one is now armed HARDER, not softer: with nothing declared, every live
 *     Dodo add-on must appear on the page.
 *   · No price moved, in either direction, at any point.
 * ═══════════════════════════════════════════════════════════════════════════ */

const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const cardHtml = (addOn: AddOn) => html(React.createElement(AddOnCard, { addOn }));
const sectionHtml = (term: 'monthly' | 'yearly') =>
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
  it('🔴 the pricing page sells the AI Assistant, at the price Dodo charges', () => {
    const read = words(pageHtml());
    expect(read).toMatch(/AI assistant messages a month.*coming soon/i);
    expect(read).not.toMatch(/not billed per person/i);
    expect([DODO_ADD_ON_CATALOG['AI Assistant'].monthlyCents, DODO_ADD_ON_CATALOG['AI Assistant'].annualCents]).toEqual([2000, 24000]);
  });

  it('EXACTLY ONE add-on card promises an AI capability, and it is the AI one', () => {
    for (const a of ADD_ONS) expect(words(cardHtml(a))).not.toMatch(/\bAI\b|assistant|\bchat\b/i);
    for (const term of BILLING_TERMS) expect(words(sectionHtml(term))).not.toMatch(/AI Assistant/i);
    expect(INTENTIONALLY_UNADVERTISED['AI Assistant']).toMatch(/coming soon/i);
  });

  it('🔴 and no feature entry claims it as a plan capability any more', () => {
    const byId = (id: string) => CATEGORIES.flatMap(c => c.features).find(f => f.id === id)!;
    // Member AI Chat was dropped (Matei, 2026-10-27). The plan owner's AI
    // assistant is not built yet: no plan claims it, and it reads coming soon.
    expect(CATEGORIES.flatMap(c => c.features).find(f => f.id === 'aichat')).toBeUndefined();
    expect(byId('assistant').tiers).toEqual([0, 0]);
    expect(byId('knowledge').tiers).toEqual([0, 1]);
    expect(byId('assistant').tiersNote).toMatch(/coming soon/i);
    expect(CATALOG.flatMap(g => g.items).find(i => i.title === 'AI Assistant')?.soon).toBe(true);
    expect(CATALOG.flatMap(g => g.items).find(i => i.title === 'AI Chat')).toBeUndefined();
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
      'Unlimited contacts': { ...DODO_ADD_ON_CATALOG['Unlimited contacts'], monthlyId: DODO_ADD_ON_CATALOG['Admin seat'].monthlyId },
    };
    expect(() => dodoAddOnCatalogContract(ADD_ONS, collided)).toThrow(/both pinned to the Dodo product/);
  });

  it('🔴 still throws on a live product that is neither advertised nor declared', () => {
    expect(() => dodoAddOnCatalogContract(ADD_ONS, DODO_ADD_ON_CATALOG, {})).toThrow(/AI Assistant/);
    for (const a of ADD_ONS) expect(() => dodoAddOnCatalogContract(ADD_ONS.filter(x => x.name !== a.name))).toThrow(/Dodo sells the add-on/);
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
  it('the declaration mechanism still works, with nothing currently declared', () => {
    expect(Object.keys(INTENTIONALLY_UNADVERTISED)).toEqual(['AI Assistant']);
    const withoutSeat = ADD_ONS.filter(a => a.name !== 'Admin seat');
    expect(() => dodoAddOnCatalogContract(withoutSeat)).toThrow(/Admin seat/);
    expect(() => dodoAddOnCatalogContract(withoutSeat, DODO_ADD_ON_CATALOG, { ...INTENTIONALLY_UNADVERTISED, 'Admin seat': 'synthetic omission' })).not.toThrow();
  });

  it('a declared omission cannot also be advertised', () => {
    expect(() => dodoAddOnCatalogContract(ADD_ONS, DODO_ADD_ON_CATALOG, { ...INTENTIONALLY_UNADVERTISED, 'Admin seat': 'contradiction' })).toThrow(/at the same time/);
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
    // Asserted on a product that is genuinely absent from the list handed in,
    // so the blank-reason branch is what fails rather than the contradiction
    // branch above. (It used to be 'AI Assistant', which is advertised now.)
    expect(() => dodoAddOnCatalogContract(
      ADD_ONS.filter((a) => a.name !== 'Admin seat'), DODO_ADD_ON_CATALOG, { 'Admin seat': '   ' },
    )).toThrow(/no reason/);
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
  it('the four plan prices are exactly the approved ones', () => {
    // 🔴 CONTRACT-PINNED AND LIVE. THE-224 is a card removal; if any of these
    // moved, the change did something it was explicitly forbidden to do.
    expect(plans.map((p) => p.price.monthly)).toEqual([30, 90]);
    expect(plans.map((p) => p.price.yearly)).toEqual([300, 900]);
    expect(ADVERTISED_DISCOUNT_PCT).toEqual({ yearly: 16 });
    expect(plans.every((p) => p.fee === 0)).toBe(true);
  });

  it('the AI Assistant\u2019s price is exactly what it was, across withdrawal and restore', () => {
    expect([DODO_ADD_ON_CATALOG['AI Assistant'].monthlyCents, DODO_ADD_ON_CATALOG['AI Assistant'].annualCents]).toEqual([2000, 24000]);
    expect(ADD_ONS.map(a => [a.name, a.monthly, a.annual])).toEqual([['Admin seat', 10, 120], ['Unlimited contacts', 30, 360]]);
    expect(ADD_ONS.find(a => a.name === 'AI Assistant')).toBeUndefined();
    expect(ADD_ON_BILLED_MONTHS).toBe(12);
  });

  it('every figure still rendered is the figure Dodo charges', () => {
    // Read off the cards, on every term, because the card is what quotes it.
    for (const a of ADD_ONS) {
      const pinned = DODO_ADD_ON_CATALOG[a.name];
      expect(dollars(cardHtml(a))).toEqual([pinned.monthlyCents / 100, pinned.annualCents / 100]);
    }
    const monthly = dollars(sectionHtml('monthly'));
    expect(dollars(sectionHtml('yearly'))).toEqual(monthly);
  });

  it('the availability wording is still derived, and one card fewer did not change it', () => {
    for (const a of ADD_ONS) {
      expect(words(cardHtml(a))).toContain(addOnAvailability(a.planIds));
    }
    expect(addOnAvailability(['plus', 'max'])).toBe('Available on every paid plan');
    expect(addOnAvailability(['max'])).toBe('Ministry only');
  });
});

/* ── 5 ─────────────────────────────────────────────────────────────────────── */
describe('the tool count is unchanged at its derived value', () => {
  it('is 28, and is still computed from the catalogue rather than written down', () => {
    // 🔴 AN ADD-ON IS NOT A TOOL. Withdrawing a card from the pricing page must
    // not touch the mega-menu's count, and the two are separate structures —
    // this is what proves the removal did not reach across.
    // 🔵 27 → 28 in THE-306: the Shareable Giving Page, a live unflagged
    // tool, joined the Giving & Finance column. Nothing about THIS ticket's
    // subject moved it.
    // 🔵 29 since THE-314 turned SMS back on. It was 28 while the SMS tool was
    // withheld, and 27 before THE-306 added the Shareable Giving Page.
    expect(CATALOG_TOOL_COUNT).toBe(27);
    expect(CATALOG_TOOL_COUNT).toBe(
      CATALOG.reduce((n, g) => n + g.items.filter((i) => !i.soon).length, 0),
    );
  });
});

