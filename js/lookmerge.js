"use strict";
/* DANI · lookmerge.js — «استودیو و بسته‌های تم» یک‌جا: واردکردن/خروجی تم (از کارت «پوسته») + استودیوی تم + بسته‌های تم (پیشرفته).
   فقط جابه‌جایی DOM؛ همه‌ی دکمه‌ها و ورودی‌ها (data-skthemefile, data-skexp, st, pk…) سر جایشان کار می‌کنند. بعد از settings2.js بارگذاری شود. هر رندر بی‌خطر تکرار می‌شود. */
(function(){
const T=window.daniT,$=id=>document.getElementById(id);
function run(){
  const sk=$('skincard'),pk=$('pkcard'),st=$('studiocard');if(!st)return;
  let box=$('thmx');
  if(!box){
    box=document.createElement('div');box.className='c';box.id='thmx';
    box.innerHTML='<h3>🎨 '+T('استودیو و بسته‌های تم','Theme studio & packs')+'</h3><p class="m">'+T('ساخت و ویرایش تم، واردکردن و خروجی تم، بسته‌های تم — همه یک‌جا.','Create & edit themes, import/export, theme packs — all in one place.')+'</p><div id="thmio"></div>';
    st.parentNode.insertBefore(box,st);
  }
  const io=box.querySelector('#thmio');
  if(sk){const f=sk.querySelector('[data-skthemefile]'),r=f&&f.closest('.row'),n=r&&r.nextElementSibling;
    if(r&&r.parentNode!==io){io.appendChild(r);if(n&&n.tagName==='P'&&n.classList.contains('m'))io.appendChild(n)}}
  if(st.parentNode!==box)box.appendChild(st);
  if(pk){let d=box.querySelector(':scope>details[data-tk="pk"]');
    if(!d){d=document.createElement('details');d.dataset.tk='pk';d.style.marginTop='10px';const s=document.createElement('summary');s.style.cursor='pointer';s.innerHTML='<b>🧪 '+T('پیشرفته: بسته‌ها و امضا','Advanced: packs & signing')+'</b>';d.appendChild(s);box.appendChild(d)}
    if(pk.parentNode!==d)d.appendChild(pk)}
}
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{if(page==='set'&&stt==='look')run()}catch(e){console.error('lookmerge',e)}return r}}
})();
