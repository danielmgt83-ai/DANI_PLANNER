"use strict";
/* DANI · menucard.js (v164) — کارت «Menu / منو» در ظاهر و تم ← سفارشی.
   همه‌چیز اختیاری و جدا برای هر تم: db.set.skx[تم].mn = {sz:اندازه%, lb:''|'none'|'fa'|'en', w:1 ضخیم, hd:0 بدون سربرگ, hide:[کلید آیتم‌های پنهان]}.
   آیتم‌های پنهان «فهرست سیاه» است؛ پس هر آیتم تازه‌ی منو خودکار در همه‌ی تم‌ها دیده می‌شود. «خانه» و «تنظیمات» هرگز پنهان نمی‌شوند.
   شکل منو (پایین/بالا/کناری…) همان‌جا که بود می‌ماند: پیش‌نمایش هر تم. */
(function(){'use strict';
const T=window.daniT||function(a){return a};
const PROT=['home','day','set'];
const SKX=()=>{const S=db.set;if(!S.skx||typeof S.skx!=='object'||Array.isArray(S.skx))S.skx={};return S.skx};
const sid=()=>{try{return skId()}catch(e){return db.set.skin||''}};
const MN=()=>{const X=SKX(),id=sid();if(!X[id]||typeof X[id]!=='object')X[id]={};if(!X[id].mn||typeof X[id].mn!=='object')X[id].mn={};return X[id].mn};
const peek=()=>{try{return((SKX()[sid()]||{}).mn)||{}}catch(e){return{}}};
const SZ=m=>{const v=+m.sz;return v>=70&&v<=140?v:100};
const E=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const css=document.createElement('style');css.id='nvm-base';
css.textContent='#nav a{zoom:var(--nvs,1)}html[data-lay=bottom] .app{padding-bottom:calc(84px*var(--nvs,1))}'
 +'html[data-nvlb=none] #nav a .bi,html[data-nvlb=none] #nav a .lb{display:none}html[data-nvlb=fa] #nav a .bi b{display:none}html[data-nvlb=en] #nav a .bi i{display:none}'
 +'html[data-nvw="1"] #nav a,html[data-nvw="1"] #nav a .bi b,html[data-nvw="1"] #nav a .bi i{font-weight:800}'
 +'html[data-nvhd="0"] #nav h1,html[data-nvhd="0"] #nav small{display:none}'
 +'#menucard .mnr{width:100%}#menucard .row{flex-wrap:wrap;gap:6px;margin:6px 0}#menucard .mnv{font-weight:700;margin-inline-start:6px}';
document.head.appendChild(css);
let hs=document.getElementById('nvm-hide');if(!hs){hs=document.createElement('style');hs.id='nvm-hide';document.head.appendChild(hs)}
function apply(){try{const m=peek(),h=document.documentElement,sz=SZ(m);
  if(sz===100)h.style.removeProperty('--nvs');else h.style.setProperty('--nvs',String(sz/100));
  ['nvlb','nvw','nvhd'].forEach(k=>delete h.dataset[k]);
  if(m.lb==='none'||m.lb==='fa'||m.lb==='en')h.dataset.nvlb=m.lb;if(m.w)h.dataset.nvw='1';if(m.hd===0)h.dataset.nvhd='0';
  hs.textContent=(Array.isArray(m.hide)?m.hide:[]).filter(k=>PROT.indexOf(k)<0&&/^[\w-]+$/.test(k)).map(k=>'#nav a[data-p="'+k+'"]{display:none!important}').join('')}catch(e){console.error('menucard',e)}}
const name=k=>{try{const p=BI_NAV[k];if(p)return T(p[1],p[0]);const n=NAV.find(x=>x[0]===k);return n?String(n[1]):k}catch(e){return k}};
const items=()=>{try{return NAV.map(n=>n[0])}catch(e){return[]}};
function html(){const m=peek(),sz=SZ(m),hide=Array.isArray(m.hide)?m.hide:[],lb=m.lb||'';
 const ch=(a,k,v,on,t)=>'<button class="chip'+(on?' on':'')+'" data-a="'+a+'" data-k="'+k+'" data-v="'+v+'">'+t+'</button>';
 return window.daniH('☰','منو','Menu')
 +'<label class="m" style="display:block">'+T('اندازه','Size')+'<span class="mnv" id="mn-sv">'+sz+'٪</span><input class="mnr" type="range" min="70" max="140" step="5" value="'+sz+'" data-mnr="sz"></label>'
 +'<div class="m">'+T('برچسب زیر آیتم','Label under item')+'</div><div class="row">'
 +ch('mn_set','lb','',!lb,T('فارسی + English','Both'))+ch('mn_set','lb','fa',lb==='fa',T('فقط فارسی','Persian only'))+ch('mn_set','lb','en',lb==='en','English only')+ch('mn_set','lb','none',lb==='none',T('بدون برچسب','No label'))+'</div>'
 +'<div class="row">'+ch('mn_set','w','1',!!m.w,T('متن ضخیم','Bold text'))+ch('mn_set','hd','0',m.hd===0,T('پنهان‌کردن سربرگ منو','Hide menu header'))+'</div>'
 +'<div class="m">'+T('آیتم‌های منو (زدن = پنهان/نمایان)','Menu items (tap = hide/show)')+'</div><div class="row">'
 +items().map(k=>PROT.indexOf(k)>=0?'<span class="chip on" style="opacity:.6">'+E(name(k))+' 🔒</span>':ch('mn_set','hide',E(k),hide.indexOf(k)<0,E(name(k)))).join('')+'</div>'
 +'<p class="m">'+T('این تنظیمات فقط برای تم فعلی‌اند و با عوض‌کردن تم، تنظیم همان تم برمی‌گردد. آیتم تازه‌ی منو خودکار نمایان می‌شود. شکل منو (پایین/بالا/کناری) در پیش‌نمایش هر تم است.','These apply to the current theme only; switching themes brings back that theme\'s own setup. New menu items appear automatically. Menu shape (bottom/top/side) lives in each theme preview.')+'</p>'
 +'<div class="row"><button class="chip" data-a="mn_reset">↺ '+T('برگرداندن به پیش‌فرض تم','Reset to theme default')+'</button></div>'}
function node(){let c=document.getElementById('menucard');if(!c){c=document.createElement('div');c.id='menucard';c.className='c'}c.innerHTML=html();return c}
const refresh=()=>{const c=document.getElementById('menucard');if(c)c.innerHTML=html()};
H.mn_set=e=>{const k=e.dataset.k,v=e.dataset.v,m=MN();
 if(k==='lb'){if(v)m.lb=v;else delete m.lb}
 else if(k==='w'){if(m.w)delete m.w;else m.w=1}
 else if(k==='hd'){if(m.hd===0)delete m.hd;else m.hd=0}
 else if(k==='hide'){const a=Array.isArray(m.hide)?m.hide:[],i=a.indexOf(v);if(PROT.indexOf(v)>=0)return;if(i>=0)a.splice(i,1);else a.push(v);m.hide=a;if(!a.length)delete m.hide}
 save();apply();refresh()};
H.mn_reset=()=>{const X=SKX(),id=sid();if(X[id])delete X[id].mn;save();apply();refresh();toast(T('منو به پیش‌فرض تم برگشت','Menu reset to theme default'))};
document.addEventListener('input',e=>{const t=e.target;if(!t||t.dataset.mnr!=='sz')return;const m=MN();m.sz=+t.value;apply();const s=document.getElementById('mn-sv');if(s)s.textContent=t.value+'٪'});
document.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.mnr==='sz'){const m=MN();if(SZ(m)===100)delete m.sz;save()}});
{const _a=window.applySkin||(typeof applySkin==='function'?applySkin:null);
 if(_a){applySkin=function(){const r=_a.apply(this,arguments);apply();return r}}}
const _rn=typeof render==='function'?render:null;
if(_rn){render=function(){const r=_rn.apply(this,arguments);try{apply()}catch(e){}return r}}
apply();
window.daniMenuCard={node,apply};
})();
