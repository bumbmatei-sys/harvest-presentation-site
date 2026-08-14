import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MegaMenuFooterLabel } from './Nav';
import { CATALOG_TOOL_COUNT } from './catalog';
import { CHEAPEST_MONTHLY, annualMonthly, plans } from './Pricing';

/* THE-134: the mega-menu footer advertised "29 tools in one platform — from
 * $59/mo" with no plan costing $59 and Nav.tsx importing no pricing constant
 * at all — a figure typed by hand, with nothing to keep it in step.
 *
 * `MegaMenuFooterLabel` is rendered here rather than asserted on as a string
 * constant, for the same reason Pricing.test.ts renders `PlanCard`: a pure
 * value can agree with an expectation while the JSX seam that actually ships
 * has been mutated to something else. Only the rendered markup catches that. */

const footerHtml = () => renderToStaticMarkup(React.createElement(MegaMenuFooterLabel));

describe('the nav mega-menu footer', () => {
  it('the nav quotes a price that matches the cheapest plan', () => {
    const cheapest = Math.min(...plans.map((p) => p.monthly));
    expect(CHEAPEST_MONTHLY).toBe(cheapest);
    expect(footerHtml()).toContain(`from $${cheapest}/mo`);
  });

  it('the nav names the billing term whenever it quotes an annual-equivalent price', () => {
    // The footer quotes the plain monthly sticker price today — it is static
    // copy behind no toggle, so there is nowhere to hang a "billed annually"
    // qualifier. This guards the alternative: if a future edit swaps in the
    // annual-equivalent figure (the thing #55 fixed for the pricing cards),
    // it must not appear without the term that makes it true.
    const rendered = footerHtml();
    for (const p of plans) {
      const annualFigure = annualMonthly(p.monthly);
      if (annualFigure === p.monthly) continue;
      if (rendered.includes(`$${annualFigure}/mo`)) {
        expect(rendered.toLowerCase()).toContain('annually');
      }
    }
  });

  it('the tool count matches the catalog, excluding tools marked soon', () => {
    // CATALOG has no `soon` items today, so this equals CATALOG's raw length —
    // but the footer claims tools are "in one platform" now, and a `soon` item
    // is explicitly marked as not built yet, so the count is derived with that
    // filter rather than from CATALOG.length, in case one is ever added.
    expect(CATALOG_TOOL_COUNT).toBeGreaterThan(0);
    expect(footerHtml()).toContain(`${CATALOG_TOOL_COUNT} tools in one platform`);
  });
});

describe('Nav.tsx source', () => {
  it('no price literal appears in Nav.tsx', () => {
    // Comments are stripped first (same idiom as legal.test.ts's trial-length
    // scan) so a comment explaining a past price stays legal; nothing rendered
    // may state a dollar figure that did not come through an imported
    // constant. `\$\d` catches a literal like `$59` while letting `$${…}`
    // template interpolation through, since a `$` there is followed by `$` or
    // `{`, never a digit.
    const source = readFileSync(fileURLToPath(new URL('./Nav.tsx', import.meta.url)), 'utf8');
    const stripped = source
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');
    const match = stripped.match(/\$\d/);
    expect(match, `Nav.tsx writes a price as a literal (${JSON.stringify(match?.[0])})`).toBe(null);
  });
});
