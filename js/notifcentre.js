"use strict";
/* DANI · notifcentre.js — «مرکز اعلان» کامل‌تر: همه‌ی کارت‌های اعلان در ۵ بخش جمع‌شونده‌ی یک کارت.
   فقط جابه‌جایی DOM است (دکمه‌ها با data-a کار می‌کنند)؛ هیچ تنظیمی حذف نمی‌شود، جز دکمه‌ی تکراریِ «درخواست اجازه» (همان کار دکمه‌ی اعلان مرورگر).
   بعد از settings2.js, rating.js, remain.js, checkin.js, notifroute.js بارگذاری شود. هر رندر بی‌خطر تکرار می‌شود. */
(function(){
const T=window.daniT;
const $=id=>document.getElementById(id);
function sec(box,key,title,open){let d=box.querySelector(':scope>details[data-nk="'+key+'"]');if(d)return d;
  d=document.createElement('details');d.className='c';d.dataset.nk=key;if(open)d.open=true;
  const s=document.createElement('summary');s.style.cursor='pointer';s.innerHTML='<b>'+title+'</b>';d.appendChild(s);box.appendChild(d);return d}
function put(d,n){if(n&&n.parentNode!==d)d.appendChild(n)}
function run(){
  const box=$('ntc');if(!box)return;
  const perm=box.querySelector(':scope>details:nth-of-type(1)'); /* اجازه و سلامت */
  const secs=[...box.querySelectorAll(':scope>details')];
  const byHead=rx=>secs.find(d=>!d.dataset.nk&&rx.test((d.querySelector('summary')||{}).innerText||''));
  const sP=byHead(/Permission|اجازه/)||perm,sS=byHead(/Sound|صدا/),sT=byHead(/Times|زمان‌ها/),sG=byHead(/Grouping|گروه‌بندی/);
  if(!sP||!sS||!sT||!sG)return;
  sP.dataset.nk='p';sS.dataset.nk='s';sT.dataset.nk='t';sG.dataset.nk='g';
  const sX=sec(box,'x','🧩 '+T('اعلان‌های تکمیلی','Extra reminders'),0);
  /* ترتیب: اجازه ← صدا ← زمان ← تکمیلی ← گروه */
  [sP,sS,sT,sX,sG].forEach(d=>box.appendChild(d));
  /* کارت آزمایش/اجازه‌ی یکپارچه کنار سلامت، نه زیر «صدا» */
  const g=$('ntgrp'),nc=$('ntcard'),qh=$('qhcard');
  put(sP,nc);
  put(sT,qh);
  if(g&&!g.querySelector('.c')&&g.parentNode)g.remove();
  ['qrc','rmc','chc'].forEach(id=>put(sX,$(id)));
  /* دکمه‌ی تکراری: «درخواست اجازه» دو بار (اعلان مرورگر + مرکز یکپارچه) → فقط اولی */
  const a=box.querySelector('[data-a="notif"]'),b=box.querySelector('[data-a="nt_perm"]');if(a&&b)b.remove();
  /* بخش خالی نماند */
  [sX,sG].forEach(d=>{if(!d.querySelector('.c'))d.style.display='none';else d.style.display=''});
}
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{if(page==='set'&&stt==='time')run()}catch(e){console.error('notifcentre',e)}return r}}
})();
