/* A trip estimate combines prices entered by the traveler with an explicitly
 * labelled daily planning assumption. Inputs use the selected display currency. */
'use strict';

function calculateTrip({days,nights,travelers,rooms,flight,hotel,daily,budget}) {
 const quantities=[days,nights,travelers,rooms,flight,hotel,daily,budget];
 if(quantities.some(value=>!Number.isFinite(value)||value<0)||days<1||travelers<1||rooms<1)return null;
 const flights=Math.round(flight*travelers*100)/100;
 const stay=Math.round(hotel*nights*rooms*100)/100;
 const everyday=Math.round(daily*days*travelers*100)/100;
 const total=Math.round((flights+stay+everyday)*100)/100;
 return {flights,stay,everyday,total,perPerson:Math.round(total/travelers*100)/100,remaining:Math.round((budget-total)*100)/100};
}

if(typeof module!=='undefined'&&module.exports)module.exports={calculateTrip};

if(typeof document!=='undefined')(() => {
 const guide=window.QanshaGuide;
 const $=id=>document.getElementById(id);
 const tr={
  ru:{autoDaily:'Ориентир Qansha для этого города и выбранного стиля',manualDaily:'Твоя оценка. Для этого города у Qansha пока нет цен.',editedDaily:'Твоя сумма вместо ориентира Qansha',fillPrices:'Введи цену билетов и отеля (можно 0).',fillDaily:'Введи примерные расходы на человека в день.',flightLine:'Билеты',hotelLine:'Отель',dailyLine:'Повседневные расходы',totalLine:'Всего на поездку',perPersonLine:'На человека',underBudget:'Остаётся в бюджете',overBudget:'Сверх бюджета',exactBudget:'Ровно по бюджету',dailyMath:'дней × путешественников',hotelMath:'ночей × номеров',flightMath:'за человека × путешественников'},
  kk:{autoDaily:'Осы қала мен шығын деңгейіне арналған Qansha бағдары',manualDaily:'Сенің болжамың. Qansha-да бұл қаланың бағасы әзірге жоқ.',editedDaily:'Qansha бағдарының орнына сен енгізген сома',fillPrices:'Билет пен қонақүй бағасын енгіз (0 болуы мүмкін).',fillDaily:'Бір адамға бір күндік шамамен шығынды енгіз.',flightLine:'Билеттер',hotelLine:'Қонақүй',dailyLine:'Күнделікті шығындар',totalLine:'Сапардың жалпы құны',perPersonLine:'Бір адамға',underBudget:'Бюджетте қалады',overBudget:'Бюджеттен асады',exactBudget:'Дәл бюджетке сәйкес',dailyMath:'күн × саяхатшы',hotelMath:'түн × бөлме',flightMath:'бір адамға × саяхатшы'},
  en:{autoDaily:'Qansha guide for this city and spending style',manualDaily:'Your estimate. Qansha does not yet have prices for this city.',editedDaily:'Your amount instead of the Qansha guide',fillPrices:'Enter flight and hotel prices (0 is fine).',fillDaily:'Enter an estimated daily expense per person.',flightLine:'Flights',hotelLine:'Hotel',dailyLine:'Everyday spending',totalLine:'Trip total',perPersonLine:'Per person',underBudget:'Left in budget',overBudget:'Over budget',exactBudget:'Exactly on budget',dailyMath:'days × travelers',hotelMath:'nights × rooms',flightMath:'per traveler × travelers'}
 };
 let selected=null,manualDaily=false,previousDays=7;
 const numeric=id=>{const value=$(id).value.trim();return value===''?null:Number(value)};
 const fx=window.QanshaMoney;
 const money=(value,lang)=>fx.format(value,lang,fx.get().currency);
 const name=(city,lang)=>city?city[lang]||city.en||city.city||'':'';
 const selectionKey=city=>city?city.country+'|'+(city.en||city.city):'';

 function cityOptions(){
  const state=guide.getState(),box=$('plannerCity'),old=box.value;
  const list=[...state.cities];
  if(selected&&!list.some(c=>selectionKey(c)===selectionKey(selected)))list.unshift(selected);
  list.sort((a,b)=>name(a,state.lang).localeCompare(name(b,state.lang),state.lang));
  box.innerHTML='';
  for(const city of list){const opt=document.createElement('option');opt.value=selectionKey(city);opt.textContent=name(city,state.lang)+' · '+guide.countryName(city.country)+(city.daily==null?' · '+guide.translate('noDataSuffix'):'');box.appendChild(opt);}
  box.value=selected?selectionKey(selected):old;
 }
 function updateDaily(reset){
  const {tier,lang}=guide.getState();
  const hasEstimate=selected&&Number.isFinite(selected.daily);
  if(reset){manualDaily=false;$('dailyPrice').value=hasEstimate?String(Math.round(fx.convert(selected.daily*{economy:.72,standard:1,comfort:1.55}[tier],selected.unit||'EUR')*100)/100):'';}
  $('dailySource').textContent=tr[lang][hasEstimate?(manualDaily?'editedDaily':'autoDaily'):'manualDaily'];
 }
 function render(){
  const state=guide.getState(),lang=state.lang,text=tr[lang];
  $('tripCityName').textContent=selected?name(selected,lang)+' · '+guide.countryName(selected.country):'';
  const days=numeric('daysNumber'),nights=numeric('nights'),travelers=numeric('travelers'),rooms=numeric('rooms'),flight=numeric('flightPrice'),hotel=numeric('hotelPrice'),daily=numeric('dailyPrice'),budget=numeric('budgetNumber');
  const summary=$('tripSummary'),status=$('tripStatus');
  if(flight===null||hotel===null){summary.textContent=text.fillPrices;status.textContent='';status.className='trip-status';return;}
  if(daily===null){summary.textContent=text.fillDaily;status.textContent='';status.className='trip-status';return;}
  const result=calculateTrip({days,nights,travelers,rooms,flight,hotel,daily,budget});
  if(!result){summary.textContent='—';status.textContent='';status.className='trip-status';return;}
  const rows=[[text.flightLine,text.flightMath,result.flights],[text.hotelLine,text.hotelMath,result.stay],[text.dailyLine,text.dailyMath,result.everyday]];
  summary.replaceChildren();
  for(const [label,detail,value] of rows){const row=document.createElement('div');row.className='trip-row';const title=document.createElement('span');title.textContent=label;const info=document.createElement('small');info.textContent=detail;title.append(info);const amount=document.createElement('b');amount.textContent=money(value,lang);row.append(title,amount);summary.append(row);}
  const total=document.createElement('div');total.className='trip-total';const title=document.createElement('span');title.textContent=text.totalLine;const amount=document.createElement('strong');amount.textContent=money(result.total,lang);total.append(title,amount);summary.append(total);
  const per=document.createElement('div');per.className='trip-per-person';per.textContent=text.perPersonLine+' · '+money(result.perPerson,lang);summary.append(per);
  status.className='trip-status '+(result.remaining<0?'over':'within');
  status.textContent=(result.remaining<0?text.overBudget:result.remaining>0?text.underBudget:text.exactBudget)+(result.remaining===0?'':' · '+money(Math.abs(result.remaining),lang));
 }
 function setDays(value){const days=Math.max(1,Math.min(60,Math.round(Number(value)||1)));$('daysRange').value=days;$('daysNumber').value=days;if(numeric('nights')===Math.max(0,previousDays-1))$('nights').value=Math.max(0,days-1);previousDays=days;render();}
 function setBudget(value){const budget=Math.max(0,Math.min(Number($('budgetNumber').max),Number(value)||0));$('budgetNumber').value=budget;$('budgetRange').value=Math.min(Number($('budgetRange').max),budget);render();}
 function updateBudgetScale(){const currency=fx.get().currency,round=value=>Math.max(1,Math.round(value));$('budgetRange').max=round(fx.convert(30000,'EUR'));$('budgetRange').step=currency==='KZT'||currency==='UZS'?1:.01;$('budgetNumber').max=round(fx.convert(1000000,'EUR'));$('budgetNumber').step=currency==='KZT'||currency==='UZS'?1:.01;$('budgetSymbol').textContent={KZT:'₸',USD:'$',RUB:'₽',CNY:'¥',UZS:'UZS',TJS:'TJS',KGS:'KGS',EUR:'€'}[currency];$('budgetMin').textContent=money(0,guide.getState().lang);$('budgetMax').textContent=money(Number($('budgetRange').max),guide.getState().lang)+'+';$('budgetRange').value=Math.min(Number($('budgetRange').max),Number($('budgetNumber').value)||0);}
 function convertInputs(previous,currency){for(const id of ['flightPrice','hotelPrice','dailyPrice','budgetNumber']){const field=$(id);if(field.value==='')continue;const value=fx.convert(Number(field.value),previous,currency);field.value=String(Math.round(value*(currency==='KZT'||currency==='UZS'?1:100))/(currency==='KZT'||currency==='UZS'?1:100));}updateBudgetScale();render();}
 for(const id of ['daysRange','daysNumber'])$(id).addEventListener('input',event=>setDays(event.target.value));
 for(const id of ['budgetRange','budgetNumber'])$(id).addEventListener('input',event=>setBudget(event.target.value));
 for(const id of ['travelers','nights','flightPrice','hotelPrice','rooms'])$(id).addEventListener('input',render);
 $('dailyPrice').addEventListener('input',()=>{manualDaily=true;updateDaily(false);render();});
 $('plannerCity').addEventListener('change',()=>guide.selectCity($('plannerCity').value));
 window.addEventListener('qansha:currency',event=>convertInputs(event.detail.previous,event.detail.currency));
 window.addEventListener('qansha:rates',()=>{updateBudgetScale();if(!manualDaily)updateDaily(true);render();});
 window.addEventListener('qansha:change',event=>{
  const state=guide.getState();
  if(event.detail.type==='city'){selected=state.selected;cityOptions();updateDaily(true);}
  else if(event.detail.type==='tier'&&!manualDaily)updateDaily(true);
  else if(event.detail.type==='locale')cityOptions();
  updateDaily(false);render();
 });
 selected=guide.getState().selected||guide.getState().cities.find(c=>c.en==='Almaty');
 cityOptions();updateBudgetScale();updateDaily(true);render();
})();
