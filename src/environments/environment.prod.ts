import { openWeatherApiKey } from './api-key';
import { e2eAuthBypass, firebaseConfig } from './firebase-config';

export const environment = {
  production: true,
  openWeatherApiKey,
  openWeatherBaseUrl: 'https://api.openweathermap.org',
  firebase: firebaseConfig,
  e2eAuthBypass,
};
