import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {App} from './main';
import {routes} from './routes';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const pages=Object.fromEntries(Object.keys(routes).map(route=>[route,renderToStaticMarkup(<App pathname={route} search=""/>)]));
for(const route of Object.keys(routes)) {
 const html=pages[route];
 assert.equal((html.match(/<h1\b/g)||[]).length,1,route);
 for(const [,href] of html.matchAll(/\bhref="(\/[^"]*)"/g)) {
  const pathname=new URL(href,'https://tpepin74-cpu.github.io').pathname.replace(/\/$/,'');
  assert.ok(routes[pathname]||(pathname.startsWith("/snuug/")&&fs.existsSync("dist/"+pathname.slice(7))),route+': invalid navigation '+href);
 }
 for(const [,href] of html.matchAll(/\bhref="([^"]*#[^"]*)"/g)) {
  const u=new URL(href.replaceAll('&amp;','&'),'https://tpepin74-cpu.github.io'+route+'/');
  if(u.origin!=='https://tpepin74-cpu.github.io')continue;
  const target=u.pathname.replace(/\/$/,'');
  if(pages[target])assert.ok(pages[target].includes('id="'+decodeURIComponent(u.hash.slice(1))+'"'),route+': missing anchor '+href);
 }
 for(const [,src] of html.matchAll(/\bsrc="(\/[^"]*)"/g)) {
  assert.ok(src.startsWith('/snuug/'),route+': unscoped image '+src);
  assert.ok(fs.existsSync('dist/'+src.slice('/snuug/'.length)),route+': missing image '+src);
 }
 console.log('Verified',route);
}
