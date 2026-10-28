"use strict";
/* DANI · soundcenter.js — «صدای اعلان‌ها»: برای هر دسته صدای جدا (زنگ و تایمر، یادآورها، عادت‌ها، اعلان‌های هوشمند).
   صدا از دو جا انتخاب می‌شود: (۱) فهرست زنگ/اعلان خودِ گوشی (نیازمند متد pickRingtone در APK جدید) و (۲) آهنگ‌های حافظه‌ی گوشی (pickAudio).
   فقط نام و آدرس ذخیره می‌شود؛ خود فایل هیچ‌وقت داخل برنامه/پشتیبان کپی نمی‌شود. فقط در برنامه‌ی اندروید فعال است.
   داده: db.set.snd2 {rem,habit,gen: {uri,name,sys}}، db.set.sndCh (شناسه‌ی کانال‌ها)، فهرست آهنگ‌ها: db.set.soundList (مشترک با native-extras). دسته‌ی «زنگ و تایمر» همان db.set.soundUri است. */
(function(){
const T=window.daniT;
const cap=()=>window.Capacitor;
const native=()=>{try{return !!(cap()&&cap().isNativePlatform&&cap().isNativePlatform())}catch(e){return false}};
const DN=()=>{try{return cap().Plugins.DaniNative||null}catch(e){return null}};
const LN=()=>{try{return cap().Plugins.LocalNotifications||null}catch(e){return null}};
const ok=()=>native()&&!!DN();
const hsh=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return Math.abs(h).toString(36)};
const CATS=[
 {k:'alarm',n:['زنگ و تایمر (پایان تایمر/پومودورو)','Alarm & timer (timer / Pomodoro end)'],ty:4},
 {k:'rem',n:['یادآورها و موعدها','Reminders & deadlines'],ty:2},
 {k:'habit',n:['یادآور عادت‌ها','Habit reminders'],ty:2},
 {k:'gen',n:['اعلان‌های هوشمند (بعدی چی؟، چرخه، برنامه‌ی فردا)','Smart notifications (next, rhythm, plan tomorrow)'],ty:2}];
const S2=()=>{const s=db.set;if(!s.snd2||typeof s.snd2!=='object')s.snd2={};return s.snd2};
const CH=()=>{const s=db.set;if(!s.sndCh||typeof s.sndCh!=='object')s.sndCh={};return s.sndCh};
const lib=()=>{const l=Array.isArray(db.set.soundList)?db.set.soundList:[];db.set.soundList=l;return l};
const cur=k=>k==='alarm'?db.set.soundUri:S2()[k];
let OPEN='';
window.daniChIds=window.daniChIds||{};
Object.keys(CH()).forEach(k=>{window.daniChIds[k]=CH()[k]});
/* کدام دسته؟ — برای انتخاب کانال هر اعلان */
window.daniChFor=function(x){try{
  if(!x||x.ch==='dani-alarm-v2'||x.ch==='dani-pin-v1')return null;
  const key=String(x.key||'');let cat='gen';
  if(key==='timer-pre')cat='rem';
  else if(key.split('|').length===3){cat='rem';try{const r=(typeof rItems==='function'?rItems().concat(typeof dlRems==='function'?dlRems():[]):[]).find(z=>z.id===key.split('|')[0]);if(r&&r.link&&r.link.type==='habit')cat='habit'}catch(e){}}
  return window.daniChIds[cat]||null}catch(e){return null}};
async function applyCat(k){const D=DN(),s=S2()[k],old=CH()[k];
  try{
    if(s&&(s.sys||s.uri)){const id='dani-s-'+k+'-'+hsh(s.sys||s.uri);
      await D.soundChannel({id,name:T('DANI · ','DANI · ')+T(CATS.find(c=>c.k===k).n[0],CATS.find(c=>c.k===k).n[1]),uri:s.sys||s.uri});
      if(old&&old!==id){try{await LN().deleteChannel({id:old})}catch(e){}}
      CH()[k]=id;window.daniChIds[k]=id}
    else{if(old){try{await LN().deleteChannel({id:old})}catch(e){}}delete CH()[k];window.daniChIds[k]=''}
  }catch(e){console.error('soundcenter',e);try{toast(T('ساخت کانال صدا ممکن نشد: ','Could not set sound channel: ')+(e&&e.message||e),1)}catch(_){}}
  save();try{await Notifier.sync(true)}catch(e){}}
function assign(k,it){
  if(k==='alarm'){const l=lib();let i=l.findIndex(y=>y.uri===it.uri);if(i<0){l.push({uri:it.uri,name:it.name,sys:it.sys||''});i=l.length-1}save();return H.snd_sel({dataset:{k:String(i)}})}
  S2()[k]={uri:it.uri,name:it.name,sys:it.sys||''};return applyCat(k).then(()=>render())}
H.sc_open=e=>{OPEN=OPEN===e.dataset.k?'':e.dataset.k;render()};
H.sc_sys=async e=>{const k=e.dataset.k,D=DN(),c=CATS.find(x=>x.k===k);if(!D||!D.pickRingtone)return toast(T('برای فهرست زنگ‌های خود گوشی، APK باید یک‌بار از نو ساخته شود؛ فعلاً از «آهنگ‌های من» استفاده کن.','The phone ringtone list needs a rebuilt APK; use "My songs" for now.'),1);
  try{const r=await D.pickRingtone({type:c.ty});if(!r||r.cancelled||!r.uri)return;await assign(k,{uri:r.uri,name:r.name||T('زنگ گوشی','Phone sound'),sys:r.uri})}catch(err){toast(T('انتخاب ناموفق بود: ','Pick failed: ')+(err&&err.message||err),1)}};
H.sc_add=async e=>{const k=e.dataset.k,D=DN();if(!D||!D.pickAudio)return;
  try{const r=await D.pickAudio();if(!r||r.cancelled)return;const it=(r.items&&r.items.length?r.items:[{uri:r.uri,name:r.name,sys:r.sys}]).filter(x=>x&&x.uri),l=lib();
    it.forEach(x=>{if(!l.some(y=>y.uri===x.uri)&&l.length<80)l.push({uri:x.uri,name:x.name||'audio',sys:x.sys||''})});
    if(it[0])await assign(k,{uri:it[0].uri,name:it[0].name||'audio',sys:it[0].sys||''});else render()}catch(err){toast(T('انتخاب ناموفق بود: ','Pick failed: ')+(err&&err.message||err),1)}};
H.sc_pick=async e=>{const k=e.dataset.k,x=lib()[+e.dataset.i];if(x)await assign(k,x)};
H.sc_def=async e=>{const k=e.dataset.k;if(k==='alarm')return H.snd_unpick();delete S2()[k];await applyCat(k);render()};
H.sc_play=e=>{const D=DN(),k=e.dataset.k,s=e.dataset.i!==undefined?lib()[+e.dataset.i]:cur(k);if(!D||!D.playUri||!s)return;
  try{D.playUri({uri:s.sys||s.uri,volume:Math.max(0,Math.min(1,+db.set.vol||1)),loop:false}).then(()=>setTimeout(()=>{try{D.stopPlay()}catch(e){}},8000)).catch(()=>toast(T('پخش ممکن نشد؛ شاید فایل جابه‌جا شده','Could not play; file may have moved'),1))}catch(err){}};
function card(){
  let h='<div class="c" id="sccard">'+daniH('🎵','صدای اعلان‌ها','Notification sounds')+'<p class="m">'+T('برای هر دسته یک صدای جدا انتخاب کن: از فهرست زنگ و اعلان‌های خود گوشی یا از آهنگ‌های حافظه‌ی گوشی. فایل‌ها کپی نمی‌شوند و به حجم برنامه و پشتیبان اضافه نمی‌شوند.','Pick a separate sound per category: from your phone\'s own ringtone list or songs on your phone. Files are never copied; nothing is added to app or backup size.')+'</p>';
  CATS.forEach(c=>{const s=cur(c.k),op=OPEN===c.k;
    h+='<div class="cwr" style="display:block;margin:8px 0;padding:8px;border:1px solid var(--bd,#8884);border-radius:12px"><div class="row"><b style="flex:1">'+esc(T(c.n[0],c.n[1]))+'</b>'+(s?'<button data-a="sc_play" data-k="'+c.k+'" aria-label="play">▶</button>':'')+'</div>'
     +'<div class="m" dir="auto">'+(s?'🎶 '+esc(s.name):T('صدای پیش‌فرض برنامه','App default sound'))+'</div>'
     +'<div class="row" style="margin-top:6px"><button class="chip" data-a="sc_sys" data-k="'+c.k+'">📱 '+T('زنگ‌های گوشی','Phone sounds')+'</button><button class="chip '+(op?'on':'')+'" data-a="sc_open" data-k="'+c.k+'">🎵 '+T('آهنگ‌های من','My songs')+' '+(op?'▴':'▾')+'</button>'+(s?'<button class="chip" data-a="sc_def" data-k="'+c.k+'">'+T('پیش‌فرض','Default')+'</button>':'')+'</div>';
    if(op){const l=lib();h+='<div style="margin-top:6px">'+(l.length?l.map((q,i)=>{const on=s&&s.uri===q.uri;return'<div class="row"><button class="chip '+(on?'on':'')+'" data-a="sc_pick" data-k="'+c.k+'" data-i="'+i+'" style="flex:1;text-align:start;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" dir="auto">'+(on?'✓ ':'')+esc(q.name)+'</button><button data-a="sc_play" data-k="'+c.k+'" data-i="'+i+'" aria-label="play">▶</button></div>'}).join(''):'<div class="m">'+T('هنوز آهنگی اضافه نکرده‌ای.','No songs added yet.')+'</div>')
      +'<div class="row" style="margin-top:6px"><button class="p" data-a="sc_add" data-k="'+c.k+'">＋ '+T('افزودن آهنگ از گوشی (دانلودها، آهنگ‌ها…)','Add songs from phone (Downloads, Music…)')+'</button></div></div>'}
    h+='</div>'});
  return h+'</div>'}
{const _sp=setPage;setPage=function(){const h=_sp.apply(this,arguments);return(ok()&&typeof h==='string'&&typeof stt!=='undefined'&&stt==='time')?h+card():h}}
})();
