/* v142 — «نپریدن صفحه»: هر بار render می‌شود (دکمه‌ی پومودورو، ثبت سریع، انتخاب فعالیت…) محتوا از نو ساخته می‌شد،
   صفحه به بالا می‌پرید و کارت‌های «جمع‌شونده» که باز کرده بودی بسته می‌شدند.
   اینجا (۱) جای اسکرول و (۲) بازبودن همان کارت‌ها نگه داشته می‌شود. فقط ظاهر/رفتار نمایش؛ هیچ داده‌ای دست نمی‌خورد.
   جابه‌جایی به صفحه یا زبانه‌ی دیگر مثل قبل از بالا شروع می‌شود. */
(function(){'use strict';
const sig=()=>[typeof page!=='undefined'?page:'',typeof dt!=='undefined'?dt:'',typeof rt!=='undefined'?rt:'',typeof stt!=='undefined'?stt:'',typeof vd!=='undefined'?vd:''].join('|');
function keys(root){const m={},seen={};
 root.querySelectorAll('details').forEach(d=>{const s=d.querySelector(':scope>summary'),k=d.id||((s?s.textContent.replace(/\s+/g,' ').trim():'')||'?');seen[k]=(seen[k]||0)+1;m[k+'#'+seen[k]]=d});return m}
{const _r=render;render=function(){
  let y=0,s0='',op=null,pg=null,h=0;
  try{y=window.scrollY||document.documentElement.scrollTop||0;s0=sig();pg=document.getElementById('pg');
   if(pg){h=pg.offsetHeight;op=Object.entries(keys(pg)).filter(e=>e[1].open).map(e=>e[0]);if(h>0&&y>0)pg.style.minHeight=h+'px'}}catch(e){}
  const r=_r.apply(this,arguments);
  try{pg=document.getElementById('pg');
   if(pg&&op&&op.length){const m=keys(pg);op.forEach(k=>{if(m[k]&&!m[k].open)m[k].open=true})}
   if(y>0&&s0===sig())window.scrollTo(0,y);
   if(pg&&pg.style.minHeight){const p=pg;setTimeout(function(){p.style.minHeight=''},250)}}catch(e){console.error('keep3',e)}
  return r}}
})();
