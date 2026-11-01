"use strict";
/* DANI · datefield.js — کادر تاریخ هماهنگ با «تقویم» در تنظیمات (قانون: هر تاریخی که کاربر می‌بیند یا وارد می‌کند فقط همان تقویم باشد).
   شمسی ← سه لیست روز/ماه/سال؛ میلادی ← کادر تاریخ مرورگر. مقدار همیشه به‌صورت ISO «YYYY-MM-DD» (میلادی) ذخیره می‌شود.
   استفاده: window.daniDF.html(id, iso, {empty:true}) و window.daniDF.get(id) ← iso یا ''. هر ورودی تاریخ جدید باید از همین استفاده کند. */
(function(){
const T=window.daniT;
const greg=()=>db.set&&db.set.cal==='g';
const dim=(y,m)=>m<=6?31:m<=11?30:(typeof isLeap==='function'&&isLeap(y)?30:29);
window.daniDF={
 html(id,iso,o){o=o||{};if(greg())return'<input id="'+id+'" type="date" value="'+(iso||'')+'" style="width:100%">';
  let y=0,m=0,d=0;if(iso){try{[y,m,d]=J(iso)}catch(e){}}const cy=J(todayISO())[0],y0=Math.min(cy-2,y||cy),y1=Math.max(cy+10,y||cy);
  const sel=(k,list,cur,ph)=>'<select id="'+id+'-'+k+'" style="flex:1;min-width:0"><option value="">'+ph+'</option>'+list.map(x=>'<option value="'+x[0]+'"'+(x[0]===cur?' selected':'')+'>'+x[1]+'</option>').join('')+'</select>';
  const days=[],mons=[],yrs=[];for(let i=1;i<=31;i++)days.push([i,fa(i)]);for(let i=1;i<=12;i++)mons.push([i,JM[i-1]]);for(let i=y0;i<=y1;i++)yrs.push([i,fa(i)]);
  return'<div id="'+id+'" class="row" style="gap:4px;flex-wrap:nowrap">'+sel('d',days,d,T('روز','Day'))+sel('m',mons,m,T('ماه','Month'))+sel('y',yrs,y,T('سال','Year'))+'</div>'},
 get(id){if(greg()){const el=document.getElementById(id);return el&&/^\d{4}-\d\d-\d\d$/.test(el.value)?el.value:''}
  const g=k=>{const el=document.getElementById(id+'-'+k);return el?+el.value:0},y=g('y'),m=g('m');let d=g('d');if(!y||!m||!d)return'';d=Math.min(d,dim(y,m));
  try{const a=j2g(y,m,d);return iso(new Date(a[0],a[1]-1,a[2],12))}catch(e){return''}}};
})();
