'use strict';
const CODES=['EUR','USD','RUB','CNY','UZS','TJS','KGS'];
const OPTIONAL_CODES=['TRY','GEL','AED','CZK','JPY','CHF','ISK','KRW','GBP','CAD','HUF','PLN','IDR','THB','AUD','INR','MAD','MYR','VND'];
const NBK_URL='https://nationalbank.kz/rss/rates_all.xml';

function parseRates(xml){
 const rates={KZT:1};let date='';
 for(const match of xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)){
  const item=match[1],value=tag=>item.match(new RegExp('<'+tag+'(?:\\s[^>]*)?>([^<]+)<\\/'+tag+'>','i'))?.[1]?.trim();
  const code=value('title');
  if(!CODES.includes(code)&&!OPTIONAL_CODES.includes(code))continue;
  const rate=Number(value('description')?.replace(',','.'));
  const quant=Number(value('quant')||1);
  if(Number.isFinite(rate)&&rate>0&&Number.isFinite(quant)&&quant>0)rates[code]=rate/quant;
  date ||= value('pubDate')||'';
 }
 if(!CODES.every(code=>Number.isFinite(rates[code])&&rates[code]>0))throw Error('Incomplete NBK rates');
 return {rates,date};
}

module.exports=async function handler(req,res){
 if(req.method!=='GET')return res.status(405).setHeader('Allow','GET').end();
 try{
  const response=await fetch(NBK_URL,{signal:AbortSignal.timeout(6000)});
  if(!response.ok)throw Error('NBK status '+response.status);
  const xml=await response.text();
  if(xml.length>150000)throw Error('Unexpected NBK response size');
  const result=parseRates(xml);
  res.setHeader('Cache-Control','public, s-maxage=21600, stale-while-revalidate=3600');
  return res.status(200).json(result);
 }catch(error){console.error('NBK rates unavailable:',error.message);return res.status(503).json({error:'rates_unavailable'});}
};
module.exports.parseRates=parseRates;
