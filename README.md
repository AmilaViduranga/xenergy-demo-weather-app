# Nimbus Weather Lab

Angular demo app for a **CI/CD pipeline talk**. It searches OpenWeather by city, shows current conditions, then uses the 5-day / 3-hour forecast as a selectable **period** with average temperature, rainfall, humidity, Chart.js visuals, and QA-friendly tables.

This is aimed at a QA audience: linting, unit tests, Playwright, and a simple Lighthouse performance gate are first-class pipeline stages, not an afterthought.

## What the app does

- Search a city with OpenWeather Geocoding and pick a match
- Load current weather (temperature, humidity, rain, wind, pressure)
- Predict conditions for a chosen date inside the 5-day forecast
- Inspect a date range inside the 5-day forecast
- Show period averages, three charts, a daily summary table, and 3-hour readings

OpenWeather’s paid History API is not required. The free **5-day / 3-hour forecast** is the period dataset, which keeps the demo reliable on a standard API key.

## Run locally

```bash
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200). The dashboard loads London first, then you can search any city.

## Pipeline commands

| Stage | Command | What it proves |
| --- | --- | --- |
| Lint | `npm run lint` | ESLint + Angular template rules |
| Unit tests | `npm run test:ci` | Karma/Jasmine in headless Chrome, with coverage |
| E2E | `npm run e2e` | Playwright against a real Angular serve, with mocked OpenWeather |
| Performance | `npm run perf` | Lighthouse scores on the production build |
| Full pipeline | `npm run ci` | Same sequence GitHub Actions runs |

Interactive unit tests:

```bash
npm test
```

Playwright UI mode:

```bash
npm run e2e:install
npm run e2e
npm run e2e:ui
```

Local runs use the Google Chrome already on the machine and skip failure videos unless ffmpeg is installed. GitHub Actions installs Playwright Chromium (with ffmpeg) and keeps videos on failure.

## Suggested demo flow for QA

1. Run the app and search a city, pick a prediction date, then shrink the period range and show charts plus both tables
2. Point at `data-testid` locators and the mocked OpenWeather routes in `e2e/`
3. Walk the GitHub Actions graph: **Lint / Unit tests / Playwright / Lighthouse → Quality gate** (and **Deploy** on `main`)
4. Open the uploaded Playwright, coverage, and Lighthouse artifacts after a run

## Test strategy

### Unit tests

- Pure aggregation logic: averages, date filters, daily grouping
- `WeatherService` HTTP calls with `HttpTestingController`
- Dashboard behaviour with a mocked service (default city, period filter, city change)

These stay fast and do not need the network.

### Playwright

E2E tests intercept OpenWeather (`geo`, `weather`, `forecast`) so CI does not depend on live weather or rate limits. They cover:

- Default London current weather
- Charts, averages, and both tables
- Filtering the period date range
- Searching Paris
- Unknown city empty state

Selectors prefer `data-testid` plus accessible roles, which is a useful talking point for UI automation.

### Performance (Lighthouse)

`npm run perf` builds the production bundle, then Lighthouse CI scores **performance**, **accessibility**, and **best practices** against the static files. Thresholds are warnings (not hard fails) so the demo stays green while still showing a performance gate.

Config: [`lighthouserc.js`](lighthouserc.js)

## GitHub Actions

Two workflows:

| Workflow | File | When | Deploy? |
| --- | --- | --- | --- |
| **Weather App - Development** | [`.github/workflows/development.yml`](.github/workflows/development.yml) | Feature branch pushes + PRs into `main` | No |
| **Weather App - Production** | [`.github/workflows/production.yml`](.github/workflows/production.yml) | Push to `main` | Yes → Vercel |

Both run the same quality jobs in parallel, then a quality gate:

1. **Lint**
2. **Unit tests** (+ coverage artifact)
3. **Playwright E2E** (+ report artifact)
4. **Lighthouse** (+ report artifact)
5. **Quality gate** (waits for all four)

Production then continues with **Deploy to Vercel** after the quality gate.

CI uses **Node 22**, which Angular 19 supports.

### GitHub / Vercel secrets

| Secret | Where to get it |
| --- | --- |
| `VERCEL_TOKEN` | Vercel → Account Settings → Tokens |
| `VERCEL_ORG_ID` | `.vercel/project.json` after `npx vercel link`, or Vercel team/settings |
| `VERCEL_PROJECT_ID` | Same `project.json` / project settings |
| `OPENWEATHER_API_KEY` | OpenWeather account (also set this in the Vercel project env) |

One-time local link (optional):

```bash
npx vercel link
```

SPA routing for Angular is configured in [`vercel.json`](vercel.json) (`outputDirectory`: `dist/demo-weather-app/browser`).

## Project layout

```
src/app/core/            models, OpenWeather service, aggregators
src/app/features/        dashboard UI
src/app/shared/          Chart.js wrapper
e2e/                     Playwright specs and API mocks
lighthouserc.js          Lighthouse CI config
scripts/                 build helpers (API key inject)
vercel.json              Vercel Angular SPA settings
.github/workflows/production.yml   production pipeline (+ deploy)
.github/workflows/development.yml  development / PR pipeline (no deploy)
```

## OpenWeather API key

Do **not** commit the key. Locally:

```bash
cp .env.example .env
# put your key in .env
npm start
```

`npm run inject-key` (also runs before `start` / `build` / `test`) writes `src/environments/api-key.ts` from `.env` or `OPENWEATHER_API_KEY`. That generated file is gitignored.
