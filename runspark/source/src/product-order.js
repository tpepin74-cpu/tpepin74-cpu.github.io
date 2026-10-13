// Verified against Run Spark's live catalog on 2026-10-12.
export const CHECKOUT_URL = 'https://runspark.digital-solutions.io/commander/';
export const DELIVERY_URL = 'https://runspark.digital-solutions.io/livraison-retours/';
export const PRICE_LABEL = 'CHF 89,90';
export const FINISHES = [
  { id: 'noir', label: 'Noir', detail: 'Premium' },
  { id: 'bois', label: 'Bois', detail: 'Classique' },
  { id: 'blanc', label: 'Blanc', detail: 'Épuré' },
];
export const PLATES = [{ id: 'dore', label: 'Dorée' }, { id: 'argent', label: 'Argentée' }];
export const FONTS = [{ id: 'classique', label: 'Classique' }, { id: 'moderne', label: 'Moderne' }];
export const DEFAULT_CONFIGURATION = Object.freeze({ finish: 'noir', plate: 'dore', font: 'moderne', line1: '', line2: '' });
const VARIANTS = {
  'noir|dore|classique': 35, 'noir|dore|moderne': 36,
  'noir|argent|classique': 37, 'noir|argent|moderne': 38,
  'bois|dore|classique': 39, 'bois|dore|moderne': 40,
  'bois|argent|classique': 41, 'bois|argent|moderne': 42,
  'blanc|dore|classique': 43, 'blanc|dore|moderne': 44,
  'blanc|argent|classique': 45, 'blanc|argent|moderne': 46,
};
function cleanEngraving(value, maximum) {
  if (typeof value !== 'string') return '';
  return value.normalize('NFC').replace(/[\u0000-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/g, '').slice(0, maximum).replace(/[\uD800-\uDBFF]$/, '');
}
export function normalizeConfiguration(value) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const valid = (options, candidate, fallback) => options.some((option) => option.id === candidate) ? candidate : fallback;
  return {
    finish: valid(FINISHES, source.finish, DEFAULT_CONFIGURATION.finish),
    plate: valid(PLATES, source.plate, DEFAULT_CONFIGURATION.plate),
    font: valid(FONTS, source.font, DEFAULT_CONFIGURATION.font),
    line1: cleanEngraving(source.line1, 22), line2: cleanEngraving(source.line2, 26),
  };
}
export function configurationError(configuration) {
  return configuration.line1.trim() ? '' : 'Écrivez le nom de la course ou du coureur à graver.';
}
// Every route to the real checkout must pass validation and explicit review.
export function personalizationAction(configuration, { isMobile = false, step = 'finish', reviewApproved = false, locked = false } = {}) {
  if (locked) return 'blocked';
  if (isMobile && step === 'finish' && !reviewApproved) return 'advance';
  if (configurationError(configuration)) return 'invalid';
  return reviewApproved ? 'checkout' : 'review';
}
export function getVariantId(configuration) {
  const value = normalizeConfiguration(configuration);
  return VARIANTS[`${value.finish}|${value.plate}|${value.font}`];
}
export function checkoutFields(configuration) {
  const value = normalizeConfiguration(configuration);
  if (configurationError(value)) throw new Error(configurationError(value));
  return { 'add-to-cart': String(getVariantId(value)), quantity: '1', rs_line1: value.line1, rs_line2: value.line2 };
}
