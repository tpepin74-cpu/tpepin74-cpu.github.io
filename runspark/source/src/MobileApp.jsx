import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';

export const MOBILE_QUERY = '(max-width: 767px), (max-width: 1023px) and (max-height: 500px) and (pointer: coarse)';
const SCREENS = ['experience', 'config', 'galerie', 'montage', 'faq', 'partenaires', 'avis', 'cadeau', 'courses'];
export function screenForHash(hash) {
  const id = hash.replace(/^#/, '');
  return id === 'elements' ? 'montage' : SCREENS.includes(id) ? id : 'experience';
}

export function useMobileApp() {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches);
  const [screen, setScreen] = useState(() => typeof window === 'undefined' ? 'experience' : screenForHash(window.location.hash));
  const focusNext = useRef(false);
  const previousMobile = useRef(isMobile);
  const positioned = useRef(false);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const resize = () => setIsMobile(media.matches);
    const followHistory = () => { focusNext.current = true; setScreen(screenForHash(window.location.hash)); };
    media.addEventListener('change', resize);
    window.addEventListener('popstate', followHistory);
    window.addEventListener('hashchange', followHistory);
    return () => {
      media.removeEventListener('change', resize);
      window.removeEventListener('popstate', followHistory);
      window.removeEventListener('hashchange', followHistory);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('runspark-mobile', isMobile);
    const frame = requestAnimationFrame(() => {
      if (isMobile) {
        window.scrollTo({ top: 0, behavior: 'instant' });
        if (focusNext.current) {
          const heading = document.querySelector('#' + screen + ' h1, #' + screen + ' h2');
          heading?.setAttribute('tabindex', '-1');
          heading?.focus({ preventScroll: true });
        }
      } else if ((!positioned.current || previousMobile.current) && window.location.hash) {
        document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
      previousMobile.current = isMobile;
      positioned.current = true;
      focusNext.current = false;
    });
    return () => cancelAnimationFrame(frame);
  }, [isMobile, screen]);

  const navigate = useCallback((next) => {
    const resolved = screenForHash('#' + next);
    if (window.location.hash !== '#' + resolved) window.history.pushState(null, '', '#' + resolved);
    focusNext.current = true;
    setScreen(resolved);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const captureNavigation = (event) => {
    if (!isMobile || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target.closest?.('a[href^="#"]');
    if (!anchor || anchor.target || anchor.hasAttribute('download')) return;
    const id = anchor.getAttribute('href').slice(1);
    if (!SCREENS.includes(id) && id !== 'elements') return;
    event.preventDefault();
    navigate(id);
  };

  return { isMobile, screen, navigate, captureNavigation };
}

export function MobileDock({ screen }) {
  return <nav className="mobile-dock" aria-label="Navigation principale mobile">
    {[['config', 'Créer', 'frame'], ['galerie', 'Inspirations', 'image'], ['faq', 'Aide', 'help']].map(([id, label, icon]) => <a key={id} href={'#' + id} aria-current={screen === id ? 'page' : undefined}><span className="mobile-dock-icon"><Icon name={icon} size={22} /></span><span>{label}</span></a>)}
  </nav>;
}

export function MobileDiscoverCards() {
  return <div className="mobile-discover-cards">
    <div className="mobile-quick-links"><a href="#montage"><Icon name="box" size={23} /><span><strong>Prêt en 2 minutes</strong><small>Voir le montage</small></span><Icon name="right" size={17} /></a><a href="#faq"><Icon name="help" size={23} /><span><strong>Une question ?</strong><small>On vous répond</small></span><Icon name="right" size={17} /></a></div>
  </div>;
}
