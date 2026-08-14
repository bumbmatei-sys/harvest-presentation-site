import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Features } from './Features';
import { CATALOG_TOOL_COUNT } from './catalog';

/* THE-134 turned up a second copy of the same stale claim while fixing the
 * nav: this section's own footer line said "29 tools across community,
 * discipleship, giving and AI" — the identical wrong count, hardcoded a
 * second time. Same fix, same reason: derive it, don't retype it. */

const html = () => renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(Features)));

describe('the features section footer', () => {
  it('the tool count matches the catalog', () => {
    expect(CATALOG_TOOL_COUNT).toBeGreaterThan(0);
    expect(html()).toContain(`${CATALOG_TOOL_COUNT} tools across community, discipleship, giving and AI`);
  });

  it('never writes the tool count as a literal', () => {
    expect(html()).not.toContain('29 tools');
  });
});
