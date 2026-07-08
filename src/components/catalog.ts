/* Feature catalog — shared by the Nav Features mega-menu and the /features page.
   Ported from the Claude Design handoff (ui_kits/website/sections1.jsx +
   features-page.jsx). `preview` is the mini-vignette kind rendered on the
   /features cards (see FeaturePreview.tsx); the mega-menu ignores it. */

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export interface CatalogItem {
  icon: string;
  title: string;
  desc: string;
  /** Vignette kind for the /features card preview; falls back cleanly if unset/unknown. */
  preview?: string;
  soon?: boolean;
}
export interface CatalogGroup {
  name: string;
  kicker: string;
  tint: string;
  bg: string;
  items: CatalogItem[];
}

const item = (icon: string, title: string, desc: string, preview?: string, soon = false): CatalogItem =>
  ({ icon, title, desc, preview, soon });

export const CATALOG: CatalogGroup[] = [
  {
    name: 'Community & Engagement', kicker: 'Belong', tint: 'var(--sky-600)', bg: 'var(--sky-100)',
    items: [
      item('rss', 'Community Feed', 'Posts, comments, polls and prayer requests in a private space that belongs to your ministry.', 'post'),
      item('users', 'Groups', 'Organise members into community groups for classes, teams and small groups.', 'avatars'),
      item('heart-handshake', 'Prayer Requests', 'A living prayer wall where members request, pray and follow up together.', 'prayer'),
      item('map', 'Church Map', 'Help members find your gatherings and connect with ministries near them.', 'map'),
      item('calendar-check', 'Event Registration', 'Create events, take registrations and manage attendance in one place.', 'calendar'),
      item('qr-code', 'Check-In System', 'QR-based attendance check-in for services, groups and kids ministry.', 'qr'),
      item('radio', 'Livestream + Live Giving', 'Stream services with live giving and sermon notes pushed to the audience in real time.', 'live'),
    ],
  },
  {
    name: 'Discipleship & Content', kicker: 'Grow', tint: 'var(--green-600)', bg: 'var(--green-100)',
    items: [
      item('book-open', 'Full Bible', 'The complete Bible with reading plans and verse sharing, built in.', 'verse'),
      item('graduation-cap', 'Courses', 'Structured learning paths with lessons, video and progress tracking for real discipleship.', 'progress'),
      item('pen-line', 'Blog & Publishing', 'Share teaching and devotionals with a built-in rich-text editor.', 'article'),
      item('sparkles', 'Automated SEO Blog', 'AI drafts SEO articles from your knowledge base to grow your reach.', 'aidoc'),
      item('file-text', 'Docs & Notes', 'Keep ministry docs, sermon notes and resources organised and shareable.', 'files'),
      item('sun', 'Automated Devotional', 'Daily devotionals generated and delivered to your community automatically.', 'sunrise', true),
    ],
  },
  {
    name: 'AI & Automation', kicker: 'Automate', tint: 'var(--gold-600)', bg: 'var(--gold-100)',
    items: [
      item('brain-circuit', 'AI Knowledge Base', "Train AI on your teachings so members get answers rooted in your ministry's theology.", 'chat'),
      item('message-square', 'AI Chat', "A contextual assistant for members — your ministry's voice, not a generic bot.", 'chatinput'),
      item('bot', 'Personal AI Assistant', 'A Telegram-integrated assistant connected to 900+ apps to schedule and automate work.', 'botmini', true),
      item('mail', 'Automated Newsletter', 'AI-composed newsletters from your recent content, sent automatically.', 'email'),
      item('message-square-text', 'SMS Automation', 'Twilio-powered SMS flows for follow-up, reminders and care.', 'sms'),
      item('clipboard-list', 'Custom Forms → CRM', 'Build forms that feed straight into your CRM pipeline.', 'form'),
    ],
  },
  {
    name: 'Giving & Finance', kicker: 'Steward', tint: 'var(--gold-700)', bg: 'var(--gold-100)',
    items: [
      item('hand-heart', 'Donation Page', 'Beautiful branded giving with up to 100% donation retention.', 'amounts'),
      item('trending-up', 'Fundraising', 'Run campaigns with goals, progress and updates for your community.', 'goal'),
      item('contact', 'CRM (Donors & Members)', 'A full relationship manager for donors and members.', 'contacts'),
      item('calculator', 'Accounting + QuickBooks', 'Accounting tools with QuickBooks sync to keep the books clean.', 'ledger'),
      item('receipt-text', 'Tax Receipts & Statements', 'Automatic tax receipts and annual giving statements.', 'receipt'),
      item('share-2', 'Lifetime Affiliate', 'Earn 10–20% recurring commission for every ministry you refer.', 'affiliate'),
    ],
  },
  {
    name: 'Platform & Brand', kicker: 'Own it', tint: 'var(--navy-600)', bg: 'var(--stone-100)',
    items: [
      item('monitor', 'Web App', 'A fast, branded web app your whole ministry can use anywhere.', 'browser'),
      item('smartphone', 'Mobile App (PWA)', 'Installable on iOS & Android — no app store required.', 'install'),
      item('layout-dashboard', 'Admin Dashboard', 'Full control over members, content, branding and analytics.', 'stats'),
      item('palette', 'Custom Branding & Domain', 'White-label everything — your brand, your domain, your platform.', 'swatches'),
      item('building-2', 'Unlimited Churches', 'Run multiple churches from one Ministry plan — $10/mo each, first free.', 'churches'),
      item('chart-column', 'Evangelism Analytics', 'Track engagement, growth and impact with real data.', 'chart'),
    ],
  },
];
