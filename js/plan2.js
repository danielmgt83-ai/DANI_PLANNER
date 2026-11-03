"use strict";
/* DANI · plan2.js — صفحه‌ی «برنامه» (قدم ۲ و ۳): هر روز و هر موقع بتوانی برنامه بگذاری (کار فوری، قرار، مناسبت)، توقع هفته/ماه هر پروژه و بخش،
   بلوک‌های مشغول (کلاس، سر کار، جلسه) و باقی بخش‌های «برنامه‌ریزی» که قبلاً پراکنده بودند: عادت‌ها، یادآوری‌ها، موعدها، تقویم، قالب و تکرار.
   زبانه‌ها: day (برنامه‌ی روز دلخواه = همان ویرایشگر فردا) | exp (توقع هفته/ماه) | busy (بلوک‌های مشغول) | hab | rem | dl | cal | tpl.
   داده: db.set.bz {items:[{id,t,days:[getDay],date,s,e,dnd}]}، p.wk/p.mo (ساعت توقع هفته/ماه پروژه) و بخش x.wk در db.mods.pj.
   بلوک مشغول: روی تایم‌لاین و برنامه‌ی روز دیده می‌شود و اعلان‌های عادی در آن بازه فرستاده نمی‌شود (اگر dnd باشد؛ زنگ تایمر/پومودورو همیشه می‌ماند). */
(function(){
const T=window.daniT;
const say=(m,b)=>{try{toast(m,b)}catch(e){}};
const P2={tab:'day',date:'',f:null,sub:'busy'};
const TABS=[['day','🗓',['برنامه‌ی روز','Day plan']],['exp','🎯',['توقع هفته و ماه','Week & month goals']],['bh','⛔',['ساعت پر · عادت · یادآور','Busy · Habits · Reminders']],['cal','📅',['تقویم و موعدها','Calendar & deadlines']]];
const OLD={busy:['bh','busy'],hab:['bh','hab'],rem:['bh','rem'],dl:['cal'],tpl:['day']};
window.daniP2Go=(tab,date)=>{tab=tab||'day';if(OLD[tab]){if(OLD[tab][1])P2.sub=OLD[tab][1];tab=OLD[tab][0]}P2.tab=tab;if(date)P2.date=date;page='plan2';render();try{window.scrollTo(0,0)}catch(e){}};
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
const dnum=x=>db.set.cal==='g'?+x.slice(8):J(x)[2];
function stripHTML(d){const t=todayISO();let h='<div class="p2st">';
  for(let i=0;i<7;i++){const x=addD(t,i);let mins=0,pl=[];try{pl=plan(x)||[];pl.forEach(y=>{if(y.status!=='carried'&&y.status!=='canceled')mins+=+y.goal||0})}catch(e){}
    let mk='';try{if(window.daniOccasions&&window.daniOccasions(x).some(o=>o.h&&!o.wk))mk+='🟥'}catch(e){}try{if((zDL().items||[]).some(q=>!q.arch&&!q.done&&q.dt===x))mk+='⏳'}catch(e){}try{if(busyOn(x).length)mk+='⛔'}catch(e){}
    h+='<button class="p2d'+(x===d?' on':'')+'" data-a="p2_d" data-to="'+i+'"><small>'+esc(WD[P(x).getDay()])+'</small><b>'+fa(dnum(x))+'</b><span class="p2b"><i style="height:'+Math.min(100,Math.round(mins/6))+'%"></i></span><small>'+(mins?mm(mins):'·')+'</small><small>'+mk+'</small></button>'}
  return h+'</div>'}
function odBar(){let l=[];try{l=plOverdue()}catch(e){}if(!l.length)return'';
  return'<details class="c" id="p2od"><summary style="cursor:pointer"><b>⚠ '+fa(l.length)+' '+T('کار ناتمام از روزهای قبل','unfinished from earlier days')+'</b> <span class="m">'+T('(باز کن)','(open)')+'</span></summary>'
   +'<div class="row" style="margin:6px 0"><button class="chip" data-a="p2_odall">⟳ '+T('همه را به امروز ببر','Move all to today')+'</button></div>'+overdueCard()+'</details>'}
H.p2_odall=()=>{const t=todayISO();let n=0;plOverdue().forEach(o=>{const p=plan(o.d).find(x=>x.id===o.x.id);if(!p)return;p.status='carried';p.to=t;(db.plans[t]=db.plans[t]||[]).push(Object.assign({},p,{id:uid(),status:'todo',reason:'',from:o.d,n:(p.n||0)+1,to:undefined}));n++});save();say(T(fa(n)+' کار به امروز منتقل شد','Moved '+n+' items to today'));render()};
/* برنامه در برابر واقعی (برنامه‌ی ذخیره‌شده‌ی این روز) */
function vsCard(d){let p=[];try{p=plan(d)||[]}catch(e){}if(!p.length)return'';vd=d;let pr={pc:0,goal:0,act:0};try{pr=prog(d)}catch(e){}
  return'<div class="c">'+daniH('📊','برنامه در برابر واقعی','Planned vs actual')+'<p class="m">'+T('پیشرفت','Progress')+' '+fa(pr.pc)+(LANGEN()?'%':'٪')+' · '+T('هدف','goal')+' '+mm(pr.goal)+' · '+T('واقعی','actual')+' '+mm(pr.act)+'</p>'
   +p.map((x,i)=>{if(!x.actId||!act(x.actId))return'';const a=actual(d,x.actId),g=+x.goal||0;
     return'<div class="dyp" style="display:block"><div class="row" style="flex-wrap:nowrap;gap:6px"><b style="flex:1;min-width:0">'+(x.pr==='high'?'★ ':'')+esc(aN(x.actId))+'</b><span class="m">'+mm(a)+(g?' / '+mm(g):'')+'</span></div>'
     +(g?'<div class="bar thin"><i style="width:'+Math.min(100,Math.round(a/g*100))+'%;background:'+(a>=g*.9?'#22c55e':'#f59e0b')+'"></i></div>':'')
     +(x.from?'<div class="m">'+T('از ','From ')+fmtD(x.from)+'</div>':'')+(x.reason&&!/^(night|quick|copy|tpl|rec)$/.test(x.reason)?'<div class="m">'+T('دلیل: ','Reason: ')+esc(x.reason)+'</div>':'')
     +'<div class="row" style="margin-top:4px"><select data-ch="pst" data-i="'+i+'" style="flex:1;min-width:0">'+PL_ST.map(z=>'<option value="'+z[0]+'"'+(x.status===z[0]?' selected':'')+'>'+z[1]+'</option>').join('')+'</select>'
     +'<button class="chip" data-a="ppr" data-i="'+i+'" aria-label="priority">'+(x.pr==='high'?'★':'☆')+'</button><button class="chip" data-a="pmv" data-i="'+i+'">'+T('فردا','Tomorrow')+'</button><button class="chip" data-a="pdel" data-i="'+i+'" aria-label="delete">🗑</button></div></div>'}).join('')+'</div>'}
/* کارهای تکرارشونده: فقط فهرست (افزودنش با گزینه‌ی 🔁 کنار هر کار در فهرست) */
function recList(){let l=[];try{l=prList()}catch(e){}
  return'<details class="c"><summary style="cursor:pointer">'+daniH('🔁','کارهای تکرارشونده ('+fa(l.length)+')','Repeating tasks ('+fa(l.length)+')')+'</summary><p class="m">'+T('در فهرست بالا کنار هر کار گزینه‌ی «تکرار» را بزن تا هر روز یا هر هفته خودکار به برنامه بیاید.','Use the “Repeat” choice next to any item above to add it automatically every day or week.')+'</p>'
   +(l.length?l.map(r=>'<div class="cwr '+(r.on===false?'off':'')+'" style="display:flex;gap:6px;align-items:center"><span style="flex:1;min-width:0">'+esc(aN(r.actId))+' · '+mm(r.goal||0)+' · '+(r.freq==='daily'?T('هر روز','Every day'):(r.dow||[]).map(i=>zWD[i]).join('، '))+'</span><button class="chip" data-a="prt" data-id="'+r.id+'">'+(r.on===false?T('روشن','On'):T('خاموش','Off'))+'</button><button class="chip" data-a="prd" data-id="'+r.id+'" aria-label="delete">✕</button></div>').join(''):'<p class="m">'+T('هنوز تکراری نداری.','No repeats yet.')+'</p>')+'</details>'}
/* از کارت‌های قدیمی «برنامه» فقط قالب‌ها و مناسبت‌ها نگه داشته می‌شوند (داخل خودِ همان کارت‌ها) */
function legacyCards(ids){try{const t=document.createElement('div');t.innerHTML=PX.plan();return ids.map(id=>{const e=t.querySelector(id);return e?e.outerHTML:''}).join('')}catch(e){return''}}
function dayTab(){const t=todayISO(),d=P2.date&&P2.date>=addD(t,-30)?P2.date:addD(t,1);P2.date=d;vd=d;
  let h='<div class="c"><div class="row" style="align-items:center"><button class="chip" data-a="p2_d" data-n="-1" aria-label="prev">‹</button><b style="flex:1;text-align:center">'+fmtDL(d)+'</b><button class="chip" data-a="p2_d" data-n="1" aria-label="next">›</button></div>'+stripHTML(d)
   +'<p class="m" style="margin:4px 0 0">'+T('ستون = حجم برنامه‌ی آن روز · 🟥 تعطیلی · ⏳ موعد · ⛔ ساعت پر','Bar = planned load · 🟥 holiday · ⏳ deadline · ⛔ busy')+'</p>';
  const ev=eventsOf(d);if(ev.length)h+='<div class="dyex" style="margin-top:6px">'+ev.join('<br>')+'</div>';
  h+='</div>'+odBar();
  try{window.daniPlanLoad(d);h+=PG.tmr()}catch(e){console.error('p2 day',e)}
  h+=vsCard(d)+recList();
  const cp='<div class="row" style="margin:6px 0"><button class="chip" data-a="copyDay">'+T('کپی به روز دیگر','Copy to another day')+'</button><button class="chip" data-a="tmpl">'+T('قالب هفتگی: اعمال روی ۷ روز','Weekly template: apply to 7 days')+'</button></div>';
  h+=legacyCards(['#tpcard']).replace('</summary>','</summary>'+cp);
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
     +(window.daniFcLine&&window.daniFcLine(p)?'<div class="m" style="margin:4px 0">'+window.daniFcLine(p)+'</div>':'')
     +(p.parts||[]).filter(x=>act(x.a)).map(x=>{const xw=+x.wk||0,dX=per(p,w0,t,x);return'<div class="row" style="margin-top:4px;gap:6px"><span style="flex:1;min-width:0">'+esc(aN(x.a))+' <span class="m">'+mm(dX)+'</span></span><input type="number" min="0" step="0.5" value="'+(xw||'')+'" placeholder="'+T('ساعت/هفته','h/week')+'" data-ex="x" data-p="'+esc(p.id)+'" data-x="'+esc(x.id)+'" data-f="wk" style="width:90px"></div>'+(xw?bar2(dX,xw*60,wd/7,''):'')}).join('')+'</div>'});
  h+='</div>';
  if(tw||tmn)h+='<div class="c" style="margin-top:8px">'+daniH('📈','نتیجه','Result')+(tw?verdict(dw,tw,wd/7,T('این هفته','This week')):'')+(tmn?verdict(dmn,tmn,md/mt,T('این ماه','This month')):'')+'</div>';
  try{h+=weekCard()}catch(e){}
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
const embed=(fn,name)=>{try{return typeof fn==='function'?String(fn()).replace(/<div class="row cmbar"[^>]*>.*?<\/div>/,''):''}catch(e){console.error('p2 '+name,e);return'<div class="c"><p class="m">⚠ '+name+'</p></div>'}};
const SUBS=[['busy','⛔',['ساعت‌های پر','Busy blocks'],['کلاس، کار، جلسه: ساعت‌هایی که مشغولی؛ در آن‌ها اعلان نمی‌آید و برنامه نمی‌چیند.','Class, job, meetings: times you are busy; no notifications then.']],['hab','🔁',['عادت‌ها','Habits'],['کار بله/نه بدون زمان که هر روز تکرار می‌شود (آب، دارو، ورزش کوتاه)؛ فقط پیوستگی روزها را می‌شمارد.','A yes/no thing without duration you repeat daily (water, medicine, short workout); it only counts your streak.']],['rem','🔔',['یادآوری‌ها','Reminders'],['یک اعلان در ساعت مشخص (قرار دکتر، پرداخت قبض)، یک‌بار یا تکراری.','One notification at a set time (appointment, bill), once or repeating.']]];
function bhTab(){const k=SUBS.some(x=>x[0]===P2.sub)?P2.sub:'busy',cur=SUBS.find(x=>x[0]===k);
  return'<div class="row" style="margin:6px 0">'+SUBS.map(x=>'<button class="chip '+(x[0]===k?'on':'')+'" data-a="p2_s" data-k="'+x[0]+'">'+x[1]+' '+T(x[2][0],x[2][1])+'</button>').join('')+'</div><p class="m" style="margin:0 0 6px">'+T(cur[3][0],cur[3][1])+'</p>'
   +(k==='busy'?busyTab():k==='hab'?embed(PG.hab,'habits'):embed(PG.rem,'reminders'))}
H.p2_s=e=>{P2.sub=e.dataset.k;render()};
/* ---------- تقویم یکپارچه ---------- */
function monthOf(base){let st,len,title;
  if(db.set.cal==='g'){const d=P(base);st=iso(new Date(d.getFullYear(),d.getMonth(),1,12));len=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();title=d.toLocaleDateString(LANGEN()?'en-US':'fa-IR',{calendar:'gregory',month:'long',year:'numeric'})}
  else{const[y,m]=J(base),f=j2g(y,m,1);st=iso(new Date(f[0],f[1]-1,f[2],12));len=m<=6?31:m<=11?30:([1,5,9,13,17,22,26,30].includes(y%33)?30:29);title=JM[m-1]+' '+fa(y)}
  return{st,len,title}}
function marks(d){const o={hol:0,occ:0,dl:0,rm:0,bz:0,pl:0,lg:0,fin:0};try{o.fin=(window.daniFcFinishOn&&window.daniFcFinishOn(d).length)?1:0}catch(e){}
  try{if(window.daniOccasions)window.daniOccasions(d).forEach(x=>{if(x.wk)return;if(x.h)o.hol=1;else o.occ=1})}catch(e){}
  try{o.dl=(zDL().items||[]).some(x=>!x.arch&&!x.done&&x.dt===d)?1:0}catch(e){}
  try{o.rm=(zRM().items||[]).some(r=>!r.off&&r.date===d)?1:0}catch(e){}
  try{o.bz=busyOn(d).length?1:0}catch(e){}
  try{o.pl=(plan(d)||[]).filter(x=>x.status!=='carried'&&x.status!=='canceled').length}catch(e){}
  try{o.lg=sum(E(d)||[])}catch(e){}
  return o}
function calTab(){const t=todayISO();if(!P2.cm)P2.cm=t;if(!P2.cs)P2.cs=t;const M=monthOf(P2.cm),off=(P(M.st).getDay()+1)%7;
  const dot=(c,tt)=>'<i title="'+esc(tt)+'" style="background:'+c+'"></i>';
  let g='<div class="p2cal">'+['ش','ی','د','س','چ','پ','ج'].map(x=>'<b class="p2h">'+x+'</b>').join('')+'<span></span>'.repeat(off);
  for(let i=0;i<M.len;i++){const d=addD(M.st,i),k=marks(d);
    g+='<button class="p2c'+(d===t?' td':'')+(d===P2.cs?' sel':'')+(k.hol?' hol':'')+'" data-a="p2_cd" data-d="'+d+'"><span>'+fa(dnum(d))+'</span><em>'+(k.hol?dot('#ef4444',T('تعطیلی','Holiday')):'')+(k.occ?dot('#a855f7',T('مناسبت','Occasion')):'')+(k.dl?dot('#f59e0b',T('موعد','Deadline')):'')+(k.fin?dot('#10b981',T('پایان پیش‌بینی‌شده','Forecast finish')):'')+(k.rm?dot('#3b82f6',T('یادآوری','Reminder')):'')+(k.bz?dot('#94a3b8',T('ساعت پر','Busy')):'')+(k.pl?dot('var(--ac,#22c55e)',T('برنامه','Plan')):'')+'</em></button>'}
  g+='</div>';
  const leg='<p class="m" style="margin:6px 0 0"><span class="p2l" style="background:#ef4444"></span>'+T('تعطیلی','Holiday')+' <span class="p2l" style="background:#a855f7"></span>'+T('مناسبت','Occasion')+' <span class="p2l" style="background:#f59e0b"></span>'+T('موعد','Deadline')+' <span class="p2l" style="background:#10b981"></span>'+T('پایان پیش‌بینی','Forecast end')+' <span class="p2l" style="background:#3b82f6"></span>'+T('یادآوری','Reminder')+' <span class="p2l" style="background:#94a3b8"></span>'+T('ساعت پر','Busy')+' <span class="p2l" style="background:var(--ac,#22c55e)"></span>'+T('برنامه','Plan')+'</p>';
  let h='<div class="c"><div class="row" style="align-items:center"><button class="chip" data-a="p2_cm" data-n="-1" aria-label="prev">‹</button><b style="flex:1;text-align:center">'+M.title+'</b><button class="chip" data-a="p2_cm" data-n="1" aria-label="next">›</button><button class="chip" data-a="p2_cm" data-n="0">'+T('امروز','Today')+'</button></div>'+g+leg+'</div>';
  const d=P2.cs,k=marks(d);let ev=[];try{ev=eventsOf(d)}catch(e){}
  let pl=[];try{pl=(plan(d)||[]).filter(x=>x.actId&&act(x.actId))}catch(e){}
  h+='<div class="c"><b>'+fmtDL(d)+'</b>'
   +(ev.length?'<div class="dyex" style="margin-top:6px">'+ev.join('<br>')+'</div>':'<p class="m">'+T('رویدادی برای این روز نیست (نه تعطیلی، نه موعد، نه یادآوری).','Nothing on this day (no holiday, deadline or reminder).')+'</p>')
   +(pl.length?'<div class="m" style="margin-top:6px">🗓 '+pl.map(x=>esc(aN(x.actId))+' '+mm(+x.goal||0)).join(' · ')+'</div>':'')
   +(function(){let n=[];try{n=window.daniFcFinishOn?window.daniFcFinishOn(d):[]}catch(e){}return n.length?'<div class="m">🏁 '+T('پایان پیش‌بینی‌شده: ','Forecast finish: ')+esc(n.join('، '))+'</div>':''})()
   +(k.lg?'<div class="m">✅ '+T('ثبت‌شده: ','Logged: ')+mm(k.lg)+'</div>':'')
   +'<div class="row" style="margin-top:8px"><button class="p" data-a="p2_cp">🗓 '+T('برنامه‌ریزی این روز','Plan this day')+'</button><button class="chip" data-a="p2_cr">🔔 '+T('یادآوری','Reminder')+'</button><button class="chip" data-a="p2_cb">⛔ '+T('ساعت پر','Busy')+'</button></div></div>';
  h+='<details class="c"><summary style="cursor:pointer">'+daniH('⏳','موعدها (افزودن و فهرست)','Deadlines (add & list)')+'</summary>'+embed(PG.dl,'deadlines')+'</details>'+legacyCards(['#ocdet']);
  return h}
H.p2_cd=e=>{P2.cs=e.dataset.d;render()};
H.p2_cm=e=>{const n=+e.dataset.n,M=monthOf(P2.cm||todayISO());P2.cm=n===0?todayISO():(n>0?addD(M.st,M.len):addD(M.st,-1));if(n===0)P2.cs=todayISO();render()};
H.p2_cp=()=>{P2.date=P2.cs;P2.tab='day';render();try{window.scrollTo(0,0)}catch(e){}};
H.p2_cr=()=>{P2.tab='bh';P2.sub='rem';render();try{window.scrollTo(0,0)}catch(e){}};
H.p2_cb=()=>{P2.tab='bh';P2.sub='busy';P2.f={k:'d'};render();try{window.scrollTo(0,0)}catch(e){}};
PG.plan2=function(){
  let h='<div class="row np tabs" style="flex-wrap:wrap">'+TABS.map(x=>'<button class="'+(P2.tab===x[0]?'p':'')+'" data-a="p2_t" data-k="'+x[0]+'">'+x[1]+' '+T(x[2][0],x[2][1])+'</button>').join('')+'</div>';
  const k=OLD[P2.tab]?OLD[P2.tab][0]:P2.tab;
  if(k==='day')h+=dayTab();else if(k==='exp')h+=expTab();else if(k==='bh')h+=bhTab();else if(k==='cal')h+=calTab();
  return h};
try{const s=document.createElement('style');s.textContent='.p2cal{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-top:8px}.p2h{text-align:center;font-size:.75em;opacity:.7}.p2c{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:2px;min-height:46px;padding:4px 0;border-radius:10px;border:1px solid var(--b,#8883);background:transparent;color:inherit;font:inherit}.p2c.td{border-color:var(--ac,#3b82f6)}.p2c.sel{background:rgba(59,130,246,.15)}.p2c.hol span{color:#ef4444}.p2c em{display:flex;flex-wrap:wrap;gap:2px;justify-content:center;max-width:100%}.p2c em i{width:6px;height:6px;border-radius:50%;display:inline-block}.p2l{display:inline-block;width:8px;height:8px;border-radius:50%;margin-inline:4px 2px}.p2st{display:flex;gap:4px;margin-top:8px}.p2d{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:1px;padding:5px 2px;border-radius:10px;border:1px solid var(--b,#8883);background:transparent;color:inherit;font:inherit}.p2d.on{border-color:var(--ac,#3b82f6);background:rgba(59,130,246,.12)}.p2d small{font-size:.62em;opacity:.8;line-height:1.2;max-width:100%;overflow:hidden;white-space:nowrap}.p2b{width:10px;height:22px;border-radius:5px;background:var(--b,#8883);display:flex;align-items:flex-end;overflow:hidden}.p2b i{display:block;width:100%;background:var(--ac,#3b82f6)}';document.head.appendChild(s)}catch(e){}
try{BI_NAV.plan2=['Plan','برنامه'];EXT_PAGES.add('plan2');ICONS.plan2='<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/>'}catch(e){}
/* تایم‌لاین: بلوک‌های مشغول هم دیده شوند (ردیف جدا زیر نوار اصلی) */
window.daniBusyBar=d=>{try{const b=busyOn(d);if(!b.length)return'';return'<div class="dytr" title="'+T('مشغول','Busy')+'">'+b.map(x=>'<i style="left:'+(tm(x.s)/14.4)+'%;width:'+((tm(x.e)-tm(x.s))/14.4)+'%;background:rgba(148,163,184,.55)" title="'+esc(x.t)+'"></i>').join('')+'</div>'}catch(e){return''}};
})();
