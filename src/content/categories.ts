/* The blog's three fixed categories. Defined once and imported everywhere —
   frontmatter validation, the index filter pills, the category routes, the
   sitemap and the post header all read from this list, so adding or renaming a
   category is a one-line change here. */

export type CategoryKey = 'inside-harvest' | 'harvest-vs' | 'rooted';

export interface Category {
  key: CategoryKey;
  /** Display name, as it appears in filter pills and category tags. */
  name: string;
  /** One line of standfirst copy for the category page. */
  purpose: string;
}

export const CATEGORIES: readonly Category[] = [
  { key: 'inside-harvest', name: 'Inside Harvest', purpose: 'Feature spotlights, how-tos and release notes.' },
  { key: 'harvest-vs', name: 'Harvest vs.', purpose: 'Honest comparisons with the other platforms churches consider.' },
  { key: 'rooted', name: 'Rooted', purpose: 'Ministry, discipleship and stewardship.' },
];

export const CATEGORY_KEYS: readonly CategoryKey[] = CATEGORIES.map((c) => c.key);

export function isCategoryKey(value: string): value is CategoryKey {
  return (CATEGORY_KEYS as readonly string[]).includes(value);
}

export function categoryByKey(key: string): Category | undefined {
  return CATEGORIES.find((c) => c.key === key);
}

/** Display name for a category key, falling back to the raw key. */
export function categoryName(key: string): string {
  return categoryByKey(key)?.name ?? key;
}
