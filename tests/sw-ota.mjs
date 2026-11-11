import fs from 'fs';import vm from 'vm';
const src=fs.readFileSync(new globalThis.URL("../sw.js",import.meta.url),'utf8');
function run(net,local){
  const store=new Map(),posts=[];let handlers={};
  const mk=(body,ct='text/javascript',st=200)=>({status:st,headers:{get:k=>k.toLowerCase()==='content-type'?ct:null},clone(){return mk(body,ct,st)},async text(){return body}});
  const caches={_:new Map(),async match(r,o){const u=typeof r==='string'?new URL(r,'https://localhost/').href:r.url;if(store.has(u))return store.get(u);if(o&&o.ignoreSearch){const b=u.split('?')[0];for(const [k,v] of store)if(k.split('?')[0]===b)return v}return undefined},async open(){return{async put(r,v){store.set(r.url,v)},async add(){},async keys(){return[]}}},async keys(){return[]}};
  const ctx={self:{addEventListener:(n,f)=>handlers[n]=f,clients:{matchAll:async()=>[{postMessage:m=>posts.push(m)}],claim(){}},skipWaiting(){}},location:{hostname:'localhost',port:'',origin:'https://localhost'},caches,URL,AbortController,setTimeout,clearTimeout,Response:{error:()=>({err:1})},
    fetch:async(u,o)=>{const url=typeof u==='string'?u:u.url;if(url.startsWith('https://danielmgt83')){const x=net(url);if(x==='throw')throw new Error('blocked');return mk(x.body,x.ct,x.st||200)}const l=local(url);if(l==='throw')throw new Error('nolocal');return mk(l.body,l.ct,l.st||200)},console};
  vm.createContext(ctx);vm.runInContext(src,ctx);return{ctx,handlers,store,posts,mk}}
const ev=(url,mode)=>{const p=[];return{request:{url,method:'GET',mode:mode||'no-cors'},respondWith(x){this.out=x},waitUntil(x){p.push(x)},p}};
let fails=0;const ok=(c,m)=>{console.log(c?'✅':'❌',m);if(!c)fails++};
const HTML_OK='<html><script src="js/boot.js"></script> new</html>';
// 1) فیلتر: صفحه‌ی html به‌جای js
{const t=run(()=>({body:'<html>blocked</html>',ct:'text/html'}),()=>({body:'local js',ct:'text/javascript'}));
 const e=ev('https://localhost/js/new.js?v=9');t.handlers.fetch(e);const r=await e.out;ok((await r.text())==='local js'&&![...t.store.keys()].some(k=>k.includes('new.js')),'صفحه‌ی فیلتر به‌جای js رد می‌شود و نسخه‌ی داخلی می‌آید')}
// 2) فایل نسخه‌دار تازه از اینترنت می‌آید و ذخیره می‌شود
{const t=run(()=>({body:'remote js',ct:'text/javascript'}),()=>({body:'old local',ct:'text/javascript'}));
 const e=ev('https://localhost/js/new.js?v=9');t.handlers.fetch(e);const r=await e.out;ok((await r.text())==='remote js'&&t.store.size===1,'فایل نسخه‌دار تازه از GitHub گرفته و ذخیره می‌شود')}
// 3) بدون اینترنت: از داخل برنامه
{const t=run(()=>'throw',()=>({body:'local js',ct:'text/javascript'}));
 const e=ev('https://localhost/js/x.js?v=2');t.handlers.fetch(e);const r=await e.out;ok((await r.text())==='local js','بدون اینترنت از فایل داخل برنامه باز می‌شود')}
// 4) index.html: اول نسخه‌ی ذخیره‌شده، بعد جایگزینی و پیام
{const t=run(()=>({body:HTML_OK,ct:'text/html'}),()=>({body:'x',ct:'text/html'}));
 t.store.set('https://localhost/',t.mk('<html><script src="js/boot.js"></script> old</html>','text/html'));
 const e=ev('https://localhost/','navigate');t.handlers.fetch(e);const r=await e.out;await Promise.all(e.p);
 ok((await r.text()).includes('old')&&(await t.store.get('https://localhost/').text()).includes('new')&&t.posts.length===1,'index.html: فوراً نسخه‌ی ذخیره‌شده، سپس نسخه‌ی تازه جایگزین و پیام داده می‌شود')}
// 5) index.html فیلتر
{const t=run(()=>({body:'<html>filter</html>',ct:'text/html'}),()=>({body:'x',ct:'text/html'}));
 t.store.set('https://localhost/',t.mk('<html><script src="js/boot.js"></script> old</html>','text/html'));
 const e=ev('https://localhost/','navigate');t.handlers.fetch(e);await e.out;await Promise.all(e.p);
 ok((await t.store.get('https://localhost/').text()).includes('old')&&t.posts.length===0,'index.html فیلترشده جایگزین نمی‌شود')}
// 6) پیام فقط برای صفحه‌ی اصلی و با نسخه‌ی تازه (rv)؛ فایل css تغییرکرده بی‌صدا جایگزین می‌شود
{const t=run(u=>u.endsWith('dani.css')?{body:'new css',ct:'text/css'}:{body:'<html><script src="js/boot.js"></script><script src="js/fx.js?v=9z"></script></html>',ct:'text/html'},()=>({body:'x',ct:'text/html'}));
 t.store.set('https://localhost/dani.css',t.mk('old css','text/css'));
 const e1=ev('https://localhost/dani.css');t.handlers.fetch(e1);await e1.out;await Promise.all(e1.p);
 const noMsg=t.posts.length===0&&(await t.store.get('https://localhost/dani.css').text())==='new css';
 t.store.set('https://localhost/',t.mk('<html><script src="js/boot.js"></script><script src="js/fx.js?v=8f"></script></html>','text/html'));
 const e2=ev('https://localhost/','navigate');t.handlers.fetch(e2);await e2.out;await Promise.all(e2.p);
 ok(noMsg&&t.posts.length===1&&t.posts[0].rv==='9z','پیام فقط برای index.html و با شماره‌ی نسخه‌ی تازه')}
process.exit(fails?1:0)
