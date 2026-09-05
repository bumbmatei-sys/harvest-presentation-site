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
import { CATALOG, CATALOG_TOOL_COUNT, COMING_SOON_MENU_ITEMS } from '../components/catalog';
import { CATEGORIES, LEGACY_ANCHORS } from './features';
import { COMING_SOON_ITEMS, comingSoonContract } from './coming-soon';
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
  it('🔴 SMS_MARKETING_ENABLED is a single exported boolean, currently TRUE', () => {
    expect(SMS_MARKETING_ENABLED).toBe(true);
    expect(readSrc('lib/flags.ts')).toMatch(/export const SMS_MARKETING_ENABLED = true;/);
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
  it('🔴 the mega-menu catalogue lists the SMS tool again — without a vendor', () => {
    const live = CATALOG.filter((g) => !g.href);
    const items = live.flatMap((g) => g.items);
    const sms = items.find((i) => /\bSMS\b/.test(i.title));
    expect(sms, 'the SMS tool is missing from the live catalogue').toBeDefined();
    // 🔴 The description read "Twilio-powered SMS flows…". A church holds no
    // carrier account now, so naming one describes a relationship it does not
    // have and sends an admin looking for a login that does not exist.
    for (const item of items) {
      expect(`${item.title} ${item.desc}`, `"${item.title}" names a carrier`)
        .not.toMatch(/\bTwilio\b/i);
    }
  });

  it('🔴 the feature section is back, and no bullet names a carrier', () => {
    const withSms = CATEGORIES.flatMap((c) => c.features).find((f) => f.id === 'sms');
    expect(withSms, 'the SMS feature section is missing').toBeDefined();
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
    const messaging = answerText(FAQS.find((f) => f.id === 'messaging')!);
    expect(messaging, 'the FAQ still says Harvest cannot text').not.toMatch(/harvest does not send sms/i);
    expect(messaging, 'the FAQ still claims Harvest does not resell').not.toMatch(/does not resell/i);
    expect(messaging, 'the FAQ does not name the tier').toMatch(/ministry plan/i);
    expect(messaging, 'the FAQ does not mention STOP').toMatch(/\bSTOP\b/);
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
    expect(privacy, 'the privacy notice does not say where a text goes')
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

  it('🔴 is not an entry any more — it is sold on the pricing page instead', () => {
    // ⚠️ THE ASSERTION FLIPPED, THE MECHANISM DID NOT. `COMING_SOON_ITEMS`
    // filters on SMS_MARKETING_ENABLED, so the entry leaves in the same motion
    // that puts the row on the comparison grid. SMS sold in one place and called
    // unbuilt in another would be the same claim in two tenses, which is the
    // whole reason the two are one switch.
    expect(COMING_SOON_ITEMS.find((i) => i.id === 'sms'), 'SMS is sold AND promised')
      .toBeUndefined();
  });

  it('🔴 the entry is FILTERED, not deleted — the flip back is still one value', () => {
    // The contract at the top of lib/flags.ts: nothing is deleted to hide it.
    // The definition is still in content/coming-soon.ts, so turning the flag off
    // restores the entry without a hunt through git history for its wording.
    const src = readSrc('content/coming-soon.ts');
    expect(src, 'the SMS entry was deleted rather than filtered')
      .toContain("id: 'sms', name: 'SMS & Text-to-Give'");
    expect(src, 'the entry is no longer gated on the flag').toContain('SMS_MARKETING_ENABLED');
    // 🔴 And its copy was rewritten off bring-your-own at the same time. An
    // unrendered file is swept for a carrier name exactly like a rendered one,
    // and the description would be false in either flag state now.
    expect(src, 'the withheld entry still describes a carrier account').not.toMatch(/twilio/i);
  });

  it.runIf(built)('🔴 does not render on the built Coming Soon page', () => {
    const html = fs.readFileSync(DIST, 'utf8');
    const text = visibleText(html);
    expect(text, 'the built page still promises SMS').not.toContain('SMS & Text-to-Give');
    expect(html, 'the built page still carries the SMS anchor').not.toContain('id="sms"');
    // The page itself still works, with its other entries — the withdrawal took
    // one entry and not the page.
    expect(text).toContain('Not built yet');
    expect(COMING_SOON_ITEMS.length).toBeGreaterThan(5);
  });

  it('🔴 the entry it left behind would still claim nothing, if the flag went back', () => {
    // The `SoonItem` shape is what guarantees that, and the contract still runs
    // over the filtered list. Asserted on the DEFINITION rather than the
    // filtered export, so the guarantee survives the entry being invisible.
    expect(() => comingSoonContract(COMING_SOON_ITEMS)).not.toThrow();
    const src = readSrc('content/coming-soon.ts');
    const entry = /id: 'sms',[\s\S]*?navDesc: '[^']*',/.exec(src);
    expect(entry, 'the SMS entry could not be read back').not.toBeNull();
    expect(entry![0], 'the withheld entry grew a price').not.toMatch(/\$\s?\d/);
    expect(entry![0], 'the withheld entry grew a call to action')
      .not.toMatch(/\b(buy|purchase|subscribe|upgrade now|get started)\b/i);

    // 🔴 TIER WORDS ARE CHECKED ON THE UNBUILT FIELDS ONLY, mirroring the
    // contract's own split rather than being stricter than it. `today` and
    // `notThis` describe what ALREADY SHIPS — this entry's `notThis` says the
    // newsletter is part of Small Team and Ministry — so a plan name there is a
    // true statement about a live feature, and it is exactly the distinction
    // the page exists to draw. Banning the words outright would force both
    // sentences vaguer, which is the one direction this page must never move.
    const aboutTheUnbuiltThing = [
      /id: 'sms',[\s\S]*?today:/.exec(entry![0])?.[0] ?? '',
      /considering: \[[\s\S]*?\],/.exec(entry![0])?.[0] ?? '',
    ].join(' ');
    expect(aboutTheUnbuiltThing.length, 'the entry fields could not be read back')
      .toBeGreaterThan(100);
    expect(aboutTheUnbuiltThing, 'the withheld entry grew a tier')
      .not.toMatch(/\b(Individual|Small Team|Ministry|Forever Free)\b/);
  });

  it('🔴 Text-to-Give came back in the SAME breath as SMS, never on its own', () => {
    // ONE capability, in both directions. Text-to-Give is inbound SMS end to
    // end, so there is no configuration in which it ships without SMS — a
    // separate entry, or a separate feature section, would imply there is.
    const features = CATEGORIES.flatMap((c) => c.features);
    const sms = features.find((f) => f.id === 'sms')!;
    expect(sms.name).toContain('Text-to-Give');
    expect(features.filter((f) => /text-to-give/i.test(f.name))).toHaveLength(1);
    expect(COMING_SOON_ITEMS.filter((i) => /text-to-give/i.test(i.name))).toHaveLength(0);
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
    expect(CATALOG_TOOL_COUNT).toBe(29);
    expect(CATALOG_TOOL_COUNT).toBe(
      CATALOG.reduce((n, g) => n + g.items.filter((i) => !i.soon).length, 0),
    );
    // Not a literal anywhere in the module that owns it.
    const catalog = readSrc('components/catalog.ts');
    expect(catalog).toMatch(/CATALOG_TOOL_COUNT = CATALOG\.reduce\(/);
    expect(catalog, 'the tool count was hardcoded').not.toMatch(/CATALOG_TOOL_COUNT\s*=\s*\d+/);
  });

  it('moved because a LIVE tool was withdrawn, not because an unbuilt one counted', () => {
    const soonGroup = CATALOG.filter((g) => g.href);
    expect(soonGroup).toHaveLength(1);
    /* 9 → 10 at THE-252, which added an "Affiliate referrals" entry, then
       10 → 11 at THE-280, which added "Custom domains", then 11 → 12 at
       THE-284, which added "Harvest Scheduler" — and then 12 → 4 at THE-297,
       which made the COLUMN a shortlist of the list rather than all of it. The
       entries themselves are untouched: content/coming-soon.ts still carries
       twelve and the page still renders twelve. What this test is really
       holding is the line below — every row in the group is `soon`, so however
       many the column shows, CATALOG_TOOL_COUNT stays where it is. */
    expect(soonGroup[0].items).toHaveLength(COMING_SOON_MENU_ITEMS.length);
    expect(soonGroup[0].items.length).toBeLessThan(COMING_SOON_ITEMS.length);
    expect(soonGroup[0].items.filter((i) => !i.soon), 'a coming-soon entry is being counted')
      .toHaveLength(0);
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
      .toBe(SMS_MARKETING_ENABLED);
    expect(mutated.flatMap((p) => p.features).some((f) => /\bSMS\b/i.test(f))).toBe(false);
    // …and the contract does not care either way.
    expect(() => planPriceContract(mutated)).not.toThrow();
    expect(() => planPriceContract(plans)).not.toThrow();
  });

  it('🔴 and it STILL throws when the repos disagree — the mutation control', () => {
    // A contract that never fails proves nothing. This is the same call with a
    // deliberately wrong expectation, so "did not throw" above means something.
    expect(() => planPriceContract(withoutSmsLine(), {
      plus: { monthly: 21, quarterly: 54, yearly: 190 },
      pro: { monthly: 40, quarterly: 108, yearly: 380 },
      max: { monthly: 80, quarterly: 216, yearly: 760 },
    })).toThrow(/renders \$20 monthly, but the app/);
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
    // ⚠️ REWRITTEN BY THE-250, which is the ticket that took the hand-over. The
    // original asked "are the two lines still here?" and allowed either answer.
    // Both are now GATED rather than gone, so neither of the old branches
    // describes the file: the string is still in the source (that is the
    // hide-not-delete guarantee) but no rendered surface carries it.
    //
    // The claim is therefore about RENDERED OUTPUT, not about source text —
    // which is what the STOP condition was ever about.
    // ⚠️ REVERSED BY THE-314, AND THE CLAIM IS STILL ABOUT RENDERED OUTPUT
    // rather than source text — which is what the STOP condition was ever
    // about. THE-250 handed the pricing surfaces over; THE-314 turned them back
    // on, ON ONE TIER, and the assertion follows the product.
    const ministry = plans.find((p) => p.planId === 'max')!;
    expect(ministry.features.join(' '), 'the Ministry card does not claim SMS')
      .toMatch(/\bSMS\b/);
    for (const lower of ['plus', 'pro']) {
      const card = plans.find((p) => p.planId === lower)!;
      expect(card.features.join(' '), `the ${card.name} card claims SMS it cannot use`)
        .not.toMatch(/\bSMS\b/i);
    }
    const grid = visibleText(render(React.createElement(ComparisonTable)));
    expect(grid, 'the comparison grid does not carry the SMS row').toMatch(/\bSMS\b/);
    // Still GATED rather than hardcoded, so the flip back stays one value.
    const pricing = readSrc('components/Pricing.tsx');
    expect(pricing, 'the SMS line was hardcoded rather than gated')
      .toContain('SMS_MARKETING_ENABLED ? [\'SMS & Text-to-Give\']');
    // 🔴 And the vendor is gone from the label a visitor reads.
    expect(visibleText(render(React.createElement(ComparisonTable))), 'the grid names a carrier')
      .not.toMatch(/twilio/i);
  });
});

/* ── 6 ─────────────────────────────────────────────────────────────────────
   🔴 No price changed.                                                        */
describe('6 — no price changed', () => {
  it('the three tiers still carry the prices they carried', () => {
    const priced = Object.fromEntries(plans.map((p) => [p.planId, p.price]));
    expect(priced.plus).toEqual({ monthly: 20, quarterly: 54, yearly: 190 });
    expect(priced.pro).toEqual({ monthly: 40, quarterly: 108, yearly: 380 });
    expect(priced.max).toEqual({ monthly: 80, quarterly: 216, yearly: 760 });
  });

  it('and the contract that compares them to the app still passes as shipped', () => {
    expect(() => planPriceContract(plans)).not.toThrow();
  });
});
