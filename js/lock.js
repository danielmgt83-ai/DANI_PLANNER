"use strict";
/* DANI · lock.js — مرحله ۶: (۱) قفل برنامه با PIN (۴ یا ۶ رقم) و (۲) رمزگذاری فایل همگام‌سازی.
   قفل: PIN با PBKDF2-SHA256 هش می‌شود و فقط در localStorage همین دستگاه می‌ماند (کلید dani_lock؛ نه در پشتیبان، نه در فایل همگام‌سازی).
        قفل هنگام باز شدن برنامه؛ و بعد از رفتن به پس‌زمینه (فوری / ۱ / ۵ / ۱۵ دقیقه). تلاش اشتباه: از پنجمی به بعد صبر (۳۰ ثانیه، دو برابر شونده تا ۱۵ دقیقه).
        کد بازیابی (یک‌بار نشان داده می‌شود) برای فراموشی PIN؛ و «پاک‌کردن همه‌ی داده» به‌عنوان آخرین راه.
        این قفل جلوی چشم را می‌گیرد؛ اعلان‌ها و زنگ‌ها مثل قبل کار می‌کنند. رمزنگاریِ خودِ داده‌ی ذخیره‌شده نیست (فقط فایل همگام‌سازی رمزگذاری می‌شود).
   رمزگذاری همگام‌سازی: AES-GCM 256 با کلید PBKDF2 (۲۰۰هزار دور) از «رمز همگام‌سازی»؛ رمز فقط در localStorage همین دستگاه (dani_sync_pw) تا همگام‌سازی خودکار کار کند.
        پاکت فایل: {"dani_enc":1,...}. API: window.daniCrypt {on, isEnv, enc, dec, ask, setPw, clear}؛ livesync.js آن را صدا می‌زند. */
(function(){
const T=window.daniT;
const gl=k=>{try{return localStorage.getItem(k)||''}catch(e){return''}};
const sl=(k,v)=>{try{if(v)localStorage.setItem(k,v);else localStorage.removeItem(k)}catch(e){}};
const say=(m,b)=>{try{toast(m,b)}catch(e){}};
const enc8=s=>new TextEncoder().encode(s),dec8=b=>new TextDecoder().decode(b);
const b64=u=>{u=new Uint8Array(u);let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s)};
const ub64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const rnd=n=>crypto.getRandomValues(new Uint8Array(n));
const SUB=()=>crypto&&crypto.subtle;
const L_K='dani_lock',F_K='dani_lock_f',PW_K='dani_sync_pw',SALT_K='dani_sync_salt',IT=200000;
const fd=n=>(typeof fa==='function'?fa(n):n);

/* ---------- ابزار رمزنگاری ---------- */
async function pbk(pass,salt,it,len){const k=await SUB().importKey('raw',enc8(pass),'PBKDF2',false,['deriveBits','deriveKey']);
  return len?SUB().deriveBits({name:'PBKDF2',salt,iterations:it,hash:'SHA-256'},k,len):SUB().deriveKey({name:'PBKDF2',salt,iterations:it,hash:'SHA-256'},k,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
const same=(a,b)=>{if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0};
const hashPin=async(p,salt)=>b64(await pbk(p,salt,150000,256));

/* ---------- رمزگذاری فایل همگام‌سازی ---------- */
const keyCache=new Map();
async function keyFor(pw,saltB){const id=saltB+'|'+pw.length+'|'+pw;if(!keyCache.has(id)){if(keyCache.size>4)keyCache.clear();keyCache.set(id,await pbk(pw,ub64(saltB),IT))}return keyCache.get(id)}
const isEnv=t=>{t=String(t||'').trimStart();if(t[0]!=='{')return false;try{const j=JSON.parse(t);return !!(j&&j.dani_enc===1&&j.ct&&j.iv&&j.salt)}catch(e){return false}};
const on=()=>!!gl(PW_K);
async function enc(text){const pw=gl(PW_K);if(!pw)return text;
  let sa=gl(SALT_K);if(!sa){sa=b64(rnd(16));sl(SALT_K,sa)}
  const iv=rnd(12),ct=await SUB().encrypt({name:'AES-GCM',iv},await keyFor(pw,sa),enc8(text));
  return JSON.stringify({dani_enc:1,alg:'AES-GCM',kdf:'PBKDF2-SHA256',it:IT,salt:sa,iv:b64(iv),ct:b64(ct)})}
async function dec(text,pw){pw=pw||gl(PW_K);if(!pw)throw new Error('nopw');const j=JSON.parse(text);
  try{const pt=await SUB().decrypt({name:'AES-GCM',iv:ub64(j.iv)},await keyFor(pw,j.salt),ub64(j.ct));return dec8(pt)}
  catch(e){throw new Error(T('رمز همگام‌سازی نادرست است (یا فایل خراب است)','Wrong sync password (or the file is damaged)'))}}
/* پنجره‌ی رمز (فیلد پنهان). برمی‌گرداند: رشته یا null */
function ask(title,hint,twice){return new Promise(res=>{
  const o=document.createElement('div');o.id='dkpw';o.setAttribute('data-nobi','1');
  o.style.cssText='position:fixed;inset:0;z-index:2147482000;background:rgba(0,0,0,.6);display:grid;place-items:center;padding:16px';
  o.innerHTML='<div class="c" style="max-width:360px;width:100%"><h3 class="dh">🔑 '+title+'</h3>'+(hint?'<p class="m">'+hint+'</p>':'')
    +'<input type="password" id="dkpw1" autocomplete="off" style="width:100%" placeholder="'+T('رمز','Password')+'">'+(twice?'<input type="password" id="dkpw2" autocomplete="off" style="width:100%;margin-top:6px" placeholder="'+T('تکرار رمز','Repeat password')+'">':'')
    +'<p class="m" id="dkpwe" style="color:var(--wr)"></p><div class="row"><button class="p" id="dkpwok">'+T('تأیید','OK')+'</button><button id="dkpwno">'+T('انصراف','Cancel')+'</button></div></div>';
  document.body.appendChild(o);const i1=o.querySelector('#dkpw1'),i2=o.querySelector('#dkpw2'),er=o.querySelector('#dkpwe');setTimeout(()=>i1.focus(),50);
  const done=v=>{o.remove();res(v)};
  const ok=()=>{const v=i1.value;if(v.length<6){er.textContent=T('رمز دست‌کم ۶ نویسه باشد','At least 6 characters');return}
    if(twice&&v!==i2.value){er.textContent=T('دو رمز یکی نیست','The two passwords differ');return}done(v)};
  o.querySelector('#dkpwok').onclick=ok;o.querySelector('#dkpwno').onclick=()=>done(null);
  o.addEventListener('keydown',e=>{if(e.key==='Enter')ok();else if(e.key==='Escape')done(null)})})}
const setPw=async pw=>{if(!pw){sl(PW_K,'');sl(SALT_K,'');keyCache.clear();return}sl(PW_K,pw);sl(SALT_K,b64(rnd(16)))};
window.daniCrypt={on,isEnv,enc,dec,ask,setPw,clear:()=>setPw('')};

/* ---------- قفل برنامه ---------- */
const cfg=()=>{try{return JSON.parse(gl(L_K))||null}catch(e){return null}};
const saveCfg=c=>sl(L_K,c?JSON.stringify(c):'');
let locked=false,hiddenAt=0,ov=null,mode='enter',buf='',tmp='',msgT='',setupLen=4,setupAfter=0,chain=null;
const css=document.createElement('style');
css.textContent='#dklk{position:fixed;inset:0;z-index:2147483000;background:linear-gradient(160deg,#0f1b2d,#1e293b);color:#e5e7eb;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:20px;font-family:inherit;overflow:auto}'
 +'#dklk h2{margin:0;font-size:1.25em}#dklk .lm{opacity:.75;min-height:1.4em;text-align:center;font-size:.92em;max-width:320px}#dklk .dots{display:flex;gap:12px;direction:ltr;min-height:18px}'
 +'#dklk .dots i{width:14px;height:14px;border-radius:50%;border:2px solid #94a3b8}#dklk .dots i.f{background:#60a5fa;border-color:#60a5fa}'
 +'#dklk .pad{display:grid;grid-template-columns:repeat(3,72px);gap:12px;direction:ltr}#dklk .pad button{height:72px;border-radius:50%;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:#fff;font-size:1.6em;cursor:pointer}'
 +'#dklk .pad button:active{background:rgba(255,255,255,.25)}#dklk .lk-links{display:flex;gap:14px;flex-wrap:wrap;justify-content:center}#dklk .lk-links button{background:none;border:0;color:#93c5fd;cursor:pointer;font-size:.9em}'
 +'#dklk.cover .pad,#dklk.cover .dots,#dklk.cover .lk-links{display:none}#dklk input{padding:10px;border-radius:8px;border:1px solid #475569;background:#0f172a;color:#fff;width:260px;text-align:center}@keyframes lkshake{25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}#dklk .shake{animation:lkshake .3s}';
document.head.appendChild(css);
const hideApp=v=>{try{document.documentElement.toggleAttribute('data-lk',!!v)}catch(e){}};
function waitLeft(){const f=(()=>{try{return JSON.parse(gl(F_K))||{}}catch(e){return{}}})();return Math.max(0,Math.ceil(((f.until||0)-Date.now())/1000))}
function fail(){const f=(()=>{try{return JSON.parse(gl(F_K))||{}}catch(e){return{}}})();f.n=(f.n||0)+1;if(f.n>=5)f.until=Date.now()+Math.min(900,30*Math.pow(2,f.n-5))*1000;sl(F_K,JSON.stringify(f))}
const okReset=()=>sl(F_K,'');
function build(){if(ov)return ov;ov=document.createElement('div');ov.id='dklk';ov.setAttribute('data-nobi','1');ov.setAttribute('dir',LANGEN()?'ltr':'rtl');document.body.appendChild(ov);
  ov.addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(b)key(b.dataset.k);const a=e.target.closest('[data-l]');if(a)link(a.dataset.l)});return ov}
function paint(){if(!ov)return;const c=cfg(),len=(mode==='setup'||mode==='setup2'||mode==='newpin'||mode==='newpin2')?setupLen:(c&&c.n)||4;
  const title={enter:T('DANI قفل است','DANI is locked'),setup:T('یک PIN تازه بساز','Create a new PIN'),setup2:T('PIN را دوباره وارد کن','Enter the PIN again'),verify:T('PIN فعلی را وارد کن','Enter your current PIN'),
    newpin:T('PIN تازه','New PIN'),newpin2:T('PIN تازه را تکرار کن','Repeat the new PIN'),off:T('برای خاموش‌کردن قفل، PIN را وارد کن','Enter your PIN to turn the lock off'),rec:T('کد بازیابی را وارد کن','Enter your recovery code')}[mode];
  let h='<div style="font-size:2.2em" aria-hidden="true">🔒</div><h2>'+title+'</h2><div class="lm" id="lkm">'+msgT+'</div>';
  if(mode==='rec'){h+='<input id="lkrc" dir="ltr" autocomplete="off" placeholder="XXXX-XXXX-XXXX-XXXX"><div class="lk-links"><button data-l="recok">'+T('تأیید','Confirm')+'</button><button data-l="back">'+T('بازگشت','Back')+'</button><button data-l="wipe" style="color:#fca5a5">'+T('پاک‌کردن همه‌ی داده و شروع از نو','Erase all data and start over')+'</button></div>'}
  else{h+='<div class="dots" id="lkd">'+Array.from({length:len},(_,i)=>'<i class="'+(i<buf.length?'f':'')+'"></i>').join('')+'</div><div class="pad">'+[1,2,3,4,5,6,7,8,9,'x',0,'⌫'].map(k=>k==='x'?'<span></span>':'<button data-k="'+k+'" aria-label="'+k+'">'+k+'</button>').join('')+'</div>';
    h+='<div class="lk-links">'+(mode==='enter'?'<button data-l="forgot">'+T('PIN را فراموش کردم','Forgot PIN')+'</button>':'<button data-l="cancel">'+T('انصراف','Cancel')+'</button>')+'</div>'}
  ov.className='';ov.innerHTML=h;if(mode==='rec')setTimeout(()=>{const i=ov.querySelector('#lkrc');i&&i.focus()},50)}
function show(m,msg){mode=m;buf='';msgT=msg||'';build();paint();tickWait()}
let wt=0;function tickWait(){clearInterval(wt);const w=waitLeft();if(mode==='enter'&&w>0){msgT=T('تلاش‌های اشتباه زیاد بود؛ '+fd(w)+' ثانیه صبر کن','Too many wrong tries; wait '+w+' s');const m=ov&&ov.querySelector('#lkm');if(m)m.textContent=msgT;wt=setInterval(()=>{const x=waitLeft(),m2=ov&&ov.querySelector('#lkm');if(x<=0){clearInterval(wt);if(m2)m2.textContent='';msgT=''}else if(m2)m2.textContent=T('تلاش‌های اشتباه زیاد بود؛ '+fd(x)+' ثانیه صبر کن','Too many wrong tries; wait '+x+' s')},1000)}}
function lockNow(cover){const c=cfg();if(!c||locked&&!cover)return;locked=true;hideApp(1);build();if(cover){mode='enter';buf='';paint();ov.className='cover';return}show('enter')}
function unlock(){locked=false;buf='';clearInterval(wt);hideApp(0);if(ov){ov.remove();ov=null}try{render()}catch(e){}}
function shake(m){msgT=m||'';paint();const d=ov&&ov.querySelector('#lkd');if(d){d.classList.add('shake');setTimeout(()=>d.classList.remove('shake'),350)}try{navigator.vibrate&&navigator.vibrate(60)}catch(e){}}
function key(k){if(waitLeft()>0&&mode==='enter')return;if(k==='⌫'){buf=buf.slice(0,-1);paint();return}if(!/^\d$/.test(k))return;
  const c=cfg(),len=(mode.indexOf('setup')===0||mode.indexOf('newpin')===0)?setupLen:(c&&c.n)||4;if(buf.length>=len)return;buf+=k;paint();if(buf.length===len)setTimeout(()=>submit(buf),120)}
async function check(p){const c=cfg();if(!c)return true;return same(await hashPin(p,ub64(c.s)),c.h)}
function newRecovery(){const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',r=rnd(16);let s='';for(let i=0;i<16;i++){s+=A[r[i]%A.length];if(i%4===3&&i<15)s+='-'}return s}
async function submit(p){try{
  if(mode==='enter'){if(await check(p)){okReset();unlock()}else{fail();buf='';shake(T('PIN نادرست است','Wrong PIN'));tickWait()}}
  else if(mode==='verify'||mode==='off'){if(!await check(p)){fail();buf='';return shake(T('PIN نادرست است','Wrong PIN'))}okReset();if(mode==='off'){saveCfg(null);closeOv();say(T('قفل خاموش شد','Lock turned off'));rerender()}else show('newpin')}
  else if(mode==='setup'||mode==='newpin'){tmp=p;show(mode==='setup'?'setup2':'newpin2')}
  else if(mode==='setup2'||mode==='newpin2'){if(p!==tmp){tmp='';show(mode==='setup2'?'setup':'newpin',T('دو PIN یکی نبود؛ دوباره','The PINs differed; try again'));return}
    const old=cfg(),salt=rnd(16),c=Object.assign({v:1,after:setupAfter},old||{},{s:b64(salt),h:await hashPin(p,salt),n:p.length});
    let rc='';if(!c.rc){rc=newRecovery();const rs=rnd(16);c.rc={s:b64(rs),h:await hashPin(rc.replace(/-/g,''),rs)}}
    saveCfg(c);tmp='';okReset();
    if(rc)recoveryScreen(rc);else{closeOv();say(T('PIN عوض شد ✓','PIN changed ✓'));rerender()}}
}catch(e){console.error('lock',e);shake(String(e&&e.message||e))}}
function recoveryScreen(rc){build();ov.className='';ov.innerHTML='<div style="font-size:2.2em">🗝</div><h2>'+T('کد بازیابی','Recovery code')+'</h2><div class="lm">'+T('اگر PIN را فراموش کردی فقط با این کد می‌توانی قفل را باز کنی. همین حالا جایی امن بنویسش؛ دوباره نشان داده نمی‌شود.','If you forget the PIN, only this code can reset the lock. Write it down somewhere safe now; it will not be shown again.')+'</div><div dir="ltr" style="font:700 1.5em monospace;letter-spacing:.08em;background:rgba(255,255,255,.1);padding:10px 14px;border-radius:10px;user-select:all">'+rc+'</div><div class="lk-links"><button data-l="rcdone">'+T('نوشتم، ادامه','I saved it — continue')+'</button></div>'}
function closeOv(){clearInterval(wt);if(ov){ov.remove();ov=null}if(!locked)hideApp(0)}
const rerender=()=>{try{if(page==='set')render()}catch(e){}};
async function link(l){
  if(l==='forgot'){mode='rec';msgT='';paint()}
  else if(l==='back'){show('enter')}
  else if(l==='cancel'){tmp='';if(locked)show('enter');else closeOv()}
  else if(l==='rcdone'){closeOv();say(T('قفل روشن شد ✓','Lock is on ✓'));rerender()}
  else if(l==='recok'){const v=(ov.querySelector('#lkrc').value||'').toUpperCase().replace(/[^A-Z0-9]/g,''),c=cfg();
    if(!c||!c.rc||!v)return;if(same(await hashPin(v,ub64(c.rc.s)),c.rc.h)){okReset();setupLen=c.n||4;unlockForReset()}else{fail();const m=ov.querySelector('#lkm');if(m)m.textContent=T('کد بازیابی نادرست است','Wrong recovery code')}}
  else if(l==='wipe'){if(!confirm(T('همه‌ی داده‌های DANI روی این دستگاه برای همیشه پاک می‌شود (فعالیت‌ها، ثبت‌ها، تنظیمات). ادامه می‌دهی؟','ALL DANI data on this device will be erased forever (activities, entries, settings). Continue?')))return;
    if(!confirm(T('مطمئنی؟ این کار برگشت ندارد؛ اگر پشتیبان یا فایل همگام‌سازی داری، بعداً می‌توانی از آن بازگردانی.','Are you sure? This cannot be undone; if you have a backup or sync file you can restore from it later.')))return;
    try{localStorage.clear();sessionStorage.clear();indexedDB.deleteDatabase('dani_autobk')}catch(e){}location.reload()}}
/* بعد از بازیابی: PIN تازه تعیین کن (کد بازیابی همان می‌ماند) */
function unlockForReset(){locked=true;mode='newpin';buf='';tmp='';msgT=T('کد درست بود. یک PIN تازه بساز','Code accepted. Create a new PIN');paint()}
/* پیش از پایان newpin2 در حالت قفل‌بودن، برنامه باید باز شود */
const _submit=submit;submit=async function(p){const wasLocked=locked;await _submit(p);if(wasLocked&&!ov&&locked)unlock();else if(wasLocked&&!ov&&!locked)return};

/* ---------- چرخه‌ی عمر ---------- */
document.addEventListener('visibilitychange',()=>{const c=cfg();if(!c)return;
  if(document.hidden){hiddenAt=Date.now();if(!locked){if((c.after||0)===0)lockNow(true);else{build();ov.className='cover';mode='enter';buf='';paint();ov.className='cover'}}}
  else{const away=Date.now()-hiddenAt;if(locked){if(ov&&ov.className==='cover')show('enter')}
    else if((c.after||0)>0&&away>=c.after*60000){lockNow()}else if(ov&&ov.className==='cover'){closeOv()}}});
/* پس از رفتن به پس‌زمینه با «فوری»، قفل کامل است؛ هنگام برگشت صفحه‌ی PIN دیده شود */
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&locked&&ov&&ov.className==='cover')show('enter')});
document.addEventListener('keydown',e=>{if(!ov||ov.className==='cover')return;if(mode==='rec')return;if(/^\d$/.test(e.key))key(e.key);else if(e.key==='Backspace')key('⌫')});

/* ---------- کارت تنظیمات ---------- */
const AFT=[[0,'فوری','Immediately'],[1,'۱ دقیقه','1 min'],[5,'۵ دقیقه','5 min'],[15,'۱۵ دقیقه','15 min']];
H.lk_set=e=>{if(!SUB())return say(T('این مرورگر رمزنگاری را پشتیبانی نمی‌کند','This browser has no crypto support'),1);setupLen=+e.dataset.n||4;setupAfter=0;tmp='';locked=false;show('setup',T('PIN را به خاطر بسپار؛ بعد از آن یک کد بازیابی می‌گیری','Remember the PIN; you will then get a recovery code'))};
H.lk_chg=()=>{show('verify')};H.lk_off=()=>{show('off')};H.lk_now=()=>{lockNow()};
H.lk_len=e=>{setupLen=+e.dataset.n};
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset)return;
  if(t.dataset.lka!==undefined){const c=cfg();if(c){c.after=+t.value||0;saveCfg(c)}}});
H.lk_pw=async()=>{if(!SUB())return say(T('این مرورگر رمزنگاری را پشتیبانی نمی‌کند','This browser has no crypto support'),1);
  const p=await ask(T('رمز همگام‌سازی','Sync password'),T('این رمز فایل همگام‌سازی را رمزگذاری می‌کند. روی دستگاه دوم هم باید همین رمز را بزنی. اگر گم شود، فایل همگام‌سازی باز نمی‌شود (داده‌ی خود برنامه سالم می‌ماند).','This password encrypts the sync file. Enter the same one on your second device. If it is lost, the sync file cannot be opened (the app’s own data stays safe).'),true);
  if(!p)return;await setPw(p);say(T('رمز همگام‌سازی ذخیره شد؛ از همگام‌سازی بعدی فایل رمزگذاری می‌شود','Sync password saved; the file is encrypted from the next sync'));try{window.daniLiveSync&&window.daniLiveSync.doSync&&window.daniLiveSync.doSync(true)}catch(x){}render()};
H.lk_pwoff=async()=>{if(!confirm(T('رمزگذاری فایل همگام‌سازی خاموش شود؟ از همگام‌سازی بعدی فایل بدون رمز نوشته می‌شود.','Turn off sync-file encryption? From the next sync the file is written unencrypted.')))return;await setPw('');render()};
H.lk_mke=async()=>{const L=window.daniLiveSync;if(!L||!L.payload)return;let pw=gl(PW_K);let tmpPw=false;if(!pw){pw=await ask(T('رمز فایل','File password'),'',true);if(!pw)return;tmpPw=true;sl(PW_K,pw);sl(SALT_K,b64(rnd(16)));keyCache.clear()}
  try{const t=await enc(L.payload());dl('dani-sync-'+todayISO()+'-enc.json','application/json',t)}catch(e){say(String(e&&e.message||e),1)}finally{if(tmpPw){sl(PW_K,'');sl(SALT_K,'');keyCache.clear()}}};
function card(){const c=cfg(),has=!!c;
  let h='<div class="c" id="lkcard">'+daniH('🔒','قفل برنامه و رمزگذاری همگام‌سازی','App lock & encrypted sync');
  h+='<p class="m">'+T('قفل PIN جلوی چشم دیگران را می‌گیرد (هنگام باز شدن و بعد از رفتن به پس‌زمینه). PIN فقط روی همین دستگاه می‌ماند؛ اعلان‌ها و زنگ‌ها مثل قبل کار می‌کنند.','The PIN lock keeps prying eyes out (on open and after the app was in the background). The PIN stays on this device only; notifications and alarms work as before.')+'</p>';
  if(has){h+='<div class="m">✅ '+T('قفل روشن است ('+fd(c.n)+' رقم)','Lock is on ('+c.n+' digits)')+'</div>'
    +'<div class="row" style="margin-top:6px"><span class="m">'+T('قفل شدن بعد از پس‌زمینه:','Lock after background:')+'</span><select data-lka>'+AFT.map(a=>'<option value="'+a[0]+'" '+((c.after||0)===a[0]?'selected':'')+'>'+T(a[1],a[2])+'</option>').join('')+'</select></div>'
    +'<div class="row" style="margin-top:6px"><button class="p" data-a="lk_now">🔒 '+T('همین حالا قفل کن','Lock now')+'</button><button class="chip" data-a="lk_chg">'+T('عوض‌کردن PIN','Change PIN')+'</button><button class="chip" data-a="lk_off">'+T('خاموش‌کردن قفل','Turn off lock')+'</button></div>'}
  else h+='<div class="row"><span class="m">'+T('ساختن PIN:','Create PIN:')+'</span><button class="p" data-a="lk_set" data-n="4">'+T('۴ رقمی','4 digits')+'</button><button class="chip" data-a="lk_set" data-n="6">'+T('۶ رقمی','6 digits')+'</button></div>';
  h+='<div class="m" style="margin-top:12px"><b>'+T('رمزگذاری فایل همگام‌سازی','Encrypt the sync file')+'</b></div><p class="m">'+T('فایلی که در Drive/Dropbox می‌گذاری با رمز خودت (AES-256) رمزگذاری می‌شود تا کسی که به آن پوشه دسترسی دارد نتواند بخواندش. روی هر دو دستگاه همین رمز را وارد کن.','The file you keep in Drive/Dropbox is encrypted with your own password (AES-256) so anyone with access to that folder cannot read it. Enter the same password on both devices.')+'</p>';
  h+=on()?'<div class="m">✅ '+T('رمزگذاری روشن است','Encryption is on')+'</div><div class="row"><button class="chip" data-a="lk_pw">'+T('عوض‌کردن رمز','Change password')+'</button><button class="chip" data-a="lk_pwoff">'+T('خاموش‌کردن','Turn off')+'</button><button class="chip" data-a="lk_mke">⬇ '+T('ساخت فایل رمزگذاری‌شده','Make encrypted file')+'</button></div>'
    :'<div class="row"><button class="p" data-a="lk_pw">🔑 '+T('تعیین رمز همگام‌سازی','Set sync password')+'</button><button class="chip" data-a="lk_mke">⬇ '+T('ساخت فایل رمزگذاری‌شده (یک‌بار)','Make encrypted file (one-off)')+'</button></div>';
  return h+'</div>'}
{const _sp=setPage;setPage=function(){const h=_sp.apply(this,arguments);return(typeof h==='string'&&typeof stt!=='undefined'&&stt==='data')?h+card():h}}
window.daniLock={on:()=>!!cfg(),lock:lockNow};
window.__daniLockReady=1;
/* ---------- شروع ---------- */
if(cfg()){locked=true;hideApp(1);build();show('enter')}
})();
