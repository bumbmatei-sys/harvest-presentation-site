import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import {
  HOMEPAGE_LEAD_COPY,
  LeadCaptureBand,
  LeadCaptureForm,
  WAITLIST_ENDPOINT,
  WAITLIST_LEAD_COPY,
} from './LeadCaptureForm';
import { WaitlistPage } from '../pages/WaitlistPage';
import { Landing } from '../pages/Landing';
import { NEWSLETTER_MARKETING_ENABLED, SMS_MARKETING_ENABLED } from '../lib/flags';
import { routes } from '../App';

/**
 * FOUNDER GO — product-updates / waitlist email capture claim safety.
 *
 * This list is Harvest PRODUCT news. It must never ship as a church newsletter,
 * congregational email, or SMS surface, and NEWSLETTER_MARKETING_ENABLED stays
 * false. Microcopy locked 2026-09-21:
 *   · homepage band → Recommended default
 *   · /waitlist     → Alternate A
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '..', '..');
const readSrc = (rel: string) => fs.readFileSync(path.join(ROOT, 'src', rel), 'utf8');

const render = (el: React.ReactElement, entry = '/') =>
  renderToStaticMarkup(React.createElement(
    HelmetProvider, null,
    React.createElement(MemoryRouter, { initialEntries: [entry] }, el),
  ));

const words = (html: string) => html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&#x27;|&apos;/g, "'")
  .replace(/\s+/g, ' ')
  .trim();

/** Phrases that would overclaim newsletter / SMS / congregational email. */
const FORBIDDEN = [
  /\bSMS\b/i,
  /\btext-to-give\b/i,
  /\bweekly digest\b/i,
  /\breach your congregation\b/i,
  /\bemail your members\b/i,
  /\bchurch communications\b/i,
  /\bMailchimp\b/i,
];

describe('LeadCaptureForm — microcopy lock', () => {
  it('homepage band uses Recommended default', () => {
    expect(HOMEPAGE_LEAD_COPY.headline).toBe('Get Harvest product updates');
    expect(HOMEPAGE_LEAD_COPY.cta).toBe('Get updates');
    expect(HOMEPAGE_LEAD_COPY.subcopy).toMatch(/not a church newsletter/i);
    expect(HOMEPAGE_LEAD_COPY.finePrint).toMatch(/not congregational email/i);
    expect(HOMEPAGE_LEAD_COPY.placeholder).toBe('you@church.org');
  });

  it('/waitlist uses Alternate A', () => {
    expect(WAITLIST_LEAD_COPY.headline).toBe('Join the Harvest waitlist');
    expect(WAITLIST_LEAD_COPY.cta).toBe('Join waitlist');
    expect(WAITLIST_LEAD_COPY.subcopy).toMatch(/product news only/i);
    expect(WAITLIST_LEAD_COPY.subcopy).toMatch(/not member email/i);
  });

  it('posts to /api/waitlist on theharvest.app', () => {
    expect(WAITLIST_ENDPOINT).toBe('https://theharvest.app/api/waitlist');
  });
});

describe('LeadCaptureForm — claim safety on rendered markup', () => {
  it('homepage band renders Recommended default and disambiguation', () => {
    const html = render(React.createElement(LeadCaptureBand));
    const text = words(html);
    expect(text).toContain('Get Harvest product updates');
    expect(text).toContain('Get updates');
    expect(text).toMatch(/not a church newsletter/i);
    expect(text).toMatch(/not congregational email/i);
    expect(html).toContain('you@church.org');
    expect(html).toContain('/privacy');
  });

  it('/waitlist page renders Alternate A', () => {
    const html = render(React.createElement(WaitlistPage), '/waitlist');
    const text = words(html);
    expect(text).toContain('Join the Harvest waitlist');
    expect(text).toContain('Join waitlist');
    expect(text).toMatch(/product news only/i);
    expect(text).toMatch(/not member email/i);
  });

  it('Landing embeds the lead-capture band before FinalCTA', () => {
    const src = readSrc('pages/Landing.tsx');
    expect(src).toMatch(/LeadCaptureBand/);
    expect(src.indexOf('<LeadCaptureBand')).toBeLessThan(src.indexOf('<FinalCTA'));
  });

  it('forbidden newsletter/SMS overclaims do not appear on capture surfaces', () => {
    const surfaces = [
      words(render(React.createElement(LeadCaptureBand))),
      words(render(React.createElement(WaitlistPage), '/waitlist')),
      words(render(React.createElement(LeadCaptureForm, {
        source: 'homepage',
        copy: HOMEPAGE_LEAD_COPY,
      }))),
    ];
    for (const text of surfaces) {
      for (const re of FORBIDDEN) {
        expect(text, `forbidden claim matched ${re}`).not.toMatch(re);
      }
      // "newsletter" is allowed ONLY inside the required disambiguation.
      const stripped = text
        .replace(/not a church newsletter/gi, '')
        .replace(/This is not congregational email/gi, '');
      expect(stripped, 'bare "newsletter" without disambiguation').not.toMatch(/\bnewsletter\b/i);
    }
  });
});

describe('LeadCaptureForm — flags and routing', () => {
  it('NEWSLETTER_MARKETING_ENABLED and SMS_MARKETING_ENABLED stay false', () => {
    expect(NEWSLETTER_MARKETING_ENABLED).toBe(false);
    expect(SMS_MARKETING_ENABLED).toBe(false);
  });

  it('/waitlist is registered above the catch-all (not mid-table)', () => {
    const children = routes[0].children ?? [];
    const paths = children.map((r) => r.path);
    const waitlistIdx = paths.indexOf('/waitlist');
    const catchAllIdx = paths.indexOf('*');
    expect(waitlistIdx).toBeGreaterThan(-1);
    expect(catchAllIdx).toBeGreaterThan(-1);
    expect(waitlistIdx).toBeLessThan(catchAllIdx);
    // Appended near the end — after SOLUTIONS / SCHEDULER block, not beside /contact.
    expect(waitlistIdx).toBeGreaterThan(paths.indexOf('/contact'));
  });

  it('source files never enable newsletter marketing for this capture', () => {
    const formSrc = readSrc('components/LeadCaptureForm.tsx');
    expect(formSrc).not.toMatch(/NEWSLETTER_MARKETING_ENABLED\s*=\s*true/);
    expect(formSrc).toContain('product_updates');
    expect(formSrc).toContain(WAITLIST_ENDPOINT);
    expect(formSrc).not.toMatch(/Mailchimp/i);
    expect(formSrc).not.toMatch(/church_newsletter/);
  });
});
