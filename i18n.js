/* Qansha? Internationalization: Russian (source), Kazakh, English.
   Applies to labels and dynamically generated offer copy without changing numbers/prices. */
(() => {
 'use strict';
 const entries = [
 ["Личный кабинет Qansha","Qansha жеке кабинеті","Qansha account"],
 ["Сохраняйте избранные билеты и отели в своём аккаунте","Таңдаулы әуе билеттері мен қонақүйлеріңізді аккаунтта сақтаңыз","Save your favorite flights and hotels in your account"],
 ["Войти / регистрация","Кіру / тіркелу","Sign in / sign up"],
 ["Вход в аккаунт","Аккаунтқа кіру","Account sign-in"],
 ["Регистрация пока недоступна","Тіркелу әзірге қолжетімсіз","Registration is not available yet"],
 ["Сервис аккаунтов настраивается. Поиск билетов и отелей работает без регистрации.","Аккаунт қызметі бапталуда. Билеттер мен қонақүйлерді тіркелмей-ақ іздеуге болады.","Account services are being configured. You can search flights and hotels without signing up."],
 ["Режим аккаунта","Аккаунт режимі","Account mode"],
 ["Зарегистрироваться","Тіркелу","Sign up"],
 ["Имя (необязательно)","Есім (міндетті емес)","Name (optional)"],
 ["Ваше имя","Есіміңіз","Your name"],
 ["Электронная почта","Электрондық пошта","Email address"],
 ["Пароль","Құпиясөз","Password"],
 ["Не менее 8 символов","Кемінде 8 таңба","At least 8 characters"],
 ["Повторите пароль","Құпиясөзді қайталаңыз","Confirm password"],
 ["Забыли пароль?","Құпиясөзді ұмыттыңыз ба?","Forgot password?"],
 ["← Вернуться ко входу","← Кіруге оралу","← Back to sign in"],
 ["Выйти из аккаунта","Аккаунттан шығу","Sign out"],
 ["Вы вошли в Qansha","Сіз Qansha аккаунтына кірдіңіз","You are signed in to Qansha"],
 ["Ваше избранное будет доступно после входа с другого устройства.","Таңдаулыларыңызға басқа құрылғыдан кіргенде қол жеткізе аласыз.","Your favorites will be available when you sign in on another device."],
 ["Мы используем email для входа и подтверждения регистрации. Никогда не отправляйте пароль в чат.","Email тіркелу мен кіруді растау үшін қолданылады. Құпиясөзіңізді чатқа жібермеңіз.","We use email for sign-in and account confirmation. Never share your password in a chat."],
 ["Подключение аккаунта…","Аккаунтқа қосылу…","Connecting to account…"],
 ["Восстановление доступа к аккаунту","Аккаунтқа кіруді қалпына келтіру","Recover your account"],
 ["Введите новый пароль","Жаңа құпиясөзді енгізіңіз","Enter a new password"],
 ["Отправить письмо","Хат жіберу","Send email"],
 ["Сохранить новый пароль","Жаңа құпиясөзді сақтау","Save new password"],
 ["Укажите email, чтобы получить письмо для восстановления.","Қалпына келтіру хатын алу үшін email көрсетіңіз.","Enter your email to receive a recovery link."],
 ["Придумайте новый пароль длиной не менее 8 символов.","Ұзындығы кемінде 8 таңбадан тұратын жаңа құпиясөз ойлап табыңыз.","Create a new password of at least 8 characters."],
 ["Создайте аккаунт — подтвердить email нужно по ссылке в письме.","Аккаунт ашыңыз — email-ды хаттағы сілтеме арқылы растаңыз.","Create an account and confirm your email through the link we send."],
 ["Введите email и пароль для входа.","Кіру үшін email мен құпиясөзді енгізіңіз.","Enter your email and password to sign in."],
 ["Вы вошли в Qansha.","Сіз Qansha аккаунтына кірдіңіз.","You are signed in to Qansha."],
 ["Не удалось синхронизировать избранное.","Таңдаулыларды синхрондау мүмкін болмады.","Could not sync favorites."],
 ["Регистрация станет доступна после подключения сервиса аккаунтов.","Аккаунт қызметі қосылған соң тіркелу қолжетімді болады.","Registration will be available once account services are connected."],
 ["Не удалось подключиться к сервису аккаунтов. Попробуйте обновить страницу.","Аккаунт қызметіне қосылу мүмкін болмады. Бетті жаңартыңыз.","Could not connect to account services. Please refresh the page."],
 ["Введите новый пароль и сохраните изменения.","Жаңа құпиясөзді енгізіп, өзгерістерді сақтаңыз.","Enter a new password and save your changes."],
 ["Вы успешно вошли!","Сіз сәтті кірдіңіз!","You signed in successfully!"],
 ["Укажите корректный email.","Дұрыс email көрсетіңіз.","Enter a valid email."],
 ["Пароль должен содержать от 8 до 128 символов.","Құпиясөз 8-ден 128 таңбаға дейін болуы тиіс.","Password must be 8 to 128 characters long."],
 ["Пароли не совпадают.","Құпиясөздер сәйкес келмейді.","Passwords do not match."],
 ["Пожалуйста, подождите…","Күте тұрыңыз…","Please wait…"],
 ["Аккаунт создан, вы вошли в Qansha.","Аккаунт ашылды, сіз Qansha-ға кірдіңіз.","Account created; you are signed in to Qansha."],
 ["Если регистрация выполнена, проверьте почту и подтвердите email по ссылке в письме.","Тіркелу сәтті болса, поштаңызды тексеріп, хаттағы сілтеме арқылы email-ды растаңыз.","If signup succeeds, check your inbox and confirm your email using the link."],
 ["Если аккаунт существует, ссылка для восстановления придёт на почту.","Аккаунт бар болса, қалпына келтіру сілтемесі поштаңызға келеді.","If an account exists, a recovery link will arrive in your inbox."],
 ["Пароль обновлён.","Құпиясөз жаңартылды.","Password updated."],
 ["Слишком много попыток. Подождите и попробуйте снова.","Тым көп әрекет жасалды. Күтіп, қайта көріңіз.","Too many attempts. Please wait and try again."],
 ["Не удалось войти. Проверьте email, пароль и подтверждение почты.","Кіру мүмкін болмады. Email, құпиясөз және пошта растауын тексеріңіз.","Could not sign in. Check your email, password and email confirmation."],
 ["Не удалось создать аккаунт. Попробуйте позже.","Аккаунт ашу мүмкін болмады. Кейін қайталаңыз.","Could not create an account. Try again later."],
 ["Не удалось отправить письмо. Попробуйте позже.","Хат жіберілмеді. Кейін қайталаңыз.","Could not send the email. Try again later."],
 ["Не удалось обновить пароль.","Құпиясөз жаңартылмады.","Could not update the password."],
 ["Вы вышли из аккаунта.","Сіз аккаунттан шықтыңыз.","You signed out."],
 ["Не удалось выйти из аккаунта. Повторите попытку.","Аккаунттан шығу мүмкін болмады. Қайталап көріңіз.","Could not sign out. Please retry."],
 ["Сначала дорогие","Алдымен қымбаттары","Highest price first"],
 ["Меньше звёзд","Жұлдызы азырақ","Fewest stars"],
 ["Цена от","Бағасы бастап","Price from"],
 ["Цена до","Бағасы дейін","Price up to"],
 ["Быстрая цена от:","Төменгі баға шегі:","Minimum price presets:"],
 ["Все","Барлығы","All"],
 ["Быстрый фильтр минимальной цены","Ең төменгі баға сүзгісі","Quick minimum price filter"],
 ["Показать ещё отели","Тағы қонақүйлерді көрсету","Show more hotels"],
 ["Один из источников временно недоступен. Показаны результаты работающего поставщика.","Дереккөздердің бірі уақытша қолжетімсіз. Қолжетімді дереккөз нәтижелері көрсетілді.","One source is temporarily unavailable. Showing results from the available provider."],
 ["Отели из выбранного источника. Фото, налоги, наличие и окончательную цену проверьте перед бронированием.","Таңдалған дереккөз қонақүйлері. Фото, салық, қолжетімділік және түпкілікті бағаны брондау алдында тексеріңіз.","Hotels from the selected provider. Check photos, taxes, availability and final price before booking."],
 ["Район уточняется","Аудан нақтыланады","Area to be confirmed"],
 ["Рейтинг гостей","Қонақтар бағасы","Guest rating"],
 ["гостей","қонақ","guests"],
 ["гость","қонақ","guest"],
 ["Найденные варианты","Табылған нұсқалар","Offers found"],
 ["Нет вариантов с такими фильтрами","Бұл сүзгілерге сәйкес нұсқалар жоқ","No offers match these filters"],
 ["Выбирай свой отель","Қонақүйіңізді таңдаңыз","Choose your hotel"],
 ["Найти отели","Қонақүйлерді іздеу","Search hotels"],
 ["Где искать отели?","Қонақүйлерді қайдан іздейміз?","Where to search for hotels?"],
 ["Google Hotels — основная выдача","Google Hotels — негізгі нәтижелер","Google Hotels — main results"],
 ["Booking.com — дополнительные варианты (тест)","Booking.com — қосымша нұсқалар (сынақ)","Booking.com — additional options (beta)"],
 ["Все источники вместе (2 API-запроса, тест)","Барлық дереккөз бірге (2 API сұрау, сынақ)","All providers combined (2 API calls, beta)"],
 ["Выбор другого источника требует нового запроса к SerpApi. Условия и цены подтвердит продавец.","Басқа дереккөзді таңдау SerpApi-ға жаңа сұрау жібереді. Шарттар мен бағаларды сатушы растайды.","Choosing another provider makes a new SerpApi request. The seller confirms rates and conditions."],
 ["Бесплатная отмена","Тегін бас тарту","Free cancellation"],
 ["Если подтверждено поставщиком","Жеткізуші растаған болса","If confirmed by provider"],
 ["Фото и детали","Суреттер мен мәліметтер","Photos & details"],
 ["Бронировать","Брондау","Book"],
 ["Выбрать","Таңдау","Select"],
 ["В избранное","Таңдаулыларға","Save"],
 ["Выбран · отменить","Таңдалды · болдырмау","Selected · deselect"],
 ["Нет вариантов с такими фильтрами","Бұл сүзгілерге сәйкес нұсқалар жоқ","No offers match these filters"],
 ["Сравни расходы в любых двух городах мира","Әлемнің кез келген екі қаласындағы шығындарды салыстыр","Compare costs in any two cities worldwide"],
 ["Для отдельных городов есть модельные ориентиры. Для остальных укажи свои плановые расходы — это не рыночные цены.","Кейбір қалалар бойынша үлгілік бағалар бар. Басқалары үшін жоспарлы шығынды өзіңіз енгізіңіз — бұлар нарықтық бағалар емес.","Some cities have modeled estimates. For other cities, enter your own budget — these are not market prices."],
 ["Город №1","1-қала","City 1"],
 ["Город №2","2-қала","City 2"],
 ["Начните писать город или страну","Қала немесе ел атауын теріңіз","Start typing a city or country"],
 ["Выбирай из подсказок: города доступны по всему миру.","Ұсыныстардан таңдаңыз: әлем қалалары қолжетімді.","Choose from suggestions: cities worldwide are available."],
 ["Город выбран. Сравнение обновлено.","Қала таңдалды. Салыстыру жаңартылды.","City selected. Comparison updated."],
 ["города","қала","cities"],
 ["городов","қала","cities"],
 ["страны","ел","countries"],
 ["Модельные расходы в городах с подготовленными ориентирами, без авиабилетов","Дайын үлгілік бағалары бар қалалар бойынша шығындар, ұшусыз","Modeled costs in cities with available estimates, excluding flights"],
 ["Показать все города с оценкой","Барлық бағаланған қаланы көрсету","Show all estimated cities"],
 ["Свернуть список","Тізімді қысқарту","Show fewer cities"],
 ["Как рассчитана стоимость","Құны қалай есептелді","How the cost was calculated"],
 ["В день на группу","Топқа бір күнге","Per day for the group"],
 ["На человека в день","Бір адамға күніне","Per person per day"],
 ["Расчёт: дневные расходы × дни × путешественники + номер за ночь × ночи × число номеров; с учётом стиля поездки.","Есеп: күнделікті шығын × күн × адам саны + түндік бөлме құны × түн саны × бөлме саны; сапар стилі есепке алынған.","Formula: daily spending × days × travelers + room cost per night × nights × rooms; adjusted for travel style."],
 ["Для города нет подготовленных местных цен. Задайте плановые расходы в евро:","Бұл қала бойынша жергілікті баға үлгісі жоқ. Еуромен жоспарлы шығынды енгізіңіз:","No city-specific prices available. Enter your budget assumptions in EUR:"],
 ["На человека в день (EUR)","Бір адамға күніне (EUR)","Per person per day (EUR)"],
 ["Номер за ночь (EUR)","Бөлме бір түнге (EUR)","Room per night (EUR)"],
 ["Это ваши плановые суммы, не проверенные цены в городе.","Бұл сіздің жоспарлы бюджетіңіз, қаладағы расталған бағалар емес.","These are your budget assumptions, not verified local prices."],
 ["Модельная оценка для города","Қала бойынша үлгілік бағалау","Modeled city estimate"],
 ["Ваш плановый бюджет","Сіздің жоспарлы бюджетіңіз","Your budget assumptions"],
 ["По этой модели расходы одинаковы.","Бұл үлгі бойынша шығындар бірдей.","Estimated expenses are equal."],
 ["По выбранным параметрам дешевле:","Таңдалған шарттарға сай арзанырақ:","Cheaper under your selected assumptions:"],
 ["Чтобы сравнить любой город, укажите свои плановые расходы на день и проживание.","Кез келген қаланы салыстыру үшін күнделікті және тұру бюджетіңізді енгізіңіз.","Enter your daily and accommodation budgets to compare any cities."],
 ["дней","күн","days"],
 ["чел.","адам","people"],
 ["Эконом","Үнемді","Budget"],
 ["Комфорт","Жайлылық","Comfort"],

 ['Город не выбран','Қала таңдалмаған','City not selected'],
 ['Стоимость поездки не исследована','Сапар құны әлі зерттелмеген','Trip costs unavailable'],
 ['Для страны пока нет модельных цен','Бұл ел үшін жоспарлы баға деректері жоқ','No modeled prices for this country'],
 ['Для выбранной страны нет сопоставимых данных о ценах. Откройте «Сколько?» и задайте бюджет вручную для любого города.','Таңдалған ел үшін салыстыруға келетін баға деректері жоқ. «Qansha?» бөлімінде бюджетті қолмен енгізіңіз.','Comparable prices are unavailable for this country. Open “How much?” to create a custom city budget.'],
 ['Билеты и сезонные изменения не включены.','Билеттер мен маусымдық ауытқулар есепке алынбаған.','Flights and seasonal changes are not included.'],


 ['Страна','Ел','Country'],['Город','Қала','City'],
 ['Города всего мира','Әлемнің қалалары','Cities worldwide'],
 ['Выберите страну','Елді таңдаңыз','Select country'],
 ['Начните писать название города','Қала атауын теріңіз','Start typing a city'],
 ['Найти город в выбранной стране','Таңдалған елден қала табу','Find a city in the selected country'],
 ['Начните вводить город — покажем варианты из глобального справочника.','Қала атауын теріңіз — әлемдік анықтамалықтан нұсқаларды көрсетеміз.','Type a city name to find places worldwide.'],
 ['Для этого города пока нет проверенных местных цен. Числа ниже —','Бұл қала бойынша тексерілген жергілікті бағалар жоқ. Төмендегі сандар —','Verified local prices are not available for this city. The numbers below are'],
 ['ваши плановые ориентиры','өзіңіздің жоспарлы бағалауыңыз','your planning assumptions'],
 ['а не стоимость жизни в выбранном городе. Укажите бюджет, чтобы оценить поездку.','таңдалған қаланың нақты өмір сүру құны емес. Сапар бюджетін жоспарлаңыз.','not actual local prices. Set your budget to plan the trip.'],
 ['Плановая стоимость двухместного номера за ночь (EUR)','Екі адамдық бөлменің бір түнге жоспарланған құны (EUR)','Budgeted twin/double room per night (EUR)'],
 ['География:','Географиялық деректер:','Geographic data:'],
 ['Город в справочнике не означает наличие авиарейсов или гостиниц.','Қала тізімде бар болғанымен, рейс не қонақүй міндетті түрде бола бермейді.','A listed city does not guarantee flights or hotels.'],
 ['Введите название города в выбранной стране.','Таңдалған елдегі қала атауын теріңіз.','Type a city in the selected country.'],
 ['Ищем города…','Қалалар ізделуде…','Searching cities…'],
 ['Введите название города в выбранной стране.','Таңдалған елдегі қала атауын енгізіңіз.','Enter a city in this country.'],
 ['Выберите город из списка — тогда обновим расчёт.','Тізімнен қаланы таңдаңыз — есеп жаңартылады.','Choose a city to update the budget.'],
 ['Ничего не найдено. Попробуйте другое написание города.','Ештеңе табылмады. Қала атауын басқаша жазыңыз.','No matches. Try another spelling.'],
 ['Нет результатов: проверьте название или страну.','Нәтиже жоқ: қала немесе ел атауын тексеріңіз.','No results: check the city or country.'],
 ['Справочник городов временно недоступен. Попробуйте ещё раз.','Қалалар анықтамалығы уақытша қолжетімсіз. Қайта көріңіз.','City directory unavailable. Please retry.'],
 ['Не удалось загрузить полный список стран. Попробуйте обновить страницу.','Елдердің толық тізімі жүктелмеді. Бетті жаңартыңыз.','Could not load all countries. Try refreshing the page.'],
 ['Нет данных для этого города','Бұл қала үшін деректер жоқ','No data for this city'],
 ['Плановая сумма, не цена отеля','Жоспарлы сома, нақты қонақүй бағасы емес','Budgeted amount, not a hotel quote'],
 ['Ваш дневной бюджет, не средняя цена города','Сіздің күндік бюджетіңіз, орташа қалалық баға емес','Your daily budget, not a city average'],
 ['Для этого города пока нет подготовленных маршрутов. Выберите интересующие вас достопримечательности и заложите расходы вручную.','Бұл қала үшін дайын маршрут жоқ. Қызықты орындарды өзіңіз таңдап, шығынды жоспарлаңыз.','No prepared itineraries for this city yet. Choose sights and budget for them yourself.'],
 ['Другое число пассажиров или направление','Жолаушылар саны немесе бағыт сәйкес емес','Different travelers or destination'],
 ['Для этого города нет местных цен: ежедневные расходы и жильё рассчитаны по изменяемым плановым суммам, а не данным города.','Бұл қалада жергілікті бағалар жоқ: күнделікті шығындар мен қонақүй жоспарыңызды негізге алады.','No verified local prices for this city: daily costs and hotel expenses use adjustable planning amounts.'],


 ['Фильтры авиабилетов','Әуе билеттерінің сүзгілері','Flight filters'],
 ['По найденным предложениям','Табылған ұсыныстар бойынша','Applied to found offers'],
 ['Самый быстрый','Ең жылдам','Fastest'],['Меньше пересадок','Ауысу азырақ','Fewest stops'],
 ['Пересадки','Ауысу','Stops'],['Прямой рейс','Тікелей рейс','Direct flight'],['Не более 1 пересадки','Ең көбі 1 ауысу','Up to 1 stop'],
 ['Авиакомпания','Әуе компаниясы','Airline'],['Все авиакомпании','Барлық әуе компаниялары','All airlines'],
 ['Время вылета','Ұшу уақыты','Departure time'],['Любое время','Кез келген уақыт','Any time'],
 ['Утро 06–12','Таңертең 06–12','Morning 06–12'],['День 12–18','Күндіз 12–18','Afternoon 12–18'],
 ['Вечер 18–24','Кеш 18–24','Evening 18–24'],['Ночь 00–06','Түн 00–06','Night 00–06'],
 ['Цена до (EUR)','Баға шегі (EUR)','Price up to (EUR)'],['Перелёт до (часов)','Ұшу ұзақтығы (сағат)','Flight time up to (hours)'],
 ['Найденные авиарейсы','Табылған рейстер','Found flights'],
 ['Багаж: уточнить','Жүк: нақтылау қажет','Checked baggage: verify'],
 ['Ручная кладь: уточнить','Қол жүгі: нақтылау қажет','Cabin bag: verify'],
 ['Обмен и возврат: уточнить','Айырбастау және қайтару: нақтылау','Changes and refunds: verify'],
 ['Выбрать','Таңдау','Select'],['✓ Выбран · отменить','✓ Таңдалды · қайтару','✓ Selected · remove'],
 ['В избранном','Таңдаулыларда','Saved'],['В избранное','Таңдаулыларға','Save'],
 ['Подробнее','Толығырақ','Details'],['Фото и детали','Фото және мәлімет','Photos & details'],
 ['Купить у партнёра','Серіктестен сатып алу','Buy with partner'],
 ['Бронировать','Брондау','Book'],['Отменить выбор','Таңдауды болдырмау','Remove selection'],
 ['Рейс','Рейс','Flight'],['Информация о рейсе','Рейс туралы ақпарат','Flight details'],
 ['Переход к продавцу','Сатушының сайтына өту','Go to seller'],
 ['Данные поставщика','Қызмет көрсетуші деректері','Provider details'],
 ['Фотографии, удобства и бронирование','Фотолар, мүмкіндіктер және брондау','Photos, amenities & booking'],
 ['Фотографии пока недоступны у поставщика.','Қызмет көрсетуші фотоларды ұсынбады.','Photos are not available from the provider.'],
 ['Загружаем дополнительную информацию…','Қосымша мәліметтер жүктелуде…','Loading more details…'],
 ['Не выбран','Таңдалмады','Not selected'],['выбранный отель','таңдалған қонақүй','selected hotel'],
 ['модельная оценка','шамамен есеп','model estimate'],['Добавлено в расчёт поездки','Сапар есебіне қосылды','Added to trip budget'],
 ['Выбор отменён — цена убрана из расчёта','Таңдау жойылды — баға есептен алынды','Selection removed from trip budget'],
 ['Сохранено в избранное','Таңдаулыларға сақталды','Saved to favorites'],
 ['Удалено из избранного','Таңдаулылардан жойылды','Removed from favorites'],
 ['Нет вариантов с такими фильтрами','Бұл сүзгілер бойынша ұсыныс жоқ','No results match these filters'],

 ['Авиабилеты','Әуе билеттері','Flights'],['Отели','Қонақүйлер','Hotels'],['Сколько?','Qansha?','How much?'],['Сравнить','Салыстыру','Compare'],
 ['Сколько? — Один ответ.','Qansha? — Бір жауап.','How much? — One answer.'],['— Один ответ.','— Бір жауап.','— One answer.'],
 ['Дешёвые авиабилеты, конкретные отели и бюджет поездки. Всё в одном месте.','Арзан әуе билеттері, нақты қонақүйлер және сапар бюджеті. Барлығы бір жерде.','Cheap flights, real hotels and your travel budget. All in one place.'],
 ['QANSHA? · ПУТЕШЕСТВУЙ БОЛЬШЕ','QANSHA? · КӨБІРЕК САЯХАТТА','QANSHA? · TRAVEL MORE'],
 ['Войти','Кіру','Sign in'],['Аккаунт','Аккаунт','Account'],['Избранное','Таңдаулылар','Favorites'],
 ['Самые дешёвые из доступных предложений','Табылған ұсыныстардың ең арзаны','Lowest prices among available offers'],
 ['Откуда','Қайдан','From'],['Куда','Қайда','To'],['Город или аэропорт','Қала немесе әуежай','City or airport'],['Поиск по всему миру','Әлем бойынша іздеу','Search worldwide'],
 ['Туда-обратно','Барып-қайту','Round trip'],['В одну сторону','Бір бағыт','One way'],['Тип перелёта','Ұшу түрі','Flight type'],
 ['Валюта','Валюта','Currency'],['Конвертация ориентировочная. Стоимость у перевозчика может отличаться.','Валюта бағамы шамамен алынған. Әуе компаниясындағы баға өзгеше болуы мүмкін.','Currency conversion is approximate. Airline prices may differ.'],
 ['Туда','Ұшу','Departure'],['Обратно','Қайту','Return'],['Пассажиры','Жолаушылар','Passengers'],['1 взрослый','1 ересек','1 adult'],['2 взрослых','2 ересек','2 adults'],['3 взрослых','3 ересек','3 adults'],['4 взрослых','4 ересек','4 adults'],['5 взрослых','5 ересек','5 adults'],['6 взрослых','6 ересек','6 adults'],['7 взрослых','7 ересек','7 adults'],['8 взрослых','8 ересек','8 adults'],['9 взрослых','9 ересек','9 adults'],
 ['Найти авиабилеты','Билеттерді іздеу','Search flights'],['Цены и багаж уточняйте перед покупкой','Төлем алдында баға мен багажды тексеріңіз','Verify fares and baggage before booking'],
 ['Начни с направления','Бағытты таңдаңыз','Choose a destination'],['Выбери города и даты — мы покажем найденные предложения по цене.','Қалалар мен күндерді таңдап, табылған ұсыныстарды көріңіз.','Choose cities and dates to see available offers sorted by price.'],
 ['Конкретные варианты на ваши даты','Күндеріңізге сәйкес нақты нұсқалар','Specific offers for your dates'],['Город проживания','Тұратын қала','Stay in'],['Найти город или страну','Қаланы немесе елді іздеу','Search city or country'],
 ['Заезд','Келу','Check-in'],['Выезд','Кету','Check-out'],['Гости','Қонақтар','Guests'],['1 гость','1 қонақ','1 guest'],['2 гостя','2 қонақ','2 guests'],['3 гостя','3 қонақ','3 guests'],['4 гостя','4 қонақ','4 guests'],['5 гостей','5 қонақ','5 guests'],['6 гостей','6 қонақ','6 guests'],['7 гостей','7 қонақ','7 guests'],['8 гостей','8 қонақ','8 guests'],['9 гостей','9 қонақ','9 guests'],
 ['Какой отель подобрать?','Қандай қонақүйді таңдаймыз?','Which hotel suits you?'],['Выбери категорию — мы сразу начнём поиск','Деңгейді таңдаңыз — іздеу бірден басталады','Choose a tier to start the search'],
 ['Эконом','Үнемді','Budget'],['Средний','Орташа','Standard'],['Комфорт','Жайлы','Comfort'],['Фильтры как в сервисе бронирования','Брондау сүзгілері','Booking-style filters'],
 ['Применяются к найденным вариантам','Табылған ұсыныстарға қолданылады','Applied to returned offers'],['Сортировка','Сұрыптау','Sort by'],['Сначала дешёвые','Алдымен арзандары','Cheapest first'],['Лучший рейтинг','Жоғары рейтинг','Highest rating'],['Больше звёзд','Жұлдызы көбірек','Most stars'],['Звёзды отеля','Қонақүй жұлдыздары','Hotel stars'],['Любые','Кез келген','Any'],['2★ и выше','2★ және жоғары','2★ and up'],['3★ и выше','3★ және жоғары','3★ and up'],['4★ и выше','4★ және жоғары','4★ and up'],['Только 5★','Тек 5★','Only 5★'],['Оценка гостей','Қонақтар бағасы','Guest rating'],['Любая','Кез келген','Any'],['От 3,5','3,5-тен','3.5+'],['От 4,0','4,0-ден','4.0+'],['От 4,5','4,5-тен','4.5+'],['Макс. цена за поездку (EUR)','Сапар бағасының шегі (EUR)','Max stay price (EUR)'],['Без ограничения','Шектеусіз','No limit'],['Тип жилья','Тұратын жер түрі','Property type'],['Все варианты','Барлық нұсқалар','All types'],['Апартаменты / другое','Пәтер / басқа','Apartments / other'],['Бесплатная отмена','Тегін бас тарту','Free cancellation'],['Если подтверждено поставщиком','Жеткізуші растаған жағдайда','When confirmed by provider'],['Найти отели','Қонақүйлерді іздеу','Search hotels'],['Найди свой отель','Қонақүйіңізді табыңыз','Find your hotel'],['Покажем названия гостиниц, цены за поездку и подберём варианты под бюджет.','Қонақүй атауларын, бағаларын және бюджетке сай нұсқаларды көрсетеміз.','See named hotels, trip prices and options for your budget.'],
 ['Сколько уйдёт на поездку?','Сапарға қанша ақша кетеді?','How much will your trip cost?'],['Выбери стиль — рассчитаем жильё, еду, транспорт и впечатления','Саяхат түрін таңдаңыз — тұру, тамақ, көлік пен демалысты есептейміз','Choose your style — estimate stays, food, transport and experiences'],['Главная идея Qansha?','Qansha? басты идеясы','The heart of Qansha?'],['Qansha? — Сколько уйдёт?','Qansha? — Қанша жұмсалады?','Qansha? — What will it cost?'],
 ['Узнай примерные расходы до поездки: питание, продукты, рестораны, транспорт и жильё. Без скрытых формул.','Сапарға дейін тамақ, азық-түлік, мейрамхана, көлік пен тұру шығындарын біліңіз.','Estimate food, groceries, restaurants, transport and accommodation before you go.'],['Страна и город','Ел және қала','Country & city'],['Выбери страну и город','Ел мен қаланы таңдаңыз','Choose a country and city'],
 ['Настройки путешествия','Сапар параметрлері','Trip settings'],['Сколько дней?','Неше күн?','How many days?'],['Сколько путешественников?','Неше саяхатшы?','How many travelers?'],['5 дней','5 күн','5 days'],['2 человека','2 адам','2 people'],['1 день','1 күн','1 day'],['7 дней','7 күн','7 days'],['30 дней','30 күн','30 days'],['1 человек','1 адам','1 person'],['6 человек','6 адам','6 people'],['12 человек','12 адам','12 people'],['Проживание: дни минус одна ночь','Қону саны: күн санынан біреуі кем','Hotel nights: days minus one'],['Номера рассчитываются из двухместного размещения','Бөлмелер екі адамдық болып есептеледі','Rooms are modeled for two guests each'],
 ['Стиль путешествия','Саяхат стилі','Travel style'],['Экономно','Үнемді','Budget-friendly'],['С комфортом','Жайлылықпен','Comfortably'],['Сколько стоит жизнь?','Тұрмыс қанша тұрады?','Cost of living & daily prices'],['Ориентиры для выбранного города, не официальная средняя по стране','Таңдалған қалаға арналған бағдарлық бағалар, ел бойынша ресми орташа көрсеткіш емес','Indicative city prices, not official national averages'],['Оценка','Бағалау','Estimate'],
 ['Ужин в ресторане на двоих','Екі адамға мейрамханадағы кешкі ас','Dinner for two at a restaurant'],['Два основных блюда, без алкоголя','Екі негізгі тағам, алкогольсіз','Two main dishes, no alcohol'],['Продукты в супермаркете','Супермаркеттегі азық-түлік','Supermarket groceries'],['Хлеб, молоко, яйца, фрукты и вода · корзина','Нан, сүт, жұмыртқа, жеміс және су · себет','Bread, milk, eggs, fruit and water · basket'],['Поездка на транспорте','Қоғамдық көлік жолақысы','Public transport ride'],['Один билет в городе','Қалалық бір жол жүру билеті','One local ticket'],['Кофе в кафе','Кафедегі кофе','Coffee at a café'],['Одна чашка','Бір кесе','One cup'],['Ночь в отеле','Қонақүйдегі бір түн','Hotel room per night'],['Один двухместный номер · оценка','Екі кісілік бір бөлме · бағалау','One double room · estimate'],['Расходы на человека в день','Бір адамның күндік шығыны','Daily cost per person'],['Еда, транспорт, досуг и мелочи без отеля','Тамақ, көлік, демалыс пен ұсақ-түйек, қонақүйсіз','Food, transport, activities and extras, excluding hotels'],
 ['Цены — модельные ориентиры для планирования, не проверенные прайсы магазинов и ресторанов. Учитывают примерный уровень цен города, а не средние расходы всех жителей. Стоимость ужина и продуктовой корзины приведена для сравнения и не прибавляется повторно к дневному бюджету.','Бағалар — жоспарлауға арналған шамамен алынған мәндер, дүкендер мен мейрамханалардың расталған бағалары емес. Олар барлық тұрғындардың нақты орташа шығынын білдірмейді. Кешкі ас пен азық-түлік себеті күндік бюджетке екінші рет қосылмайды.','These are modeled planning estimates, not verified store or restaurant prices or residents’ actual averages. Dinner and grocery examples are comparisons and are not added a second time to daily costs.'],
 ['Куда уйдут деньги?','Ақша неге жұмсалады?','Where does the money go?'],['Оценка на человека / день','Бір адамға / күніне','Estimate per person / day'],['Куда можно сходить?','Қайда баруға болады?','What can you visit?'],['Идеи для города и стиля','Қала мен сапар стиліне сай идеялар','Ideas for your city and travel style'],['Еда и кафе','Тамақ және кафе','Food & cafés'],['Транспорт','Көлік','Transport'],['Прогулки и развлечения','Серуен және ойын-сауық','Attractions & activities'],['Резерв на мелочи','Ұсақ шығын қоры','Extra expenses'],['Можно начать бесплатно или с небольших расходов','Тегін не аз шығынмен бастауға болады','Can start free or at low cost'],['Учитывай транспорт и входные билеты','Жолақы мен кіру билеттерін ескеріңіз','Budget for transport and entrance fees'],['Заложи деньги по своему стилю','Өз стиліңізге сай қаржы бөліңіз','Set aside money for your travel style'],['Выбери по интересам и бюджету','Қызығушылық пен бюджетке сай таңдаңыз','Choose based on your interests and budget'],
 ['Расходы на месте / человек / день','Күндік жергілікті шығын / адам','Local spending / person / day'],['Авиабилеты','Әуе билеттері','Flights'],['Проживание','Тұру','Accommodation'],['Расходы на месте','Жергілікті шығындар','Local spending'],['Вся поездка','Жалпы сапар','Total trip'],['Выбери рейс','Рейсті таңдаңыз','Choose a flight'],['Выбрать рейс','Рейсті таңдау','Choose a flight'],['Выбрать отель','Қонақүй таңдау','Choose hotel'],
 ['Не выбран','Таңдалмаған','Not selected'],['предложение','ұсыныс','offer'],['модельная оценка','үлгілік баға','modeled estimate'],['Примерно вся поездка','Жалпы сапардың болжамы','Estimated total trip'],['Оценка без авиабилетов','Әуе билетінсіз есеп','Estimate excluding flights'],['планировочный расчёт','жоспарлы есеп','planning estimate'],['ночей','түн','nights'],['дней','күн','days'],['чел.','адам','people'],['без авиабилетов','әуе билетінсіз','without flights'],
 ['Предварительный расчёт для планирования. Авиабилеты не включены, если вы не выбрали совпадающий маршрут и группу. Цены питания и жилья — оценки, а не подтверждённые предложения. Учитывайте сезон и личные предпочтения.','Бұл жоспарлауға арналған алдын ала есеп. Сәйкес бағыт пен жолаушылар таңдалмаса, әуе билеттері қосылмайды. Тамақ пен тұру бағалары расталған ұсыныстар емес. Маусым мен жеке талғамға қарай өзгеруі мүмкін.','This is a planning estimate. Flights are excluded unless you select a matching route and party size. Food and accommodation are modeled, not confirmed offers; seasonal and personal costs can vary.'],
 ['Где дешевле отдохнуть?','Қай елде демалу арзанырақ?','Where is it cheaper to travel?'],['Сравни две страны через примерные расходы на поездку','Екі елдегі болжамды сапар шығынын салыстырыңыз','Compare estimated trip costs between countries'],['Сравнение стран','Елдерді салыстыру','Compare countries'],['Сравнение рассчитано по модельным расходам на жильё и жизнь в городе.','Салыстыру қалалық тұру және күнделікті шығын үлгісіне негізделген.','Comparison uses modeled city accommodation and daily spending.'],['Билеты не включены','Билеттер есептелмеген','Flights not included'],['— они зависят от места вылета и даты.','— олар ұшу қаласы мен күнге байланысты.','— fares depend on departure point and dates.'],['Страна №1','1-ел','Country 1'],['Страна №2','2-ел','Country 2'],['Дней','Күн','Days'],['3 дня','3 күн','3 days'],['10 дней','10 күн','10 days'],['14 дней','14 күн','14 days'],['21 день','21 күн','21 days'],['Ещё недорогие направления','Басқа да арзан бағыттар','More affordable destinations'],['Оценка поездки на одного человека, без авиабилетов','Әуе билетінсіз бір адамға арналған сапар бағасы','Estimated cost per traveler, excluding flights'],['Ориентировочные расходы одинаковые.','Болжамды шығындар бірдей.','Modeled costs are equal.'],['Билеты, визы и сезонные изменения не включены.','Билеттер, визалар және маусымдық өзгерістер кірмейді.','Excludes flights, visas and seasonal changes.'],
 ['Пока нет подтверждённых вариантов','Әзірге расталған ұсыныстар жоқ','No verified offers yet'],['Посмотреть в Google Hotels','Google Hotels сайтынан қарау','See Google Hotels'],['Цена найдена у Google Hotels и может измениться.','Баға Google Hotels арқылы табылды және өзгеруі мүмкін.','Price found via Google Hotels and may change.'],['Подбираем отель','Қонақүй ізделуде','Finding hotels'],['Проверяем доступность и цены на выбранные даты…','Таңдалған күндерге бағалар мен орындарды тексеріп жатырмыз…','Checking availability and prices for your dates…'],['Отель из поиска','Іздеудегі қонақүй','Hotel search offer'],['Подобран','Ұсынылды','Suggested'],['Выбранный отель','Таңдалған қонақүй','Selected hotel'],['Отель','Қонақүй','Hotel'],['Мы найдём подходящие варианты с названиями и ценами на выбранные даты.','Таңдалған күндерге нақты қонақүй атаулары мен бағаларын іздейміз.','We’ll find named properties with prices for your dates.'],['без алкоголя','алкогольсіз','without alcohol'],['Ориентиры для выбранного города, не официальная средняя по стране','Таңдалған қалаға арналған шамамен алынған бағалар, ресми ұлттық орташа емес','Approximate city prices, not national averages'],
 ['Избранные предложения','Таңдаулы ұсыныстар','Saved offers'],['Войти / регистрация','Кіру / тіркелу','Sign in / register'],['Email','Электрондық пошта','Email'],['Отправить ссылку','Сілтемені жіберу','Send sign-in link'],['Выйти','Шығу','Sign out'],['Закрыть','Жабу','Close'],['Удалить','Жою','Remove'],['Следующий месяц','Келесі ай','Next month'],['Предыдущий месяц','Алдыңғы ай','Previous month'],['Выбрать дату','Күнді таңдау','Select a date'],['Показать ещё','Тағы көрсету','Show more'],['Загрузка','Жүктелуде','Loading'],['Поиск','Іздеу','Search'],['Найденные авиарейсы','Табылған рейстер','Flight results'],['Найденные отели','Табылған қонақүйлер','Hotel results'],['Самый дешёвый','Ең арзаны','Cheapest'],['Средний','Орташа','Standard'],['Предложение','Ұсыныс','Offer'],['Цена','Бағасы','Price'],['Нет предложений','Ұсыныстар жоқ','No offers'],['Найти','Іздеу','Search']
 ];
 const dict={kk:Object.create(null),en:Object.create(null)};
 entries.forEach(([ru,kk,en])=>{dict.kk[ru]=kk;dict.en[ru]=en});
 const cities={
  FR:['Париж','Париж','Paris'],TR:['Стамбул','Ыстамбұл','Istanbul'],TH:['Бангкок','Бангкок','Bangkok'],GE:['Тбилиси','Тбилиси','Tbilisi'],KZ:['Алматы','Алматы','Almaty'],UZ:['Ташкент','Ташкент','Tashkent'],AZ:['Баку','Баку','Baku'],AE:['Дубай','Дубай','Dubai'],IT:['Рим','Рим','Rome'],ES:['Барселона','Барселона','Barcelona'],CZ:['Прага','Прага','Prague'],MY:['Куала-Лумпур','Куала-Лумпур','Kuala Lumpur'],VN:['Дананг','Дананг','Da Nang'],JP:['Токио','Токио','Tokyo'],CH:['Цюрих','Цюрих','Zurich'],IS:['Рейкьявик','Рейкьявик','Reykjavik'],SG:['Сингапур','Сингапур','Singapore']};
 const ideas={
  FR:[['Сена жағалауында серуендеу','Walk along the Seine'],['Монмартрға бару','Visit Montmartre'],['Лувр не Орсе мұражайы','Visit the Louvre or Musée d’Orsay'],['Бақтар мен наубайханалар','Discover gardens and bakeries']],
  TR:[['Сұлтанахметті аралау','Explore Sultanahmet'],['Босфорды тамашалау','See the Bosphorus'],['Үлкен базарды аралау','Explore the Grand Bazaar'],['Сарайлар мен мұражайларға бару','Visit palaces and museums']],
  TH:[['Ғибадатханалар мен ескі қаланы көру','Temples and old town'],['Түнгі базар','Visit the night market'],['Чао-Прайя бойымен серуендеу','Explore the Chao Phraya river'],['Жергілікті көше тағамы','Try local street food']],
  GE:[['Ескі Тбилиси','Explore Old Tbilisi'],['Нарикала қамалы','Narikala Fortress'],['Күкірт моншалары','Sulfur baths'],['Грузин кафелері','Georgian cafés']],
  KZ:[['Медеу мен таулар','Medeu and the mountains'],['Жасыл базар','Green Bazaar'],['Мұражайлар мен саябақтар','Museums and parks'],['Ұлттық тағамдар','Local cuisine']],
  UZ:[['Ескі қаланы аралау','Explore the old town'],['Чорсу базары','Chorsu Bazaar'],['Метро мен мұражайлар','Metro stations and museums'],['Самарқандқа саяхат','Day trip to Samarkand']],
  AZ:[['Ішерішаһар','Icherisheher old town'],['Жағалау бульвары','Seaside Boulevard'],['Гейдар Әлиев орталығы','Heydar Aliyev Center'],['Қала мұражайлары','City museums']],
  AE:[['Дубай-Крик','Dubai Creek'],['Дейра базарлары','Deira markets'],['Жағажайлар','Beaches'],['Бақылау алаңдары','Viewpoints']],
  IT:[['Колизей маңымен серуендеу','Walk around the Colosseum'],['Форум мен алаңдар','Forum and piazzas'],['Субұрқақтар','Fountains'],['Жергілікті тратториялар','Local trattorias']],
  ES:[['Готика кварталы','Gothic Quarter'],['Қалалық жағажайлар','City beaches'],['Гауди сәулеті','Gaudí architecture'],['Азық-түлік базарлары','Food markets']],
  CZ:[['Карл көпірі','Charles Bridge'],['Ескі қала алаңы','Old Town Square'],['Прага қамалы','Prague Castle'],['Чех кафелері','Czech cafés']],
  MY:[['Петронас мұнаралары','Petronas Towers'],['Бату үңгірлері','Batu Caves'],['Фуд-корттар','Food courts'],['Қала саябақтары','City parks']],
  VN:[['Дананг жағажайлары','Da Nang beaches'],['Мәрмәр таулары','Marble Mountains'],['Жергілікті базарлар','Local markets'],['Хойанға саяхат','Visit Hoi An']],
  JP:[['Асакусаны аралау','Explore Asakusa'],['Бақтар мен ғибадатханалар','Gardens and shrines'],['Сибуя ауданы','Shibuya district'],['Жергілікті кафелер','Local cafés']],
  CH:[['Ескі қаланы аралау','Explore the old town'],['Цюрих көлі','Lake Zurich'],['Қала мұражайлары','City museums'],['Қала сыртында серуендеу','Nearby nature walks']],
  IS:[['Жағалаумен серуендеу','Waterfront promenade'],['Қалалық мұражайлар','City museums'],['Геотермалдық бассейндер','Geothermal pools'],['Табиғи маршруттар','Scenic nature routes']],
  SG:[['Marina Bay','Marina Bay'],['Gardens by the Bay','Gardens by the Bay'],['Hawker орталықтары','Hawker centres'],['Ботаникалық бақ','Botanic Gardens']]
 };
 const locale=()=>({kk:'kk-KZ',ru:'ru-RU',en:'en-US'})[lang];
 let lang='ru';try{const saved=localStorage.getItem('qansha-language');if(['ru','kk','en'].includes(saved))lang=saved}catch{}
 let originals=new WeakMap(),last=new WeakMap(),queued=false;
 const isExempt=n=>n.parentElement?.closest('script,style,textarea,[data-no-translate]');
 function t(text){let s=String(text??'');if(lang==='ru')return s;
  if(dict[lang][s])return dict[lang][s];
  // Translate stable phrases inside computed summaries; do not touch prices or numeric values.
  for(const [source,translation] of Object.entries(dict[lang]).sort((a,b)=>b[0].length-a[0].length)){
   if(s.includes(source))s=s.split(source).join(translation);
  }
  if(lang==='en')s=s.replace(/\b(\d+)\s+д(е|н)(нь|ня|ней)\b/g,'$1 days').replace(/\b(\d+)\s+гост(ь|я|ей)\b/g,'$1 guests');
  return s;
 }
 function transNode(node){if(isExempt(node))return;const current=node.nodeValue;if(!current||!current.trim())return;
  const before=last.get(node);
  if(!originals.has(node)||before!==undefined&&before!==current)originals.set(node,current);
  const original=originals.get(node);const trimmed=original.trim();
  const translated=t(trimmed);
  const target=translated===trimmed?original:original.replace(trimmed,translated);
  if(node.nodeValue!==target)node.nodeValue=target;
  last.set(node,target);
 }
 function translateAll(){if(!document.body)return;const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;while((node=walk.nextNode()))transNode(node);
  document.querySelectorAll('input[placeholder], [title], [aria-label]').forEach(el=>{for(const key of ['placeholder','title','aria-label']){if(!el.hasAttribute(key))continue;const normalizedKey=key.replace(/[^A-Za-z]/g,'');const base='i18nOrig'+normalizedKey;const prior='i18nLast'+normalizedKey;let val=el.getAttribute(key);if(el.dataset[prior]!==val)el.dataset[base]=val;const translated=t(el.dataset[base]||val);if(val!==translated)el.setAttribute(key,translated);el.dataset[prior]=translated}});
  document.querySelectorAll('[data-lang]').forEach(b=>{b.classList.toggle('active',b.dataset.lang===lang);b.setAttribute('aria-pressed',String(b.dataset.lang===lang))});
  document.documentElement.lang=lang;
  document.title=lang==='kk'?'Qansha? — Бір жауап · Әуе билеттері және қонақүйлер':lang==='en'?'How much? — One answer · Flights and hotels':'Сколько? — Один ответ · Авиабилеты и отели';
 }
 function refresh(){translateAll()}
 function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;translateAll()})}
 function setLang(next){if(!['ru','kk','en'].includes(next))return;lang=next;try{localStorage.setItem('qansha-language',next)}catch{};window.QANSHA_BUDGET?.refresh();translateAll();}
 window.QANSHA_I18N={t,city:(code,fallback)=>{const pair=Object.entries(cities).find(([k,v])=>k===code||v[0]===fallback);return pair?pair[1][lang==='kk'?1:lang==='en'?2:0]:fallback},idea:(country,i,fallback)=>lang==='ru'?fallback:(ideas[country]?.[i]?.[lang==='kk'?0:1]||fallback),locale,language:()=>lang,refresh,setLanguage:setLang};
 document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang)));translateAll();const observer=new MutationObserver(schedule);observer.observe(document.body,{childList:true,subtree:true,characterData:true});window.QANSHA_BUDGET?.refresh();translateAll();});
})();
// Extra API status copy uses the same localization dictionary via the live DOM translator.