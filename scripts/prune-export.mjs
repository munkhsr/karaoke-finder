// Runs after `next build` (static export). Cloudflare Pages allows 20,000 files
// per deployment on the free plan, and each song page otherwise ships four
// client-navigation payloads next to its HTML. Song pages are only reached by
// full page loads (QR codes, search engines, shared links; in-app taps open a
// dialog instead), so only their HTML is kept.
import { readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

const songsDir = join('out', 'songs');
let removed = 0;
for (const entry of await readdir(songsDir, { withFileTypes: true })) {
  if (entry.isDirectory() || entry.name.endsWith('.txt')) {
    await rm(join(songsDir, entry.name), { recursive: true, force: true });
    removed++;
  }
}
console.log(`Pruned ${removed} song navigation payloads; song HTML pages kept.`);
