/**
 * THE-278 — Tailwind v4 + shadcn (base-nova) on the marketing site.
 *
 * This file proves the STYLING SYSTEM works. Its sibling,
 * `the-278-no-regression.test.ts`, proves it changed nothing that already
 * existed; the two are deliberately separate so a mutation can be seen to break
 * exactly one of them.
 *
 * 🔴 THE LESSON THIS FILE IS BUILT AROUND (THE-263, in the app repo): a CSS
 * variable alone mints NO utility. With `--muted`, `--foreground` and `--border`
 * declared in `:root`, every one of `bg-muted`, `text-foreground` and
 * `border-input` still produced no rule. Both halves are required — the variable
 * AND an `@theme inline` entry — so every token below is asserted twice: once as
 * a declaration that resolves to a colour, and once as a utility that a browser
 * would actually apply. Asserting only the first is how you ship tokens nothing
 * reads and believe you are finished.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '../components/ui/card';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CSS_SRC = readFileSync(path.join(ROOT, 'src', 'index.css'), 'utf8');

/* ── the built stylesheet ────────────────────────────────────────────────── */
/** Every dist assertion is skipped when dist is absent so `npm test` before a
 *  build still runs; CI builds between its two test runs, so these run there.
 *  Same idiom as the-253-ai-chat-addon.test.ts. */
const DIST = path.join(ROOT, 'dist');
const distCssFiles = existsSync(path.join(DIST, 'assets'))
  ? readdirSync(path.join(DIST, 'assets')).filter((f) => f.endsWith('.css'))
  : [];
const built = distCssFiles.length > 0;
const distCss = built
  ? distCssFiles.map((f) => readFileSync(path.join(DIST, 'assets', f), 'utf8')).join('\n')
  : '';

/* ── token resolution ────────────────────────────────────────────────────── */
/**
 * The LAST declaration of a custom property wins, exactly as the cascade
 * resolves it. index.css carries two `:root` blocks after this ticket — the
 * original one and the shadcn block appended below it — and reading the last is
 * what makes the test agree with the browser rather than with the file order.
 */
function declaredValue(name: string): string | null {
  const re = new RegExp(`^\\s*${name}\\s*:\\s*([^;]+);`, 'gm');
  let last: string | null = null;
  for (const m of CSS_SRC.matchAll(re)) last = m[1].trim();
  return last;
}

/** Follows a `var(--a)` chain until it lands on a literal colour. */
function resolve(name: string, depth = 0): string {
  const v = declaredValue(name);
  if (v === null) throw new Error(`${name} is not declared in index.css`);
  if (depth > 8) throw new Error(`${name} does not resolve to a literal`);
  const m = v.match(/^var\(\s*(--[a-z0-9-]+)\s*\)$/i);
  return m ? resolve(m[1], depth + 1) : v;
}

const hex = (h: string): [number, number, number] => {
  const s = h.trim().replace('#', '');
  const f = s.length === 3 ? s.split('').map((c) => c + c).join('') : s;
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16)) as [number, number, number];
};
const luminance = (rgb: [number, number, number]) => {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (fg: string, bg: string) => {
  const [hi, lo] = [luminance(hex(fg)), luminance(hex(bg))].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
};

/**
 * The bridge, as a table. Each row is: the shadcn token, the Harvest token it
 * is declared as, and the colour that chain has to land on. Pinning the literal
 * means a re-point of an underlying ramp cannot silently move a shadcn colour.
 */
const TOKENS: ReadonlyArray<readonly [string, string, string]> = [
  ['--background', '--surface-page', '#FAF8F5'],
  ['--foreground', '--text-heading', '#2D2519'],
  ['--card', '--surface-card', '#FFFFFF'],
  ['--card-foreground', '--text-heading', '#2D2519'],
  ['--popover', '--surface-card', '#FFFFFF'],
  ['--popover-foreground', '--text-heading', '#2D2519'],
  ['--primary', '--gold-500', '#C9963A'],
  ['--primary-foreground', '--earth', '#2D2519'],
  ['--secondary', '--surface-sunken', '#F3EEE7'],
  ['--secondary-foreground', '--text-heading', '#2D2519'],
  ['--muted', '--surface-sunken', '#F3EEE7'],
  ['--muted-foreground', '--text-soon', '#6D6A66'],
  ['--accent', '--surface-gold', '#F5EDE0'],
  ['--accent-foreground', '--text-heading', '#2D2519'],
  ['--destructive', '--danger', '#C4553B'],
  ['--border', '--border-light', '#E8E2D9'],
  ['--input', '--border-strong', '#D6CCBE'],
  ['--ring', '--gold-600', '#B5862F'],
];

/* ═══ 1 — Tailwind emits utilities in the PRERENDERED output ═══════════════ */
describe('1 — Tailwind emits utilities into the built stylesheet', () => {
  it.runIf(built)('the prerendered CSS carries real utility rules, not just variables', () => {
    /* 🔴 Asserted against dist/, never against dev. A dev-only install is not an
       install: the whole risk of this ticket is a PostCSS chain that runs under
       `vite` and silently does nothing under `vite-react-ssg build`. */
    expect(distCss).toMatch(/\.bg-primary\s*\{[^}]*background-color:/);
    expect(distCss).toMatch(/\.text-primary-foreground\s*\{[^}]*color:/);
    expect(distCss).toMatch(/\.bg-card\s*\{[^}]*background-color:/);
    expect(distCss).toMatch(/\.text-card-foreground\s*\{[^}]*color:/);
    expect(distCss).toMatch(/\.text-muted-foreground\s*\{[^}]*color:/);
    expect(distCss).toMatch(/\.rounded-xl\s*\{[^}]*border-radius:/);
    expect(distCss).toMatch(/\.inline-flex\s*\{[^}]*display:\s*inline-flex/);
  });

  it.runIf(built)('v4 applies an opacity modifier with color-mix, so hover:bg-primary/80 is a real rule', () => {
    /* Under v3 this silently emitted nothing. The presence of color-mix is the
       proof that the v4 pipeline — not a v3 shim — produced this file. */
    expect(distCss).toMatch(/color-mix\(/);
    expect(distCss).toMatch(/hover\\:bg-primary\\\/80/);
  });

  it.runIf(built)('the utilities land in a cascade layer, so they cannot outrank the hand-written CSS', () => {
    expect(distCss).toMatch(/@layer\s+utilities/);
  });
});

/* ═══ 2 — cn() ════════════════════════════════════════════════════════════ */
describe('2 — cn() merges conflicting classes correctly', () => {
  it('the last conflicting utility wins', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-sm', 'text-lg')).toBe('text-lg');
    expect(cn('bg-primary', 'bg-card')).toBe('bg-card');
  });

  it('non-conflicting classes are all kept, in order', () => {
    expect(cn('inline-flex', 'rounded-xl')).toBe('inline-flex rounded-xl');
  });

  it('falsy branches drop out rather than rendering "false"', () => {
    expect(cn('p-2', false && 'p-4', undefined, null, '')).toBe('p-2');
    expect(cn(['gap-2', 'items-center'])).toBe('gap-2 items-center');
    expect(cn({ 'sr-only': false, 'font-medium': true })).toBe('font-medium');
  });

  it('a caller-supplied className overrides the component default', () => {
    /* This is the single behaviour every shadcn primitive depends on. */
    expect(cn('rounded-xl bg-card', 'rounded-none')).toBe('bg-card rounded-none');
  });
});

/* ═══ 3 — the two primitives render ═══════════════════════════════════════ */
describe('3 — button and card render, and carry their token classes', () => {
  const render = (el: React.ReactElement) => renderToStaticMarkup(el);

  it('Button renders a real button carrying the primary token classes', () => {
    const html = render(React.createElement(Button, null, 'Book a walkthrough'));
    expect(html).toMatch(/<button/);
    expect(html).toContain('Book a walkthrough');
    expect(html).toContain('data-slot="button"');
    expect(html).toContain('bg-primary');
    expect(html).toContain('text-primary-foreground');
  });

  it('Button variants and sizes reach the class list', () => {
    expect(render(React.createElement(Button, { variant: 'outline' }, 'x'))).toContain('bg-background');
    expect(render(React.createElement(Button, { variant: 'secondary' }, 'x'))).toContain('bg-secondary');
    expect(render(React.createElement(Button, { size: 'lg' }, 'x'))).toContain('h-9');
  });

  it('Card and its slots render with the card tokens', () => {
    const html = render(
      React.createElement(
        Card,
        null,
        React.createElement(CardTitle, null, 'One plan'),
        React.createElement(CardDescription, null, 'Everything included'),
        React.createElement(CardContent, null, 'Body'),
      ),
    );
    expect(html).toContain('data-slot="card"');
    expect(html).toContain('bg-card');
    expect(html).toContain('text-card-foreground');
    expect(html).toContain('text-muted-foreground');
    expect(html).toContain('One plan');
  });

  it.runIf(built)('every class those two primitives render resolves to a rule in the built CSS', () => {
    /* 🔴 The THE-263 trap, closed: a class in the markup that mints no rule is
       indistinguishable from a working one until someone looks at the page. */
    const markup =
      render(React.createElement(Button, null, 'x')) +
      render(React.createElement(Card, null, React.createElement(CardTitle, null, 'x')));
    const classes = [...markup.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/));
    /* Only the plain, unconditional utilities are checked here: variant-gated
       ones (hover:, dark:, aria-) are asserted by rule elsewhere, and arbitrary
       selectors carry characters that are not worth escaping twice. */
    const plain = classes.filter((c) => /^[a-z][a-z0-9-]*$/.test(c) && !c.startsWith('group'));
    const missing = plain.filter((c) => !new RegExp(`\\.${c}[\\s,{:]`).test(distCss));
    expect(missing, `these classes mint no rule in dist: ${missing.join(', ')}`).toEqual([]);
  });
});

/* ═══ 4 — every shadcn token resolves, named per token ════════════════════ */
describe('4 — every shadcn token resolves', () => {
  it.each(TOKENS)('%s is declared as %s and resolves to %s', (token, source, literal) => {
    expect(declaredValue(token), `${token} is not declared`).toBe(`var(${source})`);
    expect(resolve(token).toUpperCase()).toBe(literal.toUpperCase());
  });

  it.each(TOKENS)('%s has an @theme inline entry, so it mints a utility', (token: string) => {
    /* The second half of THE-263's lesson. Without this entry the variable is
       declared, resolves, and paints nothing. */
    const themeBlock = CSS_SRC.slice(CSS_SRC.indexOf('@theme inline'));
    const name = token.replace(/^--/, '');
    expect(themeBlock).toMatch(new RegExp(`--color-${name}\\s*:\\s*var\\(${token}\\)`));
  });

  it('--radius is the radius the site\'s own cards actually use', () => {
    /* Measured, not assumed: 14px is the most common radius on the site's real
       cards (9 uses), ahead of 12px (3). The app chose 12px; the site does not
       match it, which is exactly why this was measured rather than copied. */
    expect(declaredValue('--radius')).toBe('14px');
  });

  it.runIf(built)('every mapped token reaches the built stylesheet', () => {
    for (const [token] of TOKENS) {
      expect(distCss, `${token} never reaches dist`).toContain(token);
    }
  });

  it('no shadcn token is left pointing at a Harvest token that does not exist', () => {
    for (const [, source] of TOKENS) {
      expect(declaredValue(source), `${source} is referenced but never declared`).not.toBeNull();
    }
  });
});

/* ═══ 5 — contrast ════════════════════════════════════════════════════════ */
describe('5 — every foreground/background pair clears WCAG AA', () => {
  /** [foreground, background, measured ratio]. Ratios are pinned, not merely
   *  compared to a threshold, so a re-point that stays legal but moves the
   *  number still has to be looked at. */
  const PAIRS: ReadonlyArray<readonly [string, string, number]> = [
    ['--foreground', '--background', 14.25],
    ['--card-foreground', '--card', 15.11],
    ['--popover-foreground', '--popover', 15.11],
    ['--primary-foreground', '--primary', 5.69],
    ['--secondary-foreground', '--secondary', 13.09],
    ['--accent-foreground', '--accent', 13.00],
    ['--muted-foreground', '--muted', 4.66],
    ['--muted-foreground', '--background', 5.07],
    ['--muted-foreground', '--card', 5.38],
    ['--foreground', '--card', 15.11],
    ['--foreground', '--muted', 13.09],
  ];

  it.each(PAIRS)('%s on %s clears AA', (fg, bg, expected) => {
    const r = contrast(resolve(fg), resolve(bg));
    expect(r).toBeCloseTo(expected, 1);
    expect(r, `${fg} on ${bg} is ${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
  });

  it('white is NOT used on brand gold anywhere in the bridge', () => {
    /* The app measured this at 2.51:1 and rejected it; the same gold is the
       site's --gold-500, so the same answer holds. --text-on-gold in index.css
       IS white — an existing pairing this ticket does not touch and does not
       adopt. */
    expect(contrast('#FFFFFF', resolve('--primary'))).toBeLessThan(3);
    expect(resolve('--primary-foreground').toUpperCase()).not.toBe('#FFFFFF');
  });

  it('🔴 --destructive is the ONE pair that cannot clear AA from existing tokens', () => {
    /* REPORTED, NOT HIDDEN. --danger #C4553B is the only red the site owns, and
       it measures under 4.5 on both light grounds. The app hit exactly this and
       answered it with a darker token (--ink-danger-strong); the site has no
       equivalent, and minting one is a colour decision that belongs to the
       founder, not to a plumbing ticket.
       The numbers are pinned so the gap is a fact in the suite rather than a
       sentence in a PR description nobody re-reads. */
    const onCard = contrast(resolve('--destructive'), resolve('--card'));
    const onBackground = contrast(resolve('--destructive'), resolve('--background'));
    expect(onCard).toBeCloseTo(4.46, 1);
    expect(onBackground).toBeCloseTo(4.21, 1);
    expect(onCard).toBeLessThan(4.5);
  });

  it('the navy ramp is checked as a dark SECTION, not as a dark mode', () => {
    /* The site has no dark mode. Navy is a band inside a light page, so the
       pairing that matters is white-on-navy, and it is not part of the shadcn
       bridge at all — asserted here so a later ticket cannot quietly map a
       shadcn token onto navy and call it checked. */
    expect(contrast('#FFFFFF', resolve('--navy-900'))).toBeGreaterThanOrEqual(4.5);
    for (const [token] of TOKENS) {
      expect(resolve(token).toUpperCase()).not.toBe('#0C1526');
    }
  });
});
