"use strict";
/* DANI · boot.js
   راه‌اندازی: باز کردن صفحه از ?go=، بارگذاری افزونه‌ها، اولین render
   فایل‌های js/ به ترتیب در index.html بارگذاری می‌شوند و متغیرها و تابع‌ها را مشترک دارند (مثل یک فایل واحد). */
try{const q=new URLSearchParams(location.search).get('go');if(q==='log'){page='dash';dt='today'}else if(['home','dl','qt','acd','hab','rem','set','res'].includes(q))page=q}catch(e){}
try{extLoadAll()}catch(e){console.error('ext',e)}
i18Apply();render();

