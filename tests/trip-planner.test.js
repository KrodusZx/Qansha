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
 const xml='<rss><channel>'+[['EUR',505.04,1],['USD',450.69,1],['RUB',5.45,1],['CNY',67.49,1],['UZS',3.74,100],['TJS',48.99,1],['KGS',5.15,1],['JPY',300,100]].map(([code,rate,quant])=>`<item><title>${code}</title><description>${rate}</description><quant>${quant}</quant><pubDate>21.10.2026</pubDate></item>`).join('')+'</channel></rss>';
 const result=parseRates(xml);
 assert.equal(result.rates.UZS,.0374);
 assert.equal(result.rates.EUR,505.04);
 assert.equal(result.rates.JPY,3);
 assert.equal(result.date,'21.10.2026');
});

test('visible destinations include many unpriced cities without adding fictitious costs',()=>{
 const src=fs.readFileSync(require('node:path').join(__dirname,'../cost-guide.js'),'utf8');
 const fragment=src.slice(src.indexOf(' const DATA='),src.indexOf(' const byLang='));
 const {ALL,STR}=vm.runInNewContext(fragment.replaceAll(' const ',' var ')+';({ALL,STR})');
 assert.ok(ALL.length>=80);
 assert.equal(ALL.filter(city=>Number.isFinite(city.daily)).length,65);
 assert.ok(ALL.some(city=>city.en==='Shanghai'&&city.source?.includes('budgetyourtrip.com')));
 assert.ok(ALL.some(city=>city.en==='Astana'&&city.source?.includes('numbeo.com')));
 assert.equal(ALL.find(city=>city.en==='Shanghai').daily,137-170/2);
 assert.equal(ALL.find(city=>city.en==='London').foodDay,79);
 assert.equal(ALL.find(city=>city.en==='London').localTransportDay,34);
 assert.equal(ALL.find(city=>city.en==='Bishkek').dinnerTwo,2500);
 assert.equal(ALL.find(city=>city.en==='Bishkek').foodDay,3*600);
 assert.equal(ALL.find(city=>city.en==='Bishkek').localTransportDay,2*20);
 assert.ok(ALL.filter(city=>city.sourceType!=='editorial'&&Number.isFinite(city.daily)).every(city=>Number.isFinite(city.foodDay)));
 assert.equal(new Set(ALL.map(city=>city.country+'|'+city.en)).size,ALL.length);
 assert.equal(ALL.find(city=>city.en==='Astana').hotel,null);
 assert.ok(ALL.filter(city=>city.sourceType!=='editorial'&&Number.isFinite(city.daily)).every(city=>city.source&&city.checked));
 assert.equal(ALL.find(city=>city.en==='Tokyo').daily,68);
 for(const lang of ['ru','kk','en'])assert.ok(STR[lang].plannerTitle);
});

test('the first 17 city guides retain their original EUR estimates and are labelled editorial',()=>{
 const src=fs.readFileSync(require('node:path').join(__dirname,'../cost-guide.js'),'utf8');
 const fragment=src.slice(src.indexOf(' const DATA='),src.indexOf(' const byLang='));
 const cities=vm.runInNewContext(fragment.replaceAll(' const ',' var ')+';ALL');
 const original=[
  ['Istanbul',36,53,35,16,2],['Bangkok',32,41,23,14,1],['Paris',72,112,72,28,2.5],
  ['Tbilisi',29,37,32,13,.6],['Almaty',31,43,28,14,.9],['Tashkent',25,33,21,10,.5],
  ['Baku',36,48,34,15,.5],['Dubai',79,110,74,35,1.8],['Rome',64,93,66,28,1.7],
  ['Barcelona',59,91,57,25,2.5],['Prague',43,66,49,22,1.6],
  ['Kuala Lumpur',29,40,26,13,.6],['Da Nang',24,33,22,11,.4],
  ['Tokyo',68,108,64,29,1.5],['Zurich',112,157,122,48,4.2],
  ['Reykjavik',101,142,118,44,4.2],['Singapore',75,114,73,33,1.6]
 ];
 assert.equal(cities.filter(city=>city.sourceType==='editorial').length,17);
 for(const [name,daily,hotel,meal,groceries,transit] of original){
  const city=cities.find(item=>item.en===name);
  assert.ok(city,name);
  assert.deepEqual([city.daily,city.hotel,city.meal,city.groceries,city.transit],
   [daily,hotel,meal,groceries,transit],name);
  assert.equal(city.unit,'EUR');
  assert.equal(city.source,null);
  assert.equal(city.checked,'2026-10-21');
 }
 assert.equal(cities.find(city=>city.en==='Shanghai').sourceType,'travel');
 assert.equal(cities.find(city=>city.en==='Astana').sourceType,'local');
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
 const plannerSelection=guide.slice(guide.indexOf('selectCity:choice=>'),guide.indexOf("}};lang=['ru'"));
 assert.ok(plannerSelection.includes('selectedCity=p'));
 assert.ok(!plannerSelection.includes('showProfile('));
 assert.ok(html.includes('id="plannerCitySearch"'));
 assert.ok(html.includes('id="plannerCitySuggestions"'));
 const planner=fs.readFileSync(require('node:path').join(__dirname,'../trip-planner.js'),'utf8');
 assert.match(planner,/guide\.lookupCities\(query\)/);
 assert.match(planner,/guide\.showCityProfile\(city\)/);
 assert.match(guide,/showCityProfile:choice=>\{const p=resolveCity\(choice\);if\(Number\.isFinite\(p\.daily\)\)showProfile\(p\);else showUnknown\(p\);\}/);
});

test('city suggestion selection happens before keyboard blur and cancels queued searches',()=>{
 const guide=fs.readFileSync(require('node:path').join(__dirname,'../cost-guide.js'),'utf8');
 const choose=guide.slice(guide.indexOf(' function chooseCity('),guide.indexOf(" document.addEventListener('click'"));
 assert.match(choose,/clearTimeout\(timer\)/);
 assert.match(choose,/showProfile\(p,false\)/);
 assert.match(choose,/showUnknown\([^;]+,false\)/);
 assert.match(choose,/\$\('citySearch'\)\.value=''/);
 assert.match(choose,/pointerdown/);
 assert.match(choose,/e\.preventDefault\(\);chooseCity\(c\)/);
 assert.doesNotMatch(guide,/scrollTimer|scrollIntoView/);
});

test('transport cards use sourced city fares, while missing fares are not invented',()=>{
 const src=fs.readFileSync(require('node:path').join(__dirname,'../transport-data.js'),'utf8');
 const context={window:{}};vm.runInNewContext(src,context);
 const data=context.window.QanshaTransport;
 assert.ok(Object.keys(data).length>=25);
 assert.equal(data['FR|Paris'].price*2,5.1);
 assert.equal(data['KZ|Astana'].price*2,220);
 assert.equal(data['GB|London'].taxi.two,40.4);
 assert.equal(new Set(Object.values(data).map(row=>row.country)).size,32);
 assert.equal(data['TR|Antalya'],undefined);
 assert.ok(Object.values(data).every(row=>row.source.startsWith('https://')&&row.checked));
});
