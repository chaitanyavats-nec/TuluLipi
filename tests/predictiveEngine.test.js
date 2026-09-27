import { test } from 'node:test';
import assert from 'node:assert/strict';
import { predict, resetDialect, foldText } from '../predictiveEngine.js';
import { TULU_LEXICON } from '../words.js';

test('empty input gives no suggestions', () => {
  assert.deepEqual(predict('', {}), []);
});

test('plain-Latin typing matches words spelled with diacritics', () => {
  const variants = predict('onas', {}).map(e => e.variant);
  assert.ok(variants.some(v => v.startsWith('oṇas')), variants.join(','));
});

test('typing the exact diacritics still works', () => {
  assert.ok(predict('oṇ', {}).length > 0);
});

test('at most five unique suggestions', () => {
  const results = predict('a', {});
  assert.ok(results.length <= 5);
  assert.equal(new Set(results.map(e => e.variant)).size, results.length);
});

test('dialect state persists across calls and resets on demand', () => {
  const state = {};
  predict('ba', state);
  assert.ok(state.detectedDialect);
  resetDialect(state);
  assert.equal(state.detectedDialect, null);
});

test('region option boosts matching entries', () => {
  const south = predict('o', {}, { region: 'south' })[0];
  assert.equal(south.region, 'south');
});

test('neutral-dialect words are not filtered out once a dialect is detected', () => {
  const state = { detectedDialect: 'harijan-tribal' };
  const variants = predict('van', state).map(e => e.variant);
  assert.ok(variants.includes('vanasụ'), variants.join(','));
});

test('no lexicon variant contains characters the keyboards cannot produce', () => {
  const typeable = /^[a-zɛụṇśṣṭḍñṅṛṟḷḻḥṃīĭ]+$/;
  for (const entry of TULU_LEXICON) {
    assert.match(entry.variant, typeable, entry.variant);
  }
});

test('foldText removes diacritics and IPA', () => {
  assert.equal(foldText('baaɳaːrụ'), 'baanaaru');
  assert.equal(foldText('ṭoṛ'), 'tor');
});
