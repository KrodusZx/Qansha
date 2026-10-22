'use strict';
// Executes the real planner module against a lightweight DOM/event model.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const plannerSource=fs.readFileSync(path.join(__dirname,'../trip-planner.js'),'utf8');
const guideSource=fs.readFileSync(path.join(__dirname,'../cost-guide.js'),'utf8');
const fragment=guideSource.slice(guideSource.indexOf(' const DATA='),guideSource.indexOf(' const byLang='));
const cities=vm.runInNewContext(fragment.replaceAll(' const ',' var ')+';ALL');
const originals=cities.filter(city=>city.sourceType==='editorial');

class Element {
 constructor(id=''){
  this.id=id;this.value='';this.max='1000000';this.min='0';this.hidden=true;
  this.textContent='';this.className='';this.children=[];this.listeners={};this.attrs={};
 }
 addEventListener(name,callback){(this.listeners[name]??=[]).push(callback);}
 dispatch(name,options={}){
  const event={type:name,target:this,preventDefault(){},...options};
  for(const callback of this.listeners[name]||[])callback(event);
  return event;
 }
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=[...nodes];this.textContent='';}
 setAttribute(name,value){this.attrs[name]=String(value);}
 blur(){}
 closest(){return null;}
}
function setup(selected=cities.find(city=>city.en==='Astana')){
 const elements=new Map();
 const get=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)};
 const values={daysRange:'7',daysNumber:'7',nights:'6',travelers:'2',rooms:'1',
  flightPrice:'300',hotelPrice:'70',dailyPrice:'',budgetNumber:'2000',budgetRange:'2000'};
 for(const [key,value] of Object.entries(values))get(key).value=value;
 const document={getElementById:get,createElement:()=>new Element(),addEventListener(){}};
 const listeners={};
 const window={
  addEventListener(name,fn){(listeners[name]??=[]).push(fn)},
  dispatchEvent(event){for(const listener of listeners[event.type]||[])listener(event)},
 };
 let choice=selected,lang='en',tier='standard';
 const guide={
  getState:()=>({selected:choice,lang,tier,cities}),
  countryName:code=>code,
  translate:key=>key,
  lookupCities:async query=>cities.filter(city=>[city.en,city.ru,city.kk].some(name=>name.toLowerCase().includes(query.toLowerCase()))).slice(0,8),
  showCityProfile(city){choice=city;window.dispatchEvent({type:'qansha:change',detail:{type:'city'}})},
 };
 window.QanshaGuide=guide;
 window.QanshaMoney={
  get:()=>({currency:'EUR'}),
  format:value=>'€'+Number(value).toFixed(2),
  convert:amount=>Number(amount),
 };
 vm.runInNewContext(plannerSource,{document,window,setTimeout,clearTimeout,console});
 function total(){return get('tripSummary').children.find(node=>node.className==='trip-total')?.children.find(node=>node.textContent.startsWith('€'))?.textContent;}
 return {
  get,window,guide,total,
  select(city){guide.showCityProfile(city)},
  setLanguage(next){lang=next;window.dispatchEvent({type:'qansha:change',detail:{type:'locale'}})},
 };
}

test('all 17 original city selections recalculate the planner total',()=>{
 assert.equal(originals.length,17);
 const app=setup();
 for(const city of originals){
  app.select(city);
  const expected=600+420+city.daily*7*2;
  assert.equal(Number(app.get('dailyPrice').value),city.daily,city.en+' daily value');
  assert.equal(app.total(),'€'+expected.toFixed(2),city.en+' total');
  assert.ok(app.get('tripCityName').textContent.includes(city.en),city.en+' selected destination');
  assert.match(app.get('dailySource').textContent,/Original Qansha guide/,city.en+' attribution');
 }
});

test('tapping a planner suggestion selects city and recalculates trip instantly',async()=>{
 const app=setup(),search=app.get('plannerCitySearch');
 search.value='Paris';search.dispatch('input');
 await new Promise(resolve=>setTimeout(resolve,270));
 const results=app.get('plannerCitySuggestions');
 assert.equal(results.hidden,false);
 assert.ok(results.children.length>0);
 const option=results.children.find(child=>child.children[0]?.textContent==='Paris');
 assert.ok(option,'Paris suggestion exists');
 let prevented=false;
 option.dispatch('pointerdown',{preventDefault(){prevented=true}});
 assert.equal(prevented,true);
 assert.equal(app.get('dailyPrice').value,'72');
 assert.equal(app.total(),'€2028.00');
 assert.equal(search.value,'Paris · FR');
 assert.equal(results.hidden,true);
});

test('missing traveler prices are not fabricated; explicit zeros are supported',()=>{
 const app=setup();
 app.get('flightPrice').value='';
 app.select(originals[0]);
 assert.match(app.get('tripSummary').textContent,/Enter flight and hotel prices/);
 assert.equal(app.total(),undefined);
 app.get('flightPrice').value='0';
 app.get('hotelPrice').value='0';
 app.get('hotelPrice').dispatch('input');
 assert.equal(app.total(),'€504.00');
});

test('typing a new main search query invalidates older suggestions immediately',()=>{
 const search=guideSource.slice(guideSource.indexOf(" $('citySearch').addEventListener('input'"),guideSource.indexOf(" $('citySearch').addEventListener('keydown'"));
 assert.match(search,/seq\+\+;closeSuggestions\(\)/);
 assert.match(search,/timer=setTimeout\(\(\)=>searchCities\(v\),350\)/);
 const submit=guideSource.slice(guideSource.indexOf(" $('citySearchForm').addEventListener('submit'"),guideSource.indexOf(" $('sortCities').addEventListener"));
 assert.match(submit,/if\(items\.length\)\{chooseCity\(items\[0\]\)/);
});
