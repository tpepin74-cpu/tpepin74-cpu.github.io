import React,{useRef} from 'react';
import {motion,useScroll,useTransform,useReducedMotion} from 'framer-motion';
import {Image,Arrow,Reveal} from './Editorial';
import {photos} from './data';
import './stay-visuals.css';

function MovingPhoto({src,alt,className='',eager=false,children}){
  const ref=useRef(null),reduced=useReducedMotion();
  const {scrollYProgress}=useScroll({target:ref,offset:['start end','end start']});
  const y=useTransform(scrollYProgress,[0,1],['-3%','3%']);
  const scale=useTransform(scrollYProgress,[0,1],[1.025,1.08]);
  return <figure ref={ref} className={'stay-moving-photo '+className}>
    <motion.div className="stay-photo-layer" style={{y:reduced?0:y,scale:reduced?1:scale}}><Image src={src} alt={alt} eager={eager}/></motion.div>
    {children&&<figcaption>{children}</figcaption>}
  </figure>;
}
export function StayPanorama(){return <div className="stay-panorama"><MovingPhoto src={photos.horizon} alt="Le petit-déjeuner sur la terrasse SNUUG, face au paysage de Neuchâtel" eager><span className="eyebrow">LE LUXE DE PRENDRE SON TEMPS</span><p>Vous êtes<br/><i>déjà ailleurs.</i></p><a href="#moments" className="stay-photo-link">Le séjour en images<Arrow direction="down"/></a></MovingPhoto><div className="stay-photo-caption"><span>NEUCHÂTEL, SUISSE</span><span>UNE SUITE. DEUX PERSONNES. VOTRE RYTHME.</span></div></div>}
const moments=[
  {number:'01',time:'DÈS 15 H',title:'Arriver. Souffler.',image:photos.exterior,alt:'La suite SNUUG indépendante, au cœur du paysage',copy:'Les derniers pas depuis le stationnement. La porte qui s’ouvre. Votre parenthèse commence.',link:'#arrivee',cta:'Préparer mon arrivée'},
  {number:'02',time:'À VOTRE RYTHME',title:'Habiter l’instant.',image:photos.suite,alt:'La méridienne, le lit et la grande baie vitrée de la suite SNUUG',copy:'Un livre dans la méridienne, une pause à deux, le paysage pour horizon. Rien ne presse.',link:'#votre-suite',cta:'Tout savoir sur la suite'},
  {number:'03',time:'DÈS 7 H 30',title:'Prolonger le matin.',image:photos.tea,alt:'Le mini-brunch SNUUG avec fruits, pains et produits gourmands',copy:'Le petit-déjeuner vous attend dans le coffre extérieur. À vous de choisir combien de temps dure le matin.',link:'#prestations',cta:'Les petites attentions'}
];
export function StayMoments(){return <section id="moments" className="stay-moments page-container"><Reveal className="stay-moments-heading"><span className="eyebrow">LE FIL DE VOTRE ÉCHAPPÉE</span><h2>Moins d’horaires.<br/><i>Plus d’instants.</i></h2></Reveal><div className="stay-moments-grid">{moments.map((m,i)=><Reveal className="stay-moment" key={m.number} delay={i*.1}><MovingPhoto src={m.image} alt={m.alt}><span className="stay-moment-number">{m.number}</span></MovingPhoto><div className="stay-moment-copy"><span className="eyebrow">{m.time}</span><h3>{m.title}</h3><p>{m.copy}</p><a className="text-button" href={m.link}>{m.cta}<Arrow/></a></div></Reveal>)}</div></section>}
export function StayBreathingSpace(){return <section className="stay-breathing-space"><MovingPhoto src={photos.forest} alt="La lumière et les arbres autour du domaine SNUUG"><Reveal><span className="eyebrow">ENTRE DEUX ENVIES</span><h2>Le plus beau programme ?<br/><i>Le vôtre.</i></h2><a className="button light" href="/snuug/experiences">Trouver mon inspiration<Arrow/></a></Reveal></MovingPhoto></section>}
