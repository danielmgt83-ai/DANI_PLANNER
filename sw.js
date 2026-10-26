/* DANI service worker
   - روش «اول شبکه، بعد حافظه»: همیشه آخرین فایل‌ها را می‌گیرد، و بدون اینترنت از نسخه‌ی ذخیره‌شده استفاده می‌کند.
   - لیست PRECACHE را با  python3 tools/update-sw.py  دوباره بساز (بعد از اضافه یا حذف فایل).
   - اعلان‌ها: برنامه با showNotification از همین سرویس‌ورکر استفاده می‌کند؛ کلیک روی اعلان برنامه را باز می‌کند. */
const VERSION='dani-v8';
const PRECACHE=["./", "index.html", ".gitignore", "aot-quotes.json", "audio/alarm-default.mp3", "dani.css", "icons/favicon-32.png", "icons/favicon-64.png", "icons/favicon.svg", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon.svg", "img/aot-eren-beach.jpg", "img/aot-eren-eyes.jpg", "img/aot-eren-face.jpg", "img/aot-eren-mikasa-bw.jpg", "img/aot-eren-ocean.jpg", "img/aot-eren-port.jpg", "img/aot-eren-scout-blades.jpg", "img/aot-eren-scout-cloak.jpg", "img/aot-eren-scout-collage.jpg", "img/aot-eren-scout-jacket.jpg", "img/aot-eren-sky.jpg", "img/aot-eren-titan.jpg", "img/aot-erwin-horse.jpg", "img/aot-erwin-manga.jpg", "img/aot-erwin-port.jpg", "img/aot-erwin-sunset.jpg", "img/aot-levi-cape.jpg", "img/aot-levi-jump.jpg", "img/aot-levi-rain.jpg", "img/aot-levi-roof.jpg", "img/aot-mikasa-autumn.jpg", "img/aot-mikasa-blade.jpg", "img/aot-mikasa-duo.jpg", "img/aot-mikasa-odm.jpg", "img/aot-mikasa-scarf.jpg", "img/aot-wings.jpg", "img/ern-p1-d9adbb.jpg", "img/ern-p2-9bf6cd.jpg", "img/itachi-e2-1ebcc0.jpg", "img/itachi-e3-a5c85c.jpg", "img/itachi-f3-d98a25.jpg", "img/itachi-h1-7f74af.jpg", "img/itachi-h2-a1a754.jpg", "img/itachi-h3-29e3ae.jpg", "img/itachi-r1-ec680f.jpg", "img/itachi-r2-0d79e1.jpg", "img/itachi-r3-cbf230.jpg", "img/itachi-r4-bf5374.jpg", "img/itachi-s1-8e549c.jpg", "img/itachi-s2-8ca0a0.jpg", "img/itachi-s3-93be62.jpg", "img/itachi1-d134a5.jpg", "img/itachi2-a1c529.jpg", "img/itachi3-4ae60d.jpg", "img/itachi4-aa38ec.jpg", "img/skin-barcelona-cdb86e.jpg", "img/skin-eren-4b29ec.jpg", "img/theme-barcelona-b1-7363d2.jpg", "img/theme-eren-e1-214a70.jpg", "img/theme-eren-e2-059f20.jpg", "img/theme-uchiha-ua-66b349.jpg", "img/theme-uchiha-ub-a36033.jpg", "img/theme-uchiha-uc-b352e2.jpg", "img/theme-uchiha-ue-1c39e9.jpg", "js/academy.js", "js/boot.js", "js/core.js", "js/courses.js", "js/dashboard-planner.js", "js/data/baked.js", "js/data/du.js", "js/errorlog.js", "js/extensions.js", "js/home-desk.js", "js/home-weekly.js", "js/i18n-extra.js", "js/i18n-late.js", "js/i18n.js", "js/modules-deadlines.js", "js/modules-habits-reminders-quotes.js", "js/native-save.js", "js/notifier.js", "js/quickaccess.js", "js/quotes-data.js", "js/seed.js", "js/sound-notify-backup.js", "js/theme-aot.js", "js/theme-eren.js", "js/theme-studio-export.js", "js/themes-engine.js", "manifest.webmanifest", "skins.css", "themes-aot.css", "themes-eren.css", "themes-itachi.css"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>Promise.all(PRECACHE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith(fetch(r).then(res=>{
    if(res&&res.status===200){const cp=res.clone();caches.open(VERSION).then(c=>c.put(r,cp)).catch(()=>{})}
    return res;
  }).catch(()=>caches.match(r).then(m=>m||caches.match(r,{ignoreSearch:true})).then(m=>m||caches.match('index.html'))));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{
    for(const c of l){try{c.postMessage({type:'dani-notif-click',tag:(e.notification.data&&e.notification.data.tag)||''})}catch(_){}}
    for(const c of l){if('focus' in c)return c.focus()}
    return self.clients.openWindow('./');
  }));
});
