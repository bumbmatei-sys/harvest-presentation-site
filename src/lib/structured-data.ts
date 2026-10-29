import { DEFAULT_SOCIAL_IMAGE, SITE_ORIGIN } from '../content/post-core';

export type Schema = Record<string, unknown>;

export function pageSchema(title: string, description: string, canonical: string): Schema[] {
  return [
    { '@type': 'Organization', '@id': `${SITE_ORIGIN}/#organization`, name: 'The Harvest',
      url: SITE_ORIGIN, logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/logo.png` } },
    { '@type': 'WebSite', '@id': `${SITE_ORIGIN}/#website`, name: 'The Harvest', url: `${SITE_ORIGIN}/`,
      inLanguage: 'en', publisher: { '@id': `${SITE_ORIGIN}/#organization` } },
    { '@type': 'WebPage', '@id': canonical, url: canonical, name: title, description,
      inLanguage: 'en', isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
      publisher: { '@id': `${SITE_ORIGIN}/#organization` } },
  ];
}

/** Prices come from the same plan records as the visible pricing cards. */
export function softwareSchema(plans: readonly { name: string; price: { monthly: number; yearly: number } }[]): Schema {
  return {
    '@type': 'SoftwareApplication', '@id': `${SITE_ORIGIN}/#software`,
    name: 'The Harvest', url: `${SITE_ORIGIN}/#pricing`, image: DEFAULT_SOCIAL_IMAGE,
    applicationCategory: 'BusinessApplication', operatingSystem: 'Web',
    publisher: { '@id': `${SITE_ORIGIN}/#organization` },
    offers: plans.flatMap((plan) => (['monthly', 'yearly'] as const).map((term) => ({
      '@type': 'Offer', name: `${plan.name} — ${term}`, url: `${SITE_ORIGIN}/#pricing`,
      price: plan.price[term], priceCurrency: 'USD',
      priceSpecification: { '@type': 'UnitPriceSpecification', price: plan.price[term],
        priceCurrency: 'USD', billingDuration: term === 'monthly' ? 'P1M' : 'P1Y' },
    }))),
  };
}

/** A literal '<' in a script payload can otherwise terminate the script tag. */
export function serializeSchema(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}
