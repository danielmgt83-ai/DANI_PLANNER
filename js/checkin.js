/* اعلان ساعتی «الان چه می‌کنی؟» (v67) — اختیاری (پیش‌فرض خاموش). هر N دقیقه در بازه‌ی روز، به‌جز ساعت‌های سکوت و بلوک‌های مشغول.
   لمس اعلان ← پنجره‌ی «این بازه چه کردی؟» (H.dy_gap در daily.js) برای آخرین بازه‌ی ثبت‌نشده.
   اپ اندروید: از راه daniExtraPlan (امروز و فردا)؛ وب: وقتی صفحه باز است. تنظیم: db.set.chk={on,ev,from,to}. بعد از remain.js؛ مسیر لمس در tomorrow.js route(). */
(function(){'use strict';
const T=window.daniT;
const ok=t=>/^\d\d:\d\d$/.test(t||'');
const cfg=()=>{const q=db.set.chk||(db.set.chk={});if(q.on===undefined)q.on=false;if(![30,60,90,120].includes(+q.ev))q.ev=60;if(!ok(q.from))q.from=ok(db.set.ds)?db.set.ds:'08:00';if(!ok(q.to))q.to=ok(db.set.de)&&db.set.de!=='23:59'?db.set.de:'22:00';return q};
const hs=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return 4e8+Math.abs(h)%1e8};
const mn=t=>{const[h,m]=t.split(':').map(Number);return h*60+m};
const atOf=(d,m)=>{const[y,mo,dd]=d.split('-').map(Number);return new Date(y,mo-1,dd,Math.floor(m/60),m%60).getTime()};
const quiet=at=>{try{return typeof inQuiet==='function'&&inQuiet(at)}catch(e){return false}};
const busy=(d,m)=>{try{return(window.daniBusy?window.daniBusy(d):[]).some(x=>m>=mn(x.s)&&m<mn(x.e))}catch(e){return false}};
function slots(d){const q=cfg(),a=mn(q.from),b=mn(q.to),out=[];for(let m=a+q.ev;m<=b;m+=q.ev)out.push(m);return out}
(window.daniExtraPlan=window.daniExtraPlan||[]).push(now=>{const q=cfg(),out=[];if(!q.on)return out;const t0=todayISO();
  [t0,addD(t0,1)].forEach(d=>slots(d).forEach(m=>{const at=atOf(d,m);if(at>now+2000&&!quiet(at)&&!busy(d,m))out.push({id:hs('chk'+d+m),at,title:'DANI 🕒',body:T('الان چه می‌کنی؟ 📚 مفید · ☕ استراحت · 📵 تلف شد — با لمس، فعالیتت را انتخاب می‌کنی.','What are you doing? 📚 Useful · ☕ Rest · 📵 Wasted — tap, then pick the exact activity.'),ch:'dani-remind-v2',key:'chk-'+d+'-'+m})}));return out.slice(0,40)});
/* آخرین بازه‌ی ثبت‌نشده امروز */
function lastGap(){const q=cfg(),t=todayISO(),n=new Date(),nm=Math.floor((n.getHours()*60+n.getMinutes())/5)*5;let from=Math.max(0,nm-q.ev);
  (E(t)||[]).forEach(e=>{if(!ok(e.start))return;const en=mn(e.start)+(e.min||0);if(en<=nm&&en>from)from=en});
  if(nm-from<10)from=Math.max(0,nm-q.ev);return[from,nm]}
function open(){try{const g=lastGap();if(g[1]-g[0]<5)return;H.dy_gap({dataset:{s:String(g[0]),e:String(g[1])}})}catch(e){console.error('checkin',e)}}
const fired={};
function tick(){try{const q=cfg();if(!q.on||(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform()))return;const t=todayISO(),n=new Date(),nm=n.getHours()*60+n.getMinutes();
  slots(t).forEach(m=>{const k=t+m;if(fired[k]||nm<m||nm>m+5||quiet(Date.now())||busy(t,m))return;fired[k]=1;
    const run=db.timer&&db.timer.state==='running';if(run)return;const s=typeof sysNotify==='function'?sysNotify:notify;s('DANI 🕒 '+T('الان چه می‌کنی؟','What are you doing now?'),T('الان چه می‌کنی؟ یک لمس برای ثبت همین ساعت.','What are you doing now? One tap to log this hour.'),'chk-'+k)})}catch(e){}}
setInterval(tick,30000);
function card(){if(document.getElementById('chc'))return;const a=document.getElementById('rmc')||document.getElementById('qrc')||document.getElementById('ntc');if(!a)return;const q=cfg();
  const b=document.createElement('div');b.className='c';b.id='chc';
  b.innerHTML='<h3>🕒 '+T('اعلان «الان چه می‌کنی؟»','“What are you doing?” check-in')+'</h3><p class="m">'+T('در بازه‌ی روز، هر چند دقیقه یک‌بار می‌پرسد؛ با لمس اعلان، همان بازه‌ی ثبت‌نشده را با یک دکمه ثبت می‌کنی. در ساعت‌های سکوت و بلوک‌های «مشغول» نمی‌آید.','During the day it asks every few minutes; tap the notification to log the unlogged span in one tap. Skipped in quiet hours and “busy” blocks.')+'</p>'
   +'<label class="row" style="align-items:center;gap:8px"><input type="checkbox" data-ck="on"'+(q.on?' checked':'')+'> '+T('روشن','On')+'</label>'
   +'<div class="row" style="gap:8px;margin-top:6px;align-items:center"><select data-ck="ev">'+[30,60,90,120].map(v=>'<option value="'+v+'"'+(q.ev===v?' selected':'')+'>'+T('هر '+fa(v)+' دقیقه','Every '+v+' min')+'</option>').join('')+'</select>'
   +'<input type="time" data-ck="from" value="'+q.from+'" style="max-width:110px"><span class="m">→</span><input type="time" data-ck="to" value="'+q.to+'" style="max-width:110px"></div>';
  a.parentNode.insertBefore(b,a.nextSibling)}
document.addEventListener('change',ev=>{const k=ev.target&&ev.target.dataset&&ev.target.dataset.ck;if(!k)return;const q=cfg(),v=ev.target;
  if(k==='on')q.on=v.checked;else if(k==='ev')q.ev=+v.value;else if(ok(v.value))q[k]=v.value;save();try{Notifier.sync(true)}catch(e){}});
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{if(page==='set'&&stt==='time')card()}catch(e){}return r}}
window.daniCheckin={open,lastGap};
})();
