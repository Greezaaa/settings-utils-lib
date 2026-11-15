import { expect, test } from '@playwright/test';
import { answerSiteOnly, turnOfflinePlayOn } from './offline-play.ts';

test.use({ serviceWorkers: 'allow' });
test.setTimeout(90_000);

test.beforeEach(async ({ context }) => answerSiteOnly(context));

test('games keep working without a connection once offline play is on', async ({ context, page }) => {
  await turnOfflinePlayOn(page);
  await context.setOffline(true);
  await page.goto('/math-games');
  await expect(page.locator('main h1')).toBeVisible();
  await page.goto('/');
  await expect(page.locator('.game-card').first()).toBeVisible();
});

test('offline play survives starts without a connection, even when nothing is saved in the browser', async ({
  context,
  page,
}) => {
  await turnOfflinePlayOn(page);
  await page.evaluate(() => localStorage.clear());
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('h1')).toBeVisible();
  await page.waitForTimeout(5000);
  await page.reload();
  await expect(page.locator('h1')).toBeVisible();
  expect(await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length)).toBe(1);
  await page.goto('/math-games');
  await expect(page.locator('main h1')).toBeVisible();
});

test('the settings say when the games are ready to play without internet', async ({ page }) => {
  await turnOfflinePlayOn(page);
  await page.locator('.settings-toggle').click();
  await expect(page.locator('.offline-ready')).toHaveText('Ready: the games work without internet on this device');
});
