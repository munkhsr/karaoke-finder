import { readFile, writeFile, mkdir } from 'node:fs/promises';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const context = vm.createContext({ window: {} });
for (const file of ['song-data.js','song-data-extra.js','song-data-extra-2.js','song-data-extra-3.js','song-data-extra-4.js','song-selections.js']) {
  vm.runInContext(await readFile(new URL(file,root),'utf8'),context,{filename:file});
}
const songs = vm.runInContext('[...window.karaokeSongs,...window.karaokeExtraSongs,...window.karaokeExtraSongs2,...window.karaokeExtraSongs3,...window.karaokeExtraSongs4]',context);
await mkdir(new URL('lib/',root),{recursive:true});
await writeFile(new URL('lib/catalogue.json',root),JSON.stringify(songs));
await writeFile(new URL('lib/selections.json',root),JSON.stringify(context.window.karaokeSelections));
console.log(`Exported ${songs.length} songs, ${context.window.karaokeSelections.hit.length} hit and ${context.window.karaokeSelections.new.length} new selections.`);
