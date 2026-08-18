/* Feature catalog for the five category pages under /features/*.
   Ported from the Claude Design handoff (Community & Engagement, Discipleship &
   Content, AI & Automation, Giving & Finance, Platform & Brand + FeatureBlock).

   `id` is the in-page anchor (e.g. /features/community-engagement#feed).
   LEGACY_ANCHORS maps the retired /features#<slug> anchors onto their new home
   so old deep links, the Nav mega-menu and indexed URLs all keep working. */

import { AFFILIATE_PROGRAM_ENABLED, MULTI_CAMPUS_ENABLED } from '../lib/flags';
import { plans } from '../components/Pricing';

export interface Crosslink { label: string; href: string }

export interface Feature {
  /** In-page anchor id. */
  id: string;
  name: string;
  /** Ordinal shown in the page's feature index. */
  n: string;
  accent: string;
  accentBg: string;
  /** Plan availability, positional against `plans` in components/Pricing.tsx:
   *  [Individual, Small Team, Ministry]. Length is asserted at module load. */
  tiers: number[];
  eyebrow: string;
  title: string;
  oneliner: string;
  moment: string;
  admin: string[];
  member: string[];
  /** Qualifier under the plan chips, when a feature is on every plan but part
   *  of it is gated (e.g. the app installs everywhere, your branding does not). */
  tiersNote?: string;
  adminLabel?: string;
  memberLabel?: string;
  crosslinks?: Crosslink[];
}

export interface Category {
  slug: string;
  name: string;
  kicker: string;
  eyebrowColor: string;
  heroBg: string;
  /** Newlines are rendered as line breaks. */
  headline: string;
  headWidth: number;
  introWidth: number;
  intro: string;
  ctaHeading: string;
  secondary: { label: string; to: string };
  seo: string;
  /** Navy hero — light type, gold CTA. */
  dark?: boolean;
  features: Feature[];
}

/* The full catalog, including entries that are currently hidden. Consumers must
   read the filtered `CATEGORIES` below, never this — see HIDDEN_FEATURE_IDS. */
const ALL_CATEGORIES: Category[] = [
  {
    slug: 'community-engagement', name: 'Community & Engagement', kicker: 'Belong',
    eyebrowColor: 'var(--sky-700)',
    heroBg: 'linear-gradient(180deg,#cadff1 0%,#dcebf5 46%,#eef4f3 74%,var(--cream) 100%)',
    headline: 'Seven ways for your\npeople to belong.',
    headWidth: 900, introWidth: 620,
    intro: 'A feed, prayer wall, groups, campus map, events, check-in and livestream — the whole engagement stack, in one app that carries your name instead of a platform’s.',
    ctaHeading: 'Everything your people need, in one home.',
    secondary: { label: 'See pricing', to: '/#pricing' },
    seo: 'Community feed, groups, prayer requests, church map, events, check-in and livestream — the engagement stack for your ministry, under your own brand.',
    features: [
      {
        id: 'feed', name: 'Community Feed', n: '1',
        accent: 'var(--sky-600)', accentBg: 'var(--sky-100)', tiers: [1, 1, 1],
        eyebrow: 'Owned audience',
        title: 'Your ministry\'s own feed — no algorithm.',
        oneliner: 'Announcements, polls, photos and comments in a space that belongs to you, not to a platform deciding who sees Sunday\'s post.',
        moment: 'No algorithm decides who sees Sunday\'s announcement. You own the audience — every member, every post, every time.',
        admin: ['Inline composer — text, up to 3 images, live polls', 'Pin posts; embed a live campaign or event', 'Geographic targeting by country or city', 'Auto push notification on every new post', 'Delete or privately reply to any comment'],
        member: ['Realtime feed — new posts appear live', 'Like, vote in polls, comment and RSVP', 'Share any post to a public link', 'Save posts and open images full-screen'],
        crosslinks: [{ label: 'Blog', href: '/features/discipleship-content#blog' }, { label: 'Fundraising', href: '/features/giving-finance#fundraising' }, { label: 'Events', href: '/features/community-engagement#events' }],
      },
      {
        id: 'groups', name: 'Groups', n: '2',
        accent: 'var(--navy-600)', accentBg: 'var(--stone-100)', tiers: [0, 0, 1],
        tiersNote: 'Channels and direct messages are on Ministry only — Individual and Small Team don\'t have a Messages tab at all.',
        eyebrow: 'Private by design',
        title: 'Get your leadership out of the group text.',
        oneliner: 'Private channels and direct messages inside your app — coordination and pastoral care in the same place as everything else.',
        moment: 'Pastoral conversations stay inside your ministry\'s own system — not a personal phone number, not a third-party app.',
        admin: ['Create channels; add members by name or email', 'Post messages with sender photo, name and role', 'Attach a doc, CRM contact, campaign or form', 'Admin ↔ admin and admin ↔ member DMs'],
        member: ['See it as the Messages tab', 'Participate in the channels you\'re added to', 'Start a direct message with any admin', 'Read receipts on direct messages'],
        crosslinks: [{ label: 'CRM', href: '/features/giving-finance#crm' }, { label: 'Fundraising', href: '/features/giving-finance#fundraising' }, { label: 'Forms', href: '/features/ai-automation#forms' }],
      },
      {
        id: 'prayer', name: 'Prayer Requests', n: '3',
        accent: 'var(--green-600)', accentBg: 'var(--green-100)', tiers: [1, 1, 1],
        eyebrow: 'Dignity, not a graveyard',
        title: 'A prayer wall that never becomes a graveyard.',
        oneliner: 'Post in one line, pray with one tap — and requests clear themselves after 30 days, by design.',
        moment: 'The person who asked can see that 14 people prayed. That is the whole emotional payload — and the wall stays current, because everyone is told it clears in 30 days before they post.',
        admin: ['Delete any request for light moderation', 'Available to every member on every plan', 'Requests carry a 30-day expiry from the start'],
        member: ['Post from a 200-character share bar', 'Pray with one tap — live count, toggle on/off', 'Post as yourself or as Anonymous', 'Filter by Today / This Week / This Month', 'Delete your own requests anytime'],
        crosslinks: [{ label: 'Livestream', href: '/features/community-engagement#livestream' }, { label: 'Community Feed', href: '/features/community-engagement#feed' }],
      },
      {
        id: 'map', name: 'Church Map', n: '4',
        accent: 'var(--sky-600)', accentBg: 'var(--sky-100)', tiers: [0, 1, 1],
        eyebrow: 'Where do I go Sunday?',
        title: 'Every campus on a map, sorted by distance.',
        oneliner: 'A member-facing locator and a multi-campus roster admins manage — the “where do I go on Sunday” question, solved.',
        moment: 'The list reorders itself by how far each visitor is standing from every campus. One tap opens directions. That is the whole Sunday-morning question, answered.',
        admin: ['Add campuses with Google address autocomplete', 'Automatic geocoding fallback + manual lat/lng', 'Full record: schedule, pastor, contact, socials', 'One campus location on every plan'],
        member: ['Interactive map with a marker per location', '“Locate me” plus distance sorting', 'Set a home church; get directions in one tap', 'Service times, pastor and tap-to-copy contact'],
        crosslinks: [{ label: 'Event Registration', href: '/features/community-engagement#events' }, { label: 'Check-In', href: '/features/community-engagement#checkin' }],
      },
      {
        id: 'events', name: 'Event Registration', n: '5',
        accent: 'var(--gold-600)', accentBg: 'var(--gold-100)', tiers: [0, 0, 1],
        eyebrow: 'The money never touches us',
        title: 'Ticketing where the money never touches us.',
        oneliner: 'Ticket types, waitlists, discount codes and QR check-in — with payment going straight to your own Stripe account.',
        moment: 'Paid tickets are a destination charge straight to the ministry\'s own Stripe account. The money never touches our platform. That is a trust argument worth its own paragraph.',
        admin: ['Multiple ticket types, each with its own capacity', 'Discount codes, per-event waitlist, group booking', 'Draft → publish, manual check-in, CSV export', 'Pin an event to the top of the community feed'],
        member: ['Register at a public event page', 'Confirmation email with a scannable QR', '“My Tickets” with a full-screen QR code', 'Household / group registration on one booking'],
        crosslinks: [{ label: 'Giving', href: '/features/giving-finance#donation' }, { label: 'CRM', href: '/features/giving-finance#crm' }, { label: 'Check-In', href: '/features/community-engagement#checkin' }],
      },
      {
        id: 'checkin', name: 'Check-In System', n: '6',
        accent: 'var(--sky-600)', accentBg: 'var(--sky-100)', tiers: [0, 1, 1],
        eyebrow: 'Attendance becomes data',
        title: 'Print a QR, tape it to the door.',
        oneliner: 'People check themselves in — no app, no account — and the attendance lands in your CRM.',
        moment: 'The bar for a first-time visitor is “point your camera at this.” No app, no account, no line at a kiosk — and attendance quietly becomes data.',
        admin: ['Create a session, optionally linked to an event', 'Live attendee count and manual check-in', 'CSV export of the full attendee list', 'Bundled QR generator for five destinations'],
        member: ['Scan, enter a first name, done — no login', 'A branded self check-in page', 'Attendance auto-links to CRM contacts'],
        crosslinks: [{ label: 'CRM', href: '/features/giving-finance#crm' }, { label: 'Event Registration', href: '/features/community-engagement#events' }],
      },
      {
        id: 'livestream', name: 'Livestream + Live Giving', n: '7',
        accent: 'var(--gold-600)', accentBg: 'var(--gold-100)', tiers: [0, 1, 1],
        eyebrow: 'The prayer that reaches the pastor',
        title: 'Go live — and reach the person watching alone.',
        oneliner: 'Stream on YouTube, keep the congregation inside your app: prayer, chat, sermon notes and giving one tap away.',
        moment: 'Someone watching alone at home types a prayer request — and a real person at the pastor’s console marks it prayed. Lead with this, not the video player.',
        admin: ['Paste a YouTube URL or ID — one button to go live', 'Live viewer and prayer counts, with a peak record', 'Live prayer queue — tap “Prayed” to clear one', 'Delete any chat comment; archive every session'],
        member: ['Gold “Live Now” banner on Home the instant you start', 'Embedded player with realtime chat', 'Submit a prayer request straight to the pastor', 'Sermon notes synced to the stream; give in one tap'],
        crosslinks: [{ label: 'Giving', href: '/features/giving-finance#donation' }, { label: 'Docs', href: '/features/discipleship-content#docs' }, { label: 'Prayer', href: '/features/community-engagement#prayer' }],
      },
    ],
  },
  {
    slug: 'discipleship-content', name: 'Discipleship & Content', kicker: 'Grow',
    eyebrowColor: 'var(--gold-700)',
    heroBg: 'linear-gradient(180deg,#e8dcc6 0%,#efe6d5 44%,#f5efe4 72%,var(--cream) 100%)',
    headline: 'Discipleship that doesn’t\nend on Sunday.',
    headWidth: 920, introWidth: 640,
    intro: 'The full Bible, a course builder, a real blog, and sermon notes that reach every screen — everything to feed your people all week, not just from the stage.',
    ctaHeading: 'Give your people something to grow on.',
    secondary: { label: 'See pricing', to: '/#pricing' },
    seo: 'The full Bible, courses, blog publishing, AI-drafted SEO articles and shared docs — discipleship content that keeps working all week.',
    features: [
      {
        id: 'bible', name: 'Full Bible', n: '1',
        accent: 'var(--gold-600)', accentBg: 'var(--gold-100)', tiers: [1, 1, 1],
        eyebrow: 'On every plan',
        title: 'The whole Bible, inside your app.',
        oneliner: 'Eight translations, highlighting and one-tap sharing — so nobody ever has to leave your app to read scripture.',
        moment: 'The whole point of a church app is that your congregation opens it. Give them a reason to switch to another Bible app and you\'ve lost them — so scripture lives right here.',
        admin: ['All 66 books, eight public-domain translations', 'Full-text search across the translation', 'Nothing to configure — on by default', 'No licensing fee or per-read cost'],
        member: ['Highlight verses in four colours', 'Save and copy verses with the reference', 'Share to any app via the native share sheet', 'Reads beautifully on mobile and desktop'],
        crosslinks: [{ label: 'Community Feed', href: '/features/community-engagement#feed' }, { label: 'Prayer', href: '/features/community-engagement#prayer' }],
      },
      {
        id: 'courses', name: 'Courses', n: '2',
        accent: 'var(--green-600)', accentBg: 'var(--green-100)', tiers: [1, 1, 1],
        eyebrow: 'AI lesson builder',
        title: 'Turn last year\'s sermon series into a course this afternoon.',
        oneliner: 'Paste a YouTube link and AI drafts the lesson, outline and quiz — you edit and publish. Finishers earn a verified certificate.',
        moment: 'Paste a link to a teaching video you already recorded. AI watches it and hands you an editable lesson — title, summary, outline, quiz and a scripture reference. Nothing is auto-published; nothing is invented.',
        admin: ['Course → levels → sections → lessons', 'AI drafts lessons & quizzes from your own videos', 'Multiple credited authors with profiles', 'Server-verified certificates of completion'],
        member: ['Watch lessons and track progress', 'Take scored quizzes to pass', 'Earn a PDF certificate — completion is verified, not claimed', 'Free to every member'],
        crosslinks: [{ label: 'AI Knowledge Base', href: '/features/ai-automation#knowledge' }],
      },
      {
        id: 'blog', name: 'Blog & Publishing', n: '3',
        accent: 'var(--sky-600)', accentBg: 'var(--sky-100)', tiers: [1, 1, 1],
        eyebrow: 'Found on search',
        title: 'The family moving to town finds you.',
        oneliner: 'A real publishing platform with the full SEO stack built in — so people searching for a church in your town actually land on your page.',
        moment: 'Someone searches "churches near me" the week they move. Most church sites have nothing to find. Yours ranks — because every post ships with the exact markup Google reads.',
        admin: ['Rich editor with images, categories & tags', 'Draft, schedule or publish', 'Server-rendered with SEO title, meta, OpenGraph & schema.org', 'Latest posts surface in the community feed'],
        member: ['Read in a clean Blog tab', 'Filter by category, full-text search', 'Share any article', 'Related posts keep them reading'],
        crosslinks: [{ label: 'Community Feed', href: '/features/community-engagement#feed' }],
      },
      {
        id: 'aiblog', name: 'Automated SEO Blog', n: '4',
        accent: 'var(--gold-600)', accentBg: 'var(--gold-100)', tiers: [0, 0, 1],
        eyebrow: 'Grounded in your teaching',
        title: 'Your own sermons, rewritten for search.',
        oneliner: 'Draw on your uploaded teaching to generate a search-optimised article grounded in what your ministry actually believes — not a generic model\'s guess.',
        moment: 'This isn\'t AI slop. It reads your knowledge base — your sermons, your notes — and restructures your own theology for search. A church that would never post generic AI content will gladly post their own sermon, found by more people.',
        admin: ['Reads your AI Knowledge Base as the only source', 'Needs your teaching first — never invents doctrine', 'Generates SEO title, meta, slug & full article to spec', '⚡ Generate an article on demand'],
        member: ['Reads like any other article on your blog', 'Tagged so you always know what was AI-drafted', 'Full SEO treatment, same as hand-written posts'],
        crosslinks: [{ label: 'AI Knowledge Base', href: '/features/ai-automation#knowledge' }, { label: 'Blog', href: '/features/discipleship-content#blog' }],
      },
      {
        id: 'docs', name: 'Docs & Notes', n: '5',
        accent: 'var(--navy-600)', accentBg: 'var(--stone-100)', tiers: [0, 1, 1],
        tiersNote: 'Docs and sermon notes are on Small Team and above. Pushing notes to a live stream needs Small Team or above, because that is where livestream itself starts.',
        eyebrow: 'Write once, use everywhere',
        title: 'Write it Tuesday. Preach it Sunday. Push it to every screen.',
        oneliner: 'Sermon prep and team docs — nested, autosaved, exportable — and one tap from your congregation\'s screen the moment you\'re preaching.',
        moment: 'Mid-sermon, one button pushes your open outline to the livestream. Every viewer gets it beside the video under a Notes tab. End the stream and it clears itself.',
        admin: ['Nested folders — pin, rename, move', 'Autosaves two seconds after you stop typing', 'Share docs with other admins', 'Export to PDF, DOCX or Markdown'],
        member: ['See pushed notes beside a live stream', 'Read-only, cleanly rendered', 'Notes clear automatically when the stream ends'],
        crosslinks: [{ label: 'Livestream', href: '/features/community-engagement#livestream' }, { label: 'Courses', href: '/features/discipleship-content#courses' }],
      },
    ],
  },
  {
    slug: 'ai-automation', name: 'AI & Automation', kicker: 'Automate',
    eyebrowColor: 'var(--green-700)',
    heroBg: 'linear-gradient(180deg,#cbdcb4 0%,#dbe8ca 44%,#eef2e6 72%,var(--cream) 100%)',
    headline: 'AI with a conscience,\nbuilt for the church.',
    headWidth: 940, introWidth: 660,
    intro: 'An assistant that answers only from your teaching — and after a few questions, points members to prayer instead. Plus a newsletter, SMS, and forms that turn effort you’ve already spent into people you can reach.',
    ctaHeading: 'AI your congregation can trust.',
    secondary: { label: 'See pricing', to: '/#pricing' },
    seo: 'An AI knowledge base trained on your teaching, a chat assistant that knows when to point to prayer, automated newsletters, SMS and forms that feed your CRM.',
    features: [
      {
        id: 'knowledge', name: 'AI Knowledge Base', n: '1',
        accent: 'var(--gold-600)', accentBg: 'var(--gold-100)', tiers: [0, 1, 1],
        eyebrow: 'The foundation',
        title: 'Teach it once. Everything downstream speaks in your voice.',
        oneliner: 'Feed in your sermons and teaching notes, and AI Chat, the SEO blog and course drafting all start answering from your ministry — not a generic model.',
        moment: 'One upload makes every other AI feature yours. The knowledge base isn\'t a feature — it\'s the infrastructure that keeps the rest from sounding generic.',
        admin: ['Paste text, or upload .txt / .csv', 'Live meters for query use & capacity — no surprise cutoff', 'Delete a source and every trace of it is gone', 'Course lesson recaps can feed straight in'],
        member: ['Powers answers that sound like your church', 'A retracted sermon can never resurface', 'Nothing generic slips into what members read'],
        crosslinks: [{ label: 'AI Chat', href: '/features/ai-automation#aichat' }, { label: 'Automated SEO Blog', href: '/features/discipleship-content#aiblog' }, { label: 'Courses', href: '/features/discipleship-content#courses' }],
      },
      {
        id: 'aichat', name: 'AI Chat', n: '2',
        accent: 'var(--green-600)', accentBg: 'var(--green-100)', tiers: [0, 1, 1],
        eyebrow: 'AI that knows when to stop',
        title: 'The assistant that tells members to go pray instead.',
        oneliner: 'It answers from your church\'s own teaching — and after about ten questions, gently hands the conversation back to God with Scripture and steps to pray.',
        moment: 'Every other AI is built to keep you talking. This one taps a member on the shoulder after ten questions and points them somewhere better — to Scripture, to prayer, to their pastor. By design, it refuses to maximise engagement.',
        admin: ['Answers only from your knowledge base', 'Says “I don\'t have that” rather than inventing', 'Per-member pacing & monthly caps enforced server-side', 'Costs nothing when it redirects to prayer'],
        member: ['Named, switchable conversation history', 'Honest answers grounded in your teaching', 'A written invitation to pray after a few questions', 'A gentle rest before asking again'],
        crosslinks: [{ label: 'AI Knowledge Base', href: '/features/ai-automation#knowledge' }, { label: 'Full Bible', href: '/features/discipleship-content#bible' }],
      },
      /* Two entries, because the app has two flags: `newsletterAutomation`
         (Small Team+) writes and sends a newsletter, `automatedNewsletter`
         (Ministry) is the Instagram → draft generator on top of it. They are
         separate rows on the pricing page, and collapsing them into one entry
         is what advertised Instagram generation to Small Team. */
      {
        id: 'newsletter', name: 'Newsletter', n: '3',
        accent: 'var(--sky-600)', accentBg: 'var(--sky-100)', tiers: [0, 1, 1],
        eyebrow: 'Your list, not ours',
        title: 'Write the email. Send it from your own list.',
        oneliner: 'Compose a newsletter in a real editor and send it through your own Mailchimp audience — your list, your sender, your subscribers.',
        moment: 'Harvest never becomes the thing standing between you and your congregation\'s inboxes. The audience is yours, in your own Mailchimp account — leave tomorrow and the list leaves with you.',
        admin: ['Compose the subject line and body in an editor', 'Always a draft you approve — never auto-sent', 'Sends through your own Mailchimp audience', 'HTML sanitised; send now or schedule in Mailchimp'],
        member: ['Clean, on-brand email in their inbox', 'Delivered from your list, not held hostage', 'One place to unsubscribe — your own audience'],
        crosslinks: [{ label: 'Automated Newsletter', href: '/features/ai-automation#autonewsletter' }, { label: 'Community Feed', href: '/features/community-engagement#feed' }, { label: 'CRM', href: '/features/giving-finance#crm' }],
      },
      {
        id: 'autonewsletter', name: 'Automated Newsletter', n: '4',
        accent: 'var(--gold-600)', accentBg: 'var(--gold-100)', tiers: [0, 0, 1],
        eyebrow: 'You already made the content',
        title: 'A month of Instagram, turned into a newsletter.',
        oneliner: 'Pull a date range of your own Instagram posts and AI drafts the subject line and body. It lands in the same editor you\'d write in, and sends through your own Mailchimp.',
        moment: 'Most churches post to Instagram all month and email no one. This turns work you already did into a newsletter your congregation will actually read — and nothing sends until you\'ve read it.',
        admin: ['Pick a date range; AI drafts subject line and body from those posts', 'Drafted from your own posts — nothing invented', 'Always a draft in an editor — never auto-sent', 'Lands in the Newsletter editor and sends through your Mailchimp'],
        member: ['A newsletter built from the month they already followed', 'Clean, on-brand email in their inbox', 'Delivered from your list, not held hostage'],
        crosslinks: [{ label: 'Newsletter', href: '/features/ai-automation#newsletter' }, { label: 'Community Feed', href: '/features/community-engagement#feed' }, { label: 'CRM', href: '/features/giving-finance#crm' }],
      },
      {
        id: 'sms', name: 'SMS & Text-to-Give', n: '5',
        accent: 'var(--green-600)', accentBg: 'var(--green-100)', tiers: [1, 1, 1],
        eyebrow: 'Your Twilio, your rates',
        title: 'Text the whole church — and let them give with a word.',
        oneliner: 'Send a broadcast to members, donors or any tag with a live cost counter — and let anyone give by texting one keyword to your number.',
        moment: '“Text GIVE to your church\'s number” on the closing slide is one of the most effective giving paths there is — and it works the moment you set it up.',
        admin: ['Broadcast to all members, donors, or a tag', 'Live SMS segment counter — see cost before you send', 'Recipient preview with an exact count', 'Check-in thank-you texts sent automatically'],
        member: ['Text a keyword, get your giving link instantly', 'A thank-you text after checking in', 'No spam — non-matching texts get no reply'],
        crosslinks: [{ label: 'Text-to-Give', href: '/features/giving-finance#donation' }, { label: 'CRM tags', href: '/features/giving-finance#crm' }, { label: 'Check-In', href: '/features/community-engagement#checkin' }],
      },
      {
        id: 'forms', name: 'Custom Forms → CRM', n: '6',
        accent: 'var(--navy-600)', accentBg: 'var(--stone-100)', tiers: [0, 0, 1],
        eyebrow: 'Forms that become people',
        title: 'Forms that don\'t die in a spreadsheet.',
        oneliner: 'Build any form from nine field types, share a link or QR, and every response matches or creates a contact in your CRM — with a history, not just a row.',
        moment: 'Google Forms gives you rows. This gives you people. Every connect card, volunteer signup and prayer card becomes a contact with a history — automatically, deduplicated by email.',
        admin: ['Nine field types, required flags, reorder, active/inactive', 'Public branded form — no login to fill it in', 'Smart match: email/phone/name by type and label', 'Per-form submission list & CSV export'],
        member: ['A clean, branded form on any device', 'No account, zero friction', 'One QR works on a bulletin, a slide or a link'],
        crosslinks: [{ label: 'CRM', href: '/features/giving-finance#crm' }, { label: 'SMS broadcasts', href: '/features/ai-automation#sms' }, { label: 'Check-In QR', href: '/features/community-engagement#checkin' }],
      },
    ],
  },
  {
    slug: 'giving-finance', name: 'Giving & Finance', kicker: 'Steward',
    eyebrowColor: 'var(--gold-700)',
    heroBg: 'linear-gradient(180deg,#ecd6a4 0%,#f2e3c4 44%,#f7efe0 72%,var(--cream) 100%)',
    headline: 'Keep 100% of every gift.',
    headWidth: 960, introWidth: 660,
    intro: 'Giving, fundraising, a CRM that builds itself, and books that reconcile themselves — with no platform fee at all, on any plan. The money lands in your account, not ours.',
    ctaHeading: 'Keep more of every gift.',
    secondary: { label: 'See pricing', to: '/#pricing' },
    seo: `Branded giving, fundraising campaigns, a donor and member CRM and QuickBooks-synced receipts${AFFILIATE_PROGRAM_ENABLED ? ', plus a 15% affiliate program' : ''} — with 0% platform fee on every donation.`,
    features: [
      {
        id: 'donation', name: 'Donation Page', n: '1',
        accent: 'var(--gold-600)', accentBg: 'var(--gold-100)', tiers: [1, 1, 1],
        eyebrow: 'You keep more',
        title: 'Keep 100% of every gift, on every plan.',
        oneliner: 'Give in three taps. Every dollar lands in your church\'s own Stripe account — Harvest takes 0% of every donation on every plan, and never holds your money.',
        moment: 'Most platforms take 2–5% of every gift, forever, with no way down. Harvest takes zero — on the $49 plan and every plan above it. On a church doing $200k a year online, a 5% platform quietly takes $10,000. Harvest takes none of it; you pay us a flat subscription and nothing else.',
        admin: ['Gifts are destination charges to your own Stripe', 'Fail-closed — no Stripe connected, no gift routed elsewhere', 'A gift writes a receipt, a CRM record & campaign credit', 'Stripe\'s own processing fees are Stripe\'s, not ours'],
        member: ['Preset amounts or your own, in three taps', 'No login — give to any church, even as a visitor', 'An emailed PDF receipt, instantly', 'Your full giving history, receipts included'],
        crosslinks: [{ label: 'CRM', href: '/features/giving-finance#crm' }, { label: 'Fundraising', href: '/features/giving-finance#fundraising' }, { label: 'Text-to-Give', href: '/features/ai-automation#sms' }],
      },
      {
        id: 'fundraising', name: 'Fundraising', n: '2',
        accent: 'var(--green-600)', accentBg: 'var(--green-100)', tiers: [1, 1, 1],
        eyebrow: 'A building fund isn\'t a GoFundMe',
        title: 'A live progress bar — or pledges to track.',
        oneliner: 'Run a campaign with a real-time progress bar, or a pledge campaign for "commit now, give later" — with a ledger that tracks pledged against paid.',
        moment: 'Churches don\'t just need a progress bar — they need 300 families committing $1,000 over two years. Pledge campaigns track exactly that, with a status derived from the numbers, never a stale manual field.',
        admin: ['Campaign or pledge type, chosen at creation', 'Progress bar credited automatically as gifts land', 'Pledge ledger: pledged vs. paid, status derived', 'Pledge campaigns on Ministry'],
        member: ['Public campaign & pledge pages — no login', 'Pledge from the pulpit, a QR, or a text', 'A confirmation the moment you commit', 'Watch the total move in real time'],
        crosslinks: [{ label: 'Community Feed', href: '/features/community-engagement#feed' }, { label: 'Donation Page', href: '/features/giving-finance#donation' }, { label: 'CRM', href: '/features/giving-finance#crm' }],
      },
      {
        id: 'crm', name: 'CRM', n: '3',
        accent: 'var(--sky-600)', accentBg: 'var(--sky-100)', tiers: [1, 1, 1],
        // The contact ceiling is the primary ladder between the three plans and
        // the pricing table was the only surface carrying it. The CRM is where
        // a contact lives, so it is where the limit belongs — a cap nobody can
        // find until checkout is the surprise this audience punishes hardest.
        tiersNote: 'The CRM itself is on every plan; how many people it holds is what scales — 150 contacts on Individual, 500 on Small Team, 2,000 on Ministry.',
        eyebrow: 'You never type a contact in',
        title: 'One record per person — built automatically.',
        oneliner: 'Give, register, check in or fill a form and a contact appears with the history attached. One person, one row — deduplicated by email, typed Donor & Member as they give. Connect Gmail and email them without leaving the dashboard.',
        moment: 'Anyone who\'s used church software has a database full of duplicate Bob Smiths. Harvest merges app members and manual contacts into one row on a stable link — so a person\'s giving history never scatters across three records.',
        admin: ['Members & manual contacts merged into one list', 'Contacts scale by plan: 150 → 500 → 2,000', 'Connect Gmail and email a contact from their record', 'Auto-typed member / donor / both as they give', 'Five-stage discipleship pipeline: New → Champion', 'Tags that drive SMS broadcast targeting'],
        member: ['A single profile that follows them everywhere', 'Giving, events, check-ins & forms on one timeline', 'Emails you send land from your own address', 'Total given & last gift always current'],
        crosslinks: [{ label: 'Custom Forms', href: '/features/ai-automation#forms' }, { label: 'Check-In', href: '/features/community-engagement#checkin' }, { label: 'SMS', href: '/features/ai-automation#sms' }],
      },
      {
        id: 'accounting', name: 'Accounting + QuickBooks', n: '4',
        accent: 'var(--navy-600)', accentBg: 'var(--stone-100)', tiers: [0, 0, 1],
        eyebrow: 'Your treasurer stops asking',
        title: 'Every receipt, pushed into QuickBooks.',
        oneliner: 'A ledger of every donation receipt and event ticket Harvest issues — synced to QuickBooks as sales receipts, with per-item retry when one fails.',
        moment: 'For a church with a real treasurer, the giving-report request lands every month. Here, receipts flow into QuickBooks as sales receipts on their own — hours a month, gone.',
        admin: ['Ledger of every donation receipt & event ticket', 'Connect QuickBooks; sync all, or retry a single one', 'Per-receipt status, with the error kept on failure', 'A numbered PDF audit trail, QuickBooks or not'],
        member: ['Every gift arrives with a numbered PDF receipt', 'Clean records they can file themselves'],
        adminLabel: 'For admins', memberLabel: 'For givers',
        crosslinks: [{ label: 'Donation Page', href: '/features/giving-finance#donation' }, { label: 'CRM', href: '/features/giving-finance#crm' }],
      },
      /* Hidden behind AFFILIATE_PROGRAM_ENABLED. The terms (flat 15%, 12 months
         from signup, converted customers only) are settled; the payout rail is
         not — subscription billing is moving off Stripe to Dodo Payments, so
         this copy names no processor. Do not put one back in, and do not
         un-hide the entry, until that migration ships. */
      {
        id: 'affiliate', name: 'Affiliate Program', n: '5',
        accent: 'var(--gold-600)', accentBg: 'var(--gold-100)', tiers: [1, 1, 1],
        eyebrow: '15% for their first 12 months',
        title: 'Refer a ministry. Earn 15% for a year.',
        oneliner: 'A flat 15% of what every church you refer pays, for their first 12 months — tracked automatically and paid out to you, not held as credit.',
        moment: 'Most SaaS affiliate programs pay once, on the first payment. Harvest pays for a full year — refer five churches on the $199 plan and that’s about $149 a month for twelve months, roughly $1,790 in total.',
        admin: ['Flat 15% — every plan, no tiers, no ladder', 'On everything they pay in their first 12 months', 'Trial starts don\'t count — only converted customers', 'Real money paid out to you, never platform credit'],
        member: ['A referral link, generated automatically', 'This-month pending & total earnings at a glance', 'Add your payout details whenever — earnings accrue either way'],
        adminLabel: 'For referrers', memberLabel: 'Your dashboard',
        crosslinks: [{ label: 'Donation Page', href: '/features/giving-finance#donation' }, { label: 'Pricing', href: '/#pricing' }],
      },
    ],
  },
  {
    slug: 'platform-brand', name: 'Platform & Brand', kicker: 'Own it',
    eyebrowColor: 'var(--gold-400)',
    heroBg: 'linear-gradient(180deg,#0C1526 0%,#0C1526 30%,#16294a 50%,#2f4f7a 66%,#6BA8DD 82%,#cadff1 92%,var(--cream) 100%)',
    headline: 'Built on Harvest.\nBranded as yours.',
    headWidth: 960, introWidth: 660,
    intro: 'An installable app with your name and icon, an admin dashboard where every volunteer sees only their part, your own domain — and the number that matters most: how many said yes to Jesus.',
    ctaHeading: 'Your ministry, on your own foundation.',
    secondary: { label: 'See pricing', to: '/#pricing' },
    seo: `A branded web app, an installable mobile PWA, a permissioned admin dashboard, your own domain${MULTI_CAMPUS_ENABLED ? ', additional campuses' : ''} and evangelism analytics.`,
    dark: true,
    features: [
      {
        id: 'webapp', name: 'Web App', n: '1',
        accent: 'var(--sky-600)', accentBg: 'var(--sky-100)', tiers: [1, 1, 1],
        eyebrow: 'Nothing to install, nothing to approve',
        title: 'Your church app opens in any browser.',
        oneliner: 'One app, web and mobile, on any device — no App Store review, no update cycle. You ship it and everyone has it.',
        moment: 'Every shareable link — a post, a sermon article, an event, a campaign — opens for anyone with no account. That\'s how a member\'s share reaches someone who\'s never heard of your church.',
        admin: ['Your own subdomain, or your own domain on Ministry', 'Tabs appear only when there’s something behind them', 'A real desktop layout, not a stretched phone view', 'Every request scoped to your tenant, in security rules'],
        member: ['Opens in any browser, any device', 'Public post, event, giving & form pages need no login', 'A logged-out visitor never touches member data', 'No install, no store, no waiting'],
        crosslinks: [{ label: 'Mobile App', href: '/features/platform-brand#pwa' }, { label: 'Community Feed', href: '/features/community-engagement#feed' }],
      },
      {
        id: 'pwa', name: 'Mobile App', n: '2',
        accent: 'var(--gold-600)', accentBg: 'var(--gold-100)', tiers: [1, 1, 1],
        tiersNote: 'Your own name, icon and colour on Ministry only — on Individual & Small Team the app installs with Harvest branding.',
        eyebrow: 'It\'s your app, right down to the icon',
        title: 'Your name and icon, on the home screen.',
        oneliner: 'Members install your app to their home screen on every plan. On Ministry it carries your name, icon and colour; on Individual & Small Team it installs with Harvest branding.',
        moment: 'Most “white-label” apps stop at the logo inside the app. On Ministry, Harvest carries your brand into the operating system itself — the install manifest is built per tenant, and even Apple\'s Add to Home Screen shows your icon, not a generic screenshot.',
        admin: ['Installable PWA & push notifications on every plan, via FCM', 'Your name, colour & icon in the install manifest on Ministry', 'A separate square app icon for the home-screen slot', 'iOS handled correctly via apple-touch-icon'],
        member: ['Installs like any app — no store, no account', 'Everyone gets your-church.theharvest.app; Ministry adds a custom domain', 'Your branding on Ministry; Harvest’s on Individual & Small Team', 'Launches standalone; cached content reads on a weak signal'],
        crosslinks: [{ label: 'Custom Branding', href: '/features/platform-brand#branding' }, { label: 'Web App', href: '/features/platform-brand#webapp' }],
      },
      {
        id: 'dashboard', name: 'Admin Dashboard', n: '3',
        accent: 'var(--navy-600)', accentBg: 'var(--stone-100)', tiers: [1, 1, 1],
        eyebrow: 'Your volunteers see only their part',
        title: 'One dashboard. Everyone sees only their piece.',
        oneliner: 'Twenty-three granular permissions per admin, plus location- and region-scoped access — so the check-in lead never sees donation records, and the treasurer never sees prayer requests.',
        moment: 'Churches run on volunteers, and trust boundaries between them are a pastoral concern, not just an IT one. The person running check-in doesn’t see giving; the campus pastor sees their campus and posts to their city, and nothing else.',
        admin: ['23 permissions across content, money, broadcasting & admin', 'Location-scoped analytics & region-scoped posting', 'Gated features are absent, not teased with a padlock', 'Drag-reorder nav — bottom bar & drawer, saved separately'],
        member: ['Admin seats scale by plan: 2 → 5 → 15', 'A purposeful upgrade screen, never a dead end', 'Roles assigned to a person, right inside the CRM', 'A first-run wizard for Stripe, branding & integrations'],
        adminLabel: 'Delegation', memberLabel: 'Setup',
        crosslinks: [{ label: 'CRM', href: '/features/giving-finance#crm' }, { label: 'Evangelism Analytics', href: '/features/platform-brand#analytics' }],
      },
      {
        id: 'branding', name: 'Branding & Domain', n: '4',
        accent: 'var(--green-600)', accentBg: 'var(--green-100)', tiers: [0, 0, 1],
        eyebrow: 'Nobody knows it\'s Harvest',
        title: 'Your name, logo, colour — and your own domain.',
        oneliner: 'Set your ministry name, logo, square icon and brand colour once, and point your own domain at it. The platform goes invisible.',
        moment: 'Your colour is injected server-side, before first paint — no flash of Harvest gold before yours loads. And it reaches the artifacts people keep: PDF certificates, donation receipts, public forms and check-in pages all carry your identity.',
        admin: ['Ministry name, logo, square icon & one brand colour', 'Colour applied before first paint — no branding flash', 'Custom domain on Ministry: guided DNS + live status', 'Branding carries onto receipts, certificates & forms'],
        member: ['An app that looks like yours, not ours', 'Your domain in the address bar', 'Receipts & certificates on your letterhead', 'Branding and your own domain on Ministry'],
        adminLabel: 'Make it yours', memberLabel: 'What people see',
        crosslinks: [{ label: 'Mobile App', href: '/features/platform-brand#pwa' }, { label: 'Multi-Campus', href: '/features/platform-brand#churches' }],
      },
      /* ⚠️ Hidden behind MULTI_CAMPUS_ENABLED, and it must stay hidden.
         Additional campuses are a DECIDED but UNBUILT paid add-on ($20/campus/mo
         on top of any plan; every plan already includes one). The copy below is
         corrected so it is accurate the day the add-on exists — it is not
         permission to render it. Do not flip the flag until the add-on billing
         actually ships; Harvest has shipped four claims about features that did
         not exist and this must not be the fifth.

         `tiers` is [0,0,0] deliberately: this is an add-on, not an entitlement
         of any plan, so no plan chip is truthful. Whoever un-hides this has to
         decide how an add-on should be presented in a plan-chip row — do not
         quietly relabel it as a Ministry feature. */
      {
        id: 'churches', name: 'Multi-Campus', n: '5',
        accent: 'var(--sky-600)', accentBg: 'var(--sky-100)', tiers: [0, 0, 0],
        eyebrow: '$20 a campus — the whole pricing page',
        title: 'Every campus on one platform.',
        oneliner: 'Every plan includes one campus. Add more — each with its own address, service times and pastor — at a flat $20/month per campus, confirmed before you’re ever charged.',
        moment: 'A planting network with 12 campuses knows their bill is $199 + $220 before they talk to anyone: one campus is in the plan, the other eleven are $20 each. No sales call, no custom quote — every competitor hides multi-site pricing behind a form.',
        admin: ['One campus on every plan; add more whenever you need them', 'Add locations with Google address autocomplete', 'Flat $20/mo each, added to your existing subscription', 'An explicit confirm dialog names the price first', 'Filter the roster by city, pastor or country'],
        member: ['Every campus on the member map, sorted by distance', 'Its own service times, pastor & contact', 'One-tap directions to the nearest one', 'One tenant, one member list & CRM across campuses'],
        adminLabel: 'For admins', memberLabel: 'For members',
        crosslinks: [{ label: 'Church Map', href: '/features/community-engagement#map' }, { label: 'Admin Dashboard', href: '/features/platform-brand#dashboard' }],
      },
      {
        id: 'analytics', name: 'Evangelism Analytics', n: '6',
        accent: 'var(--gold-600)', accentBg: 'var(--gold-100)', tiers: [1, 1, 1],
        eyebrow: 'The reason it’s called Harvest',
        title: 'How many said yes to Jesus — and where the rest are.',
        oneliner: 'Every other analytics page counts attendance and giving. This one counts people who accepted Jesus, and shows you which cities the ones who haven\'t are in.',
        moment: '“Which country is the harvest in this month?” Countries represented, drillable, with the faith question attached — on the $49 plan. It’s the kind of number a pastor screenshots for a board meeting.',
        admin: ['Total members, countries & new signups by window', 'The onboarding “accepted Jesus” answer, by city & country', 'CSV exports carry your own onboarding questions', 'Location-scoped access for campus leaders'],
        member: ['A required, editable faith question at onboarding', 'Their location powers the missions view', 'Pairs with geo-targeted posting to reach a city', 'On every plan, including $49'],
        adminLabel: 'For admins', memberLabel: 'How it’s gathered',
        crosslinks: [{ label: 'Community Feed geo-targeting', href: '/features/community-engagement#feed' }, { label: 'CRM', href: '/features/giving-finance#crm' }],
      },
    ],
  },
];

/* Feature ids whose marketing surfaces are hidden. Hiding one removes its
   section from its category page, which also removes the #<id> anchor — so
   every link that pointed at it has to be resolved, not just left to 404 into a
   page that silently doesn't scroll. `pointsAtHiddenFeature` is how. */
const HIDDEN_FEATURE_IDS: ReadonlySet<string> = new Set([
  ...(AFFILIATE_PROGRAM_ENABLED ? [] : ['affiliate']),
  ...(MULTI_CAMPUS_ENABLED ? [] : ['churches']),
]);

/** True when a href's #fragment names a feature that is currently hidden. */
const pointsAtHiddenFeature = (href: string) => {
  const i = href.indexOf('#');
  return i >= 0 && HIDDEN_FEATURE_IDS.has(href.slice(i + 1));
};

/** Drop a fragment whose section no longer renders, so the link lands at the
 *  top of the category page rather than on a dead anchor. */
const resolveHref = (href: string) =>
  (pointsAtHiddenFeature(href) ? href.slice(0, href.indexOf('#')) : href);

export const CATEGORIES: Category[] = ALL_CATEGORIES.map((c) => ({
  ...c,
  features: c.features
    .filter((f) => !HIDDEN_FEATURE_IDS.has(f.id))
    // `n` is the ordinal in each page's feature index, so it has to be
    // renumbered after a filter — otherwise hiding #5 leaves 1,2,3,4,6.
    .map((f, i) => ({
      ...f,
      n: String(i + 1),
      crosslinks: f.crosslinks?.filter((cl) => !pointsAtHiddenFeature(cl.href)),
    })),
}));

/* `tiers` is positional against the pricing plans and TypeScript can't express
   "exactly this long". A stale array renders a plan chip against the wrong tier
   — or drops one — so fail the build instead. */
for (const c of ALL_CATEGORIES) {
  for (const f of c.features) {
    if (f.tiers.length !== plans.length) {
      throw new Error(`Feature "${f.id}" has ${f.tiers.length} tiers, expected ${plans.length}.`);
    }
  }
}

/** Retired /features#<slug> anchor → the category page + section it now lives on.
 *  Read through `LEGACY_ANCHORS`, which resolves hidden targets. */
const LEGACY_ANCHOR_TARGETS: Record<string, string> = {
  'community-feed': '/features/community-engagement#feed',
  'groups': '/features/community-engagement#groups',
  'prayer-requests': '/features/community-engagement#prayer',
  'church-map': '/features/community-engagement#map',
  'event-registration': '/features/community-engagement#events',
  'check-in-system': '/features/community-engagement#checkin',
  'livestream-live-giving': '/features/community-engagement#livestream',
  'full-bible': '/features/discipleship-content#bible',
  'courses': '/features/discipleship-content#courses',
  'blog-publishing': '/features/discipleship-content#blog',
  'automated-seo-blog': '/features/discipleship-content#aiblog',
  'docs-notes': '/features/discipleship-content#docs',
  'ai-knowledge-base': '/features/ai-automation#knowledge',
  'ai-chat': '/features/ai-automation#aichat',
  // Split in two: the indexed slug names the Instagram generator, so it keeps
  // landing on that section rather than on the plain newsletter above it.
  'automated-newsletter': '/features/ai-automation#autonewsletter',
  'newsletter': '/features/ai-automation#newsletter',
  'sms-automation': '/features/ai-automation#sms',
  'sms-text-to-give': '/features/ai-automation#sms',
  'custom-forms-crm': '/features/ai-automation#forms',
  'custom-forms': '/features/ai-automation#forms',
  'donation-page': '/features/giving-finance#donation',
  'fundraising': '/features/giving-finance#fundraising',
  'crm-donors-members': '/features/giving-finance#crm',
  'crm': '/features/giving-finance#crm',
  'accounting-quickbooks': '/features/giving-finance#accounting',
  'tax-receipts-statements': '/features/giving-finance#accounting',
  // Both affiliate slugs stay mapped while the programme is hidden: they are
  // indexed and still have to land somewhere. With the section not rendering,
  // `resolveHref` drops the fragment and they arrive at the category page.
  'affiliate-program': '/features/giving-finance#affiliate',
  // Retired label — the mega-menu said "Affiliate Program", but the old slug is
  // still indexed and still has to land somewhere.
  'lifetime-affiliate': '/features/giving-finance#affiliate',
  'web-app': '/features/platform-brand#webapp',
  'mobile-app-pwa': '/features/platform-brand#pwa',
  'admin-dashboard': '/features/platform-brand#dashboard',
  'custom-branding-domain': '/features/platform-brand#branding',
  // Retired label — the section is now "Multi-Campus", because every plan
  // includes one campus and extras are a paid add-on, not an unlimited
  // entitlement. The old slug is indexed and still has to land somewhere.
  'unlimited-churches': '/features/platform-brand#churches',
  'multi-campus': '/features/platform-brand#churches',
  'evangelism-analytics': '/features/platform-brand#analytics',
};

/** Legacy slug → live destination, with fragments for hidden sections stripped
 *  so no indexed URL lands on an anchor that isn't on the page. */
export const LEGACY_ANCHORS: Record<string, string> = Object.fromEntries(
  Object.entries(LEGACY_ANCHOR_TARGETS).map(([slug, href]) => [slug, resolveHref(href)]),
);

export const CATEGORY_BY_SLUG: Record<string, Category> =
  Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));

/** Group name → category, so the Nav mega-menu's columns can link to their page. */
export const CATEGORY_BY_NAME: Record<string, Category> =
  Object.fromEntries(CATEGORIES.map((c) => [c.name, c]));

/** Path to a category page, e.g. /features/giving-finance. */
export const categoryHref = (slug: string) => `/features/${slug}`;

/** Deep link for a legacy catalog slug; falls back to the first category page. */
export const featureHref = (legacySlug: string) =>
  LEGACY_ANCHORS[legacySlug] || categoryHref(CATEGORIES[0].slug);
