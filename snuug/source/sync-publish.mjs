import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const source=path.dirname(fileURLToPath(import.meta.url));
const dist=path.join(source,'dist');
const target=path.dirname(source);
// Only generated SNUUG media directories are replaced; keep the live agenda.
for(const name of ['assets','images'])await fs.rm(path.join(target,name),{recursive:true,force:true});
async function copy(from,to){
 await fs.mkdir(to,{recursive:true});
 for(const item of await fs.readdir(from,{withFileTypes:true})){
  if(item.name==='agenda.json')continue;
  const a=path.join(from,item.name),b=path.join(to,item.name);
  if(item.isDirectory())await copy(a,b);else await fs.copyFile(a,b);
 }
}
await copy(dist,target);
console.log('SNUUG publication prepared without stale bundles or duplicate media.');
