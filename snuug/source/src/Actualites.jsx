import React from 'react';
import EditorialHero from './EditorialHero';
import {Image} from './Editorial';
import {PageSections} from './GroupedPages';
import InlineArrow from './InlineArrow';
import DepartureCTA from './DepartureCTA';
import {imageAsset} from './image-assets';
import './actualites.css';

const stories=[
  {
    category:'Carnet de destination · Neuchâtel',
    title:'Du green au grand calme.',
    copy:'Au Golf de Neuchâtel, la suite ouvre sur le paysage. Le parcours, la table du 19ème et les rives du lac invitent à composer votre journée.',
    image:'/images/official/golf-1540.webp',
    alt:'La suite SNUUG et les espaces verts du Golf de Neuchâtel',
    href:'/snuug/sejours/neuchatel',
    label:'Découvrir Neuchâtel'
  },
  {
    category:'Le concept · Design & hospitalité',
    title:'L’essentiel, dans chaque détail.',
    copy:'Une suite indépendante, un intérieur en bois, une terrasse à soi. SNUUG réunit le confort d’un hôtel et la proximité du paysage, avec l’attention de ses Anges-Gardiens.',
    image:'/images/official/golf-1997.webp',
    alt:'Le lit et le salon de la suite SNUUG dans un intérieur en bois',
    href:'/snuug/le-concept',
    label:'Comprendre le concept'
  }
];

function StoryLink({href,children}){return <a className="text-button" href={href}>{children}<InlineArrow/></a>}

export default function ActualitesPage(){
  return <div className="actualites-page">
    <EditorialHero
      eyebrow="Actualité & presse"
      title="Les lieux."
      second="Les liens."
      copy="Des paysages, des rencontres et une autre idée de l’hospitalité."
      image="/images/official/noirmont-1982.webp"
      alt="La terrasse de la SNUUG du Noirmont ouverte sur les pâturages du Jura"
      href="#actualite"
      label="Découvrir"
    />
    <PageSections items={[["Actualité","actualite"],["Espace presse","presse"]]}/>

    <section id="actualite" className="actualites-journal page-container" aria-labelledby="actualites-title">
      <div className="actualites-heading"><span className="eyebrow">Le journal SNUUG</span><h2 id="actualites-title">L’esprit des lieux.</h2></div>
      <article className="actualites-feature">
        <a className="actualites-photo" href="/snuug/le-concept#snuug-cj" aria-label="Découvrir SNUUG-CJ au Noirmont"><Image src="/images/official/noirmont-1979.webp" alt="La SNUUG-CJ installée au milieu des pâturages du Noirmont"/></a>
        <div className="actualites-feature-copy">
          <span className="eyebrow">Signature · Le Noirmont</span>
          <h3>SNUUG-CJ.<br/>Le Jura autrement.</h3>
          <p>Au Noirmont, la rencontre avec les Chemins de fer du Jura prolonge le voyage jusque dans le séjour. Une suite au cœur des Franches-Montagnes, pour retrouver le goût du paysage et du temps partagé.</p>
          <StoryLink href="/snuug/le-concept#snuug-cj">Découvrir SNUUG-CJ</StoryLink>
        </div>
      </article>
      <div className="actualites-cards">
        {stories.map(story=><article className="actualites-card" key={story.href}>
          <a className="actualites-photo" href={story.href} aria-label={story.label}><Image src={story.image} alt={story.alt}/></a>
          <div className="actualites-card-copy"><span className="eyebrow">{story.category}</span><h3>{story.title}</h3><p>{story.copy}</p><StoryLink href={story.href}>{story.label}</StoryLink></div>
        </article>)}
      </div>
    </section>

    <section id="presse" className="actualites-press" aria-labelledby="press-title">
      <div className="page-container">
        <div className="actualites-press-heading"><div><span className="eyebrow">Espace presse</span><h2 id="press-title">Raconter SNUUG.</h2></div><p>Les repères de la marque et un contact direct pour préparer votre sujet.</p></div>
        <div className="actualites-press-grid">
          <div className="actualites-facts">
            <h3>Quelques repères.</h3>
            <dl>
              <div><dt>Le concept</dt><dd>Des suites indépendantes installées dans des paysages choisis.</dd></div>
              <div><dt>Le format</dt><dd>20 m² intérieurs, une terrasse de 5 m² et un accueil pour deux personnes.</dd></div>
              <div><dt>Les lieux</dt><dd>Le Golf de Neuchâtel et Le Noirmont, dans les Franches-Montagnes.</dd></div>
              <div><dt>L’accueil</dt><dd>Les Anges-Gardiens accompagnent le séjour et partagent leur connaissance du territoire.</dd></div>
            </dl>
            <StoryLink href="/snuug/le-concept">Explorer le concept</StoryLink>
          </div>
          <div className="actualites-resources">
            <Image className="actualites-press-logo" src="/images/brand/snuug-official.webp" alt="SNUUG"/>
            <div><h3>Les ressources de la marque.</h3><p>Téléchargez le logo officiel. Pour les photographies haute définition, leurs crédits ou une interview, contactez l’équipe SNUUG.</p></div>
            <div className="actualites-resource-links">
              <a className="text-button" href={imageAsset('/images/brand/snuug-official.webp')} download="SNUUG-logo-officiel.webp">Télécharger le logo <InlineArrow/></a>
              <a className="text-button" href="mailto:hello@snuug.ch?subject=Demande%20presse%20SNUUG">hello@snuug.ch <InlineArrow/></a>
            </div>
            <p className="fineprint">Logo au format WebP. Pour la reproduction de photographies ou de contenus de marque, les droits d’utilisation et les crédits sont à convenir avec SNUUG.</p>
          </div>
        </div>
      </div>
    </section>
    <DepartureCTA/>
  </div>;
}
