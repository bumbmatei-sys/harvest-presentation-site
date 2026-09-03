/* Harvest Scheduler — the content behind /features/harvest-scheduler.
 *
 * 🔴 NOTHING HERE IS BUILT. This module sits under the same rule as
 * content/coming-soon.ts, and it reuses that file's guard rather than growing a
 * second one: `PURCHASABILITY_PATTERNS` runs over every string this file
 * exports, at module scope, so a price, a date or a call to action fails the
 * PRERENDER rather than merely a test. Six false-claim incidents have already
 * been corrected on this site and four of them were add-on prices that
 * disagreed with Dodo — see the docblock in content/coming-soon.ts.
 *
 * ⚠️ THERE IS NO DODO PRODUCT FOR THIS, which is why the ban is on a price
 * rather than on a wrong price. THE-253 fixed the defect where buying the AI
 * Assistant add-on granted nothing; creating a product for a feature that does
 * not exist would rebuild it deliberately. A price becomes possible only once
 * the feature and its Dodo product both exist, and neither does.
 *
 * ─── 🔴 THE SCOPE IS A WHITELIST, NOT A BLACKLIST ────────────────────────────
 *
 * `PLATFORMS` and `AD_NETWORKS` are the founder's decision, taken from the
 * provider's own capability list, and `schedulerContract` asserts them by
 * EQUALITY. That is deliberate: a blacklist of the platforms that are out of
 * scope would have to name them, and naming them here is exactly what was
 * forbidden — "do not list them, do not show their logos, and do not describe
 * them as coming later". A whitelist keeps the excluded names out of the source
 * tree entirely, and still fails the build the moment a tenth destination
 * appears. The sweep for the excluded names lives in
 * pages/the-284-harvest-scheduler.test.ts, where the names are never spelled
 * either — see the note at the top of that file.
 *
 * ⚠️ TWO SEPARATE REASONS FOR AN ABSENCE, and they are not the same reason.
 * Some platforms are out of scope permanently ("these never. Not relevant.").
 * Two more are out because they bill per message or per call as a pass-through,
 * so either could cost a church more than the whole feature: those need a
 * pricing model, not time. Neither group is named anywhere on the site, and
 * neither is described as coming later — which is why this file has no "not
 * offered" list at all, only the nine that are.
 *
 * ─── NO RATES, QUOTAS OR FREE TIERS. AT ALL ──────────────────────────────────
 *
 * The founder's instruction names one of the provider's meters and the size of
 * its monthly allowance, and ends "They don't need to know that."
 *
 * ⚠️ THE FIGURE IS DELIBERATELY NOT REPRODUCED, not even in this comment. A
 * number written down to explain why it must not be written down is still a
 * number in a public repository, one copy-paste from a page — and this file is
 * swept for exactly that shape in pages/the-284-harvest-scheduler.test.ts, which
 * caught an earlier draft of this paragraph quoting it in full.
 *
 * So: nothing here describes per-account pricing, message allowances, ad meters
 * or an allowance that runs out. The provider's pricing page is how Harvest
 * works out what this costs; it is not something a church reads.
 *
 * ─── AND NO API IS NAMED ─────────────────────────────────────────────────────
 *
 * The capabilities below are what a church admin would DO. The endpoints that
 * would enable them are what Harvest consumes to build it, and a church admin
 * never calls one: listing them makes a church product read like a developer
 * product. "Webhooks" is on the offered list and is developer language too, so
 * it is said the way a church experiences it — the dashboard keeping up on its
 * own — rather than by its name. */

import { PURCHASABILITY_PATTERNS, SCHEDULER_HREF, SCHEDULER_NAME, SCHEDULER_SLUG } from './coming-soon';

/* Re-exported so the page and its tests read one module rather than two. The
   path itself is declared in content/coming-soon.ts — see the note there for
   why it is not declared here. */
export { SCHEDULER_HREF, SCHEDULER_NAME, SCHEDULER_SLUG };

/** The board card this page describes — the founder's own, on the Harvest
 *  board, at status "some day". Every claim on the page traces here. */
export const SCHEDULER_REF = '86bbu5q9m';

/** The one sentence the page has to carry wherever a visitor could arrive
 *  mid-page. Shared with the tests rather than written twice. */
export const SCHEDULER_NOTICE =
  'Nothing on this page is built, dated or for sale. It is a feature Harvest would run itself, written down in public so you can see the shape of it before it exists.';

/* ── Where a post would go ────────────────────────────────────────────────── */

export interface Destination {
  name: string;
  /** simple-icons slug for the hotlinked mark. `null` falls back to a favicon
   *  lookup — the same two-branch resolver the integrations row already uses.
   *  🔴 NO LOGO FILE IS VENDORED. Board card 86bbrgp08 records why: shipping a
   *  third party's trademark with no licence, on a page under Harvest's name.
   *  The mark is hotlinked and `alt` is empty, so a blocked or missing image
   *  degrades to the name in text and leaks no trademark into the markup. */
  slug: string | null;
}

/** The six platforms a post would reach. Founder's list, and the whole list. */
export const PLATFORMS: readonly Destination[] = [
  { name: 'Instagram', slug: 'instagram' },
  { name: 'TikTok', slug: 'tiktok' },
  { name: 'YouTube', slug: 'youtube' },
  { name: 'Facebook', slug: 'facebook' },
  { name: 'Threads', slug: 'threads' },
  { name: 'Bluesky', slug: 'bluesky' },
];

/** The three ad networks a boosted post or a campaign would run on. */
export const AD_NETWORKS: readonly Destination[] = [
  { name: 'Meta Ads', slug: 'meta' },
  { name: 'Google Ads', slug: 'googleads' },
  { name: 'TikTok Ads', slug: 'tiktok' },
];

/* ── What a church would be able to do ────────────────────────────────────── */

export interface Capability {
  /** In-page anchor and jump-to key. */
  id: string;
  /** Lucide icon name, resolved through components/icons.tsx. */
  icon: string;
  /** The jump-to index label — short enough to sit in a narrow card. */
  name: string;
  /** The card heading, written as the church's problem rather than a feature. */
  title: string;
  /** One paragraph, in the conditional throughout. */
  body: string;
  /** What it would cover. Not ticks — see the note in ComingSoonBlock.tsx. */
  bullets: string[];
}

export const CAPABILITIES: readonly Capability[] = [
  {
    id: 'publishing', icon: 'calendar-clock', name: 'Schedule & publish',
    title: 'Write it once, and let Sunday post itself.',
    body: 'One composer, one picture, one caption — and it goes out to every account your church runs, at the time you chose, without a volunteer opening six apps on a Sunday morning.',
    bullets: [
      'A post written once and sent to every account you have connected',
      'The first comment queued with the post, so the link is not left out of the caption',
      'A month calendar you can look at, and a queue that keeps the order',
      'Pictures and video uploaded once and reused across the accounts that take them',
    ],
  },
  {
    id: 'analytics', icon: 'chart-column', name: 'Analytics',
    title: 'What Sunday actually reached, in one place.',
    body: 'How far a post travelled, how many people it reached and whether the account grew — read beside the post that earned it, rather than screenshotted out of five apps on a Monday.',
    bullets: [
      'Impressions and reach on the post they belong to',
      'Engagement counted the same way across every account',
      'Follower numbers tracked over time rather than checked by memory',
    ],
  },
  {
    id: 'messaging', icon: 'inbox', name: 'Messages',
    title: 'The message a visitor sent on Friday, answered.',
    body: 'Direct messages read and answered from inside the admin, so the person asking about the service time gets a reply from the church rather than from whoever happened to have the password.',
    bullets: [
      'Messages read in the admin, in one list',
      'Replies sent from the church account, not a volunteer\'s phone',
      'The conversation kept where the rest of your admin work happens',
    ],
  },
  {
    id: 'comments', icon: 'message-square', name: 'Comments & reviews',
    title: 'Nobody has to remember which app the comment was on.',
    body: 'Comments on your posts and reviews of your church, gathered and answered in one place — the difference between a question answered on Sunday evening and one nobody sees until Thursday.',
    bullets: [
      'Comments on every account, in one list',
      'Replies posted back to the account the comment was left on',
      'Reviews of your church read and answered in the same place',
    ],
  },
  {
    id: 'ads', icon: 'megaphone', name: 'Ads',
    title: 'Boost the Easter post without leaving the screen you wrote it on.',
    body: 'Putting money behind a post, or running a proper campaign, from the same place the post was written — instead of a separate manager nobody on the team has the login for.',
    bullets: [
      'Boost a post that is already doing well',
      'Build a campaign rather than only promoting a single post',
      'Run it on the networks your church already reaches people on',
    ],
  },
  {
    id: 'live', icon: 'zap', name: 'Live updates',
    title: 'Your dashboard keeps up on its own.',
    body: 'When a post goes out, a comment arrives or somebody sends a message, the admin would know at that moment — not the next time a volunteer opens the page and refreshes it.',
    bullets: [
      'A scheduled post that has gone out says so, without a refresh',
      'A new comment or message appears as it lands',
      'Something that failed to send says so at the time, not on Monday',
    ],
  },
];

/* ── Per-post options ─────────────────────────────────────────────────────── */

export interface PostOption { id: string; icon: string; title: string; body: string }

/** ⚠️ Each of these is a setting one PLATFORM has and the others do not, which
 *  is the whole reason a single composer is harder than it looks. The list is
 *  drawn only from platforms in `PLATFORMS`: an option belonging to a platform
 *  that is out of scope would name it by implication, which is the same leak as
 *  naming it outright. */
export const POST_OPTIONS: readonly PostOption[] = [
  {
    id: 'privacy', icon: 'lock', title: 'Who can see it, on TikTok',
    body: 'A TikTok post can go out publicly, to followers, or privately while somebody senior checks it first. That choice belongs to TikTok, so it would appear on the TikTok version of a post and nowhere else.',
  },
  {
    id: 'titles', icon: 'pen-line', title: 'A title and a description, for YouTube',
    body: 'A YouTube video needs both where an Instagram photo needs neither. The composer would ask for what each destination actually wants, instead of one box that has to suit all of them at once.',
  },
  {
    id: 'media', icon: 'image', title: 'Upload the picture once',
    body: 'Photographs and video uploaded once and carried to every account that takes them, at the size each one wants, rather than exported five times by the person with the camera.',
  },
  {
    id: 'queue', icon: 'list-checks', title: 'A queue, and a calendar',
    body: 'A month grid you can look at and a queue that holds the order, so the team can see what goes out on Sunday before Sunday — and move it without rewriting it.',
  },
];

/* ── The contract ─────────────────────────────────────────────────────────────
 *
 * ⚠️ EXPORTED **AND** CALLED AT MODULE SCOPE — the shape `comingSoonContract`,
 * `addOnPricingContract` and `dodoAddOnCatalogContract` all already use, and for
 * both of its properties: called at module scope a violation throws during
 * `vite-react-ssg build`, so the page cannot ship; exported, it can be handed
 * MUTATED input, so a test can prove it still has teeth rather than asserting
 * that its source text is present.
 *
 * ⚠️ IT RUNS OVER THIS FILE'S COPY ONLY. The rendered page is checked
 * separately in pages/the-284-harvest-scheduler.test.ts — a claim is not a
 * claim until something draws it. */

/** Every string on this page a visitor can read. */
export function schedulerCopy(): string[] {
  return [
    SCHEDULER_NAME, SCHEDULER_NOTICE,
    ...PLATFORMS.map((p) => p.name),
    ...AD_NETWORKS.map((a) => a.name),
    ...CAPABILITIES.flatMap((c) => [c.name, c.title, c.body, ...c.bullets]),
    ...POST_OPTIONS.flatMap((o) => [o.title, o.body]),
  ];
}

/** The plan names, which must never be attached to unbuilt work. Same list as
 *  `TIER_WORDS` in content/coming-soon.ts, and case-sensitive for the same
 *  reason: "ministry" is an ordinary word on a church site and "Ministry" is a
 *  plan. */
const TIER_WORDS = /\b(Individual|Small Team|Ministry|Forever Free)\b/;

/**
 * Throws on anything that would make this unbuilt feature read as purchasable,
 * dated, tiered — or as reaching a destination the founder did not approve.
 */
export function schedulerContract(
  platforms: readonly Destination[] = PLATFORMS,
  adNetworks: readonly Destination[] = AD_NETWORKS,
  copy: string[] = schedulerCopy(),
): void {
  for (const text of copy) {
    for (const [label, pattern] of PURCHASABILITY_PATTERNS) {
      if (pattern.test(text)) {
        throw new Error(`Harvest Scheduler copy carries ${label}: "${text}"`);
      }
    }
    if (TIER_WORDS.test(text)) {
      throw new Error(`Harvest Scheduler copy names a plan tier against unbuilt work: "${text}"`);
    }
  }

  /* 🔴 EQUALITY, NOT `includes`. A subset check would pass a tenth destination
     added beside the nine, which is the only way an out-of-scope platform ever
     reaches this page. Order is checked too, so the page and this list cannot
     drift into two different orders. */
  const SIX = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'Threads', 'Bluesky'];
  const THREE = ['Meta Ads', 'Google Ads', 'TikTok Ads'];
  const got = platforms.map((p) => p.name);
  const gotAds = adNetworks.map((a) => a.name);
  if (got.length !== SIX.length || got.some((n, i) => n !== SIX[i])) {
    throw new Error(`Harvest Scheduler platforms are not the six the founder approved: ${got.join(', ')}`);
  }
  if (gotAds.length !== THREE.length || gotAds.some((n, i) => n !== THREE[i])) {
    throw new Error(`Harvest Scheduler ad networks are not the three the founder approved: ${gotAds.join(', ')}`);
  }

  if (!/^86[a-z0-9]{7}$/.test(SCHEDULER_REF)) {
    throw new Error('Harvest Scheduler has no board reference; every claim must trace to a card.');
  }

  const ids = [...CAPABILITIES.map((c) => c.id), ...POST_OPTIONS.map((o) => o.id)];
  if (new Set(ids).size !== ids.length) {
    throw new Error('Harvest Scheduler ids must be unique — they are in-page anchors.');
  }
}

// Armed. A violation fails the prerender, not merely a test.
schedulerContract();
