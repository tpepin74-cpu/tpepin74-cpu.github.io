import React,{useRef} from 'react';
import {motion,useScroll,useTransform,useReducedMotion} from 'framer-motion';
import {Image,Arrow} from './Editorial';
export default function EditorialHero({eyebrow,title,second,copy,image,alt,href,label}){
 const ref=useRef(null),reduced=useReducedMotion();
 const {scrollYProgress}=useScroll({target:ref,offset:['start start','end start']});
 const y=useTransform(scrollYProgress,[0,1],['0%','9%']);
 return <section ref={ref} className="editorial-hero">
  <motion.div className="editorial-hero-photo" style={{y:reduced?0:y}}><Image eager src={image} alt={alt}/></motion.div>
  <div className="editorial-hero-shade"/>
  <div className="editorial-hero-copy"><span className="eyebrow">{eyebrow}</span><h1>{title}<br/>{second}</h1>{copy&&<p>{copy}</p>}{href&&<a className="button light" href={href}>{label}<Arrow direction="down"/></a>}</div>
 </section>
}
