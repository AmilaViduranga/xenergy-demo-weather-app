import { Page } from '@playwright/test';

export const londonGeo = {
  name: 'London',
  lat: 51.5074,
  lon: -0.1278,
  country: 'GB',
  state: 'England',
};

export const parisGeo = {
  name: 'Paris',
  lat: 48.8566,
  lon: 2.3522,
  country: 'FR',
};

export function currentWeather(name: string, country: string) {
  return {
    name,
    dt: 1757840400,
    visibility: 10000,
    weather: [{ description: 'broken clouds', icon: '04d', main: 'Clouds' }],
    main: {
      temp: name === 'Paris' ? 21.6 : 18.4,
      feels_like: name === 'Paris' ? 21.1 : 17.9,
      humidity: name === 'Paris' ? 61 : 72,
      pressure: 1016,
    },
    wind: { speed: 4.2 },
    clouds: { all: 75 },
    rain: { '1h': 0.3 },
    sys: {
      country,
      sunrise: 1757810000,
      sunset: 1757854000,
    },
  };
}

export function forecastFor(city: string, country: string) {
  const list = [];
  const start = Date.UTC(2026, 8, 14, 0, 0, 0) / 1000;

  for (let index = 0; index < 40; index += 1) {
    const dt = start + index * 3 * 3600;
    const day = Math.floor(index / 8);
    const rain = index % 5 === 0 ? 0.8 : 0;
    list.push({
      dt,
      dt_txt: new Date(dt * 1000).toISOString().replace('T', ' ').slice(0, 19),
      main: {
        temp: 16 + day + (index % 8) * 0.4,
        humidity: 58 + (index % 6) * 3,
      },
      weather: [
        {
          description: rain > 0 ? 'light rain' : 'few clouds',
          icon: rain > 0 ? '10d' : '02d',
          main: rain > 0 ? 'Rain' : 'Clouds',
        },
      ],
      wind: { speed: 3.1 + day * 0.2 },
      rain: rain > 0 ? { '3h': rain } : undefined,
      pop: rain > 0 ? 0.7 : 0.15,
    });
  }

  return {
    city: {
      name: city,
      country,
      timezone: 0,
    },
    list,
  };
}

export async function mockOpenWeather(page: Page): Promise<void> {
  await page.route('**/geo/1.0/direct*', async (route) => {
    const query = new URL(route.request().url()).searchParams.get('q')?.toLowerCase() ?? '';

    if (query.includes('unknownxyz')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '[]',
      });
      return;
    }

    if (query.includes('paris')) {
      await route.fulfill({ json: [parisGeo] });
      return;
    }

    await route.fulfill({ json: [londonGeo] });
  });

  await page.route('**/data/2.5/weather*', async (route) => {
    const lat = new URL(route.request().url()).searchParams.get('lat') ?? '';
    const isParis = lat.startsWith('48.85');
    await route.fulfill({
      json: currentWeather(isParis ? 'Paris' : 'London', isParis ? 'FR' : 'GB'),
    });
  });

  await page.route('**/data/2.5/forecast*', async (route) => {
    const lat = new URL(route.request().url()).searchParams.get('lat') ?? '';
    const isParis = lat.startsWith('48.85');
    await route.fulfill({
      json: forecastFor(isParis ? 'Paris' : 'London', isParis ? 'FR' : 'GB'),
    });
  });
}
