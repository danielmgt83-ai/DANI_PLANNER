"use strict";
/* DANI · setnav.js — تنظیمات به‌شکل «فهرست ← صفحه‌ی جدا ← برگشت».
   وقتی از منو وارد «تنظیمات» می‌شوی، اول یک فهرست ردیفی (آیکون + عنوان + توضیح) می‌بینی؛ هر ردیف همان کارت‌های قبلی همان بخش را در یک صفحه‌ی جدا با دکمه‌ی برگشت نشان می‌دهد.
   هیچ کارت و قابلیتی حذف نمی‌شود: فقط کارت‌های موجودِ هر تب بعد از رندر دسته‌بندی و نشان/پنهان می‌شوند (CSS).
   ورودهای دیگر (اعلان‌ها، میانبرها، جستجو) همان نمای قدیمیِ تب‌ها را می‌بینند. دکمه‌ی «نمای تب‌ها» پایین فهرست هم نمای قدیمی را برمی‌گرداند.
   وضعیت: window.daniSetSub — undefined=نمای قدیمی · ''=فهرست · کلید=صفحه‌ی آن بخش. بعد از همه‌ی render-wrapperهای تنظیمات (قبل از boot.js) بارگذاری شود. */
(function(){
const T=window.daniT;
const SEC=[
 {k:'lang',i:'🌐',tab:'look',t:['زبان و تقویم','Language & calendar'],s:['زبان برنامه، تقویم شمسی یا میلادی','App language, Jalali or Gregorian calendar'],kw:'language calendar jalali gregorian date زبان تقویم شمسی میلادی تاریخ انگلیسی فارسی'},
 {k:'look',i:'🎨',tab:'look',t:['ظاهر و تم','Look & themes'],s:['تم‌ها، استودیو و بسته‌ی تم، آیکون‌ها، حس برنامه','Themes, studio & packs, icons, app feel'],kw:'theme skin studio pack icon look feel style تم پوسته استودیو بسته آیکون ظاهر حس سبک رنگ'},
 {k:'quote',i:'💬',tab:'look',t:['جمله‌ها و انگیزه','Sentences & motivation'],s:['جمله‌های صفحه‌ی اصلی، قاب جمله، سطح هشدار ددلاین','Home quotes, quote frame, deadline-level lines'],kw:'quote sentence motivation جمله جملات انگیزه قاب سخن'},
 {k:'menu',i:'🧭',tab:'look',t:['منو و صفحه‌ی خانه','Menu & home'],s:['بخش‌های منو، نمایش خانه، کارت‌ها','Menu sections, home display, cards'],kw:'menu home sections modules calm menu منو خانه بخش ماژول کارت نمایش'},
 {k:'notif',i:'🔔',tab:'time',t:['اعلان‌ها و صدا','Notifications & sound'],s:['اجازه، صدا، زمان‌ها و تکرار، گروه‌بندی و تاریخچه','Permission, sound, times & repeats, grouping'],kw:'notification alert sound reminder repeat check-in اعلان هشدار صدا یادآور تکرار زنگ'},
 {k:'widget',i:'🧩',tab:'time',t:['ویجت و اعلان زنده','Widget & live notification'],s:['ویجت صفحه‌ی گوشی، اعلان سنجاق‌شده، دکمه‌ی راهنما','Home-screen widget, pinned notification, help button'],kw:'widget pinned live help ویجت سنجاق اعلان زنده راهنما'},
 {k:'exam',i:'🎓',tab:'time',t:['حالت امتحان','Exam mode'],s:['ویژه‌ی روزهای نزدیک امتحان','For the days before an exam'],kw:'exam امتحان آزمون'},
 {k:'bk',i:'💾',tab:'data',t:['پشتیبان و داده‌ها','Backup & data'],s:['پشتیبان کامل، همگام‌سازی، بازیافت، ورود CSV','Backup, sync, recycle bin, CSV import'],kw:'backup sync drive restore csv bin recycle import export پشتیبان همگام بازیابی بازیافت ورود خروجی داده'},
 {k:'sec',i:'🔒',tab:'data',t:['امنیت و قفل','Security & lock'],s:['قفل برنامه با رمز','App lock with PIN'],kw:'lock pin security password قفل رمز امنیت'},
 {k:'adv',i:'🧰',tab:'data',t:['افزونه‌ها و پیشرفته','Extensions & advanced'],s:['افزودن ویژگی، گزارش خطا، گروه‌بندی کارت‌ها','Add features, error log, card grouping'],kw:'extension advanced error log group افزونه پیشرفته خطا گزارش گروه‌بندی'}
];
const BY={};SEC.forEach(x=>BY[x.k]=x);
const has=(n,sel)=>n.matches(sel)||!!n.querySelector(sel);
function cls(tab,n){
 if(n.classList.contains('tabs')||n.id==='sqbox'||n.id==='snv')return'_';
 if(has(n,'[data-a="gp_t"]'))return'adv';
 if(tab==='look'){if(has(n,'#langcard'))return'lang';if(n.id==='sntg')return'quote';if(n.id==='menux'||n.id==='homex'||n.id==='fxcard'||n.id==='dashx')return'menu';return'look'}
 if(tab==='time'){if(has(n,'#hfcard'))return'widget';if(has(n,'#excard'))return'exam';return'notif'}
 if(has(n,'#lkcard'))return'sec';if(has(n,'#errcard,#extcard,#uchx'))return'adv';return'bk'}
const ar=()=>document.documentElement.dir==='rtl'||/^fa|ar/.test(document.documentElement.lang||'fa');
const back=()=>ar()?'›':'‹';
function css(){if(document.getElementById('snvcss'))return;const s=document.createElement('style');s.id='snvcss';
 s.textContent='.snv-x{display:none!important}#snv .snr{display:flex;align-items:center;gap:12px;width:100%;text-align:start;margin:0 0 8px;padding:12px 14px;border:1px solid var(--b,#8883);border-radius:14px;background:var(--c,#fff);color:var(--t,inherit);cursor:pointer;font:inherit}'
 +'#snv .snr:active{transform:scale(.99)}#snv .sni{flex:none;display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:color-mix(in srgb,var(--ac,#2563eb) 14%,transparent);font-size:1.25em}'
 +'#snv .snt{flex:1;min-width:0;display:flex;flex-direction:column;line-height:1.5}#snv .snt small{color:var(--m,#8a94a6);font-size:.8em;font-weight:400}#snv .snc{flex:none;width:9px;height:9px;border-left:2px solid var(--m,#8a94a6);border-bottom:2px solid var(--m,#8a94a6);transform:rotate(45deg);margin-inline-end:4px}html[dir=ltr] #snv .snc{transform:rotate(-135deg)}'
 +'#snv .snb{display:flex;align-items:center;gap:10px;margin:0 0 10px}#snv .snb b{font-size:1.05em}#snv .snq{width:100%;margin:0 0 10px}#snv .snl{display:block;margin:6px auto 0;opacity:.8}';
 document.head.appendChild(s)}
function rows(q){q=(q||'').toLowerCase().trim();return SEC.filter(x=>!q||(x.t.join(' ')+' '+x.s.join(' ')+' '+x.kw).toLowerCase().includes(q)).map(x=>'<button class="snr" data-a="snv_open" data-k="'+x.k+'"><span class="sni">'+x.i+'</span><span class="snt"><b>'+T(x.t[0],x.t[1])+'</b><small>'+T(x.s[0],x.s[1])+'</small></span><span class="snc"></span></button>').join('')||'<p class="m">'+T('چیزی پیدا نشد.','Nothing found.')+'</p>'}
function head(sub){const d=document.createElement('div');d.id='snv';d.setAttribute('data-nobi','');
 if(!sub){d.innerHTML='<input class="snq" id="snvq" type="search" placeholder="🔍 '+T('جستجو در تنظیمات…','Search settings…')+'" aria-label="'+T('جستجو','Search')+'"><div id="snvl">'+rows('')+'</div>'}
 else{const x=BY[sub];d.innerHTML='<div class="snb"><button class="chip" data-a="snv_back">'+back()+' '+T('تنظیمات','Settings')+'</button><b>'+x.i+' '+T(x.t[0],x.t[1])+'</b></div>'}
 return d}
function apply(){const sub=window.daniSetSub;if(sub===undefined||sub===null)return;
 const pg=document.getElementById('pg');if(!pg)return;css();
 const sec=sub&&BY[sub];if(sub&&!sec){window.daniSetSub='';return apply()}
 pg.querySelectorAll(':scope>#snv').forEach(n=>n.remove());
 const kids=[...pg.children];let shown=0;
 const fresh=window.daniSetFresh;window.daniSetFresh=0;const vis=[];
 kids.forEach(n=>{const c=cls(stt,n);const show=sec&&c===sub;n.classList.toggle('snv-x',!show);if(show){shown++;vis.push(n)}});
 if(fresh&&vis.length<=2)vis.forEach(n=>{if(n.tagName==='DETAILS')n.open=true});
 const h=head(sub);pg.insertBefore(h,pg.firstChild);
 if(sec&&!shown){const p=document.createElement('p');p.className='m';p.textContent=T('این بخش اینجا چیزی ندارد.','Nothing in this section.');h.appendChild(p)}}
const DEF={look:'look',time:'notif',data:'bk'};
{const _ps=PG.set;PG.set=function(){let sub=window.daniSetSub;if(sub===undefined||sub===null||(sub!==''&&BY[sub]&&BY[sub].tab!==stt))sub=window.daniSetSub=(window.__sntOpen&&stt==='look')?'quote':(DEF[stt]||'');if(sub==='')return'';const x=BY[sub];if(x)stt=x.tab;return _ps.apply(this,arguments)}}
{const _r=render;render=function(){if(page!=='set')window.daniSetSub=undefined;const r=_r.apply(this,arguments);try{if(page==='set')apply()}catch(e){console.error('setnav',e)}return r}}
{const _g=H.go;H.go=function(e){const d=e&&e.dataset;if(d&&d.p==='set')window.daniSetSub=d.s?undefined:'';return _g.apply(this,arguments)}}
H.snv_open=e=>{const x=BY[e.dataset.k];if(!x)return;window.daniSetSub=x.k;window.daniSetFresh=1;stt=x.tab;render();try{window.scrollTo(0,0)}catch(_){}};
H.snv_back=()=>{window.daniSetSub='';render();try{window.scrollTo(0,0)}catch(_){}};
document.addEventListener('input',e=>{if(e.target&&e.target.id==='snvq'){const l=document.getElementById('snvl');if(l)l.innerHTML=rows(e.target.value)}});
})();
