/* امتیازدهی سریع و اختیاری بعد از هر ثبت (v63): انرژی، حس، موفقیت، درصد دقت.
   روی ثبت ذخیره می‌شود: e.rt={en,fe,su,ac}. تنظیم: db.set.qr={on,f:[...]} . کارت میانگین‌ها در نتیجه ← آمار. بعد از settings2.js و results2.js بارگذاری شود. */
(function(){'use strict';
const T=window.daniT;
const FD=[['en','🔋',T('انرژی','Energy'),['1','2','3','4','5']],['fe','🙂',T('حس','Feeling'),['😫','😕','😐','🙂','🤩']],['su','⭐',T('موفقیت','Success'),['1','2','3','4','5']],['ac','🎯',T('دقت','Accuracy'),['50%','70%','90%','100%'],[50,70,90,100]]];
const cfg=()=>{const q=db.set.qr||(db.set.qr={});if(!Array.isArray(q.f))q.f=['en','fe','su'];if(q.on===undefined)q.on=true;return q};
const seen=new Set(db.entries.map(e=>e.id));let tm=0;
const SKIP=/^(csv|import|sample|smp)/;
function scan(){const nw=db.entries.filter(e=>!seen.has(e.id));nw.forEach(e=>seen.add(e.id));
  if(!nw.length||nw.length>2||!cfg().on)return;const e=nw[nw.length-1];
  if(SKIP.test(e.src||'')||/^smp/.test(e.id)||!(e.min>=1))return;setTimeout(()=>show(e.id),500)}
function show(id){const e=db.entries.find(x=>x.id===id);if(!e)return;hide();
  const q=cfg(),fs=FD.filter(f=>q.f.includes(f[0]));if(!fs.length)return;
  const d=document.createElement('div');d.id='qrs';d.className='c';d.setAttribute('dir',window.daniDir?window.daniDir():document.documentElement.dir||'rtl');
  d.style.cssText='position:fixed;inset-inline:10px;bottom:76px;z-index:9000;max-width:420px;margin-inline:auto;box-shadow:0 8px 30px #0008;animation:qrup .35s ease-out';
  d.innerHTML='<div class="row" style="align-items:center;flex-wrap:nowrap"><b style="flex:1">'+T('ثبت شد','Logged')+' · '+(typeof mm==='function'?mm(e.min):e.min)+' · '+esc(aN(e.actId))+'</b><button class="chip" data-qr="x" aria-label="close">✕</button></div>'
   +fs.map(f=>'<div class="row" style="align-items:center;gap:4px;margin-top:6px;flex-wrap:nowrap"><span style="min-width:62px" class="m">'+f[1]+' '+f[2]+'</span><span class="row" style="gap:4px;flex:1">'+f[3].map((l,i)=>{const v=f[4]?f[4][i]:i+1;return'<button class="chip'+(e.rt&&e.rt[f[0]]===v?' on':'')+'" data-qr="'+f[0]+'" data-v="'+v+'" style="flex:1;padding:6px 2px">'+l+'</button>'}).join('')+'</span></div>').join('');
  d.dataset.id=id;document.body.appendChild(d);arm()}
function arm(){clearTimeout(tm);tm=setTimeout(hide,14000)}
function hide(){const d=document.getElementById('qrs');if(d)d.remove();clearTimeout(tm)}
document.addEventListener('click',ev=>{const b=ev.target.closest&&ev.target.closest('[data-qr]');if(!b)return;const d=document.getElementById('qrs');if(!d)return;
  const k=b.dataset.qr;if(k==='x')return hide();const e=db.entries.find(x=>x.id===d.dataset.id);if(!e)return hide();
  e.rt=e.rt||{};const v=+b.dataset.v;if(e.rt[k]===v)delete e.rt[k];else e.rt[k]=v;
  d.querySelectorAll('[data-qr="'+k+'"]').forEach(x=>x.classList.toggle('on',+x.dataset.v===e.rt[k]));save();arm()},true);
{const _s=save;save=function(){const r=_s.apply(this,arguments);try{scan()}catch(e){}return r}}
/* میانگین‌ها */
function stats(){const to=todayISO(),from=addD(to,-29),L=db.entries.filter(e=>e.rt&&e.date>=from&&e.date<=to);if(!L.length)return'';
  const avg=k=>{const v=L.filter(e=>e.rt[k]!=null).map(e=>e.rt[k]);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null};
  const bar=(k,f)=>{const a=avg(k);if(a==null)return'';const mx=k==='ac'?100:5,p=Math.round(a/mx*100);return'<div class="row" style="align-items:center;gap:8px;flex-wrap:nowrap;margin-top:6px"><span style="min-width:74px" class="m">'+f[1]+' '+f[2]+'</span><div class="bar" style="flex:1"><i style="width:'+p+'%"></i></div><b>'+fa(k==='ac'?Math.round(a)+'%':a.toFixed(1))+'</b></div>'};
  const by={};L.forEach(e=>{if(e.rt.su==null)return;const o=by[e.actId]||(by[e.actId]={s:0,n:0,m:0});o.s+=e.rt.su;o.n++;o.m+=e.min});
  const top=Object.entries(by).filter(x=>x[1].n>=2).sort((a,b)=>b[1].s/b[1].n-a[1].s/a[1].n).slice(0,4);
  return'<div class="c"><h3>'+T('حس و دقت ثبت‌ها (۳۰ روز)','Feeling & accuracy of logs (30 days)')+'</h3>'+FD.map(f=>bar(f[0],f)).join('')+'<p class="m" style="margin-top:6px">'+fa(L.length)+T(' ثبت امتیازدار',' rated logs')+'</p>'
   +(top.length?'<div class="m" style="margin-top:4px">'+T('بهترین فعالیت‌ها از نظر موفقیت: ','Best activities by success: ')+top.map(x=>esc(aN(x[0]))+' '+fa((x[1].s/x[1].n).toFixed(1))).join(' · ')+'</div>':'')+'</div>'}
const _res=PG.res;PG.res=function(){let h=_res.apply(this,arguments);try{if(rt==='stats'&&typeof h==='string')h+=stats()}catch(e){console.error('qr',e)}return h};
/* تنظیمات */
function card(){if(document.getElementById('qrc'))return;const ntc=document.getElementById('ntc');if(!ntc)return;const q=cfg();
  const b=document.createElement('div');b.className='c';b.id='qrc';
  b.innerHTML='<h3>⭐ '+T('امتیاز سریع بعد از ثبت','Quick rating after logging')+'</h3><p class="m">'+T('بعد از هر ثبت یک پنل کوچک و بی‌مزاحمت می‌آید؛ هر چه خواستی بزن، یا نادیده بگیر تا خودش بسته شود.','A small unobtrusive panel appears after each log; tap what you like or ignore it and it closes itself.')+'</p>'
   +'<label class="row" style="align-items:center;gap:8px"><input type="checkbox" data-qs="on"'+(q.on?' checked':'')+'> '+T('روشن','On')+'</label>'
   +'<div class="row" style="gap:10px;margin-top:6px">'+FD.map(f=>'<label class="row" style="align-items:center;gap:4px"><input type="checkbox" data-qs="'+f[0]+'"'+(q.f.includes(f[0])?' checked':'')+'> '+f[1]+' '+f[2]+'</label>').join('')+'</div>';
  ntc.parentNode.insertBefore(b,ntc.nextSibling)}
document.addEventListener('change',ev=>{const c=ev.target&&ev.target.dataset&&ev.target.dataset.qs;if(!c)return;const q=cfg();if(c==='on')q.on=ev.target.checked;else{q.f=q.f.filter(x=>x!==c);if(ev.target.checked)q.f.push(c)}save()});
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{if(page==='set'&&stt==='time')card()}catch(e){}return r}}
const st=document.createElement('style');st.textContent='@keyframes qrup{from{opacity:0;transform:translateY(20px)}}@media (prefers-reduced-motion:reduce){#qrs{animation:none!important}}';document.head.appendChild(st);
window.daniQR={show,hide,stats};
})();
