/* TEMPORARY probe — prints the built-output fingerprints on CI's platform so
   the pre- and post-Tailwind builds can be compared on Linux rather than on a
   Windows box whose blog slugs are broken. Deleted before merge. */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = path.join(ROOT, 'dist');
const built = existsSync(path.join(DIST, 'index.html'));
const sha = (s: string) => createHash('sha256').update(s).digest('hex');

const normalise = (html: string) =>
  html
    .replace(/-[A-Za-z0-9_-]{6,}\.(css|js|json)/g, '-HASH.$1')
    .replace(/__VITE_REACT_SSG_HASH__ = '[^']*'/g, "__VITE_REACT_SSG_HASH__ = 'NONCE'");

const stripLayers = (css: string) => {
  let out = '';
  for (let i = 0; i < css.length;) {
    const m = /^@layer\s+[a-zA-Z, ]+\{/.exec(css.slice(i));
    if (!m) { out += css[i]; i++; continue; }
    let depth = 0, j = i + m[0].length - 1;
    for (; j < css.length; j++) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') { depth--; if (depth === 0) { j++; break; } }
    }
    i = j;
  }
  return out;
};

describe('PROBE', () => {
  it.runIf(built)('prints the built fingerprints', () => {
    const pages: string[] = [];
    (function walk(dir: string) {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const abs = path.join(dir, e.name);
        if (e.isDirectory()) walk(abs);
        else if (e.name === 'index.html') pages.push(path.relative(DIST, abs).split(path.sep).join('/'));
      }
    })(DIST);
    pages.sort();

    const each: Record<string, string> = {};
    for (const p of pages) each[p] = sha(normalise(readFileSync(path.join(DIST, p), 'utf8')));
    const combined = sha(pages.map((p) => `${p}:${each[p]}`).join('\n'));

    const cssDir = path.join(DIST, 'assets');
    const cssFile = readdirSync(cssDir).find((n) => n.endsWith('.css'))!;
    const css = readFileSync(path.join(cssDir, cssFile), 'utf8');
    const unlayered = stripLayers(css).replace(/^\/\*![^*]*\*\//, '').trim();

    console.log('PROBE_BEGIN' + JSON.stringify({
      pageCount: pages.length,
      each,
      combined,
      unlayeredCssSha: sha(unlayered),
      unlayeredCssBytes: unlayered.length,
    }) + 'PROBE_END');

    expect(pages.length).toBeGreaterThan(0);
  });
});
