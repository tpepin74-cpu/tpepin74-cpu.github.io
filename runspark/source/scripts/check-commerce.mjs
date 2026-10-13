import assert from 'node:assert/strict';
import { readFile, readdir, access, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import { COURSE_NAMES, configurationFromLink, trackCommerce } from '../src/commerce.js';
import { COURSES } from '../src/course-data.js';
import { DEFAULT_CONFIGURATION, FINISHES, PLATES, FONTS, checkoutFields, configurationError, personalizationAction } from '../src/product-order.js';

const blank = {...DEFAULT_CONFIGURATION};
assert.equal(configurationFromLink(blank,'?course=paris&finish=blanc').line1,'MARATHON DE PARIS');
assert.equal(configurationFromLink({...blank,line1:'ALICE',line2:'3:20:15'},'?course=berlin&finish=bois').line1,'ALICE');
assert.equal(configurationFromLink({...blank,line1:'ALICE',line2:'3:20:15'},'?course=berlin&finish=bois').line2,'3:20:15');
assert.equal(configurationFromLink(blank,'?course=__proto__&finish=constructor').line1,'');
assert.equal(configurationFromLink(blank,'?course=constructor&finish=bad').finish,'noir');
assert(configurationError({...blank,line1:'   '}));
// A mobile user can progress without text, but cannot leave for checkout without
// a valid engraving, explicit review approval and a fresh submission.
const mobileFlow={isMobile:true,step:'finish'};
assert.equal(personalizationAction(blank,mobileFlow),'advance');
assert.equal(personalizationAction(blank,{...mobileFlow,step:'engraving'}),'invalid');
const completed={...blank,finish:'bois',line1:'ÉLODIE',line2:'3:42:18'};
assert.equal(personalizationAction(completed,{...mobileFlow,step:'engraving'}),'review');
assert.equal(personalizationAction(completed,{...mobileFlow,step:'engraving',reviewApproved:true}),'checkout');
assert.equal(personalizationAction(completed,{...mobileFlow,step:'engraving',reviewApproved:true,locked:true}),'blocked');
for(const isMobile of [false,true]) for(const step of ['finish','engraving']) {
  assert.notEqual(personalizationAction(blank,{isMobile,step,reviewApproved:true}),'checkout');
  assert.notEqual(personalizationAction(completed,{isMobile,step,reviewApproved:false}),'checkout');
  assert.equal(personalizationAction(completed,{isMobile,step,reviewApproved:true}),'checkout');
  assert.equal(personalizationAction(completed,{isMobile,step,reviewApproved:true,locked:true}),'blocked');
}

const ids = new Set();
for (const finish of FINISHES) for(const plate of PLATES) for(const font of FONTS) {
  const result=checkoutFields({...blank,finish:finish.id,plate:plate.id,font:font.id,line1:'Élodie & Marc',line2:''});
  ids.add(result['add-to-cart']); assert.equal(result.rs_line1,'Élodie & Marc'); assert.equal(result.rs_line2,'');
  assert.deepEqual(Object.keys(result).sort(),['add-to-cart','quantity','rs_line1','rs_line2'].sort());
}
assert.equal(ids.size,12);
for(const course of COURSES) { assert(COURSE_NAMES[course.id].length<=22); assert(course.idea.length<=22); }

const bundle=await build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {App} from './src/main.jsx';import {giftDocument} from './src/BuyingGuide.jsx';import ProductConfigurator from './src/ProductConfigurator.jsx';export const mobileForm=renderToStaticMarkup(React.createElement(ProductConfigurator,{isMobile:true}));export const html=renderToStaticMarkup(React.createElement(App));export {giftDocument};`,resolveDir:process.cwd()},bundle:true,jsx:'automatic',platform:'node',format:'cjs',write:false,loader:{'.css':'empty'},plugins:[{name:'server-check',setup(b){b.onLoad({filter:/\/main\.jsx$/},async ({path})=>({contents:(await readFile(path,'utf8')).replace("createRoot(document.getElementById('root')).render(<App />);",''),loader:'jsx'}))}}]});
const module={exports:{}};new Function('require','module','exports',bundle.outputFiles[0].text)(createRequire(import.meta.url),module,module.exports);
const {html,giftDocument,mobileForm}=module.exports;
assert(mobileForm.includes('data-guided="true"'));
assert(mobileForm.includes('class="pc-engraving-step" hidden=""'));
assert(mobileForm.includes('name="rs_line1"'));
assert(mobileForm.includes('name="rs_line2"'));
assert(mobileForm.includes('Ajouter ma gravure'));
assert(mobileForm.includes('enterKeyHint="next"'));
assert(mobileForm.includes('enterKeyHint="done"'));
assert(mobileForm.includes('Modifier le cadre'));
assert(mobileForm.includes('Modifier la gravure'));
const elementIds=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(elementIds.length,new Set(elementIds).size,'Duplicate HTML IDs');
for(const match of html.matchAll(/href="#([^"]+)"/g)) assert(elementIds.includes(match[1]),'Broken anchor: '+match[1]);
for(const match of html.matchAll(/(?:src|poster)="(\/assets\/[^"?]+)"/g)) await access('public'+match[1]);
assert.equal((html.match(/class="buy-gallery-cta"/g)||[]).length,10);
assert(html.includes('method="post"')); assert(html.includes('https://runspark.digital-solutions.io/commander/'));
assert(!html.includes('2 000+')); assert(!html.includes('4,9'));
const gift=giftDocument('<script>alert("x")</script> & Félicitations');
assert(!gift.includes('<script>')); assert(gift.includes('&lt;script&gt;')); assert(gift.includes('&amp; Félicitations'));
await writeFile('/workspace/scratch/8317018a076a/runspark-ssr-check.html',html);

globalThis.window={matchMedia:()=>({matches:true}),dataLayer:[],dispatchEvent:()=>{}};
trackCommerce('begin_checkout',{finish:'noir',line1:'PRIVATE',email:'private@example.com',message:'SECRET'});
assert.deepEqual(window.dataLayer[0],{event:'runspark_begin_checkout',device:'mobile',finish:'noir',currency:'CHF',value:89.9});
trackCommerce('unknown',{line1:'PRIVATE'});assert.equal(window.dataLayer.length,1);delete globalThis.window;

const titles=new Set();
for(const course of COURSES) {
  const page=await readFile(`dist/courses/${course.id}/index.html`,'utf8');
  assert(page.includes('noindex, nofollow')); assert(page.includes('application/ld+json'));
  assert(page.includes('/?course='+course.id+'&amp;finish='+course.finish+'#config'));
  const title=page.match(/<title>(.*?)<\/title>/)[1];assert(!titles.has(title));titles.add(title);
  for(const match of page.matchAll(/(?:src|href)="(\/[^"?#]+)(?:[?#][^"]*)?"/g)) {
    const url=match[1]; await access('dist'+(url.endsWith('/')?url+'index.html':url));
  }
}
assert.equal((await readdir('dist/courses')).length,13);
assert((await readFile('dist/robots.txt','utf8')).includes('Disallow: /'));
console.log('PASS: mobile steps, checkout approval/validation/duplicate guards, 12 variants, safe link presets, 10 inspiration CTAs, native checkout fields, React render, IDs/anchors/assets, private engraving, escaped gift card, 12 complete course pages.');
