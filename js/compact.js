"use strict";
/* DANI · compact.js — جمع‌وجور کردن بدون کم‌کردن ویژگی:
   (۱) «برنامه‌ها»: موعدها + عادت‌ها + یادآوری‌ها در یک مدخل منو با سه تب (صفحه‌ها و داده‌ها دست‌نخورده؛ فقط یک نوار تب بالای هر کدام)
   (۲) کارت‌های تنظیمات جمع‌شونده (روی عنوان بزن)
   (۳) کارت «جمع‌وجور» در تنظیمات ← ظاهر برای خاموش/روشن‌کردن هر دو
   داده: db.set.cm {mg:0|1 (پیش‌فرض ۱), fold:0|1 (پیش‌فرض ۱), last:'dl'|'hab'|'rem', open:{عنوان:1}} */
(function(){
const T=window.daniT;
const CM=()=>{const s=db.set;if(!s.cm||typeof s.cm!=='object')s.cm={};const c=s.cm;if(c.mg===undefined)c.mg=1;if(c.fold===undefined)c.fold=1;if(!c.open||typeof c.open!=='object')c.open={};return c};
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
function fold(){if(page!=='set'||!CM().fold)return;const pg=document.getElementById('pg');if(!pg)return;
  const cs=[...pg.children].filter(c=>c.classList&&c.classList.contains('c')&&c.id!=='cmcard'&&c.querySelector(':scope>h3,:scope>h2'));
  cs.forEach((c,i)=>{if(c.classList.contains('cmf'))return;const k=(typeof stt!=='undefined'?stt:'')+'|'+key(c);c.classList.add('cmf');c.dataset.cmk=k;
    const o=CM().open[k];if(!(o===1||(o===undefined&&i===0)))c.classList.add('cmc')})}
document.addEventListener('click',e=>{const h=e.target.closest&&e.target.closest('.c.cmf>h3,.c.cmf>h2');if(!h||e.target.closest('button,input,a,select,label'))return;
  const c=h.parentElement,k=c.dataset.cmk;c.classList.toggle('cmc');CM().open[k]=c.classList.contains('cmc')?0:1;try{save()}catch(x){}});
window.daniUnfold=c=>{if(c&&c.classList&&c.classList.contains('cmc')){c.classList.remove('cmc');if(c.dataset.cmk)CM().open[c.dataset.cmk]=1}};
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{mark();fold()}catch(e){console.error('compact',e)}return r}}
/* ---------- کارت «جمع‌وجور» ---------- */
H.cm_mg=()=>{const c=CM();c.mg=c.mg?0:1;save();render()};
H.cm_fd=()=>{const c=CM();c.fold=c.fold?0:1;if(!c.fold)document.querySelectorAll('.cmc').forEach(x=>x.classList.remove('cmc'));save();render()};
H.cm_fdr=()=>{CM().open={};save();render()};
function card(){const c=CM();
  return'<div class="c" id="cmcard">'+daniH('🧩','جمع‌وجور','Compact')+'<p class="m">'+T('فقط جای نمایش را کم می‌کند؛ هیچ ویژگی یا داده‌ای کم یا تغییر نمی‌کند.','Only saves space; no feature or data is removed or changed.')+'</p>'
   +'<div class="row"><button class="chip '+(c.mg?'on':'')+'" data-a="cm_mg">⏳✅🔔 '+T('موعد، عادت و یادآوری در یک مدخل منو','Deadlines, habits & reminders in one menu entry')+'</button></div>'
   +'<div class="row" style="margin-top:6px"><button class="chip '+(c.fold?'on':'')+'" data-a="cm_fd">▾ '+T('کارت‌های تنظیمات جمع‌شونده','Collapsible settings cards')+'</button><button class="chip" data-a="cm_fdr">'+T('بازنشانی باز/بسته','Reset open/closed')+'</button></div></div>'}
{const _sp=setPage;setPage=function(){const h=_sp.apply(this,arguments);return(typeof h==='string'&&typeof stt!=='undefined'&&stt==='look')?h+card():h}}
const st=document.createElement('style');
st.textContent='.c.cmf>h3,.c.cmf>h2{cursor:pointer}.c.cmf>h3::after,.c.cmf>h2::after{content:" ▾";opacity:.5;font-size:.8em}.c.cmf.cmc>h3::after,.c.cmf.cmc>h2::after{content:" ▸"}.c.cmf.cmc>*:not(h3):not(h2){display:none!important}';
document.head.appendChild(st);
})();
