'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const path=require('node:path'),cities=require('../api/cities');
async function cityQuery(query){
 let status=200,body;
 const req={method:'GET',headers:{'x-real-ip':'192.0.2.241'},query,url:'/api/cities?'+new URLSearchParams(query)};
 const res={setHeader(){},status(s){status=s;return this},json(x){body=x;return this}};
 await cities(req,res);return {status,body};
}
test('compare picker has a worldwide searchable directory and does not imply all cities have prices',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const js=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
 for(const id of ['compareLeft','compareRight','compareLeftList','compareRightList','compareCityCount','compareMore'])
  assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(js,/compareFindCities\(side\)/);
 assert.match(js,/comparePlanInputs\(side,city\)/);
 assert.match(js,/needsPlan:true/);
 assert.match(js,/tr\('Как рассчитана стоимость'\)/);
});
test('global comparison city directory includes 30k+ cities',async()=>{
 const {status,body}=await cityQuery({mode:'countries'});
 assert.equal(status,200);assert.ok(body.totalCities>30000);
 assert.ok(body.countries.length>200);
});
test('cities across countries are directly searchable in compare picker',async()=>{
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
test('hotel filter includes maximum and minimum price in displayed currency',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const js=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
 assert.match(html,/id="hotelMinPrice"/);assert.match(html,/id="hotelMaxPrice"/);
 assert.match(html,/value="expensive"/);assert.match(html,/data-hotel-min-kzt="30000"/);
 assert.match(js,/o\.price>=f\.min/);assert.match(js,/f\.sort==='expensive'/);
});
