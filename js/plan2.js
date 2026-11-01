"use strict";
/* DANI · plan2.js — صفحه‌ی «برنامه» (قدم ۲ و ۳): هر روز و هر موقع بتوانی برنامه بگذاری (کار فوری، قرار، مناسبت)، توقع هفته/ماه هر پروژه و بخش،
   بلوک‌های مشغول (کلاس، سر کار، جلسه) و باقی بخش‌های «برنامه‌ریزی» که قبلاً پراکنده بودند: عادت‌ها، یادآوری‌ها، موعدها، تقویم، قالب و تکرار.
   زبانه‌ها: day (برنامه‌ی روز دلخواه = همان ویرایشگر فردا) | exp (توقع هفته/ماه) | busy (بلوک‌های مشغول) | hab | rem | dl | cal | tpl.
   داده: db.set.bz {items:[{id,t,days:[getDay],date,s,e,dnd}]}، p.wk/p.mo (ساعت توقع هفته/ماه پروژه) و بخش x.wk در db.mods.pj.
   بلوک مشغول: روی تایم‌لاین و برنامه‌ی روز دیده می‌شود و اعلان‌های عادی در آن بازه فرستاده نمی‌شود (اگر dnd باشد؛ زنگ تایمر/پومودورو همیشه می‌ماند). */
(function(){
const T=window.daniT;
const say=(m,b)=>{try{toast(m,b)}catch(e){}};
const P2={tab:'day',date:'',f:null};
const TABS=[['day','🗓',['برنامه‌ی روز','Day plan']],['exp','🎯',['توقع هفته و ماه','Week & month goals']],['busy','⛔',['بلوک‌های مشغول','Busy blocks']],['hab','🔁',['عادت‌ها','Habits']],['rem','🔔',['یادآوری‌ها','Reminders']],['dl','⏳',['موعدها','Deadlines']],['cal','📅',['تقویم','Calendar']],['tpl','🧩',['قالب و تکرار','Templates & repeats']]];
window.daniP2Go=(tab,date)=>{P2.tab=tab||'day';if(date)P2.date=date;page='plan2';render();try{window.scrollTo(0,0)}catch(e){}};
H.p2_t=e=>{P2.tab=e.dataset.k;render()};
const BZ=()=>{const s=db.set;if(!s.bz||typeof s.bz!=='object')s.bz={};if(!Array.isArray(s.bz.items))s.bz.items=[];return s.bz};
const hh=m=>pad(Math.floor(m/60)%24)+':'+pad(m%60);

/* ---------- بلوک‌های مشغول ---------- */
function busyOn(d){const w=P(d).getDay();return BZ().items.filter(b=>b.date?b.date===d:(b.days||[]).includes(w)).sort((a,b)=>a.s.localeCompare(b.s))}
window.daniBusy=busyOn;
const inBusy=ts=>{try{const dt=new Date(ts),d=iso(dt),m=dt.getHours()*60+dt.getMinutes();return busyOn(d).some(b=>b.dnd!==0&&m>=tm(b.s)&&m<tm(b.e))}catch(e){return false}};
{const _f=window.daniPlanFilter;window.daniPlanFilter=function(out,now){let r=out;try{if(_f)r=_f(out,now)||out}catch(e){}try{return r.filter(x=>x&&(/^(timer|pomo)/.test(String(x.key||''))||x.ch==='dani-alarm-v2'||!inBusy(x.at)))}catch(e){return r}}}
function busyTab(){const A=BZ(),F=P2.f;
  let h='<div class="c">'+daniH('⛔','بلوک‌های مشغول','Busy blocks')+'<p class="m">'+T('ساعت‌هایی که سرگرمی: کلاس، سر کار، جلسه‌ی هفتگی… پلنر در این ساعت‌ها اعلان نمی‌فرستد و آن‌ها را در تایم‌لاین و برنامه‌ی روز نشان می‌دهد.','Hours you are occupied: class, work, a weekly meeting… the planner sends no notifications then and shows them on the timeline and day plan.')+'</p>';
  h+=A.items.length?A.items.slice().sort((a,b)=>a.s.localeCompare(b.s)).map(b=>'<div class="dyp"><span style="flex:1;min-width:0"><b>'+esc(b.t)+'</b> <span class="m">'+fa(b.s)+'–'+fa(b.e)+' · '+(b.date?fmtD(b.date):(b.days||[]).map(i=>zWD[i]).join(' '))+(b.dnd===0?'':' · 🔕')+'</span></span><button class="chip" data-a="bz_del" data-id="'+esc(b.id)+'">🗑</button></div>').join(''):'<p class="m">'+T('هنوز بلوکی نداری.','No blocks yet.')+'</p>';
  h+='</div><div class="c" style="margin-top:8px"><h3>'+T('بلوک تازه','New block')+'</h3><input id="bz-t" placeholder="'+T('مثلاً کلاس زبان','e.g. English class')+'" style="width:100%">'
   +'<div class="row" style="margin:6px 0"><input id="bz-s" type="time" value="08:00"><span class="m">'+T('تا','to')+'</span><input id="bz-e" type="time" value="10:00"></div>'
   +'<div class="row"><button class="chip '+((F||{}).k==='d'?'':'on')+'" data-a="bz_k" data-k="w">'+T('هفتگی (روزهای انتخابی)','Weekly (chosen days)')+'</button><button class="chip '+((F||{}).k==='d'?'on':'')+'" data-a="bz_k" data-k="d">'+T('فقط یک روز','One day only')+'</button></div>'
   +((F||{}).k==='d'?'<div style="margin-top:6px">'+daniDF.html('bz-d',todayISO())+'</div>':'<div class="row" style="margin:6px 0">'+WORDER.map(i=>'<label class="chip"><input type="checkbox" class="bz-w" value="'+i+'">'+zWD[i]+'</label>').join('')+'</div>')
   +'<label class="row" style="gap:6px;margin-top:6px"><input type="checkbox" id="bz-dnd" checked> '+T('در این ساعت اعلان نفرست','No notifications during this time')+'</label>'
   +'<div class="row" style="margin-top:8px"><button class="on" data-a="bz_add">'+T('افزودن','Add')+'</button></div></div>';return h}
H.bz_k=e=>{P2.f={k:e.dataset.k};render()};
H.bz_del=e=>{BZ().items=BZ().items.filter(b=>b.id!==e.dataset.id);save();render()};
H.bz_add=()=>{const t=(document.getElementById('bz-t').value||'').trim().slice(0,60),s=document.getElementById('bz-s').value,e=document.getElementById('bz-e').value,one=(P2.f||{}).k==='d';
  if(!t)return say(T('عنوان را بنویس','Type a title'),1);if(!s||!e||tm(e)<=tm(s))return say(T('ساعت پایان باید بعد از شروع باشد','End must be after start'),1);
  const o={id:uid(),t,s,e,dnd:document.getElementById('bz-dnd').checked?1:0,days:[],date:''};
  if(one){o.date=daniDF.get('bz-d');if(!o.date)return say(T('تاریخ را انتخاب کن','Pick a date'),1)}else{o.days=[...document.querySelectorAll('.bz-w')].filter(x=>x.checked).map(x=>+x.value);if(!o.days.length)return say(T('حداقل یک روز را انتخاب کن','Pick at least one day'),1)}
  if(BZ().items.length>=100)return say(T('حداکثر ۱۰۰ بلوک','Up to 100 blocks'),1);BZ().items.push(o);save();P2.f=null;render()};

/* ---------- برنامه‌ی روز دلخواه ---------- */
function eventsOf(d){const out=[];
  try{busyOn(d).forEach(b=>out.push('⛔ <b>'+esc(b.t)+'</b> '+fa(b.s)+'–'+fa(b.e)))}catch(e){}
  try{(zDL().items||[]).filter(x=>!x.arch&&!x.done&&x.dt===d).forEach(x=>out.push('⏳ <b>'+esc(x.title)+'</b> '+fa(x.tm||'')))}catch(e){}
  try{(zRM().items||[]).filter(r=>!r.off&&r.date===d&&r.repeat==='none').forEach(r=>out.push('🔔 <b>'+esc(r.title)+'</b> '+fa(r.time)))}catch(e){}
  try{if(window.daniOccasions)window.daniOccasions(d).forEach(o=>out.push((o.h?'🟥 ':'▫️ ')+esc(o.n)))}catch(e){}
  return out}
function dayTab(){const t=todayISO(),d=P2.date&&P2.date>=addD(t,-30)?P2.date:addD(t,1);P2.date=d;
  let h='<div class="c"><div class="row" style="align-items:center"><button class="chip" data-a="p2_d" data-n="-1" aria-label="prev">‹</button><b style="flex:1;text-align:center">'+fmtDL(d)+'</b><button class="chip" data-a="p2_d" data-n="1" aria-label="next">›</button></div>'
   +'<div class="row" style="justify-content:center;margin-top:4px"><button class="chip '+(d===t?'on':'')+'" data-a="p2_d" data-to="0">'+T('امروز','Today')+'</button><button class="chip '+(d===addD(t,1)?'on':'')+'" data-a="p2_d" data-to="1">'+T('فردا','Tomorrow')+'</button><span class="m" style="align-self:center">'+T('یا روز دیگر را با ‹ › بزن','or step with ‹ ›')+'</span></div>';
  const ev=eventsOf(d);h+=ev.length?'<div class="dyex">'+ev.join('<br>')+'</div>':'<p class="m">'+T('رویداد یا قراری برای این روز ثبت نشده.','No events or appointments on this day.')+'</p>';
  h+='<p class="m">'+T('کار فوری، قرار یا هر چیز دیگر را همین‌جا بنویس؛ مثلاً «۱ ساعت جلسه ساعت ۱۶».','Write an urgent task, an appointment or anything else here — e.g. “1 hour meeting at 16”.')+'</p></div>';
  try{window.daniPlanLoad(d);h+=PG.tmr()}catch(e){console.error('p2 day',e)}
  return h}
H.p2_d=e=>{const t=todayISO(),x=e.dataset;if(x.to!==undefined)P2.date=addD(t,+x.to);else P2.date=addD(P2.date||addD(t,1),+x.n||0);render()};

/* ---------- توقع هفته و ماه ---------- */
const PJs=()=>{try{return zmg('pj',()=>({v:'w',today:1})).items.filter(p=>!p.arch)}catch(e){return[]}};
const per=(p,a,b,x)=>{let s=0;(E(a,b)||[]).forEach(e=>{(x?[x]:(p.parts||[])).forEach(q=>{if(act(q.a)&&e.actId===q.a&&(!(q.s&&q.s.length)||q.s.includes(e.subId)))s+=e.min||0})});return s};
function mRange(){const o=rng.p;try{rng.p='m';return rngDates()}finally{rng.p=o}}
function expTab(){const t=todayISO(),w0=weekStart(t),[m0,m1]=mRange(),L=PJs();
  const wd=Math.min(7,dDays(w0,t)+1),md=dDays(m0,t)+1,mt=dDays(m0,m1)+1;
  let h='<div class="c">'+daniH('🎯','توقع هفته و ماه','Week & month goals')+'<p class="m">'+T('اول هفته یا ماه بگو برای هر پروژه و بخش چند ساعت وقت می‌گذاری. بعد می‌بینی هفته و ماهت موفق بوده یا نه.','At the start of a week or month say how many hours each project and part gets. Then you see whether the week or month went well.')+'</p>';
  if(!L.length)return h+'<p class="m">'+T('اول در «پروژه‌ها» یک پروژه بساز.','First create a project in “Projects”.')+'</p><button class="p" data-a="go" data-p="pj">🎓 '+T('پروژه‌ها','Projects')+'</button></div>';
  let tw=0,dw=0,tmn=0,dmn=0;
  L.forEach(p=>{const w=+p.wk||0,m=+p.mo||0,dW=per(p,w0,t),dM=per(p,m0,t);tw+=w*60;dw+=dW;tmn+=m*60;dmn+=dM;
    h+='<div class="dyp" style="display:block"><div class="row"><b style="flex:1;min-width:0">'+esc(p.name)+'</b></div>'
     +'<div class="row" style="gap:6px"><label class="m">'+T('هفته','Week')+' <input type="number" min="0" step="0.5" value="'+(w||'')+'" data-ex="p" data-p="'+esc(p.id)+'" data-f="wk" style="width:70px"> '+T('ساعت','h')+'</label><label class="m">'+T('ماه','Month')+' <input type="number" min="0" step="1" value="'+(m||'')+'" data-ex="p" data-p="'+esc(p.id)+'" data-f="mo" style="width:70px"> '+T('ساعت','h')+'</label></div>'
     +(w?bar2(dW,w*60,wd/7,T('هفته','Week')):'')+(m?bar2(dM,m*60,md/mt,T('ماه','Month')):'')
     +(p.parts||[]).filter(x=>act(x.a)).map(x=>{const xw=+x.wk||0,dX=per(p,w0,t,x);return'<div class="row" style="margin-top:4px;gap:6px"><span style="flex:1;min-width:0">'+esc(aN(x.a))+' <span class="m">'+mm(dX)+'</span></span><input type="number" min="0" step="0.5" value="'+(xw||'')+'" placeholder="'+T('ساعت/هفته','h/week')+'" data-ex="x" data-p="'+esc(p.id)+'" data-x="'+esc(x.id)+'" data-f="wk" style="width:90px"></div>'+(xw?bar2(dX,xw*60,wd/7,''):'')}).join('')+'</div>'});
  h+='</div>';
  if(tw||tmn)h+='<div class="c" style="margin-top:8px">'+daniH('📈','نتیجه','Result')+(tw?verdict(dw,tw,wd/7,T('این هفته','This week')):'')+(tmn?verdict(dmn,tmn,md/mt,T('این ماه','This month')):'')+'</div>';
  return h}
const dDays=(a,b)=>Math.round((P(b)-P(a))/864e5);
const bar2=(done,need,exp,lb)=>'<div class="m">'+(lb?lb+': ':'')+mm(done)+' / '+mm(need)+'</div><div class="bar thin"><i style="width:'+Math.min(100,need?Math.round(done/need*100):0)+'%;background:'+(done>=need*exp*.95?'#22c55e':'#f59e0b')+'"></i></div>';
function verdict(done,need,exp,lb){const pc=need?Math.round(done/need*100):0,ok=done>=need*exp*.95;
  return'<div class="row" style="align-items:baseline;margin-top:4px"><b>'+lb+'</b><span class="m">'+mm(done)+' / '+mm(need)+'</span><span style="flex:1"></span><b style="color:'+(ok?'#22c55e':'#f59e0b')+'">'+fa(pc)+(LANGEN()?'%':'٪')+' · '+(ok?T('طبق برنامه','on track'):T('عقب‌تری','behind'))+'</b></div>'}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||!t.dataset.ex)return;const d=t.dataset,p=PJs().concat((zmg('pj',()=>({})).items||[])).find(x=>x.id===d.p);if(!p)return;const v=Math.max(0,+t.value||0);
  if(d.ex==='p')p[d.f]=v;else{const x=(p.parts||[]).find(q=>q.id===d.x);if(x)x[d.f]=v}save();render()});

/* خط‌های کوچک «این هفته» برای صفحه‌ی امروز */
window.daniWeekLines=()=>{try{const t=todayISO(),w0=weekStart(t),L=PJs().filter(p=>+p.wk>0);if(!L.length)return'';
  return'<div style="margin-top:6px">'+L.slice(0,4).map(p=>'<div class="m">🎯 '+esc(p.name)+' · '+T('این هفته','this week')+' '+mm(per(p,w0,t))+' / '+mm(p.wk*60)+'</div>').join('')+'</div>'}catch(e){return''}};
/* ---------- صفحه ---------- */
const embed=(fn,name)=>{try{return typeof fn==='function'?fn():''}catch(e){console.error('p2 '+name,e);return'<div class="c"><p class="m">⚠ '+name+'</p></div>'}};
PG.plan2=function(){
  let h='<div class="row np tabs" style="flex-wrap:wrap">'+TABS.map(x=>'<button class="'+(P2.tab===x[0]?'p':'')+'" data-a="p2_t" data-k="'+x[0]+'">'+x[1]+' '+T(x[2][0],x[2][1])+'</button>').join('')+'</div>';
  const k=P2.tab;
  if(k==='day')h+=dayTab();else if(k==='exp')h+=expTab();else if(k==='busy')h+=busyTab();
  else if(k==='hab')h+=embed(PG.hab,'habits');else if(k==='rem')h+=embed(PG.rem,'reminders');else if(k==='dl')h+=embed(PG.dl,'deadlines');
  else if(k==='cal')h+=embed(PX.cal,'calendar');else if(k==='tpl')h+=embed(PX.plan,'plan');
  return h};
try{BI_NAV.plan2=['Plan','برنامه'];EXT_PAGES.add('plan2');ICONS.plan2='<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/>'}catch(e){}
/* تایم‌لاین: بلوک‌های مشغول هم دیده شوند (ردیف جدا زیر نوار اصلی) */
window.daniBusyBar=d=>{try{const b=busyOn(d);if(!b.length)return'';return'<div class="dytr" title="'+T('مشغول','Busy')+'">'+b.map(x=>'<i style="left:'+(tm(x.s)/14.4)+'%;width:'+((tm(x.e)-tm(x.s))/14.4)+'%;background:rgba(148,163,184,.55)" title="'+esc(x.t)+'"></i>').join('')+'</div>'}catch(e){return''}};
})();
