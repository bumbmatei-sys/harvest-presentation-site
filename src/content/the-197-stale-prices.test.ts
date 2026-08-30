import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ADD_ONS, DODO_ADD_ON_CATALOG, INTENTIONALLY_UNADVERTISED, plans, planPriceContract } from '../components/Pricing';
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

  /** The site's headline rule — ceiled at the cent, never rounded down, because
   *  a per-month figure may not imply less than the charged year. */
  const perMonth = (yearly: number) => Math.ceil(Number((yearly / 12 * 100).toFixed(6))) / 100;

  it('the Ministry-vs-competitors argument uses the real yearly monthly-equivalent', () => {
    // ⚠️ THE-222 MOVED WHICH TIER DIVIDES EXACTLY. This used to assert
    // `ministry.price.yearly / 12` was exactly 110.75, because $1,329 over
    // twelve months is exact. No year divides cleanly under THE-248 — $190,
    // $380 and $760 over twelve are $15.8333, $31.6667 and $63.3333 — so the
    // ceiling rule applies to all three, the same rule the card headline uses.
    //
    // 🔴 THE-248 IS THE FIRST REPRICE THAT RAISED PRICES, WHICH INVERTS THIS
    // GUARD'S RISK. Every stale figure this file has caught before was HIGHER
    // than the real price and so could only oversell. Ministry's year went
    // $659 → $760, so the sentence left unedited would have read $54.92/month
    // against a real $63.34 — an UNDERSELL of $8.42 a month, $101 a year, and a
    // price a church could reasonably expect to be honoured. That is why this
    // assertion is `toBe` on the derived figure and a `toContain` on the
    // sentence, not a scan for retired numbers: only the derivation catches a
    // stale figure that is too LOW.
    expect(perMonth(ministry.price.yearly)).toBe(63.34);
    expect(blogPost).toContain(
      `Harvest's Ministry plan is $${perMonth(ministry.price.yearly).toFixed(2)}/month billed annually`,
    );
  });

  it('the Small Team-vs-competitors argument uses the real yearly monthly-equivalent', () => {
    // Small Team yearly is $380 over 12 months — $31.6667, ceiled to the cent.
    // 🔴 $27.42 was THIS tier's figure until THE-248 and is now nobody's, so a
    // post left unedited would have read plausibly and UNDERSOLD by $4.25 a
    // month ($51 a year) — see the note on the Ministry case above.
    expect(perMonth(smallTeam.price.yearly)).toBe(31.67);
    expect(perMonth(smallTeam.price.yearly)).not.toBe(perMonth(ministry.price.yearly));
    expect(blogPost).toContain(
      `Harvest's Small Team plan is $${perMonth(smallTeam.price.yearly).toFixed(2)}/month billed annually`,
    );
  });

  it('no retired Harvest price survives in the blog post', () => {
    // Each is anchored to the SENTENCE it would appear in, never to a bare
    // figure — $99 and $199 are still real prices (Small Team's and Ministry's
    // quarter), so only "Small Team, $99/mo" is wrong, not "$99".
    expect(blogPost).not.toMatch(/Small Team, \$99\/mo/);
    expect(blogPost).not.toMatch(/Ministry, \$199\/mo/);
    expect(blogPost).not.toMatch(/2 on \$49/);
    expect(blogPost).not.toMatch(/Ministry plan is \$149/);
    expect(blogPost).not.toMatch(/Small Team plan is \$74/);
    // 🔴 THE-222's own retirees, in the same sentence-anchored form.
    expect(blogPost).not.toMatch(/Small Team, \$79\/mo/);
    expect(blogPost).not.toMatch(/Ministry, \$159\/mo/);
    expect(blogPost).not.toMatch(/2 on \$39/);
    expect(blogPost).not.toMatch(/Ministry plan is \$110\.75/);
    expect(blogPost).not.toMatch(/Small Team plan is \$54\.92/);
    // 🔴 THE-248's own retirees. Both UNDERSTATE the current price, which is
    // the first time a figure banned here could have been too low rather than
    // too high — see the note on the Ministry assertion above.
    expect(blogPost).not.toMatch(/Ministry plan is \$54\.92/);
    expect(blogPost).not.toMatch(/Small Team plan is \$27\.42/);
  });
});

describe('THE-197 — competitor prices in the blog post are unchanged', () => {
  it('names Skool, Teachable and Planning Center at their original figures', () => {
    // Skool — untouched, and deliberately still reads "$99" (Skool's own price,
    // not Harvest's Small Team price, which is why it must NOT be edited).
    expect(blogPost).toContain('Community feed | Included, all plans | Not a product they offer | Skool Pro, **$99/mo**');
    // ⚠️ This row carries BOTH halves — Harvest's per-tier course prices and
    // Teachable's $89 — so the Harvest half is interpolated from `plans` and
    // only the competitor half is a literal. Written out whole, the row went
    // stale at THE-222 and failed a test whose subject is competitor prices.
    expect(blogPost).toContain(
      `Courses | 2 on $${individual.price.monthly} · 5 on $${smallTeam.price.monthly} · `
      + `15 on $${ministry.price.monthly} | Not a product they offer | Teachable Builder, **$89/mo**`,
    );
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
    // First campus is included in the plan; 11 more at the flat Campus add-on
    // price. Hidden behind MULTI_CAMPUS_ENABLED, so read straight from source
    // (see above) — nothing renders it, which is exactly why it went stale.
    //
    // 🔴 DERIVED FROM `ADD_ONS`, NOT FROM A LITERAL, AND THAT IS THE THE-223
    // FIX. This test used to assert `11 * 20 === 220` — arithmetic that is
    // internally perfect and was checking the wrong price, because $20 was
    // never what Dodo charged for a campus. Reading the figure from the add-on
    // table means a reprice fails here instead of leaving a sentence behind the
    // flag that quotes a price no product has.
    const campus = ADD_ONS.find((a) => a.name === 'Campus');
    expect(campus, 'no Campus add-on to price the arithmetic from').toBeDefined();
    const elevenMore = 11 * campus!.monthly;
    expect(FEATURES_SRC).toContain(`bill is $${ministry.price.monthly} + $${elevenMore}`);
    expect(FEATURES_SRC).toContain(`the other eleven are $${campus!.monthly} each`);
    expect(FEATURES_SRC).toContain(`Flat $${campus!.monthly}/mo each`);
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
      { planId: 'plus', price: { monthly: 20, quarterly: 54, yearly: 190 }, fee: 0 },
      { planId: 'pro', price: { monthly: 40, quarterly: 108, yearly: 380 }, fee: 0 },
      { planId: 'max', price: { monthly: 80, quarterly: 216, yearly: 760 }, fee: 0 },
    ]);
  });

  it('ADD_ONS and ADD_ON_BILLED_MONTHS are untouched', () => {
    // 🔴 THE-223 is the change that DID touch them — four prices were wrong
    // against live Dodo and Campus was missing entirely. The availability
    // column is unchanged and is now confirmed against the products themselves:
    // every live plan product carries AI and Admin Seat, Contacts +500 starts
    // at Small Team, Unlimited is Ministry only, and Campus is attached to all
    // three. THE-197 still moved no price data, which is what this pins.
    //
    // 🔴 THE-224 REMOVED THE AI ASSISTANT ROW AND THE-253 RESTORED IT, AND
    // NEITHER MOVED A PRICE. The card sold `aiChat`, a capability the plan
    // included from Small Team up; that inclusion is gone, so the card is back
    // at the same $20/$240 the catalogue has pinned against the live Dodo
    // products the whole time. All five rows are byte-for-byte what they were
    // before the withdrawal, which is exactly what a no-price-moved test should
    // be able to say after a round trip.
    expect(ADD_ONS.map((a) => ({ name: a.name, monthly: a.monthly, annual: a.annual, planIds: a.planIds }))).toEqual([
      { name: 'AI Assistant', monthly: 20, annual: 240, planIds: ['plus', 'pro', 'max'] },
      { name: 'Admin seat', monthly: 10, annual: 120, planIds: ['plus', 'pro', 'max'] },
      { name: 'Campus', monthly: 12, annual: 144, planIds: ['plus', 'pro', 'max'] },
      { name: 'Contacts +500', monthly: 15, annual: 180, planIds: ['pro', 'max'] },
      { name: 'Unlimited contacts', monthly: 40, annual: 480, planIds: ['max'] },
    ]);
    expect(DODO_ADD_ON_CATALOG['AI Assistant']).toEqual({
      monthlyId: 'adn_0NlKtuImtSn7PcdvjnSni', annualId: 'adn_0NlKtw3IOHfv1GGCevNol',
      monthlyCents: 2000, annualCents: 24000,
    });
    // WAS `toBeTruthy()` — the declaration that let THE-224's withdrawal pass
    // the catalogue contract. THE-253 restored the card, so the declaration is
    // gone and the constant is empty; the product is advertised, which is the
    // stronger state. Asserted rather than deleted, because a declaration
    // standing beside an advertised card is a contradiction the contract throws
    // on, and this says which side of it we are on.
    expect(INTENTIONALLY_UNADVERTISED['AI Assistant']).toBeUndefined();
    expect(ADD_ONS.some((a) => a.name === 'AI Assistant')).toBe(true);
  });

  it('the cross-repo price contract still throws when the two repos disagree', () => {
    expect(() =>
      planPriceContract(plans, {
        plus: { monthly: 20, quarterly: 54, yearly: 190 },
        pro: { monthly: 40, quarterly: 108, yearly: 380 },
        max: { monthly: 80, quarterly: 216, yearly: 761 },
      }),
    ).toThrow(/Ministry.*yearly/);
    expect(() => planPriceContract(plans)).not.toThrow();
  });

  it('the tool count is unchanged at its derived value', () => {
    expect(CATALOG_TOOL_COUNT).toBe(27);
    expect(CATALOG_TOOL_COUNT).toBe(
      CATALOG.reduce((n, g) => n + g.items.filter((it) => !it.soon).length, 0),
    );
  });
});
