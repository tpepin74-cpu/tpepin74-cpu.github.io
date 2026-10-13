import {useSyncExternalStore} from 'react';
const key='snuug-favourite-neuchatel';
let fallback=false;
const snapshot=()=>{try{return localStorage.getItem(key)==='1'}catch{return fallback}};
function subscribe(listener){
 const storage=e=>{if(e.key===key||e.key===null)listener()};
 window.addEventListener('storage',storage);window.addEventListener('snuug:saved',listener);
 return()=>{window.removeEventListener('storage',storage);window.removeEventListener('snuug:saved',listener)};
}
export function useSaved(){
 const saved=useSyncExternalStore(subscribe,snapshot,()=>false);
 const toggle=()=>{fallback=!snapshot();try{localStorage.setItem(key,fallback?'1':'0')}catch{}window.dispatchEvent(new Event('snuug:saved'))};
 return [saved,toggle];
}
