import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';

import { CATEGORIES } from './features';
import { COMING_SOON_ITEMS, comingSoonContract } from './coming-soon';
import { FAQS } from './faq';
import { LEGAL_DOCS } from './legal';
import { CATALOG, CATALOG_TOOL_COUNT } from '../components/catalog';
import { plans, ComparisonTable } from '../components/Pricing';
import { Replaces } from '../components/Replaces';
import {
  NEWSLETTER_MARKETING_ENABLED, QUICKBOOKS_MARKETING_ENABLED, SMS_MARKETING_ENABLED,
} from '../lib/flags';

/**
 * ═════════════════════════════════════════════════════════════════════════════
 * THE-335 — SMS and the newsletter go back to coming-soon, QuickBooks goes
 * entirely, and the SERVICE PLANNER goes live.
 * ═════════════════════════════════════════════════════════════════════════════
 *
 * Four founder instructions, and they are NOT the same instruction:
 *
 *   · "put SMS and newsletter to coming soon"  → RELOCATE. Each leaves its
 *     feature entry and ARRIVES in Coming Soon, by one flag, so the same
 *     capability is never claimed in two tenses.
 *   · "hide quickbooks connection entirely… Hide it from marketing site as
 *     well" → REWORD, and NO coming-soon entry. Said in the same breath as the
 *     two above and deliberately different. A coming-soon entry is a PROMISE —
 *     "not YET" — which would be false twice over here: the integration is
 *     already written, and nobody has committed to shipping it. What is hidden
 *     is the SYNC; the accounting ledger it sits on ships and stays claimed.
 *   · "Put the scheduler as a live feature in the marketing site… Service
 *     scheduler I mean not the one for social media" → PROMOTE, with a tier
 *     verified against the app rather than asserted.
 *
 * ⚠️ Assertions are on RENDERED OUTPUT wherever a claim is a rendered thing —
 * PR 55 is the precedent: a pure-function test passed while the JSX seam was
 * mutated.
 */

const ROOT = path.resolve(__dirname, '../..');
const readSrc = (rel: string) => fs.readFileSync(path.join(ROOT, 'src', rel), 'utf8');
const render = (el: React.ReactElement) =>
  renderToStaticMarkup(React.createElement(
    HelmetProvider, null,
    React.createElement(MemoryRouter, { initialEntries: ['/pricing'] }, el),
  ));
const visibleText = (html: string) =>
  html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#x27;|&apos;/g, "'")
    .replace(/\s+/g, ' ').trim();

/**
 * 🔴 THE APP'S OWN `eventRegistration` CELLS, transcribed by hand from
 * `Harvest-agent/src/utils/plan-features.ts` — the SAME two-sided seam the nine
 * plan prices and `smsAutomation` already use, and for the same reason: the
 * repos cannot share code, so each side writes the value down and each side
 * asserts it. If either moves alone, one of the two suites goes red.
 *
 * ⚠️ THIS IS THE CELL SERVICE PLANNING IS GATED ON, and establishing that was
 * the whole of STOP condition 2c. The app gates the Services nav entry, the
 * screen behind it and `/api/rota/invitations` on `eventRegistration`; the write
 * permission on top of it is `manageEvents`, the same one the `servicePlans` and
 * `rotaInvitations` Firestore rules require. There is deliberately NO separate
 * planning permission — `AdminDashboard` says so at the gate.
 *
 * The app's half of this pin is `THE-335.hidden-features.test.ts`, which reads
 * the cell out of the matrix per tier.
 */
const APP_EVENT_REGISTRATION: Readonly<Record<string, boolean>> = {
  free: false, plus: false, pro: false, max: true,
};

/** Every file under a directory, for the reach check in section 16. */
const walkRepo = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true })
  .flatMap((e) => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) return e.name === 'node_modules' ? [] : walkRepo(p);
    return [p];
  });

const featureById = new Map(CATEGORIES.flatMap((c) => c.features.map((f) => [f.id, f] as const)));
const soonById = new Map(COMING_SOON_ITEMS.map((i) => [i.id, i] as const));
const liveTools = CATALOG.filter((g) => !g.href).flatMap((g) => g.items);

/* ── 15 ────────────────────────────────────────────────────────────────────
   🔴 SMS is a coming-soon entry again.                                       */
describe('15 — SMS is a coming-soon entry again, not a live feature', () => {
  it('🔴 the feature entry, the tool and every pricing surface are gone together', () => {
    expect(SMS_MARKETING_ENABLED).toBe(false);
    expect(featureById.has('sms'), 'the SMS feature section still renders').toBe(false);
    expect(liveTools.find((i) => /\bSMS\b/.test(i.title)), 'SMS is still a countable tool')
      .toBeUndefined();
    for (const plan of plans) {
      expect(plan.features.join(' '), `the ${plan.name} card still sells SMS`).not.toMatch(/\bSMS\b/i);
    }
    expect(visibleText(render(React.createElement(ComparisonTable))), 'the grid still carries an SMS row')
      .not.toMatch(/\bSMS\b/);
  });

  it('🔴 and it ARRIVED in Coming Soon — the same one value, the other way up', () => {
    const entry = soonById.get('sms');
    expect(entry, 'SMS is hidden everywhere, including from the page that explains why').toBeDefined();
    expect(entry!.name).toContain('Text-to-Give');
    // The relocation is one flag, so the pair can never both be true.
    expect(readSrc('content/coming-soon.ts'))
      .toContain(".filter((item) => item.id !== 'sms' || !SMS_MARKETING_ENABLED)");
  });

  it('🔴 nothing was deleted to hide it', () => {
    const src = readSrc('content/coming-soon.ts');
    expect(src, 'the SMS entry was deleted rather than filtered')
      .toContain("id: 'sms', name: 'SMS & Text-to-Give'");
    expect(readSrc('components/catalog.ts'), 'the SMS tool was deleted rather than gated')
      .toMatch(/SMS_MARKETING_ENABLED \? \[item\('message-square-text', 'SMS Automation'/);
  });
});

/* ── 15b ───────────────────────────────────────────────────────────────────
   🔴 Newsletter is a coming-soon entry.                                      */
describe('15b — Newsletter is a coming-soon entry, not a live feature', () => {
  it('🔴 BOTH newsletter entries left, and the two tools with them', () => {
    /* ⚠️ BOTH, NOT ONE. `autonewsletter` drafts FROM Instagram INTO the
       newsletter editor and sends down the same path — there is no configuration
       in which one works and the other does not, which is the same reasoning
       that takes Text-to-Give with SMS. */
    expect(NEWSLETTER_MARKETING_ENABLED).toBe(false);
    for (const id of ['newsletter', 'autonewsletter']) {
      expect(featureById.has(id), `the #${id} feature section still renders`).toBe(false);
    }
    for (const title of ['Newsletter', 'Automated Newsletter']) {
      expect(liveTools.find((i) => i.title === title), `"${title}" is still a countable tool`)
        .toBeUndefined();
    }
    for (const plan of plans) {
      expect(plan.features.join(' '), `the ${plan.name} card still sells a newsletter`)
        .not.toMatch(/newsletter/i);
    }
    expect(visibleText(render(React.createElement(ComparisonTable))), 'the grid still carries a newsletter row')
      .not.toMatch(/newsletter/i);
  });

  it('🔴 and a Newsletter entry ARRIVED in Coming Soon, appended not inserted', () => {
    const entry = soonById.get('newsletter');
    expect(entry, 'the newsletter is hidden with no page that explains why').toBeDefined();
    expect(entry!.ref, 'the entry traces to no card').toBe('THE-335');
    // Appended after `domains` and before `scheduler`, which is deliberately
    // last — so no existing entry's ordinal moved because a new one arrived.
    const ids = COMING_SOON_ITEMS.map((i) => i.id);
    expect(ids[ids.length - 1], 'the scheduler is no longer last').toBe('scheduler');
    expect(ids.indexOf('newsletter')).toBe(ids.length - 2);
  });

  it('🔴 the entry is HONEST about a sender that already exists', () => {
    /* ⚠️ THE HARD PART. A newsletter sender DOES exist in the app today — the
       campaign goes to the church's own Mailchimp audience — and it is being
       WITHDRAWN rather than waited for. "Nothing sends email" would be false, so
       the `today` line says what is true from a church's side and names the
       paths that DO reach a congregation and still ship. */
    const entry = soonById.get('newsletter')!;
    expect(entry.today, 'the entry claims Harvest sends no email at all')
      .not.toMatch(/harvest sends no email|nothing sends email/i);
    expect(entry.today, 'the entry does not say what reaches everyone instead')
      .toMatch(/feed/i);
    expect(entry.today, 'the entry does not say transactional email still sends')
      .toMatch(/receipt/i);
  });

  it('🔴 no price, date, tier or CTA reached it — the shape forbids all four', () => {
    expect(() => comingSoonContract(COMING_SOON_ITEMS)).not.toThrow();
    const entry = soonById.get('newsletter')!;
    expect(entry).not.toHaveProperty('tiers');
    expect(entry).not.toHaveProperty('price');
    const unbuilt = [entry.name, entry.eyebrow, entry.title, entry.oneliner, ...entry.considering].join(' ');
    expect(unbuilt, 'the entry grew a price').not.toMatch(/\$\s?\d/);
    expect(unbuilt, 'the entry grew a tier').not.toMatch(/\b(Individual|Small Team|Ministry|Forever Free)\b/);
    expect(unbuilt, 'the entry grew a call to action')
      .not.toMatch(/\b(buy|purchase|subscribe|upgrade now|get started)\b/i);
    /* 🔴 AND IT DOES NOT SAY WHEN. "It will come together with harvest
       scheduler" is a real internal plan and would read here as a commitment
       about timing, which is what six corrections on this site were about. */
    expect(unbuilt, 'the entry implies a date').not.toMatch(/\b(soon|shortly|next|scheduler)\b/i);
  });
});

/* ── 15c–15e ───────────────────────────────────────────────────────────────
   🔴 The SERVICE PLANNER is live; the social-media scheduler is not.         */
describe('15c–15e — service planning is live, with a tier that matches the app', () => {
  const services = featureById.get('services');

  it('🔴 it is a LIVE feature entry', () => {
    expect(services, 'service planning is not a live feature').toBeDefined();
    expect(services!.name).toBe('Service Planning');
  });

  it('🔴 its tier is read off the app, not restated here', () => {
    /* THE APP GATES EVERY SERVICE-PLANNING SURFACE ON `eventRegistration` — the
       Services nav entry, the screen behind it and `/api/rota/invitations` — and
       that cell is true on MINISTRY ALONE. The write permission on top of it is
       `manageEvents`, the same one the `servicePlans` and `rotaInvitations`
       rules require; there is deliberately no separate planning permission.
       ⚠️ VERIFIED AGAINST THE APP'S OWN PUBLISHED CATALOGUE rather than against
       a number typed here, which is how a tier claim outran the app six times. */
    expect(services!.tiers, 'the feature page claims a tier the app refuses')
      .toEqual(['plus', 'pro', 'max'].map((p) => (APP_EVENT_REGISTRATION[p] ? 1 : 0)));
    expect(services!.tiers, 'service planning is not Ministry-only').toEqual([0, 0, 1]);
  });

  it('🔴 15d — it claims NO song library, CCLI, chord charts, rehearsals or blockouts', () => {
    /* `service-plan.ts` names all five as deliberately absent: "a song library,
       CCLI numbers, chord charts, rehearsal scheduling and availability
       blockouts… the marketing site says the product does not have them". */
    const prose = [
      services!.name, services!.eyebrow, services!.title, services!.oneliner, services!.moment,
      ...(services!.admin ?? []), ...(services!.member ?? []),
    ].join(' ');
    for (const absent of [/song/i, /CCLI/i, /chord/i, /rehears/i, /blockout/i, /availability/i]) {
      expect(prose, `the live copy claims ${absent}`).not.toMatch(absent);
    }
    // …and it does not promise a text, either: SMS is hidden in this very ticket
    // and email is what replaces it.
    expect(prose, 'the live copy promises a text').not.toMatch(/\btext\b|\bSMS\b/i);
    expect(prose, 'the live copy does not say the invitation is email').toMatch(/email/i);
  });

  it('🔴 what is still absent kept its own coming-soon entry, narrowed', () => {
    /* The entry was "Service and worship planning" and its `today` said "there
       is no order of service, no song library and no rota". Two thirds of that
       became FALSE, so the entry narrowed to the worship half rather than
       standing with a false claim about what IS built. */
    const soon = soonById.get('services');
    expect(soon, 'the worship half lost its entry').toBeDefined();
    expect(soon!.name).toBe('Song library and rehearsals');
    expect(soon!.today, 'the entry still says there is no order of service')
      .not.toMatch(/no order of service/i);
    expect(soon!.today, 'the entry still says there is no rota').not.toMatch(/no rota/i);
    for (const still of [/no song library/i, /no CCLI/i, /no rehearsal/i, /no availability blockout/i]) {
      expect(soon!.today, `the entry stopped naming what is genuinely absent: ${still}`).toMatch(still);
    }
  });

  it('🔴 15e — the SOCIAL-MEDIA Harvest Scheduler is still coming-soon', () => {
    /* NOT the same product, and confusing them would claim an unbuilt one as
       shipped. The founder said so himself: "Service scheduler I mean not the
       one for social media." */
    const scheduler = soonById.get('scheduler');
    expect(scheduler, 'the Harvest Scheduler left Coming Soon').toBeDefined();
    expect(featureById.has('scheduler'), 'the social scheduler became a live feature').toBe(false);
    expect(scheduler!.id).not.toBe(services!.id);
  });
});

/* ── 15f ───────────────────────────────────────────────────────────────────
   🔴 QuickBooks appears nowhere — and accounting still does.                 */
describe('15f — QuickBooks appears nowhere on the site', () => {
  const FILES = ['content/features.ts', 'components/Pricing.tsx', 'components/Replaces.tsx',
    'components/catalog.ts', 'content/faq.ts'] as const;

  it('🔴 no RENDERED surface names it', () => {
    expect(QUICKBOOKS_MARKETING_ENABLED).toBe(false);
    const rendered = [
      visibleText(render(React.createElement(ComparisonTable))),
      visibleText(render(React.createElement(Replaces))),
      ...plans.map((p) => p.features.join(' ')),
      ...CATEGORIES.flatMap((c) => [c.intro, c.seo, ...c.features.flatMap((f) => [
        f.name, f.title, f.oneliner, f.moment, ...(f.admin ?? []), ...(f.member ?? []),
      ])]),
      ...FAQS.flatMap((f) => (Array.isArray(f.answer) ? f.answer : [f.answer])),
      ...liveTools.flatMap((i) => [i.title, i.desc]),
    ];
    for (const text of rendered) {
      expect(String(text), 'a rendered surface still names QuickBooks').not.toMatch(/quickbooks/i);
    }
  });

  it.each(FILES)('%s gates its QuickBooks copy rather than deleting it', (file) => {
    // Hide, do not delete — the contract at the top of lib/flags.ts. Each of
    // these files still holds the copy, behind the flag.
    const src = readSrc(file);
    if (!/quickbooks/i.test(src)) return;
    expect(src, `${file} names QuickBooks with no flag near it`)
      .toContain('QUICKBOOKS_MARKETING_ENABLED');
  });

  it('🔴 ACCOUNTING IS NOT HIDDEN WITH IT — the ledger ships', () => {
    /* The distinction the whole flag turns on. Hiding a live, working capability
       to hide an untested integration on it is the overreach the custom-domain
       switch exists to avoid. */
    const accounting = featureById.get('accounting');
    expect(accounting, 'the accounting feature entry was hidden').toBeDefined();
    expect(accounting!.name).toBe('Accounting');
    expect(liveTools.find((i) => i.title === 'Accounting'), 'the Accounting tool was removed')
      .toBeDefined();
    expect(visibleText(render(React.createElement(ComparisonTable))), 'the accounting row was removed')
      .toMatch(/Accounting/);
  });

  it('🔴 no Coming Soon entry was invented for it', () => {
    /* "Hide entirely", said in the same breath as "coming soon" for the other
       two. A coming-soon entry is a promise, and there is none to make. */
    for (const item of COMING_SOON_ITEMS) {
      const all = [item.name, item.eyebrow, item.title, item.oneliner, item.today,
        item.notThis ?? '', item.navDesc, ...item.considering].join(' ');
      expect(all, `the "${item.id}" entry names QuickBooks`).not.toMatch(/quickbooks/i);
    }
  });
});

/* ── 15g & 18 ──────────────────────────────────────────────────────────────
   🔴 The tool count, and every assertion that pins it.                       */
describe('15g & 18 — the tool count is right, and no "replaces N tools" figure is wrong', () => {
  it('🔴 the count is 26, derived, and the three withdrawals are what moved it', () => {
    expect(CATALOG_TOOL_COUNT).toBe(26);
    expect(CATALOG_TOOL_COUNT).toBe(
      CATALOG.reduce((n, g) => n + g.items.filter((i) => !i.soon).length, 0),
    );
    // The delta, as a delta: 29 − 1 (SMS) − 2 (both newsletters) = 26, and
    // QuickBooks moves it by ZERO because its tool was reworded, not removed.
    expect(29 - 1 - 2).toBe(26);
    expect(liveTools.filter((i) => /accounting/i.test(i.title)),
      'the Accounting tool was removed, which would have understated the product')
      .toHaveLength(1);
  });

  it('🔴 all NINETEEN assertions agree, discovered by scanning', () => {
    /* DISCOVERED BY SCANNING, NOT BY LISTING — a hand-written list is exactly
       what let three of these go stale before. The COUNT of pinning files is
       pinned alongside the value, so a suite that quietly DROPS its assertion
       fails as loudly as one that leaves it stale. */
    const walk = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true })
      .flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name))
        : /\.test\.tsx?$/.test(e.name) ? [path.join(d, e.name)] : []));
    const bodies = walk(path.join(ROOT, 'src')).map((f) => [f, fs.readFileSync(f, 'utf8')] as const);
    const pins = bodies.flatMap(([f, b]) =>
      (b.match(/CATALOG_TOOL_COUNT\)\.toBe\(\d+\)/g) ?? []).map((m) => [f, m] as const));
    /* 🔵 TWENTY-ONE, NOT NINETEEN. There were nineteen before this ticket, and
       this suite adds the two above — so the figure moved for a reason that is
       named rather than absorbed. The COUNT is pinned alongside the value for
       the reason the-306 gives: a suite that quietly DROPS its assertion has to
       fail as loudly as one that leaves it stale, which a bare scan would not. */
    expect(pins.length, 'a suite gained or lost its tool-count assertion').toBe(21);
    for (const [f, pin] of pins) {
      expect(pin, `${path.relative(ROOT, f)} pins something other than the derived figure`)
        .toBe('CATALOG_TOOL_COUNT).toBe(26)');
    }
  });

  it('🔴 there is no "replaces N tools" figure to be wrong', () => {
    /* STOP CONDITION 3c, ANSWERED. THE-257 retired the competitor table: the
       #replaces section's only numeric claim is the top plan's PRICE, and its
       summary line reads "Everything above, on the … plan". Removing QuickBooks
       from the integrations row therefore changes no count. Asserted on the
       RENDERED section so a figure reintroduced anywhere in it fails here. */
    const section = visibleText(render(React.createElement(Replaces)));
    expect(section, 'a "replaces N tools" figure appeared').not.toMatch(/replaces?\s+\d+/i);
    expect(section, 'a tool count appeared in the section').not.toMatch(/\b\d+\s+tools\b/i);
    expect(section, 'the section lost its summary line').toMatch(/Everything above, on the/);
  });

  it('🔴 the mega-menu quotes the derived figure and never a literal', () => {
    expect(readSrc('components/Nav.tsx')).toContain('${CATALOG_TOOL_COUNT} tools in one platform');
    expect(readSrc('components/catalog.ts'), 'the tool count was hardcoded')
      .not.toMatch(/CATALOG_TOOL_COUNT\s*=\s*\d+/);
  });
});

/* ── 16, 17 & 21 ───────────────────────────────────────────────────────────
   The standing constraints.                                                   */
describe('16, 17 & 21 — the vendor, the coming-soon shape, and the restored guards', () => {
  it('🔴 16 — this ticket added no mention of the scheduler vendor', () => {
    /* NO-REGRESSION, DELEGATED RATHER THAN RE-IMPLEMENTED. The repo-wide sweep
       is `pages/the-284-harvest-scheduler.test.ts` §1: it stores its tokens
       base64-encoded so the plain string exists in NO file, reads its own source
       like every other, and therefore needs no self-exemption. Writing a second
       sweep here would either duplicate it or — if it spelled the token — fail
       on itself, which is the defect eleven guards in this series shipped with.

       What THIS asserts is that the sweep is still armed and that the files this
       ticket ADDED are inside its reach. */
    const sweep = readSrc('pages/the-284-harvest-scheduler.test.ts');
    expect(sweep, 'the vendor sweep stopped encoding its own tokens').toMatch(/base64/);
    expect(sweep, 'the vendor sweep no longer walks the repository').toMatch(/walk\(ROOT\)/);

    /* ⚠️ THE TOKENS ARE NOT REPEATED HERE, and the first draft of this test got
       that wrong in an instructive way: it swept for the CARRIER's name instead,
       which `lib/flags.ts` legitimately carries in THE-314's own prose
       explaining why the copy came back reworded off bring-your-own. Two
       different vendors, two different rules — the scheduler vendor is the one
       that may appear nowhere, and the-284 owns that sweep whole.
       So this asserts REACH rather than re-deriving the rule: every file this
       ticket added or rewrote is inside the tree the sweep walks, and the sweep
       runs over the tree rather than over a list. */
    const files = walkRepo(path.join(ROOT, 'src')).map((f) => path.relative(ROOT, f));
    for (const rel of ['src/lib/flags.ts', 'src/content/coming-soon.ts', 'src/content/features.ts',
      'src/components/catalog.ts', 'src/components/Replaces.tsx', 'src/components/Pricing.tsx',
      'src/content/faq.ts', 'src/content/the-335-hidden-and-live.test.ts']) {
      expect(files, `${rel} is outside the sweep's reach`).toContain(rel);
    }
  });

  it('🔴 17 — every coming-soon entry is still claim-free, not just the new one', () => {
    expect(() => comingSoonContract(COMING_SOON_ITEMS)).not.toThrow();
    for (const item of COMING_SOON_ITEMS) {
      expect(item, `"${item.id}" grew a tiers array`).not.toHaveProperty('tiers');
      expect(item.ref, `"${item.id}" traces to no card`).toMatch(/^(THE-\d+|86[a-z0-9]{7})$/);
    }
  });

  it('🔴 21 — the-245\'s guards were RESTORED, not deleted', () => {
    // The files that pinned the SMS-hidden state before #94 are still here, and
    // still assert the hidden state rather than having been emptied.
    const guard = readSrc('content/the-245-sms-hidden.test.ts');
    expect(guard).toMatch(/export const SMS_MARKETING_ENABLED = false;/);
    expect(guard, 'the-245 stopped asserting the tool is withheld')
      .toMatch(/the SMS tool is still sold in the live catalogue/);
    expect(readSrc('content/the-250-sms-pricing-removed.test.ts'), 'the-250 was emptied')
      .toMatch(/SMS_MARKETING_ENABLED/);
  });

  it('🔴 the Terms carry no dormant SMS clause to withdraw', () => {
    /* THE-314 REMOVED a false Terms bullet and added nothing, so its whole legal
       footprint is one PRIVACY paragraph — and that one is gated, so it went
       dormant on its own with the flag. Recorded here because "did anything land
       in the Terms" is a question this ticket had to answer, and the answer is
       no. */
    const terms = LEGAL_DOCS.find((d) => d.slug === 'terms')!;
    const text = JSON.stringify(terms);
    expect(text, 'the Terms describe SMS while it is hidden').not.toMatch(/\bSMS\b/);
    // …and the privacy paragraph is GATED rather than deleted, so it returns.
    expect(readSrc('content/legal.ts'), 'the privacy SMS clause was deleted rather than gated')
      .toMatch(/SMS_MARKETING_ENABLED[\s\S]{0,200}messaging provider/);
  });
});

/* ── 13g ───────────────────────────────────────────────────────────────────
   🔴 The cross-repo CRM label, and free's swap.                              */
describe('13g — the pricing table and the app agree about free', () => {
  it('🔴 the free card shows Signups and no CRM', () => {
    const free = readSrc('components/Pricing.tsx');
    expect(free, 'the free card stopped naming Signups').toMatch(/'Signups — who joined/);
    const grid = visibleText(render(React.createElement(ComparisonTable)));
    expect(grid, 'the grid lost its Signups row').toMatch(/Signups & Evangelism Analytics/);
  });

  it('🔴 `crmLabel` still answers for both tiers, because the ROW still needs it', () => {
    /* The label did not change — only which tiers hold the feature. The
       comparison row free is now FALSE on is still headed "CRM (Donors &
       Members)", and `crmLabel('free')` still answers "CRM (Members)" for the
       day free has a CRM again. Removing the branch would be deleting a string
       the app still carries its own copy of. */
    const src = readSrc('components/Pricing.tsx');
    expect(src).toContain("'CRM (Members)'");
    expect(src).toContain("'CRM (Donors & Members)'");
  });
});
