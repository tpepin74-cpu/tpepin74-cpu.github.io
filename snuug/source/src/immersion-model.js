export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const old = (number, name, alt, zoom = 1.09) => ({path:`snuug-v2-${number}`,name,alt,zoom});
const added = (key, name, alt, zoom = 1.07) => ({path:`snuug-v3-${key}`,name,alt,zoom});
export const HERO_SHOTS = [
  old(1,'L’approche','Le SNUUG dans la nature, face à son entrée ouverte',1.22),
  added('approach','Vers la terrasse','La façade en bois et la terrasse, vues depuis le jardin',1.16),
  old(2,'La terrasse','La terrasse abritée et l’entrée de la suite',1.12),
  added('threshold','Le seuil','Le passage de la terrasse au salon, avec le lit au fond'),
  old(3,'Le salon','La méridienne et son pouf, le lit à droite et le poêle à gauche'),
  added('turn-bedroom','Vers la chambre','La méridienne à gauche et le lit pour deux à droite'),
  old(4,'Le lit','Le lit pour deux, le salon et la grande baie vitrée'),
  added('turn-window','La lumière','La baie vitrée et la terrasse depuis le coin chambre'),
  old(5,'Le poêle','Le salon face au poêle, avec le meuble café et la salle d’eau au fond',1.12),
  added('approach-stove','Le coin café','Le poêle et le meuble café en approchant du fond de la suite'),
  old(6,'Le minibar','Le poêle, la machine à café et la cave à boissons ouverte'),
  added('bath-doorway','Vers la salle d’eau','La vasque et son miroir depuis le seuil de la salle d’eau'),
  old(7,'La salle d’eau','La vasque et le miroir, les soins, la douche et les WC',1.04),
  added('return-lounge','Retour au salon','Le salon, la chambre et la baie vitrée depuis la salle d’eau'),
  old(8,'La vue','Le lit, la méridienne et la baie vitrée ouverte sur la terrasse et la nature'),
  added('toward-terrace','À nouveau dehors','La terrasse et le paysage depuis l’intérieur de la suite')
];
export const CHAPTERS = HERO_SHOTS.flatMap((shot, index) => index % 2 ? [] : [{name:shot.name,index}]);
export const framePosition = progress => clamp(progress) * (HERO_SHOTS.length - 1);
export const activeShot = progress => Math.round(framePosition(progress));
export function shotScale(index, progress) {
  const local = clamp((framePosition(progress) - index + 1) / 2);
  return 1.075 * Math.pow(HERO_SHOTS[index].zoom, local);
}
export function blendAt(index, progress) {
  const t = clamp(framePosition(progress) - index + 1);
  return t * t * (3 - 2 * t);
}
// Only decoded images can replace the current image. A failed request never blanks the visit.
export function visibleFrames(segment, ready, previous = 0) {
  const pair = [segment, Math.min(segment + 1, HERO_SHOTS.length - 1)];
  const available = [...new Set(pair.filter(index => ready.has(index)))];
  if (available.length) return available;
  if (ready.has(previous)) return [previous];
  const nearest = [...ready].sort((a,b) => Math.abs(a-segment)-Math.abs(b-segment))[0];
  return nearest === undefined ? [] : [nearest];
}
export function coverGeometry(width, height, aspect, scale, lookX, lookY) {
  const imageWidth = Math.max(width, height * aspect);
  const imageHeight = imageWidth / aspect;
  // Leave a margin beyond the maximum pan, including the small perspective rotation.
  return {width:imageWidth,height:imageHeight,
    x:-clamp(lookX,-1,1) * Math.max(0,(imageWidth*scale-width)/2) * .82,
    y:-clamp(lookY,-1,1) * Math.max(0,(imageHeight*scale-height)/2) * .82};
}
const angularDelta = (value, origin) => ((value-origin+540)%360)-180;
export function orientationLook(reading, origin, angle = 0) {
  if (![reading.beta,reading.gamma,origin.beta,origin.gamma,angle].every(Number.isFinite)) return null;
  const beta=angularDelta(reading.beta,origin.beta),gamma=angularDelta(reading.gamma,origin.gamma);
  const radians=angle*Math.PI/180;
  return {x:clamp((gamma*Math.cos(radians)+beta*Math.sin(radians))/24,-1,1),
    y:clamp((beta*Math.cos(radians)-gamma*Math.sin(radians))/20,-1,1)};
}
