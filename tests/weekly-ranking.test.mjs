import {test} from 'node:test';
import assert from 'node:assert/strict';
import {rankWeeklyHits, HIT_COUNT} from '../lib/weekly-ranking.mjs';

const song=(title,artist)=>({title,artist,code1:'',code2:''});
const a=song('ДУУ А','ДУУЧИН 1'), b=song('ДУУ Б','ДУУЧИН 2'), c1=song('ДАВХАР','ДУУЧИН 3'), c2=song('ДАВХАР','ДУУЧИН 4');
const catalogue=[a,b,c1,c2];

test('weekly hits keep 33 songs',()=>assert.equal(HIT_COUNT,33));

test('songs are ranked by code views, then users',()=>{
  const rows=[{title:'ДУУ А',views:5,users:5},{title:'ДУУ Б',views:9,users:2}];
  assert.deepEqual(rankWeeklyHits(catalogue,rows,2),[b,a]);
  const tie=[{title:'ДУУ А',views:5,users:4},{title:'ДУУ Б',views:5,users:1}];
  assert.deepEqual(rankWeeklyHits(catalogue,tie,2),[a,b]);
});

test('shared titles need the artist; title-only rows for them are skipped',()=>{
  const titleOnly=[{title:'ДАВХАР',views:50,users:40},{title:'ДУУ А',views:1,users:1}];
  assert.deepEqual(rankWeeklyHits(catalogue,titleOnly,1),[a]);
  const withArtist=[{title:'ДАВХАР',artist:'ДУУЧИН 4',views:50,users:40},{title:'ДУУ А',artist:'(not set)',views:1,users:1}];
  assert.deepEqual(rankWeeklyHits(catalogue,withArtist,2),[c2,a]);
});

test('rows for the same song are added together and unknown titles ignored',()=>{
  const rows=[{title:'ДУУ А',artist:'ДУУЧИН 1',views:3,users:3},{title:'ДУУ А',artist:'(not set)',views:3,users:2},{title:'ДУУ Б',views:5,users:5},{title:'БАЙХГҮЙ',views:99,users:99},{title:'(not set)',views:99,users:99}];
  assert.deepEqual(rankWeeklyHits(catalogue,rows,2),[a,b]);
});

test('too few identifiable songs keeps the previous list',()=>{
  assert.throws(()=>rankWeeklyHits(catalogue,[{title:'ДУУ А',views:1,users:1}],2),/Only 1 identifiable songs; need 2/);
});
