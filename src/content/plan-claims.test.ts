import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import {
  ADVERTISED_DISCOUNT_PCT, BILLING_TERMS, planPriceContract, ComparisonTable, PlanCard, plans,
} from '../components/Pricing';
import { FeatureBlock } from '../components/FeatureBlock';
import { CATALOG, CATALOG_TOOL_COUNT } from '../components/catalog';
import { CATEGORIES } from './features';
import { FAQS } from './faq';
import { LEGAL_DOCS } from './legal';

/* THE-164 — the site sold two features on tiers that do not have them.
 *
 * Ground truth is the member app's `plan-features.ts`, positional against
 * `plans` in components/Pricing.tsx — [Individual, Small Team, Ministry]:
 *
 *   docs            (Docs & Notes)     plus:false  pro:true   max:true
 *   communityGroups (Community Groups) plus:false  pro:false  max:true
 *
 * `communityGroups` was gated in the app on 2026-08-16 (app PR 332), which is
 * what made the second claim false on TWO tiers rather than one.
 *
 * 🔴 The distinction the whole fix turns on: the NEWS FEED (/community_posts)
 * is on every plan and is a different product from Community Groups. "Cut the
 * community claim" must not take the feed with it — app PR 332 had to draw the
 * same line. Tests 3 and 4 exist to make the over-correction fail loudly.
 *
 * Likewise Notes is real on Small Team and Ministry. The correction is a tier
 * floor, never a removal; test 5 pins the livestream-push qualifier that says
 * so, and PricingComparison.test.ts pins every surface Notes still occupies.
 *
 * ⚠️ Claims are read off RENDERED markup wherever a claim is a rendered thing —
 * the plan chips, the grid cells, the plan cards. A tier is not a claim until
 * something draws it. The comparison grid sits behind `showTable`, which starts
 * closed, so it never reaches dist/ and can only be checked by rendering
 * `ComparisonTable` here (see the note at the top of PricingComparison.test.ts). */

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

/* ---------------------------------------------------------------- *
 * The plan chips on /features/*, read as rendered.
 * ---------------------------------------------------------------- */

/** A feature's "Available on" chips: plan name -> is it lit. A dashed border is
 *  the only thing that means "not on this plan"; a lit chip is solid navy. */
function chipsOf(featureId: string): Record<string, boolean> {
  const feature = CATEGORIES.flatMap((c) => c.features).find((f) => f.id === featureId);
  expect(feature, `no "${featureId}" feature in the catalog`).toBeDefined();
  const html = render(React.createElement(
    MemoryRouter, null, React.createElement(FeatureBlock, { feature: feature! }),
  ));
  // Scope to the "Available on" row. The vignette beside it renders pills of its
  // own — the docs mock has a "Saved" one — and they are not plan claims.
  const after = html.slice(html.indexOf('Available on'));
  const open = after.indexOf('<div style="display:flex;flex-wrap:wrap;gap:8px">');
  expect(open, `no "Available on" chip row for "${featureId}"`).toBeGreaterThanOrEqual(0);
  const chipRow = after.slice(open, after.indexOf('</div>', open));
  const chips: Record<string, boolean> = {};
  for (const m of chipRow.matchAll(/<span style="(display:inline-flex[^"]*)"><span[^>]*><\/span>([^<]+)<\/span>/g)) {
    chips[m[2]] = !/dashed/.test(m[1]);
  }
  // A regex that found nothing would make every "not claimed" assertion below
  // pass vacuously.
  expect(Object.keys(chips), `no plan chips rendered for "${featureId}"`)
    .toEqual(plans.map((p) => p.name));
  return chips;
}

/* ---------------------------------------------------------------- *
 * The comparison grid, read as rendered.
 * ---------------------------------------------------------------- */

const TABLE_HTML = render(React.createElement(ComparisonTable));
const cellsOf = (rowHtml: string) => [...rowHtml.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
const readCell = (html: string) => (/lucide-check/.test(html) ? 'included' : words(html) === '—' ? 'excluded' : words(html));

const rowsHtml = TABLE_HTML.split(/<tr\b/).slice(1);
const gridColumns = cellsOf(rowsHtml[0].replace(/<th\b/g, '<td').replace(/<\/th>/g, '</td>')).map(words).slice(1);
const gridRows = rowsHtml.slice(1).filter((r) => !/colSpan/i.test(r)).map((r) => {
  const tds = cellsOf(r);
  return { label: words(tds[0]), cells: tds.slice(1).map(readCell) };
});

/** One grid row's reading for one named plan — both looked up, never indexed. */
function gridClaim(feature: string, planName: string) {
  const row = gridRows.find((r) => r.label === feature);
  expect(row, `no "${feature}" row in the comparison grid`).toBeDefined();
  const col = gridColumns.indexOf(planName);
  expect(col, `no "${planName}" column in the comparison grid`).toBeGreaterThanOrEqual(0);
  return row!.cells[col];
}

/** The plan cards, rendered — these DO reach dist/pricing/index.html. */
const cardText = (planId: string) => words(render(React.createElement(
  PlanCard, { plan: plans.find((p) => p.planId === planId)!, term: 'yearly' as const },
)));

/* ---------------------------------------------------------------- *
 * Every sentence on the site that makes an every-plan claim.
 * ---------------------------------------------------------------- */

/** Every published post, straight off disk. */
const POSTS_DIR = fileURLToPath(new URL('./posts', import.meta.url));
const POSTS_DIR_FILES: [string, string][] = readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => [`content/posts/${f}`, readFileSync(`${POSTS_DIR}/${f}`, 'utf8')]);

/** Prose surfaces, each labelled so a failure names the file to open. */
const PROSE: [string, string][] = [
  ...FAQS.flatMap((f) => f.answer.map((a, i): [string, string] => [`content/faq.ts — "${f.id}" answer[${i}]`, a])),
  ...FAQS.map((f): [string, string] => [`content/faq.ts — "${f.id}" question`, f.question]),
  ...CATEGORIES.flatMap((c) => c.features.flatMap((f): [string, string][] => [
    [`content/features.ts — ${f.id}.tiersNote`, f.tiersNote ?? ''],
    [`content/features.ts — ${f.id}.eyebrow`, f.eyebrow],
    [`content/features.ts — ${f.id}.oneliner`, f.oneliner],
    [`content/features.ts — ${f.id}.moment`, f.moment],
    ...f.admin.map((a, i): [string, string] => [`content/features.ts — ${f.id}.admin[${i}]`, a]),
    ...f.member.map((m, i): [string, string] => [`content/features.ts — ${f.id}.member[${i}]`, m]),
  ])),
  ...LEGAL_DOCS.flatMap((d) => d.sections.flatMap((s) => s.blocks.flatMap((b): [string, string][] =>
    (b.kind === 'p' ? [b.text] : b.items).map((t, i) => [`content/legal.ts — ${d.slug}/${s.id ?? s.heading} block[${i}]`, t])))),
  ...plans.flatMap((p) => p.features.map((f, i): [string, string] => [`components/Pricing.tsx — ${p.name} card feature[${i}]`, f])),
  ['components/Pricing.tsx — Individual card, rendered', cardText('plus')],
  ['components/Pricing.tsx — Small Team card, rendered', cardText('pro')],
  ['components/Pricing.tsx — Ministry card, rendered', cardText('max')],
  // The blog is a plan-claim surface too — one post runs its own comparison
  // table against Planning Center. Read off disk: `virtual:blog-content` is
  // stubbed under vitest, so importing content/posts.ts would scan the stub.
  ...POSTS_DIR_FILES,
];

/* Clauses, not sentences. A markdown table row and a semicolon-joined line each
   carry two independent claims — "Community feed all plans; private groups on
   Ministry" is TRUE read clause by clause and false read as one blob. */
const clauses = (text: string) => text.split(/(?<=[.!?])\s+|[;|·]|\s+—\s+/).map((c) => c.trim()).filter(Boolean);

const EVERY_PLAN = /\b(every|all|each)\s+plans?\b|\bevery\s+tier\b|\bon\s+all\s+three\b/i;

/** Every clause on the site that says "on every plan", with its source. */
const everyPlanClauses: [string, string][] = PROSE
  .flatMap(([where, text]) => clauses(text).map((c): [string, string] => [where, c]))
  .filter(([, c]) => EVERY_PLAN.test(c));

/** The news feed is on every plan and is named several ways. Strip the feed
 *  phrasings first; anything still saying "community" or "groups" in an
 *  every-plan clause is a Community Groups claim, which is Ministry-only. */
const withoutFeed = (s: string) => s
  .replace(/\bcommunity\s+(feed|posts?|space)\b/gi, '')
  .replace(/\bnews\s+feed\b/gi, '');

describe('what the site claims is on every plan', () => {
  it('finds the every-plan claims at all', () => {
    // The guard against every assertion here passing off an empty corpus: a
    // scan that found nothing would make "nothing claims Notes" trivially true.
    expect(PROSE.length).toBeGreaterThan(200);
    expect(POSTS_DIR_FILES.length, 'no blog posts read off disk').toBeGreaterThan(0);
    expect(everyPlanClauses.length).toBeGreaterThan(15);
    expect(everyPlanClauses.map(([, c]) => c).join(' ')).toMatch(/0% platform fee/i);
    // Each kind of surface is actually represented.
    const sources = everyPlanClauses.map(([where]) => where);
    for (const file of ['content/faq.ts', 'content/features.ts', 'content/legal.ts', 'content/posts/']) {
      expect(sources.some((w) => w.startsWith(file)), `no every-plan clause from ${file}`).toBe(true);
    }
    // And the sentence this ticket corrected is in the corpus, so tests 1 and 2
    // are reading the surface they exist to police.
    expect(sources).toContain('content/faq.ts — "pricing" answer[2]');
  });

  it('no surface claims Docs and Notes on every plan', () => {
    // 🔴 The regression. `docs` is false on `plus`: Individual does not have it,
    // so no every-plan clause anywhere may name it.
    const offenders = everyPlanClauses
      .filter(([, c]) => /\bdocs?\b|\bnotes?\b|\bdocuments?\b/i.test(c))
      .map(([where, c]) => `${where}: "${c}"`);
    expect(offenders, 'Docs & Notes is not on Individual').toEqual([]);

    // The rendered chips on /features/discipleship-content#docs.
    expect(chipsOf('docs')).toEqual({ Individual: false, 'Small Team': true, Ministry: true });

    // The rendered Individual card. Unlike the grid, this reaches dist/.
    expect(cardText('plus')).not.toContain('Docs & Notes');

    // Still sold where it is real — the correction is a tier floor, not a cut.
    expect(cardText('pro')).toContain('Docs & Notes');
    expect(FAQS.find((f) => f.id === 'pricing')!.answer.join(' ')).toMatch(/docs and sermon notes/i);
  });

  it('no surface claims Community on every plan', () => {
    // 🔴 The second regression, false on TWO tiers since app PR 332.
    const offenders = everyPlanClauses
      .filter(([, c]) => /\bcommunit(y|ies)\b|\bgroups?\b/i.test(withoutFeed(c)))
      .map(([where, c]) => `${where}: "${c}"`);
    expect(offenders, 'Community Groups is Ministry-only').toEqual([]);

    // The rendered chips on /features/community-engagement#groups.
    expect(chipsOf('groups')).toEqual({ Individual: false, 'Small Team': false, Ministry: true });

    // The rendered grid, and the cards that reach dist/.
    expect(gridClaim('Community Groups', 'Individual')).toBe('excluded');
    expect(gridClaim('Community Groups', 'Small Team')).toBe('excluded');
    expect(gridClaim('Community Groups', 'Ministry')).toBe('included');
    expect(cardText('plus')).not.toMatch(/community groups/i);
    expect(cardText('pro')).not.toMatch(/community groups/i);
    expect(cardText('max')).toMatch(/community groups/i);
  });

  it('the news feed is still claimed on every plan', () => {
    // 🔴 The over-correction guard. The feed is /community_posts — a DIFFERENT
    // product from Community Groups, and genuinely on all three plans. Cutting
    // it while cutting the community claim is the failure this pins shut.
    expect(FAQS.find((f) => f.id === 'pricing')!.answer.join(' ')).toMatch(/news feed/i);
    expect(chipsOf('feed')).toEqual({ Individual: true, 'Small Team': true, Ministry: true });
    for (const name of plans.map((p) => p.name)) {
      expect(gridClaim('News Feed', name), `${name} lost the news feed`).toBe('included');
      expect(gridClaim('Community Feed', name), `${name} lost the community feed`).toBe('included');
    }
    expect(cardText('plus')).toContain('Blog & News Feed');
  });

  it('the Bible and courses are still claimed on every plan', () => {
    // The rest of the true every-plan list the FAQ sentence carries.
    const pricing = FAQS.find((f) => f.id === 'pricing')!.answer.join(' ');
    expect(pricing).toMatch(/the full Bible/i);
    expect(pricing).toMatch(/courses/i);
    expect(chipsOf('bible')).toEqual({ Individual: true, 'Small Team': true, Ministry: true });
    expect(chipsOf('courses')).toEqual({ Individual: true, 'Small Team': true, Ministry: true });
    for (const name of plans.map((p) => p.name)) {
      expect(gridClaim('Bible', name), `${name} lost the Bible`).toBe('included');
    }
    expect(cardText('plus')).toContain('Bible');
    expect(cardText('plus')).toContain('2 courses');
  });

  it('the livestream-push qualifier on Notes survives', () => {
    // The half of the tiersNote that was always TRUE. Pushing an open outline to
    // a live stream needs livestream, which starts on Small Team — that is the
    // sentence explaining why the floor is where it is, and it renders.
    const docs = CATEGORIES.flatMap((c) => c.features).find((f) => f.id === 'docs')!;
    expect(docs.tiersNote).toMatch(
      /Pushing notes to a live stream needs Small Team or above, because that is where livestream itself starts\./,
    );
    // And it must no longer open by claiming every plan.
    expect(docs.tiersNote).not.toMatch(/on every plan/i);
    expect(docs.tiersNote).toMatch(/Small Team and above/);

    const html = words(render(React.createElement(
      MemoryRouter, null, React.createElement(FeatureBlock, { feature: docs }),
    )));
    expect(html).toContain('Pushing notes to a live stream needs Small Team or above');

    // Sermon Notes → Livestream is its own grid row and keeps its own floor.
    expect(gridClaim('Sermon Notes → Livestream', 'Individual')).toBe('excluded');
    expect(gridClaim('Sermon Notes → Livestream', 'Small Team')).toBe('included');
    expect(gridClaim('Sermon Notes → Livestream', 'Ministry')).toBe('included');
  });

  it('the Individual plan card claims nothing the matrix denies', () => {
    const individual = cardText('plus');

    // Derived, not hand-written: anything the grid marks excluded on Individual
    // must not turn up as a bullet on the Individual card. The two structures
    // are separate — #59 cut a grid row and the card claim survived it — so the
    // grid is the matrix this card is held against.
    const deniedRows = gridRows.filter((r) => r.cells[gridColumns.indexOf('Individual')] === 'excluded');
    expect(deniedRows.length, 'no excluded rows found — the grid parse is wrong').toBeGreaterThan(5);
    const claimed = deniedRows.map((r) => r.label).filter((label) => individual.includes(label));
    expect(claimed, 'the Individual card claims features the grid denies it').toEqual([]);

    // And the two this ticket is about, by name — Docs & Notes has no grid row
    // at all since #59, so no derived check can reach it.
    expect(individual).not.toContain('Docs & Notes');
    expect(individual).not.toMatch(/sermon notes/i);
    expect(individual).not.toMatch(/community groups/i);

    // What it does still sell, so "claims nothing" was not bought by emptying it.
    for (const kept of ['150 contacts · 2 admins', 'Mobile App (PWA)', 'Blog & News Feed', 'Bible', '2 courses', 'CRM (Donors & Members)', 'Donation page & Fundraising']) {
      expect(individual, `the Individual card stopped selling ${kept}`).toContain(kept);
    }
  });
});

/* ---------------------------------------------------------------- *
 * THE-180 — the Community Groups feature block named no tier at all. Unlike
 * THE-164, this was never a false "every plan" clause anywhere (the FAQ and
 * the grid were already correct) — it was silence: the oneliner, and every
 * admin/member bullet, described creating channels, posting with a role
 * badge, and DMing "any admin" with no qualifier, so a Individual or Small
 * Team reader had nothing on the page telling them it doesn't apply to them.
 * `docs` already carries a `tiersNote` under its plan chips for exactly this
 * job (THE-164); `groups` gets the same field, minimally — no bullet text,
 * no `tiers`, no other feature block touched.
 * ---------------------------------------------------------------- */

describe('THE-180 — Community Groups names its tier floor', () => {
  const groupsFeature = CATEGORIES.flatMap((c) => c.features).find((f) => f.id === 'groups')!;

  it('the Community Groups feature block states its tier floor', () => {
    // 🔴 The change: a tiersNote, the same field and the same job `docs` uses.
    expect(groupsFeature.tiersNote, 'groups has no tiersNote').toBeDefined();
    expect(groupsFeature.tiersNote).toMatch(/Ministry/);
    expect(groupsFeature.tiersNote).not.toMatch(/\bevery\s+plan\b/i);

    // Rendered under the plan chips, not just present on the object.
    const html = words(render(React.createElement(
      MemoryRouter, null, React.createElement(FeatureBlock, { feature: groupsFeature }),
    )));
    expect(html).toContain('Channels and direct messages are on Ministry only');
  });

  it('no surface claims Community Groups on every plan', () => {
    // The whole-site scan already polices this; re-affirm it here including the
    // new tiersNote text itself — a qualifier that mis-claims "every plan"
    // would be worse than the silence it replaced.
    const offenders = everyPlanClauses
      .filter(([, c]) => /\bcommunit(y|ies)\b|\bgroups?\b/i.test(withoutFeed(c)))
      .map(([where, c]) => `${where}: "${c}"`);
    expect(offenders, 'Community Groups is Ministry-only').toEqual([]);

    expect(chipsOf('groups')).toEqual({ Individual: false, 'Small Team': false, Ministry: true });
    expect(cardText('plus')).not.toMatch(/community groups/i);
    expect(cardText('pro')).not.toMatch(/community groups/i);
    expect(cardText('max')).toMatch(/community groups/i);
  });

  it('Community Groups is not removed from the site', () => {
    // 🔴 The over-correction guard — naming a floor is not licence to cut the
    // feature, the same distinction THE-164 drew for Notes.
    expect(groupsFeature.name).toBe('Groups');
    expect(groupsFeature.admin.length).toBeGreaterThan(0);
    expect(groupsFeature.member.length).toBeGreaterThan(0);
    expect(groupsFeature.oneliner.length).toBeGreaterThan(0);

    // Its section still renders on the category page, under its own anchor.
    const raw = render(React.createElement(
      MemoryRouter, null, React.createElement(FeatureBlock, { feature: groupsFeature }),
    ));
    expect(raw).toContain('id="groups"');
    expect(words(raw)).toContain(groupsFeature.title);

    // Still a row in the comparison grid (unlike Docs & Notes, which THE-163
    // deliberately removed from this same grid).
    const row = gridRows.find((r) => r.label === 'Community Groups');
    expect(row, 'Community Groups row was removed from the comparison grid').toBeDefined();

    // Still in the mega-menu catalogue — a tier claim and a catalogue entry
    // are different objects (PR 59), and this change touched neither CATALOG
    // nor its entry.
    expect(CATALOG.flatMap((g) => g.items.map((i) => i.title))).toContain('Groups');

    // Still sold on the plan that actually has it.
    expect(cardText('max')).toMatch(/community groups/i);
  });

  it('the comparison grid still marks it Ministry only', () => {
    expect(gridClaim('Community Groups', 'Individual')).toBe('excluded');
    expect(gridClaim('Community Groups', 'Small Team')).toBe('excluded');
    expect(gridClaim('Community Groups', 'Ministry')).toBe('included');
  });

  it('the news feed is still claimed on every plan', () => {
    // 🔴 The over-correction guard from the other direction — the feed is
    // /community_posts, a different product from Community Groups, and is
    // genuinely on every plan.
    expect(chipsOf('feed')).toEqual({ Individual: true, 'Small Team': true, Ministry: true });
    for (const name of plans.map((p) => p.name)) {
      expect(gridClaim('News Feed', name), `${name} lost the news feed`).toBe('included');
    }
    expect(FAQS.find((f) => f.id === 'pricing')!.answer.join(' ')).toMatch(/news feed/i);
  });

  it('the tool count is unchanged at its derived value', () => {
    // CATALOG is untouched — this change only added a tiersNote to one entry
    // in content/features.ts.
    expect(CATALOG_TOOL_COUNT).toBe(27);
    expect(CATALOG_TOOL_COUNT).toBe(
      CATALOG.reduce((n, g) => n + g.items.filter((it) => !it.soon).length, 0),
    );
  });

  it('plan prices and the annual discount are unchanged', () => {
    // 🔴 Data and rendered cards both. Nine stored prices, three terms; the
    // badges are 15% and 30% and are NOT computed from the prices.
    expect(plans.map((p) => p.price.monthly)).toEqual([20, 40, 80]);
    expect(plans.map((p) => p.price.quarterly)).toEqual([54, 108, 216]);
    expect(plans.map((p) => p.price.yearly)).toEqual([190, 380, 760]);
    expect(ADVERTISED_DISCOUNT_PCT).toEqual({ quarterly: 10, yearly: 20 });
    for (const p of plans) {
      for (const term of BILLING_TERMS) {
        // The card's headline is the CHARGED figure for the term, never a
        // per-month equivalent of it.
        expect(words(render(React.createElement(PlanCard, { plan: p, term })))).toContain(`$${p.price[term].toLocaleString()}`);
      }
    }
  });

  it('the cross-repo price contract still throws when a price disagrees', () => {
    const PRICING_SRC = readFileSync(fileURLToPath(new URL('../components/Pricing.tsx', import.meta.url)), 'utf8');
    // Same assertions as Pricing.test.ts, restated here because this change is
    // the one that could have loosened them. The contract now compares the
    // TABLE — nine cells against nine — rather than the output of a multiplier,
    // and it is exercised by MUTATION rather than only by pattern-matching its
    // source: handing it a wrong table must throw.
    expect(PRICING_SRC).toMatch(/^planPriceContract\(plans\);$/m);
    expect(PRICING_SRC).toMatch(/const EXPECTED_PLAN_PRICES: Record<string, Record<BillingTerm, number>> = \{/);
    expect(PRICING_SRC).toMatch(/throw new Error\(/);
    expect(PRICING_SRC).not.toMatch(/console\.(warn|error)\(/);
    expect(() =>
      planPriceContract(plans, {
        plus: { monthly: 20, quarterly: 54, yearly: 190 },
        pro: { monthly: 40, quarterly: 108, yearly: 380 },
        max: { monthly: 80, quarterly: 216, yearly: 761 },
      }),
    ).toThrow(/Ministry.*yearly/);
    expect(() => planPriceContract(plans)).not.toThrow();
  });
});
