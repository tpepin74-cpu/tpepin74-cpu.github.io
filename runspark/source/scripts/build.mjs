import { build } from 'esbuild';
import { cp, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { buildCourses } from './build-courses.mjs';

const settings = JSON.parse(await readFile('site-settings.json', 'utf8'));
if (settings.publicLaunch) {
  const origin = new URL(settings.canonicalOrigin);
  if (origin.protocol !== 'https:' || origin.origin !== settings.canonicalOrigin || origin.username || origin.password) throw new Error('A verified HTTPS canonical origin is required for public launch.');
}

await rm('dist', {recursive:true, force:true});
await mkdir('dist/assets', {recursive:true});
await cp('public/assets', 'dist/assets', {recursive:true});
const result = await build({
  entryPoints:['src/main.jsx'],
  bundle:true,
  outdir:'dist/assets',
  entryNames:'app-[hash]',
  minify:true,
  sourcemap:false,
  format:'esm',
  external:['/assets/*'],
  jsx:'automatic',
  target:['es2020'],
  define:{'process.env.NODE_ENV':'"production"'},
  legalComments:'eof',
  metafile:true,
  logLevel:'info',
});

const [jsPath, jsOutput] = Object.entries(result.metafile.outputs).find(
  ([path, output]) => path.endsWith('.js') && output.entryPoint?.endsWith('src/main.jsx'),
);
if (!jsPath || !jsOutput.cssBundle) throw new Error('Missing application output.');
let html = (await readFile('index.html', 'utf8'))
  .replace('/assets/app.js', jsPath.replace(/^dist\//, '/'))
  .replace('/assets/app.css', jsOutput.cssBundle.replace(/^dist\//, '/'));
if (settings.publicLaunch) html = html.replace('noindex, nofollow', 'index, follow').replace('</head>', `<link rel="canonical" href="${settings.canonicalOrigin}/"></head>`);
await writeFile('dist/index.html', html);
await buildCourses(settings);

console.log('Static scene built successfully.');
