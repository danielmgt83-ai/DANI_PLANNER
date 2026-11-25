"use strict";
/* DANI · homemerge.js — تب «ظاهر»: «منو و بخش‌ها» و «نمایش خانه» دو کارت یکپارچه؛ «جمله‌ی تم» کنار تیک‌های جمله‌ها.
   فقط جابه‌جایی DOM (دکمه‌ها با data-a کار می‌کنند)؛ هیچ تنظیمی حذف نمی‌شود. بعد از lookmerge.js, calm.js, sentences.js بارگذاری شود. هر رندر بی‌خطر تکرار می‌شود. */
(function(){
const T=window.daniT,$=id=>document.getElementById(id);
const rowOf=a=>{const b=document.querySelector('[data-a="'+a+'"]');return b&&b.closest('.row')};
function sect(box,title,nodes,open){nodes=nodes.filter(Boolean);if(!nodes.length)return;const d=document.createElement('details');d.className='c';if(open)d.open=true;const s=document.createElement('summary');s.style.cursor='pointer';s.innerHTML='<b>'+title+'</b>';d.appendChild(s);nodes.forEach(n=>d.appendChild(n));box.appendChild(d)}
const LV=()=>{const q=db.set.dq&&db.set.dq.on,c=db.set.cm||{};return q?'calm':(c.ws===0?'full':'tidy')};
function levelNode(){const d=document.createElement('div'),lv=LV();
  d.innerHTML='<div class="row">'+[['full','کامل','Full'],['tidy','مرتب','Tidy'],['calm','ساده (آرام)','Simple (calm)']].map(x=>'<button class="chip '+(lv===x[0]?'on':'')+'" data-a="hm_lv" data-v="'+x[0]+'">'+(lv===x[0]?'✓ ':'')+T(x[1],x[2])+'</button>').join('')+'</div><p class="m">'+T('کامل: همه‌چیز. مرتب: ابزارهای سریع در یک کارت و جمله/چیدمان بسته. ساده: فقط موعد بعدی، برنامه‌ی امروز، ثبت و نتیجه، بدون تزئین و انیمیشن. هیچ داده‌ای تغییر نمی‌کند و هر لحظه برمی‌گردد.','Full: everything. Tidy: quick tools in one card, quote/layout collapsed. Simple: only the next deadline, today\'s plan, log and result — no decoration or animation. No data changes and you can switch back any time.')+'</p>';return d}
H.hm_lv=e=>{const v=e.dataset.v;if(!db.set.cm||typeof db.set.cm!=='object')db.set.cm={};db.set.cm.ws=v==='full'?0:1;if(!db.set.dq||typeof db.set.dq!=='object')db.set.dq={on:false};db.set.dq.on=(v==='calm');save();try{window.daniCalm&&window.daniCalm.apply()}catch(x){}render()};
function run(){
  if($('menux'))return;
  const cm=$('cmcard'),lg=$('lgcard'),bd=$('bdcard');
  const dkb=document.querySelector('[data-a="dk_on"]'),dk=dkb&&dkb.closest('.c');
  if(!cm||!bd)return;
  const anchor=cm.closest('details.bgrp')||cm;
  /* جمله‌ی تم → کارت جمله‌ها */
  const bq=document.querySelector('#bdcard [data-a="bd_q"]'),sn=$('sntg');
  if(bq&&sn){const cb=[...sn.querySelectorAll('label')].find(l=>l.querySelector('input[type=checkbox]')&&/جمله‌ی روز|Quote of the day/.test(l.textContent));
    const host=cb?cb.parentNode:sn,r=document.createElement('div');r.className='row';r.style.marginTop='6px';r.appendChild(bq);host.insertBefore(r,cb||host.firstChild)}
  /* ۱) منو و نوار سریع (فهرست آیتم‌های منو و بخش‌ها حالا فقط در «ظاهر و تم ← سفارشی ← منو» است) */
  const m=document.createElement('div');m.className='c';m.id='menux';
  m.innerHTML='<h3>🧭 '+T('منو و نوار سریع','Menu & quick bar')+'</h3><p class="m">'+T('آیتم‌های منو، اندازه و ظاهرش: ظاهر و تم ← سفارشی ← منو.','Menu items, size and look: Look & themes → Custom → Menu.')+'</p>';
  sect(m,'⋯ '+T('موعد، عادت و یادآوری','Deadlines, habits & reminders'),[rowOf('cm_mg')],0);
  sect(m,'⚡ '+T('نوار ابزار سریع پایین','Bottom quick bar'),[dk],0);
  /* ۲) نمایش خانه */
  const h=document.createElement('div');h.className='c';h.id='homex';
  h.innerHTML='<h3>🏠 '+T('نمایش خانه','Home display')+'</h3><p class="m">'+T('چگونگی نمایش خانه و کارت‌ها — همه اختیاری و برگشت‌پذیر.','How Home and its cards are shown — all optional and reversible.')+'</p>';
  sect(h,'🏠 '+T('چگونگی نمایش خانه','How Home is shown'),[levelNode()],1);
  sect(h,'⏱ '+T('کارت «ثبت»','Log card'),[lg],0);
  sect(h,'🎴 '+T('نوار تم بالای صفحه‌ها','Theme bar on pages'),[bd],0);
  sect(h,'▾ '+T('کارت‌های تنظیمات','Settings cards'),[rowOf('cm_fd')],0);
  anchor.parentNode.insertBefore(m,anchor);anchor.parentNode.insertBefore(h,anchor);
  cm.remove();
  if(anchor!==cm&&!anchor.querySelector('.c,input,button'))anchor.remove();
}
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{if(page==='set'&&stt==='look')run()}catch(e){console.error('homemerge',e)}return r}}
})();
