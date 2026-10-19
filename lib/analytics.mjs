export const measurementId = 'G-1PHTLHG65N';

export function trackEvent(name, parameters) {
  if (typeof window === 'undefined') return;
  try {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('event', name, { ...parameters, send_to: measurementId });
  } catch {
    // Analytics must never interrupt search or clipboard actions.
  }
}

export function scheduleNoResults(query, resultCount, scope = 'all') {
  const term = query.trim().replace(/\s+/g, ' ');
  if (term.length < 2 || resultCount > 0) return () => {};
  const timer = setTimeout(() => trackEvent('search_no_results', {
    search_term: term.slice(0, 100),
    search_scope: scope,
  }), 1500);
  return () => clearTimeout(timer);
}

export function scheduleSuccessfulSearch(query, resultCount, scope = 'all') {
  const term = query.trim().replace(/\s+/g, ' ');
  if (term.length < 2 || resultCount <= 0) return () => {};
  const timer = setTimeout(() => trackEvent('search_success', {
    search_term: term.slice(0, 100),
    search_scope: scope,
    result_count: resultCount,
  }), 1500);
  return () => clearTimeout(timer);
}

export function trackCodeCopied(song, code, field) {
  trackEvent('code_copied', {
    song_title: song.title.slice(0, 100),
    artist: song.artist.slice(0, 100),
    karaoke_code: code,
    code_type: field === 'code2' ? 'Код 1' : 'Код 2',
  });
}

// Count each opened code detail, independently of copy actions or ad visibility.
export function trackSongCodeView(song, query='', scope='all') {
  trackEvent('song_code_view', {
    song_title: song.title.slice(0,100),
    artist: song.artist.slice(0,100),
    search_term: query.trim().replace(/\s+/g,' ').slice(0,100),
    search_scope: scope,
  });
}
