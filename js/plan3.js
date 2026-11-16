/* v139 — برنامه (روز): جمع‌وجورکردن بدون حذف قابلیت.
   ۱) توضیح ستون‌های هفته و ۲) راهنمای نوشتن برنامه پشت دکمه‌ی ⓘ (همان متن، با یک لمس باز می‌شود)
   ۳) ردیف «اخیراً/پیشنهاد» یک ردیف قابل کشیدن  ۴) «چیدن/شروع/پاک‌کردن ساعت‌ها» یک ردیف (پاک‌کردن وقتی ساعتی نیست کم‌رنگ)
   ۵) کارت‌های بسته‌ی «تکرارشونده» و «قالب‌ها» باریک‌تر. فقط ظاهر؛ گره‌ها فقط پنهان/جابه‌جا می‌شوند. */
(function(){'use strict';
const T=window.daniT||function(a){return a};
const open={leg:0,ins:0,bz:0,lg:0,dx:0};
function ib(k){const b=document.createElement('button');b.type='button';b.className='chip p3i'+(open[k]?' on':'');b.dataset.a='p3_i';b.dataset.k=k;b.textContent='ⓘ';b.setAttribute('aria-label',T('راهنما','Help'));return b}
function tidy(){
 const nav=document.querySelector('#pg .p2nav');if(!nav)return;
 const pg=document.getElementById('pg');
 /* ۱ */
 pg.querySelectorAll('p.m').forEach(p=>{
  const t=p.textContent;
  if(!p.dataset.p3&&/ستون = حجم|Bar = planned/.test(t)){p.dataset.p3='leg';p.hidden=!open.leg;const ut=p.parentElement.querySelector(':scope>.ut');const b=ib('leg');b.style.float='inline-end';(ut||p).before(b)}
  else if(!p.dataset.p3&&/هر خط یک کار|One item per line/.test(t)){p.dataset.p3='ins';p.hidden=!open.ins;
   const add=p.parentElement.querySelector(':scope>.row>[data-a=tp_add]');
   if(add)add.parentElement.appendChild(ib('ins'));else p.before(ib('ins'))}
 });
 /* بلوک‌ها / تقویم: متن‌های توضیحی پشت ⓘ */
 const note=(p,k,anchor,fl)=>{if(p.dataset.p3)return;p.dataset.p3=k;p.hidden=!open[k];const b=ib(k);if(fl)b.style.float='inline-end';if(anchor)anchor.appendChild(b);else p.before(b)};
 pg.querySelectorAll('p.m').forEach(p=>{const t=p.textContent;
  if(/^ساعت‌هایی که سرگرمی|^Hours you are busy/.test(t.trim()))note(p,'bz',p.parentElement.querySelector('#cio-row'));
  else if(p.querySelector('.p2l')){const r=p.parentElement.querySelector(':scope>.row [data-a=p2_cm]');note(p,'lg',r&&r.parentElement)}
  else if(/^موعدها \(افزودن|^Deadlines \(add/.test(t.trim())){const r=p.parentElement.querySelector(':scope>.row');note(p,'dx',r);p.parentElement.classList.add('p3slim')}});
 /* ۴ کم‌رنگ */
 const clr=pg.querySelector('[data-a=tp_clr]');
 if(clr){const has=[...pg.querySelectorAll('input[data-tpt]')].some(i=>i.value);clr.classList.toggle('p3dim',!has)}
}
H.p3_i=e=>{const k=e.dataset.k;open[k]=open[k]?0:1;
 document.querySelectorAll('#pg [data-p3='+k+']').forEach(p=>p.hidden=!open[k]);
 document.querySelectorAll('#pg .p3i[data-k='+k+']').forEach(b=>b.classList.toggle('on',!!open[k]))};
const st=document.createElement('style');st.id='p3css';
st.textContent=
 '#pg .p3i{display:inline-block;margin:2px 0;padding:2px 9px;font-size:13px;line-height:1.4;flex:none}#pg [data-p3][hidden]{display:none}'
 +'.tpc .row:has(>[data-a=tp_rec]),.tpc .row:has(>[data-a=tp_sug]){flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}'
 +'.tpc .row:has(>[data-a=tp_rec])::-webkit-scrollbar,.tpc .row:has(>[data-a=tp_sug])::-webkit-scrollbar{display:none}'
 +'.tpc .row:has(>[data-a=tp_rec])>*,.tpc .row:has(>[data-a=tp_sug])>*{flex:none;white-space:nowrap}'
 +'.tpc .row:has(>[data-a=tp_arr]){flex-wrap:nowrap;gap:5px;align-items:center}'
 +'.tpc .row:has(>[data-a=tp_arr])>.chip{padding:6px 6px;font-size:11px;white-space:nowrap;flex:none}'
 +'.tpc .row:has(>[data-a=tp_arr])>label{white-space:nowrap;font-size:11px;display:flex;align-items:center;gap:3px;flex:none}'
 +'.tpc .row:has(>[data-a=tp_arr]) input[type=time]{width:66px;min-width:0;padding:3px 2px;font-size:11px}.tpc .row:has(>[data-a=tp_arr]) input[type=time]::-webkit-calendar-picker-indicator{display:none}'
 +'.p3dim{opacity:.5}'
 +'#cio-row{flex-wrap:nowrap;gap:5px;align-items:center}#cio-row>*{min-width:0;flex:0 1 auto;font-size:11px;padding:6px 7px;line-height:1.3}#cio-row>.p3i{flex:none;font-size:13px;padding:2px 9px}'
 +'.row:has(>label.chip>input.bz-w){flex-wrap:nowrap;gap:3px}.row:has(>label.chip>input.bz-w)>label.chip{flex:1;min-width:0;padding:6px 0;justify-content:center;gap:2px;display:flex;align-items:center}'
 +'.p2cal .p2c{min-height:0;height:48px;padding:3px 0}'
 +'.c.p3slim{padding:8px 14px}.c.p3slim>.row{margin:0;align-items:center}'
 +'body:has(#pg .p2nav) #pg>details.c:not([open]){padding:6px 14px}'
 +'body:has(#pg .p2nav) #pg>details.c>summary>*{margin-top:0;margin-bottom:0}';
document.head.appendChild(st);
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{tidy()}catch(e){console.error('plan3',e)}return r}}
})();
