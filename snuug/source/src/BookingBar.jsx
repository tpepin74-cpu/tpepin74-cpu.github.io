import React,{useId,useState} from 'react';
import {AnimatePresence} from 'framer-motion';
import {Search,ChevronDown,MapPin} from 'lucide-react';
import {Dialog} from './Editorial';
import {localDate,nextDate} from './utils';

const collectionLabels={toutes:'Tous les lieux',golf:'Neuchâtel · Golf',vignes:'Vigne · à venir',nature:'Nature · à venir',signature:'Signature · à venir'};
const shortDate=value=>value?new Intl.DateTimeFormat('fr-CH',{day:'numeric',month:'short'}).format(new Date(value+'T12:00:00')):'';

export function DateFields({value,onChange,errorId}){
 const arrival=e=>onChange({...value,arrival:e.currentTarget.value,departure:value.departure<=e.currentTarget.value?'':value.departure});
 const departure=e=>onChange({...value,departure:e.currentTarget.value});
 // Keep the platform's accessible calendar and its touch/keyboard behavior.
 const openPicker=e=>{try{e.currentTarget.showPicker?.()}catch{/* Keyboard entry remains available. */}};
 return <div className="dates-fields">{[
  ['arrival','Arrivée','Date d’arrivée',localDate(),arrival],
  ['departure','Départ','Date de départ',value.arrival?nextDate(value.arrival):localDate(),departure]
 ].map(([key,label,accessible,min,change])=><label key={key} className="booking-segment booking-date-segment"><span className="booking-field-label">{label}</span><span className={'booking-date-control'+(!value[key]?' is-empty':'')}><input aria-label={accessible} aria-describedby={errorId} name={key} type="date" lang="fr-CH" min={min} value={value[key]} onChange={change} onClick={openPicker}/>{!value[key]&&<span className="booking-date-placeholder" aria-hidden="true">Ajouter</span>}</span></label>)}</div>;
}

function BookingForm({value,onChange,onSubmit,error='',destination=true,compact=false,submitLabel='Rechercher'}){
 const errorId=useId();
 return <div className={'booking-bar-shell'+(compact?' booking-shell-compact':'')}>
 <form className={'snuug-booking-bar'+(compact?' booking-bar-compact':'')+(!destination?' booking-no-destination':'')} onSubmit={onSubmit} aria-label="Rechercher un séjour">
  {destination&&<label className="booking-segment booking-bar-destination"><span className="booking-field-label">Destination</span><span className="booking-select-control"><select name="collection" aria-label="Destination" value={value.collection||'toutes'} onChange={e=>onChange({...value,collection:e.target.value})}>{Object.entries(collectionLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select><ChevronDown aria-hidden="true" size={14}/></span></label>}
  <DateFields value={value} onChange={onChange} errorId={error?errorId:undefined}/>
  <label className="booking-segment booking-bar-guests"><span className="booking-field-label">Voyageurs</span><span className="booking-select-control"><select name="guests" aria-label="Voyageurs" value={value.guests} onChange={e=>onChange({...value,guests:e.target.value})}><option value="2">2 adultes</option><option value="1">1 adulte</option></select><ChevronDown aria-hidden="true" size={14}/></span></label>
  <button type="submit" className="booking-bar-submit" aria-label={submitLabel}><Search aria-hidden="true" size={22} strokeWidth={1.8}/><span>{submitLabel}</span></button>
 </form>
 {error&&<p id={errorId} className="booking-search-error" role="alert">{error}</p>}
 </div>;
}

export default function BookingBar({mobileSummary=false,...props}){
 const [open,setOpen]=useState(false);
 const {value}=props;
 const dates=value.arrival?(shortDate(value.arrival)+(value.departure?' au '+shortDate(value.departure):' · départ à choisir')):'Choisir mes dates';
 return <>
 <div className={mobileSummary?'booking-desktop-full':''}><BookingForm {...props}/></div>
 {mobileSummary&&<button type="button" className="booking-mobile-summary" onClick={()=>setOpen(true)} aria-haspopup="dialog"><MapPin size={22} strokeWidth={1.5} aria-hidden="true"/><span className="booking-mobile-copy"><strong>{value.collection&&value.collection!=='toutes'?collectionLabels[value.collection]:'Où vous évader ?'}</strong><span>{dates}<b aria-hidden="true"> · </b>{value.guests} adulte{value.guests==='2'?'s':''}</span></span><span className="booking-mobile-search" aria-hidden="true"><Search size={21} strokeWidth={1.8}/></span></button>}
 <AnimatePresence>{open&&<Dialog title="Préparer votre réservation" onClose={()=>setOpen(false)} className="app-sheet booking-search-sheet"><div className="booking-sheet-heading"><span>Votre prochaine échappée</span><h2>On part quand ?</h2><p>Un lieu. Quelques jours. Du temps pour vous.</p></div><BookingForm {...props}/></Dialog>}</AnimatePresence>
 </>;
}
