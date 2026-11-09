// Weekly hit list: the songs whose codes were viewed most in the previous week.
export const HIT_COUNT = 33;

const clip = value => String(value ?? '').slice(0, 100);
const known = value => value && value !== '(not set)';

// rows: [{ title, artist?, views, users }] from GA4 song_code_view events.
// Analytics stores only the first 100 characters of a title or artist.
export function rankWeeklyHits(catalogue, rows, count = HIT_COUNT) {
  const byTitle = new Map();
  for (const song of catalogue) {
    const key = clip(song.title);
    byTitle.set(key, [...(byTitle.get(key) ?? []), song]);
  }
  const totals = new Map();
  for (const row of rows) {
    if (!known(row.title) || !(Number(row.views) > 0)) continue;
    let matches = byTitle.get(clip(row.title)) ?? [];
    if (known(row.artist)) matches = matches.filter(song => clip(song.artist) === clip(row.artist));
    // A title shared by several songs cannot be attributed without the artist.
    if (matches.length !== 1) continue;
    const song = matches[0];
    const total = totals.get(song) ?? { song, views: 0, users: 0 };
    total.views += Number(row.views);
    total.users += Number(row.users) || 0;
    totals.set(song, total);
  }
  const ranked = [...totals.values()]
    .sort((a, b) => b.views - a.views || b.users - a.users)
    .map(total => total.song);
  if (ranked.length < count) throw new Error(`Only ${ranked.length} identifiable songs; need ${count}`);
  return ranked.slice(0, count);
}
