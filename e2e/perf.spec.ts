import { expect, test } from '@playwright/test';
import { mockOpenWeather } from './fixtures/openweather';

test.describe('Performance budgets', () => {
  test('login page becomes interactive quickly', async ({ page }) => {
    const started = Date.now();
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('login-page')).toBeVisible();
    expect(Date.now() - started).toBeLessThan(8000);

    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      return {
        domContentLoaded: nav?.domContentLoadedEventEnd ?? 0,
        loadEvent: nav?.loadEventEnd ?? 0,
      };
    });

    expect(timing.domContentLoaded).toBeGreaterThan(0);
    expect(timing.domContentLoaded).toBeLessThan(8000);
  });

  test('dashboard first paint stays within a demo budget', async ({ page }) => {
    await mockOpenWeather(page);
    const started = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('city-name')).toBeVisible();
    expect(Date.now() - started).toBeLessThan(10000);
  });
});
