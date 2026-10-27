"use strict";
/* DANI · insight.js — کارت «الگوی تو»: بهترین ساعت‌ها، بهترین روز هفته، مقایسه‌ی این هفته با هفته‌ی قبل و یک پیشنهاد؛ از ثبت‌های ۳۰ روز اخیر. فقط می‌خواند؛ چیزی تغییر نمی‌دهد. */
(function(){
const T=(fa,en)=>{try{return LANGEN()?en:fa}catch(e){return fa}};
const WD=[['یکشنبه','Sun'],['دوشنبه','Mon'],['سه‌شنبه','Tue'],['چهارشنبه','Wed'],['پنج‌شنبه','Thu'],['جمعه','Fri'],['شنبه','Sat']];
function calc(){const now=new Date(),from=new Date(now.getTime()-30*864e5).toISOString().slice(0,10),hr=Array(24).fill(0),wd=Array(7).fill(0),wn=Array(7).fill(0),days={};
  (db.entries||[]).forEach(e=>{if(!e||!e.date||e.date<from||!e.min)return;const h=+String(e.start||'').slice(0,2);if(h>=0&&h<24)hr[h]+=e.min;const d=new Date(e.date+'T12:00:00').getDay();wd[d]+=e.min;days[e.date]=(days[e.date]||0)+e.min});
  Object.keys(days).forEach(k=>{wn[new Date(k+'T12:00:00').getDay()]++});
  const n=Object.keys(days).length;if(n<5)return null;
  let bh=0;for(let h=0;h<24;h++){if(!hr[h])continue;const s=hr[h]+(hr[h+1]||0);const b=hr[bh]+(hr[bh+1]||0);if(s>b)bh=h}
  let bd=-1,bv=0;for(let d=0;d<7;d++){if(wn[d]<1)continue;const v=wd[d]/wn[d];if(v>bv){bv=v;bd=d}}
  const t=new Date(),dow=t.getDay(),cut=d=>new Date(t.getTime()-d*864e5).toISOString().slice(0,10);
  const sum=(a,b)=>Object.keys(days).filter(k=>k>=cut(b)&&k<=cut(a)).reduce((s,k)=>s+days[k],0);
  return{n,bh,bd,bv,cur:sum(0,6),prev:sum(7,13)}}
function card(){let c;try{c=calc()}catch(e){return''}
  if(!c)return'<div class="c"><b>📈 '+T('الگوی تو','Your pattern')+'</b><p class="m">'+T('بعد از ۵ روز ثبت، بهترین ساعت‌ها و روزهایت اینجا دیده می‌شود.','After 5 logged days, your best hours and days show up here.')+'</p></div>';
  const f=h=>fa(String(h).padStart(2,'0')+':00'),diff=c.prev?Math.round((c.cur-c.prev)/c.prev*100):null;
  let h='<div class="c" id="incard"><b>📈 '+T('الگوی تو (۳۰ روز اخیر)','Your pattern (last 30 days)')+'</b><div class="row hrev" style="margin:6px 0">'
   +'<span>⏰ '+T('بهترین بازه','Best window')+': <b>'+f(c.bh)+'–'+f((c.bh+2)%24)+'</b></span>'
   +(c.bd>=0?'<span>📅 '+T('بهترین روز','Best day')+': <b>'+esc(T(WD[c.bd][0],WD[c.bd][1]))+'</b></span>':'')
   +(diff!=null?'<span>'+(diff>=0?'⬆️':'⬇️')+' '+T('۷ روز اخیر نسبت به قبل','Last 7 days vs before')+': <b dir="ltr">'+(diff>0?'+':'')+diff+'%</b></span>':'')+'</div>'
   +'<p class="m">💡 '+T('کار سخت‌تر را نزدیک '+f(c.bh)+' بگذار؛ در همین ساعت‌ها بیشترین کار را انجام داده‌ای.','Put your hardest task near '+f(c.bh)+' — that is when you get the most done.')+'</p></div>';
  return h}
window.daniInsightCard=card;
})();
