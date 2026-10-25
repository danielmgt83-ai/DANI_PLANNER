// DANI · android-shell/apply.mjs
// دو مرحله دارد (توسط .github/workflows/build-android.yml صدا زده می‌شود؛ نیازی نیست دستی اجرا کنی):
//   node apply.mjs prepare  → پوشه‌ی www و تنظیمات را آماده می‌کند (حالت live یا bundled)
//   node apply.mjs android  → بعد از «npx cap add android»: مجوزها، صداها و آیکون‌ها را به پروژه‌ی اندروید اضافه می‌کند
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const step = process.argv[2];
const mode = (process.env.DANI_MODE || 'live').toLowerCase();
const LIVE_URL = 'https://danielmgt83-ai.github.io/DANI_PLANNER/';

function prepare() {
  const www = path.join(here, 'www');
  fs.rmSync(www, { recursive: true, force: true });
  fs.mkdirSync(www, { recursive: true });
  const cfgPath = path.join(here, 'capacitor.config.json');
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  cfg.server = cfg.server || {};
  if (mode === 'bundled') {
    const items = ['index.html', 'manifest.webmanifest', 'sw.js', 'dani.css', 'skins.css', 'themes-itachi.css', 'themes-eren.css', 'themes-aot.css', 'js', 'img', 'audio', 'icons'];
    for (const it of items) {
      const src = path.join(root, it);
      if (fs.existsSync(src)) fs.cpSync(src, path.join(www, it), { recursive: true });
      else console.warn('هشدار: پیدا نشد →', it);
    }
    delete cfg.server.url; // برنامه از فایل‌های داخل خودش اجرا می‌شود
    console.log('حالت bundled: فایل‌های سایت داخل برنامه کپی شد.');
  } else {
    cfg.server.url = cfg.server.url || LIVE_URL;
    fs.writeFileSync(path.join(www, 'index.html'),
      '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:sans-serif;background:#080b22;color:#fff;text-align:center;padding:40px">' +
      '<h2>DANI</h2><p>برای بار اول اینترنت لازم است.<br>First launch needs internet.</p>' +
      '<p><a style="color:#8ab4ff" href="' + cfg.server.url + '">باز کردن / Open</a></p></body>');
    console.log('حالت live: برنامه سایت را از', cfg.server.url, 'بارگذاری می‌کند.');
  }
  fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
}

function android() {
  const app = path.join(here, 'android', 'app', 'src', 'main');
  if (!fs.existsSync(app)) throw new Error('پروژه‌ی اندروید پیدا نشد؛ ابتدا «npx cap add android» اجرا شود.');
  // 1) مجوزها
  const mf = path.join(app, 'AndroidManifest.xml');
  let x = fs.readFileSync(mf, 'utf8');
  const perms = ['POST_NOTIFICATIONS', 'SCHEDULE_EXACT_ALARM', 'USE_EXACT_ALARM', 'VIBRATE', 'WAKE_LOCK', 'RECEIVE_BOOT_COMPLETED'];
  const add = perms.filter(p => !x.includes('android.permission.' + p))
    .map(p => '    <uses-permission android:name="android.permission.' + p + '" />').join('\n');
  if (add) {
    if (!x.includes('</manifest>')) throw new Error('AndroidManifest.xml قالب ناشناخته دارد');
    x = x.replace('</manifest>', add + '\n</manifest>');
    fs.writeFileSync(mf, x);
  }
  // 2) صداها، آیکون‌ها و رنگ‌ها (res/ ما روی res/ پروژه کپی می‌شود)
  fs.cpSync(path.join(here, 'res'), path.join(app, 'res'), { recursive: true });
  console.log('مجوزها:', add ? 'اضافه شد' : 'از قبل بود', '| res کپی شد');
}

if (step === 'prepare') prepare();
else if (step === 'android') android();
else { console.error('استفاده: node apply.mjs prepare | android'); process.exit(1); }
