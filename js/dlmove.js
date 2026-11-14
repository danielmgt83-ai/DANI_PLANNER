"use strict";
/* DANI · dlmove.js — «موعدها (افزودن و فهرست، هشدارها، دسته‌های سفارشی)» از تب تقویمِ برنامه به صفحه‌ی «پروژه‌ها» آمد (یک مرجع برای موعدها).
   همان PG.dl (صفحه‌ی موعدها) بی‌تغییر داخل یک بخش جمع‌شونده‌ی #dlmv نشان داده می‌شود؛ هیچ قابلیتی حذف نمی‌شود. بعد از projects.js و dlcard.js بارگذاری شود. */
(function(){
const T=window.daniT;
const _pj=PG.pj;if(typeof _pj!=='function'||typeof PG.dl!=='function')return;
PG.pj=function(){let h=_pj.apply(this,arguments);if(typeof h!=='string')return h;
  let d='';try{d=String(PG.dl()).replace(/<div class="row cmbar"[^>]*>.*?<\/div>/,'')}catch(e){console.error('dlmove',e);return h}
  /* v117: «موعدها و هدف‌های بدون پروژه» (projects.js) هم داخل همین بخش می‌آید تا موعد دو جا نباشد */
  let wo='',cnt='';{const re=/<details class="c" style="margin-top:10px"><summary[^>]*><b>⏳[^<]*<\/b> <span class="m">· ([^<]*)<\/span><\/summary>([\s\S]*?)<\/details>/g;let x;
    while((x=re.exec(h))){if(/pj_from(dl|gl)/.test(x[2])){cnt=x[1];h=h.slice(0,x.index)+h.slice(x.index+x[0].length);wo='<div class="c"><h3>'+daniH('🧩','موعدها و هدف‌های بدون پروژه','Deadlines & goals without a project')+' <span class="m">· '+cnt+'</span></h3>'+x[2]+'</div>';break}}}
  return h+'<details class="c" id="dlmv"><summary style="cursor:pointer">'+daniH('⏳','موعدها (افزودن، فهرست، هشدارها، دسته‌ها، تنظیمات)','Deadlines (add, list, alerts, categories, settings)')+(cnt?' <span class="m">· '+cnt+'</span>':'')+'</summary>'+wo+d+'</details>'};
})();
