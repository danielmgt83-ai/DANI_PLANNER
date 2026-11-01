"use strict";
/* DANI · projects.js — «پروژه‌ها» (مرحله‌ی ب): پروژه ← بخش ← نوع کار، با موعد و بودجه‌ی ساعت.
   مثال: «آزمون MBA» (موعد، ۲۰۰ ساعت) ← بخش‌ها «ریاضی / انگلیسی / GMAT» ← نوع‌ها «تمرین / مرور جزوه / فیلم».
   هیچ داده‌ی جدیدی روی ثبت‌ها نمی‌نشیند: هر بخش به یک «فعالیت» وصل است و نوع‌ها همان «زیرمجموعه‌ی فعالیت»اند،
   پس همه‌ی ثبت‌های قبلی و آینده خودکار حساب می‌شوند (کرنومتر، ثبت سریع، برنامه‌ی فردا، CSV…). یک فعالیت می‌تواند در چند پروژه باشد.
   داده: db.mods.pj {items:[{id,name,dl,due,hrs,from,arch,parts:[{id,a,s:[زیرمجموعه‌ها؛ خالی=همه],hrs}]}], today:1, v:'d|w|m'}
   موعد: یا یکی از موعدهای بخش «موعدها» (p.dl) یا تاریخ دستی (p.due).
   نمایش: امروز / این هفته / این ماه؛ هدفِ دوره = آهنگ لازم (ساعتِ مانده ÷ روزِ مانده) و «انجام‌شده» از ثبت‌ها.
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

/* ---------- صفحه ---------- */
function projCard(p,v){const s=stats(p,v),ps=parts(p);
  let h='<div class="c pjc" style="margin-top:10px"><div class="row"><b style="flex:1;min-width:0">'+esc(p.name)+'</b>'+(s.st?'<span class="chip on" style="background:'+s.col+'22;color:'+s.col+'">'+s.st+'</span>':'')+'</div>';
  h+='<div class="m">'+(s.d?T('موعد','Due')+' '+fmtD(s.d)+' · '+(s.over?T('گذشته','past'):T(fa(s.left)+' روز مانده',s.left+' days left')):T('بدون موعد','No deadline'))+(s.bud?' · '+T('بودجه','Budget')+' '+H1(s.bud)+' '+T('ساعت','h'):'')+'</div>';
  if(s.bud)h+=bar(s.spent,s.bud,s.col)+'<div class="m">'+T('انجام‌شده','Done')+' '+mm(s.spent)+' '+T('از','of')+' '+mm(s.bud)+' · '+T('مانده','left')+' '+mm(s.rem)+(s.perDay&&!s.over?' · '+T('آهنگ لازم','pace')+' '+mm(s.perDay)+'/'+T('روز','day'):'')+'</div>';
  else h+='<div class="m">'+T('جمع ثبت‌شده','Logged')+' '+mm(s.spent)+' · '+T('برای نمایش آهنگ، بودجه‌ی ساعت بگذار.','set an hour budget to see the pace.')+'</div>';
  h+='<div class="dyex">'+PN[v]+': '+(s.bud?T('لازم','target')+' <b>'+mm(s.tgt)+'</b> · ':'')+T('انجام','done')+' <b>'+mm(s.done)+'</b>'+(s.bud&&s.tgt?bar(s.done,s.tgt,'#3b82f6'):'')+'</div>';
  ps.forEach(x=>{const a=act(x.a),tot=mins(p,s.from,todayISO(),x),per=mins(p,s.ra,s.rb,x),bh=Math.round((+x.hrs||0)*60),subs=(a.subs||[]).filter(q=>!(x.s&&x.s.length)||x.s.includes(q.id));
    h+='<div class="dyp" style="display:block"><div class="row"><span style="width:10px;height:10px;border-radius:50%;background:'+esc(a.color||'#3b82f6')+'"></span><b style="flex:1;min-width:0">'+esc(a.name)+'</b><button class="chip" data-a="pj_add" data-p="'+esc(p.id)+'" data-x="'+esc(x.id)+'" title="'+T('به برنامه‌ی فردا','To tomorrow’s plan')+'">＋ '+T('فردا','Tomorrow')+'</button></div>'
     +'<div class="m">'+PN[v]+' '+mm(per)+' · '+T('کل','total')+' '+mm(tot)+(bh?' / '+mm(bh):'')+'</div>'+(bh?bar(tot,bh,a.color):'')
     +(subs.length?'<div class="m" style="margin-top:2px">'+subs.map(q=>{const t1=mins(p,s.from,todayISO(),x,q.id);return esc(q.name)+' '+(t1?mm(t1):'—')}).join(' · ')+'</div>':'')+'</div>'});
  if(!ps.length)h+='<p class="m">'+T('هنوز بخشی نداری؛ «ویرایش» را بزن و بخش اضافه کن.','No parts yet — tap Edit and add one.')+'</p>';
  h+='<div class="row" style="margin-top:6px"><button class="chip" data-a="pj_ed" data-p="'+esc(p.id)+'">✏️ '+T('ویرایش','Edit')+'</button><button class="chip" data-a="pj_arch" data-p="'+esc(p.id)+'">'+(p.arch?'↩ '+T('بازگردانی','Restore'):'🗄 '+T('بایگانی','Archive'))+'</button></div></div>';return h}
function pjCards(v,arch){const it=PJ().items.filter(p=>!!p.arch===!!arch);return it.map(p=>projCard(p,v)).join('')}
PG.pj=function(){const A=PJ(),v=A.v;
  let h='<div class="c">'+daniH('🎓','پروژه‌ها','Projects')+'<p class="m">'+T('هر پروژه موعد و بودجه‌ی ساعت دارد، از چند بخش ساخته می‌شود و هر بخش چند نوع کار دارد (مثلاً MBA ← ریاضی ← تمرین). زمانی که با کرنومتر یا ثبت سریع ثبت می‌کنی خودکار به پروژه می‌رود.','Each project has a deadline and an hour budget, is made of parts, and each part has work types (e.g. MBA → Maths → Practice). Time you log with the timer or quick log lands in the project automatically.')+'</p>'
   +'<div class="row">'+['d','w','m'].map(k=>'<button class="chip '+(v===k?'on':'')+'" data-a="pj_v" data-v="'+k+'">'+PN[k]+'</button>').join('')+'<span style="flex:1"></span><button class="chip on" data-a="pj_ed" data-p="">＋ '+T('پروژه‌ی جدید','New project')+'</button></div></div>';
  const cur=pjCards(v,false);h+=cur||'<div class="c" style="margin-top:10px"><p class="m">'+T('هنوز پروژه‌ای نداری. «پروژه‌ی جدید» را بزن؛ نام، موعد و بودجه‌ی ساعت را بگذار و بخش‌ها را از فعالیت‌هایت انتخاب کن.','No projects yet. Tap “New project”, set a name, deadline and hour budget and pick parts from your activities.')+'</p></div>';
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
const freshED=p=>p?{id:p.id,name:p.name,dl:p.dl||'',due:p.due||'',hrs:p.hrs||'',from:p.from||todayISO(),parts:JSON.parse(JSON.stringify(p.parts||[]))}:{id:'',name:'',dl:'',due:'',hrs:'',from:todayISO(),parts:[]};
function pull(){if(!ED)return;const g=i=>{const el=document.getElementById(i);return el?el.value:null};
  const n=g('pj-n');if(n!==null)ED.name=n;const dl=g('pj-dl');if(dl!==null)ED.dl=dl;const du=g('pj-du');if(du!==null)ED.due=du;const hr=g('pj-h');if(hr!==null)ED.hrs=hr;const fr=g('pj-f');if(fr!==null)ED.from=fr;
  ED.parts.forEach(x=>{const el=document.getElementById('pj-ph-'+x.id);if(el)x.hrs=el.value})}
function edHTML(){const dls=(zDL().items||[]).filter(d=>!d.arch&&!d.done);
  let h='<div class="c"><h3>'+(ED.id?T('ویرایش پروژه','Edit project'):T('پروژه‌ی جدید','New project'))+'</h3>'
   +'<label class="m">'+T('نام پروژه','Project name')+'</label><input id="pj-n" value="'+esc(ED.name)+'" placeholder="'+T('مثلاً آزمون MBA','e.g. MBA exam')+'" style="width:100%">'
   +'<label class="m">'+T('موعد','Deadline')+'</label><select id="pj-dl" style="width:100%"><option value="">'+T('تاریخ دستی (پایین)','Manual date (below)')+'</option>'+dls.map(d=>'<option value="'+esc(d.id)+'" '+(ED.dl===d.id?'selected':'')+'>'+esc(d.title)+' · '+fmtD(d.dt)+'</option>').join('')+'</select>'
   +'<label class="m">'+T('تاریخ موعد (اگر موعد بالا انتخاب نشده)','Due date (if no deadline picked above)')+'</label><input id="pj-du" type="date" value="'+esc(ED.due)+'" style="width:100%">'
   +'<div class="row" style="margin-top:6px"><div style="flex:1"><label class="m">'+T('بودجه‌ی ساعت','Hour budget')+'</label><input id="pj-h" type="number" min="0" step="0.5" value="'+esc(ED.hrs)+'" style="width:100%"></div><div style="flex:1"><label class="m">'+T('شمارش از تاریخ','Count from')+'</label><input id="pj-f" type="date" value="'+esc(ED.from)+'" style="width:100%"></div></div>'
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
  const o={name:n.slice(0,80),dl:ED.dl||'',due:ED.dl?'':(ED.due||''),hrs:+ED.hrs>0?+ED.hrs:0,from:ED.from||todayISO(),parts:ED.parts.map(x=>({id:x.id,a:x.a,s:(x.s||[]).slice(),hrs:+x.hrs>0?+x.hrs:0}))};
  const A=PJ();if(ED.id){const p=A.items.find(x=>x.id===ED.id);if(p)Object.assign(p,o)}else{if(A.items.length>=100)return say(T('حداکثر ۱۰۰ پروژه','Up to 100 projects'),1);A.items.push(Object.assign({id:'p'+uid(),cr:Date.now(),arch:0},o))}
  ED=null;closeM();save();render()};
H.pj_del=()=>{if(!ED||!ED.id)return;if(!confirm(T('این پروژه حذف شود؟ (ثبت‌های زمان و فعالیت‌ها دست‌نخورده می‌مانند)','Delete this project? (Logged time and activities are untouched)')))return;
  const A=PJ();A.items=A.items.filter(x=>x.id!==ED.id);ED=null;closeM();save();render()};

/* ---------- کارت کوچک در «امروز» و «برنامه‌ی فردا» ---------- */
function mini(date,title){const A=PJ();if(!A.today)return'';const it=A.items.filter(p=>!p.arch&&parts(p).length).map(p=>({p,s:stats(p,'d')})).filter(x=>x.s.bud&&!x.s.over&&x.s.rem>0||x.s.d&&!x.s.over&&!x.s.bud);if(!it.length)return'';
  it.sort((a,b)=>(a.s.d||'9')<(b.s.d||'9')?-1:1);
  return'<div class="c dyc" id="pjmini">'+daniH('🎓',title[0],title[1])+it.slice(0,4).map(x=>{const s=x.s;return'<div class="dyp" style="display:block"><div class="row"><b style="flex:1;min-width:0">'+esc(x.p.name)+'</b><span class="m">'+(s.d?T(fa(s.left)+' روز','d'+s.left)+' · ':'')+(s.bud?T('لازم امروز','need today')+' '+mm(s.perDay)+' · ':'')+T('انجام','done')+' '+mm(mins(x.p,todayISO(),todayISO()))+'</span></div>'+(s.bud?bar(mins(x.p,todayISO(),todayISO()),s.perDay||1,'#3b82f6'):'')+'</div>'}).join('')
   +'<button class="chip" data-a="dy_go" data-p="pj">🎓 '+T('همه‌ی پروژه‌ها','All projects')+'</button></div>'}
{const _d=PG.day;if(_d)PG.day=function(){const h=_d.apply(this,arguments);try{return typeof h==='string'?h+mini(todayISO(),['پروژه‌ها (امروز)','Projects (today)']):h}catch(e){return h}}}
{const _t=PG.tmr;if(_t)PG.tmr=function(){const h=_t.apply(this,arguments);try{return typeof h==='string'?h+mini(addD(todayISO(),1),['پروژه‌ها (آهنگ لازم)','Projects (needed pace)']):h}catch(e){return h}}}

/* ---------- منو ---------- */
try{Object.assign(ICONS,{pj:'<path d="M3 7h18v12H3z"/><path d="M9 7V5h6v2M3 12h18"/>'});BI_NAV.pj=['Projects','پروژه‌ها'];EXT_PAGES.add('pj')}catch(e){}
{const _s=syncNav;syncNav=function(){_s.apply(this,arguments);try{if(!NAV.some(n=>n[0]==='pj')&&(db.set.nv||{}).mode==='classic'){const i=NAV.findIndex(n=>n[0]==='dl'||n[0]==='cm');NAV.splice(i>=0?i+1:NAV.length,0,['pj','پروژه‌ها'])}}catch(e){}}}
{const _m=PG.mx;if(_m)PG.mx=function(){const h=_m.apply(this,arguments);return typeof h==='string'?h+'<div class="c">'+daniH('🎓','پروژه‌ها','Projects')+'<button class="chip on" data-a="dy_go" data-p="pj" style="margin:3px">🎓 '+T('پروژه‌ها (بخش، نوع کار، موعد)','Projects (parts, work types, deadlines)')+'</button></div>':h}}
window.daniProjects={stats:p=>stats(p,'d'),list:()=>PJ().items.slice()};
})();
