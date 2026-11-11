"use strict";
/* DANI · dlmove.js — «موعدها (افزودن و فهرست، هشدارها، دسته‌های سفارشی)» از تب تقویمِ برنامه به صفحه‌ی «پروژه‌ها» آمد (یک مرجع برای موعدها).
   همان PG.dl (صفحه‌ی موعدها) بی‌تغییر داخل یک بخش جمع‌شونده‌ی #dlmv نشان داده می‌شود؛ هیچ قابلیتی حذف نمی‌شود. بعد از projects.js و dlcard.js بارگذاری شود. */
(function(){
const T=window.daniT;
const _pj=PG.pj;if(typeof _pj!=='function'||typeof PG.dl!=='function')return;
PG.pj=function(){const h=_pj.apply(this,arguments);if(typeof h!=='string')return h;
  let d='';try{d=String(PG.dl()).replace(/<div class="row cmbar"[^>]*>.*?<\/div>/,'')}catch(e){console.error('dlmove',e);return h}
  return h+'<details class="c" id="dlmv"><summary style="cursor:pointer">'+daniH('⏳','موعدها (افزودن، فهرست، هشدارها، دسته‌ها)','Deadlines (add, list, alerts, categories)')+'</summary>'+d+'</details>'};
})();
