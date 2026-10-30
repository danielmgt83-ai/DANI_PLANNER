"use strict";
/* DANI · notifx.js — بقیه‌ی مرحله ۵: (۱) اعلان‌های گروهی و (۲) تاریخچه‌ی اعلان‌ها. (تیک عادت از اعلان در notifier.js است.)
   گروه: db.set.ng {on}؛ اعلان‌های عادی (یادآور، خلاصه‌ها، هشدارها) در اندروید یک گروه می‌شوند (فیلد group افزونه‌ی اعلان)؛ زنگ تایمر/پومودورو و اعلان سنجاق‌شده هرگز گروه نمی‌شوند.
        خلاصه‌ی گروه را خودِ اندروید می‌سازد؛ برای تغییر نیاز به APK جدید نیست.
   تاریخچه: هر بار برنامه‌ی اعلان‌ها محاسبه می‌شود (از طریق daniPlanFilter) فهرست آینده در localStorage (dani_ns) نگه داشته می‌شود؛ هر اعلانی که وقتش گذشته به تاریخچه (dani_nh؛ ۳۰۰ مورد/۶۰ روز) می‌رود، حتی اگر برنامه بسته بوده. در وب، نمایش هر اعلان (showN) ثبت می‌شود.
        وضعیت یادآورها (انجام/به‌تعویق/ازدست‌رفته) از log یادآورها خوانده می‌شود. فقط روی همین دستگاه می‌ماند (نه در پشتیبان). */
(function(){
const T=window.daniT;
const NG=()=>{const s=db.set;if(!s.ng||typeof s.ng!=='object')s.ng={on:1};return s.ng};
const gj=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return Array.isArray(v)||v&&typeof v==='object'?v:d}catch(e){return d}};
const sj=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const NH='dani_nh',NS='dani_ns',MAXH=300,AGE=60*864e5;
const kind=k=>/^(timer|pomo)/.test(k)?'t':String(k).split('|').length===3?'r':'o';

/* ---------- گروه ---------- */
window.daniNoteExtra=x=>{try{if(!NG().on||x.ongoing||x.ch==='dani-alarm-v2'||x.ch==='dani-pin-v1')return null;if(/^(timer|pomo)/.test(String(x.key||'')))return null;return{group:kind(String(x.key||''))==='r'?'dani-rem':'dani-misc'}}catch(e){return null}};
H.ng_t=()=>{NG().on=NG().on?0:1;save();try{Notifier.sync(true)}catch(e){}render()};

/* ---------- تاریخچه ---------- */
let hist=gj(NH,[]),sched=gj(NS,[]);
const add=(e)=>{if(hist.some(h=>h.k===e.k&&h.at===e.at))return;hist.push(e)};
function flush(now){let ch=false;const keep=[];
  sched.forEach(x=>{if(x.at<=now-3000){add({at:x.at,ti:x.ti,b:x.b,k:x.k,ch:x.ch});ch=true}else keep.push(x)});
  if(ch||keep.length!==sched.length){sched=keep;sj(NS,sched)}
  if(ch){hist=hist.filter(h=>now-h.at<AGE).sort((a,b)=>a.at-b.at).slice(-MAXH);sj(NH,hist)}}
function record(list,now){try{flush(now);
  const nx=list.filter(x=>x&&!x.ongoing&&x.at>now).map(x=>({at:x.at,ti:String(x.title||'').slice(0,100),b:String(x.body||'').slice(0,160),k:String(x.key||''),ch:x.ch||''})).slice(0,80);
  if(JSON.stringify(nx)!==JSON.stringify(sched)){sched=nx;sj(NS,sched)}}catch(e){console.error('notifx',e)}}
{const _f=window.daniPlanFilter;window.daniPlanFilter=function(out,now){let r=out;try{if(_f)r=_f(out,now)||out}catch(e){}record(r,now);return r}}
/* وب/PWA: نمایش واقعی اعلان */
try{if(typeof showN==='function'){const _s=showN;showN=async function(t,b,o){const r=await _s.apply(this,arguments);try{if(r!==false){add({at:Date.now(),ti:String(t||'').slice(0,100),b:String(b||'').slice(0,160),k:String((o&&o.tag)||'web'),ch:'web'});hist=hist.slice(-MAXH);sj(NH,hist)}}catch(e){}return r}}}catch(e){}
setInterval(()=>{try{flush(Date.now())}catch(e){}},20000);document.addEventListener('visibilitychange',()=>{try{flush(Date.now())}catch(e){}});setTimeout(()=>{try{flush(Date.now())}catch(e){}},1500);

let F='a',OPEN=false;
H.nh_f=e=>{F=e.dataset.f;render()};
H.nh_clear=()=>{if(!confirm(T('تاریخچه‌ی اعلان‌ها پاک شود؟ (اعلان‌های آینده دست‌نخورده می‌مانند)','Clear the notification history? (Upcoming notifications are untouched)')))return;hist=[];sj(NH,hist);render()};
const ST={done:['✅',T('انجام شد','Done')],snooze:['⏰',T('به‌تعویق','Snoozed')],skip:['↷',T('رد شد','Skipped')],missed:['✗',T('ازدست‌رفته','Missed')],fired:['🔔',T('اعلان شد','Shown')]};
function status(h){if(kind(h.k)!=='r')return['🔔',T('اعلان شد','Shown')];try{const x=zRM().log.find(z=>z.k===h.k);if(x&&ST[x.st])return ST[x.st]}catch(e){}return ST.fired}
const hh=t=>{const d=new Date(t);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')};
function card(){flush(Date.now());OPEN=!!window.__nhO;const ng=NG().on,rows=hist.slice().reverse().filter(h=>F==='a'||(F==='r'?kind(h.k)==='r':F==='t'?kind(h.k)==='t':!/^(r|t)$/.test(kind(h.k)))||(F==='w'&&h.ch==='web')).slice(0,60);
  const chips=[['a',T('همه','All')],['r',T('یادآورها','Reminders')],['t',T('تایمر','Timer')],['o',T('دیگر','Other')]];
  let h='<div class="c" id="nhcard">'+daniH('🔔','اعلان‌های گروهی و تاریخچه','Grouped notifications & history')
   +'<div class="row"><button class="chip '+(ng?'on':'')+'" data-a="ng_t">🗂 '+T('گروه‌کردن اعلان‌های عادی','Group normal notifications')+'</button></div>'
   +'<p class="m">'+T('در اپ اندروید، اعلان‌های عادی یک‌جا جمع می‌شوند تا نوار اعلان شلوغ نشود (زنگ تایمر و پومودورو همیشه جدا و بلند می‌آید). یادآوری که به یک عادت وصل است دکمه‌ی «انجام شد (عادت تیک بخورد)» دارد.','In the Android app normal notifications are bundled so the shade stays tidy (timer and Pomodoro alarms always ring separately). A reminder linked to a habit has a “Done (tick habit)” button.')+'</p>'
   +'<details'+(OPEN?' open':'')+' ontoggle="window.__nhO=this.open"><summary style="cursor:pointer"><b>'+T('تاریخچه‌ی اعلان‌ها','Notification history')+'</b> · '+(typeof fa==='function'?fa(hist.length):hist.length)+'</summary>'
   +'<div class="row" style="margin-top:6px">'+chips.map(c=>'<button class="chip '+(F===c[0]?'on':'')+'" data-a="nh_f" data-f="'+c[0]+'">'+c[1]+'</button>').join('')+'<span style="flex:1"></span><button class="chip" data-a="nh_clear">🗑 '+T('پاک‌کردن','Clear')+'</button></div>'
   +(rows.length?rows.map(x=>{const s=status(x);return'<div class="cwr" style="display:flex;gap:8px;align-items:flex-start"><span aria-hidden="true">'+s[0]+'</span><span style="flex:1;min-width:0" dir="auto"><b>'+esc(x.ti)+'</b>'+(x.b?'<br><span class="m">'+esc(x.b)+'</span>':'')+'</span><span class="m" style="white-space:nowrap;text-align:end">'+fmtD(dayStr(x.at))+'<br>'+hh(x.at)+' · '+s[1]+'</span></div>'}).join(''):'<p class="m">'+T('هنوز اعلانی ثبت نشده. از حالا هر اعلانی که بیاید اینجا می‌ماند (۶۰ روز، فقط روی همین دستگاه).','No notifications recorded yet. From now on every notification stays here (60 days, this device only).')+'</p>')
   +'</details></div>';
  return h}
const dayStr=t=>{const d=new Date(t);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
{const _sp=setPage;setPage=function(){const h=_sp.apply(this,arguments);return(typeof h==='string'&&typeof stt!=='undefined'&&stt==='time')?h+card():h}}
window.daniNotifHistory={list:()=>hist.slice(),flush};
})();
