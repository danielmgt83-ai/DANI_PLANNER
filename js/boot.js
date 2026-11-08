"use strict";
/* DANI · boot.js
   راه‌اندازی (بخش دوم): اولین render و آماده‌شدن (بخش اول در boot0.js است)
   فایل‌های js/ به ترتیب در index.html بارگذاری می‌شوند و متغیرها و تابع‌ها را مشترک دارند (مثل یک فایل واحد). */
i18Apply();render();
try{if('serviceWorker' in navigator)navigator.serviceWorker.addEventListener('message',e=>{if(e.data&&e.data.type==='dani-update')toast(LANGEN()?'A new version is ready; close and reopen the app once':'نسخه‌ی تازه آماده است؛ یک‌بار برنامه را ببند و دوباره باز کن')})}catch(e){}

/* v83: boot.js حالا آخرین اسکریپت است؛ اولین رسم فقط یک‌بار و بعد از آماده‌شدن همه‌ی ویژگی‌ها انجام می‌شود. */
window.__daniBooted=1;try{document.dispatchEvent(new Event('dani-booted'))}catch(e){}
try{requestAnimationFrame(()=>setTimeout(()=>{const e=document.getElementById('bootv');if(e){e.style.transition='opacity .2s';e.style.opacity=0;setTimeout(()=>e.remove(),230)}},450))}catch(e){const v=document.getElementById('bootv');if(v)v.remove()}
