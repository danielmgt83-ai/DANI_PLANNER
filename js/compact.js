"use strict";
/* DANI · compact.js — جمع‌وجور کردن بدون کم‌کردن ویژگی:
   (۱) «برنامه‌ها»: موعدها + عادت‌ها + یادآوری‌ها در یک مدخل منو با سه تب (صفحه‌ها و داده‌ها دست‌نخورده؛ فقط یک نوار تب بالای هر کدام)
   (۲) کارت‌های تنظیمات جمع‌شونده (روی عنوان بزن)
   (۳) کارت «جمع‌وجور» در تنظیمات ← ظاهر برای خاموش/روشن‌کردن هر دو
   داده: db.set.cm {mg:0|1 (پیش‌فرض ۱), fold:0|1 (پیش‌فرض ۱), last:'dl'|'hab'|'rem', open:{عنوان:1}} */
(function(){
const T=window.daniT;
const CM=()=>{const s=db.set;if(!s.cm||typeof s.cm!=='object')s.cm={};const c=s.cm;if(c.mg===undefined)c.mg=1;if(c.fold===undefined)c.fold=1;if(c.ws===undefined)c.ws=1;if(c.more===undefined)c.more=1;if(!Array.isArray(c.pin))c.pin=[];if(!c.open||typeof c.open!=='object')c.open={};return c};
const SUB=[['dl','⏳',['موعدها','Deadlines']],['hab','✅',['عادت‌ها','Habits']],['rem','🔔',['یادآوری‌ها','Reminders']]];
const subOn=()=>SUB.filter(x=>modOn(x[0]));
const merged=()=>CM().mg&&subOn().length>=2;
try{Object.assign(ICONS,{cm:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16M8 14l2 2 4-4"/>'})}catch(e){}
BI_NAV.cm=['Plans','موعد و عادت'];
EXT_PAGES.add('cm');
PG.cm=()=>{const on=subOn(),l=CM().last;const k=on.some(x=>x[0]===l)?l:(on[0]?on[0][0]:'dash');page=k;return PG[k]()};
/* منو: سه مدخل → یک مدخل */
{const _s=syncNav;syncNav=function(){_s.apply(this,arguments);try{if(!merged())return;
  const ids=SUB.map(x=>x[0]),at=NAV.findIndex(n=>ids.includes(n[0]));if(at<0)return;
  for(let i=NAV.length-1;i>=0;i--)if(ids.includes(NAV[i][0]))NAV.splice(i,1);
  NAV.splice(at,0,['cm','موعد و عادت'])}catch(e){console.error('cmNav',e)}}}
/* نوار تب بالای هر صفحه */
function bar(cur){const on=subOn();return'<div class="row cmbar" style="gap:4px;margin:0 0 8px;flex-wrap:wrap">'+on.map(x=>'<button class="chip '+(x[0]===cur?'on':'')+'" data-a="go" data-p="'+x[0]+'">'+x[1]+' '+T(x[2][0],x[2][1])+'</button>').join('')+'</div>'}
SUB.forEach(x=>{const k=x[0],_p=PG[k];if(typeof _p!=='function')return;PG[k]=function(){const h=_p.apply(this,arguments);if(!merged()||typeof h!=='string')return h;CM().last=k;return bar(k)+h}});
/* نشان‌دادن مدخل فعال در منو وقتی هر یک از سه صفحه باز است */
function mark(){const ids=SUB.map(x=>x[0]);document.querySelectorAll('[data-a="go"][data-p="cm"]').forEach(a=>a.classList.toggle('on',ids.includes(page)||page==='cm'))}
/* ---------- کارت‌های تنظیمات جمع‌شونده ---------- */
const key=c=>{const h=c.querySelector(':scope>h3,:scope>h2');return h?h.textContent.replace(/\s+/g,' ').trim().slice(0,40):''};
function fold(){const pg=document.getElementById('pg');if(!pg)return;
  if(page==='dash'&&CM().ws){/* میزکار: جمله‌ی امروز (روی هر تب) و «چیدمان و طرح» به‌صورت پیش‌فرض بسته؛ عنوان می‌ماند */
    [...pg.querySelectorAll('.c')].filter(c=>!c.parentElement.closest('.c')&&c.querySelector(':scope>h3')).forEach(c=>{if(c.classList.contains('cmf'))return;
      const q=c.id==='qcard',lay=!q&&/چیدمان و طرح/.test(c.querySelector(':scope>h3').textContent);if(!q&&!lay)return;
      const k=q?'dash|quote':'dash|layout';c.classList.add('cmf');c.dataset.cmk=k;if(CM().open[k]!==1)c.classList.add('cmc')});return}
  if(page!=='set'||!CM().fold)return;
  const cs=[...pg.children].filter(c=>c.classList&&c.classList.contains('c')&&c.id!=='cmcard'&&c.querySelector(':scope>h3,:scope>h2'));
  cs.forEach((c,i)=>{if(c.classList.contains('cmf'))return;const k=(typeof stt!=='undefined'?stt:'')+'|'+key(c);c.classList.add('cmf');c.dataset.cmk=k;
    const o=CM().open[k];if(!(o===1||(o===undefined&&i===0)))c.classList.add('cmc')})}
document.addEventListener('click',e=>{const h=e.target.closest&&e.target.closest('.c.cmf>h3,.c.cmf>h2');if(!h||e.target.closest('button,input,a,select,label'))return;
  const c=h.parentElement,k=c.dataset.cmk;c.classList.toggle('cmc');CM().open[k]=c.classList.contains('cmc')?0:1;try{save()}catch(x){}});
window.daniUnfold=c=>{if(c&&c.classList&&c.classList.contains('cmc')){c.classList.remove('cmc');if(c.dataset.cmk)CM().open[c.dataset.cmk]=1}};
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{mark();fold()}catch(e){console.error('compact',e)}return r}}

/* ---------- میزکار: ابزارهای سریع پراکنده → کارت «امروز» ---------- */
{const _rc=recCard;recCard=function(){
  if(window.daniNoExtra||!CM().ws||!window.daniTodayCard)return _rc.apply(this,arguments);
  window.daniNoExtra=1;window.daniTdMode=1;let o;try{o=_rc.apply(this,arguments)}finally{window.daniNoExtra=0;window.daniTdMode=0}
  let t='';try{t=window.daniTodayCard()}catch(e){console.error('dashTd',e)}
  return t+o}}
/* ---------- منوی «بیشتر» ---------- */
const MORE=()=>{const pin=CM().pin;return MODULES.filter(m=>modOn(m.id)&&!SUB.some(x=>x[0]===m.id)&&!pin.includes(m.id))};
BI_NAV.mo=['More','بیشتر'];EXT_PAGES.add('mo');
try{Object.assign(ICONS,{mo:'<circle cx="6" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18" cy="12" r="1.6"/>'})}catch(e){}
{const _s=syncNav;syncNav=function(){_s.apply(this,arguments);try{if(!CM().more)return;const hid=MORE();if(hid.length<2)return;
  const ids=hid.map(m=>m.id);let at=-1;for(let i=NAV.length-1;i>=0;i--)if(ids.includes(NAV[i][0])){at=i;NAV.splice(i,1)}
  if(at>=0)NAV.splice(at,0,['mo','بیشتر'])}catch(e){console.error('moreNav',e)}}}
PG.mo=()=>{const hid=MORE(),pin=CM().pin;
  let h='<div class="c">'+daniH('⋯','بیشتر','More')+'<p class="m">'+T('بخش‌های کمتر-استفاده. با 📌 هر کدام را به منوی اصلی بیاور.','Less-used sections. Pin any to the main menu with 📌.')+'</p>';
  h+=hid.map(m=>'<div class="row" style="margin:6px 0"><button class="chip" data-a="go" data-p="'+esc(m.id)+'" style="flex:1;text-align:start"><b>'+(BI_NAV[m.id]?BI_NAV[m.id][1]:esc(m.name))+'</b><br><span class="m">'+esc(m.desc||'')+'</span></button><button class="chip" data-a="mo_pin" data-k="'+esc(m.id)+'" title="'+esc(T('پین به منو','Pin to menu'))+'">📌</button></div>').join('');
  const pinned=MODULES.filter(m=>pin.includes(m.id)&&modOn(m.id));
  if(pinned.length)h+='<div class="m" style="margin-top:8px">'+T('پین‌شده در منو:','Pinned in menu:')+'</div>'+pinned.map(m=>'<button class="chip on" data-a="mo_pin" data-k="'+esc(m.id)+'">📌 '+(BI_NAV[m.id]?BI_NAV[m.id][1]:esc(m.name))+' ✕</button>').join(' ');
  return h+'</div>'};
H.mo_pin=e=>{const p=CM().pin,k=e.dataset.k,i=p.indexOf(k);if(i>=0)p.splice(i,1);else p.push(k);save();render()};
{const _m=mark;mark=function(){_m();const ids=MORE().map(m=>m.id);document.querySelectorAll('[data-a="go"][data-p="mo"]').forEach(a=>a.classList.toggle('on',page==='mo'||ids.includes(page)))}}
/* ---------- کارت «جمع‌وجور» ---------- */
H.cm_mg=()=>{const c=CM();c.mg=c.mg?0:1;save();render()};
H.cm_ws=()=>{const c=CM();c.ws=c.ws?0:1;save();render()};
H.cm_mo=()=>{const c=CM();c.more=c.more?0:1;save();render()};
H.cm_fd=()=>{const c=CM();c.fold=c.fold?0:1;if(!c.fold)document.querySelectorAll('.cmc').forEach(x=>x.classList.remove('cmc'));save();render()};
H.cm_fdr=()=>{CM().open={};save();render()};
function card(){const c=CM();
  return'<div class="c" id="cmcard">'+daniH('🧩','جمع‌وجور','Compact')+'<p class="m">'+T('فقط جای نمایش را کم می‌کند؛ هیچ ویژگی یا داده‌ای کم یا تغییر نمی‌کند.','Only saves space; no feature or data is removed or changed.')+'</p>'
   +'<div class="row"><button class="chip '+(c.mg?'on':'')+'" data-a="cm_mg">⏳✅🔔 '+T('موعد، عادت و یادآوری در یک مدخل منو','Deadlines, habits & reminders in one menu entry')+'</button></div>'
   +'<div class="row" style="margin-top:6px"><button class="chip '+(c.ws?'on':'')+'" data-a="cm_ws">🗂 '+T('میزکار مرتب (ابزارهای سریع در یک کارت، جمله و چیدمان بسته)','Tidy workspace (quick tools in one card, quote & layout collapsed)')+'</button></div><div class="row" style="margin-top:6px"><button class="chip '+(c.more?'on':'')+'" data-a="cm_mo">⋯ '+T('منوی «بیشتر» برای بخش‌های کم‌استفاده','“More” menu for less-used sections')+'</button></div>'
   +'<div class="row" style="margin-top:6px"><button class="chip '+(c.fold?'on':'')+'" data-a="cm_fd">▾ '+T('کارت‌های تنظیمات جمع‌شونده','Collapsible settings cards')+'</button><button class="chip" data-a="cm_fdr">'+T('بازنشانی باز/بسته','Reset open/closed')+'</button></div></div>'}
{const _sp=setPage;setPage=function(){const h=_sp.apply(this,arguments);return(typeof h==='string'&&typeof stt!=='undefined'&&stt==='look')?h+card():h}}
const st=document.createElement('style');
st.textContent='.c.cmf>h3,.c.cmf>h2{cursor:pointer}.c.cmf>h3::after,.c.cmf>h2::after{content:" ▾";opacity:.5;font-size:.8em}.c.cmf.cmc>h3::after,.c.cmf.cmc>h2::after{content:" ▸"}.c.cmf.cmc>*:not(h3):not(h2){display:none!important}';
document.head.appendChild(st);
})();
