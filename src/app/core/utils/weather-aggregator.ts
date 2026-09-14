import {
  CurrentWeather,
  DailySummary,
  DayPrediction,
  ForecastPoint,
  GeoLocation,
  OpenWeatherCurrentResponse,
  OpenWeatherForecastItem,
  OpenWeatherForecastResponse,
  OpenWeatherGeoItem,
  PeriodSummary,
} from '../models/weather.models';

export function roundToOne(value: number): number {
  return Math.round(value * 10) / 10;
}

export function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return roundToOne(total / values.length);
}

export function iconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

export function locationLabel(item: OpenWeatherGeoItem): string {
  return [item.name, item.state, item.country].filter(Boolean).join(', ');
}

export function mapGeoResults(results: OpenWeatherGeoItem[]): GeoLocation[] {
  return results.map((item) => ({
    name: item.name,
    lat: item.lat,
    lon: item.lon,
    country: item.country,
    state: item.state,
    label: locationLabel(item),
  }));
}

export function rainFromCurrent(data: OpenWeatherCurrentResponse): number {
  return data.rain?.['1h'] ?? data.rain?.['3h'] ?? 0;
}

export function rainFromForecast(item: OpenWeatherForecastItem): number {
  return item.rain?.['3h'] ?? item.snow?.['3h'] ?? 0;
}

export function toLocalDate(unixSeconds: number, timezoneOffset: number): string {
  return new Date((unixSeconds + timezoneOffset) * 1000).toISOString().slice(0, 10);
}

export function toTimeLabel(unixSeconds: number, timezoneOffset: number): string {
  const iso = new Date((unixSeconds + timezoneOffset) * 1000).toISOString();
  return iso.slice(11, 16);
}

export function mapCurrentWeather(data: OpenWeatherCurrentResponse): CurrentWeather {
  const weather = data.weather[0];

  return {
    city: data.name,
    country: data.sys.country,
    description: weather?.description ?? 'Unknown',
    icon: weather?.icon ?? '01d',
    iconUrl: iconUrl(weather?.icon ?? '01d'),
    temp: roundToOne(data.main.temp),
    feelsLike: roundToOne(data.main.feels_like),
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    windSpeed: roundToOne(data.wind.speed),
    visibilityKm: roundToOne(data.visibility / 1000),
    rainMm: roundToOne(rainFromCurrent(data)),
    clouds: data.clouds.all,
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset,
    timestamp: data.dt,
  };
}

export function mapForecast(data: OpenWeatherForecastResponse): ForecastPoint[] {
  const timezone = data.city.timezone ?? 0;

  return data.list.map((item) => {
    const weather = item.weather[0];
    const date = toLocalDate(item.dt, timezone);

    return {
      timestamp: item.dt,
      isoTime: item.dt_txt,
      date,
      timeLabel: `${date} ${toTimeLabel(item.dt, timezone)}`,
      temp: roundToOne(item.main.temp),
      humidity: item.main.humidity,
      rainMm: roundToOne(rainFromForecast(item)),
      windSpeed: roundToOne(item.wind.speed),
      pop: item.pop ?? 0,
      description: weather?.description ?? 'Unknown',
      icon: weather?.icon ?? '01d',
    };
  });
}

export function filterByDateRange(
  points: ForecastPoint[],
  startDate: string,
  endDate: string,
): ForecastPoint[] {
  return points.filter((point) => point.date >= startDate && point.date <= endDate);
}

export function groupByDay(points: ForecastPoint[]): DailySummary[] {
  const grouped = new Map<string, ForecastPoint[]>();

  for (const point of points) {
    const bucket = grouped.get(point.date) ?? [];
    bucket.push(point);
    grouped.set(point.date, bucket);
  }

  return [...grouped.entries()].map(([date, items]) => {
    const temps = items.map((item) => item.temp);

    return {
      date,
      avgTemp: average(temps),
      minTemp: roundToOne(Math.min(...temps)),
      maxTemp: roundToOne(Math.max(...temps)),
      avgHumidity: average(items.map((item) => item.humidity)),
      totalRain: roundToOne(items.reduce((sum, item) => sum + item.rainMm, 0)),
      avgWind: average(items.map((item) => item.windSpeed)),
      samples: items.length,
    };
  });
}

export function summarizePeriod(points: ForecastPoint[]): PeriodSummary {
  if (points.length === 0) {
    return {
      avgTemp: 0,
      minTemp: 0,
      maxTemp: 0,
      avgHumidity: 0,
      totalRain: 0,
      avgWind: 0,
      days: 0,
      points: 0,
    };
  }

  const temps = points.map((point) => point.temp);
  const days = new Set(points.map((point) => point.date)).size;

  return {
    avgTemp: average(temps),
    minTemp: roundToOne(Math.min(...temps)),
    maxTemp: roundToOne(Math.max(...temps)),
    avgHumidity: average(points.map((point) => point.humidity)),
    totalRain: roundToOne(points.reduce((sum, point) => sum + point.rainMm, 0)),
    avgWind: average(points.map((point) => point.windSpeed)),
    days,
    points: points.length,
  };
}

export function formatDayLabel(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  return parsed.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

export function formatFullDayLabel(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  return parsed.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

export function hourFromTimeLabel(timeLabel: string): number {
  const time = timeLabel.split(' ').pop() ?? '00:00';
  return Number(time.slice(0, 2));
}

export function pickMiddayPoint(points: ForecastPoint[]): ForecastPoint | undefined {
  if (points.length === 0) {
    return undefined;
  }

  return points.reduce((closest, point) => {
    const pointDistance = Math.abs(hourFromTimeLabel(point.timeLabel) - 12);
    const closestDistance = Math.abs(hourFromTimeLabel(closest.timeLabel) - 12);
    return pointDistance < closestDistance ? point : closest;
  });
}

export function predictForDate(points: ForecastPoint[], date: string): DayPrediction {
  const dayPoints = points.filter((point) => point.date === date);
  const headline = pickMiddayPoint(dayPoints);
  const summary = dayPoints.length > 0 ? groupByDay(dayPoints)[0] : null;
  const rainChance =
    dayPoints.length === 0
      ? 0
      : roundToOne(Math.max(...dayPoints.map((point) => point.pop)) * 100);

  return {
    date,
    available: Boolean(headline && summary),
    summary,
    condition: headline?.description ?? '',
    icon: headline?.icon ?? '01d',
    iconUrl: iconUrl(headline?.icon ?? '01d'),
    rainChance,
    points: dayPoints,
  };
}
