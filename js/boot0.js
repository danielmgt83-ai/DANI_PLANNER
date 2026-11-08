"use strict";
/* DANI · boot0.js (v91) — بخش اولِ راه‌اندازی که باید دقیقاً همان‌جای قدیمی (قبل از courses.js) اجرا شود:
   صفحه از ?go= و بارگذاری افزونه‌ها. (اگر دیرتر اجرا شود، افزونه‌ی درس‌ها تب «دوره‌ها»ی آکادمی را می‌پوشاند.) */
try{const q=new URLSearchParams(location.search).get('go');if(q==='log'){page='dash';dt='today'}else if(['home','dl','qt','acd','hab','rem','set','res'].includes(q))page=q}catch(e){}
try{extLoadAll()}catch(e){console.error('ext',e)}
