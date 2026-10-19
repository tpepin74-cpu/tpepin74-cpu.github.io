import React from 'react';
import {Image} from './Editorial';
import {photos} from './data';
// Native sticky panels follow the document scroll: no wheel interception or render loop.
export function Sensations(){return <section className="sensations-scroll" aria-label="Les quatre sensations SNUUG">{[['Souffler',photos.forest],['Savourer',photos.tea],['Contempler',photos.horizon],['Explorer',photos.golf]].map(([verb,src],i)=><article className="sensation-panel" key={verb} style={{zIndex:i+1}}><Image src={src} alt=""/><div className="sensation-caption"><span>0{i+1} / 04</span><h2>{verb}</h2></div></article>)}</section>}
