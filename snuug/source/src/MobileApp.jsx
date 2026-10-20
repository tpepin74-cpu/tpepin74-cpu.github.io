import InlineArrow from './InlineArrow';
import React,{useEffect,useState} from 'react';
import Icon from './Icon';
import {useSaved} from './saved-store';
import {imageAsset} from './image-assets';
export function MobileNav({path,search,onReserve}){
 const [saved]=useSaved();
 const [currentSearch,setCurrentSearch]=useState(search);
 useEffect(()=>{const sync=()=>setCurrentSearch(window.location.search);window.addEventListener('snuug:search',sync);window.addEventListener('popstate',sync);return()=>{window.removeEventListener('snuug:search',sync);window.removeEventListener('popstate',sync)}},[]);
 const favourites=path==='/snuug/reservation'&&new URLSearchParams(currentSearch).get('favoris')==='1';
 return <nav className="app-tabbar" aria-label="Navigation mobile">
  <a href="/snuug/" aria-current={path==='/snuug'?'page':undefined}><Icon name="explore"/><span>Explorer</span></a>
  <a href="/snuug/reservation?favoris=1" aria-current={favourites?'page':undefined}><span className="app-nav-icon"><Icon name="heart"/>{saved&&<span className="app-saved-dot" aria-hidden="true"/>}</span><span>Favoris</span><span className="app-sr">{saved?', une suite enregistrée':', aucune suite enregistrée'}</span></a>
  <a href="/snuug/informations" aria-current={path==='/snuug/informations'?'page':undefined}><Icon name="stay"/><span>Votre séjour</span></a>
  {path==='/snuug/sejours/neuchatel'?<button className="app-reserve-tab" onClick={onReserve} aria-haspopup="dialog"><Icon name="calendar"/><span>Réserver</span></button>:<a className="app-reserve-tab" href="/snuug/reservation" aria-current={path==='/snuug/reservation'&&!favourites?'page':undefined}><Icon name="calendar"/><span>Réserver</span></a>}
 </nav>;
}
export function MobileQuickStay(){return <section className="app-quick-stay" aria-labelledby="quick-stay-title"><div><span className="eyebrow">VOTRE PROCHAINE ÉCHAPPÉE</span><h2 id="quick-stay-title">À deux. <i>Au vert.</i></h2></div><a className="app-stay-preview" href="/snuug/sejours/neuchatel"><img src={imageAsset('/images/editorial/exterieur.webp')} alt="La suite SNUUG au Golf de Neuchâtel" loading="lazy" width="120" height="144"/><span><small>SAINT-BLAISE · NEUCHÂTEL</small><strong>Votre refuge,<br/>tout simplement.</strong><span>2 voyageurs · Terrasse privée</span><b>Découvrir la suite <span aria-hidden="true"><InlineArrow/></span></b></span></a><div className="app-quick-links"><a href="/snuug/experiences#amoureux"><Icon name="heart"/>En amoureux</a><a href="/snuug/informations#agenda"><Icon name="sun"/>Les sorties</a></div></section>}
