/* DANI service worker
   - روش «اول حافظه، تازه‌سازی در پس‌زمینه»: برنامه فوری باز می‌شود (حتی با اینترنت کند یا بدون اینترنت) و فایل‌های تازه برای بار بعد گرفته می‌شود؛ اگر نسخه‌ی تازه‌ی صفحه‌ی اصلی آمده باشد به برنامه پیام «dani-update» می‌دهد.
   - لیست PRECACHE را با  python3 tools/update-sw.py  دوباره بساز (بعد از اضافه یا حذف فایل).
   - اعلان‌ها: برنامه با showNotification از همین سرویس‌ورکر استفاده می‌کند؛ کلیک روی اعلان برنامه را باز می‌کند. */
const VERSION='dani-v121';
const PRECACHE=["./", "index.html", ".gitignore", "aot-quotes.json", "audio/alarm-default.mp3", "dani.css", "icons/favicon-32.png", "icons/favicon-64.png", "icons/favicon.svg", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon.svg", "img/aot-eren-beach.jpg", "img/aot-eren-eyes.jpg", "img/aot-eren-face.jpg", "img/aot-eren-mikasa-bw.jpg", "img/aot-eren-ocean.jpg", "img/aot-eren-port.jpg", "img/aot-eren-scout-blades.jpg", "img/aot-eren-scout-cloak.jpg", "img/aot-eren-scout-collage.jpg", "img/aot-eren-scout-jacket.jpg", "img/aot-eren-sky.jpg", "img/aot-eren-titan.jpg", "img/aot-erwin-horse.jpg", "img/aot-erwin-manga.jpg", "img/aot-erwin-port.jpg", "img/aot-erwin-sunset.jpg", "img/aot-levi-cape.jpg", "img/aot-levi-jump.jpg", "img/aot-levi-rain.jpg", "img/aot-levi-roof.jpg", "img/aot-mikasa-autumn.jpg", "img/aot-mikasa-blade.jpg", "img/aot-mikasa-duo.jpg", "img/aot-mikasa-odm.jpg", "img/aot-mikasa-scarf.jpg", "img/aot-wings.jpg", "img/ern-p1-d9adbb.jpg", "img/ern-p2-9bf6cd.jpg", "img/itachi-e2-1ebcc0.jpg", "img/itachi-e3-a5c85c.jpg", "img/itachi-f3-d98a25.jpg", "img/itachi-h1-7f74af.jpg", "img/itachi-h2-a1a754.jpg", "img/itachi-h3-29e3ae.jpg", "img/itachi-r1-ec680f.jpg", "img/itachi-r2-0d79e1.jpg", "img/itachi-r3-cbf230.jpg", "img/itachi-r4-bf5374.jpg", "img/itachi-s1-8e549c.jpg", "img/itachi-s2-8ca0a0.jpg", "img/itachi-s3-93be62.jpg", "img/itachi1-d134a5.jpg", "img/itachi2-a1c529.jpg", "img/itachi3-4ae60d.jpg", "img/itachi4-aa38ec.jpg", "img/skin-barcelona-cdb86e.jpg", "img/skin-eren-4b29ec.jpg", "img/theme-barcelona-b1-7363d2.jpg", "img/theme-eren-e1-214a70.jpg", "img/theme-eren-e2-059f20.jpg", "img/theme-uchiha-ua-66b349.jpg", "img/theme-uchiha-ub-a36033.jpg", "img/theme-uchiha-uc-b352e2.jpg", "img/theme-uchiha-ue-1c39e9.jpg", "js/academy.js", "js/acts2.js", "js/backupc.js", "js/backuppw.js", "js/bin.js", "js/boot.js", "js/boot0.js", "js/calio.js", "js/calm.js", "js/capsule.js", "js/checkin.js", "js/chkact.js", "js/compact.js", "js/core.js", "js/courses.js", "js/daily.js", "js/dani-t.js", "js/dashboard-planner.js", "js/data/baked.js", "js/data/du.js", "js/datefield.js", "js/dlcard.js", "js/dlnag.js", "js/dock.js", "js/emptycta.js", "js/errorlog.js", "js/extensions.js", "js/fx.js", "js/groups.js", "js/growth.js", "js/guide2.js", "js/helpfab.js", "js/home-desk.js", "js/home-weekly.js", "js/home2.js", "js/homemerge.js", "js/i18n-extra.js", "js/i18n-late.js", "js/i18n.js", "js/iconstyle.js", "js/iconswap.js", "js/insight.js", "js/livesync.js", "js/lock.js", "js/lookmerge.js", "js/modules-deadlines.js", "js/modules-habits-reminders-quotes.js", "js/native-extras.js", "js/native-save.js", "js/notifcentre.js", "js/notifier.js", "js/notifroute.js", "js/notifx.js", "js/onboard.js", "js/pace.js", "js/pgband.js", "js/phase2.js", "js/plan2.js", "js/pomodoro.js", "js/projects.js", "js/qa-more.js", "js/quick-health.js", "js/quickaccess.js", "js/quicklog.js", "js/quotes-data.js", "js/rating.js", "js/remain.js", "js/results2.js", "js/rhythm.js", "js/safety.js", "js/seed.js", "js/sentences.js", "js/setsearch.js", "js/settings2.js", "js/share-csv.js", "js/smart.js", "js/smartnext.js", "js/sound-notify-backup.js", "js/soundcenter.js", "js/theme-aot.js", "js/theme-eren.js", "js/theme-studio-export.js", "js/themes-engine.js", "js/tidy.js", "js/tomorrow.js", "js/usetime.js", "manifest.webmanifest", "skins.css", "themes-aot.css", "themes-eren.css", "themes-itachi.css"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>Promise.all(PRECACHE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
/* ===== حالت «داخل برنامه + به‌روزرسانی از اینترنت» (OTA، v100) =====
   وقتی برنامه‌ی اندروید در حالت bundled اجرا می‌شود (آدرس https://localhost بدون پورت)، فایل‌ها از داخل خود APK می‌آیند و برنامه
   حتی با وای‌فای فیلترشده یا بدون اینترنت باز می‌شود. هر وقت اینترنتِ رسیده به GitHub Pages باشد، فایل‌های متنی (html/js/css/json)
   در پس‌زمینه از سایت گرفته و در حافظه‌ی برنامه جایگزین می‌شوند و یک پیام «نسخه‌ی تازه» می‌آید. جواب مشکوک (صفحه‌ی فیلتر، خطا) رد می‌شود. */
const REMOTE='https://danielmgt83-ai.github.io/DANI_PLANNER/';
const OTA=/^(localhost|127\.0\.0\.1)$/.test(location.hostname)&&location.port==='';
let otaTold=false;
const remoteOf=u=>{const x=new URL(u);return REMOTE+x.pathname.replace(/^\//,'')+x.search};
const isTextPath=p=>p.endsWith('/')||/\.(html|js|css|json|webmanifest)$/.test(p);
const otaAt={};
async function otaFetch(r,m,ms){
  if(m&&otaAt[r.url]&&Date.now()-otaAt[r.url]<18e5)return null;otaAt[r.url]=Date.now();
  try{const u=new URL(r.url),ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),ms||20000);
    const res=await fetch(remoteOf(r.url),{cache:'no-cache',signal:ctl.signal});clearTimeout(t);
    if(!res||res.status!==200)return null;
    const ct=res.headers.get('content-type')||'',pth=u.pathname,isHtml=pth.endsWith('/')||pth.endsWith('.html');
    if(!isHtml&&/text\/html/i.test(ct))return null;
    const txt=await res.clone().text();
    if(isHtml){if(txt.indexOf('js/boot.js')<0)return null}else if(/\.(js|css)$/.test(pth)){if(txt.trimStart().charAt(0)==='<')return null}
    else if(/\.(json|webmanifest)$/.test(pth)){const c=txt.trimStart().charAt(0);if(c!=='{'&&c!=='[')return null}
    let diff=true;if(m){try{diff=(await m.clone().text())!==txt}catch(_){}}
    if(diff){const c=await caches.open(VERSION);await c.put(r,res.clone());
      if(m&&!otaTold){otaTold=true;const l=await self.clients.matchAll({type:'window',includeUncontrolled:true});l.forEach(c=>{try{c.postMessage({type:'dani-update'})}catch(_){}})}}
    return res}catch(_){return null}}
async function otaHandle(e){
  const r=e.request,u=new URL(r.url),ver=/\.(js|css)$/.test(u.pathname)&&/[?&]v=/.test(u.search);
  let m=await caches.match(r);if(!m&&r.mode==='navigate')m=await caches.match(r,{ignoreSearch:true});
  if(m){if(isTextPath(u.pathname)&&!ver)e.waitUntil(otaFetch(r,m));return m}
  if(isTextPath(u.pathname)){const x=await otaFetch(r,null,8000);if(x)return x}
  try{const l=await fetch(r);if(l&&l.status===200)return l}catch(_){}
  return (await caches.match(r,{ignoreSearch:true}))||(await caches.match('index.html'))||Response.error()}
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  if(OTA){e.respondWith(otaHandle(e));return}
  /* سریع‌باز: اول از حافظه‌ی گوشی جواب بده، هم‌زمان در پس‌زمینه تازه بگیر (دفعه‌ی بعد تازه است). اگر هنوز در حافظه نبود، از شبکه. */
  e.respondWith(caches.match(r).then(m=>m||(r.mode==='navigate'?caches.match(r,{ignoreSearch:true}):0)).then(m=>{
    const net=fetch(r).then(res=>{
      if(res&&res.status===200){const cp=res.clone();caches.open(VERSION).then(c=>c.put(r,cp)).catch(()=>{});
        if(m&&r.mode==='navigate'){const a=m.headers.get('etag')||m.headers.get('last-modified'),b=res.headers.get('etag')||res.headers.get('last-modified');
          if(a&&b&&a!==b)self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>l.forEach(c=>{try{c.postMessage({type:'dani-update'})}catch(_){}}))}}
      return res});
    if(m){e.waitUntil(net.catch(()=>{}));return m}
    return net.catch(()=>caches.match(r,{ignoreSearch:true}).then(x=>x||caches.match('index.html')))
  }));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{
    for(const c of l){try{c.postMessage({type:'dani-notif-click',tag:(e.notification.data&&e.notification.data.tag)||''})}catch(_){}}
    for(const c of l){if('focus' in c)return c.focus()}
    return self.clients.openWindow('./');
  }));
});
