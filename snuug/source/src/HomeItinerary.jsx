import React,{useEffect,useRef,useState} from 'react';
import {motion,animate,useInView,useMotionValue,useReducedMotion,useTransform} from 'framer-motion';
import {Flag,Utensils,Waves,TrainFront,Trees,ArrowUpRight} from 'lucide-react';
import animation from './itinerary-motion.json';
import './home-itinerary.css';
const stops=[
 {name:'Golf de Neuchâtel',icon:Flag,href:'/snuug/sejours/neuchatel',link:'Découvrir SNUUG Golf'},
 {name:'Le 19ème',icon:Utensils,href:'/snuug/sejours/neuchatel#alentours',link:'Découvrir la table locale'},
 {name:'Lac de Neuchâtel',icon:Waves,href:'/snuug/sejours/neuchatel#alentours',link:'Découvrir les alentours'},
 {name:'Les CJ',icon:TrainFront,href:'https://www.les-cj.ch/',link:'Voyager avec les CJ'},
 {name:'Le Noirmont',icon:Trees,href:'/snuug/le-concept#snuug-cj',link:'Découvrir SNUUG-CJ'}
];
function JourneyLine({active,visible,reduced}){
 const progress=useMotionValue(0);
 const x=useTransform(progress,v=>100+v*200),mobileY=useTransform(progress,v=>32+v*64);
 useEffect(()=>{
  if(reduced||!visible){progress.set(active);return;}
  const control=animate(progress,active,{duration:animation.selectionDuration,ease:animation.ease});
  return()=>control.stop();
 },[active,visible,reduced,progress]);
 const draw={initial:{pathLength:reduced?1:0},animate:{pathLength:visible||reduced?1:0},transition:{duration:reduced?0:animation.drawDuration,ease:animation.ease}};
 return <>
  <svg className="journey-line" viewBox="0 0 1000 144" preserveAspectRatio="none" aria-hidden="true">
   <path d="M100 62H900" className="journey-track"/>
   <motion.path d="M100 62H900" className="journey-drawn" {...draw}/>
   {stops.map((_,i)=><circle key={i} cx={100+i*200} cy="62" r="2.5" fill="#fff" stroke="#9ca38f"/>)}
   <motion.circle cx={x} cy="62" r="5" fill="#b7d331"/>
  </svg>
  <svg className="journey-vertical" viewBox="0 0 24 320" preserveAspectRatio="none" aria-hidden="true">
   <path d="M12 32V288" className="journey-track"/>
   <motion.path d="M12 32V288" className="journey-drawn" {...draw}/>
   {stops.map((_,i)=><circle key={i} cx="12" cy={32+i*64} r="2.5" fill="#fff" stroke="#9ca38f"/>)}
   <motion.circle cx="12" cy={mobileY} r="5" fill="#b7d331"/>
  </svg>
 </>;
}
export default function HomeItinerary(){
 const [active,setActive]=useState(0),ref=useRef(null),buttons=useRef([]);
 const visible=useInView(ref,{amount:.2,once:true}),reduced=useReducedMotion(),stop=stops[active];
 const selectWithKey=(event,i)=>{
  let next;
  if(['ArrowRight','ArrowDown'].includes(event.key))next=(i+1)%stops.length;
  if(['ArrowLeft','ArrowUp'].includes(event.key))next=(i+stops.length-1)%stops.length;
  if(event.key==='Home')next=0;if(event.key==='End')next=stops.length-1;
  if(next===undefined)return;event.preventDefault();setActive(next);buttons.current[next]?.focus();
 };
 return <section id="a-vivre" ref={ref} className="home-itinerary journey-section" aria-labelledby="journey-title">
  <h2 id="journey-title">Créez votre itinéraire.</h2>
  <div className="journey-map"><JourneyLine active={active} visible={visible} reduced={reduced}/>
   <ol className="journey-stops" aria-label="Les étapes de votre inspiration">{stops.map((s,i)=>{const Icon=s.icon;return <li key={s.name}>
    <button type="button" ref={el=>buttons.current[i]=el} aria-pressed={i===active} aria-controls="journey-action" onClick={()=>setActive(i)} onKeyDown={event=>selectWithKey(event,i)}>
     <Icon className="journey-icon" size={28} strokeWidth={1.25} aria-hidden="true"/>
     <span className="journey-name">{s.name}</span>
    </button>
   </li>})}</ol>
  </div>
  <div id="journey-action" className="journey-action" aria-live="polite" aria-atomic="true"><a href={stop.href} target={stop.href.startsWith('https')?'_blank':undefined} rel={stop.href.startsWith('https')?'noreferrer':undefined}>{stop.link}<ArrowUpRight size={18} aria-hidden="true"/></a></div>
 </section>;
}
