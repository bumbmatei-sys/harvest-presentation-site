import { ANNUAL_DISCOUNT_PCT } from '../components/Pricing';
import { SITE_ORIGIN } from './post-core';
import { TRIAL_LENGTH_DAYS } from './legal';

/* /faq — the buyer's FAQ, as data.
 *
 * The reader here is a church leader or treasurer deciding whether to buy, not
 * a member using the product. The app carries its own member-facing FAQ for
 * that audience, written for entirely different questions; where a question
 * touches both — how giving works, who owns member data — the answer below says
 * the same thing in buyer language, and must keep saying it.
 *
 * ⚠️ ONE SOURCE, TWO RENDERINGS. `FAQS` is rendered twice: as the visible page
 * and as the FAQPage JSON-LD that makes it eligible for a rich result. Both come
 * from this array — `faqJsonLd()` maps it, the page maps it — because two
 * hand-maintained copies of the same answer is the duplicated-fact shape this
 * repo has already been bitten by. Do NOT hand-write a JSON-LD block.
 *
 * ⚠️ EVERY ANSWER HERE MUST BE TRUE OF HARVEST AS IT SHIPS TODAY. This is an
 * indexed page a buyer relies on before paying. Harvest has shipped six claims
 * about things that did not exist; a seventh must not arrive by way of an FAQ.
 * The rules the policies work under (src/content/legal.ts) apply here too:
 *
 *   - No capability Harvest does not have. Every product noun below is checked
 *     against content/features.ts, this repo's catalogue of what the app does.
 *     In particular: there is no tool for loading an existing contact list in
 *     bulk — every CSV path in the app is an export — and there is no page
 *     builder. See the `contacts-in` answer, which says so in as many words.
 *   - No product that is decided but unbuilt. Paid add-ons are priced and agreed
 *     but not sold. The trial length is a different case: it is whatever the
 *     live Dodo products are configured with, so it is imported from legal.ts
 *     rather than typed — including in the SEO description below, which was the
 *     one place on this page that held it as a literal and the one place that
 *     went stale when Dodo shipped a longer trial. faq.test.ts fails the build
 *     if an add-on appears, or if this page quotes a trial the product does not
 *     run.
 *   - No surface that is deliberately hidden. The affiliate programme and
 *     additional campuses are behind flags in lib/flags.ts for a reason, so no
 *     question here answers anything about either.
 *
 * Prices and plan limits are the other standing hazard — see FAQ_PLAN_CLAIMS. */

export const FAQ_HREF = '/faq';
export const FAQ_CANONICAL = `${SITE_ORIGIN}${FAQ_HREF}`;

export const FAQ_SEO_TITLE = 'Frequently Asked Questions — Harvest';
export const FAQ_SEO_DESCRIPTION =
  `What Harvest costs, what each plan includes, and the answers churches ask before buying: a 0% platform fee on every gift, a ${TRIAL_LENGTH_DAYS}-day trial, who owns member data, and what happens to it if you cancel.`;

export const FAQ_TITLE = 'Questions churches ask before they buy';
export const FAQ_STANDFIRST =
  'Straight answers about price, giving, data and what happens if you leave. If something is not here, it is because we cannot yet say it truthfully — ask us and we will tell you where we are.';

/* ------------------------------------------------------------------ *
 * Plan prices and limits quoted on this page.
 * ------------------------------------------------------------------ */

export interface FaqPlanClaim {
  /** Matches `Plan.planId` in components/Pricing.tsx. */
  planId: string;
  name: string;
  monthly: number;
  /** Charged once for a year of service — monthly × ANNUAL_BILLED_MONTHS. */
  annual: number;
  /** Contact ceiling, exactly as the pricing card writes it (grouped). */
  contacts: string;
  /** Admin accounts included. */
  admins: string;
  /** Courses included. */
  courses: string;
}

/**
 * The prices and limits this page puts in writing.
 *
 * ⚠️ These are deliberately literals, and deliberately NOT interpolated out of
 * `plans`. Rendering them from the pricing data would make them impossible to
 * read in review and impossible to get wrong on purpose — but also impossible
 * to check, because there would be nothing to compare. Written out, each one is
 * a claim, and `faqPlanMismatches` is the check on it: pages/FaqPage.tsx runs it
 * at module scope, so a one-sided edit stops the prerender and names the tier.
 * The same idiom as the cross-repo price contract in components/Pricing.tsx and
 * the Terms' TIER_PRICE_CLAIMS in content/legal.ts.
 *
 * This site has shipped a stale price in a blog post three times. A stale price
 * on the page a treasurer reads before paying is a false commercial claim, so a
 * mismatch is a build failure rather than a warning.
 */
export const FAQ_PLAN_CLAIMS: FaqPlanClaim[] = [
  { planId: 'plus', name: 'Individual', monthly: 49, annual: 441, contacts: '150', admins: '2', courses: '2' },
  { planId: 'pro', name: 'Small Team', monthly: 99, annual: 891, contacts: '500', admins: '5', courses: '5' },
  { planId: 'max', name: 'Ministry', monthly: 199, annual: 1791, contacts: '2,000', admins: '15', courses: '15' },
];

/** Shape of the bits of `Plan` this check needs. Passed in rather than imported
 *  for the same reason legal.ts's `PricedPlan` is: the check is data, and a
 *  caller should be able to run it against the plan list without this module
 *  deciding where that list comes from. */
export interface FaqPricedPlan {
  planId: string;
  name: string;
  monthly: number;
  /** Platform fee as a decimal fraction. The 0% answer is the page's strongest
   *  claim; a nonzero fee on any tier makes it a lie. */
  fee: number;
  /** The pricing card's own bullet list — where the contact, admin and course
   *  ceilings are written on the site today. */
  features: readonly string[];
}

/** Every way this page and the pricing cards disagree, in plain English.
 *  Empty means the two are in step. */
export function faqPlanMismatches(plans: readonly FaqPricedPlan[], annualBilledMonths: number): string[] {
  const problems: string[] = [];

  for (const plan of plans) {
    const claim = FAQ_PLAN_CLAIMS.find((c) => c.planId === plan.planId);
    if (!claim) {
      problems.push(`the FAQ quotes nothing for the "${plan.name}" (${plan.planId}) plan, which the pricing cards sell`);
      continue;
    }
    if (claim.name !== plan.name) {
      problems.push(`the FAQ calls ${plan.planId} "${claim.name}", the pricing cards call it "${plan.name}"`);
    }
    if (claim.monthly !== plan.monthly) {
      problems.push(`the FAQ quotes $${claim.monthly}/mo for ${plan.name}, the pricing cards charge $${plan.monthly}/mo`);
    }
    const annual = plan.monthly * annualBilledMonths;
    if (claim.annual !== annual) {
      problems.push(`the FAQ quotes $${claim.annual}/yr for ${plan.name}, the pricing cards bill $${annual}/yr (${annualBilledMonths} months × $${plan.monthly})`);
    }
    // The ceilings are written on the pricing card as one bullet — "150 contacts
    // · 2 admins" — so that exact string is what the FAQ has to agree with.
    const limits = `${claim.contacts} contacts · ${claim.admins} admins`;
    if (!plan.features.some((f) => f.includes(limits))) {
      problems.push(`the FAQ says ${plan.name} includes "${limits}", which is not what the ${plan.name} card lists`);
    }
    if (!plan.features.some((f) => f.includes(`${claim.courses} courses`))) {
      problems.push(`the FAQ says ${plan.name} includes ${claim.courses} courses, which is not what the ${plan.name} card lists`);
    }
    if (plan.fee !== 0) {
      problems.push(`the FAQ says Harvest takes 0% of every gift, but ${plan.name} carries a ${plan.fee * 100}% platform fee`);
    }
  }

  for (const claim of FAQ_PLAN_CLAIMS) {
    if (!plans.some((plan) => plan.planId === claim.planId)) {
      problems.push(`the FAQ quotes a price for "${claim.name}" (${claim.planId}), which is not a plan the site sells`);
    }
  }

  return problems;
}

/** `1791` → `1,791`. Grouped by hand rather than with toLocaleString, which
 *  varies by runtime locale and would differ between prerender and hydration. */
const usd = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const priceLines = FAQ_PLAN_CLAIMS.map(
  (c) => `${c.name} — $${usd(c.monthly)} a month, or $${usd(c.annual)} a year.`,
);

const limitLines = FAQ_PLAN_CLAIMS.map(
  (c) => `${c.name} — ${c.contacts} contacts, ${c.admins} admin accounts, ${c.courses} courses.`,
);

/* ------------------------------------------------------------------ *
 * The questions.
 * ------------------------------------------------------------------ */

export interface Faq {
  /** Anchor id — stable, so a support reply can link to one answer. */
  id: string;
  question: string;
  /** Paragraphs. The page renders one <p> each; the JSON-LD joins them. */
  answer: string[];
}

/** Ordered as a buyer reads them: the money question first, because the answer
 *  to it is the strongest thing Harvest can say; then what it costs and how to
 *  try it; then what the product is; then the trust questions a treasurer asks
 *  last and decides on. */
export const FAQS: Faq[] = [
  {
    id: 'donation-fee',
    question: 'Do you take a cut of our donations?',
    answer: [
      'No. Harvest charges a 0% platform fee on giving, and it is 0% on every plan — Individual, Small Team and Ministry alike. It is not an introductory rate, and there is no tier of Harvest that takes a percentage of a gift.',
      'Giving runs through your ministry\'s own Stripe account, connected once through Stripe Connect. Gifts given on your donation page, in a fundraising campaign or during a livestream settle into that account, on Stripe\'s schedule, under your ministry\'s name. Harvest does not hold, control or forward donation funds, so there is nothing for us to take a share of.',
      'Stripe\'s own processing fees are a matter between your ministry and Stripe, under your agreement with them. What you pay Harvest is the subscription, and nothing else.',
    ],
  },
  {
    id: 'pricing',
    question: 'What does Harvest cost, and what is in each plan?',
    answer: [
      `Harvest is sold on three plans, priced in US dollars, each payable monthly or annually. ${priceLines.join(' ')}`,
      `A year paid up front costs nine months of the monthly rate, so annual billing is ${ANNUAL_DISCOUNT_PCT}% cheaper than paying month by month.`,
      'Every plan includes the web and mobile app, your news feed, the full Bible, courses, the donor and member CRM, and your donation page and fundraising. Small Team adds docs and sermon notes, livestream with live giving, QR check-in, the church map and the newsletter. Ministry adds your own branding and domain, community groups and events, custom forms that feed the CRM, tax receipts and giving statements, automated SEO blog articles and the automated newsletter, and QuickBooks accounting sync.',
      'The full plan-by-plan comparison is on the pricing page. What is on that page is what you are buying — there is nothing else to add at checkout.',
    ],
  },
  {
    id: 'trial',
    question: 'Is there a free trial?',
    answer: [
      `Yes — ${TRIAL_LENGTH_DAYS} days, on whichever plan you choose. The trial gives you that plan's features and that plan's limits in full, for ${TRIAL_LENGTH_DAYS} days, at no charge.`,
      'Cancel before the trial ends and you are not charged at all. If you do not cancel, the subscription continues on the plan you picked and the first payment falls due when the trial ends.',
      'There is no sales call to sit through first, and no demo you have to book to see the product.',
    ],
  },
  {
    id: 'limits',
    question: 'How many contacts and admin accounts do we get?',
    answer: [
      `Contacts and admin accounts are the ladder between the three plans. ${limitLines.join(' ')}`,
      'A contact is one person in your CRM, whether they signed up in the app themselves or you added them by hand — app members and manual contacts are merged into a single record, deduplicated by email, rather than counted twice.',
      'An admin account is someone who can sign in to the dashboard. Each one carries its own permissions across content, money, broadcasting and administration, so the volunteer running check-in never sees donation records and the treasurer never sees prayer requests.',
    ],
  },
  {
    id: 'contacts-in',
    question: 'How do our contacts get into Harvest?',
    answer: [
      'Mostly on their own. Someone who gives, registers for an event, checks in, fills in one of your forms or signs up in the app becomes a contact in the CRM automatically, with their history attached to the same record. You can also add a person by hand at any time.',
      'A list you already keep somewhere else is entered by hand: Harvest has no bulk tool for loading an existing contact list today. We would rather tell you that here than let you discover it after you have paid.',
      'Data going the other way is a different story — everything in Harvest exports, and it always will. See below.',
    ],
  },
  {
    id: 'custom-domain',
    question: 'Can we use our own domain?',
    answer: [
      'On the Ministry plan, yes. Ministry adds your own domain, with guided DNS setup and a live status check, alongside your ministry name, your logo, a square app icon and one brand colour. Your colour is applied before first paint, so members never see a flash of Harvest gold before yours loads, and your branding carries onto the artifacts people keep — donation receipts, PDF certificates, public forms and check-in pages.',
      'Every workspace on every plan gets its own address on theharvest.app, so you have a public home from the first day whether or not you point a domain at it.',
      'One thing to be clear about: there is no page builder in Harvest. Your public presence is the Harvest app itself, wearing your name rather than ours.',
    ],
  },
  {
    id: 'phone-app',
    question: 'Is Harvest a phone app?',
    answer: [
      'It is an installable web app. Members open it in any browser and add it to their home screen on iPhone and Android alike, where it launches standalone like any other app. There is no App Store review to wait for, no update cycle to manage, and nothing for your members to approve. Push notifications work on every plan.',
      'On Ministry the installed app carries your name, your icon and your colour right down to the install manifest, so it is your app on the home screen. On Individual and Small Team it installs with Harvest branding.',
      'The same app is a real desktop layout in a browser, not a stretched phone view, and public pages — a post, an event, a giving page, a form — open for anyone with no account at all.',
    ],
  },
  {
    id: 'messaging',
    question: 'Does Harvest send email and text messages?',
    answer: [
      'Some of each, and where they come from matters, so here is the exact shape of it.',
      'SMS is bring-your-own Twilio. You connect your own Twilio account, and every message sent from Harvest is billed to you by Twilio at their rates — Harvest does not resell messages and takes no margin on them. The broadcast composer shows the recipient count and the cost before you send.',
      'Bulk newsletters go out through your own Mailchimp account, on whatever plan you hold with them. Transactional email that Harvest itself sends — sign-in links, notifications, receipts — goes through our own provider and is included in your subscription.',
      'You contract directly with Twilio and Mailchimp, you pay them, and their terms and prices apply to you. If one of those connections breaks, the rest of Harvest keeps working.',
    ],
  },
  {
    id: 'data-owner',
    question: 'Who owns our member data — us or Harvest?',
    answer: [
      'Your ministry does. For the data you hold about your members — contacts, donors, attendance, course progress, giving history — your ministry is the data controller and Harvest is the data processor. You decide what to collect, why, who may see it and when it should go; we store and process it on your instructions, to run the service you are paying for, and for nothing else.',
      'We do not sell it, we do not rent it, we do not use it to build advertising profiles, and we do not use one ministry\'s member data to serve another. Subscribing to Harvest does not transfer your content to us and does not give us a claim over it.',
      'That split is why a member who wants their record corrected or removed should ask their church rather than us: your ministry can act on it directly in its own workspace. The whole arrangement is written down in the Privacy Policy.',
    ],
  },
  {
    id: 'export',
    question: 'Can we get our data out?',
    answer: [
      'Yes, and export is never gated behind a payment — not on any plan, and not after you cancel. That is a commitment in the Terms of Service and in the Refund & Cancellation Policy, not a preference we could quietly change.',
      'Contacts and donor records, giving history, event and check-in attendee lists, form submissions and your analytics all export to CSV. Documents and sermon notes export to PDF, DOCX or Markdown. Every donation receipt is a numbered PDF whether or not you use the QuickBooks sync.',
      'Your ministry\'s records are not leverage. We would rather you stayed because Harvest is worth paying for.',
    ],
  },
  {
    id: 'cancel',
    question: 'What happens to our data if we cancel?',
    answer: [
      'Cancelling stops the next renewal. It does not close your workspace and it does not lock you out. Paid features stay available to the end of the period you have already paid for; after that the workspace is downgraded rather than shut down, so you can still sign in, still see what is there, and still export.',
      'Your data is kept for 12 months from cancellation and is then deleted. We do not spring that on you: we email a notice at 11 months and a second at 11.5 months before anything is removed. Subscribe again inside that window and the paid features come back on the data that is still there. If you would rather we deleted the workspace sooner, tell us and we will.',
      'There is no cancellation fee, no notice period and no phone call to sit through. You can cancel from the billing screen, or by sending one message through the contact form on this site.',
    ],
  },
  {
    id: 'who',
    question: 'Who is behind Harvest?',
    answer: [
      'A small team, building a young product. That shapes what you will find on this site: we would rather say what is true than what sounds impressive, which is why the Terms promise no uptime figure we cannot stand behind, and why this page leaves out anything we cannot show you today.',
      'There is no sales team, no gatekeeper and no demo you have to book. The contact form on this site goes straight to the Harvest team, and we answer every message — including the awkward ones about what the product does not do yet.',
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Structured data.
 * ------------------------------------------------------------------ */

/**
 * schema.org FAQPage, built from `FAQS` — the same array the page renders.
 *
 * ⚠️ Generated, never hand-written. Correctly marked-up Q&A is eligible for a
 * rich result, which is most of this page's value, and a rich result that
 * quotes an answer the page does not show is both a Google policy problem and
 * the duplicated-fact failure this repo keeps paying for. One array, two
 * renderings: if a question is not visible on the page it is not in here.
 */
export function faqJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answerText(f),
      },
    })),
  };
}

/** One answer as a single string — what the JSON-LD carries, and what the test
 *  suite reads. Paragraphs joined with a space; the page renders them apart. */
export function answerText(faq: Faq): string {
  return faq.answer.join(' ');
}

/** Every word this page renders, as one string. The suite scans the finished
 *  copy through this rather than through a rendered component — the runner is
 *  node-only and deliberately renders nothing. */
export function faqPlainText(): string {
  const parts = [FAQ_TITLE, FAQ_STANDFIRST];
  for (const faq of FAQS) {
    parts.push(faq.question, ...faq.answer);
  }
  return parts.join('\n');
}
