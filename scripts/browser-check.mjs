// Dependency-free Chrome DevTools smoke test. See README for the browser launch command.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const origin = process.env.TEST_URL || 'http://127.0.0.1:8080';
const pages = await (await fetch('http://127.0.0.1:9222/json')).json();
const page = pages.find(page => page.type === 'page');
assert.ok(page, 'A Chrome debugging page must be open');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
let sequence = 0;
const pending = new Map();
const errors = [];
ws.onmessage = ({ data }) => {
  const message = JSON.parse(data);
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
    if (message.id && pending.has(message.id)) {
    const callbacks = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) callbacks.reject(new Error(JSON.stringify(message.error)));
    else callbacks.resolve(message.result);
  }
};
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`DevTools timed out: ${method}`)); }, 15000);
    pending.set(id, { resolve: value => { clearTimeout(timeout); resolve(value); }, reject: error => { clearTimeout(timeout); reject(error); } });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
  return response.result.value;
}
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(expression) {
  for (let i = 0; i < 150; i++) { if (await evaluate(expression)) return; await pause(100); }
  throw new Error('Timed out: ' + expression);
}
async function click(id) { await evaluate(`document.getElementById('${id}').click()`); }
async function advance(ms) { await evaluate(`window.testOffset += ${ms}`); }
async function start(id = 'start') {
  await click(id);
  await until(`document.getElementById('countdown').textContent === '3'`);
  assert.equal(await evaluate(`document.getElementById('game').hidden`), true);
  await screenshot(await evaluate(`innerWidth <= 760 ? 'countdown-mobile' : 'countdown-desktop'`));
  await advance(3100);
  await until(`!document.getElementById('game').hidden`);
}
async function key(key, type = 'keyDown', repeat = false) {
  await send('Input.dispatchKeyEvent', { type, key, code: key, windowsVirtualKeyCode: key === 'ArrowRight' ? 39 : 37, autoRepeat: repeat });
}
async function screenshot(name) {
  await checkCenteredLayout();
  await mkdir('artifacts', { recursive: true });
  const result = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  await writeFile(`artifacts/${name}.png`, Buffer.from(result.data, 'base64'));
}

async function checkCenteredLayout() {
  const failures = await evaluate(`(() => {
    const width = document.documentElement.clientWidth;
    const selectors = ['.brand', 'main', '#setup', '#setup-title', '#setup-form',
      '#preparing', '#game', '.scoreboard', '#timer-box', '#character-art img',
      '#character-name', '.game-actions', '#results', '.results-panel', '#history-section', 'footer'];
    const problems = selectors.flatMap(selector => {
      const element = document.querySelector(selector);
      if (!element || !element.getClientRects().length) return [];
      const box = element.getBoundingClientRect();
      const offset = Math.abs(box.left + box.width / 2 - width / 2);
      return offset > 1 ? [selector + ' off center by ' + offset + 'px'] : [];
    });
    if (document.documentElement.scrollWidth > width) problems.push('Horizontal overflow');
    return problems;
  })()`);
  assert.deepEqual(failures, [], 'Visible interface must be centered without horizontal overflow');
}

try {
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: origin });
  await until(`document.getElementById('deck-count')?.textContent === '48'`);
  assert.deepEqual(await evaluate(`(async () => {
    const links = [...document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]')];
    return Promise.all(links.map(async link => {
      const image = new Image(); image.src = link.href; await image.decode();
      if (new URL(link.href).origin !== location.origin) throw new Error('Icon must be local');
      if (image.naturalWidth !== image.naturalHeight) throw new Error('Icon must be square');
      return image.naturalWidth;
    }));
  })()`), [32, 16, 180]);
  assert.equal(await evaluate(`(async () => {
    const background = getComputedStyle(document.querySelector('.scenery')).backgroundImage;
    const url = background.slice(5, -2);
    const image = new Image(); image.src = url; await image.decode();
    return image.naturalWidth > 0 && new URL(url).origin === location.origin;
  })()`), true);
  assert.equal(await evaluate(`(async () => {
    const { characters } = await import('./js/characters.js');
    await Promise.all(characters.map(async character => {
      if (character.imageStatus !== 'portrait') throw new Error('Missing portrait: ' + character.name);
      const image = new Image();
      image.src = character.image;
      await image.decode();
      if (!image.naturalWidth || !image.naturalHeight) throw new Error('Invalid image: ' + character.name);
    }));
    return characters.length;
  })()`), 48);
  await evaluate(`localStorage.clear()`);
  await send('Page.reload');
  await until(`document.getElementById('start') && document.querySelector('[name="duration"]:checked')?.value === '60'`);
  await evaluate(`window.testOffset = 0; const realNow = Date.now.bind(Date); Date.now = () => realNow() + window.testOffset;`);
  await screenshot('setup-desktop');
  await evaluate(`document.querySelector('[value="custom"]').checked = true; document.getElementById('custom-duration').value = '9'; document.getElementById('setup-form').dispatchEvent(new Event('input', { bubbles: true }));`);
  await click('start');
  assert.match(await evaluate(`document.getElementById('duration-error').textContent`), /whole number/);
  await evaluate(`document.getElementById('custom-duration').value = '10'; document.getElementById('describer').value = 'Alex'; document.getElementById('guesser').value = 'Sam';`);
  await start();
  assert.equal(await evaluate(`document.getElementById('timer').textContent`), '10');
  assert.equal(await evaluate(`document.getElementById('timer-box').classList.contains('urgent')`), true);
  await click('correct');
  await click('correct');
  assert.equal(await evaluate(`document.getElementById('correct-count').textContent`), '1');
  await advance(400);
  await click('skip');
  assert.equal(await evaluate(`document.getElementById('skip-count').textContent`), '1');
  await advance(400);
  await key('ArrowRight');
  await advance(400);
  await key('ArrowRight', 'keyDown', true);
  assert.equal(await evaluate(`document.getElementById('correct-count').textContent`), '2');
  await key('ArrowRight', 'keyUp');
  await key('ArrowLeft');
  await key('ArrowLeft', 'keyUp');
  assert.equal(await evaluate(`document.getElementById('skip-count').textContent`), '2');
  const unfinished = await evaluate(`document.getElementById('character-name').textContent`);
  await screenshot('game-desktop');
  await advance(11000);
  await click('correct');
  await until(`!document.getElementById('results').hidden`);
  assert.equal(await evaluate(`document.getElementById('final-score').textContent`), '2');
  assert.equal(await evaluate(`document.getElementById('result-skipped').textContent`), '2');
  assert.equal(await evaluate(`document.querySelector('#unfinished-list li span').textContent`), unfinished);
  assert.equal(await evaluate(`document.querySelectorAll('#history-body tr').length`), 1);
  await screenshot('results-desktop');
  await start('replay');
  assert.equal(await evaluate(`document.getElementById('correct-count').textContent`), '0');
  await advance(11000);
  await evaluate(`window.dispatchEvent(new Event('focus'))`);
  await until(`!document.getElementById('results').hidden`);
  await click('switch');
  assert.equal(await evaluate(`document.getElementById('describer').value`), 'Sam');
  assert.equal(await evaluate(`document.getElementById('guesser').value`), 'Alex');
  await evaluate(`document.querySelector('[value="60"]').checked = true; document.getElementById('setup-form').dispatchEvent(new Event('input', { bubbles: true }));`);
  await start();
  const seen = new Set();
  for (let i = 0; i < 48; i++) {
    seen.add(await evaluate(`document.getElementById('character-name').textContent`));
    await advance(400);
    await click(i % 2 ? 'skip' : 'correct');
  }
  assert.equal(seen.size, 48);
  assert.equal(await evaluate(`document.getElementById('final-score').textContent`), '24');
  assert.match(await evaluate(`document.getElementById('end-reason').textContent`), /All characters/);
  assert.equal(await evaluate(`document.getElementById('unfinished-section').hidden`), true);
  assert.equal(await evaluate(`document.querySelectorAll('#history-body tr').length`), 3);
  await click('back');
  await send('Page.reload');
  await until(`document.getElementById('guesser')?.value === 'Alex'`);
  assert.equal(await evaluate(`document.querySelectorAll('#history-body tr').length`), 3);
  assert.equal(await evaluate(`document.querySelector('[name="duration"]:checked').value`), '60');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await pause(200);
  assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), true);
  await screenshot('setup-mobile');
  await evaluate(`window.testOffset = 0; const originalNow = Date.now.bind(Date); Date.now = () => originalNow() + window.testOffset;`);
  await start();
  await pause(100);
  assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), true);
  assert.equal(await evaluate(`document.querySelector('#character-art img').naturalWidth > 0`), true);
  await screenshot('game-mobile');
  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 700, deviceScaleFactor: 1, mobile: true });
  await pause(100);
  assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), true);
  await advance(61000);
  await evaluate(`window.dispatchEvent(new Event('focus'))`);
  await until(`!document.getElementById('results').hidden`);
  await screenshot('results-mobile');
  await click('back');
  await click('clear-history');
  assert.equal(await evaluate(`JSON.parse(localStorage.getItem('snow-day-v1')).history.length`), 0);
  assert.equal(await evaluate(`document.getElementById('history-empty').hidden`), false);
  assert.deepEqual(errors, []);
  console.log('PASS: browser setup, validation, preloading/countdown, both controls, keyboard/held keys, double clicks, expiry, unfinished card, replay, role swap, full deck exhaustion, persistence, clearing, mobile width, and no JS exceptions.');
} finally { ws.close(); }
