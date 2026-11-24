"use strict";
/* DANI · review2.js (v167) — مرور موضوعی.
   - کارتِ درسی فقط وقتی وارد مرور می‌شود که درسش باز/مطالعه شده باشد (پیشرفت دارد) یا کاربر دستی «شروع مرور این مبحث» را بزند یا قبلاً مرورش کرده باشد.
   - محدوده‌ی مرور: همه‌ی بازشده‌ها / یک دوره / یک مبحث / «بسته‌ی پیشنهادی سازنده» (course.reviewGroups + flashcard.groups).
   - در محدوده‌ی انتخابی، کارت‌های هنوز موعدنرسیده هم می‌آیند (مرور اضافه)؛ هر کارتِ ردشده در همین نشست از صف بیرون می‌رود (جز «دوباره»).
   - «خودت را بسنج» در انتهای هر درس: همان مرور آن مبحث. */
(function(){'use strict';
const T=window.daniT||function(a){return a};
const E=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SC={k:'all',id:'',done:new Set()};
const CRs=()=>{try{return window.daniCourses&&window.daniCourses.state}catch(e){return null}};
const unl=()=>{const A=zAX();if(!A.unl||typeof A.unl!=='object'||Array.isArray(A.unl))A.unl={};return A.unl};
const rgs=cid=>{const A=zAX();return A.rg&&Array.isArray(A.rg[cid])?A.rg[cid]:[]};
function opened(c){if(!c.lid)return true;if(c.reps>0||c.last)return true;if(unl()[c.lid])return true;const C=CRs();if(!C)return true;if(!C.ix.lessons.get(c.lid))return true;return !!C.ix.progress.get(c.lid)}
function inGroup(c,cid,gid){if(c.cid!==cid)return false;if(Array.isArray(c.g)&&c.g.indexOf(gid)>=0)return true;const g=rgs(cid).find(x=>x.id===gid);return !!(g&&c.lid&&Array.isArray(g.l)&&g.l.indexOf(c.lid)>=0)}
function inScope(c){if(SC.k==='all')return true;if(SC.k==='lessons')return SC.id.split(',').indexOf(c.lid)>=0;if(SC.k==='course')return c.cid===SC.id;if(SC.k==='lesson')return c.lid===SC.id;if(SC.k==='group'){const i=SC.id.indexOf('|');return inGroup(c,SC.id.slice(0,i),SC.id.slice(i+1))}return true}
const _d=srsDue;
srsDue=function(){
 if(SC.k==='all')return _d().filter(opened);
 const due=_d(),rank=new Map(due.map((c,i)=>[c.id,i]));
 const l=zAX().cards.filter(srsOk).filter(c=>inScope(c)&&opened(c)&&!SC.done.has(c.id));
 return l.sort((a,b)=>{const x=rank.has(a.id),y=rank.has(b.id);if(x!==y)return x?-1:1;return x?rank.get(a.id)-rank.get(b.id):a.due.localeCompare(b.due)})};
const _rate=zMA.acd.rate;
zMA.acd.rate=function(q){const c=(window.daniCards2&&window.daniCards2.cur?window.daniCards2.cur():srsDue()[0]);const r=_rate.apply(this,arguments);if(c&&SC.k!=='all'&&q!=='again')SC.done.add(c.id);return r};
function setScope(k,id){SC.k=k||'all';SC.id=id||'';SC.done=new Set();try{zMS.acd.tab='review'}catch(e){}}
function goReview(){try{H.acd3_go({dataset:{k:'review'}})}catch(e){try{zMS.acd.tab='review'}catch(x){}}render()}
/* آماره‌ها */
function stats(){const A=zAX(),C=CRs(),all=A.cards.filter(srsOk),op=all.filter(opened),by=new Map();
 all.forEach(c=>{if(!c.lid)return;let o=by.get(c.lid);if(!o){o={n:0,op:0,cid:c.cid,deck:c.deck};by.set(c.lid,o)}o.n++;if(opened(c))o.op++});
 return{all,op,by,C}}
const lname=(l,c)=>{const k=c.deck||'';const i=k.indexOf(' › ');return i>=0?k.slice(i+3):(l||'')};
function scopeCard(){const s=stats(),A=zAX();if(!A.cards.length)return'';
 const chip=(k,t,on)=>'<button class="chip'+(on?' on':'')+'" data-a="rv_k" data-k="'+k+'">'+t+'</button>';
 let h='<div class="c" id="rvscope"><div class="row" style="flex-wrap:wrap;gap:6px">'
  +chip('all',T('همه‌ی بازشده‌ها','All opened')+' · '+fa(s.op.length),SC.k==='all')+chip('course',T('یک دوره','A course'),SC.k==='course')+chip('lesson',T('یک مبحث','A topic'),SC.k==='lesson'||SC.k==='group'&&0)+'</div>';
 const courses=[];s.all.forEach(c=>{if(c.cid&&courses.indexOf(c.cid)<0)courses.push(c.cid)});
 const cname=cid=>{try{const k=s.C.ix.courses.get(cid);return k?k.title:cid}catch(e){return cid}};
 if(SC.k==='course'){h+='<select data-mc="acd:rvsel" style="width:100%;margin-top:8px"><option value="">'+T('— انتخاب دوره —','— choose a course —')+'</option>'+courses.map(cid=>'<option value="'+E(cid)+'"'+(SC.id===cid?' selected':'')+'>'+E(cname(cid))+' ('+fa(s.all.filter(c=>c.cid===cid&&opened(c)).length)+')</option>').join('')+'</select>'}
 if(SC.k==='lesson'){const opts=[];s.by.forEach((o,lid)=>opts.push([lid,o]));
  h+='<select data-mc="acd:rvsel" style="width:100%;margin-top:8px"><option value="">'+T('— انتخاب مبحث —','— choose a topic —')+'</option>'+opts.map(([lid,o])=>{const lk=o.op===0&&!unl()[lid];return'<option value="'+E(lid)+'"'+(SC.id===lid?' selected':'')+'>'+(lk?'🔒 ':'')+E(o.deck||lid)+' ('+fa(o.n)+')</option>'}).join('')+'</select>';
  if(SC.id){const o=s.by.get(SC.id);if(o&&o.op===0&&!unl()[SC.id])h+='<p class="m">'+T('این مبحث هنوز باز یا مطالعه نشده؛ کارت‌هایش در مرور نمی‌آیند.','This topic has not been opened yet, so its cards stay out of review.')+'</p><button class="p" data-a="rv_unl" data-l="'+E(SC.id)+'">'+T('شروع مرور این مبحث','Start reviewing this topic')+'</button>'}}
 /* بسته‌های پیشنهادی سازنده */
 const gl=[];courses.forEach(cid=>rgs(cid).forEach(g=>{const n=s.all.filter(c=>inGroup(c,cid,g.id)),o=n.filter(opened).length;if(n.length)gl.push({cid,g,n:n.length,o})}));
 if(gl.length)h+='<div class="m" style="margin-top:10px"><b>⭐ '+T('بسته‌های پیشنهادی سازنده','Suggested by the course builder')+'</b></div>'+gl.map(x=>'<div class="row" style="justify-content:space-between;align-items:center;border-top:1px solid #ffffff14;padding:6px 0"><span dir="auto">'+E(T(x.g.t||x.g.id,x.g.en||x.g.t||x.g.id))+'<small class="m"> · '+fa(x.n)+(x.o<x.n?' · 🔒 '+fa(x.n-x.o):'')+'</small></span><button class="chip'+(SC.k==='group'&&SC.id===x.cid+'|'+x.g.id?' on':'')+'" data-a="rv_g" data-c="'+E(x.cid)+'" data-g="'+E(x.g.id)+'"'+(x.o?'':' disabled style="opacity:.4"')+'>▶</button></div>').join('');
 const hid=s.all.length-s.op.length;
 if(hid>0)h+='<p class="m" style="margin-top:8px">🔒 '+fa(hid)+' '+T('کارت از مباحثی که هنوز باز نکرده‌ای در مرور نیامده‌اند؛ بعد از خواندن درس فعال می‌شوند.','cards from topics you have not opened are kept out of review until you study them.')+'</p>';
 if(SC.k!=='all'){const n=srsDue().length;h+='<p class="m">'+(n?fa(n)+' '+T('کارت در این محدوده','cards in this scope'):'✓ '+T('این محدوده تمام شد','This scope is finished'))+'</p>'}
 return h+'</div>'}
let _rv=acdReview;
acdReview=function(){return scopeCard()+_rv.apply(this,arguments)};
H.rv_k=e=>{const k=e.dataset.k;if(k==='all')setScope('all');else{SC.k=k;SC.id='';SC.done=new Set()}render()};
H.rv_unl=e=>{const l=e.dataset.l;if(!l)return;unl()[l]=1;zcommit();toast(T('مرور این مبحث فعال شد','Topic review enabled'))};
H.rv_g=e=>{setScope('group',e.dataset.c+'|'+e.dataset.g);render()};
zMA.acd.rvsel=function(_,el){const v=el&&el.value||'';SC.id=v;SC.done=new Set();render()};
/* از انتهای درس */
H.rv_self=e=>{const l=e.dataset.l;if(!l)return;unl()[l]=1;setScope('lesson',l);zcommit();goReview()};
/* خروج از صفحه‌ی آکادمی = برگشت به «همه» */
{const _r=render;render=function(){try{if(typeof page!=='undefined'&&page!=='acd'&&SC.k!=='all')setScope('all')}catch(e){}return _r.apply(this,arguments)}}
window.daniReview2={opened,setScope,scope:SC,inGroup,go:goReview,unlock:ids=>{ids.forEach(l=>{unl()[l]=1});zcommit()}};
})();
