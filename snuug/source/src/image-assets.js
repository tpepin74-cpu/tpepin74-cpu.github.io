// Resolve every photograph through Vite so the published build owns its exact asset URL.
const files=import.meta.glob('./assets/images/**/*.{webp,png,svg,jpg,jpeg}',{eager:true,query:'?url',import:'default'});
const images=Object.fromEntries(Object.entries(files).map(([path,url])=>[path.replace('./assets',''),url]));
export function imageAsset(src){return images[src]||src}
export function imageSet(srcSet){return srcSet?.split(',').map(part=>{const [src,...size]=part.trim().split(/\s+/);return [imageAsset(src),...size].join(' ')}).join(', ')}
