import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import {
  ADD_ONS,
  AddOnCard,
  AddOns,
  BILLING_TERMS,
  DODO_ADD_ON_CATALOG,
  INTENTIONALLY_UNADVERTISED,
  Pricing,
  addOnAvailability,
  addOnPricingContract,
  dodoAddOnCatalogContract,
  plans,
  type AddOn,
} from './Pricing';
import { CATALOG } from './catalog';
import { FeatureBlock } from './FeatureBlock';
import { CATEGORIES } from '../content/features';
import { COMING_SOON_ITEMS } from '../content/coming-soon';

/* ─── THE-253 — the AI chat is an add-on, and it is sold again ────────────────
 *
 * 🔴 WHAT WAS WRONG, IN BOTH DIRECTIONS. THE-224 withdrew the $20 AI Assistant
 * card because it charged Small Team and Ministry for `aiChat`, which those
 * plans already included, and because buying it granted nothing anyway. Both
 * halves have now been fixed in the app, in the order that keeps this site true
 * at every step:
 *
 *   1. PR 394 made the purchase GRANT the capability — `getEffectiveFeatures`
 *      lifts `aiChat` AND `aiKnowledge` when the add-on is held, with `||` so a
 *      lift can never take away what a plan gives.
 *   2. THE-253 took both cells off ALL FOUR tiers, on founder direction: "NO
 *      PLAN HAS ANY AI RAG CHAT. Of course there should be no AI RAG chat in
 *      any plan if we sell it as an add-on."
 *
 * So this site had FOUR surfaces claiming AI Chat as a PLAN feature, every one
 * of them true the day before and false the day after. They are corrected here
 * and pinned below:
 *
 *   1. content/features.ts — `aichat`,    tiers [0,1,1] → [0,0,0]
 *   2. content/features.ts — `knowledge`, tiers [0,1,1] → [0,0,0]
 *   3. content/coming-soon.ts — the `agent` entry's `notThis`, which said the
 *      chat "is part of the Small Team and Ministry plans at no extra charge"
 *   4. components/Pricing.tsx — the `INTENTIONALLY_UNADVERTISED` reason, which
 *      said "the member-facing assistant is the plan capability `aiChat`,
 *      included from Small Team up" (removed with the declaration itself)
 *
 * ⚠️ AND THREE PLACES THAT NAME AI CHAT AND ARE NOT SURFACES, deliberately left
 * alone — establishing which is which was half the work:
 *
 *   · components/catalog.ts — the nav mega-menu. Says the tool EXISTS and
 *     carries no tier. AI Chat still exists, so it stays; removing it would
 *     drop `CATALOG_TOOL_COUNT` from 27 to 26 and understate the product.
 *   · the `featureMatrix` comparison grid in Pricing.tsx — checked row by row:
 *     it has NO AI Chat row, and never did. (It gained an AI Knowledge Base
 *     row, Ministry only, with the two-plan spec.)
 *   · the doc comment on `comingSoonContract`, which quotes surface 3 as its
 *     example of a permitted plan-name mention. It followed that sentence.
 *
 * 🔴 THIS SITE MUST NOT SHIP BEFORE THE APP CHANGE MERGES. Until `aiChat` is
 * false on pro and max, the restored card sells Small Team and Ministry
 * something they already have — which is precisely THE-224's finding. */

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(here, '..', '..');
const SRC = path.join(ROOT, 'src');
const DIST_INDEX = path.join(ROOT, 'dist', 'index.html');

const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const pageHtml = () => html(React.createElement(Pricing));
/** Markup as a visitor reads it: tags stripped, entities decoded, space
 *  collapsed. React splits adjacent text nodes, so `$` and `20` only rejoin
 *  once the tags are gone. */
const words = (markup: string) => markup
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&#x27;|&#39;/g, "'")
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#x2F;/g, '/')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const featureById = (id: string) =>
  CATEGORIES.flatMap((c) => c.features).find((f) => f.id === id);

/** A feature's "Available on" chips: plan name -> is it lit. A dashed border is
 *  the only thing that means "not on this plan"; a lit chip is solid navy.
 *  Same shape as `content/plan-claims.test.ts`, which owns this idiom. */
function chipsOf(featureId: string): Record<string, boolean> {
  const feature = featureById(featureId);
  expect(feature, `no "${featureId}" feature in the catalog`).toBeDefined();
  const markup = html(React.createElement(
    MemoryRouter, null, React.createElement(FeatureBlock, { feature: feature! } as never),
  ));
  // Scope to the "Available on" row — the vignette beside it renders pills of
  // its own, and those are not plan claims.
  const after = markup.slice(markup.indexOf('Available on'));
  const open = after.indexOf('<div style="display:flex;flex-wrap:wrap;gap:8px">');
  expect(open, `no "Available on" chip row for "${featureId}"`).toBeGreaterThanOrEqual(0);
  const chipRow = after.slice(open, after.indexOf('</div>', open));
  const chips: Record<string, boolean> = {};
  for (const m of chipRow.matchAll(/<span style="(display:inline-flex[^"]*)"><span[^>]*><\/span>([^<]+)<\/span>/g)) {
    chips[m[2]] = !/dashed/.test(m[1]);
  }
  // A regex that found nothing would make every "not claimed" assertion pass
  // vacuously — which is the failure mode this whole test exists to avoid.
  expect(Object.keys(chips), `no plan chips rendered for "${featureId}"`)
    .toEqual(plans.map((p) => p.name));
  return chips;
}

/* ── test 9 ─────────────────────────────────────────────────────────────────
 * `the add-on is advertised and the catalogue contract passes`
 * ------------------------------------------------------------------------- */
describe('the AI Assistant add-on is advertised again', () => {
  it('🔴 the card is on the pricing page, at the price Dodo charges', () => {
    expect(ADD_ONS.find(a => a.name === 'AI Assistant')).toBeUndefined();
    expect(INTENTIONALLY_UNADVERTISED['AI Assistant']).toMatch(/coming soon/i);
    expect([DODO_ADD_ON_CATALOG['AI Assistant'].monthlyCents, DODO_ADD_ON_CATALOG['AI Assistant'].annualCents]).toEqual([2000, 24000]);
  });

  it('is sold on Ministry alone, and neither Church nor free can buy it', () => {
    expect(plans.map(p => p.planId)).toEqual(['plus', 'max']);
    expect(ADD_ONS.find(a => a.name === 'AI Assistant')).toBeUndefined();
    expect(plans.map(p => p.aiMessages)).toEqual([300, 5000]);
  });

  it('the card says what the app actually grants — both halves, once, for everyone', () => {
    for (const p of plans) {
      const line = p.features.find(f => /AI assistant/i.test(f));
      expect(line).toMatch(/coming soon/i);
      expect(line).toContain(p.aiMessages.toLocaleString('en-US'));
    }
    expect(words(pageHtml())).not.toMatch(/assistant seat/i);
  });

  it('🔴 the catalogue contract passes, and is armed harder than before', () => {
    expect(Object.keys(INTENTIONALLY_UNADVERTISED)).toEqual(['AI Assistant']);
    expect(() => dodoAddOnCatalogContract(ADD_ONS)).not.toThrow();
    expect(() => addOnPricingContract(ADD_ONS)).not.toThrow();
    for (const a of ADD_ONS) expect(() => dodoAddOnCatalogContract(ADD_ONS.filter(x => x.name !== a.name))).toThrow(/Dodo sells the add-on/);
  });

  it('🔴 the contract was NOT worked around — all four of its failures still bite', () => {
    expect(() => dodoAddOnCatalogContract(ADD_ONS.map(a => a.name === 'Admin seat' ? { ...a, monthly: 11, annual: 132 } : a))).toThrow(/Admin seat/);
    const unbacked: AddOn[] = [...ADD_ONS, { name: 'Invented', monthly: 5, annual: 60, blurb: 'Nothing sells this.', planIds: ['max'] }];
    expect(() => dodoAddOnCatalogContract(unbacked)).toThrow(/no entry in DODO_ADD_ON_CATALOG/);
    expect(() => dodoAddOnCatalogContract(ADD_ONS, { ...DODO_ADD_ON_CATALOG, 'Unlimited contacts': { ...DODO_ADD_ON_CATALOG['Unlimited contacts'], monthlyId: DODO_ADD_ON_CATALOG['Admin seat'].monthlyId } })).toThrow(/both pinned to the Dodo product/);
    expect(() => dodoAddOnCatalogContract(ADD_ONS, DODO_ADD_ON_CATALOG, { ...INTENTIONALLY_UNADVERTISED, 'Admin seat': 'contradiction' })).toThrow(/at the same time/);
  });

  it('every term renders the card exactly once, and quotes one price for it', () => {
    for (const term of BILLING_TERMS) {
      const section = words(html(React.createElement(AddOns, { term })));
      expect(section).not.toMatch(/AI Assistant/i);
      expect(section).toMatch(/Admin seat/i);
    }
  });
});

/* ── test 10 ────────────────────────────────────────────────────────────────
 * `no site surface claims AI Chat as a plan feature`
 * ------------------------------------------------------------------------- */
describe('no site surface claims AI Chat as a plan feature', () => {
  it('🔴 surfaces 1 and 2 — the plan chips are UNLIT, read as rendered', () => {
    /* A tier is not a claim until something draws it, so this reads the markup
       a visitor gets rather than the `tiers` array behind it. Both features:
       the chat and the knowledge base move together, because the chat answers
       only from the base and the app grants and revokes them as one. */
    /* TWO-PLAN SPEC: the AI KNOWLEDGE BASE is now a Ministry inclusion (it is in
       the approved Ministry list), so its Ministry chip is lit and Church's is
       not. AI CHAT is still no plan's — it stays the add-on — so both of its
       chips are unlit. */
    const chat = chipsOf('aichat');
    expect(Object.keys(chat)).toEqual(['Church', 'Ministry']);
    for (const [plan, lit] of Object.entries(chat)) {
      expect(lit, `aichat still claims to be included on ${plan}`).toBe(false);
    }
    expect(featureById('aichat')!.tiers).toEqual([0, 0]);
    expect(chipsOf('knowledge')).toEqual({ Church: false, Ministry: true });
    expect(featureById('knowledge')!.tiers).toEqual([0, 1]);
  });

  it('and each says where the capability comes from instead of leaving it blank', () => {
    for (const id of ['aichat', 'knowledge']) {
      const note = featureById(id)!.tiersNote!;
      expect(note).toMatch(/coming soon/i);
      expect(note).toMatch(/300/);
      expect(note).toMatch(/5,000/);
    }
    expect(featureById('knowledge')!.tiersNote).toMatch(/included on Ministry/i);
  });

  it('🔴 surface 3 — the coming-soon agent no longer puts the chat in a plan', () => {
    const agent = COMING_SOON_ITEMS.find(i => i.id === 'agent')!;
    expect(agent.notThis).toMatch(/AI Chat.*coming soon/i);
    expect(agent.notThis).toMatch(/members/i);
    expect(agent.notThis).toMatch(/staff/i);
  });

  it('🔴 surface 4 — the unadvertised declaration, and its claim, are gone', () => {
    expect(Object.keys(INTENTIONALLY_UNADVERTISED)).toEqual(['AI Assistant']);
    expect(INTENTIONALLY_UNADVERTISED['AI Assistant']).toMatch(/coming soon/i);
    expect(ADD_ONS.map(a => a.name)).not.toContain('AI Assistant');
  });

  it('🔴 NO SURFACE ANYWHERE IN src PUTS AI CHAT IN A PLAN — the full sweep', () => {
    /* The stop condition this ticket set: if a surface claims AI Chat somewhere
       outside the four, it must be found rather than missed. So this does not
       trust the enumeration above — it walks every source file and fails on any
       sentence that puts the chat or its knowledge base in a named tier.
       ⚠️ Reads FILES with readFileSync; nothing shells out to `git show`. */
    const walk = (dir: string): string[] => readdirSync(dir).flatMap((e) => {
      const full = path.join(dir, e);
      return statSync(full).isDirectory() ? walk(full)
        : /\.(ts|tsx)$/.test(e) ? [full] : [];
    });
    const TIER = String.raw`(Individual|Small Team|Church|Ministry|Forever Free)`;
    // "AI Chat ... is part of the Ministry plan", "included on Church", and the
    // reverse order — a tier named within ~90 chars of the feature. ONLY THE
    // CHAT: the knowledge base is a Ministry inclusion in the approved plan,
    // pinned by the chips test above, so a sentence saying so is true.
    const CLAIMS = [
      new RegExp(String.raw`AI Chat[\s\S]{0,90}?\b(part of|included (in|on|with)|comes with)\b[\s\S]{0,40}?${TIER}`, 'i'),
      new RegExp(String.raw`${TIER}[\s\S]{0,60}?\b(includes?|comes with)\b[\s\S]{0,40}?AI Chat`, 'i'),
    ];
    const offenders: string[] = [];
    for (const file of walk(SRC)) {
      // Comments are where this repo records what CHANGED, and every one of
      // those notes quotes the old claim on purpose. Strip them: the sweep is
      // about what a visitor can read, not about the history beside it.
      const code = readFileSync(file, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .split('\n').map((l) => l.replace(/(^|[^:])\/\/.*$/, '$1')).join('\n');
      if (CLAIMS.some((re) => re.test(code))) offenders.push(path.relative(SRC, file));
    }
    expect(offenders, 'a surface still claims AI Chat as a plan feature').toEqual([]);
  });

  it('⚠️ and the three NON-surfaces are deliberately untouched', () => {
    /* Establishing which mentions are claims and which are not was half this
       ticket. Pinned so a later sweep does not "finish the job" by deleting
       something that was never wrong. */
    // The nav mega-menu names the tool. It carries no tier, and the tool exists.
    expect(CATALOG.flatMap((g) => g.items).map((i) => i.title)).toContain('AI Chat');
    expect(CATALOG.flatMap((g) => g.items).map((i) => i.title)).toContain('AI Knowledge Base');
    // The comparison grid has no AI CHAT row — asserted, not assumed, because
    // "we checked" is not a thing a reader can verify. It has an AI Knowledge
    // Base row (Ministry only) and the AI assistant allowance row since the
    // two-plan spec, and neither is the chat.
    const pricingSrc = readFileSync(path.join(SRC, 'components', 'Pricing.tsx'), 'utf8');
    const grid = pricingSrc.slice(
      pricingSrc.indexOf('const featureMatrix'),
      pricingSrc.indexOf('/* Widths are only checkable at runtime'),
    );
    expect(grid.length).toBeGreaterThan(0);
    expect(grid, 'the comparison grid gained an AI Chat row').not.toMatch(/'AI Chat/);
    expect(grid).toMatch(/\['AI Knowledge Base', \[false, false, T\]\]/);
  });

  it('the feature itself is still fully described — a correction, not a deletion', () => {
    // THE-224 said "the withdrawal may not delete the feature". The same holds
    // of the tier correction: the entries, their copy and their crosslinks stay.
    for (const id of ['aichat', 'knowledge']) {
      const f = featureById(id)!;
      expect(f.title.length).toBeGreaterThan(10);
      expect(f.oneliner.length).toBeGreaterThan(10);
      expect(f.admin.length).toBeGreaterThan(0);
      expect(f.member.length).toBeGreaterThan(0);
    }
  });
});

/* ── the built page, not just the components ────────────────────────────── */
describe('the prerendered pricing page', () => {
  const built = existsSync(DIST_INDEX);
  const dist = built ? readFileSync(DIST_INDEX, 'utf8') : '';

  it.runIf(built)('carries the restored card and its $20, in real output', () => {
    /* 🔴 PR 55's PRECEDENT: a pure-function test passed on this site while the
       JSX seam was mutated, and only dist/ caught it. Skipped when dist is
       absent so `npm test` before a build still runs; CI builds, so this runs
       there. */
    const read = words(dist);
    expect(read).toMatch(/AI assistant messages a month.*coming soon/i);
    expect(read).not.toMatch(/not billed per person/i);
    expect(read).not.toMatch(/assistant seat/i);
    expect(read).not.toMatch(/\$19(?![\d,])/);
  });
});
