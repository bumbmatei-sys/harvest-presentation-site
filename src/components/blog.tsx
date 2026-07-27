import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES, categoryName } from '../content/categories';
import { formatDate, type ImageMeta, type Post } from '../content/post-core';

/* Shared blog furniture. Same convention as the rest of the site: inline
   CSSProperties over the design tokens in index.css. The only CSS rules the blog
   adds are the ones it cannot express inline — styling the HTML that `marked`
   generates for a post body, and two responsive tweaks (see .blog-* in
   index.css). */

/** Blog pages are plain reading surfaces on cream, clear of the fixed nav. */
export const blogPage: React.CSSProperties = {
  background: 'var(--cream)',
  paddingTop: 'clamp(112px, 13vw, 150px)',
  paddingBottom: 'var(--section-y)',
};

/** Reading measure — wide enough for an index row, capped for prose elsewhere. */
export const measure: React.CSSProperties = {
  width: '100%', maxWidth: 820, margin: '0 auto', padding: '0 22px', boxSizing: 'border-box',
};

export const pageTitle: React.CSSProperties = {
  fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
  lineHeight: 1.08, letterSpacing: '-0.03em', color: 'var(--navy-900)', margin: 0,
};

export const standfirst: React.CSSProperties = {
  fontSize: 'var(--text-lg)', lineHeight: 1.6, color: 'var(--text-body)', margin: '16px 0 0',
};

const tagStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
  textTransform: 'uppercase', color: 'var(--brand)',
};

const metaStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-muted)',
};

export function CategoryTag({ category }: { category: string }) {
  return <span style={tagStyle}>{categoryName(category)}</span>;
}

/** Date · reading time, the same line on the index and the post header. */
export function PostMeta({ post, style = {} }: { post: Post; style?: React.CSSProperties }) {
  return (
    <div style={{ ...metaStyle, ...style }}>
      <time dateTime={post.publishDate}>{formatDate(post.publishDate)}</time>
      <span aria-hidden="true"> · </span>
      {post.readingTime}
    </div>
  );
}

const pillStyle = (active: boolean): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', padding: '8px 17px',
  borderRadius: 'var(--radius-pill)', fontFamily: 'var(--font-sans)', fontSize: 13.5,
  fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap',
  transition: 'background 200ms var(--ease-out), border-color 200ms var(--ease-out), color 200ms var(--ease-out)',
  background: active ? 'var(--brand)' : 'rgba(255,255,255,0.92)',
  color: active ? '#fff' : 'var(--navy-800)',
  border: `1px solid ${active ? 'var(--brand)' : 'rgba(45,37,25,0.12)'}`,
});

/** Filter row. "All" is included so a category page has a way back to /blog. */
export function CategoryPills({ active }: { active?: string }) {
  const pills: [string, string][] = [
    ['All', '/blog'],
    ...CATEGORIES.map((c) => [c.name, `/blog/category/${c.key}`] as [string, string]),
  ];
  return (
    <nav aria-label="Filter posts by category" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 30 }}>
      {pills.map(([label, href]) => {
        const isActive = href === (active ? `/blog/category/${active}` : '/blog');
        return (
          <Link
            key={href}
            to={href}
            style={pillStyle(isActive)}
            aria-current={isActive ? 'page' : undefined}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'var(--brand)'; }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'rgba(45,37,25,0.12)'; }}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/* React 18 does not know the `fetchpriority` attribute, but it passes unknown
   lowercase attributes straight through to the DOM — which is what we want on
   the cover, the LCP element of a post page. */
const eagerCover = {
  loading: 'eager',
  decoding: 'async',
  fetchpriority: 'high',
} as unknown as React.ImgHTMLAttributes<HTMLImageElement>;

/**
 * Post cover at 16:9. A measured local image carries explicit width/height; a
 * remote one cannot be measured at build time, so an aspect-ratio box reserves
 * the space instead. Either way the page never reflows as it loads.
 */
export function Cover({ src, alt, size, style = {} }:
  { src: string; alt: string; size?: ImageMeta; style?: React.CSSProperties }) {
  const frame: React.CSSProperties = {
    display: 'block', width: '100%', aspectRatio: '16 / 9', overflow: 'hidden',
    borderRadius: 24, border: '1px solid rgba(45,37,25,0.09)', background: 'var(--stone-100)',
    ...style,
  };
  return (
    <div style={frame}>
      <img
        src={src}
        alt={alt}
        width={size?.width}
        height={size?.height}
        {...eagerCover}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  );
}

/** One entry on a listing. Hairline separated, no card — this is a reading
 *  surface, and a post without a cover has to look deliberate, not broken. */
export function PostRow({ post }: { post: Post }) {
  return (
    <article
      className="blog-row"
      style={{
        display: 'flex', gap: 24, alignItems: 'flex-start',
        padding: '30px 0', borderTop: '1px solid rgba(45,37,25,0.1)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <CategoryTag category={post.category} />
        <h2 style={{ margin: '10px 0 0', fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 'clamp(1.35rem, 2.6vw, 1.7rem)', lineHeight: 1.22, letterSpacing: '-0.015em' }}>
          <Link
            to={`/blog/${post.slug}`}
            style={{ color: 'var(--navy-900)', textDecoration: 'none', transition: 'color 200ms var(--ease-out)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--navy-900)')}
          >
            {post.title}
          </Link>
        </h2>
        <p style={{ margin: '10px 0 0', fontSize: 15.5, lineHeight: 1.6, color: 'var(--text-body)' }}>{post.description}</p>
        <PostMeta post={post} style={{ marginTop: 12 }} />
      </div>

      {/* Thumbnail width lives in .blog-thumb (index.css) so it can shrink on phones. */}
      {post.cover && (
        <Link to={`/blog/${post.slug}`} className="blog-thumb" style={{ flexShrink: 0, display: 'block' }} tabIndex={-1} aria-hidden="true">
          <img
            src={post.cover}
            alt=""
            width={post.coverSize?.width}
            height={post.coverSize?.height}
            loading="lazy"
            decoding="async"
            style={{
              // `height: auto` is load-bearing: the width/height attributes are
              // presentational hints, so overriding only `width` would leave the
              // intrinsic pixel height in force and stretch the thumbnail.
              width: '100%', height: 'auto', aspectRatio: '16 / 9', objectFit: 'cover', display: 'block',
              borderRadius: 14, border: '1px solid rgba(45,37,25,0.09)', background: 'var(--stone-100)',
            }}
          />
        </Link>
      )}
    </article>
  );
}

export function PostList({ posts, empty }: { posts: readonly Post[]; empty: string }) {
  if (!posts.length) {
    return (
      <p style={{ margin: '44px 0 0', paddingTop: 30, borderTop: '1px solid rgba(45,37,25,0.1)', fontSize: 15.5, color: 'var(--text-muted)' }}>
        {empty}
      </p>
    );
  }
  return (
    <div style={{ marginTop: 44 }}>
      {posts.map((p) => <PostRow key={p.slug} post={p} />)}
    </div>
  );
}

/** Shared shell for /blog and /blog/category/:key. */
export function Listing({ title, description, activeCategory, posts, empty }: {
  title: string;
  description: string;
  activeCategory?: string;
  posts: readonly Post[];
  empty: string;
}) {
  return (
    <main style={blogPage}>
      <div style={measure}>
        <h1 style={pageTitle}>{title}</h1>
        <p style={{ ...standfirst, maxWidth: 620 }}>{description}</p>
        <CategoryPills active={activeCategory} />
        <PostList posts={posts} empty={empty} />
      </div>
    </main>
  );
}
