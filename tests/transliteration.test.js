import { test } from 'node:test';
import assert from 'node:assert/strict';
import { transliterate } from '../transliteration.js';

const cp = s => [...s].map(c => c.codePointAt(0).toString(16)).join(' ');

test('consonant + inherent a writes just the consonant (no extra letter A)', () => {
  assert.equal(cp(transliterate('ka')), '11392');
});

test('consonant + vowel uses the dependent sign', () => {
  assert.equal(cp(transliterate('kaa')), '11392 113b8');
  assert.equal(cp(transliterate('ki')), '11392 113b9');
});

test('word-initial vowel uses the independent letter', () => {
  assert.equal(cp(transliterate('a')), '11380');
  assert.equal(cp(transliterate('ka a')), '11392 20 11380');
});

test('consonant with no following vowel gets a virama', () => {
  assert.equal(cp(transliterate('k')), '11392 113ce');
  assert.equal(cp(transliterate('kal')), '11392 113ad 113ce');
});

test('consonants join with the conjoiner; only the last one takes the virama/vowel', () => {
  assert.equal(cp(transliterate('kra')), '11392 113d0 113ac');
  assert.equal(cp(transliterate('kr')), '11392 113d0 113ac 113ce');
});

test('explicit halant blocks the conjunct', () => {
  assert.equal(cp(transliterate('k_ra')), '11392 113ce 113ac');
});

test('digraphs match longest-first', () => {
  assert.equal(cp(transliterate('kha')), '11393');
  assert.equal(cp(transliterate('nnga')), '113a0');
});

test('e and o map to Tulu EE / OO (no Latin leaking through)', () => {
  assert.equal(cp(transliterate('ke')), '11392 113c2');
  assert.equal(cp(transliterate('ko')), '11392 113c7');
  assert.equal(cp(transliterate('e')), '1138b');
});

test('every character offered on the keyboards is mapped', () => {
  for (const ch of ['ɛ', 'ī', 'ĭ', 'ụ', 'ṛ', 'ṟ', 'ṭ', 'ḍ', 'ṇ', 'ñ', 'ṅ', 'ḷ', 'ḻ', 'ś', 'ṣ', 'ḥ', 'ṃ']) {
    const out = transliterate(ch);
    assert.ok([...out].every(c => c.codePointAt(0) >= 0x11380 && c.codePointAt(0) <= 0x113ff), `${ch} -> ${cp(out)}`);
  }
});

test('standalone ụ is not swallowed', () => {
  assert.notEqual(transliterate('ụ'), '');
});

test('decomposed diacritics (NFD) are normalised', () => {
  assert.equal(transliterate('ṇa'), transliterate('ṇa'));
});

test('uppercase input is treated like lowercase', () => {
  assert.equal(transliterate('KA'), transliterate('ka'));
});

test('punctuation, spaces and newlines pass through and close a syllable', () => {
  assert.equal(cp(transliterate('k,')), '11392 113ce 2c');
  assert.equal(transliterate('a\na'), '\u{11380}\n\u{11380}');
});

test('the four-letter aliases that could never match are gone; l+l is a normal conjunct', () => {
  assert.equal(cp(transliterate('lla')), '113ad 113d0 113ad');
});

test('empty input', () => {
  assert.equal(transliterate(''), '');
});
