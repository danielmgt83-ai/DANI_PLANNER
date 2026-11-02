'use strict';
/* DANI · acts2.js — «فعالیت‌ها» یک جا و وصل به همه‌جا (ثبت، برنامه‌ی روز، پروژه‌ها).
   ⭐ ضروری = در انتخاب‌های سریع (ثبت، برنامه‌ی روز) می‌آید؛ تعداد چیپ‌های سریع قابل کم/زیاد؛ ترتیب با ↑↓؛ ＋ فعالیت جدید از همه‌جا. */
(function(){
const T=window.daniT;
const live=()=>db.acts.filter(a=>a.active&&!a.arch&&a.cat!=='sleep');
const N=()=>Math.max(3,Math.min(20,+db.set.qan||8));
/* فهرست انتخاب سریع: ابتدا ⭐ها (به ترتیب فهرست)، بعد اخیرها؛ اگر ⭐ نداری فقط اخیرها */
window.daniQuickActs=function(){const out=[],seen=new Set(),add=a=>{if(a&&!seen.has(a.id)&&out.length<N()){seen.add(a.id);out.push(a.id)}};
  live().filter(a=>a.fav).forEach(add);
  for(let i=db.entries.length-1;i>=0&&out.length<N();i--)add(live().find(a=>a.id===db.entries[i].actId));
  if(out.length<3)live().forEach(add);return out};
H.act_new=()=>actForm('');
H.afav=e=>{const a=act(e.dataset.id);if(!a)return;a.fav=!a.fav;save();render()};
H.amv=e=>{const i=db.acts.findIndex(a=>a.id===e.dataset.id),n=+e.dataset.n;if(i<0)return;let j=i+n;while(j>=0&&j<db.acts.length&&(db.acts[j].arch))j+=n;if(j<0||j>=db.acts.length)return;const t=db.acts[i];db.acts[i]=db.acts[j];db.acts[j]=t;save();render()};
/* صفحه‌ی فعالیت‌ها: ⭐ و ↑↓ کنار هر فعالیت + تنظیم تعداد انتخاب سریع */
{const _p=PX.acts;PX.acts=function(){let h=_p.apply(this,arguments);if(typeof h!=='string')return h;
  h=h.replace(/<button class="p" data-a="arec" data-id="([^"]+)">/g,(m,id)=>{const a=act(id)||{};return'<button class="chip" data-a="afav" data-id="'+id+'" title="'+T('ضروری: در انتخاب سریع بیاید','Essential: show in quick pick')+'">'+(a.fav?'⭐':'☆')+'</button><button class="chip" data-a="amv" data-id="'+id+'" data-n="-1">↑</button><button class="chip" data-a="amv" data-id="'+id+'" data-n="1">↓</button>'+m});
  const top='<div class="c">'+daniH('⭐','انتخاب سریع فعالیت‌ها','Quick-pick activities')+'<p class="m">'+T('فعالیت‌های ⭐ در «ثبت فعالیت» و «برنامه‌ی روز» به‌صورت دکمه‌ی سریع می‌آیند؛ بقیه با جست‌وجو/＋ در دسترس‌اند. همین‌جا اسم، رنگ، برچسب، زیرمجموعه و هدف را عوض کن؛ همه‌جا یکسان به‌روز می‌شود.','⭐ activities appear as quick buttons in Track and Day plan; others stay reachable via search/＋. Rename, recolor, tag, add sub-items and goals here — it updates everywhere.')+'</p>'
   +'<div class="row"><label>'+T('تعداد دکمه‌های سریع','Quick buttons')+'</label><select data-ch="sf" data-f="qan" data-n="1">'+[4,6,8,12,16].map(n=>'<option value="'+n+'"'+(N()===n?' selected':'')+'>'+fa(n)+'</option>').join('')+'</select><span class="sp"></span><button class="p" data-a="act_new">＋ '+T('فعالیت جدید','New activity')+'</button></div></div>';
  return top+h}}
/* فرم ویرایش: گزینه‌ی ⭐ ضروری */
{const _af=actForm;actForm=function(id){_af.apply(this,arguments);try{const a=act(id)||{};const btn=document.querySelector('[data-a="asave"]');if(btn&&!document.getElementById('ffav'))btn.parentElement.insertAdjacentHTML('beforebegin','<label style="display:block;margin-top:8px"><input type="checkbox" id="ffav" '+(a.fav?'checked':'')+'> ⭐ '+T('ضروری (در انتخاب سریع بیاید)','Essential (show in quick pick)')+'</label>')}catch(e){}};
 const _as=H.asave;H.asave=function(e){const c=document.getElementById('ffav'),fav=c?c.checked:null,id=e&&e.dataset&&e.dataset.id,before=db.acts.length;const r=_as.apply(this,arguments);
  try{if(fav!==null){const a=id?act(id):db.acts.find(x=>x.name===(document.getElementById('fn')||{}).value)||db.acts[db.acts.length-1];if(a&&(id||db.acts.length>before||a)){a.fav=fav;save()}}}catch(x){}return r}}
/* برنامه‌ی روز: «اخیراً» با ⭐ها شروع شود + ＋ فعالیت جدید */
{const _s=window.daniSugExtra;}

/* ===== v56: «مدیر فعالیت‌ها» — یک جا برای دیدن، ساختن، ویرایش، برچسب و زیرمجموعه ===== */
{const _old=PX.acts;
 PX.acts=function(){
  const l=db.acts.filter(a=>!acQ||a.name.includes(acQ)),on=l.filter(a=>!a.arch),ar=l.filter(a=>a.arch);
  const card=a=>{const tg=(a.tags||[]).map(tagH).join(''),sb=(a.subs||[]).map(x=>esc(x.name)).join('، ');
   return'<div class="dyp" style="display:block;'+(a.active?'':'opacity:.6')+'"><div class="row" style="flex-wrap:nowrap;gap:6px;align-items:center"><span style="color:'+aC(a.id)+'">●</span><b style="flex:1;min-width:0">'+esc(a.name)+'</b>'
    +'<button class="chip" data-a="afav" data-id="'+a.id+'" title="'+esc(T('ضروری: دکمه‌ی سریع','Essential: quick button'))+'">'+(a.fav?'⭐':'☆')+'</button><button class="chip" data-a="aedit" data-id="'+a.id+'" aria-label="edit">✏️</button></div>'
    +'<div class="m" style="margin:3px 0">'+(CATS[a.cat]?CATS[a.cat][0]:'')+(a.goalDay?' · '+T('هدف روز ','day goal ')+mm(a.goalDay):'')+(a.goalWeek?' · '+T('هفته ','week ')+mm(a.goalWeek):'')+(sb?' · '+T('زیرمجموعه: ','sub: ')+sb:'')+'</div>'
    +(tg?'<div>'+tg+'</div>':'')
    +'<details><summary class="m" style="cursor:pointer">⋯ '+T('بیشتر','More')+'</summary><div class="row" style="margin-top:4px;gap:4px"><button class="chip" data-a="amv" data-id="'+a.id+'" data-n="-1" aria-label="up">↑</button><button class="chip" data-a="amv" data-id="'+a.id+'" data-n="1" aria-label="down">↓</button><span class="sp"></span>'
    +'<button class="chip" data-a="atog" data-id="'+a.id+'">'+(a.active?T('غیرفعال','Pause'):T('فعال‌کن','Resume'))+'</button><button class="chip" data-a="aarch" data-id="'+a.id+'">'+(a.arch?T('بازگردانی','Restore'):T('بایگانی','Archive'))+'</button><button class="chip" data-a="adel" data-id="'+a.id+'" aria-label="delete">🗑</button></div></details></div>'};
  return'<div class="c">'+daniH('🎯','فعالیت‌ها','Activities')
   +'<p class="m">'+T('همه‌ی فعالیت‌هایت همین‌جاست و همه‌جا (ثبت، برنامه‌ی روز، پروژه‌ها) همین فهرست را می‌بینند. ⭐ = دکمه‌ی سریع. برچسب و زیرمجموعه را با ✏️ عوض کن.','All your activities live here and every place (Track, Day plan, Projects) uses this same list. ⭐ = quick button. Edit tags and sub-items with ✏️.')+'</p>'
   +'<div class="row"><input placeholder="'+esc(T('جست‌وجو','Search'))+'" value="'+esc(acQ)+'" data-ch="acq" style="flex:1;min-width:0"><button class="p" data-a="aedit" data-id="">＋ '+T('جدید','New')+'</button><button class="chip" data-a="tags">🏷 '+T('برچسب‌ها','Tags')+'</button></div></div>'
   +'<div class="c">'+(on.length?on.map(card).join(''):'<p class="m">'+T('فعالیتی نیست.','No activities.')+'</p>')+'</div>'
   +(ar.length?'<details class="c"><summary style="cursor:pointer"><b>'+T('بایگانی','Archive')+' ('+fa(ar.length)+')</b></summary>'+ar.map(card).join('')+'</details>':'')
   +'<details class="c"><summary style="cursor:pointer"><b>⭐ '+T('تعداد دکمه‌های سریع','Number of quick buttons')+'</b></summary><div class="row" style="margin-top:6px"><select data-ch="sf" data-f="qan" data-n="1">'+[4,6,8,12,16].map(n=>'<option value="'+n+'"'+(N()===n?' selected':'')+'>'+fa(n)+'</option>').join('')+'</select><span class="m">'+T('در «ثبت» و «برنامه‌ی روز»','in Track and Day plan')+'</span></div></details>'};
 /* صفحه‌ی فعالیت‌ها بدون نوار زبانه (یادداشت و جست‌وجو: 📝 در خانه و ⚡ دسترسی سریع) */
 const _d=PG.dash;PG.dash=function(){if(dt==='acts'){try{return PX.acts()}catch(e){console.error('acts',e)}}return _d.apply(this,arguments)};
}
/* برچسب: افزودن تازه همان‌جا در فرم فعالیت + تغییر نام در مدیریت برچسب‌ها */
{const _af2=actForm;actForm=function(id){_af2.apply(this,arguments);try{const f=document.querySelector('input.ft'),box=f?f.parentElement.parentElement:null,lab=[...document.querySelectorAll('label')].find(x=>/برچسب|Tags/.test(x.textContent));
  const html='<div class="row" style="margin-top:4px"><input id="ftn" placeholder="'+esc(T('برچسب تازه…','New tag…'))+'" style="flex:1;min-width:0"><button class="chip" data-a="ftag_add">＋</button></div>';
  if(box)box.insertAdjacentHTML('afterend',html);else if(lab)lab.insertAdjacentHTML('afterend','<div id="ftbox"></div>'+html)}catch(e){}};}
H.ftag_add=()=>{const i=document.getElementById('ftn'),n=((i&&i.value)||'').trim().slice(0,30);if(!n)return;if(!db.tags.some(t=>t.n===n))db.tags.push({n,c:'#0ea5e9'});save();
  const f=document.querySelector('input.ft'),sel=[...document.querySelectorAll('input.ft:checked')].map(x=>x.value);
  const lbl='<label style="display:inline-block;margin:2px 0 2px 8px"><input type="checkbox" class="ft" value="'+esc(n)+'" checked> '+esc(n)+'</label>';
  if(f)f.parentElement.insertAdjacentHTML('afterend',lbl);else{const b=document.getElementById('ftbox');if(b)b.insertAdjacentHTML('beforeend',lbl)}i.value=''};
{const _t=H.tags;H.tags=function(){_t.apply(this,arguments);try{document.querySelectorAll('[data-a="tarch"]').forEach(b=>{if(b.parentElement.querySelector('[data-a="trn"]'))return;b.insertAdjacentHTML('beforebegin','<button data-a="trn" data-i="'+b.dataset.i+'">✎ '+T('نام','Rename')+'</button>')})}catch(e){}}}
H.trn=e=>{const t=db.tags[+e.dataset.i];if(!t)return;const n=(prompt(T('نام تازه‌ی برچسب','New tag name'),t.n)||'').trim().slice(0,30);if(!n||n===t.n)return;if(db.tags.some(x=>x.n===n))return toast(T('این نام وجود دارد','Name already exists'),1);
  db.acts.forEach(a=>{a.tags=(a.tags||[]).map(x=>x===t.n?n:x)});t.n=n;save();H.tags()};
})();
