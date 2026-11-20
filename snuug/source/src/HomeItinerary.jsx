import React,{useEffect,useMemo,useRef,useState} from 'react';
import {motion,useAnimationFrame,useInView,useMotionValue,useMotionValueEvent,useReducedMotion,useTransform} from 'framer-motion';
import {Utensils,Waves,TrainFront,Grape,Pause,Play} from 'lucide-react';
import animation from './itinerary-motion.json';
import journeyStops from './journey-stops.json';
import InlineArrow from './InlineArrow';
import './home-itinerary.css';
function SignatureIcon(){return <svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M21 8c2.5 10 5 12.5 15 15-10 2.5-12.5 5-15 15C18.5 28 16 25.5 6 23 16 20.5 18.5 18 21 8Z" fill="#c5e241" stroke="currentColor" strokeWidth="1.5"/><path d="m37 4 2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" fill="#c5e241" stroke="currentColor" strokeWidth="1.5"/></svg>}
function CheeseIcon(){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true"><path d="m3 7 18 4v9H3V7Z"/><path d="m3 7 8-4 10 8"/><circle cx="8" cy="13" r="1.2"/><circle cx="16" cy="15.5" r="1.5"/></svg>}
const icons={snuug:SignatureIcon,restaurant:Utensils,lac:Waves,train:TrainFront,vigne:Grape,fromage:CheeseIcon};
const stops=journeyStops.map(stop=>({...stop,icon:icons[stop.icon]||SignatureIcon}));
function curveSegment(points,index,mobile){
 const start=points[index],end=points[index+1];
 // Horizontal tangents on the wide wave, vertical tangents on the mobile wave.
 const controls=mobile?[[start[0],start[1]+(end[1]-start[1])*.5],[end[0],end[1]-(end[1]-start[1])*.5]]:[[start[0]+(end[0]-start[0])*.5,start[1]],[end[0]-(end[0]-start[0])*.5,end[1]]];
 return [start,...controls,end];
}
function positionAt(value,points,mobile){
 const bounded=Math.max(0,Math.min(points.length-1,value)),index=Math.min(points.length-2,Math.floor(bounded)),t=bounded-index,u=1-t;
 const [start,control1,control2,end]=curveSegment(points,index,mobile);
 return start.map((coordinate,axis)=>u*u*u*coordinate+3*u*u*t*control1[axis]+3*u*t*t*control2[axis]+t*t*t*end[axis]);
}
function JourneyTicker({phase}){
 useAnimationFrame((_,delta)=>{const next=phase.get()+Math.min(delta,48)/animation.stepDuration;phase.set(next>6.65?0:next)});
 return null;
}
function JourneyPath({points,width,height,progress,phase,reduced,mobile}){
 const x=useTransform(progress,v=>positionAt(v,points,mobile)[0]),y=useTransform(progress,v=>positionAt(v,points,mobile)[1]);
 const distances=useMemo(()=>{
  let total=0;const starts=[];
  const segments=points.slice(1).map((_,index)=>{starts.push(total);let previous=points[index],length=0;const samples=[0];for(let step=1;step<=40;step++){const next=positionAt(index+step/40,points,mobile);length+=Math.hypot(next[0]-previous[0],next[1]-previous[1]);samples.push(length);previous=next}total+=length;return samples});
  return {segments,starts,total};
 },[points,mobile]);
 const completion=useTransform(progress,value=>{if(value>=6)return 1;const index=Math.floor(Math.max(0,value)),sample=(value-index)*40,step=Math.min(39,Math.floor(sample)),fraction=sample-step,lengths=distances.segments[index];return (distances.starts[index]+lengths[step]+(lengths[step+1]-lengths[step])*fraction)/distances.total});
 const opacity=useTransform(phase,v=>v<.15?v/.15:v>6.35?(6.65-v)/.3:1),haloOpacity=useTransform(opacity,v=>v*.18);
 const path='M'+points[0].join(' ')+points.slice(1).map((_,index)=>' C'+curveSegment(points,index,mobile).slice(1).map(point=>point.join(' ')).join(' ')).join('');
 return <svg className="journey-path" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
  <path d={path} className="journey-track"/>
  {!reduced&&<><motion.path d={path} className="journey-progress" style={{pathLength:completion,opacity}}/><motion.circle cx={x} cy={y} r="13" fill="#c5e241" style={{opacity:haloOpacity}}/><motion.circle cx={x} cy={y} r="5" fill="#9bb525" stroke="#fff" strokeWidth="2" style={{opacity}}/></>}
 </svg>;
}
export default function HomeItinerary(){
 const stage=useRef(null),activeIndex=useRef(0),phase=useMotionValue(0),reduced=useReducedMotion();
 const visible=useInView(stage,{amount:.25});
 const [size,setSize]=useState(()=>({width:1120,mobile:typeof window!=='undefined'&&window.innerWidth<768})),[paused,setPaused]=useState(false),[hovered,setHovered]=useState(false),[focused,setFocused]=useState(false),[hidden,setHidden]=useState(false),[active,setActive]=useState(0);
 const progress=useTransform(phase,value=>{const i=Math.floor(value),fraction=Math.min(1,Math.max(0,(value-i-animation.dwell)/(1-animation.dwell)));return Math.min(6,i+fraction*fraction*(3-2*fraction))});
 useMotionValueEvent(progress,'change',value=>{const next=Math.round(value);if(next!==activeIndex.current){activeIndex.current=next;setActive(next)}});
 useEffect(()=>{
  const measure=()=>setSize({width:stage.current?.clientWidth||1120,mobile:window.innerWidth<768});
  const observer=new ResizeObserver(measure);observer.observe(stage.current);window.addEventListener('resize',measure);measure();
  return()=>{observer.disconnect();window.removeEventListener('resize',measure)};
 },[]);
 useEffect(()=>{const update=()=>setHidden(document.hidden);update();document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update)},[]);
 const config=size.mobile?animation.mobile:animation.desktop,points=config.points.map(([x,y])=>[x*size.width,y]);
 const running=visible&&!paused&&!hovered&&!focused&&!hidden&&!reduced;
 const inspect=index=>phase.set(index+animation.dwell);
 return <section id="a-vivre" className="home-itinerary journey-section" aria-labelledby="journey-title">
  <div className="journey-heading"><span className="eyebrow">Les destinations</span><h2 id="journey-title">Créez votre itinéraire.</h2></div>
  <div ref={stage} className="journey-stage" style={{height:config.height}} onFocusCapture={()=>setFocused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setFocused(false)}}>
   {running&&<JourneyTicker phase={phase}/>}
   <JourneyPath points={points} width={size.width} height={config.height} progress={progress} phase={phase} reduced={reduced} mobile={size.mobile}/>
   <ol className="journey-stops" aria-label="Un exemple d’itinéraire entre deux SNUUG">
    {stops.map((stop,index)=>{const Icon=stop.icon,symbolSize=stop.endpoint?(size.mobile?72:88):(size.mobile?56:64);return <li key={stop.name} className={'journey-stop'+(stop.endpoint?' journey-endpoint':'')} data-active={active===index} style={{left:points[index][0],top:points[index][1]-symbolSize/2,'--symbol-size':symbolSize+'px'}}>
     <motion.a href={stop.href} target={stop.href.startsWith('https')?'_blank':undefined} rel={stop.href.startsWith('https')?'noreferrer':undefined} aria-label={`Découvrir ${stop.name}${stop.place?', '+stop.place:''}`} onPointerEnter={event=>{if(event.pointerType==='mouse'){setHovered(true);inspect(index)}}} onPointerLeave={()=>setHovered(false)} onFocus={()=>inspect(index)} initial={reduced?false:{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.2}} transition={{duration:reduced?0:.55,delay:size.mobile?0:index*.08}}>
      <span className="journey-symbol">
       <svg className="journey-ring" viewBox="0 0 100 100" fill="none" aria-hidden="true"><circle cx="50" cy="50" r="48" fill="#fff" stroke="#9ca38f" strokeWidth="1"/><motion.circle cx="50" cy="50" r="48" fill="#c5e241" animate={{opacity:active===index?.12:0}} transition={{duration:reduced?0:.35}}/><motion.circle cx="50" cy="50" r="48" stroke="#232a1b" strokeWidth="1.8" animate={{pathLength:active===index?1:0,opacity:active===index?1:0}} transition={{duration:reduced?0:.7}} style={{rotate:-90,transformOrigin:'50% 50%'}}/></svg>
       <span className="journey-pictogram"><Icon size={28} strokeWidth={1.5}/></span>
      </span>
      <span className="journey-name">{stop.name}</span>{stop.place&&<span className="journey-place">{stop.place}</span>}
     </motion.a>
    </li>})}
   </ol>
  </div>
  <div className="journey-footer"><a className="journey-inspirations text-button" href="/snuug/experiences">Trouvez vos inspirations<InlineArrow/></a>{!reduced&&<button className="journey-motion-toggle" type="button" aria-label={paused?'Reprendre l’animation de l’itinéraire':'Mettre en pause l’animation de l’itinéraire'} aria-pressed={paused} onClick={()=>setPaused(value=>!value)}>{paused?<Play size={18} aria-hidden="true"/>:<Pause size={18} aria-hidden="true"/>}</button>}</div>
 </section>;
}
