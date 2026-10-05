import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { buildIndex, search, codes, selectGroup } from '../lib/search.mjs';
const root = new URL('../',import.meta.url);
const songs=JSON.parse(await readFile(new URL('lib/catalogue.json',root),'utf8'));
const selections=JSON.parse(await readFile(new URL('lib/selections.json',root),'utf8'));
const index=buildIndex(songs);
test('migration preserves all original songs, alternate codes and selections',async()=>{
  const context=vm.createContext({window:{}});
  for(const file of ['song-data.js','song-data-extra.js','song-data-extra-2.js','song-data-extra-3.js','song-data-extra-4.js','song-selections.js'])vm.runInContext(await readFile(new URL(file,root),'utf8'),context);
  const original=vm.runInContext('[...window.karaokeSongs,...window.karaokeExtraSongs,...window.karaokeExtraSongs2,...window.karaokeExtraSongs3,...window.karaokeExtraSongs4]',context);
  assert.deepEqual(songs,JSON.parse(JSON.stringify(original)));
  assert.deepEqual(selections,JSON.parse(JSON.stringify(context.window.karaokeSelections)));
  for(const group of ['hit','new'])assert.equal(selectGroup(songs,selections[group]).length,50);
});
test('Cyrillic and Latin searches return the same songs',()=>{
  const cyrillic=search(songs,index,'хайр');
  assert(cyrillic.length>0);
  assert.deepEqual(search(songs,index,'hair'),cyrillic);
});
test('every available primary and alternate code is searchable',()=>{
  const examples=[songs.find(s=>s.code1),songs.find(s=>s.code2),songs.find(s=>s.alternateCodes)].filter(Boolean);
  for(const song of examples)for(const field of ['code1','code2'])for(const code of codes(song,field))assert(search(songs,index,String(code),'code').includes(song));
});
test('field filters do not confuse artists with titles or codes',()=>{
  const sample={title:'UniqueTitle',artist:'UniqueArtist',code1:'987654321',code2:''};
  const sampleIndex=buildIndex([sample]);
  assert.equal(search([sample],sampleIndex,'UniqueArtist','title').length,0);
  assert.equal(search([sample],sampleIndex,'UniqueArtist','artist').length,1);
  assert.equal(search([sample],sampleIndex,'987654321','code').length,1);
  assert.equal(search(songs,index,'ZZZZ-no-match-999').length,0);
});
