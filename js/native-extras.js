"use strict";
/* DANI · native-extras.js  (فقط در اپ اندروید فعال می‌شود؛ در مرورگر هیچ چیز عوض نمی‌شود)
   نیاز: افزونه‌ی بومی DaniNative (android-shell/native/DaniNativePlugin.java) ← APK باید دوباره ساخته شود.
   ۱) پشتیبان خودکار روی گوشی: Documents/DANI/Backups (JSON روزانه + پشتیبان کامل هفتگی)، بدون نیاز به اشتراک‌گذاری
   ۲) گزارش PDF واقعی: ساخته و در Download/DANI ذخیره می‌شود (دیگر صفحه‌ی گیرکرده‌ی چاپ نیست)
   ۳) تقویم: موعدها و یادآورها (از جمله یادآور عادت‌ها) مستقیم در تقویم گوشی (تقویم «DANI Planner»)، بدون لینک و تلگرام
   ۴) صدای زنگ: انتخاب آهنگ از خود گوشی (بدون سقف ۱٫۵ مگابایت، بدون کپی در برنامه و پشتیبان) */
(()=>{
const cap=()=>window.Capacitor;
const native=()=>{try{return !!(cap()&&cap().isNativePlatform&&cap().isNativePlatform())}catch(e){return false}};
const DN=()=>{try{return cap().Plugins.DaniNative||null}catch(e){return null}};
const T=(fa,en)=>{try{return LANGEN()?en:fa}catch(e){return fa}};
const say=(m,bad)=>{try{toast(m,bad)}catch(e){}};
const ok=()=>native()&&!!DN();
const LS=(k,v)=>{try{if(v===undefined)return JSON.parse(localStorage.getItem(k)||'{}');localStorage.setItem(k,JSON.stringify(v))}catch(e){return{}}};
const BK='dani_autobk',DAY=864e5;

/* ================= ۱) پشتیبان خودکار ================= */
const abOn=()=>db.set.abk!==false;
async function autoBackup(force){
  const D=DN();if(!ok()||!D.saveFromCache||(!abOn()&&!force))return 0;
  const st=LS(BK),now=Date.now(),days=+db.set.abkd||1;let n=0;
  if(force||now-(st.j||0)>days*DAY){
    try{const name='dani-auto-'+todayISO()+'.json',blob=new Blob([JSON.stringify({app:'hamrah',version:3,exportedAt:new Date().toISOString(),db})],{type:'application/json'});
      if(await window.daniSaveFile(name,blob,{silent:true,folder:'Documents',sub:'DANI/Backups',replace:true})){st.j=now;n++;try{await D.prune({folder:'Documents',sub:'DANI/Backups',prefix:'dani-auto-',keep:7})}catch(e){}}}catch(e){console.error('autobk json',e)}}
  if(typeof H.crs_allexp==='function'&&(force||now-(st.z||0)>7*DAY)){
    try{window.__daniQuiet={exp:now+180000,re:/\.dani-all\.zip$/i,folder:'Documents',sub:'DANI/Backups',name:'DANI-auto-full-'+todayISO()+'.dani-all.zip'};
      await H.crs_allexp({dataset:{}});st.z=now;n++;
      setTimeout(()=>{try{D.prune({folder:'Documents',sub:'DANI/Backups',prefix:'DANI-auto-full-',keep:3})}catch(e){}},8000)}catch(e){console.error('autobk full',e)}}
  LS(BK,st);return n;
}
window.daniAutoBackup=autoBackup;
H.ab_now=async()=>{say(T('در حال گرفتن پشتیبان…','Backing up…'));const n=await autoBackup(true);say(n?T('پشتیبان در Documents/DANI/Backups ذخیره شد','Backup saved in Documents/DANI/Backups'):T('ذخیره‌ی پشتیبان ناموفق بود؛ APK را با آخرین نسخه بساز','Backup failed; rebuild the APK'),!n);render()};
H.ab_tog=()=>{db.set.abk=!abOn();save();render()};
H.ab_days=()=>{const o=[1,3,7],i=o.indexOf(+db.set.abkd||1);db.set.abkd=o[(i+1)%o.length];save();render()};

/* ================= ۲) گزارش PDF واقعی ================= */
{const _de=doExport;
doExport=function(k){
  const D=DN();if(k!=='pdf'||!ok()||!D.htmlToPdf)return _de.apply(this,arguments);
  const[a,b]=rngDates();if(a>b)return toast('بازه نامعتبر است',1);
  const html='<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><style>@page{size:A4;margin:8mm}'+repCSS()+'body{padding:4mm}</style></head><body>'+repHTML(a,b)+'</body></html>',name='DANI-report-'+a+'_'+b+'.pdf';
  say(T('در حال ساخت PDF…','Building PDF…'));
  D.htmlToPdf({html,name}).then(r=>window.daniSavedUI(r,name,'application/pdf')).catch(async e=>{
    console.error('pdf',e);
    try{await window.daniSaveFile(name.replace(/\.pdf$/,'.html'),new Blob([html],{type:'text/html'}));say(T('ساخت PDF ممکن نشد؛ گزارش به‌صورت HTML ذخیره شد (در Chrome باز کن و Print ← Save as PDF)','PDF failed; saved as HTML (open in Chrome, Print > Save as PDF)'),1)}catch(_){say(T('ساخت PDF ناموفق بود','PDF failed'),1)}})}}

/* ================= ۳) تقویم گوشی ================= */
function icsEvents(){
  const r=icsBuild(),t=r.text.replace(/\r\n[ \t]/g,''),out=[],un=s=>s.replace(/\\n/g,'\n').replace(/\\([,;\\])/g,'$1');
  t.split('BEGIN:VEVENT').slice(1).forEach(b0=>{
    const b=b0.split('BEGIN:VALARM')[0],g=k=>{const m=b.match(new RegExp('\\r\\n'+k+'[:;][^\\r\\n]*'));return m?m[0].slice(2).replace(/^[^:]*:/,''):''},
      s=g('DTSTART').match(/^(\d{4})(\d\d)(\d\d)T(\d\d)(\d\d)/);if(!s)return;
    const st=new Date(+s[1],+s[2]-1,+s[3],+s[4],+s[5]).getTime(),al=[];
    (b0.match(/TRIGGER:[^\r\n]*/g)||[]).forEach(x=>{const m=x.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);al.push(/-PT/.test(x)?(+(m&&m[1]||0))*60+(+(m&&m[2]||0)):0)});
    out.push({title:un(g('SUMMARY')),desc:un(g('DESCRIPTION')),start:st,end:st+18e5,rrule:g('RRULE'),alarms:al})});
  return{ev:out,nd:r.nd,nr:r.nr}}
async function calSync(quiet){
  const D=DN();if(!ok()||!D.calendarAdd)return -1;
  const{ev,nd,nr}=icsEvents();
  if(!ev.length&&!quiet)return say(T('موعد یا یادآور فعالی برای تقویم نیست','No active deadlines or reminders to add'),1),0;
  try{const r=await D.calendarAdd({events:ev,tz:Intl.DateTimeFormat().resolvedOptions().timeZone,noAsk:!!quiet});
    LS('dani_calsync',{t:Date.now()});
    if(!quiet)say(T(fa(r.added)+' مورد ('+fa(nd)+' موعد و '+fa(nr)+' یادآور) در تقویم «DANI Planner» گوشی ذخیره شد؛ زنگ‌ها را خود تقویم می‌زند','Added '+r.added+' items ('+nd+' deadlines, '+nr+' reminders) to the "DANI Planner" calendar'));
    return r.added}
  catch(e){const m=String(e&&e.message||e);if(!quiet)say(/denied/i.test(m)?T('اجازه‌ی تقویم داده نشد؛ از تنظیمات اندروید ← برنامه‌ها ← DANI ← مجوزها بده','Calendar permission denied; allow it in Android Settings > Apps > DANI'):T('افزودن به تقویم ناموفق بود: ','Calendar failed: ')+m,1);return -1}
}
{const _ics=H.ics;H.ics=async function(){if(!ok()||!DN().calendarAdd)return _ics.apply(this,arguments);await calSync(false)}}
H.ics_file=()=>{const f=icsBuild();if(!f.nd&&!f.nr)return toast('موعد یا یادآور فعالی برای خروجی نیست',1);const u=URL.createObjectURL(new Blob([f.text],{type:'text/calendar;charset=utf-8'})),a=document.createElement('a');a.href=u;a.download='DANI-calendar.ics';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000)};
H.cal_auto=()=>{db.set.calAuto=!db.set.calAuto;save();if(db.set.calAuto)calSync(false);render()};
function calAutoRun(){if(!ok()||!db.set.calAuto)return;const l=LS('dani_calsync');if(Date.now()-(l.t||0)>30*60000)calSync(true)}

/* ================= ۴) آهنگ از حافظه‌ی گوشی ================= */
const hsh=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return Math.abs(h).toString(36)};
async function applyChannel(){
  const D=DN(),s=db.set.soundUri;window.daniAlarmCh='';
  if(ok()&&D.soundChannel&&s&&(s.sys||s.uri)){const id='dani-alarm-u'+hsh(s.sys||s.uri);try{await D.soundChannel({id,name:T('زنگ و تایمر (آهنگ شما)','Alarm & timer (your sound)'),uri:s.sys||s.uri});window.daniAlarmCh=id}catch(e){console.error('soundChannel',e)}}
  try{await Notifier.sync(true)}catch(e){}}
H.snd_pick=async()=>{const D=DN();try{const r=await D.pickAudio();if(!r||r.cancelled)return;
  db.set.soundUri={uri:r.uri,name:r.name,sys:r.sys||''};db.set.sound=null;if(!save())return;await applyChannel();
  say(r.sys?T('آهنگ انتخاب شد؛ آزمایش کن','Sound selected; try it'):T('آهنگ انتخاب شد. برای زنگ اعلان وقتی برنامه بسته است، فایل را از تب «صوتی/Audio» انتخاب کن؛ داخل برنامه همین کار می‌کند','Sound selected. For notification alarms while the app is closed, pick it from the Audio tab; in-app it works as is'));render()}
  catch(e){say(T('انتخاب آهنگ ناموفق بود: ','Could not pick sound: ')+(e&&e.message||e),1)}};
H.snd_unpick=async()=>{delete db.set.soundUri;save();await applyChannel();render()};
document.addEventListener('click',e=>{const i=e.target;if(ok()&&DN().pickAudio&&i&&i.matches&&i.matches('input[data-ch="sndf"]')){e.preventDefault();e.stopPropagation();H.snd_pick()}},true);
{const _ps=playSound,_ss=stopSound;
playSound=function(){const s=db.set.soundUri,D=DN();
  if(ok()&&D.playUri&&s&&!db.set.sound){try{stopSound()}catch(e){}SND.playing=true;
    D.playUri({uri:s.uri,volume:Math.max(0,Math.min(1,db.set.vol)),loop:false}).then(()=>{clearTimeout(SND.tm);SND.tm=setTimeout(stopSound,6e4)}).catch(e=>{SND.playing=false;say(T('پخش آهنگ ممکن نشد؛ دوباره انتخابش کن (شاید از گوشی پاک یا جابه‌جا شده)','Could not play the sound; pick it again (it may have been moved or deleted)'),1)});return}
  return _ps.apply(this,arguments)};
stopSound=function(){try{if(ok()&&DN().stopPlay)DN().stopPlay()}catch(e){}return _ss.apply(this,arguments)};
try{DN()&&DN().addListener&&DN().addListener('playEnd',()=>{try{SND.playing=false}catch(e){}})}catch(e){}}

/* ================= کارت‌های تنظیمات ================= */
{const _sp=setPage;setPage=function(){let h=_sp.apply(this,arguments);if(!ok())return h;
  if(h.indexOf('data-ch="sndf"')>-1){const s=db.set.soundUri;
    h=h.replace(/(data-ch="sndf"[^>]*><\/label>)/,'$1'+(s?'<button data-a="snd_unpick">'+T('حذف آهنگ گوشی','Remove phone sound')+'</button>':''));
    h+='<p class="m">'+(s?T('آهنگ از حافظه‌ی گوشی: <b>'+esc(s.name)+'</b> — داخل برنامه کپی نشده و به حجم پشتیبان اضافه نمی‌شود.','Phone sound: <b>'+esc(s.name)+'</b> — not copied into the app, not added to backups.'):T('«صدای دلخواه» حالا مستقیم از حافظه‌ی گوشی انتخاب می‌شود (بدون سقف ۱٫۵ مگابایت).','"Custom sound" is now picked straight from your phone (no 1.5 MB limit).'))+'</p>'}
  if(stt==='data'&&DN().saveFromCache){const l=LS(BK);
    h+='<div class="c"><h3>'+T('پشتیبان خودکار روی گوشی','Automatic backup on this phone')+'</h3><p class="m">'+T('بدون اشتراک‌گذاری و بدون دانلود، در پوشه‌ی <b dir="ltr">Documents/DANI/Backups</b> ذخیره می‌شود و با حذف برنامه هم می‌ماند (۷ پشتیبان آخر JSON و ۳ پشتیبان کامل نگه داشته می‌شود).','Saved without sharing or downloading in <b dir="ltr">Documents/DANI/Backups</b>, kept even if the app is removed (last 7 JSON and 3 full backups).')+'</p><div class="row"><button class="chip '+(abOn()?'on':'')+'" data-a="ab_tog">'+(abOn()?T('روشن','On'):T('خاموش','Off'))+'</button><button data-a="ab_days">'+T('هر ','Every ')+fa(+db.set.abkd||1)+T(' روز',' day(s)')+'</button><button class="p" data-a="ab_now">'+T('همین حالا پشتیبان بگیر','Back up now')+'</button></div><p class="m">'+T('آخرین JSON: ','Last JSON: ')+(l.j?new Date(l.j).toLocaleString(LANGEN()?'en-US':'fa-IR'):'—')+' · '+T('آخرین کامل: ','Last full: ')+(l.z?new Date(l.z).toLocaleString(LANGEN()?'en-US':'fa-IR'):'—')+'</p></div>'}
  if(stt==='time'&&DN().calendarAdd){
    h+='<div class="c"><h3>'+T('تقویم گوشی','Phone calendar')+'</h3><p class="m">'+T('موعدها و یادآورها (از جمله یادآور عادت‌ها) مستقیم در تقویم گوشی ذخیره می‌شوند؛ بدون لینک و ارسال به تلگرام.','Deadlines and reminders (including habit reminders) are saved straight into your phone calendar; no links or sharing.')+'</p><div class="row"><button class="p" data-a="ics">'+T('افزودن مستقیم به تقویم گوشی','Add to phone calendar')+'</button><button class="chip '+(db.set.calAuto?'on':'')+'" data-a="cal_auto">'+T('به‌روزرسانی خودکار: ','Auto-update: ')+(db.set.calAuto?T('روشن','On'):T('خاموش','Off'))+'</button><button data-a="ics_file">'+T('فقط فایل .ics','.ics file only')+'</button></div></div>'}
  return h}}

/* ================= راه‌اندازی ================= */
if(native()){
  try{const s=db.set.soundUri;if(s&&(s.sys||s.uri))window.daniAlarmCh='dani-alarm-u'+hsh(s.sys||s.uri)}catch(e){}
  setTimeout(()=>{if(ok()){applyChannel();autoBackup(false);calAutoRun()}},25000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(calAutoRun,3000)});
}
})();
