import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CATEGORIES, CATEGORY_BY_SLUG, LEGACY_ANCHORS, type Feature } from './features';
import { CATALOG, CATALOG_TOOL_COUNT, slugify } from '../components/catalog';
import { itemHref } from '../components/Nav';
import { FEATURE_ICONS, FeatureMock } from '../components/FeatureMock';
import { FAQS, answerText } from './faq';
import { COMING_SOON_ITEMS } from './coming-soon';
import { CategoryPage } from '../pages/CategoryPage';
import { FaqPage } from '../pages/FaqPage';
import { plans } from '../components/Pricing';
import { STRIPE_GIVING_MARKETING_ENABLED } from '../lib/flags';

/**
 * THE-355 — the site's card-giving claims, with the switch OFF.
 *
 * ─── What this file is for ──────────────────────────────────────────────────
 *
 * The app's platform Stripe account is CLOSED (`rejected.fraud`, 2026-08-27),
 * so `Harvest-agent`'s `STRIPE_CONNECT_ENABLED` is false and
 * `/api/stripe/donate` refuses every request with 503. That route is the only
 * card path behind the Give page, `CampaignWidget`, `PublicCampaign` and
 * `PartnerWithUsTab`. Every sentence on this site that said a gift is a
 * destination charge into a church's own Stripe account described a request
 * that comes back 503 — the seventh instance of the one defect this repository
 * keeps having to correct, and the largest.
 *
 * 🔴 THE ASSERTIONS ARE ON RENDERED OUTPUT, not on the data behind it. A
 * withheld string that a component still prints from somewhere else is exactly
 * the failure a data-only test cannot see, and `the-250-sms-pricing-removed`
 * exists because that happened. So the two category pages that carry giving
 * copy and the FAQ are rendered and read as text.
 *
 * ⚠️ ITS SIBLING IS `the-355-stripe-strings-restored.test.ts`, which loads the
 * same modules with the flag ON and pins every Stripe string byte for byte.
 * Between them the switch is guarded in both directions: this file says the
 * claims are gone, that one says they come back unchanged.
 *
 * ⚠️ AND `src/content/legal.ts` IS OUT OF SCOPE HERE, deliberately. It carries
 * the same Stripe Connect statements in the Terms' §Giving, the privacy
 * sub-processor list and the refunds policy; withdrawing a term from a
 * published agreement is a founder decision, not a marketing one, and THE-355
 * enumerated the lines in its pull request instead of editing them. A test here
 * that demanded silence from the policies would be asserting a decision nobody
 * has taken.
 */

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const readSrc = (rel: string) => fs.readFileSync(path.join(ROOT, 'src', rel), 'utf8');

const render = (el: React.ReactElement) =>
  renderToStaticMarkup(
    React.createElement(HelmetProvider, {}, React.createElement(MemoryRouter, {}, el)),
  );

/** Rendered markup with tags stripped and entities folded, so an assertion reads
 *  what a visitor reads rather than what the DOM happens to look like. */
const words = (html: string) =>
  html.replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&nbsp;|\s+/g, ' ')
    .trim();

const pageText = (slug: string) =>
  words(render(React.createElement(CategoryPage, { slug })));

const giving = CATEGORY_BY_SLUG['giving-finance'];
const byId = (id: string): Feature => {
  const f = CATEGORIES.flatMap((c) => c.features).find((x) => x.id === id);
  expect(f, `no feature entry with id "${id}"`).toBeDefined();
  return f!;
};

/* ═══════════════════════════════════════════════════════════════════════════
   0 · the switch itself
   ═════════════════════════════════════════════════════════════════════════ */
describe('0 — one value, mirroring the app', () => {
  it('🔴 STRIPE_GIVING_MARKETING_ENABLED is false, and is a plain boolean', () => {
    expect(STRIPE_GIVING_MARKETING_ENABLED).toBe(false);
    expect(readSrc('lib/flags.ts'))
      .toMatch(/export const STRIPE_GIVING_MARKETING_ENABLED = (true|false);/);
  });

  it('🔴 its docblock names the app constant it mirrors and promises the restore', () => {
    /* The two repos cannot share code, so they share a NAME and a VALUE — the
       same arrangement SMS_MARKETING_ENABLED and CUSTOM_DOMAIN_MARKETING_ENABLED
       have. A flag whose docblock does not say what it mirrors is a flag nobody
       knows when to flip. */
    const flags = readSrc('lib/flags.ts');
    const block = flags.slice(flags.indexOf('THE-355'), flags.indexOf('export const STRIPE_GIVING_MARKETING_ENABLED'));
    expect(block, 'the docblock does not name the app flag it mirrors')
      .toContain('STRIPE_CONNECT_ENABLED');
    expect(block, 'the docblock does not promise a byte-for-byte restore')
      .toMatch(/BYTE-FOR-BYTE/i);
    // And it says where the Stripe strings went, rather than implying deletion.
    // (Wrapped across lines in the source, so whitespace is folded first.)
    expect(block.replace(/\s*\*?\s+/g, ' ')).toMatch(/Nothing is deleted to hide it/i);
  });

  it('🔴 nothing was deleted to hide it — every Stripe string is still in the tree', () => {
    /* The contract at the top of lib/flags.ts, checked rather than trusted. Each
       of these is the ON half of a ternary and must still be present in source
       even though nothing renders it today. */
    const features = readSrc('content/features.ts');
    for (const s of [
      "Give in three taps. Every dollar lands in your church",
      'Gifts are destination charges to your own Stripe',
      'Keep 100% of every gift, on every paid plan.',
      'Progress bar credited automatically as gifts land',
      'Ticketing where the money never touches us.',
      'The money never touches us',
      'Sermon notes synced to the stream; give in one tap',
    ]) {
      expect(features, `"${s}" was DELETED rather than withheld`).toContain(s);
    }
    expect(readSrc('content/faq.ts')).toContain('connected once through Stripe Connect');
    expect(readSrc('components/FeatureMock.tsx'))
      .toContain("Lands straight in your church's Stripe account — never ours.");
    // ⚠️ The apostrophe is BACKSLASH-ESCAPED in the source (a single-quoted TS
    // string), so the needle stops short of it rather than guessing the escape.
    expect(readSrc('content/coming-soon.ts')).toContain('own Stripe account — that ships today');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   1 · 🔴 THE WHOLE TICKET — no rendered page claims a card gift
   ═════════════════════════════════════════════════════════════════════════ */
describe('1 — nothing rendered says Stripe, a destination charge, or a card gift', () => {
  const PAGES: [string, string][] = [
    ['features/giving-finance', pageText('giving-finance')],
    ['features/community-engagement', pageText('community-engagement')],
    ['faq', words(render(React.createElement(FaqPage)))],
  ];

  it('the three pages really rendered, rather than failing quietly into an empty string', () => {
    /* A page that threw and was swallowed would satisfy every "does not contain"
       below. The floor is named per page so a shrinking page says so. */
    for (const [name, text] of PAGES) {
      expect(text.length, `${name} rendered almost nothing`).toBeGreaterThan(2000);
    }
    expect(PAGES[0][1]).toContain('Donation Page');
    expect(PAGES[1][1]).toContain('Event Registration');
    expect(PAGES[2][1]).toContain('platform fee');
  });

  it.each(PAGES)('%s names no payment processor of Harvest\'s', (_name, text) => {
    expect(text).not.toMatch(/stripe/i);
  });

  it.each(PAGES)('%s makes no destination-charge claim', (_name, text) => {
    expect(text).not.toMatch(/destination charge/i);
  });

  it.each(PAGES)('%s never says Harvest processes a card', (_name, text) => {
    /* 🔴 WORDED AS THE CLAIM, NOT AS A KEYWORD. "card" alone is too blunt — the
       FAQ legitimately says a subscription is charged to a card on file, and
       that is Harvest being PAID, not a congregation giving. What must not
       appear is a gift being taken by card inside Harvest. */
    expect(text, 'a gift is described as taken by card').not.toMatch(
      /(gift|give|giving|donation|tithe|ticket)[^.]{0,80}\b(by card|card payment|credit card|pay by card)/i,
    );
    expect(text).not.toMatch(/\bGive \$\d+ by card\b/);
    expect(text).not.toMatch(/card (?:gift|giving) (?:is|works)/i);
  });

  it('🔴 and the giving page positively says where a gift actually goes', () => {
    /* Silence is not the deliverable — a page that simply deleted its giving
       claims would pass every assertion above and tell a church nothing. All six
       providers the app supports are named, in a sentence a visitor reads. */
    const text = PAGES[0][1];
    for (const provider of ['PayPal', 'Cash App', 'Venmo', 'Zelle', 'Revolut', 'Wise']) {
      expect(text, `${provider} is supported by the app but unnamed on the page`).toContain(provider);
    }
    expect(text).toContain('Harvest is never in the flow');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   2 · the Donation Page entry, line by line, against the app
   ═════════════════════════════════════════════════════════════════════════ */
describe('2 — the Donation Page entry describes the church\'s own links', () => {
  const donation = byId('donation');

  it('🔴 the copy is the flag-off copy, not a half-applied edit', () => {
    expect(donation.title).toBe('Online giving for churches — without Harvest taking a cut');
    expect(donation.oneliner).toBe(
      'Publish your own PayPal, Cash App, Venmo, Zelle, Revolut and Wise links on one giving page. '
      + 'Harvest is never in the flow — no platform fee, nothing held.');
  });

  it('the eyebrow and the moment agree with the lines above them', () => {
    /* The failure this catches is a HALF-REWRITTEN entry: a title about payment
       links under an eyebrow still selling a processor. Both are checked for the
       claim rather than for wording, so an editorial pass may reword them. */
    for (const line of [donation.eyebrow, donation.moment]) {
      expect(line).not.toMatch(/stripe|card|destination/i);
    }
    expect(donation.moment).toMatch(/platform/i);
  });

  it('🔴 every bullet is a capability the app has today', () => {
    expect(donation.admin).toEqual([
      'Paste your own payment links — six providers',
      'Every link checked against its provider before it goes live',
      'Record a gift by hand and it posts to your dashboard, accounting and the giver’s history',
    ]);
    expect(donation.member).toEqual([
      'One page with every way to give',
      'No login, on any phone',
      'Taps straight into the app they already use',
    ]);
  });

  it('🔴 "six providers" is the number the app actually supports', () => {
    /* The one figure in the bullets, and the one that goes stale silently. The
       app's `GivingProviderId` union has six members (THE-246 / THE-249 /
       THE-254); this site's own list of them is the one-liner, so the two are
       compared to each other rather than to a literal typed twice. */
    const named = ['PayPal', 'Cash App', 'Venmo', 'Zelle', 'Revolut', 'Wise'];
    expect(named).toHaveLength(6);
    for (const p of named) expect(donation.oneliner).toContain(p);
    expect(donation.admin[0]).toContain('six providers');
  });

  it('🔴 the tier claim is "every paid plan", because free cannot publish a link', () => {
    /* `AdminDashboard.tsx` gates the Donations screen — the links editor with it
       — on `canDonations = planAllows(features?.fundraising) && canSettings`,
       and `fundraising` is false on Forever Free. So the array addresses the
       three PAID plans and free is absent from it entirely, which is what
       "every paid plan" means on this site. */
    expect(donation.tiers).toEqual([1, 1, 1]);
    expect(donation.tiers).toHaveLength(plans.length);
    expect(donation.title + donation.oneliner).not.toMatch(/free/i);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   3 · 🔴 the split — Pledge Campaigns is its own block, directly after
   ═════════════════════════════════════════════════════════════════════════ */
describe('3 — Pledge Campaigns is a feature entry of its own', () => {
  it('🔴 `pledges` renders DIRECTLY after `fundraising`, with nothing between', () => {
    const ids = giving.features.map((f) => f.id);
    expect(ids, 'the pledges block is not on the giving page').toContain('pledges');
    expect(ids.indexOf('pledges')).toBe(ids.indexOf('fundraising') + 1);
  });

  it('🔴 and it is in that order on the RENDERED page, not only in the array', () => {
    /* Array order is not page order until something renders it, and the section
       ids are what an anchor link resolves against. */
    const html = render(React.createElement(CategoryPage, { slug: 'giving-finance' }));
    const at = (id: string) => html.indexOf(`id="${id}"`);
    expect(at('fundraising'), '#fundraising does not render').toBeGreaterThan(-1);
    expect(at('pledges'), '#pledges does not render').toBeGreaterThan(-1);
    expect(at('pledges')).toBeGreaterThan(at('fundraising'));
    // Nothing else got in between them.
    const between = giving.features.filter((f) => {
      const p = at(`id="${f.id}"`) >= 0 ? at(f.id) : -1;
      return p > at('fundraising') && p < at('pledges');
    });
    expect(between).toHaveLength(0);
  });

  it('🔴 the fundraising block carries NO pledge line', () => {
    /* The defect the split exists to fix: pledge sentences under a [1, 1, 1]
       tier chip, with one bullet trying to correct the chips above it. */
    const f = byId('fundraising');
    const everything = [f.eyebrow, f.title, f.oneliner, f.moment, ...f.admin, ...f.member].join(' ');
    expect(everything, 'a pledge claim is still in the fundraising block')
      .not.toMatch(/pledge/i);
    expect(f.name).toBe('Fundraising Campaigns');
  });

  it('🔴 the pledges block\'s plan chip is MINISTRY ONLY', () => {
    /* The app's `pledgeCampaigns` cell is true on `max` alone, and
       `AdminFundraising.tsx` renders the "New campaign" type chooser behind
       `canPledge = platformOverride || !!features?.pledgeCampaigns`. Positional
       against `plans`: [Individual, Small Team, Ministry]. */
    const p = byId('pledges');
    expect(p.tiers).toEqual([0, 0, 1]);
    expect(p.tiers).toHaveLength(plans.length);
    expect(plans[2].name, 'the third plan is not Ministry — the array is positional')
      .toBe('Ministry');
    // And the chip is what renders: the page must not also say it in prose,
    // which is the duplication the split removed.
    expect([...p.admin, ...p.member].join(' ')).not.toMatch(/on Ministry/i);
  });

  it('its lines trace to the app, and none of them is a text message', () => {
    const p = byId('pledges');
    const all = [p.oneliner, p.moment, ...p.admin, ...p.member].join(' ');
    // `derivePledgeStatus`: fulfilled / lapsed / active, computed from amounts.
    for (const status of ['active', 'fulfilled', 'lapsed']) {
      expect(all, `the derived status "${status}" is not described`).toContain(status);
    }
    expect(all).toMatch(/pledged against paid/i);
    expect(all).toMatch(/no login/i);
    expect(all).toMatch(/New campaign/);
    /* 🔴 "OR A TEXT" IS GONE. Pledge reminders post to `/api/sms/broadcast`, and
       SMS is hidden on this site and off in the app. A site that calls SMS
       unbuilt cannot offer it as a way to pledge. */
    expect(all, 'a pledge by text is offered while SMS is hidden').not.toMatch(/\btext\b/i);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   4 · the new id is wired everywhere a feature id is registered
   ═════════════════════════════════════════════════════════════════════════ */
describe('4 — `pledges` is registered on every surface that keys off an id', () => {
  it('the ordinals run 1..n with no gap and no repeat', () => {
    /* `n` is renumbered after the hidden-feature filter, so this reads the
       EXPORTED catalogue rather than the raw one. */
    for (const c of CATEGORIES) {
      expect(c.features.map((f) => f.n)).toEqual(c.features.map((_, i) => String(i + 1)));
    }
  });

  it('🔴 the FeatureIndex grid draws one column per feature, and the giving page fits', () => {
    /* `gridTemplateColumns: repeat(${cat.features.length}, 1fr)` — so an entry
       added to the data becomes a column with no CSS change. The widths that
       matter are the breakpoints in index.css: ≤1080px forces 4 columns and
       ≤900px forces 3, so 901px renders FOUR and the phone renders THREE
       whatever this number is. Above 1080 the row is the derived count inside a
       1140px cap — and Community & Engagement already ships EIGHT there, so the
       giving page's count is not the widest case on the site. */
    const html = render(React.createElement(CategoryPage, { slug: 'giving-finance' }));
    const cols = /class="feat-index"[^>]*grid-template-columns:repeat\((\d+), 1fr\)/.exec(html);
    expect(cols, 'the jump-to index is not rendering its derived grid').not.toBeNull();
    expect(Number(cols![1])).toBe(giving.features.length);
    expect(html).toContain('Pledge Campaigns');
    const widest = Math.max(...CATEGORIES.map((c) => c.features.length));
    expect(giving.features.length,
      'the giving page is now the widest jump-to index on the site — recheck it at 1140px')
      .toBeLessThanOrEqual(widest);
    const css = fs.readFileSync(path.join(ROOT, 'src', 'index.css'), 'utf8');
    expect(css).toContain('.feat-index { grid-template-columns: repeat(4, 1fr) !important; }');
    expect(css).toContain('.feat-index { grid-template-columns: repeat(3, 1fr) !important; }');
  });

  it('🔴 the mega-menu has a row for it, in the Giving & Finance column', () => {
    /* THE-306's precedent: `sharegiving` shipped with a section and no menu row,
       and the founder found it — "this feature doesnt appear in the feature
       section in top header bar". A live block with no menu row is a defect. */
    const givingCol = CATALOG.find((g) => g.name === 'Giving & Finance')!;
    const row = givingCol.items.find((i) => i.title === 'Pledge Campaigns');
    expect(row, 'Pledge Campaigns is missing from the mega-menu').toBeDefined();
    expect(row!.soon, 'a live feature is badged as unbuilt').toBeFalsy();
    // And nowhere else — a feature listed twice is a menu contradicting itself.
    expect(CATALOG.flatMap((g) => g.items).filter((i) => i.title === 'Pledge Campaigns'))
      .toHaveLength(1);
  });

  it('🔴 that row LANDS on the section rather than silently on the fallback', () => {
    /* `featureHref` falls back to the FIRST category page for an unmapped slug,
       so a missing mapping does not fail — it quietly sends every visitor to
       Community & Engagement. The same trap THE-306 documented. */
    const row = CATALOG.find((g) => g.name === 'Giving & Finance')!
      .items.find((i) => i.title === 'Pledge Campaigns')!;
    expect(slugify(row.title)).toBe('pledge-campaigns');
    expect(LEGACY_ANCHORS['pledge-campaigns']).toBe('/features/giving-finance#pledges');
    expect(itemHref(row)).toBe('/features/giving-finance#pledges');
  });

  it('🔴 and the RENAMED fundraising row lands too, under both spellings', () => {
    /* The entry is "Fundraising Campaigns" now, which changes `slugify(title)`.
       `fundraising` is a retired slug — indexed, and the menu's old spelling —
       and both must resolve or one of them goes to the fallback. */
    expect(LEGACY_ANCHORS['fundraising']).toBe('/features/giving-finance#fundraising');
    expect(LEGACY_ANCHORS['fundraising-campaigns']).toBe('/features/giving-finance#fundraising');
    const row = CATALOG.find((g) => g.name === 'Giving & Finance')!
      .items.find((i) => i.title === 'Fundraising Campaigns')!;
    expect(itemHref(row)).toBe('/features/giving-finance#fundraising');
  });

  it('🔴 CATALOG_TOOL_COUNT moved 26 → 27, and is still derived', () => {
    /* THE-306's precedent again: the count is quoted to visitors as "N tools in
       one platform", and a live tool missing from it understates the product.
       The ABSOLUTE is asserted alongside the DELTA so a second tool added in the
       same commit cannot hide inside this one's expected move. */
    expect(CATALOG_TOOL_COUNT).toBe(27);
    const without = CATALOG.reduce(
      (n, g) => n + g.items.filter((it) => !it.soon && it.title !== 'Pledge Campaigns').length, 0);
    expect(without).toBe(26);
    expect(CATALOG_TOOL_COUNT - without).toBe(1);
    expect(readSrc('components/catalog.ts'), 'the tool count was hardcoded')
      .not.toMatch(/CATALOG_TOOL_COUNT\s*=\s*\d+/);
  });

  it('🔴 it has a vignette and an icon, so the block is not a titled grey box', () => {
    /* THE-306 exists because `sharegiving` shipped with neither: `FeatureBlock`
       drew its frame around an empty panel and the badge beside its eyebrow was
       an empty coloured square. The founder, on the live page: "is horrible." */
    const html = renderToStaticMarkup(React.createElement(FeatureMock, { id: 'pledges' }));
    expect(html, 'FeatureMock has no entry for pledges — the placeholder is back').not.toBe('');
    expect(html.length, 'the pledges vignette is a stub').toBeGreaterThan(400);
    expect(FEATURE_ICONS['pledges'], 'pledges has no icon').toBeDefined();
    // And neither is a copy of its neighbour's — two adjacent sections drawing
    // the same picture is the defect THE-293 and THE-306 were both opened for.
    expect(html).not.toBe(renderToStaticMarkup(React.createElement(FeatureMock, { id: 'fundraising' })));
    expect(renderToStaticMarkup(FEATURE_ICONS['pledges']))
      .not.toBe(renderToStaticMarkup(FEATURE_ICONS['fundraising']));
  });

  it('🔴 the vignette\'s three rows each satisfy `derivePledgeStatus`', () => {
    /* A row whose figures contradict its chip is a picture of a bug. The app:
       fulfilled when paid ≥ pledged; lapsed when a due date has passed with
       paid < pledged; active otherwise. */
    const html = renderToStaticMarkup(React.createElement(FeatureMock, { id: 'pledges' }));
    expect(html).toContain('$2,000 of $2,000');   // paid ≥ pledged → fulfilled
    expect(html).toContain('fulfilled');
    expect(html).toContain('$600 of $1,500');     // short, no due date shown → active
    expect(html).toContain('active');
    expect(html).toMatch(/\$250 of \$1,000 · due/); // short, past due → lapsed
    expect(html).toContain('lapsed');
  });

  it('the #replaces section lists it, which its own coverage guard requires', () => {
    /* THE-257's guard throws at the prerender for a VISIBLE feature absent from
       that table, so this is belt and braces — but it is the assertion that says
       the row was added deliberately rather than to silence a throw. */
    const replaces = readSrc('components/Replaces.tsx');
    expect(replaces).toMatch(/'donation', 'fundraising', 'pledges', 'crm', 'accounting'/);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   5 · the Events entry
   ═════════════════════════════════════════════════════════════════════════ */
describe('5 — Event Registration sells registration, not a payment rail', () => {
  const events = byId('events');

  it('the eyebrow, title, one-liner and moment name no processor', () => {
    for (const line of [events.eyebrow, events.title, events.oneliner, events.moment]) {
      expect(line).not.toMatch(/stripe|destination charge/i);
    }
  });

  it('🔴 the paid-ticket-only line is gone, and the waitlist line took its place', () => {
    /* A discount code reduces `ticketType.price`; on a free ticket there is
       nothing to reduce, so the only codes that do anything are on tickets that
       cannot currently be sold. The waitlist is on the same bullet and is live:
       `/api/event-registration/submit` waitlists a whole party together. */
    expect(events.admin.join(' ')).not.toMatch(/discount/i);
    expect(events.admin.join(' ')).toMatch(/waitlist/i);
  });

  it('every surviving line is something free or waitlisted registration does', () => {
    const all = [events.oneliner, events.moment, ...events.admin, ...events.member].join(' ');
    expect(all).toMatch(/QR/);                 // qrcode.toDataURL on the confirmation
    expect(all).toMatch(/confirmation email/i);
    expect(all).toMatch(/no account/i);        // the public event page takes none
    expect(all).toMatch(/capacity/i);          // per-ticket-type capacity
  });

  it('🔴 the QR line says "once confirmed", because a waitlisted seat gets none', () => {
    /* The route emits the QR only for a seat that is not waitlisted. A bullet
       promising every registrant a scannable code would be false for exactly the
       people the waitlist exists for. */
    expect(events.member.join(' ')).toMatch(/scannable QR once confirmed/);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   6 · the rest of the sweep
   ═════════════════════════════════════════════════════════════════════════ */
describe('6 — every other surface that named the rail', () => {
  it('the giving FAQ answer keeps the 0% claim and drops the processor', () => {
    const fee = FAQS.find((f) => f.id === 'donation-fee')!;
    const text = answerText(fee);
    expect(text).toMatch(/0% platform fee/i);
    expect(text).not.toMatch(/stripe/i);
    expect(text).toMatch(/nothing for us to hold, forward, or take a share of/);
    // And it says what a recorded gift reaches, which is the half a bare
    // withdrawal would have left a treasurer to guess at.
    expect(text).toMatch(/giving statement/i);
  });

  it('the Affiliate coming-soon entry still separates a share from a gift', () => {
    const affiliate = COMING_SOON_ITEMS.find((i) => i.id === 'affiliate')!;
    expect(affiliate.notThis).not.toMatch(/stripe/i);
    expect(affiliate.notThis).toMatch(/never passes through Harvest at all/);
    // The rule THE-252 set: no processor is named against the UNBUILT programme.
    expect([affiliate.name, affiliate.eyebrow, affiliate.title, affiliate.oneliner].join(' '))
      .not.toMatch(/\b(stripe|dodo|paypal|wise)\b/i);
  });

  it('the livestream no longer says a member gives in one tap', () => {
    const l = byId('livestream');
    expect(l.member.join(' ')).not.toMatch(/give in one tap/);
    expect(l.member.join(' ')).toMatch(/giving page one tap away/);
  });

  it('the CRM no longer says a gift creates or types a contact', () => {
    /* `lib/donation-webhook.ts` is what created a missing contact and re-typed
       an existing one to donor / both, and it fires on a Stripe event. A gift
       recorded by hand increments `totalDonated` but `AdminCRM.tsx` writes
       `type: selected.type ?? 'member'` — it preserves the type on purpose. */
    const crm = byId('crm');
    expect(crm.oneliner).not.toMatch(/^Give,/);
    expect(crm.admin.join(' ')).not.toMatch(/auto-typed/i);
    // The pipeline and the running total ARE still claimed — the manual path
    // moves `totalDonated`, and `resolvePipelineStage` derives the stage from it.
    expect(crm.admin.join(' ')).toMatch(/discipleship pipeline/i);
    expect(crm.member.join(' ')).toMatch(/Total given & last gift always current/);
  });

  it('accounting says where the receipt IS, not when it lands', () => {
    expect(byId('accounting').member[0]).toBe('A numbered PDF receipt for every gift in the ledger');
  });

  it('🔴 the first-run-wizard bullet lost Stripe UNCONDITIONALLY, not behind the flag', () => {
    /* `components/PostPurchaseWizard.tsx` has four steps — Connect Instagram,
       Connect Mailchimp, Custom Domain and Brand Your App — and no payment step
       in any plan's sequence. That was true before the platform account closed
       and will still be true after it reopens, so putting it behind the flag
       would schedule a false claim to come back. */
    const dashboard = byId('dashboard');
    expect(dashboard.member).toContain('A first-run wizard for branding & integrations');
    expect(readSrc('content/features.ts'))
      .not.toContain('A first-run wizard for Stripe, branding & integrations');
  });

  it('🔴 the blog post was REWRITTEN, because markdown cannot read a flag', () => {
    /* The one change in this ticket that has to be undone by hand if the switch
       is flipped back — recorded here and in the pull request rather than left
       for whoever flips it to discover. */
    const post = fs.readFileSync(
      path.join(ROOT, 'src/content/posts/year-end-giving-statements-what-to-include.md'), 'utf8');
    expect(post).not.toMatch(/stripe/i);
    expect(post).not.toContain('a receipt, a CRM record and campaign credit');
    // Grounded in lib/manual-donation.ts, which is what makes it true today.
    expect(post).toMatch(/a gift recorded in the CRM writes an invoice/);
    expect(post).toMatch(/year-end statement/);
  });

  it('🔴 content/legal.ts is BYTE-IDENTICAL — the policies are a founder decision', () => {
    /* It carries the same Stripe Connect statements and THE-355 changed none of
       them. Asserted rather than assumed, because "I did not touch that file" is
       exactly the claim a diff quietly contradicts. */
    const legal = readSrc('content/legal.ts');
    expect(legal, 'legal.ts was gated on this flag')
      .not.toContain('STRIPE_GIVING_MARKETING_ENABLED');
    // And the statements really are still there, so the pull request's list of
    // false lines is a list of lines that exist.
    expect(legal).toContain('your ministry connects its own Stripe account through Stripe Connect');
    expect(legal).toContain('Giving runs through your own Stripe account, as described above.');
  });
});
