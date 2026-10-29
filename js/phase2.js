"use strict";
/* DANI · phase2.js — بازده روزانه (همه افزوده و قابل‌خاموش):
   (۱) قالب روز/هفته (db.set.tpl) — در تب «برنامه»ی میزکار
   (۲) حالت امتحان (db.set.ex {on,title,date,quiet}) — شمارش‌معکوس بالای خانه/میزکار و (اختیاری) فقط اعلان‌های مهم
   (۳) برآورد ساعتِ موعد و پیش‌بینی «به موقع می‌رسی؟» (فیلدهای est/act/estAt روی خودِ موعد؛ کارت بالای صفحه‌ی موعدها)
   (۴) بخشش یک روز در زنجیره‌ی عادت‌ها (db.set.hg {on})
   (۵) زیرمرحله‌ی اهداف بلندمدت (goal.steps) + نوار پیشرفت
   (۶) تب «جست‌وجو» در میزکار برای ثبت‌ها و یادداشت‌ها */
(function(){
const T=window.daniT;
const S=(k,d)=>{const s=db.set;if(!s[k]||typeof s[k]!=='object')s[k]=Object.assign({},d);const o=s[k];for(const x in d)if(o[x]===undefined)o[x]=d[x];return o};
const sync=()=>{try{if(typeof Notifier!=='undefined')Notifier.sync(true)}catch(e){}};
const val2=id=>{const e=document.getElementById(id);return e?e.value:''};

/* ========== (۱) قالب‌ها ========== */
const TPL=()=>{if(!Array.isArray(db.set.tpl))db.set.tpl=[];return db.set.tpl};
const dayItems=d=>(plan(d)||[]).filter(x=>act(x.actId)).map(x=>({actId:x.actId,start:x.start||'',end:x.end||'',goal:+x.goal||0,pr:x.pr||''}));
H.tp_sd=()=>{const n=(val2('tp-name')||'').trim().slice(0,40),it=dayItems(todayISO());if(!n)return toast(T('نامی برای قالب بنویس','Name the template'),1);if(!it.length)return toast(T('برنامه‌ی امروز خالی است','Today\'s plan is empty'),1);
  TPL().push({id:uid(),name:n,type:'day',items:it.map(x=>Object.assign({o:0},x))});save();toast(T('قالب روز ذخیره شد ✓','Day template saved ✓'));render()};
H.tp_sw=()=>{const n=(val2('tp-name')||'').trim().slice(0,40);if(!n)return toast(T('نامی برای قالب بنویس','Name the template'),1);const ws=weekStart(todayISO()),it=[];
  for(let i=0;i<7;i++)dayItems(addD(ws,i)).forEach(x=>it.push(Object.assign({o:i},x)));if(!it.length)return toast(T('برنامه‌ی این هفته خالی است','This week has no plan'),1);
  TPL().push({id:uid(),name:n,type:'week',items:it});save();toast(T('قالب هفته ذخیره شد ✓','Week template saved ✓'));render()};
function applyTpl(t,start){let n=0;if(!db.plans)db.plans={};
  t.items.forEach(x=>{if(!act(x.actId))return;const d=addD(start,x.o||0);db.plans[d]=db.plans[d]||[];
    if(db.plans[d].some(z=>z.actId===x.actId&&(z.start||'')===(x.start||'')))return;
    db.plans[d].push({id:uid(),actId:x.actId,start:x.start,end:x.end,goal:x.goal,status:'todo',reason:T('از قالب «'+t.name+'»','From template “'+t.name+'”'),pr:x.pr||undefined});n++});return n}
H.tp_ap=e=>{const t=TPL().find(z=>z.id===e.dataset.id);if(!t)return;const w=e.dataset.w;const td=todayISO();
  const start=t.type==='week'?(w==='next'?addD(weekStart(td),7):weekStart(td)):(w==='tom'?addD(td,1):td);
  const n=applyTpl(t,start);save();toast(n?T('اعمال شد ✓ ('+fa(n)+' مورد)','Applied ✓ ('+n+' items)'):T('چیزی اضافه نشد (احتمالاً از قبل هست)','Nothing added (already there)'));render()};
H.tp_dl=e=>{const l=TPL(),i=l.findIndex(z=>z.id===e.dataset.id);if(i>=0&&confirm(T('قالب حذف شود؟','Delete this template?'))){l.splice(i,1);save();render()}};
function tplCard(){const l=TPL();
  let h='<details class="c" id="tpcard"'+(S('tpo',{o:0}).o?' open':'')+'><summary style="cursor:pointer">'+daniH('🧩','قالب‌های روز و هفته','Day & week templates')+'</summary>'
   +'<p class="m">'+T('برنامه‌ی امروز یا این هفته را یک‌بار به‌عنوان قالب ذخیره کن (مثلاً «روز امتحان»، «روز سبک») و هر وقت خواستی با یک ضربه اعمال کن.','Save today\'s or this week\'s plan once (e.g. “Exam day”, “Light day”) and apply it anytime.')+'</p>'
   +'<div class="row"><input id="tp-name" maxlength="40" placeholder="'+esc(T('نام قالب','Template name'))+'" style="flex:1"><button class="chip" data-a="tp_sd">'+T('ذخیره‌ی امروز','Save today')+'</button><button class="chip" data-a="tp_sw">'+T('ذخیره‌ی این هفته','Save this week')+'</button></div>';
  h+=l.length?l.map(t=>'<div class="cwr" style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><span style="flex:1;min-width:120px"><b>'+esc(t.name)+'</b> <span class="m">'+(t.type==='week'?T('هفته','Week'):T('روز','Day'))+' · '+fa(t.items.length)+'</span></span>'
     +(t.type==='week'?'<button class="chip" data-a="tp_ap" data-id="'+t.id+'" data-w="this">'+T('این هفته','This week')+'</button><button class="chip" data-a="tp_ap" data-id="'+t.id+'" data-w="next">'+T('هفته‌ی بعد','Next week')+'</button>':'<button class="chip" data-a="tp_ap" data-id="'+t.id+'" data-w="today">'+T('امروز','Today')+'</button><button class="chip" data-a="tp_ap" data-id="'+t.id+'" data-w="tom">'+T('فردا','Tomorrow')+'</button>')
     +'<button class="chip" data-a="tp_dl" data-id="'+t.id+'" aria-label="delete">✕</button></div>').join(''):'<p class="m">'+T('هنوز قالبی نداری.','No templates yet.')+'</p>';
  return h+'</details>'}
document.addEventListener('toggle',e=>{if(e.target&&e.target.id==='tpcard'){S('tpo',{o:0}).o=e.target.open?1:0}},true);
{const _p=PX.plan;if(typeof _p==='function')PX.plan=function(){const h=_p.apply(this,arguments);return(typeof h==='string'?tplCard():'')+h}}

/* ========== (۲) حالت امتحان ========== */
const EX=()=>S('ex',{on:0,title:'',date:'',quiet:1});
const daysTo=d=>Math.round((new Date(d+'T12:00:00')-new Date(todayISO()+'T12:00:00'))/864e5);
function exBanner(){const x=EX();if(!x.on||!x.date)return'';const n=daysTo(x.date);
  const last=db.entries.filter(e=>e.date>=addD(todayISO(),-6)).reduce((a,e)=>a+(+e.min||0),0),avg=Math.round(last/7);
  return'<div class="c" id="exbn" style="border-inline-start:5px solid #ef4444"><div class="row" style="align-items:center"><div style="flex:1;min-width:0"><b>🎓 '+esc(x.title||T('امتحان','Exam'))+'</b><div class="m">'+fmtDL(x.date)+(avg?' · '+T('میانگین ۷ روز اخیر: ','7-day avg: ')+mm(avg):'')+'</div></div><div style="text-align:center"><b style="font-size:1.8em;color:'+(n<=3?'#ef4444':n<=7?'#f59e0b':'inherit')+'">'+(n>=0?fa(n):'—')+'</b><div class="m">'+(n>=0?T('روز مانده','days left'):T('گذشته','past'))+'</div></div></div>'
   +'<div class="row" style="margin-top:6px"><button class="chip" data-a="go" data-p="plan">'+T('برنامه','Plan')+'</button><button class="chip" data-a="ex_off">'+T('پایان حالت امتحان','End exam mode')+'</button></div></div>'}
H.ex_off=()=>{EX().on=0;save();sync();render()};
H.ex_save=()=>{const x=EX(),d=readD(val2('ex-d'));if(!d)return toast(T('تاریخ نامعتبر','Invalid date'),1);x.title=(val2('ex-t')||'').slice(0,50);x.date=d;x.on=1;x.quiet=document.getElementById('ex-q')&&document.getElementById('ex-q').checked?1:0;save();sync();toast(T('حالت امتحان روشن شد','Exam mode on'));render()};
function exCard(){const x=EX();
  return'<div class="c" id="excard">'+daniH('🎓','حالت امتحان','Exam mode')+'<p class="m">'+T('شمارش‌معکوس بالای خانه و میزکار، و (اختیاری) فقط اعلان‌های مهم. با پایان امتحان خاموشش کن؛ هیچ داده‌ای تغییر نمی‌کند.','A countdown on Home and Workspace and (optionally) only important notifications. Turn it off afterwards; no data changes.')+'</p>'
   +'<div class="row"><input id="ex-t" maxlength="50" placeholder="'+esc(T('نام امتحان','Exam name'))+'" value="'+esc(x.title)+'" style="flex:1">'+dI('ex-d',x.date||'')+'</div>'
   +'<label class="m"><input type="checkbox" id="ex-q" '+(x.quiet?'checked':'')+'> '+T('در این مدت فقط اعلان‌های مهم (یادآور، موعد، زنگ تایمر)','Only important notifications meanwhile (reminders, deadlines, timer alarms)')+'</label>'
   +'<div class="row" style="margin-top:6px"><button class="p" data-a="ex_save">'+(x.on?T('به‌روزرسانی','Update'):T('روشن کن','Turn on'))+'</button>'+(x.on?'<button class="chip" data-a="ex_off">'+T('خاموش','Off')+'</button>':'')+'</div></div>'}
{const _sp=setPage;setPage=function(){const h=_sp.apply(this,arguments);return(typeof h==='string'&&typeof stt!=='undefined'&&stt==='time')?h+exCard():h}}
function exInject(){if(!EX().on||(page!=='home'&&page!=='dash'))return;const pg=document.getElementById('pg');if(!pg||pg.querySelector('#exbn'))return;const h=exBanner();if(!h)return;
  const top=pg.querySelector('.h2top,.dkgr');const host=top?(top.closest('.h2top')||top.parentElement):null;const d=document.createElement('div');d.innerHTML=h;
  if(host&&host.parentElement===pg)host.after(d.firstChild);else pg.insertBefore(d.firstChild,pg.firstChild)}
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{exInject()}catch(e){console.error('exam',e)}return r}}
{const _f=window.daniPlanFilter;window.daniPlanFilter=(out,now)=>{let o=_f?_f(out,now):out;const x=EX();
  if(x.on&&x.quiet)o=o.filter(i=>/^(timer|pomo)/.test(String(i.key||''))||i.ch==='dani-alarm-v2'||/\|/.test(String(i.key||''))||!/^(nx-|rh|pin|wk-sum|insight)/.test(String(i.key||'')));return o}}

/* ========== (۳) برآورد ساعت موعد و پیش‌بینی ========== */
const ITEMS=()=>{try{return typeof modOn==='function'&&modOn('dl')?zDL().items.filter(x=>dlOk(x)&&!x.done&&!x.arch&&dlTs(x)>Date.now()):[]}catch(e){return[]}};
function fc(x){const left=Math.max(0,(dlTs(x)-Date.now())/864e5),est=(+x.est||0)*60;if(!est)return null;
  const t=todayISO(),since=x.estAt?new Date(x.estAt).toISOString().slice(0,10):t,es=(E(since,t)||[]).filter(e=>x.act?e.actId===x.act:false),done=x.act?sum(es):0,rem=Math.max(0,est-done);
  const pool=x.act?(E(addD(t,-13),t)||[]).filter(e=>e.actId===x.act):(E(addD(t,-13),t)||[]).filter(e=>{const a=act(e.actId);return a&&(a.cat==='learn'||a.cat==='work')});
  const avg=sum(pool)/14,cap=avg*left,need=left>0?rem/left:rem;
  const r=rem===0?9:(cap/Math.max(1,rem));return{est,done,rem,left,avg,cap,need,st:rem===0?'ok':r>=1.1?'ok':r>=.7?'warn':'bad'}}
H.dlf_est=e=>{const x=zDL().items.find(z=>z.id===e.dataset.id);if(!x)return;const v=parseFloat(String(en(val2('dle-'+x.id))).replace(',','.'));
  x.est=v>0?Math.min(2000,v):0;x.act=val2('dla-'+x.id)||'';x.estAt=Date.now();save();toast(T('ذخیره شد ✓','Saved ✓'));render()};
function dlCard(){const L=ITEMS().slice(0,12);if(!L.length)return'';
  return'<details class="c" id="dlfc"'+(S('dfo',{o:0}).o?' open':'')+'><summary style="cursor:pointer">'+daniH('⏳','برآورد حجم کار و پیش‌بینی','Workload estimate & forecast')+'</summary><p class="m">'+T('برای هر موعد بنویس چند ساعت کار لازم دارد و کدام فعالیت برایش ثبت می‌شود؛ برنامه می‌گوید با سرعت ۱۴ روز اخیرت می‌رسی یا نه.','For each deadline enter the hours needed and the activity you log it under; the app tells you whether your last-14-day pace gets you there.')+'</p>'
  +L.map(x=>{const f=fc(x),c=f?{ok:'#22c55e',warn:'#f59e0b',bad:'#ef4444'}[f.st]:'inherit';
   return'<div class="cwr" style="display:block;margin:6px 0"><div class="row"><b style="flex:1">'+esc(x.title)+'</b><span class="m">'+fmtDL(x.dt)+'</span></div>'
    +'<div class="row"><input id="dle-'+x.id+'" type="number" min="0" step="0.5" value="'+(x.est||'')+'" placeholder="'+esc(T('ساعت','hours'))+'" style="width:84px"><select id="dla-'+x.id+'"><option value="">'+T('فعالیت مرتبط (اختیاری)','Linked activity (optional)')+'</option>'+db.acts.filter(a=>a.active&&!a.arch).map(a=>'<option value="'+esc(a.id)+'" '+(x.act===a.id?'selected':'')+'>'+esc(a.name)+'</option>').join('')+'</select><button class="chip" data-a="dlf_est" data-id="'+x.id+'">'+T('ثبت','Save')+'</button></div>'
    +(f?'<div class="m" style="color:'+c+'">'+(f.st==='ok'?'✅ ':f.st==='warn'?'⚠️ ':'🔴 ')+T('باقی‌مانده '+mm(Math.round(f.rem))+' · لازم روزانه '+mm(Math.round(f.need))+' · میانگین تو '+mm(Math.round(f.avg))+(x.act?'':' (کل مطالعه/کار)'),'Remaining '+mm(Math.round(f.rem))+' · need/day '+mm(Math.round(f.need))+' · your avg '+mm(Math.round(f.avg))+(x.act?'':' (all study/work)'))+'</div>':'')+'</div>'}).join('')+'</details>'}
document.addEventListener('toggle',e=>{if(e.target&&e.target.id==='dlfc'){S('dfo',{o:0}).o=e.target.open?1:0}},true);
{const _p=PG.dl;if(typeof _p==='function')PG.dl=function(){const h=_p.apply(this,arguments);let c='';try{c=dlCard()}catch(e){console.error('dlfc',e)}return typeof h==='string'?c+h:h}}
window.daniDlForecast=()=>{const L=ITEMS().map(x=>({x,f:fc(x)})).filter(o=>o.f);if(!L.length)return'';
  return'<div class="c">'+daniH('⏳','پیش‌بینی موعدها','Deadline forecast')+L.map(({x,f})=>'<div class="row"><span>'+({ok:'✅',warn:'⚠️',bad:'🔴'}[f.st])+'</span><span style="flex:1">'+esc(x.title)+'</span><span class="m">'+T('لازم '+mm(Math.round(f.need))+'/روز · تو '+mm(Math.round(f.avg)),'need '+mm(Math.round(f.need))+'/day · you '+mm(Math.round(f.avg)))+'</span></div>').join('')+'</div>'};

/* ========== (۴) بخشش یک روز در زنجیره‌ی عادت ========== */
const HG=()=>S('hg',{on:1});
if(typeof hStats==='function'){const _h=hStats;hStats=function(h){const r=_h.apply(this,arguments);if(!HG().on)return r;
  try{const t=todayISO();let d=h.start;const lim=addD(t,-800);if(d<lim)d=lim;let run=0,best=0,since=99;
    for(;d<=t;d=addD(d,1)){if(!hExp(h,d))continue;const s=hSt(h,d);if(d===t&&!s)continue;since++;
      if(s==='done'){run++;best=Math.max(best,run)}else if(since>=7&&run>0){since=0}else run=0}
    r.cur=run;r.best=Math.max(r.best,best);r.g=1}catch(e){}
  return r}}
H.hg_t=()=>{HG().on=HG().on?0:1;save();render()};
{const _p=PG.hab;if(typeof _p==='function')PG.hab=function(){const h=_p.apply(this,arguments);return typeof h==='string'?'<div class="row" style="margin:0 0 6px"><button class="chip '+(HG().on?'on':'')+'" data-a="hg_t">🔥 '+T('بخشش یک روز در هفته برای زنجیره','One forgiven miss per week keeps the streak')+'</button></div>'+h:h}}

/* ========== (۵) زیرمرحله‌ی اهداف ========== */
H.gs_add=e=>{const g=db.goals[+e.dataset.i];if(!g)return;const t=(val2('gs-'+e.dataset.i)||'').trim().slice(0,80);if(!t)return;(g.steps=g.steps||[]).push({t,d:0});save();render()};
H.gs_tg=e=>{const g=db.goals[+e.dataset.i],s=g&&g.steps&&g.steps[+e.dataset.j];if(s){s.d=s.d?0:1;save();render()}};
H.gs_rm=e=>{const g=db.goals[+e.dataset.i];if(g&&g.steps){g.steps.splice(+e.dataset.j,1);save();render()}};
function goalSteps(){if(page!=='dash'||dt!=='goals')return;const pg=document.getElementById('pg');if(!pg)return;
  const cards=[...pg.children].filter(c=>c.classList&&c.classList.contains('c'));cards.shift();
  cards.forEach((c,i)=>{const g=db.goals[i];if(!g||c.querySelector('.gsteps'))return;const st=g.steps||[],dn=st.filter(s=>s.d).length;
    const box=document.createElement('div');box.className='gsteps';
    box.innerHTML=(st.length?'<div class="row"><span class="m">'+T('مراحل','Steps')+' '+fa(dn)+'/'+fa(st.length)+'</span></div><div class="bar"><i style="width:'+Math.round(dn/st.length*100)+'%"></i></div>':'')
     +st.map((s,j)=>'<div class="row" style="align-items:center"><button class="chip '+(s.d?'on':'')+'" data-a="gs_tg" data-i="'+i+'" data-j="'+j+'">'+(s.d?'☑':'☐')+'</button><span style="flex:1;'+(s.d?'text-decoration:line-through;opacity:.6':'')+'" dir="auto">'+esc(s.t)+'</span><button class="chip" data-a="gs_rm" data-i="'+i+'" data-j="'+j+'" aria-label="delete">✕</button></div>').join('')
     +'<div class="row" style="margin-top:4px"><input id="gs-'+i+'" maxlength="80" placeholder="'+esc(T('مرحله‌ی تازه…','New step…'))+'" style="flex:1"><button class="chip" data-a="gs_add" data-i="'+i+'">＋</button></div>';
    c.appendChild(box)})}
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{goalSteps()}catch(e){console.error('gsteps',e)}return r}}

/* ========== (۶) جست‌وجو در ثبت‌ها و یادداشت‌ها ========== */
const FQ={q:'',a:'',from:'',to:'',n:40};
try{if(!DT.some(x=>x[0]==='find'))DT.push(['find',T('جست‌وجو','Search')])}catch(e){}
H.fd_go=()=>{FQ.q=(val2('fq-q')||'').trim().toLowerCase();FQ.a=val2('fq-a');FQ.from=readD(val2('fq-1'))||'';FQ.to=readD(val2('fq-2'))||'';FQ.n=40;render()};
H.fd_more=()=>{FQ.n+=40;render()};
H.fd_csv=()=>{const l=found().ents;dl('dani-search.csv','text/csv',csvE(l))};
function found(){const q=FQ.q;
  const ents=db.entries.filter(e=>(!FQ.a||e.actId===FQ.a)&&(!FQ.from||e.date>=FQ.from)&&(!FQ.to||e.date<=FQ.to)&&(!q||((e.note||'')+' '+aN(e.actId)).toLowerCase().includes(q))).sort((a,b)=>(b.date+(b.start||'')).localeCompare(a.date+(a.start||'')));
  const notes=q?db.notes.filter(n=>JSON.stringify(n).toLowerCase().includes(q)):[];return{ents,notes}}
PX.find=function(){const r=found(),tot=sum(r.ents);
  let h='<div class="c">'+daniH('🔎','جست‌وجو در ثبت‌ها و یادداشت‌ها','Search entries & notes')+'<div class="row"><input id="fq-q" value="'+esc(FQ.q)+'" placeholder="'+esc(T('کلمه (در توضیح ثبت و یادداشت)','Word (in entry text & notes)'))+'" style="flex:1;min-width:140px"><select id="fq-a"><option value="">'+T('همه‌ی فعالیت‌ها','All activities')+'</option>'+db.acts.map(a=>'<option value="'+esc(a.id)+'" '+(FQ.a===a.id?'selected':'')+'>'+esc(a.name)+'</option>').join('')+'</select></div>'
   +'<div class="row" style="margin-top:6px"><label class="m">'+T('از','From')+' '+dI('fq-1',FQ.from)+'</label><label class="m">'+T('تا','To')+' '+dI('fq-2',FQ.to)+'</label><button class="p" data-a="fd_go">'+T('بگرد','Search')+'</button></div></div>';
  h+='<div class="c"><div class="row"><b>'+fa(r.ents.length)+'</b> <span class="m">'+T('ثبت · مجموع ','entries · total ')+mm(tot)+'</span><span class="sp"></span><button class="chip" data-a="fd_csv">CSV</button></div>'
   +r.ents.slice(0,FQ.n).map(e=>'<div class="cwr" style="display:flex;gap:6px;align-items:center"><span style="flex:1;min-width:0" dir="auto"><b>'+esc(aN(e.actId))+'</b> · '+fmtD(e.date)+' '+esc(e.start||'')+' · '+mm(e.min)+(e.note?'<br><span class="m">'+esc(e.note)+'</span>':'')+'</span><button class="chip" data-a="eedit" data-id="'+e.id+'">✎</button></div>').join('')
   +(r.ents.length>FQ.n?'<div class="row"><button class="chip" data-a="fd_more">'+T('نمایش بیشتر','Show more')+'</button></div>':'')+'</div>';
  if(r.notes.length)h+='<div class="c">'+daniH('📝','یادداشت‌ها','Notes')+r.notes.slice(0,20).map(n=>'<div class="cwr" dir="auto">'+esc(String(n.text||n.t||n.title||JSON.stringify(n)).slice(0,160))+'</div>').join('')+'</div>';
  return h};
})();
