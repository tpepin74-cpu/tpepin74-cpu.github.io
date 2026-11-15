/* Castel Damandre — réservation par catégorie (moteur Reservit) et navigation dans les galeries photo.
   Chargé en différé par /assets/i18n.js ; aucun cookie, aucun suivi. */
(()=>{'use strict';
const LANG=String(window.CASTEL_LANGUAGE||document.documentElement.lang||'fr').slice(0,2).toLowerCase();
const ENGINE='https://secure.reservit.com/reservit/reserhotel.php';
const HOTEL={id:'233',hotelid:'2176'};
// Le japonais n'existe pas dans Reservit : l'anglais prend le relais.
const ENGINE_LANG={fr:'FR',en:'EN',de:'DE',es:'ES',it:'IT',ja:'EN',zh:'ZH',ru:'RU'};
// Codes « roomtcode » des catégories dans le moteur Reservit de l'hôtel (relevés le 15.11.2026).
const ROOMS=[
 ['single','125552'],
 ['classique','57825'],
 ['superieure','117487'],
 ['privilege','192434'],
 ['junior-jacuzzi','57831'],
 ['junior-privilege','91473'],
 ['famille-jacuzzi','80234']
];
const NAMES={
 fr:['Chambre Single','Chambre Classique','Chambre Supérieure','Chambre Privilège','Suite Junior Jacuzzi','Suite Junior Privilège Jacuzzi','Suite Famille Jacuzzi'],
 en:['Single Room','Classic Room','Superior Room','Privilège Room','Junior Suite Jacuzzi','Junior Privilège Suite Jacuzzi','Family Suite Jacuzzi'],
 de:['Zimmer Single','Zimmer Classique','Zimmer Supérieure','Zimmer Privilège','Junior-Suite Jacuzzi','Suite Junior Privilège Jacuzzi','Suite Famille Jacuzzi'],
 es:['Habitación Individual','Habitación Clásica','Habitación Superior','Habitación Privilegio','Suite Junior Jacuzzi','Suite Junior Privilegio Jacuzzi','Suite Familiar Jacuzzi'],
 it:['Camera Singola','Camera Classica','Camera Superior','Camera Privilegio','Suite Junior Jacuzzi','Suite Junior Privilegio Jacuzzi','Suite Famiglia Jacuzzi'],
 ja:['シングルルーム','クラシックルーム','スーペリアルーム','プリヴィレージルーム','ジュニアスイート ジャグジー','ジュニア・プリヴィレージスイート ジャグジー','ファミリースイート ジャグジー'],
 zh:['单人客房','经典客房','高级客房','尊享客房','小型套房 按摩浴缸','尊享小型套房 按摩浴缸','家庭套房 按摩浴缸'],
 ru:['Одноместный номер','Классический номер','Улучшенный номер','Номер «Привилеж»','Полулюкс Джакузи','Полулюкс «Привилеж» Джакузи','Семейный люкс Джакузи']
};
const TEXT={
 fr:{category:'Catégorie',all:'Toutes nos chambres',prev:'Photo précédente',next:'Photo suivante'},
 en:{category:'Room category',all:'All our rooms',prev:'Previous photo',next:'Next photo'},
 de:{category:'Kategorie',all:'Alle unsere Zimmer',prev:'Vorheriges Foto',next:'Nächstes Foto'},
 es:{category:'Categoría',all:'Todas nuestras habitaciones',prev:'Foto anterior',next:'Foto siguiente'},
 it:{category:'Categoria',all:'Tutte le nostre camere',prev:'Foto precedente',next:'Foto successiva'},
 ja:{category:'客室タイプ',all:'すべての客室',prev:'前の写真',next:'次の写真'},
 zh:{category:'房型',all:'全部房型',prev:'上一张照片',next:'下一张照片'},
 ru:{category:'Категория',all:'Все номера',prev:'Предыдущее фото',next:'Следующее фото'}
};
const T=TEXT[LANG]||TEXT.fr, N=NAMES[LANG]||NAMES.fr;
const SINGLE=ROOMS[0][1];
const pageSlug=(location.pathname.match(/chambre-([a-z-]+)\.html$/)||[])[1];
const pageCode=(ROOMS.find(([slug])=>slug===pageSlug)||[])[1]||'';

function engineURL({arrival,departure,adults,code}={}){
 const p=new URLSearchParams({lang:ENGINE_LANG[LANG]||'EN',id:HOTEL.id,hotelid:HOTEL.hotelid});
 // Avec des dates, Reservit affiche directement les offres disponibles (sinon : formulaire vide).
 if(arrival&&departure&&departure>arrival){
  const [y,m,d]=arrival.split('-');
  p.set('fday',String(Number(d)));p.set('fmonth',String(Number(m)));p.set('fyear',y);
  p.set('nbnights',String(Math.round((Date.parse(departure)-Date.parse(arrival))/864e5)));
  p.set('nbadt',String(adults||2));p.set('nbchd','0');
 }
 if(code)p.set('roomtcode',code);
 return ENGINE+'?'+p.toString();
}
function openEngine(url){
 const w=window.open(url,'_blank');
 if(w){try{w.opener=null;}catch(e){}}else location.assign(url);
}

function injectStyles(){
 if(document.getElementById('castel-reservation-css'))return;
 const css=`
.sheet-form .sheet-category{grid-column:1/-1}
.booking-sheet .sheet-form .sheet-category{grid-column:1/-1}
#lightbox .modal-box{position:relative}
#lightbox #lightbox-img{transition:opacity .25s ease}
#lightbox #lightbox-img.is-loading{opacity:.25}
.lightbox-nav{position:absolute;top:50%;z-index:2;display:flex;align-items:center;justify-content:center;width:44px;height:44px;padding:0;margin-top:-22px;border:1px solid #d6d6c9;border-radius:50%;background:#f3f0e9eb;color:var(--ink,#223b32);cursor:pointer;box-shadow:0 4px 18px #10261c1f;transition:background .2s ease,color .2s ease,border-color .2s ease}
.lightbox-nav svg{width:18px;height:18px}
.lightbox-nav:hover{background:var(--ink,#223b32);border-color:var(--ink,#223b32);color:var(--paper,#f3f0e9)}
.lightbox-nav:focus-visible{outline:2px solid var(--ink,#223b32);outline-offset:3px}
.lightbox-prev{left:3px}.lightbox-next{right:3px}
.lightbox-nav[hidden],.lightbox-count[hidden]{display:none}
.lightbox-count{margin:6px 0 0;text-align:center;font:11px/1.4 var(--sans,'DM Sans',Arial,sans-serif);letter-spacing:.14em;color:var(--muted,#626a60)}
@media(max-width:700px){.lightbox-nav{width:40px;height:40px;margin-top:-20px}.lightbox-prev{left:6px}.lightbox-next{right:6px}}
@media(prefers-reduced-motion:reduce){#lightbox #lightbox-img,.lightbox-nav{transition:none}}`;
 const style=document.createElement('style');style.id='castel-reservation-css';style.textContent=css;document.head.append(style);
}

/* 1. Formulaires de réservation : dates + catégorie transmises au moteur officiel. */
function setupBooking(){
 const sheetForm=document.querySelector('#booking form[data-booking]');
 const familyLink=document.querySelector('#booking .sheet-family');
 let select=null,autoSingle=false;
 if(sheetForm&&!sheetForm.querySelector('[name=roomtcode]')){
  const field=document.createElement('div');field.className='sheet-category';
  const label=document.createElement('label');label.htmlFor='sheet-category';label.textContent=T.category;
  select=document.createElement('select');select.id='sheet-category';select.name='roomtcode';
  select.append(new Option(T.all,''));
  ROOMS.forEach(([,code],i)=>select.append(new Option(N[i],code)));
  field.append(label,select);sheetForm.prepend(field);
  const guests=sheetForm.elements.nbadt;
  const sync=()=>{
   if(guests){
    if(select.value===SINGLE){if(guests.value!=='1'){guests.value='1';autoSingle=true;}}
    else if(autoSingle&&guests.value==='1'){guests.value='2';autoSingle=false;}
   }
   if(familyLink)familyLink.href=engineURL({code:select.value});
  };
  select.addEventListener('change',sync);
  guests?.addEventListener('change',()=>{autoSingle=false;});
  sync();
 }
 document.querySelectorAll('form[data-booking]').forEach(form=>{
  form.addEventListener('submit',e=>{
   if(e.defaultPrevented)return;
   const arrival=form.elements.date_arrival?.value,departure=form.elements.date_departure?.value;
   if(!arrival||!departure||departure<=arrival)return;
   e.preventDefault();
   openEngine(engineURL({arrival,departure,adults:form.elements.nbadt?.value,code:form.elements.roomtcode?.value}));
  });
 });
 // Les boutons « Réserver » génériques ouvrent la fiche sur toutes les chambres.
 document.querySelectorAll('[data-reserve]').forEach(a=>a.addEventListener('click',()=>{
  if(select&&select.value){select.value='';select.dispatchEvent(new Event('change'));}
 }));
 // Bouton « Réserver cette catégorie » : fiche de réservation pré-réglée sur la catégorie de la page.
 if(!pageCode)return;
 document.querySelectorAll('main a[href*="reservit.com/reservit/reserhotel.php"]').forEach(a=>{
  a.href=engineURL({code:pageCode});
  a.dataset.roomBooking=pageCode;
  a.addEventListener('click',e=>{
   if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button)return;
   const sheet=document.getElementById('booking');
   if(!sheet||!select||typeof window.showPanel!=='function')return;
   e.preventDefault();
   const stay=document.getElementById('stay-tab');
   if(stay&&stay.getAttribute('aria-selected')!=='true')stay.click();
   select.value=pageCode;select.dispatchEvent(new Event('change'));
   window.showPanel('booking',a);
  });
 });
}

/* 2. Galerie agrandie : flèches, clavier et balayage pour passer d'une photo à l'autre. */
function setupLightbox(){
 const lb=document.getElementById('lightbox'),img=document.getElementById('lightbox-img'),cap=document.getElementById('lightbox-caption');
 if(!lb||!img||lb.querySelector('.lightbox-nav'))return;
 const box=lb.querySelector('.modal-box')||lb;
 let group=[],index=0;
 const chevron=d=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="'+d+'"/></svg>';
 const makeButton=(dir,label,path)=>{
  const b=document.createElement('button');b.type='button';b.className='lightbox-nav lightbox-'+dir;
  b.setAttribute('aria-label',label);b.title=label;b.innerHTML=chevron(path);b.hidden=true;
  b.addEventListener('click',e=>{e.stopPropagation();step(dir==='prev'?-1:1);});
  return b;
 };
 const prev=makeButton('prev',T.prev,'m15 5-7 7 7 7'),next=makeButton('next',T.next,'m9 5 7 7-7 7');
 const count=document.createElement('p');count.className='lightbox-count';count.hidden=true;count.setAttribute('aria-live','polite');
 box.append(prev,next,count);
 const preload=i=>{const b=group[(i+group.length)%group.length];if(b){const p=new Image();p.src=b.dataset.lightbox;}};
 function render(swap){
  const many=group.length>1;
  prev.hidden=next.hidden=count.hidden=!many;
  if(!group.length)return;
  const b=group[index];
  if(swap){
   img.classList.add('is-loading');
   img.addEventListener('load',()=>img.classList.remove('is-loading'),{once:true});
   img.src=b.dataset.lightbox;
   if(b.dataset.caption){img.alt=b.dataset.caption;if(cap)cap.textContent=b.dataset.caption;}
  }
  count.textContent=(index+1)+' / '+group.length;
  if(many){preload(index+1);preload(index-1);}
 }
 function step(delta){if(group.length<2)return;index=(index+delta+group.length)%group.length;render(true);}
 // Capture : on mémorise la série de photos avant que app.js n'ouvre la visionneuse.
 document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-lightbox]');
  if(!b||lb.contains(b))return;
  const scope=b.closest('.gallery')||b.closest('section')||document;
  group=[...scope.querySelectorAll('[data-lightbox]')].filter(x=>!x.closest('[hidden]'));
  index=Math.max(0,group.indexOf(b));
  render(false);
 },true);
 lb.addEventListener('keydown',e=>{
  if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}
  else if(e.key==='ArrowRight'){e.preventDefault();step(1);}
 });
 let x0=null,y0=0;
 box.addEventListener('touchstart',e=>{if(e.touches.length===1){x0=e.touches[0].clientX;y0=e.touches[0].clientY;}},{passive:true});
 box.addEventListener('touchend',e=>{
  if(x0===null)return;
  const dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=null;
  if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3)step(dx<0?1:-1);
 },{passive:true});
}

function init(){injectStyles();setupBooking();setupLightbox();}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
