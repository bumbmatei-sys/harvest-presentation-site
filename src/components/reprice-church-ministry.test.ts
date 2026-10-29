import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  ADD_ONS,
  ADVERTISED_DISCOUNT_PCT,
  ADVERTISED_FREE_MONTHS,
  ALL_TIER_NAMES,
  BILLING_TERMS,
  CHEAPEST_MONTHLY,
  ComparisonTable,
  DISCOUNTED_TERMS,
  DODO_ADD_ON_CATALOG,
  FREE_TIER,
  PROCESSOR_FEES_NOTE,
  PlanCard,
  Pricing,
  TermToggle,
  actualSavingPct,
  aiMessagesLine,
  discountClaim,
  planPriceContract,
  plans,
  productFeeLine,
  type BillingTerm,
  type Plan,
} from './Pricing';
import { FAQS, FAQ_PLAN_CLAIMS, faqPlainText } from '../content/faq';
import { LEGAL_DOCS, TIER_PRICE_CLAIMS } from '../content/legal';
import { CATEGORIES } from '../content/features';

/* ─────────────────────────────────────────────────────────────────────────────
 * THE TWO-PLAN REPRICE — Church $30 / Ministry $90, plus Forever Free.
 *
 * The approved spec (founder, 27 Oct 2026) replaced the three paid plans
 * (plus $20 / pro $40 / max $80) with two. This file pins the spec as the site
 * renders it; the THE-222 and THE-248 suites retain their repricing and discount guards.
 *
 * Read off RENDERED markup wherever a visitor would read it.
 * ───────────────────────────────────────────────────────────────────────────*/

const words = (markup: string) => markup
  .replace(/<[^>]*>/g, ' ')
  .replace(/&#x27;|&#39;/g, "'")
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ')
  .trim();

const church = plans.find((p) => p.planId === 'plus')!;
const ministry = plans.find((p) => p.planId === 'max')!;
const cardText = (plan: Plan, term: BillingTerm) =>
  words(renderToStaticMarkup(React.createElement(PlanCard, { plan, term })));
const toggleMarkup = (value: BillingTerm) =>
  renderToStaticMarkup(React.createElement(TermToggle, { value, onChange: () => {} }));
const pageText = () => words(renderToStaticMarkup(React.createElement(Pricing)));

describe('two paid plans, Church and Ministry, and nothing else for sale', () => {
  it('Church is $30 / $300 and Ministry is $90 / $900', () => {
    expect(church.name).toBe('Church');
    expect(church.price).toEqual({ monthly: 30, yearly: 300 });
    expect(ministry.name).toBe('Ministry');
    expect(ministry.price).toEqual({ monthly: 90, yearly: 900 });
    expect(plans).toHaveLength(2);
    expect(ALL_TIER_NAMES).toEqual(['Forever Free', 'Church', 'Ministry']);
  });

  it('the terms stay monthly and yearly — no quarterly came back', () => {
    expect([...BILLING_TERMS]).toEqual(['monthly', 'yearly']);
    expect([...DISCOUNTED_TERMS]).toEqual(['yearly']);
  });

  it('signup deep-links keep the stored ids the app already resolves: plus (Church) and max (Ministry)', () => {
    expect(plans.map((p) => p.planId)).toEqual(['plus', 'max']);
    // Never 'church' (that is the generic signup funnel in lib/ref.ts) and
    // never the retired 'pro'.
    for (const p of plans) {
      for (const term of BILLING_TERMS) {
        const html = renderToStaticMarkup(React.createElement(PlanCard, { plan: p, term }));
        expect(html).toContain(`signup=${p.planId}`);
        expect(html).not.toContain('signup=church');
        expect(html).not.toContain('signup=pro');
      }
    }
  });

  it('the cross-repo contract holds these four numbers and throws on a one-sided edit', () => {
    expect(() => planPriceContract(plans)).not.toThrow();
    expect(() => planPriceContract(plans, {
      plus: { monthly: 30, yearly: 300 }, max: { monthly: 90, yearly: 900 },
    })).not.toThrow();
    expect(() => planPriceContract(plans, {
      plus: { monthly: 20, yearly: 190 }, max: { monthly: 90, yearly: 900 },
    })).toThrow(/Church/);
    expect(() => planPriceContract(plans, {
      plus: { monthly: 30, yearly: 300 }, max: { monthly: 80, yearly: 752 },
    })).toThrow(/Ministry/);
  });

  it('the cheapest "from $X/mo" figure is Church monthly, never a discounted-term figure', () => {
    expect(CHEAPEST_MONTHLY).toBe(30);
  });
});

describe('the yearly discount: "2 months free", contract number 16', () => {
  it('prints 2 months free on the toggle and nowhere a percentage', () => {
    expect(ADVERTISED_DISCOUNT_PCT).toEqual({ yearly: 16 });
    expect(ADVERTISED_FREE_MONTHS).toEqual({ yearly: 2 });
    expect(discountClaim('yearly')).toBe('2 months free');
    for (const selected of BILLING_TERMS) {
      const html = toggleMarkup(selected);
      expect(html.match(/data-testid="term-toggle-badge"/g), `with ${selected} selected`).toHaveLength(1);
      expect(html).toContain('2 months free');
      expect(html).not.toMatch(/-[0-9]+%/);
    }
  });

  it('16 is the real 16.67% rounded down — never claims more than the prices deliver', () => {
    for (const p of plans) expect(actualSavingPct(p, 'yearly')).toBeCloseTo(16.6667, 3);
    expect(ADVERTISED_DISCOUNT_PCT.yearly).toBe(Math.floor(actualSavingPct(church, 'yearly')));
  });

  it('monthly carries no badge element and no saving — not an empty one, not a 0%', () => {
    expect(toggleMarkup('monthly')).not.toContain('data-testid="term-toggle-badge" data-term="monthly"');
    for (const p of plans) {
      const text = cardText(p, 'monthly');
      expect(text, `${p.name} monthly`).not.toContain('billed as');
      expect(text, `${p.name} monthly`).not.toMatch(/save/i);
      expect(text, `${p.name} monthly`).not.toMatch(/[0-9]+% off/);
    }
    expect(actualSavingPct(church, 'monthly')).toBe(0);
  });

  it('no rendered page, FAQ answer or Term still says 20% / 21% / 30% off', () => {
    const everything = [
      pageText(),
      faqPlainText(),
      ...LEGAL_DOCS.flatMap((d) => d.sections.flatMap((s) => s.blocks.flatMap((b) => (b.kind === 'p' ? [b.text] : b.items)))),
    ].join('\n');
    expect(everything).not.toMatch(/\b(?:20|21|22|30)% off/i);
    expect(everything).not.toMatch(/Save (?:up to )?\d+%/);
    expect(everything).not.toMatch(/-\d+%/);
  });
});

describe('Harvest fees: 0% on donations, 5% / 2% on product sales (coming soon)', () => {
  it('donation fee is 0 on both plans; product fee is 5% on Church and 2% on Ministry', () => {
    expect(plans.map((p) => p.fee)).toEqual([0, 0]);
    expect(plans.map((p) => p.productFee)).toEqual([0.05, 0.02]);
  });

  it('every card states the 0% and the product fee, with "coming soon" beside it', () => {
    for (const p of plans) {
      for (const term of BILLING_TERMS) {
        const text = cardText(p, term);
        expect(text, `${p.name} ${term}`).toContain('0% Harvest fee on donations');
        expect(text, `${p.name} ${term}`).toContain(`${productFeeLine(p)} — coming soon`);
      }
    }
    expect(productFeeLine(church)).toBe('5% Harvest fee on product sales');
    expect(productFeeLine(ministry)).toBe('2% Harvest fee on product sales');
  });

  it('the page says the processor’s own fees apply on top', () => {
    expect(PROCESSOR_FEES_NOTE).toMatch(/payment processor/i);
    expect(PROCESSOR_FEES_NOTE).toMatch(/on top/i);
    expect(pageText()).toContain(PROCESSOR_FEES_NOTE);
  });

  it('the comparison table carries both fee rows, with the product fee marked coming soon', () => {
    const text = words(renderToStaticMarkup(React.createElement(ComparisonTable)));
    expect(text).toContain('Harvest fee on donations');
    expect(text).toMatch(/Harvest fee on product sales[^A-Z]*5%\s*coming soon[^A-Z]*2%\s*coming soon/);
  });

  it('the FAQ and the Terms state the same fees', () => {
    const faq = FAQS.find((f) => f.id === 'donation-fee')!.answer.join(' ');
    expect(faq).toContain('0% Harvest fee on donations');
    expect(faq).toContain('5% on Church and 2% on Ministry');
    expect(faq).toMatch(/coming soon/);
    expect(faq).toContain(PROCESSOR_FEES_NOTE);
    expect(FAQ_PLAN_CLAIMS.map((c) => c.productFee)).toEqual([0.05, 0.02]);
    const terms = LEGAL_DOCS.find((d) => d.slug === 'terms')!
      .sections.flatMap((s) => s.blocks.flatMap((b) => (b.kind === 'p' ? [b.text] : b.items))).join(' ');
    expect(terms).toContain('5% of product sales on Church and 2% on Ministry');
    expect(terms).toMatch(/processor charges its own fees on top/);
  });
});

describe('AI assistant: 300 / 5,000 messages a month, never "unlimited", always coming soon', () => {
  it('config holds the real numbers', () => {
    expect(plans.map((p) => p.aiMessages)).toEqual([300, 5000]);
    expect(aiMessagesLine(church)).toBe('300 AI assistant messages a month');
    expect(aiMessagesLine(ministry)).toBe('5,000 AI assistant messages a month');
  });

  it('each card prints its number with "coming soon" on the same line', () => {
    expect(church.features).toContain('300 AI assistant messages a month — coming soon');
    expect(ministry.features).toContain('5,000 AI assistant messages a month — coming soon');
    for (const p of plans) expect(cardText(p, 'yearly')).not.toMatch(/unlimited AI|AI[^.]{0,30}unlimited/i);
  });

  it('the FAQ quotes the same two numbers', () => {
    expect(FAQ_PLAN_CLAIMS.map((c) => c.aiMessages)).toEqual([300, 5000]);
    const pricing = FAQS.find((f) => f.id === 'pricing')!.answer.join(' ');
    expect(pricing).toContain('300 messages a month on Church');
    expect(pricing).toContain('5,000 messages a month on Ministry');
  });
});

describe('Giving records replaces Accounting, and never claims to replace QuickBooks', () => {
  const allCopy = () => [
    pageText(),
    words(renderToStaticMarkup(React.createElement(ComparisonTable))),
    faqPlainText(),
    ...CATEGORIES.flatMap((c) => c.features.flatMap((f) => [f.name, f.title, f.oneliner, f.moment, ...f.admin, ...f.member])),
  ].join('\n');

  it('the comparison row and the feature entry use the new name', () => {
    const table = words(renderToStaticMarkup(React.createElement(ComparisonTable)));
    expect(table).toContain('Giving records (statements & year-end receipts)');
    expect(table).not.toContain('Accounting');
    const feature = CATEGORIES.flatMap((c) => c.features).find((f) => f.id === 'accounting')!;
    expect(feature.name).toBe('Giving records');
    // The anchor id survived, so /features/giving-finance#accounting still resolves.
    expect(feature.id).toBe('accounting');
    expect(CATEGORIES.find((c) => c.slug === 'giving-finance')!.features).toContain(feature);
  });

  it('"Accounting" is gone from every customer-facing surface; QuickBooks is never promised', () => {
    const text = allCopy();
    expect(text).not.toMatch(/\bAccounting\b/);
    expect(text).not.toMatch(/replace[sd]? QuickBooks|QuickBooks replacement|instead of QuickBooks/i);
    expect(text).not.toMatch(/is accounting software|our accounting software|bookkeeping software/i);
  });
});

describe('coming-soon items say so on the plan cards and the comparison table', () => {
  it('every unbuilt item on a card carries "coming soon" on its own line', () => {
    const UNBUILT = /storefront|website builder|discovery|AI assistant|paid checkout|in every community|newsletter|SMS/i;
    for (const p of plans) {
      for (const line of p.features.filter((f) => UNBUILT.test(f))) {
        // A flag flipped on turns the newsletter / SMS line into the plain
        // claim, and the Coming Soon entry leaves in the same flip.
        if (/^(Newsletter|SMS & Text-to-Give)$/.test(line)) continue;
        expect(line, `"${line}" is not built and does not say so`).toMatch(/coming soon/);
      }
    }
  });

  it('the comparison table renders "coming soon" for the unbuilt rows, never a tick', () => {
    const html = renderToStaticMarkup(React.createElement(ComparisonTable));
    const rowOf = (label: string) => html.split('<tr').find((r) => r.includes(`>${label}<`))!;
    for (const label of ['Storefront', 'Website builder with pre-made templates', 'Discovery listing']) {
      const row = rowOf(label);
      expect(row, `no "${label}" row`).toBeDefined();
      expect(row).toContain('coming soon');
      expect(row).not.toContain('lucide-check');
    }
  });
});

describe('no retired plan name or price survives on the site', () => {
  it('no card, FAQ answer or Terms clause names Individual or Small Team as a plan', () => {
    const terms = LEGAL_DOCS.flatMap((d) => d.sections.flatMap((s) => s.blocks.flatMap((b) => (b.kind === 'p' ? [b.text] : b.items))));
    const text = [pageText(), faqPlainText(), ...terms].join('\n');
    expect(text).not.toMatch(/\bSmall Team\b/);
    expect(text).not.toMatch(/\bIndividual (plan|tier|card)\b/);
    expect(text).not.toMatch(/\$(20|40|80|190|380|752)\/(mo|yr)\b/);
  });

  it('the Terms and the FAQ quote the new prices, from claims tables that name only Church and Ministry', () => {
    expect(TIER_PRICE_CLAIMS.map((c) => [c.planId, c.name, c.monthly, c.annual])).toEqual([
      ['plus', 'Church', 30, 300], ['max', 'Ministry', 90, 900],
    ]);
    expect(FAQ_PLAN_CLAIMS.map((c) => [c.planId, c.name, c.monthly, c.annual, c.people, c.admins])).toEqual([
      ['plus', 'Church', 30, 300, '500', '2'], ['max', 'Ministry', 90, 900, '5,000', '15'],
    ]);
  });

  it('every feature page’s plan chips are two cells: [Church, Ministry]', () => {
    for (const f of CATEGORIES.flatMap((c) => c.features)) {
      expect(f.tiers, `${f.id} still carries a chip for a plan that no longer exists`).toHaveLength(2);
    }
  });
});

describe('Dodo: the add-ons attached to the new products', () => {
  it('prices and ids are untouched; every add-on is sold on Ministry alone', () => {
    expect(Object.entries(DODO_ADD_ON_CATALOG).map(([n, p]) => [n, p.monthlyId, p.annualId])).toEqual([
      ['AI Assistant', 'adn_0NlKtuImtSn7PcdvjnSni', 'adn_0NlKtw3IOHfv1GGCevNol'],
      ['Admin seat', 'adn_0NlKtw7AayNYI6YYwphQ5', 'adn_0NlKtw9lWLs0VRN9hWciX'],
      ['Unlimited contacts', 'adn_0NlKtwKAhJgz0jeaqDX2c', 'adn_0NlKtwMjMlsjzZ8z2Wt7P'],
    ]);
    expect(ADD_ONS.map((a) => [a.name, a.monthly, a.annual])).toEqual([
      ['Admin seat', 10, 120], ['Unlimited contacts', 30, 360],
    ]);
    expect(ADD_ONS.map((a) => a.planIds)).toEqual([['max'], ['max']]);
  });
});

describe('the free tier is unchanged except for the name of the plan it points at', () => {
  it('is still $0 forever with its subdomain and no donation page, pointing giving at Church', () => {
    expect(FREE_TIER.name).toBe('Forever Free');
    expect(FREE_TIER.noDonatePage).toBe('No donation page — giving and fundraising start on Church.');
    expect(FREE_TIER.features).toContain('500 members · 1 admin');
    expect(FREE_TIER as unknown as { price?: unknown }).not.toHaveProperty('price');
  });
});

describe('structured data and meta carry no retired plan or price', () => {
  it('the files that build meta, JSON-LD and the nav name no retired plan', () => {
    for (const file of ['../pages/Landing.tsx', 'Nav.tsx', '../pages/BlogPost.tsx', '../content/faq.ts']) {
      const src = readFileSync(fileURLToPath(new URL(file, import.meta.url)), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
      expect(src, file).not.toMatch(/Small Team|Individual plan|\$(20|40|80)\b/);
    }
  });
});
