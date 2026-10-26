"use strict";
/* DANI · smartnext.js — «بعدی چی؟» (پیشنهاد خودکار کار بعدی) + اعلان خلاصه‌ی صبح و شب
   یک کارت کم‌حجم و یک‌ضربه‌ای: بهترین کار بعدی را از برنامه‌ی امروز، عقب‌افتاده‌ها، موعدها، مرور کارت‌ها و عادت‌ها
   انتخاب می‌کند، دلیلش را می‌گوید و با یک دکمه شروع می‌کند. داده: db.set.nx (کوچک).
   بخش خانه: HSEC.nx (در اولین اجرا به بالای خانه اضافه می‌شود؛ از «مدیریت بخش‌های خانه» قابل‌خاموش‌کردن است). */
(function(){
const T=(fa,en)=>{try{return LANGEN()?en:fa}catch(e){return fa}};
const NX=()=>{const s=db.set;if(!s.nx||typeof s.nx!=='object')s.nx={};const n=s.nx;
  if(n.am===undefined){n.am='08:00';n.pm='21:00';n.amOn=1;n.pmOn=1}
  if(!n.skip||n.skip.d!==todayISO())n.skip={d:todayISO(),ids:[]};return n};
const say=(m,b)=>{try{toast(m,b)}catch(e){}};
const on=m=>{try{return modOn(m)}catch(e){return false}};
const nowM=()=>{const d=new Date();return d.getHours()*60+d.getMinutes()};
const left=d=>{const x=dlParts(d);return x.d?fa(x.d)+T(' روز',' d'):x.h?fa(x.h)+T(' ساعت',' h'):fa(x.m)+T(' دقیقه',' min')};

/* ---------- انتخاب بهترین کار بعدی ---------- */
function cands(){const t=todayISO(),now=Date.now(),out=[],nm=nowM();
  try{plan(t).forEach((x,i)=>{if(['done','canceled','carried'].includes(x.status)||!act(x.actId))return;
    const rem=x.goal?x.goal-actual(t,x.actId):25;if(x.goal&&rem<=0)return;
    let sc=60+(x.pr==='high'?25:0)+(x.status==='doing'?10:0),why=[];
    if(x.pr==='high')why.push(T('اولویت بالا ★','High priority ★'));
    if(x.start){const df=tm(x.start)-nm,en=x.end?tm(x.end):1440;
      if(df<=0&&nm<en){sc+=25;why.push(T('الان زمانش است','It is time now'))}
      else if(df>0&&df<=60){sc+=8;why.push(T('تا '+fa(df)+' دقیقه‌ی دیگر','In '+df+' min'))}
      else if(df>60)sc-=Math.min(25,Math.round(df/20))}
    if(x.goal)why.push(T('باقی‌مانده '+mm(rem),mm(rem)+' left'));
    out.push({id:'p'+(x.id||i),sc,t:aN(x.actId),why:why.join(' · ')||T('در برنامه‌ی امروز','In today\'s plan'),a:x.actId,k:'act'})})}catch(e){}
  try{const seen=new Set();plOverdue().sort((a,b)=>(b.x.pr==='high')-(a.x.pr==='high')||a.d.localeCompare(b.d)).slice(0,6).forEach(o=>{
    if(!act(o.x.actId)||seen.has(o.x.actId))return;seen.add(o.x.actId);
    out.push({id:'o'+o.x.actId,sc:48+(o.x.pr==='high'?15:0),t:aN(o.x.actId),why:T('عقب‌افتاده از '+fmtD(o.d),'Overdue since '+fmtD(o.d)),a:o.x.actId,k:'act'})})}catch(e){}
  try{if(on('dl'))zDL().items.filter(dlOk).forEach(x=>{if(x.done||x.arch)return;const ms=dlTs(x)-now;
    if(ms<-864e5||ms>3*864e5)return;
    out.push({id:'d'+x.id,sc:ms<0?92:Math.round(88-ms/864e5*14),t:x.title,why:ms<0?T('موعد گذشته است','Past due'):T('موعد تا '+left(ms),'Due in '+left(ms)),k:'go',p:'dl'})})}catch(e){}
  try{const n=srsDue().length;if(n)out.push({id:'s',sc:40+Math.min(20,n),t:T('مرور کارت‌ها','Review cards'),why:T(fa(n)+' کارت آماده‌ی مرور','' +n+' cards due'),k:'go',p:'acd'})}catch(e){}
  try{if(on('hab')){const c=hItems().filter(h=>hExp(h,t)&&!hSt(h,t)).length;if(c)out.push({id:'h',sc:34+(new Date().getHours()>=18?18:0),t:T('عادت‌های امروز','Today\'s habits'),why:T(fa(c)+' عادت هنوز ثبت نشده','' +c+' habit(s) not logged yet'),k:'go',p:'hab'})}}catch(e){}
  return out.sort((a,b)=>b.sc-a.sc)}
function ranked(){const n=NX();return cands().filter(c=>!n.skip.ids.includes(c.id))}

/* ---------- کارت ---------- */
function card(force){const n0=NX();if(n0.off&&!force)return'';const run=db.timer&&['running','paused','ended'].includes(db.timer.state);if(run)return'';
  const n=NX(),l=ranked(),b=l[0];let h='<div class="c" id="nxcard"><div class="m">✨ '+T('بعدی چی؟','What next?')+'</div>';
  if(!b){h+='<div style="font-size:1.15em;font-weight:700;margin:6px 0">'+T('همه‌چیز مرتب است 🎉','All clear 🎉')+'</div><p class="m">'+T('برنامه‌ای برای ادامه نیست. یک کار برای امروز بنویس یا یک فعالیت را شروع کن.','Nothing left to do. Add a task for today or start an activity.')+'</p>'
    +'<div class="row"><button class="p" data-a="go" data-p="plan">'+T('برنامه‌ریزی امروز','Plan today')+'</button>'+(n.skip.ids.length?'<button data-a="nx_reset">'+T('نمایش دوباره‌ی ردشده‌ها','Show skipped again')+'</button>':'')+'</div></div>';return h}
  h+='<div style="font-size:1.3em;font-weight:700;margin:6px 0 2px">'+esc(b.t)+'</div><div class="m">'+esc(b.why)+'</div><div class="row" style="margin-top:10px">';
  h+=b.k==='act'?'<button class="p" data-a="nx_go" data-i="'+esc(b.id)+'">▶ '+T('شروع','Start')+'</button><button data-a="nx_sw" data-i="'+esc(b.id)+'">⏱ '+T('کرنومتر','Stopwatch')+'</button>'
    :'<button class="p" data-a="nx_go" data-i="'+esc(b.id)+'">'+T('برو','Open')+'</button>';
  h+='<button data-a="nx_skip" data-i="'+esc(b.id)+'">⏭ '+T('بعدی','Next')+'</button></div>';
  if(l.length>1)h+='<div class="m" style="margin-top:8px">'+T('بعد از آن: ','Then: ')+l.slice(1,3).map(x=>esc(x.t)).join(' · ')+'</div>';
  h+='<details style="margin-top:8px"><summary class="m">'+T('تنظیمات اعلان صبح و شب','Morning & evening notifications')+'</summary>'
    +'<div class="row" style="margin-top:6px"><label class="m"><input type="checkbox" id="nx-amo" '+(n.amOn?'checked':'')+'> '+T('صبح','Morning')+'</label><input type="time" id="nx-am" value="'+esc(n.am)+'">'
    +'<label class="m"><input type="checkbox" id="nx-pmo" '+(n.pmOn?'checked':'')+'> '+T('شب','Evening')+'</label><input type="time" id="nx-pm" value="'+esc(n.pm)+'"><button data-a="nx_save">'+T('ذخیره','Save')+'</button></div>'
    +'<div class="row"><button data-a="nx_off">'+T('پنهان کردن این کارت از خانه','Hide this card from home')+'</button></div><p class="m">'+T('پیشنهاد بر اساس: زمان کار در برنامه، اولویت ★، عقب‌افتاده‌ها، موعدهای ۳ روز آینده، کارت‌های مرور و عادت‌ها. اعلان‌ها فقط در اپ اندروید.','Based on: planned time, ★ priority, overdue items, deadlines in 3 days, due cards and habits. Notifications work in the Android app only.')+'</p></details></div>';
  return h}

/* ---------- عمل‌ها ---------- */
const find=id=>cands().find(c=>c.id===id);
H.nx_go=e=>{const c=find(e.dataset.i);if(!c)return render();
  if(c.k==='go'){H.go({dataset:{p:c.p}});return}
  if(typeof daniPomoStart==='function'||window.daniPomoStart){window.daniPomoStart(c.a);render()}else{TM.start('sw',c.a,'',0);render()}};
H.nx_sw=e=>{const c=find(e.dataset.i);if(!c)return render();TM.start('sw',c.a,'',0);render()};
H.nx_skip=e=>{const n=NX();n.skip.ids.push(e.dataset.i);save();render()};
H.nx_off=()=>{NX().off=1;save();say(T('پنهان شد؛ از «مدیریت بخش‌های خانه» دوباره روشنش کن','Hidden; turn it back on from the home sections manager'));render()};
H.nx_reset=()=>{NX().skip.ids=[];save();render()};
H.nx_save=()=>{const n=NX(),ok=v=>/^\d\d:\d\d$/.test(v);const a=val('nx-am'),b=val('nx-pm');
  if(ok(a))n.am=a;if(ok(b))n.pm=b;n.amOn=$('#nx-amo')&&$('#nx-amo').checked?1:0;n.pmOn=$('#nx-pmo')&&$('#nx-pmo').checked?1:0;save();
  try{if(window.Notifier)Notifier.sync(true)}catch(e){}say(T('ذخیره شد ✓','Saved ✓'))};

/* ---------- اتصال به خانه و «امروز» ---------- */
HSEC.nx={n:T('بعدی چی؟ (پیشنهاد خودکار)','What next? (auto suggestion)'),r:()=>{const n=NX();if(n.off){n.off=0;save()}return card(true)}};
/* در چیدمان‌ها و تم‌هایی که بخش‌های خانه را از HSEC نمی‌سازند (مثل Desk و تم‌های اختصاصی) بعد از دکمه‌ی بزرگ «ثبت فعالیت» یا بالای صفحه نشان بده */
{const _ph=PG.home;PG.home=function(){const h=_ph.apply(this,arguments);if(typeof h!=='string'||h.includes('id="nxcard"'))return h;
  let c='';try{c=card()}catch(e){}if(!c)return h;
  const i=h.indexOf('hcta');if(i>=0){const j=h.indexOf('</button>',i);if(j>=0)return h.slice(0,j+9)+c+h.slice(j+9)}
  return c+h}}
const _rc=recCard;recCard=function(){return(window.daniNoExtra?'':card())+_rc.apply(this,arguments)};

/* ---------- اعلان خلاصه‌ی صبح و شب (اپ اندروید) ---------- */
const hs=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return 2e8+Math.abs(h)%1e8};
(window.daniExtraPlan=window.daniExtraPlan||[]).push(now=>{const n=NX(),out=[],t0=todayISO();
  for(let i=0;i<3;i++){const d=addD(t0,i);
    [['am',n.am,n.amOn],['pm',n.pm,n.pmOn]].forEach(([k,hm0,flag])=>{if(!flag||!/^\d\d:\d\d$/.test(hm0))return;
      const[y,m,dd]=d.split('-').map(Number),[H0,M0]=hm0.split(':').map(Number),at=new Date(y,m-1,dd,H0,M0).getTime();
      if(at<now+2000||(typeof inQuiet==='function'&&inQuiet(at)))return;
      let body;
      if(k==='am'){const b=i===0?ranked()[0]:null;body=b?T('اول: '+b.t+' — '+b.why,'First: '+b.t+' — '+b.why):T('صبح بخیر! برنامه‌ی امروز را ببین و اولین کار را شروع کن','Good morning! Check today\'s plan and start the first task')}
      else{let c=0,s=0;try{if(i===0){if(on('hab'))c=hItems().filter(h=>hExp(h,d)&&!hSt(h,d)).length;s=srsDue().length}}catch(e){}
        body=T('امروز چه کردی؟ ثبت‌ها را کامل کن'+(c?' · '+fa(c)+' عادت مانده':'')+(s?' · '+fa(s)+' کارت مرور':''),'How was your day? Complete your log'+(c?' · '+c+' habit(s) left':'')+(s?' · '+s+' cards due':''))}
      out.push({id:hs(d+k),at,title:k==='am'?'DANI ☀️':'DANI 🌙',body,ch:'dani-remind-v2',key:'nx-'+d+k})})}
  return out});
})();
