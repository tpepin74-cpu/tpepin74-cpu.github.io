/* Silent background video without visible controls. */
(()=>{'use strict';
 const video=document.querySelector('[data-hero-video]');if(!video)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let visible=false,blocked=false,failed=false;
 video.muted=true;video.defaultMuted=true;
 async function play(){if(failed)return;if(!video.getAttribute('src')){video.src=matchMedia("(max-width: 760px)").matches ? video.dataset.srcMobile : video.dataset.src;video.load();}try{await video.play();blocked=false;}catch(e){if(e.name==='NotAllowedError')blocked=true;}}
 function sync(){if(window.castelMotionOff?.()||reduce.matches||navigator.connection?.saveData||!visible||document.hidden||blocked||failed){video.pause();return;}play();}
 video.addEventListener('error',()=>{if(failed)return;failed=true;video.pause();video.removeAttribute('src');video.load();});
 document.addEventListener('visibilitychange',sync);window.addEventListener('castel-preferences',sync);
 reduce.addEventListener('change',sync);
 if('IntersectionObserver' in window){new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.05}).observe(video);}else{visible=true;sync();}
})();
