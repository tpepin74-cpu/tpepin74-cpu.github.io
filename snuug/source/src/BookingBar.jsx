import React from 'react';
import {Arrow} from './Editorial';
import {localDate,nextDate} from './utils';
import './booking-bar.css';
export function DateFields({value,onChange}){
 const arrival=e=>onChange({...value,arrival:e.currentTarget.value,departure:value.departure<=e.currentTarget.value?'':value.departure});
 const departure=e=>onChange({...value,departure:e.currentTarget.value});
 return <div className="dates-fields"><label>Arrivée<input aria-label="Date d’arrivée" type="date" min={localDate()} value={value.arrival} onChange={arrival}/></label><label>Départ<input aria-label="Date de départ" type="date" min={value.arrival?nextDate(value.arrival):localDate()} value={value.departure} onChange={departure}/></label></div>
}
export default function BookingBar({value,onChange,onSubmit,error='',destination=true,compact=false,submitLabel='Explorer les séjours'}){
 return <form className={'snuug-booking-bar'+(compact?' booking-bar-compact':'')} onSubmit={onSubmit} aria-label="Rechercher un séjour">
 {destination&&<label className="booking-bar-destination">Destination<select value={value.collection||'toutes'} onChange={e=>onChange({...value,collection:e.target.value})}><option value="toutes">Toutes les collections</option><option value="golf">Neuchâtel · Golf</option><option value="vignes">Vigne · à venir</option><option value="nature">Nature · à venir</option><option value="signature">Signature · à venir</option></select></label>}
 <DateFields value={value} onChange={onChange}/><label className="booking-bar-guests">Voyageurs<select value={value.guests} onChange={e=>onChange({...value,guests:e.target.value})}><option value="2">2 adultes</option><option value="1">1 adulte</option></select></label>
 <button type="submit" className="booking-bar-submit">{submitLabel}<Arrow/></button>{error&&<p className="search-error" role="alert">{error}</p>}
 </form>
}
