import { normalize } from './search.mjs';

export function songSlug(song) {
  const name=normalize(song.title).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80)||'song';
  return `${name}-${song.code1||'none'}-${song.code2||'none'}`;
}
export function songUrl(song) { return `/songs/${songSlug(song)}`; }
