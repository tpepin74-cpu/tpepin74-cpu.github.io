import LiquidGallery from './LiquidGallery';
import NatureCollection from './NatureCollection';
import React from 'react';
import {Image,Arrow,Plus,Reveal} from './Editorial';
import {equipment} from './stays';

import {CJDestination} from './DestinationStories';
import './product-suite.css';
const views=[
 {label:'L’extérieur',image:'golf-1535',title:'Une présence discrète.',copy:'Des lignes sobres, une terrasse protégée et un paysage qui prend toute la place.',alt:'La façade et la terrasse de la suite au Golf de Neuchâtel'},
 {label:'Le salon',image:'golf-1522',title:'Le temps prend ses aises.',copy:'Une chaise longue Ligne Roset, la lumière naturelle et le plaisir de ne rien prévoir.',alt:'Le salon SNUUG et sa chaise longue Ligne Roset'},
 {label:'La chambre',image:'golf-1603',title:'La nuit vous appartient.',copy:'Un lit double de 160 × 200 cm, du linge Garnier-Thiebaut et une atmosphère intime.',alt:'Le lit double dans la suite SNUUG'},
 {label:'La salle d’eau',image:'golf-1530',title:'Vos rituels, autrement.',copy:'Une douche, de belles matières et les soins Aesop pour prendre le temps de soi.',alt:'La salle d’eau de la suite au Golf de Neuchâtel'},
 {label:'La terrasse',image:'golf-1574',title:'Votre pièce à ciel ouvert.',copy:'Cinq mètres carrés pour un petit-déjeuner à deux, un livre ou simplement le paysage.',alt:'Petit-déjeuner sur la terrasse face au Golf de Neuchâtel'}
];
export default function ProductSuite({beforeSuite,afterSuite}){
 return <div className="product-suite">
  <section className="product-hero" aria-label="Découvrir la suite SNUUG">
   <Image eager src="/images/official/golf-1535.webp" alt="Une suite SNUUG et sa terrasse au cœur du Golf de Neuchâtel"/>
   <div className="product-hero-shade"/>
   <div className="product-hero-copy"><span>The supernature hotel</span><h1>Une suite.<br/>En pleine nature.</h1><p>Une suite pour deux. Le paysage pour horizon.</p><a className="button light" href="#suite">Découvrir<Arrow direction="down"/></a></div>
  </section>
  <nav className="product-chapters" aria-label="Les chapitres de la suite">{[['Le concept','suite'],['L’intérieur','interieur'],['Le confort','equipements'],['Les collections','collections']].map(([label,id])=><a key={id} href={'#'+id}>{label}</a>)}</nav>
  <section id="suite" className="product-intro"><Reveal><span className="eyebrow">Le concept SNUUG</span><h2>Votre chambre d’hôtel.<br/>Au cœur du paysage.</h2></Reveal><div className="product-intro-side"><p>SNUUG est une suite indépendante pour deux, installée dans un paysage choisi. À l’intérieur : un lit, un salon et une salle d’eau. Dehors : votre terrasse privée. Le confort d’un hôtel, au plus près de la nature.</p><dl className="product-specs"><div><dt>Surface intérieure</dt><dd>20 <small>m²</small></dd></div><div><dt>Voyageurs</dt><dd>2</dd></div><div><dt>Terrasse privée</dt><dd>5 <small>m²</small></dd></div></dl></div></section>
  <section className="product-panorama" id="interieur"><Image src="/images/official/golf-1997.webp" alt="Vue d’ensemble de l’intérieur d’une suite SNUUG, du salon à la chambre"/><div><span className="eyebrow">Bienvenue à l’intérieur</span><h2>Dormir. Se détendre.<br/>Profiter du paysage.</h2></div></section>
  <section className="product-explorer" aria-label="Explorer les espaces de la suite">
   <div className="product-section-head"><span className="eyebrow">Une suite, dans les moindres détails</span><h2>Cinq espaces.<br/>Une seule suite.</h2></div>
   <LiquidGallery items={views.map(v=>({src:'/images/official/'+v.image+'.webp',alt:v.alt,title:v.label,eyebrow:v.title,text:v.copy,badge:v.label==='La chambre'?'Arrivée dès 15 h':undefined}))} label="Explorer les espaces de la suite"/>
  </section>
  <section id="equipements" className="product-comfort"><div className="product-comfort-photo"><Image src="/images/official/golf-1613.webp" alt="Le café et les petites attentions dans la suite SNUUG"/></div><div className="product-comfort-copy"><span className="eyebrow">Le luxe de n’avoir à penser à rien</span><h2>Le confort,<br/>dans chaque détail.</h2><p>Du premier café aux derniers instants de la journée, chaque détail accompagne votre séjour.</p><div className="equipment-disclosures">{equipment.map(([icon,title,copy])=><details key={title}><summary>{title}<Plus/></summary><p>{copy}</p></details>)}</div></div></section>
  <section id="design-histoire" className="product-materials"><div><span className="eyebrow">Des signatures, une harmonie</span><Reveal><h2>Le design se voit.<br/>Le confort se ressent.</h2></Reveal><p>Le bois, les textiles, les objets que l’on touche chaque jour. Une sélection de maisons qui partagent le goût du détail.</p><div className="product-partners"><span>Ligne Roset</span><span>Garnier-Thiebaut</span><span>Aesop</span><span>Laufen</span><span>Loxone</span></div></div><Image src="/images/official/golf-1592.webp" alt="Le bois et les détails de finition dans la suite SNUUG"/></section>
  {afterSuite}
  <section id="collections" className="suite-collections page-container"><span className="eyebrow">Un concept, plusieurs paysages</span><h2>La même idée de l’ailleurs.<br/>Des univers différents.</h2><p>Nature, Vigne, Golf et Signature déclinent le concept SNUUG. Choisissez un cadre ; retrouvez l’intimité d’une suite indépendante.</p><div className="suite-collection-links"><a href="#snuug-nature">Nature · voir les photos<Arrow/></a><a href="/snuug/sejours/neuchatel">Golf · Neuchâtel<Arrow/></a><a href="#snuug-cj">Signature · Le Noirmont<Arrow/></a></div><p className="fineprint">La collection Vigne et les prochaines adresses seront présentées au fil de leur ouverture.</p></section>
  <details className="suite-nature-fold"><summary>Découvrir SNUUG Nature en images<Plus/></summary><NatureCollection/></details>
  <span id="signature"/>
  <details className="product-destination-details"><summary><span><small>La collection Signature</small><strong>SNUUG-CJ. Le Jura, grandeur nature.</strong></span><Plus/></summary><div className="page-container"><CJDestination/></div></details>
  <section className="product-finale"><Image src="/images/official/noirmont-1982.webp" alt="La terrasse SNUUG-CJ ouverte sur le paysage du Noirmont"/><div><span className="eyebrow">À vous de choisir la suite</span><h2>Prêt à vivre<br/>l’expérience SNUUG ?</h2><a className="button light" href="/snuug/reservation">Découvrir les destinations<Arrow/></a></div></section>
 </div>
}
