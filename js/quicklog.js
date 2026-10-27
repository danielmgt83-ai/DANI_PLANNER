"use strict";
/* DANI · quicklog.js — «ثبت ۵ ثانیه‌ای»: فعالیت پرکاربرد ← مدت ← تمام (۲ لمس). ثبت تا همین لحظه (مثل ثبت سریع قبلی).
   کارت در خانه‌ی جدید با کلید ql (شخصی‌سازی ← افزودن). داده‌ی جدیدی نمی‌سازد: db.entries با src:'quick'. */
(function(){
const T=(fa,en)=>{try{return LANGEN()?en:fa}catch(e){return fa}};
let pick='';
function top(){const now=Date.now(),sc={};
  (db.entries||[]).forEach(e=>{if(!e||!e.actId||!e.date)return;const ag=Math.max(0,(now-new Date(e.date+'T12:00:00').getTime())/864e5);if(ag>60)return;sc[e.actId]=(sc[e.actId]||0)+Math.max(1,e.min||1)*Math.exp(-ag/14)});
  const ok=a=>a&&a.active&&!a.arch,l=Object.keys(sc).map(id=>act(id)).filter(ok).sort((a,b)=>sc[b.id]-sc[a.id]).slice(0,5);
  if(l.length<4)db.acts.filter(a=>ok(a)&&!l.includes(a)).slice(0,5-l.length).forEach(a=>l.push(a));return l}
function card(){const l=top();if(!l.length)return'';
  let h='<div class="c" id="qlcard"><div class="m">⚡ '+T('ثبت ۵ ثانیه‌ای — چه کاری کردی؟','5-second log — what did you do?')+'</div><div class="row" style="margin-top:6px">'
   +l.map(a=>'<button class="chip '+(pick===a.id?'on':'')+'" data-a="ql_pick" data-id="'+esc(a.id)+'" style="border-inline-start:4px solid '+aC(a.id)+'">'+esc(a.name)+'</button>').join('')+'</div>';
  if(pick&&act(pick))h+='<div class="m" style="margin-top:8px">'+T('چقدر؟ (تا همین لحظه)','How long? (up to now)')+'</div><div class="row" style="margin-top:4px">'
   +[15,30,45,60,90].map(m=>'<button class="chip" data-a="ql_go" data-m="'+m+'">'+(typeof mm==='function'?mm(m):m+'m')+'</button>').join('')+'</div>';
  return h+'</div>'}
H.ql_pick=e=>{pick=pick===e.dataset.id?'':e.dataset.id;render()};
H.ql_go=e=>{const a=pick,min=+e.dataset.m||0,d=todayISO();if(!act(a)||!min)return;const en=nowHM();
  if(tm(en)-min<0)return toast(T('این ثبت از نیمه‌شب می‌گذرد؛ از «ثبت دستی» استفاده کن','Crosses midnight — use manual log'),1);
  const st=hm(tm(en)-min);db.entries.push({id:uid(),date:d,actId:a,subId:'',start:st,end:en,min,note:'',src:'quick'});pick='';
  if(save()){toast(T('ثبت شد: ','Logged: ')+mm(min));render()}};
window.daniQuickLog=card;
})();
