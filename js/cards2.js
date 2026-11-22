"use strict";
/* DANI · cards2.js (v162) — مرور فلش‌کارت انکی‌وار: نوار شمارنده (جدید/یادگیری/مرور)، فاصله‌ی بعدیِ هر دکمه (دقیقه/روز/ماه/سال)،
   «دوباره» = برگشت همان روز (۱۰ دقیقه)، برگشت (undo)، پرچم، منوی ⋮ (املا، خواندن خودکار، سقف کارت جدید، فارسی با لمس دوم، ویرایش/حذف)،
   کارت لغت (فقط لغت+صدا ← IPA، معنی انگلیسی، فارسی، عکس، مثال). قبلی‌ها (تلفظ، املا، جای‌خالی {{…}}، سقف کارت جدید) می‌مانند.
   بعد از academy.js و acd4.js بارگذاری می‌شود و فقط نمای «صف مرور» و فرم کارت را گسترش می‌دهد. */
(function(){'use strict';
const T=window.daniT||function(a){return a};
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const latin=s=>/[A-Za-z]{2}/.test(String(s||''))&&!/[؀-ۿ]/.test(String(s||''));
const st={spell:false,res:null,typed:'',menu:false,fa:false,undo:[],force:''};
const hasTTS=()=>{try{return typeof speechSynthesis!=='undefined'&&typeof SpeechSynthesisUtterance!=='undefined'}catch(e){return false}};
function speak(text,slow){if(!hasTTS()){toast(T('این گوشی/مرورگر صدای خواندن ندارد','No speech support on this device'),1);return}
 try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(String(text).replace(/\{\{|\}\}/g,''));const en=latin(text);u.lang=en?'en-US':'fa-IR';u.rate=slow?.6:.9;
  const v=(speechSynthesis.getVoices()||[]).find(x=>x.lang&&x.lang.toLowerCase().startsWith(en?'en':'fa'));if(v)u.voice=v;
  else if(en&&speechSynthesis.getVoices().length)toast(T('صدای انگلیسی روی گوشی نصب نیست (تنظیمات گوشی ← متن به گفتار)','No English voice installed (phone settings → text-to-speech)'),1);
  speechSynthesis.speak(u)}catch(e){console.error(e)}}
const snd=b=>b?'<button class="chip sm" data-a="c2_say" data-t="'+E(b)+'" aria-label="listen">🔊</button><button class="chip sm" data-a="c2_say" data-s="1" data-t="'+E(b)+'" aria-label="slow">🐢</button>':'';
const norm=s=>String(s||'').toLowerCase().replace(/[’‘`´]/g,"'").replace(/[.!?,;:"]+/g,' ').replace(/\s+/g,' ').trim();
const cloze=c=>/\{\{.+?\}\}/.test(c.q);
const front=c=>cloze(c)?c.q.replace(/\{\{.+?\}\}/g,'［ … ］'):c.q;
const back=c=>cloze(c)?c.q.replace(/\{\{(.+?)\}\}/g,'«$1»')+(c.a&&c.a.trim()?'\n'+c.a:''):c.a;
const spellText=c=>cloze(c)?null:(latin(c.a)&&c.a.length<=60?c.a:(latin(c.q)&&c.q.length<=60?c.q:null));
const nl=()=>{const A=zAX();return A.nl==null?20:+A.nl};
const isNew=c=>!(c.reps||c.ivl||c.lap||c.dt);
function nlc(){const A=zAX(),t=todayISO();if(!A.nlc||A.nlc.d!==t)A.nlc={d:t,n:0};return A.nlc}
/* ===== زمان‌بندی: «دوباره» همان روز (۱۰ دقیقه)، «سخت» برای کارت تازه ۳۰ دقیقه، سقف ۳۶۵ روز برداشته شد ===== */
const MIN=60000;
srsNext=function(c,q){const t=todayISO(),now=Date.now();let ease=+c.ease||2.5,ivl=+c.ivl||0,reps=+c.reps||0,lap=+c.lap||0,dt=0,ag=c.ag||'';
 const good=()=>reps===0?1:reps===1?3:Math.max(ivl+1,Math.round(ivl*ease));
 if(q==='again'){reps=0;lap++;ease=Math.max(1.3,ease-.2);ivl=0;dt=now+10*MIN;ag=t}
 else if(q==='hard'&&reps===0){ivl=0;dt=now+30*MIN;ag=t}
 else if(q==='hard'){ivl=Math.max(ivl+1,Math.round(ivl*1.2));ease=Math.max(1.3,ease-.15);reps++}
 else if(q==='good'){ivl=good();reps++}
 else{const g=good();ivl=reps===0?3:Math.max(g+1,Math.round(Math.max(ivl,1)*ease*1.3));ease+=.15;reps++}
 ivl=Math.min(3650,ivl);return{ease:+ease.toFixed(2),ivl,reps,lap,due:dt?t:addD(t,ivl),dt,ag,last:t}};
function lbl(c,q){const o=srsNext(c,q);
 if(o.dt){const m=Math.max(1,Math.round((o.dt-Date.now())/MIN));return(q==='again'?'<':'')+fa(m)+' '+T('دقیقه','min')}
 const d=o.ivl;if(d<30)return fa(d)+' '+T('روز','d');if(d<365)return fa(+(d/30.4).toFixed(1))+' '+T('ماه','mo');return fa(+(d/365).toFixed(1))+' '+T('سال','y')}
/* ===== صف: سقف کارت جدید روزانه + کارت‌های «یادگیری» که هنوز وقتشان نرسیده آخر صف می‌آیند ===== */
const _due=srsDue;
srsDue=function(){const l=_due(),lim=nl(),now=Date.now();let left=lim?Math.max(0,lim-nlc().n):1e9;
 const f=l.filter(c=>{if(!isNew(c))return true;if(left>0){left--;return true}return false}),rd=[],wt=[];f.forEach(c=>(c.dt&&c.dt>now?wt:rd).push(c));return rd.concat(wt)};
function cur(){if(st.force){const c=zAX().cards.find(x=>x.id===st.force);if(c&&srsOk(c))return c}return srsDue()[0]}
const CRs=()=>{try{return window.daniCourses&&window.daniCourses.state}catch(e){return null}};
const isLang=c=>{try{const C=CRs(),k=C&&c.cid&&C.ix.courses.get(c.cid);return !!k&&k.kind==='language'}catch(e){return false}};
const isWord=c=>!cloze(c)&&latin(c.q)&&!!(c.ipa||c.pos||c.def||c.fa||c.split||c.syn||c.mn||(c.ex&&c.ex.length)||isLang(c));
const IMGOK=/^(https:\/\/[^\s"'<>]{4,500}|data:image\/(?:png|jpe?g|webp|gif);base64,[A-Za-z0-9+\/=]{20,60000})$/i;
const FLAG=['','#ef4444','#f59e0b','#34d399','#60a5fa'];
function reset(){st.res=null;st.typed='';st.fa=false;st.menu=false}
const _show=zMA.acd.show;
zMA.acd.show=function(){const c=cur();st.fa=false;st.menu=false;if(c&&zAX().snd){const s=spellText(c);if(s)speak(s)}return _show.apply(this,arguments)};
zMA.acd.rate=function(q){const A=zAX(),c=cur();if(!c||!['again','hard','good','easy'].includes(q))return;
 const nw=isNew(c),snap={id:c.id,nw,day:todayISO(),f:{ease:c.ease,ivl:c.ivl,reps:c.reps,lap:c.lap,due:c.due,ag:c.ag,last:c.last,dt:c.dt||0}};
 Object.assign(c,srsNext(c,q));const t=todayISO();A.rl[t]=(A.rl[t]||0)+1;Object.keys(A.rl).sort().slice(0,-120).forEach(k=>delete A.rl[k]);
 if(nw)nlc().n++;st.undo.push(snap);if(st.undo.length>20)st.undo.shift();st.force='';reset();AR.show=false;zcommit()};
const counts=d=>{let n=0,l=0,r=0;d.forEach(c=>{if(isNew(c))n++;else if(c.dt)l++;else r++});return[n,l,r]};
function bar(d){const k=counts(d),A=zAX(),c=cur(),fl=c&&c.flag?FLAG[c.flag]:'';
 return'<div class="c2bar"><div class="c2cnt"><span style="color:#60a5fa"><b>'+fa(k[0])+'</b><small>'+T('جدید','New')+'</small></span><span style="color:#ef4444"><b>'+fa(k[1])+'</b><small>'+T('یادگیری','Learning')+'</small></span><span style="color:#34d399"><b>'+fa(k[2])+'</b><small>'+T('مرور','Review')+'</small></span></div>'
  +'<div class="c2ic"><button class="chip sm" data-a="c2_undo" '+(st.undo.length?'':'disabled style="opacity:.35" ')+'aria-label="undo" title="'+T('برگشت','Undo')+'">↩</button><button class="chip sm" data-a="c2_flag" aria-label="flag" title="'+T('پرچم','Flag')+'" style="'+(fl?'color:'+fl:'')+'">⚑</button><button class="chip sm '+(st.menu?'on':'')+'" data-a="c2_menu" aria-label="menu">⋮</button></div></div>'}
function menu(c){const A=zAX();if(!st.menu)return'';return'<div class="c2menu">'+ctl()+'<div class="row" style="flex-wrap:wrap;margin:6px 0"><button class="chip sm '+(A.ft?'on':'')+'" data-a="c2_ft">🇮🇷 '+T('فارسی با یک لمس دیگر','Persian on a second tap')+'</button><button class="chip sm" data-a="c2_edit">✎ '+T('ویرایش کارت','Edit card')+'</button><button class="chip sm" data-a="c2_del">🗑 '+T('حذف کارت','Delete card')+'</button></div></div>'}
function wordBack(c){const A=zAX(),fa0=c.fa||c.a,ex=c.ex||[],gate=A.ft&&c.def&&!st.fa;
 let h='<div class="aca c2back">'+(c.ipa?'<div class="c2ipa" dir="ltr">'+E(c.ipa)+'</div>':'');
 if(c.def||c.pos)h+='<div class="c2def" dir="ltr">'+(c.pos?'<b>'+E(c.pos)+'</b> ':'')+E(c.def||'')+'</div>';
 h+=gate?'<button class="chip" data-a="c2_fa">'+T('نمایش معنی فارسی','Show Persian')+'</button>':(fa0?'<div class="c2fa" dir="auto">'+E(fa0).replace(/\n/g,'<br>')+'</div>':'');
 if(!gate){if(c.img&&IMGOK.test(c.img))h+='<img class="c2img" loading="lazy" referrerpolicy="no-referrer" alt="" src="'+E(c.img)+'">';
  const exr=x=>'<div class="c2ex" dir="ltr"><button class="chip sm" data-a="c2_say" data-t="'+E(x.en)+'" aria-label="listen">🔊</button> '+E(x.en)+(x.fa?'<i dir="auto">'+E(x.fa)+'</i>':'')+'</div>';
  if(ex.length)h+=exr(ex[0])+(ex.length>1?'<details class="c2more"><summary>'+T('مثال‌های بیشتر','More examples')+' ('+fa(ex.length-1)+')</summary>'+ex.slice(1).map(exr).join('')+'</details>':'');
  const fr=(ic,lb,v,rtl)=>v?'<div class="c2fld" dir="'+(rtl?'auto':'ltr')+'"><b>'+ic+' '+lb+'</b> '+E(v)+'</div>':'';
  h+=fr('🧩',T('اجزا','Parts'),c.split)+fr('≈',T('مترادف','Synonyms'),c.syn)+fr('≠',T('متضاد','Antonyms'),c.ant)+fr('👪',T('خانواده','Family'),c.fam)+fr('🔗',T('هم‌نشین','Collocations'),c.col)+fr('💡',T('یادیار','Memory aid'),c.mn,1);
  if(c.x)h+='<div class="m" style="margin-top:8px" dir="auto">'+E(c.x)+'</div>'}
 return h+'</div>'}
acdReview=function(){const A=zAX(),t=todayISO(),d=srsDue(),dn=A.rl[t]||0;
 if(!A.cards.length)return'<div class="c"><h3>'+BH('Review Queue','صف مرور')+'</h3><p>هنوز فلش‌کارتی نداری. هر چیزی که باید «به یاد بماند» را به‌صورت پرسش و پاسخ بنویس تا برنامه در زمان درست یادآوری کند.</p>'+mBtn('acd:tab:cards','ساخت اولین فلش‌کارت','p')+'</div>';
 if(!d.length){const nx=A.cards.filter(srsOk).map(c=>c.due).sort()[0],hid=_due().length-d.length;return'<div class="c"><h3>'+BH('Review Queue','صف مرور')+'</h3><p class="hst ok">امروز چیزی برای مرور نمانده ✓ '+(dn?fa(dn)+' کارت مرور کردی.':'')+'</p>'+(hid>0?'<p class="m">'+fa(hid)+' '+T('کارت جدید به‌خاطر سقف روزانه برای فردا مانده','new cards wait for tomorrow (daily cap)')+'</p>':'')+(nx?'<p class="m">مرور بعدی: '+fmtD(nx)+'</p>':'')+(st.undo.length?'<button class="chip sm" data-a="c2_undo">↩ '+T('برگشت','Undo')+'</button>':'')+ctl()+'</div>'}
 const c=cur(),sp=spellText(c),spOn=st.spell&&sp,wd=isWord(c);
 let h='<div class="c acrv"><h3>'+BH('Review Queue','صف مرور')+'</h3>'+bar(d)+'<div class="m">'+T('امروز','Today')+' '+fa(dn)+' '+T('مرور شد','reviewed')+(c.deck?' · <span class="badge">'+E(c.deck)+'</span>':'')+'</div>'+menu(c);
 h+='<div class="c2card">';
 if(wd)h+='<div class="c2w" dir="ltr">'+E(c.q)+'</div><div class="row" style="justify-content:center">'+snd(c.q)+'</div>';
 else h+='<div class="acq">'+E(front(c)).replace(/\n/g,'<br>')+'</div><div class="row" style="justify-content:center">'+snd(latin(c.q)&&!cloze(c)?c.q:'')+'</div>';
 if(spOn&&!AR.show){h+='<p class="m" style="text-align:center">'+T('کلمه را بشنو و بنویس','Listen and type it')+'</p><div class="row" style="justify-content:center">'+snd(sp)+'</div><input id="c2-sp" dir="ltr" autocapitalize="off" autocomplete="off" spellcheck="false" style="width:100%;text-align:center;font-size:18px" placeholder="…"><div class="row" style="margin-top:8px"><button class="p" data-a="c2_chk">'+T('بررسی','Check')+'</button><button data-m="acd:show">'+T('نمی‌دانم، پاسخ را نشان بده','Show answer')+'</button></div></div></div>';return h}
 if(!AR.show)return h+'</div><button class="p acshow" data-m="acd:show">نمایش پاسخ</button></div>';
 if(spOn&&st.res)h+='<p class="hst '+(st.res==='ok'?'ok':'')+'" style="text-align:center">'+(st.res==='ok'?'✓ '+T('درست نوشتی','Correct'):'✗ '+T('نوشتهٔ تو: ','You typed: ')+'<bdi dir="ltr">'+E(st.typed)+'</bdi>')+'</p>';
 if(wd)h+=wordBack(c);
 else h+='<div class="aca">'+E(back(c)).replace(/\n/g,'<br>')+(c.x?'<div class="m" style="margin-top:8px" dir="auto">'+E(c.x)+'</div>':'')+'</div><div class="row" style="justify-content:center">'+snd(latin(c.a)&&!cloze(c)?c.a:(sp||''))+'</div>';
 h+='</div>';
 const sug=spOn&&st.res?(st.res==='ok'?'good':'again'):'';
 h+='<div class="acbtns">'+[['again','دوباره','#ef4444'],['hard','سخت','#f59e0b'],['good','خوب','#34d399'],['easy','آسان','#60a5fa']].map(x=>'<button class="acb" style="--c:'+x[2]+(sug===x[0]?';outline:3px solid '+x[2]:'')+'" data-m="acd:rate:'+x[0]+'">'+T(x[1],{again:'Again',hard:'Hard',good:'Good',easy:'Easy'}[x[0]])+'<small>'+lbl(c,x[0])+'</small></button>').join('')+'</div><p class="m">اگر پاسخ را بلد نبودی «دوباره» بزن؛ اشتباه کردن یعنی کارت دارد کارش را می‌کند.</p></div>';
 return h};
function ctl(){const A=zAX();return'<div class="row" style="flex-wrap:wrap;margin:6px 0"><button class="chip sm '+(st.spell?'on':'')+'" data-a="c2_spell">✍ '+T('حالت املا','Spelling mode')+'</button><button class="chip sm '+(A.snd?'on':'')+'" data-a="c2_snd">🔊 '+T('خواندن خودکار پاسخ','Auto-speak answer')+'</button><button class="chip sm" data-a="c2_nl">🆕 '+T('کارت جدید امروز','New today')+': '+fa(nlc().n)+'/'+(nl()||'∞')+' ✎</button></div>'}
H.c2_say=e=>speak(e.dataset.t,!!e.dataset.s);
H.c2_spell=()=>{st.spell=!st.spell;st.res=null;AR.show=false;render()};
H.c2_snd=()=>{const A=zAX();A.snd=!A.snd;zcommit()};
H.c2_ft=()=>{const A=zAX();A.ft=!A.ft;st.fa=false;zcommit()};
H.c2_fa=()=>{st.fa=true;render()};
H.c2_menu=()=>{st.menu=!st.menu;render()};
H.c2_flag=()=>{const c=cur();if(!c)return;c.flag=((c.flag||0)+1)%FLAG.length;zcommit()};
H.c2_edit=()=>{const c=cur();if(c)zMA.acd.cedit(c.id)};
H.c2_del=()=>{const c=cur();if(c){st.force='';zMA.acd.cdel(c.id)}};
H.c2_undo=()=>{const A=zAX(),s=st.undo.pop();if(!s)return;const c=A.cards.find(x=>x.id===s.id);if(!c)return;Object.assign(c,s.f);if(!c.dt)c.dt=0;
 if(A.rl[s.day])A.rl[s.day]=Math.max(0,A.rl[s.day]-1);if(s.nw&&A.nlc&&A.nlc.d===s.day)A.nlc.n=Math.max(0,A.nlc.n-1);
 st.force=c.id;reset();AR.show=false;zcommit()};
H.c2_nl=()=>{const v=prompt(T('حداکثر کارت جدید در روز (۰ = بدون سقف):','Max new cards per day (0 = unlimited):'),String(nl()));if(v===null)return;const n=Math.max(0,Math.min(500,parseInt(v,10)||0));zAX().nl=n;zcommit()};
H.c2_chk=()=>{const c=cur(),i=document.getElementById('c2-sp');if(!c||!i)return;const s=spellText(c);st.typed=i.value;st.res=norm(i.value)===norm(s)?'ok':'bad';AR.show=true;if(zAX().snd)speak(s);render()};
/* فرم کارت: «مثال / تلفظ» + بخش اختیاری «کارت لغت» */
const _cards=acdCards;
acdCards=function(){let h=_cards();const inp=(id,l,ph)=>'<label>'+l+'</label><input id="'+id+'" dir="auto" style="width:100%" placeholder="'+E(ph||'')+'">';
 const x='<label>'+T('مثال یا تلفظ (اختیاری، زیر پاسخ دیده می‌شود)','Example / pronunciation (optional)')+'</label><input id="ac-x" maxlength="200" dir="auto" style="width:100%"><p class="m">'+T('نکته: برای کارت جای‌خالی، کلمهٔ پنهان را داخل {{ }} بنویس؛ مثلاً: He {{went}} home.','Tip: for a cloze card put the hidden word in {{ }}, e.g. He {{went}} home.')+'</p>'
  +'<details class="ckd"><summary>'+T('کارت لغت (اختیاری): IPA، معنی انگلیسی، فارسی، مثال','Word card (optional): IPA, English meaning, Persian, example')+'</summary>'+inp('ac-ipa','IPA','/əˈbændən/')+inp('ac-pos',T('نوع کلمه','Part of speech'),'v. / n. / adj.')+inp('ac-def',T('معنی انگلیسی','English meaning'),'to leave completely')+inp('ac-fa',T('معنی فارسی','Persian meaning'),'')+inp('ac-e1',T('مثال انگلیسی','Example (English)'),'He abandoned the plan.')+inp('ac-e1f',T('ترجمهٔ مثال','Example translation'),'')+inp('ac-split',T('اجزای کلمه','Word parts'),'ab- + andon')+inp('ac-syn',T('مترادف‌ها','Synonyms'),'desert, leave')+inp('ac-ant',T('متضادها','Antonyms'),'keep, retain')+inp('ac-fam',T('خانوادهٔ کلمه','Word family'),'abandonment (n), abandoned (adj)')+inp('ac-col',T('هم‌نشین‌ها','Collocations'),'abandon hope, abandon ship')+inp('ac-mn',T('یادیار','Memory aid'),'')+'<p class="m">'+T('برای کارت لغت، «پرسش» را همان کلمهٔ انگلیسی بنویس.','For a word card, write the English word as the question.')+'</p></details>';
 const i=h.indexOf('<div class="row" style="margin-top:8px">');return i>0?h.slice(0,i)+x+h.slice(i):h};
const _add=zMA.acd.addcard;
zMA.acd.addcard=function(){const A=zAX(),n=A.cards.length,g=id=>((document.getElementById(id)||{}).value||'').trim(),x=g('ac-x'),f={ipa:g('ac-ipa'),pos:g('ac-pos'),def:g('ac-def'),fa:g('ac-fa'),split:g('ac-split'),syn:g('ac-syn'),ant:g('ac-ant'),fam:g('ac-fam'),col:g('ac-col'),mn:g('ac-mn')},e1=g('ac-e1'),e1f=g('ac-e1f');
 _add.apply(this,arguments);if(A.cards.length>n){const c=A.cards[A.cards.length-1];if(x)c.x=x.slice(0,200);
  const w=window.daniAcd4&&window.daniAcd4.wf?window.daniAcd4.wf(Object.assign(f,e1?{ex:[{en:e1,fa:e1f}]}:{})):{};Object.assign(c,w);zcommit()}};
window.daniCards2={speak,norm,spellText,lbl,isWord,cur};
})();
