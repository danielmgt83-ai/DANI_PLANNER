"use strict";
/* DANI · livesync.js — سه قابلیتِ تازه (فقط افزوده):
   (۱) تایمر زنده در اعلان گوشی (کرنومتر خودِ اندروید؛ تایمر، شمارش‌معکوس و استراحت پومودورو) — نیازمند APK جدید
   (۲) ویجت صفحه‌ی خانه‌ی گوشی (کارِ بعدی + پیشرفت امروز + تایمر) — نیازمند APK جدید
   (۳) همگام‌سازی بین دستگاه‌ها با «یک فایل» در پوشه‌ی همگام‌شده‌ی خودت (Drive، Syncthing، Dropbox…) — در APK؛ در وب/PWA هم به‌صورت دستی (ساخت فایل و ادغام فایل)
   داده: db.set.lv {on}، db.set.wg {on}؛ نشانی فایل همگام‌سازی فقط در localStorage همین دستگاه (dani_sync_uri) می‌ماند و به پشتیبان نمی‌رود.
   اگر فقط یک دستگاه از آخرین همگام‌سازی تغییر کرده باشد، همه‌ی تغییرها (ویرایش و حذف هم) منتقل می‌شود؛ اگر هر دو تغییر کرده باشند فقط موارد جدید ادغام می‌شود. */
(function(){
const T=window.daniT;
const cap=()=>window.Capacitor;
const native=()=>{try{return !!(cap()&&cap().isNativePlatform&&cap().isNativePlatform())}catch(e){return false}};
const DN=()=>{try{return cap().Plugins.DaniNative||null}catch(e){return null}};
const S=(k,d)=>{const s=db.set;if(!s[k]||typeof s[k]!=='object')s[k]=Object.assign({},d);return s[k]};
const LV=()=>S('lv',{on:1}),WG=()=>S('wg',{on:1});
const mmss=ms=>{ms=Math.max(0,Math.ceil(ms/1000));const h=Math.floor(ms/3600000),m=Math.floor(ms/60000)%60,s=Math.floor(ms/1000)%60;return(h?h+':'+pad(m):pad(Math.floor(ms/60000)))+':'+pad(s)};
const say=(m,b)=>{try{toast(m,b)}catch(e){}};

/* ---------- (۱) تایمر زنده در اعلان ---------- */
let lsig='';
function liveSync(){
  const D=DN();if(!native()||!D||!D.liveStart)return;
  let sig='off',arg=null;
  try{
    const t=db.timer||{},on=LV().on;
    if(on&&t.state==='running'||on&&t.state==='paused'){
      const cd=t.mode==='cd',run=t.state==='running',e=el(),nm=(typeof aN==='function'?aN(t.actId):'')||'DANI';
      arg={title:'⏱ '+nm,text:cd?T('شمارش معکوس','Countdown'):T('کرنومتر','Stopwatch'),running:run,countdown:cd,base:cd?Date.now()+Math.max(0,t.dur-e):Date.now()-e};
      arg.actions=[run?{id:'pause',title:'⏸ '+T('مکث','Pause')}:{id:'resume',title:'▶ '+T('ادامه','Resume')},{id:'stop',title:'⏹ '+T('پایان و ثبت','Finish & log')}];
      if(!run){arg.text='⏸ '+T('مکث','Paused')+' · '+mmss(cd?Math.max(0,t.dur-e):e)}
      sig=[t.state,t.mode,t.t0,t.acc,t.dur,t.actId].join('|');
    }else{
      const p=db.set.pomo;
      if(on&&p&&(p.ph==='break'||p.ph==='long')&&p.until>Date.now()){
        arg={title:(p.ph==='long'?'🛋 ':'☕ ')+T(p.ph==='long'?'استراحت بلند':'استراحت','Break'),text:'Pomodoro',running:true,countdown:true,base:p.until};
        sig='pb|'+p.until;
      }
    }
  }catch(e){}
  if(sig===lsig)return;lsig=sig;
  try{if(arg)D.liveStart(arg);else D.liveStop()}catch(e){}
}

/* ---------- (۲) ویجت ---------- */
let wsig='',psig='';const PIN=()=>(db.set.pin=db.set.pin||{});const LVC_=i=>['#22a38a','#d4a017','#f08a1c','#ef4444','#b91c1c'][i]||'#8AB4FF';
function widgetSync(){
  const D=DN();if(!native()||!D||!D.widgetSet)return;
  let l1='DANI',l2='',l3='',hb='[]';
  try{
    if(!WG().on){l1=l2=l3=''}else{
      const c=window.daniNextTop&&window.daniNextTop();
      l1=c?'🎯 '+c.t:T('فعالیتی را انتخاب کن','Pick an activity');
      const td=todayISO(),m=(db.entries||[]).filter(e=>e.date===td).reduce((a,e)=>a+(+e.min||0),0);
      l2='📊 '+T('امروز: ','Today: ')+mm(m);
      const t=db.timer||{};
      try{const t0=todayISO();hb=JSON.stringify(hItems().filter(h=>!h.arch&&hExp(h,t0)).slice(0,3).map(h=>({id:h.id,n:String(h.name||'').slice(0,24),d:hSt(h,t0)==='done'})))}catch(e){}
      if(t.state==='running'||t.state==='paused')l3='⏱ '+((typeof aN==='function'?aN(t.actId):'')||'')+(t.state==='paused'?' ⏸':'');
    }
  }catch(e){}
  /* v86: شمارنده‌ی موعد نزدیک + سهمیه‌ی امروز (هر کدام جدا قابل خاموش‌شدن) */
  let dn='',du='',dt='',dc='#8AB4FF',qt='',qp=-1;
  try{if(WG().on&&WG().dl!==0){const f=window.daniDlCard&&window.daniDlCard.nearest&&window.daniDlCard.nearest();
      if(f){if(f.ms<=0){dn='!';du=T('گذشته','overdue')}else if(f.d>=1){dn=fa(String(f.d));du=T('روز مانده','days left')}else{dn=fa(String(f.h));du=T('ساعت مانده','hours left')}
       dt=String(f.x.title||'').slice(0,28);if(/^#[0-9a-fA-F]{6}$/.test(f.col))dc=f.col;else{const m=(LVC_(f.lv));dc=m}}}
    if(WG().on&&WG().qt!==0){const h=homeTarget();if(h&&h.tgt){qp=Math.min(100,Math.round(h.done/h.tgt*100));qt=fa(mm(h.done))+' / '+fa(mm(h.tgt))}}}catch(e){}
  /* v94: برنامه‌ی بعدیِ امروز + رگه‌ی روزها (هر کدام جدا قابل خاموش‌شدن) */
  let nx='',sk='';
  try{if(WG().on&&WG().nx!==0){const t0=todayISO(),hm=new Date().toTimeString().slice(0,5);
      const q=(db.plans[t0]||[]).filter(p=>p.status==='todo'&&p.start&&p.start>=hm).sort((a,b)=>a.start<b.start?-1:1)[0];
      if(q)nx='⏭ '+fa(q.start)+' · '+String((typeof aN==='function'?aN(q.actId):'')||'').slice(0,22)}
    if(WG().on&&WG().sk!==0){const has=d=>(E(d)||[]).length>0,t=todayISO();let d=has(t)?t:addD(t,-1),n=0;while(n<800&&has(d)){n++;d=addD(d,-1)}
      if(n>0)sk='🔥 '+fa(String(n))+' '+T('روز پیاپی','day streak')}}catch(e){}
  const sig=l1+'|'+l2+'|'+l3+'|'+hb+'|'+dn+du+dt+dc+qt+qp+nx+sk;if(sig===wsig)return;wsig=sig;
  try{D.widgetSet({l1,l2,l3,hb,dn,du,dt,dc,qt,qp,nx,sk})}catch(e){}
}
/* پنل سریع پین‌شده (v92): روشن/خاموش + فهرست فعالیت‌ها برای پنجره‌ی انتخاب (اخیرها اول) */
function pinSync(){const D=DN();if(!native()||!D||!D.pinSet)return;
  try{const last={};db.entries.forEach(e=>{const k=(e.date||'')+(e.start||'');if(!last[e.actId]||k>last[e.actId])last[e.actId]=k});
    const arr=db.acts.filter(a=>a.active!==false&&!a.arch&&a.cat!=='sleep').sort((a,b)=>(last[b.id]||'').localeCompare(last[a.id]||'')).slice(0,14).map(a=>({id:a.id,n:String(a.name).slice(0,30)}));
    const on=!!PIN().on,js=JSON.stringify(arr),sig=on+'|'+js;if(sig===psig)return;psig=sig;D.pinSet({on,acts:js})}catch(e){}}
/* دکمه‌های ویجت: صفِ عمل‌هایی که بدون باز کردن برنامه زده شده‌اند را اعمال کن */
function widgetPop(){const D=DN();if(!native()||!D||!D.widgetPop)return;
  try{Promise.resolve(D.widgetPop()).then(r=>{let q=[];try{q=JSON.parse((r&&r.q)||'[]')}catch(e){}if(!Array.isArray(q)||!q.length)return;let ch=0;
    q.slice(0,100).forEach(x=>{try{const p=String(x).split(':');
      if(p[0]==='hab'&&p[1]){const t0=todayISO(),h=hItems().find(k=>k.id===p[1]);if(h){const want=p[2]==='1'?'done':null,cur=hSt(h,t0);if((cur==='done')!==(want==='done')){const d0=zMS.hab.d;zMS.hab.d=null;try{zMA.hab.set(h.id+':done')}finally{zMS.hab.d=d0}ch++}}}
      else if(p[0]==='log'){const m=Math.min(240,Math.max(1,+p[1]||15)),c=window.daniNextTop&&window.daniNextTop(),aid=c&&c.a;
        if(aid&&db.acts.some(a=>a.id===aid)){const n=new Date(),en=pad(n.getHours())+':'+pad(n.getMinutes()),st=hm(Math.max(0,tm(en)-m));db.entries.push({id:uid(),date:todayISO(),actId:aid,subId:'',start:st,end:en,min:m,note:'',src:'widget'});ch++}}
      else if(p[0]==='tlog'&&p[1]){const aid=p[1],t0=+p[2],m=Math.min(720,Math.max(1,+p[3]||1));
        if(db.acts.some(a=>a.id===aid)&&t0>0){const a0=new Date(t0),a1=new Date(t0+m*60000),iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()),st=pad(a0.getHours())+':'+pad(a0.getMinutes());
          let en=pad(a1.getHours())+':'+pad(a1.getMinutes()),mn=m;if(iso(a0)!==iso(a1)){en='23:59';mn=Math.max(1,tm('23:59')-tm(st))}
          db.entries.push({id:uid(),date:iso(a0),actId:aid,subId:'',start:st,end:en,min:mn,note:'',src:'pin'});ch++}}
      else if(p[0]==='note'){const t=String(x).slice(5).trim().slice(0,500);if(t){db.notes.push({id:uid(),t,a:'',d:todayISO(),at:Date.now()});ch++}}
    }catch(e){}});
    if(ch){save();wsig='';widgetSync();try{render()}catch(e){}try{toast(T('از ویجت اعمال شد: ','From widget: ')+ch)}catch(e){}}}).catch(()=>{})}catch(e){}}
let lAct=false;
function actListen(){const D=DN();if(lAct||!native()||!D||!D.addListener)return;lAct=true;
  try{D.addListener('liveAction',ev=>{const a=ev&&ev.action;try{
    if(a==='start'){try{page='dash';dt='today'}catch(e){}}else if(a==='pause')TM.pause();else if(a==='resume')TM.resume();else if(a==='stop'){TM.finish()}
    lsig='';liveSync();try{render()}catch(e){}}catch(e){console.error('liveAction',e)}})}catch(e){lAct=false}}
setInterval(()=>{actListen();liveSync();widgetSync();pinSync();widgetPop()},3000);setTimeout(actListen,800);document.addEventListener('visibilitychange',()=>{if(!document.hidden)widgetPop()});
setTimeout(()=>{liveSync();widgetSync()},2500);
{const _s=save;save=function(){const r=_s.apply(this,arguments);try{if(!busy)sl(DIRTY_K,'1');setTimeout(()=>{liveSync();widgetSync()},0);schedSync()}catch(e){}return r}}

/* ---------- (۳) همگام‌سازی ---------- */
const URI_K='dani_sync_uri',AUTO_K='dani_sync_auto',LAST_K='dani_sync_last',RV_K='dani_sync_rv',DIRTY_K='dani_sync_dirty';
const gl=k=>{try{return localStorage.getItem(k)||''}catch(e){return''}};
const sl=(k,v)=>{try{if(v)localStorage.setItem(k,v);else localStorage.removeItem(k)}catch(e){}};
const plain=o=>o&&typeof o==='object'&&!Array.isArray(o);
const jk=o=>{try{return JSON.stringify(o)}catch(e){return''}};
function fill(l,r,dep){let n=0;if(dep>8)return 0;
  for(const k of Object.keys(r)){if(k==='__proto__'||k==='constructor')continue;
    if(!(k in l)){l[k]=JSON.parse(jk(r[k]));n++}
    else if(plain(l[k])&&plain(r[k]))n+=fill(l[k],r[k],dep+1);
    else if(Array.isArray(l[k])&&Array.isArray(r[k])){
      const have=new Set(l[k].map(x=>plain(x)&&x.id!==undefined?'i'+x.id:'j'+jk(x)));
      r[k].forEach(x=>{if(!plain(x)&&typeof x!=='string'&&typeof x!=='number')return;if(!plain(x))return;const key=x.id!==undefined?'i'+x.id:'j'+jk(x);if(!have.has(key)){l[k].push(JSON.parse(jk(x)));have.add(key);n++}})}}
  return n}
function mergeRemote(txt){
  const j=JSON.parse(txt),x=j&&j.db?j.db:j;
  if(!x||!Array.isArray(x.acts)||!Array.isArray(x.entries))throw new Error(T('فایل همگام‌سازی معتبر نیست','Not a valid sync file'));
  const before=jk([db.acts,db.entries,db.notes,db.mods,db.days,db.plans]);
  try{snap()}catch(e){}
  const r={acts:x.acts,entries:x.entries,days:plain(x.days)?x.days:{},plans:plain(x.plans)?x.plans:{},notes:Array.isArray(x.notes)?x.notes:[]};
  merge(JSON.parse(jk(r)));
  if(plain(x.mods)){fill(zMD(),x.mods,0)}
  if(plain(x.days)){fill(db.days,x.days,0)}
  if(plain(x.plans)){fill(db.plans,x.plans,0)}
  const ch=before!==jk([db.acts,db.entries,db.notes,db.mods,db.days,db.plans]);
  if(ch){busy=true;try{save()}finally{busy=false}}
  return ch}
let lastTs='';const payload=()=>{lastTs=new Date().toISOString();return JSON.stringify({app:'hamrah',version:3,exportedAt:lastTs,sync:true,db})};
function adopt(j){const x=j&&j.db;if(!x||!Array.isArray(x.acts)||!Array.isArray(x.entries))throw new Error(T('فایل همگام‌سازی معتبر نیست','Not a valid sync file'));
  const keys=Object.keys(x).filter(k=>!['set','timer','ver','version'].includes(k)&&x[k]&&typeof x[k]==='object'),snapK=()=>jk(keys.map(k=>db[k]));const before=snapK();
  try{snap()}catch(e){}keys.forEach(k=>{db[k]=JSON.parse(jk(x[k]))});const ch=before!==snapK();if(ch){busy=true;try{save()}finally{busy=false}}return ch}
const setSt=v=>{window.daniSyncState=v;try{document.dispatchEvent(new Event('dani-sync'))}catch(e){}};
let busy=false,run=false,timer=0,msg='';
/* رمزگذاری فایل همگام‌سازی (lock.js → window.daniCrypt). فایل رمزگذاری‌شده بدون رمز ادغام نمی‌شود؛ همگام‌سازی خودکار بی‌صدا خطا می‌دهد، دستی رمز می‌پرسد. */
const CR=()=>window.daniCrypt||null;
async function decTxt(t,manual){const c=CR();if(!t||!c||!c.isEnv(t))return t;
  if(!c.on()){if(!manual)throw new Error(T('فایل همگام‌سازی رمزگذاری شده؛ رمز را در تنظیمات ← داده‌ها وارد کن','The sync file is encrypted; enter the password in Settings → Data'));
    const p=await c.ask(T('رمز فایل همگام‌سازی','Sync file password'),'',false);if(!p)throw new Error(T('رمز وارد نشد','No password entered'));await c.setPw(p)}
  try{return(await c.dec(t)).trim()}catch(e){if(manual&&c.on()){const p=await c.ask(T('رمز نادرست بود؛ دوباره','Wrong password; try again'),'',false);if(p){await c.setPw(p);return(await c.dec(t)).trim()}}throw e}}
async function encTxt(t){const c=CR();return c&&c.on()?c.enc(t):t}
async function doSync(manual){
  const D=DN(),u=gl(URI_K);if(!native()||!D||!D.syncRead||!u||run)return;
  run=true;
  try{
    let ch=false,txt='',skipWrite=false;
    try{const r=await D.syncRead({uri:u});txt=(r&&r.text||'').trim()}catch(e){if(manual)throw e}
    txt=await decTxt(txt,manual);
    const dirty=gl(DIRTY_K)==='1',rv=gl(RV_K);
    if(txt){let j=null;try{j=JSON.parse(txt)}catch(e){throw new Error(T('فایل همگام‌سازی خراب است','Sync file is corrupted'))}
      const rt=(j&&j.exportedAt)||'';
      if(rt&&rt===rv)ch=false;
      else if(rv&&!dirty){ch=adopt(j);skipWrite=true;sl(RV_K,rt)}  /* فقط آن دستگاه عوض شده: ویرایش‌ها و حذف‌ها هم می‌آید */
      else ch=mergeRemote(txt);                                       /* هر دو عوض شده یا بار اول: فقط موارد تازه اضافه می‌شود */
    }
    if(!skipWrite&&(dirty||ch||!txt||manual||!rv)){await D.syncWrite({uri:u,text:await encTxt(payload())});sl(RV_K,lastTs);sl(DIRTY_K,'')}
    sl(LAST_K,String(Date.now()));
    setSt('ok');msg=T('همگام شد','Synced')+(ch?' · '+T('داده‌ی تازه از دستگاه دیگر آمد','new data came from another device'):'');
    if(manual||ch)say('🔄 '+msg);
    if(ch)try{render()}catch(e){}
  }catch(e){setSt('err');msg=T('همگام‌سازی ناموفق: ','Sync failed: ')+(e&&e.message||e);if(manual)say(msg,1)}
  finally{run=false;if(window.stt==='time'||typeof stt!=='undefined'&&stt==='time')try{render()}catch(e){}}}
function schedSync(){if(busy||!native()||!gl(URI_K)||gl(AUTO_K)!=='1')return;clearTimeout(timer);timer=setTimeout(()=>doSync(false),20000)}
setTimeout(()=>{if(gl(AUTO_K)==='1')doSync(false)},6000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&gl(AUTO_K)==='1')setTimeout(()=>doSync(false),800)});

H.ls_pick=async e=>{const D=DN();if(!D||!D.syncPick)return say(T('این قابلیت به APK جدید نیاز دارد','This needs the new APK'),1);
  try{const r=await D.syncPick({create:e.dataset.c==='1'});if(!r||r.cancelled||!r.uri)return;sl(URI_K,r.uri);sl(AUTO_K,'1');await doSync(true)}catch(err){say(T('انتخاب ناموفق بود: ','Pick failed: ')+(err&&err.message||err),1)}};
H.ls_now=()=>doSync(true);
H.ls_auto=()=>{sl(AUTO_K,gl(AUTO_K)==='1'?'':'1');render()};
H.ls_off=()=>{if(!confirm(T('اتصال به فایل همگام‌سازی قطع شود؟ خودِ فایل پاک نمی‌شود.','Disconnect the sync file? The file itself is not deleted.')))return;sl(URI_K,'');sl(AUTO_K,'');sl(LAST_K,'');sl(RV_K,'');sl(DIRTY_K,'');setSt('');msg='';render()};
H.ls_lv=()=>{LV().on=LV().on?0:1;save();lsig='';liveSync();render()};
H.ls_wd=e=>{const k=e&&e.dataset?e.dataset.k:e;if(k!=='dl'&&k!=='qt'&&k!=='nx'&&k!=='sk')return;WG()[k]=WG()[k]===0?1:0;save();wsig='';widgetSync();render()};
H.ls_pin=()=>{PIN().on=PIN().on?0:1;save();psig='';pinSync();render()};
H.ls_wg=()=>{WG().on=WG().on?0:1;save();wsig='';widgetSync();render()};
H.ls_mk=()=>{try{dl('dani-sync-'+todayISO()+'.json','application/json',payload())}catch(e){say(String(e&&e.message||e),1)}};
document.addEventListener('change',ev=>{const t=ev.target;if(!t||!t.matches||!t.matches('[data-ls-file]'))return;const f=t.files&&t.files[0];t.value='';if(!f)return;
  f.text().then(async tx=>{tx=await decTxt(tx.trim(),true);const ch=mergeRemote(tx);say(ch?T('ادغام شد؛ داده‌ی تازه اضافه شد','Merged — new data added'):T('چیز تازه‌ای برای افزودن نبود','Nothing new to add'));try{render()}catch(e){}}).catch(err=>say(String(err&&err.message||err),1))});

function card(){
  const nat=native()&&DN(),u=gl(URI_K),last=+gl(LAST_K)||0,hasN=nat&&DN().syncPick;
  let h='<div class="c" id="lscard">'+daniH('🔄','همگام‌سازی، ویجت و تایمر زنده','Sync, widget & live timer');
  h+='<p class="m">'+T('همگام‌سازی با یک فایل در پوشه‌ی خودت (Google Drive، Syncthing، Dropbox…) انجام می‌شود؛ هیچ سروری در کار نیست و داده‌ات فقط پیش خودت می‌ماند. در هر دو دستگاه همان فایل را انتخاب کن. اگر بین دو همگام‌سازی فقط یک دستگاه را تغییر دهی، ویرایش و حذف هم منتقل می‌شود؛ اگر هر دو دستگاه را تغییر دادی فقط موارد جدید ادغام می‌شود. لحظه‌ای هم نیست (هنگام باز کردن برنامه و ۲۰ ثانیه پس از هر تغییر).','Sync works through one file in a folder you already sync (Google Drive, Syncthing, Dropbox…). No server; your data stays yours. Pick the same file on both devices. If only one device changed between syncs, edits and deletions carry over too; if both changed, only NEW items are merged. It is not instant (on app open and ~20 s after a change).')+'</p>';
  if(hasN){
    if(u){h+='<div class="m">✅ '+T('به یک فایل وصل است','Connected to a file')+(last?' · '+T('آخرین همگام‌سازی: ','Last sync: ')+new Date(last).toLocaleString():'')+'</div>'
      +(msg?'<div class="m">'+esc(msg)+'</div>':'')
      +'<div class="row" style="margin-top:6px"><button class="p" data-a="ls_now">🔄 '+T('همین حالا همگام کن','Sync now')+'</button><button class="chip '+(gl(AUTO_K)==='1'?'on':'')+'" data-a="ls_auto">'+T('خودکار','Auto')+'</button><button class="chip" data-a="ls_off">'+T('قطع اتصال','Disconnect')+'</button></div>'}
    else h+='<div class="row"><button class="p" data-a="ls_pick" data-c="1">＋ '+T('ساخت فایل همگام‌سازی (دستگاه اول)','Create sync file (first device)')+'</button><button class="chip" data-a="ls_pick" data-c="0">📂 '+T('انتخاب فایل موجود (دستگاه دوم)','Pick existing file (second device)')+'</button></div>'}
  else if(native()) h+='<div class="m">'+T('برای همگام‌سازی خودکار، APK یک‌بار از نو ساخته شود.','Rebuild the APK once for automatic sync.')+'</div>';
  h+='<div class="m" style="margin-top:8px">'+T('روش دستی (وب، PWA یا هر دستگاه):','Manual way (web, PWA or any device):')+'</div><div class="row"><button class="chip" data-a="ls_mk">⬇ '+T('ساخت فایل همگام‌سازی','Make sync file')+'</button><label class="chip" style="cursor:pointer">📥 '+T('ادغام یک فایل','Merge a file')+'<input type="file" accept=".json,application/json" data-ls-file hidden></label></div>';
  if(native()){
    h+='<div class="row" style="margin-top:10px"><button class="chip '+(LV().on?'on':'')+'" data-a="ls_lv">⏱ '+T('تایمر زنده در اعلان','Live timer in notification')+'</button><button class="chip '+(WG().on?'on':'')+'" data-a="ls_wg">🧩 '+T('محتوای ویجت','Widget content')+'</button><button class="chip '+(PIN().on?'on':'')+'" data-a="ls_pin">📌 '+T('پنل سریع در اعلان‌ها','Pinned quick panel')+'</button></div>'+(PIN().on?'<div class="m">'+T('در پرده‌ی اعلان: ⏱ شروع (انتخاب فعالیت در پنجره‌ی شناور و شمارش از همان‌جا با مکث/پایان)، ⚡ +۱۵ دقیقه و 📝 یادداشت سریع؛ همه بدون باز کردن برنامه. نتیجه دفعه‌ی بعد که برنامه را باز کنی ثبت می‌شود.','In the notification shade: ⏱ Start (pick an activity in a floating window, then count with pause/stop right there), ⚡ +15 min and 📝 quick note; all without opening the app. Results are saved next time you open the app.')+'</div>':'')
     +(WG().on?'<div class="row" style="margin-top:6px;gap:6px"><button class="chip '+(WG().dl!==0?'on':'')+'" data-a="ls_wd" data-k="dl">⏳ '+T('شمارنده‌ی موعد','Deadline counter')+'</button><button class="chip '+(WG().qt!==0?'on':'')+'" data-a="ls_wd" data-k="qt">📊 '+T('سهمیه‌ی امروز','Today quota')+'</button><button class="chip '+(WG().nx!==0?'on':'')+'" data-a="ls_wd" data-k="nx">⏭ '+T('برنامه‌ی بعدی','Next plan')+'</button><button class="chip '+(WG().sk!==0?'on':'')+'" data-a="ls_wd" data-k="sk">🔥 '+T('رگه‌ی روزها','Streak')+'</button></div>':'')
      +'<div class="m">'+T('ویجت: روی صفحه‌ی خانه‌ی گوشی نگه دار ← ویجت‌ها ← DANI. (نیازمند APK جدید)','Widget: long-press home screen → Widgets → DANI. (needs the new APK)')+'</div>'}
  return h+'</div>'}
{const _sp=setPage;setPage=function(){const h=_sp.apply(this,arguments);return(typeof h==='string'&&typeof stt!=='undefined'&&stt==='time')?h+card():h}}
window.daniLiveSync={liveSync,widgetSync,doSync,mergeRemote,payload};
})();
