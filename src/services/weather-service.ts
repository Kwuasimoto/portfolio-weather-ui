import {
  RealtimeWeather,
  RealtimeWeatherRaw,
  WeatherAPIResponse,
} from "@types";
import { MapFeature } from "src/wrappers";

export class WeatherService {
  // move to .env before git commit
  private readonly APIKEY: string = import.meta.env.VITE_WEATHER_API || "";
  private readonly API: string = "http://api.weatherapi.com/v1";

  private static instance: WeatherService;

  private constructor() {
    if (this.APIKEY.length <= 0) {
      throw new Error("Weather API empty, couldn't find ENV variable");
    }
  }

  public static getInstance() {
    if (!WeatherService.instance)
      WeatherService.instance = new WeatherService();
    return WeatherService.instance;
  }

  public async getRealtimeWeatherForSettlements(mapFeatures: MapFeature[]) {
    return await Promise.all(
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
      condition: raw.current.condition.text,
      icon: raw.current.condition.icon,

      tempC: raw.current.temp_c,
      tempF: raw.current.temp_f,
      dewpointC: raw.current.dewpoint_c,
      dewpointF: raw.current.dewpoint_f,
      feelsLikeC: raw.current.feelslike_c,
      feelsLikeF: raw.current.feelslike_f,
      heatIndexC: raw.current.heatindex_c,
      heatIndexF: raw.current.heatindex_f,
      windChillC: raw.current.windchill_c,
      windChillF: raw.current.windchill_f,
      windKPH: raw.current.wind_kph,
      windMPH: raw.current.wind_mph,
      windDegree: raw.current.wind_degree,
      windDir: raw.current.wind_dir,
      humidity: raw.current.humidity,
      isDay: raw.current.is_day,
      lastUpdated: raw.current.last_updated,
      lastUpdatedEpoch: raw.current.last_updated_epoch,
      uv: raw.current.uv,
    };
  }
}

export const weatherService = WeatherService.getInstance();
