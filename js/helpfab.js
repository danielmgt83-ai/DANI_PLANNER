"use strict";
/* DANI · helpfab.js — دستگیره‌ی کوچکِ «راهنما و پشتیبانی» کنار لبه‌ی صفحه (✦؟). کم‌جا، همه‌جا در دسترس، قابل‌پنهان‌کردن (تنظیمات ← تب «زمان»).
   داده: db.set.hf {off,seen}. باز می‌کند: راهنما (daniOnboard.hub)، جست‌وجوی همه‌چیز (daniQuickAccess.open)، شروع دوباره‌ی راهنما، گزارش خطا. */
(function(){
const T=window.daniT;
const HF=()=>{const s=db.set;if(!s.hf||typeof s.hf!=='object')s.hf={};return s.hf};
const css=document.createElement('style');
css.textContent='#hfab{position:fixed;left:0;top:62%;z-index:44;width:26px;height:46px;border:1px solid var(--bd,#8886);border-left:0;border-radius:0 23px 23px 0;background:var(--c,rgba(20,24,60,.72));color:var(--tx,#fff);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;font:700 15px/1 system-ui,sans-serif;opacity:.6;padding:0;cursor:pointer;transition:opacity .2s,width .2s}#hfab:hover,#hfab:focus{opacity:1;width:32px}#hfab i{position:absolute;top:6px;right:5px;width:7px;height:7px;border-radius:50%;background:#ff5b7a;animation:hfp 1.6s infinite}@keyframes hfp{50%{transform:scale(1.5);opacity:.5}}@media print{#hfab{display:none}}';
document.head.appendChild(css);
function fab(){let b=document.getElementById('hfab');
  if(HF().off){if(b)b.remove();return}
  if(!b){b=document.createElement('button');b.id='hfab';b.type='button';b.setAttribute('data-a','hf_open');b.setAttribute('data-nobi','1');document.body.appendChild(b)}
  b.setAttribute('aria-label',T('راهنما و پشتیبانی','Help & support'));b.title=T('راهنما و پشتیبانی','Help & support');
  b.innerHTML='✦?'+(HF().seen?'':'<i></i>')}
function sheet(){
  const it=(a,ic,fa,en,sub)=>'<button class="chip" data-a="'+a+'" style="display:flex;width:100%;text-align:start;gap:10px;align-items:center;margin:6px 0;padding:10px 12px"><span aria-hidden="true" style="font-size:20px">'+ic+'</span><span style="flex:1"><b>'+T(fa,en)+'</b><br><span class="m">'+T(sub[0],sub[1])+'</span></span></button>';
  return '<div style="max-width:420px">'+daniH('✦','راهنما و پشتیبانی','Help & support')
   +it('hf_guide','🧭','راهنمای شروع و ویژگی‌ها','Guide & features',['تور برنامه، ساخت پروژه، نمونه‌ی هر ویژگی','App tour, project builder, a try-it for each feature'])
   +it('hf_find','🔎','جست‌وجوی همه‌چیز','Search everything',['ویژگی‌ها، تنظیمات و داده‌های خودت','Features, settings and your own data'])
   +it('hf_again','🔁','شروع دوباره‌ی راهنما','Restart the tour',['داده‌هایت پاک نمی‌شود','Your data is not deleted'])
   +it('hf_err','🐞','گزارش مشکل','Report a problem',['متن خطاها را کپی کن تا بفرستی','Copy the error log to send'])
   +'<div class="row" style="margin-top:8px"><button class="chip" data-a="hf_hide">'+T('پنهان‌کردن این دکمه','Hide this button')+'</button><button class="chip" data-a="ob_close">'+T('بستن','Close')+'</button></div>'
   +'<p class="m">'+T('برگرداندن دکمه: تنظیمات ← زمان ← «دکمه‌ی راهنما».','To bring it back: Settings → Time → “Help button”.')+'</p></div>'}
H.hf_open=()=>{HF().seen=1;save();fab();modal(sheet())};
H.hf_guide=()=>{try{closeM()}catch(e){}setTimeout(()=>window.daniOnboard&&window.daniOnboard.hub(),50)};
H.hf_find=()=>{try{closeM()}catch(e){}setTimeout(()=>window.daniQuickAccess&&window.daniQuickAccess.open(),50)};
H.hf_again=()=>{try{closeM()}catch(e){}setTimeout(()=>H.ob_reset&&H.ob_reset(),50)};
H.hf_err=async()=>{let t='';try{t=window.daniErrText?window.daniErrText():''}catch(e){}
  if(!t)return toast(T('خطایی ثبت نشده 👌','No errors recorded 👌'));
  try{await navigator.clipboard.writeText(t);toast(T('کپی شد؛ برای پشتیبان بفرست','Copied — send it to support'))}catch(e){modal('<div>'+daniH('🐞','گزارش خطا','Error log')+'<textarea style="width:100%;height:200px" readonly>'+esc(t)+'</textarea></div>')}};
H.hf_hide=()=>{HF().off=1;save();try{closeM()}catch(e){}fab();toast(T('پنهان شد','Hidden'))};
H.hf_show=()=>{HF().off=0;save();fab();render()};
{const _sp=setPage;setPage=function(){const h=_sp.apply(this,arguments);
  return(typeof h==='string'&&typeof stt!=='undefined'&&stt==='time')?h+'<div class="c">'+daniH('✦','دکمه‌ی راهنما','Help button')+'<div class="row"><button class="chip '+(HF().off?'':'on')+'" data-a="'+(HF().off?'hf_show':'hf_hide')+'">'+(HF().off?T('نمایش دکمه‌ی راهنما','Show help button'):T('دکمه‌ی راهنما نمایش داده می‌شود','Help button is shown'))+'</button></div></div>':h}}
if(document.body)fab();else document.addEventListener('DOMContentLoaded',fab);
setTimeout(fab,1500);
})();
