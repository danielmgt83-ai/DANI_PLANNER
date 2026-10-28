/* ===== DANI Quick Access (دسترسی سریع) v1 — ماژول افزوده؛ هیچ بخشی از پلنر را حذف یا بازنویسی نمی‌کند ===== */
(function(){
'use strict';
const KEY='dani_qa_v1';           /* پیشوند dani_ ⇒ در پشتیبان‌های کامل پلنر و پشتیبان «همه‌چیز» خودکار می‌آید */
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fd=n=>{try{return fa(n)}catch(e){return String(n)}};
const HOSTIC=(typeof ICONS!=='undefined'&&ICONS)||{};
/* آیکون‌های خودمان برای مقصدهایی که آیکون پلنر ندارند (24×24، خطی) */
const MI={
 bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
 star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
 book:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
 course:'<path d="M3 8l9-4 9 4-9 4z"/><path d="M7 10.5V15c0 1.4 2.2 3 5 3s5-1.6 5-3v-4.5"/>',
 cards:'<rect x="3" y="7" width="14" height="13" rx="2"/><path d="M7 4h12a2 2 0 0 1 2 2v11"/>',
 exam:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8.5 11l2 2 4-4M8.5 17h7"/>',
 quiz:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.1 1-1.1 1.8M12 17h.01"/>',
 err:'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
 mark:'<path d="M6 3h12v18l-6-4-6 4z"/>',
 src:'<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
 imp:'<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>',
 shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
 up:'<path d="M12 21V9M7 14l5-5 5 5M4 4h16"/>',
 chart:'<path d="M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-8"/>',
 pen:'<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/>',
 x:'<path d="M6 6l12 12M18 6L6 18"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 left:'<path d="M15 5l-7 7 7 7"/>',right:'<path d="M9 5l7 7-7 7"/>',
 timeline:'<path d="M5 4v16M5 7h9M5 12h13M5 17h7"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>'
};
const svg=(k,cls)=>'<svg class="'+(cls||'qa-i')+'" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+(HOSTIC[k]||MI[k]||MI.bolt)+'</svg>';
const have=()=>typeof window.daniCourses!=='undefined';
/* ---------- فهرست مقصدها ---------- */
const C=[
 {id:'home',g:'پلنر',fa:'خانه',en:'Home',ic:'home',kw:'شروع داشبورد اصلی',t:{page:'home'}},
 {id:'today',g:'پلنر',fa:'ثبت فعالیت و امروز',en:'Timer · log today',ic:'today',kw:'تایمر زمان‌سنج شروع ثبت timer start log فعالیت',t:{page:'dash',dt:'today'}},
 {id:'plan',g:'پلنر',fa:'برنامه',en:'Plan',ic:'plan',kw:'برنامه‌ریزی طرح هفتگی schedule',t:{page:'dash',dt:'plan'}},
 {id:'acts',g:'پلنر',fa:'فعالیت‌ها و دسته‌ها',en:'Activities',ic:'acts',kw:'فعالیت دسته افزودن activities',t:{page:'dash',dt:'acts'}},
 {id:'goals',g:'پلنر',fa:'اهداف',en:'Goals',ic:'goals',kw:'هدف goals',t:{page:'dash',dt:'goals'}},
 {id:'cal',g:'پلنر',fa:'تقویم',en:'Calendar',ic:'cal',kw:'تقویم تاریخ جلالی calendar',t:{page:'dash',dt:'cal'}},
 {id:'notes',g:'پلنر',fa:'یادداشت‌ها',en:'Notes',ic:'notes',kw:'یادداشت نوشته note',t:{page:'dash',dt:'notes'}},
 {id:'rep',g:'گزارش',fa:'گزارش و خروجی',en:'Reports & export',ic:'rep',kw:'گزارش خروجی اکسل pdf report export',t:{page:'res',tab:'rep'}},
 {id:'stats',g:'گزارش',fa:'آمار و روند',en:'Stats & trends',ic:'stats',kw:'آمار روند statistics',t:{page:'res',tab:'stats'}},
 {id:'sum',g:'گزارش',fa:'نتیجه‌گیری',en:'Conclusions',ic:'chart',kw:'نتیجه جمع‌بندی summary',t:{page:'res',tab:'sum'}},
 {id:'charts',g:'گزارش',fa:'نمودارها',en:'Charts',ic:'chart',kw:'نمودار چارت charts',t:{page:'res',tab:'charts'}},
 {id:'detail',g:'گزارش',fa:'جزئیات',en:'Details',ic:'notes',kw:'جزئیات ریز detail',t:{page:'res',tab:'detail'}},
 {id:'time',g:'گزارش',fa:'خط زمانی روز',en:'Day timeline',ic:'timeline',kw:'خط زمانی timeline',t:{page:'res',tab:'time'}},
 {id:'dl-up',g:'موعدها',fa:'موعدهای پیش‌رو',en:'Upcoming deadlines',ic:'dl',kw:'موعد ددلاین سررسید deadline',t:{page:'dl',tab:'up'}},
 {id:'dl-past',g:'موعدها',fa:'موعدهای گذشته',en:'Past deadlines',ic:'dl',kw:'موعد گذشته',t:{page:'dl',tab:'past'}},
 {id:'dl-arch',g:'موعدها',fa:'بایگانی موعدها',en:'Archive',ic:'dl',kw:'بایگانی آرشیو',t:{page:'dl',tab:'arch'}},
 {id:'dl-all',g:'موعدها',fa:'همه‌ی موعدها',en:'All deadlines',ic:'dl',kw:'همه',t:{page:'dl',tab:'all'}},
 {id:'hab',g:'عادت‌ها',fa:'عادت‌ها',en:'Habits',ic:'hab',kw:'عادت روزانه habit',t:{page:'hab'}},
 {id:'rem-up',g:'یادآوری‌ها',fa:'یادآوری‌های آینده',en:'Upcoming reminders',ic:'rem',kw:'یادآوری آلارم reminder',t:{page:'rem',tab:'up'}},
 {id:'rem-done',g:'یادآوری‌ها',fa:'یادآوری‌های انجام‌شده',en:'Done reminders',ic:'rem',kw:'انجام شده',t:{page:'rem',tab:'done'}},
 {id:'rem-miss',g:'یادآوری‌ها',fa:'یادآوری‌های ازدست‌رفته',en:'Missed reminders',ic:'rem',kw:'ازدست رفته فراموش',t:{page:'rem',tab:'miss'}},
 {id:'rem-set',g:'یادآوری‌ها',fa:'تنظیمات یادآوری',en:'Reminder settings',ic:'gear',kw:'تنظیمات صدا',t:{page:'rem',tab:'set'}},
 {id:'qt-today',g:'جملات',fa:'جمله‌ی امروز',en:'Quote of the day',ic:'qt',kw:'جمله نقل‌قول انگیزشی quote',t:{page:'qt',tab:'today'}},
 {id:'qt-all',g:'جملات',fa:'همه‌ی جمله‌ها',en:'All quotes',ic:'qt',kw:'همه جمله',t:{page:'qt',tab:'all'}},
 {id:'qt-fav',g:'جملات',fa:'علاقه‌مندی‌های جملات',en:'Favorite quotes',ic:'star',kw:'علاقه‌مندی محبوب favorite',t:{page:'qt',tab:'fav'}},
 {id:'qt-mine',g:'جملات',fa:'جمله‌های من',en:'My quotes',ic:'pen',kw:'جمله خودم افزودن',t:{page:'qt',tab:'mine'}},
 {id:'qt-hist',g:'جملات',fa:'جمله‌های قبلی',en:'Previous quotes',ic:'qt',kw:'قبلی تاریخچه',t:{page:'qt',tab:'hist'}},
 {id:'qt-set',g:'جملات',fa:'تنظیمات جملات',en:'Quote settings',ic:'gear',kw:'تنظیمات',t:{page:'qt',tab:'set'}},
 {id:'ac-learn',g:'آکادمی',fa:'درس‌ها (مسیر یادگیری)',en:'Lessons',ic:'book',kw:'درس یادگیری آموزش lesson learn',t:{page:'acd',tab:'learn'}},
 {id:'ac-cards',g:'آکادمی',fa:'فلش‌کارت‌ها',en:'Flashcards',ic:'cards',kw:'فلش کارت لایتنر flashcard',t:{page:'acd',tab:'cards'}},
 {id:'ac-tests',g:'آکادمی',fa:'آزمون‌های آکادمی',en:'Academy tests',ic:'exam',kw:'آزمون تست امتحان test',t:{page:'acd',tab:'tests'}},
 {id:'ac-review',g:'آکادمی',fa:'مرور',en:'Review',ic:'acd',kw:'مرور review',t:{page:'acd',tab:'review'}},
 {id:'ac-report',g:'آکادمی',fa:'گزارش یادگیری',en:'Learning report',ic:'chart',kw:'گزارش یادگیری',t:{page:'acd',tab:'report'}},
 {id:'ac-res',g:'آکادمی',fa:'منابع آکادمی',en:'Academy resources',ic:'src',kw:'منابع',t:{page:'acd',tab:'res'}},
 {id:'cr-home',g:'دوره‌ها',fa:'داشبورد دوره‌ها',en:'Courses dashboard',ic:'acd',kw:'دوره کورس داشبورد course',t:{page:'acd',tab:'courses',crs:'home'},need:'crs'},
 {id:'cr-list',g:'دوره‌ها',fa:'فهرست دوره‌ها و درس‌ها',en:'Courses & lessons',ic:'course',kw:'دوره درس فصل مطالعه',t:{page:'acd',tab:'courses',crs:'courses'},need:'crs'},
 {id:'cr-quiz',g:'دوره‌ها',fa:'تمرین و آزمون دوره‌ها',en:'Course practice & exams',ic:'quiz',kw:'تمرین آزمون تست دوره quiz exam practice',t:{page:'acd',tab:'courses',crs:'quiz'},need:'crs'},
 {id:'cr-err',g:'دوره‌ها',fa:'دفترچه‌ی خطا',en:'Error notebook',ic:'err',kw:'خطا اشتباه غلط error mistakes',t:{page:'acd',tab:'courses',crs:'errors'},need:'crs'},
 {id:'cr-rev',g:'دوره‌ها',fa:'مرور و نشانک دوره‌ها',en:'Course bookmarks',ic:'mark',kw:'نشانک بوکمارک یادداشت bookmark',t:{page:'acd',tab:'courses',crs:'review'},need:'crs'},
 {id:'cr-src',g:'دوره‌ها',fa:'منابع دوره‌ها',en:'Course sources',ic:'src',kw:'منبع کتاب پوشش source',t:{page:'acd',tab:'courses',crs:'sources'},need:'crs'},
 {id:'cr-rep',g:'دوره‌ها',fa:'گزارش پیشرفت دوره‌ها',en:'Course progress report',ic:'chart',kw:'پیشرفت تسلط progress mastery',t:{page:'acd',tab:'courses',crs:'report'},need:'crs'},
 {id:'cr-imp',g:'دوره‌ها',fa:'ورود دوره‌ی جدید',en:'Import a course',ic:'imp',kw:'ورود وارد دوره زیپ import zip manage مدیریت به‌روزرسانی',t:{page:'acd',tab:'courses',crs:'manage'},need:'crs'},
 {id:'st-look',g:'تنظیمات',fa:'ظاهر، تم و زبان',en:'Look, themes & language',ic:'look',kw:'تم اسکین رنگ زبان ظاهر theme skin language dark',t:{page:'set',tab:'look'}},
 {id:'st-time',g:'تنظیمات',fa:'زمان و اعلان‌ها',en:'Time & alerts',ic:'time',kw:'زمان اعلان صدا هشدار notification',t:{page:'set',tab:'time'}},
 {id:'st-data',g:'تنظیمات',fa:'داده‌ها و پشتیبان',en:'Data & backup',ic:'data',kw:'داده پشتیبان بکاپ خروجی ورود backup export import restore',t:{page:'set',tab:'data'}},
 {id:'st-uch',g:'تنظیمات',fa:'مرکز DANI',en:'DANI center',ic:'gear',kw:'مرکز بسته پک ماژول افزونه pack module',t:{page:'set',tab:'uch'}},
 {id:'ac-backup',g:'کارهای سریع',fa:'گرفتن پشتیبان کامل همه‌چیز',en:'Full backup now',ic:'shield',kw:'پشتیبان بکاپ کامل دانلود backup download همه چیز',need:'crsall',t:{fn:'backup'}},
 {id:'ac-restore',g:'کارهای سریع',fa:'بازیابی پشتیبان کامل',en:'Restore full backup',ic:'up',kw:'بازیابی ریستور برگرداندن restore',need:'crsall',t:{page:'set',tab:'data'}}
];
const BYID=new Map(C.map(x=>[x.id,x]));
const DEF_PINS=['today','plan','dl-up','hab','rem-up','qt-today','ac-learn','cr-list','ac-cards','rep','st-look','st-data'];
const avail=x=>!x.need||(x.need==='crs'?have():(typeof H!=='undefined'&&typeof H.crs_allexp==='function'));
/* ---------- ذخیره ---------- */
let MEM=null;
function load(){
  if(MEM)return MEM;
  let s=null;try{s=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
  if(!s||typeof s!=='object')s={};
  s.v=1;s.pins=Array.isArray(s.pins)?s.pins.filter(id=>BYID.has(id)):DEF_PINS.slice();
  s.usage=(s.usage&&typeof s.usage==='object')?s.usage:{};s.recent=Array.isArray(s.recent)?s.recent.filter(id=>BYID.has(id)).slice(0,8):[];
  return MEM=s}
function store(){try{localStorage.setItem(KEY,JSON.stringify(MEM))}catch(e){}}
function bump(id){if(id==='home')return;const s=load(),u=s.usage[id]||(s.usage[id]={n:0,t:0});u.n++;u.t=Date.now();s.recent=[id,...s.recent.filter(x=>x!==id)].slice(0,8);store()}
function topUsed(k){const s=load(),now=Date.now();return Object.entries(s.usage).filter(([id,u])=>BYID.has(id)&&avail(BYID.get(id))&&u.n>=2).map(([id,u])=>[id,u.n*Math.pow(.5,(now-u.t)/(14*864e5))]).sort((a,b)=>b[1]-a[1]).slice(0,k).map(x=>x[0])}
/* ---------- مقصد فعلی و رفتن ---------- */
const crsTab=()=>{try{return daniCourses.state.tab}catch(e){return ''}};
function here(x){const t=x.t;if(!t||t.fn)return false;if(page!==t.page)return false;
  if(t.page==='dash')return dt===t.dt||(t.dt==='today'&&!['plan','acts','goals','cal','notes'].includes(dt));
  if(t.page==='res')return rt===t.tab;if(t.page==='set')return stt===t.tab;
  if(t.page==='acd'){if(zMS.acd.tab!==t.tab)return false;return t.crs?crsTab()===t.crs:true}
  if(zMS[t.page]&&t.tab)return zMS[t.page].tab===t.tab;return true}
let NAVING=false,LASTID='';
function curId(){for(const x of C){if(avail(x)&&here(x))return x.id}return''}
function count(){if(NAVING)return;const id=curId();if(id&&id!==LASTID)bump(id);LASTID=id}
function go(x){
  const t=x.t;if(!t)return;NAVING=true;
  try{
    if(typeof t.fn==='string'&&t.fn.indexOf('x:')===0){NAVING=false;try{close()}catch(e){}const f=window.daniQAFn&&window.daniQAFn[t.fn.slice(2)];if(f)setTimeout(f,60);return}
    if(t.fn==='backup'){NAVING=false;if(typeof H.crs_allexp==='function'){H.crs_allexp({dataset:{}});return}return go(BYID.get('st-data'))}
    document.getElementById('nav').classList.remove('o');
    H.go({dataset:{p:t.page==='dash'?(t.dt==='today'?'timer':t.dt):t.page}});
    if(t.page==='res')H.tab({dataset:{g:'r',k:t.tab}});
    else if(t.page==='set')H.tab({dataset:{g:'s',k:t.tab}});
    else if(t.page==='acd'){zMS.acd.tab=t.tab;if(t.crs&&have()){const S=daniCourses.state;S.tab=t.crs;S.courseId='';S.lessonId='';S.keyId='';render()}else render()}
    else if(zMS[t.page]&&t.tab){zMS[t.page].tab=t.tab;render()}
  }catch(e){console.error('quick-access',e)}
  NAVING=false;LASTID='';count();window.scrollTo(0,0);
}
/* ---------- جست‌وجو ---------- */
const nz=s=>String(s==null?'':s).toLowerCase().replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/[\u200c\u200d\u200f\u200e]/g,' ').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/\s+/g,' ').trim();
function search(q){const toks=nz(q).split(' ').filter(Boolean);if(!toks.length)return[];
  return C.filter(avail).map(x=>{const lab=nz(x.fa),hay=nz(x.fa+' '+x.en+' '+(x.kw||'')+' '+x.g);let sc=0;
    const words=hay.split(' ');for(const tk of toks){if(!hay.includes(tk))return null;sc+=(words.includes(tk)?10:0)+(lab.startsWith(tk)?6:lab.includes(tk)?4:2)}return[x,sc]}).filter(Boolean).sort((a,b)=>b[1]-a[1]).map(r=>r[0]).concat((()=>{try{return window.daniQADyn?window.daniQADyn(toks,nz):[]}catch(e){return[]}})())}
/* ---------- پنل ---------- */
const Q={open:false,q:'',edit:false,sel:0,prevFocus:null};
let ovl=null;
function tile(x,opt){opt=opt||{};const pinned=load().pins.includes(x.id),edit=Q.edit&&opt.pin;
  return'<div class="qa-tw"><button class="qa-t" data-qa="go" data-id="'+x.id+'" title="'+E(x.fa)+'">'+svg(x.ic)+'<span class="qa-l">'+E(x.fa)+'</span>'+(opt.badge?'<span class="qa-n">'+opt.badge+'</span>':'')+'</button>'+
   (edit?'<div class="qa-ed"><button data-qa="mv" data-id="'+x.id+'" data-d="-1" aria-label="جابه‌جایی">'+svg('right','qa-s')+'</button><button data-qa="mv" data-id="'+x.id+'" data-d="1" aria-label="جابه‌جایی">'+svg('left','qa-s')+'</button><button data-qa="pin" data-id="'+x.id+'" aria-label="حذف از سنجاق‌ها" class="qa-x">'+svg('x','qa-s')+'</button></div>':'')+'</div>'}
function row(x,i){const pinned=load().pins.includes(x.id);
  return'<div class="qa-r'+(i===Q.sel?' on':'')+'" data-sel="'+i+'"><button class="qa-rb" data-qa="go" data-id="'+x.id+'">'+svg(x.ic)+'<span class="qa-rt"><b>'+E(x.fa)+'</b><small>'+E(x.g)+' · '+E(x.en)+'</small></span></button><button class="qa-pn'+(pinned?' on':'')+'" data-qa="pin" data-id="'+x.id+'" aria-label="'+(pinned?'برداشتن سنجاق':'سنجاق کردن')+'" title="'+(pinned?'برداشتن سنجاق':'سنجاق کردن')+'">'+svg('star','qa-s')+'</button></div>'}
function body(){
  const s=load();
  if(Q.q.trim()){const res=search(Q.q);if(Q.sel>=res.length)Q.sel=Math.max(0,res.length-1);
    return res.length?'<div class="qa-list">'+res.map(row).join('')+'</div>':'<p class="qa-m">چیزی پیدا نشد. با کلمه‌ی دیگری امتحان کن (مثلاً: آزمون، پشتیبان، تم، موعد).</p>'}
  const pins=s.pins.map(id=>BYID.get(id)).filter(x=>x&&avail(x)),top=topUsed(6),rec=s.recent.map(id=>BYID.get(id)).filter(x=>x&&avail(x)&&x.id!==curId()).slice(0,6);
  let h='<div class="qa-sec"><div class="qa-h"><b>سنجاق‌شده‌ها</b>'+(Q.edit?'<button class="qa-lk" data-qa="reset">بازگشت به پیش‌فرض</button>':'')+'</div>'+(pins.length?'<div class="qa-grid">'+pins.map(x=>tile(x,{pin:1})).join('')+'</div>':'<p class="qa-m">هنوز چیزی سنجاق نکرده‌ای. در «همه‌ی بخش‌ها» با ☆ سنجاق کن.</p>')+'</div>';
  if(top.length)h+='<div class="qa-sec"><div class="qa-h"><b>بیشتر استفاده‌شده</b><small>خودکار، بر اساس کار تو</small></div><div class="qa-grid">'+top.map(id=>{const x=BYID.get(id);return tile(x,{badge:fd(s.usage[id].n)})}).join('')+'</div></div>';
  if(rec.length)h+='<div class="qa-sec"><div class="qa-h"><b>اخیر</b></div><div class="qa-chips">'+rec.map(x=>'<button class="qa-c" data-qa="go" data-id="'+x.id+'">'+svg(x.ic,'qa-s')+E(x.fa)+'</button>').join('')+'</div></div>';
  const groups=[];C.filter(avail).forEach(x=>{let g=groups.find(y=>y[0]===x.g);if(!g)groups.push(g=[x.g,[]]);g[1].push(x)});
  h+='<div class="qa-sec"><div class="qa-h"><b>همه‌ی بخش‌ها</b><small>☆ برای سنجاق‌کردن</small></div>'+groups.map(g=>'<details class="qa-g"'+(Q.edit?' open':'')+'><summary>'+E(g[0])+' <small>('+fd(g[1].length)+')</small></summary><div class="qa-list">'+g[1].map(row).join('')+'</div></details>').join('')+'</div>';
  if(Q.edit)h+='<div class="qa-sec"><button class="qa-lk" data-qa="clr">پاک‌کردن سابقه‌ی «بیشتر استفاده‌شده»</button></div>';
  return h}
function paint(){if(!ovl)return;
  ovl.querySelector('.qa-body').innerHTML=body();
  const e=ovl.querySelector('.qa-edit');if(e){e.classList.toggle('on',Q.edit);e.setAttribute('aria-pressed',Q.edit)}}
function build(){
  if(ovl)return;ovl=document.createElement('div');ovl.id='qa-ovl';ovl.setAttribute('data-nobi','');ovl.hidden=true;
  ovl.innerHTML='<div class="qa-box" role="dialog" aria-modal="true" aria-label="دسترسی سریع"><div class="qa-top"><div class="qa-ttl">'+svg('bolt','qa-i')+'<b>دسترسی سریع</b></div><button class="qa-edit" data-qa="edit" aria-pressed="false">'+svg('pen','qa-s')+' ویرایش</button><button class="qa-close" data-qa="close" aria-label="بستن">'+svg('x','qa-s')+'</button></div><div class="qa-sr">'+svg('search','qa-s')+'<input class="qa-in" type="search" inputmode="search" autocomplete="off" placeholder="جست‌وجو: آزمون، پشتیبان، تم، موعد، تایمر…" aria-label="جست‌وجو"></div><div class="qa-body"></div><div class="qa-ft">Ctrl+K یا / برای باز کردن · ↑↓ و Enter · Esc برای بستن</div></div>';
  document.body.appendChild(ovl);
  ovl.addEventListener('click',e=>{if(e.target===ovl){close();return}
    const b=e.target.closest('[data-qa]');if(!b)return;const a=b.dataset.qa,id=b.dataset.id,s=load();
    if(a==='go'){const x=BYID.get(id);close(true);go(x)}
    else if(a==='close')close();
    else if(a==='edit'){Q.edit=!Q.edit;paint()}
    else if(a==='pin'){const i=s.pins.indexOf(id);if(i>=0)s.pins.splice(i,1);else s.pins.push(id);store();paint();decorateSide()}
    else if(a==='mv'){const i=s.pins.indexOf(id),j=i+(+b.dataset.d);if(i>=0&&j>=0&&j<s.pins.length){[s.pins[i],s.pins[j]]=[s.pins[j],s.pins[i]];store();paint();decorateSide()}}
    else if(a==='reset'){if(confirm('سنجاق‌ها به حالت پیش‌فرض برگردد؟')){s.pins=DEF_PINS.slice();store();paint();decorateSide()}}
    else if(a==='clr'){if(confirm('سابقه‌ی استفاده پاک شود؟')){s.usage={};s.recent=[];store();paint()}}});
  ovl.addEventListener('input',e=>{if(e.target.classList.contains('qa-in')){Q.q=e.target.value;Q.sel=0;paint()}});
  ovl.addEventListener('keydown',e=>{
    if(e.key==='Escape'){e.preventDefault();close();return}
    if(!Q.q.trim())return;const res=search(Q.q);
    if(e.key==='ArrowDown'){e.preventDefault();Q.sel=Math.min(res.length-1,Q.sel+1);paint();scrollSel()}
    else if(e.key==='ArrowUp'){e.preventDefault();Q.sel=Math.max(0,Q.sel-1);paint();scrollSel()}
    else if(e.key==='Enter'&&e.target.classList.contains('qa-in')&&res[Q.sel]){e.preventDefault();const x=res[Q.sel];close(true);go(x)}});
}
function scrollSel(){const e=ovl.querySelector('.qa-r.on');if(e&&e.scrollIntoView)e.scrollIntoView({block:'nearest'})}
function open(){build();Q.q='';Q.sel=0;Q.edit=false;Q.prevFocus=document.activeElement;ovl.hidden=false;document.documentElement.classList.add('qa-lock');paint();
  const i=ovl.querySelector('.qa-in');i.value='';setTimeout(()=>{try{i.focus()}catch(e){}},30)}
function close(skipFocus){if(!ovl||ovl.hidden)return;ovl.hidden=true;document.documentElement.classList.remove('qa-lock');
  if(!skipFocus&&Q.prevFocus&&Q.prevFocus.focus)try{Q.prevFocus.focus()}catch(e){}}
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&ovl&&!ovl.hidden){close();return}
  const t=e.target,typing=t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  if((e.ctrlKey||e.metaKey)&&!e.altKey&&e.key.toLowerCase()==='k'){e.preventDefault();(ovl&&!ovl.hidden)?close():open();return}
  if(e.key==='/'&&!typing&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!(ovl&&!ovl.hidden)){e.preventDefault();open()}
});
/* ---------- افزودن به منو (کپی از لینک «خانه»ی همان تم تا ظاهر هر اسکین حفظ شود) ---------- */
const BOLT=MI.bolt;
function decorate(tries){
  const nav=document.getElementById('nav');if(!nav)return;
  if(nav.querySelector('.qa-nav'))return decorateSide();
  const home=nav.querySelector('a[data-p="home"]');if(!home)return;
  if(!home.querySelector('svg')&&(tries||0)<6){setTimeout(()=>decorate((tries||0)+1),120);return}
  const a=home.cloneNode(true);
  a.className='qa-nav';a.setAttribute('data-a','qa_open');a.removeAttribute('data-p');a.setAttribute('role','button');
  a.setAttribute('title','Quick Access · دسترسی سریع (Ctrl+K)');a.setAttribute('aria-label','Quick Access دسترسی سریع');
  const ic=a.querySelector('svg');if(ic)ic.innerHTML=BOLT;
  const kj=a.querySelector('.kj');if(kj)kj.textContent='速';
  const bi=a.querySelector('.bi');
  if(bi){const b=bi.querySelector('b'),i=bi.querySelector('i');if(b)b.textContent='Quick Access';if(i)i.textContent='دسترسی سریع'}
  else{const w=document.createTreeWalker(a,NodeFilter.SHOW_TEXT);let n,last=null;while(n=w.nextNode())if(n.nodeValue.trim())last=n;if(last)last.nodeValue='دسترسی سریع';else a.appendChild(document.createTextNode('دسترسی سریع'))}
  a.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));
  home.insertAdjacentElement('afterend',a);
  decorateSide();
}
function decorateSide(){
  const nav=document.getElementById('nav');if(!nav)return;
  let side=nav.querySelector('.qa-side');if(side)side.remove();
  const s=load(),pins=s.pins.map(id=>BYID.get(id)).filter(x=>x&&avail(x)).slice(0,6);
  side=document.createElement('div');side.className='qa-side';side.setAttribute('data-nobi','');
  side.innerHTML='<div class="qa-sh">'+svg('bolt','qa-s')+' دسترسی سریع</div><div class="qa-sg">'+pins.map(x=>'<button class="qa-sb" data-qa-side="'+x.id+'" title="'+E(x.fa)+'">'+svg(x.ic,'qa-s')+'<span>'+E(x.fa)+'</span></button>').join('')+'</div><button class="qa-sm" data-qa-side="__all">همه‌ی بخش‌ها و جست‌وجو…</button>';
  nav.appendChild(side);
  requestAnimationFrame(()=>{const r=nav.getBoundingClientRect(),cs=getComputedStyle(nav),vertical=r.height>r.width*1.2&&r.width>=150;side.classList.toggle('show',vertical&&cs.display!=='none')});
}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-qa-side]');if(!b)return;e.preventDefault();e.stopPropagation();
  const id=b.dataset.qaSide;document.getElementById('nav').classList.remove('o');if(id==='__all')open();else go(BYID.get(id))},true);
H.qa_open=()=>{const n=document.getElementById('nav');if(n)n.classList.remove('o');open()};
/* ---------- اتصال به render (بدون تغییر رفتار قبلی) ---------- */
const _render=render;
render=function(){const r=_render.apply(this,arguments);try{decorate();count()}catch(e){console.error('quick-access',e)}return r};
if(typeof i18Tree==='function'){const _i=i18Tree,inQ=n=>{const e=n&&(n.nodeType===3?n.parentNode:n);return!!(e&&e.closest&&e.closest('#qa-ovl,.qa-side,.qa-nav'))};
  i18Tree=function(root){if(!root||inQ(root))return;return _i.apply(this,arguments)}}
const mo=new MutationObserver(()=>{const nav=document.getElementById('nav');if(nav&&!nav.querySelector('.qa-nav'))requestAnimationFrame(()=>decorate())});
const nv=document.getElementById('nav');if(nv)mo.observe(nv,{childList:true});
let rz;window.addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(decorateSide,150)});
/* ---------- CSS ---------- */
const st=document.createElement('style');st.id='qa-css';st.textContent=`
html.qa-lock body{overflow:hidden}
.qa-nav{cursor:pointer}
.qa-side{display:none;margin:12px 4px 4px;padding-top:10px;border-top:1px solid rgba(128,128,128,.35);font-size:12px}
.qa-side.show{display:block}
.qa-sh{display:flex;align-items:center;gap:6px;font-weight:700;opacity:.85;margin:0 4px 6px}
.qa-sg{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.qa-sb,.qa-sm{display:flex;align-items:center;gap:6px;min-height:36px;padding:4px 8px;border-radius:10px;border:1px solid rgba(128,128,128,.35);background:transparent;color:inherit;font:inherit;font-size:12px;cursor:pointer;text-align:start;overflow:hidden}
.qa-sb span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.qa-sb:hover,.qa-sm:hover{border-color:currentColor}
.qa-sm{width:100%;margin-top:6px;justify-content:center;opacity:.85}
.qa-s{width:16px;height:16px;flex:none}.qa-i{width:22px;height:22px;flex:none}
#qa-ovl{position:fixed;inset:0;z-index:99990;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:14px;backdrop-filter:blur(3px)}
#qa-ovl[hidden]{display:none}
.qa-box{width:min(680px,100%);max-height:min(86vh,760px);display:flex;flex-direction:column;background:var(--bg,#111);color:var(--t,#eee);border:1px solid var(--b,#444);border-radius:18px;box-shadow:0 24px 70px rgba(0,0,0,.55);overflow:hidden;font-size:14px}
.qa-top{display:flex;align-items:center;gap:8px;padding:12px 14px 6px}
.qa-ttl{display:flex;align-items:center;gap:8px;flex:1;font-size:16px;color:var(--ac,#7cb4ff)}.qa-ttl b{color:var(--t,#eee)}
.qa-edit,.qa-close{display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:4px 12px;border-radius:10px;border:1px solid var(--b,#444);background:var(--c,#222);color:var(--t,#eee);font:inherit;cursor:pointer}
.qa-edit.on{background:var(--ac,#7cb4ff);color:var(--bg,#000);border-color:var(--ac,#7cb4ff)}
.qa-sr{display:flex;align-items:center;gap:8px;margin:6px 14px 8px;padding:0 12px;border:1px solid var(--b,#444);border-radius:12px;background:var(--c,#222)}
.qa-sr:focus-within{border-color:var(--ac,#7cb4ff)}
.qa-in{flex:1;min-height:44px;border:0;outline:0;background:transparent;color:var(--t,#eee);font:inherit;font-size:15px;min-width:0}
.qa-body{overflow:auto;padding:4px 14px 12px;-webkit-overflow-scrolling:touch}
.qa-ft{padding:8px 14px;font-size:11px;color:var(--m,#999);border-top:1px solid var(--b,#444)}
.qa-sec{margin:10px 0 14px}.qa-h{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}.qa-h b{font-size:13px}.qa-h small,.qa-m{color:var(--m,#999);font-size:12px}
.qa-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.qa-tw{position:relative}
.qa-t{width:100%;min-height:78px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:8px 4px;border-radius:14px;border:1px solid var(--b,#444);background:var(--c,#222);color:var(--t,#eee);font:inherit;cursor:pointer;position:relative}
.qa-t:hover,.qa-t:focus-visible{border-color:var(--ac,#7cb4ff);outline:0}
.qa-t .qa-i{color:var(--ac,#7cb4ff)}
.qa-l{font-size:12px;line-height:1.3;text-align:center;max-width:100%;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.qa-n{position:absolute;top:4px;inset-inline-start:6px;font-size:10px;padding:0 6px;border-radius:99px;background:var(--ac,#7cb4ff);color:var(--bg,#000)}
.qa-ed{position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);display:flex;gap:4px;background:var(--bg,#111);padding:2px;border-radius:99px;border:1px solid var(--b,#444)}
.qa-ed button{width:26px;height:26px;border-radius:50%;border:0;background:var(--c,#222);color:var(--t,#eee);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0}
.qa-ed .qa-x{color:#ef4444}
.qa-chips{display:flex;flex-wrap:wrap;gap:6px}
.qa-c{display:inline-flex;align-items:center;gap:6px;min-height:34px;padding:4px 12px;border-radius:99px;border:1px solid var(--b,#444);background:var(--c,#222);color:var(--t,#eee);font:inherit;font-size:12px;cursor:pointer}
.qa-g{margin:6px 0;border:1px solid var(--b,#444);border-radius:12px;background:var(--c,#222)}
.qa-g summary{cursor:pointer;padding:10px 12px;font-weight:700;list-style:none}.qa-g summary::-webkit-details-marker{display:none}
.qa-g summary:before{content:'▸';display:inline-block;margin-inline-end:8px;transition:transform .15s}.qa-g[open] summary:before{transform:rotate(90deg)}
.qa-list{display:flex;flex-direction:column;gap:2px;padding:0 6px 6px}
.qa-r{display:flex;align-items:center;border-radius:10px}.qa-r.on,.qa-r:hover{background:rgba(128,128,128,.16)}
.qa-rb{flex:1;display:flex;align-items:center;gap:10px;min-height:46px;padding:4px 8px;border:0;background:transparent;color:inherit;font:inherit;cursor:pointer;text-align:start;min-width:0}
.qa-rb .qa-i{color:var(--ac,#7cb4ff)}
.qa-rt{display:flex;flex-direction:column;min-width:0}.qa-rt b{font-size:13px;font-weight:600}.qa-rt small{font-size:11px;color:var(--m,#999);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.qa-pn{width:40px;height:40px;border:0;background:transparent;color:var(--m,#999);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;border-radius:10px}
.qa-pn.on{color:#f5b301}.qa-pn.on svg{fill:#f5b301}
.qa-lk{background:transparent;border:0;color:var(--ac,#7cb4ff);font:inherit;font-size:12px;cursor:pointer;text-decoration:underline;padding:4px}
@media (max-width:640px){
 #qa-ovl{align-items:flex-end;padding:0}
 .qa-box{width:100%;max-height:88vh;border-radius:18px 18px 0 0;padding-bottom:env(safe-area-inset-bottom,0)}
 .qa-grid{grid-template-columns:repeat(3,1fr)}.qa-t{min-height:84px}.qa-ft{display:none}
}`;
document.head.appendChild(st);
decorate();LASTID=curId();
window.daniQuickAccess={byid:BYID,catalog:C,search:search,open:open,close:close,go:id=>go(BYID.get(id)),state:Q,load:load,version:1};
})();

