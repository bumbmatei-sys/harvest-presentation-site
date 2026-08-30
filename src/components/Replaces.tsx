import React from 'react';
import { Reveal } from './effects';
import { Kicker, H2, container, softCard } from './shared';
import { plans, formatMonthlyHeadline } from './Pricing';
import { CATEGORIES } from '../content/features';

/* What is in one plan — THE-257.
 *
 * 🔴 THIS SECTION USED TO BE A COMPETITOR TABLE and is not one any more. It
 * named Tithe.ly, Pushpay, Subsplash, HubSpot, Planning Center, Skool,
 * Teachable, Typeform, WordPress, Notion, The Church Co and Donorbox, priced
 * each of them per month, and totalled them at "$864–1,994/mo · 9 subscriptions
 * to manage" against a Harvest figure. The whole comparison is retired — not
 * softened, not renamed. Harvest is not doing that positioning, so the section
 * is now a plain statement of what one plan contains.
 *
 * ⚠️ DO NOT REINTRODUCE A COST COLUMN. There is no per-row price here and no
 * total, because a comparison the company will not defend is worse than no
 * comparison: every figure in it was a claim about another company's pricing
 * that nobody here maintains. The only figure left is Harvest's own, and it is
 * computed from `plans` rather than typed.
 */

/* The section, as rows: a label and the feature ids it lists, in order.
 *
 * 🔴 IDS ONLY — NEVER NAMES. Every caption is read out of content/features.ts
 * by `visibleNames` below, so this file cannot state a feature name the
 * catalogue does not, and a rename there moves this table with it. Two
 * hand-typed lists of the same names is exactly how the six false claims this
 * site has already corrected got in.
 *
 * ⚠️ THE ROW GROUPING IS EDITORIAL AND DOES NOT MIRROR THE CATALOGUE'S FIVE
 * CATEGORIES. features.ts puts events, check-in and livestream inside
 * "Community & Engagement"; here they are their own row, because seven items
 * under one label reads as a wall rather than a list. The labels are this
 * file's; the item names are not.
 *
 * 🔴 PLATFORM & BRAND CARRIES FIVE IDS, AND THE LAST TWO ARE THE POINT — THE-258.
 * THE-257 listed only webapp, pwa and dashboard. `branding` (Branding & Domain)
 * and `analytics` (Evangelism Analytics) are live, on no flag, and were left out
 * with no stated reason — THE-257 named them in that suite's
 * EDITORIAL_EXCLUSIONS so the gap was visible rather than silent, and this is
 * the one line each that closes it. White-label branding is the strongest
 * differentiator the product has, so omitting it understated the plan in the
 * one place that enumerates it. Only this row changed. */
const ROWS: ReadonlyArray<{ c: string; ids: readonly string[] }> = [
  { c: 'Community & Engagement', ids: ['feed', 'groups', 'prayer', 'map'] },
  { c: 'Events & Livestream', ids: ['events', 'checkin', 'livestream'] },
  { c: 'Discipleship & Content', ids: ['bible', 'courses', 'blog', 'aiblog', 'docs'] },
  { c: 'Automation', ids: ['knowledge', 'newsletter', 'autonewsletter', 'forms'] },
  { c: 'Giving & Finance', ids: ['donation', 'fundraising', 'crm', 'accounting'] },
  { c: 'Platform & Brand', ids: ['webapp', 'pwa', 'dashboard', 'branding', 'analytics'] },
];

/* id → name, off the FILTERED catalogue.
 *
 * 🔴 `CATEGORIES` IS THE FLAG-FILTERED EXPORT, and reading it rather than the
 * raw list is what makes the exclusions below real. SMS & Text-to-Give,
 * Affiliate Program and Multi-Campus are absent from this map while
 * SMS_MARKETING_ENABLED, AFFILIATE_PROGRAM_ENABLED and MULTI_CAMPUS_ENABLED are
 * false, so an id that a flag hides can never resolve to a caption here — the
 * table cannot advertise something the rest of the site is hiding, and it does
 * not need its own copy of the flag logic to manage it. */
const visibleNames: ReadonlyMap<string, string> = new Map(
  CATEGORIES.flatMap((c) => c.features.map((f) => [f.id, f.name] as const)),
);

/* 🔴 THE ONE PERMITTED DEVIATION FROM A VERBATIM CATALOGUE NAME. features.ts
   calls this feature "Docs & Notes"; docs and notes are the same thing, and
   spelling both out in a list of single capabilities reads as two features
   where there is one. Keyed by id and deliberately a map of one, so it cannot
   quietly grow into a second set of names alongside the catalogue's.

   ⚠️ If `docs` ever splits into two genuinely separate features, this entry is
   wrong and merging them is a false claim — delete it and list both. */
const CAPTIONS: Readonly<Record<string, string>> = { docs: 'Docs' };

/* A name that no longer resolves means features.ts renamed or removed an id
   this table lists — which would silently drop an item from a section whose
   whole job is to say what a church gets. Fail the prerender instead, the same
   way the tiers-length and cross-repo price contracts do. */
const items = ROWS.map((r) => {
  const missing = r.ids.filter((id) => !visibleNames.has(id));
  if (missing.length) {
    throw new Error(`Replaces: no visible feature in content/features.ts for ${missing.join(', ')}.`);
  }
  return { c: r.c, names: r.ids.map((id) => CAPTIONS[id] ?? visibleNames.get(id)!) };
});

// Third-party services Harvest connects to (does NOT replace). Add future
// newsletter/email backends (Wix, etc.) here as they ship.
const integrations: [string, string | null][] = [
  ['QuickBooks', 'quickbooks'],
  ['Twilio', null],
  ['Mailchimp', 'mailchimp'],
];

/* Kept for the integrations row, which is the only caller left — the per-row
   competitor logos it also served are gone. Its third parameter (an explicit
   favicon domain, for "Planning Center Check-Ins") went with them. */
const logoUrl = (slug: string | null, name: string) =>
  slug
    ? `https://cdn.simpleicons.org/${slug}`
    : `https://www.google.com/s2/favicons?domain=${name.toLowerCase().replace(/[^a-z]/g, '')}.com&sz=64`;

/* The one figure in the section, and it is Harvest's own.
 *
 * 🔴 COMPUTED, NEVER TYPED — through the same `formatMonthlyHeadline` the
 * pricing cards use, from the same stored price table, so the two cannot drift.
 * A literal here is a price claim with a shelf life: these prices have moved
 * five times in a week, and a stale one on the landing page is the failure that
 * #56 and THE-197 both had to clean up.
 *
 * Keyed on planId, not on the display name: the name is marketing copy and has
 * already been reassigned once ("Community" was retired and "Ministry" moved
 * down onto this same planId), whereas planId is the app's TenantPlan union.
 * Throwing beats a `!`, which would turn a renamed tier into a runtime crash
 * during the prerender instead of a build-time error.
 *
 * ⚠️ THE YEARLY TOTAL IS DELIBERATELY ABSENT. This line used to carry
 * "billed annually ($760/yr)" underneath the figure; the founder asked for the
 * monthly figure alone, so there is no /yr anywhere in this section. */
const foundTopPlan = plans.find((p) => p.planId === 'max');
if (!foundTopPlan) throw new Error("Replaces: no plan with planId 'max' to price against.");
const topPlan = foundTopPlan;
const topPlanMonthly = formatMonthlyHeadline(topPlan.price.yearly, 'yearly');

export function Replaces() {
  return (
    <section id="replaces" style={{ background: 'var(--cream)', padding: 'var(--section-y-tight) 0' }}>
      <div style={{ ...container, maxWidth: 920 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Kicker>All-in-one</Kicker>
          <H2 style={{ marginTop: 14 }}>{'Everything your ministry runs on,\nin one plan'}</H2>
        </div>
        <Reveal delay={80}>
          {/* Rendered as CSS-grid rows (not a <table>) so it stacks to cards on
              phones with every item fully visible — see .replaces-row in index.css. */}
          <div style={{ ...softCard, overflow: 'hidden', padding: 0, fontSize: 14.5 }}>
            {items.map((r) => (
              <div key={r.c} className="replaces-row">
                <div className="replaces-cat" style={{ color: 'var(--navy-900)', fontWeight: 600 }}>{r.c}</div>
                <div className="replaces-tools" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 6px', color: 'var(--text-body)' }}>
                  {r.names.map((n, i) => (
                    <span key={n}>
                      {n}
                      {/* The separator rides inside the item it follows, so a
                          wrap can never start a line with a stray dot. */}
                      {i < r.names.length - 1 && (
                        <span aria-hidden="true" style={{ color: 'var(--stone-300)', marginLeft: 6 }}>·</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {/* One line, where the competitor total and the Harvest row used to
                be: what it costs to have everything above, and nothing else. */}
            <div className="replaces-row replaces-row--summary" style={{ background: 'var(--surface-night)' }}>
              <div style={{ color: 'var(--text-heading-dark)', fontSize: 15, fontWeight: 600 }}>
                {`Everything above, on the ${topPlan.name} plan — `}
                <span style={{ color: 'var(--gold-400)', fontSize: 15, fontWeight: 800 }}>{`${topPlanMonthly}/mo, billed annually.`}</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 18, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13.5, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '4px 4px' }}>
            <span style={{ marginRight: 6 }}>Plus integrates with your newsletter &amp; tools —</span>
            {integrations.map(([n, s]) => (
              <span key={n} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: '0 8px', color: 'var(--text-body)' }}>
                <img src={logoUrl(s, n)} width={16} height={16} alt="" loading="lazy" style={{ objectFit: 'contain', borderRadius: 4 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                {n}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
