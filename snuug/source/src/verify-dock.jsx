import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import assert from 'node:assert/strict';
import {House} from 'lucide-react';
import Dock,{notchGeometry} from './Dock';
for(const width of [296,308,428])for(const center of [-100,48,width/2,width-48,width+100])for(const speed of [-2400,0,2400]){
 const path=notchGeometry(width,center,speed,width<=308);
 assert.equal((path.match(/C /g)||[]).length,2,'Exactly two cubic curves form the notch');
 assert.ok(!/NaN|Infinity/.test(path));
 const start=Number(path.match(/H ([\d.]+) C/)[1]);
 const end=Number(path.match(/C [^C]+ C [^H]+ 0 ([\d.]+) 0 H/)[1]);
 assert.ok(start>=22&&end<=width-22,'The notch must not enter either corner');
}
const items=['Accueil','Lieu','Chambres','À vivre','Réserver'].map((label,i)=>({id:String(i),label,icon:House,href:'#'+i}));
const html=renderToStaticMarkup(<Dock items={items} active="0" onSelect={()=>{}}/>);
assert.equal((html.match(/<button/g)||[]).length,5);assert.equal((html.match(/aria-current="location"/g)||[]).length,1);
console.log('Dock: 45 geometry cases, 5 accessible buttons, one active item verified.');
