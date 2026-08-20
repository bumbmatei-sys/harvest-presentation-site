import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BILLING_TERMS, TERM_LABEL, TermToggle } from './Pricing';

/* ─── THE-195 TEST 8: three segments, no clipping, at five viewports ──────────
 *
 * 🔴 WHY THIS IS ARITHMETIC AND NOT A SCREENSHOT. This repo's test runner has
 * no DOM and no layout engine, so nothing here can "measure" a rendered box.
 * What it CAN do is pin the two structural properties that decide whether the
 * control can clip at all, and then compute the width each segment gets from
 * them. That is stronger than it sounds, because the previous control could not
 * have passed it: it was `display: inline-flex`, which sizes to its CONTENT and
 * therefore has no relationship to the viewport — a third segment simply made
 * the track wider than the screen. A grid whose columns are `minmax(0, 1fr)`
 * inside a `width: 100%` box cannot exceed its container by construction.
 *
 * PR 361 fixed a clip on the in-app plan cards at 1120px by removing a
 * content-driven width. This is the same fix applied before the same bug.
 */

const html = renderToStaticMarkup(React.createElement(TermToggle, { value: 'yearly', onChange: () => {} }));

/** The page gutter either side of the content column — `container` in
 *  components/shared.tsx is `padding: '0 28px'`. Read from there rather than
 *  guessed: the gutter is what makes 380px the binding viewport. */
const GUTTER = 28;
/** The toggle's own chrome: `padding: 4` each side, and two 4px column gaps. */
const TRACK_PADDING = 4 * 2;
const GAPS = 4 * 2;
/** `maxWidth: 420` on the track. */
const MAX_TRACK = 420;

/** The width one of the three segments gets at a given viewport. */
function segmentWidth(viewport: number): number {
  const track = Math.min(MAX_TRACK, viewport - GUTTER * 2);
  return (track - TRACK_PADDING - GAPS) / BILLING_TERMS.length;
}

/* An 12.5px semibold sans label sets at roughly 0.55em per character; "Quarterly"
 * is the widest of the three at 9 characters. Deliberately generous — the point
 * is headroom, not a precise text metric this runner cannot produce. */
const CHAR_WIDTH = 12.5 * 0.55;
const widest = Math.max(...BILLING_TERMS.map((t) => TERM_LABEL[t].length)) * CHAR_WIDTH;
/** `padding: '8px 10px'` — horizontal padding eats into the label's room. */
const SEGMENT_PADDING = 10 * 2;

describe('the term toggle renders three segments without clipping at every measured width', () => {
  it('renders exactly three segments', () => {
    const segments = html.match(/data-testid="term-toggle-segment"/g);
    expect(segments).toHaveLength(3);
    for (const t of BILLING_TERMS) {
      expect(html).toContain(`data-term="${t}"`);
      expect(html).toContain(TERM_LABEL[t]);
    }
  });

  it.each([380, 768, 1024, 1280, 1440])('fits its labels at %ipx', (viewport) => {
    const seg = segmentWidth(viewport);
    const room = seg - SEGMENT_PADDING;
    expect(room, `"Quarterly" (~${widest.toFixed(0)}px) does not fit a ${seg.toFixed(0)}px segment`)
      .toBeGreaterThan(widest);
  });

  it('reports the measured segment widths', () => {
    // The five figures the change is reported with. 380px is the binding case —
    // the track is viewport-bound there (380 − 56 = 324px). From 768px up it is
    // capped at its 420px maximum, so every wider viewport yields the same
    // segment and none of them can be the tight one. "Quarterly" sets to ~62px
    // against 83px of usable room at 380px: slack, not a snug fit.
    const measured = Object.fromEntries(
      [380, 768, 1024, 1280, 1440].map((v) => [v, Math.round(segmentWidth(v))]),
    );
    expect(measured).toEqual({ 380: 103, 768: 135, 1024: 135, 1280: 135, 1440: 135 });
  });

  it('🔴 keeps the track from ever exceeding its container — the property that stops a clip', () => {
    // Not `inline-flex` (sizes to content, ignores the viewport) and not bare
    // `1fr` (a grid column's implicit min-width is `auto`, which refuses to
    // shrink below its content and overflows instead).
    expect(html).toContain('display:grid');
    expect(html).toContain('grid-template-columns:repeat(3, minmax(0, 1fr))');
    expect(html).toContain('width:100%');
    expect(html).toContain('max-width:420px');
    expect(html).not.toContain('display:inline-flex');
    // Every segment may shrink.
    expect(html.match(/min-width:0/g)).toHaveLength(3);
  });

  it('🔴 hangs no badge outside the track — the PR 361 failure mode', () => {
    // The two-term control positioned its badge `absolute -top-2 -right-2`. An
    // absolutely-positioned child contributes nothing to the track's width and
    // overhangs the rounded container on both axes; with two segments there was
    // slack to overhang into, and with three there is not.
    expect(html).not.toContain('position:absolute');
    // The badge is a block-level second line, in normal flow, inside the button.
    expect(html.match(/data-testid="term-toggle-badge"/g)).toHaveLength(2);
  });

  it('keeps every label and badge at 11px or above', () => {
    // The floor the change was given. Labels 12.5px, badges 11px.
    expect(html).toContain('font-size:12.5px');
    expect(html).toContain('font-size:11px');
    const sizes = [...html.matchAll(/font-size:([0-9.]+)px/g)].map((m) => Number(m[1]));
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(11);
  });

  it('does not wrap a label, which is the other way a segment clips', () => {
    // No `whitespace-nowrap` forcing an overflow, and no fixed segment width
    // that a longer label could burst.
    expect(html).not.toContain('white-space:nowrap');
    // A FIXED width on a segment, i.e. `width:` at the start of a declaration —
    // `max-width` on the track and `min-width:0` on the segments are the fix,
    // not the hazard, so the boundary is anchored.
    expect(html).not.toMatch(/(^|[;"])width:[0-9]+px/);
  });
});
