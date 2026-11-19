/* v151 — آکادمی: یادگیری (یک نمای درختی؛ مرور/کارت/خطا/نشانک از داخل درس‌ها) | آزمون | منابع (یکی) | ورود و مدیریت (جدا).
   v148 — آکادمی: ۴ بخش به‌جای ۷+۸ زبانه (فقط جابه‌جایی؛ هیچ قابلیت و داده‌ای حذف نمی‌شود)
   یادگیری (درس‌ها · دوره‌ها) | مرور (صف مرور · فلش‌کارت · دفترچه خطا · نشانک) | آزمون (مرکز آزمون · ثبت دستی · گزارش) | منابع (منابع من · منابع دوره‌ها · ورود و مدیریت).
   زبانه‌های قدیمی همان صفحه‌ها را نشان می‌دهند؛ فقط ردیف دوم/دوم‌گانه‌ی تکراری پنهان است. این فایل باید بعد از academy.js، courses.js و افزونه‌ی «درس‌ها» بارگذاری شود. */
(function(){'use strict';
const T=window.daniT||function(a){return a};
/* هر نما: [کلید، گروه، زبانه‌ی پلنر (zMS.acd.tab)، زبانه‌ی دوره‌ها (CR.tab)، فارسی، انگلیسی] */
const V=[['courses','A','courses','home','درس‌ها','Subjects'],['learn','A','learn','','درس‌های قدیمی','Old lessons'],
 ['review','A','review','','صف مرور','Review queue'],['cards','A','cards','','فلش‌کارت‌ها','Flashcards'],['errors','A','courses','errors','دفترچه خطا','Error notebook'],['bm','A','courses','review','نشانک و یادداشت','Bookmarks'],
 ['quiz','C','courses','quiz','مرکز آزمون','Exam center'],['tests','C','tests','','ثبت دستی','Manual log'],['report','C','courses','report','گزارش پیشرفت','Progress report'],['rep2','C','report','','گزارش یادگیری','Learning report'],
 ['sources','D','courses','sources','منابع','Resources'],['res','D','res','','منابع من','My resources'],['manage','M','courses','manage','ورود و مدیریت','Import & manage']];
const G=[['A','🎓','یادگیری','Learn'],['C','🎯','آزمون','Exams'],['D','📚','منابع','Resources'],['M','⚙','ورود و مدیریت','Import & manage']];
const RV=['review','cards','errors','bm','learn'];
const CRs=()=>{try{return window.daniCourses&&window.daniCourses.state}catch(e){return null}};
function cur(){const z=(zMS.acd&&zMS.acd.tab)||'',c=CRs(),ct=c?c.tab:'';
 if(z==='courses'){const m=V.find(v=>v[2]==='courses'&&v[3]===ct);if(m)return m;
   return V[0]}
 return V.find(v=>v[2]===z&&!v[3])||V[0]}
const dueN=()=>{try{return srsDue().length}catch(e){return 0}};
const errN=()=>{try{const c=CRs();return c?c.cache.errors.filter(e=>!e.resolved).length:0}catch(e){return 0}};
const oldOn=()=>{try{const x=extIndex().find(i=>i.id==='acadlessons');return !!x&&x.on!==false}catch(e){return false}};
function tabsHTML(){const c=cur(),g=c[1];
 const top=G.map(x=>{const first=V.find(v=>v[1]===x[0]);const n=x[0]==='A'?dueN()+errN():0;
   return'<button class="chip '+(g===x[0]?'on':'')+'" data-a="acd3_go" data-k="'+first[0]+'">'+x[1]+' '+T(x[2],x[3])+(n?' ('+fa(n)+')':'')+'</button>'}).join('');
 let sub='';
 if(g==='A'&&RV.indexOf(c[0])>=0){const ks=['courses','review','cards','errors','bm'].concat(oldOn()?['learn']:[]);
  sub=ks.map(k=>{const v=V.find(x=>x[0]===k);return'<button class="chip sm '+(k===c[0]?'on':'')+'" data-a="acd3_go" data-k="'+k+'">'+(k==='courses'?'‹ ':'')+T(v[4],v[5])+'</button>'}).join('')}
 else if(g==='C')sub=V.filter(v=>v[1]==='C').map(v=>'<button class="chip sm '+(v[0]===c[0]?'on':'')+'" data-a="acd3_go" data-k="'+v[0]+'">'+T(v[4],v[5])+'</button>').join('');
 return'<div class="mrow a3top">'+top+'</div>'+(sub?'<div class="mrow a3sub">'+sub+'</div>':'')}
H.acd3_go=e=>{const v=V.find(x=>x[0]===e.dataset.k);if(!v)return;const c=CRs();if(v[0]==='courses'&&c){c.courseId='';c.lessonId=''}
 if(v[2]==='courses'&&c&&typeof H.crs_tab==='function'){zMS.acd.tab='courses';H.crs_tab({dataset:{k:v[3]}});try{render()}catch(x){}return}
 try{if(c&&c.quiz&&typeof H.crs_qpause==='function'){}}catch(x){}
 zMS.acd.tab=v[2];try{render()}catch(x){console.error(x)}window.scrollTo(0,0)};
/* نشانگر «ردیف تب دوره‌ها» ( #crs>.c:first-child ) و تب‌های قدیمی با CSS پنهان می‌شود */
(function css(){if(document.getElementById('acd3-css'))return;const s=document.createElement('style');s.id='acd3-css';
 s.textContent='#crs>.c:first-child{display:none!important}.a3sub{margin-top:6px}.chip.sm{font-size:.82em;padding:4px 10px}.a3top .chip{font-weight:600}';document.head.appendChild(s)})();
try{acdTabs=tabsHTML}catch(e){console.error('acd3',e)}
window.daniAcd3={cur,V,G};
})();
