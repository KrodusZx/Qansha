'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

test('every visible city-guide label has Russian, Kazakh, and English translations',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const js=fs.readFileSync(path.join(__dirname,'../cost-guide.js'),'utf8');
 const keys=[...html.matchAll(/data-i18n="([^"]+)"/g)].map(x=>x[1]);
 for(const key of [...new Set(keys)]){
  const count=js.split(key+":'").length-1;
  assert.equal(count,3,'translation missing for '+key);
 }
});

test('language control persists the choice and updates the whole document',()=>{
 const js=fs.readFileSync(path.join(__dirname,'../cost-guide.js'),'utf8');
 assert.match(js,/localStorage\.setItem\('qansha_cost_lang',lang\)/);
 assert.match(js,/document\.documentElement\.lang=lang/);
 assert.match(js,/document\.querySelectorAll\('\[data-i18n\]'\)/);
});
