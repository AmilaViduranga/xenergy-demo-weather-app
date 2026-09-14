import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { londonCurrentResponse, londonForecastResponse, londonGeoItem } from '../testing/weather-fixtures';
import { WeatherService } from './weather.service';

describe('WeatherService', () => {
  let service: WeatherService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), WeatherService],
    });

    service = TestBed.inject(WeatherService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('searches cities through the OpenWeather geocoding API', () => {
    let label = '';
    service.searchCities('London').subscribe((cities) => {
      label = cities[0].label;
    });

    const request = http.expectOne(
      (req) =>
        req.url === `${environment.openWeatherBaseUrl}/geo/1.0/direct` &&
        req.params.get('q') === 'London' &&
        req.params.get('limit') === '5' &&
        req.params.get('appid') === environment.openWeatherApiKey,
    );

    request.flush([londonGeoItem]);
    expect(label).toBe('London, England, GB');
  });

  it('loads current weather in metric units', () => {
    let temp = 0;
    service.getCurrentWeather(51.5074, -0.1278).subscribe((current) => {
      temp = current.temp;
    });

    const request = http.expectOne(
      (req) =>
        req.url === `${environment.openWeatherBaseUrl}/data/2.5/weather` &&
        req.params.get('units') === 'metric',
    );

    request.flush(londonCurrentResponse);
    expect(temp).toBe(18.4);
  });

  it('loads the 5-day forecast used for period charts', () => {
    let count = 0;
    service.getForecast(51.5074, -0.1278).subscribe((points) => {
      count = points.length;
    });

    const request = http.expectOne(
      (req) =>
        req.url === `${environment.openWeatherBaseUrl}/data/2.5/forecast` &&
        req.params.get('lat') === '51.5074' &&
        req.params.get('lon') === '-0.1278' &&
        req.params.get('units') === 'metric' &&
        req.params.get('appid') === environment.openWeatherApiKey,
    );
    request.flush(londonForecastResponse);
    expect(count).toBe(5);
  });
});
