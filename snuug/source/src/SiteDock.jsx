import React,{useCallback,useEffect,useRef,useState} from 'react';
import {House,MapPin,BedDouble,Sparkles,CalendarDays} from 'lucide-react';
import Dock from './Dock';
const items=[{id:'accueil',label:'Accueil',icon:House,href:'#accueil'},{id:'lieu',label:'Lieu',icon:MapPin,href:'#lieu'},{id:'chambres',label:'Chambres',icon:BedDouble,href:'#chambres'},{id:'a-vivre',label:'À vivre',icon:Sparkles,href:'#a-vivre'},{id:'reserver',label:'Réserver',icon:CalendarDays,href:'#reserver'}];
const pageActive=path=>path==='/snuug'?'accueil':path.includes('reservation')?'lieu':path.includes('la-suite')||path.includes('sejours')?'chambres':path.includes('experiences')?'a-vivre':'accueil';
export default function SiteDock({path}){
 const [active,setActive]=useState(()=>pageActive(path));const lock=useRef(0),timer=useRef(null),reconcile=useRef(()=>{});
 useEffect(()=>{
  const sections=items.map(item=>document.getElementById(item.id)).filter(Boolean);
  const choose=()=>{if(Date.now()<lock.current)return;const line=window.innerHeight*.46;let current;for(const section of [...sections].sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top)){if(section.getBoundingClientRect().top<=line)current=section.id}if(current)setActive(current)};
  reconcile.current=choose;
  const observer=new IntersectionObserver(choose,{rootMargin:'-42% 0px -52% 0px',threshold:0});sections.forEach(section=>observer.observe(section));choose();window.addEventListener('resize',choose);window.addEventListener('hashchange',choose);
  return()=>{observer.disconnect();window.removeEventListener('resize',choose);window.removeEventListener('hashchange',choose);clearTimeout(timer.current)};
 },[path]);
 const select=useCallback(item=>{
  const section=document.getElementById(item.id);
  if(!section){window.location.assign('/snuug/'+item.href);return}
  setActive(item.id);lock.current=Date.now()+900;clearTimeout(timer.current);
  history.replaceState(null,'',item.href);
  section.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});
  timer.current=setTimeout(()=>{lock.current=0;reconcile.current()},900);
 },[]);
 return <Dock items={items} active={active} onSelect={select}/>;
}
