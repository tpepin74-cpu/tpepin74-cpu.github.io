import { execFileSync } from 'node:child_process';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
process.chdir(root);
execFileSync(process.execPath, ['scripts/build.mjs'], { stdio: 'inherit' });
const base = '/runspark/';
async function adapt(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { await adapt(file); continue; }
    if (!/\.(html|css|js)$/.test(entry.name)) continue;
    let content = await readFile(file, 'utf8');
    content = content.replaceAll('/assets/', `${base}assets/`).replaceAll('/courses/', `${base}courses/`);
    for (const quote of ['"', "'", '`']) {
      content = content.replaceAll(`${quote}/?`, `${quote}${base}?`).replaceAll(`${quote}/#`, `${quote}${base}#`);
    }
    if (entry.name.endsWith('.html')) content = content.replaceAll('href="/"', `href="${base}"`);
    await writeFile(file, content);
  }
}
await adapt('dist');
console.log('GitHub Pages build ready in source/dist/ for /runspark/.');
