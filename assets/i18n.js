/* Explicit language choice; no forced redirect or additional tracking. */
(()=>{'use strict';
 const languages=['fr','en','de','es','it','ja','zh','ru'];
 const dict=window.CASTEL_TRANSLATIONS||{};
 window.castelT=value=>typeof value==='string'?(dict[value]||value):value;
 function destination(lang){
  const path=location.pathname.replace(/^\/(?:en|de|es|it|ja|zh|ru)(?=\/)/,'');
  const page=path==='/'?'/index.html':path;
  return (lang==='fr'?(page==='/index.html'?'/':page):'/'+lang+page)+location.search+location.hash;
 }
 addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('[data-language-select]').forEach(select=>select.addEventListener('change',()=>{
   if(languages.includes(select.value))location.assign(destination(select.value));
  }));
  document.querySelectorAll('[data-language-link]').forEach(link=>{
   link.href=destination(link.dataset.languageLink);
  });
 });
})();
