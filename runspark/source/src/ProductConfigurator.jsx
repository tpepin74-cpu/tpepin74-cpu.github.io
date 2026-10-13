import { useEffect, useId, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import PhotographicPreview, { PHOTO_VIEWS, PRODUCTS, letteringLayout } from './PhotographicPreview.jsx';
import { CHECKOUT_URL, DELIVERY_URL, PRICE_LABEL, FINISHES, PLATES, FONTS, DEFAULT_CONFIGURATION, normalizeConfiguration, configurationError, getVariantId, personalizationAction } from './product-order.js';
import './product-configurator.css';
import { IncludedCard, DeliveryHelp } from './BuyingGuide.jsx';
import { COURSE_NAMES, configurationFromLink, trackCommerce } from './commerce.js';

const STORAGE_KEY = 'runspark:photo-configuration:v2';
const LEGACY_STORAGE_KEY = 'runspark:photo-configuration:v1';

function readConfiguration() {
  if (typeof window === 'undefined') return { ...DEFAULT_CONFIGURATION };
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    if (saved?.version === 2) return configurationFromLink(saved.configuration, window.location.search);
    const legacy = JSON.parse(window.localStorage.getItem(LEGACY_STORAGE_KEY));
    if (legacy?.version === 1) {
      const value = normalizeConfiguration(legacy.configuration);
      // Never turn old prefilled demo text into an accidental engraving.
      if (value.line1 === 'NEW YORK CITY MARATHON' && value.line2 === '02.11.2025 · 42,195 KM') {
        value.line1 = ''; value.line2 = '';
      }
      return configurationFromLink(value, window.location.search);
    }
  } catch { /* Storage is optional. */ }
  return configurationFromLink(DEFAULT_CONFIGURATION, window.location.search);
}

function Choice({ checked, onChange, name, value, children, className = '' }) {
  return <label className={`pc-choice ${checked ? 'pc-choice-selected' : ''} ${className}`}>
    <input className="pc-radio" type="radio" name={name} value={value} checked={checked} onChange={onChange} />
    {children}<span className="pc-choice-check" aria-hidden="true"><Icon name="check" size={14} /></span>
  </label>;
}

export default function ProductConfigurator({ isMobile = false }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [configuration, setConfiguration] = useState(readConfiguration);
  const [view, setView] = useState('ensemble');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [giftMode, setGiftMode] = useState(false);
  const [template, setTemplate] = useState('course');
  const [course, setCourse] = useState('');
  const [step, setStep] = useState('finish');
  const stepTitleRef = useRef(null);
  const secondLineRef = useRef(null);
  const finishRef = useRef(null);
  const reviewEditTarget = useRef(null);
  const formRef = useRef(null);
  const reviewRef = useRef(null);
  const reviewApproved = useRef(false);
  const reviewOpener = useRef(null);
  const started = useRef(false);
  const dialogRef = useRef(null);
  const openerRef = useRef(null);
  const firstLineRef = useRef(null);
  const submissionLock = useRef(false);
  const finish = FINISHES.find((item) => item.id === configuration.finish);
  const plate = PLATES.find((item) => item.id === configuration.plate);
  const font = FONTS.find((item) => item.id === configuration.font);
  const activeView = PHOTO_VIEWS.find((item) => item.id === view);
  const hasEngraving = !!configuration.line1.trim();
  const hasChanges = Object.keys(DEFAULT_CONFIGURATION).some(key => configuration[key] !== DEFAULT_CONFIGURATION[key]);
  const preview = { ...configuration, line1: configuration.line1 || 'VOTRE EXPLOIT', line2: configuration.line1 || configuration.line2 ? configuration.line2 : 'UNE DATE, UN SOUVENIR' };
  const classic = configuration.font === 'classique';
  const firstLayout = letteringLayout(preview.line1, classic ? 21 : 20, 288);
  const secondLayout = letteringLayout(preview.line2, classic ? 18 : 17, 288);

  useEffect(() => {
    try {
      const isDefault = Object.keys(DEFAULT_CONFIGURATION).every((key) => configuration[key] === DEFAULT_CONFIGURATION[key]);
      if (isDefault) window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, configuration }));
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch { /* Storage is never a requirement for ordering. */ }
  }, [configuration]);

  useEffect(() => {
    const restore = () => { submissionLock.current = false; reviewApproved.current = false; setSubmitting(false); reviewRef.current?.close(); };
    window.addEventListener('pageshow', restore);
    return () => window.removeEventListener('pageshow', restore);
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has('finish') || url.searchParams.has('course')) {
      url.searchParams.delete('finish'); url.searchParams.delete('course');
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    }
    const prefill = event => {
      if (!FINISHES.some(f => f.id === event.detail?.finish)) return;
      const query = new URLSearchParams({ finish: event.detail.finish });
      if (Object.hasOwn(COURSE_NAMES, event.detail.course)) query.set('course', event.detail.course);
      setConfiguration(current => configurationFromLink(current, query.toString()));
      setStep('engraving');
      setError('');
      setNotice('Inspiration reprise. Votre texte déjà saisi est conservé.');
    };
    const gift = () => { setGiftMode(true); setTemplate('name'); setStep('engraving'); setError(''); setNotice('Composez une gravure pour la personne à qui vous offrez le cadre.'); };
    window.addEventListener('runspark:prefill', prefill);
    window.addEventListener('runspark:gift', gift);
    return () => { window.removeEventListener('runspark:prefill', prefill); window.removeEventListener('runspark:gift', gift); };
  }, []);

  const change = (field, value) => {
    if (!started.current) { started.current = true; trackCommerce('begin_personalization'); }
    setConfiguration((current) => normalizeConfiguration({ ...current, [field]: value }));
    if (field === 'line1') setError('');
    setNotice('');
  };
  const moveToStep = (next, focusInput = false) => {
    setStep(next);
    requestAnimationFrame(() => {
      if (isMobile) {
        window.scrollTo({ top: 0, behavior: 'instant' });
        if (focusInput && next === 'engraving') firstLineRef.current?.focus();
        else stepTitleRef.current?.focus({ preventScroll: true });
      } else if (next === 'engraving') firstLineRef.current?.focus();
      else finishRef.current?.querySelector('input:checked')?.focus();
    });
  };
  const editFromReview = (next) => {
    reviewEditTarget.current = next;
    reviewRef.current?.close();
  };
  const closeReview = () => {
    reviewApproved.current = false;
    if (reviewEditTarget.current) {
      const next = reviewEditTarget.current;
      reviewEditTarget.current = null;
      moveToStep(next, next === 'engraving');
    } else reviewOpener.current?.focus({ preventScroll: true });
  };
  const reset = () => {
    setConfiguration({ ...DEFAULT_CONFIGURATION });
    setView('ensemble'); setError('');
    setGiftMode(false); setTemplate('course'); setCourse(''); reviewApproved.current = false;
    setNotice('Votre personnalisation a été effacée.');
    moveToStep('finish');
  };
  const openPhoto = (event) => {
    openerRef.current = event.currentTarget;
    dialogRef.current?.showModal();
  };
  const submit = (event) => {
    const action = personalizationAction(configuration, { isMobile, step, reviewApproved: reviewApproved.current, locked: submissionLock.current });
    if (action === 'blocked') { event.preventDefault(); return; }
    if (action === 'advance') { event.preventDefault(); moveToStep('engraving'); return; }
    if (action === 'invalid') {
      event.preventDefault(); reviewApproved.current = false; setError(configurationError(configuration));
      moveToStep('engraving', true);
      return;
    }
    if (action === 'review') {
      event.preventDefault();
      reviewOpener.current = event.nativeEvent.submitter || document.activeElement;
      reviewRef.current?.showModal();
      trackCommerce('review_configuration', { finish: configuration.finish });
      return;
    }
    reviewApproved.current = false;
    submissionLock.current = true;
    setSubmitting(true);
    trackCommerce('begin_checkout', { finish: configuration.finish });
    // Native POST to the real checkout preserves engraving without copy/paste
    // or a CORS-dependent background request. Payment is confirmed in the shop.
  };

  return (
    <section className="pc-config" id="config" aria-labelledby="rs-config-title" data-step={step} data-guided={isMobile ? 'true' : 'false'}>
      <div className="pc-container">
        <div className="pc-intro">
          <div><p className="pc-eyebrow"><span aria-hidden="true" /> À VOTRE IMAGE</p><h2 className="pc-title" id="rs-config-title">Personnalisez<br /><span>votre cadre.</span></h2></div>
          <p className="pc-intro-copy">Une finition. Quelques mots.<br />Votre souvenir prend forme en direct.</p>
        </div>
        {isMobile && <><div className="pc-guided-heading"><a href="#experience"><Icon name="left" size={15} /> Retour au site</a><span>Gravure incluse</span></div><nav className="pc-progress" aria-label="Étapes de personnalisation"><button type="button" aria-current={step === 'finish' ? 'step' : undefined} onClick={() => moveToStep('finish')}><span>{step === 'engraving' ? <Icon name="check" size={15} /> : '1'}</span>Mon cadre</button><button type="button" aria-current={step === 'engraving' ? 'step' : undefined} onClick={() => moveToStep('engraving')}><span>2</span>Ma gravure</button></nav><h3 className="pc-guided-title" ref={stepTitleRef} tabIndex={-1}>{step === 'finish' ? 'Quelle finition vous ressemble ?' : 'Quels mots voulez-vous garder ?'}</h3></>}
        <div className="pc-layout">
          <div className="pc-photo-column">
            <div className="pc-photo-heading"><p>VOTRE APERÇU EN DIRECT</p><span>{finish.label} {finish.detail}</span></div>
            <button className="pc-photo-stage" type="button" onClick={openPhoto} aria-haspopup="dialog" aria-label={`Agrandir votre cadre ${finish.label.toLowerCase()}`}>
              <PhotographicPreview {...preview} view={view} className="pc-photo-svg" />
              <span className="pc-photo-expand"><Icon name="plus" size={17} /> Agrandir</span>
            </button>
            <div className="pc-view-switch" role="group" aria-label="Vue du cadre">
              <button type="button" aria-pressed={view === 'ensemble'} onClick={() => setView('ensemble')}>Cadre entier</button>
              <button type="button" aria-pressed={view === 'plaque'} onClick={() => setView('plaque')}>Zoom gravure</button>
            </div>
            <p className="pc-photo-note">Votre finition et votre plaque se personnalisent. Médaille, dossard, parcours et autres souvenirs illustrent le rendu ; ils ne sont pas fournis.</p>
          </div>

          <form ref={formRef} className="pc-form" action={CHECKOUT_URL} method="post" acceptCharset="UTF-8" noValidate onSubmit={submit} aria-busy={submitting}>
            <input type="hidden" name="add-to-cart" value={getVariantId(configuration)} />
            <input type="hidden" name="quantity" value="1" />
            <div className="pc-product-topline"><span>LE CADRE FINISHER</span><span>Gravure incluse</span></div>
            <div className="pc-price-row"><p className="pc-price"><span>CHF</span> 89,90</p><a className="pc-shipping" href={DELIVERY_URL} target="_blank" rel="noopener noreferrer"><Icon name="truck" size={19} /><span>Livraison offerte*<small>Préparé en 1 à 2 jours ouvrés</small></span><span className="pc-visually-hidden">Conditions, nouvel onglet</span></a></div>
            <p className="pc-included-summary">Cadre et plaque gravée. Vous ajoutez votre médaille et votre dossard.</p>
            <fieldset ref={finishRef} className="pc-fieldset pc-finish-fieldset" aria-label="Choisissez la finition du cadre" hidden={isMobile && step !== 'finish'}>
              <legend><span className="pc-step" aria-hidden="true">1</span> Choisissez votre cadre</legend>
              <div className="pc-finish-choices">
                {FINISHES.map((item) => <Choice key={item.id} name={`pc-finish-${id}`} value={item.id} checked={configuration.finish === item.id} onChange={() => change('finish', item.id)} className="pc-finish-choice"><img src={PRODUCTS[item.id].src} alt="" width="1086" height="1448" loading="lazy" /><strong>{item.label}</strong></Choice>)}
              </div>
            </fieldset>
            <div className="pc-engraving-step" hidden={isMobile && step !== 'engraving'}>
            <fieldset className="pc-fieldset pc-engraving" aria-label="Votre gravure">
              <legend><span className="pc-step" aria-hidden="true">2</span> Écrivez votre gravure</legend>
              <details className="pc-ideas"><summary>Besoin d’une idée de texte ? <Icon name="plus" size={16} /></summary>
              <div className="buy-templates" role="group" aria-label="Choisir une idée de gravure">{[['course','Course + date'],['name','Prénom + chrono'],['first','Premier marathon']].map(([value,label]) => <button key={value} type="button" aria-pressed={template === value} onClick={() => { setTemplate(value); if (value === 'first' && !configuration.line1.trim()) change('line1','MON PREMIER MARATHON'); firstLineRef.current?.focus(); }}>{label}</button>)}</div>
              {template === 'course' && <div className="buy-course-picker"><label htmlFor={`course-${id}`}>Choisissez votre course</label><select id={`course-${id}`} value={course} onChange={e => { const next = e.target.value; setCourse(next); if (Object.hasOwn(COURSE_NAMES, next)) change('line1', COURSE_NAMES[next]); }}><option value="">Choisir une course</option>{Object.entries(COURSE_NAMES).map(([key,name]) => <option key={key} value={key}>{name}</option>)}</select><p>Votre course n’est pas dans la liste ? Écrivez son nom ci-dessous.</p></div>}
              </details>
              <div className="pc-input-heading"><label htmlFor={`pc-line1-${id}`}>{template === 'name' ? 'Prénom ou nom du coureur' : 'Course ou prénom'} <span>obligatoire</span></label><span id={`pc-line1-count-${id}`}>{configuration.line1.length}/22</span></div>
              <input className="pc-input" id={`pc-line1-${id}`} ref={firstLineRef} name="rs_line1" type="text" value={configuration.line1} required maxLength={22} placeholder={template === 'name' ? 'Ex. ÉLODIE' : 'Ex. MARATHON DE PARIS'} enterKeyHint="next" onKeyDown={event => { if (event.key === 'Enter' && !event.nativeEvent.isComposing) { event.preventDefault(); secondLineRef.current?.focus(); } }} autoComplete="off" spellCheck={false} aria-invalid={error ? 'true' : undefined} aria-describedby={`pc-line1-count-${id}${error ? ` pc-error-${id}` : ''}`} onChange={(event) => change('line1', event.target.value)} />
              {error && <p className="pc-error" id={`pc-error-${id}`} role="alert">{error}</p>}
              <div className="pc-input-heading"><label htmlFor={`pc-line2-${id}`}>{giftMode ? 'Une date, un chrono ou un petit mot' : 'Date, distance ou temps'} <span>facultatif</span></label><span id={`pc-line2-count-${id}`}>{configuration.line2.length}/26</span></div>
              <input className="pc-input" id={`pc-line2-${id}`} ref={secondLineRef} name="rs_line2" type="text" value={configuration.line2} maxLength={26} placeholder={template === 'name' ? 'Ex. 3:42:18 · FINISHER' : 'Ex. 12.04.2026 · 42,195 KM'} enterKeyHint="done" onKeyDown={event => { if (event.key === 'Enter' && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.blur(); formRef.current?.requestSubmit(); } }} autoComplete="off" spellCheck={false} aria-describedby={`pc-line2-count-${id}`} onChange={(event) => change('line2', event.target.value)} />
              <div className={`pc-engraving-preview pc-engraving-${configuration.plate}`}><svg viewBox="0 0 320 90" role="img" aria-label={hasEngraving ? `Votre gravure : ${configuration.line1}${configuration.line2 ? `, ${configuration.line2}` : ''}` : 'Exemple de plaque à personnaliser'}><g fill="currentColor" fontFamily={classic ? "Georgia, 'Times New Roman', serif" : "'Manrope', Arial, sans-serif"} textAnchor="middle" dominantBaseline="middle"><text x="160" y={preview.line2 ? 32 : 47} fontSize={firstLayout.fontSize} fontWeight={classic ? 400 : 700} textLength={firstLayout.textLength} lengthAdjust="spacingAndGlyphs" xmlSpace="preserve">{preview.line1}</text>{preview.line2 && <text x="160" y="63" fontSize={secondLayout.fontSize} fontWeight={classic ? 400 : 600} textLength={secondLayout.textLength} lengthAdjust="spacingAndGlyphs" xmlSpace="preserve">{preview.line2}</text>}</g></svg></div>
              <p className="pc-preview-note">{hasEngraving ? 'Votre texte sera gravé tel qu’il apparaît ici.' : 'Votre texte apparaîtra ici, au fil de la saisie.'}</p>
            </fieldset>
            <details className="pc-style-options">
              <summary><span>Plaque {plate.label.toLowerCase()} · Écriture {font.label.toLowerCase()}</span><span className="pc-style-edit">Modifier <Icon name="plus" size={16} /></span></summary>
              <div className="pc-detail-choices">
                <fieldset className="pc-fieldset"><legend>Couleur de la plaque</legend><div className="pc-pair-choices">{PLATES.map((item) => <Choice key={item.id} name={`pc-plate-${id}`} value={item.id} checked={configuration.plate === item.id} onChange={() => change('plate', item.id)} className="pc-small-choice"><span className={`pc-metal-swatch pc-metal-${item.id}`} aria-hidden="true" /><strong>{item.label}</strong></Choice>)}</div></fieldset>
                <fieldset className="pc-fieldset"><legend>Style d’écriture</legend><div className="pc-pair-choices">{FONTS.map((item) => <Choice key={item.id} name={`pc-font-${id}`} value={item.id} checked={configuration.font === item.id} onChange={() => change('font', item.id)} className={`pc-small-choice pc-font-${item.id}`}><span className="pc-font-sample" aria-hidden="true">Aa</span><strong>{item.label}</strong></Choice>)}</div></fieldset>
              </div>
            </details>
            <label className="buy-gift-check"><input type="checkbox" checked={giftMode} onChange={e => setGiftMode(e.target.checked)} /><span>C’est pour offrir<small>Un prénom et une dédicace suffisent.</small></span></label>
            {giftMode && <p className="buy-gift-note">La gravure sera celle saisie ci-dessus. Vous pouvez aussi <a href="#cadeau">créer un mot à imprimer</a> pour accompagner votre cadeau.</p>}
            <button className="pc-inline-review" type="submit" disabled={submitting}>Vérifier mon cadre <Icon name="arrow" size={18} /></button>
            </div>
            <div className="pc-support"><details className="pc-included-help"><summary>Ce que vous recevez <Icon name="plus" size={17} /></summary><IncludedCard /></details><DeliveryHelp compact /></div>
            <div className="pc-order-actions">
              <div className="pc-order-summary"><span>1 cadre {finish.label.toLowerCase()}<small>Gravure incluse</small></span><strong>{PRICE_LABEL}</strong></div>
              <button className="pc-button" type="submit" disabled={submitting}>{submitting ? 'Ouverture de la commande…' : 'Vérifier mon cadre'}<Icon name={submitting ? 'rotate' : 'arrow'} size={20} /></button>
              <p className="pc-action-note" role="status">{submitting ? 'Votre cadre et votre gravure sont transmis à Run Spark.' : 'Relisez votre gravure avant de passer au paiement.'}</p>
            </div>
            <div className="pc-form-footer">{hasChanges && <button type="button" className="pc-reset" onClick={reset}>Recommencer</button>}<span role="status">{notice}</span></div>
            <p className="pc-delivery-note">* Livraison offerte dès 60 CHF ou 60 € selon la destination. Le montant final est confirmé avant paiement.</p>
            {isMobile && <div className="pc-mobile-order"><span><strong>{PRICE_LABEL}</strong><small>Gravure incluse</small></span><button type="submit" disabled={submitting}>{submitting ? 'Ouverture…' : step === 'finish' ? 'Ajouter ma gravure' : 'Vérifier mon cadre'}<Icon name="arrow" size={19} /></button><p>{step === 'finish' ? 'Ensuite : votre texte personnalisé.' : 'Récapitulatif avant paiement · Frais selon destination'}</p><span className="pc-visually-hidden" role="status">{submitting ? 'Ouverture de la commande Run Spark.' : ''}</span></div>}
          </form>
        </div>
      </div>
      <dialog className="pc-dialog buy-review" ref={reviewRef} aria-labelledby={`review-title-${id}`} onClose={closeReview}>
        <div className="pc-dialog-heading"><h2 id={`review-title-${id}`}>Votre cadre est prêt.</h2><button type="button" aria-label="Fermer le récapitulatif" onClick={() => reviewRef.current?.close()}><Icon name="close" /></button></div>
        <p className="buy-review-intro">Relisez votre gravure avant de passer à la commande.</p>
        <div className="buy-review-product"><div className="buy-review-preview"><PhotographicPreview {...preview} view="ensemble" /></div><div><strong>Votre cadre {finish.label.toLowerCase()}</strong><p>Plaque {plate.label.toLowerCase()} · Écriture {font.label.toLowerCase()}</p><b>{PRICE_LABEL}</b><small>Gravure incluse · Frais éventuels selon destination</small></div></div>
        <div className={`buy-review-engraving pc-engraving-${configuration.plate}`}><strong>{configuration.line1}</strong>{configuration.line2 && <span>{configuration.line2}</span>}</div>
        <p className="buy-review-included">Cadre et plaque personnalisée. Vous ajoutez votre médaille et votre dossard. Les autres souvenirs des photos sont des exemples.</p>
        <div className="buy-review-actions"><button className="pc-button" type="button" autoFocus disabled={submitting} onClick={() => { reviewApproved.current = true; formRef.current?.requestSubmit(); }}>{submitting ? 'Ouverture du paiement…' : 'Aller au paiement'} <Icon name="arrow" /></button><div className="buy-review-edit"><button type="button" onClick={() => editFromReview('finish')}>Modifier le cadre</button><button type="button" onClick={() => editFromReview('engraving')}>Modifier la gravure</button></div></div>
        <p className="buy-review-footnote">Vos choix sont transmis à la boutique Run Spark. Vous vérifierez l’adresse, les frais et le paiement à l’étape suivante.</p>
      </dialog>
      <dialog className="pc-dialog" ref={dialogRef} aria-labelledby={`pc-photo-title-${id}`} onClose={() => openerRef.current?.focus({ preventScroll: true })} onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialogRef.current?.close();
      }}>
        <div className="pc-dialog-heading"><h2 id={`pc-photo-title-${id}`}>Votre cadre · {activeView.label.toLowerCase()}</h2><button className="pc-dialog-close" type="button" autoFocus aria-label="Fermer l’aperçu" onClick={() => dialogRef.current?.close()}><Icon name="close" size={22} /></button></div>
        <div className="pc-dialog-photo"><PhotographicPreview {...preview} view={view} className="pc-photo-svg" /></div>
        <div className="pc-view-switch" role="group" aria-label="Détail du cadre agrandi">{PHOTO_VIEWS.map((item) => <button key={item.id} type="button" aria-pressed={view === item.id} onClick={() => setView(item.id)}>{item.label}</button>)}</div>
        <p className="pc-photo-note">Aperçu de personnalisation. Les souvenirs dans le cadre sont présentés à titre d’exemple.</p>
      </dialog>
    </section>
  );
}
