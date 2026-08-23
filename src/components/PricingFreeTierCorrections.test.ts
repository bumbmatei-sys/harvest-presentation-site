import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  ALL_TIER_NAMES, BILLING_TERMS, ComparisonTable, FREE_TIER, FreeTierCard,
  PlanCard, crmLabel, planPriceContract, plans,
} from './Pricing';
import { CATEGORIES } from '../content/features';

/**
 * THE-205 — the two corrections the founder made after seeing the live card.
 *
 *   1. Free must not have the news and community feed. Free is discipleship
 *      only. The app gates the feed on a NEW `newsFeed` cell — false on free,
 *      true on the three tiers that pay — because the feed had no flag at all
 *      before: it was ungated on every tier.
 *   2. "CRM (Donors & Members)" is wrong on free. Free is `fundraising: false`
 *      — no donate page — so no donor record can ever exist in its CRM.
 *
 * ⚠️ EVERY CLAIM IS READ OFF RENDERED MARKUP, not off the data behind it. A
 * tier is not a claim until something draws it, and the CARD is what reaches
 * dist/pricing/index.html — the grid renders only after a click. Five false
 * claims had been fixed on this site before THE-204 and a sixth is being fixed
 * here; reading the constants back would not have caught any of them.
 */

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

const freeCard = () => words(render(React.createElement(FreeTierCard, { tier: FREE_TIER })));
const cardFor = (planId: string) => {
  const plan = plans.find((p) => p.planId === planId);
  expect(plan, `no ${planId} plan`).toBeDefined();
  return words(render(React.createElement(PlanCard, { plan: plan!, term: 'yearly' as const })));
};

/* ---------------------------------------------------------------- *
 * 🔴 THE APP'S MATRIX FOR `free`, TRANSCRIBED.
 *
 * Ground truth is Harvest-agent src/utils/plan-features.ts. Written
 * out here rather than fetched, for the same reason the price
 * contract's nine numbers are: two independently-written copies is
 * the whole mechanism. A one-sided edit makes them disagree and a
 * test fails.
 * ---------------------------------------------------------------- */
const FREE_MATRIX = {
  newsFeed: false,       // 🔴 THE-205 — the new cell, and the whole of change 1
  blog: false,
  aiChat: false,
  aiKnowledge: false,
  map: false,
  maxChurches: 0,
  maxContacts: 500,
  maxCourses: 1,
  maxAdmins: 1,
  customDomain: false,
  customBranding: false,
  newsletterAutomation: false,
  automatedNewsletter: false,
  smsAutomation: false,
  aiAssistant: 0,
  fundraising: false,    // 🔴 no donate page — which is why the CRM line moved
  eventRegistration: false,
  docs: false,
  crm: true,
  accountingTools: false,
  taxReceipt: false,
  communityGroups: false,
  customForms: false,
  checkInSystem: false,
  livestream: false,
  sermonNotes: false,
  automatedBlog: false,
  givingStatements: false,
  pledgeCampaigns: false,
  textToGive: false,
  pwaApp: true,
} as const;

// ─── 6. 🔴 the free card does not list a news or community feed ──────────────
describe('the free card does not list a news or community feed', () => {
  it('lists no feed line at all — read off the rendered card', () => {
    const text = freeCard().toLowerCase();
    for (const phrase of ['news & community feed', 'news feed', 'community feed', 'news']) {
      expect(text, `the free card still renders "${phrase}"`).not.toContain(phrase);
    }
  });

  it('has dropped the exact bullet it used to carry', () => {
    // Named verbatim so a rewording that keeps the claim ("Church Feed",
    // "Announcements") still fails the broader scan above rather than sneaking
    // past a test that only knew the old string.
    expect(FREE_TIER.features).not.toContain('News & Community Feed');
  });

  it('the comparison grid agrees with the card, on BOTH feed rows', () => {
    // Two rows name one product. Leaving either at a tick re-makes the exact
    // claim the other just dropped — and the card and the grid must not
    // disagree, which is the failure mode this whole ticket exists to correct.
    const html = render(React.createElement(ComparisonTable));
    const cellsOf = (rowHtml: string) =>
      [...rowHtml.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
    const rows = html.split(/<tr\b/).slice(1)
      .filter((r) => !/colSpan/i.test(r))
      .map((r) => cellsOf(r))
      .filter((tds) => tds.length > 1)
      .map((tds) => ({ label: words(tds[0]), cells: tds.slice(1) }));
    const freeCol = 0; // Forever Free is column 0 — asserted in section 10.
    for (const label of ['News Feed', 'Community Feed']) {
      const row = rows.find((r) => r.label === label);
      expect(row, `no "${label}" row in the comparison table`).toBeDefined();
      // The check glyph is the ONLY thing that means "included" in this grid.
      expect(/lucide-check/.test(row!.cells[freeCol]), `free claims ${label}`).toBe(false);
      for (const paid of [1, 2, 3]) {
        expect(/lucide-check/.test(row!.cells[paid]), `a priced tier lost ${label}`).toBe(true);
      }
    }
  });

  it('the /features "Available on" chips need no change — they never show free', () => {
    // Scope, pinned rather than reasoned. The Community Feed section on
    // /features/community-engagement carries `tiers: [1, 1, 1]` — THREE cells,
    // positional against the PRICED plans. Free has no column there, so the
    // feed's chips are still correct and are deliberately untouched. If a later
    // ticket adds free to that surface, this fails and the chips become in
    // scope.
    const feed = CATEGORIES.flatMap((c) => c.features).find((f) => f.id === 'feed');
    expect(feed, 'no "feed" feature in the catalog').toBeDefined();
    expect(feed!.tiers, 'the feed section now has a free column').toHaveLength(plans.length);
    expect(feed!.tiers).toEqual([1, 1, 1]);
  });

  it('🔴 still lists the feed on the three tiers that pay for it', () => {
    // The overshoot guard. Individual's card is the only priced card that
    // enumerates the feed by name; Small Team and Ministry inherit it through
    // "Everything in …", which section 10 pins whole.
    expect(cardFor('plus')).toContain('Blog & News Feed');
  });
});

// ─── 7. 🔴 the free card's CRM line names members only ───────────────────────
describe("the free card's CRM line names members only", () => {
  it('renders "CRM (Members)" and never mentions donors', () => {
    const text = freeCard();
    expect(text).toContain('CRM (Members)');
    expect(text, 'the free card names donors it cannot have').not.toContain('CRM (Donors');
  });

  it('says it because free has no donate page, not by coincidence', () => {
    // The label is derived from `fundraising`. If free ever gained a donate
    // page the line would have to move back — and this pins the reason, so a
    // later edit cannot keep the noun while flipping the cell.
    expect(FREE_MATRIX.fundraising).toBe(false);
    expect(FREE_MATRIX.crm).toBe(true);
    expect(crmLabel('free')).toBe('CRM (Members)');
  });

  it('still discloses the missing donate page in its own right', () => {
    // Renaming the CRM line is not a substitute for the disclosure: every other
    // card leads with 0% donation fees in that slot.
    expect(freeCard()).toContain('No donation page');
  });
});

// ─── 8. 🔴 the priced cards still say Donors & Members ───────────────────────
describe('the priced cards still say Donors & Members', () => {
  it("Individual's card renders the full label", () => {
    expect(cardFor('plus')).toContain('CRM (Donors & Members)');
  });

  it('the helper answers the full label for every priced tier', () => {
    for (const p of plans) {
      expect(crmLabel(p.planId), `${p.name}'s CRM label moved`).toBe('CRM (Donors & Members)');
    }
  });

  it('the comparison row keeps the priced tiers’ wording as its label', () => {
    expect(render(React.createElement(ComparisonTable))).toContain('CRM (Donors &amp; Members)');
  });

  it('🔴 free is the ONLY tier whose label changed', () => {
    const labels = ['free', ...plans.map((p) => p.planId)].map(crmLabel);
    expect(labels).toEqual([
      'CRM (Members)',
      'CRM (Donors & Members)',
      'CRM (Donors & Members)',
      'CRM (Donors & Members)',
    ]);
  });
});

// ─── 9. 🔴 every free card line is derived from the matrix ───────────────────
describe('every free card line is derived from the matrix', () => {
  /** Each bullet the free card actually renders, paired with the cell that
   *  entitles it. A line with no cell behind it is a claim nothing supports. */
  const LINE_SOURCE: Record<string, keyof typeof FREE_MATRIX> = {
    '500 members · 1 admin': 'maxContacts',
    '1 course, adopted from the library': 'maxCourses',
    'CRM (Members)': 'crm',
    'Mobile App (PWA)': 'pwaApp',
  };

  it('every bullet with a matrix cell behind it has that cell TRUE', () => {
    for (const [line, cell] of Object.entries(LINE_SOURCE)) {
      expect(FREE_TIER.features, `the card stopped rendering "${line}"`).toContain(line);
      const value = FREE_MATRIX[cell];
      expect(Boolean(value), `the card claims "${line}" but free's \`${cell}\` is ${value}`).toBe(true);
    }
  });

  it('the numbers on the card are the matrix’s numbers', () => {
    const text = freeCard();
    expect(text).toContain(`${FREE_MATRIX.maxContacts} members`);
    expect(text).toContain(`${FREE_MATRIX.maxAdmins} admin`);
    expect(text).toMatch(new RegExp(`\\b${FREE_MATRIX.maxCourses} course\\b`));
  });

  it('🔴 claims NOTHING the matrix says free does not have', () => {
    // The negative half, and the one that catches a new false claim rather than
    // re-checking the ones already fixed. Every `false`/`0` cell is walked, so a
    // bullet added later for a capability free lacks fails here without anyone
    // having to remember to extend a list.
    const ABSENT_WORDS: Partial<Record<keyof typeof FREE_MATRIX, string[]>> = {
      newsFeed: ['news feed', 'community feed', 'news'],
      blog: ['blog'],
      aiChat: ['ai chat'],
      aiKnowledge: ['knowledge base'],
      map: ['church map'],
      customDomain: ['custom domain'],
      customBranding: ['custom branding'],
      newsletterAutomation: ['newsletter'],
      automatedNewsletter: ['automated newsletter'],
      smsAutomation: ['sms'],
      fundraising: ['fundraising'],
      eventRegistration: ['event registration'],
      docs: ['docs & notes'],
      accountingTools: ['accounting', 'quickbooks'],
      taxReceipt: ['tax receipt'],
      communityGroups: ['community groups'],
      customForms: ['custom forms'],
      checkInSystem: ['check-in'],
      livestream: ['livestream'],
      sermonNotes: ['sermon notes'],
      automatedBlog: ['automated seo'],
      givingStatements: ['giving statements'],
      pledgeCampaigns: ['pledge'],
      textToGive: ['text-to-give'],
    };
    // Scoped to the FEATURE LIST, not the whole card: the card deliberately
    // says "giving and fundraising" in its no-donation-page line, as an
    // ABSENCE, and a whole-card scan would read that disclosure as the claim it
    // exists to deny.
    const bullets = FREE_TIER.features.join(' | ').toLowerCase();
    for (const [cell, phrases] of Object.entries(ABSENT_WORDS) as [keyof typeof FREE_MATRIX, string[]][]) {
      expect(Boolean(FREE_MATRIX[cell]), `${cell} is not false — this list is stale`).toBe(false);
      for (const phrase of phrases) {
        expect(bullets, `the free card lists "${phrase}" but free's \`${cell}\` is false`).not.toContain(phrase);
      }
    }
  });

  it('every rendered bullet is accounted for — no line escapes the audit', () => {
    // Without this, a bullet that is neither in LINE_SOURCE nor caught by a
    // phrase above is simply never examined. These four are the lines with no
    // plan cell behind them because they are on EVERY tier or are not plan
    // features at all.
    const UNGATED = ['Bible', 'Prayer Requests', 'Your own subdomain'];
    const audited = new Set([...Object.keys(LINE_SOURCE), ...UNGATED]);
    for (const line of FREE_TIER.features) {
      expect(audited.has(line), `"${line}" is on the free card but audited by nothing`).toBe(true);
    }
    expect(FREE_TIER.features).toHaveLength(audited.size);
  });
});

// ─── 10. 🔴 the three priced tiers' cards are unchanged ──────────────────────
describe("the three priced tiers' cards are unchanged", () => {
  /** Each priced card's feature list exactly as it stood at 9347999 — the
   *  commit this work branched from — transcribed, not read back. */
  const BEFORE: Record<string, string[]> = {
    plus: ['150 contacts · 2 admins', 'Mobile App (PWA)', 'Blog & News Feed', 'Bible', '2 courses',
      'CRM (Donors & Members)', 'SMS (bring your own Twilio)', 'Donation page & Fundraising'],
    pro: ['Everything in Individual', '500 contacts · 5 admins', '5 courses', 'Livestream + Live Giving',
      'Check-In System (QR)', 'Docs & Notes', 'Sermon Notes → Livestream', 'Church Map', 'Newsletter'],
    max: ['Everything in Small Team', '2,000 contacts · 15 admins', '15 courses', 'Custom Branding & Domain',
      'Community Groups & Events', 'Automated SEO Blog & Newsletter', 'Custom Forms → CRM',
      'Tax Receipts & Statements', 'Accounting + QuickBooks'],
  };

  for (const planId of ['plus', 'pro', 'max']) {
    it(`${planId}'s feature list is line-for-line what it was`, () => {
      const plan = plans.find((p) => p.planId === planId)!;
      expect(plan.features).toEqual(BEFORE[planId]);
    });
  }

  it('their prices, names and RECOMMENDED badge are untouched', () => {
    expect(plans.map((p) => [p.planId, p.name, p.price.monthly, p.price.quarterly, p.price.yearly])).toEqual([
      ['plus', 'Individual', 39, 99, 329],
      ['pro', 'Small Team', 79, 199, 659],
      ['max', 'Ministry', 159, 399, 1329],
    ]);
    expect(plans.filter((p) => p.popular).map((p) => p.name)).toEqual(['Ministry']);
  });

  it('the ladder still has four tiers with free first, and `plans` still has three', () => {
    expect(ALL_TIER_NAMES).toEqual(['Forever Free', 'Individual', 'Small Team', 'Ministry']);
    expect(plans).toHaveLength(3);
    expect(plans.map((p) => p.planId)).not.toContain('free');
  });

  it('🔴 the priced CARDS render with no line removed and none added', () => {
    // The data above is pinned; this is the rendered half, because a card is
    // only a claim once it is drawn.
    for (const planId of ['plus', 'pro', 'max']) {
      const text = cardFor(planId);
      for (const line of BEFORE[planId]) {
        expect(text, `${planId}'s card stopped rendering "${line}"`).toContain(line);
      }
    }
  });
});

// ─── 11. 🔴 the cross-repo price contract still throws, by mutation ──────────
describe('the cross-repo price contract still throws when the repos disagree', () => {
  it('passes for today’s data — this ticket did not disturb any price', () => {
    expect(() => planPriceContract(plans)).not.toThrow();
  });

  it('🔴 throws on a one-cent disagreement, naming the tier and the term', () => {
    // Built from `plans` itself and then drifted, so the mutation cannot go
    // stale when a price legitimately changes. A contract only ever run against
    // correct data is a contract nobody has checked has teeth.
    for (const p of plans) {
      for (const term of BILLING_TERMS) {
        const mutated = Object.fromEntries(
          plans.map((pl) => [pl.planId, { ...pl.price }]),
        ) as Record<string, Record<(typeof BILLING_TERMS)[number], number>>;
        mutated[p.planId][term] += 1;
        expect(
          () => planPriceContract(plans, mutated),
          `a wrong ${p.name} ${term} price did not stop the build`,
        ).toThrow(new RegExp(`${p.name}.*${term}`));
      }
    }
  });

  it('throws when a tier is missing from the app’s side entirely', () => {
    // The other direction: a tier the app stopped publishing must fail loudly
    // rather than silently skipping its nine-cell comparison.
    const partial = { plus: { ...plans[0].price } } as Record<
      string, Record<(typeof BILLING_TERMS)[number], number>
    >;
    expect(() => planPriceContract(plans, partial)).toThrow(/no expected prices/);
  });

  it('🔴 free is still absent from it, so no zero row can creep in', () => {
    // Free has no price and no billing term. Three zeros would make it look
    // term-billable to every discount and headline calculation that walks the
    // table, and would demand a matching zero row in the app's PLAN_PRICING —
    // which deliberately has none. THE-205 adds a free FEATURE cell, not a
    // price.
    expect(() => planPriceContract(plans)).not.toThrow();
    expect(plans.map((p) => p.planId)).not.toContain('free');
    expect(FREE_TIER).not.toHaveProperty('price');
  });
});
