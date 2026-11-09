/* مسیریابی دقیق اعلان‌ها (v82): لمس اعلان → دقیقاً همان صفحه/آیتم باز می‌شود، آیتم برجسته و وسط صفحه می‌آید، و یک نوار کوچک «🔔 …» با ✕ می‌ماند.
   بعد از آن آزادی: کار را انجام بده، ✕ بزن، یا هر جای دیگر برو. `daniNotifRoute(k, notification)` از tomorrow.js `route()` صدا زده می‌شود؛ true یعنی رسیدگی شد.
   کلیدها: `<id>|<تاریخ>|<گام>` یادآوری/عادت/موعد، rh-pl-/tp-rep- برنامه‌ی فردا، eod- نتیجه‌ی روز، chk- چک‌این، rh-sk- زنجیره، rh-wk-/wk-sum- گزارش هفته، bk-nag- پشتیبان، nx- «بعدی چیست؟»، rmn- باقی‌مانده‌ی هدف، timer-/pomo- تایمر. */
(function(){'use strict';
const T=window.daniT;
const css=document.createElement('style');css.textContent='.nrfx{outline:2px solid var(--ac,#3b82f6)!important;outline-offset:3px;border-radius:12px;box-shadow:0 0 0 8px color-mix(in srgb,var(--ac,#3b82f6) 22%,transparent)!important;animation:nrp 1.2s ease-in-out 3}@keyframes nrp{50%{box-shadow:0 0 0 14px color-mix(in srgb,var(--ac,#3b82f6) 10%,transparent)}}#nrbar{position:fixed;top:8px;inset-inline:10px;z-index:70;display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:14px;background:var(--card,#1f2937);color:var(--tx,#fff);border:1px solid var(--ac,#3b82f6);box-shadow:0 6px 24px #0006;font-size:.9rem}#nrbar b{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}';document.head.appendChild(css);
function bar(title){try{const o=document.getElementById('nrbar');if(o)o.remove();if(!title)return;const b=document.createElement('div');b.id='nrbar';b.innerHTML='<span>🔔</span><b dir="auto"></b><button class="chip" data-nr="home">🏠 '+T('خانه','Home')+'</button><button class="chip" data-nr="x" aria-label="close">✕</button>';b.querySelector('b').textContent=title;document.body.appendChild(b);
  b.addEventListener('click',e=>{const a=e.target.closest('[data-nr]');if(!a)return;if(a.dataset.nr==='home'){page='day';render();try{window.scrollTo(0,0)}catch(x){}}b.remove()});setTimeout(()=>{try{b.remove()}catch(e){}},20000)}catch(e){}}
function flash(find){let n=0;const go=()=>{let el=null;try{el=typeof find==='function'?find():document.querySelector(find)}catch(e){}
  if(el){const t=el.closest('.hrow,.dyc,.c')||el;t.classList.add('nrfx');try{t.scrollIntoView({block:'center',behavior:'smooth'})}catch(e){}
   const off=()=>{t.classList.remove('nrfx');document.removeEventListener('pointerdown',off,true)};setTimeout(off,10000);setTimeout(()=>document.addEventListener('pointerdown',off,true),700);return}
  if(++n<10)setTimeout(go,250)};setTimeout(go,200)}
const D=()=>todayISO();
const firstCard=()=>[...document.querySelectorAll('#pg .c')].find(c=>c.querySelector('h3,h2,summary,textarea,input,button')&&c.id!=='pgband'&&!c.querySelector('.hq'))||document.querySelector('#pg .c');
function toHome(sel){page='day';render();try{window.scrollTo(0,0)}catch(e){}if(sel)flash(sel)}
function remRoute(k){const id=k.split('|')[0],date=k.split('|')[1]||D();
  if(/^dl_/.test(id)){const dl=((zmg('dl',()=>({})).items)||[]).find(x=>'dl_'+x.id===id);const d=dl&&dl.dt||date;
   if(window.daniP2Go){daniP2Go('cal');if(window.daniP2Sel)daniP2Sel(d);render();flash(()=>{const t=dl&&dl.title;return t&&[...document.querySelectorAll('#pg .c')].find(c=>c.id!=='pgband'&&c.innerText.includes(t))||firstCard()})}return true}
  const r=((zmg('rem',()=>({})).items)||[]).find(x=>x.id===id);const lk=r&&r.link;
  if(lk&&lk.type==='habit'){zMS.hab.d=D();daniP2Go('hab');render();flash('#pg [data-m^="hab:set:'+lk.id+':"]');return true}
  if(lk&&lk.type==='act'){toHome('#dytr');try{H.dy_pick({dataset:{id:lk.id}})}catch(e){}flash('#dytr');return true}
  if(lk&&lk.type==='res'){page='acd';render();return true}
  /* یادآوری ساده: فهرست «آینده» و خودِ آیتم */
  zMS.rem.tab='up';zMS.rem.form=false;daniP2Go('rem');render();flash('#pg [data-m="rem:edit:'+id+'"]');return true}
function R(k,n){k=String(k||'');const title=n&&(n.body||n.title)?String(n.body||n.title).slice(0,90):'';let ok=true;
  if(k.indexOf('|')>0)remRoute(k);
  else if(/^(rh-pl-|tp-rep-)/.test(k)){const d=(window.daniTmrState&&daniTmrState.tmrDate&&daniTmrState.tmrDate())||D();daniPlanOpen(d);flash(()=>document.querySelector('#pg .tpc')||firstCard())}
  else if(/^eod-/.test(k)){page='res';rt='eod';render();try{window.scrollTo(0,0)}catch(e){}}
  else if(/^chk-/.test(k)){try{daniCheckin.open()}catch(e){}ok=true}
  else if(/^(rh-wk-|wk-sum-)/.test(k)){page='res';rt='rep';render();try{window.scrollTo(0,0)}catch(e){}flash(firstCard)}
  else if(/^dlw-/.test(k)){page='dl';render();flash(()=>document.querySelector('#pg .dlrow')||firstCard())}
  else if(/^rh-sk-/.test(k)){toHome(firstCard)}
  else if(/^bk-nag-/.test(k)){page='set';try{stt='data'}catch(e){}render();flash(()=>document.querySelector('#bkc')||document.querySelector('#pg details[id*="bk"]')||firstCard())}
  else if(/^nx-/.test(k)){toHome('#dytr')}
  else if(/^rmn-/.test(k)){toHome('#dytr')}
  else if(/^(timer|pomo)/.test(k)){toHome('#dytr')}
  else ok=false;
  if(ok)bar(title);return ok}
window.daniNotifRoute=R;
/* شروع سرد (v85): اگر برنامه با لمس اعلان از حالت بسته باز شد، کلید را از بخش بومی می‌گیریم و همان مسیر را می‌رویم (نیاز به APK نو؛ بدون آن اثری ندارد). */
function cold(){try{const dn=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.DaniNative;if(!dn||!dn.getLaunchNotif)return;
  dn.getLaunchNotif().then(r=>{if(r&&r.k&&window.daniTapRoute)window.daniTapRoute(r.k)}).catch(()=>{})}catch(e){}}
if(window.__daniBooted)setTimeout(cold,700);else document.addEventListener('dani-booted',()=>setTimeout(cold,700),{once:true});
})();
