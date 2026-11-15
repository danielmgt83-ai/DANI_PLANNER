"use strict";
/* DANI · acdtime.js — ثبت خودکار زمان مطالعه در آکادمی (اختیاری، پیش‌فرض خاموش).
   وقتی روشن است و تب «دوره‌ها»ی آکادمی باز است، صفحه دیده می‌شود و در ۲ دقیقه‌ی اخیر لمس/اسکرول بوده (و تایمر دیگری فعال نیست)، ثانیه‌ها جمع می‌شوند.
   هنگام خروج از آکادمی، پنهان‌شدن برنامه یا رسیدن به ۳۰ دقیقه، اگر ≥۵ دقیقه باشد یک ثبت (src:'acd') روی فعالیتِ انتخاب‌شده در لاگ می‌ماند.
   داده: db.set.at = {on,act,pend(ثانیه)}. جای کنترل: یک ردیف باریک بالای تب «دوره‌ها». */
(function(){
const T=window.daniT;
const AT=()=>{const s=db.set;if(!s.at||typeof s.at!=='object')s.at={};const a=s.at;if(a.on!==1)a.on=0;if(typeof a.act!=='string')a.act='';if(typeof a.pend!=='number'||a.pend<0)a.pend=0;return a};
const inCrs=()=>{try{return page==='acd'&&zMS.acd.tab==='courses'}catch(e){return false}};
const timerOn=()=>['running','paused','ended'].includes((db.timer||{}).state);
let last=Date.now(),lastSave=0;
['pointerdown','keydown','scroll','touchstart'].forEach(ev=>addEventListener(ev,()=>{last=Date.now()},{passive:true,capture:true}));
function flush(force){const a=AT();if(a.pend<300){if(force&&!inCrs())a.pend=0;return}
  if(!a.act||!act(a.act)){a.pend=0;return}
  const min=Math.round(a.pend/60),n=new Date(),e=n.getHours()*60+n.getMinutes(),s=Math.max(0,e-min),d=todayISO();
  db.entries.push({id:uid(),date:d,actId:a.act,subId:'',start:hm(s),end:hm(Math.max(s+1,e)),min,note:T('ثبت خودکار: آکادمی','Auto-logged: Academy'),src:'acd'});
  a.pend=0;save();try{toast(T('✅ '+mm(min)+' مطالعه در آکادمی ثبت شد','✅ '+mm(min)+' of Academy study logged'))}catch(x){}}
setInterval(()=>{const a=AT();if(!a.on)return;
  if(inCrs()&&!document.hidden&&Date.now()-last<120000&&!timerOn()){a.pend+=5;if(a.pend>=1800)flush();else if(Date.now()-lastSave>60000){lastSave=Date.now();save()}}
  else if(!inCrs()&&a.pend>0)flush(true)},5000);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&AT().on)flush(false)});
function row(){const a=AT();
  return'<div class="c" id="atrow" style="padding:8px 12px"><div class="row" style="align-items:center"><span>⏱</span><b style="flex:1">'+T('ثبت خودکار زمان مطالعه','Auto-log study time')+'</b><button class="chip '+(a.on?'on':'')+'" data-a="at_on">'+(a.on?T('روشن','On'):T('خاموش','Off'))+'</button></div>'
   +(a.on?'<div class="row" style="margin-top:6px"><span class="m">'+T('روی فعالیت','On activity')+'</span><select data-ats style="flex:1;min-width:0"><option value="">'+T('— انتخاب کن —','— choose —')+'</option>'+aOpts(a.act)+'</select></div><p class="m" style="margin:4px 0 0">'+T('فقط وقتی این تب باز و در حال استفاده است حساب می‌شود؛ کمتر از ۵ دقیقه ثبت نمی‌شود.','Counts only while this tab is open and in use; under 5 min is not logged.')+'</p>':'')+'</div>'}
H.at_on=()=>{const a=AT();a.on=a.on?0:1;if(!a.on)a.pend=0;save();render()};
document.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.ats!==undefined){AT().act=t.value;save()}});
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{if(inCrs()){const pg=document.getElementById('pg');if(pg&&!document.getElementById('atrow')){const d=document.createElement('div');d.innerHTML=row();pg.insertBefore(d.firstChild,pg.firstChild)}}else if(AT().pend>0&&AT().on)flush(true)}catch(e){console.error('acdtime',e)}return r}}
window.daniAcdFlush=flush;
})();
