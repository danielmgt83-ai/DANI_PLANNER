"use strict";
/* DANI · focus.js (v162.3) — «تمرکز در آکادمی»: وقتی داخل درس، آزمون یا مرور فلش‌کارت هستی همهٔ شلوغی‌ها
   (سربرگ برنامه، ثبت خودکار زمان، Good morning، کارت Academy و زبانه‌ها، منوی برنامه) پنهان می‌شود و فقط یک نوار باریک می‌ماند:
   ← برگشت · عنوان و پیشرفت · ⋮ (نمایش منوی برنامه، خروج از تمرکز، خاموش/روشن کردن).
   سنجاق: هر بخشی با کلاس `.acf-pin` (یا صورت سؤال `.crs-stem`) با 📌 بالای صفحه ثابت می‌ماند؛ ساختار برای «متن مشترک چند سؤال».
   تنظیم: db.set.acf (۰ = خاموش، پیش‌فرض روشن). فقط نمایش را عوض می‌کند و هیچ داده‌ای را دست نمی‌زند. باید بعد از courses.js/cards2.js و قبل از keepopen.js بیاید. */
(function(){'use strict';
const T=window.daniT||function(a){return a};
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const st={menu:false,off:false,nav:false,pins:{},prev:'courses',key:''};
const pk=x=>x.classList.contains('crs-stem')?'stem':(x.dataset.pid||'p');
const pinned=(k,x)=>st.pins[k]!==undefined?st.pins[k]:!x.classList.contains('crs-stem');
const CRs=()=>{try{return window.daniCourses&&window.daniCourses.state}catch(e){return null}};
const on=()=>{try{return db.set.acf!==0}catch(e){return true}};
/* حالت تمرکز فعلی: {k:'lesson'|'quiz'|'review', title, sub, back} یا null */
function mode(){try{if(page!=='acd')return null;const t=zMS.acd.tab,C=CRs();
 if(t==='courses'&&C&&C.loaded){
  if(C.tab==='quiz'&&C.quiz){const a=C.quiz,n=(a.qids||[]).length;return{k:'quiz',title:(a.mode==='practice'?T('تمرین','Practice'):T('آزمون','Exam'))+' · '+T('سؤال','Q')+' '+fa((C.qi||0)+1)+' '+T('از','of')+' '+fa(n),sub:(C.ix.courses.get(a.courseId)||{}).title||''}}
  if(C.tab==='courses'&&C.lessonId){const l=C.ix.lessons.get(C.lessonId),c=C.ix.courses.get(C.courseId);return{k:'lesson',title:(l&&l.title)||T('درس','Lesson'),sub:(c&&c.title)||''}}}
 if(t==='review'&&window.daniCards2&&daniCards2.cur&&daniCards2.cur()){return{k:'review',title:T('مرور فلش‌کارت‌ها','Flashcard review'),sub:T('مانده: ','Due: ')+fa(srsDue().length)}}
 }catch(e){}return null}
function back(m){try{
 if(m.k==='lesson')return H.crs_back();
 if(m.k==='quiz')return H.crs_qpause();
 zMS.acd.tab=(st.prev&&st.prev!=='review')?st.prev:'courses';AR.show=false;render();window.scrollTo(0,0)}catch(e){console.error(e)}}
let lastM=null;
function apply(){const h=document.documentElement,pg=document.getElementById('pg');if(!pg)return;
 const t=(typeof zMS!=='undefined'&&zMS.acd)?zMS.acd.tab:'';if(page==='acd'&&t&&t!=='review')st.prev=t;
 const m=on()?mode():null;lastM=m;const k=m?m.k:'';
 if(!m||st.off&&st.key===k){h.dataset.acf='0';if(!m)st.off=false;st.menu=false;const old=document.getElementById('acfbar');if(old)old.remove();
  if(!on()&&mode()&&!document.getElementById('acfon')){const b=document.createElement('div');b.id='acfon';b.className='acf-on np';b.innerHTML='<button class="chip sm" data-a="acf_tog">🎯 '+T('تمرکز','Focus')+'</button>';pg.insertBefore(b,pg.firstChild)}
  return}
 if(st.key!==k){st.key=k;st.off=false}
 h.dataset.acf='1';h.dataset.acfn=st.nav?'1':'0';
 let bar=document.getElementById('acfbar');if(bar)bar.remove();
 bar=document.createElement('div');bar.id='acfbar';bar.className='acfbar np';
 bar.innerHTML='<button class="acfb" data-a="acf_back" aria-label="back">← '+T('برگشت','Back')+'</button><div class="acft"><b>'+E(m.title)+'</b><small>'+E(m.sub||'')+'</small></div><button class="acfb" data-a="acf_menu" aria-label="menu">⋮</button>'
  +(st.menu?'<div class="acfm"><button class="chip" data-a="acf_nav">'+(st.nav?'✓ ':'')+T('نمایش منوی برنامه','Show app menu')+'</button><button class="chip" data-a="acf_exit">'+T('خروج از تمرکز (فقط همین صفحه)','Leave focus (this page only)')+'</button><button class="chip" data-a="acf_tog">'+T('خاموش کردن تمرکز در آکادمی','Turn focus off')+'</button></div>':'');
 pg.insertBefore(bar,pg.firstChild);
 /* علامت‌گذاری بخش‌هایی که باید پنهان شوند */
 [...pg.children].forEach(c=>{if(c!==bar&&c.matches&&c.matches('div.c')&&!c.id&&c.querySelector(':scope>h3')&&/Academy|آکادمی/.test((c.querySelector(':scope>h3')||{}).textContent||'')&&c.querySelector('.tabs,.mrow'))c.classList.add('acf-h')});
 const crs=document.getElementById('crs');if(crs){const f=crs.firstElementChild;if(f&&f.matches('div.c')&&f.querySelector('.tabs'))f.classList.add('acf-h');crs.querySelectorAll(':scope>.a4cr').forEach(e=>e.classList.add('acf-h'))}
 /* سنجاق: صورت سؤال (پیش‌فرض آزاد) و هر بخش `.acf-pin` (مثل متن مشترک؛ پیش‌فرض سنجاق) */
 document.querySelectorAll('.crs-stem,.acf-pin').forEach(x=>{x.classList.add('acf-pin');const k=pk(x);x.classList.toggle('on',pinned(k,x));if(!x.querySelector(':scope>.acf-pb'))x.insertAdjacentHTML('afterbegin','<button class="chip sm acf-pb np" data-a="acf_pin" data-k="'+E(k)+'" aria-label="pin">📌</button>')})}
H.acf_back=()=>{if(lastM)back(lastM)};
H.acf_menu=()=>{st.menu=!st.menu;apply()};
H.acf_nav=()=>{st.nav=!st.nav;apply()};
H.acf_exit=()=>{st.off=true;st.menu=false;apply()};
H.acf_tog=()=>{db.set.acf=on()?0:1;try{save()}catch(e){}st.off=false;st.menu=false;const o=document.getElementById('acfon');if(o)o.remove();render()};
H.acf_pin=e=>{const k=(e&&e.dataset&&e.dataset.k)||'stem',x=e.closest('.acf-pin');st.pins[k]=!pinned(k,x||document.createElement('div'));apply()};
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{apply()}catch(e){console.error('focus',e)}return r}}
window.daniFocus={mode,apply,st};
})();
