"use strict";
/* DANI · safety.js — آرامش و ایمنی:
   (۱) ساعت سکوت سراسری (db.set.qh {on,from,to}) و «مزاحم نشو» (db.set.dnd {until}): اعلان‌های غیرضروری تا پایان آن به تعویق می‌افتند؛ زنگ تایمر/پومودورو همیشه به‌موقع می‌آید
   (۲) اعلان خلاصه‌ی پایان هفته (db.set.wkn {on,day,time}) و هشدار «تایمر فراموش شده» (db.set.fz {on,h})، هشدار پشتیبان (۱۴ روز)
   (۳) نسخه‌های خودکار هفتگی داخل مرورگر/اپ (IndexedDB، ۴ نسخه) با دانلود و بازگردانی
   (۴) «بررسی سلامت» (از برگه‌ی راهنما) */
(function(){
const T=window.daniT;
const S=(k,d)=>{const s=db.set;if(!s[k]||typeof s[k]!=='object')s[k]=Object.assign({},d);const o=s[k];for(const x in d)if(o[x]===undefined)o[x]=d[x];return o};
const QH=()=>S('qh',{on:0,from:'23:00',to:'07:00'}),DND=()=>S('dnd',{until:0}),WK=()=>S('wkn',{on:1,day:5,time:'19:00'}),FZ=()=>S('fz',{on:1,h:3});
const sync=()=>{try{if(typeof Notifier!=='undefined')Notifier.sync(true)}catch(e){}};
const m=hm=>{const[a,b]=String(hm).split(':').map(Number);return(a||0)*60+(b||0)};
const IMPORTANT=x=>x.ch==='dani-alarm-v2'||/^(timer|pomo)/.test(String(x.key||''));
/* پایان بازه‌ی سکوت/مزاحم نشو که زمان t داخل آن است؛ وگرنه 0 */
function quietEnd(t){const d=DND().until;if(d&&t<d)return d;
  const q=QH();if(!q.on)return 0;const dt=new Date(t),cur=dt.getHours()*60+dt.getMinutes(),f=m(q.from),to=m(q.to);
  const inq=f<=to?(cur>=f&&cur<to):(cur>=f||cur<to);if(!inq)return 0;
  const e=new Date(t);e.setHours(Math.floor(to/60),to%60,0,0);if(e.getTime()<=t)e.setDate(e.getDate()+1);return e.getTime()}
window.daniPlanFilter=(out,now)=>{let k=0;return out.map(x=>{if(IMPORTANT(x))return x;const e=quietEnd(x.at);if(!e)return x;return Object.assign({},x,{at:e+1000+(k++)*1500})})};
/* ---------- اعلان‌های تازه ---------- */
const hr=h=>fa(h)+T(' ساعت',' h');
(window.daniExtraPlan=window.daniExtraPlan||[]).push(now=>{const out=[];
  try{const w=WK();if(w.on){const d=new Date(now),target=new Date(now);target.setHours(m(w.time)/60|0,m(w.time)%60,0,0);
      let add=(w.day-d.getDay()+7)%7;if(add===0&&target.getTime()<=now+2000)add=7;target.setDate(target.getDate()+add);
      const t=todayISO(),ws=weekStart(t),cur=sum(E(ws,t)||[]),prv=sum(E(addD(ws,-7),addD(ws,-1))||[]),pc=prv?Math.round((cur-prv)/prv*100):null;
      const by={};(E(ws,t)||[]).forEach(e=>{by[e.actId]=(by[e.actId]||0)+(e.min||0)});const top=Object.entries(by).sort((a,b)=>b[1]-a[1])[0];
      const body=T('این هفته '+mm(cur)+(pc!==null?' ('+(pc>=0?'+':'')+fa(pc)+'٪ نسبت به هفته‌ی قبل)':'')+(top?' · بیشترین: '+aN(top[0]):''),'This week '+mm(cur)+(pc!==null?' ('+(pc>=0?'+':'')+pc+'% vs last week)':'')+(top?' · most: '+aN(top[0]):''));
      out.push({id:7001,at:target.getTime(),title:'DANI 📊',body,ch:'dani-remind-v2',key:'wk-sum-'+todayISO()})}}catch(e){}
  try{const z=FZ(),t=db.timer;if(z.on&&t&&t.state==='running'&&t.mode!=='cd'){const left=z.h*3600000-el();
      if(left>2000)out.push({id:7002,at:now+left,title:'DANI ⏱',body:T('تایمر «'+aN(t.actId)+'» حدود '+hr(z.h)+' است روشن مانده — هنوز کار می‌کنی؟','Timer “'+aN(t.actId)+'” has been running ~'+z.h+' h — still working?'),ch:'dani-remind-v2',key:'timer-forgot'})}}catch(e){}
  try{const last=Math.max(db.set.lastBk||0,+localStorage.getItem('dani_sync_last')||0);
      if(db.entries&&db.entries.length>5&&now-last>14*864e5){const a=new Date(now);a.setHours(20,0,0,0);if(a.getTime()<=now+2000)a.setDate(a.getDate()+1);
        out.push({id:7003,at:a.getTime(),title:'DANI 🛡',body:T('بیش از ۱۴ روز است پشتیبان بیرونی نگرفته‌ای (یا همگام‌سازی نشده).','No external backup or sync for over 14 days.'),ch:'dani-remind-v2',key:'bk-nag-'+todayISO()})}}catch(e){}
  return out});
/* ---------- مزاحم نشو ---------- */
H.dnd_set=e=>{const h=+e.dataset.h,d=DND();d.until=h>0?Date.now()+h*3600000:0;save();sync();try{toast(h>0?T('مزاحم نشو تا '+fa(nowHM2(d.until)),'Do not disturb until '+nowHM2(d.until)):T('مزاحم نشو خاموش شد','Do not disturb off'))}catch(x){}render();try{H.hf_open&&document.querySelector('#ovl .ov')&&H.hf_open()}catch(x){}};
const nowHM2=t=>{const d=new Date(t);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')};
window.daniDnd={on:()=>DND().until>Date.now(),until:()=>DND().until};
/* ---------- کارت تنظیمات ---------- */
H.qh_t=()=>{QH().on=QH().on?0:1;save();sync();render()};
H.wkn_t=()=>{WK().on=WK().on?0:1;save();sync();render()};
H.fz_t=()=>{FZ().on=FZ().on?0:1;save();sync();render()};
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||!t.dataset.sf)return;const k=t.dataset.sf;
  if(k==='qf'&&/^\d\d:\d\d$/.test(t.value))QH().from=t.value;else if(k==='qt'&&/^\d\d:\d\d$/.test(t.value))QH().to=t.value;
  else if(k==='wd')WK().day=+t.value;else if(k==='wt'&&/^\d\d:\d\d$/.test(t.value))WK().time=t.value;else if(k==='fh'){const v=Math.max(1,Math.min(24,+t.value||3));FZ().h=v}
  save();sync()});
const DAYS=[['شنبه','Sat',6],['یکشنبه','Sun',0],['دوشنبه','Mon',1],['سه‌شنبه','Tue',2],['چهارشنبه','Wed',3],['پنجشنبه','Thu',4],['جمعه','Fri',5]];
function qcard(){const q=QH(),w=WK(),z=FZ(),d=DND(),act=d.until>Date.now();
  return'<div class="c" id="qhcard">'+daniH('🌙','سکوت، مزاحم نشو و اعلان‌های هفتگی','Quiet hours, Do not disturb & weekly alerts')
   +'<p class="m">'+T('در ساعت سکوت یا مزاحم نشو، اعلان‌های عادی تا پایانش عقب می‌افتند (نه حذف). زنگ تایمر و پومودورو همیشه به‌موقع می‌آید.','During quiet hours / Do not disturb, normal notifications are delayed (not dropped). Timer and Pomodoro alarms always ring on time.')+'</p>'
   +'<div class="row"><button class="chip '+(q.on?'on':'')+'" data-a="qh_t">🌙 '+T('ساعت سکوت','Quiet hours')+'</button><input type="time" data-sf="qf" value="'+esc(q.from)+'"><span class="m">→</span><input type="time" data-sf="qt" value="'+esc(q.to)+'"></div>'
   +'<div class="row" style="margin-top:6px"><span class="m">'+T('مزاحم نشو:','Do not disturb:')+'</span>'+[1,2,4].map(h=>'<button class="chip" data-a="dnd_set" data-h="'+h+'">'+fa(h)+T(' ساعت',' h')+'</button>').join('')+(act?'<button class="chip on" data-a="dnd_set" data-h="0">'+T('تا '+fa(nowHM2(d.until))+' — خاموش کن','Until '+nowHM2(d.until)+' — turn off')+'</button>':'')+'</div>'
   +'<div class="row" style="margin-top:8px"><button class="chip '+(w.on?'on':'')+'" data-a="wkn_t">📊 '+T('خلاصه‌ی پایان هفته','Weekly summary')+'</button><select data-sf="wd">'+DAYS.map(x=>'<option value="'+x[2]+'" '+(x[2]===w.day?'selected':'')+'>'+T(x[0],x[1])+'</option>').join('')+'</select><input type="time" data-sf="wt" value="'+esc(w.time)+'"></div>'
   +'<div class="row" style="margin-top:6px"><button class="chip '+(z.on?'on':'')+'" data-a="fz_t">⏱ '+T('هشدار تایمر فراموش‌شده بعد از','Forgotten-timer alert after')+'</button><input type="number" min="1" max="24" data-sf="fh" value="'+z.h+'" style="width:64px"><span class="m">'+T('ساعت','hours')+'</span></div></div>'}
{const _sp=setPage;setPage=function(){const h=_sp.apply(this,arguments);return(typeof h==='string'&&typeof stt!=='undefined'&&stt==='time')?h+qcard():h}}
/* ---------- نسخه‌های خودکار (IndexedDB) ---------- */
const IDBN='dani_autobk',ST='snaps';
const idb=()=>new Promise((res,rej)=>{try{const r=indexedDB.open(IDBN,1);r.onupgradeneeded=()=>r.result.createObjectStore(ST,{keyPath:'t'});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}});
const tx=(db_,mode,fn)=>new Promise((res,rej)=>{const t=db_.transaction(ST,mode),s=t.objectStore(ST);let out;try{out=fn(s)}catch(e){return rej(e)}t.oncomplete=()=>res(out&&out.result!==undefined?out.result:out);t.onerror=()=>rej(t.error)});
async function listSnaps(){try{const d=await idb();return await new Promise((res,rej)=>{const r=d.transaction(ST).objectStore(ST).getAll();r.onsuccess=()=>res((r.result||[]).sort((a,b)=>b.t-a.t));r.onerror=()=>rej(r.error)})}catch(e){return[]}}
async function takeSnap(force){try{const last=+localStorage.getItem('dani_ab_last')||0;if(!force&&Date.now()-last<7*864e5)return false;if(!db.entries||!db.acts)return false;
    const d=await idb(),json=JSON.stringify({app:'hamrah',version:3,exportedAt:new Date().toISOString(),db});
    await tx(d,'readwrite',s=>s.put({t:Date.now(),n:json.length,json}));
    const all=await listSnaps();if(all.length>4){const d2=await idb();await tx(d2,'readwrite',s=>{all.slice(4).forEach(x=>s.delete(x.t))})}
    localStorage.setItem('dani_ab_last',String(Date.now()));return true}catch(e){console.error('autobk',e);return false}}
setTimeout(()=>takeSnap(false),6000);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(()=>takeSnap(false),3000)});
let SN=[];
H.ab_now=async()=>{if(await takeSnap(true)){SN=await listSnaps();toast(T('نسخه ساخته شد ✓','Snapshot saved ✓'));render()}};
H.ab_dl=async e=>{const x=SN.find(z=>z.t===+e.dataset.t)||(await listSnaps()).find(z=>z.t===+e.dataset.t);if(x)dl('dani-auto-'+new Date(x.t).toISOString().slice(0,10)+'.json','application/json',x.json)};
H.ab_rs=async e=>{const x=SN.find(z=>z.t===+e.dataset.t);if(!x)return;
  if(!confirm(T('داده‌های فعلی با این نسخه جایگزین شود؟ قبلش از وضعیت فعلی یک نسخه‌ی اضطراری گرفته می‌شود.','Replace current data with this snapshot? A safety copy of the current data is taken first.')))return;
  try{await takeSnap(true);snap();localStorage.setItem(KEY,x.json?JSON.stringify(JSON.parse(x.json).db):'');location.reload()}catch(err){toast(String(err&&err.message||err),1)}};
async function loadSn(){SN=await listSnaps();if(page==='set'&&stt==='data'){const c=document.getElementById('abcard');if(c)c.outerHTML=abCard()}}
function abCard(){const l=SN;
  return'<div class="c" id="abcard">'+daniH('🗄','نسخه‌های خودکار','Automatic snapshots')+'<p class="m">'+T('هر هفته یک نسخه‌ی کامل داخل همین برنامه نگه داشته می‌شود (۴ نسخه). این از اشتباه و خرابی محافظت می‌کند ولی جای پشتیبان بیرونی را نمی‌گیرد.','A full snapshot is kept inside this app each week (last 4). It protects against mistakes and corruption but does not replace an external backup.')+'</p>'
   +(l.length?l.map(x=>'<div class="cwr" style="display:flex;gap:6px;align-items:center"><span style="flex:1">'+esc(new Date(x.t).toLocaleString())+' · '+fa(Math.round(x.n/1024))+' KB</span><button class="chip" data-a="ab_dl" data-t="'+x.t+'">⬇</button><button class="chip" data-a="ab_rs" data-t="'+x.t+'">↩ '+T('بازگردانی','Restore')+'</button></div>').join(''):'<p class="m">'+T('هنوز نسخه‌ای نیست.','No snapshots yet.')+'</p>')
   +'<div class="row" style="margin-top:6px"><button class="chip" data-a="ab_now">＋ '+T('همین حالا نسخه بساز','Take a snapshot now')+'</button></div></div>'}
{const _sp=setPage;setPage=function(){const h=_sp.apply(this,arguments);if(typeof h==='string'&&typeof stt!=='undefined'&&stt==='data'){setTimeout(loadSn,0);return h+abCard()}return h}}
/* ---------- بررسی سلامت ---------- */
async function health(){const L=[],ok=(b,t,w)=>L.push({b,t,w});
  try{localStorage.setItem('dani_hc','1');localStorage.removeItem('dani_hc');ok(1,T('ذخیره‌سازی کار می‌کند','Storage works'))}catch(e){ok(0,T('ذخیره‌سازی در دسترس نیست!','Storage unavailable!'))}
  const kb=Math.round(JSON.stringify(db).length/1024);ok(kb<3500,T('حجم داده: '+fa(kb)+' کیلوبایت','Data size: '+kb+' KB'),T('نزدیک سقف مرورگر (حدود ۵ مگابایت)؛ پشتیبان بگیر','Near the browser limit (~5 MB); back up'));
  const ids=new Set(),dup=db.entries.filter(e=>{if(ids.has(e.id))return true;ids.add(e.id);return false}).length;ok(!dup,T('شناسه‌ی ثبت‌ها یکتاست','Entry ids are unique'),T(fa(dup)+' ثبت با شناسه‌ی تکراری','' +dup+' entries with duplicate ids'));
  const aid=new Set(db.acts.map(a=>a.id)),orph=db.entries.filter(e=>!aid.has(e.actId)).length;ok(!orph,T('همه‌ی ثبت‌ها فعالیت دارند','All entries have an activity'),T(fa(orph)+' ثبت بدون فعالیت (فعالیتِ حذف‌شده؛ از سطل بازیافت می‌شود برگرداند)',orph+' entries without activity (deleted activity; restore from the recycle bin)'));
  const last=Math.max(db.set.lastBk||0,+localStorage.getItem('dani_sync_last')||0),age=last?Math.floor((Date.now()-last)/864e5):null;
  ok(age!==null&&age<=14,age===null?T('هنوز پشتیبان/همگام‌سازی نداشته‌ای','No backup / sync yet'):T('آخرین پشتیبان/همگام‌سازی '+fa(age)+' روز پیش','Last backup/sync '+age+' days ago'),T('پشتیبان بگیر یا همگام‌سازی را وصل کن','Make a backup or connect sync'));
  try{const n=await listSnaps();ok(n.length>0,T('نسخه‌ی خودکار: '+fa(n.length),'Auto snapshots: '+n.length),T('هنوز ساخته نشده؛ چند ثانیه بعد از باز شدن برنامه ساخته می‌شود','Not created yet; made shortly after opening'))}catch(e){}
  try{const e=window.daniErrs?window.daniErrs():[];ok(!e.length,T('خطای ثبت‌شده‌ای نیست','No recorded errors'),T(fa(e.length)+' خطا ثبت شده (دکمه‌ی «گزارش مشکل»)',e.length+' errors recorded (use “Report a problem”)'))}catch(e){}
  try{const nat=window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform();
    if(nat&&typeof Notifier!=='undefined'){const s=Notifier.state;if(s)ok(s.perm==='granted',T('اجازه‌ی اعلان داده شده','Notification permission granted'),T('اجازه‌ی اعلان داده نشده','Notification permission missing'))}
    else ok(1,T('نسخه‌ی وب/PWA (اعلان‌ها فقط با باز بودن برنامه)','Web/PWA (notifications only while the app is open)'))}catch(e){}
  try{const r=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();ok(!!r,T('کار آفلاین فعال است','Offline mode is on'),T('کار آفلاین فعال نیست','Offline mode is off'))}catch(e){}
  return'<div style="max-width:440px">'+daniH('🩺','بررسی سلامت','Health check')+L.map(x=>'<div class="cwr" dir="auto">'+(x.b?'✅ ':'⚠️ ')+esc(x.b?x.t:(x.w||x.t))+'</div>').join('')+'<div class="row" style="margin-top:10px"><button class="p" data-a="ob_close">'+T('بستن','Close')+'</button></div></div>'}
H.hc_run=async()=>{modal('<p class="m">…</p>');modal(await health())};
window.daniHealth=health;
})();
