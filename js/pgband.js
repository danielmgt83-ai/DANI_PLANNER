"use strict";
/* DANI · pgband.js — «نوار تم» بالای همه‌ی صفحه‌ها (به‌جز تنظیمات و خانه که خودشان سلام دارند):
   آیکون برنامه + سلام (صبح/ظهر/عصر/شب بخیر) + تاریخ و ساعت + شعار/جمله‌ی شخصیتِ تم فعلی. برای هر صفحه جدا قابل بستن است.
   db.set.bd {off:{صفحه:1}, q:1(جمله), all:1(روشن کلی)}. بسته‌شدن فقط پنهان‌کردن است؛ با نوار کوچکِ «▾» بازمی‌گردد و در تنظیمات ← ظاهر هم هست.
   جمله از همان منبع خانه (heroQuote با شخصیت تم)؛ بدون شخصیت، شعار تم (tag). */
(function(){
const T=window.daniT;
const BD=()=>{const s=db.set;if(!s.bd||typeof s.bd!=='object')s.bd={};const o=s.bd;if(!o.off||typeof o.off!=='object')o.off={};if(o.all===undefined)o.all=1;if(o.q===undefined)o.q=1;return o};
const SKIP=new Set(['home','set']);
const PN={plan2:['Plan','برنامه'],dash:['Workspace','میزکار'],res:['Insights','نتیجه‌گیری'],cm:['Deadlines & habits','موعد و عادت'],dl:['Deadlines','موعدها'],hab:['Habits','عادت‌ها'],rem:['Reminders','یادآوری‌ها'],pj:['Projects','پروژه‌ها'],day:['Today','امروز'],tmr:['Tomorrow','فردا'],mx:['More','بیشتر']};
const nm=p=>PN[p]?T(PN[p][1],PN[p][0]):(typeof BI_NAV!=='undefined'&&BI_NAV[p]?T(BI_NAV[p][1],BI_NAV[p][0]):p);
function quote(){try{const sk=SKINS[skId()],ch=sk&&sk.qchar;if(ch){const q=heroQuote(ch);if(q&&(q.fa||q.en))return{t:T(q.fa||q.en,q.en||q.fa),a:q.a||''}}
  if(sk&&sk.tag)return{t:sk.tag,a:''}}catch(e){}return null}
function band(){const B=BD(),q=B.q?quote():null;
  return'<div class="c pgb" id="pgband"><div class="pgbr"><div style="min-width:0;flex:1">'+danGreetHTML()+'<div class="m">'+fmtDL(todayISO())+' · <span id="h2clk">'+fa(nowHM())+'</span></div></div><button class="chip" data-a="bd_x" title="'+T('بستن این نوار در این صفحه','Hide this bar on this page')+'" aria-label="'+T('بستن','Close')+'">✕</button></div>'
   +(q?'<div class="pgbq" dir="auto">'+(q.t?'«'+esc(q.t)+'»':'')+(q.a?' <span class="m">— '+esc(q.a)+'</span>':'')+'</div>':'')+'</div>'}
const mini=()=>'<div class="pgbm" id="pgband"><button class="chip" data-a="bd_o" title="'+T('نمایش نوار تم','Show theme bar')+'">▾ '+T('نوار تم','Theme bar')+'</button></div>';
H.bd_x=()=>{BD().off[page]=1;save();render()};
H.bd_o=()=>{delete BD().off[page];save();render()};
H.bd_all=e=>{BD().all=BD().all?0:1;save();render()};
H.bd_q=()=>{BD().q=BD().q?0:1;save();render()};
H.bd_pg=e=>{const o=BD().off,k=e.dataset.k;if(o[k])delete o[k];else o[k]=1;save();render()};
function inject(){try{if(SKIP.has(page))return;if(page==='day'&&window.daniDayHero&&window.daniDayHero())return;const B=BD();if(!B.all)return;const m=document.getElementById('pg');if(!m||document.getElementById('pgband'))return;
  const d=document.createElement('div');d.innerHTML=B.off[page]?mini():band();m.insertBefore(d.firstChild,m.firstChild);m.classList.toggle('hasband',!B.off[page]&&!!B.q)}catch(e){console.error('pgband',e)}}
{const _r=render;render=function(){const r=_r.apply(this,arguments);inject();return r}}
setInterval(()=>{try{const c=document.querySelector('#pgband #h2clk');if(c)c.textContent=fa(nowHM())}catch(e){}},20000);
/* تنظیمات ← ظاهر */
function card(){const B=BD(),pages=['dash','res','cm','pj','day','tmr','mx'].filter(p=>(typeof NAV!=='undefined'&&NAV.some(n=>n[0]===p))||p==='pj'||p==='dash'||p==='res');
  return'<div class="c" id="bdcard">'+daniH('🎴','نوار تم بالای صفحه‌ها','Theme bar on pages')+'<div class="row"><button class="chip '+(B.all?'on':'')+'" data-a="bd_all">'+(B.all?'✓ ':'')+T('نمایش نوار (سلام، تاریخ، ساعت، جمله)','Show the bar (greeting, date, time, quote)')+'</button><button class="chip '+(B.q?'on':'')+'" data-a="bd_q">'+(B.q?'✓ ':'')+T('جمله‌ی تم','Theme quote')+'</button></div>'
   +'<p class="m">'+T('نوار را هر صفحه جدا ببند یا باز کن:','Close or open the bar per page:')+'</p><div class="row">'+['dash','res','cm','pj'].map(p=>'<button class="chip '+(B.off[p]?'':'on')+'" data-a="bd_pg" data-k="'+p+'">'+(B.off[p]?'':'✓ ')+nm(p)+'</button>').join('')+'</div></div>'}
{const _sp=setPage;setPage=function(){const h=_sp.apply(this,arguments);return(typeof h==='string'&&typeof stt!=='undefined'&&stt==='look')?h+card():h}}
try{const s=document.createElement('style');s.textContent='.pgb{margin:0 0 10px;padding:10px 12px}.pgbr{display:flex;align-items:center;gap:8px}.pgbr .dkgr{font-size:.95em}.pgbq{margin-top:8px;padding-inline-start:10px;border-inline-start:3px solid var(--ac,#3b82f6);font-size:.92em;opacity:.92}.hasband #qcard{display:none}.pgbm{margin:0 0 6px;text-align:start}.pgbm .chip{font-size:.8em;padding:2px 10px;opacity:.75}';document.head.appendChild(s)}catch(e){}
window.daniBand={on:()=>BD().all};
})();
