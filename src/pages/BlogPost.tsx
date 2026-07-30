import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { HBtn } from '../components/magic';
import { CategoryTag, Cover, PostMeta, blogPage, measure, pageTitle, standfirst } from '../components/blog';
import { postBySlug, relatedPosts } from '../content/posts';
import { categoryName } from '../content/categories';
import { SITE_ORIGIN, absoluteImageUrl, formatDate, type Post } from '../content/post-core';

/* A post page is a reading surface: one column, capped measure, nothing
   competing with the text. The site's chrome (nav, footer, type, gold) is
   unchanged, so arriving here from search and clicking through to the homepage
   should not feel like a different product. */

const prose: React.CSSProperties = {
  maxWidth: '68ch', margin: '0 auto', fontSize: 17.5,
};

function NotFound() {
  return (
    <>
      <Seo
        title="Post not found — Harvest"
        description="That post does not exist or has moved. Browse everything on the Harvest resources index."
        canonical={`${SITE_ORIGIN}/blog`}
      />
      <main style={blogPage}>
        <div style={measure}>
          <h1 style={pageTitle}>Post not found</h1>
          <p style={standfirst}>That post does not exist, or it has not been published yet.</p>
          <div style={{ marginTop: 28 }}><HBtn to="/blog" variant="gold">Back to all resources</HBtn></div>
        </div>
      </main>
    </>
  );
}

function Related({ post }: { post: Post }) {
  const related = relatedPosts(post, 3);
  if (!related.length) return null;
  return (
    <section style={{ marginTop: 56 }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 22, color: 'var(--navy-900)', margin: 0 }}>
        More in {categoryName(post.category)}
      </h2>
      <div style={{ marginTop: 6 }}>
        {related.map((r) => (
          <Link
            key={r.slug}
            to={`/blog/${r.slug}`}
            style={{
              display: 'block', padding: '18px 0', borderTop: '1px solid rgba(45,37,25,0.1)',
              textDecoration: 'none', transition: 'color 200ms var(--ease-out)',
            }}
          >
            <span style={{ display: 'block', fontFamily: 'var(--font-serif)', fontSize: 17.5, fontWeight: 500, color: 'var(--navy-900)', lineHeight: 1.3 }}>{r.title}</span>
            <span style={{ display: 'block', marginTop: 6, fontSize: 13, color: 'var(--text-muted)' }}>
              {formatDate(r.publishDate)} · {r.readingTime}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <aside
      style={{
        marginTop: 56, padding: 'clamp(26px, 5vw, 38px)',
        background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(45,37,25,0.08)', borderRadius: 24,
        boxShadow: '0 12px 34px rgba(45,37,25,0.1)', textAlign: 'center',
      }}
    >
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.25rem, 3vw, 1.6rem)', fontWeight: 500, color: 'var(--navy-900)', margin: 0, lineHeight: 1.25 }}>
        Run your whole ministry in one place
      </p>
      <p style={{ fontSize: 15, color: 'var(--text-body)', margin: '12px auto 22px', maxWidth: 420, lineHeight: 1.6 }}>
        Every tool your church needs — branded, in one place, from $49/mo.
      </p>
      <HBtn to="/#pricing" variant="gold">Start free trial</HBtn>
    </aside>
  );
}

export function BlogPost() {
  const { slug } = useParams();
  const post = postBySlug(slug);
  if (!post) return <NotFound />;

  const canonical = `${SITE_ORIGIN}/blog/${post.slug}`;

  return (
    <>
      <Seo
        title={`${post.title} — Harvest`}
        description={post.description}
        canonical={canonical}
        // Relative og:image URLs silently produce no preview card on Twitter,
        // LinkedIn or WhatsApp, so local covers get the origin prefixed.
        image={absoluteImageUrl(post.cover)}
        ogType="article"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.description,
          datePublished: post.publishDate,
          dateModified: post.updated,
          image: absoluteImageUrl(post.cover),
          author: { '@type': 'Organization', name: 'Harvest', url: SITE_ORIGIN },
          publisher: {
            '@type': 'Organization',
            name: 'Harvest',
            logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/logo.png` },
          },
          mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
        }}
      />

      <main style={blogPage}>
        <div style={{ padding: '0 22px' }}>
          <article style={prose}>
            <header>
              <CategoryTag category={post.category} />
              <h1 style={{ ...pageTitle, margin: '12px 0 0' }}>{post.title}</h1>
              <p style={{ ...standfirst, fontSize: 'var(--text-lg)' }}>{post.description}</p>
              <PostMeta post={post} style={{ marginTop: 16 }} />
            </header>

            {post.cover && (
              <Cover src={post.cover} alt={post.coverAlt ?? ''} size={post.coverSize} style={{ margin: '36px 0 0' }} />
            )}

            <div className="blog-body" style={{ marginTop: 36 }} dangerouslySetInnerHTML={{ __html: post.html }} />

            <CtaBand />
            <Related post={post} />
          </article>
        </div>
      </main>
    </>
  );
}
