import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/* Single scroll mechanism for the whole app, driven by the router location:
   - #hash present            → scroll that section into view (mega-menu deep links,
                                 cross-route section links like /#pricing)
   - /pricing (affiliate path) → scroll to the pricing section (preserved behavior)
   - otherwise                → scroll to top on route change

   The retry loop covers the case where the target route's DOM has not finished
   laying out on the frame the location changes (e.g. hard load of /features#groups). */
export function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const targetId = hash ? decodeURIComponent(hash.slice(1)) : pathname === '/pricing' ? 'pricing' : null;

    if (!targetId) {
      window.scrollTo(0, 0);
      return;
    }

    let tries = 0;
    let raf = 0;
    const tryScroll = () => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (tries++ < 15) {
        raf = requestAnimationFrame(tryScroll);
      }
    };
    raf = requestAnimationFrame(tryScroll);
    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);

  return null;
}
