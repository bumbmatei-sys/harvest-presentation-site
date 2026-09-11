/* Solutions section — /solutions/<slug>.
 *
 * Board card 86bbyv8pp. Three pages are planned (Evangelistic Organizations,
 * Churches, Individual Missionaries); this ships the first two. `SOLUTIONS` is
 * the whole list the Nav dropdown reads, so a later page needs no Nav edit —
 * only a new entry here plus its own route in App.tsx.
 *
 * `SolutionPage.tsx` is data-driven: it takes a `slug` prop and reads
 * `SOLUTION_PAGES[slug]` for every section, rather than importing one page's
 * content directly. A page's content export (`EVANGELISTIC_ORGANIZATIONS`,
 * `CHURCHES`) is never imported outside this file except by `SOLUTION_PAGES`
 * itself and this file's own tests.
 *
 * Every string the page prints lives in this file, not inline in JSX — the
 * same discipline content/features.ts and content/coming-soon.ts already use.
 * Feature references are IDs, resolved against the flag-filtered `CATEGORIES`
 * export the same way CategoryPage.tsx resolves them — never against
 * `ALL_CATEGORIES`, so a hidden or flagged-off feature id fails to resolve
 * rather than silently rendering a section this site does not sell.
 *
 * ⚠️ NO PLAN IS NAMED ANYWHERE ON THIS PAGE, per the founder's decision. Every
 * trial and pricing CTA points at `/#pricing` rather than a specific plan. */

export const SOLUTIONS_BASE = '/solutions';
export const solutionHref = (slug: string) => `${SOLUTIONS_BASE}/${slug}`;

export interface Solution {
  slug: string;
  /** Shown as the Nav dropdown item's title. */
  name: string;
  /** The Nav dropdown item's one-line description. */
  description: string;
}

export const SOLUTIONS: readonly Solution[] = [
  {
    slug: 'evangelistic-organizations',
    name: 'Evangelistic Organizations',
    description: 'Count every decision for Jesus, and follow up with every one.',
  },
  {
    slug: 'churches',
    name: 'Churches',
    description: 'Run Sunday, gather your people and fund the mission in one app.',
  },
];

/* ── Evangelistic Organizations — every string on the page, verbatim ──────── */

export interface OneAppTab {
  id: string;
  label: string;
}

export const EVANGELISTIC_TABS: readonly OneAppTab[] = [
  { id: 'donation', label: 'Giving' },
  { id: 'fundraising', label: 'Fundraising' },
  { id: 'pledges', label: 'Pledges' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'crm', label: 'CRM' },
  { id: 'blog', label: 'Blog' },
  { id: 'feed', label: 'Feed' },
  { id: 'courses', label: 'Courses' },
];

export interface NumberTile { label: string; body: string }
export const EVANGELISTIC_NUMBERS: readonly NumberTile[] = [
  { label: 'Decisions for Jesus', body: 'By city and country' },
  { label: 'New signups', body: 'For any time window' },
  { label: 'Countries reached', body: 'Click in for detail' },
  { label: 'CSV export', body: 'Includes your own onboarding questions' },
];

export interface PocketTile { id: string; title: string; body: string }
export const EVANGELISTIC_POCKET: readonly PocketTile[] = [
  { id: 'pwa', title: 'Your app on their home screen.', body: 'It installs in seconds. No app store, no account to create.' },
  { id: 'bible', title: 'The whole Bible.', body: 'Eight translations, highlighting and one-tap sharing. They never have to leave your app to read Scripture.' },
  { id: 'courses', title: 'Discipleship on video.', body: 'Your teaching videos become step-by-step courses with quizzes, and every finisher earns a certificate.' },
  { id: 'feed', title: 'Your voice in their feed.', body: 'Every post you publish lands in their feed with a push notification. No algorithm between you and them.' },
  { id: 'aichat', title: 'An assistant that knows your teaching.', body: "It answers their questions from your own sermons and notes, day or night. When they've asked enough, it points them back to Scripture and prayer instead of keeping them scrolling." },
  { id: 'prayer', title: 'A place to pray together.', body: 'They share a request in one line and see how many people prayed.' },
];

export interface DeepDiveGroup { heading: string; sub: string; featureIds: readonly string[] }
export const EVANGELISTIC_DEEP_DIVES: readonly DeepDiveGroup[] = [
  {
    heading: 'Fund the work.',
    sub: "Gifts, campaigns and pledges, straight to your ministry's own accounts. Harvest takes no cut.",
    featureIds: ['donation', 'sharegiving', 'fundraising', 'pledges'],
  },
  {
    heading: 'Count every decision.',
    sub: 'Every response captured, every person on one record, every city on the map.',
    featureIds: ['analytics', 'forms', 'crm'],
  },
  {
    heading: 'Show your supporters the fruit.',
    sub: 'Reports from the field on your blog and in the feed. The updates that keep supporters with you.',
    featureIds: ['blog', 'feed'],
  },
  {
    heading: 'From decision to discipleship.',
    sub: 'Courses, the full Bible and prayer. The next steps are ready the day someone says yes.',
    featureIds: ['courses', 'bible', 'prayer'],
  },
];

export interface Pillar { title: string; body: string }
export const EVANGELISTIC_PILLARS: readonly Pillar[] = [
  { title: 'Fund it', body: 'Gifts, campaigns and pledges, straight to your own accounts.' },
  { title: 'Count it', body: 'Every decision for Jesus, by city and country.' },
  { title: 'Follow it up', body: 'One record per person, and a course ready for every new believer.' },
];

export const EVANGELISTIC_RESOURCE_SLUGS: readonly string[] = [
  'work-that-outlives-you',
  'generosity-without-pressure',
  'year-end-giving-statements-what-to-include',
];

/* ── The shape every /solutions/<slug> page's content takes ─────────────────
 *
 * SolutionPage.tsx is data-driven: every section reads `SOLUTION_PAGES[slug]`
 * rather than a hardcoded export, so a second (and third) page is an entry
 * here, not a fork of the page component. `numbers` keeps its name from the
 * first page this shape was cut from — the section is generic (kicker,
 * heading, body, four tiles) but SolutionPage.test.ts already pins that
 * property name for the Evangelistic page, so it stays rather than churning a
 * passing test for a rename with no behavioural point. */
export interface SolutionPageContent {
  slug: string;
  seo: { title: string; description: string; canonical: string };
  hero: {
    eyebrow: string;
    headline: string;
    intro: string;
    secondary: { label: string; to: string };
    audience: string;
  };
  oneApp: { kicker: string; heading: string; sub: string; tabs: readonly OneAppTab[] };
  gap: { kicker: string; heading: string; body: string };
  numbers: { kicker: string; heading: string; body: string; tiles: readonly NumberTile[] };
  pocket: { kicker: string; heading: string; sub: string; tiles: readonly PocketTile[] };
  deepDives: readonly DeepDiveGroup[];
  founder: { quote: string; attribution: string };
  support: { kicker: string; heading: string; body: string; button: { label: string; to: string } };
  pillars: readonly Pillar[];
  resources: { kicker: string; slugs: readonly string[] };
  finalCta: { heading: string };
}

/* Support is identical on every solutions page today — one team, one contact
 * route — so it is one constant every page's content references rather than
 * a string repeated per page. */
export const SOLUTIONS_SUPPORT = {
  kicker: 'SUPPORT',
  heading: 'A real person, not a ticket queue.',
  body: "Questions go to the team that builds Harvest. Send us a message and we'll help you set it up.",
  button: { label: 'Contact us', to: '/contact' },
} as const;

export const EVANGELISTIC_ORGANIZATIONS: SolutionPageContent = {
  slug: 'evangelistic-organizations',
  seo: {
    title: 'Harvest for Evangelistic Organizations',
    // Trimmed to the site's usual description length — see other Seo usages.
    description: 'Know how many said yes, and in which city. Walk each one into discipleship, while your supporters see the fruit and fund what comes next.',
    canonical: `https://theharvest.site${solutionHref('evangelistic-organizations')}`,
  },
  hero: {
    eyebrow: 'EVANGELISTIC ORGANIZATIONS',
    headline: 'Every decision counted.\nEvery one followed up.',
    intro: "Know how many said yes, and in which city. Walk each one into discipleship, while your supporters see the fruit and fund what comes next. One app, under your ministry's name.",
    secondary: { label: 'See pricing', to: '/#pricing' },
    audience: 'For crusade teams, outreach ministries and mission organizations.',
  },
  oneApp: {
    kicker: 'ONE APP',
    heading: 'Everything your ministry runs on, in one app.',
    sub: "Giving, campaigns, pledges, decisions, follow-up, updates and courses. One subscription, one record per person, under your ministry's name.",
    tabs: EVANGELISTIC_TABS,
  },
  gap: {
    kicker: 'THE GAP',
    heading: "Decisions get made, and that's it.",
    body: 'A name on a response card. A number in a report. Then nothing: no call, no course, no church. Harvest turns every decision into a person you can follow up.',
  },
  numbers: {
    kicker: 'THE NUMBERS',
    heading: 'Stop wasting hours counting decisions. The numbers are already there.',
    body: 'No more tallying response cards into spreadsheets. Everyone who joins your app answers your faith question, and the count is waiting on your dashboard, by city and country, every time you open it.',
    tiles: EVANGELISTIC_NUMBERS,
  },
  pocket: {
    kicker: 'IN THEIR POCKET',
    heading: 'Everything a new believer needs, the day they say yes.',
    sub: 'The moment someone joins, your ministry goes home with them. Scripture, teaching and your voice, one tap away.',
    tiles: EVANGELISTIC_POCKET,
  },
  deepDives: EVANGELISTIC_DEEP_DIVES,
  founder: {
    quote: "I'm an evangelist, and I serve at crusades. I've seen the gap between the moment someone says yes and the follow-up that should come after it. I built Harvest to close that gap, and to make it as easy as possible for every ministry doing this work.",
    attribution: 'Matei Bumb, Founder, Harvest',
  },
  support: SOLUTIONS_SUPPORT,
  pillars: EVANGELISTIC_PILLARS,
  resources: {
    kicker: 'RESOURCES',
    slugs: EVANGELISTIC_RESOURCE_SLUGS,
  },
  finalCta: { heading: 'Built for the follow-up.' },
};

/* ── Churches — every string on the page, verbatim ─────────────────────────
 * Board card 86bbyv8pp, part two. Copy is approved and final — reproduced
 * character for character, per the ticket. */

export const CHURCHES_TABS: readonly OneAppTab[] = [
  { id: 'donation', label: 'Giving' },
  { id: 'feed', label: 'Feed' },
  { id: 'checkin', label: 'Check-in' },
  { id: 'groups', label: 'Groups' },
  { id: 'services', label: 'Services' },
  { id: 'livestream', label: 'Livestream' },
  { id: 'events', label: 'Events' },
  { id: 'crm', label: 'CRM' },
];

export const CHURCHES_TILES: readonly NumberTile[] = [
  { label: 'Order of service', body: 'Durations become clock times' },
  { label: "Who's serving", body: 'Double-bookings flagged' },
  { label: 'Empty slots', body: "See who hasn't served lately" },
  { label: 'Answers', body: 'One link to accept or decline, plus a reminder' },
];

export const CHURCHES_POCKET: readonly PocketTile[] = [
  { id: 'pwa', title: 'Your app on their home screen.', body: 'It installs in seconds. No app store, no account to create.' },
  { id: 'livestream', title: 'Sunday, live from anywhere.', body: 'Watch in your app, chat, follow the sermon notes and send a prayer straight to the pastor.' },
  { id: 'bible', title: 'The whole Bible.', body: 'Eight translations, highlighting and one-tap sharing.' },
  { id: 'feed', title: 'Your voice in their feed.', body: 'Every post lands with a push notification. No algorithm between you and them.' },
  { id: 'groups', title: 'Their group, in one place.', body: 'Channels for their group and a direct line to any leader, out of the group text.' },
  { id: 'aichat', title: 'An assistant that knows your teaching.', body: 'Answers from your own sermons and notes, then points them back to Scripture and prayer.' },
];

export const CHURCHES_DEEP_DIVES: readonly DeepDiveGroup[] = [
  {
    heading: 'Fund the ministry.',
    sub: "Gifts, campaigns and pledges, straight to your church's own accounts. Harvest takes no cut.",
    featureIds: ['donation', 'sharegiving', 'fundraising', 'pledges'],
  },
  {
    heading: 'Run Sunday.',
    sub: 'The plan, the team, the door and the stream, ready before anyone arrives.',
    featureIds: ['services', 'checkin', 'livestream', 'events'],
  },
  {
    heading: 'Gather your people.',
    sub: 'A feed, a prayer wall and a place for every group, all in your app.',
    featureIds: ['feed', 'groups', 'prayer'],
  },
  {
    heading: 'Know every person.',
    sub: 'One record per person, and every admin sees only their piece.',
    featureIds: ['crm', 'dashboard', 'forms'],
  },
  {
    heading: 'Grow disciples.',
    sub: 'Courses, the full Bible and sermon notes on their screen while you preach.',
    featureIds: ['courses', 'bible', 'docs'],
  },
];

export const CHURCHES_PILLARS: readonly Pillar[] = [
  { title: 'Fund the mission', body: 'Gifts, campaigns and pledges, straight to your own accounts.' },
  { title: 'Gather them', body: 'One feed, one prayer wall, one place for every group.' },
  { title: 'Run Sunday', body: 'The plan, the team, the door and the stream.' },
];

export const CHURCHES_RESOURCE_SLUGS: readonly string[] = [
  'generosity-without-pressure',
  'year-end-giving-statements-what-to-include',
];

export const CHURCHES: SolutionPageContent = {
  slug: 'churches',
  seo: {
    title: 'Harvest for Churches',
    description: "Members, giving, check-in, groups, livestream and service planning. One subscription, one member record, one login, under your church's name.",
    canonical: `https://theharvest.site${solutionHref('churches')}`,
  },
  hero: {
    eyebrow: 'CHURCHES',
    headline: 'Everything your church runs on, in one place.',
    intro: "Members, giving, check-in, groups, livestream and service planning. One subscription, one member record, one login, under your church's name.",
    secondary: { label: 'See pricing', to: '/#pricing' },
    audience: 'For church plants, growing congregations and established churches.',
  },
  oneApp: {
    kicker: 'ONE APP',
    heading: 'One subscription instead of a stack of them.',
    sub: "Giving, check-in, groups, service planning, livestream, events and your member records. One login, one record per person, under your church's name.",
    tabs: CHURCHES_TABS,
  },
  gap: {
    kicker: 'THE PATCHWORK',
    heading: 'Too many logins to run one Sunday.',
    body: 'Giving in one tool, check-in in another, the rota in a spreadsheet and announcements in a group chat. Nobody sees the whole person, and every tool sends its own bill.',
  },
  numbers: {
    kicker: 'SUNDAY, SORTED',
    heading: "Stop chasing volunteers by text. Sunday's plan is already there.",
    body: 'Build the order of service once. Everyone on it gets an email with one link to say yes or no, and you see who has answered.',
    tiles: CHURCHES_TILES,
  },
  pocket: {
    kicker: 'IN THEIR POCKET',
    heading: 'Everything your members need, all week long.',
    sub: 'Your church goes home with them. The live service, Scripture, their group and your voice, one tap away.',
    tiles: CHURCHES_POCKET,
  },
  deepDives: CHURCHES_DEEP_DIVES,
  founder: {
    quote: "I believe a church shouldn't have to pay hundreds of dollars every month across a stack of subscriptions just to run. Through Harvest, we're helping small and medium-sized churches get on with the mission God has given them.",
    attribution: 'Matei Bumb, Founder, Harvest',
  },
  support: SOLUTIONS_SUPPORT,
  pillars: CHURCHES_PILLARS,
  resources: {
    kicker: 'RESOURCES',
    slugs: CHURCHES_RESOURCE_SLUGS,
  },
  finalCta: { heading: 'One home for your whole church.' },
};

/** Every /solutions/<slug> page's content, keyed by slug — the map
 *  `SolutionPage` reads instead of importing a page's content directly. */
export const SOLUTION_PAGES: Readonly<Record<string, SolutionPageContent>> = {
  [EVANGELISTIC_ORGANIZATIONS.slug]: EVANGELISTIC_ORGANIZATIONS,
  [CHURCHES.slug]: CHURCHES,
};
