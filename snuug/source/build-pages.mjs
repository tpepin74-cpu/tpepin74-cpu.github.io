import fs from 'node:fs/promises';
import {routes,redirects} from './src/routes.js';
const origin='https://tpepin74-cpu.github.io';
const template=await fs.readFile('dist/index.html','utf8');
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
for(const [route,[title,description]] of Object.entries(routes)){
 const local=route.slice('/snuug'.length);
 const folder='dist'+local;await fs.mkdir(folder,{recursive:true});
 const html=template.replace(/<title>.*?<\/title>/,`<title>${escape(title)}</title>`).replace(/(<meta name="description" content=")[^"]*/,`$1${escape(description)}`).replace(/(<meta property="og:title" content=")[^"]*/,`$1${escape(title)}`).replace(/(<meta property="og:url" content=")[^"]*/,`$1${origin+route}/`).replace('</head>',`<link rel="canonical" href="${origin+route}/"/></head>`);
 await fs.writeFile(folder+'/index.html',html);
}
for(const [from,to] of Object.entries(redirects)){
 const folder='dist'+from.slice('/snuug'.length);await fs.mkdir(folder,{recursive:true});
 const [page,anchor]=to.split('#');
 await fs.writeFile(folder+'/index.html',`<!doctype html><html lang="fr"><meta charset="utf-8"><title>SNUUG</title><meta name="robots" content="noindex"><script>location.replace(${JSON.stringify(page)}+location.search+(location.hash||${JSON.stringify(anchor?'#'+anchor:'')}))</script><a href="${escape(to)}">Continuer vers SNUUG</a></html>`);
}
await fs.writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.keys(routes).map(route=>`<url><loc>${origin}${route}/</loc></url>`).join('')}</urlset>`);
await fs.writeFile('dist/.nojekyll','');
console.log('9 pages and 16 redirects generated under /snuug/.');
