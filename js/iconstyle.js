/* ظاهر آیکون‌های منو (v76): داخل همان «استودیوی آیکون». روی همه‌ی تم‌ها کار می‌کند و پیش‌فرضش «مطابق تم» است (هیچ چیز عوض نمی‌شود).
   db.set.icx={fam:''|'std'|'emoji', frame:''|'circle'|'squircle'|'hex'|'tile', col:''|'ac'|'rb', soft:0|1}. `icon(k)` در themes-engine.js fam/col را می‌خواند؛ قاب و نرمی با CSS و صفت‌های html (data-icf / data-icsoft). بعد از iconswap.js. */
(function(){'use strict';
if(typeof iconStudio!=='function')return;
const T=window.daniT,X=()=>db.set.icx||(db.set.icx={});
const FAM=[['','مطابق تم','Match theme'],['std','یکسان و خطی','Uniform line'],['emoji','ایموجی رنگی','Colour emoji']];
const FRM=[['','بدون قاب','None'],['circle','دایره','Circle'],['squircle','گرد','Rounded'],['hex','شش‌ضلعی','Hexagon'],['tile','کاشی رنگی','Colour tile']];
const COL=[['','مطابق تم','Match theme'],['ac','رنگ اصلی','Accent'],['rb','رنگارنگ','Colourful']];
const css=document.createElement('style');css.id='icx-css';css.textContent=`
nav a .icem,.tabs .icem{width:18px;height:18px;font-size:15px;margin-inline-end:7px;flex:none}
html[data-icf] nav a svg.ic,html[data-icf] nav a .icem{box-sizing:content-box;padding:6px;background:color-mix(in srgb,var(--ac,#888) 16%,transparent);transition:.2s}
html[data-icf] .tabs svg.ic,html[data-icf] .tabs .icem{box-sizing:content-box;padding:3px;background:color-mix(in srgb,var(--ac,#888) 16%,transparent)}
html[data-icf=circle] nav a svg.ic,html[data-icf=circle] nav a .icem,html[data-icf=circle] .tabs .ic{border-radius:50%}
html[data-icf=squircle] nav a svg.ic,html[data-icf=squircle] nav a .icem,html[data-icf=squircle] .tabs .ic{border-radius:32%}
html[data-icf=hex] nav a svg.ic,html[data-icf=hex] nav a .icem,html[data-icf=hex] .tabs .ic{clip-path:polygon(50% 0,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)}
html[data-icf=tile] nav a svg.ic,html[data-icf=tile] nav a .icem,html[data-icf=tile] .tabs .ic{border-radius:30%;background:var(--icc,var(--ac,#2563eb))}
html[data-icf=tile] nav a svg.ic,html[data-icf=tile] .tabs svg.ic{color:#fff!important}
html[data-icf] nav a.on svg.ic,html[data-icf] nav a.on .icem{background:color-mix(in srgb,var(--ac,#888) 34%,transparent)}
html[data-icf=tile] nav a.on svg.ic,html[data-icf=tile] nav a.on .icem{background:var(--icc,var(--ac,#2563eb));box-shadow:0 0 0 2px color-mix(in srgb,var(--ac,#888) 40%,transparent)}
html[data-icsoft] svg.ic{fill:currentColor;fill-opacity:.22}
html[data-iccol=ac] nav a svg.ic,html[data-iccol=ac] .tabs svg.ic{color:var(--ac)}
`;document.head.appendChild(css);
function apply(){const x=db.set.icx||{},h=document.documentElement;[['icf',x.frame],['iccol',x.col&&x.col!=='rb'?x.col:''],['icsoft',x.soft?'1':'']].forEach(([a,v])=>{if(v)h.setAttribute('data-'+a,v);else h.removeAttribute('data-'+a)})}
const refresh=()=>{try{document.querySelectorAll('#nav a[data-p] .ic,#pg [data-a="tab"][data-k] .ic').forEach(e=>e.remove())}catch(e){}apply();render();try{decorateIcons()}catch(e){}};
const _is=iconStudio;
iconStudio=function(){let h=_is.apply(this,arguments);try{const x=X(),row=(t,key,L,cur)=>'<div class="m" style="margin-top:8px">'+t+'</div><div class="row">'+L.map(o=>'<button class="chip '+((cur||'')===o[0]?'on':'')+'" data-a="icx_set" data-f="'+key+'" data-v="'+o[0]+'">'+T(o[1],o[2])+'</button>').join('')+'</div>';
 const blk='<div style="margin-top:6px">'+row(T('طرح آیکون‌ها (برای همه‌ی تم‌ها)','Icon set (all themes)'),'fam',FAM,x.fam)+row(T('قاب پشت آیکون','Frame behind icon'),'frame',FRM,x.frame)+row(T('رنگ آیکون‌ها','Icon colour'),'col',COL,x.col)
  +'<div class="row" style="margin-top:8px"><button class="chip '+(x.soft?'on':'')+'" data-a="icx_set" data-f="soft" data-v="'+(x.soft?'0':'1')+'">'+T('پرکردگی نرم','Soft fill')+'</button><button class="chip" data-a="icx_set" data-f="all" data-v="">↺ '+T('همه‌چیز مطابق تم','Reset to theme')+'</button></div>'
  +'<div class="row icprev" style="margin-top:8px">'+['day','plan2','pj','res','acd','set'].map(k=>'<span style="display:inline-flex;align-items:center">'+icon(k)+'</span>').join('')+'</div></div>';
 h=h.replace(/(<div class="row icprev">[\s\S]*?<\/div>)/,'$1'+blk)}catch(e){console.error('iconstyle',e)}return h};
H.icx_set=e=>{const f=e.dataset.f,v=e.dataset.v,x=X();if(f==='all')db.set.icx={};else if(f==='soft')x.soft=v==='1'?1:0;else x[f]=v;save();refresh()};
apply();
const _r=render;render=function(){_r.apply(this,arguments);try{apply()}catch(e){}};
window.daniIconStyle={apply};
})();
