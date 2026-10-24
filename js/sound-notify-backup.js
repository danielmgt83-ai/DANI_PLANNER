"use strict";
/* DANI · sound-notify-backup.js
   صدا و اعلان: صداهای پیش‌فرض، Service Worker، زنگ‌ها، اشتراک پشتیبان، بررسی فایل واردشده
   فایل‌های js/ به ترتیب در index.html بارگذاری می‌شوند و متغیرها و تابع‌ها را مشترک دارند (مثل یک فایل واحد). */
/* ===== v7: صدای پیش‌فرض (سونات مهتاب، ~۱ دقیقه، سنتز داخلی) و اعلان مطمئن‌تر ===== */
const MOON=[[[37,49],[56,61,64]],[[35,47],[56,61,64]],[[33,45],[57,61,64]],[[30,42],[57,61,66]],[[32,44],[56,60,63]],[[37,49],[56,61,64]],[[35,47],[56,61,64]],[[33,45],[57,61,64]],[[30,42],[57,61,66]],[[32,44],[56,60,63]],[[37,49],[56,61,64]],[[32,44],[56,60,63]],[[37,49],[56,61,64]]],MSTEP=.385,MLEN=12*12*MSTEP+6.2;
function moonSchedule(C,out,t0,nd){const lp=C.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2400;lp.connect(out);
 const note=(m,t,len,v)=>{const f=440*Math.pow(2,(m-69)/12);[[1,'triangle',v],[2,'sine',v*.22]].forEach(([h,ty,vv])=>{const o=C.createOscillator(),g=C.createGain();o.type=ty;o.frequency.value=f*h;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vv,t+.015);g.gain.exponentialRampToValueAtTime(.0008,t+len);o.connect(g);g.connect(lp);o.start(t);o.stop(t+len+.05);if(nd)nd.push(o)})};
 MOON.forEach((b,i)=>{const bt=t0+i*12*MSTEP,last=i===MOON.length-1;b[0].forEach(m=>note(m,bt,last?6:5,.2));if(last)b[1].forEach(m=>note(m,bt,6,.1));else for(let k=0;k<12;k++)note(b[1][k%3],bt+k*MSTEP,1.3,.1)});return MLEN}
const SND={ctx:null,nodes:[],playing:false,tm:null,fl:null,audio:null};
function stopSound(){SND.nodes.forEach(n=>{try{n.stop()}catch(e){}});SND.nodes=[];try{SND.master&&SND.master.disconnect()}catch(e){}if(SND.audio){SND.audio.pause();SND.audio=null}clearTimeout(SND.tm);clearInterval(SND.fl);document.title='DANI';SND.playing=false}
function playMoon(){stopSound();const C=SND.ctx=SND.ctx||new(window.AudioContext||window.webkitAudioContext)();if(C.resume)C.resume();const t0=C.currentTime+.08,mg=C.createGain(),v=Math.max(0,Math.min(1,db.set.vol))*.6;mg.gain.setValueAtTime(v,t0);mg.gain.setValueAtTime(v,t0+MLEN-4);mg.gain.linearRampToValueAtTime(0,t0+MLEN);mg.connect(C.destination);SND.master=mg;moonSchedule(C,mg,t0,SND.nodes);SND.playing=true;SND.tm=setTimeout(stopSound,(MLEN+.5)*1000)}
playSound=function(){try{if(db.set.sound){stopSound();const a=new Audio(db.set.sound);a.volume=Math.max(0,Math.min(1,db.set.vol));SND.audio=a;SND.playing=true;a.onended=stopSound;a.play().catch(()=>toast('مرورگر پخش خودکار صدا را مسدود کرد؛ یک‌بار روی صفحه کلیک کنید',1));return}
 if((db.set.tone||'moon')==='moon')return playMoon();stopSound();SND.playing=true;let n=0;const r=()=>{if(!SND.playing||n++>=db.set.rep){SND.playing=false;return}beep(880,350);setTimeout(()=>beep(1100,350),450);SND.tm=setTimeout(r,Math.max(900,db.set.alen*1000/db.set.rep))};r()}catch(e){toast('پخش صدا در این مرورگر ممکن نیست',1)}};
alarm=function(t){playSound();notify(t);try{navigator.vibrate&&navigator.vibrate([300,150,300,150,300])}catch(e){}
 if(document.hidden){let k=0;clearInterval(SND.fl);SND.fl=setInterval(()=>{document.title=k++%2?'DANI':'⏰ '+t;if(k>40)clearInterval(SND.fl)},800)}
 modal(`<h3>⏰ ${esc(t)}</h3><p class="m">صدا در حال پخش است.</p><div class="row"><button class="p" data-a="stopsnd">توقف صدا و بستن</button></div>`)};
H.stopsnd=()=>{stopSound();closeM()};
H.snd=()=>{if(SND.playing){stopSound();toast('صدا متوقف شد');render()}else{playSound();toast('در حال پخش آزمایشی؛ برای توقف دوباره بزنید');render()}};
H.notif=async()=>{if(!('Notification'in window))return toast('این مرورگر اعلان را پشتیبانی نمی‌کند',1);try{const r=await Notification.requestPermission();toast(r==='granted'?'اعلان فعال شد':r==='denied'?'اعلان مسدود است؛ باید در تنظیمات مرورگر برای همین صفحه اجازه بدهید':'پاسخی داده نشد؛ دوباره امتحان کنید',r!=='granted')}catch(e){toast('درخواست اعلان ممکن نشد: '+e.message,1)}render()};
H.ntest=()=>{if(!('Notification'in window))return toast('این مرورگر اعلان را پشتیبانی نمی‌کند',1);if(Notification.permission!=='granted')return toast('ابتدا اجازه‌ی اعلان را بدهید',1);try{new Notification('DANI',{body:'این یک اعلان آزمایشی است ✓'});toast('اعلان آزمایشی ارسال شد؛ اگر ندیدید، تنظیمات اعلان سیستم‌عامل را بررسی کنید')}catch(e){toast('ارسال اعلان ناموفق بود: '+e.message,1)}};
const _sp2=setPage;setPage=function(){let h=_sp2();if(stt!=='time')return h;const pm='Notification'in window?Notification.permission:'unsupported',f=location.protocol==='file:';
 return h+`<div class="c" style="margin-top:10px"><h3>صدای هشدار</h3><label>صدای پیش‌فرض</label><select data-ch="sf" data-f="tone">${tonesOpts()}</select><div class="row" style="margin-top:8px"><button class="p" data-a="snd">${SND.playing?'■ توقف صدا':'▶ آزمایش صدا'}</button></div><p class="m">صداهای پیش‌فرض هشدار با کد و نت‌های موسیقی ساخته می‌شوند و به فایل صوتی جداگانه نیاز ندارند. با «آزمایش صدا» می‌توانی آن‌ها را پیش‌شنوی کنی. در صورت تمایل، فایل صوتی دلخواه خودت را هم می‌توانی اضافه کنی (تا ۱٫۵ مگابایت)؛ صدای دلخواه بر صدای پیش‌فرض اولویت دارد.</p></div>
 <div class="c" style="margin-top:10px"><h3>اعلان مرورگر</h3><p>وضعیت: <b>${{granted:'مجاز ✓',denied:'مسدود',default:'هنوز اجازه داده نشده',unsupported:'پشتیبانی نمی‌شود'}[pm]}</b></p><div class="row">${pm!=='granted'&&pm!=='unsupported'?'<button class="p" data-a="notif">درخواست اجازه اعلان</button>':''}<button data-a="ntest" ${pm==='granted'?'':'disabled'}>ارسال اعلان آزمایشی</button></div>${pm==='denied'?'<p class="m">مرورگر قبلاً رد کرده؛ در تنظیمات مرورگر ← تنظیمات سایت ← اعلان‌ها، همین صفحه را «اجازه» بده و صفحه را رفرش کن.</p>':''}${f?'<p style="color:var(--wr)">این فایل مستقیم از حافظه‌ی دستگاه باز شده (file://). بیشتر مرورگرها در این حالت اعلان سیستم را اجازه نمی‌دهند.</p>':''}<p class="m">بدون اعلان هم، هنگام پایان تایمر: صدا، پنجره‌ی «توقف صدا»، لرزش (در موبایل) و چشمک‌زدن عنوان تب کار می‌کند؛ ولی با بسته‌بودن کامل مرورگر هیچ‌کدام تضمین‌شده نیست.</p></div>`};
/* ===== v8: چند صدای پیش‌فرض مرموز (کلاسیک‌های عمومی + یک قطعه‌ی اورجینال) ===== */
function seqSched(C,out,t0,ev,nd){const lp=C.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3000;lp.connect(out);let end=0;
 ev.forEach(([t,m,len,v,ty])=>{const f=440*Math.pow(2,(m-69)/12),P=ty==='bell'?[[1,'sine',v],[3.01,'sine',v*.15]]:ty==='soft'?[[1,'sine',v],[2,'sine',v*.12]]:[[1,'triangle',v],[2,'sine',v*.22]];
  P.forEach(([h,tp,vv])=>{const o=C.createOscillator(),g=C.createGain(),s=t0+t,a=ty==='soft'?.03:.012;o.type=tp;o.frequency.value=f*h;g.gain.setValueAtTime(0,s);g.gain.linearRampToValueAtTime(vv,s+a);g.gain.exponentialRampToValueAtTime(.0008,s+len);o.connect(g);g.connect(lp);o.start(s);o.stop(s+len+.05);if(nd)nd.push(o)});end=Math.max(end,t+len)});return end}
function mountainEv(){const e=[],th=[[47,1],[49,1],[50,1],[52,1],[54,1],[50,1],[54,2],[53,1],[49,1],[53,2],[52,1],[49,1],[52,2]];let t=0,s=.5;for(let r=0;r<10;r++){const v=.07+r*.014;th.forEach(([m,d])=>{const L=d*s;e.push([t,m,Math.max(.22,L*.9),v,'pl']);if(r>=3)e.push([t,m+12,Math.max(.2,L*.8),v*.7,'pl']);t+=L});if(r%2==0)e.push([t-th.reduce((a,b)=>a+b[1],0)*s,35,2.2,.12,'soft']);s*=.93}e.push([t,35,4.5,.2,'soft'],[t,47,4.5,.15,'soft'],[t,54,4.5,.1,'soft']);return e}
function toccataEv(){const e=[],M=(t,m,l,v,ty)=>e.push([t,m,l,v,ty||'pl']);[[0,12],[8,0]].forEach(([t0,o])=>{const b=t0*0;});
 [[0,0],[6,-12]].forEach(([t,o])=>{M(t,81+o,.3,.22);M(t+.14,79+o,.25,.2);M(t+.28,81+o,1.2,.22);[79,77,76,74,73].forEach((m,i)=>M(t+1.6+i*.26,m+o,.5,.2));M(t+3,74+o,2.6,.22,'soft');M(t,57+o-12,3,.12,'soft')});
 const ch=[[37,49,52,55,58],[38,50,53,57,62],[37,49,52,55,58],[33,45,49,52,55],[38,50,53,57,62],[37,49,52,55,58],[33,45,49,52,55],[38,50,53,57,62]];ch.forEach((c,i)=>c.forEach((m,k)=>M(12+i*4,m,i==7?8:4.6,.1+(k==0?.06:0),'soft')));
 [[12,0],[24,0]].forEach(([t])=>{[74,72,70,69,67].forEach((m,i)=>M(t+i*.22,m,.5,.15))});return e}
function gymnoEv(){const e=[],B=.95,G=[59,62,66],D=[54,57,61];const mel=[[4,78,0,3],[5,81,0,1.5],[5,79,1.5,1.5],[6,78,0,3],[7,73,0,1],[7,71,1,1],[7,73,2,1],[8,74,0,3],[9,73,0,1.5],[9,71,1.5,1.5],[10,69,0,3],[11,71,0,1],[11,73,1,1],[11,74,2,1],[12,78,0,3],[13,81,0,1.5],[13,79,1.5,1.5],[14,78,0,3],[15,73,0,1.5],[15,71,1.5,1.5],[16,73,0,3]];
 for(let b=0;b<18;b++){const g=b%2==0,t=b*3*B;e.push([t,g?43:38,3*B,.16,'soft']);(g?G:D).forEach(m=>{e.push([t+B,m,B*.95,.07,'soft']);e.push([t+2*B,m,B*.95,.07,'soft'])})}
 mel.forEach(([b,m,s,l])=>e.push([b*3*B+s*B,m,l*B*1.1+.8,.14,'bell']));e.push([17*3*B,43,5,.14,'soft']);return e}
function nightEv(){const e=[],s=.32,ch=[[57,60,64,67,64,60,64,60],[53,57,60,64,60,57,60,57],[50,53,57,62,57,53,57,53],[52,55,59,64,59,55,59,55]],bs=[33,29,26,28],mel=[[76],[72],[74],[71]];
 for(let b=0;b<22;b++){const i=b%4,t=b*8*s;e.push([t,bs[i],8*s*1.2,.14,'soft']);ch[i].forEach((m,k)=>e.push([t+k*s,m,1.4,.08,'bell']));if(b>=3&&b%2==1)e.push([t,mel[i][0]+(b>12?12:0),3,.1,'bell'])}
 e.push([22*8*s,33,5,.14,'soft'],[22*8*s,57,5,.09,'bell'],[22*8*s,64,5,.09,'bell']);return e}
const PIECES={moon:{n:'سونات مهتاب (بتهوون) — آرام و مرموز',s:(C,o,t,nd)=>moonSchedule(C,o,t,nd)},mountain:{n:'تالار پادشاه کوهستان (گریگ) — کم‌کم تندتر و پرتنش',s:(C,o,t,nd)=>seqSched(C,o,t,mountainEv(),nd)},toccata:{n:'تُکاتا (باخ) — تاریک و دراماتیک',s:(C,o,t,nd)=>seqSched(C,o,t,toccataEv(),nd)},gymno:{n:'ژیمنوپدی (ساتی) — رؤیایی و مبهم',s:(C,o,t,nd)=>seqSched(C,o,t,gymnoEv(),nd)},night:{n:'راز شب (اورجینال) — زنگ‌مانند، حال‌وهوای انیمه',s:(C,o,t,nd)=>seqSched(C,o,t,nightEv(),nd)}};
const tonesOpts=()=>{const cur=PIECES[db.set.tone]?db.set.tone:'joy';return Object.entries(PIECES).map(([k,p])=>`<option value="${k}" ${cur===k?'selected':''}>${p.n}</option>`).join('')}
function playPiece(k){stopSound();const C=SND.ctx=SND.ctx||new(window.AudioContext||window.webkitAudioContext)();if(C.resume)C.resume();const t0=C.currentTime+.08,mg=C.createGain(),v=Math.max(0,Math.min(1,db.set.vol))*.6;mg.connect(C.destination);SND.master=mg;const L=PIECES[k].s(C,mg,t0,SND.nodes);mg.gain.setValueAtTime(v,t0);mg.gain.setValueAtTime(v,t0+L-4);mg.gain.linearRampToValueAtTime(0,t0+L);SND.playing=true;SND.tm=setTimeout(stopSound,(L+.5)*1000)}
const _ps=playSound;playSound=function(){const k=db.set.tone||'moon';if(!db.set.sound&&PIECES[k]){try{return playPiece(k)}catch(e){toast('پخش صدا در این مرورگر ممکن نیست',1)}}return _ps()};
/* ===== v9: PWA و اعلان از طریق Service Worker ===== */
async function showN(t,b){try{const r=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();if(r&&r.showNotification){await r.showNotification(t,{body:b,icon:'icons/icon-192.png',vibrate:[200,100,200],tag:'hamrah'});return true}new Notification(t,{body:b});return true}catch(e){return false}}
notify=function(t){if('Notification'in window&&Notification.permission==='granted')showN('DANI',t)};
H.ntest=async()=>{if(!('Notification'in window))return toast('این مرورگر اعلان را پشتیبانی نمی‌کند',1);if(Notification.permission!=='granted')return toast('ابتدا اجازه‌ی اعلان را بدهید',1);const ok=await showN('DANI','این یک اعلان آزمایشی است ✓');toast(ok?'اعلان آزمایشی ارسال شد؛ اگر ندیدید، تنظیمات اعلان سیستم‌عامل را بررسی کنید':'ارسال اعلان ناموفق بود',!ok)};
if('serviceWorker'in navigator&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register('sw.js').catch(()=>{});
/* ===== v10: سونات مهتاب با پیانوی نرم و جعبه‌موزیکی؛ حذف بقیه‌ی قطعه‌ها ===== */
function makeIR(C,sec){const L=Math.floor(C.sampleRate*sec),b=C.createBuffer(2,L,C.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<L;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/L,2.8)}return b}
function softSched(C,out,t0,nd,kind){const box=kind==='box',lp=C.createBiquadFilter();lp.type='lowpass';lp.frequency.value=box?3800:1900;lp.Q.value=.3;
 const dry=C.createGain(),wet=C.createGain(),cv=C.createConvolver();dry.gain.value=box?.7:.8;wet.gain.value=box?.5:.4;cv.buffer=makeIR(C,box?3.2:2.4);lp.connect(dry);lp.connect(cv);cv.connect(wet);dry.connect(out);wet.connect(out);
 const parts=box?[[1,1,1],[4.02,.22,.35]]:[[1,1,1],[2,.42,.7],[3,.16,.5],[4,.07,.35]];
 const note=(m,t,len,v)=>{const f=440*Math.pow(2,(m-69)/12);parts.forEach(([h,a,dk])=>{const o=C.createOscillator(),g=C.createGain(),d=len*dk;o.type='sine';o.frequency.value=f*h*(1+.00015*h*h);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*a,t+(box?.004:.014));g.gain.setTargetAtTime(0,t+.014,d/4.2);o.connect(g);g.connect(lp);o.start(t);o.stop(t+d*1.3+.4);if(nd)nd.push(o)})};
 const rnd=(s=>()=>(s=(s*16807)%2147483647)/2147483647)(7);
 MOON.forEach((b,i)=>{const bt=t0+i*12*MSTEP,last=i===MOON.length-1,sw=.92+.08*Math.sin(i*.9);b[0].forEach((m,j)=>note(m,bt+(j?.012:0),last?7:5.5,.2*sw));if(last){b[1].forEach((m,j)=>note(m,bt+j*.05,7,.09));return}
  for(let k=0;k<12;k++)note(b[1][k%3],bt+k*MSTEP+(rnd()-.5)*.012,box?2:1.9,(.075+(k%3==2?.012:0))*sw*(.95+rnd()*.1))});return MLEN}
Object.keys(PIECES).forEach(k=>delete PIECES[k]);
PIECES.moonsoft={n:'سونات مهتاب — پیانوی نرم و آرامش‌بخش',s:(C,o,t,nd)=>softSched(C,o,t,nd,'piano')};
PIECES.moonbox={n:'سونات مهتاب — جعبه‌موزیکی ملایم',s:(C,o,t,nd)=>softSched(C,o,t,nd,'box')};
PIECES.moon={n:'سونات مهتاب — نسخه‌ی سینتی قبلی',s:(C,o,t,nd)=>moonSchedule(C,o,t,nd)};
const _ps2=playSound;playSound=function(){const t=db.set.tone;if(!db.set.sound&&t!=='beep'){const k=PIECES[t]?t:'moonsoft';try{return playPiece(k)}catch(e){toast('پخش صدا در این مرورگر ممکن نیست',1)}}return _ps2()};

/* ===== DANI v1: ringtones - all older pieces removed; two original, cheerful, bell-like tunes (pure WebAudio, no files). Never throws. ===== */
function joyEv(short){const s=.26,e=[],mel=[[76,0,1],[79,1,1],[84,2,2],[83,4,1],[81,5,1],[79,6,2],[77,8,1],[81,9,1],[86,10,2],[84,12,1],[83,13,1],[84,14,2],[79,16,1],[83,17,1],[86,18,1],[88,19,1],[86,20,1],[84,21,1],[83,22,2],[84,24,3],[79,27,1],[84,28,4]],bass=[[48,0],[55,4],[53,8],[60,12],[55,16],[62,20],[48,24],[55,28]],lim=short?8:32;
 mel.forEach(([m,b,l])=>{if(b<lim)e.push([b*s,m,l*s*1.6+.25,.13,'bell'])});bass.forEach(([m,b])=>{if(b<lim)e.push([b*s,m,4*s*.95,.09,'soft'])});
 e.push([lim*s,short?84:72,short?1.2:1.7,.13,'bell'],[lim*s,short?88:76,short?1.2:1.7,.08,'bell'],[lim*s,short?91:79,short?1.2:1.7,.07,'bell']);return e}
playPiece=function(k){stopSound();const C=SND.ctx=SND.ctx||new(window.AudioContext||window.webkitAudioContext)();if(C.resume)C.resume();const t0=C.currentTime+.08,mg=C.createGain(),vol=+db.set.vol,v=Math.max(0,Math.min(1,vol>=0?vol:.8))*.6;mg.connect(C.destination);SND.master=mg;const L=PIECES[k].s(C,mg,t0,SND.nodes);mg.gain.setValueAtTime(v,t0);mg.gain.setValueAtTime(v,t0+Math.max(.2,L-1.2));mg.gain.linearRampToValueAtTime(0,t0+L);SND.playing=true;SND.tm=setTimeout(stopSound,(L+.5)*1000)};
Object.keys(PIECES).forEach(k=>{delete PIECES[k]});
PIECES.joy={n:'شادی صبحگاهی (اورجینال) — شاد و روشن، برای هشدار و تایمر',s:(C,o,t,nd)=>seqSched(C,o,t,joyEv(false),nd)};
PIECES.ping={n:'زنگ کوتاه (اورجینال) — ملایم، برای اعلان‌ها',s:(C,o,t,nd)=>seqSched(C,o,t,joyEv(true),nd)};
{const _ps3=playSound;playSound=function(){const t=PIECES[db.set.tone]?db.set.tone:'joy';if(db.set.sound){try{return _ps3.apply(this,arguments)}catch(e){}}try{return playPiece(t)}catch(e){try{stopSound()}catch(_){}}}}
/* ===== v11: ارسال پشتیبان با اشتراک‌گذاری/ایمیل ===== */
H.xshare=async()=>{const txt=JSON.stringify({app:'hamrah',version:3,exportedAt:new Date().toISOString(),db},null,1),f=new File([txt],'hamrah-backup-'+todayISO()+'.json',{type:'application/json'});
 if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f],title:'پشتیبان DANI'});db.set.lastBk=Date.now();save();return toast('پشتیبان ارسال شد')}catch(e){if(e.name==='AbortError')return}}
 exportJSON();setTimeout(()=>{location.href='mailto:?subject='+encodeURIComponent('پشتیبان DANI '+todayISO())+'&body='+encodeURIComponent('فایل پشتیبانِ دانلودشده را به همین ایمیل پیوست کنید و ارسال را بزنید.')},700)};
const _sp3=setPage;setPage=function(){const h=_sp3();return stt==='data'?h+`<div class="c" style="margin-top:10px"><h3>ارسال پشتیبان به ایمیل / تلگرام / Drive</h3><button class="p" data-a="xshare">ارسال پشتیبان</button><p class="m">در موبایل پنجره‌ی اشتراک‌گذاری باز می‌شود؛ ایمیل، تلگرام یا Google Drive را انتخاب کن و فایل پشتیبان خودکار پیوست می‌شود. در کامپیوتر فایل دانلود و ایمیل خالی باز می‌شود تا خودت پیوستش کنی. ارسال خودکار و بی‌صدا ممکن نیست، چون به سرور و حساب کاربری نیاز دارد.</p></div>`:h};

load();render();
if(db.set.bk>0&&db.entries.length&&Date.now()-(db.set.lastBk||0)>db.set.bk*864e5&&!db.caps.bkNag){db.caps.bkNag=1;setTimeout(()=>toast('مدتی است پشتیبان JSON نگرفته‌اید؛ از «تنظیمات» بگیرید'),1500)}
window.__T={g2j,j2g,mm,dur,TM,migrate,analyze,timeline,findOverlaps,get db(){return db}};

/* ===== v12-light: removed embedded MP3 tracks; retain synthesized Web Audio tones ===== */

/* ===== v12: import vetting (runs only on imported backup files, never on stored data) ===== */
/* v12: unique overlapped minutes = union of pairwise intersections, per day (no pair-sum inflation) */
function ovUnion(list){const by={};list.forEach(x=>{const k=x.a.date||"",s=Math.max(tm(x.a.start),tm(x.b.start)),e=Math.min(tm(x.a.start)+x.a.min,tm(x.b.start)+x.b.min);if(e>s)(by[k]=by[k]||[]).push([s,e])});
 let t=0;Object.values(by).forEach(v=>{v.sort((a,b)=>a[0]-b[0]);let cs=null,ce=null;v.forEach(([a,b])=>{if(cs===null){cs=a;ce=b}else if(a<=ce){ce=Math.max(ce,b)}else{t+=ce-cs;cs=a;ce=b}});if(cs!==null)t+=ce-cs});return t}
function vetImport(m){const x=m.db,rep=m.rep;if(x&&x.mods)vetMods(x,rep);if(!x||!Array.isArray(x.entries))return;
 const ids=new Set((x.acts||[]).map(a=>a&&a.id)),seen=new Set(),cnt={date:0,min:0,time:0,id:0,dup:0},orphan=[];
 const okDate=d=>{if(typeof d!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(d))return false;const[y,mo,da]=d.split("-").map(Number);if(y<2000||y>2100)return false;const t=new Date(Date.UTC(y,mo-1,da));return t.getUTCFullYear()===y&&t.getUTCMonth()===mo-1&&t.getUTCDate()===da};
 const okT=t=>t==null||t===""||(typeof t==="string"&&/^([01]\d|2[0-3]):[0-5]\d$/.test(t));
 const keep=[];
 for(const e of x.entries){
  if(!e||typeof e!=="object"){cnt.id++;continue}
  if(typeof e.id!=="string"||!e.id||e.id.length>64){cnt.id++;continue}
  if(seen.has(e.id)){cnt.dup++;continue}
  if(!okDate(e.date)){cnt.date++;continue}
  if(typeof e.min!=="number"||!isFinite(e.min)||e.min<0||e.min>1440){cnt.min++;continue}
  if(!okT(e.start)||!okT(e.end)){cnt.time++;continue}
  seen.add(e.id);if(e.actId&&!ids.has(e.actId))orphan.push(e.id);keep.push(e)}
 const bad=cnt.date+cnt.min+cnt.time+cnt.id+cnt.dup;
 if(bad){x.entries=keep;rep.push("⚠ "+fa(bad)+" ثبت نامعتبر در فایل بود و وارد نمی‌شود: "+[cnt.date&&fa(cnt.date)+" تاریخ نامعتبر",cnt.min&&fa(cnt.min)+" مدت نامعتبر (منفی یا بیش از ۲۴ ساعت)",cnt.time&&fa(cnt.time)+" ساعت نامعتبر",cnt.id&&fa(cnt.id)+" بدون شناسه معتبر",cnt.dup&&fa(cnt.dup)+" شناسه تکراری"].filter(Boolean).join("، ")+"؛ بقیه‌ی داده‌ها دست‌نخورده‌اند.")}
 if(orphan.length)rep.push("⚠ "+fa(orphan.length)+" ثبت به فعالیتی اشاره می‌کند که در فایل نیست (نگه داشته شد و با نام «فعالیت حذف‌شده» نمایش داده می‌شود).")}


