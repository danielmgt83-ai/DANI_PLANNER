/* دکمه‌های اعلان چک‌این ساعتی (v78): «📚 مفید / ☕ استراحت / 📵 تلف شد». یک لمس، همان ساعت با آخرین فعالیتِ آن نوع ثبت می‌شود.
   نوع فعالیت از `daniUseTime.cls` (u مفید، n/s استراحت، w تلف) می‌آید؛ اگر فعالیتی از آن نوع نبود فرم ثبت باز می‌شود. نوع اکشن (`dani-chk`) در notifier.js ثبت می‌شود.
   بدون تغییر در کد اندروید؛ بعد از checkin.js و notifx.js. */
(function(){'use strict';
const T=window.daniT,p2=v=>String(v).padStart(2,'0'),mn=t=>{const[h,m]=String(t).split(':').map(Number);return h*60+m},hh=m=>p2(Math.floor(m/60))+':'+p2(m%60);
const _n=window.daniNoteExtra;
window.daniNoteExtra=x=>{let r=null;try{r=_n?_n(x):null}catch(e){}if(/^chk-/.test(String(x&&x.key||'')))return Object.assign({},r||{},{actionTypeId:'dani-chk'});return r};
function cl(id){const C=window.daniUseTime&&window.daniUseTime.cls;return C?C(id):'n'}
const WANT={cu:['u'],cr:['n','s'],cw:['w']};
/* حدس بهترین فعالیت: ۱) پرتکرارترین فعالیتِ هم‌نوع در همین ساعتِ روز در ۱۴ روز گذشته، ۲) تازه‌ترین هم‌نوع، ۳) اولین فعالیت هم‌نوع */
function pick(kind,d,endMin){if(!window.daniUseTime)return null;const want=WANT[kind]||['u'],okA=id=>{const a=act(id);return a&&a.active!==false&&!a.arch&&want.includes(cl(id))};
  const es=(db.entries||[]).filter(e=>okA(e.actId)).sort((a,b)=>(b.date+(b.start||'')).localeCompare(a.date+(a.start||'')));
  if(endMin!=null){const cnt={},t0=new Date(),lim=new Date(t0.getFullYear(),t0.getMonth(),t0.getDate()-14).toISOString().slice(0,10);
   es.forEach(e=>{if(e.date<lim||!e.start)return;const m=mn(e.start);if(Math.abs(m-(endMin-30))<=90)cnt[e.actId]=(cnt[e.actId]||0)+1});
   const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];if(top)return top[0]}
  if(es[0])return es[0].actId;const a=(db.acts||[]).find(a=>okA(a.id));return a?a.id:null}
function names(d,endMin){const n=k=>{const id=pick(k,d,endMin);return id?aN(id):null};return{cu:n('cu'),cr:n('cr'),cw:n('cw')}}
function slotOf(k){const m=/^chk-(\d{4}-\d\d-\d\d)-(\d+)$/.exec(String(k||''));if(!m)return null;const d=m[1],end=+m[2];
  const ev=((db.set.chk||{}).ev)||60;let from=Math.max(0,end-ev);
  (db.entries||[]).filter(e=>e.date===d&&e.start&&e.min).forEach(e=>{const en=mn(e.start)+(e.min||0);if(en<=end&&en>from)from=en});return{d,from,end}}
function put(sl,id,est){db.entries.push({id:uid(),date:sl.d,actId:id,subId:'',start:hh(sl.from),end:hh(sl.end),min:sl.end-sl.from,note:'',src:'chk',est:est?1:0});
  if(save()){try{toast(T('ثبت شد: ','Logged: ')+aN(id)+' · '+fa(sl.end-sl.from)+T(' دقیقه',' min'))}catch(e){}try{render()}catch(e){}}}
/* فعالیت‌های پیشنهادی هم‌نوع: اول پرتکرارِ همین ساعت، بعد تازه‌ترین‌ها */
function cands(kind,sl){const want=WANT[kind]||['u'],okA=id=>{const a=act(id);return a&&a.active!==false&&!a.arch&&want.includes(cl(id))};
  const es=(db.entries||[]).filter(e=>okA(e.actId)).sort((a,b)=>(b.date+(b.start||'')).localeCompare(a.date+(a.start||''))),out=[],seen=new Set();
  const g=pick(kind,sl.d,sl.end);if(g){out.push(g);seen.add(g)}
  es.forEach(e=>{if(out.length<6&&!seen.has(e.actId)){seen.add(e.actId);out.push(e.actId)}});
  (db.acts||[]).forEach(a=>{if(out.length<6&&!seen.has(a.id)&&okA(a.id)){seen.add(a.id);out.push(a.id)}});return out}
function logSlot(kind,k){const sl=slotOf(k);if(!sl)return;
  if(sl.end-sl.from<5){try{window.daniCheckin&&window.daniCheckin.open()}catch(e){}return}
  if((db.set.chk||{}).quick){const id=pick(kind,sl.d,sl.end);if(id)return put(sl,id,1)}
  window.__ckc={kind,sl};const l=cands(kind,sl),lab={cu:T('📚 مفید','📚 Useful'),cr:T('☕ استراحت','☕ Rest'),cw:T('📵 تلف شد','📵 Wasted')}[kind]||'';
  modal('<div style="max-width:400px"><h3>'+lab+' — '+T('دقیقاً چه کاری بود؟','what exactly?')+'</h3><p class="m">'+fmtD(sl.d)+' · '+fa(hh(sl.from))+'–'+fa(hh(sl.end))+' ('+fa(sl.end-sl.from)+T(' دقیقه',' min')+')</p>'
   +'<div class="row" style="flex-wrap:wrap;gap:6px">'+l.map(id=>'<button class="chip" data-a="ckc_pick" data-id="'+id+'">'+esc(aN(id))+'</button>').join('')+'<button class="chip" data-a="ckc_other">'+T('… فعالیت دیگر / تغییر ساعت','… other / change time')+'</button></div>'
   +'<div class="row" style="margin-top:10px"><button class="chip '+((db.set.chk||{}).quick?'on':'')+'" data-a="ckc_quick">'+T('دفعه‌های بعد بپرس‌نکن، حدس بزن','Next time skip this and guess')+'</button></div></div>')}
H.ckc_pick=e=>{const c=window.__ckc;if(!c)return;try{closeM()}catch(x){}put(c.sl,e.dataset.id,0);window.__ckc=null};
H.ckc_other=()=>{const c=window.__ckc;if(!c)return;try{closeM()}catch(x){}window.__gapDay=c.sl.d;try{H.dy_gap({dataset:{s:String(c.sl.from),e:String(c.sl.end),d:c.sl.d}})}catch(x){}window.__ckc=null};
H.ckc_quick=()=>{db.set.chk=db.set.chk||{};db.set.chk.quick=db.set.chk.quick?0:1;save();toast(db.set.chk.quick?T('از این به بعد حدس می‌زند و «تأییدنشده» ثبت می‌کند','From now on it guesses and logs as unconfirmed'):T('از این به بعد هر بار می‌پرسد','From now on it asks each time'))};
let ok=false;
function hook(){if(ok)return;try{const p=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.LocalNotifications;if(!p||!p.addListener)return;ok=true;
  p.addListener('localNotificationActionPerformed',ev=>{try{const a=ev&&ev.actionId;if(a!=='cu'&&a!=='cr'&&a!=='cw')return;logSlot(a,ev.notification&&ev.notification.extra&&ev.notification.extra.k)}catch(e){console.error('chkact',e)}})}catch(e){}}
setInterval(hook,1500);setTimeout(hook,400);
window.daniChkAct={logSlot,pick,names};
/* ---- ثبت‌های سریعِ تأییدنشده: نوار کوچک روی خانه + پنجره‌ی تأیید/اصلاح ---- */
const pend=()=>(db.entries||[]).filter(e=>e.est&&e.src==='chk');
H.cka_open=()=>{const l=pend().sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));if(!l.length){try{closeM()}catch(e){}return}
 modal('<div style="max-width:420px"><h3>'+T('ثبت‌های سریع — تأیید یا اصلاح','Quick logs — confirm or fix')+'</h3><p class="m">'+T('این‌ها را از دکمه‌ی اعلان ثبت کردی و برنامه فعالیت را حدس زده است. تأیید کن تا در گزارش‌ها قطعی شود.','You logged these from a notification button and the app guessed the activity. Confirm to make them final in reports.')+'</p><div style="max-height:50vh;overflow:auto">'
  +l.map(e=>'<div class="c" style="padding:8px"><div class="m">'+fmtD(e.date)+' · '+fa(e.start)+'–'+fa(e.end)+' ('+fa(e.min)+T(' دقیقه',' min')+')</div><div class="row"><select data-ckaa="'+e.id+'" style="flex:1;min-width:0">'+aOpts(e.actId)+'</select><button class="p" data-a="cka_ok" data-id="'+e.id+'">✓</button></div></div>').join('')
  +'</div><div class="row" style="margin-top:8px"><button data-a="cka_all">'+T('تأیید همه','Confirm all')+'</button><button data-a="cl">'+T('بستن','Close')+'</button></div></div>')};
H.cka_ok=e=>{const x=db.entries.find(z=>z.id===e.dataset.id);if(!x)return;const s=document.querySelector('[data-ckaa="'+x.id+'"]');if(s&&s.value)x.actId=s.value;x.est=0;save();H.cka_open();render()};
H.cka_all=()=>{pend().forEach(x=>{x.est=0});save();try{closeM()}catch(e){}render()};
const _r=render;render=function(){const r=_r.apply(this,arguments);try{const old=document.getElementById('ckabar');if(old)old.remove();const n=pend().length;
  if(n&&page==='day'&&!document.getElementById('gd2')){const home=document.querySelector('.home');if(home){const b=document.createElement('div');b.id='ckabar';b.style.cssText='display:flex;align-items:center;gap:8px;padding:6px 10px;margin:6px 0;border:1px dashed var(--bd,#8884);border-radius:12px;font-size:.85rem';
   b.innerHTML='<span style="flex:1">⚡ '+fa(n)+T(' ثبت سریع منتظر تأیید',' quick logs awaiting confirmation')+'</span><button class="chip" data-a="cka_open">'+T('بررسی','Review')+'</button>';home.insertBefore(b,home.firstChild)}}}catch(e){}return r};
})();
