/* جبران و تأخیر پروژه‌ها (v81): «باید تا امروز اینجا می‌بودی / هستی»، سهمیه‌ی تطبیقی امروز، تاریخ پایان طبق برنامه در برابر الان،
   دفتر ۷ روز اخیر (هر روز چقدر جلو/عقب انداخت) و هزینه‌ی وقت تلف‌شده. روی موتور پیش‌بینی projects.js (`daniPjX`) و usetime.js سوار است؛ چیزی جایگزین نشده.
   `daniPace(p)` داده، `daniPaceLine(p)` یک خط کوتاه (به verdict خانه/برنامه افزوده می‌شود)، و کارت جمع‌شونده زیر هر `.fcb` در صفحه‌ی پروژه. */
(function(){'use strict';
const T=window.daniT,X=()=>window.daniPjX,nf=v=>fa(Math.round(v*10)/10),hrs=m=>nf(Math.abs(m)/60)+T(' ساعت',' h'),dys=v=>nf(Math.abs(v))+T(' روز',' d');
function pace(p){const x=X();if(!x||!p)return null;const t=todayISO(),f=x.fcast(p),bud=f.bud,d=f.due;if(!bud)return null;
 let start=p.from||t;if(start>t)start=t;const w=x.paceW(p);let base=0,kind='';
 if(w>0){base=w*60/7;kind='plan'}else if(d){const tot=x.dDiff(start,d)+1;if(tot>0){base=bud/tot;kind='lin'}}
 if(!(base>0))return null;
 const el=Math.max(0,x.dDiff(start,t)),planned=Math.min(bud,base*el),spent=el>0?x.mins(p,start,addD(t,-1)):0,gap=planned-spent;
 const need=f.need||0,rem=f.rem||0,left=f.left;
 const act14=x.mins(p,addD(t,-13),t)/14,Fnow=act14>0&&rem>0?addD(t,Math.ceil(rem/act14)):null,Fplan=rem>0?addD(t,Math.ceil(rem/base)):null,
  PF=addD(start,Math.max(0,Math.ceil(bud/base)-1)),delay=Fnow?x.dDiff(PF,Fnow):null,lateDue=Fnow&&d?x.dDiff(d,Fnow):null;
 const led=[];for(let i=1;i<=7;i++){const dd=addD(t,-i);if(dd<start)break;const a=x.mins(p,dd,dd);led.push({d:dd,a,delta:(a-base)/base})}
 led.reverse();
 let w7=0;try{w7=window.daniUseTime.calc(addD(t,-6),t).w||0}catch(e){}
 const todayMin=x.mins(p,t,t),target=left>0&&need>0?need:base;
 return{lateDue,base,kind,start,planned,spent,gap,gapDays:gap/base,need,rem,left,Fnow,Fplan,PF,delay,led,w7,wDays:w7/base,todayMin,target,extra:Math.max(0,target-base),bud,done:rem<=0,due:d}}
window.daniPace=pace;
window.daniPaceForDl=id=>{try{const L=window.daniProjects&&daniProjects.list?daniProjects.list():[];const p=L.find(q=>!q.arch&&q.dl===id);return p?window.daniPaceLine(p):''}catch(e){return''}};
function head(q){if(q.done)return'';const g=q.gap;if(Math.abs(g)<5)return'✅ '+T('دقیقاً طبق برنامه','Right on plan');
 return g>0?'🔻 '+T(hrs(g)+' عقب‌تر از برنامه (≈ '+dys(q.gapDays)+')',hrs(g)+' behind plan (≈ '+dys(q.gapDays)+')'):'🔺 '+T(hrs(g)+' جلوتر از برنامه (≈ '+dys(q.gapDays)+')',hrs(g)+' ahead of plan (≈ '+dys(q.gapDays)+')')}
window.daniPaceLine=p=>{try{const q=pace(p);if(!q||q.done)return'';let l='<span class="m">'+head(q);if(q.lateDue>0&&q.left>0)l+=' · ⚠ '+T('با ریتم واقعی ۱۴ روز اخیر '+dys(q.lateDue)+' بعد از موعد','at your real 14-day pace '+dys(q.lateDue)+' after the deadline');if(q.extra>5&&q.left>0)l+=' · '+T('سهمیه‌ی امروز '+hrs(q.target)+' (+'+hrs(q.extra)+' جبران)','today’s share '+hrs(q.target)+' (+'+hrs(q.extra)+' catch-up)');return l+'</span>'}catch(e){return''}};
function card(p){const q=pace(p);if(!q)return'';const col=q.gap>5?'#ef4444':q.gap<-5?'#10b981':'#3b82f6',max=Math.max(q.planned,q.spent,1),W=v=>Math.min(100,v/max*100);
 let h='<details class="pcx" style="margin-top:8px;border-top:1px dashed #8884;padding-top:6px"><summary style="cursor:pointer"><b>📈 '+T('جبران و تأخیر','Catch-up & delay')+'</b> <span class="m">· '+head(q)+'</span></summary>';
 h+='<div style="margin:8px 0"><div class="m">'+(q.kind==='plan'?T('طبق ریتم برنامه‌ات تا امروز باید ','By your planned pace you should have ')+'<b>'+hrs(q.planned)+'</b>'+T(' کار می‌کردی؛ ',' done; '):T('روی خط مستقیم تا موعد تا امروز باید ','On a straight line to the deadline you should have ')+'<b>'+hrs(q.planned)+'</b>'+T(' کار می‌کردی؛ ',' done; '))+T('انجام‌شده: ','done: ')+'<b>'+hrs(q.spent)+'</b></div>'
  +'<div style="position:relative;height:8px;border-radius:6px;background:#8883;margin:6px 0"><i style="position:absolute;inset-block:0;inset-inline-start:0;width:'+W(q.spent)+'%;background:'+col+';border-radius:6px"></i><b style="position:absolute;top:-3px;inset-inline-start:'+W(q.planned)+'%;width:2px;height:14px;background:currentColor;opacity:.7" title="'+T('باید اینجا می‌بودی','Plan')+'"></b></div></div>';
 const tl=[];
 if(q.left>0&&!q.done)tl.push('🎯 '+T('سهمیه‌ی تطبیقی امروز: <b>'+hrs(q.target)+'</b>'+(q.extra>5?' ('+hrs(q.base)+' + '+hrs(q.extra)+' جبران عقب‌افتادگی)':'')+(q.todayMin?'؛ تا الان '+hrs(q.todayMin):''),'Adaptive share for today: <b>'+hrs(q.target)+'</b>'+(q.extra>5?' ('+hrs(q.base)+' + '+hrs(q.extra)+' catch-up)':'')+(q.todayMin?'; so far '+hrs(q.todayMin):'')));
 if(q.due&&q.left>0&&!q.done){const enough=q.base*q.left>=q.rem-5;tl.push(enough?'✅ '+T('اگر طبق برنامه بروی، ساعت برنامه‌ات تا موعد کافی است.','If you follow it, your planned hours are enough until the deadline.'):'⚠ '+T('ساعت برنامه‌ات کافی نیست: کمبود '+hrs(q.rem-q.base*q.left)+'؛ روزی '+hrs(q.need)+' لازم است.','Your planned hours are not enough: short by '+hrs(q.rem-q.base*q.left)+'; you need '+hrs(q.need)+' a day.'))}
 if(q.delay!==null&&!q.done)tl.push('📅 '+T('طبق برنامه '+fmtD(q.PF)+' تمام می‌شد؛ با ریتم واقعی ۱۴ روز اخیر '+fmtD(q.Fnow)+' ('+(q.delay>0?dys(q.delay)+' دیرتر از برنامه':q.delay<0?dys(q.delay)+' زودتر از برنامه':'همان روز')+(q.lateDue>0?'، ⚠ '+dys(q.lateDue)+' بعد از موعد':q.lateDue!==null&&q.due?'، ✅ قبل از موعد':'')+').','On plan you would finish '+fmtD(q.PF)+'; at your real 14-day pace '+fmtD(q.Fnow)+' ('+(q.delay>0?dys(q.delay)+' later than plan':q.delay<0?dys(q.delay)+' earlier than plan':'same day')+(q.lateDue>0?', ⚠ '+dys(q.lateDue)+' after the deadline':q.lateDue!==null&&q.due?', ✅ before the deadline':'')+').'));
 if(q.Fplan&&!q.done&&q.gap>5)tl.push('🔁 '+T('اگر از امروز دقیقاً طبق برنامه بروی: '+fmtD(q.Fplan)+'.','If from today you follow the plan exactly: '+fmtD(q.Fplan)+'.'));
 h+=tl.map(x=>'<div style="margin:4px 0">'+x+'</div>').join('');
 if(q.led.length){h+='<div class="m" style="margin-top:8px">'+T('۷ روز اخیر: هر روز چقدر جلو یا عقب انداخت','Last 7 days: how much each day moved you')+'</div><div style="display:flex;gap:4px;align-items:flex-end;height:64px;margin:4px 0">'
  +q.led.map(r=>{const hh=Math.max(4,Math.min(100,r.a/q.base*50)),c=r.a>=q.base?'#10b981':r.a>0?'#f59e0b':'#ef4444';return'<div style="flex:1;text-align:center;font-size:.68rem" title="'+esc(fmtD(r.d))+'"><div style="height:'+hh*0.5+'px;background:'+c+';border-radius:4px 4px 0 0;margin-top:'+(50-hh*0.5)+'px"></div><div style="color:'+c+'"><span dir="ltr">'+(r.delta>=0?'+':'−')+nf(Math.abs(r.delta))+'</span></div></div>'}).join('')+'</div>'
  +'<div class="m">'+T('عدد زیر هر ستون = روز جلو (+) یا عقب (−) نسبت به ریتم برنامه','Number under each bar = days ahead (+) or behind (−) your planned pace')+'</div>'}
 if(q.w7>0)h+='<div style="margin-top:8px">🕳 '+T('این هفته <b>'+hrs(q.w7)+'</b> وقت تلف‌شده ثبت شده؛ اگر صرف این پروژه می‌شد ≈ <b>'+dys(q.wDays)+'</b> جلوتر بودی.','This week <b>'+hrs(q.w7)+'</b> was logged as wasted; spent on this project that would be ≈ <b>'+dys(q.wDays)+'</b> ahead.')+'</div>';
 return h+'</details>'}
const _r=render;render=function(){const r=_r.apply(this,arguments);try{document.querySelectorAll('.fcb').forEach(b=>{if(b.querySelector('.pcx'))return;const i=b.querySelector('[data-fc="pd"]');if(!i)return;const p=(window.daniProjects&&window.daniProjects.list()||[]).find(q=>q.id===i.dataset.p);if(!p)return;const h=card(p);if(h)b.insertAdjacentHTML('beforeend',h)})}catch(e){console.error('pace',e)}return r};
})();
