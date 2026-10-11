(()=>{'use strict';
function revealChapter(){if(!location.hash)return;let target;try{target=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch{return;}if(!target)return;let current=target;while(current){if(current instanceof HTMLDetailsElement)current.open=true;current=current.parentElement;}requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));}
window.addEventListener('hashchange',revealChapter);revealChapter();
const tabs=[...document.querySelectorAll('.booking-tabs [role=tab]')];
function choose(tab,focus=false){tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!active;});if(focus)tab.focus();}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>choose(tab));tab.addEventListener('keydown',e=>{let index;if(e.key==='ArrowRight'||e.key==='ArrowLeft')index=(i+1)%tabs.length;else if(e.key==='Home')index=0;else if(e.key==='End')index=tabs.length-1;else return;e.preventDefault();choose(tabs[index],true);});});
// Same-page restaurant links must also dismiss the open dialog.
document.querySelectorAll('#booking a[href$="/restaurant.html#table"]').forEach(a=>a.addEventListener('click',()=>{if(typeof closePanel==='function')closePanel('booking');else document.getElementById('booking').close();}));
})();
