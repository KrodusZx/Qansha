'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {calculateTrip}=require('../trip-planner');

test('trip cost includes round-trip flights per traveler, rooms per night, and daily costs per traveler',()=>{
 assert.deepEqual(calculateTrip({days:7,nights:6,travelers:2,rooms:1,flight:300,hotel:70,daily:50,budget:2000}),
  {flights:600,stay:420,everyday:700,total:1720,perPerson:860,remaining:280});
 assert.deepEqual(calculateTrip({days:1,nights:0,travelers:1,rooms:1,flight:0,hotel:0,daily:35,budget:20}),
  {flights:0,stay:0,everyday:35,total:35,perPerson:35,remaining:-15});
 assert.equal(calculateTrip({days:0,nights:0,travelers:1,rooms:1,flight:0,hotel:0,daily:0,budget:0}),null);
});

test('visible destinations include many unpriced cities without adding fictitious costs',()=>{
 const src=fs.readFileSync(require('node:path').join(__dirname,'../cost-guide.js'),'utf8');
 const fragment=src.slice(src.indexOf(' const DATA='),src.indexOf(' const byLang='));
 const {ALL,STR}=vm.runInNewContext(fragment.replaceAll(' const ',' var ')+';({ALL,STR})');
 assert.ok(ALL.length>=80);
 assert.equal(ALL.filter(city=>Number.isFinite(city.daily)).length,17);
 for(const lang of ['ru','kk','en'])assert.ok(STR[lang].plannerTitle);
});
