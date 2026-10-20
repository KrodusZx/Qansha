/** Qansha? 2.1: transparent fare comparison from Google Flights/Hotels via SerpApi.
 * This is not a booking engine. A flight offer is an estimate from separately-priced
 * outbound and return one-way tickets for ONE adult, extrapolated to the group.
 * Fares and multi-room availability must be rechecked with the provider.
 * Environment: SERPAPI_API_KEY. Never put a secret in client-side files.
 */
const VALID_CODE=/^[A-Z]{3}$/;
const VALID_DATE=/^\d{4}-\d{2}-\d{2}$/;
const cache=new Map();
const safe=s=>String(s??'').slice(0,180);
const txt=v=>Array.isArray(v)?v[0]:String(v??'');
function bad(message,status=400){const e=new Error(message);e.status=status;throw e}
function checkDate(x){
 if(!VALID_DATE.test(x))return false;
 const d=new Date(x+'T12:00:00Z');return !Number.isNaN(d.getTime())&&d.toISOString().startsWith(x);
}
function inRange(x){const d=Date.parse(x+'T00:00:00Z'),today=new Date();today.setUTCHours(0,0,0,0);return d>=today.getTime()&&d<=today.getTime()+365*86400000}
const env='production';
async function serp(params){
 if(!process.env.SERPAPI_API_KEY)bad('Для онлайн-поиска требуется SERPAPI_API_KEY в настройках Vercel.',503);
 const p=new URLSearchParams({api_key:process.env.SERPAPI_API_KEY,output:'json',...params});
 const key=p.toString().replace(process.env.SERPAPI_API_KEY,'[key]');
 const cached=cache.get(key); if(cached&&cached.exp>Date.now())return cached.data;
 const c=new AbortController();const timeout=setTimeout(()=>c.abort(),19500);
 try{
  const response=await fetch('https://serpapi.com/search.json?'+p.toString(),{signal:c.signal});
  if(!response.ok){const n=response.status;bad(n===429?'Лимит запросов API исчерпан. Попробуйте позже.':`Поисковый сервис недоступен (${n}).`,n===429?429:502)}
  const data=await response.json();
  if(data.error){if(/hasn't returned any results|no results for this query|no results found/i.test(data.error))return {best_flights:[],other_flights:[],properties:[]};bad('Поиск поставщика: '+safe(data.error),502);}
  if(cache.size>250)cache.clear();cache.set(key,{exp:Date.now()+120000,data});
  return data;
 }catch(e){if(e.name==='AbortError')bad('Поиск занимает слишком много времени. Попробуйте снова.',504);throw e}
 finally{clearTimeout(timeout)}
}
function offers(data){return [...(data.best_flights||[]),...(data.other_flights||[])]
 .filter(f=>Number(f.price)>0&&Array.isArray(f.flights)&&f.flights.length)
 .sort((a,b)=>Number(a.price)-Number(b.price)).slice(0,12)}
function leg(item){
 const parts=item.flights||[];
 return {duration:Number(item.total_duration)?`${item.total_duration} мин`:'',segments:parts.map(f=>({
  from:safe(f.departure_airport?.id),to:safe(f.arrival_airport?.id),
  departure:safe(f.departure_airport?.time).replace(' ','T'),
  arrival:safe(f.arrival_airport?.time).replace(' ','T'),
  carrier:safe(f.airline),flightNumber:safe(f.flight_number),duration:f.duration?`${f.duration} мин`:'',aircraft:safe(f.airplane),travelClass:safe(f.travel_class),extensions:(f.extensions||[]).slice(0,6)
 }))}
}
async function flights(q){
 const origin=txt(q.origin).toUpperCase(),destination=txt(q.destination).toUpperCase();
 const depart=txt(q.depart),back=txt(q.returnDate),adults=Number(q.adults||1);
 if(!VALID_CODE.test(origin)||!VALID_CODE.test(destination)||origin===destination)bad('Укажите разные коды аэропортов IATA.');
 const oneWay=txt(q.tripType)==='oneway';if(!checkDate(depart)||!inRange(depart)||(!oneWay&&(!checkDate(back)||!inRange(back)||back<=depart)))bad('Укажите корректные даты поездки в течение 365 дней.');
 if(!Number.isInteger(adults)||adults<1||adults>9)bad('Можно искать для 1–9 взрослых.');
 const shared={engine:'google_flights',type:'2',currency:'EUR',hl:'ru',gl:'kz',sort_by:'2',adults:'1'};
 // Two one-way searches allow us to present fully specified outbound and return flights,
 // not a misleading incomplete round-trip with unselected return service.
 const there=await serp({...shared,departure_id:origin,arrival_id:destination,outbound_date:depart});
 const outward=offers(there),combos=[];
 if(oneWay){for(let i=0;i<outward.length;i++){const a=outward[i];combos.push({id:`oneway-${i}`,kind:'flight',price:Number(a.price)*adults,currency:'EUR',perAdultPrice:Number(a.price),groupPriceIsEstimate:adults>1,fareType:'oneway',source:'Google Flights',legs:[leg(a)],airlines:[...new Set(a.flights.map(f=>safe(f.airline)).filter(Boolean))],checkedBags:null,seats:null,durations:Number(a.total_duration||0),stopCount:a.flights.length-1,bookingToken:String(a.booking_token||'').slice(0,1800)})}}
 else {
 const backAgain=await serp({...shared,departure_id:destination,arrival_id:origin,outbound_date:back});
 const returning=offers(backAgain);
 for(let i=0;i<outward.length;i++)for(let j=0;j<returning.length;j++){
  const a=outward[i],b=returning[j];const price=(Number(a.price)+Number(b.price))*adults;
  combos.push({id:`go${i}-back${j}`,kind:'flight',price,currency:'EUR',perAdultPrice:Number(a.price)+Number(b.price),groupPriceIsEstimate:adults>1,fareType:'two-one-way',source:'Google Flights',legs:[leg(a),leg(b)],airlines:[...new Set([...a.flights,...b.flights].map(f=>safe(f.airline)).filter(Boolean))],checkedBags:null,seats:null,durations:Number(a.total_duration||0)+Number(b.total_duration||0),stopCount:(a.flights.length-1)+(b.flights.length-1)});
 }}
 combos.sort((a,b)=>a.price-b.price||a.durations-b.durations);
 return {kind:'flights',source:'Google Flights',offers:combos.slice(0,48),searchedAt:new Date().toISOString(),environment:env,adults,
  pricingNote:oneWay?'Стоимость в одну сторону для одного взрослого, умноженная на число пассажиров. Это оценка, а не подтверждённое бронирование. Багаж и итоговую цену уточняйте.':'Комбинации двух отдельных билетов в одну сторону, не единый билет туда-обратно. Цена для группы ориентировочная. Багаж и наличие мест уточняйте.'};
}
async function hotels(q){
 const city=safe(txt(q.cityName)||txt(q.city));const cityCode=txt(q.city).toUpperCase();
 const checkIn=txt(q.checkIn),checkOut=txt(q.checkOut),travelers=Number(q.travelers||1);
 if(!VALID_CODE.test(cityCode)||city.length>100||!city)bad('Укажите город проживания.');
 if(!checkDate(checkIn)||!checkDate(checkOut)||!inRange(checkIn)||!inRange(checkOut)||checkOut<=checkIn)bad('Укажите корректные даты проживания.');
 if(!Number.isInteger(travelers)||travelers<1||travelers>9)bad('Можно искать для 1–9 гостей.');
 const nights=(Date.parse(checkOut)-Date.parse(checkIn))/86400000;
 if(nights>30)bad('Максимальная длительность проживания — 30 ночей.');
 const rooms=Math.ceil(travelers/2),perRoomAdults=travelers===1?1:2;
 const pageToken=txt(q.pageToken);if(pageToken&&(pageToken.length>2600||!/^[A-Za-z0-9_+=:/-]+$/.test(pageToken)))bad('Некорректная страница поиска.');
 const data=await serp({engine:'google_hotels',q:`Hotels in ${city}`,check_in_date:checkIn,check_out_date:checkOut,
  adults:String(perRoomAdults),currency:'EUR',hl:'ru',gl:'kz',sort_by:'3',...(pageToken?{next_page_token:pageToken}:{})});
 const items=[...(data.properties||[]),...(data.non_matching_properties||[])].filter(h=>h?.name);
 const result=items.map((h,i)=>{
  // Total rate is per room for selected adult count; multiply only as a disclosed estimate.
  const roomPrice=Number(h.total_rate?.extracted_lowest)||Number(h.rate_per_night?.extracted_lowest)*nights;
  if(!Number.isFinite(roomPrice)||roomPrice<=0)return null;
  const lat=h.gps_coordinates?.latitude,lon=h.gps_coordinates?.longitude;
  return {id:safe(h.property_token||`hotel-${i}`),kind:'hotel',name:safe(h.name),stars:Number(h.extracted_hotel_class)||null,
   rating:Number(h.overall_rating)||null,price:roomPrice*rooms,roomPrice,currency:'EUR',
   roomCount:rooms,checkInDate:checkIn,checkOutDate:checkOut,room:'Цена за один номер; категорию уточните у поставщика',
   address:safe(h.address),latitude:Number.isFinite(lat)?lat:null,longitude:Number.isFinite(lon)?lon:null,
   thumbnail:(String(h.images?.[0]?.thumbnail||h.images?.[0]?.original_image||'').slice(0,2400)),images:(h.images||[]).slice(0,6).map(im=>String(im.original_image||im.thumbnail||'').slice(0,2400)).filter(u=>/^https:\/\//.test(u)),propertyToken:safe(h.property_token),amenities:(h.amenities||[]).slice(0,18).map(safe),source:'Google Hotels',estimatedGroupPrice:rooms>1,propertyType:safe(h.type||'hotel'),freeCancellation:h.free_cancellation===true?true:null,
   bookingUrl: /^https:\/\//.test(h.link||'')?String(h.link).slice(0,1800):/^https:\/\//.test(h.prices?.[0]?.link||'')?String(h.prices[0].link).slice(0,1800):null};
 }).filter(Boolean).sort((a,b)=>a.price-b.price).slice(0,60);
 return {kind:'hotels',offers:result,nextPageToken:String(data.serpapi_pagination?.next_page_token||'').slice(0,2600)||null,nights,rooms,environment:env,source:'Google Hotels',searchedAt:new Date().toISOString(),
  guestAllocationNote:rooms>1?'Цена на компанию рассчитана как стоимость одного номера × число номеров. Google Hotels не подтвердил наличие нескольких одинаковых номеров; перепроверьте размещение и итоговую цену перед оплатой.':'Цену и условия номера необходимо подтвердить у поставщика.'};
}

const cleanUrl=x=>typeof x==='string'&&/^https:\/\//i.test(x)&&x.length<3500?x:null;
const imageList=items=>(Array.isArray(items)?items:[]).map(x=>typeof x==='string'?x:x?.original_image||x?.photo_url||x?.thumbnail_url||x?.thumbnail).filter(cleanUrl).slice(0,24);
const validToken=x=>typeof x==='string'&&x.length>5&&x.length<2000&&/^[A-Za-z0-9_\-=+:/]+$/.test(x);
async function hotelDetails(q){
 const token=txt(q.propertyToken),city=safe(txt(q.cityName)),checkIn=txt(q.checkIn),checkOut=txt(q.checkOut);
 if(!validToken(token)||!city||!checkDate(checkIn)||!checkDate(checkOut)||checkOut<=checkIn)bad('Неправильные данные отеля');
 const d=await serp({engine:'google_hotels',q:'Hotels in '+city,property_token:token,check_in_date:checkIn,check_out_date:checkOut,adults:String(Math.min(2,Math.max(1,Number(q.travelers)||2))),currency:'EUR',hl:'ru',gl:'kz'});
 const source=[...(d.prices||[]),...(d.featured_prices||[])];
 return {kind:'hotelDetails',name:safe(d.name),description:String(d.description||'').slice(0,800),amenities:(d.amenities||[]).slice(0,28).map(safe),images:imageList(d.images),options:source.filter(x=>cleanUrl(x.link)).slice(0,9).map(x=>({name:safe(x.source||'Поставщик'),url:cleanUrl(x.link),price:Number(x.total_rate?.extracted_lowest)||null}))}
}
async function hotelPhotos(q){
 const token=txt(q.propertyToken);if(!validToken(token))bad('Нет кода отеля');
 const d=await serp({engine:'google_hotels_photos',property_token:token});
 const photos=[...(d.photos||[]),...(d.sections||[]).flatMap(x=>x.photos||[])];
 return {kind:'hotelPhotos',images:[...new Set(imageList(photos))].slice(0,20)}
}
async function flightBooking(q){
 const token=txt(q.bookingToken);if(!validToken(token))bad('Нет предложения для бронирования');
 const d=await serp({engine:'google_flights',booking_token:token,hl:'ru',gl:'kz',currency:'EUR'});
 const src=[...(Array.isArray(d.booking_options)?d.booking_options:[]),...(Array.isArray(d.booking_options?.together)?d.booking_options.together:[]),...(Array.isArray(d.booking_options?.separate)?d.booking_options.separate:[])];
 const options=src.flatMap(x=>[x,...(x?.options||[])]).filter(x=>x&&typeof x==='object').map(x=>({name:safe(x.book_with||x.airline||x.name||'Сайт бронирования'),url:cleanUrl(x.booking_link||x.link||x.url)})).filter(x=>x.url).slice(0,10);
 return {kind:'flightBooking',options}
}

/** Optional real-price date comparison. Seven provider searches per press (uses API quota).
 * Flight figures are one-way fares for ONE adult, not complete round-trip tickets.
 * Hotel figures are estimated for ONE room for the same stay duration.
 */
async function calendar(q){
 const mode=txt(q.mode),start=txt(q.start),nights=Number(q.nights||3);
 if(!['flight','hotel'].includes(mode)||!checkDate(start)||!inRange(start))bad('Некорректная дата календаря.');
 if(!Number.isInteger(nights)||nights<1||nights>30)bad('Некорректная длительность проживания.');
 const origin=txt(q.origin).toUpperCase(),destination=txt(q.destination).toUpperCase(),city=safe(txt(q.cityName));
 if(mode==='flight'&&(!VALID_CODE.test(origin)||!VALID_CODE.test(destination)||origin===destination))bad('Укажите аэропорты.');
 if(mode==='hotel'&&!city)bad('Укажите город отеля.');
 const dates=Array.from({length:7},(_,i)=>new Date(Date.parse(start+'T12:00:00Z')+i*86400000).toISOString().slice(0,10)).filter(inRange);
 const prices={};let cursor=0;
 async function next(){while(cursor<dates.length){const date=dates[cursor++];try{
  const data=mode==='flight'?await serp({engine:'google_flights',type:'2',departure_id:origin,arrival_id:destination,outbound_date:date,currency:'EUR',hl:'ru',gl:'kz',sort_by:'2',adults:'1'}):await serp({engine:'google_hotels',q:`Hotels in ${city}`,check_in_date:date,check_out_date:new Date(Date.parse(date+'T12:00:00Z')+nights*86400000).toISOString().slice(0,10),adults:'2',currency:'EUR',hl:'ru',gl:'kz',sort_by:'3'});
  const numbers=mode==='flight'?offers(data).map(f=>Number(f.price)):(data.properties||[]).map(h=>Number(h.total_rate?.extracted_lowest)||Number(h.rate_per_night?.extracted_lowest)*nights).filter(n=>n>0);
  const found=Math.min(...numbers);if(Number.isFinite(found)&&found>0)prices[date]=found;
 }catch(e){if(e.status===503)throw e;/* missing fare, timeout or rate-limited: never invent data */}}
 }
 await Promise.all([next(),next()]);
 return {kind:'calendar',mode,prices,checked:dates.length,note:mode==='flight'?'Это минимальная найденная цена в одну сторону на одного взрослого; не билет туда-обратно.':'Это найденная стоимость одного номера за всю поездку; наличие нужно подтвердить.'};
}
module.exports=async(req,res)=>{
 res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 try{const k=txt(req.query.kind);const data=k==='flights'?await flights(req.query):k==='hotels'?await hotels(req.query):k==='calendar'?await calendar(req.query):k==='hotelDetails'?await hotelDetails(req.query):k==='hotelPhotos'?await hotelPhotos(req.query):k==='flightBooking'?await flightBooking(req.query):bad('Неизвестный запрос.');return res.status(200).json(data)}
 catch(e){const code=Number(e.status)||500;return res.status(code).json({error:code===500?'Ошибка сервера поиска. Попробуйте позднее.':e.message})}
};