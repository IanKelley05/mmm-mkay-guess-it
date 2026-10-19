export const STORAGE_KEY = 'snow-day-v1';
export const DEFAULT_SETTINGS = { durationChoice: '60', customDuration: '60', describer: '', guesser: '' };

export function parseDuration(choice, custom) {
  if (['30', '60', '90', '120'].includes(choice)) return Number(choice);
  const value = String(custom).trim();
  if (choice !== 'custom' || !/^\d+$/.test(value) || Number(value) < 10 || Number(value) > 600) {
    throw new Error('Enter a whole number from 10 to 600 seconds.');
  }
  return Number(value);
}

export function shuffle(cards, random = Math.random) {
  const deck = [...cards];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function swapRoles(settings) {
  return { ...settings, describer: settings.guesser, guesser: settings.describer };
}

// The deadline is checked for every input, independent of rendering/timer callbacks.
export class Round {
  constructor(cards, duration, { now = Date.now, random = Math.random } = {}) {
    this.deck = shuffle(cards, random);
    this.duration = duration;
    this.now = now;
    this.correct = [];
    this.skipped = [];
    this.index = 0;
    this.status = 'ready';
    this.lastAnswer = -Infinity;
    this.reason = null;
    this.unfinished = null;
  }
  get current() { return this.deck[this.index] ?? null; }
  start() {
    if (this.status !== 'ready') return;
    this.deadline = this.now() + this.duration * 1000;
    this.status = 'playing';
    if (!this.deck.length) this.finish('exhausted');
  }
  remaining() { return Math.max(0, Math.ceil((this.deadline - this.now()) / 1000)); }
  tick() {
    if (this.status === 'playing' && this.now() >= this.deadline) this.finish('time');
  }
  answer(kind) {
    this.tick();
    if (this.status !== 'playing' || !['correct', 'skipped'].includes(kind)) return false;
    const time = this.now();
    if (time - this.lastAnswer < 350) return false;
    this.lastAnswer = time;
    this[kind].push(this.current);
    this.index++;
    if (!this.current) this.finish('exhausted');
    return true;
  }
  finish(reason) {
    if (this.status !== 'playing') return;
    this.status = 'finished';
    this.reason = reason;
    this.unfinished = reason === 'time' ? this.current : null;
  }
}

export function readSaved(storage) {
  const fallback = { settings: { ...DEFAULT_SETTINGS }, history: [], storageError: false };
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    const input = parsed.settings ?? {};
    const settings = { ...DEFAULT_SETTINGS };
    try {
      parseDuration(input.durationChoice, input.customDuration);
      settings.durationChoice = input.durationChoice;
      settings.customDuration = String(input.customDuration ?? '60');
    } catch { /* Invalid saved durations use the default. */ }
    for (const key of ['describer', 'guesser']) {
      if (typeof input[key] === 'string') settings[key] = input[key].slice(0, 40);
    }
    const history = Array.isArray(parsed.history) ? parsed.history.filter(row =>
      row && typeof row.guesser === 'string' && typeof row.describer === 'string' &&
      Number.isInteger(row.duration) && row.duration >= 10 && row.duration <= 600 &&
      Number.isInteger(row.score) && row.score >= 0 && Number.isInteger(row.skipped) && row.skipped >= 0 &&
      typeof row.date === 'string'
    ).slice(-100) : [];
    return { settings, history, storageError: false };
  } catch { return { ...fallback, storageError: true }; }
}

export function writeSaved(storage, settings, history) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ settings, history: history.slice(-100) }));
    return true;
  } catch { return false; }
}
