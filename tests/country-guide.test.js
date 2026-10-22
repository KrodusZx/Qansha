const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const handler=require('../api/country-indicator');

test('country directory has 140 distinct ISO countries, including all five Central Asian countries',()=>{
 const script=fs.readFileSync(path.join(__dirname,'../country-guide.js'),'utf8');
 const groups=[...script.matchAll(/^    (central|asia|europe|americas|africa|oceania): '([^']+)'/gm)];
 const codes=groups.flatMap(([, , list])=>list.split(' '));
 assert.equal(codes.length,140);
 assert.equal(new Set(codes).size,140);
 assert.deepEqual(groups[0][2].split(' '),['KZ','KG','UZ','TJ','TM']);
});

test('national indicator uses the latest reported year and never supplies a city price',async()=>{
 const originalFetch=global.fetch;
 global.fetch=async()=>({ok:true,json:async()=>[{},[
  {date:'2025',value:9.3},{date:'2024',value:8.1}
 ]]});
 const result={statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v;return this;},status(n){this.statusCode=n;return this;},json(body){this.body=body;return this;}};
 try{
  await handler({query:{country:'KZ'}},result);
  assert.equal(result.body.value,9.3);
  assert.equal(result.body.year,'2025');
  assert.equal(result.body.indicator,'FP.CPI.TOTL.ZG');
  assert.equal(result.body.daily,undefined);
  assert.equal(result.body.city,undefined);
 }finally{global.fetch=originalFetch;}
});
