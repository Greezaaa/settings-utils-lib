import { expect, Page, test } from '@playwright/test';
import { API_ADDRESSES } from './offline-play.ts';


function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('Failed to load resource')) {
      errors.push(message.text());
    }
  });
  return errors;
}

test.beforeEach(async ({ page }) => {
  await page.route(API_ADDRESSES, (route) => route.abort('internetdisconnected'));
});

test('the home page shows the games without the API and without errors', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.game-card').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('a game card opens its game', async ({ page }) => {
  await page.goto('/');
  await page.locator('a.game-link[href="/math-games"]').click();
  await expect(page).toHaveURL(/\/math-games$/);
  await expect(page.locator('main h1')).toBeVisible();
});

test('the settings panel loads when opened', async ({ page }) => {
  await page.goto('/');
  await page.locator('.settings-toggle').click();
  await expect(page.locator('#site-settings app-site-settings')).toBeVisible();
});

test('an unknown address shows the not found page', async ({ page }) => {
  const response = await page.goto('/no-such-page');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toBeVisible();
});
