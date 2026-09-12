/* The Resources menu — the nav dropdown, the footer column, and nothing else.
 *
 * 🔴 ONE SOURCE FOR THE DOCS ADDRESS, because it is about to appear in three
 * places: the desktop dropdown, the mobile accordion and the footer. A URL
 * typed three times is a URL that gets corrected twice — the shape of every
 * false-claim incident this site has already had to fix.
 *
 * 🔴 `external` IS DERIVED, NEVER DECLARED. It is read off the `http` prefix,
 * the same test `Footer.tsx`'s `col()` helper has always applied. A boolean
 * written by hand beside the href is a second statement of the same fact, and
 * the two can disagree — an internal route flagged external would render as a
 * plain <a> and drop out of the router; an external one flagged internal would
 * hand react-router an absolute URL it cannot resolve. Derivation cannot
 * disagree with itself.
 *
 * ⚠️ THE BLOG IS INTERNAL AND MUST STAY INTERNAL. It is a route on this site,
 * not a page on the docs domain, so it renders as a <Link> and keeps working
 * client-side. The two docs entries leave the marketing site for a different
 * origin, so they open in a new tab and carry rel="noopener".
 */

/** The live documentation site. 24 pages across six sections. */
export const DOCS_URL = 'https://docs.theharvest.site';

/** Its changelog, a page on the same site. */
export const CHANGELOG_URL = `${DOCS_URL}/changelog`;

export interface ResourceLink {
  label: string;
  href: string;
  /** The one line under the label in the dropdown, matching the Solutions menu. */
  description: string;
}

/** Whether a destination leaves this site — the same `http` test `col()` uses. */
export const isExternalHref = (href: string): boolean => href.startsWith('http');

export const RESOURCES: readonly ResourceLink[] = [
  {
    label: 'Documentation',
    href: DOCS_URL,
    description: 'How every feature works, written per admin task.',
  },
  {
    label: 'Changelog',
    href: CHANGELOG_URL,
    description: 'What shipped, and when.',
  },
  {
    label: 'Blog',
    href: '/blog',
    description: 'Writing on ministry, software and the work behind both.',
  },
];
