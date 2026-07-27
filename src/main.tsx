import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from './App';
import './index.css';
import { captureRefFromUrl } from './lib/ref';

// Runs before hydration in the browser, exactly as before. `captureRefFromUrl`
// already early-returns when `window` is undefined, so it is a no-op during the
// prerender pass and the browser behaviour is unchanged.
captureRefFromUrl();

export const createRoot = ViteReactSSG({ routes });
