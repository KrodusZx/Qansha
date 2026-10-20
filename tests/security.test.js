'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {charge}=require('../lib/security');

function run({scope='search',weight=1,ip='security-test',method='GET',url='/api/search?kind=hotels',site}={}){
 const headers={};let status=200,body;
 const req={method,url,query:{kind:'hotels'},headers:{'x-real-ip':ip,...(site?{'sec-fetch-site':site}:{})}};
 const res={setHeader(k,v){headers[k.toLowerCase()]=v},status(v){status=v;return this},json(v){body=v;return this}};
 const allowed=charge(req,res,{scope,weight});
 return {allowed,status,body,headers};
}

test('request limiter allows normal GETs',()=>{
 const one=run({ip:'unit-fresh-1'});
 assert.equal(one.allowed,true);
 assert.equal(one.headers['x-content-type-options'],'nosniff');
});
test('requests are rejected if method, query or fetch-site is unsafe',()=>{
 let x=run({ip:'unit-bad-method',method:'POST'});assert.equal(x.status,405);
 x=run({ip:'unit-big-url',url:'/api/search?'+('q'.repeat(5000))});assert.equal(x.status,414);
 x=run({ip:'unit-other-site',site:'cross-site'});assert.equal(x.status,403);
 for(const s of [x])assert.equal(s.headers['cache-control'],'no-store');
});
test('expensive searches consume more quota',()=>{
 const ip='unit-weighted-1';let rejected;
 for(let i=0;i<8;i++){const result=run({ip,weight:9});if(result.status===429){rejected=result;break}}
 assert.ok(rejected,'expensive requests must be throttled');
 assert.equal(rejected.headers['cache-control'],'no-store');
 assert.ok(Number(rejected.headers['retry-after'])>=1);
 const other=run({ip:'unit-weighted-2'});assert.equal(other.allowed,true);
});
test('security headers disallow inline scripting, embedding, and loading mixed HTTP',()=>{
 const config=JSON.parse(fs.readFileSync(path.join(__dirname,'../vercel.json'),'utf8'));
 const main=config.headers.find(e=>e.source==='/(.*)');assert.ok(main);
 const map=Object.fromEntries(main.headers.map(h=>[h.key.toLowerCase(),h.value]));
 const csp=map['content-security-policy'];
 assert.ok(csp.includes("script-src 'self'") && csp.includes("https://cdn.jsdelivr.net"));
 assert.ok(!csp.includes("'unsafe-eval'")&&!csp.includes("script-src 'self' 'unsafe-inline'"));
 assert.ok(csp.includes("script-src-attr 'none'"));
 assert.ok(csp.includes("frame-ancestors 'none'"));
 assert.ok(csp.includes("object-src 'none'"));
 assert.ok(csp.includes('upgrade-insecure-requests'));
 assert.equal(map['x-frame-options'],'DENY');
 assert.ok(map['strict-transport-security'].startsWith('max-age='));
});
test('public UI does not use inline JS event handlers',()=>{
 const page=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const ui=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
 assert.doesNotMatch(page, /\son(?:error|click|load|mouseover)\s*=/i);
 assert.doesNotMatch(ui, /\son(?:error|click|load|mouseover)\s*=/i);
});
