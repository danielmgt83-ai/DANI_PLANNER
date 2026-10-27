"use strict";
/* DANI · home2.js — «خانه‌ی جدید»: یک موتور خانه برای همه‌ی تم‌ها، با پیش‌تنظیم و شخصی‌سازی
   - خانه‌ی کلاسیک (چیدمان معمولی، Desk و خانه‌ی اختصاصی هر تم) دست‌نخورده می‌ماند؛ این فقط یک گزینه‌ی کنار آن‌هاست.
   - بخش‌ها از دو کاتالوگ می‌آیند: بخش‌های خانه (HSEC) و کارت‌های میزکار (خط زمانی، پایان روز، کپسول و …) ← یک جا انتخاب می‌شوند.
   - تم فقط ظاهر را می‌دهد (رنگ، تصویر، آیکون)؛ بنر تم (در صورت وجود) به‌عنوان بخش «بنر تم» در دسترس است.
   داده: db.set.h2 = {on, preset, list:[ids]} (کوچک). هوک: window.daniWant در dashToday (dashboard-planner.js). */
(function(){
const T=(fa,en)=>{try{return LANGEN()?en:fa}catch(e){return fa}};
const say=(m,b)=>{try{toast(m,b)}catch(e){}};
/* ---------- کاتالوگ بخش‌ها ---------- */
const DK={rec:['ثبت زمان و تایمر','Timer & quick log'],tl:['خط زمانی امروز','Today\'s timeline'],goals:['پیشرفت اهداف روزانه','Daily goals'],dist:['توزیع زمان','Time distribution'],abars:['سهم فعالیت‌ها','Activity share'],
  energy:['انرژی و تمرکز','Energy & focus'],eod:['یادداشت پایان روز','End-of-day note'],cap:['کپسول دیروز','Yesterday\'s capsule'],logs:['ثبت‌های امروز','Today\'s entries'],time:['زمان ثبت‌شده امروز','Time logged today'],
  note:['یادداشت سریع','Quick note'],sum:['جمع‌بندی هوشمند امروز','Smart summary'],top:['هدف اصلی و پیشرفت','Main goal & progress']};
const HK={dlc:['موعد بعدی','Next deadline'],overdue:['کارهای عقب‌افتاده','Overdue tasks'],tgt:['برنامه و چک‌لیست امروز','Today\'s checklist'],time:['هدف زمانی (جزئیات)','Time target'],compare:['مقایسه‌ی روزها و هفته‌ها','Compare days & weeks'],
  srs:['مرور کارت‌ها (آکادمی)','Card review'],focus:['تمرکز اصلی','Main focus'],quote:['جمله','Quote'],week:['هفته‌ی من','My week'],review:['بازبینی هفتگی','Weekly review'],links:['میانبرها','Shortcuts'],nx:['بعدی چی؟','What next?'],lesson:['درس بعدی (آکادمی)','Next lesson']};
function banner(){const k=(typeof skId==='function')?skId():'';let h='';
  try{if(/^itu[123]$/.test(k)&&typeof ituHero==='function')h=ituHero(k)}catch(e){}
  try{if(!h&&/^(itv|ao|eren)/.test(k)&&typeof ivHead==='function')h=ivHead()}catch(e){}return h}
const CAT={rhythm:{n:['چرخه‌ی امروز (برنامه ← اجرا ← بازبینی)','Today\'s rhythm (plan → do → review)'],t:'x',full:1,r:()=>window.daniRhythmCard?window.daniRhythmCard():''},banner:{n:['بنر تم','Theme banner'],t:'x',full:1,r:banner},pm:{n:['پومودورو و تمرکز','Pomodoro & focus'],t:'x',r:()=>window.daniPomoCard?window.daniPomoCard():''}};
Object.keys(HK).filter(k=>k!=='quote').forEach(k=>{CAT[k]={n:HK[k],t:'h',full:/^(dlc|overdue|compare|week|review|links)$/.test(k)?1:0}});
Object.keys(DK).forEach(k=>{CAT['d:'+k]={n:DK[k],t:'d',k,full:/^(rec|tl|top|logs|sum)$/.test(k)?1:0}});
CAT['d:rec'].n=['ثبت فعالیت و تایمر','Log activity & timer'];
const PRE={
  minimal:{n:['مینیمال','Minimal'],d:['فقط «بعدی چی؟» و برنامه‌ی امروز','Just "What next?" and today\'s plan'],l:['nx','rhythm','d:rec','tgt']},
  focus:{n:['تمرکز','Focus'],d:['پومودورو و یک جمله','Pomodoro and a quote'],l:['banner','nx','rhythm','pm','d:rec','focus','d:cap']},
  student:{n:['دانشجو','Student'],d:['مرور کارت‌ها، درس، موعد و عادت‌ها','Cards, lessons, deadlines, habits'],l:['banner','nx','rhythm','d:rec','srs','lesson','dlc','tgt','overdue','d:cap','week']},
  full:{n:['کامل','Full'],d:['همه‌ی بخش‌های مهم، با خط زمانی','All key sections incl. timeline'],l:['banner','nx','rhythm','d:rec','dlc','overdue','tgt','srs','lesson','d:cap','d:tl','d:goals','week','compare','focus','d:eod','d:note','links']}};
const H2=()=>{const s=db.set;if(!s.h2||typeof s.h2!=='object')s.h2={on:0,preset:'',list:[]};const h=s.h2;if(!Array.isArray(h.list))h.list=[];return h};
const nm=id=>T(CAT[id].n[0],CAT[id].n[1]);

/* ---------- ساخت خانه ---------- */
function dashCards(keys){if(!keys.length)return{};let arr=[];window.daniNoExtra=1;window.daniWant=keys;
  try{const r=dashToday();if(Array.isArray(r))arr=r}catch(e){}finally{window.daniNoExtra=0;window.daniWant=null}
  const o={};keys.forEach((k,i)=>o[k]=arr[i]||'');return o}
function widget(id,dc){const c=CAT[id];if(!c)return'';let h='';
  try{if(c.t==='d')h=dc[c.k]||'';else if(c.t==='h'){const s=HSEC[id];h=s&&s.r?s.r():''}else h=c.r?c.r():''}catch(e){console.error('home2',id,e)}return h}
const grT=hr=>hr>=5&&hr<12?T('صبح بخیر','Good morning'):hr>=12&&hr<17?T('ظهر بخیر','Good afternoon'):hr>=17&&hr<21?T('عصر بخیر','Good evening'):T('شب بخیر','Good night');
const clk=()=>{try{return fa(nowHM())}catch(e){return''}};
/* سربرگ ثابت: آیکون برنامه + سلام + تاریخ (طبق تقویم انتخابی) + ساعت گوشی — در همه‌ی شخصی‌سازی‌ها می‌ماند و قابل‌حذف نیست */
function head(){return'<div class="h2top"><div style="min-width:0">'+danGreetHTML()+'<div class="m">'+fmtDL(todayISO())+' · <span id="h2clk">'+clk()+'</span></div></div><span class="sp"></span><button class="chip" data-a="h2_edit">✏️ '+T('شخصی‌سازی','Customize')+'</button></div>'}
/* جمله‌ها همیشه می‌مانند؛ فقط از خود همین بخش می‌شود بستشان (جمع می‌شود) یا تنظیمشان کرد */
function quote(bn){if(bn)return'';let q='';try{q=hQuote()}catch(e){}return q?'<div class="h2w h2f">'+q+'</div>':''}
/* جمله‌ها در همه‌ی حالت‌ها (جدید و کلاسیک و همه‌ی تم‌ها) می‌مانند؛ فقط از خود همین بخش بسته/باز می‌شوند */
{const _hq=hQuote;hQuote=function(){const h2=H2();
  if(h2.qc)return'<div class="row" style="margin:4px 0"><button class="chip" data-a="h2_qc" style="width:100%;justify-content:center">❝ '+T('جمله‌ها (بسته) — باز کردن','Quotes (closed) — open')+' ▾</button></div>';
  return'<div class="row" style="justify-content:flex-end;margin:0 0 4px"><button class="chip" data-a="h2_qc" aria-label="close quotes">▴ '+T('بستن جمله‌ها','Close quotes')+'</button></div>'+_hq.apply(this,arguments)}}
{const _pq=PG.qt;PG.qt=function(){const h=_pq.apply(this,arguments);if(typeof h!=='string')return h;const o=!H2().qc;
  return'<div class="c"><b>🏠 '+T('نمایش جمله‌ها در صفحه‌ی اصلی','Quotes on the home screen')+'</b><div class="row" style="margin-top:6px"><button class="chip '+(o?'on':'')+'" data-a="h2_qc">'+(o?T('باز است — بستن','Open — close'):T('بسته است — باز کردن','Closed — open'))+'</button></div><p class="m">'+T('جمله‌ها پاک نمی‌شوند؛ فقط از جلوی چشم جمع می‌شوند.','Quotes are never deleted; they just collapse out of sight.')+'</p></div>'+h}}
function html(){const h2=H2(),ids=h2.list.filter(id=>CAT[id]&&id!=='banner');
  const dc=dashCards(ids.filter(id=>CAT[id].t==='d').map(id=>CAT[id].k));
  let bn='';if(h2.list.includes('banner')){try{bn=banner()}catch(e){}}
  let body=ids.map(id=>{const w=widget(id,dc);return w?'<div class="h2w'+(CAT[id].full?' h2f':'')+'" data-w="'+esc(id)+'">'+w+'</div>':''}).join('');
  if(!body.trim())body='<div class="c"><p class="m">'+T('هنوز بخشی انتخاب نشده؛ «شخصی‌سازی» را بزن و یک پیش‌تنظیم انتخاب کن.','No sections yet — tap "Customize" and pick a preset.')+'</p></div>';
  return'<div class="h2">'+head()+(bn?'<div class="h2g"><div class="h2w h2f" data-w="banner">'+bn+'</div></div>':'')+'<div class="h2g">'+quote(!!bn)+body+'</div></div>'}
setInterval(()=>{const e=document.getElementById('h2clk');if(e)e.textContent=clk();const g=document.querySelector('.dkgr span');if(g&&typeof danGreet==='function')g.textContent=danGreet()},1000);
H.h2_qc=()=>{const h=H2();h.qc=h.qc?0:1;save();render()};

/* ---------- ویرایشگر ---------- */
function editor(){const h2=H2(),on=h2.list.filter(id=>CAT[id]),off=Object.keys(CAT).filter(id=>!on.includes(id));
  let h='<h3>✏️ '+T('شخصی‌سازی خانه','Customize home')+'</h3><div class="m">'+T('یک پیش‌تنظیم انتخاب کن؛ بعد اگر خواستی بخش‌ها را کم/زیاد یا جابه‌جا کن. تغییرها همان لحظه روی خانه اعمال می‌شود.','Pick a preset, then add, remove or reorder sections. Changes apply instantly.')+'</div>';
  h+='<div class="row" style="margin:8px 0">'+Object.keys(PRE).map(k=>'<button class="chip '+(h2.on&&h2.preset===k?'on':'')+'" data-a="h2_pre" data-k="'+k+'" title="'+esc(T(PRE[k].d[0],PRE[k].d[1]))+'">'+esc(T(PRE[k].n[0],PRE[k].n[1]))+'</button>').join('')
    +'<button class="chip '+(!h2.on?'on':'')+'" data-a="h2_off" title="'+esc(T('چیدمان قبلی هر تم','Each theme\'s own layout'))+'">'+T('کلاسیک (قبلی)','Classic (previous)')+'</button></div>';
  if(h2.on){
    h+='<div class="m">'+T('بخش‌های نمایش‌داده‌شده','Shown sections')+'</div>'+on.map(id=>'<div class="cwr"><span>'+esc(nm(id))+'</span><button data-a="h2_mv" data-k="'+esc(id)+'" data-m="up" aria-label="up">▲</button><button data-a="h2_mv" data-k="'+esc(id)+'" data-m="dn" aria-label="down">▼</button><button class="d" data-a="h2_mv" data-k="'+esc(id)+'" data-m="x" aria-label="remove">✕</button></div>').join('')
      +(off.length?'<div class="m" style="margin-top:8px">'+T('افزودن بخش','Add a section')+'</div><div class="row">'+off.map(id=>'<button class="chip" data-a="h2_mv" data-k="'+esc(id)+'" data-m="add">+ '+esc(nm(id))+'</button>').join('')+'</div>':'')}
  else h+='<p class="m">'+T('الان «کلاسیک» فعال است: هر تم چیدمان خودش را دارد. برای خانه‌ی یکپارچه یک پیش‌تنظیم انتخاب کن؛ هر وقت خواستی با «کلاسیک» برمی‌گردی و هیچ چیزی پاک نمی‌شود.','"Classic" is active: each theme keeps its own layout. Pick a preset for a unified home; "Classic" brings the old one back and nothing is deleted.')+'</p>';
  return h+'<div class="row" style="margin-top:12px"><button class="p" data-a="h2_close">'+T('تمام','Done')+'</button></div>'}
const open=()=>{modal(editor())};
const refresh=()=>{save();render();open()};
H.h2_edit=()=>open();
H.h2_close=()=>{closeM();render()};
H.h2_pre=e=>{const k=e.dataset.k;if(!PRE[k])return;const h2=H2();if(e.dataset.keep&&h2.list.length){h2.on=1;h2.hide=1;save();render();return}h2.on=1;h2.preset=k;h2.list=PRE[k].l.filter(id=>CAT[id]);h2.hide=1;refresh()};
H.h2_off=()=>{H2().on=0;H2().hide=1;save();render();if($('#ovl')&&$('#ovl').innerHTML)open()};
H.h2_mv=e=>{const h2=H2(),k=e.dataset.k,m=e.dataset.m,i=h2.list.indexOf(k);
  if(m==='add'&&i<0)h2.list.push(k);if(m==='x'&&i>=0)h2.list.splice(i,1);
  if(m==='up'&&i>0)[h2.list[i-1],h2.list[i]]=[h2.list[i],h2.list[i-1]];if(m==='dn'&&i>=0&&i<h2.list.length-1)[h2.list[i+1],h2.list[i]]=[h2.list[i],h2.list[i+1]];
  h2.preset='custom';refresh()};
H.h2_no=()=>{H2().hide=1;save();render()};

/* ---------- اتصال به صفحه‌ی خانه ---------- */
{const _ph=PG.home;PG.home=function(){const h2=H2();
  if(h2.on){try{return html()}catch(e){console.error('home2',e)}}
  const r=_ph.apply(this,arguments);
  if(h2.hide||typeof r!=='string')return r;
  return '<div class="c h2b"><b>✨ '+T('خانه‌ی جدید','New home')+'</b><div class="m">'+T('ساده‌تر، یکپارچه برای همه‌ی تم‌ها و کاملاً شخصی؛ یک پیش‌تنظیم انتخاب کن. چیزی پاک نمی‌شود و هر وقت خواستی برمی‌گردی.','Simpler, one layout for every theme, fully yours. Pick a preset; nothing is deleted and you can switch back anytime.')+'</div><div class="row"><button class="p" data-a="h2_edit">'+T('امتحان کن','Try it')+'</button><button data-a="h2_no">'+T('نه، ممنون','No thanks')+'</button></div></div>'+r}}

/* سربرگ ثابت در همه‌ی تم‌ها و حالت‌ها: اگر خانه سلام/ساعت نداشت اضافه می‌شود */
function ensureHead(){if(page!=='home')return;const m=document.getElementById('pg');if(!m)return;
  if(!m.querySelector('.dkgr')){const d=document.createElement('div');d.className='h2top';d.innerHTML='<div style="min-width:0">'+danGreetHTML()+'<div class="m">'+fmtDL(todayISO())+' · <span id="h2clk">'+clk()+'</span></div></div>';m.insertBefore(d,m.firstChild)}
  else if(!document.getElementById('h2clk')){const g=m.querySelector('.dkgr'),mm=g.parentElement.querySelector('.m');const sp=document.createElement('span');sp.id='h2clk';sp.textContent=clk();
    if(mm){mm.appendChild(document.createTextNode(' · '));mm.appendChild(sp)}else{const d=document.createElement('div');d.className='m';d.appendChild(sp);g.insertAdjacentElement('afterend',d)}}}
{const _rh=render;render=function(){const r=_rh.apply(this,arguments);try{ensureHead()}catch(e){console.error('ensureHead',e)}return r}}

/* ---------- انتخاب سبک در تنظیمات ← ظاهر (بدون اضافه‌کردن آیتم به منو) ---------- */
function styleCard(){const h2=H2();
  return'<div class="c" id="h2style" style="margin-top:10px"><h3>'+T('سبک خانه','Home style')+'</h3><div class="row">'
   +'<button class="chip '+(h2.on?'on':'')+'" data-a="h2_pre" data-k="'+esc(h2.preset&&PRE[h2.preset]?h2.preset:'full')+'" data-keep="1">'+T('جدید (یکپارچه)','New (unified)')+'</button>'
   +'<button class="chip '+(!h2.on?'on':'')+'" data-a="h2_off">'+T('کلاسیک (چیدمان هر تم)','Classic (each theme\'s layout)')+'</button>'
   +'<button class="chip" data-a="h2_edit">✏️ '+T('شخصی‌سازی','Customize')+'</button></div>'
   +'<p class="m">'+T('هر دو سبک کنار هم می‌مانند و هر وقت خواستی عوض می‌کنی؛ چیزی پاک نمی‌شود.','Both styles stay available and you can switch anytime; nothing is deleted.')+'</p></div>'}
{const _sp=setPage;setPage=function(){const h=_sp.apply(this,arguments);return typeof h==='string'&&typeof stt!=='undefined'&&stt==='look'?h+styleCard():h}}

/* ---------- استایل ---------- */
const st=document.createElement('style');st.textContent='.h2top{display:flex;align-items:center;gap:8px;margin:2px 0 10px}.h2g{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(min(100%,330px),1fr))}.h2f{grid-column:1/-1}.h2w>.c,.h2w>div>.c{margin:0}.h2w .g{margin:0}.h2b{margin-bottom:10px}';
document.head.appendChild(st);
})();
