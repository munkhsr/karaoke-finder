import {readFile,writeFile} from 'node:fs/promises';
import {createSign} from 'node:crypto';
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
const response=await fetch('https://analyticsdata.googleapis.com/v1beta/properties/558397976:runReport',{method:'POST',headers:{Authorization:`Bearer ${access_token}`,'Content-Type':'application/json'},body:JSON.stringify({dateRanges:[{startDate:day(-7),endDate:day(-1)}],dimensions:[{name:'customEvent:song_title'}],metrics:[{name:'totalUsers'}],dimensionFilter:{filter:{fieldName:'eventName',stringFilter:{matchType:'EXACT',value:'song_code_view'}}},orderBys:[{metric:{metricName:'totalUsers'},desc:true}],limit:10000})});
if(!response.ok)throw new Error('GA4 report failed; existing selections retained');
const report=await response.json();
if(report.dataLossFromOtherRow)throw new Error('Incomplete GA4 ranking; existing selections retained');
const catalogue=JSON.parse(await readFile('lib/catalogue.json','utf8'));

const ranked=[];
for(const row of report.rows||[]) {
 const title=row.dimensionValues[0].value;
 const matches=catalogue.filter(song=>song.title.slice(0,100)===title);
 // Title-only analytics cannot safely identify songs with duplicate names.
 if(matches.length!==1)continue;
 if(Number(row.metricValues[0].value)>0)ranked.push(matches[0]);
}
if(ranked.length<50)throw new Error('Fewer than 50 unambiguous ranked songs; existing selections retained');
await writeFile('lib/weekly-hits.json',JSON.stringify({updatedAt:local,startDate:day(-7),endDate:day(-1),hit:ranked.slice(0,50)},null,2)+'\n');
console.log(`Updated 50 songs using ${day(-7)} through ${day(-1)}. Duplicate titles excluded.`);
