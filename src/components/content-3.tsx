import React from 'react';
import { Link } from 'react-router-dom';
import { L } from './icons';
import { categoryHref } from '../content/features';

/* THE-301 — Tailark `veil-content-3`, adopted.
 *
 * Written by `npx shadcn@4.11.0 add @tailark-oss/veil-content-3` from the FREE
 * OSS registry (https://oss.tailark.com/r/{name}.json), whose three themes are
 * Veil, Dusk and Mist. Quartz is NOT in it — every `quartz-*` name 404s there
 * and the paid registry at tailark.com/r/*.json answers 401 "Sign in with a
 * plan that includes blocks", so Quartz is the Pro tier. Veil was chosen of the
 * three free ones because it is the serif theme: its heading slot is
 * `font-serif`, which under this site's unlayered `:root` resolves to Fraunces,
 * the face every other heading on the site is already set in.
 *
 * 🔴 WHERE IT GOES: /features. That route is a redirect shim — it forwards a
 * retired `/features#anchor` deep link to the category page the feature moved
 * to — and everything below `<Navigate>` is the no-JS fallback. That fallback
 * was an <h1>, one sentence, and five unlabelled pills; at 11.34 KiB it built
 * to a seventh of the size of every other page on the site, and it told a
 * reader with JS off (or a crawler following the noindex,follow) nothing about
 * what the five categories contain. The block's ruled grid holds the copy that
 * already exists for each one.
 *
 * ⚠️ THE COPY IS NOT WRITTEN HERE. `name`, `kicker` and `seo` are read off
 * content/features.ts — the same filtered `CATEGORIES` export the five real
 * pages render from — so this page cannot describe a category in words the
 * catalogue does not use, and a flag that rewrites a `seo` line (SMS, custom
 * domain, affiliate, multi-campus all do) rewrites it here too. Same rule as
 * Replaces.tsx: ids and lookups, never a second hand-typed list.
 *
 * ── HOW TAILARK'S TOKENS WERE REWRITTEN ONTO THIS SITE'S RAMPS ─────────────
 *
 * The block shipped four colour references. None survives as Tailark left it,
 * and no colour is written as a literal:
 *
 *   · `text-foreground`      → `text-[var(--navy-900)]`.  THE-278 bridges
 *     --foreground to --text-heading (--earth, #2D2519), which is right for
 *     body copy but is not the ink this site sets headings in — H2 in
 *     shared.tsx, and every h2/h3 on the category pages, use --navy-900.
 *   · `text-muted-foreground` → `text-[var(--text-body)]`.  The bridge points
 *     --muted-foreground at --text-soon (#6D6A66), and --text-soon is reserved:
 *     it is the "not built yet" ink that ComingSoonBlock, SoonMock and the
 *     unbuilt FeatureBlock variant all share. Borrowing it for live marketing
 *     copy would spend a signal this site has spent four tickets teaching.
 *   · `border-t`             → `border-t border-[var(--border-light)]`.
 *     🔴 THE ONE THAT WOULD HAVE SHIPPED A COLOUR NOBODY CHOSE. Preflight is
 *     deliberately not imported (see the head of index.css), so nothing sets a
 *     default border-color; `border-t` alone paints at `currentColor`, which
 *     here is the inherited body ink. --border-light is --stone-200, the rule
 *     colour the rest of the site draws.
 *   · `bg-background`        → kept. It bridges to --surface-page → --cream,
 *     which is the ground this page already sits on.
 *
 * And two sizes, so it sits in the site's rhythm rather than Tailwind's:
 * `py-24` → `py-[var(--section-y)]`, `text-4xl` → the same clamp() H2 uses.
 *
 * ⚠️ THE GRID GAINS A ONE-COLUMN STEP. Tailark ships `grid-cols-2` with no
 * smaller breakpoint; at 380px that is a 154px column, and "Community &
 * Engagement" over a 15-character measure. It starts at one column and reaches
 * Tailark's two at @md.
 *
 * 🔴 EACH CELL IS A LINK, AND THE LINK IS THE CELL. The pills it replaces were
 * 10px-padded text — a 37px target. The whole ruled cell is the anchor and it
 * carries `min-h-[44px]`, so the target is at least 44px on every viewport.
 * That is also what preserves the page's one job: five reachable routes,
 * present in the prerendered HTML, working with no JavaScript at all. */

/** Presentational only — a lucide name per category, from the NAME_MAP that
 *  icons.tsx already carries, so this adds no icon to the bundle. Keyed by
 *  slug; an unknown slug falls through to `L`'s own Circle rather than
 *  throwing, because a missing glyph must never take a page down. */
const ICON_BY_SLUG: Readonly<Record<string, string>> = {
  'community-engagement': 'users',
  'discipleship-content': 'book-open',
  'ai-automation': 'brain-circuit',
  'giving-finance': 'hand-heart',
  'platform-brand': 'palette',
};

export interface ContentItem {
  /** The bold lead-in — Tailark's `<span className="font-medium">`. */
  term: string;
  /** The sentence after it. */
  detail: string;
  /** Where the cell goes. */
  to: string;
  /** Lucide name for the icon above the rule's copy. */
  icon: string;
}

export function categoryItem(cat: { slug: string; name: string; seo: string }): ContentItem {
  return {
    term: cat.name,
    detail: cat.seo,
    // Through the catalogue's own resolver, never a hand-built path.
    to: categoryHref(cat.slug),
    icon: ICON_BY_SLUG[cat.slug] ?? 'circle',
  };
}

/**
 * Tailark veil-content-3: a heading, a standfirst, and a ruled grid of
 * icon + bold lead-in + sentence.
 *
 * `headingAs` exists because this block supplies the page's only heading on
 * /features. It ships as an h2; rendered as the page title it has to be the
 * h1, and stacking the block under a second heading that says the same word
 * would have been the alternative.
 */
export function ContentSection({
  heading,
  standfirst,
  items,
  headingAs = 'h2',
}: {
  heading: string;
  standfirst: string;
  items: readonly ContentItem[];
  headingAs?: 'h1' | 'h2';
}) {
  const Heading = headingAs;
  return (
    <section className="bg-background @container py-[var(--section-y)]">
      <div className="mx-auto max-w-2xl px-6">
        <div className="flex flex-col gap-4">
          <Heading className="text-balance font-serif text-[clamp(2rem,4vw,3.1rem)] font-medium leading-[1.06] [letter-spacing:-0.02em] text-[var(--navy-900)]">
            {heading}
          </Heading>
          <p className="leading-[var(--leading-relaxed)] text-[var(--text-body)]">{standfirst}</p>
        </div>
        <div className="@md:grid-cols-2 @xl:grid-cols-3 mt-12 grid grid-cols-1 gap-6 text-sm">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex min-h-[44px] flex-col gap-3 border-t border-[var(--border-light)] pt-6 no-underline"
            >
              <L name={item.icon} size={16} color="var(--text-body)" />
              <p className="leading-5 text-[var(--text-body)]">
                <span className="font-medium text-[var(--navy-900)]">{item.term}</span> {item.detail}{' '}
                {/* The site's link affordance — see the same note in
                    components/content-1.tsx. */}
                <span className="whitespace-nowrap font-medium text-[var(--brand)]" aria-hidden="true">
                  →
                </span>
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ContentSection;
