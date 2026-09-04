/* Feature catalog for the Nav Features mega-menu — the menu's labels, icons and
   grouping. Ported from the Claude Design handoff (ui_kits/website/sections1.jsx).
   Each item links to its section on the category page it belongs to; that mapping
   lives in content/features.ts, keyed by `slugify(title)`. */

import {
  AFFILIATE_PROGRAM_ENABLED, CUSTOM_DOMAIN_MARKETING_ENABLED, MULTI_CAMPUS_ENABLED,
  SMS_MARKETING_ENABLED,
} from '../lib/flags';
import {
  COMING_SOON_HREF, COMING_SOON_ITEMS, COMING_SOON_KICKER, COMING_SOON_NAME, SCHEDULER_HREF,
  soonItemHref, type SoonItem,
} from '../content/coming-soon';

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export interface CatalogItem {
  icon: string;
  title: string;
  desc: string;
  /** Not built. Excluded from CATALOG_TOOL_COUNT — see the note on it below. */
  soon?: boolean;
  /** Explicit destination. Set only by the Coming Soon group, whose items are
   *  not in LEGACY_ANCHORS: that table maps RETIRED /features#<slug> URLs onto
   *  their new home, and an unbuilt feature has no retired URL to redirect. */
  href?: string;
}
export interface CatalogGroup {
  name: string;
  kicker: string;
  tint: string;
  bg: string;
  /** Explicit destination for the column header, same reason as CatalogItem. */
  href?: string;
  items: CatalogItem[];
  /** Set only when `items` is a TRUNCATION of the group rather than the whole of
   *  it — the "see all" row the menu draws under the last item.
   *
   *  🔴 NAVIGATION, NOT A CALL TO ACTION. It is a link to a page that already
   *  exists, styled in the group's own tint with no button ground, because the
   *  one group that sets it is the unbuilt one and a button there would be the
   *  sales furniture /features/coming-soon exists to not have. */
  more?: { label: string; href: string };
}

const item = (icon: string, title: string, desc: string, soon = false): CatalogItem =>
  ({ icon, title, desc, soon });

/* ── The Coming Soon column is a SHORTLIST — THE-297 ──────────────────────────
 *
 * 🔴 FOUR OF THE TWELVE, NOT ALL TWELVE. The founder: "in marketing site at
 * features the coming soon section is too long. Make harvest scheduler first
 * then 3 more under then a see all button." The column carried every entry in
 * `COMING_SOON_ITEMS` — twelve rows against seven in the longest live category,
 * and on the phone twelve rows of unbuilt work standing between a visitor and
 * the five categories of shipped work below it.
 *
 * 🔴 THE CUT IS HERE, AND ONLY HERE. `CATALOG` is the mega-menu's model and
 * nothing else: pages/ComingSoonPage.tsx reads `COMING_SOON_ITEMS` straight from
 * content/coming-soon.ts and never goes through this file, so a truncation
 * written here CANNOT reach the page. That is the structural half of the
 * requirement — the full page keeps all twelve because there is no code path by
 * which this constant could shorten it. Putting the cut in ComingSoonBlock or in
 * the page instead would have truncated the only surface that must not be.
 *
 * It also lands in the data rather than in the renderer for the reason
 * `FeatureMenuColumns` is one component rather than two: desktop and mobile map
 * the same array in the same pass, so the column cannot end up four long on one
 * and twelve on the other.
 *
 * WHICH FOUR, AND WHY THESE.
 *
 *  · The scheduler leads, at the founder's explicit direction. It is picked out
 *    by `page` rather than by id — an id goes quietly stale on a rename, and the
 *    entry with a page of its own is unambiguous either way.
 *
 *  · The other three are named here, deliberately, rather than sliced off the
 *    top of the list. ⚠️ THE LIST'S ORDER IS NOT A RANKING: entries are
 *    APPENDED as their board cards open — the-280's suite pins exactly that,
 *    "the ELEVENTH entry, appended, not inserted" — so its first three are its
 *    oldest, which is seniority, not importance. Taking a slice would have
 *    dressed an accident of chronology up as an editorial choice.
 *
 *    The three are the broadest MINISTRY capabilities on the list: a
 *    congregation reading Harvest in its own language, a team planning Sunday,
 *    and applications handled inside the platform. Those are the gaps a church
 *    weighing this software would want named before it commits.
 *
 *    ⚠️ THE TICKET SUGGESTED sms, affiliate AND domains — the three with the
 *    most work behind them — and this rejects that suggestion, which the ticket
 *    invited ("a judgement, not an instruction"). Two reasons. Affiliate
 *    referrals is a partner revenue programme, not something a church does with
 *    its congregation, and it is thin next to service planning for one of four
 *    church-facing slots; custom domains and text-to-give are platform plumbing
 *    beside it. And those three are the entries gated by SMS_MARKETING_ENABLED,
 *    AFFILIATE_PROGRAM_ENABLED and CUSTOM_DOMAIN_MARKETING_ENABLED, which exist
 *    to REMOVE them the moment they ship — a shortlist built from the entries
 *    most likely to leave the list is the one most likely to go stale.
 *
 *    🔴 The cost is named rather than hidden: those three entries are no longer
 *    LISTED in the menu, and three suites asserted that they were. They are
 *    still published, still anchored, and still one click away through the
 *    column header and the "see all" row, which is what those suites now pin.
 *
 * FLAG-RESILIENT, AND STILL DERIVED. `FEATURED` is a preference, not a promise:
 * it is intersected with `COMING_SOON_ITEMS`, so an entry a flag has removed
 * cannot leave a menu row pointing at an anchor the page no longer renders, and
 * the column is topped back up to four from what remains. Nothing here is a
 * second copy of an entry's name, icon or link — those are read from the list,
 * for the reason the full column read them. */
export const COMING_SOON_MENU_COUNT = 4;

/** The one entry with a page of its own — see above on why `page` and not an id. */
const leadsTheColumn = (i: SoonItem) => i.page === SCHEDULER_HREF;

/** The three that follow it, in the order they are shown. */
const FEATURED: readonly string[] = ['languages', 'services', 'applications'];

const rank = (i: SoonItem) => {
  if (leadsTheColumn(i)) return -1;
  const at = FEATURED.indexOf(i.id);
  // Anything unfeatured sorts after every featured entry, keeping list order
  // among itself — it only ever appears if a flag has removed a featured one.
  return at === -1 ? FEATURED.length : at;
};

export const COMING_SOON_MENU_ITEMS: SoonItem[] = COMING_SOON_ITEMS
  .map((item, i) => ({ item, i }))
  .sort((a, b) => rank(a.item) - rank(b.item) || a.i - b.i)
  .map(({ item }) => item)
  .slice(0, COMING_SOON_MENU_COUNT);

/** The "see all" row's label. The count is read from the list rather than
 *  written down, for the same reason every other number on this page is: the
 *  three feature flags can change it, and a menu that promises twelve and
 *  delivers eleven is the small false claim this file spends its comments
 *  avoiding. */
export const COMING_SOON_MORE_LABEL = `See all ${COMING_SOON_ITEMS.length}`;

export const CATALOG: CatalogGroup[] = [
  /* 🔴 FIRST DELIBERATELY, and first is a strong claim on attention: this is
     the leftmost column of the desktop mega-menu and the first block of the
     mobile accordion, ahead of five categories of shipped work. That is what
     the founder asked for — "the sixth one placed on the left side of the
     dropdown, or on the phone the first one" — and the trade-off is called out
     in the PR rather than quietly softened here.

     GREY, NOT A COLOUR. The other five carry --sky-600, --green-600,
     --gold-600, --gold-700 and --navy-600. This one carries --text-soon, and
     the difference is the whole point: every other category is a capability a
     church can use today.

     ⚠️ THE COLUMN IS FOUR LONG, NOT TWELVE — THE-297. `items` is a shortlist and
     `more` is the "see all" row that carries the rest; both are derived from
     `COMING_SOON_ITEMS` a few lines above. The page still renders all twelve,
     and cannot stop: it does not read this file.

     ⚠️ EVERY ITEM IS `soon: true`, WHICH IS LOAD-BEARING, NOT DECORATION.
     CATALOG_TOOL_COUNT is a derived count of everything NOT marked soon, and it
     is quoted to visitors as "N tools in one platform". Advertising eight
     unbuilt features as tools in the platform would be the same false claim as
     a stale price.

     🔴 THE COUNT IS 28, AND THIS LINE SAID 28 WHILE THE MENU RENDERED 27 —
     THE-306. It was written when the derived figure really was 28 and was never
     retaken after THE-245 withdrew SMS Automation, which took it to 27; the
     comment on that very entry said "from 28 to 27" the whole time, so this
     file disagreed with itself AND with its own rendered footer. (That comment
     no longer quotes an absolute pair either, for the same reason.)
     THE-306 adds the Shareable Giving Page, a live and unflagged tool, which
     takes the derived figure 27 → 28 — so the number here is right again for a
     new reason, and is now the DERIVED one rather than a remembered one.

     ⚠️ Never restate it from memory. It is `CATALOG_TOOL_COUNT` at the foot of
     this file; the assertions live in components/the-297-coming-soon-shortlist,
     components/the-224-ai-assistant-withdrawal and components/PricingAddOns
     (twice), and components/the-306-sharegiving.test.ts pins the three — the
     figure, this comment and the assertions — against each other. */
  {
    name: COMING_SOON_NAME, kicker: COMING_SOON_KICKER,
    tint: 'var(--text-soon)', bg: 'var(--surface-soon)',
    href: COMING_SOON_HREF,
    // Derived from content/coming-soon.ts so the menu and the page cannot
    // disagree about what is on the list — the failure that a second hand-kept
    // array would eventually produce.
    /* `i.page ?? soonItemHref(i.id)` — THE-284. Every entry but one has no
       page of its own, so the menu sends a visitor to its anchor on
       /features/coming-soon, which is where its whole story is. The one entry
       that HAS a page goes there instead: sending a reader to a one-paragraph
       anchor when a page exists is the worse of the two, and the anchor stays
       reachable from that page's own jump-to index either way. */
    /* 🔴 THE-297 — the SHORTLIST, not the whole list. See the block above this
       constant for which four and why, and for why the cut can only ever reach
       the menu. `more` below carries the rest. */
    items: COMING_SOON_MENU_ITEMS.map((i) => ({
      icon: i.icon, title: i.name, desc: i.navDesc, soon: true, href: i.page ?? soonItemHref(i.id),
    })),
    more: { label: COMING_SOON_MORE_LABEL, href: COMING_SOON_HREF },
  },
  {
    name: 'Community & Engagement', kicker: 'Belong', tint: 'var(--sky-600)', bg: 'var(--sky-100)',
    items: [
      item('rss', 'Community Feed', 'Posts, comments, polls and prayer requests in a private space that belongs to your ministry.'),
      item('users', 'Groups', 'Organise members into community groups for classes, teams and small groups.'),
      item('heart-handshake', 'Prayer Requests', 'A living prayer wall where members request, pray and follow up together.'),
      item('map', 'Church Map', 'Help members find your gatherings and connect with ministries near them.'),
      item('calendar-check', 'Event Registration', 'Create events, take registrations and manage attendance in one place.'),
      item('qr-code', 'Check-In System', 'QR-based attendance check-in for services, groups and kids ministry.'),
      item('radio', 'Livestream + Live Giving', 'Stream services with live giving and sermon notes pushed to the audience in real time.'),
    ],
  },
  {
    name: 'Discipleship & Content', kicker: 'Grow', tint: 'var(--green-600)', bg: 'var(--green-100)',
    items: [
      item('book-open', 'Full Bible', 'The complete Bible with reading plans and verse sharing, built in.'),
      item('graduation-cap', 'Courses', 'Structured learning paths with lessons, video and progress tracking for real discipleship.'),
      item('pen-line', 'Blog & Publishing', 'Share teaching and devotionals with a built-in rich-text editor.'),
      item('sparkles', 'Automated SEO Blog', 'AI drafts SEO articles from your knowledge base to grow your reach.'),
      item('file-text', 'Docs & Notes', 'Keep ministry docs, sermon notes and resources organised and shareable.'),
    ],
  },
  {
    name: 'AI & Automation', kicker: 'Automate', tint: 'var(--gold-600)', bg: 'var(--gold-100)',
    items: [
      item('brain-circuit', 'AI Knowledge Base', "Train AI on your teachings so members get answers rooted in your ministry's theology."),
      item('message-square', 'AI Chat', "A contextual assistant for members — your ministry's voice, not a generic bot."),
      item('mail', 'Newsletter', 'Write a newsletter and send it through your own Mailchimp audience.'),
      item('sparkles', 'Automated Newsletter', 'AI drafts a newsletter from a month of your own Instagram posts.'),
      // Hidden FEATURE entry — THE-245. 🔴 This is one of the two things that
      // move the count: CATALOG_TOOL_COUNT is a derived tally of everything NOT
      // marked `soon`, so withdrawing this tool takes one off it. That is the
      // correct direction — the figure is quoted to visitors as "N tools in one
      // platform", and a tool a church cannot use is not one of them. The SMS
      // entry that appears in the Coming Soon column above is `soon: true` and
      // contributes nothing, which is what keeps the figure honest.
      // ⚠️ THE ABSOLUTE PAIR IS NOT WRITTEN HERE ANY MORE — THE-306. It read
      // "from 28 to 27", which was true when THE-245 wrote it and became a
      // second stale figure the moment a LIVE tool was added or removed
      // anywhere else in this file. It is now 29 → 28, and would go stale
      // again. The only figure worth quoting is the derived one, so this
      // comment names the DIRECTION and CATALOG_TOOL_COUNT names the value.
      ...(SMS_MARKETING_ENABLED ? [item('message-square-text', 'SMS Automation', 'Twilio-powered SMS flows for follow-up, reminders and care.')] : []),
      item('clipboard-list', 'Custom Forms → CRM', 'Build forms that feed straight into your CRM pipeline.'),
    ],
  },
  {
    name: 'Giving & Finance', kicker: 'Steward', tint: 'var(--gold-700)', bg: 'var(--gold-100)',
    items: [
      item('hand-heart', 'Donation Page', 'Beautiful branded giving with a 0% platform fee — you keep every dollar.'),
      /* THE-306 — the entry this column was MISSING. The founder, with a
         screenshot of the open mega-menu: "this feature doesnt appear in the
         feature section in top header bar." `sharegiving` shipped in THE-281
         with a section on this column's own category page and no row here, so a
         live, paid feature was unreachable from the navigation.

         ⚠️ IT IS NOT `soon`, so it MOVES CATALOG_TOOL_COUNT — 27 → 28. That is
         the correct direction: the figure counts tools a church can use today
         and this is one. See the note on the constant at the foot of this file.
         ⚠️ The title feeds `slugify(title)` → `shareable-giving-page`, which
         must resolve in content/features.ts's LEGACY_ANCHOR_TARGETS or the row
         falls back to the first category page. It is mapped there. */
      item('share', 'Shareable Giving Page', 'Share every way your church takes a gift — as a link, a share sheet or a QR code.'),
      item('trending-up', 'Fundraising', 'Run campaigns with goals, progress and updates for your community.'),
      item('contact', 'CRM (Donors & Members)', 'A full relationship manager for donors and members.'),
      item('calculator', 'Accounting + QuickBooks', 'Accounting tools with QuickBooks sync to keep the books clean.'),
      item('receipt-text', 'Tax Receipts & Statements', 'Automatic tax receipts and annual giving statements.'),
      ...(AFFILIATE_PROGRAM_ENABLED ? [item('share-2', 'Affiliate Program', 'Earn 30% recurring commission for 12 months on every ministry you refer.')] : []),
    ],
  },
  {
    name: 'Platform & Brand', kicker: 'Own it', tint: 'var(--navy-600)', bg: 'var(--stone-100)',
    items: [
      item('monitor', 'Web App', 'A fast, branded web app your whole ministry can use anywhere.'),
      item('smartphone', 'Mobile App (PWA)', 'Installable on iOS & Android — no app store required.'),
      item('layout-dashboard', 'Admin Dashboard', 'Full control over members, content, branding and analytics.'),
      /* THE-280 — REWORDED, NOT WITHDRAWN, and that is deliberate. Custom
         BRANDING ships and this tool is live, so removing the item would move
         CATALOG_TOOL_COUNT and understate what a church can use today. Only the
         domain half of the label and blurb is behind the flag.
         ⚠️ The title feeds `slugify(title)` → the crosslink map in
         content/features.ts, whose `custom-branding-domain` key is a RETIRED
         slug kept for indexed links. Both spellings resolve there, so the
         reworded label still lands on #branding. */
      item('palette', CUSTOM_DOMAIN_MARKETING_ENABLED ? 'Custom Branding & Domain' : 'Custom Branding',
        CUSTOM_DOMAIN_MARKETING_ENABLED
          ? 'White-label everything — your brand, your domain, your platform.'
          : 'White-label everything — your name, your logo, your colour.'),
      // Hidden FEATURE entry — see the ⚠️ note on the `churches` feature entry.
      // The add-on itself is live and is advertised in Pricing.tsx's ADD_ONS at
      // its real Dodo price; this entry is the tool-catalogue treatment, which
      // stays behind the flag. THE-223 corrected the figure here from $20 to
      // $12: it was a Campus price nothing rendered and nothing checked.
      ...(MULTI_CAMPUS_ENABLED ? [item('building-2', 'Multi-Campus', 'Run every campus from one plan — one included, $12/mo for each one after.')] : []),
      item('chart-column', 'Evangelism Analytics', 'Track engagement, growth and impact with real data.'),
    ],
  },
];

/** Tools the "N tools in one platform" copy (Nav's mega-menu footer) may
 *  count. `soon` entries are marked that way because they are not built yet —
 *  advertising one as a tool "in one platform" today would be the same false
 *  claim as a stale price, so they are excluded from the count rather than
 *  from the menu itself. */
export const CATALOG_TOOL_COUNT = CATALOG.reduce(
  (n, g) => n + g.items.filter((it) => !it.soon).length,
  0,
);
