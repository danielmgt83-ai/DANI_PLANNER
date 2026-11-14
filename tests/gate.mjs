// تست دروازه‌ی نسخه (v115): نیاز به playwright؛ اجرا: node tests/gate.mjs
import http from 'http';import fs from 'fs';import path from 'path';import {chromium} from 'playwright';
const ROOT=process.argv[2]||process.cwd();const CUR=/js\/fx\.js\?v=([^"'&\s]+)/.exec(fs.readFileSync(path.join(ROOT,'index.html'),'utf8'))[1];let ver=CUR;
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(new URL(q.url,'http://x').pathname);if(p.endsWith('/'))p+='index.html';const f=path.join(ROOT,p);if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}let d=fs.readFileSync(f);
 if(p==='/index.html'){d=Buffer.from(d.toString().replace('js/fx.js?v='+CUR,'js/fx.js?v='+ver))}
 r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream','Cache-Control':'max-age=600'});r.end(d)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const port=srv.address().port;const origin=`http://localhost:${port}`;
const b=await chromium.launch({args:[]});
const c=await b.newContext();const p=await c.newPage();let ok=true;const log=(n,v)=>{console.log((v?'✅':'❌'),n);if(!v)ok=false};
await p.goto(origin+'/index.html');await p.waitForFunction(()=>!document.getElementById('bootv'),null,{timeout:20000});
const t1=await p.evaluate(()=>performance.now());
await p.waitForTimeout(1500);
const sw=await p.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();return !!(r&&r.active)});log('SW فعال شد',sw);
// splash minimum duration on a normal load
const t0=Date.now();await p.reload();await p.waitForFunction(()=>!document.getElementById('bootv'),null,{timeout:20000});const dt=Date.now()-t0;log('حداقل زمان صفحه‌ی انتظار (~۱٫۸ث) dt='+dt,dt>=1700&&dt<6000);
// new version published
ver='8zz';const t2=Date.now();let navs=0;p.on('framenavigated',f=>{if(f===p.mainFrame())navs++});
await p.reload();await p.waitForFunction(()=>!document.getElementById('bootv'),null,{timeout:20000});const dt2=Date.now()-t2;
const fx=await p.evaluate(()=>document.querySelector('script[src*="js/fx.js"]').getAttribute('src'));
log('نسخه‌ی تازه قبل از ورود: '+fx+' dt='+dt2+' navs='+navs,fx.includes('8zz')&&dt2<9000);
await b.close();srv.close();process.exit(ok?0:1)
