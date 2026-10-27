/* Feature catalog for the Nav Features mega-menu — the menu's labels, icons and
   grouping. Ported from the Claude Design handoff (ui_kits/website/sections1.jsx).
   Each item links to its section on the category page it belongs to; that mapping
   lives in content/features.ts, keyed by `slugify(title)`. */

import {
  AFFILIATE_PROGRAM_ENABLED, CUSTOM_DOMAIN_MARKETING_ENABLED, MULTI_CAMPUS_ENABLED,
  NEWSLETTER_MARKETING_ENABLED, QUICKBOOKS_MARKETING_ENABLED, SMS_MARKETING_ENABLED,
} from '../lib/flags';

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export interface CatalogItem {
  icon: string;
  title: string;
  desc: string;
  /** Not built. Excluded from CATALOG_TOOL_COUNT — see the note on it below. */
  soon?: boolean;
  /** Explicit destination for an item with its own page. */
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

export const CATALOG: CatalogGroup[] = [
  {
    name: 'Community & Engagement', kicker: 'Belong', tint: 'var(--sky-600)', bg: 'var(--sky-100)',
    items: [
      { icon: 'calendar-clock', title: 'Social Scheduler', desc: 'Write once, schedule to Facebook, Instagram and Threads. Included on Ministry.', href: '/features/harvest-scheduler' },
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
      item('brain-circuit', 'AI Knowledge Base', "Keep your ministry's teaching in one knowledge base."),
      item('message-square', 'AI Assistant', 'An AI assistant for the plan owner, grounded in your teaching.'),
      // 🔴 THE-335 — BOTH newsletter tools move the count, two off it, for the
      // same reason the SMS entry below moves it by one: CATALOG_TOOL_COUNT is a
      // derived tally of everything NOT marked `soon`, and a tool a church
      // cannot use is not one of the "N tools in one platform". The Newsletter
      // entry that appears in the Coming Soon column above is `soon: true` and
      // contributes nothing, which is what keeps the figure honest.
      // ⚠️ NO ABSOLUTE PAIR IS WRITTEN HERE, per the note on the SMS entry
      // below: the only figure worth quoting is the derived one.
      ...(NEWSLETTER_MARKETING_ENABLED ? [
        item('mail', 'Newsletter', 'Write a newsletter and send it through your own Mailchimp audience.'),
        item('sparkles', 'Automated Newsletter', 'AI drafts a newsletter from a month of your own Instagram posts.'),
      ] : []),
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
      // ⚠️ THE-314 — the description named the carrier ('Twilio-powered'), which
      // described bring-your-own. Harvest resells on its own account now, so a
      // church never sees a carrier at all and naming one would be describing
      // a relationship it does not have.
      ...(SMS_MARKETING_ENABLED ? [item('message-square-text', 'SMS Automation', 'Broadcasts and automated texts for follow-up, reminders and care.')] : []),
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
      /* 🔴 THE-355 — the row this column was MISSING, and the THE-306 precedent
         is why it is here at all. `sharegiving` shipped in THE-281 with a
         section on this column's own category page and no row here, and a live,
         paid feature unreachable from the navigation was treated as a defect
         when the founder found it. Pledge Campaigns became a feature entry of
         its own in this ticket, so it gets its row in the same change rather
         than in the ticket that notices it is absent.

         ⚠️ IT IS NOT `soon`, so it MOVES CATALOG_TOOL_COUNT by one — see the
         note on the constant at the foot of this file. That is the correct
         direction: the figure counts tools a church can use today, and a
         Ministry tenant creates a pledge campaign today.
         ⚠️ BOTH TITLES FEED `slugify(title)` → LEGACY_ANCHOR_TARGETS in
         content/features.ts, and the Fundraising row was RENAMED with the
         feature. `fundraising-campaigns` and `pledge-campaigns` are mapped
         there, alongside the retired `fundraising` spelling. */
      item('trending-up', 'Fundraising Campaigns', 'Run campaigns with goals, progress and updates for your community.'),
      item('handshake', 'Pledge Campaigns', 'Commit now, give later — a ledger of pledged against paid, with the status derived.'),
      item('contact', 'CRM (Donors & Members)', 'A full relationship manager for donors and members.'),
      // 🔴 THE-335 — REWORDED, NOT REMOVED, so this does NOT move the count.
      // Giving records (formerly Accounting) is a live tool a church uses today: the ledger, the receipt
      // statuses and the numbered PDF audit trail all ship. Dropping it to hide
      // one untested integration on it would understate the product, which is
      // the error the note above this array warns against in the other
      // direction.
      // 🔴 RENAMED "ACCOUNTING" → "GIVING RECORDS" (two-plan reprice). Same tool,
      // same count, honest name: it is the record of what was given, not
      // accounting software, and it must never read as a QuickBooks replacement.
      QUICKBOOKS_MARKETING_ENABLED
        ? item('calculator', 'Giving records + QuickBooks sync', 'Giving records that send on to QuickBooks, which keeps your books.')
        : item('calculator', 'Giving records', 'Giving statements, year-end receipts and a ledger of every receipt Harvest issues, each with its own numbered PDF.'),
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
      // $12: it was a Campus price nothing rendered and nothing checked. THE-370
      // retired the Campus add-on outright — campuses are unlimited on every
      // paid plan now — so the copy no longer names a price at all.
      ...(MULTI_CAMPUS_ENABLED ? [item('building-2', 'Multi-Campus', 'Run every campus from one plan — as many as you need, at no extra charge.')] : []),
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
