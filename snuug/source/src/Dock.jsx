import React,{useEffect,useRef,useState} from 'react';
import {AnimatePresence,MotionConfig,motion,useMotionValue,useReducedMotion,useSpring,useTransform,useVelocity} from 'framer-motion';
import './dock.css';

const spring={stiffness:260,damping:22,mass:0.9};
export function notchGeometry(width,center,speed=0,compact=false){
 const radius=22,height=72,half=compact?52:60,depth=compact?38:42;
 const deformation=Math.min(Math.abs(speed)/1400,1);
 const x=Math.max(radius+26,Math.min(width-radius-26,center));
 const w=Math.max(0,Math.min(half+24*deformation,x-radius-1,width-radius-1-x));
 const d=depth-7*deformation;
 return `M ${radius} 0 H ${x-w} C ${x-w*.5} 0 ${x-w*.5} ${d} ${x} ${d} C ${x+w*.5} ${d} ${x+w*.5} 0 ${x+w} 0 H ${width-radius} Q ${width} 0 ${width} ${radius} V ${height-radius} Q ${width} ${height} ${width-radius} ${height} H ${radius} Q 0 ${height} 0 ${height-radius} V ${radius} Q 0 0 ${radius} 0 Z`;
}
/** items: [{id, label, icon: LucideIcon, href:'#section'}]. active is an item id.
 * onSelect(item) controls navigation. The dock is reusable without scroll logic.
 * Set data-dock-theme="dark" on an ancestor to use its dark palette.
 */
export default function Dock(props){return <MotionConfig reducedMotion="user"><DockSurface {...props}/></MotionConfig>}
function DockSurface({items,active,onSelect}){
 const reduced=useReducedMotion(),ref=useRef(null),[preview,setPreview]=useState(null);
 useEffect(()=>setPreview(null),[active]);
 const [layout,setLayout]=useState({width:items.length*76+48,compact:false});
 const activeIndex=Math.max(0,items.findIndex(item=>item.id===active));
 const index=preview===null?activeIndex:Math.min(preview,items.length-1);
 const targetX=24+(layout.width-48)/items.length*(index+.5);
 const target=useMotionValue(targetX),x=useSpring(target,spring);
 const velocity=useVelocity(x);
 // A single shared MotionValue drives both the path and the floating bubble.
 const path=useTransform([x,velocity],([position,speed])=>notchGeometry(layout.width,position,reduced?0:speed,layout.compact));
 const scaleX=useTransform(velocity,v=>reduced?1:1+Math.min(Math.abs(v)/1400,1)*.28);
 const scaleY=useTransform(velocity,v=>reduced?1:1-Math.min(Math.abs(v)/1400,1)*.14);
 const size=layout.compact?46:50;
 const bubbleLeft=useTransform(x,v=>Math.max(48,Math.min(layout.width-48,v))-size/2);
 const labelLeft=useTransform(x,v=>Math.max(48,Math.min(layout.width-48,v))-40);
 useEffect(()=>{if(reduced)x.jump(targetX);target.set(targetX)},[targetX,reduced,target,x]);
 useEffect(()=>{const node=ref.current;if(!node)return;const query=window.matchMedia('(max-width:420px)');const measure=()=>setLayout({width:node.getBoundingClientRect().width,compact:query.matches});measure();const observer=new ResizeObserver(measure);observer.observe(node);query.addEventListener('change',measure);return()=>{observer.disconnect();query.removeEventListener('change',measure)}},[]);
 const chosen=items[index],BubbleIcon=chosen?.icon;
 if(!items.length)return null;
 return <nav ref={ref} className="liquid-dock fixed isolate" aria-label="Explorer SNUUG" style={{'--dock-count':items.length}} onMouseLeave={()=>setPreview(null)} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setPreview(null)}}>
  <svg className="dock-shape absolute inset-0 pointer-events-none" width="100%" height="72" viewBox={`0 0 ${layout.width} 72`} aria-hidden="true"><motion.path d={path}/></svg>
  <motion.div className="dock-bubble absolute pointer-events-none flex items-center justify-center" style={{left:bubbleLeft,width:size,height:size,top:9-size/2,scaleX,scaleY}} aria-hidden="true"><AnimatePresence mode="popLayout" initial={false}><motion.div key={chosen.id} className="absolute flex items-center justify-center" initial={reduced?false:{scale:.3,rotate:-40,opacity:0}} animate={{scale:1,rotate:0,opacity:1}} exit={reduced?{opacity:0}:{scale:.3,rotate:35,opacity:0}} transition={reduced?{duration:0}:spring}><BubbleIcon size={23} strokeWidth={1.65}/></motion.div></AnimatePresence></motion.div>
  <motion.span className="dock-label absolute pointer-events-none text-center" style={{left:labelLeft}} aria-hidden="true">{chosen.label}</motion.span>
  <div className="dock-items relative flex h-full">{items.map((item,i)=>{const Icon=item.icon;return <button key={item.id} type="button" className="dock-item relative flex items-center justify-center select-none" aria-label={item.label} aria-haspopup={item.hasPopup} aria-current={item.id===active?(item.currentType||(item.href?.startsWith('#')?'location':'page')):undefined} title={item.label} onMouseEnter={event=>{if(window.matchMedia('(hover:hover)').matches)setPreview(i)}} onFocus={()=>setPreview(i)} onClick={()=>{setPreview(null);onSelect?.(item)}} onKeyDown={event=>{let next;if(event.key==='ArrowRight')next=(i+1)%items.length;if(event.key==='ArrowLeft')next=(i-1+items.length)%items.length;if(event.key==='Home')next=0;if(event.key==='End')next=items.length-1;if(next!==undefined){event.preventDefault();ref.current.querySelectorAll('button')[next]?.focus()}}}>
    <motion.span className="flex items-center justify-center" animate={{y:i===index?22:0,opacity:i===index?0:1,scale:i===index ? .5 : 1}} transition={reduced?{duration:0}:spring}><Icon size={22} strokeWidth={1.65} aria-hidden="true"/></motion.span>
    {item.id===active&&index!==activeIndex&&<span className="dock-active-dot absolute" aria-hidden="true"/>}
   </button>})}</div>
 </nav>;
}
