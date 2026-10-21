'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const path=require('node:path'),cities=require('../api/cities');
async function cityQuery(query){
 let status=200,body;
 const req={method:'GET',headers:{'x-real-ip':'192.0.2.241'},query,url:'/api/cities?'+new URLSearchParams(query)};
 const res={setHeader(){},status(s){status=s;return this},json(x){body=x;return this}};
 await cities(req,res);return {status,body};
}
test('city guide supports worldwide lookup without implying every city has price data',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const js=fs.readFileSync(path.join(__dirname,'../cost-guide.js'),'utf8');
 for(const id of ['citySearch','citySuggestions','compareOne','compareTwo','compareResult','priceGrid'])
  assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(js,/fetch\('\/api\/cities\?q=/);
 assert.match(js,/function showUnknown/);
 assert.match(html,/не подставляем чужие или выдуманные цифры/i);
 assert.doesNotMatch(html,/id="flightForm"|id="hotelForm"/);
});
test('global city directory includes 30k+ cities',async()=>{
 const {status,body}=await cityQuery({mode:'countries'});
 assert.equal(status,200);assert.ok(body.totalCities>30000);
 assert.ok(body.countries.length>200);
});
test('cities across countries are directly searchable',async()=>{
 for(const [name,country] of [['Astana','KZ'],['Tokyo','JP'],['London','GB'],['Berlin','DE']]){
  const {status,body}=await cityQuery({q:name});
  assert.equal(status,200);
  assert.ok(body.results.some(x=>x.country===country),name);
 }
});
test('country browsing allows more than preselected favorites',async()=>{
 const {status,body}=await cityQuery({q:'',country:'DE'});
 assert.equal(status,200);
 assert.ok(body.results.length>=15);
 assert.ok(body.results.every(x=>x.country==='DE'));
});
test('homepage is now a city guide without flight and hotel metasearch controls',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 assert.doesNotMatch(html,/id="flightForm"|id="hotelForm"|google\.com\/travel/i);
});
