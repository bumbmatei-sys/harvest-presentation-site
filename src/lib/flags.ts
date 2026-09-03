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

/** THE-245 — the SMS & Text-to-Give FEATURE MARKETING, across the whole site.
 *
 *  Mirrors the app's `SMS_FEATURE_ENABLED` (Harvest-agent src/lib/sms-feature.ts),
 *  which is `false` for the same reason: the feature is untested, and every send
 *  spends real money on a Twilio account and lands on a real phone. The two
 *  repos cannot share code, so they share a name and a value instead — and
 *  `the-245-sms-hidden.test.ts` asserts they agree.
 *
 *  🔴 THIS ONE DOES SOMETHING THE OTHER TWO DO NOT: it RELOCATES rather than
 *  merely hides. SMS is currently SOLD — it is a line on the Individual card and
 *  a row in the comparison table — so hiding it silently would leave the site
 *  advertising a capability with no page behind it. Instead the entry moves to
 *  the Coming Soon category (THE-247), where the shape itself forbids a price, a
 *  tier or a call to action. Both halves are this flag:
 *
 *    OFF  · the `sms` section drops out of /features/ai-automation, and every
 *           crosslink pointing at `#sms` resolves away with it;
 *         · the AI & Automation intro and SEO copy stop naming SMS;
 *         · the CRM feature's "Tags that drive SMS broadcast targeting" line
 *           stops naming it too;
 *         · the SMS Automation tool leaves the mega-menu catalogue, which moves
 *           the derived CATALOG_TOOL_COUNT from 28 to 27;
 *         · an "SMS & Text-to-Give" entry APPEARS in Coming Soon;
 *         · the FAQ and Terms answers stop describing it as a live integration.
 *    ON   · all of the above reverses, INCLUDING removing the Coming Soon entry.
 *           🔴 SMS live and SMS "coming soon" at the same time would be the same
 *           claim made twice, in two tenses. `COMING_SOON_ITEMS` filters on this
 *           flag for exactly that reason.
 *
 *  ✅ IT NOW GATES THE TWO PRICING SURFACES TOO — THE-250. `components/Pricing.tsx`
 *  (the Individual card's feature list and the comparison-table Automation row)
 *  was owned by a concurrent repricing ticket while THE-245 was in flight, so
 *  THE-245 proved by mutation that removing both lines trips neither cross-repo
 *  contract and wrote the change into its pull request rather than making it.
 *  THE-250 made it, as a gate rather than a deletion — per the "nothing is
 *  deleted" contract at the top of this file, and because the flip back has to
 *  be ONE value: true restores both pricing surfaces AND drops the Coming Soon
 *  entry in the same motion. `the-250-sms-pricing-removed.test.ts` asserts on
 *  RENDERED OUTPUT that the sold-here / promised-there pair is never both, in
 *  either flag state. */
export const SMS_MARKETING_ENABLED = false;

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
