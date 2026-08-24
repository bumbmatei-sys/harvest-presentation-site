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
