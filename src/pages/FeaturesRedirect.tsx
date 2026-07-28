import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { container } from '../components/shared';
import { CATEGORIES, LEGACY_ANCHORS, categoryHref } from '../content/features';

/* /features used to be a single page listing every tool. It is now five category
   pages, so this route only forwards: an old deep link like /features#groups
   lands on the section that feature moved to, and a bare /features goes to the
   first category. Kept as a route (rather than a host redirect) because the
   fragment never reaches the server — the mapping has to happen in the browser.

   The rendered body is the no-JS fallback: a plain list of the five pages. */

export function FeaturesRedirect() {
  const { hash } = useLocation();
  const key = hash ? decodeURIComponent(hash.slice(1)) : '';
  const target = LEGACY_ANCHORS[key] || categoryHref(CATEGORIES[0].slug);

  return (
    <main>
      <Head>
        <title>Features — Harvest</title>
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={`https://theharvest.site${categoryHref(CATEGORIES[0].slug)}`} />
      </Head>
      <Navigate to={target} replace />
      <section style={{ background: 'var(--cream)', padding: '160px 0 100px' }}>
        <div style={{ ...container, maxWidth: 720, textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: 'var(--navy-900)', margin: 0 }}>Features</h1>
          <p style={{ color: 'var(--text-body)', margin: '14px 0 26px' }}>Every tool now lives on its own page.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                to={categoryHref(c.slug)}
                style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy-900)', background: '#fff', border: '1px solid rgba(45,37,25,0.1)', borderRadius: 999, padding: '10px 18px', textDecoration: 'none' }}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
