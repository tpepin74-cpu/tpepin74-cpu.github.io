import React,{useState,useEffect,useLayoutEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {App} from './main';
import {routes} from './routes';
function Site(){
 const [route,setRoute]=useState(()=>({pathname:location.pathname,search:location.search,scroll:null}));
 useEffect(()=>{
  const previous=history.scrollRestoration;history.scrollRestoration='manual';
  const navigate=()=>setRoute({pathname:location.pathname,search:location.search,scroll:0});
  const back=()=>setRoute({pathname:location.pathname,search:location.search,scroll:history.state?.snuugScroll||0});
  window.addEventListener('snuug:navigate',navigate);window.addEventListener('popstate',back);
  return()=>{history.scrollRestoration=previous;window.removeEventListener('snuug:navigate',navigate);window.removeEventListener('popstate',back)};
 },[]);
 useLayoutEffect(()=>{
  if(route.scroll===null)return;
  window.scrollTo({top:route.scroll,behavior:'instant'});
  const details=routes[route.pathname.replace(/\/$/,'')];
  if(details){document.title=details[0];document.querySelector('meta[name="description"]')?.setAttribute('content',details[1]);document.querySelector('meta[property="og:title"]')?.setAttribute('content',details[0]);}
  const canonical=document.querySelector('link[rel="canonical"]');if(canonical)canonical.href=location.origin+route.pathname.replace(/\/$/,'')+'/';document.querySelector('meta[property="og:url"]')?.setAttribute('content',location.origin+route.pathname);
  // Announce the new page without moving the viewport or interrupting the dock.
  document.querySelector('main')?.focus({preventScroll:true});
 },[route]);
 return <App pathname={route.pathname} search={route.search}/>;
}
createRoot(document.getElementById('root')).render(<Site/>);
