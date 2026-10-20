const test=require('node:test');
const assert=require('node:assert/strict');
const cities=require('../api/cities.js');
async function request(query,method='GET'){
 let status=200,data,headers={};
 await cities({method,query},{setHeader(k,v){headers[k]=v},status(n){status=n;return this},json(x){data=x;return this}});
 return {status,data,headers};
}
test('global dataset covers 30k+ cities and 200+ countries',async()=>{
 const r=await request({mode:'countries'});
 assert.equal(r.status,200);
 assert.ok(r.data.totalCities>=30000);
 assert.ok(r.data.countries.length>=200);
 for(const cc of ['FR','GB','JP','US','KZ','IN','AU','EG','BR','ZA','NZ'])assert.ok(r.data.countries.includes(cc));
});
test('large and small countries both searchable',async()=>{
 for(const [country,term,name] of [['FR','Paris','Paris'],['JP','Osaka','Osaka'],['GB','London','London'],['BF','Zorgo','Zorgo']]){
  const r=await request({q:term,country});
  assert.equal(r.status,200);
  assert.ok(r.data.results.some(v=>v.city===name&&v.country===country),country+' '+term);
 }
});
test('common Russian names and Cyrillic transliteration find cities',async()=>{
 for(const [country,term,name] of [['FR','париж','Paris'],['JP','осака','Osaka'],['DE','берлин','Berlin']]){
  const r=await request({q:term,country});
  assert.equal(r.status,200);
  assert.ok(r.data.results.some(v=>v.city===name),term);
 }
});
test('invalid countries and HTTP methods are rejected',async()=>{
 assert.equal((await request({q:'Paris',country:'ZZ'})).status,400);
 assert.equal((await request({q:'Paris'},'POST')).status,405);
});
test('directory returns compact suggestions and stays country scoped',async()=>{
 const r=await request({q:'new',country:'US'});
 assert.equal(r.status,200);
 assert.ok(r.data.results.length<=24);
 assert.ok(r.data.results.every(x=>x.country==='US'));
});
