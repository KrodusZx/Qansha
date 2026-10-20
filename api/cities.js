const {charge}=require('../lib/security');
/** Qansha worldwide city search. GeoNames-derived world cities, CC BY 4.0.
 * Data attribution: https://www.geonames.org/ — source:
 * https://github.com/datasets/world-cities (cities >15k people, plus capitals).
 * Search is local to our deployment: no third-party autocomplete API calls.
 */
const fs=require('node:fs'),path=require('node:path');
const normalize=x=>String(x||'').normalize('NFKD').toLocaleLowerCase().replace(/[\u0300-\u036f]/g,'').replace(/ё/g,'е').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const aliases={'осака':'osaka','киев':'kyiv','київ':'kyiv','минск':'minsk','париж':'paris','лондон':'london','токио':'tokyo','пекин':'beijing','шэньчжэнь':'shenzhen','шанхай':'shanghai','гуанчжоу':'guangzhou','гуааңчжоу':'guangzhou','нью йорк':'new york','лос анджелес':'los angeles','астана':'astana','алматы':'almaty','шымкент':'shymkent','стамбул':'istanbul','банкок':'bangkok','бангкок':'bangkok','тбилиси':'tbilisi','баку':'baku','ташкент':'tashkent','бишкек':'bishkek','душанбе':'dushanbe','дубай':'dubai','рим':'rome','милан':'milan','барселона':'barcelona','мадрид':'madrid','прага':'prague','берлин':'berlin','мюнхен':'munich','варшава':'warsaw','амстердам':'amsterdam','венa':'vienna','вена':'vienna','цюрих':'zurich','женева':'geneva','рейкьявик':'reykjavik','сингапур':'singapore','сеул':'seoul','пусан':'busan','киото':'kyoto','осака':'osaka','куала лумпур':'kuala lumpur','дананг':'da nang','хошимин':'ho chi minh city','ханой':'hanoi','пхукет':'phuket','каир':'cairo','александрия':'alexandria','сидней':'sydney','мельбурн':'melbourne','торонто':'toronto','монреаль':'montreal','ванкувер':'vancouver','лима':'lima','мехико':'mexico city','сан паулу':'sao paulo','рио де жанейро':'rio de janeiro','тегеран':'tehran','дели':'delhi','мумбаи':'mumbai'};
const translit=x=>x.replace(/[а-яё]/g,c=>({а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'kh',ц:'ts',ч:'ch',ш:'sh',щ:'shch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya'}[c]||c));
const favorites=['Paris|FR','Bangkok|TH','Tokyo|JP','Istanbul|TR','New York City|US','London|GB','Dubai|AE','Astana|KZ','Almaty|KZ','Tbilisi|GE','Tashkent|UZ','Baku|AZ','Rome|IT','Barcelona|ES','Berlin|DE','Beijing|CN','Seoul|KR','Singapore|SG','Zurich|CH','Reykjavík|IS','Kuala Lumpur|MY','Vienna|AT','Prague|CZ','Sydney|AU','Toronto|CA','Cairo|EG','Mumbai|IN','São Paulo|BR'];
let records,codes;
function load(){if(records)return;const raw=fs.readFileSync(path.join(__dirname,'../data/world-cities.tsv'),'utf8');
 records=raw.trim().split(/\r?\n/).map((line,i)=>{const [city,country,region]=line.split('|');return {id:'g'+i,city,country,region:region||'',n:normalize(city)};}).filter(p=>p.city&&/^[A-Z]{2}$/.test(p.country));
 codes=[...new Set(records.map(p=>p.country))].sort();}
function search(text,country){const q=normalize(text),alias=aliases[q]||(/[а-яё]/.test(q)?translit(q):''),matches=[];
 for(const p of records){if(country&&p.country!==country)continue;
 const priority=favorites.indexOf(p.city+'|'+p.country);let score=priority>=0?500-priority:0;
 if(q){if(p.n===q||alias&&p.n===alias)score+=5000;else if(p.n.startsWith(q)||alias&&p.n.startsWith(alias))score+=2900;else if(p.n.includes(q)||alias&&p.n.includes(alias))score+=1600;else continue;}
 else if(priority<0&&!country)continue;
 matches.push({id:p.id,city:p.city,country:p.country,region:p.region,score});
 }
 matches.sort((a,b)=>b.score-a.score||a.city.localeCompare(b.city));
 return matches.slice(0,24).map(({score,...x})=>x);
}
module.exports=async(req,res)=>{
 res.setHeader('Content-Type','application/json; charset=utf-8');
 res.setHeader('Cache-Control','public, s-maxage=86400, stale-while-revalidate=86400');
 if(!charge(req,res,{scope:'cities'}))return;
 try{load();if(req.query.mode==='countries')return res.status(200).json({countries:codes,totalCities:records.length,source:'GeoNames / CC BY 4.0'});
 const term=String(req.query.q||'').trim().slice(0,80),country=String(req.query.country||'').toUpperCase();
 if(country&&(!/^[A-Z]{2}$/.test(country)||!codes.includes(country)))return res.status(400).json({error:'Неизвестная страна'});
 if(term&&normalize(term).length<2)return res.status(200).json({results:[],moreRequired:true});
 return res.status(200).json({results:search(term,country),totalCities:records.length,source:'GeoNames / CC BY 4.0'});
 }catch(e){return res.status(503).json({error:'Справочник городов временно недоступен.'})}
};
