/* یادآوری‌های طول روز از «انتظار باقی‌مانده» (v63b): در ساعت‌های انتخابی می‌گوید امروز چقدر انجام شده و چقدر مانده.
   اپ اندروید: از راه daniExtraPlan زمان‌بندی می‌شود (با هر ثبت دوباره محاسبه می‌شود). وب: وقتی صفحه باز است. تنظیم: db.set.rmn={on,t[]}. بعد از rating.js. */
(function(){'use strict';
const T=window.daniT;
const cfg=()=>{const q=db.set.rmn||(db.set.rmn={});if(q.on===undefined)q.on=true;if(!Array.isArray(q.t))q.t=['12:00','16:00','20:00'];if(!q.fired)q.fired={};return q};
const ok=t=>/^\d\d:\d\d$/.test(t);
const hs=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return 4e8+Math.abs(h)%1e8};
const atOf=(d,t)=>{const[y,m,dd]=d.split('-').map(Number),[h,n]=t.split(':').map(Number);return new Date(y,m-1,dd,h,n).getTime()};
const quiet=at=>{try{return typeof inQuiet==='function'&&inQuiet(at)}catch(e){return false}};
function body(){const h=homeTarget();if(!h.tgt||h.done>=h.tgt)return null;
  return T('تا الان '+mm(h.done)+' از '+mm(h.tgt)+' انجام شده؛ '+mm(h.need)+' مانده.','So far '+mm(h.done)+' of '+mm(h.tgt)+'; '+mm(h.need)+' left.')}
(window.daniExtraPlan=window.daniExtraPlan||[]).push(now=>{const q=cfg(),out=[];if(!q.on)return out;let b;try{b=body()}catch(e){return out}if(!b)return out;
  const d=todayISO();q.t.filter(ok).forEach(t=>{const at=atOf(d,t);if(at>now+2000&&!quiet(at))out.push({id:hs('rmn'+d+t),at,title:'DANI ⏳',body:b,ch:'dani-remind-v2',key:'rmn-'+d+'-'+t})});return out});
function tick(){try{const q=cfg();if(!q.on||(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform()))return;const d=todayISO(),n=Date.now();
  q.t.filter(ok).forEach(t=>{const k=d+t,at=atOf(d,t);if(q.fired[k]||n<at||n>at+10*60000)return;q.fired[k]=1;
    Object.keys(q.fired).forEach(x=>{if(x.slice(0,10)<d)delete q.fired[x]});const b=body();save();if(b&&!quiet(n)){const s=typeof sysNotify==='function'?sysNotify:notify;s('DANI ⏳ '+b,b,'rmn-'+k)}})}catch(e){}}
setInterval(tick,30000);
function card(){if(document.getElementById('rmc'))return;const a=document.getElementById('qrc')||document.getElementById('ntc');if(!a)return;const q=cfg();
  const b=document.createElement('div');b.className='c';b.id='rmc';
  b.innerHTML='<h3>⏳ '+T('یادآوری انتظار باقی‌مانده','Remaining-goal reminders')+'</h3><p class="m">'+T('در ساعت‌های انتخابی می‌گوید امروز چقدر انجام شده و چقدر مانده (فقط تا وقتی هدف امروز نرسیده و تعیین شده باشد).','At chosen times it tells you how much is done today and how much is left (only while the daily goal is set and not reached).')+'</p>'
   +'<label class="row" style="align-items:center;gap:8px"><input type="checkbox" data-rm="on"'+(q.on?' checked':'')+'> '+T('روشن','On')+'</label>'
   +'<div class="row" style="gap:8px;margin-top:6px">'+[0,1,2].map(i=>'<input type="time" data-rm="t'+i+'" value="'+(q.t[i]||'')+'" style="max-width:120px">').join('')+'</div>'
   +'<p class="m">'+T('ساعت را خالی بگذار تا آن نوبت حذف شود.','Clear a time to drop that slot.')+'</p>';
  a.parentNode.insertBefore(b,a.id==='qrc'?a.nextSibling:a.nextSibling)}
document.addEventListener('change',ev=>{const k=ev.target&&ev.target.dataset&&ev.target.dataset.rm;if(!k)return;const q=cfg();
  if(k==='on')q.on=ev.target.checked;else{const i=+k.slice(1),t=q.t.slice();while(t.length<3)t.push('');t[i]=ok(ev.target.value)?ev.target.value:'';q.t=t.filter(ok)}
  save();try{Notifier.sync(true)}catch(e){}});
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{if(page==='set'&&stt==='time')card()}catch(e){}return r}}
window.daniRemain={body};
})();
