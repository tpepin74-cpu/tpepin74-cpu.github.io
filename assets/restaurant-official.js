(()=>{'use strict';const frame=document.querySelector('#restaurant-booking-frame');if(!frame)return;const placeholder=document.querySelector('#restaurant-widget-placeholder'),wrapper=document.querySelector('#restaurant-widget-frame'),status=document.querySelector('#restaurant-widget-status');let loaded=false,timer;
function open(){if(loaded)return;loaded=true;placeholder.hidden=true;wrapper.hidden=false;frame.loading='eager';frame.src=frame.dataset.src;timer=setTimeout(()=>{status.hidden=false;status.textContent='Si le calendrier ne s’affiche pas, utilisez le lien « Ouvrir la réservation en plein écran » ci-dessous.';},15000);}
frame.addEventListener('load',()=>{if(!loaded)return;clearTimeout(timer);status.hidden=true;});frame.addEventListener('error',()=>{clearTimeout(timer);status.hidden=false;status.textContent='Le module ne répond pas. Ouvrez la réservation en plein écran à l’aide du lien ci-dessous.';});
document.querySelector('#load-restaurant-booking').addEventListener('click',()=>{open();frame.focus();});
// A reservation link is an explicit visitor request to open the official service.
function fromHash(){if(location.hash==='#table')open();}window.addEventListener('hashchange',fromHash);fromHash();
})();
