/* دکمه‌های اعلان چک‌این ساعتی (v78): «📚 مفید / ☕ استراحت / 📵 تلف شد». یک لمس، همان ساعت با آخرین فعالیتِ آن نوع ثبت می‌شود.
   نوع فعالیت از `daniUseTime.cls` (u مفید، n/s استراحت، w تلف) می‌آید؛ اگر فعالیتی از آن نوع نبود فرم ثبت باز می‌شود. نوع اکشن (`dani-chk`) در notifier.js ثبت می‌شود.
   بدون تغییر در کد اندروید؛ بعد از checkin.js و notifx.js. */
(function(){'use strict';
const T=window.daniT,p2=v=>String(v).padStart(2,'0'),mn=t=>{const[h,m]=String(t).split(':').map(Number);return h*60+m},hh=m=>p2(Math.floor(m/60))+':'+p2(m%60);
const _n=window.daniNoteExtra;
window.daniNoteExtra=x=>{let r=null;try{r=_n?_n(x):null}catch(e){}if(/^chk-/.test(String(x&&x.key||'')))return Object.assign({},r||{},{actionTypeId:'dani-chk'});return r};
function pick(kind){const C=window.daniUseTime&&window.daniUseTime.cls;if(!C)return null;
  const want=kind==='cu'?['u']:kind==='cw'?['w']:['n','s'];
  const es=(db.entries||[]).slice().sort((a,b)=>(b.date+(b.start||'')).localeCompare(a.date+(a.start||'')));
  for(const e of es){const a=act(e.actId);if(a&&a.active!==false&&!a.arch&&want.includes(C(e.actId)))return e.actId}
  const a=(db.acts||[]).find(a=>a.active!==false&&!a.arch&&want.includes(C(a.id)));return a?a.id:null}
function logSlot(kind,k){const m=/^chk-(\d{4}-\d\d-\d\d)-(\d+)$/.exec(String(k||''));if(!m)return;const d=m[1],end=+m[2];
  const ev=((db.set.chk||{}).ev)||60;let from=Math.max(0,end-ev);
  (db.entries||[]).filter(e=>e.date===d&&e.start&&e.min).forEach(e=>{const en=mn(e.start)+(e.min||0);if(en<=end&&en>from)from=en});
  const id=pick(kind);
  if(!id||end-from<5){try{window.daniCheckin&&window.daniCheckin.open()}catch(e){}return}
  db.entries.push({id:uid(),date:d,actId:id,subId:'',start:hh(from),end:hh(end),min:end-from,note:'',src:'chk'});
  if(save()){try{toast(T('ثبت شد: ','Logged: ')+aN(id)+' · '+fa(end-from)+T(' دقیقه',' min'))}catch(e){}try{render()}catch(e){}}}
let ok=false;
function hook(){if(ok)return;try{const p=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.LocalNotifications;if(!p||!p.addListener)return;ok=true;
  p.addListener('localNotificationActionPerformed',ev=>{try{const a=ev&&ev.actionId;if(a!=='cu'&&a!=='cr'&&a!=='cw')return;logSlot(a,ev.notification&&ev.notification.extra&&ev.notification.extra.k)}catch(e){console.error('chkact',e)}})}catch(e){}}
setInterval(hook,1500);setTimeout(hook,400);
window.daniChkAct={logSlot,pick};
})();
