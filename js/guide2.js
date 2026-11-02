'use strict';
/* DANI · guide2.js — «راهنمای شروع» با همان ترتیب قدم‌های مورد نظر کاربر:
   زبان (انگلیسی) ← تقویم و پایه ← ۱ پروژه‌ها ← ۲ برنامه‌ی من (ساعت‌های پر، عادت، مناسبت) ← ۳ توقع‌ها ← ۴ ثبت ← ۵ نتیجه ← تنظیمات.
   هر قدم فقط توضیح کوتاه + دکمه‌ی رفتن به جای واقعی است؛ هیچ داده‌ی شخصی نمی‌خواهد. H.ob_open (همه‌ی ورودی‌های راهنما) را جایگزین می‌کند.
   وضعیت: db.set.gd {i:قدم فعلی, done:{k:1}, fin:0}. بار اول (بدون هیچ داده) خودکار باز می‌شود. */
(function(){
const T=window.daniT;
const GD=()=>{const s=db.set;if(!s.gd||typeof s.gd!=='object')s.gd={i:0,done:{},fin:0};if(!s.gd.done)s.gd.done={};return s.gd};
const mark=k=>{GD().done[k]=1;save()};
const go=(p,fn)=>()=>{closeM();page=p;render();if(fn)setTimeout(fn,60)};
const p2=t=>()=>{closeM();if(window.daniP2Go)window.daniP2Go(t);else{page='plan2';render()}};
/* دکمه‌ی عمل: [متن fa, متن en, تابع] */
const STEPS=[
 {k:'lang',i:'🌐',t:['Language','Language'],
  body:()=>'<p><b>Choose your language</b> · زبان را انتخاب کن</p><div class="row"><button class="chip '+(db.set.lang==='en'?'on':'')+'" data-a="g2_lang" data-v="en">English</button><button class="chip '+(db.set.lang==='fa'?'on':'')+'" data-a="g2_lang" data-v="fa">فارسی</button><button class="chip '+(db.set.lang==='bi'?'on':'')+'" data-a="g2_lang" data-v="bi">فارسی + English</button></div><p class="m">You can change this any time in Settings. · هر وقت خواستی در تنظیمات عوض می‌شود.</p>',acts:[]},
 {k:'cal',i:'📅',t:['تقویم و پایه','Calendar & basics'],
  body:()=>'<p class="m">'+T('هیچ اطلاعات شخصی لازم نیست.','No personal information needed.')+'</p><label>'+T('تقویم','Calendar')+'</label><div class="row"><button class="chip '+(db.set.cal==='j'?'on':'')+'" data-a="g2_cal" data-v="j">'+T('شمسی','Jalali')+'</button><button class="chip '+(db.set.cal==='g'?'on':'')+'" data-a="g2_cal" data-v="g">'+T('میلادی','Gregorian')+'</button></div>'
   +'<div class="row"><div><label>'+T('شروع روز','Day starts')+'</label><input type="time" value="'+esc(db.set.ds||'06:00')+'" data-ch="sf" data-f="ds"></div><div><label>'+T('پایان روز','Day ends')+'</label><input type="time" value="'+esc(db.set.de||'23:00')+'" data-ch="sf" data-f="de"></div></div>',acts:[]},
 {k:'pj',i:'🎓',t:['۱ · پروژه‌ها','1 · Projects'],
  body:()=>'<p>'+T('هر هدف بزرگ یک پروژه است؛ مثلاً «MBA» = ریاضی + GMAT + زبان. هر بخش ساعت، عادت و یادآور خودش را دارد و نوع فعالیتش (مرور، آزمون، ویدیو…) را می‌گذاری. موعد اختیاری است (مثلاً روز آزمون). کار، ورزش و هر چیز دیگر هم می‌تواند پروژه باشد.','Each big goal is a project — e.g. “MBA” = maths + GMAT + English. Every part has its own hours, habits and reminders, and an activity type (review, test, video…). A deadline is optional (e.g. exam day). Job, sport — anything can be a project.')+'</p>',
  acts:[[T('ساخت پروژه','Create a project'),()=>{closeM();page='pj';render();setTimeout(()=>{if(H.pj_ed)H.pj_ed({dataset:{p:''}})},80)}],[T('دیدن پروژه‌ها','See projects'),go('pj')]]},
 {k:'sch',i:'⛔',t:['۲ · برنامه‌ی من','2 · My schedule'],
  body:()=>'<p>'+T('کارهایی که برنامه نباید مزاحمشان شود را بنویس: کلاس، کار، جلسه‌ی هفتگی («ساعت‌های پر»). عادت‌ها را روی روزها بگذار و مناسبت‌ها (امتحان کوچک، تولد، قرار) را ثبت کن. هر روز و هر ساعتی را می‌شود برنامه‌ریزی کرد (کار فوری، قرار پزشک…).','Add what the planner must not disturb: class, job, weekly meeting (“busy blocks”). Put habits on days and add occasions (small exam, birthday, appointment). You can plan any day, any hour (urgent task, appointment…).')+'</p>',
  acts:[[T('ساعت‌های پر','Busy blocks'),p2('busy')],[T('عادت‌ها','Habits'),p2('hab')],[T('یادآور و مناسبت‌ها','Reminders & occasions'),p2('rem')],[T('موعدها','Deadlines'),p2('dl')],[T('تقویم','Calendar'),p2('cal')]]},
 {k:'exp',i:'🎯',t:['۳ · توقع‌ها','3 · Expectations'],
  body:()=>'<p>'+T('بگو فردا چند ساعت از هر پروژه/بخش انتظار داری، و در هفته و ماه چقدر. موفقیت هر روز، هفته و ماه با همین سنجیده می‌شود.','Say how many hours you expect from each project/part tomorrow, and per week and month. Success is judged per day, week and month against this.')+'</p>',
  acts:[[T('برنامه‌ی فردا / هر روز','Plan tomorrow / any day'),p2('day')],[T('توقع هفته و ماه','Week & month goals'),p2('exp')]]},
 {k:'log',i:'⏱',t:['۴ · ثبت','4 · Track'],
  body:()=>'<p>'+T('یک صفحه‌ی ثبت با همه‌ی حالت‌ها: کرنومتر، شمارش‌معکوس، پومودورو، ثبت دستی و ۵ ثانیه‌ای — در «خانه». برای این‌که ساعت‌هایت دقیق ثبت شود، اجازه‌ی اعلان را بده (پرسش ساعتی «الان چه می‌کنی؟» در نسخه‌ی اپ اندروید می‌آید).','One clean Track screen with every mode: stopwatch, timer, pomodoro, manual and 5-second log — on Home. Allow notifications so your hours stay accurate (the hourly “what are you doing?” check-in comes with the Android app).')+'</p>',
  acts:[[T('اجازه‌ی اعلان','Allow notifications'),()=>{if(H.nt_perm)H.nt_perm()}],[T('برو به ثبت','Go to Track'),()=>{closeM();page='day';render();setTimeout(()=>{const e=document.getElementById('lgcard')||document.querySelector('.dytr');if(e)e.scrollIntoView({block:'start'})},120)}]]},
 {k:'res',i:'📈',t:['۵ · نتیجه','5 · Results'],
  body:()=>'<p>'+T('نتیجه‌ی هر روز، مقایسه با روزهای قبل، موانع و تعلل، و این‌که توقع‌ها چقدر برآورده شد.','Each day’s result, comparison with earlier days, obstacles and procrastination, and how much of your expectations you met.')+'</p>',
  acts:[[T('نتیجه‌ی امروز','Today\'s result'),()=>{closeM();page='res';rt='eod';render()}],[T('آمار و مقایسه','Stats & compare'),()=>{closeM();page='res';rt='stats';render()}]]},
 {k:'set',i:'⚙',t:['تنظیمات','Settings'],
  body:()=>'<p>'+T('تم و ظاهر را عوض کن یا تم جدید وارد کن؛ اعلان‌ها و صداها را تنظیم کن؛ و یک مرکز پشتیبان داری (پشتیبان کامل، بازیابی، یادآوری). هر وقت چیزی را گم کردی، دکمه‌ی ⚡ «دسترسی سریع» در خانه همه‌چیز را پیدا می‌کند.','Change the theme or import one; set notifications and sounds; and there is one Backup centre (full backup, restore, reminder). If you lose something, the ⚡ Quick access button on Home finds anything.')+'</p>',
  acts:[[T('تم‌ها','Themes'),()=>{closeM();page='set';stt='look';render()}],[T('اعلان‌ها','Notifications'),()=>{closeM();page='set';stt='time';render()}],[T('مرکز پشتیبان','Backup centre'),()=>{closeM();page='set';stt='data';render()}],[T('دسترسی سریع','Quick access'),()=>{closeM();if(H.qa_open)H.qa_open()}]]}
];
const I=()=>Math.max(0,Math.min(STEPS.length-1,GD().i|0));
function view(){const g=GD(),s=STEPS[I()],last=I()===STEPS.length-1;
  const dots=STEPS.map((x,n)=>'<button class="chip '+(n===I()?'on':'')+'" data-a="g2_goto" data-n="'+n+'" title="'+esc(typeof x.t[0]==='string'?T(x.t[0],x.t[1]):'')+'" style="min-width:34px">'+(g.done[x.k]?'✓':fa(n+1))+'</button>').join('');
  return'<div style="max-width:460px">'+daniH(s.i,s.t[0],s.t[1])+'<div class="row" style="margin:6px 0">'+dots+'</div>'+s.body()
   +(s.acts.length?'<div class="row" style="margin-top:8px">'+s.acts.map((a,n)=>'<button class="p" data-a="g2_act" data-n="'+n+'">'+a[0]+'</button>').join('')+'</div>':'')
   +'<div class="row" style="margin-top:12px"><button data-a="g2_prev" '+(I()?'':'disabled')+'>'+T('قبلی','Back')+'</button><span class="sp"></span>'+(last?'<button class="p" data-a="g2_fin">'+T('تمام ✓','Finish ✓')+'</button>':'<button class="p" data-a="g2_next">'+T('بعدی','Next')+'</button>')+'<button class="chip" data-a="g2_close">'+T('بعداً','Later')+'</button></div></div>'}
const draw=()=>modal(view());
H.ob_open=()=>{draw()};H.ob_hub=H.ob_open;
H.g2_lang=e=>{db.set.lang=e.dataset.v;mark('lang');try{I18_MEMO.clear();i18Apply()}catch(x){}save();render();draw()};
H.g2_cal=e=>{db.set.cal=e.dataset.v;mark('cal');save();render();draw()};
H.g2_goto=e=>{GD().i=+e.dataset.n;save();draw()};
H.g2_prev=()=>{GD().i=Math.max(0,I()-1);save();draw()};
H.g2_next=()=>{mark(STEPS[I()].k);GD().i=Math.min(STEPS.length-1,I()+1);save();draw()};
H.g2_act=e=>{const s=STEPS[I()],a=s.acts[+e.dataset.n];if(!a)return;mark(s.k);GD().i=Math.min(STEPS.length-1,I()+1);save();a[1]();toast(T('برای ادامه‌ی راهنما: خانه ← «راه‌اندازی» ← راهنمای شروع (یا ⚡ دسترسی سریع)','To continue the guide: Home → Set-up → Start guide (or ⚡ Quick access)'))};
H.g2_fin=()=>{GD().fin=1;mark('set');closeM();render();toast(T('آماده‌ای ✓','All set ✓'))};
H.g2_close=()=>{closeM()};
/* بار اول (هیچ داده‌ای نیست): خودکار باز شود، یک‌بار */
setTimeout(()=>{try{const g=GD();if(!g.fin&&!g.auto&&!db.entries.length&&!(db.set.ob&&(db.set.ob.fin||db.set.ob.dis))&&!(db.mods&&db.mods.pj&&(db.mods.pj.items||[]).length)){g.auto=1;save();draw()}}catch(e){}},1500);
})();
