'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const authConfig=require('../api/auth-config');
function request(values={},method='GET'){
 const keys=['SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','SUPABASE_ANON_KEY'];
 const previous=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 for(const k of keys){if(k in values)process.env[k]=values[k];else delete process.env[k]}
 let status=200,body;
 const req={method},res={setHeader(){},status(n){status=n;return this},json(data){body=data;return this}};
 try{authConfig(req,res);return {status,body}}
 finally{for(const k of keys){if(previous[k]===undefined)delete process.env[k];else process.env[k]=previous[k]}}
}
test('Unconfigured Supabase never advertises working registration',()=>{
 const r=request();
 assert.equal(r.status,200);assert.deepEqual(r.body,{configured:false});
});
test('Public Supabase URL and publishable key can be returned to browser',()=>{
 const key='sb_publishable_'+'x'.repeat(38);
 const r=request({SUPABASE_URL:'https://demo-project.supabase.co',SUPABASE_PUBLISHABLE_KEY:key});
 assert.equal(r.body.configured,true);
 assert.equal(r.body.supabaseAnonKey,key);
 assert.equal(r.body.supabaseUrl,'https://demo-project.supabase.co');
});
test('Service-role and secret keys are never leaked',()=>{
 for(const key of ['sb_secret_'+'X'.repeat(40),'service_role_secret','not-a-public-key']){
  const r=request({SUPABASE_URL:'https://demo-project.supabase.co',SUPABASE_PUBLISHABLE_KEY:key});
  assert.deepEqual(r.body,{configured:false});
  assert.ok(!JSON.stringify(r.body).includes(key));
 }
});
test('Invalid domains and non-GET requests are rejected',()=>{
 assert.deepEqual(request({SUPABASE_URL:'http://bad.example',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_'+'x'.repeat(38)}).body,{configured:false});
 const r=request({},'POST');assert.equal(r.status,405);
});
test('Account interface supports signup, login, reset, password update and is disabled without configuration',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const app=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
 for(const id of ['authForm','authEmail','authPassword','authConfirm','authName','authUnavailable','authUser','authMessage','authSubmit','authForgot','authBack']){
  assert.match(html,new RegExp('id="'+id+'"'));
 }
 for(const operation of ['auth.signUp','auth.signInWithPassword','auth.resetPasswordForEmail','auth.updateUser','auth.signOut','auth.onAuthStateChange']){
  assert.ok(app.includes(operation),operation);
 }
 assert.ok(app.includes("!authReady||!state.supa"),'submissions only when connected');
 assert.ok(app.includes("state.supa.from('favorites').upsert"),'guest favorites migrate to account');
});
