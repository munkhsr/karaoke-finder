const letters = { а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'j',з:'z',и:'i',й:'i',к:'k',л:'l',м:'m',н:'n',о:'o',ө:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ү:'u',ф:'f',х:'h',ц:'ts',ч:'ch',ш:'sh',щ:'sh',ъ:'',ы:'i',ь:'',э:'e',ю:'yu',я:'ya' };
export function normalize(value) { return String(value).toLocaleLowerCase('mn').split('').map(c => letters[c] ?? c).join('').normalize('NFD').replace(/\p{Diacritic}/gu,''); }
export function relaxed(value) { return value.replace(/y/g,'i').replace(/([aeiou])\1+/g,'$1').replace(/[^a-z0-9]/g,''); }
export function codes(song, field) { return [...new Set([song[field], ...(song.alternateCodes?.[field] ?? [])].filter(Boolean))]; }
export function songKey(song) { return JSON.stringify([song.title,song.artist,song.code1,song.code2]); }
export function buildIndex(songs) {
  return new Map(songs.map(song => [song, Object.fromEntries([
    ['title',[song.title]],['artist',[song.artist]],['code',[...codes(song,'code1'),...codes(song,'code2')]],
  ].map(([field,values]) => [field,values.map(v => { const n = normalize(v); return { normalized:n, relaxed:relaxed(n), words:n.split(/[^a-z0-9]+/).filter(Boolean) }; })]))]));
}
function matchScore(value, term, field, wordOnly=false) {
  const compact=relaxed(term);
  if(value.normalized===term)return field==='code'?1500:1200;
  if(value.words.includes(term))return 900;
  if(value.words.some(word=>word.startsWith(term)))return 700;
  if(value.normalized.includes(term))return 300;
  if(!compact)return 0;
  if(value.relaxed===compact)return field==='code'?1400:1000;
  if(value.words.some(word=>relaxed(word)===compact))return 800;
  if(value.words.some(word=>relaxed(word).startsWith(compact)))return 600;
  return (wordOnly?value.words.some(word=>relaxed(word).includes(compact)):value.relaxed.includes(compact))?100:0;
}
export function search(songs, index, query, field='all') {
  const n = normalize(query.trim()).replace(/\s+/g,' ');
  if (!n) return songs;
  const terms=n.split(/[^a-z0-9]+/).filter(Boolean);
  if(!terms.length)return [];
  return songs.map((song,position) => {
    const entry = index.get(song);
    const fields=field==='all'?Object.entries(entry):[[field,entry[field]||[]]];
    const best=(term,wordOnly=false)=>Math.max(0,...fields.flatMap(([name,values])=>values.map(value=>matchScore(value,term,name,wordOnly))));
    const scores=terms.map(term=>best(term,terms.length>1));
    const phrase=best(n);
    // All words must match, including queries combining a song and its artist.
    // A full phrase can also match punctuation or spaces written differently.
    const score=scores.every(Boolean)?scores.reduce((sum,value)=>sum+value,0)+(terms.length>1?phrase:0):phrase;
    return {song,position,score};
  }).filter(result=>result.score>0).sort((a,b)=>b.score-a.score||a.position-b.position).map(result=>result.song);
}
export function selectGroup(songs, selections) {
  const lookup = new Map(songs.map(s => [songKey(s),s]));
  return selections.map(s => lookup.get(songKey(s))).filter(Boolean);
}
