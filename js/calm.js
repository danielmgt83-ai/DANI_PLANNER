/* نمای آرام (v68): حالت خیلی فرعیِ اختیاری برای تمرکز. فقط «پنهان می‌کند»؛ داده، منو، تم و تنظیمات هیچ‌کدام عوض نمی‌شوند.
   روشن: کلاس body.dq ← انیمیشن‌ها و دکمه‌های شناور خاموش، بخش‌های تزئینی خانه (هیرو، گالری، نقل‌قول) و کارت‌های فرعی پنهان؛
   فقط موعد بعدی، برنامه/چک‌لیست امروز، ثبت فعالیت، خط زمانی، نتیجه، عقب‌افتاده می‌ماند. نوار کوچک بالای خانه: «نمایش همه» یا «خاموش».
   تنظیم: db.set.dq={on}. روشن/خاموش از: تنظیمات ← زبان و ظاهر ← کارت «نمای آرام»، و جست‌وجوی ⚡. بعد از qa-more.js و settings2.js. */
(function(){'use strict';
const T=window.daniT;
const KEEP=/Next deadline|موعد بعدی|Today's plan|برنامه‌ی امروز|Activity Log|ثبت فعالیت|timeline|تایم‌لاین|خط زمانی|Today's target|هدف امروز|checklist|چک‌لیست|Result|نتیجه‌ی امروز|Overdue|عقب‌افتاده|Today's time|Track|ثبت زمان/i;
const QUOTE=/A Thought|یک اندیشه|Quote|نقل‌قول/i;
const cfg=()=>db.set.dq||(db.set.dq={on:false});
let showAll=false;
const css=document.createElement('style');
css.textContent='body.dq *,body.dq *::before,body.dq *::after{animation:none!important;transition:none!important}'
 +'body.dq #hfab,body.dq .crs-lessonbar-ask{display:none!important}'
 +'body.dq .dqh{display:none!important}body.dq.dqall .dqh{display:revert!important}'
 +'#dqbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:6px 10px;margin:6px 0;border:1px dashed var(--b,#8886);border-radius:12px;font-size:.85em;opacity:.9}#dqbar .chip{padding:3px 10px}';
document.head.appendChild(css);
let mo=null,tm=0;
function watch(){if(mo)return;try{const a=document.querySelector('.app')||document.body;mo=new MutationObserver(()=>{if(!cfg().on)return;clearTimeout(tm);tm=setTimeout(apply,150)});mo.observe(a,{childList:true,subtree:true})}catch(e){}}
function apply(){if(mo)mo.disconnect();try{apply0()}finally{if(mo)mo.observe(document.querySelector('.app')||document.body,{childList:true,subtree:true})}}
function apply0(){const on=!!cfg().on;document.body.classList.toggle('dq',on);document.body.classList.toggle('dqall',on&&showAll);
  const old=document.getElementById('dqbar');if(old)old.remove();
  const home=document.querySelector('.home');document.querySelectorAll('.dqh').forEach(e=>e.classList.remove('dqh'));
  if(!on||!home)return;let n=0;
  home.querySelectorAll('[class*="hero"],[class*="gallery"]').forEach(e=>{if(!e.closest('.dqh')){e.classList.add('dqh');n++}});
  const scope=home.parentElement||home;scope.querySelectorAll('.c').forEach(c=>{if(c.closest('#dqbar'))return;if(c.parentElement&&c.parentElement.closest('.c'))return;if(c.closest('.dqh'))return;
    const h=c.querySelector('h3,summary');if(!h)return;const t=h.textContent||'';if(QUOTE.test(t)||!KEEP.test(t)){c.classList.add('dqh');n++}});
  const b=document.createElement('div');b.id='dqbar';
  b.innerHTML='<span>🎯 '+T('نمای آرام','Calm view')+(n?' · '+fa(n)+T(' بخش پنهان',' hidden'):'')+'</span><span style="flex:1"></span>'
   +(n?'<button class="chip" data-a="dq_all">'+(showAll?T('پنهان کن','Hide'):T('نمایش همه','Show all'))+'</button>':'')+'<button class="chip" data-a="dq_off">'+T('خاموش','Turn off')+'</button>';
  const first=home.querySelector('.deskhead');if(first&&first.nextSibling)home.insertBefore(b,first.nextSibling);else home.insertBefore(b,home.firstChild)}
H.dq_all=()=>{showAll=!showAll;apply()};
H.dq_off=()=>{cfg().on=false;showAll=false;save();apply();render()};
H.dq_tog=()=>{const q=cfg();q.on=!q.on;showAll=false;save();render();try{toast(q.on?T('نمای آرام روشن شد 🎯','Calm view on 🎯'):T('نمای آرام خاموش شد','Calm view off'))}catch(e){}};
function card(){if(document.getElementById('dqc'))return;
  const g=[...document.querySelectorAll('details.bgrp')].find(d=>/Look & themes|ظاهر و تم/.test(d.querySelector('summary')?d.querySelector('summary').innerText:''));if(!g)return;
  const b=document.createElement('div');b.className='c';b.id='dqc';
  b.innerHTML='<h3>🎯 '+T('نمای آرام (تمرکز)','Calm view (focus)')+'</h3><p class="m">'+T('اختیاری و فرعی: انیمیشن، دکمه‌های شناور و بخش‌های تزئینی/فرعی خانه را پنهان می‌کند. هیچ ویژگی، داده، تم یا منویی عوض نمی‌شود و با «نمایش همه» یا خاموش‌کردن همه‌چیز برمی‌گردد.','Optional and unobtrusive: hides animations, floating buttons and decorative/secondary Home sections. No feature, data, theme or menu changes; “Show all” or turning it off brings everything back.')+'</p>'
   +'<label class="row" style="align-items:center;gap:8px"><input type="checkbox" data-dq="1"'+(cfg().on?' checked':'')+'> '+T('روشن','On')+'</label>';
  g.appendChild(b)}
document.addEventListener('change',ev=>{const t=ev.target;if(t&&t.dataset&&t.dataset.dq){cfg().on=!!t.checked;showAll=false;save();apply()}});
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{if(page==='set'&&stt==='look')card();apply()}catch(e){console.error('calm',e)}return r}}
try{const QA=window.daniQuickAccess,F=window.daniQAFn=window.daniQAFn||{};if(QA&&!QA.byid.has('x-calm')){F.calm=H.dq_tog;const e={id:'x-calm',g:'تنظیمات',fa:'نمای آرام (تمرکز؛ روشن/خاموش)',en:'Calm view (focus; on/off)',ic:'look',kw:'تمرکز آرام حواس پرتی شلوغی calm focus distraction minimal',t:{fn:'x:calm'}};QA.catalog.push(e);QA.byid.set('x-calm',e)}}catch(e){}
watch();setTimeout(()=>{try{apply()}catch(e){}},300);
window.daniCalm={apply,toggle:H.dq_tog};
})();
