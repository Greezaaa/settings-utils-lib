import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = join(root, 'dist', 'games', 'browser');
const output = join(root, 'games', 'public', 'thumbnails');
const chromePath = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 4399;
const debugPort = 9399;
const width = 480;

const allSlugs = [...readFileSync(join(root, 'games', 'src', 'app', 'core', 'games.ts'), 'utf8').matchAll(/slug: '([a-z-]+)'/g)].map(
  ([, slug]) => slug,
);
const chosen = process.argv.slice(2);
const slugs = chosen.length > 0 ? allSlugs.filter((slug) => chosen.includes(slug)) : allSlugs;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.txt': 'text/plain' };

function fileFor(url) {
  const path = join(site, decodeURIComponent(url.split(/[?#]/)[0]));
  for (const candidate of [path, join(path, 'index.html'), join(site, 'index.csr.html')]) {
    try {
      if (statSync(candidate).isFile()) {
        return candidate;
      }
    } catch {
      continue;
    }
  }
  return join(site, 'index.csr.html');
}

const server = createServer((request, response) => {
  const file = fileFor(request.url ?? '/');
  response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
  response.end(readFileSync(file));
}).listen(port);

const profile = mkdtempSync(join(tmpdir(), 'thumbnails-'));
const chrome = spawn(chromePath, ['--headless=new', `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, '--no-first-run', 'about:blank']);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
await sleep(2500);

function stageWordSearch() {
  const filler = 'GCNRMGBLGAZNKUIBHMWDCIRRQBETHFXYVJPO';
  const words = [
    { word: 'SOPA', row: 1, column: 0 },
    { word: 'DE', row: 2, column: 4 },
    { word: 'LETRAS', row: 3, column: 0 },
  ];
  const cells = [...document.querySelectorAll('.letters .letter')];
  const size = Math.sqrt(cells.length);
  cells.forEach((cell, index) => {
    cell.textContent = filler[index % filler.length];
    cell.removeAttribute('data-found');
  });
  words.forEach(({ word, row, column }, colour) => {
    [...word].forEach((letter, offset) => {
      const cell = cells[row * size + column + offset];
      cell.textContent = letter;
      cell.setAttribute('data-found', String(colour));
    });
  });
  const list = document.querySelector('.words');
  list.replaceChildren(
    ...words.map(({ word }) => {
      const item = document.createElement('li');
      item.className = 'word is-found';
      item.textContent = word;
      return item;
    }),
  );
}

function stageSecretWord() {
  const secret = 'STAR';
  const guesses = ['BIRD', 'SEAT', 'STAR'];
  const markOf = (guess, index) => (secret[index] === guess[index] ? 'right' : secret.includes(guess[index]) ? 'present' : 'absent');
  const keyMarks = new Map();
  [...document.querySelectorAll('.tries .try')].forEach((row, rowIndex) => {
    const guess = guesses[rowIndex];
    [...row.querySelectorAll('.tile')].forEach((tile, index) => {
      tile.classList.remove('is-typed');
      if (!guess) {
        tile.textContent = '';
        tile.removeAttribute('data-mark');
        return;
      }
      const mark = markOf(guess, index);
      tile.textContent = guess[index];
      tile.setAttribute('data-mark', mark);
      if (keyMarks.get(guess[index]) !== 'right') {
        keyMarks.set(guess[index], mark);
      }
    });
  });
  for (const key of document.querySelectorAll('.keyboard .key:not(.key-wide)')) {
    const mark = keyMarks.get(key.textContent.trim().toUpperCase());
    if (mark) {
      key.setAttribute('data-mark', mark);
    }
  }
}

const stages = { 'word-search': stageWordSearch, 'secret-word': stageSecretWord };

const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
const socket = new WebSocket(targets.find((target) => target.type === 'page').webSocketDebuggerUrl);
await new Promise((resolve) => socket.addEventListener('open', resolve));
let nextId = 0;
const pending = new Map();
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  pending.get(message.id)?.(message.result);
  pending.delete(message.id);
});
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = ++nextId;
    pending.set(id, resolve);
    socket.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.value;

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 900, deviceScaleFactor: 1, mobile: false });
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }, { name: 'prefers-reduced-motion', value: 'reduce' }] });
await send('Page.navigate', { url: `http://localhost:${port}/` });
await sleep(2000);
await evaluate(`localStorage.setItem('su-labs-games:game-switches', ${JSON.stringify(JSON.stringify(slugs.map((slug) => [slug, true])))}); localStorage.setItem('su-labs-games:privacy-notice-version', '999'); localStorage.setItem('su-labs-games:word-gender-asked', 'true')`);

mkdirSync(output, { recursive: true });
for (const slug of slugs) {
  await send('Page.navigate', { url: `http://localhost:${port}/${slug}` });
  await sleep(3500);
  if (await evaluate(`(() => { const start = document.querySelector('.page-section .card button.start'); start?.click(); return !!start; })()`)) {
    await sleep(2000);
  }
  if (stages[slug]) {
    await evaluate(`(${stages[slug]})()`);
    await sleep(300);
  }
  const box = await evaluate(`(() => {
    const board = document.querySelector('.card.play .play-main') ?? document.querySelector('.page-section .card');
    if (!board) return null;
    const { x, y, width } = board.getBoundingClientRect();
    return { x: x + scrollX, y: y + scrollY, width, height: width * 3 / 4 };
  })()`);
  if (!box) {
    console.log(`skipped ${slug}: no board`);
    continue;
  }
  const shot = await send('Page.captureScreenshot', { format: 'webp', quality: 80, captureBeyondViewport: true, clip: { ...box, scale: width / box.width } });
  writeFileSync(join(output, `${slug}.webp`), Buffer.from(shot.data, 'base64'));
  console.log(`saved thumbnails/${slug}.webp`);
}

socket.close();
chrome.kill();
server.close();
await sleep(1000);
rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
