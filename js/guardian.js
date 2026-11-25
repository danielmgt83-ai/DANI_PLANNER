/* v176 — «نگهبان مسیر روشن / Path Guardian»: داخل کارت Clear Path (ابزارها). صفحه‌ی تازه نیست.
   هدف امروز = جمع «روزی چند ساعت» پروژه‌ها (p.pd یا p.wk/p.dpw)؛ انجام‌شده = ثبت‌های همان پروژه‌ها (برای هر پروژه حداکثر تا هدف خودش).
   نقطه‌های روز: db.set.gd.pts=[{t:'12:00',p:50},…] — تا آن ساعت حداقل p٪ هدف باید انجام شده باشد؛ وگرنه اعلان: چقدر انجام شده/چقدر مانده/از همین الان شروع کن.
   اعلان از راه daniExtraPlan (امروز دقیق؛ فردا عمومی و با باز شدن برنامه دقیق می‌شود). وب: tick هر ۳۰ ثانیه. پیش‌فرض روشن (خواسته‌ی کاربر)؛ db.set.gd={on,pts,chip,away}. */
(function(){'use strict';
const T=window.daniT||function(a){return a};
const DEF=()=>[{t:'12:00',p:50},{t:'14:00',p:70},{t:'16:00',p:85},{t:'18:00',p:95},{t:'20:00',p:100}];
const G=()=>{const s=db.set;if(!s.gd||typeof s.gd!=='object')s.gd={};const g=s.gd;if(g.on===undefined)g.on=true;if(!Array.isArray(g.pts)||!g.pts.length)g.pts=DEF();if(g.chip===undefined)g.chip=true;if(![2,3,4,5,7].includes(+g.away))g.away=3;return g};
const okT=t=>/^\d\d:\d\d$/.test(t||'');
const mn=t=>{const[h,m]=t.split(':').map(Number);return h*60+m};
const pts=()=>G().pts.filter(x=>okT(x.t)&&+x.p>0).map(x=>({t:x.t,p:Math.min(100,+x.p)})).sort((a,b)=>mn(a.t)-mn(b.t));
const atOf=(d,m)=>{const[y,mo,dd]=d.split('-').map(Number);return new Date(y,mo-1,dd,Math.floor(m/60),m%60).getTime()};
const hs=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return 4e8+Math.abs(h)%1e8};
const quiet=at=>{try{return typeof inQuiet==='function'&&inQuiet(at)}catch(e){return false}};
const hm=m=>{m=Math.max(0,Math.round(m));return fa(Math.floor(m/60))+':'+fa(String(m%60).padStart(2,'0'))};
const PL=()=>{try{return(window.daniProjects&&daniProjects.list?daniProjects.list():[]).filter(p=>!p.arch)}catch(e){return[]}};
const dayT=p=>{let h=+p.pd||0;if(!h){try{const w=window.daniPjX.paceW(p);h=w/(+p.dpw||7)}catch(e){}}return Math.round((h||0)*60)};
function stat(d){let tg=0,dn=0;const rows=[];PL().forEach(p=>{const t=dayT(p);if(t<=0)return;let m=0;try{m=window.daniPjX.mins(p,d,d)}catch(e){}const x=Math.min(m,t);tg+=t;dn+=x;rows.push({n:p.name||'',t,m:x})});return{tg,dn,rows}}
const needNow=(s,m)=>{const P=pts().filter(x=>mn(x.t)<=m);const q=P[P.length-1];return q?{p:q.p,t:q.t,min:Math.ceil(s.tg*q.p/100)}:null};
const nowM=()=>{const n=new Date();return n.getHours()*60+n.getMinutes()};
function bodyFor(s,q){return T('ساعت '+fa(q.t)+' · انجام‌شده '+hm(s.dn)+' از '+hm(s.tg)+' ('+fa(Math.round(s.dn/s.tg*100))+'٪) · حداقل '+fa(q.p)+'٪ لازم بود · مانده '+hm(s.tg-s.dn)+' — از همین الان شروع کن تا به برنامه‌ات برسی و عقب نیفتی.','At '+q.t+' · done '+hm(s.dn)+' of '+hm(s.tg)+' ('+Math.round(s.dn/s.tg*100)+'%) · you needed '+q.p+'% · '+hm(s.tg-s.dn)+' left — start right now to stay on plan.')}
(window.daniExtraPlan=window.daniExtraPlan||[]).push(now=>{const out=[];if(!G().on)return out;const t0=todayISO(),s0=stat(t0);if(s0.tg<=0)return out;
  [t0,addD(t0,1)].forEach((d,i)=>pts().forEach(q=>{const at=atOf(d,mn(q.t));if(at<=now+2000||quiet(at))return;
    if(i===0){const need=Math.ceil(s0.tg*q.p/100);if(s0.dn>=need)return;out.push({id:hs('gd'+d+q.t),at,title:'DANI 🧭',body:bodyFor(s0,q),ch:'dani-remind-v2',key:'gd-'+d+'-'+q.t})}
    else out.push({id:hs('gd'+d+q.t),at,title:'DANI 🧭',body:T('تا ساعت '+fa(q.t)+' حداقل '+fa(q.p)+'٪ هدف امروز ('+hm(s0.tg)+') باید انجام شده باشد. بزن ببین چقدر مانده.','By '+q.t+' at least '+q.p+'% of today’s target ('+hm(s0.tg)+') should be done. Tap to see what is left.'),ch:'dani-remind-v2',key:'gd-'+d+'-'+q.t})}));return out.slice(0,20)});
const fired={};
function tick(){try{if(!G().on||(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform()))return;const t=todayISO(),nm=nowM(),s=stat(t);if(s.tg<=0)return;
  pts().forEach(q=>{const m=mn(q.t),k=t+q.t;if(fired[k]||nm<m||nm>m+5||quiet(Date.now()))return;fired[k]=1;if(s.dn>=Math.ceil(s.tg*q.p/100))return;
    const f=typeof sysNotify==='function'?sysNotify:notify;f('DANI 🧭',bodyFor(s,q),'gd-'+k)})}catch(e){}}
setInterval(tick,30000);
function open(){try{page='tools';if(db.set.tls&&typeof db.set.tls==='object')db.set.tls.tab='cp';render();window.scrollTo(0,0)}catch(e){console.error('guardian',e)}}
function useful(d){try{return window.daniStreakDay?window.daniStreakDay(d):false}catch(e){return false}}
function streak(){const t=todayISO();let d=useful(t)?t:addD(t,-1),n=0;while(n<800&&useful(d)){n++;d=addD(d,-1)}return n}
function away(){const t=todayISO();if(useful(t))return 0;let n=1;while(n<30&&!useful(addD(t,-n)))n++;return n}
function card(){const g=G(),t=todayISO(),s=stat(t),nm=nowM(),st=streak();
  let h='<div class="c" id="gdc"><h3>🛡 '+T('نگهبان مسیر','Path guardian')+'</h3>';
  if(s.tg<=0)h+='<p class="m">'+T('برای نگهبان، در «پروژه‌ها / انتظارات» برای هر پروژه «روزی چند ساعت» بگذار.','For the guardian, set “hours per day” for each project (Projects / Expectations).')+'</p>';
  else{const q=needNow(s,nm),pc=Math.round(s.dn/s.tg*100),behind=q&&s.dn<q.min;
    h+='<div style="display:flex;justify-content:space-between"><b>'+T('امروز','Today')+' '+hm(s.dn)+' / '+hm(s.tg)+'</b><span class="m">'+fa(pc)+'٪</span></div><div class="bar" style="height:8px;border-radius:4px;background:rgba(128,128,128,.25);overflow:hidden;margin:3px 0 6px"><i style="display:block;height:100%;width:'+Math.min(100,pc)+'%;background:'+(behind?'#ffb454':'#2fbf9b')+'"></i></div>'
     +s.rows.map(r=>'<div class="m" style="display:flex;justify-content:space-between"><span>'+esc(r.n)+'</span><span>'+hm(r.m)+' / '+hm(r.t)+'</span></div>').join('')
     +(q?'<p class="m" style="margin:6px 0">'+(behind?'⚠ '+T('تا ساعت '+fa(q.t)+' حداقل '+fa(q.p)+'٪ لازم بود؛ '+hm(q.min-s.dn)+' عقبی.','By '+q.t+' you needed '+q.p+'%; you are '+hm(q.min-s.dn)+' behind.'):'✓ '+T('طبق برنامه‌ای (حداقل ساعت '+fa(q.t)+': '+fa(q.p)+'٪).','On plan (checkpoint '+q.t+': '+q.p+'%).'))+'</p>':'<p class="m">'+T('هنوز به اولین نقطه‌ی روز نرسیده‌ای.','First checkpoint of the day not reached yet.')+'</p>');
    if(behind){const mm=Math.min(25,Math.max(5,Math.ceil((q.min-s.dn)/5)*5));h+='<button class="p" data-a="gd_plan" data-n="'+mm+'">🧭 '+T('جبران نرم: '+fa(mm)+' دقیقه در برنامه‌ی روز','Soft catch-up: '+mm+' min in the day plan')+'</button>'}}
  h+='<p class="m" style="margin-top:8px">🔥 '+(st?T('رشته‌ی '+fa(st)+' روزه','Streak: '+st+' days')+(useful(t)?'':' — '+T('امروز هنوز ثبتِ مفید نداری','no useful log yet today')):T('رشته‌ای فعال نیست؛ امروز شروع کن.','No active streak; start today.'))+'</p>';
  h+='<details style="margin-top:6px"><summary>⚙ '+T('تنظیمات نگهبان','Guardian settings')+'</summary><label class="row" style="align-items:center;gap:8px"><input type="checkbox" data-gd="on"'+(g.on?' checked':'')+'> '+T('اعلان نگهبان روشن','Guardian notifications on')+'</label>'
   +'<p class="m">'+T('تا هر ساعت، حداقل چند درصد هدف امروز باید انجام شده باشد (صبح‌زودی‌ها ساعت‌ها را جابه‌جا کنند):','By each time, the minimum % of today’s target that should be done (early starters can shift these):')+'</p>'
   +g.pts.map((x,i)=>'<div class="row" style="gap:6px;align-items:center;margin:3px 0"><input type="time" data-gd-t="'+i+'" value="'+E_(x.t)+'" style="max-width:110px"><input type="number" min="5" max="100" step="5" data-gd-p="'+i+'" value="'+(+x.p||50)+'" style="max-width:80px"><span class="m">٪</span><button class="chip" data-a="gd_del" data-n="'+i+'">✕</button></div>').join('')
   +'<div class="row" style="gap:6px;margin-top:4px"><button class="chip" data-a="gd_add">＋ '+T('ساعت','Time')+'</button><button class="chip" data-a="gd_reset">'+T('برگرداندن پیش‌فرض (۱۲/۱۴/۱۶/۱۸/۲۰)','Reset defaults (12/14/16/18/20)')+'</button></div>'
   +'<label class="row" style="align-items:center;gap:8px;margin-top:8px"><input type="checkbox" data-gd="chip"'+(g.chip?' checked':'')+'> '+T('چیپ «برگرد به مسیر» روی خانه بعد از','“Back to path” chip on Home after')+'</label><select data-gd="away">'+[2,3,4,5,7].map(v=>'<option value="'+v+'"'+(+g.away===v?' selected':'')+'>'+T(fa(v)+' روز دوری',v+' days away')+'</option>').join('')+'</select></details></div>';
  return h}
const E_=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const esc2=E_;function esc(x){return esc2(x)}
const sync=()=>{save();try{Notifier.sync(true)}catch(e){}};
H.gd_plan=e=>{try{window.daniClearPath.planSend(T('جبران نرم: ادامه‌ی کار پروژه‌ها','Soft catch-up: continue project work'),+e.dataset.n||15)}catch(x){console.error(x)}};
H.gd_add=()=>{const g=G();g.pts.push({t:'21:00',p:100});sync();render()};
H.gd_del=e=>{const g=G();if(g.pts.length>1)g.pts.splice(+e.dataset.n,1);sync();render()};
H.gd_reset=()=>{G().pts=DEF();sync();render()};
H.gd_back=()=>{open();try{H.cb_new()}catch(e){}};
document.addEventListener('change',ev=>{const d=ev.target&&ev.target.dataset;if(!d)return;const g=G(),v=ev.target;
  if(d.gd==='on')g.on=v.checked;else if(d.gd==='chip')g.chip=v.checked;else if(d.gd==='away')g.away=+v.value;
  else if(d.gdT!==undefined){if(okT(v.value))g.pts[+d.gdT].t=v.value;else return}else if(d.gdP!==undefined){g.pts[+d.gdP].p=Math.max(5,Math.min(100,+v.value||50))}else return;sync()});
/* روی کارت Clear Path (ابزارها) */
try{const cp=window.daniClearPath;if(cp&&cp.card){const _c=cp.card;cp.card=function(){let h='';try{h=card()}catch(e){console.error('guardian card',e)}return h+_c.apply(this,arguments)}}}catch(e){}
/* چیپ بازگشت روی خانه (کنار میان‌بر ابزارها) */
try{const w=window.DANI_SECS.wp;if(w&&typeof w[0]==='function'){const f=w[0];w[0]=function(){let h=f.apply(this,arguments);try{const g=G(),a=away();if(g.chip&&a>=+g.away)h+='<div class="row"><button class="chip" data-a="gd_back">🧭 '+T('یک روز افتادن مسیر را خراب نمی‌کند — ۵ دقیقه برگرد','One slip does not ruin the path — come back for 5 minutes')+'</button></div>'}catch(e){}return h}}}catch(e){}
window.daniGuardian={open,stat,card};
})();
