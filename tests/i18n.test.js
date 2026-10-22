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


test('airport and city labels follow the selected locale and support multilingual search aliases',()=>{
 const h=harness(source);
 const expected={
  ru:{NQZ:'Астана',PEK:'Пекин',PAR:'Париж',CDG:'Париж · Шарль-де-Голль',TYO:'Токио'},
  kk:{NQZ:'Астана',PEK:'Бейжің',PAR:'Париж',CDG:'Париж · Шарль-де-Голль',TYO:'Токио'},
  en:{NQZ:'Astana',PEK:'Beijing',PAR:'Paris',CDG:'Paris · Charles de Gaulle',TYO:'Tokyo'}
 };
 for(const lang of ['ru','kk','en','ru']){
  h.i18n.setLanguage(lang);
  for(const [code,name] of Object.entries(expected[lang]))
   assert.equal(h.i18n.city(code,'default'),name,lang+' '+code);
  assert.equal(h.document.documentElement.lang,lang);
 }
 assert.deepEqual(h.i18n.cityAliases('PEK'),['Пекин','Бейжің','Beijing']);
 assert.equal(h.i18n.city('UNKNOWN','Новый город'),h.i18n.t('Новый город'));
});
test('account, search feedback and dynamic notification messages switch cleanly in all three languages',()=>{
 const h=harness(source,'ru');h.boot();
 const phrases=[
  ['Введите email — мы пришлём ссылку для входа или регистрации.','Enter your email and we will send a sign-in or registration link.','Электрондық поштаңызды енгізіңіз — кіру немесе тіркелу сілтемесін жібереміз.'],
  ['Язык изменён. Повторите поиск, чтобы получить предложения на выбранном языке.','Language changed. Search again for offers in the selected language.','Тіл өзгерді. Таңдалған тілде ұсыныстар алу үшін іздеуді қайталаңыз.'],
  ['Ничего не найдено. Попробуйте другое написание города.','No matches. Try another spelling.','Ештеңе табылмады. Қала атауын басқаша жазыңыз.'],
  ['Превышен лимит писем. Попробуйте позже.','Too many emails requested. Please try again later.','Хат жіберу шегіне жеттіңіз. Кейінірек қайталап көріңіз.']
 ];
 const nodes=phrases.map(row=>h.node(row[0]));
 for(const [lang,index] of [['en',1],['kk',2],['ru',0],['en',1]]){
  h.i18n.setLanguage(lang);
  nodes.forEach((node,i)=>assert.equal(node.nodeValue,phrases[i][index],lang+' '+i));
 }
});
test('selected language remains active when initialised from local storage',()=>{
 const h=harness(source,'kk');
 h.boot();
 assert.equal(h.i18n.language(),'kk');
 assert.equal(h.i18n.locale(),'kk-KZ');
 assert.equal(h.document.documentElement.lang,'kk');
 h.i18n.setLanguage('en');
 assert.equal(h.i18n.language(),'en');
 assert.equal(h.i18n.locale(),'en-US');
});
