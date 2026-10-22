(() => {
 'use strict';
 const codes=['KZT','USD','RUB','CNY','UZS','TJS','KGS','EUR'];
 // Dated official NBK snapshot is used only while fresh rates are loading or unavailable.
 const fallback={KZT:1,USD:450.69,RUB:5.45,CNY:67.49,UZS:.0374,TJS:48.99,KGS:5.15,EUR:505.04};
 let rates={...fallback},asOf='2026-10-21',fresh=false,currency='KZT';
 const locale=lang=>lang==='kk'?'kk-KZ':lang==='en'?'en-US':'ru-RU';
 const convert=(amount,from='EUR',to=currency)=>Number(amount)*rates[from]/rates[to];
 const format=(amount,lang='ru',from='EUR')=>{
  if(!Number.isFinite(amount))return '—';
  // The NBK feed can omit a less common currency. Keep that tariff legible
  // in its original unit instead of rendering NaN in the selected currency.
  if(!Number.isFinite(rates[from]))return new Intl.NumberFormat(locale(lang),{style:'currency',currency:from,maximumFractionDigits:2}).format(amount);
  const digits=['KZT','UZS'].includes(currency)?0:2;
  return new Intl.NumberFormat(locale(lang),{style:'currency',currency,maximumFractionDigits:digits}).format(convert(amount,from));
 };
 const get=()=>({currency,rates:{...rates},asOf,fresh});
 function setCurrency(next){
  if(!codes.includes(next)||next===currency)return;
  const previous=currency;currency=next;
  window.dispatchEvent(new CustomEvent('qansha:currency',{detail:{previous,currency}}));
 }
 async function refresh(){
  try{
   const response=await fetch('/api/rates',{headers:{Accept:'application/json'}});
   if(!response.ok)throw Error('rates unavailable');
   const data=await response.json();
   if(!codes.every(code=>Number.isFinite(data.rates?.[code])&&data.rates[code]>0))throw Error('invalid rates');
   rates=data.rates;asOf=data.date;fresh=true;
   window.dispatchEvent(new Event('qansha:rates'));
  }catch(error){console.warn('Qansha: dated NBK exchange rates are shown',error);}
 }
 window.QanshaMoney={codes,get,convert,format,setCurrency,refresh};
 refresh();
})();
