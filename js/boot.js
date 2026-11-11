"use strict";
/* DANI · boot.js
   راه‌اندازی (بخش دوم): اولین render و آماده‌شدن (بخش اول در boot0.js است)
   فایل‌های js/ به ترتیب در index.html بارگذاری می‌شوند و متغیرها و تابع‌ها را مشترک دارند (مثل یک فایل واحد). */
i18Apply();render();
try{if('serviceWorker' in navigator)navigator.serviceWorker.addEventListener('message',e=>{if(!e.data||e.data.type!=='dani-update')return;
  /* v107: فقط وقتی نسخه‌ی تازه واقعاً با نسخه‌ی در حال اجرا فرق دارد؛ برای هر نسخه یک بار؛ اگر تکرار شد صفحه‌ی ذخیره‌شده ترمیم می‌شود */
  let run='';try{const m=/[?&]v=([^&]+)/.exec((document.querySelector('script[src*="js/fx.js"]')||{}).src||'');run=m?m[1]:''}catch(_){}
  const go=rv=>{if(rv&&run&&rv===run)return;
  let n=0;try{const k='dani_ota_told',o=JSON.parse(localStorage.getItem(k)||'{}');n=(o.v===rv?o.n:0)+1;localStorage.setItem(k,JSON.stringify({v:rv,n}));
    if(n>=3){try{navigator.serviceWorker.controller&&navigator.serviceWorker.controller.postMessage({type:'dani-reset-html'})}catch(_){}}
    if(n>=2&&n<3&&o.v===rv)return}catch(_){}
  toast(LANGEN()?'A new version is ready'+(rv?' ('+run+' → '+rv+')':'')+'; close and reopen the app once':'نسخه‌ی تازه آماده است'+(rv?' ('+run+' ← '+rv+')':'')+'؛ یک‌بار برنامه را ببند و دوباره باز کن')};
  /* سرویس‌ورکرِ قدیمی نسخه نمی‌فرستد: خود صفحه نسخه‌ی سایت را می‌خواند؛ اگر نشد، پیام نمایش داده نمی‌شود */
  if(e.data.rv)go(e.data.rv);else{try{const c=new AbortController(),t=setTimeout(()=>c.abort(),8000);fetch('https://danielmgt83-ai.github.io/DANI_PLANNER/',{cache:'no-cache',signal:c.signal}).then(r=>r.text()).then(x=>{clearTimeout(t);const m=/js\/fx\.js\?v=([^"'&\s]+)/.exec(x);if(m)go(m[1])}).catch(()=>{})}catch(_){}}
  })}catch(e){}

/* v83: boot.js حالا آخرین اسکریپت است؛ اولین رسم فقط یک‌بار و بعد از آماده‌شدن همه‌ی ویژگی‌ها انجام می‌شود. */
window.__daniBooted=1;try{document.dispatchEvent(new Event('dani-booted'))}catch(e){}
try{requestAnimationFrame(()=>setTimeout(()=>{const e=document.getElementById('bootv');if(e){e.style.transition='opacity .2s';e.style.opacity=0;setTimeout(()=>e.remove(),230)}},450))}catch(e){const v=document.getElementById('bootv');if(v)v.remove()}
