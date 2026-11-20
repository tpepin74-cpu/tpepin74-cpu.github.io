import React,{useState,useEffect,useLayoutEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {App} from './main';
import {routes} from './routes';
const previousFragments={
 '/snuug/informations#actualites':'/snuug/actualites#actualite',
 '/snuug/informations#presse':'/snuug/actualites#presse',
 '/snuug/informations#contact':'/snuug/mentions-legales#contact',
 '/snuug/experiences#inspirations':'/snuug/actualites#actualite',
 '/snuug/experiences#rituels':'/snuug/experiences#amoureux',
 '/snuug/experiences#escapade':'/snuug/experiences#golf',
 '/snuug/sejours/neuchatel#equipements':'/snuug/le-concept#equipements'
};
function currentRoute(scroll=null){const destination=previousFragments[location.pathname.replace(/\/$/,'')+location.hash];if(destination){const [path,hash]=destination.split('#');history.replaceState(history.state,'',path+location.search+'#'+hash)}return {pathname:location.pathname,search:location.search,scroll};}

function Site(){
 const [route,setRoute]=useState(()=>currentRoute());
 useEffect(()=>{
  const previous=history.scrollRestoration;history.scrollRestoration='manual';
  const navigate=()=>setRoute(currentRoute(0));
  const back=()=>setRoute(currentRoute(history.state?.snuugScroll||0));
  window.addEventListener('snuug:navigate',navigate);window.addEventListener('popstate',back);
  return()=>{history.scrollRestoration=previous;window.removeEventListener('snuug:navigate',navigate);window.removeEventListener('popstate',back)};
 },[]);
 useLayoutEffect(()=>{
  if(route.scroll!==null)window.scrollTo({top:route.scroll,behavior:'instant'});
  const details=routes[route.pathname.replace(/\/$/,'')];
  if(details){document.title=details[0];document.querySelector('meta[name="description"]')?.setAttribute('content',details[1]);document.querySelector('meta[property="og:title"]')?.setAttribute('content',details[0]);}
  const canonical=document.querySelector('link[rel="canonical"]');if(canonical)canonical.href=location.origin+route.pathname.replace(/\/$/,'')+'/';document.querySelector('meta[property="og:url"]')?.setAttribute('content',location.origin+route.pathname);
  // Announce the new page without moving the viewport or interrupting the dock.
  if(route.scroll!==null)document.querySelector('main')?.focus({preventScroll:true});
 },[route]);
 return <App pathname={route.pathname} search={route.search}/>;
}
createRoot(document.getElementById('root')).render(<Site/>);
