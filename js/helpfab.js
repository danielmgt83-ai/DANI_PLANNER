"use strict";
/* DANI · helpfab.js — دستگیره‌ی کوچکِ «راهنما و پشتیبانی» کنار لبه‌ی صفحه (؟). کم‌جا، همه‌جا در دسترس، قابل‌پنهان‌کردن (تنظیمات ← تب «زمان»).
   داده: db.set.hf {off,seen}. باز می‌کند: راهنما (daniOnboard.hub)، جست‌وجوی همه‌چیز (daniQuickAccess.open)، شروع دوباره‌ی راهنما، گزارش خطا. */
(function(){
const T=window.daniT;
const HF=()=>{const s=db.set;if(!s.hf||typeof s.hf!=='object')s.hf={};return s.hf};
const css=document.createElement('style');
css.textContent='#hfab{position:fixed;z-index:44;width:46px;height:46px;border-radius:50%;padding:0;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;display:flex;align-items:center;justify-content:center;color:#fff;border:2px solid #fff;background:linear-gradient(135deg,#f43f5e,#a855f7);box-shadow:0 0 0 2px rgba(0,0,0,.6),0 6px 18px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.4);transition:transform .15s,box-shadow .2s}#hfab[data-tone=light]{background:linear-gradient(135deg,#4338ca,#7e22ce)}#hfab:active{cursor:grabbing;transform:scale(.94)}#hfab svg{width:24px;height:24px;stroke:#fff;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 1px 1px rgba(0,0,0,.5))}#hfab .sp{position:absolute;top:-5px;inset-inline-end:-4px;font-size:13px;line-height:1;color:#fff;text-shadow:0 0 4px #000,0 0 2px #000}#hfab .sd{position:absolute;bottom:-2px;inset-inline-start:-2px;width:13px;height:13px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.6)}#hfab .sd.ok{background:#22c55e}#hfab .sd.err{background:#ef4444}#hfab i{position:absolute;inset:-6px;border-radius:50%;border:2px solid #ff5b7a;animation:hfp 1.8s infinite;pointer-events:none}@keyframes hfp{0%{transform:scale(.85);opacity:.9}100%{transform:scale(1.25);opacity:0}}@media print{#hfab{display:none}}';
document.head.appendChild(css);
function tone(b){let dark=true;
  try{const S=(typeof SKINS!=='undefined'&&typeof skId==='function')?SKINS[skId()]:null;
    if(S&&typeof S.dark==='boolean')dark=S.dark;
    else{const m=(getComputedStyle(document.body).backgroundColor||'').match(/\d+(\.\d+)?/g);if(m&&m.length>=3&&(m.length<4||+m[3]>0.5))dark=(0.2126*m[0]+0.7152*m[1]+0.0722*m[2])<140}}catch(e){}
  b.dataset.tone=dark?'dark':'light'}
function place(b){const p=HF().pos||{s:'r',y:(innerHeight-148)/innerHeight};b.style.top=Math.max(8,Math.min(innerHeight-58,p.y*innerHeight))+'px';
  if(p.s==='l'){b.style.left='6px';b.style.right='auto'}else{b.style.right='6px';b.style.left='auto'}}
function drag(b){let sx=0,sy=0,ox=0,oy=0,on=false,mv=false;
  b.addEventListener('pointerdown',e=>{on=true;mv=false;sx=e.clientX;sy=e.clientY;const r=b.getBoundingClientRect();ox=r.left;oy=r.top;try{b.setPointerCapture(e.pointerId)}catch(x){}});
  b.addEventListener('pointermove',e=>{if(!on)return;const dx=e.clientX-sx,dy=e.clientY-sy;if(!mv&&Math.hypot(dx,dy)<7)return;mv=true;
    b.style.left=Math.max(0,Math.min(innerWidth-46,ox+dx))+'px';b.style.right='auto';b.style.top=Math.max(0,Math.min(innerHeight-46,oy+dy))+'px'});
  const end=()=>{if(!on)return;on=false;if(!mv)return;const r=b.getBoundingClientRect();HF().pos={s:(r.left+23<innerWidth/2)?'l':'r',y:r.top/innerHeight};save();place(b);setTimeout(()=>{mv=false},50)};
  b.addEventListener('pointerup',end);b.addEventListener('pointercancel',end);
  b.addEventListener('click',e=>{if(mv){e.stopImmediatePropagation();e.preventDefault();mv=false}},true)}
function fab(){let b=document.getElementById('hfab');
  if(HF().off){if(b)b.remove();return}
  if(!b){b=document.createElement('button');b.id='hfab';b.type='button';b.setAttribute('data-a','hf_open');b.setAttribute('data-nobi','1');document.body.appendChild(b);drag(b)}
  place(b);tone(b);b.setAttribute('aria-label',T('راهنما و پشتیبانی','Help & support'));b.title=T('راهنما و پشتیبانی (برای جابه‌جایی بکش)','Help & support (drag to move)');
  b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1.1.9-1.1 1.7"/><path d="M12 17h.01"/></svg><span class="sp" aria-hidden="true">✦</span>'+(HF().seen?'':'<i></i>')+(window.daniSyncState?'<span class="sd '+window.daniSyncState+'"></span>':'')}
function sheet(){
  const it=(a,ic,fa,en,sub)=>'<button class="chip" data-a="'+a+'" style="display:flex;width:100%;text-align:start;gap:10px;align-items:center;margin:6px 0;padding:10px 12px"><span aria-hidden="true" style="font-size:20px">'+ic+'</span><span style="flex:1"><b>'+T(fa,en)+'</b><br><span class="m">'+T(sub[0],sub[1])+'</span></span></button>';
  return '<div style="max-width:420px">'+daniH('✦','راهنما و پشتیبانی','Help & support')
   +it('hf_guide','🧭','راهنمای شروع و ویژگی‌ها','Guide & features',['تور برنامه، ساخت پروژه، نمونه‌ی هر ویژگی','App tour, project builder, a try-it for each feature'])
   +it('hf_find','🔎','جست‌وجوی همه‌چیز','Search everything',['ویژگی‌ها، تنظیمات و داده‌های خودت','Features, settings and your own data'])
   +it('hf_again','🔁','شروع دوباره‌ی راهنما','Restart the tour',['داده‌هایت پاک نمی‌شود','Your data is not deleted'])
   +it('hf_err','🐞','گزارش مشکل','Report a problem',['متن خطاها را کپی کن تا بفرستی','Copy the error log to send'])
   +'<div class="row" style="margin-top:8px"><button class="chip" data-a="hf_pos">'+T('بازگرداندن جا','Reset position')+'</button><button class="chip" data-a="hf_hide">'+T('پنهان‌کردن این دکمه','Hide this button')+'</button><button class="chip" data-a="ob_close">'+T('بستن','Close')+'</button></div>'
   +'<p class="m">'+T('برگرداندن دکمه: تنظیمات ← زمان ← «دکمه‌ی راهنما».','To bring it back: Settings → Time → “Help button”.')+'</p></div>'}
H.hf_open=()=>{HF().seen=1;save();fab();modal(sheet())};
H.hf_guide=()=>{try{closeM()}catch(e){}setTimeout(()=>window.daniOnboard&&window.daniOnboard.hub(),50)};
H.hf_find=()=>{try{closeM()}catch(e){}setTimeout(()=>window.daniQuickAccess&&window.daniQuickAccess.open(),50)};
H.hf_again=()=>{try{closeM()}catch(e){}setTimeout(()=>H.ob_reset&&H.ob_reset(),50)};
H.hf_err=async()=>{let t='';try{t=window.daniErrText?window.daniErrText():''}catch(e){}
  if(!t)return toast(T('خطایی ثبت نشده 👌','No errors recorded 👌'));
  try{await navigator.clipboard.writeText(t);toast(T('کپی شد؛ برای پشتیبان بفرست','Copied — send it to support'))}catch(e){modal('<div>'+daniH('🐞','گزارش خطا','Error log')+'<textarea style="width:100%;height:200px" readonly>'+esc(t)+'</textarea></div>')}};
H.hf_pos=()=>{delete HF().pos;save();fab();toast(T('به جای اول برگشت','Position reset'))};
H.hf_hide=()=>{HF().off=1;save();try{closeM()}catch(e){}fab();toast(T('پنهان شد','Hidden'))};
H.hf_show=()=>{HF().off=0;save();fab();render()};
{const _sp=setPage;setPage=function(){const h=_sp.apply(this,arguments);
  return(typeof h==='string'&&typeof stt!=='undefined'&&stt==='time')?h+'<div class="c" id="hfcard">'+daniH('✦','دکمه‌ی راهنما','Help button')+'<div class="row"><button class="chip '+(HF().off?'':'on')+'" data-a="'+(HF().off?'hf_show':'hf_hide')+'">'+(HF().off?T('نمایش دکمه‌ی راهنما','Show help button'):T('دکمه‌ی راهنما نمایش داده می‌شود','Help button is shown'))+'</button></div></div>':h}}
/* تب «زمان» در تنظیمات: کارت‌های صدا، همگام‌سازی/ویجت و دکمه‌ی راهنما در یک کارت جمع‌شونده «ابزارهای دستگاه» */
function pack(){if(page!=='set'||typeof stt==='undefined'||stt!=='time')return;const pg=document.getElementById('pg');if(!pg)return;
  const grp=(id,ico,fa,en,sub,list,flag)=>{if(pg.querySelector('#'+id))return;const ids=list.map(i=>pg.querySelector('#'+i)).filter(Boolean);if(ids.length<2)return;
    const d=document.createElement('details');d.id=id;d.className='c';if(HF()[flag])d.open=true;
    d.innerHTML='<summary style="cursor:pointer;list-style:none">'+daniH(ico,fa,en)+'<span class="m">'+T(sub[0],sub[1])+'</span></summary>';
    ids[0].before(d);ids.forEach(c=>d.appendChild(c));d.addEventListener('toggle',()=>{HF()[flag]=d.open?1:0;try{save()}catch(e){}})};
  grp('ntgrp','🔔','اعلان‌ها و صدا','Notifications & sounds',['اجازه‌ها، زنگ آزمایشی، صدای هر دسته','Permissions, test alarm, per-category sounds'],['ntcard','sccard'],'dv1');
  grp('devcard','🧰','همگام‌سازی، ویجت و راهنما','Sync, widget & help',['فایل همگام‌سازی، تایمر زنده، ویجت، دکمه‌ی راهنما','Sync file, live timer, widget, help button'],['lscard','hfcard'],'dv')}
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{pack()}catch(e){console.error('pack',e)}return r}}
if(document.body)fab();else document.addEventListener('DOMContentLoaded',fab);
setTimeout(fab,1500);document.addEventListener('dani-sync',()=>{try{fab()}catch(e){}});{const _r=render;render=function(){const r=_r.apply(this,arguments);try{const b=document.getElementById('hfab');if(b)tone(b)}catch(e){}return r}}
})();
