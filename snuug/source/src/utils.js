export function localDate(date=new Date()){return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-')}
export function nextDate(value){const d=new Date(value+'T12:00:00');d.setDate(d.getDate()+1);return localDate(d)}
export function nightsBetween(start,end){return Math.round((Date.parse(end+'T12:00:00Z')-Date.parse(start+'T12:00:00Z'))/86400000)}
export function displayDate(value){return value?new Intl.DateTimeFormat('fr-CH',{day:'numeric',month:'long',year:'numeric'}).format(new Date(value+'T12:00:00')):'Dates à définir'}
export function isValidDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return false;const date=new Date(value+'T12:00:00Z');return !Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===value}
export function validateStay(start,end,flexible){if(flexible)return '';if(!isValidDate(start)||!isValidDate(end))return 'Choisissez une date d’arrivée et une date de départ.';if(start<localDate())return 'La date d’arrivée doit être aujourd’hui ou plus tard.';if(end<=start)return 'Le départ doit être après l’arrivée.';return ''}
export function emailLink(subject,body){return 'mailto:hello@snuug.ch?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body)}
