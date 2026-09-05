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
import { CATEGORIES } from './features';
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
describe('1 — the pricing surfaces sell SMS again, on ONE tier and with no carrier', () => {
  it('🔴 the MINISTRY card names SMS, the lower cards do not, and none names a carrier', () => {
    // ⚠️ REVERSED BY THE-314. THE-250 asserted no card named SMS at all, because
    // the app refused every send. The app sells it now — on Ministry alone — so
    // the assertion follows the product, and BOTH halves are asserted: the tier
    // that has it says so, and the two that lost it stay silent. A line on
    // Individual would be this page promising a capability the app answers with
    // an upgrade wall, which is the failure this file exists to prevent.
    const text = allCardText();
    expect(text, 'no plan card sells SMS').toMatch(/\bSMS\b/);
    expect(text, 'a plan card names a carrier a church never sees').not.toMatch(/twilio/i);
    const ministry = plans.find((p) => p.planId === 'max')!;
    expect(ministry.features.join(' '), 'the Ministry card lost SMS').toMatch(/\bSMS\b/);
    for (const lower of ['plus', 'pro']) {
      const card = plans.find((p) => p.planId === lower)!;
      expect(card.features.join(' '), `the ${card.name} card sells SMS it cannot use`)
        .not.toMatch(/\bSMS\b/i);
    }
  });

  it('🔴 the rendered comparison grid carries the SMS row, ticked on Ministry only', () => {
    const html = render(React.createElement(ComparisonTable));
    const text = visibleText(html);
    expect(text, 'the comparison grid lost the SMS row').toMatch(/\bSMS\b/);
    expect(text, 'the comparison grid names a carrier').not.toMatch(/twilio/i);
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
  it('🔴 the Coming Soon entry is ABSENT while the flag is on', () => {
    // ⚠️ REVERSED. THE-250 asserted the entry was present, because SMS had to
    // land somewhere when it left the pricing page — vanishing entirely would
    // have left a hole. It is sold again now, so the entry leaves in the same
    // motion, and the filter that does it is asserted below.
    expect(COMING_SOON_ITEMS.find((i) => i.id === 'sms'), 'SMS is sold AND promised')
      .toBeUndefined();
  });

  it('🔴 the entry it left behind still cannot carry a price or a tier', () => {
    // The SHAPE is what guarantees that, and the shape has not changed — so the
    // guarantee is asserted on the type and on the source of the withheld entry
    // rather than on a value that is no longer in the exported list. This is
    // what makes flipping the flag back safe without re-reviewing the copy.
    const other = COMING_SOON_ITEMS[0];
    expect(other).not.toHaveProperty('tiers');
    expect(other).not.toHaveProperty('price');
    const src = readSrc('content/coming-soon.ts');
    const entry = /id: 'sms',[\s\S]*?today:/.exec(src);
    expect(entry, 'the withheld SMS entry could not be read back').not.toBeNull();
    expect(entry![0]).not.toMatch(/\$\s?\d/);
    expect(entry![0]).not.toMatch(/\b(Individual|Small Team|Ministry|Forever Free)\b/);
    expect(entry![0]).not.toMatch(/\bincluded (in|on|with)\b/i);
  });

  it('🔴 SOLD-HERE and PROMISED-THERE are never both true — in EITHER flag state', () => {
    // The property, not today's state. Both surfaces read the same boolean as
    // the Coming Soon filter, so the two are mutually exclusive by construction
    // — this reads the sources to prove the construction, since one flag value
    // can only be observed at a time from inside a single run.
    const pricing = codeOnly(readSrc('components/Pricing.tsx'));
    const comingSoon = codeOnly(readSrc('content/coming-soon.ts'));

    // Every occurrence of the sold line sits inside a SMS_MARKETING_ENABLED arm.
    // 🔵 The line is 'SMS & Text-to-Give' since THE-314 — Harvest resells, so
    // the parenthetical naming a carrier is gone.
    const occurrences = [...pricing.matchAll(/'SMS & Text-to-Give'/g)];
    expect(occurrences.length, 'the sold line vanished entirely').toBeGreaterThan(0);
    for (const m of occurrences) {
      const before = pricing.slice(Math.max(0, m.index! - 200), m.index!);
      expect(before, 'an SMS pricing line is not behind the flag')
        .toMatch(/SMS_MARKETING_ENABLED\s*\?/);
    }
    // …and the Coming Soon entry is filtered by the SAME flag, the other way up.
    expect(comingSoon).toMatch(/item\.id !== 'sms' \|\| !SMS_MARKETING_ENABLED/);
    /* ⚠️ MATCHED AS A NAMED IMPORT, not as one exact line — THE-280 added
       CUSTOM_DOMAIN_MARKETING_ENABLED alongside it when the Custom Domain
       comparison row went behind its own flag. The claim here is that Pricing.tsx
       reads the SMS flag from `lib/flags`, and that is what the pattern says; the
       "no second SMS flag was invented" half is held by the next test, which is
       where that guarantee actually lives. */
    expect(pricing).toMatch(/import \{[^}]*\bSMS_MARKETING_ENABLED\b[^}]*\} from '\.\.\/lib\/flags'/);
  });

  it('🔴 one switch — no second flag was invented on either side', () => {
    const names = new Set([
      ...['components/Pricing.tsx', 'content/coming-soon.ts', 'components/catalog.ts']
        .flatMap((f) => [...codeOnly(readSrc(f)).matchAll(/\bSMS_[A-Z0-9_]+\b/g)].map((m) => m[0])),
    ]);
    expect([...names]).toEqual(['SMS_MARKETING_ENABLED']);
    expect(readSrc('lib/flags.ts').match(/SMS_MARKETING_ENABLED\s*=/g)).toHaveLength(1);
    // 🔵 TRUE since THE-314. The "one switch, one declaration" property — which
    // is what this test is actually for — is untouched.
    expect(readSrc('lib/flags.ts')).toMatch(/^export const SMS_MARKETING_ENABLED = true;$/m);
  });

  it('the two repos still agree on the value', () => {
    expect(SMS_MARKETING_ENABLED).toBe(true);
  });
});

/* ── 3 ─────────────────────────────────────────────────────────────────────
   🔴 Text-to-Give is named where a church would look for it.                 */
describe('3 — Text-to-Give is named wherever a church would look for it', () => {
  it('🔴 the FEATURE section NAMES it, in the heading a visitor scans', () => {
    // ⚠️ IT MOVED HOUSE, NOT LANGUAGE. THE-250 asked whether Text-to-Give was
    // named and found it carried in the Coming Soon entry's own name. That
    // entry is filtered out now, so the same question is asked of the surface
    // that replaced it — the live feature section — and the answer must still
    // be yes: a church searching for either word has to find it.
    const sms = CATEGORIES.flatMap((c) => c.features).find((f) => f.id === 'sms')!;
    expect(sms, 'the SMS feature section is gone').toBeDefined();
    expect(sms.name).toMatch(/Text-to-Give/i);
  });

  it('🔴 and EXPLAINS it — a church reading the giving pages is not left guessing', () => {
    const sms = CATEGORIES.flatMap((c) => c.features).find((f) => f.id === 'sms')!;
    // The mechanism, in the section's own words.
    expect(sms.oneliner, 'the oneliner does not describe giving by text')
      .toMatch(/keyword|giving link/i);
    // 🔴 AND IT NAMES NO CARRIER. Text-to-Give arrives with SMS and is gated the
    // same way — by the tenant having a number Harvest bought, on the Ministry
    // plan — so there is no third-party account for a church to hear about.
    const prose = [sms.eyebrow, sms.title, sms.oneliner, sms.moment,
      ...(sms.admin ?? []), ...(sms.member ?? [])].join(' ');
    expect(prose, 'the section names a carrier').not.toMatch(/twilio/i);
  });

  it('🔴 it is sold on the MINISTRY card and the grid, and nowhere it should not be', () => {
    // ⚠️ REVERSED. THE-250 asserted Text-to-Give was named in Coming Soon and
    // NOWHERE else — no card, no grid — because it was not for sale. It is now,
    // on one tier, so the assertion is the mirror: the tier that has it says so,
    // and the tiers that do not stay silent.
    const grid = visibleText(render(React.createElement(ComparisonTable)));
    expect(grid, 'the grid does not name Text-to-Give').toMatch(/text[- ]to[- ]give/i);
    const ministry = plans.find((p) => p.planId === 'max')!;
    expect(ministry.features.join(' ')).toMatch(/text[- ]to[- ]give/i);
    for (const lower of ['plus', 'pro']) {
      const card = plans.find((p) => p.planId === lower)!;
      expect(card.features.join(' '), `the ${card.name} card sells Text-to-Give`)
        .not.toMatch(/text[- ]to[- ]give/i);
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
    // 🔵 THE LINE IS BACK IN THE SHIPPED VALUE — on Ministry, since THE-314 —
    // so this is still the real check rather than a simulation of it, and the
    // point it makes is now the stronger one: a plan FEATURE moved and the
    // PRICE contract is unmoved by it. That is exactly the separation the
    // contract exists to hold, and it throws at module scope during the
    // prerender if the two repos ever disagree on any of the nine.
    expect(plans.flatMap((p) => p.features).some((f) => /\bSMS\b/i.test(f))).toBe(true);
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
  it('🔴 CATALOG_TOOL_COUNT is 28, and still a REDUCE over CATALOG', () => {
    // 🔵 27 → 28 at THE-306, which added the Shareable Giving Page — a live, unflagged tool that shipped in THE-281 with no mega-menu row at all.
    // 🔵 29 since THE-314 turned SMS back on. It was 28 while the SMS tool was
    // withheld, and 27 before THE-306 added the Shareable Giving Page.
    expect(CATALOG_TOOL_COUNT).toBe(29);
    // Derived, not restated: recompute it here and demand agreement.
    expect(CATALOG_TOOL_COUNT).toBe(
      CATALOG.reduce((n, g) => n + g.items.filter((it) => !it.soon).length, 0),
    );
    // And the declaration itself is still a reduce, not a literal.
    const src = readSrc('components/catalog.ts');
    expect(src).toMatch(/export const CATALOG_TOOL_COUNT = CATALOG\.reduce\(/);
    expect(src).not.toMatch(/export const CATALOG_TOOL_COUNT\s*=\s*\d+/);
  });

  it('🔴 the pricing lines and the count are still different objects', () => {
    // Neither surface feeds CATALOG. Asserted so a future reader does not
    // "finish the job" by editing the catalogue entry to match a pricing row.
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
