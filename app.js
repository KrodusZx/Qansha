/* Qansha? Minimal UI. Never labels estimates or cached results as confirmed bookings. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const today=()=>new Date().toISOString().slice(0,10), add=(iso,n)=>new Date(Date.parse(iso+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
 const dateDiff=(a,b)=>Math.round((Date.parse(b+'T12:00:00Z')-Date.parse(a+'T12:00:00Z'))/86400000);
 const dateText=s=>new Intl.DateTimeFormat(window.QANSHA_I18N?.locale()||'ru-RU',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(s+'T12:00:00Z'));
 const fmt=(amount,currency='EUR')=>Number(amount).toLocaleString(window.QANSHA_I18N?.locale()||'ru-RU',{style:'currency',currency,maximumFractionDigits:0});
 const CODES={NQZ:['Астана','KZ'],ALA:['Алматы','KZ'],PAR:['Париж','FR'],CDG:['Париж · Шарль-де-Голль','FR'],ORY:['Париж · Орли','FR'],LHR:['Лондон · Хитроу','GB'],LON:['Лондон','GB'],JFK:['Нью-Йорк','US'],NYC:['Нью-Йорк','US'],DXB:['Дубай','AE'],IST:['Стамбул','TR'],BKK:['Бангкок','TH'],TAS:['Ташкент','UZ'],GYD:['Баку','AZ'],PEK:['Пекин','CN'],SHA:['Шанхай','CN'],HKG:['Гонконг','HK'],SIN:['Сингапур','SG'],TYO:['Токио','JP'],HND:['Токио · Ханэда','JP'],ICN:['Сеул','KR'],FCO:['Рим','IT'],BCN:['Барселона','ES'],ZRH:['Цюрих','CH'],GVA:['Женева','CH'],KEF:['Рейкьявик','IS'],BER:['Берлин','DE'],VIE:['Вена','AT'],KUL:['Куала-Лумпур','MY'],SYX:['Санья','CN'],SZX:['Шэньчжэнь','CN'],CAN:['Гуанчжоу','CN'],CIT:['Шымкент','KZ'],SCO:['Актау','KZ'],EVN:['Ереван','AM'],TBS:['Тбилиси','GE'],RMO:['Кишинёв','MD'],DAD:['Дананг','VN'],HKT:['Пхукет','TH'],MUC:['Мюнхен','DE'],AMS:['Амстердам','NL'],PRG:['Прага','CZ'],BSZ:['Бишкек','KG'],DYU:['Душанбе','TJ']};
 const localeCountry=new Intl.DisplayNames(['ru'],{type:'region'});
 const flag=cc=>cc&&cc.length===2?[...cc.toUpperCase()].map(c=>String.fromCodePoint(127397+c.charCodeAt(0))).join(''):'🌐';
 const popular=Object.entries(CODES).map(([code,[city,country]])=>({code,city,country,airport:city,score:100}));
 const state={tab:'budget',budgetDays:5,budgetTravelers:2,budgetPlace:'FR',budgetCustomCity:null,tripType:'roundtrip',origin:null,destination:null,hotelCity:null,depart:add(today(),36),return:add(today(),41),checkin:add(today(),36),checkout:add(today(),41),passengers:1,guests:1,tier:'standard',currency:'EUR',daily:65,hotelFilters:{sort:'price',stars:0,rating:0,max:0,type:'all',freeCancel:false},hotelNextPageToken:null,hotelLoadingMore:false,flights:[],hotels:[],flight:null,hotel:null,returnOptions:[],returnParentIndex:null,calendarTarget:'depart',calendarMonth:add(today(),36).slice(0,7),calendarMode:'flight',calendarPrices:{flight:{},hotel:{}},calendarRequests:new Set(),searching:false,hotelSearching:false,hotelRequestId:0,hotelSearchKey:null,hotelPendingKey:null,hotelSearchError:null,manualHotelPick:false,faves:[],user:null,supa:null};
 const q=(p)=>new URLSearchParams(Object.entries(p).filter(([k,v])=>v!=null&&v!=='').map(([k,v])=>[k,String(v)])).toString();
 function toast(msg){const el=$('toast');el.textContent=msg;el.hidden=false;clearTimeout(toast.timeout);toast.timeout=setTimeout(()=>el.hidden=true,3500)}
 function tab(name){state.tab=name;document.querySelectorAll('.tab').forEach(b=>{const active=b.dataset.tab===name;b.classList.toggle('is-active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});['flights','hotels','budget','compare'].forEach(x=>$('panel-'+x).hidden=x!==name);if(name==='budget'){renderBudget();ensureRecommendedHotel()}if(name==='hotels'){renderHotelRecommendation();ensureRecommendedHotel()}if(name==='compare')renderCompare()}
 function labelPlace(p){return p?`${flag(p.country)} ${p.city} · ${p.code}`:''}
 function countryName(c){try{return new Intl.DisplayNames([window.QANSHA_I18N?.locale()||'ru-RU'],{type:'region'}).of(c)||c}catch{return c}}
 function matchesPlace(a,term){const needle=norm(term);return [a.city,a.code,a.airport,countryName(a.country)].some(v=>norm(v).includes(needle));}
 const norm=s=>String(s||'').normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g,'').trim();
 const airportInputs={flightOrigin:'origin',flightDest:'destination',hotelCity:'hotelCity'};
 const pending={};
 async function locations(term){
  const search=term.trim(); const fallback=popular.filter(a=>!search||matchesPlace(a,search)).slice(0,11);
  if(!search)return fallback;
  try{const r=await fetch('/api/locations?q='+encodeURIComponent(search),{signal:AbortSignal.timeout(16000)});if(!r.ok)throw Error('api');const data=await r.json();const seen=new Set();return [...fallback,...(data.results||[])].filter(x=>{if(!x.code||seen.has(x.code))return false;seen.add(x.code);return true}).slice(0,15)}catch{return fallback}
 }
 function showSuggestions(id,arr,term){const list=$(id+'List'),input=$(id);if(document.activeElement!==input)return;list.hidden=false;input.setAttribute('aria-expanded','true');list.innerHTML=arr.length?arr.map(p=>`<button type="button" class="suggestion" role="option" data-airport="${esc(id)}" data-code="${esc(p.code)}" data-name="${esc(p.city)}" data-country="${esc(p.country)}" data-airportname="${esc(p.airport||'')}"><span>${flag(p.country)}</span><span><strong>${esc(p.city)}</strong><small>${esc(countryName(p.country))} · ${esc(p.airport||'Аэропорт')}</small></span><strong class="code">${esc(p.code)}</strong></button>`).join(''):`<div class="suggestions-info">Совпадений нет. Попробуй название на английском или код аэропорта.</div>`;
 }
 function selectPlace(id,item){const key=airportInputs[id];state[key]=item;$(id).value=labelPlace(item);$(id).setAttribute('aria-expanded','false');$(id+'List').hidden=true;if(key==='destination'){state.hotelCity=item;$('hotelCity').value=labelPlace(item)}if(key==='hotelCity'){state.destination=item;$('flightDest').value=labelPlace(item)}state.calendarPrices={flight:{},hotel:{}};state.calendarRequests.clear();state.flight=null;state.hotel=null;state.flights=[];invalidateHotelSearch();renderBudget()}
 function initAirport(id){const input=$(id);input.addEventListener('focus',()=>{if(state[airportInputs[id]])input.value='';locations('').then(items=>showSuggestions(id,items,''))});input.addEventListener('input',()=>{state[airportInputs[id]]=null;clearTimeout(pending[id]);const search=input.value;pending[id]=setTimeout(async()=>{let data=await locations(search);if(input.value===search)showSuggestions(id,data,search)},240)});input.addEventListener('keydown',e=>{if(e.key==='Escape'){input.blur();$(id+'List').hidden=true}if(e.key==='Enter'){const first=$(id+'List').querySelector('button');if(first&&!$(id+'List').hidden){e.preventDefault();first.click()}}});input.addEventListener('blur',()=>setTimeout(()=>{$(id+'List').hidden=true;input.setAttribute('aria-expanded','false');if(state[airportInputs[id]])input.value=labelPlace(state[airportInputs[id]]);else input.value=''},180));}
 document.addEventListener('click',e=>{const hit=e.target.closest('[data-airport][data-code]');if(hit){selectPlace(hit.dataset.airport,{code:hit.dataset.code,city:hit.dataset.name,country:hit.dataset.country,airport:hit.dataset.airportname});return;}const returnChoice=e.target.closest('[data-return-option]');if(returnChoice){chooseReturn(Number(returnChoice.dataset.returnOption));return}const returnStart=e.target.closest('[data-return-start]');if(returnStart){openReturnChoices(Number(returnStart.dataset.returnStart));return}const booking=e.target.closest('[data-book-flight]');if(booking){openFlight(Number(booking.dataset.bookFlight),true);return}const fd=e.target.closest('[data-flight-details]');if(fd){openFlight(Number(fd.dataset.flightDetails),false);return}const hd=e.target.closest('[data-hotel-details],[data-book-hotel]');if(hd){openHotel(Number(hd.dataset.hotelDetails??hd.dataset.bookHotel));return}const gallery=e.target.closest('[data-gallery]');if(gallery){const image=$('galleryMain');if(image){image.src=gallery.dataset.img;image.style.display='block';gallery.parentNode.querySelectorAll('[data-gallery]').forEach(b=>b.classList.toggle('is-active',b===gallery))}return}const clear=e.target.closest('[data-budget-clear]');if(clear){if(clear.dataset.budgetClear==='flight'){state.flight=null;if(state.flights.length)renderFlights()}else{state.hotel=null;state.manualHotelPick=false;if(state.hotels.length)renderHotels();renderHotelRecommendation()}renderBudget();return}const pick=e.target.closest('[data-pick]');if(pick){choose(pick.dataset.pick,Number(pick.dataset.index));return}const fave=e.target.closest('[data-favorite]');if(fave){addFavorite(fave.dataset.favorite,Number(fave.dataset.index));return;}const close=e.target.closest('[data-close]');if(close){modal(close.dataset.close,false);return;}const goto=e.target.closest('[data-goto]');if(goto){tab(goto.dataset.goto);window.scrollTo({top:80,behavior:'smooth'});return;}const more=e.target.closest('[data-more-hotels]');if(more){moreHotels();return;}const budgetStyle=e.target.closest('[data-budget-style]');if(budgetStyle){setTier(budgetStyle.dataset.budgetStyle);return;}const tier=e.target.closest('[data-tier-choice], [data-hotel-tier]');if(tier){setTier(tier.dataset.tierChoice||tier.dataset.hotelTier);return;}});
 function modal(id,show){$(id).hidden=!show;document.body.style.overflow=document.querySelector('.modal-backdrop:not([hidden])')?'hidden':''}
 function syncDates(){for(const [k,i] of [['depart','departText'],['return','returnText'],['checkin','checkinText'],['checkout','checkoutText']])$(i).textContent=dateText(state[k]);renderBudget()}
 function chooseDate(target,day){state[target]=day;if(target==='depart'){if(state.return<=day)state.return=add(day,5);if(state.checkin<day){state.checkin=day;state.checkout=add(day,5)}}if(target==='return'){if(state.checkout>day)state.checkout=day; if(state.checkout<=state.checkin)state.checkin=add(day,-1)}if(target==='checkin'&&state.checkout<=day)state.checkout=add(day,3);if(target==='checkout'&&state.checkin>=day)state.checkin=add(day,-1);state.calendarPrices={flight:{},hotel:{}};state.calendarRequests.clear();state.flight=null;state.hotel=null;state.flights=[];invalidateHotelSearch();syncDates();modal('calendarModal',false)}
 function openCalendar(which){state.calendarTarget=which;state.calendarMonth=state[which].slice(0,7);state.calendarMode=['depart','return'].includes(which)?'flight':'hotel';const titles={depart:'Дата вылета',return:'Дата возвращения',checkin:'Дата заезда',checkout:'Дата выезда'};$('calendarTitle').textContent=titles[which];$('calendarSubtitle').textContent=state.calendarMode==='flight'?'Тарифы на даты — от найденной стоимости в одну сторону':'Цены за всё проживание на выбранные ночи';$('loadCalendar').textContent='Узнать цены на 7 дат';$('calendarHelp').textContent='Стоимость появится только после запроса к поисковому сервису. Пустые даты не означают отсутствие предложений.';renderCalendar();modal('calendarModal',true);const key=state.calendarMode+':'+state.calendarMonth+':'+state[state.calendarTarget];if(!state.calendarRequests.has(key)){state.calendarRequests.add(key);calendarPrices()}}
 function renderCalendar(){const ym=state.calendarMonth,[y,m]=ym.split('-').map(Number),first=new Date(Date.UTC(y,m-1,1)),last=new Date(Date.UTC(y,m,0)).getUTCDate(),shift=(first.getUTCDay()+6)%7;$('monthName').textContent=new Intl.DateTimeFormat(window.QANSHA_I18N?.locale()||'ru-RU',{month:'long',year:'numeric',timeZone:'UTC'}).format(first);const monthDates=Array.from({length:shift},()=>'<span class="blank"></span>');for(let day=1;day<=last;day++){const iso=`${ym}-${String(day).padStart(2,'0')}`;const invalid=iso<today() ||(['return','checkout'].includes(state.calendarTarget) && iso<=state[state.calendarTarget==='return'?'depart':'checkin'])||dateDiff(today(),iso)>365;const price=state.calendarPrices[state.calendarMode][iso];monthDates.push(`<button type="button" class="day ${state[state.calendarTarget]===iso?'selected':''} ${today()===iso?'today':''}" data-day="${iso}" ${invalid?'disabled':''}><span>${day}</span>${price!=null?`<small>от ${esc(fmt(price))}</small>`:'<small class="no-price">&nbsp;</small>'}</button>`)}$('calendarGrid').innerHTML=monthDates.join('');$('calendarGrid').querySelectorAll('[data-day]').forEach(b=>b.addEventListener('click',()=>chooseDate(state.calendarTarget,b.dataset.day)))}
 async function calendarPrices(){const mode=state.calendarMode,isFlight=mode==='flight',from=state.origin?.code,to=state.destination?.code,city=state.hotelCity?.city;if(isFlight&&(!from||!to)){toast('Сначала выбери города вылета и прилёта.');return}if(!isFlight&&!city){toast('Сначала выбери город отеля.');return}const sel=state[state.calendarTarget];const start=sel.startsWith(state.calendarMonth)&&sel>=today()?sel:`${state.calendarMonth}-01`;const btn=$('loadCalendar');btn.disabled=true;btn.textContent='Проверяем 7 дат…';try{const data=await request('calendar',{mode,origin:from,destination:to,cityName:city,start,nights:Math.max(1,dateDiff(state.checkin,state.checkout))});for(const [day,price] of Object.entries(data.prices||{}))state.calendarPrices[mode][day]=price;renderCalendar();$('calendarHelp').textContent=`Проверено ${data.checked||0} дат. ${data.note||'Цены ориентировочные и могут измениться.'}`;}catch(e){$('calendarHelp').textContent='Не удалось загрузить цены: '+e.message}finally{btn.disabled=false;btn.textContent='Узнать цены на 7 дат'}}
 async function request(kind,args){const url='/api/search?'+q({kind,...args});const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),31000);try{const r=await fetch(url,{signal:ctrl.signal});let result;try{result=await r.json()}catch{throw Error('Сервис временно недоступен')}if(!r.ok)throw Error(result.error||'Ошибка поиска');return result}finally{clearTimeout(timer)}}
 function validateDates(group){if(group==='flight'&&(state.depart<today()||(state.tripType==='roundtrip'&&state.return<=state.depart)))throw Error('Проверь даты вылета и возвращения');if(group==='hotel'&&(state.checkin<today()||state.checkout<=state.checkin))throw Error('Проверь даты заезда и выезда')}
 function searchLoading(which){const key=which==='flight'?'flightResults':'hotelResults';$(key).innerHTML='<div class="empty-state"><strong>Ищем варианты…</strong><p>Запрашиваем цены у поставщика. Подожди немного.</p></div>'}
 function searchError(which,e){const flights=which==='flight';const dom=flights?'flightResults':'hotelResults';const link=flights?googleFlightsLink():googleHotelsLink();$(dom).innerHTML=`<div class="empty-state"><strong>Не удалось получить предложения</strong><p>${esc(e.message)}. Это не означает, что билетов или отелей нет. Попробуй другие даты или проверь предложения у поставщика.</p><div style="margin-top:15px"><a class="outline-btn" href="${esc(link)}" target="_blank" rel="noopener noreferrer">Открыть ${flights?'Google Flights':'Google Hotels'} ↗</a></div></div>`}
 const googleFlightsLink=()=>`https://www.google.com/travel/flights?hl=ru&q=${encodeURIComponent(`Flights from ${state.origin?.city||''} to ${state.destination?.city||''} on ${state.depart}${state.tripType==='roundtrip'?' returning '+state.return:''}`)}`;
 const googleHotelsLink=()=>`https://www.google.com/travel/hotels?hl=ru&q=${encodeURIComponent(`${state.hotelCity?.city||''} hotels ${state.checkin} ${state.checkout}`)}`;
 async function searchFlights(e){e?.preventDefault();if(state.searching)return;if(!state.origin||!state.destination){toast('Выбери аэропорты из подсказок.');return}if(state.origin.code===state.destination.code){toast('Выбери разные аэропорты.');return}try{validateDates('flight')}catch(err){toast(err.message);return}state.searching=true;$('searchFlights').disabled=true;searchLoading('flight');try{const data=await request('flights',{origin:state.origin.code,destination:state.destination.code,depart:state.depart,returnDate:state.tripType==='roundtrip'?state.return:null,tripType:state.tripType,adults:state.passengers,travelClass:$('flightTravelClass').value,stops:$('flightSearchStops').value});state.flights=data.offers||[];state.flight=null;renderFlights(data);}catch(err){state.flights=[];state.flight=null;$('flightFilterPanel').hidden=true;searchError('flight',err)}finally{state.searching=false;$('searchFlights').disabled=false;renderBudget()}}
 function flightTitle(o){return [...new Set(o.airlines||[])].join(' · ')||'Рейс'}
 function legDescription(leg,label){const arr=leg.segments||[],first=arr[0],last=arr[arr.length-1];if(!first||!last)return '';return `${label}: ${first.from} ${first.departure?.slice(11,16)||''} → ${last.to} ${last.arrival?.slice(11,16)||''} · ${arr.length-1} перес. · ${leg.duration||'время уточняется'}`}

 function renderFlights(data){
  if(!state.flights.length){$('flightFilterPanel').hidden=true;searchError('flight',new Error('На эти даты нет предложений'));return}
  updateAirlines();const list=flightFiltered();
  const header='<div class="results-header"><h3>Найденные авиарейсы</h3><span class="results-count">'+list.length+' из '+state.flights.length+' вариантов</span></div>';
  const notice='<div class="banner-note">Цены предварительные. Для маршрута туда-обратно сначала выберите обратный рейс; багаж и итоговую стоимость подтвердит продавец. <a href="'+esc(googleFlightsLink())+'" target="_blank" rel="noopener noreferrer">Google Flights ↗</a></div>';
  const cards=list.map(({o,i})=>{
   const chosen=state.flight?.id===o.id,preview=o.fareType==='roundtrip-preview';
   const primary=preview?'<button type="button" class="primary-btn small-action" data-return-start="'+i+'">Выбрать обратный рейс →</button>':
    '<button type="button" class="outline-btn '+(chosen?'chosen-button':'')+'" data-pick="flight" data-index="'+i+'" aria-pressed="'+chosen+'">'+(chosen?'✓ Выбран · отменить':'Выбрать')+'</button>';
   const details=preview?'Ориентир за туда-обратно · '+state.passengers+' взрослых · обратный рейс не выбран':
    'Ориентир по запросу на '+state.passengers+' взрослых · '+(state.tripType==='oneway'?'в одну сторону':'туда-обратно');
   return '<article class="offer flight-offer '+(chosen?'chosen':'')+'"><div class="offer-top"><strong class="offer-title">'+esc(flightTitle(o))+'</strong><span class="offer-price">'+(preview?'<small class="fare-from">от </small>':'')+curr(o.price)+'</span></div>'+
    '<div class="flight-legs">'+flightCards(o)+'</div><div class="fare-tags"><span>🧳 Багаж: уточнить</span><span>🎒 Ручная кладь: уточнить</span><span>↺ Возврат: уточнить</span></div>'+
    '<div class="offer-details">'+details+'</div><div class="offer-actions">'+primary+(preview?'':faveButton('flight',o,i))+
    '<button type="button" class="outline-btn" data-flight-details="'+i+'">Подробнее</button>'+
    (preview?'':'<button type="button" class="booking-link" data-book-flight="'+i+'">Купить у продавца ↗</button>')+
    (o.fareType==='roundtrip'?'<button type="button" class="outline-btn" data-return-start="'+i+'">Другой обратный рейс</button>':'')+'</div></article>';
  });
  $('flightResults').innerHTML=header+notice+'<div class="offer-list">'+(cards.length?cards.join(''):'<div class="empty-state"><strong>Нет вариантов с такими фильтрами</strong><p>Измените фильтры.</p></div>')+'</div>';
 }

 const heartSvg='<svg class="fav-heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.8a5.6 5.6 0 0 0-7.9 0L12 5.7l-.9-.9a5.6 5.6 0 0 0-7.9 7.9L12 21l8.8-8.3a5.6 5.6 0 0 0 0-7.9Z"/></svg>';
 const safeUrl=x=>typeof x==='string'&&/^https:\/\//i.test(x)&&x.length<3500;
 function faveButton(kind,o,i){const yes=state.faves.some(x=>x.offer_key===favoriteItem(kind,o).offer_key);return '<button class="outline-btn favorite-toggle '+(yes?'is-favorite':'')+'" type="button" data-favorite="'+kind+'" data-index="'+i+'" aria-pressed="'+yes+'">'+heartSvg+' '+(yes?'В избранном':'В избранное')+'</button>'}
 function flightFiltered(){const stop=$('flightStops').value,carrier=$('flightAirline').value,max=Number($('flightMaxPrice').value)||0,hours=Number($('flightMaxDuration').value)||0,time=$('flightTime').value,sort=$('flightSort').value;return state.flights.map((o,i)=>({o,i})).filter(({o})=>{
  if(stop!=='all'&&(o.legs||[]).some(l=>(l.segments?.length||1)-1>Number(stop)))return false;
  if(carrier!=='all'&&!(o.airlines||[]).includes(carrier))return false;
  if(max&&o.price>max)return false;if(hours&&o.durations>hours*60)return false;
  if(time!=='all'){let h=Number(o.legs?.[0]?.segments?.[0]?.departure?.slice(11,13)),bounds={morning:[6,12],day:[12,18],evening:[18,24],night:[0,6]}[time];if(bounds&&(h<bounds[0]||h>=bounds[1]))return false}return true
 }).sort((a,b)=>sort==='duration'?(a.o.durations||1e8)-(b.o.durations||1e8)||a.o.price-b.o.price:sort==='stops'?(a.o.stopCount||0)-(b.o.stopCount||0)||a.o.price-b.o.price:a.o.price-b.o.price)}
 function updateAirlines(){const el=$('flightAirline'),was=el.value,names=[...new Set(state.flights.flatMap(o=>o.airlines||[]))].sort();el.innerHTML='<option value="all">Все авиакомпании</option>'+names.map(n=>'<option value="'+esc(n)+'">'+esc(n)+'</option>').join('');el.value=names.includes(was)?was:'all';$('flightFilterPanel').hidden=!state.flights.length}
 function showDetails(title,sub,body){$('offerDetailsTitle').textContent=title;$('offerDetailsSubtitle').textContent=sub;$('offerDetailsBody').innerHTML=body;modal('offerDetailsModal',true)}
 function flightCards(o){return (o.legs||[]).map((l,j)=>{const p=l.segments||[],a=p[0],b=p.at(-1);return '<div class="flight-leg"><small>'+(j?'Обратно':'Туда')+'</small><div class="flight-route"><span>'+esc(a?.from||'?')+' '+esc(a?.departure?.slice(11,16)||'')+'</span><span>→</span><span>'+esc(b?.to||'?')+' '+esc(b?.arrival?.slice(11,16)||'')+'</span></div><span class="leg-stops">'+(p.length===1?'Прямой рейс':(p.length-1)+' пересад.')+' · '+esc(l.duration||'')+'</span></div>'}).join('')}
 function openFlight(i,book){const o=state.flights[i];if(!o)return;if(o.fareType==='roundtrip-preview'){openReturnChoices(i);return}let segs=(o.legs||[]).flatMap(l=>l.segments||[]).map(x=>'<p><strong>'+esc(x.carrier||'Рейс')+' '+esc(x.flightNumber||'')+'</strong> · '+esc(x.from)+' → '+esc(x.to)+' · '+esc(x.aircraft||'самолёт не указан')+' · '+esc(x.travelClass||'класс уточняется')+'</p>').join('');
  let body='<div class="flight-legs">'+flightCards(o)+'</div>'+segs+'<div class="detail-message">Багаж, ручная кладь, обмен и возврат не подтверждены поставщиком. Итоговую цену и условия необходимо проверить у продавца.</div><div class="details-providers" id="flightBookingLinks"><a href="'+esc(googleFlightsLink())+'" target="_blank" rel="noopener noreferrer">Найти рейс и купить через Google Flights ↗</a></div><p class="detail-message">Qansha? не принимает платежи. Ссылка ведёт к поиску по маршруту и датам, а не гарантирует бронирование выбранного тарифа.</p>';
  showDetails('Рейс · '+flightTitle(o),book?'Переход к продавцу':'Информация о рейсе',body);
  if(book&&o.bookingToken)request('flightBooking',{bookingToken:o.bookingToken}).then(d=>{if(!$('offerDetailsModal').hidden&&$('offerDetailsTitle').textContent==='Рейс · '+flightTitle(o)&&d.options?.length){const links=d.options.filter(x=>safeUrl(x.url));if(links.length)$('flightBookingLinks').innerHTML=links.map(x=>'<a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">'+esc(x.name)+' ↗</a>').join('')}}).catch(()=>{});
 }
 async function openReturnChoices(i){
  const outbound=state.flights[i];
  if(!outbound?.departureToken||state.tripType!=='roundtrip')return;
  const origin=state.origin?.code,destination=state.destination?.code;
  const token=outbound.departureToken,depart=state.depart,returnDate=state.return,adults=state.passengers;
  const travelClass=$('flightTravelClass').value,stops=$('flightSearchStops').value;
  state.returnParentIndex=i;state.returnOptions=[];
  showDetails('Выберите обратный рейс',origin+' → '+destination+' · '+dateText(returnDate),
    '<p class="detail-message">После выбора рейса обратно покажем тариф за весь маршрут для '+adults+' взрослых.</p><div id="returnOptionsList" class="return-options"><p>Загружаем обратные рейсы…</p></div>');
  try{
   const data=await request('flightReturns',{origin,destination,depart,returnDate,adults,tripType:'roundtrip',travelClass,stops,departureToken:token});
   if($('offerDetailsModal').hidden||state.returnParentIndex!==i||state.flights[i]?.departureToken!==token||
      state.depart!==depart||state.return!==returnDate||state.passengers!==adults||state.origin?.code!==origin||
      state.destination?.code!==destination||$('flightTravelClass').value!==travelClass||$('flightSearchStops').value!==stops)return;
   state.returnOptions=data.offers||[];
   $('returnOptionsList').innerHTML=state.returnOptions.length?state.returnOptions.map((o,j)=>{
    const leg=o.legs?.[0],p=leg?.segments||[],a=p[0],z=p.at(-1);
    return '<button type="button" class="return-option" data-return-option="'+j+'"><span><strong>'+
     esc((a?.from||destination)+' '+(a?.departure?.slice(11,16)||'')+' → '+(z?.to||origin)+' '+(z?.arrival?.slice(11,16)||''))+
     '</strong><small>'+esc((o.airlines||[]).join(', '))+' · '+(p.length===1?'Без пересадок':Math.max(0,p.length-1)+' пересад.')+'</small></span><b>'+curr(o.price)+'</b></button>';
   }).join(''):'<p class="detail-message">Поставщик не вернул обратные рейсы для этого варианта. Выберите другой вылет или даты.</p>';
  }catch(err){if(!$('offerDetailsModal').hidden&&state.returnParentIndex===i){const el=$('returnOptionsList');if(el)el.textContent='Не удалось загрузить обратные рейсы: '+err.message;}}
 }
 function chooseReturn(j){
  const i=state.returnParentIndex,outbound=state.flights[i],returning=state.returnOptions[j];
  if(!outbound?.departureToken||!returning?.legs?.[0]||state.tripType!=='roundtrip')return;
  const chosen={...returning,id:'roundtrip-'+outbound.id+'-'+returning.id,
    fareType:'roundtrip',legs:[outbound.legs[0],returning.legs[0]],
    airlines:[...new Set([...(outbound.airlines||[]),...(returning.airlines||[])])],
    durations:(outbound.durations||0)+(returning.durations||0),
    stopCount:(outbound.stopCount||0)+(returning.stopCount||0),departureToken:outbound.departureToken};
  state.flights[i]=chosen;state.flight=chosen;state.returnParentIndex=null;state.returnOptions=[];
  modal('offerDetailsModal',false);alignBudget('flight');renderFlights();renderBudget();
  toast('Оба рейса выбраны и добавлены в бюджет');
 }
 function gallery(images){const arr=[...new Set((images||[]).filter(safeUrl))].slice(0,16);return arr.length?'<img id="galleryMain" class="details-main-photo" src="'+esc(arr[0])+'" alt="Фото отеля"><div class="details-gallery">'+arr.slice(0,12).map((u,i)=>'<button type="button" class="'+(i===0?'is-active':'')+'" data-gallery="'+i+'" data-img="'+esc(u)+'"><img src="'+esc(u)+'" alt="Фото '+(i+1)+'" loading="lazy"></button>').join('')+'</div>':'<p class="detail-message">Фотографии пока недоступны у поставщика.</p>'}
 async function openHotel(i){const o=state.hotels[i];if(!o)return;const initial=o.images?.length?o.images:[o.thumbnail],book=safeUrl(o.bookingUrl)?o.bookingUrl:googleHotelsLink();showDetails(o.name,'Фотографии, удобства и бронирование','<div id="galleryWrap">'+gallery(initial)+'</div><p>'+esc(o.address||'Адрес уточняется')+' · '+curr(o.price)+' за всё проживание</p><div class="details-amenities" id="amenitiesWrap">'+(o.amenities||[]).map(a=>'<span>✓ '+esc(a)+'</span>').join('')+'</div><div class="details-providers" id="hotelProviders"><a href="'+esc(book)+'" target="_blank" rel="noopener noreferrer">Смотреть цены и бронировать ↗</a></div><p class="detail-message" id="hotelDetailsStatus">Загружаем дополнительную информацию… Для группы стоимость может быть приблизительной.</p>');
  if(!o.propertyToken){$('hotelDetailsStatus').textContent=o.source==='Booking.com'?'Сравните цену, тип номера и условия отмены на Booking.com. Возможны дополнительные налоги и сборы.':'Подробности не переданы поставщиком. Проверьте условия на странице бронирования.';return}
  try{const d=await request('hotelDetails',{propertyToken:o.propertyToken,cityName:state.hotelCity?.city,checkIn:state.checkin,checkOut:state.checkout,travelers:state.guests});if($('offerDetailsModal').hidden||$('offerDetailsTitle').textContent!==o.name)return;
  if(d.images?.length)$('galleryWrap').innerHTML=gallery([...d.images,...initial]);if(d.amenities?.length)$('amenitiesWrap').innerHTML=d.amenities.map(a=>'<span>✓ '+esc(a)+'</span>').join('');if(d.options?.length){const links=d.options.filter(x=>safeUrl(x.url));if(links.length)$('hotelProviders').innerHTML=links.map(x=>'<a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">'+esc(x.name)+' ↗</a>').join('')} $('hotelDetailsStatus').textContent=d.description||'Условия и актуальная стоимость — у продавца.';
  if((d.images?.length||0)<3){try{const p=await request('hotelPhotos',{propertyToken:o.propertyToken});if(!$('offerDetailsModal').hidden&&$('offerDetailsTitle').textContent===o.name&&p.images?.length)$('galleryWrap').innerHTML=gallery([...(d.images||[]),...(p.images||[]),...initial])}catch(e){}}
  }catch(e){if(!$('offerDetailsModal').hidden)$('hotelDetailsStatus').textContent='Дополнительная информация временно недоступна. Используйте ссылку на бронирование.'}
 }


 function hotelSearchKey(){return [$('hotelSource').value,state.hotelCity?.code,state.hotelCity?.city,state.checkin,state.checkout,state.guests].join('|')}
 function invalidateHotelSearch(){state.hotelRequestId++;state.hotels=[];state.hotel=null;state.hotelSearchKey=null;state.hotelPendingKey=null;state.hotelSearchError=null;state.hotelSearching=false;state.hotelNextPageToken=null;state.manualHotelPick=false;renderHotelRecommendation()}
 async function ensureRecommendedHotel(){if(!state.hotelCity||state.hotels.length&&state.hotelSearchKey===hotelSearchKey())return;await searchHotels(null,{auto:true})}
 async function searchHotels(e,options={}){
  e?.preventDefault();
  if(!state.hotelCity){if(!options.auto)toast('Выбери город из подсказок.');return}
  try{validateDates('hotel')}catch(err){if(!options.auto)toast(err.message);return}
  const key=hotelSearchKey();
  if(!options.force&&state.hotelSearchKey===key){renderHotels();renderHotelRecommendation();renderBudget();return}
  if(state.hotelSearching&&state.hotelPendingKey===key)return;
  const id=++state.hotelRequestId;
  state.hotelSearching=true;state.hotelPendingKey=key;state.hotelSearchError=null;state.hotel=null;state.manualHotelPick=false;
  $('searchHotels').disabled=true;searchLoading('hotel');renderHotelRecommendation();renderBudget();
  try{
   const data=await request('hotels',{city:state.hotelCity.code,cityName:state.hotelCity.city,checkIn:state.checkin,checkOut:state.checkout,travelers:state.guests,source:$('hotelSource').value});
   if(id!==state.hotelRequestId||key!==hotelSearchKey())return;
   state.hotels=data.offers||[];state.hotelNextPageToken=data.nextPageToken||null;state.hotelSearchKey=key;
   state.hotel=null;
   state.hotelSearchError=state.hotels.length?null:'По выбранным датам поставщик не вернул отели с ценами.';
   renderHotels(data);
  }catch(err){
   if(id!==state.hotelRequestId)return;
   state.hotels=[];state.hotel=null;state.hotelSearchKey=null;state.hotelSearchError=err.message;
   searchError('hotel',err);
  }finally{
   if(id===state.hotelRequestId){state.hotelSearching=false;state.hotelPendingKey=null;$('searchHotels').disabled=false;renderHotelRecommendation();renderBudget()}
  }
 }
 function pickRecommended(tier){if(!state.hotels.length)return null;const fractions={economy:0,standard:.48,comfort:.85};return state.hotels[Math.round((state.hotels.length-1)*fractions[tier])]||null}
 const tierNames={economy:'Эконом',standard:'Средний',comfort:'Комфорт'};
 function updateTierControls(){document.querySelectorAll('[data-hotel-tier]').forEach(b=>{const active=b.dataset.hotelTier===state.tier;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active))});$('budgetTier').value=state.tier}
 function setTier(tier){if(!tierNames[tier])return;state.tier=tier;state.daily=Math.round(placeForBudget().daily*tierFactor[tier]);$('dailyBudget').value=state.daily;updateTierControls();state.manualHotelPick=false;
  if(state.hotels.length&&state.hotelSearchKey===hotelSearchKey()){renderHotels()}else{state.hotel=null;ensureRecommendedHotel()}
  renderHotelRecommendation();renderBudget();if(state.tab==='compare')renderCompare();
 }
 function recommendationMarkup(compact=false){
  if(state.hotelSearching)return `<div class="recommendation-loading"><span class="mini-spinner" aria-hidden="true"></span><div><strong>Подбираем отель · ${tierNames[state.tier]}</strong><p>Проверяем доступность и цены на выбранные даты…</p></div></div>`;
  if(state.hotel){const o=state.hotel,stars=o.stars?`★ ${esc(o.stars)} · `:'',rating=o.rating?`Оценка ${esc(o.rating)} · `:'',img=/^https:\/\//.test(o.thumbnail||'')&&!compact?`<img src="${esc(o.thumbnail)}" alt="" loading="lazy" class="recommend-image">`:'';
   return `<div class="recommendation-main"><div class="recommendation-copy"><span class="recommendation-badge">${state.manualHotelPick?'Выбранный отель':`Подобран · ${tierNames[state.tier]}`}</span><strong class="recommendation-name">${esc(o.name)}</strong><p>${stars}${rating}${dateDiff(state.checkin,state.checkout)} ночей · ${state.guests} гост${state.guests===1?'ь':'я'}</p><div class="recommendation-price">${curr(o.price)} <small>за всё проживание${o.estimatedGroupPrice?' · оценка для группы':''}</small></div></div>${img}</div><div class="recommendation-foot">Цена найдена у ${esc(o.source||'поисковой системы')} и может измениться. ${compact?'<button type="button" data-goto="hotels">Смотреть отели →</button>':''}</div>`}
  if(state.hotelSearchError)return `<div class="recommendation-loading"><span class="recommendation-icon">!</span><div><strong>Пока нет подтверждённых вариантов</strong><p>${esc(state.hotelSearchError)} <a href="${esc(googleHotelsLink())}" target="_blank" rel="noopener noreferrer">Посмотреть в Google Hotels ↗</a></p></div></div>`;
  return `<div class="recommendation-loading"><span class="recommendation-icon">⌂</span><div><strong>Отель · ${tierNames[state.tier]}</strong><p>Мы найдём подходящие варианты с названиями и ценами на выбранные даты.</p></div></div>`
 }
 function renderHotelRecommendation(){for(const [id,compact] of [['hotelRecommendation',false],['budgetRecommendation',true]]){const el=$(id);if(!el)continue;el.hidden=false;el.innerHTML=recommendationMarkup(compact)}}
 function hotelsFiltered(){const f=state.hotelFilters;return state.hotels.map((o,i)=>({o,i})).filter(({o})=>(!f.stars||Number(o.stars)>=f.stars)&&(!f.rating||Number(o.rating)>=f.rating)&&(!f.max||o.price<=f.max)&&(!f.freeCancel||o.freeCancellation===true)&&(f.type==='all'||(f.type==='hotel'?!/rental|apartment|house|hostel|апартамент/i.test(o.propertyType||''): /rental|apartment|house|hostel|апартамент/i.test(o.propertyType||'')))).sort((a,b)=>f.sort==='rating'?(Number(b.o.rating||0)-Number(a.o.rating||0)||a.o.price-b.o.price):f.sort==='stars'?(Number(b.o.stars||0)-Number(a.o.stars||0)||a.o.price-b.o.price):a.o.price-b.o.price)}

 function renderHotels(data){if(!state.hotels.length){searchError('hotel',new Error('По выбранным датам отели не найдены'));renderHotelRecommendation();return}
 const list=hotelsFiltered(),recs=[['economy','Эконом'],['standard','Средний'],['comfort','Комфорт']].map(([t,label])=>{const item=pickRecommended(t);return '<button type="button" class="hotel-quick '+(state.tier===t?'is-active':'')+'" data-tier-choice="'+t+'"><span>'+label+'</span><strong>'+esc(item?.name||'—')+'</strong><small>'+(item?curr(item.price):'')+'</small></button>'}).join('');
 $('hotelResults').innerHTML='<div class="results-header"><h3>Выбирай свой отель</h3><span class="results-count">'+list.length+' из '+state.hotels.length+'</span></div><div class="hotel-tags">'+recs+'</div><div class="banner-note">Отели из выбранного источника. Фото, налоги, наличие и окончательную цену проверьте перед бронированием.</div><div class="offer-list">'+(list.length?list.map(({o,i})=>{const chosen=state.hotel?.id===o.id;const photo=safeUrl(o.thumbnail)?'<img class="hotel-image" src="'+esc(o.thumbnail)+'" alt="Фото '+esc(o.name)+'" loading="lazy">':'';
 return '<article class="offer hotel-offer '+(chosen?'chosen':'')+'"><div class="hotel-row"><div class="hotel-image-wrap"><div class="hotel-placeholder">⌂</div>'+photo+'</div><div class="hotel-content"><div class="offer-top"><strong class="offer-title hotel-title"><button class="hotel-name-button" type="button" data-hotel-details="'+i+'">'+esc(o.name)+'</button></strong><span class="offer-price">'+curr(o.price)+'</span></div><div class="offer-details">'+esc(o.source||'Поиск')+' · '+(o.stars?'★ '+esc(o.stars)+' · ':'')+(o.rating?'Оценка '+esc(o.rawRating||o.rating)+(o.ratingScale?'/'+o.ratingScale:'')+' · ':'')+esc(o.propertyType||'Отель')+'<br>'+esc(o.address||'Район уточняется')+' · '+dateDiff(state.checkin,state.checkout)+' ночей · '+state.guests+' гостей'+(o.freeCancellation?' · Бесплатная отмена':'')+'</div></div></div><div class="offer-actions"><button type="button" class="outline-btn '+(chosen?'chosen-button':'')+'" data-pick="hotel" data-index="'+i+'" aria-pressed="'+chosen+'">'+(chosen?'✓ Выбран · отменить':'Выбрать')+'</button>'+faveButton('hotel',o,i)+'<button type="button" class="outline-btn" data-hotel-details="'+i+'">Фото и детали</button><button type="button" class="booking-link" data-book-hotel="'+i+'">Бронировать ↗</button></div></article>'}).join(''):'<div class="empty-state"><strong>Нет вариантов с такими фильтрами</strong></div>')+'</div>'+(state.hotelNextPageToken?'<button type="button" class="load-more" data-more-hotels>Показать ещё отели →</button>':'')}


 async function moreHotels(){if(!state.hotelNextPageToken||state.hotelLoadingMore||!state.hotelCity)return;state.hotelLoadingMore=true;renderHotels();const token=state.hotelNextPageToken,key=hotelSearchKey();try{const data=await request('hotels',{city:state.hotelCity.code,cityName:state.hotelCity.city,checkIn:state.checkin,checkOut:state.checkout,travelers:state.guests,source:$('hotelSource').value,pageToken:token});if(key!==hotelSearchKey())return;const have=new Set(state.hotels.map(o=>o.id));for(const o of data.offers||[])if(!have.has(o.id)){state.hotels.push(o);have.add(o.id)}state.hotelNextPageToken=data.nextPageToken||null;if(!state.manualHotelPick){renderHotelRecommendation()}if(!data.offers?.length&&state.hotelNextPageToken===token)state.hotelNextPageToken=null;}catch(e){toast('Не удалось загрузить ещё: '+e.message)}finally{state.hotelLoadingMore=false;renderHotels();renderBudget()}}

 function alignBudget(kind){if(kind==='flight'&&state.flight){state.budgetTravelers=state.passengers;if(state.tripType==='roundtrip')state.budgetDays=Math.min(30,Math.max(1,dateDiff(state.depart,state.return)+1))}
  if(kind==='hotel'&&state.hotel){state.budgetTravelers=state.guests;state.budgetDays=Math.min(30,Math.max(1,dateDiff(state.checkin,state.checkout)+1))}
  const place=TRAVEL_PLACES.find(p=>p.code===state.destination?.code||p.id===state.destination?.country||p.code===state.hotelCity?.code);
  if(kind==='flight'&&state.destination?.country){setBudgetCity({country:state.destination.country,city:state.destination.city,code:state.destination.code})}else if(kind==='hotel'&&state.hotelCity?.country){setBudgetCity({country:state.hotelCity.country,city:state.hotelCity.city,code:state.hotelCity.code})}else if(place){setBudgetCity({country:place.id,city:place.city,code:place.code})}
  $('budgetTravelers').value=state.budgetTravelers;$('budgetDays').value=state.budgetDays;
 }
 function choose(kind,i){if(kind==='flight'){const o=state.flights[i];if(!o)return;if(o.fareType==='roundtrip-preview'){openReturnChoices(i);return}const same=state.flight?.id===o.id;state.flight=same?null:o;if(!same)alignBudget('flight');renderFlights()}
 else{const o=state.hotels[i];if(!o)return;const same=state.hotel?.id===o.id;state.hotel=same?null:o;state.manualHotelPick=!same;if(!same)alignBudget('hotel');renderHotels();renderHotelRecommendation()}
 renderBudget();toast((kind==='flight'?state.flight:state.hotel)?'Добавлено в расчёт поездки':'Выбор отменён — цена убрана из расчёта')}


 const conversion={EUR:1,USD:1.09,KZT:545,GBP:.86}; // Indicative rates only; not a live FX feed
 function curr(eur){return fmt(eur*conversion[state.currency],state.currency)}
 const TRAVEL_PLACES=[
  {id:'TR',country:'Турция',city:'Стамбул',code:'IST',daily:36,hotel:53,ideas:['Погулять по Султанахмету','Посмотреть на Босфор','Исследовать Гранд-базар','Посетить дворцы и музеи']},
  {id:'TH',country:'Таиланд',city:'Бангкок',code:'BKK',daily:32,hotel:41,ideas:['Храмы и Старый город','Ночной рынок','Прогулка по реке Чао Прайя','Местная уличная кухня']},
  {id:'FR',country:'Франция',city:'Париж',code:'PAR',daily:72,hotel:112,ideas:['Сена и набережные','Монмартр','Лувр или музей Орсе','Сады и пекарни']},
  {id:'GE',country:'Грузия',city:'Тбилиси',code:'TBS',daily:29,hotel:37,ideas:['Старый Тбилиси','Крепость Нарикала','Серные бани','Грузинские кафе']},
  {id:'KZ',country:'Казахстан',city:'Алматы',code:'ALA',daily:31,hotel:43,ideas:['Медеу и горы','Зелёный базар','Музеи и парки','Местная кухня']},
  {id:'UZ',country:'Узбекистан',city:'Ташкент',code:'TAS',daily:25,hotel:33,ideas:['Старый город','Базар Чорсу','Метро и музеи','Поездка в Самарканд']},
  {id:'AZ',country:'Азербайджан',city:'Баку',code:'GYD',daily:36,hotel:48,ideas:['Ичери-шехер','Приморский бульвар','Центр Гейдара Алиева','Музеи города']},
  {id:'AE',country:'ОАЭ',city:'Дубай',code:'DXB',daily:79,hotel:110,ideas:['Дубай-Крик','Рынки Дейры','Пляжи','Смотровые площадки']},
  {id:'IT',country:'Италия',city:'Рим',code:'FCO',daily:64,hotel:93,ideas:['Колизей снаружи','Форум и площади','Фонтаны','Местные траттории']},
  {id:'ES',country:'Испания',city:'Барселона',code:'BCN',daily:59,hotel:91,ideas:['Готический квартал','Городские пляжи','Архитектура Гауди','Продуктовые рынки']},
  {id:'CZ',country:'Чехия',city:'Прага',code:'PRG',daily:43,hotel:66,ideas:['Карлов мост','Староместская площадь','Пражский град','Чешские кафе']},
  {id:'MY',country:'Малайзия',city:'Куала-Лумпур',code:'KUL',daily:29,hotel:40,ideas:['Башни Петронас','Пещеры Бату','Фуд-корты','Парки города']},
  {id:'VN',country:'Вьетнам',city:'Дананг',code:'DAD',daily:24,hotel:33,ideas:['Пляжи Дананга','Мраморные горы','Рынки','Поездка в Хойан']},
  {id:'JP',country:'Япония',city:'Токио',code:'TYO',daily:68,hotel:108,ideas:['Асакуса','Сады и храмы','Район Сибуя','Уличные кафе']},
  {id:'CH',country:'Швейцария',city:'Цюрих',code:'ZRH',daily:112,hotel:157,ideas:['Старый город','Озеро Цюрих','Музеи','Прогулки по окрестностям']},
  {id:'IS',country:'Исландия',city:'Рейкьявик',code:'KEF',daily:101,hotel:142,ideas:['Набережная','Городские музеи','Геотермальные бассейны','Природные маршруты']},
  {id:'SG',country:'Сингапур',city:'Сингапур',code:'SIN',daily:75,hotel:114,ideas:['Marina Bay','Gardens by the Bay','Hawker centres','Ботанический сад']}
 ];

 const BUDGET_CITY_ALIASES={TR:['istanbul','стамбул'],TH:['bangkok','бангкок','банкок'],FR:['paris','париж'],GE:['tbilisi','тбилиси'],KZ:['almaty','алматы'],UZ:['tashkent','ташкент'],AZ:['baku','баку'],AE:['dubai','дубай'],IT:['rome','roma','рим'],ES:['barcelona','барселона'],CZ:['prague','praha','прага'],MY:['kuala lumpur','куала лумпур'],VN:['da nang','danang','дананг'],JP:['tokyo','токио'],CH:['zurich','цюрих'],IS:['reykjavik','рейкьявик'],SG:['singapore','сингапур']};
 let worldSearchTimer=null,worldSearchSeq=0,worldCandidates=[],worldActive=-1,worldCountryCodes=null;
 const cityNormalized=x=>norm(x).replace(/ё/g,'е');
 function modelForWorldCity(city){
  return TRAVEL_PLACES.find(p=>p.id===city.country&&(p.code===city.code||BUDGET_CITY_ALIASES[p.id]?.includes(cityNormalized(city.city))))||null;
 }
 function budgetCityLabel(){const p=placeForBudget();return state.budgetCustomCity?p.city:(window.QANSHA_I18N?.city(p.code,p.city)||p.city)}
 function setBudgetCity(city){
  if(!city?.country)return;
  const known=modelForWorldCity(city),prior=state.budgetCustomCity,same=prior&&prior.country===city.country&&cityNormalized(prior.city)===cityNormalized(city.city);
  state.budgetPlace=city.country;
  state.budgetCustomCity=known?null:{id:city.id||'',code:city.code||'',country:city.country,city:city.city||'',region:city.region||'',daily:same?prior.daily:60,hotel:same?prior.hotel:85};
  state.daily=Math.round(placeForBudget().daily*tierFactor[state.tier]);
  $('budgetCountry').value=city.country;
  $('budgetCitySearch').value=known?(window.QANSHA_I18N?.city(known.code,known.city)||known.city):(city.city||'');
  $('budgetCustomNotice').hidden=!state.budgetCustomCity;
  $('budgetHotelNight').value=state.budgetCustomCity?.hotel||85;
  $('worldCityStatus').textContent=city.city?countryName(city.country)+' · '+(city.region?city.region+' · ':'')+city.city:'Введите название города в выбранной стране.';
  hideWorldCities();renderBudget();
 }
 function countrySelectOptions(codes){
  const select=$('budgetCountry'),old=state.budgetPlace;
  select.innerHTML=[...new Set(codes)].sort((a,b)=>countryName(a).localeCompare(countryName(b),window.QANSHA_I18N?.locale()||'ru-RU')).map(cc=>'<option value="'+esc(cc)+'">'+esc(flag(cc)+' '+countryName(cc))+'</option>').join('');
  if(codes.includes(old))select.value=old;
 }
 function hideWorldCities(){
  $('budgetCityResults').hidden=true;$('budgetCitySearch').setAttribute('aria-expanded','false');
  worldCandidates=[];worldActive=-1;
 }
 function renderWorldChoices(cities){
  worldCandidates=cities;worldActive=-1;
  const box=$('budgetCityResults');
  box.innerHTML=cities.length?cities.map((p,i)=>'<button type="button" class="world-city-option" role="option" data-city-index="'+i+'" aria-selected="false"><span><strong>'+esc(p.city)+'</strong><small>'+esc(p.region||'')+'</small></span><small>'+esc(flag(p.country))+'</small></button>').join(''):'<div class="world-city-status" style="padding:10px">Ничего не найдено. Попробуйте другое написание города.</div>';
  box.hidden=false;$('budgetCitySearch').setAttribute('aria-expanded','true');
 }
 function chooseWorldCity(i){const c=worldCandidates[i];if(c)setBudgetCity(c)}
 async function loadWorldCountries(){
  const select=$('budgetCountry');
  const defaults=[...new Set(TRAVEL_PLACES.map(p=>p.id))];
  countrySelectOptions(defaults);
  try{
   const r=await fetch('/api/cities?mode=countries',{signal:AbortSignal.timeout(15000)});
   if(!r.ok)throw Error('countries');
   const d=await r.json();if(!Array.isArray(d.countries)||d.countries.length<150)throw Error('countries list');
   countrySelectOptions(d.countries);worldCountryCodes=d.countries;initCompareLocale();if(state.tab==='compare')renderCompare();
   $('worldCityCount').textContent=new Intl.NumberFormat(window.QANSHA_I18N?.locale()||'ru-RU').format(d.totalCities||34163)+' городов · '+d.countries.length+' стран';
  }catch{$('worldCityStatus').textContent='Не удалось загрузить полный список стран. Попробуйте обновить страницу.';}
 }
 async function fetchWorldCities(text){
  const seq=++worldSearchSeq,cc=$('budgetCountry').value;
  $('worldCityStatus').textContent='Ищем города…';
  try{
   const r=await fetch('/api/cities?'+q({q:text,country:cc}),{signal:AbortSignal.timeout(12000)});
   if(!r.ok)throw Error('city search');
   const d=await r.json();if(seq!==worldSearchSeq||cc!==$('budgetCountry').value)return;
   const cities=Array.isArray(d.results)?d.results:[];renderWorldChoices(cities);
   $('worldCityStatus').textContent=cities.length?cities.length+' вариантов · выберите нужный город':'Нет результатов: проверьте название или страну.';
  }catch{if(seq===worldSearchSeq){hideWorldCities();$('worldCityStatus').textContent='Справочник городов временно недоступен. Попробуйте ещё раз.';}}
 }
 function scheduleWorldSearch(text,delay=250){clearTimeout(worldSearchTimer);const seq=++worldSearchSeq;worldSearchTimer=setTimeout(()=>{if(seq===worldSearchSeq)fetchWorldCities(text)},delay)}
 function initWorldCityPicker(){
  const city=$('budgetCitySearch');
  $('budgetCountry').addEventListener('change',e=>{
   const cc=e.target.value;setBudgetCity({country:cc,city:''});city.value='';city.focus();scheduleWorldSearch('',0);
  });
  city.addEventListener('focus',()=>{city.select();scheduleWorldSearch(city.value,50)});
  city.addEventListener('input',()=>{scheduleWorldSearch(city.value);$('worldCityStatus').textContent='Выберите город из списка — тогда обновим расчёт.'});
  city.addEventListener('keydown',e=>{
   if(e.key==='Escape'){hideWorldCities();city.value=budgetCityLabel();return;}
   if(e.key==='ArrowDown'||e.key==='ArrowUp'){
    if(!worldCandidates.length)return;e.preventDefault();
    worldActive=(worldActive+(e.key==='ArrowDown'?1:-1)+worldCandidates.length)%worldCandidates.length;
    $('budgetCityResults').querySelectorAll('[data-city-index]').forEach((el,i)=>{el.classList.toggle('is-highlighted',i===worldActive);el.setAttribute('aria-selected',String(i===worldActive))});
    $('budgetCityResults').querySelector('[data-city-index="'+worldActive+'"]')?.scrollIntoView({block:'nearest'});
   }
   if(e.key==='Enter'&&!$('budgetCityResults').hidden&&worldCandidates.length){e.preventDefault();chooseWorldCity(worldActive>=0?worldActive:0)}
  });
  $('budgetCityResults').addEventListener('click',e=>{const b=e.target.closest('[data-city-index]');if(b)chooseWorldCity(Number(b.dataset.cityIndex))});
  document.addEventListener('click',e=>{if(!e.target.closest('#worldCityField'))hideWorldCities()});
  $('budgetHotelNight').addEventListener('input',e=>{if(state.budgetCustomCity){state.budgetCustomCity.hotel=Math.max(10,Math.min(3000,Number(e.target.value)||85));renderBudget()}});
  loadWorldCountries();
 }

 const tierFactor={economy:.72,standard:1,comfort:1.55};
 function placeForBudget(){const c=state.budgetCustomCity;return c?{id:c.country,city:c.city||'Город не выбран',country:countryName(c.country),code:c.id||'',daily:c.daily||60,hotel:c.hotel||85,ideas:[],isAssumption:true}:TRAVEL_PLACES.find(x=>x.id===state.budgetPlace)||TRAVEL_PLACES.find(x=>x.code==='FR')}
 const costExamples={TR:[35,16,2],TH:[23,14,1],FR:[72,28,2.5],GE:[32,13,0.6],KZ:[28,14,0.9],UZ:[21,10,0.5],AZ:[34,15,0.5],AE:[74,35,1.8],IT:[66,28,1.7],ES:[57,25,2.5],CZ:[49,22,1.6],MY:[26,13,0.6],VN:[22,11,0.4],JP:[64,29,1.5],CH:[122,48,4.2],IS:[118,44,4.2],SG:[73,33,1.6]};
 function tr(key){return window.QANSHA_I18N?.t(key)||key}
 function localizedPlace(p){return `${esc(countryName(p.id))} · ${esc(window.QANSHA_I18N?.city(p.code,p.city)||p.city)}`}
 function tripEstimate(x,tier,days,guests){const d=Math.max(1,Number(days)),g=Math.max(1,Number(guests)),f=tierFactor[tier];return {daily:Math.round(x.daily*f*d*g),hotel:Math.round(x.hotel*f*Math.max(0,d-1)*Math.ceil(g/2)),days:d,guests:g}}
 function partsForDay(){const all=Math.max(5,state.daily);const share=[.42,.17,.28,.13];const parts=['Еда и кафе','Транспорт','Прогулки и развлечения','Резерв на мелочи'];return parts.map((name,i)=>({name,amount:all*share[i],icon:['🍽','🚇','🎟','💡'][i],pct:Math.round(share[i]*100)}))}
 function renderLiving(){const p=placeForBudget(),f=tierFactor[state.tier],sample=p.isAssumption?[0,0,0]:costExamples[p.id]||[Math.round(p.daily*.9),Math.round(p.daily*.34),2];const unknown=p.isAssumption;const pairs=[
  {icon:'🍽️',title:'Ужин в ресторане на двоих',value:unknown?'—':curr(sample[0]*f),sub:unknown?'Нет данных для этого города':'Два основных блюда, без алкоголя'},
  {icon:'🛒',title:'Продукты в супермаркете',value:unknown?'—':curr(sample[1]*f),sub:unknown?'Нет данных для этого города':'Хлеб, молоко, яйца, фрукты и вода · корзина'},
  {icon:'🚇',title:'Поездка на транспорте',value:unknown?'—':curr(sample[2]),sub:unknown?'Нет данных для этого города':'Один билет в городе'},
  {icon:'☕',title:'Кофе в кафе',value:unknown?'—':curr(Math.max(1,p.daily*.055)*f),sub:unknown?'Нет данных для этого города':'Одна чашка'},
  {icon:'🏠',title:'Ночь в отеле',value:curr(p.hotel*f),sub:unknown?'Плановая сумма, не цена отеля':'Один двухместный номер · оценка'},
  {icon:'💸',title:'Расходы на человека в день',value:curr(state.daily),sub:unknown?'Ваш дневной бюджет, не средняя цена города':'Еда, транспорт, досуг и мелочи без отеля'}
 ];$('livingCards').innerHTML=pairs.map(x=>`<article class="living-card"><div class="living-card-icon">${x.icon}</div><div><span>${tr(x.title)}</span><strong>${x.value}</strong><small>${tr(x.sub)}</small></div></article>`).join('')}
 function renderScenarios(){const p=placeForBudget(),days=state.budgetDays,g=state.budgetTravelers,n=Math.max(0,days-1);$('budgetScenarios').innerHTML=['economy','standard','comfort'].map(t=>{const m=tripEstimate(p,t,days,g);return `<button class="scenario-card ${state.tier===t?'active':''}" data-budget-style="${t}" type="button" aria-pressed="${state.tier===t}"><span class="scenario-label">${tr(tierNames[t])}</span><strong>${curr(m.daily+m.hotel)}</strong><small>${days} ${tr('дней')} · ${g} ${tr('чел.')} · ${tr('без авиабилетов')}</small></button>`}).join('')}
 function renderSpending(){const p=placeForBudget(),items=partsForDay();$('budgetBreakdown').innerHTML=items.map(item=>`<div class="spend-entry"><div class="spend-icon">${item.icon}</div><div class="spend-info"><strong>${tr(item.name)}</strong><div class="spend-track"><span style="width:${item.pct}%"></span></div></div><b>${curr(item.amount)}</b></div>`).join('');const activities=p.ideas||[];$('budgetIdeas').innerHTML=activities.length?activities.map((idea,i)=>`<article class="idea-card"><span class="idea-num">${String(i+1).padStart(2,'0')}</span><div><strong>${esc(window.QANSHA_I18N?.idea(p.id,i,idea)||idea)}</strong><small>${tr(['Можно начать бесплатно или с небольших расходов','Учитывай транспорт и входные билеты','Заложи деньги по своему стилю','Выбери по интересам и бюджету' ][i])}</small></div></article>`).join(''):'<div class="empty-state"><p>Для этого города пока нет подготовленных маршрутов. Выберите интересующие вас достопримечательности и заложите расходы вручную.</p></div>'}

 function renderBudget(){if(!$('budgetRoute'))return;const city=placeForBudget(),g=state.budgetTravelers,days=state.budgetDays,n=Math.max(0,days-1);$('dailyBudget').value=state.daily;
 const budgetMatchesLocation=loc=>{if(!loc?.country)return false;if(city.isAssumption)return loc.country===city.id&&cityNormalized(loc.city)===cityNormalized(city.city);const exemplar=modelForWorldCity(loc);return exemplar?.code===city.code};
 const hotelMatches=state.hotel&&state.guests===g&&dateDiff(state.checkin,state.checkout)===n&&budgetMatchesLocation(state.hotelCity),flightMatches=state.flight&&state.passengers===g&&budgetMatchesLocation(state.destination);
 const local=Math.round(state.daily*days*g),lodging=hotelMatches?state.hotel.price:tripEstimate(city,state.tier,days,g).hotel,flight=flightMatches?state.flight.price:null,full=local+lodging+(flight||0);
 $('budgetRoute').textContent=flightMatches?((state.origin?.city||'Вылет')+' → '+(state.destination?.city||city.city)):localizedPlace(city).replace(/<[^>]+>/g,'');$('budgetNights').textContent=n+' '+tr('ночей');$('dailyValue').textContent=curr(state.daily);$('budgetDaysValue').textContent=days+' '+tr('дней');$('budgetTravelersValue').textContent=g+' '+tr('чел.');
 $('totalDaily').textContent=curr(local);$('totalFlights').textContent=flight?curr(flight):state.flight?'Другое число пассажиров или направление':'Не выбран';$('totalHotel').textContent=curr(lodging)+(hotelMatches?' · выбранный отель':' · модельная оценка');$('totalTrip').textContent=curr(full)+(flight?'':'*');
 $('selectedOffersSummary').innerHTML=(state.flight?'<div class="selected-summary"><span>✈ <strong>'+esc(flightTitle(state.flight))+'</strong> · '+esc(state.origin?.code||'')+' → '+esc(state.destination?.code||'')+' · '+state.passengers+' пассажиров · '+(flightMatches?curr(state.flight.price):'число путешественников изменено')+'</span><button type="button" data-budget-clear="flight">Отменить выбор</button></div>':'')+(state.hotel?'<div class="selected-summary"><span>⌂ <strong>'+esc(state.hotel.name)+'</strong> · '+dateDiff(state.checkin,state.checkout)+' ночей · '+state.guests+' гостей · '+(hotelMatches?curr(state.hotel.price):'даты/гости не совпадают')+'</span><button type="button" data-budget-clear="hotel">Отменить выбор</button></div>':'');
 const accurateCity=!city.isAssumption;
 $('budgetNote').textContent='Предварительный расчёт: '+(flight?'авиабилет учтён; ':state.flight?'выбранный билет относится к другому направлению или группе; ':'выберите авиабилет, чтобы учесть его стоимость; ')+(hotelMatches?'отель учтён. ':state.hotel?'выбранный отель не совпадает с городом, датами или числом гостей; проживание плановое. ':'проживание пока оценено по модели. ')+(!accurateCity?'Для этого города нет местных цен: ежедневные расходы и жильё рассчитаны по изменяемым плановым суммам, а не данным города. ':'')+'Перед оплатой проверьте цены у продавца.';
 $('budgetScenarioTotal').innerHTML='<span>'+(flight?'Примерно вся поездка':'Оценка без авиабилетов')+'</span><strong>'+curr(full)+'</strong><small>'+days+' '+tr('дней')+' · '+g+' '+tr('чел.')+' · '+n+' '+tr('ночей')+' · '+tr('планировочный расчёт')+'</small>';
 renderScenarios();renderSpending();renderLiving();if(state.tab==='compare')renderCompare()}



 function compareOptions(){return (worldCountryCodes||TRAVEL_PLACES.map(p=>p.id)).map(cc=>{const p=TRAVEL_PLACES.find(x=>x.id===cc);return '<option value="'+esc(cc)+'">'+esc(countryName(cc)+(p?' · '+(window.QANSHA_I18N?.city(p.code,p.city)||p.city):''))+'</option>'}).join('')}
 function initCompare(){for(const id of ['compareLeft','compareRight'])$(id).innerHTML=compareOptions();$('compareLeft').value='TR';$('compareRight').value='FR';for(const id of ['compareLeft','compareRight','compareDays'])$(id).addEventListener('change',renderCompare)}
 function initCompareLocale(){for(const id of ['compareLeft','compareRight']){const el=$(id),selected=el.value;el.innerHTML=compareOptions();el.value=selected}}


 function renderCompare(){
  const codes=[$('compareLeft').value,$('compareRight').value],places=codes.map(cc=>TRAVEL_PLACES.find(x=>x.id===cc)||null),days=Number($('compareDays').value||5),guests=state.budgetTravelers,f=tierFactor[state.tier],entries=places.map((place,i)=>({place,code:codes[i],cost:place?Math.round((place.daily*days*f*guests+place.hotel*(days-1)*f*Math.ceil(guests/2))):null}));
  const existing=entries.filter(x=>x.cost!=null),max=Math.max(1,...existing.map(x=>x.cost));
  $('compareResults').innerHTML=entries.map(({place,code,cost})=>'<article class="compare-card"><div class="compare-country"><b>'+esc(countryName(code))+'</b><span>'+esc(place?(window.QANSHA_I18N?.city(place.code,place.city)||place.city):'Стоимость поездки не исследована')+'</span></div><strong class="compare-price">'+(cost!=null?curr(cost):'—')+'</strong><div class="compare-track"><span style="width:'+(cost!=null?Math.round(cost/max*100):0)+'%"></span></div><small>'+(cost!=null?days+' дней · '+guests+' чел. · '+esc(tierNames[state.tier]):'Для страны пока нет модельных цен')+'</small></article>').join('');
  const both=entries.every(x=>x.cost!=null);
  $('compareResults').innerHTML+='<div class="compare-winner">'+(both?(entries[0].cost===entries[1].cost?'По этой модели расходы одинаковы.':'В этой модели <strong>'+esc(countryName(entries[0].cost<entries[1].cost?codes[0]:codes[1]))+'</strong> дешевле на <strong>'+curr(Math.abs(entries[0].cost-entries[1].cost))+'</strong>.'):'Для выбранной страны нет сопоставимых данных о ценах. Откройте «Сколько?» и задайте бюджет вручную для любого города.')+' Билеты и сезонные изменения не включены.</div>';
  $('compareRanking').innerHTML=[...TRAVEL_PLACES].sort((x,y)=>(x.daily*days*guests+x.hotel*(days-1)*Math.ceil(guests/2))-(y.daily*days*guests+y.hotel*(days-1)*Math.ceil(guests/2))).slice(0,8).map((p,i)=>'<div class="rank-item"><span>'+(i+1)+'</span><b>'+esc(countryName(p.id))+' · '+esc(window.QANSHA_I18N?.city(p.code,p.city)||p.city)+'</b><strong>'+curr((p.daily*days*guests+p.hotel*(days-1)*Math.ceil(guests/2))*f)+'</strong></div>').join('');
 }

 function loadFav(){try{state.faves=JSON.parse(localStorage.getItem('qansha_guest_favorites_v1')||'[]')}catch{state.faves=[]}updateFavCount()}
 function updateFavCount(){const el=$('favCount');el.textContent=state.faves.length;el.hidden=!state.faves.length;$('favOpen').classList.toggle('has-favorites',state.faves.length>0)}
 function favoriteItem(kind,o){const dates=kind==='flight'?[state.depart,...(state.tripType==='roundtrip'?[state.return]:[])]:[state.checkin,state.checkout];return {kind,offer_key:`${kind}:${kind==='flight'?(state.origin?.code||'')+'-'+(state.destination?.code||'')+'-'+state.tripType:(state.hotelCity?.code||'')+'-'+o.name}:${o.id}:${dates.join(':')}`,payload:{name:kind==='flight'?flightTitle(o):o.name,price:o.price,currency:'EUR',dates:dates.join(' / '),savedAt:new Date().toISOString(),source:kind==='flight'?'Google Flights':'Google Hotels'}}}

 async function addFavorite(kind,i){const o=(kind==='flight'?state.flights:state.hotels)[i];if(!o)return;const item=favoriteItem(kind,o),found=state.faves.find(f=>f.offer_key===item.offer_key);
 if(found){if(state.user&&state.supa){const {error}=await state.supa.from('favorites').delete().eq('id',found.id);if(error){toast('Не удалось удалить');return}await syncFavs()}else{state.faves=state.faves.filter(f=>f.offer_key!==item.offer_key);localStorage.setItem('qansha_guest_favorites_v1',JSON.stringify(state.faves));updateFavCount()}toast('Удалено из избранного')}
 else{if(state.user&&state.supa){const {error}=await state.supa.from('favorites').insert({user_id:state.user.id,kind,offer_key:item.offer_key,payload:item.payload});if(error){toast('Не удалось сохранить: '+error.message);return}await syncFavs()}else{state.faves.unshift(item);localStorage.setItem('qansha_guest_favorites_v1',JSON.stringify(state.faves));updateFavCount()}toast('Сохранено в избранное')}
 if(state.flights.length)renderFlights();if(state.hotels.length)renderHotels();if(!$('favoritesModal').hidden)renderFavs()}


 function renderFavs(){const list=$('favoritesList');list.innerHTML=state.faves.length?state.faves.map((f,i)=>`<div class="fav-entry"><div><strong>${esc(f.payload?.name||f.kind)}</strong><p>${esc(f.payload?.dates||'')} · ${fmt(f.payload?.price||0)} · сохранённая, не подтверждённая цена</p></div><button class="outline-btn" data-remove="${i}">Удалить</button></div>`).join(''):'<div class="empty-state"><p>Сохрани авиабилет или отель, и они появятся здесь.</p></div>'}
 async function syncFavs(){if(state.user&&state.supa){const {data,error}=await state.supa.from('favorites').select('id,kind,offer_key,payload').order('created_at',{ascending:false}).limit(100);if(error){toast('Избранное недоступно: '+error.message);return}state.faves=data||[]}else loadFav();updateFavCount()}
 async function removeFav(index){const item=state.faves[index];if(!item)return;if(state.user&&state.supa){const {error}=await state.supa.from('favorites').delete().eq('id',item.id);if(error){toast('Не удалось удалить');return}await syncFavs()}else{state.faves.splice(index,1);localStorage.setItem('qansha_guest_favorites_v1',JSON.stringify(state.faves));updateFavCount()}renderFavs();if(state.flights.length)renderFlights();if(state.hotels.length)renderHotels()}
 async function initAuth(){const cfg=window.QANSHA_CONFIG||{};if(!cfg.supabaseUrl||!cfg.supabaseAnonKey||!window.supabase?.createClient){$('authMessage').textContent='Регистрация станет доступна после настройки Supabase в проекте.';return}try{state.supa=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey);const {data}=await state.supa.auth.getSession();state.user=data?.session?.user||null;state.supa.auth.onAuthStateChange((_event,session)=>{state.user=session?.user||null;updateAuth();syncFavs()});updateAuth();await syncFavs()}catch(e){$('authMessage').textContent='Пока не удалось подключить аккаунт: '+e.message}}
 function updateAuth(){$('accountOpen').textContent=state.user?'Аккаунт':'Войти';$('logOut').hidden=!state.user;$('sendLink').hidden=!!state.user;$('authEmail').hidden=!!state.user;$('authMessage').textContent=state.user?`Вы вошли как ${state.user.email}`:'Введите email — мы пришлём ссылку для входа или регистрации.'}
 async function sendLink(){if(!state.supa){toast('Подключи Supabase');return}const email=$('authEmail').value.trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){toast('Укажи правильный email');return}const btn=$('sendLink');btn.disabled=true;try{const {error}=await state.supa.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+location.pathname}});if(error)throw error;$('authMessage').textContent='Проверь почту: ссылка для входа отправлена.'}catch(e){$('authMessage').textContent=e.message}finally{btn.disabled=false}}
 function resetFlightOffers(){
 state.flight=null;state.flights=[];state.returnOptions=[];state.returnParentIndex=null;
 $('flightFilterPanel').hidden=true;
 $('flightResults').innerHTML='<div class="empty-state"><strong>Параметры поиска изменены</strong><p>Нажмите «Найти авиабилеты», чтобы обновить цены.</p></div>';
 renderBudget();
}
function setTripType(kind){state.tripType=kind==='oneway'?'oneway':'roundtrip';document.querySelectorAll('[data-trip]').forEach(b=>{const on=b.dataset.trip===state.tripType;b.classList.toggle('is-active',on);b.setAttribute('aria-pressed',String(on))});$('returnField').hidden=state.tripType==='oneway';resetFlightOffers()}
 function setCurrency(currency){if(!conversion[currency])return;state.currency=currency;$('flightCurrency').value=currency;$('budgetCurrency').value=currency;renderBudget();if(state.flights.length)renderFlights();if(state.hotels.length)renderHotels();renderHotelRecommendation();if(state.tab==='compare')renderCompare()}
 function updateHotelFilters(){state.hotelFilters={sort:$('hotelSort').value,stars:Number($('hotelStars').value),rating:Number($('hotelRating').value),max:Number($('hotelMaxPrice').value)||0,type:$('hotelType').value,freeCancel:$('hotelFreeCancel').checked};if(state.hotels.length)renderHotels()}
 function init(){document.addEventListener('error',event=>{if(event.target?.tagName==='IMG'&&(event.target.classList?.contains('hotel-image')||event.target.closest?.('.details-gallery')||event.target.id==='galleryMain'))event.target.hidden=true;},true);document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>tab(b.dataset.tab)));Object.keys(airportInputs).forEach(initAirport);selectPlace('flightOrigin',popular.find(p=>p.code==='NQZ'));selectPlace('flightDest',popular.find(p=>p.code==='PAR'));document.querySelectorAll('[data-date]').forEach(b=>b.addEventListener('click',()=>openCalendar(b.dataset.date)));document.querySelectorAll('[data-trip]').forEach(b=>b.addEventListener('click',()=>setTripType(b.dataset.trip)));$('flightForm').addEventListener('submit',searchFlights);$('hotelForm').addEventListener('submit',searchHotels);['flightSort','flightStops','flightAirline','flightTime','flightMaxPrice','flightMaxDuration'].forEach(id=>$(id).addEventListener(['flightMaxPrice','flightMaxDuration'].includes(id)?'input':'change',()=>{if(state.flights.length)renderFlights()}));['hotelSort','hotelStars','hotelRating','hotelMaxPrice','hotelType','hotelFreeCancel'].forEach(id=>$(id).addEventListener(id==='hotelMaxPrice'?'input':'change',updateHotelFilters));$('passengers').addEventListener('change',e=>{state.passengers=Number(e.target.value);resetFlightOffers()});['flightTravelClass','flightSearchStops'].forEach(id=>$(id).addEventListener('change',resetFlightOffers));$('hotelGuests').addEventListener('change',e=>{state.guests=Number(e.target.value);invalidateHotelSearch();renderBudget();ensureRecommendedHotel()});$('hotelSource').addEventListener('change',()=>{invalidateHotelSearch();$('hotelResults').innerHTML='<div class="empty-state"><strong>Источник отелей изменён</strong><p>Нажмите «Найти отели», чтобы запросить новые предложения.</p></div>';renderBudget()});$('budgetTier').addEventListener('change',e=>setTier(e.target.value));$('flightCurrency').addEventListener('change',e=>setCurrency(e.target.value));$('budgetCurrency').addEventListener('change',e=>setCurrency(e.target.value));$('dailyBudget').addEventListener('input',e=>{state.daily=Number(e.target.value);if(state.budgetCustomCity)state.budgetCustomCity.daily=state.daily/tierFactor[state.tier];renderBudget()});$('accountOpen').addEventListener('click',()=>modal('accountModal',true));$('favOpen').addEventListener('click',()=>{renderFavs();modal('favoritesModal',true)});$('favoritesList').addEventListener('click',e=>{const b=e.target.closest('[data-remove]');if(b)removeFav(Number(b.dataset.remove))});$('sendLink').addEventListener('click',sendLink);$('logOut').addEventListener('click',async()=>{await state.supa?.auth.signOut();state.user=null;updateAuth();await syncFavs()});$('calendarGrid').addEventListener('click',()=>{});$('monthPrev').addEventListener('click',()=>{const d=new Date(state.calendarMonth+'-01T00:00:00Z');d.setUTCMonth(d.getUTCMonth()-1);state.calendarMonth=d.toISOString().slice(0,7);renderCalendar()});$('monthNext').addEventListener('click',()=>{const d=new Date(state.calendarMonth+'-01T00:00:00Z');d.setUTCMonth(d.getUTCMonth()+1);state.calendarMonth=d.toISOString().slice(0,7);renderCalendar()});$('loadCalendar').addEventListener('click',calendarPrices);document.querySelectorAll('.modal-backdrop').forEach(el=>el.addEventListener('click',e=>{if(e.target===el)modal(el.id,false)}));document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.modal-backdrop').forEach(m=>modal(m.id,false))});initWorldCityPicker();
 for(const [id,prop] of [['budgetDays','budgetDays'],['budgetTravelers','budgetTravelers']])$(id).addEventListener('input',e=>{state[prop]=Number(e.target.value);renderBudget()});
 window.QANSHA_BUDGET={getState:()=>({days:state.budgetDays,travelers:state.budgetTravelers,tier:state.tier,place:state.budgetPlace}),refresh:()=>{const codes=[...$('budgetCountry').options].map(o=>o.value);countrySelectOptions(codes.length?codes:TRAVEL_PLACES.map(p=>p.id));$('budgetCitySearch').value=budgetCityLabel();syncDates();renderBudget();initCompareLocale();if(state.tab==='compare')renderCompare()}};
 syncDates();updateTierControls();renderHotelRecommendation();initCompare();setCurrency('EUR');loadFav();initAuth();tab('budget')}
 document.addEventListener('DOMContentLoaded',init);
})();