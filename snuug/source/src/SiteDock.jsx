import React,{useCallback,useEffect,useRef,useState} from 'react';
import {House,MapPin,BedDouble,Sparkles,Leaf,CalendarDays} from 'lucide-react';
import Dock from './Dock';
export const siteDockItems=[
 {id:'accueil',label:'Accueil',icon:House,href:'#accueil'},
 {id:'chambres',label:'La suite',icon:BedDouble,href:'#chambres'},
 {id:'sensations',label:'Sensations',icon:Leaf,href:'#sensations'},
 {id:'lieu',label:'Destinations',icon:MapPin,href:'#lieu'},
 {id:'a-vivre',label:'Expériences',icon:Sparkles,href:'#a-vivre'},
 {id:'reserver',label:'Réserver',icon:CalendarDays,href:'#reserver'}
];
export default function SiteDock({path}){
 const home=path==='/snuug';
 const [active,setActive]=useState('accueil');const lock=useRef(0),timer=useRef(null),reconcile=useRef(()=>{});
 useEffect(()=>{
  if(!home)return;
  const sections=siteDockItems.map(item=>document.getElementById(item.id)).filter(Boolean);
  const choose=()=>{if(Date.now()<lock.current)return;const line=window.innerHeight*.46;let current='accueil';for(const section of [...sections].sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top)){if(section.getBoundingClientRect().top<=line)current=section.id}setActive(current)};
  reconcile.current=choose;
  const observer=new IntersectionObserver(choose,{rootMargin:'-42% 0px -52% 0px',threshold:0});sections.forEach(section=>observer.observe(section));choose();window.addEventListener('resize',choose);window.addEventListener('hashchange',choose);
  return()=>{observer.disconnect();window.removeEventListener('resize',choose);window.removeEventListener('hashchange',choose);clearTimeout(timer.current)};
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
