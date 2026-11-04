/* تقویم گوشی (v74): ۱) خروجی .ics حالا «بلوک‌های مشغول» را هم دارد (هفتگی/یک‌روزه). ۲) ورود از فایل تقویم (.ics) به بلوک‌های مشغول، با پیش‌نمایش و بدون تکرار.
   دکمه‌ی ورود داخل همان کارت «بلوک‌های مشغول» (برنامه ← مشغول) است؛ جای تازه ساخته نشد. بعد از plan2.js و dashboard-planner.js. */
(function(){'use strict';
const T=window.daniT,p2=v=>String(v).padStart(2,'0');
const BZ=()=>{const s=db.set;if(!s.bz||typeof s.bz!=='object')s.bz={};if(!Array.isArray(s.bz.items))s.bz.items=[];return s.bz};
const loc=(d,t)=>{const[y,m,x]=d.split('-').map(Number),[h,n]=t.split(':').map(Number);return y+p2(m)+p2(x)+'T'+p2(h)+p2(n)+'00'};
const esc2=t=>String(t==null?'':t).replace(/\\/g,'\\\\').replace(/;/g,'\;').replace(/,/g,'\\,').replace(/\r?\n/g,'\\n');
const fold=l=>{const enc=new TextEncoder();let o='',c='',n=0;for(const ch of l){const b=enc.encode(ch).length;if(n+b>73){o+=c+'\r\n ';c=ch;n=b}else{c+=ch;n+=b}}return o+c};
const DAYS=['SU','MO','TU','WE','TH','FR','SA'];
const isoOf=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
function busyEvents(){const L=[];let n=0;const now=new Date();
 BZ().items.forEach(b=>{if(!b.s||!b.e)return;let d='',rr='';
  if(b.date){d=b.date}else if(Array.isArray(b.days)&&b.days.length){const ds=b.days.filter(i=>i>=0&&i<=6);if(!ds.length)return;
   for(let k=0;k<7;k++){const x=new Date(now.getFullYear(),now.getMonth(),now.getDate()+k);if(ds.includes(x.getDay())){d=isoOf(x);break}}
   rr='FREQ=WEEKLY;BYDAY='+ds.map(i=>DAYS[i]).join(',')}else return;
  L.push('BEGIN:VEVENT','UID:dani-bz-'+b.id+'@dani.local','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z','DTSTART:'+loc(d,b.s),'DTEND:'+loc(d,b.e),'SUMMARY:'+esc2(b.t||'DANI'));
  if(rr)L.push('RRULE:'+rr);L.push('TRANSP:OPAQUE','END:VEVENT');n++});
 return{L,n}}
if(typeof icsBuild==='function'){const _ib=icsBuild;
 icsBuild=function(){const r=_ib.apply(this,arguments);try{if(db.set.icsBz===0)return r;const b=busyEvents();if(b.n){const i=r.text.lastIndexOf('END:VCALENDAR');r.text=r.text.slice(0,i)+b.L.map(fold).join('\r\n')+'\r\n'+r.text.slice(i);r.nr=(r.nr||0)+b.n}}catch(e){console.error('calio',e)}return r}}
/* ---- ورود ---- */
function unfold(t){return t.replace(/\r\n[ \t]/g,'').replace(/\n[ \t]/g,'').split(/\r?\n/)}
const unesc=s=>String(s||'').replace(/\\n/gi,' ').replace(/\\([,;\\])/g,'$1');
function dt(v,prop){ // → Date محلی یا null (تمام‌روز نادیده)
 if(/VALUE=DATE(?!-)/.test(prop)&&!/T/.test(v))return null;const m=/^(\d{4})(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d)?(Z)?$/.exec(v.trim());if(!m)return null;
 return m[7]?new Date(Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5])):new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5])}
function parse(text){const out=[];let ev=null;
 unfold(text).forEach(l=>{if(l==='BEGIN:VEVENT'){ev={}}else if(l==='END:VEVENT'){if(ev&&ev.s&&ev.e)out.push(ev);ev=null}else if(ev){const i=l.indexOf(':');if(i<0)return;const k=l.slice(0,i),v=l.slice(i+1),n=k.split(';')[0].toUpperCase();
   if(n==='SUMMARY')ev.t=unesc(v);else if(n==='UID')ev.uid=v.trim();else if(n==='DTSTART')ev.s=dt(v,k);else if(n==='DTEND')ev.e=dt(v,k);else if(n==='RRULE')ev.rr=v}});
 const now=new Date(),lim=new Date(now.getFullYear(),now.getMonth(),now.getDate()+90),res=[];
 out.forEach(ev=>{if(isNaN(ev.s)||isNaN(ev.e))return;const same=isoOf(ev.s)===isoOf(ev.e);if(!same||ev.e<=ev.s)return;
  const s=p2(ev.s.getHours())+':'+p2(ev.s.getMinutes()),e=p2(ev.e.getHours())+':'+p2(ev.e.getMinutes()),t=(ev.t||'').trim().slice(0,60)||T('رویداد تقویم','Calendar event'),uid=ev.uid||(t+ev.s.getTime());
  const w=ev.rr&&/FREQ=WEEKLY/.test(ev.rr);
  if(w){const m=/BYDAY=([A-Z,]+)/.exec(ev.rr),days=m?m[1].split(',').map(x=>DAYS.indexOf(x.replace(/[^A-Z]/g,''))).filter(i=>i>=0):[ev.s.getDay()];if(days.length)res.push({uid,t,s,e,days,date:''});}
  else if(!ev.rr){if(ev.s<new Date(now.getFullYear(),now.getMonth(),now.getDate())||ev.s>lim)return;res.push({uid,t,s,e,days:[],date:isoOf(ev.s)})}});
 return res}
let PEND=[];
H.cio_pick=()=>{let i=document.getElementById('cio-f');if(!i){i=document.createElement('input');i.type='file';i.id='cio-f';i.accept='.ics,text/calendar';i.style.display='none';document.body.appendChild(i);
  i.addEventListener('change',()=>{const f=i.files&&i.files[0];i.value='';if(!f)return;const r=new FileReader();r.onload=()=>{try{PEND=parse(String(r.result));const have=new Set(BZ().items.map(b=>b.uid).filter(Boolean));PEND=PEND.filter(x=>!have.has(x.uid)).slice(0,60);
     if(!PEND.length)return toast(T('رویداد تازه‌ای برای ورود پیدا نشد (فقط رویدادهای تک‌روزه‌ی ۹۰ روز آینده و هفتگی‌ها)','No new events found (only single-day events in the next 90 days and weekly ones)'),1);
     modal('<div style="max-width:400px"><h3>'+T('ورود از تقویم','Import from calendar')+'</h3><p class="m">'+T('این‌ها به «بلوک‌های مشغول» اضافه می‌شوند (در این ساعت‌ها اعلان نمی‌آید):','These will be added to Busy blocks (no notifications during them):')+'</p><div style="max-height:40vh;overflow:auto">'
      +PEND.map(x=>'<div class="dyp"><span style="flex:1;min-width:0"><b>'+esc(x.t)+'</b> <span class="m">'+fa(x.s)+'–'+fa(x.e)+' · '+(x.date?fmtD(x.date):x.days.map(i=>zWD[i]).join(' '))+'</span></span></div>').join('')+'</div>'
      +'<div class="row" style="margin-top:10px"><button class="p" data-a="cio_ok">'+T('افزودن ','Add ')+fa(PEND.length)+'</button><button data-a="cl">'+T('انصراف','Cancel')+'</button></div></div>')}catch(e){toast(T('خواندن فایل ناموفق بود','Could not read the file'),1)}};r.readAsText(f)})}
 i.click()};
H.cio_ok=()=>{const A=BZ();let n=0;PEND.forEach(x=>{if(A.items.length>=100)return;A.items.push({id:uid(),t:x.t,s:x.s,e:x.e,dnd:1,days:x.days,date:x.date,uid:x.uid});n++});PEND=[];save();try{closeM()}catch(e){}toast(T(fa(n)+' بلوک اضافه شد',fa(n)+' blocks added'));render()};
/* دکمه داخل کارت بلوک‌های مشغول */
const _r=render;
render=function(){_r.apply(this,arguments);try{if(document.getElementById('cio-row'))return;const hs=[...document.querySelectorAll('#pg .c h3')].find(h=>/بلوک‌های مشغول|Busy blocks/.test(h.textContent));if(!hs)return;const c=hs.closest('.c');
  c.insertAdjacentHTML('beforeend','<div class="row" id="cio-row" style="margin-top:8px"><button class="chip" data-a="cio_pick">📥 '+T('ورود از فایل تقویم (.ics)','Import from calendar file (.ics)')+'</button><label class="chip"><input type="checkbox" data-ch="cio_ex" '+(db.set.icsBz===0?'':'checked')+'> '+T('در خروجی تقویم هم باشند','Include in calendar export')+'</label></div>')}catch(e){}};
document.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.ch==='cio_ex'){db.set.icsBz=t.checked?1:0;save()}});
})();
