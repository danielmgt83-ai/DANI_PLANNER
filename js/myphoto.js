/* v178 — «عکس شخصی هر جا» (My photo anywhere): بنر خانه، پس‌زمینه‌ی صفحه‌ها، سربرگ منو — برای هر تم جدا، قابل انتخاب هنگام انتخاب تم (پیش‌نمایش) و در «سفارشی».
   تنظیم هر تم: db.set.skx[تم].ph={ban:'own|my|none',bg:'own|my|none',mn:'my|none',dbg,dmn}. عکس بنر همان `skin_<تم>` (CUST) قبلی است؛ پس‌زمینه/منو در IDB با کلید phbg_/phmn_.
   «عکس تم» همیشه برمی‌گردد؛ «هیچ» = مثل قبل از افزودن. قاب جمله عمداً نیست (هر تم کد خودش را دارد). */
(function(){'use strict';
const T=window.daniT||function(a){return a};
const PHI={bg:{},mn:{}},KEY={bg:'phbg_',mn:'phmn_'};
const X=k=>{const S=db.set;if(!S.skx||typeof S.skx!=='object'||Array.isArray(S.skx))S.skx={};return S.skx};
const PHc=k=>{const x=X()[k]=X()[k]||{};if(!x.ph||typeof x.ph!=='object')x.ph={};return x.ph};
const hasImg=(pl,k)=>pl==='ban'?!!(typeof CUST!=='undefined'&&CUST[k]):!!PHI[pl][k];
const imgOf=(pl,k)=>pl==='ban'?CUST[k]:PHI[pl][k];
function defs(k){const S=SKINS[k]||{},own=!!(S.hero&&S.imgs&&S.imgs.length);
 return[{id:'ban',ic:'🖼',fa:'بنر خانه',en:'Home banner',opts:(own?[['own','عکس تم','Theme photo']]:[]).concat([['my','عکس من','My photo'],['none','هیچ','None']]),def:own?'own':'none'},
  {id:'bg',ic:'🌄',fa:'پس‌زمینه‌ی صفحه‌ها',en:'Page background',opts:((S.hero&&S.hero.bgimg)?[['own','عکس تم','Theme photo']]:[]).concat([['my','عکس من','My photo'],['none','هیچ','None']]),def:(S.hero&&S.hero.bgimg)?'own':'none'},
  {id:'mn',ic:'☰',fa:'سربرگ منو',en:'Menu header',opts:[['none','هیچ','None'],['my','عکس من','My photo']],def:'none'}]}
const DK={ban:'dban',bg:'dbg',mn:'dmn'},DD={ban:.3,bg:.6,mn:.55};
const E_=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function rows(k,ph,ctx){ph=ph||{};return defs(k).map(d=>{const cur=ph[d.id]||d.def,has=hasImg(d.id,k);
  return'<div class="phr"><b>'+d.ic+' '+T(d.fa,d.en)+'</b><div class="row" style="flex-wrap:wrap;align-items:center">'
   +d.opts.map(o=>'<button class="chip sm'+(cur===o[0]?' on':'')+'" data-a="ph_set" data-pl="'+d.id+'" data-v="'+o[0]+'" data-k="'+E_(k)+'" data-ctx="'+ctx+'"'+(o[0]==='my'&&!has?' disabled title="'+T('اول عکس را اضافه کن','Add a photo first')+'"':'')+'>'+T(o[1],o[2])+'</button>').join('')
   +'<label class="chip sm" style="cursor:pointer">'+(has?'🔄 '+T('تعویض عکس','Replace'):'＋ '+T('افزودن عکس من','Add my photo'))+'<input type="file" accept="image/*" data-phfile="'+d.id+'" data-k="'+E_(k)+'" data-ctx="'+ctx+'" style="display:none"></label>'
   +(has?'<button class="chip sm" data-a="ph_del" data-pl="'+d.id+'" data-k="'+E_(k)+'" data-ctx="'+ctx+'">🗑</button>':'')+'</div>'
   +(has&&cur==='my'&&ctx==='cur'&&(d.id!=='ban'||!(SKINS[k]||{}).hero)?'<label class="m">'+T('تیرگی روی عکس','Dim over photo')+'</label><input type="range" min="0.1" max="0.95" step="0.05" value="'+(ph[DK[d.id]]!=null?ph[DK[d.id]]:DD[d.id])+'" data-phdim="'+d.id+'">':'')+'</div>'}).join('')}
function card(){const k=skId(),d=document.createElement('div');d.id='phcard';d.className='c';
 const S=SKINS[k]||{},imgs=(S.hero&&S.imgs&&S.imgs.length)?'<div class="m" style="margin-top:4px">'+T('عکس‌های خودِ تم','Theme’s own photos')+'</div><div class="thumbs">'+S.imgs.map(i=>'<button class="th '+(skImgSel(k)===i.id?'on':'')+'" data-skimg="'+i.id+'" title="'+E_(i.name)+'" style="background-image:url('+i.src+')"></button>').join('')+'</div>':'';
 d.innerHTML='<h3>🖼 '+T('عکس‌های من','My photos')+'</h3><p class="m">'+T('برای تم فعلی؛ عکس تم همیشه برمی‌گردد.','For the current theme; the theme’s own photo always comes back.')+'</p>'+rows(k,PHc(k),'cur')+imgs
  +(S.hero?'<label class="m">'+T('تیرگی روی عکس بنر','Banner dim')+'</label><input type="range" min="0.1" max="0.9" step="0.05" value="'+(typeof db.set.skinDim==='number'?db.set.skinDim:(S.hero.dim||.45))+'" data-skdim aria-label="dim">':'')
  +'<p class="m">'+T('عکس‌ها فقط روی همین دستگاه می‌مانند و در فایل پشتیبان نیستند.','Photos stay on this device only and are not in the backup file.')+'</p>';return d}
function apply(){const k=skId(),S=SKINS[k]||{},ph=PHc(k),h=document.documentElement,st=h.style,df=defs(k);
 const v=id=>ph[id]||df.find(d=>d.id===id).def;
 const ban=v('ban');if(ban==='none'){h.dataset.hero='0'}else if(ban==='my'&&CUST[k]&&!S.hero){h.dataset.hero='1';h.dataset.fit='cover';st.setProperty('--hero','url("'+CUST[k]+'")');st.setProperty('--hh','150px');st.setProperty('--hpos','50%');st.setProperty('--hbg','#222');st.setProperty('--dim',String(ph.dban!=null?ph.dban:.3))}
 if(v('bg')==='my'&&PHI.bg[k]){h.dataset.phbg='1';h.dataset.bgimg='0';st.setProperty('--phbg','url("'+PHI.bg[k]+'")');st.setProperty('--phbgp',Math.round((ph.dbg||.6)*100)+'%')}
 else{delete h.dataset.phbg;if(v('bg')==='none')h.dataset.bgimg='0'}
 if(v('mn')==='my'&&PHI.mn[k]){h.dataset.phmn='1';st.setProperty('--phmn','url("'+PHI.mn[k]+'")');st.setProperty('--phmnp',Math.round((ph.dmn||.55)*100)+'%')}else delete h.dataset.phmn}
{const _a=applySkin;applySkin=function(){const r=_a.apply(this,arguments);try{apply()}catch(e){console.error('myphoto',e)}return r}}
/* اتصال به تم (هنگام اعمال از پیش‌نمایش): ban 'my' ⇒ تصویر خودی؛ 'own' ⇒ برگرد به تصویر تم */
function commit(k,ph){const S=SKINS[k]||{};X()[k]=Object.assign({},X()[k],{ph:Object.assign({},ph)});
 if(ph.ban==='my'&&CUST[k])skSet(k,'custom');else if(ph.ban!=='my'&&skImgSel(k)==='custom')skSet(k,(S.imgs&&S.imgs[0])?S.imgs[0].id:'')}
async function compress(f,max){if(!/^image\//.test(f.type)){toast(T('فقط فایل تصویر','Images only'),1);return null}if(f.size>12e6){toast(T('بزرگ‌تر از ۱۲ مگابایت','Larger than 12 MB'),1);return null}
 const url=URL.createObjectURL(f);try{const im=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error('bad'));i.src=url});
  const sc=Math.min(1,max/Math.max(im.width,im.height)),cv=document.createElement('canvas');cv.width=Math.round(im.width*sc);cv.height=Math.round(im.height*sc);cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);
  let q=.82,d=cv.toDataURL('image/jpeg',q);while(d.length>1.6e6&&q>.4){q-=.12;d=cv.toDataURL('image/jpeg',q)}return d}catch(e){toast(T('خواندن تصویر ممکن نشد','Could not read the image'),1);return null}finally{URL.revokeObjectURL(url)}}
const L3=()=>window.daniLook3||{};
function after(ctx){if(ctx==='pv'){try{L3().pvRefresh()}catch(e){}}else{if(save()){applySkin();render()}}}
function setPh(k,ctx,pl,v){if(ctx==='pv'){const pv=L3().pv();if(pv&&pv.id===k){pv.ph=pv.ph||{};pv.ph[pl]=v}}else{PHc(k)[pl]=v;if(pl==='ban'){const S=SKINS[k]||{};if(v==='my'&&CUST[k])skSet(k,'custom');else if(skImgSel(k)==='custom')skSet(k,(S.imgs&&S.imgs[0])?S.imgs[0].id:'')}}}
H.ph_set=e=>{const d=e.dataset;setPh(d.k,d.ctx,d.pl,d.v);after(d.ctx)};
H.ph_del=async e=>{const d=e.dataset,k=d.k;try{if(d.pl==='ban'){await IMG.del('skin_'+k);delete CUST[k];if(skImgSel(k)==='custom')skSet(k,'')}else{await IMG.del(KEY[d.pl]+k);delete PHI[d.pl][k]}}catch(x){}
 setPh(k,d.ctx,d.pl,defs(k).find(q=>q.id===d.pl).def);after(d.ctx)};
document.addEventListener('change',async ev=>{const t=ev.target;if(!t||!t.matches)return;
 if(t.matches('[data-phfile]')){const pl=t.dataset.phfile,k=t.dataset.k,ctx=t.dataset.ctx,f=t.files&&t.files[0];t.value='';if(!f)return;const d=await compress(f,pl==='mn'?900:1280);if(!d)return;
  try{if(pl==='ban'){await IMG.set('skin_'+k,d);CUST[k]=d}else{await IMG.set(KEY[pl]+k,d);PHI[pl][k]=d}}catch(e){return toast(T('ذخیره نشد (فضای مرورگر)','Could not save (browser storage)'),1)}
  setPh(k,ctx,pl,'my');after(ctx)}
 else if(t.matches('[data-phdim]')){save()}});
document.addEventListener('input',ev=>{const t=ev.target;if(!t||!t.matches||!t.matches('[data-phdim]'))return;const k=skId(),pl=t.dataset.phdim;PHc(k)[DK[pl]]=+t.value;try{applySkin()}catch(e){}});
(async()=>{try{for(const pl of ['bg','mn'])for(const key of await IMG.keys())if(typeof key==='string'&&key.startsWith(KEY[pl])){const v=await IMG.get(key);if(typeof v==='string'&&/^data:image\//.test(v))PHI[pl][key.slice(KEY[pl].length)]=v}}catch(e){}try{applySkin()}catch(e){}})();
window.daniPhoto={rows,card,commit,apply,defs};
})();
