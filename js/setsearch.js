"use strict";
/* DANI · setsearch.js — کادر «جستجوی تنظیمات» بالای صفحه‌ی تنظیمات. کارت‌های تبِ فعلی را فیلتر می‌کند و نتیجه‌ی تب‌های دیگر را با یک لمس باز می‌کند.
   شاخص با رندر آنی هر سه تب ساخته می‌شود (یک‌بار، بدون چشمک). چیزی تغییر یا حذف نمی‌شود. */
(function(){
const T=(fa,en)=>{try{return LANGEN()?en:fa}catch(e){return fa}};
const TABS={look:['ظاهر','Look'],time:['زمان و اعلان','Time & alerts'],data:['داده و پشتیبان','Data & backup']};
let IDX=null,Q='';
const norm=s=>String(s||'').toLowerCase().replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/\s+/g,' ').trim();
function cards(){return[...document.querySelectorAll('#pg .c')].filter(c=>!c.closest('#sqbox')&&!c.parentElement.closest('#pg .c'))}
function title(c){const h=c.querySelector('h3,h2,b');return(h?h.textContent:c.textContent).trim().slice(0,60)}
function build(){const keep=stt,out=[];
  try{['look','time','data'].forEach(k=>{stt=k;render();cards().forEach((c,i)=>out.push({tab:k,i,t:title(c),x:norm(c.textContent)}))})}catch(e){console.error('sq',e)}
  stt=keep;render();IDX=out}
function apply(){const q=norm(Q),box=document.getElementById('sqres');
  cards().forEach(c=>{c.style.display=(!q||norm(c.textContent).includes(q))?'':'none'});
  if(!box)return;if(!q){box.innerHTML='';return}
  if(!IDX){box.innerHTML='';return}
  const r=IDX.filter(e=>e.tab!==stt&&e.x.includes(q)).slice(0,8);
  box.innerHTML=r.length?'<div class="m">'+T('در تب‌های دیگر:','In other tabs:')+'</div><div class="row">'+r.map(e=>'<button class="chip" data-a="sq_go" data-tab="'+e.tab+'" data-i="'+e.i+'">'+esc(T(TABS[e.tab][0],TABS[e.tab][1]))+' › '+esc(e.t)+'</button>').join('')+'</div>':''}
H.sq_go=e=>{stt=e.dataset.tab;render();setTimeout(()=>{const c=cards()[+e.dataset.i];if(c&&c.style.display!=='none')c.scrollIntoView({block:'center'})},50)};
function inject(){if(page!=='set'||document.getElementById('sqbox'))return;const pg=document.getElementById('pg');if(!pg)return;
  const d=document.createElement('div');d.id='sqbox';d.setAttribute('data-nobi','');d.style.margin='8px 0';
  d.innerHTML='<input id="sqin" type="search" placeholder="🔍 '+esc(T('جستجو در تنظیمات…','Search settings…'))+'" style="width:100%" value="'+esc(Q)+'"><div id="sqres"></div>';
  const t=pg.querySelector('.tabs');if(t)t.insertAdjacentElement('afterend',d);else pg.insertBefore(d,pg.firstChild);
  const inp=d.querySelector('#sqin');
  inp.addEventListener('focus',()=>{if(!IDX){const v=inp.value;build();const n=document.getElementById('sqin');if(n){n.value=v;n.focus()}}});
  inp.addEventListener('input',()=>{Q=inp.value;apply()});apply()}
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{if(page!=='set')Q='';inject();if(Q)apply()}catch(e){console.error('sq',e)}return r}}
})();
