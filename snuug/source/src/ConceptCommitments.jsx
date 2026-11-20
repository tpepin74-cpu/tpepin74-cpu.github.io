import React from 'react';
import {Image, Arrow, Plus} from './Editorial';
import './concept-commitments.css';

function Commitment({number, title, children}) {
 return <details className="concept-commitment">
  <summary><span className="concept-commitment-number" aria-hidden="true">{number}</span><span>{title}</span><Plus/></summary>
  <div className="concept-commitment-body">{children}</div>
 </details>;
}

export default function ConceptCommitments() {
 return <section id="engagements" className="concept-commitments" aria-labelledby="concept-commitments-title">
  <div className="concept-commitments-heading">
   <div><span className="eyebrow">Nos engagements</span><h2 id="concept-commitments-title">SNUUG prend soin<br/>de son environnement.</h2></div>
   <p>Une suite s’inscrit dans un lieu, une économie et une communauté. De sa fabrication à votre séjour, nos choix relient confort, ressources et savoir-faire locaux.</p>
  </div>
  <div className="concept-commitment-list">
   <Commitment number="01" title="Une fabrication localement très engagée">
    <div className="concept-copy-columns">
     <article><h3>Swiss-mind.</h3><p>Conçue numériquement pour rationaliser la fabrication, la suite SNUUG réunit les savoir-faire et les entreprises de la région.</p></article>
     <article><h3>Swiss-made.</h3><p>Intégralement assemblée en usine à Porrentruy, elle fait la part belle au bois massif d’origine indigène. Regrouper la fabrication permet de coordonner les partenaires et les composants, avant l’installation dans le paysage.</p></article>
    </div>
   </Commitment>
   <Commitment number="02" title="L’hospitalité de nos Anges-Gardiens">
    <div id="services" className="concept-copy-columns">
     <article><h3>Un lieu. Des liens.</h3><p>Exploitants agricoles ou viticoles suisses, nos Anges-Gardiens sont équitablement rémunérés. Ils vous accueillent sur leurs terres, partagent leurs bonnes adresses et font découvrir leurs productions.</p><p>Eau, vins, produits laitiers, charcuteries : le séjour met en valeur les produits locaux et les paysages cultivés et entretenus qui les font naître.</p></article>
     <article><h3>Votre séjour sur le bout des doigts.</h3><p>Avant votre arrivée, vous recevez les informations d’accès et les coordonnées de votre Ange-Gardien. La Guest App rassemble les informations pratiques, les commandes et les idées de sorties. Votre interlocuteur local reste là pour vous accompagner.</p><a className="concept-text-link" href="/snuug/informations">Préparez votre séjour<Arrow/></a></article>
    </div>
   </Commitment>
   <Commitment number="03" title="Prendre soin de nos ressources naturelles">
    <div className="concept-resource-grid">
     <article><h3>Énergie & confort.</h3><p>Production solaire, double peau bioclimatique et ventilation automatique participent au confort de la suite. Le suivi de l’humidité et de la qualité de l’air accompagne un chauffage aux granulés jurassiens.</p></article>
     <article><h3>Eau & ressources.</h3><p>Gestion de l’eau de douche, toilettes à combustion sans eau et consommation raisonnée : la maîtrise des ressources se pense dès la conception, jusque dans le traitement des déchets.</p></article>
     <article><h3>Produits & mobilité.</h3><p>Les soins et produits d’entretien sont sélectionnés pour leur démarche écologique. Le train et le vélo électrique sont encouragés ; les voitures restent à distance de la suite pour préserver le calme du lieu.</p></article>
    </div>
   </Commitment>
   <Commitment number="04" title="Une diversité assumée des paysages">
    <p className="concept-commitment-intro">La nature, la vigne, le golf : chaque collection invite à habiter un paysage différent. Une même suite, une autre lumière, de nouvelles rencontres.</p>
    <div className="concept-landscape-links"><a className="concept-text-link" href="#snuug-nature">La nature<Arrow/></a><a className="concept-text-link" href="/snuug/sejours/neuchatel">Le golf<Arrow/></a></div>
    <div className="concept-vine-note"><h3>La vigne.</h3><p>Une collection à découvrir au fil des prochaines ouvertures. Les lieux et les dates seront annoncés par SNUUG.</p></div>
   </Commitment>
   <Commitment number="05" title="De grandes signatures suisses">
    <a className="concept-cj-logo-link" href="https://www.les-cj.ch/" target="_blank" rel="noreferrer" aria-label="Le site des Chemins de fer du Jura"><Image className="concept-cj-logo" src="/images/partners/chemins-de-fer-du-jura.svg" alt="Chemins de fer du Jura"/></a>
    <div className="concept-copy-columns">
     <article><h3>La rencontre fait le lieu.</h3><p>Les SNUUG Signature naissent d’une rencontre avec un partenaire suisse et son territoire. Elles donnent une expression singulière au concept : une suite, un paysage et une histoire à partager.</p></article>
     <article><h3>Première signature : les Chemins de fer du Jura.</h3><p>Au Noirmont, SNUUG-CJ invite à découvrir les Franches-Montagnes. Une adresse ouverte sur les pâturages, pour associer l’intimité d’une suite à l’exploration du Jura.</p><div className="concept-link-stack"><a className="concept-text-link" href="#snuug-cj">Découvrir SNUUG-CJ<Arrow/></a><a className="concept-text-link" href="https://www.les-cj.ch/" target="_blank" rel="noreferrer">Les Chemins de fer du Jura<Arrow/></a></div></article>
    </div>
   </Commitment>
  </div>
 </section>;
}
