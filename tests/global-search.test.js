'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const search=require('../api/search');

test('paused metasearch never calls the paid provider',async()=>{
 const previous=global.fetch;let calls=0,statusCode=200,body=null,headers={};
 global.fetch=async()=>{calls++;throw new Error('external provider must not be called')};
 const req={method:'GET',query:{kind:'flights'},url:'/api/search?kind=flights',headers:{'x-real-ip':'192.0.2.77'}};
 const res={setHeader(k,v){headers[k]=v},status(code){statusCode=code;return this},json(payload){body=payload;return this}};
 try{
  await search(req,res);
  assert.equal(statusCode,410);
  assert.equal(calls,0);
  assert.equal(headers['Cache-Control'],'no-store');
  assert.match(body.error,/temporarily paused/);
 }finally{global.fetch=previous;}
});
