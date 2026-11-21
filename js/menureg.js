"use strict";
/* DANI · menureg.js (v162.2) — منبع واحد فهرست آیتم‌های منو/نماد.
   هر ماژولی که فهرست نماد لازم دارد از اینجا بخواند: daniMenu.keys() = همهٔ کلیدهای نماد برنامه (ICONS + منوی اصلی + آیتم‌هایی که کاربر با استودیوی آیکون اضافه کرده).
   daniMenu.set(id) = نمادهای اختصاصی یک تم؛ daniMenu.missing(id) = کلیدهایی که آن تم ندارد؛ daniMenu.sets() = ست‌های نماد با ادغام نمادهای یکسان.
   پس آیتم تازه که به ICONS یا منو برسد خودکار در همهٔ تم‌ها دیده می‌شود (با قاب تم تا نماد اختصاصی‌اش ساخته شود). */
(function(){'use strict';
const SETOF=id=>(typeof PK_IC!=='undefined'&&PK_IC[id])||(typeof ITU_IC!=='undefined'&&ITU_IC[id])||null;
function keys(){const s=new Set();try{Object.keys(ICONS).forEach(k=>s.add(k))}catch(e){}try{NAV.forEach(n=>s.add(n[0]))}catch(e){}try{Object.keys((db.set&&db.set.icmap)||{}).forEach(k=>s.add(k))}catch(e){}return[...s]}
const own=id=>{const o=SETOF(id);return o?Object.keys(o):[]};
const missing=id=>{const o=SETOF(id)||{};return keys().filter(k=>!o[k])};
function sets(){let ids=[];try{ids=[...new Set([...Object.keys(typeof PK_IC!=='undefined'?PK_IC:{}).filter(k=>Object.keys(PK_IC[k]||{}).length>=6),...Object.keys(typeof ITU_IC!=='undefined'?ITU_IC:{})])].filter(k=>SKINS[k])}catch(e){}
 const g=new Map();ids.forEach(id=>{const sig=JSON.stringify(SETOF(id));if(!g.has(sig))g.set(sig,[]);g.get(sig).push(id)});
 const rep={};const out=[...g.values()].map(a=>{a.forEach(id=>rep[id]=a[0]);return{rep:a[0],ids:a}});out.rep=rep;return out}
const grp=sets;
window.daniMenu={keys,own,missing,sets:grp,repOf:id=>(grp().rep||{})[id]||id,framed:id=>{const o=SETOF(id);return !!o&&Object.keys(o).length>=3}};
})();
