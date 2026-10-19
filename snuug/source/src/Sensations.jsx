import React from 'react';
import {Image,Arrow} from './Editorial';
import {photos} from './data';
// Native sticky panels follow the document scroll: no wheel interception or render loop.
export function Sensations(){return <section className="sensations-scroll" aria-label="Les quatre sensations SNUUG">{[['Souffler',photos.forest,'S’évader à deux','amoureux'],['Savourer',photos.tea,'Découvrir les saveurs','vacances'],['Contempler',photos.horizon,'Prendre le temps','deconnexion'],['Explorer',photos.golf,'Vivre les escapades','golf']].map(([verb,src,cta,target],i)=><article className="sensation-panel" key={verb} style={{zIndex:i+1}}><Image src={src} alt=""/><div className="sensation-caption"><span>0{i+1} / 04</span><h2>{verb}</h2><a className="sensation-cta" href={'/snuug/experiences#'+target}>{cta}<Arrow/></a></div></article>)}</section>}
