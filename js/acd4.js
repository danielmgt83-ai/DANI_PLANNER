"use strict";
/* DANI · acd4.js (v150) — آکادمی مبحث‌محور
   مجموعه (مثل «MBA») ← درس/دوره (ریاضی، GMAT، انگلیسی) ← فصل ← مبحث (درس).
   • مجموعه‌ها فقط یک گروه‌بندی‌اند (db.mods.acd.cols)؛ فایل‌های ZIP و پیشرفت دست نمی‌خورند.
   • هر مبحث: تدریس، تمرین، آزمون، یادداشت (از قبل) + فلش‌کارت‌های همان مبحث (تازه) + درصد تسلط.
   • تکراری‌ها (افزونه‌ی قدیمی «درس‌ها») نشان داده می‌شوند و فقط با تأیید تو پنهان می‌شوند (برگشت‌پذیر).
   بعد از courses.js و acd3.js بارگذاری می‌شود. */
(function(){'use strict';
const T=window.daniT||function(a){return a};
const CRs=()=>{try{return window.daniCourses&&window.daniCourses.state}catch(e){return null}};
const API=()=>{try{return window.daniCourses&&window.daniCourses.api}catch(e){return null}};
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const F=n=>{try{return fa(n)}catch(e){return String(n)}};
const cols=()=>{const A=zAC();if(!Array.isArray(A.cols))A.cols=[];A.cols=A.cols.filter(c=>c&&typeof c.id==='string'&&typeof c.title==='string'&&Array.isArray(c.cids));return A.cols};
const ui={open:{},ct:{},undo:false};
const cardsOf=f=>{try{return zAX().cards.filter(srsOk).filter(f)}catch(e){return[]}};
const dueOf=f=>{const t=todayISO();return cardsOf(c=>c.due<=t&&f(c)).length};
/* آمار تسلط: آخرین نتیجه‌ی هر سؤال؛ lids = مجموعه‌ی درس‌ها (اختیاری) */
function stat(cid,lids){const a=API();if(!a)return{total:0,n:0,ok:0,p:null};const R=a.latestResults(cid),Q=a.questionsOf(cid).filter(q=>!lids||q.lessonIds.some(i=>lids.has(i)));let n=0,ok=0;Q.forEach(q=>{const r=R.get(q.id);if(r){n++;if(r.ok)ok++}});return{total:Q.length,n,ok,p:n?Math.round(ok/n*100):null}}
const lvl=p=>p==null?['تمرین نشده','#64748b']:p>=80?['مسلط','#16a34a']:p>=50?['در حال یادگیری','#ea580c']:['ضعیف','#dc2626'];
const chip=p=>{const l=lvl(p);return'<span class="crs-bdg" style="background:'+l[1]+'">'+T(l[0],{'تمرین نشده':'Not practised','مسلط':'Mastered','در حال یادگیری':'Learning','ضعیف':'Weak'}[l[0]])+(p==null?'':' '+F(p)+'٪')+'</span>'};
const bar=p=>'<div class="bar"><i style="width:'+Math.max(0,Math.min(100,p))+'%"></i></div>';

function rowCourse(c,colId){const a=API(),pr=a.courseProg(c.id),st=stat(c.id),due=dueOf(x=>x.cid===c.id);
 return'<div class="a4row"><div class="row"><b class="sp" dir="auto">'+E(c.title)+'</b>'+chip(st.p)+'</div>'+bar(pr.p)
  +'<div class="m">'+F((c.chapters||[]).length)+' '+T('فصل','chapters')+' · '+F(pr.done)+'/'+F(pr.n)+' '+T('مبحث','topics')+' · '+F(st.total)+' '+T('سؤال','questions')+(due?' · '+F(due)+' '+T('کارت برای مرور','cards due'):'')+'</div>'
  +'<div class="row" style="margin-top:6px"><button class="p" data-a="crs_open" data-c="'+E(c.id)+'">'+T('باز کردن','Open')+'</button><button data-a="crs_qstart" data-c="'+E(c.id)+'" data-s="all" data-m="exam">'+T('آزمون جامع','Full exam')+'</button>'
  +(colId?'<button data-a="acd4_rm" data-c="'+E(c.id)+'" data-k="'+E(colId)+'" title="'+T('از مجموعه خارج شود (دوره پاک نمی‌شود)','Remove from collection (course is kept)')+'">⇤ '+T('خروج از مجموعه','Remove')+'</button>':'<button data-a="acd4_add" data-c="'+E(c.id)+'">＋ '+T('افزودن به مجموعه','Add to collection')+'</button>')+'</div></div>'}

function colCard(col,list){const a=API(),open=ui.open[col.id]!==false;let done=0,n=0,q=0,ok=0,qn=0;
 list.forEach(c=>{const p=a.courseProg(c.id),s=stat(c.id);done+=p.done;n+=p.n;q+=s.total;ok+=s.ok;qn+=s.n});
 return'<div class="c a4col"><div class="row"><h3 class="sp" dir="auto">📚 '+E(col.title)+'</h3><button data-a="acd4_tog" data-k="'+E(col.id)+'" aria-expanded="'+open+'">'+(open?'▾':'◂')+'</button></div>'
  +'<div class="m">'+F(list.length)+' '+T('درس','subjects')+' · '+F(done)+'/'+F(n)+' '+T('مبحث تمام‌شده','topics done')+' · '+F(q)+' '+T('سؤال','questions')+'</div>'+bar(n?done/n*100:0)
  +(open?(list.length?list.map(c=>rowCourse(c,col.id)).join(''):'<p class="m">'+T('این مجموعه هنوز درسی ندارد.','No subjects yet.')+'</p>')
   +'<div class="row" style="margin-top:8px"><button data-a="acd4_pick" data-k="'+E(col.id)+'">＋ '+T('افزودن درس','Add subject')+'</button><button data-a="acd4_ren" data-k="'+E(col.id)+'">✎ '+T('نام','Rename')+'</button><button class="d" data-a="acd4_del" data-k="'+E(col.id)+'">'+T('حذف مجموعه','Delete collection')+'</button></div>':'')+'</div>'}

const STOP=new Set(['exam','course','dani','dars','test']);
function groups(free){const cnt={},tk=c=>c.id.toLowerCase().split(/[-_.]/).filter(t=>t.length>=3&&!/^\d+$/.test(t)&&!/^d\d+$/.test(t)&&!STOP.has(t));
 free.forEach(c=>new Set(tk(c)).forEach(t=>cnt[t]=(cnt[t]||0)+1));
 const g={};free.forEach(c=>{const best=tk(c).filter(t=>cnt[t]>=2).sort((x,y)=>cnt[y]-cnt[x])[0];if(best)(g[best]=g[best]||[]).push(c)});
 return Object.entries(g).filter(([,l])=>l.length>=2)}
const gTitle=t=>t.length<=4?t.toUpperCase():t[0].toUpperCase()+t.slice(1);
function suggest(free){const g=groups(free);if(!g.length)return'';
 return'<div class="c"><h3>'+T('پیشنهاد گروه‌بندی','Suggested grouping')+'</h3><p class="m">'+T('این درس‌ها نام مشترک دارند. با یک لمس در یک مجموعه جمع می‌شوند؛ چیزی پاک یا جابه‌جا نمی‌شود.','These share a name. One tap groups them; nothing is deleted.')+'</p>'
  +g.map(([t,l])=>'<div class="row"><span class="sp" dir="auto"><b>'+E(gTitle(t))+'</b> <span class="m">'+l.map(c=>E(c.title)).join('، ')+'</span></span><button class="p" data-a="acd4_mk" data-t="'+E(t)+'">'+T('ساخت','Create')+'</button></div>').join('')+'</div>'}

/* افزونه‌ی قدیمی «درس‌ها» که محتوایش در یک دوره هم هست */
const oldExt=()=>{try{return extIndex().find(x=>x.id==='acadlessons')||null}catch(e){return null}};
function dupCard(){const x=oldExt(),C=CRs();if(!x||!C)return'';
 const A=zAC(),done=!!A.oldMig,n=oldCards().length;
 if(done)return x.on===false?'':'<div class="c"><p class="m">'+T('درس‌های قدیمی منتقل شد. برنامه را یک‌بار ببند و باز کن تا کنار برود.','Old lessons were moved. Restart the app once.')+'</p></div>';
 return'<div class="c" style="border-color:#ea580c"><h3>🔀 '+T('انتقال «درس‌های قدیمی» به درس‌ها','Move “old lessons” into subjects')+'</h3>'
  +'<p class="m">'+T('تمام درس‌ها و سؤال‌های آن از قبل در دورهٔ گرامر هست. فقط فلش‌کارت‌هایش (','All its lessons and questions already live in the grammar course. Only its flashcards (')+F(n)+T(' کارت) به مبحث‌های همان دوره می‌روند و بخش قدیمی خاموش می‌شود. چیزی پاک نمی‌شود و برگشت دارد.',' cards) move to the matching topics, then the old section is switched off. Nothing is deleted; you can restore it.')+'</p>'
  +'<button class="p" data-a="acd4_mig">'+T('انتقال بده','Move now')+'</button></div>'}
/* کارت‌های افزونه‌ی قدیمی (داخل درس‌های قدیمی) */
function oldCards(){try{const A=zAX();return(A.lessons||[]).filter(l=>l&&Array.isArray(l.cards)).flatMap(l=>l.cards.map((c,i)=>({old:l,i,q:c.q,a:c.a})))}catch(e){return[]}}
function migOld(){const C=CRs(),A=zAC(),by={};let n=0;
 (zAX().lessons||[]).forEach(o=>{if(!o||!Array.isArray(o.cards)||!o.cards.length)return;const pre=String(o.title||'').split(')')[0].trim();
  const t=C.cache.lessons.find(l=>pre&&String(l.title||'').split(')')[0].trim()===pre)||null;if(!t)return;
  (by[t.courseId]=by[t.courseId]||[]).push(...o.cards.filter(c=>c&&c.q&&c.a).map((c,i)=>({id:'old-'+o.id+'-'+i,lessonId:t.id,q:c.q,a:c.a})))});
 Object.keys(by).forEach(cid=>{zipCards(cid,by[cid]);n+=by[cid].length});
 A.oldMig=1;const l=extIndex(),x=l.find(i=>i.id==='acadlessons');if(x){x.on=false;extSaveIndex(l)}
 zcommit();toast(T('انتقال شد: ','Moved: ')+F(n)+T(' فلش‌کارت. برنامه را یک‌بار ببند و باز کن.',' cards. Restart the app once.'));rr();return n}
H.acd4_mig=()=>{if(!confirm(T('فلش‌کارت‌های درس‌های قدیمی به مبحث‌های دوره بروند و بخش قدیمی خاموش شود؟','Move the old cards and switch the old section off?')))return;migOld()};
/* تغییر نام درس / فصل / مبحث */
H.acd4_ren=e=>{const C=CRs(),t=e.dataset.t,cid=e.dataset.c,id=e.dataset.i,c=C.ix.courses.get(cid);if(!c)return;
 const cur=t==='c'?c.title:t==='ch'?((c.chapters.find(x=>x.id===id)||{}).title):((C.ix.lessons.get(id)||{}).title);
 const v=prompt(T('نام تازه:','New name:'),cur||'');if(v===null)return;const nv=v.trim();if(!nv||nv===cur)return;
 API().renameItem(t,cid,id,nv).then(()=>{toast(T('نام عوض شد','Renamed'));rr()}).catch(x=>toast(String(x.message||x),1))};
/* سازنده‌ی داخل مبحث: فلش‌کارت و سؤال */
function builder(l){const o=ui.bo===l.id;
 const inp=(id,ph)=>'<input id="'+id+'" dir="auto" placeholder="'+ph+'" style="width:100%;margin:3px 0">';
 return'<details class="c a4bld"'+(o?' open':'')+'><summary><b>🛠 '+T('ساخت در این مبحث','Build in this topic')+'</b></summary>'
  +'<p class="m">'+T('هرچه اینجا بسازی همین‌جا به مبحث وصل می‌شود و با به‌روزرسانی دوره پاک نمی‌شود.','Whatever you build here attaches to this topic and survives course updates.')+'</p>'
  +'<h4>'+T('فلش‌کارت','Flashcard')+'</h4>'+inp('a4b-fq',T('پرسش (روی کارت)','Question (front)'))+inp('a4b-fa',T('پاسخ (پشت کارت)','Answer (back)'))
  +'<button data-a="acd4_bcard" data-l="'+E(l.id)+'">＋ '+T('افزودن کارت','Add card')+'</button>'
  +'<h4 style="margin-top:12px">'+T('سؤال چهارگزینه‌ای','Multiple-choice question')+'</h4><textarea id="a4b-qs" rows="2" dir="auto" placeholder="'+T('متن سؤال','Question text')+'" style="width:100%"></textarea>'
  +[1,2,3,4].map(i=>inp('a4b-o'+i,T('گزینه ','Option ')+F(i))).join('')
  +'<div class="row"><label>'+T('گزینهٔ درست','Correct')+' <select id="a4b-ok">'+[1,2,3,4].map(i=>'<option value="'+i+'">'+F(i)+'</option>').join('')+'</select></label> <label>'+T('دشواری','Level')+' <select id="a4b-df"><option value="1">'+T('آسان','Easy')+'</option><option value="2" selected>'+T('متوسط','Medium')+'</option><option value="3">'+T('دشوار','Hard')+'</option></select></label></div>'
  +'<textarea id="a4b-sl" rows="2" dir="auto" placeholder="'+T('پاسخ تشریحی','Explanation')+'" style="width:100%"></textarea>'
  +'<button class="p" data-a="acd4_bq" data-l="'+E(l.id)+'">＋ '+T('افزودن سؤال','Add question')+'</button></details>'}
H.acd4_bcard=e=>{const C=CRs(),l=C.ix.lessons.get(e.dataset.l),q=(document.getElementById('a4b-fq').value||'').trim(),a=(document.getElementById('a4b-fa').value||'').trim();
 if(!l||!q||!a){toast(T('پرسش و پاسخ را بنویس','Write question and answer'),1);return}
 const A=zAX(),c=C.ix.courses.get(l.courseId),t=todayISO();if(A.cards.length>=2000){toast(T('حداکثر ۲۰۰۰ کارت','Max 2000 cards'),1);return}
 A.cards.push({id:'c'+uid(),fid:'u:'+uid(),deck:S_((c?c.title:'')+' › '+l.title,60),cid:l.courseId,lid:l.id,q:S_(q,300),a:S_(a,600),ease:2.5,ivl:0,reps:0,lap:0,due:t,created:t,ag:''});
 ui.bo=l.id;zcommit();toast(T('کارت اضافه شد','Card added'))};
H.acd4_bq=e=>{const C=CRs(),l=C.ix.lessons.get(e.dataset.l),g=id=>(document.getElementById(id).value||'').trim();
 const o=[1,2,3,4].map(i=>g('a4b-o'+i)),stem=g('a4b-qs'),sol=g('a4b-sl');
 if(!l||!stem||o.filter(Boolean).length<2||!sol){toast(T('متن سؤال، حداقل دو گزینه و پاسخ تشریحی لازم است','Need stem, 2+ options and an explanation'),1);return}
 const ch=['a','b','c','d'],ci=+g('a4b-ok')-1;if(!o[ci]){toast(T('گزینهٔ درست خالی است','Correct option is empty'),1);return}
 const choices=o.map((t,i)=>t?{id:ch[i],text:S_(t,300)}:null).filter(Boolean);
 API().addQuestion({id:'u-'+uid(),type:'single',difficulty:+g('a4b-df'),lessonIds:[l.id],topicIds:l.topics||[],stem:S_(stem,800),choices,answer:{choice:ch[ci]},solution:S_(sol,1200)})
  .then(()=>{ui.bo=l.id;toast(T('سؤال اضافه شد','Question added'));rr()}).catch(x=>toast(String(x.message||x),1))};

function tree(){const C=CRs();if(!C)return'';const cs=C.cache.courses,used=new Set();let h=todayCard();
 h+='<div class="c"><h3>'+T('مجموعه‌ها و درس‌ها','Collections & subjects')+'</h3><p class="m">'+T('هر درس یک فایل است و داخلش فصل ← مبحث ← تدریس، فلش‌کارت، تمرین و آزمون. مجموعه‌ها فقط برای مرتب‌کردن‌اند.','Each subject is one file: chapters → topics → teaching, cards, practice, exams. Collections only group them.')+'</p><button data-a="acd4_new">＋ '+T('مجموعه‌ی تازه','New collection')+'</button></div>';
 cols().forEach(col=>{const l=col.cids.map(id=>cs.find(c=>c.id===id)).filter(Boolean);l.forEach(c=>used.add(c.id));h+=colCard(col,l)});
 const free=cs.filter(c=>!used.has(c.id));
 h+=mergeCard()+suggest(free);
 if(free.length)h+='<div class="c"><h3>'+T('درس‌های بدون مجموعه','Subjects without a collection')+'</h3>'+free.map(c=>rowCourse(c,'')).join('')+'</div>';
 h+=dupCard();return h}

/* ---- داخل دوره/مبحث ---- */
function chapterInfo(cid,ch,ls){const st=stat(cid,new Set(ls.map(l=>l.id)));return'<div class="m" style="margin:4px 0">'+chip(st.p)+' '+F(st.total)+' '+T('سؤال','questions')+'</div>'}
function lessonChip(l){const st=stat(l.courseId,new Set([l.id])),n=cardsOf(c=>c.lid===l.id).length;if(st.p==null&&!n)return'';return' <span class="m">'+(st.p==null?'':chip(st.p))+(n?' 🃏'+F(n):'')+'</span>'}
function lessonCards(l){const cs=cardsOf(c=>c.lid===l.id),t=todayISO(),due=cs.filter(c=>c.due<=t).length;
 return'<div class="c a4cards"><h3>'+T('فلش‌کارت‌های این مبحث','Flashcards of this topic')+'</h3>'
  +'<div class="m">'+F(cs.length)+' '+T('کارت','cards')+(due?' · <b>'+F(due)+'</b> '+T('برای مرور امروز','due today'):'')+'</div>'
  +(cs.length?cs.slice(0,30).map(c=>'<div class="cwr"><span dir="auto"><b>'+E(S_(c.q,100))+'</b> <span class="m">'+E(S_(c.a,120))+'</span></span><button class="d" data-a="acd4_delc" data-id="'+E(c.id)+'">✕</button></div>').join(''):'')
  +'<label>'+T('افزودن گروهی (هر خط: پرسش | پاسخ)','Add cards (one per line: question | answer)')+'</label><textarea id="a4-b" rows="3" dir="auto" placeholder="ephemeral | زودگذر"></textarea>'
  +'<div class="row"><button class="p" data-a="acd4_addc" data-l="'+E(l.id)+'">'+T('افزودن کارت‌ها','Add cards')+'</button>'+(due?'<button data-a="acd4_rev">'+T('مرور امروز','Review now')+'</button>':'')+'</div></div>'}

/* ---- رویدادها ---- */
const rr=()=>{try{render()}catch(e){console.error(e)}};
H.acd4_new=()=>{const t=(prompt(T('نام مجموعه (مثلاً MBA):','Collection name:'))||'').trim().slice(0,40);if(!t)return;cols().push({id:'k'+uid(),title:t,cids:[]});zcommit()};
H.acd4_ren=e=>{const c=cols().find(x=>x.id===e.dataset.k);if(!c)return;const t=(prompt(T('نام تازه:','New name:'),c.title)||'').trim().slice(0,40);if(!t)return;c.title=t;zcommit()};
H.acd4_del=e=>{const c=cols().find(x=>x.id===e.dataset.k);if(!c||!confirm(T('مجموعه‌ی «'+c.title+'» حذف شود؟ درس‌ها و پیشرفت پاک نمی‌شوند؛ فقط گروه‌بندی برداشته می‌شود.','Delete this collection? Subjects and progress stay.')))return;const A=zAC();A.cols=cols().filter(x=>x.id!==c.id);zcommit()};
H.acd4_tog=e=>{ui.open[e.dataset.k]=ui.open[e.dataset.k]===false;rr()};
H.acd4_rm=e=>{const c=cols().find(x=>x.id===e.dataset.k);if(!c)return;c.cids=c.cids.filter(i=>i!==e.dataset.c);zcommit()};
H.acd4_put=e=>{const c=cols().find(x=>x.id===e.dataset.k);if(!c)return;cols().forEach(x=>{x.cids=x.cids.filter(i=>i!==e.dataset.c)});if(!c.cids.includes(e.dataset.c))c.cids.push(e.dataset.c);closeM();zcommit()};
H.acd4_add=e=>{const l=cols();if(!l.length){toast(T('اول یک مجموعه بساز','Create a collection first'),1);return}
 modal('<h3>'+T('به کدام مجموعه؟','Which collection?')+'</h3>'+l.map(c=>'<div class="row"><button class="p sp" data-a="acd4_put" data-k="'+E(c.id)+'" data-c="'+E(e.dataset.c)+'">'+E(c.title)+'</button></div>').join('')+'<div class="row"><button data-a="cl">'+T('بستن','Close')+'</button></div>')};
H.acd4_pick=e=>{const C=CRs();if(!C)return;const used=new Set();cols().forEach(c=>c.cids.forEach(i=>used.add(i)));const free=C.cache.courses.filter(c=>!used.has(c.id));
 if(!free.length){toast(T('درس آزادی نمانده','No free subjects'),1);return}
 modal('<h3>'+T('افزودن درس','Add subject')+'</h3>'+free.map(c=>'<div class="row"><button class="sp" dir="auto" data-a="acd4_put" data-k="'+E(e.dataset.k)+'" data-c="'+E(c.id)+'">'+E(c.title)+'</button></div>').join('')+'<div class="row"><button data-a="cl">'+T('بستن','Close')+'</button></div>')};
H.acd4_mk=e=>{const C=CRs();if(!C)return;const used=new Set();cols().forEach(c=>c.cids.forEach(i=>used.add(i)));const g=groups(C.cache.courses.filter(c=>!used.has(c.id))).find(([t])=>t===e.dataset.t);if(!g)return;
 cols().push({id:'k'+uid(),title:gTitle(g[0]),cids:g[1].map(c=>c.id)});zcommit();toast(T('مجموعه ساخته شد (می‌توانی نامش را عوض کنی)','Collection created'))};
H.acd4_ext=e=>{const l=extIndex(),x=l.find(i=>i.id==='acadlessons');if(!x)return;x.on=e.dataset.v==='1';extSaveIndex(l);toast(x.on?T('برگشت؛ برنامه را یک‌بار ببند و باز کن','Restored; restart the app'):T('پنهان شد؛ برنامه را یک‌بار ببند و باز کن','Hidden; restart the app'));rr()};
H.acd4_addc=e=>{const C=CRs(),l=C&&C.ix.lessons.get(e.dataset.l),t=document.getElementById('a4-b');if(!l||!t)return;const A=zAX(),deck=S_(l.title,40);let n=0;
 (t.value||'').split('\n').map(x=>x.split('|')).filter(x=>x.length>=2&&x[0].trim()&&x.slice(1).join('|').trim()).slice(0,200).forEach(x=>{if(A.cards.length>=2000)return;const q=S_(x[0],300).trim(),a=S_(x.slice(1).join('|'),600).trim();if(A.cards.some(c=>c.q===q&&c.lid===l.id))return;A.cards.push({id:'c'+uid(),deck,cid:l.courseId,lid:l.id,q,a,ease:2.5,ivl:0,reps:0,lap:0,due:todayISO(),created:todayISO(),ag:''});n++});
 if(!n){toast(T('هر خط باید «پرسش | پاسخ» باشد','Each line must be “question | answer”'),1);return}toast(F(n)+' '+T('کارت اضافه شد','cards added'));zcommit()};
H.acd4_delc=e=>{const A=zAX(),c=A.cards.find(x=>x.id===e.dataset.id);if(!c||!confirm(T('این کارت حذف شود؟','Delete this card?')))return;A.cards=A.cards.filter(x=>x.id!==c.id);zcommit()};
H.acd4_rev=()=>{try{H.acd3_go({dataset:{k:'review'}})}catch(e){zMS.acd.tab='review';rr()}};
(function css(){if(document.getElementById('acd4-css'))return;const s=document.createElement('style');s.id='acd4-css';s.textContent='.a4tabs .mrow{flex-wrap:wrap}.a4cr{margin:0 0 6px;opacity:.85}.a4in{border-top:1px solid var(--bd,#d5dbe6);padding:6px 0}.a4row{border-top:1px solid var(--bd,#d5dbe6);padding:8px 0;margin-top:6px}.a4col>.m{margin-bottom:4px}.a4cards textarea{width:100%}';document.head.appendChild(s)})();

/* ===== v151: امروز، زبانه‌های درون هر درس، دفترچه فرمول، جای نصب، لینک‌های من ===== */
const CRq=()=>CRs();
const dueN=()=>{try{return srsDue().length}catch(e){return 0}};
const openErr=()=>{const C=CRq();return C?C.cache.errors.filter(e=>!e.resolved).length:0};
function todayCard(){const C=CRq(),d=dueN(),er=openErr(),bm=C?C.cache.bookmarks.length:0;
 return'<div class="c a4today"><div class="row"><h3 class="sp">'+T('امروز','Today')+'</h3><button data-a="acd3_go" data-k="manage">⚙ '+T('ورود و مدیریت درس‌ها','Import & manage')+'</button></div>'
  +'<div class="m">'+(d||er?(d?F(d)+' '+T('کارت برای مرور','cards due'):'')+(d&&er?' · ':'')+(er?F(er)+' '+T('اشتباه باز','open mistakes'):''):T('چیزی برای مرور نیست ✓','Nothing to review ✓'))+'</div>'
  +'<div class="row" style="margin-top:6px">'+(d?'<button class="p" data-a="acd4_rev">🔁 '+T('مرور امروز','Review now')+'</button>':'')
  +'<button class="chip" data-a="acd3_go" data-k="cards">🃏 '+T('همه‌ی کارت‌ها','All cards')+'</button><button class="chip" data-a="acd3_go" data-k="errors">⚠ '+T('دفترچه خطا','Errors')+(er?' ('+F(er)+')':'')+'</button><button class="chip" data-a="acd3_go" data-k="bm">🔖 '+T('نشانک و یادداشت','Bookmarks')+(bm?' ('+F(bm)+')':'')+'</button></div>'
  +'<p class="m">'+T('کارت‌ها، خطاها و نشانک‌ها داخل خود هر درس و مبحث هم هستند؛ اینجا فقط نمای کلی همه‌ی درس‌هاست.','Cards, mistakes and bookmarks also live inside each subject/topic; this is the all-subjects overview.')+'</p></div>'}
const CT=[['ch','📖','فصل‌ها','Chapters'],['fm','📐','فرمول‌ها','Formulas'],['cd','🃏','کارت‌ها','Cards'],['er','⚠','خطاها','Mistakes'],['bm','🔖','نشانک‌ها','Bookmarks'],['ex','🎯','آزمون','Exam']];
const inCourse=(c,id)=>{const C=CRq(),q=C.ix.questions.get(id);return q&&q.courseId===c.id?q:null};
function lk(l,txt){return'<a data-a="crs_open" data-c="'+E(l.courseId)+'" data-l="'+E(l.id)+'" tabindex="0" style="cursor:pointer;color:var(--ac)" dir="auto">'+E(txt||l.title)+'</a>'}
const qText=q=>typeof q.stem==='string'?q.stem:(Array.isArray(q.stem)?q.stem.map(b=>b&&b.text||'').join(' '):'');
function fbItems(c){const a=API(),out=[],walk=(arr,l)=>{(arr||[]).forEach(b=>{if(!b||typeof b!=='object')return;if(['formula','rule','theorem','def'].indexOf(b.type)>=0)out.push({b,l});if(Array.isArray(b.blocks))walk(b.blocks,l);if(Array.isArray(b.items))b.items.forEach(i=>i&&Array.isArray(i.blocks)&&walk(i.blocks,l))})};a.lessonsOf(c.id).forEach(l=>walk(l.blocks,l));return out}
const FT=[['all','همه','All'],['formula','فرمول','Formula'],['rule','قاعده','Rule'],['theorem','قضیه','Theorem'],['def','تعریف','Definition']];
function formulaBook(c){const a=API(),C=CRq(),all=fbItems(c),f=ui.ft||'all',lim=ui.fn||30,list=all.filter(x=>f==='all'||x.b.type===f);
 let h='<div class="c"><h3>📐 '+T('دفترچه فرمول','Formula notebook')+'</h3><p class="m">'+T('همه‌ی فرمول، قاعده، قضیه و تعریف‌های این درس از متن تدریس جمع شده. روی «تدریس کامل» بزن تا همان مبحث و مثال‌ها باز شود؛ «تمرین» سؤال‌های همان مبحث را می‌آورد.','All formulas/rules/theorems/definitions of this subject, collected from the teaching. “Teaching” opens the topic; “Practice” its questions.')+'</p>'
  +'<div class="mrow">'+FT.map(x=>'<button class="chip sm '+(f===x[0]?'on':'')+'" data-a="acd4_ft" data-k="'+x[0]+'">'+T(x[1],x[2])+' ('+F(all.filter(y=>x[0]==='all'||y.b.type===x[0]).length)+')</button>').join('')+'</div></div>';
 if(!list.length)return h+'<div class="c"><p class="m">'+T('هنوز فرمولی در متن درس‌ها نیست. از هوش مصنوعی بخواه درس‌ها را با بلوک formula/rule/theorem بسازد.','No formulas yet.')+'</p></div>';
 list.slice(0,lim).forEach(x=>{const l=x.l,ch=(c.chapters||[]).find(k=>k.id===l.chapterId),pg=x.b.page||(x.b.source&&x.b.source.page)||(l.sourceRef&&l.sourceRef.page),nq=a.questionsOf(c.id).filter(q=>q.lessonIds.includes(l.id)).length,nc=cardsOf(k=>k.lid===l.id).length;
  h+='<div class="c a4fm"><div class="m" dir="auto">'+[ch&&ch.title,l.title].filter(Boolean).map(E).join(' › ')+(pg?' · '+T('جزوه ص','Handout p.')+F(pg):'')+(x.b.name?' · <b>'+E(x.b.name)+'</b>':'')+'</div>'+a.blk(x.b,0)
   +'<div class="row" style="margin-top:6px"><button class="p" data-a="crs_open" data-c="'+E(c.id)+'" data-l="'+E(l.id)+'">📖 '+T('تدریس کامل','Full teaching')+'</button>'+(nq?'<button data-a="crs_qstart" data-c="'+E(c.id)+'" data-s="lesson:'+E(l.id)+'" data-m="practice">✍ '+T('تمرین','Practice')+' ('+F(nq)+')</button>':'')+(nc?'<span class="m">🃏 '+F(nc)+'</span>':'')+'</div></div>'});
 if(list.length>lim)h+='<div class="c"><button data-a="acd4_fn">'+T('نمایش بیشتر','Show more')+' ('+F(list.length-lim)+')</button></div>';
 return h}
function courseCards(c){const t=todayISO(),cs=cardsOf(x=>x.cid===c.id),C=CRq();let h='<div class="c"><h3>🃏 '+T('فلش‌کارت‌های این درس','Flashcards of this subject')+'</h3><div class="m">'+F(cs.length)+' '+T('کارت','cards')+' · '+F(cs.filter(x=>x.due<=t).length)+' '+T('برای مرور امروز','due today')+'</div><div class="row" style="margin-top:6px">'+(cs.some(x=>x.due<=t)?'<button class="p" data-a="acd4_rev">🔁 '+T('مرور امروز','Review now')+'</button>':'')+'</div><p class="m">'+T('کارت تازه را داخل صفحه‌ی هر مبحث بساز، یا هوش مصنوعی آن‌ها را داخل فایل درس می‌دهد.','Add cards inside each topic, or have the AI put them in the course file.')+'</p></div>';
 const g=new Map();cs.forEach(x=>{const k=x.lid||'';(g.get(k)||g.set(k,[]).get(k)).push(x)});
 g.forEach((l,k)=>{const ls=k&&C.ix.lessons.get(k);h+='<div class="c"><b dir="auto">'+(ls?lk(ls):T('بدون مبحث','No topic'))+'</b> <span class="m">· '+F(l.length)+'</span>'+l.slice(0,8).map(x=>'<div class="m" dir="auto">• '+E(S_(x.q,70))+'</div>').join('')+'</div>'});return h}
function courseErrors(c){const C=CRq(),l=C.cache.errors.map(e=>({e,q:inCourse(c,e.qid)})).filter(x=>x.q),op=l.filter(x=>!x.e.resolved);
 let h='<div class="c"><h3>⚠ '+T('خطاهای این درس','Mistakes of this subject')+'</h3><div class="m">'+F(op.length)+' '+T('باز از','open of')+' '+F(l.length)+'</div><div class="row" style="margin-top:6px">'+(op.length?'<button class="p" data-a="crs_errprac">'+T('تمرین اشتباهات باز','Practise open mistakes')+'</button>':'')+'<button data-a="acd3_go" data-k="errors">'+T('دفترچه‌ی کامل (علت، خودآزمایی)','Full notebook')+'</button></div></div>';
 if(!l.length)return h+'<div class="c"><p class="m">'+T('هنوز اشتباهی ثبت نشده.','No mistakes logged yet.')+'</p></div>';
 const g=new Map();l.forEach(x=>{const id=(x.q.lessonIds||[])[0]||'';(g.get(id)||g.set(id,[]).get(id)).push(x)});
 [...g.entries()].sort((a,b)=>b[1].filter(x=>!x.e.resolved).length-a[1].filter(x=>!x.e.resolved).length).forEach(([id,it])=>{const ls=id&&C.ix.lessons.get(id),o=it.filter(x=>!x.e.resolved).length;
  h+='<details class="c"'+(o?' open':'')+'><summary><b dir="auto">'+(ls?E(ls.title):T('بدون مبحث','No topic'))+'</b> <span class="m">· '+F(o)+' '+T('باز','open')+'</span></summary>'+it.slice(0,12).map(x=>'<div class="m" dir="auto" style="margin:4px 0">'+(x.e.resolved?'✅ ':'⚠ ')+E(S_(qText(x.q)||x.q.id,90))+(x.e.cause?' <i>('+E(x.e.cause)+')</i>':'')+'</div>').join('')+(ls?'<div class="row">'+lk(ls,'📖 '+T('بازکردن مبحث','Open topic'))+'</div>':'')+'</details>'});
 return h}
function courseBm(c){const C=CRq(),l=C.cache.bookmarks.filter(b=>{const r=b.kind==='lesson'?C.ix.lessons.get(b.refId):C.ix.questions.get(b.refId);return r&&r.courseId===c.id}),ns=C.cache.notes.filter(n=>{const x=C.ix.lessons.get(n.lessonId);return x&&x.courseId===c.id});
 let h='<div class="c"><h3>🔖 '+T('نشانک و یادداشت‌های این درس','Bookmarks & notes')+'</h3>';
 h+=l.length?l.map(b=>{const r=b.kind==='lesson'?C.ix.lessons.get(b.refId):C.ix.questions.get(b.refId),ls=b.kind==='lesson'?r:C.ix.lessons.get((r.lessonIds||[])[0]);return'<div class="cwr"><span dir="auto">'+(b.kind==='lesson'?'📖 ':'❓ ')+(ls?lk(ls,(b.kind==='lesson'?'':E(S_(qText(r),50))+' — ')+ls.title):E(b.refId))+'</span></div>'}).join(''):'<p class="m">'+T('نشانکی نیست.','No bookmarks.')+'</p>';
 h+=ns.length?'<hr>'+ns.map(n=>{const ls=C.ix.lessons.get(n.lessonId);return'<div class="cwr"><span dir="auto" style="white-space:pre-wrap">📝 '+(ls?lk(ls)+': ':'')+E(n.text)+'</span></div>'}).join(''):'';
 return h+'</div>'}
function courseExam(c){const a=API(),st=stat(c.id);
 return'<div class="c"><h3>🎯 '+T('آزمون این درس','Exams of this subject')+'</h3><div class="m">'+F(st.total)+' '+T('سؤال در بانک','questions in bank')+(st.p!=null?' · '+T('تسلط','mastery')+' '+F(st.p)+'٪':'')+'</div>'
  +'<div class="row" style="margin-top:8px"><button class="p" data-a="acd4_exam" data-c="'+E(c.id)+'">'+T('مرکز آزمون (انتخاب فصل و مبحث)','Exam centre (pick chapters/topics)')+'</button><button data-a="crs_qstart" data-c="'+E(c.id)+'" data-s="all" data-m="exam">'+T('آزمون جامع','Full exam')+'</button></div></div>'}
function courseTabs(c){const t=ui.ct[c.id]||'ch',cnt={fm:fbItems(c).length,cd:cardsOf(x=>x.cid===c.id).length,er:CRq().cache.errors.filter(e=>!e.resolved&&inCourse(c,e.qid)).length};
 const bar='<div class="c a4tabs"><div class="mrow">'+CT.map(x=>'<button class="chip '+(t===x[0]?'on':'')+'" data-a="acd4_ct" data-c="'+E(c.id)+'" data-k="'+x[0]+'">'+x[1]+' '+T(x[2],x[3])+(cnt[x[0]]?' ('+F(cnt[x[0]])+')':'')+'</button>').join('')+'</div></div>';
 const f={fm:formulaBook,cd:courseCards,er:courseErrors,bm:courseBm,ex:courseExam}[t];return{bar,body:f?f(c):null}}
function crumb(l){const C=CRq(),c=C.ix.courses.get(l.courseId),col=cols().find(k=>k.cids.includes(l.courseId)),ch=c&&c.chapters.find(x=>x.id===l.chapterId);
 return'<div class="m a4cr" dir="auto">'+[col&&col.title,c&&c.title,ch&&ch.title,l.title].filter(Boolean).map(E).join(' › ')+'</div>'}
function lessonExtra(l){const C=CRq(),er=C.cache.errors.filter(e=>{const q=C.ix.questions.get(e.qid);return q&&(q.lessonIds||[]).includes(l.id)}),op=er.filter(e=>!e.resolved).length,c=C.ix.courses.get(l.courseId),nf=fbItems(c).filter(x=>x.l.id===l.id).length;
 if(!er.length&&!nf)return builder(l);
 return builder(l)+'<div class="c"><div class="row">'+(nf?'<button class="chip" data-a="acd4_goct" data-c="'+E(l.courseId)+'" data-k="fm">📐 '+F(nf)+' '+T('فرمول در این مبحث','formulas here')+'</button>':'')+(er.length?'<button class="chip" data-a="acd4_goct" data-c="'+E(l.courseId)+'" data-k="er">⚠ '+F(op)+' '+T('اشتباه باز از','open mistakes of')+' '+F(er.length)+'</button>':'')+'</div></div>'}
function myLinks(){let h='';try{h=_acdRes()}catch(e){return''}
 return'<details class="c"><summary><b>🔗 '+T('لینک‌ها و منابع شخصی من','My personal links')+'</b></summary><p class="m">'+T('جای لینک و فایل‌هایی که خودت جمع می‌کنی (ویدیوی استاد، PDF، سایت). چیزی از دوره‌ها در این بخش نیست.','Your own links/files (videos, PDFs, sites). Course material is not here.')+'</p>'+h+'</details>'}
function askPlace(cid){const C=CRq(),c=C&&C.ix.courses.get(cid);if(!c)return;const l=cols();
 modal('<h3>'+T('این درس زیرمجموعه‌ی کدام مجموعه باشد؟','Which collection does this subject belong to?')+'</h3><p class="m" dir="auto">'+E(c.title)+'</p>'+l.map(k=>'<div class="row"><button class="p sp" dir="auto" data-a="acd4_put" data-k="'+E(k.id)+'" data-c="'+E(cid)+'">'+E(k.title)+'</button></div>').join('')+'<div class="row"><button data-a="acd4_newput" data-c="'+E(cid)+'">＋ '+T('مجموعه‌ی تازه…','New collection…')+'</button><button data-a="cl">'+T('بدون مجموعه','No collection')+'</button></div>')}
function placed(cid,name){try{const L=cols();if(L.some(c=>c.cids.includes(cid)))return;
 if(typeof name==='string'&&name.trim()){let k=L.find(c=>c.title===name.trim());if(!k){k={id:'k'+uid(),title:name.trim().slice(0,40),cids:[]};L.push(k)}k.cids.push(cid);zcommit();toast(T('درس در مجموعه‌ی «'+k.title+'» قرار گرفت','Placed in “'+k.title+'”'));return}
 setTimeout(()=>{if(!cols().some(c=>c.cids.includes(cid)))askPlace(cid)},500)}catch(e){console.error(e)}}
function zipCards(cid,list){const C=CRq(),A=zAX(),c=C.ix.courses.get(cid),t=todayISO();let n=0,u=0;
 (list||[]).forEach(f=>{if(!f||!f.q||!f.a||!f.id)return;const fid=cid+':'+f.id,q=S_(String(f.q),300),a=S_(String(f.a),600),l=f.lessonId&&C.ix.lessons.get(f.lessonId),lid=l?l.id:'';
  const o=A.cards.find(x=>x.fid===fid);if(o){o.q=q;o.a=a;if(lid)o.lid=lid;u++;return}
  if(A.cards.length>=2000)return;A.cards.push({id:'c'+uid(),fid,deck:S_((c?c.title:cid)+(l?' › '+l.title:''),60),cid,lid,q,a,ease:2.5,ivl:0,reps:0,lap:0,due:t,created:t,ag:''});n++});
 if(n||u){zcommit();toast(F(n)+' '+T('فلش‌کارت از فایل درس اضافه شد','flashcards added from the course file')+(u?' · '+F(u)+' '+T('به‌روز','updated'):''))}}
H.acd4_ct=e=>{ui.ct[e.dataset.c]=e.dataset.k;rr()};
H.acd4_goct=e=>{ui.ct[e.dataset.c]=e.dataset.k;const C=CRq();C.lessonId='';C.courseId=e.dataset.c;rr();window.scrollTo(0,0)};
H.acd4_ft=e=>{ui.ft=e.dataset.k;ui.fn=30;rr()};
H.acd4_fn=()=>{ui.fn=(ui.fn||30)+40;rr()};
H.acd4_exam=e=>{const C=CRq();C.setup={courseId:e.dataset.c};try{H.acd3_go({dataset:{k:'quiz'}})}catch(x){rr()}};
H.acd4_newput=e=>{const t=(prompt(T('نام مجموعه (مثلاً MBA):','Collection name:'))||'').trim().slice(0,40);if(!t)return;const k={id:'k'+uid(),title:t,cids:[e.dataset.c]};cols().push(k);closeM();zcommit()};

/* ===== v152: ادغام درس‌های هم‌موضوع ===== */
const tk2=c=>c.id.toLowerCase().split(/[-_.]/).filter(t=>t.length>=3&&!/^\d+$/.test(t)&&!/^d\d+$/.test(t)&&!STOP.has(t));
function mergeSugg(cs){const out=[],seen=new Set(),g2={};
 cs.forEach(c=>{const t=tk2(c);if(t.length>=2)(g2[t[0]+'-'+t[1]]=g2[t[0]+'-'+t[1]]||[]).push(c)});
 Object.entries(g2).forEach(([k,l])=>{if(l.length>=2){out.push({id:k,list:l});l.forEach(c=>seen.add(c.id))}});
 groups(cs.filter(c=>!seen.has(c.id))).forEach(([t,l])=>{if(l.length===2)out.push({id:t==='grammar'?'english-grammar':t,list:l})});
 return out}
function commonTitle(l){const a=l.map(c=>String(c.title));let p=a[0];a.forEach(x=>{while(p&&!x.startsWith(p))p=p.slice(0,-1)});p=p.replace(/[\s—\-–:·]+$/,'').trim();return p||a[0]}
function mergeCard(){const C=CRq();if(!C)return'';const cs=C.cache.courses,sg=mergeSugg(cs);let h='';
 if(ui.undo)h+='<div class="c" style="border-color:#16a34a"><h3>↩ '+T('آخرین ادغام قابل برگشت است','Last merge can be undone')+'</h3><p class="m">'+T('اگر نتیجه را نپسندیدی، همه‌چیز (درس‌ها، سؤال‌ها، پیشرفت، خطاها) به حالت قبل برمی‌گردد.','Restores everything to how it was.')+'</p><button data-a="acd4_mgundo">↩ '+T('برگرداندن ادغام','Undo merge')+'</button></div>';
 if(cs.length<2)return h;
 h+='<div class="c"><h3>🧩 '+T('ادغام درس‌های هم‌موضوع','Merge related subjects')+'</h3><p class="m">'+T('مثلاً ریاضی (حد + مشتق + آزمون مخلوط) در یک درس با چند فصل. شناسه‌ی درس‌ها و سؤال‌ها، پیشرفت، خطاها و آزمون‌های قبلی می‌مانند. پیشنهاد: اول یک پشتیبان بگیر (ورود و مدیریت).','E.g. Math (limits + derivatives + mixed exam) as one subject. Ids, progress, mistakes and attempts are kept.')+'</p>'
  +sg.map(x=>'<div class="row"><span class="sp" dir="auto"><b>'+E(commonTitle(x.list))+'</b> <span class="m">← '+x.list.map(c=>E(c.title)).join(' + ')+'</span></span><button class="p" data-a="acd4_mg" data-n="'+E(x.id)+'" data-c="'+E(x.list.map(c=>c.id).join(','))+'">'+T('ادغام…','Merge…')+'</button></div>').join('')
  +'<div class="row" style="margin-top:6px"><button data-a="acd4_mgpick">'+T('انتخاب دستی…','Pick manually…')+'</button></div></div>';
 return h}
async function doMerge(id,title,ids){const a=API(),A=zAX();
 const cardsBefore=A.cards.filter(c=>ids.indexOf(c.cid)>=0).map(c=>({id:c.id,cid:c.cid})),colsBefore=JSON.parse(JSON.stringify(cols()));
 const r=await a.merge(id,title,ids);
 A.cards.forEach(c=>{if(ids.indexOf(c.cid)>=0)c.cid=id});
 cols().forEach(k=>{if(k.cids.some(i=>ids.indexOf(i)>=0)){const out=[];k.cids.forEach(i=>{if(ids.indexOf(i)>=0){if(out.indexOf(id)<0)out.push(id)}else out.push(i)});k.cids=out}});
 zAC().mergeUndo={newId:id,ids:ids.slice(),cards:cardsBefore,cols:colsBefore};ui.undo=true;zcommit();return r}
H.acd4_mg=e=>{const ids=e.dataset.c.split(','),C=CRq(),l=ids.map(i=>C.ix.courses.get(i)).filter(Boolean);if(l.length<2)return;
 const id=(prompt(T('شناسه‌ی درس تازه (انگلیسی، مثل mba-math):','New subject id (English):'),e.dataset.n)||'').trim();if(!id)return;
 const title=(prompt(T('نام درس تازه:','New subject name:'),commonTitle(l))||'').trim().slice(0,80);if(!title)return;
 if(!confirm(T('این '+l.length+' درس در «'+title+'» ادغام شوند؟\nدرس‌ها و سؤال‌ها، پیشرفت، خطاها و آزمون‌ها می‌مانند و بعداً می‌توانی ادغام را برگردانی.','Merge these subjects?')))return;
 doMerge(id,title,ids).then(r=>toast(T('ادغام شد: ','Merged: ')+F(r.chapters)+' '+T('فصل','chapters')+' · '+F(r.lessons)+' '+T('مبحث','topics')+' · '+F(r.questions)+' '+T('سؤال','questions'))).catch(x=>toast(String(x.message||x),1))};
H.acd4_mgpick=()=>{const C=CRq();modal('<h3>'+T('کدام درس‌ها ادغام شوند؟','Which subjects?')+'</h3>'+C.cache.courses.map(c=>'<label class="row"><input type="checkbox" class="a4mc" value="'+E(c.id)+'"> <span class="sp" dir="auto">'+E(c.title)+'</span></label>').join('')+'<div class="row"><button class="p" data-a="acd4_mgdo">'+T('ادامه','Next')+'</button><button data-a="cl">'+T('بستن','Close')+'</button></div>')};
H.acd4_mgdo=()=>{const ids=[...document.querySelectorAll('.a4mc:checked')].map(x=>x.value);if(ids.length<2){toast(T('حداقل دو درس انتخاب کن','Pick at least two'),1);return}closeM();H.acd4_mg({dataset:{c:ids.join(','),n:ids[0]}})};
H.acd4_mgundo=()=>{if(!confirm(T('ادغام برگردانده شود؟','Undo the merge?')))return;const A=zAX(),u=zAC().mergeUndo;API().undoMerge().then(()=>{if(u){A.cards.forEach(c=>{const o=u.cards.find(x=>x.id===c.id);if(o)c.cid=o.cid});if(u.cols)zAC().cols=u.cols;delete zAC().mergeUndo}ui.undo=false;zcommit();toast(T('ادغام برگشت','Merge undone'))}).catch(x=>toast(String(x.message||x),1))};

/* ===== v154: آزمون‌ساز چنددرسی (مجموعه ← درس ← فصل ← مبحث؛ ترتیب دلخواه؛ ترکیب چند درس) ===== */
const xb=()=>ui.xb||(ui.xb={sel:[],open:{},diffs:[1,2,3],count:'',order:'pick',mode:'exam',timed:false,min:30,neg:false});
function xtoggle(multi){return'<div class="c"><div class="row"><button class="chip '+(!multi?'on':'')+'" data-a="acd4_xmode" data-v="0">'+T('یک درس','One subject')+'</button><button class="chip '+(multi?'on':'')+'" data-a="acd4_xmode" data-v="1">🧩 '+T('آزمون‌ساز (ترکیب چند درس)','Builder (mix subjects)')+'</button></div></div>'}
const xcnt=(cid,sc)=>{try{return API().pool(cid,[sc],xb().diffs).length}catch(e){return 0}};
const xon=t=>xb().sel.indexOf(t)>=0;
function xlabel(t){const i=t.indexOf('|'),cid=t.slice(0,i),sc=t.slice(i+1),C=CRs(),c=C.ix.courses.get(cid);if(!c)return t;
 if(sc==='all')return c.title+' — '+T('کل درس','whole subject');
 if(sc.startsWith('chapter:')){const k=sc.slice(8),ci=c.chapters.findIndex(x=>x.id===k);return c.title+' › '+T('فصل','Ch.')+' '+F(ci+1)+(ci>=0?': '+c.chapters[ci].title:'')}
 const l=C.ix.lessons.get(sc.slice(7));return c.title+' › '+(l?l.title:sc)}
function xnode(cid,c){const C=CRs(),o=xb().open,ck=(t,lbl,n)=>'<label class="crs-ck"><input type="checkbox" data-a="acd4_xsel" data-t="'+E(t)+'" '+(xon(t)?'checked':'')+'> <span dir="auto">'+E(lbl)+'</span> <span class="m">('+F(n)+')</span></label>';
 const key='c:'+cid,open=!!o[key];
 let h='<div class="a4row"><div class="row"><button data-a="acd4_xopen" data-k="'+E(key)+'" aria-expanded="'+open+'">'+(open?'▾':'◂')+'</button>'+ck(cid+'|all',c.title,xcnt(cid,'all'))+'</div>';
 if(open){(c.chapters||[]).forEach((ch,i)=>{const hk='h:'+cid+':'+ch.id,ho=!!o[hk],ls=C.cache.lessons.filter(l=>l.courseId===cid&&l.chapterId===ch.id).sort((a,b)=>a.order-b.order);
   h+='<div style="margin-inline-start:14px"><div class="row"><button class="chip sm" data-a="acd4_xopen" data-k="'+E(hk)+'">'+(ho?'▾':'◂')+'</button>'+ck(cid+'|chapter:'+ch.id,T('فصل','Ch.')+' '+F(i+1)+': '+ch.title,xcnt(cid,'chapter:'+ch.id))+'</div>';
   if(ho)h+=ls.map(l=>'<div style="margin-inline-start:18px">'+ck(cid+'|lesson:'+l.id,l.title,xcnt(cid,'lesson:'+l.id))+'</div>').join('');
   h+='</div>'})}
 return h+'</div>'}
function xbuilder(){const C=CRs(),S=xb(),cs=C.cache.courses,L=cols();
 let h=xtoggle(true);
 if(!cs.length)return h+'<div class="c"><p class="m">'+T('هنوز درسی نیست.','No subjects yet.')+'</p></div>';
 h+='<div class="c"><h3>🧩 '+T('آزمون‌ساز','Exam builder')+' <span class="m">Exam Builder</span></h3><p class="m">'+T('۱) از درخت زیر درس، فصل یا مبحث را تیک بزن (می‌شود از چند درس و چند مجموعه). ۲) ترتیب را پایین مشخص کن. ۳) شروع.','1) tick subjects, chapters or topics (mix freely). 2) set the order below. 3) start.')+'</p>';
 const used=new Set();
 L.forEach(k=>{const list=k.cids.map(id=>C.ix.courses.get(id)).filter(Boolean);list.forEach(c=>used.add(c.id));if(!list.length)return;
  const ko='k:'+k.id,op=S.open[ko]!==false;h+='<div class="a4col"><div class="row"><button data-a="acd4_xopen" data-k="'+E(ko)+'" aria-expanded="'+op+'">'+(op?'▾':'◂')+'</button><b class="sp" dir="auto">📚 '+E(k.title)+'</b></div>'+(op?list.map(c=>xnode(c.id,c)).join(''):'')+'</div>'});
 const free=cs.filter(c=>!used.has(c.id));if(free.length){const op=S.open['k:_free']!==false;h+='<div class="a4col"><div class="row"><button data-a="acd4_xopen" data-k="k:_free" aria-expanded="'+op+'">'+(op?'▾':'◂')+'</button><b class="sp">'+T('بدون مجموعه','No collection')+'</b></div>'+(op?free.map(c=>xnode(c.id,c)).join(''):'')+'</div>'}
 h+='</div>';
 /* انتخاب‌ها به ترتیب */
 const tot=S.sel.reduce((n,t)=>n+xcnt(t.slice(0,t.indexOf('|')),t.slice(t.indexOf('|')+1)),0);
 h+='<div class="c"><h3>'+T('ترتیب آزمون','Order')+' ('+F(S.sel.length)+')</h3>'+(S.sel.length?S.sel.map((t,i)=>'<div class="row"><span class="badge">'+F(i+1)+'</span><span class="sp" dir="auto">'+E(xlabel(t))+'</span><button class="chip sm" data-a="acd4_xmv" data-i="'+i+'" data-d="-1" '+(i?'':'disabled')+' aria-label="up">↑</button><button class="chip sm" data-a="acd4_xmv" data-i="'+i+'" data-d="1" '+(i<S.sel.length-1?'':'disabled')+' aria-label="down">↓</button><button class="chip sm d" data-a="acd4_xrm" data-i="'+i+'" aria-label="remove">✕</button></div>').join(''):'<p class="m">'+T('هنوز چیزی انتخاب نشده.','Nothing picked yet.')+'</p>')+'</div>';
 const df=d=>'<label class="crs-ck"><input type="checkbox" data-a="acd4_xset" data-k="diff" data-v="'+d+'" '+(S.diffs.includes(d)?'checked':'')+'> '+[T('آسان','Easy'),T('متوسط','Medium'),T('دشوار','Hard')][d-1]+'</label>';
 h+='<div class="c"><div class="m"><b>'+F(tot)+'</b> '+T('سؤال با این انتخاب (بدون حذف تکراری‌های بین بخش‌ها)','questions available (before de-duplication)')+'</div>'
  +'<label>'+T('سطح دشواری','Difficulty')+'</label><div class="row">'+[1,2,3].map(df).join('')+'</div>'
  +'<label>'+T('چینش سؤال‌ها','Question order')+'</label><div class="row"><button class="chip '+(S.order==='pick'?'on':'')+'" data-a="acd4_xset" data-k="order" data-v="pick">'+T('به ترتیب بالا','As ordered above')+'</button><button class="chip '+(S.order==='shuffle'?'on':'')+'" data-a="acd4_xset" data-k="order" data-v="shuffle">'+T('کاملاً تصادفی','Fully shuffled')+'</button></div>'
  +'<div class="row"><div><label>'+T('تعداد سؤال (خالی = همه)','Count (blank = all)')+'</label><input type="number" min="1" id="a4x-n" value="'+E(S.count)+'" style="width:100px"></div><div><label>'+T('نوع','Mode')+'</label><select id="a4x-m"><option value="exam" '+(S.mode==='exam'?'selected':'')+'>'+T('آزمون','Exam')+'</option><option value="practice" '+(S.mode==='practice'?'selected':'')+'>'+T('تمرین','Practice')+'</option></select></div></div>'
  +'<div class="row"><label class="crs-ck"><input type="checkbox" id="a4x-t" '+(S.timed?'checked':'')+'> '+T('زمان‌دار','Timed')+'</label><input type="number" min="1" id="a4x-min" value="'+S.min+'" style="width:80px"> '+T('دقیقه','min')+'<label class="crs-ck"><input type="checkbox" id="a4x-neg" '+(S.neg?'checked':'')+'> '+T('نمرهٔ منفی (هر غلط ⅓)','Negative marking')+'</label></div>'
  +'<div class="row" style="margin-top:10px"><button class="p" data-a="acd4_xgo" '+(tot?'':'disabled')+'>'+T('شروع آزمون','Start')+'</button><button data-a="acd4_xgo" data-k="1" '+(tot?'':'disabled')+'>🎯 '+T('شبیه‌ساز کنکور (تصادفی، زمان‌دار، منفی)','Konkur simulator')+'</button></div></div>';
 return h}
function xsync(){const S=xb(),g=id=>document.getElementById(id);if(g('a4x-n')){S.count=g('a4x-n').value;S.mode=g('a4x-m').value;S.timed=g('a4x-t').checked;S.min=parseInt(g('a4x-min').value,10)||30;S.neg=g('a4x-neg').checked}}
H.acd4_xmode=e=>{const C=CRs();C.setup=C.setup||{};C.setup.multi=e.dataset.v==='1';rr()};
H.acd4_xopen=e=>{xsync();const S=xb(),k=e.dataset.k;S.open[k]=!(S.open[k]===undefined?k.startsWith('k:'):S.open[k]);rr()};
H.acd4_xsel=e=>{xsync();const S=xb(),t=e.dataset.t,i=S.sel.indexOf(t);if(i>=0)S.sel.splice(i,1);else S.sel.push(t);rr()};
H.acd4_xmv=e=>{xsync();const S=xb(),i=+e.dataset.i,j=i+(+e.dataset.d);if(j<0||j>=S.sel.length)return;[S.sel[i],S.sel[j]]=[S.sel[j],S.sel[i]];rr()};
H.acd4_xrm=e=>{xsync();xb().sel.splice(+e.dataset.i,1);rr()};
H.acd4_xset=e=>{xsync();const S=xb(),k=e.dataset.k,v=e.dataset.v;if(k==='diff'){const d=+v,i=S.diffs.indexOf(d);if(i>=0){if(S.diffs.length>1)S.diffs.splice(i,1)}else S.diffs.push(d)}else S[k]=v;rr()};
H.acd4_xgo=e=>{xsync();const S=xb(),kon=!!e.dataset.k;if(!S.sel.length){toast(T('اول چیزی انتخاب کن','Pick something first'),1);return}
 const items=S.sel.map(t=>({cid:t.slice(0,t.indexOf('|')),scope:t.slice(t.indexOf('|')+1)})),n=Math.max(0,parseInt(S.count,10)||0);
 API().startMulti({items,diffs:S.diffs,count:kon&&!n?0:n,order:kon?'shuffle':S.order,mode:kon?'exam':S.mode,timed:kon||S.timed,minutes:kon?Math.max(10,Math.round((n||60))):S.min,neg:kon||S.neg,konkur:kon}).catch(x=>toast(String(x.message||x),1))};
try{API()&&API().mergeUndoInfo().then(i=>{ui.undo=!!i})}catch(e){}
window.daniAcd4={xbuilder,xtoggle,tree,chapterInfo,lessonChip,lessonCards,stat,cols,groups,courseTabs,crumb,lessonExtra,myLinks,placed,zipCards,todayCard};
})();
