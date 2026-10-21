(() => {
 'use strict';
 const DATA=[
  ['TR','Istanbul','Стамбул','Ыстамбұл','36','53','35','16','2'],['TH','Bangkok','Бангкок','Бангкок','32','41','23','14','1'],['FR','Paris','Париж','Париж','72','112','72','28','2.5'],['GE','Tbilisi','Тбилиси','Тбилиси','29','37','32','13','0.6'],['KZ','Almaty','Алматы','Алматы','31','43','28','14','0.9'],['UZ','Tashkent','Ташкент','Ташкент','25','33','21','10','0.5'],['AZ','Baku','Баку','Баку','36','48','34','15','0.5'],['AE','Dubai','Дубай','Дубай','79','110','74','35','1.8'],['IT','Rome','Рим','Рим','64','93','66','28','1.7'],['ES','Barcelona','Барселона','Барселона','59','91','57','25','2.5'],['CZ','Prague','Прага','Прага','43','66','49','22','1.6'],['MY','Kuala Lumpur','Куала-Лумпур','Куала-Лумпур','29','40','26','13','0.6'],['VN','Da Nang','Дананг','Да Нанг','24','33','22','11','0.4'],['JP','Tokyo','Токио','Токио','68','108','64','29','1.5'],['CH','Zurich','Цюрих','Цюрих','112','157','122','48','4.2'],['IS','Reykjavik','Рейкьявик','Рейкьявик','101','142','118','44','4.2'],['SG','Singapore','Сингапур','Сингапур','75','114','73','33','1.6']
 ].map(x=>({country:x[0],en:x[1],ru:x[2],kk:x[3],daily:+x[4],hotel:+x[5],meal:+x[6],groceries:+x[7],transit:+x[8]}));
 // Budget Your Trip: visitor-reported USD/day includes accommodation. Remove
 // half the reported double-room price for an approximate daily amount without
 // lodging, so a user's own hotel price is not counted twice in the planner.
 // USD figures checked against each linked city page on 2026-10-21. Food and
 // local transport are per traveler per day, not a dinner or a single ticket.
 const TRAVELER_REPORTS=[
  ['CN','Beijing','Пекин','Бейжің',96,84,36,8.22,'china/beijing'],
  ['CN','Shanghai','Шанхай','Шанхай',137,170,39,4.06,'china/shanghai'],
  ['CN','Shenzhen','Шэньчжэнь','Шэньчжэнь',145,188,36,15,'china/shenzhen'],
  ['CN','Guangzhou','Гуанчжоу','Гуанчжоу',108,120,35,15,'china/guangzhou'],
  ['KR','Seoul','Сеул','Сеул',117,98,47,14,'south-korea/seoul'],
  ['JP','Osaka','Осака','Осака',103,89,42,13,'japan/osaka'],
  ['JP','Kyoto','Киото','Киото',110,122,40,7.29,'japan/kyoto'],
  ['TH','Phuket','Пхукет','Пхукет',134,124,42,12,'thailand/phuket'],
  ['TH','Chiang Mai','Чиангмай','Чиангмай',60,60,21,4.14,'thailand/chiang-mai'],
  ['VN','Hanoi','Ханой','Ханой',58,50,23,6.64,'vietnam/hanoi'],
  ['TR','Ankara','Анкара','Анкара',101,82,41,27,'turkey/ankara'],
  ['FR','Nice','Ницца','Ницца',193,140,98,26,'france/nice'],
  ['AT','Vienna','Вена','Вена',206,217,66,21,'austria/vienna'],
  ['TR','Antalya','Анталья','Анталья',119,79,32,79,'turkey/antalya'],
  ['GB','London','Лондон','Лондон',287,331,79,34,'united-kingdom/london'],
  ['GB','Edinburgh','Эдинбург','Эдинбург',226,196,89,22,'united-kingdom/edinburgh'],
  ['US','New York City','Нью-Йорк','Нью-Йорк',363,350,87,49,'united-states-of-america/new-york-city'],
  ['US','Los Angeles','Лос-Анджелес','Лос-Анджелес',299,276,104,40,'united-states-of-america/los-angeles'],
  ['US','San Francisco','Сан-Франциско','Сан-Франциско',251,259,79,16,'united-states-of-america/san-francisco'],
  ['CA','Toronto','Торонто','Торонто',241,170,106,31,'canada/toronto'],
  ['CA','Vancouver','Ванкувер','Ванкувер',162,170,53,14,'canada/vancouver'],
  ['AU','Sydney','Сидней','Сидней',220,220,82,16,'australia/sydney'],
  ['AU','Melbourne','Мельбурн','Мельбурн',196,238,53,20,'australia/melbourne'],
  ['IN','Mumbai','Мумбаи','Мумбай',75,58,38,6.37,'india/mumbai'],
  ['IN','Delhi','Дели','Дели',50,43,19,4.42,'india/delhi'],
  ['DE','Berlin','Берлин','Берлин',197,144,101,20,'germany/berlin'],
  ['DE','Munich','Мюнхен','Мюнхен',191,203,54,22,'germany/munich'],
  ['PT','Lisbon','Лиссабон','Лиссабон',190,144,83,28,'portugal/lisbon'],
  ['PT','Porto','Порту','Порту',185,166,73,24,'portugal/porto'],
  ['NL','Amsterdam','Амстердам','Амстердам',248,240,95,23,'netherlands/amsterdam'],
  ['ES','Madrid','Мадрид','Мадрид',184,177,67,21,'spain/madrid'],
  ['ES','Valencia','Валенсия','Валенсия',179,135,82,21,'spain/valencia'],
  ['IT','Milan','Милан','Милан',231,228,79,41,'italy/milan'],
  ['IT','Venice','Венеция','Венеция',320,278,130,32,'italy/venice'],
  ['IT','Florence','Флоренция','Флоренция',205,198,71,25,'italy/florence'],
  ['HU','Budapest','Будапешт','Будапешт',129,124,47,12,'hungary/budapest'],
  ['PL','Warsaw','Варшава','Варшава',121,110,50,4.97,'poland/warsaw'],
  ['GR','Athens','Афины','Афины',175,144,73,31,'greece/athens'],
  ['AE','Abu Dhabi','Абу-Даби','Әбу-Даби',197,196,78,20,'united-arab-emirates/abu-dhabi'],
  ['VN','Ho Chi Minh City','Хошимин','Хошимин',87,95,23,15,'vietnam/ho-chi-minh-city'],
  ['VN','Nha Trang','Нячанг','Нячанг',48,25,25,13,'vietnam/nha-trang'],
  ['MY','Penang','Пенанг','Пенанг',144,110,64,14,'malaysia/penang'],
  ['ID','Jakarta','Джакарта','Джакарта',73,63,28,20,'indonesia/jakarta'],
  ['FR','Lyon','Лион','Лион',180,123,83,20,'france/lyon'],
  ['MA','Marrakesh','Марракеш','Марракеш',100,114,28,13,'morocco/marrakech']
 ];
 for(const [country,en,ru,kk,total,hotel,foodDay,localTransportDay,path] of TRAVELER_REPORTS){
  DATA.push({country,en,ru,kk,daily:total-hotel/2,hotel,foodDay,localTransportDay,meal:null,groceries:null,transit:null,unit:'USD',source:'https://testing.budgetyourtrip.com/'+path,sourceType:'travel',checked:'2026-10-21'});
 }
 // Numbeo city prices: three inexpensive meals and two local-transport rides.
 const LOCAL_REPORTS=[
  ['KZ','Astana','Астана','Астана',4947.67,110,17006.50,1000,2900,'KZT','Astana-Nur-Sultan-Kazakhstan'],
  ['KG','Bishkek','Бишкек','Бішкек',600,20,2500,75,500,'KGS','Bishkek'],
  ['TJ','Dushanbe','Душанбе','Душанбе',45,2.5,190,10,null,'TJS','Dushanbe']
 ];
 for(const [country,en,ru,kk,inexpensiveMeal,transit,dinnerTwo,taxiStart,cinema,unit,path] of LOCAL_REPORTS){
  DATA.push({country,en,ru,kk,daily:3*inexpensiveMeal+2*transit,hotel:null,dinnerTwo,inexpensiveMeal,taxiStart,cinema,groceries:null,transit,unit,source:'https://www.numbeo.com/cost-of-living/in/'+path,sourceType:'local',checked:'2026-10-21'});
 }
 const CURATED=`KZ|Astana|Астана|Астана
 KZ|Shymkent|Шымкент|Шымкент
 KZ|Turkistan|Туркестан|Түркістан
 KG|Bishkek|Бишкек|Бішкек
 TJ|Dushanbe|Душанбе|Душанбе
 UZ|Samarkand|Самарканд|Самарқанд
 UZ|Bukhara|Бухара|Бұхара
 TR|Antalya|Анталья|Анталья
 TR|Ankara|Анкара|Анкара
 TR|Izmir|Измир|Измир
 GE|Batumi|Батуми|Батуми
 AZ|Ganja|Гянджа|Гәнжә
 AE|Abu Dhabi|Абу-Даби|Әбу-Даби
 AE|Sharjah|Шарджа|Шарджа
 SA|Riyadh|Эр-Рияд|Эр-Рияд
 QA|Doha|Доха|Доха
 CN|Beijing|Пекин|Бейжің
 CN|Shanghai|Шанхай|Шанхай
 CN|Shenzhen|Шэньчжэнь|Шэньчжэнь
 CN|Guangzhou|Гуанчжоу|Гуанчжоу
 CN|Hong Kong|Гонконг|Гонконг
 CN|Macau|Макао|Макао
 JP|Osaka|Осака|Осака
 JP|Kyoto|Киото|Киото
 KR|Seoul|Сеул|Сеул
 KR|Busan|Пусан|Пусан
 TH|Phuket|Пхукет|Пхукет
 TH|Chiang Mai|Чиангмай|Чиангмай
 VN|Hanoi|Ханой|Ханой
 VN|Ho Chi Minh City|Хошимин|Хошимин
 VN|Nha Trang|Нячанг|Нячанг
 MY|Penang|Пенанг|Пенанг
 ID|Denpasar|Денпасар|Денпасар
 ID|Jakarta|Джакарта|Джакарта
 IN|Mumbai|Мумбаи|Мумбай
 IN|Delhi|Дели|Дели
 FR|Nice|Ницца|Ницца
 FR|Lyon|Лион|Лион
 GB|London|Лондон|Лондон
 GB|Edinburgh|Эдинбург|Эдинбург
 DE|Berlin|Берлин|Берлин
 DE|Munich|Мюнхен|Мюнхен
 IT|Milan|Милан|Милан
 IT|Venice|Венеция|Венеция
 IT|Florence|Флоренция|Флоренция
 ES|Madrid|Мадрид|Мадрид
 ES|Valencia|Валенсия|Валенсия
 PT|Lisbon|Лиссабон|Лиссабон
 PT|Porto|Порту|Порту
 NL|Amsterdam|Амстердам|Амстердам
 AT|Vienna|Вена|Вена
 PL|Warsaw|Варшава|Варшава
 HU|Budapest|Будапешт|Будапешт
 GR|Athens|Афины|Афины
 GR|Thessaloniki|Салоники|Салоники
 CH|Geneva|Женева|Женева
 CH|Bern|Берн|Берн
 IS|Akureyri|Акюрейри|Акюрейри
 US|New York City|Нью-Йорк|Нью-Йорк
 US|Los Angeles|Лос-Анджелес|Лос-Анджелес
 US|San Francisco|Сан-Франциско|Сан-Франциско
 CA|Toronto|Торонто|Торонто
 CA|Vancouver|Ванкувер|Ванкувер
 AU|Sydney|Сидней|Сидней
 AU|Melbourne|Мельбурн|Мельбурн
 EG|Cairo|Каир|Каир
 MA|Marrakesh|Марракеш|Марракеш
 BR|Rio de Janeiro|Рио-де-Жанейро|Рио-де-Жанейро
 MX|Mexico City|Мехико|Мехико`.split('\n').map(row=>{const [country,en,ru,kk]=row.trim().split('|');return {country,en,ru,kk};});
 const ALL=[...DATA,...CURATED.filter(c=>!DATA.some(p=>p.country===c.country&&p.en===c.en))];
 const STR={
  ru:{siteTitle:'Qansha — цены городов и план поездки',siteDescription:'Планируй поездку: вводи цены билетов и отеля, сравнивай города и узнай примерный общий расход.',homeAria:'Qansha, наверх',navAria:'Навигация',langAria:'Язык',closeAria:'Закрыть',styleAria:'Уровень расходов',factsAria:'Данные Qansha',tagline:'Сколько? — Один ответ',navCities:'Города',navCompare:'Сравнить',navMethod:'Методика',eyebrow:'QANSHA · ЦЕНЫ В ГОРОДАХ',headline:'Сколько стоит жизнь в городе?',intro:'Сравнивай ежедневные расходы, жильё и привычные цены до переезда или поездки.',searchLabel:'Найти город',searchPlaceholder:'Например, Алматы или Токио',searchBtn:'Найти',searchHelp:'Поиск по 34 000+ городов; ориентиры цен есть для {count}, для остальных используй свои суммы.',statTitle:'Планируй расходы заранее',statText:'Еда · транспорт · жильё · повседневные покупки',factCities:'городских профилей',factLanguages:'языка интерфейса',factSearchCost:'платных поисковых API',profileEyebrow:'ГОРОДСКОЙ ПРОФИЛЬ',estimateNote:'Плановый ориентир, не гарантированная цена. Ниже указан источник и метод расчёта.',popularEyebrow:'ГОРОДА В СПРАВОЧНИКЕ',popularTitle:'Популярные города',popularText:'Выбери город, чтобы посмотреть ориентиры расходов или рассчитать поездку со своими ценами.',sortLabel:'Сортировка',sortLow:'Сначала дешевле',sortHigh:'Сначала дороже',sortName:'По названию',compareEyebrow:'ПОНЯТНОЕ СРАВНЕНИЕ',compareTitle:'Сравни два города',compareText:'Посмотри разницу в дневном бюджете и проживании.',cityOne:'Первый город',cityTwo:'Второй город',methodEyebrow:'КАК ЧИТАТЬ ДАННЫЕ',methodTitle:'Ориентир для планирования, не ценовое обещание',methodText:'Новые туристические ориентиры основаны на расходах путешественников Budget Your Trip: средние траты за день минус половина цены двухместного номера. Для некоторых городов Центральной Азии используем цены Numbeo: три недорогих приёма пищи и две поездки. Ранние профили Qansha — редакционные оценки. Методики различаются; цены зависят от сезона, района и привычек.',attribution:'Справочник городов:',footerTag:'Сколько? — Один ответ',footerNote:'Цены — ориентировочные оценки, не оферта.',tierEconomy:'Экономно',tierStandard:'Средне',tierComfort:'Комфорт',daily:'На день без жилья',hotel:'Номер на ночь',meal:'Ресторанный ужин на двоих',groceries:'Корзина продуктов',transit:'Поездка на транспорте',perPerson:'На человека в день',perRoom:'Двухместный номер',perMeal:'Два основных блюда',basket:'Ориентировочная корзина',perRide:'Один билет',noDataText:'Город найден в справочнике, но цены для него ещё не собраны. Мы не подставляем чужие или выдуманные цифры.',noDataSuffix:'пока без цен',searchError:'Не удалось загрузить города. Попробуй ещё раз.',emptySearch:'Город не найден. Проверь написание.',compareDaily:'Дневные расходы без жилья',compareHotel:'Номер на ночь',compareCheaper:'По этим ориентирам дешевле',compareDelta:'разницы в сумме дневных расходов и номера',same:'Ориентиры одинаковы.',selectCity:'Выбери город в каждом списке.',navPlanner:'План поездки',plannerEyebrow:'ПЛАНИРОВЩИК ПОЕЗДКИ',plannerTitle:'Сколько уйдёт на поездку?',plannerIntro:'Укажи цену билетов и отеля. Мы добавим ориентир повседневных расходов и сравним итог с твоим бюджетом.',destination:'Город поездки',otherCity:'Не нашёл город? Найти среди городов мира ↑',days:'Длительность поездки',daysUnit:'дней',budget:'Твой бюджет на всю поездку',travelers:'Путешественники',nights:'Ночей в отеле',flightInput:'Билеты туда-обратно, {symbol} за человека',hotelInput:'Отель, {symbol} за номер за ночь',rooms:'Номеров',dailyInput:'Повседневные расходы, {symbol} за человека в день',zeroIfNone:'Если расхода нет, введи 0',resultEyebrow:'РАСЧЁТ ПОЕЗДКИ',plannerDisclaimer:'Итог — оценка для планирования. Билеты и отель — твои суммы; дневной ориентир не включает отель. Курсы валют приблизительные.',showMoreCities:'Показать больше городов',currencyLabel:'Валюта',rateAttribution:'Курсы: Нацбанк РК; при сбое используется датированный резерв.',countryNames:{TR:'Турция',TH:'Таиланд',FR:'Франция',GE:'Грузия',KZ:'Казахстан',UZ:'Узбекистан',AZ:'Азербайджан',AE:'ОАЭ',IT:'Италия',ES:'Испания',CZ:'Чехия',MY:'Малайзия',VN:'Вьетнам',JP:'Япония',CH:'Швейцария',IS:'Исландия',SG:'Сингапур'}},
  kk:{siteTitle:'Qansha — қалалар бағасы және сапар жоспары',siteDescription:'Сапарды жоспарла: билет пен қонақүй бағасын енгізіп, қалаларды салыстыр және шығынды есепте.',homeAria:'Qansha, басына оралу',navAria:'Навигация',langAria:'Тіл',closeAria:'Жабу',styleAria:'Шығын деңгейі',factsAria:'Qansha деректері',tagline:'Қанша? — Бір жауап',navCities:'Қалалар',navCompare:'Салыстыру',navMethod:'Әдістеме',eyebrow:'QANSHA · ҚАЛА ШЫҒЫНДАРЫ',headline:'Қалада тұру қанша тұрады?',intro:'Көшпес немесе сапарға шықпас бұрын күнделікті шығындар мен баспана бағасын салыстыр.',searchLabel:'Қаланы табу',searchPlaceholder:'Мысалы, Алматы немесе Токио',searchBtn:'Табу',searchHelp:'34 000-нан астам қала; {count} қалада баға бағдары бар, қалғанына өз сомаңды енгіз.',statTitle:'Шығынды алдын ала жоспарла',statText:'Тамақ · көлік · баспана · күнделікті сатып алу',factCities:'қала профилі',factLanguages:'интерфейс тілі',factSearchCost:'ақылы іздеу API-і',profileEyebrow:'ҚАЛА ПРОФИЛІ',estimateNote:'Бұл жоспарлауға арналған бағдар, кепілді баға емес. Дереккөз бен есептеу жолы төменде.',popularEyebrow:'АНЫҚТАМАЛЫҚТАҒЫ ҚАЛАЛАР',popularTitle:'Танымал қалалар',popularText:'Шығын бағаларын көру немесе өз бағаңмен сапарды есептеу үшін қаланы таңда.',sortLabel:'Сұрыптау',sortLow:'Арзанынан бастау',sortHigh:'Қымбатынан бастау',sortName:'Атауы бойынша',compareEyebrow:'ТҮСІНІКТІ САЛЫСТЫРУ',compareTitle:'Екі қаланы салыстыр',compareText:'Күндік бюджет пен тұру бағасының айырмасын көр.',cityOne:'Бірінші қала',cityTwo:'Екінші қала',methodEyebrow:'ДЕРЕКТЕРДІ ҚАЛАЙ ОҚУ КЕРЕК',methodTitle:'Жоспарлауға арналған бағдар, нақты баға емес',methodText:'Жаңа туристік бағдарлар Budget Your Trip сапар шығындарына негізделген: бір күндік орташа шығыннан екі кісілік бөлме құнының жартысы алынады. Орталық Азияның кей қалалары үшін Numbeo дерегімен үш арзан ас пен екі жол жүру есептеледі. Бұрынғы Qansha профильдері — редакциялық бағалау. Әдістер әртүрлі; баға маусымға, ауданға және әдетке тәуелді.',attribution:'Қала дерекқоры:',footerTag:'Қанша? — Бір жауап',footerNote:'Бағалар — шамамен алынған есеп, ұсыныс емес.',tierEconomy:'Үнемді',tierStandard:'Орташа',tierComfort:'Жайлы',daily:'Баспанаcыз бір күн',hotel:'Бір түнге бөлме',meal:'Екі адамға мейрамханадағы кешкі ас',groceries:'Азық-түлік себеті',transit:'Қоғамдық көлікпен жол жүру',perPerson:'Бір адамға / күн',perRoom:'Екі адамдық бөлме',perMeal:'Екі негізгі тағам',basket:'Шамамен алынған себет',perRide:'Бір билет',noDataText:'Қала анықтамалықтан табылды, бірақ бағалары әзірге жиналмаған. Біз басқа қаланың бағаларын қолданбаймыз және ойдан сан қоспаймыз.',noDataSuffix:'бағасы әзірше жоқ',searchError:'Қалаларды жүктеу мүмкін болмады. Қайталап көр.',emptySearch:'Қала табылмады. Атауын тексер.',compareDaily:'Тұрусыз күндік шығын',compareHotel:'Бір түнге бөлме',compareCheaper:'Осы есеп бойынша арзанырақ',compareDelta:'күндік шығын мен бөлме бағасының жиынтық айырмасы',same:'Бағалар бірдей.',selectCity:'Әр тізімнен қаланы таңда.',navPlanner:'Сапар жоспары',plannerEyebrow:'САПАР ЖОСПАРЛАҒЫШЫ',plannerTitle:'Сапарға қанша жұмсалады?',plannerIntro:'Билет пен қонақүй бағасын енгіз. Күнделікті шығынды қосып, нәтижені бюджетіңмен салыстырамыз.',destination:'Сапар қаласы',otherCity:'Қаланы таппадың ба? Әлем қалаларынан ізде ↑',days:'Сапар ұзақтығы',daysUnit:'күн',budget:'Бүкіл сапарға бюджетің',travelers:'Саяхатшылар',nights:'Қонақүйдегі түндер',flightInput:'Бар-қайтар билеттер, {symbol} бір адамға',hotelInput:'Қонақүй, {symbol} бір бөлме/түн',rooms:'Бөлмелер',dailyInput:'Күнделікті шығын, {symbol} бір адамға',zeroIfNone:'Шығын болмаса, 0 енгіз',resultEyebrow:'САПАР ЕСЕБІ',plannerDisclaimer:'Нәтиже — жоспарлау есебі. Билет пен қонақүй құнын өзің енгізесің; күндік бағдарға қонақүй кірмейді. Валюта бағамы шамамен алынған.',showMoreCities:'Көбірек қала көрсету',currencyLabel:'Валюта',rateAttribution:'Бағам: ҚР Ұлттық Банкі; ақау кезінде күні көрсетілген резерв қолданылады.',countryNames:{TR:'Түркия',TH:'Таиланд',FR:'Франция',GE:'Грузия',KZ:'Қазақстан',UZ:'Өзбекстан',AZ:'Әзербайжан',AE:'БАӘ',IT:'Италия',ES:'Испания',CZ:'Чехия',MY:'Малайзия',VN:'Вьетнам',JP:'Жапония',CH:'Швейцария',IS:'Исландия',SG:'Сингапур',AT:'Аустрия',AU:'Аустралия',BR:'Бразилия',CA:'Канада',CN:'Қытай',DE:'Германия',EG:'Мысыр',GB:'Ұлыбритания',GR:'Грекия',HU:'Мажарстан',ID:'Индонезия',IN:'Үндістан',KG:'Қырғызстан',KR:'Оңтүстік Корея',MA:'Марокко',MX:'Мексика',NL:'Нидерланд',PL:'Польша',PT:'Португалия',QA:'Қатар',SA:'Сауд Арабиясы',TJ:'Тәжікстан',US:'АҚШ'}},
  en:{siteTitle:'Qansha — city prices and trip planner',siteDescription:'Plan a trip: enter flight and hotel costs, compare cities, and estimate your total budget.',homeAria:'Qansha, back to top',navAria:'Navigation',langAria:'Language',closeAria:'Close',styleAria:'Spending style',factsAria:'Qansha data',tagline:'How much? — One answer',navCities:'Cities',navCompare:'Compare',navMethod:'Methodology',eyebrow:'QANSHA · CITY COST GUIDE',headline:'What does it cost to live in a city?',intro:'Compare daily expenses, accommodation, and everyday prices before a move or a trip.',searchLabel:'Find a city',searchPlaceholder:'For example, Almaty or Tokyo',searchBtn:'Search',searchHelp:'Search 34,000+ cities; {count} have Qansha estimates, or enter your own prices.',statTitle:'Plan your spending ahead',statText:'Food · transport · stays · everyday essentials',factCities:'city profiles',factLanguages:'interface languages',factSearchCost:'paid search APIs',profileEyebrow:'CITY PROFILE',estimateNote:'A planning guide, not a guaranteed price. The source and calculation are shown below.',popularEyebrow:'CITIES IN THE GUIDE',popularTitle:'Popular cities',popularText:'Choose a city to see indicative costs or plan a trip with your own prices.',sortLabel:'Sort',sortLow:'Lowest first',sortHigh:'Highest first',sortName:'By name',compareEyebrow:'A CLEAR COMPARISON',compareTitle:'Compare two cities',compareText:'See the difference in daily spending and accommodation.',cityOne:'First city',cityTwo:'Second city',methodEyebrow:'HOW TO READ THE DATA',methodTitle:'A planning guide, not a price guarantee',methodText:'New travel guides use Budget Your Trip traveler spending: average daily total minus half the price of a double room. For some Central Asian cities, Numbeo prices estimate three inexpensive meals and two transit rides. Earlier Qansha profiles remain editorial estimates. Methods differ; season, neighborhood and habits affect prices.',attribution:'City directory data:',footerTag:'How much? — One answer',footerNote:'Prices are indicative estimates, not an offer.',tierEconomy:'Budget',tierStandard:'Mid-range',tierComfort:'Comfort',daily:'Per day, excluding stay',hotel:'Room per night',meal:'Restaurant dinner for two',groceries:'Grocery basket',transit:'Public transport ride',perPerson:'Per person / day',perRoom:'Double room',perMeal:'Two main courses',basket:'Indicative basket',perRide:'One ticket',noDataText:'This city is in the directory, but its prices have not been collected yet. We do not fill in numbers from another city or invent figures.',noDataSuffix:'prices coming soon',searchError:'Could not load cities. Please try again.',emptySearch:'No city found. Check the spelling.',compareDaily:'Daily spending, excluding stay',compareHotel:'Room per night',compareCheaper:'Lower based on these estimates',compareDelta:'difference in the combined daily + room estimate',same:'The estimates are the same.',selectCity:'Select a city in each list.',navPlanner:'Trip planner',plannerEyebrow:'TRIP PLANNER',plannerTitle:'How much will your trip cost?',plannerIntro:'Enter your flight and hotel prices. We add an everyday spending guide and compare the total with your budget.',destination:'Trip city',otherCity:'City not listed? Search all world cities ↑',days:'Trip length',daysUnit:'days',budget:'Your total trip budget',travelers:'Travelers',nights:'Hotel nights',flightInput:'Round-trip flights, {symbol} per person',hotelInput:'Hotel, {symbol} per room per night',rooms:'Rooms',dailyInput:'Everyday spending, {symbol} per person per day',zeroIfNone:'Enter 0 if there is no cost',resultEyebrow:'TRIP ESTIMATE',plannerDisclaimer:'This is a planning estimate. Flights and hotel use your prices; the daily guide excludes the hotel. Currency conversion is approximate.',showMoreCities:'Show more cities',currencyLabel:'Currency',rateAttribution:'Rates: National Bank of Kazakhstan; a dated fallback is used if unavailable.',countryNames:{TR:'Türkiye',TH:'Thailand',FR:'France',GE:'Georgia',KZ:'Kazakhstan',UZ:'Uzbekistan',AZ:'Azerbaijan',AE:'United Arab Emirates',IT:'Italy',ES:'Spain',CZ:'Czechia',MY:'Malaysia',VN:'Vietnam',JP:'Japan',CH:'Switzerland',IS:'Iceland',SG:'Singapore'}}
 };
 STR.kk.navAria='Бөлімдер';
 STR.kk.currencyLabel='Ақша бірлігі';
 const DETAIL_TEXT={
  ru:{foodDay:'Еда за день',localTransportDay:'Местный транспорт за день',inexpensiveMeal:'Недорогой обед',dinnerTwo:'Ужин на двоих',taxiStart:'Посадка в такси',cinema:'Билет в кино',perPerson:'На человека в день',perMeal:'На человека',perDinner:'Три блюда, без напитков',perTaxi:'Без стоимости поездки',perCinema:'Один билет',checked:'Данные проверены: {date}.',tier:'Уровни «Экономно» и «Комфорт» — примерные поправки Qansha к среднему значению.'},
  kk:{foodDay:'Күніне тамақ',localTransportDay:'Күніне жергілікті көлік',inexpensiveMeal:'Арзан түскі ас',dinnerTwo:'Екі адамға кешкі ас',taxiStart:'Таксиге отыру',cinema:'Кино билеті',perPerson:'Бір адамға / күн',perMeal:'Бір адамға',perDinner:'Үш тағам, сусынсыз',perTaxi:'Жол ақысы кірмейді',perCinema:'Бір билет',checked:'Дерек тексерілген күн: {date}.',tier:'«Үнемді» және «Жайлы» деңгейлері — Qansha-ның орташа бағаға шамамен түзетулері.'},
  en:{foodDay:'Food per day',localTransportDay:'Local transport per day',inexpensiveMeal:'Inexpensive meal',dinnerTwo:'Dinner for two',taxiStart:'Taxi starting fare',cinema:'Cinema ticket',perPerson:'Per person / day',perMeal:'Per person',perDinner:'Three courses, no drinks',perTaxi:'Distance fare extra',perCinema:'One ticket',checked:'Data checked: {date}.',tier:'Budget and Comfort are Qansha estimates adjusted from the reported average.'}
 };
 const byLang={ru:1,kk:2,en:0};let lang='ru',tier='standard',timer=null,seq=0,items=[],selectedCity=null,showAllCities=false;
 const $=id=>document.getElementById(id), esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const t=k=>STR[lang][k]||STR.ru[k]||k, locale=()=>lang==='kk'?'kk-KZ':lang==='ru'?'ru-RU':'en-US', cityName=p=>p[['en','ru','kk'][byLang[lang]]], countryName=c=>STR[lang].countryNames[c]||new Intl.DisplayNames([locale()],{type:'region'}).of(c)||c;
 const money=(n,unit='EUR')=>window.QanshaMoney.format(n,lang,unit);
 const currencySymbol=()=>({KZT:'₸',USD:'$',RUB:'₽',CNY:'¥',UZS:'UZS',TJS:'TJS',KGS:'KGS',EUR:'€'})[window.QanshaMoney.get().currency];
 const inSelected=p=>window.QanshaMoney.convert(p.daily,p.unit||'EUR');
 const multiplier={economy:.72,standard:1,comfort:1.55};
 const names=p=>cityName(p)+' · '+countryName(p.country), key=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-zа-яёәіғүұқңөһ0-9]+/g,' ').trim();
 function applyLocale(){document.documentElement.lang=lang;document.title=t('siteTitle');document.querySelector('meta[name=description]').content=t('siteDescription');document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(t(k))el.textContent=String(t(k)).replaceAll('{count}',DATA.length).replaceAll('{symbol}',currencySymbol())});document.querySelectorAll('[data-i18n-aria]').forEach(el=>{el.setAttribute('aria-label',t(el.dataset.i18nAria))});$('citySearch').placeholder=t('searchPlaceholder');document.querySelectorAll('[data-lang]').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));const currency=window.QanshaMoney.get().currency,currencyChoice=document.querySelector('[data-currency="'+currency+'"]');$('currencyButton').textContent=currencyChoice.textContent;$('currencyButton').setAttribute('aria-label',t('currencyLabel')+': '+currencyChoice.textContent);document.querySelectorAll('[data-currency]').forEach(b=>b.setAttribute('aria-pressed',String(b===currencyChoice)));$('profileCount').textContent=DATA.length;$('rateDate').textContent=window.QanshaMoney.get().asOf+(window.QanshaMoney.get().fresh?'':' · '+({ru:'резерв',kk:'резерв',en:'fallback'}[lang]));renderCities();renderCompare();if(selectedCity){if(Number.isFinite(selectedCity.daily)){$('profileTitle').textContent=names(selectedCity);renderPrices(selectedCity);}else $('noDataTitle').textContent=cityName(selectedCity)+' · '+countryName(selectedCity.country)+' — '+t('noDataSuffix');}window.dispatchEvent(new CustomEvent('qansha:change',{detail:{type:'locale'}}));}
 function card(p){const priced=Number.isFinite(p.daily);return '<button class="city-card" type="button" data-city="'+esc(p.country+'|'+p.en)+'"><span class="city-symbol">'+esc(countryName(p.country).slice(0,1))+'</span><span class="city-info"><b>'+esc(cityName(p))+'</b><small>'+esc(countryName(p.country))+'</small></span><span class="city-price"><b>'+esc(priced?money(p.daily,p.unit||'EUR'):t('noDataSuffix'))+'</b>'+(priced?'<small>'+esc(t('perPerson'))+'</small>':'')+'</span></button>'}
 function renderCities(){const mode=$('sortCities').value;let list=[...ALL];if(mode==='cost')list.sort((a,b)=>(a.daily==null?Infinity:inSelected(a))-(b.daily==null?Infinity:inSelected(b)));else if(mode==='expensive')list.sort((a,b)=>(b.daily==null?-1:inSelected(b))-(a.daily==null?-1:inSelected(a)));else list.sort((a,b)=>cityName(a).localeCompare(cityName(b),locale()));$('cityGrid').innerHTML=(showAllCities?list:list.slice(0,18)).map(card).join('');$('showMoreCities').hidden=showAllCities;fillCompare();}
 function scrollToResult(el){el.scrollIntoView({behavior:window.matchMedia('(max-width: 600px)').matches?'auto':'smooth',block:'start'});}
 function showProfile(p,scroll=true){if(!p)return;selectedCity=p;document.body.dataset.city=p.country+'|'+p.en;$('noData').hidden=true;$('cityProfile').hidden=false;$('profileTitle').textContent=names(p);$('profileSubtitle').textContent=t('profileEyebrow');renderPrices(p);window.dispatchEvent(new CustomEvent('qansha:change',{detail:{type:'city'}}));if(scroll)scrollToResult($('cityProfile'));}
 function renderPrices(p){const m=multiplier[tier],unit=p.unit||'EUR',d=DETAIL_TEXT[lang];const cards=[['daily',p.daily*m,t('perPerson')],['hotel',p.hotel==null?null:p.hotel*m,t('perRoom')],['foodDay',p.foodDay==null?null:p.foodDay*m,d.perPerson],['localTransportDay',p.localTransportDay==null?null:p.localTransportDay*m,d.perPerson],['inexpensiveMeal',p.inexpensiveMeal,d.perMeal],['dinnerTwo',p.dinnerTwo,d.perDinner],['taxiStart',p.taxiStart,d.perTaxi],['cinema',p.cinema,d.perCinema],['meal',p.meal==null?null:p.meal*m,t('perMeal')],['groceries',p.groceries==null?null:p.groceries*m,t('basket')],['transit',p.transit,t('perRide')]].filter(x=>Number.isFinite(x[1]));$('priceGrid').innerHTML=cards.map(x=>'<article class="price-card"><span>'+esc(d[x[0]]||t(x[0]))+'</span><strong>'+money(x[1],unit)+'</strong><small>'+esc(x[2])+'</small></article>').join('');const source=$('profileSource');source.replaceChildren();if(p.source){const label=p.sourceType==='local'?{ru:'Источник: Numbeo · дневной ориентир = 3 недорогих блюда + 2 поездки; отель введи сам.',kk:'Дереккөз: Numbeo · күндік бағдар = 3 арзан ас + 2 жол жүру; қонақүйді өзің енгіз.',en:'Source: Numbeo · daily guide = 3 inexpensive meals + 2 transit rides; enter your hotel price.'}[lang]:{ru:'Источник: Budget Your Trip · расходы путешественников; день без жилья = общий день − ½ двухместного номера.',kk:'Дереккөз: Budget Your Trip · саяхатшы шығындары; баспанасыз күн = жалпы күн − екі кісілік бөлменің жартысы.',en:'Source: Budget Your Trip · traveler spending; day without lodging = daily total − half a double room.'}[lang];source.append(document.createTextNode(label+' '));const link=document.createElement('a');link.href=p.source;link.target='_blank';link.rel='noopener noreferrer';link.textContent=lang==='kk'?'Деректерді қарау ↗':lang==='en'?'View data ↗':'Посмотреть данные ↗';source.append(link);source.append(document.createTextNode(' '+d.checked.replace('{date}',p.checked)+' '+d.tier));}else source.textContent={ru:'Ранний редакционный ориентир Qansha; уточняй цену перед поездкой.',kk:'Qansha-ның бұрынғы редакциялық бағдары; сапар алдында бағаны тексер.',en:'Earlier Qansha editorial estimate; check prices before traveling.'}[lang];}
 function showUnknown(c,scroll=true){selectedCity=c;document.body.dataset.city='';$('cityProfile').hidden=true;$('noData').hidden=false;$('noDataTitle').textContent=cityName(c)+' · '+countryName(c.country)+' — '+t('noDataSuffix');window.dispatchEvent(new CustomEvent('qansha:change',{detail:{type:'city'}}));if(scroll)scrollToResult($('noData'));}
 function findLocal(c){const n=key(c.city);return DATA.find(p=>p.country===c.country&&(key(p.en)===n||key(p.ru)===n||key(p.kk)===n||p.en==='Da Nang'&&n==='danang'||p.en==='Reykjavik'&&n==='reykjavik'||p.en==='Kuala Lumpur'&&n==='kuala lumpur'));}
 function fillCompare(){const a=$('compareOne'),b=$('compareTwo');if(!a)return;const oldA=a.value||'FR|Paris',oldB=b.value||'KZ|Almaty';const opts=DATA.map(p=>'<option value="'+esc(p.country+'|'+p.en)+'">'+esc(names(p))+'</option>').join('');a.innerHTML=opts;b.innerHTML=opts;a.value=DATA.some(p=>p.country+'|'+p.en===oldA)?oldA:'FR|Paris';b.value=DATA.some(p=>p.country+'|'+p.en===oldB)?oldB:'KZ|Almaty';}
 function renderCompare(){
  if(!$('compareOne'))return;
  fillCompare();
  const a=DATA.find(p=>p.country+'|'+p.en===$('compareOne').value);
  const b=DATA.find(p=>p.country+'|'+p.en===$('compareTwo').value);
  if(!a||!b){$('compareResult').textContent=t('selectCity');return;}
  const render=p=>'<article class="compare-box"><span>'+esc(names(p))+'</span><strong>'+money(p.daily,p.unit||'EUR')+(p.hotel==null?'':' / '+money(p.hotel,p.unit||'EUR'))+'</strong><small>'+esc(t('compareDaily'))+(p.hotel==null?'':' · '+esc(t('compareHotel')))+'</small></article>';
  const withHotel=a.hotel!=null&&b.hotel!=null;
  const cost=p=>window.QanshaMoney.convert(p.daily+(withHotel?p.hotel:0),p.unit||'EUR');
  const lower=cost(a)<=cost(b)?a:b,delta=Math.abs(cost(a)-cost(b));
  const difference=window.QanshaMoney.format(delta,lang,window.QanshaMoney.get().currency);
  $('compareResult').innerHTML=render(a)+render(b)+'<div class="compare-verdict">'+(delta<.01?esc(t('same')):esc(t('compareCheaper'))+': <b>'+esc(names(lower))+'</b> · '+difference+' '+(withHotel?t('compareDelta'):t('compareDaily')))+'</div>';
 }
 function closeSuggestions(){const box=$('citySuggestions');box.hidden=true;$('citySearch').setAttribute('aria-expanded','false');items=[];}
 function renderSuggestions(list){items=list;const box=$('citySuggestions');if(!list.length){box.innerHTML='<div class="suggestion">'+esc(t('emptySearch'))+'</div>';box.hidden=false;return;}box.innerHTML=list.map((c,i)=>'<button type="button" class="suggestion" data-index="'+i+'"><span>'+esc(c.city)+'</span><small>'+esc(countryName(c.country))+(c.region?' · '+esc(c.region):'')+'</small></button>').join('');box.hidden=false;$('citySearch').setAttribute('aria-expanded','true');}
 async function searchCities(term){const n=++seq;if(term.trim().length<2){closeSuggestions();return;}try{const r=await fetch('/api/cities?q='+encodeURIComponent(term.trim()),{headers:{Accept:'application/json'}});if(!r.ok)throw Error();const d=await r.json();if(n!==seq)return;const hits=ALL.filter(p=>[p.en,p.ru,p.kk].some(v=>key(v).includes(key(term)))).map(p=>({city:p.en,country:p.country,region:''}));const merged=[...hits,...(Array.isArray(d.results)?d.results:[])].filter((p,i,a)=>a.findIndex(c=>c.country===p.country&&key(c.city)===key(p.city))===i).slice(0,24);renderSuggestions(merged);}catch{if(n===seq)renderSuggestions([]);}}
 function chooseCity(c){closeSuggestions();const local=findLocal(c),curated=ALL.find(p=>p.country===c.country&&(key(p.en)===key(c.city)||key(p.ru)===key(c.city)||key(p.kk)===key(c.city)));$('citySearch').value=c.city;if(local)showProfile(local);else showUnknown(curated||{...c,en:c.city,ru:c.city,kk:c.city});}
 document.addEventListener('click',e=>{const langBtn=e.target.closest('[data-lang]');if(langBtn){lang=langBtn.dataset.lang;applyLocale();return;}const tierBtn=e.target.closest('[data-tier]');if(tierBtn){tier=tierBtn.dataset.tier;document.querySelectorAll('[data-tier]').forEach(b=>b.classList.toggle('active',b===tierBtn));const p=DATA.find(x=>x.country+'|'+x.en===document.body.dataset.city);if(p)renderPrices(p);window.dispatchEvent(new CustomEvent('qansha:change',{detail:{type:'tier'}}));return;}const cityBtn=e.target.closest('[data-city]');if(cityBtn){const [c,n]=cityBtn.dataset.city.split('|');const p=ALL.find(p=>p.country===c&&p.en===n);if(Number.isFinite(p?.daily))showProfile(p);else if(p)showUnknown(p);return;}const suggest=e.target.closest('[data-index]');if(suggest){const c=items[Number(suggest.dataset.index)];if(c)chooseCity(c);return;}if(e.target.closest('#closeProfile')){$('cityProfile').hidden=true;document.body.dataset.city='';return;}if(!e.target.closest('#citySearchForm'))closeSuggestions();});
 $('citySearch').addEventListener('input',e=>{clearTimeout(timer);const v=e.target.value;timer=setTimeout(()=>searchCities(v),350);});
 $('citySearch').addEventListener('keydown',e=>{if(e.key==='Escape')closeSuggestions();if(e.key==='Enter'&&!$('citySuggestions').hidden&&items.length){e.preventDefault();chooseCity(items[0]);}});
 $('citySearchForm').addEventListener('submit',e=>{e.preventDefault();const term=$('citySearch').value.trim();if(items.length){chooseCity(items[0]);return;}if(term.length>=2)searchCities(term);});
 $('sortCities').addEventListener('change',renderCities);$('showMoreCities').addEventListener('click',()=>{showAllCities=true;renderCities();});$('compareOne').addEventListener('change',renderCompare);$('compareTwo').addEventListener('change',renderCompare);$('closeProfile').addEventListener('click',()=>{$('cityProfile').hidden=true;document.body.dataset.city='';});
 const currencyMenu=$('currencyOptions'),currencyButton=$('currencyButton');
 function closeCurrencyMenu(){currencyMenu.hidden=true;currencyButton.setAttribute('aria-expanded','false');}
 currencyButton.addEventListener('click',()=>{currencyMenu.hidden=!currencyMenu.hidden;currencyButton.setAttribute('aria-expanded',String(!currencyMenu.hidden));});
 currencyMenu.addEventListener('click',event=>{const choice=event.target.closest('[data-currency]');if(!choice)return;window.QanshaMoney.setCurrency(choice.dataset.currency);closeCurrencyMenu();});
 document.addEventListener('click',event=>{if(!event.target.closest('.currency-control'))closeCurrencyMenu();});
 document.addEventListener('keydown',event=>{if(event.key==='Escape')closeCurrencyMenu();});
 window.addEventListener('qansha:currency',applyLocale);
 window.addEventListener('qansha:rates',applyLocale);
 window.QanshaGuide={getState:()=>({lang,tier,selected:selectedCity,cities:ALL}),translate:t,countryName,selectCity:id=>{const p=ALL.find(c=>c.country+'|'+c.en===id);if(!p)return;if(Number.isFinite(p.daily))showProfile(p,false);else showUnknown(p,false);}};lang=['ru','kk','en'].includes(lang)?lang:'ru';applyLocale();renderCompare();
})();
