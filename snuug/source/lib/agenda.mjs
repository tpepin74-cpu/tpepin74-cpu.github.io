export const SOURCE='https://neuchatel-vins-terroir.ch/evenement/';
const MONTHS=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
export function clean(s=''){return s.replace(/<[^>]*>/g,' ').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&(?:rsquo|lsquo|#8217);/g,'’').replace(/&amp;/g,'&').replace(/&(?:nbsp|#160);/g,' ').replace(/&(?:ndash|mdash);/g,'–').replace(/&quot;/g,'"').replace(/\s*\u2014\s*/g,', ').replace(/\s+/g,' ').trim()}
export function dateISO(s){const m=s.toLowerCase().match(/(\d{1,2})\s+(\S+)\s+(20\d{2})/);if(!m)return null;const month=MONTHS.indexOf(m[2]);if(month<0)return null;const v=`${m[3]}-${String(month+1).padStart(2,'0')}-${m[1].padStart(2,'0')}`;return new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v?v:null}
// Only use the event's main content image; never a site-wide logo or unrelated card.
export function eventImage(html,sourceUrl){
 const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
 const tag=main?.match(/<img\b[^>]*>/i)?.[0];if(!tag)return null;
 const attr=name=>clean(tag.match(new RegExp('\\b'+name+'=["\']([^"\']*)["\']','i'))?.[1]||'');
 try{const u=new URL(attr('src'),sourceUrl);if(u.protocol!=='https:'||!['neuchatel-vins-terroir.ch','neuchatelvinsterroir.ch'].includes(u.hostname)||!u.pathname.startsWith('/wp-content/uploads/')||!(/\.(?:jpe?g|png|webp|avif)$/i.test(u.pathname)))return null;
 const width=Number(attr('width'))||0,height=Number(attr('height'))||0;
 return {url:u.href,width,height,fit:/\.png$/i.test(u.pathname)||(height>width)?'contain':'cover',sourceUrl,credit:'Visuel publié par Neuchâtel Vins et Terroir'};
 }catch{return null}
}
export function parseEvent(html,url){const title=clean(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]);const dateText=clean(html.match(/fa-calendar-alt[^>]*><\/i>([\s\S]*?)<\/div>/)?.[1]);const dates=dateText.match(/\d{1,2}\s+[a-zéû]+\s+20\d{2}/gi)||[];const start=dateISO(dates[0]||'');const end=dateISO(dates.at(-1)||'');const place=clean(html.match(/fa-location-dot[^>]*><\/i>([\s\S]*?)<\/div>/)?.[1]);if(!title||!start||!end||end<start||!place)return null;
 const regions=[['Neuchâtel',/neuchâtel|cernier|cortaillod|cressier|boudry|saint.blaise|val.de.travers|couvet|môtiers|chaumont|la.chaux.de.fonds|le.locle|bevaix|vaumarcus|le.landeron|gorgier|hauteri?ve|marin.epagnier|peseux|fleurier|evologia/i],['Jura',/delémont|porrentruy|sai[gn]nelégier|courtételle|courroux|glovelier/i]];
 const region=regions.find(([,re])=>re.test(place))?.[0];if(!region)return null;
 return {id:url.split('/').filter(Boolean).at(-1),title,start,end,place,region,url,image:eventImage(html,url),source:'Neuchâtel Vins et Terroir'};
}
export function eventLinks(html){return [...new Set([...html.matchAll(/<a\s+href="(https:\/\/neuchatel-vins-terroir.ch\/evenement\/[^"?#]+\/)"[^>]*>\s*<h3>/g)].map(m=>m[1]))].slice(0,36)}
export function today(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Zurich'}).format(new Date())}
export function upcoming(events,day=today()){return events.filter(e=>['Neuchâtel','Jura'].includes(e.region)&&e.end>=day).sort((a,b)=>a.start.localeCompare(b.start))}
async function get(url){const r=await fetch(url,{signal:AbortSignal.timeout(25000),redirect:'manual',headers:{Accept:'text/html'}});if(!r.ok){const error=new Error(`Source HTTP ${r.status}`);if(r.status===429){const value=r.headers.get('Retry-After');const seconds=Number(value);error.retryAfterMs=Math.max(3600000,Number.isFinite(seconds)&&seconds>0?seconds*1000:Date.parse(value)-Date.now()||0);}throw error;}const t=await r.text();if(t.length>2000000)throw new Error('Source trop volumineuse');return t}
export async function importAgenda(){const links=eventLinks(await get(SOURCE));if(!links.length)throw new Error('Format source inconnu');const results=[];let failed=0;const errors=[];
 // One request at a time, no more than fifteen requests a minute. Stop on rate limiting.
 for(const url of links){await new Promise(resolve=>setTimeout(resolve,4000));try{const event=parseEvent(await get(url),url);if(event)results.push(event)}catch(error){if(error.retryAfterMs)throw error;failed++;errors.push(error.message);}}
 if(failed>links.length/3||!results.length)throw new Error('Source incomplète: '+failed+'/'+links.length+' échecs, '+results.length+' événements; '+[...new Set(errors)].join(', '));
 return {events:results,updatedAt:new Date().toISOString(),partial:failed>0,source:SOURCE};}
