import {
  average,
  filterByDateRange,
  formatDayLabel,
  formatFullDayLabel,
  groupByDay,
  hourFromTimeLabel,
  iconUrl,
  locationLabel,
  mapCurrentWeather,
  mapForecast,
  mapGeoResults,
  pickMiddayPoint,
  predictForDate,
  rainFromCurrent,
  rainFromForecast,
  roundToOne,
  summarizePeriod,
  toLocalDate,
  toTimeLabel,
} from './weather-aggregator';
import {
  londonCurrentResponse,
  londonForecastPoints,
  londonForecastResponse,
  londonGeoItem,
} from '../testing/weather-fixtures';

describe('weather aggregator', () => {
  it('rounds values to one decimal place', () => {
    expect(roundToOne(18.44)).toBe(18.4);
    expect(roundToOne(18.45)).toBe(18.5);
  });

  it('returns zero for an empty average', () => {
    expect(average([])).toBe(0);
  });

  it('averages numeric samples', () => {
    expect(average([10, 20, 30])).toBe(20);
  });

  it('builds OpenWeather icon URLs', () => {
    expect(iconUrl('04d')).toBe('https://openweathermap.org/img/wn/04d@2x.png');
  });

  it('formats geo labels with optional state', () => {
    expect(locationLabel(londonGeoItem)).toBe('London, England, GB');
    expect(locationLabel({ name: 'Paris', lat: 1, lon: 2, country: 'FR' })).toBe('Paris, FR');
  });

  it('maps geocoding results', () => {
    const [london] = mapGeoResults([londonGeoItem]);
    expect(london.label).toBe('London, England, GB');
    expect(london.lat).toBe(51.5074);
  });

  it('reads rainfall from current and forecast payloads', () => {
    expect(rainFromCurrent(londonCurrentResponse)).toBe(0.3);
    expect(rainFromForecast(londonForecastResponse.list[0])).toBe(0.6);
    expect(rainFromForecast(londonForecastResponse.list[1])).toBe(0);
  });

  it('converts unix timestamps with a timezone offset', () => {
    const noon = Date.UTC(2026, 8, 14, 12, 0, 0) / 1000;
    expect(toLocalDate(noon, 0)).toBe('2026-09-14');
    expect(toTimeLabel(noon, 0)).toBe('12:00');
    expect(toTimeLabel(noon, 3600)).toBe('13:00');
  });

  it('maps current weather into the app model', () => {
    const current = mapCurrentWeather(londonCurrentResponse);
    expect(current.city).toBe('London');
    expect(current.temp).toBe(18.4);
    expect(current.humidity).toBe(72);
    expect(current.visibilityKm).toBe(10);
  });

  it('maps forecast entries into dated points', () => {
    const points = mapForecast(londonForecastResponse);
    expect(points.length).toBe(5);
    expect(points[0].date).toBe('2026-09-14');
    expect(points[0].rainMm).toBe(0.6);
  });

  it('filters points by an inclusive date range', () => {
    const filtered = filterByDateRange(londonForecastPoints, '2026-09-14', '2026-09-15');
    expect(filtered.length).toBe(4);
    expect(filtered.every((point) => point.date !== '2026-09-16')).toBeTrue();
  });

  it('groups readings into daily averages', () => {
    const days = groupByDay(londonForecastPoints);
    expect(days.length).toBe(3);
    expect(days[0].date).toBe('2026-09-14');
    expect(days[0].avgTemp).toBe(17.8);
    expect(days[0].totalRain).toBe(0.6);
    expect(days[1].totalRain).toBe(1.6);
  });

  it('summarizes an empty period as zeroes', () => {
    expect(summarizePeriod([])).toEqual({
      avgTemp: 0,
      minTemp: 0,
      maxTemp: 0,
      avgHumidity: 0,
      totalRain: 0,
      avgWind: 0,
      days: 0,
      points: 0,
    });
  });

  it('summarizes period averages used by the dashboard cards', () => {
    const summary = summarizePeriod(londonForecastPoints);
    expect(summary.points).toBe(5);
    expect(summary.days).toBe(3);
    expect(summary.totalRain).toBe(2.2);
    expect(summary.avgTemp).toBe(17.9);
  });

  it('formats full prediction day labels in UTC', () => {
    expect(formatFullDayLabel('2026-09-16')).toContain('16');
    expect(formatFullDayLabel('2026-09-16')).toContain('Sep');
  });

  it('formats chart day labels in a stable UTC locale', () => {
    expect(formatDayLabel('2026-09-14')).toContain('14');
    expect(formatDayLabel('2026-09-14')).toContain('Sep');
  });

  it('extracts the hour from a forecast time label', () => {
    expect(hourFromTimeLabel('2026-09-14 12:00')).toBe(12);
  });

  it('picks the forecast slot closest to midday', () => {
    const midday = pickMiddayPoint(londonForecastPoints.filter((point) => point.date === '2026-09-14'));
    expect(midday?.temp).toBe(19.4);
    expect(midday?.description).toBe('few clouds');
  });

  it('builds a day prediction from the 3-hour forecast', () => {
    const prediction = predictForDate(londonForecastPoints, '2026-09-15');
    expect(prediction.available).toBeTrue();
    expect(prediction.condition).toBe('light rain');
    expect(prediction.summary?.avgTemp).toBe(16.5);
    expect(prediction.summary?.totalRain).toBe(1.6);
    expect(prediction.rainChance).toBe(60);
    expect(prediction.points.length).toBe(2);
  });

  it('marks a prediction unavailable when the date is outside the forecast', () => {
    const prediction = predictForDate(londonForecastPoints, '2026-12-01');
    expect(prediction.available).toBeFalse();
    expect(prediction.summary).toBeNull();
    expect(prediction.points.length).toBe(0);
  });
});
