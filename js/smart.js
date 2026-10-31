"use strict";
/* DANI · smart.js — قابلیت‌های هوشمندِ افزوده (همه قابل‌خاموش، بدون حذف چیزی):
   (۱) افزودن سریع با جمله‌ی فارسی/انگلیسی («فردا ۱۸ ریاضی ۲ ساعت») → آیتم برنامه‌ی همان روز؛ کارت بالای تب «برنامه»
   (۲) ساعت‌های طلایی: تب «ساعت‌های طلایی» در نتیجه‌گیری (۶۰ روز اخیر؛ فقط می‌خواند)
   (۳) مناسبت‌ها و تعطیلات: مناسبت‌های ثابتِ شمسی دقیق‌اند؛ مناسبت‌های قمری با Intl (islamic-civil) حساب می‌شوند و ±۱ روز خطا دارند (برچسب «تقریبی»). کارت بالای تب «برنامه»؛ db.set.oc {on}
   (۴) شبکه‌ی ایمنی ذخیره‌سازی: آینه‌ی db در IndexedDB (dani_mirror) هر ۳۰ ثانیه در صورت تغییر؛ اگر داده‌ی اصلی خالی و آینه پر بود، پیشنهاد بازگردانی. (انتقال کاملِ ذخیره‌سازی به IndexedDB هنوز نشده.)
   نوشتن فقط: db.plans[روز] (افزودن سریع) و آینه‌ی IndexedDB. */
(function(){
const T=window.daniT;
const say=(m,b)=>{try{toast(m,b)}catch(e){}};
const OC=()=>{const s=db.set;if(!s.oc||typeof s.oc!=='object')s.oc={on:1};return s.oc};
const DG={'۰':0,'۱':1,'۲':2,'۳':3,'۴':4,'۵':5,'۶':6,'۷':7,'۸':8,'۹':9,'٠':0,'١':1,'٢':2,'٣':3,'٤':4,'٥':5,'٦':6,'٧':7,'٨':8,'٩':9};
const nz=s=>String(s||'').replace(/[۰-۹٠-٩]/g,c=>DG[c]).replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/[\u200c\u200f]/g,' ').replace(/[،,]/g,' ').toLowerCase();

/* ---------- (۱) افزودن سریع ---------- */
const WDS=[['چهار ?شنبه|wed(?:nesday)?',3],['سه ?شنبه|tue(?:sday)?',2],['پنج ?شنبه|thu(?:rsday)?',4],['دو ?شنبه|mon(?:day)?',1],['یک ?شنبه|sun(?:day)?',0],['شنبه|sat(?:urday)?',6],['جمعه|fri(?:day)?',5]];
function parse(txt){let s=' '+nz(txt)+' ',date=todayISO(),dset=false,st='',en='',min=0;
  const cut=re=>{const m=s.match(re);if(m)s=s.replace(re,' ');return m};
  let m;
  if(m=cut(/ (\d{4})[-\/](\d{1,2})[-\/](\d{1,2}) /)){let y=+m[1],mo=+m[2],d=+m[3];if(y<1700){const g=j2g(y,mo,d);y=g[0];mo=g[1];d=g[2]}date=y+'-'+pad(mo)+'-'+pad(d);dset=true}
  else if(cut(/ (پس ?فردا|day after tomorrow) /)){date=addD(todayISO(),2);dset=true}
  else if(cut(/ (فردا|tomorrow) /)){date=addD(todayISO(),1);dset=true}
  else if(cut(/ (امروز|today) /)){dset=true}
  else{for(const[re,dw]of WDS){if(cut(new RegExp(' (?:'+re+') '))){const t=todayISO();let add=0;while(zdow(addD(t,add))!==dw&&add<7)add++;date=addD(t,add);dset=true;break}}}
  /* ساعت: «ساعت ۱۸»، «ساعت ۶ عصر»، «18:30»، «at 6pm» */
  if(m=cut(/ (?:ساعت|at) ?(\d{1,2})(?::(\d{2}))? ?(صبح|ظهر|عصر|بعدازظهر|شب|am|pm)? /)||cut(/ (\d{1,2}):(\d{2}) ?(صبح|ظهر|عصر|شب|am|pm)? /)||cut(/ (\d{1,2})() ?(صبح|ظهر|عصر|بعدازظهر|شب|am|pm) /)){
    let h=+m[1];const mi=+m[2]||0,p=m[3]||'';
    if(/pm|عصر|بعدازظهر/.test(p)&&h<12)h+=12;else if(p==='شب'){if(h<6)h=h;else if(h<12)h+=12;else if(h===12)h=0}else if(p==='ظهر'&&h<5)h+=12;else if(p==='am'&&h===12)h=0;
    if(h<=23&&mi<=59)st=pad(h)+':'+pad(mi)}
  /* مدت */
  if(m=cut(/ (\d+(?:\.\d+)?) ?(?:ساعت|h|hr|hrs|hours?) ?(?:و ?)?(?:(\d+) ?(?:دقیقه|min|mins|m)|(نیم))? /)){min=Math.round(+m[1]*60+(+m[2]||0)+(m[3]?30:0))}
  else if(m=cut(/ (\d+) ?(?:دقیقه|min|mins|minutes|m) /))min=+m[1];
  else if(cut(/ (نیم ساعت|half an hour) /))min=30;
  else if(cut(/ (یک ساعت و نیم) /))min=90;else if(cut(/ (یک ساعت|an hour|one hour) /))min=60;
  s=s.replace(/ (برای|واسه|در|به|را|رو|یه|یک|for|on|at|to|a|the) /g,' ').replace(/ (برای|واسه|در|به|را|رو|یه|یک|for|on|at|to|a|the) /g,' ').replace(/\s+/g,' ').trim();
  return{date,dset,st,min,name:s}}
function findAct(name){if(!name)return null;const l=db.acts.filter(a=>a.active&&!a.arch),n=name.toLowerCase();
  return l.find(a=>nz(a.name).trim()===n)||l.filter(a=>nz(a.name).includes(n)||n.includes(nz(a.name).trim())).sort((a,b)=>a.name.length-b.name.length)[0]||null}
function resolve(txt){const p=parse(txt);if(!p.name)return null;const a=findAct(p.name);let min=p.min||(p.st?60:(a&&a.goalDay)||45),st=p.st,en='';
  if(st)en=hm((tm(st)+min)%1440);return{date:p.date,st,en,min,act:a,newName:a?'':p.name.slice(0,80)}}
let QV='';
function describe(r){if(!r)return T('بنویس مثلاً: فردا ۱۸ ریاضی ۲ ساعت','Try: tomorrow 18:00 maths 2 hours');
  return'📌 '+fmtDL(r.date)+(r.st?' · '+r.st+'–'+r.en:'')+' · '+mm(r.min)+' · <b>'+esc(r.act?r.act.name:r.newName)+'</b>'+(r.act?'':' <span class="m">('+T('فعالیت تازه ساخته می‌شود','a new activity will be created')+')</span>')}
function qCard(){return'<div class="c" id="qncard">'+daniH('✍️','افزودن سریع با یک جمله','Quick add with one sentence')
  +'<div class="row"><input id="qn-in" dir="auto" style="flex:1;min-width:0" value="'+esc(QV)+'" placeholder="'+T('فردا ساعت ۱۸ ریاضی ۲ ساعت','tomorrow 18:00 maths 2 hours')+'"><button class="p" data-a="qn_add">＋</button></div>'
  +'<div class="m" id="qn-pv" style="margin-top:6px">'+describe(QV?resolve(QV):null)+'</div>'
  +'<p class="m">'+T('تاریخ: امروز، فردا، پس‌فردا، نام روز هفته یا تاریخ ۱۴۰۵/۰۸/۱۰ · ساعت: «ساعت ۱۸» یا «۶ عصر» · مدت: «۲ ساعت»، «۴۵ دقیقه»، «نیم ساعت». نام فعالیت باید با یکی از فعالیت‌هایت بخواند.','Date: today, tomorrow, a weekday name or 2026-10-30 · time: “at 18:00” or “6pm” · duration: “2 hours”, “45 min”. The name should match one of your activities.')+'</p></div>'}
document.addEventListener('input',e=>{const t=e.target;if(t&&t.id==='qn-in'){QV=t.value;const pv=document.getElementById('qn-pv');if(pv)pv.innerHTML=describe(QV?resolve(QV):null)}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target&&e.target.id==='qn-in'){e.preventDefault();H.qn_add()}});
H.qn_add=()=>{const r=resolve(QV);if(!r)return say(T('جمله را کامل‌تر بنویس','Write a fuller sentence'),1);
  let a=r.act;if(!a){const ck=typeof catOf==='function'?catOf(r.newName):'personal';a={id:uid(),name:r.newName,cat:ck,tags:[],color:(CATS[ck]||CATS.personal)[1],prio:'',goalDay:0,goalWeek:0,subs:[],desc:'',active:true,days:[]};db.acts.push(a)}
  if(!db.plans)db.plans={};(db.plans[r.date]=db.plans[r.date]||[]).push({id:uid(),actId:a.id,start:r.st,end:r.en,goal:r.min,status:'todo',reason:'quick'});
  if(!save())return;QV='';say(T('به برنامه‌ی '+fmtDL(r.date)+' اضافه شد ✓','Added to the plan of '+fmtDL(r.date)+' ✓'));render()};

/* ---------- (۳) مناسبت‌ها ---------- */
const FIX=[[1,1,'نوروز','Nowruz',1],[1,2,'نوروز','Nowruz',1],[1,3,'نوروز','Nowruz',1],[1,4,'نوروز','Nowruz',1],[1,12,'روز جمهوری اسلامی','Islamic Republic Day',1],[1,13,'سیزده‌به‌در','Sizdah Bedar',1],[3,14,'رحلت امام خمینی','Death of Imam Khomeini',1],[3,15,'قیام ۱۵ خرداد','15 Khordad uprising',1],[11,22,'پیروزی انقلاب اسلامی','Revolution Day',1],[12,29,'ملی شدن صنعت نفت','Oil Nationalisation Day',1]];
const LUN=[[1,9,'تاسوعا','Tasua',1],[1,10,'عاشورا','Ashura',1],[2,20,'اربعین','Arbaeen',1],[2,28,'رحلت پیامبر و شهادت امام حسن','Prophet’s demise & Imam Hasan’s martyrdom',1],[2,30,'شهادت امام رضا','Imam Reza’s martyrdom',1],[3,17,'میلاد پیامبر و امام صادق','Prophet’s birthday',1],[6,20,'ولادت حضرت فاطمه','Fatima’s birthday',1],[7,13,'ولادت امام علی','Imam Ali’s birthday',1],[7,27,'مبعث پیامبر','Mab’ath',1],[8,15,'نیمه شعبان','Mid-Sha’ban',1],[9,21,'شهادت امام علی','Imam Ali’s martyrdom',1],[10,1,'عید فطر','Eid al-Fitr',1],[10,2,'عید فطر','Eid al-Fitr',1],[10,25,'شهادت امام صادق','Imam Sadiq’s martyrdom',1],[12,10,'عید قربان','Eid al-Adha',1],[12,18,'عید غدیر','Eid al-Ghadir',1]];
let hf=null;try{hf=new Intl.DateTimeFormat('en-u-ca-islamic-civil-nu-latn',{day:'numeric',month:'numeric',year:'numeric'})}catch(e){}
function hijri(d){if(!hf)return null;try{const p=hf.formatToParts(new Date(d+'T12:00:00')),o={};p.forEach(x=>{o[x.type]=+x.value});return o.month&&o.day?[o.month,o.day]:null}catch(e){return null}}
function occ(d){const[y,m,dd]=(()=>{const[a,b,c]=d.split('-').map(Number);return g2j(a,b,c)})(),out=[];
  FIX.forEach(f=>{if(f[0]===m&&f[1]===dd)out.push({n:T(f[2],f[3]),h:!!f[4],ap:false})});
  const hj=hijri(d);if(hj)LUN.forEach(f=>{if(f[0]===hj[0]&&f[1]===hj[1])out.push({n:T(f[2],f[3]),h:!!f[4],ap:true})});
  if(zdow(d)===5&&!out.some(x=>x.h))out.push({n:T('جمعه','Friday'),h:true,ap:false,wk:true});return out}
function oCard(){const t=todayISO(),rows=[];for(let i=0;i<=21&&rows.length<5;i++){const d=addD(t,i);occ(d).filter(x=>!x.wk).forEach(x=>rows.push({d,i,x}))}
  const td=occ(t).filter(x=>!x.wk);
  let h='<div class="c" id="occard">'+daniH('🗓','مناسبت‌ها و تعطیلات','Occasions & holidays');
  h+=td.length?'<div class="cwr">'+(td.some(x=>x.h)?'🟥 ':'')+'<b>'+T('امروز: ','Today: ')+td.map(x=>esc(x.n)).join(' · ')+'</b></div>':'';
  h+=rows.filter(r=>r.i>0).length?rows.filter(r=>r.i>0).map(r=>'<div class="cwr" style="display:flex;gap:8px"><span>'+(r.x.h?'🟥':'▫️')+'</span><span style="flex:1" dir="auto">'+esc(r.x.n)+(r.x.ap?' <span class="m">('+T('تقریبی','approx.')+')</span>':'')+'</span><span class="m">'+fmtD(r.d)+' · '+(r.i===1?T('فردا','tomorrow'):T(fa(r.i)+' روز دیگر',r.i+' days'))+'</span></div>').join(''):'<p class="m">'+T('تا ۳ هفته‌ی آینده مناسبتی نیست.','No occasions in the next 3 weeks.')+'</p>';
  return h+'<p class="m">'+T('مناسبت‌های شمسی دقیق‌اند؛ مناسبت‌های قمری با حساب خودکار تا ±۱ روز با اعلام رسمی فرق دارند.','Solar-calendar dates are exact; lunar ones are calculated and can differ by ±1 day from the official announcement.')+'</p></div>'}
H.oc_t=()=>{OC().on=OC().on?0:1;save();render()};

/* کارت‌های بالای تب «برنامه» */
{const _p=PX.plan;if(typeof _p==='function')PX.plan=function(){const h=_p.apply(this,arguments);let a='',b='';try{a=qCard()}catch(e){console.error(e)}try{if(OC().on)b=oCard()}catch(e){console.error(e)}
  return(typeof h==='string'?a+(b?'<details class="c" id="ocdet"><summary style="cursor:pointer">'+daniH('🗓','مناسبت‌ها و تعطیلات','Occasions & holidays')+'</summary>'+b.replace('<div class="c" id="occard">','<div id="occard">')+'<div class="row"><button class="chip" data-a="oc_t">'+T('خاموش‌کردن این کارت','Turn this card off')+'</button></div></details>':''):'')+h}}
/* خاموش‌شده را از تنظیمات ← ظاهر برگردان */
{const _sp=setPage;setPage=function(){const h=_sp.apply(this,arguments);return(typeof h==='string'&&typeof stt!=='undefined'&&stt==='look'&&!OC().on)?h+'<div class="c">'+daniH('🗓','مناسبت‌ها و تعطیلات','Occasions & holidays')+'<div class="row"><button class="chip" data-a="oc_t">'+T('روشن‌کردن کارت مناسبت‌ها','Turn the occasions card on')+'</button></div></div>':h}}
window.daniOccasions=occ;

/* ---------- (۲) ساعت‌های طلایی ---------- */
let GF='all';
H.gl_f=e=>{GF=e.dataset.f;render()};
function golden(){const t=todayISO(),es=(E(addD(t,-59),t)||[]).filter(e=>e.actId&&act(e.actId)&&act(e.actId).cat!=='sleep'&&act(e.actId).cat!=='rest'&&(GF==='all'||['learn','work'].includes(cat(e)))),hr=new Array(24).fill(0),wd=new Array(7).fill(0);
  es.forEach(e=>{if(!/^\d\d:\d\d$/.test(e.start||''))return;let s=tm(e.start),left=e.min||0;wd[(P(e.date).getDay()+1)%7]+=left;while(left>0){const h=Math.floor(s/60)%24,room=60-(s%60),u=Math.min(left,room);hr[h]+=u;s+=u;left-=u}});
  const tot=hr.reduce((a,b)=>a+b,0),mx=Math.max(1,...hr);let bi=-1,bv=0;for(let i=0;i<24;i++){const v=hr[i]+hr[(i+1)%24];if(v>bv){bv=v;bi=i}}
  const WN=[T('شنبه','Sat'),T('یکشنبه','Sun'),T('دوشنبه','Mon'),T('سه‌شنبه','Tue'),T('چهارشنبه','Wed'),T('پنجشنبه','Thu'),T('جمعه','Fri')],wmx=Math.max(1,...wd),bw=wd.indexOf(Math.max(...wd));
  let h='<div class="c" id="glcard">'+daniH('🌟','ساعت‌های طلایی','Golden hours')+'<p class="m">'+T('بر پایه‌ی ثبت‌های ۶۰ روز اخیرت (بدون خواب و استراحت): در چه ساعت‌هایی بیشتر کار می‌کنی.','Based on your last 60 days of entries (excluding sleep and rest): when you actually work most.')+'</p>'
   +'<div class="row"><button class="chip '+(GF==='all'?'on':'')+'" data-a="gl_f" data-f="all">'+T('همه‌ی فعالیت‌ها','All activities')+'</button><button class="chip '+(GF==='lw'?'on':'')+'" data-a="gl_f" data-f="lw">'+T('یادگیری و کار','Learning & work')+'</button></div>';
  if(tot<180)return h+'<p class="m">'+T('هنوز داده‌ی کافی نیست؛ چند روز بیشتر ثبت کن.','Not enough data yet — log a few more days.')+'</p></div>';
  h+='<div style="display:flex;align-items:flex-end;gap:2px;height:110px;margin:10px 0 2px;direction:ltr">'+hr.map((v,i)=>'<div title="'+pad(i)+':00 · '+mm(v)+'" style="flex:1;height:'+Math.max(2,Math.round(v/mx*100))+'%;background:'+(i===bi||i===(bi+1)%24?'#f59e0b':'var(--ac)')+';border-radius:3px 3px 0 0;opacity:'+(v?1:.25)+'"></div>').join('')+'</div>'
   +'<div style="display:flex;direction:ltr;font-size:10px;opacity:.7">'+hr.map((v,i)=>'<span style="flex:1;text-align:center">'+(i%3===0?i:'')+'</span>').join('')+'</div>'
   +'<div class="cwr" style="margin-top:8px">🌟 '+T('بهترین بازه‌ی دوساعته: ','Best 2-hour window: ')+'<b dir="ltr">'+pad(bi)+':00–'+pad((bi+2)%24)+':00</b></div>'
   +'<div class="cwr">📅 '+T('پرکارترین روز هفته: ','Most productive weekday: ')+'<b>'+WN[bw]+'</b> ('+mm(wd[bw])+')</div>'
   +'<p class="m">'+T('پیشنهاد: سخت‌ترین کار روز را در همین بازه بگذار و کارهای سبک را به ساعت‌های کم‌بازده بسپار.','Tip: put your hardest task in this window and leave light tasks for the quieter hours.')+'</p>';
  return h+'</div>'}
try{if(typeof RT!=='undefined'&&!RT.some(x=>x[0]==='gld'))RT.push(['gld',T('ساعت‌های طلایی','Golden hours')])}catch(e){}
{const _r=PG.res;PG.res=function(){if(typeof rt!=='undefined'&&rt==='gld')return tabBar(RT,rt,'r')+golden();return _r.apply(this,arguments)}}
H.gl_f=e=>{GF=e.dataset.f==='lw'?'lw':'all';render()};

/* ---------- (۴) آینه‌ی IndexedDB ---------- */
const IDN='dani_mirror',ST='m';
const idb=()=>new Promise((res,rej)=>{try{const r=indexedDB.open(IDN,1);r.onupgradeneeded=()=>r.result.createObjectStore(ST);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}});
const put=async v=>{const d=await idb();return new Promise((res,rej)=>{const t=d.transaction(ST,'readwrite');t.objectStore(ST).put(v,'db');t.oncomplete=()=>res(true);t.onerror=()=>rej(t.error)})};
const get=async()=>{const d=await idb();return new Promise((res,rej)=>{const r=d.transaction(ST).objectStore(ST).get('db');r.onsuccess=()=>res(r.result||null);r.onerror=()=>rej(r.error)})};
let dirty=false;{const _s=save;save=function(){const r=_s.apply(this,arguments);dirty=true;return r}}
async function mirror(){if(!dirty||!db||!Array.isArray(db.entries))return;dirty=false;try{await put({t:Date.now(),n:db.entries.length,json:JSON.stringify(db)})}catch(e){dirty=true}}
setInterval(mirror,30000);document.addEventListener('visibilitychange',()=>{if(document.hidden)mirror()});
async function checkRecover(){try{const m=await get();if(!m||!m.json)return;const emptyNow=!db.entries||db.entries.length===0;if(!(emptyNow&&m.n>5))return;
  modal('<div style="max-width:440px">'+daniH('🛟','داده‌ی ذخیره‌شده پیدا شد','Saved data found')+'<p>'+T('داده‌ی اصلی خالی است ولی یک نسخه‌ی آینه با '+fa(m.n)+' ثبت از '+new Date(m.t).toLocaleString()+' هست. بازگردانی شود؟','The main data is empty but a mirror copy with '+m.n+' entries from '+new Date(m.t).toLocaleString()+' exists. Restore it?')+'</p><div class="row"><button class="p" data-a="mr_go">'+T('بازگردانی','Restore')+'</button><button data-a="ob_close">'+T('نه، ممنون','No thanks')+'</button></div></div>')}catch(e){}}
H.mr_go=async()=>{try{const m=await get();if(!m)return;snap();localStorage.setItem(KEY,JSON.stringify(JSON.parse(m.json)));location.reload()}catch(e){say(String(e&&e.message||e),1)}};
setTimeout(checkRecover,4000);
window.daniQuickParse=parse;
})();
