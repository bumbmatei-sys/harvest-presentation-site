/* The Coming Soon category — /features/coming-soon.
 *
 * 🔴 NOTHING HERE IS BUILT. This file describes work that does not exist yet,
 * which makes it the highest-risk copy on the site: six false-claim incidents
 * have already been corrected here (a Church directory that did not exist, a
 * $59/mo nav figure, a 7-vs-14-day trial, a Docs & Notes row, Notes and
 * Community on every plan, and four add-on prices that disagreed with Dodo).
 * Every one of those was a claim about something that shipped. This page is a
 * whole page of claims about things that have not.
 *
 * THE SHAPE IS THE GUARD. `SoonItem` deliberately has no `tiers`, no price and
 * no call-to-action field — unlike `Feature` in content/features.ts, which has
 * all three. A coming-soon entry therefore cannot express "available on
 * Ministry" or "$12/mo" even by accident, because there is nowhere to put it.
 * `ComingSoonBlock` renders no plan chips for the same reason, and the page
 * closes with a plain note instead of the `SiteCTA` band the five live
 * category pages use (that band sells a trial).
 *
 * EVERY ENTRY IS TRACEABLE. `ref` names the open card on the Harvest board that
 * the entry describes. Nothing here was invented for the page: if a claim has
 * no card, it does not belong on this page. Statuses are the board's own —
 * none of these is In Progress, and the copy must not imply otherwise. */

import {
  AFFILIATE_PROGRAM_ENABLED, CUSTOM_DOMAIN_MARKETING_ENABLED, SMS_MARKETING_ENABLED,
} from '../lib/flags';

export interface SoonItem {
  /** In-page anchor, e.g. /features/coming-soon#languages. */
  id: string;
  /** Display name — the nav item, the page index card and the block heading. */
  name: string;
  /** Lucide icon name, resolved through components/icons.tsx. */
  icon: string;
  /** Ordinal in the page's index. Renumbered from the list, never written down. */
  n: string;
  /** The open card on the Harvest board this describes. */
  ref: string;
  eyebrow: string;
  title: string;
  /** One line on what it would be. Written in the conditional throughout. */
  oneliner: string;
  /** 🔴 What a church has TODAY instead. This is the honest half of every
   *  entry: it stops the page reading as a feature list by naming the gap. */
  today: string;
  /** What is being considered — explicitly not a commitment, and rendered
   *  under a heading that says so. */
  considering: string[];
  /** A hard boundary against a feature that already ships and could be
   *  confused with this one. Rendered prominently where present. */
  notThis?: string;
  /** The mega-menu's one-line description. */
  navDesc: string;
  /** A dedicated page for this entry, where one exists.
   *
   *  ⚠️ MOST ENTRIES HAVE NONE, and that is the norm rather than a gap. A
   *  coming-soon entry is a paragraph about a gap; a page is a lot of copy
   *  about something that does not exist, which is the riskiest thing this
   *  site can publish. One entry has one because the founder asked for it by
   *  name — "create an entire page for this, though you list it in coming soon
   *  feature section in top bar" — and it carries the same guards the entry
   *  does, in its own module-scope contract.
   *
   *  When set, the mega-menu item points here instead of at the in-page
   *  anchor, and the block on /features/coming-soon links through. The page's
   *  own jump-to index still uses the anchor, so the entry stays reachable on
   *  the page it lives on. */
  page?: string;
}

export const COMING_SOON_SLUG = 'coming-soon';
export const COMING_SOON_NAME = 'Coming Soon';
export const COMING_SOON_HREF = `/features/${COMING_SOON_SLUG}`;
export const COMING_SOON_KICKER = 'Not yet';

/* ── The one entry with a page of its own — THE-284 ────────────────────────────
 *
 * Its identity lives HERE, beside the category's, rather than in
 * content/scheduler.ts where the rest of its copy is. Not a preference: the
 * entry below links to the page, content/scheduler.ts reads this file's
 * `PURCHASABILITY_PATTERNS` to arm its own contract, and a constant in that
 * file would make the two import each other. One direction, one spelling of the
 * path, no cycle. */
export const SCHEDULER_SLUG = 'harvest-scheduler';
export const SCHEDULER_NAME = 'Harvest Scheduler';
export const SCHEDULER_HREF = `/features/${SCHEDULER_SLUG}`;

/** The one sentence the whole page has to carry, restated wherever a visitor
 *  could arrive mid-page. Exported so the page and its tests share one string
 *  rather than two that can drift apart. */
export const NOT_BUILT_NOTICE =
  'Nothing on this page is built, dated or for sale. These are the things churches keep asking for, kept in public so you can see what is missing before you decide.';

/** The label on every item's status pill. Deliberately blunt: this is the one
 *  phrase that keeps the page from reading as a feature list. */
export const NOT_BUILT_LABEL = 'Not built yet';

/** How every item's status reads, at the founder's direction — one phrase for
 *  all of them rather than a per-item stage.
 *
 *  ⚠️ FLAGGED, NOT SILENTLY ACCEPTED. On the board these items are Todo,
 *  Someday or Blocked, and several carry notes to the effect that nothing has
 *  begun ("a decision recorded", "gated on real customers", "do not start
 *  before revenue"). "In process" is therefore a warmer reading of their state
 *  than the board supports. It is paired with NOT_BUILT_LABEL on every card
 *  precisely so the pair stays honest: a church reads "Not built yet" first and
 *  "In process" second, and no date is given anywhere. */
export const IN_PROCESS_LABEL = 'In process';

const ITEMS: Omit<SoonItem, 'n'>[] = [
  {
    id: 'languages', name: 'Multiple languages', icon: 'globe', ref: 'THE-123',
    eyebrow: 'One church, several languages',
    title: 'Harvest speaks English, and only English.',
    oneliner: 'The interface would be translatable, so a congregation that worships in two languages could read the app in both.',
    today: 'Every screen, email and notification is English. A member who does not read English gets an English app, and there is no setting that changes it.',
    considering: [
      'Translating the member app first, where most of the reading happens',
      'A per-member language choice rather than one setting for the whole church',
      'Right-to-left layouts costed separately — mirroring a layout is not the same job as translating it, and assuming translation covers it is how it gets skipped',
    ],
    navDesc: 'The interface in more than English. Not built yet.',
  },
  {
    id: 'services', name: 'Service and worship planning', icon: 'church', ref: 'THE-122',
    eyebrow: 'The Sunday run sheet',
    title: 'Planning Sunday still happens in a spreadsheet and a group chat.',
    oneliner: 'An order of service your team plans together — songs, people, timings — instead of a document somebody emails round on Thursday.',
    today: 'Harvest runs events, check-in and the livestream. It does not plan the service itself: there is no order of service, no song library and no rota.',
    considering: [
      'A song library carrying keys and CCLI numbers, with chord charts attached',
      'Rehearsal scheduling with availability and blockouts, so the conflict is caught before Sunday',
      'Recurring templates, because most services are last week with three things changed',
    ],
    navDesc: 'Order of service, songs and rotas. Not built yet.',
  },
  {
    id: 'applications', name: 'Application processing', icon: 'clipboard-list', ref: 'THE-112',
    eyebrow: 'From form to decision',
    title: 'Applications arrive as email, and end up retyped into a spreadsheet.',
    oneliner: 'A review pipeline on top of the forms Harvest already collects — several reviewers scoring the same application, and the acceptance letter generated from the decision.',
    today: 'Forms collect submissions, export to CSV and link to a CRM contact. Everything after that — status, reviewer notes, the contract or the rejection — happens outside Harvest.',
    considering: [
      'A status on each submission, so an application can be somewhere rather than just received',
      'Multiple reviewers with scores and notes on one application — the part a spreadsheet handles worst',
      'The acceptance or rejection document generated from the decision, as a fixed template with merge fields',
      'No e-signature. That is a different product and pretending otherwise would be the sixth thing this site had to correct',
    ],
    navDesc: 'Review applicants and issue the decision. Not built yet.',
  },
  {
    id: 'docs', name: 'Documentation', icon: 'book-open', ref: 'THE-117',
    eyebrow: 'Proper documentation',
    title: 'There is no manual. There should be.',
    oneliner: 'A documentation site an admin can search at the moment they are stuck, instead of working it out from the interface.',
    today: 'Harvest has a contact form and an FAQ. Neither is documentation: nothing explains how a feature works, in order, in one place you can link a volunteer to.',
    considering: [
      'A separate site at its own address, so it can be indexed and linked without touching the app',
      'Written per admin task, not per screen — the question is usually "how do I take a registration", not "what is this button"',
      'A decision recorded rather than a design settled — the tool and the shape of it are both still open',
    ],
    navDesc: 'A real manual you can search. Not built yet.',
  },
  {
    id: 'website', name: 'Website builder', icon: 'blocks', ref: 'THE-59',
    eyebrow: 'The public site',
    title: 'Harvest is your app. It is not your website.',
    oneliner: 'A church site you could build and edit inside Harvest, drawing on the events, sermons and giving pages already in your account.',
    /* 🔴 THE-280 — TWO DOMAIN CLAIMS CORRECTED HERE, on the page whose whole job
       is to be the tense that is true. `today` said "What exists is branding —
       your domain, logo and colour" — a PRESENT-TENSE claim that pointing your
       own domain at Harvest works, which is exactly what THE-280 establishes it
       never did. The `considering` bullet below said "the domain a church
       already points at Harvest", which presupposes the same thing. Both are
       behind the flag rather than deleted, so the flip back restores this entry
       whole along with everything else — the file-header contract in
       lib/flags.ts. The subdomain half of the sentence is untouched and stays
       true either way. */
    today: CUSTOM_DOMAIN_MARKETING_ENABLED
      ? 'There is no website builder, no page builder and no template gallery. What exists is branding — your domain, logo and colour on the Ministry plan — and editors for your blog, documents and sermon notes. An earlier draft of our own Terms claimed a website builder and had to be corrected; this line is the correction holding.'
      : 'There is no website builder, no page builder and no template gallery. What exists is branding — your logo and colour on the Ministry plan — and editors for your blog, documents and sermon notes. An earlier draft of our own Terms claimed a website builder and had to be corrected; this line is the correction holding.',
    considering: [
      'Pages that read live from your Harvest data, so a service time is not typed in two places',
      CUSTOM_DOMAIN_MARKETING_ENABLED
        ? 'Publishing to the domain a church already points at Harvest'
        : 'Publishing to whatever address a church reaches Harvest on',
      'This one is furthest out of everything on this page',
    ],
    navDesc: 'A public church site, built in Harvest. Not built yet.',
  },
  {
    id: 'agent', name: 'In-app AI agent for admins', icon: 'bot', ref: 'THE-58',
    eyebrow: 'For the people running the church',
    title: 'An assistant that does the work, not one that answers questions.',
    oneliner: 'An agent working inside the admin — drafting, filing and chasing across Harvest and the tools a church has already connected.',
    today: 'Admin work is manual. Every newsletter, every follow-up and every record is typed by a person, and nothing in Harvest acts on an admin\'s behalf.',
    /* ⚠️ THE PLAN CLAUSE IS GONE, NOT REPLACED — THE-253. This read "...and it
       is part of the Small Team and Ministry plans at no extra charge", true
       when written and false the moment `aiChat` came off every tier.
       🔴 AND THE CORRECTED FACT CANNOT BE STATED HERE. The chat is now a paid
       add-on, and `comingSoonContract` forbids a price, the word "add-on", and
       every other purchasability signal on this page — deliberately, because
       nothing unbuilt may read as buyable. Naming the new arrangement would
       have meant weakening that guard to describe a feature that is not the
       subject of this entry.
       So the clause is dropped and the pricing lives on the pricing page, where
       it is checked against Dodo. The DISTINCTION this line exists to draw is
       untouched, and is why the sentence stays at all: AI Chat ships and
       answers members' questions; this unbuilt agent would act for an admin. */
    notThis: 'This is not AI Chat, which already ships. AI Chat is for your members: it answers their questions from your own teaching. This one would be for your staff, it would take actions rather than answer questions, and it does not exist.',
    considering: [
      'Acting across the admin surfaces rather than talking about them',
      'Reaching the tools a church has already connected, not just Harvest\'s own data',
      'Months of work, sitting behind the things churches are paying for today',
    ],
    navDesc: 'An admin-side agent that acts. Not built yet.',
  },
  {
    id: 'identity', name: 'One login, many churches', icon: 'user-check', ref: 'THE-118',
    eyebrow: 'People belong to more than one',
    title: 'A person at two churches needs two accounts.',
    oneliner: 'One identity that carries across churches, with a separate role at each — a worship leader at one and a member at another, signing in once.',
    today: 'Accounts are per church. Somebody who serves at two has two logins and two profiles, and nothing connects them.',
    considering: [
      'A single identity with per-church membership and roles hanging off it',
      'Existing accounts migrated first, so nobody has to start again',
      'Security-critical and weeks of work. It is a permissions rewrite, and the risk of getting it wrong is one church seeing another\'s data',
    ],
    navDesc: 'One account across several churches. Not built yet.',
  },
  {
    id: 'designations', name: 'Fund designations on giving', icon: 'hand-heart', ref: 'THE-98',
    eyebrow: 'Where the gift is going',
    title: 'A donor can give, but cannot say what for.',
    oneliner: 'Funds a church configures — General, Missions, Building, Benevolence — that a donor picks at the moment of giving and that follow the gift into every report.',
    today: 'Giving goes to one undesignated pot. A church that runs a building fund tracks it outside Harvest, or asks donors to write it in a note.',
    considering: [
      'Funds the church defines, rather than a fixed list we choose',
      'The designation carried into receipts, statements and exports — a fund that only exists on the giving page is worse than none',
      'It touches every path that writes a donation, so it is not a small change',
    ],
    navDesc: 'Give to a specific fund. Not built yet.',
  },
  {
    id: 'sms', name: 'SMS & Text-to-Give', icon: 'message-square-text', ref: 'THE-245',
    eyebrow: 'Texting the church, and giving by text',
    title: 'Harvest does not text your congregation yet.',
    oneliner: 'Broadcasts to your members, donors or a tag on your own Twilio account — and a keyword a member texts to your number to get their giving link back.',
    today: 'Nothing in Harvest sends a text. There is no broadcast composer, no automated reminder, and no keyword a member can text you. Giving happens on your branded donation page, from a link or a QR code you print or put on a slide, and every gift still writes a receipt and a CRM record the same way. Check-in, event registration and pledges confirm by email.',
    considering: [
      'Your own Twilio account rather than messages resold through us, so the per-message rate is the one you negotiate and the relationship is yours',
      'A recipient count and a segment cost shown before anything is sent — a broadcast is the one action where finding out afterwards is too late',
      'A keyword that answers with your giving link, so the closing slide can say "text one word" instead of spelling out a URL',
      'US numbers first. Per-segment rates vary about tenfold by country and pretending otherwise is how a church gets a bill it did not expect',
    ],
    notThis: 'This is not the donation page, which already ships and is how a church takes a gift today. Nor is it the newsletter, which sends real email through your own Mailchimp audience on the Small Team and Ministry plans. What is missing is the messaging itself, in both directions.',
    navDesc: 'Broadcasts and giving by text. Not built yet.',
  },
  {
    id: 'affiliate', name: 'Affiliate referrals', icon: 'share-2', ref: 'THE-97',
    eyebrow: 'If a church came through your link',
    title: 'Harvest has no affiliate programme right now.',
    oneliner: 'A link you could share, paying you 30% of what a church that joins through it actually pays for its plan — every payment it makes in the twelve months from its first.',
    today: 'Nothing pays a share for a referral today. There is no place to ask for a link, nothing that reports what a link has brought in, and no money moving either way. Links shared while the programme was advertised are still recognised when someone arrives on one, so an old link keeps recording where a visitor came from — and nothing is calculated or paid against it.',
    considering: [
      'What happens when a church moves up or down a plan, or leaves partway through the year',
      'Plans only. The share would be worked out on what a church pays for its plan, and on nothing else it pays Harvest',
      'How a link would be issued, how a share would be tracked and how the money would reach the person who earned it are all still open — which is why none of it is described here',
    ],
    notThis: 'This is not a cut of anything your church receives. Giving on Harvest carries no platform fee at all on any paid plan, and every gift lands in your church\'s own Stripe account — that ships today and is unchanged. What is described here would come out of what a referred church pays Harvest for its own plan, and would go to whoever referred them.',
    navDesc: 'A share of what your referrals pay. Not built yet.',
  },
  {
    id: 'domains', name: 'Custom domains', icon: 'link', ref: 'THE-280',
    eyebrow: 'An address of your own',
    title: 'Your app lives at a Harvest address, not one you own.',
    oneliner: 'A domain you already own pointed at your Harvest app, so a member would read give.yourchurch.org in the address bar rather than an address with ours in it.',
    today: 'Every church is served on its own Harvest subdomain — yourchurch.theharvest.app — and that address works, is yours alone, and carries your name, logo and colour on the Ministry plan. What does not work is pointing a domain you own at it. The setting was there and was never switched on behind the scenes, so a church that saved a domain was shown DNS records that pointed nowhere and verification never finished. Anything already saved is still saved; the panel that offered it is what came down.',
    considering: [
      'Root domains and subdomains of them alike — yourchurch.org and give.yourchurch.org need different DNS records, and a church should not have to know which',
      'The exact records generated from what was entered rather than one fixed example, because the wrong record type silently never verifies',
      'A verification state a church can read, so a domain part-way through pointing says so instead of looking finished',
      'It rests on hosting the platform does not pay for yet, which is the whole reason the panel came down rather than being left to fail quietly',
    ],
    notThis: 'This is not your Harvest subdomain, which ships: every church already has yourchurch.theharvest.app and nothing about it changes. Nor is it branding — your name, logo, icon and colour reach your app, your receipts and your certificates on the Ministry plan, and that is untouched. What is missing is only the domain you own yourself.',
    navDesc: 'Point a domain you own at Harvest. Not built yet.',
  },
  {
    id: 'scheduler', name: SCHEDULER_NAME, icon: 'calendar-clock', ref: '86bbu5q9m',
    page: SCHEDULER_HREF,
    eyebrow: 'One post, every account',
    title: 'Sunday gets posted six times, from six different phones.',
    oneliner: 'One place to write a post, put it on a calendar and send it to every account your church runs — and to read what comes back.',
    today: 'Nothing in Harvest reaches a social account. A volunteer opens each app in turn, pastes the same caption, crops the same picture again, and answers comments wherever they happen to land. Harvest posts to your own community feed and sends your newsletter through your own Mailchimp audience — neither of those is a social account, and nothing in the admin can see a comment left on one.',
    considering: [
      'One composer that writes a post once and sends it to every account a church has connected, with the picture and the first comment attached',
      'A month calendar and a queue, so a team can see what goes out on Sunday before Sunday',
      'Comments and messages read and answered from inside the admin, rather than in whichever app they landed in',
      'Reach, impressions and follower counts read beside the post that earned them, instead of screenshotted out of five apps',
      'Boosting a post, or running a campaign, from the same screen the post was written on',
      'A dashboard that keeps up on its own, so a post that has gone out or a comment that has arrived shows without anyone refreshing',
      'Which destinations are worth carrying is a question about what each one costs to reach, not only about who is on it — and it is a decision rather than a list',
      'It would rest on a posting platform Harvest does not run, which is the part that decides what is possible and what it costs',
    ],
    notThis: 'This is not the community feed, which already ships: that is your own audience inside your own app, with no algorithm deciding who sees Sunday\'s post, and none of it changes. Nor is it the newsletter, which sends real email through your own Mailchimp audience. What is missing is the accounts your church runs on somebody else\'s platform, and everything that comes back through them.',
    navDesc: 'Post to every account from one place. Not built yet.',
  },
];

/** The list as the page renders it, with the index ordinal derived from
 *  position — the same reason `content/features.ts` renumbers `n` after its
 *  filter, so removing an entry can never leave 1, 2, 4. */
export const COMING_SOON_ITEMS: SoonItem[] = ITEMS
  /* 🔴 THE-245 — SMS is here BECAUSE it is hidden in the app, so it has to leave
     again the moment it is not. A capability that ships while this page still
     lists it as unbuilt is the same claim made twice, in two tenses, and this
     page's whole job is to be the tense that is true. The filter runs before the
     renumber for the reason the map below already exists: removing an entry must
     never leave the index reading 1, 2, 3, 4, 5, 6, 7, 8, 10. */
  .filter((item) => item.id !== 'sms' || !SMS_MARKETING_ENABLED)
  /* 🔴 THE-252 — the affiliate entry is here on the SAME TERMS, and for the same
     reason. AFFILIATE_PROGRAM_ENABLED already hides a landing section, a footer
     link, a mega-menu tool, a feature entry and a line of SEO copy that between
     them advertise a live programme with a rate, a year and a "become an
     affiliate" button. Turning that flag on while this entry still stood would
     put the same programme on the site twice, in two tenses — sold on the
     landing page, unbuilt here — which is exactly what the `sms` filter above
     exists to prevent. One flag, one tense, either way it is set. */
  .filter((item) => item.id !== 'affiliate' || !AFFILIATE_PROGRAM_ENABLED)
  /* 🔴 THE-280 — the custom-domain entry is here on the SAME TERMS as the two
     above. CUSTOM_DOMAIN_MARKETING_ENABLED rewords a live feature entry that
     sells a custom domain in its name, its title, its one-liner and four of its
     capability bullets, plus the platform-brand intro, the SEO line and the PWA
     bullet. Turning that flag on while this entry still stood would put the same
     capability on the site twice, in two tenses — sold there, unbuilt here. One
     flag, one tense, either way it is set. */
  .filter((item) => item.id !== 'domains' || !CUSTOM_DOMAIN_MARKETING_ENABLED)
  .map((item, i) => ({ ...item, n: String(i + 1) }));

/** Ids, for the tests and for anchor resolution. */
export const COMING_SOON_IDS: readonly string[] = COMING_SOON_ITEMS.map((i) => i.id);

export const soonItemHref = (id: string) => `${COMING_SOON_HREF}#${id}`;

/* ── The contract ─────────────────────────────────────────────────────────────
 *
 * ⚠️ EXPORTED **AND** CALLED AT MODULE SCOPE, which is the shape
 * `addOnPricingContract` and `dodoAddOnCatalogContract` already use in
 * components/Pricing.tsx, and it is two properties rather than one:
 *
 *   · Called at module scope, a violation throws during `vite-react-ssg build`
 *     — the page fails to prerender, so it cannot ship. A red test can be
 *     skipped; a build that will not produce the file cannot.
 *   · Exported, it can be handed MUTATED input, so a test can prove it still
 *     has teeth rather than asserting that its source text is present. A guard
 *     nobody has watched fail is a guard nobody knows works.
 *
 * ⚠️ THESE PATTERNS RUN OVER THIS FILE'S COPY ONLY. The rendered page is
 * checked separately in pages/ComingSoonPage.test.ts, because a claim is not a
 * claim until something draws it — the precedent is PR 55, where a
 * pure-function test passed while the JSX seam was mutated. */

/** Wording that would make an unbuilt feature read as a purchasable one.
 *
 * ⚠️ EXPORTED SINCE THE-284, and exported rather than copied. The Harvest
 * Scheduler page (content/scheduler.ts) is a whole page about an unbuilt
 * feature rather than one entry on this one, so it needs the same ban — and a
 * second hand-kept copy of this list is a list that drifts. One array, two
 * module-scope contracts, and a pattern added here arms both. */
export const PURCHASABILITY_PATTERNS: [string, RegExp][] = [
  ['a price', /\$\s?\d/],
  ['a per-month or per-year figure', /\b\d+\s*(\/|per\s)\s*(mo|month|yr|year)\b/i],
  ['an "included in a plan" claim', /\bincluded (in|on|with)\b|\bcomes with your plan\b/i],
  ['an availability claim', /\bavailable (on|now|from|in)\b|\bavailable to\b/i],
  ['an add-on', /\badd-?ons?\b/i],
  ['a seat', /\b(extra|additional|per-|one more)\s?seats?\b|\bassistant seat\b/i],
  ['a purchase call to action', /\b(buy|purchase|subscribe|start (your |a )?(free )?trial|upgrade now|get started)\b/i],
  // "Forever Free" is a real plan on this site, so the bare word on a page that
  // must carry no pricing signal is one careless scan away from reading as one.
  ['the word "free"', /\bfree\b/i],
  ['a delivery date', /\b(q[1-4]\s*20\d\d|by (january|february|march|april|may|june|july|august|september|october|november|december)|in \d+ (weeks|months)|next (month|quarter|year)|ship(s|ping)? (in|by|this))\b/i],
  ['a promise that it is coming', /\bwill (ship|launch|be (built|available|released))\b|\bwe promise\b|\bguarantee/i],
  /* Founder direction, encoded so it survives the next edit: every item reads
     "In process" (see IN_PROCESS_LABEL), and no bullet may undercut that by
     saying the work has not begun, or hedge it as uncommitted. */
  ['a "not started" phrasing', /\bnot started\b|\bnothing has been started\b|\bnot begun\b|\byet to (start|begin)\b/i],
  ['an "uncommitted" hedge', /\bnot committed\b|\bno commitment\b/i],
];

/** The plan names, which must never be attached to unbuilt work. */
const TIER_WORDS = /\b(Individual|Small Team|Ministry|Forever Free)\b/;

/** A board reference, in either of the two forms a card on the Harvest board
 *  actually has.
 *
 * ⚠️ WIDENED AT THE-284, AND WIDENED BECAUSE A REAL CARD DID NOT FIT. This was
 * `/^THE-\d+$/` and every entry above still matches it. The Harvest Scheduler
 * card has no `THE-` id at all — its `custom_id` is null on the board, so the
 * only name it has is its raw card id. The alternatives were both worse than
 * widening: inventing a `THE-` number would put a reference on this page that
 * resolves to nothing, and this file's rule is that nothing here is invented
 * for the page; dropping the reference would make it the one entry that traces
 * to no card.
 *
 * 🔴 IT IS STILL A WHITELIST OF TWO SHAPES, not a relaxation to "any string".
 * The raw form is pinned to the `86` prefix and the exact nine characters a
 * card id has, so a slug, a URL or a sentence still throws. */
const BOARD_REF = /^(THE-\d+|86[a-z0-9]{7})$/;

/**
 * Throws, by name, on any coming-soon entry that could be read as purchasable.
 *
 * 🔴 `today` and `notThis` are EXEMPT FROM THE TIER CHECK ONLY, and the
 * exemption is the point rather than a hole in it. Those two fields describe
 * what ALREADY SHIPS — "branding on the Ministry plan" — so a plan name in them
 * is a true statement about a live feature, and it is exactly the distinction
 * this page exists to draw.
 *
 * ⚠️ THE SECOND EXAMPLE HERE USED TO BE "AI Chat is part of Small Team and
 * Ministry", from the `agent` entry's `notThis`. THE-253 made the chat a paid
 * add-on and that clause was dropped rather than reworded — see the note at
 * that entry. The exemption is unchanged and still has one live example; it is
 * narrower in practice than it was, which is the safe direction.
 * Banning the words outright would force both sentences to be vaguer, and
 * vaguer is the one direction this page must never move. They are still held to
 * every PURCHASABILITY_PATTERNS entry.
 */
export function comingSoonContract(items: readonly SoonItem[]): void {
  for (const item of items) {
    const aboutTheUnbuiltThing = [
      item.name, item.eyebrow, item.title, item.oneliner, ...item.considering,
    ];
    const everything = [...aboutTheUnbuiltThing, item.today, item.notThis ?? '', item.navDesc];

    for (const text of everything) {
      for (const [label, pattern] of PURCHASABILITY_PATTERNS) {
        if (pattern.test(text)) {
          throw new Error(`Coming-soon item "${item.id}" carries ${label}: "${text}"`);
        }
      }
    }
    for (const text of aboutTheUnbuiltThing) {
      if (TIER_WORDS.test(text)) {
        throw new Error(`Coming-soon item "${item.id}" names a plan tier against unbuilt work: "${text}"`);
      }
    }
    if (!BOARD_REF.test(item.ref)) {
      throw new Error(`Coming-soon item "${item.id}" has no board reference; every entry must trace to an open card.`);
    }
  }

  const ids = items.map((i) => i.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error('Coming-soon ids must be unique — they are in-page anchors.');
  }
}

// Armed. A violation fails the prerender, not merely a test.
comingSoonContract(COMING_SOON_ITEMS);
