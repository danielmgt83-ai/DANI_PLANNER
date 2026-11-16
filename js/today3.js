/* v136 — صفحه‌ی امروز: «تایم‌لاین» و «نتیجه‌ی امروز» (و فهرست ثبت‌ها) در یک کارت با سه تب.
   هیچ قابلیتی حذف نشد: همه‌ی گره‌های اصلی (دکمه‌ها، ثبت+، ویرایش/حذف، نتیجه‌ی کامل، برنامه‌ی فردا) فقط جابه‌جا می‌شوند.
   عدد «ثبت‌شده» بالای کارت همیشه دیده می‌شود (همان گره‌ی کارت نتیجه، نه نسخه‌ی تکراری).
   اگر فقط یکی از دو کارت روشن باشد، همان کارت بدون تب می‌ماند. خاموش‌کردن: «شخصی‌سازی صفحه‌ی امروز» ← «کارت تب‌دار». ذخیره: db.set.tdt (0=خاموش). */
(function(){'use strict';
const T=window.daniT||function(a){return a};
let cur='tl';
const on=()=>!(db&&db.set&&db.set.tdt===0);
const hd=c=>((c.querySelector('h3,.dh')||{}).textContent||'');
function lab(en,fa){try{return typeof BH==='function'?BH(en,fa):'<b>'+en+'</b><i>'+fa+'</i>'}catch(e){return en}}
function merge(){
 if(typeof page==='undefined'||page!=='day')return;
 const pg=document.getElementById('pg');if(!pg||document.getElementById('dytab'))return;
 if(!on())return;
 const cs=[...pg.querySelectorAll(':scope>.c.dyc')];
 const A=cs.find(c=>/Timeline|تایم‌لاین/.test(hd(c))),R=cs.find(c=>/Result|نتیجه‌ی امروز/.test(hd(c)));
 if(!A||!R||A===R)return;
 const hA=A.querySelector('h3,.dh'),hR=R.querySelector('h3,.dh'),det=A.querySelector(':scope>details');
 const W=document.createElement('div');W.className=A.className;W.id='dytab';
 W.appendChild(hA);
 /* عدد «ثبت‌شده»: اولین بلوک نتیجه که زمان دارد؛ همان گره منتقل می‌شود (نه کپی) */
 const big=[...R.children].find(e=>e!==hR&&/ساعت|دقیقه|\d/.test(e.textContent)&&!e.querySelector('button')&&e.textContent.length<80);
 const sum=document.createElement('div');sum.className='dtsum';if(big)sum.appendChild(big);W.appendChild(sum);
 const names=[['tl','Timeline','تایم‌لاین'],['en','Entries','فهرست ثبت‌ها'],['rs','Result','نتیجه‌ی امروز']];
 const tabs=document.createElement('div');tabs.className='dttabs';tabs.setAttribute('role','tablist');
 names.forEach(n=>{const b=document.createElement('button');b.type='button';b.dataset.a='td3_tab';b.dataset.t=n[0];b.className='chip'+(n[0]===cur?' on':'');b.setAttribute('role','tab');b.innerHTML=lab(n[1],n[2]);tabs.appendChild(b)});
 W.appendChild(tabs);
 const P={};names.forEach(n=>{const d=document.createElement('div');d.dataset.tp=n[0];d.hidden=n[0]!==cur;P[n[0]]=d;W.appendChild(d)});
 [...A.children].forEach(ch=>{if(ch!==hA&&ch!==det)P.tl.appendChild(ch)});
 if(det){det.open=true;[...det.children].forEach(ch=>{if(ch.tagName!=='SUMMARY')P.en.appendChild(ch)})}
 [...R.children].forEach(ch=>{if(ch!==hR)P.rs.appendChild(ch)});
 if(!P.en.children.length){tabs.querySelector('[data-t=en]').remove();if(cur==='en'){cur='tl';P.tl.hidden=false}}
 A.replaceWith(W);R.remove();
}
function panel(){
 const pg=document.getElementById('pg');if(!pg)return;
 const p=[...pg.querySelectorAll(':scope>.c.dyc')].find(c=>/Customize Today|شخصی‌سازی صفحه‌ی امروز/.test(hd(c)));
 if(!p||p.querySelector('[data-a=td3_t]'))return;
 const r=document.createElement('div');r.className='row';r.style.marginTop='6px';
 r.innerHTML='<button class="chip '+(on()?'on':'')+'" data-a="td3_t">'+(on()?'☑ ':'☐ ')+T('کارت تب‌دار: تایم‌لاین + ثبت‌ها + نتیجه','Tabbed card: Timeline + Entries + Result')+'</button>';
 p.appendChild(r);
}
H.td3_tab=e=>{const k=(e.dataset||e).t;if(!k)return;cur=k;
 const w=document.getElementById('dytab');if(!w)return;
 w.querySelectorAll('.dttabs [data-t]').forEach(b=>b.classList.toggle('on',b.dataset.t===k));
 w.querySelectorAll('[data-tp]').forEach(d=>d.hidden=d.dataset.tp!==k)};
H.td3_t=()=>{db.set.tdt=on()?0:1;save();render()};
const st=document.createElement('style');st.id='td3css';
st.textContent='#dytab .dttabs{display:flex;gap:6px;margin:10px 0}#dytab .dttabs .chip{flex:1;display:flex;justify-content:center;align-items:center;padding:6px 4px;line-height:1.25;text-align:center}'
 +'#dytab .dttabs .bi{display:flex;flex-direction:column;align-items:center}#dytab .dttabs .bi i{font-size:10px;opacity:.75;font-style:normal}#dytab .dtsum{margin-top:2px}#dytab [data-tp][hidden]{display:none}';
document.head.appendChild(st);
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{merge();panel()}catch(e){console.error('today3',e)}return r}}
})();
