import Icon from './Icon.jsx';
import { chooseInspiration } from './commerce.js';
import { GALLERY } from './gallery-data.js';

export function EditorialPhoto({ city, sizes = '(max-width: 767px) 85vw, 33vw', className = '' }) {
  const scene = GALLERY.find(item => item.id === city);
  return <img className={className} src={scene.thumbnail} srcSet={`${scene.thumbnail} 640w, ${scene.image} 1536w`} sizes={sizes} width="1536" height="1024" alt={scene.alt} loading="lazy" decoding="async" />;
}

export function RaceBackdrop() {
  return <div className="hero-race-backdrop" aria-hidden="true"><img src="/assets/runspark/editorial/morning-run-1536.webp" srcSet="/assets/runspark/editorial/morning-run-800.webp 800w, /assets/runspark/editorial/morning-run-1536.webp 1536w" sizes="100vw" width="1536" height="1024" alt="" fetchPriority="low" decoding="async" /></div>;
}

export default function PhotoStories() {
  return <section className="photo-stories" aria-labelledby="photo-stories-title">
    <div className="photo-stories-heading"><div><p className="photo-eyebrow">BIEN PLUS QU’UN CHRONO</p><h2 id="photo-stories-title">La course s’arrête.<br /><span>L’émotion reste.</span></h2></div><a href="#galerie">Trouver mon inspiration <Icon name="arrow" size={19} /></a></div>
    <div className="photo-stories-track">
      {[
        ['paris', 'Paris', 'La première fois.'],
        ['sydney', 'Sydney', 'Le rêve accompli.'],
        ['new-york', 'New York', 'La fierté intacte.'],
      ].map(([id, city, title]) => <a className={'photo-story photo-story-' + id} href="#config" key={id} onClick={() => chooseInspiration(id === 'new-york' ? 'bois' : 'blanc', id)} aria-label={`${city}, personnaliser un cadre dans ce style`}><EditorialPhoto city={id} /><div className="photo-story-caption"><span>{city}</span><strong>{title}</strong><small>Personnaliser ce cadre</small><Icon name="arrow" size={22} /></div></a>)}
    </div>
    <p className="photo-stories-note">Scènes d’inspiration générées · Athlètes fictifs.</p>
  </section>;
}
