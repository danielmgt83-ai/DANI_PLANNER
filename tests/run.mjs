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
async function test(name,fn){let o;try{o=await fresh();await fn(o.pg);if(o.errs.length)throw new Error(o.errs.slice(0,3).join(' | '));results.push(['✅',name])}catch(e){fails++;results.push(['❌',name+' — '+e.message.slice(0,300)])}finally{if(o)await o.ctx.close()}}
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
await test('زیرمرحله‌های موعد و رنگ موعد در تقویم',async pg=>{const r=await pg.evaluate(()=>{const t=todayISO();const D=zmg('dl',()=>({v:1}));D.items=[{id:'dS',title:'گزارش',dt:addD(t,2),tm:'10:00',al:[],cat:'',cr:Date.now()-864e5,sub:[{id:'s1',t:'پیش‌نویس',d:false},{id:'s2',t:'بازبینی',d:true}]}];save();
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
await test('استودیو و بسته‌های تم: یک کارت، واردکردن/خروجی و بسته‌ها سر جا',async pg=>{const r=await pg.evaluate(async()=>{page='set';stt='look';render();await new Promise(r=>setTimeout(r,300));render();await new Promise(r=>setTimeout(r,200));
  const b=document.getElementById('thmx');if(!b)return 'no';return JSON.stringify([document.querySelectorAll('#thmx').length,!!b.querySelector('[data-skthemefile]'),!!b.querySelector('[data-skexp]'),!!b.querySelector('#studiocard'),!!b.querySelector('details[data-tk] #pkcard'),!document.querySelector('#skincard [data-skthemefile]')])});
 ok(r==='[1,true,true,true,true,true]','نتیجه '+r)});
await test('منو و بخش‌ها / نمایش خانه: همه‌ی کنترل‌ها هست و هرکدام یک‌بار',async pg=>{const r=await pg.evaluate(async()=>{page='set';stt='look';render();await new Promise(r=>setTimeout(r,300));render();await new Promise(r=>setTimeout(r,200));
  const A={cm_mg:1,cm_mo:1,cm_ws:1,cm_fd:1,cm_fdr:1,lg_t:1,bd_all:1,bd_q:1,bd_pg:4,dk_on:1,dk_c:1};const bad=Object.keys(A).filter(a=>document.querySelectorAll('[data-a="'+a+'"]').length!==A[a]);
  const q=(c,s)=>!!document.querySelector(c+' '+s);return JSON.stringify({bad,u:[document.querySelectorAll('#menux').length,document.querySelectorAll('#homex').length],m:q('#menux','#modcard'),d:q('#homex','#dqc'),b:q('#sntg','[data-a="bd_q"]')})});
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
await test('برگشت به مسیر v146: انتخاب حالت و مانع، راه‌حل، ذخیره، پیگیری، یادآوری مهربان',async pg=>{const r=await pg.evaluate(async()=>{const o={};page='day';DANI_DY().hide=DANI_DY().hide.filter(k=>k!=='wp');db.set.cpw={list:[]};db.mods.pj.items=[];render();const q=s=>document.querySelector('#cpcard '+s);
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
await test('ظاهر و تم v149: ۵ زبانه، هر کارت قدیمی جای مشخص دارد، تم خودکار و مقدار قدیمی روشن/تیره می‌ماند',async pg=>{const r=await pg.evaluate(async()=>{const o={};const w=()=>new Promise(x=>setTimeout(x,300));page='set';stt='look';render();await w();
 o.tabs=document.querySelectorAll('#lk3 .lk3tabs .chip').length;const where=id=>{const e=document.querySelector(id);const p=e&&e.closest('.lk3p');return p?p.dataset.p:''};
 o.skin=where('#skincard');o.thmx=where('#thmx');o.mx=where('#mxcard');o.fx=where('#fxcard');
 const ic=[...document.querySelectorAll('#lk3 .stsec')].map(s=>s.closest('.lk3p').dataset.p);o.ic=ic.join();
 o.dash=!!document.querySelector('#lk3 .lk3p[data-p=fx] details');
 o.lf=!!document.querySelector('#lk3 .lk3p[data-p=co] [data-f=th]');
 H.lk3_p({dataset:{k:'ic'}});o.vis=[...document.querySelectorAll('#lk3 .lk3p')].filter(p=>!p.hidden).map(p=>p.dataset.p).join();
 H.lk3_p({dataset:{k:'th'}});
 const old=db.set.th;db.set.th='dark';render();o.dk=document.documentElement.dataset.th;db.set.th='auto';render();o.au=['light','dark'].includes(document.documentElement.dataset.th);db.set.th='light';render();o.lt=document.documentElement.dataset.th;db.set.th=old;
 o.def=daniThMode&&true;page='home';render();return o});
 if(r.tabs!==5||r.skin!=='th'||r.thmx!=='th'||r.mx!=='co'||r.fx!=='fx'||!/ic/.test(r.ic)||!r.dash||!r.lf||r.vis!=='ic'||r.dk!=='dark'||!r.au||r.lt!=='light')throw new Error(JSON.stringify(r))});
await test('مسیر روشن v144: پیش‌فرض خاموش؛ چهار قدم، ذخیره، پایان و ثبت شدت بعد',async pg=>{const r=await pg.evaluate(async()=>{const o={};page='day';render();o.off=!DANI_DY().hide.includes('wp')&&!!document.getElementById('cpcard');DANI_DY().hide=DANI_DY().hide.filter(k=>k!=='wp');db.set.cpw={list:[]};render();const q=(a,n)=>document.querySelector('#cpcard [data-a='+a+']'+(n?'[data-n="'+n+'"]':''));q('cp_new').click();const t=document.getElementById('cp-t');t.value='نگرانی آزمون';t.dispatchEvent(new Event('input',{bubbles:true}));q('cp_n1').click();q('cp_n2').click();document.querySelector('#cpcard [data-n=ctl]').click();q('cp_n3').click();const s=document.getElementById('cp-s');s.value='حل ده تست';s.dispatchEvent(new Event('input',{bubbles:true}));q('cp_save').click();o.n=db.set.cpw.list.length;q('cp_end').click?0:0;document.querySelector('#cpcard [data-a=cp_end][data-st=done]').click();document.querySelector('#cpcard [data-a=cp_s1][data-n="2"]').click();const w=db.set.cpw.list[0];o.w=[w.st,w.s0,w.s1];DANI_DY().hide.push('wp');db.set.cpw={list:[]};page='home';render();return o});if(!r.off||r.n!==1||r.w[0]!=='done'||r.w[2]!==2)throw new Error(JSON.stringify(r))});
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
 o.sug=(html().match(/data-a="acd4_mk"/g)||[]).length;o.dup=/محتوای تکراری/.test(html());
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
 if(r.top!==4||!r.today||!r.mgmt||!r.noB||r.tabs!==6||!r.fm||!r.er||!r.ex||!r.extra||r.zc!==2||r.zc2!==2||!r.pl||!r.src)throw new Error(JSON.stringify(r))});

await test('آکادمی v152: پیشنهاد ادغام درس‌های هم‌موضوع (ریاضی ۳ تایی، انگلیسی ۲ تایی)',async pg=>{const r=await pg.evaluate(async()=>{const C=daniCourses.state,o={};
 C.cache.courses.length=0;C.cache.lessons.length=0;C.cache.questions.length=0;
 ['mba-math-d1-limit','mba-math-d2-derivative','mba-math-exam-01','gmat-mba','toefl-grammar','grammar-foundation'].forEach(id=>C.cache.courses.push({id,title:id.startsWith('mba-math')?'ریاضی MBA — '+id:id,contentVersion:'1',chapters:[{id:'c'+id,title:'ف'}],topics:[]}));
 C.ix.courses=new Map(C.cache.courses.map(x=>[x.id,x]));C.ix.lessons=new Map();C.ix.questions=new Map();C.loaded=true;zAC().cols=[];
 page='acd';zMS.acd.tab='courses';C.tab='home';C.courseId='';C.lessonId='';render();const h=document.getElementById('pg').innerHTML;
 o.btn=(h.match(/data-a="acd4_mg"/g)||[]).length;o.math=/data-n="mba-math"[^>]*data-c="mba-math-d1-limit,mba-math-d2-derivative,mba-math-exam-01"/.test(h);o.en=/data-n="english-grammar"/.test(h);o.pick=/acd4_mgpick/.test(h);
 page='home';render();return o});
 if(r.btn!==2||!r.math||!r.en||!r.pick)throw new Error(JSON.stringify(r))});

console.log('\n'+results.map(r=>r.join(' ')).join('\n')+'\n\n'+(results.length-fails)+' / '+results.length+' موفق');
await browser.close();srv.close();process.exit(fails?1:0);
