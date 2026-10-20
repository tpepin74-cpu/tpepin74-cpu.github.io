import {useEffect} from 'react';

// Shared scrollspy for every editorial chapter menu, including mobile overflow.
export default function useSectionNavigation(path){
 useEffect(()=>{
  const menus=[...document.querySelectorAll('.page-sections,.product-chapters,.stay-section-nav')].map(nav=>({nav,active:null,entries:[...nav.querySelectorAll('a[href^="#"]')].map(link=>({link,section:document.getElementById(decodeURIComponent(link.hash.slice(1)))})).filter(entry=>entry.section)}));
  if(!menus.length)return;
  let frame=0;
  const update=()=>{
   frame=0;
   const header=document.querySelector('.site-header');
   const headerBottom=header?.getBoundingClientRect().bottom||0;
   for(const menu of menus){
    if(!menu.entries.length)continue;
    const navStyle=getComputedStyle(menu.nav);
    const navTop=Number.parseFloat(navStyle.top)||headerBottom;
    const line=Math.max(headerBottom,navTop)+menu.nav.offsetHeight+64;
    let current=menu.entries[0];
    for(const entry of menu.entries){
     if(entry.section.getBoundingClientRect().top<=line)current=entry;
    }
    if(menu.active===current.link)continue;
    menu.active=current.link;
    for(const {link} of menu.entries){
     if(link===current.link)link.setAttribute('aria-current','location');
     else link.removeAttribute('aria-current');
    }
    // Only move the horizontal strip, never the document or keyboard focus.
    const item=current.link.getBoundingClientRect(),bounds=menu.nav.getBoundingClientRect();
    if(item.left<bounds.left+16||item.right>bounds.right-16){
     menu.nav.scrollTo({left:menu.nav.scrollLeft+item.left-bounds.left-(bounds.width-item.width)/2,behavior:'auto'});
    }
   }
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
  const observer=new ResizeObserver(schedule);
  const main=document.querySelector('main');if(main)observer.observe(main);
  menus.forEach(({nav})=>observer.observe(nav));
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule);
  window.addEventListener('hashchange',schedule);
  document.addEventListener('toggle',schedule,true);
  schedule();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);window.removeEventListener('hashchange',schedule);document.removeEventListener('toggle',schedule,true);menus.forEach(({entries})=>entries.forEach(({link})=>link.removeAttribute('aria-current')))};
 },[path]);
}
