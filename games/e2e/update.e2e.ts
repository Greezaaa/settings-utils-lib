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
  const oldMain = readdirSync(next).find((file) => file.startsWith('main-') && file.endsWith('.js')) ?? '';
  const newMain = 'main-NEXTVERSION.js';
  writeFileSync(join(next, newMain), readFileSync(join(next, oldMain), 'utf8').replaceAll(current, NEXT_VERSION));
  rmSync(join(next, oldMain));
  for (const page of readdirSync(next, { recursive: true, encoding: 'utf8' }).filter((file) => file.endsWith('.html'))) {
    const path = join(next, page);
    writeFileSync(path, readFileSync(path, 'utf8').replaceAll(oldMain, newMain));
  }
  delete manifest.hashTable[`/${oldMain}`];
  manifest.hashTable[`/${newMain}`] = sha1(readFileSync(join(next, newMain), 'utf8'));
  manifest.hashTable['/index.csr.html'] = sha1(readFileSync(join(next, 'index.csr.html'), 'utf8'));
  for (const group of manifest.assetGroups) {
    group.urls = group.urls.map((url: string) => (url === `/${oldMain}` ? `/${newMain}` : url));
  }
  manifest.timestamp = Date.now();
  writeFileSync(join(next, 'ngsw.json'), JSON.stringify(manifest));
  writeFileSync(join(next, 'version.json'), JSON.stringify({ version: NEXT_VERSION }));
  return next;
}

test.use({ serviceWorkers: 'allow', baseURL: ORIGIN });
test.setTimeout(90_000);

test.beforeAll(() => {
  folder = mkdtempSync(join(tmpdir(), 'games-update-'));
  root = BUILD;
  server = createServer((request, response) => serveFrom(root, request, response)).listen(PORT);
});

test.afterAll(() => {
  server.close();
  rmSync(folder, { recursive: true, force: true });
});

test('the update button brings the installed app to the new version', async ({ context, page }) => {
  const current: string = JSON.parse(readFileSync(join(BUILD, 'version.json'), 'utf8')).version;
  await answerSiteOnly(context);
  await turnOfflinePlayOn(page);

  root = nextVersionOf(current, BUILD);
  await page.locator('.settings-toggle').click();
  await expect(page.locator('.app-version .mono')).toHaveText(current);
  await page.locator('.version-check').click();
  await page.locator('su-lib-notifications').getByRole('button', { name: 'Reload', exact: true }).click();
  await page.waitForURL('/');
  await page.locator('.settings-toggle').click();
  await expect(page.locator('.app-version .mono')).toHaveText(NEXT_VERSION, { timeout: 30_000 });
});
