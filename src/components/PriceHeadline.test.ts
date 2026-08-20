/**
 * THE-196 — the per-month headline, the charged total beneath it, and the
 * legibility of the line that now carries the only figure a church is billed.
 *
 * Everything here reads RENDERED OUTPUT. PR 55 learned that a pure-function
 * test passes while the JSX seam is mutated, so the card is rendered and the
 * figures are read back out of its markup, styles included.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  BILLING_TERMS,
  DISCOUNTED_TERMS,
  PlanCard,
  TERM_MONTHS,
  ceilToCent,
  formatMonthlyHeadline,
  monthlyHeadlineContract,
  plans,
  type BillingTerm,
  type Plan,
} from './Pricing';
import { Replaces } from './Replaces';

const render = (el: React.ReactElement) => renderToStaticMarkup(el);
const card = (plan: Plan, term: BillingTerm) => render(React.createElement(PlanCard, { plan, term }));

/* ─── WCAG relative luminance, so contrast is MEASURED and not asserted ────── */
const srgb = (c: number) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
};
const lum = ([r, g, b]: number[]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
const contrast = (a: number[], b: number[]) => {
  const [l1, l2] = [lum(a), lum(b)];
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};
const composite = (fg: number[], alpha: number, bg: number[]) =>
  fg.map((c, i) => Math.round(c * alpha + bg[i] * (1 - alpha)));

/** The two card grounds, resolved from index.css. */
const WHITE = [255, 255, 255];
const NAVY_900 = [0x0c, 0x15, 0x26];

/**
 * Pull the term-total line's own declaration off the rendered card — the
 * element that contains "billed as", with the inline style it actually
 * shipped. React renders these as `style="font-size:12.5px;..."`.
 */
function termTotalLine(html: string): { fontSize: number; color: string; text: string } | null {
  const m = html.match(/<div style="([^"]*)"[^>]*>(billed as [^<]*)<\/div>/);
  if (!m) return null;
  const style = m[1];
  const fontSize = Number(style.match(/font-size:\s*([0-9.]+)px/)?.[1]);
  const color = style.match(/color:\s*([^;"]+)/)?.[1] ?? '';
  return { fontSize, color, text: m[2] };
}

/** Resolve the two colours the term-total line is allowed to be. */
function resolveColour(color: string, ground: number[]): number[] {
  const rgba = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\)/);
  if (rgba) {
    return composite([Number(rgba[1]), Number(rgba[2]), Number(rgba[3])], Number(rgba[4]), ground);
  }
  if (color.includes('--navy-900')) return NAVY_900;
  throw new Error(`Unrecognised term-total colour: ${color}`);
}

describe('THE-196 — the headline is the per-month figure', () => {
  it('the headline is the per-month figure on every term and tier', () => {
    // Nine cells, read off nine rendered cards. The headline is the first
    // dollar figure in a <span> and may carry cents.
    for (const p of plans) {
      for (const term of BILLING_TERMS) {
        const html = card(p, term);
        const headline = html.match(/>(\$[0-9,]+(?:\.[0-9]{2})?)<\/span>/)?.[1];
        expect(headline, `${p.name} ${term}`).toBe(formatMonthlyHeadline(p.price[term], term));
        // …and it is followed by /mo, never by the term's own suffix.
        expect(html).toContain('/mo');
      }
    }
  });

  it('the nine headlines are the figures the founder signed off', () => {
    // Named explicitly, so a change to the rounding RULE has to come here and
    // restate what it now shows rather than sliding through a derivation.
    const table = plans.map((p) => BILLING_TERMS.map((t) => formatMonthlyHeadline(p.price[t], t)));
    expect(table).toEqual([
      ['$39', '$33', '$27.42'],
      ['$79', '$66.34', '$54.92'],
      ['$159', '$133', '$110.75'],
    ]);
  });

  it('an exact division shows no cents and a remainder always does', () => {
    expect(formatMonthlyHeadline(99, 'quarterly')).toBe('$33');       // 33.00 exactly
    expect(formatMonthlyHeadline(399, 'quarterly')).toBe('$133');     // 133.00 exactly
    expect(formatMonthlyHeadline(1329, 'yearly')).toBe('$110.75');    // exact, but not whole
    expect(formatMonthlyHeadline(329, 'yearly')).toBe('$27.42');      // 27.4167 ceiled
    expect(ceilToCent(33)).toBe(33);                                  // no float drift upward
  });
});

describe('THE-196 — the term total beneath it', () => {
  it('the term total is rendered beneath it on quarterly and yearly', () => {
    for (const p of plans) {
      for (const term of DISCOUNTED_TERMS) {
        const line = termTotalLine(card(p, term));
        expect(line, `${p.name} ${term}`).not.toBeNull();
        expect(line!.text).toBe(
          `billed as $${p.price[term].toLocaleString()} every ${TERM_MONTHS[term]} months`,
        );
      }
    }
  });

  it('monthly renders as decided: headline alone, no term-total line', () => {
    // 🔴 THE DECIDED BEHAVIOUR, NAMED. On monthly the headline already is the
    // charged amount on the charged cycle, so a line reading "billed as $39
    // every 1 month" would be the same sentence twice. The row is still
    // reserved (minHeight) so the cards do not shift when the toggle moves.
    for (const p of plans) {
      const html = card(p, 'monthly');
      expect(termTotalLine(html)).toBeNull();
      expect(html).not.toContain('billed as');
      expect(html).toContain(`$${p.price.monthly.toLocaleString()}`);
      expect(html).toMatch(/min-height:\s*18px/);
    }
  });

  it('the term total line is at least 11px as rendered and meets AA contrast', () => {
    // ⚠️ MEASURED off the rendered declaration, not asserted. The desktop rem
    // base is 14.5px above 1024px, which is why this is an explicit px size and
    // not a utility that would compute to 10.875px.
    for (const p of plans) {
      for (const term of DISCOUNTED_TERMS) {
        const line = termTotalLine(card(p, term))!;
        expect(line.fontSize, `${p.name} ${term} size`).toBeGreaterThanOrEqual(11);
        // The popular card is navy, the others white.
        const ground = p.popular ? NAVY_900 : WHITE;
        const ratio = contrast(resolveColour(line.color, ground), ground);
        expect(ratio, `${p.name} ${term} contrast ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('the charged total is not the faintest ink on the card', () => {
    // The defect this replaced: --text-muted (#A99B84) measured 2.72:1 on
    // white — the only figure a church is actually billed, in the quietest ink
    // on the card, under a 40px figure nobody is billed.
    for (const p of plans.filter((x) => !x.popular)) {
      const line = termTotalLine(card(p, 'yearly'))!;
      expect(line.color).not.toContain('--text-muted');
      expect(contrast(resolveColour(line.color, WHITE), WHITE)).toBeGreaterThan(7);
    }
  });
});

describe('THE-196 — the honesty guard', () => {
  it('the per-month headline never implies less than the charged total', () => {
    // 🔴 One assertion per tier per term, on RENDERED output.
    for (const p of plans) {
      for (const term of BILLING_TERMS) {
        const html = card(p, term);
        const headline = Number(
          html.match(/>\$([0-9,]+(?:\.[0-9]{2})?)<\/span>/)![1].replace(/,/g, ''),
        );
        const implied = headline * TERM_MONTHS[term];
        expect(
          implied,
          `${p.name} ${term}: $${headline}/mo implies $${implied.toFixed(2)}, charged $${p.price[term]}`,
        ).toBeGreaterThanOrEqual(p.price[term]);
      }
    }
  });

  it('the guard throws when the rounding rule would understate the bill', () => {
    // By MUTATION of the rule, which is the thing that can regress. Checked
    // against the shipped ceiling it could never fail.
    expect(() => monthlyHeadlineContract()).not.toThrow();
    expect(() => monthlyHeadlineContract(Math.round)).toThrow(/never promise less than the bill/);
    expect(() => monthlyHeadlineContract(Math.round)).toThrow(/Individual yearly/);
    expect(() => monthlyHeadlineContract(Math.floor)).toThrow(/never promise less than the bill/);
    // Ceiling to the dollar never understates, so the guard accepts it; it is
    // the reconciliation test that rules it out.
    expect(() => monthlyHeadlineContract(Math.ceil)).not.toThrow();
  });

  it('the headline reconciles with the charged total, not merely exceeds it', () => {
    // Ceiling to the DOLLAR would put $28/mo over a charged $329 — a $7
    // disagreement between two numbers on the same card.
    for (const p of plans) {
      for (const term of BILLING_TERMS) {
        const implied = ceilToCent(p.price[term] / TERM_MONTHS[term]) * TERM_MONTHS[term];
        expect(implied - p.price[term]).toBeLessThan(0.05);
      }
    }
  });
});

describe('THE-196 — the presentation matches the in-app cards', () => {
  it('the in-app card and the site card present a price the same way', () => {
    /* 🔴 THE CROSS-SURFACE CONTRACT. The two repos cannot import each other, so
       this is the same mechanism as the price contract above: the app's side,
       transcribed, and NOTHING RENDERS THESE. A church can see the marketing
       card and the in-app plan card in one session.

       Harvest-agent renders, in src/components/settings/PlanUpgradeSection.tsx:
         headline   formatPlanMonthlyHeadline(planId, term)  + "/mo"
         beneath    `billed as ${chargedTotal} every ${TERM_MONTHS[term]} months`
         monthly    headline alone, no line beneath
       and its own suite asserts those against its rendered cards. If either
       repo changes the shape, one of the two fails. */
    const APP_HEADLINES: Record<string, Record<BillingTerm, string>> = {
      plus: { monthly: '$39',  quarterly: '$33',     yearly: '$27.42'  },
      pro:  { monthly: '$79',  quarterly: '$66.34',  yearly: '$54.92'  },
      max:  { monthly: '$159', quarterly: '$133',    yearly: '$110.75' },
    };
    for (const p of plans) {
      for (const term of BILLING_TERMS) {
        expect(formatMonthlyHeadline(p.price[term], term), `${p.planId} ${term}`)
          .toBe(APP_HEADLINES[p.planId][term]);
        const html = card(p, term);
        expect(html).toContain(`${APP_HEADLINES[p.planId][term]}</span>`);
        // The wording of the line beneath is the app's, character for character.
        if (term !== 'monthly') {
          expect(html).toContain(
            `billed as $${p.price[term].toLocaleString()} every ${TERM_MONTHS[term]} months`,
          );
        }
      }
    }
  });

  it('no font size is below 11px on any text carrying a price or its terms', () => {
    /* ⚠️ SCOPED TO TEXT THAT CARRIES A FIGURE, deliberately, and the scope is
       the point rather than a convenience.

       The floor exists so that the number a church is billed cannot be set in
       something nobody reads. It is not a site-wide typography rule, and two
       things on these very surfaces sit below it on purpose:

         · the RECOMMENDED badge on the popular card, 10px tracked caps — a
           decorative label carrying no figure. Pre-existing, and outside a
           presentation change to the price block; reported, not altered.
         · FeatureMock.tsx, which draws imitation app screenshots whose chrome
           runs 9.5–10.5px — furniture inside a picture of a UI.

       So this asserts the elements that actually state money: the headline, the
       line beneath it, and the Replaces comparison cost. */
    const priceText: Array<readonly [string, string]> = [];
    for (const p of plans) {
      for (const term of BILLING_TERMS) {
        const html = card(p, term);
        // The headline and its /mo suffix.
        for (const m of html.matchAll(/<span style="([^"]*)"[^>]*>(\$[0-9,.]+|\/mo)<\/span>/g)) {
          priceText.push([`${p.name} ${term} headline`, m[1]] as const);
        }
        // The line beneath, when the term has one.
        const line = html.match(/<div style="([^"]*)"[^>]*>billed as [^<]*<\/div>/);
        if (line) priceText.push([`${p.name} ${term} term total`, line[1]] as const);
      }
    }
    // The Replaces comparison cost and the charged total under it.
    const replaces = render(React.createElement(Replaces));
    for (const m of replaces.matchAll(/<(?:span|div) style="([^"]*)"[^>]*>[^<]*(?:\$[0-9,]|\/mo|billed annually)[^<]*<\/(?:span|div)>/g)) {
      priceText.push(['Replaces cost', m[1]] as const);
    }

    expect(priceText.length).toBeGreaterThan(20);
    for (const [where, style] of priceText) {
      const size = Number(style.match(/font-size:\s*([0-9.]+)px/)?.[1]);
      if (!Number.isNaN(size)) {
        expect(size, `${where} is ${size}px`).toBeGreaterThanOrEqual(11);
      }
    }
  });
});
