'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const search=require('../api/search');
const iso=n=>new Date(Date.now()+n*86400000).toISOString().slice(0,10);
const segment=(from,to)=>({
 departure_airport:{id:from,time:iso(10)+' 08:15'},
 arrival_airport:{id:to,time:iso(10)+' 11:20'},
 airline:'Example Air',flight_number:'EX 101',duration:185
});
const params={origin:'NQZ',destination:'CDG',depart:iso(10),returnDate:iso(17),adults:'3',tripType:'roundtrip',travelClass:'3',stops:'2'};
async function call(query,fixture){
 const previous=global.fetch,key=process.env.SERPAPI_API_KEY,calls=[];
 process.env.SERPAPI_API_KEY='test-placeholder-not-a-real-key';
 global.fetch=async url=>{
  calls.push(new URL(url));
  return {ok:true,json:async()=>fixture};
 };
 let statusCode=200,body=null;
 const req={method:'GET',query,url:'/api/search?'+new URLSearchParams(query),headers:{'x-real-ip':'192.0.2.77'}};
 const res={setHeader(){},status(code){statusCode=code;return this},json(payload){body=payload;return this}};
 try{await search(req,res);return {statusCode,body,calls}}
 finally{
  global.fetch=previous;
  if(key===undefined)delete process.env.SERPAPI_API_KEY;else process.env.SERPAPI_API_KEY=key;
 }
}
test('roundtrip uses real round-trip query and does not assemble two one-way fares',async()=>{
 const result=await call({...params,kind:'flights'},{
  best_flights:[{price:1320,total_duration:185,flights:[segment('NQZ','CDG')],departure_token:'DEPARTURE_token_123'}]
 });
 assert.equal(result.statusCode,200);
 assert.equal(result.calls.length,1);
 const query=result.calls[0].searchParams;
 assert.equal(query.get('type'),'1');
 assert.equal(query.get('adults'),'3');
 assert.equal(query.get('travel_class'),'3');
 assert.equal(query.get('stops'),'2');
 assert.equal(query.get('return_date'),params.returnDate);
 assert.equal(result.body.offers[0].fareType,'roundtrip-preview');
 assert.equal(result.body.offers[0].price,1320);
 assert.equal(result.body.offers[0].bookingToken,null);
});
test('return search uses same direction, same dates and selection token',async()=>{
 const result=await call({...params,kind:'flightReturns',departureToken:'DEPARTURE_token_456'},{
  other_flights:[{price:1475,total_duration:195,flights:[segment('CDG','NQZ')],booking_token:'BOOKING_token_789'}]
 });
 assert.equal(result.statusCode,200);
 assert.equal(result.calls.length,1);
 const query=result.calls[0].searchParams;
 assert.equal(query.get('type'),'1');
 assert.equal(query.get('departure_id'),'NQZ');
 assert.equal(query.get('arrival_id'),'CDG');
 assert.equal(query.get('departure_token'),'DEPARTURE_token_456');
 assert.equal(result.body.offers[0].price,1475);
 assert.equal(result.body.offers[0].fareType,'roundtrip-return');
 assert.equal(result.body.offers[0].bookingToken,'BOOKING_token_789');
});
test('invalid cabin class is rejected before an external request',async()=>{
 const result=await call({...params,kind:'flights',travelClass:'99'},{});
 assert.equal(result.statusCode,400);
 assert.equal(result.calls.length,0);
});

test('Booking.com hotel source normalizes price and links without inventing availability',async()=>{
 const result=await call({kind:'hotels',source:'booking',city:'PAR',cityName:'Paris',checkIn:iso(10),checkOut:iso(13),travelers:'2'},{
  properties:[{property_id:12345,name:'Example Paris Hotel',type:'Hotel',hotel_class:4,rating:9.0,
   currency:'EUR',extracted_price:456.78,free_cancellation:true,thumbnail:'https://cf.bstatic.com/image.jpg',
   link:'https://www.booking.com/hotel/fr/example.html?checkin=2026-11-01',
   rooms:[{name:'Double room'}]}]
 });
 assert.equal(result.statusCode,200);
 assert.equal(result.calls[0].searchParams.get('engine'),'booking');
 assert.equal(result.calls[0].searchParams.get('currency'),'EUR');
 assert.equal(result.body.offers.length,1);
 assert.equal(result.body.offers[0].price,456.78);
 assert.equal(result.body.offers[0].rating,4.5);
 assert.equal(result.body.offers[0].rawRating,9);
 assert.equal(result.body.offers[0].bookingUrl.includes('booking.com'),true);
 assert.equal(result.body.offers[0].propertyToken,null);
});
