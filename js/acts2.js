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
})();
