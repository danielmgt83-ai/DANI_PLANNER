"use strict";
/* DANI · theme-aot.js
   تم‌های Attack on Titan: Eren (aoe1 تا aoe3)، Erwin (aow1)، Levi (aol1)، Mikasa (aom1).
   بعد از quotes-data.js بارگذاری می‌شود. فقط اضافه می‌کند؛ هیچ تم، تابع یا نام سراسری قبلی را عوض نمی‌کند (جز اضافه‌شدن جمله‌های AOT به استخر جمله‌ی همین تم‌ها). */
/* ===== Attack on Titan themes: quotes, images, icons, brand, home ===== */
const AOT_CH=['aot-eren','aot-erwin','aot-levi','aot-mikasa'];
const AOT_Q=[
['اگر نجنگی، نمی‌توانی ببری.','If you don\'t fight, you can\'t win.','Eren Yeager'],
['من به جلو رفتن ادامه می‌دهم.','I\'ll keep moving forward.','Eren Yeager'],
['می‌خواهم دنیای آن‌سوی دیوارها را ببینم.','I want to see the world beyond the walls.','Eren Yeager'],
['آزادی یک مکان نیست؛ یک انتخاب است.','Freedom is not a place; it is a choice.','Eren Yeager','m'],
['اقیانوس پایان نیست؛ آغاز است.','The ocean isn\'t the end, it\'s the beginning.','Eren Yeager','m'],
['آزادی رایگان نیست؛ هزینه دارد.','Freedom isn\'t free. It costs something.','Eren Yeager','m'],
['هر روز، یک قدم به آزادی نزدیک‌تر.','Every day, one step closer to freedom.','Eren Yeager','m'],
['قلب‌هایتان را تقدیم کنید!','Dedicate your hearts!','Erwin Smith'],
['سربازانم، خشمگین شوید! سربازانم، فریاد بزنید! سربازانم، بجنگید!','My soldiers, rage! My soldiers, scream! My soldiers, fight!','Erwin Smith'],
['رهبر کسی است که بهترین‌ها را در دیگران بیدار می‌کند.','A leader is someone who brings out the best in others.','Erwin Smith','m'],
['دنیا بی‌رحم است، اما زیبا هم هست و ارزش جنگیدن دارد.','The world is cruel, but it is also beautiful, and worth fighting for.','Erwin Smith','m'],
['حتی اگر بمیریم، نامی از خود برجا می‌گذاریم.','Even if we die, we\'ll leave a name behind.','Erwin Smith','m'],
['کسی که نتواند چیزی را فدا کند، هرگز چیزی را تغییر نمی‌دهد.','Someone who can\'t sacrifice anything can never change anything.','Armin Arlert'],
['تنها کاری که می‌توانیم بکنیم این است که باور کنیم از انتخابمان پشیمان نمی‌شویم.','The only thing we\'re allowed to do is to believe that we won\'t regret the choice we made.','Levi Ackerman'],
['انضباط یعنی آزادی.','Discipline is freedom.','Levi Ackerman','m'],
['قلبت را از نفرت پاک کن تا واضح ببینی.','Clean your heart of hate, and you\'ll see clearly.','Levi Ackerman','m'],
['برای بهترین بودن باید آماده‌ی کاری باشی که دیگران نمی‌کنند.','To be the best, you have to be willing to do what others won\'t.','Levi Ackerman','m'],
['این دنیا بی‌رحم است... و در عین حال بسیار زیباست.','This world is cruel... and yet it is very beautiful.','Mikasa Ackerman'],
['ارن... ممنون که شال را دور گردنم پیچیدی.','Eren... thank you for wrapping this scarf around me.','Mikasa Ackerman'],
['حتی آدم‌های قوی هم قلبی مهربان دارند.','Strong people also have a gentle side.','Mikasa Ackerman','m'],
['هر جا بروی، من کنار تو خواهم بود.','No matter where you go, I\'ll be by your side.','Mikasa Ackerman','m'],
['نه فقط برای یک رؤیا؛ برای کسانی که دوستشان دارم.','Not just for a dream, but for the people I care about.','Mikasa Ackerman','m'],
['بجنگ! بجنگ!','Fight! Fight!','Eren Yeager'],
['اگر ببری زنده می‌مانی، اگر ببازی می‌میری؛ و اگر نجنگی، نمی‌توانی ببری!','If you win, you live. If you lose, you die. If you don\'t fight, you can\'t win!','Eren Yeager'],
['تا آخرین‌شان را از بین می‌برم.','I\'ll wipe out every last one of them.','Eren Yeager'],
['پرنده‌ی قفس نمی‌مانم؛ بال‌هایم را خودم می‌سازم.','I won\'t stay a bird in a cage; I\'ll build my own wings.','Eren Yeager','i'],
['دیوار فقط تا وقتی دیوار است که قبولش کنی.','A wall is only a wall for as long as you accept it.','Eren Yeager','i'],
['ترس را بپذیر، ولی تسلیمش نشو.','Accept the fear, but don\'t surrender to it.','Eren Yeager','i'],
['هر صبح که بیدار می‌شوی، یک انتخاب جلوی توست.','Every morning you wake up, there is a choice in front of you.','Eren Yeager','i'],
['اگر ببرم زنده می‌مانم، اگر ببازم می‌میرم؛ و اگر نجنگم، نمی‌توانم ببرم.','If I win, I live. If I lose, I die. If I don\'t fight, I can\'t win.','Mikasa Ackerman'],
['شال سرخ قولی است که هر روز تازه‌اش می‌کنم.','The red scarf is a promise I renew every day.','Mikasa Ackerman','i'],
['قوی بودن یعنی کنار کسانی ایستادن که دوستشان داری.','Being strong means standing beside the people you love.','Mikasa Ackerman','i'],
['نترس؛ تا وقتی من هستم، به تو نمی‌رسند.','Don\'t be afraid; as long as I\'m here, they won\'t reach you.','Mikasa Ackerman','i'],
['سکوت هم یک جور جواب است.','Silence is also a kind of answer.','Mikasa Ackerman','i'],
['نمی‌دانم کدام درست است؛ پس انتخابی کن که کمتر پشیمانش شوی.','I don\'t know which is right, so choose the one you\'ll regret less.','Levi Ackerman'],
['اگر قرار است بمیری، بی‌دلیل نمیر.','If you\'re going to die, don\'t die for nothing.','Levi Ackerman','i'],
['هر روز تمرین کن، حتی وقتی کسی نگاه نمی‌کند.','Train every day, even when no one is watching.','Levi Ackerman','i'],
['شک را کنار بگذار؛ فقط قدم بعدی.','Drop the doubt; just take the next step.','Levi Ackerman','i'],
['نظم، اولین سلاح است.','Order is the first weapon.','Levi Ackerman','i'],
['تمیز کن، منظم باش، جلو برو.','Clean up, stay orderly, keep moving.','Levi Ackerman','i'],
['رهبری یعنی مسئولیت قدم اول.','Leadership is taking responsibility for the first step.','Erwin Smith','i'],
['امید تنها چیزی است که دشمن نمی‌تواند از ما بگیرد.','Hope is the one thing the enemy can\'t take from us.','Erwin Smith','i'],
['به جلو! امروز هم به‌اندازه‌ی دیروز شجاع باش.','Forward! Be as brave today as you were yesterday.','Erwin Smith','i'],
['برای حقیقت باید بهایش را پرداخت.','The truth has to be paid for.','Erwin Smith','i'],
['ترسیدن شرم‌آور نیست؛ نایستادن شرم‌آور است.','Being afraid is not shameful; refusing to stand is.','Armin Arlert','i'],
['فکر کردن سلاح من است.','Thinking is my weapon.','Armin Arlert','i'],
['می‌خواهم اقیانوس را ببینم؛ همراه تو.','I want to see the ocean, together with you.','Armin Arlert','i'],
['استراتژی خوب از شجاعت ساخته می‌شود، نه از قدرت.','A good strategy is built from courage, not from strength.','Armin Arlert','i'],
['کنجکاوی من را زنده نگه می‌دارد.','Curiosity keeps me alive.','Hange Zoë','i'],
['سؤال بپرس؛ دنیا جواب‌هایش را پنهان نمی‌کند، فقط منتظر می‌ماند.','Ask the question; the world isn\'t hiding its answers, it\'s just waiting.','Hange Zoë','i'],
['برای خودم زندگی می‌کنم.','I\'m going to live for myself.','Historia Reiss','i'],
['من قهرمان نیستم، ولی کنار شما می‌ایستم.','I\'m no hero, but I\'ll stand beside you.','Jean Kirstein','i']];
(function(){try{
 const N3='جمله‌ی الهام‌گرفته از روحیه‌ی شخصیت؛ دیالوگ رسمی نیست.',N1='ترجمه‌ی فارسی آزاد است؛ متن انگلیسی از حافظه آمده و ممکن است با دیالوگ رسمی کمی فرق کند.',N2='برگرفته از متن طرح‌هایی که فرستادی؛ دیالوگ رسمی نیست.';
 const v=qpVet({format:'dani-quotepack',version:1,id:'aot-quotes',name:'جملات هجوم به تایتان',character:'aot',author:'',quotes:AOT_Q.map(x=>({fa:x[0],en:x[1],a:x[2],src:x[3]==='i'?'الهام‌گرفته از شخصیت':x[3]?'الهام‌گرفته از طرح‌ها':'Attack on Titan',note:x[3]==='i'?N3:x[3]?N2:N1}))});
 if(v.pack)qpRegister(v.pack);else console.error('aot quotes',v.err)}catch(e){console.error('aot quotes',e)}})();
{const _hp=heroPool;heroPool=function(ch){const A=QPACKS['aot-quotes'];if(!AOT_CH.includes(ch)||!A)return _hp(ch);const nm={'aot-eren':'Eren','aot-erwin':'Erwin','aot-levi':'Levi','aot-mikasa':'Mikasa'}[ch],all=A.quotes.map((_,i)=>{const q=qpQ(A,i);return{id:q.id,fa:q.t,en:q.en,a:q.a}});const own=all.filter(x=>(x.a||'').startsWith(nm));return own.concat(own,own,all)}}
const AOT_I={eb:['eren-beach','50% 25%'],ep:['eren-port','50% 22%'],ee:['eren-eyes','50% 40%'],ef:['eren-face','50% 30%'],eo:['eren-ocean','50% 50%'],et:['eren-titan','50% 35%'],wg:['wings','50% 40%'],
 ws:['erwin-sunset','50% 20%'],wp:['erwin-port','50% 22%'],wh:['erwin-horse','50% 40%'],wm:['erwin-manga','50% 30%'],
 lj:['levi-jump','50% 35%'],lr:['levi-rain','50% 28%'],lc:['levi-cape','50% 22%'],
 ma:['mikasa-odm','50% 28%'],ms:['mikasa-scarf','50% 24%'],mf:['mikasa-autumn','50% 30%'],
 es1:['eren-scout-cloak','50% 35%'],es2:['eren-scout-blades','50% 25%'],es3:['eren-scout-collage','50% 30%'],es4:['eren-scout-jacket','50% 30%'],esk:['eren-sky','50% 55%'],
 lo:['levi-roof','50% 30%'],mb:['mikasa-blade','50% 28%'],md:['mikasa-duo','50% 30%'],bw:['eren-mikasa-bw','50% 35%']};
const aotImg=k=>'<img src="img/aot-'+AOT_I[k][0]+'.jpg" alt="" loading="lazy" decoding="async" style="object-position:'+AOT_I[k][1]+'">';
const AOT={
 aoe1:{ch:'aot-eren',L:'A',s:['eb','eo','ep'],g:[['ee','決意 Resolve'],['ef','自由 Freedom'],['et','地鳴 Rumbling'],['esk','空 The Sky']],kj:'自由',en:'EREN YEAGER',sub:'Beyond the Walls',ic:'odm'},
 aoe2:{ch:'aot-eren',L:'C',s:['es1','es3','es2'],g:[['es4','決意 Resolve'],['es2','刃 Blades'],['es3','壁 Walls'],['es1','調査兵団 Survey Corps']],kj:'壁',en:'EREN YEAGER',sub:'Scout Regiment',ic:'wall'},
 aoe3:{ch:'aot-eren',L:'B',s:['et','ef','ee'],g:[['eo','海 The Sea'],['eb','自由 Freedom'],['ep','決意 Resolve'],['wg','翼 Wings']],kj:'地鳴',en:'EREN YEAGER',sub:'The Rumbling',ic:'wall'},
 aow1:{ch:'aot-erwin',L:'A',s:['ws','wp','wh'],g:[['wm','犠牲 Sacrifice'],['wg','翼 Wings'],['ws','夜明け Dawn'],['wh','突撃 The Charge']],kj:'団長',en:'ERWIN SMITH',sub:'Sunrise Charge',ic:'odm'},
 aol1:{ch:'aot-levi',L:'C',s:['lj','lr','lc'],g:[['lc','静寂 Silence'],['lo','屋根 The Roof'],['lr','雨 Rain'],['lj','空 The Sky']],kj:'兵長',en:'LEVI ACKERMAN',sub:'Steel & Silence',ic:'wall'},
 aom1:{ch:'aot-mikasa',L:'B',s:['ms','ma','mf'],g:[['mf','秋 Autumn'],['md','絆 Bond'],['mb','刃 Blade'],['bw','二人 Together']],kj:'守',en:'MIKASA ACKERMAN',sub:'Crimson Scarf',ic:'odm'}};
{const mk=(id,name,desc,o)=>{if(!SKINS[id])SKINS[id]=Object.assign({},SK_DEF,{id,name,desc},o)};
mk('aoe1','Eren · Beyond the Walls','اقیانوس و افق؛ منوی تیغه‌ای، بنر اسلایدی و داشبورد سه‌ستونه',{lay:'side',dark:true,card:'glass',rad:16,btn:'pill',ic:'duo',home:'desk',qchar:'aot-eren',tag:'Freedom is a choice.',vars:{bg:'#0b1a24',c:'#112a38',t:'#dbe8ee',m:'#8fa9b6',b:'#1f4558',sb:'#08141c',ac:'#62b8cf',ac2:'#e9b27a',pt:'#06151c'},bgGradient:['#0b1a24','#133a4c','#0b1a24']});
mk('aoe2','Eren · Scout Regiment','سبز و برنج؛ نوار بالای کانجی، نوار جمله و خط زمانی',{lay:'top',dark:true,card:'outline',rad:6,btn:'sharp',ic:'bold',font:'serif',home:'desk',qchar:'aot-eren',tag:'Dedicate your heart.',vars:{bg:'#131a14',c:'#1b2519',t:'#e9e4d2',m:'#a2a58f',b:'#3a4934',sb:'#0d130e',ac:'#c2a35b',ac2:'#8aa874',pt:'#1a1405'}});
mk('aoe3','Eren · The Rumbling','نیلی و استخوانی؛ ریل آیکون و داشبورد موزاییکی',{lay:'rail',dark:true,card:'glass',rad:20,btn:'pill',ic:'line',home:'desk',qchar:'aot-eren',tag:'The earth will tremble.',vars:{bg:'#0c1022',c:'#141a38',t:'#e2e6f6',m:'#9aa3cc',b:'#2c3573',sb:'#080b1a',ac:'#8c9be0',ac2:'#cfd6f2',pt:'#0b0f22'},bgGradient:['#0c1022','#171e4a','#080b1a']});
mk('aow1','Erwin · Sunrise Charge','طلوع و پرچم؛ منوی طلایی و داشبورد سه‌ستونه',{lay:'side',dark:true,card:'default',rad:12,btn:'round',ic:'line',home:'desk',qchar:'aot-erwin',tag:'Dedicate your hearts.',vars:{bg:'#14100b',c:'#1f1810',t:'#f1e6cf',m:'#b3a283',b:'#4a3a1c',sb:'#0d0a06',ac:'#d4a24a',ac2:'#f0cf8e',pt:'#1a0f00'}});
mk('aol1','Levi · Steel & Silence','فولاد روشن؛ داک پایین و خط زمانی تمیز',{lay:'bottom',dark:false,card:'flat',rad:4,btn:'sharp',ic:'line',home:'desk',qchar:'aot-levi',tag:'Discipline is freedom.',vars:{bg:'#e8ecef',c:'#f7f9fa',t:'#17212a',m:'#5a6772',b:'#c9d2d9',sb:'#121b22',ac:'#3f6b73',ac2:'#17212a',pt:'#ffffff'}});
mk('aom1','Mikasa · Crimson Scarf','شال سرخ و پاییز؛ ریل آیکون و داشبورد موزاییکی',{lay:'rail',dark:true,card:'glass',rad:16,btn:'pill',ic:'duo',home:'desk',qchar:'aot-mikasa',tag:'I will be by your side.',vars:{bg:'#120c0e',c:'#1d1317',t:'#f3e6e8',m:'#b79aa2',b:'#4a2230',sb:'#0a0608',ac:'#c9485b',ac2:'#f0a3ad',pt:'#ffffff'}})}
const AOT_KJ={home:'家',dash:'務',res:'報',set:'設',dl:'期',hab:'習',rem:'鐘',qt:'言',acd:'学'};
PK_IC.aotA={home:'<path d="M12 21V8M12 8C9 5 5 5 2 6c1 4 5 6 10 6M12 8c3-3 7-3 10-2-1 4-5 6-10 6"/>',dash:'<path d="M4 4l16 16M20 4L4 20M4 4h4M20 4h-4M4 20h4M20 20h-4"/>',res:'<path d="M5 20V10l3-3 3 3v10M13 20V6l3-3 3 3v14M3 20h18"/>',set:'<circle cx="12" cy="12" r="3"/><path d="M12 2l2 3 3-1 1 3 3 2-2 3 2 3-3 2-1 3-3-1-2 3-2-3-3 1-1-3-3-2 2-3-2-3 3-2 1-3 3 1z"/>',dl:'<circle cx="12" cy="13" r="8"/><path d="M12 8v5l3 2M9 2h6"/>',hab:'<path d="M5 13l4 4L19 7M3 21h18"/>',rem:'<path d="M4 10v4h3l7 4V6L7 10zM17 9c2 1 2 5 0 6"/>',qt:'<path d="M5 6h5v5H8c0 3-1 4-3 5M14 6h5v5h-2c0 3-1 4-3 5"/>',acd:'<path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1zM12 6v14"/>'};
PK_IC.aotW={home:'<path d="M3 21V7h18v14M3 11h18M3 15h18M9 21v-6a3 3 0 016 0v6M7 7V4M12 7V4M17 7V4"/>',dash:'<path d="M2 12c3-6 17-6 20 0-3 6-17 6-20 0z"/><circle cx="12" cy="12" r="3"/><path d="M12 5v2M12 17v2"/>',res:'<path d="M3 20h18M5 20V9l3-4 3 4v11M13 20v-8h6v8"/>',set:'<path d="M4 7h16M4 12h16M4 17h16M9 4v6M15 9v6M8 14v6"/>',dl:'<path d="M12 2l7 4v6c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M12 8v4l3 2"/>',hab:'<path d="M12 3c4 4 6 7 6 10a6 6 0 01-12 0c0-3 2-6 6-10z"/>',rem:'<path d="M12 3a6 6 0 016 6c0 5 2 6 2 7H4c0-1 2-2 2-7a6 6 0 016-6zM10 20h4"/>',qt:'<path d="M3 5h18v11H9l-5 4v-4H3z"/>',acd:'<path d="M4 20V6l8-3 8 3v14M4 20h16M9 20v-6h6v6M12 3v4"/>'};
Object.keys(AOT).forEach(k=>{PK_IC[k]=PK_IC[AOT[k].ic==='odm'?'aotA':'aotW']});
const AOT_W='<svg viewBox="0 0 48 48" class="aw" aria-hidden="true"><path d="M24 44L22 24c-3-8-8-13-18-16 2 12 6 20 18 26z" fill="var(--aw1,#62b8cf)"/><path d="M24 44l2-20c3-8 8-13 18-16-2 12-6 20-18 26z" fill="var(--aw2,#eaf0f2)"/><path d="M24 44V10" stroke="#0008" stroke-width="1.4"/></svg>';
const aotK=()=>{const k=skId();return AOT[k]?k:null};
function AOTQ(){const k=aotK()||'aoe1',c=AOT[k].ch;if(aotK()&&db.set.aotch!==c){db.set.aotch=c;try{hqNav('new',c)}catch(e){}}const h=heroQuote(c);return[h.fa,h.en,h.a,h.id]}
const _aotApply=function(){const k=aotK(),st=document.documentElement.style;st.removeProperty('--aotf');if(!k)return;const T=AOT[k];st.setProperty('--aotf','url("img/aot-'+AOT_I[T.s[0]][0]+'.jpg")')};
const _aotDecor=function(nav){nav=nav||$('#nav');if(!nav)return;nav.querySelectorAll('.aot-brand,.aot-foot').forEach(e=>e.remove());const k=aotK();if(!k)return;const T=AOT[k],q=AOTQ();
 nav.insertAdjacentHTML('afterbegin','<div class="aot-brand">'+AOT_W+'<div><b>DANI <em>Planner</em></b><small>'+T.en+'</small></div></div>');
 if(k==='aoe2')nav.querySelectorAll('a[data-p]').forEach(a=>{const j=AOT_KJ[a.dataset.p];if(j&&!a.querySelector('.kj'))a.insertAdjacentHTML('afterbegin','<span class="kj" aria-hidden="true">'+j+'</span>')});
 if(T.L!=='C'||k==='aoe2')nav.insertAdjacentHTML('beforeend','<div class="aot-foot"><i></i><span class="kj" aria-hidden="true">'+T.kj+'</span><p>'+esc(q[1]||q[0])+'<br><em>— '+esc(q[2])+'</em></p></div>')};
function aotExtra(){let o='';try{hsList().filter(x=>x.on!==false&&!['dlc','tgt','overdue','quote','focus'].includes(x.id)).forEach(x=>{let h='';try{h=hsRender(x)}catch(e){console.error(e)}if(h&&String(h).trim())o+='<div class="aot-cell">'+h+'</div>'})}catch(e){console.error(e)}return o?'<div class="aot-x">'+o+'</div>':''}
function aotTicker(ch){let P=[];try{P=hqPool(ch)}catch(e){}if(!P.length)return'';const s=P.slice(0,14).map(q=>'<span>'+esc(q.fa)+(q.en?' · <i>'+esc(q.en)+'</i>':'')+'</span>').join('');return'<div class="aot-tick" aria-hidden="true"><div>'+s+s+'</div></div>'}
function aotGal(T){return'<div class="aot-gal">'+T.g.map(g=>'<figure>'+aotImg(g[0])+'<figcaption>'+esc(g[1])+'</figcaption></figure>').join('')+'</div>'}
function aotHome(k){const T=AOT[k],h0=homeTarget(),q=AOTQ(),pc=Math.max(0,Math.min(100,Math.round(h0&&h0.pr&&h0.pr.n?h0.pr.pc:0))),head=ivHead(),dl='<div class="deskwide">'+hDl()+'</div>',tail='<div class="deskwide">'+hOverdue()+'</div>'+hMgr();
 const hero='<section class="aot-hero"><div class="aot-txt"><span class="aot-kj" aria-hidden="true">'+T.kj+'</span><div class="aot-kick">'+AOT_W+'<span>'+T.en+' · '+T.sub+'</span></div>'+heroQB(q)+'<div class="aot-ring" style="--p:'+pc+'"><b>'+fa(pc)+'٪</b><small>امروز</small></div></div><div class="aot-pic">'+T.s.map(aotImg).join('')+'<span class="aot-dots" aria-hidden="true"><i></i><i></i><i></i></span></div></section>';let b;
 if(T.L==='A')b=ovCard()+hero+head+ivChips()+dl+'<div class="aot-g3"><div>'+hSchedule()+hCheck()+'</div><div>'+hSummary(h0)+hGoalsBars()+hFocusTimer()+'</div><div>'+hQuickLog()+hNoteDesk()+hActionsDesk()+'</div></div>'+aotGal(T)+'<div class="deskwide">'+hQuote()+'</div>'+aotExtra()+tail;
 else if(T.L==='B')b=ovCard()+head+hero+dl+'<div class="aot-mas">'+hSummary(h0)+hFocusTimer()+hSchedule()+hCheck()+hGoalsBars()+hQuickLog()+hNoteDesk()+hActionsDesk()+hQuote()+'</div>'+aotGal(T)+ivChips()+aotExtra()+tail;
 else b=ovCard()+hero+aotTicker(T.ch)+head+dl+'<div class="aot-tl"><div class="aot-spine">'+hSchedule()+hCheck()+hQuickLog()+'</div><div class="aot-rest">'+hFocusTimer()+hSummary(h0)+hGoalsBars()+hNoteDesk()+hActionsDesk()+'</div></div>'+aotGal(T)+'<div class="deskwide">'+hQuote()+'</div>'+aotExtra()+tail;
 return'<div class="home desk aot aot'+T.L+' '+k+'">'+b+'</div>'}
Object.keys(AOT).forEach(k=>{PKR.apply[k]=_aotApply;PKR.decor[k]=_aotDecor;PKR.home[k]=()=>aotHome(k)});
