const test=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const path=require('node:path');
const source=readFileSync(path.join(__dirname,'..','i18n.js'),'utf8');
function harness(source,saved='ru'){
 const nodes=[],attrs=[],callbacks={};
 const document={body:{},documentElement:{},title:'',addEventListener:(name,fn)=>{callbacks[name]=fn},querySelectorAll:selector=>selector==='[data-lang]'?[]:attrs,createTreeWalker:()=>{let i=0;return {nextNode:()=>nodes[i++]||null}}};
 const window={};
 const localStorage={getItem:()=>saved,setItem:(_,v)=>{saved=v}};
 const NodeFilter={SHOW_TEXT:4};
 const MutationObserver=class{observe(){}disconnect(){}};
 const requestAnimationFrame=fn=>fn();
 Function('window','document','localStorage','NodeFilter','MutationObserver','requestAnimationFrame',source)(window,document,localStorage,NodeFilter,MutationObserver,requestAnimationFrame);
 return {window,i18n:window.QANSHA_I18N,document,nodes,attrs,boot:()=>callbacks.DOMContentLoaded(),
 node(value){const n={nodeValue:value,parentElement:{closest:()=>null}};nodes.push(n);return n},
 attribute(value){const data={placeholder:value};const el={closest:()=>null,hasAttribute:k=>k in data,getAttribute:k=>data[k],setAttribute:(k,v)=>{data[k]=v}};attrs.push(el);return el}};
}
test('language changes restore original account, budget and placeholder copy',()=>{
 const h=harness(source),title=h.node('Личный кабинет'),note=h.node('Предварительный расчёт: авиабилет учтён; отель учтён.'),email=h.attribute('Ваш email');
 for(const language of ['kk','en','ru','en','kk','ru']){
  h.i18n.setLanguage(language);
  assert.equal(title.nodeValue,{ru:'Личный кабинет',kk:'Жеке кабинет',en:'My account'}[language]);
  assert.equal(email.getAttribute('placeholder'),{ru:'Ваш email',kk:'Электрондық поштаңыз',en:'Your email'}[language]);
  if(language==='en')assert.doesNotMatch(note.nodeValue,/[А-Яа-яЁё]/);
  if(language==='ru')assert.equal(note.nodeValue,'Предварительный расчёт: авиабилет учтён; отель учтён.');
 }
});
test('late rendered translated nodes and externally changed messages follow the selected language',()=>{
 const h=harness(source,'en');h.boot();
 const node=h.node('Sign in with an email link');
 h.i18n.setLanguage('kk');assert.equal(node.nodeValue,'Электрондық поштадағы сілтеме арқылы кіру');
 h.i18n.setLanguage('ru');assert.equal(node.nodeValue,'Вход по ссылке на почту');
 node.nodeValue='Проверь почту: ссылка для входа отправлена.';
 h.i18n.setLanguage('en');assert.equal(node.nodeValue,'Check your email: your sign-in link has been sent.');
 const counter=h.node('5 days · 2 people · 4 nights');h.i18n.setLanguage('kk');
 assert.equal(counter.nodeValue,'5 күн · 2 адам · 4 түн');
});
test('translation does not rewrite parts of words, email addresses, URLs or numerical values',()=>{
 const h=harness(source);h.i18n.setLanguage('en');
 assert.equal(h.i18n.t('Вы вошли как from@example.com'),'Signed in as from@example.com');
 assert.equal(h.i18n.t('https://example.com/отели'),'https://example.com/отели');
 assert.equal(h.i18n.t('Предварительный расчёт: 50 000 ₸'),'Preliminary estimate: 50 000 ₸');
 assert.equal(h.i18n.t('Апартаменты / другое'),'Apartments / other');
 assert.equal(h.i18n.t('Комфортный'),'Комфортный');
});
test('all Russian static interface text and accessible labels have English translations',()=>{
 const h=harness(source);h.i18n.setLanguage('en');
 const html=readFileSync(path.join(__dirname,'..','index.html'),'utf8');
 const body=html.slice(html.indexOf('<body')).replace(/<button[^>]*data-lang[^>]*>[\s\S]*?<\/button>/g,'');
 const values=[...body.matchAll(/>([^<>]+)</g)].map(m=>m[1].trim());
 values.push(...[...body.matchAll(/(?:placeholder|aria-label|title|alt)="([^"]+)"/g)].map(m=>m[1]));
 for(const value of values.filter(v=>/[А-Яа-яЁё]/.test(v))){
  assert.doesNotMatch(h.i18n.t(value),/[А-Яа-яЁё]/,value);
 }
});
