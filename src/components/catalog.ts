/* Feature catalog for the Nav Features mega-menu — the menu's labels, icons and
   grouping. Ported from the Claude Design handoff (ui_kits/website/sections1.jsx).
   Each item links to its section on the category page it belongs to; that mapping
   lives in content/features.ts, keyed by `slugify(title)`. */

import { AFFILIATE_PROGRAM_ENABLED, MULTI_CAMPUS_ENABLED } from '../lib/flags';

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export interface CatalogItem {
  icon: string;
  title: string;
  desc: string;
  soon?: boolean;
}
export interface CatalogGroup {
  name: string;
  kicker: string;
  tint: string;
  bg: string;
  items: CatalogItem[];
}

const item = (icon: string, title: string, desc: string, soon = false): CatalogItem =>
  ({ icon, title, desc, soon });

export const CATALOG: CatalogGroup[] = [
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
      item('message-square-text', 'SMS Automation', 'Twilio-powered SMS flows for follow-up, reminders and care.'),
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
      ...(AFFILIATE_PROGRAM_ENABLED ? [item('share-2', 'Affiliate Program', 'Earn 15% recurring commission for 12 months on every ministry you refer.')] : []),
    ],
  },
  {
    name: 'Platform & Brand', kicker: 'Own it', tint: 'var(--navy-600)', bg: 'var(--stone-100)',
    items: [
      item('monitor', 'Web App', 'A fast, branded web app your whole ministry can use anywhere.'),
      item('smartphone', 'Mobile App (PWA)', 'Installable on iOS & Android — no app store required.'),
      item('layout-dashboard', 'Admin Dashboard', 'Full control over members, content, branding and analytics.'),
      item('palette', 'Custom Branding & Domain', 'White-label everything — your brand, your domain, your platform.'),
      // Hidden add-on — see the ⚠️ note on the `churches` feature entry. Every
      // plan includes one campus; extras are $20/mo each and are not built yet.
      ...(MULTI_CAMPUS_ENABLED ? [item('building-2', 'Multi-Campus', 'Run every campus from one plan — one included, $20/mo for each one after.')] : []),
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
