"use strict";
/* DANI · quicklog.js — «ثبت ۵ ثانیه‌ای»: فعالیت پرکاربرد ← مدت ← تمام (۲ لمس). ثبت تا همین لحظه (مثل ثبت سریع قبلی).
   کارت در خانه‌ی جدید با کلید ql (شخصی‌سازی ← افزودن). داده‌ی جدیدی نمی‌سازد: db.entries با src:'quick'. */
(function(){
const T=window.daniT;
let pick='',LAST=null;
const undoBar=()=>{if(!LAST||Date.now()-LAST.ts>90000){LAST=null;return''}return'<div class="row" style="margin-top:8px"><span class="m">'+esc(LAST.l)+'</span><button class="chip" data-a="ql_undo">↩ '+T('برگردان','Undo')+'</button></div>'};
H.ql_undo=()=>{if(!LAST)return;const L=LAST;LAST=null;if(L.k==='e')db.entries=db.entries.filter(x=>x.id!==L.id);else if(db.plans[L.d])db.plans[L.d]=db.plans[L.d].filter(x=>x.id!==L.id);if(save()){toast(T('برگردانده شد','Undone'));render()}};
function top(){const now=Date.now(),sc={};
  (db.entries||[]).forEach(e=>{if(!e||!e.actId||!e.date)return;const ag=Math.max(0,(now-new Date(e.date+'T12:00:00').getTime())/864e5);if(ag>60)return;sc[e.actId]=(sc[e.actId]||0)+Math.max(1,e.min||1)*Math.exp(-ag/14)});
  const ok=a=>a&&a.active&&!a.arch,l=Object.keys(sc).map(id=>act(id)).filter(ok).sort((a,b)=>sc[b.id]-sc[a.id]).slice(0,5);
  if(l.length<4)db.acts.filter(a=>ok(a)&&!l.includes(a)).slice(0,5-l.length).forEach(a=>l.push(a));return l}
function card(){const l=top();if(!l.length)return'';
  let h='<div class="c" id="qlcard">'+daniH('⚡','ثبت ۵ ثانیه‌ای','5-second log')+'<div class="m">'+T('چه کاری کردی؟','What did you do?')+'</div><div class="row" style="margin-top:6px">'
   +l.map(a=>'<button class="chip '+(pick===a.id?'on':'')+'" data-a="ql_pick" data-id="'+esc(a.id)+'" style="border-inline-start:4px solid '+aC(a.id)+'">'+esc(a.name)+'</button>').join('')+'</div>';
  if(pick&&act(pick))h+='<div class="m" style="margin-top:8px">'+T('چقدر؟ (تا همین لحظه)','How long? (up to now)')+'</div><div class="row" style="margin-top:4px">'
   +[15,30,45,60,90].map(m=>'<button class="chip" data-a="ql_go" data-m="'+m+'">'+(typeof mm==='function'?mm(m):m+'m')+'</button>').join('')+'</div>';
  return h+undoBar()+'</div>'}
H.ql_pick=e=>{pick=pick===e.dataset.id?'':e.dataset.id;render()};
H.ql_go=e=>{const a=pick,min=+e.dataset.m||0,d=todayISO();if(!act(a)||!min)return;const en=nowHM();
  if(tm(en)-min<0)return toast(T('این ثبت از نیمه‌شب می‌گذرد؛ از «ثبت دستی» استفاده کن','Crosses midnight — use manual log'),1);
  const st=hm(tm(en)-min);const id=uid();db.entries.push({id,date:d,actId:a,subId:'',start:st,end:en,min,note:'',src:'quick'});LAST={k:'e',id,ts:Date.now(),l:'✓ '+aN(a)+' · '+mm(min)};pick='';
  if(save()){toast(T('ثبت شد: ','Logged: ')+mm(min));render()}};
/* «یک کار برای امروز»: فعالیت ← هدف (دقیقه) ← به برنامه‌ی امروز اضافه می‌شود */
let pk2='';
function taskCard(){const l=top();if(!l.length)return'';
  let h='<div class="c" id="tkcard">'+daniH('📝','یک کار برای امروز','Add a task for today')+'<div class="m">'+T('کدام فعالیت؟','Which activity?')+'</div><div class="row" style="margin-top:6px">'
   +l.map(a=>'<button class="chip '+(pk2===a.id?'on':'')+'" data-a="tk_pick" data-id="'+esc(a.id)+'" style="border-inline-start:4px solid '+aC(a.id)+'">'+esc(a.name)+'</button>').join('')+'</div>';
  if(pk2&&act(pk2))h+='<div class="m" style="margin-top:8px">'+T('هدف چند دقیقه؟','Goal in minutes?')+'</div><div class="row" style="margin-top:4px">'
   +[15,30,45,60,90,120].map(m=>'<button class="chip" data-a="tk_go" data-m="'+m+'">'+mm(m)+'</button>').join('')+'</div>';
  return h+undoBar()+'</div>'}
H.tk_pick=e=>{pk2=pk2===e.dataset.id?'':e.dataset.id;render()};
H.tk_go=e=>{const a=pk2,m=+e.dataset.m||0,d=todayISO();if(!act(a)||!m)return;const id=uid();(db.plans[d]=db.plans[d]||[]).push({id,actId:a,start:'',end:'',goal:m,status:'todo',reason:''});LAST={k:'p',d,id,ts:Date.now(),l:'✓ '+aN(a)+' · '+mm(m)};pk2='';
  if(save()){toast(T('به برنامه‌ی امروز اضافه شد','Added to today\'s plan'));render()}};
window.daniTaskCard=taskCard;
window.daniQuickLog=card;
})();
