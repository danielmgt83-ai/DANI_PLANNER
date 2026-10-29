"use strict";
/* DANI · quick-health.js — (۱) «شروع سریع» با یک لمس  (۲) «سلامت اعلان‌ها» در تنظیمات ← زمان و اعلان
   (۱) بالای فرم ثبت: فعالیت‌های پرکاربرد؛ یک لمس = کرنومتر (یا پومودورو). فرم کامل زیر «جزئیات و ثبت دستی» جمع می‌شود (قابل‌باز کردن؛ حالت قبلی با یک لمس).
   (۲) چک‌لیست: مجوز، آلارم دقیق، تعداد و بازه‌ی اعلان‌های زمان‌بندی‌شده، ساعت سکوت و راهنمای تنظیمات باتری گوشی.
   داده: db.set.qk ({open,pm}). این فایل باید قبل از pomodoro.js بیاید (recCard را از داخل می‌پیچد). */
(function(){
const T=window.daniT;
const QK=()=>{const s=db.set;if(!s.qk||typeof s.qk!=='object')s.qk={open:0,pm:0};return s.qk};
/* ---------- فعالیت‌های پرکاربرد ---------- */
function top(){const now=Date.now(),sc={};
  (db.entries||[]).forEach(e=>{if(!e||!e.actId||!e.date)return;const ag=Math.max(0,(now-new Date(e.date+'T12:00:00').getTime())/864e5);if(ag>60)return;sc[e.actId]=(sc[e.actId]||0)+Math.max(1,e.min||1)*Math.exp(-ag/14)});
  const ok=a=>a&&a.active&&!a.arch,l=Object.keys(sc).map(id=>act(id)).filter(ok).sort((a,b)=>sc[b.id]-sc[a.id]).slice(0,6);
  if(l.length<4)db.acts.filter(a=>ok(a)&&!l.includes(a)).slice(0,6-l.length).forEach(a=>l.push(a));return l}
function bar(){const q=QK(),l=top();if(!l.length)return'';
  return'<div class="c qkc">'+daniH('▶','شروع سریع','Quick start')+'<div class="m">'+T('یک لمس','One tap')+'</div><div class="row" style="margin-top:6px">'
   +l.map(a=>'<button class="chip" data-a="qk_go" data-id="'+esc(a.id)+'" style="border-inline-start:4px solid '+aC(a.id)+'">'+esc(a.name)+'</button>').join('')+'</div>'
   +'<div class="row" style="margin-top:6px"><button class="chip '+(q.pm?'on':'')+'" data-a="qk_pm" aria-pressed="'+(q.pm?'true':'false')+'">🍅 '+T('با پومودورو','With Pomodoro')+'</button><span class="sp"></span>'
   +'<button class="chip" data-a="qk_t">'+(q.open?'▴ ':'▾ ')+T('جزئیات و ثبت دستی','Details & manual log')+'</button></div></div>'}
window.daniQuickBar=bar;
const _rc=recCard;recCard=function(){const t=db.timer;const o=_rc.apply(this,arguments);if(!t||t.state!=='ready')return o;
  const q=QK();return(window.daniTdMode?'':bar())+(q.open?o:'')};
H.qk_go=e=>{const id=e.dataset.id;if(!act(id))return;
  if(QK().pm&&window.daniPomoStart)window.daniPomoStart(id);else TM.start('sw',id,'',0);render()};
H.qk_pm=()=>{QK().pm=QK().pm?0:1;save();render()};
H.qk_t=()=>{QK().open=QK().open?0:1;save();render()};
{const o=H.arec;if(typeof o==='function')H.arec=function(){QK().open=1;return o.apply(this,arguments)}}

/* ---------- سلامت اعلان‌ها ---------- */
function health(){const N=typeof Notifier!=='undefined'?Notifier:null;if(!N)return'';const s=N.state,nat=N.isNative();let list=[];try{list=N.plan()}catch(e){}
  const last=list.reduce((m,x)=>Math.max(m,x.at),0),ok=b=>b?'✅':'⚠️';let q=false;try{q=!!(rSet().quiet&&rSet().quiet.on)}catch(e){}
  const row=(good,txt)=>'<div class="m" style="margin:3px 0">'+ok(good)+' '+txt+'</div>';
  let h='<div class="c" id="nthealth" style="margin-top:10px">'+daniH('🩺','سلامت اعلان‌ها','Notification health')+'';
  h+=row(s.perm==='granted',T('اجازه‌ی اعلان: ','Notification permission: ')+(s.perm==='granted'?T('مجاز','allowed'):T('لازم است فعال شود','must be enabled')));
  if(nat){h+=row(s.exact==='granted',T('آلارم دقیق: ','Exact alarm: ')+(s.exact==='granted'?T('مجاز','allowed'):T('خاموش؛ زنگ ممکن است چند دقیقه دیر بیاید','off — alarms may be late')));
    h+=row(list.length>0,T('اعلان زمان‌بندی‌شده: ','Scheduled: ')+fa(list.length)+(last?' · '+T('تا ','until ')+fmtD(iso(new Date(last))):''));
    h+='<div class="m" style="margin:3px 0">ℹ️ '+T('اعلان‌ها تا ۱۴ روز آینده (حداکثر ۶۰ عدد) ثبت می‌شوند و هر بار اپ را باز کنی تمدید می‌شود؛ اگر بیشتر از ۱۴ روز اپ را باز نکنی، یادآورهای دورتر زنگ نمی‌زنند.','Notifications are registered for the next 14 days (max 60) and renewed each time you open the app; if you do not open it for over 14 days, later reminders will not ring.')+'</div>'}
  else h+='<div class="m" style="margin:3px 0">ℹ️ '+T('این نسخه‌ی وب است؛ برای زنگ مطمئن در حالت بسته‌بودن، اپ اندروید را نصب کن.','This is the web version; install the Android app for reliable alarms while closed.')+'</div>';
  h+='<div class="m" style="margin:3px 0">'+(q?'🌙 '+T('ساعت سکوت یادآورها روشن است؛ یادآورها در آن بازه نمی‌آیند (زنگ تایمر می‌آید).','Reminder quiet hours are on; reminders do not ring in that window (timer alarms still do).'):'🔔 '+T('ساعت سکوت خاموش است.','Quiet hours are off.'))+'</div>';
  if(nat)h+='<details style="margin-top:6px"><summary class="m">'+T('اگر زنگ دیر آمد یا نیامد (تنظیمات گوشی)','If an alarm is late or missing (phone settings)')+'</summary><div class="m" style="margin-top:6px">'
    +T('۱) تنظیمات ← برنامه‌ها ← DANI ← باتری ← «بدون محدودیت».<br>۲) تنظیمات ← برنامه‌ها ← DANI ← اعلان‌ها ← همه‌ی کانال‌ها روشن؛ کانال «زنگ و تایمر» روی اهمیت بالا.<br>۳) تنظیمات ← برنامه‌ها ← دسترسی ویژه ← «آلارم و یادآور» روشن.<br>۴) اگر «مزاحم نشوید» روشن است، DANI را در استثناها بگذار.<br>۵) در شیائومی/سامسونگ/هواوی: «شروع خودکار» یا «نگه‌داشتن در پس‌زمینه» را برای DANI روشن کن و اپ را از لیست اخیر قفل کن.',
       '1) Settings → Apps → DANI → Battery → Unrestricted.<br>2) Settings → Apps → DANI → Notifications → all channels on; set "Alarm & timer" to high importance.<br>3) Settings → Apps → Special access → "Alarms & reminders" on.<br>4) If Do Not Disturb is on, add DANI to its exceptions.<br>5) On Xiaomi/Samsung/Huawei: allow auto-start/background for DANI and lock the app in recents.')+'</div></details>';
  return h+'</div>'}
{const _sp=setPage;setPage=function(){const h=_sp.apply(this,arguments);return typeof h==='string'&&typeof stt!=='undefined'&&stt==='time'?h+health():h}}
})();
