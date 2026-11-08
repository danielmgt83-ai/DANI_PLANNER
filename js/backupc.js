'use strict';
/* DANI · backupc.js — «مرکز پشتیبان» (یک جا برای همه‌ی کارهای پشتیبان).
   چیزی حذف نمی‌شود: پشتیبان کامل، بازیابی، نسخه‌های خودکار، رمز و یادآوری همین‌جا جمع شده‌اند؛
   کارت‌های ریزتر (JSON/CSV، ارسال، سطل بازیافت…) زیر همین گروه می‌مانند. */
(function(){
const T=window.daniT;
const lastAll=()=>{try{const t=+localStorage.getItem('crs_lastall');return t?new Date(t).toLocaleDateString(db.set.cal==='g'?'en-GB':'fa-IR'):''}catch(e){return''}};
const daysSince=()=>{try{const t=+localStorage.getItem('crs_lastall');return t?Math.floor((Date.now()-t)/864e5):null}catch(e){return null}};
function card(){
  const d=daysSince(),bk=+db.set.bk||0,pw=window.daniCrypt&&window.daniCrypt.on&&window.daniCrypt.on();
  const warn=d===null?T('هنوز پشتیبان کامل نگرفته‌ای.','No full backup yet.'):T('آخرین پشتیبان کامل: ','Last full backup: ')+lastAll()+' ('+fa(d)+T(' روز پیش',' days ago')+')';
  const st=d===null||(bk&&d>bk)?'var(--wr)':'inherit';
  return'<div class="c" id="bkc">'+daniH('💾','مرکز پشتیبان','Backup centre')
   +'<p style="color:'+st+'"><b>'+warn+'</b></p>'
   +'<div class="row"><button class="p" data-a="crs_allexp">🛡 '+T('پشتیبان کامل بگیر','Take full backup')+'</button>'
   +'<label class="btn" style="margin:0">♻️ '+T('بازیابی','Restore')+'<input type="file" accept=".zip" data-crs-file="all" hidden></label></div>'
   +'<p class="m">'+T('یک فایل برای همه‌چیز (پلنر، تم‌ها، آکادمی). کوچک‌ترین حجم: گزینه‌های «تصاویر» و «دوره‌ها» را در کارت پایین خاموش کن.','One file for everything (planner, themes, academy). Smallest size: switch off “images” and “courses” in the card below.')+'</p>'
   +'<label>'+T('یادآوری پشتیبان','Backup reminder')+'</label><select data-ch="sf" data-f="bk" data-n="1">'
   +[[0,T('خاموش','Off')],[3,T('هر ۳ روز','Every 3 days')],[7,T('هفته‌ای','Weekly')],[14,T('دو هفته','2 weeks')],[30,T('ماهی','Monthly')]].map(o=>'<option value="'+o[0]+'"'+(bk===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select>'
   +'<p class="m">🗄 '+T('نسخه‌ی خودکار هفتگی داخل خود برنامه هم نگه داشته می‌شود (کارت «نسخه‌های خودکار»).','A weekly automatic copy is also kept inside the app (see “Automatic snapshots”).')+'</p>'
   +'<div class="row"><span>🔑 '+T('رمز فایل انتقال: ','Transfer-file password: ')+'<b>'+(pw?T('روشن','On'):T('خاموش','Off'))+'</b></span>'
   +'<button class="chip" data-a="bk_pw">'+(pw?T('تغییر/خاموش','Change / off'):T('تنظیم رمز','Set password'))+'</button></div></div>'}
H.bk_pw=()=>{const g=document.getElementById('lkcard');if(g){let p=g.closest('details');if(p)p.open=true;g.scrollIntoView({block:'center'})}else toast(T('کارت «قفل و رمز» پایین همین صفحه است','See the “App lock” card below'))};
const ren=()=>{try{if(typeof ST!=='undefined')ST.forEach(x=>{if(x[0]==='uch'&&x[1]==='مرکز DANI')x[1]='افزونه‌ها و گزارش'})}catch(e){}};
{const _sp=setPage;setPage=function(){ren();const h=_sp.apply(this,arguments);return(typeof h==='string'&&typeof stt!=='undefined'&&stt==='data')?card()+h:h}}
/* v89: همه‌ی کارهای پشتیبان در همین یک کارت؛ کارت‌های جدا بعد از رسم به بخش‌های تاشو منتقل می‌شوند (دکمه‌ها همان‌اند، فقط جابه‌جا شده‌اند) */
const sec=(ic,fa_,en_)=>{const d=document.createElement('details');d.className='bkx';d.innerHTML='<summary>'+ic+' '+T(fa_,en_)+'</summary>';return d};
function merge(){
  const pg=document.getElementById('pg'),b=document.getElementById('bkc');if(!pg||!b)return;
  const all=[...pg.querySelectorAll('.c')],byA=a=>all.find(c=>c.querySelector('[data-a="'+a+'"]')&&c.id!=='bkc'&&!c.classList.contains('bgrp')&&!c.contains(b));
  const dc=byA('xjson'),sh=byA('xshare'),cr=document.getElementById('crs-allcard'),ab=document.getElementById('abcard');
  if(!b.dataset.mg&&dc&&cr){
    /* گزینه‌های حجم زیر دکمه‌های اصلی */
    const opt=cr.querySelector('details');if(opt){const o=sec('⚙️','گزینه‌های حجم فایل','File-size options');[...opt.childNodes].forEach((n,i)=>{if(i>0||n.tagName!=='SUMMARY')o.appendChild(n)});{const sl=b.querySelector('select[data-f="bk"]'),lb=sl&&sl.previousElementSibling;if(lb)b.insertBefore(o,lb);else b.appendChild(o)}}
    /* فایل ساده */
    const row=dc.querySelector('.row'),st=dc.querySelector('p.m'),ls=[...dc.querySelectorAll('p.m')].pop(),dn=dc.querySelectorAll('.row')[1];
    const f=sec('🗂','فایل ساده (فقط پلنر: JSON / CSV)','Simple file (planner only: JSON / CSV)');if(st)f.appendChild(st);if(row)f.appendChild(row);if(ls&&ls!==st)f.appendChild(ls);b.appendChild(f);
    if(sh){const x=sec('📤','ارسال پشتیبان (ایمیل / تلگرام / Drive)','Send a backup (email / Telegram / Drive)');[...sh.children].forEach(n=>{if(n.tagName!=='H3')x.appendChild(n)});b.appendChild(x)}
    if(ab){const x=sec('🗄','نسخه‌های خودکار داخل برنامه','Automatic snapshots inside the app');[...ab.children].forEach(n=>{if(n.tagName!=='H3')x.appendChild(n)});b.appendChild(x)}
    if(dn){const x=sec('⚠️','حذف داده‌ها','Delete data');x.appendChild(dn);b.appendChild(x)}
    [dc.parentElement&&dc.parentElement.classList.contains('g2')?dc.parentElement:dc,sh,cr,ab].forEach(e=>{if(e)e.remove()});
    const w=document.getElementById('crs-set');if(w&&!w.querySelector('.c'))w.remove();b.dataset.mg='1'}
  const first=pg.querySelector('details.bgrp');if(first&&b.nextElementSibling!==first&&b.previousElementSibling!==pg.querySelector('#sqbox'))pg.insertBefore(b,first);
  pg.querySelectorAll('details[data-gk="dt-bk"]').forEach(g=>{const n=g.children.length-1;const c=g.querySelector('summary .m');if(c)c.textContent='· '+fa(n);if(n<1)g.remove()})}
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{if(page==='set'&&typeof stt!=='undefined'&&stt==='data')merge()}catch(e){console.error('backupc merge',e)}return r}}
const css=document.createElement('style');css.textContent='.bkx{margin-top:10px;border:1px solid var(--b,#8883);border-radius:12px;padding:8px 12px}.bkx>summary{cursor:pointer;font-weight:700}.bkx[open]>summary{margin-bottom:8px}';document.head.appendChild(css);
})();
