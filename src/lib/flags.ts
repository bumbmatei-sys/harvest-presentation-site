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
 *  🔴 IT IS TRUE AGAIN — THE-314 IS THE FLIP. THE-245 set it false because the
 *  feature was untested and every send spent real money on a Twilio account and
 *  landed on a real phone. All of that was answered before it was turned back
 *  on: the app's public inbound webhook now verifies an HMAC signature and fails
 *  closed, STOP is honoured by the provider and mirrored by Harvest, every send
 *  is metered against a per-plan cap, and only one tier can reach the send path
 *  at all.
 *
 *  ⚠️ TWO THINGS THE FLIP DELIBERATELY DID *NOT* RESTORE, and both are the point
 *  of THE-314 rather than drift:
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
 *         · the SMS Automation tool is in the mega-menu catalogue, which puts
 *           the derived CATALOG_TOOL_COUNT at 29 rather than 28;
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
export const SMS_MARKETING_ENABLED = true;

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
