import React,{useState,useRef,useEffect} from 'react';
import {motion,useReducedMotion} from 'framer-motion';
import {Image,Arrow} from './Editorial';
const views=[{src:'/images/official/golf-1540.webp',alt:'La suite SNUUG dans le vaste paysage du Golf de Neuchâtel',place:'Neuchâtel · Golf de Neuchâtel'},{src:'/images/official/noirmont-1979.webp',alt:'SNUUG-CJ au milieu des pâturages des Franches-Montagnes',place:'Jura · Le Noirmont'},{src:'/images/official/golf-1574.webp',alt:'Le petit-déjeuner sur la terrasse ouverte sur la nature',place:'Le plaisir de prendre son temps'}];
function KenBurnsPhoto({view,index,active,paused,reduced}){
 const ref=useRef(null),animation=useRef(null);
 useEffect(()=>{
  if(reduced){animation.current?.cancel();animation.current=null;return}
  if(!active||!ref.current)return;
  const compact=window.matchMedia('(max-width:760px)').matches;
  const drift=compact?.6:1.2,zoom=compact?1.08:1.13;
  const frames=[
   [`translate3d(-${drift}%,.4%,0) scale(1.04)`,`translate3d(${drift}%,-.4%,0) scale(${zoom})`],
   [`translate3d(${drift}%,-.4%,0) scale(${zoom})`,`translate3d(-${drift}%,.4%,0) scale(1.04)`],
   [`translate3d(-${drift}%,-.4%,0) scale(1.04)`,`translate3d(${drift}%,.4%,0) scale(${zoom})`]
  ][index];
  animation.current?.cancel();
  animation.current=ref.current.animate(frames.map(transform=>({transform})),{duration:9200,easing:'linear',fill:'both'});
  if(paused)animation.current.pause();
 },[active,reduced,index]);
 useEffect(()=>{if(!animation.current)return;if(paused)animation.current.pause();else animation.current.play()},[paused]);
 useEffect(()=>()=>animation.current?.cancel(),[]);
 return <div ref={ref} className="landscape-motion"><Image eager={index===0} src={view.src} alt={view.alt}/></div>;
}
export function LandscapeHero(){const [active,setActive]=useState(0),[paused,setPaused]=useState(false),[visible,setVisible]=useState(true);const reduced=useReducedMotion(),ref=useRef(null);
useEffect(()=>{const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting));if(ref.current)observer.observe(ref.current);return()=>observer.disconnect()},[]);
useEffect(()=>{if(paused||reduced||!visible)return;const timer=setInterval(()=>setActive(v=>(v+1)%views.length),8000);return()=>clearInterval(timer)},[paused,reduced,visible]);
return <section id="accueil" ref={ref} className="landscape-hero" aria-label="Les paysages SNUUG"><div className="landscape-frames">{views.map((view,i)=><motion.div key={view.src} className="landscape-frame" initial={false} animate={{opacity:i===active?1:0}} transition={{opacity:{duration:reduced?0:1.2}}} aria-hidden={i!==active}><KenBurnsPhoto view={view} index={i} active={i===active} paused={paused||!visible} reduced={reduced}/></motion.div>)}</div><div className="landscape-shade"/><div className="landscape-title"><span>The supernature hotel</span><h1>Ailleurs.<br/>Tout simplement.</h1><a className="button light" href="#reserver">Découvrir<Arrow direction="down"/></a></div>{!reduced&&<button className="landscape-accessible-pause" onClick={()=>setPaused(v=>!v)}>{paused?'Reprendre le diaporama':'Mettre le diaporama en pause'}</button>}</section>}
