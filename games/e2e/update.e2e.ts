import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer, Server } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { answerSiteOnly, turnOfflinePlayOn } from './offline-play.ts';
import { serveFrom } from './serve-files.ts';

const BUILD = join(import.meta.dirname, '../../dist/games/browser');
const PORT = 4330;
const ORIGIN = `http://localhost:${PORT}`;
const NEXT_VERSION = '2099.01.01-0000';
let folder: string;
let root: string;
let server: Server;

function nextVersionOf(current: string, from: string): string {
  const next = join(folder, 'next');
  cpSync(from, next, { recursive: true });
  const manifest = JSON.parse(readFileSync(join(next, 'ngsw.json'), 'utf8'));
  const sha1 = (text: string): string => createHash('sha1').update(text).digest('hex');
  const renamed = new Map<string, string>();
  const changed = new Set<string>();
  for (const name of readdirSync(next).filter((file) => file.endsWith('.js'))) {
    const text = readFileSync(join(next, name), 'utf8');
    if (text.includes(current)) {
      const newName = name.replace(/\.js$/, '-next.js');
      writeFileSync(join(next, newName), text.replaceAll(current, NEXT_VERSION));
      rmSync(join(next, name));
      renamed.set(name, newName);
      changed.add(newName);
    }
  }
  const files = readdirSync(next, { recursive: true, encoding: 'utf8' }).filter((file) => /\.(html|js)$/.test(file));
  for (const file of files) {
    const path = join(next, file);
    const before = readFileSync(path, 'utf8');
    const after = [...renamed].reduce((text, [oldName, newName]) => text.replaceAll(oldName, newName), before);
    if (after !== before) {
      writeFileSync(path, after);
      changed.add(file);
    }
  }
  const hashTable: Record<string, string> = {};
  for (const [url, hash] of Object.entries<string>(manifest.hashTable)) {
    const name = renamed.get(url.slice(1)) ?? url.slice(1);
    hashTable[`/${name}`] = changed.has(name) ? sha1(readFileSync(join(next, name), 'utf8')) : hash;
  }
  manifest.hashTable = hashTable;
  for (const group of manifest.assetGroups) {
    group.urls = group.urls.map((url: string) => `/${renamed.get(url.slice(1)) ?? url.slice(1)}`);
  }
  manifest.timestamp = Date.now();
  writeFileSync(join(next, 'ngsw.json'), JSON.stringify(manifest));
  writeFileSync(join(next, 'version.json'), JSON.stringify({ version: NEXT_VERSION }));
  return next;
}

test.use({ serviceWorkers: 'allow', baseURL: ORIGIN });
test.setTimeout(90_000);

test.beforeAll(async () => {
  folder = mkdtempSync(join(tmpdir(), 'games-update-'));
  root = BUILD;
  server = createServer((request, response) => serveFrom(root, request, response));
  await new Promise<void>((resolve, reject) => server.once('error', reject).listen(PORT, resolve));
});

test.afterAll(async () => {
  server.closeAllConnections();
  await new Promise<void>((resolve) => server.close(() => resolve()));
  rmSync(folder, { recursive: true, force: true });
});

test('the update button brings the installed app to the new version', async ({ context, page }) => {
  const current: string = JSON.parse(readFileSync(join(BUILD, 'version.json'), 'utf8')).version;
  await test.step('install the app for offline play', async () => {
    await answerSiteOnly(context);
    await turnOfflinePlayOn(page);
  });
  await test.step('publish the next version and find it', async () => {
    root = nextVersionOf(current, BUILD);
    await page.locator('.settings-toggle').click();
    await expect(page.locator('.app-version .mono')).toHaveText(current);
    await page.locator('.version-check').dispatchEvent('click');
  });
  await test.step('reload into the next version', async () => {
    const reloaded = page.waitForEvent('load');
    await page.locator('su-lib-notifications').getByRole('button', { name: 'Reload', exact: true }).click();
    await reloaded;
    expect(await page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);
    await page.locator('.settings-toggle').click();
    await expect(page.locator('.app-version .mono')).toHaveText(NEXT_VERSION);
  });
});
