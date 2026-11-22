/* تعویض تک‌تک آیکون‌ها (v73): داخل «استودیوی آیکون» (تنظیمات ← زبان و ظاهر ← تم‌ها). هر یک از ۱۶ آیکون اصلی با ایموجی/نویسه‌ی دلخواه عوض می‌شود؛
   ذخیره: db.set.icmap={کلید:متن}. بازنشانی تکی یا همه. `icon(k)` در themes-engine.js این نگاشت را می‌خواند. بعد از dashboard-planner.js. */
(function(){'use strict';
if(typeof iconStudio!=='function')return;
const T=window.daniT;
const NAMES={home:['خانه','Home'],today:['امروز','Today'],plan:['برنامه','Plan'],dash:['میزکار','Desk'],dl:['موعدها','Deadlines'],goals:['اهداف','Goals'],acts:['فعالیت‌ها','Activities'],cal:['تقویم','Calendar'],notes:['یادداشت‌ها','Notes'],res:['نتیجه','Results'],rep:['گزارش','Report'],stats:['آمار','Stats'],time:['اعلان و زمان','Alerts & time'],look:['ظاهر','Look'],data:['داده‌ها','Data'],set:['تنظیمات','Settings']};
const EXTRA={hab:['عادت‌ها','Habits'],rem:['یادآوری‌ها','Reminders'],qt:['جمله‌ها','Quotes'],acd:['آکادمی','Academy'],pj:['پروژه‌ها','Projects'],cm:['انجام‌شده','Done'],mo:['بیشتر','More'],tmr:['شب/خواب','Night'],mx:['ماتریس','Matrix'],day:['امروز','Today'],plan2:['برنامه','Plan']};
/* فهرست از منبع واحد منو (menureg.js): آیتم تازه‌ی منو خودکار اینجا هم می‌آید. کلیدهای هم‌معنی (day=home، plan2=plan) تکرار نمی‌شوند */
const ALIAS={day:'home',plan2:'plan',pj:'dl',acd:'acts'};
const keysNow=()=>{let ks=Object.keys(NAMES);try{if(window.daniMenu)daniMenu.keys().forEach(k=>{if(!ALIAS[k]&&ks.indexOf(k)<0&&typeof icon==='function'&&(ICONS[k]||(db.set.icmap||{})[k]))ks.push(k)})}catch(e){}return ks};
const nm=k=>NAMES[k]||EXTRA[k]||[k,k];
const SET=['🏠','⏳','📅','🧭','🎯','🏆','⭐','🌟','✨','🔥','⚡','💡','📌','📝','✏️','📚','🎓','💼','🧠','💪','🏃','🧘','☕','🌙','☀️','🌿','🌊','🎧','🔔','⏰','📊','📈','🧩','🛠','⚙️','🎨','🗂','💾','🔒','❤️','🚀','🌈','🦉','🐺','🗡','🔮','🍃','🧿'];
const MAP=()=>db.set.icmap||(db.set.icmap={});
const refresh=()=>{try{document.querySelectorAll('#nav a[data-p] .ic,#pg [data-a="tab"][data-k] .ic').forEach(e=>e.remove())}catch(x){}};
const _is=iconStudio;
iconStudio=function(){let h=_is.apply(this,arguments);try{const m=MAP();
  h=h.replace(/<\/div>\s*$/,'<details style="margin-top:10px"><summary style="cursor:pointer"><b>🧩 '+T('تعویض تک‌تک آیکون‌ها','Swap individual icons')+'</b>'+(Object.keys(m).length?' · '+fa(Object.keys(m).length):'')+'</summary><div class="row" style="gap:6px;margin-top:8px">'
   +keysNow().map(k=>'<button class="chip" data-a="ics_pick" data-k="'+k+'" style="display:flex;flex-direction:column;align-items:center;gap:2px;min-width:68px;padding:6px 4px"><span style="font-size:1.3em;display:flex;width:1.5em;height:1.5em;align-items:center;justify-content:center">'+icon(k)+'</span><span class="m" style="font-size:.72em">'+T(nm(k)[0],nm(k)[1])+'</span></button>').join('')
   +'</div>'+(Object.keys(m).length?'<div class="row" style="margin-top:8px"><button class="chip" data-a="ics_reset" data-k="">↺ '+T('بازنشانی همه‌ی آیکون‌ها','Reset all icons')+'</button></div>':'')+'</details></div>')}catch(e){console.error('iconswap',e)}return h};
H.ics_pick=e=>{const k=e.dataset.k;if(!keysNow().includes(k))return;
  modal('<div style="max-width:380px"><h3>'+T('آیکون «'+nm(k)[0]+'»','Icon “'+nm(k)[1]+'”')+'</h3><div class="row" style="gap:6px">'+SET.map(x=>'<button class="chip" data-a="ics_set" data-k="'+k+'" data-v="'+x+'" style="font-size:1.3em;padding:6px 8px">'+x+'</button>').join('')+'</div>'
   +'<div class="row" style="margin-top:10px;align-items:center"><input id="ics-c" maxlength="2" placeholder="'+T('یا یک نویسه/ایموجی دلخواه','or any character/emoji')+'" style="flex:1"><button class="p" data-a="ics_set" data-k="'+k+'" data-v="__c">'+T('تأیید','OK')+'</button></div>'
   +'<div class="row" style="margin-top:10px"><button data-a="ics_reset" data-k="'+k+'">↺ '+T('آیکون پیش‌فرض','Default icon')+'</button><button data-a="cl">'+T('انصراف','Cancel')+'</button></div></div>')};
H.ics_set=e=>{const k=e.dataset.k;let v=e.dataset.v;if(v==='__c'){const i=document.getElementById('ics-c');v=i?i.value.trim():''}if(!keysNow().includes(k)||!v)return;MAP()[k]=[...v].slice(0,2).join('');save();try{closeM()}catch(x){}refresh();render();try{decorateIcons()}catch(x){}};
H.ics_reset=e=>{const k=e.dataset.k;if(k)delete MAP()[k];else db.set.icmap={};save();try{closeM()}catch(x){}refresh();render();try{decorateIcons()}catch(x){}};
window.daniIconSwap={names:NAMES,keys:keysNow};
})();
