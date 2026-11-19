"use strict";
/* DANI · cards2.js (v155) — فلش‌کارت قوی‌تر: 🔊 تلفظ با صدای گوشی، حالت املا، کارت جای‌خالی {{…}}، مثال/تلفظ زیر پاسخ،
   سقف کارت جدید روزانه. بعد از academy.js و acd4.js بارگذاری می‌شود و فقط نمای «صف مرور» و فرم کارت را گسترش می‌دهد. */
(function(){'use strict';
const T=window.daniT||function(a){return a};
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const latin=s=>/[A-Za-z]{2}/.test(String(s||''))&&!/[؀-ۿ]/.test(String(s||''));
const st={spell:false,res:null,typed:''};
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
const isNew=c=>!(c.reps||c.ivl||c.lap);
function nlc(){const A=zAX(),t=todayISO();if(!A.nlc||A.nlc.d!==t)A.nlc={d:t,n:0};return A.nlc}
/* سقف کارت جدید روزانه: srsDue را سبک‌تر می‌کند */
const _due=srsDue;
srsDue=function(){const l=_due(),lim=nl();if(!lim)return l;let left=Math.max(0,lim-nlc().n);return l.filter(c=>{if(!isNew(c))return true;if(left>0){left--;return true}return false})};
const _rate=zMA.acd.rate;
zMA.acd.rate=function(q){const c=srsDue()[0],nw=!!(c&&isNew(c)&&['again','hard','good','easy'].includes(q));st.res=null;st.typed='';const r=_rate.apply(this,arguments);if(nw){nlc().n++}return r};
const _show=zMA.acd.show;
zMA.acd.show=function(){const c=srsDue()[0];if(c&&zAX().snd){const s=spellText(c);if(s)speak(s)}return _show.apply(this,arguments)};
acdReview=function(){const A=zAX(),t=todayISO(),d=srsDue(),dn=A.rl[t]||0;
 if(!A.cards.length)return'<div class="c"><h3>'+BH('Review Queue','صف مرور')+'</h3><p>هنوز فلش‌کارتی نداری. هر چیزی که باید «به یاد بماند» را به‌صورت پرسش و پاسخ بنویس تا برنامه در زمان درست یادآوری کند.</p>'+mBtn('acd:tab:cards','ساخت اولین فلش‌کارت','p')+'</div>';
 if(!d.length){const nx=A.cards.filter(srsOk).map(c=>c.due).sort()[0],hid=_due().length-d.length;return'<div class="c"><h3>'+BH('Review Queue','صف مرور')+'</h3><p class="hst ok">امروز چیزی برای مرور نمانده ✓ '+(dn?fa(dn)+' کارت مرور کردی.':'')+'</p>'+(hid>0?'<p class="m">'+fa(hid)+' '+T('کارت جدید به‌خاطر سقف روزانه برای فردا مانده','new cards wait for tomorrow (daily cap)')+'</p>':'')+(nx?'<p class="m">مرور بعدی: '+fmtD(nx)+'</p>':'')+ctl()+'</div>'}
 const c=d[0],sp=spellText(c),spOn=st.spell&&sp;
 let h='<div class="c acrv"><h3>'+BH('Review Queue','صف مرور')+'</h3><div class="m">'+fa(d.length)+' کارت مانده · امروز '+fa(dn)+' مرور شد'+(c.deck?' · <span class="badge">'+E(c.deck)+'</span>':'')+'</div>'+ctl();
 h+='<div class="acq">'+E(front(c)).replace(/\n/g,'<br>')+'</div><div class="row" style="justify-content:center">'+snd(latin(c.q)&&!cloze(c)?c.q:'')+'</div>';
 if(spOn&&!AR.show){h+='<p class="m" style="text-align:center">'+T('کلمه را بشنو و بنویس','Listen and type it')+'</p><div class="row" style="justify-content:center">'+snd(sp)+'</div><input id="c2-sp" dir="ltr" autocapitalize="off" autocomplete="off" spellcheck="false" style="width:100%;text-align:center;font-size:18px" placeholder="…"><div class="row" style="margin-top:8px"><button class="p" data-a="c2_chk">'+T('بررسی','Check')+'</button><button data-m="acd:show">'+T('نمی‌دانم، پاسخ را نشان بده','Show answer')+'</button></div></div>';return h}
 if(!AR.show)return h+'<button class="p acshow" data-m="acd:show">نمایش پاسخ</button></div>';
 if(spOn&&st.res)h+='<p class="hst '+(st.res==='ok'?'ok':'')+'" style="text-align:center">'+(st.res==='ok'?'✓ '+T('درست نوشتی','Correct'):'✗ '+T('نوشتهٔ تو: ','You typed: ')+'<bdi dir="ltr">'+E(st.typed)+'</bdi>')+'</p>';
 h+='<div class="aca">'+E(back(c)).replace(/\n/g,'<br>')+(c.x?'<div class="m" style="margin-top:8px" dir="auto">'+E(c.x)+'</div>':'')+'</div><div class="row" style="justify-content:center">'+snd(latin(c.a)&&!cloze(c)?c.a:(sp||''))+'</div>';
 const sug=spOn&&st.res?(st.res==='ok'?'good':'again'):'';
 h+='<div class="acbtns">'+[['again','دوباره','#ef4444'],['hard','سخت','#f59e0b'],['good','خوب','#34d399'],['easy','آسان','#60a5fa']].map(x=>'<button class="acb" style="--c:'+x[2]+(sug===x[0]?';outline:3px solid '+x[2]:'')+'" data-m="acd:rate:'+x[0]+'">'+x[1]+'<small>'+srsPrev(c,x[0])+'</small></button>').join('')+'</div><p class="m">اگر پاسخ را بلد نبودی «دوباره» بزن؛ اشتباه کردن یعنی کارت دارد کارش را می‌کند.</p></div>';
 return h};
function ctl(){const A=zAX();return'<div class="row" style="flex-wrap:wrap;margin:6px 0"><button class="chip sm '+(st.spell?'on':'')+'" data-a="c2_spell">✍ '+T('حالت املا','Spelling mode')+'</button><button class="chip sm '+(A.snd?'on':'')+'" data-a="c2_snd">🔊 '+T('خواندن خودکار پاسخ','Auto-speak answer')+'</button><button class="chip sm" data-a="c2_nl">🆕 '+T('کارت جدید امروز','New today')+': '+fa(nlc().n)+'/'+(nl()||'∞')+' ✎</button></div>'}
H.c2_say=e=>speak(e.dataset.t,!!e.dataset.s);
H.c2_spell=()=>{st.spell=!st.spell;st.res=null;AR.show=false;render()};
H.c2_snd=()=>{const A=zAX();A.snd=!A.snd;zcommit()};
H.c2_nl=()=>{const v=prompt(T('حداکثر کارت جدید در روز (۰ = بدون سقف):','Max new cards per day (0 = unlimited):'),String(nl()));if(v===null)return;const n=Math.max(0,Math.min(500,parseInt(v,10)||0));zAX().nl=n;zcommit()};
H.c2_chk=()=>{const c=srsDue()[0],i=document.getElementById('c2-sp');if(!c||!i)return;const s=spellText(c);st.typed=i.value;st.res=norm(i.value)===norm(s)?'ok':'bad';AR.show=true;if(zAX().snd)speak(s);render()};
/* فرم کارت: فیلد «مثال / تلفظ» */
const _cards=acdCards;
acdCards=function(){let h=_cards();const x='<label>'+T('مثال یا تلفظ (اختیاری، زیر پاسخ دیده می‌شود)','Example / pronunciation (optional)')+'</label><input id="ac-x" maxlength="200" dir="auto" style="width:100%"><p class="m">'+T('نکته: برای کارت جای‌خالی، کلمهٔ پنهان را داخل {{ }} بنویس؛ مثلاً: He {{went}} home.','Tip: for a cloze card put the hidden word in {{ }}, e.g. He {{went}} home.')+'</p>';
 const i=h.indexOf('<div class="row" style="margin-top:8px">');return i>0?h.slice(0,i)+x+h.slice(i):h};
const _add=zMA.acd.addcard;
zMA.acd.addcard=function(){const A=zAX(),n=A.cards.length,x=(document.getElementById('ac-x')||{}).value;_add.apply(this,arguments);if(A.cards.length>n&&x&&x.trim()){A.cards[A.cards.length-1].x=String(x).trim().slice(0,200);zcommit()}};
window.daniCards2={speak,norm,spellText};
})();
