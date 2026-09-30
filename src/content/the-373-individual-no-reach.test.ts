/**
 * THE-373 — Individual has no Reach section.
 *
 * The app hides that nav group on the Individual plan: Check-In comes off it,
 * and Forms is not added. This site already said that. These assertions are
 * what keep the two from drifting back apart.
 *
 * Columns on a comparison row are Forever Free, Individual, Small Team, Ministry.
 * Feature-page `tiers` are the three priced plans only: Individual, Small Team, Ministry.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { plans } from '../components/Pricing';
import { CATEGORIES } from './features';

const here = dirname(fileURLToPath(import.meta.url));

function pricingCode(): string {
  const src = readFileSync(join(here, '../components/Pricing.tsx'), 'utf8');
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

describe('THE-373 — the site does not sell Reach to Individual', () => {
  it('the Individual card names neither Check-In nor Forms', () => {
    const card = plans.find((p) => p.planId === 'plus');
    expect(card, 'Individual plan card is missing').toBeDefined();
    const text = card!.features.join('\n');
    expect(text).not.toMatch(/check-?in/i);
    expect(text).not.toMatch(/\bforms?\b/i);
  });

  it('Check-In starts at Small Team, and Forms stays Ministry-only', () => {
    const code = pricingCode();
    // Second cell is Individual. Both features are off there.
    expect(code).toMatch(/\['Check-In System \(QR\)', \[false, false, T, T\]\]/);
    expect(code).toMatch(/\['Custom Forms → CRM', \[false, false, false, T\]\]/);

    const small = plans.find((p) => p.planId === 'pro')!;
    const ministry = plans.find((p) => p.planId === 'max')!;
    expect(small.features).toContain('Check-In System (QR)');
    expect(small.features.join('\n')).not.toMatch(/\bforms?\b/i);
    expect(ministry.features).toContain('Custom Forms → CRM');
  });

  it('the feature pages agree with the cards', () => {
    const features = CATEGORIES.flatMap((c) => c.features);
    const checkin = features.find((f) => f.id === 'checkin');
    const forms = features.find((f) => f.id === 'forms');
    expect(checkin, 'Check-In feature page is missing').toBeDefined();
    expect(forms, 'Forms feature page is missing').toBeDefined();
    expect(checkin!.tiers).toEqual([0, 1, 1]);
    expect(forms!.tiers).toEqual([0, 0, 1]);
  });
});
