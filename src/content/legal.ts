import { SITE_ORIGIN } from './post-core';
import { CUSTOM_DOMAIN_MARKETING_ENABLED, SMS_MARKETING_ENABLED } from '../lib/flags';

/* The three legal policies, as data.
 *
 * Copy lives here rather than inside the page component for the same reason
 * features.ts and categories.ts exist: the routes, the footer column, the
 * prerender list and the sitemap all derive from one list, and the test suite
 * can read the finished prose without rendering a component (see legal.test.ts
 * — this repo's runner is node-only and deliberately renders nothing).
 *
 * ⚠️ EVERYTHING HERE MUST BE TRUE OF HARVEST AS IT SHIPS TODAY. A policy is
 * read as a commitment, not as marketing copy. Three rules follow from that:
 *
 *   - No capability Harvest does not have. Every product noun below is checked
 *     against content/features.ts, which is this repo's catalogue of what the
 *     app actually does. Harvest has shipped four claims about features that
 *     did not exist; one of them — a website builder — reached the first draft
 *     of these Terms, where a customer would have been entitled to rely on it.
 *     There is no page builder: a ministry's public presence is the app itself,
 *     branded per tenant on the Ministry plan. Say what the catalogue says.
 *   - No product that is decided but unbuilt. Paid add-ons in particular are
 *     priced and agreed but not sold, so naming one here would promise a
 *     product nobody can buy. legal.test.ts fails the build if one appears.
 *   - No legal entity. Harvest is pre-incorporation: there is no company name,
 *     company number or registered address to give, so none is invented, and
 *     nothing here claims a governing law or a jurisdiction. These documents
 *     need revisiting the day an entity exists.
 *
 * Tier prices are the other standing hazard — see TIER_PRICE_CLAIMS below. */

export type LegalSlug = 'terms' | 'privacy' | 'refunds';

/** A paragraph, or a bulleted list. Nothing here needs richer structure. */
export type LegalBlock = { kind: 'p'; text: string } | { kind: 'list'; items: string[] };

export interface LegalSection {
  /** Anchor id — stable, so a support reply can link to a clause. */
  id: string;
  heading: string;
  blocks: LegalBlock[];
}

export interface LegalDoc {
  slug: LegalSlug;
  /** `YYYY-MM-DD`. This document's own last-changed date — see LEGAL_UPDATED. */
  updated: string;
  /** <h1> and the page's own name. */
  title: string;
  /** Short label for the footer column. */
  nav: string;
  seoTitle: string;
  seoDescription: string;
  /** One-line standfirst under the heading. */
  standfirst: string;
  sections: LegalSection[];
}

const p = (text: string): LegalBlock => ({ kind: 'p', text });
const list = (...items: string[]): LegalBlock => ({ kind: 'list', items });

export const legalHref = (slug: LegalSlug) => `/${slug}`;
export const legalCanonical = (slug: LegalSlug) => `${SITE_ORIGIN}${legalHref(slug)}`;

/* Dates are PER DOCUMENT.
 *
 * They were one shared constant until THE-209, and that made a bump dishonest
 * in both directions: the Privacy Policy had changed materially twice — THE-198
 * named PostHog, THE-209 corrected what it says the app sends — while the Terms
 * and the Refund policy had not changed at all. One date meant either leaving
 * the privacy policy claiming a revision date it had outgrown, or restating two
 * untouched documents as revised. Each carries its own now, so a bump says
 * exactly which document moved.
 *
 * Each is pinned in legal.test.ts. Bump a document's own date whenever its
 * wording changes materially, and only that one. */

/** `YYYY-MM-DD`. The Terms and the Refund policy, neither changed since. */
export const LEGAL_UPDATED = '2026-08-10';

/** `YYYY-MM-DD`. The Privacy Policy, which has moved twice since the date above:
 *  THE-198 added the product-analytics disclosure, and THE-209 corrected it for
 *  the app's public pages (app repo PR #373). */
export const PRIVACY_UPDATED = '2026-08-23';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Formatted by hand rather than with toLocaleDateString: the prerender runs in
 *  Node and hydration runs in the visitor's browser, and a locale-dependent
 *  string differs between the two, which React reports as a hydration error. */
export function formatLegalDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/* ------------------------------------------------------------------ *
 * The paragraph this whole page set exists for.
 * ------------------------------------------------------------------ */

/** Harvest's revenue and its customers' donation flows are separate things, and
 *  a payments reviewer has to be able to see the line between them without
 *  inferring it. Stated once here, quoted verbatim in all three policies. */
export const THIRD_PARTY_PROCESSING =
  'Subscription fees cover access to the Harvest software. Congregational giving and donation ' +
  'features connect directly through third-party payment rails (Stripe Connect); Harvest does not ' +
  'hold, control or forward donation funds, and charges a 0% platform fee on them.';

/* ------------------------------------------------------------------ *
 * Tier prices quoted in the Terms.
 * ------------------------------------------------------------------ */

export interface TierPriceClaim {
  /** Matches `Plan.planId` in components/Pricing.tsx. */
  planId: string;
  name: string;
  monthly: number;
  /** Charged once every three months. */
  quarterly: number;
  /** Charged once for a year of service. */
  annual: number;
}

/**
 * The prices the Terms put in writing.
 *
 * ⚠️ These are deliberately literals, and deliberately NOT imported from
 * `plans`. Rendering them from the pricing data would make them impossible to
 * read in review and impossible to change on purpose; written out, they are a
 * claim that can be checked. `tierPriceMismatches` is that check, and
 * pages/LegalPage.tsx runs it at module scope, so a one-sided edit stops the
 * prerender and names the tier — the same idiom as the cross-repo price
 * contract in components/Pricing.tsx.
 *
 * This site has shipped a stale price in a blog post three times. A stale price
 * in the Terms is not an embarrassment, it is a false commercial claim, so the
 * check is a build failure rather than a warning.
 */
export const TIER_PRICE_CLAIMS: TierPriceClaim[] = [
  { planId: 'plus', name: 'Individual', monthly: 20, quarterly: 54, annual: 190 },
  { planId: 'pro', name: 'Small Team', monthly: 40, quarterly: 108, annual: 380 },
  { planId: 'max', name: 'Ministry', monthly: 80, quarterly: 216, annual: 760 },
];

/** Shape of the bits of `Plan` this check needs — passed in rather than
 *  imported so that build/blog-plugin.ts (and therefore vite.config.ts) can
 *  read the route list here without pulling a React component into Node. */
export interface PricedPlan {
  planId: string;
  name: string;
  price: { monthly: number; quarterly: number; yearly: number };
}

/** Every way the Terms and the pricing cards disagree, in plain English.
 *  Empty means the two are in step. */
export function tierPriceMismatches(plans: readonly PricedPlan[]): string[] {
  const problems: string[] = [];

  for (const plan of plans) {
    const claim = TIER_PRICE_CLAIMS.find((c) => c.planId === plan.planId);
    if (!claim) {
      problems.push(`the Terms quote no price for the "${plan.name}" (${plan.planId}) plan, which the pricing cards sell`);
      continue;
    }
    if (claim.name !== plan.name) {
      problems.push(`the Terms call ${plan.planId} "${claim.name}", the pricing cards call it "${plan.name}"`);
    }
    // Every term, table against table. This used to recompute the annual figure
    // from a billed-months multiplier; there is no multiplier now, and checking
    // the stored prices directly is what lets it see a wrong quarterly price at
    // all — the previous shape could not have caught one.
    for (const [term, claimed, charged] of [
      ['mo', claim.monthly, plan.price.monthly],
      ['qtr', claim.quarterly, plan.price.quarterly],
      ['yr', claim.annual, plan.price.yearly],
    ] as const) {
      if (claimed !== charged) {
        problems.push(`the Terms quote $${claimed}/${term} for ${plan.name}, the pricing cards charge $${charged}/${term}`);
      }
    }
  }

  for (const claim of TIER_PRICE_CLAIMS) {
    if (!plans.some((plan) => plan.planId === claim.planId)) {
      problems.push(`the Terms quote a price for "${claim.name}" (${claim.planId}), which is not a plan the site sells`);
    }
  }

  return problems;
}

/** `1791` → `1,791`. Grouped by hand rather than with toLocaleString, which
 *  varies by runtime locale and would differ between prerender and hydration. */
const usd = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const tierRows = TIER_PRICE_CLAIMS.map(
  (t) => `${t.name} — $${usd(t.monthly)} per month, $${usd(t.quarterly)} per three months, or $${usd(t.annual)} per year.`,
);

/* ------------------------------------------------------------------ *
 * Shared facts, stated once.
 * ------------------------------------------------------------------ */

/** Every third party that touches data on Harvest's behalf, and what it does.
 *  Named as vendors, which is what they are — none of them is Harvest. */
const SUB_PROCESSORS = [
  'Google Cloud (Firebase and Firestore) — the database and authentication behind every workspace.',
  'Cloudflare — file and media storage (R2), and network delivery.',
  'Vercel — hosting for this site and the Harvest application, and aggregated page-view analytics for this site.',
  'PostHog — product analytics inside the Harvest application, its public pages included: which screens are opened, recorded against an internal account id where someone is signed in and against a device identifier where nobody is, rather than against a name or an email address.',
  'Stripe — subscription payments, and the Stripe Connect rails your ministry uses to take gifts.',
  'Dodo Payments — subscription payment processing.',
  'Resend — transactional email, such as sign-in links, receipts of our own billing, and notifications.',
  'Upstash — queues, caching and rate limiting.',
];

/** The trial the product runs today.
 *
 *  ⚠️ CROSS-REPO: this number is not ours to pick. It is set on the six live
 *  Dodo products as `DODO_TRIAL_DAYS` in the app's src/lib/dodo/catalogue.ts,
 *  and nothing in the app's checkout path overrides it — so whatever Dodo is
 *  configured with is what a church actually gets. Dodo went live for
 *  subscriptions on 2026-08-12 carrying 14 days while this constant still read
 *  7, and for that window the site under-quoted its own trial by half: a worse
 *  offer than Harvest ships, and a Terms clause stating a length the product
 *  does not run. Read the app's catalogue before moving this, and change it
 *  here only to match what Dodo is already doing.
 *
 *  Every trial length on this site derives from it — the four CTAs, the FAQ
 *  answer and its SEO description, the Terms and the Refund policy. Nothing
 *  writes the number as a literal; legal.test.ts scans the source to keep it
 *  that way, because a literal is how the number went stale in five places at
 *  once. */
export const TRIAL_LENGTH_DAYS = 14;

/** The one CTA sentence on this site that quotes the trial. Hero, FinalCTA,
 *  Nav and SiteCTA all render this string rather than their own copy of it —
 *  four hand-written copies of one fact is precisely what left four buttons
 *  advertising a trial the product had stopped running. */
export const TRIAL_CTA_LABEL = `Start your FREE ${TRIAL_LENGTH_DAYS}-day trial`;

/** Dodo Payments is the merchant of record for Harvest subscriptions, which
 *  means the charge is Dodo's to make and the descriptor on the statement is
 *  Dodo's name, not Harvest's. A treasurer reconciling a card statement against
 *  a budget line has no way to work that out — the line item simply will not
 *  say Harvest — so it is disclosed where the money commitment is read: the
 *  pricing section and the Terms' billing clause.
 *
 *  Stated once, rendered once per surface. Two surfaces quoting one constant
 *  cannot drift; two surfaces each carrying their own sentence is the shape
 *  behind every stale claim this suite exists to catch. */
export const MERCHANT_OF_RECORD_NOTE =
  'Subscriptions are billed by Dodo Payments, Harvest’s merchant of record — so your card ' +
  'statement will read Dodo Payments, not Harvest.';

const CONTACT_LINE =
  'The quickest way to reach us is the contact form at theharvest.site/contact. It goes straight to ' +
  'the Harvest team, and we answer every message.';

/* ------------------------------------------------------------------ *
 * Terms of Service
 * ------------------------------------------------------------------ */

const TERMS: LegalDoc = {
  slug: 'terms',
  updated: LEGAL_UPDATED,
  title: 'Terms of Service',
  nav: 'Terms of Service',
  seoTitle: 'Terms of Service — Harvest',
  seoDescription:
    'The terms covering your use of Harvest: what the software includes, how plans are billed, and how congregational giving is processed separately through Stripe Connect.',
  standfirst: 'What you get, what you pay, and where the money goes.',
  sections: [
    {
      id: 'what-harvest-is',
      heading: '1. What Harvest is',
      blocks: [
        p('Harvest is software for churches and ministries, delivered over the web and as an installable mobile web app. One subscription gives your ministry its own workspace, and that workspace includes a contact and donor CRM, courses and the full Bible, events and registrations, QR check-in, and an editor for your blog, documents and sermon notes.'),
        /* 🔴 THE-280 — THESE ARE TERMS, and the rule the SMS bullet below sets
           applies with more force here: a clause describing a capability a
           church cannot use is a contractual statement about a service that is
           not being provided, and this document has already had to be corrected
           once for describing a website builder that did not exist. The domain
           clause is WITHHELD rather than reworded — there is nothing true to say
           about a domain that cannot be pointed. Branding is a separate
           capability that does ship, so it keeps its clause. */
        p(CUSTOM_DOMAIN_MARKETING_ENABLED
          ? 'Your ministry\'s public presence is the Harvest app itself rather than a separate site you assemble in it. Every workspace gets its own address on theharvest.app, and the Ministry plan adds your own domain, your logo and your brand colour.'
          : 'Your ministry\'s public presence is the Harvest app itself rather than a separate site you assemble in it. Every workspace gets its own address on theharvest.app, and the Ministry plan adds your logo and your brand colour.'),
        p('These terms cover your use of that software and of this website. By creating a workspace, or by using one someone has invited you into, you agree to them.'),
        p('Harvest is a young product built by a small team, and we would rather say what is true than what sounds impressive. Where these terms do not promise something, it is because we are not yet in a position to promise it.'),
      ],
    },
    {
      id: 'accounts',
      heading: '2. Your workspace and the people in it',
      blocks: [
        p('When you subscribe you become the owner of a workspace. You can invite other administrators up to the number your plan includes, and each of them acts on your ministry\'s behalf.'),
        p('You are responsible for who you invite, for what they do in the workspace, and for keeping sign-in credentials safe. Tell us as soon as you believe an account has been compromised and we will help you secure it.'),
        p('You are also responsible for the lawfulness of what you put into your workspace — the member records you upload, the content you publish, and the messages you send from it.'),
      ],
    },
    {
      id: 'trial',
      heading: '3. The free trial',
      blocks: [
        p(`Harvest starts with a ${TRIAL_LENGTH_DAYS}-day free trial. The trial gives you the plan you chose, with the same features and the same limits, for ${TRIAL_LENGTH_DAYS} days at no charge.`),
        p('If you cancel before the trial ends, you are not charged. If you do not cancel, the subscription continues on the plan you selected when the trial ends, and the first payment becomes due at that point.'),
        p('The trial length quoted here is the one the product runs today. If we change it, we will change it here in the same breath.'),
      ],
    },
    {
      id: 'plans-and-billing',
      heading: '4. Plans, prices and billing',
      blocks: [
        p('Harvest is sold on three plans. Prices are in US dollars, and each plan can be paid monthly, quarterly or annually:'),
        list(...tierRows),
        p('The quarterly and annual terms cost less than the same period paid month by month; each is charged as a single payment for the whole term, not as a reduced monthly payment. The plan you are on sets your workspace limits — contacts, administrator accounts and courses — and the features available to you; the current limits for each plan are published on the pricing page and are part of what you are buying.'),
        p('Subscriptions are recurring. A monthly plan renews every month, a quarterly plan every three months and an annual plan every year, charged to the card on file, until you cancel. We will always tell you before a price change takes effect on your subscription.'),
        p(MERCHANT_OF_RECORD_NOTE),
        p('Card details are entered with our payment providers and are held by them, not by Harvest. We never see or store a full card number.'),
        p('Cancellation, what happens to your workspace afterwards, and our position on refunds are set out in the Refund & Cancellation Policy.'),
      ],
    },
    {
      id: 'giving-and-donations',
      heading: '5. Giving, donations and third-party processing',
      blocks: [
        p(THIRD_PARTY_PROCESSING),
        p('In practice: your ministry connects its own Stripe account through Stripe Connect. Gifts given through your donation page, your fundraising campaigns or your livestream settle into that account, on Stripe\'s schedule, under your ministry\'s name. The money never passes through an account Harvest controls, and Harvest cannot move it, hold it back, or take a cut of it.'),
        p('What that means for you: your ministry is the one receiving the gift. You set up your own donation page, your campaigns and your receipting, you are responsible for acknowledging gifts and for any tax treatment that applies to them, and Stripe\'s own processing fees are a matter between your ministry and Stripe under your agreement with them. If a donor asks for a gift to be refunded, that refund is yours to make from your own Stripe account — Harvest has no ability to make it for you.'),
        p('The 0% platform fee applies to every plan. It is not an introductory rate, and there is no tier of Harvest that takes a percentage of giving.'),
      ],
    },
    {
      id: 'connected-services',
      heading: '6. Services you connect yourself',
      blocks: [
        p('Some parts of Harvest run on accounts you hold directly with another provider. Where that is the case, you contract with that provider, you pay them, and their terms and prices apply to you:'),
        // THE-245 — the Twilio line is withheld while SMS is hidden. 🔴 These
        // are TERMS: a bullet describing a connection a church cannot make is a
        // contractual statement about a service that is not being provided, and
        // this document has already had to be corrected once for describing a
        // website builder that did not exist. Withheld rather than reworded —
        // there is nothing true to say about a connection that is switched off.
        list(
          ...(SMS_MARKETING_ENABLED
            ? ['SMS is bring-your-own Twilio. You connect your own Twilio account and every message sent from Harvest is billed to you by Twilio at their rates.']
            : []),
          'Bulk newsletters go through your own Mailchimp account, on whatever Mailchimp plan you hold.',
          'Giving runs through your own Stripe account, as described above.',
        ),
        p('Transactional email that Harvest itself sends — sign-in links, notifications, and the like — is sent through our provider and is included in your subscription.'),
        p('We are not responsible for a third-party service being unavailable, changing its prices, or closing your account with them. If one of these connections breaks, the rest of Harvest keeps working.'),
      ],
    },
    {
      id: 'your-content',
      heading: '7. Your content and your data',
      blocks: [
        p('Your ministry\'s data is yours: your member and donor records, your courses, posts and sermon notes, your documents and files. Subscribing to Harvest does not transfer any of it to us and does not give us a claim over it.'),
        p('You give us permission to store, process and display that content for one purpose only: running the service for you. That includes the ordinary mechanics of a hosted product — backups, moving data between our infrastructure providers, and showing your content to the people you have given access to.'),
        p('You keep your right to take your data out. Export is never gated behind a payment, on any plan, at any point, including after you cancel.'),
        p('How member data is handled, and the split of responsibility between your ministry and Harvest for it, is set out in the Privacy Policy.'),
      ],
    },
    {
      id: 'acceptable-use',
      heading: '8. Acceptable use',
      blocks: [
        p('Use Harvest for ministry, and not for any of the following:'),
        list(
          'Anything unlawful, or anything that puts the people in your care at risk.',
          'Uploading malware, attempting to break into another ministry\'s workspace, or interfering with the platform\'s operation.',
          'Sending messages your recipients have not agreed to receive, or using member contact details for a purpose the members were not told about.',
          'Reselling access to your workspace, or reselling Harvest itself, to someone else.',
        ),
        p('If a workspace is being used this way we will contact you first wherever we can. We may suspend a workspace without warning only where leaving it running would cause harm or break the platform for others.'),
      ],
    },
    {
      id: 'availability',
      heading: '9. Availability and changes to the service',
      blocks: [
        p('We work to keep Harvest available and fast, but we do not currently offer a contractual uptime guarantee, and we would rather say so than publish a number we cannot stand behind. Planned maintenance is announced in advance where we can.'),
        p('Harvest is under active development. Features are added regularly, and occasionally something changes shape. If we make a change that materially reduces what your plan includes, we will tell subscribers before it takes effect.'),
        p('The software is provided as it is. We do not warrant that it will be uninterrupted or error-free, or that it will fit a particular purpose you have in mind for it.'),
      ],
    },
    {
      id: 'cancellation',
      heading: '10. Cancelling',
      blocks: [
        p('You can cancel at any time. Cancelling ends the subscription, not your access to your own data: your workspace is downgraded rather than closed, and you are never locked out of what you have already put in.'),
        p('The full detail — how to cancel, what stops, what keeps working, how long your data is kept, and when we will refund — is in the Refund & Cancellation Policy.'),
      ],
    },
    {
      id: 'changes',
      heading: '11. Changes to these terms',
      blocks: [
        p('When these terms change, the updated version is published on this page and the date at the top changes with it. Where a change materially affects subscribers, we will email you rather than rely on you noticing.'),
        p('Continuing to use Harvest after a change means the updated terms apply to you.'),
      ],
    },
    {
      id: 'contact',
      heading: '12. Contact',
      blocks: [
        p(CONTACT_LINE),
        p('If anything in this document is unclear, ask us. We would rather explain a clause than have you agree to something you have not understood.'),
      ],
    },
  ],
};

/* ------------------------------------------------------------------ *
 * Privacy Policy
 * ------------------------------------------------------------------ */

const PRIVACY: LegalDoc = {
  slug: 'privacy',
  updated: PRIVACY_UPDATED,
  title: 'Privacy Policy',
  nav: 'Privacy Policy',
  seoTitle: 'Privacy Policy — Harvest',
  seoDescription:
    'How Harvest handles data: your church is the controller of its members\' data and Harvest is the processor. What we store, where it lives, who else touches it, and how long we keep it.',
  standfirst: 'Your members\' data belongs to your ministry. We hold it on your instructions.',
  sections: [
    {
      id: 'controller-and-processor',
      heading: '1. Who is responsible for what',
      blocks: [
        p('This is the most important thing in this document, so it comes first. There are two different relationships here, and they carry different responsibilities.'),
        p('For the data your ministry holds about its members — contacts, donors, attendance, course progress, giving history — your ministry is the data controller. It decides what to collect, why, who may see it, and when it should go. Harvest is the data processor: we store and process that data on your instructions, in order to run the service you are paying for, and for nothing else. We do not sell it, we do not rent it, we do not use it to build advertising profiles, and we do not use one ministry\'s member data to serve another.'),
        p('For the data about your ministry\'s own relationship with Harvest — the administrator who signed up, billing records, support conversations, and the analytics of this marketing site and of the application itself — Harvest is the controller, because those are our decisions rather than yours.'),
        p('That split is why a member who wants their record corrected or removed should ask their church, and why a church that wants us to delete a workspace can simply tell us to.'),
      ],
    },
    {
      id: 'what-we-collect',
      heading: '2. What we hold as controller',
      blocks: [
        p('For our own relationship with your ministry we hold:'),
        list(
          'Account details — the name, email address and workspace details of the people who administer your Harvest workspace.',
          'Billing records — plan, billing period, payment status and invoices. Card details are held by our payment providers, not by us.',
          'Support and enquiry messages — anything you send us through the contact form on this site, so we can reply and keep track of the conversation.',
          'Aggregated page-view analytics for this marketing site, which tell us which pages are read. They count visits; they are not used to identify you. This covers theharvest.site only.',
          'Product analytics for the Harvest application itself, which tell us which parts of the app are used. This covers the whole application, including the pages it serves to the public. These work differently from the site analytics above, and they record two different things depending on who is looking.',
          'Where someone is signed in, the event is recorded against the internal account id of that person, and against the church their account belongs to. That id is not a name or an email address, but it does stand for a single person — so it is not anonymous, and we do not describe it as such.',
          'Where nobody is signed in, there is no account id and no stored profile of the visitor. What the event is recorded against instead is a random device identifier, kept in that browser. It is not a name or an email address either, and we never look up who it belongs to, but it singles out one browser across visits — so it is not anonymous, and we do not describe it as that either.',
        ),
      ],
    },
    {
      id: 'member-data',
      heading: '3. What we process on your ministry\'s behalf',
      blocks: [
        p('Everything your ministry puts into its workspace, we hold as processor. Depending on which parts of Harvest you use, that can include:'),
        list(
          'Contact and member records, including the names of children checked in where your ministry uses check-in that way.',
          'Donor records and giving history.',
          'Attendance and check-in records.',
          'Course enrolments and progress.',
          'Content your ministry creates — posts, sermon notes, courses, documents and uploaded files.',
          'Messages your ministry sends through Harvest, and the records of them.',
        ),
        p('We process it to provide the service, to keep it secure, to back it up, and to support you when you ask. If your ministry checks children in, the records that creates are treated exactly like any other data you control: held on your instructions, visible to the people you give access to, and deleted when you tell us to delete them.'),
      ],
    },
    {
      id: 'where-data-lives',
      heading: '4. Where the data lives, and who else touches it',
      blocks: [
        p('Harvest runs on infrastructure operated by other companies. Workspace data is stored in Firestore on Google Cloud; files and media are stored in Cloudflare R2; the site and application are served from Vercel.'),
        p('These are our sub-processors — the parties that handle data in the course of us running the service:'),
        list(...SUB_PROCESSORS),
        p('Each of them handles the data for the purpose named above and no other. We do not share your ministry\'s data with anyone else, and we do not disclose it to third parties for their own purposes.'),
        p('Product analytics sits apart from the rest of that list. It is held by PostHog on PostHog\'s own cloud infrastructure, separately from your workspace data: your workspace records are in Firestore, and the analytics are not stored with them, nor necessarily in the same country.'),
        p('What that processor is not allowed to do matters more than what it does. There is no session recording — the application does not capture or replay what is on your screen, and the code that would do it is switched off and blocked from being downloaded at all. Nothing is collected automatically from the page: what you click, type, copy or hover over is not read. Errors are not sent to it either.'),
        p('What is sent instead is a short, fixed list: that a screen was opened; which of three kinds of screen it was — an admin screen, a member screen, or a public one; and, where the person is signed in, the internal account id of that person and the church their account belongs to. No names, no email addresses, no giving, no message or prayer content.'),
        p('The screen is recorded as its route pattern and never as the address actually visited. A form opened at /form/aB3xQ is recorded as /form/[formId]; the identifier in the address — which form, which event, which blog post, which check-in — is replaced before anything leaves the browser, and an address the application does not recognise is recorded as /[unrouted] rather than passed through. The same replacement is applied to the other addresses the analytics code collects by itself, including the page address and the page you arrived from. A link followed from somewhere else keeps the name of the site it came from and loses the rest of the address.'),
        p('Two things still send nothing at all. This marketing site is a separate application and sends nothing to that processor. Sign-in and onboarding are deliberately left out of it: on those screens the analytics code is never started. Not started and configured not to look — never started, because they are the screens built out of email and password fields.'),
        p('One consequence of that is worth stating plainly, because it is new and because it applies to people who have no relationship with us at all. The application\'s public pages — a church\'s blog post, a form, an event or giving-campaign page, a children\'s check-in page — are now counted in the same way as the screens behind the login. Someone who opens one is counted without signing in, without an account, and without being asked first. Nothing about them is looked up and no profile of them is stored; what they are given is the random device identifier described above, written into their own browser, which is what lets a second visit be recognised as the same browser rather than a new one. If that browser has been signed in to Harvest before, the visit is counted against the account it was last signed in as, because it is the same browser.'),
        p('Product analytics sets one cookie in your browser. It is a first-party cookie, it lasts 365 days, and it holds whichever of the two identifiers above applies — the account id if you are signed in, the device identifier if you are not — together with the current session and a record of where you first arrived from. It is set on the public pages too, which means it can be set before you have signed in or been asked for anything.'),
      ],
    },
    {
      id: 'payments-privacy',
      heading: '5. Payments and giving',
      blocks: [
        p(THIRD_PARTY_PROCESSING),
        p('Practically, that means donor payment details are handled by Stripe under your ministry\'s own Stripe account, and Harvest never holds a card number. What Harvest stores is the record of the gift — amount, date, donor as your ministry recorded them — because your CRM, your receipting and your giving statements are built on it.'),
        p('Card details for your own Harvest subscription are handled by our payment providers in the same way: entered with them, held by them, never stored by us.'),
      ],
    },
    // THE-245 — the heading and the second paragraph both name SMS. A privacy
    // policy describing where phone numbers go is a statement about processing
    // that is not happening, so while SMS is hidden this section covers email
    // only. Nothing about Mailchimp or Resend changes.
    {
      id: 'messaging',
      heading: SMS_MARKETING_ENABLED ? '6. Email and SMS' : '6. Email',
      blocks: [
        p('Transactional email that Harvest sends on your behalf — notifications, sign-in links, confirmations — goes through Resend.'),
        SMS_MARKETING_ENABLED
          ? p('Bulk newsletters are sent from your ministry\'s own Mailchimp account, and SMS from your ministry\'s own Twilio account. Where that is how you have set things up, the contact details involved reach Mailchimp or Twilio under your agreements with them, and their privacy terms apply to what they do with them.')
          : p('Bulk newsletters are sent from your ministry\'s own Mailchimp account. Where that is how you have set things up, the contact details involved reach Mailchimp under your agreement with them, and their privacy terms apply to what they do with them.'),
      ],
    },
    {
      id: 'retention',
      heading: '7. How long we keep it',
      blocks: [
        p('While your subscription is active, we keep your workspace data for as long as you want it. You can delete records yourself at any time, and a deletion you make in the app is a real deletion.'),
        p('If you cancel, your data is retained for 12 months and then deleted. We do not spring that on you: we email a notice at 11 months, and a second notice at 11.5 months, before anything is removed. Within that window you can export everything, or resubscribe and pick up where you left off. Export is never gated behind a payment.'),
        p('If you ask us to delete a workspace sooner than that, we will delete it. Backups age out on their own cycle shortly afterwards.'),
      ],
    },
    {
      id: 'security',
      heading: '8. Security',
      blocks: [
        p('Data travels over encrypted connections, and our infrastructure providers encrypt it at rest. Access to a workspace is controlled by the roles your ministry assigns, so a volunteer sees only the part of the workspace you have given them.'),
        p('Access by the Harvest team to a ministry\'s workspace data is limited to what is needed to operate the service and to support you when you ask for help.'),
        p('No system is perfect. If a breach affects your ministry\'s data, we will tell you what happened, what was affected, and what we are doing about it.'),
      ],
    },
    {
      id: 'your-choices',
      heading: '9. Making a request',
      blocks: [
        p('If you are a member of a church that uses Harvest and you want to see, correct or remove your record, ask your church. They control that data, and they can act on it directly in their workspace. If they need our help to answer you, we will help them.'),
        p('If you administer a Harvest workspace and want to see, correct or export what we hold about you, or want your workspace deleted, contact us and we will do it.'),
      ],
    },
    {
      id: 'privacy-changes',
      heading: '10. Changes to this policy',
      blocks: [
        p('When this policy changes, the updated version is published here and the date at the top changes with it. Where a change materially affects how we handle data, we will email workspace owners.'),
      ],
    },
    {
      id: 'privacy-contact',
      heading: '11. Contact',
      blocks: [p(CONTACT_LINE)],
    },
  ],
};

/* ------------------------------------------------------------------ *
 * Refund & Cancellation Policy
 * ------------------------------------------------------------------ */

const REFUNDS: LegalDoc = {
  slug: 'refunds',
  updated: LEGAL_UPDATED,
  title: 'Refund & Cancellation Policy',
  nav: 'Refund & Cancellation',
  seoTitle: 'Refund & Cancellation Policy — Harvest',
  seoDescription:
    'How to cancel a Harvest subscription, what happens to your workspace and data afterwards, and when Harvest refunds. Congregational gifts are refunded by your ministry from its own Stripe account.',
  standfirst: 'Cancel whenever you like. You keep your data, and your exports are never held hostage.',
  sections: [
    {
      id: 'how-to-cancel',
      heading: '1. How to cancel',
      blocks: [
        p('You can cancel at any time, and you do not need to give a reason.'),
        p('If your workspace has a billing screen, you can cancel there and it takes effect immediately. You can also cancel by sending us a message through the contact form on this site — one message is enough, and we will action it and confirm in writing.'),
        p('There is no cancellation fee, no notice period, and no phone call to sit through.'),
      ],
    },
    {
      id: 'what-happens',
      heading: '2. What happens when you cancel',
      blocks: [
        p('Cancelling stops the next renewal. It does not close your workspace and it does not lock you out.'),
        list(
          'Paid features stay available until the end of the period you have already paid for.',
          'After that, the workspace is downgraded rather than shut down. You can still sign in and see what is there.',
          'Your exports keep working. Contacts, donor and giving records, and your content can be exported at any time, before or after cancelling. Export is never gated behind a payment — not on any plan, and not after you leave.',
          'Your data is kept for 12 months from cancellation, then deleted. We email a notice at 11 months and again at 11.5 months first.',
          'Subscribing again within those 12 months restores the paid features on the data that is still there.',
        ),
        p('The reason it works this way is simple: your ministry\'s records are not leverage. We would rather you came back because Harvest is worth paying for.'),
      ],
    },
    {
      id: 'refunds',
      heading: '3. Refunds',
      blocks: [
        p(`Every plan begins with a ${TRIAL_LENGTH_DAYS}-day free trial, so you can run Harvest against your own ministry before any money changes hands. Cancel during the trial and there is nothing to refund, because there is nothing to pay.`),
        p('After that, our position is:'),
        list(
          'If we billed you in error — a duplicate charge, a charge after you cancelled, or the wrong amount — we refund it in full. No conditions, no argument.',
          'Otherwise, cancelling stops future renewals rather than refunding the period you are in. Access runs to the end of the month or year you have paid for, and we do not refund the unused part of it as a matter of course.',
          'If your situation does not fit either of those, ask us. We read every refund request and answer it individually, and we aim to reply within five working days.',
        ),
        p('Approved refunds are returned to the card that was charged, through the payment provider that took the payment. How quickly it appears is up to your bank rather than us.'),
      ],
    },
    {
      id: 'donations-refunds',
      heading: '4. Refunds of gifts and donations',
      blocks: [
        p('This is the one thing we cannot do for you, and it is worth being exact about why.'),
        p(THIRD_PARTY_PROCESSING),
        p('Gifts given through your donation page, fundraising or livestream settle directly into your ministry\'s own Stripe account. Harvest never held that money, so Harvest cannot return it. If a donor asks for a refund, your ministry makes it from its own Stripe account, and the decision is entirely yours.'),
        p('If you are a donor who has given to a church that uses Harvest and you want a gift refunded, please contact that church directly. We can point you to them, but the money is theirs to return, not ours.'),
      ],
    },
    {
      id: 'refunds-changes',
      heading: '5. Changes to this policy',
      blocks: [
        p('When this policy changes, the updated version is published here and the date at the top changes with it. A change never applies retroactively to a payment you have already made.'),
      ],
    },
    {
      id: 'refunds-contact',
      heading: '6. Contact',
      blocks: [p(CONTACT_LINE)],
    },
  ],
};

export const LEGAL_DOCS: readonly LegalDoc[] = [TERMS, PRIVACY, REFUNDS];

export const LEGAL_DOC_BY_SLUG: Record<string, LegalDoc> = Object.fromEntries(
  LEGAL_DOCS.map((d) => [d.slug, d]),
);

/** Footer/nav pairs, in document order. */
export const legalLinks = (): [string, string][] => LEGAL_DOCS.map((d) => [d.nav, legalHref(d.slug)]);

/** Every word of a document as one string — what the page renders, minus the
 *  markup. The test suite reads policies through this rather than through a
 *  rendered component, so a clause added to a list is scanned like any other. */
export function plainText(doc: LegalDoc): string {
  const parts = [doc.title, doc.standfirst];
  for (const section of doc.sections) {
    parts.push(section.heading);
    for (const block of section.blocks) {
      if (block.kind === 'p') parts.push(block.text);
      else parts.push(...block.items);
    }
  }
  return parts.join('\n');
}
