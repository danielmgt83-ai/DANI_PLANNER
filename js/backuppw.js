/* رمز اختیاری برای «پشتیبان کامل» (v65). فایل .dani-all.zip هنگام دانلود با AES-GCM (کلید از رمز با PBKDF2) قفل می‌شود
   و به‌صورت *.dani-all.locked.zip ذخیره می‌شود؛ هنگام «بازیابی» از روی سرآیند DANIENC1 تشخیص داده و رمز پرسیده می‌شود.
   رمز هیچ‌جا ذخیره نمی‌شود. روشن/خاموش: db.set.bkpw. وابسته به window.daniCrypt.ask (lock.js). بعد از backupc.js و courses.js. */
(function(){'use strict';
const T=window.daniT,MAG='DANIENC1',IT=200000,SUB=()=>crypto&&crypto.subtle;
async function key(pw,salt,it){const k=await SUB().importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveKey']);return SUB().deriveKey({name:'PBKDF2',salt,iterations:it,hash:'SHA-256'},k,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function lock(buf,pw){const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),ct=new Uint8Array(await SUB().encrypt({name:'AES-GCM',iv},await key(pw,salt,IT),buf));
  const h=new Uint8Array(8+4+16+12);h.set(new TextEncoder().encode(MAG),0);new DataView(h.buffer).setUint32(8,IT);h.set(salt,12);h.set(iv,28);return new Blob([h,ct],{type:'application/zip'})}
async function unlock(buf,pw){const u=new Uint8Array(buf),it=new DataView(buf).getUint32(8),salt=u.slice(12,28),iv=u.slice(28,40);
  try{return await SUB().decrypt({name:'AES-GCM',iv},await key(pw,salt,it),u.slice(40))}catch(e){throw new Error('bad')}}
const isLocked=async f=>{try{return new TextDecoder().decode(await f.slice(0,8).arrayBuffer())===MAG}catch(e){return false}};
/* خروجی: رهگیری دانلود */
const _click=HTMLAnchorElement.prototype.click;
HTMLAnchorElement.prototype.click=function(){const a=this,nm=a.download||'';
  if(a._dn||!db.set.bkpw||!/\.dani-all\.zip$/.test(nm)||/^DANI-safety/.test(nm)||!/^blob:/.test(a.href||''))return _click.apply(a,arguments);
  const href=a.href,pb=fetch(href).then(r=>r.arrayBuffer());
  (async()=>{try{const pw=await window.daniCrypt.ask(T('رمز پشتیبان کامل','Full-backup password'),T('اگر این رمز را فراموش کنی، فایل پشتیبان باز نمی‌شود؛ جایی امن یادداشتش کن.','If you forget this password the backup cannot be opened; keep it somewhere safe.'),true);
    if(!pw){toast(T('لغو شد؛ پشتیبان ذخیره نشد.','Cancelled; backup not saved.'),1);return}
    const blob=await lock(await pb,pw),b=document.createElement('a');b.href=URL.createObjectURL(blob);b.download=nm.replace(/\.dani-all\.zip$/,'.dani-all.locked.zip');b._dn=1;document.body.appendChild(b);_click.call(b);
    setTimeout(()=>{URL.revokeObjectURL(b.href);b.remove()},4000);toast(T('پشتیبان با رمز ذخیره شد 🔐','Password-protected backup saved 🔐'))}
   catch(e){console.error('bkpw',e);toast(T('قفل‌کردن پشتیبان ناموفق بود','Could not lock the backup'),1)}})()};
/* ورودی: بازیابی */
document.addEventListener('change',async ev=>{const t=ev.target;if(!t||!t.matches||!t.matches('input[data-crs-file=all]')||t._dn)return;const f=t.files&&t.files[0];if(!f)return;
  ev.stopImmediatePropagation();const pass=()=>{t._dn=1;t.dispatchEvent(new Event('change',{bubbles:true}));setTimeout(()=>{t._dn=0},500)};
  if(!(await isLocked(f)))return pass();
  try{const pw=await window.daniCrypt.ask(T('رمز پشتیبان کامل','Full-backup password'),T('این فایل با رمز قفل شده است.','This file is password-protected.'),false);
    if(!pw){t.value='';return}
    let plain;try{plain=await unlock(await f.arrayBuffer(),pw)}catch(e){t.value='';return toast(T('رمز نادرست است (یا فایل خراب است)','Wrong password (or damaged file)'),1)}
    const dt=new DataTransfer();dt.items.add(new File([plain],f.name.replace(/\.locked\.zip$/,'.zip'),{type:'application/zip'}));t.files=dt.files;t._dn=1;t.dispatchEvent(new Event('change',{bubbles:true}));setTimeout(()=>{t._dn=0},500)}
  catch(e){console.error('bkpw',e);toast(T('بازیابی ناموفق بود','Restore failed'),1)}},true);
/* کارت */
function ui(){const c=document.getElementById('bkc');if(!c)return;if(!document.getElementById('bkpr')){const r=document.createElement('div');r.className='row';r.id='bkpr';r.style.marginTop='6px';
  r.innerHTML='<label class="row" style="align-items:center;gap:8px"><input type="checkbox" data-bkp="1"'+(db.set.bkpw?' checked':'')+'> 🔐 '+T('پشتیبان کامل با رمز قفل شود','Lock the full backup with a password')+'</label><p class="m" style="width:100%">'+T('هر بار که پشتیبان کامل می‌گیری رمز را می‌پرسد (ذخیره نمی‌شود). بازیابی هم خودش رمز را می‌خواهد.','Asked every time you take a full backup (not stored). Restore asks for it too.')+'</p>';c.appendChild(r)}
  c.querySelectorAll('input[data-crs-file=all]').forEach(i=>{i.accept='.zip,application/zip,application/octet-stream'})}
document.addEventListener('change',ev=>{const t=ev.target;if(t&&t.dataset&&t.dataset.bkp){db.set.bkpw=!!t.checked;save()}});
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{ui()}catch(e){}return r}}
window.daniBkPw={lock,unlock};
})();
