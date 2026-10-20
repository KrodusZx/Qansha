/** World-wide airport autocomplete.
 * Airport and city names: OpenFlights airport data (ODbL 1.0), https://openflights.org/data.html
 * Public, periodically updated static list; not proof a scheduled flight serves an airport.
 * Small in-memory cache avoids re-downloading on warm invocations.
 */
const SOURCES=[
  'https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat',
  'https://cdn.jsdelivr.net/gh/jpatokal/openflights@master/data/airports.dat'
];
let airports=null;
let expiresAt=0;
const countries=new Intl.DisplayNames(['en'],{type:'region'});
const russianCountries=new Intl.DisplayNames(['ru'],{type:'region'});
const normalize=s=>String(s||'').normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const transliterate=s=>normalize(s).replace(/[а-яё]/g,c=>({а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'kh',ц:'ts',ч:'ch',ш:'sh',щ:'shch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya'}[c]||c));
const RU_ALIASES={NQZ:'астана',ALA:'алматы',CIT:'шымкент',TAS:'ташкент',BSZ:'бишкек',FRU:'бишкек',DYU:'душанбе',GYD:'баку',TBS:'тбилиси',EVN:'ереван',DXB:'дубай',IST:'стамбул',SAW:'стамбул',CDG:'париж',ORY:'париж',LHR:'лондон',LGW:'лондон',FCO:'рим',BCN:'барселона',ZRH:'цюрих',GVA:'женева',KEF:'рейкьявик',PEK:'пекин',PKX:'пекин',SHA:'шанхай',PVG:'шанхай',HKG:'гонконг',SZX:'шэньчжэнь',CAN:'гуанчжоу',SIN:'сингапур',HND:'токио',NRT:'токио',ICN:'сеул',JFK:'нью йорк',EWR:'нью йорк',LAX:'лос анджелес',MUC:'мюнхен',AMS:'амстердам',VIE:'вена',PRG:'прага',BER:'берлин',KUL:'куала лумпур',BKK:'бангкок',HKT:'пхукет',DAD:'дананг'};
// Parses CSV including quoted names with commas, escaped double quotes and null markers.
function parseLine(line){let result=[],cell='',quoted=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(quoted&&line[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){result.push(cell);cell='';}else cell+=c;}result.push(cell);return result;}
const countryCodes=(()=>{const map=new Map();for(let i=65;i<=90;i++)for(let j=65;j<=90;j++){const code=String.fromCharCode(i,j);const name=countries.of(code);if(name&&name!==code)map.set(normalize(name),code);}map.set('russia','RU');map.set('united states','US');map.set('united kingdom','GB');map.set('south korea','KR');return map;})();
async function retrieve(){if(airports&&Date.now()<expiresAt)return airports;let csv=null;for(const url of SOURCES){try{const c=new AbortController(),t=setTimeout(()=>c.abort(),9500);try{const response=await fetch(url,{signal:c.signal});if(!response.ok)throw Error('source');csv=await response.text();if(csv.length>100000)break;csv=null;}finally{clearTimeout(t)}}catch{/* try mirror */}}
if(!csv){if(airports)return airports;throw Error('Airport database temporarily unavailable');}
const byCode=new Map();for(const line of csv.split(/\r?\n/)){if(!line)continue;const row=parseLine(line);const code=row[4],city=row[2],airport=row[1],country=row[3];if(!/^[A-Z]{3}$/.test(code||'')||!city||!country||row[12]&&row[12]!=='airport')continue;
const cc=countryCodes.get(normalize(country))||'';const value={code,city,airport,country:cc,englishCountry:country};if(!byCode.has(code))byCode.set(code,value);
}airports=[...byCode.values()];expiresAt=Date.now()+86400000;return airports;}
module.exports=async(req,res)=>{res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','public, s-maxage=3600');if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});const term=normalize(req.query.q||'').slice(0,90);if(!term)return res.status(200).json({results:[]});try{const list=await retrieve();const en=transliterate(term);const found=[];for(const a of list){const alias=RU_ALIASES[a.code]||'',city=normalize(a.city),airport=normalize(a.airport),country=normalize(a.englishCountry),ru=a.country?normalize(russianCountries.of(a.country)):'';
const values=[a.code.toLowerCase(),city,airport,country,ru,alias,transliterate(alias)];if(!values.some(x=>x.includes(term)||x.includes(en)))continue;
let score=(a.code.toLowerCase()===term?1000:0)+(city.startsWith(term)||city.startsWith(en)?180:0)+(alias&&alias.includes(term)?160:0)+(airport.includes('international')?30:0)+(country===term||ru===term?70:0);
found.push({...a,score});}found.sort((a,b)=>b.score-a.score||a.city.localeCompare(b.city));return res.status(200).json({results:found.slice(0,17),total:found.length});}
catch{return res.status(503).json({error:'Поиск аэропортов временно недоступен. Попробуйте название крупного города.'});}};
