import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CurrentWeather,
  ForecastPoint,
  GeoLocation,
  OpenWeatherCurrentResponse,
  OpenWeatherForecastResponse,
  OpenWeatherGeoItem,
} from '../models/weather.models';
import { mapCurrentWeather, mapForecast, mapGeoResults } from '../utils/weather-aggregator';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.openWeatherBaseUrl;
  private readonly apiKey = environment.openWeatherApiKey;

  searchCities(query: string): Observable<GeoLocation[]> {
    const params = new HttpParams()
      .set('q', query)
      .set('limit', '5')
      .set('appid', this.apiKey);

    return this.http
      .get<OpenWeatherGeoItem[]>(`${this.baseUrl}/geo/1.0/direct`, { params })
      .pipe(map((results) => mapGeoResults(results)));
  }

  getCurrentWeather(lat: number, lon: number): Observable<CurrentWeather> {
    const params = this.weatherParams(lat, lon);

    return this.http
      .get<OpenWeatherCurrentResponse>(`${this.baseUrl}/data/2.5/weather`, { params })
      .pipe(map((response) => mapCurrentWeather(response)));
  }

  getForecast(lat: number, lon: number): Observable<ForecastPoint[]> {
    const params = this.weatherParams(lat, lon);

    return this.http
      .get<OpenWeatherForecastResponse>(`${this.baseUrl}/data/2.5/forecast`, { params })
      .pipe(map((response) => mapForecast(response)));
  }

  private weatherParams(lat: number, lon: number): HttpParams {
    return new HttpParams()
      .set('lat', String(lat))
      .set('lon', String(lon))
      .set('units', 'metric')
      .set('appid', this.apiKey);
  }
}
