"use strict";
/* DANI · projects.js — «پروژه‌ها» (مرحله‌ی ب): پروژه ← بخش ← نوع کار، با موعد و بودجه‌ی ساعت.
   مثال: «آزمون MBA» (موعد، ۲۰۰ ساعت) ← بخش‌ها «ریاضی / انگلیسی / GMAT» ← نوع‌ها «تمرین / مرور جزوه / فیلم».
   هیچ داده‌ی جدیدی روی ثبت‌ها نمی‌نشیند: هر بخش به یک «فعالیت» وصل است و نوع‌ها همان «زیرمجموعه‌ی فعالیت»اند،
   پس همه‌ی ثبت‌های قبلی و آینده خودکار حساب می‌شوند (کرنومتر، ثبت سریع، برنامه‌ی فردا، CSV…). یک فعالیت می‌تواند در چند پروژه باشد.
   داده: db.mods.pj {items:[{id,name,dl,due,hrs,from,arch,parts:[{id,a,s:[زیرمجموعه‌ها؛ خالی=همه],hrs}]}], today:1, v:'d|w|m'}
   موعد: یا یکی از موعدهای بخش «موعدها» (p.dl) یا تاریخ دستی (p.due).
   نمایش: امروز / این هفته / این ماه؛ هدفِ دوره = آهنگ لازم (ساعتِ مانده ÷ روزِ مانده) و «انجام‌شده» از ثبت‌ها.
   v44: پروژه = موعد + هدف + عادت + یادآور در یک جا: p.hb (شناسه‌ی عادت‌ها)، p.rm (شناسه‌ی یادآورها)، p.dl (موعد؛ اگر تاریخ دستی بدهی یک موعد هم در بخش «موعدها» ساخته می‌شود تا هشدار بگیرد، p.dlAuto)،
   موعدهای مستقل و هدف‌های بلندمدتِ قدیمی همین‌جا فهرست می‌شوند و با یک دکمه «پروژه» می‌شوند (داده‌ی قبلی دست‌نخورده).
   اختیاری: کارت «پروژه‌ها» در «امروز» و «برنامه‌ی فردا» (db.mods.pj.today)، دکمه‌ی «به برنامه‌ی فردا». */
(function(){
const T=window.daniT;
const say=(m,b)=>{try{toast(m,b)}catch(e){}};
const PJ=()=>{const a=zmg('pj',()=>({v:'w',today:1}));zarr(a,'items');if(!['d','w','m'].includes(a.v))a.v='w';if(a.today===undefined)a.today=1;return a};
const H1=m=>fa(Math.round(m/6)/10);
const dlItem=id=>(zDL().items||[]).find(x=>x.id===id);
const due=p=>{if(p.dl){const d=dlItem(p.dl);if(d&&d.dt)return d.dt}return p.due||''};
const dDiff=(a,b)=>Math.round((P(b)-P(a))/864e5);
function monthRange(){const o=rng.p;try{rng.p='m';return rngDates()}finally{rng.p=o}}
function periodRange(v){const t=todayISO();if(v==='d')return[t,t];if(v==='w'){const w=weekStart(t);return[w,addD(w,6)]}return monthRange()}
const hit=(e,part)=>e.actId===part.a&&(!(part.s&&part.s.length)||part.s.includes(e.subId));
const parts=p=>(p.parts||[]).filter(x=>act(x.a));
function mins(p,a,b,part,sub){let s=0;(E(a,b)||[]).forEach(e=>{(part?[part]:parts(p)).forEach(x=>{if(hit(e,x)&&(sub===undefined||e.subId===sub))s+=e.min||0})});return s}
function stats(p,v){const t=todayISO(),from=p.from||t,d=due(p),bud=Math.round((+p.hrs||0)*60),spent=mins(p,from,t),rem=Math.max(0,bud-spent);
  const left=d?dDiff(t,d)+1:0,over=d&&left<=0;const before=mins(p,from,addD(t,-1)),perDay=bud&&left>0?Math.max(0,bud-before)/left:0;
  const[ra,rb]=periodRange(v);let tgt=0;if(bud&&left>0){const es=ra>t?ra:t,ee=d&&d<rb?d:rb,nd=es<=ee?dDiff(es,ee)+1:0;tgt=(ra<t?mins(p,ra,addD(t,-1)):0)+perDay*nd}
  const done=mins(p,ra,rb);let st='',col='#94a3b8';
  if(bud){if(spent>=bud){st=T('کامل شد','Complete');col='#10b981'}else if(over){st=T('موعد گذشته','Overdue');col='#ef4444'}
   else if(d){const tot=Math.max(1,dDiff(from,d)+1),el=Math.max(0,Math.min(tot,dDiff(from,t))),ex=bud*el/tot;if(spent>=ex*.95){st=T('طبق برنامه','On track');col='#10b981'}else{st=T('عقب‌تر ('+mm(ex-spent)+')','Behind ('+mm(ex-spent)+')');col='#f59e0b'}}}
  return{from,d,bud,spent,rem,left,over,perDay,tgt,done,st,col,ra,rb}}
const mm0=m=>{m=Math.round(m);const h=Math.floor(m/60),r=m%60;return(h?h+'h':'')+(r||!h?(h?' ':'')+r+'m':'')};
const bar=(a,b,c)=>'<div class="bar thin"><i style="width:'+Math.min(100,b?Math.round(a/b*100):0)+'%'+(c?';background:'+c:'')+'"></i></div>';
const PN={d:T('امروز','Today'),w:T('این هفته','This week'),m:T('این ماه','This month')};

/* ---------- عادت‌ها و یادآورهای پروژه ---------- */
const zHs=()=>{try{return zHB()}catch(e){return null}};
const hOf=p=>{const hs=zHs();return hs?(p.hb||[]).map(id=>hItems().find(h=>h.id===id&&!h.arch)).filter(Boolean):[]};
const rOf=p=>{try{const R=zRM();return (p.rm||[]).map(id=>R.items.find(r=>r.id===id&&!r.off)).filter(Boolean)}catch(e){return[]}};
function hrBlock(p){const t=todayISO(),log=((zHs()||{log:{}}).log||{})[t]||{},hb=hOf(p),rm=rOf(p);
  let h='<div class="dyp" style="display:block"><div class="row"><b style="flex:1">🔁 '+T('عادت‌های این پروژه','Habits for this project')+'</b><button class="chip" data-a="pj_hnew" data-p="'+esc(p.id)+'">＋ '+T('عادت','Habit')+'</button></div>'
   +(hb.length?hb.map(x=>{const d=log[x.id]&&log[x.id].s==='done';return'<div class="row" style="margin-top:3px"><button class="chip '+(d?'on':'')+'" data-a="pj_hb" data-h="'+esc(x.id)+'">'+(d?'✅':'⬜')+' '+esc(x.name)+'</button><span class="m" style="flex:1">'+(x.type==='days'?(x.days||[]).map(i=>zWD[i]).join(' '):T('هر روز','Every day'))+'</span><button class="chip" data-a="pj_hun" data-p="'+esc(p.id)+'" data-h="'+esc(x.id)+'" aria-label="unlink">✕</button></div>'}).join(''):'<div class="m">'+T('هنوز عادتی وصل نشده (مثلاً «۳۰ دقیقه مرور»).','No habit linked yet (e.g. “30 min review”).')+'</div>')+'</div>';
  h+='<div class="dyp" style="display:block"><div class="row"><b style="flex:1">🔔 '+T('یادآوری‌های این پروژه','Reminders for this project')+'</b><button class="chip" data-a="pj_rnew" data-p="'+esc(p.id)+'">＋ '+T('یادآوری','Reminder')+'</button></div>'
   +(rm.length?rm.map(x=>'<div class="row" style="margin-top:3px"><span style="flex:1;min-width:0">'+esc(x.title)+' <span class="m">'+(x.repeat==='none'?fmtD(x.date):(RREP[x.repeat]||''))+' · '+fa(x.time)+'</span></span><button class="chip" data-a="pj_run" data-p="'+esc(p.id)+'" data-r="'+esc(x.id)+'" aria-label="unlink">✕</button></div>').join(''):'<div class="m">'+T('بدون یادآوری.','No reminders.')+'</div>')+'</div>';
  return h}
const byId=id=>PJ().items.find(x=>x.id===id);
H.pj_hb=e=>{const t=todayISO(),L=zobj(zHB().log,t),id=e.dataset.h,cur=L[id]&&L[id].s;if(cur==='done'){const n=L[id].n;if(n)L[id]={s:'',n};else delete L[id]}else L[id]=Object.assign({},L[id],{s:'done'});if(!Object.keys(L).length)delete zHB().log[t];save();render()};
H.pj_hun=e=>{const p=byId(e.dataset.p);if(p){p.hb=(p.hb||[]).filter(x=>x!==e.dataset.h);save();render()}};
H.pj_run=e=>{const p=byId(e.dataset.p);if(p){p.rm=(p.rm||[]).filter(x=>x!==e.dataset.r);save();render()}};
let SUB=null;
H.pj_hnew=e=>{const p=byId(e.dataset.p);if(!p)return;SUB={k:'h',p:p.id};
  const ex=hItems().filter(x=>!x.arch&&!(p.hb||[]).includes(x.id));
  modal('<div class="c"><h3>'+T('عادت برای','Habit for')+' «'+esc(p.name)+'»</h3>'
   +(ex.length?'<label class="m">'+T('یک عادت موجود را وصل کن','Link an existing habit')+'</label><div class="row"><select id="sb-ex" style="flex:1;min-width:0"><option value="">—</option>'+ex.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.name)+'</option>').join('')+'</select><button class="chip" data-a="pj_hlink">'+T('وصل کن','Link')+'</button></div><p class="m">'+T('یا یکی تازه بساز:','or create a new one:')+'</p>':'')
   +'<input id="sb-n" placeholder="'+T('مثلاً ۳۰ دقیقه مرور جزوه','e.g. 30 min notes review')+'" style="width:100%"><div class="row" style="margin-top:6px"><select id="sb-t"><option value="daily">'+T('هر روز','Every day')+'</option><option value="days">'+T('روزهای انتخابی','Chosen days')+'</option></select></div>'
   +'<div class="row" style="margin:6px 0">'+WORDER.map(i=>'<label class="chip"><input type="checkbox" class="sb-d" value="'+i+'">'+zWD[i]+'</label>').join('')+'</div>'
   +'<label class="m">'+T('تاریخ شروع','Start date')+'</label>'+daniDF.html('sb-s',p.from||todayISO())
   +'<div class="row" style="margin-top:8px"><button class="on" data-a="pj_hsave">'+T('ذخیره','Save')+'</button><button data-a="cl">'+T('انصراف','Cancel')+'</button></div></div>')};
H.pj_hlink=()=>{const p=byId(SUB&&SUB.p),id=(document.getElementById('sb-ex')||{}).value;if(!p||!id)return;(p.hb=p.hb||[]).push(id);SUB=null;closeM();save();render()};
H.pj_hsave=()=>{const p=byId(SUB&&SUB.p);if(!p)return;const name=(document.getElementById('sb-n').value||'').trim().slice(0,60);if(!name)return say(T('نام عادت را بنویس','Type a habit name'),1);
  const type=document.getElementById('sb-t').value==='days'?'days':'daily',days=[...document.querySelectorAll('.sb-d')].filter(x=>x.checked).map(x=>+x.value);if(type==='days'&&!days.length)return say(T('حداقل یک روز را انتخاب کن','Pick at least one day'),1);
  const HB=zHB();if(HB.items.length>=100)return say(T('حداکثر ۱۰۰ عادت','Up to 100 habits'),1);const id='h'+uid();
  HB.items.push({id,name,type,days:type==='days'?days:[0,1,2,3,4,5,6],start:daniDF.get('sb-s')||todayISO(),color:zCOLORS[0],note:'',arch:false});(p.hb=p.hb||[]).push(id);SUB=null;closeM();save();render()};
H.pj_rnew=e=>{const p=byId(e.dataset.p);if(!p)return;SUB={k:'r',p:p.id};const ex=(()=>{try{return zRM().items.filter(r=>!r.off&&!(p.rm||[]).includes(r.id))}catch(x){return[]}})();
  modal('<div class="c"><h3>'+T('یادآوری برای','Reminder for')+' «'+esc(p.name)+'»</h3>'
   +(ex.length?'<label class="m">'+T('یک یادآوری موجود را وصل کن','Link an existing reminder')+'</label><div class="row"><select id="sb-ex" style="flex:1;min-width:0"><option value="">—</option>'+ex.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.title)+'</option>').join('')+'</select><button class="chip" data-a="pj_rlink">'+T('وصل کن','Link')+'</button></div><p class="m">'+T('یا یکی تازه بساز:','or create a new one:')+'</p>':'')
   +'<input id="sb-n" placeholder="'+T('مثلاً شروع درس ریاضی','e.g. Start maths')+'" style="width:100%"><label class="m">'+T('تاریخ','Date')+'</label>'+daniDF.html('sb-s',todayISO())
   +'<div class="row" style="margin-top:6px"><input id="sb-tm" type="time" value="18:00"><select id="sb-t">'+Object.keys(RREP).map(k=>'<option value="'+k+'">'+(k==='none'?T('بدون تکرار','No repeat'):k==='daily'?T('هر روز','Daily'):k==='weekly'?T('هفتگی','Weekly'):T('ماهانه','Monthly'))+'</option>').join('')+'</select></div>'
   +'<div class="row" style="margin:6px 0">'+WORDER.map(i=>'<label class="chip"><input type="checkbox" class="sb-d" value="'+i+'">'+zWD[i]+'</label>').join('')+'</div><p class="m">'+T('روزها فقط برای «هفتگی» به کار می‌رود.','Days apply to “Weekly” only.')+'</p>'
   +'<div class="row" style="margin-top:8px"><button class="on" data-a="pj_rsave">'+T('ذخیره','Save')+'</button><button data-a="cl">'+T('انصراف','Cancel')+'</button></div></div>')};
H.pj_rlink=()=>{const p=byId(SUB&&SUB.p),id=(document.getElementById('sb-ex')||{}).value;if(!p||!id)return;(p.rm=p.rm||[]).push(id);SUB=null;closeM();save();render()};
H.pj_rsave=()=>{const p=byId(SUB&&SUB.p);if(!p)return;const title=(document.getElementById('sb-n').value||'').trim().slice(0,80),date=daniDF.get('sb-s'),time=document.getElementById('sb-tm').value,repeat=document.getElementById('sb-t').value,days=[...document.querySelectorAll('.sb-d')].filter(x=>x.checked).map(x=>+x.value);
  if(!title)return say(T('عنوان را بنویس','Type a title'),1);if(!date||!mTime(time))return say(T('تاریخ و ساعت را درست وارد کن','Enter a valid date and time'),1);if(repeat==='weekly'&&!days.length)return say(T('برای هفتگی روز انتخاب کن','Pick days for weekly'),1);
  const R=zRM();if(R.items.length>=200)return say(T('حداکثر ۲۰۰ یادآوری','Up to 200 reminders'),1);const id='r'+uid();
  R.items.push({id,off:false,title,date,time,repeat,days:repeat==='weekly'?days:[],steps:[0,10],link:null});(p.rm=p.rm||[]).push(id);SUB=null;closeM();save();render()};

/* ---------- موعدهای مستقل و هدف‌های قدیمی: همین‌جا دیده می‌شوند ---------- */
function others(){const A=PJ(),used=new Set(A.items.map(p=>p.dl).filter(Boolean));
  const dl=(zDL().items||[]).filter(d=>!d.arch&&!d.done&&!used.has(d.id)),gl=(db.goals||[]).map((g,i)=>({g,i})).filter(x=>!x.g.pj);
  if(!dl.length&&!gl.length)return'';
  return'<details class="c" style="margin-top:10px"><summary style="cursor:pointer"><b>⏳ '+T('موعدها و هدف‌های بدون پروژه','Deadlines & goals without a project')+'</b> <span class="m">· '+fa(dl.length+gl.length)+'</span></summary><p class="m">'+T('این‌ها همان موعدها و هدف‌های قبلی‌اند، دست‌نخورده. با «پروژه‌اش کن» بخش، ساعت، عادت و یادآور هم می‌گیرند.','These are your earlier deadlines and goals, untouched. “Make it a project” adds parts, hours, habits and reminders.')+'</p>'
   +dl.map(d=>'<div class="dyp"><span style="flex:1;min-width:0">⏳ '+esc(d.title)+' <span class="m">'+fmtD(d.dt)+'</span></span><button class="chip" data-a="pj_fromdl" data-id="'+esc(d.id)+'">🎓 '+T('پروژه‌اش کن','Make it a project')+'</button></div>').join('')
   +gl.map(x=>'<div class="dyp"><span style="flex:1;min-width:0">🏁 '+esc(x.g.t)+' <span class="m">'+(x.g.due?fmtD(x.g.due):'')+'</span></span><button class="chip" data-a="pj_fromgl" data-i="'+x.i+'">🎓 '+T('پروژه‌اش کن','Make it a project')+'</button></div>').join('')+'</details>'}
H.pj_fromdl=e=>{const d=(zDL().items||[]).find(x=>x.id===e.dataset.id);if(!d)return;const p={id:'p'+uid(),cr:Date.now(),arch:0,name:d.title.slice(0,80),dl:d.id,due:'',hrs:0,from:todayISO(),parts:[],hb:[],rm:[]};PJ().items.push(p);save();ED=freshED(p);open()};
H.pj_fromgl=e=>{const g=(db.goals||[])[+e.dataset.i];if(!g)return;const parts=g.actId&&act(g.actId)?[{id:uid(),a:g.actId,s:[],hrs:0}]:[];const p={id:'p'+uid(),cr:Date.now(),arch:0,name:String(g.t).slice(0,80),dl:'',due:g.due||'',hrs:0,from:todayISO(),parts,hb:[],rm:[]};g.pj=p.id;PJ().items.push(p);save();ED=freshED(p);open()};

/* ---------- موتور پیش‌بینی: با این آهنگ کی تمام می‌شود؟ ---------- */
const nf1=x=>fa(Math.round(x*10)/10);
const paceW=p=>{let w=+p.wk||0;if(!w)w=(p.parts||[]).reduce((a,x)=>a+(+x.wk||0),0);return w};
function fcast(p){const t=todayISO(),s=stats(p,'d'),d=s.d,left=d?Math.max(0,dDiff(t,d)):null,w=paceW(p),src=w>0?'plan':'actual';
  const pace=w>0?w*60/7:mins(p,addD(t,-13),t)/14,bud=s.bud,rem=s.rem;
  const o={s,pace,src,perDay:pace,perWeek:pace*7,perMonth:pace*30,left,due:d,bud,rem,spent:s.spent};
  if(bud){if(rem<=0)o.done=true;else if(pace>0){o.days=Math.ceil(rem/pace);o.finish=addD(t,o.days)}}
  if(left!==null&&pace>0)o.total=pace*left;
  if(o.finish&&left!==null)o.margin=left-o.days;
  if(left!==null&&bud&&rem>0&&left>0)o.need=rem/left;
  o.status=o.done?'done':!bud?(left!==null?'nobud':'free'):!(pace>0)?'nopace':left===null?'open':o.margin>=0?'early':'late';
  return o}
function fcVerdict(f){const hh=m=>nf1(m/60)+T(' ساعت',' h');let x='';
  if(f.status==='done')x='🎉 '+T('به هدف ساعتی رسیده‌ای.','You have reached the hour goal.');
  else if(f.status==='early')x='✅ '+T('با این آهنگ تا <b>'+fmtD(f.finish)+'</b> تمام می‌شود'+(f.margin>0?'، '+fa(f.margin)+' روز زودتر از موعد.':'، درست روز موعد.'),'At this pace you finish on <b>'+fmtD(f.finish)+'</b>'+(f.margin>0?', '+f.margin+' days before the deadline.':', right on the deadline.'));
  else if(f.status==='late')x='⚠ '+T('با این آهنگ '+fmtD(f.finish)+' تمام می‌شود، '+fa(-f.margin)+' روز دیرتر از موعد.'+(f.need?' برای رسیدن به موعد روزی <b>'+hh(f.need)+'</b> لازم است.':''),'At this pace you finish on '+fmtD(f.finish)+', '+(-f.margin)+' days after the deadline.'+(f.need?' To make it you need <b>'+hh(f.need)+'</b> per day.':''));
  else if(f.status==='open')x='🏁 '+T('با این آهنگ تا <b>'+fmtD(f.finish)+'</b> ('+fa(f.days)+' روز دیگر) تمام می‌شود.','At this pace you finish on <b>'+fmtD(f.finish)+'</b> ('+f.days+' days from now).');
  else if(f.status==='nobud')x='📅 '+T('تا موعد با این آهنگ جمعاً <b>'+hh(f.total||0)+'</b>؛ برای تاریخ پایان، بودجه‌ی ساعت بگذار.','Until the deadline you get <b>'+hh(f.total||0)+'</b> at this pace; add an hour budget for a finish date.');
  else if(f.status==='nopace')x='✍ '+T('ساعت روزانه یا هفتگی را بنویس تا تاریخ پایان حساب شود.','Type daily or weekly hours to see the finish date.');
  if(x&&f.src==='actual'&&f.pace>0)x+=' <span class="m">('+T('بر پایه‌ی سرعت واقعی ۱۴ روز اخیر','based on your real pace of the last 14 days')+')</span>';
  return x}
window.daniFcast=fcast;window.daniFcVerdict=fcVerdict;
const fcCol={done:'#10b981',early:'#10b981',late:'#ef4444',open:'#3b82f6',nobud:'#3b82f6',nopace:'#94a3b8',free:'#94a3b8'};
function fcHTML(p){const f=fcast(p),col=fcCol[f.status]||'#94a3b8',pct=f.bud?Math.min(100,Math.round(f.spent/f.bud*100)):0,R=24,C=Math.round(2*Math.PI*R*10)/10;
  const w=paceW(p),dpw=+p.dpw||7,pd=+p.pd||(w?Math.round(w/dpw*10)/10:'');
  let tl='';if(f.pace>0&&(f.finish||f.due)){const end=Math.max(f.due&&f.left!==null?f.left:0,f.days||0,1),pf=f.days?Math.min(100,f.days/end*100):0,pdue=f.left!==null?Math.min(100,f.left/end*100):0;
    tl='<div class="fct"><i class="fcg" style="width:'+pf+'%;background:'+col+'"></i>'+(f.finish?'<b class="fcm" style="inset-inline-start:'+pf+'%" title="'+esc(fmtD(f.finish))+'">🏁</b>':'')+(f.due?'<b class="fcm" style="inset-inline-start:'+pdue+'%" title="'+esc(fmtD(f.due))+'">⏳</b>':'')+'</div>'
     +'<div class="row m" style="justify-content:space-between"><span>'+T('امروز','Today')+'</span>'+(f.finish?'<span>🏁 '+fmtD(f.finish)+'</span>':'')+(f.due?'<span>⏳ '+fmtD(f.due)+'</span>':'')+'</div>'}
  const tile=(a,b)=>'<div class="fck"><b>'+a+'</b><small>'+b+'</small></div>';
  return'<div class="fcb" style="--fc:'+col+'">'
   +'<div class="row" style="flex-wrap:nowrap;gap:10px;align-items:center"><svg class="fcr" width="60" height="60" viewBox="0 0 60 60" style="--c:'+C+'"><circle cx="30" cy="30" r="'+R+'" fill="none" stroke="currentColor" opacity=".13" stroke-width="6"/><circle cx="30" cy="30" r="'+R+'" fill="none" stroke="'+col+'" stroke-width="6" stroke-linecap="round" stroke-dasharray="'+C+'" stroke-dashoffset="'+Math.round(C*(1-pct/100)*10)/10+'" transform="rotate(-90 30 30)"/><text x="30" y="34" text-anchor="middle" font-size="13" fill="currentColor" font-weight="700">'+fa(pct)+'٪</text></svg>'
   +'<div style="flex:1;min-width:0;line-height:1.6">'+(fcVerdict(f)||'<span class="m">'+T('بودجه و آهنگ بگذار تا پیش‌بینی بیاید.','Set a budget and a pace to see the forecast.')+'</span>')+'</div></div>'
   +tl
   +'<div class="fck4">'+tile(nf1(f.perDay/60),T('ساعت/روز','h/day'))+tile(nf1(f.perWeek/60),T('ساعت/هفته','h/week'))+tile(nf1(f.perMonth/60),T('ساعت/ماه','h/month'))+(f.total!=null?tile(nf1(f.total/60),T('تا موعد','to deadline')):f.bud?tile(nf1(f.rem/60),T('مانده','left')):'')+'</div>'
   +'<div class="row" style="gap:6px;align-items:center;margin-top:6px"><span class="m">'+T('اگر روزی','If each day')+'</span><input type="number" min="0" step="0.5" value="'+pd+'" data-fc="pd" data-p="'+esc(p.id)+'" style="width:64px"><span class="m">'+T('ساعت، در','h on')+'</span><input type="number" min="1" max="7" step="1" value="'+dpw+'" data-fc="dpw" data-p="'+esc(p.id)+'" style="width:52px"><span class="m">'+T('روز هفته','days a week')+'</span></div></div>'}
function partFc(p,x){const t=todayISO(),xw=+x.wk||0,xb=Math.round((+x.hrs||0)*60),sp=mins(p,p.from||t,t,x),rem=Math.max(0,xb-sp);let fin='';
  if(xb&&xw>0){if(rem<=0)fin='🎉';else{const dd=Math.ceil(rem/(xw*60/7)),dt=addD(t,dd),d=due(p);fin='🏁 '+fmtD(dt)+(d?(dt<=d?' ✅':' ⚠'):'')}}
  return'<div class="row" style="gap:6px;align-items:center;margin-top:4px"><span class="m">'+T('آهنگ','Pace')+'</span><input type="number" min="0" step="0.5" value="'+(xw||'')+'" data-fcx="'+esc(x.id)+'" data-p="'+esc(p.id)+'" style="width:60px"><span class="m">'+T('ساعت/هفته','h/week')+'</span><span style="flex:1"></span><b class="m">'+fin+'</b></div>'}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset)return;const d=t.dataset;if(!d.fc&&!d.fcx)return;const p=PJ().items.find(q=>q.id===d.p);if(!p)return;const v=Math.max(0,+t.value||0);
  if(d.fc==='pd'){p.pd=v;p.dpw=+p.dpw||7;p.wk=Math.round(v*p.dpw*10)/10}else if(d.fc==='dpw'){p.dpw=Math.max(1,Math.min(7,Math.round(v)||7));const w=paceW(p);p.pd=+p.pd||(w?w/7:0);p.wk=Math.round(p.pd*p.dpw*10)/10}
  else{const x=(p.parts||[]).find(q=>q.id===d.fcx);if(x){x.wk=v;if(!(+p.pd>0)){const sw=(p.parts||[]).reduce((a,q)=>a+(+q.wk||0),0);p.wk=sw}}}
  save();render()});
function fcList(){const L=PJ().items.filter(p=>!p.arch&&(due(p)||+p.hrs>0));if(!L.length)return'';
  return'<div class="c">'+daniH('🏁','پیش‌بینی پروژه‌ها','Project forecast')+L.map(p=>'<div style="margin:6px 0"><b>'+esc(p.name)+'</b><div class="m">'+(fcVerdict(fcast(p))||'')+'</div></div>').join('')+'</div>'}
window.daniFcList=fcList;

window.daniFcLine=p=>{try{return fcVerdict(fcast(p))}catch(e){return''}};
window.daniFcForDl=id=>{try{const p=PJ().items.find(q=>!q.arch&&q.dl===id);return p?fcVerdict(fcast(p)):''}catch(e){return''}};
window.daniFcFinishOn=d=>{try{return PJ().items.filter(p=>!p.arch).filter(p=>{const f=fcast(p);return f.finish===d}).map(p=>p.name)}catch(e){return[]}};
{const _dl=PG.dl;if(_dl)PG.dl=function(){const h=_dl.apply(this,arguments);try{return typeof h==='string'?fcList()+h:h}catch(e){return h}}}
try{const st=document.createElement('style');st.textContent='.fcb{border:1px solid color-mix(in srgb,var(--fc) 35%,transparent);background:color-mix(in srgb,var(--fc) 7%,transparent);border-radius:14px;padding:10px;margin:8px 0}.fcr circle:last-of-type{animation:fcring .9s ease-out}@keyframes fcring{from{stroke-dashoffset:var(--c)}}.fct{position:relative;height:8px;border-radius:6px;background:var(--b,#8883);margin:12px 0 4px}.fcg{position:absolute;inset-block:0;inset-inline-start:0;border-radius:6px;animation:fcgrow 1s ease-out}@keyframes fcgrow{from{width:0}}.fcm{position:absolute;top:-9px;transform:translateX(-50%);font-size:13px;font-weight:400;animation:fcpop .6s .5s both}@keyframes fcpop{from{opacity:0;transform:translateX(-50%) scale(.2)}}.fck4{display:grid;grid-template-columns:repeat(auto-fit,minmax(70px,1fr));gap:6px;margin-top:8px}.fck{text-align:center;border-radius:10px;background:var(--b,#8881);padding:6px 2px}.fck b{display:block;font-size:1.1em}.fck small{opacity:.75;font-size:.72em}@media (prefers-reduced-motion:reduce){.fcr circle,.fcg,.fcm{animation:none!important}}';document.head.appendChild(st)}catch(e){}
/* ---------- صفحه ---------- */
function projCard(p,v){const s=stats(p,v),ps=parts(p);
  let h='<div class="c pjc" style="margin-top:10px"><div class="row"><b style="flex:1;min-width:0">'+esc(p.name)+'</b>'+(s.st?'<span class="chip on" style="background:'+s.col+'22;color:'+s.col+'">'+s.st+'</span>':'')+'</div>';
  h+='<div class="m">'+(s.d?T('موعد','Due')+' '+fmtD(s.d)+' · '+(s.over?T('گذشته','past'):T(fa(s.left)+' روز مانده',s.left+' days left')):T('بدون موعد','No deadline'))+(s.bud?' · '+T('بودجه','Budget')+' '+H1(s.bud)+' '+T('ساعت','h'):'')+'</div>';
  if(s.bud)h+=bar(s.spent,s.bud,s.col)+'<div class="m">'+T('انجام‌شده','Done')+' '+mm(s.spent)+' '+T('از','of')+' '+mm(s.bud)+' · '+T('مانده','left')+' '+mm(s.rem)+(s.perDay&&!s.over?' · '+T('آهنگ لازم','pace')+' '+mm(s.perDay)+'/'+T('روز','day'):'')+'</div>';
  else h+='<div class="m">'+T('جمع ثبت‌شده','Logged')+' '+mm(s.spent)+' · '+T('برای نمایش آهنگ، بودجه‌ی ساعت بگذار.','set an hour budget to see the pace.')+'</div>';
  h+='<div class="dyex">'+PN[v]+': '+(s.bud?T('لازم','target')+' <b>'+mm(s.tgt)+'</b> · ':'')+T('انجام','done')+' <b>'+mm(s.done)+'</b>'+(s.bud&&s.tgt?bar(s.done,s.tgt,'#3b82f6'):'')+'</div>';
  h+=fcHTML(p);
  ps.forEach(x=>{const a=act(x.a),tot=mins(p,s.from,todayISO(),x),per=mins(p,s.ra,s.rb,x),bh=Math.round((+x.hrs||0)*60),subs=(a.subs||[]).filter(q=>!(x.s&&x.s.length)||x.s.includes(q.id));
    h+='<div class="dyp" style="display:block"><div class="row"><span style="width:10px;height:10px;border-radius:50%;background:'+esc(a.color||'#3b82f6')+'"></span><b style="flex:1;min-width:0">'+esc(a.name)+'</b><button class="chip" data-a="pj_add" data-p="'+esc(p.id)+'" data-x="'+esc(x.id)+'" title="'+T('به برنامه‌ی فردا','To tomorrow’s plan')+'">＋ '+T('فردا','Tomorrow')+'</button></div>'
     +'<div class="m">'+PN[v]+' '+mm(per)+' · '+T('کل','total')+' '+mm(tot)+(bh?' / '+mm(bh):'')+'</div>'+(bh?bar(tot,bh,a.color):'')+partFc(p,x)
     +(subs.length?'<div class="m" style="margin-top:2px">'+subs.map(q=>{const t1=mins(p,s.from,todayISO(),x,q.id);return esc(q.name)+' '+(t1?mm(t1):'—')}).join(' · ')+'</div>':'')+'</div>'});
  h+=hrBlock(p);
  if(!ps.length)h+='<p class="m">'+T('هنوز بخشی نداری؛ «ویرایش» را بزن و بخش اضافه کن.','No parts yet — tap Edit and add one.')+'</p>';
  h+='<div class="row" style="margin-top:6px"><button class="chip" data-a="pj_ed" data-p="'+esc(p.id)+'">✏️ '+T('ویرایش','Edit')+'</button><button class="chip" data-a="pj_arch" data-p="'+esc(p.id)+'">'+(p.arch?'↩ '+T('بازگردانی','Restore'):'🗄 '+T('بایگانی','Archive'))+'</button></div></div>';return h}
function pjCards(v,arch){const it=PJ().items.filter(p=>!!p.arch===!!arch);return it.map(p=>projCard(p,v)).join('')}
PG.pj=function(){const A=PJ(),v=A.v;
  let h='<div class="c">'+daniH('🎓','پروژه‌ها، موعدها و اهداف','Projects, deadlines & goals')+'<p class="m">'+T('پروژه = هدف بزرگ (MBA، ورزش، کار) با بخش‌ها و نوع کار. موعد، بودجه‌ی ساعت، عادت و یادآور اختیاری‌اند؛ ثبت زمان خودکار به پروژه می‌رود.','A project is a big goal (MBA, sport, job) with parts and work types. Deadline, hour budget, habits and reminders are optional; logged time counts automatically.')+'</p>'
   +'<div class="row"><button class="chip" data-a="dy_go" data-p="dash" data-d="acts">🎯 '+T('فعالیت‌ها و برچسب‌ها','Activities & tags')+'</button></div>'
   +'<div class="row">'+['d','w','m'].map(k=>'<button class="chip '+(v===k?'on':'')+'" data-a="pj_v" data-v="'+k+'">'+PN[k]+'</button>').join('')+'<span style="flex:1"></span><button class="chip on" data-a="pj_ed" data-p="">＋ '+T('پروژه‌ی جدید','New project')+'</button></div></div>';
  const cur=pjCards(v,false);h+=cur||'<div class="c" style="margin-top:10px"><p class="m">'+T('هنوز پروژه‌ای نداری. «پروژه‌ی جدید» را بزن؛ نام، موعد و بودجه‌ی ساعت را بگذار و بخش‌ها را از فعالیت‌هایت انتخاب کن.','No projects yet. Tap “New project”, set a name, deadline and hour budget and pick parts from your activities.')+'</p></div>';
  h+=others();
  const ar=PJ().items.filter(p=>p.arch).length;if(ar)h+='<details style="margin-top:10px"><summary class="m" style="cursor:pointer">🗄 '+T('بایگانی','Archive')+' · '+fa(ar)+'</summary>'+pjCards(v,true)+'</details>';
  h+='<div class="c" style="margin-top:10px"><label class="row" style="gap:8px"><input type="checkbox" data-a="pj_td" '+(A.today?'checked':'')+'> '+T('نمایش کارت پروژه‌ها در «امروز» و «برنامه‌ی فردا»','Show the Projects card on Today and Tomorrow')+'</label></div>';
  return h};
H.pj_v=e=>{PJ().v=e.dataset.v;save();render()};
H.pj_td=e=>{PJ().today=e.checked?1:0;save();render()};
H.pj_arch=e=>{const p=PJ().items.find(x=>x.id===e.dataset.p);if(!p)return;p.arch=p.arch?0:1;save();render()};
H.pj_add=e=>{const p=PJ().items.find(x=>x.id===e.dataset.p);if(!p)return;const x=(p.parts||[]).find(q=>q.id===e.dataset.x);if(!x||!window.daniPlanAdd)return;
  const s=stats(p,'d'),n=Math.max(1,parts(p).length),min=Math.max(15,Math.round((s.perDay?s.perDay/n:(act(x.a).goalDay||45))/5)*5);
  window.daniPlanAdd(window.daniTmrState?window.daniTmrState.tmrDate():addD(todayISO(),1),x.a,(x.s&&x.s.length===1)?x.s[0]:'',min)};

/* ---------- ویرایشگر ---------- */
let ED=null;
const freshED=p=>p?{id:p.id,name:p.name,dl:p.dlAuto?'':(p.dl||''),due:p.dlAuto?due(p):(p.due||''),hrs:p.hrs||'',from:p.from||todayISO(),parts:JSON.parse(JSON.stringify(p.parts||[]))}:{id:'',name:'',dl:'',due:'',hrs:'',from:todayISO(),parts:[]};
function pull(){if(!ED)return;const g=i=>{const el=document.getElementById(i);return el?el.value:null};
  const n=g('pj-n');if(n!==null)ED.name=n;const dl=g('pj-dl');if(dl!==null)ED.dl=dl;if(document.getElementById('pj-du'))ED.due=daniDF.get('pj-du');const hr=g('pj-h');if(hr!==null)ED.hrs=hr;if(document.getElementById('pj-f'))ED.from=daniDF.get('pj-f')||ED.from;
  ED.parts.forEach(x=>{const el=document.getElementById('pj-ph-'+x.id);if(el)x.hrs=el.value})}
function edHTML(){const dls=(zDL().items||[]).filter(d=>!d.arch&&!d.done);
  let h='<div class="c"><h3>'+(ED.id?T('ویرایش پروژه','Edit project'):T('پروژه‌ی جدید','New project'))+'</h3>'
   +'<label class="m">'+T('نام پروژه','Project name')+'</label><input id="pj-n" value="'+esc(ED.name)+'" placeholder="'+T('مثلاً آزمون MBA','e.g. MBA exam')+'" style="width:100%">'
   +'<label class="m">'+T('موعد','Deadline')+'</label><select id="pj-dl" style="width:100%"><option value="">'+T('تاریخ دستی (پایین)','Manual date (below)')+'</option>'+dls.map(d=>'<option value="'+esc(d.id)+'" '+(ED.dl===d.id?'selected':'')+'>'+esc(d.title)+' · '+fmtD(d.dt)+'</option>').join('')+'</select>'
   +'<label class="m">'+T('تاریخ موعد (اگر موعد بالا انتخاب نشده)','Due date (if no deadline picked above)')+'</label>'+daniDF.html('pj-du',ED.due)+''
   +'<label class="m">'+T('بودجه‌ی ساعت (کل پروژه)','Hour budget (whole project)')+'</label><input id="pj-h" type="number" min="0" step="0.5" value="'+esc(ED.hrs)+'" style="width:100%">'
   +'<label class="m">'+T('شمارش از تاریخ','Count from')+'</label>'+daniDF.html('pj-f',ED.from)
   +'<p class="m">'+T('«شمارش از» یعنی کارهای ثبت‌شده از این روز به بعد به پروژه حساب شوند.','“Count from” = work logged from this day on counts toward the project.')+'</p></div>';
  h+='<div class="c" style="margin-top:8px">'+daniH('🧩','بخش‌ها و نوع کار','Parts & work types')+ED.parts.map(x=>{const a=act(x.a);if(!a)return'';
    return'<div class="dyp" style="display:block"><div class="row"><b style="flex:1">'+esc(a.name)+'</b><input id="pj-ph-'+esc(x.id)+'" type="number" min="0" step="0.5" value="'+esc(x.hrs||'')+'" placeholder="'+T('ساعت','hours')+'" style="width:80px"><button class="chip" data-a="pj_pd" data-x="'+esc(x.id)+'">🗑</button></div>'
     +'<div class="row" style="margin-top:4px"><button class="chip '+(!(x.s&&x.s.length)?'on':'')+'" data-a="pj_ta" data-x="'+esc(x.id)+'">'+T('همه‌ی نوع‌ها','All types')+'</button>'+(a.subs||[]).map(q=>'<button class="chip '+((x.s||[]).includes(q.id)?'on':'')+'" data-a="pj_ts" data-x="'+esc(x.id)+'" data-s="'+esc(q.id)+'">'+esc(q.name)+'</button>').join('')+'</div>'
     +'<div class="row" style="margin-top:4px"><input id="pj-nt-'+esc(x.id)+'" placeholder="'+T('نوع کار تازه (مثلاً مرور جزوه)','New type (e.g. notes review)')+'" style="flex:1"><button class="chip" data-a="pj_nt" data-x="'+esc(x.id)+'">＋</button></div></div>'}).join('')
   +'<div class="row" style="margin-top:8px"><select id="pj-na" style="flex:1;min-width:0"><option value="">'+T('افزودن بخش: یک فعالیت انتخاب کن','Add part: pick an activity')+'</option>'+db.acts.filter(a=>a.active&&!a.arch&&a.cat!=='sleep').map(a=>'<option value="'+esc(a.id)+'">'+esc(a.name)+'</option>').join('')+'<option value="+">➕ '+T('فعالیت تازه (نام در کادر پایین)','New activity (name below)')+'</option></select></div>'
   +'<div class="row" style="margin-top:4px"><input id="pj-nn" placeholder="'+T('نام فعالیت/بخش تازه (مثلاً ریاضی MBA)','New activity/part name (e.g. MBA maths)')+'" style="flex:1"><button class="chip on" data-a="pj_pa">＋ '+T('بخش','Part')+'</button></div>'
   +'<p class="m">'+T('بخش = یک فعالیت. نوع‌ها = زیرمجموعه‌های همان فعالیت. «همه‌ی نوع‌ها» یعنی هر ثبتی با آن فعالیت.','Part = an activity; types = that activity’s sub-items. “All types” = any entry of that activity.')+'</p></div>'
   +'<div class="row" style="margin-top:8px"><button class="on" data-a="pj_save">'+T('ذخیره','Save')+'</button><button data-a="cl">'+T('انصراف','Cancel')+'</button>'+(ED.id?'<span style="flex:1"></span><button class="d" data-a="pj_del">🗑 '+T('حذف پروژه','Delete project')+'</button>':'')+'</div>';
  return h}
const open=()=>{modal(edHTML())};
H.pj_ed=e=>{const p=PJ().items.find(x=>x.id===e.dataset.p);ED=freshED(p);open()};
H.pj_pa=()=>{pull();let id=document.getElementById('pj-na').value;const nn=(document.getElementById('pj-nn').value||'').trim();
  if(id==='+'||(!id&&nn)){if(!nn)return say(T('نام فعالیت تازه را بنویس','Type the new activity name'),1);let a=db.acts.find(x=>x.name===nn);if(!a){a={id:uid(),name:nn,cat:'learn',color:(CATS.learn&&CATS.learn[1])||'#3b82f6',tags:[],prio:'',goalDay:0,goalWeek:0,subs:[],desc:'',active:true,arch:false,days:[]};db.acts.push(a)}id=a.id}
  if(!id)return say(T('یک فعالیت انتخاب کن','Pick an activity'),1);if(ED.parts.some(x=>x.a===id))return say(T('این بخش قبلاً اضافه شده','Already added'),1);
  ED.parts.push({id:uid(),a:id,s:[],hrs:''});save();open()};
H.pj_pd=e=>{pull();ED.parts=ED.parts.filter(x=>x.id!==e.dataset.x);open()};
H.pj_ta=e=>{pull();const x=ED.parts.find(q=>q.id===e.dataset.x);if(x)x.s=[];open()};
H.pj_ts=e=>{pull();const x=ED.parts.find(q=>q.id===e.dataset.x);if(!x)return;x.s=x.s||[];const i=x.s.indexOf(e.dataset.s);if(i>=0)x.s.splice(i,1);else x.s.push(e.dataset.s);open()};
H.pj_nt=e=>{pull();const x=ED.parts.find(q=>q.id===e.dataset.x),a=x&&act(x.a),el=document.getElementById('pj-nt-'+e.dataset.x),n=el?el.value.trim():'';if(!a||!n)return;
  let s=(a.subs||[]).find(q=>q.name===n);if(!s){s={id:uid(),name:n,goal:0};(a.subs=a.subs||[]).push(s)}if(x.s&&x.s.length&&!x.s.includes(s.id))x.s.push(s.id);save();open()};
H.pj_save=()=>{pull();const n=(ED.name||'').trim();if(!n)return say(T('نام پروژه را بنویس','Type a project name'),1);
  const o={name:n.slice(0,80),dl:ED.dl||'',due:ED.dl?'':(ED.due||''),hrs:+ED.hrs>0?+ED.hrs:0,from:ED.from||todayISO(),parts:ED.parts.map(x=>{const pv=((ED.id&&PJ().items.find(q=>q.id===ED.id))||{parts:[]}).parts.find(q=>q.id===x.id);return{id:x.id,a:x.a,s:(x.s||[]).slice(),hrs:+x.hrs>0?+x.hrs:0,wk:+((pv&&pv.wk)||0)}})};
  const A=PJ();
  /* تاریخ دستی ← یک موعد در بخش «موعدها» هم ساخته/به‌روز می‌شود تا هشدار بگیرد */
  const prev=ED.id?A.items.find(x=>x.id===ED.id):null;
  try{const D=zDL();if(!ED.dl&&o.due){let it=prev&&prev.dlAuto&&prev.dl&&D.items.find(x=>x.id===prev.dl);
      if(it){it.title=o.name;it.dt=o.due}else{it={id:'d'+uid(),title:o.name,cat:'custom',imp:2,dt:o.due,tm:'09:00',note:'',cr:Date.now(),done:false,arch:false,al:[1440,60]};D.items.push(it)}
      o.dl=it.id;o.dlAuto=1;o.due=''}
    else if(!ED.dl&&!o.due&&prev&&prev.dlAuto)o.dlAuto=0}catch(e){console.error('pj dl',e)}
  if(ED.id){const p=A.items.find(x=>x.id===ED.id);if(p)Object.assign(p,o)}else{if(A.items.length>=100)return say(T('حداکثر ۱۰۰ پروژه','Up to 100 projects'),1);A.items.push(Object.assign({id:'p'+uid(),cr:Date.now(),arch:0},o))}
  ED=null;closeM();save();render()};
H.pj_del=()=>{if(!ED||!ED.id)return;if(!confirm(T('این پروژه حذف شود؟ (ثبت‌های زمان و فعالیت‌ها دست‌نخورده می‌مانند)','Delete this project? (Logged time and activities are untouched)')))return;
  const A=PJ();A.items=A.items.filter(x=>x.id!==ED.id);ED=null;closeM();save();render()};

/* ---------- کارت کوچک در «امروز» و «برنامه‌ی فردا» ---------- */
function mini(date,title){const A=PJ();if(!A.today)return'';const it=A.items.filter(p=>!p.arch&&parts(p).length).map(p=>({p,s:stats(p,'d')})).filter(x=>x.s.bud&&!x.s.over&&x.s.rem>0||x.s.d&&!x.s.over&&!x.s.bud);if(!it.length)return'';
  it.sort((a,b)=>(a.s.d||'9')<(b.s.d||'9')?-1:1);
  return'<div class="c dyc" id="pjmini">'+daniH('🎓',title[0],title[1])+it.slice(0,4).map(x=>{const s=x.s;return'<div class="dyp" style="display:block"><div class="row"><b style="flex:1;min-width:0">'+esc(x.p.name)+'</b><span class="m">'+(s.d?T(fa(s.left)+' روز','d'+s.left)+' · ':'')+(s.bud?T('لازم امروز','need today')+' '+mm(s.perDay)+' · ':'')+T('انجام','done')+' '+mm(mins(x.p,todayISO(),todayISO()))+'</span></div>'+(s.bud?bar(mins(x.p,todayISO(),todayISO()),s.perDay||1,'#3b82f6'):'')+(function(){const v=fcVerdict(fcast(x.p));return v?'<div class="m">'+v+'</div>':''})()+'</div>'}).join('')
   +'<button class="chip" data-a="dy_go" data-p="pj">🎓 '+T('همه‌ی پروژه‌ها','All projects')+'</button></div>'}
{const _d=PG.day;if(_d)PG.day=function(){const h=_d.apply(this,arguments);try{return typeof h==='string'?h+mini(todayISO(),['پروژه‌ها (امروز)','Projects (today)']):h}catch(e){return h}}}
{const _t=PG.tmr;if(_t)PG.tmr=function(){const h=_t.apply(this,arguments);try{return typeof h==='string'?h+mini(addD(todayISO(),1),['پروژه‌ها (آهنگ لازم)','Projects (needed pace)']):h}catch(e){return h}}}

/* ---------- منو ---------- */
try{Object.assign(ICONS,{pj:'<path d="M3 7h18v12H3z"/><path d="M9 7V5h6v2M3 12h18"/>'});BI_NAV.pj=['Projects','پروژه‌ها'];EXT_PAGES.add('pj')}catch(e){}
{const _s=syncNav;syncNav=function(){_s.apply(this,arguments);try{if(!NAV.some(n=>n[0]==='pj')&&(db.set.nv||{}).mode==='classic'){const i=NAV.findIndex(n=>n[0]==='dl'||n[0]==='cm');NAV.splice(i>=0?i+1:NAV.length,0,['pj','پروژه‌ها'])}}catch(e){}}}
{const _m=PG.mx;if(_m)PG.mx=function(){const h=_m.apply(this,arguments);return typeof h==='string'?h+'<div class="c">'+daniH('🎓','پروژه‌ها','Projects')+'<button class="chip on" data-a="dy_go" data-p="pj" style="margin:3px">🎓 '+T('پروژه‌ها (بخش، نوع کار، موعد)','Projects (parts, work types, deadlines)')+'</button></div>':h}}
window.daniProjects={stats:p=>stats(p,'d'),list:()=>PJ().items.slice()};
})();
