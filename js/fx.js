"use strict";
/* DANI · fx.js — جلا (همه قابل‌خاموش، db.set.fx {hap,anim}):
   (۱) لرزش ریز روی اقدام‌های مهم (navigator.vibrate) (۲) «پاپ» نرم روی دکمه‌ها (احترام به کاهش حرکت سیستم)
   (۳) صفحه‌ی «چه چیزی تازه است» (یک‌بار بعد از هر نسخه‌ی تازه + دکمه در برگه‌ی راهنما)
   (۴) نمونه‌داده برای آشنایی (فعالیت و ثبت‌های علامت‌دار smp؛ با یک دکمه پاک می‌شود) */
(function(){
const T=window.daniT;
const FX=()=>{const s=db.set;if(!s.fx||typeof s.fx!=='object')s.fx={};if(s.fx.hap===undefined)s.fx.hap=1;if(s.fx.anim===undefined)s.fx.anim=1;return s.fx};
const VER='2026.11.1';
/* ---------- لرزش و پاپ ---------- */
const HAP=/^(qk_go|nx_go|nx_sw|pf_add|tp_ap|bin_rs|ex_save|ab_now|ql_|pm_|tm_|tstart|tfinish|hab|ob_log|ob_go|dnd_set|ls_now|dk_)/;
const reduce=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button,[data-a]');if(!b)return;const a=b.dataset&&b.dataset.a||'';
  const f=FX();
  if(f.hap&&(b.classList.contains('p')||HAP.test(a))){try{navigator.vibrate&&navigator.vibrate(12)}catch(x){}}
  if(f.anim&&!reduce()&&(b.classList.contains('p')||b.classList.contains('chip')||HAP.test(a))){b.classList.remove('fxpop');void b.offsetWidth;b.classList.add('fxpop');setTimeout(()=>b.classList.remove('fxpop'),320)}},true);
const st=document.createElement('style');
st.textContent='@keyframes fxpop{0%{transform:scale(1)}40%{transform:scale(.92)}100%{transform:scale(1)}}.fxpop{animation:fxpop .3s ease}@media(prefers-reduced-motion:reduce){.fxpop{animation:none}}';
document.head.appendChild(st);
/* ---------- چه چیزی تازه است ---------- */
const WN=[
 ['🔒','قفل برنامه با PIN و رمزگذاری فایل همگام‌سازی (تنظیمات ← داده‌ها)','App lock with a PIN and an encrypted sync file (Settings → Data)'],
 ['🖼','کارت اشتراک پیشرفت (نتیجه‌گیری ← کارت اشتراک) و ورود CSV (تنظیمات ← داده‌ها)','Progress share card (Results → Share card) and CSV import (Settings → Data)'],
 ['🔔','تیک عادت از خود اعلان، اعلان‌های گروهی و تاریخچه‌ی اعلان‌ها (تنظیمات ← زمان)','Tick a habit from the notification, grouped notifications and a notification history (Settings → Time)'],
 ['🧩','ویجت در سه اندازه با تیک عادت و «+۱۵ دقیقه» بدون باز کردن برنامه (نیازمند APK جدید)','Widget in 3 sizes with habit ticks and “+15 min” without opening the app (needs the new APK)'],
 ['🧩','کارت «امروز» با تب: بعدی، ثبت، شروع، کار، چرخه، تمرکز، الگو، مرور، فردا','The “Today” card with tabs: next, log, start, task, rhythm, focus, pattern, review, tomorrow'],
 ['🗑','سطل بازیافت: هر چیز حذف‌شده تا ۴۵ روز برمی‌گردد (تنظیمات ← داده‌ها)','Recycle bin: anything deleted comes back for 45 days (Settings → Data)'],
 ['📅','برنامه‌ی فردا (پیشنهاد)، قالب روز/هفته و حالت امتحان','Tomorrow’s plan (suggested), day/week templates and exam mode'],
 ['⏳','برآورد ساعت موعد و پیش‌بینی «به موقع می‌رسی؟»','Deadline hour estimates and an on-time forecast'],
 ['🌙','ساعت سکوت، مزاحم نشو، خلاصه‌ی پایان هفته و هشدار تایمر فراموش‌شده','Quiet hours, Do not disturb, weekly summary and forgotten-timer alert'],
 ['🔄','همگام‌سازی بین دستگاه‌ها با یک فایل (ویرایش و حذف هم)','Sync between devices through one file (edits and deletions too)'],
 ['✦','دکمه‌ی راهنما: قابل‌کشیدن، با اندازه و فاصله‌ی دلخواه + بررسی سلامت','Help button: draggable, adjustable size and edge distance + health check'],
 ['🔎','جست‌وجوی ثبت‌ها و یادداشت‌ها، زیرمرحله‌ی اهداف و بخشش عادت‌ها','Search entries & notes, goal steps and habit forgiveness'],
 ['⏱','تایمر زنده در اعلان، ویجت خانه و دکمه‌های اعلان (با APK جدید)','Live timer notification, home widget and notification buttons (new APK)']];
const seen=()=>{try{return localStorage.getItem('dani_seen_ver')||''}catch(e){return''}};
const mark=()=>{try{localStorage.setItem('dani_seen_ver',VER)}catch(e){}};
function wnHTML(){return'<div style="max-width:440px">'+daniH('🆕','چه چیزی تازه است','What\'s new')+WN.map(x=>'<div class="cwr" style="display:flex;gap:8px"><span aria-hidden="true">'+x[0]+'</span><span dir="auto">'+T(x[1],x[2])+'</span></div>').join('')+'<div class="row" style="margin-top:10px"><button class="p" data-a="ob_close">'+T('باشه','Got it')+'</button></div></div>'}
H.fx_new=()=>{mark();modal(wnHTML())};
setTimeout(()=>{try{if(seen()===VER)return;const used=(db.entries&&db.entries.length>3)||(db.set.ob&&(db.set.ob.fin||db.set.ob.dis));
  if(!used){mark();return}
  if(document.querySelector('#ovl .ov'))return;mark();modal(wnHTML())}catch(e){}},5500);
/* ---------- نمونه‌داده ---------- */
H.fx_smp=()=>{if(db.entries.some(e=>e.smp))return toast(T('نمونه‌داده از قبل هست','Sample data already loaded'),1);
  const A=[['مطالعه‌ی نمونه','Sample study','learn','#3b82f6'],['ورزش نمونه','Sample workout','personal','#10b981'],['پروژه‌ی نمونه','Sample project','work','#8b5cf6']].map(x=>({id:'smp'+uid(),name:T(x[0],x[1]),cat:x[2],tags:[],color:x[3],prio:'',goalDay:0,goalWeek:0,subs:[],desc:'',active:true,days:[],smp:1}));
  A.forEach(a=>db.acts.push(a));const t=todayISO();
  for(let i=0;i<7;i++){const d=addD(t,-i);A.forEach((a,j)=>{if((i+j)%3===2)return;const min=[50,30,75,40][(i+j)%4],h=9+j*3;
    db.entries.push({id:'smp'+uid(),date:d,actId:a.id,min,start:String(h).padStart(2,'0')+':00',end:hm(tm(String(h).padStart(2,'0')+':00')+min),note:'',src:'manual',smp:1})})}
  save();closeM();toast(T('نمونه‌داده اضافه شد؛ از راهنما می‌توانی پاکش کنی','Sample data added; remove it from Help'));render()};
H.fx_smpx=()=>{if(!confirm(T('نمونه‌داده پاک شود؟ (داده‌های خودت دست نمی‌خورد)','Remove sample data? (your own data is untouched)')))return;
  db.entries=db.entries.filter(e=>!e.smp);db.acts=db.acts.filter(a=>!a.smp);if(db.plans)Object.keys(db.plans).forEach(d=>{db.plans[d]=(db.plans[d]||[]).filter(x=>act(x.actId))});save();closeM();render()};
window.daniFx={hasSample:()=>db.entries.some(e=>e.smp),few:()=>db.entries.length<10};
/* ---------- کارت تنظیمات ---------- */
H.fx_hap=()=>{FX().hap=FX().hap?0:1;save();render()};
H.fx_an=()=>{FX().anim=FX().anim?0:1;save();render()};
function card(){const f=FX();
  return'<div class="c" id="fxcard">'+daniH('✨','حس برنامه','App feel')+'<div class="row"><button class="chip '+(f.hap?'on':'')+'" data-a="fx_hap">📳 '+T('لرزش ریز روی اقدام‌های مهم','Light haptics on key actions')+'</button><button class="chip '+(f.anim?'on':'')+'" data-a="fx_an">✨ '+T('انیمیشن نرم دکمه‌ها','Soft button animation')+'</button></div>'
   +'<div class="row" style="margin-top:6px"><button class="chip" data-a="fx_new">🆕 '+T('چه چیزی تازه است','What\'s new')+'</button></div></div>'}
{const _sp=setPage;setPage=function(){const h=_sp.apply(this,arguments);return(typeof h==='string'&&typeof stt!=='undefined'&&stt==='look')?h+card():h}}
})();
