/* A lightweight text rotation; every invitation is already present in the HTML. */
(()=>{'use strict';
 const title=document.querySelector('[data-re-headline]');if(!title)return;
 const words=[...title.querySelectorAll('[data-re-word]')];
 if(words.length<2)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let current=0,timer=null,cleanup=null,visible=!('IntersectionObserver' in window),hovered=false;
 const motionOff=()=>reduced.matches||window.castelMotionOff?.()||document.documentElement.dataset.motionOff==='true'||navigator.connection?.saveData;
 const allowed=()=>visible&&!document.hidden&&!hovered&&!motionOff();
 function settle(){words.forEach(word=>word.classList.remove('is-leaving'));}
 function stop(){clearTimeout(timer);clearTimeout(cleanup);timer=null;cleanup=null;settle();}
 function schedule(){if(allowed()&&timer===null)timer=setTimeout(next,4200);}
 function next(){
  timer=null;if(!allowed()){stop();return;}
  words[current].classList.remove('is-current');words[current].classList.add('is-leaving');
  current=(current+1)%words.length;words[current].classList.remove('is-leaving');words[current].classList.add('is-current');
  cleanup=setTimeout(()=>{settle();cleanup=null;},950);schedule();
 }
 function sync(){stop();schedule();}
 window.addEventListener('castel-preferences',sync);
 document.addEventListener('visibilitychange',sync);
 window.addEventListener('pagehide',stop);window.addEventListener('pageshow',sync);
 reduced.addEventListener('change',sync);
 navigator.connection?.addEventListener?.('change',sync);
 title.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hovered=true;sync();}});
 title.addEventListener('pointerleave',()=>{hovered=false;sync();});
 if('IntersectionObserver' in window){new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.08}).observe(title);}
 else sync();
})();
