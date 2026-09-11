import { afterEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Category, Feature } from './features';

/**
 * THE-355 — the RESTORE path, guarded.
 *
 * ─── Why a second file exists ───────────────────────────────────────────────
 *
 * `the-355-stripe-giving-hidden.test.ts` asserts the claims are gone. On its own
 * that is half a switch: a flag is only reversible if the thing behind it is
 * still there and still correct, and "still correct" is precisely what nobody
 * checks until the day it is needed. `lib/flags.test.ts` was written for that
 * reason — "`true` was never checked at all, so a surface could rot behind the
 * flag" — and this is that argument applied to the largest set of strings any
 * flag on this site has ever held.
 *
 * 🔴 THE PROMISE BEING GUARDED IS BYTE-FOR-BYTE, which is stronger than "the
 * page still renders". The docblock on `STRIPE_GIVING_MARKETING_ENABLED` says
 * flipping it to `true` restores every Stripe string unchanged; so every one of
 * them is pinned here as a literal, and an editorial pass over the withheld
 * half fails this file rather than shipping a silently reworded restore.
 *
 * ⚠️ THE MODULES ARE RE-IMPORTED WITH THE FLAG FORCED ON, the same way
 * lib/flags.test.ts does it: `vi.resetModules()` is what makes the second load
 * re-run module scope, and `vi.doMock` REPLACES the flags module rather than
 * merging into it — so every flag this site exports has to appear in `ON` below
 * or its importers throw. That is a trap, and it is why the list is typed.
 *
 * 🔴 EVERY OTHER FLAG IS HELD AT ITS SHIPPED VALUE, not turned on with this one.
 * Turning all seven on would be a different site, and a failure here would not
 * say which switch caused it. The one variable is the one under test.
 */

type Flags = {
  AFFILIATE_PROGRAM_ENABLED: boolean;
  MULTI_CAMPUS_ENABLED: boolean;
  SMS_MARKETING_ENABLED: boolean;
  NEWSLETTER_MARKETING_ENABLED: boolean;
  QUICKBOOKS_MARKETING_ENABLED: boolean;
  CUSTOM_DOMAIN_MARKETING_ENABLED: boolean;
  STRIPE_GIVING_MARKETING_ENABLED: boolean;
};

/** Every flag false — the shipped state — with this one switch flipped. */
const ON: Flags = {
  AFFILIATE_PROGRAM_ENABLED: false,
  MULTI_CAMPUS_ENABLED: false,
  SMS_MARKETING_ENABLED: false,
  NEWSLETTER_MARKETING_ENABLED: false,
  QUICKBOOKS_MARKETING_ENABLED: false,
  CUSTOM_DOMAIN_MARKETING_ENABLED: false,
  STRIPE_GIVING_MARKETING_ENABLED: true,
};
const OFF: Flags = { ...ON, STRIPE_GIVING_MARKETING_ENABLED: false };

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

async function surfacesWith(flags: Flags) {
  vi.resetModules();
  vi.doMock('../lib/flags', () => flags);
  const { CATEGORIES } = await import('./features');
  const { FAQS, answerText } = await import('./faq');
  const { COMING_SOON_ITEMS } = await import('./coming-soon');
  const { FeatureMock } = await import('../components/FeatureMock');
  const cats = CATEGORIES as Category[];
  const features = new Map<string, Feature>(
    cats.flatMap((c) => c.features.map((f) => [f.id, f] as const)),
  );
  return {
    cats,
    feature: (id: string) => {
      const f = features.get(id);
      expect(f, `no feature entry with id "${id}"`).toBeDefined();
      return f!;
    },
    givingIntro: cats.find((c) => c.slug === 'giving-finance')!.intro,
    givingSeo: cats.find((c) => c.slug === 'giving-finance')!.seo,
    feeAnswer: answerText(FAQS.find((f) => f.id === 'donation-fee')!),
    affiliateNotThis: COMING_SOON_ITEMS.find((i) => i.id === 'affiliate')!.notThis!,
    mock: (id: string) => renderToStaticMarkup(React.createElement(FeatureMock, { id })),
  };
}

afterEach(() => { vi.doUnmock('../lib/flags'); vi.resetModules(); });

/* ═══════════════════════════════════════════════════════════════════════════
   1 · 🔴 every withheld string comes back, character for character
   ═════════════════════════════════════════════════════════════════════════ */
describe('1 — the Stripe strings are restored byte for byte', () => {
  it('the Donation Page entry is exactly what it was', async () => {
    const s = await surfacesWith(ON);
    const d = s.feature('donation');
    expect(d.eyebrow).toBe('You keep more');
    expect(d.title).toBe('Keep 100% of every gift, on every paid plan.');
    expect(d.oneliner).toBe(
      'Give in three taps. Every dollar lands in your church\'s own Stripe account — '
      + 'Harvest takes 0% of every donation on every paid plan, and never holds your money.');
    expect(d.moment).toBe(
      'Most platforms take 2–5% of every gift, forever, with no way down. Harvest takes zero — '
      + 'on the cheapest paid plan and every plan above it. On a church doing $200k a year online, '
      + 'a 5% platform quietly takes $10,000. Harvest takes none of it; you pay us a flat '
      + 'subscription and nothing else.');
    expect(d.admin).toEqual([
      'Gifts are destination charges to your own Stripe',
      'Fail-closed — no Stripe connected, no gift routed elsewhere',
      'A gift writes a receipt, a CRM record & campaign credit',
      'Stripe\'s own processing fees are Stripe\'s, not ours',
    ]);
    expect(d.member).toEqual([
      'Preset amounts or your own, in three taps',
      'No login — give to any church, even as a visitor',
      'An emailed PDF receipt, instantly',
      'Your full giving history, receipts included',
    ]);
  });

  it('the Event Registration entry is exactly what it was', async () => {
    const s = await surfacesWith(ON);
    const e = s.feature('events');
    expect(e.eyebrow).toBe('The money never touches us');
    expect(e.title).toBe('Ticketing where the money never touches us.');
    expect(e.oneliner).toBe(
      'Ticket types, waitlists, discount codes and QR check-in — with payment going straight '
      + 'to your own Stripe account.');
    expect(e.moment).toBe(
      'Paid tickets are a destination charge straight to the ministry\'s own Stripe account. '
      + 'The money never touches our platform. That is a trust argument worth its own paragraph.');
    expect(e.admin).toContain('Discount codes, per-event waitlist, group booking');
  });

  it('the fundraising, CRM, livestream and accounting lines are exactly what they were', async () => {
    const s = await surfacesWith(ON);
    expect(s.feature('fundraising').admin)
      .toContain('Progress bar credited automatically as gifts land');
    expect(s.feature('crm').oneliner).toBe(
      'Give, register, check in or fill a form and a contact appears with the history attached. '
      + 'One person, one row — deduplicated by email, typed Donor & Member as they give. '
      + 'Connect Gmail and email them without leaving the dashboard.');
    expect(s.feature('crm').admin).toContain('Auto-typed member / donor / both as they give');
    expect(s.feature('livestream').member)
      .toContain('Sermon notes synced to the stream; give in one tap');
    expect(s.feature('accounting').member[0]).toBe('Every gift arrives with a numbered PDF receipt');
  });

  it('the category intro, the SEO line, the FAQ answer and the affiliate note are exact', async () => {
    const s = await surfacesWith(ON);
    expect(s.givingIntro).toBe(
      'Giving, fundraising, a CRM that builds itself, and books that reconcile themselves — '
      + 'with no platform fee at all, on any plan. The money lands in your account, not ours.');
    expect(s.givingSeo).toBe(
      'Branded giving, fundraising and pledge campaigns, a donor and member CRM and numbered PDF '
      + 'receipts — with 0% platform fee on every donation.');
    expect(s.feeAnswer).toContain(
      'Giving runs through your ministry\'s own Stripe account, connected once through Stripe Connect.');
    expect(s.feeAnswer).toContain(
      'Stripe\'s own processing fees are a matter between your ministry and Stripe, under your '
      + 'agreement with them. What you pay Harvest is the subscription, and nothing else.');
    expect(s.affiliateNotThis).toContain(
      'every gift lands in your church\'s own Stripe account — that ships today and is unchanged');
  });

  it('the two vignettes come back too — a picture is a claim', async () => {
    const s = await surfacesWith(ON);
    const donation = s.mock('donation');
    expect(donation).toContain('Lands straight in your church&#x27;s Stripe account — never ours.');
    expect(donation).toContain('Give $50');
    expect(donation).toContain('$50.00');
    const share = s.mock('sharegiving');
    expect(share).toContain('Give $60 by card');
    expect(share).toContain('Or give directly');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   2 · what the switch must NOT restore
   ═════════════════════════════════════════════════════════════════════════ */
describe('2 — the flip restores the Stripe half and nothing else', () => {
  it('🔴 the pledge split SURVIVES the flip, in both directions', async () => {
    /* The split is not behind this flag and must never be: a pledge is a
       commitment recorded by hand and tracked against what is paid, and no part
       of it ever went through `/api/stripe/donate`. Tying it to this switch
       would make a live, Ministry-only capability vanish the day a card rail
       came back — the inverse of the defect this ticket exists to fix. */
    for (const flags of [ON, OFF]) {
      const s = await surfacesWith(flags);
      const ids = s.cats.find((c) => c.slug === 'giving-finance')!.features.map((f) => f.id);
      expect(ids, 'the pledges block is gated on the Stripe flag').toContain('pledges');
      expect(ids.indexOf('pledges')).toBe(ids.indexOf('fundraising') + 1);
      expect(s.feature('pledges').tiers).toEqual([0, 0, 1]);
      expect(s.feature('fundraising').name).toBe('Fundraising Campaigns');
      const f = s.feature('fundraising');
      expect([f.title, f.oneliner, f.moment, ...f.admin, ...f.member].join(' '))
        .not.toMatch(/pledge/i);
    }
  });

  it('🔴 the mega-menu row and the tool count do not move with the flag', async () => {
    /* Pledge Campaigns is a tool in both states, so CATALOG_TOOL_COUNT is the
       same either way — which is what says the figure moved because a feature
       was split out, not because a switch was thrown. */
    for (const flags of [ON, OFF]) {
      vi.resetModules();
      vi.doMock('../lib/flags', () => flags);
      const { CATALOG_TOOL_COUNT, CATALOG } = await import('../components/catalog');
      expect(CATALOG_TOOL_COUNT).toBe(27);
      expect(CATALOG.flatMap((g) => g.items).map((i) => i.title))
        .toContain('Pledge Campaigns');
      vi.doUnmock('../lib/flags');
    }
  });

  it('🔴 the first-run-wizard bullet stays Stripe-free in BOTH states', async () => {
    /* `components/PostPurchaseWizard.tsx` has no payment step in any plan's
       sequence — Connect Instagram, Connect Mailchimp, Custom Domain, Brand Your
       App. That was true before the platform account closed and will be true
       after it reopens, so this correction is unconditional and the flip must
       not schedule it to come back. */
    for (const flags of [ON, OFF]) {
      const s = await surfacesWith(flags);
      expect(s.feature('dashboard').member.join(' ')).not.toMatch(/wizard for Stripe/);
    }
  });

  it('🔴 the blog post stays rewritten, because markdown reads no flag', async () => {
    /* The one surface the switch cannot reach. Recorded here so that whoever
       flips the flag back finds the exception named in a test rather than in a
       pull request nobody re-reads. */
    const post = fs.readFileSync(
      path.join(ROOT, 'src/content/posts/year-end-giving-statements-what-to-include.md'), 'utf8');
    expect(post).not.toMatch(/stripe/i);
    expect(fs.readFileSync(path.join(ROOT, 'src/lib/flags.ts'), 'utf8'))
      .not.toMatch(/posts\//);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   3 · and the OFF half is genuinely the other branch, not the same strings
   ═════════════════════════════════════════════════════════════════════════ */
describe('3 — the two states really differ', () => {
  it('every gated line changes when the switch moves', async () => {
    /* The failure this catches is a ternary whose two branches are identical —
       a "gate" that gates nothing, which every assertion in section 1 would
       still pass. */
    const on = await surfacesWith(ON);
    const off = await surfacesWith(OFF);
    const differs = (a: string, b: string, what: string) =>
      expect(a, `${what} is the same in both flag states`).not.toBe(b);

    for (const [id, key] of [
      ['donation', 'eyebrow'], ['donation', 'title'], ['donation', 'oneliner'], ['donation', 'moment'],
      ['events', 'eyebrow'], ['events', 'title'], ['events', 'oneliner'], ['events', 'moment'],
      ['fundraising', 'oneliner'], ['fundraising', 'moment'],
      ['crm', 'oneliner'],
    ] as const) {
      differs(String(on.feature(id)[key]), String(off.feature(id)[key]), `${id}.${key}`);
    }
    /* ⚠️ `livestream` AND `accounting` GATE A MEMBER BULLET ONLY — their admin
       arrays claim nothing about money and were not touched. Listing them here
       would assert a change this ticket deliberately did not make. */
    for (const id of ['donation', 'events', 'fundraising', 'crm']) {
      differs(on.feature(id).admin.join('|'), off.feature(id).admin.join('|'), `${id}.admin`);
      /* ⚠️ `events.member` IS DELIBERATELY ABSENT FROM THIS LIST. Two of its
         bullets were corrected UNCONDITIONALLY rather than gated — "Register at
         a public event page" gained "— no account", and the QR bullet gained
         "once confirmed" because `/api/event-registration/submit` emits no QR
         for a waitlisted seat. Both are true whatever the switch says, so
         gating them would schedule an inaccuracy to come back. Its `admin`
         array IS gated, on the discount-code bullet, and is checked above. */
      if (id === 'donation') {
        differs(on.feature(id).member.join('|'), off.feature(id).member.join('|'), `${id}.member`);
      }
    }
    for (const id of ['livestream', 'accounting']) {
      differs(on.feature(id).member.join('|'), off.feature(id).member.join('|'), `${id}.member`);
    }
    differs(on.givingIntro, off.givingIntro, 'the giving-finance intro');
    differs(on.givingSeo, off.givingSeo, 'the giving-finance SEO line');
    differs(on.feeAnswer, off.feeAnswer, 'the donation-fee FAQ answer');
    differs(on.affiliateNotThis, off.affiliateNotThis, 'the affiliate notThis');
    differs(on.mock('donation'), off.mock('donation'), 'the donation vignette');
    differs(on.mock('sharegiving'), off.mock('sharegiving'), 'the sharegiving vignette');
  });

  it('🔴 and with the switch ON, nothing is left describing the withdrawn state', async () => {
    /* The inverse of the hidden suite's sweep: a restore that left half the
       replacement copy in place would read as two answers to the same question.
       The giving entry's own copy is checked, since that is where both sets of
       sentences live. */
    const on = await surfacesWith(ON);
    const d = on.feature('donation');
    const all = [d.eyebrow, d.title, d.oneliner, d.moment, ...d.admin, ...d.member].join(' ');
    expect(all).not.toContain('Harvest is never in the flow');
    expect(all).not.toContain('six providers');
  });
});
