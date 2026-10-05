import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildIndex,search} from '../lib/search.mjs';
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
