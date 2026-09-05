import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Features } from './Features';
import { CATALOG_TOOL_COUNT } from './catalog';

/* THE-134 turned up a second copy of the same stale claim while fixing the
 * nav: this section's own footer line said "29 tools across community,
 * discipleship, giving and AI" — the identical wrong count, hardcoded a
 * second time. Same fix, same reason: derive it, don't retype it.
 *
 * ⚠️ THE-314 MADE 29 THE TRUE COUNT, which collided with how the second test
 * was written. It asserted the rendered output never contains "29 tools" — a
 * proxy for "the stale literal is gone" that worked only while 29 was wrong.
 * With SMS live the derived figure IS 29, so that assertion would now fail on a
 * correct render and pass on a hardcoded one, which is backwards. It is
 * rewritten to assert the thing it always meant: the SOURCE carries no literal
 * count at all. */

const html = () => renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(Features)));

describe('the features section footer', () => {
  it('the tool count matches the catalog', () => {
    expect(CATALOG_TOOL_COUNT).toBeGreaterThan(0);
    expect(html()).toContain(`${CATALOG_TOOL_COUNT} tools across community, discipleship, giving and AI`);
  });

  it('never writes the tool count as a literal', () => {
    const src = readFileSync(new URL('./Features.tsx', import.meta.url), 'utf8');
    expect(src, 'the footer line interpolates the constant').toContain('CATALOG_TOOL_COUNT');
    expect(src, 'the tool count was retyped as a literal')
      .not.toMatch(/\d+ tools across community/);
  });
});
