import React from 'react';
import InlineArrow from './InlineArrow';

export default function DepartureCTA({id='prochaine-echappee'}){
 return <section id={id} className="departure-cta" aria-labelledby={`${id}-title`}>
  <h2 id={`${id}-title`}>On part quand ?</h2>
  <nav className="departure-collections" aria-label="Choisir sa SNUUG">
   <a href="/snuug/sejours/neuchatel">Golf <InlineArrow/></a>
   <a href="/snuug/reservation?collection=vignes">Vignes <InlineArrow/></a>
   <a href="/snuug/le-concept#snuug-nature">Nature <InlineArrow/></a>
  </nav>
  <a className="reserve-button" href="/snuug/reservation">Réserver <InlineArrow/></a>
 </section>
}
