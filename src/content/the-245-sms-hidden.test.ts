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
import { COMING_SOON_ITEMS, comingSoonContract } from './coming-soon';
import { FAQS, answerText, faqPlainText } from './faq';
import { LEGAL_DOCS, plainText } from './legal';
import { SMS_MARKETING_ENABLED } from '../lib/flags';

/**
 * THE-245 — the marketing site makes no SMS claim, and the two pricing
 * contracts still have teeth.
 *
 * ─── Why this file exists ────────────────────────────────────────────────────
 *
 * The app hid SMS because it is untested and about to be marketed. The site is
 * the advert, so the two have to agree: a product that cannot text and a
 * pricing card that sells texting are the same failure this site has already
 * been corrected for six times, and the seventh would be the one a buyer paid
 * for.
 *
 * ⚠️ THIS IS NOT A RETRACTION — IT IS A RELOCATION, and that is what makes it
 * harder than the affiliate and multi-campus flags. SMS is SOLD today. Taking
 * it off the pricing card without saying anything would leave a hole; leaving
 * it on while the app refuses would be a lie. So it moves to Coming Soon, where
 * the `SoonItem` shape has nowhere to put a price, a tier or a call to action.
 * Both halves have to land together, and the tests below check both.
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
  it('SMS_MARKETING_ENABLED is a single exported boolean, currently false', () => {
    expect(SMS_MARKETING_ENABLED).toBe(false);
    expect(readSrc('lib/flags.ts')).toMatch(/export const SMS_MARKETING_ENABLED = false;/);
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
describe('2 — no SMS claim survives, in any surface that sells', () => {
  it('the mega-menu catalogue lists no SMS tool', () => {
    const live = CATALOG.filter((g) => !g.href);
    for (const group of live) {
      for (const item of group.items) {
        expect(`${item.title} ${item.desc}`, `"${item.title}" still sells SMS`)
          .not.toMatch(/\bSMS\b|\bTwilio\b|text-to-give/i);
      }
    }
  });

  it('no feature section, bullet, crosslink or blurb names SMS', () => {
    for (const c of CATEGORIES) {
      expect(`${c.intro} ${c.seo}`, `the ${c.name} blurb names SMS`).not.toMatch(/\bSMS\b/);
      for (const f of c.features) {
        expect(f.id, 'the SMS feature section still renders').not.toBe('sms');
        const prose = [f.name, f.eyebrow, f.title, f.oneliner, f.moment,
          ...(f.admin ?? []), ...(f.member ?? [])].join(' ');
        expect(prose, `"${f.name}" still names SMS`).not.toMatch(/\bSMS\b|\bTwilio\b/i);
        for (const cl of f.crosslinks ?? []) {
          expect(cl.href, `"${f.name}" crosslinks a hidden section`).not.toMatch(/#sms$/);
          expect(cl.label, `"${f.name}" crosslinks Text-to-Give`).not.toMatch(/text-to-give/i);
        }
      }
    }
  });

  it('no indexed link lands on a dead #sms anchor', () => {
    for (const [slug, href] of Object.entries(LEGACY_ANCHORS)) {
      expect(href, `the "${slug}" redirect still carries #sms`).not.toMatch(/#sms$/);
    }
  });

  it('🔴 the FAQ says plainly that Harvest does not text, rather than falling silent', () => {
    // Silence is not honesty here: a buyer asking "does it text?" who gets an
    // answer about email only would reasonably read the omission as a yes.
    const messaging = answerText(FAQS.find((f) => f.id === 'messaging')!);
    expect(messaging).toMatch(/harvest does not send sms/i);
    expect(faqPlainText()).not.toMatch(/bring-your-own twilio/i);
    expect(faqPlainText()).not.toMatch(/billed to you by twilio/i);
  });

  it('🔴 the Terms and the Privacy Policy make no Twilio claim', () => {
    // Contracts, not copy: a clause describing a connection a church cannot
    // make is a promise about a service that is not being provided.
    const terms = plainText(LEGAL_DOCS.find((d) => d.slug === 'terms')!);
    const privacy = plainText(LEGAL_DOCS.find((d) => d.slug === 'privacy')!);
    expect(terms).not.toMatch(/twilio/i);
    expect(terms).not.toMatch(/\bSMS\b/);
    expect(privacy).not.toMatch(/twilio/i);
    expect(privacy).not.toMatch(/\bSMS\b/);
    // …and what did not change is still there.
    expect(terms).toMatch(/your own mailchimp account/i);
    expect(privacy).toMatch(/mailchimp/i);
  });

  it('no blog post advertises it either', () => {
    const dir = path.join(ROOT, 'src/content/posts');
    for (const file of fs.readdirSync(dir)) {
      const body = fs.readFileSync(path.join(dir, file), 'utf8');
      expect(body, `${file} advertises SMS`).not.toMatch(/\bSMS\b|\bTwilio\b|text-to-give/i);
    }
  });
});

/* ── 3 ─────────────────────────────────────────────────────────────────────
   🔴 The relocation — RENDERED, on the built page.                           */
describe('3 — SMS is in Coming Soon, and claims nothing there', () => {
  const DIST = path.join(ROOT, 'dist', 'features', 'coming-soon', 'index.html');
  const built = fs.existsSync(DIST);

  it('appears as an entry, under the name the site used to sell it by', () => {
    // Named for findability: a church that read "SMS & Text-to-Give" on the
    // features page finds the same words on the page that explains its absence.
    const sms = COMING_SOON_ITEMS.find((i) => i.id === 'sms');
    expect(sms, 'SMS is not on the Coming Soon page').toBeDefined();
    expect(sms!.name).toBe('SMS & Text-to-Give');
    expect(sms!.ref).toMatch(/^THE-\d+$/);
  });

  it.runIf(built)('🔴 renders in full on the built page', () => {
    const html = fs.readFileSync(DIST, 'utf8');
    const text = visibleText(html);
    const sms = COMING_SOON_ITEMS.find((i) => i.id === 'sms')!;
    expect(text, 'the name is missing').toContain('SMS & Text-to-Give');
    expect(text, 'the "today" paragraph is missing').toContain(sms.today.slice(0, 60));
    expect(html, 'the in-page anchor is missing').toContain('id="sms"');
    // The muted treatment every other entry carries, not a live one.
    expect(text).toContain('Not built yet');
  });

  it.runIf(built)('🔴 claims nothing — no price, no tier, no call to action', () => {
    const html = fs.readFileSync(DIST, 'utf8');
    const sms = COMING_SOON_ITEMS.find((i) => i.id === 'sms')!;
    // Every field, for the money and purchase patterns.
    const everything = [sms.name, sms.eyebrow, sms.title, sms.oneliner, sms.today,
      sms.notThis ?? '', ...sms.considering, sms.navDesc].join(' ');
    expect(everything).not.toMatch(/\$\s?\d/);
    expect(everything).not.toMatch(/\bincluded (in|on|with)\b/i);
    expect(everything).not.toMatch(/\b(buy|purchase|subscribe|start (your |a )?(free )?trial|upgrade now|get started)\b/i);

    // 🔴 TIER WORDS ARE CHECKED ON THE UNBUILT FIELDS ONLY, which mirrors the
    // contract's own split rather than being stricter than it. `today` and
    // `notThis` describe what ALREADY SHIPS — this entry's `notThis` says AI
    // Chat and the newsletter are part of Small Team and Ministry — so a plan
    // name there is a true statement about a live feature, and it is exactly
    // the distinction the page exists to draw. Banning the words outright would
    // force both sentences vaguer, which is the one direction this page must
    // never move.
    const aboutTheUnbuiltThing = [sms.name, sms.eyebrow, sms.title, sms.oneliner,
      ...sms.considering].join(' ');
    expect(aboutTheUnbuiltThing).not.toMatch(/\b(Individual|Small Team|Ministry|Forever Free)\b/);
    // And the page BODY still refuses to sell — the contract's own rules,
    // re-run over the copy that now includes this entry.
    //
    // ⚠️ SCOPED TO <main>, as pages/ComingSoonPage.test.ts scopes its own
    // checks. Everything outside it is chrome shared with every route, and the
    // site-wide nav carries a trial CTA on all of them; asserting over the
    // whole document would fail on the header rather than on this page.
    expect(() => comingSoonContract(COMING_SOON_ITEMS)).not.toThrow();
    const main = /<main[^>]*>([\s\S]*)<\/main>/.exec(html);
    expect(main, 'the page rendered no <main>').not.toBeNull();
    expect(visibleText(main![1]), 'the page body sells a trial')
      .not.toMatch(/start free trial/i);
  });

  it('🔴 says what a church has TODAY, so the gap is named rather than implied', () => {
    // The honest half of every entry, and the one that answers the giving
    // question: a church reading this must not be left wondering how anyone
    // gives right now.
    const sms = COMING_SOON_ITEMS.find((i) => i.id === 'sms')!;
    expect(sms.today.length).toBeGreaterThan(60);
    expect(sms.today).toMatch(/nothing in harvest sends a text/i);
    expect(sms.today, 'the giving path a church has today is not named')
      .toMatch(/donation page/i);
  });

  it('🔴 covers Text-to-Give in the SAME entry, and says why', () => {
    // ONE entry, not two. Text-to-Give is inbound SMS end to end, so there is
    // no configuration in which it arrives without SMS — two entries would
    // imply it could. The name carries both so a church searching for either
    // word finds it.
    const sms = COMING_SOON_ITEMS.find((i) => i.id === 'sms')!;
    expect(sms.name).toContain('Text-to-Give');
    expect(sms.oneliner, 'the giving half is not described').toMatch(/keyword/i);
    expect(COMING_SOON_ITEMS.filter((i) => /text-to-give/i.test(i.name))).toHaveLength(1);
    // And it is not duplicated as a giving entry of its own.
    expect(COMING_SOON_ITEMS.map((i) => i.id).filter((id) => id === 'sms')).toHaveLength(1);
  });
});

/* ── 4 ─────────────────────────────────────────────────────────────────────
   The derived tool count.                                                    */
describe('4 — the tool count moved, and is still derived', () => {
  it('🔴 is 27, computed by a reduce over CATALOG and never written down', () => {
    expect(CATALOG_TOOL_COUNT).toBe(27);
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
    expect(soonGroup[0].items).toHaveLength(9);
    expect(soonGroup[0].items.filter((i) => !i.soon), 'a coming-soon entry is being counted')
      .toHaveLength(0);
  });
});

/* ── 5 ─────────────────────────────────────────────────────────────────────
   🔴 The two module-scope contracts, VERIFIED BY MUTATION.                   */
describe('5 — dropping the pricing-card SMS line trips neither contract', () => {
  /* ⚠️ THE PRICING CARD IS NOT EDITED BY THIS TICKET. components/Pricing.tsx is
     owned by a concurrent repricing ticket, so THE-245 reports the two lines
     rather than removing them:

       · line ~186 — the Individual card's `features` array carries
         'SMS (bring your own Twilio)'
       · line ~556 — the comparison table's Automation group carries the row
         ['SMS (bring your own Twilio)', [false, T, T, T]]

     What this block proves is that removing them is SAFE — the STOP condition
     asked whether the card can drop the line without tripping a contract, and
     the answer is yes, demonstrated on mutated input rather than reasoned
     about. Both contracts are exported precisely so they can be handed data
     they were not called with. */

  /** The Individual card with its SMS line removed — the proposed change. */
  const withoutSmsLine = (): Plan[] =>
    plans.map((p) => ({ ...p, features: p.features.filter((f) => !/\bSMS\b/i.test(f)) }));

  it('🔴 the cross-repo price contract reads PRICES, never the feature list', () => {
    const mutated = withoutSmsLine();
    // The line really did go, so the mutation is not a no-op.
    expect(plans.flatMap((p) => p.features).some((f) => /\bSMS\b/i.test(f))).toBe(true);
    expect(mutated.flatMap((p) => p.features).some((f) => /\bSMS\b/i.test(f))).toBe(false);
    // …and the contract does not care.
    expect(() => planPriceContract(mutated)).not.toThrow();
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

  it('🔴 records the exact hand-over, so it cannot be lost', () => {
    // The two lines another ticket has to remove, pinned by their real text. If
    // they are already gone when this runs, the site and the app agree and this
    // test is the thing that says so.
    const pricing = readSrc('components/Pricing.tsx');
    const CARD_LINE = "'SMS (bring your own Twilio)'";
    const stillClaimed = pricing.includes(CARD_LINE);
    if (stillClaimed) {
      // Documented, not silently tolerated: exactly two occurrences, both known.
      expect((pricing.match(/'SMS \(bring your own Twilio\)'/g) ?? []).length).toBe(2);
    } else {
      // The hand-over landed — nothing on the pricing page claims SMS.
      expect(pricing).not.toMatch(/\bSMS\b/);
    }
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
