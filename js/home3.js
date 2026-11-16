/* v134 — خانه: (۱) کارت «موعد بعدی» وقتی موعدی نیست یک ردیف می‌شود (کارت کامل با ۵ سطح هشدار و ۷ ظاهر دست‌نخورده می‌ماند)،
   (۲) «درس بعدی (آکادمی)» وقتی درسی نیست پیام دارد (قبلاً هیچ چیز نمی‌نشست)،
   (۳) وقتی پنجره‌ی شخصی‌سازی/ویرایش باز است، نوار به‌روزرسانی، ثبت-شد و دکمه‌ی راهنما روی دکمه‌های آن نمی‌افتند.
   فقط ظاهر؛ هیچ قابلیتی حذف نشد. */
(function(){'use strict';
const T=window.daniT||function(a){return a};
const st=document.createElement('style');st.id='h3css';
st.textContent=
 /* ۱) کارت موعد خالی = یک ردیف (عنوان + تنظیمات + افزودن) */
 '#dlcard:has(>p[data-ecta]){display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;padding:10px 14px}'
 +'#dlcard:has(>p[data-ecta])>.dlx-h{flex:1;min-width:0}'
 +'#dlcard:has(>p[data-ecta])>p[data-ecta]{display:none}'
 +'#dlcard:has(>p[data-ecta])>.ecta{margin:0!important}'
 +'#dlcard:has(>p[data-ecta]) .dlx-set,#dlcard:has(>p[data-ecta]) .ecta .chip{padding:6px 10px;font-size:12px}'
 /* درس خالی: ردیف کوچک */
 +'.c.h3empty{padding:10px 14px}.c.h3empty h3{margin:0 0 2px}.c.h3empty p{margin:0}'
 /* ۳) زیر پنجره‌ها پوشانده نشود */
 +'body:has(.ov) #updbar{bottom:auto!important;top:calc(10px + env(safe-area-inset-top,0px))}'
 +'body:has(.ov) #qrs,body:has(.ov) #hfab{display:none!important}'
 +'body:has(.ov) #toast{bottom:auto!important;top:12px!important}';
document.head.appendChild(st);
/* ۲) پیام «درس بعدی» خالی؛ HSEC.lesson را افزونه‌ی آکادمی دیرتر می‌سازد، پس چند بار صبر می‌کنیم */
let n=0;const iv=setInterval(function(){
 if(++n>40)return clearInterval(iv);
 try{if(typeof HSEC==='undefined'||!HSEC.lesson||HSEC.lesson.__h3)return;
  const r=HSEC.lesson.r;HSEC.lesson.__h3=1;
  HSEC.lesson.r=function(){let x='';try{x=r.apply(this,arguments)}catch(e){console.error('h3 lesson',e)}
   return x||'<div class="c h3empty"><h3>'+(typeof BH==='function'?BH('Next lesson','درس بعدی'):'درس بعدی')+'</h3><p class="m">'+T('هنوز درسی در آکادمی نیست.','No lesson in the Academy yet.')+'</p></div>'};
  clearInterval(iv)}catch(e){}},500);
})();
