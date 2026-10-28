"use strict";
/* DANI · capsule.js — مدیریت «کپسول» (همان «تعهد فردا» در یادداشت پایان روز):
   نوشتن کپسول برای فردا، ویرایش و حذف کپسول‌های اخیر، از یک جا. روی کارت «✦ کپسول دیروز» هم دکمه‌ی «مدیریت» اضافه می‌شود.
   داده همان db.days[تاریخ].tomorrow است (چیزی جدا ذخیره نمی‌شود). */
(function(){
const T=window.daniT;
const days=()=>Object.keys(db.days).filter(k=>db.days[k]&&db.days[k].tomorrow).sort().reverse().slice(0,6);
function html(){const t=todayISO();
  let h=''+daniH('✦','کپسول','Capsule')+'<p class="m">'+T('کپسول یک جمله‌ی کوتاه است که شب برای فردای خودت می‌نویسی (تعهد فردا). صبح بعد در خانه به‌صورت «کپسول دیروز» می‌بینی و با «انجام دادم» می‌بندی.','A capsule is one short sentence you write tonight for tomorrow\'s you. Tomorrow morning it shows on Home as "Yesterday\'s capsule" and you close it with "Done".')+'</p>'
   +'<label>'+T('کپسول برای فردا (نوشتن / تغییر)','Capsule for tomorrow (write / change)')+'</label><input id="cap-new" maxlength="200" style="width:100%" value="'+esc((db.days[t]||{}).tomorrow||'')+'" placeholder="'+esc(T('فردا اول از همه…','Tomorrow, first thing…'))+'">'
   +'<div class="row" style="margin-top:6px"><button class="p" data-a="cap_save">'+T('ذخیره','Save')+'</button></div>';
  const l=days().filter(d=>d!==t);
  if(l.length)h+='<div class="m" style="margin-top:10px">'+T('کپسول‌های قبلی','Earlier capsules')+'</div>'+l.map(d=>'<div class="cwr"><span style="flex:1;min-width:0" dir="auto">'+esc(fmtD(d))+' — '+esc(db.days[d].tomorrow)+(db.caps['cap'+d]?' ✓':'')+'</span><button class="d" data-a="cap_del" data-d="'+d+'" aria-label="delete">✕</button></div>').join('');
  return h+'<div class="row" style="margin-top:12px"><button class="p" data-a="h2_close">'+T('تمام','Done')+'</button></div>'}
H.cap_edit=()=>{modal(html())};
H.cap_save=()=>{const t=todayISO(),v=($('#cap-new')||{}).value||'';const d=db.days[t]=db.days[t]||{};d.tomorrow=String(v).slice(0,200);if(save()){toast(T('ذخیره شد','Saved'));modal(html());render()}};
H.cap_del=e=>{const d=e.dataset.d;if(db.days[d]){db.days[d].tomorrow='';delete db.caps['cap'+d];if(save()){modal(html());render()}}};
function decorate(){document.querySelectorAll('#pg .c.cap').forEach(c=>{if(c.querySelector('[data-a=cap_edit]'))return;const r=document.createElement('div');r.className='row';r.style.marginTop='6px';r.innerHTML='<button class="chip" data-a="cap_edit">✎ '+T('مدیریت کپسول (نوشتن/ویرایش/حذف)','Manage capsule (write/edit/delete)')+'</button>';c.appendChild(r)})}
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{decorate()}catch(e){}return r}}
})();
