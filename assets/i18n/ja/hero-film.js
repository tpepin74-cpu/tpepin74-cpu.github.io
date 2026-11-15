/* Hero film: silent background video, loaded only once the page is complete.
   The poster <picture> underneath is the LCP element; the video fades in over it
   once it actually plays. Codec (AV1 > HEVC > H.264) and framing (portrait crop
   on phones, 16:9 elsewhere) are chosen per device so only one small file is fetched. */
(()=>{'use strict';
 const video=document.querySelector('[data-hero-video]');if(!video)return;
 const hero=video.closest('.hero-film')||video.parentElement;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const portrait=matchMedia('(max-width: 760px) and (max-aspect-ratio: 3/4)');
 const conn=navigator.connection;
 const codecs=[['Av1','video/mp4; codecs="av01.0.05M.10"'],['Hevc','video/mp4; codecs="hvc1.1.6.L93.B0"'],['H264','video/mp4; codecs="avc1.640028"']];
 let visible=false,blocked=false,failed=false,armed=false,queue=null,layout='';
 video.muted=true;video.defaultMuted=true;video.playsInline=true;
 const slowNetwork=()=>!!conn&&(conn.saveData||/^(slow-2g|2g|3g)$/.test(conn.effectiveType||''));
 function candidates(){
  layout=portrait.matches?'m':'d';
  return codecs.map(([key,type])=>({url:video.dataset[(layout==='m'?'mobile':'desktop')+key],type}))
   .filter(c=>c.url&&video.canPlayType(c.type)!=='');
 }
 function load(at){
  const next=queue&&queue.shift();
  if(!next){failed=true;hero.classList.remove('is-film-playing');video.removeAttribute('src');video.load();return false;}
  video.preload='auto';video.src=next.url;
  if(at)video.addEventListener('loadedmetadata',()=>{try{video.currentTime=at%(video.duration||at+1)}catch{}},{once:true});
  video.load();return true;
 }
 async function play(){
  if(failed)return;
  if(!video.getAttribute('src')){queue=candidates();if(!load())return;}
  try{await video.play();blocked=false;}catch(e){if(e.name==='NotAllowedError')blocked=true;}
 }
 function sync(){
  if(!armed||window.castelMotionOff?.()||reduce.matches||slowNetwork()||!visible||document.hidden||blocked||failed){video.pause();return;}
  play();
 }
 video.addEventListener('playing',()=>hero.classList.add('is-film-playing'));
 video.addEventListener('emptied',()=>hero.classList.remove('is-film-playing'));
 video.addEventListener('error',()=>{if(!video.getAttribute('src'))return;video.pause();if(load())sync();});
 portrait.addEventListener('change',()=>{
  if(!video.getAttribute('src')||layout===(portrait.matches?'m':'d'))return;
  const at=video.currentTime;queue=candidates();hero.classList.remove('is-film-playing');if(load(at))sync();
 });
 addEventListener('pointerdown',()=>{if(blocked){blocked=false;sync();}},{passive:true}); /* iOS Low Power Mode: a tap may unlock playback. */
 document.addEventListener('visibilitychange',sync);window.addEventListener('castel-preferences',sync);
 reduce.addEventListener('change',sync);conn?.addEventListener?.('change',sync);
 if('IntersectionObserver' in window){new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.05}).observe(video);}else{visible=true;}
 /* Nothing is requested before the load event: then on the first interaction, or after a short idle delay. */
 /* Page scroll only (not bubbling-less inner carousels, hence no capture for 'scroll'). */
 const wake=[['pointerdown',true],['pointermove',true],['touchstart',true],['keydown',true],['wheel',true],['scroll',false]];
 function arm(){if(armed)return;armed=true;wake.forEach(([t,c])=>removeEventListener(t,arm,c));sync();}
 function ready(){
  wake.forEach(([t,c])=>addEventListener(t,arm,{capture:c,passive:true}));
  const idle=window.requestIdleCallback||(cb=>setTimeout(cb,0));
  setTimeout(()=>idle(arm,{timeout:1500}),3500);
 }
 if(document.readyState==='complete')ready();else addEventListener('load',ready,{once:true});
})();
