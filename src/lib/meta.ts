import { useEffect } from 'react';

/* Per-route <head> for this client-rendered SPA. index.html ships the homepage
   title/OG/canonical; each route calls useMeta() to swap them so a shared link
   to e.g. /features shows the right title + preview instead of the homepage's. */

export interface MetaOptions {
  title: string;
  description: string;
  /** Absolute URL — used for canonical and og:url. */
  url: string;
  image?: string;
}

const IMAGE_DEFAULT = 'https://theharvest.site/logos/harvest-field.jpg';

// Find an existing tag by selector, or create it and append to <head>.
function tag(selector: string, create: () => HTMLElement): HTMLElement {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  const el = tag(`meta[${attr}="${key}"]`, () => {
    const m = document.createElement('meta');
    m.setAttribute(attr, key);
    return m;
  });
  el.setAttribute('content', content);
}

export function useMeta({ title, description, url, image = IMAGE_DEFAULT }: MetaOptions) {
  useEffect(() => {
    document.title = title;
    setMeta('name', 'description', description);

    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', image);

    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image);

    const canonical = tag('link[rel="canonical"]', () => {
      const l = document.createElement('link');
      l.setAttribute('rel', 'canonical');
      return l;
    });
    canonical.setAttribute('href', url);
  }, [title, description, url, image]);
}
