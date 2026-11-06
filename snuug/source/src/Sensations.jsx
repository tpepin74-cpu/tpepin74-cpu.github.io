import React,{useRef} from 'react';
import {motion,useScroll,useTransform,useReducedMotion} from 'framer-motion';
import {imageAsset} from './image-assets';
export function Sensations(){
 const section=useRef(null),reduced=useReducedMotion();
 const {scrollYProgress}=useScroll({target:section,offset:['start end','end start']});
 const y=useTransform(scrollYProgress,[0,1],['-8%','8%']);
 return <section ref={section} id="sensations" className="souffler-parallax" aria-labelledby="souffler-title"><motion.img src={imageAsset('/images/official/golf-1514.webp')} alt="La nature autour du Golf de Neuchâtel" loading="lazy" style={{y:reduced?0:y}}/><h2 id="souffler-title">Souffler.</h2></section>
}
