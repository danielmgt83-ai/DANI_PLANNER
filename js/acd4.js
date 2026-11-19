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
const ui={open:{},ct:{}};
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
 const dup=C.cache.lessons.some(l=>/آزمون تشخیصی/.test(l.title||''));if(!dup)return'';
 const on=x.on!==false;
 return'<div class="c" style="border-color:#ea580c"><h3>⚠ '+T('محتوای تکراری پیدا شد','Duplicate content found')+'</h3>'
  +'<p class="m">'+T('افزونه‌ی قدیمی «'+E(x.name||'درس‌ها')+'» (آزمون تشخیصی و فصل ۳ گرامر) همان محتوایی است که در دوره‌ی گرامر هم هست؛ برای همین دو جا می‌دیدی.','The old “Lessons” add-on repeats content that is also in a course.')+'</p>'
  +(on?'<p class="m">'+T('پنهان‌کردن فقط افزونه را خاموش می‌کند؛ هیچ داده‌ای پاک نمی‌شود و هر وقت بخواهی برمی‌گردد. اول مطمئن شو پیشرفتی در آن نداری.','Hiding only turns the add-on off; nothing is deleted.')+'</p><button class="p" data-a="acd4_ext" data-v="0">'+T('پنهان کردن افزونه‌ی قدیمی','Hide old add-on')+'</button>'+' <button data-a="acd3_go" data-k="learn">'+T('باز کردن درس‌های قدیمی','Open old lessons')+'</button>'
   :'<p class="m">'+T('الان خاموش است (بعد از بستن و باز کردن برنامه دیگر دیده نمی‌شود).','Currently off.')+'</p><button data-a="acd4_ext" data-v="1">'+T('برگرداندن','Restore')+'</button>')+'</div>'}

function tree(){const C=CRs();if(!C)return'';const cs=C.cache.courses,used=new Set();let h=todayCard();
 h+='<div class="c"><h3>'+T('مجموعه‌ها و درس‌ها','Collections & subjects')+'</h3><p class="m">'+T('هر درس یک فایل است و داخلش فصل ← مبحث ← تدریس، فلش‌کارت، تمرین و آزمون. مجموعه‌ها فقط برای مرتب‌کردن‌اند.','Each subject is one file: chapters → topics → teaching, cards, practice, exams. Collections only group them.')+'</p><button data-a="acd4_new">＋ '+T('مجموعه‌ی تازه','New collection')+'</button></div>';
 cols().forEach(col=>{const l=col.cids.map(id=>cs.find(c=>c.id===id)).filter(Boolean);l.forEach(c=>used.add(c.id));h+=colCard(col,l)});
 const free=cs.filter(c=>!used.has(c.id));
 h+=suggest(free);
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
 if(!er.length&&!nf)return'';
 return'<div class="c"><div class="row">'+(nf?'<button class="chip" data-a="acd4_goct" data-c="'+E(l.courseId)+'" data-k="fm">📐 '+F(nf)+' '+T('فرمول در این مبحث','formulas here')+'</button>':'')+(er.length?'<button class="chip" data-a="acd4_goct" data-c="'+E(l.courseId)+'" data-k="er">⚠ '+F(op)+' '+T('اشتباه باز از','open mistakes of')+' '+F(er.length)+'</button>':'')+'</div></div>'}
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
window.daniAcd4={tree,chapterInfo,lessonChip,lessonCards,stat,cols,groups,courseTabs,crumb,lessonExtra,myLinks,placed,zipCards,todayCard};
})();
