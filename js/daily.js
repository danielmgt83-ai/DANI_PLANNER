"use strict";
/* DANI · daily.js — «چرخه‌ی روز» به‌عنوان قلب برنامه: صفحه‌ی «امروز» (برنامه‌ی امروز ← ثبت یکپارچه ← تایم‌لاین ← نتیجه)،
   تب «نتیجه‌ی امروز» در نتیجه‌گیری، منوی ساده‌ی ۵ مدخلی (امروز، فردا، موعد و عادت، نتیجه‌گیری، بیشتر) و صفحه‌ی «بیشتر/راه‌اندازی».
   همه‌چیز اختیاری: db.set.nv {mode:'simple'|'classic'} (کلاسیک = منوی قبلیِ بدون تغییر)، db.set.dy {hide:[…],gaps:1,setup:1}.
   هیچ صفحه‌ای حذف نشده؛ خانه، میزکار، تنظیمات و بقیه از «بیشتر» (یا منوی کلاسیک) در دسترس‌اند.
   ثبت یکپارچه: کرنومتر، شمارش‌معکوس، پومودورو و ثبت ۵ ثانیه‌ای در یک کارت؛ «تبدیل به پومودورو» روی کار در حال اجرا.
   «برگرد به برنامه»: اگر از برنامه عقب افتادی، بقیه‌ی کارها را در ساعت‌های خالی می‌چیند یا مهم‌ترین کار را شروع می‌کند. */
(function(){
const T=window.daniT;
const say=(m,b)=>{try{toast(m,b)}catch(e){}};
const NV=()=>{const s=db.set;if(!s.nv||typeof s.nv!=='object')s.nv={mode:'classic'};if(s.nv.mode!=='simple')s.nv.mode='classic';return s.nv};
const simple=()=>NV().mode==='simple';
const DY=()=>{const s=db.set;if(!s.dy||typeof s.dy!=='object')s.dy={};const o=s.dy;if(!Array.isArray(o.hide))o.hide=[];if(o.gaps===undefined)o.gaps=1;if(!Array.isArray(o.order))o.order=['sp','pl','tr','tl','ed'];['sp','pl','tr','tl','ed'].forEach(k=>{if(!o.order.includes(k))o.order.push(k)});return o};
const nowMin=()=>{const d=new Date();return d.getHours()*60+d.getMinutes()};
const hh=m=>pad(Math.floor(m/60)%24)+':'+pad(m%60);

/* ---------- منو ---------- */
try{Object.assign(ICONS,{day:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',mx:'<circle cx="6" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18" cy="12" r="1.6"/>'})}catch(e){}
try{BI_NAV.day=['Today','امروز'];BI_NAV.mx=['More','بیشتر'];EXT_PAGES.add('day');EXT_PAGES.add('mx')}catch(e){}
{const _s=syncNav;syncNav=function(){_s.apply(this,arguments);try{if(!simple())return;
  const subs=NAV.some(n=>n[0]==='cm')?[['cm','موعد و عادت']]:['dl','hab','rem'].filter(k=>modOn(k)).map(k=>NAV.find(n=>n[0]===k)||[k,k]);
  NAV.length=0;NAV.push(['day','امروز'],['tmr','فردا']);subs.forEach(x=>NAV.push(x));NAV.push(['res','نتیجه‌گیری و گزارش'],['mx','بیشتر'])}catch(e){console.error('simpleNav',e)}}}
const PRIMARY=new Set(['day','tmr','cm','dl','hab','rem','res','mx']);
function markNav(){if(!simple())return;document.querySelectorAll('#nav a[data-p="mx"]').forEach(a=>a.classList.toggle('on',!PRIMARY.has(page)||page==='mx'))}
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{markNav()}catch(e){}return r}}
if(simple()&&page==='home'){page='day'}
H.nv_set=e=>{NV().mode=e.dataset.m==='classic'?'classic':'simple';if(simple()&&!PRIMARY.has(page))page='day';save();render()};
H.dy_go=e=>{const d=e.dataset;page=d.p;if(d.d)dt=d.d;if(d.r)rt=d.r;if(d.s)stt=d.s;render();try{window.scrollTo(0,0)}catch(x){}};

/* ---------- ابزارها ---------- */
const recent=n=>{const out=[],seen=new Set();for(let i=db.entries.length-1;i>=0&&out.length<n;i--){const a=act(db.entries[i].actId);if(a&&a.active&&!a.arch&&a.cat!=='sleep'&&!seen.has(a.id)){seen.add(a.id);out.push(a.id)}}return out};
function planRows(d){const items=(plan(d)||[]).slice(),pool={};(E(d)||[]).forEach(e=>{pool[e.actId]=(pool[e.actId]||0)+(e.min||0)});
  const ord=items.map((x,i)=>({x,i})).sort((a,b)=>(a.x.start||'99').localeCompare(b.x.start||'99')||a.i-b.i);
  return ord.map(o=>{const x=o.x,need=+x.goal||(x.start&&x.end?dur(x.start,x.end):30),live=!['canceled','carried'].includes(x.status);let got=0;if(live){got=Math.min(need,pool[x.actId]||0);pool[x.actId]=(pool[x.actId]||0)-got}
    return{x,need,got,live,done:x.status==='done'||(live&&got>=need)}})}
const dayInfo=d=>{const rows=planRows(d),live=rows.filter(r=>r.live),need=live.reduce((s,r)=>s+r.need,0),got=live.reduce((s,r)=>s+r.got,0);return{rows,need,got,pct:need?Math.round(got/need*100):0,open:live.filter(r=>!r.done)}};

/* ---------- تایم‌لاین ---------- */
function tlHTML(d,opt){opt=opt||{};const es=(E(d)||[]).filter(e=>/^\d\d:\d\d$/.test(e.start||'')).map(e=>({s:tm(e.start),e:Math.min(1440,tm(e.start)+(e.min||0)),id:e.actId})).sort((a,b)=>a.s-b.s),today=d===todayISO(),nm=today?nowMin():null;
  const pl=(plan(d)||[]).filter(x=>x.start&&x.end&&!['canceled','carried'].includes(x.status)).map(x=>({s:tm(x.start),e:tm(x.start)+(+x.goal||dur(x.start,x.end)),id:x.actId}));
  let a=360,b=1320;es.concat(pl).forEach(x=>{a=Math.min(a,Math.floor(x.s/60)*60);b=Math.max(b,Math.ceil(Math.min(x.e,1440)/60)*60)});if(nm!=null)b=Math.max(b,Math.ceil((nm+1)/60)*60);b=Math.min(1440,Math.max(b,a+180));const W=b-a,px=v=>Math.max(0,Math.min(100,(v-a)/W*100)).toFixed(2);
  const seg=(x,cls)=>'<i class="'+cls+'" style="left:'+px(x.s)+'%;width:'+Math.max(.6,(Math.min(x.e,b)-x.s)/W*100).toFixed(2)+'%;background:'+aC(x.id)+'" title="'+esc(aN(x.id)+' · '+hh(x.s)+'–'+hh(x.e%1440))+'"></i>';
  let gaps=[];if(today&&DY().gaps&&es.length){let cur=es[0].e;es.slice(1).forEach(x=>{if(x.s-cur>=15)gaps.push([cur,x.s]);cur=Math.max(cur,x.e)});if(nm-cur>=15)gaps.push([cur,nm])}
  let h='<div class="dytl" dir="ltr"><div class="dytr">'+pl.map(x=>seg(x,'pb')).join('')+'</div><div class="dytr big">'+gaps.map(g=>'<b class="gp" data-a="dy_gap" data-s="'+g[0]+'" data-e="'+g[1]+'" style="left:'+px(g[0])+'%;width:'+((g[1]-g[0])/W*100).toFixed(2)+'%" title="'+esc(T('ثبت این بازه','Fill this gap'))+'"></b>').join('')+es.map(x=>seg(x,'eb')).join('')+(nm!=null&&nm>=a&&nm<=b?'<u class="nw" style="left:'+px(nm)+'%"></u>':'')+'</div>'
   +'<div class="dyax">'+Array.from({length:Math.floor(W/60)+1},(_,i)=>{const t=a+i*60;return(i%(W>720?3:2)===0)?'<span style="left:'+px(t)+'%">'+pad(Math.floor(t/60)%24)+'</span>':''}).join('')+'</div></div>';
  const by={};es.forEach(x=>{by[x.id]=(by[x.id]||0)+(x.e-x.s)});const top=Object.entries(by).sort((p,q)=>q[1]-p[1]).slice(0,5);
  h+='<div class="row" style="gap:10px;margin-top:6px">'+top.map(([id,v])=>'<span class="m"><span style="color:'+aC(id)+'">●</span> '+esc(aN(id))+' '+mm(v)+'</span>').join('')+'</div>';
  if(gaps.length&&!opt.noGapNote){const tot=gaps.reduce((s,g)=>s+g[1]-g[0],0);h+='<div class="m" style="margin-top:4px">🕳 '+T('وقت ثبت‌نشده: '+mm(tot)+' — روی بخش‌های خط‌خطی بزن و بگو چه کردی.','Unlogged: '+mm(tot)+' — tap the hatched parts and tell me what you did.')+'</div>'}
  return h}
H.dy_gap=e=>{const s=+e.dataset.s,en=+e.dataset.e,r=recent(6);let sel=r[0]||'';
  modal('<div style="max-width:420px">'+daniH('🕳','این بازه چه کردی؟','What did you do in this gap?')+'<div class="m" dir="ltr">'+hh(s)+' – '+hh(en)+' · '+mm(en-s)+'</div>'
   +'<div class="row" style="margin:8px 0">'+r.map(id=>'<button class="chip" data-a="dy_gapsave" data-s="'+s+'" data-e="'+en+'" data-id="'+id+'">'+esc(aN(id))+'</button>').join('')+'</div>'
   +'<div class="row"><select id="dg-a" style="flex:1">'+aOpts(sel)+'</select></div><div class="row" style="margin-top:6px"><input type="time" id="dg-s" value="'+hh(s)+'"><span class="m">→</span><input type="time" id="dg-e" value="'+hh(en)+'"></div>'
   +'<div class="row" style="margin-top:10px"><button class="p" data-a="dy_gapsave" data-s="'+s+'" data-e="'+en+'" data-id="">'+T('ثبت','Save')+'</button><button data-a="cl">'+T('انصراف','Cancel')+'</button></div></div>')};
H.dy_gapsave=e=>{let id=e.dataset.id,s=e.dataset.s?hh(+e.dataset.s):'',en=e.dataset.e?hh(+e.dataset.e):'';if(!id){id=val('dg-a');s=val('dg-s')||s;en=val('dg-e')||en}
  if(!id||!/^\d\d:\d\d$/.test(s)||!/^\d\d:\d\d$/.test(en)||s===en)return say(T('زمان یا فعالیت نامعتبر','Invalid time or activity'),1);
  db.entries.push({id:uid(),date:todayISO(),actId:id,subId:'',start:s,end:en,min:dur(s,en),note:'',src:'gap'});if(!save())return;closeM();say(T('ثبت شد ✓','Saved ✓'));render()};

/* ---------- کارت برنامه‌ی امروز ---------- */
function secPlan(){const d=todayISO(),I=dayInfo(d),dd=db.days[d]||{};
  let h='<div class="c dyc">'+daniH('🎯','برنامه‌ی امروز','Today\'s plan')+'<div class="m">'+fmtDL(d)+' · <b id="clk">'+fa(nowHM())+'</b></div>';
  if(dd.goal||dd.exp)h+='<div class="dyex">'+(dd.goal?'★ <b>'+esc(dd.goal)+'</b>':'')+(dd.exp?'<div class="m">💭 '+esc(dd.exp)+'</div>':'')+'</div>';
  if(!I.rows.length){return h+'<p class="m">'+T('برنامه‌ای برای امروز ثبت نشده.','No plan for today yet.')+'</p><div class="row"><button class="p" data-a="tmr_open" data-d="'+d+'">📝 '+T('برنامه‌ی امروز را بنویس','Write today\'s plan')+'</button></div></div>'}
  h+='<div class="row" style="align-items:baseline"><b style="font-size:1.5em">'+fa(I.pct)+(LANGEN()?'%':'٪')+'</b><span class="m">'+mm(I.got)+' / '+mm(I.need)+'</span></div><div class="bar"><i style="width:'+Math.min(100,I.pct)+'%;background:'+(I.pct>=100?'#22c55e':'var(--ac)')+'"></i></div>';
  h+=I.rows.map(r=>{const x=r.x,id=x.id,pc=r.need?Math.min(100,Math.round(r.got/r.need*100)):0;
    return'<div class="dyp'+(r.done?' dn':'')+(r.live?'':' off')+'"><button class="chip" data-a="dy_chk" data-i="'+id+'" aria-label="done">'+(r.done?'✅':'⬜')+'</button><div style="flex:1;min-width:0"><div><b>'+esc(aN(x.actId))+'</b> <span class="m">'+esc(subN(x.actId,x.subId))+(x.start?' · <bdi dir="ltr">'+x.start+'</bdi>':'')+'</span></div><div class="bar thin"><i style="width:'+pc+'%;background:'+aC(x.actId)+'"></i></div><div class="m">'+mm(r.got)+' / '+mm(r.need)+(!r.live?' · '+T('منتقل/لغو','moved/cancelled'):'')+'</div></div>'+(!r.done&&r.live?'<button class="chip" data-a="dy_play" data-id="'+x.actId+'" data-sub="'+esc(x.subId||'')+'" aria-label="start">▶</button>':'')+'</div>'}).join('');
  return h+'<div class="row" style="margin-top:6px"><button class="chip" data-a="tmr_open" data-d="'+d+'">✎ '+T('ویرایش برنامه','Edit plan')+'</button></div></div>'}
H.dy_chk=e=>{const it=(plan(todayISO())||[]).find(x=>x.id===e.dataset.i);if(!it)return;it.status=it.status==='done'?'todo':'done';save();render()};
H.dy_play=e=>{if(['running','paused','ended'].includes(db.timer.state))return say(T('یک تایمر فعال است؛ اول آن را پایان بده','A timer is already running — finish it first'),1);TM.start('sw',e.dataset.id,e.dataset.sub||'',0);render()};

/* ---------- بازگشت به برنامه ---------- */
function secRescue(){const d=todayISO(),I=dayInfo(d),nm=nowMin();if(!I.open.length||nm<12*60||nm>22*60)return'';
  const left=I.open.reduce((s,r)=>s+(r.need-r.got),0),free=Math.max(0,23*60+30-nm);if(left<=0)return'';
  const behind=left>free*0.7||(I.pct<30&&nm>15*60);if(!behind)return'';
  return'<div class="c dyc" style="border-inline-start:4px solid #f59e0b">'+daniH('🛟','برگرد به برنامه','Get back on track')
   +'<p>'+T('هنوز '+mm(left)+' از برنامه مانده و تا پایان شب حدود '+mm(free)+' وقت داری. روز هنوز از دست نرفته؛ یکی از این‌ها را بزن:','Still '+mm(left)+' of the plan left and about '+mm(free)+' until tonight. The day isn’t lost — pick one:')+'</p>'
   +'<div class="row"><button class="p" data-a="dy_resc" data-m="arr">🕘 '+T('بقیه را در ساعت‌های خالی بچین','Arrange the rest in free time')+'</button><button class="chip" data-a="dy_resc" data-m="one">▶ '+T('فقط مهم‌ترین کار را الان شروع کن','Just start the most important one now')+'</button><button class="chip" data-a="dy_resc" data-m="mv">➡ '+T('بقیه را به فردا ببر','Move the rest to tomorrow')+'</button></div></div>'}
H.dy_resc=e=>{const d=todayISO(),I=dayInfo(d),m=e.dataset.m,goal=(db.days[d]||{}).goal;
  const ord=I.open.slice().sort((a,b)=>(aN(b.x.actId)===goal)-(aN(a.x.actId)===goal));
  if(m==='one'){const r=ord[0];if(!r)return;if(['running','paused','ended'].includes(db.timer.state))return say(T('یک تایمر فعال است','A timer is already running'),1);if(window.daniPomoStart)window.daniPomoStart(r.x.actId);else TM.start('sw',r.x.actId,r.x.subId||'',0);say(T('شروع شد؛ فقط ۲۵ دقیقه اول را برو.','Started — just get through the first 25 minutes.'));render();return}
  if(m==='mv'){const t1=addD(d,1);db.plans[t1]=db.plans[t1]||[];ord.forEach(r=>{db.plans[t1].push({id:uid(),actId:r.x.actId,subId:r.x.subId||'',start:'',end:'',goal:Math.max(5,r.need-r.got),status:'todo',reason:'carried'});r.x.status='carried'});save();say(T('به برنامه‌ی فردا رفت ✓','Moved to tomorrow ✓'));render();return}
  /* چیدن در ساعت‌های خالی */
  let cur=Math.ceil((nowMin()+5)/5)*5;const END=23*60+30,busy=(plan(d)||[]).filter(x=>x.start&&x.end&&tm(x.start)>=cur&&!['done','canceled','carried'].includes(x.status)&&!ord.some(r=>r.x===x)).map(x=>[tm(x.start),tm(x.start)+(+x.goal||dur(x.start,x.end))]).sort((a,b)=>a[0]-b[0]);
  let placed=0,fail=0;ord.forEach(r=>{const need=Math.max(5,r.need-r.got);let ok=false;for(let g=0;g<20&&!ok;g++){const b=busy.find(z=>z[1]>cur&&z[0]<cur+need);if(b){cur=b[1]+5;continue}if(cur+need>END)break;r.x.start=hh(cur);r.x.end=hh(cur+need);r.x.goal=need+r.got;cur+=need+10;ok=true}ok?placed++:fail++});
  save();say(T(fa(placed)+' کار چیده شد'+(fail?' · '+fa(fail)+' کار جا نشد؛ به فردا ببر':''),placed+' placed'+(fail?' · '+fail+' did not fit — move to tomorrow':'')));render()};

/* ---------- ثبت یکپارچه ---------- */
let TR={mode:'sw',act:'',min:25};
const tOn=()=>['running','paused','ended'].includes((db.timer||{}).state);
const pmPh=()=>{try{return db.set.pomo&&db.set.pomo.ph}catch(e){return''}};
function secTrack(){const t=db.timer||{},on=tOn(),ph=pmPh(),pmOn=ph==='work'||ph==='break'||ph==='long';
  let h='<div class="c dyc" id="dytr">'+daniH('⏱','ثبت فعالیت','Track an activity');
  if(on){const cd=t.mode==='cd';
    h+='<div class="row" style="align-items:center"><span style="font-size:1.1em">● <b>'+esc(aN(t.actId))+'</b> <span class="m">'+esc(subN(t.actId,t.subId))+'</span></span><span class="sp"></span><span class="m">'+({running:T('در حال اجرا','running'),paused:T('مکث','paused'),ended:T('تمام شد','finished')}[t.state])+(pmOn&&ph==='work'?' · 🍅':'')+'</span></div><div class="big" id="tmd" style="text-align:center">00:00:00</div>'
     +'<div class="row" style="justify-content:center">'+(t.state==='running'?'<button data-a="dy_tp">⏸ '+T('مکث','Pause')+'</button>':t.state==='paused'?'<button class="p" data-a="dy_tr">▶ '+T('ادامه','Resume')+'</button>':'')+'<button class="p" data-a="dy_tf">⏹ '+T('پایان و ثبت','Finish & log')+'</button>'
     +(cd&&t.state!=='ended'?'<button class="chip" data-a="dy_tadd" data-m="5">+۵</button>':'')+(!cd&&t.state==='running'&&!pmOn?'<button class="chip" data-a="dy_topm">🍅 '+T('تبدیل به پومودورو','Make it a Pomodoro')+'</button>':'')+'<button class="chip" data-a="dy_tc">✕</button></div>';
    if(pmOn&&window.daniPomoCard)h+='<div style="margin-top:8px">'+window.daniPomoCard().replace('<div class="c" id="pmcard">','<div id="pmcard">')+'</div>';
    return h+'</div>'}
  if(pmOn&&window.daniPomoCard)return h+window.daniPomoCard().replace('<div class="c" id="pmcard">','<div id="pmcard">')+'</div>';
  const M=[['sw','▶',T('کرنومتر','Stopwatch')],['cd','⏳',T('شمارش‌معکوس','Countdown')],['pm','🍅',T('پومودورو','Pomodoro')],['ql','⚡',T('ثبت سریع','Quick log')]];
  h+='<div class="row">'+M.map(m=>'<button class="chip '+(TR.mode===m[0]?'on':'')+'" data-a="dy_mode" data-m="'+m[0]+'">'+m[1]+' '+m[2]+'</button>').join('')+'</div>';
  if(TR.mode==='ql'){let q='';try{q=window.daniQuickLog?window.daniQuickLog():''}catch(e){}return h+'<div style="margin-top:8px">'+q+'</div></div>'}
  const pi=(plan(todayISO())||[]).filter(x=>!['done','canceled','carried'].includes(x.status)).map(x=>x.actId),ids=[...new Set(pi.concat(recent(8)))].slice(0,8);
  if(!TR.user||!TR.act||!act(TR.act))TR.act=ids[0]||(db.acts.find(a=>a.active&&!a.arch&&a.cat!=='sleep')||{}).id||'';
  h+='<div class="m" style="margin-top:8px">'+T('چه کاری؟','What are you doing?')+(pi.length?' <small>('+T('اول: از برنامه‌ی امروز','first: from today\'s plan')+')</small>':'')+'</div><div class="row">'+ids.map(id=>'<button class="chip '+(TR.act===id?'on':'')+'" data-a="dy_pick" data-id="'+id+'">'+(pi.includes(id)?'🎯 ':'')+esc(aN(id))+'</button>').join('')+'</div>'
   +'<div class="row" style="margin-top:4px"><select id="dy-a" data-dya style="flex:1;min-width:0">'+aOpts(TR.act)+'</select></div>';
  if(TR.mode==='cd')h+='<div class="row" style="margin-top:6px">'+[15,25,45,60,90].map(n=>'<button class="chip '+(TR.min===n?'on':'')+'" data-a="dy_min" data-n="'+n+'">'+fa(n)+'</button>').join('')+'<input type="number" id="dy-m" min="1" max="600" value="'+TR.min+'" style="width:70px"><span class="m">'+T('دقیقه','min')+'</span></div>';
  h+='<div class="row" style="margin-top:8px"><button class="p" data-a="dy_go2" style="flex:1">'+({sw:'▶ '+T('شروع کرنومتر','Start stopwatch'),cd:'⏳ '+T('شروع شمارش‌معکوس','Start countdown'),pm:'🍅 '+T('شروع پومودورو','Start Pomodoro')}[TR.mode])+'</button></div>'
   +'<p class="m">'+T('بعداً هم می‌توانی کرنومتر در حال اجرا را به پومودورو تبدیل کنی.','You can turn a running stopwatch into a Pomodoro later.')+'</p></div>';return h}
H.dy_mode=e=>{TR.mode=e.dataset.m;render()};H.dy_pick=e=>{TR.act=e.dataset.id;TR.user=1;render()};H.dy_min=e=>{TR.min=+e.dataset.n;render()};
document.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.dya!==undefined){TR.act=t.value;TR.user=1;render()}else if(t&&t.id==='dy-m')TR.min=Math.max(1,Math.min(600,+t.value||25))});
H.dy_go2=()=>{const m=(document.getElementById('dy-m')||{}).value;if(m)TR.min=Math.max(1,Math.min(600,+m||25));if(!TR.act)return say(T('یک فعالیت انتخاب کن','Pick an activity'),1);
  if(TR.mode==='pm'&&window.daniPomoStart)window.daniPomoStart(TR.act);else if(TR.mode==='cd')TM.start('cd',TR.act,'',TR.min);else TM.start('sw',TR.act,'',0);render()};
H.dy_tp=()=>{TM.pause();render()};H.dy_tr=()=>{TM.resume();render()};H.dy_tf=()=>{TM.finish();render()};H.dy_tc=()=>{TM.cancel();render()};H.dy_tadd=e=>{TM.add(+e.dataset.m||5);render()};
H.dy_topm=()=>{const t=db.timer,a=t.actId;if(!window.daniPomoStart)return;if(TM.finish()){window.daniPomoStart(a);say(T('کار ثبت شد و پومودورو شروع شد 🍅','Logged — Pomodoro started 🍅'))}render()};

/* ---------- سایر کارت‌ها ---------- */
function secTl(){const d=todayISO();return'<div class="c dyc">'+daniH('🕒','تایم‌لاین امروز','Today\'s timeline')+tlHTML(d)+'<details style="margin-top:6px"><summary class="m">'+T('فهرست ثبت‌ها','Entries')+'</summary>'+logTL(d)+'</details></div>'}
function secEd(){const I=dayInfo(todayISO()),mn=sum(E(todayISO())||[]),late=nowMin()>=18*60;
  return'<div class="c dyc">'+daniH('📈','نتیجه‌ی امروز','Today\'s result')+'<div class="row" style="align-items:baseline"><b style="font-size:1.4em">'+mm(mn)+'</b><span class="m">'+T('ثبت‌شده','logged')+(I.need?' · '+fa(I.pct)+(LANGEN()?'%':'٪')+' '+T('برنامه','of plan'):'')+'</span></div>'
   +'<div class="row"><button class="'+(late?'p':'chip')+'" data-a="dy_go" data-p="res" data-r="eod">📈 '+T('نتیجه‌ی کامل','Full result')+'</button><button class="chip" data-a="tmr_open">🌙 '+T('برنامه‌ی فردا','Plan tomorrow')+'</button></div></div>'}
const SETUP=[['🎨',T('تم و ظاهر','Theme & look'),{p:'set',s:'look'}],['🔔',T('اعلان و زنگ (اجازه‌ی اعلان، ساعت‌ها)','Notifications & alarms'),{p:'set',s:'time'}],['🌙',T('ساعت اعلان «برنامه‌ی فردا» و «نتیجه»','Tomorrow-plan & result times'),'tmrcfg'],['💾',T('پشتیبان، همگام‌سازی و قفل','Backup, sync & lock'),{p:'set',s:'data'}],['🧭',T('راهنمای شروع','Start guide'),'ob']];
function secSetup(){if(DY().setup)return'';return'<details class="c dyc" id="dysp"><summary style="cursor:pointer">'+daniH('🧰','راه‌اندازی (یک‌بار)','Set-up (one time)')+'</summary><p class="m">'+T('این‌ها را یک‌بار تنظیم کن؛ بعدش از اینجا کنار می‌روند و همیشه در «بیشتر ← راه‌اندازی» می‌مانند.','Set these once; afterwards they step aside and always stay under “More → Set-up”.')+'</p>'
   +SETUP.map((s,i)=>'<button class="chip" style="display:block;width:100%;text-align:start;margin:4px 0" data-a="dy_su" data-i="'+i+'">'+s[0]+' '+s[1]+'</button>').join('')+'<div class="row" style="margin-top:6px"><button class="p" data-a="dy_sudone">✓ '+T('تنظیم شد، جمعش کن','All set — tuck it away')+'</button></div></details>'}
H.dy_su=e=>{const s=SETUP[+e.dataset.i][2];if(s==='ob'){if(H.ob_open)H.ob_open();return}if(s==='tmrcfg'){window.daniPlanOpen();setTimeout(()=>{const b=document.querySelector('[data-a="tp_cfg"]');if(b)b.click()},50);return}page=s.p;stt=s.s;render()};
H.dy_sudone=()=>{DY().setup=1;save();render()};
const SECS={sp:[secSetup,T('راه‌اندازی','Set-up')],pl:[secPlan,T('برنامه‌ی امروز','Today\'s plan')],tr:[secTrack,T('ثبت فعالیت','Track')],tl:[secTl,T('تایم‌لاین','Timeline')],ed:[secEd,T('نتیجه‌ی امروز','Result')]};
H.dy_cfg=()=>{window.__dyCfg=!window.__dyCfg;render()};
H.dy_sec=e=>{const k=e.dataset.k,h=DY().hide,i=h.indexOf(k);if(i>=0)h.splice(i,1);else h.push(k);save();render()};
H.dy_mv=e=>{const o=DY().order,i=o.indexOf(e.dataset.k),j=i+(+e.dataset.n);if(i<0||j<0||j>=o.length)return;const t=o[i];o[i]=o[j];o[j]=t;save();render()};
H.dy_gp=()=>{DY().gaps=DY().gaps?0:1;save();render()};
function cfgPanel(){const o=DY();return'<div class="c dyc">'+daniH('⚙','شخصی‌سازی صفحه‌ی امروز','Customize Today')+o.order.map((k,i)=>'<div class="row" style="margin:3px 0"><button class="chip '+(o.hide.includes(k)?'':'on')+'" data-a="dy_sec" data-k="'+k+'" style="flex:1;text-align:start">'+(o.hide.includes(k)?'☐ ':'☑ ')+SECS[k][1]+'</button><button class="chip" data-a="dy_mv" data-k="'+k+'" data-n="-1" '+(i?'':'disabled')+'>↑</button><button class="chip" data-a="dy_mv" data-k="'+k+'" data-n="1" '+(i<o.length-1?'':'disabled')+'>↓</button></div>').join('')
   +'<div class="row" style="margin-top:6px"><button class="chip '+(o.gaps?'on':'')+'" data-a="dy_gp">🕳 '+T('نشان‌دادن بازه‌های ثبت‌نشده','Show unlogged gaps')+'</button></div></div>'}
PG.day=function(){const hr=new Date().getHours(),ph=hr<5?T('شب','Night'):hr<12?T('صبح','Morning'):hr<17?T('ظهر','Midday'):hr<20?T('عصر','Evening'):T('شب','Night');
  let h='<div class="row" style="align-items:center;margin:2px 0 6px"><b style="font-size:1.25em">'+ph+' · '+T('امروز','Today')+'</b><span class="sp"></span><button class="chip" data-a="dy_cfg" aria-label="customize">⚙</button></div>';
  if(window.__dyCfg)h+=cfgPanel();
  try{h+=secRescue()}catch(e){console.error('rescue',e)}
  DY().order.forEach(k=>{if(DY().hide.includes(k))return;try{h+=SECS[k][0]()}catch(e){console.error('day '+k,e)}});return h};

/* ---------- نتیجه‌ی امروز (تب در نتیجه‌گیری) ---------- */
function eodPage(){const d=todayISO(),I=dayInfo(d),dd=db.days[d]||{},es=E(d)||[],tot=sum(es),t=todayISO();
  const prev=[];for(let i=1;i<=7;i++){const m=sum(E(addD(t,-i))||[]);if(m>0)prev.push(m)}const avg=prev.length?Math.round(prev.reduce((a,b)=>a+b,0)/prev.length):0;
  const planned=new Set(I.rows.map(r=>r.x.actId)),extra={};es.forEach(e=>{if(!planned.has(e.actId)&&act(e.actId)&&act(e.actId).cat!=='sleep')extra[e.actId]=(extra[e.actId]||0)+e.min});
  let h='<div class="c">'+daniH('📈','نتیجه‌ی امروز','Today\'s result')+'<div class="m">'+fmtDL(d)+'</div><div class="row" style="align-items:baseline;gap:14px;flex-wrap:wrap"><div><b style="font-size:1.8em">'+mm(tot)+'</b><div class="m">'+T('ثبت‌شده','logged')+'</div></div>'
   +(I.need?'<div><b style="font-size:1.8em;color:'+(I.pct>=80?'#22c55e':I.pct>=50?'#f59e0b':'#ef4444')+'">'+fa(I.pct)+(LANGEN()?'%':'٪')+'</b><div class="m">'+T('از برنامه','of the plan')+'</div></div>':'')
   +(avg?'<div><b style="font-size:1.8em">'+(tot>=avg?'▲':'▼')+' '+mm(Math.abs(tot-avg))+'</b><div class="m">'+T('نسبت به میانگین ۷ روز','vs 7-day average')+'</div></div>':'')+'</div></div>';
  if(I.rows.length){h+='<div class="c">'+daniH('🎯','برنامه در برابر انجام‌شده','Plan vs done')+I.rows.map(r=>{const pc=r.need?Math.min(100,Math.round(r.got/r.need*100)):0;return'<div class="dyp'+(r.done?' dn':'')+'"><span>'+(r.done?'✅':r.live?'⬜':'➡')+'</span><div style="flex:1;min-width:0"><b>'+esc(aN(r.x.actId))+'</b> <span class="m">'+mm(r.got)+' / '+mm(r.need)+'</span><div class="bar thin"><i style="width:'+pc+'%;background:'+aC(r.x.actId)+'"></i></div></div></div>'}).join('');
    if(I.open.length)h+='<div class="row" style="margin-top:6px"><button class="p" data-a="eod_carry">➡ '+T('کارهای ناتمام را به فردا ببر','Move unfinished to tomorrow')+'</button></div>';h+='</div>'}
  const ex=Object.entries(extra).sort((a,b)=>b[1]-a[1]);if(ex.length)h+='<div class="c">'+daniH('➕','کارهای خارج از برنامه','Off-plan work')+ex.map(([id,v])=>'<div class="row"><span style="color:'+aC(id)+'">●</span><span style="flex:1">'+esc(aN(id))+'</span><b>'+mm(v)+'</b></div>').join('')+'</div>';
  h+='<div class="c">'+daniH('🕒','تایم‌لاین','Timeline')+tlHTML(d,{noGapNote:0})+'</div>';
  h+='<div class="c">'+daniH('📝','بازبینی کوتاه','Quick reflection')+['learned|✅ '+T('چه چیزی خوب پیش رفت؟','What went well?'),'barrier|🚧 '+T('چه چیزی مانع شد یا حاشیه‌ساز بود؟','What got in the way?'),'tomorrow|➡ '+T('یادداشت برای فردا','Note for tomorrow')].map(x=>{const[k,l]=x.split('|');return'<label class="m" style="display:block;margin-top:6px">'+l+'</label><input data-eod="'+k+'" dir="auto" style="width:100%" maxlength="300" value="'+esc(dd[k]||'')+'">'}).join('')
   +'<div class="row" style="margin-top:10px"><button class="p" data-a="tmr_open" style="flex:1">🌙 '+T('برنامه‌ی فردا','Plan tomorrow')+'</button></div></div>';return h}
document.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.eod){const dd=db.days[todayISO()]=db.days[todayISO()]||{};dd[t.dataset.eod]=String(t.value||'').slice(0,300);save()}});
H.eod_carry=()=>{const d=todayISO(),I=dayInfo(d),t1=addD(d,1);db.plans[t1]=db.plans[t1]||[];I.open.forEach(r=>{db.plans[t1].push({id:uid(),actId:r.x.actId,subId:r.x.subId||'',start:'',end:'',goal:Math.max(5,r.need-r.got),status:'todo',reason:'carried'});r.x.status='carried'});save();say(T('به فردا رفت ✓','Moved to tomorrow ✓'));render()};
try{if(typeof RT!=='undefined'&&!RT.some(x=>x[0]==='eod'))RT.unshift(['eod',T('نتیجه‌ی امروز','Today\'s result')])}catch(e){}
{const _r=PG.res;PG.res=function(){if(typeof rt!=='undefined'&&rt==='eod')return tabBar(RT,rt,'r')+eodPage();return _r.apply(this,arguments)}}

/* ---------- صفحه‌ی «بیشتر / راه‌اندازی» ---------- */
PG.mx=function(){const mod=(typeof MODULES!=='undefined'?MODULES:[]).filter(m=>modOn(m.id)&&!['dl','hab','rem'].includes(m.id));
  const b=(l,a)=>'<button class="chip" data-a="dy_go" '+a+' style="margin:3px">'+l+'</button>';
  let h='<div class="c">'+daniH('🧭','شکل منو','Menu style')+'<div class="row"><button class="chip '+(simple()?'on':'')+'" data-a="nv_set" data-m="simple">'+T('ساده (امروز ← فردا ← نتیجه)','Simple (Today → Tomorrow → Result)')+'</button><button class="chip '+(simple()?'':'on')+'" data-a="nv_set" data-m="classic">'+T('کلاسیک (منوی قبلی)','Classic (previous menu)')+'</button></div><p class="m">'+T('هیچ‌چیز حذف نمی‌شود؛ فقط جای نمایش عوض می‌شود.','Nothing is removed — only where it is shown changes.')+'</p></div>';
  h+='<div class="c">'+daniH('🧰','ابزارهای من','My tools')+b('🏠 '+T('خانه','Home'),'data-p="home"')+b('🗂 '+T('میزکار','Workspace'),'data-p="dash" data-d="today"')+b('🎯 '+T('فعالیت‌ها','Activities'),'data-p="dash" data-d="acts"')+b('🏁 '+T('اهداف','Goals'),'data-p="dash" data-d="goals"')+b('📅 '+T('تقویم','Calendar'),'data-p="dash" data-d="cal"')+b('📝 '+T('یادداشت‌ها','Notes'),'data-p="dash" data-d="notes"')+b('🔎 '+T('جست‌وجو','Search'),'data-p="dash" data-d="find"')+b('⏳ '+T('موعدها','Deadlines'),'data-p="dl"')+b('✅ '+T('عادت‌ها','Habits'),'data-p="hab"')+b('🔔 '+T('یادآوری‌ها','Reminders'),'data-p="rem"')+'</div>';
  if(mod.length)h+='<div class="c">'+daniH('🧩','بخش‌های دیگر','Other sections')+mod.map(m=>b(esc(BI_NAV[m.id]?T(BI_NAV[m.id][1],BI_NAV[m.id][0]):m.name),'data-p="'+esc(m.id)+'"')).join('')+'</div>';
  h+='<div class="c">'+daniH('⚙','راه‌اندازی و تنظیمات','Set-up & settings')+b('🎨 '+T('ظاهر','Look'),'data-p="set" data-s="look"')+b('🔔 '+T('زمان و اعلان','Time & notifications'),'data-p="set" data-s="time"')+b('💾 '+T('داده‌ها، همگام‌سازی، قفل','Data, sync, lock'),'data-p="set" data-s="data"')+'<button class="chip" data-a="dy_su" data-i="2" style="margin:3px">🌙 '+T('ساعت اعلان فردا و نتیجه','Tomorrow & result times')+'</button><button class="chip" data-a="dy_su" data-i="4" style="margin:3px">🧭 '+T('راهنمای شروع','Start guide')+'</button>'
   +(DY().setup?'<button class="chip" data-a="dy_sureset" style="margin:3px">↺ '+T('نمایش دوباره‌ی راه‌اندازی در «امروز»','Show set-up again on Today')+'</button>':'')+'</div>';return h};
H.dy_sureset=()=>{DY().setup=0;save();render()};
/* در تنظیمات ← ظاهر هم قابل انتخاب باشد */
{const _sp=setPage;setPage=function(){const h=_sp.apply(this,arguments);return(typeof h==='string'&&typeof stt!=='undefined'&&stt==='look')?h+'<div class="c" id="nvcard">'+daniH('🧭','شکل منو','Menu style')+'<div class="row"><button class="chip '+(simple()?'on':'')+'" data-a="nv_set" data-m="simple">'+T('ساده','Simple')+'</button><button class="chip '+(simple()?'':'on')+'" data-a="nv_set" data-m="classic">'+T('کلاسیک','Classic')+'</button></div></div>':h}}
try{const s=document.createElement('style');s.textContent='.dyc{margin-top:10px}.dyp{display:flex;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid var(--b,#8883)}.dyp.dn b{opacity:.65}.dyp.off{opacity:.55}.dyex{margin:6px 0;padding:6px 10px;border-radius:10px;background:rgba(245,158,11,.1)}.bar.thin{height:5px;margin:3px 0}'
 +'.dytl{margin-top:6px}.dytr{position:relative;height:12px;margin-bottom:4px;border-radius:6px;background:rgba(127,127,127,.12)}.dytr.big{height:30px}.dytr i{position:absolute;top:0;bottom:0;border-radius:4px}.dytr i.pb{opacity:.55;border:1px dashed currentColor;background-clip:padding-box}.dytr .gp{position:absolute;top:0;bottom:0;cursor:pointer;background:repeating-linear-gradient(45deg,rgba(245,158,11,.5) 0 4px,transparent 4px 8px);border:1px solid rgba(245,158,11,.7);border-radius:4px;z-index:2}.dytr .nw{position:absolute;top:-3px;bottom:-3px;width:2px;background:#ef4444;z-index:3}'
 +'.dyax{position:relative;height:14px;font-size:10px;opacity:.7}.dyax span{position:absolute;transform:translateX(-50%)}';document.head.appendChild(s)}catch(e){}
/* ساعت ثبت‌شده‌ی بالای صفحه هر ثانیه تازه شود (tick() خودش #clk را به‌روز می‌کند) */
try{setInterval(()=>{if(page==='day'&&!tOn()){const c=document.getElementById('clk');if(c)c.textContent=fa(nowHM())}},15000)}catch(e){}
/* وقتی تایمر در حال اجراست، tick() لازم است */
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{if(page==='day'&&tOn())ensureTick()}catch(e){}return r}}
})();
