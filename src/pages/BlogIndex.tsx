import { Seo } from '../components/Seo';
import { Listing } from '../components/blog';
import { POSTS } from '../content/posts';
import { SITE_ORIGIN } from '../content/post-core';

const TITLE = 'Resources — Harvest';
const DESCRIPTION =
  'Writing from the Harvest team — product deep-dives, honest platform comparisons, and notes on ministry, discipleship and stewardship.';

export function BlogIndex() {
  return (
    <>
      <Seo title={TITLE} description={DESCRIPTION} canonical={`${SITE_ORIGIN}/blog`} />
      <Listing
        title="Resources"
        description={DESCRIPTION}
        posts={POSTS}
        empty="Nothing published yet. The first posts are on their way."
      />
    </>
  );
}
