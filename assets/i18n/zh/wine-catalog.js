/* All wines are native HTML. Filtering is a progressive enhancement. */
(()=>{'use strict';
 const form=document.getElementById('wine-filters');if(!form)return;
 const query=form.elements.query,region=form.elements.region;
 const groups=[...document.querySelectorAll('[data-wine-group]')];
 const allRows=groups.flatMap(g=>[...g.querySelectorAll('[data-wine-row]')]);
 const initial=new Map(groups.map(g=>[g,g.open]));
 const normalize=s=>s.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’‘]/g,"'");
 const texts=new Map(allRows.map(row=>[row,normalize(row.textContent)]));
 const headings=new Map(groups.map(g=>[g,normalize(g.querySelector('summary').textContent)]));
 const count=document.getElementById('wine-count'),empty=document.getElementById('wine-empty');
 function filter(){
  const terms=normalize(query.value.trim()).split(/\s+/).filter(Boolean),selected=region.value;
  let visible=0;
  groups.forEach(group=>{
   const area=group.dataset.wineRegion;
   const rows=[...group.querySelectorAll('[data-wine-row]')];let groupVisible=0;
   rows.forEach(row=>{const regional=!selected||selected===area||selected===row.dataset.wineFormat;const hay=texts.get(row)+' '+headings.get(group);const match=regional&&terms.every(term=>hay.includes(term));row.hidden=!match;if(match){visible++;groupVisible++;}});
   group.hidden=!groupVisible;
   group.querySelector('[data-group-visible]').textContent=String(groupVisible);
   if(terms.length)group.open=groupVisible>0;
   else if(!selected)group.open=initial.get(group);
  });
  count.textContent=String(visible);empty.hidden=visible!==0;
 }
 form.addEventListener('submit',e=>e.preventDefault());
 form.addEventListener('input',filter);
 form.addEventListener('change',filter);
 form.addEventListener('reset',()=>setTimeout(filter,0));
 document.getElementById('wine-open-all').addEventListener('click',()=>groups.forEach(g=>{if(!g.hidden)g.open=true;}));
 document.getElementById('wine-close-all').addEventListener('click',()=>groups.forEach(g=>{g.open=false;}));
 filter();
})();
