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
  page='set';stt='look';render();const link=!!document.querySelector('[data-a="dl_hub"]');return [hub,old,sel,ring,steps,nag,link]});
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
await test('آکادمی: تب «دوره‌ها» هست (ترتیب بارگذاری افزونه‌ها و courses.js)',async pg=>{const r=await pg.evaluate(()=>{page='acd';render();return [document.getElementById('pg').innerHTML.includes('acd:tab:courses'),!!window.daniCourses]});ok(r.every(Boolean),'نتیجه '+r)});
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
  const t=todayISO(),a=db.acts[0];db.entries.push({id:uid(),date:t,actId:a.id,min:30,start:'08:00'});db.entries.push({id:uid(),date:addD(t,-1),actId:a.id,min:30,start:'08:00'});
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
await test('امنیت: XSS در نام‌ها و یادداشت‌ها اجرا نمی‌شود',async pg=>{
 const P='<img src=x onerror="window.__xss=1">',P2='"><svg onload="window.__xss=1">';
 await pg.evaluate(([P,P2])=>{window.__xss=0;db.acts.forEach(a=>{a.name=P;});const t=todayISO();db.entries.push({id:uid(),date:t,actId:db.acts[0].id,subId:'',start:'05:00',end:'06:00',min:60,note:P2});
  try{(db.projects=db.projects||[]).push({id:'p1',name:P,title:P,parts:[]})}catch(e){}try{db.set.quote=P}catch(e){}save()},[P,P2]);
 const pages=await pg.evaluate(()=>Object.keys(PG));for(const p of pages){await pg.evaluate(p=>{try{page=p;render()}catch(e){}},p);await pg.waitForTimeout(40)}
 const x=await pg.evaluate(()=>window.__xss);ok(x===0,'کد تزریق‌شده اجرا شد (XSS)')});

console.log('\n'+results.map(r=>r.join(' ')).join('\n')+'\n\n'+(results.length-fails)+' / '+results.length+' موفق');
await browser.close();srv.close();process.exit(fails?1:0);
