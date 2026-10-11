'use strict';
// Vector arrows keep the same fine, monochrome appearance on iOS and Android.
function arrowIcon(direction='up-right'){
 const paths={'up-right':'M6 18 18 6M6 6h12v12',right:'M4 12h16m-6-6 6 6-6 6',left:'M20 12H4m6-6-6 6 6 6',down:'M12 4v16m-6-6 6 6 6-6'};
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 const attrs={class:'ui-arrow',viewBox:'0 0 24 24',width:'18',height:'18',fill:'none',stroke:'currentColor','stroke-width':'1.3','stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true',focusable:'false'};
 Object.entries(attrs).forEach(([key,value])=>svg.setAttribute(key,value));
 const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',paths[direction]||paths['up-right']);svg.append(path);return svg;
}
document.documentElement.classList.add('js');
const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));
let returnFocus = null;
function showPanel(id,trigger){
 const el=document.getElementById(id);if(!el)return;
 document.querySelectorAll('dialog[open]').forEach(panel=>closePanel(panel.id,false));
 returnFocus=trigger||document.activeElement;el.hidden=false;
 if(typeof el.showModal==='function')el.showModal();else el.setAttribute('open','');
 document.body.classList.add('locked');
 el.querySelector('[data-close],button,a,input')?.focus({preventScroll:true});
 if(id==='concierge')$$('[data-chat]').forEach(b=>b.setAttribute('aria-expanded','true'));
 if(id==='navigation')$$('[data-menu]').forEach(b=>b.setAttribute('aria-expanded','true'));
}
function closePanel(id,restore=true){
 const el=document.getElementById(id);if(!el)return;
 if(typeof el.close==='function'&&el.open)el.close();else el.removeAttribute('open');el.hidden=true;
 if(!document.querySelector('dialog[open]'))document.body.classList.remove('locked');
 if(id==='concierge')$$('[data-chat]').forEach(b=>b.setAttribute('aria-expanded','false'));
 if(id==='navigation')$$('[data-menu]').forEach(b=>b.setAttribute('aria-expanded','false'));
 if(restore&&returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
}
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>closePanel(b.dataset.close)));
$$('[data-menu]').forEach(b=>b.addEventListener('click',e=>showPanel('navigation',e.currentTarget)));
$$('dialog').forEach(panel=>{
 panel.addEventListener('cancel',e=>{e.preventDefault();closePanel(panel.id);});
 panel.addEventListener('click',e=>{if(e.target!==panel)return;const r=panel.getBoundingClientRect();if(panel.id==='lightbox'||e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closePanel(panel.id);});
});
$$('[data-lightbox]').forEach(b=>b.addEventListener('click',()=>{const im=document.getElementById('lightbox-img');im.src=b.dataset.lightbox;im.alt=b.dataset.caption;document.getElementById('lightbox-caption').textContent=b.dataset.caption;showPanel('lightbox',b);}));
$$('.filters').forEach(group=>{$$('[data-filter]',group).forEach(b=>{b.setAttribute('aria-pressed',b.classList.contains('active')?'true':'false');b.addEventListener('click',()=>{$$('[data-filter]',group).forEach(x=>{x.classList.remove('active');x.setAttribute('aria-pressed','false');});b.classList.add('active');b.setAttribute('aria-pressed','true');const section=group.closest('section');$$('[data-category]',section).forEach(x=>{x.hidden=b.dataset.filter!=='all'&&!x.dataset.category.split(' ').includes(b.dataset.filter);});});});});
if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}});},{threshold:.07});$$('.reveal').forEach(x=>io.observe(x));}else{$$('.reveal').forEach(x=>x.classList.add('visible'));}
const dateStr=d=>new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);
$$('[data-booking]').forEach(form=>{const arrival=form.elements.date_arrival,departure=form.elements.date_departure;const today=new Date();today.setHours(0,0,0,0);arrival.min=dateStr(today);arrival.value=dateStr(today);const tomorrow=new Date(today);tomorrow.setDate(tomorrow.getDate()+1);departure.min=dateStr(tomorrow);departure.value=dateStr(tomorrow);
const sync=()=>{if(!arrival.value)return;const d=new Date(arrival.value+'T00:00:00');d.setDate(d.getDate()+1);departure.min=dateStr(d);if(!departure.value||departure.value<=arrival.value)departure.value=dateStr(d);departure.setCustomValidity('');};arrival.addEventListener('change',sync);departure.addEventListener('change',()=>departure.setCustomValidity(departure.value<=arrival.value?"Departure must be after your arrival.":''));form.addEventListener('submit',e=>{if(departure.value<=arrival.value){e.preventDefault();departure.setCustomValidity("Choose a departure date after your arrival.");departure.reportValidity();return;}const [year,month,day]=arrival.value.split('-');form.elements.fyear.value=year;form.elements.fmonth.value=Number(month);form.elements.fday.value=Number(day);form.elements.nbnights.value=Math.round((Date.parse(departure.value)-Date.parse(arrival.value))/86400000);});});
const topics={agenda:{intro:"Find upcoming events in the Cœur du Jura, with filters for dates, towns and interests.",choices:[["View the events calendar","/en/agenda.html"],["Outings this weekend","/en/agenda.html?periode=weekend"],["Book a stay","/en/reservation.html"]]},
romance:{intro:"For an escape for two, choose a Jacuzzi suite or the house's romantic getaway.",choices:[["The romantic escape · €362 for two","/en/sejours.html#romantique"],["Suites with Jacuzzi","/en/chambres.html"],["Check availability","/en/reservation.html"]]},
food:{intro:"Seasonal, homemade cuisine and Jura produce. Discover our restaurant or create a gourmet escape.",choices:[["The restaurant, menus & wines","/en/restaurant.html"],["Gourmet stay · €399 for two","/en/sejours.html#gastronomique"],["Book a table","/en/restaurant.html#table"]]},
nature:{intro:"Waterfalls, valleys and paths less travelled: discover the Jura at your own pace. Activities suggested in our itineraries are not included in the stay.",choices:[["Events around the hotel","/en/agenda.html"],["My nature itinerary · 2 days","/en/jura.html#nature"],["Explore the Jura","/en/jura.html"],["Book my retreat","/en/reservation.html"]]},
family:{intro:"The Family Jacuzzi Suite accommodates two adults, two children and a baby. Connecting Privilège Rooms are another option, subject to availability.",choices:[["Discover the Family Suite","/en/chambre-famille-jacuzzi.html"],["Connecting Privilège Rooms","/en/chambre-privilege.html"],["Heritage & family · stay ideas","/en/jura.html#patrimoine"],["Book with children",'https://secure.reservit.com/reservit/reserhotel.php?lang=FR&id=233&hotelid=2176']]},
booking:{intro:"For exact prices and availability, the hotel's official booking engine takes over. Would you prefer a room, a table or a gift box?",choices:[["Book a room","/en/reservation.html"],["Book a table","/en/restaurant.html#table"],["Choose a gift box",'https://casteldamandre.secretbox.fr/']]},
event:{intro:"A wedding, reception or seminar? The Castel team can create a tailor-made event for you.",choices:[["Options & capacities","/en/evenements.html"],["Prepare an enquiry","/en/contact.html?objet=evenement"],["Call the house",'tel:+33384660817']]},
practical:{intro:"The house is in Les Planches-près-Arbois, at 18 rue de la Cascade. Check-in from 3.30 pm, check-out before 11 am.",choices:[["Directions & route","/en/contact.html"],["Rates & practical questions","/en/reservation.html"],["Speak to someone at the hotel",'tel:+33384660817']]},
wine:{intro:"Arbois, Pupillin and Château-Chalon invite you to discover the Jura vineyards. Arrange visits directly with the estates.",choices:[["Vines & villages · 3 days","/en/jura.html#vignobles"],["The Castel wine list","/en/carte-vins.html"],["Gourmet stay","/en/sejours.html#gastronomique"]]}}
function renderChat(key){const body=document.getElementById('chat-body');body.replaceChildren();const p=document.createElement('p');p.textContent=key?topics[key].intro:"Welcome. What brings you to the Castel? This concierge guides you through the house's pages and services.";body.append(p);const choices=document.createElement('div');choices.className='chat-choices';body.append(choices);
if(key){topics[key].choices.forEach(([label,url])=>{const a=document.createElement('a');a.href=url;a.textContent=label;a.append(arrowIcon());choices.append(a);});const back=document.createElement('button');back.className='chat-back';back.append(arrowIcon('left'),document.createTextNode("Explore another idea"));back.addEventListener('click',()=>renderChat());body.append(back);}else{[['romance',"An escape for two"],['family',"A family stay"],['food',"Gastronomy & dining"],['nature',"Nature & waterfalls"],['wine',"Vines & villages"],['booking',"Book or give a gift"],['event',"An event"],['agenda',"Nearby events"],['practical',"Practical information"]].forEach(([id,label])=>{const b=document.createElement('button');b.textContent=label;b.append(arrowIcon());b.addEventListener('click',()=>renderChat(id));choices.append(b);});}const note=document.createElement('p');note.className='note';note.textContent="Guide with predefined choices. Availability and bookings are confirmed by the hotel and its official services.";body.append(note);}
renderChat();$$('[data-chat]').forEach(b=>b.addEventListener('click',e=>{const el=document.getElementById('concierge');if(el.hidden){renderChat();showPanel('concierge',e.currentTarget);}else closePanel('concierge');}));$$('[data-intent]').forEach(b=>b.addEventListener('click',()=>{renderChat(b.dataset.intent);showPanel('concierge',b);}));
$$('[data-contact]').forEach(form=>{const params=new URLSearchParams(location.search);const requested=params.get('objet');if(requested==='evenement')form.elements.objet.value="An event";if(requested==='seminaire')form.elements.objet.value="A seminar";const date=form.elements.date;date.min=dateStr(new Date());form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const data=new FormData(form);const lines=["Hello,",'',...Object.entries({nom:"Name",email:"Email",telephone:"Telephone",objet:"Subject",date:'Date',personnes:"Guests"}).map(([k,label])=>label+' : '+(data.get(k)||"Not provided")),'',String(data.get('message')),'',"Please confirm availability and conditions."];const url='mailto:hotel@casteldamandre.com?subject='+encodeURIComponent(data.get('objet')+' — Castel Damandre')+'&body='+encodeURIComponent(lines.join('\n'));const status=form.querySelector('[role=status]');status.textContent="Your enquiry is ready. Send it from your email application; it is not a confirmed booking.";const a=document.createElement('a');a.href=url;a.textContent=" Open my email again ";a.append(arrowIcon());status.append(a);location.href=url;});});
$$('[data-privacy]').forEach(b=>b.addEventListener('click',()=>{location.href="/en/confidentialite.html#cookies-refonte";}));
