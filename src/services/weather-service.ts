import {
  RealtimeWeather,
  RealtimeWeatherRaw,
  Settlement,
  WeatherAPIResponse,
} from "@types";
import L from "leaflet";
import { MapFeature } from "src/wrappers";

export class WeatherService {
  // move to .env before git commit
  private readonly APIKEY: string = "161f5d1252354e828f7160158252208";
  private readonly API: string = "http://api.weatherapi.com/v1";

  private static instance: WeatherService;

  private constructor() {}

  public static getInstance() {
    if (!WeatherService.instance)
      WeatherService.instance = new WeatherService();
    return WeatherService.instance;
  }

  public async getRealtimeWeatherForSettlements(mapFeatures: MapFeature[]) {
    return Promise.all(
      mapFeatures.map((feature) =>
        weatherService.getRealtimeWeatherForSettlement(feature),
      ),
    );
  }

  public async getRealtimeWeatherForSettlement(mapFeature: MapFeature) {
    try {
      const settlement = mapFeature.getSettlement();
      const center = settlement.bounds.getCenter();
      const url =
        this.API +
        `/current.json?key=${this.APIKEY}&q=${center.lat},${center.lng}`;
      const response = await fetch(url);
      const result = await response.json();

      const weatherParsed = this.parseRealtimeWeatherRaw(result);
      mapFeature.setWeather(weatherParsed);

      return mapFeature;
    } catch (error) {
      console.error(
        `Failed to fetch weather information for feature: ${mapFeature}`,
        error,
      );
      throw error;
    }
  }

  private parseRealtimeWeatherRaw(
    raw: WeatherAPIResponse<RealtimeWeatherRaw>,
  ): RealtimeWeather {
    return {
      cloud: raw.current.cloud,
      conditionCode: raw.current.condition.code,
      tempC: raw.current.temp_c,
      tempF: raw.current.temp_f,
      feelsLikeC: raw.current.feelslike_c,
      feelsLikeF: raw.current.feelslike_f,
      heatIndexC: raw.current.heatindex_c,
      heatIndexF: raw.current.heatindex_f,
      windChillC: raw.current.windchill_c,
      windChillF: raw.current.windchill_f,
      windKPH: raw.current.wind_kph,
      windMPH: raw.current.wind_mph,
      humidity: raw.current.humidity,
      isDay: raw.current.is_day,
      lastUpdated: raw.current.last_updated,
      uv: raw.current.uv,
    };
  }
}

export const weatherService = WeatherService.getInstance();
