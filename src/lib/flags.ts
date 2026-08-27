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
 *  footer link, mega-menu item, feature entry and SEO copy — not ref capture. */
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
 *  ⚠️ What it does NOT gate: the two pricing-card surfaces in components/Pricing.tsx
 *  (the Individual card's feature list and the comparison-table row). That file
 *  is owned by a concurrent repricing ticket, so THE-245 does not edit it; the
 *  two-line change is written out in the pull request and verified by mutation
 *  in the-245-sms-hidden.test.ts, which proves neither cross-repo contract trips
 *  when those lines go. */
export const SMS_MARKETING_ENABLED = false;
