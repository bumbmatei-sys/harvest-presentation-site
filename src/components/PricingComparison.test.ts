import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  ADD_ON_BILLED_MONTHS, ADD_ONS, AddOns, addOnAvailability, addOnPricingContract,
  ADVERTISED_DISCOUNT_PCT, BILLING_TERMS, planPriceContract, ComparisonTable, PlanCard, plans,
  TERM_MONTHS, termMonthlyEquivalent,
  type AddOn, ALL_TIER_NAMES, FreeTierCard, FREE_TIER } from './Pricing';
import { CATALOG, CATALOG_TOOL_COUNT } from './catalog';
import { Replaces } from './Replaces';
import { CATEGORIES } from '../content/features';
import { FAQS } from '../content/faq';
import { LEGAL_DOCS } from '../content/legal';

/* THE-163 — two claims in the plan comparison grid, and everything the change
 * had to leave alone.
 *
 * 1. CRM is included on Individual. The app turns `crm` true on `plus` in the
 *    same batch; the cheapest plan understating what it includes is the failure
 *    this pins shut.
 * 2. The Docs & Notes row is out of the grid entirely — a founder decision, not
 *    a product change. Notes is real on Small Team and Ministry and keeps every
 *    other surface it has; what it does not keep is a row in a feature table,
 *    here or in the app (whose own table is deleted wholesale in the same
 *    batch). "Cut it from everywhere" meant every TABLE, not every mention.
 *
 * ⚠️ Everything about the grid is read off RENDERED markup. Two reasons, and
 * the second is the one that bites:
 *   - #55: a pure-function test passed while the JSX seam was mutated. A cell
 *     is a claim only once it is a cell.
 *   - The grid is behind `showTable`, which starts closed, so it is NOT in the
 *     prerendered dist/pricing/index.html at all. dist/ can confirm the row is
 *     absent (nothing renders it) but can never confirm a cell says "included".
 *     `ComparisonTable` is rendered here directly because this file is the ONLY
 *     place either claim is checkable as markup.
 *
 * Columns are located by the header they carry, never by index: an assertion
 * pinned to column 0 is an assertion about a position, and the whole point is
 * that it is an assertion about Individual. */

const render = (el: React.ReactElement) => renderToStaticMarkup(el);
/** Markup with tags stripped and entities decoded — what a visitor reads. */
const words = (markup: string) => markup
  .replace(/<[^>]*>/g, ' ')
  .replace(/&#x27;|&#39;/g, "'")
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#x2F;/g, '/')
  .replace(/\s+/g, ' ')
  .trim();
/** Every `$N` figure in a piece of markup, in order. */
/* ⚠️ THE-196 widened this to admit CENTS. It read /\$([0-9][0-9,]*)/, which
   matches "$27.42" as 27 — silently truncating at the decimal point and
   comparing a headline against the wrong number. Any figure on a card may now
   carry cents, so the fraction is part of the match. */
const dollars = (markup: string) => [...markup.matchAll(/\$([0-9][0-9,]*(?:\.[0-9]{2})?)/g)].map((m) => Number(m[1].replace(/,/g, '')));

/* ---------------------------------------------------------------- *
 * Reading the rendered grid back as rows and columns.
 * ---------------------------------------------------------------- */

/** A cell's meaning, as a visitor would read the mark in it. */
type Read = 'included' | 'excluded' | string;

const TABLE_HTML = render(React.createElement(ComparisonTable));
const cellsOf = (rowHtml: string) => [...rowHtml.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);

/** The check glyph is the ONLY thing that means "included" in this grid. */
const readCell = (html: string): Read => {
  if (/lucide-check/.test(html)) return 'included';
  const text = words(html);
  return text === '—' ? 'excluded' : text;
};

const rowsHtml = TABLE_HTML.split(/<tr\b/).slice(1);
/** Column headings in render order, minus the leading "Feature" gutter. */
const planColumns = cellsOf(rowsHtml[0].replace(/<th\b/g, '<td').replace(/<\/th>/g, '</td>'))
  .map(words)
  .slice(1);
/** Every feature row: its label, and one reading per plan column. */
const rows = rowsHtml
  .slice(1)
  .filter((r) => !/colSpan/i.test(r))
  .map((r) => {
    const tds = cellsOf(r);
    return { label: words(tds[0]), cells: tds.slice(1).map(readCell) };
  });
const labels = rows.map((r) => r.label);

/** One row's reading for one named plan — both looked up, never indexed. */
function claim(feature: string, planName: string): Read {
  const row = rows.find((r) => r.label === feature);
  expect(row, `no "${feature}" row in the comparison table`).toBeDefined();
  const col = planColumns.indexOf(planName);
  expect(col, `no "${planName}" column in the comparison table`).toBeGreaterThanOrEqual(0);
  return row!.cells[col];
}

describe('the comparison grid parses at all', () => {
  it('reads back as the plans, with rows and both kinds of mark', () => {
    // Guard against every assertion below passing vacuously off a parser that
    // silently found nothing: a bad regex would make "has no Notes row" true.
    // ALL_TIER_NAMES, not `plans` — THE-204 added Forever Free as a fourth
    // column. `plans` is still the PRICED list and still three long; the table
    // renders the whole ladder.
    expect(planColumns).toEqual(ALL_TIER_NAMES);
    expect(rows.length).toBeGreaterThan(20);
    expect(rows.every((r) => r.cells.length === ALL_TIER_NAMES.length)).toBe(true);
    const readings = rows.flatMap((r) => r.cells);
    expect(readings).toContain('included');
    expect(readings).toContain('excluded');
    expect(claim('Custom Branding', 'Individual')).toBe('excluded');
    expect(claim('Contacts', 'Individual')).toBe('150');
  });
});

/* ---------------------------------------------------------------- *
 * 🔴 The change.
 * ---------------------------------------------------------------- */

const CRM_ROW = 'CRM (Donors & Members)';
const NOTES_ROW = 'Docs & Notes';

describe('CRM on the cheapest plan', () => {
  it('Individual shows CRM as included', () => {
    // 🔴 The claim the app's `crm: true` on `plus` has to be matched by. A dash
    // here understates the cheapest plan by a whole product.
    expect(claim(CRM_ROW, 'Individual')).toBe('included');

    // And on the Individual card, which — unlike the grid — actually reaches
    // dist/pricing/index.html, since the grid renders only after a click.
    const individual = plans.find((p) => p.planId === 'plus');
    expect(individual, 'no plus-tier plan').toBeDefined();
    expect(words(render(React.createElement(PlanCard, { plan: individual!, term: 'yearly' as const }))))
      .toContain(CRM_ROW);
  });

  it('Small Team and Ministry still show CRM', () => {
    // The row was true on all three before this change and stays true on all
    // three: raising Individual must not have been paid for out of the others.
    for (const name of ['Small Team', 'Ministry']) {
      expect(claim(CRM_ROW, name), `${name} lost CRM`).toBe('included');
    }
    // 🔴 ON ALL FOUR TIERS, BUT NOT IDENTICALLY (THE-205). Free carries
    // `crm: true` in the app's matrix — that is the whole point of the tier, an
    // evangelist has to be able to see who enrolled — AND `fundraising: false`,
    // so it has no donate page and no donor record can exist in it. The row
    // LABEL is shared by four columns and keeps the priced tiers' wording;
    // free's CELL is what says members only.
    expect(rows.find((r) => r.label === CRM_ROW)!.cells)
      .toEqual(['Members only', 'included', 'included', 'included']);
  });
});

describe('the Notes row', () => {
  it('the comparison table has no Notes row', () => {
    // 🔴 The removal. Asserted on the rendered grid, so restoring the row to the
    // matrix fails here even though no exported constant changed.
    expect(labels).not.toContain(NOTES_ROW);
    expect(TABLE_HTML).not.toContain('Docs &amp; Notes');

    // Nor under another name. `Sermon Notes → Livestream` is a DIFFERENT feature
    // — pushing an open outline to a live stream — and is deliberately still
    // here; it is the only Notes-bearing label the grid may carry.
    expect(labels.filter((l) => /notes?|docs?/i.test(l))).toEqual(['Sermon Notes → Livestream']);

    // The section it left is intact, so the removal took one row and not a group.
    expect(labels).toContain('Bible');
    expect(labels).toContain('Automated SEO Blog Articles');
    expect(labels).toContain('Sermon Notes → Livestream');
  });
});

/* ---------------------------------------------------------------- *
 * What the change must not have touched.
 * ---------------------------------------------------------------- */

describe('Notes outside the comparison table', () => {
  it('Notes is untouched everywhere else on the site', () => {
    // The feature exists. Only a table row was cut, so every surface that
    // describes the product still describes it — named one by one, because
    // "cut it from everywhere" is exactly the over-correction to guard against.

    // 1. The mega-menu catalogue (components/catalog.ts), which is also what
    //    CATALOG_TOOL_COUNT counts — see the tool-count test below.
    expect(CATALOG.flatMap((g) => g.items.map((i) => i.title))).toContain(NOTES_ROW);

    // 2. Its section on /features/discipleship-content (content/features.ts),
    //    with its tier note intact. THE-164 corrected the chips from [1,1,1]:
    //    the app's `docs` is false on `plus`, so the Individual chip is off. The
    //    section itself stays — a wrong tier is not a reason to cut a feature.
    const discipleship = CATEGORIES.find((c) => c.slug === 'discipleship-content');
    expect(discipleship, 'no discipleship-content category').toBeDefined();
    const docs = discipleship!.features.find((f) => f.id === 'docs');
    expect(docs, 'no docs feature on /features/discipleship-content').toBeDefined();
    expect(docs!.name).toBe(NOTES_ROW);
    expect(docs!.tiers).toEqual([0, 1, 1]);
    expect(docs!.tiersNote).toMatch(/sermon notes/i);

    // 3. The plan cards, rendered. THE-164 moved Docs & Notes off the
    //    Individual card and onto Small Team, where it actually starts;
    //    Ministry inherits it through "Everything in Small Team". Moved, not
    //    dropped — a card that stopped selling Notes anywhere would be the
    //    same over-correction in a different structure.
    const card = (planId: string) => words(render(React.createElement(
      PlanCard, { plan: plans.find((p) => p.planId === planId)!, term: 'yearly' as const },
    )));
    expect(card('pro')).toContain(NOTES_ROW);
    expect(card('pro')).toContain('Sermon Notes → Livestream');

    // 4. The FAQ's plan answer (content/faq.ts) — still names the feature, now
    //    in the Small Team sentence instead of the every-plan one.
    const pricingFaq = FAQS.find((f) => f.id === 'pricing');
    expect(pricingFaq, 'no pricing FAQ').toBeDefined();
    expect(pricingFaq!.answer.join(' ')).toMatch(/docs and sermon notes/i);

    // 5. The "what Harvest replaces" cost table (components/Replaces.tsx),
    //    which prices Notion against Notes / Docs. A different kind of table —
    //    competitors and their monthly cost, not plans and their features — and
    //    it renders on this same page, so it is the nearest thing to the row
    //    that was cut and the likeliest to be swept up with it.
    expect(words(render(React.createElement(Replaces)))).toContain('Notes / Docs');

    // 6. The Terms' description of the product (content/legal.ts).
    const terms = LEGAL_DOCS.find((d) => d.slug === 'terms');
    expect(terms, 'no terms document').toBeDefined();
    const termsText = terms!.sections
      .flatMap((s) => s.blocks.flatMap((b) => (b.kind === 'p' ? [b.text] : b.items)))
      .join(' ');
    expect(termsText).toMatch(/sermon notes/i);
  });
});

describe('the catalogue is a different object from the grid', () => {
  it('the tool count is unchanged at its derived value', () => {
    // 🔴 The wrong-structure guard. A comparison row and a catalogue entry are
    // different things; deleting the entry instead of the row would leave the
    // grid still making the claim AND quietly drop the "N tools in one platform"
    // figure the Nav and the features page advertise.
    expect(CATALOG_TOOL_COUNT).toBe(28);
    expect(CATALOG_TOOL_COUNT).toBe(
      CATALOG.reduce((n, g) => n + g.items.filter((it) => !it.soon).length, 0),
    );
    // Named outright: this is the entry a "finish the job" edit would take.
    expect(CATALOG.find((g) => g.name === 'Discipleship & Content')!.items.map((i) => i.title))
      .toContain(NOTES_ROW);
  });
});

describe('what this change must not have touched', () => {
  it('plan prices and the annual discount are unchanged', () => {
    // 🔴 Data and rendered cards both. Nine stored prices, three terms; the
    // badges are 15% and 30% and are NOT computed from the prices.
    expect(plans.map((p) => p.price.monthly)).toEqual([20, 40, 80]);
    expect(plans.map((p) => p.price.quarterly)).toEqual([49, 99, 199]);
    expect(plans.map((p) => p.price.yearly)).toEqual([165, 329, 659]);
    expect(ADVERTISED_DISCOUNT_PCT).toEqual({ quarterly: 15, yearly: 30 });
    for (const p of plans) {
      for (const term of BILLING_TERMS) {
        // 🔴 THE-196 flipped the hierarchy: the headline is now the per-month
        // figure and the CHARGED total is the line beneath. The prices
        // themselves did not move — that is what this test guards.
        const cardHtml = render(React.createElement(PlanCard, { plan: p, term }));
        expect(dollars(cardHtml)[0]).toBe(termMonthlyEquivalent(p.price[term], term));
        if (term !== 'monthly') {
          expect(cardHtml).toContain(
            `billed as $${p.price[term].toLocaleString()} every ${TERM_MONTHS[term]} months`,
          );
        }
      }
    }
    // The grid quotes no price of its own, and did not start to.
    expect(dollars(TABLE_HTML)).toEqual([]);
  });

  it('the cross-repo price contract still throws when a price disagrees', async () => {
    // The contract runs at module scope, so this file having imported ./Pricing
    // is the proof it passes for today's prices. What is pinned here is that it
    // still THROWS and still names the tier — downgraded to a warning it would
    // ship the mismatch it exists to stop.
    const src = await readFile(fileURLToPath(new URL('./Pricing.tsx', import.meta.url)), 'utf8');
    expect(src).toMatch(/const EXPECTED_PLAN_PRICES: Record<string, Record<BillingTerm, number>> = \{/);
    expect(src).toMatch(/^planPriceContract\(plans\);$/m);
    expect(src).toMatch(/^discountClaimContract\(plans\);$/m);
    // And it still has teeth, proved by MUTATION rather than by reading source:
    // hand it a table that disagrees on one cell and it must throw.
    expect(() =>
      planPriceContract(plans, {
        plus: { monthly: 20, quarterly: 49, yearly: 165 },
        pro: { monthly: 40, quarterly: 100, yearly: 329 },
        max: { monthly: 80, quarterly: 199, yearly: 659 },
      }),
    ).toThrow(/Small Team.*quarterly/);

    // The grid's own width check is the same idiom and stays a build failure.
    expect(src).toMatch(/throw new Error\(`Pricing comparison row/);
  });

  it('the add-ons section is unchanged', () => {
    // Shipped in #58 and untouched by the three-term change: twelve months a
    // year, the availability wording derived from `plans`, and the qualifier
    // that keeps a discount badge from reading as if it applied to these prices
    // too. 🔴 ADD_ON_BILLED_MONTHS stays 12 — quarterly did not add a column,
    // because a quarterly product carries the MONTHLY add-on ids.
    // 🔴 THE-223 corrected all five figures against live Dodo and added Campus,
    // which the section had never listed. The three-term change this test was
    // written for still did not touch them — that is what it guards — so the
    // pin is restated at the corrected values rather than dropped.
    // 🔴 THE-224 WITHDREW THE AI ASSISTANT CARD, and that is the one row this
    // pin has lost. It was not a reprice: the card sold the member-facing
    // assistant, which is the plan capability `aiChat`, already on from Small
    // Team up. Its $20/$240 is unmoved and still pinned against the live Dodo
    // products in DODO_ADD_ON_CATALOG — it is simply no longer quoted here.
    expect(ADD_ON_BILLED_MONTHS).toBe(12);
    expect(ADD_ONS.map((a) => [a.name, a.monthly, a.annual])).toEqual([
      ['Admin seat', 10, 120],
      ['Campus', 12, 144],
      ['Contacts +500', 15, 180],
      ['Unlimited contacts', 40, 480],
    ]);
    expect(() => addOnPricingContract(ADD_ONS)).not.toThrow();
    const discounted: AddOn = { ...ADD_ONS[0], annual: Math.round(ADD_ONS[0].annual * 0.7) };
    expect(() => addOnPricingContract([discounted])).toThrow(/NOT discounted\s+annually/);

    const section = words(render(React.createElement(AddOns, { term: 'yearly' as const })));
    expect(section).toMatch(/add-ons are not discounted/i);
    expect(section).toContain(`the −${ADVERTISED_DISCOUNT_PCT.yearly}% applies to plans only`);
    expect(section).toContain(`A year of an add-on is ${ADD_ON_BILLED_MONTHS} × its monthly price`);
    for (const a of ADD_ONS) expect(section).toContain(addOnAvailability(a.planIds));
    expect(addOnAvailability(['pro', 'max'])).toBe('Small Team and Ministry only');
  });
});


/* ---------------------------------------------------------------- *
 * 🔴 THE-204 — the Forever Free column.
 *
 * Five false claims have already been fixed on this site. Every cell
 * below is the app's PLAN_FEATURES `free` block, read rather than
 * remembered, and each one is a claim a reader makes a decision on.
 * ---------------------------------------------------------------- */

const FREE_COL = 'Forever Free';

describe('the Forever Free column claims exactly what the tier has', () => {
  it('is the first column, so the ladder reads cheapest-first', () => {
    expect(planColumns[0]).toBe(FREE_COL);
  });

  it('🔴 claims NO donation page and NO fundraising', () => {
    // `fundraising: false`. This is the tier's defining absence and the one a
    // reader is most likely to assume away, because every other card on the
    // page leads with 0% donation fees.
    expect(claim('Donation Page', FREE_COL)).toBe('excluded');
    expect(claim('Fundraising', FREE_COL)).toBe('excluded');
  });

  it('claims the 500-member cap, which is higher than Individual’s 150', () => {
    // Not a typo and not a copy-paste from Small Team: the founder chose a
    // generous-but-capped free tier (Option A), and 500 over 150 is exactly the
    // tension that decision creates. It is stated rather than hidden.
    expect(claim('Contacts', FREE_COL)).toBe('500');
    expect(claim('Contacts', 'Individual')).toBe('150');
  });

  it('claims one course and one admin', () => {
    expect(claim('Courses', FREE_COL)).toBe('1');
    expect(claim('Admin accounts', FREE_COL)).toBe('1');
  });

  it('claims the installable app, and a MEMBERS-ONLY CRM, which free genuinely has', () => {
    // 🔴 WAS 'included' (THE-205). Free has the CRM and does not have donors —
    // `crm: true`, `fundraising: false` — so a plain tick under a row headed
    // "CRM (Donors & Members)" made the row label's full claim on its behalf.
    expect(claim('CRM (Donors & Members)', FREE_COL)).toBe('Members only');
    expect(claim('Mobile App (PWA)', FREE_COL)).toBe('included');
  });

  it('🔴 claims NO news or community feed — the correction THE-205 exists for', () => {
    // Both rows name the same product (NewsTab/AllNews over /community_posts).
    // The app gates it on `newsFeed`, false on free and true on every tier that
    // pays, so both must read excluded here and included everywhere else.
    for (const row of ['News Feed', 'Community Feed']) {
      expect(claim(row, FREE_COL), `free claims ${row}, which it does not have`).toBe('excluded');
    }
  });

  it('🔴 leaves both feed rows included on all three priced tiers', () => {
    // The no-regression half. Three tiers pay for this feed; a correction that
    // reached one column too far would take it from them.
    for (const row of ['News Feed', 'Community Feed']) {
      for (const name of ['Individual', 'Small Team', 'Ministry']) {
        expect(claim(row, name), `${name} lost ${row}`).toBe('included');
      }
    }
  });

  it('claims NO blog, newsletter, SMS, livestream, check-in, groups or accounting', () => {
    for (const row of [
      'Blog', 'Automated SEO Blog Articles', 'Newsletter', 'Automated Newsletter',
      'SMS (bring your own Twilio)', 'Livestream + Live Giving', 'Check-In System (QR)',
      'Community Groups', 'Event Registration', 'Church Map', 'Custom Branding',
      'Custom Domain', 'Custom Forms \u2192 CRM', 'Accounting + QuickBooks Sync',
      'Tax Receipts & Giving Statements', 'Sermon Notes \u2192 Livestream',
    ]) {
      expect(claim(row, FREE_COL), `free claims ${row}, which it does not have`).toBe('excluded');
    }
  });

  it('does not quietly take a feature away from a paying tier', () => {
    // Adding a column is an edit to every row. This is the no-regression half:
    // the three priced columns must read exactly as they did before THE-204.
    expect(claim('Blog', 'Individual')).toBe('included');
    expect(claim('Donation Page', 'Individual')).toBe('included');
    expect(claim('SMS (bring your own Twilio)', 'Individual')).toBe('included');
    expect(claim('Contacts', 'Small Team')).toBe('500');
    expect(claim('Contacts', 'Ministry')).toBe('2,000');
    expect(claim('Courses', 'Ministry')).toBe('15');
    expect(claim('Livestream + Live Giving', 'Small Team')).toBe('included');
    expect(claim('Community Groups', 'Ministry')).toBe('included');
  });
});

/* ---------------------------------------------------------------- *
 * 🔴 THE-204 — the Forever Free CARD.
 *
 * The comparison table renders only after a click; the CARD is what
 * reaches dist/pricing/index.html, so it is what a visitor and a
 * crawler actually read. Every non-negotiable from the brief is
 * asserted on the rendered card, not on the data behind it.
 * ---------------------------------------------------------------- */

describe('the Forever Free card', () => {
  const html = () => render(React.createElement(FreeTierCard, { tier: FREE_TIER }));
  const text = () => words(html());

  it('names the audience, which is the differentiator — not the price', () => {
    expect(text()).toContain('FOR EVANGELISTS');
    expect(text()).toContain('evangelists');
  });

  it('🔴 says plainly that it has no donation page', () => {
    // Every other card leads with 0% donation fees in this same slot. A free
    // card that merely omitted it would let the reader carry that assumption
    // across from the card beside it.
    expect(text()).toContain('No donation page');
  });

  it('states the 500 cap, the honest differentiator against Individual’s 150', () => {
    expect(text()).toContain('500 members');
  });

  it('prices at $0 with no billing cycle, and quotes no term', () => {
    expect(text()).toContain('$0');
    expect(text()).toContain('forever');
    expect(text()).toContain('no card required');
    // "/mo" would imply a cycle free does not have.
    expect(text()).not.toContain('/mo');
    for (const term of ['monthly', 'quarterly', 'yearly', 'annually', 'billed as']) {
      expect(text().toLowerCase(), `the free card quotes "${term}"`).not.toContain(term);
    }
  });

  it('does not sell a trial — free is not a trial of anything and never expires', () => {
    expect(text()).not.toContain('Start free trial');
    expect(text()).not.toContain('trial');
  });

  it('does NOT wear the RECOMMENDED treatment, which Ministry owns', () => {
    // That treatment sells the most expensive plan. Using it here would put the
    // cheapest and the dearest tier in the same visual slot.
    expect(text()).not.toContain('RECOMMENDED');
    const ministry = plans.find((p) => p.popular);
    expect(ministry, 'no popular plan').toBeDefined();
    expect(words(render(React.createElement(PlanCard, { plan: ministry!, term: 'yearly' as const }))))
      .toContain('RECOMMENDED');
  });

  it('claims no feature free does not have', () => {
    // Scoped to the FEATURE LIST, not the whole card. The card deliberately
    // says the words "giving and fundraising" — in its no-donation-page line,
    // as an absence — and a whole-card scan would read that disclosure as the
    // very claim it exists to deny.
    const bullets = FREE_TIER.features.join(' | ').toLowerCase();
    for (const absent of [
      'livestream', 'newsletter', 'check-in', 'community groups', 'custom domain',
      'custom branding', 'accounting', 'quickbooks', 'tax receipt', 'sms',
      'fundraising', 'donation', 'event registration', 'church map', 'blog',
    ]) {
      expect(bullets, `the free card lists "${absent}" as a feature`).not.toContain(absent);
    }
    // And the disclosure really is present, so the narrowing above cannot be
    // read as having quietly dropped the claim.
    expect(text()).toContain('No donation page');
  });

  it('is absent from `plans`, so no price contract can demand a price for it', () => {
    // The seam. `plans` is the PRICED list and stays three long; a fourth entry
    // here would need three numbers, and the cross-repo contract would then
    // demand three matching numbers in the app's PLAN_PRICING, which
    // deliberately has none.
    expect(plans.map((p) => p.planId)).not.toContain('free');
    expect(plans).toHaveLength(3);
    expect(ALL_TIER_NAMES).toHaveLength(4);
    // 🔴 And the contract still passes for today's data while STILL throwing on
    // a disagreement — free being absent from it must not have turned it off.
    expect(() => planPriceContract(plans)).not.toThrow();
    // Built from `plans` itself and then drifted by $1, so the mutation cannot
    // go stale when a price legitimately changes.
    const mutated = Object.fromEntries(
      plans.map((pl) => [pl.planId, { ...pl.price }]),
    ) as Record<string, Record<(typeof BILLING_TERMS)[number], number>>;
    mutated.plus.monthly += 1;
    expect(() => planPriceContract(plans, mutated)).toThrow(/Individual.*monthly/);
  });
});
