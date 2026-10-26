"use strict";
/* DANI · boot.js
   راه‌اندازی: باز کردن صفحه از ?go=، بارگذاری افزونه‌ها، اولین render
   فایل‌های js/ به ترتیب در index.html بارگذاری می‌شوند و متغیرها و تابع‌ها را مشترک دارند (مثل یک فایل واحد). */
try{const q=new URLSearchParams(location.search).get('go');if(q==='log'){page='dash';dt='today'}else if(['home','dl','qt','acd','hab','rem','set','res'].includes(q))page=q}catch(e){}
try{extLoadAll()}catch(e){console.error('ext',e)}
i18Apply();render();
try{if('serviceWorker' in navigator)navigator.serviceWorker.addEventListener('message',e=>{if(e.data&&e.data.type==='dani-update')toast(LANGEN()?'A new version is ready; close and reopen the app once':'نسخه‌ی تازه آماده است؛ یک‌بار برنامه را ببند و دوباره باز کن')})}catch(e){}
