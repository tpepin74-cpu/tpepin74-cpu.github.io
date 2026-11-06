import React,{useState} from 'react';
import {Dialog,Image,Arrow} from './Editorial';
import './nature-collection.css';
const photos=[
 ['exterieur','Au cœur du paysage','La suite SNUUG Nature au milieu des pâturages, avec des vaches près de la terrasse'],
 ['terrasse','La vie au grand air','La terrasse de SNUUG Nature, ses deux fauteuils et sa vue sur les prés'],
 ['chambre','Le calme, à l’intérieur','Le lit et le salon aux textiles verts dans l’intérieur en bois de SNUUG Nature'],
 ['vue-interieure','Une fenêtre sur le vivant','Les vaches dans le pâturage vues depuis la fenêtre de la suite'],
 ['poele-cafe','Les instants à soi','Le poêle et le coin café de la suite SNUUG Nature'],
 ['salle-eau','Les gestes du quotidien','La vasque, le miroir éclairé et les soins Aesop dans la salle d’eau'],
 ['matiere','Le goût des matières','Détail du tissu vert du mobilier, éclairé par la lumière naturelle'],
 ['details','L’attention au détail','Motifs de la paroi vitrée et lumière du miroir dans la salle d’eau'],
 ['paturages','Un autre rythme','SNUUG Nature dans une prairie bordée d’arbres, entourée de vaches']
];
const src=name=>'/images/nature/'+name+'.webp';
export default function NatureCollection(){
 const [selected,setSelected]=useState(null);
 const move=step=>setSelected(i=>(i+step+photos.length)%photos.length);
 return <section id="snuug-nature" className="nature-collection" aria-labelledby="nature-heading">
  <div className="nature-heading"><div><span className="eyebrow">La collection Nature</span><h2 id="nature-heading">Au plus près<br/>du vivant.</h2></div><p>Des pâturages pour horizon. Le bois, la lumière et un intérieur qui invite à ralentir. Découvrez SNUUG Nature, dehors comme dedans.</p></div>
  <div className="nature-photos">{photos.map(([name,title,alt],i)=><button key={name} type="button" className={'nature-photo'+(i===0?' nature-cover':'')} onClick={()=>setSelected(i)} aria-label={'Agrandir : '+title} aria-haspopup="dialog"><Image src={src(name)} srcSet={`${src(name+'-800')} 800w, ${src(name)} 1920w`} sizes={i===0?'(max-width:760px) 100vw, 90vw':'(max-width:600px) 50vw, (max-width:1000px) 45vw, 23vw'} alt={alt}/><span>{title}<Arrow/></span></button>)}</div>
  {selected!==null&&<Dialog title="SNUUG Nature en images" className="gallery-dialog" onClose={()=>setSelected(null)} onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();move(1)}if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}}}><div className="lightbox-content"><Image eager src={src(photos[selected][0])} alt={photos[selected][2]}/><div className="lightbox-controls"><button type="button" onClick={()=>move(-1)} aria-label="Photo précédente"><Arrow direction="left"/></button><p aria-live="polite">{photos[selected][1]}<span>{selected+1} / {photos.length}</span></p><button type="button" onClick={()=>move(1)} aria-label="Photo suivante"><Arrow direction="right"/></button></div></div></Dialog>}
 </section>
}
