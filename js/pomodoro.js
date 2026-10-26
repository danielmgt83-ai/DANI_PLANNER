"use strict";
/* DANI · pomodoro.js — پومودورو و حالت تمرکز (افزوده؛ روی تایمر شمارش‌معکوس موجود سوار است)
   - جلسه‌ی کار = همان تایمر معکوس (ثبت خودکار در لاگ، اعلان و زنگ همان قبلی)
   - استراحت کوتاه/بلند = شمارش جدا که در لاگ ثبت نمی‌شود؛ پایانش در اپ اندروید هم زنگ می‌خورد (daniExtraPlan در notifier.js)
   - حالت تمرکز: صفحه‌ی تمام‌صفحه‌ی ساده با ساعت بزرگ؛ صفحه خاموش نمی‌شود
   داده: db.set.pomo (کوچک؛ در پشتیبان می‌آید) */
(function(){
const T=(fa,en)=>{try{return LANGEN()?en:fa}catch(e){return fa}};
const DEF={w:25,b:5,l:15,n:4,auto:0,ph:'idle',until:0,sid:'',a:'',s:'',cy:0,dn:0,dd:''};
const PM=()=>{const s=db.set;if(!s.pomo||typeof s.pomo!=='object')s.pomo={};const p=s.pomo;for(const k in DEF)if(p[k]===undefined)p[k]=DEF[k];
  if(p.dd!==todayISO()){p.dd=todayISO();p.dn=0}return p};
const say=(m,b)=>{try{toast(m,b)}catch(e){}};
const num=(v,lo,hi,d)=>{v=Math.round(+v);return v>=lo&&v<=hi?v:d};
const sync=()=>{try{if(window.Notifier)Notifier.sync()}catch(e){}};
const pmSave=()=>{save();setTimeout(sync,0)};
const mmss=ms=>{ms=Math.max(0,Math.ceil(ms/1000));return pad(Math.floor(ms/60))+':'+pad(ms%60)};
let wl=null;
async function wake(on){try{if(on&&!wl&&navigator.wakeLock){wl=await navigator.wakeLock.request('screen');wl.addEventListener('release',()=>{wl=null})}
  else if(!on&&wl){const w=wl;wl=null;await w.release()}}catch(e){wl=null}}

/* ---------- جریان ---------- */
function startWork(){const p=PM();if(!act(p.a))return say(T('ابتدا یک فعالیت انتخاب کن','Choose an activity first'),1);
  if(db.timer&&db.timer.state!=='ready')return say(T('یک تایمر فعال وجود دارد؛ ابتدا آن را پایان یا لغو کن','A timer is already active; finish or cancel it first'),1);
  TM.start('cd',p.a,p.s||'',p.w);if(!db.timer||db.timer.state!=='running')return;
  p.ph='work';p.sid=db.timer.sid;p.until=0;pmSave();render()}
function workDone(){const p=PM();p.cy++;p.dn++;const lg=p.cy%p.n===0;p.ph=lg?'long':'break';p.until=Date.now()+(lg?p.l:p.b)*60000;p.sid='';pmSave();
  say(T('پومودورو تمام شد 🍅 — '+(lg?'استراحت بلند ':'استراحت ')+fa(lg?p.l:p.b)+' دقیقه','Pomodoro done 🍅 — '+(lg?'long break ':'break ')+(lg?p.l:p.b)+' min'));
  if(page==='dash'||FOC)render()}
function breakDone(){const p=PM();p.until=0;
  if(p.auto){p.ph='next';startWork();if(PM().ph==='work')return}
  p.ph='next';pmSave();try{alarm(T('استراحت تمام شد؛ آماده‌ی تمرکز بعدی؟','Break is over — ready for the next focus?'))}catch(e){}
  if(page==='dash'||FOC)render()}
function stopAll(){const p=PM();p.ph='idle';p.sid='';p.until=0;pmSave();setFoc(false);render()}
function tickPm(){const p=PM();if(p.ph==='idle'){updFoc();return}
  if(p.ph==='work'){const t=db.timer;
    if(t&&t.sid===p.sid){if(t.state==='ended'){TM.finish();if(db.entries.some(e=>e.id===p.sid))workDone();else{p.ph='idle';pmSave();render()}}}
    else if(db.entries.some(e=>e.id===p.sid))workDone();
    else{p.ph='idle';p.sid='';pmSave();render()}}
  else if((p.ph==='break'||p.ph==='long')&&Date.now()>=p.until)breakDone();
  const d=$('#pm-bd');if(d&&p.until)d.textContent=mmss(p.until-Date.now());
  updFoc()}
setInterval(tickPm,500);

/* ---------- حالت تمرکز ---------- */
let FOC=false;
function setFoc(on){FOC=!!on;let o=$('#pm-foc');
  if(!on){if(o)o.remove();wake(false);return}
  if(!o){o=document.createElement('div');o.id='pm-foc';o.setAttribute('role','dialog');o.setAttribute('aria-label',T('حالت تمرکز','Focus mode'));
    o.style.cssText='position:fixed;inset:0;z-index:99999;background:var(--bg,#0b1020);color:var(--tx,#fff);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;padding:20px';
    document.body.appendChild(o)}
  wake(true);foc()}
function foc(){const o=$('#pm-foc');if(!o)return;const p=PM(),t=db.timer||{},w=p.ph==='work',b=p.ph==='break'||p.ph==='long';
  const lbl=w?T('تمرکز','Focus'):p.ph==='long'?T('استراحت بلند','Long break'):b?T('استراحت','Break'):p.ph==='next'?T('استراحت تمام شد','Break over'):T('آماده','Ready');
  o.innerHTML='<div style="opacity:.7;font-size:1.1em">'+esc(lbl)+(act(p.a)?' · '+esc(aN(p.a)):'')+'</div><div id="pm-fd" style="font-size:min(22vw,120px);font-weight:700;font-variant-numeric:tabular-nums;line-height:1">--:--</div>'
   +'<div style="opacity:.7">🍅 '+fa(p.dn)+' · '+T('امروز','today')+'</div><div class="row" style="justify-content:center">'
   +(w?'<button data-a="pm_fin">'+T('پایان زودتر و ثبت','Finish early & log')+'</button>':'')
   +(b?'<button data-a="pm_skip">'+T('رد کردن استراحت','Skip break')+'</button>':'')
   +(p.ph==='next'||p.ph==='idle'?'<button class="p" data-a="pm_go">'+T('شروع تمرکز','Start focus')+'</button>':'')
   +'<button data-a="pm_foc0">'+T('خروج از حالت تمرکز','Exit focus mode')+'</button></div>';updFoc()}
function updFoc(){if(!FOC)return;const d=$('#pm-fd');if(!d)return;const p=PM(),t=db.timer||{};
  if(p.ph==='work'&&t.mode==='cd')d.textContent=mmss(t.dur-(t.acc+(t.state==='running'?Math.max(0,Date.now()-t.t0):0)));
  else if(p.until)d.textContent=mmss(p.until-Date.now());else d.textContent=mmss(p.w*60000)}

/* ---------- کارت ---------- */
function card(){const p=PM(),idle=p.ph==='idle'||p.ph==='next',w=p.ph==='work',b=p.ph==='break'||p.ph==='long';
  const nm=(k,l,v,lo,hi)=>'<div><label>'+l+'</label><input type="number" id="pm-'+k+'" min="'+lo+'" max="'+hi+'" value="'+v+'" style="width:80px" '+(idle?'':'disabled')+'></div>';
  let h='<div class="c" id="pmcard"><h3>🍅 '+T('پومودورو و حالت تمرکز','Pomodoro & focus mode')+'</h3>';
  h+='<p class="m">'+T('کار در بازه‌های متمرکز با استراحت‌های کوتاه؛ هر جلسه‌ی کار خودکار در لاگ همان فعالیت ثبت می‌شود. امروز: ','Work in focused blocks with short breaks; each work session is logged to the activity automatically. Today: ')+'<b>'+fa(p.dn)+'</b> 🍅 · '+T('دور','round')+' '+fa(b?(p.cy-1)%p.n+1:p.cy%p.n+1)+'/'+fa(p.n)+'</p>';
  if(idle){
    h+='<div class="row"><div><label>'+T('فعالیت','Activity')+'</label><select id="pm-a">'+aOpts(p.a||db.timer&&db.timer.actId)+'</select></div>'
      +nm('w',T('کار (دقیقه)','Work (min)'),p.w,1,180)+nm('b',T('استراحت','Break'),p.b,1,60)+nm('l',T('استراحت بلند','Long break'),p.l,1,120)+nm('n',T('هر چند دور','Rounds'),p.n,2,12)+'</div>'
      +'<label class="m"><input type="checkbox" id="pm-auto" '+(p.auto?'checked':'')+'> '+T('شروع خودکار دور بعد بعد از استراحت','Auto-start the next round after a break')+'</label>'
      +'<div class="row" style="margin-top:8px"><button class="p" data-a="pm_go">'+(p.ph==='next'?T('شروع دور بعد','Start next round'):T('شروع پومودورو','Start Pomodoro'))+'</button><button data-a="pm_foc1">'+T('حالت تمرکز','Focus mode')+'</button>'+(p.cy?'<button data-a="pm_reset">'+T('صفر کردن دورها','Reset rounds')+'</button>':'')+'</div>'}
  else if(w){h+='<p>● '+T('در حال تمرکز روی ','Focusing on ')+'<b>'+esc(aN(p.a))+'</b> — '+T('شمارنده در کارت اجرای بالا است','the countdown is in the running card above')+'</p>'
      +'<div class="row"><button data-a="pm_foc1">'+T('حالت تمرکز','Focus mode')+'</button><button class="p" data-a="pm_fin">'+T('پایان زودتر و ثبت','Finish early & log')+'</button><button class="d" data-a="pm_stop">'+T('توقف پومودورو','Stop Pomodoro')+'</button></div>'}
  else{h+='<div class="big" id="pm-bd">'+mmss(p.until-Date.now())+'</div><p class="m" style="text-align:center">'+(p.ph==='long'?T('استراحت بلند؛ کمی راه برو و آب بنوش','Long break — walk a bit and drink some water'):T('استراحت کوتاه؛ از صفحه دور شو','Short break — look away from the screen'))+'</p>'
      +'<div class="row" style="justify-content:center"><button data-a="pm_skip">'+T('رد کردن استراحت','Skip break')+'</button><button data-a="pm_foc1">'+T('حالت تمرکز','Focus mode')+'</button><button class="d" data-a="pm_stop">'+T('توقف پومودورو','Stop Pomodoro')+'</button></div>'}
  return h+'</div>'}

/* ---------- اتصال‌ها ---------- */
const _rc=recCard;recCard=function(){return card()+_rc.apply(this,arguments)};
const rd=()=>{const p=PM();p.w=num(val('pm-w')||p.w,1,180,25);p.b=num(val('pm-b')||p.b,1,60,5);p.l=num(val('pm-l')||p.l,1,120,15);p.n=num(val('pm-n')||p.n,2,12,4);
  const a=val('pm-a');if(a)p.a=a;const c=$('#pm-auto');if(c)p.auto=c.checked?1:0};
H.pm_go=()=>{if($('#pm-w'))rd();else if(!PM().a&&db.timer&&db.timer.actId)PM().a=db.timer.actId;startWork();if(FOC)foc()};
H.pm_stop=()=>{if(confirm(T('پومودورو متوقف شود؟ (تایمر جاری لغو نمی‌شود)','Stop Pomodoro? (the running timer is not cancelled)')))stopAll()};
H.pm_skip=()=>{const p=PM();p.until=0;p.ph='next';pmSave();render();if(FOC)foc()};
H.pm_fin=()=>{const p=PM();if(db.timer&&db.timer.sid===p.sid)TM.finish();tickPm();render()};
H.pm_reset=()=>{const p=PM();p.cy=0;pmSave();render()};
H.pm_foc1=()=>{setFoc(true)};H.pm_foc0=()=>{setFoc(false)};

/* هنگام رندر مجدد، صفحه‌ی تمرکز را تازه نگه دار */
const _rn=render;render=function(){const r=_rn.apply(this,arguments);if(FOC)foc();return r};

/* زنگ پایان استراحت در اپ اندروید (وقتی برنامه بسته است) */
(window.daniExtraPlan=window.daniExtraPlan||[]).push(now=>{const p=PM();
  return(p.ph==='break'||p.ph==='long')&&p.until>now+1500?[{id:4,at:p.until,title:'DANI 🍅',body:T('استراحت تمام شد؛ آماده‌ی تمرکز بعدی؟','Break is over — ready for the next focus?'),ch:'dani-alarm-v2',key:'pomo-break'}]:[]});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&FOC)wake(true)});
})();
