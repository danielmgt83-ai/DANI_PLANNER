"use strict";
/* DANI · menucard.js (v168) — کارت «Menu / منو» در ظاهر و تم ← سفارشی. نسخه‌ی ۲.
   همه‌چیز اختیاری و جدا برای هر تم: db.set.skx[تم].mn = {sz:اندازه‌ی کل نوار %, gp:فاصله از لبه px (فقط پایین/بالا/شناور), ic:اندازه‌ی آیکون %, op:شفافیت نوار %,
   lb:''|'none'|'fa'|'en', w:1 ضخیم, hd:''|'t'|'s'|'none' (سربرگ: هر دو/فقط نام/فقط شعار/هیچ؛ قدیمی: 0=هیچ), cr:''|'sharp'|'round' گوشه‌ها, sh:1 سایه, hide:[کلید آیتم‌های پنهان]}.
   اندازه: خود نوار (zoom روی nav در پایین/بالا/ریل) کوچک/بزرگ می‌شود؛ در حالت کناری آیتم‌ها. «خانه» و «تنظیمات» هرگز پنهان نمی‌شوند.
   شکل منو (پایین/بالا/کناری…) همان‌جا که بود می‌ماند: پیش‌نمایش هر تم. */
(function(){'use strict';
const T=window.daniT||function(a){return a};
const PROT=['home','day','set'];
const R={sz:[60,140,5,100],gp:[0,40,2,null],ic:[70,150,5,100],op:[40,100,5,100]};
const SKX=()=>{const S=db.set;if(!S.skx||typeof S.skx!=='object'||Array.isArray(S.skx))S.skx={};return S.skx};
const sid=()=>{try{return skId()}catch(e){return db.set.skin||''}};
const MN=()=>{const X=SKX(),id=sid();if(!X[id]||typeof X[id]!=='object')X[id]={};if(!X[id].mn||typeof X[id].mn!=='object')X[id].mn={};return X[id].mn};
const peek=()=>{try{return((SKX()[sid()]||{}).mn)||{}}catch(e){return{}}};
const val=(m,k)=>{const r=R[k],v=m[k];return(typeof v==='number'&&v>=r[0]&&v<=r[1])?v:r[3]};
const SZ=m=>val(m,'sz');
const lay=()=>document.documentElement.dataset.lay||'';
const gapOK=()=>{const l=lay();return l==='bottom'||l==='top'};
const gapDef=()=>(lay()==='bottom'&&document.documentElement.dataset.navf==='1')?10:0;
const E=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const css=document.createElement('style');css.id='nvm-base';
const BTR='html[data-lay=bottom],html[data-lay=top],html[data-lay=rail]';
const g=(s)=>s;
css.textContent=
 /* اندازه: خود نوار (پایین/بالا/ریل)؛ کناری: آیتم‌ها */
 'html[data-nvz][data-lay=bottom] #nav,html[data-nvz][data-lay=top] #nav,html[data-nvz][data-lay=rail] #nav{zoom:var(--nvs,1)}'
 +'html[data-nvz]:not([data-lay=bottom]):not([data-lay=top]):not([data-lay=rail]) #nav a{zoom:var(--nvs,1)}'
 +'html[data-lay=bottom]:is([data-nvz],[data-nvg]) .app{padding-bottom:calc(84px*var(--nvs,1) + var(--nvg,0)*1px)}'
 +'html[data-navf="1"][data-lay=bottom]:is([data-nvz],[data-nvg]) .app{padding-bottom:calc(88px*var(--nvs,1) + var(--nvg,10)*1px)}'
 /* فاصله از لبه (پایین/بالا/شناور) */
 +'html[data-nvg][data-lay=bottom] #nav{bottom:calc(var(--nvg)*1px/var(--nvs,1))!important}'
 +'html[data-nvg]:not([data-nvg="0"])[data-lay=bottom] #nav{left:calc(var(--nvg)*1px/var(--nvs,1))!important;right:calc(var(--nvg)*1px/var(--nvs,1))!important;border-radius:18px}'
 +'html[data-nvg][data-lay=top] #nav{top:calc(var(--nvg)*1px/var(--nvs,1))!important;margin-top:calc(var(--nvg)*1px/var(--nvs,1))}'
 +'html[data-nvg]:not([data-nvg="0"])[data-lay=top] #nav{margin-inline:calc(var(--nvg)*1px/var(--nvs,1));border-radius:18px}'
 /* برچسب */
 +'html[data-nvlb=none] #nav a .bi,html[data-nvlb=none] #nav a .lb{display:none}html[data-nvlb=fa] #nav a .bi b{display:none}html[data-nvlb=en] #nav a .bi i{display:none}'
 +'html[data-nvlb=none][data-lay=bottom] #nav a{flex:1 0 48px!important;min-width:48px!important}'
 /* ظاهر */
 +'html[data-nvw="1"] #nav a,html[data-nvw="1"] #nav a .bi b,html[data-nvw="1"] #nav a .bi i{font-weight:800}'
 +'html[data-nvhd=none] #nav h1,html[data-nvhd=none] #nav small,html[data-nvhd="0"] #nav h1,html[data-nvhd="0"] #nav small{display:none}html[data-nvhd=t] #nav small{display:none}html[data-nvhd=s] #nav h1{display:none}'
 +'html[data-nvic] #nav a .ic,html[data-nvic] #nav a svg.ic{zoom:var(--nvic,1)}'
 +'html[data-nvop]:is([data-lay=bottom],[data-lay=top],[data-lay=rail]) #nav{background:color-mix(in srgb,var(--sb,var(--c,#222)) calc(var(--nvop)*1%),transparent)!important;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}'
 +'html[data-nvcr=sharp] #nav,html[data-nvcr=sharp] #nav a{border-radius:0!important}'
 +'html[data-nvcr=round]:is([data-lay=bottom],[data-lay=top],[data-lay=rail]) #nav{border-radius:26px!important}html[data-nvcr=round] #nav a{border-radius:99px!important}'
 +'html[data-nvsh="1"] #nav{box-shadow:0 6px 22px rgba(0,0,0,.28)!important}'
 +'#menucard .mnr{width:100%}#menucard .row{flex-wrap:wrap;gap:6px;margin:6px 0}#menucard .mnv{font-weight:700;margin-inline-start:6px}#menucard .mns{margin:10px 0 2px;font-weight:700;opacity:.85}';
document.head.appendChild(css);
let hs=document.getElementById('nvm-hide');if(!hs){hs=document.createElement('style');hs.id='nvm-hide';document.head.appendChild(hs)}
const DS=(h,k,v)=>{if(v==null)delete h.dataset[k];else h.dataset[k]=v};
function apply(){try{const m=peek(),h=document.documentElement,sz=SZ(m),ic=val(m,'ic'),op=val(m,'op');
  if(sz===100){h.style.removeProperty('--nvs');DS(h,'nvz',null)}else{h.style.setProperty('--nvs',String(sz/100));DS(h,'nvz','1')}
  if(typeof m.gp==='number'&&m.gp>=0&&m.gp<=40){h.style.setProperty('--nvg',String(m.gp));DS(h,'nvg',String(m.gp))}else{h.style.removeProperty('--nvg');DS(h,'nvg',null)}
  if(ic===100){h.style.removeProperty('--nvic');DS(h,'nvic',null)}else{h.style.setProperty('--nvic',String(ic/100));DS(h,'nvic','1')}
  if(op===100){h.style.removeProperty('--nvop');DS(h,'nvop',null)}else{h.style.setProperty('--nvop',String(op));DS(h,'nvop','1')}
  DS(h,'nvlb',(m.lb==='none'||m.lb==='fa'||m.lb==='en')?m.lb:null);
  DS(h,'nvw',m.w?'1':null);
  const hd=m.hd===0?'none':m.hd;DS(h,'nvhd',(hd==='none'||hd==='t'||hd==='s')?hd:null);
  DS(h,'nvcr',(m.cr==='sharp'||m.cr==='round')?m.cr:null);
  DS(h,'nvsh',m.sh?'1':null);
  hs.textContent=(Array.isArray(m.hide)?m.hide:[]).filter(k=>PROT.indexOf(k)<0&&/^[\w-]+$/.test(k)).map(k=>'#nav a[data-p="'+k+'"]{display:none!important}').join('')}catch(e){console.error('menucard',e)}}
const name=k=>{try{const p=BI_NAV[k];if(p)return T(p[1],p[0]);const n=NAV.find(x=>x[0]===k);return n?String(n[1]):k}catch(e){return k}};
const items=()=>{try{return NAV.map(n=>n[0])}catch(e){return[]}};
function html(){const m=peek(),hide=Array.isArray(m.hide)?m.hide:[],lb=m.lb||'',hd=m.hd===0?'none':(m.hd||''),cr=m.cr||'';
 const ch=(a,k,v,on,t)=>'<button class="chip'+(on?' on':'')+'" data-a="'+a+'" data-k="'+k+'" data-v="'+v+'">'+t+'</button>';
 const sl=(k,fa,en,v,u)=>'<label class="m" style="display:block">'+T(fa,en)+'<span class="mnv" id="mn-v-'+k+'">'+v+u+'</span><input class="mnr" type="range" min="'+R[k][0]+'" max="'+R[k][1]+'" step="'+R[k][2]+'" value="'+v+'" data-mnr="'+k+'"></label>';
 const gp=(typeof m.gp==='number')?m.gp:gapDef();
 return window.daniH('☰','منو','Menu')
 +'<div class="mns">'+T('اندازه و جا','Size & position')+'</div>'
 +sl('sz','اندازه‌ی منو (خود نوار)','Menu size (the whole bar)',SZ(m),'٪')
 +(gapOK()?sl('gp','فاصله از لبه‌ی صفحه (۰ = چسبیده)','Distance from the screen edge (0 = flush)',gp,'px')
   :'<p class="m" style="opacity:.7">'+T('در این تم منو کنار یا داخل صفحه است؛ فاصله از لبه ندارد.','In this theme the menu is on the side or inside the page; it has no edge distance.')+'</p>')
 +sl('ic','اندازه‌ی آیکون‌ها','Icon size',val(m,'ic'),'٪')
 +'<div class="mns">'+T('نمایش آیتم‌ها','Item labels')+'</div><div class="row">'
 +ch('mn_set','lb','none',lb==='none',T('فقط آیکون','Icons only'))+ch('mn_set','lb','',!lb,T('فارسی + English','Persian + English'))+ch('mn_set','lb','fa',lb==='fa',T('فقط فارسی','Persian only'))+ch('mn_set','lb','en',lb==='en','English only')+'</div>'
 +'<div class="mns">'+T('سربرگ منو','Menu header')+'</div><div class="row">'
 +ch('mn_set','hd','',!hd,T('نام + شعار','Name + tagline'))+ch('mn_set','hd','t',hd==='t',T('فقط نام','Name only'))+ch('mn_set','hd','s',hd==='s',T('فقط شعار','Tagline only'))+ch('mn_set','hd','none',hd==='none',T('بدون سربرگ','No header'))+'</div>'
 +'<div class="mns">'+T('ظاهر','Look')+'</div>'
 +sl('op','شفافیت نوار (پایین/بالا)','Bar opacity (bottom/top)',val(m,'op'),'٪')
 +'<div class="row">'+ch('mn_set','cr','',!cr,T('گوشه‌ها: پیش‌فرض تم','Corners: theme'))+ch('mn_set','cr','round',cr==='round',T('گرد','Round'))+ch('mn_set','cr','sharp',cr==='sharp',T('تیز','Sharp'))+'</div>'
 +'<div class="row">'+ch('mn_set','w','1',!!m.w,T('متن ضخیم','Bold text'))+ch('mn_set','sh','1',!!m.sh,T('سایه','Shadow'))+'</div>'
 +'<div class="mns">'+T('آیتم‌های منو — پنهان/نمایان فقط در این تم','Menu items — hide/show in this theme only')+'</div><div class="row">'
 +items().map(k=>PROT.indexOf(k)>=0?'<span class="chip on" style="opacity:.6">'+E(name(k))+' 🔒</span>':ch('mn_set','hide',E(k),hide.indexOf(k)<0,E(name(k)))).join('')+'</div>'
 +(()=>{let ms=[];try{ms=Array.isArray(MODULES)?MODULES:[]}catch(e){}if(!ms.length)return'';
   return'<details style="margin-top:6px"><summary class="m">'+T('خاموش کردن کامل یک بخش (برای همه‌ی تم‌ها؛ داده‌هایش حذف نمی‌شود)','Turn a section fully off (all themes; its data is kept)')+'</summary><div class="row">'+ms.map(m=>'<label class="chip" style="margin:3px"><input type="checkbox" data-mc="mod:tog:'+E(m.id)+'" '+(modOn(m.id)?'checked':'')+'> '+E(m.name)+'</label>').join('')+'</div></details>'})()
 +'<p class="m">'+T('این تنظیمات فقط برای تم فعلی‌اند و با عوض‌کردن تم، تنظیم همان تم برمی‌گردد. آیتم تازه‌ی منو خودکار نمایان می‌شود. شکل منو (پایین/بالا/کناری) در پیش‌نمایش هر تم است.','These apply to the current theme only; switching themes brings back that theme\'s own setup. New menu items appear automatically. Menu shape (bottom/top/side) lives in each theme preview.')+'</p>'
 +'<div class="row"><button class="chip" data-a="mn_reset">↺ '+T('برگرداندن به پیش‌فرض تم','Reset to theme default')+'</button></div>'}
function node(){let c=document.getElementById('menucard');if(!c){c=document.createElement('div');c.id='menucard';c.className='c'}c.innerHTML=html();return c}
const refresh=()=>{const c=document.getElementById('menucard');if(c)c.innerHTML=html()};
H.mn_set=e=>{const k=e.dataset.k,v=e.dataset.v,m=MN();
 if(k==='lb'){if(v)m.lb=v;else delete m.lb}
 else if(k==='w'){if(m.w)delete m.w;else m.w=1}
 else if(k==='sh'){if(m.sh)delete m.sh;else m.sh=1}
 else if(k==='hd'){if(v&&v!=='0')m.hd=v;else delete m.hd}
 else if(k==='cr'){if(v==='sharp'||v==='round')m.cr=v;else delete m.cr}
 else if(k==='hide'){const a=Array.isArray(m.hide)?m.hide:[],i=a.indexOf(v);if(PROT.indexOf(v)>=0)return;if(i>=0)a.splice(i,1);else a.push(v);m.hide=a;if(!a.length)delete m.hide}
 save();apply();refresh()};
H.mn_reset=()=>{const X=SKX(),id=sid();if(X[id])delete X[id].mn;save();apply();refresh();toast(T('منو به پیش‌فرض تم برگشت','Menu reset to theme default'))};
const unit=k=>k==='gp'?'px':'٪';
document.addEventListener('input',e=>{const t=e.target,k=t&&t.dataset&&t.dataset.mnr;if(!k||!R[k])return;const m=MN();m[k]=+t.value;apply();const s=document.getElementById('mn-v-'+k);if(s)s.textContent=t.value+unit(k)});
document.addEventListener('change',e=>{const t=e.target,k=t&&t.dataset&&t.dataset.mnr;if(!k||!R[k])return;const m=MN();if(k!=='gp'&&m[k]===R[k][3])delete m[k];save();apply()});
{const _a=window.applySkin||(typeof applySkin==='function'?applySkin:null);
 if(_a){applySkin=function(){const r=_a.apply(this,arguments);apply();return r}}}
const _rn=typeof render==='function'?render:null;
if(_rn){render=function(){const r=_rn.apply(this,arguments);try{apply()}catch(e){}return r}}
apply();
window.daniMenuCard={node,apply};
})();
