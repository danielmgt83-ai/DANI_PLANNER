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
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{const c=document.getElementById('bkc'),pg=c&&c.parentElement;if(pg&&pg.firstElementChild!==c)pg.insertBefore(c,pg.firstElementChild)}catch(e){}return r}}
})();
