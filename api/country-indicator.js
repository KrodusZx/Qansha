/** Latest published annual consumer-price inflation, by country.
 * World Bank WDI indicator FP.CPI.TOTL.ZG. This percentage is not a price
 * estimate for any city. Some WDI observations originate with the IMF.
 */
module.exports = async (req, res) => {
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','public, s-maxage=86400, stale-while-revalidate=86400');
  const country=String(req.query?.country||'').toUpperCase();
  if(!/^[A-Z]{2}$/.test(country))return res.status(400).json({error:'Invalid country code'});
  try{
    const url=`https://api.worldbank.org/v2/country/${country}/indicator/FP.CPI.TOTL.ZG?format=json&per_page=15`;
    const response=await fetch(url,{signal:AbortSignal.timeout(6500)});
    if(!response.ok)throw new Error('World Bank unavailable');
    const payload=await response.json();
    const entry=Array.isArray(payload?.[1])?payload[1].find(row=>Number.isFinite(row.value)):null;
    if(!entry)return res.status(200).json({country,value:null,source:url});
    return res.status(200).json({country,value:entry.value,year:entry.date,source:url,sourceName:'World Bank WDI / IMF',indicator:'FP.CPI.TOTL.ZG'});
  }catch{return res.status(503).json({error:'Country indicator unavailable'});}
};
