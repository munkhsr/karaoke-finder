import catalogue from '../lib/catalogue.json';
import { songUrl } from '../lib/song-links.mjs';
export default function sitemap() {
  return ['/', '/hit-songs', '/new-songs', '/image-credits', ...catalogue.map(songUrl)].map(path => ({
    url: `https://www.karaokehub.mn${path}`,
  }));
}
