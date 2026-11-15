/* Castel Damandre — fin de l'ouverture : clic, toucher ou touche pour passer, puis retrait du rideau. */
(()=>{'use strict';
 const d=document.documentElement,el=document.querySelector('.cd-intro');
 if(!el)return;
 if(!d.classList.contains('cd-intro-on')){el.remove();return;}
 let done=false;
 const leave=()=>{if(done)return;done=true;d.classList.add('cd-intro-leave');setTimeout(()=>el.remove(),500);};
 el.addEventListener('animationend',e=>{if(e.target===el)setTimeout(()=>el.remove(),50);});
 el.addEventListener('pointerdown',leave,{once:true});
 addEventListener('keydown',leave,{once:true});
 addEventListener('wheel',leave,{once:true,passive:true});
 addEventListener('touchmove',leave,{once:true,passive:true});
})();
