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
async function inflateRaw(u8){
  if(typeof DecompressionStream==='undefined')throw new Error('این مرورگر فشرده‌سازی ZIP را پشتیبانی نمی‌کند؛ از Chrome/Edge/Safari جدید استفاده کنید');
  const s=new Blob([u8]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(s).arrayBuffer());
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
    if(x.meth===0)out=raw.slice();else if(x.meth===8)out=await inflateRaw(raw);else throw new Error('روش فشرده‌سازی پشتیبانی نمی‌شود: '+name);
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
  try{const l=await IDB.byCourse('assets',courseId);l.forEach(a=>{CR.blobs.set(a.path,a);CR.urls.set(a.path,URL.createObjectURL(a.blob))});CR.assetCourse=courseId}
  catch(e){CR.assetCourse='';toast('خواندن تصاویر ممکن نشد: '+storeErr(e),1)}
}
const assetUrl=p=>CR.urls.get(String(p))||(CR.pv&&CR.pv.get(String(p)))||'';

/* ---------- renderer: بلوک‌های نوع‌دار؛ هیچ HTML خامی اجرا نمی‌شود ---------- */
const BLK_TYPES=new Set(['p','h','formula','list','table','note','tip','warning','pitfall','def','rule','theorem','quote','example','image','figure','summary','code']);
const CALL={note:['📝','نکته'],tip:['💡','نکته‌ی مهم'],warning:['⚠️','هشدار'],pitfall:['🚧','اشتباه رایج / دام آزمونی'],def:['📘','تعریف'],rule:['📐','قاعده'],theorem:['🧩','قضیه'],quote:['❝','نقل‌قول'],summary:['✅','جمع‌بندی']};
function plainRun(p){return p.split(/([A-Za-z][A-Za-z0-9'’\-]*(?:[ ]+[A-Za-z0-9][A-Za-z0-9'’\-]*)*)/g).map((x,i)=>i%2?'<bdi dir="ltr">'+E_(x)+'</bdi>':E_(x)).join('')}
function mathInline(tex){try{return'<bdi dir="ltr" class="crs-im" title="'+E_(tex)+'">'+tex2mml(tex,false)+'</bdi>'}catch(e){return'<code class="crs-bad" dir="ltr" title="'+E_(e.message)+'">$'+E_(tex)+'$</code>'}}
function inl(text){
  const s=String(text==null?'':text);
  return s.split(/(\$[^$\n]+\$)/g).map(p=>{
    if(p.length>2&&p[0]==='$'&&p.endsWith('$'))return mathInline(p.slice(1,-1));
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
  const img=u?'<a href="'+u+'" target="_blank" rel="noopener" class="crs-orig" title="باز کردن تصویر اصلی"><img src="'+u+'" alt="'+E_(b.alt||'')+'" loading="lazy"></a>':'<div class="crs-bad">تصویر در دسترس نیست: <bdi dir="ltr">'+E_(b.asset)+'</bdi></div>';
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
    case'code':return'<pre class="crs-code" dir="ltr">'+E_(b.text)+'</pre>';
    default:return'<div class="crs-bad">بلوک ناشناخته (نوع: '+E_(t)+') — نمایش داده نشد</div>';
  }
}
function srcName(id){const s=CR.ix.sources&&CR.ix.sources.get(id);return s?s.title:id}

/* ---------- اعتبارسنجی بسته ---------- */
const QTYPES=new Set(['single','multi','numeric','short','essay','match']);
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
function validatePack(P,existing){
  const err=[],warn=[];const E=(m)=>err.push(m),W=(m)=>warn.push(m);
  const M=P.manifest,C=P.course;
  if(!M||M.format!=='dani-course')E('manifest.json: مقدار format باید dani-course باشد');
  if(M&&M.templateVersion!==CRV.template)E('نسخه‌ی قالب پشتیبانی‌نشده: '+M.templateVersion+' (این برنامه فقط نسخه‌ی '+CRV.template+' را می‌شناسد)');
  if(!C||!okId(C.id))E('course.json: شناسه‌ی دوره نامعتبر است (فقط حروف انگلیسی، عدد، _ - . و حداکثر ۶۴ نویسه)');
  if(C&&!C.title)E('course.json: عنوان دوره خالی است');
  if(M&&C&&M.id&&M.id!==C.id)E('شناسه‌ی دوره در manifest و course یکی نیست');
  if(!M||!M.contentVersion||!/^\d+(\.\d+){0,3}$/.test(String(M.contentVersion)))E('manifest.json: contentVersion باید مثل 1.0.0 باشد');
  if(C&&!['fa','en','fa-en'].includes(C.language))W('زبان دوره (language) باید fa، en یا fa-en باشد');
  P.fileErrors.forEach(E);
  const chIds=new Set(),dup=(set,id,what)=>{if(set.has(id))E('شناسه‌ی تکراری ('+what+'): '+id);set.add(id)};
  const chap=(C&&Array.isArray(C.chapters))?C.chapters:[];
  if(!chap.length)E('course.json: هیچ فصلی تعریف نشده است');
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
    if((b.type==='p'||b.type==='h')&&typeof b.text!=='string')W(where+': بلوک متنی بدون text')
  });
  const chkRef=(r,where)=>{if(r&&r.sourceId&&!P.sourceIds.has(r.sourceId))E(where+': ارجاع به منبع ناموجود «'+r.sourceId+'»')};
  P.lessons.forEach(l=>{
    const w='درس '+(l&&l.id||'؟');
    if(!l||!okId(l.id)){E('شناسه‌ی درس نامعتبر: '+(l&&l.id));return}
    dup(lIds,l.id,'درس');if(otherL.has(l.id))E(w+': این شناسه در دوره‌ی دیگری نصب است');
    if(!l.title)E(w+': عنوان ندارد');
    if(!chIds.has(l.chapterId)&&!exCh.has(l.chapterId))E(w+': فصل «'+l.chapterId+'» وجود ندارد');
    else if(!chIds.has(l.chapterId))W(w+': فصل «'+l.chapterId+'» در این بسته نیست و از نسخه‌ی نصب‌شده استفاده می‌شود');
    if(!Array.isArray(l.blocks)||!l.blocks.length)W(w+': محتوای درس خالی است');
    if(l.status&&!LSTAT.has(l.status))W(w+': وضعیت ناشناخته «'+l.status+'»');
    if(l.contentType&&!CTYPES.has(l.contentType))W(w+': contentType ناشناخته «'+l.contentType+'»');
    if(!l.status)W(w+': وضعیت بررسی (status) مشخص نشده — به‌عنوان «نیازمند بررسی» نمایش داده می‌شود');
    chkRef(l.sourceRef,w);chkBlocks(l.blocks,w);
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
    }else if(q.type==='numeric'){if(!a||!isFinite(parseFloat(normDigits(a.value))))E(w+': پاسخ عددی (answer.value) معتبر نیست');else if(a.tol!=null&&!(+a.tol>=0))E(w+': tol نامعتبر')}
    else if(q.type==='short'){if(!a||!Array.isArray(a.accepted)||!a.accepted.filter(x=>String(x).trim()).length)E(w+': فهرست پاسخ‌های پذیرفته (answer.accepted) خالی است')}
    else if(q.type==='match'){const p=Array.isArray(q.pairs)?q.pairs:[];if(p.length<2||p.some(x=>!x||x.l==null||x.r==null))E(w+': تطبیق حداقل دو جفت معتبر (pairs) می‌خواهد')}
    else if(q.type==='essay'){if(!q.solution&&!q.modelAnswer)W(w+': سؤال تشریحی بدون پاسخ نمونه؛ تصحیح فقط با خودارزیابی است')}
  });
  assets.forEach((a,p)=>{if(!refAssets.has(p))W('فایل بدون استفاده در بسته: '+p)});
  // ارجاع درس‌ها به فصل‌های تهی
  chap.forEach(c=>{if(c&&c.id&&!P.lessons.some(l=>l.chapterId===c.id)&&!(existing&&CR.cache.lessons.some(l=>l.courseId===existing.id&&l.chapterId===c.id)))W('فصل «'+c.id+'» هیچ درسی ندارد')});
  return{errors:err,warnings:warn};
}
/* ---------- خواندن بسته از ZIP ---------- */
async function readJSON(z,name,list){
  const u=await z.read(name);if(u.length>LIM.json)throw new Error('فایل JSON بسیار بزرگ: '+name);
  try{return JSON.parse(dec.decode(u).replace(/^\uFEFF/,''))}catch(e){throw new Error(name+': JSON نامعتبر — '+e.message)}
}
async function loadPackZip(z){
  const P={manifest:null,course:null,lessons:[],questions:[],sources:[],assets:new Map(),sourceIds:new Set(),fileErrors:[],names:[...z.ents.keys()]};
  if(!z.ents.has('manifest.json'))throw new Error('manifest.json در بسته نیست — این فایل بسته‌ی دوره‌ی DANI نیست');
  P.manifest=await readJSON(z,'manifest.json');
  const F=P.manifest.files||{};
  const cf=F.course||'course.json';
  try{P.course=await readJSON(z,cf)}catch(e){P.fileErrors.push(e.message)}
  const pick=(arr,rx)=>Array.isArray(arr)?arr:P.names.filter(n=>rx.test(n)).sort();
  for(const n of pick(F.lessons,/^lessons\/.+\.json$/)){try{const j=await readJSON(z,n);(Array.isArray(j)?j:Array.isArray(j.lessons)?j.lessons:[j]).forEach(x=>P.lessons.push(x))}catch(e){P.fileErrors.push(e.message)}}
  for(const n of pick(F.questions,/^questions\/.+\.json$/)){try{const j=await readJSON(z,n);(Array.isArray(j)?j:Array.isArray(j.questions)?j.questions:[j]).forEach(x=>P.questions.push(x))}catch(e){P.fileErrors.push(e.message)}}
  const sf=F.sources||(z.ents.has('sources.json')?'sources.json':null);
  if(sf){try{const j=await readJSON(z,sf);(Array.isArray(j)?j:Array.isArray(j.sources)?j.sources:[j]).forEach(x=>P.sources.push(x))}catch(e){P.fileErrors.push(e.message)}}
  P.sources.forEach(s=>s&&s.id&&P.sourceIds.add(s.id));
  for(const n of P.names){if(!n.startsWith('assets/'))continue;const ext=extOf(n);
    if(!MIME[ext]){P.fileErrors.push('نوع فایل مجاز نیست (فقط png/jpg/gif/webp/svg): '+n);continue}
    try{const u=await z.read(n);P.assets.set(n,{path:n,mime:MIME[ext],data:u})}catch(e){P.fileErrors.push(e.message)}}
  P.sizeKB=Math.round([...P.assets.values()].reduce((s,a)=>s+a.data.length,0)/1024);
  return P;
}
/* ---------- برنامه‌ی ورود / به‌روزرسانی ---------- */
const lhash=o=>hashStr(JSON.stringify(o));
const normLesson=(l,i)=>({...l,order:+l.order||i+1,topics:Array.isArray(l.topics)?l.topics:[],status:l.status||'needs_review'});
const normQuestion=q=>({...q,difficulty:[1,2,3].includes(+q.difficulty)?+q.difficulty:2,lessonIds:Array.isArray(q.lessonIds)?q.lessonIds:[],topicIds:Array.isArray(q.topicIds)?q.topicIds:[]});
function normalizePack(P){P.lessons=P.lessons.map(normLesson);P.questions=P.questions.map(normQuestion)}
function planPack(P){
  const C=P.course,ex=CR.ix.courses.get(C.id)||null;
  const pl={mode:ex?'update':'new',existing:ex,newV:P.manifest.contentVersion,oldV:ex&&ex.contentVersion,
    L:{n:0,u:0,s:0},Q:{n:0,u:0,s:0},keptL:0,keptQ:0,chapters:[],progressTouched:[],orphans:[]};
  const exL=new Map(CR.cache.lessons.filter(l=>l.courseId===C.id).map(l=>[l.id,l])),exQ=new Map(CR.cache.questions.filter(q=>q.courseId===C.id).map(q=>[q.id,q]));
  const newLids=new Set(P.lessons.map(l=>l.id)),newQids=new Set(P.questions.map(q=>q.id));
  P.lessons.forEach(l=>{const o=exL.get(l.id),h=lhash(l);Object.defineProperty(l,'__h',{value:h,enumerable:false,writable:true});if(!o)pl.L.n++;else if(o.hash!==h){pl.L.u++;const p=CR.ix.progress.get(l.id);if(p&&p.done)pl.progressTouched.push(l.title||l.id)}else pl.L.s++});
  P.questions.forEach(q=>{const o=exQ.get(q.id),h=lhash(q);Object.defineProperty(q,'__h',{value:h,enumerable:false,writable:true});if(!o)pl.Q.n++;else if(o.hash!==h)pl.Q.u++;else pl.Q.s++});
  exL.forEach((l,id)=>{if(!newLids.has(id))pl.keptL++});exQ.forEach((q,id)=>{if(!newQids.has(id))pl.keptQ++});
  (C.chapters||[]).forEach(c=>{const ls=P.lessons.filter(l=>l.chapterId===c.id);const isNew=!ex||!ex.chapters.some(x=>x.id===c.id);
    const changed=ls.some(l=>{const o=exL.get(l.id);return !o||o.hash!==l.__h});pl.chapters.push({id:c.id,title:c.title,lessons:ls.length,state:isNew?'new':changed?'updated':'same'})});
  pl.cmp=ex?cmpVer(pl.newV,pl.oldV):1;
  pl.nothing=ex&&!pl.L.n&&!pl.L.u&&!pl.Q.n&&!pl.Q.u&&cmpVer(pl.newV,pl.oldV)===0;
  return pl;
}
async function commitPack(P,pl){
  const C=P.course,now=nowISO(),ex=pl.existing;
  const chMap=new Map((ex?ex.chapters:[]).map(c=>[c.id,c]));
  (C.chapters||[]).forEach((c,i)=>chMap.set(c.id,{id:c.id,title:String(c.title||c.id),description:c.description?String(c.description):'',order:+c.order||i+1}));
  const chapters=[...chMap.values()].sort((a,b)=>a.order-b.order);
  const course={id:C.id,title:String(C.title),description:String(C.description||''),language:C.language||'fa',contentVersion:String(P.manifest.contentVersion),templateVersion:P.manifest.templateVersion,
    topics:Array.isArray(C.topics)?C.topics.filter(t=>t&&t.id).map(t=>({id:String(t.id),title:String(t.title||t.id)})):(ex?ex.topics||[]:[]),goals:Array.isArray(C.goals)?C.goals.map(String):(ex?ex.goals:[]),prerequisites:Array.isArray(C.prerequisites)?C.prerequisites.map(String):(ex?ex.prerequisites:[]),chapters,
    importedAt:ex?ex.importedAt:now,updatedAt:now,log:[...(ex?ex.log||[]:[]),{at:now,version:String(P.manifest.contentVersion),mode:pl.mode,lessons:pl.L,questions:pl.Q}].slice(-30)};
  const lessons=P.lessons.map(l=>{const x={...l,courseId:C.id,hash:l.__h,v:course.contentVersion};delete x.__h;return x});
  const questions=P.questions.map(q=>{const x={...q,courseId:C.id,hash:q.__h,v:course.contentVersion};delete x.__h;return x});
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
  });
  CR.assetCourse='';
  await crLoad();
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
    if(q.type==='single')return{auto:true,ok:String(a)===String(q.answer.choice)};
    if(q.type==='multi'){const x=[...a].map(String).sort().join('|'),y=q.answer.choices.map(String).sort().join('|');return{auto:true,ok:x===y}}
    if(q.type==='numeric'){const v=parseFloat(normDigits(q.answer.value)),u=parseFloat(normDigits(a));if(!isFinite(u))return{auto:true,ok:false};const tol=+q.answer.tol||0,rel=+q.answer.rel||0;return{auto:true,ok:Math.abs(u-v)<=Math.max(tol,rel*Math.abs(v),1e-9)}}
    if(q.type==='short'){const u=normTxt(a);return{auto:true,ok:q.answer.accepted.some(x=>normTxt(x)===u)}}
    if(q.type==='match'){return{auto:true,ok:q.pairs.every((p,i)=>a[i]!=null&&String(a[i])===String(p.r))}}
  }catch(e){}
  return{auto:false,ok:null};
}
const chLabel=c=>String(c.label||c.id);
function chHTML(c){return'<span class="crs-cl">'+E_(chLabel(c))+'</span><span class="crs-ctx">'+(c.blocks?blocks(c.blocks):(c.text!=null?inl(c.text):''))+(c.image?figHTML({asset:c.image,alt:c.alt||'',caption:''}):'')+'</span>'}
function ansText(q,a){
  if(a==null||a===''||(Array.isArray(a)&&!a.length))return'<span class="m">بدون پاسخ</span>';
  if(q.type==='single'){const c=(q.choices||[]).find(x=>String(x.id)===String(a));return c?'<b>'+E_(chLabel(c))+'</b> '+(c.text?inl(c.text):''):E_(a)}
  if(q.type==='multi'){return(a||[]).map(id=>{const c=(q.choices||[]).find(x=>String(x.id)===String(id));return c?'<b>'+E_(chLabel(c))+'</b>':E_(id)}).join('، ')}
  if(q.type==='match')return q.pairs.map((p,i)=>inl(p.l)+' ← '+(a[i]!=null?inl(a[i]):'—')).join('<br>');
  if(q.type==='essay')return'<div dir="auto" style="white-space:pre-wrap">'+E_(a)+'</div>';
  return'<bdi dir="auto">'+E_(a)+'</bdi>';
}
function correctText(q){
  if(q.type==='single')return ansText(q,q.answer.choice);
  if(q.type==='multi')return ansText(q,q.answer.choices);
  if(q.type==='numeric')return'<bdi dir="ltr">'+E_(q.answer.value)+'</bdi>'+(q.answer.tol?' <span class="m">(± '+E_(q.answer.tol)+')</span>':'');
  if(q.type==='short')return q.answer.accepted.map(x=>'<bdi dir="auto">'+E_(x)+'</bdi>').join(' / ');
  if(q.type==='match')return q.pairs.map(p=>inl(p.l)+' ← '+inl(p.r)).join('<br>');
  return q.modelAnswer?(typeof q.modelAnswer==='string'?inl(q.modelAnswer):blocks(q.modelAnswer)):'<span class="m">معیار قطعی ندارد؛ پاسخ نمونه/راه‌حل را ببینید</span>';
}
function stemHTML(q){
  let st=Array.isArray(q.stem)?q.stem:[{type:'p',text:q.stem}];
  const imgs=st.filter(b=>b&&(b.type==='image'||b.type==='figure')),rest=st.filter(b=>!(b&&(b.type==='image'||b.type==='figure')));
  if(q.image)imgs.push({type:'image',asset:q.image,alt:q.imageAlt||'',caption:q.imageCaption||''});
  const main=blocks(rest)+(q.type==='match'?'':''),side=imgs.map(figHTML).join('');
  return side?'<div class="crs-qrow"><div class="crs-qm">'+main+'</div><div class="crs-qs">'+side+'</div></div>':main;
}
function srcLine(r){if(!r||!r.sourceId)return'';return'<div class="m crs-src">📚 '+E_(srcName(r.sourceId))+(r.chapter?' · فصل '+E_(r.chapter):'')+(r.page!=null?' · صفحه '+E_(r.page):'')+'</div>'}
const gArr=(q)=>!!q;
/* ---------- آمار ---------- */
function latestResults(cid){ // آخرین نتیجه‌ی هر سؤال
  const m=new Map();
  CR.cache.attempts.filter(a=>a.courseId===cid&&a.status==='done').sort((a,b)=>a.finishedAt-b.finishedAt).forEach(a=>{Object.entries(a.items||{}).forEach(([qid,it])=>{const ok=it.ok!=null?it.ok:(it.self==='right'?true:it.self==='wrong'?false:null);if(ok!=null)m.set(qid,{ok,at:a.finishedAt})})});
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
  let tq=0,ok=0;att.forEach(a=>Object.values(a.items||{}).forEach(i=>{if(i.ok!=null){tq++;if(i.ok)ok++}}));
  const act=CR.cache.attempts.filter(a=>a.status==='active');
  let h='<div class="g g4"><div class="c"><h3>دوره‌ها</h3><div class="big">'+faN(cs.length)+'</div></div><div class="c"><h3>درس‌های کامل‌شده</h3><div class="big">'+faN(CR.cache.progress.filter(p=>p.done).length)+'</div></div><div class="c"><h3>دقت آزمون‌ها</h3><div class="big">'+(tq?faN(Math.round(ok/tq*100))+'٪':'—')+'</div><div class="m" style="text-align:center">'+faN(tq)+' پاسخ تصحیح‌شده</div></div><div class="c"><h3>اشتباهات باز</h3><div class="big">'+faN(unresolved())+'</div></div></div>';
  if(last){const l=CR.ix.lessons.get(last.id);if(l)h+='<div class="c"><h3>ادامه‌ی مطالعه</h3><b dir="auto">'+E_(l.title)+'</b> <span class="m">· '+E_((CR.ix.courses.get(l.courseId)||{}).title||'')+'</span><div class="row" style="margin-top:8px"><button class="p" data-a="crs_open" data-c="'+E_(l.courseId)+'" data-l="'+E_(l.id)+'">ادامه</button></div></div>'}
  if(act.length)h+='<div class="c"><h3>آزمون نیمه‌تمام</h3>'+act.map(a=>'<div class="row"><span>'+E_((CR.ix.courses.get(a.courseId)||{}).title||a.courseId)+' · '+(a.mode==='exam'?'آزمون':'تمرین')+' · '+faN(a.qids.length)+' سؤال</span><button class="p" data-a="crs_resume" data-id="'+E_(a.id)+'">ادامه</button></div>').join('')+'</div>';
  h+=cs.map(c=>{const p=courseProg(c.id);return'<div class="c"><div class="row"><h3 class="sp" dir="auto">'+E_(c.title)+'</h3><span class="m">نسخه‌ی '+E_(c.contentVersion)+'</span></div>'+bar(p.p)+'<div class="m">'+faN(p.done)+' از '+faN(p.n)+' درس · '+faN(questionsOf(c.id).length)+' سؤال</div><div class="row" style="margin-top:8px"><button class="p" data-a="crs_open" data-c="'+E_(c.id)+'">باز کردن</button><button data-a="crs_qstart" data-c="'+E_(c.id)+'" data-s="all" data-m="exam">آزمون جامع</button></div></div>'}).join('');
  return h;
}
function vCourses(){
  if(CR.lessonId)return vStudy();
  if(CR.courseId&&course())return vCourse();
  const cs=CR.cache.courses;if(!cs.length)return empty();
  return'<div class="g g2">'+cs.map(c=>{const p=courseProg(c.id);return'<div class="c"><h3 dir="auto">'+E_(c.title)+'</h3><p class="m" dir="auto">'+E_(c.description)+'</p>'+bar(p.p)+'<div class="m">'+faN(c.chapters.length)+' فصل · '+faN(p.n)+' درس · '+faN(questionsOf(c.id).length)+' سؤال · زبان: '+E_(c.language)+'</div><button class="p" data-a="crs_open" data-c="'+E_(c.id)+'" style="margin-top:8px">باز کردن</button></div>'}).join('')+'</div>';
}
function vCourse(){
  const c=course(),L=lessonsOf(c.id);
  let h='<div class="c"><div class="row"><button data-a="crs_back">‹ فهرست دوره‌ها</button><h3 class="sp" dir="auto">'+E_(c.title)+'</h3></div><p dir="auto">'+E_(c.description)+'</p>';
  if(c.goals&&c.goals.length)h+='<b>اهداف یادگیری</b><ul dir="auto">'+c.goals.map(g=>'<li>'+inl(g)+'</li>').join('')+'</ul>';
  if(c.prerequisites&&c.prerequisites.length)h+='<div class="m">پیش‌نیاز: '+c.prerequisites.map(x=>E_(x)).join('، ')+'</div>';
  h+='</div>';
  c.chapters.forEach(ch=>{const ls=L.filter(l=>l.chapterId===ch.id),d=ls.filter(l=>{const p=CR.ix.progress.get(l.id);return p&&p.done}).length;
    h+='<div class="c"><div class="row"><h3 class="sp" dir="auto">'+E_(ch.title)+'</h3><span class="m">'+faN(d)+'/'+faN(ls.length)+'</span><button data-a="crs_qstart" data-c="'+E_(c.id)+'" data-s="chapter:'+E_(ch.id)+'" data-m="practice">تمرین فصل</button><button data-a="crs_qstart" data-c="'+E_(c.id)+'" data-s="chapter:'+E_(ch.id)+'" data-m="exam">آزمون فصل</button></div>'+bar(ls.length?d/ls.length*100:0)+
    (ls.length?ls.map(l=>{const p=CR.ix.progress.get(l.id),bm=CR.ix.bookmarks.has('b_lesson_'+l.id);return'<div class="cwr"><span>'+(p&&p.done?'✅ ':'⬜ ')+'<a data-a="crs_open" data-c="'+E_(c.id)+'" data-l="'+E_(l.id)+'" tabindex="0" style="cursor:pointer;color:var(--ac)" dir="auto">'+E_(l.title)+'</a> '+(bm?'★ ':'')+stBadge(l)+ctBadge(l)+'</span></div>'}).join(''):'<p class="m">این فصل هنوز درسی ندارد.</p>')+'</div>'});
  return h;
}
function vStudy(){
  const l=CR.ix.lessons.get(CR.lessonId);if(!l){CR.lessonId='';return vCourses()}
  const c=CR.ix.courses.get(l.courseId),p=CR.ix.progress.get(l.id)||{},L=lessonsOf(l.courseId),i=L.findIndex(x=>x.id===l.id),ch=c.chapters.find(x=>x.id===l.chapterId);
  const qs=questionsOf(l.courseId).filter(q=>q.lessonIds.includes(l.id)),by=d=>qs.filter(q=>q.difficulty===d).length;
  let h='<div class="c crs-lesson" data-nobi style="--crs-mz:'+CR.mz+'"><div class="row np"><button data-a="crs_open" data-c="'+E_(c.id)+'">‹ '+E_(c.title)+'</button><span class="m">'+E_(ch?ch.title:'')+'</span><span class="sp"></span><button data-a="crs_mz" data-d="-1" title="کوچک‌کردن فرمول">A−</button><button data-a="crs_mz" data-d="1" title="بزرگ‌کردن فرمول">A+</button></div>'+
   '<h2 dir="auto" style="margin:8px 0">'+E_(l.title)+'</h2><div>'+stBadge(l)+ctBadge(l)+'</div>';
  if(p.done&&p.doneHash&&p.doneHash!==l.hash)h+='<div class="crs-call crs-warning"><div class="crs-ct">⚠️ این درس پس از تکمیل شما به‌روزرسانی شده است</div><button data-a="crs_ack" data-l="'+E_(l.id)+'">مرور شد</button></div>';
  if((l.prerequisites&&l.prerequisites.length)||(l.goals&&l.goals.length))h+='<div class="crs-call crs-note"><div class="crs-ct">🎯 پیش‌نیاز و اهداف</div>'+(l.prerequisites&&l.prerequisites.length?'<div>پیش‌نیاز: '+l.prerequisites.map(x=>inl(x)).join('، ')+'</div>':'')+(l.goals&&l.goals.length?'<ul dir="auto">'+l.goals.map(g=>'<li>'+inl(g)+'</li>').join('')+'</ul>':'')+'</div>';
  h+='<div class="crs-body">'+blocks(l.blocks)+'</div>';
  if(l.summary)h+=blk({type:'summary',title:'جمع‌بندی',...(typeof l.summary==='string'?{text:l.summary}:{blocks:l.summary})},0);
  if(Array.isArray(l.checklist)&&l.checklist.length){const ck=p.checks||{};h+='<div class="crs-call crs-tip"><div class="crs-ct">☑ چک‌لیست تسلط</div>'+l.checklist.map((x,k)=>'<label class="crs-ck"><input type="checkbox" data-a="crs_ck" data-l="'+E_(l.id)+'" data-k="'+k+'" '+(ck[k]?'checked':'')+'> <span dir="auto">'+inl(x)+'</span></label>').join('')+'</div>'}
  h+=srcLine(l.sourceRef);
  h+='<div class="row" style="margin-top:10px"><button class="'+(p.done?'':'p')+'" data-a="crs_done" data-l="'+E_(l.id)+'">'+(p.done?'↩ برگرداندن به ناتمام':'✓ این درس را تمام کردم')+'</button><button data-a="crs_bm" data-k="lesson" data-r="'+E_(l.id)+'">'+(CR.ix.bookmarks.has('b_lesson_'+l.id)?'★ نشانک شد':'☆ نشانک')+'</button></div></div>';
  h+='<div class="c"><h3>تمرین و تست این درس</h3>'+(qs.length?'<div class="m">'+faN(by(1))+' آسان · '+faN(by(2))+' متوسط · '+faN(by(3))+' دشوار</div><div class="row" style="margin-top:8px">'+[1,2,3].map(d=>by(d)?'<button data-a="crs_qstart" data-c="'+E_(c.id)+'" data-s="lesson:'+E_(l.id)+'" data-m="practice" data-d="'+d+'">تمرین '+['آسان','متوسط','دشوار'][d-1]+'</button>':'').join('')+'<button class="p" data-a="crs_qstart" data-c="'+E_(c.id)+'" data-s="lesson:'+E_(l.id)+'" data-m="exam">آزمون این درس</button></div>':'<p class="m">هنوز سؤالی به این درس پیوند نخورده است.</p>')+'</div>';
  const ns=CR.cache.notes.filter(n=>n.lessonId===l.id).sort((a,b)=>b.at-a.at);
  h+='<div class="c"><h3>یادداشت‌های من</h3><textarea id="crs-note" rows="3" dir="auto" placeholder="یادداشت درباره‌ی این درس…"></textarea><button data-a="crs_note" data-l="'+E_(l.id)+'">ذخیره‌ی یادداشت</button>'+ns.map(n=>'<div class="cwr"><span dir="auto" style="white-space:pre-wrap">'+E_(n.text)+' <small class="m">'+new Date(n.at).toLocaleDateString('fa-IR')+'</small></span><button class="d" data-a="crs_notedel" data-id="'+E_(n.id)+'">✕</button></div>').join('')+'</div>';
  h+='<div class="row">'+(i>0?'<button data-a="crs_open" data-c="'+E_(c.id)+'" data-l="'+E_(L[i-1].id)+'">‹ درس قبلی</button>':'')+'<span class="sp"></span>'+(i<L.length-1?'<button class="p" data-a="crs_open" data-c="'+E_(c.id)+'" data-l="'+E_(L[i+1].id)+'">درس بعدی ›</button>':'')+'</div>';
  return h;
}
function vErrors(){
  const l=CR.cache.errors.slice().sort((a,b)=>b.lastAt-a.lastAt);
  if(!l.length)return'<div class="c"><h3>دفترچه‌ی خطا</h3><p class="m">هنوز اشتباهی ثبت نشده است. اشتباه‌های آزمون‌ها به‌صورت خودکار اینجا جمع می‌شوند.</p></div>';
  const causes=['ندانستن مفهوم','اشتباه محاسباتی','بی‌دقتی در خواندن','کمبود زمان','حدس زدن','اشتباه در روش'];
  const cnt={};l.forEach(e=>{if(e.cause)cnt[e.cause]=(cnt[e.cause]||0)+1});
  let h='<div class="c"><div class="row"><h3 class="sp">دفترچه‌ی خطا ('+faN(unresolved())+' باز از '+faN(l.length)+')</h3>'+(unresolved()?'<button class="p" data-a="crs_errprac">تمرین مجدد اشتباهات باز</button>':'')+'</div>'+(Object.keys(cnt).length?'<div class="m">علت‌ها: '+Object.entries(cnt).map(([k,v])=>E_(k)+' ×'+faN(v)).join(' · ')+'</div>':'')+'</div>';
  l.forEach(e=>{const q=CR.ix.questions.get(e.qid);if(!q){h+='<div class="c" style="opacity:.6">سؤال حذف‌شده یا هنوز نصب‌نشده: '+E_(e.qid)+'</div>';return}
    h+='<div class="c" style="'+(e.resolved?'opacity:.6':'')+'"><div class="m">'+E_(topicName(q.courseId,(q.topicIds||[])[0]||''))+' · دشواری '+faN(q.difficulty)+' · '+faN(e.count||1)+' بار اشتباه</div><details><summary dir="auto">'+(typeof q.stem==='string'?inl(q.stem).slice(0,200):'مشاهده‌ی سؤال')+'</summary><div class="crs-lesson" data-nobi style="--crs-mz:'+CR.mz+'">'+stemHTML(q)+'<div class="crs-ans"><b>پاسخ صحیح:</b> '+correctText(q)+'</div>'+(q.solution?'<div class="crs-sol"><b>راه‌حل:</b>'+blocks(q.solution)+'</div>':'')+'</div></details><div class="row" style="margin-top:6px"><select data-crs-cause="'+E_(e.id)+'"><option value="">علت اشتباه…</option>'+causes.map(x=>'<option '+(e.cause===x?'selected':'')+'>'+x+'</option>').join('')+'</select><input data-crs-enote="'+E_(e.id)+'" value="'+E_(e.note||'')+'" placeholder="یادداشت" style="flex:1;min-width:120px"><button data-a="crs_erres" data-id="'+E_(e.id)+'">'+(e.resolved?'↩ بازگشایی':'✓ حل شد')+'</button></div></div>'});
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
  CR.cache.courses.forEach(c=>{
    const L=lessonsOf(c.id),Q=questionsOf(c.id),ss=S.filter(s=>s.courseId===c.id);
    const cnt=(arr,f)=>arr.filter(f).length,typ=Object.keys(CT_FA).map(k=>CT_FA[k]+': '+faN(cnt(L,l=>l.contentType===k))+'/'+faN(cnt(Q,q=>q.contentType===k))).join(' · ');
    h+='<div class="c"><h3 dir="auto">'+E_(c.title)+'</h3><div class="m">نوع محتوا (درس/سؤال) — '+typ+'</div><div class="m">وضعیت بررسی دروس: تأییدشده/کامل '+faN(cnt(L,l=>l.status==='approved'||l.status==='complete'))+' · نیازمند بررسی/پیش‌نویس/ناقص '+faN(cnt(L,l=>l.status!=='approved'&&l.status!=='complete'))+' از '+faN(L.length)+'</div></div>';
    if(!ss.length){h+='<div class="c"><p class="m">برای این دوره منبعی ثبت نشده است؛ پوشش را نمی‌توان سنجید.</p></div>';return}
    ss.forEach(s=>{const chs=Array.isArray(s.chapters)?s.chapters:[];let cov=0;
      const rows=chs.map(x=>{const nl=L.filter(l=>l.sourceRef&&l.sourceRef.sourceId===s.id&&String(l.sourceRef.chapter)===String(x.id)).length,nq=Q.filter(q=>q.sourceRef&&q.sourceRef.sourceId===s.id&&String(q.sourceRef.chapter)===String(x.id)).length;if(nl||nq)cov++;
        return'<tr><td dir="auto">'+E_(x.title||x.id)+'</td><td>'+badge(SRC_FA[x.status]||'بررسی‌نشده',{processed:'#16a34a',partial:'#ea580c',unreadable:'#dc2626',pending:'#64748b'}[x.status]||'#64748b')+'</td><td>'+faN(nl)+'</td><td>'+faN(nq)+'</td><td class="m" dir="auto">'+(Array.isArray(x.issues)&&x.issues.length?x.issues.map(E_).join('؛ '):'')+'</td></tr>'}).join('');
      const bad=chs.filter(x=>x.status!=='processed').length;
      h+='<div class="c"><h3 dir="auto">📚 '+E_(s.title||s.id)+'</h3><div class="m">'+E_([s.author,s.kind].filter(Boolean).join(' · '))+'</div>'+(chs.length?'<p>فصل‌های دارای محتوا: <b>'+faN(cov)+'</b> از <b>'+faN(chs.length)+'</b> فصل ثبت‌شده در فهرست منبع'+(bad?' · <span style="color:var(--wr)">'+faN(bad)+' فصل ناقص/ناخوانا/پردازش‌نشده</span>':'')+'</p><div class="crs-tw"><table><tr><th>فصل منبع</th><th>وضعیت</th><th>درس</th><th>سؤال</th><th>ملاحظات</th></tr>'+rows+'</table></div><p class="m">این آمار فقط بر پایه‌ی فهرست فصل‌هایی است که در بسته ثبت شده؛ کامل‌بودن پوشش کتاب بدون مقایسه با فهرست واقعی کتاب تأیید نمی‌شود.</p>':'<p class="m">فهرست فصل‌های این منبع ثبت نشده؛ پوشش قابل سنجش نیست.</p>')+'</div>'})});
  return h;
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
function pool(cid,scope,diffs){
  let Q=questionsOf(cid);scope=scope||'all';
  if(scope.startsWith('chapter:')){const ids=new Set(lessonsOf(cid).filter(l=>l.chapterId===scope.slice(8)).map(l=>l.id));Q=Q.filter(q=>q.lessonIds.some(i=>ids.has(i)))}
  else if(scope.startsWith('lesson:'))Q=Q.filter(q=>q.lessonIds.includes(scope.slice(7)));
  else if(scope.startsWith('topic:'))Q=Q.filter(q=>q.topicIds.includes(scope.slice(6)));
  else if(scope==='wrong'){const w=new Set(CR.cache.errors.filter(e=>!e.resolved&&e.courseId===cid).map(e=>e.qid));Q=Q.filter(q=>w.has(q.id))}
  else if(scope==='flagged'){const f=new Set();CR.cache.attempts.forEach(a=>Object.entries(a.items||{}).forEach(([q,i])=>{if(i.flag)f.add(q)}));Q=Q.filter(q=>f.has(q.id))}
  if(diffs&&diffs.length)Q=Q.filter(q=>diffs.includes(q.difficulty));
  return Q;
}
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
async function startQuiz(o){
  const Q=pool(o.courseId,o.scope,o.diffs);
  if(!Q.length){msg('err','سؤالی با این شرایط پیدا نشد. دامنه یا سطح دشواری را عوض کنید.');CR.tab='quiz';rerender();return}
  let ids=(o.shuffle===false?Q:shuffle(Q)).map(q=>q.id);if(o.count>0)ids=ids.slice(0,o.count);
  const a={id:uid('a_'),courseId:o.courseId,mode:o.mode||'exam',timed:!!o.timed,limitSec:o.timed?Math.max(1,o.minutes||30)*60:0,startedAt:Date.now(),finishedAt:0,status:'active',qids:ids,items:{},used:0,scope:o.scope||'all'};
  await crAssets(o.courseId);
  CR.quiz=a;CR.qi=0;CR.qStart=Date.now();CR.resumedAt=Date.now();CR.tab='quiz';CR.keyId='';CR.msg=null;
  await putUser('attempts',a);armTimer();rerender();
}
const curItem=()=>{const q=CR.quiz;const id=q.qids[CR.qi];return q.items[id]||(q.items[id]={answer:null,ms:0,flag:false,checked:false,ok:null})};
function touchQ(){if(!CR.quiz||!CR.qStart)return;const it=curItem(),ms=Date.now()-CR.qStart;if(ms<3600e3)it.ms=(it.ms||0)+ms;CR.qStart=Date.now()}
let persistT=0;function persistSoon(){clearTimeout(persistT);persistT=setTimeout(()=>{if(CR.quiz)putUser('attempts',CR.quiz).catch(e=>toast(storeErr(e),1))},400)}
const usedMs=()=>CR.quiz?(CR.quiz.used||0)+(Date.now()-(CR.resumedAt||Date.now())):0;
function armTimer(){clearInterval(CR.tmr);CR.tmr=null;if(CR.quiz&&CR.quiz.timed){CR.tmr=setInterval(()=>{if(!CR.quiz){clearInterval(CR.tmr);return}const left=Math.max(0,CR.quiz.limitSec*1000-usedMs()),e=document.getElementById('crs-timer');if(e){const s=Math.ceil(left/1000);e.textContent=faN(String(Math.floor(s/60)).padStart(2,'0'))+':'+faN(String(s%60).padStart(2,'0'));e.classList.toggle('crs-low',s<60)}if(left<=0){clearInterval(CR.tmr);toast('زمان آزمون تمام شد؛ پاسخ‌ها تصحیح شد');submitQuiz(true)}},500)}}
async function resumeQuiz(id){const a=CR.ix.attempts.get(id);if(!a||a.status!=='active')return;await crAssets(a.courseId);CR.quiz=a;CR.qi=Math.min(a.qi||0,a.qids.length-1);CR.qStart=Date.now();CR.resumedAt=Date.now();CR.tab='quiz';CR.keyId='';armTimer();rerender()}
function leaveQuiz(){if(!CR.quiz)return;touchQ();CR.quiz.used=usedMs();CR.quiz.qi=CR.qi;CR.resumedAt=Date.now();clearTimeout(persistT);putUser('attempts',CR.quiz).catch(()=>{})}
async function recordErrors(a){
  const now=Date.now();
  for(const qid of a.qids){const it=a.items[qid]||{},q=CR.ix.questions.get(qid);if(!q)continue;
    const ok=it.ok!=null?it.ok:(it.self==='right'?true:it.self==='wrong'?false:null);const old=CR.ix.errors.get('e_'+qid);
    if(ok===false){await putUser('errors',{...(old||{}),id:'e_'+qid,qid,courseId:a.courseId,attemptId:a.id,at:(old&&old.at)||now,lastAt:now,count:((old&&old.count)||0)+1,cause:(old&&old.cause)||'',note:(old&&old.note)||'',resolved:false,yourAnswer:it.answer,correctStreak:0})}
    else if(ok===true&&old){await putUser('errors',{...old,correctStreak:(old.correctStreak||0)+1})}}
}
async function submitQuiz(auto){
  const a=CR.quiz;if(!a)return;touchQ();a.used=usedMs();clearInterval(CR.tmr);
  let ok=0,tot=0,pend=0;
  a.qids.forEach(id=>{const q=CR.ix.questions.get(id),it=a.items[id]||(a.items[id]={answer:null,ms:0,flag:false});if(!q)return;const g=grade(q,it.answer);it.ok=g.ok;it.skipped=!!g.skipped;if(g.auto){tot++;if(g.ok)ok++}else pend++});
  a.status='done';a.finishedAt=Date.now();a.score={ok,total:tot,pending:pend};
  CR.quiz=null;CR.keyId=a.id;
  await putUser('attempts',a);await recordErrors(a);
  rerender();
}
function selfGrade(qid,v){const a=CR.ix.attempts.get(CR.keyId);if(!a)return;const it=a.items[qid]||(a.items[qid]={});it.self=v;putUser('attempts',a).then(()=>recordErrors(a)).then(rerender).catch(e=>toast(storeErr(e),1))}
function qInput(q,it,locked){
  const dis=locked?' disabled':'',a=it.answer;
  if(q.type==='single'||q.type==='multi'){
    return'<div class="crs-chs">'+(q.choices||[]).map(c=>{const on=q.type==='single'?String(a)===String(c.id):(a||[]).map(String).includes(String(c.id));
      return'<label class="crs-ch '+(on?'on':'')+'"><input type="'+(q.type==='single'?'radio':'checkbox')+'" name="crq" data-crq="'+q.type+'" value="'+E_(c.id)+'" '+(on?'checked':'')+dis+'>'+chHTML(c)+'</label>'}).join('')+'</div>'}
  if(q.type==='numeric')return'<input data-crq="text" inputmode="decimal" dir="ltr" value="'+E_(a||'')+'" placeholder="پاسخ عددی" style="max-width:240px"'+dis+'>';
  if(q.type==='short')return'<input data-crq="text" dir="auto" value="'+E_(a||'')+'" placeholder="پاسخ کوتاه" style="width:100%;max-width:420px"'+dis+'>';
  if(q.type==='essay')return'<textarea data-crq="text" rows="6" dir="auto" placeholder="پاسخ تشریحی خود را بنویس…"'+dis+'>'+E_(a||'')+'</textarea>';
  if(q.type==='match'){if(!it.order)it.order=shuffle(q.pairs.map((p,i)=>i));const ans=a||{};
    return'<div class="crs-match">'+q.pairs.map((p,i)=>'<div class="row"><span class="crs-ml" dir="auto">'+inl(p.l)+'</span><select data-crq="match" data-i="'+i+'"'+dis+'><option value="">— انتخاب —</option>'+it.order.map(k=>'<option value="'+E_(q.pairs[k].r)+'" '+(String(ans[i])===String(q.pairs[k].r)?'selected':'')+'>'+E_(String(q.pairs[k].r).replace(/\$/g,''))+'</option>').join('')+'</select></div>').join('')+'</div>'}
  return'';
}
function feedback(q,it){
  const g=grade(q,it.answer);let h='<div class="crs-fb '+(g.auto?(g.ok?'crs-o':'crs-e'):'')+'">';
  h+=g.auto?(g.ok?'✅ درست':'❌ نادرست'+(g.skipped?' (بدون پاسخ)':'')):'📝 سؤال تشریحی؛ تصحیح قطعی ندارد — خودت پاسخ را با پاسخ نمونه مقایسه کن';
  h+='<div><b>پاسخ صحیح:</b> '+correctText(q)+'</div>';
  if(q.type==='single'||q.type==='multi'){const why=(q.choices||[]).filter(c=>c.why);if(why.length)h+='<div class="crs-why"><b>تحلیل گزینه‌ها:</b>'+why.map(c=>'<div><b>'+E_(chLabel(c))+':</b> '+inl(c.why)+'</div>').join('')+'</div>'}
  if(q.solution)h+='<div class="crs-sol"><b>پاسخ تشریحی:</b>'+blocks(q.solution)+'</div>';
  h+=srcLine(q.sourceRef)+'</div>';return h;
}
function vQuizRun(){
  const a=CR.quiz,id=a.qids[CR.qi],q=CR.ix.questions.get(id),it=curItem(),n=a.qids.length,prac=a.mode==='practice',locked=prac&&it.checked;
  if(!q)return'<div class="c">سؤال پیدا نشد ('+E_(id)+')<button data-a="crs_qnext" data-n="1">بعدی</button></div>';
  const left=a.timed?Math.max(0,a.limitSec*1000-usedMs()):0,s=Math.ceil(left/1000);
  let h='<div class="c crs-lesson" data-nobi style="--crs-mz:'+CR.mz+'"><div class="row np"><b>'+(prac?'تمرین':'آزمون')+' · سؤال '+faN(CR.qi+1)+' از '+faN(n)+'</b>'+badge('دشواری '+['آسان','متوسط','دشوار'][q.difficulty-1],'#64748b')+'<span class="sp"></span>'+(a.timed?'<span class="crs-timer" id="crs-timer">'+faN(String(Math.floor(s/60)).padStart(2,'0'))+':'+faN(String(s%60).padStart(2,'0'))+'</span>':'')+'<button data-a="crs_mz" data-d="-1">A−</button><button data-a="crs_mz" data-d="1">A+</button></div>'+
   '<div class="crs-nav">'+a.qids.map((x,i)=>{const t=a.items[x]||{},ans=t.answer!=null&&t.answer!==''&&!(Array.isArray(t.answer)&&!t.answer.length);return'<button class="'+(i===CR.qi?'p':'')+(ans?' crs-an':'')+(t.flag?' crs-fl':'')+'" data-a="crs_qgo" data-n="'+i+'">'+faN(i+1)+'</button>'}).join('')+'</div>'+
   '<div class="crs-stem">'+stemHTML(q)+'</div>'+qInput(q,it,locked)+(locked?feedback(q,it):'')+
   '<div class="row" style="margin-top:12px"><button data-a="crs_qnext" data-n="-1" '+(CR.qi?'':'disabled')+'>‹ قبلی</button><button data-a="crs_qflag">'+(it.flag?'🚩 علامت برداشته شود':'⚑ علامت‌گذاری')+'</button><button data-a="crs_bm" data-k="question" data-r="'+E_(q.id)+'">'+(CR.ix.bookmarks.has('b_question_'+q.id)?'★':'☆')+' نشانک</button>'+(prac&&!it.checked?'<button class="p" data-a="crs_qcheck">بررسی پاسخ</button>':'')+'<span class="sp"></span><button data-a="crs_qnext" data-n="1" '+(CR.qi<n-1?'':'disabled')+'>بعدی ›</button></div>'+
   '<div class="row" style="margin-top:8px"><button class="p" data-a="crs_qsubmit">پایان و تصحیح</button><button class="d" data-a="crs_qquit">رها کردن</button><button data-a="crs_qpause">ذخیره و خروج موقت</button></div></div>';
  return h;
}
function vKey(){
  const a=CR.ix.attempts.get(CR.keyId);if(!a){CR.keyId='';return vQuizSetup()}
  const c=CR.ix.courses.get(a.courseId),sc=a.score||{ok:0,total:0,pending:0},ms=a.qids.reduce((s,id)=>s+((a.items[id]||{}).ms||0),0);
  let h='<div class="c"><div class="row"><h3 class="sp">پاسخ‌نامه‌ی تشریحی — '+E_(c?c.title:'')+'</h3><button data-a="crs_qnew">آزمون تازه</button></div><div class="big">'+(sc.total?faN(sc.ok)+' / '+faN(sc.total):'—')+'</div><div class="m" style="text-align:center">'+(sc.total?'درصد پاسخ‌های قابل تصحیح خودکار: '+faN(Math.round(sc.ok/sc.total*100))+'٪':'')+(sc.pending?' · '+faN(sc.pending)+' سؤال تشریحی نیازمند خودارزیابی':'')+' · مجموع زمان '+faN(Math.round(ms/1000))+' ثانیه</div><div class="row" style="margin-top:8px"><button data-a="crs_errprac">تمرین اشتباهات باز</button><button data-a="crs_tab" data-k="errors">دفترچه‌ی خطا</button></div></div>';
  h+='<div class="crs-lesson" data-nobi style="--crs-mz:'+CR.mz+'">';
  a.qids.forEach((id,i)=>{const q=CR.ix.questions.get(id),it=a.items[id]||{};if(!q){h+='<div class="c">سؤال '+E_(id)+' دیگر نصب نیست.</div>';return}
    const ok=it.ok!=null?it.ok:(it.self==='right'?true:it.self==='wrong'?false:null),er=CR.ix.errors.get('e_'+id);
    h+='<div class="c"><div class="row"><b>سؤال '+faN(i+1)+'</b>'+(ok===true?badge('درست','#16a34a'):ok===false?badge(it.skipped?'بدون پاسخ':'نادرست','#dc2626'):badge('نیازمند خودارزیابی','#ea580c'))+(it.flag?badge('🚩 علامت‌خورده','#64748b'):'')+'<span class="m">'+faN(Math.round((it.ms||0)/1000))+' ثانیه</span></div>'+stemHTML(q)+'<div class="crs-yours"><b>پاسخ شما:</b> '+ansText(q,it.answer)+'</div><div class="crs-ans"><b>پاسخ صحیح:</b> '+correctText(q)+'</div>'+
     (q.type==='essay'?'<div class="row"><span class="m">خودارزیابی (فقط برای آمار شخصی شما):</span>'+[['right','درست بود'],['wrong','نادرست بود']].map(x=>'<button class="'+(it.self===x[0]?'p':'')+'" data-a="crs_self" data-q="'+E_(id)+'" data-v="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>':'')+
     ((q.type==='single'||q.type==='multi')&&(q.choices||[]).some(c=>c.why)?'<div class="crs-why"><b>تحلیل گزینه‌ها:</b>'+q.choices.filter(c=>c.why).map(c=>'<div><b>'+E_(chLabel(c))+':</b> '+inl(c.why)+'</div>').join('')+'</div>':'')+
     (q.solution?'<div class="crs-sol"><b>پاسخ تشریحی:</b>'+blocks(q.solution)+'</div>':'')+srcLine(q.sourceRef)+
     (ok===false&&er?'<div class="row" style="margin-top:6px"><select data-crs-cause="'+E_(er.id)+'"><option value="">علت اشتباه…</option>'+['ندانستن مفهوم','اشتباه محاسباتی','بی‌دقتی در خواندن','کمبود زمان','حدس زدن','اشتباه در روش'].map(x=>'<option '+(er.cause===x?'selected':'')+'>'+x+'</option>').join('')+'</select></div>':'')+'</div>'});
  return h+'</div>';
}
function vQuizSetup(){
  const cs=CR.cache.courses;if(!cs.length)return empty();
  if(CR.keyId)return vKey();
  if(CR.quiz)return vQuizRun();
  const S=CR.setup,cid=S.courseId&&CR.ix.courses.get(S.courseId)?S.courseId:cs[0].id,c=CR.ix.courses.get(cid),act=CR.cache.attempts.filter(a=>a.status==='active');
  const sc=S.scope||'all';
  const opts=[['all','آزمون جامع (کل دوره)']].concat(c.chapters.map(x=>['chapter:'+x.id,'فصل: '+x.title])).concat((c.topics||[]).map(t=>['topic:'+t.id,'مبحث: '+t.title])).concat([['wrong','فقط اشتباهات باز'],['flagged','فقط سؤال‌های علامت‌خورده']]);
  const n=pool(cid,sc,S.diffs||[1,2,3]).length;
  let h='';
  if(act.length)h+='<div class="c"><h3>نیمه‌تمام</h3>'+act.map(a=>'<div class="row"><span>'+E_((CR.ix.courses.get(a.courseId)||{}).title||'')+' · '+(a.mode==='exam'?'آزمون':'تمرین')+' · '+faN(Object.keys(a.items).length)+'/'+faN(a.qids.length)+' پاسخ‌داده</span><button class="p" data-a="crs_resume" data-id="'+E_(a.id)+'">ادامه</button><button class="d" data-a="crs_abandon" data-id="'+E_(a.id)+'">حذف</button></div>').join('')+'</div>';
  h+='<div class="c"><h3>ساخت آزمون یا تمرین از بانک سؤال ذخیره‌شده</h3><p class="m">بدون هوش مصنوعی و بدون اینترنت؛ فقط از سؤال‌های واردشده.</p><div class="row"><div><label>دوره</label><select data-crs-set="courseId">'+cs.map(x=>'<option value="'+E_(x.id)+'" '+(x.id===cid?'selected':'')+'>'+E_(x.title)+'</option>').join('')+'</select></div><div><label>دامنه</label><select data-crs-set="scope">'+opts.map(o=>'<option value="'+E_(o[0])+'" '+(o[0]===sc?'selected':'')+'>'+E_(o[1])+'</option>').join('')+'</select></div></div>'+
   '<label>سطح دشواری</label><div class="row">'+[1,2,3].map(d=>'<label class="crs-ck"><input type="checkbox" data-crs-diff="'+d+'" '+((S.diffs||[1,2,3]).includes(d)?'checked':'')+'> '+['آسان','متوسط','دشوار'][d-1]+'</label>').join('')+'</div>'+
   '<div class="row"><div><label>تعداد سؤال (موجود: '+faN(n)+')</label><input type="number" min="1" id="crsq-count" value="'+(S.count||Math.min(10,Math.max(1,n)))+'" style="width:100px"></div><div><label>نوع</label><select data-crs-set="mode"><option value="exam" '+(S.mode!=='practice'?'selected':'')+'>آزمون (تصحیح در پایان)</option><option value="practice" '+(S.mode==='practice'?'selected':'')+'>تمرین (بررسی فوری)</option></select></div><div><label class="crs-ck"><input type="checkbox" id="crsq-timed" '+(S.timed?'checked':'')+' data-crs-set="timed"> زمان‌دار</label><input type="number" min="1" id="crsq-min" value="'+(S.minutes||20)+'" style="width:90px"> دقیقه</div></div>'+
   '<div class="row" style="margin-top:10px"><button class="p" data-a="crs_qbegin" '+(n?'':'disabled')+'>شروع</button>'+(n?'':'<span class="m">با این شرایط سؤالی نیست.</span>')+'</div></div>';
  return h;
}
/* ---------- ورود / خروج / انتقال ---------- */
async function importFile(file){
  const buf=await readFileBuf(file),name=file.name;let z=null;
  try{z=await zipRead(buf)}catch(e){if(/\.json$/i.test(name))z=null;else throw e}
  if(!z){let j;try{j=JSON.parse(dec.decode(new Uint8Array(buf)).replace(/^\uFEFF/,''))}catch(e){throw new Error('JSON نامعتبر است: '+e.message)}
    return prepRestore(j,[],name)}
  if(z.ents.has('manifest.json')){
    const P=await loadPackZip(z),ex=P.course&&CR.ix.courses.get(P.course.id)||null,rep=validatePack(P,ex);let pl=null;
    if(!rep.errors.length){normalizePack(P);pl=planPack(P)}
    if(CR.pv)CR.pv.forEach(u=>URL.revokeObjectURL(u));CR.pv=new Map();P.assets.forEach((a,p)=>CR.pv.set(p,URL.createObjectURL(new Blob([a.data],{type:a.mime}))));
    CR.pending={name,P,rep,pl,down:false};CR.restore=null;CR.tab='manage';return}
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
  const files=[],J=(n,o)=>files.push({name:n,data:enc.encode(JSON.stringify(o,null,1))});
  const L=lessonsOf(id),Q=questionsOf(id),S=CR.cache.sources.filter(s=>s.courseId===id);
  J('manifest.json',{format:'dani-course',templateVersion:CRV.template,id,title:c.title,contentVersion:c.contentVersion,exportedAt:nowISO(),generator:'DANI Planner '+CRV.app,files:{course:'course.json',lessons:L.map(l=>'lessons/'+l.id+'.json'),questions:['questions/bank.json'],sources:'sources.json'}});
  J('course.json',{id,title:c.title,description:c.description,language:c.language,goals:c.goals,prerequisites:c.prerequisites,topics:c.topics||[],chapters:c.chapters});
  L.forEach(l=>J('lessons/'+l.id+'.json',strip(l)));J('questions/bank.json',Q.map(strip));J('sources.json',S.map(strip));
  for(const a of await IDB.byCourse('assets',id))files.push({name:a.path,data:new Uint8Array(await a.blob.arrayBuffer())});
  return zipWrite(files);
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
  let h=everythingCard(); 
  const pd=CR.pending;
  if(pd){const r=pd.rep,pl=pd.pl,C=pd.P.course||{};
    h+='<div class="c crs-pv"><h3>پیش‌نمایش ورود: '+E_(C.title||pd.name)+'</h3><div class="m">فایل: <bdi dir="ltr">'+E_(pd.name)+'</bdi> · '+faN(pd.P.lessons.length)+' درس · '+faN(pd.P.questions.length)+' سؤال · '+faN(pd.P.assets.size)+' فایل تصویری ('+faN(pd.P.sizeKB)+' کیلوبایت)</div>';
    if(r.errors.length)h+='<div class="crs-call crs-warning"><div class="crs-ct">❌ '+faN(r.errors.length)+' خطا — ثبت نهایی ممکن نیست</div><ul>'+r.errors.slice(0,60).map(x=>'<li dir="auto">'+E_(x)+'</li>').join('')+(r.errors.length>60?'<li>… و '+faN(r.errors.length-60)+' مورد دیگر</li>':'')+'</ul></div>';
    if(r.warnings.length)h+='<details class="crs-call crs-note"><summary>⚠️ '+faN(r.warnings.length)+' هشدار (مانع ورود نیست)</summary><ul>'+r.warnings.slice(0,80).map(x=>'<li dir="auto">'+E_(x)+'</li>').join('')+'</ul></details>';
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
  h+='<div class="c"><h3>دوره‌های نصب‌شده</h3>'+(CR.cache.courses.length?CR.cache.courses.map(c=>'<div class="cwr"><span dir="auto"><b>'+E_(c.title)+'</b> <small class="m">v'+E_(c.contentVersion)+' · '+faN(lessonsOf(c.id).length)+' درس · '+faN(questionsOf(c.id).length)+' سؤال</small></span><button data-a="crs_expc" data-id="'+E_(c.id)+'">خروجی ZIP</button><button class="d" data-a="crs_delc" data-id="'+E_(c.id)+'">حذف</button></div>').join(''):'<p class="m">دوره‌ای نصب نیست.</p>')+'</div>';
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
const goTab=k=>{stopStudy();if(CR.tab==='quiz'&&CR.quiz&&k!=='quiz')leaveQuiz();CR.tab=k;CR.msg=null;rerender();window.scrollTo(0,0)};
hh('tab',el=>{const k=el.dataset.k;if(k==='quiz'&&CR.quiz){CR.tab='quiz';rerender();return}if(k!=='quiz')CR.keyId=k==='quiz'?CR.keyId:'';goTab(k)});
hh('msgx',()=>{CR.msg=null;rerender()});
hh('retry',()=>{if(IDB.mem&&(CR.cache.courses.length||CR.cache.progress.length)&&!confirm('داده‌ی موقتیِ فعلی (دوره‌ها و پیشرفت) هنگام تلاش مجدد پاک می‌شود. اگر پشتیبان نگرفته‌ای انصراف بده. ادامه؟'))return;CR.err='';IDB.p=null;IDB.mem=false;IDB.memErr=null;Object.keys(MEMDB).forEach(k=>delete MEMDB[k]);CR.assetCourse='';return crLoad().then(rerender)});
hh('open',el=>{stopStudy();const c=el.dataset.c,l=el.dataset.l;CR.tab='courses';CR.courseId=c;CR.lessonId=l||'';CR.msg=null;
  return crAssets(c).then(()=>{if(l)CR.studyAt=Date.now();rerender();window.scrollTo(0,0)})});
hh('back',()=>{stopStudy();CR.courseId='';CR.lessonId='';rerender()});
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
hh('errprac',()=>{const cs=[...new Set(CR.cache.errors.filter(e=>!e.resolved).map(e=>e.courseId))];if(!cs.length){toast('اشتباه بازی نیست');return}return startQuiz({courseId:cs[0],scope:'wrong',mode:'practice',diffs:[1,2,3],count:0})});
hh('flagprac',()=>{const f=new Set();CR.cache.attempts.forEach(a=>Object.entries(a.items||{}).forEach(([q,i])=>{if(i.flag)f.add(q)}));const q=CR.ix.questions.get([...f][0]);if(!q)return;return startQuiz({courseId:q.courseId,scope:'flagged',mode:'practice',diffs:[1,2,3],count:0})});
hh('erres',el=>{const e=CR.ix.errors.get(el.dataset.id);return putUser('errors',{...e,resolved:!e.resolved}).then(rerender)});
hh('key',el=>{CR.keyId=el.dataset.id;CR.tab='quiz';return crAssets(CR.ix.attempts.get(el.dataset.id).courseId).then(()=>{rerender();window.scrollTo(0,0)})});
hh('qnew',()=>{CR.keyId='';rerender()});
hh('self',el=>selfGrade(el.dataset.q,el.dataset.v));
hh('qbegin',()=>{const S=CR.setup,cid=S.courseId||CR.cache.courses[0].id,diffs=[...document.querySelectorAll('[data-crs-diff]')].filter(x=>x.checked).map(x=>+x.dataset.crsDiff),timed=document.getElementById('crsq-timed').checked;
  return startQuiz({courseId:cid,scope:S.scope||'all',diffs,count:Math.max(1,parseInt(document.getElementById('crsq-count').value,10)||10),mode:S.mode||'exam',timed,minutes:parseInt(document.getElementById('crsq-min').value,10)||20})});
hh('qgo',el=>{touchQ();CR.qi=+el.dataset.n;persistSoon();rerender();window.scrollTo(0,0)});
hh('qnext',el=>{touchQ();CR.qi=Math.max(0,Math.min(CR.quiz.qids.length-1,CR.qi+(+el.dataset.n)));persistSoon();rerender();window.scrollTo(0,0)});
hh('qflag',()=>{const it=curItem();it.flag=!it.flag;persistSoon();rerender()});
hh('qcheck',()=>{touchQ();const q=CR.ix.questions.get(CR.quiz.qids[CR.qi]),it=curItem();it.checked=true;it.ok=grade(q,it.answer).ok;persistSoon();rerender()});
hh('qsubmit',()=>{const a=CR.quiz,un=a.qids.filter(id=>{const t=a.items[id];return!t||t.answer==null||t.answer===''||(Array.isArray(t.answer)&&!t.answer.length)}).length;if(un&&!confirm(faN(un)+' سؤال بی‌پاسخ است. پایان و تصحیح؟'))return;return submitQuiz()});
hh('qquit',()=>{if(!confirm('آزمون رها و حذف شود؟'))return;const id=CR.quiz.id;clearInterval(CR.tmr);CR.quiz=null;return delUser('attempts',id).then(rerender)});
hh('qpause',()=>{leaveQuiz();clearInterval(CR.tmr);CR.quiz=null;toast('ذخیره شد؛ از «نیمه‌تمام» ادامه بده');rerender()});
hh('commit',()=>{const pd=CR.pending;return guard(async()=>{await commitPack(pd.P,pd.pl);CR.pv&&CR.pv.forEach(u=>URL.revokeObjectURL(u));CR.pv=null;CR.pending=null;msg('ok','دوره «'+E_(pd.P.course.title)+'» با موفقیت ثبت شد (نسخه‌ی '+E_(pd.pl.newV)+').')})});
hh('cancel',()=>{CR.pv&&CR.pv.forEach(u=>URL.revokeObjectURL(u));CR.pv=null;CR.pending=null;toast('ورود لغو شد؛ چیزی ذخیره نشد');rerender()});
hh('expc',el=>guard(async()=>{const c=CR.ix.courses.get(el.dataset.id);download(c.id+'-'+c.contentVersion+'.dani-course.zip',await buildCourseZip(c.id))},'فایل دوره دانلود شد'));
hh('delc',el=>{const c=CR.ix.courses.get(el.dataset.id);if(!confirm('محتوای دوره «'+c.title+'» حذف شود؟\n(قبل از حذف، «خروجی ZIP» بگیر. پیشرفت و پاسخ‌ها در مرحله‌ی بعد جداگانه پرسیده می‌شود.)'))return;const wu=confirm('پیشرفت، پاسخ‌ها، نشانک‌ها و یادداشت‌های این دوره هم حذف شود؟\nتأیید = همه حذف شود · انصراف = اطلاعات من بماند');return guard(async()=>{if(CR.courseId===c.id){CR.courseId='';CR.lessonId=''}await deleteCourse(c.id,wu)},'دوره حذف شد')});
hh('expu',()=>{download('dani-academy-user-'+new Date().toISOString().slice(0,10)+'.json',new Blob([JSON.stringify(userExport(),null,1)],{type:'application/json'}));toast('خروجی اطلاعات کاربر آماده شد')});
hh('expb',()=>guard(async()=>{const files=[{name:'user.json',data:enc.encode(JSON.stringify(userExport(),null,1))}];for(const c of CR.cache.courses)files.push({name:'courses/'+c.id+'.dani-course.zip',data:new Uint8Array(await(await buildCourseZip(c.id)).arrayBuffer())});download('dani-academy-backup-'+new Date().toISOString().slice(0,10)+'.dani-backup.zip',zipWrite(files))},'پشتیبان کامل دانلود شد'));
hh('rcancel',()=>{CR.restore=null;rerender()});
hh('rapply',()=>{const R=CR.restore;if(R.mode==='replace'&&!confirm('اطلاعات کاربر فعلی کاملاً جایگزین می‌شود. ادامه؟'))return;return guard(async()=>{const log=await applyRestore();CR.restore=null;msg('ok','بازیابی انجام شد.'+(log.length?'<br>'+log.map(E_).join('<br>'):''))})});
document.addEventListener('change',e=>{
  const t=e.target;if(!t||!t.matches)return;
  if(t.matches('[data-crs-file=all]')){const f=t.files&&t.files[0];t.value='';if(!f)return;guard(async()=>{CR.everything=await prepEverything(f);CR.restore=null;CR.pending=null});return}
  if(t.matches('[data-crs-file]')){const f=t.files&&t.files[0];t.value='';if(!f)return;guard(()=>importFile(f).then(()=>{}));return}
  if(t.matches('[data-crs-ev]')){const ev=CR.everything;if(t.dataset.crsEv==='host')ev.doHost=t.checked;else ev.doAcademy=t.checked;rerender();return}
  if(t.matches('[data-crs-evsafe]')){CR.everything.safety=t.checked;return}
  if(t.matches('[data-crs-set]')){const k=t.dataset.crsSet;if(k==='courseId'){CR.setup={...CR.setup,courseId:t.value,scope:'all'}}else if(k==='timed')CR.setup.timed=t.checked;else CR.setup[k]=t.value;rerender();return}
  if(t.matches('[data-crs-diff]')){CR.setup.diffs=[...document.querySelectorAll('[data-crs-diff]')].filter(x=>x.checked).map(x=>+x.dataset.crsDiff);rerender();return}
  if(t.matches('[data-crs-down]')){CR.pending.down=t.checked;rerender();return}
  if(t.matches('[data-crs-rm]')){RS().mode=t.dataset.crsRm;rerender();return}
  if(t.matches('[data-crs-rp]')){RS().policy=t.dataset.crsRp;rerender();return}
  if(t.matches('[data-crs-safety]')){CR.restore.safety=t.checked;return}
  if(t.matches('[data-crs-cause]')){const er=CR.ix.errors.get(t.dataset.crsCause);if(er)putUser('errors',{...er,cause:t.value}).catch(x=>toast(storeErr(x),1));return}
  if(t.matches('[data-crs-enote]')){const er=CR.ix.errors.get(t.dataset.crsEnote);if(er)putUser('errors',{...er,note:t.value.slice(0,500)}).catch(x=>toast(storeErr(x),1));return}
  if(t.matches('[data-crq]')&&CR.quiz){const it=curItem(),k=t.dataset.crq;
    if(k==='single')it.answer=t.value;
    else if(k==='multi')it.answer=[...document.querySelectorAll('[data-crq=multi]')].filter(x=>x.checked).map(x=>x.value);
    else if(k==='match'){const m=it.answer&&typeof it.answer==='object'&&!Array.isArray(it.answer)?{...it.answer}:{};m[t.dataset.i]=t.value;it.answer=m}
    else it.answer=t.value;
    persistSoon();if(k==='single'||k==='multi'){document.querySelectorAll('.crs-ch').forEach(l=>l.classList.toggle('on',l.querySelector('input').checked))}
    const b=document.querySelectorAll('.crs-nav button')[CR.qi];if(b)b.classList.add('crs-an')}
});
document.addEventListener('input',e=>{const t=e.target;if(t&&t.matches&&t.matches('[data-crq=text]')&&CR.quiz){const it=curItem();it.answer=t.value;persistSoon();const b=document.querySelectorAll('.crs-nav button')[CR.qi];if(b)b.classList.toggle('crs-an',!!t.value)}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopStudy();if(CR.quiz){touchQ();CR.quiz.used=usedMs();CR.resumedAt=Date.now();putUser('attempts',CR.quiz).catch(()=>{})}}else{CR.resumedAt=Date.now();CR.qStart=Date.now();if(CR.lessonId&&inCrs())CR.studyAt=Date.now()}});
/* ---------- CSS ---------- */
const CSS=`.crs-lesson{--m:1}.crs-body p,.crs-lesson p{margin:.5em 0}
.crs-math{overflow-x:auto;overflow-y:hidden;padding:8px 4px;margin:8px 0;font-size:calc(1.2em*var(--crs-mz,1));direction:ltr;text-align:center;max-width:100%;-webkit-overflow-scrolling:touch;border-radius:8px}
.crs-math:focus{outline:2px solid var(--ac)}.crs-math math{font-size:inherit}.crs-im math{font-size:calc(1.08em*var(--crs-mz,1))}
.crs-im{unicode-bidi:isolate}.crs-call{border:1px solid var(--b);border-inline-start:4px solid var(--ac);border-radius:10px;padding:8px 12px;margin:10px 0;background:var(--c)}
.crs-warning,.crs-pitfall{border-inline-start-color:#dc2626}.crs-tip,.crs-summary{border-inline-start-color:#16a34a}.crs-def,.crs-rule,.crs-theorem{border-inline-start-color:#7c3aed}.crs-quote{border-inline-start-color:#64748b;font-style:italic}
.crs-ct{font-weight:700;margin-bottom:4px}.crs-ex{border:1px dashed var(--ac);border-radius:12px;padding:10px 12px;margin:12px 0}
.crs-steps{list-style:none;padding:0;margin:6px 0}.crs-step{display:flex;gap:8px;align-items:flex-start;padding:4px 0;border-bottom:1px dotted var(--b)}.crs-step>div{min-width:0;flex:1}
.crs-sn{background:var(--ac);color:#fff;border-radius:50%;min-width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;font-size:12px;margin-top:4px}
.crs-ans{background:#16a34a22;border-radius:8px;padding:6px 10px;margin:6px 0}.crs-yours{margin:6px 0}.crs-sol,.crs-why{margin:8px 0;padding:6px 10px;border-inline-start:3px solid var(--b)}
.crs-tw{overflow-x:auto;max-width:100%}.crs-tw table{min-width:340px}.crs-fig{margin:10px auto;text-align:center;max-width:100%}.crs-fig img{max-width:100%;height:auto;background:#fff;border-radius:8px;border:1px solid var(--b)}
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
async function hostSnap(){
  if(typeof db==='undefined')return null;
  const o={format:'dani-fullbackup',version:2,at:nowISO(),db:JSON.stringify(db),img:await imgAll(),ls:{}};
  for(let j=0;j<localStorage.length;j++){const k=localStorage.key(j);if(LS_OK(k))o.ls[k]=localStorage.getItem(k)}
  return o}
async function buildEverything(){
  const host=await hostSnap(),files=[],J=(n,o)=>files.push({name:n,data:enc.encode(typeof o==='string'?o:JSON.stringify(o))});
  J('manifest.json',{format:'dani-everything-backup',version:1,createdAt:nowISO(),app:CRV.app,planner:!!host,academy:{courses:CR.cache.courses.map(c=>({id:c.id,title:c.title,contentVersion:c.contentVersion}))}});
  if(host)J('host.json',host);
  J('academy/user.json',userExport());
  for(const c of CR.cache.courses)files.push({name:'academy/courses/'+c.id+'.dani-course.zip',data:new Uint8Array(await(await buildCourseZip(c.id)).arrayBuffer())});
  return zipWrite(files)}
async function prepEverything(file){
  const z=await zipRead(await readFileBuf(file));
  if(!z.ents.has('manifest.json'))throw new Error('manifest.json در فایل نیست — این «پشتیبان کامل DANI» نیست');
  const mf=JSON.parse(dec.decode(await z.read('manifest.json')));
  if(mf.format!=='dani-everything-backup')throw new Error('فایل پشتیبان کامل DANI نیست (format نامعتبر)');
  if(mf.version>1)throw new Error('این پشتیبان با نسخه‌ی جدیدتری ساخته شده است');
  const ev={name:file.name,mf,host:null,restore:null,doHost:true,doAcademy:true,safety:true};
  if(z.ents.has('host.json')){
    const o=JSON.parse(dec.decode(await z.read('host.json')));
    if(!o||o.format!=='dani-fullbackup'||typeof o.db!=='string')throw new Error('بخش پلنر داخل فایل معتبر نیست');
    let d;try{d=JSON.parse(o.db)}catch(e){throw new Error('داده‌ی پلنر داخل فایل خراب است')}
    if(!d||!Array.isArray(d.acts)||!Array.isArray(d.entries))throw new Error('داده‌ی پلنر داخل فایل ناقص است');
    const ls=Object.keys(o.ls||{}).filter(LS_OK),cnt=p=>ls.filter(k=>k.startsWith(p)).length,a=(d.mods&&d.mods.acd)||{};
    ev.host={o,d,ls,info:{acts:d.acts.length,entries:d.entries.length,img:Object.keys(o.img||{}).length,packs:cnt('dani_pack_'),qpacks:cnt('dani_qpack_'),ext:cnt('dani_ext_'),other:ls.length-cnt('dani_pack_')-cnt('dani_qpack_')-cnt('dani_ext_'),skin:(d.set&&d.set.skin)||'',cards:(a.cards||[]).length,tests:Object.keys(a.tests||{}).length||(a.tests||[]).length,lp:Object.keys(a.lp||{}).length}}}
  if(z.ents.has('academy/user.json')){
    const j=JSON.parse(dec.decode(await z.read('academy/user.json')));
    if(!j||j.format!=='dani-academy-user'||!j.data)throw new Error('بخش آکادمی داخل فایل معتبر نیست');
    const packs=[];
    for(const n of [...z.ents.keys()].filter(n=>/^academy\/courses\/.+\.zip$/.test(n))){try{const zz=await zipRead((await z.read(n)).buffer),P=await loadPackZip(zz),ex=P.course&&CR.ix.courses.get(P.course.id)||null,rep=validatePack(P,ex);let pl=null;if(!rep.errors.length){normalizePack(P);pl=planPack(P)}packs.push({n,P,rep,pl})}catch(e){packs.push({n,err:e.message})}}
    ev.restore={name:file.name,j,packs,policy:'keep',mode:'merge',safety:false}}
  if(!ev.host&&!ev.restore)throw new Error('فایل نه بخش پلنر دارد نه بخش آکادمی');
  return ev}
const RS=()=>(CR.everything&&CR.everything.restore)||CR.restore;
async function applyEverything(){
  const ev=CR.everything,log=[];
  if(ev.safety){download('DANI-safety-before-restore-'+new Date().toISOString().slice(0,10)+'.dani-all.zip',await buildEverything())}
  if(ev.doAcademy&&ev.restore){CR.restore=ev.restore;ev.restore.safety=false;const l=await applyRestore();CR.restore=null;log.push('آکادمی بازیابی شد'+(l.length?' ('+l.join('؛ ')+')':''))}
  if(ev.doHost&&ev.host){
    const {o,d}=ev.host;
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
  if(h){const i=h.info;s+='<label class="crs-ck"><input type="checkbox" data-crs-ev="host" '+(ev.doHost?'checked':'')+'> <b>پلنر</b> — جایگزین داده‌ی فعلی پلنر می‌شود</label><div class="m">'+faN(i.acts)+' فعالیت · '+faN(i.entries)+' ثبت · '+faN(i.img)+' تصویر · '+faN(i.packs)+' بسته‌ی تم · '+faN(i.qpacks)+' بسته‌ی جمله · '+faN(i.ext)+' افزونه · '+faN(i.other)+' تنظیم/داده‌ی دیگر'+(i.skin?' · اسکین: '+E_(i.skin):'')+' · آکادمی پلنر: '+faN(i.cards)+' فلش‌کارت، '+faN(i.lp)+' درس مسیر یادگیری</div>'}
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
  return evPanel()+'<div class="c" data-nobi id="crs-allcard"><h3>🛡 پشتیبان کامل همه‌چیز (پلنر + آکادمی)</h3><p class="m">یک فایل برای تمام اطلاعات: فعالیت‌ها و ثبت‌ها، تنظیمات، تم‌ها و اسکین‌ها، بسته‌های جمله و تم، افزونه‌ها، تصاویر، فلش‌کارت‌ها و درس‌های پلنر، <b>و</b> همه‌ی دوره‌ها، درس‌ها، سؤال‌ها، تصاویر دوره، پیشرفت، آزمون‌ها، نشانک‌ها، یادداشت‌ها و دفترچه‌ی خطا. اگر مرورگر عوض شد یا اطلاعات پاک شد، همین فایل را در همین برنامه «بازیابی» کن.</p><div class="row"><button class="p" data-a="crs_allexp">گرفتن پشتیبان کامل</button><label class="btn" style="margin:0">بازیابی از پشتیبان کامل<input type="file" accept=".zip" data-crs-file="all" hidden></label></div><div class="m">آخرین پشتیبان کامل از این مرورگر: '+(last?E_(last):'تا حالا گرفته نشده')+'</div></div>'}
hh('allexp',()=>guard(async()=>{const blob=await buildEverything();download('DANI-everything-backup-'+new Date().toISOString().slice(0,10)+'.dani-all.zip',blob);try{localStorage.setItem('crs_lastall',String(Date.now()))}catch(e){}},'پشتیبان کامل دانلود شد؛ فایل را جای امن نگه دار.'));
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
  window.daniCourses={state:CR,validatePack,loadPackZip,zipRead,zipWrite,tex2mml,grade,inl,blocks,IDB,planPack,normalizePack,commitPack,importFile,buildCourseZip,startQuiz,submitQuiz,userExport,planUser,version:CRV};
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
.crs-ask{position:absolute;inset-inline-start:-6px;top:-6px;width:32px;height:32px;border-radius:50%;border:1px solid var(--b);background:var(--c);color:var(--ac);font-size:16px;line-height:1;cursor:pointer;opacity:.0;transition:opacity .15s,transform .15s;z-index:3;box-shadow:0 2px 8px rgba(0,0,0,.12)}
.crs-bq:hover>.crs-ask,.crs-bq:focus-within>.crs-ask,.crs-ask:focus{opacity:1}
@media (hover:none){.crs-ask{opacity:.85;width:36px;height:36px;inset-inline-start:-4px;top:-10px}}
.crs-ask:hover{transform:scale(1.12)}
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
.crs-lessonbar-ask{position:fixed;inset-inline-end:16px;bottom:18px;z-index:9000;border:0;border-radius:28px;padding:12px 18px;background:var(--ac);color:#fff;font:inherit;font-weight:700;box-shadow:0 6px 20px rgba(0,0,0,.28);cursor:pointer;display:none}
body.in-crs .crs-lessonbar-ask{display:block}
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
    var b=t.closest('.crs-ask');
    if(b){e.preventDefault();e.stopPropagation();open(describe(b.parentElement));return}
    if(t.closest('.crs-lessonbar-ask')){var L=document.querySelector('.crs-lesson');if(L)open(describe(L,true))}
  },true);
  var fab=el('button','crs-lessonbar-ask','❓ '+T('سؤال از این درس','Ask about this lesson'));fab.type='button';document.body.appendChild(fab);
  function decorate(){
    var root=document.querySelector('.crs-lesson');
    document.body.classList.toggle('in-crs',!!root);
    if(!root)return;
    [].forEach.call(root.children,function(c){
      if(c.classList.contains('np')||c.classList.contains('row')||c.classList.contains('crs-bq'))return;
      if(!c.textContent.trim()&&!c.querySelector('math'))return;
      c.classList.add('crs-bq');var b=el('button','crs-ask','❓');b.title=T('این بخش را نفهمیدم — بپرس','I did not get this part — ask');b.type='button';c.insertBefore(b,c.firstChild)})}
  var tm=0;new MutationObserver(function(){clearTimeout(tm);tm=setTimeout(decorate,120)}).observe(document.body,{childList:true,subtree:true});
  decorate();
})();
