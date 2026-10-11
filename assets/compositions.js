/* Manual, touch and keyboard controls for the reference compositions. */
(()=>{'use strict';
const all=(s,root=document)=>[...root.querySelectorAll(s)],one=(s,root=document)=>root.querySelector(s);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');

all('[data-room-carousel]').forEach(stage=>{
 const slides=all('[data-room-slide]',stage),prev=one('[data-room-prev]',stage),next=one('[data-room-next]',stage);
 const link=one('[data-room-link]',stage),name=one('[data-room-name]',stage),count=one('[data-room-index]',stage),status=one('[data-room-status]',stage);
 let index=0,busy=false,touch=null;
 async function show(nextIndex){
  if(busy||nextIndex===index)return;busy=true;prev.disabled=next.disabled=true;stage.setAttribute('aria-busy','true');
  const slide=slides[nextIndex],img=one('img',slide);
  if(img.dataset.src){img.loading='eager';img.srcset=img.dataset.srcset||'';img.src=img.dataset.src;delete img.dataset.src;delete img.dataset.srcset;}
  let loaded=false;try{await img.decode();loaded=img.naturalWidth>0;}catch{loaded=img.complete&&img.naturalWidth>0;}
  if(loaded){
   slides[index].classList.remove('is-active');slides[index].setAttribute('aria-hidden','true');index=nextIndex;
   slide.classList.add('is-active');slide.setAttribute('aria-hidden','false');
   link.href=slide.dataset.roomHref;name.textContent=slide.dataset.roomLabel;
   count.textContent=String(index+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');
   stage.style.setProperty('--room-index',index);status.textContent=slide.dataset.roomLabel+', photographie '+(index+1)+' sur '+slides.length+'.';
  }else{status.textContent='La photographie n’a pas pu être chargée. La catégorie actuelle reste accessible.';}
  busy=false;prev.disabled=next.disabled=false;stage.removeAttribute('aria-busy');
 }
 const move=direction=>show((index+direction+slides.length)%slides.length);
 prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
 stage.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}});
 stage.addEventListener('touchstart',e=>{if(e.target.closest('a,button'))return;const p=e.changedTouches[0];touch={x:p.clientX,y:p.clientY};},{passive:true});
 stage.addEventListener('touchend',e=>{if(!touch)return;const p=e.changedTouches[0],dx=p.clientX-touch.x,dy=p.clientY-touch.y;touch=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.6)move(dx<0?1:-1);},{passive:true});
 stage.addEventListener('touchcancel',()=>{touch=null;},{passive:true});
});

all('[data-framed-gallery]').forEach(gallery=>{
 const track=one('[data-framed-track]',gallery),cards=all('[data-framed-card]',gallery);
 const prev=one('[data-frame-prev]',gallery),next=one('[data-frame-next]',gallery),position=one('[data-frame-position]',gallery);
 let active=Math.min(1,cards.length-1),scrollTimer=0,resizeTimer=0;
 function controls(){prev.disabled=active===0;next.disabled=active===cards.length-1;position.textContent=String(active+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0');}
 function center(index,instant=false){active=Math.max(0,Math.min(cards.length-1,index));const card=cards[active];track.scrollTo({left:card.offsetLeft-(track.clientWidth-card.offsetWidth)/2,behavior:instant||reduced.matches?'instant':'smooth'});controls();}
 function settle(){const middle=track.scrollLeft+track.clientWidth/2;let best=0,distance=Infinity;cards.forEach((card,i)=>{const delta=Math.abs(card.offsetLeft+card.offsetWidth/2-middle);if(delta<distance){distance=delta;best=i;}});active=best;controls();}
 prev.addEventListener('click',()=>center(active-1));next.addEventListener('click',()=>center(active+1));
 track.addEventListener('scroll',()=>{clearTimeout(scrollTimer);scrollTimer=setTimeout(settle,130);},{passive:true});
 track.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();center(active+(e.key==='ArrowRight'?1:-1));one('a',cards[active])?.focus({preventScroll:true});}});
 addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>center(active,true),120);},{passive:true});
 requestAnimationFrame(()=>center(active,true));
});
})();
