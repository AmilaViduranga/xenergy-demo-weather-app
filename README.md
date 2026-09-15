# Nimbus Weather Lab

Angular demo app for a **CI/CD pipeline talk**. It searches OpenWeather by city, shows current conditions, then uses the 5-day / 3-hour forecast as a selectable **period** with average temperature, rainfall, humidity, Chart.js visuals, and QA-friendly tables.

This is aimed at a QA audience: linting, unit tests, Playwright, and a simple Lighthouse performance gate are first-class pipeline stages, not an afterthought.

## What the app does

- Register / log in with Firebase email + password
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

`npm run perf` builds the production bundle, then Lighthouse CI scores **performance**, **accessibility**, and **best practices** on `/`, `/login`, and `/register`, plus soft budgets for FCP, LCP, CLS, and TBT. Thresholds are warnings (not hard fails) so the demo stays green while still showing a performance gate.

Playwright also includes a light performance smoke in `e2e/perf.spec.ts` (login + dashboard interactive budgets). E2E runs on port **4201** so a normal `npm start` on 4200 is not reused.

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
| `FIREBASE_API_KEY` | Firebase project settings → Web app config |
| `FIREBASE_AUTH_DOMAIN` | same |
| `FIREBASE_PROJECT_ID` | same |
| `FIREBASE_STORAGE_BUCKET` | same |
| `FIREBASE_MESSAGING_SENDER_ID` | same |
| `FIREBASE_APP_ID` | same |
| `FIREBASE_MEASUREMENT_ID` | optional (Analytics) |

One-time local link (optional):

```bash
npx vercel link
```

SPA routing for Angular is configured in [`vercel.json`](vercel.json) (`outputDirectory`: `dist/demo-weather-app/browser`).

## Firebase Auth

Email/password login and registration via Firebase Authentication.

1. Enable **Authentication → Sign-in method → Email/Password** in the Firebase console
2. Copy web config into local `.env` (see `.env.example`)
3. Add the same `FIREBASE_*` values to GitHub Secrets and Vercel
4. After deploy, add your Vercel domain under **Authentication → Settings → Authorized domains**

Routes:

- `/login` — sign in
- `/register` — create account
- `/` — weather dashboard (requires login)

`npm run inject-env` (also runs before start/build/test) writes gitignored `api-key.ts` and `firebase-config.ts`. Playwright sets `E2E_AUTH_BYPASS=true` so weather e2e can open the dashboard without a real Firebase session; auth page smoke tests still cover `/login` and `/register`.

## Project layout

```
src/app/core/            models, OpenWeather service, auth, aggregators
src/app/features/        dashboard + login/register UI
src/app/shared/          Chart.js wrapper
e2e/                     Playwright specs and API mocks
lighthouserc.js          Lighthouse CI config
scripts/                 build helpers (env inject)
vercel.json              Vercel Angular SPA settings
.github/workflows/production.yml   production pipeline (+ deploy)
.github/workflows/development.yml  development / PR pipeline (no deploy)
```

## OpenWeather / Firebase secrets

Do **not** commit API keys. Locally:

```bash
cp .env.example .env
# fill OPENWEATHER_* and FIREBASE_* values
npm start
```

`npm run inject-env` writes generated environment files from `.env` or CI/Vercel secrets.
