import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {App} from './main';
import {routes} from './routes';
import fs from 'node:fs';
import assert from 'node:assert/strict';
for(const route of Object.keys(routes)) {
 const html=renderToStaticMarkup(<App pathname={route} search=""/>);
 assert.equal((html.match(/<h1\b/g)||[]).length,1,route);
 for(const [,href] of html.matchAll(/\bhref="(\/[^"]*)"/g)) {
  const pathname=new URL(href,'https://tpepin74-cpu.github.io').pathname.replace(/\/$/,'');
  assert.ok(routes[pathname]||(pathname.startsWith("/snuug/")&&fs.existsSync("dist/"+pathname.slice(7))),route+': invalid navigation '+href);
 }
 for(const [,src] of html.matchAll(/\bsrc="(\/[^"]*)"/g)) {
  assert.ok(src.startsWith('/snuug/'),route+': unscoped image '+src);
  assert.ok(fs.existsSync('dist/'+src.slice('/snuug/'.length)),route+': missing image '+src);
 }
 console.log('Verified',route);
}
