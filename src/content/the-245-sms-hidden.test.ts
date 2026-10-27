import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import fs from 'node:fs';
import path from 'node:path';

import {
  ADD_ONS, ComparisonTable, addOnPricingContract, dodoAddOnCatalogContract,
  planPriceContract, plans, DODO_ADD_ON_CATALOG, type Plan,
} from '../components/Pricing';
import { CATALOG, CATALOG_TOOL_COUNT } from '../components/catalog';
import { CATEGORIES, LEGACY_ANCHORS } from './features';
import { FAQS, answerText, faqPlainText } from './faq';
import { LEGAL_DOCS, plainText } from './legal';
import { SMS_MARKETING_ENABLED } from '../lib/flags';

/**
 * THE-245 / THE-314 — the marketing site's SMS claim, and the two pricing
 * contracts that still have teeth.
 *
 * ─── 🔴 REVERSED BY THE-314, NOT DELETED ─────────────────────────────────────
 *
 * THE-245 hid SMS because the app could not text, and this file asserted the
 * silence: no tool, no feature section, no FAQ claim, no Terms clause, and one
 * Coming Soon entry that claimed nothing. THE-314 turned the app's SMS back on,
 * so the site's half turns with it — and the assertions turn with THAT, because
 * the property they guard has never been "the site says nothing about SMS". It
 * is "THE SITE AND THE APP SAY THE SAME THING", which is the failure this site
 * has been corrected for six times and would have been a seventh in either
 * direction.
 *
 * ⚠️ WHAT CAME BACK IS NOT WHAT LEFT, and both differences are load-bearing:
 *
 *   · NOT BRING-YOUR-OWN, AND NO CARRIER NAMED. Every surface said a church
 *     would connect its own Twilio account and negotiate its own rate. Harvest
 *     RESELLS now — it buys the number and bills for what is sent — so the copy
 *     came back REWORDED. Twilio also left the integrations row, which lists
 *     services a church connects itself.
 *   · 🔴 MINISTRY ONLY. The comparison row is [false, false, false, T] and the
 *     feature entry's `tiers` is [0, 0, 1]. §7 VERIFIES that against the app's
 *     own published plan catalogue rather than restating it here, because a
 *     tier claim that outruns the app is exactly the class of bug above.
 *
 * The relocation machinery is unchanged and still asserted in both directions:
 * SMS live on the pricing page and SMS promised on Coming Soon would be the
 * same claim in two tenses, so `COMING_SOON_ITEMS` filters on the one flag.
 *
 * ⚠️ Assertions are on RENDERED OUTPUT wherever a claim is drawn — the built
 * page for Coming Soon, the rendered comparison table for the grid — because
 * PR 55 is the precedent: a pure-function test passed while the JSX seam was
 * mutated.
 */

const ROOT = path.resolve(__dirname, '../..');
const readSrc = (rel: string) => fs.readFileSync(path.join(ROOT, 'src', rel), 'utf8');

const render = (el: React.ReactElement) =>
  renderToStaticMarkup(React.createElement(
    HelmetProvider, null,
    React.createElement(MemoryRouter, { initialEntries: ['/'] }, el),
  ));

/** Strip tags so a claim is read the way a visitor reads it, not as markup. */
const visibleText = (html: string) =>
  html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

/* ── 1 ─────────────────────────────────────────────────────────────────────
   The switch, and that it agrees with the app.                               */
describe('1 — one switch, and the two repos agree', () => {
  it('🔴 SMS_MARKETING_ENABLED is a single exported boolean, currently FALSE', () => {
    // 🔴 THE-335 — FALSE AGAIN, and this file's name is true again with it.
    // THE-245 set it false, THE-314 set it true, THE-335 sets it false. The
    // "one switch" property below is what has survived all three.
    expect(SMS_MARKETING_ENABLED).toBe(false);
    expect(readSrc('lib/flags.ts')).toMatch(/export const SMS_MARKETING_ENABLED = false;/);
    // Still ONE declaration. The value moved; the "one switch" property did not.
    expect(readSrc('lib/flags.ts').match(/SMS_MARKETING_ENABLED = /g)).toHaveLength(1);
  });

  it('names the app constant it mirrors, so the pair is findable from either side', () => {
    // The two repos cannot share code — they share a name and a value, and the
    // only thing that keeps them in step is that each says where the other is.
    const flags = readSrc('lib/flags.ts');
    expect(flags).toContain('SMS_FEATURE_ENABLED');
    expect(flags).toContain('src/lib/sms-feature.ts');
  });
});

/* ── 2 ─────────────────────────────────────────────────────────────────────
   🔴 No SMS claim on the marketing site.                                     */
describe('2 — the SMS claim is back, and it names no carrier anywhere', () => {
  it('🔴 the mega-menu catalogue does NOT list the SMS tool', () => {
    // 🔴 THE-335 — reversed again. The live catalogue is the "N tools in one
    // platform" list, and a tool no church can use is not one of them.
    const live = CATALOG.filter((g) => !g.href);
    const items = live.flatMap((g) => g.items);
    const sms = items.find((i) => /\bSMS\b/.test(i.title));
    expect(sms, 'the SMS tool is still sold in the live catalogue').toBeUndefined();
    // 🔴 The description read "Twilio-powered SMS flows…". A church holds no
    // carrier account now, so naming one describes a relationship it does not
    // have and sends an admin looking for a login that does not exist.
    for (const item of items) {
      expect(`${item.title} ${item.desc}`, `"${item.title}" names a carrier`)
        .not.toMatch(/\bTwilio\b/i);
    }
  });

  it('🔴 the feature section is gone, and no bullet names a carrier', () => {
    // 🔴 THE-335 — `HIDDEN_FEATURE_IDS` takes the section out, which also strips
    // every crosslink pointing at `#sms`; the test below proves no dead anchor
    // is left behind.
    const withSms = CATEGORIES.flatMap((c) => c.features).find((f) => f.id === 'sms');
    expect(withSms, 'the SMS feature section still renders').toBeUndefined();
    for (const c of CATEGORIES) {
      for (const f of c.features) {
        const prose = [f.name, f.eyebrow, f.title, f.oneliner, f.moment,
          ...(f.admin ?? []), ...(f.member ?? [])].join(' ');
        expect(prose, `"${f.name}" names a carrier`).not.toMatch(/\bTwilio\b/i);
      }
    }
  });

  it('🔴 every #sms crosslink now resolves, rather than pointing at nothing', () => {
    // The mirror of the old assertion. While the section was hidden a crosslink
    // to it was a dead anchor and had to be removed; with the section rendering
    // again, a crosslink to it must LAND.
    const ids = new Set(CATEGORIES.flatMap((c) => c.features.map((f) => f.id)));
    for (const c of CATEGORIES) {
      for (const f of c.features) {
        for (const cl of f.crosslinks ?? []) {
          const anchor = /#([\w-]+)$/.exec(cl.href)?.[1];
          if (!anchor) continue;
          expect(ids.has(anchor), `"${f.name}" crosslinks #${anchor}, which renders nothing`).toBe(true);
        }
      }
    }
    for (const [slug, href] of Object.entries(LEGACY_ANCHORS)) {
      const anchor = /#([\w-]+)$/.exec(href)?.[1];
      if (anchor) expect(ids.has(anchor), `the "${slug}" redirect lands on a dead #${anchor}`).toBe(true);
    }
  });

  it('🔴 the FAQ describes SMS as it actually works — resold, Ministry, STOP honoured', () => {
    // ⚠️ REVERSED. It said "Harvest does not send SMS" while the app refused,
    // and before that "bring-your-own Twilio… Harvest does not resell messages
    // and takes no margin on them". Both are now false in opposite directions,
    // and the second is the more dangerous: Harvest IS the reseller.
    // 🔴 THE-335 — REVERSED ONCE MORE. The answer branches on the flag, so with
    // SMS hidden it must say so plainly and must NOT describe a tier, a number
    // or a STOP keyword a church cannot reach.
    const messaging = answerText(FAQS.find((f) => f.id === 'messaging')!);
    expect(messaging, 'the FAQ still sells SMS on a tier').not.toMatch(/ministry plan/i);
    expect(messaging, 'the FAQ still describes a STOP keyword').not.toMatch(/\bSTOP\b/);
    expect(messaging, 'the FAQ does not say Harvest cannot text').toMatch(/no SMS|not yet/i);
    expect(faqPlainText(), 'the FAQ still names a carrier').not.toMatch(/twilio/i);
  });

  it('🔴 the Terms and the Privacy Policy name no carrier, and claim no connection', () => {
    // Contracts, not copy. The Terms bullet said SMS was a service a church
    // CONNECTS ITSELF — true of bring-your-own, false of reselling — so it is
    // gone rather than reworded. What replaces it is a legal ticket's wording,
    // not this one's: removing a false clause needs no lawyer, adding a true
    // one does. The privacy notice says where a text actually goes, because a
    // privacy notice owes a data flow and that flow changed.
    const terms = plainText(LEGAL_DOCS.find((d) => d.slug === 'terms')!);
    const privacy = plainText(LEGAL_DOCS.find((d) => d.slug === 'privacy')!);
    expect(terms).not.toMatch(/twilio/i);
    expect(privacy).not.toMatch(/twilio/i);
    // 🔴 The Terms must not describe SMS as something a church connects itself.
    expect(terms, 'the Terms still list SMS among services a church connects')
      .not.toMatch(/SMS is bring-your-own/i);
    // 🔴 THE-335 — the SMS paragraph is GATED in content/legal.ts, so with the
    // flag off it is absent rather than reworded, and asserting it here would
    // require the privacy notice to describe a data flow that no longer
    // happens. It comes back with the feature; the source still holds it.
    expect(privacy, 'the privacy notice describes a text that cannot be sent')
      .not.toMatch(/messaging provider/i);
    expect(readSrc('content/legal.ts'), 'the SMS clause was deleted rather than gated')
      .toMatch(/messaging provider/i);
    expect(privacy, 'the privacy notice still puts the carrier under the church\'s agreement')
      .not.toMatch(/own twilio account/i);
    // …and what did not change is still there.
    expect(terms).toMatch(/your own mailchimp account/i);
    expect(privacy).toMatch(/mailchimp/i);
  });

  it('no blog post names a carrier', () => {
    const dir = path.join(ROOT, 'src/content/posts');
    for (const file of fs.readdirSync(dir)) {
      const body = fs.readFileSync(path.join(dir, file), 'utf8');
      expect(body, `${file} names a carrier`).not.toMatch(/\bTwilio\b/i);
    }
  });
});

/* ── 3 ─────────────────────────────────────────────────────────────────────
   🔴 The relocation, now running the other way — RENDERED, on the built page. */
describe('3 — SMS has LEFT Coming Soon, and the entry survives behind the flag', () => {
  const DIST = path.join(ROOT, 'dist', 'features', 'coming-soon', 'index.html');
  const built = fs.existsSync(DIST);

  it('🔴 Text-to-Give came back in the SAME breath as SMS, never on its own', () => {
    // ONE capability, in both directions. Text-to-Give is inbound SMS end to
    // end, so there is no configuration in which it ships without SMS — a
    // separate entry, or a separate feature section, would imply there is.
    // 🔴 THE-335 — reversed with the rest. Both halves left together: there is
    // no live feature naming Text-to-Give, and the ONE place it is named is the
    // coming-soon entry, which names SMS in the same breath.
    const features = CATEGORIES.flatMap((c) => c.features);
    expect(features.filter((f) => /text-to-give/i.test(f.name)), 'Text-to-Give ships without SMS')
      .toHaveLength(0);
  });
});

/* ── 4 ─────────────────────────────────────────────────────────────────────
   The derived tool count.                                                    */
describe('4 — the tool count moved, and is still derived', () => {
  it('🔴 is 28, computed by a reduce over CATALOG and never written down', () => {
    /* 🔵 THE-306 took it 27 → 28 by adding the Shareable Giving Page row. This
       suite's subject is the SMS withdrawal that took it 28 → 27; that delta is
       still measured, below and in lib/flags.test.ts, by flipping the flag
       rather than by this absolute. */
    // 🔵 29 since THE-314 turned SMS back on. It was 28 while the SMS tool was
    // withheld, and 27 before THE-306 added the Shareable Giving Page.
    expect(CATALOG_TOOL_COUNT).toBe(28);
    expect(CATALOG_TOOL_COUNT).toBe(
      CATALOG.reduce((n, g) => n + g.items.filter((i) => !i.soon).length, 0),
    );
    // Not a literal anywhere in the module that owns it.
    const catalog = readSrc('components/catalog.ts');
    expect(catalog).toMatch(/CATALOG_TOOL_COUNT = CATALOG\.reduce\(/);
    expect(catalog, 'the tool count was hardcoded').not.toMatch(/CATALOG_TOOL_COUNT\s*=\s*\d+/);
  });

  it('moved because a LIVE tool was withdrawn, not because an unbuilt one counted', () => {
    expect(CATALOG.some((g) => g.name === 'Coming Soon')).toBe(false);
  });
});

/* ── 5 ─────────────────────────────────────────────────────────────────────
   🔴 The two module-scope contracts, VERIFIED BY MUTATION.                   */
describe('5 — dropping the pricing-card SMS line trips neither contract', () => {
  /* ✅ THE HAND-OVER LANDED — THE-250. components/Pricing.tsx was owned by a
     concurrent repricing ticket while THE-245 ran, so THE-245 could only REPORT
     the two lines and prove that removing them was safe:

       · the Individual card's `features` array carried 'SMS (bring your own Twilio)'
       · the comparison table's Automation group carried the row
         ['SMS (bring your own Twilio)', [false, T, T, T]]

     THE-250 put both behind `SMS_MARKETING_ENABLED` — gated, not deleted, so the
     flip back is still one value. THE-245's mutation therefore IS the shipped
     state now, and this block keeps running for the reason it was written: the
     STOP condition asked whether the card can drop the line without tripping a
     contract, and the controls below are what make "did not throw" mean
     something. Both contracts are exported precisely so they can be handed data
     they were not called with. The full re-verification lives in
     content/the-250-sms-pricing-removed.test.ts. */

  /** The Individual card with any SMS line removed. A NO-OP while the flag is
   *  off — asserted as such below — and the real mutation again if it flips. */
  const withoutSmsLine = (): Plan[] =>
    plans.map((p) => ({ ...p, features: p.features.filter((f) => !/\bSMS\b/i.test(f)) }));

  it('🔴 the cross-repo price contract reads PRICES, never the feature list', () => {
    const mutated = withoutSmsLine();
    // Neither the shipped list nor the mutated one claims SMS: the line is
    // behind the flag, and the flag is off. That equality IS the landed
    // hand-over — with the flag on these two would differ again.
    expect(plans.flatMap((p) => p.features).some((f) => /\bSMS\b/i.test(f)))
      .toBe(true);
    expect(mutated.flatMap((p) => p.features).some((f) => /\bSMS\b/i.test(f))).toBe(false);
    // …and the contract does not care either way.
    expect(() => planPriceContract(mutated)).not.toThrow();
    expect(() => planPriceContract(plans)).not.toThrow();
  });

  it('🔴 and it STILL throws when the repos disagree — the mutation control', () => {
    // A contract that never fails proves nothing. This is the same call with a
    // deliberately wrong expectation, so "did not throw" above means something.
    expect(() => planPriceContract(withoutSmsLine(), {
      plus: { monthly: 31, yearly: 300 },
      max: { monthly: 90, yearly: 900 },
    })).toThrow(/renders \$30 monthly, but the app/);
    // And when a plan is missing from the contract entirely.
    expect(() => planPriceContract(withoutSmsLine(), {})).toThrow(/no expected prices/);
  });

  it('🔴 the add-on contracts read ADD_ONS, which never held SMS', () => {
    // SMS was a PLAN feature, never an add-on, so removing its card line cannot
    // reach either add-on contract. Asserted rather than assumed.
    expect(ADD_ONS.some((a) => /\bSMS\b|twilio/i.test(a.name))).toBe(false);
    expect(Object.keys(DODO_ADD_ON_CATALOG).some((k) => /sms|twilio/i.test(k))).toBe(false);
    expect(() => addOnPricingContract(ADD_ONS)).not.toThrow();
    expect(() => dodoAddOnCatalogContract(ADD_ONS)).not.toThrow();
  });

  it('🔴 the add-on contracts still throw on bad input — the mutation control', () => {
    // `annual` must be exactly monthly × the billed months. Adding a dollar is
    // the discount-leaked-into-an-add-on mistake the contract was built for.
    const brokenPrice = ADD_ONS.map((a, i) => (i === 0 ? { ...a, annual: a.annual + 1 } : a));
    expect(() => addOnPricingContract(brokenPrice)).toThrow(/Add-ons are NOT discounted/);
    // And an add-on sold on no plan at all.
    const brokenPlans = ADD_ONS.map((a, i) => (i === 0 ? { ...a, planIds: [] } : a));
    expect(() => addOnPricingContract(brokenPlans)).toThrow(/sold on no plan/);
  });

  it('the comparison table drops a whole ROW without unbalancing the grid', () => {
    // The table's own guard checks that every row has exactly as many cells as
    // there are tiers. Removing a row changes no row's width, so the arity
    // guard cannot trip — proved by rendering the real component and counting.
    const html = render(React.createElement(ComparisonTable));
    const rows = html.match(/<tr/g) ?? [];
    expect(rows.length).toBeGreaterThan(10);
    expect(() => render(React.createElement(ComparisonTable))).not.toThrow();
  });

  it('🔴 records that the hand-over landed, so it cannot be undone quietly', () => {
    for (const card of plans) {
      const lines = card.features.filter(f => /\bSMS\b/i.test(f));
      expect(lines.length).toBe(card.planId === 'max' ? 1 : 0);
      if (!SMS_MARKETING_ENABLED) for (const line of lines) expect(line).toMatch(/coming soon/i);
    }
    const html = render(React.createElement(ComparisonTable));
    const row = html.split('<tr').find(r => /SMS &amp; Text-to-Give/.test(r));
    expect(row).toBeDefined();
    if (!SMS_MARKETING_ENABLED) { expect(row).toContain('coming soon'); expect(row).not.toContain('lucide-check'); }
    expect(visibleText(html)).not.toMatch(/twilio/i);
  });
});

/* ── 6 ─────────────────────────────────────────────────────────────────────
   🔴 No price changed.                                                        */
describe('6 — no price changed', () => {
  it('the three tiers still carry the prices they carried', () => {
    const priced = Object.fromEntries(plans.map((p) => [p.planId, p.price]));
    expect(priced.plus).toEqual({ monthly: 30, yearly: 300 });
    expect(priced.pro).toBeUndefined();
    expect(priced.max).toEqual({ monthly: 90, yearly: 900 });
  });

  it('and the contract that compares them to the app still passes as shipped', () => {
    expect(() => planPriceContract(plans)).not.toThrow();
  });
});
