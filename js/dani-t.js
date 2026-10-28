"use strict";
/* DANI · dani-t.js — مترجم مشترک برای همه‌ی بخش‌های جدید: window.daniT(فارسی, English)
   • زبان انگلیسی: متن انگلیسی را برمی‌گرداند.
   • فارسی/دوزبانه: فارسی را برمی‌گرداند و هر جفت را در دیکشنری i18n ثبت می‌کند تا در حالت «دوزبانه» عنوان‌ها (h1–h4، summary، تب‌ها، placeholder) خودکار «English / فارسی» شوند.
   قانون: هر متن جدید فقط با T(fa,en) نوشته شود و عنوان کارت‌ها <h3> باشد (نه <b>). حداکثر ۱۵۰۰ جفت در هر اجرا ثبت می‌شود. */
window.daniT=function(fa,en){
  try{if(en&&typeof fa==='string'&&fa.length<=90&&typeof I18_MAP!=='undefined'&&!I18_MAP.has(fa)&&(window.__daniTn=(window.__daniTn||0)+1)<1500){I18_MAP.set(fa,en);I18_RE=null;try{I18_MEMO.clear()}catch(e){}}}catch(e){}
  try{return LANGEN()?en:fa}catch(e){return fa}};

/* عنوان کارت: آیکون جدا از متن تا در حالت دوزبانه ترجمه‌ی متن با دیکشنری جور شود */
window.daniH=function(icon,fa,en,tag){tag=tag||'h3';return'<'+tag+' class="dh">'+(icon?'<span aria-hidden="true">'+icon+'</span> ':'')+window.daniT(fa,en)+'</'+tag+'>'};
try{const s=document.createElement('style');s.textContent='.dh{margin:0 0 6px;font-size:1.05em}';document.head.appendChild(s)}catch(e){}
