import {orientationLook} from './immersion-model.js';

// A short-lived, local-only listener. Permission is requested separately, from a tap.
export function startOrientationSession({target,onMove,onReady,onUnavailable,timeout=3500}) {
  let origin=null,alive=true,received=false;
  const recenter=()=>{origin=null;onMove({x:0,y:0})};
  const read=event=>{
    if(!alive||!Number.isFinite(event.beta)||!Number.isFinite(event.gamma))return;
    if(!received){received=true;target.clearTimeout(timer);onReady()}
    const angle=target.screen?.orientation?.angle ?? target.orientation ?? 0;
    if(!origin)origin={beta:event.beta,gamma:event.gamma};
    const look=orientationLook(event,origin,angle);
    if(look)onMove(look);
  };
  const stop=()=>{
    alive=false;target.clearTimeout(timer);
    target.removeEventListener('deviceorientation',read);
    target.removeEventListener('orientationchange',recenter);
    target.screen?.orientation?.removeEventListener('change',recenter);
  };
  const timer=target.setTimeout(()=>{if(!received){stop();onUnavailable()}},timeout);
  target.addEventListener('deviceorientation',read,{passive:true});
  target.addEventListener('orientationchange',recenter);
  target.screen?.orientation?.addEventListener('change',recenter);
  return {stop,recenter};
}
