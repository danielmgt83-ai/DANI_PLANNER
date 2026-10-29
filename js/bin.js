"use strict";
/* DANI · bin.js — «سطل بازیافت»: هر چیزی که حذف شود (ثبت، فعالیت، یادداشت، مورد برنامه، یادآوری، عادت، موعد، جمله‌ی شخصی)
   تا ۴۵ روز در db.set.bin می‌ماند و از تنظیمات ← داده‌ها قابل‌برگرداندن است. روش: بعد از هر ذخیره، فهرست شناسه‌ها با قبلی مقایسه می‌شود
   (کدِ حذفِ هیچ بخشی دست نمی‌خورد). حذف‌های گروهی خیلی بزرگ (جایگزینی کل داده/همگام‌سازی) ثبت نمی‌شوند. داده: db.set.bin [{t,p,o}] تا ۳۰۰ مورد. */
(function(){
const T=window.daniT;
const BIN=()=>{const s=db.set;if(!Array.isArray(s.bin))s.bin=[];return s.bin};
const arr=p=>{try{
  if(p==='entries')return db.entries;if(p==='acts')return db.acts;if(p==='notes')return db.notes;
  if(p.startsWith('plans/')){const d=p.slice(6);if(!db.plans)db.plans={};return db.plans[d]=db.plans[d]||[]}
  if(p.startsWith('mods/')){const[,m,k]=p.split('/');const M=zMD();M[m]=M[m]||{};M[m][k]=M[m][k]||[];return M[m][k]}}catch(e){}return null};
const MP=[['mods/rem/items'],['mods/hab/items'],['mods/dl/items'],['mods/qt/mine']];
function now(){const m=new Map();
  const add=(p,a)=>{if(Array.isArray(a))a.forEach(o=>{if(o&&typeof o==='object'&&o.id!==undefined)m.set(p+'|'+o.id,{p,o})})};
  add('entries',db.entries);add('acts',db.acts);add('notes',db.notes);
  Object.keys(db.plans||{}).forEach(d=>add('plans/'+d,db.plans[d]));
  try{const M=db.mods||{};MP.forEach(([p])=>{const[,mm,k]=p.split('/');add(p,M[mm]&&M[mm][k])})}catch(e){}
  return m}
let prev=null;
function diff(){try{const nw=now();
  if(prev){const gone=[];prev.forEach((v,k)=>{if(!nw.has(k))gone.push(v)});
    if(gone.length&&!(gone.length>30&&gone.length>prev.size*.5)){const b=BIN(),t=Date.now();gone.forEach(v=>b.push({t,p:v.p,o:v.o}));if(b.length>300)b.splice(0,b.length-300);try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){}}}
  prev=nw}catch(e){console.error('bin',e)}}
{const _s=save;save=function(){const r=_s.apply(this,arguments);diff();return r}}
setTimeout(()=>{prev=now();const b=BIN(),cut=Date.now()-45*864e5;const n=b.filter(x=>x.t>=cut);if(n.length!==b.length){db.set.bin=n}},2500);
const lab=x=>{const o=x.o||{};let s=o.title||o.name||o.t||o.text||o.note||'';if(!s&&o.actId)try{s=aN(o.actId)}catch(e){}if(o.min)s+=' · '+o.min+T('د','m');if(o.date)s+=' · '+o.date;return String(s||o.id).slice(0,60)};
const KIND={entries:['ثبت زمان','Time entry'],acts:['فعالیت','Activity'],notes:['یادداشت','Note'],plans:['مورد برنامه','Plan item'],'mods/rem/items':['یادآوری','Reminder'],'mods/hab/items':['عادت','Habit'],'mods/dl/items':['موعد','Deadline'],'mods/qt/mine':['جمله‌ی من','My quote']};
const kind=p=>{const k=KIND[p.startsWith('plans/')?'plans':p]||['مورد','Item'];return T(k[0],k[1])};
H.bin_rs=e=>{const b=BIN(),i=+e.dataset.i,x=b[i];if(!x)return;const a=arr(x.p);if(!a)return toast(T('برگرداندن ممکن نشد','Cannot restore'),1);
  if(!a.some(z=>z&&z.id===x.o.id))a.push(x.o);b.splice(i,1);prev=null;if(save()){prev=now();toast(T('برگردانده شد ✓','Restored ✓'));render()}};
H.bin_rm=e=>{const b=BIN();b.splice(+e.dataset.i,1);save();render()};
H.bin_all=()=>{if(!confirm(T('سطل بازیافت خالی شود؟ این کار برگشت ندارد.','Empty the recycle bin? This cannot be undone.')))return;db.set.bin=[];save();render()};
function card(){const b=BIN(),l=b.map((x,i)=>({x,i})).reverse().slice(0,25);
  let h='<div class="c" id="bincard">'+daniH('🗑','سطل بازیافت','Recycle bin')+'<p class="m">'+T('هر چیزی که حذف کنی تا ۴۵ روز اینجا می‌ماند و برمی‌گردد. ('+fa(b.length)+' مورد)','Anything you delete stays here for 45 days and can be restored. ('+b.length+' items)')+'</p>';
  if(!l.length)return h+'<p class="m">'+T('خالی است.','Empty.')+'</p></div>';
  h+=l.map(({x,i})=>'<div class="cwr" style="display:flex;gap:6px;align-items:center"><span style="flex:1;min-width:0" dir="auto"><b>'+esc(kind(x.p))+'</b> · '+esc(lab(x))+'</span><button class="chip" data-a="bin_rs" data-i="'+i+'">↩ '+T('برگردان','Restore')+'</button><button class="chip" data-a="bin_rm" data-i="'+i+'" aria-label="delete">✕</button></div>').join('');
  return h+'<div class="row" style="margin-top:6px"><button class="chip" data-a="bin_all">'+T('خالی‌کردن سطل','Empty bin')+'</button></div></div>'}
{const _sp=setPage;setPage=function(){const h=_sp.apply(this,arguments);return(typeof h==='string'&&typeof stt!=='undefined'&&stt==='data')?h+card():h}}
window.daniBin={card,list:BIN,now};
})();
