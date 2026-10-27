import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildIndex,search,suggest,normalize} from '../lib/search.mjs';
const songs=JSON.parse(await readFile(new URL('../lib/catalogue.json',import.meta.url),'utf8'));
const index=buildIndex(songs);
test('GEE artist matches precede incidental transliteration matches',()=>{
  const results=search(songs,index,'gee');
  assert.ok(results.length);
  assert.match(results[0].artist,/\bGEE\b/i);
  const incidental=results.findIndex(song=>/MC COLLECTION/i.test(song.artist));
  if(incidental>=0)assert.ok(results.findIndex(song=>/\bGEE\b/i.test(song.artist))<incidental);
});
test('song and artist words can be searched together in either order',()=>{
  const sample={title:'ЭНЭ БОЛ ДУРЛАЛ БИШ',artist:'ХАРАНГА ХАМТЛАГ',code1:'',code2:'71349'};
  const other={title:'ДУРЛАЛ',artist:'БОЛД',code1:'12345',code2:''};
  const source=[other,sample],lookup=buildIndex(source);
  for(const query of ['haranga durlal','дурлал харанга','71349 haranga'])assert.deepEqual(search(source,lookup,query),[sample]);
  assert.deepEqual(search(source,lookup,'haranga bold'),[]);
});
test('exact codes and titles rank first and empty queries keep original order',()=>{
  const exact={title:'ХАЙР',artist:'БОЛД',code1:'38146',code2:''};
  const partial={title:'МИНИЙ ХАЙР',artist:'ӨӨР',code1:'138146',code2:''};
  const source=[partial,exact],lookup=buildIndex(source);
  assert.equal(search(source,lookup,'38146')[0],exact);
  assert.equal(search(source,lookup,'хайр')[0],exact);
  assert.deepEqual(search(source,lookup,''),source);
  assert.deepEqual(search(source,lookup,'!!!'),[]);
});

test('soft-sign Latin variants find the real catalogue without changing song URLs',()=>{
  const matches=search(songs,index,'амьдрал');
  assert.ok(matches.length);
  for(const query of ['amdral','amidral','amydral']) {
    const found=search(songs,index,query);
    for(const song of matches)assert.ok(found.includes(song),`${query}: ${song.title}`);
  }
});

test('suggestions handle insertion, deletion, substitution and swapped letters',()=>{
  const song={title:'BRATAN',artist:'ГАНГАА',code1:'38146',code2:'75226'};
  const source=[song],lookup=buildIndex(source);
  for(const query of ['bratann','bratn','braton','brtaan','братанн','bratann gangaa','bratann 75226']) {
    assert.deepEqual(search(source,lookup,query),[]);
    assert.deepEqual(suggest(source,lookup,query),[song],query);
  }
  for(const query of ['','!!!','bra','zzzzqqq987654','75227','bratann 75227','bratann bold'])assert.deepEqual(suggest(source,lookup,query),[],query);
  assert.deepEqual(suggest(source,lookup,'bratann','artist'),[]);
  assert.deepEqual(suggest(source,lookup,'bratann','code'),[]);
  assert.deepEqual(suggest(source,lookup,'bratann','title'),[song]);
  assert.equal(normalize('Амьдрал'),'amdral');
});
test('suggestions are limited, stable, and scoped to the supplied songs',()=>{
  const source=Array.from({length:12},(_,i)=>({title:'BRATAN',artist:`Artist ${i}`,code1:String(i),code2:''}));
  const lookup=buildIndex(source);
  assert.deepEqual(suggest(source,lookup,'bratann'),source.slice(0,6));
  assert.deepEqual(suggest(source.slice(8),lookup,'bratann'),source.slice(8));
});

test('closest whole title precedes a longer title for a misspelling',()=>{
 const source=[{title:'ЧИ МИНИЙ АМЬДРАЛ',artist:'A'},{title:'АМЬДРАЛ',artist:'B'}];
 assert.equal(suggest(source,buildIndex(source),'amdiral')[0],source[1]);
});

test('GA4 artist spellings find canonical credits and collaborations without matching titles',()=>{
  const kiwi=search(songs,index,'киви');
  assert.ok(kiwi.length);
  assert.deepEqual(search(songs,index,'Kiwi'),kiwi);
  const namsrai=search(songs,index,'намсрайноров');
  assert.ok(namsrai.length);
  assert.deepEqual(search(songs,index,'Namsarnorow'),namsrai);
  const source=[{title:'КИВИ',artist:'OTHER'},{title:'SONG',artist:'КИВИ ХАМТЛАГ'},{title:'DUET',artist:'БАЙДРАГ.Ц & КИВИ ХАМТЛАГ'}];
  const lookup=buildIndex(source);
  assert.deepEqual(search(source,lookup,'kiwi'),source.slice(1));
  assert.deepEqual(search(source,lookup,'kiwi','title'),[]);
  assert.deepEqual(search(source.slice(0,1),lookup,'kiwi'),[]);
  assert.deepEqual(search(songs,index,'Magnet Brain'),[]);
});

test('numeric title words tolerate missing spaces and punctuation but digits remain exact',()=>{
  const song={title:'1000 ШАЛТГААН',artist:'A',code1:'75166'};
  const source=[song],lookup=buildIndex(source);
  for(const q of ['1000шалтгаан','1000 shaltgaan','1000-шалтгаан','  1000   ШАЛТГААН  '])assert.deepEqual(search(source,lookup,q),source,q);
  assert.deepEqual(suggest(source,lookup,'1000 shaltgaanн','title'),source);
  assert.deepEqual(suggest(source,lookup,'1001 shaltgaann'),[]);
  assert.deepEqual(suggest(source,lookup,'75167'),[]);
});

test('exact multi-word title wins over repeated partial words and exact artist',()=>{
  const exact={title:'LOVE LOVE',artist:'B',code1:'12345'};
  const source=[{title:'LOVE LOVE AGAIN',artist:'LOVE LOVE'},{title:'OTHER',artist:'LOVE LOVE'},exact];
  const lookup=buildIndex(source);
  assert.equal(search(source,lookup,'love love')[0],exact);
  assert.equal(search(source,lookup,'12345')[0],exact);
});
