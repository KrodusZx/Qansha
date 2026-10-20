'use strict';
/**
 * Defense-in-depth for public Qansha read-only APIs.
 * This limiter is intentionally best-effort, PER SERVERLESS INSTANCE.
 * It is NOT a replacement for distributed edge/WAF rate limiting.
 */
const limits = new Map();
const MAX_IDENTITIES = 4000;
const MAX_QUERY_CHARS = 4200;
const WINDOW = 60_000;
const LONG_WINDOW = 15 * 60_000;
const RULES = Object.freeze({
  search: { perMinute: 30, perQuarter: 180, globalMinute: 320 },
  cities: { perMinute: 100, perQuarter: 850, globalMinute: 1800 },
  locations: { perMinute: 90, perQuarter: 700, globalMinute: 1600 }
});
function header(req,name) {
  const h = req.headers || {};
  const v = h[name] || h[name.toLowerCase()];
  return Array.isArray(v) ? String(v[0] || '') : String(v || '');
}
function ipOf(req) {
  // Vercel's infrastructure supplies these values. Avoid using arbitrary
  // client-provided identifiers or fingerprinting for rate-limit keys.
  const supplied = header(req,'x-real-ip') || header(req,'x-vercel-forwarded-for') ||
    header(req,'x-forwarded-for').split(',').at(-1) || req.socket?.remoteAddress || 'unknown';
  return String(supplied).trim().slice(0,110);
}
function charge(req,res,{scope='search',weight=1}={}) {
  const rule = RULES[scope] || RULES.search;
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method !== 'GET'){
    res.setHeader('Allow','GET');
    res.status(405).json({error:'Метод не поддерживается.'});
    return false;
  }
  if((req.url || '').length > MAX_QUERY_CHARS ||
     Object.keys(req.query || {}).length > 20) {
    res.status(414).json({error:'Слишком длинный запрос.'});
    return false;
  }
  // Blocks ordinary browser cross-site calls. Not authentication: custom
  // clients can spoof Fetch Metadata; WAF remains necessary.
  const site=header(req,'sec-fetch-site');
  if(site==='cross-site'){
    res.status(403).json({error:'Поиск доступен с сайта Qansha?.'});
    return false;
  }
  const now=Date.now();
  if(limits.size > MAX_IDENTITIES) {
    for(const [key,value] of limits) {
      if(now-value.last>LONG_WINDOW)limits.delete(key);
    }
    if(limits.size>MAX_IDENTITIES)limits.clear();
  }
  const key=scope+':'+ipOf(req),globalKey=scope+':__all__';
  const slots=[key,globalKey].map(k=>{
    let state=limits.get(k);
    if(!state){state={shortStart:now,shortCount:0,longStart:now,longCount:0,last:now};limits.set(k,state)}
    if(now-state.shortStart>=WINDOW){state.shortStart=now;state.shortCount=0}
    if(now-state.longStart>=LONG_WINDOW){state.longStart=now;state.longCount=0}
    state.last=now;return state;
  });
  const [personal,global]=slots;
  const threshold=personal.shortCount+weight>rule.perMinute ||
    personal.longCount+weight>rule.perQuarter ||
    global.shortCount+weight>rule.globalMinute;
  if(threshold){
    const seconds=Math.max(1,Math.ceil(
      personal.longCount+weight>rule.perQuarter
        ? (LONG_WINDOW-(now-personal.longStart))/1000
        : (WINDOW-(now-personal.shortStart))/1000
    ));
    res.setHeader('Retry-After',String(seconds));
    res.status(429).json({error:'Слишком много запросов. Подождите немного и попробуйте снова.'});
    return false;
  }
  personal.shortCount+=weight;personal.longCount+=weight;
  global.shortCount+=weight;global.longCount+=weight;
  return true;
}
module.exports={charge};
