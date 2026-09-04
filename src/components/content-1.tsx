import React from 'react';
import { Link } from 'react-router-dom';

/* THE-301 — Tailark `veil-content-1`, adopted.
 *
 * Written by `npx shadcn@4.11.0 add @tailark-oss/veil-content-1` from the same
 * free OSS registry and the same Veil theme as its sibling content-3.tsx; the
 * note at the head of that file records why Veil, why not Quartz, and what the
 * CLI wrote. This file records only what is different here.
 *
 * 🔴 WHERE IT GOES: the foot of /contact. That page is a sky header band and a
 * form card, and then it stops. A visitor who arrives with a question the site
 * has already answered in public — what it costs, what it does, what it does
 * NOT do — has one route out of it, which is to type the question and wait.
 * This is the band that gives them the other three, and every one of them is a
 * page that already exists.
 *
 * ⚠️ NOT ONE NEW CLAIM, AND NO NEW SENTENCE. The three details are
 * FAQ_STANDFIRST, the first category's own `seo` line and NOT_BUILT_NOTICE,
 * imported from the files that own them. Nothing here promises a reply time,
 * an SLA or a person — a contact page is exactly where an invented commitment
 * would look most like a real one.
 *
 * ── HOW TAILARK'S TOKENS WERE REWRITTEN ONTO THIS SITE'S RAMPS ─────────────
 *
 * Identical treatment to content-3.tsx, for the reasons set out there:
 *
 *   · `text-foreground`       → `text-[var(--navy-900)]`   (not --text-heading)
 *   · `text-muted-foreground`  → `text-[var(--text-body)]`  (--text-soon is the
 *                                 reserved "not built yet" ink)
 *   · `bg-background`          → kept; bridges to --surface-page → --cream,
 *                                 which is the ground /contact already ends on
 *   · `py-24`                  → `py-[var(--section-y-tight)]`, the spacing the
 *                                 landing sections use between bands
 *   · `text-4xl`               → the clamp() H2 in shared.tsx is set at
 *
 * The block ships no border and no icon, so there is no `border-t` to colour
 * here — content-3.tsx's `currentColor` trap does not arise.
 *
 * 🔴 EACH ITEM IS A LINK AND CARRIES `min-h-[44px]`. Tailark's items are three
 * static paragraphs. Made inline anchors instead, the tap target would have
 * been the height of one line of 16px text; the whole item is the anchor. */

export interface ContentLead {
  /** The bold lead-in — Tailark's `<span className="font-medium">`. */
  term: string;
  /** The sentence after it. */
  detail: string;
  to: string;
}

/**
 * Tailark veil-content-1: a heading beside a stacked column of bold lead-in +
 * sentence, side by side from @2xl and stacked below it.
 */
export function ContentLeads({
  heading,
  items,
}: {
  heading: string;
  items: readonly ContentLead[];
}) {
  return (
    <section className="bg-background @container py-[var(--section-y-tight)]">
      <div className="@2xl:grid-cols-2 mx-auto grid max-w-3xl gap-6 px-6">
        <h2 className="text-balance font-serif text-[clamp(2rem,4vw,3.1rem)] font-medium leading-[1.06] [letter-spacing:-0.02em] text-[var(--navy-900)]">
          {heading}
        </h2>

        <div className="flex flex-col gap-6">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex min-h-[44px] items-center leading-[var(--leading-relaxed)] text-[var(--text-body)] no-underline"
            >
              <span>
                <span className="font-medium text-[var(--navy-900)]">{item.term}</span> {item.detail}{' '}
                {/* The site's link affordance — the arrow LegalPage, FaqPage and
                    the Coming Soon block all end an outbound link on. Without
                    it a body-coloured row reads as prose, not as a destination. */}
                <span className="whitespace-nowrap font-medium text-[var(--brand)]" aria-hidden="true">
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ContentLeads;
