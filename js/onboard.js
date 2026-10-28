"use strict";
/* DANI · onboard.js — «راهنمای شروع» (v2)
   سه بخش:
   (۱) راه‌اندازی اولیه (فقط بار اول یا با «از اول شروع کن»): زبان ← هدف ← تقویم و روز استراحت ← پروژه (فعالیت، موعد، برنامه‌ی ۷ روزه + یادآور) ← اولین ثبت ← نتیجه و کپسول ← اعلان ← سبک خانه.
   (۲) «پروژه‌ی جدید»: هر وقت کار یا موعد تازه داری، همان ساخت پروژه بدون سؤال‌های اولیه (فعالیت + موعد + برنامه‌ی ۷ روزه + یادآور).
   (۳) «مرکز راهنما»: فهرست ۱۴ قابلیت با وضعیت (تیک از داده‌ی واقعی) و دکمه‌ی «امتحان کن»؛ کارت خانه همیشه قدم بعدی را پیشنهاد می‌دهد.
   همه‌ی متن‌ها با T(fa,en) (دوزبانه) و عنوان‌ها با daniH. داده: db.set.ob. چیزی از داده‌ی کاربر پاک نمی‌شود (حتی «از اول شروع کن»). */
(function(){
const T=window.daniT,H_=window.daniH;
const OB=()=>{const s=db.set;if(!s.ob||typeof s.ob!=='object')s.ob={purpose:'',flags:{},dis:0,fin:0,base:db.entries.length};const o=s.ob;if(!o.flags)o.flags={};if(!o.used)o.used={};if(!o.draft)o.draft={};if(typeof o.rest!=='number')o.rest=5;return o};
const F=()=>OB().flags,D=()=>OB().draft;
const PUR={
 exam:{n:['آزمون / کنکور','Exam prep'],a:['مطالعه','Study'],g:90,h:'student'},
 uni:{n:['درس دانشگاه','University'],a:['مطالعه‌ی درس‌ها','Course study'],g:90,h:'student'},
 work:{n:['کار / پروژه','Work / project'],a:['کار عمیق','Deep work'],g:120,h:'focus'},
 lang:{n:['زبان / مهارت جدید','Language / skill'],a:['تمرین','Practice'],g:45,h:'student'},
 habit:{n:['عادت‌سازی و زندگی','Habits & life'],a:['برنامه‌ی روزانه','Daily routine'],g:30,h:'minimal'},
 other:{n:['عمومی','General'],a:['فعالیت اصلی','Main activity'],g:60,h:'full'}};
const SLOTS=[['07:00',['صبح','Morning']],['12:00',['ظهر','Noon']],['16:00',['عصر','Afternoon']],['20:00',['شب','Evening']],['',['زمان ثابت ندارم','No fixed time']]];
const RESTS=[[5,['جمعه','Friday']],[6,['شنبه','Saturday']],[-1,['بدون روز استراحت','No rest day']]];
const mins=n=>{try{return mm(n)}catch(e){return n+'m'}};
const g=id=>(document.getElementById(id)||{}).value||'';
const pur=()=>PUR[OB().purpose]||PUR.other;
const ex=()=>db.set.cal==='j'?'۱۴۰۵/۰۷/۱۸':'2026-10-10';
const myAct=()=>{const id=D().act||F().act;return id&&db.acts.find(a=>a.id===id&&a.active)?id:''};
const dow=d=>new Date(d+'T12:00:00').getDay();
let MODE='setup',CUR=-1,SUMMARY=null;
/* ---------- گام‌ها ---------- */
const chips=(arr,cur,act,key)=>'<div class="row">'+arr.map(x=>'<button class="chip '+(cur===x[0]?'on':'')+'" data-a="'+act+'" data-v="'+x[0]+'">'+esc(T(x[1][0],x[1][1]))+'</button>').join('')+'</div>';
const ST={
 lang:{raw:1,t:['Choose your language','زبان خود را انتخاب کنید'],why:['You can change this any time in Settings. / هر وقت خواستی از تنظیمات عوضش کن.',''],
  done:()=>!!F().lang,
  body:()=>'<div class="row">'+[['en','English'],['fa','فارسی'],['bi','English · فارسی']].map(x=>'<button class="chip '+((db.set.lang||'bi')===x[0]&&F().lang?'on':'')+'" data-a="ob_lg" data-v="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>'},
 purpose:{t:['هدفت چیست؟','What is your goal?'],why:['فقط دو سؤال کوتاه؛ بقیه‌ی راهنما و چیدمان خانه را بر اساس جواب تو تنظیم می‌کنیم.','Just two quick questions; the rest of the guide and your Home adapt to your answer.'],
  done:()=>!!OB().purpose,
  body:()=>'<div class="row">'+Object.keys(PUR).map(k=>'<button class="chip '+(OB().purpose===k?'on':'')+'" data-a="ob_pur" data-k="'+k+'">'+esc(T(PUR[k].n[0],PUR[k].n[1]))+'</button>').join('')+'</div>'
   +'<label>'+T('می‌خواهی به چه چیزی برسی؟ (اختیاری)','What do you want to achieve? (optional)')+'</label><input id="ob-goal" maxlength="100" style="width:100%" value="'+esc(D().goalTxt||'')+'" placeholder="'+esc(T('مثلاً: قبولی در آزمون / تمام‌کردن پروژه','e.g. pass the exam / finish the project'))+'">'
   +'<div class="row" style="margin-top:8px"><button class="p" data-a="ob_s1">'+T('ادامه','Continue')+'</button></div>'},
 basics:{t:['تقویم و روز استراحت','Calendar & rest day'],why:['تاریخ‌ها طبق تقویم تو نمایش داده می‌شود و برنامه‌ی هفتگی روز استراحتت را خالی می‌گذارد.','Dates follow your calendar and your weekly plan leaves your rest day empty.'],
  done:()=>!!F().basics,
  body:()=>'<div class="m">'+T('تقویم','Calendar')+'</div>'+chips([['j',['شمسی','Jalali']],['g',['میلادی','Gregorian']]],db.set.cal,'ob_cal')
   +'<div class="m" style="margin-top:8px">'+T('روز استراحت هفتگی','Weekly rest day')+'</div>'+chips(RESTS,OB().rest,'ob_rest')
   +'<div class="row" style="margin-top:10px"><button class="p" data-a="ob_flag" data-f="basics">'+T('ادامه','Continue')+'</button></div>'},
 act:{t:['فعالیت اصلی','Main activity'],why:['همان کاری که می‌خواهی زمانش را بسنجی. هدف روزانه را کوچک بگیر؛ ثبات از شدت مهم‌تر است.','The thing you want to time. Keep the daily goal small — consistency beats intensity.'],
  done:()=>!!myAct(),
  body:()=>{const p=pur();return'<label>'+T('نام فعالیت','Activity name')+'</label><input id="ob-an" list="ob-al" maxlength="60" style="width:100%" value="'+esc(D().an||T(p.a[0],p.a[1]))+'"><datalist id="ob-al">'+db.acts.filter(a=>a.active).map(a=>'<option value="'+esc(a.name)+'">').join('')+'</datalist>'
   +'<div class="m" style="margin-top:8px">'+T('هدف روزانه','Daily goal')+'</div><div class="row">'+[30,45,60,90,120,180].map(m=>'<button class="chip '+((D().gm||p.g)===m?'on':'')+'" data-a="ob_gm" data-m="'+m+'">'+mins(m)+'</button>').join('')+'</div>'
   +'<div class="row" style="margin-top:10px"><button class="p" data-a="ob_act">'+T('ساخت / انتخاب','Create / select')+'</button></div>'}},
 dl:{t:['موعد (اختیاری)','Deadline (optional)'],why:['اگر تاریخ مهمی داری (آزمون، تحویل)، حجم کار روزانه از روی آن حساب می‌شود و یادآوری‌ها خودکار ساخته می‌شود.','If you have an important date (exam, delivery), your daily workload is calculated from it and reminders are created automatically.'],
  done:()=>!!D().dl_t||!!D().dl_s,
  body:()=>'<label>'+T('عنوان موعد','Deadline title')+'</label><input id="ob-dt" maxlength="100" style="width:100%" value="'+esc(D().dl_t||'')+'"><label>'+T('تاریخ','Date')+'</label><input id="ob-dd" dir="ltr" inputmode="numeric" placeholder="'+ex()+'" style="width:100%" value="'+esc(D().dl_d?fmtD(D().dl_d):'')+'">'
   +'<div class="row" style="margin-top:10px"><button class="p" data-a="ob_dl">'+T('ثبت موعد','Save deadline')+'</button><button data-a="ob_dls">'+T('ندارم / بعداً','None / later')+'</button></div>'},
 sched:{t:['برنامه‌ی هفته','Your week plan'],why:['حجم کار روزانه، ساعت مطالعه و یادآور را مشخص کن؛ برنامه‌ی هفته خودکار ساخته می‌شود و بعداً هر چیزش قابل‌ویرایش است.','Set your daily workload, time slot and reminder; your week is built automatically and fully editable later.'],
  done:()=>!!D().built,
  body:()=>{const dl=D().dl_d,left=dl?daysBetween(todayISO(),dl):0,study=dl?studyDays(dl):7;let h='';
   if(dl){h+='<div class="c" style="margin:0 0 8px">'+T('تا موعد','Until the deadline')+': <b>'+fa(left)+' '+T('روز','days')+'</b> · '+T('روزهای کاری','Work days')+': <b>'+fa(study)+'</b></div>'
     +'<div class="m">'+T('در کل چند ساعت کار لازم داری؟','About how many hours of work do you need in total?')+'</div><div class="row">'+[10,20,40,80,120,200].map(x=>'<button class="chip '+(D().hrs===x?'on':'')+'" data-a="ob_hrs" data-h="'+x+'">'+fa(x)+' '+T('ساعت','h')+'</button>').join('')+'</div>'
     +(D().hrs?'<p class="m">≈ <b>'+mins(dailyFor())+'</b> '+T('در روز','per day')+'</p>':'')}
   else h+='<p class="m">'+T('بدون موعد: هر روز کاری '+'هدف روزانه‌ی انتخابی گذاشته می‌شود.','No deadline: each work day gets your chosen daily goal.')+'</p>';
   h+='<div class="m" style="margin-top:8px">'+T('معمولاً کی کار می‌کنی؟','When do you usually work?')+'</div>'+chips(SLOTS,D().slot===undefined?'':D().slot,'ob_slot')
    +(D().slot?'<label class="m" style="display:block;margin-top:8px"><input type="checkbox" id="ob-rm" '+(D().rem===0?'':'checked')+'> '+T('هر روز در این ساعت یادآوری کن','Remind me daily at this time')+'</label>':'')
    +'<div class="row" style="margin-top:12px"><button class="p" data-a="ob_build">'+T('ساخت برنامه‌ی ۷ روزه','Build my 7-day plan')+'</button></div>';return h}},
 do:{t:['اولین ثبت زمان','Your first time log'],why:['برد سریع: همین الان یک ثبت کوتاه انجام بده تا چرخه شروع شود.','Quick win: log something short now to start the cycle.'],
  done:()=>db.entries.length>OB().base||(db.timer&&db.timer.state&&db.timer.state!=='ready'),
  body:()=>{const a=myAct();if(!a)return'<p class="m">'+T('اول فعالیت اصلی را بساز.','Create your main activity first.')+'</p>';
   return'<div class="row"><button class="p" data-a="ob_go" data-w="sw">▶ '+T('شروع کرنومتر','Start stopwatch')+'</button>'+(window.daniPomoStart?'<button class="chip" data-a="ob_go" data-w="pm">🍅 '+T('پومودورو','Pomodoro')+'</button>':'')+'</div>'
   +'<div class="m" style="margin-top:8px">'+T('یا کاری که تازه انجام دادی را ثبت کن:','Or log what you just did:')+'</div><div class="row">'+[15,30,45,60].map(m=>'<button class="chip" data-a="ob_log" data-m="'+m+'">'+mins(m)+'</button>').join('')+'</div>'}},
 review:{t:['نتیجه و فردا','Result & tomorrow'],why:['هر روز با یک نگاه به نتیجه و یک جمله برای فردا بسته می‌شود؛ این همان «کپسول» است که فردا صبح می‌بینی.','Each day closes with a look at the result and one sentence for tomorrow — the "capsule" you will see tomorrow morning.'],
  done:()=>!!F().review,
  body:()=>{const t=todayISO(),tot=sum(E(t)),a=myAct(),gl=(db.acts.find(x=>x.id===a)||{}).goalDay||0,dd=db.days[t]||{};
   return'<div class="c" style="margin:0 0 8px"><b>'+T('امروز','Today')+': '+mins(tot)+'</b>'+(gl?'<div class="m">'+T('هدف','Goal')+': '+mins(gl)+' — '+fa(Math.min(100,Math.round(tot/gl*100)))+'٪</div>':'')+'</div>'
   +'<label>'+T('چه یاد گرفتی / چه شد؟','What did you learn / how did it go?')+'</label><input id="ob-ln" maxlength="200" style="width:100%" value="'+esc(dd.learned||'')+'">'
   +'<label>'+T('کپسول: فردا اول از همه…','Capsule: tomorrow, first thing…')+'</label><input id="ob-cp" maxlength="200" style="width:100%" value="'+esc(dd.tomorrow||'')+'">'
   +'<div class="row" style="margin-top:10px"><button class="p" data-a="ob_rev">'+T('ذخیره','Save')+'</button></div>'}},
 notif:{t:['اعلان‌ها','Notifications'],why:['برای زنگ پایان تایمر، یادآورها و «برنامه‌ی فردا» به مجوز اعلان نیاز است. پیوستگی تو به همین یادآوری‌ها بستگی دارد.','Timer alarms, reminders and "plan tomorrow" need notification permission. Your streak depends on these nudges.'],
  done:()=>{try{return(typeof Notifier!=='undefined'&&Notifier.state.perm==='granted')||(('Notification' in window)&&Notification.permission==='granted')||!!F().notif_s}catch(e){return !!F().notif_s}},
  body:()=>'<div class="row"><button class="p" data-a="ob_nt">'+T('فعال‌سازی اعلان‌ها','Enable notifications')+'</button><button data-a="ob_flag" data-f="notif_s">'+T('بعداً','Later')+'</button></div><p class="m">'+T('بعداً می‌توانی صدای هر دسته را در تنظیمات ← زمان و اعلان عوض کنی.','You can change each category\'s sound later in Settings → Time & alerts.')+'</p>'},
 home:{t:['خانه‌ی خودت','Your Home'],why:['یک چیدمان پیشنهادی بر اساس هدفت؛ هر وقت خواستی از «شخصی‌سازی خانه» (پایین صفحه‌ی خانه) عوضش کن.','A suggested layout for your goal; change it anytime via "Customize home" at the bottom of Home.'],
  done:()=>!!F().home,
  body:()=>{const rec=pur().h,P={minimal:['مینیمال','Minimal'],focus:['تمرکز','Focus'],student:['دانشجو','Student'],full:['کامل','Full']};
   return'<div class="row">'+Object.keys(P).map(k=>'<button class="chip '+(k===rec?'on':'')+'" data-a="ob_home" data-k="'+k+'">'+esc(T(P[k][0],P[k][1]))+(k===rec?' ★':'')+'</button>').join('')+'<button class="chip" data-a="ob_home" data-k="classic">'+T('کلاسیک (چیدمان تم)','Classic (theme layout)')+'</button></div><p class="m">★ '+T('پیشنهاد برای هدف تو','Suggested for your goal')+'</p>'}}
};
const SETUP=['lang','purpose','basics','act','dl','sched','do','review','notif','home'],PROJ=['act','dl','sched'];
const steps=()=>MODE==='proj'?PROJ:SETUP;
function daysBetween(a,b){return Math.max(0,Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/864e5))}
function studyDays(dl){let n=0;const t=todayISO(),L=daysBetween(t,dl);for(let i=0;i<=L;i++){if(dow(addD(t,i))!==OB().rest)n++}return Math.max(1,n)}
function dailyFor(){const dl=D().dl_d;if(!dl||!D().hrs)return D().gm||pur().g;return Math.max(15,Math.min(360,Math.ceil(D().hrs*60/studyDays(dl)/5)*5))}
/* ---------- نمایش ---------- */
const stIdx=()=>{const l=steps(),i=l.findIndex(k=>!ST[k].done());return i<0?l.length:i};
function draw(){const l=steps();let i=CUR>=0?CUR:stIdx();CUR=i;
  if(SUMMARY){modal(summaryHTML());return}
  if(i>=l.length){if(MODE==='setup'){const o=OB();o.fin=1;save();modal(finishHTML())}else{SUMMARY=true;modal(summaryHTML())}return}
  const s=ST[l[i]];
  const bar='<div style="display:flex;gap:3px;margin:4px 0 10px">'+l.map((k,j)=>'<i style="flex:1;height:5px;border-radius:3px;background:'+(ST[k].done()?'var(--ok,#16a34a)':j===i?'var(--pr,#2563eb)':'#8885')+'"></i>').join('')+'</div>';
  const ttl=s.raw?'<h3 class="dh" data-nobi><span aria-hidden="true">🌐</span> '+esc(s.t[0])+' / '+esc(s.t[1])+'</h3>':H_('',s.t[0],s.t[1]);
  const why=s.raw?'<p class="m" data-nobi>'+esc(s.why[0])+'</p>':'<p class="m">'+T(s.why[0],s.why[1])+'</p>';
  modal('<div class="row"><b data-nobi>🧭 '+(MODE==='proj'?T('پروژه‌ی جدید','New project'):T('راهنمای شروع','Getting started'))+'</b><span class="sp"></span><span class="m">'+fa(i+1)+' / '+fa(l.length)+'</span></div>'+bar+ttl+why+s.body()
   +'<div class="row" style="margin-top:14px"><button data-a="ob_prev"'+(i===0?' disabled':'')+'>‹ '+T('قبلی','Back')+'</button><button data-a="ob_next">'+T('رد کردن','Skip')+' ›</button><span class="sp"></span><button data-a="ob_close">'+T('بعداً','Later')+'</button></div>')}
function summaryHTML(){const S=SUMMARY&&SUMMARY!==true?SUMMARY:{};
  return H_('✅','برنامه‌ات آماده است','Your plan is ready')+'<div class="c" style="margin:6px 0">'
   +'<div>• '+T('فعالیت','Activity')+': <b>'+esc(S.an||aN(myAct()))+'</b> — '+mins(S.daily||0)+' '+T('در روز','per day')+'</div>'
   +(S.dl?'<div>• '+T('موعد','Deadline')+': <b>'+esc(S.dl)+'</b> — '+fa(S.left)+' '+T('روز مانده','days left')+'</div>':'')
   +'<div>• '+fa(S.n||0)+' '+T('کار در برنامه‌ی ۷ روز آینده اضافه شد','tasks added to your next 7 days')+'</div>'
   +(S.rem?'<div>• '+T('یادآور روزانه ساعت','Daily reminder at')+' <b dir="ltr">'+esc(S.rem)+'</b></div>':'')+'</div>'
   +'<div class="row" style="margin-top:10px"><button class="p" data-a="ob_sumnext">'+(MODE==='setup'?T('ادامه‌ی راهنما','Continue'):T('تمام','Done'))+'</button><button data-a="ob_to" data-p="plan">'+T('دیدن برنامه','See the plan')+'</button></div>'}
function finishHTML(){return H_('🎉','آماده‌ای!','You are set!')+'<p class="m">'+T('چرخه‌ی هر روز فقط سه حرکت است:','Every day is just three moves:')+'</p>'
  +'<div class="c" style="margin:6px 0">1️⃣ '+T('صبح: «بعدی چی؟» را ببین و برنامه‌ی امروز را مرور کن','Morning: check "What next?" and review today\'s plan')+'<br>2️⃣ '+T('روز: با یک لمس شروع کن (ثبت ۵ ثانیه‌ای / کرنومتر / پومودورو)','Day: start with one tap (5-sec log / stopwatch / Pomodoro)')+'<br>3️⃣ '+T('شب: نتیجه را ببین و یک کپسول برای فردا بنویس','Night: see the result and write a capsule for tomorrow')+'</div>'
  +'<div class="row" style="margin-top:12px"><button class="p" data-a="ob_hub">'+T('مرکز راهنما: همه‌ی قابلیت‌ها','Guide hub: all features')+'</button><button data-a="h2_close">'+T('شروع می‌کنم','Let\'s go')+'</button></div>'}
/* ---------- مرکز راهنما ---------- */
const used=k=>!!OB().used[k];
const FEATS=[
 {k:'log',i:'⏱',t:['ثبت زمان','Log your time'],w:['هر جلسه‌ی کار را ثبت کن؛ همه‌ی گزارش‌ها از همین‌جا ساخته می‌شود.','Every report is built from your logs.'],d:()=>db.entries.length>OB().base,go:()=>window.daniDockOpen&&window.daniDockOpen('ql')},
 {k:'plan',i:'📝',t:['برنامه‌ی روز','Daily plan'],w:['کار امروز را از قبل بنویس تا «بعدی چی؟» بتواند کمکت کند.','Write today\'s tasks ahead so "What next?" can help.'],d:()=>Object.keys(db.plans||{}).some(k=>(db.plans[k]||[]).length),go:()=>QA('plan')},
 {k:'dl',i:'⏳',t:['موعد','Deadline'],w:['تاریخ مهم را ثبت کن؛ یادآوری‌ها و فوریت‌ها خودکار می‌شود.','Add an important date; reminders and urgency follow.'],d:()=>(zDL().items||[]).length>0,go:()=>QA('dl-up')},
 {k:'pm',i:'🍅',t:['پومودورو','Pomodoro'],w:['کار در بازه‌های متمرکز با استراحت کوتاه.','Focused sprints with short breaks.'],d:()=>used('pm'),go:()=>window.daniDockOpen&&window.daniDockOpen('pm')},
 {k:'hab',i:'🔁',t:['عادت','Habit'],w:['یک عادت کوچک روزانه بساز و زنجیره‌اش را نگه دار.','Build a small daily habit and keep the chain.'],d:()=>(zHB().items||[]).length>0,go:()=>QA('hab')},
 {k:'rem',i:'⏰',t:['یادآوری','Reminder'],w:['یک یادآور با صدای دلخواه.','A reminder with your own sound.'],d:()=>(zRM().items||[]).length>0,go:()=>QA('rem-up')},
 {k:'cap',i:'✦',t:['کپسول فردا','Capsule for tomorrow'],w:['شب یک جمله برای فردا بنویس.','Tonight, write one sentence for tomorrow.'],d:()=>Object.keys(db.days||{}).some(k=>db.days[k]&&db.days[k].tomorrow),go:()=>H.cap_edit&&H.cap_edit()},
 {k:'wk',i:'🔎',t:['بازبینی هفتگی','Weekly review'],w:['هفته را مرور کن و برای هفته‌ی بعد تصمیم بگیر.','Review the week and decide for the next.'],d:()=>!!(db.set.wr&&Object.keys(db.set.wr).length),go:()=>{closeM();QA('home');setTimeout(()=>H.h2_edit&&H.h2_edit(),300)}},
 {k:'home',i:'🏠',t:['شخصی‌سازی خانه','Customize Home'],w:['بخش‌هایی را که لازم داری روی خانه بگذار.','Put the sections you need on Home.'],d:()=>{const h=db.set.h2;return !!(h&&(h.on||(h.cx&&h.cx.length)||(h.cl&&(h.cl.o.length||h.cl.x.length))))},go:()=>{closeM();QA('home');setTimeout(()=>H.h2_edit&&H.h2_edit(),300)}},
 {k:'snd',i:'🎵',t:['صدای اعلان‌ها','Notification sounds'],w:['برای هر دسته یک صدای جدا.','A separate sound per category.'],d:()=>!!(db.set.soundUri||Object.keys(db.set.snd2||{}).length),go:()=>window.daniQAFn&&window.daniQAFn.snd&&window.daniQAFn.snd()},
 {k:'dock',i:'⚡',t:['نوار ابزار سریع','Quick toolbar'],w:['دکمه‌های سریع پایین هر صفحه.','Quick buttons at the bottom of every page.'],d:()=>!!(db.set.dk&&db.set.dk.on),go:()=>window.daniDockOpen&&window.daniDockOpen('cfg')},
 {k:'qa',i:'🔎',t:['جستجوی سراسری','Search anything'],w:['هر قابلیت یا داده‌ای را سریع پیدا کن.','Find any feature or item fast.'],d:()=>used('qa'),go:()=>{closeM();const q=window.daniQuickAccess;q&&q.open()}},
 {k:'ins',i:'📈',t:['الگوی تو','Your pattern'],w:['بعد از ۵ روز ثبت، بهترین ساعت‌هایت را می‌بینی.','After 5 logged days you see your best hours.'],d:()=>new Set((db.entries||[]).map(e=>e.date)).size>=5,go:()=>window.daniQAFn&&window.daniQAFn.insight&&window.daniQAFn.insight()},
 {k:'bk',i:'🛡',t:['پشتیبان','Backup'],w:['یک نسخه‌ی پشتیبان از داده‌هایت بگیر.','Keep a backup of your data.'],d:()=>!!(db.set.lastBk||used('bk')),go:()=>QA('st-data')}];
function QA(id){closeM();const q=window.daniQuickAccess;if(q)q.go(id)}
const featDone=()=>FEATS.filter(f=>{try{return f.d()}catch(e){return false}}).length;
function hubHTML(){const n=featDone(),tot=FEATS.length,rows=FEATS.slice().sort((a,b)=>{const x=a.d()?1:0,y=b.d()?1:0;return x-y});
  return H_('🧭','مرکز راهنما','Guide hub')+'<div class="row" style="margin:2px 0 8px"><span class="m">'+T('تسلط','Mastery')+': <b>'+fa(n)+' / '+fa(tot)+'</b></span><div style="flex:1;height:6px;border-radius:3px;background:#8884;overflow:hidden"><i style="display:block;height:100%;width:'+Math.round(n/tot*100)+'%;background:var(--ok,#16a34a)"></i></div></div>'
   +rows.map(f=>{let ok=false;try{ok=f.d()}catch(e){}return'<div class="cwr" style="'+(ok?'opacity:.6':'')+'"><span style="flex:1;min-width:0"><b>'+f.i+' '+esc(T(f.t[0],f.t[1]))+(ok?' ✓':'')+'</b><br><span class="m">'+esc(T(f.w[0],f.w[1]))+'</span></span>'+(ok?'':'<button class="chip" data-a="ob_try" data-k="'+f.k+'">'+T('امتحان کن','Try')+'</button>')+'</div>'}).join('')
   +'<div class="row" style="margin-top:12px"><button class="p" data-a="ob_new">➕ '+T('پروژه / موعد جدید','New project / deadline')+'</button><button data-a="ob_reset">↺ '+T('از اول شروع کن','Start over')+'</button><span class="sp"></span><button data-a="h2_close">'+T('بستن','Close')+'</button></div>'}
/* ---------- هندلرها ---------- */
const adv=()=>{save();CUR=-1;draw()};
function grab(){const d=D();const an=g('ob-an');if(an)d.an=an;const gt=g('ob-goal');if(gt)d.goalTxt=gt;const rm=document.getElementById('ob-rm');if(rm)d.rem=rm.checked?1:0}
H.ob_open=()=>{const o=OB();o.dis=0;o.opened=1;SUMMARY=null;CUR=-1;if(o.fin){modal(hubHTML());return}MODE='setup';draw()};
H.ob_hub=()=>{SUMMARY=null;modal(hubHTML())};
H.ob_close=()=>{closeM();render()};
H.ob_next=()=>{grab();CUR=Math.min(steps().length,(CUR<0?stIdx():CUR)+1);draw()};
H.ob_prev=()=>{grab();CUR=Math.max(0,(CUR<0?stIdx():CUR)-1);draw()};
H.ob_lg=e=>{db.set.lang=e.dataset.v;F().lang=1;try{I18_MEMO.clear();i18Apply()}catch(x){}save();render();CUR=-1;draw()};
H.ob_pur=e=>{grab();OB().purpose=e.dataset.k;save();draw()};
H.ob_s1=()=>{grab();const o=OB();if(!o.purpose)return toast(T('یکی را انتخاب کن','Pick one'),1);const gt=(D().goalTxt||'').trim();
  if(gt&&!db.goals.some(x=>x.t===gt))db.goals.push({t:gt.slice(0,100),actId:'',w:0,due:''});adv()};
H.ob_cal=e=>{db.set.cal=e.dataset.v;save();render();draw()};
H.ob_rest=e=>{OB().rest=+e.dataset.v;save();draw()};
H.ob_flag=e=>{F()[e.dataset.f]=1;adv()};
H.ob_gm=e=>{grab();D().gm=+e.dataset.m;draw()};
H.ob_act=()=>{grab();const n=(D().an||'').trim();if(!n)return toast(T('نام را بنویس','Enter a name'),1);const gm=D().gm||pur().g;
  let a=db.acts.find(x=>x.name===n);if(!a){a={id:uid(),name:n,cat:'learn',color:(window.CATS&&CATS.learn)?CATS.learn[1]:'#2563eb',tags:[],prio:'',goalDay:0,goalWeek:0,subs:[],desc:'',active:true,arch:false,days:[]};db.acts.push(a)}
  a.active=true;a.arch=false;a.goalDay=gm;D().act=a.id;F().act=a.id;D().gm=gm;adv()};
H.ob_dl=()=>{const t=g('ob-dt').trim(),d=readD(g('ob-dd'));if(!t)return toast(T('عنوان را بنویس','Enter a title'),1);if(!d)return toast(T('تاریخ معتبر نیست','Invalid date'),1);
  if(d<todayISO())return toast(T('تاریخ گذشته است','That date has passed'),1);
  const A=zDL(),c=(dlCats()[0]||{}).id||'';A.items.push({id:'d'+uid(),title:t.slice(0,100),cat:c,imp:2,dt:d,tm:'09:00',note:'',cr:Date.now(),done:false,arch:false,al:[1440,60]});D().dl_t=t;D().dl_d=d;D().dl_s=0;adv()};
H.ob_dls=()=>{D().dl_s=1;D().dl_t='';D().dl_d='';adv()};
H.ob_hrs=e=>{D().hrs=+e.dataset.h;draw()};
H.ob_slot=e=>{grab();D().slot=e.dataset.v;draw()};
H.ob_build=()=>{grab();const a=myAct();if(!a)return toast(T('اول فعالیت را بساز','Create the activity first'),1);
  const daily=dailyFor(),slot=D().slot||'',t0=todayISO(),dl=D().dl_d||'',rest=OB().rest;let n=0;
  const act=db.acts.find(x=>x.id===a);if(act)act.goalDay=daily;
  for(let i=0;i<7;i++){const d=addD(t0,i);if(dl&&d>dl)break;if(dow(d)===rest)continue;const L=db.plans[d]=db.plans[d]||[];if(L.some(p=>p.actId===a))continue;
    let st='',en='';if(slot&&!(d===t0&&tm(slot)<tm(nowHM()))){st=slot;en=hm(Math.min(1439,tm(slot)+daily))}
    L.push({id:uid(),actId:a,start:st,end:en,goal:daily,status:'todo',reason:''});n++}
  let remT='';if(slot&&D().rem!==0){try{const R=zRM();if(!R.items.some(r=>r.link&&r.link.id===a&&r.repeat==='daily')){R.items.push({id:'r'+uid(),off:false,title:T('وقت کار: ','Work time: ')+(act?act.name:''),date:t0,time:slot,repeat:'daily',days:[],steps:[0],link:{type:'act',id:a}});localStorage.setItem('hamrah_rem_last',String(Date.now()))}remT=slot}catch(e){}}
  D().built=1;(OB().proj=OB().proj||[]).push({act:a,dl:D().dl_d||'',ts:Date.now()});
  SUMMARY={an:act?act.name:'',daily,dl:D().dl_t?D().dl_t+' · '+fmtD(D().dl_d):'',left:dl?daysBetween(t0,dl):0,n,rem:remT};save();try{Notifier.sync()}catch(e){}CUR=-1;draw()};
H.ob_sumnext=()=>{SUMMARY=null;if(MODE==='setup'){CUR=-1;draw()}else{closeM();render()}};
H.ob_go=e=>{const a=myAct();if(!a)return;closeM();if(e.dataset.w==='pm'&&window.daniPomoStart){window.daniPomoStart(a);OB().used.pm=1}else{TM.start('sw',a,'',0)}save();render();try{toast(T('کار که تمام شد، توقف را بزن؛ بعد از کارت «راهنمای شروع» در خانه ادامه بده.','When done, press stop, then continue from the guide card on Home.'))}catch(x){}};
H.ob_log=e=>{const a=myAct(),m=+e.dataset.m;if(!a)return;const en=nowHM();if(tm(en)-m<0)return toast(T('این بازه از نیمه‌شب می‌گذرد','Crosses midnight'),1);
  db.entries.push({id:uid(),date:todayISO(),actId:a,subId:'',start:hm(tm(en)-m),end:en,min:m,note:'',src:'quick'});adv()};
H.ob_rev=()=>{const t=todayISO(),d=db.days[t]=db.days[t]||{};d.learned=g('ob-ln').slice(0,200);d.tomorrow=g('ob-cp').slice(0,200);F().review=1;adv()};
H.ob_nt=async()=>{try{if(H.nt_perm)await H.nt_perm()}catch(e){}setTimeout(()=>{CUR=-1;draw()},500)};
H.ob_home=e=>{const k=e.dataset.k;try{if(k==='classic'){H.h2_off()}else{H.h2_pre({dataset:{k}})}}catch(x){}F().home=1;save();closeM();render();CUR=-1;draw()};
H.ob_to=e=>{const p=e.dataset.p;closeM();if(p==='plan')QA('plan')};
H.ob_try=e=>{const f=FEATS.find(x=>x.k===e.dataset.k);if(!f)return;if(f.k==='bk')OB().used.bk=1;closeM();save();try{f.go()}catch(x){console.error(x)}};
H.ob_new=()=>{MODE='proj';OB().draft={};SUMMARY=null;CUR=0;draw()};
H.ob_reset=()=>{if(!confirm(T('راهنما از اول شروع شود؟ داده‌های تو پاک نمی‌شود.','Restart the guide? Your data is not deleted.')))return;const o=OB();o.flags={};o.fin=0;o.draft={};o.purpose='';o.base=db.entries.length;o.dis=0;MODE='setup';SUMMARY=null;CUR=0;save();draw()};
H.ob_dis=()=>{OB().dis=1;save();render()};
/* ردیابی استفاده */
{const w=(n,k)=>{const o=H[n];if(typeof o==='function')H[n]=function(){try{OB().used[k]=1;save()}catch(e){}return o.apply(this,arguments)}};w('pm_go','pm');
 const q=window.daniQuickAccess;if(q&&q.open){const o=q.open;q.open=function(){try{OB().used.qa=1;save()}catch(e){}return o.apply(this,arguments)}}}
/* کارت خانه */
function card(){const o=OB();if(o.dis)return'';if(db.entries.length>14&&!o.purpose&&!o.opened&&!o.fin)return'';
  if(!o.fin){const l=SETUP,i=l.findIndex(k=>!ST[k].done());if(i<0)return'';
    return'<div class="c obcard">'+H_('🧭','راهنمای شروع','Getting started')+'<div class="m">'+T('قدم بعدی: ','Next: ')+esc(T(ST[l[i]].t[0],ST[l[i]].t[1]))+' · '+fa(i)+'/'+fa(l.length)+'</div><div class="row" style="margin-top:6px"><button class="p" data-a="ob_open">'+T('ادامه','Continue')+'</button><button data-a="ob_dis">'+T('نمایش نده','Hide')+'</button></div></div>'}
  const n=featDone();if(n>=FEATS.length)return'';const nx=FEATS.find(f=>{try{return !f.d()}catch(e){return false}});
  return'<div class="c obcard">'+H_('🧭','مرکز راهنما','Guide hub')+'<div class="m">'+T('تسلط','Mastery')+' '+fa(n)+'/'+fa(FEATS.length)+(nx?' · '+T('بعدی: ','Next: ')+esc(T(nx.t[0],nx.t[1])):'')+'</div><div class="row" style="margin-top:6px">'+(nx?'<button class="p" data-a="ob_try" data-k="'+nx.k+'">'+T('امتحان کن','Try')+'</button>':'')+'<button class="chip" data-a="ob_hub">'+T('همه‌ی قابلیت‌ها','All features')+'</button><button data-a="ob_dis">'+T('نمایش نده','Hide')+'</button></div></div>'}
function inject(){if(page!=='home')return;const pg=document.getElementById('pg');if(!pg||pg.querySelector('.obcard'))return;const h=card();if(!h)return;
  const first=[...pg.querySelectorAll('.c')].find(c=>!c.parentElement.closest('.c'));const d=document.createElement('div');d.innerHTML=h;if(first)first.parentElement.insertBefore(d.firstChild,first);else pg.appendChild(d.firstChild)}
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{inject()}catch(e){console.error('ob',e)}return r}}
window.daniOnboard={open:H.ob_open,hub:H.ob_hub,feats:FEATS};
/* نصب تازه: باز شدن خودکار (یک‌بار) — اولین سؤال زبان است */
setTimeout(()=>{try{const o=db.set.ob;if((o&&(o.opened||o.purpose||o.fin||o.dis))||db.entries.length>14||localStorage.getItem('dani_ob_seen'))return;localStorage.setItem('dani_ob_seen','1');OB().opened=1;save();MODE='setup';CUR=-1;draw()}catch(e){}},1800);
})();
