/* جمله‌ها (نقل‌قول‌ها) در تنظیمات (v69): «تنظیمات جمله‌ها»، «چرخش جمله‌ها» و «جمله‌های من (افزودن/ویرایش)» از صفحه‌ی جمله‌ها به
   تنظیمات ← زبان و ظاهر ← «جمله‌ها» رفتند؛ صفحه‌ی جمله‌ها فقط برای خواندن می‌ماند (امروز/همه/علاقه‌مندی‌ها/قبلی‌ها) با یک لینک به تنظیمات.
   محتوا از همان PG.qt اصلی گرفته می‌شود؛ هیچ قابلیتی حذف نشده. بعد از dlcard.js. */
(function(){'use strict';
if(typeof PG==='undefined'||!PG.qt||typeof zMS==='undefined')return;
const T=window.daniT;
const _qt=PG.qt;
function part(tab){const o=zMS.qt.tab;try{zMS.qt.tab=tab;let h=_qt.call(PG);if(typeof h!=='string')return'';h=h.replace(/<div class="mtabs">.*?<\/div>/,'');
  /* v101: کارت «نمایش جمله‌ها در صفحه‌ی اصلی» هم در «نمایش و چرخش» و هم در «جمله‌های من» می‌آمد؛ فقط یک‌بار (در «نمایش و چرخش») نگه داشته می‌شود */
  if(tab==='mine'){try{const d=new DOMParser().parseFromString('<body>'+h+'</body>','text/html');[...d.body.querySelectorAll('.c')].forEach(c=>{const t=c.querySelector('h3');if(t&&/نمایش جمله‌ها در صفحه‌ی اصلی/.test(t.textContent))c.remove()});h=d.body.innerHTML}catch(e){}}
  return h}finally{zMS.qt.tab=o}}
PG.qt=function(){const tab=zMS.qt.tab;
  if(tab==='set'||tab==='mine'){return mTabs('qt',tab,[['today','امروز'],['all','همه'],['fav','علاقه‌مندی‌ها'],['mine','جمله‌های من'],['hist','قبلی‌ها'],['set','تنظیمات']])
    +'<div class="c"><h3>'+T('جمله‌ها و تنظیماتشان به «تنظیمات» رفت','Sentences & their settings moved to Settings')+'</h3><p class="m">'+T('افزودن/ویرایش جمله‌ی شخصی، چرخش، نمایش روزانه و جمله‌های پنهان‌شده حالا یک‌جا در تنظیمات ← زبان و ظاهر ← «جمله‌ها» است.','Adding/editing your own sentences, rotation, daily display and hidden sentences now live in one place: Settings ← Language & look ← “Sentences”.')+'</p><button class="p" data-a="snt_go">'+T('رفتن به تنظیمات جمله‌ها','Open sentence settings')+'</button></div>'}
  return _qt.apply(this,arguments)};
H.snt_go=()=>{window.__sntOpen=true;page='set';stt='look';render();setTimeout(()=>{const g=document.getElementById('sntg');if(g){g.open=true;g.scrollIntoView({block:'start'})}},120)};
function build(){if(document.getElementById('sntg'))return;
  const anchor=document.getElementById('dlsxg')||[...document.querySelectorAll('details.bgrp')].find(d=>/Look & themes|ظاهر و تم/.test(d.querySelector('summary')?d.querySelector('summary').innerText:''));if(!anchor)return;
  const g=document.createElement('details');g.className='bgrp';g.id='sntg';g.innerHTML='<summary style="cursor:pointer;font-weight:700">💬 '+T('جمله‌ها','Sentences')+'</summary>';
  const sub=(t,h,open)=>{const d=document.createElement('details');d.style.marginTop='8px';d.open=!!open||!!(zMS.qt.edit&&/جمله/.test(t));const s=document.createElement('summary');s.style.cursor='pointer';s.innerHTML=t;d.appendChild(s);const w=document.createElement('div');w.innerHTML=h;d.appendChild(w);g.appendChild(d)};
  sub('⚙ '+T('نمایش و چرخش جمله‌ها','Display & rotation'),part('set'),false);
  sub('✍️ '+T('جمله‌های من (افزودن و ویرایش)','My sentences (add & edit)'),part('mine'),!!zMS.qt.edit);
  anchor.parentNode.insertBefore(g,anchor.nextSibling);if(window.__sntOpen||zMS.qt.edit)g.open=true;g.addEventListener('toggle',()=>{window.__sntOpen=g.open})}
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{if(page==='set'&&stt==='look')build()}catch(e){console.error('sentences',e)}return r}}
})();
