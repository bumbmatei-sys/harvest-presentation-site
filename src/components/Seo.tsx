import { Head } from 'vite-react-ssg';

/* Per-route <head>. index.html no longer carries any page-specific metadata, so
   every route owns its own title, description, canonical and social tags — both
   in the prerendered HTML and after client-side navigation. */

const IMAGE_DEFAULT = 'https://theharvest.site/logos/harvest-field.jpg';

export interface SeoProps {
  title: string;
  description: string;
  /** Absolute URL — used for both canonical and og:url. */
  canonical: string;
  /** Absolute URL. Falls back to the site-wide social image. */
  image?: string;
}

export function Seo({ title, description, canonical, image = IMAGE_DEFAULT }: SeoProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Head>
  );
}
