import {Dialog,Image,Arrow} from './Editorial';
import React,{useEffect,useRef,useState} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'framer-motion';
import {imageAsset} from './image-assets';
import './liquid-gallery.css';
const layoutSpring={type:'spring',stiffness:210,damping:28};
export default function LiquidGallery({items,onOpen,label='Explorer les photographies'}){
 const [active,setActive]=useState(0),[mobile,setMobile]=useState(false),reduced=useReducedMotion();const root=useRef(null);
 const [photo,setPhoto]=useState(null);
 const openPhoto=i=>{setActive(i);if(onOpen)onOpen(i);else setPhoto(i)};
 const movePhoto=d=>setPhoto(i=>(i+d+items.length)%items.length);
 useEffect(()=>{const q=matchMedia('(max-width:859px)');const update=()=>setMobile(q.matches);update();q.addEventListener('change',update);return()=>q.removeEventListener('change',update)},[]);
 return <div className="liquid-gallery-shell"><div ref={root} className="liquid-gallery flex gap-3" role="group" aria-label={label}>{items.map((item,i)=><LiquidCard key={item.src+(mobile?'-mobile':'-desktop')} item={item} open={i===active} mobile={mobile} reduced={reduced} onSelect={()=>setActive(i)} onOpen={()=>openPhoto(i)} onKeyDown={event=>{let next;if(['ArrowRight','ArrowDown'].includes(event.key))next=(i+1)%items.length;if(['ArrowLeft','ArrowUp'].includes(event.key))next=(i-1+items.length)%items.length;if(event.key==='Home')next=0;if(event.key==='End')next=items.length-1;if(next!==undefined){event.preventDefault();setActive(next);root.current?.querySelectorAll('.liquid-gallery-card')[next]?.focus()}}}/>)}</div><AnimatePresence>{photo!==null&&<Dialog title="Photographie agrandie" className="gallery-dialog" onClose={()=>setPhoto(null)} onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();movePhoto(1)}if(e.key==='ArrowLeft'){e.preventDefault();movePhoto(-1)}}}><div className="lightbox-content"><Image eager src={items[photo].src} alt={items[photo].alt||items[photo].title}/><div className="lightbox-controls"><button onClick={()=>movePhoto(-1)} aria-label="Photo précédente"><Arrow direction="left"/></button><p aria-live="polite">{items[photo].title}<span>{photo+1} / {items.length}</span></p><button onClick={()=>movePhoto(1)} aria-label="Photo suivante"><Arrow direction="right"/></button></div></div></Dialog>}</AnimatePresence></div>
}
function LiquidCard({item,open,mobile,reduced,onSelect,onOpen,onKeyDown}){
 return <motion.button type="button" className="liquid-gallery-card relative overflow-hidden text-left" aria-label={'Agrandir : '+item.title} aria-haspopup="dialog" aria-expanded={open} onFocus={onSelect} onClick={onOpen} onKeyDown={onKeyDown} onPointerEnter={event=>{if(event.pointerType==='mouse'&&matchMedia('(hover:hover) and (pointer:fine)').matches)onSelect()}} initial={false} animate={mobile?{height:open?400:96,flexGrow:0}:{flexGrow:open?5:1}} transition={reduced?{duration:0}:layoutSpring}>
  <div className="liquid-photo-surface"><motion.img className="absolute h-full w-full object-cover" src={imageAsset(item.src)} alt={item.alt||item.title} loading="lazy" initial={false} animate={{scale:reduced?1:open?1:1.14}} transition={{duration:reduced?0:1.2,ease:[.22,1,.36,1]}}/></div>
 </motion.button>
}
