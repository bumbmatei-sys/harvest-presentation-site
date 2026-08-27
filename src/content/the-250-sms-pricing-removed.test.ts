import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import fs from 'node:fs';
import path from 'node:path';

import {
  ADD_ONS, ComparisonTable, PlanCard, BILLING_TERMS, addOnPricingContract,
  dodoAddOnCatalogContract, planPriceContract, plans, DODO_ADD_ON_CATALOG, crmLabel,
  type Plan, type BillingTerm,
} from '../components/Pricing';
import { CATALOG, CATALOG_TOOL_COUNT } from '../components/catalog';
import { COMING_SOON_ITEMS } from './coming-soon';
import { SMS_MARKETING_ENABLED } from '../lib/flags';

/**
 * THE-250 — the site stops SELLING SMS, and says "not yet" in exactly one place.
 *
 * ─── What was left ───────────────────────────────────────────────────────────
 *
 * THE-245 moved SMS to Coming Soon and reported two lines it could not remove,
 * because `components/Pricing.tsx` belonged to the concurrent repricing ticket:
 *
 *   · the Individual card's `features` array carried 'SMS (bring your own Twilio)'
 *   · the comparison grid's Automation group carried the same string as a row,
 *     asserting [false, T, T, T] — SMS included on all three paid tiers
 *
 * So the app refused every send with a 503 while the site sold the capability on
 * a card AND promised it on /features/coming-soon. THE SAME CAPABILITY, SOLD IN
 * ONE PLACE AND PROMISED IN ANOTHER — which is the seventh instance of the false
 * claim this page has been corrected for six times, and the first a buyer could
 * have paid for.
 *
 * ─── Gated, not deleted ──────────────────────────────────────────────────────
 *
 * 🔴 Both surfaces are now behind `SMS_MARKETING_ENABLED`, not removed from the
 * tree. Two reasons, and the second is the non-negotiable:
 *
 *   1. lib/flags.ts opens by promising it of every flag in it: "Nothing is
 *      deleted — every hidden surface is still in the tree behind one of these
 *      booleans, so restoring it is a one-line change." A deletion would have
 *      made the flip back a hunt through git history for wording and cell values.
 *   2. ONE SWITCH. Flipping this flag has to restore every SMS surface AND drop
 *      the Coming Soon entry in the same motion, because SMS live and SMS
 *      "coming soon" at once is the same claim in two tenses. `COMING_SOON_ITEMS`
 *      already filters on this flag; these two now move with it.
 *
 * That pairing is what section 2 below asserts, and it asserts it in BOTH flag
 * states — the property is that the two are never both true, not merely that
 * today's state is quiet.
 *
 * ⚠️ Assertions are on RENDERED OUTPUT — real `PlanCard` and `ComparisonTable`
 * markup, read as a visitor reads it. PR 55 is the precedent: a pure-function
 * test passed while the JSX seam was mutated.
 */

const ROOT = path.resolve(__dirname, '../..');
const readSrc = (rel: string) => fs.readFileSync(path.join(ROOT, 'src', rel), 'utf8');

const render = (el: React.ReactElement) =>
  renderToStaticMarkup(React.createElement(
    HelmetProvider, null,
    React.createElement(MemoryRouter, { initialEntries: ['/pricing'] }, el),
  ));

/** Strip tags so a claim is read the way a visitor reads it, not as markup. */
const visibleText = (html: string) =>
  html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

/**
 * Source with comments stripped.
 *
 * ⚠️ REQUIRED, not tidiness. The notes THE-250 left in Pricing.tsx and flags.ts
 * QUOTE the sold line and NAME the app's `SMS_FEATURE_ENABLED` — they have to,
 * to explain what moved and what it mirrors. Scanning raw source would read
 * those explanations as the claims they describe, and the two checks below
 * would then be asserting against documentation rather than against code.
 */
const codeOnly = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^[ \t]*\/\/.*$/gm, ' ');

/** Every pricing card, every billing term, as one body of visible copy. */
const allCardText = (): string =>
  plans.flatMap((plan) =>
    BILLING_TERMS.map((term: BillingTerm) =>
      visibleText(render(React.createElement(PlanCard, { plan, term }))),
    ),
  ).join(' \n ');

/* ── 1 ─────────────────────────────────────────────────────────────────────
   🔴 No pricing card sells SMS as a plan feature.                            */
describe('1 — no pricing card sells SMS as a plan feature', () => {
  it('🔴 no rendered plan card names SMS or Twilio, on any billing term', () => {
    const text = allCardText();
    expect(text, 'a plan card still sells SMS').not.toMatch(/\bSMS\b/i);
    expect(text, 'a plan card still names Twilio').not.toMatch(/twilio/i);
  });

  it('🔴 the rendered comparison grid carries no SMS row', () => {
    const html = render(React.createElement(ComparisonTable));
    const text = visibleText(html);
    expect(text, 'the comparison grid still lists SMS').not.toMatch(/\bSMS\b/i);
    expect(text, 'the comparison grid still names Twilio').not.toMatch(/twilio/i);
    // The grid still rendered something — an empty render would pass the above
    // vacuously, which is the failure mode this whole file is guarding.
    expect(text).toMatch(/Automation/);
    expect(text).toMatch(/Newsletter/);
    expect((html.match(/<tr/g) ?? []).length).toBeGreaterThan(10);
  });

  it('the Automation group kept its other rows — the row went, the group did not', () => {
    const text = visibleText(render(React.createElement(ComparisonTable)));
    for (const row of ['Newsletter', 'Automated Newsletter', 'Custom Forms → CRM']) {
      expect(text, `the Automation group lost "${row}"`).toContain(row);
    }
  });

  it('🔴 and the grid is still balanced — every row has one cell per column', () => {
    // Removing a whole row changes no row's width, so the arity guard cannot
    // trip; asserted by rendering rather than by reading the constant.
    const html = render(React.createElement(ComparisonTable));
    const bodyRows = html.split('<tr').slice(1);
    // Group-heading rows carry a single spanning cell; FEATURE rows carry one
    // label cell plus one per tier. Only the latter can go ragged, so they are
    // what is measured — a set with more than one width is a dropped cell.
    const widths = new Set(
      bodyRows.map((r) => (r.match(/<td/g) ?? []).length).filter((n) => n > 1),
    );
    expect(widths.size, `ragged grid: feature-row widths ${[...widths]}`).toBe(1);
    expect([...widths][0], 'a feature row lost a tier column').toBe(plans.length + 2);
  });
});

/* ── 2 ─────────────────────────────────────────────────────────────────────
   🔴 SMS appears ONLY in Coming Soon, and one switch owns both halves.       */
describe('2 — SMS appears only in Coming Soon, and carries no price or tier badge', () => {
  it('🔴 the Coming Soon entry is present while the flag is off', () => {
    const sms = COMING_SOON_ITEMS.find((i) => i.id === 'sms');
    expect(sms, 'SMS is sold nowhere AND promised nowhere — it just vanished').toBeTruthy();
    expect(sms!.name).toBe('SMS & Text-to-Give');
  });

  it('🔴 the entry cannot carry a price or a tier — the SHAPE forbids it', () => {
    const sms = COMING_SOON_ITEMS.find((i) => i.id === 'sms')!;
    // `SoonItem` has no `tiers`, no price and no CTA field, so this is a
    // property of the type. Asserted on the VALUES too, in case the copy tries.
    expect(sms).not.toHaveProperty('tiers');
    expect(sms).not.toHaveProperty('price');
    const aboutTheUnbuiltThing = [sms.name, sms.eyebrow, sms.title, sms.oneliner,
      ...sms.considering].join(' ');
    expect(aboutTheUnbuiltThing).not.toMatch(/\$\s?\d/);
    expect(aboutTheUnbuiltThing).not.toMatch(/\b(Individual|Small Team|Ministry|Forever Free)\b/);
    expect(aboutTheUnbuiltThing).not.toMatch(/\bincluded (in|on|with)\b/i);
  });

  it('🔴 SOLD-HERE and PROMISED-THERE are never both true — in EITHER flag state', () => {
    // The property, not today's state. Both surfaces read the same boolean as
    // the Coming Soon filter, so the two are mutually exclusive by construction
    // — this reads the sources to prove the construction, since one flag value
    // can only be observed at a time from inside a single run.
    const pricing = codeOnly(readSrc('components/Pricing.tsx'));
    const comingSoon = codeOnly(readSrc('content/coming-soon.ts'));

    // Every occurrence of the sold line sits inside a SMS_MARKETING_ENABLED arm.
    const occurrences = [...pricing.matchAll(/SMS \(bring your own Twilio\)/g)];
    expect(occurrences.length, 'the sold line vanished entirely').toBeGreaterThan(0);
    for (const m of occurrences) {
      const before = pricing.slice(Math.max(0, m.index! - 200), m.index!);
      expect(before, 'an SMS pricing line is not behind the flag')
        .toMatch(/SMS_MARKETING_ENABLED\s*\?/);
    }
    // …and the Coming Soon entry is filtered by the SAME flag, the other way up.
    expect(comingSoon).toMatch(/item\.id !== 'sms' \|\| !SMS_MARKETING_ENABLED/);
    expect(pricing).toContain("import { SMS_MARKETING_ENABLED } from '../lib/flags'");
  });

  it('🔴 one switch — no second flag was invented on either side', () => {
    const names = new Set([
      ...['components/Pricing.tsx', 'content/coming-soon.ts', 'components/catalog.ts']
        .flatMap((f) => [...codeOnly(readSrc(f)).matchAll(/\bSMS_[A-Z0-9_]+\b/g)].map((m) => m[0])),
    ]);
    expect([...names]).toEqual(['SMS_MARKETING_ENABLED']);
    expect(readSrc('lib/flags.ts').match(/SMS_MARKETING_ENABLED\s*=/g)).toHaveLength(1);
    expect(readSrc('lib/flags.ts')).toMatch(/^export const SMS_MARKETING_ENABLED = false;$/m);
  });

  it('the two repos still agree on the value', () => {
    expect(SMS_MARKETING_ENABLED).toBe(false);
  });
});

/* ── 3 ─────────────────────────────────────────────────────────────────────
   🔴 Text-to-Give is named where a church would look for it.                 */
describe('3 — Text-to-Give is named wherever a church would look for it', () => {
  it('🔴 the Coming Soon entry NAMES it, in the heading a visitor scans', () => {
    // THE-250 asked whether it is named, and to add it only if not. It is: the
    // entry's own name carries it, so nothing was added anywhere.
    const sms = COMING_SOON_ITEMS.find((i) => i.id === 'sms')!;
    expect(sms.name).toMatch(/Text-to-Give/i);
  });

  it('🔴 and EXPLAINS it — a church reading the giving pages is not left guessing', () => {
    const sms = COMING_SOON_ITEMS.find((i) => i.id === 'sms')!;
    // The mechanism, in the entry's own words.
    expect(sms.oneliner, 'the oneliner does not describe giving by text')
      .toMatch(/keyword|giving link/i);
    // 🔴 THE HONEST HALF. `today` has to say what a church has INSTEAD, or the
    // entry reads as a feature list. Text-to-Give going dark with SMS is
    // correct and intended — it is inbound SMS end to end, gated per tenant by
    // BYO Twilio credentials rather than by plan — so the page owes a church
    // the sentence that says the donation page still works.
    expect(sms.today).toMatch(/no keyword a member can text/i);
    expect(sms.today, 'the entry does not say what still works today')
      .toMatch(/donation page/i);
  });

  it('🔴 it is named THERE and nowhere else — not re-sold on a card or a grid', () => {
    const cards = allCardText();
    const grid = visibleText(render(React.createElement(ComparisonTable)));
    for (const [where, text] of [['a plan card', cards], ['the comparison grid', grid]] as const) {
      expect(text, `${where} still sells Text-to-Give`).not.toMatch(/text[- ]to[- ]give/i);
      expect(text, `${where} still sells texting to give`).not.toMatch(/giv\w* by text/i);
    }
  });

  it('no separate Text-to-Give switch was built — it rides the one flag', () => {
    const flags = readSrc('lib/flags.ts');
    expect(flags).not.toMatch(/TEXT_TO_GIVE[A-Z_]*\s*=/);
    expect(flags).not.toMatch(/TEXT2GIVE[A-Z_]*\s*=/);
  });
});

/* ── 4 ─────────────────────────────────────────────────────────────────────
   🔴 BOTH CROSS-REPO CONTRACTS, RE-VERIFIED BY MUTATION.                     */
describe('4 — both cross-repo contracts still throw when the repos disagree', () => {
  /* ⚠️ RE-VERIFIED, NOT INHERITED. THE-245 proved on MUTATED INPUT that dropping
     these lines trips neither contract, and THE-250 was told to re-run that
     rather than trust it — a trip here would mean something changed since. It
     does not trip, and the controls below prove the contracts can still fail. */

  const asShipped = (): Plan[] => plans.map((p) => ({ ...p }));

  it('🔴 the cross-repo price contract passes on the plans AS THEY NOW SHIP', () => {
    // The lines are gone from the shipped value, so this is the real check
    // rather than a simulation of it.
    expect(plans.flatMap((p) => p.features).some((f) => /\bSMS\b/i.test(f))).toBe(false);
    expect(() => planPriceContract(asShipped())).not.toThrow();
  });

  it('🔴 and it STILL throws when the repos disagree — the mutation control', () => {
    // A contract that never fails proves nothing. One cent of disagreement.
    expect(() => planPriceContract(asShipped(), {
      plus: { monthly: 21, quarterly: 54, yearly: 190 },
      pro: { monthly: 40, quarterly: 108, yearly: 380 },
      max: { monthly: 80, quarterly: 216, yearly: 760 },
    })).toThrow(/renders \$20 monthly, but the app/);
    // And when a plan is missing from the app's table entirely.
    expect(() => planPriceContract(asShipped(), {})).toThrow(/no expected prices/);
  });

  it('🔴 the add-on catalogue contract passes, and SMS was never an add-on', () => {
    expect(ADD_ONS.some((a) => /\bSMS\b|twilio/i.test(a.name))).toBe(false);
    expect(Object.keys(DODO_ADD_ON_CATALOG).some((k) => /sms|twilio/i.test(k))).toBe(false);
    expect(() => addOnPricingContract(ADD_ONS)).not.toThrow();
    expect(() => dodoAddOnCatalogContract(ADD_ONS)).not.toThrow();
  });

  it('🔴 and the add-on contracts still throw on bad input — the mutation control', () => {
    const brokenPrice = ADD_ONS.map((a, i) => (i === 0 ? { ...a, annual: a.annual + 1 } : a));
    expect(() => addOnPricingContract(brokenPrice)).toThrow(/Add-ons are NOT discounted/);
    const brokenPlans = ADD_ONS.map((a, i) => (i === 0 ? { ...a, planIds: [] } : a));
    expect(() => addOnPricingContract(brokenPlans)).toThrow(/sold on no plan/);
  });

  it('🔴 dodoAddOnCatalogContract still throws on an unadvertised product', () => {
    // The check THE-224 armed by declaring its omission rather than disabling it.
    const ghost = ADD_ONS.filter((_, i) => i !== 0);
    expect(() => dodoAddOnCatalogContract(ghost)).toThrow();
  });
});

/* ── 5 ─────────────────────────────────────────────────────────────────────
   🔴 The tool count is still derived, and no price moved.                    */
describe('5 — the tool count is still derived, and no price changed', () => {
  it('🔴 CATALOG_TOOL_COUNT is 27, and still a REDUCE over CATALOG', () => {
    expect(CATALOG_TOOL_COUNT).toBe(27);
    // Derived, not restated: recompute it here and demand agreement.
    expect(CATALOG_TOOL_COUNT).toBe(
      CATALOG.reduce((n, g) => n + g.items.filter((it) => !it.soon).length, 0),
    );
    // And the declaration itself is still a reduce, not a literal.
    const src = readSrc('components/catalog.ts');
    expect(src).toMatch(/export const CATALOG_TOOL_COUNT = CATALOG\.reduce\(/);
    expect(src).not.toMatch(/export const CATALOG_TOOL_COUNT\s*=\s*\d+/);
  });

  it('🔴 removing the pricing lines did not touch the count — different objects', () => {
    // Neither surface feeds CATALOG. Asserted so a future reader does not
    // "finish the job" by deleting the catalogue entry to match.
    const pricing = readSrc('components/Pricing.tsx');
    expect(pricing).not.toMatch(/CATALOG_TOOL_COUNT\s*=/);
    // The SMS tool entry still exists in the catalogue source, behind the flag.
    expect(readSrc('components/catalog.ts')).toContain("'SMS Automation'");
  });

  it('🔴 no price changed — monthly, quarterly and yearly, all three tiers', () => {
    const byName = Object.fromEntries(plans.map((p) => [p.name, p.price]));
    expect(byName['Individual']).toEqual({ monthly: 20, quarterly: 54, yearly: 190 });
    expect(byName['Small Team']).toEqual({ monthly: 40, quarterly: 108, yearly: 380 });
    expect(byName['Ministry']).toEqual({ monthly: 80, quarterly: 216, yearly: 760 });
  });

  it('and the cards still RENDER those prices — not just hold them', () => {
    const text = allCardText();
    for (const n of ['20', '40', '80', '54', '108', '216', '190', '380', '760']) {
      expect(text, `$${n} is no longer rendered on any card`).toContain(n);
    }
  });

  it('every plan kept its other features — the removal took nothing with it', () => {
    const individual = plans.find((p) => p.name === 'Individual')!;
    expect(individual.features).toEqual([
      '150 contacts · 2 admins', 'Mobile App (PWA)', 'Blog & News Feed', 'Bible',
      '2 courses', crmLabel('plus'), 'Donation page & Fundraising',
    ]);
  });
});
