import artists from './artist-images.json' with { type: 'json' };
import { normalize } from './search.mjs';
export { artists };
const identity = value => normalize(value).replace(/[^a-z0-9]/g, '');
const byAlias = new Map(artists.flatMap(artist => artist.aliases.map(alias => [identity(alias),artist])));
export function artistImage(name) {
  // Prefer the first credited artist with a photo; match whole names only.
  const credited = String(name).split(/\s*(?:&|\bfeat\.?|\bfeaturing\b)\s*/i);
  for (const artist of credited) {
    const photo = byAlias.get(identity(artist));
    if (photo) return photo;
  }
  return null;
}
