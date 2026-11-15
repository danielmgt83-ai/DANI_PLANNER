"use strict";
/* DANI · boot0.js (v91) — بخش اولِ راه‌اندازی که باید دقیقاً همان‌جای قدیمی (قبل از courses.js) اجرا شود:
   صفحه از ?go= و بارگذاری افزونه‌ها. (اگر دیرتر اجرا شود، افزونه‌ی درس‌ها تب «دوره‌ها»ی آکادمی را می‌پوشاند.) */
try{const q=new URLSearchParams(location.search).get('go');if(q==='log'){page='dash';dt='today'}else if(['home','dl','qt','acd','hab','rem','set','res'].includes(q))page=q}catch(e){}
try{extLoadAll()}catch(e){console.error('ext',e)}

/* v131: اگر datefield.js دیر یا ناقص لود شد، ورودی تاریخ ساده جایگزین می‌شود تا هیچ صفحه‌ای نشکند (datefield.js بعداً جایگزینش می‌کند) */
try{if(!window.daniDF)window.daniDF={shim:1,html:(id,iso,o)=>'<input type="date" id="'+id+'" value="'+(iso||'')+'" style="width:100%">',get:id=>{const e=document.getElementById(id);return e&&e.value||''}}}catch(e){}
