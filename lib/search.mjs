const letters = { а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'j',з:'z',и:'i',й:'i',к:'k',л:'l',м:'m',н:'n',о:'o',ө:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ү:'u',ф:'f',х:'h',ц:'ts',ч:'ch',ш:'sh',щ:'sh',ъ:'',ы:'i',ь:'',э:'e',ю:'yu',я:'ya' };
export function normalize(value) { return String(value).toLocaleLowerCase('mn').split('').map(c => letters[c] ?? c).join('').normalize('NFD').replace(/\p{Diacritic}/gu,''); }
// Common Latin spellings: Kiwi/Киви, Lumino/Люмино, Camerton/Камертон, Rockit/Rokit.
export function relaxed(value) { return value.replace(/yu/g,'u').replace(/ck/g,'k').replace(/c(?!h)/g,'k').replace(/w/g,'v').replace(/y/g,'i').replace(/([aeiou])\1+/g,'$1').replace(/[^a-z0-9]/g,''); }
export function codes(song, field) { return [...new Set([song[field], ...(song.alternateCodes?.[field] ?? [])].filter(Boolean))]; }
export function songKey(song) { return JSON.stringify([song.title,song.artist,song.code1,song.code2]); }
export function buildIndex(songs) {
  return new Map(songs.map(song => [song, Object.fromEntries([
    ['title',[song.title]],['artist',[song.artist]],['code',[...codes(song,'code1'),...codes(song,'code2')]],
  ].map(([field,values]) => [field,[...new Set(values.flatMap(v => field==='code'?[v]:[v,String(v).replace(/ь/gi,'i')]))].map(v => {
    const n = normalize(v), words = n.split(/[^a-z0-9]+/).filter(Boolean);
    // Relaxed word forms are computed once here instead of on every keystroke.
    return { normalized:n, relaxed:relaxed(n), words, relaxedWords:words.map(relaxed) };
  })]))]));
}
function matchScore(value, term, compact, field, wordOnly=false) {
  if(value.normalized===term)return field==='code'?1500:1200;
  if(value.words.includes(term))return 900;
  if(value.words.some(word=>word.startsWith(term)))return 700;
  if(value.normalized.includes(term))return 300;
  if(!compact)return 0;
  if(value.relaxed===compact)return field==='code'?1400:1000;
  if(value.relaxedWords.includes(compact))return 800;
  if(value.relaxedWords.some(word=>word.startsWith(compact)))return 600;
  return (wordOnly?value.relaxedWords.some(word=>word.includes(compact)):value.relaxed.includes(compact))?100:0;
}
const fieldNames=['title','artist','code'];
export function search(songs, index, query, field='all') {
  const n = normalize(query.trim()).replace(/\s+/g,' ');
  if (!n) return songs;
  const terms=n.split(/[^a-z0-9]+/).filter(Boolean);
  if(!terms.length)return [];
  const names=field==='all'?fieldNames:[field];
  const wordOnly=terms.length>1;
  const compacts=terms.map(relaxed), phraseCompact=relaxed(n);
  function best(entry,term,compact,onlyWords) {
    let top=0;
    for(const name of names)for(const value of entry[name]||[]){const score=matchScore(value,term,compact,name,onlyWords);if(score>top)top=score;}
    return top;
  }
  const results=[];
  songs.forEach((song,position) => {
    const entry = index.get(song);
    let sum=0, all=true;
    for(let i=0;i<terms.length;i++){const score=best(entry,terms[i],compacts[i],wordOnly);if(!score){all=false;break;}sum+=score;}
    // All words must match, including queries combining a song and its artist.
    // A full phrase can also match punctuation or spaces written differently.
    const score=all?sum+(wordOnly?best(entry,n,phraseCompact,false):0):best(entry,n,phraseCompact,false);
    if(score>0)results.push({song,position,score});
  });
  return results.sort((a,b)=>b.score-a.score||a.position-b.position).map(result=>result.song);
}
// Bounded Damerau-Levenshtein distance includes adjacent swapped letters.
function editDistance(a, b, maximum) {
  if (Math.abs(a.length-b.length)>maximum) return maximum+1;
  let previousPrevious;
  let previous=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++) {
    const current=[i];
    for(let j=1;j<=b.length;j++) {
      current[j]=Math.min(previous[j]+1,current[j-1]+1,previous[j-1]+(a[i-1]===b[j-1]?0:1));
      if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])current[j]=Math.min(current[j],previousPrevious[j-2]+1);
    }
    previousPrevious=previous;
    previous=current;
  }
  return previous[b.length];
}

// Keep approximate results separate from real matches and analytics counts.
export function suggest(songs, index, query, field='all', limit=6) {
  const terms=normalize(query.trim()).split(/[^a-z0-9]+/).filter(Boolean).map(relaxed);
  if(!terms.length||field==='code'||!terms.some(term=>/^[a-z]{4,}$/.test(term)))return [];
  const distances=new Map();
  function distance(term, word) {
    const maximum=term.length>=8?2:1;
    const key=`${term}:${word}`;
    if(!distances.has(key))distances.set(key,editDistance(term,word,maximum));
    return distances.get(key);
  }
  return songs.map((song,position)=>{
    const entry=index.get(song);
    const names=field==='all'?['title','artist']:[field];
    const words=[...new Set(names.flatMap(name=>(entry[name]||[]).flatMap(value=>value.relaxedWords)))];
    let total=0, approximate=false;
    for(const term of terms) {
      // Numeric tokens must match actual codes; never suggest a nearby code.
      if(/^[0-9]+$/.test(term)) {
        if(field!=='all'||!entry.code.some(value=>value.words.includes(term)))return null;
        continue;
      }
      if(words.includes(term))continue;
      if(!/^[a-z]{4,}$/.test(term))return null;
      const maximum=term.length>=8?2:1;
      let best=maximum+1;
      for(const word of words) {
        if(word.length<4||Math.abs(word.length-term.length)>maximum)continue;
        best=Math.min(best,distance(term,word));
        if(best===0)break;
      }
      if(best>maximum)return null;
      total+=best;
      approximate=approximate||best>0;
    }
    const titleDistance=Math.min(...entry.title.map(value=>editDistance(value.relaxed,terms.join(''),2)));
    const titleWords=Math.min(...entry.title.map(value=>value.words.length));
    return approximate?{song,position,total,titleDistance,titleWords}:null;
  }).filter(Boolean).sort((a,b)=>a.total-b.total||a.titleDistance-b.titleDistance||a.titleWords-b.titleWords||a.position-b.position).slice(0,limit).map(result=>result.song);
}
export function selectGroup(songs, selections) {
  const lookup = new Map(songs.map(s => [songKey(s),s]));
  return selections.map(s => lookup.get(songKey(s))).filter(Boolean);
}
