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
PG.res=function(){
  if(OLD[rt])rt=OLD[rt];
  const bar=tabBar(RT,rt,'r');
  if(rt==='stats'){let h='';
    h+=fold(body('mon'),2);
    h+=fold(body('stats'),1);
    h+=fold(body('gld'),0);
    return bar+h}
  if(rt==='rep'){return bar+body('rep')+fold(body('shr'),0)}
  if(rt==='eod'){let x=_res.apply(this,arguments);try{if(window.daniFcList)x+=window.daniFcList()}catch(e){}return x}
  return _res.apply(this,arguments)};
})();
