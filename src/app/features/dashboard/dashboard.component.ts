import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  of,
  switchMap,
  tap,
} from 'rxjs';
import {
  CurrentWeather,
  ForecastPoint,
  GeoLocation,
} from '../../core/models/weather.models';
import { WeatherService } from '../../core/services/weather.service';
import {
  filterByDateRange,
  formatDayLabel,
  formatFullDayLabel,
  groupByDay,
  predictForDate,
  summarizePeriod,
} from '../../core/utils/weather-aggregator';
import { WeatherChartComponent } from '../../shared/components/weather-chart/weather-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, DecimalPipe, TitleCasePipe, FormsModule, WeatherChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly weather = inject(WeatherService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly queryInput$ = new Subject<string>();
  private readonly selectedCity$ = new Subject<GeoLocation>();

  readonly cityQuery = signal('');
  readonly showSuggestions = signal(false);
  readonly searching = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly selectedCity = signal<GeoLocation | null>(null);
  readonly current = signal<CurrentWeather | null>(null);
  readonly forecastPoints = signal<ForecastPoint[]>([]);
  readonly startDate = signal('');
  readonly endDate = signal('');
  readonly minDate = signal('');
  readonly maxDate = signal('');
  readonly predictionDate = signal('');

  readonly suggestions = toSignal(
    this.queryInput$.pipe(
      debounceTime(280),
      distinctUntilChanged(),
      switchMap((query) => {
        const trimmed = query.trim();
        if (trimmed.length < 2) {
          this.searching.set(false);
          return of([]);
        }

        this.searching.set(true);
        return this.weather.searchCities(trimmed).pipe(
          tap(() => this.searching.set(false)),
          catchError(() => {
            this.searching.set(false);
            return of([]);
          }),
        );
      }),
    ),
    { initialValue: [] },
  );

  readonly filteredPoints = computed(() =>
    filterByDateRange(this.forecastPoints(), this.startDate(), this.endDate()),
  );

  readonly dailySummaries = computed(() => groupByDay(this.filteredPoints()));
  readonly periodSummary = computed(() => summarizePeriod(this.filteredPoints()));
  readonly prediction = computed(() => predictForDate(this.forecastPoints(), this.predictionDate()));
  readonly forecastDays = computed(() => [...new Set(this.forecastPoints().map((point) => point.date))]);

  readonly chartLabels = computed(() => this.dailySummaries().map((day) => formatDayLabel(day.date)));
  readonly tempValues = computed(() => this.dailySummaries().map((day) => day.avgTemp));
  readonly rainValues = computed(() => this.dailySummaries().map((day) => day.totalRain));
  readonly humidityValues = computed(() => this.dailySummaries().map((day) => day.avgHumidity));
  readonly predictionLabels = computed(() =>
    this.prediction().points.map((point) => point.timeLabel.split(' ').pop() ?? point.timeLabel),
  );
  readonly predictionTemps = computed(() => this.prediction().points.map((point) => point.temp));
  readonly predictionRain = computed(() => this.prediction().points.map((point) => point.rainMm));

  readonly formatDayLabel = formatDayLabel;
  readonly formatFullDayLabel = formatFullDayLabel;

  constructor() {
    this.selectedCity$
      .pipe(
        tap((city) => {
          this.selectedCity.set(city);
          this.loading.set(true);
          this.error.set(null);
          this.showSuggestions.set(false);
        }),
        switchMap((city) =>
          forkJoin({
            current: this.weather.getCurrentWeather(city.lat, city.lon),
            forecast: this.weather.getForecast(city.lat, city.lon),
          }).pipe(
            tap(({ current, forecast }) => {
              this.current.set(current);
              this.forecastPoints.set(forecast);
              if (forecast.length > 0) {
                const first = forecast[0].date;
                const last = forecast[forecast.length - 1].date;
                const days = [...new Set(forecast.map((point) => point.date))];
                this.minDate.set(first);
                this.maxDate.set(last);
                this.startDate.set(first);
                this.endDate.set(last);
                this.predictionDate.set(days[1] ?? days[0]);
              }
              this.loading.set(false);
            }),
            catchError(() => {
              this.loading.set(false);
              this.current.set(null);
              this.forecastPoints.set([]);
              this.error.set('Unable to load weather data. Please try another city.');
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    this.weather
      .searchCities('London')
      .pipe(
        catchError(() => of([])),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((cities) => {
        const london = cities[0];
        if (!london) {
          this.error.set('Unable to load the default city. Search to get started.');
          return;
        }

        this.cityQuery.set(london.label);
        this.selectedCity$.next(london);
      });
  }

  onQuery(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.cityQuery.set(value);
    this.openSuggestionsFor(value);
    this.queryInput$.next(value);
  }

  onSearchFocus(): void {
    this.openSuggestionsFor(this.cityQuery());
  }

  onSearchBlur(): void {
    window.setTimeout(() => this.showSuggestions.set(false), 180);
  }

  selectCity(city: GeoLocation): void {
    this.cityQuery.set(city.label);
    this.showSuggestions.set(false);
    this.searching.set(false);
    this.selectedCity$.next(city);
  }

  isActiveQuery(query: string): boolean {
    const trimmed = query.trim();
    return trimmed.length >= 2 && trimmed !== this.selectedCity()?.label;
  }

  private openSuggestionsFor(query: string): void {
    if (this.isActiveQuery(query)) {
      this.searching.set(true);
      this.showSuggestions.set(true);
      return;
    }

    this.searching.set(false);
    this.showSuggestions.set(false);
  }

  onStartDateChange(value: string): void {
    this.startDate.set(value);
    if (this.endDate() && value > this.endDate()) {
      this.endDate.set(value);
    }
  }

  onEndDateChange(value: string): void {
    this.endDate.set(value);
    if (this.startDate() && value < this.startDate()) {
      this.startDate.set(value);
    }
  }

  onPredictionDateChange(value: string): void {
    this.predictionDate.set(value);
  }
}
