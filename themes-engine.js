"use strict";
/* DANI · themes-engine.js
   موتور تم‌ها + تم‌های Itachi (art، آیکون‌ها، دکوراسیون، داشبوردها) + بسته‌های تم
   فایل‌های js/ به ترتیب در index.html بارگذاری می‌شوند و متغیرها و تابع‌ها را مشترک دارند (مثل یک فایل واحد). */
/* ===== v14: skin engine (data-driven themes; theme files are validated data, never code) ===== */
const ICONS={
 home:'<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',
 dl:'<path d="M6 3h12M6 21h12M7 3v4l5 5 5-5V3M7 21v-4l5-5 5 5v4"/>',
 dash:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
 res:'<path d="M5 20V11M12 20V5M19 20v-6"/>',
 set:'<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
 today:'<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/>',
 plan:'<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
 acts:'<path d="M13 3L5 13h6l-1 8 8-10h-6z"/>',
 goals:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 notes:'<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 13h7M9 17h5"/>',
 rep:'<path d="M5 20V11M12 20V5M19 20v-6"/>',
 stats:'<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
 look:'<path d="M12 3a9 9 0 100 18c1.5 0 2-1 1.5-2-.5-1 0-2 1.2-2H17a4 4 0 004-4c0-5-4-10-9-10z"/><circle cx="8" cy="11" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16" cy="11" r="1"/>',
 time:'<path d="M6 16V11a6 6 0 1112 0v5l2 2H4z"/><path d="M10 21h4"/>',
 data:'<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>'};
const icon=k=>{const sk=document.documentElement.dataset.skin,p=((typeof PK_IC!=='undefined'&&PK_IC[sk])||{})[k]||(typeof ITU_IC!=='undefined'&&ITU_IC[sk]&&ITU_IC[sk][k])||ICONS[k];return p?'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>':''};
const SK_DEF={desc:'',lay:'side',dark:false,card:'default',rad:16,btn:'round',font:'sans',ic:'line',tag:'',vars:null,bgGradient:null,hero:null,imgs:[],emblem:null,wm:false,favicon:null,custom:false};
const SK_BTN={round:10,pill:99,sharp:3},SK_ICW={line:1.7,bold:2.3,duo:1.7};
/* built-in skins use exactly the same schema as importable theme files */
/* ===== Itachi Uchiha themes (3 skins): art, icon sets, sidebar decor and dashboards ===== */
const ITU_IMG={"h1": DANI_DU[7], "s1": "img/itachi-s1-8e549c.jpg", "h2": DANI_DU[8], "s2": "img/itachi-s2-8ca0a0.jpg", "e2": DANI_DU[14], "h3": DANI_DU[5], "f3": DANI_DU[9], "e3": DANI_DU[13], "s3": DANI_DU[12], "r1": DANI_DU[6], "r2": DANI_DU[11], "r3": DANI_DU[10], "r4": DANI_DU[4]};
const ITU_SET={itu1:{a:'h1',b:'e2',c:'s1'},itu2:{a:'h2',b:'e2',c:'s2'},itu3:{a:'h3',b:'f3',d:'e3',c:'s3'}};
const ITU_IC={
itu1:{home:'<path d="M3 6c3 1.2 6 1.8 9 1.8S18 7.2 21 6M5 8.5h14M7.5 8.5V21M16.5 8.5V21M4.5 13h15"/>',dash:'<path d="M12 2.5l2.4 7.1 7.1 2.4-7.1 2.4L12 21.5l-2.4-7.1L2.5 12l7.1-2.4z"/><circle cx="12" cy="12" r="1.6"/>',res:'<path d="M7 4h10a2 2 0 012 2v13H9a2 2 0 01-2-2zM7 4a2 2 0 00-2 2v11a2 2 0 002 2M10 9h6M10 13h4"/>',set:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="6.4" r="1.2"/><circle cx="17" cy="14.8" r="1.2"/><circle cx="7" cy="14.8" r="1.2"/>',dl:'<path d="M12 2l3 5-3 3-3-3zM12 10v7M9.5 17h5M12 17v5"/>',hab:'<path d="M20 12a8 8 0 11-2.4-5.7M20 4v4h-4"/>',rem:'<path d="M6 16V11a6 6 0 1112 0v5l2 2H4zM10 21h4"/>',qt:'<path d="M4 5h16v11H9l-5 4z"/>',acd:'<path d="M4 5h16M6 5v14M18 5v14M6 19h12M9 9h6M9 13h6"/>'},
itu2:{home:'<path d="M12 2l7 5H5zM6 7v3h12V7M7 10l-3 4h16l-3-4M7 14v7h10v-7"/>',dash:'<path d="M7 18a4 4 0 010-8 5.5 5.5 0 0110.4-1.2A4.3 4.3 0 1117 18z"/>',res:'<path d="M4 20h16M7 17v-7M12 17V5M17 17v-4"/><circle cx="17" cy="8" r="2"/>',set:'<circle cx="12" cy="12" r="3.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',dl:'<path d="M5 4h14M5 20h14M7 4c0 5 5 6 5 8s-5 3-5 8M17 4c0 5-5 6-5 8s5 3 5 8"/>',hab:'<circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/>',rem:'<path d="M20 14.5A8.5 8.5 0 119.5 4a7 7 0 0010.5 10.5z"/>',qt:'<path d="M5 4h14a2 2 0 012 2v9a2 2 0 01-2 2h-7l-5 4v-4H5a2 2 0 01-2-2V6a2 2 0 012-2z"/>',acd:'<path d="M3 7l9-4 9 4-9 4zM7 10v5c1 1.5 3 2.5 5 2.5s4-1 5-2.5v-5M21 7v6"/>'},
itu3:{home:'<path d="M4 11l8-7 8 7M6 10v10h12V10M10 20v-5h4v5"/>',dash:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',res:'<path d="M5 20v-9M12 20V5M19 20v-6"/><circle cx="19" cy="7" r="1.5"/>',set:'<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',dl:'<rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 10h18M8 3v4M16 3v4M8 14h2M14 14h2"/>',hab:'<path d="M5 3h14v18H5zM9 12l2 2 4-4"/>',rem:'<path d="M10 20a2 2 0 004 0M5 17h14l-2-3v-4a5 5 0 00-10 0v4z"/>',qt:'<path d="M9 6H5v6h4c0 3-1 4-3 5M19 6h-4v6h4c0 3-1 4-3 5"/>',acd:'<path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1zM12 6v14"/>'}};
const ITU_Q=[['گاهی باید در تاریکی قدم برداشت تا حقیقت را ببینی.','Sometimes you have to walk in darkness to see the truth.'],['من هرگز کسی را نفروختم... فقط آنچه را که باید، قربانی کردم.','I never betrayed anyone... I only sacrificed what had to be sacrificed.'],['تنها کسی که باید از او بترسی، خودت هستی.','The only person you should be afraid of is yourself.'],['هر روز، یک گام به سوی نسخه‌ی بهتر خودت.','Every day, a step closer to a better you.']];
const ITU_FAN='<svg viewBox="0 0 48 48" class="fan" aria-hidden="true"><path d="M24 3a15 15 0 0115 15c0 7-6 12-15 12S9 25 9 18A15 15 0 0124 3z" fill="#e0182d"/><path d="M24 30v16M20 30l-1 16h10l-1-16z" fill="#f2f2f2" stroke="none"/><path d="M24 3v27" stroke="#fff" stroke-width="2"/></svg>';
const ITU_SHA='<svg viewBox="0 0 48 48" class="sha" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#b30f1e"/><circle cx="24" cy="24" r="16" fill="none" stroke="#14050a" stroke-width="1.5"/><circle cx="24" cy="24" r="4.5" fill="#14050a"/><g fill="#14050a"><circle cx="24" cy="10" r="3.4"/><circle cx="36.1" cy="31" r="3.4"/><circle cx="11.9" cy="31" r="3.4"/></g></svg>';
function ituQ(){const h=heroQuote('itachi');return[h.fa,h.en,h.a,h.id]}
function ituApply(k){const st=document.documentElement.style,S=ITU_SET[k],all=['ia','ib','ic','id','g1','g2','g3','g4'];
 all.forEach(v=>st.removeProperty('--'+v));if(!S)return;
 Object.entries(S).forEach(([v,i])=>st.setProperty('--i'+v,'url("'+ITU_IMG[i]+'")'));
 ['r1','r2','r3','r4'].forEach((r,i)=>st.setProperty('--g'+(i+1),'url("'+ITU_IMG[r]+'")'))}
function ituDecor(){const nav=$('#nav'),k=document.documentElement.dataset.skin;if(!nav)return;nav.querySelectorAll('.itu-prof,.itu-foot').forEach(e=>e.remove());if(!/^itu[123]$/.test(k))return;
 const q=ituQ(),P={
 itu1:'<div class="itu-prof"><div class="brand">'+ITU_FAN+'<b>Itachi <span>Uchiha</span></b></div><i class="ban"></i></div>',
 itu2:'<div class="itu-prof"><div class="brand">'+ITU_SHA+'<b>DANI <span>Planner</span></b></div><div class="me"><i class="av"></i><div><small>خوش آمدی</small><b>Dani</b><em>Still, I walk my own path.</em></div></div></div>',
 itu3:'<div class="itu-prof"><div class="brand">'+ITU_SHA+'<b>DANI <span>Planner</span></b></div><i class="ban"></i></div>'};
 const h=nav.querySelector('small');if(h)h.insertAdjacentHTML('afterend',P[k]);else nav.insertAdjacentHTML('afterbegin',P[k]);
 nav.insertAdjacentHTML('beforeend','<div class="itu-foot"><i class="art"></i><span class="kj">うちはイタチ</span><p>'+esc(q[1]||q[0])+'<br><em>— '+esc(q[2])+'</em></p></div>')}
function ituStrip(){return'<div class="itu-strip">'+NAV.map(n=>{const p=BI_NAV[n[0]];return'<button data-a="go" data-p="'+n[0]+'"><i>'+icon(n[0])+'</i><b>'+esc(p?p[1]:n[1])+'</b><small>'+(p?p[0]:'')+'</small></button>'}).join('')+'</div>'}
function ituHero(k){const q=ituQ();return'<section class="itu-hero"><div class="itu-hq"><span class="itu-kj">うちはイタチ</span>'+heroQB(q)+'</div>'+(k==='itu3'?'<div class="itu-col"><i class="a"></i><i class="b"></i><i class="c"></i></div><div class="itu-emb">'+ITU_SHA+'</div>':'<div class="itu-art"></div>')+'</section>'}
function ituGal(){return'<div class="itu-gal"><i style="background-image:var(--g1)"></i><i style="background-image:var(--g2)"></i><i style="background-image:var(--g3)"></i><i style="background-image:var(--g4)"></i></div>'}
function ituHome(k){const d=todayISO(),h0=homeTarget(),run=db.timer&&['running','paused'].includes(db.timer.state),hr=new Date().getHours(),gr=hr<5?'شب بخیر':hr<12?'صبح بخیر':hr<17?'ظهر بخیر':hr<20?'عصر بخیر':'شب بخیر';
 const head='<div class="deskhead"><div>'+danGreetHTML()+'<div class="m">'+fmtDL(d)+'</div></div>'+(run?'<span class="hct">⏱ '+esc(aN(db.timer.actId))+' · <b class="hcel">'+mm(Math.floor(el()/60000))+'</b></span>':'')+'</div>';
 let b;
 if(k==='itu1')b='<div class="itu-g g1"><div>'+hSchedule()+hCheck()+'</div><div>'+hSummary(h0)+hGoalsBars()+hFocusTimer()+'</div><div>'+hQuickLog()+hNoteDesk()+hActionsDesk()+'</div></div>'+ituGal()+'<div class="deskwide">'+hQuote()+'</div>';
 else if(k==='itu2')b='<div class="itu-g g2"><div>'+hSummary(h0)+hGoalsBars()+hActionsDesk()+'</div><div>'+hCheck()+hSchedule()+hQuickLog()+'</div><div><div class="c itu-eyes"><i></i></div>'+hQuote()+hFocusTimer()+hNoteDesk()+ituGal()+'</div></div>';
 else b='<div class="itu-g g3"><div>'+hSchedule()+'</div><div>'+hSummary(h0)+hGoalsBars()+'</div><div>'+hFocusTimer()+hQuote()+'</div><div>'+hCheck()+hQuickLog()+hNoteDesk()+hActionsDesk()+'</div></div>'+ituGal();
 return'<div class="home desk itu '+k+'">'+ovCard()+head+ituHero(k)+ituStrip()+'<div class="deskwide">'+hDl()+'</div>'+b+'<div class="deskwide">'+hOverdue()+'</div>'+hMgr()+'</div>'}

/* ===== Theme packs (developer mode): icons, CSS and optional code; signed with a passphrase ===== */
const PKR={home:{},decor:{},apply:{}},PK_IC={},PK_REC={};
const PKAPI={registerHome:(id,f)=>{PKR.home[id]=f},registerDecor:(id,f)=>{PKR.decor[id]=f},registerApply:(id,f)=>{PKR.apply[id]=f}};
/* ===== Itachi new themes: assets, icons, menu decor, dashboards (additive; every home section is kept) ===== */
const IV_SET={itv1:{v1:'r1',v2:'r4',v3:'r3',v4:'f3'},itv2:{v1:'h2',v2:'f3',v3:'r2',v4:'e2'},itv3:{v1:'e3',v2:'r2',v3:'r4',v4:'s3'}};
const IV_KJ={home:'家',dash:'務',res:'報',set:'設',dl:'期',hab:'習',rem:'鐘',qt:'言',acd:'学'};
PKR.apply.itv1=PKR.apply.itv2=PKR.apply.itv3=function(){const k=skId(),st=document.documentElement.style,S=IV_SET[k];['v1','v2','v3','v4'].forEach(v=>st.removeProperty('--'+v));if(!S)return;Object.entries(S).forEach(([v,i])=>st.setProperty('--'+v,'url("'+ITU_IMG[i]+'")'))};
PK_IC.itv2={home:'<path d="M12 3a9 9 0 019 9M12 3a9 9 0 00-9 9M5.5 7.5A9 9 0 0112 5a9 9 0 016.5 2.5M8 20V9M12 21V6M16 20V9M3 12h18"/>',dash:'<path d="M12 2l8.5 5v10L12 22l-8.5-5V7z"/><path d="M12 7l4 2.3v4.4L12 16l-4-2.3V9.3z"/>',res:'<path d="M4 20c0-9 4-15 8-15s8 6 8 15M8 20c0-6 2-10 4-10s4 4 4 10"/>',set:'<circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l2.8 2.8M16.2 16.2L19 19M19 5l-2.8 2.8M7.8 16.2L5 19"/>',dl:'<path d="M5 3h14l-2 5 2 5H5z"/><path d="M5 3v18"/>',hab:'<path d="M12 21c-5-3-8-6-8-10a5 5 0 019-3 5 5 0 019 3c0 4-3 7-8 10z"/>',rem:'<path d="M12 3v3M5 9a7 7 0 0114 0c0 6 2 7 2 8H3c0-1 2-2 2-8z"/><path d="M10 20a2 2 0 004 0"/>',qt:'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',acd:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.5V16c3 2.5 9 2.5 12 0v-4.5"/>'};
PK_IC.itv3={home:'<path d="M12 22c-4 0-7-3-7-7 0-3 2-5 3-7 1 2 2 2 3 2 0-4 1-7 4-9 0 4 4 6 4 12 0 5-3 9-7 9z"/>',dash:'<path d="M3 12h4l3-8 4 16 3-8h4"/>',res:'<path d="M3 20h18M6 20V10M11 20V4M16 20v-7M21 20V8"/>',set:'<path d="M12 3l2 3h4l-1 4 3 2-3 2 1 4h-4l-2 3-2-3H6l1-4-3-2 3-2-1-4h4z"/>',dl:'<path d="M12 2l3 7 7 .5-5.5 4.5 2 7.5-6.5-4-6.5 4 2-7.5L2 9.5 9 9z"/>',hab:'<path d="M12 21c-5-4-8-7-8-11a4 4 0 018-1 4 4 0 018 1c0 4-3 7-8 11z"/>',rem:'<path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="9"/>',qt:'<path d="M5 18c0-6 2-10 7-12-1 3 0 4 2 4 3 0 5 3 5 6 0 3-3 5-7 5s-7-1-7-3z"/>',acd:'<path d="M12 2l9 5v6c0 5-4 8-9 9-5-1-9-4-9-9V7z"/>'};
function ivBrand(nav){if(!nav)return;nav.querySelectorAll('.iv-brand').forEach(e=>e.remove());const k=document.documentElement.dataset.skin;if(!/^itv[123]$/.test(k))return;
 const B={itv1:'<div class="iv-brand"><span class="iv-hanko">影</span><b>Itachi <em>Uchiha</em></b><small>うちはイタチ</small></div>',itv2:'<div class="iv-brand"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="21" fill="none" stroke="#8f7dff" stroke-width="2"/><path d="M8 30c3-14 29-14 32 0M14 33c2-9 18-9 20 0" fill="none" stroke="#35e0ff" stroke-width="2"/><circle cx="24" cy="24" r="3" fill="#8f7dff"/></svg></div>',itv3:''};
 nav.insertAdjacentHTML('afterbegin',B[k]||'');
 if(k==='itv1')nav.querySelectorAll('a[data-p]').forEach(a=>{const j=IV_KJ[a.dataset.p];if(j&&!a.querySelector('.kj'))a.insertAdjacentHTML('afterbegin','<span class="kj" aria-hidden="true">'+j+'</span>')})}
PKR.decor.itv1=PKR.decor.itv2=PKR.decor.itv3=ivBrand;
function ivHead(){const d=todayISO(),hr=new Date().getHours(),run=db.timer&&['running','paused'].includes(db.timer.state),gr=hr<5?'شب بخیر':hr<12?'صبح بخیر':hr<17?'ظهر بخیر':hr<20?'عصر بخیر':'شب بخیر';
 return'<div class="deskhead"><div>'+danGreetHTML()+'<div class="m">'+fmtDL(d)+'</div></div>'+(run?'<span class="hct">⏱ '+esc(aN(db.timer.actId))+' · <b class="hcel">'+mm(Math.floor(el()/60000))+'</b></span>':'')+'</div>'}
function ivChips(){return'<div class="iv-chips">'+NAV.map(n=>{const p=BI_NAV[n[0]];return'<button data-a="go" data-p="'+n[0]+'">'+icon(n[0])+'<span>'+esc(p?p[1]:n[1])+'</span></button>'}).join('')+'</div>'}
function ivTicker(){let P=[];try{P=hqPool('itachi')}catch(e){}if(!P.length)return'';const s=P.slice(0,12).map(q=>'<span>'+esc(q.fa)+(q.en?' · <i>'+esc(q.en)+'</i>':'')+'</span>').join('');return'<div class="iv-tick" aria-hidden="true"><div>'+s+s+'</div></div>'}
function ivHome(k){const h0=homeTarget(),q=ituQ(),pc=Math.max(0,Math.min(100,Math.round(h0&&h0.pr&&h0.pr.n?h0.pr.pc:0))),head=ivHead(),dl='<div class="deskwide">'+hDl()+'</div>',tail='<div class="deskwide">'+hOverdue()+'</div>'+hMgr();let b;
 if(k==='itv1'){b=ovCard()+'<section class="iv-hero"><i class="iv-pic"></i><div class="iv-hq"><span class="iv-seal">影</span>'+heroQB(q)+'</div><span class="iv-vt" aria-hidden="true">うちはイタチ</span></section>'+head+dl+
  '<div class="iv-cols"><div class="iv-main">'+hSchedule()+hCheck()+hQuickLog()+hNoteDesk()+'</div><div class="iv-side">'+hSummary(h0)+hFocusTimer()+hGoalsBars()+hActionsDesk()+'</div></div>'+
  '<div class="iv-scrolls"><figure style="--p:var(--v2)"><figcaption>一</figcaption></figure><figure style="--p:var(--v3)"><figcaption>二</figcaption></figure><figure style="--p:var(--v4)"><figcaption>三</figcaption></figure></div><div class="deskwide">'+hQuote()+'</div>'+tail}
 else if(k==='itv2'){b=ovCard()+head+ivChips()+dl+'<div class="iv-bento"><section class="iv-hero b-hero"><i class="iv-pic"></i><svg class="iv-ribs" viewBox="0 0 200 120" aria-hidden="true"><g fill="none" stroke="currentColor"><path d="M10 120C10 50 55 8 100 8s90 42 90 112"/><path d="M34 120C34 62 66 26 100 26s66 36 66 94"/><path d="M58 120c0-44 18-70 42-70s42 26 42 70"/><path d="M82 120c0-26 8-40 18-40s18 14 18 40"/></g></svg><div class="iv-hq">'+heroQB(q)+'</div></section><div class="b-sum">'+hSummary(h0)+'</div><div class="b-tim">'+hFocusTimer()+'</div><div class="b-sch">'+hSchedule()+'</div><div class="b-chk">'+hCheck()+'</div><div class="b-log">'+hQuickLog()+'</div><div class="b-goal">'+hGoalsBars()+'</div><div class="b-note">'+hNoteDesk()+'</div><div class="b-act">'+hActionsDesk()+'</div><div class="b-eye c"><i></i></div><div class="b-q">'+hQuote()+'</div></div>'+tail}
 else{b=ovCard()+'<section class="iv-hero"><i class="iv-pic"></i><span class="iv-ghost" aria-hidden="true">天照</span><div class="iv-hq">'+heroQB(q)+'</div><div class="iv-flame" aria-hidden="true"></div></section>'+ivTicker()+head+dl+
  '<div class="iv-tl"><div class="iv-spine">'+hSchedule()+hCheck()+hQuickLog()+'</div><div class="iv-rest">'+hFocusTimer()+hSummary(h0)+hGoalsBars()+hNoteDesk()+hActionsDesk()+'</div></div>'+
  '<div class="iv-polar"><figure style="--p:var(--v2)"></figure><figure style="--p:var(--v3)"></figure><figure style="--p:var(--v4)"></figure></div><div class="deskwide">'+hQuote()+'</div>'+tail}
 return'<div class="home desk iv iv'+k.slice(3)+' '+k+'">'+b+'</div>'}
['itv1','itv2','itv3'].forEach(k=>{PKR.home[k]=()=>ivHome(k)});

/* ===== DANI: greeting at the top of Home - English only, no name, with the Dani icon (used by every theme via ituHome, ivHead and deskHTML0) ===== */
function danGreet(){const hr=new Date().getHours();return hr>=5&&hr<12?'Good morning':hr>=12&&hr<17?'Good afternoon':'Good evening'}
function danGreetHTML(){return'<div class="dkgr" style="display:flex;align-items:center;gap:10px"><img src="icons/icon-192.png" alt="" aria-hidden="true" width="44" height="44" style="width:44px;height:44px;border-radius:50%;flex:none;object-fit:cover"><span dir="ltr">'+danGreet()+'</span></div>'}
function danFixGreet(){document.querySelectorAll('.dkgr').forEach(g=>{if(!g.querySelector('img')&&/بخیر/.test(g.textContent))g.outerHTML=danGreetHTML()})}
const _rDg=render;render=function(){const r=_rDg.apply(this,arguments);try{danFixGreet()}catch(e){console.error('greet',e)}return r};
