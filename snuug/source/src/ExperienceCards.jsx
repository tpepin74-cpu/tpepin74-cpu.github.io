import React,{useState,useEffect,useRef} from 'react';
import {scrollToAnchor} from './anchorNavigation';
import {Image,Arrow} from './Editorial';
import {experiences} from './data';
import './experience-stay-client.css';
const programs={
 amoureux:[['Jour 1','Se retrouver','Installation dès 15 h, une pause sur la terrasse et une soirée à deux. Préparez votre dîner ou une attention particulière avec l’équipe.'],['Jour 2','Faire durer le matin','Petit-déjeuner au calme, quelques pages ou une promenade. Après le départ de la suite, prolongez la journée dans la région.']],
 vacances:[['Jour 1','Goûter au lieu','Installation dans la suite, découverte des produits locaux puis dîner dans une table des environs, sur réservation.'],['Jour 2','Explorer le terroir','Petit-déjeuner, puis balade dans les vignes ou rencontre avec un producteur. Demandez à votre Ange-Gardien ses adresses et les horaires de visite.']],
 deconnexion:[['Jour 1','Ralentir','Posez vos affaires, rangez le téléphone et partez marcher. Au retour, la lumière, un livre et le calme de votre suite.'],['Jour 2','Observer','Laissez le matin s’installer autour d’un petit-déjeuner. Après votre départ, choisissez une promenade et une pause face au paysage.']],
 golf:[['Jour 1','Prendre le grand air','Prévoyez une partie de golf ou une randonnée, puis retrouvez votre suite dès 15 h. Une soirée tranquille pour récupérer.'],['Jour 2','Suivre une nouvelle envie','Petit-déjeuner, puis nouvelle sortie à pied ou à vélo selon la météo. L’équipe peut vous orienter vers les parcours adaptés.']]
};
export function ExperienceCards(){return <div className="experience-card-grid page-container">{experiences.map(e=><ExperienceCard key={e.id} experience={e}/>)}</div>}
function ExperienceCard({experience:e}){
 const card=useRef(null);
 const [open,setOpen]=useState(false),title=e.id==='golf'?'Escapade sportive':e.label;
 useEffect(()=>{if(!open)return;const frame=requestAnimationFrame(()=>scrollToAnchor(card.current,'smooth'));return()=>cancelAnimationFrame(frame)},[open]);
 return <section ref={card} className={'experience-flip-card '+(open?'is-open':'')} id={e.id} aria-labelledby={'experience-'+e.id}>
  {!open&&<Image src={e.image} alt={e.label+' dans un paysage SNUUG'}/>}
  <div className="experience-card-content">
   {open&&<span className="eyebrow">Un exemple sur deux jours</span>}
   <h2 id={'experience-'+e.id}>{title}</h2>
   {open?<div id={'programme-'+e.id} className="experience-program">{programs[e.id].map(([day,title,copy])=><article key={day}><span className="eyebrow">{day}</span><h3>{title}</h3><p>{copy}</p></article>)}<p className="experience-program-note">Une inspiration à personnaliser. Activités, repas et attentions selon les disponibilités, à réserver séparément lorsqu’ils ne sont pas inclus.</p><a className="text-button" href={'/snuug/reservation?experience='+e.id}>Choisir mes dates<Arrow/></a></div>:null}
   <button type="button" className="experience-program-toggle text-button" aria-expanded={open} aria-controls={open?'programme-'+e.id:undefined} onClick={()=>setOpen(v=>!v)}>{open?'Revenir à la photo':'Voir le programme'}<Arrow direction={open?'left':'right'}/></button>
  </div>
 </section>
}
