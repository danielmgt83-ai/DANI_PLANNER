"use strict";
/* DANI · homemerge.js — تب «ظاهر»: «منو و بخش‌ها» و «نمایش خانه» دو کارت یکپارچه؛ «جمله‌ی تم» کنار تیک‌های جمله‌ها.
   فقط جابه‌جایی DOM (دکمه‌ها با data-a کار می‌کنند)؛ هیچ تنظیمی حذف نمی‌شود. بعد از lookmerge.js, calm.js, sentences.js بارگذاری شود. هر رندر بی‌خطر تکرار می‌شود. */
(function(){
const T=window.daniT,$=id=>document.getElementById(id);
const rowOf=a=>{const b=document.querySelector('[data-a="'+a+'"]');return b&&b.closest('.row')};
function sect(box,title,nodes,open){nodes=nodes.filter(Boolean);if(!nodes.length)return;const d=document.createElement('details');d.className='c';if(open)d.open=true;const s=document.createElement('summary');s.style.cursor='pointer';s.innerHTML='<b>'+title+'</b>';d.appendChild(s);nodes.forEach(n=>d.appendChild(n));box.appendChild(d)}
function run(){
  if($('menux'))return;
  const cm=$('cmcard'),lg=$('lgcard'),bd=$('bdcard'),mod=$('modcard'),dq=$('dqc');
  const dkb=document.querySelector('[data-a="dk_on"]'),dk=dkb&&dkb.closest('.c');
  if(!cm||!bd||!mod)return;
  const anchor=cm.closest('details.bgrp')||cm;
  /* جمله‌ی تم → کارت جمله‌ها */
  const bq=document.querySelector('#bdcard [data-a="bd_q"]'),sn=$('sntg');
  if(bq&&sn){const cb=[...sn.querySelectorAll('label')].find(l=>l.querySelector('input[type=checkbox]')&&/جمله‌ی روز|Quote of the day/.test(l.textContent));
    const host=cb?cb.parentNode:sn,r=document.createElement('div');r.className='row';r.style.marginTop='6px';r.appendChild(bq);host.insertBefore(r,cb||host.firstChild)}
  /* ۱) منو و بخش‌ها */
  const m=document.createElement('div');m.className='c';m.id='menux';
  m.innerHTML='<h3>🧭 '+T('منو و بخش‌ها','Menu & sections')+'</h3><p class="m">'+T('کدام بخش‌ها در منو باشند و چطور نمایش داده شوند.','Which sections are in the menu and how they are shown.')+'</p>';
  sect(m,'🧩 '+T('بخش‌ها (ماژول‌ها)','Sections (modules)'),[mod],1);
  sect(m,'⋯ '+T('مدخل‌های منو','Menu entries'),[rowOf('cm_mg'),rowOf('cm_mo')],0);
  sect(m,'⚡ '+T('نوار ابزار سریع پایین','Bottom quick bar'),[dk],0);
  /* ۲) نمایش خانه */
  const h=document.createElement('div');h.className='c';h.id='homex';
  h.innerHTML='<h3>🏠 '+T('نمایش خانه','Home display')+'</h3><p class="m">'+T('جمع‌وجوری، نوار تم، کارت ثبت و نمای آرام — همه اختیاری و برگشت‌پذیر.','Compactness, theme bar, log card and calm view — all optional and reversible.')+'</p>';
  sect(h,'🗂 '+T('جمع‌وجور','Compact'),[rowOf('cm_ws'),rowOf('cm_fd')],0);
  sect(h,'⏱ '+T('کارت «ثبت»','Log card'),[lg],0);
  sect(h,'🎴 '+T('نوار تم بالای صفحه‌ها','Theme bar on pages'),[bd],0);
  sect(h,'🎯 '+T('نمای آرام','Calm view'),[dq],0);
  anchor.parentNode.insertBefore(m,anchor);anchor.parentNode.insertBefore(h,anchor);
  cm.remove();
  if(anchor!==cm&&!anchor.querySelector('.c,input,button'))anchor.remove();
}
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{if(page==='set'&&stt==='look')run()}catch(e){console.error('homemerge',e)}return r}}
})();
