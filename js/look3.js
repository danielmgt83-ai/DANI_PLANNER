/* v160 — «ظاهر و تم» بازطراحی‌شده: ۳ زبانه (فروشگاه | سفارشی | بسته‌های تم).
   فروشگاه = تم‌ها (همان شبکه‌ی پوشه‌دار «پوسته») + نمادها (مجموعه‌ی آیکونِ واقعیِ تم‌ها + استودیوی آیکون). زدن روی هر تم پیش‌نمایش باز می‌کند: حالت، رنگ، شکل منو، گوشه‌ها و نمادها؛ پیش‌فرضِ هر چیز مال خودِ تم است.
   تنظیمات هر تم جدا نگه‌داری می‌شود (db.set.skx[themeId]) و با عوض‌کردن تم، پیش‌فرض همان تم برمی‌گردد. «سفارشی» = تصویر و تیرگی تم + اندازه متن. «بسته‌های تم» = بارگذاری + سابقه (تغییر نام و متن سربرگ). */
(function(){'use strict';
const T=window.daniT||function(a){return a};
const P=[['st','🛍','فروشگاه','Store'],['cu','🎛','سفارشی','Customize'],['lab','📦','بسته‌های تم','Theme packs']];
const ST={p:'st',sec:'themes',q:''};
const $=(s,r)=>(r||document).querySelector(s);
const txt=e=>(e&&e.textContent)||'';
const E=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MENUS=[['','پیش‌فرض تم','Theme default','a'],['bottom','نوار پایین','Bottom bar','b'],['float','شناور پایین','Floating','f'],['top','نوار بالا','Top bar','t'],['side','کناری','Side','s'],['rail','فقط آیکون','Icons only','r']];
const mini=k=>{const m={a:'',b:'bottom:0;left:0;right:0;height:11px',f:'bottom:5px;left:8%;right:8%;height:11px;border-radius:8px',t:'top:0;left:0;right:0;height:11px',s:'top:0;bottom:0;right:0;width:14px',r:'bottom:5px;left:30%;right:30%;height:9px;border-radius:6px'}[k];return'<span class="lkmini"><s style="'+m+'"></s>'+(k==='a'?'<em>⟲</em>':'')+'</span>'};
const RADS=[['','پیش‌فرض تم','Theme default'],['sharp','تیز','Sharp',4,3],['soft','نرم','Soft',14,10],['round','گرد','Round',22,99]];
const ACS=['#ef4444','#f59e0b','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899'];
const DK={bg:'#0f172a',c:'#1e293b',t:'#e5e7eb',m:'#94a3b8',b:'#334155',sb:'#0b1220'},LT={bg:'#f4f6fb',c:'#ffffff',t:'#111827',m:'#6b7280',b:'#e5e7eb',sb:'#ffffff'};
const canMode=s=>!!s&&!s.hero&&!s.pack&&!s.qchar;
const ownMenu=s=>{const m=MENUS.find(x=>x[0]===s.lay);return m?T(m[1],m[2]):T('کناری','Side')};
/* ---- تنظیمات هر تم جدا (skx) و همگام‌سازی با «سراسری‌های» فعلی (lay2 / icst / icx) ---- */
const SKX=()=>{const S=db.set;if(!S.skx||typeof S.skx!=='object'||Array.isArray(S.skx))S.skx={};return S.skx};
const snap=()=>({lay:db.set.lay2||'',ic:{st:db.set.icst||'',x:Object.assign({},db.set.icx||{})}});
function sync(){try{const S=db.set,id=skId(),X=SKX();
 if(S._sk===undefined){if(S.lay2||S.icst||(S.icx&&Object.keys(S.icx).some(k=>S.icx[k])))X[id]=Object.assign({},X[id],snap());S._sk=id;return false}
 if(S._sk!==id){if(S._sk&&SKINS[S._sk])X[S._sk]=Object.assign({},X[S._sk],snap());S._sk=id;const o=X[id]||{};S.lay2=o.lay||'';S.icst=(o.ic&&o.ic.st)||'';S.icx=Object.assign({},(o.ic&&o.ic.x)||{});return true}}catch(e){console.error('look3 sync',e)}return false}
const reIcons=()=>{try{document.querySelectorAll('#nav a[data-p] .ic,#pg [data-a="tab"][data-k] .ic').forEach(el=>el.remove());window.daniIconStyle&&daniIconStyle.apply()}catch(x){}};
{const _as=applySkin;applySkin=function(){
  try{Object.entries(db.set.skn||{}).forEach(([id,o])=>{const s=SKINS[id];if(s&&o){if(o.name)s.name=o.name;if(o.tag!=null)s.tag=o.tag}})}catch(e){}
  const ch=sync();const r=_as.apply(this,arguments);
  try{const S=SKINS[skId()],h=document.documentElement,st=h.style,o=SKX()[skId()]||{},L=db.set.lay2;
   if(L&&['bottom','float','top','side','rail'].includes(L)){h.dataset.lay=L==='float'?'bottom':L;h.dataset.navf=L==='float'?'1':'0'}else h.dataset.navf='0';
   const rd=RADS.find(x=>x[0]&&x[0]===o.rad);if(rd){st.setProperty('--rad',rd[3]+'px');st.setProperty('--radb',rd[4]+'px')}
   if(o.m&&canMode(S)&&((o.m==='dark')!==!!S.dark)){const p=o.m==='dark'?DK:LT;Object.entries(p).forEach(([k,v])=>st.setProperty('--'+k,v));h.dataset.dk=o.m==='dark'?'1':'0';st.colorScheme=o.m==='dark'?'dark':'';h.dataset.th=o.m}
   if(o.ac)st.setProperty('--ac',o.ac);
   if(ch){reIcons();try{decorateIcons()}catch(x){}}}catch(e){console.error('look3 apply',e)}
  return r}}
/* ---- فهرست مجموعه‌های آیکونِ واقعیِ تم‌ها ---- */
const BASE=[['std','خطی استاندارد','Standard line',{x:{fam:'std'}}],['solid','توپُر','Solid',{x:{fam:'solid'}}],['emoji','ایموجی','Emoji',{x:{fam:'emoji'}}]];
function icSets(){const ids=[...new Set([...Object.keys(typeof PK_IC!=='undefined'?PK_IC:{}).filter(k=>Object.keys(PK_IC[k]||{}).length>=6),...Object.keys(typeof ITU_IC!=='undefined'?ITU_IC:{})])].filter(k=>SKINS[k]);
 return[['','پیش‌فرض تم','Theme default',{}],...ids.map(k=>['t:'+k,SKINS[k].name,SKINS[k].name,{x:{set:k}}]),...BASE.map(b=>['f:'+b[0],b[1],b[2],b[3]])]}
const icKey=ic=>{const x=(ic&&ic.x)||{};if(x.set)return't:'+x.set;if(!(ic&&ic.st)&&!x.fam&&!x.frame&&!x.col)return'';if(!(ic&&ic.st)&&x.fam&&!x.frame&&!x.col&&!x.soft)return'f:'+x.fam;return'*'};
function ipThumb(p,n){const o={st:db.set.icst,x:db.set.icx},x=Object.assign({},p[3].x||{});let h='';
 try{db.set.icst=p[3].st||'';db.set.icx=x;h=['day','plan2','pj','res','acd','set'].slice(0,n||6).map(k=>'<i class="ipi">'+icon(k)+'</i>').join('')}catch(e){}finally{db.set.icst=o.st;db.set.icx=o.x}
 return'<div class="ipv" style="--icw:1.7;'+((n||6)<6?'grid-template-columns:repeat('+n+',minmax(0,1fr))':'')+'">'+h+'</div>'}
function iconsHTML(){const cur=icKey(snap().ic);return'<div class="strow2">'+icSets().map(p=>'<div class="stc2'+(cur===p[0]?' on':'')+'" role="button" tabindex="0" data-a="lk_ip" data-id="'+E(p[0])+'">'+ipThumb(p)+'<b>'+T(p[1],p[2])+'</b><span>'+(cur===p[0]?'✓ '+T('فعال','Active'):(p[0]&&p[0][0]==='t'?T('مجموعهٔ آیکون تم','Theme icon set'):''))+'</span></div>').join('')+'</div><p class="m">'+T('هر مجموعه فقط شکل آیکون‌ها را عوض می‌کند و روی هر تمی کار می‌کند. زیرش «استودیوی آیکون» برای قاب، رنگ و اندازه است.','A set only changes the icon shapes and works on any theme. Below it, Icon Studio sets frame, colour and size.')+'</p>'}
H.lk_ip=e=>{const p=icSets().find(x=>x[0]===e.dataset.id);if(!p)return;db.set.icst=p[3].st||'';db.set.icx=Object.assign({},p[3].x||{});if(save()){reIcons();render();try{decorateIcons()}catch(x){}toast(T('آیکون‌ها عوض شد','Icons changed'))}};
H.lk_sec=e=>{ST.sec=e.dataset.v;render()};
/* ---- فروشگاه ---- */
function thumb(s,big,o){const v=s.vars||{};o=o||{};let dk=o.m?o.m==='dark':!!s.dark;const pal=o.m&&canMode(s)?(o.m==='dark'?DK:LT):null,bg=(pal||v).bg||(dk?'#0f172a':'#f4f6fb'),c=(pal||v).c||(dk?'#1e293b':'#ffffff'),ac=o.ac||v.ac||'#2563eb';
 const rd=RADS.find(x=>x[0]&&x[0]===o.rad),rr=rd?rd[3]:(s.rad||16),r=rr>=20?'16px':(rr>=12?'12px':'6px');
 return'<div class="stth'+(big?' big':'')+'" style="background:'+bg+'"><i style="background:'+ac+';border-radius:'+r+'"></i><i style="background:'+c+';border-radius:'+r+'"></i><i style="background:'+c+';border-radius:'+r+'"></i><i style="background:'+ac+';opacity:.5;border-radius:'+r+'"></i></div>'}
function storeHTML(){const sec=ST.sec||'themes',tg='<div class="row" style="margin:4px 0 8px;flex-wrap:wrap"><button class="chip '+(sec==='themes'?'on':'')+'" data-a="lk_sec" data-v="themes">🎨 '+T('تم‌ها','Themes')+'</button><button class="chip '+(sec==='icons'?'on':'')+'" data-a="lk_sec" data-v="icons">🔣 '+T('نمادها (آیکون‌ها)','Icons')+'</button></div>';
 if(sec==='icons')return'<div class="c" id="lkstore"><h3>🛍 '+T('فروشگاه','Store')+'</h3>'+tg+iconsHTML()+'<div id="lkicons"></div></div>';
 const pt=db.set.prevTheme;
 return'<div class="c" id="lkstore"><h3>🛍 '+T('فروشگاه','Store')+'</h3>'+tg+'<input id="lkq" type="search" dir="auto" placeholder="'+T('جست‌وجوی تم…','Search themes…')+'" style="width:100%;margin:4px 0 8px" value="'+E(ST.q)+'">'
  +(pt&&pt.skin&&SKINS[pt.skin]?'<div class="row"><button class="chip sm" data-a="lk_undo">↩ '+T('برگشت به تم قبلی','Back to previous')+' ('+E(SKINS[pt.skin].name)+')</button></div>':'')
  +'<div id="lkthemes"></div><p class="m">'+T('روی هر تم بزن تا پیش‌نمایش باز شود؛ حالت، رنگ، منو، گوشه‌ها و نمادها را می‌توانی عوض کنی. پیش‌فرض هر چیز مالِ خودِ تم است.','Tap a theme to preview it; change mode, colour, menu, corners and icons. Every default is the theme’s own.')+'</p></div>'}
/* ---- پیش‌نمایش ---- */
const PV={};
function pvInit(s){const X=SKX(),cur=s.id===skId(),o=cur?Object.assign({},X[s.id],snap(),{m:(X[s.id]||{}).m,ac:(X[s.id]||{}).ac,rad:(X[s.id]||{}).rad}):Object.assign({lay:'',ic:{st:'',x:{}}},X[s.id]);
 PV.id=s.id;PV.m=o.m||'';PV.ac=o.ac||'';PV.rad=o.rad||'';PV.lay=o.lay||'';PV.ic=JSON.parse(JSON.stringify(o.ic||{st:'',x:{}}))}
const chip=(on,a,v,l)=>'<button class="chip sm'+(on?' on':'')+'" data-a="'+a+'" data-v="'+E(v)+'">'+l+'</button>';
function pvBody(){const s=SKINS[PV.id];if(!s)return'';const sets=icSets();
 const modes=canMode(s)?'<div class="row lkr2">'+chip(!PV.m,'lk_pk','m:',T('پیش‌فرض تم','Theme default')+' ('+(s.dark?T('تیره','dark'):T('روشن','light'))+')')+chip(PV.m==='light','lk_pk','m:light','☀ '+T('روشن','Light'))+chip(PV.m==='dark','lk_pk','m:dark','🌙 '+T('تیره','Dark'))+'</div>':'<p class="m">'+T('این تم ظاهر و رنگ‌های ثابتِ خودش را دارد؛ فقط رنگ تأکید را می‌شود عوض کرد.','This theme has its own fixed look; only the accent colour can change.')+'</p>';
 return thumb(s,true,{m:PV.m,ac:PV.ac,rad:PV.rad})
  +'<div class="m" style="margin-top:8px">'+T('حالت','Mode')+'</div>'+modes
  +'<div class="m">'+T('رنگ تأکید','Accent colour')+'</div><div class="row lkr2">'+chip(!PV.ac,'lk_pk','ac:',T('پیش‌فرض تم','Theme default'))+ACS.map(c=>'<button class="lkac'+(PV.ac===c?' on':'')+'" style="background:'+c+'" data-a="lk_pk" data-v="ac:'+c+'" aria-label="'+c+'"></button>').join('')+'</div>'
  +'<div class="m">'+T('شکل منو','Menu style')+'</div><div class="lkmg">'+MENUS.map(m=>'<button class="lkm'+(PV.lay===m[0]?' on':'')+'" data-a="lk_pk" data-v="lay:'+m[0]+'">'+mini(m[3])+'<small>'+(m[0]===''?T('پیش‌فرض تم','Theme default')+': '+ownMenu(s):T(m[1],m[2]))+'</small></button>').join('')+'</div>'
  +'<div class="m">'+T('گوشه‌ها','Corners')+'</div><div class="row lkr2">'+RADS.map(r=>chip(PV.rad===r[0],'lk_pk','rad:'+r[0],T(r[1],r[2]))).join('')+'</div>'
  +'<div class="m">'+T('نمادها','Icons')+'</div><div class="strow lkicr">'+sets.map(p=>'<div class="stc2 lkic'+(icKey(PV.ic)===p[0]?' on':'')+'" role="button" tabindex="0" data-a="lk_pk" data-v="ic:'+E(p[0])+'">'+ipThumb(p,3)+'<b>'+(p[0]===''?T('پیش‌فرض تم','Theme default'):E(T(p[1],p[2])))+'</b></div>').join('')+'</div>'}
H.lk_pv=e=>{const s=SKINS[e.dataset.id];if(!s)return;pvInit(s);
 modal('<div class="c lkpv"><h3>'+E(s.name)+'</h3><p class="m" dir="auto">'+E(s.desc||'')+(s.tag?' · '+E(s.tag):'')+'</p><div id="lkpvb">'+pvBody()+'</div>'+(s.hero||s.pack?'<p class="m">🖼 '+T('تصویرها و ویژگی‌های خاصِ خودِ تم همراهش می‌ماند.','Its own images and features stay with it.')+'</p>':'')
  +'<div class="row" style="margin-top:12px"><button class="p" data-a="lk_ap" data-id="'+E(s.id)+'">✓ '+T('اعمال این تم','Apply this theme')+'</button><button data-a="lk_x">'+T('بستن','Close')+'</button></div></div>')};
H.lk_pk=e=>{const v=String(e.dataset.v||''),i=v.indexOf(':'),k=v.slice(0,i),x=v.slice(i+1);
 if(k==='m')PV.m=x;else if(k==='ac')PV.ac=x;else if(k==='lay')PV.lay=x;else if(k==='rad')PV.rad=x;
 else if(k==='ic'){const p=icSets().find(q=>q[0]===x);if(p)PV.ic={st:p[3].st||'',x:Object.assign({},p[3].x||{})}}
 const b=document.getElementById('lkpvb');if(b){const sc=document.querySelector('.lkicr');const l=sc?sc.scrollLeft:0;b.innerHTML=pvBody();const n=document.querySelector('.lkicr');if(n)n.scrollLeft=l}};
H.lk_x=()=>closeM();
H.lk_ap=e=>{const id=e.dataset.id,s=SKINS[id];if(!s||PV.id!==id)return;const X=SKX(),old=skId();
 db.set.prevTheme={skin:old,x:JSON.parse(JSON.stringify(X[id]||null))};
 if(old!==id&&SKINS[old])X[old]=Object.assign({},X[old],snap());
 X[id]=Object.assign({},X[id],{lay:PV.lay,ic:PV.ic,m:PV.m,ac:PV.ac,rad:PV.rad});
 db.set.skin=id;db.set.lay2=PV.lay;db.set.icst=PV.ic.st||'';db.set.icx=Object.assign({},PV.ic.x||{});db.set._sk=id;
 if(save()){closeM();reIcons();render();try{decorateIcons()}catch(x){}toast(T('تم اعمال شد','Theme applied'))}};
H.lk_undo=()=>{const p=db.set.prevTheme;if(!p||!SKINS[p.skin])return;const X=SKX(),old=skId();
 db.set.prevTheme={skin:old,x:JSON.parse(JSON.stringify(X[old]||null))};
 X[old]=Object.assign({},X[old],snap());db.set.skin=p.skin;const o=X[p.skin]||{};db.set.lay2=o.lay||'';db.set.icst=(o.ic&&o.ic.st)||'';db.set.icx=Object.assign({},(o.ic&&o.ic.x)||{});db.set._sk=p.skin;
 if(save()){reIcons();render();try{decorateIcons()}catch(x){}}};
/* ---- سابقه‌ی تم‌های بارگذاری‌شده: تغییر نام و متن سربرگ ---- */
function histHTML(){const ids=[...new Set([...Object.keys(window.PK_REC||{}),...Object.values(SKINS).filter(s=>s.custom).map(s=>s.id)])].filter(id=>SKINS[id]),cur=skId();
 return'<details class="lkhist"><summary><b>'+T('سابقهٔ تم‌های بارگذاری‌شده','Loaded themes history')+'</b> <span class="m">('+ids.length+')</span></summary>'
  +(ids.length?ids.map(id=>{const s=SKINS[id],pk=!s.custom;return'<details class="lkh1"><summary dir="auto"><span class="lkd" style="background:'+((s.vars||{}).ac||'#2563eb')+'"></span> <b>'+E(s.name)+'</b>'+(id===cur?' <span class="chip sm on">'+T('فعال','Active')+'</span>':'')+'</summary>'
   +'<label>'+T('نام تم','Theme name')+'</label><input id="lkrn-n-'+E(id)+'" dir="auto" maxlength="60" value="'+E(s.name)+'"><label>'+T('متن سربرگ','Header text')+'</label><input id="lkrn-t-'+E(id)+'" dir="auto" maxlength="120" value="'+E(s.tag||'')+'">'
   +'<div class="row" style="margin-top:6px"><button class="p" data-a="lk_rn" data-id="'+E(id)+'">'+T('ذخیره','Save')+'</button>'+(id===cur?'':'<button data-a="'+(pk?'pk':'st')+'" '+(pk?'data-k="use:'+E(id)+'"':'data-m="use" data-id="'+E(id)+'"')+'>'+T('استفاده','Use')+'</button>')+'<button class="d" '+(pk?'data-a="pk" data-k="del:'+E(id)+'"':'data-skrm="'+E(id)+'"')+'>'+T('حذف','Delete')+'</button></div></details>'}).join(''):'<p class="m">'+T('هنوز تمی بارگذاری نکرده‌ای.','Nothing loaded yet.')+'</p>')+'</details>'}
H.lk_rn=e=>{const id=e.dataset.id,s=SKINS[id],n=document.getElementById('lkrn-n-'+id),t=document.getElementById('lkrn-t-'+id);if(!s||!n)return;
 const name=n.value.trim().slice(0,60);if(!name){toast(T('نام نمی‌تواند خالی باشد','Name cannot be empty'),1);return}
 if(!db.set.skn||typeof db.set.skn!=='object'||Array.isArray(db.set.skn))db.set.skn={};db.set.skn[id]={name,tag:(t?t.value:'').trim().slice(0,120)};s.name=name;s.tag=db.set.skn[id].tag;
 if(save()){toast(T('ذخیره شد','Saved'));render()}};
/* ---- ساخت صفحه ---- */
function build(){
  const grp=[...document.querySelectorAll('details.bgrp')].find(d=>/Look & themes|ظاهر و تم/.test(txt($('summary',d))));if(!grp||$('#lk3'))return;
  const skin=$('#skincard'),thmx=$('#thmx'),fx=$('#fxcard'),mx=$('#mxcard');
  const lf=[...grp.querySelectorAll('.c')].find(c=>/^\s*(Look & Feel|ظاهر)/.test(txt($('h3',c)))&&!c.id);
  const dash=lf?[...lf.querySelectorAll('details')].find(d=>/Dashboard cards|کارت‌های داشبورد/.test(txt($('summary',d)))):null;
  const secs=[...grp.querySelectorAll('.stsec')],icon=secs.find(s=>/Icon Studio|استودیوی آیکون/.test(txt(s))),moods=secs.find(s=>/Page Moods|حال‌وهوای/.test(txt(s)));
  const swap=[...grp.querySelectorAll('details')].find(d=>/Swap individual icons|تعویض تک/.test(txt($('summary',d))));
  const box=document.createElement('div');box.id='lk3';box.className='c';
  box.innerHTML='<div class="row lk3tabs" role="tablist">'+P.map(x=>'<button class="chip '+(ST.p===x[0]?'on':'')+'" data-a="lk3_p" data-k="'+x[0]+'">'+x[1]+' '+T(x[2],x[3])+'</button>').join('')+'</div>';
  const pane=(k,nodes)=>{const d=document.createElement('div');d.className='lk3p';d.dataset.p=k;d.hidden=ST.p!==k;nodes.filter(Boolean).forEach(n=>d.appendChild(n));box.appendChild(d);return d};
  const mk=h=>{const d=document.createElement('div');d.innerHTML=h;return d.firstElementChild};
  /* فروشگاه: شبکه‌ی پوشه‌دار تم‌ها (همان «پوسته») + آیکون‌ها */
  const st=mk(storeHTML());
  const tg=st.querySelector('#lkthemes'),ig=st.querySelector('#lkicons');
  if(tg&&skin){const g=skin.querySelector('.uch-fl')||skin.querySelector('.skg');if(g){g.querySelectorAll('.skg').forEach(x=>x.style.display='');if(g.classList.contains('skg'))g.style.display='';
    g.querySelectorAll('.skb[data-sk]').forEach(b=>{const s=SKINS[b.dataset.sk];if(!s)return;const w=b.querySelector('.sw');if(w){const d=document.createElement('div');d.innerHTML=thumb(s);w.replaceWith(d.firstElementChild)}b.dataset.n=(s.name+' '+(s.desc||'')).toLowerCase()});tg.appendChild(g)}}
  if(ig){if(icon)ig.appendChild(icon);if(swap&&!(icon&&icon.contains(swap)))ig.appendChild(swap)}
  pane('st',[st]);
  /* سفارشی: تصویر و تیرگی تم + اندازه متن */
  let fs=null;if(lf){const lab=[...lf.querySelectorAll('label')].find(l=>/اندازه متن|Text size/.test(txt(l)));if(lab&&lab.nextElementSibling){fs=document.createElement('div');fs.className='c';fs.innerHTML='<h3>'+T('اندازه متن','Text size')+'</h3>';fs.appendChild(lab.nextElementSibling)}}
  if(skin){const h3=skin.querySelector('h3');if(h3)h3.textContent=T('تصویر و تیرگی تم فعلی','Current theme image & dim');skin.querySelectorAll('p.m').forEach(p=>{if(/همیشه تیره است|always dark/.test(txt(p)))p.remove()});
   [...skin.children].forEach(c=>{if(c.classList&&c.classList.contains('row')&&c.querySelector('[data-skthemefile]'))c.remove()});const tgr=skin.querySelector('.uch-fl');if(tgr)tgr.remove();const g2=skin.querySelector(':scope>.skg');if(g2)g2.remove()}
  if(moods)moods.style.display='none';
  pane('cu',[skin,fs]);
  /* بسته‌های تم (حالت توسعه‌دهنده): بارگذاری + سابقه */
  const pk=thmx&&thmx.querySelector('#pkcard'),thmio=thmx&&thmx.querySelector('#thmio');
  if(pk){const rows=[...pk.querySelectorAll('.row')].filter(r=>r.querySelector('[data-a="pk"][data-k^="use:"]'));rows.forEach(r=>r.remove());
   const imp=[...pk.querySelectorAll('.row')].find(r=>r.querySelector('[data-pkfile]'));if(thmio&&imp){const lab=document.createElement('label');lab.className='btn';lab.style.margin='0';const fi=thmio.querySelector('[data-skthemefile]');if(fi){lab.textContent=T('وارد کردن تم (فایل)','Import theme (file)');lab.appendChild(fi);imp.appendChild(lab)}const ex=thmio.querySelector('[data-skexp]');if(ex)imp.appendChild(ex)}
   const h=mk(histHTML());const foot=[...pk.querySelectorAll('p.m')].pop();if(foot)pk.insertBefore(h,foot);else pk.appendChild(h);pk.classList.remove('cmf','cmc');pane('lab',[pk])}else pane('lab',[]);if(thmx)thmx.remove();
  const sc=$('#studiocard');if(sc)sc.remove();
  /* کارت‌های داشبورد و حس برنامه ← «منو و صفحه‌ی خانه» (کنار شخصی‌سازی خانه) */
  if(mx)mx.remove();if(lf)lf.remove();
  const first=grp.querySelector(':scope>summary');first.insertAdjacentElement('afterend',box);
  const after=[fx];if(dash){const w=document.createElement('div');w.id='dashx';w.className='c';w.appendChild(dash);after.push(w)}
  let anchor=grp;const sub=window.daniSetSub;after.filter(Boolean).forEach(n=>{anchor.insertAdjacentElement('afterend',n);anchor=n;if(sub!==undefined&&sub!==null&&sub!=='menu')n.classList.add('snv-x')});
  box.querySelectorAll('.lk3p').forEach(p=>{if(!p.children.length){const m=document.createElement('p');m.className='m';m.textContent=T('اینجا فعلاً چیزی نیست.','Nothing here yet.');p.appendChild(m)}});
  grp.open=true;
}
H.lk3_p=e=>{ST.p=e.dataset.k;document.querySelectorAll('#lk3 .lk3tabs .chip').forEach(b=>b.classList.toggle('on',b.dataset.k===ST.p));document.querySelectorAll('#lk3 .lk3p').forEach(p=>{p.hidden=p.dataset.p!==ST.p})};
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#lkthemes [data-sk]');if(!t)return;e.preventDefault();e.stopImmediatePropagation();H.lk_pv({dataset:{id:t.dataset.sk}})},true);
document.addEventListener('input',e=>{const t=e.target;if(!t||t.id!=='lkq')return;ST.q=t.value;const q=t.value.trim().toLowerCase();document.querySelectorAll('#lkthemes .skb').forEach(b=>{const w=b.parentElement;if(w)w.style.display=!q||(b.dataset.n||'').indexOf(q)>=0?'':'none'});if(q)document.querySelectorAll('#lkthemes .uch-fbody').forEach(x=>x.hidden=false)});
(function css2(){if(document.getElementById('lk3b-css'))return;const s=document.createElement('style');s.id='lk3b-css';
 s.textContent='#lkthemes .skb{position:relative}#lkthemes .skb .stth{margin-bottom:4px}#lkthemes .skb.on{outline:2px solid var(--ac)}.lkac{width:26px;height:26px;border-radius:50%;border:2px solid transparent;padding:0;min-height:0}.lkac.on{border-color:var(--t);box-shadow:0 0 0 2px var(--c)}.lkicr .lkic{flex:0 0 92px;width:92px}.lkicr .lkic .ipv{padding:6px 2px}.lkicr{display:flex;gap:8px;overflow-x:auto;padding-bottom:6px}.lkpv .m{margin-top:8px}.lkhist{margin-top:10px}.lkh1{margin:6px 0;border:1px solid rgba(128,128,128,.25);border-radius:12px;padding:6px 10px}.lkh1 summary{cursor:pointer}.lkh1 input{width:100%}.lkd{display:inline-block;width:10px;height:10px;border-radius:50%}#lkthemes .skg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:8px 0}#lkthemes .skb{padding:6px}#lkthemes .skb small{display:none}#lkthemes .skb .stth{height:64px;padding:6px;gap:4px}#lkthemes .skb .stth i{min-height:8px}.lkicr .lkic b{white-space:normal;font-size:11px;line-height:1.3}.lkpv>.row:last-child{position:sticky;bottom:0;background:var(--c);padding:8px 0}';
 document.head.appendChild(s)})();
(function css(){if(document.getElementById('lk3-css'))return;const s=document.createElement('style');s.id='lk3-css';
 s.textContent='.bpv{position:relative;border-radius:16px;padding:6px 0 22px;border:1px solid rgba(128,128,128,.25);color:var(--t)}.bpv .ipv{background:transparent;border:0}.bpv .bpm{position:absolute;bottom:4px;inset-inline:0;text-align:center;font-size:10px;opacity:.75}.bpv.big{padding:10px 0 26px}.bpv .ipi{color:var(--t)}.strow2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.strow2>*{min-width:0}.stc2{cursor:pointer;display:block}.stc2 b{display:block;font-size:13px;margin-top:4px}.stc2 span{display:block;font-size:11px;opacity:.65}.stc2.on .ipv{outline:3px solid var(--ac)}.ipv{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px 2px;padding:10px 4px;justify-items:center;border-radius:16px;background:rgba(128,128,128,.14);border:1px solid rgba(128,128,128,.22)}.ipv .ipi{display:flex;justify-content:center;font-style:normal;color:var(--t)}.ipv svg.ic,.ipv .icem{width:18px;height:18px;box-sizing:content-box;padding:5px;font-size:15px}.ipv[data-c=ac] .ipi{color:var(--ac)}.ipv[data-s=\'1\'] svg.ic{fill:currentColor;fill-opacity:.22}.ipv[data-f] svg.ic,.ipv[data-f] .icem{background:color-mix(in srgb,var(--ac,#888) 16%,transparent)}.ipv[data-f=circle] .ic{border-radius:50%}.ipv[data-f=squircle] .ic{border-radius:32%}.ipv[data-f=hex] .ic{clip-path:polygon(50% 0,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)}.ipv[data-f=tile] .ic{border-radius:30%;background:var(--icc,var(--ac,#2563eb));color:#fff!important}.ipv[data-f=gloss] .ic{border-radius:30%;background:linear-gradient(145deg,color-mix(in srgb,var(--icc,var(--ac,#2563eb)) 65%,#fff),var(--icc,var(--ac,#2563eb)));color:#fff!important;box-shadow:inset 0 1px 2px rgba(255,255,255,.7),0 3px 8px rgba(0,0,0,.28)}.ipv[data-f=neon] .ic{border-radius:30%;background:transparent;border:1.5px solid var(--icc,var(--ac,#2563eb));color:var(--icc,var(--ac,#2563eb));box-shadow:0 0 9px var(--icc,var(--ac,#2563eb))}.ipv[data-f=clay] .ic{border-radius:38%;background:color-mix(in srgb,var(--icc,var(--ac,#2563eb)) 88%,#fff);color:#fff!important;box-shadow:inset -3px -3px 6px rgba(0,0,0,.25),inset 3px 3px 6px rgba(255,255,255,.5),0 4px 9px rgba(0,0,0,.25)}.strow{display:flex;gap:10px;overflow-x:auto;padding-bottom:6px;scrollbar-width:none}.stc{flex:0 0 104px;width:104px;max-width:104px;min-width:0;display:block;text-align:start;cursor:pointer}.stc b{display:block;font-size:12px;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.stc span{display:block;font-size:11px;opacity:.65;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.stc.on .stth{outline:3px solid var(--ac)}.stth{height:120px;border-radius:14px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:6px;padding:10px;box-sizing:border-box;border:1px solid rgba(128,128,128,.25)}.stth i{display:block;min-height:22px}.stth.big{height:150px}.lkmg{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:6px}.lkm{border:2px solid var(--b);background:transparent;border-radius:12px;padding:6px;text-align:center;font:inherit;color:inherit;cursor:pointer;min-height:0}.lkm.on{border-color:var(--ac);background:color-mix(in srgb,var(--ac) 12%,transparent)}.lkm small{display:block;font-size:11px}.lkmini{display:block;height:44px;border-radius:8px;background:rgba(128,128,128,.14);position:relative;margin-bottom:4px;overflow:hidden}.lkmini s{position:absolute;background:var(--ac);opacity:.7;border-radius:3px}.lkmini em{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-style:normal;opacity:.6}.lkr{display:flex;gap:8px;align-items:center;padding:7px 0;border-top:1px solid var(--b)}.lkd{width:22px;height:22px;border-radius:7px;flex:none}.lkr2{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}html[data-navf="1"][data-lay=bottom] nav{inset:auto 12px calc(10px + env(safe-area-inset-bottom)) 12px!important;border-radius:28px;border:0!important;border-image:none!important;box-shadow:0 6px 22px rgba(0,0,0,.28)}html[data-navf="1"][data-lay=bottom] .app{padding-bottom:98px}#lk3{padding:8px}#lk3 .lk3tabs{flex-wrap:nowrap;overflow-x:auto;gap:6px;margin-bottom:8px;padding-bottom:2px;scrollbar-width:none}#lk3 .lk3tabs .chip{flex:0 0 auto;white-space:nowrap;font-size:.86em;padding:5px 10px}#lk3 .lk3p[hidden]{display:none!important}#lk3 .lk3p>.c,#lk3 .lk3p>details{margin-top:8px}';document.head.appendChild(s)})();
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{if(page==='set'&&stt==='look')build()}catch(e){console.error('look3',e)}return r}}
})();
/* v157: منوی کشویی با زدن بیرون از منو، دکمه‌ی برگشت گوشی یا Escape بسته می‌شود */
(function(){const nav=()=>document.getElementById('nav'),isO=()=>{const n=nav();return !!n&&n.classList.contains('o')},close=()=>{const n=nav();if(n)n.classList.remove('o')};let pushed=false,mo=null;
 function arm(){const n=nav();if(!n||mo)return;mo=new MutationObserver(()=>{if(isO()){if(!pushed){try{history.pushState({danimenu:1},'')}catch(e){}pushed=true}}else if(pushed){pushed=false;try{if(history.state&&history.state.danimenu)history.back()}catch(e){}}});mo.observe(n,{attributes:true,attributeFilter:['class']})}
 window.addEventListener('popstate',()=>{if(pushed&&isO()){pushed=false;close()}else pushed=false});
 document.addEventListener('click',e=>{if(!isO())return;const n=nav();if(n.contains(e.target)||(e.target.closest&&e.target.closest('#mb')))return;close()},true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&isO())close()});
 arm();document.addEventListener('DOMContentLoaded',arm);
})();
