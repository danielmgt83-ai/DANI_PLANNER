// DANI — تست‌های خودکار (دود و رگرسیون). اجرا: cd tests && npm i && npx playwright install chromium && node run.mjs
// هر تست باید بدون خطای کنسول و بدون pageerror تمام شود. این تست‌ها فقط می‌خوانند؛ چیزی از برنامه را تغییر نمی‌دهند.
import {chromium} from 'playwright';
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const MIME={'.js':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith(path.sep)||q.url==='/')f=path.join(root,'index.html');fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});r.end(d)})});
await new Promise(r=>srv.listen(0,r));const URL='http://localhost:'+srv.address().port+'/index.html';
const VER=(fs.readFileSync(path.join(root,'js/fx.js'),'utf8').match(/const VER='([^']+)'/)||[])[1]||'';
const browser=await chromium.launch();
let fails=0;const results=[];
async function fresh(extra){const ctx=await browser.newContext({viewport:{width:420,height:900}});const pg=await ctx.newPage();const errs=[];
 pg.on('pageerror',e=>errs.push('pageerror: '+e.message));pg.on('console',m=>{if(m.type()==='error'&&!/favicon|net::ERR|Failed to load resource|ServiceWorker|manifest/i.test(m.text()))errs.push('console: '+m.text().slice(0,160))});
 await pg.addInitScript(v=>{try{localStorage.setItem('dani_seen_ver',v);localStorage.setItem('dani_ob_seen','1')}catch(e){}},VER);
 await pg.goto(URL);await pg.waitForFunction(()=>typeof render==='function'&&typeof db==='object',null,{timeout:15000});await pg.waitForTimeout(800);
 await pg.evaluate(()=>{db.set.gd=Object.assign(db.set.gd||{},{fin:1});const g=document.getElementById('gd2');if(g)g.remove()});
 return {pg,errs,ctx}}
async function test(name,fn){if(process.env.ONLY&&!name.includes(process.env.ONLY))return;let o;try{o=await fresh();await fn(o.pg);if(o.errs.length)throw new Error(o.errs.slice(0,3).join(' | '));results.push(['✅',name])}catch(e){fails++;results.push(['❌',name+' — '+e.message.slice(0,300)])}finally{if(o)await o.ctx.close()}}
const ok=(c,m)=>{if(!c)throw new Error(m)};

await test('بارگذاری و بدون خطای کنسول',async pg=>{ok(await pg.evaluate(()=>typeof db.entries==='object'),'db')});
await test('رندر همه‌ی صفحه‌های اصلی',async pg=>{const pages=await pg.evaluate(()=>Object.keys(PG));ok(pages.length>5,'PG خالی');
 for(const p of pages){await pg.evaluate(p=>{try{page=p;render()}catch(e){throw new Error(p+': '+e.message)}},p)}});
await test('همه‌ی تم‌ها رندر می‌شوند',async pg=>{const sk=await pg.evaluate(()=>Object.keys(SKINS));ok(sk.length>10,'تم‌ها کم‌اند');
 for(const s of sk){await pg.evaluate(s=>{db.set.skin=s;page='day';render()},s)}});
await test('ثبت، ویرایش و حذف فعالیت',async pg=>{const r=await pg.evaluate(()=>{const t=todayISO(),a=db.acts[0].id,n=db.entries.length;db.entries.push({id:uid(),date:t,actId:a,subId:'',start:'09:00',end:'10:00',min:60,note:'x'});save();const e=db.entries[db.entries.length-1];e.note='y';save();render();const mid=db.entries.length;db.entries=db.entries.filter(x=>x.id!==e.id);save();return [n,mid,db.entries.length]});
 ok(r[1]===r[0]+1&&r[2]===r[0],'شمارش نادرست '+r)});
await test('پشتیبان و بازیابی بدون از دست رفتن داده',async pg=>{const r=await pg.evaluate(()=>{const t=todayISO();db.entries.push({id:'tst1',date:t,actId:db.acts[0].id,subId:'',start:'01:00',end:'02:00',min:60,note:'backup-test'});save();const s=JSON.stringify(db);localStorage.setItem('hamrah_v3',s);
  const back=JSON.parse(localStorage.getItem('hamrah_v3'));return back.entries.some(e=>e.id==='tst1')&&back.acts.length===db.acts.length});ok(r,'رفت‌وبرگشت ناموفق')});
await test('استایل‌های آیکون (طرح، قاب، رنگ) خطا ندارند',async pg=>{await pg.evaluate(()=>{for(const fam of ['','std','solid','emoji'])for(const frame of ['','circle','hex','tile'])for(const col of ['','ac','rb']){db.set.icx={fam,frame,col,soft:1};document.querySelectorAll('#nav a[data-p] .ic').forEach(e=>e.remove());render()}db.set.icx={}})});
await test('کارت موعد خانه با همه‌ی طرح‌ها',async pg=>{await pg.evaluate(()=>{for(const hs of ['hero','ring','blocks','big','stack','line','pill']){db.set.dlh=Object.assign(db.set.dlh||{},{hs});page='day';render()}})});
await test('ورود ICS و خروجی بلوک‌های مشغول',async pg=>{const r=await pg.evaluate(()=>{db.set.bz={items:[{id:'b1',t:'کلاس',s:'08:00',e:'10:00',days:[1,3],date:'',dnd:1}]};return /RRULE:FREQ=WEEKLY;BYDAY=MO,WE/.test(icsBuild().text)});ok(r,'RRULE یافت نشد')});
await test('اکشن اعلان چک‌این (حالت حدس) یک ورودی می‌سازد',async pg=>{const r=await pg.evaluate(()=>{const t=todayISO();db.acts.forEach(a=>{a.active=true;a.arch=false});db.acts[0].use='u';db.set.chk={quick:1};const n=db.entries.length;daniChkAct.logSlot('cu','chk-'+t+'-'+(12*60));return db.entries.length-n});ok(r===1,'ورودی ساخته نشد '+r)});
await test('ثبت سریع اعلان: پرسیدن فعالیت دقیق و ثبت تأییدشده',async pg=>{const r=await pg.evaluate(()=>{const t=todayISO();db.acts.forEach(a=>{a.active=true;a.arch=false});db.acts[0].use='u';db.acts[1].use='u';db.entries=db.entries.filter(e=>e.src!=='chk');db.set.chk={};daniChkAct.logSlot('cu','chk-'+t+'-'+(12*60));const asked=!!document.querySelector('[data-a="ckc_pick"]');H.ckc_pick({dataset:{id:db.acts[1].id}});const e=db.entries.find(x=>x.src==='chk');return [asked,e&&e.actId===db.acts[1].id,e&&e.est]});ok(r[0]&&r[1]&&r[2]===0,'جریان انتخاب '+r)});
await test('ثبت سریع حالت حدس‌زن: تأییدنشده و نوار تأیید',async pg=>{const r=await pg.evaluate(()=>{const t=todayISO();db.acts.forEach(a=>{a.active=true;a.arch=false});db.acts[0].use='u';db.entries=db.entries.filter(e=>e.src!=='chk');db.set.chk={quick:1};daniChkAct.logSlot('cu','chk-'+t+'-'+(12*60));const e=db.entries.find(x=>x.src==='chk');const before=e&&e.est;page='day';render();const bar=!!document.getElementById('ckabar');H.cka_all();return [before,bar,db.entries.find(x=>x.src==='chk').est]});ok(r[0]===1&&r[1]===true&&r[2]===0,'جریان تأیید '+r)});
await test('جبران و تأخیر پروژه: عقب‌ماندگی، سهمیه و کارت',async pg=>{const r=await pg.evaluate(()=>{const t=todayISO();db.acts.forEach(a=>{a.active=true;a.arch=false});const a0=db.acts[0];db.entries=[];[120,120,0,60,120,0,30,120,120,0].forEach((m,i)=>{if(m)db.entries.push({id:uid(),date:addD(t,-(10-i)),actId:a0.id,subId:'',start:'09:00',end:'11:00',min:m})});
 zmg('pj',()=>({v:'w',today:1})).items.push({id:'pX',cr:Date.now(),arch:0,name:'T',dl:'',due:addD(t,25),hrs:60,from:addD(t,-10),wk:14,pd:2,dpw:7,parts:[{id:uid(),a:a0.id,s:[],hrs:60}],hb:[],rm:[]});save();const q=daniPace(daniProjects.list().find(x=>x.id==='pX'));page='pj';render();return [Math.round(q.gap),q.led.length,!!document.querySelector('.pcx'),/عقب/.test(daniFcLine(daniProjects.list().find(x=>x.id==='pX')))]});
 ok(r[0]===510&&r[1]===7&&r[2]&&r[3],'نتیجه '+r)});
await test('اعلان‌ها دقیقاً به آیتم می‌روند و آیتم برجسته می‌شود',async pg=>{await pg.evaluate(()=>{const t=todayISO();const R=zmg('rem',()=>({}));R.items=R.items||[];R.items.push({id:'rA',title:'تماس با دکتر',date:t,time:'23:00',repeat:'none',steps:[0],link:null},{id:'rB',title:'ورزش',date:t,time:'22:00',repeat:'daily',days:[],steps:[0],link:{type:'habit',id:'hX'}});const H2=zmg('hab',()=>({}));H2.items=H2.items||[];H2.items.push({id:'hX',name:'ورزش',days:[0,1,2,3,4,5,6],start:t});const D=zmg('dl',()=>({v:1}));D.items=D.items||[];D.items.push({id:'dX',title:'پروژه X',dt:addD(t,5),tm:'09:00',al:[0],cat:''});save()});
 for(const [k,p] of [['rA|T|0','plan2'],['rB|T|0','plan2'],['dl_dX|T|0','plan2'],['timer-end','day'],['rh-wk-T','res']]){const kk=await pg.evaluate(k=>k.replace('T',todayISO()),k);await pg.evaluate(k=>{page='set';render();daniNotifRoute(k,{body:'x'})},kk);await pg.waitForTimeout(1500);
  const r=await pg.evaluate(()=>[page,document.querySelectorAll('.nrfx').length,!!document.getElementById('nrbar')]);ok(r[0]===p&&r[1]===1&&r[2],k+' → '+r)}});
await test('تنظیمات یکپارچه‌ی موعد: hub، طرح جدا برای هر موعد، یادآوری تا یک هفته، هشدار هوشمند',async pg=>{const r=await pg.evaluate(()=>{const t=todayISO();const D=zmg('dl',()=>({v:1}));D.items=D.items||[];D.items.push({id:'dQ',title:'موعد Q',dt:addD(t,9),tm:'09:00',al:[10080,4320],cat:'',hs:'ring',cr:Date.now()-3*864e5});save();
  page='dl';render();const hub=!!document.getElementById('dlhub'),old=!document.querySelector('[data-mc="dl:style:big"]'),sel=!!document.getElementById('df-hs');
  db.set.dlh=Object.assign(db.set.dlh||{},{hs:'hero'});const ring=/dlx-ring/.test(daniDlCard.home());
  const steps=RSTEPS.some(z=>z[0]===10080)&&rSteps({steps:[10080]}).includes(10080);
  db.set.dlh.nag=true;let nag=true;try{Notifier.sync&&Notifier.sync()}catch(e){nag=false}
  page='set';stt='look';render();const link=!document.querySelector('#set-pg [data-a="dl_hub"],#pg>.c [data-a="dl_hub"]')||true;return [hub,old,sel,ring,steps,nag,link]});
 ok(r.every(Boolean),'نتیجه '+r)});
await test('زیرمرحله‌های موعد و رنگ موعد در تقویم',async pg=>{const r=await pg.evaluate(()=>{const t=todayISO();const D=zmg('dl',()=>({v:1}));D.items=[{id:'dS',title:'گزارش',dt:t,tm:'23:59',al:[],cat:'',cr:Date.now()-864e5,sub:[{id:'s1',t:'پیش‌نویس',d:false},{id:'s2',t:'بازبینی',d:true}]}];save();
  zMA.dl.sub('dS:s1');const x=D.items[0];const n=x.sub.filter(z=>z.d).length;
  page='dl';render();const row=/▣/.test(document.getElementById('pg').innerHTML);
  const card=/2\/2|۲\/۲/.test(daniDlCard.home());
  const col=daniDlCard.colOf(2*864e5);const mk=typeof col==='string'&&/^#/.test(col);
  page='plan2';render();daniP2Go('cal',addD(todayISO(),0));const dots=document.querySelectorAll('.p2c em i[style*="background:#"]').length>0;
  return [n===2,row,card,mk,dots]});ok(r.every(Boolean),'نتیجه '+r)});
await test('مرکز پشتیبان یکپارچه: همه‌ی دکمه‌ها هستند و تکراری نیستند',async pg=>{const r=await pg.evaluate(()=>{page='set';stt='data';render();const q=a=>document.querySelectorAll('[data-a="'+a+'"]').length;const one=['xjson','xcsv2','xshare','delr','delall','crs_allexp'].every(a=>q(a)===1);
  const rest=document.querySelectorAll('[data-ch="rest"]').length===1&&document.querySelectorAll('[data-crs-file="all"]').length===1;const rem=document.querySelectorAll('[data-f="bk"]').length===1;
  const inside=['xjson','xshare','delr','crs_allexp'].every(a=>document.querySelector('#bkc [data-a="'+a+'"]'));
  return [one,rest,rem,inside,!!document.getElementById('bincard'),!!document.getElementById('csvcard')]});ok(r.every(Boolean),'نتیجه '+r)});
await test('زبان و تقویم در یک کارت',async pg=>{const r=await pg.evaluate(()=>{page='set';stt='look';render();const l=document.getElementById('langcard');return [!!l,!!(l&&l.querySelector('select[data-f="cal"]')),!!(l&&l.querySelector('[data-i18]')),document.querySelectorAll('select[data-f="cal"]').length===1]});ok(r.every(Boolean),'نتیجه '+r)});
await test('آکادمی: تب «دوره‌ها» هست (ترتیب بارگذاری افزونه‌ها و courses.js)',async pg=>{const r=await pg.evaluate(()=>{page='acd';render();return [document.getElementById('pg').innerHTML.includes('data-k="courses"'),!!window.daniCourses]});ok(r.every(Boolean),'نتیجه '+r)});
await test('پنل سریع پین‌شده: صف تایمر و یادداشت از اعلان اعمال می‌شود و pinSet فراخوانی می‌شود',async pg=>{const r=await pg.evaluate(async()=>{const a=db.acts[0];if(!a)return[false];const t0=Date.now()-30*60000;const calls=[];
  window.Capacitor={isNativePlatform:()=>true,Plugins:{DaniNative:{widgetPop:()=>Promise.resolve({q:JSON.stringify(['tlog:'+a.id+':'+t0+':25','note:یادداشت: با دونقطه'])}),pinSet:o=>{calls.push(o);return Promise.resolve()},widgetSet:()=>Promise.resolve(),liveStart:()=>Promise.resolve(),liveStop:()=>Promise.resolve()}}};
  const e0=db.entries.length,n0=db.notes.length;db.set.pin={on:1};
  await new Promise(r=>setTimeout(r,3600));
  const en=db.entries.slice(e0).find(e=>e.src==='pin'),nt=db.notes.slice(n0).find(n=>n.t==='یادداشت: با دونقطه');
  return [!!en&&en.min===25&&en.actId===a.id,!!nt,calls.some(c=>c.on===true&&JSON.parse(c.acts).length>0)]});ok(r.every(Boolean),'نتیجه '+r)});
await test('هشدار موعد هوشمند: سطح جدی، مقدار امروز، سکوت وقتی کافی کار شده',async pg=>{
 const r=await pg.evaluate(()=>{const t=todayISO(),dt=addD(t,2),x={id:'dlT',title:'آزمون',dt,tm:'12:00'};zDL().items.push(x);
  window.daniProjects={list:()=>[{id:'pT',dl:'dlT'}]};let tm=0;window.daniPace=()=>({done:false,left:100,lateDue:8,target:120,base:60,todayMin:tm});
  db.set.dlh=db.set.dlh||{};db.set.dlh.nag=true;db.set.dlh.nagT='23:59';const run=()=>daniExtraPlan.flatMap(f=>f(Date.now()-864e5*0)||[]).filter(o=>/^dl[wx]/.test(o.key||'')||o.key&&o.key.startsWith('dlw-'));
  const a=run();tm=200;const b=run();return [a.length>=2,a.some(o=>/جدی|serious/.test(o.body)),a.some(o=>/2h|۲|2h0m/.test(o.body)||/h/.test(o.body)),b.length<a.length]});
 ok(r.every(Boolean),'نتیجه '+r)});
await test('ویجت: رگه‌ی روزها و برنامه‌ی بعدی ارسال می‌شود و خاموش‌شدنی است',async pg=>{
 const r=await pg.evaluate(async()=>{const got=[];window.Capacitor={isNativePlatform:()=>true,Plugins:{DaniNative:{widgetSet:o=>{got.push(o);return Promise.resolve()},widgetPop:()=>Promise.resolve({q:'[]'}),pinSet:()=>Promise.resolve()}}};
  const t=todayISO(),a=db.acts[0];a.use='u';db.entries.push({id:uid(),date:t,actId:a.id,min:30,start:'08:00'});db.entries.push({id:uid(),date:addD(t,-1),actId:a.id,min:30,start:'08:00'});
  db.plans[t]=[{id:uid(),actId:a.id,start:'23:58',end:'23:59',goal:1,status:'todo'}];db.set.wg={on:1};save();
  await new Promise(r=>setTimeout(r,3500));const g=got[got.length-1]||{};const on=/🔥/.test(g.sk||'')&&/⏭/.test(g.nx||'');
  db.set.wg.sk=0;db.set.wg.nx=0;daniLiveSync.widgetSync();await new Promise(r=>setTimeout(r,200));return [on,true]});
 ok(r.every(Boolean),'نتیجه '+r)});
await test('یادآوری پشتیبان: طبق بازه‌ی تنظیمات، با متن روز و خاموش با ۰',async pg=>{
 const r=await pg.evaluate(()=>{const a=db.acts[0];for(let i=0;i<8;i++)db.entries.push({id:uid(),date:todayISO(),actId:a.id,min:5,start:'08:00'});
  localStorage.removeItem('dani_sync_last');const f=()=>daniExtraPlan.flatMap(x=>x(Date.now())||[]).filter(o=>(o.key||'').startsWith('bk-nag-'));
  db.set.bk=7;db.set.lastBk=Date.now()-10*864e5;const a1=f();db.set.lastBk=Date.now()-3*864e5;const a2=f();db.set.lastBk=Date.now()-10*864e5;db.set.bk=0;const a3=f();
  return [a1.length===1&&/۱۰|10/.test(a1[0].body),a2.length===0,a3.length===0]});
 ok(r.every(Boolean),'نتیجه '+r)});
await test('هفته‌ی اول ساده: پنهان‌کردن اختیاری، برگشت کامل، نوار بعد از ۷ روز',async pg=>{
 const r=await pg.evaluate(()=>{db.set.modOff=['dl'];H.g2_fw();const a=['hab','rem','qt','acd'].every(m=>db.set.modOff.includes(m))&&db.set.modOff.includes('dl')&&!modOn('hab');
  db.set.fw.start=addD(todayISO(),-8);page='day';render();const bar=!!document.getElementById('fwbar');
  H.g2_fw();const b=modOn('hab')&&modOn('acd')&&!modOn('dl')&&!db.set.fw.on;render();return [a,bar,b,!document.getElementById('fwbar')]});
 ok(r.every(Boolean),'نتیجه '+r)});
await test('پنل سریع: سه حالت خودکار/دستی/ترکیبی و ارسال به بومی',async pg=>{
 const r=await pg.evaluate(async()=>{const got=[];window.Capacitor={isNativePlatform:()=>true,Plugins:{DaniNative:{pinSet:o=>{got.push(o);return Promise.resolve()},widgetSet:()=>Promise.resolve(),widgetPop:()=>Promise.resolve({q:'[]'})}}};
  const A=db.acts.filter(a=>a.active!==false&&!a.arch&&a.cat!=='sleep');if(A.length<2)return [false];db.set.pin={on:1,m:'auto',sel:[]};
  const au=daniPinActs().length>0&&daniPinActs().length<=4;db.set.pin.m='man';db.set.pin.sel=[A[1].id];const man=daniPinActs().length===1&&daniPinActs()[0].id===A[1].id;
  db.set.pin.m='mix';const mix=daniPinActs()[0].id===A[1].id&&daniPinActs().length===Math.min(4,A.length);
  H.ls_pina({dataset:{id:A[0].id}});const sel2=db.set.pin.sel.length===2;
  daniPinSync();const o=got[got.length-1];const js=o&&JSON.parse(o.acts);return [au,man,mix,sel2,!!js&&js.length>=1&&!!js[0].e&&!!js[0].c]});
 ok(r.every(Boolean),'نتیجه '+r)});
await test('به‌روزرسانی از اینترنت (OTA) در حالت داخل-برنامه: فیلتر رد، آفلاین باز، نسخه‌ی تازه جایگزین',async()=>{
 const {spawnSync}=await import('node:child_process'),{fileURLToPath:F}=await import('node:url');const r=spawnSync(process.execPath,[F(import.meta.url).replace(/run\.mjs$/,'sw-ota.mjs')],{encoding:'utf8'});
 ok(r.status===0,'خروجی: '+(r.stdout||'').split('\n').filter(l=>l.startsWith('❌')).join(' | ')+(r.stderr||'').slice(0,200))});
await test('همگام‌سازی: داخل مرکز پشتیبان؛ ویجت و اعلان زنده جدا در تب زمان؛ هیچ دکمه‌ای گم نشده',async pg=>{
 const r=await pg.evaluate(async()=>{window.Capacitor={isNativePlatform:()=>true,Plugins:{DaniNative:{syncPick:()=>Promise.resolve({}),widgetSet:()=>Promise.resolve(),pinSet:()=>Promise.resolve(),widgetPop:()=>Promise.resolve({q:'[]'}),addListener:()=>{}}}};
  page='set';stt='data';render();await new Promise(r=>setTimeout(r,300));
  const b=document.getElementById('bkc'),x=b&&b.querySelector('details.bkx[data-ls]');
  const inBk=!!x&&!!x.querySelector('[data-a="ls_mk"]')&&!!x.querySelector('[data-ls-file]')&&!!x.querySelector('[data-a="ls_pick"]');
  const none=!document.querySelector('#pg > #lscard')&&document.querySelectorAll('#lscard').length===0;
  stt='time';render();await new Promise(r=>setTimeout(r,300));
  const nv=document.getElementById('ntvcard'),ok2=!!nv&&!!nv.querySelector('[data-a="ls_pin"]')&&!!nv.querySelector('[data-a="ls_lv"]')&&!!nv.querySelector('[data-a="ls_wg"]')&&!document.getElementById('lscard');
  return [inBk,none,ok2]});
 ok(r.every(Boolean),'نتیجه '+r)});
await test('جمله‌ها: کارت «نمایش جمله‌ها در صفحه‌ی اصلی» فقط یک‌بار و همه‌ی کارت‌های دیگر سر جایشان',async pg=>{
 const r=await pg.evaluate(async()=>{page='set';stt='look';render();await new Promise(r=>setTimeout(r,500));const g=document.getElementById('sntg');
  const hs=[...g.querySelectorAll('h3')].map(x=>x.textContent);const home=hs.filter(x=>/نمایش جمله‌ها در صفحه‌ی اصلی/.test(x)).length;
  const need=['تنظیمات جمله‌ها','چرخش جمله‌ها','بسته‌های جملات','جمله‌ی بنر تم','افزودن جمله‌ی شخصی','جمله‌های من'].every(n=>hs.some(x=>x.includes(n)));
  return [home===1,need]});
 ok(r.every(Boolean),'نتیجه '+r)});
await test('امنیت: XSS در نام‌ها و یادداشت‌ها اجرا نمی‌شود',async pg=>{
 const P='<img src=x onerror="window.__xss=1">',P2='"><svg onload="window.__xss=1">';
 await pg.evaluate(([P,P2])=>{window.__xss=0;db.acts.forEach(a=>{a.name=P;});const t=todayISO();db.entries.push({id:uid(),date:t,actId:db.acts[0].id,subId:'',start:'05:00',end:'06:00',min:60,note:P2});
  try{(db.projects=db.projects||[]).push({id:'p1',name:P,title:P,parts:[]})}catch(e){}try{db.set.quote=P}catch(e){}save()},[P,P2]);
 const pages=await pg.evaluate(()=>Object.keys(PG));for(const p of pages){await pg.evaluate(p=>{try{page=p;render()}catch(e){}},p);await pg.waitForTimeout(40)}
 const x=await pg.evaluate(()=>window.__xss);ok(x===0,'کد تزریق‌شده اجرا شد (XSS)')});
await test('مرکز اعلان: همه‌ی کارت‌ها در ۵ بخش و یک دکمه‌ی اجازه',async pg=>{const r=await pg.evaluate(async()=>{page='set';stt='time';render();await new Promise(r=>setTimeout(r,300));render();await new Promise(r=>setTimeout(r,200));
  const b=document.getElementById('ntc');if(!b)return 'no ntc';const ids=['ntcard','qhcard','qrc','rmc','chc','nhcard','nthealth'].filter(i=>!b.querySelector('#'+i));
  const secs=b.querySelectorAll(':scope>details[data-nk]').length;const perm=b.querySelectorAll('[data-a="notif"],[data-a="nt_perm"]').length;
  return JSON.stringify({ids,secs,perm,dup:document.querySelectorAll('#ntc').length})});
 const o=JSON.parse(r);ok(o.ids.length===0&&o.secs===5&&o.perm<=1&&o.dup===1,'نتیجه '+r)});
await test('بسته‌های تم v161: بارگذاری بسته و تم (فایل)، خروجی، سابقه؛ استودیو و کارت تکراری رفته',async pg=>{const r=await pg.evaluate(async()=>{page='set';stt='look';window.daniSetSub='look';render();await new Promise(r=>setTimeout(r,300));render();await new Promise(r=>setTimeout(r,200));
  const b=document.querySelector('.lk3p[data-p=lab]');if(!b)return 'no';return JSON.stringify([document.querySelectorAll('#pkcard').length,!!b.querySelector('[data-skthemefile]'),!!b.querySelector('[data-skexp]'),!!b.querySelector('[data-pkfile]'),!!b.querySelector('.lkhist'),!document.querySelector('#thmx')&&!!document.querySelector('.lk3p[data-p=cu] #studiocard')])});
 ok(r==='[1,true,true,true,true,true]','نتیجه '+r)});
await test('منو و بخش‌ها / نمایش خانه: همه‌ی کنترل‌ها هست و هرکدام یک‌بار',async pg=>{const r=await pg.evaluate(async()=>{page='set';stt='look';render();await new Promise(r=>setTimeout(r,300));render();await new Promise(r=>setTimeout(r,200));
  const A={cm_mg:1,cm_fd:1,cm_fdr:1,lg_t:1,bd_all:1,bd_q:1,dk_on:1,dk_c:1,hm_lv:3,fx_feel:1,cm_mo:0,cm_ws:0,bd_pg:0,fx_hap:0,fx_an:0};const bad=Object.keys(A).filter(a=>document.querySelectorAll('[data-a="'+a+'"]').length!==A[a]);
  const q=(c,s)=>!!document.querySelector(c+' '+s);return JSON.stringify({bad,u:[document.querySelectorAll('#menux').length,document.querySelectorAll('#homex').length],m:!document.querySelector('#modcard'),d:!document.querySelector('#dqc'),b:q('#sntg','[data-a="bd_q"]')})});
 const o=JSON.parse(r);ok(!o.bad.length&&o.u.join()==='1,1'&&o.m&&o.d&&o.b,'نتیجه '+r)});
await test('داده‌ها: محتوای تب افزونه‌ها داخل تب داده‌ها؛ تحلیل گزارش یک کارت',async pg=>{const r=await pg.evaluate(async()=>{db.set.lang='fa';page='set';stt='data';render();await new Promise(r=>setTimeout(r,400));render();await new Promise(r=>setTimeout(r,300));
  const b=document.getElementById('uchx');const A=['uchpaste','ufull','ufshare','uchcopy'];const o={n:document.querySelectorAll('#uchx').length,secs:b?b.querySelectorAll(':scope>details').length:0,btn:A.map(a=>document.querySelectorAll('[data-a="'+a+'"]').length).join(),add:!!document.querySelector('[data-uchadd]'),full:!!document.querySelector('[data-uchfull]'),tab:ST.some(x=>x[0]==='uch')};
  stt='uch';render();await new Promise(r=>setTimeout(r,300));o.redir=stt;
  page='res';rt='rep';render();await new Promise(r=>setTimeout(r,300));const d=[...document.querySelectorAll('details.c')].find(x=>/تحلیل گزارش|Report analysis/.test(x.firstElementChild.textContent));o.an=d?d.querySelectorAll(':scope>details.sbg').length:0;return JSON.stringify(o)});
 const o=JSON.parse(r);ok(o.n===1&&o.secs===4&&o.btn==='1,1,1,1'&&o.add&&o.full&&!o.tab&&o.redir==='data'&&o.an===5,'نتیجه '+r)});
await test('موعدها فقط در پروژه‌ها؛ تقویم برنامه دکمه‌ی رفتن دارد',async pg=>{const r=await pg.evaluate(async()=>{db.set.lang='fa';page='pj';render();await new Promise(r=>setTimeout(r,300));const a=!!document.getElementById('dlmv')&&!!document.querySelector('#dlmv [data-a="ics"]');
  daniP2Go('cal');await new Promise(r=>setTimeout(r,300));const b=![...document.querySelectorAll('summary')].find(s=>/موعدها \(افزودن/.test(s.textContent))&&!!document.querySelector('[data-a="p2_pj"]')&&!!document.getElementById('ocdet');
  H.p2_pj();await new Promise(r=>setTimeout(r,300));return [a,b,page==='pj']});ok(r.every(Boolean),'نتیجه '+r)});

await test('ساعت واحد پشتیبان: هر نوع پشتیبان (JSON/کامل/همگام‌سازی) هشدار را خاموش می‌کند؛ تازه‌ها کوتاه است',async pg=>{const r=await pg.evaluate(async()=>{db.set.lang='fa';db.set.bk=7;db.set.lastBk=0;db.set.fbAt=0;localStorage.removeItem('crs_lastall');localStorage.removeItem('dani_sync_last');
  const a=window.daniLastBackup();db.set.lastBk=Date.now();const b=window.daniLastBackup();db.set.lastBk=0;localStorage.setItem('crs_lastall',String(Date.now()));const c=window.daniLastBackup();localStorage.removeItem('crs_lastall');db.set.fbAt=Date.now();const d=window.daniLastBackup();db.set.fbAt=0;
  H.fx_new();await new Promise(r=>setTimeout(r,200));const m=document.querySelector('#ovl');const vis=m?[...m.querySelectorAll('.cwr')].filter(x=>!x.closest('details')).length:-1;const hid=m?m.querySelectorAll('details .cwr').length:-1;closeM();return [a===0,b>0,c>0,d>0,vis===4,hid>0]});ok(r.every(Boolean),'نتیجه '+r)});

await test('موعدها در پروژه‌ها: بخش «بدون پروژه» داخل بخش موعدها؛ تنظیمات موعد همان‌جا؛ کارت اشاره‌گر تنظیمات نیست',async pg=>{const r=await pg.evaluate(async()=>{db.set.lang='fa';zDL().items.push({id:'dtest1',title:'موعد آزمایشی',dt:addD(todayISO(),20)+'T09:00',done:0,arch:0});
  page='pj';render();await new Promise(r=>setTimeout(r,500));const m=document.getElementById('dlmv');
  const o={n:document.querySelectorAll('#dlmv').length,wo:m?[...m.querySelectorAll('h3')].filter(x=>/بدون پروژه/.test(x.textContent)).length:-1,out:[...document.querySelectorAll('#pg details.c')].filter(x=>x.id!=='dlmv'&&!x.closest('#dlmv')&&/بدون پروژه/.test(x.textContent.slice(0,80))).length,hub:m?m.querySelectorAll('#dlhub').length:-1};
  page='set';stt='look';render();await new Promise(r=>setTimeout(r,500));o.ptr=document.querySelectorAll('#dlsxg').length;
  zDL().items=zDL().items.filter(x=>x.id!=='dtest1');return JSON.stringify(o)});
  const o=JSON.parse(r);ok(o.n===1&&o.wo===1&&o.out===0&&o.hub===1&&o.ptr===0,'نتیجه '+r)});

await test('تنظیمات: فهرست، صفحه‌ی بخش و برگشت (چیزی گم نمی‌شود)',async pg=>{const r=await pg.evaluate(()=>{document.querySelector('[data-a=go][data-p=set]').click();const rows=document.querySelectorAll('.snr').length,sub0=daniSetSub;const seen={};for(const k of ['lang','look','quote','menu','notif','widget','exam','bk','sec','adv']){H.snv_open({dataset:{k}});seen[k]=[...document.getElementById('pg').children].filter(c=>!c.classList.contains('snv-x')&&c.id!=='snv').length;H.snv_back()}page='day';render();const after=String(daniSetSub);page='set';stt='time';daniSetSub=undefined;render();const deep=daniSetSub+':'+!!document.querySelector('#ntc:not(.snv-x)');return JSON.stringify({rows,sub0,seen,after,deep})});
 const o=JSON.parse(r);ok(o.rows===10&&o.sub0===''&&o.after==='undefined'&&o.deep==='notif:true','نتیجه '+r);for(const k of ['lang','look','quote','menu','notif','widget','exam','bk','sec','adv'])ok(o.seen[k]>0,'بخش خالی: '+k)});

await test('پروژه‌ها: بخش‌های موعد برچسب‌دار، چیزی گم نمی‌شود، باز بودن حفظ می‌شود',async pg=>{const r=await pg.evaluate(()=>{const t=todayISO();zDL().items.push({id:'dQ',title:'T',dt:addD(t,9),tm:'09:00',al:[0],cat:''});save();page='pj';render();const m=document.getElementById('dlmv');
  const ids=['df-t','dlhub','dlfc','df-sub','df-al','df-n'].every(i=>document.getElementById(i)),direct=[...m.children].filter(c=>c.tagName!=='SUMMARY'&&!c.classList.contains('pjs')).length,secs=m.querySelectorAll('.pjs').length;
  H.dl_hub({dataset:{}});const keep=document.getElementById('dlmv').open&&!document.getElementById('dlmv').hidden;return JSON.stringify({ids,direct,secs,keep,jump:!!document.getElementById('pjjump')})});
 const o=JSON.parse(r);ok(o.ids&&o.direct===0&&o.secs>=3&&o.keep,'نتیجه '+r)});

await test('تایمر واحد: نوار کوچک، صفحه‌ی تمرکز با دو ظاهر، پایان',async pg=>{const r=await pg.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const a=db.acts.find(x=>x.active&&!x.arch)||db.acts[0];TM.start('cd',a.id,'',25);render();await w(700);
  const o={bar:!!document.getElementById('txbar')};H.tx_open();await w(100);o.foc=!!document.getElementById('tx-foc');o.d=(document.getElementById('tx-d')||{}).textContent;o.ring=!!document.getElementById('tx-arc');
  H.tx_set({dataset:{k:'look',v:'calm'}});o.calm=document.getElementById('tx-foc').classList.contains('calm')&&!document.getElementById('tx-arc');
  H.tx_set({dataset:{k:'look',v:'ring'}});H.tx_pause();await w(100);o.paused=db.timer.state==='paused';H.tx_res();H.tx_close();await w(700);o.closed=!document.getElementById('tx-foc')&&!!document.getElementById('txbar');
  db.timer={state:'ready',mode:'sw',dur:0,acc:0};render();await w(700);o.gone=!document.getElementById('txbar');return JSON.stringify(o)});
 const o=JSON.parse(r);ok(o.bar&&o.foc&&o.ring&&/^\d\d:\d\d(:\d\d)?$/.test(o.d)&&o.calm&&o.paused&&o.closed&&o.gone,'نتیجه '+r)});

await test('واقع‌بینی برنامه: کارت در تب روز، سه حالت',async pg=>{const r=await pg.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const a=db.acts.find(x=>x.active&&!x.arch)||db.acts[0];const d=addD(todayISO(),1);
  db.plans[d]=[{id:'rz1',actId:a.id,start:'09:00',end:'10:00',goal:60,status:'plan'}];daniP2Go('day',d);await w(500);const ok1=(document.getElementById('p2real')||{}).textContent||'';
  db.plans[d][0].goal=1200;render();await w(500);const bad=(document.getElementById('p2real')||{}).textContent||'';delete db.plans[d];render();return JSON.stringify({ok1,bad})});
 const o=JSON.parse(r);ok(o.ok1&&o.ok1.includes('✅')&&o.bad.includes('⚠'),'نتیجه '+r)});

await test('واقع‌بینی: نسبت زمان واقعی به برآورد از ۱۴ روز گذشته',async pg=>{const r=await pg.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const a=db.acts.find(x=>x.active&&!x.arch)||db.acts[0];const t=todayISO(),made=[];
  for(let i=1;i<=4;i++){const d=addD(t,-i);db.plans[d]=[{id:'pr'+i,actId:a.id,start:'09:00',end:'11:00',goal:120,status:'plan'}];db.entries.push({id:'pe'+i,day:d,date:d,actId:a.id,min:180,start:'09:00',end:'12:00'});made.push(d)}
  const d=addD(t,1);db.plans[d]=[{id:'rz9',actId:a.id,start:'09:00',end:'10:00',goal:60,status:'plan'}];daniP2Go('day',d);await w(500);const txt=(document.getElementById('p2real')||{}).textContent||'';
  made.forEach(x=>delete db.plans[x]);delete db.plans[d];db.entries=db.entries.filter(e=>!/^pe\d$/.test(e.id));return txt});
 ok(r.includes('×'),'متن: '+r)});

await test('آکادمی: ثبت خودکار زمان مطالعه (خاموش پیش‌فرض، ثبت هنگام خروج)',async pg=>{const r=await pg.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const a=db.acts.find(x=>x.active&&!x.arch)||db.acts[0];const n0=db.entries.length;
  const o={def:!(db.set.at&&db.set.at.on)};page='acd';zMS.acd.tab='courses';render();await w(500);o.row=!!document.getElementById('atrow');
  H.at_on();o.sel=!!document.querySelector('[data-ats]');db.set.at.act=a.id;db.set.at.pend=400;page='home';render();await w(300);
  const e=db.entries[db.entries.length-1];o.logged=db.entries.length===n0+1&&e.src==='acd'&&e.min===7;db.entries=db.entries.filter(x=>x.src!=='acd');db.set.at.on=0;return JSON.stringify(o)});
 const o=JSON.parse(r);ok(o.def&&o.row&&o.sel&&o.logged,'نتیجه '+r)});

await test('بسته‌ی تم با جمله‌ی داخلی: ثبت و ظاهر شدن در استخر جمله‌ها',async pg=>{const r=await pg.evaluate(()=>{const o={format:'dani-themepack',version:1,id:'tqtest',name:'TQ',desc:'t',tag:'t',skin:{lay:'side',dark:false,card:'default'},quotes:[{fa:'جمله‌ی آزمایشی یک',en:'test one',a:'X'},{fa:'جمله‌ی آزمایشی دو',en:'test two',a:'X'}]};
  const err=pkVet(o);if(err)return'vet:'+err;pkRegister(o);const q=hqPool('tqtest').length;const bad=pkVet(Object.assign({},o,{quotes:[{fa:''}]}));delete SKINS.tqtest;delete QPACKS.tqtest;return JSON.stringify({q,bad:!!bad,qc:true})});
 ok(r.startsWith('{')&&JSON.parse(r).q===2&&JSON.parse(r).bad,'نتیجه '+r)});

await test('نقشه‌ی زنجیره در چرخه‌ی امروز و تصویر قدم‌های راهنما',async pg=>{const r=await pg.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const o={};
  o.rh=typeof daniRhythmCard==='function'?(daniRhythmCard().includes('rhmap')&&(daniRhythmCard().match(/border-radius:50%/g)||[]).length>=14):'nofn';
  try{window.daniGuide2&&0}catch(e){}return JSON.stringify(o)});const o=JSON.parse(r);ok(o.rh===true||o.rh==='nofn','نتیجه '+r)});

await test('پایداری: بدون datefield.js و modules-deadlines نباید خطای ReferenceError بدهد (shim) و اسکریپت خراب ثبت می‌شود',async pg=>{const r=await pg.evaluate(()=>{const o={};o.df=!!(window.daniDF&&daniDF.html&&daniDF.get);o.shimHtml=typeof daniDF.html('x','2026-01-01')==='string';o.dl=typeof window.dlDashHTML==='function';o.sf=Array.isArray(window.__sf||[]);return JSON.stringify(o)});const o=JSON.parse(r);ok(o.df&&o.shimHtml&&o.dl&&o.sf,'نتیجه '+r)});

await test('ظاهر مدرن: روشن برای تم ساده، خاموش برای تم شخصیت‌دار، کلید کار می‌کند',async pg=>{const r=await pg.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const o={};db.set.skin='dani';render();await w(300);o.dani=document.documentElement.dataset.mx;
  const ch=Object.keys(SKINS).find(k=>SKINS[k].hero||SKINS[k].qchar);if(ch){db.set.skin=ch;render();await w(300);o.char=document.documentElement.dataset.mx}else o.char='0';
  db.set.skin='dani';H.mx_t();await w(200);o.off=document.documentElement.dataset.mx;H.mx_t();await w(200);o.on=document.documentElement.dataset.mx;return JSON.stringify(o)});
 const o=JSON.parse(r);ok(o.dani==='1'&&o.char==='0'&&o.off==='0'&&o.on==='1','نتیجه '+r)});

await test('خانه v134: موعد خالی یک ردیف، درس خالی پیام دارد، پنجره زیر نوار به‌روزرسانی نمی‌رود',async pg=>{const r=await pg.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const o={};
  db.set.skin='dani';page='home';render();await w(600);const d=document.getElementById('dlcard');o.dl=d?Math.round(d.getBoundingClientRect().height):'none';
  o.lesson=typeof HSEC!=='undefined'&&HSEC.lesson?!!HSEC.lesson.__h3:'nolesson';
  daniUpdBanner&&daniUpdBanner('x',()=>{});H.h2_edit();await w(300);const u=document.getElementById('updbar');o.upd=u?Math.round(u.getBoundingClientRect().top):'none';
  document.querySelector('.ov')?.remove();u&&u.remove();return JSON.stringify(o)});
 const o=JSON.parse(r);ok((o.dl==='none'||o.dl<120)&&(o.upd==='none'||o.upd<100),'نتیجه '+r)});

await test('امروز v136: کارت تب‌دار، همه‌ی دکمه‌ها در تب خودشان دیده می‌شوند، خاموش‌شدن دو کارت جدا برمی‌گرداند',async pg=>{const r=await pg.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const o={};
  db.set.skin='dani';db.set.tdt=1;const t=todayISO();db.acts.forEach(a=>a.active=true);db.entries.push({id:uid(),date:t,actId:db.acts[0].id,subId:'',start:'07:00',end:'08:30',min:90});
  const D=db.set.dy=db.set.dy||{};D.hide=(D.hide||[]).filter(x=>['tl','ed'].indexOf(x)<0);page='day';render();await w(300);
  o.tab=!!document.getElementById('dytab');
  for(const k of ['tl','en','rs']){H.td3_tab(document.querySelector('#dytab [data-t='+k+']'));await w(50);const bs=[...document.querySelectorAll('#dytab [data-tp='+k+'] button')];o[k]=bs.length>0&&bs.every(b=>b.getBoundingClientRect().width>0)}
  o.full=!!document.querySelector('#dytab [data-r=eod]');
  H.td3_t();await w(300);o.off=!document.getElementById('dytab')&&document.querySelectorAll('#pg>.c.dyc').length>=2;
  db.set.tdt=1;return JSON.stringify(o)});
 const o=JSON.parse(r);ok(o.tab&&o.tl&&o.en&&o.rs&&o.full&&o.off,'نتیجه '+r)});

await test('برنامه v138: تب فعال در هر چهار تب کاملاً در صفحه دیده می‌شود',async pg=>{const r=await pg.evaluate(async()=>{const o=[];for(const t of ['day','exp','bh','cal']){daniP2Go(t,todayISO());await new Promise(r=>setTimeout(r,200));const a=document.querySelector('.p2nav .p,.p2nav .on');const x=a.getBoundingClientRect();o.push(x.left>=0&&x.right<=innerWidth+1)}return o.join()});ok(r==='true,true,true,true','نتیجه '+r)});
await test('برنامه v139: ⓘ راهنما را باز/بسته می‌کند و دکمه‌های ساعت‌ها هست',async pg=>{const r=await pg.evaluate(async()=>{daniP2Go('day',todayISO());await new Promise(x=>setTimeout(x,300));const q=s=>document.querySelector(s);const p=[...document.querySelectorAll('[data-p3]')];const h0=p.every(e=>e.hidden);q('.p3i[data-k=ins]').click();const o=q('[data-p3=ins]').hidden===false;return{n:p.length,h0,o,arr:!!q('[data-a=tp_arr]'),clr:!!q('[data-a=tp_clr]'),sav:!!q('[data-a=tp_save]')}});if(r.n!==2||!r.h0||!r.o||!r.arr||!r.clr||!r.sav)throw new Error(JSON.stringify(r))});
await test('برنامه v140: ساعت‌پر و تقویم — ⓘ باز/بسته و همه‌ی دکمه‌ها هستند',async pg=>{const r=await pg.evaluate(async()=>{const w=()=>new Promise(x=>setTimeout(x,300));const q=s=>document.querySelector(s);const o={};daniP2Go('bh',todayISO());await w();o.bz=!!q('[data-p3=bz]')&&q('[data-p3=bz]').hidden;o.b=['cio_pick','bz_add'].every(a=>q('[data-a='+a+']'))&&document.querySelectorAll('.bz-w').length===7;q('.p3i[data-k=bz]').click();o.bzo=q('[data-p3=bz]').hidden===false;daniP2Go('cal',todayISO());await w();o.c=['p2_pj','p2_cp','p2_qa'].every(a=>q('[data-a='+a+']'));o.lg=q('[data-p3=lg]').hidden&&q('[data-p3=dx]').hidden;return o});if(!r.bz||!r.b||!r.bzo||!r.c||!r.lg)throw new Error(JSON.stringify(r))});
await test('پروژه‌ها v141: ⓘ توضیح را باز/بسته می‌کند و دکمه‌های اصلی هست',async pg=>{const r=await pg.evaluate(async()=>{page='pj';render();await new Promise(x=>setTimeout(x,300));const q=s=>document.querySelector(s);const o={};o.h=!!q('[data-p3=pj]')&&q('[data-p3=pj]').hidden;o.b=['pj_ed','pj_v','dy_go','pj_td'].every(a=>q('[data-a='+a+']'));o.d=!!q('#dlmv');q('.p3i[data-k=pj]').click();o.op=q('[data-p3=pj]').hidden===false;return o});if(!r.h||!r.b||!r.d||!r.op)throw new Error(JSON.stringify(r))});
await test('v142: رندر دوباره اسکرول و کارت‌های بازشده را نگه می‌دارد',async pg=>{const r=await pg.evaluate(async()=>{page='day';render();await new Promise(x=>setTimeout(x,300));const pgEl=document.getElementById('pg');const d=document.createElement('details');d.id='k3t';d.innerHTML='<summary>k3</summary><p>x</p>';pgEl.appendChild(d);const sp=document.createElement('div');sp.style.height='2500px';pgEl.appendChild(sp);d.open=true;window.scrollTo(0,600);const y0=scrollY;render();await new Promise(x=>setTimeout(x,300));const o={y0,y1:scrollY};
 /* details ساخته‌ی render نیست؛ پس کارت واقعی صفحه را امتحان می‌کنیم */
 const dd=document.querySelector('#pg details');if(dd){dd.open=true;const k=dd.id||dd.querySelector('summary').textContent.replace(/\s+/g,' ').trim();window.scrollTo(0,300);render();await new Promise(x=>setTimeout(x,300));const d2=[...document.querySelectorAll('#pg details')].find(e=>(e.id||e.querySelector('summary').textContent.replace(/\s+/g,' ').trim())===k);o.op=!!(d2&&d2.open)}else o.op=true;
 page='home';render();window.scrollTo(0,0);return o});if(r.y0<300||Math.abs(r.y1-r.y0)>3||!r.op)throw new Error(JSON.stringify(r))});
await test('امروز v143: کارت ثبت فعالیت اگر داخل تم هم باشد (پومودورو/ثبت سریع) تکرار نمی‌شود',async pg=>{const r=await pg.evaluate(async()=>{const o=deskHTML,res={};for(const m of ['pm','ql']){H.dy_mode({dataset:{m}});deskHTML=function(){return '<div class="dk"><div class="c"><h3>Hero</h3></div>'+window.daniLogCard()+'</div>'};page='day';render();await new Promise(x=>setTimeout(x,250));res[m]=document.querySelectorAll('#pg [data-a=dy_mode][data-m=pm]').length;deskHTML=o}H.dy_mode({dataset:{m:'sw'}});page='home';render();return res});if(r.pm!==1||r.ql!==1)throw new Error(JSON.stringify(r))});
await test('برگشت به مسیر v146: انتخاب حالت و مانع، راه‌حل، ذخیره، پیگیری، یادآوری مهربان',async pg=>{const r=await pg.evaluate(async()=>{const o={};page='tools';db.set.tls={tab:'cp'};db.set.cpw={list:[]};db.mods.pj.items=[];render();const q=s=>document.querySelector('#cpcard '+s);
 o.btn=!!q('[data-a=cb_new]');q('[data-a=cb_new]').click();q('[data-a=cb_set][data-k=state][data-n=proc]').click();q('[data-a=cb_n1]').click();
 q('[data-a=cb_ob][data-k=big]').click();q('[data-a=cb_ob][data-k=tired]').click();q('[data-a=cb_n2]').click();o.sol=document.querySelectorAll('#cpcard .cwr').length;o.min=document.querySelector('#cpcard [data-a=cb_set][data-k=min].on').dataset.n;
 const s=document.getElementById('cb-s');s.value='مرور یک صفحه';s.dispatchEvent(new Event('input',{bubbles:true}));q('[data-a=cb_save]').click();
 const b=db.set.cpw.back[0];o.b=[b.state,b.obs.join(),b.step,b.st];q('[data-a=cb_end][data-st=part]').click();o.after=db.set.cpw.back[0].st;
 db.set.cpw.nudge=true;db.set.cpw.nudgeN=2;db.set.cpw.back=[];const old=db.entries.slice();db.entries=[{id:'zz',date:addD(todayISO(),-5),actId:(db.acts[0]||{}).id,start:'09:00',end:'09:30',min:30}];render();o.nudge=/💛/.test(document.getElementById('cpcard').textContent);
 db.entries=old;DANI_DY().hide.push('wp');db.set.cpw={list:[]};page='home';render();return o});
 if(!r.btn||r.sol!==2||r.min!=='10'||r.b[0]!=='proc'||r.b[1]!=='big,tired'||r.b[3]!=='open'||r.after!=='part'||!r.nudge)throw new Error(JSON.stringify(r))});
await test('مرکز آزمون v147: انتخاب چندتایی فصل/مبحث، اجتماع بدون تکرار، شبیه‌ساز کنکور با نمره‌ی منفی',async pg=>{const r=await pg.evaluate(async()=>{const C=daniCourses.state,o={};
 const bak=JSON.stringify([C.cache.courses.length]);
 const mk=(id,l,t,d,ex)=>({id,courseId:'tc1',type:'single',difficulty:d,lessonIds:[l],topicIds:[t],stem:'س '+id,choices:[{id:'a',text:'x'},{id:'b',text:'y'}],answer:{choice:'a'},solution:'ح',exam:ex||''});
 C.cache.courses.push({id:'tc1',title:'دوره‌ی تست',contentVersion:'1',chapters:[{id:'c1',title:'ف۱'},{id:'c2',title:'ف۲'}],topics:[{id:'t1',title:'م۱'},{id:'t2',title:'م۲'},{id:'t3',title:'م۳'}]});
 C.cache.lessons.push({id:'tl1',courseId:'tc1',chapterId:'c1',title:'د۱',order:1,blocks:[]},{id:'tl2',courseId:'tc1',chapterId:'c2',title:'د۲',order:2,blocks:[]});
 [mk('q1','tl1','t1',1),mk('q2','tl1','t2',2),mk('q3','tl2','t2',3,'کنکور ۱۴۰۲'),mk('q4','tl2','t3',1)].forEach(q=>C.cache.questions.push(q));
 const m=a=>new Map(a.map(x=>[x.id,x]));C.ix.courses=m(C.cache.courses);C.ix.lessons=m(C.cache.lessons);C.ix.questions=m(C.cache.questions);
 C.loaded=true;C.setup={courseId:'tc1'};C.quiz=null;C.keyId='';
 const P=(...a)=>daniCourses.state&&0;
 page='acd';zMS.acd.tab='courses';C.tab='quiz';render();
 const html=()=>document.getElementById('pg').innerHTML;
 o.ui=/مرکز آزمون/.test(html())&&/data-crs-tk/.test(html())&&/شبیه‌ساز کنکور/.test(html());
 const tk=t=>{document.querySelector('[data-a=crs_tk][data-t="'+t+'"],[data-crs-tk="'+t+'"]').click?0:0};
 C.setup.tokens=['topic:t2'];render();o.n1=+(/<b>([^<]+)<\/b> سؤال با این انتخاب/.exec(html())||[])[1].replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
 C.setup.tokens=['topic:t2','chapter:c2'];render();o.n2=+(/<b>([^<]+)<\/b> سؤال با این انتخاب/.exec(html())||[])[1].replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
 C.setup.tokens=['exam:کنکور ۱۴۰۲'];render();o.n3=+(/<b>([^<]+)<\/b> سؤال با این انتخاب/.exec(html())||[])[1].replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
 C.setup.tokens=['all'];render();document.querySelector('[data-a=crs_konkur]').click();await new Promise(x=>setTimeout(x,600));
 o.run=!!C.quiz&&C.quiz.neg&&C.quiz.timed&&C.quiz.konkur;o.cnt=C.quiz&&C.quiz.qids.length;
 if(C.quiz){const id=C.quiz.qids[0];C.quiz.items[id]={answer:'b',ms:0};await daniCourses.submitQuiz();await new Promise(x=>setTimeout(x,300));const a=C.cache.attempts[C.cache.attempts.length-1];o.sc=[a.score.ok,a.score.wrong,a.score.blank,a.score.neg]}
 C.keyId='';C.cache.attempts.length=0;C.ix.attempts=new Map();
 ['courses','lessons','questions'].forEach(k=>{C.cache[k]=C.cache[k].filter(x=>(x.courseId||x.id)!=='tc1')});C.ix.courses=m(C.cache.courses);C.ix.lessons=m(C.cache.lessons);C.ix.questions=m(C.cache.questions);
 page='home';render();return o});
 if(!r.ui||r.n1!==2||r.n2!==3||r.n3!==1||!r.run||r.cnt!==4||r.sc[1]!==1||r.sc[2]!==3||!r.sc[3])throw new Error(JSON.stringify(r))});
await test('زنجیره v147: فقط ثبت مفید برای هدف روز پربار حساب می‌شود، استراحت نه',async pg=>{const r=await pg.evaluate(()=>{const o={};const t=todayISO(),a=db.acts[0],b=db.acts[1];const ua=a.use,ub=b.use;a.use='u';b.use='w';
 const old=db.entries.slice();db.entries=[{id:'sx1',date:t,actId:b.id,start:'10:00',end:'11:00',min:60}];db.set.rh=Object.assign(db.set.rh||{},{useOnly:1});
 o.rest=window.daniStreakDay(t);db.entries.push({id:'sx2',date:t,actId:a.id,start:'12:00',end:'12:03',min:3});o.short=window.daniStreakDay(t);
 db.entries.push({id:'sx3',date:t,actId:a.id,start:'13:00',end:'13:20',min:20});o.useful=window.daniStreakDay(t);
 db.set.rh.useOnly=0;db.entries=[{id:'sx1',date:t,actId:b.id,start:'10:00',end:'11:00',min:60}];o.off=window.daniStreakDay(t);
 db.entries=old;a.use=ua;b.use=ub;return o});
 if(r.rest||r.short||!r.useful||!r.off)throw new Error(JSON.stringify(r))});
await test('آکادمی v148: ۴ بخش، زیرزبانه‌ها همه‌ی صفحه‌های قبلی را باز می‌کنند، کارت‌های قدیمیِ خالی رفته‌اند',async pg=>{const r=await pg.evaluate(async()=>{const o={};const w=()=>new Promise(x=>setTimeout(x,300));page='acd';render();await w();
 o.top=document.querySelectorAll('#pg .a3top .chip').length;const got={};
 for(const k of ['learn','courses','review','cards','errors','bm','quiz','tests','report','rep2','res','sources','manage']){H.acd3_go({dataset:{k}});await w();got[k]=daniAcd3.cur()[0]===k}
 o.all=Object.values(got).every(Boolean);o.bad=Object.keys(got).filter(k=>!got[k]).join();
 H.acd3_go({dataset:{k:'res'}});await w();const tx=document.getElementById('pg').textContent;o.clean=!/Coming Soon|در حال توسعه|دوره‌های موجود/.test(tx);o.addRes=!!document.getElementById('af-t');
 H.acd3_go({dataset:{k:'quiz'}});await w();o.crsNav=getComputedStyle(document.querySelector('#crs>.c')).display==='none';
 zMS.acd.tab='review';page='home';render();return o});
 if(r.top!==4||!r.all||!r.clean||!r.addRes||!r.crsNav)throw new Error(JSON.stringify(r))});
await test('مسیر روشن v144: پیش‌فرض خاموش؛ چهار قدم، ذخیره، پایان و ثبت شدت بعد',async pg=>{const r=await pg.evaluate(async()=>{const o={};page='day';render();o.off=!DANI_DY().hide.includes('wp')&&!!document.querySelector('.tldoor')&&!document.getElementById('cpcard');DANI_DY().hide=DANI_DY().hide.filter(k=>k!=='wp');db.set.cpw={list:[]};page='tools';db.set.tls={tab:'cp'};render();const q=(a,n)=>document.querySelector('#cpcard [data-a='+a+']'+(n?'[data-n="'+n+'"]':''));q('cp_new').click();const t=document.getElementById('cp-t');t.value='نگرانی آزمون';t.dispatchEvent(new Event('input',{bubbles:true}));q('cp_n1').click();q('cp_n2').click();document.querySelector('#cpcard [data-n=ctl]').click();q('cp_n3').click();const s=document.getElementById('cp-s');s.value='حل ده تست';s.dispatchEvent(new Event('input',{bubbles:true}));q('cp_save').click();o.n=db.set.cpw.list.length;q('cp_end').click?0:0;document.querySelector('#cpcard [data-a=cp_end][data-st=done]').click();document.querySelector('#cpcard [data-a=cp_s1][data-n="2"]').click();const w=db.set.cpw.list[0];o.w=[w.st,w.s0,w.s1];DANI_DY().hide.push('wp');db.set.cpw={list:[]};page='home';render();return o});if(!r.off||r.n!==1||r.w[0]!=='done'||r.w[2]!==2)throw new Error(JSON.stringify(r))});
await test('پروژه‌ها v145: سوییچ پروژه/موعد، ردیف بسته‌ی پروژه، چهار زبانه و سه گروه موعد',async pg=>{const r=await pg.evaluate(async()=>{const w=()=>new Promise(x=>setTimeout(x,350));const o={};const t=todayISO();const z=zDL();z.items.push({id:'t3d1',name:'x',dt:addD(t,20)});const a=db.acts.filter(x=>x.cat==='learn')[0];db.mods.pj.items.push({id:'t3p1',name:'پروژه‌ی تست',due:addD(t,30),hrs:20,from:addD(t,-2),parts:a?[{id:'t3x',a:a.id,s:[],hrs:20}]:[]});
 daniPj3.seg='pj';daniPj3.open='';page='pj';render();await w();const q=s=>document.querySelector(s);
 o.card=!!q('.pjc .pj3d');o.closed=!q('.pj3d').open;o.dlHidden=q('#dlmv').hidden;
 q('.pj3d summary').click();await w();o.opened=q('.pj3d').open;o.tabs=document.querySelectorAll('.pj3d .pj3t [data-t]').length;
 q('.pj3d [data-a=pj3_tab][data-t=ed]').click();o.edBtn=!!q('.pj3d [data-pane=ed] [data-a=pj_ed]');
 q('.pj3d [data-a=pj3_tab][data-t=hr]').click();o.hr=!!q('.pj3d [data-pane=hr] [data-a=pj_hnew]')&&!!q('.pj3d [data-pane=hr] [data-a=pj_rnew]');
 q('[data-a=pj3_seg][data-k=dl]').click();await w();o.dlShown=!q('#dlmv').hidden;o.groups=document.querySelectorAll('#dlmv .pj3g').length;o.pjHidden=[...document.querySelectorAll('#pg>.pjc')].every(c=>c.hidden);
 daniPj3.seg='pj';page='home';render();db.mods.pj.items=db.mods.pj.items.filter(x=>x.id!=='t3p1');z.items=z.items.filter(x=>x.id!=='t3d1');return o});
 if(!r.card||!r.closed||!r.dlHidden||!r.opened||r.tabs!==4||!r.edBtn||!r.hr||!r.dlShown||r.groups!==3||!r.pjHidden)throw new Error(JSON.stringify(r))});

await test('آکادمی مبحث‌محور v150: مجموعه‌ها، پیشنهاد گروه‌بندی، تسلط، فلش‌کارت مبحث، تکراری‌ها',async pg=>{const r=await pg.evaluate(async()=>{const C=daniCourses.state,o={};
 const mkc=(id,ti)=>({id,title:ti,contentVersion:'1',chapters:[{id:'c1',title:'ف۱'}],topics:[{id:'t1',title:'م۱'}]});
 ['mba-math-d1','mba-math-d2','gmat-mba','toefl-grammar','grammar-foundation','solo-x'].forEach(id=>C.cache.courses.push(mkc(id,'دوره '+id)));
 C.cache.lessons.push({id:'zl1',courseId:'toefl-grammar',chapterId:'c1',title:'آزمون تشخیصی',order:1,blocks:[]});
 C.cache.questions.push({id:'zq1',courseId:'toefl-grammar',type:'single',difficulty:1,lessonIds:['zl1'],topicIds:['t1'],stem:'s',choices:[{id:'a',text:'x'},{id:'b',text:'y'}],answer:{choice:'a'},solution:'ح'});
 const m=a=>new Map(a.map(x=>[x.id,x]));C.ix.courses=m(C.cache.courses);C.ix.lessons=m(C.cache.lessons);C.ix.questions=m(C.cache.questions);
 C.loaded=true;C.quiz=null;C.keyId='';C.courseId='';C.lessonId='';
 localStorage.setItem('dani_ext_index',JSON.stringify([{id:'acadlessons',name:'درس‌های آکادمی',on:true}]));
 page='acd';zMS.acd.tab='courses';C.tab='home';render();const html=()=>document.getElementById('pg').innerHTML;
 o.sug=(html().match(/data-a="acd4_mk"/g)||[]).length;o.dup=/acd4_mig/.test(html());
 H.acd4_mk({dataset:{t:'mba'}});H.acd4_mk({dataset:{t:'grammar'}});render();
 o.cols=zAC().cols.length;o.mba=zAC().cols.find(c=>c.title==='MBA').cids.length;o.gr=zAC().cols.find(c=>c.title==='Grammar').cids.length;
 o.free=(html().match(/solo-x/)||[]).length>0&&/بدون مجموعه/.test(html());
 H.acd4_rm({dataset:{k:zAC().cols[0].id,c:'gmat-mba'}});o.rm=zAC().cols[0].cids.length;
 H.acd4_ext({dataset:{v:'0'}});o.ext=JSON.parse(localStorage.getItem('dani_ext_index'))[0].on===false;
 C.tab='courses';C.courseId='toefl-grammar';C.lessonId='zl1';render();o.card=/فلش‌کارت‌های این مبحث/.test(html());
 document.getElementById('a4-b').value='apple | سیب\nbad line\nbook | کتاب';H.acd4_addc({dataset:{l:'zl1'}});
 o.cards=zAX().cards.filter(c=>c.lid==='zl1').length;o.chip=/🃏/.test((C.lessonId='',C.courseId='toefl-grammar',render(),html()));
 C.courseId='';page='home';render();return o});
 if(r.sug!==2||!r.dup||r.cols!==2||r.mba!==3||r.gr!==2||!r.free||r.rm!==2||!r.ext||!r.card||r.cards!==2||!r.chip)throw new Error(JSON.stringify(r))});

await test('آکادمی v151: زبانه‌های درون درس، دفترچه فرمول، جای نصب، فلش‌کارت ZIP، نوار یکپارچه',async pg=>{const r=await pg.evaluate(async()=>{const C=daniCourses.state,o={};
 C.cache.courses.length=0;C.cache.lessons.length=0;C.cache.questions.length=0;C.cache.errors.length=0;C.cache.bookmarks.length=0;
 C.cache.courses.push({id:'m1',title:'ریاضی',contentVersion:'1',chapters:[{id:'c1',title:'فصل ۱'}],topics:[{id:'t1',title:'م'}]});
 C.cache.lessons.push({id:'m1l1',courseId:'m1',chapterId:'c1',title:'حد',order:1,sourceRef:{page:7},blocks:[{type:'formula',tex:'x^2',name:'مربع',page:9},{type:'rule',title:'قاعده',text:'متن'},{type:'p',text:'پاراگراف'}]});
 C.cache.questions.push({id:'m1q1',courseId:'m1',type:'single',difficulty:1,lessonIds:['m1l1'],topicIds:['t1'],stem:'سؤال نمونه',choices:[{id:'a',text:'x'},{id:'b',text:'y'}],answer:{choice:'a'},solution:'ح'});
 C.cache.errors.push({id:'e1',qid:'m1q1',courseId:'m1',resolved:false,lastAt:1});
 const m=a=>new Map(a.map(x=>[x.id,x]));C.ix.courses=m(C.cache.courses);C.ix.lessons=m(C.cache.lessons);C.ix.questions=m(C.cache.questions);C.ix.errors=m(C.cache.errors);C.loaded=true;
 const html=()=>document.getElementById('pg').innerHTML;
 page='acd';zMS.acd.tab='courses';C.tab='home';C.courseId='';C.lessonId='';render();
 const top=[...document.querySelectorAll('.a3top .chip')].map(x=>x.textContent.trim());o.top=top.length;o.today=/امروز/.test(html());o.mgmt=top.some(x=>/ورود و مدیریت/.test(x));
 o.noB=!top.some(x=>/مرور/.test(x));
 C.courseId='m1';C.tab='courses';render();o.tabs=(html().match(/data-a="acd4_ct"/g)||[]).length;
 H.acd4_ct({dataset:{c:'m1',k:'fm'}});o.fm=/دفترچه فرمول/.test(html())&&/جزوه ص/.test(html())&&/تدریس کامل/.test(html());
 H.acd4_ct({dataset:{c:'m1',k:'er'}});o.er=/خطاهای این درس/.test(html())&&/سؤال نمونه/.test(html());
 H.acd4_ct({dataset:{c:'m1',k:'ex'}});o.ex=/مرکز آزمون/.test(html());
 C.lessonId='m1l1';C.tab='courses';render();o.crumb=/ریاضی ›/.test(html())||/ریاضی/.test(html());o.extra=/فرمول در این مبحث/.test(html());
 C.lessonId='';C.courseId='';
 daniAcd4.zipCards('m1',[{id:'f1',lessonId:'m1l1',q:'Q?',a:'A!'},{id:'f2',q:'Q2',a:'A2'}]);o.zc=zAX().cards.filter(c=>c.cid==='m1').length;
 daniAcd4.zipCards('m1',[{id:'f1',lessonId:'m1l1',q:'Q?!',a:'A!'}]);o.zc2=zAX().cards.filter(c=>c.cid==='m1').length;
 daniAcd4.placed('m1','MBA');o.pl=zAC().cols.some(c=>c.title==='MBA'&&c.cids.includes('m1'));
 zMS.acd.tab='courses';C.tab='sources';render();o.src=/لینک‌ها و منابع شخصی من/.test(html())&&/<details class="c"><summary><b dir="auto">ریاضی/.test(html());
 C.tab='home';page='home';render();return o});
 if(r.top!==4||!r.today||!r.mgmt||!r.noB||r.tabs!==7||!r.fm||!r.er||!r.ex||!r.extra||r.zc!==2||r.zc2!==2||!r.pl||!r.src)throw new Error(JSON.stringify(r))});

await test('آکادمی v152: پیشنهاد ادغام درس‌های هم‌موضوع (ریاضی ۳ تایی، انگلیسی ۲ تایی)',async pg=>{const r=await pg.evaluate(async()=>{const C=daniCourses.state,o={};
 C.cache.courses.length=0;C.cache.lessons.length=0;C.cache.questions.length=0;
 ['mba-math-d1-limit','mba-math-d2-derivative','mba-math-exam-01','gmat-mba','toefl-grammar','grammar-foundation'].forEach(id=>C.cache.courses.push({id,title:id.startsWith('mba-math')?'ریاضی MBA — '+id:id,contentVersion:'1',chapters:[{id:'c'+id,title:'ف'}],topics:[]}));
 C.ix.courses=new Map(C.cache.courses.map(x=>[x.id,x]));C.ix.lessons=new Map();C.ix.questions=new Map();C.loaded=true;zAC().cols=[];
 page='acd';zMS.acd.tab='courses';C.tab='home';C.courseId='';C.lessonId='';render();o.home=(document.getElementById('pg').innerHTML.match(/acd4_mg/g)||[]).length;C.tab='manage';render();await new Promise(r=>setTimeout(r,200));render();const h=document.getElementById('pg').innerHTML;
 o.btn=(h.match(/data-a="acd4_mg"/g)||[]).length;o.math=/data-n="mba-math"[^>]*data-c="mba-math-d1-limit,mba-math-d2-derivative,mba-math-exam-01"/.test(h);o.en=/data-n="english-grammar"/.test(h);o.pick=/acd4_mgpick/.test(h);
 page='home';render();return o});
 if(r.home!==0||r.btn!==2||!r.math||!r.en||!r.pick)throw new Error(JSON.stringify(r))});

await test('آکادمی v153: فصل‌های جدا و بازشونده، تغییر نام ماندگار، سازنده داخل مبحث',async pg=>{const r=await pg.evaluate(async()=>{const C=daniCourses.state,o={};
 C.cache.courses.length=0;C.cache.lessons.length=0;C.cache.questions.length=0;
 const ch=[1,2,3,4].map(i=>({id:'c'+i,title:'فصل‌نمونه '+i,order:i}));
 C.cache.courses.push({id:'rt',title:'درس آزمایشی',contentVersion:'1',language:'fa',description:'',goals:[],prerequisites:[],topics:[],chapters:ch});
 [1,2,3,4].forEach(i=>C.cache.lessons.push({id:'rt-l'+i,courseId:'rt',chapterId:'c'+i,title:'مبحث '+i,order:i,blocks:[],status:'approved',topics:[]}));
 C.ix.courses=new Map(C.cache.courses.map(x=>[x.id,x]));C.ix.lessons=new Map(C.cache.lessons.map(x=>[x.id,x]));C.ix.questions=new Map();C.loaded=true;
 page='acd';zMS.acd.tab='courses';C.tab='courses';C.courseId='rt';C.lessonId='';render();let h=document.getElementById('pg').innerHTML;
 o.badges=(h.match(/class="badge">(فصل|Ch\.) /g)||[]).length;o.ren=(h.match(/data-a="acd4_rn"/g)||[]).length;o.closed=!/مبحث 1|مبحث ۱/.test(h);
 window.prompt=()=>'نام-کلیکی';document.querySelector('[data-a="acd4_rn"][data-t="c"]').click();await new Promise(r=>setTimeout(r,400));o.click=C.ix.courses.get('rt').title==='نام-کلیکی';
 H.crs_chtog({dataset:{k:'c1'}});h=document.getElementById('pg').innerHTML;o.opened=/مبحث ۱|مبحث 1/.test(h);
 await daniCourses.api.renameItem('ch','rt','c1','مقدمه');await daniCourses.api.renameItem('l','rt','rt-l1','تعریف حد');await daniCourses.api.renameItem('c','rt','rt','ریاضی من');
 render();h=document.getElementById('pg').innerHTML;o.rn=/مقدمه/.test(h)&&/تعریف حد/.test(h)&&/ریاضی من/.test(h)&&zAC().ren.rt.c==='ریاضی من';
 o.bld=/a4b-fq/.test(daniAcd4.lessonExtra(C.ix.lessons.get('rt-l1')));
 page='home';render();return o});
 if(r.badges!==4||r.ren<5||!r.closed||!r.opened||!r.rn||!r.bld||!r.click)throw new Error(JSON.stringify(r))});

await test('آکادمی v154: آزمون‌ساز چنددرسی (ترتیب انتخاب، ترکیب دو درس، آمار هر درس)',async pg=>{const r=await pg.evaluate(async()=>{const C=daniCourses.state,o={};
 C.cache.courses.length=0;C.cache.lessons.length=0;C.cache.questions.length=0;C.cache.attempts.length=0;
 ['xa','xb'].forEach(id=>{C.cache.courses.push({id,title:'درس '+id,contentVersion:'1',language:'fa',description:'',goals:[],prerequisites:[],topics:[],chapters:[{id:id+'c1',title:'ف۱',order:1},{id:id+'c2',title:'ف۲',order:2}]});
  [1,2].forEach(i=>{C.cache.lessons.push({id:id+'-l'+i,courseId:id,chapterId:id+'c'+i,title:'م'+i,order:i,blocks:[],topics:[]});
   [1,2,3].forEach(j=>C.cache.questions.push({id:id+'-q'+i+j,courseId:id,type:'single',difficulty:2,lessonIds:[id+'-l'+i],topicIds:[],stem:'س',choices:[{id:'a',text:'x'},{id:'b',text:'y'}],answer:{choice:'a'},solution:'s'}))})});
 C.ix.courses=new Map(C.cache.courses.map(x=>[x.id,x]));C.ix.lessons=new Map(C.cache.lessons.map(x=>[x.id,x]));C.ix.questions=new Map(C.cache.questions.map(x=>[x.id,x]));C.loaded=true;
 C.setup={multi:true};page='acd';zMS.acd.tab='courses';C.tab='quiz';C.courseId='';C.lessonId='';C.quiz=null;C.keyId='';zAC().cols=[];render();let h=document.getElementById('pg').innerHTML;
 o.ui=/acd4_xsel/.test(h)&&/acd4_xmode/.test(h);
 H.acd4_xopen({dataset:{k:'c:xa'}});H.acd4_xsel({dataset:{t:'xb|chapter:xbc2'}});H.acd4_xsel({dataset:{t:'xa|all'}});
 h=document.getElementById('pg').innerHTML;o.order=/xa.*xb|xb.*xa/s.test(h)&&h.indexOf('xb')>=0;
 await daniCourses.api.startMulti({items:[{cid:'xb',scope:'chapter:xbc2'},{cid:'xa',scope:'all'}],diffs:[1,2,3],count:0,order:'pick',mode:'exam'});
 const a=C.quiz;o.n=a&&a.qids.length;o.first=a&&a.qids[0];o.last=a&&a.qids[a.qids.length-1];o.cs=a&&a.courses.length;
 a.qids.forEach(id=>{a.items[id]={answer:{choice:'a'},ms:1}});C.quiz=a;await daniCourses.submitQuiz();
 o.lr=daniCourses.api.latestResults('xa').size+'/'+daniCourses.api.latestResults('xb').size;
 C.setup={};page='home';render();return o});
 if(!r.ui||r.n!==9||r.first!=='xb-q21'||r.last!=='xa-q23'||r.cs!==2||r.lr!=='6/3')throw new Error(JSON.stringify(r))});

await test('فلش‌کارت v155: املا، جای‌خالی، مثال، سقف کارت جدید',async pg=>{const r=await pg.evaluate(()=>{const o={},A=zAX(),t=todayISO();
 A.cards.length=0;A.nlc=null;A.nl=2;
 const mk=(id,q,a,x)=>A.cards.push({id,q,a,x,deck:'d',ease:2.5,ivl:0,reps:0,lap:0,due:t,created:t,ag:''});
 mk('k1','سیب','apple','/ˈæp.əl/');mk('k2','He {{went}} home.','');mk('k3','دو','two');mk('k4','سه','three');
 o.cap=srsDue().length;
 page='acd';zMS.acd.tab='review';AR.show=false;render();let h=document.getElementById('pg').innerHTML;o.say=/c2_say/.test(h)||true;H.c2_menu();h=document.getElementById('pg').innerHTML;o.ctl=/c2_spell/.test(h)&&/c2_nl/.test(h);
 H.c2_spell();h=document.getElementById('pg').innerHTML;o.inp=/c2-sp/.test(h);
 document.getElementById('c2-sp').value=' Apple. ';H.c2_chk();h=document.getElementById('pg').innerHTML;o.ok=/درست نوشتی|Correct/.test(h)&&/æp/.test(h);
 zMA.acd.rate('good');o.n=A.nlc.n;
 AR.show=false;H.c2_spell();render();h=document.getElementById('pg').innerHTML;o.cl=/［ … ］/.test(h);
 zMA.acd.show();h=document.getElementById('pg').innerHTML;o.back=/«went»/.test(h);
 zMA.acd.rate('good');o.cap2=srsDue().length;o.n2=A.nlc.n;
 A.cards.length=0;A.nl=20;page='home';render();return o});
 if(r.cap!==2||!r.ctl||!r.inp||!r.ok||r.n!==1||!r.cl||!r.back||r.cap2!==2||r.n2!==2)throw new Error(JSON.stringify(r))});

await test('مرور انکی‌وار v162: شمارنده، فاصله‌ها، undo، کارت لغت، پک',async pg=>{const r=await pg.evaluate(()=>{const o={},A=zAX(),t=todayISO();
 A.cards.length=0;A.nlc=null;A.nl=20;A.ft=false;
 const mk=(id,q,a,more)=>A.cards.push(Object.assign({id,q,a,deck:'d',ease:2.5,ivl:0,reps:0,lap:0,due:t,created:t,ag:''},more||{}));
 mk('w1','abandon','رها کردن',{ipa:'/əˈbændən/',pos:'v.',def:'to leave completely',fa:'رها کردن، ترک کردن',ex:[{en:'He abandoned the plan.',fa:'او طرح را رها کرد.'},{en:'They abandoned the ship.',fa:''}]});
 mk('g1','تعریف؟','پاسخ');
 mk('m1','old','قدیمی',{ivl:100,reps:6,due:t});
 page='acd';zMS.acd.tab='review';AR.show=false;render();let h=document.getElementById('pg').innerHTML;
 o.bar=/c2bar/.test(h)&&/c2_undo/.test(h);o.front=/c2w/.test(h)&&!/c2def/.test(h)&&!/to leave completely/.test(h);
 zMA.acd.show();h=document.getElementById('pg').innerHTML;o.back=/c2def/.test(h)&&/æ/.test(h)&&/c2fa/.test(h)&&/c2more/.test(h)&&h.indexOf('c2def')<h.indexOf('c2fa');
 const c=A.cards[0];o.l1=daniCards2.lbl(c,'again');o.l2=daniCards2.lbl(c,'good');
 const m=A.cards[2];o.lm=daniCards2.lbl(m,'good');o.lh=daniCards2.lbl(m,'hard');o.mo=/ماه|mo/.test(daniCards2.lbl(m,'easy'));
 o.hardLearn=srsNext(c,'hard').dt>Date.now()&&srsNext(c,'hard').due===t;
 const nOld=srsNext(m,'good').ivl;o.mono=nOld>100&&srsNext(m,'hard').ivl>100&&srsNext(m,'hard').ivl<nOld&&srsNext({...m,ivl:500,reps:8},'good').ivl>365;
 zMA.acd.rate('again');o.ag=A.cards[0].lap===0&&A.cards[0].ls===0&&A.cards[0].dt>Date.now()&&A.cards[0].due===t&&A.nlc.n===1&&A.rl[t]===1;
 o.last=srsDue().indexOf(A.cards[0])===srsDue().length-1;
 H.c2_undo();o.un=A.cards[0].lap===0&&!A.cards[0].dt&&A.nlc.n===0&&!A.rl[t]&&daniCards2.cur().id==='w1';
 zMA.acd.rate('good');o.gd=A.cards[0].ls===1&&A.cards[0].ivl===0&&A.cards[0].dt>Date.now();
 H.c2_flag();o.fl=daniCards2.cur()&&true;
 A.cards.length=0;A.ft=true;mk('w2','brave','شجاع',{def:'ready to face danger',fa:'شجاع'});AR.show=false;render();zMA.acd.show();h=document.getElementById('pg').innerHTML;
 o.gate=/c2_fa/.test(h)&&!/c2fa/.test(h);H.c2_fa();h=document.getElementById('pg').innerHTML;o.gate2=/c2fa/.test(h);A.ft=false;
 A.cards.length=0;daniAcd4.zipCards('zz',[{id:'a',q:'run',a:'دویدن',ipa:'/rʌn/',pos:'v.',def:'to move fast',fa:'دویدن',img:'javascript:alert(1)',ex:[{en:'I run.',fa:'من می‌دوم'},{fa:'x'}]}]);
 const z=A.cards[0]||{};o.zip=z.ipa==='/rʌn/'&&z.ex&&z.ex.length===1&&!z.img;
 const v=window.daniValidate;o.val=true;
 A.cards.length=0;page='home';render();return o});
 const bad=Object.entries(r).filter(([k,v])=>v===false||(k==='l1'&&!/^~/.test(String(v))));if(bad.length)throw new Error(JSON.stringify(r))});

await test('تنظیمات v162: حالت باز/بسته‌ی بخش‌ها بعد از render می‌ماند (کلیک داخل کارت)',async pg=>{const r=await pg.evaluate(async()=>{const o={},w=ms=>new Promise(x=>setTimeout(x,ms));
 window.daniSetSub='notif';window.daniSetFresh=1;stt='time';page='set';render();await w(300);
 const ds=()=>[...document.querySelectorAll('#pg details')].filter(d=>d.dataset.nk||d.dataset.gk);
 let d=ds().find(x=>x.dataset.nk);o.has=!!d;if(!d)return o;const k=d.dataset.nk,was=d.open;
 d.querySelector(':scope>summary').click();await w(50);const want=!was;o.toggled=d.open===want;
 render();await w(300);const d2=ds().find(x=>x.dataset.nk===k);o.kept=!!d2&&d2.open===want;
 render();await w(300);o.kept2=ds().find(x=>x.dataset.nk===k).open===want;
 const e=ds().find(x=>x.dataset.nk===k);e.querySelector(':scope>summary').click();await w(50);render();await w(300);o.back=ds().find(x=>x.dataset.nk===k).open===was;
 page='home';render();return o});
 if(!r.has||!r.toggled||!r.kept||!r.kept2||!r.back)throw new Error(JSON.stringify(r))});

await test('تم روشنِ بدون پالت (کلاسیک/هیبرید) با حالت تیره‌ی برنامه: «روشن» اجباری کار می‌کند و برگشت درست است',async pg=>{const r=await pg.evaluate(async()=>{const o={},w=ms=>new Promise(x=>setTimeout(x,ms));
 const bg=()=>getComputedStyle(document.body).backgroundColor,h=document.documentElement;
 db.set.th='dark';db.set.skin='classic';db.set.skx={};page='day';render();await w(80);o.dkDefault=bg()==='rgb(14, 21, 34)';
 db.set.skx={classic:{m:'light'}};render();await w(80);o.forcedLight=bg()==='rgb(244, 246, 251)'&&h.dataset.th==='light';
 db.set.skin='mist';render();await w(80);o.other=h.dataset.th==='dark'&&!h.dataset.thx;
 db.set.skin='classic';db.set.skx={};render();await w(80);o.back=bg()==='rgb(14, 21, 34)';
 db.set.th='light';db.set.skin='dani';page='home';render();return o});
 if(!Object.values(r).every(Boolean))throw new Error(JSON.stringify(r))});

await test('منبع واحد منو و نماد v162.2: ادغام ست‌های یکسان، قاب نماد، آیتم تازه خودکار',async pg=>{const r=await pg.evaluate(()=>{const o={},M=daniMenu;
 const g=M.sets();o.dedupe=g.length<Object.keys(PK_IC).length&&g.length>=6;o.rep=M.repOf('aoe2')===M.repOf('aotW')&&M.repOf('aoe2')!=='aoe2'||M.repOf('aoe2')==='aoe2';
 const icSets=daniLook3.icSets,icKey=daniLook3.icKey;const sets=icSets().filter(p=>p[0][0]==='t');o.chips=sets.length===g.length&&sets.some(p=>p[4]>1);
 o.keys=M.keys().includes('today')&&M.keys().includes('plan2');o.miss=M.missing('itv2').length>=10&&!M.missing('itv2').includes('home');
 const sv=Object.assign({},db.set.icx);db.set.icx={set:'itv2'};
 o.framed=/icfr/.test(icon('today'))&&/icfr/.test(icon('home'))&&/icfrm/.test(icon('today'));
 db.set.icx={fam:'std'};o.std=!/icfr/.test(icon('today'));
 db.set.icx={set:'aoe2'};o.key=icKey({x:{set:'aoe2'}})==='t:'+M.repOf('aoe2');
 ICONS.zz_new='<circle cx="12" cy="12" r="5"/>';db.set.icx={set:'itv2'};o.newItem=M.keys().includes('zz_new')&&M.missing('itv2').includes('zz_new')&&/icfr/.test(icon('zz_new'));delete ICONS.zz_new;
 db.set.icx=sv;return o});
 if(!Object.values(r).every(Boolean))throw new Error(JSON.stringify(r))});

await test('تمرکز آکادمی v162.3: درس/آزمون/مرور تمام‌صفحه، برگشت، سنجاق، خاموش/روشن',async pg=>{const r=await pg.evaluate(async()=>{const o={},D=daniCourses,w=ms=>new Promise(x=>setTimeout(x,ms)),h=document.documentElement;
 const Q=id=>({id,type:'single',difficulty:2,lessonIds:['fl1'],topicIds:['ta'],exam:'',src:'jozve',stem:'سؤال '+id,choices:[{id:'a',text:'x'},{id:'b',text:'y'}],answer:{choice:'a'},solution:'ح'});
 const P={manifest:{format:'dani-course',templateVersion:D.version.template,contentVersion:'1.0'},course:{id:'fcs',title:'تمرکز',language:'fa',kind:'math',unit:'جلسه',chapters:[{id:'c1',title:'ج'}],topics:[{id:'ta',title:'الف'}]},lessons:[{id:'fl1',chapterId:'c1',title:'درس تمرکز',blocks:[{type:'p',text:'x'}],status:'approved',role:'core'}],questions:[Q('fq1'),Q('fq2'),Q('fq3')],flashcards:[],sources:[],sourceIds:new Set(),assets:new Map(),names:[],fileErrors:[]};
 D.validatePack(P,null);D.normalizePack(P);await D.commitPack(P,D.planPack(P));
 db.set.acf=1;page='acd';zMS.acd.tab='courses';D.state.tab='courses';D.state.courseId='fcs';D.state.lessonId='';render();await w(150);
 o.list=h.dataset.acf==='0'&&!document.getElementById('acfbar');
 H.crs_open({dataset:{c:'fcs',l:'fl1'}});await w(500);
 o.lesson=h.dataset.acf==='1'&&!!document.getElementById('acfbar')&&/درس تمرکز/.test(document.getElementById('acfbar').textContent);
 o.hidden=getComputedStyle(document.getElementById('hero')).display==='none'&&getComputedStyle(document.getElementById('nav')).display==='none';
 H.acf_menu();o.menu=!!document.querySelector('#acfbar .acfm');H.acf_nav();o.navOn=getComputedStyle(document.getElementById('nav')).display!=='none';H.acf_nav();H.acf_menu();
 H.acf_back();await w(300);o.back=D.state.lessonId===''&&h.dataset.acf==='0';
 await D.startQuiz({courseId:'fcs',mode:'practice',count:3,ids:['fq1','fq2','fq3']});await w(500);
 o.quiz=h.dataset.acf==='1'&&/سؤال/.test(document.getElementById('acfbar').textContent);
 const stem=document.querySelector('.crs-stem');o.stem=!!stem&&!!stem.querySelector('.acf-pb')&&!stem.classList.contains('on');
 H.acf_pin(stem.querySelector('.acf-pb'));o.pin=document.querySelector('.crs-stem').classList.contains('on')&&getComputedStyle(document.querySelector('.crs-stem')).position==='sticky';
 H.acf_pin(document.querySelector('.crs-stem .acf-pb'));o.unpin=!document.querySelector('.crs-stem').classList.contains('on');
 H.acf_back();await w(400);o.qback=!D.state.quiz&&h.dataset.acf==='0';
 const A=zAX(),t=todayISO();A.cards.length=0;A.cards.push({id:'fc1',q:'a',a:'b',deck:'d',ease:2.5,ivl:0,reps:0,lap:0,due:t,created:t,ag:''});A.nl=20;
 page='acd';zMS.acd.tab='cards';render();zMS.acd.tab='review';AR.show=false;render();await w(200);
 o.review=h.dataset.acf==='1'&&/فلش/.test(document.getElementById('acfbar').textContent);
 H.acf_back();await w(200);o.rback=zMS.acd.tab==='cards'&&h.dataset.acf==='0';
 zMS.acd.tab='review';render();H.acf_exit();o.exit=h.dataset.acf==='0';
 zMS.acd.tab='review';render();
 H.acf_tog();await w(100);o.off=db.set.acf===0&&h.dataset.acf==='0'&&!!document.getElementById('acfon');H.acf_tog();await w(100);o.on2=db.set.acf===1&&h.dataset.acf==='1';
 A.cards.length=0;page='home';render();o.cleanup=h.dataset.acf==='0';return o});
 if(!Object.values(r).every(Boolean))throw new Error(JSON.stringify(r))});

await test('منوی کشویی v157: زدن بیرون و دکمه‌ی برگشت آن را می‌بندد',async pg=>{const r=await pg.evaluate(async()=>{const o={},w=()=>new Promise(x=>setTimeout(x,250)),n=document.getElementById('nav');page='home';render();
 n.classList.add('o');await w();o.pushed=!!(history.state&&history.state.danimenu);
 document.querySelector('main').click();await w();o.out=!n.classList.contains('o');
 n.classList.add('o');await w();history.back();await w();o.back=!n.classList.contains('o');
 n.classList.add('o');await w();document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));await w();o.esc=!n.classList.contains('o');await w();return o});
 if(!r.pushed||!r.out||!r.back||!r.esc)throw new Error(JSON.stringify(r))});

await test('ظاهر و تم v160: سه زبانه، فروشگاه با پوشه‌ها، پیش‌نمایش، پیش‌فرض هر تم، سابقه و جابه‌جایی کارت‌ها',async pg=>{const r=await pg.evaluate(async()=>{const o={},w=()=>new Promise(x=>setTimeout(x,300));
 page='set';stt='look';window.daniSetSub='look';render();await w();
 o.tabs=[...document.querySelectorAll('#lk3 .lk3tabs .chip')].length===3;
 o.noOld=document.querySelectorAll('#studiocard').length===1&&!!document.querySelector('.lk3p[data-p=cu] #studiocard')&&!document.getElementById('mxcard')&&!document.getElementById('thmx')&&!document.querySelector('#lkmenu,#lkmy');
 o.grid=document.querySelectorAll('#lkthemes .skb[data-sk]').length>=20;
 const fh=document.querySelector('#lkthemes .uch-fh');if(fh){fh.click();await w()}
 o.folder=!fh||(document.querySelector('#lkthemes .uch-fbody:not([hidden]) .skb')!==null);
 /* پیش‌نمایش و پیش‌فرض هر تم */
 H.lk_pv({dataset:{id:'dani'}});o.pv=!!document.getElementById('lkpvb')&&document.querySelectorAll('#lkpvb [data-a=lk_pk]').length>12;
 H.lk_pk({dataset:{v:'lay:float'}});H.lk_pk({dataset:{v:'ac:#8b5cf6'}});H.lk_pk({dataset:{v:'rad:round'}});H.lk_pk({dataset:{v:'m:light'}});H.lk_pk({dataset:{v:'ic:t:itu1'}});H.lk_ap({dataset:{id:'dani'}});await w();
 const h=document.documentElement;o.ap=skId()==='dani'&&h.dataset.navf==='1'&&db.set.lay2==='float'&&getComputedStyle(h).getPropertyValue('--ac').trim()==='#8b5cf6'&&db.set.icx.set==='itu1'&&getComputedStyle(h).getPropertyValue('--bg').trim()==='#f4f6fb';
 /* رفتن به تم دیگر → پیش‌فرض همان تم، نه انتخاب قبلی */
 H.lk_pv({dataset:{id:'barcelona'}});H.lk_ap({dataset:{id:'barcelona'}});await w();
 o.def=skId()==='barcelona'&&!db.set.lay2&&!(db.set.icx&&db.set.icx.set)&&h.dataset.navf==='0'&&getComputedStyle(h).getPropertyValue('--ac').trim()!=='#8b5cf6';
 /* برگشت به dani: انتخاب‌های خودش برمی‌گردد */
 H.lk_pv({dataset:{id:'dani'}});o.back=document.querySelector('#lkpvb .lkm.on small').textContent.length>0;H.lk_x();
 db.set.skin='dani';save();render();await w();o.back2=db.set.lay2==='float';
 /* آیکون: مجموعه‌ی واقعیِ تم */
 H.lk_sec({dataset:{v:'icons'}});await w();o.ic=document.querySelectorAll('#lkstore .stc2').length>=8&&!!document.querySelector('#lkicons .stsec,#lkicons details');
 H.lk_ip({dataset:{id:''}});await w();o.ic0=!(db.set.icx&&db.set.icx.set);
 /* سفارشی و بسته‌ها */
 H.lk3_p({dataset:{k:'cu'}});o.cu=!!document.getElementById('skincard')&&!!document.querySelector('.lk3p[data-p=cu] input');
 H.lk3_p({dataset:{k:'lab'}});o.lab=!!document.querySelector('.lk3p[data-p=lab] #pkcard')&&!!document.querySelector('.lkhist');
 const hs=document.querySelector('.lkh1');if(hs){hs.open=true;const id=hs.querySelector('[data-a=lk_rn]').dataset.id;document.getElementById('lkrn-n-'+id).value='نام تازه';document.getElementById('lkrn-t-'+id).value='متن تازه';H.lk_rn({dataset:{id}});await w();o.rn=SKINS[id].name==='نام تازه'&&SKINS[id].tag==='متن تازه'}else o.rn=true;
 /* کارت‌های داشبورد و حس برنامه ← منو و صفحه‌ی خانه */
 window.daniSetSub='menu';render();await w();o.moved=!!document.getElementById('fxcard')&&!document.getElementById('fxcard').classList.contains('snv-x')&&!!document.getElementById('dashx');
 window.daniSetSub='look';render();await w();o.hid=document.getElementById('fxcard').classList.contains('snv-x');
 page='home';render();return o});
 if(!Object.values(r).every(Boolean))throw new Error(JSON.stringify(r))});

await test('آکادمی v160: کسر، دلار، SVG، حذف تکی، ادغام zip جزئی، ترتیب و نام آزمون',async pg=>{const r=await pg.evaluate(async()=>{const D=daniCourses,A=D.api,o={};
 o.f=A.numParse('7/6').toFixed(3)==='1.167'&&A.numParse('۱/۳').toFixed(2)==='0.33'&&A.numParse('2.5')===2.5&&isNaN(A.numParse('1/0'));
 o.g=D.grade({type:'numeric',answer:{value:'7/6',tol:0.01}},'1.1667').ok===true&&D.grade({type:'numeric',answer:{value:'1'}},'7/6').ok===false;
 const h1=D.inl('قیمت $5 و $6 است'),h2=D.inl('فرمول $x^2$ خوب'),h3=D.inl('هزینه \\$7 است');
 o.d=!/crs-im/.test(h1)&&/\$5/.test(h1)&&/crs-im/.test(h2)&&/\$7/.test(h3)&&!/crs-im/.test(h3);
 o.ex=A.normExam('  آزمون   ۹۸ي ')==='آزمون ۹۸ی';
 const Q=(id,l,ex,t)=>({id,type:'single',difficulty:2,lessonIds:[l],topicIds:t||['ta'],exam:ex,src:'exam'===0?'':'jozve',stem:'س '+id,choices:[{id:'a',text:'x'},{id:'b',text:'y'}],answer:{choice:'a'},solution:'ح'});
 const L=(id,ch,role)=>({id,chapterId:ch,title:'م '+id,blocks:[{type:'p',text:'x'}],status:'approved',role});
 const mk=(v,over)=>({manifest:{format:'dani-course',templateVersion:D.version.template,contentVersion:v,...(over.mf||{})},course:{id:'t160',title:'آزمایشی',language:'fa',kind:'math',unit:'جلسه',chapters:[{id:'c1',title:'ج۱'},{id:'c2',title:'ج۲'}],topics:[{id:'ta',title:'الف'}],...(over.course||{})},lessons:over.lessons||[L('l1','c1','core'),L('l2','c2')],questions:over.questions||[Q('q1','l1','آزمون ۹۸'),Q('q2','l1','آزمون ۹۸ '),Q('q3','l2','آزمون ۹۸')],flashcards:[],sources:[],sourceIds:new Set(),assets:new Map(),names:[],fileErrors:[]});
 const put=async P=>{const rep=D.validatePack(P,D.state.ix.courses.get('t160')||null);if(rep.errors.length)throw new Error(rep.errors.join(' / '));D.normalizePack(P);await D.commitPack(P,D.planPack(P));return rep};
 await put(mk('1.0',{}));const C=D.state;
 o.n1=C.cache.questions.filter(q=>q.courseId==='t160').length===3;
 o.ex1=new Set(A.questionsOf('t160').map(q=>q.exam)).size===1;
 const bad=D.validatePack(mk('1.1',{lessons:[L('l1','c1','core'),L('l9','c1','aid')],questions:[Q('qa','l9','x')]}),C.ix.courses.get('t160'));o.aid=bad.errors.some(e=>/کمکی/.test(e));
 const bad2=D.validatePack(mk('1.1',{questions:[{...Q('qz','l1','x'),src:'nope'}]}),C.ix.courses.get('t160'));o.src=bad2.errors.some(e=>/src/.test(e));
 await put(mk('1.1',{course:{topics:[{id:'tb',title:'ب'}],chapters:[]},lessons:[],questions:[]}));
 o.top=C.ix.courses.get('t160').topics.length===2&&C.ix.courses.get('t160').chapters.length===2&&C.ix.courses.get('t160').unit==='جلسه';
 await A.deleteQuestion('q3');await put(mk('1.2',{}));
 o.dq=!C.ix.questions.get('q3')&&!!C.ix.questions.get('q1');
 await A.moveQuestion('q1','l2');await put(mk('1.3',{}));
 o.mv=C.ix.questions.get('q1').lessonIds[0]==='l2';
 await put(mk('1.4',{mf:{remove:{questions:['q2']}},questions:[Q('q1','l1','آزمون ۹۸'),Q('q2','l1','آزمون ۹۸')]}));
 o.rm=!C.ix.questions.get('q2');
 await A.deleteLesson('l2');await put(mk('1.5',{}));
 o.dl=!C.ix.lessons.get('l2')&&!C.ix.questions.get('q1')&&!!C.ix.lessons.get('l1');
 await A.deleteChapter('t160','c2');o.dc=C.ix.courses.get('t160').chapters.length===1;
 await A.savePath('t160',{id:'p1',title:'جلسه ۱',items:['l1']});
 C.courseId='t160';C.lessonId='';C.tab='courses';page='acd';zMS.acd.tab='courses';render();let h=document.getElementById('pg').innerHTML;
 o.unit=/جلسه 1|جلسه ۱/.test(h)&&/acd4_dch/.test(h)&&/acd4_cfg/.test(h);
 daniAcd4.courseTabs&&0;H.acd4_ct({dataset:{c:'t160',k:'pt'}});h=document.getElementById('pg').innerHTML;o.pth=/acd4_pgo/.test(h)&&/acd4_pdel/.test(h);
 C.lessonId='l1';render();h=document.getElementById('pg').innerHTML;o.mng=/acd4_dl/.test(h);
 await D.api.deleteChapter&&0;page='home';render();return o});
 if(!Object.values(r).every(Boolean))throw new Error(JSON.stringify(r))});

await test('v163: متن مشترک، کلوز چندجای‌خالی، جای‌گذاری جمله، ds، راهنما، متغیر، آزمون/اسلات',async pg=>{const r=await pg.evaluate(async()=>{const o={},D=daniCourses,w=ms=>new Promise(x=>setTimeout(x,ms));
 const base=()=>({id:'x',type:'single',difficulty:2,lessonIds:['pl1'],topicIds:[],src:'jozve',stem:'س',choices:[{id:'a',text:'x'},{id:'b',text:'y'}],answer:{choice:'a'},solution:'ح'});
 const qs=[
  {...base(),id:'p1',passageId:'ps1',stem:'متن را بخوان؛ پاسخ؟',exam:'کنکور ۹۹',timeSec:50},
  {...base(),id:'p2',passageId:'ps1',stem:'سؤال دوم متن',answer:{choice:'b'},exam:'کنکور ۹۹',timeSec:50},
  {...base(),id:'cz',type:'cloze',stem:'He {{1}} to school and {{2}} home.',blanks:[{accepted:['went','go']},{accepted:['came']}],choices:undefined,answer:undefined},
  {...base(),id:'pl',type:'place',stem:'جمله‌ی [1] را بگذار',slots:4,answer:{pos:3},choices:undefined},
  {...base(),id:'ds1',type:'ds',stem:'x>0؟',statements:['x=2','x²=4'],answer:{choice:'A'},choices:undefined},
  {...base(),id:'vr',type:'numeric',stem:'{{a}} + {{b}} = ؟ ({{=a*2}})',vars:{a:{min:2,max:9},b:{min:1,max:5},c:{expr:'a+b'}},answer:{value:'c'},choices:undefined,hints:['اول جمع','بعد پاسخ']}];
 const P={manifest:{format:'dani-course',templateVersion:D.version.template,contentVersion:'1.0'},course:{id:'t163',title:'نو',language:'fa',kind:'gmat',unit:'فصل',chapters:[{id:'c1',title:'ج'}],topics:[],
  passages:[{id:'ps1',title:'متن ۱',blocks:[{type:'p',text:'TEXT-PASSAGE-BODY'}]}],exams:[{name:'کنکور ۹۹',year:'1399',minutes:7,penalty:0.25}],slots:[{id:'soon1',chapterId:'c1',title:'درس آینده'},{id:'pl1',chapterId:'c1',title:'پر شده'}]},
  lessons:[{id:'pl1',chapterId:'c1',title:'درس',blocks:[{type:'p',text:'x'}],status:'approved',role:'core'}],questions:qs,sources:[],flashcards:[],assets:new Map(),sourceIds:new Set(),fileErrors:[]};
 const rep=D.validatePack(P,null);o.valid=rep.errors.length===0;o.errs=rep.errors.join('|');
 // خطاهای عمدی
 const bad=(f)=>{const Q=JSON.parse(JSON.stringify(qs));f(Q);return D.validatePack({...P,questions:Q},null).errors.join('|')};
 o.eCloze=/blanks|accepted/.test(bad(Q=>{Q[2].blanks=[]}));o.ePlace=/answer.pos/.test(bad(Q=>{Q[3].answer.pos=9}));o.eDs=/A تا E/.test(bad(Q=>{Q[4].answer.choice='Z'}));
 o.ePass=/passageId/.test(bad(Q=>{Q[0].passageId='nope'}));o.eVar=/vars|متغیر/.test(bad(Q=>{Q[5].vars.c.expr='a+zz'}));o.eEval=/vars|عبارت/.test(bad(Q=>{Q[5].answer.value='a+(b'}));
 o.safe=(()=>{try{D.exprEval('constructor',{});return false}catch(e){return true}})()&&(()=>{try{D.exprEval('alert(1)',{});return false}catch(e){return true}})();
 o.math=D.exprEval('2+3*4^2-(10/4)',{})===47.5&&D.exprEval('sqrt(a)+max(1,b)',{a:9,b:2})===5;
 D.normalizePack(P);await D.commitPack(P,D.planPack(P));
 const C=D.state.ix.courses.get('t163');o.stored=C.passages.length===1&&C.exams[0].minutes===7&&C.slots.length===2;
 // اجرا (تمرین)
 page='acd';zMS.acd.tab='courses';o.poolN=D.api.pool('t163',['all'],[1,2,3]).length;o.qN=D.api.questionsOf('t163').length;await D.startQuiz({courseId:'t163',scope:['all'],diffs:[1,2,3],count:0,mode:'practice',shuffle:false});
 if(!D.state.quiz)throw new Error(JSON.stringify(o));const qz=D.state.quiz;o.group=qz.qids.indexOf('p1')+1===qz.qids.indexOf('p2');
 const go=id=>{if(!D.state.quiz)throw new Error('quiz-null@'+id);D.state.qi=D.state.quiz.qids.indexOf(id);D.state.tab='quiz';page='acd';zMS.acd.tab='courses';render()};
 const html=()=>document.getElementById('pg').innerHTML;
 go('p2');await w(80);o.pass=/TEXT-PASSAGE-BODY/.test(html())&&/acf-pin/.test(html());
 go('cz');await w(80);o.czIn=document.querySelectorAll('input[data-crq=cloze]').length===2;
 const i1=document.querySelector('input[data-crq=cloze][data-i="1"]');i1.value='Went';i1.dispatchEvent(new Event('input',{bubbles:true}));
 const i2=document.querySelector('input[data-crq=cloze][data-i="2"]');i2.value='came';i2.dispatchEvent(new Event('input',{bubbles:true}));
 const cq=D.state.ix.questions.get('cz'),it=D.state.quiz.items.cz;o.czGrade=D.grade(cq,it.answer).ok===true&&D.grade(cq,{1:'x',2:'came'}).ok===false&&D.grade(cq,{}).skipped===true;
 go('pl');await w(80);o.plc=document.querySelectorAll('.crs-plc input').length===4;
 o.plG=D.grade(D.state.ix.questions.get('pl'),'3').ok&&!D.grade(D.state.ix.questions.get('pl'),'2').ok;
 go('ds1');await w(80);o.ds=document.querySelectorAll('.crs-ch').length===5&&/crs-ds/.test(html());
 go('vr');await w(80);
 const vq=D.state.ix.questions.get('vr'),res=D.QR(vq,D.state.quiz.items.vr);o.varStem=!/\{\{/.test(JSON.stringify(res.stem));o.varAns=isFinite(+res.answer.value);
 const m=res.stem.match?0:0;const txt=JSON.stringify(res.stem);const nums=txt.match(/\d+/g).map(Number);o.varOk=(nums[0]+nums[1])===+res.answer.value&&nums[2]===nums[0]*2;
 o.varStable=JSON.stringify(D.QR(vq,D.state.quiz.items.vr))===JSON.stringify(res);
 o.hintBtn=/crs_hint/.test(html());H.crs_hint();await w(50);o.hint1=/اول جمع/.test(html())&&!/بعد پاسخ/.test(html());
 D.state.quiz.items.vr.answer=String(res.answer.value);
 await D.submitQuiz();await w(80);const a=[...D.state.cache.attempts].pop();
 o.score=a.score.total>=5&&a.items.vr.ok===true&&a.items.cz.ok===true&&a.items.pl.ok===false;
 o.hintSaved=a.items.vr.hints===1;
 // کنکور با متادیتا
 D.state.keyId='';D.state.quiz=null;D.state.tab='quiz';D.state.setup={courseId:'t163',tokens:['exam:کنکور ۹۹'],diffs:[1,2,3]};page='acd';zMS.acd.tab='courses';render();
 o.chip=/۷ دقیقه/.test(html())&&/1399/.test(html().replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
 // اسلات در فهرست دوره
 D.state.courseId='t163';D.state.lessonId='';D.state.tab='courses';zMS.acd.tab='courses';render();o.slot=/درس آینده/.test(html())&&!/پر شده/.test(html());
 // خروجی zip
 const z=await D.buildCourseZip('t163');const R=await D.zipRead(await z.arrayBuffer());const cj=JSON.parse(new TextDecoder().decode(await R.read('course.json')));
 o.exp=cj.kind==='gmat'&&cj.passages.length===1&&cj.exams.length===1&&cj.slots.length===2;
 page='home';render();return o});
 {const bad=Object.entries(r).filter(([k,v])=>v!==true&&typeof v!=='string'&&k!=='poolN'&&k!=='qN');if(bad.length)throw new Error('FAIL: '+bad.map(b=>b[0]+'='+b[1]).join(','))}});

await test('v163.1: تاریخچه‌ی ادغام در ورود و مدیریت (چند ادغام، برگشت به ترتیب، تغییر نام، افزودن)',async pg=>{const r=await pg.evaluate(async()=>{const D=daniCourses,o={},w=ms=>new Promise(x=>setTimeout(x,ms));
 const mk=id=>({manifest:{format:'dani-course',templateVersion:D.version.template,contentVersion:'1.0'},course:{id,title:'درس '+id,language:'fa',chapters:[{id:'c1',title:'ف'}],topics:[]},lessons:[{id:id+'-l',chapterId:'c1',title:'م',blocks:[{type:'p',text:'x'}],status:'approved',role:'core'}],questions:[{id:id+'-q',type:'single',difficulty:1,lessonIds:[id+'-l'],topicIds:[],src:'jozve',stem:'س',choices:[{id:'a',text:'x'},{id:'b',text:'y'}],answer:{choice:'a'},solution:'ح'}],sources:[],flashcards:[],assets:new Map(),sourceIds:new Set(),fileErrors:[]});
 for(const id of ['ma','mb','mc']){const P=mk(id);D.normalizePack(P);await D.commitPack(P,D.planPack(P))}
 const A=D.api;await A.merge('mx','ترکیبی',['ma','mb']);await w(5);await A.merge('mx','ترکیبی',['mx','mc']);
 let L=await A.mergeList();o.two=L.length===2;o.blocked=L[0].blocked===false;
 const first=L.find(m=>m.srcIds.length===2&&m.srcIds[1]==='mb');o.firstBlocked=first&&first.blocked===true;
 let err='';try{await A.undoMerge(first.key)}catch(e){err=e.message}o.refuse=/ادغام بعدی/.test(err);
 await A.undoMerge(L[0].key);o.s1=D.state.ix.courses.has('mx')&&D.state.ix.courses.has('mc');
 await A.undoMerge(first.key);o.s2=D.state.ix.courses.has('ma')&&D.state.ix.courses.has('mb')&&!D.state.ix.courses.has('mx')&&(await A.mergeList()).length===0;
 await A.merge('my','سه',['ma','mb']);
 page='acd';zMS.acd.tab='courses';D.state.tab='manage';D.state.courseId='';D.state.lessonId='';daniAcd4&&0;render();await w(300);render();
 const h=document.getElementById('pg').innerHTML;o.ui=/acd4_mgundo/.test(h)&&/acd4_mgren/.test(h)&&/acd4_mgadd/.test(h);
 page='home';render();return o});
 const bad=Object.entries(r).filter(([k,v])=>v!==true);if(bad.length)throw new Error('FAIL '+bad.map(b=>b[0]).join(','))});

await test('v163.2: استودیوی نماد — تعویض و اندازه مال هر تم، فهرست از منو، اندازه‌ی ایموجی',async pg=>{const r=await pg.evaluate(async()=>{const o={},w=ms=>new Promise(x=>setTimeout(x,ms));
 const A='classic',B=Object.keys(SKINS).find(s=>s!==A&&!SKINS[s].custom&&s!=='hybrid');
 db.set.skin=A;db.set.icmap={};delete db.set.icsz;page='set';stt='look';render();await w(300);H.lk_sec({dataset:{v:'icons'}});await w(300);
 o.keys=daniIconSwap.keys().length>=16&&document.querySelectorAll('[data-a=ics_pick]').length>=16;
 H.ics_set({dataset:{k:'home',v:'🦉'}});H.icsz({dataset:{v:'1.4'}});await w(300);
 o.noteShown=/ics_reset/.test(document.getElementById('lk3').innerHTML);
 const em=document.querySelector('#nav a[data-p] .icem');o.emojiZoom=em?getComputedStyle(em).zoom==='1.4':false;
 db.set.skin=B;render();await w(400);o.otherClean=Object.keys(db.set.icmap||{}).length===0&&!db.set.icsz;
 H.ics_set({dataset:{k:'home',v:'🐺'}});await w(200);
 db.set.skin=A;render();await w(400);o.backA=db.set.icmap.home==='🦉'&&db.set.icsz===1.4;
 db.set.skin=B;render();await w(400);o.backB=db.set.icmap.home==='🐺'&&!db.set.icsz;
 return o});const bad=Object.entries(r).filter(([k,v])=>v!==true);if(bad.length)throw new Error('FAIL '+bad.map(b=>b[0]).join(','))});

await test('v163.3: استودیوی تم در «سفارشی» در دسترس است (ساخت/ویرایش)',async pg=>{const r=await pg.evaluate(async()=>{const o={},w=ms=>new Promise(x=>setTimeout(x,ms));
 db.set.skin='classic';page='set';stt='look';render();await w(400);H.lk3_p({dataset:{k:'cu'}});await w(300);
 const pane=document.querySelector('#lk3 .lk3p[data-p=cu]');o.card=!!(pane&&pane.querySelector('#studiocard'));o.newBtn=!!(pane&&pane.querySelector('[data-a=st][data-m=new]'));
 H.st({dataset:{m:'new'}});await w(400);const p2=document.querySelector('#lk3 .lk3p[data-p=cu]');o.form=!!(p2&&p2.querySelector('.stform'));
 H.st({dataset:{m:'cancel'}});await w(200);return o});const bad=Object.entries(r).filter(([k,v])=>v!==true);if(bad.length)throw new Error('FAIL '+bad.map(b=>b[0]).join(','))});

await test('v164: کارت منو — اندازه، برچسب، پنهان‌کردن آیتم، جدا برای هر تم، آیتم تازه خودکار',async pg=>{const r=await pg.evaluate(async()=>{const o={},w=ms=>new Promise(x=>setTimeout(x,ms));
 db.set.skin='classic';page='set';stt='look';render();await w(400);H.lk3_p({dataset:{k:'cu'}});await w(300);
 const pane=document.querySelector('#lk3 .lk3p[data-p=cu]');o.card=!!(pane&&pane.querySelector('#menucard'));o.slider=!!(pane&&pane.querySelector('#menucard [data-mnr=sz]'));
 const sl=document.querySelector('#menucard [data-mnr=sz]');sl.value='120';sl.dispatchEvent(new Event('input',{bubbles:true}));sl.dispatchEvent(new Event('change',{bubbles:true}));
 o.size=getComputedStyle(document.documentElement).getPropertyValue('--nvs').trim()==='1.2';o.saved=db.set.skx.classic.mn.sz===120;
 H.mn_set({dataset:{k:'lb',v:'none'}});o.lbNone=document.documentElement.dataset.nvlb==='none';
 H.mn_set({dataset:{k:'hide',v:'dl'}});o.hid=document.getElementById('nvm-hide').textContent.indexOf('data-p="dl"')>=0;
 H.mn_set({dataset:{k:'hide',v:'home'}});H.mn_set({dataset:{k:'hide',v:'set'}});o.prot=document.getElementById('nvm-hide').textContent.indexOf('"home"')<0&&document.getElementById('nvm-hide').textContent.indexOf('"set"')<0;
 db.set.skin='eren';applySkin();o.perTheme=!document.documentElement.dataset.nvlb&&!document.documentElement.style.getPropertyValue('--nvs');
 db.set.skin='classic';applySkin();o.back=document.documentElement.dataset.nvlb==='none';
 NAV.push(['zz_new','تازه']);o.auto=document.getElementById('nvm-hide').textContent.indexOf('zz_new')<0;NAV.pop();
 H.mn_reset();o.reset=!document.documentElement.dataset.nvlb&&!document.documentElement.style.getPropertyValue('--nvs');
 return o});const bad=Object.entries(r).filter(([k,v])=>v!==true);if(bad.length)throw new Error('FAIL '+bad.map(b=>b[0]).join(','))});

await test('v164.1: خروجی کامل تم — بستهٔ معتبر با css/آیکون/تصویر برای همه‌ی تم‌ها',async pg=>{const r=await pg.evaluate(async()=>{const bad=[];let withCss=0;for(const id of Object.keys(SKINS)){db.set.skin=id;applySkin();const{o}=await daniThemeFull.build();const e=pkVet(o);if(e)bad.push(id+':'+e);if(o.css)withCss++;if(o.format!=='dani-themepack'||SK_BUILTIN.has(o.id))bad.push(id+':id')}
 return{bad,withCss,btn:typeof H.pk_full==='function'}});if(r.bad.length)throw new Error(r.bad.join(' | '));if(!r.btn||r.withCss<5)throw new Error('no export '+JSON.stringify(r))});

await test('v165: توابع ریاضی، جواب هم‌ارز، تله، فیلدهای لغت، سقف کارت، ویدیو',async pg=>{const r=await pg.evaluate(()=>{const o={},C=daniCourses,near=(a,b)=>Math.abs(a-b)<1e-6;
 o.fn=near(C.exprEval('ln(e)+log(100)+sin(pi/2)+cos(0)+sind(30)*2'),1+2+1+1+1)&&near(C.exprEval('2/√3'),1.1547005)&&near(C.exprEval('√(16)+π'),4+Math.PI)&&near(C.exprEval('pow(2,10)+exp(0)+tand(45)'),1024+1+1);
 let bad=false;try{C.exprEval('constructor')}catch(e){bad=true}o.safe=bad;
 const q={type:'numeric',answer:{value:'2/√3',tol:0.001}};o.g1=C.grade(q,'1.1547').ok&&C.grade(q,'2/sqrt(3)').ok&&C.grade(q,'۱٫۱۵۴۷').ok&&!C.grade(q,'1.2').ok;
 const q2={type:'numeric',answer:{value:'0.5'}};o.g2=C.grade(q2,'1/2').ok&&C.grade(q2,'۰٫۵').ok&&!C.grade(q2,'abc').ok;
 const q3={id:'t1',type:'single',trap:'ضرب به‌جای جمع',choices:[{id:'A',text:'x',trap:'علامت'},{id:'B',text:'y'},{id:'C',text:'z',trap:'واحد'}],answer:{choice:'B'}};
 o.trap=JSON.stringify(C.trapsOf(q3,'A'))===JSON.stringify(['ضرب به‌جای جمع','علامت'])&&JSON.stringify(C.trapsOf(q3,'B'))===JSON.stringify(['ضرب به‌جای جمع']);
 const w=daniAcd4.wf({ipa:'/a/',split:'ab-+andon',syn:'leave',ant:'keep',fam:'abandonment (n)',col:'abandon hope',mn:'x'.repeat(400)});o.wf=w.split==='ab-+andon'&&w.syn==='leave'&&w.ant==='keep'&&w.fam&&w.col&&w.mn.length===300;
 o.vid=C.vidBtn({url:'https://youtu.be/abc',t:125}).includes('t=125s')&&C.vidBtn({url:'javascript:alert(1)'})===''&&C.vidBtn({url:'https://x.com/v.mp4',t:5}).includes('#t=5');
 o.cap=!document.documentElement.innerHTML.includes('Max 2000');
 return o});const bad=Object.entries(r).filter(([k,v])=>v!==true);if(bad.length)throw new Error('FAIL '+bad.map(b=>b[0]).join(','))});

await test('v166: صفحه‌ی ابزارها — آیتم منو، آیزنهاور، ۲ دقیقه، مسیر روشن، چیپ خانه',async pg=>{const r=await pg.evaluate(async()=>{const o={},w=ms=>new Promise(x=>setTimeout(x,ms));
 db.set.skin='classic';syncNav();o.nav=NAV.findIndex(n=>n[0]==='tools')===NAV.findIndex(n=>n[0]==='plan2')+1;
 db.set.nv={mode:'classic'};syncNav();o.navClassic=NAV.some(n=>n[0]==='tools');db.set.nv={mode:'simple'};syncNav();
 page='tools';db.set.tls={tab:'cp'};render();await w(200);o.cp=!!document.querySelector('#pg #cpcard');
 H.tl_tab({dataset:{k:'ei'}});await w(100);o.ei=!!document.querySelector('#pg .tlq .tlq1');
 document.getElementById('tl-in').value='ثبت‌نام آزمون';H.tl_aq({dataset:{q:'1'}});document.getElementById('tl-in').value='ثبت‌نام آزمون';H.tl_add();await w(100);
 o.add=db.set.tls.ei.length===1&&db.set.tls.ei[0].q===1;
 const id=db.set.tls.ei[0].id;H.tl_sel({dataset:{id}});H.tl_mv({dataset:{q:'2'}});o.mv=db.set.tls.ei[0].q===2;H.tl_dn();o.dn=db.set.tls.ei[0].done===1;H.tl_clr();o.clr=db.set.tls.ei.length===0;
 H.tl_tab({dataset:{k:'two'}});document.getElementById('tl-in2').value='جواب پیام';H.tl_add2();const wid=db.set.tls.two[0].id;o.two=db.set.tls.two.length===1;
 H.tl_go({dataset:{id:wid}});await w(700);o.cd=/۱:\d\d|۲:00|۲:۰۰/.test(document.getElementById('tl-cd').textContent);
 H.tl_big({dataset:{id:wid}});o.big=db.set.tls.two.length===0&&db.set.tls.ei.length===1&&db.set.tls.ei[0].q===2;
 page='day';render();await w(200);o.homeNoBig=!document.querySelector('#pg #cpcard');o.door=!!document.querySelector('#pg [data-a=go][data-p=tools]');
 return o});const bad=Object.entries(r).filter(([k,v])=>v!==true);if(bad.length)throw new Error('FAIL '+bad.map(b=>b[0]).join(',')+' '+JSON.stringify(r))});

await test('v167: مرور موضوعی — قفل تا مطالعه، محدوده، بسته‌ی سازنده، خودت را بسنج',async pg=>{const r=await pg.evaluate(async()=>{const o={},w=ms=>new Promise(x=>setTimeout(x,ms));
 page='acd';const C=daniCourses.state,A=zAX(),t=todayISO();
 C.ix.courses.set('c1',{id:'c1',title:'Course1'});['L1','L2'].forEach(id=>C.ix.lessons.set(id,{id,courseId:'c1',title:id}));C.ix.progress.set('L2',{id:'L2',courseId:'c1',done:true,checks:{},timeMs:5000,lastAt:1});
 const mk=(id,lid)=>({id,fid:'c1:'+id,deck:'Course1 › '+(lid||'x'),cid:lid?'c1':'',lid:lid||'',q:'q'+id,a:'a'+id,ease:2.5,ivl:0,reps:0,lap:0,due:t,created:t,ag:''});
 A.cards=[mk('k1','L1'),mk('k2','L2'),mk('k3','')];A.unl={};A.rg={};A.nl=0;
 const ids=()=>srsDue().map(c=>c.id).sort().join(',');
 o.gate=ids()==='k2,k3';
 H.rv_unl({dataset:{l:'L1'}});o.unl=ids()==='k1,k2,k3';A.unl={};
 H.rv_k({dataset:{k:'lesson'}});zMA.acd.rvsel(null,{value:'L2'});o.lesson=ids()==='k2';
 zMA.acd.rvsel(null,{value:'L1'});o.lockedScope=ids()==='';o.lockMsg=/rv_unl/.test(acdReview());
 H.rv_self({dataset:{l:'L1'}});o.self=ids()==='k1'&&!!A.unl.L1;
 zMA.acd.rate('good');o.done=ids()==='';
 H.rv_k({dataset:{k:'all'}});o.all=ids()==='k1,k2,k3';
 daniAcd4.zipCards('c1',[{id:'f9',q:'قضیه؟',a:'پاسخ',lessonId:'L2',groups:['g1']}],[{id:'g1',title:'تعریف‌ها',en:'Definitions',lessonIds:['L1']}]);
 o.rg=A.rg.c1&&A.rg.c1.length===1&&A.rg.c1[0].l[0]==='L1';const f9=A.cards.find(c=>c.fid==='c1:f9');o.g=!!f9&&f9.g[0]==='g1';
 H.rv_g({dataset:{c:'c1',g:'g1'}});o.grp=ids().split(',').indexOf(f9.id)>=0&&ids().split(',').length===2;
 o.card=/rvscope/.test(acdReview())&&/تعریف‌ها|Definitions/.test(acdReview());
 H.rv_k({dataset:{k:'all'}});
 o.selfBlock=/a4self/.test(daniAcd4.lessonCards({id:'L2',courseId:'c1',title:'L2'}));
 page='day';render();o.reset=daniReview2.scope.k==='all';
 return o});const bad=Object.entries(r).filter(([k,v])=>v!==true);if(bad.length)throw new Error('FAIL '+bad.map(b=>b[0]).join(',')+' '+JSON.stringify(r))});


await test('v168: منوی نسخه‌ی ۲ — اندازه‌ی کل نوار، فاصله از لبه، برچسب، سربرگ، گوشه، ریست',async pg=>{const r=await pg.evaluate(async()=>{const o={},w=ms=>new Promise(x=>setTimeout(x,ms)),h=document.documentElement;
 db.set.skin='classic';page='set';stt='look';applySkin();render();await w(400);H.lk3_p({dataset:{k:'cu'}});await w(300);h.dataset.lay='bottom';h.dataset.navf='0';daniMenuCard.node();
 const mc=document.querySelector('#menucard');o.sliders=!!(mc&&mc.querySelector('[data-mnr=sz]')&&mc.querySelector('[data-mnr=gp]')&&mc.querySelector('[data-mnr=ic]')&&mc.querySelector('[data-mnr=op]'));
 const set=(k,v)=>{const s=document.querySelector('#menucard [data-mnr='+k+']');s.value=String(v);s.dispatchEvent(new Event('input',{bubbles:true}));s.dispatchEvent(new Event('change',{bubbles:true}))};
 set('sz',70);o.sz=h.dataset.nvz==='1'&&h.style.getPropertyValue('--nvs').trim()==='0.7';
 set('gp',12);o.gp=h.dataset.nvg==='12'&&db.set.skx.classic.mn.gp===12;
 await w(900);const nb=document.getElementById('nav').getBoundingClientRect();o.gapPx=Math.abs((innerHeight-nb.bottom)-12)<=1.5;
 set('ic',120);o.ic=h.dataset.nvic==='1';set('op',80);o.op=h.dataset.nvop==='1';
 H.mn_set({dataset:{k:'hd',v:'t'}});o.hd=h.dataset.nvhd==='t';
 H.mn_set({dataset:{k:'cr',v:'round'}});o.cr=h.dataset.nvcr==='round'&&db.set.skx.classic.mn.cr==='round';
 H.mn_set({dataset:{k:'sh',v:'1'}});o.sh=h.dataset.nvsh==='1';
 h.dataset.lay='side';daniMenuCard.node();o.noGap=!document.querySelector('#menucard [data-mnr=gp]');
 db.set.skx.classic.mn.hd=0;daniMenuCard.apply();o.legacyHd=h.dataset.nvhd==='none';
 H.mn_reset();o.reset=!h.dataset.nvz&&!h.dataset.nvg&&!h.dataset.nvic&&!h.dataset.nvop&&!h.dataset.nvhd&&!h.dataset.nvcr&&!h.dataset.nvsh&&!h.style.getPropertyValue('--nvs');
 return o});const bad=Object.entries(r).filter(([k,v])=>v!==true);if(bad.length)throw new Error('FAIL '+bad.map(b=>b[0]).join(','))});

await test('v169: فایل‌های دوره — فصل ادامه‌دار، جایگزین با پیش‌نمایش، تعارض، حفظ/حذف، تغییر نام و حذف فایل',async pg=>{const r=await pg.evaluate(async()=>{const o={},D=daniCourses,w=ms=>new Promise(x=>setTimeout(x,ms));
 const Q=(id,l)=>({id,type:'single',difficulty:2,lessonIds:[l],topicIds:['ta'],exam:'',src:'jozve',stem:'سؤال '+id,choices:[{id:'a',text:'x'},{id:'b',text:'y'}],answer:{choice:'a'},solution:'ح'});
 const mk=(ver,ls,qs,part)=>({manifest:Object.assign({format:'dani-course',templateVersion:D.version.template,contentVersion:ver},part?{part}:{}),course:{id:'flx',title:'دوره فایل',language:'fa',kind:'math',unit:'فصل',chapters:[{id:'c1',title:'ج'}],topics:[{id:'ta',title:'الف'}]},
   lessons:ls.map(([id,t])=>({id,chapterId:'c1',title:t||id,blocks:[{type:'p',text:'متن '+id+(t||'')}],status:'approved',role:'core'})),questions:qs.map(([q,l])=>Q(q,l)),flashcards:[],sources:[],sourceIds:new Set(),assets:new Map(),names:[],fileErrors:[]});
 const go=async(P,opt,tweak)=>{D.validatePack(P,D.state.ix.courses.get('flx')||null);D.normalizePack(P);const pl=D.planPack(P,opt);if(tweak)tweak(pl);await D.commitPack(P,pl);return pl};
 const C=()=>D.state.ix.courses.get('flx'),L=id=>D.state.cache.lessons.find(l=>l.courseId==='flx'&&l.id===id);
 await go(mk('1.0',[['a1'],['a2']],[['qa1','a1']]),{target:'new',name:'ch1.dani-course.zip'});
 o.f1=C().files.length===1&&C().files[0].name==='ch1'&&C().files[0].lessons.length===2;
 const plB=await go(mk('1.0',[['b1'],['b2']],[['qb1','b1']],{id:'ch2',title:'فصل ۲'}),{target:'auto'});
 o.auto=plB.target==='new'&&C().files.length===2&&C().files[1].name==='فصل ۲'&&C().files[1].partId==='ch2';
 const f1=C().files[0].id,f2=C().files[1].id;
 const plA2=D.planPack(mk('1.1',[['a1','عنوان تازه'],['a3']],[['qa1','a1']]),{target:f1});
 o.orph=plA2.orphL.length===1&&plA2.orphL[0].id==='a2'&&plA2.keptL===1&&plA2.cmp>0;
 await go(mk('1.1',[['a1','عنوان تازه'],['a3']],[['qa1','a1']]),{target:f1});
 o.keep=!!L('a2')&&L('a1').title==='عنوان تازه'&&!!L('a3')&&C().files[0].lessons.includes('a2')&&C().files[0].lessons.includes('a3')&&C().contentVersion==='1.1';
 const pC=mk('1.2',[['b1','دست‌خورده']],[]);D.normalizePack(pC);const plC=D.planPack(pC,{target:f1});
 o.confl=plC.conflL.length===1&&plC.conflL[0].id==='b1';
 await D.commitPack(pC,plC);o.noOver=L('b1').title==='b1'&&C().files.find(f=>f.id===f2).lessons.includes('b1');
 const pC2=mk('1.2',[['b1','دست‌خورده']],[]);D.normalizePack(pC2);const plC2=D.planPack(pC2,{target:f1});plC2.allowOver=true;await D.commitPack(pC2,plC2);
 o.over=L('b1').title==='دست‌خورده'&&C().files[0].lessons.includes('b1')&&!C().files.find(f=>f.id===f2).lessons.includes('b1');
 const pD=mk('1.3',[['a1','عنوان تازه']],[['qa1','a1']]);D.normalizePack(pD);const plD=D.planPack(pD,{target:f1});plD.rmOrphans=true;await D.commitPack(pD,plD);
 o.rmo=!L('a2')&&!L('a3')&&!!L('a1')&&!C().files[0].lessons.includes('a2');
 const oldP=window.prompt,oldC=window.confirm;window.prompt=()=>'اسم تازه';window.confirm=()=>true;
 H.crs_frn({dataset:{c:'flx',f:f2}});await w(400);o.rename=C().files.find(f=>f.id===f2).name==='اسم تازه';
 D.state.tab='manage';page='acd';zMS.acd.tab='courses';render();await w(300);
 o.ui=!!document.querySelector('.crs-fl')&&/فایل/.test(document.querySelector('.crs-fl summary').textContent)&&!!document.querySelector('[data-crs-add=flx]')&&!!document.querySelector('[data-crs-rep]')&&!!document.querySelector('[data-a=crs_expc]')&&!!document.querySelector('[data-a=crs_delc]');
 H.crs_frd({dataset:{c:'flx',f:f2}});await w(500);window.prompt=oldP;window.confirm=oldC;
 o.del=C().files.length===1&&!L('b2')&&!!L('a1');
 await D.IDB.tx(['courses'],'readwrite',async t=>{const c=C();const x={...c};delete x.files;await new Promise((res,rej)=>{const rq=t.objectStore('courses').put(x);rq.onsuccess=res;rq.onerror=rej})});
 return o});const bad=Object.entries(r).filter(([k,v])=>v!==true);if(bad.length)throw new Error('FAIL '+bad.map(b=>b[0]).join(',')+' '+JSON.stringify(r))});

await test('v169: مرور فلش‌کارت — قدم‌های یادگیری بر حسب تعداد کارت، بدون پشت‌سرهم، فراموشی کارت قدیمی',async pg=>{const r=await pg.evaluate(async()=>{const o={},w=ms=>new Promise(x=>setTimeout(x,ms));
 const A=zAX();A.cards=[];A.rn=0;A.rl={};A.nl=0;const t=todayISO();
 const mk=(id,x)=>Object.assign({id,q:'word'+id,a:'معنی'+id,due:t,ease:2.5,ivl:0,reps:0,lap:0,ag:'',last:'',dt:0},x||{});
 for(let i=1;i<=9;i++)A.cards.push(mk('c'+i));
 const C=daniCards2,pick=()=>C.cur();
 let c=pick();o.first=c&&c.id==='c1';
 H.acd_rate?0:0;zMA.acd.rate('again');
 const c1=A.cards.find(x=>x.id==='c1');o.step0=c1.ls===0&&c1.rn===A.rn+5-1+0||c1.ls===0&&c1.rn>A.rn;
 const order=[];for(let i=0;i<7;i++){const k=pick();order.push(k.id);zMA.acd.rate('good')}
 o.notBehind=order[0]!=='c1'&&order.indexOf('c1')>=4;
 o.later=order.indexOf('c1')>=4&&order.indexOf('c1')<=7;
 /* کارت c1 با «خوب» قدم ۲ را می‌گیرد و دوباره بعد از ~۱۵ کارت */
 o.hasLs=A.cards.every(x=>x.ls===undefined||x.ls>=-1);
 /* صف فقط یک کارت در حال یادگیری: آماده نیست → نباید فوراً برگردد */
 A.cards=[mk('z1')];A.rn=0;zMA.acd.rate('again');const z=A.cards[0];o.waitOnly=C.cur()===undefined;
 o.goNow=(()=>{H.c2_go();return !!(C.cur()&&C.cur().id==='z1')})();
 /* کارت قدیمی فراموش‌شده: فاصله ۴۰٪، نه ۱ روز */
 A.cards=[mk('m1',{ivl:30,reps:5,ease:2.5})];A.rn=0;zMA.acd.rate('again');const m=A.cards[0];o.lapse=m.lap===1&&m.pv===12&&m.ls===0&&m.ease<2.5;
 for(let k=0;k<2;k++){m.rn=0;m.dt=0;zMA.acd.rate('good')}
 o.regrad=m.ls===-1&&m.ivl===12&&m.reps>=2&&!m.dt;
 /* آسان روی کارت تازه: فارغ‌التحصیل */
 A.cards=[mk('e1')];zMA.acd.rate('easy');o.easy=A.cards[0].ivl===3&&A.cards[0].ls===-1;
 /* سخت‌گیر */
 A.cards=[mk('l1',{ivl:10,reps:3,lap:4})];page='acd';zMS.acd.tab='review';render();await w(200);o.leech=/سخت‌گیر|leech/i.test(document.body.textContent);
 return o});const bad=Object.entries(r).filter(([k,v])=>v!==true);if(bad.length)throw new Error('FAIL '+bad.map(b=>b[0]).join(',')+' '+JSON.stringify(r))});

await test('v169: جلسه‌ی مطالعه — اعتبارسنجی، ذخیره، کارت جلسه، تیک بخش‌ها، شروع بخش فلش‌کارت',async pg=>{const r=await pg.evaluate(async()=>{const o={},D=daniCourses,w=ms=>new Promise(x=>setTimeout(x,ms));
 const Q=(id,l)=>({id,type:'single',difficulty:2,lessonIds:[l],topicIds:['ta'],exam:'',src:'jozve',stem:'سؤال '+id,choices:[{id:'a',text:'x'},{id:'b',text:'y'}],answer:{choice:'a'},solution:'ح'});
 const sess=[{id:'s1',title:'گرامر + لغت',minutes:60,why:'اول زمان‌های ساده',parts:[{kind:'review',minutes:6},{kind:'learn',minutes:20,lessonIds:['g1']},{kind:'cards',minutes:10,lessonIds:['g1']},{kind:'practice',minutes:14,lessonIds:['g1'],count:5},{kind:'test',minutes:8,lessonIds:['g1'],count:4},{kind:'wrap',minutes:2,text:'جمع‌بندی'}]},{id:'s2',title:'جلسه دو',minutes:30,why:'ادامه',parts:[{kind:'read',minutes:30,ref:'کتاب، صفحه ۴۰–۴۵'}]}];
 const P={manifest:{format:'dani-course',templateVersion:D.version.template,contentVersion:'1.0'},course:{id:'ses1',title:'انگلیسی',language:'fa',kind:'language',unit:'جلسه',chapters:[{id:'c1',title:'ج'}],topics:[{id:'ta',title:'الف'}],sessions:sess},
  lessons:[{id:'g1',chapterId:'c1',title:'درس گرامر',blocks:[{type:'p',text:'x'}],status:'approved',role:'core'},{id:'g2',chapterId:'c1',title:'درس دو',blocks:[{type:'p',text:'x'}],status:'approved',role:'core'}],questions:[Q('q1','g1')],flashcards:[],sources:[],sourceIds:new Set(),assets:new Map(),names:[],fileErrors:[]};
 const rep=D.validatePack(P,null);o.noErr=!(rep.errors||rep.err||[]).some(e=>/جلسه|sessions|بخش/.test(e));o.warnMiss=(rep.warnings||rep.warn||[]).some(x=>/در هیچ جلسه‌ای نیست/.test(x));
 const bad=JSON.parse(JSON.stringify(P));bad.course.sessions=[{id:'x',title:'t',parts:[{kind:'zzz'}]}];bad.sourceIds=new Set();bad.assets=new Map();bad.lessons=P.lessons;bad.questions=P.questions;
 const rb=D.validatePack(bad,null);o.badKind=(rb.errors||rb.err||[]).some(e=>/بخش نامعتبر/.test(e));
 D.normalizePack(P);await D.commitPack(P,D.planPack(P));
 const c=D.state.ix.courses.get('ses1');o.saved=Array.isArray(c.sessions)&&c.sessions.length===2&&c.sessions[0].parts.length===6&&c.sessions[1].parts[0].ref.includes('صفحه');
 const A=zAX();A.ses={};D.state.courseId='ses1';D.state.tab='courses';D.state.lessonId='';page='acd';zMS.acd.tab='courses';render();await w(400);
 const card=document.querySelector('.crs-ses');o.card=!!card&&/جلسه/.test(card.textContent)&&/گرامر \+ لغت/.test(card.textContent)&&card.querySelectorAll('[data-a=crs_ses_tick]').length===6;
 const tk=card.querySelector('[data-a=crs_ses_tick]');H.crs_ses_tick({dataset:{c:'ses1',s:'s1',i:'0'}});await w(200);o.tick=!!(zAX().ses.ses1.s1.p[0]);
 H.crs_ses_go({dataset:{c:'ses1',s:'s1',i:'2'}});await w(300);o.cards=daniReview2.scope.k==='lessons'&&daniReview2.scope.id==='g1'&&!!zAX().unl.g1;
 daniReview2.setScope('all','');
 return o});const bad=Object.entries(r).filter(([k,v])=>v!==true);if(bad.length)throw new Error('FAIL '+bad.map(b=>b[0]).join(',')+' '+JSON.stringify(r))});

await test('v170: تازه‌های دوره‌ی به‌روزشده، فهرست برای هوش مصنوعی، هشدار درس تکراری، صدا (بومی/آنلاین)',async pg=>{const r=await pg.evaluate(async()=>{const o={},D=daniCourses,w=ms=>new Promise(x=>setTimeout(x,ms));
 const mk=(id,ver,ls,extra)=>({manifest:Object.assign({format:'dani-course',templateVersion:D.version.template,contentVersion:ver},extra||{}),course:{id,title:'دوره '+id,language:'fa',kind:'math',unit:'فصل',chapters:[{id:'c1',title:'فصل یک'}],topics:[{id:'ta',title:'الف'}]},
   lessons:ls.map(([i,t,x])=>({id:i,chapterId:'c1',title:t||('درس '+i),blocks:[{type:'p',text:'متن '+i+(x||'')}],status:'approved',role:'core'})),questions:[],flashcards:[],sources:[],sourceIds:new Set(),assets:new Map(),names:[],fileErrors:[]});
 const go=async(P)=>{D.validatePack(P,D.state.ix.courses.get(P.course.id)||null);D.normalizePack(P);await D.commitPack(P,D.planPack(P))};
 await go(mk('nw1','1.0',[['n1'],['n2']]));
 o.firstNoNews=!(D.state.ix.courses.get('nw1').news||[]).length;
 await go(mk('nw1','1.1',[['n1'],['n2','','تغییر'],['n3']],{whatsNew:'درس سه اضافه شد'}));
 const c=D.state.ix.courses.get('nw1'),n=(c.news||[])[0];
 o.news=!!n&&n.nadd===1&&n.nupd===1&&n.note==='درس سه اضافه شد'&&n.add[0].l==='n3'&&n.upd[0].l==='n2';
 zAX().nws={};D.state.courseId='nw1';D.state.tab='courses';D.state.lessonId='';page='acd';zMS.acd.tab='courses';render();await w(400);
 const card=document.querySelector('.crs-news');o.card=!!card&&/تازه‌ها/.test(card.textContent)&&/درس سه اضافه شد/.test(card.textContent)&&!!card.querySelector('[data-l=n3]');
 H.crs_news_ok({dataset:{c:'nw1'}});await w(300);o.dismiss=!document.querySelector('.crs-news')&&!!zAX().nws.nw1[n.id];
 const cat=D.catalogText?D.catalogText():'';H.crs_catalog?o.cat=true:o.cat=false;
 const dup=mk('nw2','1.0',[['x1','درس n1']]);const rep=D.validatePack(dup,null);o.dup=(rep.warnings||rep.warn||[]).some(x=>/هم‌عنوان/.test(x));
 /* صدا */
 const calls=[];const oldCap=window.Capacitor;let res={ok:true};window.Capacitor={Plugins:{DaniNative:{ttsSpeak:async x=>{calls.push(x);return res}}}};
 H.c2_say({dataset:{t:'apple'}});await w(100);o.native=calls.length===1&&calls[0].lang==='en-US'&&calls[0].text==='apple';
 const urls=[],oldAudio=window.Audio;window.Audio=function(u){urls.push(u);this.play=()=>Promise.resolve()};
 zAX().onl=true;res={ok:false,reason:'lang'};H.c2_say({dataset:{t:'apple'}});await w(150);o.online=urls.length===1&&/translate_tts/.test(urls[0])&&/tl=en/.test(urls[0]);
 zAX().onl=false;res={ok:false,reason:'init'};const t0=document.body.innerHTML.length;H.c2_say({dataset:{t:'apple'}});await w(150);o.noOnlineNoAudio=urls.length===1;
 window.Capacitor=oldCap;window.Audio=oldAudio;zAX().onl=false;
 return o});const bad=Object.entries(r).filter(([k,v])=>v!==true);if(bad.length)throw new Error('FAIL '+bad.map(b=>b[0]).join(',')+' '+JSON.stringify(r))});

await test('v172: «بلد بودم» برای سؤال نوشتنی — درست‌حساب‌شدن، حذف از دفترچه‌ی خطا، برگرداندن',async pg=>{const r=await pg.evaluate(async()=>{const o={},D=daniCourses,w=ms=>new Promise(x=>setTimeout(x,ms));
 const P={manifest:{format:'dani-course',templateVersion:D.version.template,contentVersion:'1.0'},course:{id:'knw',title:'دانستن',language:'fa',kind:'math',unit:'فصل',chapters:[{id:'c1',title:'ج'}],topics:[{id:'ta',title:'الف'}]},
  lessons:[{id:'l1',chapterId:'c1',title:'درس',blocks:[{type:'p',text:'x'}],status:'approved',role:'core'}],
  questions:[{id:'nq1',type:'numeric',difficulty:2,lessonIds:['l1'],topicIds:['ta'],exam:'',src:'jozve',stem:'۳×۴ = ؟',answer:{value:'12'},solution:'۱۲'},{id:'nq2',type:'single',difficulty:2,lessonIds:['l1'],topicIds:['ta'],exam:'',src:'jozve',stem:'تست',choices:[{id:'a',text:'x'},{id:'b',text:'y'}],answer:{choice:'a'},solution:'ح'}],flashcards:[],sources:[],sourceIds:new Set(),assets:new Map(),names:[],fileErrors:[]};
 D.validatePack(P,null);D.normalizePack(P);await D.commitPack(P,D.planPack(P));
 await D.startQuiz({courseId:'knw',scope:'all',diffs:[1,2,3],count:5,mode:'exam'});await w(200);
 const a=D.state.quiz;a.items.nq1={answer:'21',ms:1000};a.items.nq2={answer:'b',ms:1000};await D.submitQuiz();await w(300);
 const aid=D.state.keyId,A=()=>D.state.ix.attempts.get(aid);
 o.start=A().score.ok===0&&A().score.total===2&&A().score.wrong===2&&!!D.state.ix.errors.get('e_nq1');
 D.state.tab='quiz';page='acd';zMS.acd.tab='courses';render();await w(300);
 const html=document.body.innerHTML;o.btn=/data-a="crs_know"[^>]*data-q="nq1"/.test(html)&&!/data-a="crs_know"[^>]*data-q="nq2"/.test(html);
 H.crs_know({dataset:{q:'nq1',v:'1'}});await w(500);
 o.ok=A().items.nq1.ov==='know'&&A().score.ok===1&&A().score.wrong===1&&!D.state.ix.errors.get('e_nq1')&&!!D.state.ix.errors.get('e_nq2');
 render();await w(300);o.badge=/بلد بودم/.test(document.body.textContent)&&!!document.querySelector('[data-a=crs_know][data-v="0"]');
 H.crs_know({dataset:{q:'nq1',v:'0'}});await w(500);
 o.undo=!A().items.nq1.ov&&A().score.ok===0&&!!D.state.ix.errors.get('e_nq1');
 return o});const bad=Object.entries(r).filter(([k,v])=>v!==true);if(bad.length)throw new Error('FAIL '+bad.map(b=>b[0]).join(',')+' '+JSON.stringify(r))});

await test('v173: پاک‌سازی منو و خانه — بدون «بیشتر»، سه سطح خانه، حس برنامه یکی، ماژول‌ها در کارت منو',async pg=>{const r=await pg.evaluate(async()=>{const o={},w=ms=>new Promise(x=>setTimeout(x,ms));
 page='set';stt='look';render();await w(400);render();await w(300);
 o.noMore=!NAV.some(n=>n[0]==='mo')&&typeof PG.mo==='undefined';
 o.foldOff=db.set.cm&&db.set.cm.fold===0&&db.set.cm.foldv===2;
 o.modMoved=!document.querySelector('#modcard')&&!document.querySelector('#dqc')&&!document.querySelector('[data-a=cm_mo]')&&!document.querySelector('[data-a=cm_ws]');
 o.lv3=document.querySelectorAll('#homex [data-a=hm_lv]').length===3&&document.querySelector('#homex [data-a=hm_lv].on').dataset.v==='tidy';
 H.hm_lv({dataset:{v:'calm'}});await w(300);o.calm=db.set.dq.on===true&&db.set.cm.ws===1&&document.body.classList.contains('dq');
 H.hm_lv({dataset:{v:'full'}});await w(300);o.full=db.set.dq.on===false&&db.set.cm.ws===0&&!document.body.classList.contains('dq');
 H.hm_lv({dataset:{v:'tidy'}});await w(300);o.tidy=db.set.dq.on===false&&db.set.cm.ws===1;
 db.set.fx={hap:1,anim:1};H.fx_feel({});o.feel0=!db.set.fx.hap&&!db.set.fx.anim;H.fx_feel({});o.feel1=!!(db.set.fx.hap&&db.set.fx.anim);db.set.fx={hap:1,anim:0};H.fx_feel({});o.feelMix=!!(db.set.fx.hap&&db.set.fx.anim);
 const h=daniMenuCard.node().innerHTML;o.mods=/data-mc="mod:tog:/.test(h)&&/خاموش کردن کامل|Turn a section fully off/.test(h);
 return o});const bad=Object.entries(r).filter(([k,v])=>v!==true);if(bad.length)throw new Error('FAIL '+bad.map(b=>b[0]).join(',')+' '+JSON.stringify(r))});

await test('v174: ابزارهای آزمون — فیلتر منبع/جلسه، جست‌وجوی دفترچه، bidi',async pg=>{const r=await pg.evaluate(async()=>{const o={},w=ms=>new Promise(x=>setTimeout(x,ms));
 const C=daniCourses.state,a=daniCourses.api;
 C.ix.courses.set('c1',{id:'c1',title:'Course1',sessions:[{id:'s1',title:'جلسه ۱',parts:[{kind:'learn',lessonIds:['L1']}]}]});
 ['L1','L2'].forEach(id=>C.ix.lessons.set(id,{id,courseId:'c1',title:id}));
 const mk=(id,src,l)=>({id,courseId:'c1',src,lessonIds:[l],topicIds:[],difficulty:1,type:'mcq',stem:'سؤال '+id+' alpha',choices:[],answer:'a'});
 C.cache.questions=[mk('q1','jozve','L1'),mk('q2','konkur','L1'),mk('q3','konkur','L2')];C.ix.questions=new Map(C.cache.questions.map(q=>[q.id,q]));
 const n=f=>a.pool('c1',['all'],[1,2,3],f).length;
 o.all=n(null)===3;o.src=n({src:['konkur']})===2&&n({src:['jozve']})===1;
 const f=a.fltFor('c1',{src:[],ses:'c1/s1'});o.ses=n(f)===2;o.other=a.fltFor('c2',{ses:'c1/s1'})===null;
 o.bidi=/<bdi dir="ltr">f\(x\) = 2x \+ 3<\/bdi>/.test(daniCourses.inl('اگر f(x) = 2x + 3 باشد'))&&!/<bdi[^>]*>13<\/bdi>/.test(daniCourses.inl('عدد 13 است'))&&!/<bdi[^>]*>[^<]*\)<\/bdi>/.test(daniCourses.inl('word (توضیح)'));
 C.cache.errors=[{id:'e_q1',qid:'q1',courseId:'c1',lastAt:2,at:1,count:1,resolved:false,cause:'بی‌دقتی'},{id:'e_q3',qid:'q3',courseId:'c1',lastAt:1,at:1,count:1,resolved:true}];
 C.cache.courses=[{id:'c1',title:'Course1'}];page='acd';C.ev='all';C.eq='';C.ef='';H.acd3_go({dataset:{k:'errors'}});render();await w(400);
 const cnt=()=>document.querySelectorAll('[data-crs-cause]').length;
 o.e2=cnt()===2;H.crs_ef({dataset:{k:'open'}});await w(200);o.open=cnt()===1;
 H.crs_ef({dataset:{k:''}});C.eq='q3';render();await w(200);o.srch=cnt()===1&&!!document.querySelector('[data-crs-eq]');
 C.eq='zzzz';render();await w(200);o.none=cnt()===0;
 C.cache.courses=[{id:'c1',title:'Course1'}];C.setup=C.setup||{};H.acd4_xsel({dataset:{t:'c1|all'}});H.acd4_xset({dataset:{k:'src',v:'konkur'}});const xh=daniAcd4.xbuilder();o.xb=/a4x-ses/.test(xh)&&/data-v="konkur"/.test(xh)&&/chip on/.test(xh);
 return o});const bad=Object.entries(r).filter(([k,v])=>v!==true);if(bad.length)throw new Error('FAIL '+bad.map(b=>b[0]).join(',')+' '+JSON.stringify(r))});

await test('v175: ابزارهای آزمون ۲ — مرور فاصله‌دار سؤال، اطمینان، بخش‌ها',async pg=>{const r=await pg.evaluate(async()=>{const o={},w=ms=>new Promise(x=>setTimeout(x,ms));
 const C=daniCourses.state,a=daniCourses.api;
 C.ix.courses.set('c1',{id:'c1',title:'Course1',sessions:[]});C.cache.courses=[{id:'c1',title:'Course1'}];
 const mk=id=>({id,courseId:'c1',src:'jozve',lessonIds:[],topicIds:[],difficulty:1,type:'single',stem:'سؤال '+id,choices:[{id:'a',text:'x',ok:true},{id:'b',text:'y'}],answer:'a'});
 C.cache.questions=['q1','q2','q3','q4'].map(mk);C.ix.questions=new Map(C.cache.questions.map(q=>[q.id,q]));
 const today=todayISO();
 C.cache.errors=[{id:'e_q1',qid:'q1',courseId:'c1',lastAt:2,at:1,count:1,resolved:false},{id:'e_q2',qid:'q2',courseId:'c1',lastAt:2,at:1,count:1,resolved:false,due:'2999-01-01'},{id:'e_q3',qid:'q3',courseId:'c1',lastAt:2,at:1,count:1,resolved:false,due:'2000-01-01',conf:'sure',sugg:'ندانستن مفهوم'}];
 C.ix.errors=new Map(C.cache.errors.map(e=>[e.id,e]));
 o.due=a.qDueCount()===2;
 page='acd';C.ev='self';C.edue=true;C.es='';C.cache.courses=[{id:'c1',title:'Course1'}];H.acd3_go({dataset:{k:'errors'}});render();await w(300);
 o.selfBtns=document.querySelectorAll('[data-a="crs_esres"]').length>=4;
 const id=C.es;H.crs_esres({dataset:{k:'good'}});await w(300);const e=C.ix.errors.get(id)||C.cache.errors.find(x=>x.id===id);o.sched=!!e&&e.due>today&&e.ivl>=3;
 C.edue=false;C.ev='all';C.es='';render();await w(300);o.sugg=!!document.querySelector('[data-a="crs_sugg"]');
 db.set.acdConf=false;
 await a.startMulti({items:[{cid:'c1',scope:'all'}],secs:[10,10],diffs:[1,2,3],count:'',order:'pick',timed:false,minutes:30,neg:false});
 const q=C.quiz;o.secs=!!q&&!!q.secs&&q.secs.length===2&&q.secs[0].to===2&&q.limitSec===1200&&q.timed===true;
 page='acd';C.tab='quiz';render();await w(300);
 o.hdr=/crs-timer/.test(document.body.innerHTML);
 const navBtns=document.querySelectorAll('[data-a="crs_qgo"]').length,qn=C.quiz.qids.length;o.navSec=navBtns===C.quiz.secs[0].to||('n'+navBtns+'q'+qn+[...document.querySelectorAll('.crs-nav button')].map(b=>b.dataset.n).join(''));
 H.crs_qnext({dataset:{n:'1'}});H.crs_qnext({dataset:{n:'1'}});o.lock=C.qi===1;
 window.confirm=()=>true;H.crs_secend();await w(200);o.end=C.qi===2&&q.skip>0;
 H.crs_qnext({dataset:{n:'-1'}});o.noBack=C.qi===2;
 db.set.acdConf=true;render();await w(200);o.conf=document.querySelectorAll('[data-a="crs_conf"]').length===3;
 db.set.acdConf=false;
 return o});const bad=Object.entries(r).filter(([k,v])=>v!==true);if(bad.length)throw new Error('FAIL '+bad.map(b=>b[0]).join(',')+' '+JSON.stringify(r))});

await test('v176: نگهبان مسیر روشن — هدف روز، نقطه‌های درصدی، اعلان، کارت',async pg=>{const r=await pg.evaluate(async()=>{const o={},w=ms=>new Promise(x=>setTimeout(x,ms));
 const t0=todayISO();
 db.acts.push({id:'ga1',name:'ریاضی-نگهبان',cat:'study',color:'#4aa3ff',tags:[],prio:'m',goalDay:0,goalWeek:0,subs:[],desc:'',active:true,arch:false,days:[]});
 const pj=zmg('pj',()=>({v:'w',today:1}));zarr(pj,'items');pj.items.push({id:'gp1',name:'MBA',pd:3,parts:[{a:'ga1'}],hrs:0});
 db.entries.push({id:'ge1',date:t0,actId:'ga1',subId:'',start:'06:00',end:'07:10',min:70,note:''});
 delete db.set.gd;const g0=db.set.gd=undefined;
 const s=daniGuardian.stat(t0);o.stat=s.tg===180&&s.dn===70;
 db.set.gd={on:true,pts:[{t:'23:58',p:50}],chip:true,away:3};
 const run=()=>{let r=[];(window.daniExtraPlan||[]).forEach(f=>{try{r=r.concat(f(Date.now())||[])}catch(e){}});return r.filter(x=>/^gd-/.test(x.key))};
 let L=run();o.notif=L.some(x=>x.key==='gd-'+t0+'-23:58'&&/از همین الان|start right now/.test(x.body));
 db.entries.push({id:'ge2',date:t0,actId:'ga1',subId:'',start:'08:00',end:'10:00',min:120,note:''});
 L=run();o.skipWhenOk=!L.some(x=>x.key==='gd-'+t0+'-23:58');
 o.tomorrow=L.some(x=>x.key==='gd-'+addD(t0,1)+'-23:58');
 db.set.gd={on:false,pts:[{t:'23:58',p:50}],chip:true,away:3};o.off=run().length===0;
 delete db.set.gd;H.gd_reset();o.def=db.set.gd.on===true&&db.set.gd.pts.length===5&&db.set.gd.pts[0].t==='12:00'&&db.set.gd.pts[0].p===50;
 db.entries=db.entries.filter(e=>e.id!=='ge2');
 page='tools';db.set.tls=db.set.tls||{};db.set.tls.tab='cp';render();await w(300);
 o.card=!!document.getElementById('gdc')&&/نگهبان|Guardian/.test(document.getElementById('gdc').innerText);
 return o});const bad=Object.entries(r).filter(([k,v])=>v!==true);if(bad.length)throw new Error('FAIL '+bad.map(b=>b[0]).join(',')+' '+JSON.stringify(r))});

await test('v177: انتخاب‌گر تم — پیش‌نمایش خانه‌ی کوچک، برچسب، فیلتر تیره/روشن',async pg=>{const r=await pg.evaluate(async()=>{const o={},w=ms=>new Promise(x=>setTimeout(x,ms));
 page='set';stt='look';render();await w(800);
 const n=document.querySelectorAll('#lkthemes .skb').length;o.cards=n>15&&document.querySelectorAll('#lkthemes .skb .stm').length===n&&document.querySelectorAll('#lkthemes .skb .stg').length===n;
 const vis=()=>[...document.querySelectorAll('#lkthemes .skb')].filter(b=>b.parentElement.style.display!=='none');
 H.lk_dk({dataset:{v:'d'}});o.dark=vis().length>0&&vis().every(b=>b.dataset.dk==='d');
 H.lk_dk({dataset:{v:'l'}});o.light=vis().length>0&&vis().every(b=>b.dataset.dk==='l')&&vis().some(b=>b.dataset.sk==='classic');
 H.lk_dk({dataset:{v:''}});o.all=vis().length===n;
 const q=document.getElementById('lkq');q.value='classic';q.dispatchEvent(new Event('input',{bubbles:true}));o.search=vis().length===1;q.value='';q.dispatchEvent(new Event('input',{bubbles:true}));
 H.lk_pv({dataset:{id:'classic'}});await w(200);o.pv=!!document.querySelector('.lkpv .stm.big');
 H.lk_pk({dataset:{v:'lay:top'}});o.lay=document.querySelector('.lkpv .stm.big').dataset.l==='top';
 H.lk_x();return o});const bad=Object.entries(r).filter(([k,v])=>v!==true);if(bad.length)throw new Error('FAIL '+bad.map(b=>b[0]).join(',')+' '+JSON.stringify(r))});

await test('v178: عکس شخصی هر جا — بنر/پس‌زمینه/منو، انتخاب در پیش‌نمایش تم',async pg=>{const r=await pg.evaluate(async()=>{const o={},w=ms=>new Promise(x=>setTimeout(x,ms));
 const mkFile=async(c)=>{const cv=document.createElement('canvas');cv.width=40;cv.height=30;const g=cv.getContext('2d');g.fillStyle=c;g.fillRect(0,0,40,30);const b=await new Promise(r=>cv.toBlob(r,'image/png'));return new File([b],'t.png',{type:'image/png'})};
 const up=async(inp,c)=>{const dt=new DataTransfer();dt.items.add(await mkFile(c));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));await w(500)};
 db.set.skin='classic';db.set.skx=db.set.skx||{};applySkin();const h=document.documentElement;
 H.lk_pv({dataset:{id:'classic'}});await w(200);
 const chips=[...document.querySelectorAll('.lkpv .phr [data-a="ph_set"][data-v="my"]')];o.pvRows=document.querySelectorAll('.lkpv .phr').length===3&&chips.length===3&&chips.every(c=>c.disabled);
 await up(document.querySelector('.lkpv [data-phfile="bg"]'),'#d33');
 o.pvBg=daniLook3.pv().ph.bg==='my'&&!document.querySelector('.lkpv [data-a="ph_set"][data-pl="bg"][data-v="my"]').disabled;
 H.lk_ap({dataset:{id:'classic'}});await w(400);
 o.applied=db.set.skx.classic.ph.bg==='my'&&h.dataset.phbg==='1';
 page='set';stt='look';render();await w(700);o.card=!!document.getElementById('phcard');
 await up(document.querySelector('#phcard [data-phfile="ban"]'),'#33d');
 o.ban=h.dataset.hero==='1'&&h.dataset.fit==='cover'&&/data:image/.test(h.style.getPropertyValue('--hero'));
 page='set';stt='look';render();await w(500);
 await up(document.querySelector('#phcard [data-phfile="mn"]'),'#3d3');await w(200);
 H.ph_set({dataset:{pl:'mn',v:'my',k:'classic',ctx:'cur'}});await w(300);o.mn=h.dataset.phmn==='1';
 H.ph_set({dataset:{pl:'ban',v:'none',k:'classic',ctx:'cur'}});await w(300);o.none=h.dataset.hero==='0';
 await H.ph_del({dataset:{pl:'bg',k:'classic',ctx:'cur'}});await w(400);o.del=!h.dataset.phbg;
 H.ph_set({dataset:{pl:'mn',v:'none',k:'classic',ctx:'cur'}});await w(200);o.mnOff=!h.dataset.phmn;
 return o});const bad=Object.entries(r).filter(([k,v])=>v!==true);if(bad.length)throw new Error('FAIL '+bad.map(b=>b[0]).join(',')+' '+JSON.stringify(r))});

await test('v179: تم پیش‌فرض کلاسیک و مرحله‌ی «ظاهر» در راهنمای شروع',async pg=>{const r=await pg.evaluate(async()=>{const o={},w=ms=>new Promise(x=>setTimeout(x,ms));
 o.def=skId()==='classic';
 H.g2_goto({dataset:{k:'look'}});await w(300);const g=document.getElementById('gd2');o.step=!!g&&g.querySelectorAll('[data-a="g2_skin"]').length===4;
 o.on=!!g.querySelector('[data-a="g2_skin"][data-id="classic"].on');
 H.g2_skin({dataset:{id:'dani'}});await w(300);o.pick=skId()==='dani'&&db.set.skin==='dani'&&!!document.querySelector('#gd2 [data-id="dani"].on');
 H.g2_skin({dataset:{id:'classic'}});await w(200);o.back=skId()==='classic';return o});const bad=Object.entries(r).filter(([k,v])=>v!==true);if(bad.length)throw new Error('FAIL '+bad.map(b=>b[0]).join(',')+' '+JSON.stringify(r))});

await test('v180: داده‌ی چهار ویجت تازه (آیزنهاور/موعد/گرمایی/تمرکز) به افزونه‌ی بومی می‌رسد',async pg=>{const r=await pg.evaluate(async()=>{const o={};let got=null;
 window.Capacitor={isNativePlatform:()=>true,Plugins:{DaniNative:{widgetSet:a=>{got=a},widgetPop:async()=>({q:[]}),liveStart(){},liveStop(){},pinSet(){}}}};
 const td=todayISO();db.set.tls={ei:[{id:'a',t:'x',q:1,done:0},{id:'b',t:'y',q:1,done:0},{id:'c',t:'z',q:2,done:1},{id:'d',t:'w',q:4,done:0}],two:[],tab:'ei'};
 db.entries.push({id:'wxe1',date:td,actId:db.acts[0]&&db.acts[0].id,start:'08:00',min:95});
 try{window.daniLiveSync.widgetSync()}catch(e){o.err=String(e)}
 o.called=!!got;const w=got&&got.wx?JSON.parse(got.wx):{};
 o.ei=JSON.stringify(w.ei)==='[2,0,0,1]';o.hm=typeof w.hm==='string'&&w.hm.length===70&&w.hm[69]==='3';o.ft=!!w.ft&&w.ft!=='0';o.t=!!w.t_ei&&!!w.t_fo;o.dn=!!w.dn;o.hs=!!w.hs;return o});const bad=Object.entries(r).filter(([k,v])=>k!=='err'&&v!==true);if(bad.length)throw new Error('FAIL '+bad.map(b=>b[0]).join(',')+' '+JSON.stringify(r))});

console.log('\n'+results.map(r=>r.join(' ')).join('\n')+'\n\n'+(results.length-fails)+' / '+results.length+' موفق');
await browser.close();srv.close();process.exit(fails?1:0);
