import EditorialHero from './EditorialHero';
import {scrollToAnchor} from './anchorNavigation';
import {DestinationPacks} from './DestinationStories';
import {Agenda} from './Agenda';
import React,{useEffect} from 'react';
import {Image,Arrow,Plus} from './Editorial';
import {SuitePage,PrivacyPage} from './Pages';
import {PracticalPage,ConditionsPage,LegalPage} from './Content';
import {experiences,articles} from './data';
import './grouped.css';
import {StayMoments} from './StayVisuals';
import {ExperienceCards} from './ExperienceCards';
import DepartureCTA from './DepartureCTA';

export function PageSections({items}){return <nav className="page-sections page-container" aria-label="Dans cette page">{items.map(([label,id])=><a key={id} href={'#'+id}>{label}<Arrow direction="right"/></a>)}</nav>}
export function Reading({id}){const article=articles.find(a=>a.id===id);return <div className="grouped-reading"><Image src={article.image} alt={article.title.replace('\n',' ')}/><div><p className="serif-lead">{article.intro}</p>{article.paragraphs.map(p=><p key={p}>{p}</p>)}</div></div>}
export function Fold({id,label,title,children}){return <details id={id} className="editorial-fold"><summary><span><small className="eyebrow">{label}</small><h2>{title}</h2></span><Plus/></summary><div className="fold-body">{children}</div></details>}
// Deep links open their containing disclosure, including nested questions, before scrolling.
export function DeepLink(){useEffect(()=>{
  let timer;
  const reveal=(hash=window.location.hash,behavior='instant')=>{
    let id;try{id=decodeURIComponent(hash.slice(1))}catch{return}
    if(!id)return;const target=document.getElementById(id);if(!target)return;
    let element=target;while(element){if(element.tagName==='DETAILS')element.open=true;element=element.parentElement}
    cancelAnimationFrame(timer);timer=requestAnimationFrame(()=>scrollToAnchor(target,behavior));
  };
  const hashchange=()=>reveal();
  const click=event=>{
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const link=event.target.closest?.('a[href]');if(!link||link.target==='_blank')return;
    const url=new URL(link.href,location.href);
    if(url.origin===location.origin&&url.pathname.replace(/\/$/,'')===location.pathname.replace(/\/$/,'')&&url.search===location.search&&url.hash){
      let target;try{target=document.getElementById(decodeURIComponent(url.hash.slice(1)))}catch{return}
      if(!target)return;event.preventDefault();
      if(location.hash!==url.hash)history.pushState({...history.state},'',url.hash);
      reveal(url.hash,'smooth');
    }
  };
  reveal();window.addEventListener('hashchange',hashchange);document.addEventListener('click',click);
  return()=>{cancelAnimationFrame(timer);window.removeEventListener('hashchange',hashchange);document.removeEventListener('click',click)};
},[]);return null}

function ConceptOverview(){return <section id="concept" className="content-split page-container grouped-concept"><div><span className="eyebrow">The supernature hotel</span><h2>Un hôtel qui change<br/>de paysage.</h2></div><div><p className="concept-lead">Une suite pour deux. Un lieu qui compte. Une autre façon d’habiter l’instant.</p><details className="quiet-disclosure"><summary>L’esprit SNUUG<Plus/></summary><p>Une suite indépendante, installée dans un cadre remarquable puis amenée à changer de décor. La Suisse offre à cette collection toute sa diversité de paysages.</p><p>Le premier chapitre se vit au Golf de Neuchâtel. SNUUG-CJ vous accueille aussi au Noirmont, dans le Jura.</p></details><details className="quiet-disclosure"><summary>Les Anges-Gardiens<Plus/></summary><p>Votre séjour se prépare avec la Guest App et votre Ange-Gardien. Paysans, vignerons ou exploitants locaux, ces hôtes partagent leur connaissance du domaine et de ses produits.</p></details></div></section>}
export function DiscoverPage(){return <SuitePage/>}


export function InspirationPage(){return <>
  <EditorialHero eyebrow="Les expériences SNUUG" title="Rien à prévoir." second="Tout à ressentir." copy="Quatre façons de vivre deux jours ailleurs. À vous de choisir votre rythme." image="/images/official/golf-1574.webp" alt="Petit-déjeuner à deux sur la terrasse SNUUG" href={'#'+experiences[0].id} label="Trouver votre rythme"/>
  <PageSections items={[...experiences.map(e=>[e.id==='golf'?'Escapade sportive':e.label,e.id]),['Les packs','packs']]}/>
  <ExperienceCards/>
  <div className="experience-packs page-container"><details id="packs" className="quiet-disclosure packs-fold"><summary>Les packs et les partenaires<Plus/></summary><DestinationPacks id="packs-details"/></details></div>
  <DepartureCTA/>
</>}


export function StayGuidePage(){return <>
  <EditorialHero eyebrow="Votre séjour" title="Le temps est à vous." second="On pense au reste." copy="Des premières envies au dernier café, préparez votre parenthèse." image="/images/official/golf-1575.webp" alt="Un petit-déjeuner dans le lit de la suite SNUUG" href="#moments" label="Vivre le séjour"/>
  <PageSections items={[["Au fil du temps","moments"],["Autour de vous","agenda"],["Questions fréquentes","questions"],["Les conditions","conditions"]]}/>
  <StayMoments/>
  <Agenda/>
  <div className="grouped-folds stay-guide-folds page-container">
    <Fold id="questions" label="Les réponses essentielles" title="Toutes vos questions sur tout."><PracticalPage embedded/></Fold>
    <Fold id="conditions" label="Avant de réserver" title="Les conditions en toute clarté."><p className="fold-intro">Les points essentiels des conditions publiées par SNUUG. Consultez toujours les modalités présentées avec votre offre avant de confirmer.</p><ConditionsPage embedded/></Fold>
  </div>
</>}


export function LegalInformationPage(){return <><LegalPage/><section id="confidentialite" className="grouped-privacy"><PrivacyPage embedded/></section></>}
