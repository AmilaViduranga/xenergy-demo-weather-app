import {
  CurrentWeather,
  ForecastPoint,
  GeoLocation,
  OpenWeatherCurrentResponse,
  OpenWeatherForecastResponse,
  OpenWeatherGeoItem,
} from '../models/weather.models';

export const londonGeoItem: OpenWeatherGeoItem = {
  name: 'London',
  lat: 51.5074,
  lon: -0.1278,
  country: 'GB',
  state: 'England',
};

export const parisGeoItem: OpenWeatherGeoItem = {
  name: 'Paris',
  lat: 48.8566,
  lon: 2.3522,
  country: 'FR',
};

export const londonLocation: GeoLocation = {
  name: 'London',
  lat: 51.5074,
  lon: -0.1278,
  country: 'GB',
  state: 'England',
  label: 'London, England, GB',
};

export const parisLocation: GeoLocation = {
  name: 'Paris',
  lat: 48.8566,
  lon: 2.3522,
  country: 'FR',
  label: 'Paris, FR',
};

export const londonCurrentResponse: OpenWeatherCurrentResponse = {
  name: 'London',
  dt: 1757840400,
  visibility: 10000,
  weather: [{ description: 'broken clouds', icon: '04d', main: 'Clouds' }],
  main: {
    temp: 18.4,
    feels_like: 17.9,
    humidity: 72,
    pressure: 1016,
  },
  wind: { speed: 4.2 },
  clouds: { all: 75 },
  rain: { '1h': 0.3 },
  sys: {
    country: 'GB',
    sunrise: 1757810000,
    sunset: 1757854000,
  },
};

export const londonCurrentWeather: CurrentWeather = {
  city: 'London',
  country: 'GB',
  description: 'broken clouds',
  icon: '04d',
  iconUrl: 'https://openweathermap.org/img/wn/04d@2x.png',
  temp: 18.4,
  feelsLike: 17.9,
  humidity: 72,
  pressure: 1016,
  windSpeed: 4.2,
  visibilityKm: 10,
  rainMm: 0.3,
  clouds: 75,
  sunrise: 1757810000,
  sunset: 1757854000,
  timestamp: 1757840400,
};

export const londonForecastResponse: OpenWeatherForecastResponse = {
  city: {
    name: 'London',
    country: 'GB',
    timezone: 0,
  },
  list: [
    forecastItem('2026-09-14 00:00:00', 16.2, 80, 0.6),
    forecastItem('2026-09-14 12:00:00', 19.4, 64, 0),
    forecastItem('2026-09-15 00:00:00', 15.1, 88, 1.2),
    forecastItem('2026-09-15 12:00:00', 17.8, 70, 0.4),
    forecastItem('2026-09-16 12:00:00', 21.0, 55, 0),
  ],
};

export const londonForecastPoints: ForecastPoint[] = [
  point('2026-09-14', '2026-09-14 00:00', 16.2, 80, 0.6),
  point('2026-09-14', '2026-09-14 12:00', 19.4, 64, 0),
  point('2026-09-15', '2026-09-15 00:00', 15.1, 88, 1.2),
  point('2026-09-15', '2026-09-15 12:00', 17.8, 70, 0.4),
  point('2026-09-16', '2026-09-16 12:00', 21.0, 55, 0),
];

function forecastItem(
  dtTxt: string,
  temp: number,
  humidity: number,
  rain: number,
): OpenWeatherForecastResponse['list'][number] {
  const dt = Date.parse(`${dtTxt.replace(' ', 'T')}Z`) / 1000;

  return {
    dt,
    dt_txt: dtTxt,
    main: { temp, humidity },
    weather: [{ description: rain > 0 ? 'light rain' : 'few clouds', icon: rain > 0 ? '10d' : '02d', main: rain > 0 ? 'Rain' : 'Clouds' }],
    wind: { speed: 3.5 },
    rain: rain > 0 ? { '3h': rain } : undefined,
    pop: rain > 0 ? 0.6 : 0.1,
  };
}

function point(
  date: string,
  timeLabel: string,
  temp: number,
  humidity: number,
  rainMm: number,
): ForecastPoint {
  const isoTime = `${timeLabel}:00`;

  return {
    timestamp: Date.parse(`${isoTime.replace(' ', 'T')}Z`) / 1000,
    isoTime,
    date,
    timeLabel,
    temp,
    humidity,
    rainMm,
    windSpeed: 3.5,
    pop: rainMm > 0 ? 0.6 : 0.1,
    description: rainMm > 0 ? 'light rain' : 'few clouds',
    icon: rainMm > 0 ? '10d' : '02d',
  };
}
