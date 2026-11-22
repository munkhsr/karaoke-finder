// Generated once at build time for the static export.
export const dynamic = 'force-static';
import catalogue from '../lib/catalogue.json';
import { songUrl } from '../lib/song-links.mjs';
export default function sitemap() {
  return ['/', '/hit-songs', '/image-credits', ...catalogue.map(songUrl)].map(path => ({
    url: `https://www.karaokehub.mn${path}`,
  }));
}
