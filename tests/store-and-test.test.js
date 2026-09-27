import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../core/store.js';
import { TypingTest, countWrong } from '../testmode.js';

test('store: insert, backspace by code point, clear', () => {
  const store = createStore();
  store.insert('ka');
  store.insert('ṇ');
  assert.equal(store.getText(), 'kaṇ');
  store.backspace();
  assert.equal(store.getText(), 'ka');
  store.clear();
  assert.equal(store.getText(), '');
  assert.equal(store.backspace(), false);
});

test('store: subscribers get the change; replaceCurrentWord swaps the last word', () => {
  const store = createStore('onji ba');
  const seen = [];
  store.subscribe((text, change) => seen.push([text, change.type]));
  store.replaceCurrentWord('baaṇaarụ ');
  assert.equal(store.getText(), 'onji baaṇaarụ ');
  assert.deepEqual(seen, [['onji baaṇaarụ ', 'replace']]);
});

function drive(target, steps) {
  let now = 0;
  const t = new TypingTest(target, { now: () => now });
  const store = createStore();
  const results = [];
  store.subscribe((text, change) => results.push(t.handleChange(change, text)));
  for (const [dt, action] of steps) {
    now += dt;
    if (action === '⌫') store.backspace(); else store.insert(action);
  }
  return { t, store, results, text: store.getText() };
}

test('typing test starts on first insert and finishes on exact match', () => {
  const { t, results } = drive('ab', [[0, 'a'], [1000, 'b']]);
  assert.deepEqual(results, ['started', 'finished']);
  assert.equal(t.elapsedSeconds(), 1);
  assert.equal(t.accuracy('ab'), 100);
});

test('corrections lower accuracy (finishing used to always report 100%)', () => {
  const { t, text } = drive('ab', [[0, 'x'], [100, '⌫'], [100, 'a'], [100, 'b']]);
  assert.equal(text, 'ab');
  assert.equal(t.corrections, 1);
  assert.ok(Math.abs(t.accuracy(text) - 200 / 3) < 1e-9);   // 3 typed, 1 deleted, 0 wrong on screen -> 2/3
});

test('backspace before the test starts does not start it', () => {
  const t = new TypingTest('ab');
  assert.equal(t.handleChange({ type: 'backspace' }, ''), null);
  assert.equal(t.started, false);
});

test('clear resets the test', () => {
  const t = new TypingTest('ab');
  t.handleChange({ type: 'insert', value: 'a' }, 'a');
  assert.equal(t.handleChange({ type: 'clear' }, ''), 'reset');
  assert.equal(t.started, false);
  assert.equal(t.inserted, 0);
});

test('countWrong counts mismatches and extras', () => {
  assert.equal(countWrong('abx', 'abc'), 1);
  assert.equal(countWrong('abcd', 'abc'), 1);
  assert.equal(countWrong('ab', 'abc'), 0);
});
