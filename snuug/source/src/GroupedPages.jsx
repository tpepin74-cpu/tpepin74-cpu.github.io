import {Agenda} from './Agenda';
import React,{useEffect} from 'react';
import {Image,Arrow,Plus,Reveal} from './Editorial';
import {SuitePage,PageIntro,PageCTA,PrivacyPage} from './Pages';
import {SustainabilityPage,StayLifePage,PracticalPage,ConditionsPage,ContactPage,LegalPage} from './Content';
import {experiences,articles} from './data';
import './grouped.css';
import {StayPanorama,StayMoments,StayBreathingSpace} from './StayVisuals';

export function PageSections({items}){return <nav className="page-sections page-container" aria-label="Dans cette page">{items.map(([label,id])=><a key={id} href={'#'+id}>{label}<Arrow direction="right"/></a>)}</nav>}
export function Reading({id}){const article=articles.find(a=>a.id===id);return <div className="grouped-reading"><Image src={article.image} alt={article.title.replace('\n',' ')}/><div><p className="serif-lead">{article.intro}</p>{article.paragraphs.map(p=><p key={p}>{p}</p>)}</div></div>}
export function Fold({id,label,title,children}){return <details id={id} className="editorial-fold"><summary><span><small className="eyebrow">{label}</small><h2>{title}</h2></span><Plus/></summary><div className="fold-body">{children}</div></details>}
// Deep links open their containing disclosure, including nested questions, before scrolling.
export function DeepLink(){useEffect(()=>{
  let timer;
  const reveal=(hash=window.location.hash)=>{
    let id;try{id=decodeURIComponent(hash.slice(1))}catch{return}
    if(!id)return;const target=document.getElementById(id);if(!target)return;
    let element=target;while(element){if(element.tagName==='DETAILS')element.open=true;element=element.parentElement}
    cancelAnimationFrame(timer);timer=requestAnimationFrame(()=>target.scrollIntoView({behavior:'instant',block:'start'}));
  };
  const hashchange=()=>reveal();
  const click=event=>{
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const link=event.target.closest?.('a[href]');if(!link||link.target==='_blank')return;
    const url=new URL(link.href,location.href);
    if(url.origin===location.origin&&url.pathname===location.pathname&&url.search===location.search&&url.hash)reveal(url.hash);
  };
  reveal();window.addEventListener('hashchange',hashchange);document.addEventListener('click',click);
  return()=>{cancelAnimationFrame(timer);window.removeEventListener('hashchange',hashchange);document.removeEventListener('click',click)};
},[]);return null}

function ConceptOverview(){return <section id="concept" className="content-split page-container grouped-concept"><div><span className="eyebrow">LE CONCEPT / THE SUPERNATURE HOTEL</span><h2>Un hôtel qui change<br/>de <i>paysage.</i></h2></div><div><p>SNUUG développe une hôtellerie éphémère : une suite pour deux, autonome, installée dans un cadre remarquable puis amenée à changer de décor. La Suisse offre à cette collection sa diversité de paysages.</p><p>Le premier chapitre se vit au Golf de Neuchâtel. Les collections Nature et Vignes sont annoncées pour la suite.</p><p>Sans réception centrale ni concierge traditionnel, votre séjour se prépare avec la Guest App et votre Ange-Gardien. Paysans, vignerons ou exploitants locaux, ces hôtes vous accueillent et partagent leur connaissance du domaine et de ses produits.</p><a className="text-button" href="/snuug/informations#services">Le déroulement de votre séjour<Arrow/></a></div></section>}
export function DiscoverPage(){return <SuitePage navigation={<PageSections items={[["Le concept","concept"],["La suite","suite"],["Les détails","equipements"],["Nos engagements","engagements"]]}/>} beforeSuite={<ConceptOverview/>} afterSuite={<div className="grouped-folds page-container"><Fold id="design-histoire" label="LES MATIÈRES / UNE INSPIRATION" title="Un refuge se vit. Il se ressent."><Reading id="design"/></Fold><Fold id="engagements" label="LA FABRICATION & LE TERRITOIRE" title="Habiter un paysage. En prendre soin."><SustainabilityPage embedded/></Fold></div>}/>}

export function InspirationPage(){return <><PageIntro eyebrow="LES EXPÉRIENCES SNUUG" title="On part pour une envie." italic="On revient avec une histoire." copy="Se retrouver. Explorer. Déconnecter. Jouer. Choisissez votre façon de vivre le même luxe : du temps pour soi."/><PageSections items={experiences.map(e=>[e.label,e.id])}/><div className="grouped-experiences page-container">{experiences.map((e,i)=><section className={'grouped-experience '+(i%2?'reverse':'')} id={e.id} key={e.id}><Reveal className="grouped-experience-photo"><Image src={e.image} alt={e.label+' chez SNUUG'}/><span>{e.number} / {e.duration}</span></Reveal><div className="grouped-experience-copy"><span className="eyebrow">{e.label.toUpperCase()} / {e.kicker}</span><h2>{e.title}</h2><p className="experience-lead">{e.intro}</p><p>{e.description}</p><details className="experience-itinerary"><summary>Imaginez votre séjour<Plus/></summary><div>{e.itinerary.map(([time,title,copy])=><article key={time}><span className="eyebrow">{time}</span><h3>{title}</h3><p>{copy}</p></article>)}<p className="fineprint">Suggestions de séjour. Repas, activités et attentions à confirmer avec l’équipe, selon les disponibilités et les éventuels suppléments.</p></div></details><a className="text-button" href={'/snuug/reservation?experience='+e.id}>Vivre cette échappée<Arrow/></a></div></section>)}</div><section id="inspirations" className="grouped-folds page-container"><div className="grouped-heading"><span className="eyebrow">À LIRE, À RESSENTIR</span><h2>Quelques idées pour<br/><i>changer de rythme.</i></h2></div>{articles.filter(a=>a.id!=='design').map(a=><Fold key={a.id} id={a.id} label={a.category} title={a.title.replace('\n',' ')}><Reading id={a.id}/></Fold>)}</section><section className="grouped-region page-container"><span className="eyebrow">VOTRE REFUGE, VOTRE POINT DE DÉPART</span><h2>Le lac. Les vignes.<br/><i>Tout un ailleurs.</i></h2><a className="text-button" href="/snuug/sejours/neuchatel#alentours">Les découvertes autour de Neuchâtel<Arrow/></a></section><PageCTA/></>}

export function StayGuidePage(){return <><PageIntro eyebrow="VOTRE SÉJOUR / TOUT SIMPLEMENT" title="Partir l’esprit" italic="léger." copy="Du premier message au dernier café : les services, les réponses à vos questions et l’équipe pour vous accompagner."/><StayPanorama/><PageSections items={[["L’agenda","agenda"],["Les services","services"],["Questions fréquentes","questions"],["Les conditions","conditions"],["Nous contacter","contact"]]}/><StayMoments/><Agenda/><div className="grouped-folds page-container"><Fold id="services" label="LA GUEST APP & LES ATTENTIONS" title="Votre séjour, du début à la fin."><StayLifePage embedded/></Fold></div><section id="questions" className="grouped-faq"><div className="grouped-heading page-container"><span className="eyebrow">LES RÉPONSES ESSENTIELLES</span><h2>Avant de fermer<br/><i>la valise.</i></h2></div><PracticalPage embedded/></section><div className="grouped-folds page-container"><Fold id="conditions" label="AVANT DE RÉSERVER" title="Les conditions, en toute clarté."><p className="fold-intro">Les points essentiels des conditions publiées par SNUUG. Consultez toujours les modalités présentées avec votre offre avant de confirmer.</p><ConditionsPage embedded/></Fold></div><StayBreathingSpace/><section id="contact" className="grouped-contact"><div className="grouped-heading page-container"><span className="eyebrow">L’ÉQUIPE EST À VOTRE ÉCOUTE</span><h2>Une question.<br/><i>Une envie.</i></h2></div><ContactPage embedded/></section><PageCTA/></>}

export function LegalInformationPage(){return <><LegalPage/><section id="confidentialite" className="grouped-privacy"><PrivacyPage embedded/></section></>}
