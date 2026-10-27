/* Feature catalog for the five category pages under /features/*.
   Ported from the Claude Design handoff (Community & Engagement, Discipleship &
   Content, AI & Automation, Giving & Finance, Platform & Brand + FeatureBlock).

   `id` is the in-page anchor (e.g. /features/community-engagement#feed).
   LEGACY_ANCHORS maps the retired /features#<slug> anchors onto their new home
   so old deep links, the Nav mega-menu and indexed URLs all keep working. */

import {
  AFFILIATE_PROGRAM_ENABLED, CUSTOM_DOMAIN_MARKETING_ENABLED, MULTI_CAMPUS_ENABLED,
  NEWSLETTER_MARKETING_ENABLED, QUICKBOOKS_MARKETING_ENABLED, SMS_MARKETING_ENABLED,
  STRIPE_GIVING_MARKETING_ENABLED,
} from '../lib/flags';
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
    headline: 'Every Way for Your\nPeople to Belong.',
    headWidth: 900, introWidth: 620,
    intro: 'A private feed, prayer wall, groups, a map of your locations, event registration, QR check-in, service planning and livestream, in one app under your name.',
    ctaHeading: 'Everything your people need, in one home.',
    secondary: { label: 'See pricing', to: '/#pricing' },
    seo: 'Community feed, groups, prayer requests, locations, events, check-in, service planning and livestream in one app under your name.',
    features: [
      {
        id: 'feed', name: 'Community Feed', n: '1',
        accent: 'var(--sky-600)', accentBg: 'var(--sky-100)', tiers: [1, 1],
        eyebrow: 'Owned audience',
        title: 'A Private Community — Your Feed, No Algorithm',
        oneliner: 'Announcements, polls, photos and comments in a space that belongs to you — without a Facebook group deciding who sees your post.',
        moment: 'No algorithm decides who sees your announcement. You own the audience — every member, every post, every time.',
        admin: ['Inline composer — text, up to 3 images, live polls', 'Pin posts; embed a live campaign or event', 'Geographic targeting by country or city', 'Auto push notification on every new post', 'Delete or privately reply to any comment'],
        member: ['Realtime feed — new posts appear live', 'Like, vote in polls, comment and RSVP', 'Share any post to a public link', 'Save posts and open images full-screen'],
        crosslinks: [{ label: 'Blog', href: '/features/discipleship-content#blog' }, { label: 'Fundraising', href: '/features/giving-finance#fundraising' }, { label: 'Events', href: '/features/community-engagement#events' }],
      },
      {
        id: 'groups', name: 'Groups', n: '2',
        accent: 'var(--navy-600)', accentBg: 'var(--stone-100)', tiers: [1, 1],
        tiersNote: 'Church includes channels and direct messages inside its one community; Ministry runs unlimited communities.',
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
        accent: 'var(--green-600)', accentBg: 'var(--green-100)', tiers: [1, 1],
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
        accent: 'var(--sky-600)', accentBg: 'var(--sky-100)', tiers: [1, 1],
        eyebrow: 'Where do I go?',
        title: 'Every Location on a Map, Sorted by Distance.',
        oneliner: 'A member-facing locator for your locations — the \'where do I go?\' question, answered.',
        moment: 'The list reorders itself by distance. One tap opens directions.',
        admin: ['Add locations with Google address autocomplete', 'Automatic geocoding fallback + manual lat/lng', 'Full record: schedule, pastor, contact, socials'],
        member: ['Interactive map with a marker per location', '“Locate me” plus distance sorting', 'Set a home location; get directions in one tap', 'Service times, pastor and tap-to-copy contact'],
        crosslinks: [{ label: 'Event Registration', href: '/features/community-engagement#events' }, { label: 'Check-In', href: '/features/community-engagement#checkin' }],
      },
      {
        /* 🔴 THE-355 — THE PAYMENT HALF, AND ONLY THE PAYMENT HALF. Registration
           itself is untouched and is what this entry now sells.
           `/api/event-registration/submit` computes `requiresPayment = amount >
           0 && !waitlisted`, so a free ticket, a waitlist entry and a ticket
           discounted to $0 never reach Stripe and confirm immediately; anything
           that DOES owe money fails on the tenant's `connectAccountId`, which
           no church has while the platform account is closed.

           ⚠️ DISCOUNT CODES LEFT WITH THE PRICE, and that is not a style edit.
           A code reduces `ticketType.price`; on a free ticket there is nothing
           for it to reduce, so the only codes that do anything are on tickets
           that cannot currently be sold.

           ⚠️ EVERY SURVIVING LINE WAS RE-CHECKED against that same route: it
           enforces per-ticket-type capacity, waitlists a whole party together
           ("a couple can't take half a seat"), and emails a confirmation
           carrying a QR generated from the ticket code — with no QR for a
           waitlisted seat, which is why the bullet says "confirmed". */
        id: 'events', name: 'Event Registration', n: '5',
        accent: 'var(--gold-600)', accentBg: 'var(--gold-100)', tiers: [0, 1],
        eyebrow: STRIPE_GIVING_MARKETING_ENABLED ? 'The money never touches us' : 'Registered, scanned, through the door',
        title: STRIPE_GIVING_MARKETING_ENABLED
          ? 'Ticketing where the money never touches us.'
          : 'Sign Up on a Phone. Walk In on a Scan.',
        oneliner: STRIPE_GIVING_MARKETING_ENABLED
          ? 'Ticket types, waitlists, discount codes and QR check-in — with payment going straight to your own Stripe account.'
          : 'Ticket types, waitlists and group booking — event registration with a confirmation QR at the door.',
        moment: STRIPE_GIVING_MARKETING_ENABLED
          ? 'Paid tickets are a destination charge straight to the ministry\'s own Stripe account. The money never touches our platform. That is a trust argument worth its own paragraph.'
          : 'A first-time visitor opens the event page on their phone, registers with no account and no app, and has a confirmation with a scannable code before they have put the phone down. On the day, somebody at the door scans it. Nothing else has to happen.',
        admin: ['Multiple ticket types, each with its own capacity',
          STRIPE_GIVING_MARKETING_ENABLED
            ? 'Discount codes, per-event waitlist, group booking'
            : 'Per-event waitlist; a whole party is waitlisted together',
          'Draft → publish, manual check-in, CSV export', 'Pin an event to the top of the community feed'],
        member: ['Register at a public event page — no account',
          'Confirmation email with a scannable QR once confirmed',
          '“My Tickets” with a full-screen QR code',
          'Household / group registration on one booking'],
        crosslinks: [{ label: 'Giving', href: '/features/giving-finance#donation' }, { label: 'CRM', href: '/features/giving-finance#crm' }, { label: 'Check-In', href: '/features/community-engagement#checkin' }],
      },
      {
        id: 'checkin', name: 'Check-In System', n: '6',
        accent: 'var(--sky-600)', accentBg: 'var(--sky-100)', tiers: [0, 1],
        eyebrow: 'Attendance becomes data',
        title: 'Print a QR, tape it to the door.',
        oneliner: 'Check-in and attendance tracking that lands in your CRM — visitors and members scan, enter a first name, and they are done. No app, no account.',
        moment: 'The bar for a first-time visitor is “point your camera at this.” No app, no account, no line at a kiosk — and attendance quietly becomes data.',
        admin: ['Create a session, optionally linked to an event', 'Live attendee count and manual check-in', 'CSV export of the full attendee list', 'Bundled QR generator for five destinations'],
        member: ['Scan, enter a first name, done — no login', 'A branded self check-in page', 'Attendance auto-links to CRM contacts'],
        crosslinks: [{ label: 'CRM', href: '/features/giving-finance#crm' }, { label: 'Event Registration', href: '/features/community-engagement#events' }],
      },
      {
        /* 🔴 THE-335 — A LIVE FEATURE, not a coming-soon entry. The founder: "Put
           the scheduler as a live feature in the marketing site", clarified as
           "Service scheduler I mean not the one for social media."

           ⚠️ THIS IS NOT THE HARVEST SCHEDULER. That is social-media publishing,
           it is still coming-soon on this site, and it is NOT built — see
           `the-284-harvest-scheduler.test.ts`. Confusing the two would claim an
           unbuilt product as shipped, which is the exact class of bug this site
           has fixed six times.

           🔴 THE TIER IS VERIFIED, NOT ASSERTED. `tiers: [0, 0, 1]` because the
           app gates every service-planning surface on the `eventRegistration`
           plan cell — the Services nav entry, the screen behind it, and
           `/api/rota/invitations` — and that cell is true on Ministry alone. The
           write permission on top of it is `manageEvents`, the same one the
           `servicePlans` and `rotaInvitations` Firestore rules require; there is
           deliberately no separate planning permission. A tier claim that outran
           the app is what this site keeps having to correct, so
           `the-335-service-planner-live.test.ts` reads the tier off the app's
           published plan catalogue rather than restating it here.

           🔴 WHAT THIS COPY MUST NEVER CLAIM, because none of it exists: a song
           library, CCLI numbers or reporting, chord charts, rehearsal scheduling,
           and availability blockouts. `service-plan.ts` names all five as
           deliberately absent. They are what is LEFT in the Coming Soon entry
           this feature was promoted out of, and claiming any of them here would
           put the same capability on the site in two tenses.

           ⚠️ THE INVITATION IS EMAIL. It goes out through the church's own
           connected Gmail — so the copy says "email" and does not say "text":
           SMS is hidden in this very ticket, and a serving text is the thing
           email is replacing. */
        id: 'services', name: 'Service Planning', n: '7',
        accent: 'var(--sky-600)', accentBg: 'var(--sky-100)', tiers: [0, 1],
        eyebrow: 'Service planning + volunteer invites',
        title: 'Plan the Service. Invite the Team.',
        oneliner: 'Build the service run sheet with your team \u2014 every item, how long it runs and who is doing it \u2014 then invite those people and see who has said yes.',
        moment: 'The run sheet stops being a document somebody emails round on Thursday. Timings add up on their own, so moving one item moves everything after it, and the person on the door finds out by email instead of by group chat.',
        admin: ['An order of service you reorder \u2014 durations become clock times', 'Assign people to items; double-bookings are flagged', 'See who has not served recently, and which slots are still empty', 'Invite by email and read each answer; send a reminder'],
        member: ['An email saying what they are doing and when', 'One link to accept or decline \u2014 no sign-in, no account', 'A reminder before the day, if they have not answered'],
        adminLabel: 'For the team', memberLabel: 'For volunteers',
        crosslinks: [{ label: 'Event Registration', href: '/features/community-engagement#events' }, { label: 'Check-In', href: '/features/community-engagement#checkin' }, { label: 'Livestream', href: '/features/community-engagement#livestream' }],
      },
      {
        id: 'livestream', name: 'Livestream + Live Giving', n: '8',
        accent: 'var(--gold-600)', accentBg: 'var(--gold-100)', tiers: [0, 1],
        eyebrow: 'The prayer that reaches the pastor',
        title: 'Go live — and reach the person watching alone.',
        oneliner: 'Stream on YouTube, keep the congregation inside your app: prayer, chat, sermon notes and giving one tap away.',
        moment: 'Someone watching alone at home types a prayer request — and a real person at the pastor’s console marks it prayed. Lead with this, not the video player.',
        admin: ['Paste a YouTube URL or ID — one button to go live', 'Live viewer and prayer counts, with a peak record', 'Live prayer queue — tap “Prayed” to clear one', 'Delete any chat comment; archive every session'],
        /* 🔴 THE-355 — "give in one tap" WAS A CARD CLAIM. The Give control on
           the stream opens `/?giving=1` (`MainApp.tsx`), which is the member
           Give tab — and with Stripe off that tab draws the church's own payment
           links rather than an amount picker. So the giving page really is one
           tap from the stream; what is not true is that the gift completes
           there. The rest of this entry claims nothing about money. */
        member: ['Gold “Live Now” banner on Home the instant you start', 'Embedded player with realtime chat', 'Submit a prayer request straight to the pastor',
          STRIPE_GIVING_MARKETING_ENABLED
            ? 'Sermon notes synced to the stream; give in one tap'
            : 'Sermon notes synced to the stream; your giving page one tap away'],
        crosslinks: [{ label: 'Giving', href: '/features/giving-finance#donation' }, { label: 'Docs', href: '/features/discipleship-content#docs' }, { label: 'Prayer', href: '/features/community-engagement#prayer' }],
      },
    ],
  },
  {
    slug: 'discipleship-content', name: 'Discipleship & Content', kicker: 'Grow',
    eyebrowColor: 'var(--gold-700)',
    heroBg: 'linear-gradient(180deg,#e8dcc6 0%,#efe6d5 44%,#f5efe4 72%,var(--cream) 100%)',
    headline: 'Discipleship That Doesn’t\nEnd on Sunday.',
    headWidth: 920, introWidth: 640,
    intro: 'The full Bible, a course builder, a real blog, and sermon notes that reach every screen — everything to feed your people all week, not just from the stage.',
    ctaHeading: 'Give your people something to grow on.',
    secondary: { label: 'See pricing', to: '/#pricing' },
    seo: 'The full Bible, courses, blog publishing, AI-drafted SEO articles and shared docs — discipleship content that keeps working all week.',
    features: [
      {
        id: 'bible', name: 'Full Bible', n: '1',
        accent: 'var(--gold-600)', accentBg: 'var(--gold-100)', tiers: [1, 1],
        eyebrow: 'On every plan',
        title: 'The whole Bible, inside your app.',
        oneliner: 'Eight translations, highlighting and one-tap sharing — so nobody ever has to leave your app to read scripture.',
        moment: 'The whole point of a ministry app is that your people open it. Give them a reason to switch to another Bible app and you\'ve lost them — so scripture lives right here.',
        admin: ['All 66 books, eight public-domain translations', 'Full-text search across the translation', 'Nothing to configure — on by default', 'No licensing fee or per-read cost'],
        member: ['Highlight verses in four colours', 'Save and copy verses with the reference', 'Share to any app via the native share sheet', 'Reads beautifully on mobile and desktop'],
        crosslinks: [{ label: 'Community Feed', href: '/features/community-engagement#feed' }, { label: 'Prayer', href: '/features/community-engagement#prayer' }],
      },
      {
        id: 'courses', name: 'Courses', n: '2',
        accent: 'var(--green-600)', accentBg: 'var(--green-100)', tiers: [1, 1],
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
        accent: 'var(--sky-600)', accentBg: 'var(--sky-100)', tiers: [1, 1],
        eyebrow: 'Found on search',
        title: 'People Searching Find You.',
        oneliner: 'A real publishing platform with the full SEO stack built in — so people searching for your ministry can find your page.',
        moment: 'Each post includes the markup search engines read, so people can find your teaching.',
        admin: ['Rich editor with images, categories & tags', 'Draft, schedule or publish', 'Server-rendered with SEO title, meta, OpenGraph & schema.org', 'Latest posts surface in the community feed'],
        member: ['Read in a clean Blog tab', 'Filter by category, full-text search', 'Share any article', 'Related posts keep them reading'],
        crosslinks: [{ label: 'Community Feed', href: '/features/community-engagement#feed' }],
      },
      {
        id: 'aiblog', name: 'Automated SEO Blog', n: '4',
        accent: 'var(--gold-600)', accentBg: 'var(--gold-100)', tiers: [0, 1],
        eyebrow: 'Grounded in your teaching',
        title: 'Your own sermons, rewritten for search.',
        oneliner: 'Draw on your uploaded teaching to generate a search-optimised article grounded in what your ministry actually believes — not a generic model\'s guess.',
        moment: 'This isn\'t AI slop. It reads your knowledge base — your sermons, your notes — and restructures your own theology for search. Your own teaching can reach more people.',
        admin: ['Reads your AI Knowledge Base as the only source', 'Needs your teaching first — never invents doctrine', 'Generates SEO title, meta, slug & full article to spec', '⚡ Generate an article on demand'],
        member: ['Reads like any other article on your blog', 'Tagged so you always know what was AI-drafted', 'Full SEO treatment, same as hand-written posts'],
        crosslinks: [{ label: 'AI Knowledge Base', href: '/features/ai-automation#knowledge' }, { label: 'Blog', href: '/features/discipleship-content#blog' }],
      },
      {
        id: 'docs', name: 'Docs & Notes', n: '5',
        accent: 'var(--navy-600)', accentBg: 'var(--stone-100)', tiers: [1, 1],
        tiersNote: 'Docs and sermon notes are on Church and Ministry. Pushing notes to a live stream needs Ministry, because that is where livestream itself is.',
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
    headline: 'AI With a Conscience,\nBuilt for Ministry.',
    headWidth: 940, introWidth: 660,
    // THE-245 — the category blurb named SMS among what it carries. While the
    // feature is hidden it names what is actually there.
    intro: SMS_MARKETING_ENABLED
      ? (NEWSLETTER_MARKETING_ENABLED
        ? 'A coming-soon assistant will answer from your teaching and point members to prayer. Plus a newsletter, SMS, and forms that turn effort you’ve already spent into people you can reach.'
        : 'A coming-soon assistant will answer from your teaching and point members to prayer. Plus SMS and forms that turn effort you’ve already spent into people you can reach.')
      : (NEWSLETTER_MARKETING_ENABLED
        ? 'A coming-soon assistant will answer from your teaching and point members to prayer. Plus a newsletter and forms that turn effort you’ve already spent into people you can reach.'
        : 'A coming-soon assistant will answer from your teaching and point members to prayer. Plus forms that turn effort you’ve already spent into people you can reach.'),
    ctaHeading: 'AI your congregation can trust.',
    secondary: { label: 'See pricing', to: '/#pricing' },
    seo: SMS_MARKETING_ENABLED
      ? (NEWSLETTER_MARKETING_ENABLED
        ? 'An AI knowledge base trained on your teaching, a coming-soon chat assistant that knows when to point to prayer, automated newsletters, SMS and forms that feed your CRM.'
        : 'An AI knowledge base trained on your teaching, a coming-soon chat assistant that knows when to point to prayer, SMS and forms that feed your CRM.')
      : (NEWSLETTER_MARKETING_ENABLED
        ? 'An AI knowledge base trained on your teaching, a coming-soon chat assistant that knows when to point to prayer, automated newsletters and forms that feed your CRM.'
        : 'An AI knowledge base trained on your teaching, a coming-soon chat assistant that knows when to point to prayer, and forms that feed your CRM.'),
    features: [
      {
        id: 'knowledge', name: 'AI Knowledge Base', n: '1',
        /* 🔴 [0, 1] — THE KNOWLEDGE BASE IS A MINISTRY INCLUSION. The approved
           two-plan spec lists "AI knowledge base" under Ministry, so Ministry's
           chip is lit and Church's is not. (It was [0, 0, 0] under THE-253, when
           no tier included it and the AI Assistant add-on lifted it.)

           ⚠️ THE MEMBER-FACING CHAT IS STILL THE ADD-ON — see `aichat` below. The
           chat answers ONLY from this knowledge base, so a Ministry church has
           the base and buys the chat; the add-on is attached to Ministry alone
           in Dodo. The unbuilt AI ASSISTANT with its 300 / 5,000 monthly
           messages is a different thing again and lives on the pricing cards,
           labelled "coming soon". */
        accent: 'var(--gold-600)', accentBg: 'var(--gold-100)', tiers: [0, 1],
        tiersNote: 'The AI Knowledge Base is included on Ministry. The AI assistant is coming soon: 300 messages a month on Church and 5,000 on Ministry.',
        eyebrow: 'The foundation',
        title: 'Teach it once. Everything downstream speaks in your voice.',
        oneliner: 'Feed in your sermons and teaching notes for content grounded in your ministry. AI Chat is coming soon.',
        moment: 'One upload makes every other AI feature yours. The knowledge base isn\'t a feature — it\'s the infrastructure that keeps the rest from sounding generic.',
        admin: ['Paste text, or upload .txt / .csv', 'Live meters for query use & capacity — no surprise cutoff', 'Delete a source and every trace of it is gone', 'Course lesson recaps can feed straight in'],
        member: ['Powers answers that sound like your ministry', 'A retracted sermon can never resurface', 'Nothing generic slips into what members read'],
        crosslinks: [{ label: 'AI Chat (coming soon)', href: '/features/ai-automation#aichat' }, { label: 'Automated SEO Blog', href: '/features/discipleship-content#aiblog' }, { label: 'Courses', href: '/features/discipleship-content#courses' }],
      },
      {
        id: 'aichat', name: 'AI Chat (coming soon)', n: '2',
        /* 🔴 [0, 0] — NO PLAN INCLUDES THE CHAT; IT IS THE ADD-ON (THE-253). A lit
           chip says "included in this plan", and member-facing AI Chat is not:
           it is the AI Assistant add-on, sold on Ministry alone. Church cannot
           buy it, and Ministry buys it on top. */
        accent: 'var(--green-600)', accentBg: 'var(--green-100)', tiers: [0, 0],
        tiersNote: 'AI assistant coming soon: 300 messages a month on Church and 5,000 on Ministry.',
        eyebrow: 'Coming soon',
        title: 'Coming soon: an assistant that points members to prayer.',
        oneliner: 'It answers from your ministry\'s own teaching — and after about ten questions, gently hands the conversation back to God with Scripture and steps to pray.',
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
        accent: 'var(--sky-600)', accentBg: 'var(--sky-100)', tiers: [0, 1],
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
        accent: 'var(--gold-600)', accentBg: 'var(--gold-100)', tiers: [0, 1],
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
        // 🔴 MINISTRY ONLY — THE-314. It was [1, 1, 1] when SMS was
        // bring-your-own and the app's plan cell gated nothing. Harvest resells
        // now and pays for every message, so `smsAutomation` is true on `max`
        // alone and an Individual or Small Team tenant meets an upgrade wall on
        // /admin/sms. A 1 in either of the first two columns would be this page
        // promising a capability the app refuses — the exact class of bug this
        // site has already corrected six times, and the reason
        // `the-314-sms-live.test.ts` VERIFIES this array against the app's
        // published plan catalogue rather than restating it.
        accent: 'var(--green-600)', accentBg: 'var(--green-100)', tiers: [0, 1],
        // ⚠️ The eyebrow read "Your Twilio, your rates" — bring-your-own, where
        // a church held the carrier account and negotiated its own per-message
        // price. It holds neither now: Harvest buys the number, sends on its own
        // account and bills for it, so the old line named a relationship that no
        // longer exists and a rate nobody negotiates.
        eyebrow: 'A number of your own',
        title: 'Text the whole church — and let them give with a word.',
        oneliner: 'Get a phone number from inside Harvest, send a broadcast to members, donors or any tag with a live cost counter — and let anyone give by texting one keyword to that number.',
        moment: '“Text GIVE to your ministry\'s number” on the closing slide is one of the most effective giving paths there is — and the number comes from inside Harvest, so there is no carrier account to open first.',
        admin: ['Buy your number from inside Harvest — no separate account to set up', 'Broadcast to all members, donors, or a tag', 'Live SMS segment counter — see cost before you send', 'Recipient preview with an exact count', 'Check-in thank-you texts sent automatically'],
        member: ['Text a keyword, get your giving link instantly', 'A thank-you text after checking in', 'Reply STOP and the texts stop', 'No spam — non-matching texts get no reply'],
        crosslinks: [{ label: 'Text-to-Give', href: '/features/giving-finance#donation' }, { label: 'CRM tags', href: '/features/giving-finance#crm' }, { label: 'Check-In', href: '/features/community-engagement#checkin' }],
      },
      {
        id: 'forms', name: 'Custom Forms → CRM', n: '6',
        accent: 'var(--navy-600)', accentBg: 'var(--stone-100)', tiers: [0, 1],
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
    headline: 'Keep 100% of Every Gift.',
    headWidth: 960, introWidth: 660,
    /* 🔴 THE-355 — "The money lands in your account, not ours" described a
       destination charge Harvest routed. It lands in the church's account
       because Harvest is not in the path at all, which is a stronger sentence
       and a true one. Behind the flag rather than deleted, per the "nothing is
       deleted" contract in lib/flags.ts. */
    intro: STRIPE_GIVING_MARKETING_ENABLED
      ? 'Giving, fundraising, a CRM that builds itself, and books that reconcile themselves — with no platform fee at all, on any plan. The money lands in your account, not ours.'
      : 'Online giving for ministries, campaigns, pledges, a CRM that builds itself and a receipt ledger you can export — with no platform fee at all, on any paid plan. Gifts go to the accounts your ministry already has; Harvest is never in the path.',
    ctaHeading: 'Keep more of every gift.',
    secondary: { label: 'See pricing', to: '/#pricing' },
    // 🔴 THE-335 — the SEO line named the sync too. A claim in a meta
    // description is a claim; it is what a search result shows.
    seo: `${STRIPE_GIVING_MARKETING_ENABLED ? 'Branded giving' : 'A giving page carrying your own payment links'}, fundraising and pledge campaigns, a donor and member CRM and ${QUICKBOOKS_MARKETING_ENABLED ? 'QuickBooks-synced receipts' : 'numbered PDF receipts'}${AFFILIATE_PROGRAM_ENABLED ? ', plus a 30% affiliate program' : ''} — with 0% platform fee on every donation.`,
    features: [
      {
        /* 🔴 THE-355 — REWORDED OFF STRIPE, NOT HIDDEN, and the distinction is
           the same one the `accounting` entry below makes. A church really does
           publish a giving page and really does take gifts through it; what
           stopped working is the PROCESSOR half of every sentence.
           `/api/stripe/donate` — the only card path behind this page,
           `CampaignWidget`, `PublicCampaign` and `PartnerWithUsTab` — refuses
           every request with 503 while the app's `STRIPE_CONNECT_ENABLED` is
           false, and the platform account behind it is closed as
           `rejected.fraud`.

           ⚠️ EVERY REPLACEMENT LINE TRACES TO APP CODE, and the file is named
           because a bullet is a claim just as much as a title is:

             · six providers, from one table — `components/donations/
               giving-providers.ts` (`GivingProviderId`, THE-246/249/254).
             · checked against its provider — `validateGivingUrl` is an
               ALLOW-LIST per provider, and `readGivingLinks` re-derives every
               stored URL against it on READ, so a link that no longer passes
               stops being a link.
             · a gift recorded by hand posts to the dashboard, accounting and
               the giver's history — `lib/manual-donation.ts` (THE-350) writes
               the same `donation_receipt` invoice the Stripe webhook wrote.
               🔴 THAT IS THE CRM's "Add Activity → Donation", NOT the campaign
               screen's "Record an offline gift", which moves a campaign total
               and writes no receipt at all. See the `fundraising` entry.
             · one page, no login, opens the app they already use — `MainApp`'s
               Give tab and `components/donations/GivingLinks.tsx`.

           🔴 THE TIER DID NOT MOVE, AND IT WAS RE-CHECKED RATHER THAN ASSUMED.
           `AdminDashboard.tsx` gates the Donations screen — the links editor
           included — on `canDonations = planAllows(features?.fundraising) &&
           canSettings`, and `fundraising` is false on Forever Free and true on
           plus / pro / max. A free tenant cannot publish a giving link at all,
           so "every paid plan" is still the true claim and [1, 1, 1] is still
           the true array. */
        id: 'donation', name: 'Donation Page', n: '1',
        accent: 'var(--gold-600)', accentBg: 'var(--gold-100)', tiers: [1, 1],
        eyebrow: STRIPE_GIVING_MARKETING_ENABLED ? 'You keep more' : 'Your accounts, not ours',
        title: STRIPE_GIVING_MARKETING_ENABLED
          ? 'Keep 100% of every gift, on every paid plan.'
          : 'Online Giving — Without Harvest Taking a Cut',
        oneliner: STRIPE_GIVING_MARKETING_ENABLED
          ? 'Give in three taps. Every dollar lands in your ministry\'s own Stripe account — Harvest takes 0% of every donation on every paid plan, and never holds your money.'
          : 'Publish your own PayPal, Cash App, Venmo, Zelle, Revolut and Wise links on one giving page. Harvest is never in the flow — no platform fee, nothing held.',
        moment: STRIPE_GIVING_MARKETING_ENABLED
          ? 'Most platforms take 2–5% of every gift, forever, with no way down. Harvest takes zero — on the cheapest paid plan and every plan above it. On a church doing $200k a year online, a 5% platform quietly takes $10,000. Harvest takes none of it; you pay us a flat subscription and nothing else.'
          : 'Giving software should not sit between the giver and the ministry. Most platforms sit between a ministry and the gift and take 2–5% of it, forever. Harvest does not sit there at all — a member taps the account your ministry already uses, and the money goes to it. There is nothing for us to route, nothing to hold and nothing to take a share of. You pay a flat subscription and nothing else.',
        admin: STRIPE_GIVING_MARKETING_ENABLED
          ? ['Gifts are destination charges to your own Stripe', 'Fail-closed — no Stripe connected, no gift routed elsewhere', 'A gift writes a receipt, a CRM record & campaign credit', 'Stripe\'s own processing fees are Stripe\'s, not ours']
          : ['Paste your own payment links — six providers', 'Every link checked against its provider before it goes live', 'Record a gift by hand and it posts to your dashboard, giving records and the giver’s history'],
        member: STRIPE_GIVING_MARKETING_ENABLED
          ? ['Preset amounts or your own, in three taps', 'No login — give to any church, even as a visitor', 'An emailed PDF receipt, instantly', 'Your full giving history, receipts included']
          : ['One page with every way to give', 'No login, on any phone', 'Taps straight into the app they already use'],
        crosslinks: [{ label: 'CRM', href: '/features/giving-finance#crm' }, { label: 'Fundraising', href: '/features/giving-finance#fundraising' }, { label: 'Text-to-Give', href: '/features/ai-automation#sms' }],
      },
      {
        /* THE-281 — the share button on the Donations screen.

           🔴 TIERS ARE `features.fundraising`, VERIFIED AGAINST THE APP, NOT
           GUESSED. The button lives on the admin Donations screen, and that
           screen is gated in AdminDashboard.tsx by
           `canDonations = planAllows(features?.fundraising) && canSettings`.
           `fundraising` is false on Forever Free and true on plus / pro / max,
           so the three plans this array addresses — Individual, Small Team,
           Ministry — all carry it, and [1, 1, 1] is the true claim.

           ⚠️ NOTE `planAllows`, NOT `navAllows`. Free does not get a walled
           Donations tab either; it has no donate page by decision. That is why
           the copy below says "on every paid plan" and never "on every plan" —
           the free tier genuinely does not have this, and Forever Free is a
           real, sold tier on this site.

           ⚠️ NOT A DUPLICATE OF `donation` ABOVE. That entry is the giving PAGE
           — what it holds and what a gift recorded against it reaches. This is
           the surface that hands that page's address to a congregation: a link,
           a native share sheet and a QR code.
           🔴 THE-355 CHANGED WHAT THAT DISTINCTION RESTS ON, and left this
           entry alone. It used to read "that entry is the STRIPE giving page —
           card gifts, receipts, destination charges", against which this one
           was the page carrying the church's own links. With the card half
           withdrawn both entries describe the same links, so the line between
           them is now PAGE versus SHARING rather than rail versus rail. Not one
           string in this entry moved: every claim it makes was about the
           church's own accounts to begin with, which is exactly why it needed
           no correction. */
        id: 'sharegiving', name: 'Shareable Giving Page', n: '2',
        accent: 'var(--gold-600)', accentBg: 'var(--gold-100)', tiers: [1, 1],
        eyebrow: 'Share giving from the platform',
        title: 'Put your giving page on the screen, in one tap.',
        oneliner: 'Tithe and offering software your members already know how to use — share the page that carries every way your ministry takes a gift, as a link, a native share sheet, or a QR code big enough to read from the back row.',
        moment: 'The offering is announced and nobody knows the link. One tap puts a QR on the screen at the front of the room — and the page behind it already lists every account your ministry actually uses.',
        admin: ['Share to any app from your phone\u2019s own share sheet', 'Copy the page and every payment link in one press', 'A downloadable QR code for the screen, a flyer or a bulletin', 'Every link is re-checked against its provider before it is shared'],
        member: ['One page with every way to give, however they prefer', 'Opens with no login, on any phone', 'Taps straight through to PayPal, Cash App, Venmo, Revolut or Wise', 'Scan the QR from a seat and give before the song ends'],
        adminLabel: 'For admins', memberLabel: 'For members',
        crosslinks: [{ label: 'Donation Page', href: '/features/giving-finance#donation' }, { label: 'Fundraising', href: '/features/giving-finance#fundraising' }],
      },
      {
        /* 🔴 THE-355 — TWO ENTRIES WHERE THERE WAS ONE. This one is CAMPAIGN
           ONLY; Pledge Campaigns is the entry directly below and every pledge
           sentence moved there.

           ⚠️ THE SPLIT IS NOT BEHIND THE FLAG, deliberately. A pledge is a
           commitment an admin records and tracks against what is paid, and no
           part of it ever went through `/api/stripe/donate` — tying the split
           to `STRIPE_GIVING_MARKETING_ENABLED` would make a live, Ministry-only
           capability vanish the day a card rail came back. The tiers are also
           different, which is the reason the pair could never be honest as one
           entry: this is [1, 1, 1] (`fundraising`, true on all three paid
           plans) and pledges are [0, 0, 1] (`pledgeCampaigns`, `max` alone).

           🔴 WHAT MOVES THE TOTAL, AND WHY ONE BULLET IS FLAGGED. `raised` is
           incremented per payment by the Stripe webhook, which is refusing; the
           live control is `AdminFundraising.tsx`'s "Record an offline gift"
           (THE-251), posting to `/api/campaigns/adjust-raised`. It ADDS rather
           than sets — a correction is a negative amount and both entries stay
           in the campaign's adjustment trail — and the app's own dialog says
           what it does not do: "That adds to the total; it does not create a
           receipt and will not appear on a giving statement." So the bullet
           says "record", never "receipt".

           ⚠️ THE PUBLIC CAMPAIGN PAGE CARRIES THE CHURCH'S OWN LINKS —
           `components/PublicCampaign.tsx` renders `GivingLinks` from the same
           `tenant.config` the logo comes from (THE-251, THE-303), and with
           Stripe off it draws no amount picker and no Donate button at all. */
        id: 'fundraising', name: 'Fundraising Campaigns', n: '3',
        accent: 'var(--green-600)', accentBg: 'var(--green-100)', tiers: [1, 1],
        eyebrow: 'A building fund isn\'t a GoFundMe',
        title: 'A Number Everyone Can Watch.',
        oneliner: STRIPE_GIVING_MARKETING_ENABLED
          ? 'Run a campaign with a goal, a cover image and a real-time progress bar — on a public page anyone can open without an account.'
          : 'Run a campaign with a goal, a cover image and a progress bar — on a public page that carries the accounts your ministry actually uses and opens without an account.',
        moment: STRIPE_GIVING_MARKETING_ENABLED
          ? 'A campaign needs a figure everyone can see moving. The campaign page carries the total, the goal and the story behind it — and every gift that lands moves the bar.'
          : 'A campaign needs a figure everyone can see moving. The campaign page carries the total, the goal and the story behind it — and beneath them, the accounts your ministry already takes gifts through. What comes in you record against the total, so the number on the page is one you can stand behind rather than one a processor decided.',
        admin: ['A goal, a cover image and an end date, set at creation',
          STRIPE_GIVING_MARKETING_ENABLED
            ? 'Progress bar credited automatically as gifts land'
            : 'Record gifts from your own payment links against the total',
          'A correction is a negative amount — both entries stay in the trail',
          'Embed a live campaign in a post on the community feed'],
        member: ['A public campaign page — no login',
          'Every way your ministry takes a gift, on the campaign page itself',
          'A progress bar against the goal, and the days still left'],
        crosslinks: [{ label: 'Pledge Campaigns', href: '/features/giving-finance#pledges' }, { label: 'Community Feed', href: '/features/community-engagement#feed' }, { label: 'Donation Page', href: '/features/giving-finance#donation' }],
      },
      {
        /* 🔴 THE-355 — PLEDGE CAMPAIGNS, ITS OWN ENTRY, DIRECTLY AFTER
           FUNDRAISING. Everything here was buried in the `fundraising` entry
           above, where it shared a title, a tier chip and a plan claim with a
           capability on a different plan: the chips read [1, 1, 1] and one
           bullet had to say "Pledge campaigns on Ministry" underneath them to
           correct the picture the chips had already painted. A tier a visitor
           has to read a bullet to un-learn is the class of claim this site
           keeps having to fix.

           🔴 THE TIER IS READ OFF THE APP, NOT ASSERTED. `utils/plan-features.ts`
           has `pledgeCampaigns: false` on free, plus and pro and `true` on max
           alone, and `AdminFundraising.tsx` computes `canPledge =
           platformOverride || !!features?.pledgeCampaigns` — which is the
           condition the "New campaign" type chooser renders behind. So
           [0, 0, 1], and `the-355-stripe-giving-hidden.test.ts` verifies it
           against the app's published plan catalogue rather than restating it.

           ⚠️ EVERY LINE TRACES TO APP CODE:
             · chosen at creation — `AdminFundraising.tsx`'s "New campaign"
               dialog offers "Fundraising" and "Pledge campaign".
             · pledged against paid — the Pledges tab totals `pledgeAmount` and
               `paidAmount` per donor; `dashboard/PledgeFulfilment.tsx` shows the
               same pair as a share.
             · status derived — `derivePledgeStatus` in `AdminFundraising.tsx`:
               fulfilled when paid ≥ pledged, lapsed when a due date has passed
               unpaid, active otherwise. Never a stored field.
             · a public page with no login — `src/app/pledge/[campaignId]/
               page.tsx` renders `PublicPledge`, which answers a commitment with
               "Thank you, {name}!" and carries the church's own giving links.
             · a deadline — `pledgeDeadline` on the campaign, and a `dueDate` per
               pledge.

           🔴 "OR A TEXT" IS GONE FROM THE PULPIT LINE, and not for style. The
           old bullet read "Pledge from the pulpit, a QR, or a text"; pledge
           reminders post to `/api/sms/broadcast`, and SMS is off in both repos —
           `SMS_MARKETING_ENABLED` here, and the app's own switch that mirrors it. A
           messaging channel this site calls unbuilt cannot be a way to pledge
           on the same site. */
        id: 'pledges', name: 'Pledge Campaigns', n: '4',
        accent: 'var(--green-600)', accentBg: 'var(--green-100)', tiers: [0, 1],
        eyebrow: 'Commit now, give later',
        title: 'Three hundred families, a thousand dollars each.',
        oneliner: 'A pledge campaign takes the commitment now and follows it until it is met — a ledger of pledged against paid, donor by donor, with the status worked out from the numbers.',
        moment: 'A ministry may need more than a progress bar — it may need commitments over time. A pledge campaign tracks exactly that, with a status derived from the numbers, never a stale manual field.',
        admin: ['Chosen at creation — "New campaign" asks Fundraising or Pledge',
          'A ledger of pledged against paid, donor by donor',
          'Status derived from the numbers: active, fulfilled or lapsed',
          'A campaign deadline, and a due date on each pledge'],
        member: ['A public pledge page — no login',
          'Commit an amount now and give it over the months that follow',
          'A confirmation the moment you commit'],
        crosslinks: [{ label: 'Fundraising Campaigns', href: '/features/giving-finance#fundraising' }, { label: 'CRM', href: '/features/giving-finance#crm' }, { label: 'Donation Page', href: '/features/giving-finance#donation' }],
      },
      {
        id: 'crm', name: 'CRM', n: '5',
        accent: 'var(--sky-600)', accentBg: 'var(--sky-100)', tiers: [1, 1],
        // The contact ceiling is the primary ladder between the three plans and
        // the pricing table was the only surface carrying it. The CRM is where
        // a contact lives, so it is where the limit belongs — a cap nobody can
        // find until checkout is the surprise this audience punishes hardest.
        tiersNote: 'The CRM itself is on every plan, Forever Free included; how many people it holds is what scales — 500 on Forever Free, 500 on Church, 5,000 on Ministry.',
        eyebrow: 'You never type a contact in',
        title: 'One record per person — built automatically.',
        /* 🔴 THE-355 — the GIVE half of two sentences, and only that half.
           `lib/donation-webhook.ts` is what created a contact that did not
           exist and re-typed an existing one to `donor` / `both`; it fires on a
           Stripe event, and no Stripe event arrives. A gift recorded by hand in
           the CRM increments `totalDonated` and writes a timeline entry, but
           `AdminCRM.tsx` writes `type: selected.type ?? 'member'` — it
           deliberately preserves the type rather than setting it — so the
           auto-typing is Stripe's alone.
           ⚠️ THE PIPELINE AND THE TOTALS ARE UNTOUCHED and stay claimed:
           `resolvePipelineStage(c.totalDonated)` derives the stage from a figure
           the manual path really does move. */
        oneliner: STRIPE_GIVING_MARKETING_ENABLED
          ? 'Give, register, check in or fill a form and a contact appears with the history attached. One person, one row — deduplicated by email, typed Donor & Member as they give. Connect Gmail and email them without leaving the dashboard.'
          : 'Register, check in or fill a form and a contact appears with the history attached. One person, one row — deduplicated by email, with every gift you record landing on it. Connect Gmail and email them without leaving the dashboard.',
        moment: 'A database can fill up with duplicate records. Harvest merges app members and manual contacts into one row on a stable link — so a person\'s giving history never scatters across three records.',
        // THE-245 — the last bullet sold tags on what they unlock in SMS. The
        // tags themselves are real and unchanged; only the SMS claim is withheld.
        admin: ['Members & manual contacts merged into one list', 'Contacts scale by plan: 500 → 2,000 → 4,000', 'Connect Gmail and email a contact from their record',
          STRIPE_GIVING_MARKETING_ENABLED
            ? 'Auto-typed member / donor / both as they give'
            : 'A gift you record posts to their timeline and their total',
          'Five-stage discipleship pipeline: New → Champion',
          SMS_MARKETING_ENABLED ? 'Tags that drive SMS broadcast targeting' : 'Tags you can segment and filter the whole list by'],
        member: ['A single profile that follows them everywhere', 'Giving, events, check-ins & forms on one timeline', 'Emails you send land from your own address', 'Total given & last gift always current'],
        crosslinks: [{ label: 'Custom Forms', href: '/features/ai-automation#forms' }, { label: 'Check-In', href: '/features/community-engagement#checkin' }, { label: 'SMS', href: '/features/ai-automation#sms' }],
      },
      {
        /* 🔴 THE-335 — REWORDED OFF QUICKBOOKS, NOT HIDDEN. The accounting
           ledger, the numbered PDF audit trail and the per-receipt record all
           ship and are what this entry now claims. Only the SYNC half is
           withdrawn, exactly as the `branding` entry below withdraws only the
           domain half: hiding a live capability to hide an untested integration
           on it is the overreach that shape exists to avoid.
           ⚠️ EVERY QUICKBOOKS SENTENCE IS BEHIND THE FLAG, including the ones
           inside `admin` — a bullet is a claim just as much as the title is. */
        id: 'accounting', name: 'Giving records', n: '6',
        accent: 'var(--navy-600)', accentBg: 'var(--stone-100)', tiers: [0, 1],
        eyebrow: 'Your treasurer stops asking',
        /* 🔴 RENAMED FROM "ACCOUNTING", AND THE ID STAYS. The anchor
           `#accounting` is indexed and linked (see LEGACY_ANCHORS), so only the
           words change. Giving records are the statements and year-end giving
           receipts a giver is owed, plus the ledger of every receipt Harvest
           issues. They are NOT accounting software and this entry must never
           read as a replacement for QuickBooks or any bookkeeping tool: the
           books stay wherever they are kept. The QuickBooks sync, when its flag
           is on, is a connection to that tool, not a substitute for it. */
        title: 'Giving statements and year-end receipts, ready when a giver asks.',
        oneliner: QUICKBOOKS_MARKETING_ENABLED
          ? 'Giving statements, year-end giving receipts and a ledger of every receipt Harvest issues — with a sync that sends them on to your QuickBooks, which keeps your books.'
          : 'Giving statements, year-end giving receipts and a ledger of every receipt Harvest issues, each with its own numbered PDF and a status you can read at a glance.',
        moment: 'When a giver asks for their year-end statement, or the treasurer asks for the giving report, the answer is already written: every gift recorded, numbered, dated and exportable. Your books stay where they are; this is the record of what was given.',
        admin: QUICKBOOKS_MARKETING_ENABLED
          ? ['Giving statements & year-end giving receipts', 'Ledger of every donation receipt & event ticket', 'Connect QuickBooks; sync all, or retry a single one', 'A numbered PDF audit trail, QuickBooks or not']
          : ['Giving statements & year-end giving receipts', 'Ledger of every donation receipt & event ticket', 'Per-receipt status, with the error kept on failure', 'A numbered PDF audit trail for every item issued'],
        /* 🔴 THE-355 — "ARRIVES WITH" WAS THE STRIPE WEBHOOK SPEAKING. It
           emailed a receipt at the moment a card cleared; nothing emails one
           when a member pays a church's PayPal, because Harvest never sees that
           payment. What IS true is the ledger: `lib/manual-donation.ts` writes
           the same `donation_receipt` invoice for a gift an admin records, so
           the numbered PDF exists and the giver can download it from their own
           record. The bullet says where the receipt IS, not when it lands. */
        member: [STRIPE_GIVING_MARKETING_ENABLED
          ? 'Every gift arrives with a numbered PDF receipt'
          : 'A numbered PDF receipt for every gift in the ledger',
          'Clean records they can file themselves'],
        adminLabel: 'For admins', memberLabel: 'For givers',
        crosslinks: [{ label: 'Donation Page', href: '/features/giving-finance#donation' }, { label: 'CRM', href: '/features/giving-finance#crm' }],
      },
      /* Hidden behind AFFILIATE_PROGRAM_ENABLED. The terms (flat 30%, 12 months
         from signup, converted customers only) are settled; the payout rail is
         not — subscription billing is moving off Stripe to Dodo Payments, so
         this copy names no processor. Do not put one back in, and do not
         un-hide the entry, until that migration ships. */
      {
        id: 'affiliate', name: 'Affiliate Program', n: '7',
        accent: 'var(--gold-600)', accentBg: 'var(--gold-100)', tiers: [1, 1],
        eyebrow: '30% for their first 12 months',
        title: 'Refer a ministry. Earn 30% for a year.',
        oneliner: 'A flat 30% of what every church you refer pays, for their first 12 months — tracked automatically and paid out to you, not held as credit.',
        moment: 'Most SaaS affiliate programs pay once, on the first payment. Harvest pays for a full year — refer five churches on the $90 plan and that’s about $135 a month for twelve months, roughly $1,620 in total.',
        admin: ['Flat 30% — every plan, no tiers, no ladder', 'On everything they pay in their first 12 months', 'Trial starts don\'t count — only converted customers', 'Real money paid out to you, never platform credit'],
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
    headline: 'Built on Harvest.\nBranded as Yours.',
    headWidth: 960, introWidth: 660,
    /* THE-280 — the category intro and SEO line each named a custom domain as
       something a church gets today. Behind the flag rather than deleted, per
       the "nothing is deleted" contract in lib/flags.ts. */
    intro: CUSTOM_DOMAIN_MARKETING_ENABLED
      ? 'An installable app with your name and icon, an admin dashboard where every volunteer sees only their part, your own domain — and the number that matters most: how many said yes to Jesus.'
      : 'An installable app with your name and icon, an admin dashboard where every volunteer sees only their part — and the number that matters most: how many said yes to Jesus.',
    ctaHeading: 'Your ministry, on your own foundation.',
    secondary: { label: 'See pricing', to: '/#pricing' },
    seo: 'A branded web app, installable mobile app, permissioned admin dashboard and evangelism analytics for your ministry.',
    dark: true,
    features: [
      {
        id: 'webapp', name: 'Web App', n: '1',
        accent: 'var(--sky-600)', accentBg: 'var(--sky-100)', tiers: [1, 1],
        eyebrow: 'Nothing to install, nothing to approve',
        title: 'Your App Opens in Any Browser.',
        oneliner: 'One app, web and mobile, on any device — no App Store review, no update cycle. You ship it and everyone has it.',
        moment: 'Every shareable link — a post, a sermon article, an event, a campaign — opens for anyone with no account. That\'s how a member\'s share reaches someone who\'s never heard of your ministry.',
        // THE-280 — the subdomain half is true and stays; only the custom-domain
        // half of this bullet is behind the flag.
        admin: [CUSTOM_DOMAIN_MARKETING_ENABLED ? 'Your own subdomain, or your own domain on Ministry' : 'Your own subdomain, on every plan', 'Tabs appear only when there’s something behind them', 'A real desktop layout, not a stretched phone view', 'Every request scoped to your tenant, in security rules'],
        member: ['Opens in any browser, any device', 'Public post, event, giving & form pages need no login', 'A logged-out visitor never touches member data', 'No install, no store, no waiting'],
        crosslinks: [{ label: 'Mobile App', href: '/features/platform-brand#pwa' }, { label: 'Community Feed', href: '/features/community-engagement#feed' }],
      },
      {
        id: 'pwa', name: 'Mobile App', n: '2',
        accent: 'var(--gold-600)', accentBg: 'var(--gold-100)', tiers: [1, 1],
        tiersNote: 'Your own name, icon and colour on Ministry only — on Forever Free and Church the app installs with Harvest branding.',
        eyebrow: 'It\'s your app, right down to the icon',
        title: 'Your name and icon, on the home screen.',
        oneliner: 'Members install your app to their home screen on every plan, Forever Free included. On Ministry it carries your name, icon and colour; on every other plan it installs with Harvest branding.',
        moment: 'Most “white-label” apps stop at the logo inside the app. On Ministry, Harvest carries your brand into the operating system itself — the install manifest is built per tenant, and even Apple\'s Add to Home Screen shows your icon, not a generic screenshot.',
        admin: ['Installable PWA & push notifications on every plan, via FCM', 'Your name, colour & icon in the install manifest on Ministry', 'A separate square app icon for the home-screen slot', 'iOS handled correctly via apple-touch-icon'],
        member: ['Installs like any app — no store, no account', CUSTOM_DOMAIN_MARKETING_ENABLED ? 'Everyone gets your-church.theharvest.app; Ministry adds a custom domain' : 'Everyone gets your-church.theharvest.app', 'Your branding on Ministry; Harvest’s on every other plan', 'Launches standalone; cached content reads on a weak signal'],
        crosslinks: [{ label: 'Custom Branding', href: '/features/platform-brand#branding' }, { label: 'Web App', href: '/features/platform-brand#webapp' }],
      },
      {
        id: 'dashboard', name: 'Admin Dashboard', n: '3',
        accent: 'var(--navy-600)', accentBg: 'var(--stone-100)', tiers: [1, 1],
        eyebrow: 'Your volunteers see only their part',
        title: 'One dashboard. Everyone sees only their piece.',
        oneliner: 'Twenty-three granular permissions per admin, plus location- and region-scoped access — so the check-in lead never sees donation records, and the treasurer never sees prayer requests.',
        moment: 'Ministries run on volunteers, and trust boundaries between them matter. The person running check-in doesn’t see giving; the location leader sees their location and posts to their city, and nothing else.',
        admin: ['23 permissions across content, money, broadcasting & admin', 'Location-scoped analytics & region-scoped posting', 'Gated features are absent, not teased with a padlock', 'Drag-reorder nav — bottom bar & drawer, saved separately'],
        /* 🔴 THE-355 — "STRIPE" LEFT THIS BULLET UNCONDITIONALLY, AND NOT
           BEHIND THE FLAG. Every other Stripe string on this site waits behind
           `STRIPE_GIVING_MARKETING_ENABLED` because it was true before the
           platform account closed and will be true again. This one never was:
           `components/PostPurchaseWizard.tsx` has four steps — Connect
           Instagram, Connect Mailchimp, Custom Domain and Brand Your App — and
           no payment step in any plan's sequence. Putting it behind the flag
           would schedule a false claim to come back. */
        member: ['Admin seats scale by plan: 2 → 5 → 15', 'A purposeful upgrade screen, never a dead end', 'Roles assigned to a person, right inside the CRM', 'A first-run wizard for branding & integrations'],
        adminLabel: 'Delegation', memberLabel: 'Setup',
        crosslinks: [{ label: 'CRM', href: '/features/giving-finance#crm' }, { label: 'Evangelism Analytics', href: '/features/platform-brand#analytics' }],
      },
      {
        /* 🔴 THE-280 — THE ENTRY THAT SOLD IT MOST DIRECTLY, and the one that
           must NOT be hidden whole. `customBranding` and `customDomain` are
           separate plan cells in the app and only the second is switched off: a
           church on this tier still sets its name, logo, icon and colour, and
           those still reach its receipts, certificates and forms. So this entry
           is REWORDED, not withdrawn — hiding it would have taken down a live,
           working capability to hide a dead one.
           `tiers` is untouched: branding is still this tier's, and the entry's
           id stays `branding`, so every crosslink and retired slug pointing at
           `#branding` still lands. */
        id: 'branding', name: CUSTOM_DOMAIN_MARKETING_ENABLED ? 'Branding & Domain' : 'Branding', n: '4',
        accent: 'var(--green-600)', accentBg: 'var(--green-100)', tiers: [0, 1],
        eyebrow: 'Nobody knows it\'s Harvest',
        title: CUSTOM_DOMAIN_MARKETING_ENABLED
          ? 'Your name, logo, colour — and your own domain.'
          : 'Your name, your logo, your colour.',
        oneliner: CUSTOM_DOMAIN_MARKETING_ENABLED
          ? 'Set your ministry name, logo, square icon and brand colour once, and point your own domain at it. The platform goes invisible.'
          : 'Set your ministry name, logo, square icon and brand colour once, and the platform goes invisible.',
        moment: 'Your colour is injected server-side, before first paint — no flash of Harvest gold before yours loads. And it reaches the artifacts people keep: PDF certificates, donation receipts, public forms and check-in pages all carry your identity.',
        admin: ['Ministry name, logo, square icon & one brand colour', 'Colour applied before first paint — no branding flash', ...(CUSTOM_DOMAIN_MARKETING_ENABLED ? ['Custom domain on Ministry: guided DNS + live status'] : []), 'Branding carries onto receipts, certificates & forms'],
        member: ['An app that looks like yours, not ours', ...(CUSTOM_DOMAIN_MARKETING_ENABLED ? ['Your domain in the address bar'] : []), 'Receipts & certificates on your letterhead', CUSTOM_DOMAIN_MARKETING_ENABLED ? 'Branding and your own domain on Ministry' : 'Your branding on Ministry'],
        adminLabel: 'Make it yours', memberLabel: 'What people see',
        crosslinks: [{ label: 'Mobile App', href: '/features/platform-brand#pwa' }, { label: 'Multi-Campus', href: '/features/platform-brand#churches' }],
      },
      /* ⚠️ Hidden behind MULTI_CAMPUS_ENABLED, and it stays hidden — but the
         reason has changed, so read this before assuming the old one.

         The add-on itself SHIPPED. Campus is live in Dodo at $12/campus/mo,
         attached to all three paid products, and THE-223 advertises it in
         Pricing.tsx's ADD_ONS where a buyable capacity belongs. What is still
         hidden is THIS: the feature-page treatment, which sells multi-campus as
         a capability rather than as the limit raise it is. Flipping the flag is
         now a marketing decision (and a CATALOG_TOOL_COUNT one), not a wait for
         billing.

         🔴 THE FIGURES BELOW WERE $20 AND WERE WRONG — a Campus price nothing
         rendered, nothing checked, and nobody could see. THE-223 corrected them
         to the live $12 and pinned the arithmetic to ADD_ONS in
         the-197-stale-prices.test.ts, so this copy cannot drift again while it
         waits behind the flag.

         `tiers` is [1,1]: campuses are included in both Church and Ministry
         under the two-plan pricing, and there is no add-on any more. */
      {
        id: 'churches', name: 'Multi-Campus', n: '5',
        accent: 'var(--sky-600)', accentBg: 'var(--sky-100)', tiers: [1, 1],
        /* 🔴 EVERY PRICE IN THIS BLOCK IS GONE — THE-370. It read "$12 a campus —
           the whole pricing page", "a flat $12/month per campus", "their bill is
           $60 + $132 … the other eleven are $12 each" and "Flat $12/mo each,
           added to your existing subscription", plus a confirm dialog that
           "names the price first".

           The founder retired the campus add-on — "remove the campus addon. let
           them add as many as they want." Campus is DETACHED from all nine live
           plan products, `maxChurches` is unlimited on every paid tier in the
           app's matrix, and the confirm dialog that named a price is deleted
           from AdminChurches. So every figure above was a charge that no longer
           exists, and the section says so instead.

           ⚠️ THIS IS BEHIND `MULTI_CAMPUS_ENABLED`, WHICH IS STILL FALSE, so
           none of it renders today. It is corrected rather than left because a
           false price waiting behind a flag is exactly how THE-197's stale
           figures survived — nothing rendered them, which is why they went
           stale unnoticed. */
        eyebrow: 'Every campus, at no extra charge',
        title: 'Every campus on one platform.',
        oneliner: 'Every paid plan runs as many campuses as you need — each with its own address, service times and pastor — at no extra charge.',
        moment: 'A planting network with 12 campuses pays the same as a church with one: nothing beyond the plan. No sales call, no custom quote, no per-site line item — every competitor hides multi-site pricing behind a form, and there is no multi-site price here to hide.',
        admin: ['As many campuses as you need on every paid plan', 'Add locations with Google address autocomplete', 'No per-campus charge and nothing added to your subscription', 'Filter the roster by city, pastor or country'],
        member: ['Every campus on the member map, sorted by distance', 'Its own service times, pastor & contact', 'One-tap directions to the nearest one', 'One tenant, one member list & CRM across campuses'],
        adminLabel: 'For admins', memberLabel: 'For members',
        crosslinks: [{ label: 'Church Map', href: '/features/community-engagement#map' }, { label: 'Admin Dashboard', href: '/features/platform-brand#dashboard' }],
      },
      {
        id: 'analytics', name: 'Evangelism Analytics', n: '6',
        accent: 'var(--gold-600)', accentBg: 'var(--gold-100)', tiers: [1, 1],
        eyebrow: 'The reason it’s called Harvest',
        title: 'How many said yes to Jesus — and where the rest are.',
        oneliner: 'Every other analytics page counts attendance and giving. This one counts people who accepted Jesus, and shows you which cities the ones who haven\'t are in.',
        moment: '“Which country is the harvest in this month?” Countries represented, drillable, with the faith question attached — on the Church plan. It’s the kind of number a pastor screenshots for a board meeting.',
        admin: ['Total members, countries & new signups by window', 'The onboarding “accepted Jesus” answer, by city & country', 'CSV exports carry your own onboarding questions', 'Location-scoped access for location leaders'],
        member: ['A required, editable faith question at onboarding', 'Their location powers the missions view', 'Pairs with geo-targeted posting to reach a city', 'On every plan, including Forever Free'],
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
  // THE-245 — SMS & Text-to-Give. Hiding the section also strips the four
  // crosslinks that point at `#sms` (from Donation Page, Check-In, Newsletter
  // and CRM), which matters more here than for the other two: three of those
  // sit on GIVING pages and one of them is labelled "Text-to-Give". Its retired
  // slugs are re-pointed at the Coming Soon entry below rather than merely
  // defragmented, so an indexed link lands somewhere that explains itself.
  ...(SMS_MARKETING_ENABLED ? [] : ['sms']),
  // THE-335 — Newsletter and Automated Newsletter. Hiding both also strips the
  // crosslinks that point at `#newsletter` and `#autonewsletter` (they point at
  // each other, and the Automated SEO Blog and Community Feed entries each carry
  // one), which `hiddenFragment` below re-points at the Coming Soon entry.
  //
  // 🔴 BOTH, NOT ONE. `autonewsletter` drafts FROM Instagram INTO the newsletter
  // editor and sends down the same path — there is no configuration in which one
  // works and the other does not, which is the same reasoning that takes
  // Text-to-Give with SMS. Leaving it would advertise an AI that fills a
  // composer this site no longer says exists.
  ...(NEWSLETTER_MARKETING_ENABLED ? [] : ['newsletter', 'autonewsletter']),
]);

/** True when a href's #fragment names a feature that is currently hidden.
 *
 *  ⚠️ READS CATEGORY-PAGE HREFS ONLY, which is safe because that is all this
 *  table and the crosslinks hold. Worth knowing if that ever changes:
 *  /features/coming-soon has its own id space which OVERLAPS this one —
 *  THE-245's entry is `#sms` on both pages, deliberately, because it is the
 *  same capability in two tenses — so a coming-soon href passed through here
 *  would have its fragment wrongly stripped. */
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
  /* THE-245 — both SMS slugs stay mapped here while the feature is hidden, on
     the same terms as the affiliate pair above: they are indexed and still have
     to land somewhere, and with the section not rendering `resolveHref` drops
     the fragment so they arrive at the top of the category page.

     ⚠️ NOT RE-POINTED AT THE COMING SOON ENTRY, though it is tempting and was
     tried. THE-247 made "a coming-soon item is never a redirect target" a rule
     and asserted it twice — every LEGACY_ANCHORS value must resolve to one of
     the five LIVE category pages, and no coming-soon item may appear in this
     table under its own slug. SMS is the first entry that has both a retired
     URL and a coming-soon home, so it is the first case where that rule costs
     something: a visitor following an indexed "SMS Automation" link lands on
     /features/ai-automation with no SMS section and no explanation. The
     Coming Soon entry is still reachable — it is the first column of the
     mega-menu — so the cost is a worse landing, not an unreachable page. Raised
     in the pull request rather than resolved by bending a tested invariant. */
  'sms-automation': '/features/ai-automation#sms',
  'sms-text-to-give': '/features/ai-automation#sms',
  'custom-forms-crm': '/features/ai-automation#forms',
  'custom-forms': '/features/ai-automation#forms',
  'donation-page': '/features/giving-finance#donation',
  /* THE-306 — NOT a retired anchor, and the one entry in this table that never
     was one. The mega-menu resolves its own destination through
     `slugify(title)` (see `itemHref` in components/Nav.tsx), so this table is
     also the LIVE menu's routing table, and a title with no row here falls back
     silently to the first category page. `Shareable Giving Page` slugifies to
     this, and its section is `#sharegiving` on the giving page.
     ⚠️ THE-306 ADDED NOTHING ELSE TO content/features.ts. The `sharegiving`
     entry's copy, bullets, tiers and tiersNote are byte-identical to THE-281's,
     and the-306-sharegiving.test.ts asserts that rather than trusting it. */
  'shareable-giving-page': '/features/giving-finance#sharegiving',
  /* 🔴 THE-355 — BOTH SPELLINGS OF THE CAMPAIGN ENTRY, and the new pledge one.
     The mega-menu resolves its own destination through `slugify(title)` (see
     `itemHref` in components/Nav.tsx), so this table is the LIVE menu's routing
     table as well as the redirect table for retired URLs — a title with no row
     here falls back silently to the first category page. The feature was
     renamed "Fundraising" → "Fundraising Campaigns" when pledges were split
     out, so `fundraising` is now a RETIRED slug (indexed, and the menu row's
     old spelling) and `fundraising-campaigns` is the live one. Both land on the
     same `#fundraising` anchor, which is unchanged.
     ⚠️ `pledge-campaigns` IS NOT A RETIRED URL — it is the THE-306 case exactly:
     a live menu row whose title has to resolve or the row goes to the fallback.
     Pledges have never had a URL of their own, so there is nothing to redirect
     and nothing indexed; this row exists for the menu. */
  'fundraising': '/features/giving-finance#fundraising',
  'fundraising-campaigns': '/features/giving-finance#fundraising',
  'pledge-campaigns': '/features/giving-finance#pledges',
  'crm-donors-members': '/features/giving-finance#crm',
  'crm': '/features/giving-finance#crm',
  // ⚠️ A RETIRED SLUG, NOT A CLAIM. THE-335 renamed the entry off QuickBooks,
  // which changes `slugify(name)` — this line keeps the OLD indexed URL landing
  // on the accounting entry, and must stay whatever the flag says.
  'accounting-quickbooks': '/features/giving-finance#accounting',
  // 🔴 THE-335 — the slug the RENAMED entry produces. Both are mapped, in both
  // flag states, because `slugify(name)` is what the mega-menu resolves and the
  // name is now flag-dependent: mapping only the live one would leave the other
  // falling through to a category page the moment the switch moved.
  'accounting': '/features/giving-finance#accounting',
  'giving-records': '/features/giving-finance#accounting',
  // 🔴 THE-335 — the same for the SERVICE PLANNING entry, promoted from Coming
  // Soon to a live feature in this ticket.
  'service-planning': '/features/community-engagement#services',
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
  // THE-280 — BOTH LABELS ARE MAPPED, which is the same treatment
  // `unlimited-churches` / `multi-campus` and the two affiliate slugs already
  // get. The mega-menu item is "Custom Branding" while custom domains are
  // hidden and "Custom Branding & Domain" when they are not, and the menu
  // resolves its own destination through `slugify(title)` — so a single mapping
  // would send one of the two spellings to the fallback. The section id is
  // `branding` either way, so both land on the same anchor.
  'custom-branding': '/features/platform-brand#branding',
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
