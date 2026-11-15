import { BrowserContext, Page, test } from '@playwright/test';

export const API_ADDRESSES = /^(https:\/\/(api|auth)\.su-labs\.dev|http:\/\/localhost:(3000|3333))\//;

const SITE = {
  games: [],
  categories: [],
  thumbnails: [],
  features: [
    { feature: 'offline', enabled: true },
    { feature: 'update-check', enabled: true },
  ],
  newsVersion: 'e2e',
};

export async function answerSiteOnly(context: BrowserContext): Promise<void> {
  await context.route(API_ADDRESSES, (route) =>
    route.request().url().endsWith('/v1/site')
      ? route.fulfill({ json: SITE, headers: { 'access-control-allow-origin': '*' } })
      : route.abort('internetdisconnected'),
  );
}

export async function turnOfflinePlayOn(page: Page): Promise<void> {
  await test.step('choose offline play', () => chooseOfflinePlay(page));
  await test.step('wait until every app file is saved', () => waitForSavedApp(page));
  await test.step('reload under the service worker', () => reloadUntilControlled(page));
}

export async function closeCookieNotice(page: Page): Promise<void> {
  await page.locator('su-lib-notifications').getByRole('button', { name: 'OK', exact: true }).click();
}

async function chooseOfflinePlay(page: Page): Promise<void> {
  await page.goto('/');
  await closeCookieNotice(page);
  await page.locator('.settings-toggle').click();
  await page.getByRole('group', { name: 'Play offline' }).getByRole('button', { name: 'Yes' }).click();
}

async function waitForSavedApp(page: Page): Promise<void> {
  await page.waitForFunction(
    async () => {
      const manifest = await fetch(`/ngsw.json?check=${Date.now()}`).then((answer) => answer.json());
      const urls: string[] = manifest.assetGroups.find((group: { name: string }) => group.name === 'app').urls;
      const name = (await caches.keys()).find((key) => key.endsWith(':assets:app:cache'));
      if (name === undefined) {
        return false;
      }
      const cache = await caches.open(name);
      const saved = await Promise.all(urls.map((url) => cache.match(url)));
      return saved.every((answer) => answer !== undefined);
    },
    undefined,
    { polling: 500, timeout: 60_000 },
  );
}

async function reloadUntilControlled(page: Page): Promise<void> {
  for (let attempt = 0; attempt < 5; attempt++) {
    await page.reload();
    const isControlled = await page
      .waitForFunction(() => navigator.serviceWorker.controller !== null, undefined, { timeout: 3000 })
      .then(
        () => true,
        () => false,
      );
    if (isControlled) {
      return;
    }
  }
  throw new Error('The service worker never took control of the page');
}
