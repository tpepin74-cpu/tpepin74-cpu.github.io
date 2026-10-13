import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import './runspark-sections.css';
import ProductConfigurator from './ProductConfigurator.jsx';
import { GALLERY, GALLERY_FILTERS } from './gallery-data.js';
import { AuthenticProduct, GiftSection } from './BuyingGuide.jsx';
import CourseCollection from './CourseCollection.jsx';
import { chooseInspiration } from './commerce.js';

const SHOP = 'https://runspark.digital-solutions.io';

const STEPS = [
  { number: '01', title: 'Glissez le dossard.', text: 'Son emplacement dans le passe-partout est prêt à le recevoir.', part: 'bib', icon: 'box', action: 'Voir le dossard en 3D' },
  { number: '02', title: 'Posez la médaille.', text: 'Le support intégré accueille votre médaille et laisse son ruban visible.', part: 'medal', icon: 'medal', action: 'Voir la médaille en 3D' },
  { number: '03', title: 'Admirez votre exploit.', text: 'La plaque personnalisée arrive déjà gravée et fixée. Votre cadre est prêt.', part: 'event', icon: 'check', action: 'Voir la plaque en 3D' },
];

const FAQ = [
  { question: 'Que reçoit-on exactement ?', answer: 'Vous commandez un cadre avec son passe-partout, son support de médaille et une plaque gravée déjà fixée. Vous ajoutez votre médaille et votre dossard. Les photos, cartes de parcours et autres souvenirs visibles dans les exemples ne sont pas fournis par ce configurateur.' },
  { question: 'Comment vérifier les dimensions avant de commander ?', answer: 'La taille des médailles varie selon les courses et les années. Demandez au service client les dimensions exactes du cadre et des ouvertures. Indiquez la largeur, la hauteur et l’épaisseur de votre médaille, ainsi que le format de votre dossard, pour faire confirmer leur compatibilité.' },
  { question: 'Quelle finition choisir pour mon cadre ?', answer: 'Les trois finitions accueillent le même duo médaille et dossard. Le Noir Premium crée un contraste marqué, le Bois Classique apporte de la chaleur et le Blanc Épuré convient aux intérieurs lumineux. Vous pouvez ensuite choisir une plaque dorée ou argent.' },
  { question: 'Convient-il à d’autres sports que le marathon ?', answer: 'Oui. Le cadre peut réunir les souvenirs d’une course à pied, d’un trail, d’un triathlon, d’une épreuve cycliste ou de natation. Le passe-partout reçoit le dossard et le support maintient la médaille avec son ruban visible.' },
  { question: 'Que puis-je faire graver sur la plaque ?', answer: 'Le configurateur propose une plaque dorée ou argent et deux polices, Classique ou Moderne. La première ligne accepte 22 caractères ; la seconde, facultative, en accepte 26. Vous pouvez par exemple indiquer la course, la distance et la date.' },
  { question: 'Faut-il des outils pour le montage ?', answer: 'Aucun outil ni colle n’est nécessaire. La plaque arrive déjà fixée. Il suffit de glisser le dossard puis de poser la médaille sur son support. Le montage annoncé prend environ deux minutes.' },
  { question: 'Quand vais-je recevoir mon cadre ?', answer: 'La préparation et la gravure demandent 1 à 2 jours ouvrés. Le transport suivi annoncé est de 2 à 4 jours ouvrés pour les destinations couvertes par ce délai. L’international peut demander davantage de temps. Votre destination et les conditions de la boutique déterminent l’estimation finale.', delivery: true },
  { question: 'Où les cadres sont-ils livrés ?', answer: 'Les cadres sont expédiés depuis la Suisse vers la Suisse, l’Europe, le Royaume-Uni et le reste du monde. La livraison est offerte dès 60 CHF ou 60 € d’achat, selon la zone et les conditions indiquées au moment de la commande.', delivery: true },
  { question: 'Puis-je offrir un cadre personnalisé ?', answer: 'Oui. Un premier semi-marathon, un marathon ou l’arrivée d’un ultra peuvent devenir un cadeau à conserver. Choisissez la finition et personnalisez la gravure avec les informations de la course ou du coureur.' },
  { question: 'Comment les souvenirs sont-ils protégés ?', answer: 'Le cadre présenté par Run Spark associe un verre anti-reflet, un passe-partout épais et une attache murale intégrée. Le dossard et la médaille restent réunis dans un cadre conçu pour être exposé.' },
];

function ArrowLink({ href, children, className = '' }) {
  return <a className={`rs-button ${className}`} href={href}><span>{children}</span><Icon name="arrow" /></a>;
}

export default function RunSparkSections({ onExplore, onSelectPart, isMobile = false }) {
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [galleryFilter, setGalleryFilter] = useState('all');
  const [galleryOpen, setGalleryOpen] = useState(false);
  const dialogRef = useRef(null);
  const openerRef = useRef(null);
  const videoRef = useRef(null);
  const lightboxItem = GALLERY[lightboxIndex];
  const visibleGallery = GALLERY.map((item, index) => ({ ...item, index }))
    .filter((item) => galleryFilter === 'all' || item.region === galleryFilter);
  const visibleLightboxIndex = visibleGallery.findIndex((item) => item.index === lightboxIndex);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    const pauseOnHidden = () => { if (document.hidden) video.pause(); };
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) video.pause();
    }, { threshold: 0.05 });
    observer?.observe(video);
    document.addEventListener('visibilitychange', pauseOnHidden);
    return () => {
      observer?.disconnect();
      document.removeEventListener('visibilitychange', pauseOnHidden);
      video.pause();
    };
  }, []);

  function explorePart(id) {
    if (onSelectPart) onSelectPart(id);
    else onExplore?.();
  }

  function openGallery(index, event) {
    openerRef.current = event.currentTarget;
    setLightboxIndex(index);
    setGalleryOpen(true);
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }

  function moveGallery(direction) {
    setLightboxIndex((current) => {
      const position = visibleGallery.findIndex((item) => item.index === current);
      return visibleGallery[(position + direction + visibleGallery.length) % visibleGallery.length].index;
    });
  }

  return (
    <div className="rs-sections">
      <div className="rs-proof-band" aria-label="Les engagements Run Spark">
        <div className="rs-proof-inner">
          <div><Icon name="medal" /><span><strong>Votre gravure incluse</strong><small>Un souvenir vraiment personnel</small></span></div>
          <div><Icon name="truck" /><span><strong>Expédié depuis la Suisse</strong><small>Préparé en 1 à 2 jours ouvrés</small></span></div>
          <div><Icon name="shield" /><span><strong>Paiement sécurisé</strong><small>Sur la boutique Run Spark</small></span></div>
        </div>
      </div>

      <ProductConfigurator isMobile={isMobile} />

      <section className="rs-montage rs-block rs-dark" id="montage" aria-labelledby="rs-montage-title">
        <div className="rs-container">
          <div className="rs-section-heading">
            <div><p className="rs-eyebrow">LE MONTAGE</p><h2 className="rs-title" id="rs-montage-title">DEUX MINUTES.<br /><span>DES ANNÉES DE FIERTÉ.</span></h2></div>
            <p className="rs-heading-copy">La plaque gravée arrive déjà fixée.<br />Vous ajoutez vos souvenirs, sans outil et sans colle.</p>
          </div>
          <div className="rs-montage-layout" id="elements">
            <div className="rs-video-column">
              <div className="rs-video-shell"><video ref={videoRef} controls playsInline preload="metadata" poster="/assets/runspark/montage-poster.jpg" aria-label="Tutoriel de montage du cadre finisher Run Spark"><source src="/assets/runspark/montage.mp4" type="video/mp4" />Votre navigateur ne lit pas cette vidéo. <a href="/assets/runspark/montage.mp4">Ouvrir le tutoriel.</a></video></div>
              <div className="rs-video-caption"><span><Icon name="play" /> LE GESTE, EN VIDÉO.</span><span>Tutoriel Run Spark</span></div>
              {onExplore && <button className="rs-text-button" type="button" onClick={onExplore}><Icon name="rotate" /><span>Explorer toutes les pièces du cadre en 3D</span><Icon name="arrow" /></button>}
            </div>
            <ol className="rs-steps">
              {STEPS.map((step) => <li key={step.number}><span className="rs-step-number rs-mono">{step.number}</span><div><h3>{step.title}</h3><p>{step.text}</p>{(onExplore || onSelectPart) && <button className="rs-step-action" type="button" onClick={() => explorePart(step.part)}>{step.action}<Icon name="arrow" /></button>}</div></li>)}
            </ol>
          </div>
        </div>
      </section>

      <section className="rs-gallery rs-block rs-dark" id="galerie" aria-labelledby="rs-gallery-title">
        <div className="rs-container">
          <div className="rs-section-heading"><div><p className="rs-eyebrow">LES KILOMÈTRES PASSENT. LES SOUVENIRS RESTENT.</p><h2 className="rs-title" id="rs-gallery-title">CHAQUE ARRIVÉE<br /><span>A SON HISTOIRE.</span></h2></div><p className="rs-heading-copy">Dix grands marathons, dix façons<br />de garder l’émotion.<br />Imaginez le cadre de votre arrivée.</p></div>
          <div className="rs-gallery-toolbar">
            <div className="rs-gallery-filters" role="group" aria-label="Filtrer les inspirations par région">
              {GALLERY_FILTERS.map((filter) => <button key={filter.id} type="button" aria-pressed={galleryFilter === filter.id} aria-controls="rs-gallery-grid" onClick={() => setGalleryFilter(filter.id)}>{filter.label}<span>{filter.id === 'all' ? GALLERY.length : GALLERY.filter((item) => item.region === filter.id).length}</span></button>)}
            </div>
            <span className="rs-gallery-count rs-mono" role="status">{String(visibleGallery.length).padStart(2, '0')} inspirations</span>
          </div>
          <div className="rs-gallery-grid" id="rs-gallery-grid">
            {visibleGallery.map((item) => <article className="rs-gallery-card" key={item.image}><button type="button" className="buy-gallery-zoom" onClick={(event) => openGallery(item.index, event)} aria-label={`Agrandir : ${item.title} ${item.detail}`}><span className="rs-gallery-image"><img src={item.thumbnail} srcSet={`${item.thumbnail} 640w, ${item.image} 1536w`} sizes="(max-width: 680px) calc(100vw - 40px), (max-width: 1180px) calc((100vw - 90px) / 2), (max-width: 1432px) calc((100vw - 138px) / 2), 647px" width="1536" height="1024" alt={item.alt} loading="lazy" decoding="async" /><span className="rs-gallery-category">{item.category}</span><span className="rs-gallery-zoom" aria-hidden="true"><Icon name="plus" /></span></span><span className="rs-gallery-caption"><strong>{item.title}</strong><span>{item.detail}</span></span></button><a className="buy-gallery-cta" href="#config" onClick={() => chooseInspiration(item.finish.startsWith('Blanc') ? 'blanc' : item.finish.startsWith('Bois') ? 'bois' : 'noir', item.id)}>Créer mon cadre dans ce style <Icon name="arrow" size={18} /></a><a className="buy-gallery-guide" href={`/courses/${item.id}/`}>Conseils pour {item.city}</a></article>)}
          </div>
          <p className="rs-gallery-note">Galerie d’inspiration · Mises en situation générées par IA à partir de références des courses. Athlètes et personnalisations fictifs.</p>
        </div>
      </section>

      <AuthenticProduct />
      <GiftSection />
      <CourseCollection />

      <section className="rs-partners rs-block rs-dark" id="partenaires" aria-labelledby="rs-partners-title">
        <div className="rs-container rs-partner-layout">
          <div className="rs-partner-content"><p className="rs-eyebrow">PROGRAMME PARTENAIRE</p><h2 className="rs-title" id="rs-partners-title">VOUS RASSEMBLEZ.<br /><span>ON ENCADRE.</span></h2><p className="rs-lead">Organisateurs de courses, clubs ou créateurs : prolongez l’émotion de votre communauté avec un code à votre nom.</p><ArrowLink href={`${SHOP}/programme-partenaire/`} className="rs-button-cyan">Découvrir le programme</ArrowLink><a className="rs-partner-login" href={`${SHOP}/programme-partenaire/`}>Déjà partenaire ? Accéder à mon espace<Icon name="arrow" /></a></div>
          <div className="rs-partner-benefits"><div className="rs-partner-stat"><span className="rs-mono">10<span>%</span></span><div><strong>POUR VOS COUREURS.</strong><p>Une réduction sur leur commande grâce à votre code.</p></div></div><div className="rs-partner-stat"><span className="rs-mono">10<span>%</span></span><div><strong>POUR VOUS.</strong><p>Une commission sur chaque vente liée à votre code.</p></div></div><p className="rs-partner-process"><span>Votre code.</span><Icon name="arrow" /><span>Vos partages.</span><Icon name="arrow" /><span>Vos commissions.</span></p></div>
        </div>
      </section>

      <section className="rs-faq rs-block rs-light" id="faq" aria-labelledby="rs-faq-title">
        <div className="rs-container rs-faq-layout">
          <div className="rs-faq-intro"><p className="rs-eyebrow">AVANT LE PROCHAIN DÉPART</p><h2 className="rs-title" id="rs-faq-title">ON RÉPOND<br />À VOS<br />QUESTIONS.</h2><p>Un détail à vérifier avant de choisir votre cadre ?</p><a className="rs-inline-link" href={`${SHOP}/contact/`}>Contacter Run Spark<Icon name="arrow" /></a></div>
          <div className="rs-questions">{FAQ.map((item, index) => <details key={item.question} className="rs-question"><summary><span className="rs-faq-number rs-mono">{String(index + 1).padStart(2, '0')}</span><span>{item.question}</span><Icon name="plus" /></summary><div className="rs-answer"><p>{item.answer}</p>{item.delivery && <a href={`${SHOP}/livraison-retours/`}>Consulter les conditions de livraison<Icon name="arrow" /></a>}</div></details>)}</div>
        </div>
      </section>

      <section className="rs-final-cta" aria-labelledby="rs-final-title"><img className="final-race-photo" src="/assets/runspark/editorial/morning-run-1536.webp" width="1536" height="1024" alt="" loading="lazy" decoding="async" /><div className="rs-container rs-final-layout"><div><p className="rs-eyebrow">VOUS L’AVEZ FAIT.</p><h2 id="rs-final-title">ÇA MÉRITE<br />UN CADRE.</h2></div><div className="rs-final-action"><p>Gardez vos kilomètres<br />à portée de regard.</p><ArrowLink href="#config" className="rs-button-black">Personnaliser mon cadre</ArrowLink><span>CHF 89,90 · Gravure incluse</span></div></div></section>

      <dialog ref={dialogRef} className="rs-lightbox" aria-labelledby="rs-lightbox-title" aria-describedby="rs-lightbox-counter rs-lightbox-note" onClose={() => { setGalleryOpen(false); openerRef.current?.focus({ preventScroll: true }); }} onClick={(event) => { if (event.target === dialogRef.current) dialogRef.current.close(); }} onKeyDown={(event) => { if (event.key === 'ArrowRight') { event.preventDefault(); moveGallery(1); } if (event.key === 'ArrowLeft') { event.preventDefault(); moveGallery(-1); } }}>
        <div className="rs-lightbox-content"><div className="rs-lightbox-top"><span>{lightboxItem.category}</span><button type="button" className="rs-lightbox-close" aria-label="Fermer la galerie" autoFocus onClick={() => dialogRef.current.close()}><Icon name="close" /></button></div>{galleryOpen && <img className="rs-lightbox-image" src={lightboxItem.image} alt={lightboxItem.alt} width="1536" height="1024" decoding="async" />}<div className="rs-lightbox-footer"><div><h3 id="rs-lightbox-title">{lightboxItem.title}</h3><p>{lightboxItem.detail}</p><p id="rs-lightbox-note">Mise en situation générée · Athlète fictif</p><a className="buy-lightbox-cta" href="#config" onClick={() => { chooseInspiration(lightboxItem.finish.startsWith('Blanc') ? 'blanc' : lightboxItem.finish.startsWith('Bois') ? 'bois' : 'noir', lightboxItem.id); dialogRef.current?.close(); }}>Choisir cette finition <Icon name="arrow" size={18} /></a></div><div className="rs-lightbox-nav"><button type="button" aria-label="Photographie précédente" onClick={() => moveGallery(-1)}><Icon name="left" /></button><span id="rs-lightbox-counter" className="rs-mono" aria-live="polite">{String(Math.max(visibleLightboxIndex, 0) + 1).padStart(2, '0')} / {String(visibleGallery.length).padStart(2, '0')}</span><button type="button" aria-label="Photographie suivante" onClick={() => moveGallery(1)}><Icon name="right" /></button></div></div></div>
      </dialog>
    </div>
  );
}
