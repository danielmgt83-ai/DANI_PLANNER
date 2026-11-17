/* v145 — «پروژه‌ها»: جمع‌وجور و بدون تکرار، بدون حذف هیچ قابلیتی (فقط جابه‌جا/پنهان؛ همه‌ی دکمه‌ها همان‌ها هستند).
   ۱) سوییچ «پروژه‌ها | موعدها»: هر بار فقط یکی دیده می‌شود (نوار پرش قدیمی دیگر لازم نیست و پنهان می‌شود).
   ۲) هر پروژه یک ردیف است (نام، وضعیت، موعد، نوار)؛ با لمس باز می‌شود و چهار زبانه دارد: وضعیت · بخش‌ها · عادت و یادآوری · ویرایش.
      هم‌زمان فقط یک پروژه باز است. زبانه و پروژه‌ی باز بعد از هر رندر یادش می‌ماند.
   ۳) ۷ بخش موعدها در ۳ گروه: «موعدها» (افزودن، فهرست، بدون پروژه) · «پیش‌بینی» · «تنظیمات و هشدارها» (هشدارها، دسته‌ها، تنظیمات موعد).
   ۴) «پروژه‌ی جدید» و بقیه همان دکمه‌های قبلی‌اند. */
(function(){'use strict';
const T=window.daniT||function(a){return a};
const BH=(a,b)=>{try{return typeof window.BH==='function'?window.BH(a,b):'<b>'+a+'</b><i>'+b+'</i>'}catch(e){return a}};
const ST=window.daniPj3=window.daniPj3||{seg:'pj',open:'',tab:{},g:{A:1}};
const lab=[['st','وضعیت','Status'],['pt','بخش‌ها','Parts'],['hr','عادت و یادآوری','Habits & reminders'],['ed','ویرایش','Edit']];
function tidyCard(c,i){if(c.dataset.pj3)return;
 const ed=c.querySelector('[data-a=pj_ed]'),id=(ed&&ed.dataset.p)||('i'+i),kids=[...c.children];if(kids.length<3)return;
 const row0=kids[0],due=kids.find((k,j)=>j>0&&k.classList.contains('m')),bar=kids.find(k=>k.classList&&k.classList.contains('bar'));
 const P={st:[],pt:[],hr:[],ed:[]};
 kids.forEach(k=>{if(k===row0||k===due||k===bar)return;
  if(k.querySelector&&k.querySelector('[data-a=pj_ed]'))P.ed.push(k);
  else if(k.classList.contains('dyp')){const b=(k.querySelector('b')||{}).textContent||'';(/🔁|🔔/.test(b)?P.hr:P.pt).push(k)}
  else if(k.tagName==='P'&&/هنوز بخشی|No parts yet/.test(k.textContent))P.pt.push(k);
  else P.st.push(k)});
 const d=document.createElement('details');d.className='pj3d';d.dataset.pid=id;d.open=ST.open===id;
 const sm=document.createElement('summary');[row0,due,bar].forEach(x=>x&&sm.appendChild(x));d.appendChild(sm);
 const cur=ST.tab[id]||'st';
 const tb=document.createElement('div');tb.className='pj3t';
 lab.forEach(l=>{const n=l[0]==='pt'?P.pt.filter(x=>x.classList.contains('dyp')).length:0;const b=document.createElement('button');b.type='button';b.className='chip'+(l[0]===cur?' on':'');b.dataset.a='pj3_tab';b.dataset.p=id;b.dataset.t=l[0];b.innerHTML=T(l[1],l[2])+(n?' <small>'+(typeof fa==='function'?fa(n):n)+'</small>':'');tb.appendChild(b)});
 d.appendChild(tb);
 lab.forEach(l=>{const w=document.createElement('div');w.dataset.pane=l[0];w.hidden=l[0]!==cur;P[l[0]].forEach(x=>w.appendChild(x));d.appendChild(w)});
 c.appendChild(d);c.dataset.pj3='1'}
function mergeDL(){const m=document.getElementById('dlmv');if(!m||m.dataset.pj3||!document.getElementById('pjs-list'))return;m.dataset.pj3='1';
 const G=[['A','📋',['موعدها','Deadlines'],['add','list','free']],['B','🏁',['پیش‌بینی','Forecast'],['fc']],['C','⚙',['تنظیمات و هشدارها','Settings & alerts'],['alerts','cats','set']]];
 const SUBT={free:['🧩','موعدها و هدف‌های بدون پروژه','Deadlines & goals without a project'],alerts:['🔔','هشدارها','Alerts'],cats:['🏷','دسته‌های سفارشی','Custom categories']};
 G.forEach(g=>{const d=document.createElement('details');d.className='c pjs pj3g';d.id='pj3g-'+g[0];d.open=!!ST.g[g[0]];
  const s=document.createElement('summary');s.innerHTML='<b>'+g[1]+' '+T(g[2][0],g[2][1])+'</b>';d.appendChild(s);
  g[3].forEach(x=>{const o=document.getElementById('pjs-'+x);if(!o)return;
   if(x==='add'){o.classList.remove('c');o.classList.add('pj3in');d.appendChild(o);return}
   if(SUBT[x]){const h=document.createElement('div');h.className='pj3h';h.innerHTML=SUBT[x][0]+' '+T(SUBT[x][1],SUBT[x][2]);d.appendChild(h)}
   [...o.children].forEach(k=>{if(k.tagName!=='SUMMARY')d.appendChild(k)});o.remove()});
  m.appendChild(d)})}
function seg(){const pg=document.getElementById('pg');if(!pg)return;
 const kids=[...pg.children],head=kids.find(c=>c.querySelector&&c.querySelector('h3.dh'));if(!head)return;
 let sb=document.getElementById('pj3seg');
 if(!sb){sb=document.createElement('div');sb.id='pj3seg';sb.className='row';sb.setAttribute('data-nobi','');
  sb.innerHTML=[['pj','🎓',['پروژه‌ها','Projects']],['dl','⏳',['موعدها','Deadlines']]].map(x=>'<button type="button" class="chip" data-a="pj3_seg" data-k="'+x[0]+'">'+x[1]+' '+T(x[2][0],x[2][1])+'</button>').join('');head.insertAdjacentElement('afterend',sb)}
 sb.querySelectorAll('[data-k]').forEach(b=>b.classList.toggle('on',b.dataset.k===ST.seg));
 const jp=document.getElementById('pjjump');if(jp)jp.hidden=true;
 [...pg.children].forEach(c=>{if(c===head||c===sb||c===jp)return;c.hidden=(c.id==='dlmv')?ST.seg!=='dl':ST.seg!=='pj'});
 const m=document.getElementById('dlmv');if(m&&ST.seg==='dl'){m.open=true;m.classList.add('pj3on')}else if(m)m.classList.remove('pj3on');
 head.classList.toggle('pj3hd',ST.seg==='dl')}
function run(){if(typeof page==='undefined'||page!=='pj')return;const pg=document.getElementById('pg');if(!pg||!pg.querySelector('h3.dh'))return;
 pg.querySelectorAll(':scope>.c.pjc').forEach(tidyCard);mergeDL();seg()}
H.pj3_seg=e=>{ST.seg=e.dataset.k;render();try{window.scrollTo(0,0)}catch(x){}};
H.pj3_tab=e=>{const id=e.dataset.p,t=e.dataset.t;ST.tab[id]=t;const d=e.closest('.pj3d');if(!d)return;
 d.querySelectorAll('.pj3t [data-t]').forEach(b=>b.classList.toggle('on',b.dataset.t===t));d.querySelectorAll('[data-pane]').forEach(w=>w.hidden=w.dataset.pane!==t)};
{const o=H.dl_hub;if(typeof o==='function')H.dl_hub=function(){ST.seg='dl';ST.g.C=1;return o.apply(this,arguments)}}
document.addEventListener('toggle',function(e){const t=e.target;if(!t||!t.classList)return;
 if(t.classList.contains('pj3d')){if(t.open){ST.open=t.dataset.pid;document.querySelectorAll('.pj3d[open]').forEach(x=>{if(x!==t)x.open=false})}else if(ST.open===t.dataset.pid)ST.open=''}
 else if(t.classList.contains('pj3g')){ST.g[t.id.slice(5)]=t.open?1:0}},true);
const st=document.createElement('style');st.id='pj3css';
st.textContent='#pj3seg{gap:6px;margin:8px 0}#pj3seg .chip{flex:1;padding:9px 6px;text-align:center}'
 +'.pjc>.pj3d>summary{list-style:none;cursor:pointer}.pjc>.pj3d>summary::-webkit-details-marker{display:none}'
 +'.pjc:has(>.pj3d){padding:12px 14px}.pjc>.pj3d>summary>.row{margin-bottom:2px}'
 +'.pj3t{display:flex;gap:5px;margin:10px 0 6px;overflow-x:auto;scrollbar-width:none}.pj3t::-webkit-scrollbar{display:none}.pj3t .chip{flex:none;padding:6px 10px;font-size:12.5px;white-space:nowrap}.pj3t small{opacity:.7}'
 +'.pj3d [data-pane][hidden]{display:none}'
 +'#dlmv.pj3on>summary{display:none}#dlmv.pj3on{border:0;background:none;padding:0;box-shadow:none}'
 +'.pj3h{font-weight:700;margin:12px 0 4px;opacity:.9}.pj3in{margin:6px 0}.pj3in>summary{cursor:pointer;font-weight:700}'
 +'.pj3hd>.row,.pj3hd>p.m{display:none}#pjjump[hidden]{display:none!important}'
 +'.pj3g>.c{background:none;border:0;box-shadow:none;padding:0;margin:6px 0}.pj3g>.c>h3:first-child,.pj3g>.c>.dh:first-child{display:none}'
 +'.pj3g>.pj3in{background:none;border:0;box-shadow:none;padding:0}';
document.head.appendChild(st);
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{run()}catch(e){console.error('pj3',e)}setTimeout(function(){try{run()}catch(e){console.error('pj3b',e)}},0);return r}}
})();
