/* v144 — «مسیر روشن / Clear Path»: از نگرانی تا اقدام (کارت اختیاری در «امروز»؛ پیش‌فرض خاموش).
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
 if(CP.step){return h+wizard()+'</div>'}
 h+='<p class="m">'+T('یک نگرانی را به یک قدم کوچک و مشخص تبدیل کن.','Turn one worry into one small, clear step.')+'</p><div class="row"><button class="p" data-a="cp_new">＋ '+T('نگرانی تازه','New worry')+'</button></div>';
 h+=open.slice(0,4).map(item).join('')+done.filter(x=>x.ask).map(item).join('');
 const dd=done.filter(x=>x.s1!=null);
 if(done.length){const avg=dd.length?(dd.reduce((a,x)=>a+(x.s0-x.s1),0)/dd.length):null;
  h+='<details style="margin-top:8px"><summary class="m" style="cursor:pointer">'+T('تاریخچه','History')+' · '+fa(done.length)+(avg!=null?' · '+T('میانگین کاهش نگرانی','avg. drop in worry')+' '+fa(Math.round(avg*10)/10):'')+'</summary>'+done.slice(-8).reverse().map(item).join('')+'</details>'}
 return h+'</div>'}
const rid=()=>'w'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
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
document.addEventListener('input',function(e){const t=e.target;if(t&&t.dataset&&t.dataset.cpi&&CP.step)CP.d[t.dataset.cpi]=t.value});
try{window.DANI_SECS.wp=[card,T('مسیر روشن: از نگرانی تا اقدام','Clear Path: from worry to action')]}catch(e){console.error('clearpath',e)}
})();
