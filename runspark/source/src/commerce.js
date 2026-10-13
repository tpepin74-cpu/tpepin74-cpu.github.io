import { FINISHES, normalizeConfiguration } from './product-order.js';

export const COURSE_NAMES = {
  paris: 'MARATHON DE PARIS', berlin: 'MARATHON DE BERLIN', 'new-york': 'NEW YORK CITY MARATHON',
  geneve: 'MARATHON DE GENÈVE', lausanne: 'LAUSANNE MARATHON', chicago: 'CHICAGO MARATHON',
  sydney: 'SYDNEY MARATHON', london: 'LONDON MARATHON', boston: 'BOSTON MARATHON',
  rotterdam: 'MARATHON DE ROTTERDAM', tokyo: 'TOKYO MARATHON', valencia: 'MARATHON DE VALENCE',
};

// Explicit selections can change a finish. Existing personal engraving is retained.
export function configurationFromLink(configuration, search) {
  const query = new URLSearchParams(search);
  const next = normalizeConfiguration(configuration);
  if (FINISHES.some(f => f.id === query.get('finish'))) next.finish = query.get('finish');
  if (!next.line1.trim() && Object.hasOwn(COURSE_NAMES, query.get('course'))) next.line1 = COURSE_NAMES[query.get('course')];
  return next;
}

// No names, engraving, email addresses or free text enter the measurement layer.
const EVENTS = new Set(['view_item', 'begin_personalization', 'select_inspiration', 'review_configuration', 'begin_checkout', 'gift_card_download', 'view_course']);
export function trackCommerce(event, detail = {}) {
  if (typeof window === 'undefined' || !EVENTS.has(event)) return;
  const payload = { event: 'runspark_' + event, device: window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop' };
  if (FINISHES.some(f => f.id === detail.finish)) payload.finish = detail.finish;
  if (Object.hasOwn(COURSE_NAMES, detail.course)) payload.course = detail.course;
  if (event === 'begin_checkout') { payload.currency = 'CHF'; payload.value = 89.9; }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
  window.dispatchEvent(new CustomEvent('runspark:commerce', { detail: payload }));
}

export function chooseInspiration(finish, course) {
  if (typeof window === 'undefined' || !FINISHES.some(f => f.id === finish)) return;
  window.dispatchEvent(new CustomEvent('runspark:prefill', { detail: { finish, course } }));
  trackCommerce('select_inspiration', { finish, course });
}

export const DELIVERY = {
  ch: { label: 'Suisse / Liechtenstein', text: 'Préparation et gravure : 1 à 2 jours ouvrés. Transport suivi annoncé : 2 à 4 jours ouvrés. Livraison offerte dès CHF 60.' },
  eu: { label: 'Europe / Royaume-Uni', text: 'Préparation et gravure : 1 à 2 jours ouvrés. Le délai de transport et les frais sont confirmés à la commande. Des frais d’importation peuvent s’appliquer selon le pays.' },
  world: { label: 'Autre destination', text: 'Expédition suivie depuis la Suisse. Le délai et le coût dépendent de votre destination et sont confirmés par la boutique avant paiement.' },
};
