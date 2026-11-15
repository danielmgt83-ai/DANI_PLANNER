"use strict";
/* DANI · boot.js
   راه‌اندازی (بخش دوم): اولین render و آماده‌شدن (بخش اول در boot0.js است)
   فایل‌های js/ به ترتیب در index.html بارگذاری می‌شوند و متغیرها و تابع‌ها را مشترک دارند (مثل یک فایل واحد). */
i18Apply();render();
/* v119: اعلان نسخه‌ی تازه = نوار ماندگار با دکمه‌ی «به‌روزرسانی» (قبلاً toast یک ثانیه‌ای بود). دکمه اول همه‌ی فایل‌های تازه را می‌گیرد و ذخیره می‌کند، بعد صفحه را بارگذاری می‌کند. */
window.daniUpdBanner=function(rv,run){
  if(document.getElementById('updbar'))return;
  const EN=typeof LANGEN==='function'&&LANGEN(),b=document.createElement('div');b.id='updbar';b.setAttribute('role','status');
  b.style.cssText='position:fixed;left:10px;right:10px;bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:99999;background:#12214a;color:#fff;border:1px solid #7fb0ff88;border-radius:16px;padding:10px 12px;display:flex;gap:8px;align-items:center;box-shadow:0 8px 28px #0009;font-size:14px;line-height:1.5';
  const bs='border:0;border-radius:12px;padding:8px 12px;font:inherit;cursor:pointer;';
  b.innerHTML='<span id="updt" style="flex:1">🆕 '+(EN?'A new version is ready':'نسخه‌ی تازه آماده است')+'</span><button id="updgo" style="'+bs+'background:#7fb0ff;color:#06122b;font-weight:700">'+(EN?'Update':'به‌روزرسانی')+'</button><button id="updx" style="'+bs+'background:transparent;color:#fff;opacity:.75">'+(EN?'Later':'بعداً')+'</button>';
  document.body.appendChild(b);
  const t=b.querySelector('#updt'),go=b.querySelector('#updgo');
  b.querySelector('#updx').onclick=()=>b.remove();
  go.onclick=async()=>{go.disabled=true;
    const local=location.hostname==='localhost'&&location.port==='',base=local?'https://danielmgt83-ai.github.io/DANI_PLANNER/':'',fail=()=>{t.textContent='⚠ '+(EN?'Cannot reach the site; try again with a better connection':'اینترنت به سایت نمی‌رسد؛ با اینترنت بهتر دوباره بزن');go.disabled=false};
    try{const c=new AbortController(),to=setTimeout(()=>c.abort(),12000);const r=await fetch(base+'index.html?_g='+Date.now(),{cache:'no-store',signal:c.signal});clearTimeout(to);const h=await r.text();if(!r.ok||h.indexOf('js/boot.js')<0)return fail();
      const us=[],re=/(?:src|href)="([^"]*\?v=[^"]*)"/g;let m;while((m=re.exec(h)))us.push(m[1]);let n=0,bad=0;
      const q=us.slice();await Promise.all(Array.from({length:6},async()=>{while(q.length){const u=q.shift();try{const x=await fetch(u);if(!x.ok)bad++}catch(e){bad++}n++;t.textContent='⏳ '+(EN?'Updating… ':'در حال به‌روزرسانی… ')+n+'/'+us.length}}));
      if(bad>us.length*.1)return fail();
      t.textContent='✔ '+(EN?'Done — restarting':'تمام شد — در حال بازشدن');setTimeout(()=>location.reload(),500)}catch(e){fail()}}
};
try{if('serviceWorker' in navigator)navigator.serviceWorker.addEventListener('message',e=>{if(!e.data||e.data.type!=='dani-update')return;
  /* v107: فقط وقتی نسخه‌ی تازه واقعاً با نسخه‌ی در حال اجرا فرق دارد؛ برای هر نسخه یک بار؛ اگر تکرار شد صفحه‌ی ذخیره‌شده ترمیم می‌شود */
  let run='';try{const m=/[?&]v=([^&]+)/.exec((document.querySelector('script[src*="js/fx.js"]')||{}).src||'');run=m?m[1]:''}catch(_){}
  const go=rv=>{if(rv&&run&&rv===run)return;
  let n=0;try{const k='dani_ota_told',o=JSON.parse(localStorage.getItem(k)||'{}');n=(o.v===rv?o.n:0)+1;localStorage.setItem(k,JSON.stringify({v:rv,n}));
    if(n>=3){try{navigator.serviceWorker.controller&&navigator.serviceWorker.controller.postMessage({type:'dani-reset-html'})}catch(_){}}
    if(n>=2&&n<3&&o.v===rv)return}catch(_){}
  window.daniUpdBanner(rv,run)};
  /* سرویس‌ورکرِ قدیمی نسخه نمی‌فرستد: خود صفحه نسخه‌ی سایت را می‌خواند؛ اگر نشد، پیام نمایش داده نمی‌شود */
  if(e.data.rv)go(e.data.rv);else{try{const c=new AbortController(),t=setTimeout(()=>c.abort(),8000);fetch('https://danielmgt83-ai.github.io/DANI_PLANNER/',{cache:'no-cache',signal:c.signal}).then(r=>r.text()).then(x=>{clearTimeout(t);const m=/js\/fx\.js\?v=([^"'&\s]+)/.exec(x);if(m)go(m[1])}).catch(()=>{})}catch(_){}}
  })}catch(e){}

/* v83: boot.js حالا آخرین اسکریپت است؛ اولین رسم فقط یک‌بار و بعد از آماده‌شدن همه‌ی ویژگی‌ها انجام می‌شود. */
window.__daniBooted=1;try{document.dispatchEvent(new Event('dani-booted'))}catch(e){}
try{requestAnimationFrame(()=>setTimeout(()=>{try{if(window.daniBootDone){window.daniBootDone();return}}catch(e){}const e=document.getElementById('bootv');if(e){e.style.transition='opacity .35s';e.style.opacity=0;setTimeout(()=>e.remove(),380)}},120))}catch(e){const v=document.getElementById('bootv');if(v)v.remove()}

/* v131: ترمیم خودکار اولین‌بار — اگر یک اسکریپت لود نشد یا ناقص بود (مثلاً ترکیب فایل‌های قدیمی و تازه بعد از نصب)، کش پاک و صفحه یک بار دوباره بارگذاری می‌شود */
try{setTimeout(()=>{const miss=(window.__sf||[]).length||typeof dlDashHTML!=='function'||(window.daniDF&&window.daniDF.shim);if(!miss)return;let n=0;try{n=+sessionStorage.getItem('dani_heal')||0}catch(e){return}if(n>=1)return;try{sessionStorage.setItem('dani_heal','1')}catch(e){return}
  (async()=>{try{const ks=await caches.keys();await Promise.all(ks.map(k=>caches.delete(k)))}catch(e){}location.reload()})()},4000)}catch(e){}
