import {DestinationPacks,NewsAndPress} from './DestinationStories';
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

function ConceptOverview(){return <section id="concept" className="content-split page-container grouped-concept"><div><span className="eyebrow">The supernature hotel</span><h2>Un hôtel qui change<br/>de paysage.</h2></div><div><p className="concept-lead">Une suite pour deux. Un lieu qui compte. Une autre façon d’habiter l’instant.</p><details className="quiet-disclosure"><summary>L’esprit SNUUG<Plus/></summary><p>Une suite indépendante, installée dans un cadre remarquable puis amenée à changer de décor. La Suisse offre à cette collection toute sa diversité de paysages.</p><p>Le premier chapitre se vit au Golf de Neuchâtel. SNUUG-CJ vous accueille aussi au Noirmont, dans le Jura.</p></details><details className="quiet-disclosure"><summary>Les Anges-Gardiens<Plus/></summary><p>Votre séjour se prépare avec la Guest App et votre Ange-Gardien. Paysans, vignerons ou exploitants locaux, ces hôtes partagent leur connaissance du domaine et de ses produits.</p></details></div></section>}
export function DiscoverPage(){return <SuitePage navigation={<PageSections items={[["Le concept","concept"],["La suite","suite"],["Les détails","equipements"],["Signature","signature"],["Nos engagements","engagements"]]}/>} beforeSuite={<ConceptOverview/>} afterSuite={<div className="grouped-folds page-container"><Fold id="design-histoire" label="LES MATIÈRES / UNE INSPIRATION" title="Un refuge se vit. Il se ressent."><Reading id="design"/></Fold><Fold id="engagements" label="LA FABRICATION & LE TERRITOIRE" title="Habiter un paysage. En prendre soin."><SustainabilityPage embedded/></Fold></div>}/>}

export function InspirationPage(){return <><PageIntro eyebrow="Les expériences" title="Suivre une envie." italic="Trouver son rythme."/><PageSections items={experiences.map(e=>[e.label,e.id])}/><div className="refined-experiences">{experiences.map((e,i)=><section className={'refined-experience '+(i%2?'reverse':'')} id={e.id} key={e.id}><Image src={e.image} alt={e.label}/><div><span className="eyebrow">{String(i+1).padStart(2,'0')} · Les expériences SNUUG</span><h2>{e.label}</h2><p>{e.intro}</p><details className="quiet-disclosure"><summary>Imaginer ce séjour<Plus/></summary><p>{e.description}</p>{e.itinerary.map(([time,title,copy])=><article key={time}><span className="eyebrow">{time}</span><h3>{title}</h3><p>{copy}</p></article>)}<p className="fineprint">Suggestions à confirmer auprès des partenaires. Repas, activités et attentions peuvent faire l’objet de suppléments. Les collections Nature et Vigne sont à venir.</p><a className="text-button" href={'/snuug/reservation?experience='+e.id}>Choisir mon séjour<Arrow/></a></details></div></section>)}</div><div className="page-container"><details className="quiet-disclosure packs-fold"><summary>Les packs et les partenaires<Plus/></summary><DestinationPacks/></details></div><section id="inspirations" className="grouped-folds page-container">{articles.filter(a=>a.id!=='design').map(a=><Fold key={a.id} id={a.id} label={a.category} title={a.title.replace('\n',' ')}><Reading id={a.id}/></Fold>)}</section><PageCTA/></>}

export function StayGuidePage(){return <><PageIntro eyebrow="VOTRE SÉJOUR / TOUT SIMPLEMENT" title="Votre séjour," italic="tout simplement." copy="Du premier message au dernier café : les services, les réponses à vos questions et l’équipe pour vous accompagner."/><StayPanorama/><PageSections items={[["Au fil du temps","moments"],["Autour de vous","agenda"],["La Guest App & la table","services"],["Questions fréquentes","questions"],["Les conditions","conditions"],["Nous contacter","contact"]]}/><StayMoments/><section className="brand-around page-container"><span className="eyebrow">autour de vous</span><h2>La région vous attend.</h2><p>Culture, sport, découvertes et bonnes tables : composez votre programme autour de Neuchâtel.</p><a className="text-button" href="/snuug/sejours/neuchatel#alentours">Les activités autour de la suite<Arrow/></a></section><Agenda/><div className="grouped-folds page-container"><Fold id="services" label="LA GUEST APP & LES ATTENTIONS" title="Votre séjour, du début à la fin."><StayLifePage embedded/></Fold></div><div className="grouped-folds page-container"><Fold id="questions" label="Les réponses essentielles" title="Vos questions, nos réponses."><PracticalPage embedded/></Fold></div><div className="grouped-folds page-container"><Fold id="conditions" label="AVANT DE RÉSERVER" title="Les conditions, en toute clarté."><p className="fold-intro">Les points essentiels des conditions publiées par SNUUG. Consultez toujours les modalités présentées avec votre offre avant de confirmer.</p><ConditionsPage embedded/></Fold></div><section id="contact" className="grouped-contact"><div className="grouped-heading page-container"><span className="eyebrow">L’ÉQUIPE EST À VOTRE ÉCOUTE</span><h2>Une question.<br/><i>Une envie.</i></h2></div><ContactPage embedded/></section><div className="grouped-folds page-container"><Fold id="journal-presse" label="La vie de SNUUG" title="Actualités et espace presse"><NewsAndPress/></Fold></div></>}

export function LegalInformationPage(){return <><LegalPage/><section id="confidentialite" className="grouped-privacy"><PrivacyPage embedded/></section></>}
