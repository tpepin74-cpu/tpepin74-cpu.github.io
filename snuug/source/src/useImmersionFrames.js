import {imageAsset} from './image-assets';
import {useEffect,useMemo,useRef,useState} from 'react';
import {HERO_SHOTS} from './immersion-model';

export default function useImmersionFrames(mobile,segment) {
  const [compact,setCompact]=useState(false),[ready,setReady]=useState(new Set());
  const focus=useRef(segment),pump=useRef(()=>{});
  useEffect(()=>{
    const connection=navigator.connection;
    setCompact(Boolean(connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType||'') || (navigator.deviceMemory && navigator.deviceMemory<=4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency<=4)));
  },[]);
  const urls=useMemo(()=>HERO_SHOTS.map((shot,index)=>imageAsset(mobile&&index===0
    ?'/images/immersion/snuug-v2-mobile-960.webp'
    :`/images/immersion/${shot.path}-${compact?960:1672}.webp`)),[mobile,compact]);
  useEffect(()=>{
    let alive=true,inFlight=0;
    const requested=new Set(),images=new Map(),attempts=new Map();
    let retryTimer;
    setReady(new Set());
    const load=()=>{
      if(!alive)return;
      const near=[focus.current,focus.current+1,focus.current-1,focus.current+2,...(compact?[]:[0])];
      const order=[...new Set([...near,...(compact?[]:urls.map((_,i)=>i))])].filter(i=>i>=0&&i<urls.length);
      while(inFlight<(compact?1:2)){
        const index=order.find(i=>!requested.has(i));if(index===undefined)break;
        requested.add(index);inFlight++;
        const img=new Image();images.set(index,img);img.decoding='async';img.fetchPriority=index===focus.current?'high':'low';
        attempts.set(index,(attempts.get(index)||0)+1);
        let finished=false;
        const finish=ok=>{
          if(finished)return;finished=true;inFlight--;
          if(alive){
            if(ok)setReady(previous=>new Set([...previous,index]));
            else if(attempts.get(index)<2){
              clearTimeout(retryTimer);
              retryTimer=setTimeout(()=>{requested.delete(index);load()},1500);
            }
            // Keep decoded neighbors pinned; release distant bitmaps on small devices.
            if(compact){for(const [key,image] of images){if(image.complete&&Math.abs(key-focus.current)>2){images.delete(key);requested.delete(key);setReady(previous=>{const next=new Set(previous);next.delete(key);return next})}}}
            load();
          }
        };
        img.onload=async()=>{try{await img.decode()}catch{/* Loaded images remain usable without decode support. */}finish(img.naturalWidth>0)};
        img.onerror=()=>finish(false);img.src=urls[index];
      }
    };
    pump.current=load;load();
    return()=>{alive=false;clearTimeout(retryTimer);pump.current=()=>{};images.forEach(img=>{img.onload=null;img.onerror=null})};
  },[urls,compact]);
  useEffect(()=>{focus.current=segment;pump.current()},[segment]);
  return {urls,ready,compact};
}
