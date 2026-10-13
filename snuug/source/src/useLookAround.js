import {useCallback,useEffect,useRef,useState} from 'react';
import {useMotionValue,useSpring} from 'framer-motion';
import {clamp} from './immersion-model';
import {startOrientationSession} from './orientation-session';

export default function useLookAround(viewRef,reduced) {
  const rawX=useMotionValue(0),rawY=useMotionValue(0);
  const x=useSpring(rawX,{stiffness:110,damping:28,mass:.55});
  const y=useSpring(rawY,{stiffness:110,damping:28,mass:.55});
  const [mobile,setMobile]=useState(false),[status,setStatus]=useState('off');
  const [wanted,setWanted]=useState(false),[visible,setVisible]=useState(true),[onScreen,setOnScreen]=useState(true);
  const [message,setMessage]=useState('');
  const session=useRef(null),pointer=useRef(null),request=useRef(0);
  const center=useCallback(()=>{session.current?.recenter();rawX.set(0);rawY.set(0)},[rawX,rawY]);
  const stop=useCallback(()=>{request.current++;session.current?.stop();session.current=null;setWanted(false);setStatus('off');setMessage('');center()},[center]);
  useEffect(()=>{
    const query=window.matchMedia('(pointer: coarse)');
    const update=()=>setMobile(query.matches||navigator.maxTouchPoints>0);
    const visibility=()=>{setVisible(!document.hidden);center()};
    update();visibility();query.addEventListener('change',update);document.addEventListener('visibilitychange',visibility);
    const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(([entry])=>setOnScreen(entry.isIntersecting)):null;
    if(viewRef.current)observer?.observe(viewRef.current);
    return()=>{request.current++;query.removeEventListener('change',update);document.removeEventListener('visibilitychange',visibility);observer?.disconnect()};
  },[center,viewRef]);
  useEffect(()=>{if(reduced)stop()},[reduced,stop]);
  useEffect(()=>{
    if(!wanted||reduced||!visible||!onScreen){center();return}
    setStatus('waiting');setMessage('Gardez le téléphone face à vous…');
    const current=startOrientationSession({target:window,
      onMove:look=>{rawX.set(look.x);rawY.set(look.y)},
      onReady:()=>{setStatus('active');setMessage('Inclinez doucement pour regarder autour de vous.')},
      onUnavailable:()=>{setWanted(false);setStatus('fallback');setMessage('Capteur indisponible. Glissez horizontalement sur la photo.')}
    });
    session.current=current;
    return()=>{current.stop();if(session.current===current)session.current=null};
  },[wanted,reduced,visible,onScreen,center,rawX,rawY]);
  useEffect(()=>{
    if(!message||status==='waiting')return;
    const timer=window.setTimeout(()=>setMessage(''),6500);
    return()=>window.clearTimeout(timer);
  },[message,status]);
  const enable=async()=>{
    if(reduced)return;
    const id=++request.current;
    if(!window.isSecureContext||!window.DeviceOrientationEvent){setStatus('fallback');setMessage('Glissez horizontalement sur la photo pour explorer.');return}
    try{
      // iOS requires this call in the original user-activation stack, before any await.
      const permission=typeof window.DeviceOrientationEvent.requestPermission==='function'
        ?window.DeviceOrientationEvent.requestPermission():Promise.resolve('granted');
      setStatus('asking');
      const result=await permission;
      if(id!==request.current)return;
      if(result!=='granted'){setStatus('fallback');setMessage('Inclinaison non autorisée. Vous pouvez glisser sur la photo.');return}
      center();setWanted(true);
    }catch{
      if(id!==request.current)return;
      setStatus('fallback');setMessage('Inclinaison indisponible. Vous pouvez glisser sur la photo.');
    }
  };
  const handlers={
    onPointerDown:event=>{
      if(reduced||wanted||event.pointerType==='mouse')return;
      pointer.current={id:event.pointerId,x:event.clientX,y:event.clientY,origin:rawX.get(),dragging:false};
    },
    onPointerMove:event=>{
      if(reduced||wanted)return;
      const bounds=event.currentTarget.getBoundingClientRect();
      if(event.pointerType==='mouse'){
        rawX.set(clamp((event.clientX-bounds.left)/bounds.width*2-1,-1,1)*.8);
        rawY.set(clamp((event.clientY-bounds.top)/bounds.height*2-1,-1,1)*.65);return;
      }
      const p=pointer.current;if(!p||p.id!==event.pointerId)return;
      const dx=event.clientX-p.x,dy=event.clientY-p.y;
      if(!p.dragging&&Math.abs(dx)>9&&Math.abs(dx)>Math.abs(dy)*1.3){p.dragging=true;event.currentTarget.setPointerCapture?.(event.pointerId)}
      if(p.dragging)rawX.set(clamp(p.origin-dx/bounds.width*2,-1,1));
    },
    onPointerUp:()=>{pointer.current=null},onPointerCancel:()=>{pointer.current=null},
    onPointerLeave:event=>{if(event.pointerType==='mouse'&&!wanted)center()},
    onKeyDown:event=>{
      if(reduced||wanted)return;
      if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();rawX.set(clamp(rawX.get()+(event.key==='ArrowRight'?.2:-.2),-1,1))}
      if(event.key==='Home'){event.preventDefault();center()}
    }
  };
  return {x,y,mobile,status,wanted,message,enable,stop,center,handlers};
}
