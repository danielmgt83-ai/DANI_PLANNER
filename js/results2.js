"use strict";
/* DANI · results2.js — «نتیجه» در ۳ زبانه: امروز | آمار و روند | گزارش و خروجی.
   «ماهانه و پیش‌بینی» و «ساعت‌های طلایی» داخل «آمار و روند»، «کارت اشتراک» داخل «گزارش و خروجی» آمد (هیچ قابلیتی حذف نشد).
   کارت‌های بلند به‌صورت بخش‌های جمع‌شونده (details) نشان داده می‌شوند؛ دو سه‌تای اول باز. بعد از همه‌ی فایل‌هایی که PG.res را می‌پیچند بارگذاری شود. */
(function(){
const T=window.daniT;
const OLD={mon:'stats',gld:'stats',shr:'rep'};
try{for(let i=RT.length-1;i>=0;i--)if(OLD[RT[i][0]])RT.splice(i,1);
  [['eod','نتیجه‌ی امروز','Today\'s result'],['stats','آمار و روند','Stats & trends'],['rep','گزارش و خروجی','Reports & export']].forEach(x=>{const r=RT.find(q=>q[0]===x[0]);if(r)r[1]=T(x[1],x[2])})}catch(e){}
const _res=PG.res;
function body(k){const o=rt;try{rt=k;const h=_res.call(PG);return typeof h==='string'?h.replace(/^<div class="row np tabs">.*?<\/div>/,''):''}finally{rt=o}}
/* هر کارتِ سطح‌بالا با تیتر ← بخش جمع‌شونده */
function fold(html,open){const t=document.createElement('div');t.innerHTML=html;let n=0;
  [...t.querySelectorAll('.c')].forEach(c=>{if(c.parentElement&&c.parentElement.closest('.c'))return;const h=c.querySelector('h3');if(!h)return;const i=n++;
    const d=document.createElement('details');d.className='c';if(i<open)d.open=true;const s=document.createElement('summary');s.style.cursor='pointer';s.innerHTML=h.outerHTML;h.remove();d.appendChild(s);while(c.firstChild)d.appendChild(c.firstChild);c.replaceWith(d)});
  return t.innerHTML}
/* گروه‌بندی بخش‌های هم‌کار در «آمار» (v66): بخش‌ها کامل می‌مانند و فقط زیر یک تیتر جمع می‌شوند */
function group(html,GR){const t=document.createElement('div');t.innerHTML=html;
  GR.forEach(g=>{const hit=[...t.querySelectorAll('details')].filter(d=>!d.parentElement.closest('details')&&d.firstElementChild.tagName==='SUMMARY'&&g.rx.some(r=>r.test(d.firstElementChild.textContent)));if(hit.length<2)return;
    const o=document.createElement('details');o.className='c';const sm=document.createElement('summary');sm.style.cursor='pointer';sm.innerHTML='<h3>'+g.t+'</h3>';o.appendChild(sm);
    hit.forEach(d=>{const sub=document.createElement('div');sub.className='sbg';sub.style.cssText='margin-top:12px;padding-top:8px;border-top:1px solid var(--b,#8883)';const hd=d.firstElementChild;const h=document.createElement('div');h.style.cssText='font-weight:700;margin-bottom:6px';h.innerHTML=hd.innerHTML;hd.remove();sub.appendChild(h);while(d.firstChild)sub.appendChild(d.firstChild);o.appendChild(sub)});
    hit[0].replaceWith(o);hit.slice(1).forEach(d=>d.remove())});
  const f=t.querySelector('details'),r=[...t.querySelectorAll('.c')].find(c=>c.tagName!=='DETAILS'&&!c.closest('details')&&!c.querySelector('h3')&&c.querySelector('select'));if(f&&r)f.parentNode.insertBefore(r,f);/* انتخاب بازه بالای فهرست */
  return t.innerHTML}
const GR=[{t:'⚖️ '+T('مقایسه','Compare'),rx:[/Compare|مقایسه/]},
 {t:'⏱ '+T('زمان و فعالیت‌ها','Time & activities'),rx:[/Time by Activity|زمان هر فعالیت/,/Essential|ضروری/,/Study This Week|مطالعه در هفته/]},
 {t:'📈 '+T('روند و بهترین روزها','Trends & best days'),rx:[/Averages|میانگین‌ها/,/Best & Weakest|بهترین و ضعیف/,/Study & Work Trend|روند زمان/]},
 {t:'🧠 '+T('انرژی و یادگیری','Energy & learning'),rx:[/Energy Meets|انرژی و تمرکز/,/Learning Quality|کیفیت یادگیری/,/Pauses|وقفه/,/Golden hours|ساعت‌های طلایی/]}];
PG.res=function(){
  if(OLD[rt])rt=OLD[rt];
  const bar=tabBar(RT,rt,'r');
  if(rt==='stats'){let h='';
    h+=fold(body('mon'),2);
    h+=group(fold(body('stats'),1)+fold(body('gld'),0),GR);
    return bar+h}
  if(rt==='rep'){return bar+body('rep')+fold(body('shr'),0)}
  if(rt==='eod'){let x=_res.apply(this,arguments);try{if(window.daniFcList)x+=window.daniFcList()}catch(e){}return x}
  return _res.apply(this,arguments)};
})();
