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
  it('🔴 the pricing page sells the AI Assistant, at the price Dodo charges', () => {
    /* WAS 'the pricing page sells no AI assistant at all' — the same four
       patterns, asserted ABSENT. The withdrawn card's sentence was "Turns on the
       AI assistant for every member of your congregation, in the app — one
       purchase for the whole plan, not billed per person", and THE-224's
       objection was that this described `aiChat`, which was on from Small Team
       up at no extra charge. It no longer is, on any tier — so the same sentence
       is now true, and the card is back. */
    const read = words(pageHtml());
    expect(read).toMatch(/AI Assistant/i);
    expect(read).toMatch(/not billed per person/i);
    expect(read).toMatch(/one purchase for the whole plan/i);
    // The figure a visitor acts on, and it is Dodo's — $20/mo, $240/yr.
    expect(read).toMatch(/\$20/);
    expect(DODO_ADD_ON_CATALOG['AI Assistant'].monthlyCents).toBe(2000);
    expect(DODO_ADD_ON_CATALOG['AI Assistant'].annualCents).toBe(24000);
  });

  it('EXACTLY ONE add-on card promises an AI capability, and it is the AI one', () => {
    /* WAS 'no add-on card anywhere promises an AI capability' — the whole
       section and every card asserted free of /AI/, /assistant/ and /chat/.
       🔴 THE SCOPE OF THAT CLAIM IS WHAT SURVIVES, NOT ITS VALUE. The point was
       never "the word AI is banned" — it was that a card may not promise a
       capability the purchase does not grant. So the sweep is kept and narrowed
       to the FOUR OTHERS: if someone later writes the same promise onto Admin
       seat or Campus, this still fails, exactly as before. */
    const AI = 'AI Assistant';
    for (const a of ADD_ONS.filter((x) => x.name !== AI)) {
      const card = words(cardHtml(a));
      expect(card, `${a.name}'s card mentions an AI assistant`).not.toMatch(/\bAI\b/i);
      expect(card, `${a.name}'s card mentions an assistant`).not.toMatch(/assistant/i);
      expect(card, `${a.name}'s card mentions a chat`).not.toMatch(/\bchat\b/i);
    }
    // And the AI card says what the app actually grants: both halves of the RAG
    // capability, for the whole congregation, once.
    const ai = ADD_ONS.find((a) => a.name === AI);
    expect(ai, 'the AI Assistant card is missing').toBeDefined();
    const aiCard = words(cardHtml(ai!));
    expect(aiCard).toMatch(/AI chat/i);
    expect(aiCard).toMatch(/knowledge base/i);
    // Every term's section carries it exactly once — no duplicate row.
    for (const term of BILLING_TERMS) {
      const section = words(sectionHtml(term));
      expect((section.match(/AI Assistant/gi) || []).length, `${term} section`).toBe(1);
    }
  });

  it('🔴 and no feature entry claims it as a plan capability any more', () => {
    /* WAS 'the assistant is still described where it is true — as a plan
       capability', pinning `tiers: [0, 1, 1]` on the AI Chat entry as the app's
       false/true/true for [Individual, Small Team, Ministry]. That array was
       THE-224's evidence that the card was redundant.
     *
     * 🔴 IT IS [0, 0, 0] NOW, AND THAT IS WHAT MAKES THE CARD HONEST. A lit chip
     * is this site's way of saying "included in this plan"; the app grants
     * neither cell on any tier, so none may be lit. The claim did not disappear
     * — it moved to the add-on card, where a price sits beside it.
     *
     * ⚠️ THE FEATURE ITSELF IS STILL DESCRIBED, which is the half of the
     * original assertion that never changed: the entry, its copy and its
     * catalogue tool are all still here. THE-224 said "the withdrawal may not
     * delete the feature"; THE-253 says the same of the tier correction. */
    const byId = (id: string) => CATEGORIES.flatMap((c) => c.features).find((f) => f.id === id);
    const aiChat = byId('aichat');
    expect(aiChat, 'the AI Chat feature entry is gone').toBeDefined();
    expect(aiChat!.tiers).toEqual([0, 0, 0]);
    // 🔴 `aiKnowledge` moves with it — the chat answers only from the KB, so a
    // page that included one and sold the other would describe no real product.
    const knowledge = byId('knowledge');
    expect(knowledge, 'the AI Knowledge Base feature entry is gone').toBeDefined();
    expect(knowledge!.tiers).toEqual([0, 0, 0]);
    // Both say where the capability actually comes from, in words.
    for (const f of [aiChat!, knowledge!]) {
      expect(f.tiersNote, `${f.id} has no note explaining the add-on`).toBeTruthy();
      expect(f.tiersNote!).toMatch(/AI Assistant add-on/i);
    }
    expect(plans.map((p) => p.planId)).toEqual(['plus', 'pro', 'max']);
    // Still a tool in the catalogue — a nav entry names what EXISTS, not what a
    // plan includes, so it neither moved nor should have.
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

  it('🔴 still throws on a live product that is neither advertised nor declared', () => {
    /* 🔴 THE CAMPUS FAILURE — THE ONE CHECK THIS TICKET COULD HAVE WEAKENED, AND
       DID NOT.
     *
     * WAS: `dodoAddOnCatalogContract(ADD_ONS, DODO_ADD_ON_CATALOG, {})` throws
     * for "AI Assistant" — the withdrawal WITHOUT its declaration, failing
     * exactly as Campus's silent absence had.
     *
     * That case is gone because the card is advertised again, so an empty
     * omission list is now the REAL state and must PASS. The check itself is
     * therefore armed harder than before, not softer: with nothing declared,
     * every live Dodo add-on must appear on the page, and dropping ANY of the
     * five now trips it. Asserted for all five rather than the one, so the
     * strengthening is proved and not just claimed. */
    expect(() => dodoAddOnCatalogContract(ADD_ONS, DODO_ADD_ON_CATALOG, {})).not.toThrow();
    for (const name of Object.keys(DODO_ADD_ON_CATALOG)) {
      expect(
        () => dodoAddOnCatalogContract(ADD_ONS.filter((a) => a.name !== name)),
        `dropping "${name}" did not trip the unadvertised-product check`,
        // Escaped — "Contacts +500" carries a regex metacharacter.
      ).toThrow(new RegExp(`Dodo sells the add-on "${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
    }
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
    /* WAS: `Object.keys(INTENTIONALLY_UNADVERTISED)` equals `['AI Assistant']`,
       with a reason mentioning `aiChat` or Small Team — the withdrawal's
       signature, and what let the build pass with a card missing.
     *
     * 🔴 THE LIST IS EMPTY NOW, because the omission is over. The CONSTANT
     * stays, and so does every behaviour that makes it a declaration rather than
     * a suppression — proved here against a SYNTHETIC entry, so the mechanism is
     * still exercised end to end while nothing real is excused. That is the
     * difference between "no longer needed" and "no longer works". */
    expect(INTENTIONALLY_UNADVERTISED).toEqual({});
    // A real omission, declared in words, still lets the contract pass.
    const withoutCampus = ADD_ONS.filter((a) => a.name !== 'Campus');
    expect(() => dodoAddOnCatalogContract(withoutCampus)).toThrow(/Dodo sells the add-on "Campus"/);
    expect(() => dodoAddOnCatalogContract(withoutCampus, DODO_ADD_ON_CATALOG, {
      Campus: 'a synthetic declaration, to prove the mechanism is still live',
    })).not.toThrow();
    // Every product is still fully described here — the page's contents are one
    // question, the repo's knowledge of what Dodo sells is another.
    expect(DODO_ADD_ON_CATALOG['AI Assistant']).toBeDefined();
  });

  it('a declared omission cannot also be advertised', () => {
    /* THE CONTRADICTION A HALF-FINISHED RESTORE LEAVES BEHIND — and THE-253 is
       exactly that restore, so this is the check it had to satisfy rather than
       edit. It used to be exercised by re-adding an AI Assistant row while the
       declaration stood; the row is now real, so the declaration is the
       synthetic half. Either way the two statements contradict and the build
       stops. */
    expect(() => dodoAddOnCatalogContract(ADD_ONS, DODO_ADD_ON_CATALOG, {
      'AI Assistant': 'declared unadvertised while the card is on the page',
    })).toThrow(/at the same time/);
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
      ADD_ONS.filter((a) => a.name !== 'Campus'), DODO_ADD_ON_CATALOG, { Campus: '   ' },
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
  it('the nine plan prices are exactly what they were', () => {
    // 🔴 CONTRACT-PINNED AND LIVE. THE-224 is a card removal; if any of these
    // moved, the change did something it was explicitly forbidden to do.
    expect(plans.map((p) => p.price.monthly)).toEqual([20, 40, 80]);
    expect(plans.map((p) => p.price.quarterly)).toEqual([54, 108, 216]);
    expect(plans.map((p) => p.price.yearly)).toEqual([190, 380, 760]);
    expect(ADVERTISED_DISCOUNT_PCT).toEqual({ quarterly: 10, yearly: 20 });
    expect(plans.every((p) => p.fee === 0)).toBe(true);
  });

  it('all five add-on prices are exactly what they were, the RESTORED one included', () => {
    /* WAS '...the withdrawn one included': the AI Assistant's figures lived on
       in the catalogue while nothing quoted them, which is what said the
       withdrawal was not a reprice. The card is back and the figures did not
       move — $20/$240 throughout — so the same assertion now says a RESTORE is
       not a reprice either. Both directions, one unchanged pair of numbers. */
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
      ['AI Assistant', 20, 240],
      ['Admin seat', 10, 120],
      ['Campus', 12, 144],
      ['Contacts +500', 15, 180],
      ['Unlimited contacts', 40, 480],
    ]);
    // 🔴 The advertised row and the live product agree, which is the whole
    // point of restoring from the catalogue rather than retyping a figure.
    const ai = ADD_ONS.find((a) => a.name === 'AI Assistant')!;
    expect([ai.monthly * 100, ai.annual * 100])
      .toEqual([DODO_ADD_ON_CATALOG['AI Assistant'].monthlyCents,
                DODO_ADD_ON_CATALOG['AI Assistant'].annualCents]);
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
  it('is 28, and is still computed from the catalogue rather than written down', () => {
    // 🔴 AN ADD-ON IS NOT A TOOL. Withdrawing a card from the pricing page must
    // not touch the mega-menu's count, and the two are separate structures —
    // this is what proves the removal did not reach across.
    // 🔵 27 → 28 in THE-306: the Shareable Giving Page, a live unflagged
    // tool, joined the Giving & Finance column. Nothing about THIS ticket's
    // subject moved it.
    // 🔵 29 since THE-314 turned SMS back on. It was 28 while the SMS tool was
    // withheld, and 27 before THE-306 added the Shareable Giving Page.
    expect(CATALOG_TOOL_COUNT).toBe(29);
    expect(CATALOG_TOOL_COUNT).toBe(
      CATALOG.reduce((n, g) => n + g.items.filter((i) => !i.soon).length, 0),
    );
  });
});

