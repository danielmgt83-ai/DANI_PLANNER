"use strict";
/* DANI · emptycta.js — به پیام‌های «خالی» خانه/میزکار دکمه‌ی «قدم اول» اضافه می‌کند (متن‌ها دست‌نخورده می‌مانند). */
(function(){
const T=(fa,en)=>{try{return LANGEN()?en:fa}catch(e){return fa}};
const B=(a,p,k,l)=>'<button class="chip" data-a="'+a+'"'+(p?' data-p="'+p+'"':'')+(k?' data-k="'+k+'"':'')+'>'+l+'</button>';
const RULES=[
 [/هنوز برنامه یا ثبتی برای امروز نیست|No plan or log for today/i,()=>B('go','plan','',T('📝 یک کار برای امروز','📝 Add a task for today'))+B('dk_o','','ql',T('⚡ ثبت ۵ ثانیه‌ای','⚡ 5-sec log'))+B('dk_o','','nx',T('🎯 بعدی چی؟','🎯 What next?'))],
 [/برنامه‌ای برای امروز نیست/,()=>B('go','plan','',T('📝 افزودن به برنامه','📝 Add to plan'))],
 [/افقی در پیش نیست/,()=>B('go','dl','',T('⏳ افزودن موعد','⏳ Add a deadline'))],
 [/ثبتی برای این روز نیست/,()=>B('dk_o','','ql',T('⚡ ثبت ۵ ثانیه‌ای','⚡ 5-sec log'))]];
function run(){const pg=document.getElementById('pg');if(!pg||(page!=='home'&&page!=='dash'))return;
  pg.querySelectorAll('.m,p').forEach(e=>{if(e.dataset.ecta||e.children.length>2)return;const t=e.textContent;
    for(const[re,f]of RULES)if(re.test(t)){e.dataset.ecta=1;e.insertAdjacentHTML('afterend','<div class="row ecta" style="margin:4px 0 8px">'+f()+'</div>');break}})}
const _r=render;render=function(){const r=_r.apply(this,arguments);try{run()}catch(e){console.error('ecta',e)}return r};
})();
