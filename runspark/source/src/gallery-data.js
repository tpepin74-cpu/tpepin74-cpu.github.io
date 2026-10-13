// Fictional athletes in generated product scenes; documentary references are
// recorded in references/gallery-sources.json. Ordered by completed race date.
const scenes = [
  { id: 'chicago', city: 'Chicago', year: 2026, date: '11 octobre 2026', region: 'americas', finish: 'Blanc Épuré', title: 'Chicago. La ligne franchie.', alt: 'Mise en situation générée : un coureur en tenue verte présente un cadre blanc avec sa photo, son dossard et la médaille de Chicago 2026, près de Grant Park.' },
  { id: 'berlin', city: 'Berlin', year: 2026, date: '27 septembre 2026', region: 'europe', finish: 'Noir Premium', title: 'Berlin. Une nouvelle page.', alt: 'Mise en situation générée : une coureuse aux cheveux gris présente son cadre noir personnalisé pour Berlin 2026, devant la porte de Brandebourg.' },
  { id: 'sydney', city: 'Sydney', year: 2026, date: '30 août 2026', region: 'pacific', finish: 'Blanc Épuré', title: 'Sydney. Face à l’océan.', alt: 'Mise en situation générée : un coureur en tenue turquoise tient son cadre blanc Sydney 2026 au bord du port, avec l’Opéra en arrière-plan.' },
  { id: 'london', city: 'Londres', year: 2026, date: '26 avril 2026', region: 'europe', finish: 'Bois Classique', title: 'Londres. Toujours cette envie.', alt: 'Mise en situation générée : un coureur âgé aux cheveux blancs et aux lunettes rondes présente son cadre en bois Londres 2026, près de l’arrivée sur le Mall.' },
  { id: 'boston', city: 'Boston', year: 2026, date: '20 avril 2026', region: 'americas', finish: 'Noir Premium', title: 'Boston. Un rêve encadré.', alt: 'Mise en situation générée : une coureuse en débardeur violet tient un cadre noir avec sa photo, son dossard et la médaille du 130e marathon de Boston.' },
  { id: 'paris', city: 'Paris', year: 2026, date: '12 avril 2026', region: 'europe', finish: 'Blanc Épuré', title: 'Paris. Tout commence ici.', alt: 'Mise en situation générée : une jeune coureuse rousse présente un cadre blanc personnalisé pour Paris 2026, près de l’arrivée avenue Foch.' },
  { id: 'rotterdam', city: 'Rotterdam', year: 2026, date: '12 avril 2026', region: 'europe', finish: 'Bois Classique', title: 'Rotterdam. À sa façon.', alt: 'Mise en situation générée : un athlète en fauteuil roulant tient son cadre en bois Rotterdam 2026, avec la médaille de la 45e édition et un dossard orange.' },
  { id: 'tokyo', city: 'Tokyo', year: 2026, date: '1er mars 2026', region: 'pacific', finish: 'Noir Premium', title: 'Tokyo. L’émotion intacte.', alt: 'Mise en situation générée : une coureuse japonaise aux cheveux courts tient un cadre noir Tokyo 2026, avec un dossard caritatif rose, devant la gare de Tokyo.' },
  { id: 'valencia', city: 'Valence', year: 2025, date: '7 décembre 2025', region: 'europe', finish: 'Blanc Épuré', title: 'Valence. Jusqu’au bout.', alt: 'Mise en situation générée : un coureur en débardeur orange présente son cadre blanc Valence 2025, près du bassin de la Cité des arts et des sciences.' },
  { id: 'new-york', city: 'New York', year: 2025, date: '2 novembre 2025', region: 'americas', finish: 'Bois Classique', title: 'New York. La joie, simplement.', alt: 'Mise en situation générée : une coureuse aux boucles argentées présente son cadre en bois New York 2025 sur un banc de Central Park.' },
];

export const GALLERY = scenes.map((scene) => ({
  ...scene,
  image: `/assets/runspark/gallery/${scene.id}-${scene.year}.webp`,
  thumbnail: `/assets/runspark/gallery/${scene.id}-${scene.year}-640.webp`,
  category: `${scene.city.toLocaleUpperCase('fr-FR')} · ${scene.year}`,
  detail: `${scene.date} · ${scene.finish}`,
}));

export const GALLERY_FILTERS = [
  { id: 'all', label: 'Tous les marathons' },
  { id: 'europe', label: 'Europe' },
  { id: 'americas', label: 'Amériques' },
  { id: 'pacific', label: 'Asie & Pacifique' },
];
