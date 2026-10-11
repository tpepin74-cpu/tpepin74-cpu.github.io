(()=>{'use strict';const frame=document.querySelector('#restaurant-booking-frame');if(!frame)return;const placeholder=document.querySelector('#restaurant-widget-placeholder'),wrapper=document.querySelector('#restaurant-widget-frame'),status=document.querySelector('#restaurant-widget-status');let loaded=false,timer;
function open(){if(loaded)return;loaded=true;placeholder.hidden=true;wrapper.hidden=false;frame.loading='eager';frame.src=frame.dataset.src;timer=setTimeout(()=>{status.hidden=false;status.textContent="Если календарь не отображается, воспользуйтесь ссылкой «Открыть бронирование на весь экран» ниже.";},15000);}
frame.addEventListener('load',()=>{if(!loaded)return;clearTimeout(timer);status.hidden=true;});frame.addEventListener('error',()=>{clearTimeout(timer);status.hidden=false;status.textContent="Модуль не отвечает. Откройте бронирование на весь экран по ссылке ниже.";});
document.querySelector('#load-restaurant-booking').addEventListener('click',()=>{open();frame.focus();});
// A reservation link is an explicit visitor request to open the official service.
function fromHash(){if(location.hash==='#table')open();}window.addEventListener('hashchange',fromHash);fromHash();
})();
