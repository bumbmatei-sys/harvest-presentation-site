import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { renderMarkdown } from '../../build/parse-post';
import type { ImageSizes } from './post-core';

/* THE-116: a remote image (no build-time measurement possible) is wrapped in
 * .blog-img-frame and centre-cropped to 16:9 — correct for a photograph, wrong
 * for a logo, which must keep its own proportions. The signal is the markdown
 * title, reusing the attribute the renderer already reads for captions
 * (`![alt](url "title")`) rather than inventing new syntax or a dependency:
 * the literal value "logo" (case-insensitive) marks the image, and — because
 * that reuse would otherwise turn every marked logo into a captioned figure —
 * a "logo"-titled image deliberately does not caption itself. */

const REMOTE = 'https://cdn.simpleicons.org/notion';
const LOCAL = '/blog/some-post/diagram.webp';
const SIZES: ImageSizes = { [LOCAL]: { width: 800, height: 450, bytes: 12345 } };

const CSS = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'index.css'),
  'utf8',
);

describe('renderMarkdown — remote logo vs. ordinary remote image', () => {
  it('keeps a marked image at its own proportions', () => {
    const html = renderMarkdown(`![Notion](${REMOTE} "logo")`, {});
    expect(html).toContain('class="blog-img-frame blog-img-frame--contain"');

    // The class alone reserves nothing without the CSS rule that makes it
    // letterbox instead of crop.
    const rule = /\.blog-img-frame--contain\s+img\s*\{[^}]*\}/.exec(CSS);
    expect(rule, '.blog-img-frame--contain img rule is missing from index.css').not.toBeNull();
    expect(rule![0]).toMatch(/object-fit:\s*contain/);
  });

  it('still centre-crops an ordinary remote body image', () => {
    const html = renderMarkdown(`![A screenshot](${REMOTE})`, {});
    expect(html).toContain('class="blog-img-frame"');
    expect(html).not.toContain('blog-img-frame--contain');
  });

  it('still reserves layout space for an image of unknown size', () => {
    const html = renderMarkdown(`![Notion](${REMOTE} "logo")`, {});
    expect(html).toMatch(/<span class="blog-img-frame blog-img-frame--contain"><img [^>]*><\/span>/);
    expect(html).not.toMatch(/width="\d+"/);
    expect(html).not.toMatch(/height="\d+"/);
  });

  it('leaves locally measured images emitting intrinsic width and height', () => {
    const html = renderMarkdown(`![A diagram](${LOCAL})`, SIZES);
    expect(html).toContain('width="800"');
    expect(html).toContain('height="450"');
    expect(html).not.toContain('blog-img-frame');
  });

  it('does not caption an image that only carries the logo marker', () => {
    const html = renderMarkdown(`![Notion](${REMOTE} "logo")`, {});
    expect(html).not.toContain('<figcaption>');
    expect(html).not.toContain('<figure');
  });

  it('still captions an ordinary titled image', () => {
    const html = renderMarkdown(`![A diagram](${LOCAL} "What this shows")`, SIZES);
    expect(html).toContain('<figure class="blog-figure">');
    expect(html).toContain('<figcaption>What this shows</figcaption>');
  });
});
