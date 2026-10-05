export function favoriteKey(song) {
  return JSON.stringify([song.code1 || '', song.code2 || '']);
}

export function restoreFavorites(saved, catalogue) {
  if (!Array.isArray(saved)) return [];
  const available = new Set(catalogue.map(favoriteKey));
  const restored = new Set();
  for (const value of saved) {
    if (typeof value !== 'string') continue;
    try {
      const parts = JSON.parse(value);
      if (!Array.isArray(parts)) continue;
      const key = parts.length === 4 ? JSON.stringify(parts.slice(2)) : value;
      if (available.has(key)) restored.add(key);
    } catch {}
  }
  return [...restored];
}
