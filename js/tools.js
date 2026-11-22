"use strict";
/* DANI · tools.js (v166) — صفحه‌ی «Tools / ابزارها» (آیتم منو، بعد از «برنامه»).
   سه ابزار، هر کدام فقط همین‌جا: مسیر روشن (Clear Path؛ از صفحه‌ی خانه آمد)، ماتریس آیزنهاور، قانون ۲ دقیقه.
   «بلوک زمانی» جدا ساخته نشد: خط زمانی «برنامه‌ی روز» همین کار را می‌کند.
   داده: db.set.tls={tab:'cp'|'ei'|'two', ei:[{id,t,q:1..4,done}], two:[{id,t,done}]} فقط روی همین دستگاه (در پشتیبان هم می‌آید).
   روی صفحه‌ی خانه فقط یک چیپ کوچک «ابزارها» می‌ماند (بخش wp در «شخصی‌سازی امروز»؛ قابل پنهان‌کردن). */
(function(){'use strict';
const T=window.daniT||function(a){return a};
const say=(m,b)=>{try{toast(m,b)}catch(e){}};
const S=()=>{const s=db.set;if(!s.tls||typeof s.tls!=='object')s.tls={};const o=s.tls;if(!['cp','ei','two'].includes(o.tab))o.tab='cp';if(!Array.isArray(o.ei))o.ei=[];if(!Array.isArray(o.two))o.two=[];return o};
const E=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const Q=[null,['🔥',T('همین حالا','Do now'),T('فوری + مهم','Urgent + important')],['📌',T('برنامه‌ریزی','Schedule'),T('مهم، غیرفوری','Important, not urgent')],['🤝',T('واگذار / کوتاه','Delegate / quick'),T('فوری، کم‌اهمیت','Urgent, less important')],['🗑',T('حذف','Drop'),T('نه فوری، نه مهم','Neither')]];
const TL={sel:'',addq:2,imp:0,tm:null,iv:0};
const MAXI=120;
/* ---------- نمایش ---------- */
const tabs=()=>{const o=S();return'<div class="row tltabs">'+[['cp','🧭',T('مسیر روشن','Clear Path')],['ei','🔲',T('آیزنهاور','Eisenhower')],['two','⚡',T('قانون ۲ دقیقه','2-minute rule')]].map(x=>'<button class="chip '+(o.tab===x[0]?'on':'')+'" data-a="tl_tab" data-k="'+x[0]+'">'+x[1]+' '+x[2]+'</button>').join('')+'</div>'};
function eiHTML(){const o=S(),L=o.ei;
 let h='<div class="c">'+daniH('🔲','ماتریس آیزنهاور','Eisenhower matrix')+'<p class="m">'+T('کارها را بر اساس «فوری» و «مهم» در چهار خانه بچین. اول خانه‌ی 🔥، بعد برنامه‌ریزی 📌.','Sort tasks by “urgent” and “important”. Start with 🔥, then schedule 📌.')+'</p><div class="tlq">';
 for(let q=1;q<=4;q++){const it=L.filter(x=>x.q===q);
  h+='<div class="tlc tlq'+q+'"><b>'+Q[q][0]+' '+Q[q][1]+'</b><span class="m">'+Q[q][2]+'</span>'+(it.length?it.map(x=>'<button class="chip tlit '+(x.done?'tldn':'')+(TL.sel===x.id?' on':'')+'" data-a="tl_sel" data-id="'+x.id+'" dir="auto">'+E(x.t)+'</button>').join(''):'<span class="m tlempty">—</span>')+'</div>'}
 h+='</div>';
 const s=L.find(x=>x.id===TL.sel);
 if(s)h+='<div class="tlsel"><div class="m" dir="auto">«'+E(s.t)+'»</div><div class="row">'+[1,2,3,4].map(q=>'<button class="chip sm '+(s.q===q?'on':'')+'" data-a="tl_mv" data-q="'+q+'" title="'+E(Q[q][1])+'">'+Q[q][0]+'</button>').join('')+'<button class="chip sm" data-a="tl_dn">'+(s.done?'↩':'✓')+'</button><button class="chip sm" data-a="tl_plan">🗓 '+T('به برنامه‌ی امروز','To today')+'</button><button class="chip sm" data-a="tl_del">🗑</button></div></div>';
 h+='<div class="row tladd"><input id="tl-in" dir="auto" maxlength="80" class="grow" placeholder="'+E(T('کار تازه…','New task…'))+'"><button class="p" data-a="tl_add">＋</button></div>'
  +'<div class="row">'+[1,2,3,4].map(q=>'<button class="chip sm '+(TL.addq===q?'on':'')+'" data-a="tl_aq" data-q="'+q+'" title="'+E(Q[q][1])+'">'+Q[q][0]+'</button>').join('')+'<span class="m">'+T('خانه‌ی کار تازه','Box for the new task')+'</span></div>'
  +'<div class="row"><button class="chip sm" data-a="tl_imp">'+(TL.imp?'▾':'▸')+' '+T('از موعدها','From deadlines')+'</button>'+(L.some(x=>x.done)?'<button class="chip sm" data-a="tl_clr">'+T('پاک‌کردن انجام‌شده‌ها','Clear done')+'</button>':'')+'</div>';
 if(TL.imp){let D=[];try{D=zDL().items.filter(x=>!x.done&&!x.arch&&!L.some(y=>y.src===x.id)).slice(0,12)}catch(e){}
  h+=D.length?'<div class="tlimp">'+D.map(x=>'<div class="row" style="margin:3px 0"><button class="chip sm" data-a="tl_impo" data-id="'+E(x.id)+'" style="flex:1;text-align:start" dir="auto">＋ '+E(x.title)+(x.dt?' · '+E(typeof fmtD==='function'?fmtD(x.dt):x.dt):'')+'</button></div>').join('')+'</div>':'<p class="m">'+T('موعد بازی نیست که اضافه شود.','No open deadline to add.')+'</p>'}
 return h+'</div>'}
function twoHTML(){const o=S(),L=o.two,tm=TL.tm;
 let h='<div class="c">'+daniH('⚡','قانون ۲ دقیقه','Two-minute rule')+'<p class="m">'+T('کاری که کمتر از ۲ دقیقه طول می‌کشد را همین الان انجام بده، نه بعداً. بیشتر شد؟ به آیزنهاور بفرست.','If it takes under 2 minutes, do it now. Longer? Send it to the Eisenhower matrix.')+'</p>';
 h+=L.length?L.map(x=>{const run=tm&&tm.id===x.id;return'<div class="tltw '+(x.done?'tldn':'')+'"><span class="grow" dir="auto">'+E(x.t)+'</span>'+(x.done?'':(run?'<b class="tlcd" id="tl-cd">'+cd()+'</b>':'<button class="chip sm" data-a="tl_go" data-id="'+x.id+'">▶ ۲:۰۰</button>')+'<button class="chip sm" data-a="tl_ok" data-id="'+x.id+'">✓</button><button class="chip sm" data-a="tl_big" data-id="'+x.id+'" title="'+E(T('بیشتر از ۲ دقیقه → آیزنهاور','Over 2 min → Eisenhower'))+'">🔲</button>')+'<button class="chip sm" data-a="tl_td" data-id="'+x.id+'">🗑</button></div>'}).join(''):'<p class="m">'+T('هنوز کار کوچکی ننوشته‌ای.','No small task yet.')+'</p>';
 h+='<div class="row tladd"><input id="tl-in2" dir="auto" maxlength="80" class="grow" placeholder="'+E(T('یک کار خیلی کوچک…','A very small task…'))+'"><button class="p" data-a="tl_add2">＋</button></div>';
 if(L.some(x=>x.done))h+='<div class="row"><button class="chip sm" data-a="tl_clr2">'+T('پاک‌کردن انجام‌شده‌ها','Clear done')+'</button></div>';
 return h+'</div>'}
function cd(){if(!TL.tm)return'';const s=Math.max(0,Math.ceil((TL.tm.end-Date.now())/1000));return fa(Math.floor(s/60))+':'+fa(String(s%60).padStart(2,'0'))}
function tick(){const el=document.getElementById('tl-cd');if(!TL.tm){clearInterval(TL.iv);TL.iv=0;return}
 if(!el&&page!=='tools'){clearInterval(TL.iv);TL.iv=0;TL.tm=null;return}
 if(Date.now()>=TL.tm.end){const id=TL.tm.id;TL.tm=null;clearInterval(TL.iv);TL.iv=0;try{navigator.vibrate&&navigator.vibrate([200,100,200])}catch(e){}say(T('۲ دقیقه تمام شد؛ انجام شد؟ ✓ بزن، یا 🔲 برای آیزنهاور','2 minutes are up — done? Tap ✓, or 🔲 for Eisenhower'));if(page==='tools')render();return}
 if(el)el.textContent=cd()}
PG.tools=function(){const o=S();
 let h=tabs();
 if(o.tab==='cp'){try{h+=window.daniClearPath?window.daniClearPath.card():''}catch(e){console.error('tools cp',e)}}
 else if(o.tab==='ei')h+=eiHTML();else h+=twoHTML();
 return h};
/* ---------- رویدادها ---------- */
const val=id=>{const e=document.getElementById(id);return e?String(e.value||'').trim().slice(0,80):''};
H.tl_tab=e=>{S().tab=e.dataset.k;if(TL.tm&&S().tab!=='two'){TL.tm=null}save();render()};
H.tl_sel=e=>{TL.sel=TL.sel===e.dataset.id?'':e.dataset.id;render()};
H.tl_aq=e=>{TL.addq=+e.dataset.q;const v=val('tl-in');render();const i=document.getElementById('tl-in');if(i&&v)i.value=v};
H.tl_add=()=>{const t=val('tl-in');if(!t)return say(T('یک کار بنویس','Write a task'),1);const L=S().ei;if(L.length>=MAXI)return say(T('حداکثر ۱۲۰ کار','Up to 120 tasks'),1);L.push({id:'e'+uid(),t,q:TL.addq,done:0});save();render()};
H.tl_mv=e=>{const s=S().ei.find(x=>x.id===TL.sel);if(!s)return;s.q=+e.dataset.q;save();render()};
H.tl_dn=()=>{const s=S().ei.find(x=>x.id===TL.sel);if(!s)return;s.done=s.done?0:1;save();render()};
H.tl_del=()=>{const L=S().ei,i=L.findIndex(x=>x.id===TL.sel);if(i>=0)L.splice(i,1);TL.sel='';save();render()};
H.tl_plan=()=>{const s=S().ei.find(x=>x.id===TL.sel);if(!s||!window.daniClearPath)return;window.daniClearPath.planSend(s.t,0)};
H.tl_clr=()=>{const o=S();o.ei=o.ei.filter(x=>!x.done);TL.sel='';save();render()};
H.tl_imp=()=>{TL.imp=TL.imp?0:1;render()};
H.tl_impo=e=>{let d;try{d=zDL().items.find(x=>x.id===e.dataset.id)}catch(x){}if(!d)return;const L=S().ei;if(L.length>=MAXI)return say(T('حداکثر ۱۲۰ کار','Up to 120 tasks'),1);
 let urgent=false;try{if(d.dt){const n=Math.round((new Date(d.dt+'T00:00:00')-new Date(todayISO()+'T00:00:00'))/864e5);urgent=n<=2}}catch(x){}
 L.push({id:'e'+uid(),t:String(d.title||'').slice(0,80),q:urgent?1:2,done:0,src:d.id});save();render()};
H.tl_add2=()=>{const t=val('tl-in2');if(!t)return say(T('یک کار بنویس','Write a task'),1);const L=S().two;if(L.length>=MAXI)return say(T('حداکثر ۱۲۰ کار','Up to 120 tasks'),1);L.push({id:'w'+uid(),t,done:0});save();render()};
H.tl_go=e=>{TL.tm={id:e.dataset.id,end:Date.now()+120000};if(TL.iv)clearInterval(TL.iv);TL.iv=setInterval(tick,500);render()};
H.tl_ok=e=>{const x=S().two.find(y=>y.id===e.dataset.id);if(!x)return;x.done=1;if(TL.tm&&TL.tm.id===x.id)TL.tm=null;save();render();say(T('آفرین ✓','Nice ✓'))};
H.tl_big=e=>{const o=S(),i=o.two.findIndex(y=>y.id===e.dataset.id);if(i<0)return;const x=o.two.splice(i,1)[0];if(TL.tm&&TL.tm.id===x.id)TL.tm=null;if(o.ei.length<MAXI)o.ei.push({id:'e'+uid(),t:x.t,q:2,done:0});save();render();say(T('به آیزنهاور (📌 برنامه‌ریزی) رفت','Moved to Eisenhower (📌 Schedule)'))};
H.tl_td=e=>{const L=S().two,i=L.findIndex(y=>y.id===e.dataset.id);if(i>=0)L.splice(i,1);if(TL.tm&&TL.tm.id===e.dataset.id)TL.tm=null;save();render()};
H.tl_clr2=()=>{const o=S();o.two=o.two.filter(x=>!x.done);save();render()};
document.addEventListener('keydown',e=>{if(e.key!=='Enter')return;const t=e.target;if(t&&t.id==='tl-in')H.tl_add();else if(t&&t.id==='tl-in2')H.tl_add2()});
/* ---------- ثبت صفحه، آیتم منو، چیپ روی خانه ---------- */
try{BI_NAV.tools=['Tools','ابزارها'];EXT_PAGES.add('tools');ICONS.tools='<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>'}catch(e){console.error('tools reg',e)}
{const _s=syncNav;syncNav=function(){_s.apply(this,arguments);try{if(NAV.some(n=>n[0]==='tools'))return;let i=NAV.findIndex(n=>n[0]==='plan2');if(i<0)i=NAV.findIndex(n=>n[0]==='pj');if(i<0)i=NAV.findIndex(n=>n[0]==='set')-1;NAV.splice(i+1<=0?NAV.length:i+1,0,['tools','ابزارها'])}catch(e){console.error('toolsNav',e)}}}
try{window.DANI_SECS.wp=[()=>'<div class="row tldoor"><button class="chip" data-a="go" data-p="tools">🧰 '+T('ابزارها: مسیر روشن · آیزنهاور · ۲ دقیقه','Tools: Clear Path · Eisenhower · 2-min')+'</button></div>',T('میان‌بر ابزارها','Tools shortcut')]}catch(e){console.error('tools door',e)}
try{const st=document.createElement('style');st.textContent='.tltabs{flex-wrap:wrap;gap:6px;margin:0 0 10px}.tlq{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}.tlc{border-radius:14px;padding:10px;min-height:110px;display:flex;flex-direction:column;align-items:flex-start;gap:4px;background:rgba(127,127,127,.12)}.tlc>b{font-size:13.5px}.tlq1{background:rgba(239,68,68,.16)}.tlq2{background:rgba(59,130,246,.16)}.tlq3{background:rgba(245,158,11,.16)}.tlq4{background:rgba(148,163,184,.16)}.tlit{max-width:100%;text-align:start;font-size:12.5px}.tldn{text-decoration:line-through;opacity:.55}.tlsel{border:1px dashed currentColor;border-radius:12px;padding:8px;margin:6px 0}.tladd{margin-top:8px}.tltw{display:flex;align-items:center;gap:6px;margin:6px 0;flex-wrap:wrap}.tlcd{font-size:18px;min-width:54px}.tlempty{opacity:.5}.tldoor{margin:6px 0}';document.head.appendChild(st)}catch(e){}
})();
