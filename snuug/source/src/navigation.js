import {routes} from './routes';
export function navigatePage(href){
 const url=new URL(href,window.location.href);
 const path=url.pathname.replace(/\/$/,'')||'/snuug';
 if(url.origin!==window.location.origin||!routes[path]){window.location.assign(href);return}
 if(path===location.pathname.replace(/\/$/,'')&&url.search===location.search){window.scrollTo({top:0,behavior:'instant'});return}
 history.replaceState({...history.state,snuugScroll:window.scrollY},'',location.href);
 history.pushState({snuugScroll:0},'',url.pathname+url.search+url.hash);
 window.dispatchEvent(new Event('snuug:navigate'));
}
