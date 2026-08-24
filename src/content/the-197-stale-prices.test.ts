import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ADD_ONS, plans, planPriceContract } from '../components/Pricing';
import { CATEGORIES } from './features';
import { CATALOG, CATALOG_TOOL_COUNT } from '../components/catalog';

/* THE-197 — two editorial surfaces (the Planning Center blog post and
 * content/features.ts) quoted the plan prices THE-195 retired. Both are
 * copy-only fixes: no price data moved, only the sentences built around it.
 *
 * These tests read the real source — `plans` (Pricing.tsx's PLAN_PRICING) and
 * the blog post straight off disk — rather than hard-coded literals, so a
 * future reprice that forgets to touch this prose fails here instead of
 * shipping silently. */

const POSTS_DIR = fileURLToPath(new URL('./posts', import.meta.url));
const blogPost = readFileSync(
  `${POSTS_DIR}/planning-center-alternative-small-churches.md`,
  'utf8',
);

const individual = plans.find((p) => p.planId === 'plus')!;
const smallTeam = plans.find((p) => p.planId === 'pro')!;
const ministry = plans.find((p) => p.planId === 'max')!;

const allFeatureProse = () =>
  CATEGORIES.flatMap((c) => c.features).flatMap((f) => [
    f.eyebrow,
    f.oneliner,
    f.moment,
    ...f.admin,
    ...f.member,
  ]).join(' \n ');

/* `affiliate` and `churches` are hidden behind feature flags (both false today)
 * and dropped from the exported `CATEGORIES` by the flag-driven filter, so they
 * cannot be reached through the normal import — read the module source
 * directly for these two, the same way the blog post is read off disk. */
const FEATURES_SRC = readFileSync(
  fileURLToPath(new URL('./features.ts', import.meta.url)),
  'utf8',
);

describe('THE-197 — the blog post no longer contradicts PLAN_PRICING', () => {
  it('quotes Small Team, Ministry and the per-tier course prices correctly', () => {
    expect(blogPost).toContain(`Kids' check-in (QR) | Small Team, $${smallTeam.price.monthly}/mo`);
    expect(blogPost).toContain(`Newsletter | Small Team, $${smallTeam.price.monthly}/mo`);
    expect(blogPost).toContain(`Tax receipts & statements | Ministry, $${ministry.price.monthly}/mo`);
    expect(blogPost).toContain(
      `2 on $${individual.price.monthly} · 5 on $${smallTeam.price.monthly} · 15 on $${ministry.price.monthly}`,
    );
  });

  it('the Ministry-vs-competitors argument uses the real yearly monthly-equivalent', () => {
    // Ministry yearly is $1,329 over 12 months — an exact division, $110.75/mo.
    expect(ministry.price.yearly / 12).toBe(110.75);
    expect(blogPost).toContain(
      `Harvest's Ministry plan is $${(ministry.price.yearly / 12).toFixed(2)}/month billed annually`,
    );
  });

  it('the Small Team-vs-competitors argument uses the real yearly monthly-equivalent', () => {
    // Small Team yearly is $659 over 12 months — not exact, ceiled to the cent.
    const exact = smallTeam.price.yearly / 12;
    const ceiled = Math.ceil(Number((exact * 100).toFixed(6))) / 100;
    expect(ceiled).toBe(54.92);
    expect(blogPost).toContain(
      `Harvest's Small Team plan is $${ceiled.toFixed(2)}/month billed annually`,
    );
  });

  it('no retired Harvest price survives in the blog post', () => {
    expect(blogPost).not.toMatch(/Small Team, \$99\/mo/);
    expect(blogPost).not.toMatch(/Ministry, \$199\/mo/);
    expect(blogPost).not.toMatch(/2 on \$49/);
    expect(blogPost).not.toMatch(/Ministry plan is \$149/);
    expect(blogPost).not.toMatch(/Small Team plan is \$74/);
  });
});

describe('THE-197 — competitor prices in the blog post are unchanged', () => {
  it('names Skool, Teachable and Planning Center at their original figures', () => {
    // Skool — untouched, and deliberately still reads "$99" (Skool's own price,
    // not Harvest's Small Team price, which is why it must NOT be edited).
    expect(blogPost).toContain('Community feed | Included, all plans | Not a product they offer | Skool Pro, **$99/mo**');
    expect(blogPost).toContain('Courses | 2 on $39 · 5 on $79 · 15 on $159 | Not a product they offer | Teachable Builder, **$89/mo**');
    expect(blogPost).toContain('Add it up. Planning Center at roughly $30, [Skool](https://www.skool.com/pricing) Pro at $99, [Teachable](https://teachable.com/pricing) Builder at $89 — **$218 a month, across three vendors, and you still do not have a website.**');
    expect(blogPost).toContain('Skool Pro plus Teachable Builder is $188/month for two products.');
    // The competitor arithmetic still adds up.
    expect(30 + 99 + 89).toBe(218);
    expect(99 + 89).toBe(188);
  });
});

describe('THE-197 — features.ts no longer contradicts PLAN_PRICING', () => {
  const byId = (id: string) => CATEGORIES.flatMap((c) => c.features).find((f) => f.id === id)!;

  it('the donation feature carries NO price literal at all, so it cannot go stale', () => {
    // ⚠️ RESOLVED AGAINST THE-204, which landed while this branch was open.
    // THE-197 was going to correct this sentence's "$49" to "$39". THE-204 went
    // further and removed the number entirely — "on the cheapest paid plan" —
    // while making the tier language free-aware, because a free tier exists now
    // and "every plan" was claiming a donate page free does not have.
    //
    // That is strictly the better fix and it is the one kept: a sentence with no
    // figure in it cannot contradict PLAN_PRICING, which is the whole point of
    // this file. So the assertion inverts — it pins the ABSENCE of a literal
    // rather than the correctness of one.
    const donation = byId('donation');
    expect(donation.moment).toContain('on the cheapest paid plan and every plan above it');
    // Scoped to PLAN prices — current and retired. The sentence legitimately
    // cites "$200k a year online" and "$10,000", which are a CHURCH'S giving
    // volume, not anything Harvest charges, and a blanket no-digits scan would
    // read those as the very thing it exists to forbid.
    // 🔴 BOUNDED, and THE-222 is why. This read `.toContain('$20')`, which is a
    // SUBSTRING test: the sentence's "$200k a year online" contains "$20", so
    // the moment Individual became $20 a month the assertion failed on a figure
    // that is a congregation's giving volume and not a Harvest price at all.
    // The scan has to stop at a digit boundary or it reads the very numbers the
    // comment above says it must not.
    //
    // The retired figures move with the reprice too: $49, $99 and $199 are all
    // real prices again (Individual quarterly, Small Team quarterly, Ministry
    // quarterly), so the retired set is what THE-222 actually retired.
    const RETIRED_MONTHLY = ['39', '79', '159'];
    for (const figure of [...plans.map((pl) => String(pl.price.monthly)), ...RETIRED_MONTHLY]) {
      expect(donation.moment, `a plan price ($${figure}) came back into the donation copy`)
        .not.toMatch(new RegExp(`\\$${figure}(?![\\d,])`));
    }
    // The free-aware wording THE-204 added, pinned so a later editorial pass
    // cannot quietly re-promise a donate page free does not have.
    expect(donation.title).toContain('every paid plan');
    expect(donation.oneliner).toContain('every paid plan');
  });

  it('the analytics feature names the real Individual price, and the real FLOOR', () => {
    const analytics = byId('analytics');
    // The moment still quotes Individual by price — THE-197's correction, kept.
    expect(analytics.moment).toContain(`on the $${individual.price.monthly} plan`);
    // ⚠️ The member line says "Forever Free", not a price — THE-204 again, and
    // it is TRUE: free carries analytics in the app's matrix (it rides
    // `crm: true`, which free has). Naming Individual as the floor here would
    // now be wrong, so this asserts the tier rather than a figure.
    expect(analytics.member.join(' ')).toContain('including Forever Free');
  });

  it('the multi-campus arithmetic uses the real Ministry monthly price and resolves cleanly', () => {
    // First campus is included in the plan; 11 more at the stated flat $20/mo
    // each is $220 — unchanged, since that add-on price never moved. Hidden
    // behind MULTI_CAMPUS_ENABLED, so read straight from source (see above).
    expect(FEATURES_SRC).toContain(`bill is $${ministry.price.monthly} + $220`);
    expect(11 * 20).toBe(220);
  });

  it('the affiliate arithmetic uses the real Ministry monthly price and totals correctly', () => {
    const perChurchMonthly = ministry.price.monthly * 0.15;
    const fiveChurchesMonthly = Math.round(perChurchMonthly * 5);
    const yearTotal = perChurchMonthly * 5 * 12;
    // Hidden behind AFFILIATE_PROGRAM_ENABLED, so read straight from source.
    expect(FEATURES_SRC).toContain(
      `refer five churches on the $${ministry.price.monthly} plan and that’s about $${fiveChurchesMonthly} a month for twelve months, roughly $${yearTotal.toLocaleString()} in total`,
    );
  });

  it('no retired Harvest price survives in features.ts prose, including hidden sections', () => {
    const prose = allFeatureProse();
    expect(prose).not.toMatch(/\$49\b/);
    expect(prose).not.toMatch(/\$149\b/);
    // FEATURES_SRC covers the two flag-hidden features CATEGORIES drops.
    expect(FEATURES_SRC).not.toMatch(/\$199 \+ \$220/);
    expect(FEATURES_SRC).not.toMatch(/\$199 plan/);
    expect(FEATURES_SRC).not.toMatch(/on the \$49 plan/);
  });
});

describe('THE-197 — no price data changed', () => {
  it('PLAN_PRICING (plans) is the nine prices THE-222 repriced to, and the fee is still 0%', () => {
    // ⚠️ THE-197 could not touch a price; THE-222 IS the reprice, so this pin
    // moves with it. What the assertion is really holding is the FEE — 0% on
    // every tier — which no reprice may disturb, and the shape of the row.
    expect(plans.map((p) => ({ planId: p.planId, price: p.price, fee: p.fee }))).toEqual([
      { planId: 'plus', price: { monthly: 20, quarterly: 49, yearly: 165 }, fee: 0 },
      { planId: 'pro', price: { monthly: 40, quarterly: 99, yearly: 329 }, fee: 0 },
      { planId: 'max', price: { monthly: 80, quarterly: 199, yearly: 659 }, fee: 0 },
    ]);
  });

  it('ADD_ONS and ADD_ON_BILLED_MONTHS are untouched', () => {
    expect(ADD_ONS.map((a) => ({ name: a.name, monthly: a.monthly, annual: a.annual, planIds: a.planIds }))).toEqual([
      { name: 'AI Assistant', monthly: 19, annual: 228, planIds: ['plus', 'pro', 'max'] },
      { name: 'Admin seat', monthly: 10, annual: 120, planIds: ['plus', 'pro', 'max'] },
      { name: 'Contacts +500', monthly: 20, annual: 240, planIds: ['pro', 'max'] },
      { name: 'Unlimited contacts', monthly: 59, annual: 708, planIds: ['max'] },
    ]);
  });

  it('the cross-repo price contract still throws when the two repos disagree', () => {
    expect(() =>
      planPriceContract(plans, {
        plus: { monthly: 20, quarterly: 49, yearly: 165 },
        pro: { monthly: 40, quarterly: 99, yearly: 329 },
        max: { monthly: 80, quarterly: 199, yearly: 660 },
      }),
    ).toThrow(/Ministry.*yearly/);
    expect(() => planPriceContract(plans)).not.toThrow();
  });

  it('the tool count is unchanged at its derived value', () => {
    expect(CATALOG_TOOL_COUNT).toBe(28);
    expect(CATALOG_TOOL_COUNT).toBe(
      CATALOG.reduce((n, g) => n + g.items.filter((it) => !it.soon).length, 0),
    );
  });
});
