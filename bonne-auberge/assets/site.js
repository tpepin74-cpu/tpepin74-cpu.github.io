/* La Bonne Auberge · V11. Vanilla JS, hash routing, no iframe, no server requests.
   Commerce is explicitly demonstrative; customer data is never persisted. */
(function(){
'use strict';
const PAGES=window.BA_PAGES||{}, PRODUCTS=window.BA_PRODUCTS||[], GALLERY=window.BA_GALLERY||[], ICONS=window.BA_ICONS||{};
const PRODUCT_VIEWS=window.BA_PRODUCT_VIEWS||{}, LEGAL=window.BA_LEGAL||{};
const byId=Object.fromEntries(PRODUCTS.map(p=>[p.id,p]));
const main=document.getElementById('main'), header=document.getElementById('site-header');
const reducedQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
const imgCache=new Map(), requests=new Map();
const STORAGE_KEY='bonne-auberge-v6-cart';
let cart={}, memoryOnly=false, currentKey='', currentPath='', revealObserver=null, parallaxItems=[], floatItems=[], scrollQueued=false, toastTimer, routeTimer, introTimer;
let reduced=false, lightboxItems=[], lightboxIndex=0;
let chapterLinks=[], chapterNodes=[], activeChapter='', chapterLockUntil=0, subrouteFrame=0;
const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const icon=name=>ICONS[name]||'';
const price=n=>'CHF '+(n/100).toFixed(2);
const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
function storageGet(k){try{return localStorage.getItem(k)}catch(e){memoryOnly=true;return null}}
function storageSet(k,v){try{localStorage.setItem(k,v);return true}catch(e){memoryOnly=true;return false}}
function readCart(){try{const value=JSON.parse(storageGet(STORAGE_KEY)||'{}');if(value&&typeof value==='object'&&!Array.isArray(value)){for(const [id,n] of Object.entries(value))if(byId[id]&&Number.isInteger(n)&&n>0)cart[id]=Math.min(20,n)}}catch(e){cart={}}}
function saveCart(){storageSet(STORAGE_KEY,JSON.stringify(cart));updateCounts()}
function counts(){return Object.values(cart).reduce((a,b)=>a+b,0)}
function total(){return Object.entries(cart).reduce((a,[id,n])=>a+(byId[id]?byId[id].price*n:0),0)}
function updateCounts(){const count=counts();$$('[data-cart-count]').forEach(el=>{el.textContent=String(count);el.classList.toggle('is-empty',count===0)});const shop=currentKey==='boutique'||currentKey.startsWith('produit/')||['panier','retrait'].includes(currentKey);$$('.header-cart').forEach(el=>{el.setAttribute('aria-label',`Ouvrir mon panier, ${count} article${count>1?'s':''}`);el.hidden=!shop&&count===0})}
function photoURL(key){
 if(imgCache.has(key))return imgCache.get(key);
 let raw=(window.BA_MEDIA||{})[key],url;
 if(raw){try{const comma=raw.indexOf(','),mime=raw.slice(5,raw.indexOf(';')),str=atob(raw.slice(comma+1)),bytes=new Uint8Array(str.length);for(let i=0;i<str.length;i++)bytes[i]=str.charCodeAt(i);url=URL.createObjectURL(new Blob([bytes],{type:mime}))}catch(e){url=raw}}
 else url=(window.BA_IMAGE_FILES||{})[key]||('assets/images/'+encodeURIComponent(key)+'.avif');
 imgCache.set(key,url);return url;
}
function hydrateImages(root=main){$$('img[data-photo]',root).forEach(img=>{const key=img.dataset.photo;if(img.dataset.hydrated===key)return;img.dataset.hydrated=key;const dims=(window.BA_IMAGE_SIZES||{})[key];if(dims){img.width=dims[0];img.height=dims[1]}img.decoding='async';if(!img.hasAttribute('loading'))img.loading='lazy';const src=photoURL(key);if(img.getAttribute('src')!==src)img.src=src;img.addEventListener('error',()=>{img.classList.add('image-failed');img.alt=(img.alt||'Photographie')+' — image indisponible'},{once:true})})}
function showToast(text,cartLink=false){const toast=$('#toast');clearTimeout(toastTimer);toast.innerHTML=`${icon('check')}<span>${esc(text)}</span>${cartLink?'<a href="#/epicerie/panier">Voir le panier</a>':''}`;toast.classList.add('is-visible');toastTimer=setTimeout(()=>toast.classList.remove('is-visible'),3500)}
function localDate(){try{const parts=new Intl.DateTimeFormat('fr-CH',{timeZone:'Europe/Zurich',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const v=Object.fromEntries(parts.map(x=>[x.type,x.value]));return `${v.year}-${v.month}-${v.day}`}catch(e){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}}
function formatDate(raw){const d=new Date(raw+'T12:00:00');return isNaN(d)?raw:new Intl.DateTimeFormat('fr-CH',{dateStyle:'long',timeZone:'Europe/Zurich'}).format(d)}
function dateValid(field){field.setCustomValidity('');const val=field.value;if(!/^\d{4}-\d{2}-\d{2}$/.test(val)||isNaN(new Date(val+'T12:00:00'))||val<localDate()){field.setCustomValidity('Choisissez une date à partir d’aujourd’hui.');field.reportValidity();return false}return true}
function initDates(root=main){$$('[data-future-date]',root).forEach(el=>{el.min=localDate();el.addEventListener('input',()=>el.setCustomValidity(''))})}
function setMotion(){reduced=reducedQuery.matches||storageGet('bonne-auberge-v6-reduce-motion')==='true';document.documentElement.classList.toggle('motion-disabled',reduced);document.documentElement.classList.toggle('motion-enabled',!reduced&&'IntersectionObserver'in window);$$('[data-toggle-motion]').forEach(b=>{b.textContent=reduced?'Activer les animations':'Réduire les animations';if(reducedQuery.matches){b.textContent='Animations réduites (système)';b.disabled=true}else b.disabled=false});if(reduced)$$('.reveal').forEach(e=>e.classList.add('is-visible'))}
function observePage(){
 if(revealObserver)revealObserver.disconnect();
 const nodes=$$('.reveal',main);
 if(reduced||!('IntersectionObserver'in window)){nodes.forEach(n=>n.classList.add('is-visible'))}
 else{revealObserver=new IntersectionObserver(entries=>{entries.forEach(x=>{if(x.isIntersecting){x.target.classList.add('is-visible');revealObserver.unobserve(x.target)}})},{threshold:.08,rootMargin:'0px 0px -25px 0px'});nodes.forEach((el,i)=>{el.style.setProperty('--delay',Math.min(i%3*70,140)+'ms');revealObserver.observe(el)})}
 parallaxItems=$$('[data-parallax]',main);floatItems=$$('[data-float]',main);queueScroll();
}
function scrollFrame(){scrollQueued=false;const vh=window.innerHeight,small=window.innerWidth<650;
 header.classList.toggle('is-scrolled',window.scrollY>45);updateChapterNav();
 if(reduced)return;
 for(const el of parallaxItems){const rect=el.getBoundingClientRect();if(rect.bottom< -100||rect.top>vh+100)continue;const speed=Number(el.dataset.parallax)||.06;const max=Math.min(rect.height*.078,small?33:80);const y=Math.max(-max,Math.min(max,(vh*.5-(rect.top+rect.height*.5))*speed));el.style.setProperty('--parallax-y',y.toFixed(2)+'px')}
 for(const el of floatItems){const rect=el.getBoundingClientRect();if(rect.bottom< -100||rect.top>vh+100)continue;const max=small?18:45;const y=Math.max(-max,Math.min(max,(vh*.5-(rect.top+rect.height*.5))*(Number(el.dataset.float)||.06)));el.style.setProperty('--float-y',y.toFixed(2)+'px')}
}
function queueScroll(){if(!scrollQueued){scrollQueued=true;requestAnimationFrame(scrollFrame)}}
function routeInfo(){
 const explicit=location.hash.startsWith('#/');
 let raw=explicit?location.hash.slice(2):(document.body.dataset.initialPage||'accueil');
 const parts=raw.split('/').filter(Boolean);let key=parts[0]||'accueil',sub=parts.slice(1).join('/');
 if(['index','home'].includes(key))key='accueil';
 if(key==='epicerie')key='boutique';
 if(key==='chambres')key='hotel';
 if(key==='hotel'&&sub==='chambres')sub='photos';
 if(key==='restaurant'&&sub==='le-chef')sub='chef';
 const aliases={chef:['restaurant','chef'],carte:['restaurant','carte'],histoire:['restaurant','histoire'],chroniques:['boutique','decouvrir'],experiences:['hotel','sejours'],contact:['hotel','venir'],panier:['boutique','panier'],retrait:['boutique','retrait']};
 if(aliases[key]) [key,sub]=aliases[key];
 else if(key==='reservation'){key=sub==='hotel'?'hotel':'restaurant';sub='reserver'}
 else if(key==='galerie'){key=sub==='hotel'?'hotel':sub==='boutique'?'boutique':'restaurant';sub=key==='boutique'?'decouvrir':'photos'}
 else if(key==='produit'){key='boutique';sub='produit/'+sub}
 else if(key==='mentions-legales'||key==='confidentialite'){sub=key;key=currentKey&&PAGES[currentKey]?currentKey:'hotel'}
 return {key,sub,path:raw};
}
function chapterAddress(key,id){return '#/'+({boutique:'epicerie',hotel:'chambres'}[key]||key)+(id?'/'+id:'')}
function initChapters(){
 chapterLinks=$$('[data-chapter-link]',main);
 chapterNodes=chapterLinks.map(a=>document.getElementById(a.dataset.chapterLink)).filter(Boolean);
 activeChapter='';document.body.classList.toggle('has-chapters',chapterNodes.length>0);
 document.documentElement.style.setProperty('--header-space',header.offsetHeight+'px');
 updateChapterNav(true);
}
function setChapter(id,ensureVisible=true){
 if(id===activeChapter)return;activeChapter=id;
 chapterLinks.forEach(a=>{const current=a.dataset.chapterLink===id;a.classList.toggle('is-active',current);if(current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});
 const link=chapterLinks.find(a=>a.dataset.chapterLink===id),track=link?.parentElement;
 if(ensureVisible&&link&&track){const l=link.getBoundingClientRect(),r=track.getBoundingClientRect();if(l.left<r.left+10||l.right>r.right-10)track.scrollTo({left:link.offsetLeft-track.offsetLeft-track.clientWidth/2+link.offsetWidth/2,behavior:reduced?'auto':'smooth'})}
}
function updateChapterNav(force=false){
 const nav=$('.chapter-nav',main);if(!nav)return;
 const head=header.offsetHeight;document.documentElement.style.setProperty('--header-space',head+'px');
 const rect=nav.getBoundingClientRect();nav.classList.toggle('is-pinned',rect.top<=head+2);
 if(performance.now()<chapterLockUntil&&!force)return;
 const line=head+nav.offsetHeight+55;let active=chapterNodes[0]?.id;
 for(const section of chapterNodes){if(section.getBoundingClientRect().top<=line)active=section.id;else break}
 if(active)setChapter(active);
}
function scrollChapter(id,focusHeading=true){
 const node=document.getElementById(id);if(!node||!main.contains(node))return;
 let p=node;while(p&&p!==main){if(p.tagName==='DETAILS')p.open=true;p=p.parentElement}
 if(node.tagName==='DETAILS')node.open=true;
 chapterLockUntil=performance.now()+(reduced?0:950);setChapter(id);
 cancelAnimationFrame(subrouteFrame);
 subrouteFrame=requestAnimationFrame(()=>{subrouteFrame=requestAnimationFrame(()=>{
  const nav=$('.chapter-nav',main),offset=header.offsetHeight+(nav?nav.offsetHeight:0);
  window.scrollTo({top:Math.max(0,window.scrollY+node.getBoundingClientRect().top-offset),behavior:reduced?'instant':'smooth'});
  if(focusHeading){const heading=$('h2,h3,summary',node)||node;heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true})}
  setTimeout(()=>{chapterLockUntil=0;queueScroll()},reduced?0:1000);
 })});
}
function showProduct(id){
 const view=PRODUCT_VIEWS[id];if(!view){showToast('Cette sélection n’est pas disponible dans cet aperçu.');return}
 const root=$('#product-modal-body');root.innerHTML=view.body;
 const first=$('h1',root);if(first){const h=document.createElement('h2');for(const a of first.attributes)h.setAttribute(a.name,a.value);h.innerHTML=first.innerHTML;first.replaceWith(h)}
 $$('.reveal',root).forEach(n=>n.classList.add('is-visible'));
 $$('.related-products',root).forEach(n=>n.remove());
 hydrateImages(root);openDialog('product-dialog');$('#product-dialog').scrollTop=0;
}
function showLegal(key){
 const view=LEGAL[key];if(!view)return;
 const temp=document.createElement('div');temp.innerHTML=view.body;
 const root=$('#info-modal-body');root.innerHTML='<h2>'+esc(key==='confidentialite'?'Confidentialité':'Mentions de présentation')+'</h2>'+(temp.querySelector('.legal-copy')?.outerHTML||'');
 openDialog('info-dialog');$('#info-dialog').scrollTop=0;
}
function dismissDialog(d){
 if(!d)return;
 if(d.id==='product-dialog'&&routeInfo().sub.startsWith('produit/'))history.replaceState(null,'',chapterAddress('boutique','selection'));
 if(d.id==='info-dialog'&&LEGAL[routeInfo().sub])history.replaceState(null,'',chapterAddress(currentKey,''));
 d.close();
}
function refreshCommerce(){
 if(currentKey!=='boutique')return;
 const form=$('#collect-form'),saved=form?Array.from(new FormData(form).entries()):[];
 renderCart();renderCheckout();
 const next=$('#collect-form');if(next)for(const [name,value]of saved){const el=next.elements.namedItem(name);if(!el)continue;if(el.type==='checkbox')el.checked=true;else el.value=value}
 queueScroll();
}
function updateActiveNav(key){let active=key;if(key.startsWith('produit/')||['panier','retrait'].includes(key))active='boutique';if(['carte','chef'].includes(key))active='restaurant';if(key==='reservation')active=routeInfo().sub==='hotel'?'hotel':'restaurant';if(key==='galerie'&&['restaurant','boutique','hotel'].includes(routeInfo().sub))active=routeInfo().sub;$$('[data-nav],[data-dock]').forEach(el=>{if((el.dataset.nav||el.dataset.dock)===active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current')})}
function applySubroute(key,sub){
 if(!sub)return;
 if(key==='boutique'&&sub.startsWith('produit/')){showProduct(sub.slice(8));return}
 if(LEGAL[sub]){showLegal(sub);return}
 if(document.getElementById(sub))scrollChapter(sub);
}
function renderRoute(initial=false){
 const {key,sub,path}=routeInfo();closeAllDialogs();if(!initial&&$('#intro')?.classList.contains('is-on'))endIntro();
 if(currentKey===key&&!initial){applySubroute(key,sub);updateActiveNav(key);if(!sub)window.scrollTo({top:0,behavior:reduced?'auto':'smooth'});currentPath=path;return}
 endIntro();currentKey=key;currentPath=path;
 const data=PAGES[key];
 if(!data){main.innerHTML='<section class="small-head"><h1>Cette page se fait discrète.</h1><p>Retrouvez la maison depuis l’accueil.</p><a class="button dark" href="#/">Retour à l’accueil</a></section>';header.classList.remove('on-hero');window.scrollTo(0,0);return}
 main.innerHTML=data.body;
 document.title=data.title;const meta=$('meta[name="description"]');if(meta)meta.content=data.description;
 document.body.dataset.page=key;main.dataset.page=key;
 header.classList.toggle('on-hero',!!$('.hero',main));
 if(key==='boutique'){renderCart();renderCheckout()}
 hydrateImages();initDates();updateCounts();updateActiveNav(key);setMotion();initChapters();observePage();if(key==='accueil')runIntro();
 window.scrollTo({top:0,left:0,behavior:'instant'});queueScroll();applySubroute(key,sub);
 if(!initial&&!sub){const h=$('h1',main);if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true})}}
 const live=$('#page-status');if(live)live.textContent=data.title.split(' | ')[0];
}
function goHash(href){if(location.hash===href){renderRoute()}else location.hash=href}
function routeChanged(){clearTimeout(routeTimer);if(reduced){renderRoute();return}main.classList.add('page-changing');routeTimer=setTimeout(()=>{renderRoute();main.classList.remove('page-changing')},100)}
function openDialog(id){const d=document.getElementById(id);if(!d)return;closeAllDialogs();d.showModal();document.body.classList.add('dialog-open');if(id==='concierge-dialog')$$('[data-open-concierge]').forEach(b=>b.setAttribute('aria-expanded','true'))}
function closeAllDialogs(){$$('dialog[open]').forEach(d=>d.close());document.body.classList.remove('dialog-open');$$('[data-open-concierge]').forEach(b=>b.setAttribute('aria-expanded','false'))}
function initDialogs(){$$('dialog').forEach(d=>{d.addEventListener('cancel',e=>{e.preventDefault();dismissDialog(d)});d.addEventListener('close',()=>{if(!$('dialog[open]'))document.body.classList.remove('dialog-open');if(d.id==='concierge-dialog')$$('[data-open-concierge]').forEach(b=>b.setAttribute('aria-expanded','false'))});d.addEventListener('click',e=>{if(e.target===d)dismissDialog(d)})})}
/* The opening is an inline SVG stroke animation, never a loading screen.
   Links are immediately available; slow or unavailable images cannot block navigation. */
function endIntro(){
 clearTimeout(introTimer);
 $$('.arrival-crest.is-inking').forEach(el=>el.classList.remove('is-inking'));
 const old=$('#intro');if(old){old.classList.remove('is-on','is-leaving');old.setAttribute('aria-hidden','true')}
}
function runIntro(force=false){
 const key='bonne-auberge-v11-engraving';
 if(force&&currentKey!=='accueil'){
  try{sessionStorage.removeItem(key)}catch(e){}
  goHash('#/');return;
 }
 const crest=$('.arrival-crest',main);if(!crest)return;
 if(reduced){endIntro();return}
 let done=false;try{done=sessionStorage.getItem(key)==='done'}catch(e){}
 if(done&&!force)return;
 endIntro();void crest.getBoundingClientRect();crest.classList.add('is-inking');
 try{sessionStorage.setItem(key,'done')}catch(e){}
 introTimer=setTimeout(endIntro,3650);
}
function addProduct(id,qty=1,button){if(!byId[id])return;qty=Number(qty);if(!Number.isInteger(qty)||qty<1||qty>20){showToast('Choisissez une quantité entre 1 et 20.');return}const next=(cart[id]||0)+qty;if(next>20){showToast('Maximum de 20 exemplaires par sélection.');return}cart[id]=next;saveCart();refreshCommerce();showToast(qty>1?'Les sélections sont dans votre panier.':'Une bonne envie ajoutée.',true);if(button){const prev=button.innerHTML;button.innerHTML=icon('check');setTimeout(()=>{if(button.isConnected)button.innerHTML=prev},850)}}
function quantity(id,delta){if(!byId[id]||!cart[id])return;const next=cart[id]+delta;if(next<1)delete cart[id];else cart[id]=Math.min(20,next);saveCart();refreshCommerce();hydrateImages();initDates()}
function miniImage(id,alt,cls=''){return `<figure class="photo ${cls}"><img data-photo="${id}" alt="${esc(alt)}" loading="lazy" decoding="async"></figure>`}
function emptyCart(){return `<div class="empty-cart">${icon('bag')}<h2>De bonnes choses vous attendent.</h2><p>Votre panier est encore vide. Commencez par une petite envie.</p><a class="button dark" href="#/epicerie/selection">Découvrir l’épicerie ${icon('arrow')}</a></div>`}
function renderCart(){const root=$('#cart-content');if(!root)return;if(!counts()){root.innerHTML=emptyCart();return}const items=Object.entries(cart).map(([id,n])=>{const p=byId[id];return `<article class="cart-item"><a href="#/epicerie/produit/${id}" aria-label="Voir ${esc(p.name)}">${miniImage(p.image,p.name)}</a><div><h2><a href="#/epicerie/produit/${id}">${esc(p.name)}</a></h2><small>${price(p.price)} / sélection · démonstration</small><div class="quantity-controls"><button data-cart-qty="${id}" data-delta="-1" aria-label="Diminuer la quantité de ${esc(p.name)}">−</button><output aria-label="Quantité de ${esc(p.name)}">${n}</output><button data-cart-qty="${id}" data-delta="1" aria-label="Augmenter la quantité de ${esc(p.name)}"${n>=20?' disabled':''}>+</button></div><button class="item-remove" data-remove="${id}">Retirer</button></div><span class="cart-item-price">${price(p.price*n)}</span></article>`}).join('');
 root.innerHTML=`<div class="cart-grid"><div><div class="cart-items">${items}</div><div class="cart-bottom-actions"><a class="text-link" href="#/epicerie/selection">Continuer mes découvertes ${icon('arrow')}</a><button data-empty-cart>Vider le panier</button></div></div><aside class="cart-summary"><h2>Votre sélection.</h2><div class="summary-row"><span>${counts()} article${counts()>1?'s':''}</span><span>${price(total())}</span></div><div class="summary-row"><span>Retrait envisagé</span><span>À la boutique</span></div><div class="summary-row total"><span>Total illustratif</span><strong>${price(total())}</strong></div><a class="button dark" href="#/epicerie/retrait">Préparer mon retrait ${icon('arrow')}</a><p class="micro-note">Prix fictifs. Aucun paiement, aucune commande et aucun stock réservé.</p><p class="micro-note">${memoryOnly?'Panier conservé seulement pendant cette ouverture.':'Votre panier est conservé dans ce navigateur.'}</p></aside></div>`;
 hydrateImages(root);updateCounts();
}
function renderCheckout(){const root=$('#checkout-content');if(!root)return;if(!counts()){root.innerHTML='<div class=checkout-empty><p>Votre panier est encore vide.</p><a class="text-link" href="#/epicerie/selection">Choisir mes produits '+icon('arrow')+'</a></div>';return}
 const mini=Object.entries(cart).map(([id,n])=>{const p=byId[id];return `<div class="checkout-mini-item">${miniImage(p.image,p.name)}<div><h3>${esc(p.name)}</h3><p>Quantité ${n}</p></div><span>${price(p.price*n)}</span></div>`}).join('');
 root.innerHTML=`<div class="checkout-grid"><form id="collect-form" class="form-surface"><h2>Votre retrait.</h2><p>Indiquez une préférence. La boutique devra confirmer la disponibilité.</p><div class="demo-note"><span><strong>Parcours de démonstration.</strong> Ce formulaire ne passe pas de commande et ne réserve aucun créneau.</span></div><div class="form-grid"><label>Prénom & nom<input name="name" autocomplete="name" maxlength="100" required></label><label>Votre e-mail<input type="email" name="email" autocomplete="email" maxlength="254" required></label><label>Téléphone<input type="tel" name="phone" autocomplete="tel" maxlength="30" minlength="6" required></label><label>Date souhaitée<input type="date" name="date" required data-future-date></label><label class="span-2">Moment préféré<select name="moment" required><option value="">Choisir</option><option>Matin, selon ouverture</option><option>Après-midi, selon ouverture</option><option>À convenir ensemble</option></select></label><label class="span-2">Une précision ? <span>(facultatif)</span><textarea name="message" rows="2" maxlength="800" placeholder="Un cadeau, une question…"></textarea></label></div><label class="consent-label"><input type="checkbox" name="understood" required><span>J’ai compris qu’il s’agit d’une démonstration, sans commande réelle ni confirmation de retrait.</span></label><button class="button dark" type="submit">Préparer le récapitulatif ${icon('arrow')}</button><p class="micro-note">Vos coordonnées ne sont pas enregistrées dans le navigateur et aucun envoi n’est effectué automatiquement.</p><div id="collect-result" class="request-result" hidden></div></form><aside class="cart-summary"><h2>Vos bonnes envies.</h2>${mini}<div class="summary-row total"><span>Total illustratif</span><strong>${price(total())}</strong></div><p class="micro-note">Retrait envisagé : Rue du 23-Juin 32, 2800 Delémont. Horaires, composition et prix réels à confirmer.</p><a class="text-link" href="#/epicerie/panier">Modifier mon panier ${icon('arrow')}</a></aside></div>`;
 hydrateImages(root);initDates(root);
}
function filterShop(){const root=$('.collection-section');if(!root)return;const cat=$('[data-shop-filter].is-active',root)?.dataset.shopFilter||'all';const q=($('#product-search')?.value||'').trim().toLocaleLowerCase('fr');let visible=0;$$('.product-card',root).forEach(card=>{const show=(cat==='all'||card.dataset.category===cat)&&(!q||card.dataset.productName.includes(q));card.hidden=!show;if(show){visible++;card.classList.add('is-visible')}});const no=$('.empty-search',root);if(no)no.hidden=visible>0;const status=$('#filter-status');if(status)status.textContent=`${visible} sélection${visible>1?'s':''} affichée${visible>1?'s':''}.`;queueScroll()}
function filterGallery(cat){$$('[data-gallery-filter]').forEach(b=>{const active=b.dataset.galleryFilter===cat;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active))});$$('[data-gallery-category]').forEach(el=>{el.hidden=cat!=='all'&&el.dataset.galleryCategory!==cat;if(!el.hidden)el.classList.add('is-visible')});queueScroll()}
function switchReservation(mode){$$('[data-reservation-tab]').forEach(b=>{const active=b.dataset.reservationTab===mode;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active))});const t=$('#reservation-table'),h=$('#reservation-hotel');if(t)t.hidden=mode!=='table';if(h)h.hidden=mode!=='hotel';hydrateImages();queueScroll()}
function showLightbox(key,source){const scope=source?.closest('.rooms-mosaic,.plate-gallery,.shop-gallery')||main;const candidates=$$('[data-lightbox]',scope).filter(el=>!el.closest('[hidden],details:not([open])'));const unique=new Map();for(const e of candidates){const img=$('img',e);if(!unique.has(e.dataset.lightbox))unique.set(e.dataset.lightbox,{key:e.dataset.lightbox,alt:img?.alt||'La Bonne Auberge'})}lightboxItems=Array.from(unique.values());if(!lightboxItems.length)lightboxItems=[{key,alt:'La Bonne Auberge'}];lightboxIndex=Math.max(0,lightboxItems.findIndex(x=>x.key===key));renderLightbox();openDialog('lightbox-dialog')}
function renderLightbox(){const item=lightboxItems[lightboxIndex];if(!item)return;const img=$('#lightbox-image');img.src=photoURL(item.key);img.alt=item.alt;$('#lightbox-caption').textContent=`${lightboxIndex+1} / ${lightboxItems.length} — ${item.alt}`;$$('[data-lightbox-step]').forEach(b=>b.hidden=lightboxItems.length<2)}
function stepLightbox(delta){lightboxIndex=(lightboxIndex+delta+lightboxItems.length)%lightboxItems.length;renderLightbox()}
const conciergeNodes={
 start:{title:'Bienvenue à la maison.',text:'Qu’est-ce qui vous ferait plaisir ?',items:[['Une bonne table','table','fork'],['Une envie à emporter','boutique','bag'],['Une nuit à Delémont','hotel','bed'],['Préparer ma visite','pratique','pin'],['Une idée de séjour','sejour','spark']]},
 table:{title:'On vous garde une place ?',text:'Le restaurant vous accueille habituellement du mercredi midi au samedi soir. Une demande doit être confirmée par l’équipe.',items:[['Préparer une demande','#/restaurant/reserver','calendar'],['Découvrir le restaurant','#/restaurant','fork'],['La carte du moment','#/restaurant/carte','arrow'],['Le chef','#/restaurant/chef','arrow'],['Les photos du restaurant','#/restaurant/photos','arrow'],['Appeler la maison','tel:+41324221758','phone']]},
 boutique:{title:'Une bonne envie à emporter.',text:'Explorez la boutique, composez un panier et testez le retrait. Le catalogue et les prix sont des exemples ; aucune commande réelle n’est transmise.',items:[['Découvrir la sélection','#/epicerie/selection','bag'],['Retrouver mon panier','#/epicerie/panier','arrow'],['Contacter la boutique','#/chambres/venir','phone']]},
 hotel:{title:'Prolonger le plaisir.',text:'Sept chambres au cœur de la vieille ville. Les disponibilités et conditions se consultent sur la plateforme partenaire.',items:[['Découvrir les chambres','#/chambres','bed'],['Consulter les disponibilités','https://booking.juratroislacs.ch/J3L/ukv/house/TDS00020010000457458','calendar'],['Les chambres en images','#/chambres/photos','arrow'],['Idées de séjour','#/chambres/sejours','spark'],['Accès et questions','#/chambres/venir','chat']]},
 pratique:{title:'Rendez-vous à Delémont.',text:'Rue du 23-Juin 32, 2800 Delémont. Pour les horaires précis, le stationnement ou une demande particulière, l’équipe est à votre écoute.',items:[['Accès et informations','#/chambres/venir','pin'],['Appeler la maison','tel:+41324221758','phone'],['Découvrir notre histoire','#/restaurant/histoire','arrow']]},
 sejour:{title:'Quelques heures. Ou quelques jours.',text:'Une parenthèse gourmande, la vieille ville et les idées de Jura Tourisme. Des inspirations à composer librement, pas des forfaits imposés.',items:[['Trouver mon inspiration','#/chambres/sejours','spark'],['Choisir une chambre','#/chambres','bed'],['Préparer ma visite','#/restaurant/reserver','calendar']]}
};
function concierge(node='start'){const d=conciergeNodes[node]||conciergeNodes.start;$('#concierge-body').innerHTML=`<p class="concierge-greeting">${esc(d.title)}</p><p class="concierge-text">${esc(d.text)}</p><div class="concierge-options">${d.items.map(([label,target,ic])=>{if(conciergeNodes[target])return `<button data-concierge-node="${target}">${esc(label)}${icon(ic)}</button>`;return `<a href="${esc(target)}"${target.startsWith('https://')?' target="_blank" rel="noopener noreferrer"':''}>${esc(label)}${icon(ic)}</a>`}).join('')}</div>${node!=='start'?'<button class="concierge-back" data-concierge-node="start">← Revenir aux choix</button>':''}`}
function showRequest(rootId,key,title,text,subject){requests.set(key,text);const el=document.getElementById(rootId);el.hidden=false;const mail=`mailto:info@labonneauberge.ch?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;el.innerHTML=`<h3>${esc(title)}</h3><p>Rien n’a été envoyé. Copiez ce texte ou ouvrez votre messagerie pour l’envoyer vous-même.</p><pre>${esc(text)}</pre><button type="button" class="button outline" data-copy-request="${key}">Copier la demande ${icon('arrow')}</button><a class="text-link" href="${mail}">Ouvrir ma messagerie ${icon('up')}</a>`;el.scrollIntoView({behavior:reduced?'auto':'smooth',block:'center'})}
async function copyText(text){try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);return true}}catch(e){}const ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;top:0;left:-9999px;opacity:0';document.body.appendChild(ta);ta.select();let done=false;try{done=document.execCommand('copy')}catch(e){}ta.remove();return done}
function handleSubmit(event){const form=event.target;if(!['table-form','collect-form'].includes(form.id))return;event.preventDefault();if(!form.reportValidity())return;const data=new FormData(form);const name=String(data.get('name')||'').trim();if(!name){const el=form.elements.name;el.setCustomValidity('Indiquez votre nom.');el.reportValidity();el.addEventListener('input',()=>el.setCustomValidity(''),{once:true});return}if(!dateValid(form.elements.date))return;const date=String(data.get('date'));const email=String(data.get('email')||'').trim();const msg=String(data.get('message')||'').trim();const moment=String(data.get('moment')||'');
 if(form.id==='table-form'){const text=`Bonjour,\n\nJe souhaite connaître vos disponibilités pour une table.\n\nDate souhaitée : ${formatDate(date)}\nMoment : ${moment}\nPersonnes : ${data.get('guests')}\nNom : ${name}\nE-mail : ${email}\n${msg?'\nPrécisions : '+msg+'\n':''}\nMerci de me confirmer la disponibilité et les conditions.\nCette demande ne constitue pas une réservation confirmée.`;showRequest('table-result','table','Votre demande est prête.',text,'Demande de table — La Bonne Auberge')}
 else{if(!counts()){renderCheckout();return}const phone=String(data.get('phone')||'').trim();const lines=Object.entries(cart).map(([id,n])=>`${n} × ${byId[id].name} — ${price(byId[id].price*n)} (prix fictif)`).join('\n');const text=`Bonjour,\n\nJe vous contacte au sujet d’un retrait à La Bonne Épicerie.\nCette sélection provient d’une maquette : les produits, compositions et prix ci-dessous sont des exemples, et non une commande.\n\n${lines}\n\nTotal illustratif : ${price(total())}\n\nDate souhaitée : ${formatDate(date)}\nMoment préféré : ${moment}\nNom : ${name}\nE-mail : ${email}\nTéléphone : ${phone}\n${msg?'\nPrécisions : '+msg+'\n':''}\nMerci de m’indiquer votre sélection réelle, les prix applicables et les possibilités de retrait.\nAucun créneau ni stock n’est réservé.`;showRequest('collect-result','collect','Votre récapitulatif de démonstration.',text,'Renseignement épicerie — sélection de démonstration')}
}
function handleClick(e){
 const b=e.target.closest('button,a');if(!b)return;
  if(b.matches('[data-close-dialog]')){dismissDialog(b.closest('dialog'));return}
 if(b.matches('[data-open-legal]')){showLegal(b.dataset.openLegal);return}
 if(b.matches('[data-open-concierge]')){concierge();openDialog('concierge-dialog');return}
 if(b.matches('[data-concierge-node]')){concierge(b.dataset.conciergeNode);return}
 if(b.matches('[data-replay-intro]')){window.scrollTo({top:0,behavior:'instant'});runIntro(true);return}
 if(b.id==='skip-intro'){endIntro();return}
 if(b.matches('[data-scroll-next]')){const section=b.closest('section');section?.nextElementSibling?.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});return}
 if(b.matches('[data-toggle-motion]')){storageSet('bonne-auberge-v6-reduce-motion',String(!reduced));setMotion();observePage();showToast(reduced?'Animations réduites.':'Animations activées.');return}
 if(b.matches('[data-clear-local]')){cart={};try{localStorage.removeItem(STORAGE_KEY);localStorage.removeItem('bonne-auberge-v6-reduce-motion')}catch(e){}saveCart();refreshCommerce();setMotion();showToast('Panier et préférences effacés.');return}
 if(b.matches('[data-add]')){let n=1;const input=b.dataset.quantitySource?document.getElementById(b.dataset.quantitySource):null;if(input){if(!input.reportValidity())return;n=Number(input.value)}addProduct(b.dataset.add,n,b);return}
 if(b.matches('[data-cart-qty]')){quantity(b.dataset.cartQty,Number(b.dataset.delta));return}
 if(b.matches('[data-remove]')){delete cart[b.dataset.remove];saveCart();refreshCommerce();showToast('Sélection retirée.');return}
 if(b.matches('[data-empty-cart]')){cart={};saveCart();refreshCommerce();showToast('Votre panier est vide.');return}
 if(b.matches('[data-shop-filter]')){$$('[data-shop-filter]').forEach(x=>{const is=x===b;x.classList.toggle('is-active',is);x.setAttribute('aria-pressed',String(is))});filterShop();return}
 if(b.matches('[data-gallery-filter]')){filterGallery(b.dataset.galleryFilter);return}
 if(b.matches('[data-reservation-tab]')){switchReservation(b.dataset.reservationTab);return}
 if(b.matches('[data-lightbox]')){showLightbox(b.dataset.lightbox,b);return}
 if(b.matches('[data-lightbox-step]')){stepLightbox(Number(b.dataset.lightboxStep));return}
 if(b.matches('[data-copy-request]')){copyText(requests.get(b.dataset.copyRequest)||'').then(ok=>showToast(ok?'Demande copiée.':'Sélectionnez le texte pour le copier.'));return}
 if(b.tagName==='A'){const href=b.getAttribute('href')||'';if(href.startsWith('#/')){if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();closeAllDialogs();goHash(href)}else if(href==='#main'){e.preventDefault();main.setAttribute('tabindex','-1');main.focus();main.scrollIntoView({behavior:'auto'})}}
}

function start(){readCart();setMotion();initDialogs();document.addEventListener('click',handleClick);document.addEventListener('submit',handleSubmit);document.addEventListener('input',e=>{if(e.target.id==='product-search')filterShop()});document.addEventListener('toggle',e=>{if(e.target.tagName==='DETAILS')queueScroll()},true);window.addEventListener('hashchange',routeChanged);window.addEventListener('scroll',queueScroll,{passive:true});window.addEventListener('resize',queueScroll,{passive:true});document.addEventListener('keydown',e=>{if($('#lightbox-dialog').open){if(e.key==='ArrowRight'){e.preventDefault();stepLightbox(1)}if(e.key==='ArrowLeft'){e.preventDefault();stepLightbox(-1)}}});if(reducedQuery.addEventListener)reducedQuery.addEventListener('change',()=>{setMotion();observePage()});renderRoute(true);document.documentElement.classList.add('app-ready');window.BA_APP={navigate:goHash,cart:()=>({...cart}),current:()=>currentKey,photos:()=>imgCache.size};}
try{start()}catch(e){console.error('La Bonne Auberge initialization',e);document.documentElement.classList.remove('motion-enabled');document.documentElement.classList.add('motion-disabled');const intro=$('#intro');if(intro)intro.remove();const notice=document.createElement('div');notice.className='load-error';notice.innerHTML='<p>Le navigateur n’a pas pu activer toutes les interactions. Ouvrez ce fichier directement dans Chrome ou Safari.</p>';main.prepend(notice)}
})();

/* La Bonne Auberge V11. Four-part, dependency-free liquid menu.
   One RAF loop only while moving. Same navigation, keyboard support, reduced motion. */
(function(){
 'use strict';
 const dock=document.querySelector('.dock');
 if(!dock)return;
 const items=Array.from(dock.querySelectorAll(':scope > a,:scope > button'));
 if(items.length<2)return;
 dock.style.setProperty('--dock-count',String(items.length));
 const ns='http://www.w3.org/2000/svg';
 const background=dock.querySelector('.dock-back');if(background)background.remove();
 const shape=document.createElementNS(ns,'svg');
 shape.setAttribute('class','liquid-shape');shape.setAttribute('aria-hidden','true');shape.setAttribute('focusable','false');
 const path=document.createElementNS(ns,'path');shape.appendChild(path);
 const bubble=document.createElement('div');bubble.className='liquid-bubble';bubble.setAttribute('aria-hidden','true');
 const inner=document.createElement('div');inner.className='liquid-items';
 const icons=[];
 items.forEach((item,i)=>{
  const sourceIcon=item.querySelector('svg');
  const label=Array.from(item.querySelectorAll('span')).find(s=>!s.classList.contains('dock-orb')&&!s.querySelector('svg'));
  const text=(label?label.textContent:item.textContent).trim();
  item.classList.remove('dock-primary');item.classList.add('liquid-item');item.dataset.liquidIndex=String(i);
  item.setAttribute('aria-label',text==='Réserver'?'Réserver une table ou une chambre':text);
  item.textContent='';
  const slot=document.createElement('span');slot.className='liquid-icon';slot.setAttribute('aria-hidden','true');if(sourceIcon)slot.appendChild(sourceIcon);
  const caption=document.createElement('span');caption.className='liquid-label';caption.textContent=text;
  const dot=document.createElement('span');dot.className='liquid-dot';dot.setAttribute('aria-hidden','true');
  item.append(slot,caption,dot);inner.appendChild(item);icons.push(slot);
 });
 dock.append(shape,bubble,inner);dock.classList.add('liquid-dock');
 let width=0,height=78,orb=60,gutter=14,orbTop=-25,centers=[],preferred=0,target=0;
 let x=0,vx=0,nx=0,nv=0,raf=0,previous=0,hover=-1,focus=-1,ready=false;
 const lifts=items.map(()=>({p:0,v:0}));
 const mq=window.matchMedia('(prefers-reduced-motion: reduce)');
 function isReduced(){return mq.matches||document.documentElement.classList.contains('motion-disabled')}
 const cap=(v,l,h)=>Math.max(l,Math.min(h,v));
 function setTarget(index){
  target=cap(index,0,items.length-1);
  items.forEach((el,i)=>el.classList.toggle('is-raised',i===target));
  dock.dataset.liquidActive=String(target);
  if(!ready)return;
  if(isReduced()){settle();paint();return}
  start();
 }
 function choose(){setTarget(hover>=0?hover:focus>=0?focus:preferred)}
 function current(){
  const index=items.findIndex(e=>e.getAttribute('aria-current')==='page');
  preferred=index>=0?index:0;
  choose();
 }
 function settle(){
  x=nx=centers[target]||width/2;vx=nv=0;
  lifts.forEach((s,i)=>{s.p=i===target?1:0;s.v=0});
  if(raf){cancelAnimationFrame(raf);raf=0}previous=0;
 }
 function measure(){
  const style=getComputedStyle(dock);
  width=dock.getBoundingClientRect().width;height=parseFloat(style.getPropertyValue('--dock-height'))||78;
  orb=parseFloat(style.getPropertyValue('--dock-orb-size'))||60;gutter=parseFloat(style.getPropertyValue('--dock-gutter'))||14;orbTop=parseFloat(getComputedStyle(bubble).top)||-25;
  centers=items.map((_,i)=>gutter+(width-2*gutter)*(i+.5)/items.length);
  shape.setAttribute('viewBox',`0 0 ${width} ${height}`);
  ready=true;settle();paint();
 }
 function drawNotch(center){
  const spread=orb*.72+Math.min(9,Math.abs(vx)*.008);
  const half=Math.min(spread,center-5,width-center-5);
  const left=center-half,right=center+half;
  const radius=Math.min(21,Math.max(4,left),Math.max(4,width-right));
  const depth=orb*.59+4;
  // Two continuous cubic curves form the concave cradle and stretch during travel.
  return `M ${radius} 0 H ${left} C ${left+half*.42} 0 ${center-half*.53} ${depth} ${center} ${depth} C ${center+half*.53} ${depth} ${right-half*.42} 0 ${right} 0 H ${width-radius} Q ${width} 0 ${width} ${radius} V ${height-21} Q ${width} ${height} ${width-21} ${height} H 21 Q 0 ${height} 0 ${height-21} V ${radius} Q 0 0 ${radius} 0 Z`;
 }
 function paint(){
  if(!ready)return;
  path.setAttribute('d',drawNotch(cap(nx,centers[0],centers.at(-1))));
  const stretch=isReduced()?0:Math.min(.13,Math.abs(vx)*.00012);
  bubble.style.transform=`translate3d(${(x-orb/2).toFixed(3)}px,0,0) scale(${(1+stretch).toFixed(3)},${(1-stretch*.7).toFixed(3)})`;
  const top=orbTop;
  // Unraised icon centre is 28px down the bar; bubble is centred just above it.
  const lift=28-(top+orb/2);
  lifts.forEach((s,i)=>{const p=cap(s.p,-.05,1.06);icons[i].style.transform=`translate3d(0,${(-lift*p).toFixed(3)}px,0) scale(${(1+.045*p).toFixed(3)})`});
 }
 function integrate(state,goal,k,d,dt){state.v+=(k*(goal-state.p)-d*state.v)*dt;state.p+=state.v*dt}
 function step(t){
  raf=0;if(isReduced()){settle();paint();return}
  const dt=previous?Math.min((t-previous)/1000,.032):1/60;previous=t;
  const goal=centers[target]||width/2;
  vx+=(440*(goal-x)-31*vx)*dt;x+=vx*dt;
  nv+=(360*(goal-nx)-29*nv)*dt;nx+=nv*dt;
  lifts.forEach((s,i)=>integrate(s,i===target?1:0,380,28,dt));
  paint();
  const moving=Math.abs(x-goal)>.035||Math.abs(nx-goal)>.035||Math.abs(vx)>.08||Math.abs(nv)>.08||lifts.some((s,i)=>Math.abs(s.p-(i===target?1:0))>.002||Math.abs(s.v)>.004);
  if(moving)raf=requestAnimationFrame(step);else{settle();paint()}
 }
 function start(){if(!raf){previous=0;raf=requestAnimationFrame(step)}}
 items.forEach((item,i)=>{
  item.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'||e.pointerType==='pen'){hover=i;choose()}});
  item.addEventListener('focus',()=>{focus=i;choose()});
  item.addEventListener('click',()=>{preferred=i;setTarget(i)});
  item.addEventListener('keydown',e=>{
   if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){
    e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?items.length-1:(i+(e.key==='ArrowRight'?1:-1)+items.length)%items.length;items[n].focus();
   }
  });
 });
 dock.addEventListener('pointerleave',()=>{hover=-1;choose()});
 dock.addEventListener('focusout',()=>queueMicrotask(()=>{if(!dock.contains(document.activeElement)){focus=-1;choose()}}));
 new MutationObserver(()=>current()).observe(inner,{attributes:true,subtree:true,attributeFilter:['aria-current']});
 new MutationObserver(()=>{if(isReduced()){settle();paint()}}).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 const resize=new ResizeObserver(measure);resize.observe(dock);
 mq.addEventListener('change',()=>{if(isReduced()){settle();paint()}else start()});
 // Keep a predictable return point after closing concierge or any native dialog.
 document.querySelectorAll('dialog').forEach(el=>el.addEventListener('close',()=>{hover=-1;focus=-1;current()}));
 window.addEventListener('blur',()=>{hover=-1;focus=-1;current()});
 current();measure();
})();
