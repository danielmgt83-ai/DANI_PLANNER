"use strict";
/* DANI · notifier.js
   لایه‌ی یکپارچه‌ی اعلان و زنگ.
   - در «اپ اندروید» (پوسته‌ی Capacitor): پایان تایمر، هشدار پیش از پایان و یادآورها (۱۴ روز آینده) را
     در سیستم‌عامل زمان‌بندی می‌کند؛ پس با بسته‌بودن برنامه هم اعلان + زنگ می‌آید.
   - در نسخه‌ی وب (PWA): اعلان قوی‌تر (نیاز به لمس، لرزش بلند)، نگه‌داشتن صفحه روشن هنگام تایمر (اختیاری)
     و راهنمای خروجی تقویم (.ics) برای زنگ مطمئن.
   هیچ قابلیت قبلی حذف نشده؛ فقط توابع notify / showN / sysNotify را هوشمندتر می‌کند و تکراری‌نشدن را تضمین می‌کند.
   فایل‌های js/ کلاسیک‌اند و فضای سراسری مشترک دارند. این فایل بعد از home-desk.js بارگذاری می‌شود. */
const Notifier=(()=>{
  const L=(fa,en)=>LANGEN()?en:fa;
  const cap=()=>window.Capacitor;
  const isNative=()=>{try{return !!(cap()&&cap().isNativePlatform&&cap().isNativePlatform())}catch(e){return false}};
  const LN=()=>{try{return cap().Plugins.LocalNotifications||null}catch(e){return null}};
  const CH_ALARM='dani-alarm-v2',CH_REM='dani-remind-v2';
  const ID_TIMER=1,ID_PRE=2,ID_TEST=3,DAYS=14,MAXN=60;
  const st={perm:'unknown',exact:'unknown',pending:0,sig:'',keys:{},tAts:[],err:'',busy:false,again:false,ready:false};
  const hash=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return 100+Math.abs(h)%2000000000};
  const timerEnd=()=>{try{const t=db.timer;if(t&&t.state==='running'&&t.mode==='cd'){const rem=t.dur-el();return rem>0?Date.now()+rem:0}}catch(e){}return 0};

  /* ---------- برنامه‌ی اعلان‌های آینده ---------- */
  function plan(){
    const now=Date.now(),out=[];
    try{const end=timerEnd();
      if(end>now+1500){let nm='';try{nm=aN(db.timer.actId)}catch(e){}
        out.push({id:ID_TIMER,at:end,title:'DANI ⏰',body:L('زمان تمام شد: ','Time is up: ')+nm,ch:CH_ALARM,key:'timer-end'});
        const pre=+db.set.pre;if(pre>0&&db.timer.dur>pre*60000&&end-pre*60000>now+1500)
          out.push({id:ID_PRE,at:end-pre*60000,title:'DANI',body:L('تا پایان '+fa(pre)+' دقیقه مانده','Ends in '+pre+' min'),ch:CH_REM,key:'timer-pre'})}}catch(e){}
    try{(window.daniExtraPlan||[]).forEach(f=>{(f(now)||[]).forEach(x=>out.push(x))})}catch(e){}
    try{if(modOn('rem')&&zRM().set.notif!==false){
      rFires(now,now+DAYS*864e5).forEach(f=>{if(f.ts>now+2000&&!inQuiet(f.ts))out.push({id:hash(f.k),at:f.ts,title:S_(f.r.title,80),body:f.o?L('یادآوری پیش از موعد','Heads-up before it is due'):L('اکنون','Now'),ch:CH_REM,key:f.k})});
      (zRM().snz||[]).forEach(s=>{if(s&&typeof s.at==='number'&&s.at>now+2000){const r=rItems().concat(dlRems()).find(x=>x.id===s.rid);if(r)out.push({id:hash(s.k+'|z'+Math.floor(s.at/1000)),at:s.at,title:S_(r.title,80),body:L('یادآوری مجدد','Snoozed reminder'),ch:CH_REM,key:s.k+'|z'+Math.floor(s.at/1000)})}})}}catch(e){console.error('notifier plan',e)}
    out.sort((a,b)=>a.at-b.at);
    const seen=new Set();return out.filter(x=>!seen.has(x.id)&&seen.add(x.id)).slice(0,MAXN)}

  /* ---------- اپ اندروید ---------- */
  /* دکمه‌های داخل اعلان یادآوری: «انجام شد» و «۱۰ دقیقه بعد» (فقط JS؛ اگر افزونه پشتیبانی نکند بی‌اثر است) */
  let actReg=false;
  async function setupActions(){const p=LN();if(!p||actReg)return;actReg=true;
    try{if(p.registerActionTypes)await p.registerActionTypes({types:[{id:'dani-rem',actions:[{id:'done',title:L('انجام شد','Done')},{id:'snz',title:L('۱۰ دقیقه بعد','Snooze 10 min')}]}]})}catch(e){}
    try{if(p.addListener)p.addListener('localNotificationActionPerformed',ev=>{try{
      const k=ev&&ev.notification&&ev.notification.extra&&ev.notification.extra.k;if(!k||(ev.actionId!=='done'&&ev.actionId!=='snz'))return;
      const rid=String(k).split('|')[0];const r=(typeof rItems==='function'?rItems().concat(typeof dlRems==='function'?dlRems():[]):[]).find(x=>x.id===rid);if(!r)return;
      const R=zRM();let x=R.log.find(z=>z.k===k);if(!x){rLog(k,r,Date.now(),'fired');x=R.log.find(z=>z.k===k)}
      if(ev.actionId==='done'){x.st='done';x.seen=true}else{x.st='snooze';x.seen=true;R.snz.push({rid,k,at:Date.now()+10*60000})}
      if(save())render();setTimeout(()=>{try{Notifier.sync()}catch(e){}},300)}catch(e){console.error('notif action',e)}})}catch(e){}}
  async function setupChannels(){const p=LN();if(!p||!p.createChannel)return;setupActions();
    for(const o of['dani-alarm-v1','dani-remind-v1']){try{await p.deleteChannel({id:o})}catch(e){}}
    try{await p.createChannel({id:CH_ALARM,name:L('زنگ و تایمر','Alarm & timer'),description:L('پایان تایمر و هشدارهای مهم','Timer end and important alerts'),importance:5,visibility:1,sound:'dani_alarm.ogg',vibration:true,lights:true})}catch(e){}
    try{await p.createChannel({id:'dani-pin-v1',name:L('سنجاق‌شده (بی‌صدا)','Pinned (silent)'),description:L('اعلان ثابتِ «بعدی چی؟» یا پومودورو','Pinned “What next?” / Pomodoro notification'),importance:2,visibility:1,vibration:false})}catch(e){}
    try{await p.createChannel({id:CH_REM,name:L('یادآورها','Reminders'),description:L('یادآورها و موعدها','Reminders and deadlines'),importance:4,visibility:1,sound:'dani_ping.ogg',vibration:true})}catch(e){}}
  async function refresh(){if(!isNative()){st.perm=('Notification' in window)?Notification.permission:'unsupported';return}
    const p=LN();if(!p){st.err='plugin';return}
    try{const r=await p.checkPermissions();st.perm=r.display}catch(e){}
    try{const r=await p.checkExactNotificationSetting();st.exact=r.exact_alarm}catch(e){st.exact='unknown'}
    try{const r=await p.getPending();st.pending=(r.notifications||[]).length}catch(e){}}
  function toNote(x){return{id:x.id,title:x.title,body:x.body,channelId:(x.ch===CH_ALARM&&window.daniAlarmCh)||x.ch,sound:x.ch===CH_ALARM?'dani_alarm.ogg':'dani_ping.ogg',smallIcon:'ic_stat_dani',iconColor:'#2563eb',autoCancel:!x.ongoing,ongoing:!!x.ongoing,schedule:{at:new Date(x.at),allowWhileIdle:true},extra:{k:x.key},...(String(x.key||'').split('|').length===3?{actionTypeId:'dani-rem'}:{})}}
  async function sync(force){
    if(!isNative())return;const p=LN();if(!p)return;
    if(st.busy){st.again=true;return}
    st.busy=true;
    try{
      const list=plan(),sig=JSON.stringify(list.map(x=>[x.id,x.at,x.title,x.body]));
      if(!force&&sig===st.sig)return;
      if(st.perm!=='granted'){await refresh();if(st.perm!=='granted'){st.keys={};st.tAts=[];return}}
      try{const pend=await p.getPending();if(pend.notifications&&pend.notifications.length)await p.cancel({notifications:pend.notifications.map(n=>({id:n.id}))})}catch(e){}
      if(list.length)await p.schedule({notifications:list.map(toNote)});
      st.sig=sig;st.keys={};list.forEach(x=>{st.keys[x.key]=x.at});
      st.tAts=list.filter(x=>x.key==='timer-end'||x.key==='timer-pre'||/^pomo/.test(x.key)).map(x=>x.at);st.pending=list.length;st.err=''}
    catch(e){st.err=String(e&&e.message||e);console.error('notifier sync',e)}
    finally{st.busy=false;if(st.again){st.again=false;setTimeout(()=>sync(),300)}}}

  /* ---------- اعلان وب (PWA) و نگه‌داشتن صفحه روشن ---------- */
  let wl=null;
  async function wake(){try{const want=!!(db.set.nwake&&db.timer&&db.timer.state==='running'&&!document.hidden&&navigator.wakeLock);
    if(want&&!wl){wl=await navigator.wakeLock.request('screen');wl.addEventListener('release',()=>{wl=null})}
    else if(!want&&wl){const w=wl;wl=null;await w.release()}}catch(e){wl=null}}

  const nearTimer=()=>st.tAts.some(a=>Math.abs(Date.now()-a)<45000);

  async function requestPerm(){
    if(isNative()){const p=LN();if(!p)return toast(L('افزونه‌ی اعلان در این اپ پیدا نشد','Notification plugin not found in this app'),1);
      try{const r=await p.requestPermissions();st.perm=r.display}catch(e){toast(e.message,1)}
      await refresh();await sync(true);return}
    if(!('Notification' in window))return toast(L('این مرورگر اعلان را پشتیبانی نمی‌کند','This browser does not support notifications'),1);
    try{st.perm=await Notification.requestPermission()}catch(e){}}
  async function exactSettings(){const p=LN();if(!p||!p.changeExactNotificationSetting)return;try{const r=await p.changeExactNotificationSetting();st.exact=r.exact_alarm}catch(e){toast(e.message,1)}}
  async function testIn(sec){
    if(isNative()){const p=LN();if(!p)return;
      if(st.perm!=='granted'){await requestPerm();if(st.perm!=='granted')return toast(L('اجازه‌ی اعلان داده نشد','Notification permission not granted'),1)}
      await setupChannels();
      try{await p.schedule({notifications:[toNote({id:ID_TEST,at:Date.now()+sec*1000,title:'DANI ⏰',body:L('این یک زنگ آزمایشی است ✓','This is a test alarm ✓'),ch:CH_ALARM,key:'test'})]});
        toast(L('زنگ آزمایشی برای '+sec+' ثانیه‌ی دیگر تنظیم شد؛ می‌توانی برنامه را ببندی و صفحه را قفل کنی','Test alarm set for '+sec+' s from now; you can close the app and lock the screen'))}
      catch(e){toast(L('زمان‌بندی ناموفق: ','Scheduling failed: ')+e.message,1)}return}
    if(Notification.permission!=='granted')return toast(L('ابتدا اجازه‌ی اعلان را بدهید','Allow notifications first'),1);
    toast(L('اعلان آزمایشی تا '+sec+' ثانیه‌ی دیگر؛ برنامه را باز نگه دار (در وب، با بسته‌بودن برنامه تضمین نیست)','Test notification in '+sec+' s; keep the app open (not guaranteed when closed on the web)'));
    setTimeout(()=>{showN('DANI ⏰',L('این یک زنگ آزمایشی است ✓','This is a test alarm ✓'),{ring:true,tag:'dani-test'});try{playSound()}catch(e){}},sec*1000)}

  /* ---------- کارت تنظیمات ---------- */
  function cardHTML(){
    const nat=isNative(),pm=st.perm,ok=pm==='granted';
    const pmT={granted:L('مجاز ✓','Allowed ✓'),denied:L('مسدود','Blocked'),default:L('هنوز اجازه داده نشده','Not asked yet'),prompt:L('هنوز اجازه داده نشده','Not asked yet'),'prompt-with-rationale':L('هنوز اجازه داده نشده','Not asked yet'),unsupported:L('پشتیبانی نمی‌شود','Not supported'),unknown:L('نامشخص','Unknown')}[pm]||pm;
    const exT={granted:L('مجاز ✓','Allowed ✓'),denied:L('غیرفعال — زنگ ممکن است چند دقیقه دیر بیاید','Off — alarms may be late by minutes'),prompt:L('نیاز به اجازه','Needs permission'),unknown:'—'}[st.exact]||'—';
    let h='<div class="c" id="ntcard" style="margin-top:10px"><h3>'+L('اعلان و زنگ (مرکز یکپارچه)','Notifications & alarms (unified)')+'</h3>';
    h+='<p>'+L('حالت: ','Mode: ')+'<b>'+(nat?L('اپ اندروید ✓ — زنگ حتی با بسته‌بودن برنامه','Android app ✓ — rings even when the app is closed'):L('نسخه‌ی وب (PWA)','Web version (PWA)'))+'</b></p>';
    h+='<p>'+L('اجازه‌ی اعلان: ','Notification permission: ')+'<b>'+pmT+'</b>'+(nat?' · '+L('آلارم دقیق: ','Exact alarm: ')+'<b>'+exT+'</b> · '+L('زمان‌بندی‌شده: ','Scheduled: ')+'<b>'+fa(st.pending)+'</b>':'')+'</p>';
    h+='<div class="row">'+(ok?'':'<button class="p" data-a="nt_perm">'+L('درخواست اجازه‌ی اعلان','Allow notifications')+'</button>')
      +(nat&&st.exact!=='granted'&&st.exact!=='unknown'?'<button class="p" data-a="nt_exact">'+L('فعال‌کردن آلارم دقیق','Enable exact alarms')+'</button>':'')
      +'<button data-a="nt_t10">'+L('زنگ آزمایشی (۱۰ ثانیه)','Test alarm (10 s)')+'</button><button data-a="nt_t60">'+L('زنگ آزمایشی (۶۰ ثانیه)','Test alarm (60 s)')+'</button></div>';
    if(st.err)h+='<p class="m" style="color:var(--wr)">'+esc(st.err)+'</p>';
    if(nat){
      h+='<p class="m">'+L('تایمر شمارش‌معکوس، هشدار پیش از پایان و یادآورهای ۱۴ روز آینده خودکار در سیستم‌عامل ثبت می‌شوند و با هر تغییر به‌روز می‌شوند. اگر زنگ دیر آمد: تنظیمات گوشی ← برنامه‌ها ← DANI ← باتری ← «بدون محدودیت»، و «آلارم و یادآور» را روشن کن.','The countdown timer, its pre-alert and the next 14 days of reminders are registered with the OS automatically and refreshed on every change. If alarms come late: phone Settings → Apps → DANI → Battery → "Unrestricted", and enable "Alarms & reminders".')+'</p>'}
    else{
      h+='<label class="chip"><input type="checkbox" data-ch="sfb" data-f="nwake" '+(db.set.nwake?'checked':'')+'> '+L('هنگام تایمر، صفحه روشن بماند (برای اینکه زنگ حتماً بخورد)','Keep the screen on while a timer runs (so the alarm is sure to ring)')+'</label>'
        +'<p class="m">'+L('در نسخه‌ی وب، وقتی صفحه بسته یا گوشی قفل باشد مرورگر زمان‌بندی دقیق نمی‌دهد. برای زنگ مطمئن: «اپ اندروید DANI» را نصب کن (راهنما: README.md) یا از خروجی تقویم زیر استفاده کن تا تقویم گوشی زنگ بزند.','On the web, the browser gives no exact timing when the page is closed or the phone is locked. For reliable alarms install the DANI Android app (see README.md) or use the calendar export below so the phone calendar rings.')+'</p>'
        +'<div class="row"><button data-a="ics">'+L('خروجی تقویم (.ics) برای زنگ گوشی','Calendar export (.ics) for phone alarms')+'</button></div>'}
    return h+'</div>'}

  /* ---------- اتصال به کد موجود ---------- */
  function hook(){
    /* نمایش اعلان: قوی‌تر برای زنگ‌ها؛ سازگار با امضای قبلی showN(t,b) */
    showN=async function(t,b,o){o=o||{};try{
      const r=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();
      const opt={body:b,icon:'icons/icon-192.png',badge:'icons/icon-192.png',vibrate:o.ring?[500,200,500,200,900]:[200,100,200],tag:o.tag||'hamrah',renotify:true,requireInteraction:!!o.ring,data:{tag:o.tag||''}};
      if(r&&r.showNotification){await r.showNotification(t,opt);return true}
      new Notification(t,{body:b});return true}catch(e){return false}};
    /* notify: در اپ اندروید اگر همین لحظه یک اعلان زمان‌بندی‌شده نمایش داده شده، تکرار نکن */
    const _notify=notify;
    notify=function(t){if(isNative()&&nearTimer())return;
      if('Notification' in window&&Notification.permission==='granted'){showN('DANI',t,{ring:true,tag:'dani-alarm'});return}
      try{_notify(t)}catch(e){}};
    /* sysNotify (یادآورها): اگر سیستم‌عامل خودش این یادآور را زمان‌بندی کرده، دوباره نشان نده */
    const _sys=sysNotify;
    sysNotify=async function(title,body,tag){if(isNative()&&tag&&st.keys[tag])return true;
      if(!isNative()&&'Notification' in window&&Notification.permission==='granted'){return showN(title,body,{ring:true,tag:tag||'dani-rem'})}
      return _sys(title,body,tag)};
    /* تایمر: بعد از هر تغییر، برنامه‌ی اعلان را همان لحظه به‌روز کن */
    ['start','pause','resume','reset','cancel','add','finish'].forEach(k=>{const o=TM[k];if(typeof o!=='function')return;
      TM[k]=function(){const r=o.apply(this,arguments);setTimeout(()=>{sync();wake()},0);return r}});
    /* افزودن کارت به «تنظیمات › زمان و اعلان» */
    const _sp=setPage;setPage=function(){const h=_sp.apply(this,arguments);return stt==='time'?h+cardHTML():h};
    /* اکشن‌ها */
    H.nt_perm=async()=>{await requestPerm();render()};
    H.nt_exact=async()=>{await exactSettings();await refresh();render()};
    H.nt_t10=()=>testIn(10);H.nt_t60=()=>testIn(60);
    /* رویدادها */
    document.addEventListener('visibilitychange',()=>{if(document.hidden){sync(true)}else{refresh().then(()=>{sync();if(page==='set'&&stt==='time')render()})}wake()});
    window.addEventListener('pagehide',()=>{sync(true)});
    setInterval(()=>{sync();wake()},15000);
    if('serviceWorker' in navigator)navigator.serviceWorker.addEventListener('message',e=>{try{if(e.data&&e.data.type==='dani-notif-click'&&typeof remCheck==='function')remCheck()}catch(_){}})}

  async function init(){hook();
    if(isNative()){await setupChannels();await refresh();await sync(true)}else{await refresh()}
    wake();st.ready=true}
  return{init,sync,refresh,plan,isNative,state:st,cardHTML}
})();
try{Notifier.init()}catch(e){console.error('notifier',e)}
