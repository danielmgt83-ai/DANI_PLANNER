'use strict';
/* DANI · guide2.js — «راهنمای شروع» v2 (طراحی دوباره، تمام‌صفحه) + «راهنمای همین صفحه» برای دکمه‌ی ؟
   ترتیب قدم‌ها (همان ترتیب خواسته‌ی کاربر): زبان (انگلیسی) ← تقویم و روز ← ۱ پروژه‌ها ← ۲ برنامه‌ی من ← ۳ توقع‌ها ← ۴ ثبت ← ۵ نتیجه ← جمع‌بندی.
   هر قدم داده‌ی واقعی می‌سازد (پروژه با بخش‌ها و موعد، ساعت پر، توقع هفتگی) یا به صفحه‌ی واقعی می‌برد؛ وضعیت ✓ از داده‌ی واقعی خوانده می‌شود. هیچ اطلاعات شخصی نمی‌خواهد.
   وضعیت: db.set.gd {i,done,fin,auto}. ورودی‌ها: H.ob_open، H.ob_hub، H.ob_reset، window.daniOnboard.hub (همه به همین راهنما). */
(function(){
const T=window.daniT;
const GD=()=>{const s=db.set;if(!s.gd||typeof s.gd!=='object')s.gd={i:0,done:{},fin:0};if(!s.gd.done)s.gd.done={};return s.gd};
const PJs=()=>{try{const a=zmg('pj',()=>({v:'w',today:1}));zarr(a,'items');return a.items}catch(e){return[]}};
const BZs=()=>{const s=db.set;if(!s.bz||typeof s.bz!=='object')s.bz={};if(!Array.isArray(s.bz.items))s.bz.items=[];return s.bz.items};
const S={};            /* مقدار فیلدها بین بازرسم‌ها */
const q=id=>document.getElementById(id);
const val=id=>{const e=q(id);return e?e.value:(S[id]||'')};
const say=(m,b)=>{try{toast(m,b)}catch(e){}};
/* ---------- قدم‌ها ---------- */
const hasPerm=()=>{try{return Notification.permission==='granted'}catch(e){return false}};
const dueOf=p=>{try{if(p.dl){const d=zDL().items.find(x=>x.id===p.dl);if(d&&d.dt)return d.dt}}catch(e){}return p.due||''};
const nf=x=>fa(Math.round(x*10)/10);
function calc(p){const w=+p.wk||0,d=dueOf(p),t=todayISO();
 if(!w)return'<span class="m">'+T('ساعت هفتگی را بنویس تا حساب شود.','Type weekly hours to see the maths.')+'</span>';
 let h='<b>'+T('هر روز: ','Per day: ')+nf(w/7)+T(' ساعت',' h')+'</b> · '+T('هفته: ','week: ')+nf(w)+T(' ساعت',' h')+' · '+T('ماه: ','month: ')+nf(w*30/7)+T(' ساعت',' h');
 if(d){const left=Math.max(0,Math.round((new Date(d+'T00:00:00')-new Date(t+'T00:00:00'))/864e5));
  if(left>0){const tot=w*left/7;h+='<br>📅 '+T('تا موعد ','Until the deadline ')+fa(left)+T(' روز مانده (حدود ',' days left (about ')+nf(left/7)+T(' هفته). اگر هر هفته ',' weeks). If you do ')+nf(w)+T(' ساعت وقت بگذاری، مجموع: ',' h every week, the total is: ')+'<b>'+nf(tot)+T(' ساعت',' h')+'</b>.';
   if(+p.hrs>0){const need=+p.hrs;h+='<br>🎯 '+T('هدف کل ',' Target ')+nf(need)+T(' ساعت: ',' h: ')+(tot>=need?'✅ '+T('کافی است.','enough.'):'⚠ '+T('کم است؛ باید هفته‌ای ',' not enough; you need ')+nf(need/(left/7))+T(' ساعت باشد.',' h/week.'))}}
  else h+='<br>⚠ '+T('موعد گذشته است.','The deadline has passed.')}
 else h+='<br><span class="m">'+T('موعد ندارد؛ برای حساب تا موعد، در «پروژه‌ها» موعد بگذار.','No deadline; add one in Projects to see totals until then.')+'</span>';
 return h}
const STEPS=[
 {k:'lang',i:'🌐',t:['Language','Language'],ok:()=>true,
  body:()=>'<h2 style="margin:6px 0 2px">Welcome to DANI 👋</h2><p class="m">Pick your language. You can change it any time in Settings.<br>زبان را انتخاب کن؛ هر وقت خواستی در تنظیمات عوض می‌شود.</p>'
   +'<div class="row" style="margin-top:10px">'+[['en','English'],['fa','فارسی'],['bi','فارسی + English']].map(x=>'<button class="chip '+(db.set.lang===x[0]?'on':'')+'" data-a="g2_lang" data-v="'+x[0]+'" style="padding:12px 16px">'+x[1]+'</button>').join('')+'</div>'},
 {k:'cal',i:'📅',t:['تقویم و روز','Calendar & day'],ok:()=>!!db.set.cal,
  body:()=>'<p class="m">'+T('هیچ اطلاعات شخصی لازم نیست؛ فقط چند تنظیم پایه.','No personal info needed — just a few basics.')+'</p>'
   +'<label>'+T('تقویم','Calendar')+'</label><div class="row"><button class="chip '+(db.set.cal==='j'?'on':'')+'" data-a="g2_cal" data-v="j">'+T('شمسی','Jalali')+'</button><button class="chip '+(db.set.cal==='g'?'on':'')+'" data-a="g2_cal" data-v="g">'+T('میلادی','Gregorian')+'</button></div>'
   +'<div class="row" style="margin-top:8px"><div><label>'+T('شروع روز','Day starts')+'</label><input type="time" value="'+esc(db.set.ds||'06:00')+'" data-ch="sf" data-f="ds"></div><div><label>'+T('پایان روز','Day ends')+'</label><input type="time" value="'+esc(db.set.de||'23:00')+'" data-ch="sf" data-f="de"></div></div>'
   +'<p class="m">'+T('شروع و پایان روز یعنی اعلان‌ها و پیشنهادها فقط در همین بازه می‌آیند.','Notifications and suggestions stay inside this window.')+'</p>'},
 {k:'pj',i:'🎓',t:['۱ · پروژه‌ها','1 · Projects'],ok:()=>PJs().length>0,
  body:()=>{const L=PJs();
   return'<p>'+T('هر هدف بزرگ یک پروژه است. مثال: «MBA» = ریاضی + GMAT + زبان، و موعدش روز آزمون. موعد اختیاری است؛ کار و ورزش هم می‌توانند پروژه باشند.','Each big goal is a project. Example: “MBA” = maths + GMAT + English, deadline = exam day. A deadline is optional; a job or sport can be a project too.')+'</p>'
   +(L.length?'<div class="m" style="margin:6px 0">'+L.map(p=>'✓ <b>'+esc(p.name)+'</b> · '+fa((p.parts||[]).length)+' '+T('بخش','parts')).join('<br>')+'</div>':'')
   +'<div class="c" style="margin:8px 0"><b>'+(L.length?T('پروژه‌ی دیگر','Another project'):T('اولین پروژه','Your first project'))+'</b>'
   +'<label>'+T('نام پروژه','Project name')+'</label><input id="g2-pn" placeholder="'+T('مثلاً MBA','e.g. MBA')+'" style="width:100%">'
   +'<label>'+T('بخش‌ها (هر خط یکی؛ اختیاری: «نام | ساعت در هفته»)','Parts (one per line; optional “name | hours per week”)')+'</label><textarea id="g2-pp" rows="4" placeholder="'+T('ریاضی | 5\nGMAT | 4\nزبان انگلیسی | 3','Maths | 5\nGMAT | 4\nEnglish | 3')+'" style="width:100%"></textarea>'
   +'<label>'+T('نوع کار در هر بخش','Work types in each part')+'</label><div class="row">'+[['مرور','Review'],['آزمون','Test'],['ویدیو','Video'],['تمرین','Practice']].map((x,n)=>'<label class="chip"><input type="checkbox" class="g2-ty" value="'+esc(T(x[0],x[1]))+'" '+(n<3?'checked':'')+'> '+T(x[0],x[1])+'</label>').join('')+'</div>'
   +'<label>'+T('موعد (اختیاری)','Deadline (optional)')+'</label>'+daniDF.html('g2-dl','')
   +'<div class="row" style="margin-top:10px"><button class="p" data-a="g2_pj">＋ '+T('ساخت پروژه','Create project')+'</button></div></div>'
   +(L.length?'<div class="row"><button class="chip" data-a="g2_pje">✎ '+T('ویرایش دقیق (عادت، یادآور، ساعت)','Fine-tune (habits, reminders, hours)')+'</button></div>':'')}},
 {k:'sch',i:'⛔',t:['۲ · برنامه‌ی من','2 · My schedule'],ok:()=>BZs().length>0,
  body:()=>{const L=BZs();
   return'<p>'+T('کارهایی را بنویس که برنامه نباید مزاحمشان شود: کلاس، کار، جلسه‌ی هفتگی. در این ساعت‌ها اعلان نمی‌آید و کار نمی‌چیند. هر روز و هر ساعتی را هم می‌شود جدا برنامه‌ریزی کرد (کار فوری، قرار…).','Write what the planner must not disturb: class, job, weekly meeting. No notifications or scheduling then. You can still plan any day and hour separately (urgent task, appointment…).')+'</p>'
   +(L.length?'<div style="margin:6px 0">'+L.map(b=>'<div class="row" style="gap:6px"><span style="flex:1">✓ <b>'+esc(b.t)+'</b> <span class="m">'+esc(b.s)+'–'+esc(b.e)+' · '+((b.days||[]).length?(b.days||[]).map(d=>zWD[d]).join('، '):esc(b.date||''))+'</span></span><button class="chip" data-a="g2_bzd" data-id="'+esc(b.id)+'" aria-label="delete">✕</button></div>').join('')+'</div>':'')
   +'<div class="c" style="margin:8px 0"><label>'+T('عنوان','Title')+'</label><input id="g2-bt" placeholder="'+T('مثلاً کلاس زبان','e.g. English class')+'" style="width:100%">'
   +'<div class="row" style="margin:6px 0">'+WORDER.map(i=>'<label class="chip"><input type="checkbox" class="g2-bw" value="'+i+'"> '+zWD[i]+'</label>').join('')+'</div>'
   +'<div class="row"><div><label>'+T('از','From')+'</label><input type="time" id="g2-bs" value="08:00"></div><div><label>'+T('تا','To')+'</label><input type="time" id="g2-be" value="10:00"></div></div>'
   +'<div class="row" style="margin-top:8px"><button class="p" data-a="g2_bz">＋ '+T('افزودن ساعت پر','Add busy block')+'</button></div></div>'
   +'<div class="row"><button class="chip" data-a="g2_go" data-t="hab">✅ '+T('عادت‌ها','Habits')+'</button><button class="chip" data-a="g2_go" data-t="rem">🔔 '+T('یادآور و مناسبت‌ها (امتحان کوچک، تولد، قرار)','Reminders & occasions (small exam, birthday, appointment)')+'</button><button class="chip" data-a="g2_go" data-t="cal">📅 '+T('تقویم','Calendar')+'</button></div>'}},
 {k:'exp',i:'🎯',t:['۳ · توقع‌ها','3 · Expectations'],ok:()=>PJs().some(p=>+p.wk>0),
  body:()=>{const L=PJs();
   return'<p>'+T('بگو در هفته از هر پروژه چند ساعت انتظار داری؛ فردا هم همین‌جا برنامه‌ریزی می‌شود. موفقیت هر روز، هفته و ماه با همین سنجیده می‌شود.','Say how many hours per week you expect from each project; tomorrow is planned from this too. Success per day, week and month is judged against it.')+'</p>'
   +(L.length?L.map(p=>'<div class="row" style="gap:8px;margin:4px 0"><b style="flex:1;min-width:0">'+esc(p.name)+'</b><input type="number" min="0" step="0.5" value="'+(+p.wk||'')+'" data-g2w="'+esc(p.id)+'" style="width:80px" placeholder="0"> <span class="m">'+T('ساعت/هفته','h/week')+'</span></div><div class="m" id="g2c-'+esc(p.id)+'" style="margin:0 0 8px">'+calc(p)+'</div>').join(''):'<p class="m">'+T('اول یک پروژه بساز (قدم ۱).','Create a project first (step 1).')+'</p>')
   +'<div class="row" style="margin-top:10px"><button class="chip" data-a="g2_go" data-t="day">🗓 '+T('برنامه‌ی فردا / هر روز','Plan tomorrow / any day')+'</button><button class="chip" data-a="g2_go" data-t="exp">🎯 '+T('توقع ماه و بخش‌ها','Month & per-part goals')+'</button></div>'}},
 {k:'log',i:'⏱',t:['۴ · ثبت','4 · Track'],ok:()=>db.entries.length>0,
  body:()=>'<p>'+T('یک کارت «ثبت» با همه‌ی حالت‌ها در «خانه» است: کرنومتر، شمارش‌معکوس، پومودورو و ثبت دستی. بعد از هر ثبت می‌توانی امتیاز سریع بدهی. برای ثبت دقیق‌تر ساعت‌هایت، اجازه‌ی اعلان را بده؛ پرسش ساعتی «الان چه می‌کنی؟» با نسخه‌ی اپ اندروید می‌آید.','One “Track” card on Home has every mode: stopwatch, countdown, pomodoro and manual. After each log you can rate it quickly. Allow notifications so your hours stay accurate; the hourly “what are you doing?” check-in comes with the Android app.')+'</p>'
   +'<div class="row"><button class="'+(hasPerm()?'chip on':'p')+'" data-a="g2_perm">🔔 '+(hasPerm()?T('اعلان مجاز است ✓','Notifications allowed ✓'):T('اجازه‌ی اعلان','Allow notifications'))+'</button><button class="chip" data-a="g2_trk">⏱ '+T('برو به ثبت','Go to Track')+'</button></div>'},
 {k:'res',i:'📈',t:['۵ · نتیجه','5 · Results'],ok:()=>Object.keys(db.days||{}).some(d=>db.days[d]&&(db.days[d].learned||db.days[d].barrier)),
  body:()=>'<p>'+T('آخر هر روز نتیجه‌ی همان روز را می‌بینی، با مقایسه‌ی روزها، موانع و تعلل، و این‌که توقع‌هایت چقدر برآورده شد.','At the end of each day you see that day’s result, compared with earlier days, obstacles and procrastination, and how much of your expectations you met.')+'</p>'
   +'<div class="row"><button class="chip" data-a="g2_res" data-r="eod">📈 '+T('نتیجه‌ی امروز','Today\'s result')+'</button><button class="chip" data-a="g2_res" data-r="stats">📊 '+T('آمار و مقایسه','Stats & compare')+'</button></div>'},
 {k:'fin',i:'🎉',t:['جمع‌بندی','Summary'],ok:()=>!!GD().fin,
  body:()=>{const rows=[['pj',T('پروژه‌ها','Projects'),PJs().length+' '+T('پروژه','project(s)')],['sch',T('ساعت‌های پر','Busy blocks'),BZs().length+' '+T('مورد','item(s)')],['exp',T('توقع هفتگی','Weekly expectations'),PJs().filter(p=>+p.wk>0).length+' '+T('پروژه','project(s)')],['log',T('ثبت‌ها','Logs'),db.entries.length+' '+T('ثبت','log(s)')]];
   return'<p>'+T('آماده‌ای. هر وقت چیزی را گم کردی، دکمه‌ی ⚡ «دسترسی سریع» در خانه همه‌چیز را پیدا می‌کند و دکمه‌ی ؟ همین راهنما را دوباره باز می‌کند.','You are set. If you lose something, ⚡ Quick access on Home finds anything, and the ? button reopens this guide.')+'</p>'
   +rows.map(r=>{const st=STEPS.find(x=>x.k===r[0]);const ok=st.ok();return'<button class="chip" data-a="g2_goto" data-k="'+r[0]+'" style="display:flex;width:100%;text-align:start;margin:4px 0;gap:8px"><span>'+(ok?'✅':'⬜')+'</span><b style="flex:1">'+r[1]+'</b><span class="m">'+r[2]+'</span></button>'}).join('')
   +'<p class="m" style="margin-top:10px">'+T('برای تنظیم تم، اعلان و پشتیبان: تنظیمات.','Theme, notifications and backup: Settings.')+'</p><div class="row"><button class="chip" data-a="g2_set" data-s="look">🎨 '+T('تم','Theme')+'</button><button class="chip" data-a="g2_set" data-s="time">🔔 '+T('اعلان‌ها','Notifications')+'</button><button class="chip" data-a="g2_set" data-s="data">💾 '+T('پشتیبان','Backup')+'</button><button class="chip" data-a="g2_again">🔁 '+T('شروع دوباره از قدم ۱ (داده‌ات پاک نمی‌شود)','Restart from step 1 (your data stays)')+'</button></div>'}}
];
const I=()=>Math.max(0,Math.min(STEPS.length-1,GD().i|0));
/* ---------- نمایش تمام‌صفحه ---------- */
function css(){if(q('gd2-css'))return;const s=document.createElement('style');s.id='gd2-css';s.textContent='#gd2{position:fixed;inset:0;z-index:2147481000;background:var(--bg,#fff);color:var(--t,#111);display:flex;flex-direction:column}#gd2 .gh{padding:12px 14px 10px;border-bottom:1px solid var(--b,#ddd)}#gd2 .gp{height:5px;border-radius:4px;background:var(--b,#ddd);overflow:hidden;margin-top:8px}#gd2 .gp i{display:block;height:100%;background:var(--ac,#3b82f6);transition:width .25s}#gd2 .gb{flex:1;overflow:auto;padding:14px;width:100%;max-width:560px;margin:0 auto;box-sizing:border-box}#gd2 .gf{padding:10px 14px calc(10px + env(safe-area-inset-bottom));border-top:1px solid var(--b,#ddd);display:flex;gap:8px;width:100%;max-width:560px;margin:0 auto;box-sizing:border-box}#gd2 .gd{display:flex;gap:6px;overflow:auto;margin-top:8px}#gd2 .gd button{min-width:32px;height:32px;border-radius:50%;padding:0}@media (prefers-reduced-motion:reduce){#gd2 .gp i{transition:none}}';document.head.appendChild(s)}
function snap(){const o=q('gd2');if(!o)return;o.querySelectorAll('input[id],textarea[id],select[id]').forEach(e=>{S[e.id]=e.type==='checkbox'?e.checked:e.value})}
function draw(){css();snap();let o=q('gd2');if(!o){o=document.createElement('div');o.id='gd2';o.setAttribute('data-nobi','1');o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');document.body.appendChild(o);
    o.addEventListener('input',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.g2w){const p=PJs().find(x=>x.id===t.dataset.g2w),c=q('g2c-'+t.dataset.g2w);if(p&&c){p.wk=Math.max(0,+t.value||0);c.innerHTML=calc(p)}}});
    o.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.g2w){const p=PJs().find(x=>x.id===t.dataset.g2w);if(p){p.wk=Math.max(0,+t.value||0);save()}}});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&q('gd2'))close()})}
  const g=GD(),s=STEPS[I()],last=I()===STEPS.length-1,pct=Math.round((I()+1)/STEPS.length*100);
  o.innerHTML='<div class="gh"><div class="row" style="align-items:center"><b style="flex:1;font-size:1.05em">'+s.i+' '+T(s.t[0],s.t[1])+'</b><span class="m">'+fa(I()+1)+' / '+fa(STEPS.length)+'</span><button class="chip" data-a="g2_close" aria-label="close">✕</button></div><div class="gp"><i style="width:'+pct+'%"></i></div>'
    +'<div class="gd">'+STEPS.map((x,n)=>'<button class="chip '+(n===I()?'on':'')+'" data-a="g2_goto" data-n="'+n+'" title="'+esc(T(x.t[0],x.t[1]))+'">'+(x.ok()&&n<STEPS.length-1?'✓':fa(n+1))+'</button>').join('')+'</div></div>'
    +'<div class="gb">'+s.body()+'</div>'
    +'<div class="gf"><button data-a="g2_prev" '+(I()?'':'disabled')+'>'+T('قبلی','Back')+'</button><span class="sp" style="flex:1"></span>'+(last?'<button class="p" data-a="g2_fin">'+T('تمام ✓','Finish ✓')+'</button>':'<button class="chip" data-a="g2_skip">'+T('رد کردن','Skip')+'</button><button class="p" data-a="g2_next">'+T('بعدی','Next')+'</button>')+'</div>';
  o.querySelectorAll('input[id],textarea[id]').forEach(e=>{if(S[e.id]!==undefined){if(e.type==='checkbox')e.checked=!!S[e.id];else e.value=S[e.id]}});
  const b=o.querySelector('.gb');if(b)b.scrollTop=0}
function close(){const o=q('gd2');if(o)o.remove();render()}
const open=i=>{if(typeof i==='number')GD().i=i;draw()};
H.ob_open=()=>open();H.ob_hub=H.ob_open;
H.ob_reset=()=>{const g=GD();g.i=0;g.done={};g.fin=0;save();open(0)};
try{window.daniOnboard=window.daniOnboard||{};window.daniOnboard.hub=()=>open();window.daniOnboard.open=()=>open()}catch(e){}
/* ---------- کنش‌ها ---------- */
H.g2_close=close;H.g2_again=()=>{const g=GD();g.done={};g.fin=0;save();open(0)};
H.g2_goto=e=>{const k=e.dataset.k,n=k!==undefined?STEPS.findIndex(x=>x.k===k):+e.dataset.n;if(n>=0)open(n)};
H.g2_prev=()=>open(Math.max(0,I()-1));
H.g2_next=()=>{GD().done[STEPS[I()].k]=1;open(Math.min(STEPS.length-1,I()+1))};
H.g2_skip=H.g2_next;
H.g2_fin=()=>{const g=GD();g.fin=1;g.done.fin=1;save();close();say(T('آماده‌ای ✓','All set ✓'))};
H.g2_lang=e=>{db.set.lang=e.dataset.v;try{I18_MEMO.clear();i18Apply()}catch(x){}save();draw()};
H.g2_cal=e=>{db.set.cal=e.dataset.v;save();draw()};
H.g2_perm=async()=>{try{if(H.nt_perm)await H.nt_perm();else await Notification.requestPermission()}catch(e){}setTimeout(draw,400)};
const leave=fn=>{const o=q('gd2');if(o)o.remove();fn()};
H.g2_trk=()=>leave(()=>{page='day';render();setTimeout(()=>{const e=q('lgcard')||document.querySelector('.dytr');if(e)e.scrollIntoView({block:'start'})},120)});
H.g2_res=e=>leave(()=>{page='res';rt=e.dataset.r;render()});
H.g2_set=e=>leave(()=>{page='set';stt=e.dataset.s;render()});
H.g2_go=e=>leave(()=>{if(window.daniP2Go)window.daniP2Go(e.dataset.t);else{page='plan2';render()}});
H.g2_pje=()=>leave(()=>{page='pj';render();const L=PJs();setTimeout(()=>{if(H.pj_ed&&L.length)H.pj_ed({dataset:{p:L[L.length-1].id}})},80)});
/* ساخت پروژه با بخش‌ها (هر بخش = یک فعالیت؛ نوع‌ها = زیرمجموعه‌ها؛ موعد اختیاری) */
H.g2_pj=()=>{snap();const name=(S['g2-pn']||'').trim();if(!name)return say(T('نام پروژه را بنویس','Type a project name'),1);
  const due=(window.daniDF&&daniDF.get('g2-dl'))||'';
  const types=[...document.querySelectorAll('#gd2 .g2-ty')].filter(c=>c.checked).map(c=>c.value);
  const lines=String(S['g2-pp']||'').split(/\n/).map(s=>s.trim()).filter(Boolean);
  const parts=[];let wsum=0;
  lines.forEach(l=>{const m=l.match(/^(.+?)\s*[|:：]\s*([\d.٫]+)\s*$/),nm=(m?m[1]:l).trim().slice(0,60),h=m?parseFloat(String(m[2]).replace('٫','.'))||0:0;if(!nm)return;
    let a=db.acts.find(x=>x.name===nm);
    if(!a){a={id:uid(),name:nm,cat:'learn',color:(CATS.learn&&CATS.learn[1])||'#3b82f6',tags:[],prio:'',goalDay:0,goalWeek:0,subs:[],desc:'',active:true,arch:false,days:[]};db.acts.push(a)}
    (a.subs=a.subs||[]);types.forEach(tn=>{if(!a.subs.some(s=>s.name===tn))a.subs.push({id:uid(),name:tn,goal:0})});
    if(parts.some(p=>p.a===a.id))return;wsum+=h;parts.push({id:uid(),a:a.id,s:[],hrs:0,wk:h})});
  const o={id:uid(),name:name.slice(0,80),dl:'',due:due,hrs:0,from:todayISO(),parts,wk:wsum};
  try{if(due){const D=zDL();const it={id:'d'+uid(),title:o.name,cat:'custom',imp:2,dt:due,tm:'09:00',note:'',cr:Date.now(),done:false,arch:false,al:[1440,60]};D.items.push(it);o.dl=it.id;o.dlAuto=1;o.due=''}}catch(e){console.error('g2 dl',e)}
  PJs().push(o);save();['g2-pn','g2-pp'].forEach(k=>delete S[k]);say(T('پروژه ساخته شد ✓','Project created ✓'));draw()};
H.g2_bz=()=>{snap();const t=(S['g2-bt']||'').trim().slice(0,60),s=S['g2-bs']||'',e=S['g2-be']||'';if(!t)return say(T('عنوان را بنویس','Type a title'),1);
  const days=[...document.querySelectorAll('#gd2 .g2-bw')].filter(c=>c.checked).map(c=>+c.value);if(!days.length)return say(T('حداقل یک روز را انتخاب کن','Pick at least one day'),1);
  if(!s||!e||s>=e)return say(T('ساعت شروع باید قبل از پایان باشد','Start must be before end'),1);
  BZs().push({id:uid(),t,s,e,dnd:1,days,date:''});save();['g2-bt'].forEach(k=>delete S[k]);say(T('ساعت پر اضافه شد ✓','Busy block added ✓'));draw()};
H.g2_bzd=e=>{const A=BZs(),i=A.findIndex(b=>b.id===e.dataset.id);if(i>=0){A.splice(i,1);save();draw()}};
/* ---------- راهنمای همین صفحه (برای دکمه‌ی ؟) ---------- */
const TIPS={
 day:[['🏠','خانه','Home'],[['تم تو، سلام و جمله‌ی روز بالای صفحه است.','Your theme, greeting and quote sit on top.'],['«ثبت فعالیت» همه‌ی حالت‌های ثبت را دارد؛ ✏️ فعالیت‌ها را ویرایش می‌کند.','“Track” has every logging mode; ✏️ edits activities.'],['⚙ شخصی‌سازی: ترتیب کارت‌ها، حذف و افزودن.','⚙ Customize: reorder, hide, add cards.']]],
 plan2:[['🗓','برنامه','Plan'],[['زبانه‌ها: برنامه‌ی هر روز، توقع هفته و ماه، ساعت‌های پر، عادت، یادآور، موعد، تقویم.','Tabs: any-day plan, week/month goals, busy blocks, habits, reminders, deadlines, calendar.'],['در «ساعت‌های پر» اعلان نمی‌آید.','No notifications during busy blocks.']]],
 pj:[['🎓','پروژه‌ها','Projects'],[['پروژه ← بخش‌ها ← نوع کار؛ موعد اختیاری است.','Project → parts → work types; deadline optional.'],['هر پروژه عادت و یادآور خودش را دارد.','Each project has its own habits and reminders.']]],
 res:[['📈','نتیجه','Results'],[['نتیجه‌ی امروز، آمار و مقایسه، گزارش و خروجی.','Today’s result, stats & compare, reports & export.']]],
 set:[['⚙','تنظیمات','Settings'],[['زبان و تقویم، تم‌ها، اعلان‌ها و صدا.','Language & calendar, themes, notifications & sound.'],['«داده‌ها» ← مرکز پشتیبان.','Data → Backup centre.']]],
 acd:[['🎓','آکادمی','Academy'],[['درس‌ها، فلش‌کارت‌ها، آزمون‌ها و دوره‌های آفلاین.','Lessons, flashcards, tests and offline courses.']]],
 dash:[['🎯','فعالیت‌ها','Activities'],[['⭐ = فعالیت ضروری (دکمه‌ی سریع).','⭐ = essential activity (quick button).'],['اسم، رنگ، برچسب، زیرمجموعه و هدف را همین‌جا عوض کن.','Rename, recolor, tag, add sub-items and goals here.']]]};
window.daniPageTip=()=>{const t=TIPS[page];if(!t)return'';return'<div class="c" style="margin:8px 0">'+daniH(t[0][0],'درباره‌ی این صفحه: '+t[0][1],'About this page: '+t[0][2])+t[1].map(x=>'<div class="m" style="margin:3px 0">• '+T(x[0],x[1])+'</div>').join('')+'</div>'};
/* بار اول (هیچ داده‌ای نیست): خودکار باز شود، یک‌بار */
try{if(!localStorage.getItem('dani_ob_seen'))localStorage.setItem('dani_ob_seen','1')}catch(e){}
setTimeout(()=>{try{const g=GD();if(!g.fin&&!g.auto&&db.entries.length<=14&&!PJs().length){g.auto=1;const o=db.set.ob||(db.set.ob={});o.opened=1;save();draw()}}catch(e){}},1500);
})();
