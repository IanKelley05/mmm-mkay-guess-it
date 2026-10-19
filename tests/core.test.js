import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { Round, parseDuration, shuffle, swapRoles, readSaved, writeSaved, STORAGE_KEY } from '../js/core.js';
import { characters } from '../js/characters.js';

test('48 distinct characters with bundled, correctly labeled assets', () => {
  assert.equal(characters.length, 48);
  assert.equal(new Set(characters.map(c => c.id)).size, characters.length);
  assert.equal(new Set(characters.map(c => c.name)).size, characters.length);
  for (const c of characters) {
    assert.ok(existsSync(c.image), c.image);
    if (c.imageStatus === 'fallback') assert.ok(readFileSync(c.image, 'utf8').includes(c.name), c.name);
  }
});
test('validates preset and whole-number custom durations', () => {
  for (const seconds of [30, 60, 90, 120]) assert.equal(parseDuration(String(seconds)), seconds);
  for (const seconds of ['10', '600', '47', ' 20 ']) assert.equal(parseDuration('custom', seconds), Number(seconds));
  for (const invalid of ['', '9', '601', '10.5', '1e2', 'Infinity', 'NaN', '-20', '20s']) assert.throws(() => parseDuration('custom', invalid));
  assert.throws(() => parseDuration('17', '60'));
});
test('shuffle preserves all cards without mutating the source', () => {
  const input = [1, 2, 3, 4, 5];
  const output = shuffle(input, () => 0);
  assert.deepEqual(input, [1, 2, 3, 4, 5]);
  assert.notDeepEqual(input, output);
  assert.deepEqual([...output].sort(), input);
});
test('round does not score before start; correct and skip advance once', () => {
  let time = 1000;
  const r = new Round(characters, 60, { now: () => time });
  assert.equal(r.answer('correct'), false);
  r.start();
  const first = r.current;
  assert.equal(r.remaining(), 60);
  assert.equal(r.answer('correct'), true);
  assert.equal(r.correct[0], first);
  assert.equal(r.answer('correct'), false);
  time += 349;
  assert.equal(r.answer('skipped'), false);
  time += 1;
  const second = r.current;
  assert.equal(r.answer('skipped'), true);
  assert.equal(r.skipped[0], second);
  assert.equal(r.correct.length, 1);
  assert.equal(r.index, 2);
});
test('deadline rejects answers at expiry even if no timer callback has run', () => {
  let time = 0;
  const r = new Round(characters, 10, { now: () => time });
  r.start();
  time = 9999;
  assert.equal(r.remaining(), 1);
  assert.equal(r.answer('correct'), true);
  const unfinished = r.current;
  time = 10000;
  assert.equal(r.answer('correct'), false);
  assert.equal(r.reason, 'time');
  assert.equal(r.unfinished, unfinished);
  assert.equal(r.correct.length, 1);
  time = 90000;
  assert.equal(r.remaining(), 0);
  assert.equal(r.answer('skipped'), false);
});
test('background elapsed time finishes round without counting the current card', () => {
  let time = 0;
  const r = new Round(characters, 30, { now: () => time });
  r.start();
  time = 120000;
  r.tick();
  assert.equal(r.reason, 'time');
  assert.equal(r.unfinished, r.deck[0]);
  assert.equal(r.correct.length + r.skipped.length, 0);
});
test('exhaustion ends once, with no repeated or unfinished card', () => {
  let time = 0;
  const r = new Round(characters, 120, { now: () => time });
  r.start();
  for (let i = 0; i < characters.length; i++) {
    time += 400;
    assert.equal(r.answer(i % 2 ? 'skipped' : 'correct'), true);
  }
  assert.equal(r.reason, 'exhausted');
  assert.equal(r.unfinished, null);
  assert.equal(r.correct.length, 24);
  assert.equal(r.skipped.length, 24);
  assert.equal(new Set([...r.correct, ...r.skipped].map(c => c.id)).size, 48);
  assert.equal(r.answer('correct'), false);
});
test('new rounds reset scores and start with a fresh shuffled deck', () => {
  const first = new Round(characters, 60, { random: () => 0 });
  const next = new Round(characters, 60, { random: () => .99 });
  assert.notDeepEqual(first.deck, next.deck);
  assert.equal(next.status, 'ready');
  assert.deepEqual(next.correct, []);
});
test('switch roles swaps only the names', () => {
  const settings = { durationChoice: 'custom', customDuration: '47', describer: 'A', guesser: 'B' };
  assert.deepEqual(swapRoles(settings), { ...settings, describer: 'B', guesser: 'A' });
  assert.equal(settings.describer, 'A');
});
test('settings and bounded history survive persistence and clearing', () => {
  const data = new Map();
  const storage = { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) };
  const settings = { durationChoice: 'custom', customDuration: '47', describer: 'A', guesser: 'B' };
  const history = Array.from({ length: 105 }, () => ({ guesser: 'B', describer: 'A', duration: 47, score: 2, skipped: 1, date: new Date().toISOString() }));
  assert.ok(writeSaved(storage, settings, history));
  assert.deepEqual(readSaved(storage).settings, settings);
  assert.equal(readSaved(storage).history.length, 100);
  writeSaved(storage, settings, []);
  assert.deepEqual(readSaved(storage).history, []);
  data.set(STORAGE_KEY, '{broken');
  assert.equal(readSaved(storage).storageError, true);
});
test('unavailable storage and invalid saved fields do not crash the game', () => {
  assert.equal(writeSaved(undefined, {}, []), false);
  assert.equal(readSaved(undefined).settings.durationChoice, '60');
  const storage = { getItem: () => JSON.stringify({ settings: { durationChoice: 'custom', customDuration: '-1', guesser: '<img onerror=alert(1)>' }, history: [null, {}, { score: -1 }] }) };
  assert.equal(readSaved(storage).settings.durationChoice, '60');
  assert.deepEqual(readSaved(storage).history, []);
});
