"use strict";
/* DANI · pjnav.js — صفحه‌ی «پروژه‌ها» مرتب‌تر، بدون حذف هیچ قابلیتی.
   ۱) بخش بزرگ و درهم‌ریخته‌ی «موعدها» (#dlmv) داخل بخش‌های جمع‌شونده‌ی برچسب‌دار قرار می‌گیرد: فهرست موعدها · افزودن موعد · پیش‌بینی و برآورد · بدون پروژه · هشدارها · دسته‌ها · تنظیمات موعد.
   ۲) یک ردیف دکمه‌ی «پرش» زیر سربرگ صفحه: با یک لمس به هر بخش می‌رود و آن را باز می‌کند.
   ۳) بازشدن/بسته‌شدن بخش‌ها و جای اسکرول بعد از هر رندر یادش می‌ماند (دیگر «صفحه می‌پرد یا جمع می‌شود» نیست).
   فقط DOM بعد از رندر جابه‌جا می‌شود؛ شناسه‌ها و دکمه‌های قبلی (dlhub، dlfc، df-t …) همان‌ها می‌مانند. بعد از dlmove.js و setnav.js بارگذاری شود. */
(function(){
const T=window.daniT;
const SEC=[
 ['list','📋',['فهرست موعدها','Deadlines list']],
 ['add','＋',['افزودن موعد','Add a deadline']],
 ['fc','🏁',['پیش‌بینی و برآورد','Forecast & estimate']],
 ['free','🧩',['موعدها و هدف‌های بدون پروژه','Deadlines & goals without a project']],
 ['alerts','🔔',['هشدارها','Alerts']],
 ['cats','🏷',['دسته‌های سفارشی','Custom categories']],
 ['set','⚙',['تنظیمات موعد','Deadline settings']]];
const OPEN=window.daniPjOpen=window.daniPjOpen||{};
const txt=n=>(n.textContent||'').replace(/\s+/g,' ');
const h3=n=>{const h=n.querySelector&&n.querySelector('h3');return h?txt(h):''};
function css(){if(document.getElementById('pjncss'))return;const s=document.createElement('style');s.id='pjncss';
 s.textContent='#pjjump{display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;margin:0 0 10px;padding-bottom:4px;-webkit-overflow-scrolling:touch;scrollbar-width:none}#pjjump::-webkit-scrollbar{display:none}#pjjump .chip{font-size:.78em;padding:4px 10px;white-space:nowrap;flex:none;min-height:0;margin:0}.pjs{margin-top:10px}.pjs>summary{cursor:pointer}.pjs>.c,.pjs>details{margin-inline:0}';
 document.head.appendChild(s)}
function kind(n,prev){
 if(n.id==='dlhub')return'set';
 if(n.id==='dlfc')return'fc';
 const t=txt(n),H=h3(n);
 if(n.querySelector('[data-a="pj_fromdl"],[data-a="pj_fromgl"]')||/بدون پروژه|without a project/.test(H))return'free';
 if(n.querySelector('#df-t')||/افزودن موعد|Add deadline/.test(H))return'add';
 if(!n.classList.contains('c')&&prev==='add')return'add';
 if(/پیش‌بینی پروژه|Project forecast/.test(H))return'fc';
 if(/هشدارها|^Alerts/.test(H))return'alerts';
 if(/دسته‌های سفارشی|Custom categories/.test(H))return'cats';
 if(n.classList.contains('dlrow')||/^(Deadlines|موعدها)/.test(H)||n.classList.contains('c'))return'list';
 return prev||'list'}
function organize(){
 const m=document.getElementById('dlmv');if(!m||m.dataset.org)return;
 const kids=[...m.children].filter(c=>c.tagName!=='SUMMARY');if(!kids.length)return;
 const g={};let prev='';
 kids.forEach(n=>{const k=kind(n,prev);prev=k;(g[k]=g[k]||[]).push(n)});
 const sum=m.querySelector(':scope>summary');
 SEC.forEach(([k,ic,t])=>{const a=g[k];if(!a||!a.length)return;
  const d=document.createElement('details');d.className='c pjs';d.id='pjs-'+k;if(OPEN['pjs-'+k])d.open=true;
  const s=document.createElement('summary');s.innerHTML='<b>'+ic+' '+T(t[0],t[1])+'</b>';d.appendChild(s);
  a.forEach(n=>d.appendChild(n));m.appendChild(d)});
 m.dataset.org='1';if(OPEN.dlmv)m.open=true}
function jump(){
 const m=document.getElementById('dlmv');if(!m||document.getElementById('pjjump'))return;
 const head=[...document.getElementById('pg').children].find(c=>c.querySelector&&c.querySelector('h3.dh'));if(!head)return;
 const have=SEC.filter(s=>document.getElementById('pjs-'+s[0]));if(!have.length)return;
 const d=document.createElement('div');d.id='pjjump';d.setAttribute('data-nobi','');
 d.innerHTML='<button class="chip" data-a="pjn_go" data-k="top">⬆ '+T('پروژه‌ها','Projects')+'</button>'+have.map(s=>'<button class="chip" data-a="pjn_go" data-k="'+s[0]+'">'+s[1]+' '+T(s[2][0].replace('موعدها و هدف‌های ','').replace('Deadlines & goals ',''),s[2][1].replace('Deadlines & goals ',''))+'</button>').join('');
 head.insertAdjacentElement('afterend',d)}
H.pjn_go=e=>{const k=e.dataset.k;if(k==='top'){window.scrollTo({top:0,behavior:'smooth'});return}
 const m=document.getElementById('dlmv'),s=document.getElementById('pjs-'+k);if(!m||!s)return;m.open=true;s.open=true;OPEN.dlmv=1;OPEN['pjs-'+k]=1;
 setTimeout(()=>{try{s.scrollIntoView({block:'start',behavior:'smooth'})}catch(_){s.scrollIntoView()}},30)};
document.addEventListener('toggle',e=>{const t=e.target;if(t&&t.id&&(t.id==='dlmv'||/^pjs-/.test(t.id))){if(t.open)OPEN[t.id]=1;else delete OPEN[t.id]}},true);
let LP='';
{const _r=render;render=function(){const keep=(page==='pj'&&LP==='pj')?(window.scrollY||0):null;LP=page;const r=_r.apply(this,arguments);
 try{if(page==='pj'){css();organize();jump();if(keep>0)requestAnimationFrame(()=>{try{window.scrollTo(0,keep)}catch(_){}})}}catch(e){console.error('pjnav',e)}return r}}
})();
