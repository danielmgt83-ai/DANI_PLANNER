"use strict";
/* DANI · themefull.js (v164.1) — «خروجی کامل تم»: بستهٔ dani-themepack از تم فعلی با رنگ/چیدمان + آیکون‌ها + تصویرها + جمله‌ها + CSS + کد (js).
   - CSS: همهٔ قاعده‌های `data-skin=ID` از استایل‌های برنامه خوانده می‌شود (و @media/@keyframes وابسته)؛ id در آن‌ها به id تازه عوض می‌شود.
   - کد: برای تمی که خودش بسته‌ی واردشده است، js اصلی از حافظه می‌آید؛ تم‌های داخلی کدشان داخل فایل‌های js برنامه است و در بسته نیست (در پیام گزارش می‌شود).
   - خروجی با «بسته‌های تم ← وارد کردن» دوباره وارد می‌شود. */
(function(){'use strict';
const T=window.daniT||function(a){return a};
const esc=s=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function cssOf(id){const pat=new RegExp('data-skin\\s*=\\s*["\']?'+esc(id)+'(?![\\w-])'),kfs=[];let out='';
 const walk=list=>{let s='';for(const r of list){try{
   if(r.type===1){if(pat.test(r.selectorText))s+=r.cssText+'\n'}
   else if(r.type===4||r.type===12){const i=walk(r.cssRules);if(i)s+='@'+(r.type===4?'media ':'supports ')+(r.conditionText||(r.media&&r.media.mediaText)||'')+'{\n'+i+'}\n'}
   else if(r.type===7)kfs.push(r)}catch(e){}}return s};
 for(const sh of document.styleSheets){let rules;try{rules=sh.cssRules}catch(e){continue}if(!rules)continue;if(sh.ownerNode&&sh.ownerNode.id&&/^(nvm-|lk3|hfab|fx)/.test(sh.ownerNode.id))continue;out+=walk(rules)}
 kfs.forEach(k=>{if(out.indexOf(k.name)>=0)out+=k.cssText+'\n'});return out}
async function toData(src){if(/^data:/.test(src))return src;return await new Promise((res,rej)=>{const im=new Image();im.onload=()=>{try{const c=document.createElement('canvas');c.width=im.width;c.height=im.height;c.getContext('2d').drawImage(im,0,0);res(c.toDataURL('image/jpeg',.88))}catch(e){rej(e)}};im.onerror=rej;im.src=src})}
async function stored(id){try{let v=await IMG.get('pack_'+id);if(!v)v=localStorage.getItem('dani_pack_'+id);return v?JSON.parse(v):null}catch(e){return null}}
async function build(){const k=skId(),S=SKINS[k];if(!S)throw new Error('no theme');
 const rec=S.pack?await stored(k):null,nid=S.pack?k:('my-'+k).replace(/[^a-z0-9_-]/g,'').slice(0,24),sum={css:0,js:false,icons:0,assets:0,quotes:0,skipped:[]};
 const o={format:'dani-themepack',version:1,id:nid,name:String(S.name||k).slice(0,30),desc:String(S.desc||'').slice(0,60),tag:String(S.tag||'').slice(0,60)};
 if(!S.pack)o.name=('My '+o.name).slice(0,30);
 if(S.home)o.home=true;if(S.qchar)o.qchar=S.qchar;
 /* رنگ و چیدمان */
 if(rec&&rec.skin)o.skin=rec.skin;else{const s={};['lay','dark','card','btn','font','ic','rad','wm'].forEach(f=>{if(S[f]!==undefined)s[f]=S[f]});if(S.vars)s.vars=S.vars;if(S.bgGradient)s.bgGradient=S.bgGradient;o.skin=s}
 /* جمله‌ها */
 try{const q=S.qchar||k;const P=(typeof hqPool==='function'?hqPool(q.replace(/2$/,'')):[])||[];const a=P.slice(0,200).map(x=>({fa:String(x.fa||'').slice(0,300),en:String(x.en||'').slice(0,300),a:String(x.a||'').slice(0,60)})).filter(x=>x.fa||x.en);if(rec&&rec.quotes)o.quotes=rec.quotes;else if(a.length){o.quotes=a;if(!o.qchar)o.qchar=nid}sum.quotes=(o.quotes||[]).length}catch(e){}
 /* آیکون‌ها */
 const ic=(rec&&rec.icons)||(typeof PK_IC!=='undefined'&&PK_IC[k])||(typeof ITU_IC!=='undefined'&&ITU_IC[k])||{};o.icons={};
 Object.entries(ic).forEach(([n,v])=>{if(/^[a-z]{2,8}$/.test(n)&&typeof v==='string'&&v.length<=3000&&!/<\s*script|on\w+\s*=|javascript:/i.test(v)){o.icons[n]=v;sum.icons++}else sum.skipped.push('icon:'+n)});
 /* تصویرها */
 o.assets=Object.assign({},(rec&&rec.assets)||{});
 if(!rec)for(const i of(S.imgs||[])){const key=String(i.id||'').toLowerCase().replace(/[^a-z0-9_]/g,'').slice(0,16);if(!key)continue;try{o.assets[key]=await toData(i.src)}catch(e){if(/^img\/[\w.-]+\.(jpe?g|png|webp)$/i.test(i.src))o.assets[key]=i.src;else sum.skipped.push('img:'+key)}}
 sum.assets=Object.keys(o.assets).length;
 /* CSS و کد */
 let css=(rec&&rec.css)||cssOf(k);if(css&&nid!==k)css=css.replace(new RegExp('data-skin(\\s*=\\s*)(["\']?)'+esc(k)+'(["\']?)(?![\\w-])','g'),'data-skin$1$2'+nid+'$3');
 if(css){if(css.length>3e5){css=css.slice(0,3e5);sum.skipped.push('css:cut')}o.css=css;sum.css=css.length}
 if(rec&&rec.js){o.js=rec.js;sum.js=true}
 if(!Object.keys(o.icons).length)delete o.icons;if(!Object.keys(o.assets).length)delete o.assets;
 return{o,sum}}
H.pk_full=async()=>{try{const{o,sum}=await build();const e=(typeof pkVet==='function')?pkVet(o):null;
  if(e){toast(T('خروجی کامل ساخته نشد: ','Full export failed: ')+e,1);return}
  dl(o.id+'.dani-themepack.json','application/json',JSON.stringify(o));
  toast(T('خروجی کامل ذخیره شد — CSS: ','Full export saved — CSS: ')+Math.round(sum.css/1024)+'KB · '+T('کد: ','code: ')+(sum.js?T('هست','yes'):T('نیست (داخل برنامه است)','no (built into the app)'))+' · '+T('آیکون: ','icons: ')+sum.icons+' · '+T('تصویر: ','images: ')+sum.assets)}
 catch(err){console.error(err);toast(T('خروجی کامل ساخته نشد','Full export failed'),1)}};
window.daniThemeFull={build};
})();
