"use strict";
/* DANI · keepopen.js (v162) — رفع باگ «با زدن روی یک گزینه، کل بخش/کارت جمع می‌شود».
   علت: صفحه‌ی تنظیمات بعد از هر کلیک دوباره ساخته می‌شود و بخش‌های تاشو (details) با حالت پیش‌فرض ساخته می‌شوند؛
   حالتی که کاربر خودش با لمس عنوان باز/بسته کرده بود از دست می‌رفت.
   راه‌حل عمومی: فقط وقتی کاربر عنوان (summary) را لمس کرد، حالتِ آن بخش (با کلید پایدار: صفحه|تب|زیربخش|مسیر عنوان‌ها) در حافظه می‌ماند
   و بعد از هر render روی بخش‌های هم‌کلید دوباره اعمال می‌شود. این فایل باید آخرین فایلِ پیش از boot.js بارگذاری شود (بیرونی‌ترین wrapper). */
(function(){'use strict';
const M=new Map();
const txt=d=>{const s=d.querySelector(':scope>summary');return s?(s.textContent||'').replace(/\s+/g,' ').replace(/[·•\d۰-۹]+/g,'').trim().slice(0,40):''};
function key(d){const pg=document.getElementById('pg');if(!pg||!pg.contains(d))return'';const parts=[];
 for(let e=d;e&&e!==pg;e=e.parentElement){if(e.tagName==='DETAILS')parts.push(e.dataset.nk||e.dataset.gk||e.id||txt(d===e?d:e))}
 if(!parts.length)return'';
 return[typeof page!=='undefined'?page:'',typeof stt!=='undefined'?stt:'',window.daniSetSub||''].concat(parts.reverse()).join('|')}
document.addEventListener('click',e=>{const s=e.target.closest&&e.target.closest('summary');if(!s||!s.parentElement||s.parentElement.tagName!=='DETAILS')return;
 const d=s.parentElement;setTimeout(()=>{try{const k=key(d);if(k)M.set(k,d.open)}catch(x){}},0)},true);
function apply(){try{const pg=document.getElementById('pg');if(!pg||!M.size)return;
 pg.querySelectorAll('details').forEach(d=>{const k=key(d);if(k&&M.has(k)&&d.open!==M.get(k))d.open=M.get(k)})}catch(e){console.error('keepopen',e)}}
{const _r=render;render=function(){const r=_r.apply(this,arguments);apply();setTimeout(apply,0);setTimeout(apply,180);return r}}
window.daniKeepOpen={M,key,apply};
})();
