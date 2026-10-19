import React,{useCallback,useEffect,useRef,useState} from 'react';
import {House,MapPin,BedDouble,Sparkles,Leaf,CalendarDays} from 'lucide-react';
import Dock from './Dock';
export const siteDockItems=[
 {id:'accueil',label:'Accueil',icon:House,href:'#accueil'},
 {id:'reserver',label:'Réserver',icon:CalendarDays,href:'#reserver'},
 {id:'chambres',label:'La suite',icon:BedDouble,href:'#chambres'},
 {id:'sensations',label:'Sensations',icon:Leaf,href:'#sensations'},
 {id:'lieu',label:'Destinations',icon:MapPin,href:'#lieu'},
 {id:'a-vivre',label:'Expériences',icon:Sparkles,href:'#a-vivre'}
];
export default function SiteDock({path}){
 const home=path==='/snuug';
 const [active,setActive]=useState('accueil');const lock=useRef(0),timer=useRef(null),reconcile=useRef(()=>{});
 useEffect(()=>{
  if(!home)return;
  const sections=siteDockItems.map(item=>document.getElementById(item.id)).filter(Boolean);
  let frame=0;
  const choose=()=>{
   frame=0;if(Date.now()<lock.current)return;
   const header=document.querySelector('.site-header')?.getBoundingClientRect().bottom||0;
   const line=header+Math.min(100,window.innerHeight*.15);
   let current=sections[0]?.id;
   for(const section of sections){if(section.getBoundingClientRect().top<=line)current=section.id}
   if(current)setActive(current);
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(choose)};
  const interrupt=event=>{if(event.type==='keydown'&&!['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key))return;lock.current=0;clearTimeout(timer.current);schedule()};
  reconcile.current=schedule;
  const observer=new IntersectionObserver(schedule,{rootMargin:'-42% 0px -52% 0px',threshold:0});sections.forEach(section=>observer.observe(section));
  const resize=new ResizeObserver(schedule);const main=document.querySelector('main');if(main)resize.observe(main);
  choose();window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);window.addEventListener('hashchange',schedule);
  window.addEventListener('wheel',interrupt,{passive:true});window.addEventListener('touchstart',interrupt,{passive:true});window.addEventListener('keydown',interrupt);
  return()=>{observer.disconnect();resize.disconnect();cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);window.removeEventListener('hashchange',schedule);window.removeEventListener('wheel',interrupt);window.removeEventListener('touchstart',interrupt);window.removeEventListener('keydown',interrupt);clearTimeout(timer.current)};
 },[home]);
 const select=useCallback(item=>{
  const section=home&&document.getElementById(item.id);
  if(!section){window.location.assign('/snuug/'+item.href);return}
  setActive(item.id);lock.current=Date.now()+900;clearTimeout(timer.current);
  history.replaceState(null,'',item.href);
  section.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});
  timer.current=setTimeout(()=>{lock.current=0;reconcile.current()},900);
 },[home]);
 return <Dock items={siteDockItems} active={home?active:null} onSelect={select}/>;
}
