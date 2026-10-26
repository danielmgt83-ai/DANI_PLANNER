"use strict";
/* DANI · native-save.js
   ذخیره‌ی فایل در «اپ اندروید» (Capacitor). WebView اندروید دانلود blob/data را ساکت نادیده می‌گیرد
   (پیام «دانلود شد» می‌آید ولی فایلی ساخته نمی‌شود). این فایل هر <a download> با آدرس blob:/data: را
   در اپ می‌گیرد، فایل را در حافظه‌ی موقت اپ می‌نویسد و پنجره‌ی اشتراک‌گذاری اندروید را باز می‌کند
   (ذخیره در Files/Drive، تلگرام، ایمیل ...). در مرورگر و PWA هیچ تغییری نمی‌کند.
   نیاز: افزونه‌های @capacitor/filesystem و @capacitor/share در پوسته‌ی اندروید (android-shell/package.json).
   فایل‌های دیگر لازم نیست عوض شوند؛ همه‌ی dl() و download() و .ics و docx و پشتیبان‌ها از همین مسیر می‌گذرند.
   API: window.daniSaveFile(name, blob) */
(()=>{
const cap=()=>window.Capacitor;
const native=()=>{try{return !!(cap()&&cap().isNativePlatform&&cap().isNativePlatform())}catch(e){return false}};
const plug=n=>{try{return cap().Plugins[n]||null}catch(e){return null}};
const T=(fa,en)=>{try{return LANGEN()?en:fa}catch(e){return fa}};
const say=(m,bad)=>{try{toast(m,bad)}catch(e){}};
const safe=n=>String(n||'dani-file').replace(/[\\\/:*?"<>|\u0000-\u001f]/g,'_').slice(0,120)||'dani-file';
const b64=u8=>{let s='';for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s)};
const DIR='dani-out',CH=3*170000; /* ۵۱۰ هزار بایت در هر تکه (مضرب ۳ برای base64) */

async function viaPlugins(name,blob){
  const FS=plug('Filesystem'),SH=plug('Share');if(!FS||!SH)return false;
  try{await FS.rmdir({path:DIR,directory:'CACHE',recursive:true})}catch(e){}
  const path=DIR+'/'+name,u8=new Uint8Array(await blob.arrayBuffer());
  for(let o=0,first=true;o<u8.length||first;o+=CH,first=false){
    const d=b64(u8.subarray(o,o+CH));
    if(first)await FS.writeFile({path,data:d,directory:'CACHE',recursive:true});
    else await FS.appendFile({path,data:d,directory:'CACHE'});
  }
  const r=await FS.getUri({path,directory:'CACHE'});
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
async function save(name,blob){
  name=safe(name);
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
  const name=a.getAttribute('download')||'dani-file',href=a.href;
  try{const blob=await (await fetch(href)).blob();await save(name,blob)}
  catch(e){console.error('native-save',e);say(T('ساخت یا ذخیره‌ی فایل ناموفق بود: ','File could not be saved: ')+(e&&e.message||e),1)}
}
const oc=HTMLAnchorElement.prototype.click;
HTMLAnchorElement.prototype.click=function(){if(want(this)){handle(this);return}return oc.apply(this,arguments)};
document.addEventListener('click',e=>{const a=e.target&&e.target.closest&&e.target.closest('a[download]');if(a&&want(a)){e.preventDefault();e.stopPropagation();handle(a)}},true);
})();
