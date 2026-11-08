"use strict";
/* DANI · groups.js — «گروه‌بندی کارت‌های هم‌هدف»: کارت‌هایی که یک کار را می‌کنند (چند جای پشتیبان‌گیری، چند جای افزودن کار، چند جای تم و اعلان…)
   زیر یک عنوان روشن و تاشو جمع می‌شوند. هیچ کارتی حذف نمی‌شود؛ فقط کنار هم می‌آیند. کارت تکراریِ دقیق (مثل «پشتیبان کامل» که دو بار می‌آمد) یک بار نشان داده می‌شود.
   کار روی خروجی متنیِ setPage (تنظیمات) و PX.plan (میزکار ← برنامه) قبل از ترجمه انجام می‌شود، پس در fa/en/bi یکسان کار می‌کند.
   خاموش/روشن: db.set.gp {off:1, open:{کلید:1}} — دکمه‌ی «گروه‌بندی» بالای هر تب تنظیمات. */
(function(){
const T=window.daniT;
const GP=()=>{const s=db.set;if(!s.gp||typeof s.gp!=='object')s.gp={};if(!s.gp.open||typeof s.gp.open!=='object')s.gp.open={};return s.gp};
/* match: زیررشته‌ی عنوان (h3/summary) یا شناسه‌ی کارت */
const DEF={
 look:[{k:'lk-theme',i:'🎨',t:['ظاهر و تم','Look & themes'],m:['پوسته','بسته‌های تم','استودیوی تم','ظاهر','حس برنامه','skincard','pkcard','studiocard','fxcard'],open:1},
  {k:'lk-lang',i:'🌐',t:['زبان و تاریخ','Language & calendar'],m:['Language','زبان و تاریخ','langcard']},
  {k:'lk-home',i:'🏠',t:['خانه، منو و نوارها','Home, menu & bars'],m:['سبک خانه','نوار ابزار سریع','جمع‌وجور','شکل منو','نوار تم بالای','«ثبت» یکپارچه','بخش‌ها (ماژول‌ها)','modcard','cmcard','nvcard','bdcard','lgcard']}],
 time:[{k:'tm-note',i:'🔔',t:['اعلان‌ها و صدا','Notifications & sound'],m:['زمان و اعلان','صدای هشدار','اعلان مرورگر','اعلان‌ها و صدا','اعلان و زنگ','سکوت','سلامت اعلان','اعلان‌های گروهی','ntcard','ntgrp','qhcard','nthealth','nhcard'],open:1},
  {k:'tm-sync',i:'🔄',t:['همگام‌سازی، ویجت و راهنما','Sync, widget & help'],m:['همگام‌سازی','دکمه‌ی راهنما','devcard','lscard','hfcard']},
  {k:'tm-exam',i:'🎓',t:['حالت امتحان','Exam mode'],m:['حالت امتحان','excard']}],
 data:[{k:'dt-bk',i:'💾',t:['بازیافت و ورود داده','Recycle bin & import'],m:['داده‌ها و پشتیبان','ارسال پشتیبان','مرکز DANI','نسخه‌های خودکار','پشتیبان کامل','راستی‌آزمایی','سطل بازیافت','ورود CSV','abcard','bincard','csvcard','crs-set','crs-allcard'],open:1},
  {k:'dt-sec',i:'🔒',t:['امنیت','Security'],m:['قفل برنامه','lkcard']},
  {k:'dt-adv',i:'🧰',t:['پیشرفته','Advanced'],m:['گزارش خطا','افزونه‌ها','errcard','extcard']}],
 plan:[{k:'pl-add',i:'＋',t:['افزودن کار به برنامه','Add to plan'],m:['افزودن سریع با یک جمله','افزودن به برنامه','qncard'],open:1,first:1},
  {k:'pl-tools',i:'🧩',t:['قالب‌ها، تکرار و مناسبت‌ها','Templates, repeats & occasions'],m:['قالب‌های روز و هفته','کارهای تکرارشونده','مناسبت‌ها و تعطیلات','tpcard','ocdet']}]};
function group(html,tab){const defs=DEF[tab];if(!defs||GP().off||typeof html!=='string')return html;
  try{const doc=new DOMParser().parseFromString('<body>'+html+'</body>','text/html'),kids=[...doc.body.children],seen=new Set();
    const head=el=>{const h=el.querySelector('h3,h2,summary');return(el.id||'')+'|'+(h?h.textContent:'')+'|'+[...el.querySelectorAll('[id]')].slice(0,12).map(x=>x.id).join(',')};
    kids.forEach(c=>{const h=head(c).split('|')[1].trim();if(c.id==='crs-allcard'||(/پشتیبان کامل/.test(h)&&seen.has('crs')))c.remove();if(/پشتیبان کامل/.test(h))seen.add('crs');if(tab==='data'&&/^(Center DANI\s*)?مرکز DANI\s*$/.test(h.replace(/^Center DANI/,'').trim()))c.remove()});
    defs.forEach(g=>{const mine=[...doc.body.children].filter(c=>{const s=head(c);return g.m.some(x=>s.includes(x))&&!c.classList.contains('bgrp')});if(mine.length<2&&!(g.k==='pl-add'))return;if(!mine.length)return;
      const op=GP().open[g.k]!==undefined?GP().open[g.k]:g.open?1:0;
      const d=doc.createElement('details');d.className='c bgrp';d.setAttribute('data-gk',g.k);if(op)d.setAttribute('open','');
      d.innerHTML='<summary style="cursor:pointer;font-weight:700">'+g.i+' '+T(g.t[0],g.t[1])+' <span class="m">· '+fa(mine.length)+'</span></summary>';
      mine[0].parentNode.insertBefore(d,g.first?doc.body.firstChild:mine[0]);mine.forEach(c=>d.appendChild(c))});
    return doc.body.innerHTML}catch(e){console.error('groups',e);return html}}
document.addEventListener('toggle',e=>{const d=e.target;if(d&&d.classList&&d.classList.contains('bgrp')){GP().open[d.getAttribute('data-gk')]=d.open?1:0;try{save()}catch(x){}}},true);
{const _sp=setPage;setPage=function(){const h=_sp.apply(this,arguments);if(typeof stt==='undefined'||typeof h!=='string')return h;
  const bar='<div class="row" style="margin:0 0 8px"><button class="chip '+(GP().off?'':'on')+'" data-a="gp_t">◫ '+T('گروه‌بندی کارت‌های هم‌هدف','Group related cards')+(GP().off?'':' ✓')+'</button></div>';
  return bar+group(h,stt)}}
{const _p=PX.plan;if(typeof _p==='function')PX.plan=function(){return group(_p.apply(this,arguments),'plan')}}
/* کارت‌هایی که بعد از ساخت صفحه با DOM اضافه می‌شوند (پوسته، زبان، قفل…) با شناسه‌شان به همان گروه می‌روند */
function domPass(){try{if(GP().off||page!=='set'||typeof stt==='undefined')return;const defs=DEF[stt],pg=document.getElementById('pg');if(!defs||!pg)return;
  defs.forEach(g=>{const els=g.m.filter(x=>/^[a-z0-9-]+$/i.test(x)).map(i=>document.getElementById(i)).filter(e=>e&&e.parentNode===pg&&!e.closest('.bgrp'));if(!els.length)return;
    let d=pg.querySelector('details.bgrp[data-gk="'+g.k+'"]');
    if(!d){d=document.createElement('details');d.className='c bgrp';d.setAttribute('data-gk',g.k);if(GP().open[g.k]!==undefined?GP().open[g.k]:g.open)d.setAttribute('open','');d.innerHTML='<summary style="cursor:pointer;font-weight:700">'+g.i+' '+T(g.t[0],g.t[1])+' <span class="m"></span></summary>';pg.insertBefore(d,els[0])}
    els.forEach(e=>d.appendChild(e));const n=[...d.children].filter(c=>c.tagName!=='SUMMARY').length,sp=d.querySelector('summary .m');if(sp)sp.textContent='· '+fa(n)})}catch(e){console.error('groups dom',e)}}
{const _r=render;render=function(){const r=_r.apply(this,arguments);domPass();return r}}
H.gp_t=()=>{GP().off=GP().off?0:1;save();render()};
try{const s=document.createElement('style');s.textContent='.bgrp>summary{padding:4px 0}.bgrp>.c,.bgrp>details.c{margin:8px 0 0;box-shadow:none}.bgrp .g{margin:0}';document.head.appendChild(s)}catch(e){}
})();
