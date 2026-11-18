/* v149 — «ظاهر و تم»: یک صفحه‌ی منظم با ۵ زبانه به‌جای ۷–۸ کارت پراکنده (فقط جابه‌جایی DOM؛ هیچ قابلیتی حذف نمی‌شود).
   تم (پوسته، استودیو، ورود/خروج، پیشرفته) | رنگ و حالت (روشن/تیره/خودکار، رنگ اصلی، اندازه‌ی متن، ظاهر مدرن) | آیکون‌ها (استودیوی آیکون + تعویض تک‌تک) |
   پس‌زمینه (حال‌وهوای هر صفحه) | حس و کارت‌ها (حس برنامه + کارت‌های داشبورد). جمله‌ها همان‌جا در «جمله‌ها» می‌ماند. بعد از settings2/lookmerge/homemerge/setnav بارگذاری شود. */
(function(){'use strict';
const T=window.daniT||function(a){return a};
const P=[['th','🎨','تم','Theme'],['co','🌈','رنگ و حالت','Colour & mode'],['ic','🔣','آیکون‌ها','Icons'],['bg','🖼','پس‌زمینه','Background'],['fx','✨','حس و کارت‌ها','Feel & cards']];
const ST={p:'th'};
const $=(s,r)=>(r||document).querySelector(s);
const txt=e=>(e&&e.textContent)||'';
function build(){
  const grp=[...document.querySelectorAll('details.bgrp')].find(d=>/Look & themes|ظاهر و تم/.test(txt($('summary',d))));if(!grp||$('#lk3'))return;
  const skin=$('#skincard'),thmx=$('#thmx'),fx=$('#fxcard'),mx=$('#mxcard');
  const lf=[...grp.querySelectorAll('.c')].find(c=>/^\s*(Look & Feel|ظاهر)/.test(txt($('h3',c)))&&!c.id);
  const dash=lf?[...lf.querySelectorAll('details')].find(d=>/Dashboard cards|کارت‌های داشبورد/.test(txt($('summary',d)))):null;
  const secs=[...grp.querySelectorAll('.stsec')],icon=secs.find(s=>/Icon Studio|استودیوی آیکون/.test(txt(s))),moods=secs.find(s=>/Page Moods|حال‌وهوای/.test(txt(s)));
  const swap=[...grp.querySelectorAll('details')].find(d=>/Swap individual icons|تعویض تک/.test(txt($('summary',d))));
  const box=document.createElement('div');box.id='lk3';box.className='c';
  box.innerHTML='<div class="row lk3tabs" role="tablist">'+P.map(x=>'<button class="chip '+(ST.p===x[0]?'on':'')+'" data-a="lk3_p" data-k="'+x[0]+'">'+x[1]+' '+T(x[2],x[3])+'</button>').join('')+'</div>';
  const pane=(k,nodes)=>{const d=document.createElement('div');d.className='lk3p';d.dataset.p=k;d.hidden=ST.p!==k;nodes.filter(Boolean).forEach(n=>d.appendChild(n));box.appendChild(d);return d};
  /* آیکون‌ها: استودیو (شامل «تعویض تک‌تک» که داخل آن است) */
  const iconNodes=[icon];if(swap&&!(icon&&icon.contains(swap)))iconNodes.push(swap);
  pane('th',[skin,thmx]);
  pane('co',[lf,mx]);
  pane('ic',iconNodes);
  pane('bg',[moods]);
  pane('fx',[fx,dash]);
  /* پنل خالی؟ پیام کوتاه */
  box.querySelectorAll('.lk3p').forEach(p=>{if(!p.children.length){const m=document.createElement('p');m.className='m';m.textContent=T('اینجا فعلاً چیزی نیست.','Nothing here yet.');p.appendChild(m)}});
  const first=grp.querySelector(':scope>summary');first.insertAdjacentElement('afterend',box);
  grp.open=true;
}
H.lk3_p=e=>{ST.p=e.dataset.k;document.querySelectorAll('#lk3 .lk3tabs .chip').forEach(b=>b.classList.toggle('on',b.dataset.k===ST.p));document.querySelectorAll('#lk3 .lk3p').forEach(p=>{p.hidden=p.dataset.p!==ST.p})};
(function css(){if(document.getElementById('lk3-css'))return;const s=document.createElement('style');s.id='lk3-css';
 s.textContent='#lk3{padding:8px}#lk3 .lk3tabs{flex-wrap:nowrap;overflow-x:auto;gap:6px;margin-bottom:8px;padding-bottom:2px;scrollbar-width:none}#lk3 .lk3tabs .chip{flex:0 0 auto;white-space:nowrap;font-size:.86em;padding:5px 10px}#lk3 .lk3p[hidden]{display:none!important}#lk3 .lk3p>.c,#lk3 .lk3p>details{margin-top:8px}';document.head.appendChild(s)})();
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{if(page==='set'&&stt==='look')build()}catch(e){console.error('look3',e)}return r}}
})();
