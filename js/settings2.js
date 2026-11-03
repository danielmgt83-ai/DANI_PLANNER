"use strict";
/* DANI · settings2.js — تنظیمات مرتب‌تر: «مرکز اعلان» (اعلان‌ها و زمان) یک‌جا با ۴ بخش، و زبان+تقویم+ظاهر کنار هم.
   چیزی حذف نمی‌شود؛ کارت‌های موجود بعد از رندر در بخش‌های جمع‌شونده کنار هم می‌نشینند (DOM). بعد از groups.js و backupc.js بارگذاری شود. */
(function(){
const T=window.daniT;
try{ST.forEach(x=>{if(x[0]==='look')x[1]=T('زبان و ظاهر','Language & look');else if(x[0]==='time')x[1]=T('اعلان‌ها و زمان','Notifications & time');else if(x[0]==='data')x[1]=T('داده‌ها و پشتیبان','Data & backup')})}catch(e){}
const cards=()=>[...document.querySelectorAll('.c')];
const head=c=>{const h=c.querySelector('h3');return h?h.innerText:''};
const find=rx=>cards().find(c=>!c.closest('#ntc')&&rx.test(head(c)));
function sect(title,nodes,open){nodes=nodes.filter(Boolean);if(!nodes.length)return null;const d=document.createElement('details');d.className='c';if(open)d.open=true;const s=document.createElement('summary');s.style.cursor='pointer';s.innerHTML='<b>'+title+'</b>';d.appendChild(s);nodes.forEach(n=>d.appendChild(n));return d}
function tidy(root){document.querySelectorAll('details.bgrp').forEach(d=>{if(!d.querySelector('.c,input,select,button:not(summary button)'))d.remove()})}
function timeTab(){if(document.getElementById('ntc'))return;
  const A=[find(/Browser Alerts|اعلان مرورگر/),find(/Notification health|سلامت اعلان/)],
        B=[find(/Alert Sound|صدای هشدار/),find(/Notifications & sound|اعلان‌ها و صدا/)],
        C=[find(/Time & Alerts|زمان و اعلان/),find(/Reminder & repeats|اعلان و تکرار/)],
        D=[find(/Grouped notifications|اعلان‌های گروهی/)];
  const first=A.concat(B,C,D).find(Boolean);if(!first)return;
  const box=document.createElement('div');box.className='c';box.id='ntc';box.innerHTML='<h3>🔔 '+T('مرکز اعلان','Notification centre')+'</h3><p class="m">'+T('همه‌ی تنظیم‌های اعلان یک‌جا: اجازه و سلامت، صدا، زمان‌ها و تکرار، گروه‌بندی و تاریخچه.','Every notification setting in one place: permission & health, sound, times & repeats, grouping & history.')+'</p>';
  const mk=[['🛡 '+T('اجازه و سلامت','Permission & health'),A,1],['🔊 '+T('صدا','Sound'),B,0],['⏰ '+T('زمان‌ها و تکرار','Times & repeats'),C,0],['🗂 '+T('گروه‌بندی و تاریخچه','Grouping & history'),D,0]];
  const anchor=first.closest('details.bgrp')||first;anchor.parentElement.insertBefore(box,anchor);
  mk.forEach(m=>{const s=sect(m[0],m[1],m[2]);if(s)box.appendChild(s)});tidy()}
function lookTab(){if(document.getElementById('lkx'))return;
  const grp=[...document.querySelectorAll('details.bgrp')],lang=grp.find(d=>/Language & date|زبان و تاریخ/.test(d.querySelector('summary')?d.querySelector('summary').innerText:'')),themes=grp.find(d=>/Look & themes|ظاهر و تم/.test(d.querySelector('summary')?d.querySelector('summary').innerText:''));
  const cal=find(/^Language & Date|^زبان و تاریخ/),lf=find(/^Look & Feel|^ظاهر/);
  const mark=document.createElement('i');mark.id='lkx';mark.hidden=true;document.body.appendChild(mark);
  if(lang&&cal){lang.appendChild(cal);lang.open=true}
  if(themes&&lf){/* کارت‌های داشبورد قدیمی جمع‌شده؛ بقیه‌ی «ظاهر» همان‌جا */
    themes.appendChild(lf);
    const lb=[...lf.children].find(l=>l.tagName==='LABEL'&&!l.querySelector('input')&&/Dashboard cards|کارت‌های داشبورد/.test(l.textContent));
    if(lb){const dt=document.createElement('details');dt.style.marginTop='10px';const sm=document.createElement('summary');sm.style.cursor='pointer';sm.innerHTML='🧩 '+T('کارت‌های داشبورد (نمایش/پنهان)','Dashboard cards (show/hide)');dt.appendChild(sm);
      let n=lb;const mv=[];while(n){mv.push(n);n=n.nextSibling}lb.replaceWith(dt);mv.forEach(x=>{if(x!==lb||true)dt.appendChild(x)});
      const p=document.createElement('p');p.className='m';p.textContent=T('چیدمان خانه را بهتر است از «شخصی‌سازی خانه» تغییر بدهی؛ این‌ها فقط کارت‌های قدیمی داشبورد را نشان یا پنهان می‌کنند.','Arrange Home from “Customize Home”; these only show/hide the old dashboard cards.');dt.insertBefore(p,dt.children[1])}}}
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{if(page==='set'){const m=document.getElementById('lkx');if(m)m.remove();if(stt==='time')timeTab();else if(stt==='look')lookTab()}}catch(e){console.error('settings2',e)}return r}}
})();
