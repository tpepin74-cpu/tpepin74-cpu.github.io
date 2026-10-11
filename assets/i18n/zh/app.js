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
const sync=()=>{if(!arrival.value)return;const d=new Date(arrival.value+'T00:00:00');d.setDate(d.getDate()+1);departure.min=dateStr(d);if(!departure.value||departure.value<=arrival.value)departure.value=dateStr(d);departure.setCustomValidity('');};arrival.addEventListener('change',sync);departure.addEventListener('change',()=>departure.setCustomValidity(departure.value<=arrival.value?"退房日期须晚于入住日期。":''));form.addEventListener('submit',e=>{if(departure.value<=arrival.value){e.preventDefault();departure.setCustomValidity("请选择晚于入住日期的退房日期。");departure.reportValidity();return;}const [year,month,day]=arrival.value.split('-');form.elements.fyear.value=year;form.elements.fmonth.value=Number(month);form.elements.fday.value=Number(day);form.elements.nbnights.value=Math.round((Date.parse(departure.value)-Date.parse(arrival.value))/86400000);});});
const topics={agenda:{intro:"查看 Cœur du Jura 即将举行的活动，并按时段、城镇与兴趣筛选。",choices:[["查看活动日历","/zh/agenda.html"],["本周末出游","/zh/agenda.html?periode=weekend"],["预订住宿","/zh/reservation.html"]]},
romance:{intro:"想要双人悠闲时光，可选择带按摩浴缸的套房，或酒店的浪漫短途之旅。",choices:[["浪漫短途之旅 · 双人 362 €","/zh/sejours.html#romantique"],["带按摩浴缸的套房","/zh/chambres.html"],["查看可订日期","/zh/reservation.html"]]},
food:{intro:"店内自制的应季料理与 Jura 食材。探索我们的餐桌，或规划一次美食之旅。",choices:[["餐桌、菜单与葡萄酒","/zh/restaurant.html"],["美食住宿 · 双人 399 €","/zh/sejours.html#gastronomique"],["预订餐位","/zh/restaurant.html#table"]]},
nature:{intro:"瀑布、袋形山谷与别样小径：随您的节奏探索 Jura。路线中推荐的活动不包含在住宿内。",choices:[["酒店周边活动","/zh/agenda.html"],["我的自然路线 · 2 天","/zh/jura.html#nature"],["探索 Jura","/zh/jura.html"],["预订我的休憩之所","/zh/reservation.html"]]},
family:{intro:"家庭按摩浴缸套房可容纳两位成人、两位儿童和一位婴儿。相连的尊享客房也是一种选择，视房态而定。",choices:[["探索家庭套房","/zh/chambre-famille-jacuzzi.html"],["相连的尊享客房","/zh/chambre-privilege.html"],["文化遗产与家庭 · 住宿旅行灵感","/zh/jura.html#patrimoine"],["预订携童住宿",'https://secure.reservit.com/reservit/reserhotel.php?lang=FR&id=233&hotelid=2176']]},
booking:{intro:"准确价格与房态由酒店官方预订系统提供。您想预订客房、餐位，还是礼品套装？",choices:[["预订客房","/zh/reservation.html"],["预订餐位","/zh/restaurant.html#table"],["选择礼品套装",'https://casteldamandre.secretbox.fr/']]},
event:{intro:"婚礼、宴会或研讨会？Castel 团队可为您设计定制活动。",choices:[["活动选择与容量","/zh/evenements.html"],["准备咨询","/zh/contact.html?objet=evenement"],["致电酒店",'tel:+33384660817']]},
practical:{intro:"酒店位于 Les Planches-près-Arbois，地址为 18 rue de la Cascade。入住时间为 15 时 30 分起，退房时间为 11 时前。",choices:[["交通与路线","/zh/contact.html"],["价格与实用问题","/zh/reservation.html"],["联系酒店工作人员",'tel:+33384660817']]},
wine:{intro:"Arbois、Pupillin 和 Château-Chalon 邀您探索 Jura 葡萄园。参观请直接与酒庄安排。",choices:[["葡萄园与村庄 · 3 天","/zh/jura.html#vignobles"],["Castel 葡萄酒单","/zh/carte-vins.html"],["美食住宿","/zh/sejours.html#gastronomique"]]}}
function renderChat(key){const body=document.getElementById('chat-body');body.replaceChildren();const p=document.createElement('p');p.textContent=key?topics[key].intro:"欢迎。怎样的向往带您来到 Castel？这位礼宾将引导您浏览酒店页面与服务。";body.append(p);const choices=document.createElement('div');choices.className='chat-choices';body.append(choices);
if(key){topics[key].choices.forEach(([label,url])=>{const a=document.createElement('a');a.href=url;a.textContent=label;a.append(arrowIcon());choices.append(a);});const back=document.createElement('button');back.className='chat-back';back.append(arrowIcon('left'),document.createTextNode("探索另一种向往"));back.addEventListener('click',()=>renderChat());body.append(back);}else{[['romance',"双人短途之旅"],['family',"家庭度假"],['food',"美食与餐桌"],['nature',"自然与瀑布"],['wine',"葡萄园与村庄"],['booking',"预订或赠礼"],['event',"活动"],['agenda',"附近活动"],['practical',"实用信息"]].forEach(([id,label])=>{const b=document.createElement('button');b.textContent=label;b.append(arrowIcon());b.addEventListener('click',()=>renderChat(id));choices.append(b);});}const note=document.createElement('p');note.className='note';note.textContent="基于预设选项的向导。房态与预订由酒店及其官方服务确认。";body.append(note);}
renderChat();$$('[data-chat]').forEach(b=>b.addEventListener('click',e=>{const el=document.getElementById('concierge');if(el.hidden){renderChat();showPanel('concierge',e.currentTarget);}else closePanel('concierge');}));$$('[data-intent]').forEach(b=>b.addEventListener('click',()=>{renderChat(b.dataset.intent);showPanel('concierge',b);}));
$$('[data-contact]').forEach(form=>{const params=new URLSearchParams(location.search);const requested=params.get('objet');if(requested==='evenement')form.elements.objet.value="活动";if(requested==='seminaire')form.elements.objet.value="研讨会";const date=form.elements.date;date.min=dateStr(new Date());form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const data=new FormData(form);const lines=["您好，",'',...Object.entries({nom:"姓名",email:"电子邮箱",telephone:"电话",objet:"主题",date:"日期",personnes:"人数"}).map(([k,label])=>label+' : '+(data.get(k)||"未填写")),'',String(data.get('message')),'',"请为我确认可行安排与相关条款。"];const url='mailto:hotel@casteldamandre.com?subject='+encodeURIComponent(data.get('objet')+' — Castel Damandre')+'&body='+encodeURIComponent(lines.join('\n'));const status=form.querySelector('[role=status]');status.textContent="您的请求已准备就绪。请从邮件应用发送；这并不构成已确认的预订。";const a=document.createElement('a');a.href=url;a.textContent=" 重新打开我的电子邮件 ";a.append(arrowIcon());status.append(a);location.href=url;});});
$$('[data-privacy]').forEach(b=>b.addEventListener('click',()=>{location.href="/zh/confidentialite.html#cookies-refonte";}));
