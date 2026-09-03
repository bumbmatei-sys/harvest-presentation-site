/* Feature catalog for the Nav Features mega-menu — the menu's labels, icons and
   grouping. Ported from the Claude Design handoff (ui_kits/website/sections1.jsx).
   Each item links to its section on the category page it belongs to; that mapping
   lives in content/features.ts, keyed by `slugify(title)`. */

import {
  AFFILIATE_PROGRAM_ENABLED, CUSTOM_DOMAIN_MARKETING_ENABLED, MULTI_CAMPUS_ENABLED,
  SMS_MARKETING_ENABLED,
} from '../lib/flags';
import { COMING_SOON_HREF, COMING_SOON_ITEMS, COMING_SOON_KICKER, COMING_SOON_NAME, soonItemHref } from '../content/coming-soon';

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
}

const item = (icon: string, title: string, desc: string, soon = false): CatalogItem =>
  ({ icon, title, desc, soon });

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

     ⚠️ EVERY ITEM IS `soon: true`, WHICH IS LOAD-BEARING, NOT DECORATION.
     CATALOG_TOOL_COUNT is a derived count of everything NOT marked soon, and it
     is quoted to visitors as "N tools in one platform". Advertising eight
     unbuilt features as tools in the platform would be the same false claim as
     a stale price. The count is unchanged at 28; the assertion lives in
     pages/ComingSoonPage.test.ts and in two older suites that already pin it. */
  {
    name: COMING_SOON_NAME, kicker: COMING_SOON_KICKER,
    tint: 'var(--text-soon)', bg: 'var(--surface-soon)',
    href: COMING_SOON_HREF,
    // Derived from content/coming-soon.ts so the menu and the page cannot
    // disagree about what is on the list — the failure that a second hand-kept
    // array would eventually produce.
    items: COMING_SOON_ITEMS.map((i) => ({
      icon: i.icon, title: i.name, desc: i.navDesc, soon: true, href: soonItemHref(i.id),
    })),
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
      // Hidden FEATURE entry — THE-245. 🔴 This is the one that moves the
      // count: CATALOG_TOOL_COUNT is a derived tally of everything NOT marked
      // `soon`, so withdrawing this tool takes it from 28 to 27. That is the
      // correct direction — the figure is quoted to visitors as "N tools in one
      // platform", and a tool a church cannot use is not one of them. The SMS
      // entry that appears in the Coming Soon column above is `soon: true` and
      // contributes nothing, which is what keeps 27 honest rather than 28.
      ...(SMS_MARKETING_ENABLED ? [item('message-square-text', 'SMS Automation', 'Twilio-powered SMS flows for follow-up, reminders and care.')] : []),
      item('clipboard-list', 'Custom Forms → CRM', 'Build forms that feed straight into your CRM pipeline.'),
    ],
  },
  {
    name: 'Giving & Finance', kicker: 'Steward', tint: 'var(--gold-700)', bg: 'var(--gold-100)',
    items: [
      item('hand-heart', 'Donation Page', 'Beautiful branded giving with a 0% platform fee — you keep every dollar.'),
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
