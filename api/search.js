/** Qansha? Search API for Vercel Node.js functions.
 * Real-price integrations require a working Amadeus developer account and keys.
 * Testing environment may contain limited, non-bookable example offers.
 * No Amadeus credentials are ever sent to the web browser.
 */

const HOST = process.env.AMADEUS_ENV === 'production'
  ? 'https://api.amadeus.com' : 'https://test.api.amadeus.com';
let storedToken = null;
const VALID_CODE = /^[A-Z]{3}$/;
const VALID_DATE = /^\d{4}-\d{2}-\d{2}$/;

function textParam(value) { return Array.isArray(value) ? value[0] : String(value ?? ''); }
function validDate(value) {
  if (!VALID_DATE.test(value)) return false;
  const date = new Date(value + 'T12:00:00Z');
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}
function bad(message, status = 400) { const error = new Error(message); error.status = status; throw error; }
function allowedDay(date) {
  const utc = Date.parse(date + 'T00:00:00Z');
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  return utc >= today.getTime() && utc <= today.getTime() + 365 * 86400000;
}
function errMsg(response) {
  return response.status === 429 ? 'Лимит запросов API. Попробуйте позже.'
    : response.status === 401 || response.status === 403 ? 'Нет доступа к Amadeus API. Проверьте ключи и среду.'
    : `Поставщик временно недоступен (HTTP ${response.status}).`;
}
async function amadeusToken() {
  if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET)
    bad('Онлайн-поиск пока не подключён: нужны ключи Amadeus в настройках сервера.', 503);
  if (storedToken && storedToken.expires > Date.now() + 30000) return storedToken.value;
  const body = new URLSearchParams({grant_type:'client_credentials',client_id:process.env.AMADEUS_CLIENT_ID,
    client_secret:process.env.AMADEUS_CLIENT_SECRET});
  const response = await fetch(`${HOST}/v1/security/oauth2/token`, {
    method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body,
    signal:AbortSignal.timeout(14000)
  });
  if (!response.ok) bad(errMsg(response), 502);
  const data = await response.json();
  if (!data.access_token) bad('Поставщик не выдал токен.', 502);
  storedToken = {value:data.access_token,expires:Date.now() + (data.expires_in || 900) * 1000};
  return storedToken.value;
}
async function amadeus(path, params) {
  const token = await amadeusToken();
  const url = new URL(HOST + path);
  for (const [k,v] of Object.entries(params)) if (v != null && v !== '') url.searchParams.set(k,String(v));
  const response = await fetch(url, {headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(16000)});
  if (response.status === 404) return {data:[]};
  if (!response.ok) bad(errMsg(response), response.status === 429 ? 429 : 502);
  return response.json();
}
function safeString(value){return String(value ?? '').slice(0,180);}
function flightOffer(o) {
  const price = Number(o.price?.grandTotal ?? o.price?.total);
  if (!Number.isFinite(price) || price <= 0) return null;
  const legs = (o.itineraries||[]).map(it=>({duration:safeString(it.duration),segments:(it.segments||[]).map(s=>({
    from:s.departure?.iataCode || '',to:s.arrival?.iataCode || '',
    departure:s.departure?.at || '',arrival:s.arrival?.at || '',
    carrier:s.carrierCode || '',flightNumber:s.number || '',duration:s.duration || ''
  }))}));
  return {id:safeString(o.id),kind:'flight',price,currency:o.price?.currency || 'EUR',legs,
    airlines:[...new Set(legs.flatMap(l=>l.segments.map(s=>s.carrier)))],
    seats:o.numberOfBookableSeats ?? null,
    checkedBags:(o.travelerPricings||[])[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags?.quantity ?? null
  };
}
async function searchFlights(q) {
  const origin=textParam(q.origin).toUpperCase(), destination=textParam(q.destination).toUpperCase();
  const depart=textParam(q.depart), end=textParam(q.returnDate);
  const adults=Number(q.adults || 1);
  if (!VALID_CODE.test(origin) || !VALID_CODE.test(destination) || origin===destination) bad('Укажите разные аэропорты IATA.');
  if (!validDate(depart) || !allowedDay(depart)) bad('Некорректная дата вылета.');
  if (end && (!validDate(end) || !allowedDay(end) || end <= depart)) bad('Дата возвращения должна быть позже даты вылета.');
  if (!Number.isInteger(adults) || adults<1 || adults>9) bad('Для онлайн-поиска доступны группы от 1 до 9 человек.');
  const data=await amadeus('/v2/shopping/flight-offers',{
    originLocationCode:origin,destinationLocationCode:destination,departureDate:depart,
    returnDate:end||undefined,adults,currencyCode:'EUR',max:18
  });
  const offers=(data.data||[]).map(flightOffer).filter(Boolean).sort((a,b)=>a.price-b.price);
  return {kind:'flights',offers,environment:process.env.AMADEUS_ENV==='production'?'production':'test',
    searchedAt:new Date().toISOString(), adults};
}
function hotelOffer(item, roomCount, metadata) {
  const offer=(item.offers||[]).map(o=>({o,price:Number(o.price?.total)})).filter(x=>Number.isFinite(x.price)&&x.price>0)
    .sort((a,b)=>a.price-b.price)[0];
  if (!offer) return null;
  const hotel=item.hotel||{};
  return {id:safeString(hotel.hotelId || metadata?.hotelId),kind:'hotel',name:safeString(hotel.name||metadata?.name||'Отель'),
    stars:Number(hotel.rating||metadata?.rating||0)||null,price:offer.price,
    currency:offer.o.price?.currency||'EUR',roomCount,offerId:safeString(offer.o.id),
    room:safeString(offer.o.room?.description?.text || offer.o.room?.typeEstimated?.category || ''),
    address: (metadata?.address?.lines||hotel.address?.lines||[]).join(', ').slice(0,200),
    latitude:hotel.latitude ?? metadata?.geoCode?.latitude ?? null,
    longitude:hotel.longitude ?? metadata?.geoCode?.longitude ?? null,
    checkInDate:offer.o.checkInDate||null,checkOutDate:offer.o.checkOutDate||null,
    cancellation:offer.o.policies?.cancellation?.description?.text || null};
}
async function searchHotels(q) {
  const city=textParam(q.city).toUpperCase(), checkIn=textParam(q.checkIn), checkOut=textParam(q.checkOut);
  const travelers=Number(q.travelers||1);
  if (!VALID_CODE.test(city)) bad('Некорректный код города.');
  if (!validDate(checkIn)||!validDate(checkOut)||!allowedDay(checkIn)||checkOut<=checkIn) bad('Выберите правильные даты проживания.');
  if (!Number.isInteger(travelers)||travelers<1||travelers>9) bad('Группа должна содержать от 1 до 9 гостей.');
  const nights=(Date.parse(checkOut)-Date.parse(checkIn))/86400000;
  if (nights > 30) bad('Максимальная длительность проживания — 30 ночей.');
  const rooms=Math.ceil(travelers/2);
  const adultsPerRoom=travelers===1?1:2;
  const listings=await amadeus('/v1/reference-data/locations/hotels/by-city',{cityCode:city,radius:12,radiusUnit:'KM'});
  const candidates=(listings.data||[]).filter(h=>h.hotelId).slice(0,48);
  if (!candidates.length) return {kind:'hotels',offers:[],nights,rooms,environment:process.env.AMADEUS_ENV==='production'?'production':'test',searchedAt:new Date().toISOString()};
  const meta=new Map(candidates.map(h=>[h.hotelId,h]));
  const chunks=[];for(let i=0;i<candidates.length;i+=12)chunks.push(candidates.slice(i,i+12));
  const batches=await Promise.allSettled(chunks.map(async group=>amadeus('/v3/shopping/hotel-offers',{
    hotelIds:group.map(h=>h.hotelId).join(','),adults:adultsPerRoom,roomQuantity:rooms,
    checkInDate:checkIn,checkOutDate:checkOut,currency:'EUR',bestRateOnly:'true'
  })));
  const items=batches.flatMap(b=>b.status==='fulfilled'?(b.value.data||[]):[]);
  if (!items.length && batches.every(b=>b.status==='rejected')) bad('Не удалось загрузить цены отелей у поставщика. Попробуйте другой город или даты.',502);
  const offers=items.map(h=>hotelOffer(h,rooms,meta.get(h.hotel?.hotelId))).filter(Boolean)
    .sort((a,b)=>a.price-b.price).slice(0,36);
  return {kind:'hotels',offers,rooms,nights,environment:process.env.AMADEUS_ENV==='production'?'production':'test',
    searchedAt:new Date().toISOString(),guestAllocationNote:travelers%2&&travelers>1?'Стоимость рассчитана для двух взрослых в каждом номере. При нечётном числе гостей подтвердите размещение у отеля.':null};
}
module.exports = async function handler(req,res){
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
  try{
    const kind=textParam(req.query.kind);
    const result=kind==='flights'? await searchFlights(req.query)
      :kind==='hotels'?await searchHotels(req.query)
      :bad('Укажите kind=flights или kind=hotels.');
    return res.status(200).json(result);
  }catch(err){
    const status=Number(err.status) || (err.name==='TimeoutError'?504:500);
    return res.status(status).json({error:status===500?'Ошибка сервера. Попробуйте ещё раз.':err.message});
  }
};