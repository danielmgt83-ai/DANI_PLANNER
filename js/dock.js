"use strict";
/* DANI · dock.js — «نوار ابزار سریع» پایین صفحه، در همه‌ی تم‌ها و همه‌ی صفحه‌ها (جدید و کلاسیک).
   دکمه‌های کوچک پایین صفحه؛ هر کدام یک برگه‌ی پایین‌کشو باز می‌کند: ثبت ۵ ثانیه‌ای، شروع سریع، چرخه‌ی امروز، پومودورو، بعدی چی؟.
   انتخاب اینکه کدام‌ها باشند: ⚙ داخل خود برگه یا تنظیمات ← ظاهر. داده: db.set.dk ({on,list}). */
(function(){
const T=(fa,en)=>{try{return LANGEN()?en:fa}catch(e){return fa}};
const ITEMS={
 ql:{i:'⚡',n:['ثبت ۵ ثانیه‌ای','5-sec log'],r:()=>window.daniQuickLog?window.daniQuickLog():''},
 qk:{i:'▶',n:['شروع سریع','Quick start'],r:()=>window.daniQuickBar?window.daniQuickBar():''},
 rh:{i:'🔄',n:['چرخه‌ی امروز','Today\'s rhythm'],r:()=>window.daniRhythmCard?window.daniRhythmCard():''},
 pm:{i:'🍅',n:['پومودورو','Pomodoro'],r:()=>window.daniPomoCard?window.daniPomoCard():''},
 nx:{i:'🎯',n:['بعدی چی؟','What next?'],r:()=>{try{return HSEC.nx.r()}catch(e){return''}}}};
const DK=()=>{const s=db.set;if(!s.dk||typeof s.dk!=='object')s.dk={on:0,v:2,list:['ql','qk','rh']};if(s.dk.v!==2){s.dk.v=2;s.dk.on=0}if(!Array.isArray(s.dk.list))s.dk.list=['ql','qk','rh'];return s.dk};
let cur='',cfg=0;
const nm=k=>T(ITEMS[k].n[0],ITEMS[k].n[1]);
function bar(){const d=DK(),el=document.getElementById('dkbar');
  if(!d.on||!d.list.some(k=>ITEMS[k])){if(el)el.remove();sheet();return}
  const h=d.list.filter(k=>ITEMS[k]).map(k=>'<button class="dki'+(cur===k?' on':'')+'" data-a="dk_o" data-k="'+k+'" aria-label="'+esc(nm(k))+'"><span>'+ITEMS[k].i+'</span><small>'+esc(nm(k))+'</small></button>').join('')+'<button class="dki" data-a="dk_c" aria-label="customize"><span>⚙</span></button>';
  let b=el;if(!b){b=document.createElement('div');b.id='dkbar';b.setAttribute('data-nobi','');document.body.appendChild(b)}
  if(b.innerHTML!==h)b.innerHTML=h;sheet()}
function sheet(){let s=document.getElementById('dksh');
  if(!cur&&!cfg){if(s)s.remove();return}
  let h='';
  if(cfg){const d=DK();h='<div class="row"><b>⚙ '+T('نوار ابزار سریع','Quick toolbar')+'</b><span class="sp"></span><button class="chip" data-a="dk_x" aria-label="close">✕</button></div><div class="m" style="margin:6px 0">'+T('انتخاب کن کدام‌ها پایین صفحه باشند','Choose which appear at the bottom')+'</div><div class="row">'
    +Object.keys(ITEMS).map(k=>'<button class="chip '+(d.list.includes(k)?'on':'')+'" data-a="dk_t" data-k="'+k+'">'+ITEMS[k].i+' '+esc(nm(k))+'</button>').join('')+'</div>'
    +'<div class="row" style="margin-top:10px"><button class="chip '+(d.on?'on':'')+'" data-a="dk_on">'+(d.on?T('نوار روشن است — خاموش کردن','Bar on — turn off'):T('نوار خاموش است — روشن کردن','Bar off — turn on'))+'</button></div>'}
  else{let c='';try{c=ITEMS[cur].r()}catch(e){console.error('dock',e)}h='<div class="row"><b>'+ITEMS[cur].i+' '+esc(nm(cur))+'</b><span class="sp"></span><button class="chip" data-a="dk_x" aria-label="close">✕</button></div>'+(c||'<p class="m">'+T('فعلاً چیزی برای نمایش نیست.','Nothing to show yet.')+'</p>')}
  if(!s){s=document.createElement('div');s.id='dksh';s.setAttribute('data-nobi','');document.body.appendChild(s)}
  s.innerHTML=h}
window.daniDockOpen=k=>{if(k==='cfg'){cfg=1;cur=''}else{cur=k;cfg=0}bar()};
H.dk_o=e=>{const k=e.dataset.k;cur=cur===k?'':k;cfg=0;bar()};
H.dk_c=()=>{cfg=cfg?0:1;cur='';bar()};
H.dk_x=()=>{cur='';cfg=0;bar()};
H.dk_t=e=>{const d=DK(),k=e.dataset.k,i=d.list.indexOf(k);if(i>=0)d.list.splice(i,1);else d.list.push(k);save();bar()};
H.dk_on=()=>{const d=DK();d.on=d.on?0:1;if(!d.on){cur='';}save();bar()};
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{bar()}catch(e){console.error('dock',e)}return r}}
{const _sp=setPage;setPage=function(){const h=_sp.apply(this,arguments);return typeof h==='string'&&typeof stt!=='undefined'&&stt==='look'?h+'<div class="c"><h3>'+T('نوار ابزار سریع پایین صفحه','Bottom quick toolbar')+'</h3><div class="row"><button class="chip '+(DK().on?'on':'')+'" data-a="dk_on">'+(DK().on?T('روشن','On'):T('خاموش','Off'))+'</button><button class="chip" data-a="dk_c">'+T('انتخاب دکمه‌ها','Choose buttons')+'</button></div></div>':h}}
const st=document.createElement('style');st.textContent='#dkbar{position:fixed;bottom:8px;left:50%;transform:translateX(-50%);z-index:45;display:flex;gap:2px;padding:4px 6px;border-radius:999px;background:var(--c,#fff);border:1px solid var(--bd,#8886);box-shadow:0 4px 18px #0004;max-width:calc(100vw - 16px);overflow-x:auto}#dkbar .dki{display:flex;flex-direction:column;align-items:center;gap:0;padding:4px 9px;border:0;background:none;border-radius:14px;color:inherit;font:inherit;cursor:pointer;min-width:44px}#dkbar .dki span{font-size:1.25em;line-height:1.2}#dkbar .dki small{font-size:.62em;opacity:.8;white-space:nowrap}#dkbar .dki.on{background:#8883}#dksh{position:fixed;left:8px;right:8px;bottom:70px;max-height:62vh;overflow:auto;z-index:46;background:var(--c,#fff);color:inherit;border:1px solid var(--bd,#8886);border-radius:18px;padding:10px;box-shadow:0 8px 30px #0006}#dksh .c{box-shadow:none;margin:6px 0 0}@media(min-width:800px){#dksh{left:50%;right:auto;width:440px;transform:translateX(-50%)}}#pg{padding-bottom:84px}';document.head.appendChild(st);
setTimeout(()=>{try{bar()}catch(e){}},300);
})();
