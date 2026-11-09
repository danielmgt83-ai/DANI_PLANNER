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
   if(!worst)return out;const t0=todayISO(),q=worst.q,n=Math.max(1,Math.round(q.lateDue)),ti=worst.x.title.slice(0,40);
   const dd=Math.round((new Date(worst.x.dt+'T00:00').getTime()-new Date(t0+'T00:00').getTime())/864e5);
   const lvl=n>=7||dd<=2&&n>=2?3:n>=3||dd<=5?2:1;
   const rest=Math.max(0,Math.round((q.target||0)-(q.todayMin||0)));
   const hm=m=>m>=60?Math.floor(m/60)+'h'+(m%60?(m%60)+'m':''):m+'m';
   const tail=rest>=5?T(' امروز حدود '+hm(rest)+' کار لازم است.',' About '+hm(rest)+' of work is needed today.'):'';
   const body=[null,
    T('«'+ti+'»: با ریتم این روزها حدود '+n+' روز دیرتر از موعد می‌رسی.'+tail,'“'+ti+'”: at your current pace you finish about '+n+' day(s) late.'+tail),
    T('⚠ «'+ti+'» در خطر است: '+n+' روز عقب از موعد.'+tail,'⚠ “'+ti+'” is at risk: '+n+' day(s) behind.'+tail),
    T('🚨 «'+ti+'» جدی است: '+n+' روز بعد از موعد تمام می‌شود'+(dd>=0?' و '+dd+' روز مانده':'')+'.'+tail+' همین الان شروع کن.','🚨 “'+ti+'” is serious: finishing '+n+' day(s) after the deadline'+(dd>=0?' with '+dd+' day(s) left':'')+'.'+tail+' Start now.')][lvl];
   const active=q.todayMin>0&&q.todayMin>=(q.target||q.base||0)*(lvl===3?1:.6);
   for(let i=0;i<2;i++){const d=addD(t0,i),at=atOf(d,o.nagT);if(i===0&&active)continue;
    const ok=a=>a>now+2000&&!(typeof inQuiet==='function'&&inQuiet(a));
    if(ok(at))out.push({id:hs('dlw'+d),at,title:lvl===3?'DANI 🚨':'DANI ⏳',body,ch:'dani-remind-v2',key:'dlw-'+d});
    if(lvl===3&&ok(at-4*36e5))out.push({id:hs('dlx'+d),at:at-4*36e5,title:'DANI ⏳',body,ch:'dani-remind-v2',key:'dlw-'+d})}
  }catch(e){console.error('dlnag',e)}
  return out});
})();
