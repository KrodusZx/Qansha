'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const authConfig=require('../api/auth-config');
function query(env,method='GET'){
 const before={SUPABASE_URL:process.env.SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY:process.env.SUPABASE_PUBLISHABLE_KEY,SUPABASE_ANON_KEY:process.env.SUPABASE_ANON_KEY};
 for(const k of Object.keys(before))delete process.env[k];
 for(const [k,v] of Object.entries(env))process.env[k]=v;
 let statusCode=200,body=null;
 const res={setHeader(){},status(n){statusCode=n;return this},json(b){body=b;return this}};
 try{authConfig({method},res);return {statusCode,body}}
 finally{for(const [k,v] of Object.entries(before)){if(v===undefined)delete process.env[k];else process.env[k]=v}}
}
test('auth config stays disabled when unset or secret provided',()=>{
 assert.deepEqual(query({}).body,{configured:false});
 assert.deepEqual(query({SUPABASE_URL:'https://demo.supabase.co',SUPABASE_PUBLISHABLE_KEY:'sb_secret_dont_expose_me'}).body,{configured:false});
 assert.deepEqual(query({SUPABASE_URL:'https://example.org',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_abcdefghijklmno'}).body,{configured:false});
});
test('auth config returns only URL and public key, never a private key',()=>{
 const result=query({SUPABASE_URL:'https://demo-project.supabase.co',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_abcdefghijklmno'});
 assert.equal(result.statusCode,200);
 assert.deepEqual(result.body,{configured:true,supabaseUrl:'https://demo-project.supabase.co',supabaseAnonKey:'sb_publishable_abcdefghijklmno'});
 assert.equal(query({},'POST').statusCode,405);
});
test('account markup exposes required fields and recovery affordances',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const js=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
 for(const id of ['authForm','authPassword','authConfirm','authName','authEmail','authForgot','authBack','authUser','logOut','authMessage','authUnavailable'])
  assert.match(html,new RegExp('id="'+id+'"'));
 for(const fn of ['signUp','signInWithPassword','resetPasswordForEmail','updateUser','signOut'])
  assert.ok(js.includes('auth.'+fn),fn);
 assert.match(js,/detectSessionInUrl:true/);
 assert.match(js,/if\(!authReady\|\|!state\.supa\)/);
 assert.ok(!html.includes('id="sendLink"'));
});
