"use strict";
/* DANI · onboard.js — «راهنمای شروع قدم‌به‌قدم»
   اصل‌ها: (۱) اول یک برد سریع (اولین ثبت زمان در چند دقیقه)، (۲) فقط چند سؤال کوتاه و شخصی‌سازی بر اساس جواب،
   (۳) هیچ‌چیز اجباری نیست (رد کن/بعداً)، (۴) هر قدم با داده‌ی واقعی خودش تیک می‌خورد، (۵) بعد از اولین ثبت، «نتیجه + فردا» را نشان می‌دهد.
   باز شدن: خودکار برای نصب تازه؛ کارت «🧭 راهنمای شروع» در خانه؛ «دسترسی سریع ← راهنما». داده: db.set.ob.
   فقط از امکانات موجود استفاده می‌کند (فعالیت، هدف، موعد، برنامه، کرنومتر/پومودورو، یادداشت/کپسول، اعلان، سبک خانه). */
(function(){
const T=(fa,en)=>{try{return LANGEN()?en:fa}catch(e){return fa}};
const OB=()=>{const s=db.set;if(!s.ob||typeof s.ob!=='object')s.ob={purpose:'',flags:{},dis:0,fin:0,base:db.entries.length};if(!s.ob.flags)s.ob.flags={};return s.ob};
const PUR={
 exam:{n:['آزمون / کنکور','Exam prep'],a:['مطالعه','Study'],g:90,h:'student'},
 uni:{n:['درس دانشگاه','University'],a:['مطالعه‌ی درس‌ها','Course study'],g:90,h:'student'},
 work:{n:['کار / پروژه','Work / project'],a:['کار عمیق','Deep work'],g:120,h:'focus'},
 lang:{n:['زبان / مهارت جدید','Language / skill'],a:['تمرین','Practice'],g:45,h:'student'},
 habit:{n:['عادت‌سازی و زندگی','Habits & life'],a:['برنامه‌ی روزانه','Daily routine'],g:30,h:'minimal'},
 other:{n:['عمومی','General'],a:['فعالیت اصلی','Main activity'],g:60,h:'full'}};
const mins=n=>{try{return mm(n)}catch(e){return n+'m'}};
const F=()=>OB().flags;
const myAct=()=>{const id=F().act;return id&&db.acts.find(a=>a.id===id&&a.active)?id:''};
const ex=()=>db.set.cal==='j'?'۱۴۰۵/۰۷/۱۸':'2026-10-10';
const S=[
 {k:'purpose',t:['هدفت چیست؟','What is your goal?'],why:['دو سؤال کوتاه؛ بقیه‌ی راهنما و چیدمان خانه را بر اساس جواب تو تنظیم می‌کنیم.','Two quick questions; we tailor the rest of the guide and your Home to your answer.'],
  done:()=>!!OB().purpose,
  body:()=>'<div class="row">'+Object.keys(PUR).map(k=>'<button class="chip '+(OB().purpose===k?'on':'')+'" data-a="ob_pur" data-k="'+k+'">'+esc(T(PUR[k].n[0],PUR[k].n[1]))+'</button>').join('')+'</div>'
   +'<label>'+T('می‌خواهی به چه چیزی برسی؟ (اختیاری)','What do you want to achieve? (optional)')+'</label><input id="ob-goal" maxlength="100" style="width:100%" placeholder="'+esc(T('مثلاً: قبولی در آزمون / تمام‌کردن پروژه','e.g. pass the exam / finish the project'))+'">'
   +'<div class="row" style="margin-top:8px"><button class="p" data-a="ob_s1">'+T('ادامه','Continue')+'</button></div>'},
 {k:'basics',t:['تقویم و زبان','Calendar & language'],why:['تاریخ‌ها و متن‌ها همان‌طور که انتخاب می‌کنی در همه‌جا نمایش داده می‌شود.','Dates and text follow your choice everywhere.'],
  done:()=>!!F().basics,
  body:()=>'<div class="m">'+T('تقویم','Calendar')+'</div><div class="row"><button class="chip '+(db.set.cal==='j'?'on':'')+'" data-a="ob_cal" data-v="j">'+T('شمسی','Jalali')+'</button><button class="chip '+(db.set.cal==='g'?'on':'')+'" data-a="ob_cal" data-v="g">'+T('میلادی','Gregorian')+'</button></div>'
   +'<div class="m" style="margin-top:8px">'+T('زبان','Language')+'</div><div class="row">'+[['fa','فارسی'],['en','English'],['bi',T('دو‌زبانه','Both')]].map(x=>'<button class="chip '+((db.set.lang||'bi')===x[0]?'on':'')+'" data-a="ob_lang" data-v="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>'
   +'<div class="row" style="margin-top:10px"><button class="p" data-a="ob_flag" data-f="basics">'+T('ادامه','Continue')+'</button></div>'},
 {k:'act',t:['فعالیت اصلی و هدف روزانه','Main activity & daily goal'],why:['همان کاری که می‌خواهی زمانش را بسنجی. هدف روزانه کوچک بگیر؛ ثبات از شدت مهم‌تر است.','The thing you want to time. Keep the daily goal small — consistency beats intensity.'],
  done:()=>!!myAct()||db.acts.some(a=>a.active&&a.goalDay>0),
  body:()=>{const p=PUR[OB().purpose]||PUR.other;return'<label>'+T('نام فعالیت','Activity name')+'</label><input id="ob-an" list="ob-al" maxlength="60" style="width:100%" value="'+esc(T(p.a[0],p.a[1]))+'"><datalist id="ob-al">'+db.acts.filter(a=>a.active).map(a=>'<option value="'+esc(a.name)+'">').join('')+'</datalist>'
   +'<div class="m" style="margin-top:8px">'+T('هدف روزانه','Daily goal')+'</div><div class="row">'+[30,45,60,90,120,180].map(m=>'<button class="chip '+((F().gm||p.g)===m?'on':'')+'" data-a="ob_gm" data-m="'+m+'">'+mins(m)+'</button>').join('')+'</div>'
   +'<div class="row" style="margin-top:10px"><button class="p" data-a="ob_act">'+T('ساخت / انتخاب','Create / select')+'</button></div>'}},
 {k:'dl',t:['یک موعد (اختیاری)','A deadline (optional)'],why:['اگر تاریخ مهمی داری (آزمون، تحویل)، همه‌ی پیشنهادهای برنامه حولِ آن چیده می‌شود و یادآوری‌ها خودکار ساخته می‌شود.','If you have an important date (exam, delivery), suggestions center on it and reminders are created automatically.'],
  done:()=>!!F().dl||!!F().dl_s||(zDL().items||[]).length>0,
  body:()=>'<label>'+T('عنوان','Title')+'</label><input id="ob-dt" maxlength="100" style="width:100%"><label>'+T('تاریخ','Date')+'</label><input id="ob-dd" dir="ltr" inputmode="numeric" placeholder="'+ex()+'" style="width:100%">'
   +'<div class="row" style="margin-top:10px"><button class="p" data-a="ob_dl">'+T('ثبت موعد','Add deadline')+'</button><button data-a="ob_flag" data-f="dl_s">'+T('ندارم / بعداً','None / later')+'</button></div>'},
 {k:'plan',t:['برنامه‌ی امروز','Today\'s plan'],why:['یک کار کوچک برای امروز بنویس. برنامه‌ی کوچک اجرا می‌شود.','Write one small task for today. Small plans get done.'],
  done:()=>!!F().plan||(db.plans[todayISO()]||[]).length>0,
  body:()=>{const a=myAct();return a?'<div class="m">'+esc(aN(a))+' — '+T('چند دقیقه؟','how long?')+'</div><div class="row">'+[15,30,45,60,90].map(m=>'<button class="chip" data-a="ob_plan" data-m="'+m+'">'+mins(m)+'</button>').join('')+'</div>':'<p class="m">'+T('اول فعالیت اصلی را بساز.','Create your main activity first.')+'</p>'}},
 {k:'do',t:['اولین ثبت زمان','Your first time log'],why:['برد سریع: همین الان یک ثبت کوتاه انجام بده تا چرخه شروع شود.','Quick win: log something short now to start the cycle.'],
  done:()=>db.entries.length>OB().base||(db.timer&&db.timer.state&&db.timer.state!=='ready'),
  body:()=>{const a=myAct();if(!a)return'<p class="m">'+T('اول فعالیت اصلی را بساز.','Create your main activity first.')+'</p>';
   return'<div class="row"><button class="p" data-a="ob_go" data-w="sw">▶ '+T('شروع کرنومتر','Start stopwatch')+'</button>'+(window.daniPomoStart?'<button class="chip" data-a="ob_go" data-w="pm">🍅 '+T('پومودورو','Pomodoro')+'</button>':'')+'</div>'
   +'<div class="m" style="margin-top:8px">'+T('یا کاری که تازه انجام دادی را ثبت کن:','Or log what you just did:')+'</div><div class="row">'+[15,30,45,60].map(m=>'<button class="chip" data-a="ob_log" data-m="'+m+'">'+mins(m)+'</button>').join('')+'</div>'}},
 {k:'review',t:['نتیجه و فردا','Result & tomorrow'],why:['هر روز با یک نگاه به نتیجه و یک جمله برای فردا بسته می‌شود؛ این همان «کپسول» است که فردا صبح می‌بینی.','Each day closes with a look at the result and one sentence for tomorrow — the "capsule" you will see tomorrow morning.'],
  done:()=>!!F().review,
  body:()=>{const t=todayISO(),tot=sum(E(t)),a=myAct(),g=(db.acts.find(x=>x.id===a)||{}).goalDay||0,dd=db.days[t]||{};
   return'<div class="c" style="margin:0 0 8px"><b>'+T('امروز','Today')+': '+mins(tot)+'</b>'+(g?'<div class="m">'+T('هدف','Goal')+': '+mins(g)+' — '+fa(Math.min(100,Math.round(tot/g*100)))+'٪</div>':'')+'</div>'
   +'<label>'+T('چه یاد گرفتی / چه شد؟','What did you learn / how did it go?')+'</label><input id="ob-ln" maxlength="200" style="width:100%" value="'+esc(dd.learned||'')+'">'
   +'<label>'+T('کپسول: فردا اول از همه…','Capsule: tomorrow, first thing…')+'</label><input id="ob-cp" maxlength="200" style="width:100%" value="'+esc(dd.tomorrow||'')+'">'
   +'<div class="row" style="margin-top:10px"><button class="p" data-a="ob_rev">'+T('ذخیره','Save')+'</button></div>'}},
 {k:'notif',t:['اعلان‌ها','Notifications'],why:['برای زنگ پایان تایمر، یادآورها و «برنامه‌ی فردا» به مجوز اعلان نیاز است. پیوستگی تو به همین یادآوری‌ها بستگی دارد.','Timer alarms, reminders and "plan tomorrow" need notification permission. Your streak depends on these nudges.'],
  done:()=>{try{return(typeof Notifier!=='undefined'&&Notifier.state.perm==='granted')||(('Notification' in window)&&Notification.permission==='granted')||!!F().notif_s}catch(e){return !!F().notif_s}},
  body:()=>'<div class="row"><button class="p" data-a="ob_nt">'+T('فعال‌سازی اعلان‌ها','Enable notifications')+'</button><button data-a="ob_flag" data-f="notif_s">'+T('بعداً','Later')+'</button></div><p class="m">'+T('بعداً می‌توانی صدای هر دسته را در تنظیمات ← زمان و اعلان عوض کنی.','You can change each category\'s sound later in Settings → Time & alerts.')+'</p>'},
 {k:'home',t:['خانه‌ی خودت','Your Home'],why:['یک چیدمان پیشنهادی بر اساس هدفت؛ هر وقت خواستی از «شخصی‌سازی خانه» (پایین صفحه‌ی خانه) عوضش کن.','A suggested layout for your goal; change it anytime via "Customize home" at the bottom of Home.'],
  done:()=>!!F().home,
  body:()=>{const rec=(PUR[OB().purpose]||PUR.other).h,P={minimal:['مینیمال','Minimal'],focus:['تمرکز','Focus'],student:['دانشجو','Student'],full:['کامل','Full']};
   return'<div class="row">'+Object.keys(P).map(k=>'<button class="chip '+(k===rec?'on':'')+'" data-a="ob_home" data-k="'+k+'">'+esc(T(P[k][0],P[k][1]))+(k===rec?' ★':'')+'</button>').join('')+'<button class="chip" data-a="ob_home" data-k="classic">'+T('کلاسیک (چیدمان تم)','Classic (theme layout)')+'</button></div><p class="m">★ '+T('پیشنهاد برای هدف تو','Suggested for your goal')+'</p>'}}
];
const idx=()=>{const i=S.findIndex(s=>!s.done());return i<0?S.length:i};
let CUR=-1;
function draw(){const o=OB(),i=CUR>=0?CUR:idx();CUR=i;
  if(i>=S.length){o.fin=1;save();modal(finish());return}
  const s=S[i];
  const bar='<div style="display:flex;gap:3px;margin:4px 0 10px">'+S.map((x,j)=>'<i style="flex:1;height:5px;border-radius:3px;background:'+(x.done()?'var(--ok,#16a34a)':j===i?'var(--pr,#2563eb)':'#8885')+'"></i>').join('')+'</div>';
  modal('<div class="row"><b>🧭 '+T('راهنمای شروع','Getting started')+'</b><span class="sp"></span><span class="m">'+fa(i+1)+' / '+fa(S.length)+'</span></div>'+bar
   +'<h3 style="margin:4px 0">'+esc(T(s.t[0],s.t[1]))+'</h3><p class="m">'+esc(T(s.why[0],s.why[1]))+'</p>'+s.body()
   +'<div class="row" style="margin-top:14px"><button data-a="ob_prev"'+(i===0?' disabled':'')+'>‹ '+T('قبلی','Back')+'</button><button data-a="ob_next">'+T('رد کردن ›','Skip ›')+'</button><span class="sp"></span><button data-a="ob_close">'+T('بعداً ادامه می‌دهم','Continue later')+'</button></div>')}
function finish(){return'<h3>🎉 '+T('آماده‌ای!','You are set!')+'</h3><p class="m">'+T('چرخه‌ی هر روز فقط سه حرکت است:','Every day is just three moves:')+'</p>'
  +'<div class="c" style="margin:6px 0">1️⃣ '+T('صبح: «بعدی چی؟» را ببین و برنامه‌ی امروز را ببند','Morning: check "What next?" and set today\'s plan')+'<br>2️⃣ '+T('روز: با یک لمس شروع کن (ثبت ۵ ثانیه‌ای / کرنومتر / پومودورو)','Day: start with one tap (5-sec log / stopwatch / Pomodoro)')+'<br>3️⃣ '+T('شب: نتیجه را ببین و یک کپسول برای فردا بنویس','Night: see the result and write a capsule for tomorrow')+'</div>'
  +'<div class="m">'+T('قدم‌های بعدی (هر وقت خواستی):','Next steps (whenever you like):')+'</div><div class="row">'
  +'<button class="chip" data-a="ob_to" data-p="hab">🔁 '+T('یک عادت بساز','Add a habit')+'</button><button class="chip" data-a="ob_to" data-p="rem">⏰ '+T('یادآوری','Reminder')+'</button><button class="chip" data-a="ob_to" data-p="sound">🎵 '+T('صدای اعلان‌ها','Sounds')+'</button><button class="chip" data-a="ob_to" data-p="bk">🛡 '+T('پشتیبان','Backup')+'</button><button class="chip" data-a="ob_to" data-p="qa">🔎 '+T('جستجوی سراسری','Search anything')+'</button></div>'
  +'<div class="row" style="margin-top:12px"><button class="p" data-a="h2_close">'+T('شروع می‌کنم','Let\'s go')+'</button></div>'}
function open(i){CUR=(i===undefined?-1:i);draw()}
H.ob_open=()=>{CUR=-1;OB().dis=0;OB().opened=1;draw()};
H.ob_close=()=>{closeM();render()};
H.ob_next=()=>{CUR=Math.min(S.length,(CUR<0?idx():CUR)+1);draw()};
H.ob_prev=()=>{CUR=Math.max(0,(CUR<0?idx():CUR)-1);draw()};
const adv=()=>{save();CUR=-1;draw()};
H.ob_pur=e=>{OB().purpose=e.dataset.k;const g=($('#ob-goal')||{}).value;if(g)F().goalTxt=g;save();draw()};
H.ob_s1=()=>{const o=OB();if(!o.purpose)return toast(T('یکی را انتخاب کن','Pick one'),1);const g=(($('#ob-goal')||{}).value||F().goalTxt||'').trim();
  if(g&&!db.goals.some(x=>x.t===g))db.goals.push({t:g.slice(0,100),actId:'',w:0,due:''});adv()};
H.ob_cal=e=>{db.set.cal=e.dataset.v;save();render();draw()};
H.ob_lang=e=>{db.set.lang=e.dataset.v;try{I18_MEMO.clear();i18Apply()}catch(x){}save();render();draw()};
H.ob_flag=e=>{F()[e.dataset.f]=1;adv()};
H.ob_gm=e=>{F().gm=+e.dataset.m;const v=($('#ob-an')||{}).value;if(v)F().an=v;save();draw();const i=$('#ob-an');if(i&&F().an)i.value=F().an};
H.ob_act=()=>{const n=(($('#ob-an')||{}).value||'').trim();if(!n)return toast(T('نام را بنویس','Enter a name'),1);const p=PUR[OB().purpose]||PUR.other,g=F().gm||p.g;
  let a=db.acts.find(x=>x.name===n);if(!a){a={id:uid(),name:n,cat:'learn',color:CATS.learn?CATS.learn[1]:'#2563eb',tags:[],prio:'',goalDay:0,goalWeek:0,subs:[],desc:'',active:true,arch:false,days:[]};db.acts.push(a)}
  a.active=true;a.arch=false;a.goalDay=g;F().act=a.id;adv()};
H.ob_dl=()=>{const t=(($('#ob-dt')||{}).value||'').trim(),d=readD(($('#ob-dd')||{}).value||'');if(!t)return toast(T('عنوان را بنویس','Enter a title'),1);if(!d)return toast(T('تاریخ معتبر نیست','Invalid date'),1);
  const A=zDL(),c=(dlCats()[0]||{}).id||'';A.items.push({id:'d'+uid(),title:t.slice(0,100),cat:c,imp:2,dt:d,tm:'09:00',note:'',cr:Date.now(),done:false,arch:false,al:[1440,60]});F().dl=1;adv()};
H.ob_plan=e=>{const a=myAct(),m=+e.dataset.m;if(!a)return;(db.plans[todayISO()]=db.plans[todayISO()]||[]).push({id:uid(),actId:a,start:'',end:'',goal:m,status:'todo',reason:''});F().plan=1;adv()};
H.ob_go=e=>{const a=myAct();if(!a)return;closeM();if(e.dataset.w==='pm'&&window.daniPomoStart){window.daniPomoStart(a)}else{TM.start('sw',a,'',0)}render();try{toast(T('کار که تمام شد، توقف را بزن؛ بعد از کارت «راهنمای شروع» در خانه ادامه بده.','When done, press stop, then continue from the guide card on Home.'))}catch(x){}};
H.ob_log=e=>{const a=myAct(),m=+e.dataset.m;if(!a)return;const en=nowHM();if(tm(en)-m<0)return toast(T('این بازه از نیمه‌شب می‌گذرد','Crosses midnight'),1);
  db.entries.push({id:uid(),date:todayISO(),actId:a,subId:'',start:hm(tm(en)-m),end:en,min:m,note:'',src:'quick'});adv()};
H.ob_rev=()=>{const t=todayISO(),d=db.days[t]=db.days[t]||{};d.learned=(($('#ob-ln')||{}).value||'').slice(0,200);d.tomorrow=(($('#ob-cp')||{}).value||'').slice(0,200);F().review=1;adv()};
H.ob_nt=async()=>{try{if(H.nt_perm)await H.nt_perm()}catch(e){}setTimeout(()=>{CUR=-1;draw()},500)};
H.ob_home=e=>{const k=e.dataset.k;try{if(k==='classic'){H.h2_off()}else{H.h2_pre({dataset:{k}})}}catch(x){}F().home=1;save();closeM();render();CUR=-1;draw()};
H.ob_to=e=>{const p=e.dataset.p;closeM();const QA=window.daniQuickAccess;
  if(p==='hab')QA&&QA.go('hab');else if(p==='rem')QA&&QA.go('rem-up');else if(p==='sound')window.daniQAFn&&window.daniQAFn.snd&&window.daniQAFn.snd();else if(p==='bk')QA&&QA.go('st-data');else if(p==='qa')QA&&QA.open()};
H.ob_dis=()=>{OB().dis=1;save();render()};
/* کارت خانه */
function card(){const o=OB();if(o.dis||o.fin)return'';if(db.entries.length>14&&!o.purpose&&!o.opened)return'';const i=idx();if(i>=S.length)return'';
  return'<div class="c obcard"><div class="row"><b>🧭 '+T('راهنمای شروع','Getting started')+'</b><span class="sp"></span><span class="m">'+fa(i)+'/'+fa(S.length)+'</span></div><div class="m">'+T('قدم بعدی: ','Next: ')+esc(T(S[i].t[0],S[i].t[1]))+'</div><div class="row" style="margin-top:6px"><button class="p" data-a="ob_open">'+T('ادامه','Continue')+'</button><button data-a="ob_dis">'+T('نمایش نده','Hide')+'</button></div></div>'}
function inject(){if(page!=='home')return;const pg=document.getElementById('pg');if(!pg||pg.querySelector('.obcard'))return;const h=card();if(!h)return;
  const first=[...pg.querySelectorAll('.c')].find(c=>!c.parentElement.closest('.c'));const d=document.createElement('div');d.innerHTML=h;if(first)first.parentElement.insertBefore(d.firstChild,first);else pg.appendChild(d.firstChild)}
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{inject()}catch(e){console.error('ob',e)}return r}}
window.daniOnboard={open,steps:S};
/* نصب تازه: باز شدن خودکار (یک‌بار) */
setTimeout(()=>{try{const o=db.set.ob;if((o&&(o.opened||o.purpose||o.fin||o.dis))||db.entries.length>14||localStorage.getItem('dani_ob_seen'))return;localStorage.setItem('dani_ob_seen','1');OB().opened=1;save();CUR=-1;draw()}catch(e){}},1800);
})();
