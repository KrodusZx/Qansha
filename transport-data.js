/* Checked 22 October 2026. One adult standard fare for the named mode,
 * not a countrywide average. Taxi examples include a short trip where a
 * published starting + distance fare (or TfL example) is available. */
(() => {
 'use strict';
 const fare=(country,city,price,unit,mode,source,taxi=null)=>({country,city,price,unit,mode,source,taxi,checked:'2026-10-22'});
 const list=[
  fare('KZ','Astana',110,'KZT','bus','https://transcard.kz/ru/fare/',{one:2500,two:5000,unit:'KZT',source:'https://www.numbeo.com/cost-of-living/in/Astana-Nur-Sultan-Kazakhstan',distance:'3 km'}),
  fare('KG','Bishkek',20,'KGS','bus','https://www.numbeo.com/cost-of-living/in/Bishkek',{one:195,two:390,unit:'KGS',source:'https://www.numbeo.com/cost-of-living/in/Bishkek',distance:'3 km'}),
  fare('TJ','Dushanbe',2.5,'TJS','bus','https://www.numbeo.com/cost-of-living/in/Dushanbe',{one:19,two:38,unit:'TJS',source:'https://www.numbeo.com/cost-of-living/in/Dushanbe',distance:'3 km'}),
  fare('TR','Istanbul',46.2,'TRY','metro','https://www.metro.istanbul/en/SeferDurumlari/BiletUcretleri'),
  fare('TH','Bangkok',17,'THB','starting','https://www.bts.co.th/eng/tickets/ticket-journey.html'),
  fare('FR','Paris',2.55,'EUR','metro','https://www.ratp.fr/en/titres-et-tarifs/ticket-metro-train-rer'),
  fare('GE','Tbilisi',1,'GEL','busMetro','https://ttc.com.ge/index.php/en/tariff/10'),
  fare('AE','Dubai',3,'AED','zone','https://www.rta.ae/wps/portal/rta/ae/public-transport/Nol-Fares'),
  fare('IT','Rome',1.5,'EUR','busMetro','https://www.atac.roma.it/en/tickets-and-passes/bit'),
  fare('ES','Barcelona',2.9,'EUR','busMetro','https://www.tmb.cat/en/barcelona-fares-metro-bus/single-ticket'),
  fare('CZ','Prague',36,'CZK','short','https://pid.cz/en/tickets-and-fare/'),
  fare('MY','Kuala Lumpur',1,'MYR','feeder','https://myrapid.com.my/resources/faqs/'),
  fare('VN','Hanoi',8000,'VND','starting','https://hanoi.gov.vn/chi-dao-cua-ubnd-thanh-pho-ha-noi/ban-hanh-phuong-an-ve-lien-thong-da-phuong-thuc-cho-he-thong-van-tai-hanh-khach-cong-cong-4250627181237776.htm'),
  fare('JP','Tokyo',180,'JPY','metro','https://www.tokyometro.jp/lang_en/ticket/types/regular/index.html'),
  fare('JP','Osaka',190,'JPY','metro','https://subway.osakametro.co.jp/en/guide/fare/fare/price.php'),
  fare('CH','Zurich',4.7,'CHF','zone','https://www.zvv.ch/en/travelcards-and-tickets/tickets/single-tickets.html'),
  fare('IS','Reykjavik',690,'ISK','bus','https://www.straeto.is/en/user-information/news/changes-in-price-list-at-straeto-6'),
  fare('CN','Beijing',3,'CNY','metro','https://english.beijing.gov.cn/specials/beijinglifeonthesubway/noticeforpassengers/202504/t20250423_4072294.html'),
  fare('KR','Seoul',1550,'KRW','metro','https://english.seoul.go.kr/policy/transportation/modes-of-transport/subway/'),
  fare('AT','Vienna',3.2,'EUR','busMetro','https://www.wienerlinien.at/web/wl-en/single-journey'),
  fare('GB','London',1.75,'GBP','bus','https://tfl.gov.uk/fares/find-fares/bus-and-tram-fares',{one:12.6,two:40.4,unit:'GBP',source:'https://content.tfl.gov.uk/taxi-fare-card-2026.pdf',distance:'2 miles'}),
  fare('US','New York City',3,'USD','busMetro','https://www.mta.info/fares-tolls/subway-bus'),
  fare('US','Los Angeles',1.75,'USD','metro','https://www.metro.net/fares/'),
  fare('US','San Francisco',2.85,'USD','bus','https://www.sfmta.com/getting-around/muni/fares'),
  fare('CA','Toronto',3.3,'CAD','busMetro','https://www.ttc.ca/en/Fares-and-passes'),
  fare('CA','Vancouver',3.5,'CAD','zone','https://www.translink.ca/monthlypass'),
  fare('AU','Melbourne',2.85,'AUD','twoHour','https://transport.vic.gov.au/news-and-resources/campaigns/your-guide-to-myki-fares'),
  fare('IN','Delhi',21,'INR','short','https://delhimetrorail.com/fare'),
  fare('DE','Berlin',4,'EUR','zone','https://www.bvg.de/en/subscriptions-and-tickets/all-tickets/single-tickets/single-ticket'),
  fare('PT','Lisbon',1.9,'EUR','busMetro','https://www.metrolisboa.pt/en/wp-content/uploads/sites/3/2025/12/Tarifas_site_2026_UK-1.pdf'),
  fare('NL','Amsterdam',3.4,'EUR','busMetro','https://www.gvb.nl/en/prices'),
  fare('ES','Madrid',1.5,'EUR','metro','https://www.crtm.es/comunicacion/sala-de-prensa/noticias/noticias/10092026-diaz-ayuso-anuncia-tarifa-unica-de-1-5-euros-para-el-billete-sencillo-de-la-zona-a-de-metro-desde-octubre/?lang=es'),
  fare('IT','Milan',2.2,'EUR','busMetro','https://www.atm.it/en/ViaggiaConNoi/Biglietti/Pages/tickets_milan.aspx'),
  fare('HU','Budapest',500,'HUF','busMetro','https://bkk.hu/en/tickets-and-passes/prices/'),
  fare('PL','Warsaw',3.4,'PLN','short','https://www.wtp.waw.pl/en/ticket-tariff/'),
  fare('GR','Athens',1.2,'EUR','busMetro','https://www.oasa.gr/en/tickets/products/ath-ena-ticket/'),
  fare('ID','Jakarta',3500,'IDR','bus','https://transjakarta.co.id/news/transjakarta-modifikasi-rute-sh2-blok-m-bandara-soekarno-hatta-perkuat-konektivitas-dan-kenyamanan-pelanggan'),
  fare('VN','Ho Chi Minh City',6000,'VND','starting','https://tphcm.chinhphu.vn/chot-gia-ve-di-tau-dien-metro-so-1-101241121125611214.htm'),
  fare('MA','Marrakesh',4,'MAD','bus','https://www.visitmarrakech.com/en/planning/Transportation/')
 ];
 window.QanshaTransport=Object.fromEntries(list.map(item=>[item.country+'|'+item.city,item]));
})();
