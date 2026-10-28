"use strict";
/* DANI · qa-more.js — جستجوی سراسری «دسترسی سریع»: همه‌ی قابلیت‌ها و تنظیمات + داده‌های خودت (فعالیت‌ها، موعدها، عادت‌ها، یادآورها، یادداشت‌ها).
   به فهرست quickaccess.js اضافه می‌شود؛ چیزی را عوض یا حذف نمی‌کند. */
(function(){
const QA=window.daniQuickAccess;if(!QA)return;
const T=window.daniT;
const F=window.daniQAFn=window.daniQAFn||{};
const sc=sel=>setTimeout(()=>{const e=document.querySelector(sel);if(e)e.scrollIntoView({block:'start'})},350);
const to=(id,sel)=>()=>{QA.go(id);if(sel)sc(sel)};
const dock=k=>()=>{if(window.daniDockOpen)window.daniDockOpen(k)};
const modalCard=fn=>()=>{let h='';try{h=fn()}catch(e){}modal('<div>'+(h||'')+'</div><div class="row" style="margin-top:12px"><button class="p" data-a="h2_close">'+T('تمام','Done')+'</button></div>')};
const X=[
 ['snd','تنظیمات','صدای اعلان‌ها (زنگ، یادآور، عادت‌ها)','Notification sounds','gear','صدا آهنگ زنگ اعلان رینگتون ringtone sound alarm','x:snd',to('st-time','#sccard')],
 ['nhealth','تنظیمات','سلامت اعلان‌ها','Notification health','gear','اعلان مجوز باتری آلارم دقیق notification permission battery','x:nhealth',to('st-time','#nthealth')],
 ['hstyle','تنظیمات','سبک خانه (جدید / کلاسیک)','Home style (new / classic)','look','خانه سبک چیدمان کلاسیک جدید home style layout','x:hstyle',to('st-look','#h2style')],
 ['hcust','پلنر','شخصی‌سازی خانه','Customize home','look','شخصی سازی خانه بخش ترتیب customize home sections',"x:hcust",()=>{QA.go('home');setTimeout(()=>{if(H.h2_edit)H.h2_edit()},250)}],
 ['lang','تنظیمات','زبان (فارسی / English)','Language','look','زبان انگلیسی فارسی english language','x:lang',to('st-look','#langcard')],
 ['calt','تنظیمات','نوع تقویم (شمسی / میلادی)','Calendar type (Jalali / Gregorian)','look','تقویم شمسی میلادی جلالی calendar jalali gregorian','x:calt',to('st-look')],
 ['dockcfg','تنظیمات','نوار ابزار سریع پایین صفحه','Bottom quick toolbar','gear','نوار پایین ابزار سریع toolbar dock','x:dockcfg',dock('cfg')],
 ['ql','کارهای سریع','ثبت ۵ ثانیه‌ای','5-second log','bolt','ثبت سریع فعالیت quick log','x:ql',dock('ql')],
 ['tk','کارهای سریع','یک کار برای امروز','Add a task for today','plan','افزودن کار برنامه امروز task add plan','x:tk',dock('tk')],
 ['qk','کارهای سریع','شروع سریع (کرنومتر)','Quick start','bolt','شروع کرنومتر تایمر stopwatch start','x:qk',dock('qk')],
 ['rh','کارهای سریع','چرخه‌ی امروز (برنامه ← اجرا ← بازبینی)','Today\'s rhythm','today','چرخه زنجیره streak برنامه بازبینی rhythm','x:rh',dock('rh')],
 ['pm','کارهای سریع','پومودورو و حالت تمرکز','Pomodoro & focus mode','today','پومودورو تمرکز pomodoro focus','x:pm',dock('pm')],
 ['nx','کارهای سریع','بعدی چی؟ (پیشنهاد خودکار)','What next?','today','بعدی چی پیشنهاد اولویت next suggestion','x:nx',dock('nx')],
 ['cap','پلنر','کپسول (نوشتن، ویرایش، حذف)','Capsule (write, edit, delete)','notes','کپسول دیروز تعهد فردا capsule commitment','x:cap',()=>{if(H.cap_edit)H.cap_edit()}],
 ['eod','پلنر','یادداشت پایان روز','End-of-day note','notes','یادداشت پایان روز چه یاد گرفتم مانع مرور شب eod note','x:eod',to('today')],
 ['insight','گزارش','الگوی تو (بهترین ساعت‌ها)','Your pattern (best hours)','chart','الگو بهترین ساعت روز بهره‌وری insight productivity',"x:insight",modalCard(()=>window.daniInsightCard&&window.daniInsightCard())],
 ['guide','راهنما','راهنمای شروع قدم‌به‌قدم','Getting-started guide','bolt','راهنما شروع آموزش مرحله onboarding tutorial help guide','x:guide',()=>{if(H.ob_open)H.ob_open()}],
 ['abk','تنظیمات','پشتیبان خودکار روی گوشی','Automatic phone backup','data','پشتیبان خودکار بکاپ auto backup','x:abk',to('st-data')],
 ['pcal','تنظیمات','افزودن به تقویم گوشی','Add to phone calendar','time','تقویم گوشی موعد calendar phone','x:pcal',to('st-time')]
];
X.forEach(a=>{const id='x-'+a[0];if(QA.byid.has(id))return;F[a[0]]=a[7];const e={id,g:a[1],fa:a[2],en:a[3],ic:a[4],kw:a[5],t:{fn:a[6]}};QA.catalog.push(e);QA.byid.set(id,e)});
/* داده‌های خودت */
function dyn(toks,nz){const out=[],push=(id,g,fa,ic,run)=>{if(out.length>=14)return;let e=QA.byid.get(id);if(!e){e={id,g,fa,en:g,ic,kw:'',t:{fn:'x:'+id}};QA.byid.set(id,e)}F[id]=run;e.fa=fa;out.push(e)};
  const hit=s=>{const h=nz(s);return toks.every(t=>h.includes(t))};
  try{(db.acts||[]).filter(a=>a&&a.name&&hit(a.name)).slice(0,4).forEach(a=>push('d-a'+a.id,T('فعالیت‌ها','Activities'),a.name,'acts',()=>QA.go('acts')))}catch(e){}
  try{(zDL().items||[]).filter(d=>d&&d.title&&hit(d.title)).slice(0,4).forEach(d=>push('d-d'+d.id,T('موعدها','Deadlines'),d.title+' · '+fmtD(d.dt),'dl',()=>QA.go('dl-up')))}catch(e){}
  try{(zHB().items||[]).filter(h=>h&&h.name&&hit(h.name)).slice(0,3).forEach(h=>push('d-h'+h.id,T('عادت‌ها','Habits'),h.name,'hab',()=>QA.go('hab')))}catch(e){}
  try{(zRM().items||[]).filter(r=>r&&r.title&&hit(r.title)).slice(0,3).forEach(r=>push('d-r'+r.id,T('یادآوری‌ها','Reminders'),r.title,'rem',()=>QA.go('rem-up')))}catch(e){}
  try{(db.notes||[]).filter(n=>n&&hit((n.title||'')+' '+(n.text||n.body||''))).slice(0,3).forEach(n=>push('d-n'+n.id,T('یادداشت‌ها','Notes'),String(n.title||n.text||n.body||'').slice(0,40),'notes',()=>QA.go('notes')))}catch(e){}
  return out}
window.daniQADyn=dyn;
})();
