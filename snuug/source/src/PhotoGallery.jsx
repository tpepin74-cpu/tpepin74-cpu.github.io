import React,{useEffect,useRef,useState} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'framer-motion';
import {Dialog} from './Editorial';
import {imageAsset} from './image-assets';
import './photo-gallery.css';

function GalleryIcon({kind}){
 return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={kind==='close'?'M6 6l12 12M18 6 6 18':kind==='previous'?'M19 12H5m7-7-7 7 7 7':'M5 12h14m-7-7 7 7-7 7'} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}

export default function PhotoGallery({items,initial=0,onClose,label='Galerie photo SNUUG'}){
 const [selected,setSelected]=useState(()=>Math.max(0,Math.min(initial,items.length-1)));
 const reduced=useReducedMotion(),touch=useRef(null);
 const move=step=>setSelected(index=>(index+step+items.length)%items.length);
 useEffect(()=>{if(items.length>1){const preload=new window.Image();preload.src=imageAsset(items[(selected+1)%items.length].src)}},[selected,items]);
 const item=items[selected];
 if(!item)return null;
 return <Dialog title={label} className="photo-gallery-overlay" showClose={false} onClose={onClose} onKeyDown={event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();move(event.key==='ArrowLeft'?-1:1)}if(event.key==='Home'){event.preventDefault();setSelected(0)}if(event.key==='End'){event.preventDefault();setSelected(items.length-1)}}}>
  <div className="photo-gallery-stage" onTouchStart={event=>{const p=event.touches[0];touch.current={x:p.clientX,y:p.clientY}}} onTouchEnd={event=>{if(!touch.current)return;const p=event.changedTouches[0],dx=p.clientX-touch.current.x,dy=p.clientY-touch.current.y;touch.current=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.4)move(dx<0?1:-1)}}>
   <AnimatePresence mode="wait" initial={false}><motion.img key={item.src} src={imageAsset(item.src)} alt={item.alt||item.title||'Photographie de SNUUG'} initial={{opacity:reduced?1:0}} animate={{opacity:1}} exit={{opacity:reduced?1:0}} transition={{duration:reduced?0:.15}} draggable={false}/></AnimatePresence>
  </div>
  <div className="photo-gallery-toolbar">
   <p className="photo-gallery-count" aria-live="polite" aria-atomic="true"><span className="app-sr">Photographie </span>{String(selected+1).padStart(2,'0')} <span aria-hidden="true">/</span><span className="app-sr"> sur </span> {String(items.length).padStart(2,'0')}</p>
   <div className="photo-gallery-actions">
    <button type="button" onClick={()=>move(-1)} disabled={items.length<2} aria-label="Photo précédente"><GalleryIcon kind="previous"/></button>
    <button type="button" onClick={onClose} aria-label="Fermer la galerie"><GalleryIcon kind="close"/></button>
    <button type="button" onClick={()=>move(1)} disabled={items.length<2} aria-label="Photo suivante"><GalleryIcon kind="next"/></button>
   </div>
  </div>
 </Dialog>
}
