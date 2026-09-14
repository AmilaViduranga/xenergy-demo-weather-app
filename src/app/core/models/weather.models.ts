export interface GeoLocation {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
  label: string;
}

export interface CurrentWeather {
  city: string;
  country: string;
  description: string;
  icon: string;
  iconUrl: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  visibilityKm: number;
  rainMm: number;
  clouds: number;
  sunrise: number;
  sunset: number;
  timestamp: number;
}

export interface ForecastPoint {
  timestamp: number;
  isoTime: string;
  date: string;
  timeLabel: string;
  temp: number;
  humidity: number;
  rainMm: number;
  windSpeed: number;
  pop: number;
  description: string;
  icon: string;
}

export interface DailySummary {
  date: string;
  avgTemp: number;
  minTemp: number;
  maxTemp: number;
  avgHumidity: number;
  totalRain: number;
  avgWind: number;
  samples: number;
}

export interface PeriodSummary {
  avgTemp: number;
  minTemp: number;
  maxTemp: number;
  avgHumidity: number;
  totalRain: number;
  avgWind: number;
  days: number;
  points: number;
}

export interface DayPrediction {
  date: string;
  available: boolean;
  summary: DailySummary | null;
  condition: string;
  icon: string;
  iconUrl: string;
  rainChance: number;
  points: ForecastPoint[];
}

export interface OpenWeatherGeoItem {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface OpenWeatherWeatherItem {
  description: string;
  icon: string;
  main: string;
}

export interface OpenWeatherCurrentResponse {
  name: string;
  dt: number;
  visibility: number;
  weather: OpenWeatherWeatherItem[];
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number;
  };
  clouds: {
    all: number;
  };
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
}

export interface OpenWeatherForecastItem {
  dt: number;
  dt_txt: string;
  pop?: number;
  main: {
    temp: number;
    humidity: number;
  };
  weather: OpenWeatherWeatherItem[];
  wind: {
    speed: number;
  };
  rain?: {
    '3h'?: number;
  };
  snow?: {
    '3h'?: number;
  };
}

export interface OpenWeatherForecastResponse {
  list: OpenWeatherForecastItem[];
  city: {
    name: string;
    country: string;
    timezone: number;
  };
}
