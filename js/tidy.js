/* DANI · tidy.js (v90) — ادغام‌های کوچکِ تکراری‌ها بعد از رسم صفحه (همیشه فقط جابه‌جایی؛ هیچ قابلیتی کم نمی‌شود).
   ۱) تنظیمات ← ظاهر: کارت «زبان» و کارت «زبان و تاریخ (تقویم)» یکی می‌شوند. بعد از backupc.js. */
(function(){'use strict';
const T=window.daniT;
function lang(){const pg=document.getElementById('pg'),l1=document.getElementById('langcard');if(!pg||!l1||l1.dataset.mg)return;
  const l2=[...pg.querySelectorAll('.c')].find(c=>c!==l1&&!c.classList.contains('bgrp')&&c.querySelector('select[data-f="cal"]')&&!c.contains(l1));if(!l2)return;
  const h=l1.querySelector('h3');if(h){h.removeAttribute('data-nobi');h.textContent=T('زبان و تقویم','Language & calendar')}
  const hint=l1.querySelector('p.m'),cal=document.createElement('div');cal.style.marginTop='10px';
  [...l2.children].forEach(n=>{if(n.tagName!=='H3')cal.appendChild(n)});
  l1.insertBefore(cal,hint||null);
  const w=l2.parentElement&&l2.parentElement.classList.contains('g2')&&l2.parentElement.children.length===1?l2.parentElement:l2;w.remove();l1.dataset.mg='1';
  const g=pg.querySelector('details[data-gk="lk-lang"]');if(g){const m=g.querySelector('summary .m');if(m)m.textContent='· '+fa(g.children.length-1)}}
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{if(page==='set')lang()}catch(e){console.error('tidy',e)}return r}}
})();
