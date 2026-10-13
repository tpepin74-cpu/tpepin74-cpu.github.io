import { useId } from 'react';

// Packshots generated from the supplied real black frame; wood/white are finish variants.
export const PRODUCTS = Object.fromEntries(['noir', 'bois', 'blanc'].map((finish) => [finish, {
  src: `/assets/runspark/cadre-photo-${finish}.webp`, width: 1086, height: 1448,
  plaque: [180, 772, 314, 84],
}]));
const CROPS = {
  ensemble: '0 0 1086 1448',
  medaille: '517 208 413 715',
  dossard: '151 880 384 348',
  plaque: '159 748 354 130',
};

export const PHOTO_VIEWS = [
  { id: 'ensemble', label: 'Ensemble', detail: 'Le cadre dans son ensemble' },
  { id: 'medaille', label: 'Médaille', detail: 'Détail de la médaille et de son ruban' },
  { id: 'dossard', label: 'Dossard', detail: 'Détail du dossard' },
  { id: 'plaque', label: 'Plaque', detail: 'Détail de la zone de gravure' },
];

const FINISH_LABELS = { noir: 'noire', bois: 'bois', blanc: 'blanche' };

// Fit intrinsically first: some SVG rasterizers ignore textLength, and server
// rendering can use a wider fallback than the browser's loaded Manrope font.
// These conservative advances cover the supported fonts and common fallbacks.
// The 288 px text area leaves 16 px on each side of the 320 px plaque.
export function letteringLayout(value, preferredSize, maximum = 168) {
  const units = Array.from(value).reduce((total, character) => {
    if (/\s/u.test(character)) return total + 0.40;
    if (/[MW@%&ÆŒmw]/u.test(character)) return total + 1.18;
    if (/[Ilit.,:;'!|·]/u.test(character)) return total + 0.43;
    if (/[A-ZÀ-ÖØ-Þ]/u.test(character)) return total + 0.84;
    if (/[0-9]/u.test(character)) return total + 0.76;
    if (/[a-zà-öø-ÿ]/u.test(character)) return total + 0.76;
    return total + 1.18;
  }, 0);
  const needsReduction = units * preferredSize > maximum;
  const fontSize = needsReduction
    ? Math.floor((maximum / Math.max(units, 1)) * 1000) / 1000
    : preferredSize;
  return {
    fontSize,
    // Long lines keep an additional browser-side width guard. Short labels use
    // natural metrics and are never stretched to fill the available width.
    textLength: needsReduction ? maximum : undefined,
  };
}

// Retouched packshots stay unchanged; engraving is overlaid on the actual nameplate.
export default function PhotographicPreview({
  finish = 'noir',
  plate = 'dore',
  font = 'moderne',
  line1 = 'NEW YORK CITY MARATHON',
  line2 = '02.11.2025 · 42,195 KM',
  view = 'ensemble',
  original = false,
  className = '',
  ariaLabel,
}) {
  const reactId = useId();
  const prefix = `runspark-photo-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const plateGradientId = `${prefix}-metal`;
  const activeView = PHOTO_VIEWS.find((item) => item.id === view) || PHOTO_VIEWS[0];
  const activeFinish = Object.hasOwn(FINISH_LABELS, finish) ? finish : 'noir';
  const product = PRODUCTS[activeFinish];
  const [px, py, pw, ph] = product.plaque;
  const plaqueTransform = `translate(${px} ${py}) scale(${pw / 320} ${ph / 90})`;
  const classic = font === 'classique';
  const silver = plate === 'argent';
  const firstLine = String(line1 ?? '');
  const secondLine = String(line2 ?? '');
  const firstLayout = letteringLayout(firstLine, classic ? 21 : 20, 288);
  const secondLayout = letteringLayout(secondLine, classic ? 18 : 17, 288);
  const label = ariaLabel || (original
    ? `Visuel produit RunSpark, finition ${FINISH_LABELS[activeFinish]}. ${activeView.detail}.`
    : `Aperçu sur le visuel produit RunSpark, finition ${FINISH_LABELS[activeFinish]}, plaque ${silver ? 'argent' : 'dorée'}. ${activeView.detail}.`);
  const photoAttributes = {
    href: product.src,
    x: 0,
    y: 0,
    width: product.width,
    height: product.height,
    preserveAspectRatio: 'xMidYMid meet',
  };

  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={CROPS[activeView.id]}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={label}
      data-photo-view={activeView.id}
      data-photo-original={original ? 'true' : 'false'}
      data-photo-finish={original ? 'original' : activeFinish}
      style={{ display: 'block', overflow: 'hidden', maxWidth: '100%' }}
    >
      <title>{label}</title>
      <defs>
        <linearGradient id={plateGradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={silver ? '#e6e8e7' : '#e5d2a1'} />
          <stop offset="0.27" stopColor={silver ? '#cdd0d0' : '#cfb77c'} />
          <stop offset="0.58" stopColor={silver ? '#aeb4b5' : '#b99a5c'} />
          <stop offset="0.82" stopColor={silver ? '#dadddd' : '#d7bf83'} />
          <stop offset="1" stopColor={silver ? '#bdc2c2' : '#c2a66e'} />
        </linearGradient>
      </defs>

      <image {...photoAttributes} />

      {!original && (
        <g data-photo-overlay="engraving-simulation">
          <g transform={plaqueTransform}>
            {/* The original surrounding bevel and white filet remain visible. */}
            <rect x="0" y="0" width="320" height="90" rx="0.4" fill={`url(#${plateGradientId})`} />
            <rect x="2" y="2" width="316" height="86" fill="none" stroke={silver ? '#899194' : '#8d7448'} strokeWidth="0.6" opacity="0.63" />
            <path d="M2 2H318" stroke="#fff" strokeWidth="0.65" opacity="0.55" />
            <g
              fill={silver ? '#343b3e' : '#423821'}
              fontFamily={classic ? "Georgia, 'Times New Roman', serif" : "'Manrope', Arial, sans-serif"}
              textAnchor="middle"
              dominantBaseline="middle"
              aria-hidden="true"
            >
              {firstLine && <text x="160" y={secondLine ? 32 : 47} fontSize={firstLayout.fontSize} fontWeight={classic ? 400 : 700} textLength={firstLayout.textLength} lengthAdjust="spacingAndGlyphs" xmlSpace="preserve">{firstLine}</text>}
              {secondLine && <text x="160" y={firstLine ? 63 : 47} fontSize={secondLayout.fontSize} fontWeight={classic ? 400 : 600} textLength={secondLayout.textLength} lengthAdjust="spacingAndGlyphs" xmlSpace="preserve">{secondLine}</text>}
            </g>
          </g>
        </g>
      )}
    </svg>
  );
}
