/* Marketing-surface feature flags.
 *
 * Each constant hides a set of *marketing* surfaces for something the product
 * does not currently sell. Nothing is deleted — every hidden surface is still in
 * the tree behind one of these booleans, so restoring it is a one-line change.
 *
 * These gate what the site *advertises*. They deliberately do NOT gate any
 * mechanism: `lib/ref.ts` still captures `?ref=`, ScrollManager still handles
 * the `/pricing` deep link, and the plan CTAs still carry the ref across to
 * signup. A referral link already in the wild keeps attributing while the
 * programme is unadvertised. */

/** Mirrors the app's `AFFILIATE_PROGRAM_ENABLED`. Hides the landing section,
 *  footer link, mega-menu item, feature entry and SEO copy — not ref capture.
 *
 *  🔴 THE-252 MADE IT RELOCATE, NOT ONLY HIDE — the shape SMS_MARKETING_ENABLED
 *  already has, and for the same reason. The five surfaces above between them
 *  advertise a live programme: a rate, a twelve-month year and a button reading
 *  "Become an affiliate", pointed at a portal. So:
 *
 *    OFF · an "Affiliate referrals" entry APPEARS in Coming Soon (THE-247),
 *          where the shape itself forbids a price, a tier and a call to action.
 *    ON  · all five surfaces come back AND that entry LEAVES again.
 *
 *  🔴 A programme sold on the landing page while this page calls it unbuilt is
 *  the same claim in two tenses. `COMING_SOON_ITEMS` filters on this flag for
 *  exactly that reason, so the flip back stays ONE value. */
export const AFFILIATE_PROGRAM_ENABLED = false;

/** The multi-campus FEATURE MARKETING — the features.ts section and the
 *  catalogue's Multi-Campus tool entry. Not the add-on.
 *
 *  ⚠️ THE-223 SPLIT THESE TWO APART, and the distinction is now load-bearing.
 *  The Campus ADD-ON is live in Dodo, attached to all three paid products, and
 *  is advertised on the pricing page like any other capacity a church can buy.
 *  What stays hidden is the feature-page treatment of multi-campus, which sells
 *  it as a capability rather than as a limit raise. Flipping this also adds a
 *  tool to the derived CATALOG_TOOL_COUNT, so it is a decision about the
 *  "N tools in one platform" claim as well as about campuses. */
export const MULTI_CAMPUS_ENABLED = false;

/** THE-245 / THE-314 — the SMS & Text-to-Give FEATURE MARKETING, across the
 *  whole site.
 *
 *  Mirrors the app's `SMS_FEATURE_ENABLED` (Harvest-agent src/lib/sms-feature.ts).
 *  The two repos cannot share code, so they share a name and a value instead —
 *  and `the-245-sms-hidden.test.ts` asserts they agree.
 *
 *  🔴 IT IS FALSE AGAIN — THE-335 IS THE SECOND FLIP, AND THE NOTE BELOW IT
 *  SAYS WHY. THE-245 set it false because the feature was untested; THE-314
 *  answered that and set it true; THE-335 sets it false once more, for reasons
 *  that are NOT the ones THE-245 gave — a crash on the app's own purchase
 *  screen, and an unbought 10DLC carrier registration without which carriers
 *  silently drop every message. The safety work THE-314 did still stands and is
 *  described here because it comes back with the feature: the app's public
 *  inbound webhook verifies an HMAC signature and fails closed, STOP is honoured
 *  by the provider and mirrored by Harvest, every send is metered against a
 *  per-plan cap, and only one tier can reach the send path at all.
 *
 *  ⚠️ TWO THINGS THE-314's FLIP DELIBERATELY DID *NOT* RESTORE, both still true
 *  of the state this returns to whenever it is turned on again:
 *
 *    · IT IS NOT BRING-YOUR-OWN, AND NO CARRIER IS NAMED. Every surface below
 *      said a church would connect its OWN Twilio account and negotiate its own
 *      per-message rate. Harvest RESELLS now: it buys the church a number from
 *      inside the app, sends on one account of its own, and bills for what goes
 *      out. So the copy came back REWORDED, not restored — the pricing line's
 *      "(bring your own Twilio)", the catalogue's "Twilio-powered", the feature
 *      page's "Your Twilio, your rates" eyebrow and the Terms bullet under
 *      "Services you connect yourself" would each have been a false statement
 *      about who a church contracts with. Twilio also left the integrations row
 *      in `components/Replaces.tsx`, which lists third-party services a church
 *      connects — there is no longer one.
 *    · 🔴 IT IS MINISTRY ONLY. The comparison row is [false, false, false, T]
 *      and the feature entry's `tiers` is [0, 0, 1], where both were "every paid
 *      tier" before. The app's `smsAutomation` is true on `max` alone, and an
 *      Individual or Small Team tenant that opens /admin/sms meets an upgrade
 *      wall. A tier claim that outran the app is the exact class of bug this
 *      site has already fixed six times, so `the-314-sms-live.test.ts` VERIFIES
 *      the tier against the app's published plan catalogue rather than
 *      restating it.
 *
 *  What the switch still governs, in both directions:
 *
 *    ON   · the `sms` section renders on /features/ai-automation and every
 *           crosslink pointing at `#sms` resolves;
 *         · the AI & Automation intro and SEO copy name SMS;
 *         · the CRM feature's "Tags that drive SMS broadcast targeting" line
 *           names it too;
 *         · the SMS Automation tool is in the mega-menu catalogue, which moves
 *           the derived CATALOG_TOOL_COUNT by one. ⚠️ NO ABSOLUTE PAIR IS
 *           WRITTEN HERE — the figure moved when the newsletter tools left in
 *           THE-335 and would go stale again. `CATALOG_TOOL_COUNT` names it;
 *         · the Ministry card's SMS line and the comparison row appear;
 *         · the FAQ and Terms describe it as a live capability;
 *         · 🔴 and the "SMS & Text-to-Give" Coming Soon entry LEAVES. SMS sold
 *           on the pricing page while this page calls it unbuilt would be the
 *           same claim made twice, in two tenses. `COMING_SOON_ITEMS` filters on
 *           this flag for exactly that reason, so the flip stays ONE value.
 *    OFF  · all of the above reverses, INCLUDING the Coming Soon entry coming
 *           back. Nothing is deleted to hide it, per the contract at the top of
 *           this file — the entry, the row and the tool are all still in the
 *           tree, and `the-250-sms-pricing-removed.test.ts` asserts on RENDERED
 *           OUTPUT that the sold-here / promised-there pair is never both, in
 *           either flag state. */
/*  🔴 THE-335 — FALSE AGAIN, and the app's `SMS_FEATURE_ENABLED` went false in
 *  the same change. The founder, after a production crash on `/admin/sms`:
 *  "lets better hide sms feature entirely again and keep it for when ill add the
 *  scheduler. people can receive the serving notif from church service planner
 *  through resend mail". 10DLC carrier registration ($9 once + $20/month, US
 *  only) was also never bought, and an unregistered number appears to work while
 *  carriers silently drop every message.
 *
 *  ⚠️ NOTHING WAS DELETED TO HIDE IT — the entry, the row, the tool and the
 *  feature section are all still in the tree, per the contract at the top of
 *  this file. `the-245-sms-hidden.test.ts` is the guard for this state and was
 *  updated rather than removed. */
export const SMS_MARKETING_ENABLED = false;

/** THE-335 — the NEWSLETTER feature marketing, across the whole site.
 *
 *  Mirrors the app's `NEWSLETTER_FEATURE_ENABLED` (Harvest-agent
 *  src/lib/newsletter-feature.ts). The two repos cannot share code, so they
 *  share a name and a value instead, and `the-335-newsletter-hidden.test.ts`
 *  asserts they agree.
 *
 *  🔴 IT IS FALSE. The founder: "put SMS and newsletter to coming soon. Hide
 *  newsletter from the app. It will come together with harvest scheduler."
 *
 *  ⚠️ WHAT IS ACTUALLY BUILT, because "coming soon" has to be honest in both
 *  directions. There IS a working send path in the app today — the campaign goes
 *  to the church's own Mailchimp audience. What is unbuilt is the REPLACEMENT
 *  that was decided on, and the app is withdrawing the current one until that
 *  lands. So the coming-soon entry's `today` line says what a church can do
 *  instead, and claims nothing about a date or a sender.
 *
 *  🔴 IT RELOCATES RATHER THAN MERELY HIDES — the shape SMS_MARKETING_ENABLED
 *  and CUSTOM_DOMAIN_MARKETING_ENABLED already have, and for the same reason.
 *  Both halves are this flag:
 *
 *    OFF · the `newsletter` and `autonewsletter` feature entries leave
 *          /features/ai-automation, and every crosslink pointing at either
 *          resolves to the Coming Soon entry instead;
 *        · the two Newsletter tools leave the mega-menu catalogue, which moves
 *          the derived CATALOG_TOOL_COUNT by two;
 *        · the comparison row and the plan cards stop claiming it;
 *        · a "Newsletter" entry APPEARS in Coming Soon (THE-247), where the
 *          shape itself forbids a price, a tier and a call to action.
 *    ON  · all of the above reverses, INCLUDING removing the Coming Soon entry.
 *          🔴 A newsletter sold on the feature page while this page calls it
 *          unbuilt would be the same claim made twice, in two tenses.
 *          `COMING_SOON_ITEMS` filters on this flag for exactly that reason, so
 *          the flip back stays ONE value.
 *
 *  ⚠️ AUTOMATED NEWSLETTER GOES WITH IT, deliberately. It drafts FROM Instagram
 *  INTO the newsletter editor and sends down the same path — there is no
 *  configuration in which one works and the other does not, which is the same
 *  reasoning that takes Text-to-Give with SMS. */
export const NEWSLETTER_MARKETING_ENABLED = false;

/** THE-335 — the QUICKBOOKS integration marketing, across the whole site.
 *
 *  Mirrors the app's `QUICKBOOKS_FEATURE_ENABLED` (Harvest-agent
 *  src/lib/quickbooks-feature.ts), and `the-335-quickbooks-hidden.test.ts`
 *  asserts they agree.
 *
 *  🔴 IT IS FALSE. The founder: "hide quickbooks connection entirely because I
 *  did not check it. Hide it from marketing site as well." Never tested, so it
 *  must not be sold or offered — the same reasoning as
 *  CUSTOM_DOMAIN_MARKETING_ENABLED above.
 *
 *  🔴 IT REWORDS RATHER THAN RELOCATING, AND THAT IS THE DISTINCTION THAT
 *  MATTERS — the shape CUSTOM_DOMAIN_MARKETING_ENABLED has, not the shape SMS
 *  has. There is NO Coming Soon entry for QuickBooks and there must not be one:
 *
 *    · The founder said "hide ENTIRELY", where he said "coming soon" for SMS and
 *      the newsletter in the same breath. Those are two different instructions
 *      and this file can express both.
 *    · A Coming Soon entry is a PROMISE — "Harvest does not do this YET". That
 *      would be false here twice over: the integration is already written, and
 *      nobody has committed to shipping it. Promising a date-free future for an
 *      untested integration is a worse claim than the one being withdrawn.
 *
 *    OFF · the `accounting` feature entry keeps its ACCOUNTING claims — invoices,
 *          receipts and statements, which all ship — and loses only the
 *          QUICKBOOKS half of each: the entry is "Accounting", not "Accounting +
 *          QuickBooks", and the sync sentences are gone;
 *        · the catalogue's Accounting tool is reworded the same way. 🔴 IT IS
 *          NOT REMOVED, so CATALOG_TOOL_COUNT DOES NOT MOVE for QuickBooks:
 *          accounting is a live tool a church uses today, and dropping it to
 *          hide one integration on it would understate the product;
 *        · the comparison row's QuickBooks mention and the FAQ answer lose it.
 *    ON  · all of the above reverses.
 *
 *  🔴 THE ACCOUNTING FEATURE IS NOT HIDDEN WHOLE, for the reason the branding
 *  entry is not: hiding a live, working capability to hide a dead one is the
 *  overreach this shape exists to avoid. */
export const QUICKBOOKS_MARKETING_ENABLED = false;

/** THE-280 — the CUSTOM DOMAIN marketing, across the whole site.
 *
 *  Mirrors the app's `CUSTOM_DOMAIN_ENABLED` (Harvest-agent
 *  src/lib/custom-domain-feature.ts), which is `false` because the feature has
 *  NEVER BEEN TESTED: the Vercel subscription that would activate it was never
 *  bought, so `/api/domains/provision` answers 501 and the fallback writes a
 *  domain no Vercel project serves — the DNS a church is told to add points
 *  nowhere and the address never resolves. The two repos cannot share code, so
 *  they share a name and a value instead, and
 *  `the-280-custom-domain-coming-soon.test.ts` asserts they agree.
 *
 *  🔴 IT RELOCATES RATHER THAN MERELY HIDES — the shape SMS_MARKETING_ENABLED
 *  and AFFILIATE_PROGRAM_ENABLED already have, and for the same reason. A custom
 *  domain is currently SOLD: a whole feature entry named "Branding & Domain"
 *  puts it in a title, a one-liner and four capability bullets, and the
 *  platform-brand intro, SEO line and PWA bullet each name it again. Hiding that
 *  silently would leave the site advertising a capability the app now refuses.
 *  Both halves are this flag:
 *
 *    OFF · the `branding` feature keeps its BRANDING claims — name, logo, icon,
 *          colour, and the receipts and certificates they reach — and loses only
 *          the DOMAIN half of each: the entry is "Branding", not "Branding &
 *          Domain", and the four domain sentences are gone;
 *        · the platform-brand intro and SEO copy stop naming a custom domain;
 *        · the PWA bullet stops saying Ministry adds one;
 *        · a "Custom domains" entry APPEARS in Coming Soon (THE-247), where the
 *          shape itself forbids a price, a tier and a call to action.
 *    ON  · all of the above reverses, INCLUDING removing the Coming Soon entry.
 *          🔴 A domain sold on the feature page while this page calls it unbuilt
 *          would be the same claim made twice, in two tenses.
 *          `COMING_SOON_ITEMS` filters on this flag for exactly that reason, so
 *          the flip back stays ONE value.
 *
 *  🔴 THE ENTRY IS NOT HIDDEN WHOLE, and that is the distinction that matters.
 *  `customBranding` and `customDomain` are SEPARATE plan cells in the app and
 *  only the second is switched off: a church on the top tier still brands its
 *  app, and its logo still reaches its receipts. Hiding the whole `branding`
 *  feature would have withdrawn a live, working capability to hide a dead one —
 *  which is why this flag rewords rather than joining HIDDEN_FEATURE_IDS.
 *
 *  ⚠️ THE SUBDOMAIN IS NOT PART OF THIS. Every church is served on
 *  `<name>.theharvest.app`, that ships, and the copy still says so — in the same
 *  bullets the domain half left. Conflating the two is the one error that would
 *  turn this correction into a new false claim. */
export const CUSTOM_DOMAIN_MARKETING_ENABLED = false;

/** THE-355 — the STRIPE GIVING marketing, across the whole site.
 *
 *  Mirrors the app's `STRIPE_CONNECT_ENABLED` (Harvest-agent
 *  src/lib/stripe-connect-feature.ts), and `the-355-stripe-giving-hidden.test.ts`
 *  asserts they agree.
 *
 *  🔴 IT IS FALSE, AND THE REASON IS NOT A DECISION — IT IS AN ACCOUNT CLOSURE.
 *  Stripe closed the platform account `acct_1U4MOhFzBnH2P7JZ` as
 *  `rejected.fraud` on 2026-08-27. There is no appeal in flight and no date. So
 *  `/api/stripe/donate` refuses every request with 503, and that route is the
 *  ONLY card path behind the Give page, `CampaignWidget`, `PublicCampaign` and
 *  `PartnerWithUsTab`. Every sentence on this site that said a gift is a
 *  destination charge into a church's own Stripe account described a request
 *  that now comes back 503.
 *
 *  ⚠️ WHAT IS STILL TRUE, AND IS WHAT THE COPY BECOMES. Churches take gifts
 *  through their OWN payment links — PayPal, Cash App, Venmo, Zelle, Revolut
 *  and Wise (`components/donations/giving-providers.ts`, THE-246/249/254) — and
 *  Harvest is not in that flow at all: no fee, nothing held, no endpoint
 *  touched. `readGivingLinks` re-derives every URL against its provider's host
 *  allow-list on READ, so a stored link that no longer passes stops being a
 *  link. That path is INDEPENDENT of this switch and always was, which is the
 *  whole reason withdrawing the Stripe copy leaves a feature rather than a hole.
 *
 *  🔴 AND WHAT A RECORDED GIFT DOES, because the difference decides two
 *  sentences on this site that look identical and are not:
 *
 *    · A gift recorded in the CRM (Add Activity → Donation) writes an INVOICE
 *      through `lib/manual-donation.ts` (THE-350). It reaches the dashboard,
 *      accounting, the member's own donation history, their receipt and the
 *      year-end giving statement.
 *    · A gift recorded against a CAMPAIGN ("Record an offline gift", THE-251,
 *      `AdminFundraising.tsx`) increments that campaign's total and NOTHING
 *      else. No receipt, no giving-statement line — the app's own dialog says
 *      so in as many words.
 *
 *  ⚠️ IT REWORDS RATHER THAN RELOCATING — the shape
 *  QUICKBOOKS_MARKETING_ENABLED and CUSTOM_DOMAIN_MARKETING_ENABLED have, not
 *  the shape SMS has. There is NO Coming Soon entry for card giving and there
 *  must not be one: a coming-soon entry is a promise that something is on its
 *  way, and nobody has committed to a rail. The `donation` feature is not
 *  hidden either — a church really does publish a giving page and really does
 *  take gifts through it; only the processor half of every sentence goes.
 *
 *    OFF · the `donation` entry describes the church's own payment links —
 *          title, one-liner, eyebrow, moment and every bullet;
 *        · the `fundraising` entry stops crediting a progress bar
 *          automatically and says what actually moves the total;
 *        · the `events` entry stops selling destination charges and paid-ticket
 *          -only lines, and describes free and waitlisted registration, the QR
 *          confirmation and check-in;
 *        · the `livestream` entry stops saying a member gives in one tap;
 *        · the `crm` entry stops claiming a gift creates and types a contact,
 *          which only the Stripe webhook ever did;
 *        · the `donation` vignette in components/FeatureMock.tsx draws the
 *          church's own accounts instead of a card form;
 *        · the giving FAQ answer and the affiliate Coming Soon entry's
 *          `notThis` stop naming Stripe;
 *        · the giving-finance category intro and SEO line stop promising that
 *          the money lands in an account Harvest routes it to.
 *    ON  · every one of those strings comes back BYTE-FOR-BYTE. Nothing is
 *          deleted to hide it, per the contract at the top of this file — each
 *          one is still in the tree on the other side of a ternary, and
 *          `the-355-stripe-strings-restored.test.ts` imports them with the flag
 *          ON and pins them, so the restore path is guarded rather than hoped
 *          for.
 *
 *  🔴 THE PLEDGE SPLIT IS NOT THIS FLAG. Pledge Campaigns became a feature
 *  entry of its own in the same ticket, and it stays one in BOTH flag states:
 *  a pledge is a commitment recorded by hand and tracked against what is paid,
 *  and no part of it ever went through `/api/stripe/donate`. Tying that split
 *  to this switch would make a live, Ministry-only capability disappear the day
 *  a card rail came back.
 *
 *  ⚠️ AND `src/content/legal.ts` IS DELIBERATELY UNTOUCHED. It carries the same
 *  Stripe Connect statements — in the Terms' §Giving, the privacy sub-processor
 *  list and the refunds policy — and withdrawing a term from a published
 *  agreement is a founder decision, not a marketing one. The lines are
 *  enumerated in this ticket's pull request instead. */
export const STRIPE_GIVING_MARKETING_ENABLED = false;
