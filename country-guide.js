(() => {
  'use strict';
  // A curated geographic directory. An ISO code in this list does not imply
  // that Qansha has verified city prices for the country.
  const groups = {
    central: 'KZ KG UZ TJ TM',
    asia: 'CN JP KR MN TW HK MO IN PK BD LK NP BT MV TH VN KH LA MM MY SG ID PH BN TL TR GE AM AZ AE SA QA KW BH OM YE IR IQ IL JO LB SY CY AF',
    europe: 'GB IE FR DE IT ES PT NL BE LU CH AT PL CZ SK HU SI HR BA RS ME AL MK GR BG RO MD UA BY LT LV EE FI SE NO DK IS MT AD MC SM VA LI',
    americas: 'US CA MX BR AR CL PE CO EC BO PY UY VE CR PA GT SV HN NI CU DO JM BS TT BZ',
    africa: 'EG MA TN DZ ZA KE TZ UG RW ET GH NG SN AO NA BW ZM MU',
    oceania: 'AU NZ FJ PG WS'
  };
  const all = Object.values(groups).flatMap(s => s.split(' '));
  const unique = [...new Set(all)];
  const official = {KZ:'https://stat.gov.kz/en/industries/economy/prices/',KG:'https://stat.kg/en/',UZ:'https://stat.uz/en/official-statistics/prices-and-indexes',TJ:'https://www.stat.tj/en/analytical-tables/',TM:'https://www.stat.gov.tm/en/'};
  const root = document.getElementById('countryGuide');
  if (!root) return;
  const $ = id => document.getElementById(id);
  const copy = {
    ru: { eyebrow:'СТРАНЫ В СПРАВОЧНИКЕ', title:'Выбери страну', intro:'Ищи города выбранной страны и планируй поездку. Цены есть только у городов с подтверждённым источником.', region:'Регион', country:'Страна', all:'Все регионы', central:'Центральная Азия', asia:'Остальная Азия', europe:'Европа', americas:'Америка', africa:'Африка', oceania:'Океания', cities:'Города', source:'База городов: GeoNames', official:'Официальная статистика', inflation:'Инфляция за год', year:'за {year} г.', noIndicator:'Страновой показатель пока недоступен.', noCities:'Города не загрузились. Найди город через поиск вверху страницы.', context:'Это изменение цен по стране, а не средняя цена жизни в выбранном городе.', select:'Выбери страну', count:'{count} стран' },
    kk: { eyebrow:'АНЫҚТАМАЛЫҚТАҒЫ ЕЛДЕР', title:'Елді таңда', intro:'Таңдалған елдің қалаларын іздеп, сапарды жоспарла. Бағалар тек дереккөзі расталған қалаларда көрсетіледі.', region:'Өңір', country:'Ел', all:'Барлық өңір', central:'Орталық Азия', asia:'Азияның өзге бөлігі', europe:'Еуропа', americas:'Америка', africa:'Африка', oceania:'Мұхит аралдары', cities:'Қалалар', source:'Қалалар дерекқоры: GeoNames', official:'Ресми статистика', inflation:'Жылдық инфляция', year:'{year} ж.', noIndicator:'Ел көрсеткіші әзірше қолжетімсіз.', noCities:'Қалалар жүктелмеді. Жоғарыдағы іздеу арқылы қаланы тап.', context:'Бұл елдегі бағаның өзгерісі, қаланың күнделікті шығын бағасы емес.', select:'Елді таңда', count:'{count} ел' },
    en: { eyebrow:'COUNTRIES IN THE GUIDE', title:'Choose a country', intro:'Explore its cities and plan a trip. City prices appear only where a verified source is available.', region:'Region', country:'Country', all:'All regions', central:'Central Asia', asia:'Rest of Asia', europe:'Europe', americas:'Americas', africa:'Africa', oceania:'Oceania', cities:'Cities', source:'City directory: GeoNames', official:'Official statistics', inflation:'Annual inflation', year:'for {year}', noIndicator:'No country indicator available yet.', noCities:'Cities could not be loaded. Search for a city above.', context:'This is national price change, not the cost of living in the selected city.', select:'Choose a country', count:'{count} countries' }
  };
  let region = 'all', code = 'KZ', latestCities = [], indicator = null, generation = 0;
  const language = () => ['ru','kk','en'].includes(document.documentElement.lang) ? document.documentElement.lang : 'ru';
  const t = () => copy[language()];
  const label = c => { try { return new Intl.DisplayNames([language()], {type:'region'}).of(c) || c; } catch { return c; } };
  function render() {
    const l = t();
    $('countryEyebrow').textContent=l.eyebrow;
    $('countryTitle').textContent=l.title;
    $('countryIntro').textContent=l.intro;
    $('countryRegionLabel').textContent=l.region;
    $('countrySelectLabel').textContent=l.country;
    $('countryCount').textContent=l.count.replace('{count}', String(unique.length));
    $('countryContext').textContent=l.context;
    $('countrySource').textContent=l.source;
    const officialLink=$('countryOfficial');
    officialLink.hidden=!official[code];
    if(official[code]){officialLink.href=official[code];officialLink.textContent=l.official+' ↗';}
    $('countryCitiesTitle').textContent=l.cities;
    const regionSelect=$('countryRegion');
    regionSelect.innerHTML=['all',...Object.keys(groups)].map(k=>`<option value="${k}">${l[k]}</option>`).join('');
    regionSelect.value=region;
    const codes=(region==='all'?unique:groups[region].split(' ')).sort((a,b)=>label(a).localeCompare(label(b),language()));
    const countrySelect=$('countrySelect');
    countrySelect.innerHTML=codes.map(c=>`<option value="${c}"></option>`).join('');
    [...countrySelect.options].forEach((option,i)=>option.textContent=label(codes[i]));
    if(!codes.includes(code))code=codes[0];
    countrySelect.value=code;
    $('countryIndicator').textContent=indicator?.country===code ? `${l.inflation}: ${new Intl.NumberFormat(language(),{maximumFractionDigits:1}).format(indicator.value)}% ${l.year.replace('{year}',indicator.year)}` : l.noIndicator;
    const cityBox=$('countryCities');
    cityBox.replaceChildren();
    if(!latestCities.length){cityBox.textContent=l.noCities;return;}
    latestCities.forEach(c=>{const b=document.createElement('button');b.type='button';b.className='country-city';b.textContent=c.city+(c.region?' · '+c.region:'');b.addEventListener('click',()=>window.QanshaGuide?.showCityProfile(c));cityBox.append(b);});
  }
  async function load() {
    const seq=++generation;
    latestCities=[];indicator=null;render();
    const [cities,macro]=await Promise.allSettled([
      fetch('/api/cities?country='+encodeURIComponent(code),{headers:{Accept:'application/json'}}).then(r=>{if(!r.ok)throw new Error('cities');return r.json();}),
      fetch('/api/country-indicator?country='+encodeURIComponent(code),{headers:{Accept:'application/json'}}).then(r=>{if(!r.ok)throw new Error('indicator');return r.json();})
    ]);
    if(seq!==generation)return;
    if(cities.status==='fulfilled')latestCities=Array.isArray(cities.value.results)?cities.value.results:[];
    if(macro.status==='fulfilled'&&Number.isFinite(macro.value.value))indicator=macro.value;
    render();
  }
  $('countryRegion').addEventListener('change',e=>{region=e.target.value;code=groups[region]?.split(' ')[0]||'KZ';load();});
  $('countrySelect').addEventListener('change',e=>{code=e.target.value;load();});
  new MutationObserver(()=>render()).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  render();load();
})();
