/* هشدار هوشمند موعد (v84، اختیاری): اگر با ریتم واقعی ۱۴ روز اخیر دیرتر از موعد می‌رسی، هر روز در ساعتِ انتخابی یک اعلان.
   خاموش پیش‌فرض؛ تنظیمش در «موعدها ← تنظیمات موعد». بعد از pace.js. کلید: dlw-<تاریخ>. */
(function(){'use strict';
const T=window.daniT;
const hs=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return 4e8+Math.abs(h)%1e8};
const atOf=(d,t)=>{const[y,m,dd]=d.split('-').map(Number),[h,n]=t.split(':').map(Number);return new Date(y,m-1,dd,h,n).getTime()};
(window.daniExtraPlan=window.daniExtraPlan||[]).push(now=>{const out=[];
  try{const o=window.daniDlCard&&window.daniDlCard.D();if(!o||!o.nag||!window.daniPace||typeof modOn==='function'&&!modOn('dl'))return out;
   const P=(window.daniProjects&&daniProjects.list?daniProjects.list():[]).filter(p=>!p.arch&&p.dl),A=zDL().items;let worst=null;
   P.forEach(p=>{const x=A.find(q=>q.id===p.dl&&!q.done&&!q.arch&&dlOk(q));if(!x)return;const q=window.daniPace(p);if(q&&!q.done&&q.left>0&&q.lateDue>0&&(!worst||q.lateDue>worst.q.lateDue))worst={x,q}});
   if(!worst)return out;const t0=todayISO(),n=Math.max(1,Math.round(worst.q.lateDue));
   const body=T('«'+worst.x.title.slice(0,40)+'»: با ریتم این روزها حدود '+n+' روز دیرتر از موعد می‌رسی. امروز کمی جبران کن.','“'+worst.x.title.slice(0,40)+'”: at your current pace you finish about '+n+' day(s) after the deadline. Make up a little today.');
   for(let i=0;i<2;i++){const d=addD(t0,i),at=atOf(d,o.nagT);if(at>now+2000&&!(typeof inQuiet==='function'&&inQuiet(at)))out.push({id:hs('dlw'+d),at,title:'DANI ⏳',body,ch:'dani-remind-v2',key:'dlw-'+d})}
  }catch(e){console.error('dlnag',e)}
  return out});
})();
