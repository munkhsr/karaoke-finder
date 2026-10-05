import { test } from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { artists, artistImage } from '../lib/artists.mjs';
test('credited artist aliases match without misidentifying unrelated names',()=>{
  assert.equal(artistImage('ХУРД ХАМТЛАГ')?.id,'hurd');
  assert.equal(artistImage('ROKIT BAY & БОЛД.Д')?.id,'rokitbay');
  assert.equal(artistImage('НАРАН.С')?.id,'naran');
  assert.equal(artistImage('ХАРАНГА ХАМТЛАГ')?.id,'haranga');
  assert.equal(artistImage('НАРАНБААТАР'),null);
  assert.equal(artistImage('БОЛД.Д & ROKIT BAY')?.id,'bold-d');
  assert.equal(artistImage('БОЛД.Б'),null);
  assert.equal(artistImage('АРИУНАА.Т')?.id,'ariunaa');
  assert.equal(artistImage('БОЛДБААТАР.Ж'),null);
  assert.equal(artistImage('БАТСҮХ.Д'),null);
  assert.equal(artistImage('ICE TOP ХАТТЛАГ')?.id,'icetop');
});
test('collaborations use the first available credited artist photo',()=>{
  assert.equal(artistImage('FLA & ЭНЭРЭЛ')?.id,'enerel');
  assert.equal(artistImage('FLA feat. ЭНЭРЭЛ')?.id,'enerel');
  assert.equal(artistImage('БОЛД.Б & МӨНГӨНЦЭЦЭГ.Х')?.id,'munguntsetseg');
  assert.equal(artistImage('BX & ЭНЭРЭЛ & ЦЭЦЭ')?.id,'bx');
  assert.equal(artistImage('FLA & БАТ-ЭНЭРЭЛ.Б'),null);
  assert.equal(artistImage('FLA & НАРАНБААТАР'),null);
});
test('every registered photo has a local image and attribution',async()=>{
  for(const artist of artists){
    assert(artist.providedByUser || (artist.author && artist.source && artist.license));
    const file=new URL('../public'+artist.src,import.meta.url);
    await access(file);
    const data=await readFile(file);
    assert(data.length>1000);
    assert(data[0]===0xff || data.subarray(1,4).toString()==='PNG' || (data.subarray(0,4).toString()==='RIFF' && data.subarray(8,12).toString()==='WEBP'));
  }
});
