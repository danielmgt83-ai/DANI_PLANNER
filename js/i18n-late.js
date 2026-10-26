/* DANI i18n-late: ترجمه‌ی بخش‌هایی که quickaccess.js و courses.js از مترجم مستثنا کرده‌اند.
   - منوی دسترسی سریع: ترجمه‌ی کامل
   - درس‌ها (#crs): فقط عبارت‌هایی که دقیقاً در فرهنگ لغت هستند (متن درس دست‌نخورده می‌ماند) */
(function(){
if(typeof i18Tree!=='function'||typeof i18Tr!=='function')return;
const QA='#qa-ovl,.qa-side,.qa-nav',CR='#crs';
const sel=n=>{const e=n&&(n.nodeType===3?n.parentNode:n);if(!e||!e.closest)return 0;return e.closest(QA)?1:e.closest(CR)?2:0};
const skip=p=>p==='SCRIPT'||p==='STYLE'||p==='TEXTAREA';
function exact(v){const t=v.trim();if(!t)return v;if(!/[؀-ۿ]/.test(t))return v;const r=i18Tr(t);return r===t?v:v.replace(t,r)}
function walk(root,mode){
  const fix=(n)=>{if(n.nodeType===3){if(skip(n.parentNode&&n.parentNode.nodeName))return;const v=n.nodeValue,t=mode===1?i18Tr(v):exact(v);if(t!==v)n.nodeValue=t}
    else if(n.nodeType===1&&!skip(n.nodeName)){for(const a of (typeof I18_ATTR!=='undefined'?I18_ATTR:['title','placeholder','aria-label'])){const v=n.getAttribute(a);if(v){const t=mode===1?i18Tr(v):exact(v);if(t!==v)n.setAttribute(a,t)}}}};
  if(root.nodeType===3){fix(root);return}
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);let n=root.nodeType===1?root:w.nextNode();
  while(n){fix(n);n=w.nextNode()}}

/* حالت انگلیسی: جمله‌های دوزبانه فقط با متن انگلیسی نمایش داده شوند */
(function(){const st=document.createElement('style');st.id='i18-late-css';
st.textContent='html[data-lang="en"] .qx:has(.qen) .qfa,html[data-lang="en"] p.fa:has(+p.en),html[data-lang="en"] .hq .qfa:has(~.qen),html[data-lang="en"] .qbig .qfa:has(~.qen){display:none!important}';
document.head.appendChild(st)})();
const _prev=i18Tree;
i18Tree=function(root){
  _prev.apply(this,arguments);
  try{if(!LANGEN()||!root)return;
    const m=sel(root);
    if(m){walk(root,m);return}
    if(root.nodeType===1&&root.querySelectorAll){
      root.querySelectorAll(QA).forEach(e=>walk(e,1));
      root.querySelectorAll(CR).forEach(e=>walk(e,2))}
  }catch(e){}};
try{if(LANGEN())i18Tree(document.body)}catch(e){}
})();
