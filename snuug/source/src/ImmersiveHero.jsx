import React,{useEffect,useRef,useState} from 'react';
import {motion,useScroll,useTransform,useReducedMotion,useMotionValueEvent} from 'framer-motion';
import {HERO_SHOTS,CHAPTERS,clamp,framePosition,activeShot,shotScale,blendAt,coverGeometry,visibleFrames} from './immersion-model';
import useLookAround from './useLookAround';
import useImmersionFrames from './useImmersionFrames';
import './immersion.css';
export {HERO_SHOTS,activeShot,shotScale} from './immersion-model';

function Arrow({down=false}){return <svg className="immersion-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{transform:down?'rotate(135deg)':undefined}}><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.15"/></svg>}
function TiltIcon(){return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="7" y="3" width="10" height="18" rx="2" transform="rotate(14 12 12)" stroke="currentColor" strokeWidth="1.2"/><path d="m2 8 2-2 1 3M22 16l-2 2-1-3M11 17h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>}
function CenterIcon(){return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" stroke="currentColor" strokeWidth="1.2"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.2"/></svg>}

function Shot({index,src,base,progress,reduced,look,size,mobile}){
  const aspect=index===0&&mobile?941/1672:1672/941;
  const geometry=coverGeometry(size.width,size.height,aspect,1,0,0);
  const scale=useTransform(progress,p=>reduced?1:shotScale(index,p));
  const x=useTransform([scale,look.x],([s,l])=>reduced?0:coverGeometry(size.width,size.height,aspect,s,l,0).x);
  const y=useTransform([scale,look.y],([s,l])=>reduced?0:coverGeometry(size.width,size.height,aspect,s,0,l).y);
  const rotateY=useTransform(look.x,value=>reduced?0:clamp(value,-1,1)*.5);
  const rotateX=useTransform(look.y,value=>reduced?0:clamp(value,-1,1)*-.35);
  const opacity=useTransform(progress,p=>base?1:blendAt(index,p));
  return <motion.div className="immersion-frame" aria-hidden="true">
    <motion.img src={src} alt="" draggable="false" decoding="async" style={{width:geometry.width,height:geometry.height,marginLeft:-geometry.width/2,marginTop:-geometry.height/2,scale,x,y,rotateX,rotateY,transformPerspective:Math.max(size.width,size.height)*1.5,opacity:reduced?1:opacity}}/>
  </motion.div>;
}

export default function ImmersiveHero({onBook}){
  const ref=useRef(null),viewRef=useRef(null),lastFrame=useRef(0),reduced=useReducedMotion();
  const [size,setSize]=useState({width:1440,height:900});
  const [active,setActive]=useState(0),[segment,setSegment]=useState(0),[manual,setManual]=useState(0);
  const [immersing,setImmersing]=useState(true),[introVisible,setIntroVisible]=useState(true),[finishVisible,setFinishVisible]=useState(false);
  const {scrollYProgress}=useScroll({target:ref,offset:['start start','end end']});
  // Scroll position is the source of truth: no spring tail after the finger stops.
  const progress=useTransform(scrollYProgress,p=>clamp(p));
  const look=useLookAround(viewRef,reduced);
  const mobile=size.width<=600;
  const {urls,ready,compact}=useImmersionFrames(mobile,reduced?manual:segment);
  const available=visibleFrames(reduced?manual:segment,ready,lastFrame.current);
  const frames=reduced?available.slice(0,1):available;
  const shown=frames.includes(active)?active:(frames[0]??0);
  useEffect(()=>{if(frames.length)lastFrame.current=shown},[shown,frames.length]);
  useEffect(()=>{
    const measure=()=>{if(viewRef.current){const {width,height}=viewRef.current.getBoundingClientRect();setSize(previous=>previous.width===width&&previous.height===height?previous:{width,height})}};
    measure();const observer=new ResizeObserver(measure);observer.observe(viewRef.current);
    return()=>observer.disconnect();
  },[]);
  const introOpacity=useTransform(progress,[0,.018,.055],[1,1,0]);
  const introY=useTransform(progress,[0,.055],[0,-18]);
  const finishOpacity=useTransform(progress,[.94,.985,1],[0,1,1]);
  const finishY=useTransform(progress,[.94,.985],[15,0]);
  const shadeOpacity=useTransform(progress,[0,.07,.16,.91,1],[.65,.35,.25,.25,.5]);
  const lastUI=useRef({});
  useMotionValueEvent(progress,'change',p=>{
    if(reduced)return;
    const next={active:activeShot(p),segment:Math.floor(framePosition(p)),intro:p<.055,finish:p>.965};
    const previous=lastUI.current;
    if(next.active!==previous.active)setActive(next.active);
    if(next.segment!==previous.segment)setSegment(next.segment);
    if(next.intro!==previous.intro)setIntroVisible(next.intro);
    if(next.finish!==previous.finish)setFinishVisible(next.finish);
    lastUI.current=next;
  });
  useMotionValueEvent(scrollYProgress,'change',p=>setImmersing(p<.999));
  const jump=index=>{
    if(reduced){setManual(index);setActive(index);return}
    const rect=ref.current.getBoundingClientRect();
    window.scrollTo({top:window.scrollY+rect.top+(ref.current.offsetHeight-viewRef.current.offsetHeight)*index/(HERO_SHOTS.length-1),behavior:'smooth'});
  };
  const continuePage=e=>{e.preventDefault();document.getElementById('esprit')?.scrollIntoView({behavior:reduced?'instant':'smooth'})};
  const intro=reduced?manual===0:introVisible;
  const chapter=Math.floor((reduced?manual:active)/2);
  const sensorBusy=look.status==='asking'||look.status==='waiting';
  return <section id="accueil" ref={ref} className={'immersion-hero'+(reduced?' is-reduced':'')} data-compact={compact} data-immersing={immersing&&!reduced} aria-label="Entrez dans le SNUUG, visite illustrée au défilement">
    <div className="immersion-sticky" ref={viewRef}>
      <div className="immersion-visual" role="group" tabIndex={reduced?-1:0} aria-label={'Vue reconstituée : '+HERO_SHOTS[shown].alt} aria-describedby="immersion-instructions" {...look.handlers}>
        {frames.map((index,i)=><Shot key={urls[index]} index={index} src={urls[index]} base={i===0} progress={progress} reduced={reduced} look={look} size={size} mobile={mobile}/>)}
      </div>
      <p id="immersion-instructions" className="immersion-sr">{reduced?'Explorez les seize vues avec les boutons précédent et suivant.':'Faites défiler pour avancer. Glissez horizontalement, déplacez la souris ou utilisez les flèches gauche et droite pour regarder autour de vous. La touche Origine recentre la vue.'}</p>
      <motion.div className="immersion-shade" style={{opacity:reduced?.5:shadeOpacity}}/>
      <a className="immersion-skip" href="#esprit" onClick={continuePage} aria-label="Passer l’immersion et découvrir le site" title="Passer l’immersion"><Arrow down/></a>
      <motion.div className="immersion-intro" style={{opacity:reduced?(manual===0?1:0):introOpacity,y:reduced?0:introY,pointerEvents:intro?'auto':'none'}} aria-hidden={!intro}>
        <h1>Entrez.</h1>
        <button onClick={()=>jump(2)} tabIndex={intro?0:-1} className="immersion-enter" aria-label="Avancer dans le SNUUG">{reduced?'Découvrir':'Défiler'}<Arrow down/></button>
      </motion.div>
      <motion.div className="immersion-finish" style={{opacity:reduced?0:finishOpacity,y:reduced?0:finishY,pointerEvents:!reduced&&finishVisible?'auto':'none'}} aria-hidden={reduced||!finishVisible}>
        <button className="button light" tabIndex={!reduced&&finishVisible?0:-1} onClick={onBook}>Réserver<Arrow/></button>
      </motion.div>
      {!reduced&&<div className="immersion-look">
        <div className="immersion-look-actions">
          {look.mobile&&<button className={'immersion-tilt'+(look.wanted?' is-on':'')} onClick={look.wanted?look.stop:look.enable} disabled={look.status==='asking'} aria-pressed={look.wanted} aria-label={look.wanted?'Désactiver l’inclinaison':'Activer l’inclinaison du téléphone'}><TiltIcon/><span>{look.wanted?(sensorBusy?'Connexion…':'Inclinaison activée'):'Activer l’inclinaison'}</span>{look.wanted&&<span className="immersion-off" aria-hidden="true">×</span>}</button>}
          <button className="immersion-center" onClick={look.center} title="Recentrer le regard" aria-label="Recentrer le regard"><CenterIcon/></button>
        </div>
        <p className="immersion-look-message" role="status" aria-live="polite">{look.message||(!look.wanted?(look.mobile?'Glissez pour regarder autour':'Déplacez la souris pour explorer'):'')}</p>
      </div>}
      <div className="immersion-wayfinding"><nav aria-label="Étapes de l’immersion">{CHAPTERS.map((s,i)=><button key={s.name} className={chapter===i?'active':''} aria-current={chapter===i?'step':undefined} onClick={()=>jump(s.index)} aria-label={'Aller à '+s.name} title={s.name}><span/></button>)}</nav></div>
      {reduced&&<div className="immersion-manual"><button onClick={()=>jump(Math.max(0,manual-1))} disabled={manual===0} aria-label="Vue précédente">←</button><span aria-live="polite">{manual+1} / {HERO_SHOTS.length}</span><button onClick={()=>jump(Math.min(HERO_SHOTS.length-1,manual+1))} disabled={manual===HERO_SHOTS.length-1} aria-label="Vue suivante">→</button></div>}
      <div className="immersion-progress" aria-hidden="true"><motion.span style={{scaleX:reduced?((manual+1)/HERO_SHOTS.length):progress}}/></div>
      {reduced&&<button className="immersion-static-book button light" onClick={onBook}>Réserver<Arrow/></button>}
    </div>
  </section>;
}
