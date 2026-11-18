import React,{useEffect,useRef,useState} from 'react';
import {motion,animate,useInView,useMotionValue,useReducedMotion,useTransform} from 'framer-motion';
import {Flag,Utensils,Waves,TrainFront,Trees,ArrowUpRight} from 'lucide-react';
import {Arrow} from './Editorial';
import animation from './itinerary-motion.json';
import './home-itinerary.css';
const stops=[
 {name:'SNUUG Golf',place:'Neuchâtel',icon:Flag,href:'/snuug/sejours/neuchatel',title:'Le grand air, pour commencer.',copy:'Une suite au Golf de Neuchâtel, à Saint-Blaise. Posez vos affaires, ouvrez la terrasse : votre échappée commence ici.',link:'Découvrir la suite'},
 {name:'Une table locale',place:'Le 19ème',icon:Utensils,href:'/snuug/sejours/neuchatel#alentours',title:'Le goût du lieu.',copy:'Une pause gourmande au restaurant du golf. Prenez le temps de vous retrouver à table, puis laissez la journée se prolonger.',link:'Explorer les bonnes adresses'},
 {name:'Le lac',place:'Neuchâtel',icon:Waves,href:'/snuug/sejours/neuchatel#alentours',title:'Suivre le bord de l’eau.',copy:'Une promenade sur les rives du lac de Neuchâtel, une lumière qui change, une pause face à l’horizon. Rien ne presse.',link:'Découvrir les alentours'},
 {name:'Les Franches-Montagnes',place:'Au rythme des CJ',icon:TrainFront,href:'https://www.les-cj.ch/',title:'Le voyage fait partie du séjour.',copy:'Poursuivez la découverte du Jura avec les Chemins de fer du Jura. Consultez les liaisons et horaires pour composer votre trajet.',link:'Explorer les voyages CJ'},
 {name:'SNUUG Noirmont',place:'Le Noirmont',icon:Trees,href:'/snuug/le-concept#snuug-cj',title:'Un autre paysage. Le même calme.',copy:'Retrouvez les pâturages et l’horizon des Franches-Montagnes. Au Noirmont, la SNUUG-CJ ouvre un nouveau chapitre.',link:'Découvrir SNUUG-CJ'}
];
function pointAt(progress){
 const position=Math.max(0,Math.min(animation.segments.length,progress));
 const index=Math.min(animation.segments.length-1,Math.floor(position)),t=position-index,u=1-t;
 const [a,b,c,d]=animation.segments[index];
 return [0,1].map(axis=>u*u*u*a[axis]+3*u*u*t*b[axis]+3*u*t*t*c[axis]+t*t*t*d[axis]);
}
function JourneyScene({active,visible,reduced}){
 const progress=useMotionValue(0);
 const x=useTransform(progress,v=>pointAt(v)[0]),y=useTransform(progress,v=>pointAt(v)[1]);
 const mobileY=useTransform(progress,v=>54+v*108);
 useEffect(()=>{
  if(reduced||!visible){progress.set(active);return;}
  const control=animate(progress,active,{duration:animation.selectionDuration,ease:animation.ease});
  return()=>control.stop();
 },[active,visible,reduced,progress]);
 const draw={initial:{pathLength:reduced?1:0},animate:{pathLength:visible||reduced?1:0},transition:{duration:reduced?0:animation.drawDuration,ease:animation.ease}};
 return <>
  <svg className="journey-landscape" viewBox="0 0 1000 240" preserveAspectRatio="none" aria-hidden="true">
   <path d={animation.landscape.ground} fill="#e8ebdf" opacity=".7"/>
   {animation.landscape.contours.map((d,i)=><path key={i} d={d} fill="none" stroke="#a7af94" strokeWidth="1" opacity=".35" vectorEffect="non-scaling-stroke"/>)}
   <path d={animation.path} className="journey-track"/><motion.path d={animation.path} className="journey-drawn" {...draw}/>
   {animation.stations.map(([cx,cy],i)=><g key={i}><path d={`M${cx} 98 V${cy-11}`} stroke="#a7af94" strokeWidth="1" opacity=".5"/><circle cx={cx} cy={cy} r="4" fill="#f3f4ed" stroke="#697452" strokeWidth="1.3"/></g>)}
   <motion.circle cx={x} cy={y} r="7" fill="#c5e241" stroke="#232a1b" strokeWidth="1.5"/>
  </svg>
  <svg className="journey-vertical" viewBox="0 0 40 540" preserveAspectRatio="none" aria-hidden="true">
   <path d="M20 54V486" className="journey-track"/><motion.path d="M20 54V486" className="journey-drawn" {...draw}/>
   {stops.map((_,i)=><circle key={i} cx="20" cy={54+i*108} r="4" fill="#f3f4ed" stroke="#697452" strokeWidth="1.3"/>)}
   <motion.circle cx="20" cy={mobileY} r="7" fill="#c5e241" stroke="#232a1b" strokeWidth="1.5"/>
  </svg>
 </>;
}
export default function HomeItinerary(){
 const [active,setActive]=useState(0),ref=useRef(null),buttons=useRef([]);
 const visible=useInView(ref,{amount:.15,once:true}),reduced=useReducedMotion();
 const stop=stops[active];
 const selectWithKey=(event,i)=>{
  let next;
  if(['ArrowRight','ArrowDown'].includes(event.key))next=(i+1)%stops.length;
  if(['ArrowLeft','ArrowUp'].includes(event.key))next=(i+stops.length-1)%stops.length;
  if(event.key==='Home')next=0;if(event.key==='End')next=stops.length-1;
  if(next===undefined)return;event.preventDefault();setActive(next);buttons.current[next]?.focus();
 };
 return <section id="a-vivre" ref={ref} className="home-itinerary journey-section" aria-labelledby="journey-title">
  <div className="journey-heading"><div><span className="eyebrow">D’une SNUUG à l’autre</span><h2 id="journey-title">Créez votre itinéraire.</h2></div><p>Deux suites. Quelques détours.<br/>Et tout le temps de profiter du chemin.</p></div>
  <div className="journey-map"><JourneyScene active={active} visible={visible} reduced={reduced}/>
   <ol className="journey-stops" aria-label="Les étapes de votre inspiration">{stops.map((s,i)=>{const Icon=s.icon;return <li key={s.name} className={i===active?'is-current':''}>
    <button type="button" ref={el=>buttons.current[i]=el} aria-pressed={i===active} aria-controls="journey-detail" onClick={()=>setActive(i)} onKeyDown={event=>selectWithKey(event,i)}>
     <motion.span className="journey-icon" animate={{y:i===active&&!reduced?-4:0}} transition={{duration:reduced?0:.3}}><Icon size={36} strokeWidth={1.25} aria-hidden="true"/></motion.span>
     <span className="journey-name">{s.name}</span><span className="journey-place">{s.place}</span>
    </button>
   </li>})}</ol>
  </div>
  <div id="journey-detail" className="journey-detail" aria-live="polite" aria-atomic="true">
   <div className="journey-detail-title"><span className="journey-index">{String(active+1).padStart(2,'0')} / 05</span><h3>{stop.title}</h3></div>
   <motion.div className="journey-detail-copy" key={active} initial={reduced?false:{opacity:0,y:7}} animate={{opacity:1,y:0}} transition={{duration:reduced?0:.3}}><p>{stop.copy}</p><a href={stop.href} target={stop.href.startsWith('https')?'_blank':undefined} rel={stop.href.startsWith('https')?'noreferrer':undefined}>{stop.link}<ArrowUpRight size={20} aria-hidden="true"/></a></motion.div>
  </div>
  <div className="journey-footer"><div className="journey-destinations"><a href={stops[0].href}>SNUUG Golf<ArrowUpRight size={16} aria-hidden="true"/></a><span aria-hidden="true">→</span><a href={stops[4].href}>SNUUG Noirmont<ArrowUpRight size={16} aria-hidden="true"/></a></div><a className="text-button" href="/snuug/experiences">Trouvez vos inspirations<Arrow/></a></div>
  <p className="journey-note">Un itinéraire d’inspiration à composer librement. Activités, repas et transports à réserver séparément, selon les disponibilités.</p>
 </section>;
}
