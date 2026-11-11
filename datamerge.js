"use strict";
/* DANI · datamerge.js — تب «داده‌ها»: محتوای تب جدای «افزونه‌ها و گزارش» (مرکز DANI) یک‌جا در همین تب.
   هیچ قابلیتی حذف نمی‌شود: افزودن تغییر، پشتیبان کامل (دانلود/ارسال/بازیابی)، نصب‌شده‌ها و گزارش داده‌ها همان دکمه‌ها را دارند. تب جدا پنهان می‌شود و اگر کسی (راهنما/جست‌وجو) به آن برود، به تب «داده‌ها» می‌آید.
   بعد از extensions.js و baked.js بارگذاری شود (درست قبل از fx.js). هر رندر بی‌خطر تکرار می‌شود. */
(function(){
const T=window.daniT,TAB='uch';
const KEYS=[[/افزودن تغییر|Add change/,'➕',T('افزودن تغییر یا ویژگی جدید','Add a change or new feature'),0],[/پشتیبان کامل|Full backup/,'🗃',T('پشتیبان کامل DANI (دانلود، ارسال، بازیابی)','DANI full backup (download, share, restore)'),0],[/نصب‌شده|Installed/,'📦',T('نصب‌شده‌ها','Installed'),0],[/گزارش داده|Data report/,'🔎',T('گزارش داده‌ها','Data report'),0]];
function hideTab(){try{for(let i=ST.length-1;i>=0;i--)if(ST[i][0]===TAB)ST.splice(i,1)}catch(e){}}
function run(){
  if(document.getElementById('uchx'))return;
  const anchor=document.getElementById('extcard');if(!anchor)return;
  const o=stt;let h='';try{stt=TAB;h=setPage()}finally{stt=o}
  if(typeof h!=='string'||!h)return;
  const t=document.createElement('div');t.innerHTML=h;
  const cards=[...t.children].filter(c=>c.classList&&c.classList.contains('c')&&c.querySelector(':scope>h3')).map(c=>[c,c.querySelector(':scope>h3').textContent]);
  const box=document.createElement('div');box.className='c';box.id='uchx';box.innerHTML='<h3>🧩 '+T('افزونه‌ها، پشتیبان کامل و گزارش داده','Extensions, full backup & data report')+'</h3><p class="m">'+T('همه‌ی چیزهایی که قبلاً در تب «افزونه‌ها و گزارش» بود، حالا همین‌جاست.','Everything that was in the “Extensions & report” tab is now here.')+'</p>';
  let n=0;
  KEYS.forEach(k=>{const f=cards.find(x=>k[0].test(x[1]));if(!f)return;const c=f[0];
    c.querySelector(':scope>h3').remove();c.removeAttribute('style');
    const d=document.createElement('details');d.className='c';if(k[3])d.open=true;const s=document.createElement('summary');s.style.cursor='pointer';s.innerHTML='<b>'+k[1]+' '+k[2]+'</b>';d.appendChild(s);while(c.firstChild)d.appendChild(c.firstChild);box.appendChild(d);n++});
  if(!n)return;
  const g=anchor.closest('details.bgrp')||anchor;g.parentNode.insertBefore(box,g.nextSibling);
  /* کارتِ «رفتن به مرکز DANI» دیگر لازم نیست */
  [...document.querySelectorAll('[data-a="tab"][data-k="'+TAB+'"]')].forEach(b=>{const c=b.closest('.c');if(c)c.remove()});
  /* خط IndexedDB در گزارش داده‌ها (هوک رندر افزونه فقط در تب خودش پر می‌کرد) */
  const o2=stt;try{stt=TAB;EXT_ON.render.forEach(f=>{try{f('set')}catch(e){}})}finally{stt=o2}
}
{const _r=render;render=function(){hideTab();if(page==='set'&&stt===TAB)stt='data';const r=_r.apply(this,arguments);try{if(page==='set'&&stt==='data')run()}catch(e){console.error('datamerge',e)}return r}}
hideTab();
})();
