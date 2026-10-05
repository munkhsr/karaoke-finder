import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {songSlug,songUrl} from '../lib/song-links.mjs';
const songs=JSON.parse(await readFile(new URL('../lib/catalogue.json',import.meta.url),'utf8'));
test('every song has a unique URL safe slug',()=>{
  const slugs=songs.map(songSlug);
  assert.equal(new Set(slugs).size,songs.length);
  assert.ok(slugs.every(slug=>/^[a-z0-9-]+$/.test(slug)));
  assert.ok(songs.every(song=>songUrl(song)===`/songs/${songSlug(song)}`));
});
