import { characters } from './characters.js';
import { Round, parseDuration, readSaved, writeSaved, swapRoles } from './core.js';

const $ = id => document.getElementById(id);
let storage;
try { storage = window.localStorage; } catch { /* Private mode may deny access. */ }
const saved = readSaved(storage);
let settings = saved.settings;
let history = saved.history;
let round = null;
let phase = 'setup';
let interval;
let preparation;
let countdownDeadline;
const unavailable = new Set();
const heldKeys = new Set();

function save() {
  const ok = writeSaved(storage, settings, history);
  $('storage-message').textContent = ok ? '' : 'Browser storage is unavailable. You can still play; settings and history will last only until this page closes.';
}
if (saved.storageError) $('storage-message').textContent = 'Saved data couldn’t be read. Starting fresh; you can still play.';

function show(screen) {
  phase = screen;
  for (const id of ['setup', 'preparing', 'game', 'results']) $(id).hidden = id !== screen;
  $('history-section').hidden = ['preparing', 'game'].includes(screen);
}

function fillSettings() {
  for (const input of document.querySelectorAll('[name="duration"]')) input.checked = input.value === settings.durationChoice;
  $('custom-duration').value = settings.customDuration;
  $('describer').value = settings.describer;
  $('guesser').value = settings.guesser;
  $('custom-wrap').hidden = settings.durationChoice !== 'custom';
  $('duration-error').textContent = '';
  $('custom-duration').removeAttribute('aria-invalid');
}

function collectSettings() {
  const durationChoice = document.querySelector('[name="duration"]:checked').value;
  const customDuration = $('custom-duration').value;
  parseDuration(durationChoice, customDuration);
  return { durationChoice, customDuration, describer: $('describer').value.trim(), guesser: $('guesser').value.trim() };
}

function imageFor(character) {
  const image = document.createElement('img');
  image.alt = character.name + (character.imageStatus === 'fallback' ? ' — portrait unavailable; name card' : '');
  image.src = character.image;
  image.decoding = 'async';
  const fallback = () => {
    const card = document.createElement('div');
    card.className = 'fallback';
    card.textContent = character.name;
    const note = document.createElement('small');
    note.textContent = 'Portrait unavailable';
    card.append(note);
    image.replaceWith(card);
  };
  image.addEventListener('error', fallback, { once: true });
  if (unavailable.has(character.id)) {
    const card = document.createElement('div');
    card.className = 'fallback';
    card.textContent = character.name + ' · Portrait unavailable';
    return card;
  }
  return image;
}

function preload(character) {
  return new Promise(resolve => {
    const image = new Image();
    let settled = false;
    const done = ok => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (!ok) unavailable.add(character.id);
      image.onload = image.onerror = null;
      resolve();
    };
    const timeout = setTimeout(() => done(false), 8000);
    image.onload = async () => {
      try { if (image.decode) await image.decode(); done(true); } catch { done(false); }
    };
    image.onerror = () => done(false);
    image.src = character.image;
  });
}

async function beginRound() {
  if (phase === 'preparing' || phase === 'game') return;
  clearInterval(interval);
  clearInterval(preparation);
  round = new Round(characters, parseDuration(settings.durationChoice, settings.customDuration));
  show('preparing');
  $('prepare-title').textContent = 'Getting the gang together…';
  $('prepare-title').focus();
  $('prepare-status').textContent = 'Loading character cards before the clock starts.';
  $('countdown').textContent = '';
  $('prepare-players').textContent = `${settings.describer || 'Describer'} gives the clues · ${settings.guesser || 'Guesser'} makes the guesses`;
  unavailable.clear();
  await Promise.all(characters.map(preload));
  $('prepare-title').textContent = 'Ready, set…';
  $('prepare-status').textContent = 'Guesser, look away. Describer, get ready!';
  countdownDeadline = Date.now() + 3000;
  $('countdown').textContent = '3';
  preparation = setInterval(updatePreparation, 50);
}

function updatePreparation() {
  if (phase !== 'preparing' || !countdownDeadline) return;
  // If the countdown is hidden, start a fresh countdown on return so no card time is lost.
  if (document.hidden) { countdownDeadline = Date.now() + 3000; return; }
  const count = Math.ceil((countdownDeadline - Date.now()) / 1000);
  if (count > 0) { $('countdown').textContent = String(count); return; }
  clearInterval(preparation);
  countdownDeadline = null;
  round.start();
  show('game');
  $('round-players').textContent = `${settings.describer || 'Describer'} → ${settings.guesser || 'Guesser'}`;
  $('round-announcement').textContent = '';
  renderCard();
  updateTimer();
  $('character-name').focus();
  interval = setInterval(updateTimer, 50);
}

function renderCard() {
  if (round.status === 'finished') { finishRound(); return; }
  $('character-art').replaceChildren(imageFor(round.current));
  $('character-name').textContent = round.current.name;
  $('card-position').textContent = `${round.index + 1} / ${characters.length}`;
  $('correct-count').textContent = round.correct.length;
  $('skip-count').textContent = round.skipped.length;
  $('correct').disabled = false;
  $('skip').disabled = false;
}

function updateTimer() {
  if (phase !== 'game') return;
  round.tick();
  if (round.status === 'finished') { finishRound(); return; }
  const remaining = round.remaining();
  $('timer').textContent = remaining;
  $('timer-box').classList.toggle('urgent', remaining <= 10);
  $('timer-label').textContent = remaining <= 10 ? 'FINAL SECONDS!' : 'TIME LEFT';
  $('time-bar').style.width = `${Math.max(0, (round.deadline - Date.now()) / (round.duration * 1000)) * 100}%`;
  $('time-bar').style.background = remaining <= 10 ? '#a83327' : '';
  if (remaining <= 10 && !$('round-announcement').textContent) $('round-announcement').textContent = 'Ten seconds or less remaining!';
}

function answer(kind, event) {
  if (phase !== 'game') return;
  if (event?.detail > 1 || event?.repeat) return;
  const accepted = round.answer(kind);
  if (round.status === 'finished') finishRound();
  else if (accepted) renderCard();
}

function renderList(id, cards, empty) {
  const list = $(id);
  list.replaceChildren();
  if (!cards.length) {
    const item = document.createElement('li');
    item.className = 'empty';
    item.textContent = empty;
    list.append(item);
  }
  for (const character of cards) {
    const item = document.createElement('li');
    const name = document.createElement('span');
    name.textContent = character.name;
    item.append(imageFor(character), name);
    list.append(item);
  }
}

function finishRound() {
  if (phase !== 'game') return;
  clearInterval(interval);
  $('correct').disabled = true;
  $('skip').disabled = true;
  show('results');
  $('end-reason').textContent = round.reason === 'exhausted' ? 'You made it through town! All characters were used.' : 'Time’s up! Save those other clues for the next round.';
  $('final-score').textContent = round.correct.length;
  $('result-duration').textContent = round.duration;
  $('result-skipped').textContent = round.skipped.length;
  $('result-players').textContent = `${settings.guesser || 'Guesser'} guessed · ${settings.describer || 'Describer'} described`;
  $('correct-total').textContent = `(${round.correct.length})`;
  $('skip-total').textContent = `(${round.skipped.length})`;
  renderList('correct-list', round.correct, 'No correct guesses this round. Rematch?');
  renderList('skip-list', round.skipped, 'Not a single skip. Nice!');
  $('unfinished-section').hidden = !round.unfinished;
  renderList('unfinished-list', round.unfinished ? [round.unfinished] : [], '');
  history.push({ guesser: settings.guesser || 'Guesser', describer: settings.describer || 'Describer', duration: round.duration, score: round.correct.length, skipped: round.skipped.length, date: new Date().toISOString() });
  history = history.slice(-100);
  save();
  renderHistory();
  $('results-title').focus();
}

function renderHistory() {
  $('history-empty').hidden = history.length > 0;
  $('history-table-wrap').hidden = !history.length;
  $('clear-history').disabled = !history.length;
  $('history-body').replaceChildren();
  [...history].reverse().forEach((row, index) => {
    const tr = document.createElement('tr');
    for (const value of [history.length - index, row.guesser, `${row.duration}s`, row.score, row.skipped]) {
      const td = document.createElement('td');
      td.textContent = value;
      tr.append(td);
    }
    $('history-body').append(tr);
  });
}

$('setup-form').addEventListener('submit', event => {
  event.preventDefault();
  try { settings = collectSettings(); } catch (error) {
    $('duration-error').textContent = error.message;
    $('custom-duration').setAttribute('aria-invalid', 'true');
    $('custom-duration').focus();
    return;
  }
  save();
  beginRound();
});
$('setup-form').addEventListener('input', () => {
  const choice = document.querySelector('[name="duration"]:checked').value;
  $('custom-wrap').hidden = choice !== 'custom';
  $('duration-error').textContent = '';
  $('custom-duration').removeAttribute('aria-invalid');
  try { settings = collectSettings(); save(); } catch { /* Validate unfinished input on submit. */ }
});
$('correct').addEventListener('click', event => answer('correct', event));
$('skip').addEventListener('click', event => answer('skipped', event));
document.addEventListener('keydown', event => {
  if (phase !== 'game') return;
  if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault();
    if (event.repeat || heldKeys.has(event.key)) return;
    heldKeys.add(event.key);
    answer(event.key === 'ArrowRight' ? 'correct' : 'skipped', event);
  } else if (event.repeat && ['Enter', ' '].includes(event.key)) event.preventDefault();
});
document.addEventListener('keyup', event => heldKeys.delete(event.key));
window.addEventListener('blur', () => heldKeys.clear());
document.addEventListener('visibilitychange', () => {
  if (phase === 'preparing' && countdownDeadline) countdownDeadline = Date.now() + 3000;
  updateTimer();
});
window.addEventListener('focus', updateTimer);
$('replay').addEventListener('click', beginRound);
$('switch').addEventListener('click', () => {
  settings = swapRoles(settings);
  save();
  fillSettings();
  show('setup');
  $('start').focus();
});
$('back').addEventListener('click', () => { fillSettings(); show('setup'); $('start').focus(); });
$('clear-history').addEventListener('click', () => { history = []; save(); renderHistory(); });
$('deck-count').textContent = characters.length;
fillSettings();
renderHistory();
