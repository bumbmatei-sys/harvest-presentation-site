import { useParams } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { Listing } from '../components/blog';
import { postsByCategory } from '../content/posts';
import { categoryByKey } from '../content/categories';
import { SITE_ORIGIN } from '../content/post-core';

export function BlogCategory() {
  const { key = '' } = useParams();
  const category = categoryByKey(key);

  // Only the three known categories are prerendered, so this is reachable only
  // by typing a bad URL. Say so plainly rather than rendering an empty shell.
  if (!category) {
    return (
      <>
        <Seo
          title="Category not found — Harvest"
          description="That category does not exist. Browse everything on the Harvest resources index."
          canonical={`${SITE_ORIGIN}/blog`}
        />
        <Listing
          title="Category not found"
          description="That category does not exist — here is everything else."
          posts={[]}
          empty="Pick one of the categories above to keep reading."
        />
      </>
    );
  }

  return (
    <>
      <Seo
        title={`${category.name} — Harvest`}
        description={category.purpose}
        canonical={`${SITE_ORIGIN}/blog/category/${category.key}`}
      />
      <Listing
        title={category.name}
        description={category.purpose}
        activeCategory={category.key}
        posts={postsByCategory(category.key)}
        empty="No posts in this category yet."
      />
    </>
  );
}
