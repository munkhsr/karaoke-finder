import { test } from 'node:test';
import assert from 'node:assert/strict';
import { favoriteKey, restoreFavorites } from '../lib/favorites.mjs';
test('saved songs survive artist corrections and old favorites migrate',()=>{
  const song={title:'TENGRI',artist:'THUNDERZ',code1:'38089',code2:'75169'};
  const old=JSON.stringify(['TENGRI','THUNDER',song.code1,song.code2]);
  assert.deepEqual(restoreFavorites([old,favoriteKey(song),'broken',null], [song]),[favoriteKey(song)]);
  assert.equal(favoriteKey(song),favoriteKey({...song,artist:'Corrected artist'}));
  assert.deepEqual(restoreFavorites({},[song]),[]);
});
