import { test } from 'node:test';
import assert from 'node:assert/strict';
import { measurementId, scheduleNoResults, trackCodeCopied, trackEvent } from '../lib/analytics.mjs';

test('unfinished and successful searches do not produce missing-song events', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  globalThis.window = { dataLayer: [] };
  try {
    const cancel = scheduleNoResults('unfinished', 0);
    cancel();
    scheduleNoResults('', 0);
    scheduleNoResults('a', 0);
    scheduleNoResults('found song', 1);
    t.mock.timers.tick(2000);
    assert.equal(window.dataLayer.length, 0);
    scheduleNoResults('  missing   song  ', 0);
    t.mock.timers.tick(1499);
    assert.equal(window.dataLayer.length, 0);
    t.mock.timers.tick(1);
    assert.deepEqual(Array.from(window.dataLayer[0]), ['event', 'search_no_results', {
      search_term: 'missing song', search_scope: 'all', send_to: measurementId,
    }]);
  } finally { delete globalThis.window; }
});

test('copied codes carry the song and the visible code label; analytics failure is harmless', () => {
  globalThis.window = { dataLayer: [] };
  try {
    trackCodeCopied({ title: 'BAKA', artist: 'VANDEBO & SARYUNA' }, '36569', 'code1');
    assert.deepEqual(Array.from(window.dataLayer[0]), ['event', 'code_copied', {
      song_title: 'BAKA', artist: 'VANDEBO & SARYUNA', karaoke_code: '36569',
      code_type: 'Код 2', send_to: measurementId,
    }]);
    window.gtag = () => { throw new Error('Blocked analytics'); };
    assert.doesNotThrow(() => trackEvent('code_copied', {}));
  } finally { delete globalThis.window; }
  assert.doesNotThrow(() => trackEvent('code_copied', {}));
});
