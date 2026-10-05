const letters = { а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'j',з:'z',и:'i',й:'i',к:'k',л:'l',м:'m',н:'n',о:'o',ө:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ү:'u',ф:'f',х:'h',ц:'ts',ч:'ch',ш:'sh',щ:'sh',ъ:'',ы:'i',ь:'',э:'e',ю:'yu',я:'ya' };
export function normalize(value) { return String(value).toLocaleLowerCase('mn').split('').map(c => letters[c] ?? c).join('').normalize('NFD').replace(/\p{Diacritic}/gu,''); }
export function relaxed(value) { return value.replace(/y/g,'i').replace(/([aeiou])\1+/g,'$1').replace(/[^a-z0-9]/g,''); }
export function codes(song, field) { return [...new Set([song[field], ...(song.alternateCodes?.[field] ?? [])].filter(Boolean))]; }
export function songKey(song) { return JSON.stringify([song.title,song.artist,song.code1,song.code2]); }
export function buildIndex(songs) {
  return new Map(songs.map(song => [song, Object.fromEntries([
    ['title',[song.title]],['artist',[song.artist]],['code',[...codes(song,'code1'),...codes(song,'code2')]],
  ].map(([field,values]) => [field,values.map(v => { const n = normalize(v); return { normalized:n, relaxed:relaxed(n) }; })]))]));
}
export function search(songs, index, query, field='all') {
  const n = normalize(query.trim()); const r = relaxed(n);
  if (!n) return songs;
  return songs.filter(song => {
    const entry = index.get(song);
    const values = field === 'all' ? Object.values(entry).flat() : entry[field];
    return values.some(v => v.normalized.includes(n) || (r && v.relaxed.includes(r)));
  });
}
export function selectGroup(songs, selections) {
  const lookup = new Map(songs.map(s => [songKey(s),s]));
  return selections.map(s => lookup.get(songKey(s))).filter(Boolean);
}
