/* v146 — افزوده: «برگشت به مسیر» (گم‌شدگی/اهمال/بی‌حوصلگی/چند روز دوری): مانع‌یابی + راه‌حل و اطلاعات + برنامه‌ی بازگشت نرم + پیگیری. (نسخه‌ی اول v144)
   v144 — «مسیر روشن / Clear Path»: از نگرانی تا اقدام (کارت اختیاری در «امروز»؛ پیش‌فرض خاموش).
   ۴ قدم: نگرانی + شدت ← واقعیت الان یا حدس ← چقدرش دست من است ← یک قدم کوچک (یا رها کردن).
   قدم کوچک با یک لمس به «برنامه‌ی روز» می‌رود. بعداً «چه شد؟» و شدت نگرانی بعد ثبت می‌شود تا روند دیده شود.
   داده فقط روی همین دستگاه: db.set.cpw.list (در پشتیبان هم می‌آید). این یک ابزار کمک‌برنامه‌ریزی است، نه درمان. */
(function(){'use strict';
const T=window.daniT||function(a){return a};const say=(m,b)=>{try{toast(m,b)}catch(e){}};
const W=()=>{const s=db.set;if(!s.cpw||typeof s.cpw!=='object')s.cpw={};if(!Array.isArray(s.cpw.list))s.cpw.list=[];return s.cpw};
const CP={step:0,d:{s0:3,k:'',min:15}};
const lvl=[0,2,4,6,8,10];
const chips=(cur,act,key)=>lvl.map(n=>'<button class="chip '+(cur===n?'on':'')+'" data-a="'+act+'" data-k="'+key+'" data-n="'+n+'">'+fa(n)+'</button>').join('');
const KD={ctl:['🟢',T('دست من است','In my hands')],info:['🟡',T('اول باید اطلاعات بگیرم','I need information first')],out:['🔴',T('دست من نیست','Not in my control')]};
function item(w){const k=KD[w.k]||KD.out;
 const open=w.st==='open';
 let h='<div class="cwr" style="display:block;margin:6px 0"><div class="row" style="align-items:flex-start"><span style="flex:1;min-width:0" dir="auto"><b>'+esc(w.t)+'</b><div class="m">'+k[0]+' '+k[1]+' · '+T('شدت','level')+' '+fa(w.s0)+(w.s1!=null?' ← '+fa(w.s1):'')+'</div>'
  +(w.fact?'<div class="m" dir="auto">'+T('الان می‌دانم: ','Right now I know: ')+esc(w.fact)+'</div>':'')
  +(w.step?'<div dir="auto">➡ '+esc(w.step)+(w.min?' · '+fa(w.min)+' '+T('دقیقه','min'):'')+'</div>':'')+'</span></div>';
 if(open){h+='<div class="row" style="margin-top:6px">'
  +(w.step?'<button class="chip" data-a="cp_plan" data-id="'+w.id+'">🗓 '+T('به برنامه‌ی امروز','To today\'s plan')+'</button>':'')
  +'<button class="chip" data-a="cp_end" data-id="'+w.id+'" data-st="done">✓ '+T('انجام شد','Done')+'</button>'
  +'<button class="chip" data-a="cp_end" data-id="'+w.id+'" data-st="dropped">🕊 '+T('رها کردم','Let it go')+'</button>'
  +'<button class="chip" data-a="cp_del" data-id="'+w.id+'" aria-label="delete">✕</button></div>'}
 if(w.ask)h+='<div class="m" style="margin-top:6px">'+T('الان چقدر نگرانی؟','How worried now?')+'</div><div class="row">'+lvl.map(n=>'<button class="chip" data-a="cp_s1" data-id="'+w.id+'" data-n="'+n+'">'+fa(n)+'</button>').join('')+'</div>';
 return h+'</div>'}
function wizard(){const d=CP.d,s=CP.step;let h='';
 const nav=(back,nextLbl,nextA)=>'<div class="row" style="margin-top:8px"><button class="chip" data-a="cp_back">'+(back?'‹ '+T('قبلی','Back'):T('انصراف','Cancel'))+'</button><span class="sp" style="flex:1"></span>'+(nextA?'<button class="p" data-a="'+nextA+'">'+nextLbl+'</button>':'')+'</div>';
 if(s===1)h+='<div class="m">'+T('قدم ۱ از ۴ — چه چیزی نگرانت کرده؟ (یک جمله)','Step 1 of 4 — What is worrying you? (one sentence)')+'</div><textarea id="cp-t" rows="2" dir="auto" style="width:100%" maxlength="240" data-cpi="t" placeholder="'+esc(T('مثلاً: می‌ترسم برای آزمون عقب بمانم','e.g. I’m afraid I’ll fall behind for the exam'))+'">'+esc(d.t||'')+'</textarea>'
  +'<div class="m" style="margin-top:6px">'+T('الان چقدر؟ (۰ = هیچ، ۱۰ = خیلی زیاد)','How strong now? (0 = none, 10 = very strong)')+'</div><div class="row">'+chips(d.s0,'cp_set','s0')+'</div>'+nav(0,T('بعدی','Next')+' ›','cp_n1');
 else if(s===2)h+='<div class="m">'+T('قدم ۲ از ۴ — واقعیتِ الان چیست؟','Step 2 of 4 — What is true right now?')+'</div><textarea id="cp-f" rows="2" dir="auto" style="width:100%" maxlength="240" data-cpi="fact" placeholder="'+esc(T('چه چیزی را مطمئنم؟ (عدد، تاریخ، کاری که تا حالا کرده‌ام)','What am I sure of? (numbers, dates, what I have already done)'))+'">'+esc(d.fact||'')+'</textarea>'
  +'<div class="m" style="margin-top:6px">'+T('این نگرانی بیشتر درباره‌ی…','This worry is mostly about…')+'</div><div class="row">'+[['now',T('الان (واقعیت)','Now (fact)')],['future',T('آینده (حدس)','The future (a guess)')],['both',T('هر دو','Both')]].map(x=>'<button class="chip '+(d.about===x[0]?'on':'')+'" data-a="cp_set" data-k="about" data-n="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>'+nav(1,T('بعدی','Next')+' ›','cp_n2');
 else if(s===3)h+='<div class="m">'+T('قدم ۳ از ۴ — چقدرش دست خودت است؟','Step 3 of 4 — How much is in your hands?')+'</div><div class="row" style="flex-direction:column;align-items:stretch">'+Object.keys(KD).map(k=>'<button class="chip '+(d.k===k?'on':'')+'" data-a="cp_set" data-k="k" data-n="'+k+'" style="text-align:start">'+KD[k][0]+' '+KD[k][1]+'</button>').join('')+'</div>'+nav(1,T('بعدی','Next')+' ›','cp_n3');
 else if(s===4){const out=d.k==='out';
  h+='<div class="m">'+(out?T('قدم ۴ از ۴ — این را رها می‌کنم. اما چه چیزِ نزدیکی دست من است؟ (اختیاری)','Step 4 of 4 — I let this go. What nearby thing IS in my hands? (optional)'):d.k==='info'?T('قدم ۴ از ۴ — کوچک‌ترین قدم برای گرفتن اطلاعات؟','Step 4 of 4 — the smallest step to get the information?'):T('قدم ۴ از ۴ — کوچک‌ترین قدم قابل‌انجام؟','Step 4 of 4 — the smallest doable step?'))+'</div>'
   +'<input id="cp-s" dir="auto" style="width:100%" maxlength="160" data-cpi="step" value="'+esc(d.step||'')+'" placeholder="'+esc(T('یک کار مشخص و کوچک','One specific, small action'))+'">'
   +'<div class="row" style="margin-top:6px"><span class="m">'+T('مدت','Time')+'</span>'+[5,15,25,45].map(n=>'<button class="chip '+(d.min===n?'on':'')+'" data-a="cp_set" data-k="min" data-n="'+n+'">'+fa(n)+'</button>').join('')+'<span class="m">'+T('دقیقه','min')+'</span></div>'
   +nav(1,'✓ '+T('ذخیره','Save'),'cp_save')+(d.step||!out?'<div class="row" style="margin-top:6px"><button class="chip" data-a="cp_save" data-go="1">🗓 '+T('ذخیره و بفرست به برنامه‌ی امروز','Save & send to today\'s plan')+'</button></div>':'')}
 return h}
function card(){const L=W().list,open=L.filter(x=>x.st==='open'),done=L.filter(x=>x.st!=='open');
 let h='<div class="c dyc" id="cpcard">'+(typeof BH==='function'?'<h3 class="dh"><span aria-hidden="true">🧭</span>'+BH('Clear Path','مسیر روشن')+'</h3>':'<h3>🧭 Clear Path</h3>');
 if(CP.r&&CP.r.s)return h+retWizard()+'</div>';
 if(CP.step){return h+wizard()+'</div>'}
 h+='<p class="m">'+T('یک نگرانی را به یک قدم کوچک و مشخص تبدیل کن.','Turn one worry into one small, clear step.')+'</p><div class="row"><button class="p" data-a="cp_new">＋ '+T('نگرانی تازه','New worry')+'</button><button class="chip" data-a="cb_new">🧭 '+T('گم شده‌ام / برگشت به مسیر','Lost? Back on track')+'</button></div>';
 {const ad=awayDays(),ob=B().filter(x=>x.st==='open');
  if(nudgeOn()&&ad!=null&&ad>=NN()&&!ob.length)h+='<div class="m" style="margin:6px 0" dir="auto">💛 '+T('چند روزی ثبتی نداشته‌ای ('+fa(ad)+' روز). اشکالی ندارد؛ اگر خواستی با یک قدم کوچک برگرد.','No logs for a few days ('+fa(ad)+'). That\'s okay; if you like, return with one small step.')+'</div>';
  h+=ob.map(bitem).join('')}
 h+=open.slice(0,4).map(item).join('')+done.filter(x=>x.ask).map(item).join('');
 const dd=done.filter(x=>x.s1!=null);
 if(done.length){const avg=dd.length?(dd.reduce((a,x)=>a+(x.s0-x.s1),0)/dd.length):null;
  h+='<details style="margin-top:8px"><summary class="m" style="cursor:pointer">'+T('تاریخچه','History')+' · '+fa(done.length)+(avg!=null?' · '+T('میانگین کاهش نگرانی','avg. drop in worry')+' '+fa(Math.round(avg*10)/10):'')+'</summary>'+done.slice(-8).reverse().map(item).join('')+'</details>'}
 h+=backHist();
 h+='<details style="margin-top:6px"><summary class="m" style="cursor:pointer">⚙ '+T('تنظیم','Settings')+'</summary><div class="row" style="margin-top:6px"><button class="chip '+(nudgeOn()?'on':'')+'" data-a="cb_nudge">💛 '+T('یادآوریِ مهربان پس از دوری','Gentle nudge after time away')+': '+(nudgeOn()?T('روشن','On'):T('خاموش','Off'))+'</button>'+(nudgeOn()?[2,3,5,7].map(n=>'<button class="chip '+(NN()===n?'on':'')+'" data-a="cb_nn" data-n="'+n+'">'+fa(n)+'</button>').join('')+'<span class="m">'+T('روز','days')+'</span>':'')+'</div></details>';
 return h+'</div>'}
var rid=()=>'w'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
const find=id=>W().list.find(x=>x.id===id);
H.cp_new=()=>{CP.step=1;CP.d={s0:3,k:'',min:15};render()};
H.cp_back=()=>{CP.step=Math.max(0,CP.step-1);render()};
H.cp_set=e=>{const k=e.dataset.k,v=e.dataset.n;CP.d[k]=(k==='s0'||k==='min')?+v:v;render()};
H.cp_n1=()=>{if(!(CP.d.t||'').trim())return say(T('یک جمله بنویس','Write one sentence'),1);CP.step=2;render()};
H.cp_n2=()=>{CP.step=3;render()};
H.cp_n3=()=>{if(!CP.d.k)return say(T('یکی را انتخاب کن','Pick one'),1);CP.step=4;render()};
H.cp_save=e=>{const d=CP.d;if(d.k!=='out'&&!(d.step||'').trim())return say(T('یک قدم کوچک بنویس','Write one small step'),1);
 const w={id:rid(),at:new Date().toISOString(),day:todayISO(),t:d.t.trim(),s0:d.s0,fact:(d.fact||'').trim(),about:d.about||'',k:d.k,step:(d.step||'').trim(),min:(d.step||'').trim()?d.min:0,st:d.k==='out'&&!(d.step||'').trim()?'dropped':'open',s1:null};
 W().list.push(w);if(W().list.length>200)W().list.splice(0,W().list.length-200);
 if(w.st==='dropped')w.ask=1;
 CP.step=0;save();render();if(e&&e.dataset&&e.dataset.go)H.cp_plan({dataset:{id:w.id}})};
H.cp_end=e=>{const w=find(e.dataset.id);if(!w)return;w.st=e.dataset.st;w.ask=1;save();render()};
H.cp_s1=e=>{const w=find(e.dataset.id);if(!w)return;w.s1=+e.dataset.n;delete w.ask;save();render()};
H.cp_del=e=>{if(!confirm(T('این مورد پاک شود؟','Delete this item?')))return;const l=W().list,i=l.findIndex(x=>x.id===e.dataset.id);if(i>=0)l.splice(i,1);save();render()};
H.cp_plan=e=>{const w=find(e.dataset.id);if(!w||!w.step)return;
 try{window.daniP2Go('day',todayISO())}catch(x){return}
 setTimeout(function(){const t=document.getElementById('tp-in');if(!t)return say(T('برنامه‌ی امروز قبلاً ثبت شده؛ از «ویرایش» اضافه کن','Today\'s plan is already saved; add it via Edit'),1);
  t.value=(w.min?w.min+' '+T('دقیقه','minutes')+' ':'')+w.step;try{H.tp_add()}catch(x){console.error(x)}
  say(T('«'+w.step+'» به فهرست برنامه‌ی امروز رفت؛ «ثبت برنامه‌ی امروز» را بزن','“'+w.step+'” went to today\'s plan list; press “Save today’s plan”'))},350)};

/* ===== برگشت به مسیر (v146) ===== */
const B=()=>{const w=W();if(!Array.isArray(w.back))w.back=[];return w.back};
const RS={lost:['🌫',T('گم شده‌ام','I feel lost'),T('نیاز نیست همه‌چیز روشن شود؛ فقط یک قدم کوچک و مشخص لازم است.','You don\'t need everything clear; just one small, specific step.')],
 proc:['⏳',T('اهمال می‌کنم','I\'m procrastinating'),T('اهمال معمولاً تنبلی نیست؛ یعنی شروعِ کار سنگین یا ناخوشایند حس می‌شود.','Procrastination is rarely laziness; starting simply feels heavy or unpleasant.')],
 lazy:['🛋',T('بی‌حوصله‌ام','I have no drive'),T('حوصله اغلب بعد از شروع می‌آید، نه قبل از آن؛ شروع را بسیار کوچک کن.','Drive usually comes after starting, not before; make the start tiny.')],
 away:['🧳',T('چند روز دور بودم','I was away for days'),T('عقب‌افتادگی را جبران نکن؛ از امروز دوباره شروع کن و کم‌کم زیاد کن.','Don\'t make up the gap; start again from today and ramp up slowly.')]};
const OB={big:['🧱',T('کار خیلی بزرگ است','The task feels too big'),
  [T('آن را به قطعه‌ی ۱۰–۲۰ دقیقه‌ای بشکن و فقط قطعه‌ی اول را بنویس.','Cut it into 10–20 min pieces and write only the first one.'),T('نتیجه‌ی کوچک تعریف کن (مثلاً «۱ صفحه»، نه «تمام فصل»).','Define a small result (e.g. “1 page”, not “the whole chapter”).')],
  T('مغز کارِ مبهم و بزرگ را تهدید حس می‌کند؛ قطعه‌ی کوچک این حس را خاموش می‌کند.','A big vague task feels like a threat; a small piece switches that off.')],
 start:['🧭',T('نمی‌دانم از کجا شروع کنم','I don\'t know where to start'),
  [T('قاعده‌ی «۲ دقیقه»: فقط کتاب/فایل را باز کن و اولین خط را بخوان.','The “2-minute rule”: just open the book/file and read the first line.'),T('اگر مطمئن نیستی، قدمِ «مرور آنچه قبلاً خوانده‌ام» را انتخاب کن.','If unsure, pick “review what I already did” as the step.')],
  T('تصمیمِ «از کجا» بیشترین انرژی را می‌برد؛ از قبل یک نقطه‌ی شروع ثابت کن.','Deciding “where” costs the most energy; fix a starting point in advance.')],
 tired:['😴',T('خسته‌ام / کم‌خواب','I\'m tired / short on sleep'),
  [T('امروز فقط ۱۰ دقیقه و کار سبک (مرور، خواندن)، نه کار سنگین.','Today only 10 minutes of light work (review, reading), not heavy work.'),T('اگر خیلی کم‌خوابی، خواب امشب را جزو برنامه بگذار.','If you are very short on sleep, put tonight\'s sleep into the plan.')],
  T('خستگیِ واقعی با اجبار حل نمی‌شود؛ قدم کوچک و استراحت کافی بهتر از روزِ از دست رفته است.','Real tiredness isn\'t solved by force; a tiny step plus rest beats a lost day.')],
 dist:['📱',T('حواس‌پرتی / گوشی','Distraction / phone'),
  [T('گوشی را برای ۲۵ دقیقه در اتاق دیگر یا حالت پرواز بگذار و تایمر بگذار.','Put the phone in another room or airplane mode for 25 minutes and set a timer.'),T('فقط یک برگه/یک تب باز نگه دار.','Keep only one sheet / one tab open.')],
  T('فاصله‌گرفتن از محرک مؤثرتر از «اراده‌ی بیشتر» است.','Removing the trigger works better than “more willpower”.')],
 fear:['😰',T('ترس از بد شدن / کمال‌گرایی','Fear of doing it badly / perfectionism'),
  [T('هدف را «پیش‌نویس بد» بگذار: اجازه بده اولین نسخه ناقص باشد.','Aim for a “bad first draft”: allow version one to be imperfect.'),T('فقط ۱۰ دقیقه کار کن و بعد تصمیم بگیر ادامه بدهی یا نه.','Work just 10 minutes, then decide whether to continue.')],
  T('ترس با شروعِ ناقص کوچک می‌شود، نه با آماده‌شدنِ بیشتر.','Fear shrinks with an imperfect start, not with more preparation.')],
 plan:['📚',T('عقب‌ماندگی انبوه / برنامه غیرواقعی','Huge backlog / unrealistic plan'),
  [T('همه‌ی عقب‌مانده‌ها را کنار بگذار؛ فقط نزدیک‌ترین موعد را بردار.','Park the whole backlog; take only the nearest deadline.'),T('برنامه‌ی ۳ روز بعد را نصف روزهای قبل ببند.','Plan the next 3 days at half of your earlier load.')],
  T('جبران یکجا معمولاً دوباره به فرسودگی و ترک می‌رسد؛ بازگشت تدریجی پایدارتر است.','Cramming to catch up often ends in burnout and quitting; a gradual return lasts.')],
 mood:['🌧',T('حال بد / بی‌انگیزگی','Low mood / no motivation'),
  [T('کوچک‌ترین کار ممکن را انتخاب کن و با خودت مهربان باش؛ یک قدم کافی است.','Pick the smallest possible task and be kind to yourself; one step is enough.'),T('اگر چند هفته است ادامه دارد، با یک نفر مورد اعتماد یا متخصص صحبت کن.','If it lasts for weeks, talk to someone you trust or a professional.')],
  T('این ابزار درمان نیست؛ فقط کمک می‌کند حرکتِ کوچک ممکن شود.','This tool is not therapy; it only helps make a small move possible.')],
 shame:['🙈',T('شرم یا گناه از غیبت','Guilt about being away'),
  [T('غیبت را «داده» ببین، نه حکم: چه چیزی باعث شد؟ فقط یک جمله بنویس.','See the gap as data, not a verdict: what caused it? Write one sentence.'),T('امروز را «روز اول» حساب کن؛ سابقه‌ی قبلی از بین نرفته.','Count today as “day one”; your earlier record is not gone.')],
  T('شرم انرژی را می‌خورد و برگشت را سخت‌تر می‌کند؛ برگشتن مهم‌تر از بی‌نقص بودن است.','Shame drains energy and makes returning harder; returning matters more than being flawless.')]};
const OBK=Object.keys(OB);
const R0=()=>({s:0,state:'',away:0,obs:[],step:'',min:15});
CP.r=R0();
const ymd=d=>{const m=/^(\d{4})-(\d\d)-(\d\d)/.exec(d||'');return m?Date.UTC(+m[1],+m[2]-1,+m[3]):0};
function awayDays(){let last='';try{(db.entries||[]).forEach(e=>{if(e&&e.date&&e.date>last&&e.date<=todayISO())last=e.date})}catch(e){}
 if(!last)return null;return Math.max(0,Math.round((ymd(todayISO())-ymd(last))/864e5))}
function focusName(){const t=todayISO();let best=null;
 try{((db.mods&&db.mods.pj&&db.mods.pj.items)||[]).forEach(p=>{if(p&&!p.arch&&p.due&&p.due>=t&&(!best||p.due<best.d))best={d:p.due,n:p.name}})}catch(e){}
 try{(zDL().items||[]).forEach(x=>{if(x&&x.dt&&x.dt>=t&&x.name&&(!best||x.dt<best.d))best={d:x.dt,n:x.name}})}catch(e){}
 return best?best.n:''}
function planSend(step,min){try{window.daniP2Go('day',todayISO())}catch(x){return}
 setTimeout(function(){const t=document.getElementById('tp-in');if(!t)return say(T('برنامه‌ی امروز قبلاً ثبت شده؛ از «ویرایش» اضافه کن','Today\'s plan is already saved; add it via Edit'),1);
  t.value=(min?min+' '+T('دقیقه','minutes')+' ':'')+step;try{H.tp_add()}catch(x){console.error(x)}
  say(T('«'+step+'» به فهرست برنامه‌ی امروز رفت؛ «ثبت برنامه‌ی امروز» را بزن','“'+step+'” went to today\'s plan list; press “Save today’s plan”'))},350)}
function retWizard(){const r=CP.r;let h='';
 const nav=(back,lbl,a)=>'<div class="row" style="margin-top:8px"><button class="chip" data-a="cb_back">'+(back?'‹ '+T('قبلی','Back'):T('انصراف','Cancel'))+'</button><span class="sp" style="flex:1"></span>'+(a?'<button class="p" data-a="'+a+'">'+lbl+'</button>':'')+'</div>';
 if(r.s===1){const ad=awayDays();
  h+='<div class="m">'+T('قدم ۱ از ۳ — الان کدام به حالت نزدیک‌تر است؟','Step 1 of 3 — which is closest to how you are now?')+'</div><div class="row" style="flex-direction:column;align-items:stretch">'+Object.keys(RS).map(k=>'<button class="chip '+(r.state===k?'on':'')+'" data-a="cb_set" data-k="state" data-n="'+k+'" style="text-align:start">'+RS[k][0]+' '+RS[k][1]+'</button>').join('')+'</div>'
   +(r.state?'<div class="m" style="margin-top:6px" dir="auto">'+RS[r.state][2]+'</div>':'')
   +'<div class="m" style="margin-top:8px">'+T('چند روز است دور بوده‌ای؟','How many days have you been away?')+(ad!=null&&ad>0?' <span>('+T('آخرین ثبت: ','last log: ')+fa(ad)+' '+T('روز پیش','days ago')+')</span>':'')+'</div><div class="row">'+[[0,T('نه، همین امروز','Not really')],[2,'۱–۳'],[6,'۴–۷'],[10,T('بیش از ۷','7+')]].map(x=>'<button class="chip '+(r.away===x[0]?'on':'')+'" data-a="cb_set" data-k="away" data-n="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>'+nav(0,T('بعدی','Next')+' ›','cb_n1')}
 else if(r.s===2)h+='<div class="m">'+T('قدم ۲ از ۳ — چه چیزی جلوی تو را می‌گیرد؟ (تا ۳ مورد؛ اختیاری)','Step 2 of 3 — what is in your way? (up to 3; optional)')+'</div><div class="row" style="flex-wrap:wrap">'+OBK.map(k=>'<button class="chip '+(r.obs.indexOf(k)>=0?'on':'')+'" data-a="cb_ob" data-k="'+k+'">'+OB[k][0]+' '+OB[k][1]+'</button>').join('')+'</div>'+nav(1,T('راه‌حل‌ها','Solutions')+' ›','cb_n2');
 else if(r.s===3){const obs=r.obs.length?r.obs:['start'];
  h+='<div class="m">'+T('قدم ۳ از ۳ — راه‌حل‌ها و برنامه‌ی بازگشت','Step 3 of 3 — solutions and your comeback plan')+'</div>'
   +obs.map(k=>'<div class="cwr" style="display:block;margin:6px 0"><b>'+OB[k][0]+' '+OB[k][1]+'</b>'+OB[k][2].map(x=>'<div dir="auto">• '+x+'</div>').join('')+'<div class="m" dir="auto">ℹ '+OB[k][3]+'</div></div>').join('')
   +'<div class="m" style="margin-top:8px"><b>'+T('برنامه‌ی بازگشت نرم (بدون جبران عقب‌افتادگی)','Soft comeback plan (no catching up)')+'</b></div>'
   +'<div class="m" dir="auto">'+T('روز اول: ','Day 1: ')+fa(r.min)+' '+T('دقیقه','min')+' · '+T('روز دوم: ','Day 2: ')+fa(r.min+10)+' '+T('دقیقه','min')+' · '+T('روز سوم: به اندازه‌ی همیشه، فقط اگر حالت خوب بود','Day 3: your usual amount, only if it feels okay')+'</div>'
   +'<div class="m" style="margin-top:6px">'+T('قدم امروز (قابل‌ویرایش)','Today\'s step (editable)')+'</div><input id="cb-s" dir="auto" style="width:100%" maxlength="160" data-cpi="step" value="'+esc(r.step)+'">'
   +'<div class="row" style="margin-top:6px"><span class="m">'+T('مدت','Time')+'</span>'+[10,15,25].map(n=>'<button class="chip '+(r.min===n?'on':'')+'" data-a="cb_set" data-k="min" data-n="'+n+'">'+fa(n)+'</button>').join('')+'<span class="m">'+T('دقیقه','min')+'</span></div>'
   +nav(1,'✓ '+T('ذخیره','Save'),'cb_save')+'<div class="row" style="margin-top:6px"><button class="chip" data-a="cb_save" data-go="1">🗓 '+T('ذخیره و بفرست به برنامه‌ی امروز','Save & send to today\'s plan')+'</button></div>'}
 return h}
function bitem(b){const open=b.st==='open',S=RS[b.state]||RS.lost;
 let h='<div class="cwr" style="display:block;margin:6px 0"><div dir="auto"><b>'+S[0]+' '+S[1]+'</b>'+(b.away?'<span class="m"> · '+T('دوری','away')+' '+(b.away>=10?'۷+':b.away>=6?'۴–۷':'۱–۳')+'</span>':'')+'</div>'
  +(b.obs&&b.obs.length?'<div class="m">'+b.obs.map(k=>OB[k]?OB[k][0]+' '+OB[k][1]:'').join(' · ')+'</div>':'')
  +(b.step?'<div dir="auto">➡ '+esc(b.step)+' · '+fa(b.min)+' '+T('دقیقه','min')+'</div>':'');
 if(open)h+='<div class="m" style="margin-top:6px">'+T('چه شد؟','How did it go?')+'</div><div class="row">'
  +[['done','✓ '+T('انجام شد','Done')],['part','◐ '+T('کمی شد','A bit')],['no','✕ '+T('نشد','Not yet')]].map(x=>'<button class="chip" data-a="cb_end" data-id="'+b.id+'" data-st="'+x[0]+'">'+x[1]+'</button>').join('')
  +(b.step?'<button class="chip" data-a="cb_plan" data-id="'+b.id+'">🗓 '+T('به برنامه‌ی امروز','To today\'s plan')+'</button>':'')+'<button class="chip" data-a="cb_del" data-id="'+b.id+'" aria-label="delete">🗑</button></div>';
 else h+='<div class="m">'+({done:'✓ '+T('انجام شد','Done'),part:'◐ '+T('کمی شد','A bit'),no:'✕ '+T('نشد؛ دوباره با قدم کوچک‌تر','Not yet; try again with a smaller step')}[b.st]||'')+'</div>';
 return h+'</div>'}
function backHist(){const L=B().filter(x=>x.st!=='open');if(!L.length)return '';
 const cnt={};B().forEach(x=>(x.obs||[]).forEach(k=>{cnt[k]=(cnt[k]||0)+1}));
 const top=Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a])[0];const ok=L.filter(x=>x.st==='done'||x.st==='part').length;
 return '<details style="margin-top:8px"><summary class="m" style="cursor:pointer">'+T('تاریخچه‌ی بازگشت','Comeback history')+' · '+fa(L.length)+' · '+T('برگشت موفق','returns that worked')+' '+fa(ok)+(top&&cnt[top]>1?' · '+T('مانعِ تکراری: ','recurring obstacle: ')+OB[top][1]+' ×'+fa(cnt[top]):'')+'</summary>'+L.slice(-6).reverse().map(bitem).join('')+'</details>'}
const nudgeOn=()=>!!W().nudge;
const NN=()=>W().nudgeN||3;
H.cb_new=()=>{const ad=awayDays();CP.step=0;CP.r=R0();CP.r.s=1;CP.r.away=ad>=8?10:ad>=4?6:ad>=1?2:0;CP.r.state=CP.r.away>=2?'away':'';render()};
H.cb_back=()=>{CP.r.s=Math.max(0,CP.r.s-1);render()};
H.cb_set=e=>{const k=e.dataset.k,v=e.dataset.n;CP.r[k]=(k==='away'||k==='min')?+v:v;render()};
H.cb_ob=e=>{const o=CP.r.obs,k=e.dataset.k,i=o.indexOf(k);if(i>=0)o.splice(i,1);else if(o.length<3)o.push(k);else say(T('حداکثر ۳ مورد','Up to 3 items'),1);render()};
H.cb_n1=()=>{if(!CP.r.state)return say(T('یکی را انتخاب کن','Pick one'),1);CP.r.min=(CP.r.state==='lazy'||CP.r.obs.indexOf('tired')>=0)?10:15;CP.r.s=2;render()};
H.cb_n2=()=>{const r=CP.r;if(!r.step){const f=focusName();const o=r.obs.indexOf('tired')>=0||r.obs.indexOf('mood')>=0;r.min=o?10:r.min;
  r.step=f?T('شروع کوچک: '+f,'Small start: '+f):T('باز کردن کار و خواندن اولین خط','Open the task and read the first line')}r.s=3;render()};
H.cb_save=e=>{const r=CP.r;if(!(r.step||'').trim())return say(T('یک قدم کوچک بنویس','Write one small step'),1);
 const b={id:rid(),at:new Date().toISOString(),day:todayISO(),state:r.state,away:r.away,obs:r.obs.slice(),step:r.step.trim(),min:r.min,st:'open'};
 B().push(b);if(B().length>100)B().splice(0,B().length-100);CP.r=R0();save();render();if(e&&e.dataset&&e.dataset.go)planSend(b.step,b.min)};
H.cb_end=e=>{const b=B().find(x=>x.id===e.dataset.id);if(!b)return;b.st=e.dataset.st;save();render();
 say(b.st==='no'?T('اشکال ندارد؛ دوباره با قدم کوچک‌تر شروع کن','That\'s okay; try again with a smaller step'):T('آفرین؛ برگشتن همین است','Well done; this is what returning looks like'))};
H.cb_del=e=>{if(!confirm(T('این مورد پاک شود؟','Delete this item?')))return;const l=B(),i=l.findIndex(x=>x.id===e.dataset.id);if(i>=0)l.splice(i,1);save();render()};
H.cb_plan=e=>{const b=B().find(x=>x.id===e.dataset.id);if(b&&b.step)planSend(b.step,b.min)};
H.cb_nudge=()=>{W().nudge=!W().nudge;save();render()};
H.cb_nn=e=>{W().nudgeN=+e.dataset.n;save();render()};
document.addEventListener('input',function(e){const t=e.target;if(t&&t.dataset&&t.dataset.cpi){if(CP.r&&CP.r.s)CP.r[t.dataset.cpi]=t.value;else if(CP.step)CP.d[t.dataset.cpi]=t.value}});
window.daniClearPath={card,planSend};
try{window.DANI_SECS.wp=[card,T('مسیر روشن: از نگرانی تا اقدام','Clear Path: from worry to action')]}catch(e){console.error('clearpath',e)}
})();
