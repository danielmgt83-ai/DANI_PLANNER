"use strict";
/* DANI · native-save.js
   ذخیره‌ی فایل در «اپ اندروید» (Capacitor). WebView اندروید دانلود blob/data را ساکت نادیده می‌گیرد؛
   این فایل هر <a download> با آدرس blob:/data: را می‌گیرد و:
   ۱) مستقیم در حافظه‌ی گوشی ذخیره می‌کند: Download/DANI (خروجی‌ها) یا Documents/DANI/Backups (پشتیبان خودکار)
      با افزونه‌ی بومی DaniNative (MediaStore؛ بدون مجوز، بدون پنجره‌ی اشتراک‌گذاری) و پنجره‌ی «باز کردن / اشتراک‌گذاری» نشان می‌دهد.
   ۲) اگر افزونه‌ی بومی نبود (APK قدیمی) یا اندروید ۹ و پایین‌تر: مثل قبل پنجره‌ی اشتراک‌گذاری (filesystem + share) و بعد کلیپ‌بورد.
   در مرورگر و PWA هیچ تغییری نمی‌کند.
   API: window.daniSaveFile(name, blob, {silent, folder:'Download'|'Documents', sub, replace}) */
(()=>{
const cap=()=>window.Capacitor;
const native=()=>{try{return !!(cap()&&cap().isNativePlatform&&cap().isNativePlatform())}catch(e){return false}};
const plug=n=>{try{return cap().Plugins[n]||null}catch(e){return null}};
const T=(fa,en)=>{try{return LANGEN()?en:fa}catch(e){return fa}};
const say=(m,bad)=>{try{toast(m,bad)}catch(e){}};
const safe=n=>String(n||'dani-file').replace(/[\\\/:*?"<>|\u0000-\u001f]/g,'_').slice(0,120)||'dani-file';
const b64=u8=>{let s='';for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s)};
const DIR='dani-out',CH=3*170000; /* ۵۱۰ هزار بایت در هر تکه (مضرب ۳ برای base64) */
const MIME={json:'application/json',zip:'application/zip',pdf:'application/pdf',ics:'text/calendar',csv:'text/csv',doc:'application/msword',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',html:'text/html',txt:'text/plain'};
const mimeOf=(n,b)=>MIME[String(n).split('.').pop().toLowerCase()]||String(b&&b.type||'').split(';')[0]||'application/octet-stream';
let LAST=null;

/* پنجره‌ی «ذخیره شد» با باز کردن و اشتراک‌گذاری */
function savedUI(r,name,mime,silent){
  LAST={uri:r.uri,mime,name};if(silent)return;
  try{modal('<h3>✓ '+T('در گوشی ذخیره شد','Saved on your phone')+'</h3><p dir="ltr" style="text-align:start"><b>'+esc(r.path||name)+'</b></p><p class="m">'+T('در برنامه‌ی «Files» (فایل‌ها) گوشی، همین پوشه را باز کن.','Open this folder in your phone\'s Files app.')+'</p><div class="row"><button class="p" data-a="ns_open">'+T('باز کردن','Open')+'</button><button data-a="ns_share">'+T('اشتراک‌گذاری','Share')+'</button><button data-a="cl">'+T('بستن','Close')+'</button></div>')}
  catch(e){say(T('ذخیره شد: ','Saved: ')+(r.path||name))}
}
window.daniSavedUI=savedUI;
try{H.ns_open=async()=>{const D=plug('DaniNative');if(!LAST||!D)return;try{await D.openUri({uri:LAST.uri,mime:LAST.mime})}catch(e){say(T('برنامه‌ای برای باز کردن این فایل نیست؛ از «اشتراک‌گذاری» یا برنامه‌ی Files استفاده کن','No app can open this file; use Share or the Files app'),1)}};
H.ns_share=async()=>{const D=plug('DaniNative');if(!LAST||!D)return;try{await D.shareUri({uri:LAST.uri,mime:LAST.mime})}catch(e){say(String(e&&e.message||e),1)}}}catch(e){}

/* نوشتن در حافظه‌ی موقت اپ (تکه‌تکه) و انتقال به حافظه‌ی گوشی با افزونه‌ی بومی */
async function toCache(name,blob){
  const FS=plug('Filesystem'),dir=DIR+'/'+Date.now()+Math.floor(Math.random()*1e4),path=dir+'/'+name,u8=new Uint8Array(await blob.arrayBuffer());
  for(let o=0,first=true;o<u8.length||first;o+=CH,first=false){
    const d=b64(u8.subarray(o,o+CH));
    if(first)await FS.writeFile({path,data:d,directory:'CACHE',recursive:true});
    else await FS.appendFile({path,data:d,directory:'CACHE'});
  }
  return{dir,path};
}
async function viaStore(name,blob,o){
  const D=plug('DaniNative'),FS=plug('Filesystem');if(!D||!D.saveFromCache||!FS)return false;
  const c=await toCache(name,blob),mime=mimeOf(name,blob);let r;
  try{r=await D.saveFromCache({path:c.path,name,folder:o.folder||'Download',sub:o.sub||'DANI',mime,replace:!!o.replace})}
  finally{try{await FS.rmdir({path:c.dir,directory:'CACHE',recursive:true})}catch(e){}}
  savedUI(r,name,mime,o.silent);return true;
}

/* راه قدیمی: پنجره‌ی اشتراک‌گذاری */
async function viaPlugins(name,blob){
  const FS=plug('Filesystem'),SH=plug('Share');if(!FS||!SH)return false;
  try{await FS.rmdir({path:DIR,directory:'CACHE',recursive:true})}catch(e){}
  const c=await toCache(name,blob);
  const r=await FS.getUri({path:c.path,directory:'CACHE'});
  await SH.share({title:name,dialogTitle:T('ذخیره یا ارسال فایل','Save or send file'),url:r.uri});
  return true;
}
async function viaWebShare(name,blob){
  try{const f=new File([blob],name,{type:blob.type||'application/octet-stream'});
    if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:name});return true}}catch(e){if(e&&e.name==='AbortError')return true}
  return false;
}
async function viaClipboard(name,blob){
  if(!/^(text\/|application\/(json|xml))/.test(blob.type||'')||blob.size>1.5e6)return false;
  try{await navigator.clipboard.writeText((await blob.text()).replace(/^\ufeff/,''));
    say(T('امکان ذخیره‌ی فایل نبود؛ محتوای «'+name+'» کپی شد. آن را در یادداشت یا تلگرام (Saved Messages) جایگذاری کن و ذخیره کن. برای حل کامل، اپ را دوباره بساز (Actions ← Build Android app).','Could not save the file; the content of "'+name+'" was copied. Paste it into a note or Telegram (Saved Messages). To fix this fully, rebuild the app (Actions > Build Android app).'),1);return true}catch(e){return false}
}
async function save(name,blob,o){
  o=o||{};name=safe(name);
  try{if(await viaStore(name,blob,o))return true}catch(e){console.error('native-save store',e)}
  if(o.silent)return false; /* پشتیبان خودکار: بی‌صدا شکست می‌خورد، پنجره‌ی اشتراک باز نمی‌کند */
  try{if(await viaPlugins(name,blob))return true}catch(e){
    if(/cancel|dismiss/i.test(String(e&&e.message||e)))return true;
    console.error('native-save plugins',e)}
  if(await viaWebShare(name,blob))return true;
  if(await viaClipboard(name,blob))return true;
  say(T('ذخیره‌ی فایل در این نسخه‌ی اپ ممکن نیست؛ اپ را با آخرین نسخه بساز (Actions ← Build Android app) تا افزونه‌ی ذخیره‌ی فایل اضافه شود.','Saving files is not supported by this app build; rebuild the app (Actions > Build Android app) to add the file plugin.'),1);
  return false;
}
window.daniSaveFile=save;

const want=a=>native()&&a&&a.hasAttribute&&a.hasAttribute('download')&&/^(blob:|data:)/i.test(a.href||'');
async function handle(a){
  let name=a.getAttribute('download')||'dani-file',o={};const href=a.href,q=window.__daniQuiet;
  /* پشتیبان خودکار (native-extras.js) فقط یک‌بار و فقط برای فایل هم‌نام الگو، بی‌صدا ذخیره می‌شود */
  if(q&&q.exp>Date.now()&&(!q.re||q.re.test(name))){o={silent:true,folder:q.folder,sub:q.sub,replace:true};if(q.name)name=q.name;window.__daniQuiet=null}
  try{const blob=await (await fetch(href)).blob();await save(name,blob,o)}
  catch(e){console.error('native-save',e);if(!o.silent)say(T('ساخت یا ذخیره‌ی فایل ناموفق بود: ','File could not be saved: ')+(e&&e.message||e),1)}
}
const oc=HTMLAnchorElement.prototype.click;
HTMLAnchorElement.prototype.click=function(){if(want(this)){handle(this);return}return oc.apply(this,arguments)};
document.addEventListener('click',e=>{const a=e.target&&e.target.closest&&e.target.closest('a[download]');if(a&&want(a)){e.preventDefault();e.stopPropagation();handle(a)}},true);
})();
