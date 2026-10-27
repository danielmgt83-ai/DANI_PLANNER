"use strict";
/* DANI · rhythm.js — «چرخه‌ی امروز»: برنامه‌ریزی ← اجرا ← بازبینی، پیوستگی (زنجیره‌ی روزها) و اعلان‌های هر مرحله
   - کارت چرخه (ویجت `rhythm` در خانه‌ی جدید): سه مرحله با وضعیت، دکمه‌ی گام بعدی، زنجیره‌ی 🔥 و مشکلات امروز.
   - اعلان‌ها (اپ اندروید، از طریق daniExtraPlan؛ هر کدام جدا قابل‌خاموش‌کردن، پیش‌فرض روشن):
       برنامه‌ی فردا (۲۰:۳۰)، محافظت زنجیره (۲۱:۳۰)، بازبینی هفتگی (جمعه ۱۸:۰۰)
   - اعلان سنجاق‌شده (پیش‌فرض خاموش): «بعدی چی؟» / پومودورو / تایمر، بی‌صدا و غیرقابل‌پاک‌کردن تا خودت ببندی.
   داده: db.set.rh ({plan,streak,week,pin,tPlan,tStreak}). */
(function(){
const T=(fa,en)=>{try{return LANGEN()?en:fa}catch(e){return fa}};
const RH=()=>{const s=db.set;if(!s.rh||typeof s.rh!=='object')s.rh={};const r=s.rh;
  if(r.plan===undefined){r.plan=1;r.streak=1;r.week=1;r.pin=0;r.tPlan='20:30';r.tStreak='21:30'}return r};
const has=d=>{try{return(E(d)||[]).length>0}catch(e){return false}};
function streak(){const t=todayISO();let d=has(t)?t:addD(t,-1),n=0;while(n<800&&has(d)){n++;d=addD(d,-1)}return{n,today:has(t)}}
function stateOf(d){const p=plan(d||todayISO()),dn=db.days[todayISO()]||{};
  const eod=['learned','barrier','explanation','tomorrow','mood','sleepQ','satisf'].some(k=>dn[k]);
  let min=0;try{min=sumU(E(todayISO()))}catch(e){}
  return{planned:p.length>0,logged:min>0,min,reviewed:eod,tmr:plan(addD(todayISO(),1)).length>0}}
function problems(){const out=[],t=todayISO();
  try{const o=plOverdue().length;if(o)out.push(T(fa(o)+' کار عقب‌افتاده','' +o+' overdue task(s)'))}catch(e){}
  try{const op=plan(t).filter(x=>!['done','canceled','carried'].includes(x.status)).length;if(op&&new Date().getHours()>=17)out.push(T(fa(op)+' کار امروز هنوز ناتمام است','' +op+' task(s) of today still open'))}catch(e){}
  try{const a=analyze(t);(a.lim||[]).slice(0,1).forEach(x=>out.push(x))}catch(e){}return out.slice(0,3)}

/* ---------- کارت ---------- */
function card(){const s=stateOf(),sk=streak(),hr=new Date().getHours(),t=todayISO();
  const step=(ok,ic,ttl)=>'<div style="flex:1;min-width:84px;text-align:center;padding:8px 4px;border-radius:12px;border:1px solid var(--bd,#8884);'+(ok?'opacity:1':'opacity:.75')+'"><div style="font-size:1.3em">'+(ok?'✅':ic)+'</div><div class="m">'+ttl+'</div></div>';
  let cta='';
  if(!s.planned)cta='<button class="p" data-a="rh_plan">'+T('برنامه‌ی امروز را ببند','Plan today')+'</button>';
  else if(!s.logged&&hr<20)cta='<button class="p" data-a="go" data-p="log">'+T('شروع کن','Start now')+'</button>';
  else if(hr>=18&&!s.reviewed)cta='<button class="p" data-a="rh_eod">'+T('بازبینی پایان روز','End-of-day review')+'</button>';
  else if(hr>=18&&!s.tmr)cta='<button class="p" data-a="rh_plan" data-n="1">'+T('برنامه‌ی فردا','Plan tomorrow')+'</button>';
  else if(!s.logged)cta='<button class="p" data-a="go" data-p="log">'+T('یک ثبت کوتاه','A short log')+'</button>';
  const pb=hr>=17?problems():[];
  let h='<div class="c" id="rhcard"><div class="row"><b>'+T('چرخه‌ی امروز','Today\'s rhythm')+'</b><span class="sp"></span><span class="m">'+(sk.n?'🔥 '+T(fa(sk.n)+' روز پیوسته','' +sk.n+'-day streak'):T('زنجیره‌ای نداری؛ امروز شروعش کن','No streak yet — start today'))+'</span></div>'
   +'<div class="row" style="gap:8px;margin:8px 0;flex-wrap:nowrap">'+step(s.planned,'📝',T('برنامه','Plan'))+step(s.logged&&s.min>=1,'⏱',T('اجرا','Do')+(s.min?' · '+mm(s.min):''))+step(s.reviewed,'🔎',T('بازبینی','Review'))+'</div>';
  if(sk.n&&!sk.today)h+='<div class="m">'+T('امروز هنوز ثبت نداری؛ برای حفظ زنجیره یک ثبت کوتاه کافی است.','Nothing logged yet today — one short log keeps your streak.')+'</div>';
  if(pb.length)h+='<div class="m" style="margin-top:6px">⚠️ '+pb.map(esc).join(' · ')+'</div>';
  if(cta)h+='<div class="row" style="margin-top:8px">'+cta+(hr>=18&&s.reviewed&&!s.tmr?'':'')+'</div>';
  h+='<details style="margin-top:8px"><summary class="m">'+T('اعلان‌های چرخه','Rhythm notifications')+'</summary>'+settings()+'</details></div>';return h}
function settings(){const r=RH(),cb=(k,l,tk)=>'<label class="m" style="display:block;margin:4px 0"><input type="checkbox" id="rh-'+k+'" '+(r[k]?'checked':'')+'> '+l+(tk?' <input type="time" id="rh-'+tk+'" value="'+esc(r[tk])+'">':'')+'</label>';
  return '<div style="margin-top:6px">'+cb('plan',T('برنامه‌ی فردا (شب)','Plan tomorrow (evening)'),'tPlan')+cb('streak',T('محافظت زنجیره (اگر امروز ثبتی نیست)','Streak protection (if nothing logged today)'),'tStreak')+cb('week',T('بازبینی هفتگی (جمعه‌ها)','Weekly review (Fridays)'))
   +cb('pin',T('📌 اعلان سنجاق‌شده (بعدی چی؟ / پومودورو؛ بی‌صدا، آزمایشی)','📌 Pinned notification (What next? / Pomodoro; silent, experimental)'))
   +'<div class="row"><button data-a="rh_save">'+T('ذخیره','Save')+'</button></div><p class="m">'+T('اعلان‌ها فقط در اپ اندروید کار می‌کنند. صبح و شب هم از کارت «بعدی چی؟» می‌آید.','Notifications work in the Android app only. Morning/evening summaries come from the "What next?" card.')+'</p></div>'}
window.daniRhythmCard=card;

/* ---------- عمل‌ها ---------- */
H.rh_plan=e=>{vd=e&&e.dataset&&e.dataset.n?addD(todayISO(),+e.dataset.n):todayISO();page='dash';dt='plan';render();window.scrollTo(0,0)};
H.rh_eod=()=>{page='dash';dt='today';render();setTimeout(()=>{const d=[...document.querySelectorAll('#pg details')].find(x=>/پایان روز|End-of-day/i.test(x.innerText));if(d){d.open=true;d.scrollIntoView({block:'center'})}},120)};
H.rh_save=()=>{const r=RH(),ok=v=>/^\d\d:\d\d$/.test(v);['plan','streak','week','pin'].forEach(k=>{const c=$('#rh-'+k);if(c)r[k]=c.checked?1:0});
  const a=val('rh-tPlan'),b=val('rh-tStreak');if(ok(a))r.tPlan=a;if(ok(b))r.tStreak=b;save();try{if(typeof Notifier!=='undefined')Notifier.sync(true)}catch(e){}try{toast(T('ذخیره شد ✓','Saved ✓'))}catch(e){}render()};

/* ---------- اعلان‌ها ---------- */
const hs=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return 3e8+Math.abs(h)%1e8};
const atOf=(d,hm)=>{const[y,m,dd]=d.split('-').map(Number),[h,n]=hm.split(':').map(Number);return new Date(y,m-1,dd,h,n).getTime()};
const okT=v=>/^\d\d:\d\d$/.test(v);
let PIN={text:'',at:0};
(window.daniExtraPlan=window.daniExtraPlan||[]).push(now=>{const r=RH(),out=[],t0=todayISO(),sk=streak();
  for(let i=0;i<3;i++){const d=addD(t0,i);
    if(r.plan&&okT(r.tPlan)){const at=atOf(d,r.tPlan);let tm0=true;try{tm0=plan(addD(d,1)).length>0}catch(e){}
      if(at>now+2000&&!tm0&&!(typeof inQuiet==='function'&&inQuiet(at)))out.push({id:hs('pl'+d),at,title:'DANI 📝',body:T('برنامه‌ی فردا را ببند؛ دو دقیقه کافی است و فردا بدون فکر شروع می‌کنی.','Set tomorrow\'s plan — two minutes, and tomorrow starts without thinking.'),ch:'dani-remind-v2',key:'rh-pl-'+d})}
    if(r.streak&&okT(r.tStreak)&&(i===0?sk.n>0&&!sk.today:i===1?sk.today:false)){const at=atOf(d,r.tStreak);
      if(at>now+2000&&!(typeof inQuiet==='function'&&inQuiet(at)))out.push({id:hs('sk'+d),at,title:'DANI 🔥',body:T('زنجیره‌ی '+fa(i===0?sk.n:sk.n+1)+' روزه‌ات در خطر است؛ یک ثبت کوتاه کافی است.','Your '+(i===0?sk.n:sk.n+1)+'-day streak is at risk — one short log is enough.'),ch:'dani-remind-v2',key:'rh-sk-'+d})}
    if(r.week){const dt0=new Date(atOf(d,'18:00'));if(dt0.getDay()===5&&dt0.getTime()>now+2000&&!(typeof inQuiet==='function'&&inQuiet(dt0.getTime())))out.push({id:hs('wk'+d),at:dt0.getTime(),title:'DANI 🔎',body:T('بازبینی هفتگی؛ سه دقیقه، و هفته‌ی بعد روشن‌تر است.','Weekly review — three minutes make next week clearer.'),ch:'dani-remind-v2',key:'rh-wk-'+d})}}
  if(r.pin){let text='';const p=db.set.pomo,tm=db.timer;
    try{if(p&&p.ph==='work'&&tm&&tm.mode==='cd'&&tm.state==='running'){const end=tm.t0+(tm.dur-tm.acc);text='🍅 '+T('تمرکز روی ','Focus on ')+aN(tm.actId)+' · '+T('تا ','until ')+fa(nowHMof(end))}
      else if(p&&(p.ph==='break'||p.ph==='long')&&p.until>now)text='☕ '+T('استراحت تا ','Break until ')+fa(nowHMof(p.until));
      else if(tm&&tm.state==='running')text='⏱ '+aN(tm.actId)+' · '+T('در حال اجرا','running');
      else{const c=window.daniNextTop&&window.daniNextTop();text=c?'🎯 '+T('بعدی: ','Next: ')+c.t+' — '+c.why:T('برای شروع، فعالیتی را انتخاب کن','Pick an activity to start')}}catch(e){}
    if(text){if(text!==PIN.text||!PIN.at){PIN={text,at:now+1500}}out.push({id:9,at:PIN.at,title:'DANI 📌',body:text,ch:'dani-pin-v1',key:'pin',ongoing:true})}}
  else PIN={text:'',at:0};
  return out});
function nowHMof(ts){const d=new Date(ts);return pad(d.getHours())+':'+pad(d.getMinutes())}
})();
