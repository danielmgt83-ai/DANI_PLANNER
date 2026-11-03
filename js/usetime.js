/* وقت مفید / اتلاف / ثبت‌نشده (v70): یک نوار جمع‌وجور در خانه (زیر «نتیجه»)، برنامه (زیر روز) و یک کارت کامل در نتیجه (امروز) و گزارش.
   هر فعالیت یکی از: مفید برای هدف (u) | ضروری زندگی (n) | اتلاف/تفریح (w) | خواب (s) است؛ خودکار از پروژه/دسته/اولویت/نام حدس زده می‌شود و در فرم فعالیت قابل‌تغییر است (a.use).
   «ثبت‌نشده» = ساعت‌های بیداری منهای ثبت‌شده‌ها؛ فقط روزهایی که دست‌کم یک ثبت دارند حساب می‌شوند. بعد از results2.js و plan2.js، قبل از fx.js. */
(function(){'use strict';
const T=window.daniT;
const nowMin=()=>{const d=new Date();return d.getHours()*60+d.getMinutes()};
const WASTE=/بازی|game|اینستا|instagram|تلگرام|telegram|سریال|series|فیلم|movie|netflix|youtube|یوتیوب|شبکه|social|tiktok|تیک‌تاک/i;
const PJs=()=>{try{return zmg('pj',()=>({v:'w',today:1})).items.filter(p=>!p.arch)}catch(e){return[]}};
let linked=new Set(),lkAt=0;
const lk=()=>{if(Date.now()-lkAt>3000){linked=new Set();PJs().forEach(p=>(p.parts||[]).forEach(x=>x&&x.a&&linked.add(x.a)));lkAt=Date.now()}return linked};
const USE=[['u','✅',T('مفید برای هدف','Useful for goals'),'#22a38a'],['n','🧩',T('ضروری زندگی','Life needs'),'#94a3b8'],['w','🟠',T('اتلاف / تفریح','Wasted / leisure'),'#f08a1c']];
function cls(id){const a=act(id);if(!a)return'n';if(['u','n','w','s'].includes(a.use))return a.use;
  if(lk().has(a.id))return'u';if(a.cat==='learn'||a.cat==='work')return'u';if(a.cat==='sleep')return's';if(a.prio==='optional'||WASTE.test(a.name||''))return'w';return'n'}
const win=()=>{const a=(db.set.ds&&/^\d\d:\d\d$/.test(db.set.ds))?tm(db.set.ds):360,b=(db.set.de&&/^\d\d:\d\d$/.test(db.set.de))?tm(db.set.de)+(db.set.de==='23:59'?1:0):1440;return Math.max(60,b-a)};
function calc(from,to){const today=todayISO(),W=win(),r={days:0,W:0,u:0,n:0,w:0,s:0,x:0,top:{}};
  for(let d=from;d<=to;d=addD(d,1)){const es=E(d)||[];if(!es.length&&d!==today)continue;if(d>today)break;
    let u=0,n=0,w=0,s=0;es.forEach(e=>{const c=cls(e.actId),m=e.min||0;if(c==='u')u+=m;else if(c==='w'){w+=m;r.top[e.actId]=(r.top[e.actId]||0)+m}else if(c==='s')s+=m;else n+=m});
    let day=W;if(d===today){const ds=(db.set.ds&&/^\d\d:\d\d$/.test(db.set.ds))?tm(db.set.ds):360;day=Math.min(W,Math.max(0,nowMin()-ds))}
    r.days++;r.W+=day;r.u+=u;r.n+=n;r.w+=w;r.s+=s;r.x+=Math.max(0,day-u-n-w)}
  return r}
function range(k){const t=todayISO();return k==='m'?calc(addD(t,-29),t):k==='w'?calc(addD(t,-6),t):calc(t,t)}
const pct=(a,b)=>b>0?Math.round(a/b*100):0;
function bar(r){const tot=Math.max(1,r.u+r.n+r.w+r.x);const seg=(v,c,x)=>'<i style="flex:'+v+';background:'+c+(x?';background-image:repeating-linear-gradient(45deg,transparent 0 4px,rgba(255,255,255,.28) 4px 6px)':'')+'"></i>';
  return'<div class="ut-bar" role="img">'+(r.u?seg(r.u,USE[0][3]):'')+(r.n?seg(r.n,USE[1][3]):'')+(r.w?seg(r.w,USE[2][3]):'')+(r.x?seg(r.x,'#6b7280',1):'')+'</div>'}
function slim(){const r=range('d');if(!r.days||(r.u+r.n+r.w+r.x)<=0)return'';
  return'<div class="ut ut-s" data-a="ut_open" role="button" tabindex="0">'+bar(r)+'<div class="ut-t"><span>✅ '+mm(r.u)+'</span><span>🟠 '+mm(r.w)+'</span><span>🕳 '+mm(r.x)+'</span><span class="m">'+T('وقت مفید','Useful time')+' ›</span></div></div>'}
let RK='d';
function full(k){k=k||RK;const r=range(k),L=[['u',r.u],['n',r.n],['w',r.w]],tot=r.u+r.n+r.w+r.x;
  const chips=[['d',T('امروز','Today')],['w',T('۷ روز','7 days')],['m',T('۳۰ روز','30 days')]].map(x=>'<button class="chip'+(k===x[0]?' on':'')+'" data-a="ut_rk" data-v="'+x[0]+'">'+x[1]+'</button>').join('');
  let h='<div class="c ut-f"><div class="row" style="align-items:center"><h3 style="flex:1;margin:0">⏱ '+T('وقت مفید و اتلاف','Useful vs wasted time')+'</h3>'+chips+'</div>';
  if(!r.days||tot<=0)return h+'<p class="m">'+T('هنوز ثبتی در این بازه نیست.','No logs in this range yet.')+'</p></div>';
  h+=bar(r)+'<div class="ut-rows">'+USE.map((u,i)=>'<div class="ut-r"><span style="color:'+u[3]+'">'+u[1]+'</span><span style="flex:1">'+u[2]+'</span><b>'+mm(L[i][1])+'</b><span class="m">'+fa(pct(L[i][1],tot))+'٪</span></div>').join('')
   +'<div class="ut-r"><span>🕳</span><span style="flex:1">'+T('ثبت‌نشده (سوخته)','Unlogged (burned)')+'</span><b>'+mm(r.x)+'</b><span class="m">'+fa(pct(r.x,tot))+'٪</span></div></div>';
  const lose=r.w+r.x,per=r.days?lose/r.days:0,gain=Math.round(per*0.3);
  if(lose>0)h+='<div class="ut-if">💡 '+T('اگر ۳۰٪ از اتلاف و ثبت‌نشده مفید شود: ','If 30% of wasted + unlogged became useful: ')+'<b>+'+mm(gain*7)+T(' در هفته',' per week')+'</b> ('+T('≈ ','≈ ')+mm(gain*30)+T(' در ماه',' per month')+')</div>';
  const top=Object.entries(r.top).sort((a,b)=>b[1]-a[1]).slice(0,3);
  if(top.length)h+='<div class="m" style="margin-top:6px">'+T('بیشترین اتلاف: ','Most wasted: ')+top.map(x=>esc(aN(x[0]))+' '+mm(x[1])).join(' · ')+'</div>';
  h+='<p class="m" style="margin-top:6px">'+T('ثبت‌نشده = ساعت‌های بیداری منهای ثبت‌ها؛ روزهای بدون هیچ ثبت حساب نمی‌شوند. نقش هر فعالیت را در ویرایش فعالیت عوض کن.','Unlogged = waking hours minus logs; days with no logs are ignored. Change an activity’s role in its edit form.')+'</p>';
  if(k==='d'&&window.daniCheckin&&r.x>=15)h+='<div class="row" style="margin-top:6px"><button class="chip" data-a="ut_fill">🕳 '+T('ثبت آخرین بازه‌ی خالی','Log the last gap')+'</button></div>';
  return h+'</div>'}
H.ut_open=()=>{modal('<div style="max-width:440px">'+full('d')+'</div><div class="row" style="margin-top:10px"><button class="p" data-a="cl">'+T('تمام','Done')+'</button></div>')};
H.ut_rk=e=>{RK=e.dataset.v;const box=e.closest('.ut-f');if(box){const t=document.createElement('div');t.innerHTML=full(RK);box.replaceWith(t.firstElementChild)}};
H.ut_fill=()=>{try{closeM()}catch(x){}try{window.daniCheckin.open()}catch(x){}};
/* تزریق در صفحه‌ها */
function inject(){try{if(document.querySelector('.ut-s'))return;const hd=[...document.querySelectorAll('.c h3,.c summary')];
  if(page==='home'||page==='day'){const c=hd.map(h=>h.closest('.c')).find(c=>c&&/Result|نتیجه‌ی امروز/.test(c.querySelector('h3,summary').textContent)&&!c.closest('.ut'));if(c){const s=slim();if(s)c.insertAdjacentHTML('beforeend',s)}}
  else if(page==='plan2'){const st=document.querySelector('.p2st');if(st&&!document.querySelector('.ut')){const s=slim();if(s)st.insertAdjacentHTML('afterend',s)}}}catch(e){console.error('usetime',e)}}
{const _r=render;render=function(){const r=_r.apply(this,arguments);inject();return r}}
{const _g=PG.res;PG.res=function(){let h=_g.apply(this,arguments);try{if((rt==='eod'||rt==='rep')&&typeof h==='string'){const f=full(rt==='rep'?'w':'d');h=/<div class="row np tabs">.*?<\/div>/.test(h)?h.replace(/(<div class="row np tabs">.*?<\/div>)/,'$1'+f):f+h}}catch(e){console.error('usetime res',e)}return h}}
/* نقش فعالیت در فرم */
{const _af=actForm;actForm=function(id){_af.apply(this,arguments);try{const a=act(id)||{};const b=document.querySelector('[data-a="asave"]');if(b&&!document.getElementById('fuse')){const cur=a.use||'';const html='<label style="margin-top:8px">'+T('نقش این فعالیت در وقت‌سنجی','Role of this activity in time analysis')+'</label><select id="fuse"><option value="">'+T('خودکار','Automatic')+'</option><option value="u"'+(cur==='u'?' selected':'')+'>✅ '+USE[0][2]+'</option><option value="n"'+(cur==='n'?' selected':'')+'>🧩 '+USE[1][2]+'</option><option value="w"'+(cur==='w'?' selected':'')+'>🟠 '+USE[2][2]+'</option><option value="s"'+(cur==='s'?' selected':'')+'>🌙 '+T('خواب','Sleep')+'</option></select>';b.parentElement.insertAdjacentHTML('beforebegin',html)}}catch(e){}}}
{const _as=H.asave;H.asave=function(e){const s=document.getElementById('fuse'),v=s?s.value:null,id=e&&e.dataset&&e.dataset.id,before=db.acts.length;const r=_as.apply(this,arguments);try{if(v!==null){const a=id?act(id):db.acts[db.acts.length-1];if(a&&(id||db.acts.length>before)){if(v)a.use=v;else delete a.use;save()}}}catch(x){}return r}}
const css=document.createElement('style');
css.textContent='.ut{margin-top:10px}.ut-s{cursor:pointer}.ut-bar{display:flex;height:10px;border-radius:10px;overflow:hidden;background:var(--b,#8883);gap:2px}.ut-bar i{display:block;min-width:3px;animation:utg .8s ease-out}.ut-t{display:flex;gap:12px;flex-wrap:wrap;margin-top:5px;font-size:.88em;align-items:center}.ut-t .m{margin-inline-start:auto}'
 +'.ut-rows{margin-top:8px}.ut-r{display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid var(--b,#8882)}.ut-if{margin-top:10px;padding:8px 10px;border-radius:10px;background:color-mix(in srgb,#22a38a 14%,transparent)}@keyframes utg{from{flex-grow:0!important;opacity:0}}@media (prefers-reduced-motion:reduce){.ut-bar i{animation:none!important}}';
document.head.appendChild(css);
window.daniUseTime={calc,range,cls,full,slim};
})();
