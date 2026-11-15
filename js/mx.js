"use strict";
/* DANI · mx.js — کلید «ظاهر مدرن» (db.set.mx؛ پیش‌فرض روشن). فقط برای تم‌های ساده‌ی داخلی (بدون تصویر شخصیت/بسته‌ی تم) فعال می‌شود تا ویژگی‌های ویژه‌ی هر تم دست‌نخورده بماند.
   مرحله‌ی ۱: کارت‌ها، عنوان‌ها، دکمه‌ها و ورودی‌ها (mx.css). کلید در تنظیمات ← ظاهر. */
(function(){
const T=window.daniT;
const on=()=>db.set.mx!==0;
const ok=()=>{try{const S=SKINS[skId()];return !!S&&!S.hero&&!S.pack&&!S.qchar&&!S.custom}catch(e){return true}};
function apply(){const h=document.documentElement,v=on()&&ok()?'1':'0';if(h.dataset.mx!==v)h.dataset.mx=v}
H.mx_t=()=>{db.set.mx=on()?0:1;save();apply();render()};
{const _r=render;render=function(){const r=_r.apply(this,arguments);try{apply()}catch(e){}return r}}
{const _sp=setPage;setPage=function(){const h=_sp.apply(this,arguments);return typeof h==='string'&&typeof stt!=='undefined'&&stt==='look'?h+'<div class="c" id="mxcard"><h3>'+T('ظاهر مدرن','Modern look')+'</h3><div class="row"><button class="chip '+(on()?'on':'')+'" data-a="mx_t">'+(on()?T('روشن','On'):T('خاموش','Off'))+'</button></div><p class="m">'+T('کارت‌ها و دکمه‌های نرم‌تر و گردتر. تم‌های شخصیت‌دار (با تصویر و قاب جمله) ظاهر خودشان را نگه می‌دارند.','Softer, rounder cards and buttons. Character themes (with images and quote frames) keep their own look.')+'</p></div>':h}}
setTimeout(apply,0);
})();
