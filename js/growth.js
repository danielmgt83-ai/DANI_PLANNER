"use strict";
/* DANI · growth.js — (۱) «برنامه‌ی فردا»: سه پیشنهاد (عقب‌افتاده‌ها، کمبود هدف هفتگی، موعد نزدیک هم‌دسته، عادت اخیر) با یک تأیید به برنامه‌ی فردا اضافه می‌شود
   (۲) تب «ماهانه و پیش‌بینی» در نتیجه‌گیری: ۳۰ روز اخیر در برابر ۳۰ روز قبل، فعالیت‌های برتر، و پیش‌بینی پایان هفته نسبت به هدف هفتگی هر فعالیت
   فقط می‌خواند؛ تنها نوشتن: افزودن موارد انتخاب‌شده به db.plans[فردا] (هم‌شکل با برنامه‌ی موجود). داده‌ی تنظیمات: db.set.pf {start} */
(function(){
const T=window.daniT;
const PF=()=>{const s=db.set;if(!s.pf||typeof s.pf!=='object')s.pf={};if(!/^\d\d:\d\d$/.test(s.pf.start||''))s.pf.start='09:00';return s.pf};
const wkOf=d=>{const a=weekStart(d);return[a,addD(a,6)]};
const mins=(a,b,id)=>sum((E(a,b)||[]).filter(e=>!id||e.actId===id));
function suggest(){const t=todayISO(),t1=addD(t,1),out=[],used=new Set((plan(t1)||[]).map(x=>x.actId));
  const acts=db.acts.filter(a=>a.active&&!a.arch&&a.cat!=='sleep'&&a.cat!=='rest'&&!used.has(a.id));
  const rec14=E(addD(t,-13),t)||[],ws=wkOf(t),dl=(()=>{try{return typeof modOn==='function'&&modOn('dl')?zDL().items.filter(x=>!x.done&&!x.arch&&dlOk(x)).map(x=>({x,ms:dlTs(x)-Date.now()})).filter(o=>o.ms>-864e5&&o.ms<7*864e5):[]}catch(e){return[]}})();
  const od={};try{plOverdue().forEach(o=>{od[o.x.actId]=(od[o.x.actId]||0)+1})}catch(e){}
  acts.forEach(a=>{let sc=0,why=[];
    if(od[a.id]){sc+=40;why.push(T('عقب‌افتاده','Overdue'))}
    if(a.goalWeek>0){const done=mins(ws[0],t,a.id),defi=a.goalWeek-done;if(defi>0){const left=Math.max(1,7-Math.max(0,((new Date(t+'T12:00:00').getDay()+1)%7)));sc+=Math.min(35,35*defi/a.goalWeek);why.push(T('تا هدف هفتگی '+mm(defi)+' مانده','Weekly goal gap '+mm(defi)))}}
    const dn=dl.filter(o=>o.x.cat===a.cat).sort((p,q)=>p.ms-q.ms)[0];
    if(dn){sc+=Math.max(10,32-Math.round(dn.ms/864e5)*4);why.push(T('موعد: ','Due: ')+dn.x.title)}
    const mine=rec14.filter(e=>e.actId===a.id);if(mine.length){sc+=Math.min(12,mine.length);}
    if(sc<=0)return;
    const avg=mine.length?Math.round(sum(mine)/mine.length/5)*5:0,dur=Math.max(15,Math.min(120,a.goalDay||avg||45));
    out.push({a,sc,why:why.join(' · ')||T('عادت اخیر','Recent habit'),dur})});
  out.sort((p,q)=>q.sc-p.sc);return out.slice(0,3)}
function tm2(h,m){return String(Math.floor(h/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0')}
let SEL={};
function card(){const l=suggest(),t1=addD(todayISO(),1);
  let h='<div class="c" id="pfcard">'+daniH('📅','برنامه‌ی فردا (پیشنهاد)','Tomorrow\'s plan (suggested)')+'<div class="m">'+fmtDL(t1)+'</div>';
  if(!l.length)return h+'<p class="m">'+T('پیشنهادی نیست؛ یا فردا پر است یا چیزی عقب نیفتاده. 👌','Nothing to suggest — tomorrow is planned or nothing is behind. 👌')+'</p><div class="row"><button class="chip" data-a="go" data-p="plan">'+T('برنامه','Plan')+'</button></div></div>';
  const st=PF().start.split(':').map(Number);let cur=st[0]*60+st[1];
  l.forEach((x,i)=>{x.s=tm2(cur,cur%60);cur+=x.dur;x.e=tm2(cur,cur%60);cur+=10;if(SEL[x.a.id]===undefined)SEL[x.a.id]=1});
  h+=l.map(x=>'<label class="cwr" style="display:flex;gap:8px;align-items:center"><input type="checkbox" data-pfk="'+esc(x.a.id)+'" '+(SEL[x.a.id]?'checked':'')+'><span style="flex:1;min-width:0" dir="auto"><b>'+esc(x.a.name)+'</b> · '+mm(x.dur)+' · '+x.s+'–'+x.e+'<br><span class="m">'+esc(x.why)+'</span></span></label>').join('');
  h+='<div class="row" style="margin-top:6px"><button class="p" data-a="pf_add">＋ '+T('افزودن به برنامه‌ی فردا','Add to tomorrow\'s plan')+'</button><label class="m">'+T('شروع','Start')+' <input type="time" id="pf-st" value="'+esc(PF().start)+'"></label></div></div>';
  return h}
document.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.pfk){SEL[t.dataset.pfk]=t.checked?1:0}else if(t&&t.id==='pf-st'&&/^\d\d:\d\d$/.test(t.value)){PF().start=t.value;save();render()}});
H.pf_add=()=>{const l=suggest(),t1=addD(todayISO(),1),st=PF().start.split(':').map(Number);let cur=st[0]*60+st[1],n=0;
  if(!db.plans)db.plans={};db.plans[t1]=db.plans[t1]||[];
  l.forEach(x=>{const s=tm2(cur,cur%60);cur+=x.dur;const e=tm2(cur,cur%60);cur+=10;if(!SEL[x.a.id])return;
    db.plans[t1].push({id:uid(),actId:x.a.id,start:s,end:e,goal:x.dur,status:'todo',reason:x.why});n++});
  if(!n)return toast(T('چیزی انتخاب نشده','Nothing selected'),1);save();toast(T('به برنامه‌ی فردا اضافه شد ✓ ('+fa(n)+')','Added to tomorrow ✓ ('+n+')'));render()};
window.daniTomorrowCard=card;
/* در تب «برنامه»ی میزکار، بالای صفحه (جمع‌شونده) */
{const _p=PX.plan;if(typeof _p==='function')PX.plan=function(){const h=_p.apply(this,arguments);let c='';try{c=card()}catch(e){}return(typeof h==='string'?'<details class="c" id="pfdet"'+(PF().open?' open':'')+'><summary style="cursor:pointer">'+daniH('📅','برنامه‌ی فردا (پیشنهاد)','Tomorrow\'s plan (suggested)')+'</summary>'+c.replace('<div class="c" id="pfcard">','<div id="pfcard">')+'</details>':'')+h}}

/* ---------- ماهانه و پیش‌بینی ---------- */
let OFF=0;
H.mn_off=e=>{OFF=Math.max(0,OFF+(+e.dataset.n));render()};
function monthly(){const t=todayISO(),b=addD(t,-30*OFF),a=addD(b,-29),pb=addD(a,-1),pa=addD(pb,-29);
  const es=E(a,b)||[],pes=E(pa,pb)||[],tot=sum(es),ptot=sum(pes);
  const days={};es.forEach(e=>{days[e.date]=(days[e.date]||0)+(e.min||0)});const ad=Object.keys(days).length,best=Object.entries(days).sort((x,y)=>y[1]-x[1])[0];
  const byA={};es.forEach(e=>{byA[e.actId]=(byA[e.actId]||0)+(e.min||0)});const top=Object.entries(byA).sort((x,y)=>y[1]-x[1]).slice(0,6),mx=top[0]?top[0][1]:1;
  const ch=ptot?Math.round((tot-ptot)/ptot*100):null;
  let h='<div class="c">'+daniH('🗓','گزارش ۳۰ روزه','30-day report')+'<div class="row"><button class="chip" data-a="mn_off" data-n="1">‹ '+T('۳۰ روز قبل‌تر','Earlier 30 days')+'</button><span class="m" style="flex:1;text-align:center">'+fmtD(a)+' → '+fmtD(b)+'</span><button class="chip" data-a="mn_off" data-n="-1" '+(OFF?'':'disabled')+'>'+T('بعدی','Later')+' ›</button></div>';
  h+='<div class="row" style="margin-top:8px;gap:10px;flex-wrap:wrap"><div><b style="font-size:1.4em">'+mm(tot)+'</b><div class="m">'+T('مجموع','Total')+'</div></div><div><b style="font-size:1.4em">'+fa(ad)+'</b><div class="m">'+T('روز فعال','Active days')+'</div></div><div><b style="font-size:1.4em">'+mm(ad?Math.round(tot/ad):0)+'</b><div class="m">'+T('میانگین هر روز فعال','Avg per active day')+'</div></div>'
    +(ch!==null?'<div><b style="font-size:1.4em;color:'+(ch>=0?'#22c55e':'#ef4444')+'">'+(ch>=0?'+':'')+fa(ch)+'٪</b><div class="m">'+T('نسبت به ۳۰ روز قبل','vs previous 30 days')+'</div></div>':'')+'</div>';
  if(best)h+='<p class="m">'+T('بهترین روز: ','Best day: ')+fmtD(best[0])+' — '+mm(best[1])+'</p>';
  h+=top.length?'<div class="m" style="margin-top:6px">'+T('فعالیت‌های برتر','Top activities')+'</div>'+top.map(([id,v])=>'<div><div class="row"><span style="color:'+aC(id)+'">●</span><span style="flex:1">'+esc(aN(id))+'</span><b>'+mm(v)+'</b></div><div class="bar"><i style="width:'+Math.round(v/mx*100)+'%;background:'+aC(id)+'"></i></div></div>').join(''):'<p class="m">'+T('در این بازه ثبتی نیست.','No entries in this range.')+'</p>';
  h+='</div>';
  /* پیش‌بینی هدف هفتگی (فقط برای این هفته) */
  const ws=wkOf(t),dow=(new Date(t+'T12:00:00').getDay()+1)%7,passed=dow+1,rem=7-passed;
  const items=db.acts.filter(x=>x.active&&!x.arch&&x.goalWeek>0).map(x=>{const done=mins(ws[0],t,x.id),pace=done/passed,proj=Math.round(done+pace*rem);return{x,done,proj,pc:Math.round(proj/x.goalWeek*100)}}).sort((p,q)=>p.pc-q.pc);
  h+='<div class="c">'+daniH('🔮','پیش‌بینی پایان هفته','Week-end forecast')+'<p class="m">'+T('با فرض همین سرعت روزانه تا پایان هفته. فقط برای فعالیت‌هایی که هدف هفتگی دارند.','At the current daily pace until week end. Only for activities that have a weekly goal.')+'</p>';
  h+=items.length?items.map(o=>{const c=o.pc>=100?'#22c55e':o.pc>=70?'#f59e0b':'#ef4444';return'<div><div class="row"><span style="flex:1">'+esc(o.x.name)+'</span><span class="m">'+mm(o.done)+' → ~'+mm(o.proj)+' / '+mm(o.x.goalWeek)+'</span><b style="color:'+c+'">'+fa(Math.min(999,o.pc))+'٪</b></div><div class="bar"><i style="width:'+Math.min(100,o.pc)+'%;background:'+c+'"></i></div></div>'}).join(''):'<p class="m">'+T('هیچ فعالیتی هدف هفتگی ندارد؛ در «فعالیت‌ها» یک هدف هفتگی بگذار.','No activity has a weekly goal — set one in Activities.')+'</p>';
  return h+'</div>'+(window.daniDlForecast?window.daniDlForecast():'')}
try{if(!RT.some(x=>x[0]==='mon'))RT.push(['mon',T('ماهانه و پیش‌بینی','Monthly & forecast')])}catch(e){}
{const _r=PG.res;PG.res=function(){if(rt==='mon')return tabBar(RT,rt,'r')+monthly();return _r.apply(this,arguments)}}
})();
