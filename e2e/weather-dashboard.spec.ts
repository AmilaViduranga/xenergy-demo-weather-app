import { expect, test } from '@playwright/test';
import { mockOpenWeather } from './fixtures/openweather';

test.describe('Nimbus weather dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await mockOpenWeather(page);
    await page.goto('/');
  });

  test('shows the lab header and default London weather', async ({ page }) => {
    await expect(page.getByText('Nimbus')).toBeVisible();
    await expect(page.getByTestId('city-name')).toContainText('London');
    await expect(page.getByTestId('current-temp')).toContainText('18.4');
    await expect(page.getByTestId('current-humidity')).toContainText('72');
    await page.getByTestId('city-search').click();
    await expect(page.getByTestId('no-cities')).toHaveCount(0);
  });

  test('renders period charts, averages, and tables', async ({ page }) => {
    await expect(page.getByTestId('avg-temp')).toBeVisible();
    await expect(page.getByTestId('avg-humidity')).toBeVisible();
    await expect(page.getByTestId('avg-rain')).toBeVisible();
    await expect(page.getByTestId('temp-chart')).toBeVisible();
    await expect(page.getByTestId('rain-chart')).toBeVisible();
    await expect(page.getByTestId('humidity-chart')).toBeVisible();
    await expect(page.getByTestId('daily-table').locator('tbody tr')).toHaveCount(5);
    await expect(page.getByTestId('hourly-table').locator('tbody tr')).toHaveCount(40);
  });

  test('filters daily averages when the period changes', async ({ page }) => {
    await expect(page.getByTestId('daily-table').locator('tbody tr')).toHaveCount(5);
    await page.getByTestId('period-end').fill('2026-09-15');
    await expect(page.getByTestId('daily-table').locator('tbody tr')).toHaveCount(2);
    await expect(page.getByTestId('hourly-table').locator('tbody tr')).toHaveCount(16);
  });

  test('searches another city and updates the current conditions', async ({ page }) => {
    await page.getByTestId('city-search').fill('Paris');
    await page.getByRole('option', { name: 'Paris, FR' }).click();
    await expect(page.getByTestId('city-name')).toContainText('Paris');
    await expect(page.getByTestId('current-temp')).toContainText('21.6');
  });

  test('predicts weather for a selected forecast date', async ({ page }) => {
    await expect(page.getByTestId('prediction-panel')).toBeVisible();
    await expect(page.getByTestId('prediction-hourly-table').locator('tbody tr')).toHaveCount(8);
    await page.getByTestId('prediction-day-2026-09-16').click();
    await expect(page.getByTestId('prediction-date-label')).toContainText('16');
    await expect(page.getByTestId('prediction-hourly-table').locator('tbody tr')).toHaveCount(8);
    await expect(page.getByTestId('prediction-temp-chart')).toBeVisible();
    await expect(page.getByTestId('prediction-rain-chance')).toBeVisible();
  });

  test('shows a helpful empty state for an unknown city', async ({ page }) => {
    await page.getByTestId('city-search').fill('unknownxyz');
    await expect(page.getByTestId('no-cities')).toHaveText('No matching cities');
  });
});
