import React,{useEffect,useId,useRef,useState} from 'react';
import {AnimatePresence,motion,useReducedMotion,useSpring,useMotionValueEvent} from 'framer-motion';
import {imageAsset} from './image-assets';
import './liquid-gallery.css';
const layoutSpring={type:'spring',stiffness:210,damping:28};
export default function LiquidGallery({items,onOpen,label='Explorer les photographies'}){
 const [active,setActive]=useState(0),[mobile,setMobile]=useState(false),reduced=useReducedMotion();const root=useRef(null);
 useEffect(()=>{const q=matchMedia('(max-width:859px)');const update=()=>setMobile(q.matches);update();q.addEventListener('change',update);return()=>q.removeEventListener('change',update)},[]);
 return <div className="liquid-gallery-shell"><div ref={root} className="liquid-gallery flex gap-3" role="group" aria-label={label}>{items.map((item,i)=><LiquidCard key={item.src+(mobile?'-mobile':'-desktop')} item={item} index={i} open={i===active} mobile={mobile} reduced={reduced} onSelect={()=>setActive(i)} onKeyDown={event=>{let next;if(['ArrowRight','ArrowDown'].includes(event.key))next=(i+1)%items.length;if(['ArrowLeft','ArrowUp'].includes(event.key))next=(i-1+items.length)%items.length;if(event.key==='Home')next=0;if(event.key==='End')next=items.length-1;if(next!==undefined){event.preventDefault();setActive(next);root.current?.querySelectorAll('.liquid-gallery-card')[next]?.focus()}}}/>)}</div>{onOpen&&<div className="liquid-gallery-footer"><span>{String(active+1).padStart(2,'0')} / {String(items.length).padStart(2,'0')}</span><button type="button" className="button liquid-gallery-expand" onClick={()=>onOpen(active)}>Agrandir la photo <span aria-hidden="true">↗</span></button></div>}</div>
}
function LiquidCard({item,index,open,mobile,reduced,onSelect,onKeyDown}){
 const id='liquid-water-'+useId().replace(/[^a-zA-Z0-9_-]/g,'');const contentId=id+'-content';
 const turbulence=useRef(null),displacement=useRef(null),hovering=useRef(false),[wet,setWet]=useState(false),[hover,setHover]=useState(false);
 const water=useSpring(0,{stiffness:70,damping:12});
 useMotionValueEvent(water,'change',v=>{displacement.current?.setAttribute('scale',String(Math.max(0,v)));if(!hovering.current&&Math.abs(v)<.05)setWet(false)});
 useEffect(()=>{if(reduced){water.jump(0);setWet(false)}},[reduced,water]);
 useEffect(()=>{
  if(!hover||reduced)return;
  let frame;const update=t=>{if(document.hidden)return;const slow=t/1000;turbulence.current?.setAttribute('baseFrequency',`${.009+Math.sin(slow*.65)*.0015} ${.02+Math.sin(slow*.43)*.003}`);frame=requestAnimationFrame(update)};
  const visibility=()=>{cancelAnimationFrame(frame);if(!document.hidden)frame=requestAnimationFrame(update)};
  frame=requestAnimationFrame(update);document.addEventListener('visibilitychange',visibility);return()=>{cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',visibility)};
 },[hover,reduced]);
 const leave=()=>{hovering.current=false;setHover(false);water.set(0)};
 return <motion.button type="button" className="liquid-gallery-card relative overflow-hidden text-left" aria-label={item.title} aria-expanded={open} aria-controls={contentId} onFocus={onSelect} onClick={onSelect} onKeyDown={onKeyDown} onPointerEnter={event=>{if(event.pointerType!=='mouse'||!matchMedia('(hover:hover) and (pointer:fine)').matches)return;onSelect();if(reduced)return;hovering.current=true;setWet(true);setHover(true);water.set(18)}} onPointerLeave={leave} onPointerCancel={leave} initial={false} animate={mobile?{height:open?400:96,flexGrow:0}:{flexGrow:open?5:1}} transition={reduced?{duration:0}:layoutSpring}>
  <svg width="0" height="0" className="liquid-filter-defs" aria-hidden="true"><defs><filter id={id} x="-8%" y="-8%" width="116%" height="116%" colorInterpolationFilters="sRGB"><feTurbulence ref={turbulence} type="fractalNoise" baseFrequency="0.009 0.02" numOctaves="1" seed={index+1} result="noise"/><feDisplacementMap ref={displacement} in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg>
  <div className="liquid-photo-surface" style={{filter:wet&&!reduced?`url(#${id})`:undefined}}><motion.img className="absolute h-full w-full object-cover" src={imageAsset(item.src)} alt={item.alt||item.title} loading="lazy" initial={false} animate={{scale:reduced?1:open?1:1.14}} transition={{duration:reduced?0:1.2,ease:[.22,1,.36,1]}}/></div>
  <span className="liquid-gallery-shade"/>
  <span id={contentId} className="liquid-card-text"><AnimatePresence mode="wait" initial={false}>{open?<motion.span key="open" className="liquid-card-open" initial={reduced?false:{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reduced?0:8}} transition={{duration:reduced?0:.25,delay:reduced?0:.16}}>{item.eyebrow&&<span className="liquid-card-eyebrow">{item.eyebrow}</span>}<span className="liquid-card-title">{item.title}</span>{item.text&&<span className="liquid-card-description">{item.text}</span>}{item.badge&&<span className="liquid-card-badge">{item.badge}</span>}</motion.span>:<motion.span key="closed" className="liquid-card-closed" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:reduced?0:.15}}>{item.title}</motion.span>}</AnimatePresence></span>
 </motion.button>
}
