import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CATEGORIES } from './features';
import { plans, planPriceContract, BILLING_TERMS } from '../components/Pricing';
import { ADD_ONS } from '../components/Pricing';

/**
 * THE-281 — the share button reaches the site.
 *
 * ─── 🔴 What "verified against the app" means in THIS repo ──────────────────
 *
 * The two repos cannot share code — the site does not import the app, and at CI
 * time the app is not on disk. So every cross-repo claim on this site is a
 * TRANSCRIPTION WITH A CITATION, checked by a human against the app at a named
 * commit and pinned here so a later reader can re-check it in one grep. That is
 * the shape `PricingFreeTierCorrections`, `the-222-repricing` and
 * `planPriceContract` all already use, and this file does not invent a new one.
 *
 * ⚠️ VERIFIED AT Harvest-agent `7f8455e` (main, 2026-09-03):
 *
 *   AdminDashboard.tsx:578
 *     const canDonations = !!(planAllows(features?.fundraising) && canSettings);
 *   AdminDashboard.tsx:636
 *     canDonations && { id: 'donations', label: 'Donations', icon: HandCoins },
 *
 *   plan-features.ts `fundraising`:  free false · plus true · pro true · max true
 *   plan-features.ts `crm`:          free true  · plus true · pro true · max true
 *
 * 🔴 NOTE `planAllows`, NOT `navAllows`. `navAllows` is the one that also lets
 * the FREE tier see a tab and wall it behind PlanUpgradeScreen; `planAllows` is
 * "may this tenant actually use it". Donations asks the second, so free does not
 * get a walled Donations tab either — it has no donate page by decision. That is
 * why the share entry's copy says "on every paid plan" and never "on every plan":
 * Forever Free is a real, sold tier on this site, and it genuinely lacks this.
 */

const SHARE_ID = 'sharegiving';
const byId = new Map(CATEGORIES.flatMap((c) => c.features.map((f) => [f.id, f] as const)));
const allFeatures = CATEGORIES.flatMap((c) => c.features);

/** `tiers` is positional against `plans`: [Individual, Small Team, Ministry]. */
const TIER_NAMES = ['Individual', 'Small Team', 'Ministry'] as const;

// ═════════════════════════════════════════════════════════════════════════════
// 10 · Signups — 🔴 ALREADY DESCRIBED. Not added.
// ═════════════════════════════════════════════════════════════════════════════
describe('10 — the Signups capability is described, with tiers matching features.crm', () => {
  /**
   * 🔴 THE-281 SHIPPED NO SIGNUPS ENTRY, AND THAT IS THE FINDING.
   *
   * #422 split Signups onto its own admin page. Every capability it carries was
   * ALREADY described on this site by `analytics` (Evangelism Analytics), which
   * predates it: city/country breakdown, the new-signups window, and the CSV
   * export of contacts with their onboarding answers. An app-internal navigation
   * change is not a new marketing capability, and a second entry describing the
   * same four bullets is the duplicate this suite exists to prevent.
   */
  const analytics = byId.get('analytics');

  it('the capability is on the site, under `analytics`', () => {
    expect(analytics, 'the Evangelism Analytics entry is gone').toBeDefined();
  });

  it('it describes every part of what #422 shipped', () => {
    const admin = analytics!.admin.join(' | ').toLowerCase();
    // The four things the ticket named, each already claimed.
    expect(admin, 'the new-signups window is not described').toMatch(/new signups by window/);
    expect(admin, 'the city/country breakdown is not described').toMatch(/by city & country/);
    expect(admin, 'the CSV export is not described').toMatch(/csv exports?/);
    expect(admin, 'the onboarding answers are not described').toMatch(/onboarding questions?/);
  });

  it('🔴 its tiers are features.crm, and features.crm is true on all three', () => {
    // Transcribed from Harvest-agent plan-features.ts — see the header.
    const CRM_IN_APP = { plus: true, pro: true, max: true } as const;
    expect(Object.values(CRM_IN_APP).every(Boolean),
      'the transcription says crm is not on every priced plan').toBe(true);
    expect(analytics!.tiers, 'the analytics tiers no longer match features.crm').toEqual([1, 1, 1]);
  });

  it('🔴 no second Signups entry was added', () => {
    const suspects = allFeatures.filter((f) => /signup/i.test(f.id) || /signup/i.test(f.name));
    expect(suspects.map((f) => f.id),
      'a Signups entry was added — `analytics` already describes it').toEqual([]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 11 · the share feature — 🔴 tiers must be TRUE
// ═════════════════════════════════════════════════════════════════════════════
describe('11 — the share feature entry exists with tiers that are true', () => {
  const share = byId.get(SHARE_ID);

  it('the entry exists, on the Giving & Finance page', () => {
    expect(share, `no #${SHARE_ID} feature`).toBeDefined();
    const category = CATEGORIES.find((c) => c.features.some((f) => f.id === SHARE_ID))!;
    expect(category.slug).toBe('giving-finance');
  });

  it('it has every field the shape requires, and a correct tiers length', () => {
    for (const k of ['id', 'name', 'n', 'accent', 'accentBg', 'eyebrow', 'title',
      'oneliner', 'moment'] as const) {
      expect(share![k], `#${SHARE_ID} has no ${k}`).toBeTruthy();
    }
    expect(share!.admin.length, 'no admin bullets').toBeGreaterThan(0);
    expect(share!.member.length, 'no member bullets').toBeGreaterThan(0);
    // The module-scope contract asserts this too; asserting it here names the
    // feature when it fails.
    expect(share!.tiers).toHaveLength(plans.length);
  });

  it('🔴 its tiers are features.fundraising, verified against the app', () => {
    /* Transcribed from Harvest-agent at 7f8455e — see the header. The share
       button is on the admin Donations screen, and that screen is gated by
       `canDonations = planAllows(features?.fundraising) && canSettings`. */
    const FUNDRAISING_IN_APP: Record<(typeof plans)[number]['planId'], boolean> = {
      plus: true, pro: true, max: true,
    };
    const expected = plans.map((p) => (FUNDRAISING_IN_APP[p.planId] ? 1 : 0));
    expect(share!.tiers, 'the share entry claims a tier the app does not grant')
      .toEqual(expected);

    // And said the other way round, so a transcription flipped to all-true
    // cannot pass by agreeing with itself.
    for (const [i, name] of TIER_NAMES.entries()) {
      const planId = plans[i].planId;
      expect(share!.tiers[i] === 1, `${name} (${planId}) is claimed but the app does not grant it`)
        .toBe(FUNDRAISING_IN_APP[planId]);
    }
  });

  it('🔴 it never claims the free tier, which genuinely does not have it', () => {
    // `tiers` cannot express free at all — it is positional against the three
    // PAID plans — so the claim can only be made in prose. It must not be.
    const prose = [share!.oneliner, share!.moment, share!.title, share!.eyebrow,
      ...share!.admin, ...share!.member, share!.tiersNote ?? ''].join(' ');
    expect(prose, 'the share entry claims the free tier')
      .not.toMatch(/every plan|all plans|including Forever Free|free tier|on free/i);
  });

  it('the app-side claims it makes are ones the app actually supports', () => {
    const prose = [...share!.admin, ...share!.member, share!.oneliner, share!.moment].join(' ');
    // A QR code, a copy, and a native share sheet — the three mechanisms the
    // app's GivingShareSheet actually implements. Nothing else is claimed.
    expect(prose).toMatch(/QR/);
    expect(prose).toMatch(/[Cc]opy/);
    expect(prose).toMatch(/share sheet/i);
    // 🔴 It must NOT claim Stripe card giving, which is switched off (THE-256).
    expect(prose, 'the share entry claims Stripe Connect, which is switched off')
      .not.toMatch(/Stripe/);
  });

  it('its crosslinks resolve to real, visible sections', () => {
    for (const cl of share!.crosslinks ?? []) {
      const [, fragment] = cl.href.split('#');
      expect(byId.has(fragment), `crosslink "${cl.label}" points at #${fragment}, which is not visible`)
        .toBe(true);
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 12 · 🔴 no duplicates
// ═════════════════════════════════════════════════════════════════════════════
describe('12 — neither feature duplicates an existing entry', () => {
  it('ids are unique', () => {
    const ids = allFeatures.map((f) => f.id);
    expect(ids.length, 'a feature id is duplicated').toBe(new Set(ids).size);
  });

  it('names are unique', () => {
    const names = allFeatures.map((f) => f.name);
    expect(names.length, 'a feature name is duplicated').toBe(new Set(names).size);
  });

  it('🔴 the share entry is not a second Donation Page', () => {
    const share = byId.get(SHARE_ID)!;
    const donation = byId.get('donation')!;
    expect(share.id).not.toBe(donation.id);
    // The distinction, asserted rather than asserted-in-a-comment: the donation
    // entry is about Stripe card gifts; this one is about handing the page's
    // address to a congregation and the church's OWN accounts.
    expect(donation.oneliner).toMatch(/Stripe/);
    expect(share.oneliner).not.toMatch(/Stripe/);
    expect(share.oneliner + share.moment).toMatch(/QR|share/i);
  });

  it('🔴 exactly one entry describes the signups/analytics capability', () => {
    const describing = allFeatures.filter((f) =>
      /new signups by window/i.test(f.admin.join(' ')));
    expect(describing.map((f) => f.id), 'the signups capability is described twice')
      .toEqual(['analytics']);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 13 · 🔴 the nine plan prices, and the contract's teeth
// ═════════════════════════════════════════════════════════════════════════════
describe('13 — the nine plan prices are unchanged and the contract still throws', () => {
  /* Harvest-agent src/utils/plan-features.ts PLAN_PRICING, at 7f8455e. */
  const APP_PRICING = {
    plus: { monthly: 20, quarterly: 54, yearly: 190 },
    pro: { monthly: 40, quarterly: 108, yearly: 380 },
    max: { monthly: 80, quarterly: 216, yearly: 760 },
  } as const;

  it('all nine are exactly what the app publishes', () => {
    let checked = 0;
    for (const p of plans) {
      for (const term of BILLING_TERMS) {
        expect(p.price[term], `${p.name} ${term} moved`)
          .toBe(APP_PRICING[p.planId as keyof typeof APP_PRICING][term]);
        checked += 1;
      }
    }
    expect(checked, 'not nine prices were checked').toBe(9);
  });

  it('the live contract passes against the shipped table', () => {
    expect(() => planPriceContract(plans)).not.toThrow();
  });

  it('🔴 and it still THROWS on disagreement — the teeth, not just the pass', () => {
    const wrong = {
      plus: { ...APP_PRICING.plus, monthly: 21 },
      pro: { ...APP_PRICING.pro },
      max: { ...APP_PRICING.max },
    };
    expect(() => planPriceContract(plans, wrong))
      .toThrow(/Harvest-agent src\/utils\/plan-features\.ts PLAN_PRICING/);
  });

  it('THE-281 changed no price in the source at all', () => {
    const src = readFileSync(
      fileURLToPath(new URL('../components/Pricing.tsx', import.meta.url)), 'utf8');
    expect(src).toContain("plus: { monthly: 20, quarterly: 54,  yearly: 190 }");
    expect(src).toContain("pro:  { monthly: 40, quarterly: 108, yearly: 380 }");
    expect(src).toContain("max:  { monthly: 80, quarterly: 216, yearly: 760 }");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 14 · the prerendered page count
// ═════════════════════════════════════════════════════════════════════════════
describe('14 — the prerendered page count is unchanged', () => {
  it('🔴 THE-281 adds a SECTION, not a page — the count stays 21', () => {
    /* A feature is a section on a category page reached by an in-page anchor
       (`/features/giving-finance#sharegiving`), so it adds no route. The five
       category pages are what `vite-react-ssg` prerenders, and there are still
       five of them. `LegalPage.test.ts` asserts the 21 itself, against the real
       route table; this says WHY it must not have moved. */
    expect(CATEGORIES).toHaveLength(5);
    const slugs = CATEGORIES.map((c) => c.slug);
    expect(slugs).toEqual([
      'community-engagement', 'discipleship-content', 'ai-automation',
      'giving-finance', 'platform-brand',
    ]);
    // And the new feature really is an in-page anchor on one of them.
    const category = CATEGORIES.find((c) => c.features.some((f) => f.id === SHARE_ID))!;
    expect(slugs).toContain(category.slug);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 15 · 🔴 not an add-on
// ═════════════════════════════════════════════════════════════════════════════
describe('15 — neither feature was added to the add-on catalogue', () => {
  it('🔴 the add-on catalogue is untouched by this ticket', () => {
    const names = ADD_ONS.map((a) => a.name);
    for (const forbidden of [/share/i, /giving page/i, /\bQR\b/, /signup/i]) {
      expect(names.filter((n) => forbidden.test(n)),
        `an add-on matching ${forbidden} was added — neither of these is an add-on`).toEqual([]);
    }
  });

  it('the catalogue still holds exactly the add-ons it shipped with', () => {
    expect(ADD_ONS.map((a) => a.name)).toEqual([
      'AI Assistant', 'Admin seat', 'Campus', 'Contacts +500', 'Unlimited contacts',
    ]);
  });
});
