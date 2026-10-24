"use strict";
/* DANI · errorlog.js
   خطا: گزارش خطای قابل‌مشاهده؛ اگر چیزی خراب شود، پیام کوتاه با دکمه‌ی کپی نشان می‌دهد
   فایل‌های js/ به ترتیب در index.html بارگذاری می‌شوند و متغیرها و تابع‌ها را مشترک دارند (مثل یک فایل واحد). */
/* DANI v1: visible error report. If anything breaks, a short message with a copy button appears instead of silence; the last 20 errors are kept (Settings > Data). */
(function(){const K='dani_errlog',seen={};
 function load(){try{return JSON.parse(localStorage.getItem(K)||'[]')}catch(e){return[]}}
 function txt(){return load().map(x=>x.t+' | '+x.m+(x.l?' (line '+x.l+')':'')+(x.s?' | '+x.s:'')).join('\n')}
 function show(msg,line){try{if(!document.body||document.getElementById('dani-err'))return;const d=document.createElement('div');d.id='dani-err';d.setAttribute('role','alert');d.style.cssText='position:fixed;inset-inline:8px;bottom:8px;z-index:99999;background:#7f1d1d;color:#fff;padding:10px 12px;border-radius:12px;font:13px/1.7 Tahoma,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.4);direction:rtl;display:flex;gap:8px;align-items:center;flex-wrap:wrap';const m=document.createElement('span');m.style.flex='1';m.textContent='خطایی رخ داد: '+msg+(line?' (خط '+line+')':'');const mk=(t,f)=>{const b=document.createElement('button');b.textContent=t;b.style.cssText='background:#fff;color:#7f1d1d;border:0;border-radius:8px;padding:4px 10px;cursor:pointer';b.onclick=f;return b};d.append(m,mk('کپی خطا',()=>{try{navigator.clipboard.writeText(txt()).then(()=>{m.textContent='خطا کپی شد؛ برای پشتیبانی بفرست.'},()=>{prompt('این متن را کپی کن:',txt())})}catch(e){prompt('این متن را کپی کن:',txt())}}),mk('بستن',()=>d.remove()));document.body.appendChild(d)}catch(e){}}
 function rec(msg,line,stack){try{msg=String(msg||'خطای نامشخص').slice(0,300);const k=msg+'|'+line;if(seen[k])return;seen[k]=1;const l=load();l.push({t:new Date().toISOString().slice(0,19).replace('T',' '),m:msg,l:line||'',s:String(stack||'').split('\n').slice(0,4).join(' | ').slice(0,400)});localStorage.setItem(K,JSON.stringify(l.slice(-20)));show(msg,line)}catch(e){}}
 window.addEventListener('error',e=>rec(e.message,e.lineno,e.error&&e.error.stack));
 window.addEventListener('unhandledrejection',e=>rec('Promise: '+((e.reason&&e.reason.message)||e.reason),'',e.reason&&e.reason.stack));
 window.daniErrs=load;window.daniErrText=txt;window.daniErrClear=()=>{try{localStorage.removeItem(K)}catch(e){}};window.daniErrRec=rec})();

