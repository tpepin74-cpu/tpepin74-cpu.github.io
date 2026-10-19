import React,{useEffect,useState} from 'react';
import {House,BedDouble,Sparkles,Leaf,CalendarDays,BellRing} from 'lucide-react';
import Dock from './Dock';
export const siteDockItems=[
 {id:'accueil',label:'Accueil',icon:House,href:'/snuug/'},
 {id:'reserver',label:'Réserver',icon:CalendarDays,href:'/snuug/reservation'},
 {id:'chambres',label:'La suite',icon:BedDouble,href:'/snuug/la-suite'},
 {id:'sensations',label:'Sensations',icon:Leaf,href:'/snuug/experiences'},
 {id:'a-vivre',label:'Expériences',icon:Sparkles,href:'/snuug/experiences'},
 {id:'concierge',label:'Concierge',icon:BellRing,hasPopup:'dialog'}
];
export default function SiteDock({path,onConcierge}){
 const home=path==='/snuug';
 const [active,setActive]=useState('accueil');
 useEffect(()=>{
  if(!home)return;
  const sections=siteDockItems.map(item=>document.getElementById(item.id)).filter(Boolean);
  let frame=0;
  const choose=()=>{
   frame=0;
   const header=document.querySelector('.site-header')?.getBoundingClientRect().bottom||0;
   const line=header+Math.min(100,window.innerHeight*.15);
   let current=sections[0]?.id;
   for(const section of sections){if(section.getBoundingClientRect().top<=line)current=section.id}
   if(current)setActive(current);
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(choose)};
  const observer=new IntersectionObserver(schedule,{rootMargin:'-42% 0px -52% 0px',threshold:0});sections.forEach(section=>observer.observe(section));
  const resize=new ResizeObserver(schedule);const main=document.querySelector('main');if(main)resize.observe(main);
  choose();window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);window.addEventListener('hashchange',schedule);
  return()=>{observer.disconnect();resize.disconnect();cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);window.removeEventListener('hashchange',schedule);};
 },[home]);
 const select=item=>{
  if(item.id==='concierge'){onConcierge?.();return}
  if(item.id==='accueil'&&home){window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});return}
  window.location.assign(item.href);
 };
 const pageActive=path.includes('/la-suite')?'chambres':path.includes('/sejours/')?'reserver':path.includes('/reservation')?'reserver':path.includes('/experiences')?'a-vivre':null;
 return <Dock items={siteDockItems.map(item=>({...item,currentType:home?'location':'page'}))} active={home?active:pageActive} onSelect={select}/>;
}
