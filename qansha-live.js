/* Qansha? online flight / hotel selection, budget, sign-in and favorites.
 * No fake bookable offers are created by this file. Search requires deployed api/search.js.
 */
(function () {
  'use strict';
  const cfg = window.QANSHA_CONFIG || {};
  const el = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const dateUTC = date => new Date(date + 'T00:00:00Z').getTime();
  const plusDays = (date, n) => new Date(dateUTC(date) + n * 86400000).toISOString().slice(0,10);
  const fmt = (n,currency='EUR') => Number(n||0).toLocaleString('ru-RU', {style:'currency',currency,maximumFractionDigits:0});
  const status = (message, type='') => {el('liveMessage').textContent=message;el('liveMessage').className='live-status '+type;};
  const localKey = 'qansha_guest_favorites_v1';
  let supa=null, user=null, faves=[], flightResults=[], hotelResults=[];
  let selectedFlight=null, selectedHotel=null, hotelRecs=[], environment=null, searching=false;
  let currentSearchId=0;
  const providerUrl = (cfg.apiBase||'').replace(/\/$/,'');

  const getCityIata = id => (typeof cityToIata!=='undefined' ? cityToIata[id] : null);
  const codeCityHotel = id => {
    const code = getCityIata(id);
    // Keep the city IATA code for validation; a readable city name is sent to Google Hotels.
    return id==='reykjavik'?'REK':code;
  };
  const guestCount = () => Number(el('liveTravelers').value||1);
  const datesOk = () => {
    const inputs=['liveLeave','liveReturn','liveCheckIn','liveCheckOut'].map(k=>el(k).value);
    if(inputs.some(x=>!/^\d{4}-\d{2}-\d{2}$/.test(x))) throw new Error('Заполни все даты поездки и отеля.');
    const [fly,back,ci,co]=inputs;
    if(dateUTC(back)<=dateUTC(fly)) throw new Error('Дата возврата должна быть позже вылета.');
    if(dateUTC(co)<=dateUTC(ci)) throw new Error('Дата выезда из отеля должна быть позже заезда.');
    if(dateUTC(ci)<dateUTC(fly) || dateUTC(co)>dateUTC(back)) throw new Error('Даты отеля должны помещаться между вылетом и возвращением.');
    const today = new Date();today.setHours(0,0,0,0);
    if(dateUTC(fly)<Date.UTC(today.getFullYear(),today.getMonth(),today.getDate())) throw new Error('Дата вылета уже прошла.');
    return {fly,back,ci,co};
  };
  function markClear(){
    currentSearchId++;flightResults=[];hotelResults=[];selectedFlight=null;selectedHotel=null;hotelRecs=[];environment=null;
    el('liveFlightsMeta').textContent='—';el('liveHotelsMeta').textContent='—';
    el('liveFlights').innerHTML='<div class="offer-empty">Нажми «Найти рейсы и отели», чтобы загрузить предложения на выбранные даты.</div>';
    el('liveHotels').innerHTML='<div class="offer-empty">Поиск доступных номеров запустится вместе с поиском авиабилетов.</div>';
    renderSummary();
  }
  function syncTravelers(){
    if(typeof people!=='undefined'){people=guestCount();renderPlanner();}
  }
  function syncDateDays(){
    try {const {ci,co}=datesOk();const nights=Math.round((dateUTC(co)-dateUTC(ci))/86400000);
      if(nights>0&&nights<=30&&typeof days!=='undefined'){days=nights+1;el('dayCount').textContent=days;renderPlanner();renderBudgets();renderCompare();}
    } catch(_) {/* User may still be choosing dates. */}
  }
  function syncPlace(){
    if(el('liveDepart')) el('liveDepart').value=depart;
    if(el('liveDest')) el('liveDest').value=current;
    if(el('liveTier')) el('liveTier').value=plannerTier;
    if(el('liveTravelers')) el('liveTravelers').value=String(Math.min(9,people));
    markClear();
  }
  function initForms(){
    el('liveDepart').innerHTML=departCities.map(d=>`<option value="${esc(d.id)}">${esc(d.flag)} ${esc(d.name)}</option>`).join('');
    el('liveDest').innerHTML=cities.map(c=>`<option value="${esc(c.id)}">${esc(c.flag)} ${esc(c.name)}</option>`).join('');
    el('liveTravelers').innerHTML=Array.from({length:9},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('');
    const today=new Date();today.setDate(today.getDate()+35);
    const fly=today.toISOString().slice(0,10);
    el('liveLeave').value=fly; el('liveCheckIn').value=fly;
    el('liveReturn').value=plusDays(fly,4);el('liveCheckOut').value=plusDays(fly,4);
    const todayIso=new Date().toISOString().slice(0,10);
    ['liveLeave','liveReturn','liveCheckIn','liveCheckOut'].forEach(k=>el(k).min=todayIso);
    syncPlace();
    syncDateDays();
    el('liveDest').addEventListener('change',()=>{selectCity(el('liveDest').value);});
    el('liveDepart').addEventListener('change',()=>{el('departCity').value=el('liveDepart').value;renderAll();});
    el('liveTravelers').addEventListener('change',()=>{syncTravelers();markClear()});
    el('liveTier').addEventListener('change',()=>{setPlannerTier(el('liveTier').value);chooseHotelTier(el('liveTier').value)});
    ['liveLeave','liveReturn','liveCheckIn','liveCheckOut'].forEach(k=>el(k).addEventListener('change',()=>{syncDateDays();markClear()}));
    el('liveSearchBtn').addEventListener('click',searchAll);
    el('openFaves').addEventListener('click',()=>{renderFavorites();openDrawer('favesDrawer')});
    el('openAuth').addEventListener('click',()=>{renderAuth();openDrawer('authDrawer')});
    document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>closeDrawer(button.dataset.close)));
    ['authDrawer','favesDrawer'].forEach(id=>el(id).addEventListener('click',e=>{if(e.target.id===id)closeDrawer(id)}));
    el('authSend').addEventListener('click',sendMagicLink);
    el('signOut').addEventListener('click',signOut);
    window.addEventListener('keydown',e=>{if(e.key==='Escape'){closeDrawer('authDrawer');closeDrawer('favesDrawer')}});
    // Wrap existing functionality without altering Qansha?'s original estimate and comparison sections.
    const originalRenderBudgets=window.renderBudgets;
    window.renderBudgets=function(){originalRenderBudgets();renderTierHotelNames()};
    const originalSelectCity=window.selectCity;
    window.selectCity=function(id){originalSelectCity(id);syncPlace()};
    const originalRenderAll=window.renderAll;
    window.renderAll=function(){originalRenderAll();syncPlace()};
    const originalSetTier=window.setPlannerTier;
    window.setPlannerTier=function(tier){originalSetTier(tier);el('liveTier').value=tier;chooseHotelTier(tier)};
    const originalChangePeople=window.changePeople;
    window.changePeople=function(delta){originalChangePeople(delta);people=Math.min(9,people);renderPlanner();el('liveTravelers').value=String(people);markClear()};
    const originalChangeDays=window.changeDays;
    window.changeDays=function(delta){originalChangeDays(delta);const check=el('liveCheckIn').value;
      if(check){el('liveCheckOut').value=plusDays(check,Math.max(1,days-1));el('liveReturn').value=el('liveCheckOut').value;}markClear();};
    const originalSlider=window.onDailySlider;
    window.onDailySlider=function(value){originalSlider(value);renderSummary()};
    const originalCurrency=window.changeCurrency;
    window.changeCurrency=function(value){originalCurrency(value);renderSummary()};
  }
  async function fetchAPI(query) {
    const url=new URL(`${providerUrl}/api/search`,window.location.href);
    Object.entries(query).forEach(([k,v])=>url.searchParams.set(k,String(v)));
    const ctrl=new AbortController();const timeout=setTimeout(()=>ctrl.abort(),28000);
    try {
      const response=await fetch(url.toString(),{signal:ctrl.signal});
      let data;try{data=await response.json()}catch(_){throw new Error('Сервер поиска недоступен. Разверни Qansha? на Vercel и настрой API.');}
      if(!response.ok)throw new Error(data.error||'Не удалось получить предложения.');
      return data;
    }finally{clearTimeout(timeout)}
  }
  async function searchAll(){
    if(searching)return;
    let input;
    try{input=datesOk()}catch(e){status(e.message,'warn');return}
    const from=getCityIata(el('liveDepart').value), to=getCityIata(el('liveDest').value);
    const hotelCity=codeCityHotel(el('liveDest').value), adults=guestCount();
    if(!from||!to||!hotelCity){status('Для выбранного направления пока нет IATA-кода.','warn');return}
    if(from===to){status('Укажите разные города вылета и назначения.','warn');return}
    searching=true;const id=++currentSearchId;
    el('liveSearchBtn').disabled=true;el('liveSearchBtn').textContent='Ищем предложения…';
    status('Запрашиваем доступные авиарейсы и номера на выбранные даты…');
    const destinationName=cities.find(c=>c.id===el('liveDest').value)?.name||el('liveDest').value;
    const searches=await Promise.allSettled([
      fetchAPI({kind:'flights',origin:from,destination:to,depart:input.fly,returnDate:input.back,adults}),
      fetchAPI({kind:'hotels',city:hotelCity,cityName:destinationName,checkIn:input.ci,checkOut:input.co,travelers:adults})
    ]);
    searching=false;el('liveSearchBtn').disabled=false;el('liveSearchBtn').textContent='Найти рейсы и отели';
    if(id!==currentSearchId)return;
    const [flights,hotels]=searches;
    const failed=[];
    if(flights.status==='fulfilled'){
      flightResults=(flights.value.offers||[]).filter(f=>f.currency==='EUR');
      selectedFlight=flightResults[0]||null;environment=flights.value.environment;
    } else {flightResults=[];selectedFlight=null;failed.push(`авиабилеты: ${flights.reason?.message||'ошибка'}`)}
    if(hotels.status==='fulfilled'){
      hotelResults=(hotels.value.offers||[]).filter(h=>h.currency==='EUR');
      environment=environment==='test'?'test':hotels.value.environment;
      hotelRecs=recommendHotels(hotelResults);
      selectedHotel=hotelRecs.find(x=>x.tier===el('liveTier').value)?.hotel||null;
      if(hotels.value.guestAllocationNote)failed.push(hotels.value.guestAllocationNote);
    } else {hotelResults=[];hotelRecs=[];selectedHotel=null;failed.push(`отели: ${hotels.reason?.message||'ошибка'}`)}
    renderFlights();renderHotels();renderTierHotelNames();renderSummary();
    if(failed.length)status(failed.join(' · '),'warn');
    else status('Поиск через Google Flights / Hotels. Перелёт — два отдельных билета, цена на группу ориентировочная; наличие мест и багажа проверьте перед покупкой.','good');
  }
  function recommendHotels(offers){
    if(!offers.length)return [];
    const result=[];const used=new Set();
    for(const [tier,share] of [['budget',0],['mid',0.5],['luxury',0.85]]){
      const idx=Math.round((offers.length-1)*share);
      let selected=null;
      for(let radius=0;radius<offers.length&&!selected;radius++){
        for(const p of [idx+radius,idx-radius])if(offers[p]&&!used.has(offers[p].id)){selected=offers[p];break;}
      }
      if(selected){used.add(selected.id);result.push({tier,hotel:selected});}
    }
    return result;
  }
  function moneyEUR(price){return fmt(price,'EUR')}
  function flightName(f){return (f.airlines||[]).join(' / ') || 'Авиакомпания не указана'}
  function flightDetails(f){return (f.legs||[]).map((leg,i)=>{
    const seg=leg.segments||[];const first=seg[0],last=seg[seg.length-1];
    if(!first||!last)return '';
    const dep=first.departure?.replace('T',' ').slice(0,16)||'';
    const arr=last.arrival?.replace('T',' ').slice(0,16)||'';
    return `<div>${i===0?'Туда':'Обратно'}: ${esc(first.from)} → ${esc(last.to)} · ${seg.length-1} пересадок<br>${esc(dep)} — ${esc(arr)} · ${esc(leg.duration)}</div>`;
  }).join('')}
  function renderFlights(){
    el('liveFlightsMeta').textContent=flightResults.length?`${flightResults.length} вариантов · EUR · онлайн · оценка для компании`:'Нет предложений';
    if(!flightResults.length){el('liveFlights').innerHTML='<div class="offer-empty">Дешёвые рейсы не найдены или SerpApi ещё не подключён. Попробуй другие даты или проверь настройки сервера.</div>';return}
    el('liveFlights').innerHTML=flightResults.slice(0,9).map((f,i)=>`<article class="offer-card ${selectedFlight?.id===f.id?'active':''}">
      <span class="offer-tier">${i===0?'✦ Самый дешёвый из найденных':'Рейс '+(i+1)}</span>
      <div class="offer-name">${esc(flightName(f))}</div><div class="offer-price">${moneyEUR(f.price)}</div>
      <div class="offer-muted">Ориентир для ${guestCount()} пассажиров · ${moneyEUR(f.perAdultPrice||f.price/guestCount())} на человека · два отдельных билета</div>
      <div class="offer-muted">${flightDetails(f)}</div>
      <div class="offer-muted">Багаж: ${f.checkedBags==null?'уточнить в условиях тарифа':`${Number(f.checkedBags)} мест(а) по данным тарифа`}</div>
      <div class="offer-buttons"><button class="q-btn compact" onclick="QanshaLive.pickFlight(${i})">${selectedFlight?.id===f.id?'✓ Выбран':'Выбрать'}</button>
      <button class="q-btn compact ghost" onclick="QanshaLive.favorite('flight',${i})" aria-label="Сохранить рейс">♡ Сохранить</button></div></article>`).join('');
  }
  function hotelName(h){return esc(h.name||'Отель без названия')}
  function renderHotelCard(h,displayTier){
    const i=hotelResults.indexOf(h);if(i<0)return '';
    const nights=Math.max(1,Math.round((dateUTC(el('liveCheckOut').value)-dateUTC(el('liveCheckIn').value))/86400000));
    return `<article class="offer-card ${selectedHotel?.id===h.id?'active':''}">
      <span class="offer-tier">${displayTier?esc({budget:'🎒 Эконом',mid:'☕ Средний',luxury:'💎 Комфорт'}[displayTier]):'Другой доступный отель'}</span>
      <div class="offer-name">${hotelName(h)}</div><div class="offer-muted">${h.stars?'★ '+Number(h.stars)+' · ':''}${esc(h.address||'Адрес уточняется у поставщика')}</div>
      <div class="offer-price">${moneyEUR(h.price)}</div>
      ${h.thumbnail?`<img class="q-hotel-image" src="${esc(h.thumbnail)}" loading="lazy" alt="${esc(h.name)}">`:''}<div class="offer-muted">${h.roomCount} номер(а), ${nights} ночей, ориентировочно на группу<br>≈ ${moneyEUR(h.price/guestCount())} на человека<br>${esc(h.room||'Категория номера уточняется')}</div>
      ${h.estimatedGroupPrice?'<div class="offer-muted">Несколько номеров: цена ориентировочная, наличие нужно проверить.</div>':''}<a class="q-maplink" href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent((h.name||'')+' '+(h.address||''))}" target="_blank" rel="noopener noreferrer">Посмотреть расположение ↗</a>
      <div class="offer-buttons"><button class="q-btn compact" onclick="QanshaLive.pickHotel(${i})">${selectedHotel?.id===h.id?'✓ Выбран':'Выбрать'}</button>
      <button class="q-btn compact ghost" onclick="QanshaLive.favorite('hotel',${i})">♡ Сохранить</button></div></article>`;
  }
  function renderHotels(){
    el('liveHotelsMeta').textContent=hotelResults.length?`${hotelResults.length} с ценой · EUR · онлайн · оценка для компании`:'Нет предложений';
    if(!hotelResults.length){el('liveHotels').innerHTML='<div class="offer-empty">Отели с ценами не найдены. Проверь даты, город или подключение SerpApi.</div>';return;}
    const recs=hotelRecs.map(({tier,hotel})=>renderHotelCard(hotel,tier)).join('');
    const seen=new Set(hotelRecs.map(x=>x.hotel.id));
    const more=hotelResults.filter(h=>!seen.has(h.id)).slice(0,6);
    el('liveHotels').innerHTML=recs+(more.length?`<div class="offer-empty" style="padding:12px 15px"><strong>Другие доступные варианты</strong></div>`:'')+more.map(h=>renderHotelCard(h)).join('');
  }
  function chooseHotelTier(tier){
    const rec=hotelRecs.find(x=>x.tier===tier);
    if(rec){selectedHotel=rec.hotel;renderHotels()}
    renderTierHotelNames();renderSummary();
  }
  function renderTierHotelNames(){
    const cards=document.querySelectorAll('#budgetCards .budget');
    for(const card of cards){
      card.querySelector('.live-hotel-note')?.remove();
      const tier=card.getAttribute('data-tier');
      const rec=hotelRecs.find(h=>h.tier===tier);
      if(!rec)continue;
      const note=document.createElement('div');note.className='live-hotel-note';
      const title=document.createElement('strong');title.textContent='🏨 '+rec.hotel.name;
      const info=document.createElement('span');info.textContent='Предложение на выбранные даты: '+moneyEUR(rec.hotel.price)+' за номера для всей группы. Сумма карточки выше — ориентир.';
      note.append(title,info);card.appendChild(note);
    }
  }
  function renderSummary(){
    const box=el('liveSummary');if(!box)return;
    if(!selectedHotel||!selectedFlight){box.innerHTML='<span class="offer-tier">Итоговый ориентир по найденным предложениям</span><span class="large">Выбери рейс и отель</span><div class="meta">После онлайн-поиска мы автоматически выберем самый дешёвый рейс и отель выбранного стиля. Ты сможешь заменить их вручную.</div>';return;}
    const p=guestCount();
    const nights=Math.round((dateUTC(el('liveCheckOut').value)-dateUTC(el('liveCheckIn').value))/86400000);
    const tripDays=Math.round((dateUTC(el('liveReturn').value)-dateUTC(el('liveLeave').value))/86400000)+1;
    const expenses=Number(plannerDailyUSD||0)*0.92*tripDays*p;
    const total=Number(selectedHotel.price)+Number(selectedFlight.price)+expenses;
    box.innerHTML=`<span class="offer-tier">Онлайн-цены · оценка на компанию · ${esc(el('liveLeave').value)} — ${esc(el('liveReturn').value)}</span>
       <span class="large">${moneyEUR(total/p)} / человек</span><div class="meta">Ориентир на компанию: <strong>${moneyEUR(total)}</strong> ·
       ✈️ рейсы ${moneyEUR(selectedFlight.price)} · 🏨 ${esc(selectedHotel.name)} ${moneyEUR(selectedHotel.price)} (${nights} ночей) ·
       🍜 ежедневные расходы ${moneyEUR(expenses)} (${tripDays} дней × ${moneyEUR(Number(plannerDailyUSD||0)*.92)} × ${p} чел.).</div>
       <p class="q-subline">Два отдельных авиабилета (туда и обратно), цена на 1 взрослого × число путешественников. Многоместное бронирование номеров не подтверждено. Рейсы и цены могут измениться. Валюта поиска — EUR. Ежедневный бюджет берётся из ползунка выше (демонстрационный курс USD → EUR). Визы, багаж и туристические сборы — отдельно.</p>`;
  }
  function openDrawer(id){el(id).classList.add('open');document.body.style.overflow='hidden'}
  function closeDrawer(id){el(id).classList.remove('open');if(!document.querySelector('.q-drawer.open'))document.body.style.overflow=''}
  function loadLocal(){try{return JSON.parse(localStorage.getItem(localKey)||'[]')}catch(_){return []}}
  function saveLocal(){try{localStorage.setItem(localKey,JSON.stringify(faves))}catch(_){/* blocked storage */}}
  async function initSupabase(){
    if(!cfg.supabaseUrl||!cfg.supabaseAnonKey||!window.supabase?.createClient){faves=loadLocal();renderAuth();renderFavorites();return}
    try{
      supa=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey);
      const {data:{session},error}=await supa.auth.getSession();if(error)throw error;
      user=session?.user||null;
      supa.auth.onAuthStateChange((_evt,session)=>{user=session?.user||null;refreshFavorites();renderAuth()});
      await refreshFavorites();renderAuth();
    }catch(err){console.warn('Supabase not initialized:',err.message);supa=null;faves=loadLocal();renderAuth();renderFavorites()}
  }
  function renderAuth(){
    const authButton=el('openAuth');
    if(user){el('authState').textContent=`Вход выполнен: ${user.email||'пользователь'}. Избранное сохраняется в аккаунте.`;
      authButton.textContent=`👤 ${user.email||'Аккаунт'}`;el('signOut').hidden=false;el('authSend').disabled=true;
    } else {el('authState').textContent=supa?'Введите email, и на него придёт ссылка для входа или регистрации.':'Авторизация ещё не настроена: подключи Supabase согласно README.';
      authButton.textContent='Войти / регистрация';el('signOut').hidden=true;el('authSend').disabled=!supa;}
  }
  async function sendMagicLink(){
    if(!supa)return;
    const email=el('authEmail').value.trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){el('authState').textContent='Укажи действительный email.';return}
    el('authSend').disabled=true;
    try{const {error}=await supa.auth.signInWithOtp({email,options:{emailRedirectTo:window.location.origin+window.location.pathname}});
      if(error)throw error;el('authState').textContent='Проверь почту. Мы отправили ссылку для входа.';
    }catch(err){el('authState').textContent='Не получилось отправить письмо: '+err.message}
    finally{el('authSend').disabled=false}
  }
  async function signOut(){if(supa){await supa.auth.signOut();user=null;await refreshFavorites();renderAuth()}}
  async function refreshFavorites(){
    if(user&&supa){const {data,error}=await supa.from('favorites').select('id,kind,offer_key,payload,created_at').order('created_at',{ascending:false}).limit(100);
      if(error){status('Не удалось загрузить избранное: '+error.message,'warn');faves=[]}
      else faves=(data||[]).map(x=>({key:x.offer_key,kind:x.kind,payload:x.payload,id:x.id}));
    }else faves=loadLocal();
    renderFavorites();
  }
  function makeFavorite(kind,o){
    const route=kind==='flight'?(o.legs||[]).flatMap(l=>l.segments||[]).map(s=>`${s.from}${s.to}${s.departure}`).join('|') : o.id;
    const dates=kind==='flight'?`${el('liveLeave').value}:${el('liveReturn').value}`:`${el('liveCheckIn').value}:${el('liveCheckOut').value}`;
    const key=`${kind}:${route}:${dates}`.slice(0,500);
    return {kind,key,payload:{name:kind==='flight'?flightName(o):o.name,price:o.price,currency:o.currency,
      dates,route:kind==='flight'?route:'',address:kind==='hotel'?o.address:'',roomCount:o.roomCount||null,
      savedAt:new Date().toISOString(),source:environment}};
  }
  async function addFavorite(kind,i){
    const offer=kind==='flight'?flightResults[i]:hotelResults[i];if(!offer)return;
    const item=makeFavorite(kind,offer);
    if(faves.some(x=>x.key===item.key)){status('Уже есть в избранном.','good');return}
    if(user&&supa){
      const {error}=await supa.from('favorites').insert({user_id:user.id,kind,offer_key:item.key,payload:item.payload});
      if(error){status('Ошибка сохранения: '+error.message,'warn');return}
      await refreshFavorites();
    }else{faves.unshift(item);saveLocal();renderFavorites()}
    status('Добавлено в избранное. Для синхронизации между устройствами войди в аккаунт.','good');
  }
  async function removeFavorite(i){
    const favorite=faves[i];if(!favorite)return;
    if(user&&supa){const {error}=await supa.from('favorites').delete().eq('id',favorite.id);if(error){status(error.message,'warn');return}await refreshFavorites();}
    else{faves.splice(i,1);saveLocal();renderFavorites()}
  }
  function renderFavorites(){
    if(!el('favItems'))return;
    el('faveCount').textContent=faves.length;
    el('favItems').innerHTML=faves.length?faves.map((x,i)=>`<div class="fave-item"><div>
      <div class="fave-title">${x.kind==='hotel'?'🏨':'✈️'} ${esc(x.payload?.name||'Предложение')}</div>
      <div class="fave-meta">${esc(x.payload?.dates||'')} · сохранённая цена ${fmt(x.payload?.price||0,x.payload?.currency||'EUR')} · не гарантирована</div>
      </div><button class="q-btn secondary compact" onclick="QanshaLive.remove(${i})" aria-label="Удалить из избранного">Удалить</button></div>`).join(''):
      '<div class="offer-empty">Ты ещё не сохранил авиабилеты или отели.</div>';
  }
  window.QanshaLive={pickFlight(i){selectedFlight=flightResults[i]||null;renderFlights();renderSummary();},
    pickHotel(i){selectedHotel=hotelResults[i]||null;renderHotels();renderSummary();},
    favorite:addFavorite,remove:removeFavorite};
  if(el('liveSearch')){initForms();initSupabase()}
})();