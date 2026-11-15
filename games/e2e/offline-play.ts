import { BrowserContext, Page } from '@playwright/test';

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
  await page.goto('/');
  await page.locator('.settings-toggle').click();
  await page.getByRole('group', { name: 'Play offline' }).getByRole('button', { name: 'Yes' }).click();
  await page.waitForFunction(
    async () => {
      const manifest = await fetch(`/ngsw.json?check=${Date.now()}`).then((answer) => answer.json());
      const files: number = manifest.assetGroups.find((group: { name: string }) => group.name === 'app').urls.length;
      const names = await caches.keys();
      const app = names.find((name) => name.endsWith(':assets:app:cache'));
      return app !== undefined && (await (await caches.open(app)).keys()).length >= files;
    },
    undefined,
    { polling: 500, timeout: 60_000 },
  );
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
}
