import { Head } from 'vite-react-ssg';
import { serializeSchema, type Schema } from '../lib/structured-data';

export function JsonLd({ nodes }: { nodes: Schema[] }) {
  return <Head><script type="application/ld+json">{serializeSchema({ '@context': 'https://schema.org', '@graph': nodes })}</script></Head>;
}
