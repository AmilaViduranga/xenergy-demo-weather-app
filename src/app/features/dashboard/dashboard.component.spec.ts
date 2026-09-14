import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { WeatherService } from '../../core/services/weather.service';
import {
  londonCurrentWeather,
  londonForecastPoints,
  londonLocation,
  parisLocation,
} from '../../core/testing/weather-fixtures';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let weather: jasmine.SpyObj<WeatherService>;

  beforeEach(async () => {
    weather = jasmine.createSpyObj('WeatherService', ['searchCities', 'getCurrentWeather', 'getForecast']);
    weather.searchCities.and.returnValue(of([londonLocation]));
    weather.getCurrentWeather.and.returnValue(of(londonCurrentWeather));
    weather.getForecast.and.returnValue(of(londonForecastPoints));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [{ provide: WeatherService, useValue: weather }],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
  });

  it('loads London weather on startup', () => {
    expect(weather.searchCities).toHaveBeenCalledWith('London');
    expect(fixture.nativeElement.querySelector('[data-testid="city-name"]')?.textContent).toContain('London');
    expect(fixture.nativeElement.querySelector('[data-testid="current-temp"]')?.textContent).toContain('18.4');
    expect(fixture.nativeElement.querySelector('[data-testid="avg-temp"]')).toBeTruthy();
  });

  it('does not show an empty city menu for the selected city', () => {
    const component = fixture.componentInstance;
    component.onSearchFocus();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="city-suggestions"]')).toBeNull();
  });

  it('renders daily average rows for the selected period', () => {
    const rows = fixture.nativeElement.querySelectorAll('[data-testid="daily-table"] tbody tr');
    expect(rows.length).toBe(3);
  });

  it('narrows the daily table when the end date changes', () => {
    const component = fixture.componentInstance;
    component.onEndDateChange('2026-09-14');
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="daily-table"] tbody tr');
    expect(rows.length).toBe(1);
  });

  it('selects another city from search results', () => {
    weather.searchCities.and.returnValue(of([parisLocation]));
    weather.getCurrentWeather.and.returnValue(
      of({
        ...londonCurrentWeather,
        city: 'Paris',
        country: 'FR',
      }),
    );

    const component = fixture.componentInstance;
    component.selectCity(parisLocation);
    fixture.detectChanges();

    expect(weather.getCurrentWeather).toHaveBeenCalledWith(parisLocation.lat, parisLocation.lon);
    expect(fixture.nativeElement.querySelector('[data-testid="city-name"]')?.textContent).toContain('Paris');
  });

  it('predicts the second forecast day by default', () => {
    expect(fixture.nativeElement.querySelector('[data-testid="prediction-temp"]')?.textContent).toContain('16.5');
    expect(fixture.nativeElement.querySelector('[data-testid="prediction-condition"]')?.textContent).toContain('Light Rain');
    expect(fixture.nativeElement.querySelector('[data-testid="prediction-days"]')?.textContent).toContain('15');
  });

  it('updates the day prediction when the forecast date changes', () => {
    const component = fixture.componentInstance;
    component.onPredictionDateChange('2026-09-16');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="prediction-temp"]')?.textContent).toContain('21');
    expect(fixture.nativeElement.querySelector('[data-testid="prediction-condition"]')?.textContent).toContain('Few Clouds');
    expect(fixture.nativeElement.querySelectorAll('[data-testid="prediction-hourly-table"] tbody tr').length).toBe(1);
  });
});
