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

/** Additional campuses beyond the one every plan includes. Decided as a paid
 *  add-on, not built — so nothing may advertise it. */
export const MULTI_CAMPUS_ENABLED = false;
