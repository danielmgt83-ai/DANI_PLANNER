"use strict";
/* DANI · extensions.js
   افزونه‌ها و بسته‌های قابل‌اتصال (فایل، لینک یا متن)
   فایل‌های js/ به ترتیب در index.html بارگذاری می‌شوند و متغیرها و تابع‌ها را مشترک دارند (مثل یک فایل واحد). */
/* ===== DANI v1: attachable extensions and packs. Anything new can be built as a small file and attached here (file, link or paste). ===== */
const EXT_PAGES=new Set(),EXT_ON={render:[]},EXT_ERR={},EXT_K='dani_ext_';
function extIndex(){try{return JSON.parse(localStorage.getItem('dani_ext_index')||'[]').filter(x=>x&&typeof x.id==='string')}catch(e){return[]}}
function extSaveIndex(l){localStorage.setItem('dani_ext_index',JSON.stringify(l))}
const extId=s=>String(s||'').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,32);
function extHeader(code){const m=String(code).slice(0,600).match(/@dani\s+([^\n*]*)/);const o={};if(m)m[1].replace(/(\w+)=("[^"]*"|\S+)/g,(_,k,v)=>{o[k]=v.replace(/^"|"$/g,'')});return o}
function extStore(id){db.mods=db.mods||{};db.mods.ext=db.mods.ext&&typeof db.mods.ext==='object'&&!Array.isArray(db.mods.ext)?db.mods.ext:{};return db.mods.ext[id]=db.mods.ext[id]&&typeof db.mods.ext[id]==='object'?db.mods.ext[id]:{}}
function daniApi(id){const pre='x_'+id+'_',guard=(n,f)=>(...a)=>{try{return f(...a)}catch(e){EXT_ERR[id]=n+': '+e.message;window.daniErrRec&&window.daniErrRec('افزونه '+id+' / '+n+': '+e.message,'',e.stack)}};
 const api={version:'1.0',id,toast:(m,e)=>toast(String(m),e?1:0),render:()=>render(),esc,fa,mm,fmtD,today:todayISO,addDays:addD,
  data:{entries:(a,b)=>ER(a||todayISO(),b||a||todayISO()).map(e=>Object.assign({},e)),plan:d=>plan(d||todayISO()).map(x=>Object.assign({},x)),activities:()=>db.acts.map(a=>({id:a.id,name:a.name,cat:a.cat})),minutes:(a,b)=>rangeDays(a||todayISO(),b||a||todayISO()).reduce((s,d)=>s+sumU(E(d)),0),actName:aN},
  store:{get:(k,d)=>{const s=extStore(id);return k in s?s[k]:d},set:(k,v)=>{const s=extStore(id);s[String(k)]=v;save()},all:()=>JSON.parse(JSON.stringify(extStore(id)))},
  css(t){let el=document.getElementById('xcss_'+id);if(!el){el=document.createElement('style');el.id='xcss_'+id;document.head.appendChild(el)}el.textContent=String(t).slice(0,60000)},
  action(name,fn){H[pre+name]=guard('action '+name,e=>{fn(Object.assign({},e.dataset),e);})},
  btn(name,label,data,cls){return'<button class="'+esc(cls||'')+'" data-a="'+pre+esc(name)+'"'+Object.entries(data||{}).map(([k,v])=>' data-'+esc(k)+'="'+esc(v)+'"').join('')+'>'+esc(label)+'</button>'},
  homeSection(o){const sid=pre+String(o.id||'main');HSEC[sid]={n:String(o.title||id),r:guard('home '+sid,()=>'<div class="c"><h3>'+(o.en?BH(String(o.en),String(o.title||'')):esc(o.title||''))+'</h3>'+String(o.render())+'</div>')};
   const seen=Array.isArray(db.set.hsx)?db.set.hsx:[];if(!seen.includes(sid)){const l=hsList().map(x=>Object.assign({},x));l.push({id:sid,on:true});db.set.hs=l;db.set.hsx=seen.concat(sid);save()}},
  page(o){const pid=pre+String(o.id||'page');EXT_PAGES.add(pid);if(!MODULES.some(m=>m.id===pid))MODULES.push({id:pid,name:String(o.title||id),ver:1,status:'active',desc:'افزونه: '+id});PG[pid]=guard('page '+pid,()=>'<div class="c"><h3>'+(o.en?BH(String(o.en),String(o.title||'')):esc(o.title||''))+'</h3>'+String(o.render())+'</div>');syncNav()},
  on(ev,fn){if(ev==='render')EXT_ON.render.push(guard('on render',fn))},
  addCards(deck,cards){const A=zAX();let n=0;(Array.isArray(cards)?cards:[]).slice(0,500).forEach(c=>{const q=S_(c&&c.q,300).trim(),a=S_(c&&c.a,600).trim();if(!q||!a||A.cards.length>=2000)return;if(A.cards.some(x=>x.q===q&&x.deck===deck))return;A.cards.push({id:'c'+uid(),deck:S_(deck,40),q,a,ease:2.5,ivl:0,reps:0,lap:0,due:todayISO(),created:todayISO(),ag:''});n++});save();return n}};
 return api}
function extRun(rec){try{const api=daniApi(rec.id);new Function('DANI',rec.code)(api);delete EXT_ERR[rec.id];return true}catch(e){EXT_ERR[rec.id]=e.message;window.daniErrRec&&window.daniErrRec('افزونه '+rec.id+': '+e.message,'',e.stack);return false}}
function extLoadAll(){extIndex().forEach(x=>{if(x.on===false)return;let code='';try{code=localStorage.getItem(EXT_K+x.id)||''}catch(e){}if(code)extRun({id:x.id,code})})}
function extInstall(code,hint){code=String(code||'');if(code.length<10||code.length>400000)throw new Error('فایل افزونه خالی یا خیلی بزرگ است');const h=extHeader(code),id=extId(h.id||hint);if(!id)throw new Error('شناسه‌ی افزونه پیدا نشد؛ در ابتدای فایل خط «/* @dani id=نام name="..." version=1.0 */» لازم است');
 const idx=extIndex().filter(x=>x.id!==id);idx.push({id,name:S_(h.name||id,40),version:S_(h.version||'1.0',12),on:true,at:todayISO()});if(idx.length>40)throw new Error('حداکثر ۴۰ افزونه');localStorage.setItem(EXT_K+id,code);extSaveIndex(idx);return{id,name:h.name||id}}
async function themeAdd(o){const r=vetTheme(o,true);if(!r.ok)throw new Error(r.err);const id=r.def.id;if(SK_BUILTIN.has(id))throw new Error('شناسه‌ی تم با تم‌های داخلی یکی است');await IMG.set('theme_'+id,JSON.stringify(o));SKINS[id]=r.def;if(Array.isArray(db.set.dthemes))db.set.dthemes=db.set.dthemes.filter(x=>x!==id);return r.def.name}
async function daniImport(text,hint){text=String(text||'').replace(/^\uFEFF/,'');let obj=null;try{obj=JSON.parse(text)}catch(e){}const out=[];
 if(obj&&obj.format==='hamrah-theme'){out.push('تم «'+await themeAdd(obj)+'»')}
 else if(obj&&obj.format==='dani-pack'&&Array.isArray(obj.items)){if(obj.items.length>60)throw new Error('بسته بیش از حد بزرگ است');for(const it of obj.items){if(!it||typeof it!=='object')continue;
   if(it.type==='theme'&&it.theme)out.push('تم «'+await themeAdd(it.theme)+'»');
   else if(it.type==='cards'){const n=daniApi('pack').addCards(S_(it.deck||obj.name||'بسته',40),it.cards);out.push(fa(n)+' فلش‌کارت در «'+S_(it.deck||obj.name,40)+'»')}
   else if(it.type==='ext'&&it.code){const r=extInstall(it.code,it.id);extLoadOne(r.id);out.push('افزونه «'+r.name+'»')}}}
 else if(obj)throw new Error('قالب فایل شناخته نشد (format باید hamrah-theme یا dani-pack باشد)');
 else{const r=extInstall(text,hint);extLoadOne(r.id);out.push('افزونه «'+r.name+'»')}
 save();return out}
function extLoadOne(id){const code=localStorage.getItem(EXT_K+id);if(code)extRun({id,code})}
function extCard(){const l=extIndex();return'<div class="c" id="extcard"><h3>'+BH('Extensions & Packs','افزونه‌ها و بسته‌ها')+'</h3><p class="m">هر قابلیت یا محتوای تازه را می‌شود به‌صورت یک فایل کوچک ساخت و اینجا چسباند: افزونه (‎.dani.js)، بسته (‎.dani.json: تم، فلش‌کارت)، یا تم. ⚠ افزونه به داده‌های برنامه دسترسی دارد؛ فقط فایلی را اضافه کن که از منبع مطمئن گرفته‌ای.</p>'
 +'<div class="row"><label class="chip"><input type="file" id="ext-file" accept=".js,.json,.txt,.dani" hidden data-st-none="1">📂 افزودن از فایل</label></div>'
 +'<div class="row" style="margin-top:8px"><input id="ext-url" dir="ltr" class="grow" placeholder="https://…/something.dani.js"><button data-a="extget">افزودن از لینک</button></div>'
 +'<details class="ckd"><summary>چسباندن متن</summary><textarea id="ext-txt" rows="5" dir="ltr" style="width:100%"></textarea><button data-a="extpaste">افزودن</button></details>'
 +(l.length?'<div class="m" style="margin-top:10px">افزونه‌های نصب‌شده:</div>'+l.map(x=>'<div class="cwr '+(x.on===false?'off':'')+'"><span>'+esc(x.name)+' <small class="m">v'+esc(x.version)+'</small>'+(EXT_ERR[x.id]?'<div class="m hst warn">'+esc(EXT_ERR[x.id])+'</div>':'')+'</span><button data-a="extt" data-id="'+esc(x.id)+'" aria-label="روشن یا خاموش">'+(x.on===false?'🚫':'👁')+'</button><button data-a="exte" data-id="'+esc(x.id)+'" aria-label="خروجی">⬇</button><button class="d" data-a="extd" data-id="'+esc(x.id)+'">✕</button></div>').join(''):'<p class="m">هنوز افزونه‌ای نصب نشده.</p>')+'</div>'}
async function extDo(fn){try{const r=await fn();toast('اضافه شد: '+r.join('، '));render()}catch(e){toast('اضافه نشد: '+e.message,1)}}
H.extget=()=>{const u=($('#ext-url').value||'').trim();if(!/^https?:\/\//i.test(u))return toast('آدرس باید با https:// شروع شود',1);extDo(async()=>{let t;try{const r=await fetch(u,{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);t=await r.text()}catch(e){throw new Error('خواندن لینک ممکن نشد ('+e.message+'). اگر سرور اجازه‌ی خواندن از مرورگر را نمی‌دهد، فایل را دانلود کن و از «فایل» اضافه کن.')}return daniImport(t,u.split('/').pop().split('.')[0])})};
H.extpaste=()=>{const t=$('#ext-txt').value;extDo(()=>daniImport(t,'pasted'))};
H.extt=e=>{const l=extIndex(),x=l.find(i=>i.id===e.dataset.id);if(!x)return;x.on=x.on===false;extSaveIndex(l);toast(x.on?'روشن شد؛ برای اعمال کامل، صفحه را دوباره باز کن':'خاموش شد؛ برای اعمال کامل، صفحه را دوباره باز کن');if(x.on)extLoadOne(x.id);render()};
H.extd=e=>{const id=e.dataset.id;if(!confirm('این افزونه حذف شود؟ (داده‌ی ذخیره‌شده‌ی خودش در پشتیبان می‌ماند)'))return;extSaveIndex(extIndex().filter(x=>x.id!==id));try{localStorage.removeItem(EXT_K+id)}catch(x){}toast('حذف شد؛ برای پاک‌شدن کامل، صفحه را دوباره باز کن');render()};
H.exte=e=>{const id=e.dataset.id,code=localStorage.getItem(EXT_K+id)||'';const u=URL.createObjectURL(new Blob([code],{type:'text/javascript'})),a=document.createElement('a');a.href=u;a.download=id+'.dani.js';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000)};
document.addEventListener('change',e=>{const t=e.target;if(t&&t.id==='ext-file'&&t.files&&t.files[0]){const f=t.files[0];if(f.size>2000000){toast('فایل بیش از ۲ مگابایت است',1);return}const rd=new FileReader();rd.onload=()=>extDo(()=>daniImport(String(rd.result),f.name.split('.')[0]));rd.onerror=()=>toast('خواندن فایل ناموفق بود',1);rd.readAsText(f)}});

