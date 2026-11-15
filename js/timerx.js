"use strict";
/* DANI · timerx.js — تایمر واحد: نوار کوچک روی همه‌ی صفحه‌ها + صفحه‌ی تمرکز تمام‌صفحه با دو ظاهر (حلقه‌ای / آرام).
   هیچ تایمر جدیدی نیست؛ روی همان db.timer و پومودورو (db.set.pomo) سوار است و جای حالت تمرکز قدیمیِ pomodoro.js را می‌گیرد.
   پس‌زمینه: عکس تم فعال (--hero) / عکس خودت / ساده. داده: db.set.tx = {look,bg,dim,photo}. بعد از pomodoro.js و dock.js بارگذاری شود. */
(function(){
const T=window.daniT;
const TX=()=>{const s=db.set;if(!s.tx||typeof s.tx!=='object')s.tx={};const x=s.tx;if(x.look!=='calm')x.look='ring';if(!['theme','photo','plain'].includes(x.bg))x.bg='theme';if(typeof x.dim!=='number')x.dim=.5;x.dim=Math.min(.85,Math.max(.1,x.dim));return x};
const PM=()=>(db.set.pomo||{});
const on=()=>['running','paused','ended'].includes((db.timer||{}).state);
const brk=()=>{const p=PM();return(p.ph==='break'||p.ph==='long')&&p.until>0};
const active=()=>on()||brk();
const mmss=ms=>{ms=Math.max(0,Math.ceil(ms/1000));const h=Math.floor(ms/3600),m=Math.floor(ms%3600/60),s=ms%60;return(h?pad(h)+':':'')+pad(m)+':'+pad(s)};
function info(){const t=db.timer||{},p=PM();
 if(brk()){const tot=(p.ph==='long'?p.l:p.b)*60000,left=p.until-Date.now();return{kind:'brk',txt:mmss(left),frac:1-Math.max(0,left)/tot,lbl:p.ph==='long'?T('استراحت بلند','Long break'):T('استراحت','Break'),run:true}}
 if(!on())return null;
 const e=t.state==='running'?t.acc+Math.max(0,Date.now()-t.t0):t.acc,cd=t.mode==='cd';
 const left=cd?Math.max(0,t.dur-e):0;
 return{kind:cd?'cd':'sw',txt:cd?mmss(left):mmss(e),frac:cd?Math.min(1,e/t.dur):(e%3600000)/3600000,lbl:t.state==='paused'?T('مکث','Paused'):t.state==='ended'?T('تمام شد','Finished'):(p.ph==='work'?T('تمرکز','Focus'):T('در حال اجرا','Running')),run:t.state==='running',st:t.state}}
const say=m=>{try{toast(m,1)}catch(e){}};
/* ---------- پس‌زمینه ---------- */
function themeImg(){try{const k=skId(),u=imgUrl(k,skImgSel(k));if(u)return'url("'+u+'")'}catch(e){}
 try{const c=getComputedStyle(document.documentElement).getPropertyValue('--hero').trim();if(c&&c!=='none')return c;const sk=document.documentElement.dataset.skin||'';if(IMC[sk])return IMC[sk];
  for(const e of document.querySelectorAll('#hero,#pg *,main *')){if(e.closest('#tx-foc'))continue;const b=getComputedStyle(e).backgroundImage,m=b&&b.match(/url\([^)]+\)/);if(m&&!/\.svg|data:image\/svg/.test(m[0]))return IMC[sk]=m[0]}}catch(e){}return'none'}
const IMC={};
function bgCss(){const x=TX();
 if(x.bg==='photo'&&x.photo)return'background:linear-gradient(rgba(0,0,0,'+x.dim+'),rgba(0,0,0,'+x.dim+')),url("'+x.photo+'") center/cover';
 if(x.bg==='theme')return'background:linear-gradient(rgba(0,0,0,'+x.dim+'),rgba(0,0,0,'+x.dim+')),'+themeImg()+' center/cover,linear-gradient(160deg,var(--ac,#2563eb),var(--bg,#0b1020))';
 return'background:linear-gradient(160deg,color-mix(in srgb,var(--ac,#2563eb) 55%,#000),#05070d)'}
/* ---------- صفحه‌ی تمرکز ---------- */
let open=false,wl=null,lastKey='';
async function wake(v){try{if(v&&!wl&&navigator.wakeLock){wl=await navigator.wakeLock.request('screen');wl.addEventListener('release',()=>{wl=null})}else if(!v&&wl){const w=wl;wl=null;await w.release()}}catch(e){wl=null}}
const key=()=>{const t=db.timer||{},p=PM(),x=TX();return[t.state,t.mode,t.actId,p.ph,p.dn,x.look,x.bg,x.dim,!!x.photo,document.documentElement.dataset.skin].join('|')};
function ring(f){const R=44,C=2*Math.PI*R;return'<svg viewBox="0 0 110 110" class="txr"><circle cx="55" cy="55" r="'+R+'" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="5"/><circle id="tx-arc" cx="55" cy="55" r="'+R+'" fill="none" stroke="var(--ac,#7be0ff)" stroke-width="5" stroke-linecap="round" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+(C*(1-f)).toFixed(1)+'" data-c="'+C.toFixed(1)+'" transform="rotate(-90 55 55)"/></svg>'}
function draw(){let o=document.getElementById('tx-foc');if(!open){if(o)o.remove();wake(false);return}
 const i=info();if(!i){open=false;return draw()}
 const x=TX(),t=db.timer||{},p=PM(),a=on()?aN(t.actId):(p.a&&act(p.a)?aN(p.a):'');
 if(!o){o=document.createElement('div');o.id='tx-foc';o.setAttribute('role','dialog');o.setAttribute('aria-label',T('حالت تمرکز','Focus mode'));o.setAttribute('data-nobi','');document.body.appendChild(o)}
 o.style.cssText=bgCss();o.className='txf '+x.look;
 let btn='';
 if(brk())btn='<button data-a="pm_skip">'+T('رد کردن استراحت','Skip break')+'</button>';
 else if(t.state==='running')btn='<button class="txb" data-a="tx_pause" aria-label="pause">❚❚</button>';
 else if(t.state==='paused')btn='<button class="txb" data-a="tx_res" aria-label="resume">▶</button>';
 const fin=on()?'<button data-a="tx_fin">⏹ '+T('پایان و ثبت','Finish & log')+'</button>':'';
 const body=x.look==='calm'
  ?'<div class="txg"><div id="tx-d" class="txd">'+i.txt+'</div></div>'
  :'<div class="txw">'+ring(i.frac)+'<div class="txc"><div id="tx-d" class="txd">'+i.txt+'</div><div class="txs">'+esc(i.lbl)+'</div></div></div>';
 o.innerHTML='<button class="txx" data-a="tx_close" aria-label="close">✕</button>'
  +(a?'<div class="txt">'+esc(a)+(p.ph==='work'?' · 🍅'+fa(p.dn):'')+'</div>':'')+body
  +(x.look==='calm'?'<div class="txs">'+esc(i.lbl)+'</div>':'')
  +'<div class="txrow">'+btn+fin+'</div>'
  +(on()?'<input class="txn" id="tx-note" placeholder="'+T('یادداشت جلسه…','Session note…')+'" value="'+esc(t.note||'')+'">':'')
  +'<details class="txo"><summary>⚙ '+T('ظاهر','Look')+'</summary><div class="row"><button class="chip '+(x.look==='ring'?'on':'')+'" data-a="tx_set" data-k="look" data-v="ring">◯ '+T('حلقه‌ای','Ring')+'</button><button class="chip '+(x.look==='calm'?'on':'')+'" data-a="tx_set" data-k="look" data-v="calm">✦ '+T('آرام','Calm')+'</button></div>'
  +'<div class="row"><button class="chip '+(x.bg==='theme'?'on':'')+'" data-a="tx_set" data-k="bg" data-v="theme">🎨 '+T('عکس تم','Theme image')+'</button><button class="chip '+(x.bg==='photo'?'on':'')+'" data-a="tx_photo">🖼 '+T('عکس خودم','My photo')+'</button><button class="chip '+(x.bg==='plain'?'on':'')+'" data-a="tx_set" data-k="bg" data-v="plain">▮ '+T('ساده','Plain')+'</button></div>'
  +'<div class="row"><span>'+T('تیرگی','Dim')+'</span><button class="chip" data-a="tx_dim" data-v="-1">−</button><b>'+fa(Math.round(x.dim*100))+'٪</b><button class="chip" data-a="tx_dim" data-v="1">＋</button></div></details>';
 wake(true);lastKey=key()}
function tick(){const i=info();
 if(open&&!i){open=false;draw();bar();return}
 if(open){if(key()!==lastKey)draw();else{const d=document.getElementById('tx-d');if(d&&i){d.textContent=i.txt;const a=document.getElementById('tx-arc');if(a){const C=+a.dataset.c;a.setAttribute('stroke-dashoffset',(C*(1-i.frac)).toFixed(1))}}}}
 bar()}
setInterval(tick,500);
/* ---------- نوار کوچک ---------- */
function bar(){let b=document.getElementById('txbar');const i=info();
 if(!i||open){if(b)b.remove();return}
 const t=db.timer||{},nm=on()?aN(t.actId):'';
 const h='<button class="txbo" data-a="tx_open"><span id="txbd" class="txbt">'+i.txt+'</span><small>'+esc(nm||i.lbl)+(nm&&t.state==='paused'?' · '+T('مکث','paused'):'')+'</small></button>'+(on()&&t.state==='running'?'<button class="txbp" data-a="tx_pause" aria-label="pause">❚❚</button>':on()&&t.state==='paused'?'<button class="txbp" data-a="tx_res" aria-label="resume">▶</button>':'');
 if(!b){b=document.createElement('div');b.id='txbar';b.setAttribute('data-nobi','');document.body.appendChild(b)}
 b.style.bottom=document.getElementById('dkbar')?'74px':'12px';
 if(b.dataset.h!==h){b.dataset.h=h;b.innerHTML=h}else{const d=document.getElementById('txbd');if(d)d.textContent=i.txt}}
/* ---------- رویدادها ---------- */
H.tx_open=()=>{if(!active())return;open=true;draw();bar()};
H.tx_close=()=>{open=false;draw();bar()};
H.tx_pause=()=>{TM.pause();render();tick()};H.tx_res=()=>{TM.resume();render();tick()};
H.tx_fin=()=>{const p=PM();if(p.ph==='work'&&window.H.pm_fin)H.pm_fin();else TM.finish();render();tick()};
H.tx_set=e=>{const x=TX();x[e.dataset.k]=e.dataset.v;save();draw()};
H.tx_dim=e=>{const x=TX();x.dim=Math.round((x.dim+(+e.dataset.v)*.1)*10)/10;save();draw()};
H.tx_photo=()=>{const f=document.createElement('input');f.type='file';f.accept='image/*';f.onchange=()=>{const file=f.files&&f.files[0];if(!file)return;const im=new Image(),u=URL.createObjectURL(file);
 im.onload=()=>{try{const s=Math.min(1,900/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);const x=TX();x.photo=c.toDataURL('image/jpeg',.7);x.bg='photo';save();draw()}catch(e){say(T('عکس خوانده نشد','Could not read the photo'))}URL.revokeObjectURL(u)};im.onerror=()=>say(T('عکس خوانده نشد','Could not read the photo'));im.src=u};f.click()};
/* حالت تمرکز قدیمی همین صفحه می‌شود */
H.pm_foc1=()=>{if(!active()){const p=PM();if(window.daniPomoStart&&p.a&&act(p.a)){}else return say(T('اول یک تایمر یا پومودورو شروع کن','Start a timer or Pomodoro first'))}H.tx_open()};
H.pm_foc0=()=>H.tx_close();
document.addEventListener('input',e=>{if(e.target&&e.target.id==='tx-note'&&db.timer){db.timer.note=e.target.value;save()}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&open)wake(true)});
/* دکمه‌ی ورود به تمرکز کنار کارت «ثبت فعالیت» */
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{const c=document.getElementById('dytr');if(c&&on()&&!document.getElementById('txopen')){const w=c.querySelector('[data-a="dy_tf"]');if(w&&w.parentNode){const b=document.createElement('button');b.id='txopen';b.className='chip';b.setAttribute('data-a','tx_open');b.textContent='🖥 '+T('تمرکز','Focus');w.parentNode.appendChild(b)}}{const sk=document.documentElement.dataset.skin||'';if(page==='home'&&!IMC[sk]&&!IMC['_'+sk]){IMC['_'+sk]=1;setTimeout(themeImg,600)}}tick()}catch(e){console.error('timerx',e)}return r}}
const st=document.createElement('style');st.textContent='#txbar{position:fixed;left:50%;transform:translateX(-50%);z-index:44;display:flex;align-items:center;gap:6px;padding:4px 6px 4px 12px;border-radius:999px;background:var(--c,#fff);color:var(--t,inherit);border:1px solid var(--b,#8886);box-shadow:0 4px 18px #0004;max-width:calc(100vw - 16px)}#txbar button{border:0;background:none;color:inherit;font:inherit;cursor:pointer}#txbar .txbo{display:flex;align-items:center;gap:8px}#txbar .txbt{font-weight:700;font-variant-numeric:tabular-nums}#txbar small{opacity:.75;max-width:34vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#txbar .txbp{width:32px;height:32px;border-radius:50%;background:var(--ac,#2563eb);color:#fff}'
+'.txf{position:fixed;inset:0;z-index:99999;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;padding:20px;overflow:auto}.txf .txx{position:absolute;top:14px;inset-inline-end:14px;width:40px;height:40px;border-radius:50%;border:0;background:#ffffff26;color:#fff;font-size:18px}.txf .txt{background:#0005;padding:5px 14px;border-radius:20px;backdrop-filter:blur(8px)}'
+'.txf .txw{position:relative;width:min(68vw,300px);aspect-ratio:1;border-radius:50%;background:#ffffff18;backdrop-filter:blur(14px)}.txf .txr{position:absolute;inset:0;width:100%;height:100%}.txf .txc{position:absolute;inset:0;display:grid;place-content:center;gap:2px}'
+'.txf .txd{font-size:min(15vw,64px);font-weight:700;font-variant-numeric:tabular-nums;line-height:1.1}.txf.calm .txd{font-size:min(20vw,92px);font-weight:300}.txf .txs{opacity:.75;font-size:.95em}'
+'.txf .txg{width:min(66vw,280px);aspect-ratio:1;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle,color-mix(in srgb,var(--ac,#8a5cff) 55%,transparent),transparent 70%);box-shadow:0 0 90px color-mix(in srgb,var(--ac,#8a5cff) 45%,transparent);animation:txb 5s ease-in-out infinite}@keyframes txb{50%{transform:scale(1.07);opacity:.85}}@media(prefers-reduced-motion:reduce){.txf .txg{animation:none}}'
+'.txf .txrow{display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap}.txf button:not(.txx):not(.chip){border:0;border-radius:999px;padding:10px 18px;background:#ffffff26;color:#fff;font:inherit;cursor:pointer}.txf .txb{width:68px;height:68px;padding:0;background:#fff!important;color:#111!important;font-size:24px}'
+'.txf .txn{width:min(86vw,340px);padding:9px 12px;border-radius:14px;border:1px solid #ffffff40;background:#0004;color:#fff;font:inherit}.txf .txo{width:min(92vw,360px);background:#0005;border-radius:14px;padding:8px 12px;backdrop-filter:blur(8px)}.txf .txo summary{cursor:pointer}.txf .txo .row{justify-content:center;margin-top:8px;gap:6px;flex-wrap:wrap}.txf .chip{color:#fff;background:#ffffff22;border-color:#ffffff40}.txf .chip.on{background:#fff;color:#111}';
document.head.appendChild(st);
setTimeout(tick,400);
})();
