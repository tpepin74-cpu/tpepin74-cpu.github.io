const menus='.page-sections,.product-chapters,.stay-section-nav';
export function anchorOffset(target){
 const header=document.querySelector('.site-header');
 let bottom=header?.getBoundingClientRect().height||0;
 for(const nav of document.querySelectorAll(menus)){
  const style=getComputedStyle(nav);
  if(!['sticky','fixed'].includes(style.position)||!nav.getClientRects().length)continue;
  if(target&&!(nav.compareDocumentPosition(target)&Node.DOCUMENT_POSITION_FOLLOWING))continue;
  bottom=Math.max(bottom,(parseFloat(style.top)||0)+nav.getBoundingClientRect().height);
 }
 return bottom+20;
}
export function scrollToAnchor(target,behavior='instant'){
 const top=target.getBoundingClientRect().top+window.scrollY-anchorOffset(target);
 window.scrollTo({top:Math.max(0,top),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':behavior});
}
