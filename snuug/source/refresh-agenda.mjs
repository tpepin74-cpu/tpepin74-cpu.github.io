import fs from 'node:fs/promises';
import {importAgenda,upcoming} from './lib/agenda.mjs';
const destination=new URL('../agenda.json',import.meta.url);
try {
 const data=await importAgenda();
 data.events=upcoming(data.events);
 await fs.writeFile(destination,JSON.stringify({...data,stale:false},null,2)+'\n');
 console.log(`Agenda refreshed: ${data.events.length} upcoming events.`);
} catch(error) {
 console.error('Source unavailable, preserving previous agenda:',error.message);
 process.exitCode=1;
}
