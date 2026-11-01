"use strict";
/* DANI · tomorrow.js — «برنامه‌ی فردا» (شب قبل): صفحه‌ی اختصاصی PG.tmr (و «برنامه‌ی امروز» با همین ویرایشگر)
   - یک کادر چندخطی: «۲ ساعت فیلم ریاضی، ۱ ساعت تست حل کنم» ← ردیف‌های مرتب (فعالیت + زیرمجموعه + مدت + ساعت اختیاری + ★ مهم‌ترین)
   - جمع کل در برابر ظرفیت واقعی خودت (میانگین ۱۴ روز اخیر)، پیشنهادها (growth.js)، چیدن در ساعت‌ها (اختیاری)، «توقع من از فردا»
   - ذخیره در db.plans[روز] (هم‌شکل با برنامه‌ی موجود) + db.days[روز].goal (مهم‌ترین کار) و .exp (توقع)
   - اعلان: همان اعلان شبِ rhythm.js (db.set.rh.tPlan) + تکرارهای اختیاری تا وقتی برنامه بسته شود + اعلان «نتیجه‌ی امروز» (db.set.tn.eod/tEod)؛ ضربه روی اعلان مستقیم صفحه‌ی درست را باز می‌کند.
   داده‌ی تنظیمات: db.set.tn {on,rep,gap,eod,tEod,done:{تاریخ:1}} */
(function(){
const T=window.daniT;
const say=(m,b)=>{try{toast(m,b)}catch(e){}};
const TN=()=>{const s=db.set;if(!s.tn||typeof s.tn!=='object')s.tn={};const o=s.tn;if(o.on===undefined)o.on=1;if(o.rep===undefined)o.rep=2;if(o.gap===undefined)o.gap=10;if(o.eod===undefined)o.eod=1;if(!/^\d\d:\d\d$/.test(o.tEod||''))o.tEod='20:00';if(!o.done||typeof o.done!=='object')o.done={};return o};
const RHs=()=>{const s=db.set;if(!s.rh||typeof s.rh!=='object')s.rh={};if(!/^\d\d:\d\d$/.test(s.rh.tPlan||''))s.rh.tPlan='20:30';return s.rh};
const nz=s=>window.daniNz?window.daniNz(s):String(s||'').toLowerCase();
const SKIP=new Set(['فیلم','ویدیو','ویدئو','تست','حل','مرور','جزوه','تمرین','کار','کردن','کنم','بخونم','بخوانم','بینم','ببینم','مطالعه','درس','video','test','review','notes','practice','work']);

/* ---------- حالت صفحه ---------- */
let PLN={date:'',rows:[],star:'',exp:'',txt:'',saved:false,cfg:false,init:''};
const tmrDate=()=>addD(todayISO(),1);
function load(date){PLN.date=date;PLN.saved=false;PLN.txt='';
  PLN.rows=(db.plans&&db.plans[date]||[]).map(x=>({id:x.id,actId:x.actId,subId:x.subId||'',min:+x.goal||(x.start&&x.end?dur(x.start,x.end):30),start:x.start||'',status:x.status||'todo',reason:x.reason||'',nn:''}));
  const dd=db.days[date]||{};PLN.exp=dd.exp||'';PLN.star='';
  if(dd.goal){const r=PLN.rows.find(x=>x.actId&&aN(x.actId)===dd.goal);if(r)PLN.star=r.id}
  PLN.init=date}
window.daniPlanOpen=(date)=>{load(date||tmrDate());page='tmr';render();try{window.scrollTo(0,0)}catch(e){}};
H.tmr_open=e=>window.daniPlanOpen(e&&e.dataset&&e.dataset.d?e.dataset.d:tmrDate());
const rid=()=>'n'+Math.random().toString(36).slice(2,8);

/* ---------- تجزیه‌ی متن ---------- */
const durRe=/(\d+(?:\.\d+)?\s*(?:ساعت|h|hr|hrs|hours?|دقیقه|min|mins|minutes|m)\b|نیم ساعت|یک ساعت|half an hour|an hour)/i;
function pieces(line){const s=nz(line);const parts=String(line).split(/\s*(?:،|,|;|\+)\s*|\s+و\s+(?=[\d۰-۹٠-٩]|نیم |یک )|\s+and\s+(?=\d|half |an |one )/i).filter(x=>x&&x.trim());
  if(parts.length>1&&parts.every(p=>durRe.test(nz(p))))return parts;return[line]}
function matchAct(name){const q=nz(name).split(/\s+/).filter(Boolean);if(!q.length)return null;
  let best=null,bs=0;db.acts.filter(a=>a.active&&!a.arch).forEach(a=>{const an=nz(a.name),subs=(a.subs||[]).map(s=>({s,n:nz(s.name)}));let sc=0,sub=null;
    q.forEach(w=>{if(w.length<2)return;const core=!SKIP.has(w);if(an.includes(w))sc+=core?3:1;else if(core&&w.length>=3&&an.split(/\s+/).some(t=>t.length>=3&&(t.startsWith(w)||w.startsWith(t))))sc+=1.5;
      const hit=subs.find(x=>x.n.includes(w)||w.includes(x.n));if(hit&&hit.n.length>=2){sc+=2;sub=sub||hit.s}});
    if(an===q.join(' '))sc+=5;
    if(sc>bs){bs=sc;best={a,sub}}});
  return bs>=1.5?best:null}
function addLine(line){let n=0;pieces(line).forEach(p=>{const r=window.daniQuickParse?window.daniQuickParse(p):null;if(!r||!r.name)return;
    const m=matchAct(r.name),min=r.min||(m&&m.a.goalDay)||45;
    PLN.rows.push({id:rid(),actId:m?m.a.id:'',subId:m&&m.sub?m.sub.id:'',min,start:r.st||'',status:'todo',reason:'night',nn:m?'':r.name.slice(0,80)});n++});return n}
function addText(){const t=document.getElementById('tp-in'),v=t?t.value:PLN.txt;let n=0;String(v||'').split(/\n+/).forEach(l=>{if(l.trim())n+=addLine(l)});
  if(!n)return say(T('چیزی فهمیده نشد؛ مثلاً بنویس «۲ ساعت فیلم ریاضی»','Nothing understood — try “2 hours maths video”'),1);PLN.txt='';PLN.saved=false;render()}

/* ---------- ظرفیت و جمع ---------- */
function capacity(){const t=todayISO(),by={};(E(addD(t,-14),addD(t,-1))||[]).forEach(e=>{const a=act(e.actId);if(!a||a.cat==='sleep'||a.cat==='rest')return;by[e.date]=(by[e.date]||0)+(e.min||0)});
  const v=Object.values(by).filter(x=>x>=30);return v.length>=3?Math.round(v.reduce((a,b)=>a+b,0)/v.length/5)*5:0}
const total=()=>PLN.rows.reduce((s,r)=>s+(+r.min||0),0);
function verdict(tot,cap){if(!tot)return{c:'#94a3b8',t:T('هنوز چیزی ننوشته‌ای','Nothing yet')};
  if(!cap)return{c:'#3b82f6',t:T('داده‌ی کافی برای مقایسه نیست؛ چند روز ثبت کن تا ظرفیت واقعی‌ات را بدانم.','Not enough history to compare yet — log a few days so I can learn your real capacity.')};
  const r=tot/cap;if(r<=.85)return{c:'#22c55e',t:T('سبک و شدنی؛ می‌توانی یک کار کوچک هم اضافه کنی.','Light and doable — you could add one small item.')};
  if(r<=1.15)return{c:'#22c55e',t:T('واقع‌بینانه؛ هم‌اندازه‌ی چیزی که معمولاً انجام می‌دهی.','Realistic — about what you normally get done.')};
  if(r<=1.4)return{c:'#f59e0b',t:T('کمی سنگین؛ مهم‌ترین کار را ستاره بزن تا حتماً انجام شود.','A bit heavy — star the one that must happen.')};
  return{c:'#ef4444',t:T('خیلی بیشتر از ظرفیت معمولت؛ یکی دو کار را کوتاه کن یا به روز دیگر ببر.','Well above your usual capacity — trim one or two items or move them.')}}

/* ---------- ذخیره ---------- */
function ensureActs(){const made=[];PLN.rows.forEach(r=>{if(!r.actId&&r.nn){let a=db.acts.find(x=>x.name.toLowerCase()===r.nn.toLowerCase());if(!a){const ck=typeof catOf==='function'?catOf(r.nn):'personal';a={id:uid(),name:r.nn,cat:ck,tags:[],color:(CATS[ck]||CATS.personal)[1],prio:'',goalDay:0,goalWeek:0,subs:[],desc:'',active:true,days:[]};db.acts.push(a);made.push(a.name)}r.actId=a.id}});return made}
H.tp_save=()=>{const rows=PLN.rows.filter(r=>r.actId||r.nn);if(!rows.length)return say(T('دست‌کم یک کار اضافه کن','Add at least one item'),1);
  const made=ensureActs(),d=PLN.date;if(!db.plans)db.plans={};
  db.plans[d]=rows.map(r=>{const end=r.start?hm((tm(r.start)+(+r.min||30))%1440):'';return{id:r.id&&!/^n/.test(r.id)?r.id:uid(),actId:r.actId,subId:r.subId||'',start:r.start||'',end,goal:+r.min||30,status:r.status||'todo',reason:r.reason||'night'}});
  const dd=db.days[d]=db.days[d]||{};dd.exp=String(PLN.exp||'').slice(0,300);
  const sr=rows.find(r=>r.id===PLN.star);if(sr&&sr.actId)dd.goal=aN(sr.actId);
  TN().done[d]=1;const keys=Object.keys(TN().done).sort();while(keys.length>30)delete TN().done[keys.shift()];
  if(!save())return;PLN.saved=true;try{if(typeof Notifier!=='undefined')Notifier.sync(true)}catch(e){}
  say(T('برنامه‌ی '+fmtDL(d)+' ثبت شد ✓','Plan for '+fmtDL(d)+' saved ✓'));render()};
H.tp_edit=()=>{PLN.saved=false;render()};

/* ---------- عمل‌های ردیف ---------- */
const row=id=>PLN.rows.find(r=>r.id===id);
H.tp_add=addText;
H.tp_del=e=>{PLN.rows=PLN.rows.filter(r=>r.id!==e.dataset.i);if(PLN.star===e.dataset.i)PLN.star='';render()};
H.tp_min=e=>{const r=row(e.dataset.i);if(!r)return;r.min=Math.max(5,Math.min(720,(+r.min||0)+(+e.dataset.n)));render()};
H.tp_star=e=>{PLN.star=PLN.star===e.dataset.i?'':e.dataset.i;render()};
H.tp_mv=e=>{const i=PLN.rows.findIndex(r=>r.id===e.dataset.i),j=i+(+e.dataset.n);if(i<0||j<0||j>=PLN.rows.length)return;const t=PLN.rows[i];PLN.rows[i]=PLN.rows[j];PLN.rows[j]=t;render()};
H.tp_sug=e=>{const l=window.daniSuggest?window.daniSuggest():[],x=l.find(z=>z.a.id===e.dataset.aid);if(!x)return;PLN.rows.push({id:rid(),actId:x.a.id,subId:'',min:x.dur,start:'',status:'todo',reason:x.why,nn:''});render()};
H.tp_rec=e=>{const a=db.acts.find(z=>z.id===e.dataset.aid);if(!a)return;PLN.rows.push({id:rid(),actId:a.id,subId:'',min:a.goalDay||45,start:'',status:'todo',reason:'night',nn:''});render()};
H.tp_copy=()=>{const y=addD(PLN.date,-1);const l=(db.plans[y]||[]);if(!l.length)return say(T('دیروز برنامه‌ای نبود','No plan yesterday'),1);l.forEach(x=>PLN.rows.push({id:rid(),actId:x.actId,subId:x.subId||'',min:+x.goal||30,start:'',status:'todo',reason:'copy',nn:''}));render()};
H.tp_arr=()=>{let cur=tm(window.__tpst||(db.set.pf&&db.set.pf.start)||'09:00');PLN.rows.forEach(r=>{r.start=hm(cur%1440);cur+=(+r.min||30)+10});render()};
H.tp_clr=()=>{PLN.rows.forEach(r=>{r.start=''});render()};
H.tp_cfg=()=>{PLN.cfg=!PLN.cfg;render()};
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset)return;const d=t.dataset;
  if(d.tpa){const r=row(d.tpa);if(!r)return;if(t.value==='__new'){const n=prompt(T('نام فعالیت تازه','New activity name'),'');if(n&&n.trim()){r.actId='';r.nn=n.trim().slice(0,80)}render();return}r.actId=t.value;r.nn='';r.subId='';render()}
  else if(d.tps){const r=row(d.tps);if(r)r.subId=t.value}
  else if(d.tpt){const r=row(d.tpt);if(r)r.start=/^\d\d:\d\d$/.test(t.value)?t.value:''}
  else if(d.tpm){const r=row(d.tpm);if(r){r.min=Math.max(5,Math.min(720,+t.value||30));render()}}
  else if(d.tnk){const o=TN();if(d.tnk==='on')o.on=t.checked?1:0;else if(d.tnk==='eod')o.eod=t.checked?1:0;else if(d.tnk==='rep')o.rep=Math.max(0,Math.min(3,+t.value||0));else if(d.tnk==='gap')o.gap=Math.max(5,Math.min(30,+t.value||10));
    else if(d.tnk==='tPlan'&&/^\d\d:\d\d$/.test(t.value))RHs().tPlan=t.value;else if(d.tnk==='tEod'&&/^\d\d:\d\d$/.test(t.value))o.tEod=t.value;else if(d.tnk==='rhon')RHs().plan=t.checked?1:0;
    save();try{Notifier.sync(true)}catch(x){}}
  else if(t.id==='tp-st'&&/^\d\d:\d\d$/.test(t.value))window.__tpst=t.value});
document.addEventListener('input',e=>{const t=e.target;if(!t)return;if(t.id==='tp-in')PLN.txt=t.value;else if(t.id==='tp-exp')PLN.exp=t.value});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)&&e.target&&e.target.id==='tp-in'){e.preventDefault();addText()}});

/* ---------- صفحه ---------- */
function rowHTML(r,i){const a=r.actId?act(r.actId):null,subs=a&&a.subs||[];
  const sel='<select data-tpa="'+r.id+'" style="flex:1;min-width:0">'+(r.actId?'':'<option value="" selected>'+(r.nn?'🆕 '+esc(r.nn):T('انتخاب فعالیت…','Pick activity…'))+'</option>')+aOpts(r.actId)+'<option value="__new">＋ '+T('فعالیت تازه…','New activity…')+'</option></select>';
  return'<div class="tpr'+(PLN.star===r.id?' st':'')+'"><div class="row" style="flex-wrap:nowrap;gap:4px">'
   +'<button class="chip" data-a="tp_star" data-i="'+r.id+'" aria-label="star" title="'+esc(T('مهم‌ترین کار','Most important'))+'">'+(PLN.star===r.id?'★':'☆')+'</button>'+sel
   +'<button class="chip" data-a="tp_mv" data-i="'+r.id+'" data-n="-1" '+(i?'':'disabled')+'>↑</button><button class="chip" data-a="tp_mv" data-i="'+r.id+'" data-n="1" '+(i<PLN.rows.length-1?'':'disabled')+'>↓</button><button class="chip" data-a="tp_del" data-i="'+r.id+'" aria-label="delete">🗑</button></div>'
   +'<div class="row" style="gap:4px;margin-top:4px;align-items:center">'
   +'<button class="chip" data-a="tp_min" data-i="'+r.id+'" data-n="-15">−</button><input type="number" min="5" max="720" step="5" value="'+(+r.min||30)+'" data-tpm="'+r.id+'" style="width:64px;text-align:center"><span class="m">'+T('دقیقه','min')+'</span><button class="chip" data-a="tp_min" data-i="'+r.id+'" data-n="15">＋</button>'
   +'<span style="flex:1"></span>'+(subs.length?'<select data-tps="'+r.id+'" style="max-width:120px"><option value="">'+T('زیرمجموعه','Sub-item')+'</option>'+subs.map(s=>'<option value="'+s.id+'" '+(s.id===r.subId?'selected':'')+'>'+esc(s.name)+'</option>').join('')+'</select>':'')
   +'<input type="time" value="'+esc(r.start)+'" data-tpt="'+r.id+'" title="'+esc(T('ساعت شروع (اختیاری)','Start time (optional)'))+'"></div></div>'}
function sugHTML(){let l=[];try{l=(window.daniSuggest?window.daniSuggest():[]).filter(x=>!PLN.rows.some(r=>r.actId===x.a.id))}catch(e){}
  const rec=[],seen=new Set(PLN.rows.map(r=>r.actId));(db.entries||[]).slice(-80).reverse().forEach(e=>{const a=act(e.actId);if(a&&a.active&&!a.arch&&!seen.has(a.id)&&a.cat!=='sleep'&&a.cat!=='rest'&&rec.length<6){seen.add(a.id);rec.push(a)}});
  let h='';
  if(l.length)h+='<div class="m" style="margin-top:8px">'+T('پیشنهاد برای این روز','Suggested for this day')+'</div><div class="row">'+l.map(x=>'<button class="chip" data-a="tp_sug" data-aid="'+x.a.id+'">＋ '+esc(x.a.name)+' · '+mm(x.dur)+' <small class="m">('+esc(x.why)+')</small></button>').join('')+'</div>';
  if(rec.length)h+='<div class="m" style="margin-top:8px">'+T('اخیراً','Recent')+'</div><div class="row">'+rec.map(a=>'<button class="chip" data-a="tp_rec" data-aid="'+a.id+'">＋ '+esc(a.name)+'</button>').join('')+'</div>';
  return h}
function cfgHTML(){const o=TN(),r=RHs();
  return'<div class="c" style="margin-top:10px">'+daniH('🔔','اعلان و تکرار','Reminder & repeats')
   +'<label class="m" style="display:block;margin:4px 0"><input type="checkbox" data-tnk="rhon" '+(r.plan!==0?'checked':'')+'> '+T('اعلان «برنامه‌ی فردا» در ساعت','“Plan tomorrow” notification at')+' <input type="time" data-tnk="tPlan" value="'+esc(r.tPlan)+'"></label>'
   +'<label class="m" style="display:block;margin:4px 0">'+T('اگر برنامه بسته نشد، تکرار شود','If not planned, repeat')+' <input type="number" min="0" max="3" data-tnk="rep" value="'+o.rep+'" style="width:52px"> '+T('بار، هر','times, every')+' <input type="number" min="5" max="30" data-tnk="gap" value="'+o.gap+'" style="width:56px"> '+T('دقیقه','min')+'</label>'
   +'<label class="m" style="display:block;margin:4px 0"><input type="checkbox" data-tnk="eod" '+(o.eod?'checked':'')+'> '+T('اعلان «نتیجه‌ی امروز» در ساعت','“Today’s result” notification at')+' <input type="time" data-tnk="tEod" value="'+esc(o.tEod)+'"></label>'
   +'<p class="m">'+T('اعلان‌ها فقط در اپ اندروید کار می‌کنند. ضربه روی اعلان مستقیم همین صفحه را باز می‌کند.','Notifications work in the Android app only. Tapping one opens this page directly.')+'</p></div>'}
PG.tmr=function(){if(PLN.init===''||(PLN.date&&PLN.init!==PLN.date))load(PLN.date||tmrDate());
  const d=PLN.date,isT=d===todayISO(),ttl=isT?T('برنامه‌ی امروز','Plan for today'):T('برنامه‌ی فردا','Plan for tomorrow'),tot=total(),cap=capacity(),v=verdict(tot,cap);
  let oc='';try{if(window.daniOccasions)oc=window.daniOccasions(d).filter(x=>!x.wk).map(x=>(x.h?'🟥 ':'▫️ ')+esc(x.n)).join(' · ')}catch(e){}
  let h='<div class="c tpc">'+daniH(isT?'📝':'🌙',isT?'برنامه‌ی امروز':'برنامه‌ی فردا',isT?'Plan for today':'Plan for tomorrow')+'<div class="m">'+fmtDL(d)+(oc?' · '+oc:'')+'</div>';
  if(PLN.saved){const tp=PLN.rows;h+='<div style="text-align:center;padding:14px 0"><div style="font-size:2.4em">✅</div><b>'+T('آماده است','All set')+'</b><div class="m">'+fa(tp.length)+' '+T('کار','items')+' · '+mm(tot)+(PLN.exp?'<br>💭 '+esc(PLN.exp):'')+'</div></div>'
     +tp.map(r=>'<div class="cwr">'+(PLN.star===r.id?'★ ':'')+'<b>'+esc(r.actId?aN(r.actId):r.nn)+'</b> · '+mm(r.min)+(r.start?' · '+r.start:'')+'</div>').join('')
     +'<div class="row" style="margin-top:10px"><button class="p" data-a="go" data-p="day">'+T('برو به امروز','Go to Today')+'</button><button class="chip" data-a="tp_edit">✎ '+T('ویرایش','Edit')+'</button></div></div>';
    return h+cfgHTML()}
  h+='<p class="m">'+T('هر خط یک کار، با مدت. مثلاً: «۲ ساعت فیلم ریاضی»، «۱ ساعت تست حل کنم». می‌توانی چند کار را با «و» یا «،» پشت هم بنویسی.','One item per line with a duration, e.g. “2 hours maths video”, “1 hour practice tests”. You can chain several with “and” or commas.')+'</p>'
   +'<textarea id="tp-in" rows="3" dir="auto" style="width:100%" placeholder="'+esc(T('۲ ساعت فیلم ریاضی\n۱ ساعت تست حل کنم\n۱ ساعت مرور جزوه','2 hours maths video\n1 hour practice tests\n1 hour review notes'))+'">'+esc(PLN.txt)+'</textarea>'
   +'<div class="row" style="margin-top:6px"><button class="p" data-a="tp_add">＋ '+T('بچین در فهرست','Add to the list')+'</button><button class="chip" data-a="tp_copy">'+T('برنامه‌ی روز قبل','Copy previous day')+'</button></div></div>';
  h+='<div class="c tpc">'+daniH('🗂','فهرست','List')+(PLN.rows.length?PLN.rows.map(rowHTML).join(''):'<p class="m">'+T('هنوز کاری نیست. بالا بنویس یا از پیشنهادها بردار.','Nothing yet — type above or pick a suggestion.')+'</p>')+sugHTML()+'</div>';
  const pct=cap?Math.min(160,Math.round(tot/cap*100)):0;
  h+='<div class="c tpc" style="border-inline-start:4px solid '+v.c+'">'+daniH('📊','جمع و ارزیابی','Total & check')+'<div class="row" style="align-items:baseline"><b style="font-size:1.6em">'+mm(tot)+'</b><span class="m">'+(cap?T('معمولاً انجام می‌دهی: ','You usually do: ')+mm(cap):'')+'</span></div>'
   +(cap?'<div class="bar"><i style="width:'+Math.min(100,pct)+'%;background:'+v.c+'"></i></div>':'')+'<div style="margin-top:6px">'+v.t+'</div>'
   +'<label class="m" style="display:block;margin-top:10px">💭 '+T('توقع من از این روز (یک جمله)','What I expect from this day (one line)')+'</label><input id="tp-exp" dir="auto" style="width:100%" maxlength="300" value="'+esc(PLN.exp)+'" placeholder="'+esc(T('مثلاً: ریاضی را تمام کنم و تمرکزم را حفظ کنم','e.g. finish maths and keep my focus'))+'">'
   +'<div class="row" style="margin-top:8px"><button class="chip" data-a="tp_arr">🕘 '+T('چیدن در ساعت‌ها','Arrange in time')+'</button><label class="m">'+T('شروع','Start')+' <input type="time" id="tp-st" value="'+esc(window.__tpst||(db.set.pf&&db.set.pf.start)||'09:00')+'"></label><button class="chip" data-a="tp_clr">'+T('پاک‌کردن ساعت‌ها','Clear times')+'</button></div>'
   +'<div class="row" style="margin-top:10px"><button class="p" data-a="tp_save" style="flex:1">✓ '+T('ثبت '+(isT?'برنامه‌ی امروز':'برنامه‌ی فردا'),isT?'Save today’s plan':'Save tomorrow’s plan')+'</button><button class="chip" data-a="tp_cfg">⚙</button></div></div>';
  if(PLN.cfg)h+=cfgHTML();return h};
try{ICONS.tmr='<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/><path d="M17 3v4M15 5h4"/>'}catch(e){}
try{BI_NAV.tmr=['Tomorrow','فردا'];EXT_PAGES.add('tmr')}catch(e){}
try{const s=document.createElement('style');s.textContent='.tpr{border:1px solid var(--b,#8883);border-radius:12px;padding:8px;margin:6px 0}.tpr.st{border-color:#f59e0b;background:rgba(245,158,11,.08)}.tpc textarea,.tpc input[type=text]{box-sizing:border-box}';document.head.appendChild(s)}catch(e){}

/* ---------- اعلان‌ها ---------- */
const hs=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return 4e8+Math.abs(h)%1e8};
const atOf=(d,t)=>{const[y,m,dd]=d.split('-').map(Number),[h,n]=t.split(':').map(Number);return new Date(y,m-1,dd,h,n).getTime()};
const quiet=at=>{try{return typeof inQuiet==='function'&&inQuiet(at)}catch(e){return false}};
(window.daniExtraPlan=window.daniExtraPlan||[]).push(now=>{const o=TN(),r=RHs(),out=[],t0=todayISO();
  for(let i=0;i<2;i++){const d=addD(t0,i),nx=addD(d,1);let planned=false;try{planned=!!(o.done[nx]||(db.plans[nx]||[]).length)}catch(e){}
    if(r.plan!==0&&o.on&&!planned){const base=atOf(d,r.tPlan);for(let k=1;k<=o.rep;k++){const at=base+k*o.gap*60000;if(at>now+2000&&!quiet(at))out.push({id:hs('tpr'+d+k),at,title:'DANI 📝',body:T('هنوز برنامه‌ی فردا را نبسته‌ای؛ دو دقیقه کافی است.','Tomorrow isn’t planned yet — two minutes is enough.'),ch:'dani-remind-v2',key:'tp-rep-'+d+'-'+k})}}
    if(o.eod&&/^\d\d:\d\d$/.test(o.tEod)){const at=atOf(d,o.tEod);if(at>now+2000&&!quiet(at)){let body=T('نتیجه‌ی امروزت را ببین و برنامه‌ی فردا را ببند.','See today’s result and set tomorrow’s plan.');
      try{if(d===t0){const mn=sum(E(d)||[]);body=T('امروز '+mm(mn)+' ثبت شد؛ نتیجه را ببین.','Today: '+mm(mn)+' logged — see the result.')}}catch(e){}
      out.push({id:hs('eod'+d),at,title:'DANI 📈',body,ch:'dani-remind-v2',key:'eod-'+d})}}}
  return out});

/* ضربه روی اعلان → صفحه‌ی درست */
function route(k){k=String(k||'');
  if(/^(rh-pl-|tp-rep-)/.test(k))window.daniPlanOpen(tmrDate());
  else if(/^eod-/.test(k)){try{page='res';rt='eod';render();window.scrollTo(0,0)}catch(e){}}
  else if(/^rh-sk-/.test(k)){page='day';render()}}
let lnOk=false;
function hookLN(){if(lnOk)return;try{const p=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.LocalNotifications;if(!p||!p.addListener)return;lnOk=true;
  p.addListener('localNotificationActionPerformed',ev=>{try{if(ev&&(ev.actionId==='tap'||!ev.actionId))route(ev.notification&&ev.notification.extra&&ev.notification.extra.k)}catch(e){console.error('tap route',e)}})}catch(e){}}
setInterval(hookLN,1500);setTimeout(hookLN,300);
if('serviceWorker' in navigator)navigator.serviceWorker.addEventListener('message',e=>{try{if(e.data&&e.data.type==='dani-notif-click')route(e.data.tag)}catch(_){}});
/* دکمه‌ی «برنامه‌ی فردا» در چرخه و جاهای قدیمی به همین صفحه برود */
{const _o=H.rh_plan;if(typeof _o==='function')H.rh_plan=e=>{if(e&&e.dataset&&e.dataset.n==='1')return window.daniPlanOpen(tmrDate());return window.daniPlanOpen(todayISO())}}
window.daniPlanAdd=(date,a,s,min)=>{load(date||tmrDate());PLN.rows.push({id:rid(),actId:a||'',subId:s||'',min:+min||45,start:'',status:'todo',reason:'night',nn:''});PLN.saved=false;page='tmr';render();try{window.scrollTo(0,0)}catch(e){}};
window.daniTmrState={tmrDate,total,capacity};
})();
