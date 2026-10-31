"use strict";
/* DANI · share-csv.js — مرحله ۶: (۱) «کارت اشتراک پیشرفت» (تصویر PNG از هفته/۳۰ روز/امروز؛ تب «کارت اشتراک» در نتیجه‌گیری) و (۲) «ورود CSV» (تنظیمات ← داده‌ها).
   کارت: فقط می‌خواند؛ گزینه‌ها db.set.sc {p:'w'|'m'|'t', names, habits, dark, who}. نام فعالیت‌ها را می‌شود پنهان کرد. ذخیره/اشتراک با daniSaveFile (اپ) یا Web Share/دانلود (وب).
   ورود CSV: هر دو سرستون فارسی/انگلیسیِ خروجی خود DANI و فایل‌های دیگر (جداکننده , ; Tab؛ تاریخ میلادی/شمسی؛ مدت به دقیقه، ساعت:دقیقه یا «1h 30m»)؛ پیش‌نمایش قبل از ورود، حذف تکراری‌ها، ساخت فعالیت‌های تازه (اختیاری)، snap() قبل از نوشتن. */
(function(){
const T=window.daniT;
const say=(m,b)=>{try{toast(m,b)}catch(e){}};
const SC=()=>{const s=db.set;if(!s.sc||typeof s.sc!=='object')s.sc={};const o=s.sc;if(!/^[wmty]$/.test(o.p||''))o.p='w';if(o.names===undefined)o.names=1;if(o.habits===undefined)o.habits=1;if(o.dark===undefined)o.dark=1;if(typeof o.who!=='string')o.who='';return o};

/* ---------- کارت اشتراک ---------- */
function range(p){const t=todayISO();if(p==='t')return[t,t,T('امروز','Today')];if(p==='m')return[addD(t,-29),t,T('۳۰ روز اخیر','Last 30 days')];if(p==='y')return[addD(t,-364),t,T('یک سال اخیر','Last 12 months')];const a=weekStart(t);return[a,t,T('این هفته','This week')]}
function stats(){const o=SC(),[a,b,lab]=range(o.p),es=E(a,b)||[],tot=sum(es),days={},byA={};
  es.forEach(e=>{days[e.date]=(days[e.date]||0)+(e.min||0);byA[e.actId]=(byA[e.actId]||0)+(e.min||0)});
  const ad=Object.keys(days).length,top=Object.entries(byA).sort((x,y)=>y[1]-x[1]).slice(0,4),best=Object.entries(days).sort((x,y)=>y[1]-x[1])[0];
  let hb=null;try{if(o.habits){const hs=hItems().filter(h=>!h.arch);if(hs.length){let e=0,d=0,cur=0;hs.forEach(h=>{const s=hStats(h);cur=Math.max(cur,s.cur||0);const w=(o.p==='m'||o.p==='y')?s.m:s.w;e+=w.e;d+=w.dn});hb={pct:e?Math.round(d/e*100):null,cur}}}}catch(x){}
  return{a,b,lab,tot,ad,top,best,hb,avg:ad?Math.round(tot/ad):0}}
const clamp=(c,w,t)=>{while(t.length>1&&c.measureText(t).width>w)t=t.slice(0,-1);return t};
function draw(cv){const o=SC(),s=stats(),W=1080,Hh=1350,c=cv.getContext('2d'),rtl=!LANGEN(),dark=!!o.dark;cv.width=W;cv.height=Hh;
  const ac=/^#[0-9a-f]{6}$/i.test(db.set.ac||'')?db.set.ac:'#2563eb',fg=dark?'#f1f5f9':'#0f172a',mu=dark?'#94a3b8':'#64748b';
  const g=c.createLinearGradient(0,0,W,Hh);if(dark){g.addColorStop(0,'#0b1220');g.addColorStop(1,'#1e293b')}else{g.addColorStop(0,'#f8fafc');g.addColorStop(1,'#e2e8f0')}c.fillStyle=g;c.fillRect(0,0,W,Hh);
  c.globalAlpha=.18;c.fillStyle=ac;c.beginPath();c.arc(rtl?120:W-120,120,260,0,7);c.fill();c.globalAlpha=1;
  const FF='Vazirmatn,Tahoma,"Segoe UI",sans-serif',X=rtl?W-80:80,al=rtl?'right':'left';c.direction=rtl?'rtl':'ltr';c.textAlign=al;c.textBaseline='alphabetic';
  const tx=(t,y,size,col,wt)=>{c.font=(wt||'400')+' '+size+'px '+FF;c.fillStyle=col;c.fillText(t,X,y)};
  const N=n=>rtl?fa(n):String(n);
  tx('DANI',150,64,ac,'800');tx(s.lab+' · '+fmtD(s.a)+(s.a!==s.b?' → '+fmtD(s.b):''),210,34,mu);
  if(o.who)tx(clamp(c,W-160,o.who),262,36,fg,'700');
  tx(T('مجموع زمان ثبت‌شده','Total time logged'),380,34,mu);
  tx(mm(s.tot),470,96,fg,'800');
  /* سه کارت آمار */
  const cw=(W-160-40)/3,cards=[[T('روز فعال','Active days'),N(s.ad)],[T('میانگین هر روز','Avg / day'),mm(s.avg)],[T('بهترین روز','Best day'),s.best?mm(s.best[1]):'—']];
  cards.forEach((k,i)=>{const x0=rtl?W-80-cw*(i+1)-20*i:80+(cw+20)*i;c.fillStyle=dark?'rgba(255,255,255,.07)':'rgba(15,23,42,.06)';c.beginPath();c.roundRect?c.roundRect(x0,520,cw,150,22):c.rect(x0,520,cw,150);c.fill();
    c.textAlign='center';c.font='700 38px '+FF;c.fillStyle=fg;c.fillText(clamp(c,cw-20,k[1]),x0+cw/2,592);c.font='400 26px '+FF;c.fillStyle=mu;c.fillText(clamp(c,cw-20,k[0]),x0+cw/2,640);c.textAlign=al});
  /* فعالیت‌های برتر */
  tx(T('فعالیت‌های برتر','Top activities'),740,36,fg,'700');
  const mx=s.top[0]?s.top[0][1]:1,bw=W-160;
  s.top.forEach(([id,v],i)=>{const y=800+i*100,col=aC(id),nm=o.names?aN(id):T('فعالیت ','Activity ')+N(i+1);
    c.font='500 30px '+FF;c.fillStyle=fg;c.textAlign=al;c.fillText(clamp(c,bw-260,nm),X,y);c.textAlign=rtl?'left':'right';c.fillStyle=mu;c.fillText(mm(v),rtl?80:W-80,y);c.textAlign=al;
    c.fillStyle=dark?'rgba(255,255,255,.1)':'rgba(15,23,42,.1)';c.fillRect(80,y+16,bw,16);c.fillStyle=col;const w=Math.max(8,bw*v/mx);c.fillRect(rtl?W-80-w:80,y+16,w,16)});
  if(!s.top.length)tx(T('در این بازه ثبتی نیست','No entries in this range'),820,30,mu);
  /* عادت‌ها */
  if(s.hb){const y=1230;c.fillStyle=dark?'rgba(255,255,255,.07)':'rgba(15,23,42,.06)';c.beginPath();c.roundRect?c.roundRect(80,y-60,W-160,120,22):c.rect(80,y-60,W-160,120);c.fill();
    tx('🔥 '+T('زنجیره‌ی عادت: ','Habit streak: ')+N(s.hb.cur)+T(' روز',' days')+(s.hb.pct!==null?'   ✅ '+N(s.hb.pct)+(rtl?'٪':'%')+T(' انجام عادت‌ها',' habits done'):''),y+10,34,fg,'700')}
  tx('DANI Planner',1318,26,mu);return cv}
let cvEl=null;
function preview(){const c=document.getElementById('scv');if(c)try{draw(c)}catch(e){console.error('share card',e)}}
async function blob(){const c=document.createElement('canvas');draw(c);return new Promise(r=>c.toBlob(r,'image/png'))}
H.sc_save=async()=>{try{const b=await blob(),name='dani-progress-'+todayISO()+'.png';
  if(window.daniSaveFile&&window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform()){await window.daniSaveFile(name,b);return}
  try{const f=new File([b],name,{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'DANI'});return}}catch(e){if(e&&e.name==='AbortError')return}
  const u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000);say(T('تصویر ساخته شد','Image created'))}catch(e){say(String(e&&e.message||e),1)}};
H.sc_p=e=>{SC().p=e.dataset.p;save();render()};
H.sc_t=e=>{const k=e.dataset.k,o=SC();o[k]=o[k]?0:1;save();render()};
document.addEventListener('input',e=>{const t=e.target;if(t&&t.id==='sc-who'){SC().who=String(t.value).slice(0,40);save();preview()}});
function shareTab(){const o=SC(),chip=(k,l)=>'<button class="chip '+(o[k]?'on':'')+'" data-a="sc_t" data-k="'+k+'">'+l+'</button>';
  setTimeout(preview,0);
  return'<div class="c" id="sccard">'+daniH('🖼','کارت اشتراک پیشرفت','Progress share card')+'<p class="m">'+T('یک تصویر زیبا از پیشرفتت برای فرستادن به دوستان. هر چیزی را که نمی‌خواهی دیده شود خاموش کن؛ هیچ چیز جایی فرستاده نمی‌شود مگر خودت بفرستی.','A neat picture of your progress to send to friends. Turn off anything you don’t want shown; nothing is sent anywhere unless you send it.')+'</p>'
   +'<div class="row">'+[['t',T('امروز','Today')],['w',T('این هفته','This week')],['m',T('۳۰ روز','30 days')],['y',T('یک سال','1 year')]].map(x=>'<button class="chip '+(o.p===x[0]?'on':'')+'" data-a="sc_p" data-p="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>'
   +'<div class="row" style="margin-top:6px">'+chip('names','🏷 '+T('نام فعالیت‌ها','Activity names'))+chip('habits','🔥 '+T('عادت‌ها','Habits'))+chip('dark','🌙 '+T('پس‌زمینه‌ی تیره','Dark background'))+'</div>'
   +'<div class="row" style="margin-top:6px"><input id="sc-who" maxlength="40" value="'+esc(o.who)+'" placeholder="'+T('نام یا عنوان روی کارت (اختیاری)','Name or caption on the card (optional)')+'" style="flex:1;min-width:0"></div>'
   +'<div style="margin:10px 0;text-align:center"><canvas id="scv" style="width:100%;max-width:340px;border-radius:14px;box-shadow:0 4px 18px rgba(0,0,0,.25)"></canvas></div>'
   +'<div class="row"><button class="p" data-a="sc_save">⬇ '+T('ذخیره / اشتراک‌گذاری تصویر','Save / share image')+'</button></div></div>'}
try{if(typeof RT!=='undefined'&&!RT.some(x=>x[0]==='shr'))RT.push(['shr',T('کارت اشتراک','Share card')])}catch(e){}
{const _r=PG.res;PG.res=function(){if(typeof rt!=='undefined'&&rt==='shr')return tabBar(RT,rt,'r')+shareTab();return _r.apply(this,arguments)}}

/* ---------- ورود CSV ---------- */
const DIG={'۰':0,'۱':1,'۲':2,'۳':3,'۴':4,'۵':5,'۶':6,'۷':7,'۸':8,'۹':9,'٠':0,'١':1,'٢':2,'٣':3,'٤':4,'٥':5,'٦':6,'٧':7,'٨':8,'٩':9};
const latin=s=>String(s==null?'':s).replace(/[۰-۹٠-٩]/g,c=>DIG[c]).replace(/[٫]/g,'.').replace(/[،]/g,',').trim();
function parseCSV(txt){txt=txt.replace(/^\ufeff/,'');const first=txt.split(/\r?\n/,1)[0]||'';
  const cnt=ch=>(first.match(new RegExp(ch==='\t'?'\t':'\\'+ch,'g'))||[]).length,dl=[',',';','\t'].sort((a,b)=>cnt(b)-cnt(a))[0];
  const rows=[];let r=[],f='',q=false,i=0;
  for(;i<txt.length;i++){const c=txt[i];
    if(q){if(c==='"'){if(txt[i+1]==='"'){f+='"';i++}else q=false}else f+=c}
    else if(c==='"'&&f==='')q=true;
    else if(c===dl){r.push(f);f=''}
    else if(c==='\n'||c==='\r'){if(c==='\r'&&txt[i+1]==='\n')i++;r.push(f);f='';if(r.some(x=>x.trim()!==''))rows.push(r);r=[];if(rows.length>20001)break}
    else f+=c}
  if(f!==''||r.length){r.push(f);if(r.some(x=>x.trim()!==''))rows.push(r)}
  return rows}
const SYN={date:['date','day','تاریخ','روز'],start:['start','from','begin','starttime','شروع','ساعتشروع'],end:['end','to','finish','endtime','پایان','ساعتپایان'],min:['minutes','min','mins','duration','دقیقه','مدت'],hrs:['hours','hour','h','ساعت'],act:['activity','task','project','name','فعالیت','عنوان'],sub:['subitem','sub','subactivity','زیرمجموعه','زیرفعالیت'],cat:['category','دسته'],note:['note','notes','description','comment','یادداشت','توضیح','توضیحات']};
const norm=s=>latin(s).toLowerCase().replace(/[\s_\-\u200c]/g,'');
function mapCols(h){const m={};h.forEach((x,i)=>{const n=norm(x);for(const k in SYN)if(m[k]===undefined&&SYN[k].includes(n))m[k]=i});return m}
function pDate(s){s=latin(s);let m=s.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/);let y,mo,d;
  if(m){y=+m[1];mo=+m[2];d=+m[3]}else{m=s.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})/);if(!m)return null;d=+m[1];mo=+m[2];y=+m[3]}
  if(mo<1||mo>12||d<1||d>31)return null;if(y<1700){const g=j2g(y,mo,d);y=g[0];mo=g[1];d=g[2]}
  const iso_=y+'-'+pad(mo)+'-'+pad(d),chk=new Date(iso_+'T12:00:00');if(isNaN(chk)||chk.getDate()!==d)return null;return iso_}
function pTime(s){s=latin(s).toLowerCase();const m=s.match(/^(\d{1,2})[:.](\d{2})(?::\d{2})?\s*(am|pm)?$/);if(!m)return null;let h=+m[1];const mi=+m[2];if(m[3]){if(h<1||h>12)return null;if(m[3]==='pm'&&h<12)h+=12;if(m[3]==='am'&&h===12)h=0}if(h>23||mi>59)return null;return pad(h)+':'+pad(mi)}
function pMin(s,hours){s=latin(s).toLowerCase();if(!s)return null;let m=s.match(/^(\d+):(\d{1,2})(?::\d{1,2})?$/);if(m)return +m[1]*60+ +m[2];
  m=s.match(/^(?:(\d+(?:\.\d+)?)\s*h(?:ours?|rs?)?)?\s*(?:(\d+(?:\.\d+)?)\s*m(?:in(?:ute)?s?)?)?$/);if(m&&(m[1]||m[2]))return Math.round((+m[1]||0)*60+(+m[2]||0));
  m=s.match(/^(\d+(?:\.\d+)?)$/);if(m)return Math.round(+m[1]*(hours?60:1));return null}
const CATKEY=n=>{n=latin(n).toLowerCase();for(const k in CATS)if(CATS[k][0]===n||k===n)return k;return''};
const clean=(v,n)=>String(v==null?'':v).replace(/^'(?=[=+\-@])/,'').replace(/[\u0000-\u001f]/g,' ').trim().slice(0,n);
let PEND=null;
function analyze(rows,opt){const hd=rows[0]||[],m=mapCols(hd),out={m,ok:[],dup:0,bad:[],newActs:new Set(),skippedActs:0,over:0,total:Math.max(0,rows.length-1),stack:0};
  if(m.date===undefined||m.act===undefined)return Object.assign(out,{fatal:T('ستون «تاریخ» و «فعالیت» لازم است (سرستون‌های پشتیبانی‌شده: date/تاریخ، activity/فعالیت، start/شروع، end/پایان، minutes/دقیقه، note/یادداشت)','Columns “date” and “activity” are required (supported headers: date, activity, start, end, minutes, note)')});
  if(m.min===undefined&&m.hrs===undefined&&(m.start===undefined||m.end===undefined))return Object.assign(out,{fatal:T('یا «شروع و پایان» یا «دقیقه» لازم است','Either “start & end” or “minutes” is required')});
  const have=new Set(db.entries.map(e=>e.date+'|'+e.start+'|'+e.actId+'|'+e.min)),byName=new Map(db.acts.map(a=>[a.name.trim().toLowerCase(),a])),seen=new Set(),cur={};
  for(let i=1;i<rows.length;i++){const r=rows[i],ln=i+1,g=k=>m[k]===undefined?'':r[m[k]];
    const d=pDate(g('date'));if(!d){out.bad.push([ln,T('تاریخ نامعتبر','Bad date')]);continue}
    const an=clean(g('act'),80);if(!an){out.bad.push([ln,T('فعالیت خالی','Empty activity')]);continue}
    let st=m.start!==undefined?pTime(g('start')):null,en=m.end!==undefined?pTime(g('end')):null,min=null;
    if(m.min!==undefined&&String(g('min')).trim()!=='')min=pMin(g('min'),false);else if(m.hrs!==undefined&&String(g('hrs')).trim()!=='')min=pMin(g('hrs'),true);
    if(st&&en){min=dur(st,en)}
    else if(st&&min){en=hm((tm(st)+min)%1440)}
    else if(min&&!st){if(cur[d]===undefined)cur[d]=480;if(cur[d]+min>1440){out.bad.push([ln,T('جا برای چیدن پشت‌سرهم نیست','No room to stack entries')]);continue}st=hm(cur[d]);en=hm((cur[d]+min)%1440);cur[d]+=min;out.stack++}
    else{out.bad.push([ln,T('زمان یا مدت نامعتبر','Bad time or duration')]);continue}
    if(!min||min<1||min>1440){out.bad.push([ln,T('مدت باید بین ۱ تا ۱۴۴۰ دقیقه باشد','Duration must be 1–1440 min')]);continue}
    let a=byName.get(an.toLowerCase()),aid=a?a.id:'n:'+an.toLowerCase();
    if(!a){if(!opt.create){out.skippedActs++;continue}out.newActs.add(an)}
    const key=d+'|'+st+'|'+aid+'|'+min;
    if(opt.dedupe&&(have.has(key)||seen.has(key))){out.dup++;continue}seen.add(key);
    out.ok.push({d,st,en,min,an,aid,a,sub:clean(g('sub'),80),cat:CATKEY(g('cat')),note:clean(g('note'),500)})}
  const by={};db.entries.forEach(e=>{(by[e.date]=by[e.date]||[]).push(e)});
  out.ok.forEach(x=>{if((by[x.d]||[]).some(e=>tm(x.st)<tm(e.start)+e.min&&tm(e.start)<tm(x.st)+x.min))out.over++});
  return out}
function pick(f){const r=new FileReader();r.onerror=()=>say(T('خواندن فایل ممکن نشد','Could not read the file'),1);
  r.onload=()=>{try{const rows=parseCSV(String(r.result||''));if(rows.length<2)return say(T('فایل خالی است یا فقط سرستون دارد','The file is empty or has only a header'),1);PEND={rows,opt:{create:1,dedupe:1}};showPrev()}catch(e){say(String(e&&e.message||e),1)}};r.readAsText(f)}
function showPrev(){const A=PEND.A=analyze(PEND.rows,PEND.opt),p=PEND;
  let h='<div style="max-width:520px">'+daniH('📥','ورود CSV','CSV import')
   +'<p class="m">'+T('ردیف‌های خوانده‌شده: ','Rows read: ')+'<b>'+fa(A.total)+'</b></p>';
  if(A.fatal)return modal(h+'<p style="color:var(--wr)">'+esc(A.fatal)+'</p><div class="row"><button class="p" data-a="ob_close">'+T('بستن','Close')+'</button></div></div>');
  h+='<div class="cwr">✅ '+T('قابل ورود: ','Ready to import: ')+'<b>'+fa(A.ok.length)+'</b></div>'
   +(A.dup?'<div class="cwr">♻️ '+T('تکراری (از قبل هست): ','Duplicates (already here): ')+fa(A.dup)+'</div>':'')
   +(A.bad.length?'<div class="cwr">⚠️ '+T('نامعتبر: ','Invalid: ')+fa(A.bad.length)+'</div>':'')
   +(A.newActs.size?'<div class="cwr">🆕 '+T('فعالیت تازه: ','New activities: ')+fa(A.newActs.size)+' — '+esc([...A.newActs].slice(0,6).join('، '))+(A.newActs.size>6?' …':'')+'</div>':'')
   +(A.skippedActs?'<div class="cwr">⏭ '+T('ردیف با فعالیت ناشناخته (رد شد): ','Rows with unknown activity (skipped): ')+fa(A.skippedActs)+'</div>':'')
   +(A.stack?'<div class="cwr">ℹ️ '+T(fa(A.stack)+' ردیف ساعت شروع نداشت؛ از ۰۸:۰۰ پشت‌سرهم چیده می‌شود.',A.stack+' rows had no start time; they are stacked from 08:00.')+'</div>':'')
   +(A.over?'<div class="cwr">⚠️ '+T(fa(A.over)+' ثبت با ثبت‌های موجود هم‌پوشانی دارد (وارد می‌شود؛ بعداً در لاگ ببین).',A.over+' entries overlap existing ones (they are imported; check the log later).')+'</div>':'');
  h+='<div class="row" style="margin-top:6px"><label class="chip"><input type="checkbox" data-scx="create" '+(p.opt.create?'checked':'')+'> '+T('ساختن فعالیت‌های تازه','Create new activities')+'</label><label class="chip"><input type="checkbox" data-scx="dedupe" '+(p.opt.dedupe?'checked':'')+'> '+T('رد کردن تکراری‌ها','Skip duplicates')+'</label></div>';
  if(A.ok.length)h+='<div style="overflow:auto;max-height:180px;margin-top:8px"><table style="width:100%;font-size:.85em"><tr><th>'+T('تاریخ','Date')+'</th><th>'+T('شروع','Start')+'</th><th>'+T('مدت','Min')+'</th><th>'+T('فعالیت','Activity')+'</th></tr>'+A.ok.slice(0,8).map(x=>'<tr><td dir="ltr">'+x.d+'</td><td dir="ltr">'+x.st+'</td><td>'+fa(x.min)+'</td><td>'+esc(x.an)+'</td></tr>').join('')+'</table></div>';
  if(A.bad.length)h+='<div class="m" style="margin-top:6px">'+A.bad.slice(0,5).map(b=>T('ردیف ','Row ')+fa(b[0])+': '+esc(b[1])).join('<br>')+(A.bad.length>5?'<br>…':'')+'</div>';
  h+='<p class="m">'+T('قبل از ورود، یک نسخه‌ی کامل از داده‌ی فعلی گرفته می‌شود.','A full copy of the current data is taken before importing.')+'</p><div class="row"><button class="p" data-a="csv_go" '+(A.ok.length?'':'disabled')+'>'+T('وارد کن','Import')+'</button><button data-a="ob_close">'+T('انصراف','Cancel')+'</button></div></div>';
  modal(h)}
document.addEventListener('change',e=>{const t=e.target;if(!t)return;
  if(t.matches&&t.matches('[data-csv-file]')){const f=t.files&&t.files[0];t.value='';if(f)pick(f);return}
  if(t.dataset&&t.dataset.scx&&PEND){PEND.opt[t.dataset.scx]=t.checked?1:0;showPrev()}});
H.csv_go=()=>{if(!PEND||!PEND.A||!PEND.A.ok.length)return;const A=PEND.A;
  try{snap()}catch(e){return say(String(e.message||e),1)}
  const made=new Map();let n=0;
  A.ok.forEach(x=>{let a=x.a||made.get(x.aid);if(!a){const ck=x.cat||(typeof catOf==='function'?catOf(x.an):'personal');a={id:uid(),name:x.an,cat:ck,tags:[],color:(CATS[ck]||CATS.personal)[1],prio:'',goalDay:0,goalWeek:0,subs:[],desc:'',active:true,days:[]};db.acts.push(a);made.set(x.aid,a)}
    let sid='';if(x.sub){let s=(a.subs||[]).find(z=>String(z.name).toLowerCase()===x.sub.toLowerCase());if(!s){s={id:uid(),name:x.sub,goal:0};(a.subs=a.subs||[]).push(s)}sid=s.id}
    db.entries.push({id:uid(),date:x.d,actId:a.id,subId:sid,start:x.st,end:x.en,min:x.min,note:x.note,src:'csv'});n++});
  if(!save())return;PEND=null;closeM();say(T('ورود انجام شد ✓ ('+fa(n)+' ثبت، '+fa(made.size)+' فعالیت تازه)','Imported ✓ ('+n+' entries, '+made.size+' new activities)'));render()};
function csvCard(){return'<div class="c" id="csvcard">'+daniH('📥','ورود CSV','CSV import')
  +'<p class="m">'+T('ثبت‌های زمان را از یک فایل CSV (مثلاً خروجی خود DANI یا برنامه‌ی دیگر) وارد کن. اول پیش‌نمایش می‌بینی و چیزی بدون تأیید تو نوشته نمی‌شود. ستون‌ها: تاریخ، فعالیت، شروع، پایان یا دقیقه، یادداشت (فارسی یا انگلیسی).','Import time entries from a CSV file (e.g. DANI’s own export or another app). You see a preview first and nothing is written without your confirmation. Columns: date, activity, start, end or minutes, note (Persian or English).')+'</p>'
  +'<div class="row"><label class="p" style="cursor:pointer;display:inline-block">📂 '+T('انتخاب فایل CSV','Choose CSV file')+'<input type="file" accept=".csv,text/csv,text/plain,.txt" data-csv-file hidden></label></div></div>'}
{const _sp=setPage;setPage=function(){const h=_sp.apply(this,arguments);return(typeof h==='string'&&typeof stt!=='undefined'&&stt==='data')?h+csvCard():h}}
window.daniCsvImport={parseCSV,analyze};
})();
