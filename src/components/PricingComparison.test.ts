import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  ADD_ON_BILLED_MONTHS, ADD_ONS, AddOns, addOnAvailability, addOnPricingContract,
  ANNUAL_BILLED_MONTHS, ANNUAL_DISCOUNT_PCT, annualMonthly, ComparisonTable, PlanCard, plans,
  type AddOn,
} from './Pricing';
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
const dollars = (markup: string) => [...markup.matchAll(/\$([0-9][0-9,]*)/g)].map((m) => Number(m[1].replace(/,/g, '')));

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
    expect(planColumns).toEqual(plans.map((p) => p.name));
    expect(rows.length).toBeGreaterThan(20);
    expect(rows.every((r) => r.cells.length === plans.length)).toBe(true);
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
    expect(words(render(React.createElement(PlanCard, { plan: individual!, annual: true }))))
      .toContain(CRM_ROW);
  });

  it('Small Team and Ministry still show CRM', () => {
    // The row was true on all three before this change and stays true on all
    // three: raising Individual must not have been paid for out of the others.
    for (const name of ['Small Team', 'Ministry']) {
      expect(claim(CRM_ROW, name), `${name} lost CRM`).toBe('included');
    }
    expect(rows.find((r) => r.label === CRM_ROW)!.cells)
      .toEqual(plans.map(() => 'included'));
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
      PlanCard, { plan: plans.find((p) => p.planId === planId)!, annual: true },
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
    // 49 / 99 / 199, billed at 9 of 12 months, rendering 37 / 74 / 149 under a
    // −25% badge. Data and rendered cards both.
    expect(plans.map((p) => p.monthly)).toEqual([49, 99, 199]);
    expect(ANNUAL_BILLED_MONTHS).toBe(9);
    expect(ANNUAL_DISCOUNT_PCT).toBe(25);
    expect(plans.map((p) => annualMonthly(p.monthly))).toEqual([37, 74, 149]);
    for (const p of plans) {
      expect(dollars(render(React.createElement(PlanCard, { plan: p, annual: true })))[0])
        .toBe(annualMonthly(p.monthly));
      expect(dollars(render(React.createElement(PlanCard, { plan: p, annual: false })))[0])
        .toBe(p.monthly);
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
    expect(src).toMatch(/const EXPECTED_ANNUAL_MONTHLY: Record<string, number> = \{ plus: 37, pro: 74, max: 149 \};/);
    expect(src).toMatch(/const EXPECTED_ANNUAL_DISCOUNT_PCT = 25;/);
    expect(src).toMatch(/if \(annualMonthly\(p\.monthly\) !== expected\) \{\s*\n\s*throw new Error\(/);
    expect(src).toMatch(/if \(ANNUAL_DISCOUNT_PCT !== EXPECTED_ANNUAL_DISCOUNT_PCT\) \{/);
    // And it still has teeth: move the multiplier by a month on this side alone
    // and at least one tier stops matching the figure the app publishes.
    const shifted = (monthly: number) => Math.round((monthly * (ANNUAL_BILLED_MONTHS + 1)) / 12);
    expect(plans.some((p) => shifted(p.monthly) !== annualMonthly(p.monthly))).toBe(true);

    // The grid's own width check is the same idiom and stays a build failure.
    expect(src).toMatch(/throw new Error\(`Pricing comparison row/);
  });

  it('the add-ons section is unchanged', () => {
    // Shipped in #58 and untouched here: twelve months a year, the availability
    // wording derived from `plans`, and the qualifier that keeps a −25% badge
    // from reading as if it applied to these prices too.
    expect(ADD_ON_BILLED_MONTHS).toBe(12);
    expect(ADD_ONS.map((a) => [a.name, a.monthly, a.annual])).toEqual([
      ['AI Assistant seat', 19, 228],
      ['Admin seat', 10, 120],
      ['Contacts +500', 20, 240],
      ['Unlimited contacts', 59, 708],
    ]);
    expect(() => addOnPricingContract(ADD_ONS)).not.toThrow();
    const discounted: AddOn = { ...ADD_ONS[0], annual: annualMonthly(ADD_ONS[0].annual) };
    expect(() => addOnPricingContract([discounted])).toThrow(/NOT discounted\s+annually/);

    const section = words(render(React.createElement(AddOns, { annual: true })));
    expect(section).toMatch(/add-ons are not discounted annually/i);
    expect(section).toContain(`the −${ANNUAL_DISCOUNT_PCT}% applies to plans only`);
    expect(section).toContain(`A year of an add-on is ${ADD_ON_BILLED_MONTHS} × its monthly price`);
    for (const a of ADD_ONS) expect(section).toContain(addOnAvailability(a.planIds));
    expect(addOnAvailability(['pro', 'max'])).toBe('Small Team and Ministry only');
  });
});
