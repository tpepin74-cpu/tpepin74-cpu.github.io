/* Original-photo cinema, touch rails, and the app-style shell. */
(()=>{'use strict';
const $=(s,root=document)=>root.querySelector(s),all=(s,root=document)=>[...root.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const header=$('.editorial-header');
const scrollHeader=()=>header?.classList.toggle('is-scrolled',scrollY>45);
scrollHeader();addEventListener('scroll',scrollHeader,{passive:true});
all('.nav-panel a').forEach(a=>a.addEventListener('click',()=>closePanel('navigation',false)));
const path=location.pathname;
all('.nav-panel nav a').forEach(a=>{if(new URL(a.href).pathname===path)a.setAttribute('aria-current','page');});
const pagePath=path.replace(/^\/(?:en|de|es|it|ja|zh|ru)(?=\/)/,'');
const dock=pagePath.startsWith('/chambre')?"客房":pagePath==="/zh/agenda.html"?'agenda':null;
if(dock){const link=$(`[data-dock="${dock}"]`);link?.classList.add('is-current');if(link&&new URL(link.href).pathname===path)link.setAttribute('aria-current','page');}
all('[data-reserve]').forEach(a=>a.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();showPanel('booking',a);}));

all('[data-cinema]').forEach(stage=>{
  const frames=all('.cinema-frame',stage),tabs=all('[data-scene]',stage),pause=$('[data-cinema-pause]',stage),status=$('[data-scene-status]',stage);
  let index=0,elapsed=0,last=0,raf=0,inView=false,transitioning=false;
  let userPaused=reduce.matches||!!navigator.connection?.saveData;
  const duration=9500;
  const running=()=>inView&&!document.hidden&&!userPaused&&!window.castelMotionOff?.();
  const load=async frame=>{const img=$('img',frame);if(img.dataset.src){img.srcset=img.dataset.srcset||'';img.src=img.dataset.src;delete img.dataset.src;delete img.dataset.srcset;img.loading='eager';}try{await img.decode();return img.naturalWidth>0;}catch{return img.complete&&img.naturalWidth>0;}};
  function renderState(){const active=running();stage.classList.toggle('is-playing',active);pause.setAttribute('aria-pressed',String(userPaused));pause.setAttribute('aria-label',userPaused?"播放照片轮播":"暂停照片轮播");if(active&&!raf){last=performance.now();raf=requestAnimationFrame(tick);}else if(!active&&raf){cancelAnimationFrame(raf);raf=0;}}
  async function select(next,manual=false){if(transitioning)return;if(next===index){elapsed=0;return;}transitioning=true;const ok=await load(frames[next]);if(ok){frames[index].classList.remove('is-active');frames[index].setAttribute('aria-hidden','true');index=next;frames[index].classList.add('is-active');frames[index].setAttribute('aria-hidden','false');tabs.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));if(manual)status.textContent=$('img',frames[index]).alt;}else{userPaused=true;status.textContent="此照片无法加载。您可继续浏览网站。";}elapsed=0;transitioning=false;renderState();}
  function tick(now){raf=0;if(!running())return;elapsed+=Math.min(now-last,100);last=now;stage.style.setProperty('--scene-progress',Math.min(elapsed/duration,1));if(elapsed>=duration&&!transitioning){elapsed=0;select((index+1)%frames.length);}raf=requestAnimationFrame(tick);}
  tabs.forEach((b,i)=>b.addEventListener('click',()=>{userPaused=true;renderState();select(i,true);}));
  pause.addEventListener('click',()=>{userPaused=!userPaused;renderState();});
  document.addEventListener('visibilitychange',renderState);window.addEventListener('castel-preferences',renderState);
  reduce.addEventListener('change',()=>{if(reduce.matches)userPaused=true;renderState();});
  if('IntersectionObserver' in window){new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;renderState();},{threshold:.08}).observe(stage);}else{inView=true;renderState();}
  let touch=null;
  stage.addEventListener('touchstart',e=>{if(e.target.closest('button,a'))return;const p=e.changedTouches[0];touch={x:p.clientX,y:p.clientY};},{passive:true});
  stage.addEventListener('touchend',e=>{if(!touch)return;const p=e.changedTouches[0],dx=p.clientX-touch.x,dy=p.clientY-touch.y;touch=null;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.6){userPaused=true;renderState();select((index+(dx<0?1:-1)+frames.length)%frames.length,true);}},{passive:true});
  renderState();
});

all('[data-rail]').forEach((rail,i)=>{
  if(!rail.id)rail.id=`touch-rail-${i}`;
  const controls=document.createElement('div');controls.className='rail-controls';
  const hint=document.createElement('span');hint.textContent="随心探索";
  const buttons=document.createElement('div');buttons.className='rail-buttons';
  const prev=document.createElement('button'),next=document.createElement('button');
  prev.append(arrowIcon('left'));next.append(arrowIcon('right'));prev.type=next.type='button';
  prev.setAttribute('aria-label',"上一组推荐");next.setAttribute('aria-label',"下一组推荐");
  for(const b of[prev,next])b.setAttribute('aria-controls',rail.id);
  buttons.append(prev,next);controls.append(hint,buttons);rail.after(controls);
  function update(){const total=all('.card,.event-card',rail).filter(x=>!x.hidden).length;controls.hidden=total<2;prev.disabled=rail.scrollLeft<6;next.disabled=rail.scrollLeft>=rail.scrollWidth-rail.clientWidth-6;}
  function step(direction){const card=all('.card,.event-card',rail).find(x=>!x.hidden);if(!card)return;rail.scrollBy({left:direction*(card.getBoundingClientRect().width+(parseFloat(getComputedStyle(rail).columnGap)||0)),behavior:reduce.matches?'instant':'smooth'});}
  prev.addEventListener('click',()=>step(-1));next.addEventListener('click',()=>step(1));
  rail.addEventListener('scroll',update,{passive:true});
  addEventListener('resize',update,{passive:true});
  new MutationObserver(update).observe(rail,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});update();
});
})();
