import {readFile,writeFile} from 'node:fs/promises';
import {createSign} from 'node:crypto';
import {rankWeeklyHits} from '../lib/weekly-ranking.mjs';
const local=new Date(Date.now()+8*3600000).toISOString().slice(0,10);
if(local<'2026-11-02') { console.log('Weekly ranking starts November 2, 2026.'); process.exit(0); }
if(new Date(local+'T00:00:00Z').getUTCDay()!==1)throw new Error('Only Monday updates are permitted');
const credentials=JSON.parse(process.env.GA4_SERVICE_ACCOUNT_JSON||'null');
if(!credentials?.client_email||!credentials?.private_key)throw new Error('GA4_SERVICE_ACCOUNT_JSON is required');
const encode=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
const now=Math.floor(Date.now()/1000);
const unsigned=encode({alg:'RS256',typ:'JWT'})+'.'+encode({iss:credentials.client_email,scope:'https://www.googleapis.com/auth/analytics.readonly',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600});
const signature=createSign('RSA-SHA256').update(unsigned).sign(credentials.private_key,'base64url');
const auth=await fetch('https://oauth2.googleapis.com/token',{method:'POST',body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:unsigned+'.'+signature})});
if(!auth.ok)throw new Error('Google authentication failed');
const {access_token}=await auth.json();
const day=offset=>new Date(Date.parse(local+'T00:00:00Z')+offset*86400000).toISOString().slice(0,10);
// Rank by code views. Use the artist dimension when it is registered in GA4
// so songs sharing a title can be told apart; otherwise rank by title alone.
async function report(dimensions) {
  return fetch('https://analyticsdata.googleapis.com/v1beta/properties/558397976:runReport',{method:'POST',headers:{Authorization:`Bearer ${access_token}`,'Content-Type':'application/json'},body:JSON.stringify({dateRanges:[{startDate:day(-7),endDate:day(-1)}],dimensions:dimensions.map(name=>({name})),metrics:[{name:'eventCount'},{name:'totalUsers'}],dimensionFilter:{filter:{fieldName:'eventName',stringFilter:{matchType:'EXACT',value:'song_code_view'}}},orderBys:[{metric:{metricName:'eventCount'},desc:true}],limit:10000})});
}
let response=await report(['customEvent:song_title','customEvent:artist']);
const withArtist=response.ok;
if(!withArtist&&response.status===400)response=await report(['customEvent:song_title']);
if(!response.ok)throw new Error('GA4 report failed; existing selections retained');
const data=await response.json();
if(data.dataLossFromOtherRow)throw new Error('Incomplete GA4 ranking; existing selections retained');
const catalogue=JSON.parse(await readFile('lib/catalogue.json','utf8'));
const rows=(data.rows||[]).map(row=>({title:row.dimensionValues[0].value,artist:withArtist?row.dimensionValues[1].value:null,views:row.metricValues[0].value,users:row.metricValues[1].value}));
let hit;
try { hit=rankWeeklyHits(catalogue,rows); } catch(error) { throw new Error(`${error.message}; existing selections retained`); }
await writeFile('lib/weekly-hits.json',JSON.stringify({updatedAt:local,startDate:day(-7),endDate:day(-1),hit},null,2)+'\n');
console.log(`Updated ${hit.length} songs by code views, ${day(-7)} through ${day(-1)}${withArtist?'':' (title only; duplicate titles excluded)'}.`);
