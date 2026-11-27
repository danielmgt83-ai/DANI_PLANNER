/* ===== DANI Courses (آکادمی دوره‌ها) v1 — ماژول افزوده؛ به داده‌های قبلی پلنر دست نمی‌زند ===== */
(function(){
'use strict';
const CRV={template:1,schema:1,app:'1.11-academy'};
const enc=new TextEncoder(),dec=new TextDecoder('utf-8');
const E_=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const faN=n=>{try{return fa(n)}catch(e){return String(n)}};
const ID_RE=/^[A-Za-z0-9][A-Za-z0-9_.\-]{0,63}$/;
const okId=s=>typeof s==='string'&&ID_RE.test(s)&&!s.startsWith('__');
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const nowISO=()=>new Date().toISOString();
const normDigits=s=>String(s).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[٫]/g,'.').replace(/[٬]/g,'').replace(/−/g,'-');
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}
function semver(v){return String(v||'0').split(/[.\-]/).map(x=>parseInt(x,10)||0)}
function cmpVer(a,b){const x=semver(a),y=semver(b);for(let i=0;i<Math.max(x.length,y.length);i++){const d=(x[i]||0)-(y[i]||0);if(d)return d<0?-1:1}return 0}
const MIME={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',svg:'image/svg+xml'};
const extOf=p=>(String(p).split('.').pop()||'').toLowerCase();

/* ---------- CRC32 + ZIP ---------- */
const CT=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32b(u8){let c=0xFFFFFFFF;for(let i=0;i<u8.length;i++)c=CT[(c^u8[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
const LIM={zip:300*1024*1024,entry:80*1024*1024,json:8*1024*1024,entries:6000};
async function inflateRaw(u8,max){
  if(typeof DecompressionStream==='undefined')throw new Error('این مرورگر فشرده‌سازی ZIP را پشتیبانی نمی‌کند؛ از Chrome/Edge/Safari جدید استفاده کنید');
  const s=new Blob([u8]).stream().pipeThrough(new DecompressionStream('deflate-raw')),rd=s.getReader(),parts=[];let n=0;
  /* v160: بازکردن تکه‌تکه با سقف اندازه؛ ZIP بمب قبل از پرشدن حافظه رد می‌شود */
  for(;;){const r=await rd.read();if(r.done)break;n+=r.value.length;if(max!=null&&n>max){try{rd.cancel()}catch(e){}throw new Error('فایل داخل ZIP بزرگ‌تر از اندازه‌ی اعلام‌شده است (ZIP ناسالم)')}parts.push(r.value)}
  const out=new Uint8Array(n);let o=0;parts.forEach(x=>{out.set(x,o);o+=x.length});return out;
}
async function zipRead(buf){
  if(buf.byteLength>LIM.zip)throw new Error('حجم فایل بیش از حد مجاز است');
  const dv=new DataView(buf),u8=new Uint8Array(buf);let e=-1;
  for(let i=buf.byteLength-22;i>=Math.max(0,buf.byteLength-22-65535);i--){if(dv.getUint32(i,true)===0x06054b50){e=i;break}}
  if(e<0)throw new Error('فایل ZIP معتبر نیست یا ناقص است (انتهای فایل پیدا نشد)');
  const n=dv.getUint16(e+10,true),cdOff=dv.getUint32(e+16,true);
  if(n===0xffff||cdOff===0xffffffff)throw new Error('ZIP64 پشتیبانی نمی‌شود');
  if(n>LIM.entries)throw new Error('تعداد فایل‌های داخل ZIP بیش از حد مجاز است');
  const ents=new Map();let p=cdOff,total=0;
  for(let i=0;i<n;i++){
    if(p+46>buf.byteLength||dv.getUint32(p,true)!==0x02014b50)throw new Error('فهرست داخلی ZIP خراب است');
    const flag=dv.getUint16(p+8,true),meth=dv.getUint16(p+10,true),crc=dv.getUint32(p+16,true),cs=dv.getUint32(p+20,true),us=dv.getUint32(p+24,true),nl=dv.getUint16(p+28,true),xl=dv.getUint16(p+30,true),cl=dv.getUint16(p+32,true),lo=dv.getUint32(p+42,true);
    const name=dec.decode(u8.subarray(p+46,p+46+nl));p+=46+nl+xl+cl;
    if(name.endsWith('/'))continue;
    if(flag&1)throw new Error('ZIP رمزگذاری‌شده پشتیبانی نمی‌شود: '+name);
    if(/(^|\/)\.\.(\/|$)/.test(name)||name.startsWith('/')||/^[A-Za-z]:/.test(name)||name.includes('\\'))throw new Error('مسیر ناامن داخل ZIP: '+name);
    if(us>LIM.entry)throw new Error('فایل بسیار بزرگ داخل ZIP: '+name);
    total+=us;if(total>LIM.zip)throw new Error('حجم باز‌شده‌ی ZIP بیش از حد مجاز است');
    ents.set(name,{name,meth,crc,cs,us,lo});
  }
  return{ents,async read(name){
    const x=ents.get(name);if(!x)throw new Error('فایل در ZIP نیست: '+name);
    if(dv.getUint32(x.lo,true)!==0x04034b50)throw new Error('سرآیند فایل خراب است: '+name);
    const st=x.lo+30+dv.getUint16(x.lo+26,true)+dv.getUint16(x.lo+28,true);
    if(st+x.cs>buf.byteLength)throw new Error('فایل ناقص است (کوتاه‌شده): '+name);
    const raw=u8.subarray(st,st+x.cs);let out;
    if(x.meth===0)out=raw.slice();else if(x.meth===8)out=await inflateRaw(raw,x.us);else throw new Error('روش فشرده‌سازی پشتیبانی نمی‌شود: '+name);
    if(out.length!==x.us)throw new Error('اندازه‌ی فایل با فهرست نمی‌خواند: '+name);
    if(crc32b(out)!==x.crc)throw new Error('بررسی صحت (CRC) ناموفق: '+name);
    return out}};
}
function zipWrite(files){ // store-only، سازگار با همه‌ی برنامه‌های ZIP
  const parts=[],cd=[];let off=0;
  const u16=v=>[v&255,(v>>8)&255],u32=v=>[v&255,(v>>8)&255,(v>>16)&255,(v>>>24)&255];
  for(const f of files){
    const nm=enc.encode(f.name),d=f.data,crc=crc32b(d);
    const lh=new Uint8Array([0x50,0x4b,3,4,...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0x21),...u32(crc),...u32(d.length),...u32(d.length),...u16(nm.length),...u16(0)]);
    parts.push(lh,nm,d);
    cd.push(new Uint8Array([0x50,0x4b,1,2,...u16(20),...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0x21),...u32(crc),...u32(d.length),...u32(d.length),...u16(nm.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(off)]),nm);
    off+=lh.length+nm.length+d.length;
  }
  let cs=0;cd.forEach(x=>cs+=x.length);
  const end=new Uint8Array([0x50,0x4b,5,6,0,0,0,0,...u16(files.length),...u16(files.length),...u32(cs),...u32(off),0,0]);
  return new Blob([...parts,...cd,end],{type:'application/zip'});
}

/* خروجی ZIP با فشرده‌سازی deflate برای ورودی‌های متنی (JSON/SVG…)؛ تصاویر و صدا همان‌طور ذخیره می‌شوند */
async function deflateRaw(u8){const s=new Blob([u8]).stream().pipeThrough(new CompressionStream('deflate-raw'));return new Uint8Array(await new Response(s).arrayBuffer())}
async function zipWriteZ(files){
  const canZ=typeof CompressionStream!=='undefined',ents=[];
  for(const f of files){let data=f.data,meth=0;
    if(f.z&&canZ&&data.length>600){try{const c=await deflateRaw(data);if(c.length<data.length*0.92){data=c;meth=8}}catch(e){}}
    ents.push({name:f.name,raw:f.data,data,meth})}
  const parts=[],cd=[];let off=0;
  const u16=v=>[v&255,(v>>8)&255],u32=v=>[v&255,(v>>8)&255,(v>>16)&255,(v>>>24)&255];
  for(const f of ents){
    const nm=enc.encode(f.name),crc=crc32b(f.raw),cs=f.data.length,us=f.raw.length;
    const lh=new Uint8Array([0x50,0x4b,3,4,...u16(20),...u16(0x0800),...u16(f.meth),...u16(0),...u16(0x21),...u32(crc),...u32(cs),...u32(us),...u16(nm.length),...u16(0)]);
    parts.push(lh,nm,f.data);
    cd.push(new Uint8Array([0x50,0x4b,1,2,...u16(20),...u16(20),...u16(0x0800),...u16(f.meth),...u16(0),...u16(0x21),...u32(crc),...u32(cs),...u32(us),...u16(nm.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(off)]),nm);
    off+=lh.length+nm.length+cs}
  let cds=0;cd.forEach(x=>cds+=x.length);
  const end=new Uint8Array([0x50,0x4b,5,6,0,0,0,0,...u16(ents.length),...u16(ents.length),...u32(cds),...u32(off),0,0]);
  return new Blob([...parts,...cd,end],{type:'application/zip'})}

const readFileBuf=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(new Error('خواندن فایل ممکن نشد'));r.readAsArrayBuffer(f)});
function download(name,blob){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000)}

/* ---------- IndexedDB ---------- */
const STORES=[['courses','id'],['lessons','id'],['questions','id'],['sources','id'],['assets','key'],['progress','id'],['attempts','id'],['bookmarks','id'],['notes','id'],['errors','id'],['meta','key']];
const COURSE_STORES=['courses','lessons','questions','sources','assets'],USER_STORES=['progress','attempts','bookmarks','notes','errors'];
const rq=r=>new Promise((a,b)=>{r.onsuccess=()=>a(r.result);r.onerror=()=>b(r.error)});
/* حالت موقت (فقط وقتی IndexedDB مرورگر در دسترس نیست): داده در حافظه‌ی همین صفحه می‌ماند */
const MEMDB={};
const memMap=n=>MEMDB[n]||(MEMDB[n]=new Map());
const kpOf=n=>STORES.find(x=>x[0]===n)[1];
function fkReq(fn){const r={result:undefined,error:null,onsuccess:null,onerror:null};Promise.resolve().then(()=>{try{r.result=fn()}catch(e){r.error=e;if(r.onerror)r.onerror();return}if(r.onsuccess)r.onsuccess()});return r}
function memStore(n){const m=memMap(n),kp=kpOf(n);
  const idx=c=>[...m.values()].filter(o=>o.courseId===c);
  return{put:o=>fkReq(()=>{m.set(o[kp],o);return o[kp]}),get:k=>fkReq(()=>m.get(k)),getAll:()=>fkReq(()=>[...m.values()]),delete:k=>fkReq(()=>{m.delete(k)}),clear:()=>fkReq(()=>{m.clear()}),
    index:()=>({getAll:c=>fkReq(()=>idx(c)),getAllKeys:c=>fkReq(()=>idx(c).map(o=>o[kp]))})}}
async function memTx(names,fn){
  const snap=names.map(n=>[n,new Map(memMap(n))]);
  try{return await fn({objectStore:memStore,abort(){}})}
  catch(e){snap.forEach(([n,m])=>{MEMDB[n]=m});throw e}
}
const IDB={p:null,
  open(){if(this.p)return this.p;this.p=new Promise((res,rej)=>{
    if(typeof indexedDB==='undefined'){rej(new Error('IndexedDB در این مرورگر در دسترس نیست'));return}
    let r;try{r=indexedDB.open('dani_academy',1)}catch(x){rej(x);return}
    r.onupgradeneeded=()=>{const d=r.result;STORES.forEach(([n,k])=>{if(!d.objectStoreNames.contains(n)){const s=d.createObjectStore(n,{keyPath:k});if(['lessons','questions','sources','assets'].includes(n))s.createIndex('courseId','courseId')}})};
    r.onsuccess=()=>{const d=r.result;d.onversionchange=()=>d.close();res(d)};
    r.onerror=()=>rej(r.error||new Error('باز کردن پایگاه داده ممکن نشد'));
    r.onblocked=()=>rej(new Error('پایگاه داده توسط تب دیگری قفل شده است؛ تب‌های دیگر را ببندید'));
  });this.p.catch(()=>{this.p=null});return this.p},
  mem:false,memErr:null,
  async tx(names,mode,fn){
    if(!this.mem){try{var d=await this.open()}catch(e){this.mem=true;this.memErr=e}}
    if(this.mem)return memTx(names,fn);
    return new Promise((res,rej)=>{const t=d.transaction(names,mode);let out;t.oncomplete=()=>res(out);t.onabort=()=>rej(t.error||new Error('تراکنش لغو شد'));t.onerror=()=>{};Promise.resolve().then(()=>fn(t)).then(v=>{out=v},e=>{try{t.abort()}catch(x){}rej(e)})})},
  all(s){return this.tx([s],'readonly',t=>rq(t.objectStore(s).getAll()))},
  get(s,k){return this.tx([s],'readonly',t=>rq(t.objectStore(s).get(k)))},
  put(s,o){return this.tx([s],'readwrite',t=>rq(t.objectStore(s).put(o)))},
  putMany(s,l){return this.tx([s],'readwrite',async t=>{const st=t.objectStore(s);for(const o of l)await rq(st.put(o))})},
  del(s,k){return this.tx([s],'readwrite',t=>rq(t.objectStore(s).delete(k)))},
  clear(s){return this.tx([s],'readwrite',t=>rq(t.objectStore(s).clear()))},
  byCourse(s,c){return this.tx([s],'readonly',t=>rq(t.objectStore(s).index('courseId').getAll(c)))}
};
function storeErr(e){const n=e&&e.name;if(/backing store|UnknownError|SecurityError|InvalidStateError|not allowed|denied/i.test((e&&e.message)||'')||n==='SecurityError'||n==='InvalidStateError')return'مرورگر اجازه‌ی باز کردن پایگاه داده‌ی آکادمی را نمی‌دهد ('+((e&&e.message)||n)+')';if(n==='QuotaExceededError')return'فضای ذخیره‌سازی مرورگر پر است؛ دوره‌های بی‌استفاده را حذف یا پشتیبان بگیرید';return(e&&e.message)||'خطای نامشخص ذخیره‌سازی'}

/* ---------- LaTeX (زیرمجموعه) → MathML؛ کاملاً آفلاین ---------- */
const MJ={
 greek:{alpha:'α',beta:'β',gamma:'γ',delta:'δ',epsilon:'ϵ',varepsilon:'ε',zeta:'ζ',eta:'η',theta:'θ',vartheta:'ϑ',iota:'ι',kappa:'κ',lambda:'λ',mu:'μ',nu:'ν',xi:'ξ',pi:'π',rho:'ρ',sigma:'σ',tau:'τ',upsilon:'υ',phi:'ϕ',varphi:'φ',chi:'χ',psi:'ψ',omega:'ω',Gamma:'Γ',Delta:'Δ',Theta:'Θ',Lambda:'Λ',Xi:'Ξ',Pi:'Π',Sigma:'Σ',Phi:'Φ',Psi:'Ψ',Omega:'Ω'},
 ident:{infty:'∞',partial:'∂',nabla:'∇',emptyset:'∅',ell:'ℓ',hbar:'ℏ',aleph:'ℵ',angle:'∠',triangle:'△',degree:'°',prime:'′',Re:'ℜ',Im:'ℑ'},
 sym:{to:'→',rightarrow:'→',leftarrow:'←',Rightarrow:'⇒',Leftarrow:'⇐',leftrightarrow:'↔',Leftrightarrow:'⇔',implies:'⇒',iff:'⇔',mapsto:'↦',uparrow:'↑',downarrow:'↓',cdot:'⋅',times:'×',div:'÷',pm:'±',mp:'∓',leq:'≤',le:'≤',geq:'≥',ge:'≥',neq:'≠',ne:'≠',approx:'≈',equiv:'≡',sim:'∼',cong:'≅',propto:'∝',in:'∈',notin:'∉',ni:'∋',subset:'⊂',subseteq:'⊆',supset:'⊃',supseteq:'⊇',cup:'∪',cap:'∩',forall:'∀',exists:'∃',circ:'∘',ldots:'…',dots:'…',cdots:'⋯',vdots:'⋮',ddots:'⋱',therefore:'∴',because:'∵',perp:'⊥',parallel:'∥',ll:'≪',gg:'≫',neg:'¬',land:'∧',lor:'∨',star:'⋆',ast:'∗',oplus:'⊕',otimes:'⊗',setminus:'∖',mid:'∣',lbrace:'{',rbrace:'}',langle:'⟨',rangle:'⟩',lfloor:'⌊',rfloor:'⌋',lceil:'⌈',rceil:'⌉','{':'{','}':'}','|':'‖','%':'%','&':'&','_':'_','$':'$','#':'#'},
 fn:new Set(['sin','cos','tan','cot','sec','csc','arcsin','arccos','arctan','sinh','cosh','tanh','coth','ln','log','lg','exp','det','gcd','lim','max','min','sup','inf','deg','dim','ker','arg','Pr','mod','limsup','liminf']),
 limFn:new Set(['lim','max','min','sup','inf','limsup','liminf']),
 big:{sum:'∑',prod:'∏',int:'∫',iint:'∬',iiint:'∭',oint:'∮',bigcup:'⋃',bigcap:'⋂'},
 limBig:new Set(['sum','prod','bigcup','bigcap']),
 acc:{bar:'¯',overline:'¯',hat:'^',widehat:'^',tilde:'~',widetilde:'~',vec:'→',dot:'˙',ddot:'¨',overrightarrow:'→'},
 bb:{R:'ℝ',N:'ℕ',Z:'ℤ',Q:'ℚ',C:'ℂ',P:'ℙ',E:'𝔼'},
 envD:{pmatrix:['(',')'],bmatrix:['[',']'],Bmatrix:['{','}'],vmatrix:['|','|'],Vmatrix:['‖','‖'],matrix:null,smallmatrix:null,cases:['{',null],aligned:null,align:null,'align*':null,split:null,gathered:null,eqnarray:null,array:null,alignedat:null},
 txtCmd:new Set(['text','mbox','textrm','textit','textbf','mathrm','mathbf','mathit','mathbb','mathcal','mathsf','mathtt','operatorname','boldsymbol','bm'])
};
function texTok(s){
  const T=[];let i=0;
  while(i<s.length){
    const c=s[i];
    if(/\s/.test(c)){i++;continue}
    if(c==='%'&&false){}
    if(c==='\\'){
      let j=i+1;
      if(j<s.length&&/[A-Za-z]/.test(s[j])){while(j<s.length&&/[A-Za-z]/.test(s[j]))j++;const v=s.slice(i+1,j);
        if(MJ.txtCmd.has(v)){let k=j;while(k<s.length&&/\s/.test(s[k]))k++;
          if(s[k]==='{'){let d=0,m=k;for(;m<s.length;m++){if(s[m]==='{')d++;else if(s[m]==='}'){d--;if(!d)break}}
            if(d)throw new Error('آکولاد بسته‌نشده در '+v);T.push({t:'txt',cmd:v,v:s.slice(k+1,m)});i=m+1;continue}}
        T.push({t:'cmd',v});i=j;continue}
      T.push({t:'cmd',v:s[j]||''});i=j+1;continue}
    T.push({t:'c',v:c});i++;
  }
  return T;
}
function tex2mml(src,display){
  const T=texTok(String(src));let i=0;
  const isC=(t,v)=>t&&t.t==='c'&&t.v===v,isCmd=(t,v)=>t&&t.t==='cmd'&&(v==null||t.v===v);
  const mo=(x,extra)=>'<mo'+(extra||'')+'>'+E_(x)+'</mo>';
  function arg(){const t=T[i];if(!t)throw new Error('آرگومان ناقص');if(isC(t,'{')){i++;const r=seq(x=>isC(x,'}'));if(!isC(T[i],'}'))throw new Error('آکولاد بسته‌نشده');i++;return'<mrow>'+r+'</mrow>'}return atom(true).x}
  function seq(stop){let o='';while(i<T.length&&!stop(T[i])){const r=scripted();o+=r}return o}
  function scripted(){
    const a=atom();let sub='',sup='',pr='';
    if(a.noscript)return a.x;
    const af=a.fn?'<mo>&#x2061;</mo>':'';
    for(;;){const t=T[i];
      if(isC(t,'^')){i++;if(sup)throw new Error('توان دوتایی');sup=arg()}
      else if(isC(t,'_')){i++;if(sub)throw new Error('اندیس دوتایی');sub=arg()}
      else if(isC(t,"'")){i++;pr+='′'}
      else break}
    if(pr)sup=sup?'<mrow><mo>′</mo>'+sup+'</mrow>':'<mo>′</mo>';
    if(!sub&&!sup)return a.x+af;
    const lim=a.lim&&(display!==false);
    if(sub&&sup)return(lim?'<munderover>':'<msubsup>')+a.x+sub+sup+(lim?'</munderover>':'</msubsup>')+af;
    if(sub)return(lim?'<munder>':'<msub>')+a.x+sub+(lim?'</munder>':'</msub>')+af;
    return(lim?'<mover>':'<msup>')+a.x+sup+(lim?'</mover>':'</msup>')+af;
  }
  function delim(){const t=T[i++];if(!t)throw new Error('جداکننده ناقص');if(t.t==='c')return t.v==='.'?'':t.v;if(t.v in MJ.sym)return MJ.sym[t.v];if(t.v==='|')return'‖';return t.v}
  function rows(stop){ // → [[cell,...],...]
    const R=[[]];let cur='';
    const flush=()=>{R[R.length-1].push('<mrow>'+cur+'</mrow>');cur=''};
    while(i<T.length&&!stop(T[i])){const t=T[i];
      if(isC(t,'&')){i++;flush();continue}
      if(isCmd(t,'\\')){i++;flush();R.push([]);continue}
      cur+=scripted()}
    flush();
    if(R.length>1&&R[R.length-1].length===1&&R[R.length-1][0]==='<mrow></mrow>')R.pop();
    return R}
  const tbl=(R,al)=>'<mtable'+(al?' columnalign="'+al+'"':'')+' rowspacing="0.5em">'+R.map(r=>'<mtr>'+r.map(c=>'<mtd>'+c+'</mtd>').join('')+'</mtr>').join('')+'</mtable>';
  function atom(single){
    const t=T[i++];if(!t)throw new Error('عبارت ناقص');
    if(t.t==='txt'){const v=t.v;
      if(t.cmd==='mathbb')return{x:'<mi mathvariant="normal">'+E_(v.split('').map(c=>MJ.bb[c]||c).join(''))+'</mi>'};
      if(t.cmd==='mathbf'||t.cmd==='boldsymbol'||t.cmd==='bm')return{x:'<mi mathvariant="bold">'+E_(v)+'</mi>'};
      if(t.cmd==='operatorname'||t.cmd==='mathrm'){const o={x:'<mi mathvariant="normal">'+E_(v)+'</mi>'};o.lim=MJ.limFn.has(v);return o}
      if(t.cmd==='mathcal'||t.cmd==='mathsf'||t.cmd==='mathtt'||t.cmd==='mathit')return{x:'<mi>'+E_(v)+'</mi>'};
      return{x:'<mtext>'+E_(v)+'</mtext>'}}
    if(t.t==='c'){const c=t.v;
      if(c==='{'){const r=seq(x=>isC(x,'}'));if(!isC(T[i],'}'))throw new Error('آکولاد بسته‌نشده');i++;return{x:'<mrow>'+r+'</mrow>'}}
      if(c==='}')throw new Error('آکولاد اضافه');
      if(c==='^'||c==='_'||c==='&')throw new Error('نویسه‌ی نابجا: '+c);
      if(/[0-9]/.test(c)||(c==='.'&&T[i]&&T[i].t==='c'&&/[0-9]/.test(T[i].v))){let n=c;while(!single&&T[i]&&T[i].t==='c'&&/[0-9.]/.test(T[i].v)&&!(T[i].v==='.'&&!(T[i+1]&&T[i+1].t==='c'&&/[0-9]/.test(T[i+1].v)))){n+=T[i++].v}return{x:'<mn>'+n+'</mn>'}}
      if(/[A-Za-z]/.test(c))return{x:'<mi>'+c+'</mi>'};
      if(c==='-')return{x:mo('−')};
      if(c==='~')return{x:'<mspace width="0.3em"/>'};
      if('+=<>/*|(),.;:!?[]'.includes(c)){const fence='()[]|'.includes(c);return{x:mo(c,fence?' stretchy="false"':'')}}
      return{x:'<mi>'+E_(c)+'</mi>'}}
    const v=t.v;
    if(v==='frac'||v==='dfrac'||v==='tfrac'){const a=arg(),b=arg();return{x:'<mfrac>'+a+b+'</mfrac>'}}
    if(v==='binom'){const a=arg(),b=arg();return{x:mo('(')+'<mfrac linethickness="0">'+a+b+'</mfrac>'+mo(')')}}
    if(v==='sqrt'){let idx=null;if(isC(T[i],'[')){i++;let s='';while(T[i]&&!isC(T[i],']')){s+=scripted()}i++;idx=s}const a=arg();return{x:idx!=null?'<mroot>'+a+'<mrow>'+idx+'</mrow></mroot>':'<msqrt>'+a+'</msqrt>'}}
    if(v==='left'){const l=delim(),b=seq(x=>isCmd(x,'right'));if(!isCmd(T[i],'right'))throw new Error('\\left بدون \\right');i++;const r=delim();return{x:'<mrow>'+(l?mo(l,' stretchy="true" fence="true"'):'')+b+(r?mo(r,' stretchy="true" fence="true"'):'')+'</mrow>'}}
    if(v==='right')throw new Error('\\right بدون \\left');
    if(/^(big|Big|bigg|Bigg|bigl|bigr|Bigl|Bigr|biggl|biggr|Biggl|Biggr)$/.test(v)){const d=delim();return{x:d?mo(d):''}}
    if(v==='begin'){
      let nm='';if(!isC(T[i],'{'))throw new Error('نام محیط ناقص');i++;while(T[i]&&!isC(T[i],'}')){nm+=T[i].v||T[i].t;i++}i++;
      if(!(nm in MJ.envD))throw new Error('محیط پشتیبانی‌نشده: '+nm);
      if(nm==='array'||nm==='alignedat'){if(isC(T[i],'{')){while(T[i]&&!isC(T[i],'}'))i++;i++}}
      const R=rows(x=>isCmd(x,'end'));
      if(!isCmd(T[i],'end'))throw new Error('\\end پیدا نشد برای '+nm);i++;
      if(isC(T[i],'{')){while(T[i]&&!isC(T[i],'}'))i++;i++}
      const al=/align|split|eqnarray/.test(nm)?'right left':nm==='cases'?'left left':nm==='gathered'?'center':null;
      let m=tbl(R,al);const d=MJ.envD[nm];
      if(d){m='<mrow>'+(d[0]?mo(d[0],' stretchy="true" fence="true"'):mo('',' fence="true"'))+m+(d[1]?mo(d[1],' stretchy="true" fence="true"'):mo('',' fence="true"'))+'</mrow>'}
      return{x:m,noscript:false}}
    if(v==='end')throw new Error('\\end بدون \\begin');
    if(v in MJ.acc){const a=arg();return{x:(v==='underline'?'<munder>':'<mover accent="true">')+a+mo(MJ.acc[v])+(v==='underline'?'</munder>':'</mover>')}}
    if(v==='underline'){const a=arg();return{x:'<munder>'+a+mo('_')+'</munder>'}}
    if(v==='overset'){const a=arg(),b=arg();return{x:'<mover>'+b+a+'</mover>'}}
    if(v==='underset'){const a=arg(),b=arg();return{x:'<munder>'+b+a+'</munder>'}}
    if(v==='xrightarrow'||v==='xrightarrow'){const a=arg();return{x:'<mover>'+mo('→',' stretchy="true"')+a+'</mover>'}}
    if(v==='displaystyle'||v==='textstyle'||v==='scriptstyle'||v==='limits'||v==='nolimits'||v==='not'||v==='nonumber'||v==='notag'||v==='label')return{x:'',noscript:true};
    if(v===','||v===';'||v===':'||v==='!'||v===' ')return{x:'<mspace width="'+(v==='!'?'-0.17':v===','?'0.17':'0.28')+'em"/>',noscript:true};
    if(v==='quad')return{x:'<mspace width="1em"/>',noscript:true};
    if(v==='qquad')return{x:'<mspace width="2em"/>',noscript:true};
    if(v==='\\')return{x:'<mspace linebreak="newline"/>',noscript:true};
    if(v in MJ.greek)return{x:'<mi>'+MJ.greek[v]+'</mi>'};
    if(v in MJ.ident)return{x:'<mi>'+MJ.ident[v]+'</mi>'};
    if(v in MJ.big){return{x:mo(MJ.big[v],' largeop="true" movablelimits="'+(MJ.limBig.has(v)?'true':'false')+'"'),lim:MJ.limBig.has(v)}}
    if(MJ.fn.has(v))return{x:'<mi mathvariant="normal">'+v+'</mi>',lim:MJ.limFn.has(v),fn:!MJ.limFn.has(v)};
    if(v in MJ.sym)return{x:mo(MJ.sym[v])};
    throw new Error('دستور ناشناخته: \\'+v);
  }
  // سطح بالا: ردیف‌ها با \\
  const R=rows(()=>false);
  if(i<T.length)throw new Error('عبارت به‌درستی تمام نشد');
  const body=R.length>1?tbl(R,'left'):R[0][0];
  return'<math xmlns="http://www.w3.org/1998/Math/MathML"'+(display?' display="block"':'')+'>'+body+'</math>';
}
window.__craTex=tex2mml; // برای آزمون
/* ---------- state ---------- */
const CR={tab:'home',courseId:'',chapterId:'',lessonId:'',cache:{courses:[],lessons:[],questions:[],sources:[],progress:[],attempts:[],bookmarks:[],notes:[],errors:[]},ix:{},blobs:new Map(),urls:new Map(),assetCourse:'',loaded:false,loading:false,err:'',pending:null,quiz:null,setup:{},busy:'',msg:null,mz:1,openQ:{},tmr:null};
function crIndex(){const c=CR.cache,m=(l)=>new Map(l.map(x=>[x.id,x]));
  CR.ix={courses:m(c.courses),lessons:m(c.lessons),questions:m(c.questions),sources:m(c.sources),progress:m(c.progress),attempts:m(c.attempts),errors:m(c.errors),bookmarks:m(c.bookmarks),notes:m(c.notes)}}
async function crLoad(){
  CR.loading=true;
  try{for(const s of [...COURSE_STORES.filter(x=>x!=='assets'),...USER_STORES])CR.cache[s]=await IDB.all(s);crIndex();CR.err='';CR.loaded=true}
  catch(e){CR.err=storeErr(e);CR.loaded=true}
  CR.loading=false;
}
async function crAssets(courseId){
  if(!courseId||CR.assetCourse===courseId)return;
  CR.urls.forEach(u=>URL.revokeObjectURL(u));CR.urls.clear();CR.blobs.clear();
  try{const ids=String(courseId).split('|'),l=[];for(const i of ids)l.push(...await IDB.byCourse('assets',i));l.forEach(a=>{CR.blobs.set(a.path,a);CR.urls.set(a.path,URL.createObjectURL(a.blob))});CR.assetCourse=courseId}
  catch(e){CR.assetCourse='';toast('خواندن تصاویر ممکن نشد: '+storeErr(e),1)}
}
const assetUrl=p=>CR.urls.get(String(p))||(CR.pv&&CR.pv.get(String(p)))||'';

/* ---------- renderer: بلوک‌های نوع‌دار؛ هیچ HTML خامی اجرا نمی‌شود ---------- */
const BLK_TYPES=new Set(['p','h','formula','list','table','note','tip','warning','pitfall','def','rule','theorem','quote','example','image','figure','summary','code','chart','plot']);
/* ---------- v184: بلوک‌های «نمودار» (chart) و «رسم تابع» (plot)؛ فقط داده می‌گیرند، خود برنامه با رنگ تم و ارقام فارسی می‌کشد ---------- */
const VPAL=['#2563eb','#f59e0b','#10b981','#ef4444','#8b5cf6','#06b6d4'];
const vNum=v=>typeof v==='number'&&isFinite(v);
function vNice(lo,hi,n){if(!(hi>lo)){hi=lo+1}const raw=(hi-lo)/(n||4),p=Math.pow(10,Math.floor(Math.log10(raw))),f=raw/p,s=(f<=1?1:f<=2?2:f<=5?5:10)*p,a=Math.floor(lo/s+1e-9)*s,b=Math.ceil(hi/s-1e-9)*s,t=[];for(let v=a;v<=b+s/2;v+=s)t.push(Math.round(v/s)*s);return{lo:a,hi:b,t}}
const vFmt=v=>{let s=Math.abs(v)>=1e6||(v!==0&&Math.abs(v)<1e-3)?v.toExponential(1):String(Math.round(v*1000)/1000);return faN(s)};
function vErr(msg){return'<div class="crs-bad">'+E_(msg)+'</div>'}
function vWrap(b,svg,extra){return'<figure class="crs-fig crs-viz" dir="ltr">'+svg+(extra||'')+(b.caption?'<figcaption dir="auto">'+inl(b.caption)+'</figcaption>':'')+'</figure>'}
function vLegend(names){return names.length>1?'<div class="crs-leg" dir="auto">'+names.map((n,i)=>'<span><i style="background:'+VPAL[i%6]+'"></i>'+E_(n)+'</span>').join('')+'</div>':''}
function vFrame(W,H,L,R,T,B,xt,yt,xl,yl,title){let s='';
  yt.t.forEach(v=>{const y=T+(H-T-B)*(1-(v-yt.lo)/(yt.hi-yt.lo));s+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y.toFixed(1)+'" y2="'+y.toFixed(1)+'" class="vg"/><text x="'+(L-5)+'" y="'+(y+3).toFixed(1)+'" text-anchor="end" class="vt">'+vFmt(v)+'</text>'});
  (xt||[]).forEach(o=>{s+='<text x="'+o.x.toFixed(1)+'" y="'+(H-B+13)+'" text-anchor="middle" class="vt">'+o.t+'</text>'+(o.g?'<line y1="'+T+'" y2="'+(H-B)+'" x1="'+o.x.toFixed(1)+'" x2="'+o.x.toFixed(1)+'" class="vg"/>':'')});
  s+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+(H-B)+'" y2="'+(H-B)+'" class="va"/><line x1="'+L+'" x2="'+L+'" y1="'+T+'" y2="'+(H-B)+'" class="va"/>';
  if(xl)s+='<text x="'+((L+W-R)/2)+'" y="'+(H-3)+'" text-anchor="middle" class="vt">'+E_(xl)+'</text>';
  if(yl)s+='<text transform="translate(9 '+((T+H-B)/2)+') rotate(-90)" text-anchor="middle" class="vt">'+E_(yl)+'</text>';
  if(title)s+='<text x="'+(W/2)+'" y="14" text-anchor="middle" class="vh">'+E_(title)+'</text>';return s}
function chartHTML(b){
  const kind=['bar','line','pie','scatter'].includes(b.kind)?b.kind:'bar',S=Array.isArray(b.series)?b.series.slice(0,6):[];
  if(!S.length)return vErr('نمودار: series خالی است');
  const W=360,H=230,L=46,R=12,T=b.title?26:14,Bm=b.x&&b.x.label?42:30,lab=Array.isArray(b.labels)?b.labels.slice(0,24).map(String):[];
  const alt=(b.title||'')+' — '+S.map(s=>(s.name||'')+': '+((s.values||s.points||[]).length)+' مقدار').join('، ');let svg,leg='',tbl='';
  if(kind==='scatter'){
    const P=S.map(s=>(Array.isArray(s.points)?s.points:[]).filter(p=>Array.isArray(p)&&vNum(p[0])&&vNum(p[1])));
    const xs=P.flat().map(p=>p[0]),ys=P.flat().map(p=>p[1]);if(!xs.length)return vErr('نمودار پراکندگی: points معتبر نیست');
    const xn=vNice(Math.min(...xs),Math.max(...xs),5),yn=vNice(Math.min(...ys),Math.max(...ys),4),sx=v=>L+(W-L-R)*(v-xn.lo)/(xn.hi-xn.lo),sy=v=>T+(H-T-Bm)*(1-(v-yn.lo)/(yn.hi-yn.lo));
    svg=vFrame(W,H,L,R,T,Bm,xn.t.map(v=>({x:sx(v),t:vFmt(v),g:1})),yn,b.x&&b.x.label,b.y&&b.y.label,b.title)+P.map((a,i)=>a.map(p=>'<circle cx="'+sx(p[0]).toFixed(1)+'" cy="'+sy(p[1]).toFixed(1)+'" r="3.4" fill="'+VPAL[i%6]+'" fill-opacity=".85"/>').join('')).join('');
    leg=vLegend(S.map((s,i)=>s.name||('#'+(i+1))))}
  else if(kind==='pie'){
    const v=(S[0].values||[]).map(x=>vNum(x)&&x>0?x:0),tot=v.reduce((a,c)=>a+c,0);if(!tot)return vErr('نمودار دایره‌ای: مقدار مثبت لازم است');
    let a0=-Math.PI/2,cx=W/2,cy=H/2+8,r=88,s='';v.forEach((x,i)=>{const a1=a0+2*Math.PI*x/tot,big=a1-a0>Math.PI?1:0,p=a=>(cx+r*Math.cos(a)).toFixed(1)+' '+(cy+r*Math.sin(a)).toFixed(1);
      s+=v.filter(y=>y>0).length===1?'<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+VPAL[i%6]+'"/>':'<path d="M'+cx+' '+cy+' L'+p(a0)+' A'+r+' '+r+' 0 '+big+' 1 '+p(a1)+' Z" fill="'+VPAL[i%6]+'" stroke="#fff" stroke-width="1.5"/>';a0=a1});
    svg='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+E_(alt)+'" class="crs-svg">'+(b.title?'<text x="'+(W/2)+'" y="14" text-anchor="middle" class="vh">'+E_(b.title)+'</text>':'')+s+'</svg>';
    leg='<div class="crs-leg" dir="auto">'+v.map((x,i)=>'<span><i style="background:'+VPAL[i%6]+'"></i>'+E_(lab[i]||('#'+(i+1)))+' — '+faN(Math.round(x/tot*1000)/10)+'٪</span>').join('')+'</div>';
    return vWrap(b,svg,leg+vTable(b,lab,S))}
  else{
    const n=Math.max(lab.length,...S.map(s=>(s.values||[]).length));if(!n)return vErr('نمودار: values خالی است');
    const V=S.map(s=>Array.from({length:n},(_,i)=>vNum((s.values||[])[i])?s.values[i]:null)),all=V.flat().filter(x=>x!=null);
    const yn=vNice(Math.min(0,...all),Math.max(0,...all),4),sy=v=>T+(H-T-Bm)*(1-(v-yn.lo)/(yn.hi-yn.lo)),bw=(W-L-R)/n,y0=sy(0),m=S.length;
    const xt=Array.from({length:n},(_,i)=>({x:L+bw*(i+.5),t:E_((lab[i]||String(i+1)).slice(0,n>8?5:12))}));
    let s=vFrame(W,H,L,R,T,Bm,xt,yn,b.x&&b.x.label,b.y&&b.y.label,b.title);
    if(kind==='bar')V.forEach((a,k)=>a.forEach((v,i)=>{if(v==null)return;const w=bw*.8/m,x=L+bw*i+bw*.1+w*k,y=sy(v);s+='<rect x="'+x.toFixed(1)+'" y="'+Math.min(y,y0).toFixed(1)+'" width="'+Math.max(1,w-1).toFixed(1)+'" height="'+Math.max(1,Math.abs(y0-y)).toFixed(1)+'" rx="2" fill="'+VPAL[k%6]+'"/>'}));
    else V.forEach((a,k)=>{const pts=a.map((v,i)=>v==null?null:[L+bw*(i+.5),sy(v)]);s+='<polyline fill="none" stroke="'+VPAL[k%6]+'" stroke-width="2.2" stroke-linejoin="round" points="'+pts.filter(Boolean).map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ')+'"/>'+pts.filter(Boolean).map(p=>'<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="3" fill="'+VPAL[k%6]+'"/>').join('')});
    svg=s;leg=vLegend(S.map((s,i)=>s.name||('#'+(i+1))));tbl=vTable(b,lab,S)}
  return vWrap(b,'<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+E_(alt)+'" class="crs-svg">'+svg+'</svg>',leg+tbl)}
function vTable(b,lab,S){const n=Math.max(lab.length,...S.map(s=>(s.values||[]).length));if(!n||n>24)return'';
  return'<details class="crs-vd" dir="auto"><summary class="m">'+TT('داده‌ها','Data')+'</summary><div class="crs-tw"><table><thead><tr><th></th>'+S.map(s=>'<th>'+E_(s.name||'')+'</th>').join('')+'</tr></thead><tbody>'+Array.from({length:n},(_,i)=>'<tr><td>'+E_(lab[i]||String(i+1))+'</td>'+S.map(s=>'<td>'+(vNum((s.values||[])[i])?vFmt(s.values[i]):'—')+'</td>').join('')+'</tr>').join('')+'</tbody></table></div></details>'}
function plotCheck(b){const F=(Array.isArray(b.fn)?b.fn:[b.fn]).filter(x=>x!=null).map(x=>typeof x==='string'?{expr:x}:x).slice(0,4);
  if(!F.length||F.some(f=>!f||typeof f.expr!=='string'||!f.expr.trim()||f.expr.length>120))return{err:'رسم تابع: fn باید عبارتی با x باشد (مثل "x^2-3*x")'};
  const x0=vNum(b.xmin)?b.xmin:-10,x1=vNum(b.xmax)?b.xmax:10;if(!(x1>x0))return{err:'رسم تابع: xmax باید از xmin بزرگ‌تر باشد'};return{F,x0,x1}}
function plotHTML(b){const c=plotCheck(b);if(c.err)return vErr(c.err);const{F,x0,x1}=c,N=260,W=360,H=240,L=46,R=12,T=b.title?26:14,Bm=b.xlabel?40:30;
  const lines=F.map(f=>{const a=[];for(let i=0;i<=N;i++){const x=x0+(x1-x0)*i/N;let y=NaN;try{y=exprEval(f.expr,{x})}catch(e){}a.push([x,isFinite(y)&&Math.abs(y)<1e9?y:NaN])}return a});
  let ys=lines.flat().map(p=>p[1]).filter(isFinite);(Array.isArray(b.points)?b.points:[]).forEach(p=>{if(p&&vNum(p.y))ys.push(p.y)});
  if(!ys.length)return vErr('رسم تابع: در این بازه مقداری تعریف‌شده نیست');
  let lo=vNum(b.ymin)?b.ymin:Math.min(...ys),hi=vNum(b.ymax)?b.ymax:Math.max(...ys);if(hi-lo<1e-9){lo-=1;hi+=1}if(!vNum(b.ymin)&&!vNum(b.ymax)){const pd=(hi-lo)*.06;lo-=pd;hi+=pd}
  const xn=vNice(x0,x1,5),yn=vNice(lo,hi,4),sx=v=>L+(W-L-R)*(v-x0)/(x1-x0),sy=v=>T+(H-T-Bm)*(1-(v-yn.lo)/(yn.hi-yn.lo)),top=T,bot=H-Bm;
  let s=vFrame(W,H,L,R,T,Bm,xn.t.filter(v=>v>=x0-1e-9&&v<=x1+1e-9).map(v=>({x:sx(v),t:vFmt(v),g:1})),yn,b.xlabel,b.ylabel,b.title);
  if(yn.lo<0&&yn.hi>0)s+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+sy(0).toFixed(1)+'" y2="'+sy(0).toFixed(1)+'" class="va"/>';if(x0<0&&x1>0)s+='<line y1="'+top+'" y2="'+bot+'" x1="'+sx(0).toFixed(1)+'" x2="'+sx(0).toFixed(1)+'" class="va"/>';
  lines.forEach((a,k)=>{let d='',pen=false;a.forEach(p=>{const y=p[1];if(!isFinite(y)||y<yn.lo-(yn.hi-yn.lo)||y>yn.hi+(yn.hi-yn.lo)){pen=false;return}d+=(pen?'L':'M')+sx(p[0]).toFixed(1)+' '+Math.max(top-30,Math.min(bot+30,sy(y))).toFixed(1);pen=true});
    s+='<path d="'+d+'" fill="none" stroke="'+VPAL[k%6]+'" stroke-width="2.2" stroke-linejoin="round" clip-path="url(#vc)"/>';
    if(b.roots){for(let i=1;i<a.length;i++){const p=a[i-1],q=a[i];if(isFinite(p[1])&&isFinite(q[1])&&p[1]*q[1]<0){let lo2=p[0],hi2=q[0];for(let j=0;j<30;j++){const m=(lo2+hi2)/2;let ym=NaN;try{ym=exprEval(F[k].expr,{x:m})}catch(e){}if(!isFinite(ym))break;if(ym*p[1]<=0)hi2=m;else lo2=m}const xr=(lo2+hi2)/2;s+='<circle cx="'+sx(xr).toFixed(1)+'" cy="'+sy(0).toFixed(1)+'" r="3.6" fill="#fff" stroke="'+VPAL[k%6]+'" stroke-width="2"/><text x="'+sx(xr).toFixed(1)+'" y="'+(sy(0)-7).toFixed(1)+'" text-anchor="middle" class="vt">'+vFmt(Math.round(xr*1000)/1000)+'</text>'}}}});
  (Array.isArray(b.points)?b.points:[]).slice(0,12).forEach(p=>{if(!p||!vNum(p.x)||!vNum(p.y))return;s+='<circle cx="'+sx(p.x).toFixed(1)+'" cy="'+sy(p.y).toFixed(1)+'" r="4" fill="#ef4444" stroke="#fff" stroke-width="1.2"/>'+(p.label?'<text x="'+(sx(p.x)+6).toFixed(1)+'" y="'+(sy(p.y)-6).toFixed(1)+'" class="vt" style="font-size:11px">'+E_(String(p.label).slice(0,20))+'</text>':'')});
  const svg='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+E_((b.title||'نمودار تابع')+': '+F.map(f=>f.expr).join('، '))+'" class="crs-svg"><defs><clipPath id="vc"><rect x="'+L+'" y="'+top+'" width="'+(W-L-R)+'" height="'+(bot-top)+'"/></clipPath></defs>'+s+'</svg>';
  const leg='<div class="crs-leg" dir="auto">'+F.map((f,i)=>'<span><i style="background:'+VPAL[i%6]+'"></i>'+(f.name?'<span dir="auto">'+E_(f.name)+'</span> ':'')+'<code dir="ltr">'+(f.name?'':'y = ')+E_(f.expr)+'</code></span>').join('')+'</div>';
  return vWrap(b,svg,leg)}
const SES_KINDS=['review','learn','read','watch','cards','practice','test','wrap'];
const CALL={note:['📝','نکته'],tip:['💡','نکته‌ی مهم'],warning:['⚠️','هشدار'],pitfall:['🚧','اشتباه رایج / دام آزمونی'],def:['📘','تعریف'],rule:['📐','قاعده'],theorem:['🧩','قضیه'],quote:['❝','نقل‌قول'],summary:['✅','جمع‌بندی']};
function plainRun(p){p=String(p).replace(/\uE000/g,'$');return p.split(/([A-Za-z0-9][A-Za-z0-9'’]*(?:(?:[ ]*[-=+*\/<>^%][ ]*|[ ]+|[(_.,])[A-Za-z0-9'’][A-Za-z0-9'’()._]*)*)/g).map((x,i)=>i%2&&(/[A-Za-z]/.test(x)||/[-=+*\/<>^%(]/.test(x))?'<bdi dir="ltr">'+E_(x)+'</bdi>':E_(x)).join('')}
function mathInline(tex){try{return'<bdi dir="ltr" class="crs-im" title="'+E_(tex)+'">'+tex2mml(tex,false)+'</bdi>'}catch(e){return'<code class="crs-bad" dir="ltr" title="'+E_(e.message)+'">$'+E_(tex)+'$</code>'}}
function inl(text){
  /* v160: \$ یعنی علامت دلار ساده؛ و «$5 و $6» فرمول حساب نمی‌شود (داخل $…$ نباید اول/آخرش فاصله باشد و بعد از $ بسته نباید رقم بیاید) */
  const s=String(text==null?'':text).replace(/\\\$/g,'\uE000');
  return s.split(/(\$[^$\s](?:[^$\n]*?[^$\s])?\$(?!\d))/g).map((p,pi)=>{
    if(pi%2&&p.length>2)return mathInline(p.slice(1,-1));
    return p.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map(q=>{
      if(q.startsWith('**')&&q.endsWith('**')&&q.length>4)return'<b>'+plainRun(q.slice(2,-2))+'</b>';
      if(q.startsWith('`')&&q.endsWith('`')&&q.length>2)return'<code dir="ltr">'+E_(q.slice(1,-1))+'</code>';
      return plainRun(q)}).join('')}).join('');
}
function texFor(b){return Array.isArray(b.lines)?'\\begin{aligned}'+b.lines.join('\\\\')+'\\end{aligned}':String(b.tex||'')}
function blocks(list,d){
  if(typeof list==='string')list=[{type:'p',text:list}];
  if(!Array.isArray(list))return'';
  d=d||0;if(d>6)return'';
  return list.map(b=>blk(b,d)).join('');
}
function textOrBlocks(b,d){return b.blocks?blocks(b.blocks,d+1):(b.text!=null?'<p dir="auto">'+inl(b.text)+'</p>':'')}
function figHTML(b){
  const u=assetUrl(b.asset);
  const img=u?'<span class="crs-orig" data-a="crs_zoom" data-p="'+E_(b.asset)+'" title="بزرگ‌نمایی"><img src="'+u+'" alt="'+E_(b.alt||'')+'" loading="lazy"></span>':'<div class="crs-bad">تصویر در دسترس نیست: <bdi dir="ltr">'+E_(b.asset)+'</bdi></div>';
  const src=b.source&&b.source.sourceId?'<span class="m"> · منبع: '+E_(srcName(b.source.sourceId))+(b.source.page!=null?' ، ص '+E_(b.source.page):'')+'</span>':'';
  return'<figure class="crs-fig">'+img+'<figcaption>'+(b.caption?inl(b.caption):'')+src+(u?' <button class="crs-mini" data-a="crs_zoom" data-p="'+E_(b.asset)+'">🔍 بزرگ‌نمایی</button> <a class="crs-mini" href="'+u+'" download="'+E_(String(b.asset).split('/').pop())+'">⬇ تصویر اصلی</a>':'')+'</figcaption></figure>';
}
function blk(b,d){
  if(!b||typeof b!=='object')return'';
  const t=b.type;
  switch(t){
    case'p':return'<p dir="auto">'+inl(b.text)+'</p>';
    case'h':{const l=Math.min(4,Math.max(2,+b.level||3));return'<h'+(l+1)+' class="crs-h" dir="auto">'+inl(b.text)+'</h'+(l+1)+'>'}
    case'formula':{let h;const tex=texFor(b);try{h=tex2mml(tex,true)}catch(e){h='<code class="crs-bad" dir="ltr">'+E_(tex)+'</code><div class="crs-bad">فرمول قابل نمایش نیست: '+E_(e.message)+'</div>'}
      return'<div class="crs-math" dir="ltr" tabindex="0" role="math" aria-label="'+E_(tex)+'" title="'+E_(tex)+'">'+h+'</div>'+(b.caption?'<div class="m crs-cap" dir="auto">'+inl(b.caption)+'</div>':'')}
    case'list':{const tag=b.ordered?'ol':'ul';return'<'+tag+' dir="auto">'+(Array.isArray(b.items)?b.items:[]).map(x=>'<li>'+(typeof x==='string'?inl(x):blocks(x&&x.blocks||[],d+1))+'</li>').join('')+'</'+tag+'>'}
    case'table':{const H=Array.isArray(b.head)?b.head:[],R=Array.isArray(b.rows)?b.rows:[];
      return'<div class="crs-tw"><table>'+(H.length?'<tr>'+H.map(x=>'<th>'+inl(x)+'</th>').join('')+'</tr>':'')+R.map(r=>'<tr>'+(Array.isArray(r)?r:[]).map(x=>'<td>'+(x&&typeof x==='object'&&x.blocks?blocks(x.blocks,d+1):inl(x))+'</td>').join('')+'</tr>').join('')+'</table></div>'+(b.caption?'<div class="m crs-cap">'+inl(b.caption)+'</div>':'')}
    case'note':case'tip':case'warning':case'pitfall':case'def':case'rule':case'theorem':case'quote':case'summary':{const c=CALL[t];
      return'<div class="crs-call crs-'+t+'"><div class="crs-ct">'+c[0]+' '+E_(b.title||c[1])+'</div>'+textOrBlocks(b,d)+(t==='quote'&&b.by?'<div class="m">— '+inl(b.by)+'</div>':'')+(b.cond?'<div class="m">شرایط استفاده: '+inl(b.cond)+'</div>':'')+'</div>'}
    case'example':{
      const steps=(Array.isArray(b.steps)?b.steps:[]).map((s,i)=>'<li class="crs-step"><span class="crs-sn">'+faN(i+1)+'</span><div>'+(typeof s==='string'?'<p dir="auto">'+inl(s)+'</p>':textOrBlocks(s,d)+(s.formula||s.tex||s.lines?blk({type:'formula',tex:s.formula||s.tex,lines:s.lines},d):''))+'</div></li>').join('');
      const alt=(Array.isArray(b.alt)?b.alt:[]).map(a=>'<details class="crs-alt"><summary>روش جایگزین'+(a.title?': '+E_(a.title):'')+'</summary><ol class="crs-steps">'+(Array.isArray(a.steps)?a.steps:[]).map((s,i)=>'<li class="crs-step"><span class="crs-sn">'+faN(i+1)+'</span><div>'+(typeof s==='string'?'<p dir="auto">'+inl(s)+'</p>':textOrBlocks(s,d)+(s.formula||s.tex||s.lines?blk({type:'formula',tex:s.formula||s.tex,lines:s.lines},d):''))+'</div></li>').join('')+'</ol></details>').join('');
      return'<div class="crs-ex"><div class="crs-ct">🧮 '+E_(b.title||'مثال حل‌شده')+'</div><div class="crs-prob">'+(b.problem!=null?(typeof b.problem==='string'?'<p dir="auto">'+inl(b.problem)+'</p>':blocks(b.problem,d+1)):'')+'</div><ol class="crs-steps">'+steps+'</ol>'+(b.answer!=null?'<div class="crs-ans"><b>پاسخ:</b> '+(typeof b.answer==='string'?inl(b.answer):blocks(b.answer,d+1))+'</div>':'')+alt+'</div>'}
    case'image':case'figure':return figHTML(b);
    case'chart':return chartHTML(b);
    case'plot':return plotHTML(b);
    case'code':return'<pre class="crs-code" dir="ltr">'+E_(b.text)+'</pre>';
    default:return'<div class="crs-bad">بلوک ناشناخته (نوع: '+E_(t)+') — نمایش داده نشد</div>';
  }
}
function srcName(id){const s=CR.ix.sources&&CR.ix.sources.get(id);return s?s.title:id}

/* ---------- اعتبارسنجی بسته ---------- */
const QTYPES=new Set(['single','multi','numeric','short','essay','match','cloze','place','ds']);
const LSTAT=new Set(['draft','needs_review','approved','complete','incomplete']);
const CTYPES=new Set(['from_source','supplementary','source_question','generated_practice','needs_review','verified']);
const SSTAT=new Set(['processed','partial','unreadable','pending','unreviewed']);
const CT_FA={from_source:'برگرفته از منبع',supplementary:'توضیح تکمیلی',source_question:'سؤال اصلی منبع',generated_practice:'تمرین تولیدشده',needs_review:'نیازمند بررسی',verified:'تأییدشده'};
const ST_FA={draft:'پیش‌نویس',needs_review:'نیازمند بررسی',approved:'تأییدشده',complete:'کامل',incomplete:'ناقص'};
const SRC_FA={processed:'پردازش‌شده',partial:'ناقص',unreadable:'ناخوانا',pending:'پردازش‌نشده',unreviewed:'بررسی‌نشده'};
function walkBlocks(list,fn,d){if(!Array.isArray(list)||(d||0)>6)return;list.forEach(b=>{if(!b||typeof b!=='object')return;fn(b);if(b.blocks)walkBlocks(b.blocks,fn,(d||0)+1);if(Array.isArray(b.problem))walkBlocks(b.problem,fn,(d||0)+1);if(Array.isArray(b.answer))walkBlocks(b.answer,fn,(d||0)+1);
  (Array.isArray(b.steps)?b.steps:[]).forEach(s=>{if(s&&typeof s==='object'){fn({type:'_step',...s});if(s.blocks)walkBlocks(s.blocks,fn,(d||0)+1)}});
  (Array.isArray(b.alt)?b.alt:[]).forEach(a=>(Array.isArray(a.steps)?a.steps:[]).forEach(s=>{if(s&&typeof s==='object'){fn({type:'_step',...s});if(s.blocks)walkBlocks(s.blocks,fn,(d||0)+1)}}));
  (Array.isArray(b.items)?b.items:[]).forEach(x=>{if(x&&x.blocks)walkBlocks(x.blocks,fn,(d||0)+1)})})}
/* v160: عدد با کسر (7/6)، ممیز و ارقام فارسی */
function numParse(x){let s=normDigits(String(x==null?'':x)).replace(/[\s\u200c]/g,'').replace(/[−–]/g,'-').replace(/٪|%/g,'');
  let m=s.match(/^([-+]?\d+(?:\.\d+)?)[\/÷]([-+]?\d+(?:\.\d+)?)$/);if(m){const d=+m[2];return d?+m[1]/d:NaN}
  m=s.match(/^([-+]?)(\d+)\s*[\/]\s*(\d+)$/);if(s.includes('/'))return NaN;
  return parseFloat(s)}
/* v165: جواب هم‌ارز — «2/√3»، «sqrt(3)/2»، «π/4»، «ln(2)» همه عدد حساب می‌شوند (تجزیه‌گر امن exprEval)؛ عدد ساده مثل قبل */
const PLAIN_NUM=/^[-+]?\d+(?:\.\d+)?(?:[\/÷][-+]?\d+(?:\.\d+)?)?[٪%]?$/;
function numAny(x){const s=normDigits(String(x==null?'':x)).replace(/[\s\u200c]/g,'').replace(/٫/g,'.').replace(/٬/g,'');if(PLAIN_NUM.test(s))return numParse(s);
  if(!s||/[=<>;'"`\\{}\[\]]/.test(s))return numParse(x);try{return exprEval(s,{})}catch(e){return numParse(x)}}
/* v160: نام آزمون یکدست (ي/ك عربی، فاصله‌ی اضافه) تا یک آزمون دو تا نشود */
const normExam=s=>String(s==null?'':s).replace(/ي/g,'ی').replace(/ى/g,'ی').replace(/ك/g,'ک').replace(/\s+/g,' ').trim();
/* v163: متغیرهای سؤال — {{a}} و {{=a*b+2}}؛ تجزیه‌گر امن (بدون eval): + - * / ^ ( ) sqrt abs round floor ceil min max */
function exprEval(src,env){env=env||{};
  const T=String(src).replace(/×/g,'*').replace(/÷/g,'/').replace(/[−–]/g,'-').replace(/π/g,'pi').replace(/√\s*\(/g,'sqrt(').replace(/√\s*(\d+(?:\.\d+)?|[a-z_][a-z0-9_]*)/gi,'sqrt($1)').match(/\d+(?:\.\d+)?|[a-z_][a-z0-9_]*|[-+*\/^(),]/gi)||[];let i=0;
  const D=Math.PI/180,F={sqrt:Math.sqrt,abs:Math.abs,round:Math.round,floor:Math.floor,ceil:Math.ceil,min:Math.min,max:Math.max,ln:Math.log,log:Math.log10,log2:Math.log2,exp:Math.exp,pow:Math.pow,sin:Math.sin,cos:Math.cos,tan:Math.tan,asin:Math.asin,acos:Math.acos,atan:Math.atan,sind:x=>Math.sin(x*D),cosd:x=>Math.cos(x*D),tand:x=>Math.tan(x*D),rad:x=>x*D,deg:x=>x/D};
  const pk=()=>T[i],nx=()=>T[i++];
  const ex=()=>{let v=tm();while(pk()==='+'||pk()==='-'){const o=nx(),r=tm();v=o==='+'?v+r:v-r}return v};
  const tm=()=>{let v=pw();while(pk()==='*'||pk()==='/'){const o=nx(),r=pw();v=o==='*'?v*r:v/r}return v};
  const pw=()=>{const b=un();if(pk()==='^'){nx();return Math.pow(b,pw())}return b};
  const un=()=>{if(pk()==='-'){nx();return -un()}if(pk()==='+'){nx();return un()}return at()};
  const at=()=>{const t=nx();if(t==null)throw new Error('عبارت ناقص');
    if(t==='('){const v=ex();if(nx()!==')')throw new Error('پرانتز بسته نشده');return v}
    if(/^\d/.test(t))return parseFloat(t);
    if(pk()==='('){nx();const a=[];if(pk()!==')'){a.push(ex());while(pk()===','){nx();a.push(ex())}}if(nx()!==')')throw new Error('پرانتز بسته نشده');const f=F[t.toLowerCase()];if(!f)throw new Error('تابع ناشناخته '+t);return f(...a)}
    if(Object.prototype.hasOwnProperty.call(env,t))return env[t];const lt=t.toLowerCase();if(lt==='pi')return Math.PI;if(lt==='e')return Math.E;throw new Error('متغیر ناشناخته '+t)};
  const v=ex();if(i<T.length)throw new Error('نماد اضافه در عبارت');if(!isFinite(v))throw new Error('نتیجه عدد نیست');return v}
function rng(seed){let h=2166136261;for(let i=0;i<seed.length;i++){h^=seed.charCodeAt(i);h=Math.imul(h,16777619)}let a=h>>>0;return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const r10=x=>Math.round(x*1e9)/1e9;
function varsFor(q,seed){const r=rng(seed+'|'+q.id),env={},V=q.vars||{};
  Object.keys(V).forEach(k=>{const v=V[k];if(v&&v.expr==null){const lo=+v.min,hi=+v.max,st=+v.step||1,n=Math.max(0,Math.floor((hi-lo)/st+1e-9));env[k]=r10(lo+Math.floor(r()*(n+1))*st)}});
  Object.keys(V).forEach(k=>{const v=V[k];if(v&&v.expr!=null)env[k]=r10(exprEval(v.expr,env))});return env}
const VAR_RE=/\{\{(=?)\s*([^{}]+?)\s*\}\}/g;
function resolveQ(q,seed){
  let env;try{env=varsFor(q,seed)}catch(e){return q}
  const sub=t=>t.replace(VAR_RE,(m,eq,x)=>{if(/^\d+$/.test(x)&&!eq)return m;try{return String(eq?r10(exprEval(x,env)):(Object.prototype.hasOwnProperty.call(env,x)?env[x]:m))}catch(e){return m}});
  const walk=o=>typeof o==='string'?sub(o):Array.isArray(o)?o.map(walk):o&&typeof o==='object'?Object.fromEntries(Object.entries(o).map(([k,v])=>[k,k==='vars'?v:walk(v)])):o;
  const x=walk(q);delete x.vars;
  if(x.answer&&typeof x.answer.value==='string'&&!isFinite(numAny(x.answer.value))){try{x.answer={...x.answer,value:String(r10(exprEval(x.answer.value,env)))}}catch(e){}}
  return x}
const QRc=new Map();
function QR(q,it){if(!q||!q.vars)return q;const seed=(it&&(it.seed||(it.seed=uid('s'))))||'preview',k=q.id+'|'+seed;if(!QRc.has(k)){if(QRc.size>400)QRc.clear();QRc.set(k,resolveQ(q,seed))}return QRc.get(k)}
const DSC=()=>[['A',TT('فقط گزاره‌ی (۱) به‌تنهایی کافی است','Statement (1) ALONE is sufficient, (2) is not')],['B',TT('فقط گزاره‌ی (۲) به‌تنهایی کافی است','Statement (2) ALONE is sufficient, (1) is not')],['C',TT('هر دو با هم کافی‌اند، هیچ‌کدام به‌تنهایی نه','BOTH together are sufficient, neither alone')],['D',TT('هر کدام به‌تنهایی کافی است','EACH alone is sufficient')],['E',TT('حتی با هم کافی نیست','NOT sufficient even together')]];
function cho(q){if(q.type==='ds')return DSC().map(x=>({id:x[0],label:x[0],text:x[1]}));if(q.type==='place'){const n=Math.min(8,Math.max(2,+q.slots||4));return Array.from({length:n},(_,i)=>({id:String(i+1),label:'['+faN(i+1)+']',text:''}))}return q.choices||[]}
const isSC=q=>q.type==='single'||q.type==='ds'||q.type==='place';
const SRCK=new Set(['jozve','konkur','exercise','example','generated']),KINDS=new Set(['language','math','gmat','general']);
function validatePack(P,existing){
  const err=[],warn=[];const E=(m)=>err.push(m),W=(m)=>warn.push(m);
  const M=P.manifest,C=P.course;
  if(!M||M.format!=='dani-course')E('manifest.json: مقدار format باید dani-course باشد');
  if(M&&M.templateVersion!==CRV.template)E('نسخه‌ی قالب پشتیبانی‌نشده: '+M.templateVersion+' (این برنامه فقط نسخه‌ی '+CRV.template+' را می‌شناسد)');
  if(!C||!okId(C.id))E('course.json: شناسه‌ی دوره نامعتبر است (فقط حروف انگلیسی، عدد، _ - . و حداکثر ۶۴ نویسه)');
  if(C&&!C.title)E('course.json: عنوان دوره خالی است');
  if(M&&C&&M.id&&M.id!==C.id)E('شناسه‌ی دوره در manifest و course یکی نیست');
  if(M&&M.whatsNew!=null&&typeof M.whatsNew!=='string'&&!(typeof M.whatsNew==='object'&&(M.whatsNew.fa||M.whatsNew.en)))W('manifest.whatsNew باید متن کوتاه یا {fa,en} باشد');
  if(M&&M.part!=null&&(typeof M.part!=='object'||Array.isArray(M.part)||!M.part.title||(M.part.id!=null&&!okId(String(M.part.id)))))W('manifest.part باید {id, title} باشد (مثلاً {"id":"ch2","title":"فصل ۲"}) تا فایل ادامه‌ی دوره نام بگیرد');
  if(!M||!M.contentVersion||!/^\d+(\.\d+){0,3}$/.test(String(M.contentVersion)))E('manifest.json: contentVersion باید مثل 1.0.0 باشد');
  if(C&&!['fa','en','fa-en'].includes(C.language))W('زبان دوره (language) باید fa، en یا fa-en باشد');
  if(C&&C.kind!=null&&!KINDS.has(C.kind))E('course.json: kind باید language | math | gmat | general باشد');
  if(C&&C.layout!=null&&C.layout!=='sessions'&&C.layout!=='chapters')E('course.json: layout باید sessions یا chapters باشد');
  if(C&&C.layout==='sessions'&&!(Array.isArray(C.sessions)&&C.sessions.length))W('course.json: layout=sessions ولی sessions خالی است؛ صفحه‌ی دوره بدون جلسه می‌ماند');
  if(C&&C.unit!=null&&(typeof C.unit!=='string'||!C.unit.trim()||C.unit.length>14))E('course.json: unit (نام دسته‌ها، مثل «فصل» یا «جلسه») باید متن کوتاه باشد');
  if(C&&Array.isArray(P.lessons)){const nz=t=>String(t||'').toLowerCase().replace(/[\s‌\-_.:؛،«»()]+/g,'');const oth=new Map();CR.cache.lessons.forEach(l=>{if(l.courseId!==C.id&&l.title)oth.set(nz(l.title),l)});
    const dup=P.lessons.filter(l=>l.role!=='aid'&&oth.has(nz(l.title)));if(dup.length){const d=oth.get(nz(dup[0].title)),dc=CR.ix.courses.get(d.courseId);W(dup.length+' درس هم‌عنوان درس‌های دوره‌ی دیگری است (مثلاً «'+dup[0].title+'» در «'+(dc?dc.title:d.courseId)+'»)؛ تکراری نساز، در جلسه‌ها/مسیرها به آن ارجاع بده')}}
  if(C&&C.sessions!=null){if(!Array.isArray(C.sessions))E('course.json: sessions باید فهرست باشد');else{const sid=new Set(),inS=new Set(),known=i=>P.lessons.some(l=>l.id===i)||CR.cache.lessons.some(l=>l.id===i);
    C.sessions.forEach(x=>{if(!x||!okId(String(x.id))||!x.title||!Array.isArray(x.parts)||!x.parts.length){E('جلسه‌ی نامعتبر (id، title و parts لازم است)');return}
      if(sid.has(x.id))E('شناسه‌ی جلسه تکراری است: '+x.id);sid.add(x.id);
      if(x.parts.length>10)W('جلسه‌ی «'+x.id+'» بیش از ۱۰ بخش دارد؛ ساده‌تر کن');
      if(!x.why)W('جلسه‌ی «'+x.id+'» دلیل ترتیب (why) ندارد');
      let sum=0;x.parts.forEach(p=>{if(!p||!SES_KINDS.includes(p.kind)){E('بخش نامعتبر در جلسه‌ی «'+x.id+'» (kind باید یکی از '+SES_KINDS.join(' | ')+' باشد)');return}
        sum+=+p.minutes||0;(Array.isArray(p.lessonIds)?p.lessonIds:[]).forEach(i=>{inS.add(i);if(!known(i))W('جلسه‌ی «'+x.id+'»: درس '+i+' نه در این بسته است نه نصب‌شده')});
        if((p.kind==='learn'||p.kind==='cards'||p.kind==='practice'||p.kind==='test')&&!(p.lessonIds&&p.lessonIds.length))W('جلسه‌ی «'+x.id+'»: بخش '+p.kind+' بدون lessonIds');
        if((p.kind==='read'||p.kind==='watch')&&!p.ref)W('جلسه‌ی «'+x.id+'»: بخش '+p.kind+' باید ref داشته باشد (مثلاً «کتاب، صفحه ۴۰–۴۵»)')});
      if(x.type!=null&&!['lesson','recap','mock'].includes(x.type))E('جلسه‌ی «'+x.id+'»: type باید lesson | recap | mock باشد');
      if(x.minutes&&sum&&Math.abs(sum-x.minutes)>Math.max(8,x.minutes*.25))W('جلسه‌ی «'+x.id+'»: جمع دقیقه‌ی بخش‌ها ('+sum+') با minutes ('+x.minutes+') فرق زیادی دارد')});
    const miss=P.lessons.filter(l=>l.role!=='aid'&&!inS.has(l.id)).length;if(C.sessions.length&&miss)W(miss+' درس در هیچ جلسه‌ای نیست')}}
  if(C&&C.paths!=null){if(!Array.isArray(C.paths))E('course.json: paths باید فهرست باشد');else C.paths.forEach(pt=>{if(!pt||!okId(pt.id)||!pt.title||!Array.isArray(pt.items))E('مسیر مطالعه‌ی نامعتبر (id، title و items لازم است)');else pt.items.forEach(i=>{if(!P.lessons.some(l=>l.id===i)&&!CR.cache.lessons.some(l=>l.id===i&&C&&l.courseId===C.id))W('مسیر «'+pt.id+'»: درس ناموجود «'+i+'»')})})}
  {const nosrc=P.questions.filter(q=>q&&q.src==null).length;if(P.questions.length&&nosrc)W(nosrc+' سؤال منبع (src) ندارد؛ بهتر است jozve، konkur، exercise یا example باشد')}
  P.fileErrors.forEach(E);
  const chIds=new Set(),dup=(set,id,what)=>{if(set.has(id))E('شناسه‌ی تکراری ('+what+'): '+id);set.add(id)};
  const chap=(C&&Array.isArray(C.chapters))?C.chapters:[];
  if(!chap.length&&!(existing&&existing.chapters&&existing.chapters.length))E('course.json: هیچ فصلی تعریف نشده است');
  chap.forEach(c=>{if(!c||!okId(c.id))E('شناسه‌ی فصل نامعتبر: '+(c&&c.id));else dup(chIds,c.id,'فصل');if(c&&!c.title)W('فصل بدون عنوان: '+(c&&c.id))});
  const exCh=new Set(existing?existing.chapters.map(c=>c.id):[]);
  const lIds=new Set(),qIds=new Set(),sIds=new Set(),assets=P.assets;
  const otherL=new Set(),otherQ=new Set(),otherS=new Set();
  CR.cache.lessons.forEach(l=>{if(!C||l.courseId!==C.id)otherL.add(l.id)});CR.cache.questions.forEach(q=>{if(!C||q.courseId!==C.id)otherQ.add(q.id)});CR.cache.sources.forEach(s=>{if(!C||s.courseId!==C.id)otherS.add(s.id)});
  const exLessons=new Set(CR.cache.lessons.filter(l=>C&&l.courseId===C.id).map(l=>l.id));
  const refAssets=new Set();
  const mathTry=(tex,where)=>{try{tex2mml(tex,true)}catch(e){W(where+': فرمول قابل نمایش نیست ('+e.message+')')}};
  const chkBlocks=(list,where)=>walkBlocks(list,b=>{
    if(b.type==='_step'){if(b.tex||b.formula||b.lines)mathTry(texFor({tex:b.formula||b.tex,lines:b.lines}),where);return}
    if(!BLK_TYPES.has(b.type))W(where+': نوع بلوک ناشناخته «'+b.type+'» (نمایش داده نمی‌شود)');
    if(b.type==='formula'){if(!b.tex&&!b.lines)W(where+': بلوک formula خالی است');else mathTry(texFor(b),where)}
    if(b.type==='image'||b.type==='figure'){if(!b.asset)E(where+': بلوک تصویر بدون asset');else{refAssets.add(b.asset);if(!assets.has(b.asset))E(where+': فایل تصویر در بسته نیست: '+b.asset);if(!b.alt)W(where+': تصویر بدون متن جایگزین (alt): '+b.asset)}
      if(b.source&&b.source.sourceId&&!P.sourceIds.has(b.source.sourceId))E(where+': ارجاع منبع نامعتبر: '+b.source.sourceId)}
    if(b.type==='chart'){if(!Array.isArray(b.series))E(where+': بلوک chart بدون series');else if(b.series.length>6)W(where+': chart بیش از ۶ سری؛ بقیه نمایش داده نمی‌شود');else if(/(bar|line)/.test(b.kind||'bar')&&!Array.isArray(b.labels))W(where+': chart بدون labels')}
    if(b.type==='plot'){const pc=plotCheck(b);if(pc.err)E(where+': '+pc.err);else pc.F.forEach(f=>{let ok=0;for(let i=0;i<=8;i++){try{exprEval(f.expr,{x:pc.x0+(pc.x1-pc.x0)*i/8});ok++}catch(e){}}if(!ok)E(where+': عبارت «'+f.expr+'» در هیچ نقطه‌ی بازه قابل محاسبه نیست')})}
    if((b.type==='p'||b.type==='h')&&typeof b.text!=='string')W(where+': بلوک متنی بدون text')
  });
  const chkRef=(r,where)=>{if(r&&r.sourceId&&!P.sourceIds.has(r.sourceId))E(where+': ارجاع به منبع ناموجود «'+r.sourceId+'»')};
  const chkVid=(v,w)=>{if(v==null)return;if(!v||typeof v!=='object'||Array.isArray(v)||typeof v.url!=='string'||!/^https:\/\/[^\s"'<>]{4,500}$/i.test(v.url)){W(w+': video باید {url:"https://…", t:ثانیه‌ی شروع} باشد');return}if(v.t!=null&&!(+v.t>=0&&+v.t<=86400))W(w+': video.t باید ثانیه‌ی ۰ تا ۸۶۴۰۰ باشد')};
  P.lessons.forEach(l=>{
    const w='درس '+(l&&l.id||'؟');
    if(!l||!okId(l.id)){E('شناسه‌ی درس نامعتبر: '+(l&&l.id));return}
    dup(lIds,l.id,'درس');if(otherL.has(l.id))E(w+': این شناسه در دوره‌ی دیگری نصب است');
    if(!l.title)E(w+': عنوان ندارد');
    if(l.role!=null&&l.role!=='core'&&l.role!=='aid')E(w+': role باید core (امتحانی) یا aid (کمکی) باشد');
    if(!chIds.has(l.chapterId)&&!exCh.has(l.chapterId))E(w+': فصل «'+l.chapterId+'» وجود ندارد');
    else if(!chIds.has(l.chapterId))W(w+': فصل «'+l.chapterId+'» در این بسته نیست و از نسخه‌ی نصب‌شده استفاده می‌شود');
    if(!Array.isArray(l.blocks)||!l.blocks.length)W(w+': محتوای درس خالی است');
    if(l.status&&!LSTAT.has(l.status))W(w+': وضعیت ناشناخته «'+l.status+'»');
    if(l.contentType&&!CTYPES.has(l.contentType))W(w+': contentType ناشناخته «'+l.contentType+'»');
    if(!l.status)W(w+': وضعیت بررسی (status) مشخص نشده — به‌عنوان «نیازمند بررسی» نمایش داده می‌شود');
    chkRef(l.sourceRef,w);chkVid(l.video,w);chkBlocks(l.blocks,w);
    ['summary'].forEach(k=>{if(Array.isArray(l[k]))chkBlocks(l[k],w)})
  });
  P.sources.forEach(s=>{if(!s||!okId(s.id)){E('شناسه‌ی منبع نامعتبر: '+(s&&s.id));return}dup(sIds,s.id,'منبع');if(otherS.has(s.id))E('منبع '+s.id+': این شناسه در دوره‌ی دیگری نصب است');
    (Array.isArray(s.chapters)?s.chapters:[]).forEach(c=>{if(c.status&&!SSTAT.has(c.status))W('منبع '+s.id+': وضعیت فصل ناشناخته «'+c.status+'»')})});
  P.questions.forEach(q=>{
    const w='سؤال '+(q&&q.id||'؟');
    if(!q||!okId(q.id)){E('شناسه‌ی سؤال نامعتبر: '+(q&&q.id));return}
    dup(qIds,q.id,'سؤال');if(otherQ.has(q.id))E(w+': این شناسه در دوره‌ی دیگری نصب است');
    if(!QTYPES.has(q.type)){E(w+': نوع سؤال نامعتبر «'+q.type+'»');return}
    if(!q.stem||(Array.isArray(q.stem)&&!q.stem.length))E(w+': صورت سؤال (stem) خالی است');
    if(q.difficulty==null)W(w+': سطح دشواری ندارد (۲ فرض می‌شود)');else if(![1,2,3].includes(+q.difficulty))E(w+': difficulty باید ۱، ۲ یا ۳ باشد');
    const lids=Array.isArray(q.lessonIds)?q.lessonIds:[];
    if(!lids.length)W(w+': به هیچ درسی پیوند ندارد');
    lids.forEach(id=>{if(!lIds.has(id)&&!exLessons.has(id)&&!P.lessons.some(l=>l.id===id))E(w+': ارجاع به درس ناموجود «'+id+'»')});
    chkRef(q.sourceRef,w);
    if(q.exam&&q.exam!==normExam(q.exam))W(w+': نام آزمون فاصله‌ی اضافه یا حرف عربی دارد؛ «'+normExam(q.exam)+'» در نظر گرفته می‌شود');
    {const TS=new Set([...(P.course&&Array.isArray(P.course.topics)?P.course.topics:[]),...(existing&&existing.topics||[])].map(t=>t&&t.id));
     (Array.isArray(q.topicIds)?q.topicIds:[]).forEach(id=>{if(!TS.has(id))W(w+': مبحثِ برچسب «'+id+'» در course.topics نیست')});
     if(q.src!=null&&!SRCK.has(q.src))E(w+': src باید یکی از jozve | konkur | exercise | example | generated باشد');
     if(lids.length&&lids.every(id=>{const l=P.lessons.find(x=>x.id===id)||(CR.ix&&CR.ix.lessons.get(id));return l&&l.role==='aid'}))E(w+': این سؤال فقط به درسِ «کمکی» (role:aid) وصل است؛ درس کمکی سؤال و تست نمی‌گیرد')}
    chkBlocks(Array.isArray(q.stem)?q.stem:[{type:'p',text:q.stem}],w);
    if(q.solution)chkBlocks(Array.isArray(q.solution)?q.solution:[{type:'p',text:q.solution}],w);
    else W(w+': پاسخ تشریحی (solution) ندارد');
    if(q.image){if(!assets.has(q.image))E(w+': فایل تصویر سؤال در بسته نیست: '+q.image);else refAssets.add(q.image)}
    const a=q.answer;
    if(q.type==='single'||q.type==='multi'){
      const ch=Array.isArray(q.choices)?q.choices:[];
      if(ch.length<2)E(w+': حداقل دو گزینه لازم است');
      const cid=new Set();ch.forEach(c=>{if(!c||c.id==null||c.id==='')E(w+': گزینه بدون id');else{if(cid.has(String(c.id)))E(w+': id گزینه تکراری: '+c.id);cid.add(String(c.id))}
        if(c&&c.image){if(!assets.has(c.image))E(w+': تصویر گزینه در بسته نیست: '+c.image);else refAssets.add(c.image)}
        if(c&&!c.text&&!c.image&&!c.blocks)E(w+': گزینه‌ی «'+c.id+'» محتوا ندارد');
        if(c&&c.blocks)chkBlocks(c.blocks,w)});
      if(q.type==='single'){if(!a||a.choice==null||!cid.has(String(a.choice)))E(w+': پاسخ صحیح (answer.choice) معتبر نیست')}
      else{if(!a||!Array.isArray(a.choices)||!a.choices.length||a.choices.some(x=>!cid.has(String(x))))E(w+': پاسخ صحیح (answer.choices) معتبر نیست')}
    }else if(q.type==='numeric'){if(!a||(!isFinite(numAny(a.value))&&!(q.vars&&typeof a.value==='string'&&a.value.trim())))E(w+': پاسخ عددی (answer.value) معتبر نیست');else if(a.tol!=null&&!(+a.tol>=0))E(w+': tol نامعتبر')}
    else if(q.type==='short'){if(!a||!Array.isArray(a.accepted)||!a.accepted.filter(x=>String(x).trim()).length)E(w+': فهرست پاسخ‌های پذیرفته (answer.accepted) خالی است')}
    else if(q.type==='match'){const p=Array.isArray(q.pairs)?q.pairs:[];if(p.length<2||p.some(x=>!x||x.l==null||x.r==null))E(w+': تطبیق حداقل دو جفت معتبر (pairs) می‌خواهد')}
    else if(q.type==='essay'){if(!q.solution&&!q.modelAnswer)W(w+': سؤال تشریحی بدون پاسخ نمونه؛ تصحیح فقط با خودارزیابی است')}
    else if(q.type==='cloze'){const b=Array.isArray(q.blanks)?q.blanks:[];if(!b.length||b.length>12)E(w+': cloze به ۱ تا ۱۲ جای خالی (blanks) نیاز دارد');
      b.forEach((x,i)=>{if(!x||!Array.isArray(x.accepted)||!x.accepted.filter(y=>String(y).trim()).length)E(w+': جای خالی '+(i+1)+' فهرست accepted ندارد')});
      const js=JSON.stringify(q.stem||'');b.forEach((x,i)=>{if(!js.includes('{{'+(i+1)+'}}'))W(w+': نشانه‌ی {{'+(i+1)+'}} در stem نیست؛ کادر پاسخ زیر سؤال می‌آید')})}
    else if(q.type==='place'){const n=q.slots==null?4:+q.slots;if(!(n>=2&&n<=8))E(w+': slots باید ۲ تا ۸ باشد');if(!a||!(+a.pos>=1&&+a.pos<=(n||4)))E(w+': answer.pos باید شماره‌ی جای درست (۱ تا slots) باشد')}
    else if(q.type==='ds'){if(!a||!'ABCDE'.includes(String(a.choice)||'-')||String(a.choice).length!==1)E(w+': answer.choice برای ds باید یکی از A تا E باشد');if(!Array.isArray(q.statements)||q.statements.length!==2)W(w+': ds باید statements با دقیقاً دو گزاره داشته باشد')}
    if(q.passageId!=null&&!(C&&Array.isArray(C.passages)&&C.passages.some(p=>p&&p.id===q.passageId))&&!(existing&&(existing.passages||[]).some(p=>p.id===q.passageId)))E(w+': passageId «'+q.passageId+'» در course.passages نیست');
    if(q.hints!=null&&(!Array.isArray(q.hints)||q.hints.length>5||q.hints.some(h=>typeof h!=='string'||!h.trim())))W(w+': hints باید حداکثر ۵ متن غیرخالی باشد (هر کدام یک گام راهنمایی)');
    if(q.trap!=null&&(typeof q.trap!=='string'||q.trap.length>60))W(w+': trap باید متن کوتاه (تا ۶۰ نویسه) باشد');
    (q.choices||[]).forEach(c=>{if(c&&c.trap!=null&&(typeof c.trap!=='string'||c.trap.length>60))W(w+': trap گزینه باید متن کوتاه (تا ۶۰ نویسه) باشد')});
    chkVid(q.video,w);
    if(q.timeSec!=null&&!(+q.timeSec>=5&&+q.timeSec<=3600))W(w+': timeSec باید ثانیه‌ی ۵ تا ۳۶۰۰ باشد');
    if(q.vars!=null){if(typeof q.vars!=='object'||Array.isArray(q.vars))E(w+': vars باید شیء باشد');else{const env={};let bad=false;
      Object.keys(q.vars).forEach(k=>{const v=q.vars[k];if(!/^[a-z][a-z0-9_]{0,15}$/i.test(k)){E(w+': نام متغیر «'+k+'» نامعتبر است (حرف انگلیسی/عدد/_)');bad=true;return}
        if(v&&v.expr!=null)return;if(!v||!isFinite(+v.min)||!isFinite(+v.max)||+v.min>+v.max){E(w+': متغیر «'+k+'» به min و max معتبر نیاز دارد');bad=true}else if(v.step!=null&&!(+v.step>0)){E(w+': step متغیر «'+k+'» باید مثبت باشد');bad=true}else env[k]=+v.min});
      if(!bad)try{Object.keys(q.vars).forEach(k=>{const v=q.vars[k];if(v&&v.expr!=null)env[k]=exprEval(v.expr,env)});
        if(q.type==='numeric'&&a&&typeof a.value==='string'&&!isFinite(numParse(a.value)))exprEval(a.value,env);
        const js=JSON.stringify(q);(js.match(VAR_RE)||[]).forEach(m=>{const t=m.slice(2,-2).trim();if(/^\d+$/.test(t))return;if(t[0]==='=')exprEval(t.slice(1),env);else if(!(t in env))throw new Error('متغیر ناشناخته '+t)})}catch(e){E(w+': vars/عبارت نامعتبر — '+e.message)}}}
  });
  // v163: متن مشترک، آزمون‌ها، اسلات‌ها
  if(C&&C.passages!=null){if(!Array.isArray(C.passages))E('course.json: passages باید فهرست باشد');else{const ps=new Set();C.passages.forEach(p=>{if(!p||!okId(p.id)||!Array.isArray(p.blocks)||!p.blocks.length){E('متن مشترک نامعتبر (id و blocks لازم است)');return}dup(ps,p.id,'متن مشترک');chkBlocks(p.blocks,'متن مشترک '+p.id);if(!P.questions.some(q=>q&&q.passageId===p.id))W('متن مشترک «'+p.id+'» به هیچ سؤالی وصل نیست')})}}
  if(C&&C.exams!=null){if(!Array.isArray(C.exams))E('course.json: exams باید فهرست باشد');else C.exams.forEach(x=>{if(!x||!x.name){E('آزمون در course.exams نام (name) ندارد');return}if(x.minutes!=null&&!(+x.minutes>0&&+x.minutes<=600))W('آزمون «'+x.name+'»: minutes نامعتبر');if(x.penalty!=null&&!(+x.penalty>=0&&+x.penalty<=1))W('آزمون «'+x.name+'»: penalty باید ۰ تا ۱ باشد (مثلاً 0.33)');if(!P.questions.some(q=>q&&normExam(q.exam)===normExam(x.name)))W('آزمون «'+x.name+'» سؤالی ندارد')})}
  if(C&&C.slots!=null){if(!Array.isArray(C.slots))E('course.json: slots باید فهرست باشد');else C.slots.forEach(x=>{if(!x||!okId(x.id)||!x.title){E('اسلات نامعتبر (id و title لازم است)');return}if(x.chapterId&&!chIds.has(x.chapterId)&&!exCh.has(x.chapterId))W('اسلات «'+x.id+'»: فصل ناموجود');if(P.lessons.some(l=>l.id===x.id))W('اسلات «'+x.id+'» پر شده؛ از فهرست slots حذفش کن')})}
  assets.forEach((a,p)=>{if(!refAssets.has(p))W('فایل بدون استفاده در بسته: '+p)});
  // ارجاع درس‌ها به فصل‌های تهی
  chap.forEach(c=>{if(c&&c.id&&!P.lessons.some(l=>l.chapterId===c.id)&&!(existing&&CR.cache.lessons.some(l=>l.courseId===existing.id&&l.chapterId===c.id)))W('فصل «'+c.id+'» هیچ درسی ندارد')});
  (P.flashcards||[]).forEach((f,i)=>{if(!f||!f.id||!f.q||!f.a)W('فلش‌کارت شماره‌ی '+(i+1)+': باید id، q و a داشته باشد');else if(f.lessonId&&!P.lessons.some(l=>l.id===f.lessonId)&&!(existing&&CR.cache.lessons.some(l=>l.id===f.lessonId)))W('فلش‌کارت «'+f.id+'»: lessonId ناشناخته است');else if(f&&f.lessonId&&(P.lessons.find(l=>l.id===f.lessonId)||{}).role==='aid')W('فلش‌کارت «'+f.id+'» روی درس کمکی (aid) است؛ کارت فقط برای محتوای امتحانی باشد')});
  {const rg=P.course&&P.course.reviewGroups;if(rg!=null){if(!Array.isArray(rg))W('course.json: reviewGroups باید فهرست {id,title,lessonIds?} باشد');else{const gi=new Set();rg.forEach(g=>{if(!g||typeof g.id!=='string'||!g.id||g.id.length>40||!g.title){W('reviewGroups: هر گروه id (حداکثر ۴۰ نویسه) و title می‌خواهد');return}if(gi.has(g.id))W('reviewGroups: id تکراری «'+g.id+'»');gi.add(g.id);if(g.lessonIds!=null&&(!Array.isArray(g.lessonIds)||g.lessonIds.some(x=>!P.lessons.some(l=>l.id===x))))W('reviewGroups «'+g.id+'»: lessonIds باید شناسه‌ی درس‌های همین بسته باشد')});
   (P.flashcards||[]).forEach(f=>{if(f&&Array.isArray(f.groups)&&f.groups.some(x=>!gi.has(x)))W('فلش‌کارت «'+f.id+'»: groups به گروهی اشاره می‌کند که در reviewGroups نیست')})}}
   const nl=(P.flashcards||[]).filter(f=>f&&f.id&&!f.lessonId).length;if(nl)W(nl+' فلش‌کارت lessonId ندارد؛ فلش‌کارت باید به درس خودش وصل باشد تا بعد از مطالعه‌ی آن درس در مرور بیاید');
   const tc=(P.flashcards||[]).filter(f=>f&&typeof f.q==='string'&&(f.q.length>220||/(حل کن|محاسبه کن|به دست آور|calculate|solve|compute)/i.test(f.q))).length;if(tc)W(tc+' فلش‌کارت شبیه سؤال تدریس/حل‌کردنی است؛ فلش‌کارت فقط برای سنجش (تعریف، معنی، مفهوم کوتاه) است و سؤال حل‌کردنی باید در questions برود')
    {const fl=P.flashcards||[],kd=(P.course&&P.course.kind)||'',exRe=/(ص\s*[\d۰-۹]+|صفحه\s*[\d۰-۹]+|تست\s*[\d۰-۹]+|[\d۰-۹]+\s*(٪|%|درصد)|تیپ\s|عدم\s*تطابق|چرا\b|چگونه|چطور|توضیح\s*بده|مراحل|مسیر\s*حل|کجا\s*اشتباه|دام\s|تله\s|خطای\s*رایج|هیچ‌کدام\s*در\s*جای)/i;
    const ex=fl.filter(f=>f&&typeof f.q==='string'&&(exRe.test(f.q)||exRe.test(String(f.a||'')))).length;
    if(ex)W(ex+' فلش‌کارت شبیه تحلیل/آمار/«دام» یا توضیح مسیر حل است (مثل «۲۹٪ در تست ص۲؟»)؛ فلش‌کارت فقط برای چیزی است که باید در امتحان یا حین حل یادت بیاید: معنی لغت، فرمول، تعریف، شرط قضیه. بقیه را در متن درس بنویس');
    const lg=fl.filter(f=>f&&typeof f.q==='string'&&kd!=='language'&&(f.q.length>110||String(f.a||'').length>160)).length;
    if(lg)W(lg+' فلش‌کارت بلند است؛ پرسش حداکثر ۱۱۰ و جواب حداکثر ۱۶۰ نویسه (یک چیز در هر کارت)')}
}
  (P.flashcards||[]).forEach(f=>{if(!f||!f.id)return;const w=m=>W('فلش‌کارت «'+f.id+'»: '+m),st=(k,n)=>{if(f[k]!=null&&(typeof f[k]!=='string'||f[k].length>n))w(k+' باید متن حداکثر '+n+' نویسه باشد')};
   st('ipa',80);st('pos',20);st('def',300);st('fa',200);st('split',100);st('syn',150);st('ant',150);st('fam',200);st('col',200);st('mn',300);
   if(f.img!=null&&!(typeof f.img==='string'&&/^(https:\/\/[^\s"'<>]{4,500}|data:image\/(?:png|jpe?g|webp|gif);base64,[A-Za-z0-9+\/=]{20,60000})$/i.test(f.img)))w('img باید نشانی https یا data:image کوتاه باشد (فایل داخل assets پشتیبانی نمی‌شود)');
   if(f.ex!=null){if(!Array.isArray(f.ex))w('ex باید آرایه‌ی {en,fa} باشد');else{if(f.ex.length>6)w('ex حداکثر ۶ مثال');f.ex.forEach(x=>{if(!x||typeof x!=='object'||typeof x.en!=='string'||!x.en.trim())w('هر مثال در ex باید en داشته باشد')})}}});
  return{errors:err,warnings:warn};
}
/* ---------- خواندن بسته از ZIP ---------- */
async function readJSON(z,name,list){
  const u=await z.read(name);if(u.length>LIM.json)throw new Error('فایل JSON بسیار بزرگ: '+name);
  try{return JSON.parse(dec.decode(u).replace(/^\uFEFF/,''))}catch(e){throw new Error(name+': JSON نامعتبر — '+e.message)}
}
async function loadPackZip(z){
  const P={manifest:null,course:null,lessons:[],questions:[],flashcards:[],sources:[],assets:new Map(),sourceIds:new Set(),fileErrors:[],names:[...z.ents.keys()]};
  if(!z.ents.has('manifest.json'))throw new Error('manifest.json در بسته نیست — این فایل بسته‌ی دوره‌ی DANI نیست');
  P.manifest=await readJSON(z,'manifest.json');
  const F=P.manifest.files||{};
  const cf=F.course||'course.json';
  try{P.course=await readJSON(z,cf)}catch(e){P.fileErrors.push(e.message)}
  const pick=(arr,rx)=>Array.isArray(arr)?arr:P.names.filter(n=>rx.test(n)).sort();
  for(const n of pick(F.lessons,/^lessons\/.+\.json$/)){try{const j=await readJSON(z,n);(Array.isArray(j)?j:Array.isArray(j.lessons)?j.lessons:[j]).forEach(x=>P.lessons.push(x))}catch(e){P.fileErrors.push(e.message)}}
  for(const n of pick(F.questions,/^questions\/.+\.json$/)){try{const j=await readJSON(z,n);(Array.isArray(j)?j:Array.isArray(j.questions)?j.questions:[j]).forEach(x=>P.questions.push(x))}catch(e){P.fileErrors.push(e.message)}}
  for(const n of pick(F.flashcards,/^flashcards\/.+\.json$/)){try{const j=await readJSON(z,n);(Array.isArray(j)?j:Array.isArray(j.flashcards)?j.flashcards:[j]).forEach(x=>P.flashcards.push(x))}catch(e){P.fileErrors.push(e.message)}}
  const sf=F.sources||(z.ents.has('sources.json')?'sources.json':null);
  if(sf){try{const j=await readJSON(z,sf);(Array.isArray(j)?j:Array.isArray(j.sources)?j.sources:[j]).forEach(x=>P.sources.push(x))}catch(e){P.fileErrors.push(e.message)}}
  P.sources.forEach(s=>s&&s.id&&P.sourceIds.add(s.id));
  for(const n of P.names){if(!n.startsWith('assets/'))continue;const ext=extOf(n);
    if(!MIME[ext]){P.fileErrors.push('نوع فایل مجاز نیست (فقط png/jpg/gif/webp/svg): '+n);continue}
    try{const u=await z.read(n);
      if(ext==='svg'&&/<\s*script|<\s*foreignObject|\son[a-z]+\s*=|javascript:|<\s*iframe|<\s*embed|<\s*object|data:text\/html/i.test(dec.decode(u))){P.fileErrors.push('تصویر SVG ناامن است (اسکریپت یا محتوای فعال دارد): '+n);continue}
      P.assets.set(n,{path:n,mime:MIME[ext],data:u})}catch(e){P.fileErrors.push(e.message)}}
  P.sizeKB=Math.round([...P.assets.values()].reduce((s,a)=>s+a.data.length,0)/1024);
  return P;
}
/* ---------- برنامه‌ی ورود / به‌روزرسانی ---------- */
const lhash=o=>hashStr(JSON.stringify(o));
const normLesson=(l,i)=>({...l,order:+l.order||i+1,topics:Array.isArray(l.topics)?l.topics:[],status:l.status||'needs_review'});
const normQuestion=q=>({...q,exam:q.exam?normExam(q.exam):q.exam,difficulty:[1,2,3].includes(+q.difficulty)?+q.difficulty:2,lessonIds:Array.isArray(q.lessonIds)?q.lessonIds:[],topicIds:Array.isArray(q.topicIds)?q.topicIds:[]});
/* v160: حذف‌های دستی (tombstone) و جابه‌جایی‌های دستی سؤال با به‌روزرسانی zip برنمی‌گردد */
const tomb=cid=>{const A=zAC();if(!A.del||typeof A.del!=='object'||Array.isArray(A.del))A.del={};const d=A.del[cid]=A.del[cid]||{};['l','q','ch'].forEach(k=>{if(!Array.isArray(d[k]))d[k]=[]});if(!A.mv||typeof A.mv!=='object'||Array.isArray(A.mv))A.mv={};return d};
function normalizePack(P){const cid=P.course&&P.course.id,d=cid?tomb(cid):{l:[],q:[],ch:[]},mv=zAC().mv||{};
  const dl=new Set(d.l),dq=new Set(d.q);
  P.lessons=P.lessons.filter(l=>!dl.has(l.id)).map(normLesson);
  P.questions=P.questions.filter(q=>!dq.has(q.id)).map(q=>mv[q.id]&&!dl.has(mv[q.id])?{...q,lessonIds:[mv[q.id]]}:q).map(normQuestion);
  if(P.course&&Array.isArray(P.course.chapters)&&d.ch.length){const dc=new Set(d.ch);P.course.chapters=P.course.chapters.filter(c=>!dc.has(c.id))}}
/* v169: «جلسه‌ی مطالعه» — course.sessions=[{id,title,minutes,why,parts:[{kind,title,minutes,lessonIds,count,text,ref}]}] */
const normSessions=a=>Array.isArray(a)?a.filter(x=>x&&okId(String(x.id))&&Array.isArray(x.parts)).map((x,i)=>({type:['lesson','recap','mock'].includes(x.type)?x.type:'lesson',id:String(x.id),title:String(x.title||x.id).slice(0,120),minutes:Math.max(0,Math.min(300,+x.minutes||0)),why:String(x.why||'').slice(0,300),order:+x.order||i+1,
  parts:x.parts.filter(p=>p&&SES_KINDS.includes(p.kind)).slice(0,10).map(p=>({kind:p.kind,title:String(p.title||'').slice(0,120),minutes:Math.max(0,Math.min(180,+p.minutes||0)),lessonIds:Array.isArray(p.lessonIds)?p.lessonIds.map(String):[],count:Math.max(0,Math.min(100,+p.count||0)),text:String(p.text||'').slice(0,600),ref:String(p.ref||'').slice(0,200)}))})):[];
/* v168: هر دوره چند «فایل» دارد (course.files). دوره‌های قدیمی که files ندارند یک فایل مجازی «فایل اولیه» می‌گیرند. */
const filesOf=c=>{if(!c)return[];if(Array.isArray(c.files)&&c.files.length)return c.files;
  const ids=(arr)=>arr.filter(x=>x.courseId===c.id).map(x=>x.id);
  return[{id:'f0',name:'فایل اولیه',partId:'',ver:String(c.contentVersion||''),at:c.importedAt||'',upd:c.updatedAt||'',lessons:ids(CR.cache.lessons),questions:ids(CR.cache.questions),sources:ids(CR.cache.sources||[]),legacy:true}]};
const fileNameOf=n=>String(n||'').replace(/\.dani-course\.zip$/i,'').replace(/\.zip$/i,'').replace(/\.json$/i,'').trim();
function planPack(P,opts){
  const C=P.course,ex=CR.ix.courses.get(C.id)||null,ofs=ex?filesOf(ex):[];
  let tg=opts&&opts.target; /* بدون opts = ادغام قدیمی کل دوره ('course') */
  if(!tg)tg='course';
  if(tg==='auto'){const pt=P.manifest&&P.manifest.part&&P.manifest.part.id;const m=pt&&ofs.find(f=>f.partId===String(pt));tg=m?m.id:'new'}
  if(!ex&&tg!=='course')tg='new';
  if(tg!=='new'&&tg!=='course'&&!ofs.some(f=>f.id===tg))tg='new';
  const tf=(tg!=='new'&&tg!=='course')?ofs.find(f=>f.id===tg):null;
  const part=P.manifest&&P.manifest.part;
  const pl={mode:ex?'update':'new',existing:ex,target:tg,file:tf,fname:(part&&part.title&&String(part.title))||fileNameOf(opts&&opts.name)||('فایل '+faN(ofs.length+1)),newV:P.manifest.contentVersion,oldV:tf?tf.ver:ex&&ex.contentVersion,
    L:{n:0,u:0,s:0},Q:{n:0,u:0,s:0},keptL:0,keptQ:0,chapters:[],progressTouched:[],orphans:[],orphL:[],orphQ:[],conflL:[],conflQ:[]};
  const exL=new Map(CR.cache.lessons.filter(l=>l.courseId===C.id).map(l=>[l.id,l])),exQ=new Map(CR.cache.questions.filter(q=>q.courseId===C.id).map(q=>[q.id,q]));
  const newLids=new Set(P.lessons.map(l=>l.id)),newQids=new Set(P.questions.map(q=>q.id));
  P.lessons.forEach(l=>{const o=exL.get(l.id),h=lhash(l);Object.defineProperty(l,'__h',{value:h,enumerable:false,writable:true});if(!o)pl.L.n++;else if(o.hash!==h){pl.L.u++;const p=CR.ix.progress.get(l.id);if(p&&p.done)pl.progressTouched.push(l.title||l.id)}else pl.L.s++});
  P.questions.forEach(q=>{const o=exQ.get(q.id),h=lhash(q);Object.defineProperty(q,'__h',{value:h,enumerable:false,writable:true});if(!o)pl.Q.n++;else if(o.hash!==h)pl.Q.u++;else pl.Q.s++});
  exL.forEach((l,id)=>{if(!newLids.has(id))pl.keptL++});exQ.forEach((q,id)=>{if(!newQids.has(id))pl.keptQ++});
  if(tg!=='course'){const own=new Map();ofs.forEach(f=>{(f.lessons||[]).forEach(i=>own.set('L'+i,f));(f.questions||[]).forEach(i=>own.set('Q'+i,f))});
    const mine=tf?tf.id:'';
    P.lessons.forEach(l=>{const f=own.get('L'+l.id);if(exL.has(l.id)&&f&&f.id!==mine)pl.conflL.push({id:l.id,title:l.title||l.id,file:f.name})});
    P.questions.forEach(q=>{const f=own.get('Q'+q.id);if(exQ.has(q.id)&&f&&f.id!==mine)pl.conflQ.push({id:q.id,file:f.name})});
    if(tf){pl.orphL=(tf.lessons||[]).filter(i=>exL.has(i)&&!newLids.has(i)).map(i=>({id:i,title:exL.get(i).title||i}));pl.orphQ=(tf.questions||[]).filter(i=>exQ.has(i)&&!newQids.has(i)).map(i=>({id:i}));pl.keptL=pl.orphL.length;pl.keptQ=pl.orphQ.length}
    else{pl.keptL=0;pl.keptQ=0}}
  (C.chapters||[]).forEach(c=>{const ls=P.lessons.filter(l=>l.chapterId===c.id);const isNew=!ex||!ex.chapters.some(x=>x.id===c.id);
    const changed=ls.some(l=>{const o=exL.get(l.id);return !o||o.hash!==l.__h});pl.chapters.push({id:c.id,title:c.title,lessons:ls.length,state:isNew?'new':changed?'updated':'same'})});
  pl.cmp=ex?(tg==='new'?1:cmpVer(pl.newV,pl.oldV)):1;
  pl.nothing=!!(ex&&tg!=='new'&&!pl.L.n&&!pl.L.u&&!pl.Q.n&&!pl.Q.u&&cmpVer(pl.newV,pl.oldV)===0);
  return pl;
}
const uniq=a=>[...new Set(a)];
/* آیتم‌های جدید روی قدیمی با همان id می‌نشینند؛ آیتم‌های قدیمیِ غایب می‌مانند */
const mergeBy=(old,nw)=>{const m=new Map(old.map(x=>[x.id,x]));nw.forEach(x=>m.set(x.id,x));return[...m.values()]};
async function commitPack(P,pl){
  const C=P.course,now=nowISO(),ex=pl.existing;
  const chMap=new Map((ex?ex.chapters:[]).map(c=>[c.id,c]));
  (C.chapters||[]).forEach((c,i)=>chMap.set(c.id,{id:c.id,title:String(c.title||c.id),description:c.description?String(c.description):'',order:+c.order||i+1}));
  const chapters=[...chMap.values()].sort((a,b)=>a.order-b.order);
  const course={id:C.id,title:String(C.title),description:String(C.description||''),language:C.language||'fa',contentVersion:((pl.target==='course'||!ex||cmpVer(P.manifest.contentVersion,ex.contentVersion)>=0)?String(P.manifest.contentVersion):ex.contentVersion),templateVersion:P.manifest.templateVersion,
    topics:mergeBy(ex?ex.topics||[]:[],Array.isArray(C.topics)?C.topics.filter(t=>t&&t.id).map(t=>({id:String(t.id),title:String(t.title||t.id)})):[]),goals:uniq([...(ex?ex.goals||[]:[]),...(Array.isArray(C.goals)?C.goals.map(String):[])]),prerequisites:uniq([...(ex?ex.prerequisites||[]:[]),...(Array.isArray(C.prerequisites)?C.prerequisites.map(String):[])]),chapters,
    kind:KINDS.has(C.kind)?C.kind:(ex&&ex.kind||'general'),unit:(typeof C.unit==='string'&&C.unit.trim()?C.unit.trim():(ex&&ex.unit||'فصل')),layout:(C.layout==='sessions'||C.layout==='chapters')?C.layout:(ex&&ex.layout||''),
    paths:[...(ex&&ex.paths||[]).filter(x=>x&&x.u),...mergeBy((ex&&ex.paths||[]).filter(x=>x&&!x.u),Array.isArray(C.paths)?C.paths.filter(x=>x&&x.id&&Array.isArray(x.items)).map(x=>({id:String(x.id),title:String(x.title||x.id),items:x.items.map(String)})):[])],
    sessions:mergeBy(ex&&ex.sessions||[],normSessions(C.sessions)),
    passages:mergeBy(ex&&ex.passages||[],Array.isArray(C.passages)?C.passages.filter(p=>p&&p.id&&Array.isArray(p.blocks)).map(p=>({id:String(p.id),title:p.title?String(p.title):'',blocks:p.blocks})):[]),
    exams:mergeBy((ex&&ex.exams||[]).map(x=>({...x,id:x.id||normExam(x.name)})),Array.isArray(C.exams)?C.exams.filter(x=>x&&x.name).map(x=>({id:normExam(x.name),name:normExam(x.name),year:x.year!=null?String(x.year):'',minutes:+x.minutes>0?+x.minutes:0,penalty:x.penalty!=null?+x.penalty:null,count:+x.count>0?+x.count:0,note:x.note?String(x.note):''})):[]),
    slots:(Array.isArray(C.slots)?C.slots.filter(x=>x&&x.id&&x.title).map(x=>({id:String(x.id),title:String(x.title),chapterId:x.chapterId?String(x.chapterId):'',order:+x.order||0})):(ex&&ex.slots||[])),
    importedAt:ex?ex.importedAt:now,updatedAt:now,log:[...(ex?ex.log||[]:[]),{at:now,version:String(P.manifest.contentVersion),mode:pl.mode,lessons:pl.L,questions:pl.Q,file:pl.target==='course'?'':(pl.file?pl.file.name:(pl.fname||''))}].slice(-30)};
  const pv=String(P.manifest.contentVersion),skL=new Set(),skQ=new Set();
  if(pl.target!=='course'&&!pl.allowOver){(pl.conflL||[]).forEach(x=>skL.add(x.id));(pl.conflQ||[]).forEach(x=>skQ.add(x.id))}
  const lessons=P.lessons.filter(l=>!skL.has(l.id)).map(l=>{const x={...l,courseId:C.id,hash:l.__h,v:pv};delete x.__h;return x});
  const questions=P.questions.filter(q=>!skQ.has(q.id)).map(q=>{const x={...q,courseId:C.id,hash:q.__h,v:pv};delete x.__h;return x});
  { /* فایل‌های دوره */
    const nL=lessons.map(x=>x.id),nQ=questions.map(x=>x.id),sL=new Set(nL),sQ=new Set(nQ),sS=new Set(P.sources.map(x=>x.id));
    let fl=(ex?filesOf(ex):[]).map(f=>({...f,lessons:[...(f.lessons||[])],questions:[...(f.questions||[])],sources:[...(f.sources||[])]}));
    const part=P.manifest&&P.manifest.part,pid=part&&part.id?String(part.id):'';
    const tf=(pl.target!=='new'&&pl.target!=='course')?fl.find(f=>f.id===pl.target):null;
    const dropIn=(f)=>{f.lessons=f.lessons.filter(i=>!sL.has(i));f.questions=f.questions.filter(i=>!sQ.has(i));f.sources=f.sources.filter(i=>!sS.has(i))};
    const rmL=new Set(pl.rmOrphans?(pl.orphL||[]).map(x=>x.id):[]),rmQ=new Set(pl.rmOrphans?(pl.orphQ||[]).map(x=>x.id):[]);
    const nm=(pl.fname&&String(pl.fname).trim().slice(0,40))||(part&&part.title&&String(part.title))||('فایل '+(fl.length+1));
    if(tf){fl.filter(f=>f!==tf).forEach(dropIn);tf.lessons=uniq([...tf.lessons.filter(i=>!rmL.has(i)),...nL]);tf.questions=uniq([...tf.questions.filter(i=>!rmQ.has(i)),...nQ]);tf.sources=uniq([...tf.sources,...sS]);tf.ver=pv;tf.upd=now;if(pid)tf.partId=pid;delete tf.legacy}
    else if(pl.target==='new'||!fl.length){fl.forEach(dropIn);fl.push({id:'f'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),name:nm,partId:pid,ver:pv,at:now,upd:now,lessons:nL,questions:nQ,sources:[...sS]})}
    else{const oL=new Set(),oQ=new Set(),oS=new Set();fl.forEach(f=>{f.lessons.forEach(i=>oL.add(i));f.questions.forEach(i=>oQ.add(i));f.sources.forEach(i=>oS.add(i))});
      const f0=fl[0];f0.lessons=uniq([...f0.lessons,...nL.filter(i=>!oL.has(i))]);f0.questions=uniq([...f0.questions,...nQ.filter(i=>!oQ.has(i))]);f0.sources=uniq([...f0.sources,...[...sS].filter(i=>!oS.has(i))]);f0.upd=now}
    course.files=fl.filter(f=>f===tf||f.lessons.length||f.questions.length||f.sources.length);
    pl._rmL=[...rmL];pl._rmQ=[...rmQ];
    if(ex){const oL=new Map(CR.cache.lessons.filter(l=>l.courseId===C.id).map(l=>[l.id,l])),oQ=new Set(CR.cache.questions.filter(q=>q.courseId===C.id).map(q=>q.id));
      const aL=lessons.filter(l=>!oL.has(l.id)),uL=lessons.filter(l=>oL.has(l.id)&&oL.get(l.id).hash!==l.hash),aQ=questions.filter(q=>!oQ.has(q.id)).length;
      if(aL.length||uL.length||aQ){const tn=l=>({l:l.id,t:String(l.title||l.id).slice(0,80),c:l.chapterId||''});
        const wn=P.manifest&&P.manifest.whatsNew,note=typeof wn==='string'?wn:(wn&&typeof wn==='object'?String(wn.fa||wn.en||''):'');
        course.news=[...(ex.news||[]),{id:'n'+Date.now().toString(36),at:now,ver:pv,file:course.files.find(f=>f===tf)?tf.name:((pl.target==='new')?(course.files[course.files.length-1]||{}).name||'':''),note:note.slice(0,400),add:aL.slice(0,30).map(tn),upd:uL.slice(0,30).map(tn),nadd:aL.length,nupd:uL.length,nq:aQ}].slice(-8)}
      else course.news=ex.news||[]}
  }
  const sources=P.sources.map(s=>({...s,courseId:C.id}));
  const assets=[...P.assets.values()].map(a=>({key:C.id+'/'+a.path,courseId:C.id,path:a.path,mime:a.mime,size:a.data.length,blob:new Blob([a.data],{type:a.mime})}));
  try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}
  await IDB.tx(['courses','lessons','questions','sources','assets','meta'],'readwrite',async t=>{
    await rq(t.objectStore('meta').put({key:'schema',version:CRV.schema,at:now}));
    await rq(t.objectStore('courses').put(course));
    for(const x of lessons)await rq(t.objectStore('lessons').put(x));
    for(const x of questions)await rq(t.objectStore('questions').put(x));
    for(const x of sources)await rq(t.objectStore('sources').put(x));
    for(const x of assets)await rq(t.objectStore('assets').put(x));
    for(const id of (pl._rmL||[]))await rq(t.objectStore('lessons').delete(id));
    for(const id of (pl._rmQ||[]))await rq(t.objectStore('questions').delete(id));
    const RM=(P.manifest&&P.manifest.remove)||(C.remove)||null;
    if(RM&&typeof RM==='object'){
      for(const id of (Array.isArray(RM.questions)?RM.questions:[]))await rq(t.objectStore('questions').delete(String(id)));
      for(const id of (Array.isArray(RM.lessons)?RM.lessons:[])){await rq(t.objectStore('lessons').delete(String(id)));const qs=await rq(t.objectStore('questions').index('courseId').getAll(C.id));for(const q of qs){if((q.lessonIds||[]).length&&q.lessonIds.every(i=>i===String(id)))await rq(t.objectStore('questions').delete(q.id))}}
    }
  });
  try{const RM=(P.manifest&&P.manifest.remove)||(C.remove)||null;
    if(RM&&typeof RM==='object'&&Array.isArray(RM.chapters)&&RM.chapters.length){await crLoad();const c2=CR.ix.courses.get(C.id);if(c2){const used=new Set(CR.cache.lessons.filter(l=>l.courseId===C.id).map(l=>l.chapterId));c2.chapters=c2.chapters.filter(ch=>!(RM.chapters.includes(ch.id)&&!used.has(ch.id)));await IDB.tx(['courses'],'readwrite',async t=>{await rq(t.objectStore('courses').put(c2))})}}
    if(RM&&Array.isArray(RM.topics)&&RM.topics.length){await crLoad();const c2=CR.ix.courses.get(C.id);if(c2){c2.topics=(c2.topics||[]).filter(x=>!RM.topics.includes(x.id));await IDB.tx(['courses'],'readwrite',async t=>{await rq(t.objectStore('courses').put(c2))})}}
  }catch(e){console.error(e)}
  CR.assetCourse='';
  await crLoad();
  try{await reapplyRen(C.id)}catch(e){console.error(e)}
  try{if(window.daniAcd4){if(P.flashcards&&P.flashcards.length)window.daniAcd4.zipCards(C.id,P.flashcards,P.course&&P.course.reviewGroups);window.daniAcd4.placed(C.id,P.manifest.collection)}}catch(e){console.error(e)}
}
async function deleteCourse(id,withUser){
  const stores=[...COURSE_STORES,...(withUser?USER_STORES:[])];
  await IDB.tx(stores,'readwrite',async t=>{
    await rq(t.objectStore('courses').delete(id));
    for(const s of ['lessons','questions','sources','assets']){const st=t.objectStore(s),ks=await rq(st.index('courseId').getAllKeys(id));for(const k of ks)await rq(st.delete(k))}
    if(withUser)for(const s of USER_STORES){const st=t.objectStore(s),all=await rq(st.getAll());for(const o of all)if(o.courseId===id)await rq(st.delete(o.id))}
  });
  if(CR.assetCourse===id)CR.assetCourse='';
  await crLoad();
}
/* v153: تغییر نام درس/فصل/مبحث (با نگه‌داشتن نام انتخابی بعد از به‌روزرسانی) و افزودن سؤال از داخل برنامه */
async function applyOne(kind,c,id,title){
  if(kind==='c'){c.title=title;await IDB.tx(['courses'],'readwrite',async t=>{await rq(t.objectStore('courses').put(c))})}
  else if(kind==='ch'){const ch=c.chapters.find(x=>x.id===id);if(!ch)return;ch.title=title;await IDB.tx(['courses'],'readwrite',async t=>{await rq(t.objectStore('courses').put(c))})}
  else{const l=CR.ix.lessons.get(id);if(!l||l.courseId!==c.id)return;l.title=title;await IDB.tx(['lessons'],'readwrite',async t=>{await rq(t.objectStore('lessons').put(l))})}
}
async function renameItem(kind,cid,id,title){
  title=String(title||'').trim().slice(0,120);if(!title)throw new Error('نام خالی است');
  const c=CR.ix.courses.get(cid);if(!c)throw new Error('درس پیدا نشد');
  const R=zAC();if(!R.ren||typeof R.ren!=='object'||Array.isArray(R.ren))R.ren={};
  const r=R.ren[cid]=R.ren[cid]||{c:'',ch:{},l:{}};
  await applyOne(kind,c,id,title);
  if(kind==='c')r.c=title;else if(kind==='ch')r.ch[id]=title;else r.l[id]=title;
  zcommit();
}
async function reapplyRen(cid){
  const R=zAC(),r=R.ren&&R.ren[cid],c=CR.ix.courses.get(cid);if(!r||!c)return;
  if(r.c&&r.c!==c.title)await applyOne('c',c,cid,r.c);
  for(const k of Object.keys(r.ch||{})){const ch=c.chapters.find(x=>x.id===k);if(ch&&ch.title!==r.ch[k])await applyOne('ch',c,k,r.ch[k])}
  for(const k of Object.keys(r.l||{})){const l=CR.ix.lessons.get(k);if(l&&l.title!==r.l[k])await applyOne('l',c,k,r.l[k])}
}
async function addQuestion(q){
  const l=CR.ix.lessons.get(q.lessonIds[0]);if(!l)throw new Error('مبحث پیدا نشد');
  const x={...q,courseId:l.courseId,difficulty:[1,2,3].includes(+q.difficulty)?+q.difficulty:2,topicIds:Array.isArray(q.topicIds)?q.topicIds:[],hash:'u'+hashStr(JSON.stringify(q)),v:'user'};
  await IDB.tx(['questions'],'readwrite',async t=>{await rq(t.objectStore('questions').put(x))});
  await crLoad();return x;
}
/* v160: حذف تکی و جابه‌جایی سؤال */
async function delQ(ids){ids=[...ids];if(!ids.length)return;const set=new Set(ids);
  await IDB.tx(['questions','errors','bookmarks'],'readwrite',async t=>{
    for(const id of ids)await rq(t.objectStore('questions').delete(id));
    const er=await rq(t.objectStore('errors').getAll());for(const e of er)if(set.has(e.qid))await rq(t.objectStore('errors').delete(e.id));
    const bm=await rq(t.objectStore('bookmarks').getAll());for(const b of bm)if(b.kind==='question'&&set.has(b.refId))await rq(t.objectStore('bookmarks').delete(b.id))});
}
async function deleteQuestion(qid){const q=CR.ix.questions.get(qid);if(!q)return;const d=tomb(q.courseId);if(!d.q.includes(qid))d.q.push(qid);await delQ([qid]);zcommit();await crLoad()}
async function moveQuestion(qid,lid){const q=CR.ix.questions.get(qid),l=CR.ix.lessons.get(lid);if(!q||!l||l.courseId!==q.courseId)throw new Error('مقصد نامعتبر');
  const x={...q,lessonIds:[lid],hash:'m'+hashStr(JSON.stringify([q.hash,lid]))};tomb(q.courseId);zAC().mv[qid]=lid;zcommit();await IDB.tx(['questions'],'readwrite',async t=>{await rq(t.objectStore('questions').put(x))});zcommit();await crLoad()}
/* حذف مبحث: سؤال‌هایی که فقط به همین مبحث وصل‌اند هم پاک می‌شوند؛ بقیه فقط از آن جدا می‌شوند */
function lessonDelInfo(lid){const l=CR.ix.lessons.get(lid);if(!l)return{own:[],shared:[]};const qs=questionsOf(l.courseId).filter(q=>(q.lessonIds||[]).includes(lid));return{own:qs.filter(q=>q.lessonIds.every(i=>i===lid)),shared:qs.filter(q=>q.lessonIds.some(i=>i!==lid))}}
async function deleteLesson(lid,inner){const l=CR.ix.lessons.get(lid);if(!l)return;const d=tomb(l.courseId),info=lessonDelInfo(lid);
  if(!d.l.includes(lid))d.l.push(lid);
  info.own.forEach(q=>{if(!d.q.includes(q.id))d.q.push(q.id)});await delQ(info.own.map(q=>q.id));
  await IDB.tx(['lessons','questions','progress'],'readwrite',async t=>{
    await rq(t.objectStore('lessons').delete(lid));await rq(t.objectStore('progress').delete(lid));
    for(const q of info.shared){await rq(t.objectStore('questions').put({...q,lessonIds:q.lessonIds.filter(i=>i!==lid)}))}});
  zcommit();if(!inner)await crLoad()}
async function deleteChapter(cid,chId){const c=CR.ix.courses.get(cid);if(!c)return;
  for(const l of lessonsOf(cid).filter(x=>x.chapterId===chId))await deleteLesson(l.id,true);
  await crLoad();const c2=CR.ix.courses.get(cid);c2.chapters=c2.chapters.filter(x=>x.id!==chId);
  const d=tomb(cid);if(!d.ch.includes(chId))d.ch.push(chId);zcommit();
  await IDB.tx(['courses'],'readwrite',async t=>{await rq(t.objectStore('courses').put(c2))});await crLoad()}
/* مسیرهای مطالعه‌ی کاربر (جلسه‌ها / مرور امتحان …) */
async function savePath(cid,path){const c=CR.ix.courses.get(cid);if(!c)return;c.paths=(c.paths||[]).filter(x=>x.id!==path.id);if(path.items)c.paths.push({...path,u:true});await IDB.tx(['courses'],'readwrite',async t=>{await rq(t.objectStore('courses').put(c))});await crLoad()}
async function setUnit(cid,unit,kind){const c=CR.ix.courses.get(cid);if(!c)return;if(unit)c.unit=String(unit).trim().slice(0,14);if(kind&&KINDS.has(kind))c.kind=kind;await IDB.tx(['courses'],'readwrite',async t=>{await rq(t.objectStore('courses').put(c))});await crLoad()}
/* v152: ادغام چند درس هم‌موضوع در یک درس (با نگه‌داشتن شناسه‌ی درس/سؤال، پیشرفت، خطاها و آزمون‌ها؛ با امکان برگشت) */
async function mergeCourses(newId,title,srcIds){
  const src=srcIds.map(id=>CR.ix.courses.get(id)).filter(Boolean);
  if(src.length<2)throw new Error('حداقل دو درس برای ادغام لازم است');
  if(!/^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/.test(newId)||newId.startsWith('__'))throw new Error('شناسه‌ی درس فقط حروف انگلیسی، عدد و - _ . باشد');
  if(CR.ix.courses.has(newId)&&!srcIds.includes(newId))throw new Error('این شناسه برای درس دیگری استفاده شده است');
  const allAssets=await IDB.all('assets');
  if(allAssets.some(a=>srcIds.includes(a.courseId)))throw new Error('این درس‌ها فایل تصویری دارند؛ ادغام خودکار برایشان هنوز پشتیبانی نمی‌شود');
  const now=nowISO(),cl=o=>JSON.parse(JSON.stringify(o));
  const chUsed=new Set(),tpTitle=new Map(),chapters=[],topics=[],goals=[],pre=[],chMap={},tpMap={},exam={};
  src.forEach(c=>{chMap[c.id]={};tpMap[c.id]={};if(/exam/i.test(c.id))exam[c.id]=String(c.title);
    (c.chapters||[]).slice().sort((a,b)=>(a.order||0)-(b.order||0)).forEach(ch=>{let id=ch.id;if(chUsed.has(id))id=c.id+'-'+id;chUsed.add(id);chMap[c.id][ch.id]=id;chapters.push({...cl(ch),id,order:chapters.length+1})});
    (c.topics||[]).forEach(t=>{let id=t.id;if(tpTitle.has(id)&&tpTitle.get(id)!==t.title)id=c.id+'-'+id;if(!tpTitle.has(id)){tpTitle.set(id,t.title);topics.push({id,title:t.title})}tpMap[c.id][t.id]=id});
    (c.goals||[]).forEach(g=>{if(!goals.includes(g))goals.push(g)});(c.prerequisites||[]).forEach(g=>{if(!pre.includes(g))pre.push(g)})});
  const inS=o=>srcIds.includes(o.courseId);
  const L=CR.cache.lessons.filter(inS),Q=CR.cache.questions.filter(inS),S=(await IDB.all('sources')).filter(inS),
        PR=CR.cache.progress.filter(inS),AT=CR.cache.attempts.filter(inS),ER=CR.cache.errors.filter(inS);
  const snap={key:'mg_'+Date.now().toString(36),at:now,newId,srcIds:[...srcIds],titles:src.map(c=>String(c.title)),courses:cl(src),lessons:cl(L),questions:cl(Q),sources:cl(S),progress:cl(PR),attempts:cl(AT),errors:cl(ER)};
  const mapT=(cid,a)=>Array.isArray(a)?a.map(t=>tpMap[cid][t]||t):a;
  const nL=L.map(l=>({...l,courseId:newId,chapterId:chMap[l.courseId][l.chapterId]||l.chapterId,topics:mapT(l.courseId,l.topics)}));
  const nQ=Q.map(q=>{const x={...q,courseId:newId,topicIds:mapT(q.courseId,q.topicIds)};if(exam[q.courseId]&&!x.exam)x.exam=exam[q.courseId];return x});
  const course={id:newId,title:String(title),description:src.map(c=>c.description).filter(Boolean).join(' · ').slice(0,600),language:src[0].language||'fa',contentVersion:'1.0.0',templateVersion:src[0].templateVersion||1,topics,goals,prerequisites:pre,chapters,
    importedAt:src.map(c=>c.importedAt).filter(Boolean).sort()[0]||now,updatedAt:now,log:[{at:now,version:'1.0.0',mode:'merge',from:[...srcIds],lessons:nL.length,questions:nQ.length}]};
  await IDB.tx(['courses','lessons','questions','sources','progress','attempts','errors','meta'],'readwrite',async t=>{
    await rq(t.objectStore('meta').put(snap));
    {const olds=(await rq(t.objectStore('meta').getAll())).filter(x=>x&&x.key&&(x.key==='merge_undo'||String(x.key).startsWith('mg_'))&&x.key!==snap.key).sort((a,b)=>String(b.at).localeCompare(String(a.at)));
     for(const o of olds.slice(7))await rq(t.objectStore('meta').delete(o.key))}
    for(const id of srcIds)if(id!==newId)await rq(t.objectStore('courses').delete(id));
    await rq(t.objectStore('courses').put(course));
    for(const x of nL)await rq(t.objectStore('lessons').put(x));
    for(const x of nQ)await rq(t.objectStore('questions').put(x));
    for(const x of S)await rq(t.objectStore('sources').put({...x,courseId:newId}));
    for(const x of PR)await rq(t.objectStore('progress').put({...x,courseId:newId}));
    for(const x of AT)await rq(t.objectStore('attempts').put({...x,courseId:newId}));
    for(const x of ER)await rq(t.objectStore('errors').put({...x,courseId:newId}));
  });
  await crLoad();
  return{lessons:nL.length,questions:nQ.length,chapters:chapters.length,key:snap.key,at:now}
}
const mergeKeys=async()=>{try{return(await IDB.all('meta')).filter(x=>x&&x.key&&(x.key==='merge_undo'||String(x.key).startsWith('mg_'))).sort((a,b)=>String(b.at).localeCompare(String(a.at)))}catch(e){return[]}};
/* فهرست ادغام‌ها (تازه‌ترین اول). blocked: ادغام بعدی از نتیجه‌ی این استفاده کرده؛ اول آن را برگردان */
async function mergeList(){const all=await mergeKeys();return all.map(m=>({key:m.key,newId:m.newId,srcIds:m.srcIds,titles:m.titles||(m.courses||[]).map(c=>c.title),at:m.at,exists:CR.ix.courses.has(m.newId),
  blocked:all.some(n=>String(n.at)>String(m.at)&&n.srcIds.includes(m.newId))}))}
async function undoMerge(key){
  const all=await mergeKeys(),sn=key?all.find(x=>x.key===key):all[0];if(!sn)throw new Error('ادغامی برای برگشت نیست');
  if(all.some(n=>String(n.at)>String(sn.at)&&n.srcIds.includes(sn.newId)))throw new Error('اول ادغام بعدی را که از این درس استفاده کرده برگردان');
  await IDB.tx(['courses','lessons','questions','sources','progress','attempts','errors','meta'],'readwrite',async t=>{
    if(!sn.srcIds.includes(sn.newId))await rq(t.objectStore('courses').delete(sn.newId));
    for(const c of sn.courses)await rq(t.objectStore('courses').put(c));
    for(const [s,k] of [['lessons','lessons'],['questions','questions'],['sources','sources'],['progress','progress'],['attempts','attempts'],['errors','errors']])for(const x of sn[k])await rq(t.objectStore(s).put(x));
    await rq(t.objectStore('meta').delete(sn.key));
  });
  await crLoad();return sn
}
const mergeUndoInfo=async()=>{const a=await mergeKeys();return a[0]?{newId:a[0].newId,srcIds:a[0].srcIds,at:a[0].at}:null};
/* ---------- helpers ---------- */
const C_=()=>CR.cache,course=()=>CR.ix.courses.get(CR.courseId);
const lessonsOf=cid=>CR.cache.lessons.filter(l=>l.courseId===cid).sort((a,b)=>a.order-b.order);
const questionsOf=cid=>CR.cache.questions.filter(q=>q.courseId===cid);
const topicName=(cid,id)=>{const c=CR.ix.courses.get(cid);const t=c&&(c.topics||[]).find(x=>x.id===id);return t?t.title:id};
const bar=p=>'<div class="bar"><i style="width:'+Math.max(0,Math.min(100,p))+'%"></i></div>';
const badge=(t,c)=>'<span class="crs-bdg" style="background:'+(c||'#64748b')+'">'+E_(t)+'</span>';
const stBadge=l=>badge(ST_FA[l.status]||'نیازمند بررسی',{approved:'#16a34a',complete:'#16a34a',needs_review:'#ea580c',draft:'#64748b',incomplete:'#dc2626'}[l.status]||'#ea580c');
const ctBadge=l=>l.contentType?badge(CT_FA[l.contentType]||l.contentType,'#2563eb'):'';
function msg(t,h){CR.msg={t,h}}
function banner(){if(!CR.msg)return'';const m=CR.msg;return'<div class="c crs-msg '+(m.t==='err'?'crs-e':'crs-o')+'"><div>'+m.h+'</div><button data-a="crs_msgx">بستن</button></div>'}
const rerender=()=>{try{render()}catch(e){console.error(e)}};
async function guard(fn,okmsg){CR.busy='1';rerender();try{await fn();if(okmsg)msg('ok',okmsg)}catch(e){console.error(e);msg('err',E_(storeErr(e)))}CR.busy='';rerender()}
function pgOf(l){const p=CR.ix.progress.get(l.id);return p||null}
function courseProg(cid){const L=lessonsOf(cid),d=L.filter(l=>{const p=CR.ix.progress.get(l.id);return p&&p.done}).length;return{n:L.length,done:d,p:L.length?Math.round(d/L.length*100):0}}
function saveProg(l,patch){const o=CR.ix.progress.get(l.id)||{id:l.id,courseId:l.courseId,done:false,checks:{},timeMs:0};const n={...o,...patch,lastAt:Date.now()};CR.ix.progress.set(l.id,n);const i=CR.cache.progress.findIndex(x=>x.id===l.id);if(i<0)CR.cache.progress.push(n);else CR.cache.progress[i]=n;return IDB.put('progress',n)}
function stopStudy(){if(CR.studyAt&&CR.lessonId){const l=CR.ix.lessons.get(CR.lessonId);if(l){const ms=Date.now()-CR.studyAt;if(ms>2000&&ms<4*3600e3){const p=CR.ix.progress.get(l.id);saveProg(l,{timeMs:((p&&p.timeMs)||0)+ms}).catch(()=>{})}}}CR.studyAt=0}
/* ---------- تصحیح ---------- */
const normTxt=s=>normDigits(String(s==null?'':s)).replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[\u200c\u200f\u200e]/g,'').replace(/\s+/g,' ').trim().toLowerCase();
function grade(q,a){
  if(q.type==='essay')return{auto:false,ok:null};
  if(a==null||a===''||(Array.isArray(a)&&!a.length)||(typeof a==='object'&&!Array.isArray(a)&&!Object.keys(a).length))return{auto:true,ok:false,skipped:true};
  try{
    if(q.type==='single'||q.type==='ds')return{auto:true,ok:String(a)===String(q.answer.choice)};
    if(q.type==='place')return{auto:true,ok:String(a)===String(q.answer.pos)};
    if(q.type==='cloze'){const bl=q.blanks||[];if(!bl.some((b,i)=>a&&String(a[i+1]||'').trim()))return{auto:true,ok:false,skipped:true};return{auto:true,ok:bl.every((b,i)=>b.accepted.some(x=>normTxt(x)===normTxt(a[i+1]||'')))}}
    if(q.type==='multi'){const x=[...a].map(String).sort().join('|'),y=q.answer.choices.map(String).sort().join('|');return{auto:true,ok:x===y}}
    if(q.type==='numeric'){const v=numAny(q.answer.value),u=numAny(a);if(!isFinite(u)||!isFinite(v))return{auto:true,ok:false};const tol=+q.answer.tol||0,rel=+q.answer.rel||0;return{auto:true,ok:Math.abs(u-v)<=Math.max(tol,rel*Math.abs(v),1e-9)}}
    if(q.type==='short'){const u=normTxt(a);return{auto:true,ok:q.answer.accepted.some(x=>normTxt(x)===u)}}
    if(q.type==='match'){return{auto:true,ok:q.pairs.every((p,i)=>a[i]!=null&&String(a[i])===String(p.r))}}
  }catch(e){}
  return{auto:false,ok:null};
}
/* v172: «بلد بودم» — برای سؤال‌های نوشتنی (عددی/کوتاه/جای‌خالی/تطبیق) که حل درست بوده ولی جواب اشتباه وارد شده (مثلاً یک رقم) */
const TYPED=new Set(['numeric','short','cloze','match']);
const effOk=it=>it.ov==='know'?true:(it.ok!=null?it.ok:(it.self==='right'?true:it.self==='wrong'?false:null));
function knowHTML(q,it){if(!TYPED.has(q.type))return'';const g=grade(q,it.answer),at=' data-q="'+E_(q.id)+'"';
  if(it.ov==='know')return'<div class="row crs-know"><span class="m">✅ '+TT('ثبت شد: بلد بودی؛ فقط جواب را اشتباه وارد کردی','Marked: you knew it; only the typed answer was off')+'</span><button class="chip sm" data-a="crs_know"'+at+' data-v="0">↩ '+TT('برگردان','Undo')+'</button></div>';
  if(g.auto&&g.ok===false&&!g.skipped)return'<div class="row crs-know"><button class="chip sm" data-a="crs_know"'+at+' data-v="1">✓ '+TT('بلد بودم؛ فقط جواب را اشتباه وارد کردم','I knew it; I only typed the answer wrong')+'</button></div><p class="m">'+TT('اگر روی برگه درست حل کردی ولی مثلاً یک رقم را اشتباه نوشتی، این را بزن؛ سؤال درست حساب می‌شود و در دفترچه‌ی خطا نمی‌ماند.','If you solved it right on paper but mistyped (e.g. one digit), tap this: it counts as correct and stays out of the error notebook.')+'</p>';
  return''}
function recalcScore(a){let ok=0,tot=0,wrong=0,blank=0,pend=0;a.qids.forEach(id=>{const q=CR.ix.questions.get(id),it=a.items[id]||{};if(!q)return;const g=grade(QR(q,it),it.answer);if(g.auto){tot++;if(g.ok||it.ov==='know')ok++;else if(g.skipped)blank++;else wrong++}else pend++});a.score={...(a.score||{}),ok,total:tot,pending:pend,wrong,blank}}
const chLabel=c=>String(c.label||c.id);
function chHTML(c){return'<span class="crs-cl">'+E_(chLabel(c))+'</span><span class="crs-ctx">'+(c.blocks?blocks(c.blocks):(c.text!=null?inl(c.text):''))+(c.image?figHTML({asset:c.image,alt:c.alt||'',caption:''}):'')+'</span>'}
function ansText(q,a){
  if(a==null||a===''||(Array.isArray(a)&&!a.length))return'<span class="m">بدون پاسخ</span>';
  if(q.type==='cloze')return(q.blanks||[]).map((b,i)=>'('+faN(i+1)+') <bdi dir="auto">'+E_((a&&a[i+1])||'—')+'</bdi>').join(' · ');
  if(isSC(q)){const c=cho(q).find(x=>String(x.id)===String(a));return c?'<b>'+E_(chLabel(c))+'</b> '+(c.text?inl(c.text):''):E_(a)}
  if(q.type==='multi'){return(a||[]).map(id=>{const c=(q.choices||[]).find(x=>String(x.id)===String(id));return c?'<b>'+E_(chLabel(c))+'</b>':E_(id)}).join('، ')}
  if(q.type==='match')return q.pairs.map((p,i)=>inl(p.l)+' ← '+(a[i]!=null?inl(a[i]):'—')).join('<br>');
  if(q.type==='essay')return'<div dir="auto" style="white-space:pre-wrap">'+E_(a)+'</div>';
  return'<bdi dir="auto">'+E_(a)+'</bdi>';
}
function correctText(q){
  if(q.type==='single'||q.type==='ds')return ansText(q,q.answer.choice);
  if(q.type==='place')return ansText(q,String(q.answer.pos));
  if(q.type==='cloze')return(q.blanks||[]).map((b,i)=>'('+faN(i+1)+') '+b.accepted.map(x=>'<bdi dir="auto">'+E_(x)+'</bdi>').join(' / ')).join('<br>');
  if(q.type==='multi')return ansText(q,q.answer.choices);
  if(q.type==='numeric')return'<bdi dir="ltr">'+E_(q.answer.value)+'</bdi>'+(q.answer.tol?' <span class="m">(± '+E_(q.answer.tol)+')</span>':'');
  if(q.type==='short')return q.answer.accepted.map(x=>'<bdi dir="auto">'+E_(x)+'</bdi>').join(' / ');
  if(q.type==='match')return q.pairs.map(p=>inl(p.l)+' ← '+inl(p.r)).join('<br>');
  return q.modelAnswer?(typeof q.modelAnswer==='string'?inl(q.modelAnswer):blocks(q.modelAnswer)):'<span class="m">معیار قطعی ندارد؛ پاسخ نمونه/راه‌حل را ببینید</span>';
}
function passOf(q){const c=CR.ix.courses.get(q.courseId);return q.passageId&&c&&(c.passages||[]).find(p=>p.id===q.passageId)||null}
function passHTML(q){const p=passOf(q);return p?'<div class="crs-pass acf-pin" data-pid="pass"><div class="m"><b>📄 '+E_(p.title||TT('متن مشترک','Shared passage'))+'</b></div>'+blocks(p.blocks)+'</div>':''}
function stemHTML(q,it,locked){
  q=QR(q,it);
  let st=Array.isArray(q.stem)?q.stem:[{type:'p',text:q.stem}];
  const imgs=st.filter(b=>b&&(b.type==='image'||b.type==='figure')),rest=st.filter(b=>!(b&&(b.type==='image'||b.type==='figure')));
  if(q.image)imgs.push({type:'image',asset:q.image,alt:q.imageAlt||'',caption:q.imageCaption||''});
  let main=blocks(rest);
  if(q.type==='ds'&&Array.isArray(q.statements))main+='<ol class="crs-ds">'+q.statements.map((x,i)=>'<li value="'+(i+1)+'" dir="auto">'+inl(x)+'</li>').join('')+'</ol>';
  if(q.type==='cloze')main=main.replace(/\{\{(\d{1,2})\}\}/g,(m,n)=>{const i=+n;if(!it||locked===undefined&&!it)return'<b class="crs-bl">('+faN(i)+')</b>';return'<input class="crs-cz" data-crq="cloze" data-i="'+i+'" dir="auto" size="9" aria-label="'+i+'" value="'+E_((it.answer&&it.answer[i])||'')+'"'+(locked?' disabled':'')+'>'});
  const side=imgs.map(figHTML).join('');
  return side?'<div class="crs-qrow"><div class="crs-qm">'+main+'</div><div class="crs-qs">'+side+'</div></div>':main;
}
function srcLine(r){if(!r||!r.sourceId)return'';return'<div class="m crs-src">📚 '+E_(srcName(r.sourceId))+(r.chapter?' · فصل '+E_(r.chapter):'')+(r.page!=null?' · صفحه '+E_(r.page):'')+'</div>'}
const gArr=(q)=>!!q;
/* ---------- آمار ---------- */
function latestResults(cid){ // آخرین نتیجه‌ی هر سؤال
  const m=new Map();
  CR.cache.attempts.filter(a=>(a.courseId===cid||(a.courses&&a.courses.includes(cid)))&&a.status==='done').sort((a,b)=>a.finishedAt-b.finishedAt).forEach(a=>{Object.entries(a.items||{}).forEach(([qid,it])=>{if(a.courses){const q=CR.ix.questions.get(qid);if(!q||q.courseId!==cid)return}const ok=effOk(it);if(ok!=null)m.set(qid,{ok,at:a.finishedAt})})});
  return m;
}
function mastery(cid){
  const R=latestResults(cid),T=new Map();
  questionsOf(cid).forEach(q=>{const r=R.get(q.id);if(!r)return;(q.topicIds.length?q.topicIds:['_none']).forEach(t=>{const o=T.get(t)||{t,n:0,ok:0};o.n++;if(r.ok)o.ok++;T.set(t,o)})});
  return[...T.values()].map(o=>({...o,p:Math.round(o.ok/o.n*100),lv:o.n<3?'نامشخص':o.ok/o.n>=.8?'مسلط':o.ok/o.n>=.5?'در حال یادگیری':'ضعیف'})).sort((a,b)=>a.p-b.p);
}
const lvColor={'مسلط':'#16a34a','در حال یادگیری':'#ea580c','ضعیف':'#dc2626','نامشخص':'#64748b'};
/* ---------- نماها ---------- */
const TABS=[['home','داشبورد'],['courses','دوره‌ها'],['quiz','تمرین و آزمون'],['errors','دفترچه خطا'],['review','مرور و نشانک'],['sources','منابع'],['report','گزارش پیشرفت'],['manage','ورود و مدیریت']];
function tabs(){return'<div class="row np tabs">'+TABS.map(t=>'<button class="'+(CR.tab===t[0]?'p':'')+'" data-a="crs_tab" data-k="'+t[0]+'">'+t[1]+(t[0]==='errors'&&unresolved()?' ('+faN(unresolved())+')':'')+'</button>').join('')+'</div>'}
const unresolved=()=>CR.cache.errors.filter(e=>!e.resolved).length;
function empty(){return'<div class="c"><h3>هنوز دوره‌ای وارد نشده است</h3><p class="m">محتوای آموزشی را بیرون از پلنر (مثلاً با ChatGPT) تهیه کن، در قالب بسته‌ی <bdi dir="ltr">.dani-course.zip</bdi> بریز و از «ورود و مدیریت» وارد کن. پس از ورود، همه‌چیز آفلاین کار می‌کند.</p><button class="p" data-a="crs_tab" data-k="manage">رفتن به ورود دوره</button></div>'}
function vHome(){
  const cs=CR.cache.courses;if(!cs.length)return empty();
  const att=CR.cache.attempts.filter(a=>a.status==='done'),last=CR.cache.progress.filter(p=>p.lastAt).sort((a,b)=>b.lastAt-a.lastAt)[0];
  let tq=0,ok=0;att.forEach(a=>Object.values(a.items||{}).forEach(i=>{const e=effOk(i);if(e!=null){tq++;if(e)ok++}}));
  const act=CR.cache.attempts.filter(a=>a.status==='active');
  let h='<div class="g g4"><div class="c"><h3>دوره‌ها</h3><div class="big">'+faN(cs.length)+'</div></div><div class="c"><h3>درس‌های کامل‌شده</h3><div class="big">'+faN(CR.cache.progress.filter(p=>p.done).length)+'</div></div><div class="c"><h3>دقت آزمون‌ها</h3><div class="big">'+(tq?faN(Math.round(ok/tq*100))+'٪':'—')+'</div><div class="m" style="text-align:center">'+faN(tq)+' پاسخ تصحیح‌شده</div></div><div class="c"><h3>اشتباهات باز</h3><div class="big">'+faN(unresolved())+'</div></div></div>';
  if(last){const l=CR.ix.lessons.get(last.id);if(l)h+='<div class="c"><h3>ادامه‌ی مطالعه</h3><b dir="auto">'+E_(l.title)+'</b> <span class="m">· '+E_((CR.ix.courses.get(l.courseId)||{}).title||'')+'</span><div class="row" style="margin-top:8px"><button class="p" data-a="crs_open" data-c="'+E_(l.courseId)+'" data-l="'+E_(l.id)+'">ادامه</button></div></div>'}
  if(act.length)h+='<div class="c"><h3>آزمون نیمه‌تمام</h3>'+act.map(a=>'<div class="row"><span>'+E_((CR.ix.courses.get(a.courseId)||{}).title||a.courseId)+' · '+(a.mode==='exam'?'آزمون':'تمرین')+' · '+faN(a.qids.length)+' سؤال</span><button class="p" data-a="crs_resume" data-id="'+E_(a.id)+'">ادامه</button></div>').join('')+'</div>';
  if(window.daniAcd4)return h+window.daniAcd4.tree();
  h+=cs.map(c=>{const p=courseProg(c.id);return'<div class="c"><div class="row"><h3 class="sp" dir="auto">'+E_(c.title)+'</h3><span class="m">نسخه‌ی '+E_(c.contentVersion)+'</span></div>'+bar(p.p)+'<div class="m">'+faN(p.done)+' از '+faN(p.n)+' درس · '+faN(questionsOf(c.id).length)+' سؤال</div><div class="row" style="margin-top:8px"><button class="p" data-a="crs_open" data-c="'+E_(c.id)+'">باز کردن</button><button data-a="crs_qstart" data-c="'+E_(c.id)+'" data-s="all" data-m="exam">آزمون جامع</button></div></div>'}).join('');
  return h;
}
function vCourses(){
  if(CR.lessonId)return vStudy();
  if(CR.courseId&&course())return vCourse();
  const cs=CR.cache.courses;if(!cs.length)return empty();
  if(window.daniAcd4)return window.daniAcd4.tree();
  return'<div class="g g2">'+cs.map(c=>{const p=courseProg(c.id);return'<div class="c"><h3 dir="auto">'+E_(c.title)+'</h3><p class="m" dir="auto">'+E_(c.description)+'</p>'+bar(p.p)+'<div class="m">'+faN(c.chapters.length)+' فصل · '+faN(p.n)+' درس · '+faN(questionsOf(c.id).length)+' سؤال · زبان: '+E_(c.language)+'</div><button class="p" data-a="crs_open" data-c="'+E_(c.id)+'" style="margin-top:8px">باز کردن</button></div>'}).join('')+'</div>';
}
/* v170: «تازه‌ها» — بعد از به‌روزرسانی دوره‌ی نصب‌شده فقط همین‌ها را نشان می‌دهد (جمع‌شده، با «دیدم») */
function newsCard(c){const A=zAX(),seen=(A.nws&&A.nws[c.id])||{},ns=(c.news||[]).filter(n=>!seen[n.id]);if(!ns.length)return'';
 const sum=ns.reduce((a,n)=>({a:a.a+(n.nadd||0),u:a.u+(n.nupd||0),q:a.q+(n.nq||0)}),{a:0,u:0,q:0}),ci=E_(c.id);
 const chn=id=>{const ch=(c.chapters||[]).find(x=>x.id===id);return ch?E_(ch.title):''};
 let h='<details class="c crs-news"><summary dir="auto"><b>🆕 '+TT('تازه‌ها','What\'s new')+'</b> <small class="m">'+(sum.a?faN(sum.a)+' '+TT('درس جدید','new lessons')+' · ':'')+(sum.u?faN(sum.u)+' '+TT('درس به‌روز','updated')+' · ':'')+(sum.q?faN(sum.q)+' '+TT('سؤال','questions'):'')+'</small></summary>';
 ns.slice(-3).reverse().forEach(n=>{h+='<div class="m" dir="auto" style="margin-top:6px"><b>'+(n.file?E_(n.file)+' · ':'')+'v'+E_(n.ver)+'</b>'+(n.note?' — '+E_(n.note):'')+'</div>'
  +(n.add&&n.add.length?'<div class="row" style="flex-wrap:wrap">'+n.add.slice(0,8).map(x=>'<button class="chip sm" data-a="crs_open" data-c="'+ci+'" data-l="'+E_(x.l)+'" dir="auto">＋ '+E_(x.t)+(chn(x.c)?' · '+chn(x.c):'')+'</button>').join('')+(n.add.length>8?'<span class="m">… '+faN(n.nadd-8)+'</span>':'')+'</div>':'')
  +(n.upd&&n.upd.length?'<div class="row" style="flex-wrap:wrap">'+n.upd.slice(0,6).map(x=>'<button class="chip sm" data-a="crs_open" data-c="'+ci+'" data-l="'+E_(x.l)+'" dir="auto">↻ '+E_(x.t)+'</button>').join('')+'</div>':'')});
 return h+'<div class="row" style="margin-top:6px"><button class="chip sm" data-a="crs_news_ok" data-c="'+ci+'">✓ '+TT('دیدم','Got it')+'</button></div><p class="m">'+TT('پیشرفت درس‌های قبلی تو دست‌نخورده است.','Your progress on earlier lessons is untouched.')+'</p></details>'}
/* فهرست دوره‌ها برای چت سازنده (تا درس تکراری ساخته نشود) */
function catalogText(){const out=['DANI-CATALOG v1 — فهرست دوره‌های نصب‌شده (برای جلوگیری از درس تکراری؛ این فهرست را به هوش مصنوعی بده)'];
 CR.cache.courses.forEach(c=>{out.push('');out.push('COURSE '+c.id+' | '+c.title+' | kind='+(c.kind||'')+' | v'+c.contentVersion);
  filesOf(c).forEach(f=>{out.push('  FILE '+f.id+' | '+f.name+(f.partId?' | part='+f.partId:'')+' | v'+(f.ver||''))});
  (c.chapters||[]).forEach(ch=>{const ls=lessonsOf(c.id).filter(l=>l.chapterId===ch.id);out.push('  CHAPTER '+ch.id+' | '+ch.title+' | lessons='+ls.length);ls.forEach(l=>out.push('    L '+l.id+' | '+l.title+(l.role==='aid'?' | aid':'')))});
  out.push('  questions='+questionsOf(c.id).length+' | sessions='+((c.sessions||[]).length))});
 return out.join('\n')}
/* v169: کارت «جلسه‌ی مطالعه» در صفحه‌ی دوره (فقط اگر دوره sessions داشته باشد) */
function sesData(cid){const A=zAX();if(!A.ses||typeof A.ses!=='object'||Array.isArray(A.ses))A.ses={};if(!A.ses[cid]||typeof A.ses[cid]!=='object')A.ses[cid]={};return A.ses[cid]}
const partDone=(c,sid,i,p)=>{const d=sesData(c.id)[sid];if(d&&d.p&&d.p[i])return true;return p.kind==='learn'&&p.lessonIds.length>0&&p.lessonIds.every(l=>{const g=CR.ix.progress.get(l);return g&&g.done})};
const sesDone=(c,x)=>x.parts.length>0&&x.parts.every((p,i)=>partDone(c,x.id,i,p));
function sessionCard(c,allOpen){const ss=(c.sessions||[]).slice().sort((a,b)=>(a.order||0)-(b.order||0));if(!ss.length)return'';
 CR.sesSel=CR.sesSel||{};const nx=ss.find(x=>!sesDone(c,x))||ss[ss.length-1],cur=ss.find(x=>x.id===CR.sesSel[c.id])||nx,k=ss.indexOf(cur)+1,done=sesDone(c,cur),ci=E_(c.id);
 const IC={review:'🔁',learn:'📖',read:'📚',watch:'🎬',cards:'🃏',practice:'✍️',test:'📝',wrap:'🏁'},KT={review:TT('مرور خطاها','Review mistakes'),learn:TT('یادگیری','Learn'),read:TT('مطالعه','Read'),watch:TT('ویدئو','Watch'),cards:TT('فلش‌کارت','Flashcards'),practice:TT('تمرین','Practice'),test:TT('آزمونک','Quiz'),wrap:TT('جمع‌بندی','Wrap-up')};
 const tot=cur.minutes||cur.parts.reduce((a,p)=>a+(p.minutes||0),0);
 let h='<div class="c crs-ses"><div class="row"><b dir="auto" class="sp">'+(done?'✅ ':'▶ ')+(cur.type==='mock'?'📝 '+TT('آزمون آزمایشی','Mock exam'):cur.type==='recap'?'🔁 '+TT('جلسه‌ی مرور','Recap session'):TT('جلسه','Session'))+' '+faN(k)+' / '+faN(ss.length)+' — '+E_(cur.title)+'</b><span class="m">'+(tot?'~'+faN(tot)+' '+TT('دقیقه','min'):'')+'</span></div>'+(cur.why?'<p class="m" dir="auto">'+E_(cur.why)+'</p>':'');
 cur.parts.forEach((p,i)=>{const d=partDone(c,cur.id,i,p),at=' data-c="'+ci+'" data-s="'+E_(cur.id)+'" data-i="'+i+'"';
  h+='<div class="cwr"><span dir="auto"><button class="chip sm'+(d?' on':'')+'" data-a="crs_ses_tick"'+at+' aria-label="'+TT('انجام شد','Done')+'">'+(d?'☑':'☐')+'</button> '+IC[p.kind]+' <b>'+KT[p.kind]+'</b>'+(p.title?' · '+E_(p.title):'')+(p.minutes?' <small class="m">'+faN(p.minutes)+' '+TT('دق','min')+'</small>':'')+(p.ref?'<div class="m">'+E_(p.ref)+'</div>':'')+(p.text?'<div class="m">'+E_(p.text)+'</div>':'')+'</span>'+((p.kind==='wrap'||p.kind==='read'||p.kind==='watch')?'':'<button class="chip sm" data-a="crs_ses_go"'+at+'>'+TT('شروع','Start')+'</button>')+'</div>'});
 h+='<details style="margin-top:6px"'+(allOpen?' open':'')+'><summary class="m">'+TT('همه‌ی جلسه‌ها','All sessions')+'</summary>'+ss.map((x,j)=>'<div class="cwr"><span dir="auto">'+(sesDone(c,x)?'✅ ':'⬜ ')+faN(j+1)+'. '+E_(x.title)+'</span><button class="chip sm'+(x.id===cur.id?' on':'')+'" data-a="crs_ses_pick" data-c="'+ci+'" data-s="'+E_(x.id)+'">'+TT('باز کن','Open')+'</button></div>').join('')+'</details></div>';
 return h}
function vCourse(){
  const c=course(),L=lessonsOf(c.id);
  let h='<div class="c"><div class="row"><button data-a="crs_back">‹ فهرست دوره‌ها</button><h3 class="sp" dir="auto">'+E_(c.title)+'</h3><button class="chip sm" data-a="acd4_rn" data-t="c" data-c="'+E_(c.id)+'" data-i="'+E_(c.id)+'" aria-label="Rename">✎</button></div><p dir="auto">'+E_(c.description)+'</p>';
  if(c.goals&&c.goals.length)h+='<b>اهداف یادگیری</b><ul dir="auto">'+c.goals.map(g=>'<li>'+inl(g)+'</li>').join('')+'</ul>';
  if(c.prerequisites&&c.prerequisites.length)h+='<div class="m">پیش‌نیاز: '+c.prerequisites.map(x=>E_(x)).join('، ')+'</div>';
  h+='</div>';
  if(window.daniAcd4){const t=window.daniAcd4.courseTabs(c);h+=t.bar;if(t.body!=null)return h+t.body}
  /* v185: چینش دوره — layout=sessions: جلسه‌ها اصلی‌اند و فهرست مبحث‌ها پشت یک چیپ کوچک؛ layout=chapters: فقط فصل‌ها؛ بدون layout: اگر جلسه دارد مثل sessions */
  const hasS=(c.sessions||[]).length>0&&c.layout!=='chapters';let view='ch';
  if(hasS){CR.cv=CR.cv||(()=>{try{return JSON.parse(localStorage.getItem('crs_cv')||'{}')}catch(e){return{}}})();view=CR.cv[c.id]==='ch'?'ch':'ses';
    h+='<div class="row np crs-cv"><button class="chip'+(view==='ses'?' on':'')+'" data-a="crs_cview" data-c="'+E_(c.id)+'" data-v="ses">📅 '+TT('جلسه‌ها','Sessions')+'</button><button class="chip'+(view==='ch'?' on':'')+'" data-a="crs_cview" data-c="'+E_(c.id)+'" data-v="ch">📚 '+TT('بر اساس '+((c.unit&&c.unit!=='جلسه')?c.unit:'مبحث'),'By '+((c.unit&&c.unit!=='جلسه'&&c.unit!=='فصل')?c.unit:'topic'))+'</button></div>'}
  h+=newsCard(c);if(view==='ses')return h+sessionCard(c,true);
  CR.chOpen=CR.chOpen||{};
  const ren=(t,id,cid)=>'<button class="chip sm" data-a="acd4_rn" data-t="'+t+'" data-c="'+E_(cid)+'" data-i="'+E_(id)+'" title="'+TT('تغییر نام','Rename')+'" aria-label="'+TT('تغییر نام','Rename')+'">✎</button>';
  c.chapters.forEach((ch,ci)=>{const ls=L.filter(l=>l.chapterId===ch.id),d=ls.filter(l=>{const p=CR.ix.progress.get(l.id);return p&&p.done}).length,open=CR.chOpen[ch.id]!==undefined?CR.chOpen[ch.id]:c.chapters.length<=3;
    h+='<div class="c"><div class="row"><button data-a="crs_chtog" data-k="'+E_(ch.id)+'" aria-expanded="'+open+'">'+(open?'▾':'◂')+'</button><span class="badge">'+(c.unit&&c.unit!=='فصل'?E_(c.unit):TT('فصل','Ch.'))+' '+faN(ci+1)+'</span><h3 class="sp" dir="auto">'+E_(ch.title)+'</h3>'+ren('ch',ch.id,c.id)+'<span class="m">'+faN(d)+'/'+faN(ls.length)+'</span></div>'+bar(ls.length?d/ls.length*100:0)+
    (open?'<div class="row" style="margin-top:6px"><button data-a="crs_qstart" data-c="'+E_(c.id)+'" data-s="chapter:'+E_(ch.id)+'" data-m="practice">'+TT('تمرین','Practice')+' '+E_(c.unit||'فصل')+'</button><button data-a="crs_qstart" data-c="'+E_(c.id)+'" data-s="chapter:'+E_(ch.id)+'" data-m="exam">'+TT('آزمون','Exam')+' '+E_(c.unit||'فصل')+'</button><button class="chip sm d" data-a="acd4_dch" data-c="'+E_(c.id)+'" data-i="'+E_(ch.id)+'" title="'+TT('حذف','Delete')+'">🗑</button></div>'+(window.daniAcd4?window.daniAcd4.chapterInfo(c.id,ch,ls):'')+
    (ls.length?ls.map(l=>{const p=CR.ix.progress.get(l.id),bm=CR.ix.bookmarks.has('b_lesson_'+l.id);return'<div class="cwr"><span>'+(p&&p.done?'✅ ':'⬜ ')+'<a data-a="crs_open" data-c="'+E_(c.id)+'" data-l="'+E_(l.id)+'" tabindex="0" style="cursor:pointer;color:var(--ac)" dir="auto">'+E_(l.title)+'</a> '+(bm?'★ ':'')+stBadge(l)+ctBadge(l)+(window.daniAcd4?window.daniAcd4.lessonChip(l):'')+'</span>'+ren('l',l.id,c.id)+'</div>'}).join(''):(((c.slots||[]).filter(x=>x.chapterId===ch.id&&!L.some(l=>l.id===x.id)).length)?'':'<p class="m">'+TT('این فصل هنوز مبحثی ندارد.','No topics yet.')+'</p>')):'')+(open?(c.slots||[]).filter(x=>x.chapterId===ch.id&&!L.some(l=>l.id===x.id)).sort((x,y)=>x.order-y.order).map(x=>'<div class="cwr m"><span>⏳ <span dir="auto">'+E_(x.title)+'</span> — '+TT('به‌زودی','coming soon')+'</span></div>').join(''):'')+'</div>'});
  return h;
}
function vStudy(){
  const l=CR.ix.lessons.get(CR.lessonId);if(!l){CR.lessonId='';return vCourses()}
  const c=CR.ix.courses.get(l.courseId),p=CR.ix.progress.get(l.id)||{},L=lessonsOf(l.courseId),i=L.findIndex(x=>x.id===l.id),ch=c.chapters.find(x=>x.id===l.chapterId);
  const qs=questionsOf(l.courseId).filter(q=>q.lessonIds.includes(l.id)),by=d=>qs.filter(q=>q.difficulty===d).length;
  let h=(window.daniAcd4?window.daniAcd4.crumb(l):'')+'<div class="c crs-lesson" data-nobi style="--crs-mz:'+CR.mz+'"><div class="row np"><button data-a="crs_open" data-c="'+E_(c.id)+'">‹ '+E_(c.title)+'</button><span class="m">'+E_(ch?ch.title:'')+'</span><span class="sp"></span><button data-a="crs_mz" data-d="-1" title="کوچک‌کردن فرمول">A−</button><button data-a="crs_mz" data-d="1" title="بزرگ‌کردن فرمول">A+</button></div>'+
   '<h2 dir="auto" style="margin:8px 0">'+E_(l.title)+'</h2><div>'+stBadge(l)+ctBadge(l)+'</div>';
  if(p.done&&p.doneHash&&p.doneHash!==l.hash)h+='<div class="crs-call crs-warning"><div class="crs-ct">⚠️ این درس پس از تکمیل شما به‌روزرسانی شده است</div><button data-a="crs_ack" data-l="'+E_(l.id)+'">مرور شد</button></div>';
  if((l.prerequisites&&l.prerequisites.length)||(l.goals&&l.goals.length))h+='<div class="crs-call crs-note"><div class="crs-ct">🎯 پیش‌نیاز و اهداف</div>'+(l.prerequisites&&l.prerequisites.length?'<div>پیش‌نیاز: '+l.prerequisites.map(x=>inl(x)).join('، ')+'</div>':'')+(l.goals&&l.goals.length?'<ul dir="auto">'+l.goals.map(g=>'<li>'+inl(g)+'</li>').join('')+'</ul>':'')+'</div>';
  h+='<div class="crs-body">'+blocks(l.blocks)+'</div>';
  if(l.summary)h+=blk({type:'summary',title:'جمع‌بندی',...(typeof l.summary==='string'?{text:l.summary}:{blocks:l.summary})},0);
  if(Array.isArray(l.checklist)&&l.checklist.length){const ck=p.checks||{};h+='<div class="crs-call crs-tip"><div class="crs-ct">☑ چک‌لیست تسلط</div>'+l.checklist.map((x,k)=>'<label class="crs-ck"><input type="checkbox" data-a="crs_ck" data-l="'+E_(l.id)+'" data-k="'+k+'" '+(ck[k]?'checked':'')+'> <span dir="auto">'+inl(x)+'</span></label>').join('')+'</div>'}
  h+=vidBtn(l.video)+srcLine(l.sourceRef);
  h+='<div class="row" style="margin-top:10px"><button class="'+(p.done?'':'p')+'" data-a="crs_done" data-l="'+E_(l.id)+'">'+(p.done?'↩ برگرداندن به ناتمام':'✓ این درس را تمام کردم')+'</button><button data-a="crs_bm" data-k="lesson" data-r="'+E_(l.id)+'">'+(CR.ix.bookmarks.has('b_lesson_'+l.id)?'★ نشانک شد':'☆ نشانک')+'</button></div></div>';
  h+='<div class="c"><h3>تمرین و تست این درس</h3>'+(qs.length?'<div class="m">'+faN(by(1))+' آسان · '+faN(by(2))+' متوسط · '+faN(by(3))+' دشوار</div><div class="row" style="margin-top:8px">'+[1,2,3].map(d=>by(d)?'<button data-a="crs_qstart" data-c="'+E_(c.id)+'" data-s="lesson:'+E_(l.id)+'" data-m="practice" data-d="'+d+'">تمرین '+['آسان','متوسط','دشوار'][d-1]+'</button>':'').join('')+'<button class="p" data-a="crs_qstart" data-c="'+E_(c.id)+'" data-s="lesson:'+E_(l.id)+'" data-m="exam">آزمون این درس</button></div>':'<p class="m">هنوز سؤالی به این درس پیوند نخورده است.</p>')+'</div>';
  if(window.daniAcd4)h+=window.daniAcd4.lessonExtra(l)+window.daniAcd4.lessonCards(l);
  const ns=CR.cache.notes.filter(n=>n.lessonId===l.id).sort((a,b)=>b.at-a.at);
  h+='<div class="c"><h3>یادداشت‌های من</h3><textarea id="crs-note" rows="3" dir="auto" placeholder="یادداشت درباره‌ی این درس…"></textarea><button data-a="crs_note" data-l="'+E_(l.id)+'">ذخیره‌ی یادداشت</button>'+ns.map(n=>'<div class="cwr"><span dir="auto" style="white-space:pre-wrap">'+E_(n.text)+' <small class="m">'+new Date(n.at).toLocaleDateString('fa-IR')+'</small></span><button class="d" data-a="crs_notedel" data-id="'+E_(n.id)+'">✕</button></div>').join('')+'</div>';
  h+='<div class="row">'+(i>0?'<button data-a="crs_open" data-c="'+E_(c.id)+'" data-l="'+E_(L[i-1].id)+'">‹ درس قبلی</button>':'')+'<span class="sp"></span>'+(i<L.length-1?'<button class="p" data-a="crs_open" data-c="'+E_(c.id)+'" data-l="'+E_(L[i+1].id)+'">درس بعدی ›</button>':'')+'</div>';
  return h;
}
const TT=(f,e)=>typeof window.daniT==='function'?window.daniT(f,e):f;
CR.ev=CR.ev||'all';
function errSrc(q,e){const ls=(q.lessonIds||[]).map(id=>CR.ix.lessons.get(id)).filter(Boolean).map(l=>l.title);const d=e.lastAt?new Date(e.lastAt).toLocaleDateString('fa-IR'):'';
  return TT('از: ','From: ')+(ls.length?E_(ls.slice(0,2).join('، ')):TT('بدون درس مشخص','no specific lesson'))+(d?' · '+d:'')}
function errCard(e,q,grp){const causes=['ندانستن مفهوم','اشتباه محاسباتی','بی‌دقتی در خواندن','کمبود زمان','حدس زدن','اشتباه در روش'];
  return '<div class="c" style="'+(e.resolved?'opacity:.6':'')+'"><div class="m">'+(grp==='topic'?'':E_(topicName(q.courseId,(q.topicIds||[])[0]||''))+' · ')+TT('دشواری ','Difficulty ')+faN(q.difficulty)+' · '+faN(e.count||1)+TT(' بار اشتباه',' mistakes')+(e.conf==='sure'?' '+badge(TT('⚠ مطمئن ولی غلط','⚠ Sure but wrong'),'#dc2626'):'')+(e.due&&!e.resolved?' · '+TT('مرور: ','Review: ')+E_(e.due):'')+'</div><div class="m">'+errSrc(q,e)+'</div>'+trapLine(e)+'<details><summary dir="auto">'+(typeof q.stem==='string'?inl(q.stem).slice(0,200):TT('مشاهده‌ی سؤال','View question'))+'</summary><div class="crs-lesson" data-nobi style="--crs-mz:'+CR.mz+'">'+stemHTML(q)+'<div class="crs-ans"><b>'+TT('پاسخ صحیح:','Correct answer:')+'</b> '+correctText(q)+'</div>'+(q.solution?'<div class="crs-sol"><b>'+TT('راه‌حل:','Solution:')+'</b>'+blocks(q.solution)+'</div>':'')+'</div></details><div class="row" style="margin-top:6px">'+(!e.cause&&e.sugg?'<button class="chip sm" data-a="crs_sugg" data-id="'+E_(e.id)+'">💡 '+TT('پیشنهاد علت: ','Suggested cause: ')+E_(e.sugg)+' ✓</button>':'')+'<select data-crs-cause="'+E_(e.id)+'"><option value="">'+TT('علت اشتباه…','Cause…')+'</option>'+causes.map(x=>'<option '+(e.cause===x?'selected':'')+'>'+x+'</option>').join('')+'</select><input data-crs-enote="'+E_(e.id)+'" value="'+E_(e.note||'')+'" placeholder="'+TT('یادداشت','Note')+'" style="flex:1;min-width:120px"><button data-a="crs_erres" data-id="'+E_(e.id)+'">'+(e.resolved?'↩ '+TT('بازگشایی','Reopen'):'✓ '+TT('حل شد','Solved'))+'</button></div></div>'}
function errSelf(l){const open=l.filter(e=>!e.resolved&&CR.ix.questions.get(e.qid)&&(!CR.edue||qDue(e)));
  const done=l.reduce((n,e)=>n+(e.selfN||0),0),ok=l.reduce((n,e)=>n+(e.selfK||0),0);
  let h='<div class="c"><h3>🎯 '+TT('خودآزمایی بدون مبحث','Self-test without topics')+'</h3><p class="m">'+TT('فقط خود سؤال را می‌بینی، بدون نام درس و مبحث. اول فکر کن، بعد پاسخ را ببین و صادقانه بگو آیا سؤال را تشخیص دادی و می‌توانستی حلش کنی.','You see only the question — no lesson or topic name. Think first, then reveal the answer and honestly say whether you recognised it and could solve it.')+'</p>'+(done?'<div class="m">'+TT('تشخیص دادم: ','Recognised: ')+faN(ok)+' / '+faN(done)+' ('+faN(Math.round(ok/done*100))+'٪)</div>':'')+'</div>';
  if(!open.length)return h+'<div class="c"><p class="m">'+(CR.edue?TT('امروز سؤال موعدرسیده نداری 🎉','Nothing due today 🎉'):TT('اشتباه بازی نداری.','No open mistakes.'))+'</p></div>';
  let e=open.find(x=>x.id===CR.es)||open[Math.floor(Math.random()*open.length)];CR.es=e.id;const q=CR.ix.questions.get(e.qid);
  return h+'<div class="c"><div class="crs-lesson" data-nobi style="--crs-mz:'+CR.mz+'">'+stemHTML(q)+'</div><details style="margin-top:8px"><summary>'+TT('نمایش پاسخ','Show answer')+'</summary><div class="crs-lesson" data-nobi style="--crs-mz:'+CR.mz+'"><div class="crs-ans"><b>'+TT('پاسخ صحیح:','Correct answer:')+'</b> '+correctText(q)+'</div>'+(q.solution?'<div class="crs-sol">'+blocks(q.solution)+'</div>':'')+'</div></details><div class="row" style="margin-top:10px">'+[['again','❌','دوباره','Again'],['hard','😓','سخت','Hard'],['good','✅','خوب','Good'],['easy','😎','آسان','Easy']].map(b=>'<button class="'+(b[0]==='good'?'p':'')+'" data-a="crs_esres" data-k="'+b[0]+'">'+b[1]+' '+TT(b[2],b[3])+' <span class="m">· '+faN(qSched(e,b[0]))+TT(' روز',' d')+'</span></button>').join('')+'<button data-a="crs_esres" data-k="">⏭ '+TT('بعدی','Next')+'</button></div></div>'}
function vErrors(){
  const l=CR.cache.errors.slice().sort((a,b)=>b.lastAt-a.lastAt);
  if(!l.length)return'<div class="c"><h3>'+TT('دفترچه‌ی خطا','Error notebook')+'</h3><p class="m">هنوز اشتباهی ثبت نشده است. اشتباه‌های آزمون‌ها به‌صورت خودکار اینجا جمع می‌شوند.</p></div>';
  const cnt={};l.forEach(e=>{if(e.cause)cnt[e.cause]=(cnt[e.cause]||0)+1});
  const V=[['all','همه‌ی اشتباهات','All mistakes'],['lesson','به‌تفکیک درس','By lesson'],['topic','به‌تفکیک مبحث','By topic'],['self','خودآزمایی','Self-test']];
  let h='<div class="c"><div class="row"><h3 class="sp">'+TT('دفترچه‌ی خطا','Error notebook')+' ('+faN(unresolved())+TT(' باز از ',' open of ')+faN(l.length)+')</h3>'+(unresolved()?'<button class="p" data-a="crs_errprac">'+TT('تمرین مجدد اشتباهات باز','Practise open mistakes')+'</button>':'')+'</div>'+(Object.keys(cnt).length?'<div class="m">علت‌ها: '+Object.entries(cnt).map(([k,v])=>E_(k)+' ×'+faN(v)).join(' · ')+'</div>':'')
   +'<div class="row" style="margin-top:8px">'+V.map(v=>'<button class="chip '+(CR.ev===v[0]?'on':'')+'" data-a="crs_ev" data-k="'+v[0]+'">'+TT(v[1],v[2])+'</button>').join('')+'</div>'
   +(CR.ev==='self'?'<div class="row" style="margin-top:8px"><button class="chip '+(CR.edue?'on':'')+'" data-a="crs_edue">🧩 '+TT('فقط سؤال‌های موعدرسیده امروز','Only due today')+' ('+faN(qDueCount())+')</button></div>':'<div class="row" style="margin-top:8px"><input type="search" data-crs-eq value="'+E_(CR.eq||'')+'" placeholder="'+TT('🔍 جست‌وجو در متن سؤال، علت، تله…','🔍 Search question, cause, trap…')+'" style="flex:1;min-width:150px" dir="auto"><button class="chip" data-a="crs_eqgo">'+TT('جست‌وجو','Search')+'</button>'+[['','همه','All'],['open','باز','Open'],['done','حل‌شده','Solved'],['sure','مطمئن ولی غلط','Sure but wrong']].map(f=>'<button class="chip '+((CR.ef||'')===f[0]?'on':'')+'" data-a="crs_ef" data-k="'+f[0]+'">'+TT(f[1],f[2])+'</button>').join('')+'</div>')+'</div>';
  if(CR.ev==='self')return h+errSelf(l);
  const eqs=(CR.eq||'').trim().toLowerCase(),efl=CR.ef||'';
  const efOk=e=>{if(efl==='open'&&e.resolved)return false;if(efl==='done'&&!e.resolved)return false;if(efl==='sure'&&e.conf!=='sure')return false;if(!eqs)return true;const q=CR.ix.questions.get(e.qid);return [e.cause,e.note,e.traps?Object.keys(e.traps).join(' '):'',q?JSON.stringify([q.stem,q.choices,q.answer]):'',q?topicName(q.courseId,(q.topicIds||[])[0]||''):''].join(' ').toLowerCase().includes(eqs)};
  const rows=l.filter(efOk).map(e=>({e,q:CR.ix.questions.get(e.qid)}));
  if(!rows.length)return h+'<div class="c"><p class="m">'+TT('چیزی با این جست‌وجو پیدا نشد.','Nothing matches.')+'</p></div>';
  const gone=rows.filter(r=>!r.q);rows.filter(r=>!r.q).forEach(()=>{});
  const ok=rows.filter(r=>r.q);
  if(CR.ev==='all'){ok.forEach(r=>{h+=errCard(r.e,r.q)});gone.forEach(r=>{h+='<div class="c" style="opacity:.6">سؤال حذف‌شده یا هنوز نصب‌نشده: '+E_(r.e.qid)+'</div>'});return h}
  const G=new Map();
  ok.forEach(r=>{let key,title,sub='';
   if(CR.ev==='lesson'){const id=(r.q.lessonIds||[])[0],ls=id&&CR.ix.lessons.get(id);key=ls?ls.id:'-';title=ls?ls.title:TT('بدون درس مشخص','No specific lesson');if(ls)sub='<button class="chip" data-a="crs_open" data-c="'+E_(ls.courseId||r.q.courseId)+'" data-l="'+E_(ls.id)+'">📖 '+TT('باز کردن درس','Open lesson')+'</button>'}
   else{const id=(r.q.topicIds||[])[0];key=id||'-';title=id?topicName(r.q.courseId,id):TT('بدون مبحث','No topic')}
   if(!G.has(key))G.set(key,{title,sub,items:[]});G.get(key).items.push(r)});
  [...G.values()].sort((a,b)=>b.items.filter(x=>!x.e.resolved).length-a.items.filter(x=>!x.e.resolved).length).forEach(g=>{const o=g.items.filter(x=>!x.e.resolved).length;
   const srcs=CR.ev==='topic'?[...new Set(g.items.map(x=>(x.q.lessonIds||[]).map(id=>CR.ix.lessons.get(id)).filter(Boolean).map(z=>z.title)[0]).filter(Boolean))].slice(0,3):[];
   h+='<details class="c"'+(o?' open':'')+'><summary><b dir="auto">'+E_(g.title)+'</b> <span class="m">· '+faN(o)+TT(' باز از ',' open of ')+faN(g.items.length)+'</span></summary>'+(srcs.length?'<div class="m" style="margin:4px 0">'+TT('منبع: ','Source: ')+E_(srcs.join('، '))+'</div>':'')+(g.sub?'<div class="row" style="margin:6px 0">'+g.sub+'</div>':'')+g.items.map(r=>errCard(r.e,r.q,CR.ev)).join('')+'</details>'});
  return h;
}
function vReview(){
  const bm=CR.cache.bookmarks.slice().sort((a,b)=>b.at-a.at),ns=CR.cache.notes.slice().sort((a,b)=>b.at-a.at);
  const upd=CR.cache.progress.filter(p=>p.done&&p.doneHash&&CR.ix.lessons.get(p.id)&&CR.ix.lessons.get(p.id).hash!==p.doneHash);
  const due=CR.cache.progress.filter(p=>p.done&&CR.ix.lessons.get(p.id)&&Date.now()-(p.reviewedAt||p.doneAt||0)>7*864e5);
  const flagged=new Set();CR.cache.attempts.forEach(a=>Object.entries(a.items||{}).forEach(([q,i])=>{if(i.flag)flagged.add(q)}));
  const lk=(id)=>{const l=CR.ix.lessons.get(id);return l?'<a data-a="crs_open" data-c="'+E_(l.courseId)+'" data-l="'+E_(l.id)+'" tabindex="0" style="cursor:pointer;color:var(--ac)" dir="auto">'+E_(l.title)+'</a>':E_(id)};
  let h='<div class="c"><h3>مرور مجدد</h3><div class="row">'+(flagged.size?'<button data-a="crs_flagprac">تمرین سؤال‌های علامت‌خورده ('+faN(flagged.size)+')</button>':'')+(unresolved()?'<button data-a="crs_errprac">تمرین اشتباهات باز</button>':'')+'</div>'+(upd.length?'<p><b>درس‌های به‌روزشده پس از تکمیل:</b></p>'+upd.map(p=>'<div class="cwr"><span>'+lk(p.id)+'</span></div>').join(''):'')+(due.length?'<p><b>مرور پیشنهادی (بیش از ۷ روز از آخرین مرور):</b></p>'+due.slice(0,15).map(p=>'<div class="cwr"><span>'+lk(p.id)+'</span><button data-a="crs_reviewed" data-l="'+E_(p.id)+'">مرور شد</button></div>').join(''):'')+(!flagged.size&&!unresolved()&&!upd.length&&!due.length?'<p class="m">فعلاً موردی برای مرور نیست.</p>':'')+'</div>';
  h+='<div class="c"><h3>نشانک‌ها ('+faN(bm.length)+')</h3>'+(bm.length?bm.map(b=>{let t=b.kind==='lesson'?lk(b.refId):((q)=>q?'سؤال: '+E_(q.id)+' — '+E_(topicName(q.courseId,(q.topicIds||[])[0]||'')):E_(b.refId))(CR.ix.questions.get(b.refId));return'<div class="cwr"><span>'+(b.kind==='lesson'?'📖 ':'❓ ')+t+'</span><button class="d" data-a="crs_bm" data-k="'+b.kind+'" data-r="'+E_(b.refId)+'">حذف</button></div>'}).join(''):'<p class="m">نشانکی نیست.</p>')+'</div>';
  h+='<div class="c"><h3>یادداشت‌ها ('+faN(ns.length)+')</h3>'+(ns.length?ns.map(n=>'<div class="cwr"><span dir="auto" style="white-space:pre-wrap">'+(n.lessonId?'📖 '+lk(n.lessonId)+': ':'')+E_(n.text)+'</span><button class="d" data-a="crs_notedel" data-id="'+E_(n.id)+'">✕</button></div>').join(''):'<p class="m">یادداشتی نیست.</p>')+'</div>';
  return h;
}
function vSources(){
  const S=CR.cache.sources;if(!CR.cache.courses.length)return empty();
  let h='';
  const wrapSrc=(c,h,mk)=>h.slice(0,mk)+'<details class="c"><summary><b dir="auto">'+E_(c.title)+'</b> <span class="m">· '+faN(S.filter(s=>s.courseId===c.id).length)+' منبع</span></summary>'+h.slice(mk).replace(/class="c"/g,'class="a4in"')+'</details>';
  CR.cache.courses.forEach(c=>{const mk=h.length;
    const L=lessonsOf(c.id),Q=questionsOf(c.id),ss=S.filter(s=>s.courseId===c.id);
    const cnt=(arr,f)=>arr.filter(f).length,typ=Object.keys(CT_FA).map(k=>CT_FA[k]+': '+faN(cnt(L,l=>l.contentType===k))+'/'+faN(cnt(Q,q=>q.contentType===k))).join(' · ');
    h+='<div class="c"><h3 dir="auto">'+E_(c.title)+'</h3><div class="m">نوع محتوا (درس/سؤال) — '+typ+'</div><div class="m">وضعیت بررسی دروس: تأییدشده/کامل '+faN(cnt(L,l=>l.status==='approved'||l.status==='complete'))+' · نیازمند بررسی/پیش‌نویس/ناقص '+faN(cnt(L,l=>l.status!=='approved'&&l.status!=='complete'))+' از '+faN(L.length)+'</div></div>';
    if(!ss.length){h+='<div class="c"><p class="m">برای این دوره منبعی ثبت نشده است؛ پوشش را نمی‌توان سنجید.</p></div>';h=wrapSrc(c,h,mk);return}
    ss.forEach(s=>{const chs=Array.isArray(s.chapters)?s.chapters:[];let cov=0;
      const rows=chs.map(x=>{const nl=L.filter(l=>l.sourceRef&&l.sourceRef.sourceId===s.id&&String(l.sourceRef.chapter)===String(x.id)).length,nq=Q.filter(q=>q.sourceRef&&q.sourceRef.sourceId===s.id&&String(q.sourceRef.chapter)===String(x.id)).length;if(nl||nq)cov++;
        return'<tr><td dir="auto">'+E_(x.title||x.id)+'</td><td>'+badge(SRC_FA[x.status]||'بررسی‌نشده',{processed:'#16a34a',partial:'#ea580c',unreadable:'#dc2626',pending:'#64748b'}[x.status]||'#64748b')+'</td><td>'+faN(nl)+'</td><td>'+faN(nq)+'</td><td class="m" dir="auto">'+(Array.isArray(x.issues)&&x.issues.length?x.issues.map(E_).join('؛ '):'')+'</td></tr>'}).join('');
      const bad=chs.filter(x=>x.status!=='processed').length;
      h+='<div class="c"><h3 dir="auto">📚 '+E_(s.title||s.id)+'</h3><div class="m">'+E_([s.author,s.kind].filter(Boolean).join(' · '))+'</div>'+(chs.length?'<p>فصل‌های دارای محتوا: <b>'+faN(cov)+'</b> از <b>'+faN(chs.length)+'</b> فصل ثبت‌شده در فهرست منبع'+(bad?' · <span style="color:var(--wr)">'+faN(bad)+' فصل ناقص/ناخوانا/پردازش‌نشده</span>':'')+'</p><div class="crs-tw"><table><tr><th>فصل منبع</th><th>وضعیت</th><th>درس</th><th>سؤال</th><th>ملاحظات</th></tr>'+rows+'</table></div><p class="m">این آمار فقط بر پایه‌ی فهرست فصل‌هایی است که در بسته ثبت شده؛ کامل‌بودن پوشش کتاب بدون مقایسه با فهرست واقعی کتاب تأیید نمی‌شود.</p>':'<p class="m">فهرست فصل‌های این منبع ثبت نشده؛ پوشش قابل سنجش نیست.</p>')+'</div>'});h=wrapSrc(c,h,mk)});
  return h+(window.daniAcd4?window.daniAcd4.myLinks():'');
}
function vReport(){
  if(!CR.cache.courses.length)return empty();
  let h='';
  CR.cache.courses.forEach(c=>{
    const p=courseProg(c.id),M=mastery(c.id),att=CR.cache.attempts.filter(a=>a.courseId===c.id&&a.status==='done').sort((a,b)=>b.finishedAt-a.finishedAt);
    const study=CR.cache.progress.filter(x=>x.courseId===c.id).reduce((s,x)=>s+(x.timeMs||0),0),quiz=att.reduce((s,a)=>s+Object.values(a.items||{}).reduce((t,i)=>t+(i.ms||0),0),0);
    const er=CR.cache.errors.filter(e=>e.courseId===c.id),cs={};er.forEach(e=>{const k=e.cause||'بدون علت';cs[k]=(cs[k]||0)+1});
    h+='<div class="c"><h3 dir="auto">'+E_(c.title)+'</h3>'+bar(p.p)+'<div class="m">'+faN(p.done)+' از '+faN(p.n)+' درس · زمان مطالعه '+faN(Math.round(study/60000))+' دقیقه · زمان پاسخ‌دهی '+faN(Math.round(quiz/60000))+' دقیقه</div>'+
    '<h4>تسلط به تفکیک مبحث</h4>'+(M.length?'<div class="crs-tw"><table><tr><th>مبحث</th><th>دقت</th><th>پاسخ</th><th>سطح</th></tr>'+M.map(m=>'<tr><td dir="auto">'+E_(m.t==='_none'?'بدون مبحث':topicName(c.id,m.t))+'</td><td style="min-width:90px">'+bar(m.p)+faN(m.p)+'٪</td><td>'+faN(m.ok)+'/'+faN(m.n)+'</td><td>'+badge(m.lv,lvColor[m.lv])+'</td></tr>').join('')+'</table></div><p class="m">سطح تسلط از آخرین نتیجه‌ی هر سؤال محاسبه می‌شود و با کمتر از ۳ سؤال «نامشخص» است. سؤال‌های تشریحی فقط با خودارزیابی شما شمرده می‌شوند.</p>':'<p class="m">هنوز آزمونی تصحیح نشده است.</p>')+
    (Object.keys(cs).length?'<h4>علت‌های خطا</h4><div class="m">'+Object.entries(cs).map(([k,v])=>E_(k)+' ×'+faN(v)).join(' · ')+'</div>':'')+
    (att.length?'<h4>تاریخچه‌ی آزمون‌ها</h4><div class="crs-tw"><table><tr><th>تاریخ</th><th>نوع</th><th>نمره‌ی خودکار</th><th></th></tr>'+att.slice(0,15).map(a=>'<tr><td>'+new Date(a.finishedAt).toLocaleString('fa-IR')+'</td><td>'+(a.mode==='exam'?'آزمون'+(a.timed?' زمان‌دار':''):'تمرین')+'</td><td>'+(a.score&&a.score.total?faN(a.score.ok)+'/'+faN(a.score.total):'—')+'</td><td><button data-a="crs_key" data-id="'+E_(a.id)+'">پاسخ‌نامه</button></td></tr>').join('')+'</table></div>':'')+'</div>'});
  return h;
}
/* ---------- ذخیره‌ی داده‌ی کاربر ---------- */
function putUser(s,o){const arr=CR.cache[s],i=arr.findIndex(x=>x.id===o.id);if(i<0)arr.push(o);else arr[i]=o;CR.ix[s].set(o.id,o);return IDB.put(s,o)}
function delUser(s,id){CR.cache[s]=CR.cache[s].filter(x=>x.id!==id);CR.ix[s].delete(id);return IDB.del(s,id)}
/* ---------- آزمون / تمرین ---------- */
/* v147: دامنه می‌تواند رشته (مثل قبل) یا فهرستی از نشانه‌ها باشد؛ اجتماعشان گرفته می‌شود: all | chapter:ID | lesson:ID | topic:ID | exam:نام | studied | weak | wrong | flagged */
/* v174: فیلتر منبع/جلسه — flt={src:[jozve|konkur|…],ses:Set(lessonId)} */
const fltOk=(q,f)=>!f||((!f.src||!f.src.length||f.src.includes(q.src||''))&&(!f.ses||!f.ses.size||(q.lessonIds||[]).some(i=>f.ses.has(i))));
function pool(cid,scope,diffs,flt){
  if(Array.isArray(scope)){const seen=new Set(),out=[];(scope.length?scope:['all']).forEach(t=>pool1(cid,t,diffs).forEach(q=>{if(!seen.has(q.id)&&fltOk(q,flt)){seen.add(q.id);out.push(q)}}));return out}
  return pool1(cid,scope,diffs).filter(q=>fltOk(q,flt))}
function sesLessons(cid,sid){const c=CR.ix.courses.get(cid),s=c&&(c.sessions||[]).find(x=>x.id===sid);return new Set(s?s.parts.flatMap(p=>p.lessonIds||[]):[])}
function fltFor(cid,o){const f={src:o.src||[]};if(o.ses){const i=o.ses.indexOf('/');if(o.ses.slice(0,i)!==cid)return null;f.ses=sesLessons(cid,o.ses.slice(i+1));if(!f.ses.size)return null}return f}
/* v175: مرور فاصله‌دار سؤال + اطمینان + بخش‌های شبیه‌ساز */
const addIso=n=>iso(new Date(Date.now()+n*864e5)),qDue=e=>!e.due||e.due<=todayISO();
function qSched(e,k){const iv=e.ivl||1;let n;if(k==='again')n=1;else if(k==='hard')n=Math.max(2,Math.round(iv*1.3));else if(k==='good')n=iv<3?3:Math.round(iv*2.2);else n=iv<4?7:Math.round(iv*3.5);return Math.min(180,n)}
const qDueCount=()=>CR.cache.errors.filter(e=>!e.resolved&&CR.ix.questions.get(e.qid)&&qDue(e)).length;
const CONF=()=>!!(db.set&&db.set.acdConf);
const secOfQ=i=>{const a=CR.quiz;return a&&a.secs?Math.max(0,a.secs.findIndex(s=>i>=s.from&&i<s.to)):0};
function secState(){const a=CR.quiz,clock=usedMs()+(a.skip||0);let acc=0;for(let i=0;i<a.secs.length;i++){acc+=a.secs[i].sec*1000;if(clock<acc)return{idx:i,left:acc-clock,over:false,end:acc}}return{idx:a.secs.length-1,left:0,over:true,end:acc}}
function pool1(cid,scope,diffs){
  let Q=questionsOf(cid);scope=scope||'all';
  if(scope==='studied'){const ids=new Set(lessonsOf(cid).filter(l=>{const p=CR.ix.progress.get(l.id);return p&&p.done}).map(l=>l.id));Q=Q.filter(q=>q.lessonIds.some(i=>ids.has(i)))}
  else if(scope==='weak'){const w=new Set(mastery(cid).filter(m=>m.p<60&&m.t!=='_none').map(m=>m.t));Q=Q.filter(q=>q.topicIds.some(t=>w.has(t)))}
  else if(scope.startsWith('exam:'))Q=Q.filter(q=>normExam(q.exam)===normExam(scope.slice(5)));
  else if(scope.startsWith('chapter:')){const ids=new Set(lessonsOf(cid).filter(l=>l.chapterId===scope.slice(8)).map(l=>l.id));Q=Q.filter(q=>q.lessonIds.some(i=>ids.has(i)))}
  else if(scope.startsWith('lesson:'))Q=Q.filter(q=>q.lessonIds.includes(scope.slice(7)));
  else if(scope.startsWith('topic:'))Q=Q.filter(q=>q.topicIds.includes(scope.slice(6)));
  else if(scope==='wrong'){const w=new Set(CR.cache.errors.filter(e=>!e.resolved&&e.courseId===cid).map(e=>e.qid));Q=Q.filter(q=>w.has(q.id))}
  else if(scope==='flagged'){const f=new Set();CR.cache.attempts.forEach(a=>Object.entries(a.items||{}).forEach(([q,i])=>{if(i.flag)f.add(q)}));Q=Q.filter(q=>f.has(q.id))}
  if(diffs&&diffs.length)Q=Q.filter(q=>diffs.includes(q.difficulty));
  return Q;
}
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
/* سؤال‌های هم‌متن کنار هم می‌آیند (جای نخستین سؤالِ آن متن) */
function groupPass(ids){const first=new Map(),out=[];ids.forEach(id=>{const q=CR.ix.questions.get(id),p=q&&q.passageId;if(!p){out.push([id]);return}if(first.has(p))first.get(p).push(id);else{const g=[id];first.set(p,g);out.push(g)}});return out.flat()}
const examMeta=(cid,name)=>{const c=CR.ix.courses.get(cid);return c&&(c.exams||[]).find(x=>normExam(x.name)===normExam(name))||null};
async function startQuiz(o){
  const Q=pool(o.courseId,o.scope,o.diffs);
  if(!Q.length){msg('err','سؤالی با این شرایط پیدا نشد. دامنه یا سطح دشواری را عوض کنید.');CR.tab='quiz';rerender();return}
  let ids=(o.shuffle===false?Q:shuffle(Q)).map(q=>q.id);if(o.count>0)ids=ids.slice(0,o.count);
  ids=groupPass(ids);
  const a={id:uid('a_'),courseId:o.courseId,pen:o.pen!=null?o.pen:null,mode:o.mode||'exam',timed:!!o.timed,limitSec:o.timed?Math.max(1,o.minutes||30)*60:0,startedAt:Date.now(),finishedAt:0,status:'active',qids:ids,items:{},used:0,scope:Array.isArray(o.scope)?o.scope.join(','):(o.scope||'all'),neg:!!o.neg,konkur:!!o.konkur};
  await crAssets(o.courseId);
  CR.quiz=a;CR.qi=0;CR.qStart=Date.now();CR.resumedAt=Date.now();CR.tab='quiz';CR.keyId='';CR.msg=null;
  await putUser('attempts',a);armTimer();rerender();
}
/* v154: آزمون‌ساز چنددرسی — items=[{cid,scope}] به ترتیب انتخاب؛ order: pick (به ترتیب انتخاب) | shuffle */
async function startMulti(o){
  const items=o.items||[],seen=new Set();let groups=items.map(it=>{const f=fltFor(it.cid,o);return f===null?[]:pool(it.cid,[it.scope],o.diffs,f)}).map(g=>g.filter(q=>{if(seen.has(q.id))return false;seen.add(q.id);return true}));
  groups=groups.filter(g=>g.length);
  if(!groups.length){msg('err','سؤالی با این انتخاب پیدا نشد.');CR.tab='quiz';rerender();return}
  let ids;
  if(o.order==='shuffle'){ids=shuffle(groups.flat()).map(q=>q.id);if(o.count>0)ids=ids.slice(0,o.count)}
  else{const per=o.count>0?Math.ceil(o.count/groups.length):1e9;ids=groups.flatMap(g=>g.slice(0,per)).map(q=>q.id);if(o.count>0)ids=ids.slice(0,o.count)}
  ids=groupPass(ids);
  const cids=[...new Set(ids.map(i=>CR.ix.questions.get(i).courseId))];
  const a={id:uid('a_'),courseId:cids[0],courses:cids,mixed:true,mode:o.mode||'exam',timed:!!o.timed,limitSec:o.timed?Math.max(1,o.minutes||30)*60:0,startedAt:Date.now(),finishedAt:0,status:'active',qids:ids,items:{},used:0,scope:'multi:'+items.map(i=>i.cid+'/'+i.scope).join(',').slice(0,300),neg:!!o.neg,konkur:!!o.konkur};
  if(o.secs&&o.secs.length&&ids.length){const k=Math.min(o.secs.length,ids.length),per=Math.ceil(ids.length/k),secs=[];for(let i=0;i<k;i++){const from=i*per,to=Math.min(ids.length,from+per);if(from<to)secs.push({from,to,sec:Math.max(30,Math.round(o.secs[i]*60))})}if(secs.length){a.secs=secs;a.timed=true;a.limitSec=secs.reduce((s,x)=>s+x.sec,0);a.skip=0}}
  await crAssets(cids.join('|'));
  CR.quiz=a;CR.qi=0;CR.qStart=Date.now();CR.resumedAt=Date.now();CR.tab='quiz';CR.keyId='';CR.msg=null;
  await putUser('attempts',a);armTimer();rerender();
}
const curItem=()=>{const q=CR.quiz;const id=q.qids[CR.qi];return q.items[id]||(q.items[id]={answer:null,ms:0,flag:false,checked:false,ok:null})};
function touchQ(){if(!CR.quiz||!CR.qStart)return;const it=curItem(),ms=Date.now()-CR.qStart;if(ms<3600e3)it.ms=(it.ms||0)+ms;CR.qStart=Date.now()}
let persistT=0;function persistSoon(){clearTimeout(persistT);persistT=setTimeout(()=>{if(CR.quiz){CR.quiz.used=usedMs();CR.resumedAt=Date.now()}if(CR.quiz)putUser('attempts',CR.quiz).catch(e=>toast(storeErr(e),1))},400)}
const usedMs=()=>CR.quiz?(CR.quiz.used||0)+(Date.now()-(CR.resumedAt||Date.now())):0;
function armTimer(){clearInterval(CR.tmr);CR.tmr=null;if(CR.quiz&&CR.quiz.timed){CR.tmr=setInterval(()=>{if(!CR.quiz){clearInterval(CR.tmr);return}if(Date.now()-(CR.lastSave||0)>10000){CR.lastSave=Date.now();persistSoon()}const a0=CR.quiz;let left=Math.max(0,a0.limitSec*1000-usedMs()),over=left<=0;if(a0.secs){const st=secState();over=st.over;left=st.left;if(!over&&st.idx>secOfQ(CR.qi)){touchQ();CR.qi=a0.secs[st.idx].from;persistSoon();toast(TT('بخش ','Section ')+faN(st.idx+1)+TT(' شروع شد',' started'));rerender()}}const e=document.getElementById('crs-timer');if(e){const s=Math.ceil(left/1000);e.textContent=faN(String(Math.floor(s/60)).padStart(2,'0'))+':'+faN(String(s%60).padStart(2,'0'));e.classList.toggle('crs-low',s<60)}if(over){clearInterval(CR.tmr);toast('زمان آزمون تمام شد؛ پاسخ‌ها تصحیح شد');submitQuiz(true)}},500)}}
async function resumeQuiz(id){const a=CR.ix.attempts.get(id);if(!a||a.status!=='active')return;await crAssets(a.courseId);CR.quiz=a;CR.qi=Math.min(a.qi||0,a.qids.length-1);CR.qStart=Date.now();CR.resumedAt=Date.now();CR.tab='quiz';CR.keyId='';armTimer();rerender()}
function leaveQuiz(){if(!CR.quiz)return;touchQ();CR.quiz.used=usedMs();CR.quiz.qi=CR.qi;CR.resumedAt=Date.now();clearTimeout(persistT);putUser('attempts',CR.quiz).catch(()=>{})}
async function recordErrors(a){
  const now=Date.now();
  for(const qid of a.qids){const it=a.items[qid]||{},q=CR.ix.questions.get(qid);if(!q)continue;
    const ok=effOk(it);const old=CR.ix.errors.get('e_'+qid);
    if(ok===false){await putUser('errors',{...(old||{}),id:'e_'+qid,qid,courseId:q.courseId||a.courseId,attemptId:a.id,at:(old&&old.at)||now,lastAt:now,count:((old&&old.count)||0)+1,cause:(old&&old.cause)||'',note:(old&&old.note)||'',resolved:false,due:addIso(1),ivl:1,conf:it.conf||'',sugg:(old&&old.cause)?'':(it.conf==='sure'?'ندانستن مفهوم':it.conf==='guess'?'حدس زدن':''),yourAnswer:it.answer,correctStreak:0,traps:(()=>{const t={...((old&&old.traps)||{})};trapsOf(QR(q,it),it.answer).forEach(k=>{t[k]=(t[k]||0)+1});return Object.keys(t).length?t:undefined})()})}
    else if(ok===true&&old){await putUser('errors',{...old,correctStreak:(old.correctStreak||0)+1})}}
}
async function submitQuiz(auto){
  const a=CR.quiz;if(!a)return;touchQ();a.used=usedMs();clearInterval(CR.tmr);
  let ok=0,tot=0,pend=0,wrong=0,blank=0;
  a.qids.forEach(id=>{const q=CR.ix.questions.get(id),it=a.items[id]||(a.items[id]={answer:null,ms:0,flag:false});if(!q)return;const g=grade(QR(q,it),it.answer);it.ok=g.ok;it.skipped=!!g.skipped;if(g.auto){tot++;if(g.ok||it.ov==='know')ok++;else if(g.skipped)blank++;else wrong++}else pend++});
  a.status='done';a.finishedAt=Date.now();a.score={ok,total:tot,pending:pend,wrong,blank,neg:!!a.neg,pen:a.pen!=null?a.pen:null};
  CR.quiz=null;CR.keyId=a.id;
  await putUser('attempts',a);await recordErrors(a);
  rerender();
}
function selfGrade(qid,v){const a=CR.ix.attempts.get(CR.keyId);if(!a)return;const it=a.items[qid]||(a.items[qid]={});it.self=v;putUser('attempts',a).then(()=>recordErrors(a)).then(rerender).catch(e=>toast(storeErr(e),1))}
function qInput(q,it,locked){
  q=QR(q,it);const dis=locked?' disabled':'',a=it.answer;
  if(q.type==='cloze'){const js=JSON.stringify(q.stem||'');return(q.blanks||[]).map((b,i)=>js.includes('{{'+(i+1)+'}}')?'':'<div class="row"><b>('+faN(i+1)+')</b><input data-crq="cloze" data-i="'+(i+1)+'" dir="auto" value="'+E_((a&&a[i+1])||'')+'"'+dis+'></div>').join('')}
  if(q.type==='single'||q.type==='multi'||q.type==='ds'||q.type==='place'){const T1=isSC(q)?'single':'multi';
    return'<div class="crs-chs'+(q.type==='place'?' crs-plc':'')+'">'+cho(q).map(c=>{const on=T1==='single'?String(a)===String(c.id):(a||[]).map(String).includes(String(c.id));
      return'<label class="crs-ch '+(on?'on':'')+'"><input type="'+(T1==='single'?'radio':'checkbox')+'" name="crq" data-crq="'+T1+'" value="'+E_(c.id)+'" '+(on?'checked':'')+dis+'>'+chHTML(c)+'</label>'}).join('')+'</div>'}
  if(q.type==='numeric')return'<input data-crq="text" inputmode="decimal" dir="ltr" value="'+E_(a||'')+'" placeholder="پاسخ عددی" style="max-width:240px"'+dis+'>';
  if(q.type==='short')return'<input data-crq="text" dir="auto" value="'+E_(a||'')+'" placeholder="پاسخ کوتاه" style="width:100%;max-width:420px"'+dis+'>';
  if(q.type==='essay')return'<textarea data-crq="text" rows="6" dir="auto" placeholder="پاسخ تشریحی خود را بنویس…"'+dis+'>'+E_(a||'')+'</textarea>';
  if(q.type==='match'){if(!it.order)it.order=shuffle(q.pairs.map((p,i)=>i));const ans=a||{};
    return'<div class="crs-match">'+q.pairs.map((p,i)=>'<div class="row"><span class="crs-ml" dir="auto">'+inl(p.l)+'</span><select data-crq="match" data-i="'+i+'"'+dis+'><option value="">— انتخاب —</option>'+it.order.map(k=>'<option value="'+E_(q.pairs[k].r)+'" '+(String(ans[i])===String(q.pairs[k].r)?'selected':'')+'>'+E_(String(q.pairs[k].r).replace(/\$/g,''))+'</option>').join('')+'</select></div>').join('')+'</div>'}
  return'';
}
const VID_OK=/^https:\/\/[^\s"'<>]{4,500}$/i;
function vidUrl(v){let u=v.url;const t=Math.floor(+v.t||0);if(t>0){if(/^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(u))u+=(u.includes('?')?'&':'?')+'t='+t+'s';else if(!u.includes('#'))u+='#t='+t}return u}
const vidBtn=v=>{if(!v||typeof v!=='object'||typeof v.url!=='string'||!VID_OK.test(v.url))return'';const t=Math.floor(+v.t||0),tm=t>0?' ('+TT('از ','from ')+faN(Math.floor(t/60))+':'+faN(String(t%60).padStart(2,'0'))+')':'';return'<div class="row" style="margin:8px 0"><a class="chip sm" href="'+E_(vidUrl(v))+'" target="_blank" rel="noopener noreferrer">▶ '+TT('ویدیوی این بخش','Video for this part')+tm+'</a></div>'};
function trapsOf(q,a){const o=[];if(typeof q.trap==='string'&&q.trap.trim())o.push(q.trap.trim());const ids=Array.isArray(a)?a.map(String):(a!=null&&typeof a!=='object'?[String(a)]:[]),an=q.answer||{},right=an.choice!==undefined?[String(an.choice)]:(an.choices||[]).map(String);
  (q.choices||[]).forEach(c=>{if(c&&typeof c.trap==='string'&&c.trap.trim()&&ids.includes(String(c.id))&&!right.includes(String(c.id)))o.push(c.trap.trim())});return[...new Set(o)].slice(0,3)}
const trapLine=e=>{const t=e&&e.traps?Object.entries(e.traps).sort((x,y)=>y[1]-x[1]).slice(0,4):[];return t.length?'<div class="m">🪤 '+TT('تله‌ها: ','Traps: ')+t.map(x=>E_(x[0])+(x[1]>1?' ×'+faN(x[1]):'')).join('، ')+'</div>':''};
function feedback(q,it){
  q=QR(q,it);const g=grade(q,it.answer);let h='<div class="crs-fb '+(g.auto?(g.ok?'crs-o':'crs-e'):'')+'">';
  h+=g.auto?(g.ok?'✅ درست':(it.ov==='know'?'✅ '+TT('بلد بودی (جواب را اشتباه وارد کردی)','You knew it (typed answer was off)'):'❌ نادرست'+(g.skipped?' (بدون پاسخ)':''))):'📝 سؤال تشریحی؛ تصحیح قطعی ندارد — خودت پاسخ را با پاسخ نمونه مقایسه کن';
  h+='<div><b>پاسخ صحیح:</b> '+correctText(q)+'</div>'+knowHTML(q,it);
  if(g.auto&&!g.ok){const tp=trapsOf(q,it.answer);if(tp.length)h+='<div class="crs-trap">🪤 <b>'+TT('تله:','Trap:')+'</b> '+tp.map(E_).join('، ')+'</div>'}
  if(q.type==='single'||q.type==='multi'){const why=(q.choices||[]).filter(c=>c.why);if(why.length)h+='<div class="crs-why"><b>تحلیل گزینه‌ها:</b>'+why.map(c=>'<div><b>'+E_(chLabel(c))+':</b> '+inl(c.why)+'</div>').join('')+'</div>'}
  if(q.solution)h+='<div class="crs-sol"><b>پاسخ تشریحی:</b>'+blocks(q.solution)+'</div>';
  h+=vidBtn(q.video)+srcLine(q.sourceRef)+'</div>';return h;
}
function hintsHTML(q,it,prac,locked){
  const hs=Array.isArray(q.hints)?q.hints:[];if(!hs.length||!prac||locked)return'';const n=Math.min(it.hints||0,hs.length);
  return'<div class="crs-hints">'+hs.slice(0,n).map((x,i)=>'<div class="crs-hint" dir="auto">💡 '+faN(i+1)+'/'+faN(hs.length)+' — '+inl(x)+'</div>').join('')+(n<hs.length?'<button class="chip sm" data-a="crs_hint">💡 '+TT('راهنمایی','Hint')+' '+faN(n+1)+'/'+faN(hs.length)+'</button>':'')+'</div>'}
function vQuizRun(){
  const a=CR.quiz,id=a.qids[CR.qi],q=CR.ix.questions.get(id),it=curItem(),n=a.qids.length,prac=a.mode==='practice',locked=prac&&it.checked;
  if(!q)return'<div class="c">سؤال پیدا نشد ('+E_(id)+')<button data-a="crs_qnext" data-n="1">بعدی</button></div>';
  const sst=a.secs?secState():null,sci=a.secs?secOfQ(CR.qi):0,sc=a.secs?a.secs[sci]:null,left=a.timed?(sst?sst.left:Math.max(0,a.limitSec*1000-usedMs())):0,s=Math.ceil(left/1000);
  let h='<div class="c crs-lesson" data-nobi style="--crs-mz:'+CR.mz+'"><div class="row np"><b>'+(prac?'تمرین':'آزمون')+' · سؤال '+faN(CR.qi+1)+' از '+faN(n)+'</b>'+(sc?badge(TT('بخش ','Section ')+faN(sci+1)+'/'+faN(a.secs.length),'#7c3aed'):'')+badge('دشواری '+['آسان','متوسط','دشوار'][q.difficulty-1],'#64748b')+(q.timeSec?badge('⏱ '+faN(q.timeSec)+TT(' ثانیه',' s'),'#0ea5e9'):'')+'<span class="sp"></span>'+(a.timed?'<span class="crs-timer" id="crs-timer">'+faN(String(Math.floor(s/60)).padStart(2,'0'))+':'+faN(String(s%60).padStart(2,'0'))+'</span>':'')+'<button class="chip sm '+(CONF()?'on':'')+'" data-a="crs_conftog" title="'+TT('پرسیدن میزان اطمینان','Ask confidence')+'">🎚</button><button data-a="crs_mz" data-d="-1">A−</button><button data-a="crs_mz" data-d="1">A+</button></div>'+
   '<div class="crs-nav">'+a.qids.map((x,i)=>{if(sc&&(i<sc.from||i>=sc.to))return'';const t=a.items[x]||{},ans=t.answer!=null&&t.answer!==''&&!(Array.isArray(t.answer)&&!t.answer.length);return'<button class="'+(i===CR.qi?'p':'')+(ans?' crs-an':'')+(t.flag?' crs-fl':'')+'" data-a="crs_qgo" data-n="'+i+'">'+faN(i+1)+'</button>'}).join('')+'</div>'+
   passHTML(q)+'<div class="crs-stem">'+stemHTML(q,it,locked)+'</div>'+qInput(q,it,locked)+hintsHTML(q,it,prac,locked)+(CONF()?'<div class="row"><span class="m">'+TT('چقدر مطمئنی؟','How sure?')+'</span>'+[['sure','مطمئنم','Sure'],['mid','نیمه','Half'],['guess','حدس','Guess']].map(c=>'<button class="chip sm '+(it.conf===c[0]?'on':'')+'" data-a="crs_conf" data-v="'+c[0]+'">'+TT(c[1],c[2])+'</button>').join('')+'</div>':'')+(locked?feedback(q,it):'')+
   '<div class="row" style="margin-top:12px"><button data-a="crs_qnext" data-n="-1" '+(CR.qi>(sc?sc.from:0)?'':'disabled')+'>‹ قبلی</button><button data-a="crs_qflag">'+(it.flag?'🚩 علامت برداشته شود':'⚑ علامت‌گذاری')+'</button><button data-a="crs_bm" data-k="question" data-r="'+E_(q.id)+'">'+(CR.ix.bookmarks.has('b_question_'+q.id)?'★':'☆')+' نشانک</button>'+(prac&&!it.checked?'<button class="p" data-a="crs_qcheck">بررسی پاسخ</button>':'')+'<span class="sp"></span><button data-a="crs_qnext" data-n="1" '+(CR.qi<(sc?sc.to:n)-1?'':'disabled')+'>بعدی ›</button></div>'+(sc&&sci<a.secs.length-1?'<div class="row" style="margin-top:8px"><button class="p" data-a="crs_secend">'+TT('پایان بخش و رفتن به بخش بعد (برگشت قفل می‌شود)','End section & go to next (no going back)')+'</button></div>':'')+
   '<div class="row" style="margin-top:8px"><button class="p" data-a="crs_qsubmit">پایان و تصحیح</button><button class="d" data-a="crs_qquit">رها کردن</button><button data-a="crs_qpause">ذخیره و خروج موقت</button></div></div>';
  return h;
}
function vKey(){
  const a=CR.ix.attempts.get(CR.keyId);if(!a){CR.keyId='';return vQuizSetup()}
  const c=CR.ix.courses.get(a.courseId),sc=a.score||{ok:0,total:0,pending:0},ms=a.qids.reduce((s,id)=>s+((a.items[id]||{}).ms||0),0);
  let h='<div class="c"><div class="row"><h3 class="sp">پاسخ‌نامه‌ی تشریحی — '+E_(c?c.title:'')+'</h3><button data-a="crs_qnew">آزمون تازه</button></div><div class="big">'+(sc.total?faN(sc.ok)+' / '+faN(sc.total):'—')+'</div><div class="m" style="text-align:center">'+(sc.total?'درصد پاسخ‌های قابل تصحیح خودکار: '+faN(Math.round(sc.ok/sc.total*100))+'٪':'')+(sc.neg&&sc.total?' · درصد با نمره‌ی منفی (هر غلط '+(sc.pen!=null?faN(+(sc.pen).toFixed(2)):'⅓')+' نمره): '+faN(Math.round((sc.ok-(sc.wrong||0)*(sc.pen!=null?sc.pen:1/3))/sc.total*100))+'٪ · درست '+faN(sc.ok)+' · غلط '+faN(sc.wrong||0)+' · نزده '+faN(sc.blank||0):'')+(sc.pending?' · '+faN(sc.pending)+' سؤال تشریحی نیازمند خودارزیابی':'')+' · مجموع زمان '+faN(Math.round(ms/1000))+' ثانیه</div><div class="row" style="margin-top:8px"><button data-a="crs_errprac">تمرین اشتباهات باز</button><button data-a="crs_tab" data-k="errors">دفترچه‌ی خطا</button></div></div>';
  h+='<div class="crs-lesson" data-nobi style="--crs-mz:'+CR.mz+'">';
  a.qids.forEach((id,i)=>{let q=CR.ix.questions.get(id);const it=a.items[id]||{};if(!q){h+='<div class="c">سؤال '+E_(id)+' دیگر نصب نیست.</div>';return}
    const ok=effOk(it),er=CR.ix.errors.get('e_'+id);
    const prevQ=i?CR.ix.questions.get(a.qids[i-1]):null,qq=q;q=QR(q,it);
    h+='<div class="c">'+(qq.passageId&&!(prevQ&&prevQ.passageId===qq.passageId)?'<details class="crs-lesson" data-nobi style="--crs-mz:'+CR.mz+'"><summary>📄 '+TT('متن مشترک','Shared passage')+'</summary>'+passHTML(qq)+'</details>':'')+'<div class="row"><b>سؤال '+faN(i+1)+'</b>'+(ok===true?badge(it.ov==='know'?TT('درست (بلد بودم)','Correct (I knew it)'):'درست','#16a34a'):ok===false?badge(it.skipped?'بدون پاسخ':'نادرست','#dc2626'):badge('نیازمند خودارزیابی','#ea580c'))+(it.flag?badge('🚩 علامت‌خورده','#64748b'):'')+'<span class="m">'+faN(Math.round((it.ms||0)/1000))+' ثانیه'+(qq.timeSec?' / '+faN(qq.timeSec):'')+'</span>'+(it.hints?badge('💡 '+faN(it.hints),'#0ea5e9'):'')+'</div>'+stemHTML(q)+'<div class="crs-yours"><b>پاسخ شما:</b> '+ansText(q,it.answer)+'</div><div class="crs-ans"><b>پاسخ صحیح:</b> '+correctText(q)+'</div>'+
     knowHTML(q,it)+(q.type==='essay'?'<div class="row"><span class="m">خودارزیابی (فقط برای آمار شخصی شما):</span>'+[['right','درست بود'],['wrong','نادرست بود']].map(x=>'<button class="'+(it.self===x[0]?'p':'')+'" data-a="crs_self" data-q="'+E_(id)+'" data-v="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>':'')+
     ((q.type==='single'||q.type==='multi')&&(q.choices||[]).some(c=>c.why)?'<div class="crs-why"><b>تحلیل گزینه‌ها:</b>'+q.choices.filter(c=>c.why).map(c=>'<div><b>'+E_(chLabel(c))+':</b> '+inl(c.why)+'</div>').join('')+'</div>':'')+
     (q.solution?'<div class="crs-sol"><b>پاسخ تشریحی:</b>'+blocks(q.solution)+'</div>':'')+srcLine(q.sourceRef)+
     (ok===false&&er?'<div class="row" style="margin-top:6px"><select data-crs-cause="'+E_(er.id)+'"><option value="">علت اشتباه…</option>'+['ندانستن مفهوم','اشتباه محاسباتی','بی‌دقتی در خواندن','کمبود زمان','حدس زدن','اشتباه در روش'].map(x=>'<option '+(er.cause===x?'selected':'')+'>'+x+'</option>').join('')+'</select></div>':'')+'</div>'});
  return h+'</div>';
}
function vQuizSetup(){
  const cs=CR.cache.courses;if(!cs.length)return empty();
  if(CR.keyId)return vKey();
  if(CR.quiz)return vQuizRun();
  if(CR.setup.multi&&window.daniAcd4&&window.daniAcd4.xbuilder)return window.daniAcd4.xbuilder();
  const S=CR.setup,cid=S.courseId&&CR.ix.courses.get(S.courseId)?S.courseId:cs[0].id,c=CR.ix.courses.get(cid),act=CR.cache.attempts.filter(a=>a.status==='active');
  let tk=Array.isArray(S.tokens)&&S.tokens.length?S.tokens:['all'];if(S.scope&&!Array.isArray(S.tokens)&&S.scope!=='all')tk=[S.scope];
  const on=t=>tk.includes(t),cnt=t=>pool(cid,[t],S.diffs||[1,2,3]).length;
  const n=pool(cid,tk,S.diffs||[1,2,3]).length;
  const exams=[...new Set(questionsOf(cid).map(q=>normExam(q.exam)).filter(Boolean))];
  const ck=(t,lbl)=>'<label class="crs-ck"><input type="checkbox" data-crs-tk="'+E_(t)+'" '+(on(t)?'checked':'')+'> '+lbl+' <span class="m">('+faN(cnt(t))+')</span></label>';
  const chip=(t,lbl)=>'<button class="chip '+(on(t)?'on':'')+'" data-a="crs_tk" data-t="'+E_(t)+'">'+lbl+' ('+faN(cnt(t))+')</button>';
  const chs=c.chapters||[],tps=c.topics||[],lss=lessonsOf(cid);
  const grp=(title,ks,body)=>'<details '+(tk.some(t=>ks.some(k=>t.startsWith(k)))?'open':'')+'><summary class="m" style="cursor:pointer">'+title+'</summary><div class="row" style="flex-wrap:wrap;margin-top:6px">'+body+'</div></details>';
  let h='';
  if(act.length)h+='<div class="c"><h3>نیمه‌تمام</h3>'+act.map(a=>'<div class="row"><span>'+E_((CR.ix.courses.get(a.courseId)||{}).title||'')+' · '+(a.mode==='exam'?'آزمون':'تمرین')+' · '+faN(Object.keys(a.items).length)+'/'+faN(a.qids.length)+' پاسخ‌داده</span><button class="p" data-a="crs_resume" data-id="'+E_(a.id)+'">ادامه</button><button class="d" data-a="crs_abandon" data-id="'+E_(a.id)+'">حذف</button></div>').join('')+'</div>';
  if(window.daniAcd4&&window.daniAcd4.xtoggle)h+=window.daniAcd4.xtoggle(false);
  h+='<div class="c"><h3>مرکز آزمون <span class="m">Exam Center</span></h3><p class="m">بدون هوش مصنوعی و بدون اینترنت؛ از بانک سؤال واردشده. هر چند مبحث/فصل/درس را با هم انتخاب کن.</p>'
   +(cs.length>1?'<label>دوره</label><select data-crs-set="courseId">'+cs.map(x=>'<option value="'+E_(x.id)+'" '+(x.id===cid?'selected':'')+'>'+E_(x.title)+'</option>').join('')+'</select>':'')
   +'<label>۱) چه چیزی را آزمون بدهم؟ (می‌شود چند مورد را با هم زد)</label><div class="row" style="flex-wrap:wrap">'+chip('all','کل دوره')+chip('studied','فقط درس‌های خوانده‌شده')+chip('weak','مبحث‌های ضعیف')+chip('wrong','اشتباهات باز')+chip('flagged','علامت‌خورده')+'</div>'
   +(chs.length?grp('فصل‌ها',['chapter:'],chs.map(x=>ck('chapter:'+x.id,E_(x.title))).join('')):'')
   +(tps.length?grp('مبحث‌ها',['topic:'],tps.map(x=>ck('topic:'+x.id,E_(x.title))).join('')):'')
   +(lss.length?grp('درس‌های مشخص',['lesson:'],lss.map(x=>ck('lesson:'+x.id,E_(x.title))).join('')):'')
   +(exams.length?'<label>آزمون‌های سال‌های گذشته / مجموعه‌ها (با ترتیب اصلی)</label><div class="row" style="flex-wrap:wrap">'+exams.map(x=>{const att=CR.cache.attempts.filter(a=>a.status==='done'&&a.scope==='exam:'+x&&a.score&&a.score.total),best=att.reduce((m,a)=>Math.max(m,Math.round(a.score.ok/a.score.total*100)),-1),nn=pool(cid,['exam:'+x],[1,2,3]).length;return'<button class="chip '+(on('exam:'+x)?'on':'')+'" data-a="crs_tk" data-t="'+E_('exam:'+x)+'">'+E_(x)+' ('+faN(nn)+' سؤال'+(examMeta(cid,x)&&examMeta(cid,x).minutes?' · '+faN(examMeta(cid,x).minutes)+' دقیقه':'')+(examMeta(cid,x)&&examMeta(cid,x).year?' · '+E_(examMeta(cid,x).year):'')+(att.length?' · '+faN(att.length)+' بار · بهترین '+faN(best)+'٪':'')+')</button>'}).join('')+'</div>':'')
   +'<div class="m" style="margin-top:6px"><b>'+faN(n)+'</b> سؤال با این انتخاب موجود است.</div>'
   +'<label>۲) سطح دشواری</label><div class="row">'+[1,2,3].map(d=>'<label class="crs-ck"><input type="checkbox" data-crs-diff="'+d+'" '+((S.diffs||[1,2,3]).includes(d)?'checked':'')+'> '+['آسان','متوسط','دشوار'][d-1]+'</label>').join('')+'</div>'
   +'<label>۳) شکل آزمون</label><div class="row"><div><label>تعداد سؤال</label><input type="number" min="1" id="crsq-count" value="'+(S.count||Math.min(10,Math.max(1,n)))+'" style="width:90px"></div><div><label>نوع</label><select data-crs-set="mode"><option value="exam" '+(S.mode!=='practice'?'selected':'')+'>آزمون (تصحیح در پایان)</option><option value="practice" '+(S.mode==='practice'?'selected':'')+'>تمرین (بررسی فوری)</option></select></div></div>'
   +'<div class="row" style="flex-wrap:wrap"><label class="crs-ck"><input type="checkbox" id="crsq-timed" '+(S.timed?'checked':'')+' data-crs-set="timed"> زمان‌دار</label><input type="number" min="1" id="crsq-min" value="'+(S.minutes||20)+'" style="width:80px"> دقیقه<label class="crs-ck"><input type="checkbox" data-crs-set="neg" '+(S.neg?'checked':'')+'> نمره‌ی منفی (هر غلط ⅓)</label>'+(tk.some(t=>t.startsWith('exam:'))?'<label class="crs-ck"><input type="checkbox" data-crs-set="orig" '+(S.orig===false?'':'checked')+'> ترتیب اصلی سؤال‌ها</label>':'')+'</div>'
   +'<div class="row" style="margin-top:10px"><button class="p" data-a="crs_qbegin" '+(n?'':'disabled')+'>شروع</button><button data-a="crs_konkur" '+(n?'':'disabled')+' title="زمان‌دار، نمره‌ی منفی، ترتیب تصادفی، تقریباً ۱ دقیقه برای هر سؤال">🎯 شبیه‌ساز کنکور</button>'+(n?'':'<span class="m">با این شرایط سؤالی نیست.</span>')+'</div></div>';
  return h;
}
/* ---------- ورود / خروج / انتقال ---------- */
async function importFile(file,opts){
  opts=opts||{};const buf=await readFileBuf(file),name=file.name;let z=null;
  try{z=await zipRead(buf)}catch(e){if(/\.json$/i.test(name))z=null;else throw e}
  if(!z){let j;try{j=JSON.parse(dec.decode(new Uint8Array(buf)).replace(/^\uFEFF/,''))}catch(e){throw new Error('JSON نامعتبر است: '+e.message)}
    return prepRestore(j,[],name)}
  if(z.ents.has('manifest.json')){
    const P=await loadPackZip(z),ex=P.course&&CR.ix.courses.get(P.course.id)||null,rep=validatePack(P,ex);let pl=null;
    const ad=opts.add||opts.rep&&opts.rep.split('|')[0];
    if(ad&&P.course&&P.course.id!==ad)throw new Error('این فایل برای دورهٔ «'+P.course.id+'» است، نه «'+ad+'»؛ فایل ادامهٔ همان دوره را انتخاب کن');
    let tg=ex?'auto':'new';if(opts.add)tg='new';if(opts.rep){const fid=opts.rep.split('|')[1];tg=fid||'auto'}
    if(!rep.errors.length){normalizePack(P);pl=planPack(P,{target:tg,name})}
    if(CR.pv)CR.pv.forEach(u=>URL.revokeObjectURL(u));CR.pv=new Map();P.assets.forEach((a,p)=>CR.pv.set(p,URL.createObjectURL(new Blob([a.data],{type:a.mime}))));
    CR.pending={name,P,rep,pl,down:false,over:false,rmo:false,fname:pl?pl.fname:''};CR.restore=null;CR.tab='manage';return}
  if(z.ents.has('user.json')){
    const j=JSON.parse(dec.decode(await z.read('user.json'))),packs=[];
    for(const n of [...z.ents.keys()].filter(n=>/^courses\/.+\.zip$/.test(n))){try{const zz=await zipRead((await z.read(n)).buffer),P=await loadPackZip(zz),ex=P.course&&CR.ix.courses.get(P.course.id)||null,rep=validatePack(P,ex);let pl=null;if(!rep.errors.length){normalizePack(P);pl=planPack(P)}packs.push({n,P,rep,pl})}catch(e){packs.push({n,err:e.message})}}
    return prepRestore(j,packs,name)}
  throw new Error('محتوای فایل شناخته نشد: نه بسته‌ی دوره (manifest.json) است و نه پشتیبان کاربر (user.json)');
}
function prepRestore(j,packs,name){
  if(!j||j.format!=='dani-academy-user')throw new Error('فایل پشتیبان آکادمی DANI نیست (format باید dani-academy-user باشد)');
  if(j.schemaVersion>CRV.schema)throw new Error('این پشتیبان با نسخه‌ی جدیدتری ساخته شده است');
  if(!j.data||typeof j.data!=='object')throw new Error('بخش data در پشتیبان نیست');
  CR.restore={name,j,packs,policy:'keep',mode:'merge',safety:true};CR.pending=null;CR.tab='manage';
}
const TS={progress:'lastAt',attempts:'startedAt',notes:'at',bookmarks:'at',errors:'lastAt'};
function planUser(data,policy){
  const rep={};
  USER_STORES.forEach(s=>{const inc=Array.isArray(data[s])?data[s]:[];let n=0,same=0,conf=0,bad=0,repl=0;const put=[];
    inc.forEach(o=>{if(!o||typeof o.id!=='string'||!o.id||o.id.startsWith('__')){bad++;return}const cur=CR.ix[s].get(o.id);
      if(!cur){n++;put.push(o)}else if(JSON.stringify(cur)===JSON.stringify(o))same++;else{conf++;if(policy==='newer'&&(+o[TS[s]]||0)>(+cur[TS[s]]||0)){repl++;put.push(o)}}});
    rep[s]={total:inc.length,n,same,conf,repl,bad,put}});
  return rep;
}
const SN={progress:'پیشرفت درس‌ها',attempts:'آزمون‌ها و پاسخ‌ها',bookmarks:'نشانک‌ها',notes:'یادداشت‌ها',errors:'دفترچه‌ی خطا'};
function userExport(){return{format:'dani-academy-user',schemaVersion:CRV.schema,appVersion:CRV.app,exportedAt:nowISO(),courses:CR.cache.courses.map(c=>({id:c.id,title:c.title,contentVersion:c.contentVersion})),data:{progress:CR.cache.progress,attempts:CR.cache.attempts,bookmarks:CR.cache.bookmarks,notes:CR.cache.notes,errors:CR.cache.errors}}}
async function buildCourseZip(id){
  const c=CR.ix.courses.get(id);if(!c)throw new Error('دوره پیدا نشد');
  const strip=o=>{const x={...o};delete x.courseId;delete x.hash;delete x.v;return x};
  const files=[],J=(n,o)=>files.push({name:n,z:1,data:enc.encode(JSON.stringify(o))});
  const L=lessonsOf(id),Q=questionsOf(id),S=CR.cache.sources.filter(s=>s.courseId===id);
  J('manifest.json',{format:'dani-course',templateVersion:CRV.template,id,title:c.title,contentVersion:c.contentVersion,exportedAt:nowISO(),generator:'DANI Planner '+CRV.app,files:{course:'course.json',lessons:L.map(l=>'lessons/'+l.id+'.json'),questions:['questions/bank.json'],sources:'sources.json'}});
  J('course.json',{id,title:c.title,description:c.description,language:c.language,kind:c.kind,unit:c.unit,layout:c.layout||undefined,paths:(c.paths||[]).filter(x=>!x.u),sessions:c.sessions||[],goals:c.goals,prerequisites:c.prerequisites,topics:c.topics||[],chapters:c.chapters,passages:c.passages||[],exams:c.exams||[],slots:c.slots||[]});
  L.forEach(l=>J('lessons/'+l.id+'.json',strip(l)));J('questions/bank.json',Q.map(strip));J('sources.json',S.map(strip));
  for(const a of await IDB.byCourse('assets',id))files.push({name:a.path,z:/\.svg$/i.test(a.path),data:new Uint8Array(await a.blob.arrayBuffer())});
  return zipWriteZ(files);
}
async function applyRestore(){
  const R=CR.restore;let log=[];
  if(R.safety||R.mode==='replace'){download('dani-academy-safety-'+new Date().toISOString().slice(0,10)+'.json',new Blob([JSON.stringify(userExport())],{type:'application/json'}))}
  for(const p of R.packs){if(p.err||!p.pl||p.rep.errors.length){log.push('بسته‌ی '+p.n+' نادیده گرفته شد');continue}
    if(p.pl.mode==='new'||p.pl.cmp>0){await commitPack(p.P,p.pl);log.push('دوره‌ی «'+p.P.course.title+'» نصب/به‌روز شد')}else log.push('دوره‌ی «'+p.P.course.title+'» از قبل نصب است؛ تغییری داده نشد')}
  if(R.mode==='replace'){for(const s of USER_STORES)await IDB.clear(s);USER_STORES.forEach(s=>{CR.cache[s]=[]});crIndex()}
  const rep=planUser(R.j.data,R.mode==='replace'?'keep':R.policy);
  for(const s of USER_STORES)if(rep[s].put.length)await IDB.putMany(s,rep[s].put);
  await crLoad();return log;
}
function vManage(){
  let h=everythingCard(); try{if(window.daniAcd4&&window.daniAcd4.mergeCard)h+=window.daniAcd4.mergeCard()}catch(e){} 
  const pd=CR.pending;
  if(pd){const r=pd.rep,pl=pd.pl,C=pd.P.course||{};
    h+='<div class="c crs-pv"><h3>پیش‌نمایش ورود: '+E_(C.title||pd.name)+'</h3><div class="m">فایل: <bdi dir="ltr">'+E_(pd.name)+'</bdi> · '+faN(pd.P.lessons.length)+' درس · '+faN(pd.P.questions.length)+' سؤال · '+faN(pd.P.assets.size)+' فایل تصویری ('+faN(pd.P.sizeKB)+' کیلوبایت)</div>';
    if(r.errors.length)h+='<div class="crs-call crs-warning"><div class="crs-ct">❌ '+faN(r.errors.length)+' خطا — ثبت نهایی ممکن نیست</div><ul>'+r.errors.slice(0,60).map(x=>'<li dir="auto">'+E_(x)+'</li>').join('')+(r.errors.length>60?'<li>… و '+faN(r.errors.length-60)+' مورد دیگر</li>':'')+'</ul></div>';
    if(r.warnings.length)h+='<details class="crs-call crs-note"><summary>⚠️ '+faN(r.warnings.length)+' هشدار (مانع ورود نیست)</summary><ul>'+r.warnings.slice(0,80).map(x=>'<li dir="auto">'+E_(x)+'</li>').join('')+'</ul></details>';
    if(pl&&pl.existing&&pl.target!=='course'){const ofs=filesOf(pl.existing);
      h+='<div class="crs-call crs-note"><div class="crs-ct">این فایل چه شود؟</div><select data-crs-tg><option value="new"'+(pl.target==='new'?' selected':'')+'>افزودن به عنوان فایل تازه</option>'+ofs.map(f=>'<option value="'+E_(f.id)+'"'+(pl.target===f.id?' selected':'')+'>جایگزین: '+E_(f.name)+'</option>').join('')+'</select>'+(pl.target==='new'?'<label style="display:block;margin-top:6px">نام فایل <input type="text" data-crs-fname value="'+E_(pd.fname||pl.fname)+'" maxlength="40" dir="auto"></label>':'')+'</div>'}
    if(pl&&pl.target!=='course'&&(pl.conflL.length||pl.conflQ.length))h+='<div class="crs-call crs-warning"><div class="crs-ct">⚠️ شناسه‌ی تکراری با فایل دیگر</div>'+faN(pl.conflL.length)+' درس و '+faN(pl.conflQ.length)+' سؤال این بسته هم‌شناسه با فایل دیگری از همین دوره است (مثلاً «'+E_((pl.conflL[0]||pl.conflQ[0]).file)+'»). پیش‌فرض: دست نمی‌خورند.<label class="crs-ck"><input type="checkbox" data-crs-over '+(pd.over?'checked':'')+'> روی آن‌ها هم بنویس و به این فایل منتقل شوند</label></div>';
    if(pl&&pl.file&&(pl.orphL.length||pl.orphQ.length))h+='<details class="crs-call crs-tip"><summary>'+faN(pl.orphL.length)+' درس و '+faN(pl.orphQ.length)+' سؤال در نسخه‌ی تازه‌ی این فایل نیست (پیش‌فرض: نگه داشته می‌شود)</summary><ul>'+pl.orphL.slice(0,30).map(x=>'<li dir="auto">'+E_(x.title)+'</li>').join('')+'</ul><label class="crs-ck"><input type="checkbox" data-crs-rmo '+(pd.rmo?'checked':'')+'> این‌ها حذف شوند (پیشرفت و پاسخ‌های من می‌ماند)</label></details>';
    if(pl){h+='<p>'+(pl.mode==='new'?'<b>دوره‌ی جدید</b> — نسخه‌ی '+E_(pl.newV):'<b>به‌روزرسانی</b> دوره‌ی نصب‌شده: نسخه‌ی '+E_(pl.oldV)+' ← '+E_(pl.newV))+'</p><div class="crs-tw"><table><tr><th></th><th>جدید</th><th>تغییرکرده</th><th>بدون تغییر</th><th>در بسته نیست (حفظ می‌شود)</th></tr><tr><td>درس</td><td>'+faN(pl.L.n)+'</td><td>'+faN(pl.L.u)+'</td><td>'+faN(pl.L.s)+'</td><td>'+faN(pl.keptL)+'</td></tr><tr><td>سؤال</td><td>'+faN(pl.Q.n)+'</td><td>'+faN(pl.Q.u)+'</td><td>'+faN(pl.Q.s)+'</td><td>'+faN(pl.keptQ)+'</td></tr></table></div>'+
      '<div class="m">فصل‌ها: '+pl.chapters.map(c=>E_(c.title)+' ('+({new:'جدید',updated:'به‌روز می‌شود',same:'بدون تغییر'})[c.state]+')').join(' · ')+'</div>'+
      '<div class="crs-call crs-tip"><div class="crs-ct">🛡 سیاست حفظ اطلاعات شما</div>پیشرفت، پاسخ‌ها، نشانک‌ها، یادداشت‌ها و دفترچه‌ی خطا جدا ذخیره می‌شوند و با ورود این بسته تغییر یا حذف نمی‌شوند. درس‌ها و سؤال‌هایی که قبلاً نصب بوده و در این بسته نیستند حذف نمی‌شوند. شناسه‌های هم‌نام فقط محتوای همان درس/سؤال را به‌روز می‌کنند'+(pl.progressTouched.length?'؛ '+faN(pl.progressTouched.length)+' درسِ تکمیل‌شده به‌روز می‌شود و با برچسب «به‌روزشده پس از تکمیل» به شما اطلاع داده می‌شود: '+pl.progressTouched.slice(0,5).map(E_).join('، '):'')+'.</div>';
      if(pl.cmp<0)h+='<label class="crs-ck"><input type="checkbox" data-crs-down '+(pd.down?'checked':'')+'> نسخه‌ی این بسته از نسخه‌ی نصب‌شده قدیمی‌تر است؛ با این حال جایگزین شود</label>';
      if(pl.nothing)h+='<p class="m">این نسخه عیناً نصب است؛ تغییری برای ثبت وجود ندارد.</p>';
      h+='<details><summary>پیش‌نمایش محتوا</summary><div class="crs-lesson" data-nobi style="--crs-mz:'+CR.mz+'">'+pd.P.lessons.slice(0,6).map(l=>'<div class="c"><h4 dir="auto">'+E_(l.title)+'</h4>'+blocks(l.blocks)+'</div>').join('')+pd.P.questions.slice(0,4).map(q=>'<div class="c"><div class="m">سؤال '+E_(q.id)+'</div>'+stemHTML(q)+'</div>').join('')+'</div></details>'}
    h+='<div class="row" style="margin-top:10px"><button class="p" data-a="crs_commit" '+((r.errors.length||!pl||pl.nothing||(pl.cmp<0&&!pd.down))?'disabled':'')+'>ثبت نهایی</button><button data-a="crs_cancel">لغو (چیزی ذخیره نمی‌شود)</button></div></div>'}
  const R=CR.restore;
  if(R){const rep=planUser(R.j.data,R.mode==='replace'?'keep':R.policy);
    h+='<div class="c crs-pv"><h3>پیش‌نمایش بازیابی اطلاعات کاربر</h3><div class="m">فایل: <bdi dir="ltr">'+E_(R.name)+'</bdi> · ساخته‌شده در '+E_(R.j.exportedAt||'؟')+'</div>'+
     (R.packs.length?'<p><b>دوره‌های داخل پشتیبان:</b></p>'+R.packs.map(p=>'<div class="cwr"><span>'+(p.err?'❌ '+E_(p.n)+': '+E_(p.err):p.rep.errors.length?'❌ '+E_(p.P.course&&p.P.course.title||p.n)+': '+faN(p.rep.errors.length)+' خطا':'📦 '+E_(p.P.course.title)+' — '+(p.pl.mode==='new'?'نصب می‌شود':p.pl.cmp>0?'به‌روز می‌شود':'از قبل نصب است'))+'</span></div>').join(''):'')+
     '<div class="crs-tw"><table><tr><th></th><th>در فایل</th><th>جدید</th><th>یکسان</th><th>تعارض</th><th>نامعتبر</th></tr>'+USER_STORES.map(s=>'<tr><td>'+SN[s]+'</td><td>'+faN(rep[s].total)+'</td><td>'+faN(rep[s].n)+'</td><td>'+faN(rep[s].same)+'</td><td>'+faN(rep[s].conf)+(rep[s].repl?' ('+faN(rep[s].repl)+' جایگزین)':'')+'</td><td>'+faN(rep[s].bad)+'</td></tr>').join('')+'</table></div>'+
     '<label>روش</label><div class="row"><label class="crs-ck"><input type="radio" name="crs-rm" data-crs-rm="merge" '+(R.mode==='merge'?'checked':'')+'> ادغام (داده‌ی موجود حذف نمی‌شود)</label><label class="crs-ck"><input type="radio" name="crs-rm" data-crs-rm="replace" '+(R.mode==='replace'?'checked':'')+'> جایگزینی کامل اطلاعات کاربر</label></div>'+
     (R.mode==='merge'?'<label>در تعارض (رکورد هم‌شناسه ولی متفاوت)</label><div class="row"><label class="crs-ck"><input type="radio" name="crs-rp" data-crs-rp="keep" '+(R.policy==='keep'?'checked':'')+'> نسخه‌ی موجود بماند (پیش‌فرض)</label><label class="crs-ck"><input type="radio" name="crs-rp" data-crs-rp="newer" '+(R.policy==='newer'?'checked':'')+'> رکورد جدیدتر برنده شود</label></div>':'<div class="crs-call crs-warning"><div class="crs-ct">⚠️ جایگزینی کامل</div>تمام پیشرفت و پاسخ‌های فعلی این مرورگر پاک و با محتوای فایل عوض می‌شود. پیش از آن به‌طور خودکار یک نسخه‌ی ایمنی از داده‌ی فعلی دانلود می‌شود.</div>')+
     '<label class="crs-ck"><input type="checkbox" data-crs-safety '+((R.safety||R.mode==='replace')?'checked':'')+(R.mode==='replace'?' disabled':'')+'> پیش از اعمال، نسخه‌ی ایمنی از اطلاعات فعلی دانلود شود</label>'+
     '<div class="row" style="margin-top:10px"><button class="p" data-a="crs_rapply">اعمال بازیابی</button><button data-a="crs_rcancel">لغو</button></div></div>'}
  h+='<div class="c"><h3>ورود یا به‌روزرسانی دوره</h3><p class="m">فایل <bdi dir="ltr">.dani-course.zip</bdi> را انتخاب کن. برای افزودن فصل جدید یا به‌روزرسانی یک فصل، بسته‌ای با همان شناسه‌ی دوره و نسخه‌ی بالاتر (فقط شامل آن فصل) وارد کن؛ بقیه‌ی فصل‌ها و پیشرفت شما دست‌نخورده می‌ماند. همیشه ابتدا پیش‌نمایش و گزارش خطا می‌بینی و می‌توانی لغو کنی.</p><label class="btn p" style="display:inline-block;margin:0">انتخاب فایل دوره<input type="file" accept=".zip,.json" data-crs-file="import" hidden></label></div>';
  h+='<div class="c"><h3>دوره‌های نصب‌شده</h3>'+(CR.cache.courses.length?'<div class="row"><button class="chip sm" data-a="crs_catalog">📋 '+TT('کپی فهرست برای هوش مصنوعی','Copy list for the AI builder')+'</button></div>':'')+(CR.cache.courses.length?CR.cache.courses.map(c=>{const fs=filesOf(c),sl=new Set(lessonsOf(c.id).map(l=>l.id)),sq=new Set(questionsOf(c.id).map(q=>q.id)),ci=E_(c.id);
    return'<details class="crs-fl" style="margin:6px 0"><summary dir="auto" style="cursor:pointer"><b>'+E_(c.title)+'</b> <small class="m">v'+E_(c.contentVersion)+' · '+faN(fs.length)+' فایل · '+faN(lessonsOf(c.id).length)+' درس · '+faN(questionsOf(c.id).length)+' سؤال</small></summary>'
    +fs.map(f=>{const fi=E_(f.id);return'<div class="cwr"><span dir="auto"><b>'+E_(f.name)+'</b> <small class="m">'+(f.ver?'v'+E_(f.ver)+' · ':'')+faN((f.lessons||[]).filter(i=>sl.has(i)).length)+' درس · '+faN((f.questions||[]).filter(i=>sq.has(i)).length)+' سؤال'+(f.upd?' · '+fmtD(String(f.upd).slice(0,10)):'')+'</small></span><button data-a="crs_frn" data-c="'+ci+'" data-f="'+fi+'" title="تغییر نام">✏️</button><label class="btn" style="margin:0" title="جایگزین کردن با نسخه‌ی کامل‌تر">🔄<input type="file" accept=".zip" data-crs-file="import" data-crs-rep="'+ci+'|'+fi+'" hidden></label><button class="d" data-a="crs_frd" data-c="'+ci+'" data-f="'+fi+'" title="حذف فقط این فایل">🗑</button></div>'}).join('')
    +'<div class="row" style="margin-top:6px"><label class="btn p" style="margin:0">＋ افزودن فایل<input type="file" accept=".zip" data-crs-file="import" data-crs-add="'+ci+'" hidden></label><button data-a="crs_expc" data-id="'+ci+'">خروجی ZIP کل دوره</button><button class="d" data-a="crs_delc" data-id="'+ci+'">حذف کل دوره</button></div></details>'}).join(''):'<p class="m">دوره‌ای نصب نیست.</p>')+'</div>';
  h+='<div class="c"><h3>انتقال و پشتیبان‌گیری فقط آکادمی</h3><div class="row"><button data-a="crs_expu">خروجی اطلاعات کاربر (JSON)</button><button data-a="crs_expb">پشتیبان فقط آکادمی (دوره‌ها + اطلاعات)</button><label class="btn" style="margin:0">بازیابی پشتیبان آکادمی<input type="file" accept=".zip,.json" data-crs-file="restore" hidden></label></div>'+
   '<div class="crs-call crs-note"><div class="crs-ct">انتقال دستی ≠ همگام‌سازی خودکار</div>اینجا همگام‌سازی آنلاین وجود ندارد. برای رفتن از لپ‌تاپ به گوشی: «پشتیبان کامل» را بگیر، فایل را با ایمیل/تلگرام/فلش منتقل کن و در دستگاه مقصد «بازیابی از فایل» را بزن. هر تغییری که بعد از گرفتن فایل انجام دهی، در دستگاه دیگر نیست تا دوباره منتقل کنی. این اطلاعات داخل IndexedDB مرورگر است و در «پشتیبان JSON» خودِ پلنر (برنامه‌ریزی، عادت‌ها و …) <b>گنجانده نمی‌شود</b>؛ آن را جداگانه از تنظیمات پلنر پشتیبان بگیر.</div><div id="crs-est" class="m"></div></div>';
  return h;
}
function memBanner(){if(!IDB.mem)return'';return'<div class="c crs-e"><b>⚠️ حالت موقت: ذخیره‌ی مرورگر در دسترس نیست</b> ('+E_((IDB.memErr&&IDB.memErr.message)||'')+')<p>دوره‌ها و پیشرفت فقط تا وقتی این تب باز است می‌مانند و با بستن یا رفرش از بین می‌روند. پیش از بستن حتماً در «ورود و مدیریت» روی «پشتیبان کامل» بزن.</p><details><summary>چطور ذخیره‌ی دائمی را درست کنم؟</summary><ol dir="auto" style="line-height:1.9"><li>Chrome را کامل ببند و دوباره باز کن (قفل‌شدن پایگاه داده معمولاً با این رفع می‌شود).</li><li>chrome://settings/content/all ← عبارت <b>file</b> را جست‌وجو کن و داده‌ی «file://» را پاک کن (فقط داده‌ی فایل‌های محلی پاک می‌شود).</li><li>حالت ناشناس را کنار بگذار؛ مطمئن شو کوکی/داده‌ی سایت مسدود نیست؛ حافظه‌ی خالی را بررسی کن.</li><li>مطمئن‌ترین راه: فایل را روی یک آدرس https (مثل GitHub Pages) یا localhost باز کن.</li></ol></details><button data-a="crs_retry">تلاش دوباره برای ذخیره‌ی دائمی</button></div>'}
function body(){
  if(CR.err)return'<div class="c crs-e"><b>خطا:</b> '+E_(CR.err)+'<div><button class="p" data-a="crs_retry">تلاش مجدد</button></div></div>';
  if(!CR.loaded)return'<div class="c"><p class="m">در حال بارگذاری…</p></div>';
  switch(CR.tab){case'home':return vHome();case'courses':return vCourses();case'quiz':return vQuizSetup();case'errors':return vErrors();case'review':return vReview();case'sources':return vSources();case'report':return vReport();case'manage':return vManage()}return''}
/* ---------- رویدادها ---------- */
const hh=(n,f)=>{H['crs_'+n]=el=>{try{const r=f(el);if(r&&r.catch)r.catch(e=>{console.error(e);msg('err',E_(storeErr(e)));CR.busy='';rerender()})}catch(e){console.error(e);toast('خطا: '+e.message,1)}}};
hh('cview',el=>{CR.cv=CR.cv||{};CR.cv[el.dataset.c]=el.dataset.v==='ch'?'ch':'ses';try{localStorage.setItem('crs_cv',JSON.stringify(CR.cv))}catch(e){}rerender()});
const goTab=k=>{stopStudy();if(CR.tab==='quiz'&&CR.quiz&&k!=='quiz')leaveQuiz();CR.tab=k;CR.msg=null;rerender();window.scrollTo(0,0)};
hh('tab',el=>{const k=el.dataset.k;if(k==='quiz'&&CR.quiz){CR.tab='quiz';rerender();return}if(k!=='quiz')CR.keyId=k==='quiz'?CR.keyId:'';goTab(k)});
hh('msgx',()=>{CR.msg=null;rerender()});
hh('retry',()=>{if(IDB.mem&&(CR.cache.courses.length||CR.cache.progress.length)&&!confirm('داده‌ی موقتیِ فعلی (دوره‌ها و پیشرفت) هنگام تلاش مجدد پاک می‌شود. اگر پشتیبان نگرفته‌ای انصراف بده. ادامه؟'))return;CR.err='';IDB.p=null;IDB.mem=false;IDB.memErr=null;Object.keys(MEMDB).forEach(k=>delete MEMDB[k]);CR.assetCourse='';return crLoad().then(rerender)});
hh('open',el=>{stopStudy();const c=el.dataset.c,l=el.dataset.l;CR.tab='courses';CR.courseId=c;CR.lessonId=l||'';CR.msg=null;
  return crAssets(c).then(()=>{if(l)CR.studyAt=Date.now();rerender();window.scrollTo(0,0)})});
hh('back',()=>{stopStudy();CR.courseId='';CR.lessonId='';rerender()});
hh('chtog',el=>{CR.chOpen=CR.chOpen||{};const k=el.dataset.k,c=CR.ix.courses.get(CR.courseId),def=c?c.chapters.length<=3:true;CR.chOpen[k]=!(CR.chOpen[k]!==undefined?CR.chOpen[k]:def);rerender()});
hh('mz',el=>{CR.mz=Math.min(2,Math.max(.7,+(CR.mz+(+el.dataset.d)*.15).toFixed(2)));try{localStorage.setItem('crs_mz',CR.mz)}catch(e){}rerender()});
hh('zoom',el=>{const u=assetUrl(el.dataset.p);if(u)modal('<div class="crs-zm"><img src="'+u+'" alt=""></div><div class="row"><button data-a="cl">بستن</button></div>')});
hh('ack',el=>{const l=CR.ix.lessons.get(el.dataset.l);return saveProg(l,{doneHash:l.hash,reviewedAt:Date.now()}).then(rerender)});
hh('reviewed',el=>{const l=CR.ix.lessons.get(el.dataset.l);return saveProg(l,{reviewedAt:Date.now()}).then(rerender)});
hh('ck',el=>{const l=CR.ix.lessons.get(el.dataset.l),p=CR.ix.progress.get(l.id)||{},ck={...(p.checks||{})};ck[el.dataset.k]=el.checked;return saveProg(l,{checks:ck}).then(()=>setTimeout(rerender,0))});
hh('done',el=>{const l=CR.ix.lessons.get(el.dataset.l),p=CR.ix.progress.get(l.id)||{},d=!p.done;return saveProg(l,{done:d,doneAt:d?Date.now():0,doneHash:d?l.hash:'',reviewedAt:Date.now()}).then(()=>{toast(d?'درس تکمیل شد':'درس ناتمام شد');rerender()})});
hh('bm',el=>{const k=el.dataset.k,r=el.dataset.r,id='b_'+k+'_'+r;if(CR.quiz)touchQ();
  const q=k==='lesson'?CR.ix.lessons.get(r):CR.ix.questions.get(r);if(!q)return;
  return(CR.ix.bookmarks.has(id)?delUser('bookmarks',id):putUser('bookmarks',{id,kind:k,refId:r,courseId:q.courseId,at:Date.now()})).then(rerender)});
hh('note',el=>{const t=document.getElementById('crs-note'),v=t&&t.value.trim();if(!v){toast('متن یادداشت خالی است',1);return}const l=CR.ix.lessons.get(el.dataset.l);return putUser('notes',{id:uid('n_'),courseId:l.courseId,lessonId:l.id,text:v.slice(0,5000),at:Date.now()}).then(()=>{toast('یادداشت ذخیره شد');rerender()})});
hh('notedel',el=>{if(confirm('این یادداشت حذف شود؟'))return delUser('notes',el.dataset.id).then(rerender)});
hh('qstart',el=>{const d=el.dataset;return startQuiz({courseId:d.c,scope:d.s,mode:d.m,diffs:d.d?[+d.d]:[1,2,3],count:d.m==='exam'?20:0,timed:false})});
hh('resume',el=>resumeQuiz(el.dataset.id));
hh('abandon',el=>{if(confirm('این آزمون نیمه‌تمام حذف شود؟'))return delUser('attempts',el.dataset.id).then(rerender)});
hh('errprac',()=>{const cs=[...new Set(CR.cache.errors.filter(e=>!e.resolved).map(e=>e.courseId))];if(!cs.length){toast('اشتباه بازی نیست');return}return cs.length===1?startQuiz({courseId:cs[0],scope:'wrong',mode:'practice',diffs:[1,2,3],count:0}):startMulti({items:cs.map(c=>({cid:c,scope:'wrong'})),order:'pick',mode:'practice',diffs:[1,2,3],count:0})});
hh('flagprac',()=>{const f=new Set();CR.cache.attempts.forEach(a=>Object.entries(a.items||{}).forEach(([q,i])=>{if(i.flag)f.add(q)}));const q=CR.ix.questions.get([...f][0]);if(!q)return;return startQuiz({courseId:q.courseId,scope:'flagged',mode:'practice',diffs:[1,2,3],count:0})});
hh('ev',el=>{CR.ev=el.dataset.k;rerender()});
hh('ef',el=>{CR.ef=el.dataset.k;rerender()});
hh('eqgo',()=>{const i=document.querySelector('[data-crs-eq]');CR.eq=i?i.value:'';rerender()});
hh('esres',el=>{const e=CR.ix.errors.get(CR.es);let k=el.dataset.k;if(k==='1')k='good';if(k==='0')k='again';if(e&&k!==''){const ok=k!=='again',n=qSched(e,k);CR.es='';return putUser('errors',{...e,selfN:(e.selfN||0)+1,selfK:(e.selfK||0)+(ok?1:0),correctStreak:ok?(e.correctStreak||0)+1:0,ivl:n,due:addIso(n)}).then(rerender)}CR.es='';rerender()});
hh('erres',el=>{const e=CR.ix.errors.get(el.dataset.id);return putUser('errors',{...e,resolved:!e.resolved}).then(rerender)});
hh('key',el=>{CR.keyId=el.dataset.id;CR.tab='quiz';return crAssets(CR.ix.attempts.get(el.dataset.id).courseId).then(()=>{rerender();window.scrollTo(0,0)})});
hh('qnew',()=>{CR.keyId='';rerender()});
hh('self',el=>selfGrade(el.dataset.q,el.dataset.v));
hh('tk',el=>{toggleTk(el.dataset.t)});
function toggleTk(t){const S=CR.setup;let tk=Array.isArray(S.tokens)&&S.tokens.length?S.tokens.slice():['all'];const i=tk.indexOf(t);if(i>=0)tk.splice(i,1);else{if(t==='all')tk=[];else tk=tk.filter(x=>x!=='all');tk.push(t)}if(t==='all'&&i<0)tk=['all'];if(!tk.length)tk=['all'];S.tokens=tk;rerender()}
hh('konkur',()=>{const S=CR.setup,cid=S.courseId||CR.cache.courses[0].id,tk=S.tokens&&S.tokens.length?S.tokens:['all'],diffs=S.diffs||[1,2,3],n=pool(cid,tk,diffs).length,cnt=Math.max(1,Math.min(parseInt(document.getElementById('crsq-count').value,10)||n,n));
  const ex1=tk.length===1&&tk[0].startsWith('exam:')?examMeta(cid,tk[0].slice(5)):null,Qs=pool(cid,tk,diffs),sum=Qs.slice(0,cnt).reduce((s,q)=>s+(+q.timeSec||60),0);
  return startQuiz({courseId:cid,scope:tk,diffs,count:cnt,mode:'exam',timed:true,minutes:ex1&&ex1.minutes?ex1.minutes:Math.max(1,Math.ceil(sum/60)),neg:true,pen:ex1&&ex1.penalty!=null?ex1.penalty:null,konkur:true,shuffle:!(ex1)})});
hh('qbegin',()=>{const S=CR.setup,cid=S.courseId||CR.cache.courses[0].id,diffs=[...document.querySelectorAll('[data-crs-diff]')].filter(x=>x.checked).map(x=>+x.dataset.crsDiff),timed=document.getElementById('crsq-timed').checked;
  return startQuiz({courseId:cid,scope:S.tokens&&S.tokens.length?S.tokens:(S.scope||'all'),diffs,count:Math.max(1,parseInt(document.getElementById('crsq-count').value,10)||10),mode:S.mode||'exam',timed,minutes:parseInt(document.getElementById('crsq-min').value,10)||20,neg:!!S.neg,shuffle:!((S.tokens||[]).some(t=>String(t).startsWith('exam:'))&&S.orig!==false)})});
hh('qgo',el=>{touchQ();CR.qi=+el.dataset.n;if(CR.quiz.secs){const s=CR.quiz.secs[secOfQ(CR.qi)];CR.qi=Math.max(s.from,Math.min(s.to-1,CR.qi))}persistSoon();rerender();window.scrollTo(0,0)});
hh('qnext',el=>{touchQ();{const q0=CR.quiz,s=q0.secs?q0.secs[secOfQ(CR.qi)]:{from:0,to:q0.qids.length};CR.qi=Math.max(s.from,Math.min(s.to-1,CR.qi+(+el.dataset.n)))}persistSoon();rerender();window.scrollTo(0,0)});
hh('hint',()=>{const it=curItem();it.hints=(it.hints||0)+1;persistSoon();rerender()});
hh('qflag',()=>{const it=curItem();it.flag=!it.flag;persistSoon();rerender()});
hh('secend',()=>{const a=CR.quiz;if(!a||!a.secs)return;const i=secOfQ(CR.qi);if(i>=a.secs.length-1)return;if(!confirm(TT('بخش را تمام می‌کنی؟ دیگر برنمی‌گردی.','End this section? You cannot come back.')))return;touchQ();const st=secState();a.skip=(a.skip||0)+Math.max(0,st.left);CR.qi=a.secs[i+1].from;persistSoon();rerender();window.scrollTo(0,0)});
hh('conf',el=>{const it=curItem();it.conf=it.conf===el.dataset.v?'':el.dataset.v;persistSoon();rerender()});
hh('conftog',()=>{db.set.acdConf=!CONF();if(typeof save==='function')save();rerender()});
hh('sugg',el=>{const e=CR.ix.errors.get(el.dataset.id);if(e&&e.sugg)return putUser('errors',{...e,cause:e.sugg}).then(rerender)});
hh('edue',()=>{CR.edue=!CR.edue;CR.es='';rerender()});
hh('qcheck',()=>{touchQ();const q=CR.ix.questions.get(CR.quiz.qids[CR.qi]),it=curItem();it.checked=true;it.ok=grade(QR(q,it),it.answer).ok;persistSoon();rerender()});
hh('qsubmit',()=>{const a=CR.quiz,un=a.qids.filter(id=>{const t=a.items[id];return!t||t.answer==null||t.answer===''||(Array.isArray(t.answer)&&!t.answer.length)}).length;if(un&&!confirm(faN(un)+' سؤال بی‌پاسخ است. پایان و تصحیح؟'))return;return submitQuiz()});
hh('qquit',()=>{if(!confirm('آزمون رها و حذف شود؟'))return;const id=CR.quiz.id;clearInterval(CR.tmr);CR.quiz=null;return delUser('attempts',id).then(rerender)});
hh('qpause',()=>{leaveQuiz();clearInterval(CR.tmr);CR.quiz=null;toast('ذخیره شد؛ از «نیمه‌تمام» ادامه بده');rerender()});
hh('commit',()=>{const pd=CR.pending;pd.pl.allowOver=!!pd.over;pd.pl.rmOrphans=!!pd.rmo;if(pd.fname)pd.pl.fname=pd.fname;return guard(async()=>{await commitPack(pd.P,pd.pl);CR.pv&&CR.pv.forEach(u=>URL.revokeObjectURL(u));CR.pv=null;CR.pending=null;msg('ok','دوره «'+E_(pd.P.course.title)+'» با موفقیت ثبت شد (نسخه‌ی '+E_(pd.pl.newV)+').')})});
hh('cancel',()=>{CR.pv&&CR.pv.forEach(u=>URL.revokeObjectURL(u));CR.pv=null;CR.pending=null;toast('ورود لغو شد؛ چیزی ذخیره نشد');rerender()});
const saveCourse=async c2=>{await IDB.tx(['courses'],'readwrite',async t=>{await rq(t.objectStore('courses').put({...c2,updatedAt:nowISO()}))});await crLoad()};
hh('know',el=>{const qid=el.dataset.q,v=el.dataset.v==='1',act=CR.quiz&&CR.quiz.qids.includes(qid)?CR.quiz:null;
  if(act){const it=act.items[qid]||(act.items[qid]={});if(v)it.ov='know';else delete it.ov;persistSoon();rerender();return}
  const a=CR.ix.attempts.get(CR.keyId);if(!a)return;const it=a.items[qid]||(a.items[qid]={});if(v)it.ov='know';else delete it.ov;recalcScore(a);
  (async()=>{await putUser('attempts',a);const er=CR.ix.errors.get('e_'+qid);
    if(v){if(er&&er.attemptId===a.id){if((er.count||1)<=1)await delUser('errors',er.id);else await putUser('errors',{...er,count:er.count-1})}}else await recordErrors(a)})().then(rerender).catch(e=>toast(storeErr(e),1))});
hh('news_ok',el=>{const A=zAX();if(!A.nws||typeof A.nws!=='object'||Array.isArray(A.nws))A.nws={};const c=CR.ix.courses.get(el.dataset.c);if(!c)return;const m=A.nws[c.id]=A.nws[c.id]||{};(c.news||[]).forEach(n=>{m[n.id]=1});zcommit();rerender()});
hh('catalog',async()=>{const t=catalogText();try{await navigator.clipboard.writeText(t);toast('فهرست دوره‌ها کپی شد؛ در چت سازنده بچسبان')}catch(e){const w=document.createElement('textarea');w.value=t;w.style.cssText='position:fixed;left:-999px';document.body.appendChild(w);w.select();try{document.execCommand('copy');toast('فهرست دوره‌ها کپی شد؛ در چت سازنده بچسبان')}catch(x){toast('کپی نشد',1)}w.remove()}});
hh('ses_tick',el=>{const d=sesData(el.dataset.c),x=d[el.dataset.s]=d[el.dataset.s]||{p:{}};x.p=x.p||{};const i=el.dataset.i;if(x.p[i])delete x.p[i];else x.p[i]=1;x.t=Date.now();zcommit();rerender()});
hh('ses_pick',el=>{CR.sesSel=CR.sesSel||{};CR.sesSel[el.dataset.c]=el.dataset.s;rerender()});
hh('ses_go',el=>{const c=CR.ix.courses.get(el.dataset.c),x=c&&(c.sessions||[]).find(y=>y.id===el.dataset.s),p=x&&x.parts[+el.dataset.i];if(!p)return;const ids=p.lessonIds.filter(l=>CR.ix.lessons.get(l));
  const lc=l=>(CR.ix.lessons.get(l)||{}).courseId||c.id;
  if(p.kind==='learn'){const l=ids.find(i=>{const g=CR.ix.progress.get(i);return!(g&&g.done)})||ids[0];if(l)H.crs_open({dataset:{c:lc(l),l}});return}
  if(p.kind==='cards'){if(window.daniReview2&&window.daniReview2.go){window.daniReview2.unlock(ids);window.daniReview2.setScope('lessons',ids.join(','));window.daniReview2.go()}return}
  if(p.kind==='review'){CR.courseId=c.id;CR.tab='errors';rerender();return}
  if(p.kind==='practice'||p.kind==='test'){const cc=ids.length?lc(ids[0]):c.id,same=ids.filter(i=>lc(i)===cc);return startQuiz({courseId:cc,scope:same.length?same.map(i=>'lesson:'+i):'all',diffs:[1,2,3,4,5],count:p.count||10,mode:p.kind==='test'?'exam':'practice',timed:p.kind==='test',minutes:p.minutes||10})}});
hh('frn',el=>{const c=CR.ix.courses.get(el.dataset.c);if(!c)return;const fs=filesOf(c).map(f=>({...f})),f=fs.find(x=>x.id===el.dataset.f);if(!f)return;const n=prompt('نام فایل',f.name);if(n==null)return;const nm=n.trim().slice(0,40);if(!nm)return;f.name=nm;delete f.legacy;return guard(()=>saveCourse({...c,files:fs}),'نام فایل عوض شد')});
hh('frd',el=>{const c=CR.ix.courses.get(el.dataset.c);if(!c)return;const fs=filesOf(c).map(f=>({...f})),f=fs.find(x=>x.id===el.dataset.f);if(!f)return;
  const sl=new Set(lessonsOf(c.id).map(l=>l.id)),sq=new Set(questionsOf(c.id).map(q=>q.id)),nl=(f.lessons||[]).filter(i=>sl.has(i)).length,nq=(f.questions||[]).filter(i=>sq.has(i)).length;
  if(!confirm('فایل «'+f.name+'» حذف شود؟\n'+nl+' درس و '+nq+' سؤال از دوره برداشته می‌شود.\nپیشرفت، پاسخ‌ها، نشانک‌ها و یادداشت‌های تو حذف نمی‌شود.\n(پیش از حذف می‌توانی «خروجی ZIP کل دوره» بگیری.)'))return;
  if(fs.length===1&&!confirm('این تنها فایل دوره است و دوره خالی می‌ماند. ادامه؟'))return;
  return guard(async()=>{const rest=fs.filter(x=>x.id!==f.id);await IDB.tx(['courses','lessons','questions'],'readwrite',async t=>{for(const i of (f.lessons||[]))await rq(t.objectStore('lessons').delete(i));for(const i of (f.questions||[]))await rq(t.objectStore('questions').delete(i));await rq(t.objectStore('courses').put({...c,files:rest,updatedAt:nowISO()}))});if(CR.lessonId&&(f.lessons||[]).includes(CR.lessonId))CR.lessonId='';await crLoad()},'فایل حذف شد')});
hh('expc',el=>guard(async()=>{const c=CR.ix.courses.get(el.dataset.id);download(c.id+'-'+c.contentVersion+'.dani-course.zip',await buildCourseZip(c.id))},'فایل دوره دانلود شد'));
hh('delc',el=>{const c=CR.ix.courses.get(el.dataset.id);if(!confirm('محتوای دوره «'+c.title+'» حذف شود؟\n(قبل از حذف، «خروجی ZIP» بگیر. پیشرفت و پاسخ‌ها در مرحله‌ی بعد جداگانه پرسیده می‌شود.)'))return;const wu=confirm('پیشرفت، پاسخ‌ها، نشانک‌ها و یادداشت‌های این دوره هم حذف شود؟\nتأیید = همه حذف شود · انصراف = اطلاعات من بماند');return guard(async()=>{if(CR.courseId===c.id){CR.courseId='';CR.lessonId=''}await deleteCourse(c.id,wu)},'دوره حذف شد')});
hh('expu',()=>{download('dani-academy-user-'+new Date().toISOString().slice(0,10)+'.json',new Blob([JSON.stringify(userExport(),null,1)],{type:'application/json'}));toast('خروجی اطلاعات کاربر آماده شد')});
hh('expb',()=>guard(async()=>{const files=[{name:'user.json',z:1,data:enc.encode(JSON.stringify(userExport()))}];for(const c of CR.cache.courses)files.push({name:'courses/'+c.id+'.dani-course.zip',data:new Uint8Array(await(await buildCourseZip(c.id)).arrayBuffer())});download('dani-academy-backup-'+new Date().toISOString().slice(0,10)+'.dani-backup.zip',await zipWriteZ(files))},'پشتیبان کامل دانلود شد'));
hh('rcancel',()=>{CR.restore=null;rerender()});
hh('rapply',()=>{const R=CR.restore;if(R.mode==='replace'&&!confirm('اطلاعات کاربر فعلی کاملاً جایگزین می‌شود. ادامه؟'))return;return guard(async()=>{const log=await applyRestore();CR.restore=null;msg('ok','بازیابی انجام شد.'+(log.length?'<br>'+log.map(E_).join('<br>'):''))})});
document.addEventListener('change',e=>{
  const t=e.target;if(!t||!t.matches)return;
  if(t.matches('[data-crs-file=all]')){const f=t.files&&t.files[0];t.value='';if(!f)return;guard(async()=>{CR.everything=await prepEverything(f);CR.restore=null;CR.pending=null});return}
  if(t.matches('[data-crs-file]')){const f=t.files&&t.files[0],o={add:t.dataset.crsAdd||'',rep:t.dataset.crsRep||''};t.value='';if(!f)return;guard(()=>importFile(f,o).then(()=>{}));return}
  if(t.matches('[data-crs-tg]')&&CR.pending){const pd=CR.pending;pd.pl=planPack(pd.P,{target:t.value,name:pd.name});pd.over=false;pd.rmo=false;pd.fname=pd.pl.fname;rerender();return}
  if(t.matches('[data-crs-fname]')&&CR.pending){CR.pending.fname=t.value;return}
  if(t.matches('[data-crs-over]')&&CR.pending){CR.pending.over=t.checked;return}
  if(t.matches('[data-crs-rmo]')&&CR.pending){CR.pending.rmo=t.checked;return}
  if(t.matches('[data-crs-bk]')){CR.bk[t.dataset.crsBk]=t.checked;return}
  if(t.matches('[data-crs-ev]')){const ev=CR.everything;if(t.dataset.crsEv==='host')ev.doHost=t.checked;else ev.doAcademy=t.checked;rerender();return}
  if(t.matches('[data-crs-evsafe]')){CR.everything.safety=t.checked;return}
  if(t.matches('[data-crs-set]')){const k=t.dataset.crsSet;if(k==='courseId'){CR.setup={...CR.setup,courseId:t.value,scope:'all',tokens:['all']}}else if(k==='timed')CR.setup.timed=t.checked;else if(k==='neg')CR.setup.neg=t.checked;else if(k==='orig')CR.setup.orig=t.checked;else CR.setup[k]=t.value;rerender();return}
  if(t.matches('[data-crs-tk]')){toggleTk(t.dataset.crsTk);return}
  if(t.matches('[data-crs-diff]')){CR.setup.diffs=[...document.querySelectorAll('[data-crs-diff]')].filter(x=>x.checked).map(x=>+x.dataset.crsDiff);rerender();return}
  if(t.matches('[data-crs-down]')){CR.pending.down=t.checked;rerender();return}
  if(t.matches('[data-crs-rm]')){RS().mode=t.dataset.crsRm;rerender();return}
  if(t.matches('[data-crs-rp]')){RS().policy=t.dataset.crsRp;rerender();return}
  if(t.matches('[data-crs-safety]')){CR.restore.safety=t.checked;return}
  if(t.matches('[data-crs-eq]')){CR.eq=t.value;rerender();return}
  if(t.matches('[data-crs-cause]')){const er=CR.ix.errors.get(t.dataset.crsCause);if(er)putUser('errors',{...er,cause:t.value}).catch(x=>toast(storeErr(x),1));return}
  if(t.matches('[data-crs-enote]')){const er=CR.ix.errors.get(t.dataset.crsEnote);if(er)putUser('errors',{...er,note:t.value.slice(0,500)}).catch(x=>toast(storeErr(x),1));return}
  if(t.matches('[data-crq]')&&CR.quiz){const it=curItem(),k=t.dataset.crq;
    if(k==='single')it.answer=t.value;
    else if(k==='multi')it.answer=[...document.querySelectorAll('[data-crq=multi]')].filter(x=>x.checked).map(x=>x.value);
    else if(k==='cloze'){const m=it.answer&&typeof it.answer==='object'&&!Array.isArray(it.answer)?{...it.answer}:{};m[t.dataset.i]=t.value;it.answer=m}
    else if(k==='match'){const m=it.answer&&typeof it.answer==='object'&&!Array.isArray(it.answer)?{...it.answer}:{};m[t.dataset.i]=t.value;it.answer=m}
    else it.answer=t.value;
    persistSoon();if(k==='single'||k==='multi'){document.querySelectorAll('.crs-ch').forEach(l=>l.classList.toggle('on',l.querySelector('input').checked))}
    const b=document.querySelectorAll('.crs-nav button')[CR.qi];if(b)b.classList.add('crs-an')}
});
document.addEventListener('input',e=>{const t=e.target;if(t&&t.matches&&t.matches('[data-crq=cloze]')&&CR.quiz){const it=curItem(),m=it.answer&&typeof it.answer==='object'&&!Array.isArray(it.answer)?{...it.answer}:{};m[t.dataset.i]=t.value;it.answer=m;persistSoon();const b=document.querySelectorAll('.crs-nav button')[CR.qi];if(b)b.classList.toggle('crs-an',Object.values(m).some(x=>String(x).trim()));return}
  if(t&&t.matches&&t.matches('[data-crq=text]')&&CR.quiz){const it=curItem();it.answer=t.value;persistSoon();const b=document.querySelectorAll('.crs-nav button')[CR.qi];if(b)b.classList.toggle('crs-an',!!t.value)}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopStudy();if(CR.quiz){touchQ();CR.quiz.used=usedMs();CR.resumedAt=Date.now();putUser('attempts',CR.quiz).catch(()=>{})}}else{CR.resumedAt=Date.now();CR.qStart=Date.now();if(CR.lessonId&&inCrs())CR.studyAt=Date.now()}});
/* ---------- CSS ---------- */
const CSS=`.crs-pass{border:1px solid var(--b);border-inline-start:4px solid #0ea5e9;border-radius:10px;padding:8px 12px;margin:8px 0;background:var(--c)}.crs-pass.acf-pin:not(.on){max-height:none}
.crs-cz{width:auto;min-width:5em;max-width:11em;display:inline-block;padding:2px 6px;margin:0 3px;border-bottom:2px solid var(--ac)}.crs-bl{border-bottom:2px solid var(--ac);padding:0 6px}
.crs-ds{margin:6px 0;padding-inline-start:1.6em}.crs-trap{background:#f59e0b22;border-radius:8px;padding:6px 10px;margin:6px 0}.crs-hints{margin:8px 0}.crs-hint{background:#0ea5e922;border-radius:8px;padding:6px 10px;margin:4px 0}.crs-plc{display:flex;flex-wrap:wrap;gap:8px}.crs-plc .crs-ch{flex:0 0 auto;min-width:64px;justify-content:center}
.crs-lesson{--m:1}.crs-body p,.crs-lesson p{margin:.5em 0}
.crs-math{overflow-x:auto;overflow-y:hidden;padding:8px 4px;margin:8px 0;font-size:calc(1.2em*var(--crs-mz,1));direction:ltr;text-align:center;max-width:100%;-webkit-overflow-scrolling:touch;border-radius:8px}
.crs-math:focus{outline:2px solid var(--ac)}.crs-math math{font-size:inherit}.crs-im math{font-size:calc(1.08em*var(--crs-mz,1))}
.crs-im{unicode-bidi:isolate}.crs-call{border:1px solid var(--b);border-inline-start:4px solid var(--ac);border-radius:10px;padding:8px 12px;margin:10px 0;background:var(--c)}
.crs-warning,.crs-pitfall{border-inline-start-color:#dc2626}.crs-tip,.crs-summary{border-inline-start-color:#16a34a}.crs-def,.crs-rule,.crs-theorem{border-inline-start-color:#7c3aed}.crs-quote{border-inline-start-color:#64748b;font-style:italic}
.crs-ct{font-weight:700;margin-bottom:4px}.crs-ex{border:1px dashed var(--ac);border-radius:12px;padding:10px 12px;margin:12px 0}
.crs-steps{list-style:none;padding:0;margin:6px 0}.crs-step{display:flex;gap:8px;align-items:flex-start;padding:4px 0;border-bottom:1px dotted var(--b)}.crs-step>div{min-width:0;flex:1}
.crs-sn{background:var(--ac);color:#fff;border-radius:50%;min-width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;font-size:12px;margin-top:4px}
.crs-ans{background:#16a34a22;border-radius:8px;padding:6px 10px;margin:6px 0}.crs-yours{margin:6px 0}.crs-sol,.crs-why{margin:8px 0;padding:6px 10px;border-inline-start:3px solid var(--b)}
.crs-tw{overflow-x:auto;max-width:100%}.crs-tw table{min-width:340px}.crs-viz{max-width:460px}.crs-svg{width:100%;height:auto;color:inherit}.crs-svg .vg{stroke:currentColor;stroke-opacity:.12}.crs-svg .va{stroke:currentColor;stroke-opacity:.45}.crs-svg .vt{fill:currentColor;font-size:10px;opacity:.8}.crs-svg .vh{fill:currentColor;font-size:12px;font-weight:700}.crs-leg{display:flex;flex-wrap:wrap;gap:4px 12px;justify-content:center;font-size:12px;margin-top:4px}.crs-leg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-inline-end:4px}.crs-vd{margin-top:4px;text-align:start}
.crs-fig{margin:10px auto;text-align:center;max-width:100%}.crs-fig img{max-width:100%;height:auto;background:#fff;border-radius:8px;border:1px solid var(--b)}
.crs-fig figcaption{font-size:13px;margin-top:4px}.crs-mini{font-size:12px;min-height:26px;padding:1px 8px;border:1px solid var(--b);border-radius:8px;background:var(--c);color:var(--t);cursor:pointer;text-decoration:none;display:inline-block}
.crs-zm{max-width:92vw;max-height:78vh;overflow:auto;background:#fff;border-radius:8px}.crs-zm img{max-width:none;display:block}
.crs-qrow{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;align-items:start}.crs-qs .crs-fig{margin-top:0}
.crs-chs{display:grid;gap:8px;margin:10px 0}.crs-ch{display:flex;gap:8px;align-items:flex-start;border:1px solid var(--b);border-radius:10px;padding:8px 10px;cursor:pointer;margin:0;color:var(--t);font-size:inherit}.crs-ch.on{border-color:var(--ac);background:#2563eb18}.crs-ch input{margin-top:6px}
.crs-cl{font-weight:700;min-width:22px}.crs-ctx{flex:1;min-width:0}.crs-ctx p{margin:0}
.crs-nav{display:flex;flex-wrap:wrap;gap:4px;margin:8px 0}.crs-nav button{min-height:32px;min-width:34px;padding:2px 6px}.crs-nav .crs-an{border-color:#16a34a;box-shadow:inset 0 -3px 0 #16a34a}.crs-nav .crs-fl{outline:2px solid #ea580c}
.crs-timer{font:700 18px/1 monospace;direction:ltr;padding:4px 10px;border:1px solid var(--b);border-radius:8px}.crs-low{color:#dc2626;border-color:#dc2626}
.crs-fb{border-radius:10px;padding:8px 12px;margin:10px 0;border:1px solid var(--b)}.crs-o{background:#16a34a1a;border-color:#16a34a}.crs-e{background:#dc26261a;border-color:#dc2626}
.crs-msg{display:flex;justify-content:space-between;gap:8px;align-items:center}.crs-bdg{display:inline-block;padding:1px 9px;border-radius:99px;font-size:12px;color:#fff;margin:1px 2px}
.crs-bad{color:#dc2626;background:#dc26261a;border-radius:6px;padding:0 4px}.crs-match .row{margin:4px 0}.crs-ml{min-width:120px}.crs-code{overflow-x:auto;background:var(--bg);padding:8px;border-radius:8px}
.crs-ck{display:flex;gap:6px;align-items:center;margin:4px 8px 4px 0;color:var(--t);font-size:inherit}.crs-cap{text-align:center}.crs-h{margin:14px 0 4px}.crs-src{margin-top:8px}.crs-pv{border:2px solid var(--ac)}
.crs-orig{display:inline-block}.crs-alt{margin:6px 0}`;

/* ---------- پشتیبان واحد «همه‌چیز»: پلنر (db، تصاویر، تم‌ها، بسته‌ها، افزونه‌ها) + آکادمی (دوره‌ها، درس‌ها، پیشرفت…) ---------- */
const LS_OK=k=>typeof k==='string'&&/^(dani_|hamrah_|uch_|crs_)/.test(k)&&k!==(typeof KEY!=='undefined'?KEY:'hamrah_v3')&&!/_tmp$|_snapshot$|_before_full_restore$/.test(k);
const hostKey=()=>typeof KEY!=='undefined'?KEY:'hamrah_v3';
async function imgAll(){const o={};if(typeof IMG==='undefined')return o;const ks=await IMG.keys();for(const k of ks){if(typeof k!=='string')continue;const v=await IMG.get(k);if(typeof v==='string')o[k]=v}return o}
async function imgPut(k,v){if(typeof IMG!=='undefined'&&typeof IMG.set==='function')return IMG.set(k,v);
  return new Promise((res,rej)=>{const r=indexedDB.open('hamrah_img',1);r.onupgradeneeded=()=>r.result.createObjectStore('img');r.onerror=()=>rej(r.error);r.onsuccess=()=>{const t=r.result.transaction('img','readwrite');t.objectStore('img').put(v,k);t.oncomplete=()=>res();t.onerror=()=>rej(t.error)}})}
async function hostSnap(opt){
  if(typeof db==='undefined')return null;
  const o={format:'dani-fullbackup',version:2,at:nowISO(),db:JSON.stringify(db),img:(opt&&opt.media===false)?{}:await imgAll(),ls:{}};
  for(let j=0;j<localStorage.length;j++){const k=localStorage.key(j);if(LS_OK(k))o.ls[k]=localStorage.getItem(k)}
  return o}
/* --- حذف تکرار و باینری‌کردن تصاویر/صداهای base64 (data-URL): همان بایت‌ها، حجم کمتر؛ بازیابی دقیقاً همان رشته‌ی اصلی را می‌سازد --- */
const DU_RE=/data:([A-Za-z0-9.+\-]+\/[A-Za-z0-9.+\-]+);base64,([A-Za-z0-9+\/]{4000,}={0,2})/g;
function b64ToBytes(b){const bin=atob(b),n=bin.length,u=new Uint8Array(n);for(let i=0;i<n;i++)u[i]=bin.charCodeAt(i);return u}
function bytesToB64(u){let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s)}
function slimStr(str,blobs){
  if(typeof str!=='string'||str.indexOf('base64,')<0||str.indexOf('{{dani-blob:')>=0)return null;
  let ch=false;
  const out=str.replace(DU_RE,(m,mime,b64)=>{try{const u=b64ToBytes(b64);if(bytesToB64(u)!==b64)return m;const h=u.length.toString(36)+'-'+crc32b(u).toString(36)+'-'+hashStr(b64);const ex=blobs.get(h);if(ex&&ex.mime!==mime)return m;if(!ex)blobs.set(h,{mime,data:u});ch=true;return'{{dani-blob:'+h+'}}'}catch(e){return m}});
  return ch?out:null}
function unslimStr(str,blobs){return str.replace(/\{\{dani-blob:([a-z0-9\-]+)\}\}/g,(m,h)=>{const b=blobs.get(h);if(!b)throw new Error('تصویر/صدای داخل پشتیبان گم شده است ('+h+')');return'data:'+b.mime+';base64,'+bytesToB64(b.data)})}
async function buildEverything(opt){
  opt=opt||{};const host=await hostSnap(opt),files=[],J=(n,o,z)=>{const d=enc.encode(typeof o==='string'?o:JSON.stringify(o));files.push({name:n,data:d,z:z!==false});return d.length};
  let raw=0,blobs=new Map();
  if(host){
    const meta={format:'dani-fullbackup-slim',version:1,at:host.at,db:host.db,img:{},ls:{},slim:{db:false,img:[],ls:[]},blobs:{}};
    raw+=host.db.length;const sd=slimStr(host.db,blobs);if(sd!==null){meta.db=sd;meta.slim.db=true}
    for(const k of Object.keys(host.img)){raw+=host.img[k].length;const r=slimStr(host.img[k],blobs);if(r!==null){meta.img[k]=r;meta.slim.img.push(k)}else meta.img[k]=host.img[k]}
    for(const k of Object.keys(host.ls)){raw+=host.ls[k].length;const r=slimStr(host.ls[k],blobs);if(r!==null){meta.ls[k]=r;meta.slim.ls.push(k)}else meta.ls[k]=host.ls[k]}
    blobs.forEach((v,h)=>{meta.blobs[h]={mime:v.mime,bytes:v.data.length};files.push({name:'host/blobs/'+h+'.bin',data:v.data,z:false})});
    J('host/meta.json',meta)}
  const ue=userExport();raw+=JSON.stringify(ue).length;J('academy/user.json',ue);
  let courseBytes=0;
  if(opt.courses!==false)for(const c of CR.cache.courses){const zb=await buildCourseZip(c.id),u=new Uint8Array(await zb.arrayBuffer());courseBytes+=u.length;files.push({name:'academy/courses/'+c.id+'.dani-course.zip',data:u,z:false})}
  J('manifest.json',{format:'dani-everything-backup',version:2,createdAt:nowISO(),app:CRV.app,planner:!!host,options:{media:opt.media!==false,courses:opt.courses!==false},academy:{courses:CR.cache.courses.map(c=>({id:c.id,title:c.title,contentVersion:c.contentVersion}))}});
  const blob=await zipWriteZ(files);
  return{blob,stats:{plannerRaw:raw,out:blob.size,blobs:blobs.size,saved:Math.max(0,raw-([...blobs.values()].reduce((s,v)=>s+v.data.length,0))),courses:courseBytes}}}
async function prepEverything(file){
  const z=await zipRead(await readFileBuf(file));
  if(!z.ents.has('manifest.json'))throw new Error('manifest.json در فایل نیست — این «پشتیبان کامل DANI» نیست');
  const mf=JSON.parse(dec.decode(await z.read('manifest.json')));
  if(mf.format!=='dani-everything-backup')throw new Error('فایل پشتیبان کامل DANI نیست (format نامعتبر)');
  if(mf.version>2)throw new Error('این پشتیبان با نسخه‌ی جدیدتری ساخته شده است؛ برنامه را به‌روز کن');
  const ev={name:file.name,mf,host:null,restore:null,doHost:true,doAcademy:true,safety:true};
  let o=null,slim=null;
  if(z.ents.has('host/meta.json')){
    const m=JSON.parse(dec.decode(await z.read('host/meta.json')));
    if(!m||m.format!=='dani-fullbackup-slim'||typeof m.db!=='string')throw new Error('بخش پلنر داخل فایل معتبر نیست');
    o={format:'dani-fullbackup',version:2,at:m.at,db:m.db,img:m.img||{},ls:m.ls||{}};slim=m;
    for(const h of Object.keys(m.blobs||{}))if(!z.ents.has('host/blobs/'+h+'.bin'))throw new Error('فایل ناقص است: تصویر/صدای '+h+' در پشتیبان نیست')}
  else if(z.ents.has('host.json')){
    o=JSON.parse(dec.decode(await z.read('host.json')));
    if(!o||o.format!=='dani-fullbackup'||typeof o.db!=='string')throw new Error('بخش پلنر داخل فایل معتبر نیست')}
  if(o){
    let d;try{d=JSON.parse(o.db)}catch(e){throw new Error('داده‌ی پلنر داخل فایل خراب است')}
    if(!d||!Array.isArray(d.acts)||!Array.isArray(d.entries))throw new Error('داده‌ی پلنر داخل فایل ناقص است');
    const ls=Object.keys(o.ls||{}).filter(LS_OK),cnt=p=>ls.filter(k=>k.startsWith(p)).length,ik=Object.keys(o.img||{}),ic=p=>ik.filter(k=>k.startsWith(p)).length,a=(d.mods&&d.mods.acd)||{};
    ev.host={o,slim,z,info:{acts:d.acts.length,entries:d.entries.length,img:ik.length,themes:ic('theme_')+ic('pack_'),skins:ic('skin_'),qpacks:cnt('dani_qpack_')+ic('qpack_'),packs:cnt('dani_pack_'),ext:cnt('dani_ext_')-(ls.includes('dani_ext_index')?1:0),other:ls.length,skin:(d.set&&d.set.skin)||'',cards:(a.cards||[]).length,lp:Object.keys(a.lp||{}).length,slimmed:!!slim}}}
  if(z.ents.has('academy/user.json')){
    const j=JSON.parse(dec.decode(await z.read('academy/user.json')));
    if(!j||j.format!=='dani-academy-user'||!j.data)throw new Error('بخش آکادمی داخل فایل معتبر نیست');
    const packs=[];
    for(const n of [...z.ents.keys()].filter(n=>/^academy\/courses\/.+\.zip$/.test(n))){try{const zz=await zipRead((await z.read(n)).buffer),P=await loadPackZip(zz),ex=P.course&&CR.ix.courses.get(P.course.id)||null,rep=validatePack(P,ex);let pl=null;if(!rep.errors.length){normalizePack(P);pl=planPack(P)}packs.push({n,P,rep,pl})}catch(e){packs.push({n,err:e.message})}}
    ev.restore={name:file.name,j,packs,policy:'keep',mode:'merge',safety:false}}
  if(!ev.host&&!ev.restore)throw new Error('فایل نه بخش پلنر دارد نه بخش آکادمی');
  return ev}
CR.bk={media:true,courses:true};
const RS=()=>(CR.everything&&CR.everything.restore)||CR.restore;
async function rehydrateHost(hh_){ // بازسازی دقیق رشته‌های اصلی از تصاویر/صداهای باینری
  const {o,slim,z}=hh_;if(!slim)return o;
  const blobs=new Map();for(const h of Object.keys(slim.blobs||{}))blobs.set(h,{mime:slim.blobs[h].mime,data:await z.read('host/blobs/'+h+'.bin')});
  if(slim.slim.db)o.db=unslimStr(o.db,blobs);
  for(const k of slim.slim.img)o.img[k]=unslimStr(o.img[k],blobs);
  for(const k of slim.slim.ls)o.ls[k]=unslimStr(o.ls[k],blobs);
  hh_.slim=null;return o}
async function applyEverything(){
  const ev=CR.everything,log=[];
  if(ev.safety){download('DANI-safety-before-restore-'+new Date().toISOString().slice(0,10)+'.dani-all.zip',(await buildEverything(CR.bk)).blob)}
  if(ev.doAcademy&&ev.restore){CR.restore=ev.restore;ev.restore.safety=false;const l=await applyRestore();CR.restore=null;log.push('آکادمی بازیابی شد'+(l.length?' ('+l.join('؛ ')+')':''))}
  if(ev.doHost&&ev.host){
    const {o,slim,z}=ev.host;
    await rehydrateHost(ev.host);
    let d;try{d=JSON.parse(o.db)}catch(e){throw new Error('داده‌ی پلنر پس از بازسازی خراب است؛ چیزی تغییر نکرد')}
    try{localStorage.setItem(hostKey()+'_before_full_restore',JSON.stringify(db))}catch(e){}
    for(const k of Object.keys(o.img||{}))if(k.length<200&&typeof o.img[k]==='string')await imgPut(k,o.img[k]);
    Object.keys(o.ls||{}).forEach(k=>{if(LS_OK(k)&&typeof o.ls[k]==='string')try{localStorage.setItem(k,o.ls[k])}catch(e){}});
    db=d;db.set=Object.assign(defSet(),db.set||{});
    if(!save())throw new Error('ذخیره‌ی داده‌ی پلنر ناموفق بود');
    log.push('پلنر بازیابی شد ('+ev.host.info.acts+' فعالیت، '+ev.host.info.entries+' ثبت، '+ev.host.info.img+' تصویر)');
    try{sessionStorage.setItem('crs_all_restored',JSON.stringify(log))}catch(e){}
    CR.everything=null;toast('بازیابی شد؛ در حال بارگذاری مجدد…');setTimeout(()=>location.reload(),900);return log}
  CR.everything=null;return log}
function evPanel(){
  const ev=CR.everything;if(!ev)return'';const h=ev.host,r=ev.restore;
  let s='<div class="c crs-pv"><h3>پیش‌نمایش بازیابی کامل</h3><div class="m">فایل: <bdi dir="ltr">'+E_(ev.name)+'</bdi> · ساخته‌شده در '+E_(ev.mf.createdAt||'؟')+'</div>';
  if(h){const i=h.info;s+='<label class="crs-ck"><input type="checkbox" data-crs-ev="host" '+(ev.doHost?'checked':'')+'> <b>پلنر</b> — جایگزین داده‌ی فعلی پلنر می‌شود</label><div class="m">'+faN(i.acts)+' فعالیت · '+faN(i.entries)+' ثبت · '+faN(i.themes)+' بسته/فایل تم · '+faN(i.skins)+' تصویر اسکین · '+faN(i.qpacks)+' بسته‌ی جمله · '+faN(i.ext)+' افزونه · '+faN(i.other)+' کلید تنظیم/داده'+(i.skin?' · اسکین: '+E_(i.skin):'')+' · آکادمی پلنر: '+faN(i.cards)+' فلش‌کارت، '+faN(i.lp)+' درس مسیر یادگیری'+(i.slimmed?' · فایل بهینه‌شده (بدون تکرار)':'')+'</div>'}
  else s+='<p class="m">این فایل بخش پلنر ندارد.</p>';
  if(r){const rep=planUser(r.j.data,r.mode==='replace'?'keep':r.policy);
    s+='<label class="crs-ck"><input type="checkbox" data-crs-ev="acad" '+(ev.doAcademy?'checked':'')+'> <b>آکادمی دوره‌ها</b> — دوره‌ها، درس‌ها، سؤال‌ها، تصاویر، پیشرفت، آزمون‌ها، نشانک‌ها، یادداشت‌ها، خطاها</label>'+
    (r.packs.length?r.packs.map(p=>'<div class="m">'+(p.err?'❌ '+E_(p.n)+': '+E_(p.err):p.rep.errors.length?'❌ '+E_(p.P.course&&p.P.course.title||p.n)+': '+faN(p.rep.errors.length)+' خطا':'📦 '+E_(p.P.course.title)+' — '+(p.pl.mode==='new'?'نصب می‌شود':p.pl.cmp>0?'به‌روز می‌شود':'از قبل نصب است'))+'</div>').join(''):'<div class="m">دوره‌ای در فایل نیست.</div>')+
    '<div class="crs-tw"><table><tr><th></th><th>در فایل</th><th>جدید</th><th>یکسان</th><th>تعارض</th></tr>'+USER_STORES.map(x=>'<tr><td>'+SN[x]+'</td><td>'+faN(rep[x].total)+'</td><td>'+faN(rep[x].n)+'</td><td>'+faN(rep[x].same)+'</td><td>'+faN(rep[x].conf)+'</td></tr>').join('')+'</table></div>'+
    '<div class="row"><label class="crs-ck"><input type="radio" name="crs-evm" data-crs-rm="merge" '+(r.mode==='merge'?'checked':'')+'> آکادمی: ادغام (چیزی حذف نمی‌شود)</label><label class="crs-ck"><input type="radio" name="crs-evm" data-crs-rm="replace" '+(r.mode==='replace'?'checked':'')+'> جایگزینی کامل اطلاعات آکادمی</label></div>'+(r.mode==='merge'?'<div class="row"><label class="crs-ck"><input type="radio" name="crs-evp" data-crs-rp="keep" '+(r.policy==='keep'?'checked':'')+'> در تعارض نسخه‌ی موجود بماند</label><label class="crs-ck"><input type="radio" name="crs-evp" data-crs-rp="newer" '+(r.policy==='newer'?'checked':'')+'> رکورد جدیدتر برنده شود</label></div>':'')}
  else s+='<p class="m">این فایل بخش آکادمی ندارد.</p>';
  s+='<label class="crs-ck"><input type="checkbox" data-crs-evsafe '+(ev.safety?'checked':'')+'> پیش از اعمال، یک پشتیبان کامل از وضعیت فعلی دانلود شود (توصیه می‌شود)</label>'+
   '<div class="m">پس از بازیابی پلنر، صفحه یک‌بار خودکار بارگذاری مجدد می‌شود. نسخه‌ی قبلی پلنر در حافظه‌ی مرورگر هم نگه‌داری می‌شود.</div>'+
   '<div class="row" style="margin-top:10px"><button class="p" data-a="crs_allapply" '+((ev.doHost&&h)||(ev.doAcademy&&r)?'':'disabled')+'>اعمال بازیابی کامل</button><button data-a="crs_allcancel">لغو</button></div></div>';
  return s}
function everythingCard(){
  let last='';try{const t=+localStorage.getItem('crs_lastall');if(t)last=new Date(t).toLocaleString('fa-IR')}catch(e){}
  return evPanel()+'<div class="c" data-nobi id="crs-allcard"><h3>🛡 پشتیبان کامل همه‌چیز (پلنر + آکادمی)</h3><p class="m">یک فایل برای تمام اطلاعات: فعالیت‌ها و ثبت‌ها، تنظیمات، تم‌ها و اسکین‌ها، بسته‌های جمله و تم، افزونه‌ها، تصاویر، فلش‌کارت‌ها و درس‌های پلنر، <b>و</b> همه‌ی دوره‌ها، درس‌ها، سؤال‌ها، تصاویر دوره، پیشرفت، آزمون‌ها، نشانک‌ها، یادداشت‌ها و دفترچه‌ی خطا. اگر مرورگر عوض شد یا اطلاعات پاک شد، همین فایل را در همین برنامه «بازیابی» کن.</p><details class="m" style="margin:6px 0"><summary>گزینه‌های حجم فایل</summary><label class="crs-ck"><input type="checkbox" data-crs-bk="media" '+(CR.bk.media?'checked':'')+'> تصاویر، تم‌ها و بسته‌های جمله (حجیم‌ترین بخش)</label><label class="crs-ck"><input type="checkbox" data-crs-bk="courses" '+(CR.bk.courses?'checked':'')+'> فایل کامل دوره‌ها (اگر خاموش باشد فقط پیشرفت و اطلاعات خودت می‌ماند و دوره‌ها را باید از فایل اصلی دوباره وارد کنی)</label><div class="m">پیش‌فرض هر دو روشن است = هیچ‌چیز کم نمی‌شود. تکرارها خودکار حذف و تصاویر بهینه ذخیره می‌شوند.</div></details>'+'<div class="row"><button class="p" data-a="crs_allexp">گرفتن پشتیبان کامل</button><label class="btn" style="margin:0">بازیابی از پشتیبان کامل<input type="file" accept=".zip" data-crs-file="all" hidden></label></div><div class="m">آخرین پشتیبان کامل از این مرورگر: '+(last?E_(last):'تا حالا گرفته نشده')+'</div></div>'}
hh('allexp',()=>guard(async()=>{const r=await buildEverything(CR.bk),st=r.stats;download('DANI-everything-backup-'+new Date().toISOString().slice(0,10)+'.dani-all.zip',r.blob);try{localStorage.setItem('crs_lastall',String(Date.now()))}catch(e){}
  const mb=n=>(n/1048576).toFixed(1);msg('ok','پشتیبان کامل دانلود شد — حجم فایل: <b>'+faN(mb(st.out))+' مگابایت</b>'+(st.blobs?' (داده‌های پلنر: '+faN(mb(st.plannerRaw))+' مگابایت خام ← تکرارها حذف و '+faN(st.blobs)+' تصویر/صدا بهینه ذخیره شد)':'')+'. فایل را جای امن نگه دار.')}));
hh('allcancel',()=>{CR.everything=null;rerender()});
hh('allapply',()=>{const ev=CR.everything;if(ev.doHost&&ev.host&&!confirm('داده‌ی فعلی پلنر با محتوای فایل جایگزین می‌شود. ادامه؟'))return;if(ev.doAcademy&&ev.restore&&ev.restore.mode==='replace'&&!confirm('اطلاعات کاربر آکادمی کاملاً جایگزین می‌شود. ادامه؟'))return;
  return guard(async()=>{const log=await applyEverything();msg('ok','بازیابی انجام شد.<br>'+log.map(E_).join('<br>'))})});

/* ---------- ثبت در پلنر: زیرمجموعه‌ی صفحه‌ی «آکادمی» ---------- */
const inCrs=()=>{try{return page==='acd'&&zMS.acd.tab==='courses'}catch(e){return false}};
function crsView(){
  if(!CR.loaded&&!CR.loading)crLoad().then(rerender);
  if(CR.tab==='manage')setTimeout(()=>{const e=document.getElementById('crs-est');if(e&&navigator.storage&&navigator.storage.estimate)navigator.storage.estimate().then(x=>{e.textContent='فضای مصرفی مرورگر: '+Math.round((x.usage||0)/1048576)+' از حدود '+Math.round((x.quota||0)/1048576)+' مگابایت'}).catch(()=>{})},0);
  return'<div id="crs" data-nobi><div class="c"><h4 style="margin:0 0 8px">دوره‌های آفلاین</h4>'+tabs()+'</div>'+memBanner()+banner()+(CR.busy?'<div class="c"><p class="m">در حال انجام…</p></div>':'')+body()+'</div>'}
function mount(){
  try{CR.mz=parseFloat(localStorage.getItem('crs_mz'))||1}catch(e){}
  if(!document.getElementById('crs-css')){const s=document.createElement('style');s.id='crs-css';s.textContent=CSS;document.head.appendChild(s)}
  /* مترجم حالت انگلیسی پلنر (i18Tree) متن فارسی درس‌ها را کلمه‌به‌کلمه خراب می‌کند؛ فقط زیرشاخه‌ی #crs را از آن مستثنا می‌کنیم */
  if(typeof i18Tree==='function'){const _i18=i18Tree,inC=n=>{const e=n&&(n.nodeType===3?n.parentNode:n);return!!(e&&e.closest&&e.closest('#crs'))};
    i18Tree=function(root){if(!root)return;if(inC(root))return;if(root.nodeType===1&&root.querySelector&&root.querySelector('#crs')){Array.from(root.childNodes).forEach(c=>i18Tree(c));return}return _i18.apply(this,arguments)}}
  /* کارت «پشتیبان کامل همه‌چیز» انتهای تب «داده‌ها» در تنظیمات (چیزی از صفحه حذف نمی‌شود) */
  if(PG.set){const _set=PG.set;PG.set=function(){let h=_set.apply(this,arguments);try{if(typeof stt!=='undefined'&&stt==='data'&&typeof h==='string'){if(!CR.loaded&&!CR.loading)crLoad().then(rerender);h+='<div id="crs-set" data-nobi>'+banner()+(CR.busy?'<div class="c"><p class="m">در حال انجام…</p></div>':'')+everythingCard()+'</div>'}}catch(e){console.error(e)}return h}}
  try{const r=sessionStorage.getItem('crs_all_restored');if(r){sessionStorage.removeItem('crs_all_restored');const l=JSON.parse(r);setTimeout(()=>{try{toast('بازیابی کامل انجام شد: '+l.join(' · '))}catch(e){}},1200)}}catch(e){}
  const _tabs=acdTabs;
  acdTabs=function(){const on=zMS.acd.tab==='courses',chip=mBtn('acd:tab:courses','دوره‌ها','chip '+(on?'on':'')),h=_tabs();
    /* اگر پلنر تب «درس‌ها» (learn) دارد، تب ما کنار آن می‌نشیند؛ وگرنه اولین تب می‌شود */
    if(h.indexOf('acd:tab:learn')>=0){const i=h.indexOf('</button>');if(i>=0)return h.slice(0,i+9)+chip+h.slice(i+9)}
    return h.replace('<div class="mrow">','<div class="mrow">'+chip)};
  const _pg=PG.acd;
  PG.acd=()=>{
    if(zMS.acd.tab!=='courses'){if(CR.quiz){leaveQuiz();clearInterval(CR.tmr);CR.quiz=null}stopStudy();return _pg()}
    return'<div class="c"><h3>'+BH('Academy','آکادمی')+'</h3>'+acdTabs()+'</div>'+crsView()};
  if(!zMS.acd.tab||zMS.acd.tab==='review')zMS.acd.tab='courses'; /* تب پیش‌فرضی که خود پلنر گذاشته (مثلاً learn) تغییر نمی‌کند */
  crLoad().then(()=>{if(inCrs())rerender()});
  window.daniCourses={catalogText,numAny,trapsOf,vidBtn,QR,exprEval,buildEverything,prepEverything,rehydrateHost,hostSnap,state:CR,validatePack,loadPackZip,zipRead,zipWrite,tex2mml,grade,inl,blocks,IDB,planPack,normalizePack,commitPack,importFile,buildCourseZip,startQuiz,submitQuiz,userExport,planUser,version:CRV,api:{qDueCount,fltFor,sesLessons,deleteQuestion,moveQuestion,deleteLesson,lessonDelInfo,deleteChapter,savePath,setUnit,normExam,numParse,startMulti,pool,renameItem,reapplyRen,addQuestion,latestResults,questionsOf,lessonsOf,courseProg,mastery,pool,blk,merge:mergeCourses,undoMerge,mergeUndoInfo,mergeList}};
}
mount();
})();

/* ===== v3.1 · محیط راحت‌تر درس‌ها + دکمه‌ی «بپرس» روی هر بخش =====
   فقط CSS و یک تکه‌ی مستقل است؛ هیچ قابلیتی حذف نشده. متن‌ها با LANGEN() دوزبانه‌اند. */
(function(){
  "use strict";
  if(window.__daniAskInit)return;window.__daniAskInit=1;
  var T=function(fa,en){try{return (typeof LANGEN==='function'&&LANGEN())?en:fa}catch(e){return fa}};
  var st=document.createElement('style');st.id='crs-comfort';st.textContent=`
/* ===== v3: محیط راحت‌تر برای خواندن درس‌ها ===== */
.crs-lesson{font-size:calc(var(--fs,15px)*1.18);line-height:2.15;max-width:860px;margin-inline:auto;padding:22px clamp(14px,3vw,34px)!important}
.crs-lesson p{margin:16px 0}
.crs-lesson .crs-h{margin:42px 0 14px;padding-top:18px;border-top:1px dashed var(--b);font-size:1.25em}
.crs-lesson .crs-h:first-of-type{border-top:0;margin-top:14px}
.crs-lesson ul,.crs-lesson ol{margin:16px 0;padding-inline-start:30px}
.crs-lesson li{margin:12px 0}
.crs-lesson .crs-math{font-size:calc(1.45em*var(--crs-mz,1))!important;margin:26px 0!important;padding:18px 10px!important;background:color-mix(in srgb,var(--ac) 4%,transparent);border-radius:12px;line-height:1.6}
.crs-lesson .crs-im math{font-size:calc(1.18em*var(--crs-mz,1))!important}
.crs-lesson .crs-call{margin:28px 0!important;padding:18px 20px!important;border-radius:14px}
.crs-lesson .crs-ct{font-size:1.05em;margin-bottom:10px}
.crs-lesson .crs-steps{margin:18px 0}
.crs-lesson .crs-step{margin:20px 0!important;padding:12px 0}
.crs-lesson details{margin:16px 0}
.crs-lesson table{font-size:.95em}
.crs-lesson table th,.crs-lesson table td{padding:12px 14px!important}
/* دکمهٔ «بپرس» روی هر بخش */
.crs-bq{position:relative}
.crs-ask{display:none;margin:0 0 6px;padding:3px 10px;border-radius:14px;border:1px solid var(--ac);background:transparent;color:var(--ac);font:inherit;font-size:12px;line-height:1.6;cursor:pointer;min-height:0}
.crs-bq.sel{outline:2px dashed color-mix(in srgb,var(--ac) 55%,transparent);outline-offset:3px;border-radius:8px}
.crs-bq.sel>.crs-ask{display:inline-block}
#ask-sheet{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.45);display:none;align-items:flex-end;justify-content:center}
#ask-sheet.on{display:flex}
#ask-sheet .box{background:var(--c);color:var(--t);width:min(680px,100%);max-height:88vh;overflow:auto;border-radius:18px 18px 0 0;padding:18px 20px 24px;box-shadow:0 -8px 30px rgba(0,0,0,.3)}
@media (min-width:760px){#ask-sheet{align-items:center}#ask-sheet .box{border-radius:18px}}
#ask-sheet h4{margin:0 0 6px;font-size:1.1em}
#ask-sheet .ctx{background:color-mix(in srgb,var(--ac) 7%,transparent);border-radius:10px;padding:10px 12px;font-size:.88em;max-height:130px;overflow:auto;white-space:pre-wrap;direction:rtl;margin:8px 0 12px;line-height:1.8}
#ask-sheet textarea{width:100%;min-height:90px;border:1px solid var(--b);border-radius:12px;padding:10px 12px;background:var(--bg);color:var(--t);font:inherit;resize:vertical;box-sizing:border-box}
#ask-sheet .chips{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}
#ask-sheet .chips button{border:1px solid var(--b);background:var(--bg);color:var(--t);border-radius:20px;padding:6px 12px;cursor:pointer;font:inherit;font-size:.9em}
#ask-sheet .chips button.sel{background:var(--ac);color:#fff;border-color:var(--ac)}
#ask-sheet .acts{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
#ask-sheet .acts button{border:0;border-radius:12px;padding:11px 16px;cursor:pointer;font:inherit;font-weight:700}
#ask-sheet .go{background:var(--ac);color:#fff}
#ask-sheet .cp{background:var(--bg);color:var(--t);border:1px solid var(--b)!important}
#ask-sheet .x{background:transparent;color:var(--m);border:0}
.crs-lessonbar-ask{display:inline-block;margin:0 0 8px;padding:3px 12px;border-radius:14px;border:1px solid var(--ac);background:transparent;color:var(--ac);font:inherit;font-size:12.5px;line-height:1.7;cursor:pointer;min-height:0}
`;document.head.appendChild(st);
  function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e}
  var sheet=null,cur='';
  function chips(){return [
    [T('این را ساده‌تر و قدم‌به‌قدم توضیح بده','Explain this more simply, step by step'),'این را ساده‌تر و قدم‌به‌قدم توضیح بده'],
    [T('چرا این درست است؟ دلیلش را بگو','Why is this true? Give the reason'),'چرا این درست است؟ دلیلش را بگو'],
    [T('یک مثال دیگر با عدد متفاوت حل کن','Solve another example with different numbers'),'یک مثال دیگر با عدد متفاوت حل کن'],
    [T('کجا ممکن است اشتباه کنم؟ دام‌ها را بگو','Where might I go wrong? List the traps'),'کجا ممکن است اشتباه کنم؟ دام‌ها را بگو'],
    [T('سؤال تستی مشابه بده تا امتحان کنم','Give me a similar test question'),'سؤال تستی مشابه بده تا امتحان کنم']]}
  function build(){
    sheet=el('div');sheet.id='ask-sheet';
    sheet.innerHTML='<div class="box" dir="'+T('rtl','ltr')+'"><h4>❓ '+T('از Claude بپرس','Ask Claude')+'</h4><div style="color:var(--m);font-size:.85em">'+T('این بخش همراه سؤالت آماده می‌شود؛ یک‌بار بزن و در Claude جواب بگیر.','This section is packed with your question. Tap once and get the answer in Claude.')+'</div><div class="ctx" id="ask-ctx"></div><div class="chips" id="ask-chips"></div><textarea id="ask-q" placeholder="'+T('سؤال خودت را بنویس (اختیاری)…','Write your question (optional)…')+'"></textarea><div class="acts"><button class="go" id="ask-go">'+T('باز کردن در Claude ↗','Open in Claude ↗')+'</button><button class="cp" id="ask-cp">'+T('فقط کپی','Copy only')+'</button><button class="x" id="ask-x">'+T('بستن','Close')+'</button></div><div id="ask-msg" style="margin-top:8px;font-size:.85em;color:var(--m)"></div></div>';
    document.body.appendChild(sheet)}
  function open(ctx){
    if(sheet)sheet.remove();build();cur=ctx;
    document.getElementById('ask-ctx').textContent=ctx.slice(0,700)+(ctx.length>700?'…':'');
    var ch=document.getElementById('ask-chips');
    chips().forEach(function(c){var b=el('button',null,c[0]);b.onclick=function(){var q=document.getElementById('ask-q');q.value=c[1];[].forEach.call(ch.children,function(x){x.classList.remove('sel')});b.classList.add('sel')};ch.appendChild(b)});
    sheet.classList.add('on');setTimeout(function(){document.getElementById('ask-q').focus()},50)}
  function promptText(){
    var q=document.getElementById('ask-q').value.trim()||'این بخش را ساده‌تر توضیح بده.';
    return 'من دارم دورهٔ ریاضی کنکور MBA (حد و پیوستگی) را می‌خوانم و این بخش را نفهمیدم. لطفاً کوتاه، شفاف و قدم‌به‌قدم پاسخ بده (فرمول‌ها را زیر هم و واضح بنویس).\n\n— بخش درس —\n'+cur+'\n\n— سؤال من —\n'+q}
  function copy(t){
    try{if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(t).catch(fb)}catch(e){}
    return fb();function fb(){var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy')}catch(e){}a.remove()}}
  function msg(t){var m=document.getElementById('ask-msg');if(m)m.textContent=t}
  function title(){var h=document.querySelector('.crs-lesson h4,.crs-lesson h3,.crs-lesson h2,.crs-lesson b');return h?h.textContent.trim():''}
  function describe(node,whole){
    var parts=[],t=title();if(t)parts.push('درس: '+t);
    var clone=node.cloneNode(true);
    [].forEach.call(clone.querySelectorAll('.crs-ask,button,.np'),function(x){x.remove()});
    [].forEach.call(clone.querySelectorAll('.crs-math'),function(m){var tex=m.getAttribute('aria-label')||m.getAttribute('title')||'';m.replaceWith(document.createTextNode('\n[فرمول] '+tex+'\n'))});
    var txt=(clone.innerText||clone.textContent||'').replace(/\n{3,}/g,'\n\n').trim();
    if(whole&&txt.length>2400)txt=txt.slice(0,2400)+' …';
    parts.push(txt);return parts.join('\n')}
  document.addEventListener('click',function(e){
    var t=e.target;if(!t||!t.closest)return;
    if(t.id==='ask-x'||t===sheet){if(sheet)sheet.classList.remove('on');return}
    if(t.id==='ask-cp'){copy(promptText());msg(T('کپی شد ✓','Copied ✓'));return}
    if(t.id==='ask-go'){var p=promptText();copy(p);window.open('https://claude.ai/new?q='+encodeURIComponent(p.slice(0,3500)),'_blank','noopener');msg(T('متن کپی هم شد؛ اگر صفحه‌ی Claude خالی بود، فقط Paste کن.','Text was copied too; if Claude opens empty, just paste.'));return}
    var q=t.closest('.crs-bq');if(q&&!t.closest('.crs-ask,a,button,input,textarea,select,summary,label')){var was=q.classList.contains('sel');[].forEach.call(document.querySelectorAll('.crs-bq.sel'),function(x){x.classList.remove('sel')});if(!was)q.classList.add('sel')}
    var b=t.closest('.crs-ask');
    if(b){e.preventDefault();e.stopPropagation();open(describe(b.parentElement));return}
    if(t.closest('.crs-lessonbar-ask')){var L=document.querySelector('.crs-lesson');if(L)open(describe(L,true))}
  },true);
  function decorate(){
    var root=document.querySelector('.crs-lesson');
    document.body.classList.toggle('in-crs',!!root);
    if(!root)return;
    if(!root.querySelector(':scope>.crs-lessonbar-ask')){var fab=el('button','crs-lessonbar-ask','❓ '+T('سؤال از این درس','Ask about this lesson'));fab.type='button';root.insertBefore(fab,root.firstChild)}
    [].forEach.call(root.children,function(c){
      if(c.classList.contains('np')||c.classList.contains('row')||c.classList.contains('crs-bq')||c.classList.contains('crs-lessonbar-ask'))return;
      if(!c.textContent.trim()&&!c.querySelector('math'))return;
      c.classList.add('crs-bq');var b=el('button','crs-ask','❓ '+T('این بخش را بپرس','Ask about this part'));b.title=T('این بخش را نفهمیدم — بپرس','I did not get this part — ask');b.type='button';c.insertBefore(b,c.firstChild)})}
  var tm=0;new MutationObserver(function(){clearTimeout(tm);tm=setTimeout(decorate,120)}).observe(document.body,{childList:true,subtree:true});
  decorate();
})();
