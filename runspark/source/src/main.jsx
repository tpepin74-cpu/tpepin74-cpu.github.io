import { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import FrameScene from './FrameScene.jsx';
import { PARTS } from './frame-model.js';
import RunSparkSections from './RunSparkSections.jsx';
import Icon from './Icon.jsx';
import { useMobileApp, MobileDock, MobileDiscoverCards } from './MobileApp.jsx';
import PhotoStories, { RaceBackdrop } from './PhotoStories.jsx';
import './styles.css';
import './mobile-app.css';
import './buying-guide.css';
import './theme-light.css';
import './photo-editorial.css';
import './personalization-flow.css';
import { trackCommerce } from './commerce.js';

const SHOP = 'https://runspark.digital-solutions.io';
const PHASES = [
  {
    lead: 'Cadres pour vos', main: 'médailles', accent: 'sportives.',
    text: 'Un cadre pour exposer votre médaille et votre dossard, avec une plaque gravée à votre nom.',
    mobile: 'Un cadre pour exposer votre médaille et votre dossard, avec une plaque gravée à votre nom.',
    action: 'Décomposer le cadre', next: 0.5,
  },
  {
    lead: 'Médaille et dossard,', main: 'dans un', accent: 'cadre.',
    text: 'Le cadre est livré avec sa plaque gravée. Vous ajoutez simplement votre médaille et votre dossard.',
    mobile: 'Le cadre est livré avec sa plaque gravée. Vous ajoutez simplement votre médaille et votre dossard.',
    action: 'Recomposer le cadre', next: 0.985,
  },
  {
    lead: 'Choisissez la couleur,', main: 'ajoutez', accent: 'votre texte.',
    text: 'Choisissez un cadre noir, blanc ou bois. Ajoutez votre nom, votre course ou votre chrono sur la plaque gravée.',
    mobile: 'Choisissez un cadre noir, blanc ou bois. Ajoutez votre nom, votre course ou votre chrono sur la plaque gravée.',
    action: 'Revoir l’animation', next: 0.02,
  },
];
const STOPS = [0.02, 0.5, 0.985];
const phaseAt = p => p < 0.25 ? 0 : p < 0.72 ? 1 : 2;

function Header({ onHome, menuRef }) {
  const closeMenu = () => menuRef.current?.close();
  return <>
    <header className="site-header">
      <a href="#experience" className="brand" onClick={event => { event.preventDefault(); onHome(); }} aria-label="Run Spark, revenir à l’accueil">
        <img className="runspark-logo" src="/assets/runspark/logo-medal-frame.webp" alt="Run Spark" width="824" height="275" />
      </a>
      <nav className="desktop-nav" aria-label="Navigation principale">
        <a href="#config">Nos cadres</a>
        <a href="#montage">Le montage</a>
        <a href="#galerie">Inspirations</a>
        <a href="#faq">Questions</a>
      </nav>
      <div className="header-actions">
        <a className="header-order" href="#config">Personnaliser mon cadre <Icon name="arrow" size={18} /></a>
        <a className="header-icon account-link" href={`${SHOP}/mon-compte/`} aria-label="Mon compte Run Spark"><Icon name="user" /></a>
        <a className="header-icon" href={`${SHOP}/panier/`} aria-label="Voir mon panier Run Spark"><Icon name="bag" /></a>
        <button className="header-icon menu-toggle" aria-label="Ouvrir le menu" aria-haspopup="dialog" aria-controls="main-menu" onClick={() => menuRef.current?.showModal()}><Icon name="menu" size={23} /></button>
      </div>
    </header>
    <dialog id="main-menu" className="menu-dialog" ref={menuRef} aria-labelledby="menu-title" onClick={event => { if (event.target === event.currentTarget) closeMenu(); }}>
      <div className="menu-inner">
        <div className="menu-heading"><img className="runspark-logo" src="/assets/runspark/logo-medal-frame.webp" width="824" height="275" alt="Run Spark" /><button aria-label="Fermer le menu" onClick={closeMenu}><Icon name="close" size={24} /></button></div>
        <p id="menu-title" className="menu-eyebrow">À chaque exploit, son cadre.</p>
        <nav aria-label="Navigation mobile">
          {[['#experience', 'L’expérience 360°'], ['#config', 'Créer mon cadre'], ['#montage', 'Le montage'], ['#galerie', 'Inspirations'], ['#partenaires', 'Partenaires'], ['#faq', 'Vos questions'], ['#avis', 'Le cadre réel'], ['#cadeau', 'Offrir un cadre'], ['#courses', 'Trouver ma course']].map(([href, title], i) => <a key={href} href={href} onClick={event => { closeMenu(); if (href === '#experience') { event.preventDefault(); onHome(); } }}><span>0{i + 1}</span>{title}<Icon name="arrow" /></a>)}
        </nav>
        <a className="button-primary" href="#config" onClick={closeMenu}>Personnaliser mon cadre <Icon name="arrow" /></a>
        <div className="menu-account"><a href={`${SHOP}/mon-compte/`}>Mon compte</a><a href={`${SHOP}/panier/`}>Mon panier</a></div>
        <div className="mobile-menu-legal"><a href={`${SHOP}/conditions-generales-de-vente/`}>Conditions de vente</a><a href={`${SHOP}/mentions-legales/`}>Mentions légales</a></div>
      </div>
    </dialog>
  </>;
}

export function App() {
  const mobile = useMobileApp();
  const menuRef = useRef(null);
  useEffect(() => {
    if (mobile.isMobile) menuRef.current?.close();
  }, [mobile.isMobile]);
  useEffect(() => {
    const config = document.getElementById('config');
    if (!config || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { trackCommerce('view_item'); observer.disconnect(); }
    }, { threshold: 0.1 });
    observer.observe(config);
    return () => observer.disconnect();
  }, []);
  const trackRef = useRef(null);
  const sceneRef = useRef(null);
  const controlsRef = useRef(null);
  const photoRef = useRef(null);
  const angleRef = useRef(null);
  const readyTimer = useRef(null);
  const reduced = !!useReducedMotion();
  const manualMode = reduced || mobile.isMobile;
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 170, damping: 32, mass: 0.45, restDelta: 0.0001 });
  const manualProgress = useMotionValue(0);
  const explosion = useTransform(smoothProgress, [0, 0.12, 0.42, 0.59, 0.92, 1], [0, 0, 1, 1, 0, 0]);
  const manualExplosion = useTransform(manualProgress, [0, 0.12, 0.42, 0.59, 0.92, 1], [0, 0, 1, 1, 0, 0]);
  const activeProgress = manualMode ? manualProgress : smoothProgress;
  const [phase, setPhase] = useState(0);
  const [ready, setReady] = useState(false);
  const [slowLoading, setSlowLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  useMotionValueEvent(activeProgress, 'change', p => setPhase(previous => phaseAt(p) === previous ? previous : phaseAt(p)));
  useEffect(() => { setPhase(phaseAt(activeProgress.get())); }, [activeProgress]);
  useEffect(() => {
    readyTimer.current = setTimeout(() => setSlowLoading(true), 9000);
    return () => clearTimeout(readyTimer.current);
  }, []);
  const handleReady = useCallback(() => { setReady(true); clearTimeout(readyTimer.current); }, []);
  const handleError = useCallback(() => { setError(true); clearTimeout(readyTimer.current); }, []);
  const handleRotate = useCallback(angle => {
    if (angleRef.current) angleRef.current.textContent = `${Math.round(((angle * 180 / Math.PI) % 360 + 360) % 360)}°`;
  }, []);

  function goTo(progress, moveFocus = false) {
    const track = trackRef.current;
    if (!track) return;
    if (manualMode) {
      manualProgress.set(progress);
      if (mobile.isMobile) mobile.navigate('experience');
      else track.scrollIntoView({ block: 'start', behavior: 'auto' });
    } else {
      const top = track.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + Math.max(0, track.offsetHeight - window.innerHeight) * progress, behavior: 'smooth' });
    }
    if (moveFocus) controlsRef.current?.focus({ preventScroll: true });
  }
  function selectPart(id) {
    setSelectedPart(previous => previous === id ? null : id);
    goTo(0.5, true);
  }
  function openPhoto() { if (!photoRef.current?.open) photoRef.current?.showModal(); }
  const selected = PARTS.find(part => part.id === selectedPart);

  return <div className={`app${reduced ? ' reduced-motion' : ''}`} data-mobile-screen={mobile.screen} data-mobile-enabled={mobile.isMobile ? 'true' : 'false'} onClickCapture={mobile.captureNavigation}>
    <a className="skip-link" href="#config">Passer l’animation et découvrir les cadres</a>
    <Header onHome={() => goTo(0)} menuRef={menuRef} />
    <main>
      <section id="experience" className="experience" ref={trackRef} aria-label="Run Spark, le cadre finisher en mouvement">
        <div className="sticky-stage">
          <RaceBackdrop />
          <div className="hero-watermark" aria-hidden="true">FINISHER</div>
          <div className="stage-layout">
            <div className="editorial-copy">
              <p className="stage-eyebrow"><span /> Marathon · Trail · Cyclisme · Natation</p>
              <div className="phase-copy">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={phase} initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : -10 }} transition={{ duration: reduced ? 0 : 0.25 }}>
                    <h1 aria-label={`${PHASES[phase].lead} ${PHASES[phase].main} ${PHASES[phase].accent}`}><span className="hero-lead">{PHASES[phase].lead}</span><span className="hero-main">{PHASES[phase].main}</span><span className="hero-highlight"><span>{PHASES[phase].accent}</span></span></h1>
                    <p className="stage-description desktop-description">{PHASES[phase].text}</p>
                    <p className="stage-description mobile-description">{PHASES[phase].mobile}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="hero-actions">
                <a className="button-primary" href="#config">Personnaliser mon cadre <Icon name="arrow" /></a>
                <button className="hero-explore" aria-label={PHASES[phase].action} onClick={() => goTo(PHASES[phase].next)}><span className="desktop-cta">{PHASES[phase].action}</span><span className="mobile-cta">{phase === 0 ? 'Décomposer' : phase === 1 ? 'Recomposer' : 'Revoir'}</span><Icon name={phase === 2 ? 'reset' : 'down'} size={18} /></button>
              </div>
              <p className="hero-mobile-price">CHF 89,90 · Gravure incluse · 3 finitions</p>
              <div className="hero-reassurance"><span><Icon name="check" size={15} /> Gravure incluse</span><span><Icon name="truck" size={17} /> Expédié en 48 h</span></div>
            </div>

            <div className="object-panel">
              <div className="object-heading"><span>Modèle présenté · New York 2025</span><div className="object-mode"><span className="interactive-label"><i /> Vue interactive</span><button className="object-photo" aria-label="Voir la photo d’origine du cadre" onClick={openPhoto}><Icon name="image" size={17} /></button></div></div>
              <div className="scene-area">
                <div className="scene-studio" aria-hidden="true" />
                <div className="scene-orbit" aria-hidden="true" />
                {!error && <FrameScene ref={sceneRef} explosion={manualMode ? manualExplosion : explosion} selectedPart={phase === 1 ? selectedPart : null} reducedMotion={reduced} onReady={handleReady} onError={handleError} onRotate={handleRotate} />}
                {!ready && !error && <div className="scene-loading" role="status"><span className="loading-frame" /><span>{slowLoading ? 'Votre cadre prend forme…' : 'Préparation du cadre…'}</span></div>}
                {error && <div className="scene-fallback"><img src="/assets/cadre-original.jpeg" alt="Cadre souvenir du marathon de New York : médaille, parcours, dossard et plaques" /><p>Découvrez le cadre sur sa photo d’origine.</p><button onClick={openPhoto}>Agrandir la photo <Icon name="image" size={18} /></button></div>}
                <AnimatePresence>
                  {selected && phase === 1 && <motion.div className="selected-part-note" initial={{ opacity: 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.2 }}>
                    <div><span>Dans votre cadre</span><strong>{selected.label}</strong></div><button aria-label="Retirer la sélection" onClick={() => setSelectedPart(null)}><Icon name="close" size={18} /></button>
                  </motion.div>}
                </AnimatePresence>
              </div>
              <div className="object-controls">
                <div className="drag-hint"><Icon name="rotate" size={18} /><span className="desktop-hint">Cliquez et glissez</span><span className="touch-hint">Glissez de côté</span><strong>360°</strong></div>
                <div className="scene-tools" ref={controlsRef} role="group" tabIndex={-1} aria-label="Commandes de rotation du cadre">
                  <button onClick={() => sceneRef.current?.rotateBy(-Math.PI / 4)} aria-label="Tourner le cadre de 45 degrés vers la gauche" disabled={!ready || error}><Icon name="left" size={18} /></button>
                  <span className="rotation-value" ref={angleRef} aria-hidden="true">0°</span>
                  <button onClick={() => sceneRef.current?.rotateBy(Math.PI / 4)} aria-label="Tourner le cadre de 45 degrés vers la droite" disabled={!ready || error}><Icon name="right" size={18} /></button>
                  <span className="tool-separator" />
                  <button onClick={() => sceneRef.current?.resetView()} aria-label="Recentrer le cadre de face" title="Recentrer le cadre" disabled={!ready || error}><Icon name="reset" size={18} /></button>
                </div>
              </div>
            </div>
          </div>
          <footer className="stage-bottom">
            <div className="scroll-cue"><Icon name="mouse" size={22} /><span>{reduced ? 'Choisissez votre étape' : 'Un scroll. Toute votre histoire.'}<small>{reduced ? 'Mode mouvements réduits' : 'Décomposez, explorez, rassemblez.'}</small></span></div>
            <nav className="phase-navigation" aria-label="Étapes de l’animation">
              {['Le cadre', 'Les détails', 'Assemblé'].map((label, i) => <button key={label} aria-current={phase === i ? 'step' : undefined} className={phase === i ? 'active' : ''} onClick={() => goTo(STOPS[i])}><span>0{i + 1}</span><strong>{label}</strong></button>)}
            </nav>
            <button className="reference-button" onClick={openPhoto} aria-label="Voir la photo originale utilisée pour l’animation"><Icon name="image" size={18} /><span>La photo d’origine</span></button>
            <div className="timeline-rail" aria-hidden="true"><motion.div style={{ scaleX: activeProgress }} /></div>
          </footer>
        </div>
      </section>

      <PhotoStories />
      <MobileDiscoverCards />
      <RunSparkSections isMobile={mobile.isMobile} onExplore={() => { setSelectedPart(null); goTo(0.5, true); }} onSelectPart={selectPart} />
    </main>

    <MobileDock screen={mobile.screen} />

    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand"><a href="#experience" onClick={event => { event.preventDefault(); goTo(0, true); }}><img className="runspark-logo" src="/assets/runspark/logo-medal-frame.webp" alt="Run Spark" width="824" height="275" /></a><p>Votre ligne d’arrivée mérite<br />une place dans votre quotidien.</p><div className="shipping-regions"><span>Suisse</span><span>Europe</span><span>UK</span><span>Monde</span></div></div>
        <div className="footer-column"><h2>Vos souvenirs</h2><a href="#config">Choisir mon cadre</a><a href="#montage">Le montage</a><a href="#galerie">La galerie</a><button onClick={() => goTo(0, true)}>Revivre l’animation <Icon name="rotate" size={16} /></button></div>
        <div className="footer-column"><h2>Besoin d’aide ?</h2><a href={`${SHOP}/livraison-retours/`}>Livraison & délais</a><a href={`${SHOP}/livraison-retours/#retours`}>Retours & garanties</a><a href="#faq">Questions fréquentes</a><a href={`${SHOP}/contact/`}>Nous contacter</a></div>
        <div className="footer-column"><h2>Run Spark</h2><a href={`${SHOP}/programme-partenaire/`}>Devenir partenaire</a><a href={`${SHOP}/programme-partenaire/`}>Espace partenaire</a><a href={`${SHOP}/mon-compte/`}>Mon compte</a><a href="#avis">Le cadre en photos</a><a href="#cadeau">Offrir un cadre</a><a href="/courses/">Toutes les courses</a></div>
      </div>
      <div className="footer-bottom"><span>© 2026 Run Spark</span><span>Cadres finisher personnalisés · Expédiés depuis la Suisse</span><div><a href={`${SHOP}/mentions-legales/`}>Mentions légales</a><a href={`${SHOP}/conditions-generales-de-vente/`}>CGV</a></div></div>
    </footer>

    <dialog ref={photoRef} className="reference-dialog" aria-labelledby="reference-title" onClick={event => { if (event.target === event.currentTarget) photoRef.current.close(); }}>
      <div className="reference-inner">
        <div className="dialog-header"><div><span>Le souvenir qui prend vie</span><h2 id="reference-title">La photo d’origine</h2></div><button aria-label="Fermer la photo" onClick={() => photoRef.current.close()}><Icon name="close" size={24} /></button></div>
        <img src="/assets/cadre-original.jpeg" width="1152" height="1536" alt="Photographie originale du cadre New York 2025, utilisée pour les faces avant de l’animation" />
        <p>Les faces avant reprennent les détails de cette photographie. Le dos et les épaisseurs sont reconstitués.</p>
      </div>
    </dialog>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
