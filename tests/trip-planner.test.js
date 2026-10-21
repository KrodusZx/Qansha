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

test('National Bank rates normalize the quoted quantity of Uzbek som',()=>{
 const {parseRates}=require('../api/rates');
 const xml='<rss><channel>'+[['EUR',505.04,1],['USD',450.69,1],['RUB',5.45,1],['CNY',67.49,1],['UZS',3.74,100],['TJS',48.99,1],['KGS',5.15,1]].map(([code,rate,quant])=>`<item><title>${code}</title><description>${rate}</description><quant>${quant}</quant><pubDate>21.10.2026</pubDate></item>`).join('')+'</channel></rss>';
 const result=parseRates(xml);
 assert.equal(result.rates.UZS,.0374);
 assert.equal(result.rates.EUR,505.04);
 assert.equal(result.date,'21.10.2026');
});

test('visible destinations include many unpriced cities without adding fictitious costs',()=>{
 const src=fs.readFileSync(require('node:path').join(__dirname,'../cost-guide.js'),'utf8');
 const fragment=src.slice(src.indexOf(' const DATA='),src.indexOf(' const byLang='));
 const {ALL,STR}=vm.runInNewContext(fragment.replaceAll(' const ',' var ')+';({ALL,STR})');
 assert.ok(ALL.length>=80);
 assert.equal(ALL.filter(city=>Number.isFinite(city.daily)).length,61);
 assert.ok(ALL.some(city=>city.en==='Shanghai'&&city.source?.includes('budgetyourtrip.com')));
 assert.ok(ALL.some(city=>city.en==='Astana'&&city.source?.includes('numbeo.com')));
 assert.equal(ALL.find(city=>city.en==='Shanghai').daily,137-170/2);
 assert.equal(ALL.find(city=>city.en==='London').foodDay,79);
 assert.equal(ALL.find(city=>city.en==='London').localTransportDay,34);
 assert.equal(ALL.find(city=>city.en==='Bishkek').dinnerTwo,2500);
 assert.equal(new Set(ALL.map(city=>city.country+'|'+city.en)).size,ALL.length);
 assert.equal(ALL.find(city=>city.en==='Astana').hotel,null);
 assert.equal(ALL.find(city=>city.en==='Almaty').daily,undefined);
 assert.ok(ALL.filter(city=>Number.isFinite(city.daily)).every(city=>city.source&&city.checked));
 assert.equal(ALL.find(city=>city.en==='Tokyo').daily,178-149/2);
 for(const lang of ['ru','kk','en'])assert.ok(STR[lang].plannerTitle);
});

test('search profile precedes planner, trip result, comparison, and city directory',()=>{
 const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
 assert.ok(html.indexOf('id="citySearchForm"')<html.indexOf('id="cityProfile"'));
 assert.ok(html.indexOf('id="cityProfile"')<html.indexOf('id="planner"'));
 assert.ok(html.indexOf('id="noData"')<html.indexOf('id="planner"'));
 assert.ok(html.indexOf('id="planner"')<html.indexOf('class="planner-result"'));
 assert.ok(html.indexOf('id="planner"')<html.indexOf('id="compare"'));
 assert.ok(html.indexOf('id="compare"')<html.indexOf('id="cities"'));
 assert.ok(html.indexOf('id="cities"')<html.indexOf('id="method"'));
 const guide=fs.readFileSync(require('node:path').join(__dirname,'../cost-guide.js'),'utf8');
 const plannerSelection=guide.slice(guide.indexOf('selectCity:id=>'),guide.indexOf("}};lang=['ru'"));
 assert.ok(plannerSelection.includes('selectedCity=p'));
 assert.ok(!plannerSelection.includes('showProfile('));
});

test('search never schedules a later scroll after the traveler starts swiping',()=>{
 const guide=fs.readFileSync(require('node:path').join(__dirname,'../cost-guide.js'),'utf8');
 const choose=guide.slice(guide.indexOf(' function chooseCity('),guide.indexOf(" document.addEventListener('click'"));
 assert.match(choose,/showProfile\(local,false\)/);
 assert.match(choose,/showUnknown\([^;]+,false\)/);
 assert.doesNotMatch(guide,/scrollTimer|scrollIntoView/);
});
